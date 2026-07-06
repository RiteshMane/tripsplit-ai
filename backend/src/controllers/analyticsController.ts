import { Response } from "express";
import { Trip } from "../models/Trip";
import { Expense } from "../models/Expense";
import { Settlement } from "../models/Settlement";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { computeNetBalancesForTrip } from "../services/settlementService";

/** Aggregated dashboard data across all of the user's trips */
export const getDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trips = await Trip.find({ members: req.userId });
  const tripIds = trips.map((t) => t._id);

  const expenses = await Expense.find({ trip: { $in: tripIds } });
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const settlements = await Settlement.find({ trip: { $in: tripIds }, status: "pending" });
  const pendingIOwe = settlements
    .filter((s) => s.fromUser.toString() === req.userId)
    .reduce((sum, s) => sum + s.amount, 0);
  const pendingOwedToMe = settlements
    .filter((s) => s.toUser.toString() === req.userId)
    .reduce((sum, s) => sum + s.amount, 0);

  // Monthly spending trend (last 6 months)
  const monthly: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = new Date(e.date).toISOString().slice(0, 7); // YYYY-MM
    monthly[key] = Math.round(((monthly[key] || 0) + e.amount) * 100) / 100;
  });

  const recentActivity = await Expense.find({ trip: { $in: tripIds } })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate("paidBy", "name avatar")
    .populate("trip", "title");

  const budgetTotal = trips.reduce((sum, t) => sum + (t.budget || 0), 0);

  res.json({
    success: true,
    stats: {
      activeTrips: trips.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      pendingIOwe: Math.round(pendingIOwe * 100) / 100,
      pendingOwedToMe: Math.round(pendingOwedToMe * 100) / 100,
      budgetTotal,
      budgetUsedPct: budgetTotal > 0 ? Math.round((totalSpent / budgetTotal) * 1000) / 10 : 0,
    },
    monthlySpending: Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({ month, amount })),
    recentActivity,
  });
});

/** Deep analytics for a single trip */
export const getTripAnalytics = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;
  const trip = await Trip.findById(tripId).populate("members", "name email avatar");
  if (!trip) throw new ApiError(404, "Trip not found");

  const expenses = await Expense.find({ trip: tripId }).populate("paidBy", "name avatar");

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = Math.round(((categoryMap[e.category] || 0) + e.amount) * 100) / 100;
  });
  const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 1000) / 10 : 0,
  }));

  // Daily spending
  const dailyMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = new Date(e.date).toISOString().slice(0, 10);
    dailyMap[key] = Math.round(((dailyMap[key] || 0) + e.amount) * 100) / 100;
  });
  const dailySpending = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  // Top spenders leaderboard (by amount paid)
  const paidMap: Record<string, { name: string; avatar?: string; amount: number }> = {};
  expenses.forEach((e) => {
    const user: any = e.paidBy;
    const id = user._id?.toString() || user.toString();
    if (!paidMap[id]) paidMap[id] = { name: user.name || "Unknown", avatar: user.avatar, amount: 0 };
    paidMap[id].amount = Math.round((paidMap[id].amount + e.amount) * 100) / 100;
  });
  const topSpenders = Object.values(paidMap).sort((a, b) => b.amount - a.amount);

  const mostExpensiveDay = dailySpending.reduce(
    (max, d) => (d.amount > (max?.amount || 0) ? d : max),
    undefined as { date: string; amount: number } | undefined
  );

  const biggestExpense = expenses.reduce(
    (max, e) => (e.amount > (max?.amount || 0) ? { title: e.title, amount: e.amount } : max),
    undefined as { title: string; amount: number } | undefined
  );

  const balances = await computeNetBalancesForTrip(req.params.tripId);

  res.json({
    success: true,
    totalSpent: Math.round(totalSpent * 100) / 100,
    budget: trip.budget,
    budgetUsedPct: trip.budget > 0 ? Math.round((totalSpent / trip.budget) * 1000) / 10 : 0,
    categoryBreakdown,
    dailySpending,
    topSpenders,
    mostExpensiveDay,
    biggestExpense,
    balances,
  });
});
