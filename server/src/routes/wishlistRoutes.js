import { Router } from "express";
import { addWishlistProduct, getWishlist, removeWishlistProduct } from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";
const router = Router(); router.use(protect); router.get("/", getWishlist); router.post("/:productId", addWishlistProduct); router.delete("/:productId", removeWishlistProduct); export default router;
