# CodeForge CLI Usage Guide

Complete guide to using CodeForge CLI for code analysis and quality enforcement.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Core Commands](#core-commands)
4. [Configuration](#configuration)
5. [CI/CD Integration](#cicd-integration)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)

## Installation

### Global Installation

```bash
npm install -g codeforge
```

### Local Installation

```bash
npm install --save-dev codeforge
```

### Using npx

```bash
npx codeforge --help
```

## Quick Start

### 1. Initialize Configuration

```bash
codeforge init
```

This creates a `.codeforgerc.json` file in your project root.

### 2. Analyze Your Code

```bash
codeforge analyze src/
```

### 3. Fix Issues

```bash
codeforge fix src/
```

## Core Commands

### `analyze` - Code Analysis

Analyze code for violations and issues.

```bash
# Analyze current directory
codeforge analyze

# Analyze specific directory
codeforge analyze src/

# Analyze with specific config
codeforge analyze --config .codeforgerc.json

# Output as JSON
codeforge analyze --format json --output report.json

# Fail on warnings (CI mode)
codeforge analyze --fail-on-warnings
```

**Common Flags:**

- `--config, -c`: Path to config file
- `--files, -f`: Glob patterns for files
- `--ignore, -i`: Patterns to ignore
- `--format`: Output format (console, json, markdown, html, junit, sarif, gitlab)
- `--output, -o`: Output file path
- `--fail-on-warnings`: Exit with error code on warnings
- `--fix`: Automatically fix violations
- `--dry-run`: Preview fixes without applying

### `fix` - Auto-fix Violations

Automatically fix violations in source files.

```bash
# Fix all violations
codeforge fix

# Preview fixes without applying
codeforge fix --dry-run

# Fix specific rules only
codeforge fix --rules prefer-const,no-unused-vars

# Fix with concurrency
codeforge fix --concurrency 8
```

### `interactive` - Interactive Fix Mode

Interactively review and fix violations.

```bash
# Start interactive mode
codeforge interactive

# Only review errors
codeforge interactive --severity error

# Auto-apply safe fixes
codeforge interactive --auto-safe
```

### `init` - Initialize Configuration

Create a new CodeForge configuration file.

```bash
# Create config interactively
codeforge init

# Create minimal config
codeforge init --minimal

# Create TypeScript config
codeforge init --typescript

# Overwrite existing config
codeforge init --force
```

### `rules` - List Available Rules

List all available analysis rules.

```bash
# List all rules
codeforge rules

# Filter by category
codeforge rules --category complexity

# Show only fixable rules
codeforge rules --fixable

# Search rules
codeforge rules --search async

# Output as JSON
codeforge rules --format json
```

### `explain` - Explain a Rule

Explain a specific rule in detail.

```bash
codeforge explain no-any
codeforge explain max-params
```

### `health` - Project Health Score

Display project health score and recommendations.

```bash
codeforge health
codeforge health --json
codeforge health --verbose
```

### `stats` - Codebase Statistics

Display codebase statistics and metrics.

```bash
codeforge stats
codeforge stats --format json
codeforge stats --top 20
```

### `dependencies` - Dependency Analysis

Analyze and visualize module dependencies.

```bash
codeforge dependencies
codeforge dependencies --circular
codeforge dependencies --tree
```

### `exports` - Export Analysis

Analyze and list exports from TypeScript/JavaScript files.

```bash
codeforge exports
codeforge exports --type function
codeforge exports --unused
```

### `score` - Quality Score

Calculate aggregate quality score for the codebase.

```bash
codeforge score
codeforge score --json
```

### `debt` - Technical Debt Tracker

Track and analyze technical debt in your codebase.

```bash
codeforge debt
codeforge debt --history
codeforge debt --save
```

### `report` - Generate Reports

Generate analysis reports in various formats.

```bash
# Console report
codeforge report

# HTML report
codeforge report --format html --output report.html --open

# JUnit XML for CI
codeforge report --format junit --output junit.xml

# SARIF for GitHub Code Scanning
codeforge report --format sarif --output results.sarif
```

### `benchmark` - Performance Benchmarking

Benchmark rule performance on a codebase.

```bash
codeforge benchmark
codeforge benchmark --top 10
codeforge benchmark --iterations 5
```

### `watch` - Watch Mode

Watch files for changes and analyze on save.

```bash
codeforge watch
codeforge watch src/
codeforge watch --debounce 500
```

### `precommit` - Git Hooks Setup

Set up git pre-commit hooks to run CodeForge.

```bash
# Setup with git hooks
codeforge precommit

# Setup with husky
codeforge precommit --installer husky

# Custom command
codeforge precommit --command "npm test"
```

### `ci` - CI Configuration Generator

Generate CI/CD configuration files for GitHub Actions and GitLab CI.

```bash
# Generate for all platforms
codeforge ci

# GitHub Actions only
codeforge ci --platform github

# GitLab CI only
codeforge ci --platform gitlab
```

### `clean` - Clean Generated Files

Clean generated files and caches.

```bash
# Clean all
codeforge clean

# Preview without deleting
codeforge clean --dry-run

# Clean only caches
codeforge clean --cache

# Clean only dist
codeforge clean --dist
```

### `cache` - Cache Management

Manage the CodeForge cache.

```bash
# Show cache status
codeforge cache

# Clear cache
codeforge cache clear
```

### `doctor` - Diagnostics

Diagnose configuration and environment issues.

```bash
codeforge doctor
codeforge doctor --json
codeforge doctor --verbose
```

### `diff` - Compare Violations

Compare violations between git branches or commits.

```bash
# Compare with previous commit
codeforge diff

# Compare branches
codeforge diff main feature-branch

# Output as JSON
codeforge diff --json
```

### `docs` - Generate Rule Documentation

Generate markdown documentation for all rules.

```bash
codeforge docs
codeforge docs --output ./documentation
codeforge docs --category complexity
```

### `migrate` - Migrate from Other Linters

Migrate from another linter to CodeForge.

```bash
# Migrate from ESLint
codeforge migrate --from eslint

# Preview migration
codeforge migrate --from eslint --dry-run
```

### `organize-imports` - Import Organization

Organize and sort imports in TypeScript files.

```bash
codeforge organize-imports
codeforge organize-imports --group --sort
codeforge organize-imports --write
```

## Configuration

### Configuration File

Create a `.codeforgerc.json` file in your project root:

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx"],
  "ignore": ["node_modules", "dist", "**/*.test.ts"],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["warning", { "max": 4 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }]
  }
}
```

### Rule Severity

- `"off"`: Disable the rule
- `"warning"`: Report as warning
- `"error"`: Report as error (exits with code 1)

### Rule Options

Pass options to rules using arrays:

```json
{
  "rules": {
    "max-params": ["error", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error", "info"] }]
  }
}
```

## CI/CD Integration

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
      - run: npm run build
      - run: codeforge analyze --ci --fail-on-warnings
```

### GitLab CI

```yaml
code_quality:
  image: node:20
  script:
    - npm ci
    - npm run build
    - codeforge analyze --format gitlab --output gl-code-quality.json
  artifacts:
    reports:
      codequality: gl-code-quality.json
```

### Pre-commit Hook

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

codeforge analyze --staged --fail-on-warnings
```

## Advanced Usage

### Custom Output Formatters

```bash
# HTML report with custom styling
codeforge report --format html --output report.html

# JUnit XML for Jenkins
codeforge report --format junit --output junit.xml

# SARIF for GitHub Advanced Security
codeforge report --format sarif --output results.sarif

# GitLab Code Quality
codeforge report --format gitlab --output gl-code-quality.json

# CSV for spreadsheet import
codeforge report --format csv --output violations.csv
```

### Parallel Processing

```bash
# Process 8 files concurrently
codeforge analyze --concurrency 8

# Use all available CPU cores
codeforge analyze --concurrency $(nproc)
```

### Caching

```bash
# Enable result caching
codeforge analyze --cache-results

# Clear cache before analysis
codeforge cache clear && codeforge analyze
```

### Git Integration

```bash
# Analyze only staged files
codeforge analyze --staged

# Compare violations between branches
codeforge diff main feature-branch

# Analyze changed files in PR
codeforge analyze --files "$(git diff --name-only main...HEAD)"
```

### Rule Filtering

```bash
# Run specific rules only
codeforge analyze --rules no-any,max-params,prefer-const

# Skip specific rules
codeforge analyze --rules '!no-console,!max-lines'
```

## Troubleshooting

### Common Issues

#### "Command not found"

**Problem**: `codeforge: command not found`

**Solution**:

```bash
# Install globally
npm install -g codeforge

# Or use npx
npx codeforge --help
```

#### "Configuration file not found"

**Problem**: CodeForge can't find `.codeforgerc.json`

**Solution**:

```bash
# Initialize configuration
codeforge init

# Or specify config path
codeforge analyze --config path/to/config.json
```

#### "No files matched"

**Problem**: No files match the patterns in `files`

**Solution**:

```bash
# Check your file patterns
codeforge analyze --verbose

# Use explicit file patterns
codeforge analyze --files "src/**/*.ts" --files "lib/**/*.js"
```

#### "Out of memory"

**Problem**: Analysis fails with memory error on large codebases

**Solution**:

```bash
# Reduce concurrency
codeforge analyze --concurrency 2

# Analyze in chunks
codeforge analyze src/ --output report-src.json
codeforge analyze lib/ --output report-lib.json
```

### Performance Tips

1. **Use Caching**: Enable `--cache-results` for repeated analyses
2. **Reduce Concurrency**: Lower `--concurrency` on memory-constrained systems
3. **Filter Files**: Use specific `--files` patterns to reduce scope
4. **Ignore Unnecessary**: Add patterns to `ignore` array in config

### Getting Help

```bash
# Show help for a command
codeforge analyze --help

# Explain a specific rule
codeforge explain max-params

# Run diagnostics
codeforge doctor

# Check version
codeforge --version
```

## Additional Resources

- [Documentation](https://github.com/codeforge-dev/codeforge#readme)
- [Examples](./examples/README.md)
- [Contributing](../CONTRIBUTING.md)
- [Changelog](../CHANGELOG.md)
