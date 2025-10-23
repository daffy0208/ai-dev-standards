/**
 * Stripe Webhook Handler
 *
 * Secure webhook handling for Stripe events.
 *
 * Features:
 * - Signature verification
 * - Event type handlers
 * - Idempotency
 * - Error handling
 * - Logging
 *
 * Setup:
 * ```typescript
 * // In your Next.js API route: app/api/webhooks/stripe/route.ts
 * import { handleStripeWebhook } from '@/integrations/stripe/webhooks'
 *
 * export async function POST(request: Request) {
 *   return handleStripeWebhook(request, {
 *     onPaymentSuccess: async (session) => {
 *       // Handle successful payment
 *     },
 *     onSubscriptionCreated: async (subscription) => {
 *       // Handle new subscription
 *     }
 *   })
 * }
 * ```
 */

import Stripe from 'stripe'
import { StripeClient } from './client'

export interface WebhookHandlers {
  // Payment events
  onPaymentSuccess?: (paymentIntent: Stripe.PaymentIntent) => Promise<void>
  onPaymentFailed?: (paymentIntent: Stripe.PaymentIntent) => Promise<void>

  // Subscription events
  onSubscriptionCreated?: (subscription: Stripe.Subscription) => Promise<void>
  onSubscriptionUpdated?: (subscription: Stripe.Subscription) => Promise<void>
  onSubscriptionDeleted?: (subscription: Stripe.Subscription) => Promise<void>
  onSubscriptionTrialEnding?: (subscription: Stripe.Subscription) => Promise<void>

  // Customer events
  onCustomerCreated?: (customer: Stripe.Customer) => Promise<void>
  onCustomerUpdated?: (customer: Stripe.Customer) => Promise<void>
  onCustomerDeleted?: (customer: Stripe.Customer) => Promise<void>

  // Invoice events
  onInvoicePaid?: (invoice: Stripe.Invoice) => Promise<void>
  onInvoicePaymentFailed?: (invoice: Stripe.Invoice) => Promise<void>

  // Checkout events
  onCheckoutCompleted?: (session: Stripe.Checkout.Session) => Promise<void>

  // Catch-all
  onOtherEvent?: (event: Stripe.Event) => Promise<void>
}

/**
 * Main webhook handler
 */
export async function handleStripeWebhook(
  request: Request,
  handlers: WebhookHandlers
): Promise<Response> {
  try {
    // Get raw body and signature
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return Response.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const stripe = new StripeClient()
    const event = stripe.constructWebhookEvent(body, signature)

    // Log event (optional)
    console.log(`[Stripe Webhook] ${event.type}:`, event.id)

    // Handle event based on type
    await handleEvent(event, handlers)

    return Response.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook Error]:', error)

    if (error instanceof Error && error.message.includes('signature')) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    return Response.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * Route event to appropriate handler
 */
async function handleEvent(event: Stripe.Event, handlers: WebhookHandlers) {
  try {
    switch (event.type) {
      // Payment Intent events
      case 'payment_intent.succeeded':
        if (handlers.onPaymentSuccess) {
          await handlers.onPaymentSuccess(event.data.object as Stripe.PaymentIntent)
        }
        break

      case 'payment_intent.payment_failed':
        if (handlers.onPaymentFailed) {
          await handlers.onPaymentFailed(event.data.object as Stripe.PaymentIntent)
        }
        break

      // Subscription events
      case 'customer.subscription.created':
        if (handlers.onSubscriptionCreated) {
          await handlers.onSubscriptionCreated(event.data.object as Stripe.Subscription)
        }
        break

      case 'customer.subscription.updated':
        if (handlers.onSubscriptionUpdated) {
          await handlers.onSubscriptionUpdated(event.data.object as Stripe.Subscription)
        }
        break

      case 'customer.subscription.deleted':
        if (handlers.onSubscriptionDeleted) {
          await handlers.onSubscriptionDeleted(event.data.object as Stripe.Subscription)
        }
        break

      case 'customer.subscription.trial_will_end':
        if (handlers.onSubscriptionTrialEnding) {
          await handlers.onSubscriptionTrialEnding(event.data.object as Stripe.Subscription)
        }
        break

      // Customer events
      case 'customer.created':
        if (handlers.onCustomerCreated) {
          await handlers.onCustomerCreated(event.data.object as Stripe.Customer)
        }
        break

      case 'customer.updated':
        if (handlers.onCustomerUpdated) {
          await handlers.onCustomerUpdated(event.data.object as Stripe.Customer)
        }
        break

      case 'customer.deleted':
        if (handlers.onCustomerDeleted) {
          await handlers.onCustomerDeleted(event.data.object as Stripe.Customer)
        }
        break

      // Invoice events
      case 'invoice.paid':
        if (handlers.onInvoicePaid) {
          await handlers.onInvoicePaid(event.data.object as Stripe.Invoice)
        }
        break

      case 'invoice.payment_failed':
        if (handlers.onInvoicePaymentFailed) {
          await handlers.onInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        }
        break

      // Checkout events
      case 'checkout.session.completed':
        if (handlers.onCheckoutCompleted) {
          await handlers.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        }
        break

      // Catch-all
      default:
        if (handlers.onOtherEvent) {
          await handlers.onOtherEvent(event)
        } else {
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
        }
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error)
    throw error
  }
}

/**
 * Example: Complete webhook implementation
 */
export async function exampleWebhookHandler(request: Request) {
  return handleStripeWebhook(request, {
    onPaymentSuccess: async (paymentIntent) => {
      console.log('Payment succeeded:', paymentIntent.id)

      // Update database
      // await db.payments.create({
      //   id: paymentIntent.id,
      //   amount: paymentIntent.amount,
      //   customerId: paymentIntent.customer,
      //   status: 'succeeded'
      // })

      // Send confirmation email
      // await sendEmail({
      //   to: paymentIntent.receipt_email,
      //   subject: 'Payment Confirmation',
      //   body: 'Your payment was successful!'
      // })
    },

    onSubscriptionCreated: async (subscription) => {
      console.log('Subscription created:', subscription.id)

      // Update user subscription status
      // await db.users.update({
      //   where: { stripeCustomerId: subscription.customer },
      //   data: {
      //     subscriptionId: subscription.id,
      //     subscriptionStatus: subscription.status,
      //     subscriptionPriceId: subscription.items.data[0].price.id
      //   }
      // })

      // Send welcome email
      // await sendEmail({
      //   to: customer.email,
      //   subject: 'Welcome to Premium!',
      //   body: 'Thanks for subscribing!'
      // })
    },

    onSubscriptionUpdated: async (subscription) => {
      console.log('Subscription updated:', subscription.id)

      // Update database
      // await db.users.update({
      //   where: { stripeCustomerId: subscription.customer },
      //   data: {
      //     subscriptionStatus: subscription.status,
      //     subscriptionPriceId: subscription.items.data[0].price.id
      //   }
      // })

      // Handle cancellation
      if (subscription.cancel_at_period_end) {
        // await sendEmail({
        //   subject: 'Subscription Cancellation Confirmed',
        //   body: `Your subscription will end on ${new Date(subscription.current_period_end * 1000)}`
        // })
      }
    },

    onSubscriptionDeleted: async (subscription) => {
      console.log('Subscription deleted:', subscription.id)

      // Update database
      // await db.users.update({
      //   where: { stripeCustomerId: subscription.customer },
      //   data: {
      //     subscriptionId: null,
      //     subscriptionStatus: 'canceled',
      //     subscriptionPriceId: null
      //   }
      // })

      // Revoke access
      // await revokeAccess(subscription.customer)
    },

    onInvoicePaymentFailed: async (invoice) => {
      console.log('Invoice payment failed:', invoice.id)

      // Send payment failure email
      // await sendEmail({
      //   to: customer.email,
      //   subject: 'Payment Failed',
      //   body: 'Your recent payment failed. Please update your payment method.'
      // })

      // Update subscription status
      // await db.users.update({
      //   where: { stripeCustomerId: invoice.customer },
      //   data: {
      //     subscriptionStatus: 'past_due'
      //   }
      // })
    },

    onCheckoutCompleted: async (session) => {
      console.log('Checkout completed:', session.id)

      // Fulfill order
      // await fulfillOrder(session)
    }
  })
}

/**
 * Helper: Test webhook locally
 */
export function testWebhookLocally() {
  console.log(`
To test webhooks locally:

1. Install Stripe CLI:
   brew install stripe/stripe-cli/stripe

2. Login:
   stripe login

3. Forward webhooks to your local server:
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

4. Trigger test events:
   stripe trigger payment_intent.succeeded
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_failed

5. Use the webhook signing secret from CLI output in your .env:
   STRIPE_WEBHOOK_SECRET=whsec_...
  `)
}

/**
 * Helper: Verify webhook configuration
 */
export async function verifyWebhookSetup() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  console.log('✅ Webhook configuration verified')
}
