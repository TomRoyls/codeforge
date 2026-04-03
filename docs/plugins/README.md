# CodeForge Plugin Development Guide

Welcome to the CodeForge Plugin Development Guide. This comprehensive guide will walk you through creating, testing, and publishing your own CodeForge plugins.

## Table of Contents

- [Getting Started](#getting-started)
- [Plugin Structure](#plugin-structure)
- [Creating a Rule](#creating-a-rule)
- [Testing Plugins](#testing-plugins)
- [Publishing Plugins](#publishing-plugins)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Before developing a CodeForge plugin, ensure you have:

- **Node.js 18.0.0 or higher** installed
- **npm 9.0.0 or higher** installed
- Basic knowledge of TypeScript
- Familiarity with AST (Abstract Syntax Tree) concepts

### Quick Start

The fastest way to create a new plugin is using the CodeForge CLI:

```bash
# Generate a new plugin scaffold
codeforge generate-plugin my-plugin

# Generate with TypeScript support
codeforge generate-plugin my-plugin --typescript

# Generate with a custom rule name
codeforge generate-plugin my-plugin --rule custom-rule

# Generate in a specific directory
codeforge generate-plugin my-plugin --output ./plugins
```

This creates a complete plugin structure with:

- `package.json` - Plugin metadata and dependencies
- `tsconfig.json` - TypeScript configuration
- `src/index.ts` - Main plugin entry point
- `src/rules/` - Directory for rule implementations
- `test/rules/` - Test files for your rules
- `README.md` - Plugin documentation

### Manual Setup

If you prefer setting up manually:

```bash
# Create directory structure
mkdir my-plugin
cd my-plugin
mkdir -p src/rules test/rules

# Initialize package.json
npm init -y

# Install CodeForge as a peer dependency
npm install --save-dev codeforge typescript vitest

# Create TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF
```

---

## Plugin Structure

### Anatomy of a Plugin

A CodeForge plugin is a package that exports a `PluginDefinition` object. Here's the typical structure:

```
my-plugin/
├── package.json          # Plugin metadata and dependencies
├── tsconfig.json        # TypeScript configuration
├── README.md            # Plugin documentation
├── .gitignore          # Git ignore patterns
├── src/
│   ├── index.ts         # Main plugin entry point
│   └── rules/
│       └── my-rule.ts   # Rule implementation
└── test/
    └── rules/
        └── my-rule.test.ts  # Rule tests
```

### package.json

Your `package.json` must follow this structure:

```json
{
  "name": "codeforge-plugin-my-plugin",
  "version": "1.0.0",
  "description": "My custom CodeForge plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["codeforge", "plugin", "linter"],
  "license": "MIT",
  "peerDependencies": {
    "codeforge": "*"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Key Requirements:**

- **Name**: Must start with `codeforge-plugin-` (e.g., `codeforge-plugin-eslint-style`)
- **Main entry**: Should point to compiled JavaScript in `dist/`
- **Types**: Should point to TypeScript declaration files
- **Peer dependencies**: Must include `codeforge` as a peer dependency

### Plugin Entry Point (src/index.ts)

The main plugin file exports a `PluginDefinition` object:

```typescript
import type { PluginDefinition } from 'codeforge'
import { myRule } from './rules/my-rule.js'

export const plugin: PluginDefinition = {
  name: 'codeforge-plugin-my-plugin',
  version: '1.0.0',
  description: 'My custom CodeForge plugin',
  rules: {
    'my-rule': myRule,
  },
}

export default plugin
```

### Plugin Definition Interface

```typescript
interface PluginDefinition {
  name: string // Plugin name (must match package.json name)
  version: string // Plugin version (semantic versioning)
  description?: string // Plugin description
  rules?: Record<string, RuleDefinition> // Rules provided by this plugin
  transforms?: Record<string, TransformDefinition> // Code transformations
  hooks?: PluginHooks // Lifecycle hooks
  dependencies?: string[] // Other plugins this depends on
  engines?: {
    codeforge?: string // Minimum CodeForge version
  }
}
```

---

## Creating a Rule

### Rule Definition Structure

A rule is defined using the `RuleDefinition` interface:

```typescript
interface RuleDefinition {
  meta: RuleMeta // Rule metadata
  create: (context: RuleContext) => RuleVisitor // Rule implementation
}
```

### Rule Meta

The `meta` object describes your rule:

```typescript
interface RuleMeta {
  type: 'problem' | 'suggestion' | 'layout' // Rule type
  severity: 'off' | 'warn' | 'error' // Default severity
  docs?: {
    description: string // What this rule does
    category?: string // Rule category
    recommended?: boolean // Is this recommended?
    url?: string // Documentation URL
  }
  fixable?: 'code' | 'whitespace' // Can it auto-fix?
  requiresTypeChecking?: boolean // Needs type info?
  schema?: RuleSchema // Options schema
  deprecated?: boolean // Is this deprecated?
  replacedBy?: readonly string[] // Replacement rules
}
```

### Example Rule: No Console Log

Here's a complete rule that prevents console.log statements:

```typescript
// src/rules/no-console-log.ts
import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'

export const noConsoleLog: RuleDefinition = {
  meta: {
    type: 'problem',
    severity: 'warn',
    docs: {
      description: 'Disallow console.log() statements',
      category: 'best-practices',
      recommended: true,
    },
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      // Visit CallExpression nodes
      CallExpression(node: unknown): void {
        // Access the AST node structure
        const callee = (node as any).callee

        // Check if it's console.log
        if (
          callee?.type === 'MemberExpression' &&
          callee.object?.name === 'console' &&
          callee.property?.name === 'log'
        ) {
          context.report({
            node,
            message: 'Unexpected console.log() statement',
            loc: {
              start: { line: node.loc.start.line, column: node.loc.start.column },
              end: { line: node.loc.end.line, column: node.loc.end.column },
            },
            fix: {
              range: [node.start, node.end],
              text: '', // Remove the console.log statement
            },
          })
        }
      },
    }
  },
}

export default noConsoleLog
```

### Example Rule: Max Function Length

A more complex rule checking function length:

```typescript
// src/rules/max-function-length.ts
import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'

export const maxFunctionLength: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Enforce a maximum function length',
      category: 'complexity',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: { type: 'number', default: 50 },
          ignoreComments: { type: 'boolean', default: true },
        },
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options =
      (context.config.options?.[0] as { max?: number; ignoreComments?: boolean }) || {}
    const maxLines = options.max ?? 50
    const ignoreComments = options.ignoreComments ?? true

    return {
      FunctionDeclaration(node: any): void {
        const startLine = node.loc.start.line
        const endLine = node.loc.end.line
        let lineCount = endLine - startLine + 1

        if (ignoreComments) {
          const comments = context.getComments()
          // Subtract comment lines from total
          lineCount -= comments.filter(
            (c: any) => c.loc.start.line >= startLine && c.loc.end.line <= endLine,
          ).length
        }

        if (lineCount > maxLines) {
          context.report({
            node,
            message: `Function '${node.id?.name || 'anonymous'}' is too long (${lineCount} lines). Maximum allowed is ${maxLines} lines.`,
            data: { lineCount, maxLines },
          })
        }
      },
    }
  },
}

export default maxFunctionLength
```

### Rule Context

The `RuleContext` provides utilities for your rule:

```typescript
interface RuleContext {
  // Configuration
  config: PluginConfig

  // Logging
  logger: Logger

  // Reporting
  report(descriptor: ReportDescriptor): void

  // Source file info
  getSource(): string
  getFilePath(): string

  // AST and tokens
  getAST(): unknown
  getTokens(): readonly unknown[]
  getComments(): readonly unknown[]

  // TypeScript type information (if available)
  parserServices?: {
    program?: unknown
    esTreeNodeToTSNodeMap?: Map<unknown, unknown>
    tsNodeToESTreeNodeMap?: Map<unknown, unknown>
  }

  // Workspace
  workspaceRoot: string
}
```

### Reporting Issues

Use `context.report()` to flag issues:

```typescript
context.report({
  node: someNode, // The AST node (optional)
  message: 'Issue description', // Required: error message
  loc: {
    // Source location (optional)
    start: { line: 1, column: 0 },
    end: { line: 1, column: 10 },
  },
  data: {
    // Additional data (optional)
    variable: 'foo',
    limit: 10,
  },
  fix: {
    // Auto-fix (optional)
    range: [start, end], // Range to replace
    text: 'replacement text', // Replacement text
  },
  suggest: [
    // Suggestions (optional)
    {
      desc: 'Suggestion description',
      message: 'Why this suggestion',
      fix: {
        range: [start, end],
        text: 'suggested text',
      },
    },
  ],
})
```

### AST Node Types

CodeForge uses SWC for parsing, which generates AST nodes similar to ESTree. Common node types include:

- **Program**: Root node
- **Identifier**: Variable names, property names
- **Literal**: String, number, boolean literals
- **ExpressionStatement**: Expression statements
- **CallExpression**: Function calls
- **MemberExpression**: Property access (e.g., `obj.prop`)
- **FunctionDeclaration**: Function declarations
- **VariableDeclaration**: Variable declarations (`let`, `const`, `var`)
- **IfStatement**: Conditional statements
- **ForStatement**, **WhileStatement**: Loops
- **ReturnStatement**: Return statements

For a complete list of node types, refer to the SWC documentation or explore the AST structure using `context.getAST()`.

---

## Testing Plugins

### Setting Up Tests

CodeForge uses Vitest for testing. Your test files should be in the `test/` directory:

```typescript
// test/rules/my-rule.test.ts
import { describe, expect, it } from 'vitest'
import { myRule } from '../../src/rules/my-rule.js'
import { createRuleContext } from 'codeforge'

describe('myRule', () => {
  it('should have valid meta', () => {
    expect(myRule.meta).toBeDefined()
    expect(myRule.meta.type).toBe('problem')
    expect(myRule.meta.docs?.description).toBeDefined()
  })

  it('should export create function', () => {
    expect(myRule.create).toBeDefined()
    expect(typeof myRule.create).toBe('function')
  })

  it('should return visitor object', () => {
    const mockContext = createRuleContext({
      logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      },
      config: { options: [], settings: {} },
      workspaceRoot: process.cwd(),
      source: 'const x = 1;',
      filePath: 'test.ts',
      ast: {},
      tokens: [],
      comments: [],
    })

    const visitor = myRule.create(mockContext)
    expect(visitor).toBeDefined()
    expect(typeof visitor).toBe('object')
  })
})
```

### Testing Rule Logic

Test your rule logic with actual code samples:

```typescript
import { createRuleContext } from 'codeforge'

describe('noConsoleLog rule', () => {
  it('should report console.log', () => {
    const reports: any[] = []
    const context = createRuleContext({
      logger: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
      config: { options: [] },
      workspaceRoot: process.cwd(),
      source: 'console.log("test");',
      filePath: 'test.ts',
      ast: {}, // In real tests, parse the source to get AST
      tokens: [],
      comments: [],
    })

    // Override report to collect reports
    const originalReport = context.report
    context.report = (descriptor: any) => reports.push(descriptor)

    const visitor = noConsoleLog.create(context)

    // Manually invoke visitor (in real tests, traverse AST)
    visitor.CallExpression?.({
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { name: 'console' },
        property: { name: 'log' },
      },
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 19 },
      },
      start: 0,
      end: 19,
    })

    expect(reports).toHaveLength(1)
    expect(reports[0].message).toContain('console.log')
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

---

## Publishing Plugins

### Pre-Publish Checklist

Before publishing your plugin:

1. **Update version** in `package.json`
2. **Update CHANGELOG** with changes
3. **Run tests** to ensure everything passes
4. **Build the plugin** (`npm run build`)
5. **Update README** with documentation
6. **Add keywords** to help discoverability

### Publishing to npm

```bash
# Login to npm (if not already)
npm login

# Publish your plugin
npm publish

# Publish with a tag (e.g., beta)
npm publish --tag beta

# Publish from a specific directory
npm publish --access public
```

### Plugin Naming Convention

Your plugin name must follow this pattern:

- **Non-scoped**: `codeforge-plugin-yourname`
- **Scoped**: `@your-scope/codeforge-plugin-yourname`

Examples:

- ✅ `codeforge-plugin-react-hooks`
- ✅ `@mycompany/codeforge-plugin-style`
- ❌ `my-codeforge-plugin`
- ❌ `codeforge-plugin`

### Using Local Plugins During Development

Use `npm link` to test your plugin locally:

```bash
# In your plugin directory
npm link

# In your project directory
npm link codeforge-plugin-your-plugin
```

Or use CodeForge's plugin linking:

```bash
# Link your plugin
codeforge plugins link ./path/to/your-plugin

# Verify it's linked
codeforge plugins
```

---

## Best Practices

### Rule Design

1. **Be specific**: Each rule should do one thing well
2. **Provide options**: Allow users to configure rule behavior
3. **Document thoroughly**: Explain what the rule does and why it matters
4. **Include examples**: Show good and bad code patterns
5. **Consider performance**: Rules run on potentially large codebases

### Code Quality

1. **Type safety**: Use TypeScript for better type checking
2. **Error handling**: Gracefully handle unexpected AST structures
3. **Logging**: Use the provided logger for debugging
4. **Testing**: Maintain high test coverage
5. **Documentation**: Keep your README up to date

### Performance Optimization

1. **Avoid expensive operations**: Don't make network requests or file I/O in rules
2. **Cache when possible**: Reuse computed values
3. **Early returns**: Skip nodes that don't match your criteria
4. **Use selective visiting**: Only visit nodes you care about

### User Experience

1. **Clear messages**: Write helpful, actionable error messages
2. **Provide fixes**: Make rules fixable when safe
3. **Add suggestions**: Offer multiple solutions when appropriate
4. **Be respectful**: Don't be overly prescriptive

---

## API Reference

### Plugin Types

#### PluginDefinition

```typescript
interface PluginDefinition {
  name: string
  version: string
  description?: string
  rules?: Record<string, RuleDefinition>
  transforms?: Record<string, TransformDefinition>
  hooks?: PluginHooks
  dependencies?: string[]
  engines?: {
    codeforge?: string
  }
}
```

#### RuleDefinition

```typescript
interface RuleDefinition {
  meta: RuleMeta
  create: (context: RuleContext) => RuleVisitor
}
```

#### RuleMeta

```typescript
interface RuleMeta {
  type: 'problem' | 'suggestion' | 'layout'
  severity: 'off' | 'warn' | 'error'
  docs?: {
    description: string
    category?: string
    recommended?: boolean
    url?: string
  }
  fixable?: 'code' | 'whitespace'
  requiresTypeChecking?: boolean
  schema?: RuleSchema
  deprecated?: boolean
  replacedBy?: readonly string[]
}
```

#### RuleContext

```typescript
interface RuleContext {
  logger: Logger
  config: PluginConfig
  report(descriptor: ReportDescriptor): void
  getSource(): string
  getFilePath(): string
  getAST(): unknown
  getTokens(): readonly unknown[]
  getComments(): readonly unknown[]
  parserServices?: {
    program?: unknown
    esTreeNodeToTSNodeMap?: Map<unknown, unknown>
    tsNodeToESTreeNodeMap?: Map<unknown, unknown>
  }
  workspaceRoot: string
}
```

#### Logger

```typescript
interface Logger {
  debug(message: string, ...args: readonly unknown[]): void
  info(message: string, ...args: readonly unknown[]): void
  warn(message: string, ...args: readonly unknown[]): void
  error(message: string, ...args: readonly unknown[]): void
}
```

#### ReportDescriptor

```typescript
interface ReportDescriptor {
  node?: unknown
  message: string
  loc?: SourceLocation
  data?: Record<string, unknown>
  fix?: FixDescriptor
  suggest?: readonly SuggestionDescriptor[]
}
```

#### FixDescriptor

```typescript
interface FixDescriptor {
  range: Range // [start, end] character positions
  text: string // Replacement text
}
```

### Plugin Hooks

Hooks allow you to run code at specific points in the analysis lifecycle:

```typescript
interface PluginHooks {
  onLoad?: (context: HookContext) => void | Promise<void>
  onUnload?: (context: HookContext) => void | Promise<void>
  beforeCheck?: (context: HookContext) => void | Promise<void>
  afterCheck?: (context: HookContext) => void | Promise<void>
  beforeTransform?: (context: HookContext) => void | Promise<void>
  afterTransform?: (context: HookContext) => void | Promise<void>
  onError?: (error: Error, context: HookContext) => void | Promise<void>
}
```

### Transform Definitions

Transforms allow you to modify code:

```typescript
interface TransformDefinition {
  name: string
  description?: string
  filePatterns?: readonly string[]
  transform: (source: string, context: TransformContext) => string | Promise<string>
}
```

### Error Classes

```typescript
class PluginError extends Error {
  pluginName: string
  code: string
  cause?: Error
}

class PluginLoadError extends PluginError {}

class RuleExecutionError extends PluginError {
  ruleName: string
}

class TransformExecutionError extends PluginError {
  transformName: string
}

class HookExecutionError extends PluginError {
  hookName: string
}
```

---

## Examples

### Example 1: No Var Declaration

```typescript
import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'

export const noVar: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Disallow the use of var; use const or let instead',
      category: 'best-practices',
      recommended: true,
    },
    fixable: 'code',
  },

  create(context: RuleContext): RuleVisitor {
    return {
      VariableDeclaration(node: any): void {
        if (node.kind === 'var') {
          const source = context.getSource()
          const declaration = source.slice(node.start, node.end)

          context.report({
            node,
            message: 'Unexpected var, use let or const instead',
            fix: {
              range: [node.start, node.start + 3],
              text: 'let',
            },
          })
        }
      },
    }
  },
}
```

### Example 2: Require JSdoc

```typescript
import type { RuleDefinition, RuleContext, RuleVisitor } from 'codeforge'

export const requireJsdoc: RuleDefinition = {
  meta: {
    type: 'suggestion',
    severity: 'warn',
    docs: {
      description: 'Require JSDoc comments for function declarations',
      category: 'documentation',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          checkConstructors: { type: 'boolean', default: true },
          checkGetters: { type: 'boolean', default: true },
          checkSetters: { type: 'boolean', default: true },
        },
      },
    ],
  },

  create(context: RuleContext): RuleVisitor {
    const options = (context.config.options?.[0] as any) || {}
    const checkConstructors = options.checkConstructors ?? true
    const checkGetters = options.checkGetters ?? true
    const checkSetters = options.checkSetters ?? true

    return {
      FunctionDeclaration(node: any): void {
        if (node.id?.name === 'constructor' && !checkConstructors) {
          return
        }

        const comments = context.getComments()
        const hasJsdoc = comments.some(
          (c: any) =>
            c.type === 'Block' &&
            c.value.trim().startsWith('*') &&
            c.loc.start.line === node.loc.start.line - 1,
        )

        if (!hasJsdoc) {
          context.report({
            node,
            message: `Missing JSDoc comment for function '${node.id?.name || 'anonymous'}'`,
          })
        }
      },
    }
  },
}
```

### Example 3: Plugin with Hooks

```typescript
import type { PluginDefinition } from 'codeforge'
import { myRule } from './rules/my-rule.js'

export const plugin: PluginDefinition = {
  name: 'codeforge-plugin-example',
  version: '1.0.0',
  description: 'Example plugin with hooks',
  rules: {
    'my-rule': myRule,
  },
  hooks: {
    onLoad: (context) => {
      context.logger.info('Plugin loaded successfully')
    },
    beforeCheck: (context) => {
      context.logger.debug('Starting analysis')
    },
    afterCheck: (context) => {
      context.logger.debug('Analysis complete')
    },
    onUnload: (context) => {
      context.logger.info('Plugin unloaded')
    },
  },
}

export default plugin
```

---

## Troubleshooting

### Common Issues

#### Plugin Not Loading

**Problem**: Your plugin isn't being recognized by CodeForge.

**Solutions**:

1. Check that your plugin name starts with `codeforge-plugin-`
2. Verify `package.json` has correct `main` field pointing to compiled output
3. Ensure you've built the plugin: `npm run build`
4. Check that the plugin exports a default `PluginDefinition` object

```typescript
// Correct
export const plugin: PluginDefinition = {
  /* ... */
}
export default plugin

// Incorrect
export default {
  /* ... */
} // Missing type annotation
```

#### Rule Not Reporting Issues

**Problem**: Your rule runs but doesn't report any issues.

**Solutions**:

1. Add logging to debug: `context.logger.debug('Checking node:', node.type)`
2. Verify AST structure: `console.log(JSON.stringify(node, null, 2))`
3. Check that you're visiting the correct node types
4. Ensure your condition logic is correct

#### Type Errors

**Problem**: TypeScript errors when accessing AST properties.

**Solutions**:

1. Use type assertions carefully: `const node = node as any`
2. Check for null/undefined before accessing nested properties
3. Use optional chaining: `node?.callee?.property?.name`

#### Performance Issues

**Problem**: Your rule makes CodeForge run slowly.

**Solutions**:

1. Profile your rule: measure time spent in visitor functions
2. Cache expensive computations
3. Add early returns for nodes that don't match
4. Consider using `requiresTypeChecking: true` only when needed

#### Build Errors

**Problem**: `tsc` fails to compile your plugin.

**Solutions**:

1. Check that `codeforge` is installed: `npm install --save-dev codeforge`
2. Verify `tsconfig.json` has correct settings
3. Ensure all imported types exist
4. Check for circular dependencies

### Debugging Tips

1. **Use the logger**:

   ```typescript
   create(context: RuleContext) {
     context.logger.debug('Rule initialized')
     return { /* ... */ }
   }
   ```

2. **Inspect AST structure**:

   ```typescript
   CallExpression(node: unknown): void {
     console.log('CallExpression:', JSON.stringify(node, null, 2))
   }
   ```

3. **Test with minimal examples**:

   ```typescript
   const source = 'console.log("test")'
   // Parse and test with this simple case
   ```

4. **Run CodeForge in verbose mode**:
   ```bash
   codeforge analyze --verbose
   ```

### Getting Help

- **GitHub Issues**: Report bugs at https://github.com/codeforge-dev/codeforge/issues
- **Documentation**: Check the main CodeForge documentation
- **Community**: Join discussions in the CodeForge community
- **Existing Plugins**: Study official plugins for examples

---

## Related Documentation

- [Plugin Manager](../../src/plugins/manager.ts) - Core plugin management
- [Plugin Registry](../../src/plugins/registry.ts) - Plugin discovery and loading
- [Plugin Types](../../src/plugins/types.ts) - TypeScript type definitions
- [Generate Plugin Command](../../src/commands/generate-plugin.ts) - CLI plugin generator
- [Quick Start Guide](../QUICKSTART.md) - Getting started with CodeForge

---

## License

MIT

---

## Contributing

Contributions to this documentation are welcome! Please submit pull requests with improvements or corrections.

---

**Happy Plugin Development! 🚀**
