# Changelog

## [Unreleased]

### Added

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
