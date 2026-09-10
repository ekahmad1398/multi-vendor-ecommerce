import "dotenv/config";
import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

// Keep .env as the shared baseline and let local development secrets override it.
dotenv.config({ path: ".env.local", override: true });

const PORT = process.env.PORT || 30001;

// Wait for MongoDB before accepting requests, so the API does not start half-ready.
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
