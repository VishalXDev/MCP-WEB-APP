import mongoose from "mongoose";

const pickupPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    walletBalance: { type: Number, default: 0 }, // Wallet balance in INR
    role: { type: String, default: "PickupPartner" }, // Fixed role
    transactions: [
      {
        amount: Number,
        type: { type: String, enum: ["credit", "debit"] },
        description: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const PickupPartner = mongoose.model("PickupPartner", pickupPartnerSchema);
export default PickupPartner;
