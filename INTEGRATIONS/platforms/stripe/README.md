# Stripe Integration

Complete Stripe integration for payments, subscriptions, and billing management.

## Features

- ✅ **Payment Processing** - One-time and recurring payments
- ✅ **Subscription Management** - Create, update, cancel subscriptions
- ✅ **Customer Management** - Manage customer data
- ✅ **Webhook Handling** - Secure event processing
- ✅ **Checkout Sessions** - Pre-built checkout pages
- ✅ **Billing Portal** - Self-service customer portal
- ✅ **Invoicing** - Automated invoice generation
- ✅ **Refunds** - Process refunds programmatically

---

## Setup

### 1. Install Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 2. Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers > API keys
3. For webhooks: Developers > Webhooks > Add endpoint

### 3. Environment Variables

```bash
# Server-side (secret)
STRIPE_SECRET_KEY=sk_test_...

# Client-side (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Usage

### Create Customer

```typescript
import { StripeClient } from './client'

const stripe = new StripeClient()

const customer = await stripe.createCustomer({
  email: 'user@example.com',
  name: 'John Doe',
  metadata: { userId: '123' }
})
```

### One-Time Payment

```typescript
// Create payment intent
const paymentIntent = await stripe.createPaymentIntent({
  amount: 2999, // $29.99 in cents
  customerId: customer.id,
  description: 'Premium Plan - One Year'
})

// Client-side: Confirm payment with Stripe.js
// const { error } = await stripeJs.confirmPayment({
//   elements,
//   confirmParams: {
//     return_url: 'https://example.com/success'
//   }
// })
```

### Create Subscription

```typescript
const subscription = await stripe.createSubscription({
  customerId: customer.id,
  priceId: 'price_123', // Your price ID
  trialPeriodDays: 14,
  metadata: { plan: 'premium' }
})
```

### Checkout Session (Easiest Way)

```typescript
const session = await stripe.createCheckoutSession({
  customerEmail: 'user@example.com',
  lineItems: [
    { priceId: 'price_123', quantity: 1 }
  ],
  mode: 'subscription', // or 'payment' for one-time
  successUrl: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancelUrl: 'https://example.com/cancel'
})

// Redirect user to session.url
```

### Customer Portal

```typescript
const portalSession = await stripe.createBillingPortalSession({
  customerId: customer.id,
  returnUrl: 'https://example.com/account'
})

// Redirect user to portalSession.url
```

---

## Webhooks

### Setup Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { handleStripeWebhook } from '@/integrations/stripe/webhooks'

export async function POST(request: Request) {
  return handleStripeWebhook(request, {
    onPaymentSuccess: async (paymentIntent) => {
      // Handle successful payment
      console.log('Payment succeeded:', paymentIntent.id)

      // Update database
      await db.payments.create({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        customerId: paymentIntent.customer,
        status: 'succeeded'
      })

      // Send confirmation email
      await sendEmail({
        to: paymentIntent.receipt_email,
        subject: 'Payment Confirmed',
        body: 'Thanks for your payment!'
      })
    },

    onSubscriptionCreated: async (subscription) => {
      // Grant access
      await db.users.update({
        where: { stripeCustomerId: subscription.customer },
        data: {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          plan: 'premium'
        }
      })
    },

    onSubscriptionDeleted: async (subscription) => {
      // Revoke access
      await db.users.update({
        where: { stripeCustomerId: subscription.customer },
        data: {
          subscriptionId: null,
          subscriptionStatus: 'canceled',
          plan: 'free'
        }
      })
    },

    onInvoicePaymentFailed: async (invoice) => {
      // Notify user
      await sendEmail({
        to: customer.email,
        subject: 'Payment Failed',
        body: 'Please update your payment method'
      })
    }
  })
}

// Disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false
  }
}
```

### Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

## Common Patterns

### Check Subscription Status

```typescript
async function hasActiveSubscription(customerId: string): Promise<boolean> {
  const subscriptions = await stripe.listSubscriptions(customerId)

  return subscriptions.data.some(
    sub => sub.status === 'active' || sub.status === 'trialing'
  )
}
```

### Cancel Subscription at Period End

```typescript
// User can still access until end of billing period
await stripe.cancelSubscription(subscriptionId, {
  immediately: false
})

// Or cancel immediately
await stripe.cancelSubscription(subscriptionId, {
  immediately: true
})
```

### Update Subscription Plan

```typescript
const subscription = await stripe.updateSubscription(subscriptionId, {
  items: [{
    id: subscription.items.data[0].id,
    price: 'price_new_plan'
  }],
  proration_behavior: 'create_prorations'
})
```

### Issue Refund

```typescript
const refund = await stripe.createRefund({
  paymentIntentId: 'pi_123',
  amount: 2999, // Full or partial refund
  reason: 'requested_by_customer'
})
```

---

## Pricing Models

### One-Time Payment

```typescript
const price = await stripe.createPrice({
  productId: 'prod_123',
  amount: 9999, // $99.99
  currency: 'usd'
})
```

### Monthly Subscription

```typescript
const price = await stripe.createPrice({
  productId: 'prod_123',
  amount: 2999, // $29.99/month
  currency: 'usd',
  interval: 'month'
})
```

### Annual Subscription

```typescript
const price = await stripe.createPrice({
  productId: 'prod_123',
  amount: 29999, // $299.99/year
  currency: 'usd',
  interval: 'year'
})
```

### Metered Billing

```typescript
// Record usage
await stripe.createUsageRecord({
  subscriptionItemId: 'si_123',
  quantity: 100, // e.g., 100 API calls
  action: 'increment'
})
```

---

## Security Best Practices

### 1. Never Expose Secret Key
- ❌ Don't use secret key on client-side
- ✅ Use publishable key for client-side
- ✅ Keep secret key server-side only

### 2. Verify Webhook Signatures
- ✅ Always verify webhook signatures
- ✅ Use constructWebhookEvent() method
- ❌ Don't trust unverified webhooks

### 3. Use HTTPS
- ✅ Always use HTTPS in production
- ✅ Stripe requires HTTPS for webhooks

### 4. Handle Idempotency
- ✅ Store event IDs to prevent duplicate processing
- ✅ Use Stripe's built-in idempotency keys

---

## Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires authentication: 4000 0025 0000 3155
```

### Test Mode

All keys starting with `sk_test_` or `pk_test_` are test mode.
No real charges will be made.

---

## Troubleshooting

### "Invalid API Key"
Check that you're using the correct key for your environment (test vs live).

### Webhook Not Receiving Events
1. Verify webhook URL is correct
2. Check webhook is enabled in Stripe Dashboard
3. Verify webhook secret is correct
4. Check server logs for errors

### Payment Failing
1. Check test card numbers
2. Verify amount is in cents
3. Check currency code is valid
4. Ensure customer has payment method attached

---

## Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

**Built for production-ready payment processing** 💳
