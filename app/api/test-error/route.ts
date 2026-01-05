import { NextRequest, NextResponse } from "next/server";

/**
 * Test endpoint for Sentry error monitoring
 * GET /api/test-error
 * 
 * Triggers a test error to verify Sentry integration is working
 * Remove or protect this endpoint in production
 */
export async function GET(req: NextRequest) {
    const testType = req.nextUrl.searchParams.get("type") || "basic";

    try {
        switch (testType) {
            case "basic":
                throw new Error("[Sentry Test] Basic error - If you see this in Sentry, monitoring is working!");

            case "async":
                await Promise.reject(new Error("[Sentry Test] Async error test"));
                break;

            case "unhandled":
                // Simulate unhandled promise rejection
                setTimeout(() => {
                    throw new Error("[Sentry Test] Unhandled error");
                }, 100);
                return NextResponse.json({ message: "Unhandled error triggered (async)" });

            case "custom":
                const error = new Error("[Sentry Test] Custom error with context");
                // Add custom context if Sentry is properly configured
                if (typeof window !== 'undefined' && (window as any).Sentry) {
                    (window as any).Sentry.setContext("test", {
                        testType,
                        timestamp: new Date().toISOString(),
                    });
                }
                throw error;

            default:
                throw new Error("[Sentry Test] Unknown error type");
        }
    } catch (error) {
        console.error("[Test Error]:", error);

        // Re-throw to ensure Sentry captures it
        throw error;
    }

    return NextResponse.json({
        message: "This should not be reached"
    });
}
