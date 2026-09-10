import crypto from "crypto";

export const createOtp = () => crypto.randomInt(100000, 1000000).toString();
// Store a hash, not the usable OTP, so a database leak cannot expose active codes.
export const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex");
export const getOtpExpiry = () => {
  const minutes = Number(process.env.OTP_EXPIRES_IN_MINUTES || 10);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error("OTP_EXPIRES_IN_MINUTES must be a positive number");
  }
  return new Date(Date.now() + minutes * 60 * 1000);
};
