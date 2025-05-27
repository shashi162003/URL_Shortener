import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://url-shortener-rk77.onrender.com",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// Request interceptor for adding auth tokens, logging, etc.
axiosInstance.interceptors.request.use(
    (config) => {
        // Log request details in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        }

        // Add timestamp to requests
        config.metadata = { startTime: new Date() };

        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        // Log response details in development
        if (process.env.NODE_ENV === 'development') {
            const duration = new Date() - response.config.metadata.startTime;
            console.log(`✅ Response received in ${duration}ms:`, response.status);
        }

        return response;
    },
    (error) => {
        // Enhanced error handling
        const { response, request, message } = error;

        // Log error details in development
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ API Error:', error);
        }

        // Create enhanced error object
        const enhancedError = {
            message: 'An unexpected error occurred',
            status: null,
            data: null,
            isNetworkError: false,
            isTimeoutError: false,
            isServerError: false,
            isClientError: false,
            originalError: error
        };

        if (response) {
            // Server responded with error status
            enhancedError.status = response.status;
            enhancedError.data = response.data;

            switch (response.status) {
                case 400:
                    enhancedError.message = response.data?.message || 'Bad request. Please check your input.';
                    enhancedError.isClientError = true;
                    break;
                case 401:
                    enhancedError.message = 'Unauthorized. Please log in again.';
                    enhancedError.isClientError = true;
                    // Clear auth token on 401
                    localStorage.removeItem('authToken');
                    // Optionally redirect to login
                    // window.location.href = '/login';
                    break;
                case 403:
                    enhancedError.message = 'Forbidden. You don\'t have permission to access this resource.';
                    enhancedError.isClientError = true;
                    break;
                case 404:
                    enhancedError.message = 'Resource not found.';
                    enhancedError.isClientError = true;
                    break;
                case 422:
                    enhancedError.message = response.data?.message || 'Validation error. Please check your input.';
                    enhancedError.isClientError = true;
                    break;
                case 429:
                    enhancedError.message = 'Too many requests. Please try again later.';
                    enhancedError.isClientError = true;
                    break;
                case 500:
                    enhancedError.message = 'Internal server error. Please try again later.';
                    enhancedError.isServerError = true;
                    break;
                case 502:
                    enhancedError.message = 'Bad gateway. The server is temporarily unavailable.';
                    enhancedError.isServerError = true;
                    break;
                case 503:
                    enhancedError.message = 'Service unavailable. Please try again later.';
                    enhancedError.isServerError = true;
                    break;
                case 504:
                    enhancedError.message = 'Gateway timeout. The server took too long to respond.';
                    enhancedError.isServerError = true;
                    break;
                default:
                    if (response.status >= 500) {
                        enhancedError.message = 'Server error. Please try again later.';
                        enhancedError.isServerError = true;
                    } else if (response.status >= 400) {
                        enhancedError.message = response.data?.message || 'Client error. Please check your request.';
                        enhancedError.isClientError = true;
                    }
            }
        } else if (request) {
            // Network error or no response received
            enhancedError.isNetworkError = true;

            if (message.includes('timeout')) {
                enhancedError.message = 'Request timeout. Please check your internet connection and try again.';
                enhancedError.isTimeoutError = true;
            } else if (message.includes('Network Error')) {
                enhancedError.message = 'Network error. Please check your internet connection.';
            } else {
                enhancedError.message = 'Unable to connect to the server. Please try again later.';
            }
        } else {
            // Something else happened
            enhancedError.message = message || 'An unexpected error occurred.';
        }

        // Show user-friendly error notification (you can customize this)
        if (typeof window !== 'undefined' && window.showErrorNotification) {
            window.showErrorNotification(enhancedError.message);
        }

        return Promise.reject(enhancedError);
    }
);

// Helper function to check if error is retryable
export const isRetryableError = (error) => {
    return error.isNetworkError ||
        error.isTimeoutError ||
        error.isServerError ||
        (error.status >= 500 && error.status < 600);
};

// Helper function to create retry logic
export const createRetryWrapper = (maxRetries = 3, delay = 1000) => {
    return async (requestFn) => {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;

                if (attempt === maxRetries || !isRetryableError(error)) {
                    throw error;
                }

                // Exponential backoff
                const waitTime = delay * Math.pow(2, attempt - 1);
                console.log(`⏳ Retrying request in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);

                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        throw lastError;
    };
};

export default axiosInstance;