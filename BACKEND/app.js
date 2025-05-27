import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongo.config.js";
import shortUrl from "./src/routes/shortUrl.route.js";
import { redirectFromShortUrl } from "./src/controllers/shortUrl.controller.js";
import { errorHandler, asyncHandler } from "./src/utils/errorHandler.js";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";

// Load environment variables
dotenv.config();

const app = express();

app.use(cors(
    {
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://url-shortener-rk77.onrender.com",
            "https://url-shortener-chi-six.vercel.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        optionsSuccessStatus: 204
    }
));

// Global error handlers for unhandled promises and exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Close server gracefully
    process.exit(1);
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Connect to database
connectDB().catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

// Health check endpoint (must be before catch-all route)
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/shortUrl", shortUrl);
app.use('/api/auth', authRoutes);

// Apply async handler to redirect route (catch-all, must be last)
app.get("/:id", asyncHandler(redirectFromShortUrl));

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
        console.log('HTTP server closed.');

        try {
            // Close database connection
            const mongoose = await import('mongoose');
            await mongoose.default.connection.close();
            console.log('MongoDB connection closed.');
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
        }

        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));