import { Schema, model, Document, Types } from "mongoose";
import { SplitMethod } from "../types";

export interface IExpenseParticipant {
  user: Types.ObjectId;
  share: number;
}

export interface IExpense extends Document {
  _id: Types.ObjectId;
  trip: Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  category: string;
  paidBy: Types.ObjectId;
  splitMethod: SplitMethod;
  participants: IExpenseParticipant[];
  receiptImage?: string;
  date: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    splitMethod: { type: String, enum: ["equal", "percentage", "custom", "selected"], default: "equal" },
    participants: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        share: { type: Number, required: true },
      },
    ],
    receiptImage: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Expense = model<IExpense>("Expense", expenseSchema);
