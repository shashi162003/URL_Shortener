import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateNanoId = (length) => {
    try {
        // Validate input
        if (!length || typeof length !== 'number' || length <= 0) {
            throw new Error("Length must be a positive number");
        }

        if (length > 50) {
            throw new Error("Length cannot exceed 50 characters");
        }

        // Generate the nanoid
        const id = nanoid(length);

        if (!id || id.length !== length) {
            throw new Error("Failed to generate ID with specified length");
        }

        return id;

    } catch (error) {
        console.error("Error in generateNanoId:", error);
        throw new Error(`ID generation failed: ${error.message}`);
    }
};

export const signToken = (payload) => {
    const startTime = Date.now();
    console.log(`🎫 [HELPER] Starting JWT token signing process`);

    try {
        // Input validation with detailed logging
        if (!payload) {
            console.warn(`⚠️ [HELPER] Token signing failed - no payload provided`);
            throw new Error("Payload is required for token signing");
        }

        if (typeof payload !== 'object') {
            console.warn(`⚠️ [HELPER] Token signing failed - invalid payload type: ${typeof payload}`);
            throw new Error("Payload must be an object");
        }

        console.log(`📝 [HELPER] Token payload validation passed:`, {
            userId: payload.id ? `${payload.id.toString().substring(0, 8)}...` : 'undefined',
            email: payload.email || 'undefined',
            name: payload.name || 'undefined'
        });

        // JWT configuration
        const expiresIn = "7d";
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error(`❌ [HELPER] JWT_SECRET environment variable not found`);
            throw new Error("JWT secret not configured");
        }

        console.log(`🔐 [HELPER] Signing JWT token with expiration: ${expiresIn}`);

        // Sign the token
        const token = jwt.sign(payload, jwtSecret, {
            expiresIn,
            issuer: 'url-shortener-app',
            audience: 'url-shortener-users'
        });

        if (!token) {
            console.error(`❌ [HELPER] JWT signing returned empty token`);
            throw new Error("Failed to generate token");
        }

        const duration = Date.now() - startTime;
        console.log(`✅ [HELPER] JWT token signed successfully (${duration}ms)`);
        console.log(`📊 [HELPER] Token info:`, {
            length: token.length,
            expiresIn,
            userId: payload.id ? payload.id.toString() : 'undefined'
        });

        return token;

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [HELPER] JWT token signing failed (${duration}ms)`);
        console.error(`❌ [HELPER] Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        // Handle specific JWT errors
        if (error.message.includes('secretOrPrivateKey')) {
            throw new Error("JWT secret configuration error");
        }

        if (error.message.includes('payload')) {
            throw new Error("Invalid token payload provided");
        }

        throw new Error(`Token signing failed: ${error.message}`);
    }
};

export const verifyToken = (token) => {
    const startTime = Date.now();
    console.log(`🔍 [HELPER] Starting JWT token verification process`);

    try {
        // Input validation with detailed logging
        if (!token) {
            console.warn(`⚠️ [HELPER] Token verification failed - no token provided`);
            throw new Error("Token is required for verification");
        }

        if (typeof token !== 'string') {
            console.warn(`⚠️ [HELPER] Token verification failed - invalid token type: ${typeof token}`);
            throw new Error("Token must be a string");
        }

        console.log(`📝 [HELPER] Token validation passed:`, {
            length: token.length,
            prefix: token.substring(0, 20) + '...'
        });

        // JWT secret validation
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error(`❌ [HELPER] JWT_SECRET environment variable not found`);
            throw new Error("JWT secret not configured");
        }

        console.log(`🔐 [HELPER] Verifying JWT token...`);

        // Verify the token
        const decoded = jwt.verify(token, jwtSecret, {
            issuer: 'url-shortener-app',
            audience: 'url-shortener-users'
        });

        if (!decoded) {
            console.error(`❌ [HELPER] JWT verification returned empty result`);
            throw new Error("Token verification failed");
        }

        const duration = Date.now() - startTime;
        console.log(`✅ [HELPER] JWT token verified successfully (${duration}ms)`);
        console.log(`📊 [HELPER] Decoded token info:`, {
            userId: decoded.id ? `${decoded.id.toString().substring(0, 8)}...` : 'undefined',
            email: decoded.email || 'undefined',
            exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'undefined',
            iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'undefined'
        });

        return decoded;

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [HELPER] JWT token verification failed (${duration}ms)`);
        console.error(`❌ [HELPER] Error details:`, {
            message: error.message,
            name: error.name
        });

        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            console.warn(`⚠️ [HELPER] Token has expired`);
            throw new Error("Token has expired");
        }

        if (error.name === 'JsonWebTokenError') {
            console.warn(`⚠️ [HELPER] Invalid token format`);
            throw new Error("Invalid token format");
        }

        if (error.name === 'NotBeforeError') {
            console.warn(`⚠️ [HELPER] Token not active yet`);
            throw new Error("Token not active yet");
        }

        if (error.message.includes('secretOrPrivateKey')) {
            throw new Error("JWT secret configuration error");
        }

        throw new Error(`Token verification failed: ${error.message}`);
    }
};