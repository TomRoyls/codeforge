# Security Policy

---

title: Security Policy
slug: security-policy

---

_This document outlines security procedures for the CodeForge project._

## Reporting a Vulnerability

If you discover a security vulnerability in CodeForge or any of its dependencies, please report it by:

- **Email**: security@example.com
- **GitHub Issues**: Create a [security advisory](https://github.com/codeforge-dev/codeforge/security/advisories/new)

Please **DO NOT** create a public GitHub issue for security vulnerabilities.

## Supported Versions

| Version | Supported | Notes              |
| ------- | --------- | ------------------ |
| 0.1.x   | ✅ Yes    | Active development |
| 0.0.x   | ❌ No     | Pre-release        |

## Security Best Practices

### Dependency Management

- **Regular Updates**: Keep dependencies up to date with `npm audit` or `npm outdated`
- **Vulnerability Scanning**: Use `npm audit` regularly to check for vulnerabilities
- **Lock Files**: Commit package-lock.json along with package.json to ensure consistent versions

### Code Security

- **Input Validation**: Always validate user inputs and file paths
- **Path Traversal**: Use path.resolve() to prevent directory traversal attacks
- **Command Injection**: Sanitize user inputs before passing to shell commands
- **Secrets Management**: Never commit secrets, use environment variables

### CLI Security

- **Privilege Separation**: Run with minimal required privileges
- **File Permissions**: Ensure proper file permissions on configuration files
- **Audit Logging**: Log security-relevant events for auditing

## Dependency Security

### Known Vulnerabilities

| Vulnerability   | Severity | Status | Fixed In |
| --------------- | -------- | ------ | -------- |
| brace-expansion | Moderate | Fixed  | 0.1.0    |
| picomatch       | High     | Fixed  | 0.1.0    |

### Dependency Audit

Run regular security audits:

\`\`\`bash
npm audit
npm audit fix
\`\`\`

### Supply Chain Security

- **Dependency Verification**: Verify package integrity with npm audit
- **Lockfile**: Use package-lock.json for reproducible builds
- **Private Packages**: Use private npm registry for internal packages if needed

- **Scoped packages**: Verify authenticity of scoped packages

## Security Headers

### Security Policy

| Header                 | Value         | Required |
| ---------------------- | ------------- | -------- |
| X-Content-Type-Options | nosniff       | No       |
| X-Frame-Options        | DENY          | No       |
| X-XSS-Protection       | 1; mode=block | No       |

| Content-Security-Policy | default-src 'self' | No |

## Automated Security Scanning

### CI/CD Integration

Security scans run automatically in CI/CD pipelines:

\`\`\`yaml

- name: Security Scan
  run: npm audit --audit-level=moderate
  run: npm audit fix --dry-run
  run: npm audit fix
  \`\`\`

### Pre-commit Hooks

Run security checks before committing:

\`\`\`bash
#!/!/bin/sh
codeforge check-updates --security
\`\`\`

## Incident Response

### Severity Levels

| Level    | Response Time | Actions                            |
| -------- | ------------- | ---------------------------------- |
| Critical | < 1 hour      | Immediate patch, public disclosure |
| High     | < 4 hours     | Patch, limited disclosure          |
| Medium   | < 24 hours    | Patch, public disclosure           |
| Low      | < 72 hours    | Investigate, deferred patch        |

### Response Team

- **Security Lead**: security@example.com
- **Development Team**: dev@example.com
- **Project Maintainer**: admin@example.com

## Security Disclosure Timeline

| Severity | Initial Response | Follow-up             | Public Disclosure |
| -------- | ---------------- | --------------------- | ----------------- |
| Critical | Fix within 24h   | disclosure within 24h | within 72 hours   |
| High     | fix within 48h   | disclosure within 48h | within 7 days     |
| Medium   | fix within 24h   | disclosure within 24h | within 7 days     |
| Low      | fix within 72h   | disclosure within 72h | within 14 days    |

## Contact

For security concerns: security@example.com
