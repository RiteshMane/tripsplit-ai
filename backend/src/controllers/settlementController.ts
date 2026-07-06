import { Response } from "express";
import { Settlement } from "../models/Settlement";
import { Trip } from "../models/Trip";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { computeNetBalancesForTrip, computeOptimalSettlements } from "../services/settlementService";
import { emitToTrip } from "../sockets";

/**
 * Recomputes optimal settlements for a trip from scratch based on current
 * expenses NETTED against settlements already marked paid, replacing any
 * existing *pending* settlements. Paid settlements are preserved as history
 * and are never re-suggested once netted out.
 */
export const generateSettlements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;
  const trip = await Trip.findById(tripId);
  if (!trip) throw new ApiError(404, "Trip not found");

  const balances = await computeNetBalancesForTrip(tripId);
  const transactions = computeOptimalSettlements(balances);

  await Settlement.deleteMany({ trip: tripId, status: "pending" });
  const created = await Settlement.insertMany(
    transactions.map((t) => ({ trip: tripId, fromUser: t.fromUser, toUser: t.toUser, amount: t.amount, status: "pending" }))
  );

  const populated = await Settlement.find({ _id: { $in: created.map((c) => c._id) } })
    .populate("fromUser", "name email avatar")
    .populate("toUser", "name email avatar");

  emitToTrip(tripId, "settlements:updated", populated);

  res.json({ success: true, settlements: populated, balances });
});

export const getSettlements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;
  const settlements = await Settlement.find({ trip: tripId })
    .sort({ createdAt: -1 })
    .populate("fromUser", "name email avatar")
    .populate("toUser", "name email avatar");
  res.json({ success: true, settlements });
});

export const markSettlementPaid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const settlement = await Settlement.findById(req.params.id);
  if (!settlement) throw new ApiError(404, "Settlement not found");

  settlement.status = "paid";
  settlement.paidAt = new Date();
  await settlement.save();

  const populated = await settlement.populate([
    { path: "fromUser", select: "name email avatar" },
    { path: "toUser", select: "name email avatar" },
  ]);

  emitToTrip(settlement.trip.toString(), "settlement:paid", populated);
  res.json({ success: true, settlement: populated });
});

/**
 * Clears paid settlement history for a trip. Useful as a one-time cleanup
 * for duplicate "paid" records created by earlier versions of the app that
 * didn't net out already-settled balances before recalculating (see
 * computeNetBalancesForTrip). Does not touch pending settlements or expenses.
 */
export const clearSettlementHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;
  await Settlement.deleteMany({ trip: tripId, status: "paid" });
  emitToTrip(tripId, "settlements:updated", []);
  res.json({ success: true, message: "Settlement history cleared" });
});
