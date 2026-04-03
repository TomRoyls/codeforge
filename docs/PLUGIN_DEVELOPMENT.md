# CodeForge Plugin Development Guide

This comprehensive guide teaches you how to create, test, and publish plugins for CodeForge.

## Table of Contents

- [What Are CodeForge Plugins?](#what-are-codeforge-plugins)
- [Plugin Architecture](#plugin-architecture)
- [Creating Your First Plugin](#creating-your-first-plugin)
- [Plugin Manifest](#plugin-manifest)
- [Implementing Rules](#implementing-rules)
- [Plugin Lifecycle](#plugin-lifecycle)
- [Testing Plugins](#testing-plugins)
- [Publishing Plugins](#publishing-plugins)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## What Are CodeForge Plugins?

CodeForge plugins extend the core functionality by:

- **Adding custom rules** for domain-specific analysis
- **Integrating external tools** (linter adapters, formatters)
- **Providing new output formats** for reports
- **Adding new commands** to the CLI

### Plugin vs. Core

| Feature                   | Core | Plugin |
| ------------------------- | ---- | ------ |
| General-purpose rules     | ✅   | ❌     |
| Domain-specific rules     | ❌   | ✅     |
| Framework-specific checks | ❌   | ✅     |
| Custom output formats     | ❌   | ✅     |
| Third-party integrations  | ❌   | ✅     |

## Plugin Architecture

### Plugin Structure

```
codeforge-plugin-myplugin/
├── package.json
├── codeforge-plugin.json      # Plugin manifest
├── src/
│   ├── index.ts               # Entry point
│   ├── rules/                 # Custom rules
│   │   ├── my-rule.ts
│   │   └── another-rule.ts
│   ├── formatters/            # Custom formatters (optional)
│   │   └── my-formatter.ts
│   └── commands/              # Custom commands (optional)
│       └── my-command.ts
├── test/
│   ├── rules/
│   │   └── my-rule.test.ts
│   └── integration/
│       └── plugin.test.ts
└── README.md
```

### Plugin Discovery

CodeForge discovers plugins using:

1. **npm packages** with `codeforge-plugin` keyword
2. **Local directories** via configuration
3. **Monorepo packages** in workspace

### Plugin Loading Order

```
1. Core rules and commands
2. Local plugins (configured in .codeforgerc.json)
3. npm-installed plugins
4. Workspace plugins (monorepo)
```

## Creating Your First Plugin

### Step 1: Generate Plugin Scaffold

```bash
codeforge generate-plugin my-plugin --typescript
cd codeforge-plugin-my-plugin
```

This creates:

```
codeforge-plugin-my-plugin/
├── package.json
├── codeforge-plugin.json
├── src/
│   ├── index.ts
│   └── rules/
│       └── sample-rule.ts
├── test/
│   └── rules/
│       └── sample-rule.test.ts
├── tsconfig.json
└── README.md
```

### Step 2: Update package.json

```json
{
  "name": "codeforge-plugin-my-plugin",
  "version": "1.0.0",
  "keywords": ["codeforge", "codeforge-plugin"],
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "codeforge": "^0.1.0"
  },
  "devDependencies": {
    "codeforge": "^0.1.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Step 3: Create Plugin Manifest

`codeforge-plugin.json`:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A CodeForge plugin for my custom rules",
  "author": "Your Name",
  "license": "MIT",
  "main": "dist/index.js",
  "rules": {
    "my-rule": {
      "description": "Checks for something specific",
      "category": "patterns",
      "recommended": true,
      "fixable": false
    }
  },
  "commands": {},
  "formatters": {}
}
```

### Step 4: Implement Your First Rule

`src/rules/my-rule.ts`:

```typescript
import { Rule, RuleContext, RuleResult, ASTNode } from 'codeforge'

export default {
  meta: {
    name: 'my-rule',
    description: 'Checks for specific patterns in code',
    category: 'patterns',
    recommended: true,
    severity: 'warning',
    fixable: false,
    deprecated: false,
    docs: {
      url: 'https://github.com/your-org/codeforge-plugin-my-plugin#my-rule',
    },
  },

  defaultOptions: {
    allowOptional: false,
    maxCount: 3,
  },

  create(context: RuleContext) {
    const options = { ...this.defaultOptions, ...context.options }

    return {
      // Visit specific AST node types
      CallExpression(node: ASTNode) {
        if (shouldReport(node, options)) {
          context.report({
            node,
            message: 'This call expression violates my-rule',
            severity: 'warning',
            fix: null, // or provide autofix
          })
        }
      },

      // Visit function declarations
      FunctionDeclaration(node: ASTNode) {
        // Check function
      },

      // Visit import statements
      ImportDeclaration(node: ASTNode) {
        // Check imports
      },
    }
  },
}

function shouldReport(node: ASTNode, options: any): boolean {
  // Your rule logic here
  return false
}
```

### Step 5: Register Rules in Plugin Entry Point

`src/index.ts`:

```typescript
import myRule from './rules/my-rule'
import anotherRule from './rules/another-rule'

export default {
  name: 'my-plugin',
  version: '1.0.0',

  rules: {
    'my-rule': myRule,
    'another-rule': anotherRule,
  },

  // Optional: Custom commands
  commands: {
    // 'my-command': myCommand
  },

  // Optional: Custom formatters
  formatters: {
    // 'my-formatter': myFormatter
  },

  // Plugin lifecycle hooks
  onLoad(context) {
    console.log('Plugin loaded!')
  },

  onUnload() {
    console.log('Plugin unloaded!')
  },
}
```

### Step 6: Build and Test Locally

```bash
npm run build
npm test
```

### Step 7: Test in a Real Project

```bash
# Link the plugin locally
npm link

# In your test project
npm link codeforge-plugin-my-plugin

# Add to .codeforgerc.json
{
  "plugins": ["my-plugin"],
  "rules": {
    "my-plugin/my-rule": "warning"
  }
}

# Run CodeForge
codeforge analyze
```

## Plugin Manifest

The `codeforge-plugin.json` file describes your plugin:

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": "github:user/repo",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",

  "rules": {
    "rule-name": {
      "description": "What this rule checks",
      "category": "patterns|complexity|security|performance|dependencies",
      "recommended": true,
      "severity": "error|warning",
      "fixable": true,
      "deprecated": false,
      "replacedBy": ["new-rule-name"]
    }
  },

  "commands": {
    "command-name": {
      "description": "What this command does",
      "usage": "codeforge command-name [options]"
    }
  },

  "formatters": {
    "formatter-name": {
      "description": "Output format description"
    }
  },

  "peerDependencies": {
    "codeforge": "^0.1.0"
  }
}
```

## Implementing Rules

### Rule Structure

```typescript
interface Rule {
  meta: {
    name: string
    description: string
    category: 'complexity' | 'patterns' | 'security' | 'performance' | 'dependencies'
    recommended: boolean
    severity: 'error' | 'warning'
    fixable: boolean
    deprecated: boolean
    docs?: {
      url: string
      examples?: Array<{
        code: string
        description: string
      }>
    }
  }

  defaultOptions: Record<string, any>

  create(context: RuleContext): RuleVisitor
}
```

### Rule Context

```typescript
interface RuleContext {
  // File information
  filePath: string
  sourceCode: string
  ast: ASTNode

  // Configuration
  options: Record<string, any>
  severity: 'error' | 'warning'

  // Reporting
  report(violation: Violation): void

  // Utilities
  parser: ParserService
  scope: ScopeAnalyzer

  // Cached data
  cache: Map<string, any>
}
```

### Rule Visitor Pattern

```typescript
interface RuleVisitor {
  // Called for every node type
  [nodeType: string]: (node: ASTNode) => void

  // Special hooks
  onProgramEnter?(node: ASTNode): void
  onProgramExit?(node: ASTNode): void
}
```

### Example: Detect Console.log

```typescript
export default {
  meta: {
    name: 'no-console-log',
    description: 'Disallow console.log statements',
    category: 'patterns',
    recommended: true,
    severity: 'warning',
    fixable: true,
  },

  defaultOptions: {
    allow: ['warn', 'error'],
  },

  create(context) {
    const allow = context.options.allow || this.defaultOptions.allow

    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          !allow.includes(node.callee.property.name)
        ) {
          context.report({
            node,
            message: `Unexpected console.${node.callee.property.name}`,
            severity: 'warning',
            fix: (fixer) => fixer.remove(node),
          })
        }
      },
    }
  },
}
```

### Example: Enforce Function Naming

```typescript
export default {
  meta: {
    name: 'naming-convention',
    description: 'Enforce naming conventions',
    category: 'patterns',
    recommended: false,
    severity: 'warning',
    fixable: false,
  },

  defaultOptions: {
    functionPattern: '^[a-z][a-zA-Z0-9]*$',
    classPattern: '^[A-Z][a-zA-Z0-9]*$',
    constantPattern: '^[A-Z][A-Z0-9_]*$',
  },

  create(context) {
    const options = { ...this.defaultOptions, ...context.options }

    return {
      FunctionDeclaration(node) {
        if (node.id && !matchesPattern(node.id.name, options.functionPattern)) {
          context.report({
            node: node.id,
            message: `Function name "${node.id.name}" does not match pattern ${options.functionPattern}`,
          })
        }
      },

      ClassDeclaration(node) {
        if (node.id && !matchesPattern(node.id.name, options.classPattern)) {
          context.report({
            node: node.id,
            message: `Class name "${node.id.name}" does not match pattern ${options.classPattern}`,
          })
        }
      },
    }
  },
}

function matchesPattern(name: string, pattern: string): boolean {
  return new RegExp(pattern).test(name)
}
```

### Providing Auto-fixes

```typescript
context.report({
  node,
  message: 'Use const instead of let',
  fix: (fixer) => {
    // Replace 'let' with 'const'
    const letToken = sourceCode.getFirstToken(node)
    return fixer.replaceText(letToken, 'const')
  },
})
```

## Plugin Lifecycle

### Lifecycle Hooks

```typescript
export default {
  // Called when plugin is loaded
  onLoad(context: PluginContext) {
    // Initialize resources
    // Setup file watchers
    // Load external data
  },

  // Called when plugin is unloaded
  onUnload() {
    // Cleanup resources
    // Close connections
    // Clear caches
  },

  // Called before analysis starts
  onAnalysisStart(config: Config) {
    // Prepare for analysis
  },

  // Called after analysis completes
  onAnalysisEnd(results: AnalysisResult) {
    // Process results
    // Generate reports
  },

  // Called when configuration changes
  onConfigChange(newConfig: Config) {
    // Update internal state
  },
}
```

### Plugin Context

```typescript
interface PluginContext {
  // Plugin metadata
  name: string
  version: string
  path: string

  // CodeForge services
  logger: Logger
  cache: CacheService
  config: ConfigService

  // Utilities
  resolvePath(relativePath: string): string
  getPluginConfig(): Record<string, any>
}
```

## Testing Plugins

### Unit Testing Rules

`test/rules/my-rule.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { RuleTester } from 'codeforge/testing'
import myRule from '../../src/rules/my-rule'

const tester = new RuleTester()

describe('my-rule', () => {
  it('should report violations', () => {
    const results = tester.run(myRule, {
      code: `
        console.log('test');
      `,
      options: {},
    })

    expect(results).toHaveLength(1)
    expect(results[0].ruleId).toBe('my-rule')
    expect(results[0].message).toContain('console')
  })

  it('should not report valid code', () => {
    const results = tester.run(myRule, {
      code: `
        console.error('error');
      `,
      options: { allow: ['error'] },
    })

    expect(results).toHaveLength(0)
  })

  it('should apply auto-fix', () => {
    const result = tester.runFix(myRule, {
      code: 'let x = 5;',
      options: {},
    })

    expect(result.output).toBe('const x = 5;')
  })
})
```

### Integration Testing

`test/integration/plugin.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { CodeForge } from 'codeforge'
import myPlugin from '../../src'

describe('plugin integration', () => {
  it('should load plugin', async () => {
    const forge = new CodeForge({
      plugins: [myPlugin],
    })

    const loaded = await forge.loadPlugins()
    expect(loaded).toContain('my-plugin')
  })

  it('should run plugin rules', async () => {
    const forge = new CodeForge({
      plugins: [myPlugin],
      rules: {
        'my-plugin/my-rule': 'warning',
      },
    })

    const results = await forge.analyze('test/fixtures/sample.ts')
    expect(results.some((r) => r.ruleId === 'my-plugin/my-rule')).toBe(true)
  })
})
```

### Test Fixtures

```
test/
├── fixtures/
│   ├── valid.ts          # Valid code samples
│   ├── invalid.ts        # Invalid code samples
│   └── edge-cases.ts     # Edge case samples
└── rules/
    └── my-rule.test.ts
```

## Publishing Plugins

### Prerequisites

1. **npm account**: Create one at https://www.npmjs.com/
2. **Tested plugin**: All tests pass
3. **Documentation**: README with examples
4. **License**: Choose appropriate license

### Publishing Steps

```bash
# 1. Build the plugin
npm run build

# 2. Run tests
npm test

# 3. Update version
npm version patch|minor|major

# 4. Publish to npm
npm publish

# For scoped packages (@org/plugin-name)
npm publish --access public
```

### package.json Requirements

```json
{
  "name": "codeforge-plugin-your-name",
  "version": "1.0.0",
  "keywords": ["codeforge", "codeforge-plugin", "linter", "static-analysis"],
  "homepage": "https://github.com/your-org/your-plugin#readme",
  "bugs": {
    "url": "https://github.com/your-org/your-plugin/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-org/your-plugin.git"
  },
  "files": ["dist", "codeforge-plugin.json", "README.md"]
}
```

### README Template

```markdown
# codeforge-plugin-your-name

Brief description of what your plugin does.

## Installation

\`\`\`bash
npm install --save-dev codeforge-plugin-your-name
\`\`\`

## Usage

Add to your \`.codeforgerc.json\`:

\`\`\`json
{
"plugins": ["your-name"],
"rules": {
"your-name/rule-name": "warning"
}
}
\`\`\`

## Rules

### rule-name

Description of what this rule checks.

#### Options

- \`option1\`: Description (default: value)
- \`option2\`: Description (default: value)

#### Examples

\`\`\`ts
// ❌ Bad
console.log('test');

// ✅ Good
logger.info('test');
\`\`\`

## License

MIT
```

## Best Practices

### 1. Naming Conventions

```
Plugin package: codeforge-plugin-{name}
Rule names: {name}/{rule-name}
Commands: {name}:{command-name}
```

### 2. Performance

```typescript
// ✅ Good: Use caching
const cache = context.cache
let expensiveData = cache.get('expensive-data')
if (!expensiveData) {
  expensiveData = computeExpensiveData()
  cache.set('expensive-data', expensiveData)
}

// ❌ Bad: Recompute every time
const expensiveData = computeExpensiveData()
```

### 3. Error Handling

```typescript
// ✅ Good: Graceful error handling
try {
  const config = loadConfig()
} catch (error) {
  context.logger.warn('Failed to load config, using defaults')
  return defaultConfig
}

// ❌ Bad: Unhandled errors
const config = loadConfig() // May throw
```

### 4. Rule Design

```typescript
// ✅ Good: Specific, actionable messages
context.report({
  node,
  message: `Function "${name}" has ${params} parameters. Maximum allowed is ${max}.`,
})

// ❌ Bad: Vague messages
context.report({
  node,
  message: 'Too many parameters',
})
```

### 5. Configuration

```typescript
// ✅ Good: Sensible defaults + overrides
const options = {
  max: 3,
  allow: [],
  ...context.options,
}

// ❌ Bad: No defaults
const max = context.options.max // May be undefined
```

### 6. Testing

- Test all rule options
- Test edge cases
- Test auto-fixes
- Test integration with CodeForge
- Maintain >90% coverage

### 7. Documentation

- Clear rule descriptions
- Code examples (good and bad)
- Configuration options
- Migration guides (for breaking changes)

## API Reference

### Rule Interface

```typescript
interface Rule {
  meta: RuleMeta
  defaultOptions: Record<string, any>
  create(context: RuleContext): RuleVisitor
}

interface RuleMeta {
  name: string
  description: string
  category: RuleCategory
  recommended: boolean
  severity: Severity
  fixable: boolean
  deprecated: boolean
  docs?: {
    url: string
    examples?: Array<{
      code: string
      description: string
    }>
  }
}

type RuleCategory = 'complexity' | 'patterns' | 'security' | 'performance' | 'dependencies'
type Severity = 'error' | 'warning'
```

### RuleContext Interface

```typescript
interface RuleContext {
  filePath: string
  sourceCode: string
  ast: ASTNode
  options: Record<string, any>
  severity: Severity

  report(violation: Violation): void

  parser: ParserService
  scope: ScopeAnalyzer
  cache: Map<string, any>
}

interface Violation {
  node: ASTNode
  message: string
  severity?: Severity
  fix?: FixFunction | null
}

type FixFunction = (fixer: Fixer) => Fix | Fix[] | null
```

### Fixer API

```typescript
interface Fixer {
  insertTextAfter(node: ASTNode, text: string): Fix
  insertTextBefore(node: ASTNode, text: string): Fix
  remove(node: ASTNode): Fix
  removeRange(range: [number, number]): Fix
  replaceText(node: ASTNode, text: string): Fix
  replaceTextRange(range: [number, number], text: string): Fix
}
```

### Plugin Interface

```typescript
interface Plugin {
  name: string
  version: string

  rules: Record<string, Rule>
  commands?: Record<string, Command>
  formatters?: Record<string, Formatter>

  onLoad?(context: PluginContext): void | Promise<void>
  onUnload?(): void | Promise<void>
  onAnalysisStart?(config: Config): void | Promise<void>
  onAnalysisEnd?(results: AnalysisResult): void | Promise<void>
  onConfigChange?(newConfig: Config): void | Promise<void>
}
```

## Getting Help

- **Documentation**: https://codeforge.dev/docs/plugins
- **GitHub Issues**: https://github.com/codeforge-dev/codeforge/issues
- **Discord**: https://discord.gg/codeforge
- **Examples**: https://github.com/codeforge-dev/plugin-examples

Happy plugin development! 🚀
