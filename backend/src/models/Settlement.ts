import { Schema, model, Document, Types } from "mongoose";

export interface ISettlement extends Document {
  _id: Types.ObjectId;
  trip: Types.ObjectId;
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amount: number;
  status: "pending" | "paid";
  paidAt?: Date;
  createdAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Settlement = model<ISettlement>("Settlement", settlementSchema);
