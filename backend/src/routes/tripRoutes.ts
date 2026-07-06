import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addMember,
  removeMember,
} from "../controllers/tripController";
import { protect } from "../middleware/auth";

const router = Router();
router.use(protect);

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.post("/:id/members", addMember);
router.delete("/:id/members/:memberId", removeMember);

export default router;
