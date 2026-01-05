import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * GET /api/trending
 * Get trending hashtags from posts
 */
export async function GET(req: NextRequest) {
    try {
        // Get recent posts (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const postsSnapshot = await adminDb
            .collection('posts')
            .where('createdAt', '>=', oneWeekAgo.toISOString())
            .limit(200)
            .get();

        // Extract hashtags and count frequency
        const hashtagCounts: Record<string, number> = {};

        postsSnapshot.docs.forEach(doc => {
            const content = doc.data().content || '';
            const hashtags = content.match(/#\w+/g) || [];

            hashtags.forEach((tag: string) => {
                const normalized = tag.toLowerCase();
                hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
            });
        });

        // Convert to array and sort by count
        const trending = Object.entries(hashtagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10

        return NextResponse.json(trending);
    } catch (error) {
        console.error("Get trending topics error:", error);
        return NextResponse.json(
            { error: "Failed to fetch trending topics" },
            { status: 500 }
        );
    }
}
