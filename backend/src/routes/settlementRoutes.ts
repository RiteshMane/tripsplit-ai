import { Router } from "express";
import { generateSettlements, getSettlements, markSettlementPaid, clearSettlementHistory } from "../controllers/settlementController";
import { protect } from "../middleware/auth";

const router = Router({ mergeParams: true });
router.use(protect);

router.post("/generate", generateSettlements);
router.get("/", getSettlements);
router.patch("/:id/pay", markSettlementPaid);
router.delete("/history", clearSettlementHistory);

export default router;
