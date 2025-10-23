# Event-Driven Architecture Pattern

**Problem:** Need to build scalable, decoupled systems where components react to events rather than direct calls.

**Solution:** Event-driven architecture using events, message queues, and event sourcing patterns.

---

## When to Use

✅ **Use event-driven architecture when:**
- Need to decouple services (microservices)
- Building real-time systems (notifications, updates)
- Require audit trails (event sourcing)
- Scaling independently (async processing)
- Integration across systems (pub/sub)

❌ **Don't use when:**
- Simple CRUD applications
- Need immediate consistency
- Debugging/tracing is critical
- Small team (adds complexity)

---

## Pattern: Basic Event-Driven System

### Architecture

```
Producer → Event Bus → Consumer(s)

Example:
Order Service → RabbitMQ → [Email Service, Inventory Service, Analytics]
```

### Implementation (Node.js + RabbitMQ)

**Producer:**
```typescript
import amqp from 'amqplib'

export async function publishEvent(eventType: string, data: any) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!)
  const channel = await connection.createChannel()

  const exchange = 'events'
  await channel.assertExchange(exchange, 'topic', { durable: true })

  const event = {
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
    id: crypto.randomUUID()
  }

  channel.publish(
    exchange,
    eventType,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  )

  console.log(`Published event: ${eventType}`, event.id)
  await channel.close()
  await connection.close()
}

// Usage
await publishEvent('order.created', {
  orderId: '12345',
  userId: 'user_abc',
  total: 99.99
})
```

**Consumer:**
```typescript
import amqp from 'amqplib'

export async function consumeEvents(eventType: string, handler: (event: any) => Promise<void>) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!)
  const channel = await connection.createChannel()

  const exchange = 'events'
  const queue = `${eventType}_queue`

  await channel.assertExchange(exchange, 'topic', { durable: true })
  await channel.assertQueue(queue, { durable: true })
  await channel.bindQueue(queue, exchange, eventType)

  channel.consume(queue, async (msg) => {
    if (msg) {
      try {
        const event = JSON.parse(msg.content.toString())
        await handler(event)
        channel.ack(msg)
      } catch (error) {
        console.error('Event processing failed:', error)
        channel.nack(msg, false, true) // Requeue
      }
    }
  })

  console.log(`Consuming events: ${eventType}`)
}

// Usage - Email Service
await consumeEvents('order.created', async (event) => {
  await sendOrderConfirmationEmail(event.data.userId, event.data.orderId)
})

// Usage - Inventory Service
await consumeEvents('order.created', async (event) => {
  await decrementInventory(event.data.orderId)
})
```

---

## Pattern: Event Sourcing

### Concept

**Traditional:** Store current state
**Event Sourcing:** Store all events, rebuild state from events

### Implementation

**Event Store:**
```typescript
// events table
interface Event {
  id: string
  aggregateId: string // e.g., orderId
  aggregateType: string // e.g., 'Order'
  eventType: string
  data: any
  timestamp: Date
  version: number
}

// Save event
export async function appendEvent(event: Omit<Event, 'id' | 'timestamp'>) {
  return await db.events.create({
    data: {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }
  })
}

// Get all events for aggregate
export async function getEvents(aggregateId: string) {
  return await db.events.findMany({
    where: { aggregateId },
    orderBy: { version: 'asc' }
  })
}

// Rebuild state from events
export async function rebuildAggregate(aggregateId: string) {
  const events = await getEvents(aggregateId)

  let state = createInitialState()

  for (const event of events) {
    state = applyEvent(state, event)
  }

  return state
}

function applyEvent(state: OrderState, event: Event): OrderState {
  switch (event.eventType) {
    case 'OrderCreated':
      return { ...state, ...event.data, status: 'created' }

    case 'OrderPaid':
      return { ...state, status: 'paid', paidAt: event.timestamp }

    case 'OrderShipped':
      return { ...state, status: 'shipped', shippedAt: event.timestamp }

    case 'OrderCancelled':
      return { ...state, status: 'cancelled', cancelledAt: event.timestamp }

    default:
      return state
  }
}
```

**Example Usage:**
```typescript
// Create order
await appendEvent({
  aggregateId: 'order_123',
  aggregateType: 'Order',
  eventType: 'OrderCreated',
  data: { userId: 'user_abc', items: [...], total: 99.99 },
  version: 1
})

// Pay for order
await appendEvent({
  aggregateId: 'order_123',
  aggregateType: 'Order',
  eventType: 'OrderPaid',
  data: { paymentMethod: 'credit_card' },
  version: 2
})

// Get current order state
const order = await rebuildAggregate('order_123')
// Result: { userId: 'user_abc', items: [...], total: 99.99, status: 'paid', paidAt: '2025-10-22...' }
```

---

## Pattern: CQRS (Command Query Responsibility Segregation)

### Concept

Separate read and write operations:
- **Commands:** Change state (write)
- **Queries:** Read state (read)

### Architecture

```
Commands → Write Model → Events → Event Store
                               ↓
                        Read Model (Projection)
                               ↑
Queries ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Implementation

**Write Model (Commands):**
```typescript
// Command handlers (write operations)
export async function createOrder(command: CreateOrderCommand) {
  // Validate
  if (!command.userId || !command.items.length) {
    throw new Error('Invalid order')
  }

  // Create event
  const event = {
    aggregateId: crypto.randomUUID(),
    aggregateType: 'Order',
    eventType: 'OrderCreated',
    data: command,
    version: 1
  }

  // Save to event store
  await appendEvent(event)

  // Publish event
  await publishEvent('order.created', event)

  return event.aggregateId
}
```

**Read Model (Queries):**
```typescript
// Read model (optimized for queries)
// Updated by event handlers
interface OrderReadModel {
  id: string
  userId: string
  status: string
  total: number
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

// Event handler updates read model
await consumeEvents('order.created', async (event) => {
  await db.orders.create({
    data: {
      id: event.aggregateId,
      userId: event.data.userId,
      status: 'created',
      total: event.data.total,
      itemCount: event.data.items.length,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
})

// Query handler (fast reads from read model)
export async function getOrdersByUser(userId: string) {
  return await db.orders.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })
}
```

---

## Message Queues

### RabbitMQ vs SQS vs Kafka

| Feature | RabbitMQ | AWS SQS | Apache Kafka |
|---------|----------|---------|--------------|
| **Best For** | General pub/sub | AWS ecosystem | High throughput |
| **Ordering** | Yes | FIFO queues | Yes (partitions) |
| **Persistence** | Yes | Yes | Yes (long-term) |
| **Complexity** | Medium | Low | High |
| **Cost** | Self-hosted | Pay per message | Self-hosted |

### When to Use Each

**RabbitMQ:**
- General event-driven systems
- Multiple consumers per event
- Need flexible routing

**SQS:**
- AWS-only infrastructure
- Simple queue needs
- Want managed service

**Kafka:**
- High-volume event streaming
- Event replay needed
- Analytics pipelines

---

## Best Practices

### Event Design

**Good Event:**
```typescript
{
  id: 'evt_123',
  type: 'order.created',
  timestamp: '2025-10-22T14:30:00Z',
  data: {
    orderId: 'order_123',
    userId: 'user_abc',
    total: 99.99,
    items: [...]
  },
  metadata: {
    source: 'order-service',
    version: '1.0',
    correlationId: 'req_abc'
  }
}
```

**Event Naming:**
- Past tense: `order.created` (not `create.order`)
- Specific: `payment.succeeded` (not `payment.done`)
- Versioned: `order.created.v2` if schema changes

### Idempotency

Handle duplicate events:

```typescript
async function handleOrderCreated(event: Event) {
  // Check if already processed
  const existing = await db.events.findUnique({
    where: { id: event.id }
  })

  if (existing) {
    console.log('Event already processed:', event.id)
    return // Skip
  }

  // Process event
  await processOrder(event.data)

  // Mark as processed
  await db.processedEvents.create({
    data: { id: event.id, processedAt: new Date() }
  })
}
```

### Error Handling

**Dead Letter Queue:**
```typescript
// Retry logic
let retries = 0
const MAX_RETRIES = 3

async function processWithRetry(event: Event) {
  try {
    await handler(event)
  } catch (error) {
    retries++

    if (retries >= MAX_RETRIES) {
      // Move to dead letter queue
      await publishEvent('dlq.order.created', {
        originalEvent: event,
        error: error.message,
        retries
      })
    } else {
      // Retry with exponential backoff
      const delay = Math.pow(2, retries) * 1000
      await sleep(delay)
      await processWithRetry(event)
    }
  }
}
```

---

## Trade-offs

### Pros
- ✅ Loose coupling (services independent)
- ✅ Scalability (async processing)
- ✅ Audit trail (event history)
- ✅ Fault tolerance (retry logic)
- ✅ Real-time capabilities (push updates)

### Cons
- ❌ Eventual consistency (not immediate)
- ❌ Complexity (debugging harder)
- ❌ Message ordering challenges
- ❌ Duplicate events (need idempotency)
- ❌ Infrastructure overhead (message brokers)

---

## Related Patterns

- **Saga Pattern** - Distributed transactions across services
- **Outbox Pattern** - Reliable event publishing
- **Event Sourcing** - Store all state changes as events

---

## Further Reading

- [Event-Driven Architecture (Martin Fowler)](https://martinfowler.com/articles/201701-event-driven.html)
- [CQRS Pattern](https://microservices.io/patterns/data/cqrs.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
