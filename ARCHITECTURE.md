# CodeForge Architecture

## Overview

CodeForge is a high-performance code analysis CLI tool built with TypeScript. It analyzes TypeScript/JavaScript codebases for quality issues, technical debt, and best practices violations.

## Core Components

### CLI Layer (`src/commands/`)

Oclif-based command structure with 20+ commands:

- **Analysis Commands**: `analyze`, `fix`, `watch`, `interactive`
- **Reporting Commands**: `report`, `stats`, `debt`, `health`, `benchmark`
- **Configuration Commands**: `init`, `config validate`, `config visualize`
- **Utility Commands**: `cache`, `doctor`, `migrate`, `docs`, `rules`

### Core Analysis Engine (`src/core/`)

| Module                  | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `parser.ts`             | TypeScript AST parsing via ts-morph     |
| `file-discovery.ts`     | Glob-based file discovery               |
| `rule-registry.ts`      | Rule registration and execution         |
| `analysis-utils.ts`     | Parallel file analysis with p-limit     |
| `suppression-parser.ts` | `// codeforge-disable` comment handling |
| `reporter.ts`           | Multi-format report generation          |

### Rule System (`src/rules/`)

Rules are organized by category:

| Category        | Rules     | Focus                                                   |
| --------------- | --------- | ------------------------------------------------------- |
| `complexity/`   | 5 rules   | Cyclomatic complexity, function length, parameter count |
| `dependencies/` | 4 rules   | Circular deps, barrel imports, unused exports           |
| `performance/`  | 5 rules   | Sync in async, await in loop, spread operations         |
| `security/`     | 5 rules   | eval, dynamic delete, unsafe returns                    |
| `patterns/`     | 60+ rules | Modern JS/TS best practices                             |

Each rule exports:

```typescript
interface RuleDefinition {
  meta: {
    name: string
    description: string
    category: RuleCategory
    recommended: boolean
  }
  defaultOptions: object
  create: (options: object) => RuleResult
}
```

### Fix System (`src/fix/`)

Auto-fix infrastructure for rules with `fix` methods:

- `fixer.ts`: Applies fixes with conflict detection
- `context.ts`: Fix execution context
- `types.ts`: Fix result types

### Plugin System (`src/plugins/`)

Extensible plugin architecture:

- `registry.ts`: Plugin registration
- `manager.ts`: Plugin lifecycle management
- `context.ts`: Plugin execution context

### Reporters (`src/reporters/`)

Multi-format output support:

| Format     | Use Case                    |
| ---------- | --------------------------- |
| `console`  | Terminal output with colors |
| `json`     | Machine-readable output     |
| `html`     | Browser-viewable reports    |
| `junit`    | CI/CD integration           |
| `sarif`    | GitHub Code Scanning        |
| `gitlab`   | GitLab Code Quality         |
| `markdown` | Documentation               |
| `csv`      | Spreadsheet analysis        |

### Utilities (`src/utils/`)

Shared utilities:

- `logger.ts`: Leveled logging with chalk
- `fs-helpers.ts`: File system operations
- `git-helpers.ts`: Git integration
- `watcher.ts`: File watching with chokidar
- `ast-helpers.ts`: AST manipulation helpers

## Data Flow

```
User Input (CLI)
      ↓
Command Handler
      ↓
File Discovery (glob patterns)
      ↓
Parser (ts-morph AST)
      ↓
Rule Registry (run rules)
      ↓
Violation Collection
      ↓
Suppression Filter
      ↓
Reporter (format output)
      ↓
Exit Code (0, 1, 2)
```

## Performance Characteristics

- **Parallel Processing**: Uses `p-limit` for concurrent file analysis (default: 4)
- **Parse Caching**: AST results cached per-file
- **Incremental Analysis**: Watch mode only re-analyzes changed files
- **Memory Efficient**: Streams large file sets

## Configuration

Configuration hierarchy (later wins):

1. CLI flags (`--rule`, `--ignore`)
2. Environment variables (`CODEFORGE_*`)
3. Config file (`.codeforgerc.json`)
4. `package.json` `codeforge` key

## Exit Codes

| Code | Meaning                                           |
| ---- | ------------------------------------------------- |
| 0    | Success (no violations)                           |
| 1    | Errors found                                      |
| 2    | Warnings treated as errors (`--fail-on-warnings`) |

## Testing Strategy

- **Framework**: Vitest
- **Coverage**: 85%+ threshold
- **Test Count**: 8900+ tests across 249 files
- **Patterns**: Unit tests per module, integration tests for commands

## Extension Points

1. **Custom Rules**: Add to `src/rules/` or via plugin
2. **Custom Reporters**: Implement reporter interface
3. **Plugins**: Use Oclif plugin architecture
4. **Fix Providers**: Add `fix` method to rules
