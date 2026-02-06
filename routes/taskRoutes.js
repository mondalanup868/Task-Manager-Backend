import express from "express";
import protect from "../middleware/authMiddleware.js";
import { addTask, getTasksByRange } from "../controllers/taskController.js";

const router = express.Router();

router.post("/add", protect, addTask);
router.get("/range", protect, getTasksByRange);

export default router;
