import { Router } from "express";
import { deleteReview, updateReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/auth.js";
const router = Router(); router.use(protect); router.put("/:id", updateReview); router.delete("/:id", deleteReview); export default router;
