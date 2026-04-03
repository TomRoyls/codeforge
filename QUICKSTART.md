# CodeForge Quick Start Guide

Get up and running with CodeForge in 5 minutes!

## Installation

```bash
# Install globally
npm install -g codeforge

# Or use with npx (no installation required)
npx codeforge --help
```

## 30-Second Setup

```bash
# Navigate to your project
cd your-project

# Initialize CodeForge
codeforge init

# Run your first analysis
codeforge analyze
```

That's it! CodeForge is now analyzing your code.

## Common Use Cases

### 1. Analyze Your Code

```bash
# Analyze entire project
codeforge analyze

# Analyze specific directory
codeforge analyze src/

# Analyze only TypeScript files
codeforge analyze --ext .ts,.tsx

# Fail CI on warnings
codeforge analyze --fail-on-warnings
```

### 2. Fix Issues Automatically

```bash
# Preview fixes
codeforge analyze --fix --dry-run

# Apply fixes
codeforge analyze --fix
```

### 3. Git Integration

```bash
# Analyze only staged files (great for pre-commit hooks)
codeforge analyze --staged

# Set up pre-commit hook
codeforge precommit
```

### 4. CI/CD Integration

```bash
# CI mode (JSON output, no colors)
codeforge analyze --ci

# With failure thresholds
codeforge analyze --ci --fail-on-warnings --max-warnings 10
```

### 5. Generate Reports

```bash
# JSON report
codeforge analyze --format json --output report.json

# HTML report
codeforge report --format html --output report.html

# SARIF for GitHub Advanced Security
codeforge report --format sarif --output results.sarif
```

## Configuration Basics

Create `.codeforgerc.json` in your project root:

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules", "dist", "**/*.test.ts"],
  "rules": {
    "no-any": "error",
    "prefer-const": "error",
    "no-unused-vars": "warning"
  }
}
```

## Recommended Setup

### For TypeScript Projects

```bash
# Create config
codeforge init --typescript

# Or use our example
cp examples/.codeforgerc.typescript.json .codeforgerc.json
```

### For React Projects

```bash
# Create config
codeforge init

# Or use our example
cp examples/.codeforgerc.react.json .codeforgerc.json
```

### For Strict Enforcement

```bash
# Use strict config
cp examples/.codeforgerc.strict.json .codeforgerc.json
```

## Performance Tips

### Enable Caching (2-5x Faster)

```bash
# Cache analysis results
codeforge analyze --cache-results

# View cache status
codeforge cache

# Clear cache if needed
codeforge cache clear
```

### Parallel Processing

```bash
# Process 8 files in parallel (default: 4)
codeforge analyze --concurrency 8
```

### Filter Files

```bash
# Only TypeScript files
codeforge analyze --ext .ts,.tsx

# Specific rules only
codeforge analyze --rules no-any,no-unused-vars
```

## Pre-Commit Hook Setup

### Option 1: Git Hooks (Recommended)

```bash
# Install pre-commit hook
codeforge precommit

# Now analyzes staged files before each commit
git commit -m "message"  # Automatically runs CodeForge
```

### Option 2: Husky

```bash
# Install husky
npm install -D husky

# Set up hook
codeforge precommit --installer husky
```

## CI/CD Examples

### GitHub Actions

```yaml
name: Code Quality
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm install -g codeforge
      - run: codeforge analyze --ci --fail-on-warnings
```

### GitLab CI

```yaml
code_quality:
  image: node:20
  script:
    - npm ci
    - npm install -g codeforge
    - codeforge analyze --ci
  artifacts:
    reports:
      codequality: gl-code-quality.json
```

## Common Commands Reference

| Command                      | Purpose                   |
| ---------------------------- | ------------------------- |
| `codeforge analyze`          | Analyze code for issues   |
| `codeforge analyze --fix`    | Auto-fix issues           |
| `codeforge analyze --staged` | Analyze only staged files |
| `codeforge analyze --ci`     | CI/CD mode                |
| `codeforge rules`            | List all available rules  |
| `codeforge explain <rule>`   | Get rule details          |
| `codeforge init`             | Create config file        |
| `codeforge doctor`           | Check setup               |
| `codeforge clean`            | Clean generated files     |
| `codeforge cache`            | Manage cache              |

## Troubleshooting

### "Command not found"

```bash
# Ensure installed globally
npm install -g codeforge

# Or use npx
npx codeforge --help
```

### Slow Analysis

```bash
# Enable caching
codeforge analyze --cache-results

# Reduce concurrency if CPU bound
codeforge analyze --concurrency 2

# Analyze only changed files
codeforge analyze --staged
```

### Too Many Warnings

```bash
# Start with minimal rules
codeforge init --minimal

# Or filter by severity
codeforge analyze --severity-level error

# Set warning threshold
codeforge analyze --max-warnings 50
```

## Next Steps

- 📖 Read the [full documentation](README.md)
- 🔧 Explore [example configurations](examples/)
- 📋 Check the [roadmap](ROADMAP.md)
- 🤝 [Contribute](CONTRIBUTING.md) to CodeForge

## Getting Help

- 📚 Documentation: [README.md](README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/codeforge-dev/codeforge/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/codeforge-dev/codeforge/discussions)

---

**You're ready to go!** 🚀

Run `codeforge analyze` on your project and start improving your code quality today.
