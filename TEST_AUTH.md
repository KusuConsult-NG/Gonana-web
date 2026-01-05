# Testing Email/Password Authentication

## Test Credentials

### Login Test:
1. Go to http://localhost:3000/login
2. Use these credentials:
   - Email: `test@gonana.com`
   - Password: `anything` (any password works in prototype mode)
3. Click "Sign in to Dashboard"
4. Should redirect to marketplace

### Signup Test:
1. Go to http://localhost:3000/signup
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@test.com
   - Role: Buyer/Seller/Both
   - Password: password123
   - Confirm Password: password123
   - Check "agree to terms"
3. Click "Create Account"
4. Should create account and redirect to marketplace

## What Should Work Now:
✅ Login with email/password
✅ Signup with new account
✅ Auto-create wallet on signup
✅ Google button hidden (no credentials configured)

## Note:
- Password validation is minimal (prototype mode)
- Users auto-created on first login
- All users get a wallet automatically
