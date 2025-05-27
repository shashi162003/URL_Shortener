import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

// Apply async error handling wrapper to all routes
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;