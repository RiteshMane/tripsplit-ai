import { Router } from "express";
import { exportTripReport } from "../controllers/reportController";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);

router.get("/trips/:tripId/export", exportTripReport);

export default router;
