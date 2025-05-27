# Error Handling Implementation Guide

This document outlines the comprehensive error handling implementation across the URL Shortener backend application.

## Overview

The error handling system provides:

- ✅ Consistent error responses
- ✅ Proper HTTP status codes
- ✅ Input validation at all layers
- ✅ Database error handling
- ✅ Async error catching
- ✅ Graceful shutdown
- ✅ Logging and monitoring

## Architecture

### 1. Error Classes (`src/utils/errorHandler.js`)

Custom error classes extending the base `AppError`:

```javascript
// Base error class
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true)
}

// Specific error types
class BadRequestError extends AppError      // 400
class UnauthorizedError extends AppError    // 401
class NotFoundError extends AppError        // 404
class ConflictError extends AppError        // 409
```

### 2. Error Handler Middleware

```javascript
export const errorHandler = (err, req, res, next) => {
  // Handles all errors and sends consistent responses
};
```

### 3. Async Wrapper

```javascript
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Implementation by Layer

### Controllers (`src/controllers/shortUrl.controller.js`)

- ✅ Try-catch blocks around all async operations
- ✅ Input validation with custom error classes
- ✅ Proper error propagation using `next(error)`
- ✅ Structured JSON responses

Example:

```javascript
export const createShortUrl = async (req, res, next) => {
  try {
    validateUrl(url);
    const shortUrl = await createShortUrlService(url);
    res.status(201).json({ success: true, data: shortUrl });
  } catch (error) {
    next(error);
  }
};
```

### Services (`src/services/ShortUrl.service.js`)

- ✅ Input validation
- ✅ Retry mechanism for duplicate key errors
- ✅ Proper error propagation
- ✅ Logging for debugging

Features:

- Validates all inputs before processing
- Handles MongoDB duplicate key errors with retry logic
- Comprehensive error logging

### DAO Layer (`src/dao/shortUrl.dao.js`)

- ✅ Database operation error handling
- ✅ MongoDB-specific error handling
- ✅ Input validation
- ✅ Proper error classification

Handles:

- Validation errors → `BadRequestError`
- Duplicate key errors → `ConflictError`
- Cast errors → `BadRequestError`
- Network errors → Generic error with details

### Routes (`src/routes/shortUrl.route.js`)

- ✅ Async wrapper for all route handlers
- ✅ Automatic error catching and forwarding

```javascript
router.post("/", asyncHandler(createShortUrl));
```

### Application Level (`app.js`)

- ✅ Global error handlers for uncaught exceptions
- ✅ Graceful shutdown handling
- ✅ Request logging middleware
- ✅ 404 handler for undefined routes
- ✅ Health check endpoint

### Database Configuration (`src/config/mongo.config.js`)

- ✅ Connection error handling
- ✅ Environment validation
- ✅ Connection event listeners
- ✅ Graceful disconnection

## Error Response Format

All errors return a consistent JSON structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

Success responses follow:

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Success message"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `301` - Redirect (for short URLs)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `500` - Internal Server Error

## Testing

Run the error handling tests:

```bash
node test-error-handling.js
```

Tests cover:

- Input validation
- Error class functionality
- Service layer error handling
- Helper function validation

## Monitoring and Logging

### Console Logging

- Request logging with timestamps
- Error logging with stack traces
- Database operation logging
- Connection status logging

### Error Categories

1. **Validation Errors** - Input validation failures
2. **Database Errors** - MongoDB operation failures
3. **Business Logic Errors** - Application-specific errors
4. **System Errors** - Network, memory, etc.

## Best Practices Implemented

1. **Fail Fast** - Validate inputs early
2. **Consistent Responses** - Uniform error format
3. **Proper Status Codes** - Meaningful HTTP codes
4. **Error Propagation** - Use `next(error)` in Express
5. **Graceful Degradation** - Handle failures gracefully
6. **Logging** - Comprehensive error logging
7. **Security** - Don't expose sensitive information

## Environment Variables Required

```env
MONGODB_URI=mongodb://localhost:27017/urlshortener
PORT=3000
APP_URL=http://localhost:3000/
```

## Health Check

Access the health check endpoint:

```
GET /health
```

Response:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Graceful Shutdown

The application handles:

- `SIGTERM` - Termination signal
- `SIGINT` - Interrupt signal (Ctrl+C)

Shutdown process:

1. Stop accepting new connections
2. Close existing connections
3. Close database connections
4. Exit process

## Browser Caching Fix

### Issue: Clicks Not Incrementing in Browser

The application was experiencing an issue where clicks would increment when accessed via terminal (curl) but not when accessed through a browser.

### Root Cause

- **HTTP 301 Redirects**: The app was using `res.redirect(301, url)` (permanent redirect)
- **Browser Caching**: Browsers aggressively cache 301 redirects
- **No Server Requests**: After first visit, browser used cached redirect without making new requests

### Solution Implemented

1. **Changed to HTTP 302**: `res.redirect(302, url)` (temporary redirect)
2. **Added Anti-Caching Headers**:
   ```javascript
   res.set({
     "Cache-Control": "no-cache, no-store, must-revalidate",
     Pragma: "no-cache",
     Expires: "0",
   });
   ```

### Result

- ✅ Each browser visit now makes a new request to the server
- ✅ Clicks increment properly in browsers
- ✅ Analytics tracking works correctly

## Future Enhancements

Consider adding:

- Rate limiting error handling
- Request ID tracking
- Error metrics collection
- External error monitoring (e.g., Sentry)
- Structured logging (e.g., Winston)
- Error alerting system
