import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { buildWatchConfig, buildFileWatcher, type WatchConfig } from './watch-live-helpers.js'
import { formatWatchHeader } from './watch-live-format-helpers.js'

/**
 * Monitor file changes and trigger analysis.
 *
 * @example
 * ```sh
 * codeforge watch-live ./src
 * codeforge watch-live --ext .ts,.tsx --debounce 300
 * codeforge watch-live --command "npm test"
 * ```
 */
export default class WatchLive extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to watch',
      required: false,
    }),
  }

  static override description = 'Monitor file changes for analysis'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Watch current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Watch src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --debounce 300',
      description: 'Custom debounce time',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --command "npm test"',
      description: 'Run command on change',
    },
  ]

  static override flags = {
    command: Flags.string({
      char: 'c',
      description: 'Command to run on file change',
    }),
    debounce: Flags.integer({
      char: 'd',
      default: 500,
      description: 'Debounce time in milliseconds',
    }),
    ext: Flags.string({
      char: 'e',
      default: '',
      description: 'Comma-separated file extensions to watch',
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(WatchLive)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const config = buildWatchConfig({
      command: flags.command ?? null,
      debounceMs: flags.debounce,
      extensions,
      ignorePatterns: ignore,
      path: targetPath,
    })

    const header = formatWatchHeader(config)
    this.log(header)

    const watcher = buildFileWatcher(config)

    if (flags.verbose) {
      this.log(`  Watcher started at ${watcher.startedAt}`)
      this.log(`  Watching: ${watcher.watching}`)
    }

    this.log(chalk.gray('  (Watcher is active — press Ctrl+C to stop)'))

    await new Promise(() => {})
  }
}
