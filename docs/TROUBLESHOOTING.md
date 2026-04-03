# CodeForge Troubleshooting Guide

This guide helps you diagnose and resolve common issues with CodeForge.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Problems](#configuration-problems)
- [Performance Problems](#performance-problems)
- [Rule Violations](#rule-violations)
- [Plugin Issues](#plugin-issues)
- [CI/CD Problems](#cicd-problems)
- [Error Messages](#error-messages)
- [Debug Mode](#debug-mode)
- [Getting Help](#getting-help)

## Installation Issues

### Node.js Version Mismatch

**Symptoms**:

```
Error: CodeForge requires Node.js 20.0.0 or higher
Current version: 18.17.0
```

**Solution**:

```bash
# Check current version
node --version

# Install Node.js 20+
nvm install 20

# Verify installation
node --version  # Should show v20.x.x
```

### Permission Errors

**Symptoms**:

```
Error: EACCES: permission denied, open '/path/to/file'
```

**Solution**:

```bash
# Check permissions
ls -la /path/to/file

# Fix permissions
chmod 644 /path/to/file  # Read/write
chmod 755 /path/to/file  # Read/write/execute

# Or change ownership
chown user:group /path/to/file
```

### npm Install Failures

**Symptoms**:

```
npm ERR! network request failed
npm ERR! unable to resolve dependency tree
```

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules andrm -rf node_modules
rm -rf package-lock.json

# Reinstall
npm install

# If still fails,npm install --verbose
```

### Global vs Local Installation

**Symptoms**:

```bash
# Global installation
npm install -g codeforge
codeforge --version  # Works

# But in project
npx codeforge --version  # Fails
```

**Solution**:

```bash
# Option 1: Use global installation
codeforge analyze

# Option 2: Install locally
npm install --save-dev codeforge
npx codeforge analyze

# Option 3: Use npx (recommended)
npx codeforge analyze
```

## Configuration Problems

### Config File Not Found

**Symptoms**:

```
Warning: No configuration file found
Using default configuration
```

**Solution**:

```bash
# Initialize config
codeforge init

# Or create manually
echo '{
  "files": ["src/**/*.ts"],
  "rules": {
    "no-any": "warning"
  }
}' > .codeforgerc.json
```

### Invalid JSON Syntax

**Symptoms**:

```
Error: Failed to parse .codeforgerc.json
Unexpected token } in JSON at position 42
```

**Solution**:

```bash
# Validate JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('.codeforgerc.json', 'utf8')))"

# Or use JSON validator
npx jsonlint .codeforgerc.json

# Fix syntax error
vim .codeforgerc.json
# Look for missing comma, extra bracket, etc.
```

### Rule Not Found

**Symptoms**:

```
Error: Unknown rule 'my-custom-rule'
Available rules: no-any, prefer-const, ...
```

**Solution**:

```bash
# List available rules
codeforge rules

# Check rule name
# Rule names are case-sensitive
"no-any" ≠ "No-Any"

# Use correct name
{
  "rules": {
    "no-any": "error"  # ✅
  }
}
```

### Config Extend Not Working

**Symptoms**:

```
Error: Cannot extend config from '../.codeforgerc.json'
File not found
```

**Solution**:

```bash
# Check if base config exists
ls -la ../.codeforgerc.json

# Use absolute path
{
  "extends": "/absolute/path/to/.codeforgerc.json"
}

# Or relative path from project root
{
  "extends": "./configs/base.json"
}
```

## Performance Problems

### Slow Analysis

**Symptoms**:

```
Analyzing 10,000 files...
This is taking forever!
```

**Solution**:

```bash
# Check what's slow
codeforge analyze --profile

# Reduce files
{
  "files": ["src/**/*.ts"],
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**"
  ]
}

# Use caching
codeforge analyze --cache-results

# Increase concurrency
codeforge analyze --concurrency 8
```

### High Memory Usage

**Symptoms**:

```
JavaScript heap out of memory
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" codeforge analyze

# Reduce memory usage
codeforge analyze --concurrency 2

# Or process in chunks
for dir in src/*/; do
  codeforge analyze "$dir"
done
```

### Slow Startup

**Symptoms**:

```
$ time codeforge --version
5.2s  # Should be < 1s
```

**Solution**:

```bash
# Enable lazy loading
{
  "performance": {
    "lazyLoadRules": true
  }
}

# Clear plugin cache
rm -rf .codeforge-cache

# Disable unused plugins
{
  "plugins": []  # Remove unused plugins
}
```

## Rule Violations

### Too Many Violations

**Symptoms**:

```
Found 500 violations
Build failed with 500 violations
```

**Solution**:

```bash
# Check severity level
codeforge analyze --severity-level error  # Only errors

# Set max warnings
codeforge analyze --max-warnings 50

# Disable noisy rules
{
  "rules": {
    "no-console": "off"  # Temporarily disable
  }
}

# Fix incrementally
codeforge analyze --format json | jq '.summary.total'
```

### False Positives

**Symptoms**:

```
Error: Unexpected console.log
But this is in a test file!
```

**Solution**:

```bash
# Ignore test files
{
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}

# Or use inline disable
/* codeforge-disable-next-line no-console */
console.log('debug info');
/* codeforge-enable-next-line */
```

### Rule Conflicts

**Symptoms**:

```
Error: Rule 'prefer-const' conflicts with 'prefer-let'
Cannot enable both rules
```

**Solution**:

```bash
# These rules are mutually exclusive
{
  "rules": {
    "prefer-const": "warning",
    "prefer-let": "off"  # Disable conflicting rule
  }
}

# Choose based on project style
# prefer-const: Use const by default
# prefer-let: Use let by default
```

## Plugin Issues

### Plugin Not Loading

**Symptoms**:

```
Warning: Plugin 'my-plugin' not found
```

**Solution**:

```bash
# Check if installed
npm list | grep my-plugin

# Install plugin
npm install --save-dev codeforge-plugin-my-plugin

# Verify in config
{
  "plugins": ["my-plugin"]
}
```

### Plugin Errors

**Symptoms**:

```
Error: Plugin 'my-plugin' failed to load
TypeError: Cannot read property 'rules' of undefined
```

**Solution**:

```bash
# Check plugin compatibility
npm list codeforge-plugin-my-plugin

# Check plugin version
# Plugin must be compatible with CodeForge version

# Reinstall plugin
npm uninstall codeforge-plugin-my-plugin
npm install --save-dev codeforge-plugin-my-plugin@1.2.3

# Debug plugin loading
codeforge analyze --verbose --debug-plugins
```

### Plugin Rule Conflicts

**Symptoms**:

```
Error: Duplicate rule 'no-any'
Plugin 'my-plugin' defines rule 'no-any'
Core already defines this rule
```

**Solution**:

```bash
# Prefix plugin rules
{
  "rules": {
    "no-any": "warning",  # Core rule
    "my-plugin/no-any": "error"  # Plugin rule
  }
}

# Or disable core rule
{
  "rules": {
    "no-any": "off",
    "my-plugin/no-any": "error"
  }
}
```

## CI/CD Problems

### Exit Code Issues

**Symptoms**:

```
# In CI
$ codeforge analyze
Found 10 warnings
$ echo $?
0  # But CI should fail
```

**Solution**:

```bash
# Fail on warnings
codeforge analyze --fail-on-warnings

# Or set max warnings
codeforge analyze --max-warnings 0

# CI mode
codeforge analyze --ci  # Auto-enables fail-on-warnings
```

### Cache Problems in CI

**Symptoms**:

```
# In CI
$ codeforge analyze
Cache hit rate: 0%  # Should be higher
```

**Solution**:

```yaml
# In GitHub Actions
- name: Cache CodeForge results
  uses: actions/cache@v3
  with:
    path: .codeforge-cache
    key: ${{ runner.os }}-codeforge-${{ hashFiles('**/*.ts') }}
    restore-keys: |
      ${{ runner.os }}-codeforge-
```

### Timeouts in CI

**Symptoms**:

```
Error: Analysis timed out after 300s
```

**Solution**:

```bash
# Increase timeout
codeforge analyze --timeout 600

# Or in CI config
{
  "performance": {
    "timeout": 600000  # 10 minutes
  }
}

# Split analysis
- name: Analyze Core
  run: codeforge analyze src/core
- name: Analyze Features
  run: codeforge analyze src/features
```

## Error Messages

### "Cannot find module"

**Symptoms**:

```
Error: Cannot find module 'codeforge'
```

**Solution**:

```bash
# Install CodeForge
npm install --save-dev codeforge

# Check import
import { analyze } from 'codeforge';  // ✅
import analyze from 'codeforge';  // ❌ (if ESM)
```

### "Permission denied"

**Symptoms**:

```
Error: EACCES: permission denied, open '.codeforgerc.json'
```

**Solution**:

```bash
# Check file permissions
ls -la .codeforgerc.json

# Fix permissions
chmod 644 .codeforgerc.json

# Check directory permissions
ls -la . | grep codeforge
```

### "Out of memory"

**Symptoms**:

```
FATAL ERROR: CALL_AND_RETRY_LAST_ALLOCATOR
JavaScript heap out of memory
```

**Solution**:

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" codeforge analyze

# Reduce concurrency
codeforge analyze --concurrency 2

# Process smaller chunks
codeforge analyze src/core --concurrency 1
```

## Debug Mode

### Enable Verbose Output

```bash
# Verbose mode
codeforge analyze --verbose

# Debug mode
codeforge analyze --debug

# Both
codeforge analyze --verbose --debug
```

### Debug Specific Rules

```bash
# Debug one rule
codeforge analyze --rules no-any --verbose

# Debug multiple rules
codeforge analyze --rules no-any,prefer-const --verbose
```

### Debug Performance

```bash
# Profile mode
codeforge analyze --profile

# Show slowest files
codeforge analyze --profile --top 10

# Benchmark
codeforge benchmark --iterations 3 --warmup
```

### Debug Plugins

```bash
# Debug plugin loading
codeforge analyze --debug-plugins

# List loaded plugins
codeforge plugins list

# Check plugin rules
codeforge rules | grep "my-plugin/"
```

## Getting Help

### Built-in Diagnostics

```bash
# Run diagnostics
codeforge doctor

# Verbose diagnostics
codeforge doctor --verbose

# Check specific area
codeforge doctor --check performance
```

### Log Files

**Location**: `.codeforge/logs/`

```bash
# View recent logs
tail -100 .codeforge/logs/codeforge.log

# Search logs
grep "ERROR" .codeforge/logs/codeforge.log

# Clear logs
rm -rf .codeforge/logs/*
```

### Community Resources

- **GitHub Issues**: https://github.com/codeforge-dev/codeforge/issues
- **GitHub Discussions**: https://github.com/codeforge-dev/codeforge/discussions
- **Documentation**: https://codeforge.dev/docs
- **Discord**: https://discord.gg/codeforge

### Debug Information to Provide

When asking for help, provide:

```bash
# System information
codeforge --version
node --version
npm --version

# Configuration
cat .codeforgerc.json

# Verbose error output
codeforge analyze --verbose --debug 2>&1 | tee debug-output.txt

# Doctor output
codeforge doctor --verbose > doctor-output.txt
```

## Common Solutions Cheat Sheet

| Problem             | Solution                                          | Command                                                      |
| ------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Node version wrong  | Upgrade Node.js                                   | `nvm install 20`                                             |
| Config not found    | Initialize config                                 | `codeforge init`                                             |
| JSON syntax error   | Validate JSON                                     | `npx jsonlint .codeforgerc.json`                             |
| Too many violations | Set max warnings                                  | `codeforge analyze --max-warnings 50`                        |
| Slow analysis       | Use caching + `codeforge analyze --cache-results` |
| Out of memory       | Increase heap                                     | `NODE_OPTIONS="--max-old-space-size=4096" codeforge analyze` |
| Plugin not loading  | Install plugin                                    | `npm install --save-dev codeforge-plugin-X`                  |
| CI failing          | Use CI mode                                       | `codeforge analyze --ci`                                     |
| Permission denied   | Fix permissions                                   | `chmod 644 .codeforgerc.json`                                |

## Prevention Tips

1. **Use version control** for config files
2. **Run doctor regularly**: `codeforge doctor`
3. **Keep dependencies updated**: `npm update`
4. **Use caching** in CI/CD
5. **Monitor performance**: `codeforge analyze --profile`
6. **Test config changes** before committing
7. **Use CI mode** in pipelines: `codeforge analyze --ci`
8. **Read error messages carefully** - they usually contain the solution
9. **Check logs** in `.codeforge/logs/`
10. **Ask for help** with complete debug information
