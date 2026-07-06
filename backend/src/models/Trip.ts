import { Schema, model, Document, Types } from "mongoose";

export interface ITrip extends Document {
  _id: Types.ObjectId;
  title: string;
  destination: string;
  description?: string;
  coverImage?: string;
  startDate?: Date;
  endDate?: Date;
  budget: number;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  categories: { name: string; icon: string; color: string }[];
  createdAt: Date;
}

const DEFAULT_CATEGORIES = [
  { name: "Food", icon: "utensils", color: "#F59E0B" },
  { name: "Travel", icon: "plane", color: "#60A5FA" },
  { name: "Accommodation", icon: "bed", color: "#A78BFA" },
  { name: "Shopping", icon: "shopping-bag", color: "#F472B6" },
  { name: "Fuel", icon: "fuel", color: "#FB923C" },
  { name: "Activities", icon: "ticket", color: "#34D399" },
  { name: "Emergency", icon: "siren", color: "#F87171" },
  { name: "Entertainment", icon: "clapperboard", color: "#818CF8" },
  { name: "Miscellaneous", icon: "shapes", color: "#9CA3AF" },
];

const tripSchema = new Schema<ITrip>(
  {
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    budget: { type: Number, required: true, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    categories: {
      type: [{ name: String, icon: String, color: String }],
      default: DEFAULT_CATEGORIES,
    },
  },
  { timestamps: true }
);

export const Trip = model<ITrip>("Trip", tripSchema);
