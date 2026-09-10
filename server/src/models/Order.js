import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
      name: { type: String, required: true }, price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 }, subtotal: { type: Number, required: true, min: 0 },
      category: { type: String }, brand: { type: String },
      status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
      stockRestored: { type: Boolean, default: false },
    }],
    shippingAddress: { fullName: { type: String }, phone: { type: String }, address: { type: String }, city: { type: String }, country: { type: String }, postalCode: { type: String } },
    subtotal: { type: Number, required: true, min: 0 }, discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    // Legacy compatibility; mirrors total for existing API consumers.
    totalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash_on_delivery", "card", "bank_transfer"], default: "cash_on_delivery" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    status: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
    stockRestored: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Matches the "my orders" query: find one user's orders and return newest first.
orderSchema.index({ user: 1, createdAt: -1 });
// A standalone status index is intentionally omitted: status has few values and is not currently filtered.
export default mongoose.model("Order", orderSchema);
