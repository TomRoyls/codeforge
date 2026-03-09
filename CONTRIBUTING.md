# Contributing to CodeForge

Thank you for your interest in contributing to CodeForge! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites
- Node.js 20.0.0 or higher
- npm 9.0.0 or higher

### Getting Started

```bash
# Clone the repository
git clone https://github.com/codeforge-dev/codeforge.git
cd codeforge

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run locally
./bin/run.js --help
```

## Development Workflow

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run test` | Run tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Vitest with 85% coverage threshold

### Code Quality Standards

- All code must pass `npm run lint` without errors
- All code must pass TypeScript strict mode
- All new code must have tests
- Test coverage must not drop below 85%

## Adding New Rules

1. Create a new file in `src/rules/<category>/<rule-name>.ts`
2. Implement the `RuleDefinition` interface from `src/rules/types.ts`
3. Export the rule from `src/rules/<category>/index.ts`
4. Add the rule to `src/rules/index.ts`
5. Add tests in `test/unit/rules/<category>/<rule-name>.test.ts`

### Rule Structure

```typescript
import type { RuleDefinition } from '../../rules/types.js';

export const myRule: RuleDefinition = {
  meta: {
    id: 'my-rule',
    description: 'Description of what this rule checks',
    severity: 'error', // 'error' | 'warning' | 'info'
    category: 'complexity',
  },
  create(options) {
    return {
      visitor: {
        visitNode(node, context) {
          // Rule implementation
        },
      },
    };
  },
};
```

## Adding New Reporters

1. Create a new file in `src/reporters/<name>-reporter.ts`
2. Implement the reporter interface
3. Register in `src/reporters/index.ts`
4. Add tests in `test/unit/reporters/<name>-reporter.test.ts`

## Git Workflow

### Branch Naming

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `refactor/<description>` - Code refactoring
- `docs/<description>` - Documentation changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Update documentation if needed
6. Submit a pull request

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx vitest run test/unit/rules/complexity/max-complexity.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- Unit tests go in `test/unit/`
- Integration tests go in `test/integration/`
- Test files should mirror source file structure

## License

By contributing to CodeForge, you agree that your contributions will be licensed under the MIT License.
