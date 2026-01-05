import { redis } from './redis';

export type EndpointType = 'auth' | 'crypto' | 'public' | 'upload';

export const RATE_LIMITS: Record<EndpointType, { limit: number; window: number }> = {
    auth: { limit: 10, window: 60 * 1000 }, // 10 requests per minute
    crypto: { limit: 20, window: 60 * 1000 }, // 20 tx attempts per minute (high but needed for status checks)
    upload: { limit: 5, window: 60 * 1000 }, // 5 uploads per minute
    public: { limit: 100, window: 60 * 1000 }, // 100 general requests per minute
};

// In-memory fallback if Redis is missing
const memoryStore = new Map<string, { count: number; expiry: number }>();
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes block

export async function checkRateLimit(
    ip: string,
    type: EndpointType = 'public'
): Promise<{ success: boolean; reason?: string, remaining: number }> {
    const config = RATE_LIMITS[type];
    const key = `rate_limit:${type}:${ip}`;
    const blockKey = `blocked:${ip}`;
    const now = Date.now();

    if (redis) {
        // Check if blocked
        const isBlocked = await redis.get(blockKey);
        if (isBlocked) {
            return { success: false, reason: "IP blocked due to abuse", remaining: 0 };
        }

        // Increment usage
        const current = await redis.incr(key);

        // Set expiry on first request
        if (current === 1) {
            await redis.expire(key, Math.ceil(config.window / 1000));
        }

        if (current > config.limit) {
            // Abuse detection: if they exceed limit by 2x, block them
            if (current > config.limit * 2) {
                await redis.set(blockKey, 'true', 'PX', BLOCK_DURATION);
                return { success: false, reason: "IP blocked due to excessive abuse", remaining: 0 };
            }
            return { success: false, reason: "Rate limit exceeded", remaining: 0 };
        }

        return { success: true, remaining: config.limit - current };

    } else {
        // In-memory fallback
        // Clean up expired
        // (Simplified logic for brevity)
        const record = memoryStore.get(key);

        if (record && record.expiry > now) {
            if (record.count >= config.limit) {
                return { success: false, reason: "Rate limit exceeded", remaining: 0 };
            }
            record.count++;
            return { success: true, remaining: config.limit - record.count };
        } else {
            memoryStore.set(key, { count: 1, expiry: now + config.window });
            return { success: true, remaining: config.limit - 1 };
        }
    }
}
