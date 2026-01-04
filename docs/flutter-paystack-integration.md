# Paystack Payment - Flutter Mobile App Integration Guide

## Overview
This guide shows you how to integrate Paystack payment into your Flutter mobile app for the Gonana Marketplace.

## Prerequisites
- Flutter SDK installed
- Gonana mobile app project
- Paystack test public key: `pk_test_3e87802dae281fbeb004f2b0f741a6e662aba103`

## Setup

### 1. Add Paystack Package

Add the `flutter_paystack_plus` package to your `pubspec.yaml`:

```yaml
dependencies:
  flutter_paystack_plus: ^1.0.7  # or latest version
```

Run:
```bash
flutter pub get
```

### 2. Initialize Paystack

In your main app file (e.g., `main.dart`), initialize Paystack:

```dart
import 'package:flutter_paystack_plus/flutter_paystack_plus.dart';

void main() {
  // Initialize Paystack
  PaystackPop.initialize(
    publicKey: 'pk_test_3e87802dae281fbeb004f2b0f741a6e662aba103',
  );
  
  runApp(const MyApp());
}
```

### 3. Create Payment Service

Create a new file `lib/services/payment_service.dart`:

```dart
import 'package:flutter_paystack_plus/flutter_paystack_plus.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaymentService {
  static const String publicKey = 'pk_test_3e87802dae281fbeb004f2b0f741a6e662aba103';
  
  /// Initialize a payment transaction
  /// Amount should be in kobo (multiply Naira by 100)
  Future<PaymentResponse?> makePayment({
    required String email,
    required int amountInKobo,
    required Map<String, dynamic> metadata,
  }) async {
    try {
      final charge = Charge()
        ..email = email
        ..amount = amountInKobo // Amount in kobo
        ..currency = 'NGN'
        ..reference = _generateReference()
        ..metadata = metadata
        ..accessCode = null; // Will be generated

      final response = await PaystackPop.checkout(
        charge,
        method: CheckoutMethod.card, // or CheckoutMethod.selectable
      );

      if (response.status) {
        // Payment successful
        return response;
      } else {
        // Payment failed or cancelled
        print('Payment failed: ${response.message}');
        return null;
      }
    } catch (e) {
      print('Payment error: $e');
      return null;
    }
  }

  /// Verify payment on backend
  Future<bool> verifyPayment(String reference) async {
    try {
      final response = await http.get(
        Uri.parse('https://your-api.com/api/payments/verify?reference=$reference'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['verified'] == true;
      }
      return false;
    } catch (e) {
      print('Verification error: $e');
      return false;
    }
  }

  /// Generate unique payment reference
  String _generateReference() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'GN_$timestamp';
  }
}
```

### 4. Implement in Checkout Screen

Update your checkout screen to use the payment service:

```dart
import 'package:flutter/material.dart';
import '../services/payment_service.dart';

class CheckoutScreen extends StatefulWidget {
  final double totalAmount; // in Naira
  final List<CartItem> cartItems;

  const CheckoutScreen({
    required this.totalAmount,
    required this.cartItems,
  });

  @override
  _CheckoutScreenState createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final PaymentService _paymentService = PaymentService();
  bool _isProcessing = false;

  Future<void> _handlePayment() async {
    setState(() => _isProcessing = true);

    try {
      // Convert amount to kobo
      final amountInKobo = (widget.totalAmount * 100).toInt();

      // Prepare metadata
      final metadata = {
        'cart_items': widget.cartItems.map((item) => {
          'id': item.id,
          'name': item.name,
          'quantity': item.quantity,
          'price': item.price,
        }).toList(),
        'user_id': 'current_user_id', // Get from auth
      };

      // Make payment
      final response = await _paymentService.makePayment(
        email: 'user@example.com', // Get from user profile
        amountInKobo: amountInKobo,
        metadata: metadata,
      );

      if (response != null && response.status) {
        // Verify payment on backend
        final verified = await _paymentService.verifyPayment(
          response.reference!,
        );

        if (verified) {
          // Create order
          await _createOrder(response.reference!);
          
          // Navigate to success screen
          Navigator.pushReplacementNamed(
            context,
            '/order-confirmation',
            arguments: response.reference,
          );
        } else {
          _showError('Payment verification failed');
        }
      } else {
        _showError('Payment was cancelled or failed');
      }
    } catch (e) {
      _showError('An error occurred: $e');
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  Future<void> _createOrder(String paymentReference) async {
    // Call your API to create order
    // Include payment reference
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: Column(
        children: [
          // Your checkout UI here
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Cart items
                // Shipping details
                // Total amount
              ],
            ),
          ),
          
          // Pay button
          Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: _isProcessing ? null : _handlePayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E8449), // Gonana primary color
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isProcessing
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(
                      'Pay ₦${widget.totalAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
```

### 5. Environment Variables

Create a `.env` file (or use flutter_dotenv):

```
PAYSTACK_PUBLIC_KEY=pk_test_3e87802dae281fbeb004f2b0f741a6e662aba103
API_BASE_URL=https://your-api.com
```

### 6. Android Configuration

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 7. iOS Configuration (if needed)

No special configuration required for basic Paystack integration.

## Testing

### Test Cards

Use these test cards for testing:

**Success:**
- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Insufficient Funds:**
- Card: `5060666666666666666`

**Declined:**
- Card: `5143010522339965`

## Production Checklist

Before going live:

1. ✅ Replace test public key with live key
2. ✅ Update backend with live secret key
3. ✅ Test with real card (small amount)
4. ✅ Implement proper error handling
5. ✅ Add loading states
6. ✅ Implement payment verification webhook
7. ✅ Secure all API endpoints
8. ✅ Add transaction logging

## Backend Integration

Your backend should:

1. Verify payments using Paystack API
2. Store payment references
3. Create orders only after verification
4. Handle webhooks from Paystack

Example webhook handler (Node.js):

```javascript
// POST /api/webhooks/paystack
app.post('/api/webhooks/paystack', (req, res) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    if (event.event === 'charge.success') {
      // Update order status
      // Send confirmation email
    }
  }
  
  res.sendStatus(200);
});
```

## Additional Resources

- [Paystack Flutter Plugin Docs](https://pub.dev/packages/flutter_paystack_plus)
- [Paystack API Reference](https://paystack.com/docs/api/)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments/)

## Support

For issues, check:
1. Plugin GitHub issues: https://github.com/wilburx9/flutter_paystack
2. Paystack support: support@paystack.com
3. Gonana support: support@gonana.farm
