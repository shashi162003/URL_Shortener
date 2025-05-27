import { createShortUrlServiceWithUserId } from "../services/ShortUrl.service.js";
import { getShortUrl } from "../dao/shortUrl.dao.js";
import { BadRequestError, NotFoundError } from "../utils/errorHandler.js";
import { createCustomShortUrlService, getUserUrlsService } from "../services/ShortUrl.service.js";

// Input validation helper
const validateUrl = (url) => {
    if (!url) {
        throw new BadRequestError("URL is required");
    }

    if (typeof url !== 'string') {
        throw new BadRequestError("URL must be a string");
    }

    // Basic URL validation
    try {
        new URL(url);
    } catch (error) {
        throw new BadRequestError("Invalid URL format");
    }
};

export const createShortUrl = async (req, res, next) => {
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`🚀 [SHORTURL-CONTROLLER] ${requestId} - Starting URL shortening request`);
    console.log(`📋 [SHORTURL-CONTROLLER] ${requestId} - Request details:`, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    });

    try {
        const { url } = req.body;

        console.log(`📝 [SHORTURL-CONTROLLER] ${requestId} - Request body:`, {
            url: url || 'undefined',
            hasUser: !!req.user
        });

        // Validate input
        console.log(`✅ [SHORTURL-CONTROLLER] ${requestId} - Validating URL input...`);
        validateUrl(url);

        // Get user ID from authenticated user (required due to auth middleware)
        const userId = req.user.id;
        console.log(`👤 [SHORTURL-CONTROLLER] ${requestId} - User authenticated:`, {
            userId: userId,
            email: req.user.email,
            name: req.user.name
        });

        if (!userId) {
            console.error(`❌ [SHORTURL-CONTROLLER] ${requestId} - No user ID found despite authentication`);
            throw new Error("User authentication failed");
        }

        console.log(`🔄 [SHORTURL-CONTROLLER] ${requestId} - Creating short URL for authenticated user: ${req.user.email}`);

        // Create short URL with user ID (since authentication is required)
        const shortUrl = await createShortUrlServiceWithUserId(url, userId);

        if (!shortUrl) {
            console.error(`❌ [SHORTURL-CONTROLLER] ${requestId} - Failed to create short URL`);
            throw new Error("Failed to create short URL");
        }

        const fullShortUrl = `${process.env.APP_URL || 'http://localhost:3000/'}${shortUrl}`;

        const duration = Date.now() - startTime;
        console.log(`🎉 [SHORTURL-CONTROLLER] ${requestId} - Short URL created successfully (${duration}ms)`);
        console.log(`📤 [SHORTURL-CONTROLLER] ${requestId} - Sending success response:`, {
            shortUrl: fullShortUrl,
            originalUrl: url,
            userId: userId
        });

        res.status(201).json({
            success: true,
            data: {
                shortUrl: fullShortUrl,
                originalUrl: url,
                userId: userId,
                createdBy: req.user.email
            },
            message: "Short URL created successfully",
            requestId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [SHORTURL-CONTROLLER] ${requestId} - URL shortening failed (${duration}ms)`);
        console.error(`❌ [SHORTURL-CONTROLLER] ${requestId} - Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        next(error);
    }
};

export const redirectFromShortUrl = async (req, res, next) => {
    const requestId = `REDIRECT-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    console.log(`🔗 [REDIRECT-CONTROLLER] ${requestId} - Starting redirect request`);

    try {
        const { id } = req.params;

        console.log(`📋 [REDIRECT-CONTROLLER] ${requestId} - Request details:`, {
            id: id || 'undefined',
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        });

        // Validate input
        if (!id) {
            console.warn(`⚠️ [REDIRECT-CONTROLLER] ${requestId} - No ID provided`);
            throw new BadRequestError("Short URL ID is required");
        }

        if (typeof id !== 'string' || id.trim().length === 0) {
            console.warn(`⚠️ [REDIRECT-CONTROLLER] ${requestId} - Invalid ID format: ${id}`);
            throw new BadRequestError("Invalid short URL ID format");
        }

        console.log(`🔍 [REDIRECT-CONTROLLER] ${requestId} - Looking up short URL: ${id.trim()}`);
        const url = await getShortUrl(id.trim());

        if (!url) {
            console.warn(`⚠️ [REDIRECT-CONTROLLER] ${requestId} - Short URL not found: ${id.trim()}`);
            throw new NotFoundError("Short URL not found");
        }

        if (!url.full_url) {
            console.error(`❌ [REDIRECT-CONTROLLER] ${requestId} - Invalid URL data:`, url);
            throw new Error("Invalid URL data in database");
        }

        // Log the redirect for analytics
        console.log(`🎯 [REDIRECT-CONTROLLER] ${requestId} - Redirecting ${id} to ${url.full_url} (clicks: ${url.clicks})`);

        // Set headers to prevent caching of the redirect
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        console.log(`✅ [REDIRECT-CONTROLLER] ${requestId} - Sending 302 redirect to: ${url.full_url}`);

        // Use 302 (temporary redirect) to prevent aggressive browser caching
        // This ensures each visit makes a new request to increment clicks
        res.redirect(302, url.full_url);

    } catch (error) {
        console.error(`❌ [REDIRECT-CONTROLLER] ${requestId} - Redirect failed:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        next(error);
    }
};

export const createCustomShortUrl = async (req, res, next) => {
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`🚀 [CUSTOM-URL-CONTROLLER] ${requestId} - Starting custom URL creation request`);
    console.log(`📋 [CUSTOM-URL-CONTROLLER] ${requestId} - Request details:`, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    });

    try {
        const { url, customUrl } = req.body;

        console.log(`📝 [CUSTOM-URL-CONTROLLER] ${requestId} - Request body:`, {
            url: url || 'undefined',
            customUrl: customUrl || 'undefined',
            hasUser: !!req.user
        });

        // Validate inputs
        console.log(`✅ [CUSTOM-URL-CONTROLLER] ${requestId} - Validating inputs...`);
        validateUrl(url);

        // Validate custom URL (not as a full URL, just as a custom string)
        if (!customUrl || typeof customUrl !== 'string') {
            throw new BadRequestError("Custom URL is required and must be a string");
        }

        const trimmedCustomUrl = customUrl.trim();

        // Check length
        if (trimmedCustomUrl.length < 3 || trimmedCustomUrl.length > 50) {
            throw new BadRequestError("Custom URL must be between 3 and 50 characters long");
        }

        // Check format - only letters, numbers, hyphens, and underscores
        const customUrlRegex = /^[a-zA-Z0-9-_]+$/;
        if (!customUrlRegex.test(trimmedCustomUrl)) {
            throw new BadRequestError("Custom URL can only contain letters, numbers, hyphens, and underscores");
        }

        // Check for reserved words
        const reservedWords = ['api', 'admin', 'www', 'app', 'create', 'custom', 'user', 'auth', 'login', 'signup', 'register'];
        if (reservedWords.includes(trimmedCustomUrl.toLowerCase())) {
            throw new BadRequestError("This custom URL is reserved and cannot be used");
        }

        // Get user ID from authenticated user (required due to auth middleware)
        const userId = req.user.id;
        console.log(`👤 [CUSTOM-URL-CONTROLLER] ${requestId} - User authenticated:`, {
            userId: userId,
            email: req.user.email,
            name: req.user.name
        });

        if (!userId) {
            console.error(`❌ [CUSTOM-URL-CONTROLLER] ${requestId} - No user ID found despite authentication`);
            throw new Error("User authentication failed");
        }

        console.log(`🔄 [CUSTOM-URL-CONTROLLER] ${requestId} - Creating custom short URL for user: ${req.user.email}`);

        const shortUrl = await createCustomShortUrlService(url, trimmedCustomUrl, userId);

        if (!shortUrl) {
            console.error(`❌ [CUSTOM-URL-CONTROLLER] ${requestId} - Failed to create custom short URL`);
            throw new Error("Failed to create custom short URL");
        }

        const fullShortUrl = `${process.env.APP_URL || 'http://localhost:3000/'}${shortUrl}`;

        const duration = Date.now() - startTime;
        console.log(`🎉 [CUSTOM-URL-CONTROLLER] ${requestId} - Custom short URL created successfully (${duration}ms)`);
        console.log(`📤 [CUSTOM-URL-CONTROLLER] ${requestId} - Sending success response:`, {
            shortUrl: fullShortUrl,
            originalUrl: url,
            customUrl: trimmedCustomUrl,
            userId: userId
        });

        res.status(201).json({
            success: true,
            data: {
                shortUrl: fullShortUrl,
                originalUrl: url,
                customUrl: trimmedCustomUrl,
                userId: userId,
                createdBy: req.user.email
            },
            message: "Custom short URL created successfully",
            requestId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [CUSTOM-URL-CONTROLLER] ${requestId} - Custom URL creation failed (${duration}ms)`);
        console.error(`❌ [CUSTOM-URL-CONTROLLER] ${requestId} - Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        next(error);
    }
};



export const getUserUrls = async (req, res) => {
    const requestId = req.requestId || `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const startTime = Date.now();

    try {
        console.log(`🚀 [SHORTURL-CONTROLLER] ${requestId} - Starting get user URLs request`);
        console.log(`📋 [SHORTURL-CONTROLLER] ${requestId} - Request details:`, {
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            timestamp: new Date().toISOString(),
            userId: req.user?.userId || req.user?.id
        });

        if (!req.user || (!req.user.userId && !req.user.id)) {
            console.warn(`⚠️ [SHORTURL-CONTROLLER] ${requestId} - No user found in request`);
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const userId = req.user.userId || req.user.id;
        console.log(`✅ [SHORTURL-CONTROLLER] ${requestId} - Calling service to get URLs for user: ${userId}`);

        const urls = await getUserUrlsService(userId);

        const duration = Date.now() - startTime;
        console.log(`🎉 [SHORTURL-CONTROLLER] ${requestId} - URLs retrieved successfully (${duration}ms)`);
        console.log(`📊 [SHORTURL-CONTROLLER] ${requestId} - Found ${urls.length} URLs for user`);

        console.log(`📤 [SHORTURL-CONTROLLER] ${requestId} - Sending success response`);
        res.status(200).json({
            success: true,
            message: 'URLs retrieved successfully',
            data: {
                urls: urls,
                count: urls.length
            },
            requestId
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [SHORTURL-CONTROLLER] ${requestId} - Get URLs failed (${duration}ms)`);
        console.error(`❌ [SHORTURL-CONTROLLER] ${requestId} - Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack,
            userId: req.user?.userId || req.user?.id
        });

        // Send error response
        const statusCode = error.statusCode || 500;
        console.log(`📤 [SHORTURL-CONTROLLER] ${requestId} - Sending error response with status: ${statusCode}`);

        res.status(statusCode).json({
            success: false,
            message: error.message || 'Failed to retrieve URLs',
            requestId
        });
    }
};