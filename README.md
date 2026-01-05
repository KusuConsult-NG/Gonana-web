# Gonana Marketplace

An agricultural marketplace platform built with Next.js, Firebase, and Paystack integration.

## Features

- 🌾 Agricultural product marketplace
- 💳 Secure payment processing (Paystack & Wallet)
- 🔐 Firebase Authentication
- 👤 User profiles and KYC verification
- 💰 Multi-currency wallet system (NGN, USD, USDT, USDC)
- 📦 Order management and tracking
- 📱 Responsive design with dark mode support

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

4. Generate Prisma client:

```bash
npm run postinstall
```

5. Run the development server:

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
│   ├── (auth)/          # Authentication pages
│   ├── (main)/          # Main application pages
│   └── api/             # API routes
├── components/          # Reusable React components
├── context/            # React context providers
├── lib/                # Utility functions and configurations
├── prisma/             # Database schema
└── public/             # Static assets
```

## API Routes

All API routes under `/api/*` require Firebase authentication via Bearer token, except:
- `/api/auth/*` - NextAuth endpoints
- `/api/products` (GET) - Public product listing
- `/api/signup` - User registration

### Authentication

Send Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Deployment

### Pre-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` to production key
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Migrate from SQLite to PostgreSQL/MySQL (update `DATABASE_URL`)
- [ ] Run `npm run build` to verify production build
- [ ] Set appropriate Firebase security rules
- [ ] Configure CORS for your domain in Firebase
- [ ] Enable Paystack webhooks for payment verification

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

## Security

- All API routes are protected with Firebase authentication
- Passwords are never stored (Firebase Auth handles this)
- Security headers configured in `next.config.ts`
- HTTPS-only in production (enforced via headers)
- Input validation on all API endpoints
- Environment variables for sensitive data

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` to check for issues
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For support, email support@gonana.farm
