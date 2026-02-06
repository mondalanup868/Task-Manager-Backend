import express from "express";
import protect from "../middleware/authMiddleware.js";
import { generatePDF } from "../controllers/reportController.js";

const router = express.Router();

router.get("/pdf", protect, generatePDF);

export default router;
