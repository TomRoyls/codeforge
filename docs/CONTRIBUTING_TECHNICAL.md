# CodeForge Technical Contributor's Guide

This guide helps developers contribute to CodeForge internals by explaining the technical architecture, patterns, and workflows used throughout the codebase.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Codebase Architecture Overview](#codebase-architecture-overview)
- [Adding a New Rule](#adding-a-new-rule)
- [Adding a New Command](#adding-a-new-command)
- [Adding a New Output Format](#adding-a-new-output-format)
- [Working with the Cache System](#working-with-the-cache-system)
- [Working with the Plugin System](#working-with-the-plugin-system)
- [Debugging Techniques](#debugging-techniques)
- [Code Style & Conventions](#code-style--conventions)
- [PR Submission Guidelines](#pr-submission-guidelines)
- [Release Process](#release-process)

## Development Environment Setup

### Prerequisites

Before contributing to CodeForge, ensure your development environment meets these requirements:

- **Node.js**: 20.0.0 or higher
- **npm**: 9.0.0 or higher
- **TypeScript**: 5.0.0 or higher (for building)
- **Git**: For version control and PR management

### Local Setup

Clone and set up the development environment:

```bash
# Clone the repository
git clone https://github.com/codeforge-dev/codeforge.git
cd codeforge

# Install dependencies
npm install

# Build the project
npm run build

# Run locally to verify
./bin/run.js --help
```

### Build Commands

CodeForge uses TypeScript compilation. Available build scripts:

```bash
# Full build (clean and compile)
npm run build

# Clean build artifacts
npm run clean

# Clean only dist directory
npm run clean:dist

# Clean only cache directories
npm run clean:cache
```

### Development Workflow

A typical development workflow:

```bash
# 1. Create a feature branch
git checkout -b feature/my-new-rule

# 2. Make your changes
# Edit src/rules/my-new-rule.ts

# 3. Watch for changes and rebuild automatically
npm run build -- --watch

# 4. Run tests in watch mode
npm run test:watch

# 5. Lint and format
npm run lint
npm run format

# 6. Run tests with coverage
npm run test:coverage

# 7. Commit your changes
git add .
git commit -m "feat: add new rule for detecting XYZ"
```

## Codebase Architecture Overview

### Module Layout

CodeForge follows a modular architecture with clear separation of concerns:

```
src/
├── ast/              # AST traversal and visitor patterns
├── cache/            # Caching subsystem (parse, AST, result)
├── commands/          # CLI commands built with Oclif
├── config/            # Configuration loading and validation
├── core/              # Core services (parser, file discovery, rule registry)
├── fix/               # Auto-fix application logic
├── lib/               # Shared utility libraries
├── plugins/           # Plugin system adapters and loaders
├── reporters/          # Output formatters (console, JSON, HTML, etc.)
├── rules/             # Built-in rules organized by category
└── utils/             # General utilities (logging, git helpers, etc.)
```

### Key Abstractions

**Parser (SWC + ts-morph)**:

- Uses ts-morph's `Project` for deep TypeScript analysis
- SWC provides fast initial parsing
- Dual-caching: in-memory cache + optional disk-based AST cache

**Rule Registry**:

- Central registry for all built-in and plugin rules
- Enables rule filtering and selective execution
- Manages rule options and severity configuration

**Visitor Pattern**:

- AST traversal uses a visitor pattern for node inspection
- Rules define visitor methods for specific node types
- Efficient single-pass traversal where possible

**Reporter System**:

- Pluggable output formatters
- Supports console, JSON, HTML, JUnit, SARIF, GitLab, CSV
- Consistent interface for all output formats

For full architecture details, see [Architecture Guide](ARCHITECTURE.md).

## Adding a New Rule

### Rule Interface Structure

All rules implement the `RuleDefinition` interface:

```typescript
import type { RuleDefinition, RuleOptions } from '../rules/types.js'
import type { RuleViolation, ASTVisitor } from '../ast/visitor.js'

export const myRule: RuleDefinition<RuleOptions> = {
  meta: {
    name: 'my-rule',
    description: 'Brief description of what this rule checks',
    category: 'complexity' | 'patterns' | 'security' | 'performance' | 'dependencies',
    recommended: true,
    fixable: 'code' | 'whitespace',
    severity: 'error' | 'warning',
  },

  defaultOptions: {
    // Default configuration values for rule options
    max: 10,
    allow: [],
  },

  create: (options: RuleOptions) => {
    const violations: RuleViolation[] = []

    return {
      visitor: {
        // Visitor methods for AST node types
        visitFunction: (node) => {
          // Rule logic here
        },
        visitClassDeclaration: (node) => {
          // Rule logic here
        },
      },

      onComplete: () => violations,
    }
  },

  // Optional: Provide auto-fix function
  fix?: (sourceFile: SourceFile, violation: RuleViolation) => FixResult | null
}
```

### Rule Metadata

The `meta` object defines rule properties:

```typescript
meta: {
  name: 'rule-id',           // Kebab-case identifier
  description: 'Human-readable description',
  category: 'complexity',     // Category for filtering
  recommended: true,           // Included in recommended config
  fixable: 'code',             // Can the rule auto-fix?
  severity: 'warning',           // Default severity level
  docs?: {
    url: 'https://...',          // Documentation URL
  },
}
```

### Where to Place Rule Files

Rules are organized by category:

```
src/rules/
├── complexity/        # Complexity-related rules
│   ├── max-params.ts
│   ├── max-depth.ts
│   └── index.ts
├── dependencies/      # Dependency analysis rules
├── patterns/          # Code style and pattern rules
├── security/          # Security-focused rules
└── index.ts           # Exports all rules
```

### Registering Rules

To register a new rule:

1. **Export from category index**:

```typescript
// src/rules/complexity/index.ts
import { myRule } from './my-rule.ts'

export { myRule }
```

2. **Add to main rules index**:

```typescript
// src/rules/index.ts
import { myRule } from './complexity/index.js'

export const allRules: Record<string, RuleDefinition> = {
  'my-rule': myRule,
  // ... other rules
}
```

3. **Define category mapping**:

```typescript
// src/rules/index.ts
const RULE_CATEGORIES: Record<string, RuleCategory> = {
  'my-rule': 'complexity',
}
```

### Testing a New Rule

Create a test file alongside your rule:

```typescript
// test/unit/rules/my-rule.test.ts
import { describe, it, expect } from 'vitest'
import { myRule } from '../../../src/rules/complexity/my-rule'
import { parseCode } from '../../helpers/parser'

describe('my-rule', () => {
  it('should detect violations', () => {
    const code = `
      function example(param1, param2, param3, param4, param5) {
        return param1 + param2;
      }
    `
    const ast = parseCode(code)
    const violations = myRule.create({ max: 3 }).visitor.visitFunction!(ast)

    expect(violations).toHaveLength(1)
    expect(violations[0].ruleId).toBe('my-rule')
  })

  it('should not flag valid code', () => {
    const code = `
      function example(param1, param2) {
        return param1 + param2;
      }
    `
    const ast = parseCode(code)
    const violations = myRule.create({ max: 3 }).visitor.visitFunction!(ast)

    expect(violations).toHaveLength(0)
  })
})
```

For more testing guidance, see [Testing Guide](TESTING.md).

## Adding a New Command

### Oclif Command Structure

CodeForge uses Oclif for CLI commands. Extend the `Command` class:

```typescript
import { Args, Command, Flags } from '@oclif/core'

export default class MyCommand extends Command {
  static override description = 'Brief command description'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Example description',
    },
  ]

  static override args = {
    input: Args.string({
      default: '.',
      description: 'Input path',
      required: false,
    }),
  }

  static override flags = {
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MyCommand)

    // Command implementation here
    if (flags.verbose) {
      console.log('Processing:', args.input)
    }

    if (flags.output) {
      await this.writeOutput(flags.output, data)
    }
  }

  private async writeOutput(filePath: string, data: unknown): Promise<void> {
    // Write to file
  }
}
```

### Flag Definitions

Oclif supports various flag types:

```typescript
static override flags = {
  // Boolean flag
  boolFlag: Flags.boolean({
    description: 'Enable/disable feature',
    default: true,
    allowNo: true,  // Allows --no-boolFlag
  }),

  // Integer flag
  countFlag: Flags.integer({
    description: 'Count value',
    default: 10,
    min: 1,
    max: 100,
  }),

  // String flag
  stringFlag: Flags.string({
    char: 's',            // Short form: -s
    description: 'String input',
    required: false,
  }),

  // Multiple flag
  patterns: Flags.string({
    multiple: true,
    description: 'Multiple patterns',
  }),

  // Option flag (enum)
  format: Flags.option({
    options: ['console', 'json', 'html'],
    description: 'Output format',
  }),
}
```

### Output Formatting

When writing commands, consider output formatting:

```typescript
import ora, { type Ora } from 'ora'
import chalk from 'chalk'

async run(): Promise<void> {
  // Use spinners for long operations
  const spinner = ora('Processing...').start()

  try {
    await doWork()
    spinner.succeed('Complete!')
  } catch (error) {
    spinner.fail('Failed')
    throw error
  }

  // Use colors for terminal output
  if (this.color) {
    this.log(chalk.green('Success'))
  } else {
    this.log('Success')
  }
}
```

### Testing Commands

Test commands by implementing the actual CLI behavior:

```typescript
// test/integration/commands/my-command.test.ts
import { describe, it, expect, vi } from 'vitest'
import { MyCommand } from '../../../src/commands/my-command'
import { mockFS } from '../../helpers/fs-mock'

describe('MyCommand', () => {
  it('should process input correctly', async () => {
    const command = new MyCommand([], {})
    vi.mock('fs', () => mockFS)

    await command.run()

    expect(command.exitCode).toBe(0)
  })
})
```

## Adding a New Output Format

### Extending the Formatter System

Output formatters implement the `Reporter` interface:

```typescript
import type { AnalysisResult, Reporter, ReporterOptions } from './types.js'

export class MyFormatReporter implements Reporter {
  readonly name = 'myformat'

  private readonly color: boolean
  private readonly quiet: boolean
  private readonly verbose: boolean

  constructor(options: ReporterOptions = {}) {
    this.color = options.color ?? true
    this.quiet = options.quiet ?? false
    this.verbose = options.verbose ?? false
  }

  report(results: AnalysisResult): void {
    if (this.quiet) {
      this.reportQuiet(results)
    } else {
      this.reportFull(results)
    }
  }

  private reportFull(results: AnalysisResult): void {
    // Generate and output custom format
  }

  private reportQuiet(results: AnalysisResult): void {
    // Output only errors in quiet mode
  }
}
```

### Registering the Reporter

1. **Create the reporter file**:

```typescript
// src/reporters/myformat-reporter.ts
export class MyFormatReporter implements Reporter {
  // Implementation
}
```

2. **Export from reporters index**:

```typescript
// src/reporters/index.ts
import { MyFormatReporter } from './myformat-reporter.js'

export const reporters: Record<string, new (options: ReporterOptions) => Reporter> = {
  myformat: (options) => new MyFormatReporter(options),
}
```

3. **Add to reporter factory**:

```typescript
// src/core/reporter.ts
import { reporters } from '../reporters/index.js'

function createReporter(format: string, options: ReporterOptions): Reporter {
  const ReporterClass = reporters[format] ?? ConsoleReporter
  return new ReporterClass(options)
}
```

### Formatter Options

Reporters support these common options:

```typescript
interface ReporterOptions {
  color?: boolean // Enable/disable ANSI colors
  quiet?: boolean // Suppress non-error output
  verbose?: boolean // Show detailed information
  outputPath?: string // Write to file instead of stdout
  includeSource?: boolean // Include source code snippets
}
```

## Working with the Cache System

CodeForge uses a three-tier caching system for performance:

### Parse Cache

In-memory cache for parsed SourceFile objects:

```typescript
import { globalParseCache } from '../cache/parse-cache.js'

// Get from cache
const cached = globalParseCache.get(filePath)

// Set in cache
globalParseCache.set(filePath, sourceFile)
```

### AST Cache

Optional persistent cache for parsed ASTs on disk:

```typescript
import { ASTCache } from '../cache/ast-cache.js'

const astCache = new ASTCache(project, {
  version: '1.0.0', // Cache version for invalidation
})

// Get from disk cache
const cached = await astCache.get(filePath, contentHash)

// Set to disk cache
await astCache.set(filePath, contentHash, astData)
```

### Result Cache

Cache of analysis results to avoid re-running rules:

```typescript
import { ResultCache } from '../cache/result-cache.js'

const resultCache = new ResultCache()

// Get cached results
const cachedViolations = await resultCache.get(filePath, fileHash, configHash)

// Cache results
await resultCache.set(filePath, fileHash, configHash, violations)
```

### Cache Invalidation

The cache system supports multiple invalidation strategies:

```typescript
import { InvalidationStrategy } from '../cache/index.js'

// Time-based: expire after TTL
strategy = InvalidationStrategy.TimeBased

// Content-based: invalidate when file content changes
strategy = InvalidationStrategy.ContentBased

// Version-based: invalidate when package version changes
strategy = InvalidationStrategy.VersionBased
```

### Using Caching in Rules

Rules can leverage the context cache:

```typescript
create(context: RuleContext): RuleVisitor {
  // Use context cache for expensive computations
  const cache = context.cache
  let expensiveData = cache.get('expensive-data')

  if (!expensiveData) {
    expensiveData = computeExpensiveData()
    cache.set('expensive-data', expensiveData)
  }

  return {
    visitor: {
      // ... visitors use cached data
    }
  }
}
```

## Working with the Plugin System

For comprehensive plugin development guidance, see [Plugin Development Guide](PLUGIN_DEVELOPMENT.md).

### Plugin Discovery

CodeForge discovers plugins in this order:

1. **Core plugins**: Built-in with CodeForge
2. **Local plugins**: Configured in `.codeforgerc.json` under `plugins` key
3. **npm-installed plugins**: Packages with `codeforge-plugin` keyword
4. **Workspace plugins**: Monorepo packages matching plugin pattern

### Plugin Loading

The plugin loader handles plugin lifecycle:

```typescript
import { PluginLoader } from '../plugins/loader.js'

const loader = new PluginLoader(config)

// Load all plugins
await loader.loadAll()

// Load specific plugin
await loader.load('codeforge-plugin-myplugin')

// Get loaded plugins
const plugins = loader.getLoadedPlugins()
```

### Plugin Lifecycle Hooks

Plugins can register lifecycle hooks:

```typescript
export default {
  name: 'my-plugin',
  version: '1.0.0',

  // Lifecycle hooks
  onLoad(context) {
    console.log('Plugin loaded!')
  },

  onUnload() {
    console.log('Plugin unloaded!')
  },

  onAnalysisStart(config) {
    // Prepare for analysis
  },

  onAnalysisEnd(results) {
    // Process results
  },

  onConfigChange(newConfig) {
    // Handle config changes
  },
}
```

### Plugin Rule Adapter

External ESLint rules are adapted via the adapter pattern:

```typescript
import { adaptPluginRule } from './adapter.js'

// Adapt an ESLint rule to CodeForge format
const adaptedRule = adaptPluginRule(eslintRule, 'codeforge-rule-id')
```

## Debugging Techniques

### Debug Mode

Enable debug output:

```bash
# Set verbose flag
codeforge analyze --verbose

# Or set environment variable
DEBUG=codeforge:* codeforge analyze
```

### Verbose Output

Commands support verbose output for detailed information:

```typescript
// In commands, check verbose flag
if (flags.verbose) {
  logger.debug('Detailed debug information')
  logger.debug(`Processing file: ${filePath}`)
  logger.debug(`Parse time: ${parseTime}ms`)
}
```

### Logging Patterns

Use the logger utility consistently:

```typescript
import { logger, LogLevel } from '../utils/logger.js'

// Set log level
logger.setLevel(LogLevel.DEBUG)

// Log at different levels
logger.debug('Debug message')
logger.info('Info message')
logger.warn('Warning message')
logger.error('Error message')
```

### Debug Configuration

Create a `.codeforgerc.json` for local testing:

```json
{
  "files": ["src/**/*.ts"],
  "rules": {
    "my-rule": "error"
  },
  "cache": {
    "enabled": false
  }
}
```

## Code Style & Conventions

### Naming Conventions

- **Files**: kebab-case (`my-rule.ts`, `my-command.ts`)
- **Classes**: PascalCase (`class Analyze extends Command`)
- **Functions**: camelCase (`function analyzeFile()`)
- **Constants**: UPPER_SNAKE_CASE (`const MAX_PARAMS = 10`)
- **Interfaces**: PascalCase with `I` prefix (`interface RuleOptions`)

### File Organization

```
src/
├── commands/          # One file per command
├── rules/             # One file per rule, organized by category
├── reporters/          # One file per output format
├── core/              # Core services and utilities
├── utils/             # Shared utility functions
└── types/             # TypeScript type definitions
```

### Import Ordering

Group imports in this order:

```typescript
// 1. Node.js built-ins
import { readFile } from 'node:fs/promises'
import path from 'node:path'

// 2. External dependencies
import pLimit from 'p-limit'
import chalk from 'chalk'

// 3. Internal modules (absolute imports)
import { logger } from '../utils/logger.js'
import { RuleRegistry } from '../core/rule-registry.js'

// 4. Relative imports (for same directory)
import { helperFn } from './helper.js'
```

### TypeScript Conventions

CodeForge follows strict TypeScript conventions:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

Key conventions:

- Use `type` imports for type-only imports
- Explicit return types on functions
- Use interfaces for public APIs
- Use types for utility types
- Enable `verbatimModuleSyntax` for cleaner imports

## PR Submission Guidelines

### PR Size

- Keep PRs focused and reasonably sized
- Aim for 200-500 lines of changes
- Large PRs should be split into multiple focused PRs

### PR Description Template

```markdown
## Description

Briefly describe what this PR does and why.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation
- [ ] Performance improvement

## Related Issues

Fixes #123

## Changes

- List the main changes made in this PR

## Testing

- [ ] Added tests for new functionality
- [ ] All existing tests pass
- [ ] Coverage maintained above 85%

## Checklist

- [ ] Code follows project style guidelines
- [ ] Documentation updated if needed
- [ ] No new warnings introduced
- [ ] Tested on multiple platforms
```

### Review Criteria

Before submitting, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] Coverage meets threshold (`npm run test:coverage`)
- [ ] Documentation is updated for new features
- [ ] Breaking changes are documented
- [ ] No console.log or debugger statements left in code

## Release Process

### Versioning

CodeForge uses semantic versioning (SemVer):

- **MAJOR**: Breaking changes or major new features
- **MINOR**: New features in backward-compatible manner
- **PATCH**: Bug fixes in backward-compatible manner

Example: `1.2.3` → `1.3.0` (new feature)

### Release Checklist

Before creating a release:

- [ ] All tests pass
- [ ] Coverage meets 85% threshold
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] Version number updated in package.json
- [ ] Built successfully (`npm run build`)
- [ ] Tested locally

### Release Steps

```bash
# 1. Update version
npm version minor  # or major/patch

# 2. Update CHANGELOG
# Edit CHANGELOG.md with release notes

# 3. Build
npm run build

# 4. Test
npm test
npm run test:coverage

# 5. Commit
git add .
git commit -m "chore: release v1.2.0"

# 6. Tag
git tag v1.2.0

# 7. Push
git push origin main
git push origin v1.2.0

# 8. Publish
npm publish
```

### Post-Release

After release:

- Monitor GitHub Issues for feedback
- Update documentation based on user questions
- Track metrics and performance
- Plan next release based on community input

## Additional Resources

- **[Architecture Guide](ARCHITECTURE.md)**: Deep dive into architectural patterns
- **[Plugin Development Guide](PLUGIN_DEVELOPMENT.md)**: Build custom plugins
- **[Testing Guide](TESTING.md)**: Testing strategies and best practices
- **[Performance Tuning Guide](PERFORMANCE_TUNING.md)**: Optimize analysis performance
- **[Configuration Reference](CONFIG_REFERENCE.md)**: Complete config option reference

## Getting Help

- **GitHub Issues**: https://github.com/codeforge-dev/codeforge/issues
- **GitHub Discussions**: https://github.com/codeforge-dev/codeforge/discussions
- **Documentation**: https://codeforge.dev/docs
