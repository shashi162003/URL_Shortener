import User from "../models/user.model.js";
import { BadRequestError } from "../utils/errorHandler.js";

export const findUserByEmail = async (email) => {
    const startTime = Date.now();
    console.log(`🔍 [USER-DAO] Starting findUserByEmail for: ${email}`);

    try {
        // Input validation with detailed logging
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            console.warn(`⚠️ [USER-DAO] Invalid email parameter: ${email}`);
            throw new BadRequestError("Email is required and must be a non-empty string");
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            console.warn(`⚠️ [USER-DAO] Invalid email format: ${email}`);
            throw new BadRequestError("Invalid email format");
        }

        console.log(`📝 [USER-DAO] Searching for user with email: ${email.trim()}`);

        // Database query with performance monitoring
        const queryStartTime = Date.now();
        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select('+password'); // Include password field for authentication

        const queryDuration = Date.now() - queryStartTime;
        console.log(`⚡ [USER-DAO] Database query completed in ${queryDuration}ms`);

        if (!user) {
            const totalDuration = Date.now() - startTime;
            console.log(`❌ [USER-DAO] User not found: ${email} (${totalDuration}ms)`);
            return null;
        }

        const totalDuration = Date.now() - startTime;
        console.log(`✅ [USER-DAO] User found successfully: ${email} (${totalDuration}ms)`);
        console.log(`📊 [USER-DAO] User details:`, {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            hasPassword: !!user.password
        });

        return user;

    } catch (error) {
        const totalDuration = Date.now() - startTime;
        console.error(`❌ [USER-DAO] findUserByEmail failed for: ${email} (${totalDuration}ms)`);
        console.error(`❌ [USER-DAO] Error details:`, {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        if (error instanceof BadRequestError) {
            throw error;
        }

        // Handle specific MongoDB errors
        if (error.name === 'CastError') {
            console.error(`❌ [USER-DAO] MongoDB CastError for email: ${email}`);
            throw new BadRequestError("Invalid email format");
        }

        if (error.name === 'MongoNetworkError') {
            console.error(`❌ [USER-DAO] MongoDB network error for email: ${email}`);
            throw new Error("Database connection failed");
        }

        throw new Error(`Database query failed: ${error.message}`);
    }
};


export const findUserById = async (id) => {
    try {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new BadRequestError("User ID is required and must be a non-empty string");
        }

        const user = await User.findById(id.trim());

        if (!user) {
            console.log(`User not found: ${id}`);
            return null;
        }

        return user;

    } catch (error) {
        console.error("Error in findUserById:", error);

        if (error instanceof BadRequestError) {
            throw error;
        }

        throw new Error(`Database query failed: ${error.message}`);
    }
};

export const createUser = async (name, email, password) => {
    try {
        if (!name || !email || !password) {
            throw new BadRequestError("Please provide all fields");
        }

        const newUser = new User({
            name,
            email,
            password
        });

        const user = await newUser.save();
        return user;
    } catch (error) {
        console.error("Error in createUser:", error);

        if (error instanceof BadRequestError) {
            throw error;
        }

        throw new Error(`Database query failed: ${error.message}`);
    }
};