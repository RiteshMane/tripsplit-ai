import { Response } from "express";
import { Trip } from "../models/Trip";
import { Expense } from "../models/Expense";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import {
  categorizeExpense,
  generateTripSummary,
  generateBudgetPlan,
  generateCostOptimizationTips,
  answerTravelAssistantQuestion,
  parseVoiceExpense,
  generateTripPlan,
} from "../services/geminiService";
import { computeNetBalancesForTrip } from "../services/settlementService";

export const aiCategorize = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description } = req.body;
  if (!title) throw new ApiError(400, "Title is required");
  const category = await categorizeExpense(title, description || "");
  res.json({ success: true, category });
});

async function buildTripContext(tripId: string) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new ApiError(404, "Trip not found");
  const expenses = await Expense.find({ trip: tripId }).populate("paidBy", "name");

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const dailyMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = new Date(e.date).toISOString().slice(0, 10);
    dailyMap[key] = (dailyMap[key] || 0) + e.amount;
  });
  const mostExpensiveDay = Object.entries(dailyMap).sort((a, b) => b[1] - a[1])[0];

  const biggestExpense = expenses.reduce(
    (max, e) => (e.amount > (max?.amount || 0) ? { title: e.title, amount: e.amount } : max),
    undefined as { title: string; amount: number } | undefined
  );

  const paidTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    const name = (e.paidBy as any).name;
    paidTotals[name] = (paidTotals[name] || 0) + e.amount;
  });
  const topSpender = Object.entries(paidTotals).sort((a, b) => b[1] - a[1])[0]?.[0];

  return { trip, expenses, totalSpent, categoryMap, mostExpensiveDay, biggestExpense, topSpender };
}

export const aiTripSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { trip, totalSpent, categoryMap, mostExpensiveDay, biggestExpense, topSpender } = await buildTripContext(
    req.params.tripId
  );

  const summary = await generateTripSummary({
    tripTitle: trip.title,
    totalSpent,
    budget: trip.budget,
    categoryBreakdown: categoryMap,
    topSpender,
    mostExpensiveDay: mostExpensiveDay ? { date: mostExpensiveDay[0], amount: mostExpensiveDay[1] } : undefined,
    biggestExpense,
  });

  res.json({ success: true, summary });
});

export const aiBudgetPlanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { destination, people, days, totalBudget } = req.body;
  if (!destination || !people || !days || !totalBudget) {
    throw new ApiError(400, "destination, people, days and totalBudget are required");
  }
  const plan = await generateBudgetPlan({ destination, people: Number(people), days: Number(days), totalBudget: Number(totalBudget) });
  res.json({ success: true, plan });
});

export const aiCostOptimization = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { trip, totalSpent, categoryMap } = await buildTripContext(req.params.tripId);
  const tips = await generateCostOptimizationTips({
    tripTitle: trip.title,
    categoryBreakdown: categoryMap,
    budget: trip.budget,
    totalSpent,
  });
  res.json({ success: true, tips });
});

export const aiTravelAssistant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { question } = req.body;
  if (!question) throw new ApiError(400, "question is required");

  const { trip, totalSpent, categoryMap, topSpender } = await buildTripContext(req.params.tripId);
  const balances = await computeNetBalancesForTrip(req.params.tripId);

  const context = `Trip: ${trip.title} | Budget: ₹${trip.budget} | Total spent: ₹${totalSpent}
Category breakdown: ${JSON.stringify(categoryMap)}
Top spender: ${topSpender}
Net balances (userId -> amount, positive = owed money): ${JSON.stringify(balances)}
Requesting user id: ${req.userId}`;

  const answer = await answerTravelAssistantQuestion(question, context);
  res.json({ success: true, answer });
});

export const aiVoiceExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { transcript } = req.body;
  if (!transcript) throw new ApiError(400, "transcript is required");
  const parsed = await parseVoiceExpense(transcript);
  res.json({ success: true, parsed });
});

export const aiTripPlanner = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { destination, people, days, motive, budget, departureFrom, transportMode } = req.body;
  if (!people || !days || !motive) {
    throw new ApiError(400, "people, days and motive are required");
  }
  const plan = await generateTripPlan({
    destination: destination || undefined,
    people: Number(people),
    days: Number(days),
    motive,
    budget: budget ? Number(budget) : undefined,
    departureFrom: departureFrom || undefined,
    transportMode: transportMode || undefined,
  });
  res.json({ success: true, plan });
});

/**
 * Receipt scanning extension point.
 * A full implementation would send the uploaded image to Gemini's vision
 * endpoint (inlineData with base64 image bytes) and parse the JSON result.
 * Wired here so the route/contract exists; plug in a real image once you
 * have a GEMINI_API_KEY and want to test end-to-end.
 */
export const aiScanReceipt = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new ApiError(400, "No receipt image uploaded");
  res.json({
    success: true,
    message: "Receipt uploaded. Wire this endpoint to Gemini Vision (see geminiService.ts) to extract fields.",
    extracted: { shopName: null, amount: null, category: null, date: null },
  });
});
