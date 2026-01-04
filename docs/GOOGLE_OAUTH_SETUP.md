# Google OAuth Setup Guide

## 🔑 How to Get Google OAuth Credentials

Follow these steps to enable "Sign in with Google" on your Gonana Marketplace:

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select a Project
- Click the project dropdown at the top
- Click "New Project" or select your existing project
- Project name: `Gonana Marketplace` (or your preferred name)

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Select "External" (for public app)
- Click "Create"

Fill in:
- **App name**: Gonana Marketplace
- **User support email**: Your email
- **Developer contact**: Your email
- **Authorized domains**: 
  - For local: Leave empty
  - For production: `your-domain.com` and `vercel.app`
- Click "Save and Continue"
- Skip "Scopes" (click "Save and Continue")
- Skip "Test users" (click "Save and Continue")

### 5. Create OAuth Client ID
- Go to "APIs & Services" → "Credentials"
- Click "+ CREATE CREDENTIALS"
- Select "OAuth client ID"
- Application type: "Web application"
- Name: `Gonana Web App`

**Authorized JavaScript origins:**
```
http://localhost:3000
https://your-vercel-domain.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
https://your-vercel-domain.vercel.app/api/auth/callback/google
```

- Click "Create"

### 6. Copy Your Credentials
You'll see a popup with:
- **Client ID**: Copy this (looks like: `123456789-abc.apps.googleusercontent.com`)
- **Client Secret**: Copy this (looks like: `GOCSPX-xxxxx`)

### 7. Add to Environment Variables

#### For Local Development (.env.local):
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### For Vercel:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   - `GOOGLE_CLIENT_ID` with your client ID
   - `GOOGLE_CLIENT_SECRET` with your client secret
4. Select all environments (Production, Preview, Development)
5. Redeploy your app

### 8. Test It Out
1. Restart your dev server: `npm run dev`
2. Go to `/login` or `/signup`
3. Click "Sign in with Google"
4. You should see the Google sign-in popup

## 🔧 Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that your redirect URI exactly matches in Google Console
- Format: `http://localhost:3000/api/auth/callback/google`

**Error: "Access blocked: This app's request is invalid"**
- Make sure you've configured the OAuth consent screen
- Add your email as a test user if using "External" type

**Error: "invalid_client"**
- Double-check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Make sure there are no extra spaces or quotes

## 📝 Important Notes

- Google OAuth requires HTTPS in production (Vercel provides this automatically)
- You can add multiple redirect URIs for different environments
- Keep your Client Secret secure - never commit it to git
- Users signing in with Google will automatically get a wallet created

## ✅ What Happens When Users Sign In

1. User clicks "Sign in with Google"
2. Google authentication popup appears
3. User approves access
4. User is created in your database (if new)
5. A wallet is automatically created for them
6. User is redirected to the marketplace

---

Need help? Check the [NextAuth Google Provider docs](https://next-auth.js.org/providers/google)
