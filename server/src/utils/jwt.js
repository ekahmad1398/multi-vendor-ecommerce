import jwt from "jsonwebtoken";

export const createToken = (userId, tokenVersion = 0) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing from the environment variables");
  // JWT carries only the user id; the database remains the source of truth for role changes.
  return jwt.sign({ userId, tokenVersion }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};
