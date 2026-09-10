import { Router } from "express";
import { getAdminUsers, updateAdminUser } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = Router();
router.use(protect, adminOnly);
router.get("/users", getAdminUsers);
router.patch("/users/:id", updateAdminUser);
export default router;
