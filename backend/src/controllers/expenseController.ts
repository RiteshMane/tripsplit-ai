import { Response } from "express";
import { Expense } from "../models/Expense";
import { Trip } from "../models/Trip";
import { AuthRequest, SplitMethod } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { emitToTrip } from "../sockets";
import { categorizeExpense } from "../services/geminiService";

/**
 * Given the total amount, split method, and raw split input, compute the
 * per-participant share. This is the core "who owes what" logic.
 */
function computeShares(
  amount: number,
  splitMethod: SplitMethod,
  participantIds: string[],
  splitInput?: { userId: string; value: number }[]
): { user: string; share: number }[] {
  if (participantIds.length === 0) throw new ApiError(400, "At least one participant is required");

  switch (splitMethod) {
    case "equal": {
      const share = Math.round((amount / participantIds.length) * 100) / 100;
      const shares = participantIds.map((user) => ({ user, share }));
      // Fix rounding drift by adjusting the last participant
      const total = shares.reduce((s, x) => s + x.share, 0);
      const drift = Math.round((amount - total) * 100) / 100;
      if (shares.length > 0) shares[shares.length - 1].share = Math.round((shares[shares.length - 1].share + drift) * 100) / 100;
      return shares;
    }
    case "selected": {
      // Same as equal, but only among the selected participants (participantIds already filtered)
      const share = Math.round((amount / participantIds.length) * 100) / 100;
      const shares = participantIds.map((user) => ({ user, share }));
      const total = shares.reduce((s, x) => s + x.share, 0);
      const drift = Math.round((amount - total) * 100) / 100;
      if (shares.length > 0) shares[shares.length - 1].share = Math.round((shares[shares.length - 1].share + drift) * 100) / 100;
      return shares;
    }
    case "percentage": {
      if (!splitInput || splitInput.length === 0) throw new ApiError(400, "Percentage split requires splitInput");
      const totalPct = splitInput.reduce((s, x) => s + x.value, 0);
      if (Math.abs(totalPct - 100) > 0.5) throw new ApiError(400, "Percentages must add up to 100");
      return splitInput.map((x) => ({ user: x.userId, share: Math.round(((x.value / 100) * amount) * 100) / 100 }));
    }
    case "custom": {
      if (!splitInput || splitInput.length === 0) throw new ApiError(400, "Custom split requires splitInput");
      const totalCustom = splitInput.reduce((s, x) => s + x.value, 0);
      if (Math.abs(totalCustom - amount) > 0.5) {
        throw new ApiError(400, `Custom split amounts (₹${totalCustom}) must add up to the total (₹${amount})`);
      }
      return splitInput.map((x) => ({ user: x.userId, share: x.value }));
    }
    default:
      throw new ApiError(400, "Invalid split method");
  }
}

export const createExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;
  const trip = await Trip.findById(tripId);
  if (!trip) throw new ApiError(404, "Trip not found");
  if (!trip.members.some((m) => m.toString() === req.userId)) {
    throw new ApiError(403, "You are not a member of this trip");
  }

  let { title, description, amount, category, paidBy, splitMethod, participantIds, splitInput, receiptImage, date } =
    req.body;

  if (!title || !amount || !paidBy) throw new ApiError(400, "Title, amount and paidBy are required");

  if (!category) {
    category = await categorizeExpense(title, description || "");
  }

  const finalParticipantIds: string[] =
    splitMethod === "percentage" || splitMethod === "custom"
      ? (splitInput || []).map((s: any) => s.userId)
      : participantIds && participantIds.length > 0
      ? participantIds
      : trip.members.map((m) => m.toString());

  const participants = computeShares(Number(amount), splitMethod || "equal", finalParticipantIds, splitInput);

  const expense = await Expense.create({
    trip: tripId,
    title,
    description,
    amount,
    category,
    paidBy,
    splitMethod: splitMethod || "equal",
    participants,
    receiptImage,
    date: date || new Date(),
    createdBy: req.userId,
  });

  const populated = await expense.populate([
    { path: "paidBy", select: "name email avatar" },
    { path: "participants.user", select: "name email avatar" },
  ]);

  emitToTrip(tripId, "expense:created", populated);

  res.status(201).json({ success: true, expense: populated });
});

export const getExpenses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const tripId = req.params.tripId;
  const { category, search } = req.query;

  const filter: Record<string, unknown> = { trip: tripId };
  if (category) filter.category = category;
  if (search) filter.title = { $regex: search as string, $options: "i" };

  const expenses = await Expense.find(filter)
    .sort({ date: -1 })
    .populate("paidBy", "name email avatar")
    .populate("participants.user", "name email avatar");

  res.json({ success: true, expenses });
});

export const getExpenseById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await Expense.findById(req.params.id)
    .populate("paidBy", "name email avatar")
    .populate("participants.user", "name email avatar");
  if (!expense) throw new ApiError(404, "Expense not found");
  res.json({ success: true, expense });
});

export const updateExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");

  const fields = ["title", "description", "amount", "category", "paidBy", "receiptImage", "date"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) (expense as any)[f] = req.body[f];
  });

  if (req.body.splitMethod && req.body.participantIds) {
    expense.participants = computeShares(
      expense.amount,
      req.body.splitMethod,
      req.body.participantIds,
      req.body.splitInput
    ) as any;
    expense.splitMethod = req.body.splitMethod;
  }

  await expense.save();
  const populated = await expense.populate([
    { path: "paidBy", select: "name email avatar" },
    { path: "participants.user", select: "name email avatar" },
  ]);

  emitToTrip(expense.trip.toString(), "expense:updated", populated);
  res.json({ success: true, expense: populated });
});

export const deleteExpense = asyncHandler(async (req: AuthRequest, res: Response) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");

  const tripId = expense.trip.toString();
  await expense.deleteOne();

  emitToTrip(tripId, "expense:deleted", { id: req.params.id });
  res.json({ success: true, message: "Expense deleted" });
});
