# Production Database Setup for Vercel

## The Problem

You're getting 500 errors because:
1. **SQLite doesn't work on Vercel** - It's file-based and Vercel is serverless
2. **No production database configured** - `DATABASE_URL` is missing on Vercel

## Quick Fix Options

### Option 1: Use Vercel Postgres (Free Tier) ⭐ RECOMMENDED

**Steps:**
1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose **Free** tier (Hobby)
6. Click **Create**

Vercel will automatically:
- Create the database
- Add `DATABASE_URL` to your environment variables
- Connect everything

**Then:**
```bash
# Redeploy your app
git push
```

---

### Option 2: Use Neon (Free PostgreSQL)

1. Go to https://neon.tech
2. Create free account
3. Create new database
4. Copy connection string
5. Add to Vercel:
   - Settings → Environment Variables
   - Name: `DATABASE_URL`
   - Value: Your connection string
   - Save

---

### Option 3: Use Supabase (Free PostgreSQL)

1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Go to Settings → Database
5. Copy connection string (in "Connection pooling" mode)
6. Add to Vercel as `DATABASE_URL`

---

## After Adding Database

### Update Prisma Schema for PostgreSQL

Your current schema uses SQLite. Update it:

**File:** `prisma/schema.prisma`

Change:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

To:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Commit changes
git add prisma/schema.prisma
git commit -m "chore: Switch to PostgreSQL for production"
git push
```

---

## Temporary Fix (For Testing Only)

If you just want to test quickly, you can use Vercel's built-in Postgres:

1. Vercel Dashboard → Storage → Create Postgres
2. It auto-connects
3. Redeploy

---

## Recommended: Vercel Postgres

**Why?**
✅ Free tier available
✅ Auto-configured with your project
✅ Zero setup needed
✅ Built into Vercel
✅ Good for prototypes

**How?**
1. Vercel Dashboard → Your Project → Storage
2. Create Database → Postgres
3. Wait 2 minutes
4. Redeploy (git push)

Done! 🚀
