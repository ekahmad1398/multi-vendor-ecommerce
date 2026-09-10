import { Router } from "express";
import { createProduct, deleteProduct, getSellerProducts, updateProduct } from "../controllers/productController.js";
import { getSellerOrders, getSellerStats, updateSellerOrderItemStatus } from "../controllers/orderController.js";
import { getSellerProfile, updateSellerProfile } from "../controllers/sellerController.js";
import { protect, sellerOnly } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();
router.use(protect, sellerOnly);
router.get("/dashboard", getSellerStats);
router.get("/profile", getSellerProfile);
router.patch("/profile", updateSellerProfile);
router.get("/products", getSellerProducts);
router.post("/products", upload.array("images", 6), createProduct);
router.put("/products/:id", upload.array("images", 6), updateProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", getSellerOrders);
router.patch("/orders/:orderId/items/:itemId/status", updateSellerOrderItemStatus);
export default router;
