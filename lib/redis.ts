import Redis from 'ioredis';

const getRedisClient = () => {
    if (!process.env.REDIS_URL) {
        console.warn("Redis URL not found in environment variables. Falling back to in-memory mode (not production ready).");
        return null;
    }

    try {
        const client = new Redis(process.env.REDIS_URL);
        client.on('error', (err) => console.error('Redis Client Error', err));
        return client;
    } catch (error) {
        console.error("Failed to initialize Redis", error);
        return null;
    }
};

export const redis = getRedisClient();
