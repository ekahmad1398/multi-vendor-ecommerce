import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getSellerProfile = asyncHandler(async (req, res) => res.json({ seller: req.user }));
export const updateSellerProfile = asyncHandler(async (req, res) => {
  const allowed = ["name"];
  const changes = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => allowed.includes(key) && typeof value === "string" && value.trim()));
  if (!Object.keys(changes).length) throw new AppError("No valid seller profile changes provided");
  const seller = await User.findByIdAndUpdate(req.user._id, changes, { new: true, runValidators: true });
  res.json({ seller });
});
