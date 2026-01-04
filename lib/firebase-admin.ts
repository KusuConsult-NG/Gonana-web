import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`,
};

// Initialize the app only if it hasn't been initialized yet
export const adminApp = getApps().length === 0
    ? initializeApp(firebaseAdminConfig)
    : getApps()[0];

// Export admin services
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

// Helper functions for common operations

/**
 * Verify a Firebase ID token
 */
export async function verifyIdToken(token: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying token:', error);
        throw error;
    }
}

/**
 * Create a custom token for a user
 */
export async function createCustomToken(uid: string, claims?: object) {
    try {
        const customToken = await adminAuth.createCustomToken(uid, claims);
        return customToken;
    } catch (error) {
        console.error('Error creating custom token:', error);
        throw error;
    }
}

/**
 * Upload file to Firebase Storage
 */
export async function uploadToStorage(
    file: Buffer,
    destination: string,
    contentType?: string
) {
    try {
        const bucket = adminStorage.bucket();
        const fileRef = bucket.file(destination);

        await fileRef.save(file, {
            metadata: {
                contentType: contentType || 'application/octet-stream',
            },
        });

        // Make the file publicly accessible
        await fileRef.makePublic();

        return fileRef.publicUrl();
    } catch (error) {
        console.error('Error uploading to storage:', error);
        throw error;
    }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFromStorage(filePath: string) {
    try {
        const bucket = adminStorage.bucket();
        await bucket.file(filePath).delete();
        return true;
    } catch (error) {
        console.error('Error deleting from storage:', error);
        throw error;
    }
}

export default { adminApp, adminAuth, adminDb, adminStorage };
