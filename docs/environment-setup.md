# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Paystack API Keys
PAYSTACK_PUBLIC_KEY=pk_test_3e87802dae281fbeb004f2b0f741a6e662aba103
PAYSTACK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gonana"
```

## Notes

- The public key is already configured in `lib/paystack.ts`
- Get your secret key from your Paystack dashboard
- Never commit `.env.local` to git
- For production, use live keys (starts with `pk_live_` and `sk_live_`)
