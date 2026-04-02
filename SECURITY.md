# Security Policy

## Reporting a Vulnerability

We take the security of CodeForge seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

### Reporting Process

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using one of the following methods:

1. **GitHub Security Advisory** (Preferred)
   - Use the [GitHub Security Advisory feature](https://github.com/codeforge-dev/codeforge/security/advisories/new)
   - Provide a detailed description of the vulnerability
   - Include steps to reproduce if possible
   - We will respond within 48 hours

2. **Email**
   - Send an email to: security@codeforge.dev
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Impact**: What could an attacker achieve?
- **Reproduction**: Step-by-step instructions to reproduce the issue
- **Proof of Concept**: Code or screenshots demonstrating the issue (if safe to share)
- **Suggested Fix**: If you have ideas for how to fix it (optional)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 5 business days
- **Fix Development**: Depends on severity and complexity
- **Disclosure**: Coordinated with reporter

### Disclosure Policy

We follow **coordinated disclosure**:

1. We will work with you to understand and fix the issue
2. We will prepare a security advisory
3. We will release the fix and publish the advisory together
4. We will credit you for the discovery (unless you prefer to remain anonymous)

### Security Best Practices

When using CodeForge:

- Keep CodeForge updated to the latest version
- Review and audit custom rules before enabling them
- Be cautious when using plugins from untrusted sources
- Don't commit sensitive files (use `.codeforgeignore`)
- Review generated reports before sharing publicly

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

### Security Features

CodeForge includes several security features:

- **Input Validation**: All file paths and configurations are validated
- **Safe File Operations**: No arbitrary code execution during analysis
- **Sandboxed Plugins**: Plugins run in isolated contexts
- **Dependency Scanning**: We use `npm audit` in CI/CD
- **Code Review**: All changes are reviewed before merging

### Security Headers

When using CodeForge in CI/CD:

```yaml
- name: Security Audit
  run: npm audit --audit-level=moderate

- name: Check for vulnerabilities
  run: npm run test:security # If available
```

### Known Security Considerations

1. **Plugin Security**: Only use plugins from trusted sources
2. **File Access**: CodeForge reads files according to configuration
3. **Performance**: Large codebases may consume significant resources
4. **Output**: Reports may contain sensitive information (review before sharing)

### Hall of Fame

We would like to thank the following security researchers for their responsible disclosures:

<!-- Security researchers will be listed here after responsible disclosure -->

---

For general security questions or concerns, email: security@codeforge.dev

For other issues, please use [GitHub Issues](https://github.com/codeforge-dev/codeforge/issues).
