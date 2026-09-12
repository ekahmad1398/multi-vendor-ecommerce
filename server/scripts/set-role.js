import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config({ path: ".env.local", override: true });

const email = process.argv[2]?.toLowerCase();
const role = process.argv[3];

if (!email || !["customer", "vendor", "admin"].includes(role)) {
  console.error("Usage: node scripts/set-role.js <email> <customer|vendor|admin>");
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGODB_URI or MONGO_URI is missing");
  process.exit(1);
}

await mongoose.connect(mongoUri);
const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
if (!user) {
  console.error(`No user found for ${email}. Sign in on the site first, then run this again.`);
  await mongoose.disconnect();
  process.exit(1);
}

console.log(`Updated ${user.email} → role=${user.role}`);
await mongoose.disconnect();
