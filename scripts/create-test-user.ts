import { adminAuth, adminDb } from '../lib/firebase-admin';

/**
 * Script to create a test user in Firebase Auth and Firestore
 * Run with: npx tsx scripts/create-test-user.ts
 */

const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'USER',
};

async function createTestUser() {
    try {
        console.log('🔄 Creating test user...');
        console.log('Email:', TEST_USER.email);

        let uid: string;
        let userCreated = false;

        // Try to create user in Firebase Auth
        try {
            const userRecord = await adminAuth.createUser({
                email: TEST_USER.email,
                password: TEST_USER.password,
                displayName: TEST_USER.name,
                emailVerified: true,
            });
            uid = userRecord.uid;
            userCreated = true;
            console.log('✅ User created in Firebase Auth with UID:', uid);
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.log('⚠️  User already exists in Firebase Auth, updating password...');
                // Get existing user
                const existingUser = await adminAuth.getUserByEmail(TEST_USER.email);
                uid = existingUser.uid;
                // Update password
                await adminAuth.updateUser(uid, {
                    password: TEST_USER.password,
                });
                console.log('✅ Password updated for existing user, UID:', uid);
            } else {
                throw error;
            }
        }

        // Create or update user in Firestore
        const userRef = adminDb.collection('users').doc(uid);
        const userDoc = await userRef.get();

        const userData = {
            email: TEST_USER.email,
            name: TEST_USER.name,
            role: TEST_USER.role,
            isKycVerified: false,
            image: null,
            updatedAt: new Date().toISOString(),
        };

        if (!userDoc.exists) {
            await userRef.set({
                ...userData,
                createdAt: new Date().toISOString(),
            });
            console.log('✅ User document created in Firestore');
        } else {
            await userRef.update(userData);
            console.log('✅ User document updated in Firestore');
        }

        // Create wallet if it doesn't exist
        const walletRef = adminDb.collection('wallets').doc(uid);
        const walletDoc = await walletRef.get();

        if (!walletDoc.exists) {
            await walletRef.set({
                userId: uid,
                balanceNGN: 100000, // Give test user 100,000 NGN
                balanceUSD: 0,
                balanceUSDT: 0,
                balanceUSDC: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            console.log('✅ Wallet created with 100,000 NGN balance');
        } else {
            console.log('ℹ️  Wallet already exists');
        }

        console.log('\n✨ Test user setup complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', TEST_USER.email);
        console.log('🔑 Password:', TEST_USER.password);
        console.log('🆔 UID:', uid);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nYou can now log in to the application with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        process.exit(1);
    }
}

createTestUser();
