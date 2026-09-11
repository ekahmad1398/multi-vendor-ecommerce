import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createToken } from "../utils/jwt.js";
import { createOtp, getOtpExpiry, hashOtp } from "../utils/otp.js";
import { sendEmail } from "../utils/sendEmail.js";
import { otpEmail } from "../utils/emailTemplates.js";

export const cookieOptions = {
  httpOnly: true, // Prevents JavaScript in the browser from reading the JWT cookie.
  secure: process.env.NODE_ENV === "production", // HTTPS only in production; localhost HTTP still works in development.
  // HTTPS deployments use cross-site requests (Vercel -> Render), which require SameSite=None.
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const sendVerificationOtp = async (user) => {
  const otp = createOtp();
  user.emailOtp = hashOtp(otp);
  user.otpExpiresAt = getOtpExpiry();
  await user.save();
  await sendEmail({ to: user.email, subject: "Verify your E-Commerce email", ...otpEmail({ name: user.name, otp, purpose: "verify", expiresInMinutes: process.env.OTP_EXPIRES_IN_MINUTES }) });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email: email.toLowerCase() })) throw new AppError("Email is already registered", 409);
  // Hash before storage so a database leak never exposes the original password.
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
  try {
    await sendVerificationOtp(user);
  } catch (error) {
    // A failed mail provider must not leave an unreachable, unverified account
    // behind; otherwise every retry would incorrectly report a duplicate email.
    await user.deleteOne();
    throw error;
  }
  res.status(201).json({ message: "Registration successful. Check Mailtrap for your verification code, then log in.", user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) throw new AppError("Invalid email or password", 401);
  if (!user.isEmailVerified) throw new AppError("Please verify your email before logging in", 403);
  const token = createToken(user._id, user.tokenVersion);
  // We return the token for Bearer-token learning, and also set an httpOnly cookie for browser sessions.
  res.cookie("token", token, cookieOptions);
  res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified } });
});

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logout successful" });
};

export const profile = asyncHandler(async (req, res) => res.json({ user: req.user }));

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+emailOtp +otpExpiresAt");
  if (!user) throw new AppError("Invalid or expired OTP", 400);
  if (user.isEmailVerified) throw new AppError("Email is already verified", 400);
  // The date check is the actual enforcement: old codes cannot be used after expiry.
  if (!user.emailOtp || !user.otpExpiresAt || user.otpExpiresAt <= new Date()) throw new AppError("OTP has expired. Request a new one.", 400);
  if (user.emailOtp !== hashOtp(req.body.otp)) throw new AppError("Invalid OTP", 400);
  user.isEmailVerified = true;
  user.emailOtp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  res.json({ message: "Email verified successfully" });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  if (!user) return res.json({ message: "If that email is registered, a new verification OTP has been sent" });
  if (user.isEmailVerified) throw new AppError("Email is already verified", 400);
  await sendVerificationOtp(user);
  res.json({ message: "A new verification OTP was sent" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+resetOtp +resetOtpExpiresAt");
  // Same response prevents outsiders from discovering which emails have accounts.
  if (!user) return res.json({ message: "If that email exists, a reset OTP has been sent" });
  const otp = createOtp();
  user.resetOtp = hashOtp(otp);
  user.resetOtpExpiresAt = getOtpExpiry();
  await user.save();
  await sendEmail({ to: user.email, subject: "Reset your E-Commerce password", ...otpEmail({ name: user.name, otp, purpose: "reset", expiresInMinutes: process.env.OTP_EXPIRES_IN_MINUTES }) });
  res.json({ message: "If that email exists, a reset OTP has been sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    email: req.body.email.toLowerCase(),
  }).select("+password +resetOtp +resetOtpExpiresAt +tokenVersion");

  if (
    !user ||
    !user.resetOtp ||
    !user.resetOtpExpiresAt ||
    user.resetOtpExpiresAt <= new Date()
  ) {
    throw new AppError("Invalid or expired reset OTP", 400);
  }

  if (user.resetOtp !== hashOtp(req.body.otp)) {
    throw new AppError("Invalid or expired reset OTP", 400);
  }

  user.password = await bcrypt.hash(req.body.password, 12);

  user.tokenVersion = (user.tokenVersion || 0) + 1;

  user.resetOtp = undefined;
  user.resetOtpExpiresAt = undefined;

  await user.save();

  res.json({
    message: "Password reset successful. You can now log in.",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (typeof newPassword !== "string" || newPassword.length < 8) throw new AppError("New password must be at least 8 characters");
  const user = await User.findById(req.user._id).select("+password +tokenVersion");
  if (!(await bcrypt.compare(currentPassword, user.password))) throw new AppError("Current password is incorrect", 401);
  user.password = await bcrypt.hash(newPassword, 12); user.tokenVersion += 1; await user.save();
  const token = createToken(user._id, user.tokenVersion); res.cookie("token", token, cookieOptions);
  res.json({ message: "Password changed successfully", token });
});
