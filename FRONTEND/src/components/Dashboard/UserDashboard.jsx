import React, { useState, useEffect } from 'react';
import { getUserUrls } from '../../api/shortUrl.api';
import UrlForm from '../UrlForm';
import LoadingSpinner from '../LoadingSpinner';

const UserDashboard = ({ user, onLogout }) => {
    const [urls, setUrls] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedUrl, setCopiedUrl] = useState('');

    useEffect(() => {
        fetchUserUrls();
    }, []);

    const fetchUserUrls = async () => {
        try {
            console.log('🔄 [DASHBOARD] Fetching user URLs...');
            setIsLoading(true);
            setError('');

            const userUrls = await getUserUrls();
            setUrls(userUrls);
            console.log('✅ [DASHBOARD] URLs fetched successfully:', userUrls.length, 'URLs');

        } catch (error) {
            console.error('❌ [DASHBOARD] Failed to fetch URLs:', error);
            setError(error.message || 'Failed to load your URLs. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (url, urlId) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(urlId);
            console.log('✅ [DASHBOARD] URL copied to clipboard:', url);

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopiedUrl('');
            }, 2000);
        } catch (err) {
            console.error('❌ [DASHBOARD] Failed to copy URL:', err);
        }
    };

    const handleLogout = () => {
        console.log('🔄 [DASHBOARD] Logging out user...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        onLogout();
        console.log('✅ [DASHBOARD] User logged out successfully');
    };



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">URL Shortener Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-gray-700 font-medium">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* URL Creation Form */}
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Short URL</h2>
                        <div className="bg-white rounded-lg shadow p-6">
                            <UrlForm onUrlCreated={fetchUserUrls} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Your Shortened URLs</h2>
                        <p className="text-sm text-gray-600">
                            Manage and track all your shortened URLs in one place.
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 text-sm font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="bg-white rounded-lg shadow">
                            <LoadingSpinner size="medium" message="Loading your URLs..." />
                        </div>
                    ) : (
                        /* URLs List */
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {urls.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No URLs yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating your first shortened URL.
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {urls.map((url) => (
                                        <li key={url.id} className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                                {url.shortUrl}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {url.originalUrl}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500">
                                                        <span className="mr-4">
                                                            {url.clicks} clicks
                                                        </span>
                                                        <span>
                                                            Created {new Date(url.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => copyToClipboard(url.shortUrl, url.id)}
                                                        className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer ${copiedUrl === url.id
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                                            }`}
                                                    >
                                                        {copiedUrl === url.id ? (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>Copy</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
