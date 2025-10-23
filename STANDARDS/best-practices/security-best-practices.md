# Security Best Practices

**Last Updated:** 2025-10-22
**Category:** Security
**Audience:** All developers

---

## Overview

This document provides a comprehensive security checklist and best practices for building secure applications. Use this in conjunction with the `security-engineer` skill.

**Goal:** Prevent the OWASP Top 10 vulnerabilities and build defense-in-depth.

---

## Pre-Deployment Security Checklist

Copy this checklist for every production deployment:

### Authentication & Authorization
- [ ] Passwords hashed with bcrypt (12+ rounds) or argon2
- [ ] JWT tokens use RS256 (not HS256), short expiry (15min)
- [ ] Session cookies are HttpOnly, Secure, SameSite=Strict
- [ ] Rate limiting on auth endpoints (5 attempts per 15min)
- [ ] Password reset uses secure tokens (expires in 1 hour)
- [ ] All routes check authentication server-side
- [ ] Permissions verified before every sensitive operation
- [ ] Default deny approach (whitelist, not blacklist)
- [ ] Multi-factor authentication available for sensitive accounts

### Input Validation & Sanitization
- [ ] All user input validated with schema library (Zod, Yup, Joi)
- [ ] SQL queries use parameterized queries or ORM
- [ ] File uploads whitelist allowed types and enforce size limits
- [ ] No dangerouslySetInnerHTML without DOMPurify
- [ ] API rate limiting (100 requests per 15min per IP)
- [ ] GraphQL query depth limiting enabled
- [ ] JSON payload size limited (10MB max)

### Configuration
- [ ] No secrets in code or version control (.env in .gitignore)
- [ ] Environment variables for all configuration
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] CORS configured restrictively (whitelist origins)
- [ ] HTTPS enforced in production (HSTS enabled)
- [ ] Unnecessary features/endpoints removed
- [ ] Debug mode disabled in production
- [ ] Error messages don't leak sensitive info

### Data Protection
- [ ] PII encrypted at rest (AES-256-GCM)
- [ ] TLS 1.3 for all connections
- [ ] Database backups encrypted
- [ ] Secure secret management (AWS Secrets Manager, Vault)
- [ ] Password complexity requirements enforced
- [ ] Sensitive data not logged (passwords, tokens, PII)

### Monitoring & Logging
- [ ] Audit logging for security events (login, logout, permission changes)
- [ ] Error tracking configured (Sentry, Datadog)
- [ ] Alerts for suspicious patterns (failed logins, 500 errors)
- [ ] Log retention policy defined (90 days minimum)
- [ ] Logs don't contain sensitive data

### Dependencies & Infrastructure
- [ ] All dependencies up to date (`npm audit` clean)
- [ ] Dependabot enabled for automated updates
- [ ] No known CVEs in dependencies
- [ ] Minimal dependencies (remove unused packages)
- [ ] Docker images from trusted sources
- [ ] Infrastructure as code (no manual changes)

---

## OWASP Top 10 Prevention Guide

### 1. Broken Access Control

**Vulnerability:** Users can access resources they shouldn't.

**Prevention:**
```typescript
// ❌ Bad: Trusting client-provided data
app.delete('/api/posts/:id', async (req, res) => {
  await db.post.delete({ where: { id: req.params.id } })
})

// ✅ Good: Verify ownership
app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  const post = await db.post.findFirst({
    where: {
      id: req.params.id,
      authorId: req.user.id // Ensure user owns this post
    }
  })
  if (!post) return res.status(403).json({ error: 'Forbidden' })

  await db.post.delete({ where: { id: post.id } })
  res.json({ success: true })
})
```

**Checklist:**
- [ ] Verify permissions on every request (server-side)
- [ ] Use least privilege principle
- [ ] Disable directory listing
- [ ] Check authorization for all resources (not just UI)

---

### 2. Cryptographic Failures

**Vulnerability:** Sensitive data exposed due to weak/missing encryption.

**Prevention:**
```typescript
// ❌ Bad: Plain text password
await db.user.create({
  data: { email, password } // NEVER!
})

// ✅ Good: Hashed password
import bcrypt from 'bcrypt'
const hashedPassword = await bcrypt.hash(password, 12)
await db.user.create({
  data: { email, password: hashedPassword }
})

// ✅ Good: Encrypt PII
import crypto from 'crypto'
const encrypted = encrypt(user.ssn) // Custom encryption function
await db.user.create({
  data: { email, ssnEncrypted: encrypted }
})
```

**Checklist:**
- [ ] Use TLS 1.3 everywhere (HTTPS)
- [ ] Hash passwords with bcrypt/argon2 (never MD5/SHA1)
- [ ] Encrypt PII at rest (SSN, credit cards, health data)
- [ ] Use secure random number generator (crypto.randomBytes)
- [ ] Proper key management (rotate keys annually)

---

### 3. Injection

**Vulnerability:** Malicious input executes unintended commands.

**Prevention:**
```typescript
// ❌ Bad: SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`
db.query(query) // NEVER concatenate!

// ✅ Good: Parameterized query
const query = 'SELECT * FROM users WHERE email = ?'
db.query(query, [email])

// ✅ Good: ORM
const user = await prisma.user.findUnique({ where: { email } })

// ❌ Bad: NoSQL injection
const user = await db.user.findOne({ email: req.body.email })

// ✅ Good: Validate input
import { z } from 'zod'
const EmailSchema = z.string().email()
const email = EmailSchema.parse(req.body.email)
const user = await db.user.findOne({ email })
```

**Checklist:**
- [ ] Use parameterized queries (never concatenate SQL)
- [ ] Use ORM (Prisma, TypeORM, Sequelize)
- [ ] Validate all input with schema library
- [ ] Escape special characters in user input
- [ ] Use prepared statements

---

### 4. Insecure Design

**Vulnerability:** Fundamental flaws in architecture/design.

**Prevention:**
- Threat modeling during design phase
- Security requirements defined upfront
- Defense in depth (multiple layers of security)
- Principle of least privilege
- Fail securely (deny access on error)

**Example: Password Reset**
```typescript
// ❌ Bad: Security questions (guessable)
if (answer === user.securityAnswer) {
  // Reset password
}

// ✅ Good: Time-limited token sent to verified email
const token = crypto.randomBytes(32).toString('hex')
const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

await db.resetToken.create({
  data: { userId: user.id, token, expiresAt }
})

await sendEmail({
  to: user.email,
  subject: 'Reset your password',
  html: `<a href="${resetUrl}?token=${token}">Reset password</a>`
})
```

---

### 5. Security Misconfiguration

**Vulnerability:** Insecure default configs, missing patches, exposed error messages.

**Prevention:**
```typescript
// ✅ Security headers (Next.js middleware)
export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  )
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  return res
}

// ✅ Error handling (don't leak info)
try {
  // Operation
} catch (error) {
  console.error('Full error:', error) // Log server-side only

  res.status(500).json({
    error: 'Internal server error',
    requestId: generateId() // For support
  })
}
```

**Checklist:**
- [ ] Remove default accounts/passwords
- [ ] Disable directory listing
- [ ] Set security headers (CSP, HSTS, etc.)
- [ ] Keep dependencies updated
- [ ] Error messages don't expose internals
- [ ] Disable debug mode in production

---

### 6. Vulnerable and Outdated Components

**Prevention:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Check for updates
npx npm-check-updates

# Enable Dependabot (GitHub)
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

**Checklist:**
- [ ] Run `npm audit` before every deployment
- [ ] Enable Dependabot or Renovate
- [ ] Remove unused dependencies
- [ ] Pin dependency versions (avoid `^` in production)
- [ ] Review changelogs before updating

---

### 7. Identification and Authentication Failures

**Prevention:**
```typescript
// ✅ Strong password requirements
const PasswordSchema = z.string()
  .min(8, 'At least 8 characters')
  .max(100, 'Max 100 characters')
  .regex(/[A-Z]/, 'Needs uppercase letter')
  .regex(/[a-z]/, 'Needs lowercase letter')
  .regex(/[0-9]/, 'Needs number')
  .regex(/[^A-Za-z0-9]/, 'Needs special character')

// ✅ Rate limiting on auth endpoints
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, try again in 15 minutes'
})

app.post('/api/auth/login', authLimiter, loginHandler)

// ✅ MFA for sensitive accounts
const mfaToken = speakeasy.totp({
  secret: user.mfaSecret,
  encoding: 'base32'
})
```

**Checklist:**
- [ ] Enforce strong passwords (min 8 chars, complexity)
- [ ] Implement MFA for admin/sensitive accounts
- [ ] Rate limit login attempts (5 per 15min)
- [ ] Use secure session management
- [ ] Implement account lockout after failed attempts
- [ ] Don't expose whether username or password is wrong

---

### 8. Software and Data Integrity Failures

**Prevention:**
```typescript
// ✅ Verify npm packages
npm install --ignore-scripts // Prevent install scripts

// ✅ Subresource Integrity (SRI) for CDN
<script
  src="https://cdn.example.com/script.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous"
></script>

// ✅ Verify file uploads
import crypto from 'crypto'

function verifyFileHash(file: Buffer, expectedHash: string): boolean {
  const hash = crypto.createHash('sha256').update(file).digest('hex')
  return hash === expectedHash
}
```

**Checklist:**
- [ ] Use lock files (package-lock.json)
- [ ] Verify package signatures
- [ ] Use SRI for CDN resources
- [ ] Implement code signing
- [ ] Verify integrity of uploaded files

---

### 9. Security Logging and Monitoring Failures

**Prevention:**
```typescript
// ✅ Audit logging
async function auditLog(event: {
  userId?: string
  action: string
  resource: string
  ip: string
  success: boolean
  metadata?: any
}) {
  await db.auditLog.create({
    data: {
      ...event,
      timestamp: new Date(),
      userAgent: req.headers['user-agent']
    }
  })

  // Alert on suspicious patterns
  if (!event.success && event.action === 'LOGIN') {
    await checkForBruteForce(event.ip)
  }
}

// Usage
await auditLog({
  userId: user?.id,
  action: 'LOGIN_FAILED',
  resource: 'auth',
  ip: req.ip,
  success: false,
  metadata: { email }
})
```

**Checklist:**
- [ ] Log all authentication events
- [ ] Log authorization failures
- [ ] Log input validation failures
- [ ] Don't log sensitive data (passwords, tokens)
- [ ] Set up alerts for suspicious patterns
- [ ] Retain logs for 90+ days
- [ ] Monitor logs regularly

---

### 10. Server-Side Request Forgery (SSRF)

**Prevention:**
```typescript
// ❌ Bad: User-controlled URL
const response = await fetch(req.body.url) // SSRF vulnerability!

// ✅ Good: Whitelist allowed domains
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com']

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ALLOWED_DOMAINS.includes(parsed.hostname)
  } catch {
    return false
  }
}

if (!isAllowedUrl(req.body.url)) {
  return res.status(400).json({ error: 'Invalid URL' })
}

const response = await fetch(req.body.url)
```

**Checklist:**
- [ ] Validate and whitelist URLs
- [ ] Disable HTTP redirects
- [ ] Don't allow access to internal IPs (127.0.0.1, 192.168.*, 10.*)
- [ ] Use network segmentation

---

## Security Testing Checklist

### Automated Testing
```bash
# Run security audit
npm audit

# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://example.com

# Snyk scan
npx snyk test

# Lighthouse security audit
lighthouse https://example.com --only-categories=security
```

### Manual Testing
- [ ] Try SQL injection: `' OR '1'='1`
- [ ] Try XSS: `<script>alert('XSS')</script>`
- [ ] Try path traversal: `../../etc/passwd`
- [ ] Try CSRF: Submit form from different origin
- [ ] Try broken access control: Access other users' data
- [ ] Try authentication bypass: Access admin routes without auth

---

## Framework-Specific Best Practices

### Next.js
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')

  // Auth check
  const token = request.cookies.get('token')
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
```

### Express
```typescript
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'

app.use(helmet()) // Security headers
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json({ limit: '10mb' }))
app.use(mongoSanitize()) // Prevent NoSQL injection
```

### FastAPI
```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=lambda: request.client.host)
app.state.limiter = limiter

@app.post("/api/login")
@limiter.limit("5/15minutes")
async def login(credentials: Credentials):
    # Login logic
    pass
```

---

## Incident Response Plan

### When a Security Incident Occurs

1. **Contain:** Isolate affected systems immediately
2. **Assess:** Determine scope and impact
3. **Notify:** Inform stakeholders and affected users
4. **Remediate:** Fix vulnerability and deploy patch
5. **Review:** Post-mortem to prevent recurrence

### Security Incident Template
```markdown
# Security Incident Report

**Date:** YYYY-MM-DD
**Severity:** P0 / P1 / P2
**Affected Systems:** [List systems]

## Summary
[Brief description of incident]

## Timeline
- HH:MM - Incident detected
- HH:MM - Team notified
- HH:MM - Systems contained
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Root Cause
[What caused the vulnerability]

## Impact
- Users affected: [number]
- Data exposed: [type and scope]
- Downtime: [duration]

## Remediation
- [ ] Vulnerability patched
- [ ] Affected users notified
- [ ] Logs reviewed
- [ ] Systems monitored

## Prevention
[How to prevent this in the future]
```

---

## Compliance & Regulations

### GDPR (EU)
- [ ] Data minimization (collect only what's needed)
- [ ] Right to erasure (delete user data on request)
- [ ] Data portability (export user data)
- [ ] Consent management (opt-in for data collection)
- [ ] Breach notification (72 hours)

### HIPAA (Healthcare - US)
- [ ] Encrypt all PHI at rest and in transit
- [ ] Access controls and audit logging
- [ ] Business associate agreements
- [ ] Incident response plan

### PCI DSS (Payment Cards)
- [ ] Don't store full card numbers (use tokenization)
- [ ] PCI-compliant payment processor (Stripe, Square)
- [ ] Quarterly security scans
- [ ] Annual penetration testing

---

## Security Tools & Resources

### Recommended Tools
- **OWASP ZAP:** Web vulnerability scanner
- **Snyk:** Dependency vulnerability scanning
- **Sentry:** Error tracking and monitoring
- **Dependabot:** Automated dependency updates
- **1Password / LastPass:** Password management
- **AWS Secrets Manager / Vault:** Secret management

### Learning Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Security Headers](https://securityheaders.com/)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)

---

## Related Resources

**Skills:**
- `/SKILLS/security-engineer/` - Security implementation guidance
- `/SKILLS/api-designer/` - API security patterns
- `/SKILLS/testing-strategist/` - Security testing

**Patterns:**
- `/STANDARDS/architecture-patterns/authentication-patterns.md`

---

**Security is a continuous process, not a one-time checklist.** 🔒
