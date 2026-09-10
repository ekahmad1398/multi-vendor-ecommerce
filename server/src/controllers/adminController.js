import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) {
    if (!["user", "seller", "admin"].includes(req.query.role)) throw new AppError("Invalid role filter", 400);
    filter.role = req.query.role;
  }
  const users = await User.find(filter).select("name email role sellerStatus isEmailVerified createdAt").sort("-createdAt");
  res.json({ users });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const changes = {};
  if (req.body.role !== undefined) {
    if (!["user", "seller", "admin"].includes(req.body.role)) throw new AppError("Invalid role", 400);
    changes.role = req.body.role;
  }
  if (req.body.sellerStatus !== undefined) {
    if (!["active", "suspended"].includes(req.body.sellerStatus)) throw new AppError("Invalid seller status", 400);
    changes.sellerStatus = req.body.sellerStatus;
  }
  if (!Object.keys(changes).length) throw new AppError("No valid user changes provided", 400);
  const user = await User.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true }).select("name email role sellerStatus isEmailVerified createdAt");
  if (!user) throw new AppError("User not found", 404);
  res.json({ user });
});
