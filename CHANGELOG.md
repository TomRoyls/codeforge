# Changelog

## [Unreleased]

- **refactor**: Eliminated all ESLint errors across entire `src/` directory (5,192 → 0 errors, 294 files)
  - Auto-fixed 5,135 sort/spacing issues via `--fix` (perfectionist, padding, shorthands)
  - Manually fixed 53 errors in `src/rules/`: import/export duplicates, charCodeAt→codePointAt, useless escapes, eqeqeq, function scoping, fallthrough, import dedup
  - Fixed 57 errors in `src/core/`, `src/utils/`, `src/plugins/`, `src/cache/`: utf-8→utf8, path named imports, array-push-push, camelcase
  - Removed `src/rules/`, `src/core/`, `src/utils/`, `src/ast/`, `src/plugins/`, `src/cache/` from ESLint ignore list
  - Added per-directory ESLint config overrides with relaxed structural limits
- **fix**: Fixed pre-existing TypeScript errors in `plugins/manager.ts` (variable used before assigned) and `utils/lru-cache.ts` (wrong tuple destructuring)

- **refactor**: Reduced cyclomatic complexity in `analyze` command (23→≤20) by extracting helper methods
- **refactor**: Decomposed `nodeToGeneric` (complexity 70→≤20) into focused helper functions
- **refactor**: Removed all 26 `as any` casts from `adapter.ts` using proper ts-morph API methods
- **refactor**: Removed all `as any` casts from `adapter-node-converter.ts` with `ModifierableNode` type narrowing
- **refactor**: Fixed 87 ESLint errors in `adapter-node-converter.ts` (sort rules, eqeqeq, blank lines)
- **perf**: Added line split caching in fixer module to avoid repeated `string.split()` per violation
- **feat**: Added `plugins` array validation in config validator
- **refactor**: Migrated 105 pattern test files to shared `createMockRuleContext` helper (174 total)
- **fix**: Registered orphan rules `no-label-var` and `no-useless-undefined` in rule registries
- **fix**: Fixed suggestion key names (`noCurly`→`curly`, `noFinishedTodos`→`noUnfinishedTodos`)
- **feat**: Added `clearCache()` and `getCacheStats()` functions to fs/git helpers

- **feat**: Added `no-unsafe-regex` security rule detecting ReDoS vulnerabilities (nested quantifiers, complex alternation, dynamic RegExp injection)
- **refactor**: Migrated 7 reporter files from `console.log` to `process.stdout.write` for proper non-Command stdout handling
- **test**: Added 63 comprehensive tests for `no-unsafe-regex` rule
- **test**: Updated reporter tests to spy on `process.stdout.write`
- **feat**: Added `no-unsafe-regex` security rule detecting ReDoS vulnerabilities (nested quantifiers, complex alternation, dynamic RegExp injection)
- **refactor**: Migrated 7 reporter files from `console.log` to `process.stdout.write` for proper non-Command stdout handling
- **test**: Added 63 comprehensive tests for `no-unsafe-regex` rule
- **test**: Updated reporter tests to spy on `process.stdout.write`
- **refactor**: Removed 18 dead exported functions across 9 source files (net reduction: ~1,188 lines) (net reduction: ~1,188 lines)
- **feat**: Consolidated duplicate `extractLocation` into single canonical (160+ rule files updated)
- **feat**: Added `ChalkColorFunction` shared type for `src/types/chalk.ts`
- **feat**: Added `codeforge ignore` command for managing ignore patterns (add/list/remove)
- **examples**: Added Tauri, Qwik, Capacitor configurations (54 total)
- **examples**: Added NestJS configuration (55 total)
- **test**: Added 42 comprehensive tests for `codeforge explain` command
- **docs**: Updated docs landing page with new config count

- **docs**: Added Technical Contributor's Guide (`docs/CONTRIBUTING_TECHNICAL.md`)
  - Development environment setup and local workflow
  - Step-by-step guides for adding rules, commands, and output formats
  - Cache system, plugin system, debugging techniques
  - Code style conventions and PR submission guidelines

- **docs**: Added comprehensive ESLint to CodeForge Migration Guide (`docs/MIGRATION_ESLINT.md`)
  - Rule mapping table with 30+ ESLint-to-CodeForge equivalents
  - Configuration translation examples (.eslintrc.json to .codeforgerc.json)
  - Migration strategies (big bang, gradual, team-by-team)
  - CI/CD migration examples for GitHub Actions, GitLab CI, Jenkins
  - FAQ section covering common migration questions

- **docs**: Added Editor Integration Guide (`docs/EDITOR_INTEGRATION.md`)
  - VS Code tasks.json, problem matchers, keybindings
  - JetBrains IDEs (WebStorm, IntelliJ) configuration
  - Vim/Neovim AsyncRun, ALE, autocmd setup
  - Emacs compilation mode and Flycheck integration
  - Pre-commit hooks (git native, husky, lint-staged)

- **docs**: Added Configuration Reference Guide (`docs/CONFIG_REFERENCE.md`)
  - Complete configuration schema with all properties documented
  - Rule configuration, file patterns, environment variables
  - 8 diverse config examples from simple to complex

- **docs**: Added comprehensive Architecture Decision Guide (`docs/ARCHITECTURE.md`)
  - Complete architecture patterns: Monolithic, Layered, Microservices, Hexagonal
  - Decision framework with project assessment
  - Scale considerations and team factors
  - Integration strategies and migration paths

- **docs**: Added comprehensive Plugin Development Guide (`docs/PLUGIN_DEVELOPMENT.md`)
  - Plugin architecture overview and creation guide
  - Plugin manifest, configuration, and lifecycle hooks
  - Testing strategies and publishing guide
  - Full API reference with TypeScript interfaces

- **docs**: Added comprehensive Troubleshooting Guide (`docs/TROUBLESHOOTING.md`)
  - Installation, configuration, and performance issues
  - Rule violations, plugin issues, and CI/CD problems
  - Debug mode usage and getting help

- **docs**: Added comprehensive Security Best Practices Guide (`docs/SECURITY_BEST_PRACTICES.md`)
  - Threat model, configuration security, and dependency guidelines
  - CI/CD security, plugin security, and code analysis security
  - Data privacy and incident response procedures

- **docs**: Added comprehensive Performance Tuning Guide (`docs/PERFORMANCE_TUNING.md`)
  - Performance targets and metrics
  - Startup optimization with lazy loading
  - Analysis speed, memory management, and CI/CD optimization
  - Caching strategies and parallel processing

- **docs**: Added comprehensive Testing Guide (`docs/TESTING.md`)
  - Testing philosophy and structure
  - Coverage requirements (85% threshold)
  - Mocking and fixtures examples

- **docs**: Added CLI usage guide (`docs/CLI_USAGE.md`)
  - Complete command reference with configuration examples
  - CI/CD integration guides and advanced usage patterns

- **examples**: Added AWS Lambda configuration (`.codeforgerc.aws-lambda.json`)
  - Targets Lambda-specific directories, cold start optimized with 60-line function limit

- **examples**: Added Azure Functions configuration (`.codeforgerc.azure-functions.json`)
  - Targets Azure Functions project structure with serverless-appropriate rules

- **examples**: Added Bun runtime configuration (`.codeforgerc.bun.json`)
  - Optimized for Bun runtime with TypeScript-first approach

- **examples**: Added Cloudflare Workers configuration (`.codeforgerc.cloudflare-workers.json`)
  - Edge computing optimized with strict size limits

- **examples**: Added Cypress E2E testing config (`.codeforgerc.cypress.json`)
  - Ignores cypress/videos, screenshots, downloads

- **examples**: Added Playwright E2E testing config (`.codeforgerc.playwright.json`)
  - Ignores test-results and playwright-report

- **examples**: Added serverless configuration (`.codeforgerc.serverless.json`)
  - For AWS Lambda, Azure Functions, Google Cloud Functions

- **examples**: Added Docker configuration (`.codeforgerc.docker.json`)
  - For containerized Node.js applications

- **examples**: Added full-stack configuration (`.codeforgerc.fullstack.json`)
  - For projects with shared frontend and backend code

- **examples**: Added CodeForge self-analysis configuration (`.codeforgerc.codeforge.json`)
  - Demonstrates using CodeForge to analyze its own codebase

- **examples**: Added microservices configuration (`.codeforgerc.microservices.json`)
  - ERROR-level circular dependency detection for distributed systems

- **examples**: Added testing library configuration (`.codeforgerc.testing-library.json`)
  - Enforces testing best practices for shared utility packages

- **examples**: Added Electron desktop app configuration (`.codeforgerc.electron.json`)
  - Covers main process and renderer code

- **examples**: Added NestJS framework configuration (`.codeforgerc.nestjs.json`)
  - NestJS-specific file patterns (.controller.ts, .service.ts, .module.ts)

- **examples**: Added SvelteKit configuration (`.codeforgerc.sveltekit.json`)
  - Handles server-side routes and API endpoints

- **examples**: Added Remix framework configuration (`.codeforgerc.remix.json`)
  - Analyzes app/ directory structure (routes, loaders, actions)

- **examples**: Added Nuxt framework configuration (`.codeforgerc.nuxt.json`)
  - Handles both Nuxt 2 and Nuxt 3 projects

- **examples**: Added Astro multi-framework configuration (`.codeforgerc.astro.json`)
  - Supports .ts, .tsx, .js, .jsx, .astro, .vue, .svelte files

- **examples**: Added Vite build tool configuration (`.codeforgerc.vite.json`)
  - Framework-agnostic Vite-powered project config

- **examples**: Added Monorepo configuration (`.codeforgerc.monorepo.json`)
  - ERROR-level circular dependency detection for monorepo health

- **examples**: Added Turborepo monorepo configuration (`.codeforgerc.turborepo.json`)
  - Ignores .turbo cache directory

- **examples**: Added pnpm workspace configuration (`.codeforgerc.pnpm-workspace.json`)
  - For pnpm workspaces without Turborepo

- **examples**: Added Rollup bundler configuration (`.codeforgerc.rollup.json`)
  - Ignores .rollup.cache directory

- **examples**: Added ESLint migration configuration (`.codeforgerc.eslint.json`)
  - For teams migrating from ESLint gradually

- **ci**: Added GitHub workflows for CodeForge CI/CD
  - `cache-results.yml` — Caches analysis results to GitHub Actions artifacts
  - `codeforge-analysis.yml` — Push/PR triggers with PR comment generation
  - `pr-check.yml` — Analyzes changed files with threshold checks
  - `scheduled-maintenance.yml` — Weekly dependency updates and security audit

- **community**: Added FUNDING.yml for sponsorship support
- **community**: Added CODEOWNERS file for automated PR review assignments
- **community**: Added GitHub Pull Request template
- **community**: Added GitHub discussion templates (Q&A, Ideas)
- **community**: Added CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- **community**: Added CONTRIBUTING guide
- **community**: Added GitHub SECURITY policy (`.github/SECURITY.md`)
- **tooling**: Added VS Code extension recommendations (`.vscode/extensions.json`)
- **tooling**: Added Git attributes for consistent line endings (`.gitattributes`)

### Changed

- **chore**: Simplified vitest coverage config (removed html reporter, redundant include glob)
- **community**: Removed duplicate GitHub community files (kept uppercase/canonical versions)
- **tooling**: Added 19+ framework configurations across multiple categories

### Fixed

- **docs**: Fixed invalid `"off"` severity reference in `examples/README.md` (CodeForge uses `"info"`, not `"off"`)
- **docs**: Fixed docs landing page — removed duplicate entry, updated config count to 46
- **docs**: Cleaned up `examples/README.md` — removed duplicate sections, added all config entries
- **docs**: Cleaned up duplicate documentation section in `README.md`
- **examples**: Fixed 7 invalid JSON config files with missing commas
- **examples**: Fixed invalid `"off"` severity level in 4 configs
- **core**: Improved error handling in `src/utils/file-writer.ts` — added try/catch to all sync fs operations
- **core**: Added debug logging to empty catch blocks in `src/cache/result-cache.ts` and `src/cache/ast-cache.ts`
- **core**: Improved error handling in `src/utils/watcher.ts` — added error classification in empty catch block (ENOENT/EACCES expected, others logged)
- **core**: Added error rejection handler to `src/commands/organize-imports.ts` — .then() now has error callback
- **core**: Added try/catch in `src/commands/stats.ts`, `src/commands/migrate.ts`, `src/commands/init.ts` — unprotected fs.writeFile and fs.mkdir now wrapped
- **core**: Added try/catch in `src/commands/docs.ts` — all fs.write operations (mkdir, index, per-rule, single-file) now protected
- **core**: Added try/catch in `src/commands/benchmark.ts` — writeResults now wrapped
- **core**: Added try/catch in `src/commands/report.ts` — readFile in loadFromInput now wrapped
- **community**: removed duplicate root `SECURITY.md` (kept `.github/SECURITY.md`)

## [0.1.0]

### Fixed

- **clean**: Fixed npm audit vulnerabilities (brace-expansion, picomatch)
- **clean**: Deleted broken `.github/workflows/release.yml`
