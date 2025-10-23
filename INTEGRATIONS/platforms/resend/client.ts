/**
 * Resend Email Integration
 *
 * Complete Resend integration for transactional emails.
 *
 * Features:
 * - Send emails
 * - Email templates (React components)
 * - Batch sending
 * - Attachments
 * - CC/BCC
 * - Reply-to
 * - Type-safe with Resend types
 *
 * Setup:
 * ```bash
 * npm install resend react-email @react-email/components
 * ```
 *
 * Environment:
 * ```
 * RESEND_API_KEY=re_...
 * RESEND_FROM_EMAIL=noreply@yourdomain.com
 * ```
 */

import { Resend } from 'resend'

export interface ResendConfig {
  apiKey?: string
  fromEmail?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  react?: React.ReactElement
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  from?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
  }>
  tags?: Array<{
    name: string
    value: string
  }>
}

export class ResendClient {
  private resend: Resend
  private fromEmail: string

  constructor(config: ResendConfig = {}) {
    const apiKey = config.apiKey || process.env.RESEND_API_KEY

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required')
    }

    this.fromEmail = config.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@example.com'
    this.resend = new Resend(apiKey)
  }

  /**
   * Send single email
   */
  async send(options: EmailOptions) {
    return this.resend.emails.send({
      from: options.from || this.fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      react: options.react,
      cc: options.cc,
      bcc: options.bcc,
      reply_to: options.replyTo,
      attachments: options.attachments,
      tags: options.tags
    })
  }

  /**
   * Send batch emails (up to 100 at once)
   */
  async sendBatch(emails: EmailOptions[]) {
    return this.resend.batch.send(
      emails.map(email => ({
        from: email.from || this.fromEmail,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
        react: email.react,
        cc: email.cc,
        bcc: email.bcc,
        reply_to: email.replyTo,
        attachments: email.attachments,
        tags: email.tags
      }))
    )
  }

  /**
   * Get email by ID
   */
  async getEmail(emailId: string) {
    return this.resend.emails.get(emailId)
  }

  /**
   * Cancel scheduled email
   */
  async cancelEmail(emailId: string) {
    return this.resend.emails.cancel(emailId)
  }
}

/**
 * Pre-built email templates
 */
export const EmailTemplates = {
  /**
   * Welcome email
   */
  welcome: (name: string) => ({
    subject: 'Welcome to our platform!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Thanks for signing up. We're excited to have you on board.</p>
      <p>Get started by exploring our features:</p>
      <ul>
        <li>Feature 1</li>
        <li>Feature 2</li>
        <li>Feature 3</li>
      </ul>
      <p>If you have any questions, just reply to this email.</p>
      <p>Best regards,<br>The Team</p>
    `
  }),

  /**
   * Email verification
   */
  verification: (verificationUrl: string) => ({
    subject: 'Verify your email address',
    html: `
      <h1>Verify Your Email</h1>
      <p>Click the button below to verify your email address:</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link: ${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
    `
  }),

  /**
   * Password reset
   */
  passwordReset: (resetUrl: string) => ({
    subject: 'Reset your password',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link: ${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  }),

  /**
   * Magic link login
   */
  magicLink: (loginUrl: string) => ({
    subject: 'Your magic login link',
    html: `
      <h1>Sign In to Your Account</h1>
      <p>Click the button below to sign in:</p>
      <p>
        <a href="${loginUrl}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Sign In
        </a>
      </p>
      <p>Or copy and paste this link: ${loginUrl}</p>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  }),

  /**
   * Payment receipt
   */
  paymentReceipt: (params: {
    amount: string
    date: string
    invoiceUrl: string
  }) => ({
    subject: 'Payment Receipt',
    html: `
      <h1>Payment Received</h1>
      <p>Thank you for your payment!</p>
      <p><strong>Amount:</strong> ${params.amount}</p>
      <p><strong>Date:</strong> ${params.date}</p>
      <p>
        <a href="${params.invoiceUrl}">View Invoice</a>
      </p>
      <p>Questions? Reply to this email.</p>
    `
  }),

  /**
   * Subscription confirmation
   */
  subscriptionConfirmation: (params: {
    plan: string
    amount: string
    billingDate: string
  }) => ({
    subject: 'Subscription Confirmed',
    html: `
      <h1>Subscription Confirmed!</h1>
      <p>You're now subscribed to the <strong>${params.plan}</strong> plan.</p>
      <p><strong>Amount:</strong> ${params.amount}/month</p>
      <p><strong>Next billing date:</strong> ${params.billingDate}</p>
      <p>You can manage your subscription in your account settings.</p>
    `
  }),

  /**
   * Trial ending reminder
   */
  trialEnding: (daysLeft: number) => ({
    subject: `Your trial ends in ${daysLeft} days`,
    html: `
      <h1>Trial Ending Soon</h1>
      <p>Your free trial ends in <strong>${daysLeft} days</strong>.</p>
      <p>To continue enjoying our service, please add a payment method to your account.</p>
      <p>
        <a href="https://example.com/billing" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Add Payment Method
        </a>
      </p>
    `
  }),

  /**
   * Account deletion confirmation
   */
  accountDeleted: () => ({
    subject: 'Account Deleted',
    html: `
      <h1>Account Deleted</h1>
      <p>Your account has been permanently deleted as requested.</p>
      <p>All your data has been removed from our systems.</p>
      <p>We're sorry to see you go. If you change your mind, you can always create a new account.</p>
    `
  })
}

/**
 * Example usage
 */
export async function examples() {
  const resend = new ResendClient()

  // Send welcome email
  await resend.send({
    to: 'user@example.com',
    ...EmailTemplates.welcome('John')
  })

  // Send verification email
  await resend.send({
    to: 'user@example.com',
    ...EmailTemplates.verification('https://example.com/verify?token=abc123')
  })

  // Send password reset
  await resend.send({
    to: 'user@example.com',
    ...EmailTemplates.passwordReset('https://example.com/reset?token=xyz789')
  })

  // Send custom email with attachment
  await resend.send({
    to: 'user@example.com',
    subject: 'Your Report',
    html: '<h1>Here is your report</h1>',
    attachments: [
      {
        filename: 'report.pdf',
        content: Buffer.from('PDF content here')
      }
    ]
  })

  // Send batch emails
  await resend.sendBatch([
    {
      to: 'user1@example.com',
      subject: 'Hello User 1',
      html: '<p>Message for user 1</p>'
    },
    {
      to: 'user2@example.com',
      subject: 'Hello User 2',
      html: '<p>Message for user 2</p>'
    }
  ])
}

// Export singleton instance
let instance: ResendClient | null = null

export function getResendClient(config?: ResendConfig): ResendClient {
  if (!instance) {
    instance = new ResendClient(config)
  }
  return instance
}
