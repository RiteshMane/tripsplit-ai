import { Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as jwt.SignOptions);

const sanitize = (user: any) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  darkMode: user.darkMode,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString());

  res.status(201).json({ success: true, token, user: sanitize(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = signToken(user._id.toString());
  res.json({ success: true, token, user: sanitize(user) });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user: sanitize(user) });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, avatar, darkMode } = req.body;
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");

  if (name !== undefined) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (darkMode !== undefined) user.darkMode = darkMode;
  await user.save();

  res.json({ success: true, user: sanitize(user) });
});
