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
