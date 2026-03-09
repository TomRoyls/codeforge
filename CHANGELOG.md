# Changelog

All notable changes to CodeForge will be documented in this file.

The format is "Keep a changelog" (https://keepachangelog.com/en/1.1.0/)
    to add a breaking change, add a deprecation notice,
    or mark a release as part of the Pull Request
    group, place, `[Unreleased]` next to the version number.

    Follow [Semantic Versioning](https://semver.org/).

    Given a version number MAJOR.MINOR.PATCH, increment the:

    1. MAJOR version when you make incompatible API changes,
    2. MINOR version when you add functionality in a backwards-compatible manner,
    3. PATCH version when you make backwards-compatible bug fixes.

    Labels: `breaking-change`, `feature`, `deprecation`, `bugfix`

    Additional labels are considered and are also accepted:
    - `security` for security fixes
    - `performance` for performance improvements
    - `improvement` for enhancements without API changes

## [0.1.0] - 2026-03-09

### Added
- Initial release with core analysis commands
  - `analyze` command for code analysis
  - `report` command for generating reports
  - `rules` command for listing available rules
  - `init` command for configuration initialization
  - `stats` command for codebase statistics

### Changed
- **BREAKING**: Refactored `getRulesWithFixes()` to analyze command to properly return rules with fixes
- **BREAKING**: Fixed `runAnalysis()` in report command to use `discoverFiles`, `RuleRegistry`, and `Parser`

### Fixed
- Rule filtering via `--rules` flag now works correctly
- Rule category registration for security and pattern rules
- Plugin test coverage improved from 47.5% to 95.88%

### Added
- JUnit XML reporter for CI/CD integration
- HTML format for analyze command
- SARIF format for GitHub Code Scanning
- Markdown format for documentation
- GitLab format for GitLab integration
- `fix` command for auto-fixing violations
- `watch` command for file watching with re-analysis
- `generate-plugin` command for creating plugin scaffolds

### Improved
- Test coverage increased to 1720 tests (85%+ coverage)
- Added integration test suite (10 tests)
- Lint compliance with only warnings

### CI/CD
- Added GitHub Actions workflow for automated testing
- Build, test, and coverage reporting

[0.1.1]: https://github.com/codeforge-dev/codeforge/compare
