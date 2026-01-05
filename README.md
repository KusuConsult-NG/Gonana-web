# Gonana Marketplace

An agricultural marketplace platform built with Next.js, Firebase, and Paystack integration.

## Features

- 🌾 Agricultural product marketplace
- 💳 Secure payment processing (Paystack & Multi-currency Wallet)
- 🔐 Firebase Authentication with NextAuth
- 👤 User profiles with KYC verification (Prembly)
- 💰 Multi-currency wallet system (NGN, USD, USDT, USDC, ETH, BNB, MATIC)
- 🔗 Multi-chain crypto wallet generation (post-KYC)
- 📦 Order management and tracking
- 💬 Community feed with social features
- 📱 Responsive design with dark mode support
- 🗄️ Cloud database with Firebase Firestore

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Paystack account (get API keys from [dashboard.paystack.com](https://dashboard.paystack.com))

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials (see Environment Variables section below).

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Critical Variables:

- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **Firebase Config**: Get from Firebase Console → Project Settings
- **NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY**: Production key from Paystack dashboard
- **PAYSTACK_SECRET_KEY**: Production secret key (server-side only)

> ⚠️ **Security Note**: Never commit your `.env.local` file. Use `.env.example` as a template only.

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── (main)/          # Main application pages (marketplace, wallet, feed)
│   └── api/             # API routes (25+ endpoints)
├── components/          # Reusable React components
├── context/            # React context providers (Auth, Cart)
├── lib/                # Utility functions and configurations
│   ├── firebase.ts     # Firebase client SDK
│   ├── firebase-admin.ts # Firebase Admin SDK
│   ├── paystack.ts     # Paystack payment integration
│   └── crypto/         # Crypto wallet utilities
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Database

This application uses **Firebase Firestore** as its primary database. All data (users, products, orders, wallets, transactions) is stored in Firestore collections.

> **Note**: While `.env` files contain a `DATABASE_URL` variable, this is not used. The app exclusively uses Firebase Firestore.

**Key Collections:**
- `users` - User profiles and authentication data
- `products` - Product listings
- `orders` - Order history and status
- `wallets` - Multi-currency wallet balances
- `transactions` - Transaction history
- `cryptoWallets` - Crypto wallet addresses (post-KYC)
- `posts` - Community feed posts
- `encryptedKeys` - Encrypted private keys for crypto wallets

## API Routes

This app has **25+ API endpoints** covering authentication, products, orders, payments, wallet operations, KYC, crypto, and social features.

Most API routes require Firebase authentication via Bearer token, except:
- `/api/auth/*` - NextAuth endpoints
- `/api/products` (GET) - Public product listing
- `/api/signup` - User registration

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.**

### Authentication

Send Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Deployment

### Pre-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to production key (currently using test key)
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Set appropriate Firebase Firestore security rules (see `firestore.rules`)
- [ ] Configure Firebase Storage CORS for your domain
- [ ] Enable Paystack webhooks for async payment verification
- [ ] Un-mock KYC verification (enable real Prembly API calls in `/api/kyc/verify/route.ts`)
- [ ] Implement live exchange rates (replace hard-coded rates in `/api/orders/route.ts`)
- [ ] Set up Redis for production rate limiting (optional, falls back to in-memory)
- [ ] Verify Sentry error monitoring is working
- [ ] Run `npm run build` to verify production build
- [ ] Test all critical user flows manually

**See [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for detailed readiness assessment.**

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

This project is optimized for Vercel deployment:

```bash
vercel deploy --prod
```

Make sure to configure all environment variables in the Vercel dashboard.

## Testing

**Current Status**: Manual testing only (no automated tests).

See [TEST_AUTH.md](./TEST_AUTH.md) for authentication testing guide.

**Manual Test Checklist:**
1. Authentication flow (signup → login → logout)
2. Marketplace browsing and product details
3. Shopping cart and checkout
4. Wallet top-up and payments
5. Order creation and tracking
6. Community feed (create, like, comment)
7. Profile updates and file uploads
8. KYC submission and wallet generation

## Security

- All API routes protected with Firebase authentication
- Passwords never stored (Firebase Auth handles this)
- Private keys encrypted with AES-256-GCM before storage
- Security headers configured in `next.config.ts`
- HTTPS-only in production (enforced via headers)
- Rate limiting on sensitive endpoints (KYC, crypto operations)
- Input validation on all API endpoints
- Environment variables for sensitive data
- Firebase security rules for Firestore and Storage

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check for issues
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For support, email support@gonana.farm
