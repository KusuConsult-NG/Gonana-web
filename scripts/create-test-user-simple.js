/**
 * Alternative script to create a test user using Firebase Auth REST API
 * This doesn't require Firebase Admin SDK service account
 * Run with: node scripts/create-test-user-simple.js
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });


const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
};

async function createTestUser() {
    try {
        console.log('🔄 Creating test user with Firebase Auth REST API...');
        console.log('Email:', TEST_USER.email);

        // Get Firebase API key from environment
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        if (!apiKey) {
            console.error('❌ Missing NEXT_PUBLIC_FIREBASE_API_KEY environment variable');
            process.exit(1);
        }

        // Try to create user with Firebase Auth RES API
        const signUpResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_USER.email,
                password: TEST_USER.password,
                returnSecureToken: true,
            }),
        });

        const signUpData = await signUpResponse.json();

        if (!signUpResponse.ok) {
            if (signUpData.error?.message?.includes('EMAIL_EXISTS')) {
                console.log('⚠️  User already exists in Firebase Auth');
                console.log('Attempting to sign in to verify credentials...');

                // Try signing in instead
                const signInResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: TEST_USER.email,
                        password: TEST_USER.password,
                        returnSecureToken: true,
                    }),
                });

                const signInData = await signInResponse.json();

                if (signInResponse.ok) {
                    console.log('✅ User exists and credentials are correct');
                    console.log('🆔 UID:', signInData.localId);
                } else {
                    console.error('⚠️  User exists but password may be different');
                    console.error('You may need to update the password manually in Firebase Console');
                    console.error('Or delete the user and run this script again');
                }
            } else {
                console.error('❌ Error creating user:', signUpData.error);
                process.exit(1);
            }
        } else {
            const uid = signUpData.localId;
            console.log('✅ User created successfully in Firebase Auth');
            console.log('🆔 UID:', uid);
        }

        console.log('\n✨ Setup complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', TEST_USER.email);
        console.log('🔑 Password:', TEST_USER.password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📝 Note: The user document in Firestore will be created automatically');
        console.log('when you first log in through the application.');
        console.log('\nTry logging in at: http://localhost:3000/login');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
