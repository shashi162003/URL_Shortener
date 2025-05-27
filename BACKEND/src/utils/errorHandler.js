
export const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

export class AppError extends Error {
    statusCode;
    isOperational;

    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict occurred") {
        super(message, 409);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

// Async wrapper middleware to catch async errors
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Request validation middleware
export const validateRequest = (schema) => {
    return (req, _res, next) => {
        try {
            const { error } = schema.validate(req.body);
            if (error) {
                throw new BadRequestError(error.details[0].message);
            }
            next();
        } catch (err) {
            next(err);
        }
    };
};