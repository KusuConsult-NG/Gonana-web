# Firebase Integration Guide

This document explains how to use Firebase in the Gonana Marketplace application.

## Setup Complete ✅

The following Firebase services have been configured:

1. **Firebase Authentication** - User authentication and authorization
2. **Cloud Firestore** - NoSQL database for storing application data
3. **Firebase Storage** - File storage for images, documents, and other media

## Environment Variables

All Firebase configuration is stored in `.env.local`:

### Server-side (Admin SDK)
```env
FIREBASE_PROJECT_ID=gonana-web
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gonana-web.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="..." # Full private key
```

### Client-side (Public)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gonana-web.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gonana-web
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gonana-web.firebasestorage.app
```

**⚠️ Important:** You need to get the client-side values from your Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`gonana-web`)
3. Go to Project Settings > General
4. Under "Your apps" > Web apps, copy the config values

## Usage

### Server-side (API Routes)

```typescript
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';

// Verify a user's token
const decodedToken = await adminAuth.verifyIdToken(token);

// Write to Firestore
await adminDb.collection('users').doc(uid).set(data);

// Upload to Storage
const url = await uploadToStorage(buffer, 'path/file.jpg', 'image/jpeg');
```

### Client-side (Components)

```typescript
import { auth, db, storage } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

// Sign in a user
await signInWithEmailAndPassword(auth, email, password);

// Read from Firestore
const docSnap = await getDoc(doc(db, 'users', uid));

// Upload file
await uploadBytes(ref(storage, 'path/file.jpg'), file);
```

## Example API Routes

Two example API routes have been created:

### 1. `/api/firebase-example`
Demonstrates token verification and authentication:
```bash
curl -X GET http://localhost:3000/api/firebase-example \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### 2. `/api/upload`
Handles file uploads to Firebase Storage:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/file.jpg"
```

## Next Steps

1. **Get Firebase Client Config**: Update `.env.local` with your client-side API keys from Firebase Console
2. **Enable Authentication Methods**: Go to Firebase Console > Authentication and enable your preferred sign-in methods (Email/Password, Google, etc.)
3. **Configure Storage Rules**: Set up security rules in Firebase Console > Storage
4. **Configure Firestore Rules**: Set up security rules in Firebase Console > Firestore Database

## Security Best Practices

✅ **DO:**
- Keep `.env.local` gitignored (already configured)
- Use Firebase Admin SDK only in API routes (server-side)
- Validate user input before storing in Firestore
- Set up proper security rules in Firebase Console

❌ **DON'T:**
- Commit service account credentials to version control
- Use Admin SDK in client-side code
- Trust client-side data without server validation
- Leave Storage/Firestore publicly writable

## Troubleshooting

If you encounter errors:

1. **"Failed to initialize app"**: Check that all environment variables are set correctly
2. **"Permission denied"**: Configure Firebase security rules for Storage/Firestore
3. **"Invalid token"**: Ensure the user is authenticated and token hasn't expired

## Resources

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firebase JavaScript SDK Docs](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
