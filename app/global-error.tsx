
"use client";

import { AlertCircle } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                        <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
                    <p className="mb-6 text-gray-600">
                        A critical error occurred.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Try again
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-8 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-w-2xl">
                            {error.message}
                            {error.stack}
                        </pre>
                    )}
                </div>
            </body>
        </html>
    );
}
