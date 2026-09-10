import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createClerkClient, verifyToken } from "@clerk/backend";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createToken } from "../utils/jwt.js";
import { cookieOptions } from "./authController.js";

const clerk = () => {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new AppError("Clerk bridge is not configured", 503);
  }
  return createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
};

const bearerToken = (req) => {
  const value = req.get("authorization");
  if (!value?.startsWith("Bearer ")) throw new AppError("A Clerk session token is required", 401);
  return value.slice(7);
};

const clerkEmail = (user) => {
  const email = user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId);
  if (!email || email.verification?.status !== "verified") throw new AppError("A verified Clerk email address is required", 403);
  return email.emailAddress.toLowerCase();
};

export const bridgeClerkSession = asyncHandler(async (req, res) => {
  const authorizedParties = (process.env.CLIENT_URL || "http://localhost:3000").split(",").map((value) => value.trim());
  let claims;
  try {
    claims = await verifyToken(bearerToken(req), { secretKey: process.env.CLERK_SECRET_KEY, authorizedParties });
  } catch {
    throw new AppError("Invalid or expired Clerk session", 401);
  }
  // A standard Clerk browser session JWT has both a subject and session id.
  if (!claims?.sub || !claims.sid) throw new AppError("A Clerk session token is required", 401);

  // Fetch identity from Clerk's Backend API rather than accepting browser-supplied identity fields.
  const clerkUser = await clerk().users.getUser(claims.sub);
  const email = clerkEmail(clerkUser);
  let user = await User.findOne({ clerkId: clerkUser.id }).select("+tokenVersion");

  if (!user) {
    const emailUser = await User.findOne({ email }).select("+tokenVersion");
    if (emailUser) {
      if (emailUser.clerkId && emailUser.clerkId !== clerkUser.id) throw new AppError("This email is already linked to another Clerk account", 409);
      emailUser.clerkId = clerkUser.id;
      await emailUser.save(); // Intentionally never changes role, password, or local verification state.
      user = emailUser;
    }
  }

  if (!user) {
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || email.split("@")[0];
    try {
      user = await User.create({
        clerkId: clerkUser.id,
        name: name.slice(0, 60),
        email,
        // A Clerk-only account cannot use the local password login until it explicitly resets a password.
        password: await bcrypt.hash(randomUUID(), 12),
        isEmailVerified: true,
        role: "user",
      });
    } catch (error) {
      // Unique indexes close the race between two first bridge requests for the same account.
      if (error?.code !== 11000) throw error;
      user = await User.findOne({ $or: [{ clerkId: clerkUser.id }, { email }] }).select("+tokenVersion");
      if (!user || (user.clerkId && user.clerkId !== clerkUser.id)) throw new AppError("Unable to safely link Clerk account", 409);
      if (!user.clerkId) { user.clerkId = clerkUser.id; await user.save(); }
    }
  }

  const token = createToken(user._id, user.tokenVersion);
  res.cookie("token", token, cookieOptions);
  res.json({ message: "Clerk session linked", user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } });
});
