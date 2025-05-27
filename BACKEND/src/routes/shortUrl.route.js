import express from "express";
import { createShortUrl, createCustomShortUrl, getUserUrls } from "../controllers/shortUrl.controller.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes that require authentication
router.post('/create', authMiddleware, asyncHandler(createShortUrl));
router.post('/custom', authMiddleware, asyncHandler(createCustomShortUrl));
router.get('/user', authMiddleware, asyncHandler(getUserUrls));

export default router;