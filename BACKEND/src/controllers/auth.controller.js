import { registerUserService, loginUserService } from "../services/auth.service.js";
import { cookieOptions } from "../config/config.js";

export const registerUser = async (req, res) => {
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`🚀 [AUTH-CONTROLLER] ${requestId} - Starting user registration request`);
    console.log(`📋 [AUTH-CONTROLLER] ${requestId} - Request details:`, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    });

    try {
        // Extract and validate request body
        const { name, email, password } = req.body;

        console.log(`📝 [AUTH-CONTROLLER] ${requestId} - Extracted registration data:`, {
            name: name ? `${name.substring(0, 2)}***` : 'undefined',
            email: email || 'undefined',
            passwordProvided: !!password
        });

        // Input validation at controller level
        if (!req.body || Object.keys(req.body).length === 0) {
            console.warn(`⚠️ [AUTH-CONTROLLER] ${requestId} - Empty request body received`);
            return res.status(400).json({
                success: false,
                message: "Request body is required",
                error: "MISSING_REQUEST_BODY"
            });
        }

        console.log(`✅ [AUTH-CONTROLLER] ${requestId} - Calling registration service for email: ${email}`);

        // Call service layer
        const user = await registerUserService(name, email, password);

        const duration = Date.now() - startTime;
        console.log(`🎉 [AUTH-CONTROLLER] ${requestId} - User registration successful (${duration}ms)`);
        console.log(`📤 [AUTH-CONTROLLER] ${requestId} - Sending success response for user: ${user.email}`);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    createdAt: user.createdAt
                },
                token: user.token
            },
            message: "User registered successfully",
            requestId
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [AUTH-CONTROLLER] ${requestId} - Registration failed (${duration}ms)`);
        console.error(`❌ [AUTH-CONTROLLER] ${requestId} - Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack,
            statusCode: error.statusCode
        });

        // Determine appropriate status code
        let statusCode = 500;
        let errorCode = "INTERNAL_SERVER_ERROR";

        if (error.message.includes("already exists")) {
            statusCode = 409;
            errorCode = "USER_ALREADY_EXISTS";
        } else if (error.message.includes("required") || error.message.includes("invalid")) {
            statusCode = 400;
            errorCode = "INVALID_INPUT";
        } else if (error.statusCode) {
            statusCode = error.statusCode;
            errorCode = "SERVICE_ERROR";
        }

        console.log(`📤 [AUTH-CONTROLLER] ${requestId} - Sending error response with status: ${statusCode}`);

        res.status(statusCode).json({
            success: false,
            message: error.message || "User registration failed",
            error: errorCode,
            requestId,
            timestamp: new Date().toISOString()
        });
    }
};

export const loginUser = async (req, res) => {
    const startTime = Date.now();
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    console.log(`🚀 [AUTH-CONTROLLER] ${requestId} - Starting user login request`);
    console.log(`📋 [AUTH-CONTROLLER] ${requestId} - Request details:`, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString()
    });

    try {
        // Extract and validate request body
        const { email, password } = req.body;

        console.log(`📝 [AUTH-CONTROLLER] ${requestId} - Extracted login data:`, {
            email: email || 'undefined',
            passwordProvided: !!password
        });

        // Input validation at controller level
        if (!req.body || Object.keys(req.body).length === 0) {
            console.warn(`⚠️ [AUTH-CONTROLLER] ${requestId} - Empty request body received`);
            return res.status(400).json({
                success: false,
                message: "Request body is required",
                error: "MISSING_REQUEST_BODY"
            });
        }

        console.log(`✅ [AUTH-CONTROLLER] ${requestId} - Calling login service for email: ${email}`);

        // Call service layer
        const result = await loginUserService(email, password);

        const duration = Date.now() - startTime;
        console.log(`🎉 [AUTH-CONTROLLER] ${requestId} - User login successful (${duration}ms)`);
        console.log(`📤 [AUTH-CONTROLLER] ${requestId} - Sending success response for user: ${result.user.email}`);

        // Set secure HTTP-only cookie for token
        res.cookie("token", result.token, cookieOptions);
        console.log(`🍪 [AUTH-CONTROLLER] ${requestId} - Auth token set in secure cookie`);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: result.user._id,
                    name: result.user.name,
                    email: result.user.email,
                    avatar: result.user.avatar,
                    createdAt: result.user.createdAt
                },
                token: result.token,
                loginTime: result.loginTime
            },
            message: "User logged in successfully",
            requestId
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [AUTH-CONTROLLER] ${requestId} - Login failed (${duration}ms)`);
        console.error(`❌ [AUTH-CONTROLLER] ${requestId} - Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack,
            statusCode: error.statusCode
        });

        // Determine appropriate status code
        let statusCode = 500;
        let errorCode = "INTERNAL_SERVER_ERROR";

        if (error.message.includes("Invalid email or password")) {
            statusCode = 401;
            errorCode = "INVALID_CREDENTIALS";
        } else if (error.message.includes("required") || error.message.includes("invalid")) {
            statusCode = 400;
            errorCode = "INVALID_INPUT";
        } else if (error.statusCode) {
            statusCode = error.statusCode;
            errorCode = "SERVICE_ERROR";
        }

        console.log(`📤 [AUTH-CONTROLLER] ${requestId} - Sending error response with status: ${statusCode}`);

        res.status(statusCode).json({
            success: false,
            message: error.message || "User login failed",
            error: errorCode,
            requestId,
            timestamp: new Date().toISOString()
        });
    }
};