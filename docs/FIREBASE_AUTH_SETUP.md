# Firebase Authentication Setup for Production

## ✅ What Changed

We've switched from Prisma/NextAuth to **Firebase Authentication + Firestore**.

### Benefits:
- ✅ Works on Vercel (no database needed)
- ✅ User authentication built-in
- ✅ Firestore for user data + wallets
- ✅ Scalable and serverless
- ✅ Already configured with service account

---

## 🔧 What You Need

Make sure these are in Vercel environment variables:

```env
# Firebase Server-side (From service account)
FIREBASE_PROJECT_ID=gonana-web
FIREBASE_PRIVATE_KEY_ID=e9eb8349ab36483e19e77bd170422a518132635d
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@gonana-web.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=104010792556787523186
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."

# Firebase Client-side (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=gonana-web.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=gonana-web
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=gonana-web.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## 📊 Data Structure

### Firestore Collections:

**`users` collection:**
```javascript
{
  id: "uid",
  email: "user@example.com",
  name: "John Doe",
  firstName: "John",
  lastName: "Doe",
  role: "USER" | "FARMER" | "ADMIN",
  isKycVerified: false,
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

**`wallets` collection:**
```javascript
{
  userId: "uid",
  balanceNGN: 0,
  balanceUSD: 0,
  balanceUSDT: 0,
  balanceUSDC: 0,
  createdAt: "ISO timestamp"
}
```

---

## 🚀 How It Works Now

### Signup Flow:
1. User fills signup form
2. API calls Firebase Admin SDK to create user
3. User created in Firebase Authentication
4. User document created in Firestore (`users` collection)
5. Wallet created in Firestore (`wallets` collection)
6. Success response sent to frontend

### Login Flow:
1. Frontend uses Firebase Client SDK to sign in
2. Gets ID token from Firebase
3. Can verify token on backend if needed
4. User data fetched from Firestore

---

## ⚠️ Important Notes

1. **No SQL Database Needed** - Everything is in Firebase
2. **Prisma No Longer Used** - Can remove later if you want
3. **NextAuth Optional** - Can keep for Google OAuth or remove
4. **Firebase Rules** - Set up security rules in Firebase Console

---

## 🔐 Firebase Security Rules

Go to Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own wallet
    match /wallets/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ✅ Next Steps

1. **Test signup** - Should work on Vercel now
2. **Add Firebase client config** to Vercel
3. **Set Firestore security rules** in Console
4. **Optional:** Remove Prisma dependencies if not needed

---

## 🆘 Troubleshooting

**500 Error on signup:**
- Check Firebase credentials are in Vercel
- Verify `FIREBASE_PRIVATE_KEY` includes quotes and newlines

**User created but no wallet:**
- Check Firestore security rules
- Verify Firebase Admin SDK has permissions

**Can't log in:**
- Ensure Firebase client config is set
- Check browser console for Firebase errors
