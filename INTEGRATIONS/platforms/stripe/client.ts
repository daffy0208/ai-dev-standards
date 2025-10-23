/**
 * Stripe Client Integration
 *
 * Complete Stripe integration for payments, subscriptions, and billing.
 *
 * Features:
 * - Payment processing (one-time and recurring)
 * - Subscription management
 * - Customer management
 * - Invoice handling
 * - Payment method management
 * - Webhook handling
 * - Type-safe with Stripe types
 *
 * Setup:
 * ```bash
 * npm install stripe @stripe/stripe-js
 * ```
 *
 * Environment:
 * ```
 * STRIPE_SECRET_KEY=sk_test_...
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 * STRIPE_WEBHOOK_SECRET=whsec_...
 * ```
 */

import Stripe from 'stripe'

export interface StripeConfig {
  secretKey?: string
  apiVersion?: string
}

export class StripeClient {
  private stripe: Stripe

  constructor(config: StripeConfig = {}) {
    const secretKey = config.secretKey || process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is required')
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
      typescript: true
    })
  }

  /**
   * Customer Management
   */
  async createCustomer(params: {
    email: string
    name?: string
    metadata?: Record<string, string>
  }) {
    return this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata
    })
  }

  async getCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId)
  }

  async updateCustomer(customerId: string, params: Stripe.CustomerUpdateParams) {
    return this.stripe.customers.update(customerId, params)
  }

  async deleteCustomer(customerId: string) {
    return this.stripe.customers.del(customerId)
  }

  async listCustomers(params?: Stripe.CustomerListParams) {
    return this.stripe.customers.list(params)
  }

  /**
   * Payment Intent (one-time payments)
   */
  async createPaymentIntent(params: {
    amount: number // in cents
    currency?: string
    customerId?: string
    metadata?: Record<string, string>
    description?: string
  }) {
    return this.stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || 'usd',
      customer: params.customerId,
      metadata: params.metadata,
      description: params.description,
      automatic_payment_methods: {
        enabled: true
      }
    })
  }

  async getPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId)
  }

  async confirmPaymentIntent(paymentIntentId: string, params?: Stripe.PaymentIntentConfirmParams) {
    return this.stripe.paymentIntents.confirm(paymentIntentId, params)
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.cancel(paymentIntentId)
  }

  /**
   * Subscription Management
   */
  async createSubscription(params: {
    customerId: string
    priceId: string
    metadata?: Record<string, string>
    trialPeriodDays?: number
    paymentBehavior?: 'default_incomplete' | 'error_if_incomplete'
  }) {
    return this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata,
      trial_period_days: params.trialPeriodDays,
      payment_behavior: params.paymentBehavior || 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    })
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId)
  }

  async updateSubscription(subscriptionId: string, params: Stripe.SubscriptionUpdateParams) {
    return this.stripe.subscriptions.update(subscriptionId, params)
  }

  async cancelSubscription(subscriptionId: string, params?: { immediately?: boolean }) {
    if (params?.immediately) {
      return this.stripe.subscriptions.cancel(subscriptionId)
    }
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })
  }

  async resumeSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })
  }

  async listSubscriptions(customerId: string) {
    return this.stripe.subscriptions.list({
      customer: customerId
    })
  }

  /**
   * Payment Methods
   */
  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    })
  }

  async detachPaymentMethod(paymentMethodId: string) {
    return this.stripe.paymentMethods.detach(paymentMethodId)
  }

  async listPaymentMethods(customerId: string) {
    return this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    })
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    })
  }

  /**
   * Prices & Products
   */
  async createPrice(params: {
    productId: string
    amount: number
    currency?: string
    interval?: 'month' | 'year' | 'week' | 'day'
    intervalCount?: number
  }) {
    return this.stripe.prices.create({
      product: params.productId,
      unit_amount: params.amount,
      currency: params.currency || 'usd',
      recurring: params.interval ? {
        interval: params.interval,
        interval_count: params.intervalCount || 1
      } : undefined
    })
  }

  async getPrice(priceId: string) {
    return this.stripe.prices.retrieve(priceId)
  }

  async listPrices(params?: Stripe.PriceListParams) {
    return this.stripe.prices.list(params)
  }

  async createProduct(params: {
    name: string
    description?: string
    metadata?: Record<string, string>
  }) {
    return this.stripe.products.create({
      name: params.name,
      description: params.description,
      metadata: params.metadata
    })
  }

  async getProduct(productId: string) {
    return this.stripe.products.retrieve(productId)
  }

  async listProducts(params?: Stripe.ProductListParams) {
    return this.stripe.products.list(params)
  }

  /**
   * Invoices
   */
  async getInvoice(invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId)
  }

  async listInvoices(customerId: string) {
    return this.stripe.invoices.list({
      customer: customerId
    })
  }

  async payInvoice(invoiceId: string) {
    return this.stripe.invoices.pay(invoiceId)
  }

  /**
   * Checkout Sessions
   */
  async createCheckoutSession(params: {
    customerId?: string
    customerEmail?: string
    lineItems: Array<{
      priceId: string
      quantity: number
    }>
    mode: 'payment' | 'subscription' | 'setup'
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }) {
    return this.stripe.checkout.sessions.create({
      customer: params.customerId,
      customer_email: params.customerEmail,
      line_items: params.lineItems.map(item => ({
        price: item.priceId,
        quantity: item.quantity
      })),
      mode: params.mode,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata
    })
  }

  async getCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId)
  }

  /**
   * Billing Portal
   */
  async createBillingPortalSession(params: {
    customerId: string
    returnUrl: string
  }) {
    return this.stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl
    })
  }

  /**
   * Webhooks
   */
  constructWebhookEvent(payload: string | Buffer, signature: string, secret?: string) {
    const webhookSecret = secret || process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required')
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  /**
   * Refunds
   */
  async createRefund(params: {
    paymentIntentId: string
    amount?: number
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  }) {
    return this.stripe.refunds.create({
      payment_intent: params.paymentIntentId,
      amount: params.amount,
      reason: params.reason
    })
  }

  async getRefund(refundId: string) {
    return this.stripe.refunds.retrieve(refundId)
  }

  /**
   * Usage Records (for metered billing)
   */
  async createUsageRecord(params: {
    subscriptionItemId: string
    quantity: number
    timestamp?: number
    action?: 'increment' | 'set'
  }) {
    return this.stripe.subscriptionItems.createUsageRecord(
      params.subscriptionItemId,
      {
        quantity: params.quantity,
        timestamp: params.timestamp || Math.floor(Date.now() / 1000),
        action: params.action || 'increment'
      }
    )
  }
}

/**
 * Helper: Format price for display
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100)
}

/**
 * Helper: Get subscription status color
 */
export function getSubscriptionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'green',
    trialing: 'blue',
    past_due: 'yellow',
    canceled: 'red',
    unpaid: 'red',
    incomplete: 'gray'
  }
  return colors[status] || 'gray'
}

/**
 * Example usage
 */
export async function examples() {
  const stripe = new StripeClient()

  // Create customer
  const customer = await stripe.createCustomer({
    email: 'user@example.com',
    name: 'John Doe',
    metadata: { userId: '123' }
  })

  console.log('Customer created:', customer.id)

  // Create one-time payment
  const paymentIntent = await stripe.createPaymentIntent({
    amount: 2999, // $29.99
    customerId: customer.id,
    description: 'Premium Plan'
  })

  console.log('Payment Intent:', paymentIntent.client_secret)

  // Create subscription
  const subscription = await stripe.createSubscription({
    customerId: customer.id,
    priceId: 'price_123',
    trialPeriodDays: 14
  })

  console.log('Subscription created:', subscription.id)

  // Create checkout session
  const session = await stripe.createCheckoutSession({
    customerEmail: 'user@example.com',
    lineItems: [
      { priceId: 'price_123', quantity: 1 }
    ],
    mode: 'subscription',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel'
  })

  console.log('Checkout URL:', session.url)

  // Format price
  console.log('Price:', formatPrice(2999)) // $29.99
}

// Export singleton instance
let instance: StripeClient | null = null

export function getStripeClient(config?: StripeConfig): StripeClient {
  if (!instance) {
    instance = new StripeClient(config)
  }
  return instance
}
