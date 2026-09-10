import AppError from "../utils/AppError.js";

export const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((field) => req.body[field] === undefined || req.body[field] === "");
  if (missing.length) return next(new AppError(`Missing required field(s): ${missing.join(", ")}`));
  next();
};

export const validateEmail = (req, res, next) => {
  if (req.body.email && (typeof req.body.email !== "string" || !/^\S+@\S+\.\S+$/.test(req.body.email))) return next(new AppError("Please provide a valid email"));
  next();
};

export const validatePassword = (req, res, next) => {
  if (req.body.password && (typeof req.body.password !== "string" || req.body.password.length < 6)) return next(new AppError("Password must be at least 6 characters"));
  next();
};
