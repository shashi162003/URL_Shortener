import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageTransition = ({ children, isLoading = false, loadingMessage = 'Loading...' }) => {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Small delay for smooth transition
            const timer = setTimeout(() => {
                setShowContent(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="large" message={loadingMessage} />
            </div>
        );
    }

    return (
        <div className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {children}
        </div>
    );
};

export default PageTransition;
