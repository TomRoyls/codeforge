# Maintainers Guide

This document provides guidelines for maintainers of the CodeForge project.

## Code Review Guidelines

### Review Checklist

When reviewing pull requests, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Code coverage remains above 85%
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript strict mode compliance
- [ ] Documentation updated if behavior changes
- [ ] Breaking changes documented in CHANGELOG.md
- [ ] New features include tests
- [ ] Bug fixes include regression tests

### Review Priorities

1. **Correctness**: Does the code work as intended?
2. **Performance**: Does it maintain or improve performance?
3. **Maintainability**: Is the code readable and well-structured?
4. **Documentation**: Are changes documented?
5. **Tests**: Are there adequate tests?

## Release Process

### Version Bumping

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backwards compatible
- **PATCH** (0.0.X): Bug fixes, backwards compatible

### Release Checklist

1. Update CHANGELOG.md with release notes
2. Update package.json version
3. Run full test suite: `npm test`
4. Run linting: `npm run lint`
5. Build project: `npm run build`
6. Create git tag: `git tag vX.Y.Z`
7. Push tag: `git push origin vX.Y.Z`
8. Create GitHub release with notes from CHANGELOG.md

## Project Structure

### Key Directories

```
codeforge/
├── src/
│   ├── commands/       # CLI commands (oclif)
│   ├── core/           # Core analysis engine
│   ├── rules/          # Code analysis rules
│   ├── reporters/      # Output formatters
│   ├── cache/          # Performance caching
│   └── utils/          # Shared utilities
├── test/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
└── examples/           # Example configurations
```

### Adding New Commands

1. Create `src/commands/<name>.ts`
2. Extend `Command` from `@oclif/core`
3. Define `static flags` and `static args`
4. Implement `async run()` method
5. Add tests in `test/unit/commands/<name>.test.ts`
6. Update README with command documentation

### Adding New Rules

1. Create `src/rules/<category>/<name>.ts`
2. Implement `RuleDefinition` interface
3. Export from `src/rules/<category>/index.ts`
4. Register in `src/rules/index.ts`
5. Add comprehensive tests
6. Document in `docs/rules/<category>/<name>.md`

## Performance Guidelines

### Caching Strategy

- **ParseCache**: In-memory LRU for parsed ASTs
- **ASTCache**: Disk-based persistent cache
- **ResultCache**: Analysis result caching

### Optimization Principles

1. **Lazy Loading**: Load rules on-demand (see `src/rules/lazy-loader.ts`)
2. **Parallel Processing**: Use `p-limit` for concurrent file analysis
3. **Early Termination**: Stop AST traversal when possible
4. **Caching**: Cache expensive operations

### Benchmarks

Run performance benchmarks:

```bash
npm run benchmark
```

Monitor:

- Startup time (target: <100ms with lazy loading)
- Parse time (target: 90%+ cache hit rate)
- Memory usage (target: <500MB for large projects)

## Security Guidelines

### Vulnerability Response

See [SECURITY.md](SECURITY.md) for responsible disclosure process.

### Dependency Management

- Review Dependabot PRs weekly
- Update dependencies monthly (patch versions)
- Major version updates require maintainer approval
- Run `npm audit` before releases

### Code Security

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized queries for database access
- Sanitize file paths to prevent directory traversal

## Documentation Standards

### Code Comments

- Use JSDoc for public APIs
- Document complex algorithms
- Explain "why", not "what"

### README Updates

When adding features:

1. Add to "Features" section if significant
2. Add to "Commands" section with examples
3. Update help text in command file

### CHANGELOG Format

Follow [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [Unreleased]

### Added

- New feature description

### Changed

- Changed behavior description

### Fixed

- Bug fix description

### Security

- Security fix description
```

## Testing Standards

### Unit Tests

- Test files mirror source structure
- Use Vitest framework
- Mock external dependencies
- Aim for 85%+ coverage

### Integration Tests

- Test complete workflows
- Use temporary directories
- Clean up after tests
- Test error scenarios

### Performance Tests

- Benchmark critical paths
- Monitor memory usage
- Test with large codebases
- Compare against baseline

## Community Guidelines

### Issue Triage

1. Label issues appropriately
2. Respond within 48 hours
3. Provide clear feedback
4. Close duplicates politely

### Pull Request Handling

1. Review within 1 week
2. Provide constructive feedback
3. Test changes locally
4. Merge only when ready

### Communication

- Be respectful and inclusive
- Assume positive intent
- Focus on code, not personality
- Welcome new contributors

## Maintenance Tasks

### Weekly

- Review Dependabot PRs
- Triage new issues
- Check test coverage
- Monitor performance metrics

### Monthly

- Update dependencies (patch versions)
- Review and close stale issues
- Update documentation
- Security audit

### Quarterly

- Review and update ROADMAP.md
- Major dependency updates
- Performance optimization review
- Community feedback analysis

## Contact

For maintainer-only discussions:

- GitHub: @codeforge-dev/codeforge-maintainers
- Email: maintainers@codeforge.dev (if applicable)
