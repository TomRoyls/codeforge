# Performance Optimization Guide

This guide provides tips for optimizing CodeForge performance on large codebases.

## Quick Wins

### 1. Enable Caching

**Problem**: Re-analyzing unchanged files wastes time.

**Solution**: Enable result caching:

```bash
codeforge analyze --cache-results
```

Or in `.codeforgerc.json`:

```json
{
  "cache": {
    "enabled": true,
    "ttl": 3600
  }
}
```

**Impact**: 60-80% faster on subsequent runs.

### 2. Adjust Concurrency

**Problem**: Default concurrency (4) may not be optimal for your machine.

**Solution**: Tune based on CPU cores:

```bash
# For 8-core machines
codeforge analyze --concurrency 8

# For 16-core machines
codeforge analyze --concurrency 12
```

**Impact**: 30-50% faster analysis.

### 3. Use .codeforgeignore

**Problem**: Analyzing unnecessary files (tests, fixtures, etc.) slows analysis.

**Solution**: Create `.codeforgeignore`:

```
# Test files
**/*.test.ts
**/*.spec.ts
test/

# Generated files
**/generated/**
dist/

# Dependencies
node_modules/
```

**Impact**: 40-60% fewer files to analyze.

### 4. Target Specific Rules

**Problem**: Running all rules when you only care about a few.

**Solution**: Run specific rules:

```bash
# Only check for console.log statements
codeforge analyze --rules no-console

# Check multiple specific rules
codeforge analyze --rules no-console,no-debugger,no-any
```

**Impact**: 70-90% faster for targeted checks.

## Advanced Optimizations

### 1. Incremental Analysis

For CI/CD pipelines, only analyze changed files:

```bash
# Analyze only staged files
codeforge analyze --staged

# Analyze files changed in last commit
git diff --name-only HEAD~1 | xargs codeforge analyze
```

### 2. Parallel Jobs

For very large codebases, split analysis across multiple CI jobs:

```yaml
# GitHub Actions example
jobs:
  analyze-core:
    runs-on: ubuntu-latest
    steps:
      - run: codeforge analyze src/core/ --format json --output core-results.json

  analyze-utils:
    runs-on: ubuntu-latest
    steps:
      - run: codeforge analyze src/utils/ --format json --output utils-results.json
```

### 3. Watch Mode for Development

During active development, use watch mode to analyze only on save:

```bash
codeforge analyze --watch
```

This provides instant feedback without full analysis overhead.

## Performance Troubleshooting

### Slow Analysis

**Symptoms**: Analysis takes > 30 seconds for medium codebase.

**Check**:

1. How many files are being analyzed? Add `--verbose` to see.
2. Are you analyzing `node_modules/`? Add to ignore.
3. Is concurrency too low? Increase `--concurrency`.
4. Are there many large files? Consider splitting them.

### High Memory Usage

**Symptoms**: CodeForge uses > 1GB RAM.

**Solutions**:

1. Reduce concurrency (paradoxically, this can help with memory)
2. Analyze in smaller chunks by directory
3. Use `--quiet` to reduce output buffering

### CI/CD Slowdowns

**Symptoms**: CI pipeline takes too long.

**Solutions**:

1. Cache `.codeforge/` directory between runs
2. Use `--format junit` for CI integration (faster than console)
3. Only analyze changed files with `--staged`

## Benchmarks

| Codebase Size            | Files | Without Cache | With Cache | Speedup |
| ------------------------ | ----- | ------------- | ---------- | ------- |
| Small (< 100 files)      | 85    | 2.3s          | 0.8s       | 2.9x    |
| Medium (100-500 files)   | 342   | 8.7s          | 2.1s       | 4.1x    |
| Large (500-1000 files)   | 823   | 24.3s         | 5.2s       | 4.7x    |
| Enterprise (1000+ files) | 1,547 | 52.1s         | 9.8s       | 5.3x    |

_Benchmarks run on MacBook Pro M1, default concurrency (4)_

## Need Help?

- Run `codeforge doctor` for automatic performance diagnostics
- Check [GitHub Issues](https://github.com/codeforge-dev/codeforge/issues) for known performance issues
- Review [Quick Start Guide](QUICKSTART.md) for optimization setup
