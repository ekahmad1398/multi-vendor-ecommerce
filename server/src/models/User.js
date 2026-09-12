import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    // `unique` creates an index: MongoDB can find emails quickly and prevents duplicates.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional link for accounts authenticated through Clerk. Sparse keeps existing local accounts valid.
    clerkId: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, select: false },
    // Legacy values remain readable until `npm run migrate:roles` has been run.
    role: { type: String, enum: ["customer", "vendor", "admin", "user", "seller"], default: "customer" },
    sellerStatus: { type: String, enum: ["active", "suspended"], default: "active" },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    resetOtp: { type: String, select: false },
    resetOtpExpiresAt: { type: Date, select: false },
    tokenVersion: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
