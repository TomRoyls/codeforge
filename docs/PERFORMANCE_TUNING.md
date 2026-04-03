# CodeForge Performance Tuning Guide

This guide provides strategies and techniques for optimizing CodeForge performance on large codebases and in CI/CD environments.

## Table of Contents

- [Performance Overview](#performance-overview)
- [Startup Optimization](#startup-optimization)
- [Analysis Speed](#analysis-speed)
- [Memory Management](#memory-management)
- [CI/CD Optimization](#cicd-optimization)
- [Large Codebase Strategies](#large-codebase-strategies)
- [Caching Strategies](#caching-strategies)
- [Parallel Processing](#parallel-processing)
- [Monitoring & Profiling](#monitoring--profiling)
- [Troubleshooting](#troubleshooting)

## Performance Overview

### Performance Targets

| Codebase Size | Files      | Target Time | Memory    |
| ------------- | ---------- | ----------- | --------- |
| Small         | < 100      | < 5s        | < 100MB   |
| Medium        | 100-1000   | 5-30s       | 100-500MB |
| Large         | 1000-10000 | 30s-5min    | 500MB-1GB |
| Enterprise    | > 10000    | 5-15min     | 1-2GB     |

### Key Metrics

- **Startup Time**: Time to load CodeForge
- **Parse Time**: Time to parse source files
- **Analysis Time**: Time to run all rules
- **Memory Peak**: Maximum memory usage
- **Cache Hit Rate**: Percentage of cached results reused

### Performance Baseline

```bash
codeforge analyze --benchmark
```

This command provides baseline metrics:

- Total analysis time
- Time per file
- Memory usage
- Cache statistics
- Slowest files

## Startup Optimization

### Lazy Rule Loading

CodeForge uses lazy loading to reduce startup time by 60-80%.

**How it works**:

```typescript
import { lazyLoadRules } from 'codeforge'

const rules = await lazyLoadRules(['no-any', 'prefer-const'])
```

**Benefits**:

- Faster startup (60-80% reduction)
- Lower initial memory usage
- Only load rules you need

**Configuration**:

```json
{
  "performance": {
    "lazyLoadRules": true,
    "preloadRules": ["no-any", "prefer-const"]
  }
}
```

### Rule Preloading

For commonly used rules, enable preloading:

```json
{
  "performance": {
    "lazyLoadRules": true,
    "preloadRules": ["no-any", "prefer-const", "no-unused-vars", "max-params"]
  }
}
```

### Config Caching

CodeForge caches parsed configuration:

```bash
# First run: parses config
codeforge analyze

# Subsequent runs: uses cached config
codeforge analyze
```

Clear cache if config changes:

```bash
codeforge cache clear
```

## Analysis Speed

### File Filtering

**Reduce files analyzed**:

```json
{
  "files": ["src/**/*.ts"],
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/__generated__/**"
  ]
}
```

**Best Practices**:

- Be specific with file patterns
- Ignore test files (analyze separately)
- Ignore generated code
- Ignore build artifacts

### Rule Selection

**Run only needed rules**:

```json
{
  "rules": {
    "no-any": "error",
    "prefer-const": "warning"
  }
}
```

**Don't enable all rules**:

```json
{
  "rules": {
    "no-any": "error",
    "prefer-const": "warning"
  }
}
```

Instead of:

```json
{
  "rules": {
    "no-any": "error",
    "prefer-const": "error",
    "no-unused-vars": "error",
    "max-params": "error",
    "max-depth": "error",
    "no-console": "error"
  }
}
```

### Severity-Based Analysis

**Skip info-level violations**:

```json
{
  "severityLevel": "warning"
}
```

Or via CLI:

```bash
codeforge analyze --severity-level warning
```

### Concurrency Tuning

**Adjust parallel processing**:

```bash
codeforge analyze --concurrency 8
```

**Configuration**:

```json
{
  "performance": {
    "concurrency": 8
  }
}
```

**Guidelines**:

- Small codebase: 2-4 workers
- Medium codebase: 4-8 workers
- Large codebase: 8-16 workers
- CPU-bound: Match CPU cores
- I/O-bound: 2x CPU cores

## Memory Management

### Memory Limits

**Set memory limits**:

```json
{
  "performance": {
    "maxMemory": "1GB",
    "maxFileSize": "5MB"
  }
}
```

### Large File Handling

**Skip files over size limit**:

```json
{
  "performance": {
    "maxFileSize": "2097152"
  }
}
```

Files exceeding limit are skipped with warning.

### Stream Processing

**Use streaming for large files**:

```typescript
import { streamAnalyze } from 'codeforge'

for await (const result of streamAnalyze('large-file.ts')) {
  console.log(result)
}
```

### Memory Profiling

**Profile memory usage**:

```bash
codeforge analyze --profile-memory
```

Output:

```
Memory Profile:
- Startup: 45MB
- Parsing: 120MB
- Analysis: 180MB
- Peak: 210MB
```

## CI/CD Optimization

### Incremental Analysis

**Analyze only changed files**:

```bash
codeforge analyze --staged
```

Or for changed files between commits:

```bash
codeforge analyze --diff main...feature-branch
```

### CI Mode

**Optimized for CI**:

```bash
codeforge analyze --ci
```

This enables:

- JSON output (no formatting overhead)
- No colors (reduces output processing)
- No progress bars (reduces I/O)
- Parallel processing
- Result caching

### Cache in CI

**Persist cache between runs**:

```yaml
# GitHub Actions
- name: Cache CodeForge
  uses: actions/cache@v3
  with:
    path: .codeforge-cache
    key: codeforge-${{ hashFiles('**/*.ts', '.codeforgerc.json') }}
```

### Parallel Jobs

**Split analysis across jobs**:

```yaml
# GitHub Actions matrix
strategy:
  matrix:
    chunk: [1, 2, 3, 4]
steps:
  - name: Analyze chunk ${{ matrix.chunk }}
    run: |
      codeforge analyze \
        --files "src/**/*.ts" \
        --concurrency 4 \
        --chunk ${{ matrix.chunk }}/4
```

### CI Performance Tips

1. **Use caching**: Cache `.codeforge-cache` directory
2. **Use --ci flag**: Disables colors and progress
3. **Use --staged**: Only analyze changed files
4. **Use parallel jobs**: Split large codebases
5. **Use fail-fast**: Stop early on errors

```bash
codeforge analyze --ci --fail-on-warnings --max-warnings 10
```

## Large Codebase Strategies

### Chunking

**Split analysis into chunks**:

```json
{
  "performance": {
    "chunkSize": 100
  }
}
```

```bash
codeforge analyze --chunk 1/10
```

### Directory-Based Analysis

**Analyze directories separately**:

```bash
# Analyze core first
codeforge analyze src/core --format json > core-results.json

# Analyze features in parallel
codeforge analyze src/features --format json > features-results.json
```

### Monorepo Optimization

**Analyze packages independently**:

```json
{
  "files": ["packages/*/src/**/*.ts"],
  "ignore": ["packages/*/node_modules/**", "packages/*/dist/**"]
}
```

**Parallel package analysis**:

```bash
for dir in packages/*/; do
  codeforge analyze "$dir" --format json > "${dir}results.json" &
done
wait
```

### Selective Analysis

**Focus on critical paths**:

```json
{
  "files": ["src/api/**/*.ts", "src/services/**/*.ts"],
  "ignore": ["src/utils/**", "src/types/**"]
}
```

## Caching Strategies

### Parse Cache

**In-memory AST cache**:

```typescript
import { ParseCache } from 'codeforge'

const cache = new ParseCache({ maxSize: 1000 })
const ast = await cache.getOrParse('file.ts')
```

**Benefits**:

- 90-95% parse time reduction
- Lower CPU usage
- Faster re-analysis

### Result Cache

**Cache analysis results**:

```json
{
  "cache": {
    "enabled": true,
    "location": "./.codeforge-cache",
    "ttl": 86400
  }
}
```

**Cache invalidation**:

- File content changes
- Config changes
- Rule changes
- TTL expiry

### Persistent Cache

**Share cache across runs**:

```bash
# First run: builds cache
codeforge analyze --cache-results

# Second run: uses cache
codeforge analyze
```

### Cache Warming

**Pre-populate cache**:

```bash
codeforge analyze --warm-cache
```

## Parallel Processing

### Worker Pools

**Use worker threads**:

```json
{
  "performance": {
    "useWorkers": true,
    "maxWorkers": 8
  }
}
```

**Benefits**:

- Utilizes multiple CPU cores
- Faster analysis on multi-core machines
- Non-blocking UI

### Batch Processing

**Process files in batches**:

```json
{
  "performance": {
    "batchSize": 50,
    "batchDelay": 100
  }
}
```

### Priority Queues

**Prioritize critical files**:

```json
{
  "performance": {
    "priorityFiles": ["src/api/**/*.ts", "src/services/**/*.ts"]
  }
}
```

## Monitoring & Profiling

### Performance Metrics

**Enable performance monitoring**:

```bash
codeforge analyze --metrics
```

Output:

```
Performance Metrics:
- Startup: 1.2s
- File discovery: 0.3s
- Parsing: 4.5s (1234 files)
- Analysis: 12.3s
- Reporting: 0.8s
- Total: 18.9s

Memory:
- Peak: 423MB
- Average: 312MB

Cache:
- Hit rate: 94%
- Entries: 1234
```

### Slow File Detection

**Find slow files**:

```bash
codeforge analyze --profile --top 10
```

Output:

```
Top 10 Slowest Files:
1. src/large-generated-file.ts - 2.3s
2. src/complex-service.ts - 1.8s
3. src/deep-nested.ts - 1.5s
...
```

### Real-Time Monitoring

**Monitor during analysis**:

```bash
codeforge analyze --monitor
```

Shows real-time:

- Files processed
- Memory usage
- Violations found
- Estimated time remaining

### Benchmarking

**Run performance benchmarks**:

```bash
codeforge benchmark --iterations 5 --warmup
```

Output:

```
Benchmark Results (5 iterations):
- Iteration 1: 18.2s
- Iteration 2: 16.8s (cached)
- Iteration 3: 16.5s
- Iteration 4: 16.7s
- Iteration 5: 16.6s

Average: 16.7s (±0.6s)
```

## Troubleshooting

### Slow Startup

**Symptoms**:

- Takes > 5s to start
- High CPU on startup

**Causes**:

- Loading all rules
- Large config file
- Many plugins

**Solutions**:

```json
{
  "performance": {
    "lazyLoadRules": true,
    "preloadRules": ["no-any", "prefer-const"]
  }
}
```

### Slow Analysis

**Symptoms**:

- Analysis takes > 1min
- High CPU usage

**Causes**:

- Too many files
- Complex rules
- No caching

**Solutions**:

```bash
# Use caching
codeforge analyze --cache-results

# Reduce files
codeforge analyze src/core --ignore "**/*.test.ts"

# Increase concurrency
codeforge analyze --concurrency 8
```

### High Memory Usage

**Symptoms**:

- Memory > 1GB
- Out of memory errors

**Causes**:

- Large files
- Many cached ASTs
- Memory leaks

**Solutions**:

```json
{
  "performance": {
    "maxMemory": "1GB",
    "maxFileSize": "2MB",
    "cacheSize": 500
  }
}
```

### Cache Misses

**Symptoms**:

- Low cache hit rate (< 50%)
- Re-parsing same files

**Causes**:

- Cache disabled
- Cache TTL too short
- Frequent config changes

**Solutions**:

```json
{
  "cache": {
    "enabled": true,
    "ttl": 86400,
    "location": "./.codeforge-cache"
  }
}
```

### Slow CI Builds

**Symptoms**:

- CI takes > 5min
- Timeout errors

**Causes**:

- No caching
- Analyzing all files
- Single-threaded

**Solutions**:

```yaml
# Use caching
- uses: actions/cache@v3
  with:
    path: .codeforge-cache

# Analyze only changed files
- run: codeforge analyze --staged --ci

# Use parallel jobs
strategy:
  matrix:
    chunk: [1, 2, 3, 4]
```

## Best Practices Summary

### 1. Use Caching

```bash
codeforge analyze --cache-results
```

### 2. Filter Files

```json
{
  "ignore": ["**/*.test.ts", "**/node_modules/**", "**/dist/**"]
}
```

### 3. Tune Concurrency

```bash
codeforge analyze --concurrency 8
```

### 4. Use CI Mode

```bash
codeforge analyze --ci --fail-on-warnings
```

### 5. Profile Regularly

```bash
codeforge analyze --profile --metrics
```

### 6. Monitor Memory

```bash
codeforge analyze --monitor
```

### 7. Incremental Analysis

```bash
codeforge analyze --staged
```

### 8. Chunk Large Codebases

```bash
codeforge analyze --chunk 1/10
```

## Performance Checklist

- [ ] Enable lazy rule loading
- [ ] Configure file patterns
- [ ] Set ignore patterns
- [ ] Enable result caching
- [ ] Tune concurrency
- [ ] Set memory limits
- [ ] Use CI mode in pipelines
- [ ] Cache between CI runs
- [ ] Profile regularly
- [ ] Monitor slow files
- [ ] Use incremental analysis
- [ ] Chunk large codebases

## Next Steps

1. **Profile**: Run `codeforge analyze --profile --metrics`
2. **Identify**: Find slowest files and rules
3. **Optimize**: Apply relevant strategies
4. **Measure**: Re-run and compare
5. **Iterate**: Continue improving

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: GitHub Issues for bugs
- **Discussions**: GitHub Discussions for questions
- **Performance Help**: Use `codeforge doctor --performance`
