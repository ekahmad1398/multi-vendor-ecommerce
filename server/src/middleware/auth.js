import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  // Cookies travel automatically with browser requests. httpOnly means browser JavaScript cannot read them,
  // unlike a token in localStorage, which reduces exposure if a page has an XSS bug.
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : req.cookies?.token;
  if (!token) throw new AppError("Authentication token is required", 401);
  if (!process.env.JWT_SECRET) throw new AppError("JWT_SECRET is missing from the environment variables", 500);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("+tokenVersion");
    if (req.user && decoded.tokenVersion !== req.user.tokenVersion) throw new Error("Token has been revoked");
  } catch {
    throw new AppError("Invalid or expired authentication token", 401);
  }
  if (!req.user) throw new AppError("User no longer exists", 401);
  next();
});

export const adminOnly = (req, res, next) => {
  // Role checks happen after JWT authentication, so clients cannot claim to be admins.
  if (req.user.role !== "admin") return next(new AppError("Admin access is required", 403));
  next();
};

export const sellerOnly = (req, res, next) => {
  if (req.user.role !== "seller" || req.user.sellerStatus === "suspended") return next(new AppError("Active seller access is required", 403));
  next();
};
