# Authentication Patterns

**Last Updated:** 2025-10-22
**Category:** Security
**Difficulty:** Intermediate

---

## Overview

This pattern provides decision frameworks and implementation strategies for authentication across different application types.

**Key Question:** How do users prove they are who they claim to be?

---

## Decision Tree: Which Auth Pattern?

```
Start here
│
├─ Building a traditional web app (server-side rendering)?
│  └─ Use: Session-Based Authentication
│
├─ Building an API for mobile/SPA?
│  └─ Use: JWT (JSON Web Tokens)
│
├─ Need social login (Google, GitHub, etc.)?
│  └─ Use: OAuth 2.0 / OIDC
│
├─ Building microservices?
│  └─ Use: JWT + API Gateway
│
├─ Need passwordless login?
│  └─ Use: Magic Links or WebAuthn
│
└─ Enterprise SSO required?
   └─ Use: SAML 2.0 or OIDC
```

---

## Pattern 1: Session-Based Authentication

### When to Use
- ✅ Traditional web applications (server-side rendering)
- ✅ When you need server-side session management
- ✅ When security is paramount (easier to revoke sessions)
- ❌ Not ideal for mobile apps or microservices

### How It Works

1. User logs in with credentials
2. Server creates session, stores in database/Redis
3. Server sends session ID to client as encrypted cookie
4. Client includes cookie in subsequent requests
5. Server looks up session to authenticate requests

### Implementation (Next.js + iron-session)

```typescript
// lib/session.ts
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId: string
  email: string
  role: string
  isLoggedIn: boolean
}

export async function getSession() {
  return await getIronSession<SessionData>(cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'app_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  })
}

// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Verify credentials
  const user = await verifyCredentials(email, password)
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Create session
  const session = await getSession()
  session.userId = user.id
  session.email = user.email
  session.role = user.role
  session.isLoggedIn = true
  await session.save()

  return Response.json({ success: true })
}

// Protect routes
export async function requireAuth() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    throw new Error('Unauthorized')
  }
  return session
}
```

### Pros & Cons

**Pros:**
- ✅ Server controls sessions (easy to revoke)
- ✅ Simpler to implement for web apps
- ✅ No token expiry issues
- ✅ Stateful (know all active sessions)

**Cons:**
- ❌ Not stateless (harder to scale horizontally)
- ❌ Requires session store (Redis, database)
- ❌ CSRF protection needed
- ❌ Doesn't work well for mobile apps

---

## Pattern 2: JWT (JSON Web Tokens)

### When to Use
- ✅ RESTful APIs consumed by mobile/SPA
- ✅ Microservices architecture
- ✅ Stateless authentication needed
- ✅ Cross-domain authentication
- ❌ Not ideal when you need to revoke tokens immediately

### How It Works

1. User logs in with credentials
2. Server generates JWT signed with secret
3. Client stores JWT (localStorage or httpOnly cookie)
4. Client sends JWT in Authorization header
5. Server verifies JWT signature

### Implementation (Next.js + jose)

```typescript
// lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createAccessToken(payload: { userId: string; email: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // Short-lived
    .sign(secret)
}

export async function createRefreshToken(payload: { userId: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Long-lived
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json()

  const user = await verifyCredentials(email, password)
  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const accessToken = await createAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  const refreshToken = await createRefreshToken({ userId: user.id })

  // Store refresh token in httpOnly cookie
  const response = Response.json({ accessToken })
  response.headers.set('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/api/auth/refresh`)

  return response
}

// middleware.ts - Protect routes
export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = await verifyToken(token)
    // Add user to request
    const response = NextResponse.next()
    response.headers.set('X-User-Id', payload.userId as string)
    return response
  } catch {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

### Access Token + Refresh Token Pattern

**Why both?**
- Access token: Short-lived (15min) - sent with every request
- Refresh token: Long-lived (7d) - used to get new access token

```typescript
// app/api/auth/refresh/route.ts
export async function POST(request: Request) {
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (!refreshToken) {
    return Response.json({ error: 'No refresh token' }, { status: 401 })
  }

  try {
    const payload = await verifyToken(refreshToken)
    const user = await db.user.findUnique({ where: { id: payload.userId as string } })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 401 })
    }

    // Issue new access token
    const accessToken = await createAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    return Response.json({ accessToken })
  } catch {
    return Response.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
```

### Pros & Cons

**Pros:**
- ✅ Stateless (no session store needed)
- ✅ Easy to scale horizontally
- ✅ Works across domains
- ✅ Perfect for mobile/SPA

**Cons:**
- ❌ Can't revoke tokens before expiry (use short expiry + refresh tokens)
- ❌ Token can grow large with too many claims
- ❌ Need to handle refresh token rotation

---

## Pattern 3: OAuth 2.0 / OpenID Connect

### When to Use
- ✅ Social login (Google, GitHub, Facebook)
- ✅ Third-party integrations
- ✅ Enterprise SSO
- ✅ Delegated authorization ("allow app X to access your Y")

### How It Works (Authorization Code Flow)

1. User clicks "Login with Google"
2. Redirect to Google auth page
3. User grants permission
4. Google redirects back with authorization code
5. Exchange code for access token
6. Use access token to get user info

### Implementation (Next.js + NextAuth.js)

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await verifyCredentials(credentials.email, credentials.password)
        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// Protect API routes
import { getServerSession } from 'next-auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return Response.json({ user: session.user })
}
```

### Pros & Cons

**Pros:**
- ✅ No password management (delegated to provider)
- ✅ Better UX (one-click login)
- ✅ Trusted providers (Google, GitHub, etc.)
- ✅ Reduced liability (no password storage)

**Cons:**
- ❌ Dependency on third-party
- ❌ More complex to implement
- ❌ Users need account with provider
- ❌ Privacy concerns (provider knows which apps you use)

---

## Pattern 4: Magic Link (Passwordless)

### When to Use
- ✅ Consumer apps (better UX than passwords)
- ✅ Reduce password fatigue
- ✅ Email-based verification
- ❌ Not suitable for high-security applications

### How It Works

1. User enters email
2. Server generates unique token
3. Server sends email with login link
4. User clicks link
5. Server verifies token and logs user in

### Implementation

```typescript
// lib/magic-link.ts
import crypto from 'crypto'

export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

// app/api/auth/magic-link/request/route.ts
export async function POST(request: Request) {
  const { email } = await request.json()

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal if email exists
    return Response.json({ message: 'Check your email' })
  }

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await db.magicLink.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  })

  const loginUrl = `${process.env.APP_URL}/auth/verify?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Your login link',
    html: `<a href="${loginUrl}">Click here to log in</a>`
  })

  return Response.json({ message: 'Check your email' })
}

// app/api/auth/magic-link/verify/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return Response.json({ error: 'Invalid token' }, { status: 400 })
  }

  const magicLink = await db.magicLink.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!magicLink || magicLink.expiresAt < new Date()) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  // Delete used token
  await db.magicLink.delete({ where: { id: magicLink.id } })

  // Create session
  const session = await getSession()
  session.userId = magicLink.user.id
  session.email = magicLink.user.email
  session.isLoggedIn = true
  await session.save()

  return Response.redirect('/dashboard')
}
```

### Pros & Cons

**Pros:**
- ✅ No password to remember
- ✅ No password storage/hashing
- ✅ Better UX for users
- ✅ Email-based verification

**Cons:**
- ❌ Requires email access (not always available)
- ❌ Less secure than passwords (if email compromised)
- ❌ Can't log in offline
- ❌ Slower login flow

---

## Pattern 5: WebAuthn / Passkeys

### When to Use
- ✅ Maximum security (phishing-resistant)
- ✅ Passwordless future
- ✅ Hardware security keys
- ❌ Not yet widely adopted

### How It Works

1. User registers device (fingerprint, Face ID, security key)
2. Device generates public/private key pair
3. Public key stored on server
4. Private key never leaves device
5. User authenticates with biometric/PIN
6. Device signs challenge with private key
7. Server verifies signature with public key

### Implementation (SimpleWebAuthn)

```typescript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'

// Registration
export async function POST(request: Request) {
  const { email } = await request.json()

  const user = await db.user.findUnique({ where: { email } })

  const options = await generateRegistrationOptions({
    rpName: 'My App',
    rpID: 'example.com',
    userID: user.id,
    userName: user.email,
    attestationType: 'none',
  })

  await db.user.update({
    where: { id: user.id },
    data: { currentChallenge: options.challenge }
  })

  return Response.json(options)
}

// Verify registration
export async function POST(request: Request) {
  const { userId, response } = await request.json()

  const user = await db.user.findUnique({ where: { id: userId } })

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: user.currentChallenge,
    expectedOrigin: 'https://example.com',
    expectedRPID: 'example.com',
  })

  if (verification.verified) {
    await db.authenticator.create({
      data: {
        userId: user.id,
        credentialID: verification.registrationInfo.credentialID,
        credentialPublicKey: verification.registrationInfo.credentialPublicKey,
        counter: verification.registrationInfo.counter,
      }
    })
  }

  return Response.json({ verified: verification.verified })
}
```

---

## Comparison Matrix

| Pattern | Stateless | Mobile-Friendly | Scalability | Security | UX | Complexity |
|---------|-----------|-----------------|-------------|----------|-----|-----------|
| Session | ❌ No | ⚠️ Medium | ⚠️ Medium | ✅ High | ✅ Good | ✅ Low |
| JWT | ✅ Yes | ✅ High | ✅ High | ⚠️ Medium | ✅ Good | ⚠️ Medium |
| OAuth | ✅ Yes | ✅ High | ✅ High | ✅ High | ✅ Excellent | ❌ High |
| Magic Link | ⚠️ Hybrid | ✅ High | ✅ High | ⚠️ Medium | ⚠️ Medium | ⚠️ Medium |
| WebAuthn | ✅ Yes | ✅ High | ✅ High | ✅ Highest | ⚠️ Medium | ❌ High |

---

## Best Practices

### Password Security
- ✅ Use bcrypt with 12+ rounds
- ✅ Minimum 8 characters (enforce complexity)
- ✅ Check against breached passwords (haveibeenpwned.com API)
- ✅ Rate limit login attempts (5 per 15 minutes)
- ❌ Never store passwords in plain text
- ❌ Never log passwords

### Token Security
- ✅ Use short expiry for access tokens (15min)
- ✅ Use refresh tokens for long sessions
- ✅ Store refresh tokens in httpOnly cookies
- ✅ Rotate refresh tokens on use
- ✅ Revoke tokens on logout
- ❌ Don't store tokens in localStorage (XSS risk)

### Session Security
- ✅ Use httpOnly, secure, sameSite cookies
- ✅ Regenerate session ID after login
- ✅ Implement session timeout
- ✅ Store sessions in Redis (not in-memory)
- ❌ Don't use predictable session IDs

---

## Related Resources

**Skills:**
- `security-engineer` - Security implementation guidance
- `api-designer` - API authentication patterns
- `frontend-builder` - Client-side auth handling

**Patterns:**
- `/STANDARDS/best-practices/security-best-practices.md`

**External:**
- [OAuth 2.0](https://oauth.net/2/)
- [NextAuth.js](https://next-auth.js.org/)
- [SimpleWebAuthn](https://simplewebauthn.dev/)
