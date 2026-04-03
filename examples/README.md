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

```bash
# For TypeScript projects
cp examples/.codeforgerc.typescript.json .codeforgerc.json

# For React projects
cp examples/.codeforgerc.react.json .codeforgerc.json

# For Node.js projects
cp examples/.codeforgerc.nodejs.json .codeforgerc.json

# For Vue.js projects
cp examples/.codeforgerc.vue.json .codeforgerc.json

# For Svelte projects
cp examples/.codeforgerc.svelte.json .codeforgerc.json

# For Angular projects
cp examples/.codeforgerc.angular.json .codeforgerc.json

# For Next.js projects
cp examples/.codeforgerc.nextjs.json .codeforgerc.json

# For GraphQL projects
cp examples/.codeforgerc.graphql.json .codeforgerc.json

# For REST API projects
cp examples/.codeforgerc.rest-api.json .codeforgerc.json

# For minimal enforcement
cp examples/.codeforgerc.minimal.json .codeforgerc.json

# For strict enforcement
cp examples/.codeforgerc.strict.json .codeforgerc.json
```

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
