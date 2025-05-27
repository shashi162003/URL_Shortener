import { useState } from 'react'
import { createShortUrl, createCustomShortUrl } from '../api/shortUrl.api'

const UrlForm = ({ onUrlCreated }) => {

    const [url, setUrl] = useState('')
    const [customUrl, setCustomUrl] = useState('')
    const [shortUrl, setShortUrl] = useState('')
    const [isCopied, setIsCopied] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isCopying, setIsCopying] = useState(false)
    const [error, setError] = useState('')
    const [useCustomUrl, setUseCustomUrl] = useState(false)

    const updateUrl = (url) => {
        setUrl(url)
        // Clear error when user starts typing
        if (error) {
            setError('')
        }
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let shortUrlResult;

            if (useCustomUrl && customUrl.trim()) {
                // Create custom short URL
                console.log('🔄 [URLFORM] Creating custom short URL:', customUrl);
                shortUrlResult = await createCustomShortUrl(url, customUrl.trim());
            } else {
                // Create regular short URL
                console.log('🔄 [URLFORM] Creating regular short URL');
                shortUrlResult = await createShortUrl(url);
            }

            setShortUrl(shortUrlResult);
            console.log('✅ [URLFORM] Short URL created successfully:', shortUrlResult);

            // Call the callback to refresh the URL list in dashboard
            if (onUrlCreated && typeof onUrlCreated === 'function') {
                onUrlCreated();
            }
        } catch (error) {
            console.error('❌ [URLFORM] Error creating short URL:', error);
            setError(error.message || 'Failed to create short URL. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const copyToClipboard = async () => {
        setIsCopying(true);
        try {
            await navigator.clipboard.writeText(shortUrl);
            setIsCopied(true);
            // Reset the copied state after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        } finally {
            setIsCopying(false);
        }
    }

    // Simple inline spinner for buttons
    const ButtonSpinner = () => (
        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    return (
        <div>
            <form className="space-y-4" onSubmit={submitHandler}>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                        Enter your long URL
                    </label>
                    <input
                        type="url"
                        id="url"
                        placeholder="https://example.com/very-long-url-that-needs-shortening"
                        onChange={(e) => updateUrl(e.target.value)}
                        value={url}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Custom URL Toggle */}
                <div className="mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={useCustomUrl}
                            onChange={(e) => setUseCustomUrl(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Use custom URL (optional)
                        </span>
                    </label>
                </div>

                {/* Custom URL Input */}
                {useCustomUrl && (
                    <div className="mb-4">
                        <label htmlFor="customUrl" className="block text-sm font-medium text-gray-700 mb-2">
                            Custom URL
                        </label>
                        <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                                localhost:3000/
                            </span>
                            <input
                                type="text"
                                id="customUrl"
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="fakeamazon"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                pattern="[a-zA-Z0-9-_]+"
                                title="Only letters, numbers, hyphens, and underscores are allowed"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Example: If you enter "fakeamazon", your short URL will be localhost:3000/fakeamazon
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !url.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <ButtonSpinner />
                            <span>Shortening...</span>
                        </>
                    ) : (
                        <span>Shorten URL</span>
                    )}
                </button>
            </form>

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 text-red-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}

            {shortUrl && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Your shortened URL:</p>
                    <div className="flex items-center">
                        <input
                            type="text"
                            readOnly
                            value={shortUrl}
                            className="flex-1 p-2 bg-white border border-gray-300 rounded-l-lg focus:outline-none"
                        />
                        <button
                            disabled={isCopying}
                            className={`flex items-center justify-center text-white p-2 rounded-r-lg h-full focus:outline-none focus:ring-2 transition-all duration-300 ease-in-out transform cursor-pointer disabled:cursor-not-allowed ${isCopied
                                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500 scale-105'
                                : isCopying
                                    ? 'bg-gray-500'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 hover:scale-105'
                                }`}
                            onClick={copyToClipboard}
                        >
                            {isCopying ? (
                                <div className="flex items-center space-x-1">
                                    <ButtonSpinner />
                                    <span>Copying...</span>
                                </div>
                            ) : isCopied ? (
                                <div className="flex items-center space-x-1">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    <span>Copied!</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-1">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <span>Copy</span>
                                </div>
                            )}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Share this link with anyone to redirect them to your original URL
                    </p>
                </div>
            )}


        </div>
    )
}

export default UrlForm