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

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g codeforge
$ codeforge COMMAND
running command...
$ codeforge (--version)
codeforge/0.0.0 linux-x64 node-v25.6.1
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

- [`codeforge hello PERSON`](#codeforge-hello-person)
- [`codeforge hello world`](#codeforge-hello-world)
- [`codeforge help [COMMAND]`](#codeforge-help-command)
- [`codeforge plugins`](#codeforge-plugins)
- [`codeforge plugins add PLUGIN`](#codeforge-plugins-add-plugin)
- [`codeforge plugins:inspect PLUGIN...`](#codeforge-pluginsinspect-plugin)
- [`codeforge plugins install PLUGIN`](#codeforge-plugins-install-plugin)
- [`codeforge plugins link PATH`](#codeforge-plugins-link-path)
- [`codeforge plugins remove [PLUGIN]`](#codeforge-plugins-remove-plugin)
- [`codeforge plugins reset`](#codeforge-plugins-reset)
- [`codeforge plugins uninstall [PLUGIN]`](#codeforge-plugins-uninstall-plugin)
- [`codeforge plugins unlink [PLUGIN]`](#codeforge-plugins-unlink-plugin)
- [`codeforge plugins update`](#codeforge-plugins-update)

## `codeforge hello PERSON`

Say hello

```
USAGE
  $ codeforge hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ codeforge hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/new/codeforge/blob/v0.0.0/src/commands/hello/index.ts)_

## `codeforge hello world`

Say hello world

```
USAGE
  $ codeforge hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ codeforge hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/new/codeforge/blob/v0.0.0/src/commands/hello/world.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.37/src/commands/help.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/index.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/inspect.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/install.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/link.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/reset.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/uninstall.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.58/src/commands/plugins/update.ts)_

<!-- commandsstop -->

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

## License

MIT © CodeForge Team

---

Built with ❤️ by the [CodeForge Team](https://github.com/codeforge-dev)
