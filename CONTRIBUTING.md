# Contributing to CodeForge

First off, thank you for considering contributing to CodeForge! We welcome contributions from the community and are grateful for your time and effort.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by the [CodeForge Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainers email].

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codeforge.git
   cd codeforge
   ```

## Development Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Build the project**:

   ```bash
   npm run build
   ```

3. **Run tests**:

   ```bash
   npm test
   ```

4. **Run linting**:
   ```bash
   npm run lint
   ```

### IDE Setup

We recommend using **VS Code** with the following extensions:

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Vitest** (`vitest.explorer`)
- **Error Lens** (`username.error-lens`)

These are automatically recommended when you open the project in VS Code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When filing a bug report, please include:

- **CodeForge version**: `codeforge --version`
- **Node.js version**: `node --version`
- **OS and version**: e.g., macOS 13.0, Ubuntu 22.04
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Code sample**: Minimal code example demonstrating the issue

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Use case**: Why is this enhancement needed?
- **Proposed solution**: How would you like it to work?
- **Alternatives considered**: What other approaches did you think about?

### Adding New Rules

CodeForge uses a rule-based architecture. To add a new rule:

1. **Create the rule file** in `src/rules/`:

   ```typescript
   // src/rules/my-rule.ts
   import { Rule } from '../types.js'

   export default {
     meta: {
       name: 'my-rule',
       description: 'Description of what this rule checks',
       category: 'complexity', // or 'patterns', 'security', 'performance'
       recommended: true,
       severity: 'warning', // or 'error'
       fixable: false, // Set to true if auto-fix is possible
     },
     defaultOptions: {
       // Default configuration options
     },
     create(context) {
       return {
         // Rule implementation
       }
     },
   }
   ```

2. **Register the rule** in `src/rules/index.ts`:

   ```typescript
   import myRule from './my-rule.js'

   export const allRules = {
     // ... existing rules
     'my-rule': myRule,
   }
   ```

3. **Add tests** in `test/unit/rules/my-rule.test.ts`

4. **Update documentation** in `docs/rules/my-rule.md`

### Improving Documentation

Documentation improvements are always welcome! You can:

- Fix typos or unclear explanations
- Add missing documentation for features
- Improve code examples
- Add diagrams or flowcharts for complex concepts

Documentation files are in:

- `docs/` - Comprehensive documentation
- `examples/` - Example configurations
- `README.md` - Project overview
- `QUICKSTART.md` - Getting started guide

## Pull Request Process

1. **Create a branch**:

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** following our [style guide](#style-guide)

3. **Run tests and linting**:

   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: brief description of your changes"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, semicolons, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push to your fork**:

   ```bash
   git push origin feature/my-feature
   ```

6. **Open a Pull Request** on GitHub
   - Fill in the PR template completely
   - Link any related issues
   - Add screenshots for UI changes
   - Ensure all CI checks pass

7. **Respond to review feedback**
   - Make requested changes
   - Push new commits to the same branch
   - Keep the PR up to date with the main branch

### PR Requirements

- ✅ All tests must pass
- ✅ Code coverage should not decrease
- ✅ No new lint errors
- ✅ Documentation updated (if applicable)
- ✅ CHANGELOG.md updated (for user-facing changes)
- ✅ Commits follow Conventional Commits format

## Style Guide

### TypeScript

- **Strict mode**: All code must pass TypeScript strict mode
- **No `any`**: Avoid `any` type; use proper types or generics
- **Prefer `const`**: Use `const` over `let` when possible
- **Async/await**: Prefer async/await over raw Promises
- **No unused variables**: Remove or prefix with underscore

### Code Formatting

We use **Prettier** for code formatting. Configuration is in `.prettierrc`:

- Run `npm run format` to format code
- Run `npm run format:check` to check formatting

### Naming Conventions

- **Files**: `kebab-case.ts` for filenames
- **Classes**: `PascalCase` for class names
- **Functions**: `camelCase` for function names
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `IConfig`)

### Comments

- **JSDoc**: Use JSDoc for public APIs:

  ```typescript
  /**
   * Analyzes source code for violations
   * @param filePath - Path to the file to analyze
   * @param options - Analysis options
   * @returns Array of violations found
   */
  export function analyze(filePath: string, options?: AnalysisOptions): Violation[]
  ```

- **Inline comments**: Explain _why_, not _what_:

  ```typescript
  // Good: Explains why
  // Use setTimeout to debounce rapid file changes
  const debounced = setTimeout(fn, 300)

  // Bad: Explains what (obvious)
  // Set timeout to 300
  const debounced = setTimeout(fn, 300)
  ```

### Testing

- **Unit tests**: Place in `test/unit/` mirroring `src/` structure
- **Integration tests**: Place in `test/integration/`
- **Test file naming**: `*.test.ts` or `*.spec.ts`
- **Coverage**: Aim for >90% code coverage
- **Vitest**: We use Vitest for testing

  ```bash
  # Run tests
  npm test

  # Run tests in watch mode
  npm run test:watch

  # Run tests with coverage
  npm run test:coverage
  ```

## Community

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Pull Requests**: For code contributions

### Getting Help

- Check existing [documentation](docs/)
- Search [GitHub Issues](https://github.com/omo-earth/codeforge/issues)
- Ask in [GitHub Discussions](https://github.com/omo-earth/codeforge/discussions)

### Staying Updated

- Watch the repository on GitHub
- Follow the [CHANGELOG.md](CHANGELOG.md) for updates
- Check the [Roadmap](ROADMAP.md) for planned features

---

Thank you for contributing to CodeForge! Your efforts help make this project better for everyone. 🚀
