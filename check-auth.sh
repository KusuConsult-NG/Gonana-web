#!/bin/bash

echo "🔍 Checking Gonana Marketplace Auth Configuration..."
echo ""

# Check .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
else
    echo "❌ .env.local NOT FOUND"
fi

# Check critical env vars
echo ""
echo "📋 Environment Variables Check:"

if grep -q "NEXTAUTH_SECRET" .env.local 2>/dev/null; then
    echo "✅ NEXTAUTH_SECRET is set"
else
    echo "❌ NEXTAUTH_SECRET is MISSING"
fi

if grep -q "NEXTAUTH_URL" .env.local 2>/dev/null; then
    echo "✅ NEXTAUTH_URL is set"
else
    echo "❌ NEXTAUTH_URL is MISSING"
fi

if grep -q "DATABASE_URL" .env.local 2>/dev/null; then
    echo "✅ DATABASE_URL is set"
else
    echo "❌ DATABASE_URL is MISSING"
fi

# Check database
echo ""
echo "🗄️  Database Check:"

if [ -f prisma/dev.db ]; then
    echo "✅ Database file exists (prisma/dev.db)"
else
    echo "❌ Database file NOT FOUND"
    echo "   Run: npx prisma db push"
fi

# Check Prisma Client
echo ""
echo "📦 Prisma Client Check:"

if [ -d node_modules/.prisma/client ]; then
    echo "✅ Prisma Client generated"
else
    echo "❌ Prisma Client NOT generated"
    echo "   Run: npx prisma generate"
fi

echo ""
echo "🔧 Quick Fix Commands:"
echo "   1. npx prisma generate"
echo "   2. npx prisma db push"
echo "   3. npm run dev"
