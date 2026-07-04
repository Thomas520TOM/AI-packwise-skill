# Payment Integration Build Sub-Skill

Integrate payment systems into applications during build and packaging.

**Current versions**: Stripe API 2024-12 / Alipay / WeChat Pay / Apple IAP / Google Play Billing (2025-2026)

## When to Use

- SaaS applications with subscription billing
- E-commerce applications
- Mobile apps with in-app purchases
- Marketplace / platform payments
- Donations / tipping

## Payment Platform Comparison

| Platform | Coverage | Fee | Best For |
|----------|----------|-----|---------|
| Stripe | Global (46+ countries) | 2.9% + $0.30/txn | Global SaaS, web apps |
| Alipay | China | 0.6% | China market |
| WeChat Pay | China | 0.6% | China market, mini-programs |
| PayPal | Global | 2.9% + $0.30/txn | Broad consumer reach |
| Apple IAP | iOS/macOS | 15–30% | iOS in-app purchases (required) |
| Google Play Billing | Android | 15–30% | Android in-app purchases (required) |
| Paddle | Global | 5% + fee | SaaS (handles tax/compliance) |
| LemonSqueezy | Global | 5% + fee | Digital products, indie SaaS |

---

## Stripe Integration

### Web (Node.js Backend)

```bash
npm install stripe
```

```javascript
// server/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create checkout session
app.post('/create-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: 'My Product' },
        unit_amount: 2000, // $20.00
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/cancel`,
  });
  res.json({ url: session.url });
});

// Webhook handler (required for production)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed':
      // Fulfill order
      break;
    case 'invoice.paid':
      // Update subscription status
      break;
  }
  res.json({ received: true });
});
```

### React Frontend

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

### Subscription Billing

```javascript
// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_monthly_xxx' }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});
```

---

## Alipay & WeChat Pay

### Stripe + Alipay/WeChat (Recommended for international)

```javascript
// Stripe supports Alipay and WeChat Pay as payment methods
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'alipay', 'wechat_pay'],
  // ...
});
```

### Native Alipay SDK

```bash
pip install alipay-sdk-python
```

```python
from alipay.aop.api.AlipayClientConfig import AlipayClientConfig
from alipay.aop.api.DefaultAlipayClient import DefaultAlipayClient

config = AlipayClientConfig()
config.app_id = "your_app_id"
config.app_private_key = "your_private_key"
config.alipay_public_key = "alipay_public_key"

client = DefaultAlipayClient(config)
```

### Native WeChat Pay SDK

```xml
<!-- Java/Maven -->
<dependency>
    <groupId>com.github.wxpay</groupId>
    <artifactId>wxpay-sdk</artifactId>
    <version>3.4.0</version>
</dependency>
```

---

## Apple In-App Purchase (IAP)

### When Required

- Digital content consumed in the app (subscriptions, premium features, virtual goods)
- **Physical goods**: Use Stripe/PayPal instead
- **External links**: Apple allows external payment links in some regions (EU, US)

### Swift Implementation

```swift
import StoreKit

class StoreManager: ObservableObject {
    @Published var products: [Product] = []

    func loadProducts() async {
        do {
            products = try await Product.products(for: ["com.app.premium_monthly", "com.app.premium_yearly"])
        } catch {
            print("Failed to load products: \(error)")
        }
    }

    func purchase(_ product: Product) async throws -> Transaction? {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            return transaction
        case .userCancelled:
            return nil
        case .pending:
            return nil
        @unknown default:
            return nil
        }
    }
}
```

### App Store Configuration

```
1. App Store Connect → In-App Purchases → Create
2. Set product ID, price, localization
3. Submit for review (can take 24-48 hours)
4. Implement receipt validation on server (recommended)
```

---

## Google Play Billing

### Kotlin Implementation

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.android.billingclient:billing-ktx:7.0.0")
}

// BillingManager.kt
class BillingManager(context: Context) {
    private val billingClient = BillingClient.newBuilder(context)
        .setListener { billingResult, purchases ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
                for (purchase in purchases) handlePurchase(purchase)
            }
        }
        .enablePendingPurchases()
        .build()

    fun startConnection() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryProducts()
                }
            }
            override fun onBillingServiceDisconnected() { /* retry */ }
        })
    }

    private fun queryProducts() {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId("premium_monthly")
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        )
        val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()
        billingClient.queryProductDetailsAsync(params) { result, productDetailsList ->
            // Display products to user
        }
    }
}
```

### Google Play Console Configuration

```
1. Google Play Console → Monetize → Products → Subscriptions
2. Create subscription product with base plan
3. Set pricing, grace period, offers
4. Upload app with billing permission
5. Test with license testers
```

---

## Server-Side Receipt Validation (Critical for Security)

```javascript
// Apple receipt validation
const appleReceiptVerify = require('node-apple-receipt-verify');
appleReceiptVerify.config({ secret: process.env.APPLE_SHARED_SECRET });

const products = await appleReceiptVerify.validate({
  receipt: receiptData,
  verbose: true,
});

// Google Play receipt validation
const { google } = require('googleapis');
const androidpublisher = google.androidpublisher('v3');
const purchase = await androidpublisher.purchases.subscriptions.get({
  packageName: 'com.example.app',
  subscriptionId: 'premium_monthly',
  token: purchaseToken,
});
```

---

## Payment Security Checklist

| Requirement | Implementation |
|-------------|---------------|
| **Never trust client-side** | Always validate payments server-side |
| **Webhook signature verification** | Verify Stripe/Alipay webhook signatures |
| **HTTPS only** | All payment pages must use HTTPS |
| **PCI compliance** | Use Stripe Elements (no raw card data on your server) |
| **Idempotency** | Use idempotency keys to prevent double charges |
| **Receipt validation** | Validate IAP receipts server-side (Apple/Google) |
| **Fraud detection** | Implement rate limiting; flag suspicious patterns |
| **Secure key storage** | Use environment variables / secret managers; never commit keys |

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Apple IAP rejected | Ensure IAP is for digital content; physical goods use other processors |
| Stripe webhook not receiving | Check webhook URL; verify signature; use Stripe CLI for testing |
| Double charges | Implement idempotency keys; check payment status before fulfilling |
| Currency mismatch | Use `currency` consistently; Stripe amounts are in cents |
| Alipay/WeChat cross-border | Use Stripe's built-in support; or apply for merchant accounts directly |
| Google Play billing crash | Handle `BillingClientStateListener` disconnection; retry logic |
| Tax compliance | Use Stripe Tax or Paddle for automatic tax calculation |
