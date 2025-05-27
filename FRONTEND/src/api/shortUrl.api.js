import axiosInstance, { createRetryWrapper } from "../utils/axiosInstance";

export const createShortUrl = async (url) => {
    try {
        // Validate URL format
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL provided');
        }

        // Create retry wrapper for this request
        const retryWrapper = createRetryWrapper(3, 1000);

        const response = await retryWrapper(async () => {
            return await axiosInstance.post("/api/shortUrl/create", { url });
        });

        // Validate response structure
        if (!response.data || !response.data.data || !response.data.data.shortUrl) {
            throw new Error('Invalid response format from server');
        }

        return response.data.data.shortUrl;
    } catch (error) {
        // Enhanced error handling with user-friendly messages
        if (error.isClientError && error.status === 400) {
            throw new Error('Please provide a valid URL');
        } else if (error.isClientError && error.status === 401) {
            throw new Error('You must be logged in to create short URLs. Please log in and try again.');
        } else if (error.isClientError && error.status === 403) {
            throw new Error('You do not have permission to create short URLs.');
        } else if (error.isClientError && error.status === 422) {
            throw new Error('The URL format is invalid. Please check and try again.');
        } else if (error.isServerError) {
            throw new Error('Server is temporarily unavailable. Please try again later.');
        } else if (error.isNetworkError) {
            throw new Error('Network connection failed. Please check your internet connection.');
        } else if (error.isTimeoutError) {
            throw new Error('Request timed out. Please try again.');
        }

        // Re-throw the error with original message if it's already user-friendly
        throw error;
    }
};

export const createCustomShortUrl = async (url, customUrl) => {
    try {
        // Validate inputs
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL provided');
        }

        if (!customUrl || typeof customUrl !== 'string') {
            throw new Error('Invalid custom URL provided');
        }

        console.log('🔄 [API] Creating custom short URL:', { url, customUrl });

        // Create retry wrapper for this request
        const retryWrapper = createRetryWrapper(3, 1000);

        const response = await retryWrapper(async () => {
            return await axiosInstance.post("/api/shortUrl/custom", { url, customUrl });
        });

        // Validate response structure
        if (!response.data || !response.data.data || !response.data.data.shortUrl) {
            throw new Error('Invalid response format from server');
        }

        console.log('✅ [API] Custom short URL created successfully:', response.data.data.shortUrl);
        return response.data.data.shortUrl;

    } catch (error) {
        console.error('❌ [API] Custom short URL creation failed:', error);

        // Enhanced error handling with user-friendly messages
        if (error.isClientError && error.status === 400) {
            throw new Error('Please provide valid URL and custom URL');
        } else if (error.isClientError && error.status === 401) {
            throw new Error('You must be logged in to create custom short URLs. Please log in and try again.');
        } else if (error.isClientError && error.status === 403) {
            throw new Error('You do not have permission to create custom short URLs.');
        } else if (error.isClientError && error.status === 409) {
            throw new Error('This custom URL already exists. Please choose a different one.');
        } else if (error.isClientError && error.status === 422) {
            throw new Error('The custom URL format is invalid. Please check and try again.');
        } else if (error.isServerError) {
            throw new Error('Server is temporarily unavailable. Please try again later.');
        } else if (error.isNetworkError) {
            throw new Error('Network connection failed. Please check your internet connection.');
        } else if (error.isTimeoutError) {
            throw new Error('Request timed out. Please try again.');
        }

        // Re-throw the error with original message if it's already user-friendly
        throw error;
    }
};

export const getUserUrls = async () => {
    try {
        console.log('🔄 [API] Fetching user URLs...');

        // Create retry wrapper for this request
        const retryWrapper = createRetryWrapper(3, 1000);

        const response = await retryWrapper(async () => {
            return await axiosInstance.get("/api/shortUrl/user");
        });

        // Validate response structure
        if (!response.data || !response.data.data || !Array.isArray(response.data.data.urls)) {
            throw new Error('Invalid response format from server');
        }

        console.log('✅ [API] User URLs fetched successfully:', response.data.data.urls.length, 'URLs');
        return response.data.data.urls;

    } catch (error) {
        console.error('❌ [API] Failed to fetch user URLs:', error);

        // Enhanced error handling with user-friendly messages
        if (error.isClientError && error.status === 401) {
            throw new Error('You must be logged in to view your URLs. Please log in and try again.');
        } else if (error.isClientError && error.status === 403) {
            throw new Error('You do not have permission to view URLs.');
        } else if (error.isServerError) {
            throw new Error('Server is temporarily unavailable. Please try again later.');
        } else if (error.isNetworkError) {
            throw new Error('Network connection failed. Please check your internet connection.');
        } else if (error.isTimeoutError) {
            throw new Error('Request timed out. Please try again.');
        }

        // Re-throw the error with original message if it's already user-friendly
        throw error;
    }
};