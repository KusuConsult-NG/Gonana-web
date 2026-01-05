# Testing Guide - Gonana Marketplace

**Test Status**: Manual testing only (no automated tests)  
**Last Updated**: January 5, 2026

## Quick Start

```bash
cd /Users/mac/Gonana\ web/gonana-marketplace
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test Credentials

### Existing Test User
- **Email**: `test@gonana.com`
- **Password**: `anything` (any password works in prototype mode)

### Create New Test User
1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in the form with any details
3. Use a unique email (e.g., `testuser2@example.com`)
4. Password validation is minimal in dev mode

---

## Comprehensive Test Checklist

### 1. Authentication Flow ✅

#### Signup
- [ ] Navigate to `/signup`
- [ ] Fill form: First Name, Last Name, Email, Password, Role
- [ ] Check "agree to terms"
- [ ] Click "Create Account"
- [ ] **Expected**: Redirect to marketplace, auto-created wallet

#### Login
- [ ] Navigate to `/login`
- [ ] Enter email: `test@gonana.com`
- [ ] Enter any password
- [ ] Click "Sign in to Dashboard"
- [ ] **Expected**: Redirect to marketplace, session active

#### Logout
- [ ] Click profile menu (top right)
- [ ] Click "Logout"
- [ ] **Expected**: Redirect to homepage, session cleared

#### Session Persistence
- [ ] Log in
- [ ] Refresh page
- [ ] **Expected**: Still logged in
- [ ] Close browser, reopen
- [ ] **Expected**: Still logged in (if "remember me" enabled)

---

### 2. Marketplace Features 🛒

#### Browse Products
- [ ] Navigate to `/marketplace`
- [ ] **Expected**: See list of products with images, prices
- [ ] Scroll through products
- [ ] **Expected**: All products display correctly

#### Product Details
- [ ] Click on any product
- [ ] **Expected**: Navigate to `/product/[id]`
- [ ] Verify: Image, name, price, description, seller info display
- [ ] Check: Add to cart button visible

#### Create Product (Seller Only)
- [ ] Navigate to `/sell`
- [ ] Fill in product form:
  - Name: "Test Tomatoes"
  - Description: "Fresh organic tomatoes"
  - Price: 5000
  - Quantity: 100
  - Unit: "kg"
  - Category: "Vegetables"
  - Location: "Lagos"
- [ ] Upload images
- [ ] Click "Submit"
- [ ] **Expected**: Product created, shows in marketplace (pending approval)

---

### 3. Shopping Cart & Checkout 💳

#### Add to Cart
- [ ] On product detail page, click "Add to Cart"
- [ ] **Expected**: Success notification
- [ ] Navigate to `/cart`
- [ ] **Expected**: Product appears in cart

#### Update Quantity
- [ ] In cart, increase/decrease quantity
- [ ] **Expected**: Total updates automatically

#### Remove from Cart
- [ ] Click "Remove" on cart item
- [ ] **Expected**: Item removed, cart updates

#### Checkout - Wallet Payment
- [ ] Ensure wallet has sufficient balance (top up if needed)
- [ ] In cart, click "Proceed to Checkout"
- [ ] Navigate to `/checkout`
- [ ] Select payment method: "Wallet"
- [ ] Select currency: NGN or USDT/USDC
- [ ] Select shipping: "Logistics" or "Pickup"
- [ ] Click "Place Order"
- [ ] **Expected**: 
  - Order created
  - Wallet balance deducted
  - Product quantity reduced
  - Redirect to `/order-confirmation/[id]`

#### Checkout - Paystack Payment
- [ ] In checkout, select "Paystack"
- [ ] Click "Pay with Paystack"
- [ ] **Expected**: Paystack popup opens
- [ ] Use test card: `4084084084084081` (success)
- [ ] **Expected**: Payment successful, order created

**Test Cards** (from Paystack):
- Success: `4084084084084081`
- Decline: `5060666666666666666`

---

### 4. Wallet Features 💰

#### View Wallet Balance
- [ ] Navigate to `/wallet`
- [ ] **Expected**: See balances for NGN, USD, USDT, USDC, ETH, etc.
- [ ] **Expected**: Transaction history displays

#### Top Up Wallet (Paystack)
- [ ] In `/wallet`, click "Top Up"
- [ ] Enter amount: 10000 NGN
- [ ] Click "Fund Wallet"
- [ ] **Expected**: Paystack popup
- [ ] Complete payment with test card
- [ ] **Expected**: Wallet balance increases, transaction logged

#### Transaction History
- [ ] In `/wallet`, scroll to transactions
- [ ] **Expected**: Recent transactions (deposits, payments) display with:
  - Type (DEPOSIT, PAYMENT)
  - Amount
  - Currency
  - Status
  - Timestamp

---

### 5. KYC & Crypto Wallet Features 🔐

#### Submit KYC
- [ ] Navigate to `/kyc`
- [ ] Select document type: "National ID"
- [ ] Enter document number: Any number (e.g., `12345678901`)
- [ ] Upload document image (optional in dev)
- [ ] Click "Verify Identity"
- [ ] **Expected**:
  - ⚠️ Always succeeds (mocked in dev)
  - Crypto wallet auto-generated
  - Fiat wallet created
  - User marked as KYC verified

#### View Crypto Wallet
- [ ] After KYC, navigate to `/wallet`
- [ ] Scroll to "Crypto Addresses" section
- [ ] **Expected**: See addresses for Ethereum, Polygon, BSC
- [ ] **Expected**: All 3 addresses are the same (EVM-compatible)

#### Crypto Withdrawal (Optional - Risky in Dev)
- [ ] In crypto section, click "Withdraw"
- [ ] Enter recipient address: `0x...`
- [ ] Enter amount: 1 USDT
- [ ] Select network: Polygon
- [ ] **Warning**: Do not test with real funds!
- [ ] **Expected**: Transaction initiated (check Firestore for tx record)

---

### 6. Community Feed Features 💬

#### View Feed
- [ ] Navigate to `/feed`
- [ ] **Expected**: See posts from users
- [ ] Scroll through feed
- [ ] **Expected**: Posts display with images, author info, likes, comments

#### Create Post
- [ ] Click "Create Post" button
- [ ] Enter content: "Test post - Fresh harvest!"
- [ ] Upload images (optional)
- [ ] Click "Post"
- [ ] **Expected**: Post appears at top of feed

#### Like Post
- [ ] Click heart icon on any post
- [ ] **Expected**: Like count increases, heart fills
- [ ] Click again to unlike
- [ ] **Expected**: Like count decreases, heart empties

#### Comment on Post
- [ ] Click "Comment" on any post
- [ ] Enter comment: "Great harvest!"
- [ ] Click "Submit"
- [ ] **Expected**: Comment appears below post

---

### 7. Profile & Settings Features 👤

#### View Profile
- [ ] Navigate to `/settings` (or click profile menu)
- [ ] **Expected**: See profile information

#### Edit Profile
- [ ] Click "Edit Profile"
- [ ] Update: First Name, Last Name, Bio
- [ ] Upload new avatar image
- [ ] Click "Save"
- [ ] **Expected**: Profile updated, new avatar displays

#### Upload Profile Picture
- [ ] In profile settings, click "Upload Avatar"
- [ ] Select image file (JPG, PNG)
- [ ] **Expected**: Image uploads to Firebase Storage
- [ ] **Expected**: Profile picture updates across app

#### Security Settings
- [ ] Navigate to `/settings/security`
- [ ] **Expected**: See 2FA options

#### Enable 2FA
- [ ] Click "Enable 2FA"
- [ ] **Expected**: QR code generates
- [ ] Scan with authenticator app (Google Authenticator, Authy)
- [ ] Enter 6-digit code
- [ ] **Expected**: 2FA enabled

---

### 8. Notifications 🔔

#### View Notifications
- [ ] Navigate to `/notifications`
- [ ] **Expected**: See notification list
- [ ] Click on notification
- [ ] **Expected**: Navigate to relevant page (order, post, etc.)

---

### 9. File Upload Features 📤

#### Upload Product Images
- [ ] In `/sell` (create product), click "Upload Images"
- [ ] Select multiple images
- [ ] **Expected**: Images preview displays
- [ ] Submit product
- [ ] **Expected**: Images stored in Firebase Storage, URLs in Firestore

#### Upload Profile Picture
- [ ] Covered in "Profile & Settings" section above

---

### 10. Edge Cases & Error Handling ⚠️

#### Insufficient Wallet Balance
- [ ] Ensure wallet has $0 balance
- [ ] Try to checkout with wallet payment
- [ ] **Expected**: Error message "Insufficient balance"

#### Out of Stock Product
- [ ] Find product with 0 quantity
- [ ] Try to add to cart
- [ ] **Expected**: Error or disabled button

#### Unauthenticated Access
- [ ] Log out
- [ ] Try to access `/wallet` directly
- [ ] **Expected**: Redirect to `/login`

#### Invalid Form Data
- [ ] In signup, enter mismatched passwords
- [ ] **Expected**: Validation error
- [ ] In product creation, leave required fields empty
- [ ] **Expected**: Form validation prevents submission

---

## Known Issues & Limitations

### Mocked Services (Development Only)
- **KYC Verification**: Always returns success. Real Prembly API is commented out.
- **Exchange Rates**: Hard-coded in `/api/orders/route.ts`. Not fetching live rates.

### Missing Features
- **Password Reset**: Not implemented. Users must contact support.
- **Email Verification**: Not required in dev mode.
- **Order Tracking**: Tracking numbers not generated yet.
- **Product Reviews**: Not implemented.
- **Search Functionality**: Basic client-side filtering only.

### Performance Issues
- **Large Product Lists**: No pagination, may slow down with 100+ products.
- **Large Feeds**: No pagination on community feed.

---

## Troubleshooting

### "Authentication Error" on Login
- Check `.env.local` has Firebase credentials
- Verify Firebase Auth is enabled in Firebase Console
- Clear browser cache and cookies

### "Wallet Not Found" Error
- Wallet should auto-create on signup
- Check Firestore for `wallets/{userId}` document
- Try creating test user via `/api/signup` directly

### Images Not Uploading
- Check Firebase Storage rules allow writes
- Verify `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set
- Check browser console for CORS errors

### Paystack Popup Not Opening
- Verify Paystack script is loaded (check network tab)
- Check `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
- Ensure using test key for development

---

## Test Data Cleanup

### Reset Test User
```bash
# Delete user from Firebase Console
# Go to Authentication → Users → Delete
# Also delete from Firestore: users/{userId}, wallets/{userId}
```

### Clear Cart
```bash
# Cart is stored in localStorage
# Open browser console:
localStorage.clear()
```

---

## Reporting Bugs

When reporting bugs, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and OS**
5. **Screenshots (if applicable)**
6. **Console errors** (open DevTools → Console)

---

## Next Steps

1. **Complete manual testing** using this checklist
2. **Document all bugs** found during testing
3. **Prioritize critical bugs** for fixing
4. **Add automated tests** for critical paths (future work)

---

## Automated Testing (Future)

Recommended test frameworks:
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress or Playwright
- **API Tests**: Jest + Supertest

**Priority test cases** to automate first:
1. Authentication flow
2. Checkout and payment
3. Wallet operations
4. Product CRUD
