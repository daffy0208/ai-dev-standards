# Real-Time Systems Pattern

**Problem:** Need to push data to clients immediately (not polling), enable real-time collaboration, or stream live updates.

**Solution:** WebSockets, Server-Sent Events (SSE), or real-time databases for bi-directional or uni-directional communication.

---

## When to Use

✅ **Use real-time systems when:**
- Chat/messaging applications
- Live notifications
- Collaborative editing (Google Docs-style)
- Real-time dashboards/analytics
- Live sports scores, stock tickers
- Multiplayer games
- Presence detection (who's online)

❌ **Don't use when:**
- Simple request-response (REST is fine)
- Infrequent updates (polling acceptable)
- No real-time requirement
- Limited server resources (real-time = more connections)

---

## Decision Matrix: WebSockets vs SSE vs Polling

| Feature | WebSockets | SSE | Long Polling |
|---------|------------|-----|--------------|
| **Direction** | Bi-directional | Server → Client | Client → Server |
| **Protocol** | ws:// wss:// | HTTP | HTTP |
| **Browser Support** | Excellent | Good (no IE) | Universal |
| **Complexity** | Medium | Low | Low |
| **Firewall Issues** | Possible | Rare | None |
| **Automatic Reconnect** | Manual | Automatic | N/A |
| **Best For** | Chat, games | Notifications, feeds | Simple updates |

---

## Pattern 1: WebSockets (Bi-Directional)

### Use Case: Chat Application

**Server (Node.js + Socket.io):**
```typescript
import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL }
})

// Connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Join room
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
    console.log(`${socket.id} joined room: ${roomId}`)

    // Notify others
    socket.to(roomId).emit('user-joined', { userId: socket.id })
  })

  // Handle message
  socket.on('send-message', (data: { roomId: string, message: string }) => {
    // Broadcast to room
    io.to(data.roomId).emit('new-message', {
      userId: socket.id,
      message: data.message,
      timestamp: new Date().toISOString()
    })

    // Save to database
    saveMessage(data.roomId, socket.id, data.message)
  })

  // Typing indicator
  socket.on('typing', (roomId: string) => {
    socket.to(roomId).emit('user-typing', { userId: socket.id })
  })

  // Disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

httpServer.listen(3001)
```

**Client (React):**
```typescript
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function Chat({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  // Connect to WebSocket
  useEffect(() => {
    const newSocket = io('http://localhost:3001')

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket')
      newSocket.emit('join-room', roomId)
    })

    newSocket.on('new-message', (data) => {
      setMessages((prev) => [...prev, data])
    })

    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data.userId)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [roomId])

  // Send message
  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit('send-message', { roomId, message: input })
      setInput('')
    }
  }

  // Typing indicator
  const handleTyping = () => {
    socket?.emit('typing', roomId)
  }

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.userId}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          handleTyping()
        }}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}
```

---

## Pattern 2: Server-Sent Events (SSE) - Uni-Directional

### Use Case: Live Notifications

**Server (Next.js API Route):**
```typescript
// app/api/notifications/route.ts
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Send notifications every 5 seconds (example)
      const interval = setInterval(async () => {
        const notifications = await fetchNewNotifications()

        for (const notification of notifications) {
          const data = `data: ${JSON.stringify(notification)}\n\n`
          controller.enqueue(encoder.encode(data))
        }
      }, 5000)

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

**Client:**
```typescript
import { useEffect, useState } from 'react'

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Connect to SSE
    const eventSource = new EventSource('/api/notifications')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'connected') {
        console.log('Connected to notification stream')
      } else {
        setNotifications((prev) => [data, ...prev])
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <div>
      <h2>Live Notifications</h2>
      {notifications.map((notif) => (
        <div key={notif.id}>
          {notif.message}
        </div>
      ))}
    </div>
  )
}
```

---

## Pattern 3: Real-Time Database (Supabase/Firebase)

### Use Case: Collaborative Todo List

**Setup (Supabase):**
```sql
-- Enable real-time
create table todos (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Enable real-time
alter publication supabase_realtime add table todos;
```

**Client:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    // Fetch initial data
    async function fetchTodos() {
      const { data } = await supabase.from('todos').select('*')
      setTodos(data || [])
    }
    fetchTodos()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('todos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTodos((prev) => [...prev, payload.new as Todo])
          } else if (payload.eventType === 'UPDATE') {
            setTodos((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Todo) : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTodos((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Add todo
  const addTodo = async (text: string) => {
    await supabase.from('todos').insert({ text })
    // Real-time subscription will update UI automatically
  }

  // Toggle todo
  const toggleTodo = async (id: string, completed: boolean) => {
    await supabase.from('todos').update({ completed }).eq('id', id)
  }

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => toggleTodo(todo.id, e.target.checked)}
          />
          {todo.text}
        </div>
      ))}
    </div>
  )
}
```

---

## Pattern 4: Presence Detection

### Use Case: "Who's Online" Feature

**Server (Socket.io):**
```typescript
// Track online users
const onlineUsers = new Map<string, { socketId: string, userId: string, lastSeen: Date }>()

io.on('connection', (socket) => {
  socket.on('user-online', (userId: string) => {
    onlineUsers.set(userId, {
      socketId: socket.id,
      userId,
      lastSeen: new Date()
    })

    // Broadcast to all
    io.emit('presence-update', {
      userId,
      status: 'online',
      users: Array.from(onlineUsers.values()).map(u => u.userId)
    })
  })

  socket.on('disconnect', () => {
    // Find user
    for (const [userId, user] of onlineUsers.entries()) {
      if (user.socketId === socket.id) {
        onlineUsers.delete(userId)

        io.emit('presence-update', {
          userId,
          status: 'offline',
          users: Array.from(onlineUsers.values()).map(u => u.userId)
        })
      }
    }
  })

  // Heartbeat (optional - detect stale connections)
  socket.on('heartbeat', (userId: string) => {
    const user = onlineUsers.get(userId)
    if (user) {
      user.lastSeen = new Date()
    }
  })
})
```

**Client:**
```typescript
export function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const currentUserId = 'user_123' // From auth

  useEffect(() => {
    const socket = io('http://localhost:3001')

    socket.on('connect', () => {
      socket.emit('user-online', currentUserId)
    })

    socket.on('presence-update', (data) => {
      setOnlineUsers(data.users)
    })

    // Heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      socket.emit('heartbeat', currentUserId)
    }, 30000)

    return () => {
      clearInterval(heartbeat)
      socket.disconnect()
    }
  }, [currentUserId])

  return (
    <div>
      <h3>Online Now ({onlineUsers.length})</h3>
      {onlineUsers.map(userId => (
        <div key={userId}>
          <span className="online-indicator" />
          {userId}
        </div>
      ))}
    </div>
  )
}
```

---

## Pattern 5: Operational Transform (Collaborative Editing)

### Use Case: Google Docs-Style Editing

**Concept:** Multiple users edit same document simultaneously, conflicts resolved automatically.

**Server (simplified):**
```typescript
import { Server } from 'socket.io'

interface Operation {
  type: 'insert' | 'delete'
  position: number
  character?: string
  version: number
}

const documents = new Map<string, { content: string, version: number }>()

io.on('connection', (socket) => {
  socket.on('join-document', (docId: string) => {
    socket.join(docId)

    // Send current document
    const doc = documents.get(docId) || { content: '', version: 0 }
    socket.emit('document-state', doc)
  })

  socket.on('operation', (data: { docId: string, operation: Operation }) => {
    const doc = documents.get(data.docId)
    if (!doc) return

    // Apply operation
    const newContent = applyOperation(doc.content, data.operation)
    doc.content = newContent
    doc.version++

    // Broadcast to all clients
    socket.to(data.docId).emit('operation', {
      operation: data.operation,
      version: doc.version
    })
  })
})

function applyOperation(content: string, op: Operation): string {
  if (op.type === 'insert' && op.character) {
    return content.slice(0, op.position) + op.character + content.slice(op.position)
  } else if (op.type === 'delete') {
    return content.slice(0, op.position) + content.slice(op.position + 1)
  }
  return content
}
```

---

## Best Practices

### Connection Management

**Reconnection Logic:**
```typescript
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})

socket.on('connect', () => {
  console.log('Connected')
})

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server disconnected, manually reconnect
    socket.connect()
  }
  // Otherwise reconnection is automatic
})

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts')
})
```

### Rate Limiting

**Prevent spam:**
```typescript
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
})

app.use('/api/realtime', limiter)
```

### Authentication

**Secure WebSocket connections:**
```typescript
// Server
io.use((socket, next) => {
  const token = socket.handshake.auth.token

  try {
    const user = verifyJWT(token)
    socket.data.user = user
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})

// Client
const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('token')
  }
})
```

---

## Trade-offs

### Pros
- ✅ Instant updates (no polling delay)
- ✅ Better UX (real-time feel)
- ✅ Efficient (push vs pull)
- ✅ Bi-directional communication (WebSockets)

### Cons
- ❌ More server resources (persistent connections)
- ❌ Complexity (reconnection, state sync)
- ❌ Firewall issues (WebSockets)
- ❌ Scaling challenges (sticky sessions)

---

## Scaling Real-Time Systems

**Use Redis for pub/sub across servers:**
```typescript
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: 'redis://localhost:6379' })
const subClient = pubClient.duplicate()

await Promise.all([pubClient.connect(), subClient.connect()])

io.adapter(createAdapter(pubClient, subClient))

// Now multiple servers can share WebSocket state
```

---

## Related Patterns

- **Event-Driven Architecture** - Events trigger real-time updates
- **CQRS** - Separate read/write for real-time views
- **Pub/Sub** - Message distribution for real-time

---

## Further Reading

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [WebSockets vs SSE](https://ably.com/topic/websockets-vs-sse)
- [Operational Transform](https://operational-transformation.github.io/)
