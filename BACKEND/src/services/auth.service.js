import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { findUserByEmail } from "../dao/user.dao.js";
import { signToken } from "../utils/helper.js";

export const registerUserService = async (name, email, password) => {
    const startTime = Date.now();
    console.log(`🔄 [AUTH-SERVICE] Starting user registration process for email: ${email}`);

    try {
        // Input validation with detailed logging
        console.log(`📝 [AUTH-SERVICE] Validating input parameters...`);
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid name provided: ${name}`);
            throw new BadRequestError("Name is required and must be a non-empty string");
        }

        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid email provided: ${email}`);
            throw new BadRequestError("Email is required and must be a non-empty string");
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid password provided for email: ${email}`);
            throw new BadRequestError("Password is required and must be at least 6 characters long");
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid email format: ${email}`);
            throw new BadRequestError("Please provide a valid email address");
        }

        console.log(`✅ [AUTH-SERVICE] Input validation passed for email: ${email}`);

        // Check if user already exists
        console.log(`🔍 [AUTH-SERVICE] Checking if user already exists with email: ${email}`);
        const userExists = await findUserByEmail(email.trim());

        if (userExists) {
            console.warn(`⚠️ [AUTH-SERVICE] User registration failed - email already exists: ${email}`);
            throw new BadRequestError("User with this email already exists");
        }

        console.log(`✅ [AUTH-SERVICE] Email is available: ${email}`);

        // Hash password
        console.log(`🔐 [AUTH-SERVICE] Hashing password for user: ${email}`);
        const saltRounds = 12; // Increased for better security
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!hashedPassword) {
            console.error(`❌ [AUTH-SERVICE] Failed to hash password for user: ${email}`);
            throw new Error("Failed to process password");
        }

        console.log(`✅ [AUTH-SERVICE] Password hashed successfully for user: ${email}`);

        // Create new user object
        console.log(`👤 [AUTH-SERVICE] Creating new user object for: ${email}`);
        const newUser = new User({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword
        });

        // Generate JWT token
        console.log(`🎫 [AUTH-SERVICE] Generating JWT token for user: ${email}`);
        const tokenPayload = {
            id: newUser._id,
            email: newUser.email,
            name: newUser.name
        };

        const token = signToken(tokenPayload);

        if (!token) {
            console.error(`❌ [AUTH-SERVICE] Failed to generate token for user: ${email}`);
            throw new Error("Failed to generate authentication token");
        }

        console.log(`✅ [AUTH-SERVICE] JWT token generated successfully for user: ${email}`);

        // Save user to database
        console.log(`💾 [AUTH-SERVICE] Saving user to database: ${email}`);
        const savedUser = await newUser.save();

        if (!savedUser) {
            console.error(`❌ [AUTH-SERVICE] Failed to save user to database: ${email}`);
            throw new Error("Failed to create user account");
        }

        // Remove password from response
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        userResponse.token = token;

        const duration = Date.now() - startTime;
        console.log(`🎉 [AUTH-SERVICE] User registration completed successfully for: ${email} (${duration}ms)`);

        return userResponse;

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [AUTH-SERVICE] User registration failed for: ${email} (${duration}ms)`);
        console.error(`❌ [AUTH-SERVICE] Error details:`, {
            message: error.message,
            stack: error.stack,
            name: error.name,
            statusCode: error.statusCode
        });

        // Re-throw with enhanced context
        if (error instanceof BadRequestError) {
            throw error;
        }

        // Handle specific database errors
        if (error.code === 11000) {
            console.error(`❌ [AUTH-SERVICE] Duplicate key error for email: ${email}`);
            throw new BadRequestError("User with this email already exists");
        }

        if (error.name === 'ValidationError') {
            console.error(`❌ [AUTH-SERVICE] Validation error for user: ${email}`, error.errors);
            throw new BadRequestError("Invalid user data provided");
        }

        // Generic error for unexpected issues
        throw new Error(`User registration failed: ${error.message}`);
    }
};

export const loginUserService = async (email, password) => {
    const startTime = Date.now();
    console.log(`🔄 [AUTH-SERVICE] Starting user login process for email: ${email}`);

    try {
        // Input validation with detailed logging
        console.log(`📝 [AUTH-SERVICE] Validating login credentials...`);

        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid email provided for login: ${email}`);
            throw new BadRequestError("Email is required and must be a non-empty string");
        }

        if (!password || typeof password !== 'string' || password.length === 0) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid password provided for login attempt: ${email}`);
            throw new BadRequestError("Password is required");
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            console.warn(`⚠️ [AUTH-SERVICE] Invalid email format for login: ${email}`);
            throw new BadRequestError("Please provide a valid email address");
        }

        console.log(`✅ [AUTH-SERVICE] Login input validation passed for email: ${email}`);

        // Find user by email
        console.log(`🔍 [AUTH-SERVICE] Looking up user with email: ${email}`);
        const user = await findUserByEmail(email.trim().toLowerCase());

        if (!user) {
            console.warn(`⚠️ [AUTH-SERVICE] Login failed - user not found: ${email}`);
            // Use generic message to prevent email enumeration
            throw new BadRequestError("Invalid email or password");
        }

        console.log(`✅ [AUTH-SERVICE] User found for login: ${email}`);

        // Verify password
        console.log(`🔐 [AUTH-SERVICE] Verifying password for user: ${email}`);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.warn(`⚠️ [AUTH-SERVICE] Login failed - invalid password for user: ${email}`);
            // Use generic message to prevent password enumeration
            throw new BadRequestError("Invalid email or password");
        }

        console.log(`✅ [AUTH-SERVICE] Password verification successful for user: ${email}`);

        // Generate JWT token
        console.log(`🎫 [AUTH-SERVICE] Generating JWT token for login: ${email}`);
        const tokenPayload = {
            id: user._id,
            email: user.email,
            name: user.name
        };

        const token = signToken(tokenPayload);

        if (!token) {
            console.error(`❌ [AUTH-SERVICE] Failed to generate token for login: ${email}`);
            throw new Error("Failed to generate authentication token");
        }

        console.log(`✅ [AUTH-SERVICE] JWT token generated successfully for login: ${email}`);

        // Prepare user response (remove sensitive data)
        const userResponse = user.toObject();
        delete userResponse.password;

        const duration = Date.now() - startTime;
        console.log(`🎉 [AUTH-SERVICE] User login completed successfully for: ${email} (${duration}ms)`);

        return {
            user: userResponse,
            token,
            loginTime: new Date().toISOString()
        };

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ [AUTH-SERVICE] User login failed for: ${email} (${duration}ms)`);
        console.error(`❌ [AUTH-SERVICE] Login error details:`, {
            message: error.message,
            stack: error.stack,
            name: error.name,
            statusCode: error.statusCode
        });

        // Re-throw with enhanced context
        if (error instanceof BadRequestError) {
            throw error;
        }

        // Handle specific database errors
        if (error.name === 'CastError') {
            console.error(`❌ [AUTH-SERVICE] Database cast error during login for: ${email}`);
            throw new BadRequestError("Invalid user data");
        }

        // Generic error for unexpected issues
        throw new Error(`User login failed: ${error.message}`);
    }
};