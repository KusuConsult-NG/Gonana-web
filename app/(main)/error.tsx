"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Something went wrong!</h2>
            <p className="text-secondary-text-light dark:text-secondary-text-dark mb-6">
                We apologize for the inconvenience. An unexpected error occurred while loading this page.
            </p>
            <button
                onClick={() => reset()}
                className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
