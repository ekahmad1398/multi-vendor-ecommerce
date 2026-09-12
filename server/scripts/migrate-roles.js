import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config({ path: ".env.local", override: true });

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGODB_URI or MONGO_URI is missing");
  process.exit(1);
}

await mongoose.connect(mongoUri);
const [customers, vendors] = await Promise.all([
  User.updateMany({ role: "user" }, { $set: { role: "customer" } }),
  User.updateMany({ role: "seller" }, { $set: { role: "vendor" } }),
]);
console.log(`Migrated ${customers.modifiedCount} customers and ${vendors.modifiedCount} vendors.`);
await mongoose.disconnect();
