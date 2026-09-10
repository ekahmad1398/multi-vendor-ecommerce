import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Prefer the hosted connection if both are configured; MONGO_URI remains a
    // local-development fallback.
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI or MONGO_URI is missing from the environment variables");
    }

    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
