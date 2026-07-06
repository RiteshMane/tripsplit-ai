import { Response } from "express";
import { Trip } from "../models/Trip";
import { Expense } from "../models/Expense";
import { Settlement } from "../models/Settlement";
import { User } from "../models/User";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { computeNetBalancesForTrip } from "../services/settlementService";

export const createTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, destination, description, coverImage, startDate, endDate, budget, memberEmails } = req.body;
  if (!title || !destination) throw new ApiError(400, "Title and destination are required");

  const memberIds: string[] = [req.userId!];
  if (Array.isArray(memberEmails)) {
    const users = await User.find({ email: { $in: memberEmails.map((e: string) => e.toLowerCase()) } });
    users.forEach((u) => memberIds.push(u._id.toString()));
  }

  const trip = await Trip.create({
    title,
    destination,
    description,
    coverImage,
    startDate,
    endDate,
    budget: budget || 0,
    owner: req.userId,
    members: [...new Set(memberIds)],
  });

  res.status(201).json({ success: true, trip });
});

export const getTrips = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trips = await Trip.find({ members: req.userId }).sort({ createdAt: -1 }).populate("members", "name email avatar");

  const tripsWithStats = await Promise.all(
    trips.map(async (trip) => {
      const expenses = await Expense.find({ trip: trip._id });
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      const balances = await computeNetBalancesForTrip(trip._id.toString());
      const myBalance = balances[req.userId!] || 0;
      return { ...trip.toObject(), totalSpent, myBalance };
    })
  );

  res.json({ success: true, trips: tripsWithStats });
});

export const getTripById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findById(req.params.id).populate("members", "name email avatar");
  if (!trip) throw new ApiError(404, "Trip not found");
  if (!trip.members.some((m: any) => m._id.toString() === req.userId)) {
    throw new ApiError(403, "You are not a member of this trip");
  }
  res.json({ success: true, trip });
});

export const updateTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, "Trip not found");
  if (trip.owner.toString() !== req.userId) throw new ApiError(403, "Only the trip owner can edit this trip");

  const fields = ["title", "destination", "description", "coverImage", "startDate", "endDate", "budget"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) (trip as any)[f] = req.body[f];
  });
  await trip.save();

  res.json({ success: true, trip });
});

export const deleteTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, "Trip not found");
  if (trip.owner.toString() !== req.userId) throw new ApiError(403, "Only the trip owner can delete this trip");

  await Expense.deleteMany({ trip: trip._id });
  await Settlement.deleteMany({ trip: trip._id });
  await trip.deleteOne();

  res.json({ success: true, message: "Trip deleted" });
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, "Trip not found");

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(404, "No user found with that email");
  if (trip.members.some((m) => m.toString() === user._id.toString())) {
    throw new ApiError(409, "User is already a member of this trip");
  }

  trip.members.push(user._id);
  await trip.save();

  res.json({ success: true, trip });
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, "Trip not found");
  if (trip.owner.toString() !== req.userId) throw new ApiError(403, "Only the trip owner can remove members");

  trip.members = trip.members.filter((m) => m.toString() !== req.params.memberId);
  await trip.save();

  res.json({ success: true, trip });
});
