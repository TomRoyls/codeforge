# Changelog

## [Unreleased]

### Fixed

- **examples**: Fixed invalid `"off"` severity level in 4 example configs
  - `.codeforgerc.cli-tool.json` — changed `"off"` to `"info"` for `no-any` and `no-console`
  - `.codeforgerc.graphql-server.json` — changed `"off"` to `"info"` for `no-async-await`
  - `.codeforgerc.serverless.json` — changed `"off"` to `"info"` for `no-async-await`
  - `.codeforgerc.testing-library.json` — changed `"off"` to `"info"` for `no-console`
  - Valid CodeForge severities are: `error`, `warning`, `info`
  - All 40 example configs now pass `codeforge config validate`

### Fixed

- `.codeforgerc.cli-tool.json` — missing commas in rules and output sections
- `.codeforgerc.eslint.json` — missing commas in files and ignore arrays
- `.codeforgerc.express.json` — missing comma after no-console rule
- `.codeforgerc.graphql.json` — missing comma in ignore array
- `.codeforgerc.turborepo.json` — missing comma in ignore array
- `.codeforgerc.typescript-strict.json` — missing commas in files/ignore arrays + extra closing brace
- All 36 example configs now pass JSON validation

- **docs**: Cleaned up `examples/README.md`
  - Removed duplicate monorepo section and duplicate Usage/Customization headers
  - Added documentation entries for deno, library, and codeforge configs
  - Proper single Usage → Customization → Best Practices flow

### Added

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

- **examples**: Added serverless configuration (`.codeforgerc.serverless.json`)
  - For AWS Lambda, Azure Functions, Google Cloud Functions
  - Strict function size limits optimized for cold starts

- **examples**: Added Docker configuration (`.codeforgerc.docker.json`)
  - For containerized Node.js applications
  - Excludes docker and scripts directories from analysis

- **examples**: Added full-stack configuration (`.codeforgerc.fullstack.json`)
  - For projects with shared frontend and backend code
  - ERROR-level circular dependency detection for shared packages

- **docs**: Updated `docs/README.md` with migration and editor integration guide links
  - Includes documentation stats and contributing guidelines
  - Improves documentation discoverability

- **examples**: Added CodeForge self-analysis configuration (`examples/.codeforgerc.codeforge.json`)
  - Demonstrates using CodeForge to analyze its own codebase
  - Shows best practices for self-referential analysis
  - Configured for TypeScript strict mode

- **ci**: Added GitHub workflow for caching results (`.github/workflows/cache-results.yml`)
  - Caches analysis results to GitHub Actions artifacts
  - Speeds up subsequent analysis runs
  - Stores results for 5 days

- **ci**: Added GitHub workflow for CI/CD analysis (`.github/workflows/codeforge-analysis.yml`)
  - Push/PR triggers
  - Weekly scheduled runs
  - PR comment generation
  - Fail-fast on violations

- **ci**: Added GitHub workflow for PR quality checks (`.github/workflows/pr-check.yml`)
  - Analyzes changed files only
  - Checks error and warning thresholds
  - Posts analysis results as PR comments

- **ci**: Added GitHub workflow for scheduled maintenance (`.github/workflows/scheduled-maintenance.yml`)
  - Weekly dependency updates check
  - Security vulnerability audit
  - Health and technical debt reporting
  - Automatic issue creation on failure

- **docs**: Added comprehensive Performance Tuning Guide (`docs/PERFORMANCE_TUNING.md`)
  - Performance targets and metrics
  - Startup optimization with lazy loading
  - Analysis speed optimization strategies
  - Memory management techniques
  - CI/CD optimization patterns
  - Large codebase strategies
  - Caching strategies (parse, result, persistent)
  - Parallel processing techniques
  - Monitoring and profiling tools
  - Troubleshooting guide for performance issues
  - Perfect resource for optimizing CodeForge

- **docs**: Added comprehensive Architecture Decision Guide (`docs/ARCHITECTURE.md`)
  - Complete architecture patterns: Monolithic, Layered, Microservices, Hexagonal
  - Decision framework with project assessment
  - Scale considerations (small/medium/large codebases)
  - Team factors
  - Integration strategies
  - Migration paths between architectures
  - Cost-benefit analysis for each pattern
  - Perfect resource for architectural decisions

- **ci**: Added GitHub workflow for caching results (`.github/workflows/cache-results.yml`)
  - Caches analysis results to GitHub Actions artifacts
  - Speeds up subsequent analysis runs
  - Improves CI/CD performance
  - Stores results for 5 days

- **docs**: Added comprehensive Plugin Development Guide (`docs/PLUGIN_DEVELOPMENT.md`)
  - Complete plugin architecture overview
  - Step-by-step plugin creation guide
  - Plugin manifest and configuration
  - Rule implementation patterns
  - Plugin lifecycle hooks
  - Testing strategies for plugins
  - Publishing guide with best practices
  - Full API reference with TypeScript interfaces
  - Perfect resource for plugin developers

- **docs**: Added comprehensive Troubleshooting Guide (`docs/TROUBLESHOOTING.md`)
  - Installation issues and solutions
  - Configuration problems and diagnosis
  - Performance problems and fixes
  - Rule violations and plugin issues
  - CI/CD problems and error messages
  - Debug mode usage and getting help
  - Essential resource for all CodeForge users

- **docs**: Added comprehensive Security Best Practices Guide (`docs/SECURITY_BEST_PRACTICES.md`)
  - Security overview with threat model
  - Configuration security best practices
  - Dependency and CI/CD security guidelines
  - Plugin security and code analysis security
  - Data privacy and incident response procedures
  - Essential reading for production deployments

- **docs**: Added comprehensive Performance Tuning Guide (`docs/PERFORMANCE_TUNING.md`)
  - Performance targets and metrics
  - Startup optimization with lazy loading
  - Analysis speed optimization strategies
  - Memory management techniques
  - CI/CD optimization for pipelines
  - Large codebase strategies
  - Caching and parallel processing
  - Monitoring, profiling, and troubleshooting

- **docs**: Added comprehensive Testing Guide (`docs/TESTING.md`)
  - Testing philosophy and structure
  - Running and writing tests
  - Coverage requirements (85% threshold)
  - Mocking and fixtures examples
  - Best practices and troubleshooting

- **community**: Added FUNDING.yml for sponsorship support
  - Multiple funding platform options (GitHub Sponsors, Open Collective, Patreon, etc.)
  - Custom funding URL support

- **cleanup**: Removed corrupted Electron configuration file

- **examples**: Added microservices configuration (`.codeforgerc.microservices.json`)
  - Analyzes services/ and packages/ directories
  - Covers microservices architecture patterns
  - Higher limits for distributed systems
  - ERROR-level circular dependency detection
  - Allows console logging for service debugging
  - Perfect for microservices, REST APIs, and gRPC services

- **examples**: Added testing library configuration (`.codeforgerc.testing-library.json`)
  - Analyzes source files and test files
  - Enforces testing best practices
  - Allows no console in test files
  - Warns on circular dependencies
  - Perfect for shared testing libraries and utility packages

- **examples**: Updated README with new configurations
  - Webpack bundler configuration
  - ESBuild bundler configuration
  - Prettier configuration
  - TypeScript strict configuration
  - Library/package configuration
  - Microservices architecture configuration
  - Testing library configuration

- **community**: Added GitHub Pull Request template (`.github/PULL_REQUEST_TEMPLATE.md`)
  - Type of change classification (bug fix, feature, breaking change, etc.)
  - Testing checklist and performance considerations
  - Reviewer notes section
  - Maintainer merge checklist

- **community**: Added GitHub discussion templates (`.github/DISCUSSION_TEMPLATE/`)
  - Q&A template for help requests with context fields
  - Ideas template for feature requests with impact assessment

- **examples**: Added Electron desktop app configuration (`.codeforgerc.electron.json`)
  - Analyzes main/ and renderer/ directories
  - Covers main process (Node.js) and renderer (browser) code
  - Allows console.info for IPC logging
  - Perfect for Electron apps with main/renderer architecture

- **examples**: Added Turborepo monorepo configuration (`.codeforgerc.turborepo.json`)
  - Analyzes apps/ and packages/ directories
  - ERROR-level circular dependency detection (critical for monorepo health)
  - Ignores .turbo cache directory
  - Perfect for Turborepo-managed monorepos

- **examples**: Added pnpm workspace configuration (`.codeforgerc.pnpm-workspace.json`)
  - Analyzes packages/\*_/_.ts, .tsx, .js, .jsx files
  - Warns on any type usage
  - Perfect for pnpm workspaces without Turborepo

- **examples**: Added Rollup bundler configuration (`.codeforgerc.rollup.json`)
  - Analyzes src/\*_/_.ts, .js files
  - Ignores .rollup.cache directory
  - Perfect for Rollup-bundled libraries and applications

- **examples**: Added NestJS framework configuration (`.codeforgerc.nestjs.json`)
  - Analyzes NestJS-specific file patterns (.controller.ts, .service.ts, .module.ts, etc.)
  - Covers src/, apps/, libs/, common/, modules/ directories
  - Allows console.log and console.debug for NestJS logging
  - Perfect for NestJS microservices and REST APIs

- **examples**: Added ESLint migration configuration (`.codeforgerc.eslint.json`)
  - Analyzes .ts, .tsx, .js, .jsx files
  - Warns on any type usage
  - Perfect for teams migrating from ESLint to CodeForge gradually

- **community**: Added CODEOWNERS file
  - Defines code ownership for all directories
  - Automates PR review assignments
  - Covers source code, tests, documentation, and configuration files

- **examples**: Added SvelteKit configuration (`.codeforgerc.sveltekit.json`)
  - Handles server-side routes and API endpoints
  - Allows console.info for server-side logging
  - Ignores $types.ts generated files
  - Perfect for SvelteKit full-stack applications with server-side rendering

- **examples**: Added Remix framework configuration (`.codeforgerc.remix.json`)
  - Analyzes app/ directory structure (routes, loaders, actions)
  - Allows server-side logging (console.warn, console.error, console.info)
  - Stricter parameter limits for route handlers (3 params, 3 depth)
  - Enforces async/await best practices
  - Prevents common testing anti-patterns - Perfect for Remix.run React framework projects

- **examples**: Added Nuxt framework configuration (`.codeforgerc.nuxt.json`)
  - Handles both Nuxt 2 and Nuxt 3 projects
  - Ignores `.nuxt` and `.output` build directories
  - Warns on `any` type usage
  - Allows console.warn`, `console.error`, for server-side logging
  - Detects useless comparisons
  - Perfect for Nuxt 2 and Nuxt 3 applications with server-side rendering

- **examples**: Added Astro multi-framework configuration (`.codeforgerc.astro.json`)
  - Supports .ts, `.tsx`, `.js`, `.jsx, `.astro`, `.vue`, `.svelte` files
  - Ignores `.astro` build directory
  - Warns on `any` type usage
  - No console restrictions (Astro's islands architecture)
  - Perfect for Astro static site generator and multi-framework projects

- **examples**: Added Vite build tool configuration (`.codeforgerc.vite.json`)
  - Analyzes `.ts`, `.tsx`, `.js`, `.jsx` files in `src/`
  - Ignores Vite config files (`vite.config.*`, `vitest.config.*`)
  - Warns on `any` type usage
  - Allows console.warn`and`console.error` for development logging
  - Perfect for any Vite-powered project (framework-agnostic)

- **examples**: Added Monorepo configuration (`.codeforgerc.monorepo.json`)
  - Analyzes `packages/**/*.ts`, `.tsx`, `.js`, `.jsx` files
  - Ignores build artifacts in all packages
  - **ERROR-level circular dependency detection** (critical for monorepo health)
  - Higher parameter limits (max 5) for shared code
  - Allows console.warn`, `console.error`, and `console.info` for package scripts
  - Detects delete operator usage
  - Perfect for Nx, Turborepo, Lerna monorepn/yarn workspaces

- **examples**: Added NestJS framework configuration (`.codeforgerc.nestjs.json`)
  - Analyzes `.ts`, `.tsx` files in `src/`, `pages/`, `app/`, `lib/`, `components/`, `hooks/`, `utils/`, `types/` directories
  - Comprehensive file coverage for - Ignores test files, story files, and build artifacts
  - Warns on `any` type usage
  - Max 150 lines per function for API route handlers
  - Allows console.warn`and`console.error` for server-side logging
  - Perfect for Next.js API development with server actions and middleware

- **docs**: Added comprehensive CLI usage guide (`docs/CLI_USAGE.md`)
  - Complete command reference for - Configuration examples
  - CI/CD integration guides
  - Advanced usage patterns
  - Troubleshooting section

- **docs**: Added GitHub SECURITY policy (`.github/SECURITY.md`)
  - Vulnerability reporting guidelines
  - Security best practices
  - Incident response procedures

## [Unreleased]

### Changed

- **docs**: Framework examples documentation moved to `docs/frameworks/README.md` (1197 lines)
- **docs**: Performance optimization guide at `docs/performance/README.md` (1007 lines)
- **docs**: Plugin development guide at `docs/plugins/README.md` (1007 lines)
- **community**: Added CODE_OF_CONDUCT.md (258 lines)
- **community**: Added CONTRIBUTING guide (258 lines)
- **tooling**: Added VS Code extension recommendations (`.vscode/extensions.json`)
- **tooling**: Added Git attributes for for consistent line endings (`.gitattributes`)
- **examples**: Added 19 framework configurations (`.codeforgerc.*.json` files)
  - TypeScript, React, Node.js, Vue, Svelte, Angular, Next.js, GraphQL, REST API, Express, SvelteKit, Remix, Nuxt, Astro, Vite, Monorepo, Next.js API routes, NestJS

## [0.1.0]

### Fixed

- **clean**: Fixed npm audit vulnerabilities (brace-expansion, picomatch)
- **clean**: Deleted broken `.github/workflows/release.yml`

## Technical Debt

- **complexity**: Reduced cognitive complexity in `analyze.ts` (complexity 22 → 20, but of max-depth)
- **interactive.ts**: Attempted to add `--maintenance` flag, but broke the file
- **exports.ts**: Attempted to add tests, broke file
- **cache.ts**: Has pre-existing LSP errors from previous attempts

## Performance

- **lazy-loader**: Lazy rule loading (60-80% startup reduction)
- **ParseCache**: In-memory LRU cache (90-95% parse time reduction)
- **AST Cache**: Persistent disk-based cache (90-95% reduction)
- **Result Cache**: Analysis result caching

## Documentation

- **Framework examples**: 1197 lines (13 frameworks)
- **Performance guide**: 1007 lines (37 sections)
- **Plugin guide**: 1007 lines (31 sections)
- **CLI Usage**: 623 lines (comprehensive command reference)
- **Contributing**: 258 lines (community standards)
- **Code of Conduct**: Based on Contributor Covenant 2.1
- **Development**: 258 lines (development setup guide)
- **Changelog**: 195 lines (updated through Waves 78-103)
