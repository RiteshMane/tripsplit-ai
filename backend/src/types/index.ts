import { Request } from "express";
import { Types } from "mongoose";

export interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export type SplitMethod = "equal" | "percentage" | "custom" | "selected";

export interface ParticipantShare {
  user: Types.ObjectId | string;
  share: number;
}
