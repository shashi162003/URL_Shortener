import { verifyToken } from "../utils/helper.js";
import { findUserByEmail } from "../dao/user.dao.js";

export const authMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`🔍 [AUTH-MIDDLEWARE] ${requestId} - Starting authentication process`);
    console.log(`📋 [AUTH-MIDDLEWARE] ${requestId} - Request details:`, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
    });

    try {
        // Check for token in headers or cookies
        let token = req.headers.authorization || (req.cookies && req.cookies.token);

        console.log(`🔍 [AUTH-MIDDLEWARE] ${requestId} - Token sources:`, {
            authHeader: !!req.headers.authorization,
            cookie: !!(req.cookies && req.cookies.token)
        });

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
            console.log(`🔍 [AUTH-MIDDLEWARE] ${requestId} - Bearer token extracted`);
        }

        if (!token) {
            console.warn(`⚠️ [AUTH-MIDDLEWARE] ${requestId} - No authentication token provided`);
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in to access this resource.",
                error: "NO_TOKEN_PROVIDED",
                requestId,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🔍 [AUTH-MIDDLEWARE] ${requestId} - Token found, length: ${token.length}`);

        // Verify token
        console.log(`🔐 [AUTH-MIDDLEWARE] ${requestId} - Verifying JWT token...`);
        const decoded = verifyToken(token);

        if (!decoded || !decoded.id || !decoded.email) {
            console.warn(`⚠️ [AUTH-MIDDLEWARE] ${requestId} - Token verification failed or incomplete payload`);
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token. Please log in again.",
                error: "INVALID_TOKEN",
                requestId,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`✅ [AUTH-MIDDLEWARE] ${requestId} - Token verified successfully for user: ${decoded.email}`);

        // Optional: Verify user still exists in database
        console.log(`🔍 [AUTH-MIDDLEWARE] ${requestId} - Verifying user exists in database...`);
        const user = await findUserByEmail(decoded.email);

        if (!user) {
            console.warn(`⚠️ [AUTH-MIDDLEWARE] ${requestId} - User not found in database: ${decoded.email}`);
            return res.status(401).json({
                success: false,
                message: "User account not found. Please log in again.",
                error: "USER_NOT_FOUND",
                requestId,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`✅ [AUTH-MIDDLEWARE] ${requestId} - User verified in database: ${user.email}`);

        // Attach user to request with enhanced information
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name || user.name,
            tokenIat: decoded.iat,
            tokenExp: decoded.exp
        };

        console.log(`📝 [AUTH-MIDDLEWARE] ${requestId} - User attached to request:`, {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name
        });

        const duration = Date.now() - startTime;
        console.log(`🎉 [AUTH-MIDDLEWARE] ${requestId} - Authentication completed successfully (${duration}ms)`);

        next();

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [AUTH-MIDDLEWARE] ${requestId} - Authentication failed (${duration}ms)`);
        console.error(`❌ [AUTH-MIDDLEWARE] ${requestId} - Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        // Handle specific JWT errors
        let errorMessage = "Authentication failed. Please log in again.";
        let errorCode = "AUTHENTICATION_FAILED";

        if (error.message.includes("expired")) {
            errorMessage = "Your session has expired. Please log in again.";
            errorCode = "TOKEN_EXPIRED";
        } else if (error.message.includes("invalid")) {
            errorMessage = "Invalid authentication token. Please log in again.";
            errorCode = "INVALID_TOKEN";
        } else if (error.message.includes("malformed")) {
            errorMessage = "Malformed authentication token. Please log in again.";
            errorCode = "MALFORMED_TOKEN";
        }

        return res.status(401).json({
            success: false,
            message: errorMessage,
            error: errorCode,
            requestId,
            timestamp: new Date().toISOString()
        });
    }
};

// Optional authentication middleware - doesn't require authentication but adds user if token is present
export const optionalAuthMiddleware = async (req, res, next) => {
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`🔍 [OPTIONAL-AUTH] ${requestId} - Starting optional authentication check`);

    try {
        // Check for token in headers or cookies
        let token = req.headers.authorization || req.cookies.token;

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7);
        }

        if (!token) {
            console.log(`ℹ️ [OPTIONAL-AUTH] ${requestId} - No token provided, proceeding without authentication`);
            req.user = null;
            return next();
        }

        console.log(`🔍 [OPTIONAL-AUTH] ${requestId} - Token found, attempting verification`);

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded || !decoded.id || !decoded.email) {
            console.warn(`⚠️ [OPTIONAL-AUTH] ${requestId} - Token verification failed, proceeding without authentication`);
            req.user = null;
            return next();
        }

        console.log(`✅ [OPTIONAL-AUTH] ${requestId} - Token verified for user: ${decoded.email}`);

        // Verify user still exists in database
        const user = await findUserByEmail(decoded.email);

        if (!user) {
            console.warn(`⚠️ [OPTIONAL-AUTH] ${requestId} - User not found in database, proceeding without authentication`);
            req.user = null;
            return next();
        }

        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name || user.name,
            tokenIat: decoded.iat,
            tokenExp: decoded.exp
        };

        const duration = Date.now() - startTime;
        console.log(`🎉 [OPTIONAL-AUTH] ${requestId} - Optional authentication completed successfully (${duration}ms)`);

        next();

    } catch (error) {
        const duration = Date.now() - startTime;
        console.warn(`⚠️ [OPTIONAL-AUTH] ${requestId} - Authentication failed, proceeding without authentication (${duration}ms)`);
        console.warn(`⚠️ [OPTIONAL-AUTH] ${requestId} - Error:`, error.message);

        req.user = null;
        next();
    }
};