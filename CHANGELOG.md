# Changelog

All notable changes to CodeForge will be documented in this file.

The format is "Keep a changelog" (https://keepachangelog.com/en/1.1.0/)
to add a breaking change, add a deprecation notice,
or mark a release as part of the Pull Request
group, place `[Unreleased]` next to the version number.

    Follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **score**: Added comprehensive tests for `calculateCorrectnessScore`, `formatScore`, and edge cases
- **analyze**: Added `--max-warnings` flag for CI threshold control
- **analyze**: Added `--fail-on-warnings` flag for strict warning handling
- **analyze**: Added `--staged` flag to analyze only git staged files
- **analyze**: Added `--concurrency` flag to control parallel processing
- **analyze**: Added `--ext` flag to filter by file extensions (e.g., --ext .ts,.tsx)
- **analyze**: Added `--severity-level` flag to filter violations by minimum severity
- **analyze**: Added `--ignore-path` flag to read ignore patterns from file
- **analyze**: Added `--color/--no-color` flags for explicit color control
- **fix**: Added `--concurrency` flag to control parallel processing
- **report**: Added `--concurrency` flag to control parallel processing
- **init**: Added `--dir` flag to specify config directory
- **rules**: Added `--search` flag to filter rules by keyword
- **stats**: Added `--output` flag to save results to file
- **stats**: Added `--ext` flag to filter by file extensions
- **stats**: Added CSV format option for machine-readable output
- **ci**: GitHub Actions workflow now uploads SARIF to GitHub Advanced Security
- **ci**: GitLab CI now generates Code Quality report for merge request widget integration
- **console-reporter**: Violations are now sorted by severity (errors → warnings → info)
- **command-helpers**: Warning message when unknown rules are specified via `--rules` flag
- **options-helpers**: New utility function `extractRuleOptions<T>` for cleaner options extraction
- **generate-plugin**: Added output directory validation
- **ci**: Added output directory validation
- **stats**: Added path validation

### Fixed

- **types**: Replaced unsafe `as unknown as` casts with proper TypeScript type predicates in `no-misused-promises` rule
- **types**: Removed redundant `as unknown as` cast in `visualize` command
- **analyze**: Removed duplicate flag character `f` from format flag (was conflicting with files flag)
- **parser**: Replaced `console.warn` with logger for consistency
- **watcher**: Replaced `console.warn` with logger for consistency
- **precommit**: Fixed bug where default command referenced non-existent `--staged` flag

### Refactored

- **rules**: Applied `extractRuleOptions` utility across 25+ rule files to reduce code duplication
- **commands**: Replaced `console.*` calls with `logger.*` throughout codebase

### Tests

- Test coverage increased to 10313 tests (90.9% coverage)
- Upgraded test framework to Vitest 4
- Added 27 new tests for env-parser utility
- Added parser benchmark tests for performance monitoring

### Performance

- **parser**: Added concurrent file parsing with p-limit (70-90% faster for large codebases)
- **stats**: Reduced memory footprint by storing file size instead of full content
- **reporters**: Optimized severity counting from O(3n) to O(n) with single-pass algorithm

### Fixed

- **vitest**: Fixed mock constructor patterns for Vitest 4 compatibility across 18+ test files
- **explain**: Replaced `any` types with proper `RuleMeta` interface for better type safety
- **types**: Added `RuleDocs` interface with `fixable` and `severity` properties

### Dependencies

- Updated @typescript-eslint packages to 8.57.2
- Updated vitest and @vitest/coverage-v8 to 4.1.2
- Updated chalk to 5.6.2
- Updated fast-glob to 3.3.3
- Updated prettier to 3.8.1
- Updated ts-morph to 25.0.1

## [0.1.1]

### Added

- Test coverage increased to 1720 tests (85%+ coverage)
- Added integration test suite (10 tests)
- Lint compliance with only warnings

### CI/CD

- Added GitHub Actions workflow for automated testing
  - Build, test, and coverage reporting

[0.1.0]: Initial release
