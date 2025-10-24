# Security Scanner MCP Server

Scan for security vulnerabilities, audit dependencies, and detect exposed secrets.

## What This MCP Does

- 🔒 **OWASP Top 10 Scanning** - Check for common security vulnerabilities
- 📦 **Dependency Auditing** - Audit npm/pip/etc dependencies for CVEs
- 🔑 **Secrets Detection** - Find exposed API keys, tokens, passwords
- 🛡️ **Security Best Practices** - Check adherence to security guidelines
- 📊 **Risk Assessment** - Calculate risk scores for vulnerabilities
- 🔍 **Code Pattern Analysis** - Detect insecure code patterns

## Installation

```bash
cd MCP-SERVERS/security-scanner-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "node",
      "args": ["/path/to/security-scanner-mcp/dist/index.js"]
    }
  }
}
```

## Tools

### 1. configure
Configure scanner settings.

```typescript
{
  projectPath: string;
  projectType: 'node' | 'python' | 'generic';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

### 2. scan_dependencies
Audit project dependencies for known vulnerabilities.

```typescript
{
  fix?: boolean; // attempt to auto-fix vulnerabilities
  production?: boolean; // only check production dependencies
}
```

Returns:
```json
{
  "vulnerabilities": {
    "critical": 2,
    "high": 5,
    "medium": 12,
    "low": 8
  },
  "details": [
    {
      "package": "lodash",
      "version": "4.17.20",
      "severity": "high",
      "cve": "CVE-2021-23337",
      "title": "Command Injection",
      "fixAvailable": "4.17.21"
    }
  ]
}
```

### 3. scan_secrets
Scan codebase for exposed secrets.

```typescript
{
  patterns?: string[]; // custom regex patterns
  exclude?: string[]; // paths to exclude
}
```

Returns:
```json
{
  "secretsFound": 3,
  "secrets": [
    {
      "type": "AWS Access Key",
      "file": "src/config.ts",
      "line": 12,
      "match": "AKIA...",
      "severity": "critical"
    },
    {
      "type": "JWT Secret",
      "file": ".env.example",
      "line": 5,
      "match": "jwt_secret_key_123",
      "severity": "high"
    }
  ]
}
```

### 4. scan_owasp
Check for OWASP Top 10 vulnerabilities.

```typescript
{
  categories?: string[]; // specific OWASP categories to check
}
```

Returns:
```json
{
  "issues": [
    {
      "category": "A01:2021 - Broken Access Control",
      "severity": "high",
      "file": "src/api/users.ts",
      "line": 45,
      "issue": "No authorization check before user data access",
      "recommendation": "Add authorization middleware"
    },
    {
      "category": "A02:2021 - Cryptographic Failures",
      "severity": "medium",
      "file": "src/utils/crypto.ts",
      "line": 12,
      "issue": "Using deprecated MD5 hashing",
      "recommendation": "Use bcrypt or Argon2 for password hashing"
    }
  ]
}
```

### 5. scan_code_patterns
Detect insecure code patterns.

```typescript
{
  patterns?: string[]; // 'sql-injection', 'xss', 'csrf', 'insecure-random', etc.
}
```

### 6. generate_report
Generate comprehensive security report.

```typescript
{
  format?: 'json' | 'html' | 'markdown';
  outputPath?: string;
  includeFixed?: boolean;
}
```

### 7. risk_assessment
Calculate overall security risk score.

```typescript
{
  includeHistory?: boolean;
}
```

## Usage Example

```javascript
// 1. Configure
await scanner.configure({
  projectPath: './my-app',
  projectType: 'node',
  severity: 'medium'
});

// 2. Scan dependencies
const deps = await scanner.scan_dependencies({
  production: true
});
console.log(`Found ${deps.vulnerabilities.critical} critical vulnerabilities`);

// 3. Scan for secrets
const secrets = await scanner.scan_secrets({
  exclude: ['node_modules', '.git']
});
console.log(`Found ${secrets.secretsFound} exposed secrets`);

// 4. OWASP scan
const owasp = await scanner.scan_owasp();
console.log(`Found ${owasp.issues.length} OWASP issues`);

// 5. Generate report
await scanner.generate_report({
  format: 'html',
  outputPath: './security-report.html'
});

// 6. Risk assessment
const risk = await scanner.risk_assessment();
console.log(`Overall risk score: ${risk.score}/100`);
```

## OWASP Top 10 Coverage

### A01:2021 - Broken Access Control
- Missing authorization checks
- Insecure direct object references
- Directory traversal

### A02:2021 - Cryptographic Failures
- Weak encryption algorithms
- Hardcoded secrets
- Insecure password storage

### A03:2021 - Injection
- SQL injection
- NoSQL injection
- Command injection
- XSS vulnerabilities

### A04:2021 - Insecure Design
- Missing rate limiting
- Lack of input validation
- Insecure defaults

### A05:2021 - Security Misconfiguration
- Default credentials
- Verbose error messages
- Missing security headers

### A06:2021 - Vulnerable Components
- Outdated dependencies
- Known CVEs
- Unpatched libraries

### A07:2021 - Authentication Failures
- Weak password policies
- Missing MFA
- Session fixation

### A08:2021 - Software Integrity Failures
- Unsigned packages
- No integrity checks
- Insecure CI/CD

### A09:2021 - Logging Failures
- Insufficient logging
- Logging sensitive data
- No monitoring

### A10:2021 - Server-Side Request Forgery
- SSRF vulnerabilities
- Unvalidated URLs

## Secret Patterns Detected

- AWS Access Keys
- AWS Secret Keys
- GitHub Personal Access Tokens
- Google API Keys
- Stripe API Keys
- JWT Secrets
- Database URLs with passwords
- Private SSH Keys
- OAuth Client Secrets
- Generic API Keys/Tokens

## Dependency Scanning

### Node.js
- Uses `npm audit` or `yarn audit`
- Checks package-lock.json / yarn.lock
- Identifies transitive dependencies

### Python
- Uses `pip-audit` or `safety`
- Checks requirements.txt / Pipfile.lock

### Generic
- Scans for known vulnerable patterns
- Version-based CVE matching

## Integration with Security Engineer Skill

This MCP enables the `security-engineer` skill by providing:
- Automated vulnerability scanning
- Real-time security checks
- Best practice enforcement
- Risk quantification

## Usage in Claude Code

```
User: "Scan this project for security vulnerabilities"

Claude: *Uses security-scanner MCP*

Security Scan Results:
🔴 2 critical vulnerabilities
🟠 5 high severity issues
🟡 12 medium severity issues
🟢 8 low severity issues

Critical Issues:
1. Exposed AWS Access Key in src/config.ts:12
2. SQL Injection vulnerability in src/api/users.ts:45

Recommendations:
- Move secrets to environment variables
- Use parameterized queries for database access
- Update lodash to 4.17.21

Let me help you fix these issues...
```

## Best Practices

### Secrets Management
- Never commit secrets to version control
- Use environment variables
- Rotate keys regularly
- Use secret management services (Vault, AWS Secrets Manager)

### Dependency Security
- Run audits regularly
- Keep dependencies up to date
- Use lock files
- Review security advisories

### Code Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Follow least privilege principle

### CI/CD Integration
- Run security scans on every commit
- Block deployment on critical issues
- Generate security reports
- Track metrics over time

## False Positives

- Review flagged issues
- Whitelist known safe patterns
- Document exceptions
- Regular policy updates

## Remediation Priority

1. **Critical** - Fix immediately
2. **High** - Fix within 24 hours
3. **Medium** - Fix within 1 week
4. **Low** - Address in next sprint

## Roadmap

- [ ] Integration with Snyk/Sonar
- [ ] Custom security rules
- [ ] Historical trend analysis
- [ ] Auto-fix capabilities
- [ ] Container scanning
- [ ] Infrastructure as Code scanning

## Testing

```bash
npm test
```

## Related

- **Enables:** security-engineer skill
- **Use case:** Security auditing, vulnerability management, compliance
- **Integration:** CI/CD pipelines, pre-commit hooks

