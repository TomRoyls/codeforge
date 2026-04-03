# Development Guide

# Development Environment

## IDE Setup

- **VS Code**: Recommended editor with official TypeScript/JavaScript support
- **Extensions**:
  - ESLint (dbaeumer.vscode-eslint)
  - Pnpm Intellisense (recommended)
  - GitLens (optional but helpful)
- **Node.js**: 20.0.0 or higher
- **npm**: 9.0.0 or higher

## Workspace Setup

```bash
# Clone the repository
git clone https://github.com/codeforge-dev/codeforge.git
cd codeforge

# Install dependencies
npm install

# Open in VS Code
code .
```

## Environment Variables

Create `.env` file in the root:

```env
# Optional: Use a specific cache directory
CODEFORGE_CACHE_DIR=/tmp/codeforge-cache

# Optional: Enable debug mode
codeforge_debug=true
```

## Development Workflow

### Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run specific test file
npx vitest run test/unit/commands/analyze.test.ts

# Run linting
npm run lint

# Format code
npm run format
```

## Debugging

### Using the VS Code Debugger

1. Set breakpoints in your code
2. Use the Debug Console (View > Debug Console)
3. Step through code with F5 or F10
4. Inspect variables in Debug Console

5. Use launch.json for launch configurations:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/bin/run.js",
      "args": ["--help"],
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach",
      "program": "${workspaceFolder}/bin/run.js",
      "args": ["--version"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Using the Node.js Debugger

```bash
# Start debugging
node --inspect bin/run.js --port 9229

# Set breakpoint
node --inspect bin/run.js --port 9229
# Continue execution
node --inspect bin/run.js --port 9229
```

## Testing Strategy

### Unit Tests

- Located in `test/unit/`
- Mirror source file structure
- Run with: `npm test`
- Coverage threshold: 85%

### Integration Tests

- Located in `test/integration/`
- Test complete workflows
- Run with: `npm run test:integration`

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html
```

## Performance Profiling

### Using the Chrome DevTools

1. Open Chrome DevTools (F12 or View > Developer Tools > Performance)
2. Start profiling
3. Analyze flame charts
4. Identify bottlenecks

### Using the Node.js Profiler

```bash
# Start profiler
node --prof bin/run.js --port 9229

# Analyze results
node --prof-process bin/run.js --port 9229
```

## Common Issues

### Build Errors

```bash
# Clear build cache
npm run clean

# Rebuild
npm run build
```

### Test Failures

```bash
# Run specific test in watch mode
npx vitest watch test/unit/commands/analyze.test.ts

# Update snapshots for failing tests
```

### Linting Errors

```bash
# Auto-fix linting issues
npm run lint:fix

# Re-run linting
npm run lint
```

## Useful Commands

### Code Analysis

```bash
# Analyze current directory
./bin/run.js analyze

# Analyze with specific rules
./bin/run.js analyze --rules no-console,no-any
# Generate detailed report
./bin/run.js analyze --format json --output report.json
```

### Code Quality

```bash
# Show project statistics
./bin/run.js stats

# Show health score
./bin/run.js health

# Show technical debt
./bin/run.js debt
```

### Cache Management

```bash
# View cache status
./bin/run.js cache

# Clear cache
./bin/run.js cache clear
```

## Tips

- \*\*Use `npm run dev` during development for faster feedback
- \*\*Run `npm run lint:fix` frequently to coding
- \*\*Keep test coverage above 85%
- \*\*Use meaningful commit messages following conventional commits
- \*\*Test your changes before submitting PRs
- \*\*Update documentation when changing behavior
- \*\*Run the full test suite before merging
