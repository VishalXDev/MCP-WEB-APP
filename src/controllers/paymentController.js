import PickupPartner from "../models/PickupPartner.js";
import { getSocketIO } from "../socket.js";

// 📌 Add Funds and Notify Partner
export const addFundsToWallet = async (req, res) => {
  try {
    const { partnerId, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const partner = await PickupPartner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Pickup Partner not found" });

    partner.walletBalance += amount;
    partner.transactions.push({ amount, type: "credit", description: "Funds added by MCP" });

    await partner.save();

    // 🔔 Emit real-time payment notification
    getSocketIO().to(partnerId).emit("walletUpdated", {
      message: `Your wallet has been credited with ₹${amount}`,
      balance: partner.walletBalance,
    });

    res.status(200).json({ message: "Funds added successfully!", walletBalance: partner.walletBalance });
  } catch (error) {
    res.status(500).json({ message: "Error adding funds", error: error.message });
  }
};
await logAction(req.user._id, "Payment Failed", { amount, reason: "Insufficient Balance" });
