import urlSchema from "../models/shorturl.model.js";
import { BadRequestError, ConflictError } from "../utils/errorHandler.js";

// Input validation helper
const validateSaveInputs = (shortUrl, longUrl, userId = null) => {
    if (!shortUrl || typeof shortUrl !== 'string' || shortUrl.trim().length === 0) {
        throw new BadRequestError("Short URL is required and must be a non-empty string");
    }

    if (!longUrl || typeof longUrl !== 'string' || longUrl.trim().length === 0) {
        throw new BadRequestError("Long URL is required and must be a non-empty string");
    }

    if (userId !== null && (typeof userId !== 'string' || userId.trim().length === 0)) {
        throw new BadRequestError("User ID must be a non-empty string when provided");
    }
};

export const saveShortUrl = async (shortUrl, longUrl, userId = null) => {
    try {
        // Validate inputs
        validateSaveInputs(shortUrl, longUrl, userId);

        // Create new URL document
        const newUrl = new urlSchema({
            full_url: longUrl.trim(),
            short_url: shortUrl.trim()
        });

        if (userId) {
            newUrl.user = userId.trim();
        }

        // Save to database with proper error handling
        const savedUrl = await newUrl.save();

        if (!savedUrl) {
            throw new Error("Failed to save URL to database");
        }

        console.log(`URL saved successfully: ${shortUrl} -> ${longUrl}`);
        return savedUrl;

    } catch (error) {
        console.error("Error in saveShortUrl:", error);

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            // Duplicate key error
            if (error.keyPattern && error.keyPattern.short_url) {
                throw new ConflictError("Short URL already exists");
            }
            throw new ConflictError("Duplicate entry detected");
        }

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            throw new BadRequestError(`Validation failed: ${validationErrors.join(', ')}`);
        }

        if (error.name === 'CastError') {
            throw new BadRequestError("Invalid data format provided");
        }

        // Re-throw custom errors as-is
        if (error instanceof BadRequestError || error instanceof ConflictError) {
            throw error;
        }

        // For any other errors, throw a generic error
        throw new Error(`Database operation failed: ${error.message}`);
    }
};

export const getShortUrl = async (shortUrl) => {
    try {
        // Validate input
        if (!shortUrl || typeof shortUrl !== 'string' || shortUrl.trim().length === 0) {
            throw new BadRequestError("Short URL is required and must be a non-empty string");
        }

        // Find and update the URL document (increment clicks)
        const url = await urlSchema.findOneAndUpdate(
            { short_url: shortUrl.trim() },
            { $inc: { clicks: 1 } },
            {
                new: true, // Return the updated document
                lean: true // Return plain JavaScript object for better performance
            }
        );

        if (!url) {
            console.log(`Short URL not found: ${shortUrl}`);
            return null;
        }

        // Validate the returned data
        if (!url.full_url) {
            console.error(`Invalid URL data found for ${shortUrl}:`, url);
            throw new Error("Invalid URL data in database");
        }

        console.log(`Short URL found: ${shortUrl} -> ${url.full_url} (clicks: ${url.clicks})`);
        return url;

    } catch (error) {
        console.error("Error in getShortUrl:", error);

        // Handle specific MongoDB errors
        if (error.name === 'CastError') {
            throw new BadRequestError("Invalid short URL format");
        }

        // Re-throw custom errors as-is
        if (error instanceof BadRequestError) {
            throw error;
        }

        // For any other errors, throw a generic error
        throw new Error(`Database query failed: ${error.message}`);
    }
};