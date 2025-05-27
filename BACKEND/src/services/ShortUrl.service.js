import { generateNanoId } from "../utils/helper.js";
import { saveShortUrl } from "../dao/shortUrl.dao.js";
import { BadRequestError, ConflictError } from "../utils/errorHandler.js";
import ShortUrl from "../models/shorturl.model.js";

// Input validation helper
const validateServiceInputs = (url, userId = null) => {
    if (!url) {
        throw new BadRequestError("URL is required");
    }

    if (typeof url !== 'string' || url.trim().length === 0) {
        throw new BadRequestError("URL must be a non-empty string");
    }

    if (userId !== null && (typeof userId !== 'string' || userId.trim().length === 0)) {
        throw new BadRequestError("User ID must be a non-empty string when provided");
    }
};

export const createShortUrlServiceWithoutUserId = async (url) => {
    try {
        // Validate inputs
        validateServiceInputs(url);

        // Generate short URL with retry mechanism
        let shortUrl;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                shortUrl = generateNanoId(7);

                if (!shortUrl) {
                    throw new Error('Failed to generate short URL');
                }

                // Attempt to save the short URL
                await saveShortUrl(shortUrl, url.trim());
                break; // Success, exit retry loop

            } catch (error) {
                retryCount++;

                // If it's a duplicate key error, retry with a new ID
                if (error.code === 11000 && retryCount < maxRetries) {
                    console.warn(`Duplicate short URL generated, retrying... (${retryCount}/${maxRetries})`);
                    continue;
                }

                // If max retries reached or other error, throw
                if (retryCount >= maxRetries) {
                    throw new ConflictError("Unable to generate unique short URL after multiple attempts");
                }

                throw error;
            }
        }

        console.log(`Short URL created successfully: ${shortUrl} for ${url}`);
        return shortUrl;

    } catch (error) {
        console.error("Error in createShortUrlServiceWithoutUserId:", error);
        throw error;
    }
};

export const createShortUrlServiceWithUserId = async (url, userId) => {
    try {
        // Validate inputs
        validateServiceInputs(url, userId);

        // Generate short URL with retry mechanism
        let shortUrl;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                shortUrl = generateNanoId(7);

                if (!shortUrl) {
                    throw new Error('Failed to generate short URL');
                }

                // Attempt to save the short URL with user ID
                await saveShortUrl(shortUrl, url.trim(), userId.trim());
                break; // Success, exit retry loop

            } catch (error) {
                retryCount++;

                // If it's a duplicate key error, retry with a new ID
                if (error.code === 11000 && retryCount < maxRetries) {
                    console.warn(`Duplicate short URL generated, retrying... (${retryCount}/${maxRetries})`);
                    continue;
                }

                // If max retries reached or other error, throw
                if (retryCount >= maxRetries) {
                    throw new ConflictError("Unable to generate unique short URL after multiple attempts");
                }

                throw error;
            }
        }

        console.log(`Short URL created successfully: ${shortUrl} for ${url} (User: ${userId})`);
        return shortUrl;

    } catch (error) {
        console.error("Error in createShortUrlServiceWithUserId:", error);
        throw error;
    }
};

export const createCustomShortUrlService = async (url, customUrl, userId) => {
    const startTime = Date.now();
    console.log(`🔄 [SHORTURL-SERVICE] Starting custom URL creation: ${customUrl} for ${url}`);

    try {
        // Validate inputs with detailed logging
        console.log(`📝 [SHORTURL-SERVICE] Validating custom URL inputs...`);
        validateServiceInputs(url, userId);

        if (!customUrl || typeof customUrl !== 'string' || customUrl.trim().length === 0) {
            console.warn(`⚠️ [SHORTURL-SERVICE] Invalid custom URL provided: ${customUrl}`);
            throw new BadRequestError("Custom URL is required and must be a non-empty string");
        }

        // Validate custom URL format
        const customUrlTrimmed = customUrl.trim();
        const customUrlRegex = /^[a-zA-Z0-9-_]+$/;

        if (!customUrlRegex.test(customUrlTrimmed)) {
            console.warn(`⚠️ [SHORTURL-SERVICE] Invalid custom URL format: ${customUrlTrimmed}`);
            throw new BadRequestError("Custom URL can only contain letters, numbers, hyphens, and underscores");
        }

        if (customUrlTrimmed.length < 3 || customUrlTrimmed.length > 50) {
            console.warn(`⚠️ [SHORTURL-SERVICE] Invalid custom URL length: ${customUrlTrimmed.length}`);
            throw new BadRequestError("Custom URL must be between 3 and 50 characters long");
        }

        console.log(`✅ [SHORTURL-SERVICE] Custom URL validation passed: ${customUrlTrimmed}`);

        // Check if custom URL already exists
        console.log(`🔍 [SHORTURL-SERVICE] Checking if custom URL already exists: ${customUrlTrimmed}`);
        const existingUrl = await ShortUrl.findOne({ short_url: customUrlTrimmed });

        if (existingUrl) {
            console.warn(`⚠️ [SHORTURL-SERVICE] Custom URL already exists: ${customUrlTrimmed}`);
            throw new ConflictError(`The custom URL "${customUrlTrimmed}" is already taken. Please choose a different one.`);
        }

        console.log(`✅ [SHORTURL-SERVICE] Custom URL is available: ${customUrlTrimmed}`);

        // Attempt to save the custom short URL
        console.log(`💾 [SHORTURL-SERVICE] Saving custom short URL to database...`);
        await saveShortUrl(customUrlTrimmed, url.trim(), userId);

        const duration = Date.now() - startTime;
        console.log(`🎉 [SHORTURL-SERVICE] Custom short URL created successfully: ${customUrlTrimmed} for ${url} (User: ${userId}) (${duration}ms)`);

        return customUrlTrimmed;

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [SHORTURL-SERVICE] Custom URL creation failed (${duration}ms)`);
        console.error(`❌ [SHORTURL-SERVICE] Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack,
            customUrl,
            url,
            userId
        });

        // Re-throw with enhanced context
        if (error instanceof BadRequestError || error instanceof ConflictError) {
            throw error;
        }

        // Handle specific database errors
        if (error.code === 11000) {
            throw new ConflictError(`The custom URL "${customUrl.trim()}" is already taken. Please choose a different one.`);
        }

        throw new Error(`Failed to create custom short URL: ${error.message}`);
    }
};

export const getUserUrlsService = async (userId) => {
    const startTime = Date.now();
    console.log(`🔄 [SHORTURL-SERVICE] Starting get user URLs for: ${userId}`);

    try {
        // Validate input
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
            console.warn(`⚠️ [SHORTURL-SERVICE] Invalid user ID provided: ${userId}`);
            throw new BadRequestError("Valid user ID is required");
        }

        console.log(`🔍 [SHORTURL-SERVICE] Fetching URLs for user: ${userId}`);

        // Get all URLs for the user from database
        const urls = await ShortUrl.find({ user: userId.trim() })
            .sort({ createdAt: -1 }) // Sort by newest first
            .lean(); // Use lean() for better performance

        console.log(`✅ [SHORTURL-SERVICE] Found ${urls.length} URLs for user: ${userId}`);

        // Transform the data to match frontend expectations
        const transformedUrls = urls.map(url => ({
            id: url._id.toString(),
            shortUrl: `${process.env.APP_URL || 'http://localhost:3000/'}${url.short_url}`,
            originalUrl: url.full_url,
            customUrl: url.short_url,
            clicks: url.clicks || 0,
            createdAt: url.createdAt || url.created_at || new Date().toISOString()
        }));

        const duration = Date.now() - startTime;
        console.log(`🎉 [SHORTURL-SERVICE] User URLs retrieved successfully: ${transformedUrls.length} URLs (${duration}ms)`);

        return transformedUrls;

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [SHORTURL-SERVICE] Get user URLs failed (${duration}ms)`);
        console.error(`❌ [SHORTURL-SERVICE] Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack,
            userId
        });

        // Re-throw with enhanced context
        if (error instanceof BadRequestError) {
            throw error;
        }

        throw new Error(`Failed to retrieve user URLs: ${error.message}`);
    }
};
