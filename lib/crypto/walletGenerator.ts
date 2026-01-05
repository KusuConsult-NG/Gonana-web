// Crypto Wallet Generator with Encryption
import { ethers } from 'ethers';
import crypto from 'crypto';
import { getActiveKey, getKeyByVersion } from '@/lib/security/keyManager';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 16;

export interface EncryptedKeyData {
    encryptedData: string;
    iv: string;
    salt: string;
    authTag: string;
    keyVersion?: number;
}

/**
 * Generate a new crypto wallet for a user
 */
export async function generateWalletForUser(userId: string): Promise<{
    address: string;
    encrypted: EncryptedKeyData;
}> {
    // Generate new random wallet
    const wallet = ethers.Wallet.createRandom();

    // Extract keys
    const privateKey = wallet.privateKey;
    const address = wallet.address;

    // Encrypt private key
    const encrypted = await encryptPrivateKey(privateKey, userId);

    return {
        address,
        encrypted,
    };
}

/**
 * Encrypt private key using AES-256-GCM
 */
export async function encryptPrivateKey(
    privateKey: string,
    userId: string
): Promise<EncryptedKeyData> {
    const keyData = await getActiveKey();
    const masterKey = keyData.key;

    if (!masterKey) {
        throw new Error('Encryption key not found');
    }

    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive encryption key from master key + user ID
    const key = crypto.pbkdf2Sync(
        masterKey + userId,
        salt,
        100000, // iterations
        KEY_LENGTH,
        'sha512'
    );

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        authTag: authTag.toString('hex'),
        keyVersion: keyData.version,
    };
}

/**
 * Decrypt private key (Deprecated Sync version - Throws Error)
 */
export function decryptPrivateKey(
    encryptedData: string,
    iv: string,
    salt: string,
    authTag: string,
    userId: string,
    keyVersion?: number
): string {
    throw new Error("Logic update needed: decryptPrivateKey must be async now. Call decryptPrivateKeyAsync instead.");
}

/**
 * Decrypt private key Async
 */
export async function decryptPrivateKeyAsync(
    encryptedData: string,
    iv: string,
    salt: string,
    authTag: string,
    userId: string,
    keyVersion: number = 0 // Default to 0 (Env Var) if missing
): Promise<string> {
    let masterKey: string;

    try {
        const keyData = await getKeyByVersion(keyVersion);
        masterKey = keyData.key;
    } catch (e) {
        throw e;
    }

    // Derive the same key
    const key = crypto.pbkdf2Sync(
        masterKey + userId,
        Buffer.from(salt, 'hex'),
        100000,
        KEY_LENGTH,
        'sha512'
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(iv, 'hex')
    );

    // Set authentication tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    // Decrypt
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Get wallet instance from encrypted key
 */
export async function getWalletFromEncrypted(
    encryptedData: string,
    iv: string,
    salt: string,
    authTag: string,
    userId: string,
    provider?: ethers.Provider,
    keyVersion?: number
): Promise<ethers.Wallet> {
    const privateKey = await decryptPrivateKeyAsync(
        encryptedData,
        iv,
        salt,
        authTag,
        userId,
        keyVersion
    );

    if (provider) {
        return new ethers.Wallet(privateKey, provider);
    }

    return new ethers.Wallet(privateKey);
}
