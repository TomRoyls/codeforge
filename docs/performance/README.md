# Performance Optimization Guide

This guide covers performance optimization strategies for CodeForge, helping you get the most out of your code analysis workflow.

## Table of Contents

- [Overview](#overview)
- [Caching Strategies](#caching-strategies)
  - [ParseCache](#parsecache)
  - [AST Cache](#ast-cache)
  - [Result Cache](#result-cache)
  - [Config Cache](#config-cache)
- [Parallel Processing](#parallel-processing)
  - [Concurrency Settings](#concurrency-settings)
  - [Worker Threads](#worker-threads)
- [Large Codebase Optimization](#large-codebase-optimization)
  - [File Discovery](#file-discovery)
  - [Incremental Analysis](#incremental-analysis)
- [Startup Performance](#startup-performance)
  - [Lazy Rule Loading](#lazy-rule-loading)
  - [Rule Preloading](#rule-preloading)
- [Memory Management](#memory-management)
  - [Cache Invalidation](#cache-invalidation)
  - [Cleanup Strategies](#cleanup-strategies)
- [Benchmarking](#benchmarking)
  - [Running Benchmarks](#running-benchmarks)
  - [Interpreting Results](#interpreting-results)
- [CI/CD Optimization](#cicd-optimization)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)

## Overview

CodeForge is designed for high-performance code analysis with several built-in optimization features:

- **Multi-layer Caching**: Parse cache, AST cache, and result cache work together to minimize redundant work
- **Lazy Loading**: Rules load on-demand, reducing startup time by 60-80%
- **Parallel Processing**: Analyze multiple files concurrently using configurable worker threads
- **Incremental Analysis**: Only reanalyze files that have changed
- **Smart File Discovery**: Fast-glob based file discovery with efficient pattern matching

### Performance Benefits

| Feature             | Performance Improvement            | Use Case                                  |
| ------------------- | ---------------------------------- | ----------------------------------------- |
| AST Cache           | 90-95% reduction in parse time     | Repeated analysis of unchanged files      |
| Result Cache        | 85-95% reduction in analysis time  | Running the same rules on unchanged files |
| Lazy Rule Loading   | 60-80% reduction in startup time   | Running specific rules or rule subsets    |
| Parallel Processing | Near-linear speedup with CPU cores | Large codebases with many files           |
| Config Cache        | Instant config loading             | Multiple runs with same configuration     |

## Caching Strategies

CodeForge uses a sophisticated multi-layer caching system to avoid redundant work and speed up analysis.

### ParseCache

**Location**: [`src/cache/parse-cache.ts`](../../src/cache/parse-cache.ts)

ParseCache is an in-memory LRU (Least Recently Used) cache that stores parsed SourceFile objects. It uses file stat information (modification time and size) for cache invalidation.

#### Key Features

- **In-memory storage**: Fast access to recently parsed files
- **LRU eviction**: Automatically evicts least recently used entries when full (default: 100 files)
- **Stat-based invalidation**: Automatically invalidates cache when files change
- **Hit rate tracking**: Monitors cache effectiveness

#### Configuration

```typescript
// Default ParseCache configuration
const parseCache = new ParseCache({
  maxSize: 100, // Maximum number of files to cache
})

// Get cache statistics
const stats = parseCache.getStats()
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)
console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`)
```

#### When to Use

- **Small to medium projects**: In-memory cache is ideal for projects with < 1000 files
- **Repeated analysis**: Same files analyzed multiple times in a session
- **Development workflows**: Frequent incremental changes with cached results

#### When to Disable

- **Memory-constrained environments**: ParseCache uses significant memory for large projects
- **One-off analysis**: Single analysis run where cache won't be reused

### AST Cache

**Location**: [`src/cache/ast-cache.ts`](../../src/cache/ast-cache.ts)

ASTCache provides persistent disk-based caching of parsed ASTs, surviving process restarts. It uses content hashing for precise invalidation.

#### Key Features

- **Persistent storage**: Survives process restarts by storing ASTs on disk
- **Content-based invalidation**: SHA-256 hash of file content ensures precise cache validation
- **Version-based invalidation**: Automatically invalidates when CodeForge version changes
- **TTL (Time-to-live)**: 7-day default expiration prevents stale cache buildup
- **90-95% speedup**: Cached files skip expensive parsing entirely

#### Configuration

```typescript
// Default ASTCache configuration
const astCache = new ASTCache(project, {
  cacheDir: '.codeforge/cache/ast', // Default cache directory
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  version: '0.1.0', // CodeForge version for invalidation
  enabled: true, // Enable/disable cache at runtime
})

// Get cache statistics
const stats = await astCache.getStats()
console.log(`Cache entries: ${stats.entries}`)
console.log(`Total size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)

// Clean up expired entries
const cleaned = await astCache.cleanup()
console.log(`Cleaned ${cleaned} expired entries`)

// Enable/disable at runtime
astCache.setEnabled(false) // Disable cache
astCache.setEnabled(true) // Enable cache
```

#### Cache Key Structure

```typescript
// Internal cache key format
const cacheKey = `ast:${version}:${filePath}:${contentHash}`
// Example: ast:0.1.0:/path/to/file.ts:a1b2c3d4...
```

#### When to Use

- **Large projects**: Persistent cache prevents re-parsing thousands of files
- **CI/CD workflows**: Cache can be reused between runs
- **Frequent analysis**: Same codebase analyzed multiple times

#### When to Disable

- **Storage-constrained environments**: Disk space is limited
- **One-off migrations**: Single analysis where cache won't be reused
- **Debugging**: Disable to rule out cache-related issues

### Result Cache

**Location**: [`src/cache/result-cache.ts`](../../src/cache/result-cache.ts)

ResultCache stores rule analysis results, providing 85-95% reduction in analysis time for unchanged files. It invalidates on file changes, rule configuration changes, or version changes.

#### Key Features

- **Result storage**: Caches violation results from rule execution
- **Triple invalidation**: File hash, config hash, and version validation
- **Per-rule caching**: Results stored per file per rule configuration
- **Config-aware**: Automatically invalidates when rule configuration changes

#### Configuration

```typescript
// Default ResultCache configuration
const resultCache = new ResultCache({
  cacheDir: '.codeforge/cache/results', // Default cache directory
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  version: '0.1.0', // CodeForge version for invalidation
  enabled: true, // Enable/disable cache at runtime
})

// Get cache statistics
const stats = await resultCache.getStats()
console.log(`Cache entries: ${stats.entries}`)
console.log(`Total size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)

// Invalidate specific file
const deleted = await resultCache.invalidateFile('/path/to/file.ts')
console.log(`Invalidated ${deleted} cache entries`)

// Clean up expired entries
const cleaned = await resultCache.cleanup()
console.log(`Cleaned ${cleaned} expired entries`)

// Enable/disable at runtime
resultCache.setEnabled(false) // Disable cache
resultCache.setEnabled(true) // Enable cache
```

#### Config Hash Generation

```typescript
// Generate config hash for cache invalidation
const configHash = resultCache.hashConfig(
  ['no-console-log', 'max-params', 'no-unused-vars'], // Active rules
  { 'max-params': 4 }, // Rule-specific configuration
)
console.log(`Config hash: ${configHash}`)
```

#### Cache Key Structure

```typescript
// Internal cache key format
const cacheKey = `result:${version}:${filePath}:${fileHash}:${configHash}`
// Example: result:0.1.0:/path/to/file.ts:a1b2c3d4...:e5f6g7h8...
```

#### When to Use

- **Complex rule sets**: Running many rules on large codebases
- **Iterative development**: Making small changes and re-analyzing
- **CI/CD pipelines**: Reusing analysis results between builds

#### When to Disable

- **Rule development**: Developing new rules where cache would be invalidated
- **Config changes**: Frequently changing rule configurations
- **Debugging**: Disable to ensure fresh analysis

### Config Cache

**Location**: [`src/config/cache.ts`](../../src/config/cache.ts)

ConfigCache provides caching for parsed configuration files, using content-based invalidation to ensure cache validity.

#### Key Features

- **Config parsing caching**: Stores parsed configuration objects
- **Content-based invalidation**: Invalidates when config file content changes
- **Fast startup**: Skips config parsing for unchanged configurations

#### Configuration

```typescript
// Default ConfigCache configuration
const configCache = new ConfigCache('.codeforge/cache')

// Get cached config
const config = await configCache.getConfig('.codeforgerc.json')

// Clear cache
await configCache.clear()
```

#### When to Use

- **Multiple config files**: Projects with multiple configuration files
- **Frequent runs**: Same configuration used across many runs

#### When to Disable

- **Config development**: Actively modifying configuration files
- **Debugging**: Rule out config caching issues

## Parallel Processing

CodeForge supports parallel processing to leverage multi-core CPUs for faster analysis.

### Concurrency Settings

The `--concurrency` flag controls the number of files processed in parallel.

#### Default Behavior

```bash
# Default: 4 files in parallel
codeforge analyze
```

#### Optimal Concurrency

```bash
# Match CPU core count (recommended for most systems)
codeforge analyze --concurrency $(nproc)  # Linux
codeforge analyze --concurrency $(sysctl -n hw.ncpu)  # macOS

# Conserve system resources (lower for background tasks)
codeforge analyze --concurrency 2
```

#### Configuration

```json
{
  "concurrency": 8
}
```

### Worker Threads

CodeForge uses `p-limit` to control concurrency, ensuring efficient CPU utilization without overwhelming system resources.

#### Implementation

```typescript
import pLimit from 'p-limit'
import os from 'node:os'

const limit = pLimit(os.cpus().length)

await Promise.all(
  files.map((file) =>
    limit(async () => {
      await analyzeFile(file)
    }),
  ),
)
```

#### Best Practices

- **CPU-bound tasks**: Set concurrency to CPU core count
- **I/O-bound tasks**: Can set higher than CPU core count
- **System monitoring**: Monitor CPU and memory usage during analysis
- **Background analysis**: Lower concurrency for system responsiveness

## Large Codebase Optimization

Optimizing for large codebases requires strategic file discovery and incremental analysis.

### File Discovery

**Location**: [`src/core/file-discovery.ts`](../../src/core/file-discovery.ts)

CodeForge uses `fast-glob` for efficient file discovery with pattern matching and ignore support.

#### Features

- **Streaming discovery**: Processes files as they're found
- **Pattern matching**: Glob patterns for file selection
- **Ignore patterns**: Exclude directories and files
- **Progress reporting**: Optional callback for progress updates

#### Configuration

```bash
# Analyze specific file types
codeforge analyze --files "**/*.ts" --files "**/*.tsx"

# Ignore specific directories
codeforge analyze --ignore "**/test/**" --ignore "**/e2e/**"

# Use custom ignore file
codeforge analyze --ignore-path .codeforgeignore
```

#### Ignore File (`.codeforgeignore`)

```
# Directories
node_modules/
dist/
build/
coverage/

# File patterns
*.test.ts
*.spec.ts
*.d.ts

# Specific paths
legacy/vendor/
third-party/
```

#### Performance Tips

1. **Narrow scope**: Analyze only relevant directories

   ```bash
   codeforge analyze src/ --ignore "**/test/**"
   ```

2. **File extension filtering**: Analyze only specific types

   ```bash
   codeforge analyze --ext .ts,.tsx
   ```

3. **Exclude generated files**: Ignore auto-generated code
   ```bash
   codeforge analyze --ignore "**/generated/**"
   ```

### Incremental Analysis

Incremental analysis only reanalyzes files that have changed, leveraging cache for unchanged files.

#### How It Works

1. Calculate content hash for each file
2. Check cache for existing analysis results
3. Skip cached files with matching hashes
4. Analyze only changed or uncached files

#### Configuration

```bash
# Enable result caching (default: enabled)
codeforge analyze --cache-results

# Disable caching for fresh analysis
codeforge analyze --no-cache-results
```

#### Best Practices

- **Enable caching**: Default for most use cases
- **Regular cache cleanup**: Prevent stale cache buildup
- **Version tracking**: Cache automatically invalidates on version changes

#### Cache Management

```bash
# Show cache status
codeforge cache

# Clear all caches
codeforge cache clear

# Clear specific cache
rm -rf .codeforge/cache/ast
rm -rf .codeforge/cache/results
```

## Startup Performance

CodeForge implements lazy loading to minimize startup time when running specific rules.

### Lazy Rule Loading

**Location**: [`src/rules/lazy-loader.ts`](../../src/rules/lazy-loader.ts)

LazyRuleLoader loads rules on-demand instead of eagerly loading all 100+ rules at startup.

#### Benefits

- **60-80% faster startup**: When running specific rules
- **Reduced memory footprint**: Only loads needed rules
- **On-demand loading**: Rules load when first accessed

#### Implementation

```typescript
import { LazyRuleLoader } from './rules/lazy-loader.js'

const loader = new LazyRuleLoader()

// Load a single rule
const rule = await loader.loadRule('no-console-log')

// Load multiple rules
const rules = await loader.loadRules(['no-console-log', 'max-params'])

// Load all rules in a category
const complexityRules = await loader.loadRulesByCategory('complexity')
```

#### Categories

Rules are organized by category:

- `complexity`: Complexity-related rules
- `dependencies`: Dependency analysis rules
- `performance`: Performance optimization rules
- `security`: Security vulnerability rules
- `patterns`: Code pattern rules (largest category)
- `correctness`: Correctness rules

### Rule Preloading

Preload frequently used rules for better performance.

#### When to Preload

- **Known rule sets**: Running the same rules repeatedly
- **Startup-critical workflows**: Need all rules loaded at startup

#### Configuration

```typescript
import { lazyRuleLoader } from './rules/lazy-loader.js'

// Preload specific rules
await lazyRuleLoader.preload(['no-console-log', 'max-params', 'no-unused-vars'])

// Preload all rules in category
await lazyRuleLoader.loadRulesByCategory('performance')

// Check cache statistics
const stats = lazyRuleLoader.getCacheStats()
console.log(`Cached: ${stats.cached}/${stats.total} rules`)
```

#### Eager Loading

```typescript
// Enable eager loading (load all rules at startup)
const loader = new LazyRuleLoader({ eagerLoading: true })
```

## Memory Management

Proper cache management prevents memory bloat and ensures optimal performance.

### Cache Invalidation

CodeForge uses multiple invalidation strategies to ensure cache freshness.

#### Strategies

1. **Time-based (TTL)**: Cache entries expire after a set time
2. **Content-based**: Cache invalidates when file content changes
3. **Version-based**: Cache invalidates when CodeForge version changes

#### ParseCache Invalidation

```typescript
// Automatic invalidation based on file stats
const cached = parseCache.get(filePath)
// Returns undefined if file modification time or size changed
```

#### AST Cache Invalidation

```typescript
// Triple validation
const cached = await astCache.get(filePath, contentHash)
// Returns null if any of these fail:
// 1. Version mismatch
// 2. Content hash mismatch
// 3. TTL expired
```

#### Result Cache Invalidation

```typescript
// Triple validation
const cached = await resultCache.get(filePath, fileHash, configHash)
// Returns null if any of these fail:
// 1. Version mismatch
// 2. File hash mismatch
// 3. Config hash mismatch
// 4. TTL expired
```

### Cleanup Strategies

Regular cleanup prevents cache bloat and frees disk space.

#### Manual Cleanup

```bash
# Clear all caches
codeforge clean --cache

# Clear specific cache directory
rm -rf .codeforge/cache/ast
rm -rf .codeforge/cache/results

# Clean only dist and build
codeforge clean --dist
```

#### Programmatic Cleanup

```typescript
// Clean up expired AST cache entries
const astCleaned = await astCache.cleanup()
console.log(`AST cache: removed ${astCleaned} expired entries`)

// Clean up expired result cache entries
const resultCleaned = await resultCache.cleanup()
console.log(`Result cache: removed ${resultCleaned} expired entries`)

// Clear entire cache
await parseCache.clear()
await astCache.clear()
await resultCache.clear()
```

#### Automated Cleanup

```typescript
// Run cleanup periodically (e.g., in a background job)
setInterval(
  async () => {
    await astCache.cleanup()
    await resultCache.cleanup()
  },
  24 * 60 * 60 * 1000,
) // Every 24 hours
```

#### Cleanup Recommendations

- **Regular cleanup**: Run cleanup weekly or monthly
- **After version upgrades**: Clear cache to avoid conflicts
- **Storage monitoring**: Monitor cache directory size
- **TTL tuning**: Adjust TTL based on project needs

## Benchmarking

CodeForge includes a built-in benchmark command to measure rule performance and identify bottlenecks.

### Running Benchmarks

```bash
# Benchmark all rules on current directory
codeforge benchmark

# Benchmark on specific directory
codeforge benchmark src/

# Show top 10 slowest rules
codeforge benchmark --top 10

# Run 5 iterations for more accurate results
codeforge benchmark --iterations 5

# Benchmark specific rules
codeforge benchmark --rules no-console-log,max-params

# Skip warmup iteration
codeforge benchmark --no-warmup

# Save results to file
codeforge benchmark --output benchmark-results.json
```

### Interpreting Results

```
Results (sorted by average time):
Rule ID                                   Avg (ms)  Min (ms)  Max (ms)  Total (ms)
------------------------------------------------------------------------------------------
max-complexity                              245.32    240.15    252.41    735.96
no-circular-deps                           189.45    185.20    195.30    568.35
max-depth                                  156.78    150.42    163.25    470.34
no-console-log                               12.34     10.20     15.45     37.02
prefer-const                                 8.92      7.85      9.85     26.76

Summary:
  Total rules benchmarked: 5
  Total time: 1838.43ms
  Slowest rule: max-complexity (245.32ms avg)
  Fastest rule: prefer-const (8.92ms avg)
```

#### Performance Thresholds

- **Green**: < 50ms average (fast)
- **Yellow**: 50-100ms average (acceptable)
- **Red**: > 100ms average (slow, consider optimization)

#### Metrics

- **Avg (ms)**: Average execution time across all iterations
- **Min (ms)**: Fastest execution time
- **Max (ms)**: Slowest execution time
- **Total (ms)**: Sum of all execution times

#### Optimization Insights

Use benchmark results to:

1. **Identify slow rules**: Focus optimization on worst performers
2. **Compare rules**: Understand relative performance
3. **Track improvements**: Measure before/after optimizations
4. **Set expectations**: Know which rules are naturally slower

## CI/CD Optimization

Optimize CodeForge for CI/CD environments to reduce build times and resource usage.

### Cache Persistence

Persist caches between CI runs for faster builds.

#### GitHub Actions

```yaml
name: Code Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install CodeForge
        run: npm install -g codeforge

      - name: Cache CodeForge cache
        uses: actions/cache@v3
        with:
          path: .codeforge/cache
          key: codeforge-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            codeforge-

      - name: Run analysis
        run: codeforge analyze --ci --cache-results

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: analysis-results
          path: results.json
```

#### GitLab CI

```yaml
code_analysis:
  image: node:20
  cache:
    key: codeforge-cache
    paths:
      - .codeforge/cache
  script:
    - npm install -g codeforge
    - codeforge analyze --ci --cache-results
  artifacts:
    reports:
      codequality: gl-code-quality.json
```

### CI-Specific Configuration

```bash
# CI mode (disables colors, progress, sets JSON output)
codeforge analyze --ci

# Fail on warnings
codeforge analyze --ci --fail-on-warnings

# Output to file
codeforge analyze --ci --format json --output results.json

# Analyze only changed files (for PR checks)
codeforge analyze --staged
```

### Resource Limits

Configure resource limits for CI environments:

```yaml
# Limit CPU usage
codeforge analyze --concurrency 2

# Limit memory (via Node.js)
NODE_OPTIONS="--max-old-space-size=4096" codeforge analyze

# Timeout prevention
timeout 300 codeforge analyze || true
```

### Parallel Jobs

Run multiple analysis jobs in parallel:

```yaml
jobs:
  analyze:
    strategy:
      matrix:
        path: [src/, lib/, api/]
    runs-on: ubuntu-latest
    steps:
      - name: Analyze ${{ matrix.path }}
        run: codeforge analyze ${{ matrix.path }} --ci
```

## Configuration Options

### Performance-Related Configuration

```json
{
  "concurrency": 4,
  "cacheResults": true,
  "cacheDir": ".codeforge/cache",
  "rules": ["no-console-log", "max-params"],
  "ignore": ["**/test/**", "**/node_modules/**"],
  "files": ["**/*.ts", "**/*.tsx"]
}
```

### Environment Variables

```bash
# Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Disable caching
export CODEFORGE_NO_CACHE=1

# Custom cache directory
export CODEFORGE_CACHE_DIR=/tmp/codeforge-cache

# Debug logging
export DEBUG=codeforge:*
```

### Command-Line Flags

| Flag                 | Description                                   | Default |
| -------------------- | --------------------------------------------- | ------- |
| `--concurrency`      | Number of files to process in parallel        | 4       |
| `--cache-results`    | Enable caching of analysis results            | true    |
| `--no-cache-results` | Disable result caching                        | -       |
| `--ci`               | CI mode (no colors, no progress, JSON output) | false   |
| `--staged`           | Analyze only staged files in git              | false   |

## Troubleshooting

### Common Performance Issues

#### Slow Startup

**Symptoms**: CodeForge takes a long time to start before analyzing files.

**Possible Causes**:

- Eager rule loading enabled
- Many rules configured
- Config file parsing overhead

**Solutions**:

```bash
# Check if eager loading is enabled
codeforge config visualize

# Reduce number of rules
codeforge analyze --rules no-console-log,max-params

# Use config file caching
codeforge analyze --cache-results
```

#### Low Cache Hit Rate

**Symptoms**: Cache shows low hit rate (< 50%).

**Possible Causes**:

- Frequent file changes
- TTL too short
- Cache disabled

**Solutions**:

```typescript
// Check cache statistics
const stats = await astCache.getStats()
console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`)

// Increase TTL
const astCache = new ASTCache(project, {
  ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
})

// Ensure cache is enabled
astCache.setEnabled(true)
```

#### High Memory Usage

**Symptoms**: CodeForge uses excessive memory during analysis.

**Possible Causes**:

- Too high concurrency
- Large ParseCache
- Memory leaks in rules

**Solutions**:

```bash
# Reduce concurrency
codeforge analyze --concurrency 2

# Clear caches regularly
codeforge cache clear

# Limit Node.js memory
NODE_OPTIONS="--max-old-space-size=2048" codeforge analyze
```

#### Disk Space Issues

**Symptoms**: Cache directory grows very large.

**Possible Causes**:

- Long TTL
- No cleanup
- Large codebase

**Solutions**:

```bash
# Check cache size
du -sh .codeforge/cache

# Clean up expired entries
codeforge cache clear

# Reduce TTL in configuration
# (Requires custom configuration)
```

### Debug Mode

Enable debug logging to identify performance bottlenecks:

```bash
# Enable debug logging
DEBUG=codeforge:* codeforge analyze

# Enable verbose output
codeforge analyze --verbose

# Check cache status
codeforge cache
```

### Performance Profiling

Use Node.js profiling tools to identify bottlenecks:

```bash
# Generate CPU profile
node --prof $(which codeforge) analyze

# Generate heap snapshot
node --heapsnapshot-signal=SIGUSR2 $(which codeforge) analyze
kill -SIGUSR2 $(pgrep -f codeforge)
```

### Getting Help

If you continue to experience performance issues:

1. **Check logs**: Review debug logs for error messages
2. **Benchmark**: Run `codeforge benchmark` to identify slow rules
3. **Disable plugins**: Temporarily disable plugins to isolate the issue
4. **Check system resources**: Ensure adequate CPU and memory
5. **Update CodeForge**: Ensure you're using the latest version

## Best Practices Summary

### Quick Wins

1. **Enable caching**: Use `--cache-results` (default enabled)
2. **Set appropriate concurrency**: Match CPU core count
3. **Use ignore patterns**: Exclude test and build directories
4. **Narrow file scope**: Analyze only relevant directories
5. **Regular cleanup**: Run `codeforge cache clear` periodically

### Long-Term Optimization

1. **Benchmark regularly**: Track performance over time
2. **Monitor cache hit rate**: Ensure caching is effective
3. **Profile bottlenecks**: Use benchmark and debug tools
4. **Optimize CI**: Cache effectively in CI/CD pipelines
5. **Stay updated**: Keep CodeForge updated for performance improvements

### Configuration Checklist

- [ ] Enable caching (`--cache-results`)
- [ ] Set appropriate concurrency (`--concurrency`)
- [ ] Configure ignore patterns (`.codeforgeignore`)
- [ ] Limit file scope (`--files`, `--ext`)
- [ ] Use CI mode in CI environments (`--ci`)
- [ ] Set up cache persistence in CI/CD
- [ ] Configure resource limits in CI/CD

## Additional Resources

- [Source Code](../../src)
- [ParseCache Implementation](../../src/cache/parse-cache.ts)
- [AST Cache Implementation](../../src/cache/ast-cache.ts)
- [Result Cache Implementation](../../src/cache/result-cache.ts)
- [Lazy Rule Loader](../../src/rules/lazy-loader.ts)
- [Benchmark Command](../../src/commands/benchmark.ts)
- [File Discovery](../../src/core/file-discovery.ts)
- [Configuration](../../src/config)
