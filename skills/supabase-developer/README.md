# Supabase Developer Skill

**Build production-ready full-stack applications with Supabase.**

## Overview

Comprehensive guide for developing applications with Supabase—an open-source Firebase alternative. Covers PostgreSQL database design, authentication, storage, real-time features, edge functions, and security best practices.

## What You'll Learn

- **Authentication**: Email/password, OAuth, magic links, session management
- **Database**: PostgreSQL schema design with Row Level Security (RLS)
- **Storage**: File uploads with access control and transformations
- **Real-time**: Live subscriptions, broadcasts, and presence tracking
- **Edge Functions**: Serverless TypeScript functions at the edge
- **Security**: RLS policies, input validation, and best practices
- **Performance**: Indexing, caching, pagination strategies
- **Testing**: Unit and integration testing patterns

## When to Use

- Building full-stack applications with authentication
- Need a PostgreSQL database with auto-generated API
- Implementing real-time collaborative features
- File storage and image transformations
- Serverless functions for background jobs or webhooks
- RAG applications with pgvector for embeddings

## Key Features

### 6-Phase Implementation

1. **Project Setup**: Initialize Supabase, configure client libraries
2. **Authentication**: Multiple auth strategies with session management
3. **Database Design**: Schema design with Row Level Security
4. **Storage**: File management with access control
5. **Real-time**: Live subscriptions and presence tracking
6. **Edge Functions**: Serverless TypeScript functions

### Security-First

- Row Level Security (RLS) as primary security layer
- Never expose service role keys on client
- Input validation and rate limiting
- Secure storage policies

### Production-Ready Patterns

- Database migrations with version control
- Optimistic UI updates
- Soft deletes and audit logs
- Vector search with pgvector
- Real-time subscriptions with filters

## Quick Start

```typescript
// 1. Install
npm install @supabase/supabase-js

// 2. Initialize client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 3. Authenticate
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
})

// 4. Query data
const { data: posts } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)

// 5. Real-time subscription
supabase
  .channel('posts-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'posts'
  }, (payload) => {
    console.log('Change:', payload)
  })
  .subscribe()
```

## Common Use Cases

### Authentication Flow

```typescript
// Sign up with email
await supabase.auth.signUp({ email, password })

// OAuth (Google, GitHub, etc.)
await supabase.auth.signInWithOAuth({ provider: 'google' })

// Magic link
await supabase.auth.signInWithOtp({ email })

// Session management
const {
  data: { user }
} = await supabase.auth.getUser()
```

### Database with RLS

```sql
-- Create table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: users can only manage their own posts
CREATE POLICY "Users manage own posts"
  ON posts FOR ALL
  USING (auth.uid() = user_id);
```

### File Storage

```typescript
// Upload file
const { data, error } = await supabase.storage.from('avatars').upload(`${userId}/avatar.png`, file)

// Get public URL
const { data } = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.png`)
```

### Real-time Subscriptions

```typescript
// Subscribe to changes
const channel = supabase
  .channel('room-1')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    },
    payload => {
      console.log('New message:', payload.new)
    }
  )
  .subscribe()
```

## Integration Examples

- **Next.js 13+ App Router**: Server/client components with SSR
- **React + Vite**: SPA with auth hooks
- **Edge Functions**: Serverless API endpoints
- **Vector Search**: RAG with pgvector extension

## Performance Tips

1. **Use indexes** on frequently queried columns
2. **Select only needed columns** instead of `SELECT *`
3. **Implement pagination** for large datasets
4. **Cache static data** with React Query or SWR
5. **Enable replication** for real-time features

## Security Checklist

- [ ] Enable RLS on all tables
- [ ] Never expose service role key on client
- [ ] Validate all user input
- [ ] Implement rate limiting
- [ ] Use signed URLs for private files
- [ ] Test RLS policies thoroughly
- [ ] Audit database permissions regularly

## Related Skills

- **api-designer**: Custom API endpoint design
- **security-engineer**: Security audits and hardening
- **frontend-builder**: React/Next.js integration
- **data-engineer**: Complex data pipelines
- **performance-optimizer**: Database optimization

## MCP Support

Works seamlessly with **supabase-mcp** for:

- Database operations (CRUD)
- Authentication management
- Storage operations
- Real-time subscriptions
- Migration execution
- RLS policy management

## Resources

- Full implementation guide in SKILL.md
- Official docs: https://supabase.com/docs
- Examples: https://github.com/supabase/supabase/tree/master/examples
- Local development: `supabase init && supabase start`

---

**Version**: 1.0.0
**Category**: Backend
**Estimated Time**: 1-3 weeks for full-stack app
