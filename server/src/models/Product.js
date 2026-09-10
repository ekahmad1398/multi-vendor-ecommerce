import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    // Optional for legacy admin-created products; seller-created products always have an owner.
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    brand: { type: String, trim: true, maxlength: 80, index: true },
    sku: { type: String, trim: true, uppercase: true, sparse: true, unique: true, maxlength: 80 },
    images: [{ url: { type: String, required: true }, publicId: { type: String, required: true } }],
    // Retained for older clients/products; new uploads use images.
    image: { type: String, trim: true },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// An index is a small lookup structure that avoids scanning every product for these common queries.
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 }); // Used by GET /api/products?category=...
productSchema.index({ price: 1, isActive: 1 });
// Indexes speed up reads, but each extra index uses disk/RAM and makes writes slower, so keep them focused.
export default mongoose.model("Product", productSchema);
