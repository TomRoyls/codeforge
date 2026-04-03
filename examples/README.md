# CodeForge Example Configurations

This directory contains example configuration files for different project types.

## Available Examples

### `.codeforgerc.typescript.json`

Recommended configuration for TypeScript projects (libraries, Node.js applications).

**Features**:

- Analyzes `.ts` files in `src/`
- Ignores test files and common build directories
- Enables essential rules: `no-any`, `no-unused-vars`, `prefer-const`
- Warns on circular dependencies and complexity issues
- Warns on `console` usage

### `.codeforgerc.react.json`

Recommended configuration for React/TypeScript projects.

**Features**:

- Analyzes `.ts` and `.tsx` files
- Stricter parameter limits (max 3)
- Allows `console.warn` and `console.error`
- Enables `prefer-readonly` for immutability
- Detects useless comparisons

### `.codeforgerc.nodejs.json`

Recommended configuration for Node.js projects (backend services, APIs).

**Features**:

- Analyzes `.ts` and `.js` files
- Allows `console.warn`, `console.error`, and `console.info`
- Higher parameter limits (max 5)
- Detects `delete` operator usage
- Enables template literals over string concatenation

### `.codeforgerc.vue.json`

Recommended configuration for Vue.js projects.

**Features**:

- Analyzes `.ts`, `.vue`, and `.js` files
- Warns on `any` type usage
- Allows `console.warn` and `console.error`
- Moderate parameter limits (max 4)
- Detects `delete` operator usage

### `.codeforgerc.svelte.json`

Recommended configuration for Svelte projects.

**Features**:

- Analyzes `.ts`, `.svelte`, and `.js` files
- Ignores `.svelte-kit` directory
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Detects useless comparisons

### `.codeforgerc.sveltekit.json`

Recommended configuration for SvelteKit full-stack applications.

**Features**:

- Analyzes `.ts`, `.svelte`, and `.js` files in `src/` and `src/routes/`
- Ignores `.svelte-kit` build directory and `$types.ts` generated files
- Warns on `any` type usage
- Allows `console.warn`, `console.error`, and `console.info` for server-side logging
- Moderate parameter limits (max 4)
- Detects useless comparisons and enforces template literals
- Perfect for SvelteKit apps with server-side routes and API endpoints

### `.codeforgerc.remix.json`

Recommended configuration for Remix.run React framework projects.

**Features**:

- Analyzes `.ts`, `.tsx`, `.js`, `.jsx` files in `app/` directory
- Covers Remix's app directory structure (routes, loaders, actions)
- Ignores `build` and `public/build` directories
- Warns on `any` type usage
- Stricter parameter limits (max 3) for route loaders/actions
- Allows `console.warn`, `console.error`, and `console.info` for server-side logging
- Detects useless comparisons and empty functions
- Enforces template literals for better string handling
- Perfect for Remix apps with server-side rendering and data loading

### `.codeforgerc.nuxt.json`

Recommended configuration for Nuxt.js Vue meta-framework projects.

**Features**:

- Analyzes `.ts`, `.vue`, and `.js` files
- Ignores `.nuxt` and `.output` build directories
- Warns on `any` type usage
- Allows `console.warn`, `console.error`, and `console.info` for server-side logging
- Moderate parameter limits (max 4)
- Detects useless comparisons and delete operator usage
- Enforces template literals for better string handling
- Perfect for Nuxt 2 and Nuxt 3 applications with server-side rendering

### `.codeforgerc.angular.json`

Recommended configuration for Angular projects.

**Features**:

- Analyzes `.ts` and `.html` files
- Ignores test files (`*.spec.ts`, `*.e2e.ts`)
- Ignores environment files
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Detects useless comparisons and delete operator

### `.codeforgerc.nextjs.json`

Recommended configuration for Next.js projects (Pages Router, App Router, or hybrid).

**Features**:

- Analyzes `.ts`, `.tsx`, `.js`, `.jsx` files
- Covers multiple directories: `src/`, `app/`, `pages/`
- Ignores `.next` build directory
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Detects useless comparisons
- Perfect for Next.js 13+ with App Router

### `.codeforgerc.nextjs-routes.json`

Recommended configuration for Next.js API routes and server-side code.

**Features**:

- Comprehensive file coverage: `src/`, `pages/`, `app/`, `lib/`, `components/`, `hooks/`, `utils/`, `types/`
- Ignores test files, story files, and build artifacts
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Max 150 lines per function for API route handlers
- Allows `console.warn` and `console.error` for server-side logging
- Perfect for Next.js API routes, server actions, and middleware

### `.codeforgerc.graphql.json`

Recommended configuration for GraphQL API projects.

**Features**:

- Analyzes `.ts` and `.js` files
- Ignores `__generated__` directories (auto-generated GraphQL code)
- Warns on `any` type usage
- Moderate parameter limits (max 4)
- Detects useless comparisons and delete operator
- Perfect for GraphQL servers and resolvers

### `.codeforgerc.rest-api.json`

Recommended configuration for REST API projects (Express, Fastify, Koa, etc.).

**Features**:

- Analyzes `.ts` and `.js` files
- Allows `console.warn`, `console.error`, and `console.info` for API logging
- Higher parameter limits (max 5)
- Detects delete operator usage
- Enables template literals for better string handling
- Perfect for backend services and REST APIs

### `.codeforgerc.express.json`

Recommended configuration for Express.js backend applications.

**Features**:

- Analyzes `.ts` and `.js` files
- Ignores test and spec files
- Warns on `any` type usage
- Moderate parameter limits (max 3)
- Allows `console.warn` and `console.error` for logging
- Detects circular dependencies
- Prefers `const` and template literals
- Perfect for Express.js microservices and APIs

### `.codeforgerc.react-testing.json`

Recommended configuration for React projects using Testing Library.

**Features**:

- Analyzes `.ts`, `.tsx`, `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx` files
- Includes test files in analysis for comprehensive coverage
- Warns on `any` type usage
- Moderate parameter limits (max 3)
- Allows `console.warn` and `console.error` in tests
- Enforces async/await best practices
- Detects useless catch blocks and empty functions
- Perfect for React applications with comprehensive test coverage

### `.codeforgerc.jest-react.json`

Recommended configuration for Jest + React Testing Library projects.

**Features**:

- Analyzes source files and all test/spec files
- Enforces TypeScript best practices with strict rules
- Warns on `any` type and circular dependencies
- Limits function complexity (max 3 params, max 3 depth)
- Enforces async/await best practices
- Prevents common testing anti-patterns
- Perfect for React applications using Jest and React Testing Library

### `.codeforgerc.astro.json`

Recommended configuration for Astro multi-framework static site builder projects.

**Features**:

- Analyzes `.ts`, `.tsx`, `.js`, `.jsx`, `.astro`, `.vue`, and `.svelte` files
- Ignores `.astro` build directory
- Warns on `any` type usage
- No console warnings (Astro's islands architecture minimizes console usage)
- Moderate parameter limits (max 4)
- Enforces `const` declarations and template literals
- Perfect for Astro projects using React, Vue, Svelte, or multiple frameworks
- Supports component islands and static site generation

### `.codeforgerc.vite.json`

Recommended configuration for Vite-based projects (vanilla JS/TS, React, Vue, Svelte, etc.).

**Features**:

- Analyzes `.ts`, `.tsx`, `.js`, `.jsx` files in `src/`
- Ignores Vite config files (`vite.config.*`, `vitest.config.*`)
- Warns on `any` type usage
- Allows `console.warn` and `console.error` for development logging
- Moderate parameter limits (max 4)
- Detects useless comparisons and circular dependencies
- Enforces `const` declarations and template literals
- Perfect for any Vite-powered project (framework-agnostic)

### `.codeforgerc.monorepo.json`

Recommended configuration for monorepo projects (Nx, Turborepo, Lerna, pnpm workspaces).

**Features**:

- Analyzes `packages/**/*.ts`, `.tsx`, `.js`, `.jsx` files
- Ignores build artifacts in all packages (`**/node_modules`, `**/dist`, `**/build`)
- Higher parameter limits (max 5) for shared code and utilities
- Allows `console.warn`, `console.error`, and `console.info` for package scripts
- **ERROR-level circular dependency detection** (critical for monorepo health)
- Detects delete operator usage
- Perfect for multi-package repositories with shared dependencies
- Works with Nx, Turborepo, Lerna, and pnpm/yarn workspaces

### `.codeforgerc.minimal.json`

Minimal configuration for projects wanting light enforcement.

**Features**:

- Analyzes `.ts` and `.js` files
- Only warns on violations (no errors)
- Minimal rule set: unused vars, circular deps, useless comparisons
- Perfect for gradually introducing CodeForge

### `.codeforgerc.strict.json`

Strict configuration for maximum code quality.

**Features**:

- All rules set to `error` (no warnings)
- Stricter limits on complexity
- No `console` usage allowed
- Detects deprecated APIs and `eval` usage

## Usage

Copy the appropriate example to your project root:

### `.codeforgerc.monorepo.json`

Recommended configuration for monorepo projects (Nx, Turborepo, Lerna, pnpm workspaces).

**Features**:

- Analyzes `packages/**/*.ts`, `.tsx`, `.js`, `.jsx` files
- Ignores build artifacts in all packages (`**/node_modules`, `**/dist`, `**/build`)
- Higher parameter limits (max 5) for shared code and utilities
- Allows `console.warn`, `console.error`, and `console.info` for package scripts
- **ERROR-level circular dependency detection** (critical for monorepo health)
- Detects delete operator usage
- Perfect for multi-package repositories with shared dependencies
- Works with Nx, Turborepo, Lerna, and pnpm/yarn workspaces

### `.codeforgerc.electron.json`

Recommended configuration for Electron desktop applications.

**Features**:

- Analyzes `main/` and `renderer/` directories
- Covers main process (Node.js) and renderer (browser) code
- Ignores test files and build artifacts
- Warns on `any` type usage
- Allows `console.warn`, `console.error`, `console.info` for IPC logging
- Moderate parameter limits (max 4)
- Detects useless comparisons and circular dependencies
- Enforces `const` declarations and template literals
- Perfect for Electron apps with main/renderer process architecture

### `.codeforgerc.turborepo.json`

Recommended configuration for Turborepo monorepo build systems.

**Features**:

- Analyzes `apps/` and `packages/` directories
- Ignores `.turbo` cache directory
- Warns on `any` type usage
- Allows `console.warn`, `console.error`, `console.info` for build scripts
- **ERROR-level circular dependency detection** (critical for monorepo health)
- Detects useless comparisons
- Enforces `const` declarations and template literals
- Perfect for Turborepo-managed monorepos

### `.codeforgerc.pnpm-workspace.json`

Recommended configuration for pnpm workspace projects.

**Features**:

- Analyzes `packages/**/*.ts`, `.tsx`, `.js`, `.jsx` files
- Ignores build artifacts in all packages (`**/node_modules`, `**/dist`, `**/build`)
- Warns on `any` type usage
- Allows `console.warn`, `console.error`, `console.info` for package scripts
- Moderate parameter limits (max 4)
- Detects useless comparisons and circular dependencies
- Enforces `const` declarations and template literals
- Perfect for pnpm workspaces (monorepo without Turborepo)

### `.codeforgerc.rollup.json`

Recommended configuration for Rollup bundler projects.

**Features**:

- Analyzes `src/**/*.ts`, `.js` files
- Ignores `.rollup.cache` directory
- Warns on `any` type usage
- Allows `console.warn` and `console.error` for build logging
- Moderate parameter limits (max 4)
- Detects useless comparisons and circular dependencies
- Enforces `const` declarations and template literals
- Perfect for Rollup-bundled libraries and applications

### `.codeforgerc.nestjs.json`

Recommended configuration for NestJS backend applications.

**Features**:

- Analyzes NestJS-specific file patterns (`.controller.ts`, `.service.ts`, `.module.ts`, `.guard.ts`, `.middleware.ts`, `.dto.ts`, `.entity.ts`, `.decorator.ts`, `.pipe.ts`, `.filter.ts`, `.gateway.ts`, `.interceptor.ts`, `.resolver.ts`)
- Covers `src/`, `apps/`, `libs/`, `common/`, `modules/` directories
- Ignores test files and e2e test files
- Warns on `any` type usage
- Allows `console.warn`, `console.error`, `console.log`, `console.debug` for NestJS logging
- Moderate parameter limits (max 4)
- Detects useless comparisons, circular dependencies, and delete operator usage
- Enforces `const` declarations and template literals
- Perfect for NestJS microservices and REST APIs

### `.codeforgerc.eslint.json`

Recommended configuration for projects using ESLint with CodeForge alongside.

**Features**:

- Analyzes `.ts`, `.tsx`, `.js`, `.jsx` files
- Ignores test and spec files
- Warns on `any` type usage
- Allows `console.warn` and `console.error` for logging
- Moderate parameter limits (max 3)
- Detects circular dependencies
- Enforces `const` declarations and template literals
- Perfect for teams migrating from ESLint to CodeForge gradually

## Usage

Then customize it for your project's specific needs.

## Customization

All configurations can be customized by:

1. **Adjusting file patterns**: Modify `files` and `ignore` arrays
2. **Changing rule severity**: Switch between `"error"`, `"warning"`, or `"off"`
3. **Configuring rule options**: Pass options to rules using arrays: `["error", { "max": 5 }]`

## Best Practices

1. **Start lenient**: Begin with `typescript` or `react` configs
2. **Gradually increase strictness**: Move to `strict` as your codebase matures
3. **CI integration**: Use `--fail-on-warnings` in CI to enforce standards
4. **Regular updates**: Review and update your config as your project evolves
