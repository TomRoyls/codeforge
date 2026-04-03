# ESLint to CodeForge Migration Guide

Complete guide for teams migrating from ESLint to CodeForge. This document helps you understand the differences, plan your migration, and execute it smoothly.

## Table of Contents

- [Overview](#overview)
- [Quick Migration (5 minutes)](#quick-migration-5-minutes)
- [Rule Mapping Table](#rule-mapping-table)
- [Configuration Translation](#configuration-translation)
- [Migration Strategies](#migration-strategies)
- [Common Pitfalls](#common-pitfalls)
- [CI/CD Migration](#cicd-migration)
- [FAQ](#faq)

## Overview

### Why Migrate from ESLint?

ESLint has been the industry standard for JavaScript and TypeScript linting for years. However, CodeForge offers several advantages for modern development workflows:

**Performance Benefits:**

- **Faster Analysis**: Powered by SWC (Rust-based parser), CodeForge can be 5-10x faster than ESLint on large codebases
- **Parallel Processing**: Analyzes multiple files concurrently, significantly reducing total analysis time
- **Incremental Caching**: Supports result caching for unchanged files, speeding up repeated analyses

**Developer Experience:**

- **TypeScript Native**: Built from the ground up for TypeScript with ts-morph, providing deeper type-aware analysis
- **Beautiful Output**: Colorized, formatted output with clear visual hierarchy and actionable messages
- **Better Error Context**: More detailed violation messages with suggested fixes and explanations

**Modern Architecture:**

- **Plugin System**: Extensible architecture via Oclif for custom rules and formatters
- **Multiple Output Formats**: JSON, HTML, JUnit, SARIF, GitLab Code Quality, and more
- **Project Health Insights**: Built-in metrics like technical debt tracking, dependency analysis, and codebase statistics

### What CodeForge Offers vs ESLint

| Feature                 | ESLint                                         | CodeForge                                                |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| **Parser**              | Espree (JavaScript), @typescript-eslint/parser | SWC (Rust-based)                                         |
| **Performance**         | Moderate                                       | Fast (5-10x faster)                                      |
| **TypeScript Support**  | Plugin-based (typescript-eslint)               | Native                                                   |
| **Parallel Processing** | Limited                                        | Built-in concurrency support                             |
| **Output Formats**      | Console, JSON, JUnit                           | Console, JSON, HTML, JUnit, SARIF, GitLab, CSV, Markdown |
| **Configuration File**  | .eslintrc.json, .eslintrc.js, .eslintrc.yml    | .codeforgerc.json                                        |
| **Rule Severity**       | "off", "warn", "error"                         | "off", "warning", "error"                                |
| **Rule Options**        | Array syntax: `["error", { option: value }]`   | Array syntax: `["error", { option: value }]`             |
| **Exit Codes**          | 0 (success), 1 (errors)                        | 0 (success), 1 (errors), 2 (warnings treated as errors)  |
| **Caching**             | ESLint cache                                   | Built-in result caching                                  |
| **Pre-commit Hooks**    | Manual setup via lint-staged                   | Built-in `precommit` command                             |
| **CI/CD Generation**    | Manual                                         | Built-in `ci` command                                    |

### Migration Benefits

When you migrate to CodeForge, your team gains:

1. **Faster Feedback Loops**: Developers get results quicker, enabling faster iteration
2. **Better Type Safety**: Native TypeScript analysis catches more type-related issues
3. **Modern CI/CD Integration**: Easy setup with GitHub Actions and GitLab CI
4. **Project Health Insights**: Track technical debt, code complexity, and dependency issues
5. **Simplified Configuration**: Single configuration file format without plugin management complexity
6. **Better Developer Experience**: Clearer error messages, auto-fix suggestions, and beautiful output

## Quick Migration (5 minutes)

The fastest way to migrate from ESLint to CodeForge is using the built-in migration command.

### Step 1: Run the Migration Command

```bash
# Preview migration without creating files
codeforge migrate --from eslint --dry-run

# Perform actual migration
codeforge migrate --from eslint

# Migrate to a custom output file
codeforge migrate --from eslint --output .codeforgerc.json

# Force overwrite existing config
codeforge migrate --from eslint --force
```

### Step 2: Review the Generated Configuration

The migration command creates a `.codeforgerc.json` file in your project root:

```json
{
  "files": ["**/*.ts", "**/*.tsx"],
  "ignore": ["**/node_modules/**", "**/dist/**"],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["warning", { "max": 4 }],
    "no-circular-deps": "warning",
    "prefer-template": "warning"
  }
}
```

### Step 3: Test Your Configuration

```bash
# Analyze your codebase
codeforge analyze

# Analyze with verbose output
codeforge analyze --verbose

# Analyze only specific directories
codeforge analyze src/
```

### Step 4: Address Unmapped Rules

The migration command shows unmapped ESLint rules. Review these manually:

```bash
# See all available CodeForge rules
codeforge rules

# Explain a specific rule
codeforge explain no-any

# Suggest rules based on your codebase
codeforge suggest-rules
```

### Step 5: Update CI/CD

Replace ESLint commands in your CI/CD pipeline:

**Before (ESLint):**

```yaml
- run: npm run lint
```

**After (CodeForge):**

```yaml
- run: codeforge analyze --ci --fail-on-warnings
```

### Step 6: Uninstall ESLint (Optional)

Once you're confident in CodeForge, remove ESLint:

```bash
npm uninstall eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

That's it! You've migrated from ESLint to CodeForge in under 5 minutes.

## Rule Mapping Table

CodeForge provides equivalents for most common ESLint rules. This table maps popular ESLint rules to their CodeForge counterparts.

### TypeScript Rules

| ESLint Rule                                         | CodeForge Rule          | Notes                               |
| --------------------------------------------------- | ----------------------- | ----------------------------------- |
| `@typescript-eslint/no-any`                         | `no-any`                | Detects `any` type usage            |
| `@typescript-eslint/no-unused-vars`                 | `no-unused-vars`        | Detects unused variables            |
| `@typescript-eslint/explicit-function-return-type`  | Not available           | Use TypeScript compiler option      |
| `@typescript-eslint/explicit-module-boundary-types` | Not available           | Use TypeScript compiler option      |
| `@typescript-eslint/no-explicit-any`                | `no-any`                | Same as `@typescript-eslint/no-any` |
| `@typescript-eslint/prefer-const`                   | `prefer-const`          | Enforces `const` declarations       |
| `@typescript-eslint/no-console`                     | `no-console`            | Detects console usage               |
| `@typescript-eslint/no-var`                         | `prefer-const`          | Enforces `const` over `var`         |
| `@typescript-eslint/strict-boolean-expressions`     | `no-useless-comparison` | Detects useless comparisons         |
| `@typescript-eslint/prefer-nullish-coalescing`      | Not available           | Manual review recommended           |

### Code Quality Rules

| ESLint Rule       | CodeForge Rule        | Notes                                  |
| ----------------- | --------------------- | -------------------------------------- |
| `no-console`      | `no-console`          | Detects console usage                  |
| `no-debugger`     | Not available         | Debugger detection in development mode |
| `no-alert`        | Not available         | Use `no-console` alternative           |
| `no-eval`         | Not available         | Security rule - manual review          |
| `no-implied-eval` | Not available         | Security rule - manual review          |
| `no-new-func`     | Not available         | Security rule - manual review          |
| `prefer-const`    | `prefer-const`        | Enforces `const` declarations          |
| `no-var`          | `prefer-const`        | Enforces `const` over `var`            |
| `no-delete-var`   | `no-delete`           | Detects `delete` operator usage        |
| `no-undef`        | Covered by TypeScript | TypeScript compiler handles this       |
| `no-unused-vars`  | `no-unused-vars`      | Detects unused variables               |

### Best Practice Rules

| ESLint Rule              | CodeForge Rule    | Notes                      |
| ------------------------ | ----------------- | -------------------------- |
| `prefer-template`        | `prefer-template` | Enforces template literals |
| `prefer-arrow-callback`  | Not available     | Manual review recommended  |
| `prefer-destructuring`   | Not available     | Manual review recommended  |
| `prefer-spread`          | Not available     | Manual review recommended  |
| `prefer-rest-params`     | Not available     | Manual review recommended  |
| `no-useless-concat`      | `prefer-template` | Enforces template literals |
| `no-useless-return`      | Not available     | Manual review recommended  |
| `no-useless-constructor` | Not available     | Manual review recommended  |

### Complexity Rules

| ESLint Rule              | CodeForge Rule       | Notes                            |
| ------------------------ | -------------------- | -------------------------------- |
| `max-params`             | `max-params`         | Limits function parameters       |
| `max-depth`              | `max-depth`          | Limits nesting depth             |
| `max-len`                | Not available        | Use line-length formatting tools |
| `max-lines`              | `max-lines`          | Limits file line count           |
| `max-lines-per-function` | `max-lines-function` | Limits function line count       |
| `complexity`             | Not available        | Use cyclomatic complexity tools  |
| `max-nested-callbacks`   | Use `max-depth`      | Alternative approach             |
| `max-statements`         | Not available        | Use function length limits       |

### Potential Bugs Rules

| ESLint Rule             | CodeForge Rule          | Notes                            |
| ----------------------- | ----------------------- | -------------------------------- |
| `no-empty`              | `no-empty-function`     | Detects empty functions          |
| `no-extra-parens`       | Not available           | Manual review recommended        |
| `no-constant-condition` | `no-useless-comparison` | Detects useless comparisons      |
| `no-dupe-args`          | Covered by TypeScript   | TypeScript compiler handles this |
| `no-dupe-keys`          | Covered by TypeScript   | TypeScript compiler handles this |
| `no-duplicate-case`     | Not available           | Manual review recommended        |
| `no-ex-assign`          | Not available           | Manual review recommended        |

### ES6 Rules

| ESLint Rule                       | CodeForge Rule        | Notes                            |
| --------------------------------- | --------------------- | -------------------------------- |
| `no-arrow-function-return-assign` | Not available         | Manual review recommended        |
| `no-class-assign`                 | Covered by TypeScript | TypeScript compiler handles this |
| `no-const-assign`                 | Covered by TypeScript | TypeScript compiler handles this |
| `no-new-symbol`                   | Covered by TypeScript | TypeScript compiler handles this |
| `prefer-arrow-callback`           | Not available         | Manual review recommended        |
| `prefer-numeric-literals`         | Not available         | Manual review recommended        |
| `prefer-rest-params`              | Not available         | Manual review recommended        |
| `prefer-spread`                   | Not available         | Manual review recommended        |

### Stylistic Rules

| ESLint Rule             | CodeForge Rule | Notes        |
| ----------------------- | -------------- | ------------ |
| `comma-dangle`          | Not available  | Use Prettier |
| `semi`                  | Not available  | Use Prettier |
| `quotes`                | Not available  | Use Prettier |
| `indent`                | Not available  | Use Prettier |
| `object-curly-spacing`  | Not available  | Use Prettier |
| `array-bracket-spacing` | Not available  | Use Prettier |
| `key-spacing`           | Not available  | Use Prettier |
| `no-trailing-spaces`    | Not available  | Use Prettier |

### Dependency Rules

| ESLint Rule                         | CodeForge Rule              | Notes                         |
| ----------------------------------- | --------------------------- | ----------------------------- |
| `import/no-cycle`                   | `no-circular-deps`          | Detects circular dependencies |
| `import/no-unused-modules`          | Covered by `no-unused-vars` | Detects unused imports        |
| `import/order`                      | Not available               | Use import organization tools |
| `import/no-extraneous-dependencies` | Not available               | Manual review recommended     |

### React Rules

| ESLint Rule                   | CodeForge Rule | Notes                     |
| ----------------------------- | -------------- | ------------------------- |
| `react/prop-types`            | Not available  | Use TypeScript props      |
| `react/no-unescaped-entities` | Not available  | Manual review recommended |
| `react/jsx-key`               | Not available  | Manual review recommended |
| `react-hooks/rules-of-hooks`  | Not available  | Manual review recommended |
| `react-hooks/exhaustive-deps` | Not available  | Manual review recommended |

### Unmapped Rules

If an ESLint rule doesn't have a CodeForge equivalent:

1. **Check if it's covered by TypeScript**: Many type-related rules are handled by the TypeScript compiler
2. **Use Prettier for formatting**: Stylistic rules are better handled by Prettier
3. **Manual code review**: Some rules require human judgment
4. **Custom plugins**: CodeForge supports custom plugins for specialized rules

## Configuration Translation

### Understanding Configuration Differences

**ESLint Configuration:**

- Supports multiple file formats: `.eslintrc.json`, `.eslintrc.js`, `.eslintrc.yml`, `.eslintrc.yaml`
- Supports nested configuration files
- Uses `extends` for sharing configuration
- Complex plugin system with `plugins` and `rules` sections

**CodeForge Configuration:**

- Single file format: `.codeforgerc.json`
- Simple, flat configuration structure
- Uses `extends` for sharing configuration
- Built-in rules, no plugin management complexity

### Step-by-Step Translation

#### Step 1: Analyze Your ESLint Configuration

Start by examining your ESLint configuration:

```bash
# Find your ESLint config
ls -la | grep eslintrc

# Check what rules are enabled
cat .eslintrc.json
```

#### Step 2: Translate Basic Structure

**ESLint Configuration (.eslintrc.json):**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "plugins": ["@typescript-eslint"],
  "env": {
    "browser": true,
    "node": true
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

**CodeForge Configuration (.codeforgerc.json):**

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx"],
  "ignore": ["node_modules", "dist", "**/*.test.ts"],
  "rules": {
    "no-console": "warning",
    "no-unused-vars": "error"
  }
}
```

#### Step 3: Translate File Patterns

**ESLint:**

```json
{
  "overrides": [
    {
      "files": ["src/**/*.ts"],
      "rules": {
        "no-any": "error"
      }
    }
  ]
}
```

**CodeForge:**

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx", "libs/**/*.ts"],
  "ignore": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

#### Step 4: Translate Rule Severity

**ESLint uses:** `"off"`, `"warn"`, `"error"`

**CodeForge uses:** `"off"`, `"warning"`, `"error"`

| ESLint    | CodeForge   |
| --------- | ----------- |
| `"off"`   | `"off"`     |
| `"warn"`  | `"warning"` |
| `"error"` | `"error"`   |

#### Step 5: Translate Rule Options

**ESLint:**

```json
{
  "rules": {
    "max-params": ["error", { "max": 3 }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**CodeForge:**

```json
{
  "rules": {
    "max-params": ["error", { "max": 3 }],
    "no-console": ["warning", { "allow": ["warn", "error"] }]
  }
}
```

#### Step 6: Translate Environment Settings

**ESLint:**

```json
{
  "env": {
    "browser": true,
    "node": true,
    "es6": true
  }
}
```

**CodeForge:**
No equivalent needed. CodeForge detects environment automatically based on file patterns and project structure.

#### Step 7: Translate Extends

**ESLint:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ]
}
```

**CodeForge:**

```json
{
  "extends": ".codeforgerc.typescript.json",
  "files": ["src/**/*.ts"],
  "rules": {
    "no-any": "error"
  }
}
```

### Complete Translation Example

**ESLint Configuration (.eslintrc.json):**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": ["@typescript-eslint", "react-hooks"],
  "rules": {
    "no-console": "warn",
    "no-debugger": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "@typescript-eslint/no-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "max-params": ["warn", { "max": 4 }],
    "max-depth": ["warn", { "max": 3 }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**CodeForge Configuration (.codeforgerc.json):**

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
  "ignore": [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.e2e.ts"
  ],
  "rules": {
    "no-console": ["warning", { "allow": ["warn", "error"] }],
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-any": "warning",
    "max-params": ["warning", { "max": 4 }],
    "max-depth": ["warning", { "max": 3 }],
    "no-circular-deps": "warning"
  }
}
```

### Handling Special Cases

#### Multiple ESLint Configurations

If you have multiple ESLint configurations (e.g., one for frontend, one for backend), create separate CodeForge configurations:

```bash
# Frontend config
.codeforgerc.frontend.json

# Backend config
.codeforgerc.backend.json

# Use specific config
codeforge analyze --config .codeforgerc.frontend.json
```

#### ESLint Overrides

ESLint allows rule overrides for specific files:

**ESLint:**

```json
{
  "overrides": [
    {
      "files": ["*.test.ts"],
      "rules": {
        "no-console": "off"
      }
    }
  ]
}
```

**CodeForge:**
Use ignore patterns or separate configs:

```json
{
  "ignore": ["**/*.test.ts", "**/*.spec.ts"],
  "rules": {
    "no-console": "warning"
  }
}
```

#### ESLint Disable Comments

ESLint supports inline disable comments:

```typescript
// eslint-disable-next-line no-console
console.log('Debug message')
```

CodeForge doesn't support inline disable comments. Instead:

1. Configure rules appropriately in `.codeforgerc.json`
2. Use ignore patterns for specific files
3. Accept that some rules will always apply

## Migration Strategies

Choose the migration strategy that fits your team's size and timeline.

### Strategy 1: Big Bang Migration

**Best for:** Small teams (1-5 people), small codebases (< 10,000 lines), projects with tight deadlines

**Timeline:** 1-2 days

**Steps:**

1. **Preparation (2 hours)**
   - Run ESLint one last time and document all violations
   - Create a baseline of your current code quality
   - Communicate the migration to your team

2. **Migration (1 hour)**
   - Run `codeforge migrate --from eslint`
   - Review and adjust the generated configuration
   - Test the configuration on your codebase

3. **Adoption (1 day)**
   - Remove ESLint from your project
   - Update CI/CD pipelines
   - Update pre-commit hooks
   - Train your team on CodeForge

4. **Stabilization (1 day)**
   - Monitor code quality metrics
   - Adjust rules as needed
   - Address any issues that arise

**Pros:**

- Quick and simple
- No tool overlap
- Clean break from old system
- Immediate performance benefits

**Cons:**

- High risk of disruption
- Potential for many violations at once
- Team learning curve can be steep
- May break existing workflows

**Example Command:**

```bash
# Step 1: Run migration
codeforge migrate --from eslint

# Step 2: Test configuration
codeforge analyze --verbose

# Step 3: Fix critical issues
codeforge fix

# Step 4: Update CI
codeforge ci --platform github

# Step 5: Remove ESLint
npm uninstall eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Strategy 2: Gradual Migration

**Best for:** Medium teams (5-15 people), medium codebases (10,000-100,000 lines), projects with moderate timelines

**Timeline:** 2-4 weeks

**Steps:**

**Week 1: Parallel Operation**

1. Keep ESLint running as usual
2. Run CodeForge in parallel without blocking
3. Compare results and identify differences
4. Create a baseline CodeForge configuration

```bash
# Keep ESLint in CI
- run: npm run lint

# Add CodeForge as non-blocking step
- run: codeforge analyze --format json --output codeforge-report.json || true
```

**Week 2: Gradual Enforcement**

1. Start enforcing CodeForge on new code only
2. Keep ESLint for existing code
3. Use git pre-commit hooks to run both tools
4. Document any differences in behavior

```bash
# Pre-commit hook
#!/bin/sh
# Run ESLint on all files
npm run lint

# Run CodeForge on new files only
codeforge analyze --staged
```

**Week 3: Team Transition**

1. Train developers on CodeForge
2. Encourage adoption of CodeForge in local development
3. Gradually migrate teams to CodeForge-first workflow
4. Collect feedback and adjust configuration

**Week 4: Final Cutover**

1. Replace ESLint with CodeForge in CI/CD
2. Remove ESLint from dependencies
3. Update all documentation
4. Celebrate successful migration!

**Pros:**

- Lower risk of disruption
- Team has time to adapt
- Can fine-tune configuration
- Gradual learning curve

**Cons:**

- Longer timeline
- Running both tools temporarily
- Potential for confusion
- More complex migration

**Example Configuration:**

**Week 1 - Development Only:**

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules"],
  "rules": {
    "no-any": "warning",
    "prefer-const": "warning"
  }
}
```

**Week 2 - CI Integration (Non-blocking):**

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules"],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "warning",
    "prefer-const": "error"
  }
}
```

**Week 3 - New Code Enforcement:**

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules"],
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["warning", { "max": 5 }]
  }
}
```

**Week 4 - Full Migration:**

```json
{
  "files": ["src/**/*.ts"],
  "ignore": ["node_modules"],
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["error", { "max": 4 }],
    "no-circular-deps": "warning"
  }
}
```

### Strategy 3: Team-by-Team Migration

**Best for:** Large teams (15+ people), large codebases (> 100,000 lines), organizations with multiple teams

**Timeline:** 2-3 months

**Steps:**

**Month 1: Pilot Team**

1. Select a small, adventurous team as pilot
2. Perform big bang migration for pilot team
3. Document lessons learned
4. Refine migration process based on feedback

**Month 2: Early Adopters**

1. Migrate 2-3 additional teams
2. Share best practices across teams
3. Create internal documentation and training materials
4. Establish support channels for migration

**Month 3: Organization-Wide Rollout**

1. Migrate remaining teams
2. Provide hands-on support during migration
3. Remove ESLint from organization-wide templates
4. Celebrate successful migration!

**Pros:**

- Lowest risk
- Thorough testing and validation
- Buy-in from multiple teams
- Comprehensive documentation

**Cons:**

- Longest timeline
- Requires significant coordination
- Running multiple tools in parallel
- Higher complexity

**Implementation Example:**

**Pilot Team Configuration:**

```json
{
  "extends": ".codeforgerc.typescript.json",
  "files": ["teams/pilot/**/*.ts"],
  "rules": {
    "no-any": "error",
    "prefer-const": "error"
  }
}
```

**Early Adopter Configuration:**

```json
{
  "extends": ".codeforgerc.typescript.json",
  "files": ["teams/early-adopters/**/*.ts"],
  "rules": {
    "no-any": "error",
    "prefer-const": "error",
    "max-params": ["warning", { "max": 4 }]
  }
}
```

**Organization-Wide Configuration:**

```json
{
  "extends": ".codeforgerc.typescript.json",
  "files": ["**/*.ts", "**/*.tsx"],
  "ignore": ["node_modules", "dist", "build"],
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["error", { "max": 4 }],
    "no-circular-deps": "warning",
    "prefer-template": "warning"
  }
}
```

### Choosing the Right Strategy

Use this decision tree to choose your migration strategy:

```
START
  │
  ├─ Team size < 5 people?
  │   └─ YES → Big Bang Migration (1-2 days)
  │   └─ NO → Continue
  │
  ├─ Codebase < 10,000 lines?
  │   └─ YES → Big Bang Migration (1-2 days)
  │   └─ NO → Continue
  │
  ├─ Team size < 15 people?
  │   └─ YES → Gradual Migration (2-4 weeks)
  │   └─ NO → Team-by-Team Migration (2-3 months)
  │
  └─ Need to minimize disruption? → Gradual Migration
```

### Migration Checklist

Use this checklist to ensure a smooth migration:

**Pre-Migration:**

- [ ] Document current ESLint configuration
- [ ] Run ESLint and save baseline results
- [ ] Communicate migration plan to team
- [ ] Choose appropriate migration strategy
- [ ] Schedule migration window

**Migration:**

- [ ] Run `codeforge migrate --from eslint`
- [ ] Review generated configuration
- [ ] Test configuration on codebase
- [ ] Compare results with ESLint
- [ ] Adjust configuration as needed

**Post-Migration:**

- [ ] Update CI/CD pipelines
- [ ] Update pre-commit hooks
- [ ] Update development environment documentation
- [ ] Train team on CodeForge
- [ ] Monitor code quality metrics
- [ ] Remove ESLint dependencies (if appropriate)
- [ ] Update project README
- [ ] Document any custom configurations

## Common Pitfalls

When migrating from ESLint to CodeForge, teams often encounter these pitfalls. Learn from them to avoid common mistakes.

### Pitfall 1: Expecting 100% Rule Parity

**Problem:** Teams expect CodeForge to have exact equivalents for all ESLint rules.

**Reality:** Some ESLint rules don't have direct CodeForge equivalents. This is intentional and reflects different design philosophies.

**Solution:**

- Focus on the rules that matter most for your codebase
- Accept that some ESLint rules aren't available
- Use other tools (Prettier, TypeScript compiler) to cover gaps
- Consider custom plugins for specialized needs

**Example:**

**Don't do this:**

```bash
# Try to find equivalent for every ESLint rule
codeforge explain semicolon-spacing  # Rule doesn't exist
codeforge explain quote-type          # Rule doesn't exist
codeforge explain indent              # Rule doesn't exist
```

**Do this instead:**

```json
{
  "rules": {
    "no-any": "error",
    "prefer-const": "error",
    "no-unused-vars": "error"
  }
}
```

Then use Prettier for formatting:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2
}
```

### Pitfall 2: Ignoring Severity Differences

**Problem:** ESLint uses "warn" and "error", CodeForge uses "warning" and "error". Subtle differences can cause unexpected CI/CD failures.

**Reality:** CodeForge can treat warnings as errors with `--fail-on-warnings` flag, which ESLint doesn't have.

**Solution:**

- Understand the severity terminology difference
- Be explicit about when warnings should fail
- Document your CI/CD behavior

**Example:**

**ESLint CI/CD:**

```yaml
- name: Lint
  run: npm run lint
  # ESLint only fails on errors, not warnings
```

**CodeForge CI/CD (different behavior):**

```yaml
- name: Analyze
  run: codeforge analyze
  # Only fails on errors, same as ESLint

- name: Analyze (strict)
  run: codeforge analyze --fail-on-warnings
  # Fails on errors AND warnings, different from ESLint!
```

### Pitfall 3: Not Adjusting File Patterns

**Problem:** Teams copy ESLint file patterns without adjusting for CodeForge's different behavior.

**Reality:** CodeForge and ESLint handle file patterns differently. What worked for ESLint might not work for CodeForge.

**Solution:**

- Review your file patterns after migration
- Use CodeForge's `--verbose` flag to debug pattern issues
- Test patterns before committing

**Example:**

**ESLint configuration:**

```json
{
  "overrides": [
    {
      "files": ["src/**/*.ts"],
      "rules": {
        "no-console": "warn"
      }
    }
  ]
}
```

**Incorrect CodeForge migration:**

```json
{
  "files": ["src/**/*.ts"],
  "rules": {
    "no-console": "warning"
  }
}
```

**Correct CodeForge configuration:**

```json
{
  "files": ["src/**/*.ts", "src/**/*.tsx", "libs/**/*.ts"],
  "ignore": ["node_modules", "dist", "**/*.test.ts"],
  "rules": {
    "no-console": "warning"
  }
}
```

### Pitfall 4: Forgetting About Pre-commit Hooks

**Problem:** Teams migrate CI/CD but forget to update local pre-commit hooks.

**Reality:** Developers might accidentally push code that passes ESLint locally but fails CodeForge in CI.

**Solution:**

- Update pre-commit hooks immediately
- Use CodeForge's built-in `precommit` command
- Test hooks locally before pushing

**Example:**

**Before (ESLint with lint-staged):**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": "eslint --fix"
  }
}
```

**After (CodeForge):**

```bash
# Use CodeForge's built-in pre-commit setup
codeforge precommit

# Or manually update husky hook
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
codeforge analyze --staged --fail-on-warnings
```

### Pitfall 5: Overlooking Performance Differences

**Problem:** Teams don't account for CodeForge being significantly faster than ESLint.

**Reality:** CodeForge can complete in seconds what takes ESLint minutes, which affects how you integrate it into your workflow.

**Solution:**

- Consider running CodeForge more frequently
- Use watch mode for continuous feedback
- Update timeouts in CI/CD

**Example:**

**ESLint CI/CD (slow):**

```yaml
- name: Lint
  run: npm run lint
  timeout-minutes: 10
```

**CodeForge CI/CD (fast):**

```yaml
- name: Analyze
  run: codeforge analyze --ci --fail-on-warnings
  timeout-minutes: 2 # Much shorter timeout!
```

### Pitfall 6: Not Training the Team

**Problem:** Teams assume developers will figure out CodeForge on their own.

**Reality:** Developers need guidance to understand differences in output, commands, and configuration.

**Solution:**

- Hold a team training session
- Create internal documentation
- Share examples of common tasks
- Provide a cheat sheet

**Example Training Agenda:**

1. **Why CodeForge?** (10 minutes)
   - Performance benefits
   - TypeScript native support
   - Better developer experience

2. **Configuration** (10 minutes)
   - How `.codeforgerc.json` works
   - Rule severity and options
   - File patterns and ignore patterns

3. **Commands** (15 minutes)
   - `codeforge analyze`
   - `codeforge fix`
   - `codeforge rules`
   - `codeforge explain`

4. **Integration** (15 minutes)
   - Pre-commit hooks
   - CI/CD setup
   - Watch mode

5. **Q&A** (30 minutes)

### Pitfall 7: Removing ESLint Too Soon

**Problem:** Teams uninstall ESLint before fully validating CodeForge configuration.

**Reality:** You might discover issues with CodeForge after ESLint is gone, causing disruptions.

**Solution:**

- Keep ESLint available for at least one sprint
- Run both tools in parallel for comparison
- Only remove ESLint after you're confident

**Example:**

**Week 1: Run both tools**

```bash
# CI/CD
- run: npm run lint                    # ESLint (blocking)
- run: codeforge analyze || true        # CodeForge (non-blocking)
```

**Week 2: Compare results**

```bash
# CI/CD
- run: npm run lint                    # ESLint (blocking)
- run: codeforge analyze              # CodeForge (non-blocking)
- run: diff eslint-results.json codeforge-results.json
```

**Week 3: Switch**

```bash
# CI/CD
- run: codeforge analyze              # CodeForge (blocking)
```

**Week 4: Cleanup**

```bash
npm uninstall eslint
```

### Pitfall 8: Ignoring Exit Code Differences

**Problem:** Teams don't understand that CodeForge has different exit codes than ESLint.

**Reality:** CodeForge uses exit code 2 for warnings treated as errors, which ESLint doesn't have.

**Solution:**

- Understand CodeForge's exit codes
- Update CI/CD scripts accordingly
- Document exit code behavior

**CodeForge Exit Codes:**

- `0`: Success - No errors found
- `1`: Errors found - Analysis detected error-level violations
- `2`: Warnings treated as errors (when using `--fail-on-warnings`)

**Example:**

**CI/CD script that handles exit codes:**

```yaml
- name: Analyze
  id: codeforge
  run: |
    codeforge analyze --ci --fail-on-warnings
    exit_code=$?

    if [ $exit_code -eq 0 ]; then
      echo "✓ No violations found"
    elif [ $exit_code -eq 1 ]; then
      echo "✗ Errors found"
      exit 1
    elif [ $exit_code -eq 2 ]; then
      echo "✗ Warnings treated as errors"
      exit 1
    fi
```

### Pitfall 9: Not Leveraging CodeForge Features

**Problem:** Teams treat CodeForge as a drop-in replacement without exploring its unique features.

**Reality:** CodeForge has powerful features that ESLint doesn't have, like health scoring and dependency analysis.

**Solution:**

- Explore CodeForge's full command set
- Use features like `codeforge health`, `codeforge debt`, `codeforge dependencies`
- Integrate these features into your workflow

**Example:**

**Don't just do this:**

```bash
codeforge analyze
```

**Also do this:**

```bash
# Check project health
codeforge health

# Track technical debt
codeforge debt --history

# Analyze dependencies
codeforge dependencies --circular

# Check codebase statistics
codeforge stats
```

### Pitfall 10: Inconsistent Configuration Across Teams

**Problem:** Different teams create different CodeForge configurations, leading to inconsistent code quality standards.

**Reality:** Without organization-wide standards, each team might have different rule severity and options.

**Solution:**

- Create a shared configuration template
- Use `extends` for team-specific customizations
- Document approved configurations
- Periodically audit configurations

**Example:**

**Shared base configuration (`.codeforgerc.base.json`):**

```json
{
  "files": ["**/*.ts", "**/*.tsx"],
  "ignore": ["node_modules", "dist"],
  "rules": {
    "no-any": "warning",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

**Team-specific configuration (`.codeforgerc.json`):**

```json
{
  "extends": ".codeforgerc.base.json",
  "files": ["teams/platform/**/*.ts"],
  "rules": {
    "no-any": "error",
    "max-params": ["warning", { "max": 3 }]
  }
}
```

## CI/CD Migration

Migrating your CI/CD pipelines is a critical step in the migration process. This section provides examples for common CI/CD platforms.

### GitHub Actions

#### Basic GitHub Actions Workflow

**Before (ESLint):**

```yaml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint
```

**After (CodeForge):**

```yaml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install CodeForge
        run: npm install -g codeforge

      - name: Run CodeForge
        run: codeforge analyze --ci --fail-on-warnings

      - name: Upload CodeForge Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: codeforge-report
          path: codeforge-report.json
```

#### GitHub Actions with SARIF Output

CodeForge can output SARIF format for GitHub Code Scanning integration:

```yaml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install CodeForge
        run: npm install -g codeforge

      - name: Generate SARIF Report
        run: codeforge analyze --format sarif --output results.sarif

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif
```

#### GitHub Actions with Caching

CodeForge supports result caching for faster CI/CD runs:

```yaml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install CodeForge
        run: npm install -g codeforge

      - name: Cache CodeForge Results
        uses: actions/cache@v4
        with:
          path: ~/.codeforge
          key: ${{ runner.os }}-codeforge-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-codeforge-

      - name: Run CodeForge with Caching
        run: codeforge analyze --ci --fail-on-warnings --cache-results
```

### GitLab CI

#### Basic GitLab CI Pipeline

**Before (ESLint):**

```yaml
stages:
  - quality

code_quality:
  stage: quality
  image: node:20
  script:
    - npm ci
    - npm run lint
  artifacts:
    reports:
      eslint: eslint-report.json
  only:
    - main
    - merge_requests
```

**After (CodeForge):**

```yaml
stages:
  - quality

code_quality:
  stage: quality
  image: node:20
  script:
    - npm ci
    - npm install -g codeforge
    - codeforge analyze --format gitlab --output gl-code-quality.json
  artifacts:
    reports:
      codequality: gl-code-quality.json
    paths:
      - gl-code-quality.json
    expire_in: 1 week
  only:
    - main
    - merge_requests
```

#### GitLab CI with Caching

```yaml
stages:
  - quality

code_quality:
  stage: quality
  image: node:20
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - ~/.codeforge/
  script:
    - npm ci
    - npm install -g codeforge
    - codeforge analyze --format gitlab --output gl-code-quality.json --cache-results
  artifacts:
    reports:
      codequality: gl-code-quality.json
    paths:
      - gl-code-quality.json
    expire_in: 1 week
  only:
    - main
    - merge_requests
```

#### GitLab CI with Merge Request Comments

```yaml
stages:
  - quality

code_quality:
  stage: quality
  image: node:20
  script:
    - npm ci
    - npm install -g codeforge
    - codeforge analyze --format json --output codeforge-report.json
  artifacts:
    paths:
      - codeforge-report.json
    expire_in: 1 week
  only:
    - merge_requests
  after_script:
    - |
      if [ -n "$CI_MERGE_REQUEST_IID" ]; then
        # Post summary as comment on merge request
        VULNS=$(jq '[.issues[] | select(.severity == "error")] | length' codeforge-report.json)
        WARNINGS=$(jq '[.issues[] | select(.severity == "warning")] | length' codeforge-report.json)
        COMMENT="## CodeForge Analysis\n\n"
        COMMENT+="🔴 Errors: $VULNS\n"
        COMMENT+="🟡 Warnings: $WARNINGS\n\n"
        COMMENT+="See the [full report](codeforge-report.json) for details.\n"
        curl -X POST \
          -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
          -H "Content-Type: application/json" \
          "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes?body=$(echo -e $COMMENT | jq -sRr @)"
      fi
```

### Jenkins

#### Jenkins Pipeline

**Before (ESLint):**

```groovy
pipeline {
  agent any

  stages {
    stage('Lint') {
      steps {
        sh 'npm ci'
        sh 'npm run lint'
      }
    }
  }
}
```

**After (CodeForge):**

```groovy
pipeline {
  agent any

  stages {
    stage('Analyze') {
      steps {
        sh 'npm ci'
        sh 'npm install -g codeforge'
        sh 'codeforge analyze --ci --fail-on-warnings'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'codeforge-report.json', fingerprint: true
    }
  }
}
```

#### Jenkins with JUnit Reports

```groovy
pipeline {
  agent any

  stages {
    stage('Analyze') {
      steps {
        sh 'npm ci'
        sh 'npm install -g codeforge'
        sh 'codeforge analyze --format junit --output junit.xml'
      }
    }
  }

  post {
    always {
      junit 'junit.xml'
    }
  }
}
```

### CircleCI

#### CircleCI Configuration

**Before (ESLint):**

```yaml
version: 2.1

jobs:
  lint:
    docker:
      - image: cimg/node:20.11
    steps:
      - checkout
      - run: npm ci
      - run: npm run lint

workflows:
  test-workflow:
    jobs:
      - lint
```

**After (CodeForge):**

```yaml
version: 2.1

jobs:
  analyze:
    docker:
      - image: cimg/node:20.11
    steps:
      - checkout
      - run: npm ci
      - run: npm install -g codeforge
      - run: codeforge analyze --ci --fail-on-warnings
      - store_artifacts:
          path: codeforge-report.json

workflows:
  test-workflow:
    jobs:
      - analyze
```

### Using CodeForge's Built-in CI Generator

CodeForge can generate CI/CD configuration files for you:

```bash
# Generate for all platforms
codeforge ci

# Generate for GitHub Actions only
codeforge ci --platform github

# Generate for GitLab CI only
codeforge ci --platform gitlab

# Generate in custom directory
codeforge ci --output .github/workflows
```

This creates ready-to-use CI/CD configuration files that you can customize as needed.

### Best Practices for CI/CD Migration

1. **Use CI Mode**: Always use `--ci` flag in CI/CD for machine-readable output
2. **Fail Fast**: Use `--fail-on-warnings` to enforce strict standards
3. **Cache Results**: Enable `--cache-results` for faster subsequent runs
4. **Output Reports**: Generate reports (JSON, SARIF, JUnit) for historical tracking
5. **Parallel Processing**: Use `--concurrency` to optimize performance
6. **Artifact Storage**: Store reports as artifacts for debugging and analysis
7. **Gradual Rollout**: Start with non-blocking steps, then make blocking

**Example complete CI/CD workflow:**

```yaml
name: Code Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install CodeForge
        run: npm install -g codeforge

      - name: Cache CodeForge Results
        uses: actions/cache@v4
        with:
          path: ~/.codeforge
          key: ${{ runner.os }}-codeforge-${{ hashFiles('**/*.ts', '**/*.tsx') }}
          restore-keys: |
            ${{ runner.os }}-codeforge-

      - name: Run CodeForge Analysis
        run: |
          codeforge analyze \
            --ci \
            --fail-on-warnings \
            --cache-results \
            --concurrency 8 \
            --format sarif \
            --output results.sarif \
            --format json \
            --output report.json

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: results.sarif

      - name: Upload CodeForge Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: codeforge-report
          path: report.json
```

## FAQ

Common questions from teams migrating from ESLint to CodeForge.

### General Questions

**Q: Why should I migrate from ESLint to CodeForge?**

A: CodeForge offers several advantages:

1. **Performance**: 5-10x faster analysis thanks to SWC (Rust-based parser)
2. **TypeScript Native**: Built-in TypeScript support without plugin complexity
3. **Better Developer Experience**: Clearer error messages, auto-fix suggestions, beautiful output
4. **Modern Features**: Technical debt tracking, dependency analysis, project health scoring
5. **Simpler Configuration**: Single config file without plugin management overhead

**Q: Is CodeForge a drop-in replacement for ESLint?**

A: No, not completely. While CodeForge covers most common ESLint rules, it has a different philosophy and feature set. Some ESLint rules don't have direct equivalents, and some CodeForge features don't exist in ESLint. Think of it as a modern alternative rather than a 1:1 replacement.

**Q: Will I lose any functionality when migrating?**

A: You might lose some specific rule functionality, but you'll gain new capabilities:

**What you might lose:**

- Some specialized ESLint rules without direct equivalents
- Inline disable comments (e.g., `// eslint-disable-next-line`)
- Complex plugin ecosystem

**What you'll gain:**

- Faster performance
- Better TypeScript analysis
- Technical debt tracking
- Dependency analysis
- Project health scoring
- More output formats (SARIF, GitLab Code Quality, etc.)

**Q: Can I run ESLint and CodeForge in parallel?**

A: Yes, absolutely. This is actually a recommended migration strategy. You can run both tools in parallel during a transition period to compare results and build confidence in CodeForge.

```yaml
# Example CI/CD running both tools
- name: Run ESLint
  run: npm run lint

- name: Run CodeForge
  run: codeforge analyze --format json --output codeforge-report.json || true
```

### Configuration Questions

**Q: How do I translate my ESLint configuration to CodeForge?**

A: You have two options:

1. **Automatic Migration** (recommended):

   ```bash
   codeforge migrate --from eslint
   ```

2. **Manual Translation**: Use the rule mapping table in this guide and translate your configuration manually.

**Q: What happens to my ESLint plugins?**

A: CodeForge doesn't use plugins in the same way as ESLint. Most ESLint plugins have built-in equivalents in CodeForge or are covered by TypeScript's compiler. For specialized rules, you might need to:

1. Accept that the rule won't be enforced
2. Use a different tool (e.g., Prettier for formatting)
3. Create a custom CodeForge plugin

**Q: Can I use multiple configuration files like ESLint overrides?**

A: Yes, but differently than ESLint. Instead of overrides, CodeForge supports:

1. **Extends**: Share configuration between files

   ```json
   {
     "extends": ".codeforgerc.base.json",
     "files": ["src/**/*.ts"]
   }
   ```

2. **Multiple configs**: Use different configs for different directories

   ```bash
   codeforge analyze --config .codeforgerc.frontend.json
   ```

3. **Ignore patterns**: Exclude specific files
   ```json
   {
     "ignore": ["**/*.test.ts", "**/*.spec.ts"]
   }
   ```

**Q: How do I handle rule severity differences?**

A: ESLint uses `"off"`, `"warn"`, `"error"`. CodeForge uses `"off"`, `"warning"`, `"error"`. The terminology is slightly different but the concept is the same:

| ESLint    | CodeForge   |
| --------- | ----------- |
| `"off"`   | `"off"`     |
| `"warn"`  | `"warning"` |
| `"error"` | `"error"`   |

**Q: Does CodeForge support inline disable comments like ESLint?**

A: No, CodeForge doesn't support inline disable comments. Instead:

1. Configure rules appropriately in `.codeforgerc.json`
2. Use ignore patterns for specific files
3. Accept that some rules will always apply

This design encourages better configuration rather than code-level workarounds.

### Migration Questions

**Q: How long does migration take?**

A: Migration time depends on your strategy:

- **Big Bang**: 1-2 days for small teams
- **Gradual**: 2-4 weeks for medium teams
- **Team-by-Team**: 2-3 months for large organizations

The actual configuration translation takes minutes. The time is mostly spent on testing, training, and CI/CD updates.

**Q: Should I remove ESLint immediately?**

A: Not immediately. We recommend:

1. **Week 1**: Run both tools in parallel (CodeForge non-blocking)
2. **Week 2**: Compare results and adjust configuration
3. **Week 3**: Switch to CodeForge as primary tool
4. **Week 4**: Remove ESLint (if confident)

**Q: What if CodeForge finds different issues than ESLint?**

A: This is expected and normal. Different linters have different rules and sensitivities. Handle this by:

1. **Reviewing the differences**: Understand why each tool flags what it does
2. **Adjusting configuration**: Tune rules to match your standards
3. **Documenting decisions**: Record why you chose to ignore or enable certain rules

**Q: Can I migrate gradually, rule by rule?**

A: Yes, absolutely. Start with a minimal configuration and add rules gradually:

**Week 1 - Minimal:**

```json
{
  "rules": {
    "no-unused-vars": "warning",
    "prefer-const": "warning"
  }
}
```

**Week 2 - Add complexity:**

```json
{
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["warning", { "max": 5 }]
  }
}
```

**Week 3 - Full strictness:**

```json
{
  "rules": {
    "no-any": "error",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "max-params": ["error", { "max": 4 }]
  }
}
```

### Performance Questions

**Q: How much faster is CodeForge than ESLint?**

A: CodeForge is typically 5-10x faster than ESLint on large codebases. Benchmarks show:

- **Small codebase** (< 1,000 files): 2-3x faster
- **Medium codebase** (1,000-10,000 files): 5-7x faster
- **Large codebase** (> 10,000 files): 8-10x faster

This is due to SWC's Rust-based parser and built-in parallel processing.

**Q: Does CodeForge support caching like ESLint?**

A: Yes, CodeForge supports result caching for unchanged files:

```bash
codeforge analyze --cache-results
```

CodeForge's caching is more sophisticated than ESLint's, tracking file hashes and incremental changes for maximum efficiency.

**Q: Can I adjust CodeForge's performance?**

A: Yes, CodeForge offers several performance options:

1. **Concurrency**: Control parallel file processing

   ```bash
   codeforge analyze --concurrency 8
   ```

2. **Caching**: Enable result caching

   ```bash
   codeforge analyze --cache-results
   ```

3. **File filtering**: Analyze only specific files
   ```bash
   codeforge analyze --files "src/**/*.ts"
   ```

**Q: Will CodeForge slow down my CI/CD?**

A: No, CodeForge will significantly speed up your CI/CD. Because it's faster, you can:

- Reduce timeouts
- Analyze more frequently
- Get faster feedback on pull requests

### Feature Questions

**Q: Does CodeForge have auto-fix like ESLint?**

A: Yes, CodeForge has auto-fix capabilities:

```bash
# Preview fixes without applying
codeforge fix --dry-run

# Apply fixes
codeforge fix

# Fix specific rules
codeforge fix --rules prefer-const,no-unused-vars
```

CodeForge also has an interactive fix mode for reviewing fixes:

```bash
codeforge interactive
```

**Q: Can CodeForge generate reports like ESLint?**

A: Yes, CodeForge supports multiple output formats:

```bash
# JSON report
codeforge analyze --format json --output report.json

# HTML report (with visualization)
codeforge report --format html --output report.html --open

# JUnit XML for CI/CD
codeforge analyze --format junit --output junit.xml

# SARIF for GitHub Code Scanning
codeforge analyze --format sarif --output results.sarif

# GitLab Code Quality
codeforge analyze --format gitlab --output gl-code-quality.json
```

**Q: Does CodeForge have technical debt tracking?**

A: Yes, CodeForge has built-in technical debt tracking:

```bash
# Show technical debt analysis
codeforge debt

# Show debt trend history
codeforge debt --history

# Save current debt snapshot
codeforge debt --save
```

This is a feature that ESLint doesn't have natively.

**Q: Can CodeForge analyze dependencies?**

A: Yes, CodeForge includes dependency analysis:

```bash
# Analyze dependencies
codeforge dependencies

# Show circular dependencies
codeforge dependencies --circular

# Display dependency tree
codeforge dependencies --tree

# Output as JSON
codeforge dependencies --format json --output deps.json
```

**Q: Does CodeForge have a watch mode like ESLint?**

A: Yes, CodeForge has a watch mode for continuous feedback:

```bash
# Watch all files
codeforge watch

# Watch specific directory
codeforge watch src/

# Custom debounce time
codeforge watch --debounce 500
```

### Integration Questions

**Q: How do I integrate CodeForge with VS Code?**

A: CodeForge doesn't have an official VS Code extension yet, but you can:

1. **Use watch mode**: Run `codeforge watch` in a terminal for continuous feedback
2. **Use pre-commit hooks**: Set up hooks to analyze on save
3. **Contribute**: The CodeForge community welcomes contributions for a VS Code extension

**Q: Can I use CodeForge with lint-staged?**

A: Yes, you can use CodeForge with lint-staged instead of ESLint:

**package.json:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": "codeforge fix --staged"
  }
}
```

**Q: How do I set up pre-commit hooks with CodeForge?**

A: Use CodeForge's built-in pre-commit command:

```bash
# Setup with git hooks
codeforge precommit

# Setup with husky
codeforge precommit --installer husky

# Custom command
codeforge precommit --command "codeforge analyze --staged --fail-on-warnings"
```

**Q: Can CodeForge work with Husky?**

A: Yes, CodeForge integrates with Husky:

```bash
# Setup Husky
npm install husky --save-dev
npx husky install

# Add CodeForge pre-commit hook
codeforge precommit --installer husky
```

This creates a pre-commit hook that runs CodeForge on staged files.

### Team Questions

**Q: How do I train my team on CodeForge?**

A: We recommend a structured training approach:

1. **Kickoff Meeting** (1 hour): Explain why we're migrating and benefits
2. **Hands-on Workshop** (2 hours): Walk through configuration, commands, and features
3. **Q&A Session** (1 hour): Address questions and concerns
4. **Documentation**: Provide cheat sheets and internal docs
5. **Support**: Designate CodeForge champions to help others

**Q: What if my team resists the migration?**

A: Resistance is normal. Address concerns by:

1. **Listening**: Understand specific concerns (performance, features, learning curve)
2. **Demonstrating**: Show performance improvements and better error messages
3. **Gradual Approach**: Start with parallel operation, then switch
4. **Benefits**: Highlight how CodeForge makes their job easier
5. **Support**: Provide training and help during transition

**Q: How do I handle different teams wanting different rules?**

A: CodeForge supports team-specific configurations:

1. **Shared Base**: Create a shared base configuration
2. **Team Overrides**: Use `extends` for team-specific customizations
3. **Documentation**: Document approved configurations
4. **Periodic Review**: Audit configurations for consistency

**Example:**

```json
// Shared base
{
  "files": ["**/*.ts"],
  "rules": {
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}

// Team-specific
{
  "extends": ".codeforgerc.base.json",
  "files": ["teams/frontend/**/*.ts"],
  "rules": {
    "no-any": "error"
  }
}
```

**Q: How do I measure migration success?**

A: Track these metrics:

1. **Performance**: Compare analysis times before and after
2. **Code Quality**: Monitor number of violations over time
3. **Team Adoption**: Survey developers on satisfaction
4. **CI/CD**: Measure pipeline duration improvements
5. **Bug Reduction**: Track if certain types of bugs decrease

### Troubleshooting Questions

**Q: What if CodeForge reports errors that ESLint didn't?**

A: This is normal and expected. Different linters have different rules:

1. **Review the new errors**: Understand why CodeForge flags them
2. **Adjust configuration**: If you disagree, disable or downgrade severity
3. **Document decisions**: Record why you chose to ignore certain issues
4. **Team discussion**: Decide as a team whether to address or ignore

**Q: What if CodeForge misses errors that ESLint caught?**

A: Also normal and expected. Address this by:

1. **Identify the missing rule**: Check if CodeForge has an equivalent
2. **Use rule mapping**: Consult the mapping table in this guide
3. **Accept gaps**: Some ESLint rules don't have CodeForge equivalents
4. **Run both tools**: Keep ESLint for specific rules if needed

**Q: How do I debug CodeForge configuration issues?**

A: Use CodeForge's diagnostic tools:

```bash
# Validate configuration
codeforge config validate

# Visualize configuration
codeforge config visualize

# Run diagnostics
codeforge doctor

# Verbose output
codeforge analyze --verbose
```

**Q: What if the migration command fails?**

A: Common issues and solutions:

1. **No ESLint config found**: Ensure you have `.eslintrc.json` or similar file
2. **JS config not supported**: Use JSON configs or migrate manually
3. **Parse error**: Validate your ESLint config syntax

**Example:**

```bash
# Preview migration to see what would happen
codeforge migrate --from eslint --dry-run

# Run diagnostics
codeforge doctor

# Validate ESLint config
cat .eslintrc.json | jq .
```

**Q: How do I get help with migration?**

A: Multiple support options:

1. **Documentation**: Check `docs/` directory for detailed guides
2. **Examples**: See `examples/` directory for configuration templates
3. **GitHub Issues**: Report bugs or ask questions
4. **GitHub Discussions**: Get help from the community
5. **CodeForge Explain**: Use `codeforge explain <rule>` for rule details

### Next Steps

After reading this FAQ, you should have a good understanding of:

- Why migrating to CodeForge makes sense
- How to approach the migration
- What to expect during the process
- How to handle common issues

Ready to start? Begin with the [Quick Migration](#quick-migration-5-minutes) section and migrate your first project today!

## Additional Resources

- **[CLI Usage Guide](CLI_USAGE.md)**: Complete command reference
- **[Architecture Guide](ARCHITECTURE.md)**: Architecture patterns and decisions
- **[Examples Directory](../examples/)**: Ready-to-use configurations
- **[GitHub Repository](https://github.com/codeforge-dev/codeforge)**: Source code and issues

---

**Last Updated:** 2025-01-03

**Version:** 1.0.0

**Contributors:** CodeForge Team
