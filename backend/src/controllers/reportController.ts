import { Response } from "express";
import PDFDocument from "pdfkit";
import { Trip } from "../models/Trip";
import { Expense } from "../models/Expense";
import { Settlement } from "../models/Settlement";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/**
 * Generates a PDF trip report: summary, expenses, category breakdown, settlements.
 * This is a straightforward pdfkit implementation. For richer charts, render
 * them client-side to an image/canvas and embed via doc.image().
 */
export const exportTripReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findById(req.params.tripId).populate("members", "name email");
  if (!trip) throw new ApiError(404, "Trip not found");

  const expenses = await Expense.find({ trip: trip._id }).populate("paidBy", "name");
  const settlements = await Settlement.find({ trip: trip._id })
    .populate("fromUser", "name")
    .populate("toUser", "name");

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => (categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount));

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${trip.title.replace(/\s+/g, "_")}_report.pdf"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(22).text("TripSplit AI — Trip Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(16).text(trip.title);
  doc.fontSize(10).fillColor("gray").text(trip.destination);
  doc.moveDown();

  doc.fillColor("black").fontSize(12).text(`Budget: Rs. ${trip.budget}`);
  doc.text(`Total Spent: Rs. ${totalSpent.toFixed(2)}`);
  doc.text(`Members: ${(trip.members as any[]).map((m) => m.name).join(", ")}`);
  doc.moveDown();

  doc.fontSize(14).text("Category Breakdown", { underline: true });
  Object.entries(categoryMap).forEach(([cat, amt]) => {
    doc.fontSize(11).text(`${cat}: Rs. ${amt.toFixed(2)}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("Expenses", { underline: true });
  expenses.forEach((e) => {
    doc
      .fontSize(10)
      .text(`${new Date(e.date).toLocaleDateString()} — ${e.title} (${e.category}) — Rs. ${e.amount.toFixed(2)} — paid by ${(e.paidBy as any).name}`);
  });
  doc.moveDown();

  doc.fontSize(14).text("Settlements", { underline: true });
  settlements.forEach((s) => {
    doc
      .fontSize(10)
      .text(
        `${(s.fromUser as any).name} -> ${(s.toUser as any).name}: Rs. ${s.amount.toFixed(2)} [${s.status.toUpperCase()}]`
      );
  });

  doc.end();
});
