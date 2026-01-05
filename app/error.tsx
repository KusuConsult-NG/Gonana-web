"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to Sentry (already configured in instrumentation.ts)
        console.error('Error boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-secondary-text-light dark:text-secondary-text-dark mb-6">
                        We encountered an unexpected error. Please try again.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={reset}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => (window.location.href = "/")}
                        className="w-full bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-700 text-text-light dark:text-text-dark font-semibold py-3 px-6 rounded-lg border border-border-light dark:border-border-dark transition-colors"
                    >
                        Go to Homepage
                    </button>
                </div>

                {process.env.NODE_ENV === "development" && error.message && (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-left">
                        <p className="text-xs font-mono text-red-800 dark:text-red-300 break-all">
                            {error.message}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
