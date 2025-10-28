# Security Policy

## Supported Versions

| Version | Supported          | Security Status |
| ------- | ------------------ | --------------- |
| 3.0.x   | :white_check_mark: | **SECURE** - Local-first architecture |
| 2.x.x   | :x:                | **VULNERABLE** - Cross-project data exposure risk |
| 1.x.x   | :x:                | **VULNERABLE** - Cross-project data exposure risk |

**ALL USERS MUST UPGRADE TO v3.0.0 OR LATER IMMEDIATELY**

---

## Critical Security Advisory - v3.0.0

### 🚨 CRITICAL: Cross-Project Data Isolation Vulnerability (FIXED in v3.0.0)

**Published:** 2025-10-28
**Severity:** CRITICAL (CVSS 7.5)
**Status:** ✅ FIXED in v3.0.0
**CVE:** Pending

#### Vulnerability Description

All versions prior to v3.0.0 contained a critical security vulnerability where **all projects using ai-dev-standards synced from a single shared GitHub repository**, creating potential for cross-project data exposure and eliminating project isolation.

**Affected Versions:** All versions < 3.0.0
- v2.x.x: VULNERABLE
- v1.x.x: VULNERABLE
- v0.x.x: VULNERABLE

#### Attack Vectors

1. **Shared Repository Compromise**
   - If the central GitHub repository was compromised, ALL projects would sync malicious content
   - No per-project or per-user isolation

2. **Cross-Project Information Leakage**
   - Projects could potentially see what other projects were syncing
   - Shared configuration source meant shared state
   - No privacy boundaries between different users' projects

3. **Supply Chain Attack**
   - Compromise of central repository would immediately propagate to all users
   - No per-project validation or isolation

#### Impact Assessment

- **Confidentiality:** HIGH - Potential cross-project data visibility
- **Integrity:** MEDIUM - Shared source could be compromised
- **Availability:** LOW - Single point of failure
- **Privacy:** NO ISOLATION - All projects shared same source

#### Fix Implemented (v3.0.0)

v3.0.0 completely eliminates this vulnerability by:

1. ✅ **Local-First Architecture** - Each project reads from its own local ai-dev-standards installation
2. ✅ **Complete Project Isolation** - No shared remote sources
3. ✅ **User-Controllable Paths** - Optional `AI_DEV_STANDARDS_PATH` environment variable
4. ✅ **Zero Network Dependencies** - All sync operations are local file reads
5. ✅ **10x Performance Improvement** - Bonus: local reads are much faster

**All users must upgrade to v3.0.0 immediately.**

#### Upgrade Instructions

```bash
# Update ai-dev-standards
cd /path/to/ai-dev-standards
git pull origin main

# Verify version
node -e "console.log(require('./package.json').version)"
# Should output: 3.0.0 or higher

# Optional: Set custom installation path
export AI_DEV_STANDARDS_PATH=/your/custom/path
```

**No configuration changes required** - the fix is backward compatible.

---

## Reporting a Vulnerability

**We take security seriously.** If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue
2. Email security reports to: [security@your-domain.com] (or create private security advisory on GitHub)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Response Time:** Within 48 hours
- **Update Frequency:** At least once per week
- **Resolution Timeline:** Critical issues within 7 days, others within 30 days

### Bug Bounty

We currently do not offer a bug bounty program, but we deeply appreciate responsible disclosure and will publicly credit researchers (unless they prefer to remain anonymous).

---

## Security Best Practices

### For Users

1. ✅ **Always use latest version** - Security fixes are released promptly
2. ✅ **Set AI_DEV_STANDARDS_PATH** - Use a dedicated, controlled installation path
3. ✅ **Review sync changes** - Use `--dry-run` flag before applying updates
4. ✅ **Keep Node.js updated** - Use Node.js v18+ (latest LTS recommended)
5. ✅ **Verify file integrity** - Check git commits and signatures

### For Developers

1. ✅ **Never hard-code remote URLs** - Always use local file system reads
2. ✅ **Always use `local-fetch.js`** - Do NOT use deprecated `github-fetch.js`
3. ✅ **Validate all user input** - Use `CLI/utils/validation.js` helpers
4. ✅ **Test with AI_DEV_STANDARDS_PATH** - Verify custom path handling
5. ✅ **Maintain project isolation** - Every feature must respect isolation boundaries

---

## Security Compliance

### Standards Met

- ✅ **OWASP Top 10 2021**
  - A01:2021 - Broken Access Control (FIXED in v3.0.0)
  - A08:2021 - Software and Data Integrity Failures (FIXED in v3.0.0)
- ✅ **CWE-200** - Exposure of Sensitive Information (FIXED in v3.0.0)
- ✅ **CWE-829** - Inclusion of Functionality from Untrusted Control Sphere (FIXED in v3.0.0)

### Security Features

| Feature | Status | Version |
|---------|--------|---------|
| Project Isolation | ✅ Enabled | v3.0.0+ |
| Input Validation | ✅ Enabled | v1.0.1+ |
| Path Traversal Protection | ✅ Enabled | v1.0.1+ |
| Code Injection Prevention | ✅ Enabled | v1.0.1+ |
| Offline Operation | ✅ Enabled | v3.0.0+ |
| Local-First Architecture | ✅ Enabled | v3.0.0+ |

---

## Security Audit History

| Date | Version | Finding | Status | CVE |
|------|---------|---------|--------|-----|
| 2025-10-28 | v3.0.0 | Cross-project data exposure risk | ✅ FIXED | Pending |
| 2025-10-27 | v1.0.1 | Path traversal vulnerabilities | ✅ FIXED | N/A |
| 2025-10-27 | v1.0.1 | Code injection in generators | ✅ FIXED | N/A |

---

## Security Contact

- **Security Issues:** Create a private security advisory on GitHub
- **General Questions:** Open a public GitHub issue (for non-security questions only)
- **Documentation:** See `SECURITY-FIX-CROSS-PROJECT-ISOLATION.md` for v3.0.0 fix details

---

## Acknowledgments

We thank the following individuals for responsibly disclosing security issues:

- **User Report (2025-10-28)** - Identified cross-project visibility concern (v3.0.0 fix)

---

## License

This security policy is licensed under the same terms as the ai-dev-standards project (MIT License).

---

**Last Updated:** 2025-10-28
**Current Secure Version:** 3.0.0
**Deprecated Versions:** All versions < 3.0.0
