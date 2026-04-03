# CodeForge Framework Configurations

Complete guide to using and customizing CodeForge configurations for different frameworks and project types.

## Overview

CodeForge provides pre-configured examples for 13 different frameworks and use cases. These configurations are optimized for specific development workflows, with appropriate file patterns, ignore rules, and rule severity settings.

Each configuration file is a JSON file that you can copy to your project root as `.codeforgerc.json` and customize for your needs.

## Quick Start

### 1. Choose Your Framework

Select the configuration that matches your project type:

| Project Type        | Config File                    | Use Case                               |
| ------------------- | ------------------------------ | -------------------------------------- |
| TypeScript Library  | `.codeforgerc.typescript.json` | Pure TypeScript projects, npm packages |
| React Application   | `.codeforgerc.react.json`      | React with TypeScript                  |
| Node.js Backend     | `.codeforgerc.nodejs.json`     | Backend services, APIs, CLI tools      |
| Vue.js Application  | `.codeforgerc.vue.json`        | Vue 2/3 with TypeScript                |
| Svelte Application  | `.codeforgerc.svelte.json`     | Svelte with TypeScript                 |
| Angular Application | `.codeforgerc.angular.json`    | Angular projects                       |
| Next.js Application | `.codeforgerc.nextjs.json`     | Next.js (App/Pages Router)             |
| GraphQL API         | `.codeforgerc.graphql.json`    | GraphQL servers, resolvers             |
| REST API            | `.codeforgerc.rest-api.json`   | Express, Fastify, Koa APIs             |
| Express.js Backend  | `.codeforgerc.express.json`    | Express.js specific projects           |
| Minimal Enforcement | `.codeforgerc.minimal.json`    | Lightweight introduction to CodeForge  |
| Strict Quality      | `.codeforgerc.strict.json`     | Maximum code quality enforcement       |

### 2. Copy Configuration

```bash
# Example for React project
cp examples/.codeforgerc.react.json .codeforgerc.json
```

### 3. Run Analysis

```bash
codeforge analyze src/
```

---

## Framework Configurations

### TypeScript

**File**: `.codeforgerc.typescript.json`

**Best for**: Pure TypeScript libraries, npm packages, Node.js applications with TypeScript.

**Key Features**:

- Analyzes `.ts` files in `src/` directory
- Ignores test files (`*.test.ts`, `*.spec.ts`) and build artifacts
- Enforces type safety with `no-any` at error level
- Warns on circular dependencies and complexity issues
- Warns on console usage (use a proper logging library instead)

**Rules Configuration**:

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

**Setup Command**:

```bash
cp examples/.codeforgerc.typescript.json .codeforgerc.json
```

**Best Practices**:

- Use this for library projects where type safety is critical
- Gradually increase `max-params` and `max-depth` limits as needed
- Replace `console.*` calls with a proper logging library (winston, pino)
- Consider adding more rules from [Rules Documentation](../rules/) for stricter enforcement

---

### React

**File**: `.codeforgerc.react.json`

**Best for**: React applications with TypeScript, Create React App, Vite React projects.

**Key Features**:

- Analyzes `.ts` and `.tsx` files
- Stricter parameter limits (max 3) to encourage smaller, focused components
- Allows `console.warn` and `console.error` for debugging
- Enables `prefer-readonly` for immutability in props and state
- Detects useless comparisons that can cause re-renders

**Rules Configuration**:

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

**Setup Command**:

```bash
cp examples/.codeforgerc.react.json .codeforgerc.json
```

**Best Practices**:

- Keep component props as readonly to prevent mutations
- Use `console.warn` sparingly - prefer a logging library in production
- Split large components into smaller ones when hitting parameter limits
- Consider adding React-specific rules if available in plugins

**Customization Tips**:

```json
// Allow console.log in development only
"no-console": process.env.NODE_ENV === 'production' ? "error" : "off"
```

---

### Node.js

**File**: `.codeforgerc.nodejs.json`

**Best for**: Node.js backend services, APIs, CLI tools, serverless functions.

**Key Features**:

- Analyzes both `.ts` and `.js` files
- Allows `console.warn`, `console.error`, and `console.info` for logging
- Higher parameter limits (max 5) to accommodate controller/service functions
- Detects `delete` operator usage (can cause performance issues)
- Prefers template literals over string concatenation

**Rules Configuration**:

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

**Setup Command**:

```bash
cp examples/.codeforgerc.nodejs.json .codeforgerc.json
```

**Best Practices**:

- Use structured logging (winston, pino) instead of console in production
- Be cautious with `delete` operator - it can impact V8 optimization
- Template literals are preferred for readability and performance
- Consider increasing parameter limits only if truly necessary

---

### Vue.js

**File**: `.codeforgerc.vue.json`

**Best for**: Vue 2/3 applications with TypeScript, Vite Vue projects.

**Key Features**:

- Analyzes `.ts`, `.vue`, and `.js` files
- Warns on `any` type usage (Vue composition API benefits from typing)
- Allows `console.warn` and `console.error` for debugging
- Moderate parameter limits (max 4)
- Detects `delete` operator usage

**Rules Configuration**:

```json
{
  "files": ["src/**/*.ts", "src/**/*.vue", "src/**/*.js"],
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
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 4 }],
    "max-depth": ["warning", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "prefer-readonly": "warning",
    "no-useless-comparison": "error",
    "no-delete": "warning"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.vue.json .codeforgerc.json
```

**Best Practices**:

- Use TypeScript with Vue composition API for better type safety
- Gradually increase `no-any` from warning to error as you type your code
- Use reactive state patterns that work well with readonly properties
- Consider Vue-specific linting tools (ESLint with Vue plugin) alongside CodeForge

---

### Svelte

**File**: `.codeforgerc.svelte.json`

**Best for**: Svelte and SvelteKit applications with TypeScript.

**Key Features**:

- Analyzes `.ts`, `.svelte`, and `.js` files
- Ignores `.svelte-kit` directory (build output)
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Detects useless comparisons

**Rules Configuration**:

```json
{
  "files": ["src/**/*.ts", "src/**/*.svelte", "src/**/*.js"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".svelte-kit",
    "**/*.test.ts",
    "**/*.test.js",
    "**/*.spec.ts",
    "**/*.spec.js"
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
    "no-useless-comparison": "error"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.svelte.json .codeforgerc.json
```

**Best Practices**:

- Use TypeScript in Svelte stores and components for type safety
- The `.svelte-kit` directory is auto-generated and should always be ignored
- Svelte's reactivity system works well with readonly patterns
- Combine with Svelte-specific tools (svelte-check) for complete coverage

---

### Angular

**File**: `.codeforgerc.angular.json`

**Best for**: Angular applications and libraries.

**Key Features**:

- Analyzes `.ts` and `.html` files (Angular templates)
- Ignores test files (`*.spec.ts`, `*.e2e.ts`) and environment configs
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Detects useless comparisons and delete operator
- Prefers template literals

**Rules Configuration**:

```json
{
  "files": ["src/**/*.ts", "src/**/*.html"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/*.e2e.ts",
    "**/environment*.ts"
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
    "no-delete": "warning",
    "prefer-template": "warning"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.angular.json .codeforgerc.json
```

**Best Practices**:

- Angular CLI has its own linting - use CodeForge for additional quality checks
- Environment files are excluded as they often contain config objects
- Dependency injection patterns can result in higher parameter counts
- Angular's strict mode pairs well with increasing `no-any` to error level

---

### Next.js

**File**: `.codeforgerc.nextjs.json`

**Best for**: Next.js applications (Pages Router, App Router, or hybrid setups).

**Key Features**:

- Analyzes `.ts`, `.tsx`, `.js`, `.jsx` files
- Covers multiple directories: `src/`, `app/`, `pages/`
- Ignores `.next` build directory and `out` static export
- Warns on `any` type usage
- Moderate parameter limits (max 3 for page components)
- Detects useless comparisons and delete operator

**Rules Configuration**:

```json
{
  "files": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.js",
    "src/**/*.jsx",
    "app/**/*.ts",
    "app/**/*.tsx",
    "pages/**/*.ts",
    "pages/**/*.tsx"
  ],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    ".next",
    "out",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.test.js",
    "**/*.spec.js"
  ],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 3 }],
    "max-depth": ["warning", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "prefer-readonly": "warning",
    "no-useless-comparison": "error",
    "no-delete": "warning"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.nextjs.json .codeforgerc.json
```

**Best Practices**:

- Works with both App Router and Pages Router
- Server components can have more complex signatures - adjust parameter limits as needed
- Next.js has built-in TypeScript checking - CodeForge adds additional static analysis
- Use with Next.js ESLint config for comprehensive coverage

**Customization for API Routes**:

```json
// Increase parameter limits for API route handlers
"max-params": ["warning", { "max": 4 }]
```

---

### GraphQL

**File**: `.codeforgerc.graphql.json`

**Best for**: GraphQL API servers, Apollo/TypeGraphQL projects, resolvers.

**Key Features**:

- Analyzes `.ts` and `.js` files
- Ignores `__generated__` directories (auto-generated GraphQL code)
- Warns on `any` type usage (GraphQL benefits from strong typing)
- Moderate parameter limits (max 4)
- Detects useless comparisons and delete operator

**Rules Configuration**:

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
    "**/*.spec.js",
    "**/*.e2e.ts",
    "**/__generated__/**"
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
    "no-delete": "warning",
    "prefer-template": "warning"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.graphql.json .codeforgerc.json
```

**Best Practices**:

- Use code generation tools (graphql-code-generator) with TypeScript
- Generated code in `__generated__` directories is correctly ignored
- Resolver functions often have moderate parameter counts
- GraphQL schema typing complements CodeForge's static analysis

**Important**:

Always ensure `__generated__` directories are ignored. Generated code may trigger false positives that you cannot fix directly.

---

### REST API

**File**: `.codeforgerc.rest-api.json`

**Best for**: REST API projects using Express, Fastify, Koa, or other frameworks.

**Key Features**:

- Analyzes `.ts` and `.js` files
- Allows `console.warn`, `console.error`, and `console.info` for API logging
- Higher parameter limits (max 5) for controller/service functions
- Detects delete operator usage
- Prefers template literals for better string handling

**Rules Configuration**:

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
    "**/*.spec.js",
    "**/*.e2e.ts"
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
    "no-delete": "warning",
    "prefer-readonly": "warning"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.rest-api.json .codeforgerc.json
```

**Best Practices**:

- Use structured logging (morgan, winston, pino) in production
- Controller functions often require req, res, next parameters - adjust limits as needed
- Template literals improve readability for response messages
- Combine with API-specific tools (OpenAPI/Swagger validators)

---

### Express.js

**File**: `.codeforgerc.express.json`

**Best for**: Express.js specific backend applications and microservices.

**Key Features**:

- Analyzes `.ts`, `.tsx`, and `.js` files
- Ignores test and spec files
- Warns on `any` type usage
- Moderate parameter limits (max 3) to encourage smaller middleware/handlers
- Allows `console.warn` and `console.error` for logging
- Detects circular dependencies
- Prefers `const` and template literals

**Rules Configuration**:

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.test.js",
    "**/*.spec.js"
  ],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-circular-deps": "warning",
    "max-params": ["warning", { "max": 3 }],
    "max-depth": ["warning", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "prefer-readonly": "warning",
    "prefer-template": "warning"
  }
}
```

**Setup Command**:

```bash
cp examples/.codeforgerc.express.json .codeforgerc.json
```

**Best Practices**:

- Keep middleware and route handlers small and focused
- Express's `(req, res, next)` signature uses 3 parameters by default
- Use a logging library (morgan, winston) instead of console in production
- Circular dependency detection is important in Express applications with shared middleware

---

### Minimal

**File**: `.codeforgerc.minimal.json`

**Best for**: Projects wanting to gradually introduce CodeForge with light enforcement.

**Key Features**:

- Analyzes `.ts` and `.js` files
- Only warns on violations (no errors)
- Minimal rule set: unused vars, circular deps, useless comparisons
- Perfect for onboarding teams or legacy codebases

**Rules Configuration**:

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

**Setup Command**:

```bash
cp examples/.codeforgerc.minimal.json .codeforgerc.json
```

**Best Practices**:

- Start here if introducing CodeForge to an existing large codebase
- Gradually add more rules and increase severity over time
- Use this configuration to identify issues without blocking development
- Team can familiarize with CodeForge before enforcing stricter rules

**Migration Path**:

```json
// Start with minimal (all warnings)
// After 2-4 weeks, move to framework-specific config
{
  "rules": {
    "no-unused-vars": "error", // Promote to error
    "no-circular-deps": "error",
    "no-useless-comparison": "error",
    "no-any": "warning" // Add new rule
  }
}
```

---

### Strict

**File**: `.codeforgerc.strict.json`

**Best for**: Maximum code quality enforcement, critical systems, library maintainers.

**Key Features**:

- All rules set to `error` (no warnings)
- Stricter limits on complexity (max 3 params, max 3 depth)
- No `console` usage allowed (must use proper logging)
- Detects deprecated APIs and `eval` usage

**Rules Configuration**:

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

**Setup Command**:

```bash
cp examples/.codeforgerc.strict.json .codeforgerc.json
```

**Best Practices**:

- Use for critical systems where code quality is paramount
- Requires team discipline - violations will block CI
- Ensure all console usage is replaced with proper logging first
- Consider creating exceptions using inline comments if absolutely necessary
- Not recommended for legacy codebases or rapid prototyping

**When to Use**:

- Public libraries with many consumers
- Financial, healthcare, or security-critical applications
- Well-established codebases with high test coverage
- Projects with automated refactoring workflows

---

## Comparison Guide

### Framework Selection Matrix

| Scenario                      | Recommended Config | Reason                                           |
| ----------------------------- | ------------------ | ------------------------------------------------ |
| New TypeScript library        | `typescript`       | Type safety critical, clean slate                |
| React SPA with TypeScript     | `react`            | Optimized for components, allows console logging |
| Express.js API                | `express`          | Tailored for Express patterns, middleware        |
| Next.js App Router            | `nextjs`           | Handles App/Pages Router hybrid                  |
| GraphQL server                | `graphql`          | Ignores generated code, typing focus             |
| Vue.js project                | `vue`              | Supports SFC files, moderate strictness          |
| Large legacy codebase         | `minimal`          | Warnings only, gradual adoption                  |
| Critical production system    | `strict`           | Maximum quality, all errors                      |
| Learning/Prototyping          | `minimal`          | Low friction, educational                        |
| Microservice architecture     | `rest-api`         | Higher param limits, logging allowed             |
| Angular enterprise app        | `angular`          | Angular-specific patterns, ignores env files     |
| SvelteKit application         | `svelte`           | Ignores .svelte-kit, supports stores             |
| TypeScript + JavaScript mixed | `nodejs`           | Flexible file analysis                           |

### Strictness Levels

| Config                   | Strictness  | Error Count | Warning Count | Best For                |
| ------------------------ | ----------- | ----------- | ------------- | ----------------------- |
| Minimal                  | Low         | 0           | 3             | Onboarding, legacy code |
| Vue/Svelte/Angular       | Medium      | 1-2         | 5-7           | Production web apps     |
| React/Next.js            | Medium-High | 3-4         | 5-6           | React ecosystem         |
| TypeScript/Node.js       | Medium-High | 3-4         | 3-4           | TypeScript projects     |
| GraphQL/REST API/Express | Medium      | 2-3         | 5-7           | Backend services        |
| Strict                   | High        | 9+          | 0             | Critical systems        |

---

## Customization Guide

### Adjusting File Patterns

```json
{
  "files": [
    "src/**/*.ts", // Add more patterns
    "lib/**/*.ts",
    "tools/**/*.ts"
  ],
  "ignore": [
    "node_modules",
    "dist",
    "custom/**" // Add custom ignores
  ]
}
```

### Changing Rule Severity

```json
{
  "rules": {
    "no-any": "off", // Disable rule
    "no-any": "warning", // Warning (default for some)
    "no-any": "error" // Error (strict)
  }
}
```

### Configuring Rule Options

```json
{
  "rules": {
    "max-params": ["warning", { "max": 5 }],
    "max-depth": ["warning", { "max": 5 }],
    "no-console": ["warning", { "allow": ["warn", "error", "info"] }]
  }
}
```

### Adding Custom Rules

```json
{
  "rules": {
    "no-any": "error",
    "no-eval": "error", // Add new rule
    "no-deprecated-api": "warning" // Add new rule
  }
}
```

### Environment-Specific Configs

For Node.js projects, use a `.codeforgerc.js` file:

```javascript
module.exports = {
  files: ['src/**/*.ts'],
  ignore: ['node_modules', 'dist'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'max-params': ['warning', { max: process.env.NODE_ENV === 'test' ? 8 : 4 }],
  },
}
```

---

## Best Practices

### 1. Start Lenient, Increase Strictness Gradually

```json
// Week 1-2: Minimal config (warnings only)
// Week 3-4: Framework-specific config
// Week 5+: Strict config (if applicable)
```

### 2. Integrate with CI/CD

```yaml
# .github/workflows/codeforge.yml
name: CodeForge Analysis
on: [push, pull_request]
jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npx codeforge analyze --fail-on-warnings
```

### 3. Use Pre-Commit Hooks

```bash
codeforge precommit
```

This sets up a git pre-commit hook that runs CodeForge before each commit.

### 4. Regular Reviews

- Schedule quarterly reviews of your configuration
- Adjust rules based on team feedback
- Track violation trends over time
- Consider new rules as CodeForge adds features

### 5. Team Onboarding

- Document why each rule is enabled
- Provide examples of violations and fixes
- Use `codeforge explain RULE-ID` for rule documentation
- Create team-specific configuration guidelines

---

## Troubleshooting

### Common Issues

#### 1. "Too Many Violations in Existing Code"

**Solution**: Start with `minimal.json`, then gradually adopt your framework-specific config. Use `--fail-on-warnings=false` initially.

```bash
# Analyze without failing on warnings
codeforge analyze --fail-on-warnings=false

# Generate a report to prioritize fixes
codeforge analyze --format json --output violations.json
```

#### 2. False Positives on Generated Code

**Solution**: Ensure generated directories are in the `ignore` array.

```json
{
  "ignore": [
    "node_modules",
    "dist",
    "**/__generated__/**", // Add generated code directories
    ".next", // Next.js build
    ".svelte-kit" // SvelteKit build
  ]
}
```

#### 3. Rule Too Strict for Specific Patterns

**Solution**: Use inline comments to disable rules for specific lines (if your linter supports it) or adjust the rule options.

```typescript
// codeforge-disable-next-line no-console
console.log('Temporary debug')
```

#### 4. CI Pipeline Fails on Warnings

**Solution**: Remove `--fail-on-warnings` flag from CI script, or address the warnings.

```yaml
# Option 1: Don't fail on warnings
- run: npx codeforge analyze

# Option 2: Set a threshold
- run: npx codeforge analyze --max-warnings 10
```

#### 5. Configuration Not Found

**Solution**: Ensure `.codeforgerc.json` is in your project root.

```bash
# Check if config exists
ls -la .codeforgerc.json

# Or specify config path explicitly
codeforge analyze --config path/to/config.json
```

#### 6. Parameter Limits Too Restrictive

**Solution**: Increase limits for specific use cases.

```json
{
  "rules": {
    "max-params": ["warning", { "max": 6 }], // Increase from 3-4 to 6
    "max-depth": ["warning", { "max": 5 }] // Increase from 3-4 to 5
  }
}
```

#### 7. Cannot Run on Mixed TypeScript/JavaScript

**Solution**: Ensure your `files` array includes both extensions.

```json
{
  "files": [
    "src/**/*.ts",
    "src/**/*.js" // Add JS files
  ]
}
```

### Debugging Configuration Issues

#### Validate Your Configuration

```bash
codeforge config validate
```

#### Visualize Configuration

```bash
codeforge config visualize
```

#### Check Configuration Sources

```bash
codeforge config visualize --sources
```

#### Run in Verbose Mode

```bash
codeforge analyze --verbose
```

### Performance Issues

#### Slow Analysis on Large Codebases

**Solution**: Enable caching and adjust concurrency.

```bash
# Enable caching
codeforge analyze --cache-results

# Adjust concurrency (default is 4)
codeforge analyze --concurrency 8

# Use both together
codeforge analyze --cache-results --concurrency 8
```

#### Memory Issues

**Solution**: Reduce concurrency.

```bash
codeforge analyze --concurrency 2
```

---

## Advanced Usage

### Multi-Project Workspaces

For monorepos with multiple projects, use separate configs:

```bash
# Root directory
.codeforgerc.json

# Project A
packages/project-a/.codeforgerc.json

# Project B
packages/project-b/.codeforgerc.json
```

Run analysis from each project directory:

```bash
cd packages/project-a && codeforge analyze
cd packages/project-b && codeforge analyze
```

### Custom Rules Directory

Organize custom rules in a directory:

```json
{
  "rulesDirectory": "./codeforge-rules",
  "rules": {
    "custom-rule-1": "error",
    "custom-rule-2": "warning"
  }
}
```

### Integration with Other Tools

**ESLint Integration**:
Run both tools for comprehensive coverage:

```bash
# Run CodeForge
codeforge analyze

# Run ESLint
npx eslint src/
```

**TypeScript Integration**:
CodeForge complements `tsc`:

```bash
# Type checking
npx tsc --noEmit

# CodeForge analysis
codeforge analyze
```

---

## Related Documentation

- [Main README](../../README.md) - Project overview and quick start
- [Examples README](../../examples/README.md) - Basic examples overview
- [Rules Documentation](../rules/) - Detailed rule descriptions
- [Quick Start Guide](../../QUICKSTART.md) - Get started in 5 minutes
- [CI/CD Integration](../../README.md#ci-cd) - GitHub Actions and GitLab CI setup

---

## Getting Help

### Command-Line Help

```bash
# General help
codeforge --help

# Specific command help
codeforge analyze --help

# Explain a rule
codeforge explain no-any
codeforge why max-params
```

### Community

- [GitHub Issues](https://github.com/codeforge-dev/codeforge/issues) - Bug reports and feature requests
- [Discussions](https://github.com/codeforge-dev/codeforge/discussions) - Questions and community support

---

## Version Compatibility

- CodeForge version: 0.1.0+
- Node.js requirement: 20.0.0+
- npm requirement: 9.0.0+

Configuration format is stable, but new rules and options may be added in future versions. Review changelog when upgrading CodeForge.

---

## Contributing

Have ideas for new framework configurations or improvements to existing ones? Contributions are welcome!

- Open a discussion to propose new configurations
- Submit a pull request with your improvements
- Ensure configurations follow the patterns in this document

---

**Happy Code Forging!** 🛠️
