import { adminDb } from '@/lib/firebase-admin';

export interface CryptoKey {
    version: number;
    key: string;
    createdAt: string;
    status: 'active' | 'archived';
}

let keyCache: CryptoKey[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCryptoKeys(): Promise<CryptoKey[]> {
    // Return cached keys if valid
    if (keyCache && Date.now() - lastFetch < CACHE_TTL) {
        return keyCache;
    }

    try {
        const snapshot = await adminDb.collection('system_secrets').doc('crypto_keys').get();

        let keys: CryptoKey[] = [];

        if (snapshot.exists) {
            const data = snapshot.data();
            keys = (data?.keys as CryptoKey[]) || [];
        }

        // Always include environment variable key as version 0 fallback
        if (process.env.WALLET_MASTER_KEY) {
            const envKeyIndex = keys.findIndex(k => k.version === 0);
            const envKey: CryptoKey = {
                version: 0,
                key: process.env.WALLET_MASTER_KEY,
                createdAt: new Date().toISOString(),
                status: keys.length === 0 ? 'active' : 'archived' // Active only if no other keys
            };

            if (envKeyIndex === -1) {
                keys.push(envKey);
            } else {
                // Ensure env key matches expectation if validation needed, 
                // but usually we trust DB over Env if DB has entries.
                // Here we just ensure version 0 exists.
            }
        }

        if (keys.length === 0) {
            throw new Error("No crypto keys found in DB or Environment Variables");
        }

        // Sort by version desc
        keys.sort((a, b) => b.version - a.version);

        keyCache = keys;
        lastFetch = Date.now();
        return keys;
    } catch (e) {
        console.error("Failed to fetch keys", e);
        // Fallback to env key if DB fails
        if (process.env.WALLET_MASTER_KEY) {
            return [{
                version: 0,
                key: process.env.WALLET_MASTER_KEY,
                createdAt: new Date().toISOString(),
                status: 'active'
            }];
        }
        throw e;
    }
}

export async function getActiveKey(): Promise<CryptoKey> {
    const keys = await getCryptoKeys();
    // Use the highest version active key, or just the highest version if all archived (shouldn't happen)
    const active = keys.find(k => k.status === 'active') || keys[0];
    if (!active) throw new Error("No active key found");
    return active;
}

export async function getKeyByVersion(version: number): Promise<CryptoKey> {
    const keys = await getCryptoKeys();
    const key = keys.find(k => k.version === version);
    if (!key) throw new Error(`Key version ${version} not found`);
    return key;
}
