# CodeForge

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/codeforge.svg)](https://npmjs.org/package/codeforge)
[![Downloads/week](https://img.shields.io/npm/dw/codeforge.svg)](https://npmjs.org/package/codeforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**High-performance code analysis CLI tool for modern development workflows.**

## Vision

CodeForge is a blazing-fast, extensible CLI tool designed to help developers understand, analyze, and improve their codebases. Built with performance in mind, it leverages modern tooling like SWC for fast parsing and ts-morph for deep TypeScript analysis.

### Key Features

- **Fast Analysis**: Powered by SWC for rapid code parsing
- **TypeScript Native**: Full TypeScript support with ts-morph
- **Extensible**: Plugin architecture via Oclif
- **Parallel Processing**: Efficient multi-file analysis with p-limit
- **Beautiful Output**: Colorized, formatted output with chalk and ora

## Requirements

- Node.js 20.0.0 or higher
- npm 9.0.0 or higher

## Installation

```bash
# Install globally
npm install -g codeforge

# Or use with npx
npx codeforge --help
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/codeforge-dev/codeforge.git
cd codeforge

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
./bin/run.js --help
```

### Available Scripts

| Script                  | Description                      |
| ----------------------- | -------------------------------- |
| `npm run build`         | Compile TypeScript to JavaScript |
| `npm run test`          | Run tests with Vitest            |
| `npm run test:watch`    | Run tests in watch mode          |
| `npm run test:coverage` | Run tests with coverage report   |
| `npm run lint`          | Run ESLint                       |
| `npm run lint:fix`      | Fix ESLint issues                |
| `npm run format`        | Format code with Prettier        |
| `npm run format:check`  | Check code formatting            |

### Project Structure

```
codeforge/
├── bin/              # CLI entry points
├── src/
│   ├── commands/     # CLI commands
│   └── index.ts      # Main entry point
├── test/             # Test files
├── dist/             # Compiled output
└── coverage/         # Test coverage reports
```

## Testing

CodeForge uses Vitest for testing with an 85% coverage threshold.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

<!-- toc -->
* [CodeForge](#codeforge)
* [Install globally](#install-globally)
* [Or use with npx](#or-use-with-npx)
* [Clone the repository](#clone-the-repository)
* [Install dependencies](#install-dependencies)
* [Build the project](#build-the-project)
* [Run locally](#run-locally)
* [Run all tests](#run-all-tests)
* [Run tests in watch mode](#run-tests-in-watch-mode)
* [Generate coverage report](#generate-coverage-report)
* [Usage](#usage)
* [Fail on any errors](#fail-on-any-errors)
* [Fail on errors or warnings](#fail-on-errors-or-warnings)
* [CI mode (JSON output, no colors, no progress)](#ci-mode-json-output-no-colors-no-progress)
* [Combine CI mode with fail-on-warnings](#combine-ci-mode-with-fail-on-warnings)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g codeforge
$ codeforge COMMAND
running command...
$ codeforge (--version)
codeforge/0.1.0 linux-x64 node-v25.8.1
$ codeforge --help [COMMAND]
USAGE
  $ codeforge COMMAND
...
```
<!-- usagestop -->

## Exit Codes

CodeForge uses standard exit codes for CI/CD integration:

| Exit Code | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `0`       | Success - No errors found                                    |
| `1`       | Errors found - Analysis detected error-level violations      |
| `2`       | Warnings treated as errors (when using `--fail-on-warnings`) |

### Example CI Usage

```bash
# Fail on any errors
codeforge analyze src/

# Fail on errors or warnings
codeforge analyze src/ --fail-on-warnings

# CI mode (JSON output, no colors, no progress)
codeforge analyze src/ --ci

# Combine CI mode with fail-on-warnings
codeforge analyze src/ --ci --fail-on-warnings
```

# Commands

<!-- commands -->
* [`codeforge analyze [PATH]`](#codeforge-analyze-path)
* [`codeforge benchmark [PATH]`](#codeforge-benchmark-path)
* [`codeforge cache [ACTION]`](#codeforge-cache-action)
* [`codeforge ci`](#codeforge-ci)
* [`codeforge config`](#codeforge-config)
* [`codeforge config validate`](#codeforge-config-validate)
* [`codeforge config visualize`](#codeforge-config-visualize)
* [`codeforge debt [PATH]`](#codeforge-debt-path)
* [`codeforge diff [BASE] [HEAD]`](#codeforge-diff-base-head)
* [`codeforge docs`](#codeforge-docs)
* [`codeforge doctor`](#codeforge-doctor)
* [`codeforge fix [FILES]`](#codeforge-fix-files)
* [`codeforge generate-plugin NAME`](#codeforge-generate-plugin-name)
* [`codeforge health [PATH]`](#codeforge-health-path)
* [`codeforge help [COMMAND]`](#codeforge-help-command)
* [`codeforge init`](#codeforge-init)
* [`codeforge interactive [PATH]`](#codeforge-interactive-path)
* [`codeforge lib _base`](#codeforge-lib-_base)
* [`codeforge migrate`](#codeforge-migrate)
* [`codeforge organize-imports [PATH]`](#codeforge-organize-imports-path)
* [`codeforge plugins`](#codeforge-plugins)
* [`codeforge plugins add PLUGIN`](#codeforge-plugins-add-plugin)
* [`codeforge plugins:inspect PLUGIN...`](#codeforge-pluginsinspect-plugin)
* [`codeforge plugins install PLUGIN`](#codeforge-plugins-install-plugin)
* [`codeforge plugins link PATH`](#codeforge-plugins-link-path)
* [`codeforge plugins remove [PLUGIN]`](#codeforge-plugins-remove-plugin)
* [`codeforge plugins reset`](#codeforge-plugins-reset)
* [`codeforge plugins uninstall [PLUGIN]`](#codeforge-plugins-uninstall-plugin)
* [`codeforge plugins unlink [PLUGIN]`](#codeforge-plugins-unlink-plugin)
* [`codeforge plugins update`](#codeforge-plugins-update)
* [`codeforge precommit`](#codeforge-precommit)
* [`codeforge report [PATH]`](#codeforge-report-path)
* [`codeforge rules`](#codeforge-rules)
* [`codeforge stats [PATH]`](#codeforge-stats-path)
* [`codeforge watch [FILES]`](#codeforge-watch-files)

## `codeforge analyze [PATH]`

Analyze code for violations and issues

```
USAGE
  $ codeforge analyze [PATH] [--ci] [--color] [--concurrency <value>] [-c <value>] [--dry-run] [--ext
    <value>] [--fail-on-warnings] [-f <value>...] [--fix] [--format console|html|json|junit|markdown|sarif|gitlab|csv]
    [-i <value>...] [--ignore-path <value>] [--max-warnings <value>] [-o <value>] [-q] [-r <value>...] [--severity-level
    error|info|warning] [--staged] [-v]

ARGUMENTS
  [PATH]  [default: .] Path to analyze (file or directory)

FLAGS
  -c, --config=<value>           Path to config file
  -f, --files=<value>...         Glob patterns for files to analyze
  -i, --ignore=<value>...        Patterns to ignore
  -o, --output=<value>           Output file path
  -q, --quiet                    Suppress progress output
  -r, --rules=<value>...         Specific rules to run
  -v, --verbose                  Show detailed output
      --ci                       Run in CI mode (disables colors, progress, sets JSON output)
      --[no-]color               Control color output in terminal
      --concurrency=<value>      [default: 4] Number of files to process in parallel
      --dry-run                  Preview fixes without applying them (use with --fix)
      --ext=<value>              Comma-separated file extensions to analyze (e.g., ".ts,.tsx")
      --fail-on-warnings         Exit with error code on warnings
      --fix                      Automatically fix violations where possible
      --format=<option>          [default: console] Output format
                                 <options: console|html|json|junit|markdown|sarif|gitlab|csv>
      --ignore-path=<value>      Path to ignore file (one pattern per line)
      --max-warnings=<value>     [default: -1] Number of warnings to trigger a non-zero exit code (-1 to ignore)
      --severity-level=<option>  [default: info] Minimum severity level to report (error, warning, info)
                                 <options: error|info|warning>
      --staged                   Analyze only staged files in git

DESCRIPTION
  Analyze code for violations and issues

EXAMPLES
  Analyze current directory

    $ codeforge analyze

  Analyze the src directory

    $ codeforge analyze src/

  Analyze only staged files

    $ codeforge analyze --staged

  Analyze TypeScript files only

    $ codeforge analyze --files "**/*.ts"

  Ignore test directory

    $ codeforge analyze --ignore "**/test/**"

  Output results as JSON to file

    $ codeforge analyze --format json --output report.json

  Run specific rules only

    $ codeforge analyze --rules no-circular-deps,max-params

  Fail if more than 10 warnings found

    $ codeforge analyze --max-warnings 10

  Process 4 files in parallel

    $ codeforge analyze --concurrency 4

  Analyze only TypeScript files

    $ codeforge analyze --ext .ts,.tsx

  Show only warnings and errors (no info)

    $ codeforge analyze --severity-level warning

  Use custom ignore file

    $ codeforge analyze --ignore-path .codeforgeignore
```

_See code: [src/commands/analyze.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/analyze.ts)_

## `codeforge benchmark [PATH]`

Benchmark rule performance on a codebase

```
USAGE
  $ codeforge benchmark [PATH] [-i <value>] [-o <value>] [-r <value>...] [-t <value>] [--warmup]

ARGUMENTS
  [PATH]  [default: .] Path to benchmark (file or directory)

FLAGS
  -i, --iterations=<value>  [default: 3] Number of iterations per rule
  -o, --output=<value>      Output file for benchmark results (JSON)
  -r, --rules=<value>...    Specific rules to benchmark (comma-separated)
  -t, --top=<value>         [default: 20] Number of top slowest rules to show
      --warmup              Run warmup iteration before benchmarking

DESCRIPTION
  Benchmark rule performance on a codebase

EXAMPLES
  Benchmark all rules on current directory

    $ codeforge benchmark

  Benchmark on src directory

    $ codeforge benchmark src/

  Show top 10 slowest rules

    $ codeforge benchmark --top 10

  Run 5 iterations for more accurate results

    $ codeforge benchmark --iterations 5
```

_See code: [src/commands/benchmark.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/benchmark.ts)_

## `codeforge cache [ACTION]`

Manage the CodeForge cache

```
USAGE
  $ codeforge cache [ACTION] [-c | -s] [-p <value>]

ARGUMENTS
  [ACTION]  (status|clear) [default: status] Cache action to perform

FLAGS
  -c, --clear         Clear the cache
  -p, --path=<value>  Custom cache path
  -s, --status        Show cache status

DESCRIPTION
  Manage the CodeForge cache

EXAMPLES
  Show cache status

    $ codeforge cache

  Show detailed cache status

    $ codeforge cache status

  Clear the cache

    $ codeforge cache clear

  Clear the cache using flag

    $ codeforge cache --clear

  Show cache status using flag

    $ codeforge cache --status

  Use a custom cache path

    $ codeforge cache --path ./custom-cache
```

_See code: [src/commands/cache.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/cache.ts)_

## `codeforge ci`

Generate CI/CD configuration files for GitHub Actions and GitLab CI

```
USAGE
  $ codeforge ci [-f] [-o <value>] [-p github|gitlab|all]

FLAGS
  -f, --force              Overwrite existing CI configuration files
  -o, --output=<value>     [default: .] Output directory for generated files
  -p, --platform=<option>  [default: all] CI platform to generate config for
                           <options: github|gitlab|all>

DESCRIPTION
  Generate CI/CD configuration files for GitHub Actions and GitLab CI

EXAMPLES
  Generate CI config for all platforms

    $ codeforge ci

  Generate GitHub Actions workflow only

    $ codeforge ci --platform github

  Generate GitLab CI configuration only

    $ codeforge ci --platform gitlab

  Generate CI files in custom directory

    $ codeforge ci --output ./ci

  Overwrite existing CI files

    $ codeforge ci --force
```

_See code: [src/commands/ci.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/ci.ts)_

## `codeforge config`

Manage CodeForge configuration

```
USAGE
  $ codeforge config

DESCRIPTION
  Manage CodeForge configuration

EXAMPLES
  Validate the configuration file

    $ codeforge config validate
```

_See code: [src/commands/config/index.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/config/index.ts)_

## `codeforge config validate`

Validate the CodeForge configuration file

```
USAGE
  $ codeforge config validate [-c <value>]

FLAGS
  -c, --config=<value>  Path to config file

DESCRIPTION
  Validate the CodeForge configuration file

EXAMPLES
  Validate config in current directory

    $ codeforge config validate

  Validate specific config file

    $ codeforge config validate --config .codeforgerc.json
```

_See code: [src/commands/config/validate.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/config/validate.ts)_

## `codeforge config visualize`

Visualize the current CodeForge configuration

```
USAGE
  $ codeforge config visualize [--json] [--sources]

FLAGS
  --json     Output as JSON
  --sources  Show configuration sources

DESCRIPTION
  Visualize the current CodeForge configuration

EXAMPLES
  Visualize configuration as a tree

    $ codeforge config visualize

  Output configuration as JSON

    $ codeforge config visualize --json

  Show configuration sources

    $ codeforge config visualize --sources
```

_See code: [src/commands/config/visualize.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/config/visualize.ts)_

## `codeforge debt [PATH]`

Track and analyze technical debt in your codebase

```
USAGE
  $ codeforge debt [PATH] [--history] [--json] [--save] [-v]

ARGUMENTS
  [PATH]  [default: .] Path to analyze

FLAGS
  -v, --verbose  Show detailed breakdown
      --history  Show debt trend history
      --json     Output as JSON
      --save     Save debt snapshot for trend tracking

DESCRIPTION
  Track and analyze technical debt in your codebase

EXAMPLES
  Show technical debt analysis for current directory

    $ codeforge debt

  Show debt analysis for src directory

    $ codeforge debt src/

  Output debt analysis as JSON

    $ codeforge debt --json

  Show debt trend history

    $ codeforge debt --history

  Save current debt snapshot for trend tracking

    $ codeforge debt --save
```

_See code: [src/commands/debt.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/debt.ts)_

## `codeforge diff [BASE] [HEAD]`

Compare violations between git branches or commits

```
USAGE
  $ codeforge diff [BASE] [HEAD] [--json] [--path <value>] [-v]

ARGUMENTS
  [BASE]  [default: HEAD~1] Base branch or commit to compare from
  [HEAD]  [default: HEAD] Head branch or commit to compare to

FLAGS
  -v, --verbose       Show detailed violation changes
      --json          Output as JSON
      --path=<value>  [default: .] Path to analyze

DESCRIPTION
  Compare violations between git branches or commits

EXAMPLES
  Compare current commit with previous commit

    $ codeforge diff

  Compare main branch with feature branch

    $ codeforge diff main feature-branch

  Compare two specific commits

    $ codeforge diff abc123 def456

  Output diff as JSON

    $ codeforge diff --json
```

_See code: [src/commands/diff.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/diff.ts)_

## `codeforge docs`

Generate markdown documentation for all rules

```
USAGE
  $ codeforge docs [-c complexity|dependencies|performance|security|patterns] [-o <value>] [--single]

FLAGS
  -c, --category=<option>  Filter rules by category
                           <options: complexity|dependencies|performance|security|patterns>
  -o, --output=<value>     [default: docs/rules] Output directory for generated documentation
      --single             Generate a single combined file instead of per-rule files

DESCRIPTION
  Generate markdown documentation for all rules

EXAMPLES
  Generate docs to ./docs/rules

    $ codeforge docs

  Generate docs to custom directory

    $ codeforge docs --output ./documentation

  Generate docs only for complexity rules

    $ codeforge docs --category complexity
```

_See code: [src/commands/docs.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/docs.ts)_

## `codeforge doctor`

Diagnose configuration and environment issues

```
USAGE
  $ codeforge doctor [-j] [-v]

FLAGS
  -j, --json     Output results as JSON
  -v, --verbose  Show detailed information

DESCRIPTION
  Diagnose configuration and environment issues

EXAMPLES
  Run all diagnostic checks

    $ codeforge doctor

  Output results as JSON

    $ codeforge doctor --json

  Show detailed information

    $ codeforge doctor --verbose
```

_See code: [src/commands/doctor.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/doctor.ts)_

## `codeforge fix [FILES]`

Automatically fix violations in source files

```
USAGE
  $ codeforge fix [FILES] [--ci] [--concurrency <value>] [-c <value>] [-d] [-i <value>...] [--ignore-path
    <value>] [-r <value>] [--safe-only] [-v]

ARGUMENTS
  [FILES]  Files or patterns to fix

FLAGS
  -c, --config=<value>       Path to config file
  -d, --dry-run              Preview fixes without modifying files
  -i, --ignore=<value>...    Patterns to ignore
  -r, --rules=<value>        Only fix violations from these rules (comma-separated)
  -v, --verbose              Show detailed fix information
      --ci                   Run in CI mode (disables colors and progress)
      --concurrency=<value>  [default: 4] Number of files to process in parallel
      --ignore-path=<value>  Path to ignore file (one pattern per line)
      --safe-only            Only apply fixes marked as safe

DESCRIPTION
  Automatically fix violations in source files

EXAMPLES
  Fix all violations in files matching config

    $ codeforge fix

  Fix violations in specific files

    $ codeforge fix src/**/*.ts

  Preview fixes without applying them

    $ codeforge fix --dry-run

  Fix only specific rules

    $ codeforge fix --rules prefer-const,no-eval

  Process 4 files in parallel

    $ codeforge fix --concurrency 4
```

_See code: [src/commands/fix.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/fix.ts)_

## `codeforge generate-plugin NAME`

Generate a new CodeForge plugin scaffold

```
USAGE
  $ codeforge generate-plugin NAME [-t] [-r <value>] [-o <value>] [-f]

ARGUMENTS
  NAME  Plugin name (e.g., codeforge-plugin-custom)

FLAGS
  -f, --force           Overwrite existing plugin directory
  -o, --output=<value>  [default: .] Output directory for the plugin
  -r, --rule=<value>    [default: sample-rule] Name of the initial rule to create
  -t, --typescript      Generate TypeScript plugin

DESCRIPTION
  Generate a new CodeForge plugin scaffold

EXAMPLES
  Generate a plugin named "my-plugin"

    $ codeforge generate-plugin my-plugin

  Generate a TypeScript plugin

    $ codeforge generate-plugin my-plugin --typescript

  Generate plugin with a custom rule

    $ codeforge generate-plugin my-plugin --rule custom-rule
```

_See code: [src/commands/generate-plugin.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/generate-plugin.ts)_

## `codeforge health [PATH]`

Display project health score and recommendations

```
USAGE
  $ codeforge health [PATH] [--json] [-v]

ARGUMENTS
  [PATH]  [default: .] Path to analyze

FLAGS
  -v, --verbose  Show detailed breakdown
      --json     Output as JSON

DESCRIPTION
  Display project health score and recommendations

EXAMPLES
  Show health score for current directory

    $ codeforge health

  Show health score for src directory

    $ codeforge health src/

  Output health score as JSON

    $ codeforge health --json
```

_See code: [src/commands/health.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/health.ts)_

## `codeforge help [COMMAND]`

Display help for codeforge.

```
USAGE
  $ codeforge help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for codeforge.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.38/src/commands/help.ts)_

## `codeforge init`

Initialize a new CodeForge configuration file

```
USAGE
  $ codeforge init [--dir <value>] [-f] [-F json|js] [-i] [--minimal] [-t]

FLAGS
  -F, --format=<option>  [default: json] Configuration file format
                         <options: json|js>
  -f, --force            Overwrite existing configuration file
  -i, --interactive      Interactive mode with rule selection
  -t, --typescript       Configure for TypeScript project
      --dir=<value>      [default: .] Directory to create the config file in
      --minimal          Create minimal configuration with recommended rules only

DESCRIPTION
  Initialize a new CodeForge configuration file

EXAMPLES
  Create config interactively

    $ codeforge init

  Create config with interactive rule selection

    $ codeforge init --interactive

  Create minimal config with defaults

    $ codeforge init --minimal

  Create JavaScript config file

    $ codeforge init --format js

  Overwrite existing config

    $ codeforge init --force

  Overwrite existing config

    $ codeforge init --force

  Create config in a specific directory

    $ codeforge init --dir ./my-project
```

_See code: [src/commands/init.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/init.ts)_

## `codeforge interactive [PATH]`

Interactively review and fix violations

```
USAGE
  $ codeforge interactive [PATH] [--auto-safe] [--severity error|warning|info] [-v]

ARGUMENTS
  [PATH]  [default: .] Path to analyze

FLAGS
  -v, --verbose            Show detailed violation information
      --auto-safe          Automatically apply safe fixes without prompting
      --severity=<option>  [default: warning] Minimum severity level to review
                           <options: error|warning|info>

DESCRIPTION
  Interactively review and fix violations

EXAMPLES
  Start interactive fix mode for current directory

    $ codeforge interactive

  Start interactive fix mode for src directory

    $ codeforge interactive src/

  Only review error-level violations

    $ codeforge interactive --severity error

  Automatically apply safe fixes, ask for others

    $ codeforge interactive --auto-safe
```

_See code: [src/commands/interactive.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/interactive.ts)_

## `codeforge lib _base`

```
USAGE
  $ codeforge lib _base
```

_See code: [src/commands/lib/_base.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/lib/_base.ts)_

## `codeforge migrate`

Migrate from another linter to CodeForge

```
USAGE
  $ codeforge migrate -F eslint [-d] [-f] [-o <value>]

FLAGS
  -F, --from=<option>   (required) Source linter to migrate from
                        <options: eslint>
  -d, --dryRun          Preview migration without writing files
  -f, --force           Overwrite existing config
  -o, --output=<value>  [default: .codeforgerc.json] Output config file path

DESCRIPTION
  Migrate from another linter to CodeForge

EXAMPLES
  Migrate from ESLint

    $ codeforge migrate --from eslint

  Preview migration without writing

    $ codeforge migrate --from eslint --dry-run
```

_See code: [src/commands/migrate.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/migrate.ts)_

## `codeforge organize-imports [PATH]`

Organize and sort imports in TypeScript files

```
USAGE
  $ codeforge organize-imports [PATH] [-d] [--group] [--sort] [-v] [-w]

ARGUMENTS
  [PATH]  [default: .] Path to organize imports in

FLAGS
  -d, --dry-run  Preview changes without modifying files
  -v, --verbose  Show detailed output
  -w, --write    Write changes to files
      --group    Group imports by type (external, internal, relative)
      --sort     Sort imports alphabetically

DESCRIPTION
  Organize and sort imports in TypeScript files

EXAMPLES
  Organize imports in current directory

    $ codeforge organize-imports

  Organize imports in src directory

    $ codeforge organize-imports src/

  Preview changes without modifying files

    $ codeforge organize-imports --dry-run

  Group imports by type (external, internal, relative)

    $ codeforge organize-imports --group
```

_See code: [src/commands/organize-imports.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/organize-imports.ts)_

## `codeforge plugins`

List installed plugins.

```
USAGE
  $ codeforge plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ codeforge plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/index.ts)_

## `codeforge plugins add PLUGIN`

Installs a plugin into codeforge.

```
USAGE
  $ codeforge plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into codeforge.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the CODEFORGE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the CODEFORGE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ codeforge plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ codeforge plugins add myplugin

  Install a plugin from a github url.

    $ codeforge plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ codeforge plugins add someuser/someplugin
```

## `codeforge plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ codeforge plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ codeforge plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/inspect.ts)_

## `codeforge plugins install PLUGIN`

Installs a plugin into codeforge.

```
USAGE
  $ codeforge plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into codeforge.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the CODEFORGE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the CODEFORGE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ codeforge plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ codeforge plugins install myplugin

  Install a plugin from a github url.

    $ codeforge plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ codeforge plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/install.ts)_

## `codeforge plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ codeforge plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ codeforge plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/link.ts)_

## `codeforge plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ codeforge plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codeforge plugins unlink
  $ codeforge plugins remove

EXAMPLES
  $ codeforge plugins remove myplugin
```

## `codeforge plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ codeforge plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/reset.ts)_

## `codeforge plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ codeforge plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codeforge plugins unlink
  $ codeforge plugins remove

EXAMPLES
  $ codeforge plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/uninstall.ts)_

## `codeforge plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ codeforge plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ codeforge plugins unlink
  $ codeforge plugins remove

EXAMPLES
  $ codeforge plugins unlink myplugin
```

## `codeforge plugins update`

Update installed plugins.

```
USAGE
  $ codeforge plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.59/src/commands/plugins/update.ts)_

## `codeforge precommit`

Set up git pre-commit hooks to run CodeForge

```
USAGE
  $ codeforge precommit [-c <value>] [-f] [-i git|husky]

FLAGS
  -c, --command=<value>     [default: codeforge analyze --staged] Custom command to run in pre-commit hook
  -f, --force               Overwrite existing pre-commit hook
  -i, --installer=<option>  [default: git] Hook installation method
                            <options: git|husky>

DESCRIPTION
  Set up git pre-commit hooks to run CodeForge

EXAMPLES
  Set up git pre-commit hook with default settings

    $ codeforge precommit

  Set up husky pre-commit hook

    $ codeforge precommit --installer husky

  Overwrite existing pre-commit hook

    $ codeforge precommit --force

  Use custom command in pre-commit hook

    $ codeforge precommit --command "npm test"
```

_See code: [src/commands/precommit.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/precommit.ts)_

## `codeforge report [PATH]`

Generate analysis reports in various formats

```
USAGE
  $ codeforge report [PATH] [--concurrency <value>] [-f console|gitlab|html|json|junit|markdown|sarif] [-i
    <value>] [--open] [-o <value>] [--pretty] [--verbose]

ARGUMENTS
  [PATH]  [default: .] Path to analyze

FLAGS
  -f, --format=<option>      [default: console] Output format
                             <options: console|gitlab|html|json|junit|markdown|sarif>
  -i, --input=<value>        Input JSON file from previous analyze command
  -o, --output=<value>       Output file path (required for html format)
      --concurrency=<value>  [default: 4] Number of files to process in parallel
      --open                 Open HTML report in browser (only works with --format html)
      --pretty               Pretty print JSON output
      --verbose              Show detailed output

DESCRIPTION
  Generate analysis reports in various formats

EXAMPLES
  Generate console report for current directory

    $ codeforge report

  Generate JSON report for src directory

    $ codeforge report ./src --format json

  Generate and open HTML report

    $ codeforge report --format html --output report.html --open

  Generate HTML report from cached analysis

    $ codeforge report --input analysis.json --format html --output report.html

  Generate JUnit XML report for CI/CD

    $ codeforge report --format junit --output junit.xml

  Generate SARIF report for GitHub Code Scanning

    $ codeforge report --format sarif --output results.sarif

  Generate GitLab Code Quality report

    $ codeforge report --format gitlab --output gl-code-quality.json

  Generate Markdown report for documentation

    $ codeforge report --format markdown --output REPORT.md

  Process 4 files in parallel

    $ codeforge report --concurrency 4
```

_See code: [src/commands/report.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/report.ts)_

## `codeforge rules`

List all available rules

```
USAGE
  $ codeforge rules [-c complexity|dependencies|performance|security|patterns] [--fixable] [-f json|table]
    [-s <value>]

FLAGS
  -c, --category=<option>  Filter rules by category
                           <options: complexity|dependencies|performance|security|patterns>
  -f, --format=<option>    [default: table] Output format
                           <options: json|table>
  -s, --search=<value>     Search rules by keyword in description
      --fixable            Show only rules that can automatically fix issues

DESCRIPTION
  List all available rules

EXAMPLES
  List all available rules

    $ codeforge rules

  Output rules as JSON

    $ codeforge rules --format json

  Filter rules by category

    $ codeforge rules --category complexity

  Search rules by keyword in description

    $ codeforge rules --search async
```

_See code: [src/commands/rules.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/rules.ts)_

## `codeforge stats [PATH]`

Display codebase statistics and metrics

```
USAGE
  $ codeforge stats [PATH] [--ext <value>] [-f csv|json|table] [-i <value>...] [-o <value>] [-s
    complexity|loc|name|size] [-t <value>] [-v]

ARGUMENTS
  [PATH]  [default: .] Path to analyze

FLAGS
  -f, --format=<option>    [default: table] Output format
                           <options: csv|json|table>
  -i, --ignore=<value>...  Patterns to ignore
  -o, --output=<value>     Output file path
  -s, --sort-by=<option>   [default: size] Sort files by metric
                           <options: complexity|loc|name|size>
  -t, --top=<value>        [default: 10] Number of top files to show
  -v, --verbose            Show detailed file statistics
      --ext=<value>        Comma-separated file extensions to analyze (e.g., ".ts,.tsx")

DESCRIPTION
  Display codebase statistics and metrics

EXAMPLES
  Show statistics for current directory

    $ codeforge stats

  Show statistics for src directory as JSON

    $ codeforge stats ./src --format json

  Show top 10 largest files

    $ codeforge stats --top 10

  Save statistics to JSON file

    $ codeforge stats --format json --output stats.json

  Show statistics for TypeScript files only

    $ codeforge stats --ext .ts,.tsx
```

_See code: [src/commands/stats.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/stats.ts)_

## `codeforge watch [FILES]`

Watch files for changes and analyze on save

```
USAGE
  $ codeforge watch [FILES] [-c <value>] [-d <value>] [-i <value>...] [-r <value>] [-v]

ARGUMENTS
  [FILES]  Files or directories to watch

FLAGS
  -c, --config=<value>     Path to config file
  -d, --debounce=<value>   [default: 300] Debounce time in milliseconds
  -i, --ignore=<value>...  Patterns to ignore
  -r, --rules=<value>      Only run these rules (comma-separated)
  -v, --verbose            Show detailed output

DESCRIPTION
  Watch files for changes and analyze on save

EXAMPLES
  Watch all files matching config

    $ codeforge watch

  Watch specific directory

    $ codeforge watch src/

  Custom debounce time

    $ codeforge watch --debounce 500
```

_See code: [src/commands/watch.ts](https://github.com/codeforge-dev/codeforge/blob/v0.1.0/src/commands/watch.ts)_
<!-- commandsstop -->

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT © CodeForge Team

---

Built with ❤️ by the [CodeForge Team](https://github.com/codeforge-dev)
