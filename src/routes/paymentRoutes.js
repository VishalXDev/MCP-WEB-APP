import express from "express";
import {
  createOrder,
  verifyPayment,
  razorpayWebhookHandler,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/charge", async (req, res) => {
  const { amount, paymentMethod } = req.body;

  try {
    const paymentResult = await processPayment(amount, paymentMethod);
    res.json({
      success: true,
      message: "Payment successful",
      data: paymentResult,
    });
  } catch (error) {
    res.status(500).json({ error: "Payment failed", details: error.message });
  }
});
// Create Razorpay order
router.post("/create-order", protect, createOrder);

// Verify payment and update wallet
router.post("/verify-payment", protect, verifyPayment);

// Razorpay webhook (ensure webhook secret verification inside controller)
router.post("/razorpay-webhook", razorpayWebhookHandler);

export default router;
