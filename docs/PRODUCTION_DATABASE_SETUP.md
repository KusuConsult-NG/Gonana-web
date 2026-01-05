# Production Database Setup

**Database**: Firebase Firestore (Cloud NoSQL Database)  
**Status**: ✅ Already Configured

## Overview

**You're already using a production-ready database!** This app uses **Firebase Firestore**, a fully managed, scalable cloud database. There's no need to migrate to PostgreSQL or MySQL.

> **Note**: The `DATABASE_URL` variable in `.env` files is **not used** by this application. It's leftover configuration that can be ignored.

---

## Current Setup

### What's Configured
- ✅ **Firebase Admin SDK** (`lib/firebase-admin.ts`)
- ✅ **Firebase Client SDK** (`lib/firebase.ts`)
- ✅ **Firestore Collections** (users, products, orders, wallets, etc.)
- ✅ **Firebase Storage** (for file uploads)
- ✅ **Security Rules** (`firestore.rules`, `storage.rules`)

### Environment Variables Required
```bash
# Firebase Client (Public - NEXT_PUBLIC_*)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Server-side only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

---

## Firestore Collections

### Core Collections

| Collection | Purpose | Document ID | Key Fields |
|------------|---------|-------------|------------|
| `users` | User profiles | User ID | email, firstName, lastName, role, isKycVerified |
| `wallets` | Wallet balances | User ID | balanceNGN, balanceUSD, balanceUSDT, balanceUSDC |
| `products` | Product listings | Auto-generated | name, price, quantity, sellerId, isApproved |
| `orders` | Order history | Auto-generated | buyerId, items[], totalAmount, status, paymentMethod |
| `transactions` | Transaction log | Auto-generated | walletId, type, amount, currency, status |
| `cryptoWallets` | Crypto addresses | User ID | addresses{ethereum, polygon, bsc} |
| `encryptedKeys` | Encrypted keys | User ID | encryptedData, iv, salt, authTag |
| `posts` | Community feed | Auto-generated | authorId, content, images[], likes, comments |
| `fiatWallets` | Virtual accounts | User ID | accountNumber, bankName, provider |

### Subcollections
- `posts/{postId}/comments` - Comments on feed posts
- `posts/{postId}/likes` - Like records

---

## Security Rules

### Firestore Rules (`firestore.rules`)
Located at: `/Users/mac/Gonana web/gonana-marketplace/firestore.rules`

**Key Rules:**
- ✅ Users can only read/write their own data
- ✅ Products require authentication to create
- ✅ Orders can only be created by authenticated users
- ✅ Wallet data is strictly user-specific
- ✅ Public read for approved products
- ✅ Encrypted keys are write-once, read-never

**Deploy Rules:**
```bash
cd /Users/mac/Gonana\ web/gonana-marketplace
firebase deploy --only firestore:rules
```

---

## Firebase Storage Rules

For file uploads (profile pictures, product images):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Public read
      allow write: if request.auth != null; // Auth required
    }
  }
}
```

**Deploy:**
```bash
firebase deploy --only storage
```

---

## Production Deployment Checklist

### 1. Firebase Console Setup
- [ ] Create Firebase project (if not already done)
- [ ] Enable Firestore in Firestore Database section
- [ ] Enable Firebase Storage
- [ ] Enable Authentication providers (Email/Password, Google)
- [ ] Set up billing (Blaze plan for production, free tier available)

### 2. Firestore Configuration
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Create composite indexes if needed (Firestore will prompt)
- [ ] Set up automated backups (Firebase Console → Firestore → Backups)
- [ ] Configure data retention policies

### 3. Storage Configuration
- [ ] Deploy storage rules: `firebase deploy --only storage`
- [ ] Configure CORS for your production domain
- [ ] Set up lifecycle policies for old files (optional)

### 4. Monitoring
- [ ] Enable Firestore usage monitoring in Firebase Console
- [ ] Set up budget alerts (Firebase → Billing)
- [ ] Monitor read/write operations
- [ ] Track storage usage

---

## Database Migrations

**Firestore is schema-less**, so there are no traditional migrations. However:

### Adding New Fields
Fields are added automatically when documents are created/updated:
```typescript
// No migration needed, just start writing new field
await adminDb.collection('users').doc(userId).update({
  newField: 'value'
});
```

### Renaming Fields (Requires Data Migration)
```bash
# Use Firebase Admin SDK or custom script
# Example: Rename 'oldField' to 'newField'

import { adminDb } from '@/lib/firebase-admin';

async function migrateField() {
  const snapshot = await adminDb.collection('users').get();
  
  const batch = adminDb.batch();
  snapshot.docs.forEach(doc => {
    if (doc.data().oldField !== undefined) {
      batch.update(doc.ref, {
        newField: doc.data().oldField,
        oldField: FieldValue.delete()
      });
    }
  });
  
  await batch.commit();
}
```

---

## Backup & Recovery

### Automated Backups
1. Go to Firebase Console → Firestore Database → Backups
2. Enable automated daily backups
3. Retain for 30+ days
4. Store in Cloud Storage bucket

### Manual Export
```bash
# Export entire database
gcloud firestore export gs://your-bucket/backup-$(date +%Y%m%d)

# Export specific collections
gcloud firestore export gs://your-bucket/backup \
  --collection-ids=users,products,orders
```

### Restore
```bash
gcloud firestore import gs://your-bucket/backup/backup-20260105
```

---

## Performance Optimization

### Indexing
Firestore automatically creates single-field indexes. For compound queries:

**Example**: Query products by category and price
```typescript
// This query requires a composite index
const products = await adminDb
  .collection('products')
  .where('category', '==', 'Vegetables')
  .orderBy('price', 'asc')
  .get();
```

**Create Index**: Firebase will provide a link in the error message when you run this query the first time.

### Best Practices
- ✅ Use pagination for large result sets
- ✅ Denormalize data for read-heavy operations
- ✅ Use batch writes for multiple updates
- ✅ Limit query result size
- ✅ Use subcollections for large arrays

---

## Costs & Limits

### Free Tier (Spark Plan)
- 1 GB stored data
- 50K document reads/day
- 20K document writes/day
- 20K document deletes/day

### Blaze Plan (Pay-as-you-go)
**Firestore:**
- $0.18/GB stored
- $0.06 per 100K reads
- $0.18 per 100K writes
- $0.02 per 100K deletes

**Storage:**
- $0.026/GB stored
- $0.12/GB downloaded

**Estimate**: For 1000 daily active users:
- ~500K-1M reads/day = $0.30-$0.60/day
- ~100K-200K writes/day = $0.18-$0.36/day
- **Total**: ~$15-30/month

---

## Troubleshooting

### "Insufficient Permissions" Error
- Check Firestore security rules
- Verify user is authenticated
- Ensure user ID matches document owner

### "Document Not Found"
- Verify collection and document ID
- Check if document was created successfully
- Use Firebase Console to inspect Firestore data

### Slow Queries
- Check if composite index is needed
- Reduce query result size (add limits)
- Use pagination

### "Quota Exceeded"
- Upgrade to Blaze plan
- Optimize read/write operations
- Implement caching strategy

---

## Differences from SQL Databases

| Feature | Firestore | PostgreSQL/MySQL |
|---------|-----------|------------------|
| **Schema** | Schema-less (NoSQL) | Schema-based (SQL) |
| **Queries** | Limited joins | Complex joins |
| **Scalability** | Auto-scaling | Manual scaling |
| **Hosting** | Cloud (Google) | Self-hosted or cloud |
| **Cost** | Pay per operation | Pay per hour/instance |
| **Migrations** | Not needed | Required |
| **Real-time** | Built-in | Requires setup |

---

## Why Firestore for Gonana?

✅ **Pros:**
- Fully managed (no server maintenance)
- Auto-scaling (handles growth automatically)
- Real-time updates (for feeds, notifications)
- Built-in authentication integration
- Global CDN for fast access
- Generous free tier

⚠️ **Cons:**
- Limited complex queries
- Can be expensive at very high scale
- Vendor lock-in (Google Cloud)

---

## Next Steps

1. ✅ **Database is ready** - No action needed!
2. [ ] Review and deploy security rules
3. [ ] Set up automated backups
4. [ ] Configure monitoring and alerts
5. [ ] Optimize indexes for your queries

---

## Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/rules)
- [Pricing Calculator](https://firebase.google.com/pricing)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)
