# Security Engineer - Quick Start

**Version:** 1.0.0
**Category:** Infrastructure & DevOps
**Difficulty:** Intermediate

## What This Skill Does

Helps you implement security best practices across your application stack, preventing vulnerabilities and protecting user data.

## When to Use

Use this skill when you need to:
- Implement authentication and authorization
- Secure API endpoints
- Prevent OWASP Top 10 vulnerabilities
- Handle sensitive data (PII, passwords, payments)
- Review code for security issues
- Configure security headers and CORS
- Set up audit logging and monitoring

## Quick Start

**Fastest path to secure app:**

1. **Authentication:** Choose JWT, session-based, or OAuth
2. **Input Validation:** Use Zod/Yup to validate all user input
3. **Parameterized Queries:** Never concatenate SQL queries
4. **Password Hashing:** Use bcrypt (12+ rounds)
5. **Security Headers:** Set CSP, HSTS, X-Frame-Options
6. **Rate Limiting:** 5 login attempts per 15 minutes
7. **HTTPS:** Enforce TLS everywhere
8. **Audit Logging:** Log auth events and failures

**Time to secure:** 1-2 days for core security

## File Structure

```
security-engineer/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- HTTP basics
- Authentication concepts
- Database fundamentals

**Tools:**
- None required (skill guides tool selection)

**Related Skills:**
- `api-designer` - API security patterns
- `testing-strategist` - Security testing
- `deployment-advisor` - Production security config

## Success Criteria

You've successfully used this skill when:
- ✅ Authentication implemented securely (JWT/session/OAuth)
- ✅ All user input validated with schema
- ✅ Passwords hashed with bcrypt
- ✅ Security headers configured
- ✅ OWASP Top 10 vulnerabilities addressed
- ✅ Rate limiting on public endpoints
- ✅ Audit logging for security events
- ✅ No secrets in code/version control

## Common Workflows

### Workflow 1: Secure New API
1. Use security-engineer for auth strategy
2. Implement JWT or session-based auth
3. Add input validation with Zod
4. Configure security headers
5. Add rate limiting
6. Set up audit logging

### Workflow 2: Security Review
1. Check OWASP Top 10 checklist
2. Review authentication/authorization
3. Verify input validation
4. Check for secrets in code
5. Test security headers
6. Verify HTTPS enforcement

### Workflow 3: Handle Sensitive Data
1. Encrypt PII at rest
2. Hash passwords with bcrypt
3. Use HTTPS for transit
4. Configure secure session cookies
5. Set up audit logging
6. Implement data retention policy

## Key Concepts

**5 Security Pillars:**
1. **Authentication & Authorization:** Who can access what
2. **Input Validation:** Never trust user input
3. **Secure Configuration:** Headers, CORS, secrets
4. **Data Protection:** Encryption, hashing, HTTPS
5. **Monitoring & Response:** Logging, rate limiting, alerts

**OWASP Top 10 (2021):**
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Auth & Session Issues
8. Software & Data Integrity
9. Logging & Monitoring Failures
10. SSRF

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the security-engineer skill to..."
- Mention keywords: "security", "authentication", "vulnerabilities"

**CORS errors?**
- Configure CORS origin to match your frontend domain
- Set credentials: true if using cookies
- Check allowed methods and headers

**JWT issues?**
- Verify secret matches on sign and verify
- Check token expiry (15min access, 7d refresh recommended)
- Use RS256 for production (not HS256)

**Rate limiting not working?**
- Ensure rate limiter middleware runs before route handlers
- Check if IP is correctly extracted (behind proxy: trust proxy)
- Verify windowMs and max values

## Quick Reference

### Security Checklist
```
Authentication:
□ Passwords hashed (bcrypt 12+ rounds)
□ JWT uses RS256, short expiry
□ Rate limiting on auth endpoints
□ MFA available for sensitive accounts

Authorization:
□ Permissions verified server-side
□ Default deny (whitelist approach)
□ No client-side-only checks

Input Validation:
□ Schema validation (Zod/Yup)
□ Parameterized SQL queries
□ File upload restrictions
□ XSS prevention (escape output)

Configuration:
□ No secrets in code
□ Security headers set
□ CORS configured
□ HTTPS enforced

Data Protection:
□ PII encrypted at rest
□ TLS for all connections
□ Secure session cookies

Monitoring:
□ Audit logging enabled
□ Error tracking (Sentry)
□ Alerts configured
□ Dependencies updated
```

### Common Commands

```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Generate secure secret
openssl rand -base64 32

# Test security headers
curl -I https://yourdomain.com

# Scan for vulnerabilities
npx audit-ci --moderate
```

## Version History

- **1.0.0** (2025-10-22): Initial release, OWASP Top 10 coverage

## License

Part of ai-dev-standards repository.
