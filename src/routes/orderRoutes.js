import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { updateOrderStatus, getOrderDetails } from "../controllers/orderController.js";

const router = express.Router();

router.patch("/update-status", protect, updateOrderStatus);
router.get("/:orderId", protect, getOrderDetails);

export default router;
