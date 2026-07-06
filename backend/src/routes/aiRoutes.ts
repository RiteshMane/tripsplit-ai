import { Router } from "express";
import multer from "multer";
import {
  aiCategorize,
  aiTripSummary,
  aiBudgetPlanner,
  aiCostOptimization,
  aiTravelAssistant,
  aiVoiceExpense,
  aiScanReceipt,
  aiTripPlanner,
} from "../controllers/aiController";
import { protect } from "../middleware/auth";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.use(protect);

router.post("/categorize", aiCategorize);
router.get("/trips/:tripId/summary", aiTripSummary);
router.get("/trips/:tripId/cost-optimization", aiCostOptimization);
router.post("/trips/:tripId/ask", aiTravelAssistant);
router.post("/budget-planner", aiBudgetPlanner);
router.post("/trip-planner", aiTripPlanner);
router.post("/voice-expense", aiVoiceExpense);
router.post("/scan-receipt", upload.single("receipt"), aiScanReceipt);

export default router;
