# Serverless Architecture Pattern

**Problem:** Managing servers, scaling, and infrastructure is expensive and time-consuming.

**Solution:** Use cloud functions (AWS Lambda, Vercel Functions, Cloudflare Workers) that auto-scale and charge only for execution time.

---

## When to Use

✅ **Use serverless when:**
- Variable/unpredictable traffic (scale to zero)
- Event-driven workloads (triggers, webhooks)
- Rapid prototyping (no infrastructure setup)
- Cost-sensitive (pay per use, not per hour)
- Microservices architecture
- Background jobs (image processing, emails)

❌ **Don't use when:**
- Long-running tasks (> 15 min)
- Stateful applications (need persistent connections)
- Predictable high traffic (dedicated servers cheaper)
- Cold start latency critical (< 100ms required)
- Complex local development needed

---

## Serverless Platforms Comparison

| Platform | Best For | Runtime Limit | Cold Start | Pricing |
|----------|----------|---------------|------------|---------|
| **AWS Lambda** | Enterprise, complex workflows | 15 min | 100-1000ms | $0.20/1M requests |
| **Vercel Functions** | Next.js, frontend devs | 60s (300s Pro) | 50-200ms | Free: 100GB-hrs |
| **Cloudflare Workers** | Edge computing, global | 30s (no limit paid) | < 10ms | Free: 100K requests/day |
| **Netlify Functions** | JAMstack, simple APIs | 10s (26s paid) | 100-500ms | Free: 125K reqs |

---

## Pattern 1: API Endpoints (Vercel Functions)

### Use Case: REST API

**File Structure:**
```
app/
├── api/
│   ├── users/
│   │   └── route.ts        # GET /api/users
│   ├── users/[id]/
│   │   └── route.ts        # GET /api/users/:id
│   └── webhooks/
│       └── stripe/
│           └── route.ts     # POST /api/webhooks/stripe
```

**Implementation:**
```typescript
// app/api/users/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'

// GET /api/users
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const users = await db.users.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: { id: true, email: true, name: true }
  })

  return Response.json({ users, page, limit })
}

// POST /api/users
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createUserSchema.parse(body)

    const hashedPassword = await hashPassword(data.password)

    const user = await db.users.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword
      },
      select: { id: true, email: true, name: true }
    })

    return Response.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 })
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Environment Variables:**
```bash
# .env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
```

---

## Pattern 2: Background Jobs (AWS Lambda)

### Use Case: Image Processing on Upload

**Trigger: S3 Upload**
```typescript
// lambda/image-processor.ts
import { S3Event } from 'aws-lambda'
import sharp from 'sharp'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: 'us-east-1' })

export async function handler(event: S3Event) {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name
    const key = record.s3.object.key

    // Get original image
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key })
    const { Body } = await s3.send(getCommand)
    const imageBuffer = await Body!.transformToByteArray()

    // Resize image
    const resized = await sharp(Buffer.from(imageBuffer))
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Save thumbnail
    const thumbnailKey = key.replace('uploads/', 'thumbnails/')
    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: thumbnailKey,
      Body: resized,
      ContentType: 'image/jpeg'
    })
    await s3.send(putCommand)

    console.log(`Processed: ${key} → ${thumbnailKey}`)
  }
}
```

**Infrastructure (Terraform):**
```hcl
resource "aws_lambda_function" "image_processor" {
  filename      = "lambda.zip"
  function_name = "image-processor"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 60
  memory_size   = 1024

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.images.bucket
    }
  }
}

resource "aws_s3_bucket_notification" "image_upload" {
  bucket = aws_s3_bucket.images.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.image_processor.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
  }
}
```

---

## Pattern 3: Scheduled Tasks (Cron Jobs)

### Use Case: Daily Database Cleanup

**Vercel Cron:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

```typescript
// app/api/cron/cleanup/route.ts
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete old sessions (> 30 days)
  const deleted = await db.sessions.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  })

  console.log(`Deleted ${deleted.count} expired sessions`)

  return Response.json({ deleted: deleted.count })
}
```

---

## Pattern 4: Edge Functions (Cloudflare Workers)

### Use Case: Global CDN with Dynamic Content

**Ultra-low latency (runs at edge, near users):**
```typescript
// worker.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // A/B testing at edge
    const variant = Math.random() < 0.5 ? 'A' : 'B'

    // Geolocation
    const country = request.cf?.country || 'US'

    // Feature flags
    const showNewFeature = country === 'US' && variant === 'B'

    // Fetch from origin with added headers
    const response = await fetch(request, {
      cf: { cacheEverything: true, cacheTtl: 60 }
    })

    // Modify response
    const modifiedResponse = new Response(response.body, response)
    modifiedResponse.headers.set('X-Variant', variant)
    modifiedResponse.headers.set('X-Country', country)

    return modifiedResponse
  }
}
```

**Use Cases for Edge:**
- A/B testing
- Geolocation routing
- Bot detection
- Authentication at edge
- Image optimization

---

## Pattern 5: Webhooks (Event-Driven)

### Use Case: Stripe Payment Webhook

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailure(failedPayment)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return Response.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  await db.orders.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paidAt: new Date()
    }
  })

  // Send confirmation email
  await sendEmail({
    to: paymentIntent.receipt_email!,
    subject: 'Payment Successful',
    body: `Your order ${orderId} has been confirmed.`
  })
}
```

---

## Cold Start Optimization

### Problem: First request slow (100-1000ms)

### Solutions:

**1. Keep Functions Warm (Pinging)**
```typescript
// Ping every 5 minutes to keep warm
setInterval(async () => {
  await fetch('https://your-api.com/api/health')
}, 5 * 60 * 1000)
```

**2. Reduce Bundle Size**
```typescript
// ❌ Bad: Import entire library
import _ from 'lodash'

// ✅ Good: Import only what you need
import debounce from 'lodash/debounce'
```

**3. Use Edge Runtime (Vercel)**
```typescript
// app/api/fast/route.ts
export const runtime = 'edge' // Cold start < 50ms

export async function GET() {
  return Response.json({ message: 'Fast!' })
}
```

**4. Connection Pooling**
```typescript
import { PrismaClient } from '@prisma/client'

// Reuse client across invocations
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=1'
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Cost Optimization

### Strategies:

**1. Cache Aggressively**
```typescript
// Cache at CDN level
export async function GET(req: Request) {
  const data = await getExpensiveData()

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

**2. Batch Operations**
```typescript
// ❌ Bad: One function per email
for (const user of users) {
  await sendEmail(user.email)
}

// ✅ Good: Batch processing
await sendBatchEmails(users.map(u => u.email))
```

**3. Use Appropriate Memory**
```typescript
// AWS Lambda
export const handler = async (event) => {
  // Less memory = cheaper but slower
  // More memory = faster but expensive
  // Test to find sweet spot (usually 512MB-1024MB)
}
```

**4. Choose Right Platform**
```
Simple API + Next.js → Vercel (free tier generous)
Edge computing → Cloudflare (100K free requests/day)
Complex workflows → AWS Lambda (mature ecosystem)
```

---

## Monitoring & Debugging

### Logging
```typescript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Order processed',
  orderId: order.id,
  duration: Date.now() - startTime,
  memory: process.memoryUsage().heapUsed / 1024 / 1024
}))
```

### Error Tracking
```typescript
import * as Sentry from '@sentry/nextjs'

export async function POST(req: Request) {
  try {
    // Your code
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        function: 'create-order',
        userId: user.id
      }
    })
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### Performance Monitoring
```typescript
const start = Date.now()

// Your function code

const duration = Date.now() - start
console.log(`Function execution: ${duration}ms`)

if (duration > 5000) {
  console.warn('Slow function detected!')
}
```

---

## Best Practices

### 1. Idempotency
```typescript
// Handle duplicate webhook deliveries
async function processWebhook(webhookId: string, data: any) {
  // Check if already processed
  const existing = await db.processedWebhooks.findUnique({
    where: { id: webhookId }
  })

  if (existing) {
    return { alreadyProcessed: true }
  }

  // Process
  await processOrder(data)

  // Mark as processed
  await db.processedWebhooks.create({
    data: { id: webhookId, processedAt: new Date() }
  })

  return { success: true }
}
```

### 2. Timeout Handling
```typescript
// Set timeout lower than platform limit
const TIMEOUT = 25000 // 25s (Vercel limit is 60s)

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const data = await fetch('https://slow-api.com', {
      signal: controller.signal
    })
    return Response.json(data)
  } catch (error) {
    if (error.name === 'AbortError') {
      return Response.json({ error: 'Timeout' }, { status: 504 })
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
```

### 3. Environment Configuration
```typescript
// Validate env vars at startup
const config = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  STRIPE_KEY: z.string().startsWith('sk_')
}).parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  STRIPE_KEY: process.env.STRIPE_KEY
})

// Type-safe config available throughout function
```

---

## Trade-offs

### Pros
- ✅ Auto-scaling (handle any load)
- ✅ Pay per use (cost-effective for variable traffic)
- ✅ No server management
- ✅ Fast deployment
- ✅ Built-in high availability

### Cons
- ❌ Cold starts (latency)
- ❌ Stateless (can't maintain connections)
- ❌ Vendor lock-in (platform-specific)
- ❌ Debugging harder (distributed logs)
- ❌ Local development different from production

---

## Migration Strategy

### From Traditional Server to Serverless

**Step 1: Identify candidates**
- API endpoints (good fit)
- Background jobs (good fit)
- Long-running processes (bad fit)

**Step 2: Start small**
```
Migrate webhooks first → Low risk, high value
Then API endpoints → Medium complexity
Finally background jobs → May need refactoring
```

**Step 3: Hybrid approach**
```
API Gateway (serverless) → [Traditional servers, Serverless functions]
Use best tool for each job
```

---

## Related Patterns

- **Event-Driven Architecture** - Serverless excels with events
- **Microservices** - Serverless = tiny microservices
- **JAMstack** - Static sites + serverless APIs

---

## Further Reading

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Vercel Functions Docs](https://vercel.com/docs/functions)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
