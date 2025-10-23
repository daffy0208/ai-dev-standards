# Microservices Architecture Pattern

**Problem:** Monolithic applications become hard to scale, deploy, and maintain as they grow.

**Solution:** Split application into small, independent services that communicate via APIs.

---

## When to Use

✅ **Use microservices when:**
- Large team (10+ developers)
- Need independent scaling (different services have different loads)
- Multiple programming languages required
- Independent deployment needed (deploy services separately)
- Clear service boundaries (bounded contexts)

❌ **Don't use when:**
- Small team (< 5 developers) - overhead too high
- Simple application - monolith is fine
- Tight coupling required - microservices add latency
- Distributed transactions needed - very complex
- Starting new project - start monolith, split later

---

## Pattern: Service Decomposition

### By Business Capability

```
Monolith:
┌─────────────────────┐
│   E-commerce App    │
│  (everything here)  │
└─────────────────────┘

Microservices:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Users   │  │ Products │  │  Orders  │  │ Payments │
│ Service  │  │ Service  │  │ Service  │  │ Service  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Service Boundaries

**Good Service (Single Responsibility):**
```
Order Service:
- Create order
- Update order status
- Get order details
- Cancel order

Database: orders table
```

**Bad Service (Too Broad):**
```
E-commerce Service:
- Users
- Products
- Orders
- Payments
- Shipping

Database: all tables
(This is just a monolith!)
```

---

## Communication Patterns

### 1. Synchronous (REST/gRPC)

**REST APIs:**
```typescript
// Order Service calls Payment Service
async function createOrder(orderData: OrderData) {
  // Create order in local DB
  const order = await db.orders.create({ data: orderData })

  // Call Payment Service (synchronous)
  const paymentResponse = await fetch('http://payment-service/api/charge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: order.id,
      amount: order.total,
      userId: order.userId
    })
  })

  if (!paymentResponse.ok) {
    // Handle payment failure
    await db.orders.update({
      where: { id: order.id },
      data: { status: 'payment_failed' }
    })
    throw new Error('Payment failed')
  }

  return order
}
```

### 2. Asynchronous (Message Queue)

**Event-Driven:**
```typescript
// Order Service publishes event
async function createOrder(orderData: OrderData) {
  const order = await db.orders.create({ data: orderData })

  // Publish event (async)
  await publishEvent('order.created', {
    orderId: order.id,
    userId: order.userId,
    total: order.total
  })

  return order
}

// Payment Service subscribes
await consumeEvents('order.created', async (event) => {
  await processPayment(event.data)
})

// Email Service subscribes
await consumeEvents('order.created', async (event) => {
  await sendOrderConfirmation(event.data.userId)
})
```

---

## API Gateway Pattern

**Problem:** Clients need to call multiple services

**Solution:** Single entry point that routes requests

```
Client → API Gateway → [User Service, Product Service, Order Service]
```

**Implementation (Next.js API Routes as Gateway):**
```typescript
// app/api/products/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  // Call Product Service
  const product = await fetch(`http://product-service/products/${params.id}`)
    .then(res => res.json())

  // Call Inventory Service
  const inventory = await fetch(`http://inventory-service/stock/${params.id}`)
    .then(res => res.json())

  // Call Review Service
  const reviews = await fetch(`http://review-service/reviews?productId=${params.id}`)
    .then(res => res.json())

  // Aggregate response
  return Response.json({
    ...product,
    inStock: inventory.quantity > 0,
    reviews: reviews.data
  })
}
```

---

## Service Discovery

**Problem:** Services need to find each other (dynamic IPs in cloud)

**Solutions:**

### 1. Environment Variables (Simple)
```bash
# .env
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003
```

### 2. DNS (Docker/Kubernetes)
```typescript
// Services discover via service name
const response = await fetch('http://user-service/api/users/123')
```

### 3. Service Registry (Consul, Eureka)
```typescript
import { Consul } from 'consul'

const consul = new Consul()

// Register service
await consul.agent.service.register({
  name: 'order-service',
  address: 'localhost',
  port: 3003,
  check: {
    http: 'http://localhost:3003/health',
    interval: '10s'
  }
})

// Discover service
const services = await consul.catalog.service.nodes('user-service')
const userServiceUrl = `http://${services[0].ServiceAddress}:${services[0].ServicePort}`
```

---

## Data Management

### Database Per Service

**Each service owns its data:**
```
User Service    → Users DB (PostgreSQL)
Product Service → Products DB (PostgreSQL)
Order Service   → Orders DB (PostgreSQL)
```

**Benefits:**
- Independent scaling
- Technology flexibility (different DBs)
- Clear ownership

**Challenges:**
- No joins across services
- Distributed transactions hard
- Data duplication

### Saga Pattern (Distributed Transactions)

**Problem:** Need to update multiple services atomically

**Example:** Create order = Reserve inventory + Charge payment + Update order

**Choreography Saga:**
```typescript
// Order Service
async function createOrder(orderData) {
  const order = await db.orders.create({
    data: { ...orderData, status: 'pending' }
  })

  await publishEvent('order.created', { orderId: order.id, ...orderData })
}

// Inventory Service
await consumeEvents('order.created', async (event) => {
  try {
    await reserveInventory(event.data.items)
    await publishEvent('inventory.reserved', { orderId: event.data.orderId })
  } catch (error) {
    await publishEvent('inventory.reservation_failed', { orderId: event.data.orderId })
  }
})

// Payment Service
await consumeEvents('inventory.reserved', async (event) => {
  try {
    await chargePayment(event.data)
    await publishEvent('payment.succeeded', { orderId: event.data.orderId })
  } catch (error) {
    await publishEvent('payment.failed', { orderId: event.data.orderId })
  }
})

// Order Service (listen for completion or failure)
await consumeEvents('payment.succeeded', async (event) => {
  await db.orders.update({
    where: { id: event.data.orderId },
    data: { status: 'completed' }
  })
})

await consumeEvents('payment.failed', async (event) => {
  await db.orders.update({
    where: { id: event.data.orderId },
    data: { status: 'failed' }
  })
  // Compensating transaction: release inventory
  await publishEvent('inventory.release', { orderId: event.data.orderId })
})
```

---

## Deployment Patterns

### Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - USER_SERVICE_URL=http://user-service:3001

  user-service:
    build: ./user-service
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@user-db:5432/users

  user-db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=users

  product-service:
    build: ./product-service
    ports:
      - "3002:3002"

  order-service:
    build: ./order-service
    ports:
      - "3003:3003"
```

### Kubernetes (Production)

```yaml
# order-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
      - name: order-service
        image: order-service:1.0.0
        ports:
        - containerPort: 3003
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: order-db-secret
              key: url
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
  - port: 80
    targetPort: 3003
  type: ClusterIP
```

---

## Observability

### Distributed Tracing

**Problem:** Request spans multiple services, hard to debug

**Solution:** Trace requests across services

```typescript
import { trace } from '@opentelemetry/api'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://jaeger:14268/api/traces'
  })
})

sdk.start()

// In your service
const tracer = trace.getTracer('order-service')

export async function createOrder(orderData) {
  return await tracer.startActiveSpan('create-order', async (span) => {
    span.setAttribute('order.userId', orderData.userId)

    const order = await db.orders.create({ data: orderData })

    // Call other service (trace propagates)
    await fetch('http://payment-service/charge', {
      headers: {
        'traceparent': span.spanContext().traceId // Propagate trace
      }
    })

    span.end()
    return order
  })
}
```

### Centralized Logging

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: {
    service: 'order-service',
    version: '1.0.0'
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.Http({
      host: 'logstash',
      port: 5000
    })
  ]
})

logger.info('Order created', {
  orderId: order.id,
  userId: order.userId,
  total: order.total,
  traceId: req.headers['x-trace-id']
})
```

---

## Best Practices

### 1. Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  // Check database
  const dbHealthy = await checkDatabase()

  // Check dependencies
  const userServiceHealthy = await fetch('http://user-service/health')
    .then(() => true)
    .catch(() => false)

  const healthy = dbHealthy && userServiceHealthy

  return Response.json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks: {
      database: dbHealthy ? 'up' : 'down',
      userService: userServiceHealthy ? 'up' : 'down'
    }
  }, { status: healthy ? 200 : 503 })
}
```

### 2. Circuit Breaker

**Prevent cascading failures:**

```typescript
import CircuitBreaker from 'opossum'

const breaker = new CircuitBreaker(
  async (userId: string) => {
    return await fetch(`http://user-service/users/${userId}`)
      .then(res => res.json())
  },
  {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  }
)

breaker.fallback(() => ({
  id: 'unknown',
  name: 'User Service Unavailable'
}))

// Use breaker
const user = await breaker.fire(userId)
```

### 3. API Versioning

```typescript
// v1 API
app.get('/api/v1/orders/:id', async (req, res) => {
  // Old implementation
})

// v2 API (breaking changes)
app.get('/api/v2/orders/:id', async (req, res) => {
  // New implementation
})

// Both versions running simultaneously
```

---

## Monolith to Microservices Migration

### Strategy: Strangler Fig Pattern

**Don't rewrite everything at once!**

```
Step 1: Identify bounded context
Step 2: Extract one service
Step 3: Route some traffic to new service
Step 4: Gradually migrate all traffic
Step 5: Remove code from monolith
Step 6: Repeat for next service
```

**Example:**
```
Iteration 1:
Client → API Gateway → Monolith (users, products, orders)

Iteration 2:
Client → API Gateway → [User Service (new!), Monolith (products, orders)]

Iteration 3:
Client → API Gateway → [User Service, Product Service (new!), Monolith (orders)]

Iteration 4:
Client → API Gateway → [User Service, Product Service, Order Service (new!)]
Monolith deleted! ✅
```

---

## Trade-offs

### Pros
- ✅ Independent scaling
- ✅ Independent deployment
- ✅ Technology flexibility
- ✅ Team autonomy
- ✅ Fault isolation

### Cons
- ❌ Complexity (distributed systems hard)
- ❌ Network latency (service-to-service calls)
- ❌ Data consistency challenges
- ❌ Testing complexity
- ❌ Operational overhead

---

## Decision Matrix: Monolith vs Microservices

| Factor | Monolith | Microservices |
|--------|----------|---------------|
| Team Size | < 10 | 10+ |
| Complexity | Simple-Medium | Medium-High |
| Deployment | All at once | Independent |
| Scaling | Vertical | Horizontal |
| Development Speed | Fast initially | Slower initially |
| Operational Cost | Low | High |

**Rule of Thumb:** Start monolith, migrate to microservices when you feel the pain.

---

## Related Patterns

- **Event-Driven Architecture** - Async communication between services
- **API Gateway** - Single entry point
- **Service Mesh** - Infrastructure layer for service communication
- **CQRS** - Separate read/write models across services

---

## Further Reading

- [Microservices.io](https://microservices.io/patterns/index.html)
- [Building Microservices (Sam Newman)](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/)
- [Martin Fowler on Microservices](https://martinfowler.com/articles/microservices.html)
