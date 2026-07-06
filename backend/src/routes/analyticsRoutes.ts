import { Router } from "express";
import { getDashboard, getTripAnalytics } from "../controllers/analyticsController";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);

router.get("/dashboard", getDashboard);
router.get("/trips/:tripId", getTripAnalytics);

export default router;
