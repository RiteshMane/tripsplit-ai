import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "express-async-errors";

import authRoutes from "./routes/authRoutes";
import tripRoutes from "./routes/tripRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import settlementRoutes from "./routes/settlementRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import aiRoutes from "./routes/aiRoutes";
import reportRoutes from "./routes/reportRoutes";
import { notFound, errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ success: true, status: "ok", service: "tripsplit-ai-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
// Expenses & settlements are nested under a trip
app.use("/api/trips/:tripId/expenses", expenseRoutes);
app.use("/api/trips/:tripId/settlements", settlementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
