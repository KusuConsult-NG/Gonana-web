# API Documentation

**Gonana Marketplace API Reference**  
**Base URL**: `https://your-domain.com/api`  
**Version**: 0.1.0

## Authentication

Most API endpoints require authentication via Firebase ID token.

### Header Format
```
Authorization: Bearer <firebase-id-token>
```

### Public Endpoints (No Auth Required)
- `GET /api/products` - List all products
- `POST /api/signup` - User registration
- `POST /api/auth/*` - NextAuth endpoints

---

## Endpoints

### Authentication & Users

#### `POST /api/signup`
Create a new user account with auto-generated wallet.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "buyer" | "seller" | "both"
}
```

**Response (201):**
```json
{
  "userId": "abc123",
  "email": "user@example.com",
  "walletCreated": true
}
```

---

#### `GET /api/user`
Get current user profile.

**Auth**: Required  
**Response (200):**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "buyer",
  "isKycVerified": false,
  "createdAt": "2026-01-05T10:00:00Z"
}
```

---

#### `PUT /api/user`
Update user profile.

**Auth**: Required  
**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Agricultural products seller",
  "phoneNumber": "+234-800-000-0000"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### Products

#### `GET /api/products`
List all approved products.

**Auth**: Not required  
**Query Params**: None (pagination not implemented)

**Response (200):**
```json
[
  {
    "id": "prod-123",
    "name": "Fresh Tomatoes",
    "description": "Organic tomatoes from local farm",
    "price": 5000,
    "currency": "NGN",
    "quantity": 100,
    "unit": "kg",
    "category": "Vegetables",
    "sellerId": "seller-id",
    "sellerName": "John's Farm",
    "images": ["https://..."],
    "location": "Lagos, Nigeria",
    "isApproved": true,
    "createdAt": "2026-01-05T10:00:00Z"
  }
]
```

---

#### `POST /api/products`
Create a new product listing.

**Auth**: Required  
**Body:**
```json
{
  "name": "Fresh Tomatoes",
  "description": "Organic tomatoes",
  "price": 5000,
  "quantity": 100,
  "unit": "kg",
  "category": "Vegetables",
  "location": "Lagos, Nigeria",
  "deliveryMode": "logistics" | "pickup",
  "images": ["https://firebase-url/..."]
}
```

**Response (201):**
```json
{
  "id": "prod-123",
  "sellerId": "current-user-id",
  "isApproved": false,
  ...
}
```

---

#### `GET /api/products/[id]`
Get single product details.

**Auth**: Not required  
**Response (200):**
```json
{
  "id": "prod-123",
  "name": "Fresh Tomatoes",
  ...
}
```

---

### Orders

#### `POST /api/orders`
Create a new order and process payment.

**Auth**: Required  
**Body:**
```json
{
  "items": [
    {
      "id": "prod-123",
      "name": "Fresh Tomatoes",
      "quantity": 5
    }
  ],
  "paymentMethod": "wallet" | "paystack",
  "walletCurrency": "NGN" | "USD" | "USDT" | "USDC" | "ETH" | "BNB" | "MATIC",
  "shippingMethod": "logistics" | "pickup",
  "network": "ethereum" | "polygon" | "bsc"
}
```

**Response (201):**
```json
{
  "orderId": "order-123",
  "totalAmount": 27500,
  "currency": "NGN",
  "paymentCurrency": "USDT",
  "paymentAmount": 18.33,
  "status": "PAID",
  "items": [ ... ],
  "createdAt": "2026-01-05T10:00:00Z"
}
```

**Errors:**
- `400` - Insufficient stock, insufficient wallet balance
- `404` - Product not found, wallet not found

---

### Wallet

#### `POST /api/wallet/topup`
Add funds to wallet (after Paystack payment verification).

**Auth**: Required (Firebase Bearer token)  
**Body:**
```json
{
  "amount": 10000,
  "currency": "NGN" | "USD" | "USDT" | "USDC"
}
```

**Response (200):**
```json
{
  "id": "wallet-id",
  "balanceNGN": 10000,
  "balanceUSD": 0,
  "balanceUSDT": 0,
  "balanceUSDC": 0,
  "updatedAt": "2026-01-05T10:00:00Z"
}
```

---

### Payments

#### `GET /api/payments/verify?reference={ref}`
Verify Paystack payment transaction.

**Auth**: Not required (but should be called from authenticated context)  
**Query Params:**
- `reference` (string, required): Paystack transaction reference

**Response (200):**
```json
{
  "verified": true,
  "status": "success",
  "amount": 10000,
  "currency": "NGN",
  "reference": "ref-123",
  "paid_at": "2026-01-05T10:00:00Z",
  "customer": {
    "email": "user@example.com"
  }
}
```

**Errors:**
- `400` - Payment not successful or verification failed

---

### KYC Verification

#### `POST /api/kyc/verify`
Verify user identity and generate crypto wallet.

**Auth**: Required  
**Rate Limit**: 3 requests per hour per IP  
**Body:**
```json
{
  "documentType": "national_id" | "drivers_license" | "passport",
  "documentNumber": "12345678901",
  "image": "base64-encoded-image-optional"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Identity Verified & Wallets Generated",
  "cryptoWallet": {
    "ethereum": {
      "address": "0x1234...",
      "network": "ethereum"
    },
    "polygon": { ... },
    "bsc": { ... }
  },
  "fiatWallet": {
    "bankName": "Gonana Virtual Bank",
    "accountNumber": "9912345678",
    "accountName": "Gonana User abc1"
  }
}
```

**Note**: ⚠️ Currently returns mock success. Enable real Prembly API in production.

---

### Crypto Wallet

#### `POST /api/crypto/generate-wallet`
Generate multi-chain crypto wallet (requires KYC).

**Auth**: Required (Firebase Bearer token)  
**Rate Limit**: 5 requests per hour  

**Response (201):**
```json
{
  "success": true,
  "message": "Crypto wallet generated successfully",
  "addresses": {
    "ethereum": "0x1234...",
    "polygon": "0x1234...",
    "bsc": "0x1234..."
  }
}
```

**Errors:**
- `403` - KYC verification required
- `400` - Wallet already exists

---

#### `GET /api/crypto/generate-wallet`
Get existing crypto wallet addresses.

**Auth**: Required (Firebase Bearer token)  

**Response (200):**
```json
{
  "exists": true,
  "addresses": {
    "ethereum": { "address": "0x1234...", "network": "ethereum" },
    "polygon": { "address": "0x1234...", "network": "polygon" },
    "bsc": { "address": "0x1234...", "network": "bsc" }
  }
}
```

---

#### `POST /api/crypto/withdraw`
Withdraw crypto from custodial wallet to external address.

**Auth**: Required (Firebase Bearer token)  
**Rate Limit**: 10 requests per hour  

**Body:**
```json
{
  "network": "ethereum" | "polygon" | "bsc",
  "token": "USDT" | "USDC" | "ETH" | "MATIC" | "BNB",
  "toAddress": "0xRecipient...",
  "amount": "10.5"
}
```

**Response (200):**
```json
{
  "success": true,
  "transactionHash": "0xtxhash...",
  "amount": "10.5",
  "token": "USDT",
  "network": "polygon",
  "status": "pending"
}
```

**Errors:**
- `400` - Insufficient balance
- `403` - Wallet not generated or KYC not verified

---

### Community Feed

#### `GET /api/posts`
Get community feed posts.

**Auth**: Required  
**Query Params**: None (pagination not implemented)

**Response (200):**
```json
[
  {
    "id": "post-123",
    "content": "Check out my new tomato harvest!",
    "images": ["https://..."],
    "authorId": "user-id",
    "authorName": "John Doe",
    "authorAvatar": "https://...",
    "likes": 15,
    "comments": 3,
    "hasLiked": false,
    "createdAt": "2026-01-05T10:00:00Z"
  }
]
```

---

#### `POST /api/posts`
Create a new feed post.

**Auth**: Required  
**Body:**
```json
{
  "content": "Check out my new harvest!",
  "images": ["https://firebase-url/..."],
  "productId": "optional-product-id"
}
```

**Response (201):**
```json
{
  "id": "post-123",
  "authorId": "current-user-id",
  "content": "...",
  "likes": 0,
  "comments": 0,
  "createdAt": "2026-01-05T10:00:00Z"
}
```

---

#### `POST /api/posts/[id]/like`
Like or unlike a post.

**Auth**: Required  
**Body:**
```json
{
  "action": "like" | "unlike"
}
```

**Response (200):**
```json
{
  "success": true,
  "likes": 16
}
```

---

#### `POST /api/posts/[id]/comment`
Add a comment to a post.

**Auth**: Required  
**Body:**
```json
{
  "content": "Great harvest!"
}
```

**Response (201):**
```json
{
  "id": "comment-123",
  "postId": "post-123",
  "content": "Great harvest!",
  "authorId": "user-id",
  "authorName": "Jane Smith",
  "createdAt": "2026-01-05T10:00:00Z"
}
```

---

### File Upload

#### `POST /api/upload`
Upload file to Firebase Storage.

**Auth**: Required  
**Body (multipart/form-data):**
```
file: <binary-file>
path: "profiles" | "products" | "posts"
```

**Response (200):**
```json
{
  "url": "https://firebasestorage.googleapis.com/...",
  "path": "profiles/user-id/avatar.jpg"
}
```

**Errors:**
- `400` - No file provided or invalid path
- `413` - File too large

---

#### `DELETE /api/upload?path={filepath}`
Delete file from Firebase Storage.

**Auth**: Required  
**Query Params:**
- `path` (string, required): File path in storage

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### Two-Factor Authentication

#### `POST /api/auth/2fa/setup`
Generate 2FA secret and QR code.

**Auth**: Required  

**Response (200):**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,..."
}
```

---

#### `POST /api/auth/2fa/verify`
Verify 2FA code and enable 2FA.

**Auth**: Required  
**Body:**
```json
{
  "token": "123456",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

---

#### `GET /api/auth/2fa/status`
Check if user has 2FA enabled.

**Auth**: Required  

**Response (200):**
```json
{
  "enabled": true,
  "enabledAt": "2026-01-05T10:00:00Z"
}
```

---

### Utilities

#### `GET /api/exchange-rates`
Get current exchange rates.

**Auth**: Not required  

**Response (200):**
```json
{
  "NGN_USD": 0.00066,
  "ETH_USD": 3500,
  "BNB_USD": 600,
  "MATIC_USD": 0.75,
  "timestamp": "2026-01-05T10:00:00Z"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, insufficient funds, etc.) |
| 401 | Unauthorized (missing or invalid auth token) |
| 403 | Forbidden (KYC required, insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

## Rate Limiting

Sensitive endpoints have rate limits:
- KYC operations: 3 requests/hour
- Crypto operations: 5-10 requests/hour
- General API: 100 requests/15 minutes (if Redis configured)

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining  
- `X-RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Testing

Use test credentials from `TEST_AUTH.md` for development testing.

**Paystack Test Keys:**
- Public: `pk_test_...` (configured in `.env.local`)
- Secret: `sk_test_...` (server-side)

**Test Cards**: See [Paystack Documentation](https://paystack.com/docs/payments/test-payments/)
