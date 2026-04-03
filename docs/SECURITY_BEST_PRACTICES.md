# CodeForge Security Best Practices Guide

This guide covers security best practices for using and configuring CodeForge, your projects and CI/CD pipelines.

## Table of Contents

- [Security Overview](#security-overview)
- [Configuration Security](#configuration-security)
- [Dependency Security](#dependency-security)
- [CI/CD Security](#cicd-security)
- [Plugin Security](#plugin-security)
- [Code Analysis Security](#code-analysis-security)
- [Data Privacy](#data-privacy)
- [Reporting Security](#reporting-security)
- [Incident Response](#incident-response)

## Security Overview

### Security Principles

CodeForge follows these security principles:

| Principle             | Description                    | Implementation                       |
| --------------------- | ------------------------------ | ------------------------------------ |
| **Least Privilege**   | Minimal permissions required   | File read-only access                |
| **Defense in Depth**  | Multiple security layers       | Validation, sanitization, sandboxing |
| **Secure by Default** | Secure configuration defaults  | Conservative rule settings           |
| **Transparency**      | Clear security logging         | Security audit logs                  |
| **Fail Secure**       | Fail closed on security errors | Strict validation                    |

### Threat Model

| Threat                         | Risk                     | Mitigation                                |
| ------------------------------ | ------------------------ | ----------------------------------------- |
| **Malicious config**           | Code execution           | Schema validation, strict parsing         |
| **Plugin vulnerabilities**     | Code injection           | Plugin sandboxing, signature verification |
| **Dependency vulnerabilities** | Supply chain attacks     | Lockfile verification, audit              |
| **Path traversal**             | Unauthorized file access | Path sanitization, whitelist              |
| **Code injection**             | Arbitrary code execution | AST validation, no eval                   |

### Security Checklist

- [ ] Config files validated with JSON schema
- [ ] Dependencies locked with lockfile
- [ ] No `eval` or `Function` constructor usage
- [ ] File paths sanitized and validated
- [ ] Plugins verified before loading
- [ ] Secrets never logged or exposed
- [ ] Security audits enabled

## Configuration Security

### Configuration Validation

**Validate config files**:

```bash
codeforge config validate
```

**Schema validation**:

```json
{
  "$schema": "https://json.schemastore.org/codeforgerc.json"
}
```

### Environment Variables

**Never hardcode secrets**:

```json
{
  "rules": {
    "no-hardcoded-secrets": "error"
  }
}
```

**Use environment variables**:

```bash
export API_KEY="secret-key"
codeforge analyze
```

### Config File Permissions

**Restrict access**:

```bash
chmod 600 .codeforgerc.json
```

**Prevent accidental commits**:

```bash
# Add to .gitignore
.codeforgerc.json
.codeforgerc.local.json
```

### Config Encryption

**Encrypt sensitive config**:

```bash
# Use environment-specific config
cp .codeforgerc.json .codeforgerc.${NODE_ENV}.json
```

**Use secret management**:

```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id codeforge/api-key

# HashiCorp Vault
vault kv get -field=api_key secret/codeforge
```

## Dependency Security

### Dependency Verification

**Audit dependencies**:

```bash
npm audit
```

**Lock dependencies**:

```bash
npm shrinkwrap
```

**Check for vulnerabilities**:

```bash
npm audit fix
```

### Supply Chain Security

**Verify package integrity**:

```bash
npm ci
```

**Use lockfile**:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": {
    "codeforge": "^0.1.0"
  }
}
```

### Dependency Updates

**Regular updates**:

```bash
# Check for outdated packages
npm outdated

# Update safely
npm update
```

**Security monitoring**:

```bash
# Enable Dependabot
# https://dependabot.com/
```

## CI/CD Security

### CI Token Security

**Use encrypted secrets**:

```yaml
# GitHub Actions
- name: Run CodeForge
  env:
    CODEFORGE_TOKEN: ${{ secrets.CODEFORGE_TOKEN }}
```

**Never log secrets**:

```yaml
- name: Run CodeForge
  run: |
    echo "Token: ${{ secrets.CODEFORGE_TOKEN }}"  # ❌ NEVER DO THIS
    codeforge analyze
```

### CI Configuration

**Minimal permissions**:

```yaml
permissions:
  contents: read
  pull-requests: write
```

**Secure artifact storage**:

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: analysis-results
    path: results.json
    retention-days: 7
```

### Branch Protection

**Protect main branch**:

```yaml
# GitHub branch protection rules
branch_protection_rules:
  - pattern: main
    required_status_checks:
      - context: 'CodeForge Analysis'
        status: 'success'
    required_pull_request_reviews:
      - 1
    enforce_admins: true
```

## Plugin Security

### Plugin Verification

**Verify plugin signatures**:

```typescript
import { verifyPluginSignature } from 'codeforge'

const isValid = await verifyPluginSignature(pluginPath, signature)
```

**Use official plugins only**:

```json
{
  "plugins": ["@codeforge/official-plugin"]
}
```

### Plugin Sandboxing

**Sandboxed execution**:

```json
{
  "performance": {
    "sandbox": true,
    "sandboxPermissions": ["fs.read", "path.resolve"]
  }
}
```

**Limit plugin access**:

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "permissions": ["fs.read"]
    }
  ]
}
```

### Plugin Audit

**Audit plugin behavior**:

```bash
codeforge plugins audit
```

Output:

```
Plugin Audit Results:
- my-plugin: ✅ Safe
  - No dangerous APIs used
  - No file system writes
  - No network access

- another-plugin: ⚠️ Warning
  - Uses eval() (potential security risk)
  - File system write access
```

## Code Analysis Security

### Rule Security

**No arbitrary code execution**:

```typescript
// ❌ CodeForge NEVER does this
eval(userCode)

// ✅ CodeForge uses AST analysis
const ast = parseCode(userCode)
analyzeAST(ast)
```

### Input Validation

**Validate all inputs**:

```typescript
import { validatePath, validateConfig } from 'codeforge'

const validPath = validatePath(userProvidedPath)
const validConfig = validateConfig(userProvidedConfig)
```

### Path Traversal Prevention

**Sanitize file paths**:

```typescript
import { sanitizePath } from 'codeforge'

const safePath = sanitizePath(userInput)
// Prevents: ../../../etc/passwd
// Prevents: /absolute/path
```

**Whitelist allowed directories**:

```json
{
  "security": {
    "allowedDirectories": ["./src", "./lib"]
  }
}
```

## Data Privacy

### Logging Privacy

**Never log sensitive data**:

```typescript
// ❌ Bad
logger.info(`Analyzing ${filePath} with token ${apiToken}`)

// ✅ Good
logger.info(`Analyzing ${filePath}`)
```

**Sanitize logs**:

```json
{
  "logging": {
    "sanitize": true,
    "excludePatterns": ["password", "token", "secret", "api_key"]
  }
}
```

### Report Privacy

**Exclude sensitive files**:

```json
{
  "ignore": ["**/.env", "**/secrets/**", "**/credentials/**", "**/private/**"]
}
```

**Redact sensitive information**:

```json
{
  "reporting": {
    "redact": true,
    "redactPatterns": ["password\\s*=\\s*['\"]([^'\"]+)['\"]", "token\\s*=\\s*['\"]([^'\"]+)['\"]"]
  }
}
```

### Temporary Files

**Secure temp file handling**:

```typescript
import { createSecureTempFile } from 'codeforge'

const tempFile = await createSecureTempFile('analysis-', '.json', {
  permissions: 0o600, // Owner read/write only
  cleanup: true,
})
```

## Reporting Security

### Report Access Control

**Restrict report access**:

```bash
chmod 600 codeforge-report.json
```

**Encrypt sensitive reports**:

```bash
codeforge report --encrypt --key "${ENCRYPTION_KEY}"
```

### Report Transmission

**Use HTTPS only**:

```json
{
  "reporting": {
    "endpoint": "https://api.example.com/reports",
    "verifySSL": true
  }
}
```

**Authenticate properly**:

```json
{
  "reporting": {
    "authentication": {
      "type": "bearer",
      "token": "${REPORT_TOKEN}"
    }
  }
}
```

### Report Retention

**Secure report storage**:

```json
{
  "reporting": {
    "retention": {
      "days": 30,
      "encrypt": true,
      "secureDelete": true
    }
  }
}
```

## Incident Response

### Security Logging

**Enable security logs**:

```json
{
  "logging": {
    "level": "info",
    "security": {
      "enabled": true,
      "file": "./logs/security.log",
      "format": "json"
    }
  }
}
```

**Log security events**:

- Plugin loading failures
- Configuration validation errors
- Permission denied errors
- Suspicious file access patterns
- Authentication failures

### Incident Detection

**Monitor for anomalies**:

```json
{
  "monitoring": {
    "anomalyDetection": true,
    "alertOn": ["multiple_failed_validations", "unusual_file_access", "plugin_signature_mismatch"]
  }
}
```

### Response Procedures

**1. Plugin Security Issue**:

```bash
# Disable plugin
codeforge plugins disable suspicious-plugin

# Audit plugin
codeforge plugins audit suspicious-plugin

# Report incident
codeforge report-security-incident --plugin suspicious-plugin
```

**2. Configuration Tampering**:

```bash
# Validate config
codeforge config validate

# Restore from backup
cp .codeforgerc.backup.json .codeforgerc.json

# Audit changes
git diff .codeforgerc.json
```

**3. Dependency Vulnerability**:

```bash
# Check vulnerabilities
npm audit

# Update affected packages
npm update vulnerable-package

# Verify fix
npm audit
```

## Security Best Practices Checklist

- [ ] Config validated with JSON schema
- [ ] Dependencies locked with lockfile
- [ ] Regular dependency audits enabled
- [ ] CI secrets properly encrypted
- [ ] Plugins verified before loading
- [ ] File paths sanitized and validated
- [ ] Sensitive data never logged
- [ ] Reports encrypted in transit
- [ ] Security logging enabled
- [ ] Incident response plan documented
- [ ] Regular security reviews scheduled

## Security Resources

- **OWASP Top 10**: https://owasp.org/Top10/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/
- **npm Security**: https://docs.npmjs.com/packages-and-modules/securing-your-code/
- **GitHub Security**: https://docs.github.com/en/code-security

## Getting Help

- **Security Issues**: security@codeforge.dev
- **Vulnerability Reports**: Use GitHub Security Advisories
- **Security Questions**: GitHub Discussions with `security` label
- **Documentation**: `docs/security/` directory
