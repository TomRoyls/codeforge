# CodeForge Configuration Reference

Complete guide to configuring CodeForge for your codebase. This document serves as the single source of truth for all CodeForge configuration options.

## Table of Contents

- [Configuration File](#configuration-file)
- [Configuration Schema](#configuration-schema)
- [Core Settings](#core-settings)
- [Rule Configuration](#rule-configuration)
- [File Patterns](#file-patterns)
- [Environment Variables](#environment-variables)
- [Examples](#examples)
- [Validation](#validation)

---

## Configuration File

CodeForge uses a JSON configuration file named `.codeforgerc.json` located in your project root directory.

### File Location

The configuration file is searched for in the following order:

1. `.codeforgerc.json` (project root)
2. `.codeforgerc.js` (project root)
3. Path specified via `--config` flag or `CODEFORGE_CONFIG` environment variable

### Initialization

Create a configuration file using the `codeforge init` command:

```bash
# Interactive setup
codeforge init

# Minimal config
codeforge init --minimal

# TypeScript-specific config
codeforge init --typescript

# Force overwrite
codeforge init --force
```

---

## Configuration Schema

The CodeForge configuration follows this JSON schema:

```json
{
  "$schema": "https://raw.githubusercontent.com/codeforge-dev/codeforge/schema.json",
  "name": "string",
  "description": "string",
  "version": "string",
  "files": ["array", "of", "patterns"],
  "ignore": ["array", "of", "patterns"],
  "rules": {
    "rule-name": "severity",
    "rule-with-options": ["severity", { "option": "value" }]
  },
  "output": {
    "format": "console",
    "colors": true,
    "progress": true,
    "verbose": false
  },
  "cache": {
    "enabled": true,
    "location": "./.codeforge-cache",
    "ttl": 86400
  },
  "performance": {
    "concurrency": 4,
    "timeout": 60000,
    "maxFileSize": 5242880
  },
  "thresholds": {
    "maxViolations": -1,
    "maxErrors": -1,
    "maxWarnings": -1
  }
}
```

### Schema Properties

| Property      | Type          | Required | Default                                           | Description                          |
| ------------- | ------------- | -------- | ------------------------------------------------- | ------------------------------------ |
| `$schema`     | string        | No       | -                                                 | JSON Schema URL for validation       |
| `name`        | string        | No       | -                                                 | Configuration name for documentation |
| `description` | string        | No       | -                                                 | Description of this configuration    |
| `version`     | string        | No       | -                                                 | Configuration version (semver)       |
| `files`       | array<string> | No       | `["src/**/*.{ts,js}"]`                            | File patterns to analyze             |
| `ignore`      | array<string> | No       | `["node_modules", "dist", "build"]`               | Patterns to ignore                   |
| `rules`       | object        | No       | See [Default Rules](#default-rules)               | Rule configuration                   |
| `output`      | object        | No       | See [Output Settings](#output-settings)           | Output configuration                 |
| `cache`       | object        | No       | See [Cache Settings](#cache-settings)             | Cache configuration                  |
| `performance` | object        | No       | See [Performance Settings](#performance-settings) | Performance configuration            |
| `thresholds`  | object        | No       | See [Threshold Settings](#threshold-settings)     | Violation thresholds                 |

### Default Rules

When `rules` is not specified, CodeForge uses these defaults:

```json
{
  "no-unused-vars": "warning",
  "no-circular-deps": "warning",
  "prefer-const": "warning"
}
```

---

## Core Settings

### `files`

File patterns to include in analysis. Uses glob syntax.

**Type:** `array<string>`

**Default:** `["src/**/*.{ts,js}"]`

**Example:**

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx", "lib/**/*.ts"]
}
```

**Best Practices:**

- Use specific patterns to limit analysis scope
- Include all relevant source file extensions (`.ts`, `.tsx`, `.js`, `.jsx`)
- Use brace expansion for multiple extensions: `{ts,tsx}`
- Separate frontend and backend sources if needed

---

### `ignore`

Patterns to exclude from analysis. Uses glob syntax.

**Type:** `array<string>`

**Default:** `["node_modules", "dist", "build"]`

**Example:**

```json
{
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/__tests__/**",
    "**/*.stories.ts",
    ".next/**",
    ".nuxt/**",
    ".svelte-kit/**"
  ]
}
```

**Common Patterns:**

| Pattern           | Description                         |
| ----------------- | ----------------------------------- |
| `node_modules`    | Ignore npm packages                 |
| `dist`            | Ignore build output                 |
| `build`           | Ignore build output                 |
| `coverage`        | Ignore test coverage reports        |
| `**/*.test.ts`    | Ignore all TypeScript test files    |
| `**/*.spec.ts`    | Ignore all TypeScript spec files    |
| `**/__tests__/**` | Ignore tests directory              |
| `.next/**`        | Ignore Next.js build directory      |
| `.nuxt/**`        | Ignore Nuxt build directory         |
| `**/*.d.ts`       | Ignore TypeScript declaration files |

---

### `rules`

Configure which rules to run and at what severity level.

**Type:** `object`

**Default:** See [Default Rules](#default-rules)

**Structure:**

```json
{
  "rules": {
    "no-any": "error",
    "no-unused-vars": "warning",
    "max-params": ["warning", { "max": 4 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }]
  }
}
```

**Severity Levels:**

| Severity             | Description                          | Exit Code |
| -------------------- | ------------------------------------ | --------- |
| `"off"` or `"0"`     | Rule is disabled                     | -         |
| `"warning"` or `"1"` | Rule reports warnings (non-blocking) | 0         |
| `"error"` or `"2"`   | Rule reports errors (blocking)       | 1         |

**See [Rule Configuration](#rule-configuration) for detailed rule syntax.**

---

### `output`

Configure output formatting and display options.

**Type:** `object`

**Default:**

```json
{
  "output": {
    "format": "console",
    "colors": true,
    "progress": true,
    "verbose": false
  }
}
```

#### `output.format`

Output format for analysis results.

**Type:** `"console" | "json" | "html" | "junit" | "markdown" | "sarif" | "gitlab" | "csv"`

**Default:** `"console"`

**Options:**

- `"console"`: Human-readable terminal output (default)
- `"json"`: Machine-readable JSON output
- `"html"`: HTML report with interactive UI
- `"junit"`: JUnit XML for CI/CD integration
- `"markdown"`: Markdown documentation
- `"sarif"`: SARIF format for GitHub Code Scanning
- `"gitlab"`: GitLab Code Quality JSON format
- `"csv"`: Comma-separated values for spreadsheets

#### `output.colors`

Enable or disable colored output.

**Type:** `boolean`

**Default:** `true`

#### `output.progress`

Show progress spinner during analysis.

**Type:** `boolean`

**Default:** `true`

#### `output.verbose`

Show detailed information about analysis.

**Type:** `boolean`

**Default:** `false`

**Example:**

```json
{
  "output": {
    "format": "console",
    "colors": true,
    "progress": true,
    "verbose": false
  }
}
```

---

### `cache`

Configure caching behavior for faster repeated analyses.

**Type:** `object`

**Default:**

```json
{
  "cache": {
    "enabled": true,
    "location": "./.codeforge-cache",
    "ttl": 86400
  }
}
```

#### `cache.enabled`

Enable or disable result caching.

**Type:** `boolean`

**Default:** `true`

**Description:** When enabled, CodeForge caches analysis results for unchanged files to speed up subsequent runs.

#### `cache.location`

Directory path for storing cache files.

**Type:** `string`

**Default:** `"./.codeforge-cache"`

**Description:** Path relative to project root where cache files are stored.

#### `cache.ttl`

Time-to-live for cache entries in seconds.

**Type:** `number`

**Default:** `86400` (24 hours)

**Description:** How long cached results remain valid before re-analysis is required.

**Example:**

```json
{
  "cache": {
    "enabled": true,
    "location": "./.codeforge-cache",
    "ttl": 86400
  }
}
```

---

### `performance`

Configure performance settings for analysis.

**Type:** `object`

**Default:**

```json
{
  "performance": {
    "concurrency": 4,
    "timeout": 60000,
    "maxFileSize": 5242880
  }
}
```

#### `performance.concurrency`

Number of files to process in parallel.

**Type:** `number`

**Default:** `4`

**Range:** `1` to `16`

**Description:** Higher values speed up analysis on multi-core systems but use more memory.

**Recommendations:**

- Low-memory systems: `2`
- Standard workstations: `4` (default)
- High-performance workstations: `8`
- CI/CD with limited resources: `2` to `4`

#### `performance.timeout`

Maximum time in milliseconds to wait for file analysis.

**Type:** `number`

**Default:** `60000` (60 seconds)

**Description:** Per-file timeout to prevent hanging analysis.

#### `performance.maxFileSize`

Maximum file size in bytes to analyze.

**Type:** `number`

**Default:** `5242880` (5 MB)

**Description:** Files larger than this size are skipped to prevent memory issues.

**Example:**

```json
{
  "performance": {
    "concurrency": 6,
    "timeout": 60000,
    "maxFileSize": 5242880
  }
}
```

---

### `thresholds`

Configure violation thresholds for CI/CD integration.

**Type:** `object`

**Default:**

```json
{
  "thresholds": {
    "maxViolations": -1,
    "maxErrors": -1,
    "maxWarnings": -1
  }
}
```

#### `thresholds.maxViolations`

Maximum total violations allowed before non-zero exit code.

**Type:** `number`

**Default:** `-1` (unlimited)

**Description:** Exit with error code if total violations exceed this value.

#### `thresholds.maxErrors`

Maximum error-level violations allowed.

**Type:** `number`

**Default:** `-1` (unlimited)

**Description:** Exit with error code if error count exceeds this value.

#### `thresholds.maxWarnings`

Maximum warning-level violations allowed.

**Type:** `number`

**Default:** `-1` (unlimited)

**Description:** Exit with error code if warning count exceeds this value.

**Example:**

```json
{
  "thresholds": {
    "maxViolations": 100,
    "maxErrors": 20,
    "maxWarnings": 80
  }
}
```

**CI Integration:**

```bash
# Fail if more than 10 warnings
codeforge analyze --max-warnings 10

# Fail if any errors or more than 50 warnings
codeforge analyze --fail-on-warnings --max-warnings 50
```

---

## Rule Configuration

### Severity Levels

Rules can be configured with three severity levels:

| Severity    | Alias | Description                     | Exit Code |
| ----------- | ----- | ------------------------------- | --------- |
| `"off"`     | `"0"` | Rule is disabled                | -         |
| `"warning"` | `"1"` | Reports warnings (non-blocking) | 0         |
| `"error"`   | `"2"` | Reports errors (blocking)       | 1         |

### Rule Syntax

Rules can be configured in two forms:

#### Simple Severity

For rules without options:

```json
{
  "rules": {
    "no-any": "error",
    "no-unused-vars": "warning",
    "prefer-const": "off"
  }
}
```

#### Severity with Options

For rules that accept configuration options:

```json
{
  "rules": {
    "max-params": ["error", { "max": 3 }],
    "max-depth": ["warning", { "max": 4 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "max-lines-per-function": ["error", { "max": 150 }]
  }
}
```

**Syntax:** `["<severity>", { "<option>": <value> }]`

### Common Rules and Options

#### `max-params`

Limit the number of function parameters.

**Options:**

```json
{
  "max-params": ["error", { "max": 4 }]
}
```

| Option | Type   | Default | Description                |
| ------ | ------ | ------- | -------------------------- |
| `max`  | number | `3`     | Maximum allowed parameters |

**Recommendations:**

- Frontend/UI components: `3` to `4`
- Backend services: `4` to `5`
- Utility functions: `3`
- Event handlers: `5` to `6`

---

#### `max-depth`

Limit nesting depth of code blocks.

**Options:**

```json
{
  "max-depth": ["warning", { "max": 3 }]
}
```

| Option | Type   | Default | Description           |
| ------ | ------ | ------- | --------------------- |
| `max`  | number | `3`     | Maximum nesting depth |

**Recommendations:**

- Readable code: `3`
- Complex algorithms: `4` to `5`
- Highly nested logic: Refactor to `3` or less

---

#### `max-lines-per-function`

Limit the number of lines in a function.

**Options:**

```json
{
  "max-lines-per-function": ["warning", { "max": 150 }]
}
```

| Option | Type   | Default | Description                |
| ------ | ------ | ------- | -------------------------- |
| `max`  | number | `100`   | Maximum lines per function |

**Recommendations:**

- Simple functions: `50`
- Standard functions: `100` to `150`
- Complex handlers: `200` (with refactoring plan)

---

#### `no-console`

Disallow or restrict console usage.

**Options:**

```json
{
  "no-console": ["warning", { "allow": ["warn", "error"] }]
}
```

| Option  | Type          | Default | Description             |
| ------- | ------------- | ------- | ----------------------- |
| `allow` | array<string> | `[]`    | Allowed console methods |

**Common Allow Lists:**

```json
// Backend (logging allowed)
{ "allow": ["warn", "error", "info", "debug"] }

// Frontend (error logging only)
{ "allow": ["warn", "error"] }

// Strict (no console allowed)
{ "allow": [] }

// Development (all allowed)
{ "allow": ["log", "warn", "error", "info", "debug"] }
```

---

#### `prefer-template`

Prefer template literals over string concatenation.

**Options:**

```json
{
  "prefer-template": ["error", { "allowSingleQuote": false }]
}
```

| Option             | Type    | Default | Description                      |
| ------------------ | ------- | ------- | -------------------------------- |
| `allowSingleQuote` | boolean | `false` | Allow single-quote concatenation |

---

### Rule Categories

CodeForge rules are organized into categories:

#### Type Safety

- `no-any`: Disallow `any` type usage
- `no-unused-vars`: Disallow unused variables
- `prefer-const`: Prefer `const` over `let`
- `prefer-interface`: Prefer interfaces over type aliases
- `prefer-readonly`: Prefer readonly modifiers

#### Complexity

- `max-params`: Limit function parameters
- `max-depth`: Limit nesting depth
- `max-lines-per-function`: Limit function length
- `max-lines-file`: Limit file length

#### Dependencies

- `no-circular-deps`: Detect circular dependencies
- `no-deprecated-api`: Detect deprecated API usage

#### Best Practices

- `no-console`: Control console usage
- `no-eval`: Disallow `eval()` usage
- `no-delete`: Warn on `delete` operator
- `prefer-template`: Prefer template literals
- `no-useless-comparison`: Detect useless comparisons

#### Async

- `no-floating-promises`: Detect unhandled promises
- `no-empty-catch`: Detect empty catch blocks
- `no-async-await`: Detect unnecessary async/await

#### Code Quality

- `no-empty-function`: Detect empty functions
- `no-debugger`: Detect debugger statements

### List All Rules

View all available rules:

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

### Rule Explanation

Get detailed information about a rule:

```bash
codeforge explain max-params
codeforge explain no-console
codeforge explain no-circular-deps
```

---

## File Patterns

### Glob Syntax Reference

CodeForge uses [minimatch](https://github.com/isaacs/minimatch) glob pattern matching.

#### Basic Patterns

| Pattern         | Matches                                      |
| --------------- | -------------------------------------------- |
| `*.ts`          | All `.ts` files in current directory         |
| `**/*.ts`       | All `.ts` files in all subdirectories        |
| `src/**/*.ts`   | All `.ts` files in `src/` and subdirectories |
| `src/{ts,tsx}`  | All `.ts` and `.tsx` files in `src/`         |
| `*.{ts,tsx,js}` | All `.ts`, `.tsx`, and `.js` files           |

#### Wildcards

| Wildcard | Description                                     |
| -------- | ----------------------------------------------- |
| `*`      | Matches any character except `/`                |
| `**`     | Matches any character including `/` (recursive) |
| `?`      | Matches exactly one character                   |
| `!`      | Negates pattern (when used in ignore)           |

#### Brace Expansion

```json
// Multiple extensions
"src/**/*.{ts,tsx,js,jsx}"

// Multiple directories
"{src,lib,components}/**/*.ts"

// Number ranges
"src/file-[1-5].ts"
```

#### Negation

```json
{
  "ignore": [
    "!src/index.ts", // Don't ignore specific file
    "**/*.test.ts" // But ignore all test files
  ]
}
```

### Common Patterns by Project Type

#### TypeScript Project

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules", "dist", "build", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### React Project

```json
{
  "files": ["src/**/*.{ts,tsx}"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

#### Vue Project

```json
{
  "files": ["src/**/*.{ts,vue,js}"],
  "ignore": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### Svelte Project

```json
{
  "files": ["src/**/*.{ts,svelte,js}"],
  "ignore": ["node_modules", ".svelte-kit", "dist", "build"]
}
```

#### Next.js Project

```json
{
  "files": ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "pages/**/*.{ts,tsx}"],
  "ignore": ["node_modules", ".next", "out", "**/*.test.ts", "**/*.test.tsx"]
}
```

#### Monorepo

```json
{
  "files": ["packages/**/*.{ts,tsx,js,jsx}"],
  "ignore": ["**/node_modules", "**/dist", "**/build", "**/*.test.ts", "**/*.test.tsx"]
}
```

#### Microservices

```json
{
  "files": ["services/**/*.{ts,js}", "packages/**/*.{ts,js}", "libs/**/*.{ts,js}"],
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/coverage/**"
  ]
}
```

### Best Practices for File Organization

1. **Be Specific**: Use precise patterns to limit analysis scope
2. **Exclude Tests**: Ignore test files with `**/*.test.*` patterns
3. **Ignore Build Artifacts**: Always ignore `dist`, `build`, `.next`, `.nuxt`, etc.
4. **Separate Concerns**: Use different patterns for frontend vs backend code
5. **Document Patterns**: Comment complex glob patterns for future reference
6. **Test Patterns**: Use `codeforge analyze --verbose` to verify patterns match expected files
7. **Version Control**: Add `.codeforge-cache` to `.gitignore`

---

## Environment Variables

CodeForge supports the following environment variables:

### `CODEFORGE_CONFIG`

Specify a custom configuration file path.

**Example:**

```bash
export CODEFORGE_CONFIG=/path/to/custom/config.json
codeforge analyze
```

**Use Cases:**

- Multiple configurations for different environments
- Shared configuration across multiple projects
- CI/CD pipeline configuration management
- Testing different rule sets without modifying file

### `CODEFORGE_NO_COLOR`

Disable colored output.

**Example:**

```bash
export CODEFORGE_NO_COLOR=1
codeforge analyze
```

### `CODEFORGE_CACHE_DIR`

Override the default cache directory location.

**Example:**

```bash
export CODEFORGE_CACHE_DIR=/custom/cache/path
codeforge analyze
```

### `CODEFORGE_LOG_LEVEL`

Set logging verbosity level.

**Values:** `error`, `warn`, `info`, `debug`, `trace`

**Example:**

```bash
export CODEFORGE_LOG_LEVEL=debug
codeforge analyze
```

### CLI Flags Override

CLI flags take precedence over configuration file and environment variables:

```bash
# Override config with CLI flags
codeforge analyze \
  --config custom.json \
  --files "src/**/*.ts" \
  --ignore "node_modules" \
  --format json \
  --output report.json
```

---

## Examples

### Minimal Configuration

Light enforcement for gradual adoption.

```json
{
  "files": ["src/**/*.ts", "src/**/*.js"],
  "ignore": ["node_modules", "dist", "coverage"],
  "rules": {
    "no-unused-vars": "warning",
    "no-circular-deps": "warning",
    "no-useless-comparison": "warning"
  }
}
```

**Use Case:** Projects wanting to introduce CodeForge gradually without blocking CI.

---

### TypeScript Configuration

Standard TypeScript project setup.

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules", "dist", "coverage", "**/*.test.ts", "**/*.spec.ts"],
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 4 }],
    "max-depth": ["warning", { "max": 4 }],
    "no-console": "warning"
  }
}
```

**Use Case:** TypeScript projects requiring strong type safety enforcement.

---

### React Configuration

Frontend React/TypeScript projects.

```json
{
  "files": ["src/**/*.{ts,tsx}"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 3 }],
    "max-depth": ["warning", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "prefer-readonly": "warning",
    "no-useless-comparison": "error"
  }
}
```

**Use Case:** React applications with strict type safety and developer-friendly console warnings.

---

### Node.js Backend Configuration

Backend services and APIs.

```json
{
  "files": ["src/**/*.ts", "src/**/*.js"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js"
  ],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 5 }],
    "max-depth": ["warning", { "max": 4 }],
    "no-console": ["warning", { "allow": ["warn", "error", "info"] }],
    "no-useless-comparison": "error",
    "prefer-template": "warning",
    "no-delete": "warning"
  }
}
```

**Use Case:** Node.js backend services with logging capabilities.

---

### Strict Configuration

Maximum code quality enforcement.

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules", "dist", "coverage", "**/*.test.ts"],
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-console": "error",
    "no-circular-deps": "error",
    "max-params": ["error", { "max": 3 }],
    "max-depth": ["error", { "max": 3 }],
    "no-eval": "error",
    "no-deprecated-api": "error"
  }
}
```

**Use Case:** Critical production code requiring maximum strictness.

---

### Microservices Configuration

Multiple services with shared code.

```json
{
  "$schema": "https://raw.githubusercontent.com/codeforge-dev/codeforge/schema.json",
  "name": "Microservices",
  "description": "Configuration for microservices architecture with multiple services",
  "version": "1.0.0",
  "files": [
    "services/**/*.ts",
    "services/**/*.js",
    "packages/**/*.ts",
    "packages/**/*.js",
    "libs/**/*.ts",
    "libs/**/*.js"
  ],
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.tsbuildinfo/**",
    "**/*.d.ts",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/coverage/**",
    "**/.cache/**",
    "**/temp/**"
  ],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "warning",
    "no-circular-deps": "error",
    "max-params": ["error", { "max": 4 }],
    "max-depth": ["warning", { "max": 4 }],
    "max-lines-function": ["warning", { "max": 100 }],
    "no-console": ["warning", { "allow": ["warn", "error", "info", "debug"] }],
    "no-delete": "warning",
    "no-eval": "error",
    "prefer-template": "warning",
    "no-useless-comparison": "warning",
    "prefer-readonly": "warning",
    "no-empty-function": "warning",
    "no-empty-catch": "error",
    "no-async-await": "warning",
    "no-floating-promises": "error"
  },
  "output": {
    "format": "console",
    "colors": true,
    "progress": true,
    "verbose": false
  },
  "cache": {
    "enabled": true,
    "location": "./.codeforge-cache",
    "ttl": 86400
  },
  "performance": {
    "concurrency": 6,
    "timeout": 60000,
    "maxFileSize": 5242880
  },
  "thresholds": {
    "maxViolations": 100,
    "maxErrors": 20,
    "maxWarnings": 80
  }
}
```

**Use Case:** Complex microservices architecture with performance optimization and CI/CD integration.

---

### Next.js API Routes Configuration

Server-side Next.js code.

```json
{
  "files": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "pages/**/*.ts",
    "pages/**/*.tsx",
    "app/**/*.ts",
    "app/**/*.tsx",
    "lib/**/*.ts",
    "lib/**/*.tsx",
    "components/**/*.ts",
    "components/**/*.tsx",
    "hooks/**/*.ts",
    "hooks/**/*.tsx",
    "utils/**/*.ts",
    "utils/**/*.tsx",
    "types/**/*.ts",
    "types/**/*.tsx"
  ],
  "ignore": [
    "node_modules",
    ".next",
    "out",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/__tests__/**",
    "**/*.stories.ts",
    "**/*.stories.tsx",
    ".next/**"
  ],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 4 }],
    "max-depth": ["warning", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "prefer-readonly": "warning",
    "no-useless-comparison": "error",
    "prefer-template": "warning",
    "max-lines-per-function": ["warning", { "max": 150 }]
  }
}
```

**Use Case:** Next.js applications with API routes and server-side rendering.

---

### Testing Configuration

Analyze test files alongside source code.

```json
{
  "files": ["src/**/*.{ts,tsx}", "**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
  "ignore": ["node_modules", "dist", "build", "coverage"],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "warning",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 5 }],
    "no-console": ["warning", { "allow": ["warn", "error", "info", "debug"] }],
    "no-empty-catch": "error",
    "no-floating-promises": "error"
  }
}
```

**Use Case:** Projects wanting to ensure test quality alongside source code quality.

---

## Validation

### Validate Configuration

Validate your configuration file for errors:

```bash
# Validate config in current directory
codeforge config validate

# Validate specific config file
codeforge config validate --config .codeforgerc.json
```

### Visualize Configuration

View your current configuration in a readable format:

```bash
# Visualize as tree
codeforge config visualize

# Visualize as JSON
codeforge config visualize --json

# Show configuration sources
codeforge config visualize --sources
```

### Common Validation Errors

#### Missing Required Fields

```json
// ERROR: Missing 'files' array
{
  "rules": {
    "no-any": "error"
  }
}
```

**Fix:** Add required `files` array or use defaults.

---

#### Invalid Rule Name

```json
// ERROR: Unknown rule 'non-existent-rule'
{
  "rules": {
    "non-existent-rule": "error"
  }
}
```

**Fix:** Use `codeforge rules` to list available rules.

---

#### Invalid Severity

```json
// ERROR: Invalid severity 'critical'
{
  "rules": {
    "no-any": "critical"
  }
}
```

**Fix:** Use valid severity: `"off"`, `"warning"`, or `"error"`.

---

#### Malformed Rule Options

```json
// ERROR: 'max-params' expects object for options
{
  "rules": {
    "max-params": ["error", 5]
  }
}
```

**Fix:** Use object syntax for options:

```json
{
  "rules": {
    "max-params": ["error", { "max": 5 }]
  }
}
```

---

#### Invalid File Pattern

```json
// ERROR: Invalid glob pattern
{
  "files": ["src/**/{*.ts"]
}
```

**Fix:** Use proper glob syntax:

```json
{
  "files": ["src/**/*.ts"]
}
```

### Debugging Configuration

Use verbose output to diagnose configuration issues:

```bash
codeforge analyze --verbose
codeforge doctor --verbose
```

---

## Additional Resources

- [CLI Usage Guide](CLI_USAGE.md) - Complete command reference
- [Architecture Guide](ARCHITECTURE.md) - Architecture patterns and decisions
- [Example Configurations](../examples/) - 42 ready-to-use configurations
- [Quick Start Guide](../QUICKSTART.md) - Get started in 5 minutes
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Diagnose common issues

---

## Appendix

### Complete Rule List

| Rule ID                  | Category       | Default Severity | Options                      |
| ------------------------ | -------------- | ---------------- | ---------------------------- |
| `no-any`                 | Type Safety    | `warning`        | -                            |
| `no-unused-vars`         | Type Safety    | `warning`        | -                            |
| `prefer-const`           | Type Safety    | `warning`        | -                            |
| `prefer-interface`       | Type Safety    | `off`            | -                            |
| `prefer-readonly`        | Type Safety    | `off`            | -                            |
| `max-params`             | Complexity     | `warning`        | `max` (number)               |
| `max-depth`              | Complexity     | `warning`        | `max` (number)               |
| `max-lines-per-function` | Complexity     | `off`            | `max` (number)               |
| `max-lines-file`         | Complexity     | `off`            | `max` (number)               |
| `no-circular-deps`       | Dependencies   | `warning`        | -                            |
| `no-deprecated-api`      | Dependencies   | `off`            | -                            |
| `no-console`             | Best Practices | `off`            | `allow` (array<string>)      |
| `no-eval`                | Best Practices | `off`            | -                            |
| `no-delete`              | Best Practices | `off`            | -                            |
| `prefer-template`        | Best Practices | `off`            | `allowSingleQuote` (boolean) |
| `no-useless-comparison`  | Best Practices | `off`            | -                            |
| `no-floating-promises`   | Async          | `off`            | -                            |
| `no-empty-catch`         | Async          | `off`            | -                            |
| `no-async-await`         | Async          | `off`            | -                            |
| `no-empty-function`      | Code Quality   | `off`            | -                            |
| `no-debugger`            | Code Quality   | `off`            | -                            |

### Exit Codes

| Code | Description                                             |
| ---- | ------------------------------------------------------- |
| `0`  | Success - No violations or only warnings                |
| `1`  | Errors found - Analysis detected error-level violations |
| `2`  | Configuration error - Invalid configuration file        |

### Configuration File Priority

1. Command-line flags (highest priority)
2. `CODEFORGE_CONFIG` environment variable
3. `.codeforgerc.json` (project root)
4. `.codeforgerc.js` (project root)
5. Built-in defaults (lowest priority)

### Version History

- `1.0.0` - Initial configuration schema
- Added `thresholds` section
- Added `performance` section
- Added `cache` section
- Added `output` section

---

**Last Updated:** 2024
**Configuration Version:** 1.0.0
**CodeForge Version:** 0.1.0
