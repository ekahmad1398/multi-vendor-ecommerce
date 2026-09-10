import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

// Browsers only accept credentialed CORS requests for an explicit origin, never "*".
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000").split(",").map((origin) => origin.trim());
app.use(cors({ origin: (origin, callback) => (!origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error("CORS origin is not allowed"))), credentials: true }));
app.use(express.json());
app.use(cookieParser()); // Parses the Cookie request header so protected routes can read req.cookies.
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Too many authentication attempts. Please try again later." } }));

app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);

// These must be last: route errors flow here as one consistent JSON response.
app.use(notFound);
app.use(errorHandler);

export default app;
