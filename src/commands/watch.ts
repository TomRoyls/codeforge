import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { ConfigCache } from '../config/cache.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { DEFAULT_DEBOUNCE_MS } from '../utils/constants.js'
import { CLIError } from '../utils/errors.js'
import { logger, LogLevel } from '../utils/logger.js'
import { FileWatcher } from '../utils/watcher.js'
import { loadCommandConfig, resolvePatterns, setupRuleRegistry } from './command-helpers.js'

export default class Watch extends Command {
  static override args = {
    files: Args.string({
      description: 'Files or directories to watch',
      multiple: true,
      required: false,
    }),
  }

  static override description = 'Watch files for changes and analyze on save'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Watch all files matching config',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Watch specific directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --debounce 500',
      description: 'Custom debounce time',
    },
  ]

  static override flags = {
    config: Flags.string({
      char: 'c',
      description: 'Path to config file',
    }),
    debounce: Flags.integer({
      char: 'd',
      default: DEFAULT_DEBOUNCE_MS,
      description: 'Debounce time in milliseconds',
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    rules: Flags.string({
      char: 'r',
      description: 'Only run these rules (comma-separated)',
      multiple: false,
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  private configCache = new ConfigCache()
  private isRunning = false
  private parser: null | Parser = null
  private pendingAnalysis = false
  private watcher: FileWatcher | null = null

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Watch)

    if (flags.verbose) {
      logger.setLevel(LogLevel.DEBUG)
    }

    try {
      const config = await loadCommandConfig(flags, this.configCache)
      const patterns = resolvePatterns(args.files, config.files)
      const ignore = config.ignore ?? []
      const requestedRules = flags.rules?.split(',').map((r) => r.trim())

      const cwd = process.cwd()

      this.log(chalk.blue('\n👁️  Starting file watcher...\n'))
      this.log(chalk.dim(`  Watching: ${patterns.join(', ') || 'current directory'}`))
      this.log(chalk.dim(`  Debounce: ${flags.debounce}ms`))
      this.log(chalk.dim('  Press Ctrl+C to stop\n'))

      // Setup signal handlers for graceful shutdown
      process.on('SIGINT', () => this.handleShutdown())
      process.on('SIGTERM', () => this.handleShutdown())

      // Initialize parser once for the watch session
      this.parser = new Parser()
      await this.parser.initialize()

      // Create and configure watcher
      this.watcher = new FileWatcher({
        debounceMs: flags.debounce,
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
        ignorePatterns: ignore,
      })

      // Handle file changes
      this.watcher.on('change', async (event) => {
        if (event.type === 'change' || event.type === 'add') {
          await this.analyzeFile(event.filePath, requestedRules, flags.verbose)
        }
      })

      this.watcher.on('error', (error) => {
        this.log(chalk.red(`Watcher error: ${error.message}`))
      })

      // Start watching
      await this.watcher.watch(cwd)

      // Initial analysis of all files
      const discoveredFiles = await discoverFiles({ cwd, ignore, patterns })

      if (discoveredFiles.length > 0) {
        this.log(chalk.dim(`Found ${discoveredFiles.length} file(s) to analyze\n`))
      }

      // Keep the process alive
      await new Promise(() => {
        // This promise never resolves - we rely on SIGINT/SIGTERM to exit
      })
    } catch (error) {
      if (error instanceof CLIError) {
        this.error(error.message)
      } else {
        this.error(`Watch failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  private async analyzeFile(
    filePath: string,
    requestedRules: string[] | undefined,
    _verbose: boolean,
  ): Promise<void> {
    if (this.isRunning) {
      this.pendingAnalysis = true
      return
    }

    this.isRunning = true

    try {
      const registry = setupRuleRegistry(requestedRules)

      if (!this.parser) {
        return
      }

      const parseResult = await this.parser.parseFile(filePath)

      if (!parseResult.sourceFile) {
        return
      }

      const violations = registry.runRules(parseResult.sourceFile)

      const relativePath = filePath.replace(process.cwd(), '.').replace(/^\.\//, '')

      if (violations.length === 0) {
        this.log(chalk.green(`  ✓ ${relativePath}`))
      } else {
        let errors = 0
        let warnings = 0
        for (const v of violations) {
          if (v.severity === 'error') errors++
          else if (v.severity === 'warning') warnings++
        }

        this.log(chalk.yellow(`  ⚠ ${relativePath} - ${errors} error(s), ${warnings} warning(s)`))

        // Show first few violations
        for (const violation of violations.slice(0, 3)) {
          const severity =
            violation.severity === 'error' ? chalk.red('error') : chalk.yellow('warn')
          this.log(
            chalk.dim(`      ${violation.range.start.line}:${violation.range.start.column} `) +
              `${severity} ${violation.ruleId} - ${violation.message}`,
          )
        }

        if (violations.length > 3) {
          this.log(chalk.dim(`      ... and ${violations.length - 3} more`))
        }
      }
    } catch {
      // Ignore parse errors during watch - file might be mid-edit
    } finally {
      this.isRunning = false

      // Process pending analysis if one came in while we were running
      if (this.pendingAnalysis) {
        this.pendingAnalysis = false
        // Schedule next analysis on next tick to avoid stack overflow
        setImmediate(() => {
          this.analyzeFile(filePath, requestedRules, _verbose).catch((error) => {
            logger.debug('Failed to schedule analysis:', error)
          })
        })
      }
    }
  }

  private handleShutdown(): void {
    this.log(chalk.dim('\n\nStopping watcher...'))

    if (this.watcher) {
      this.watcher.stop().catch((error) => {
        logger.debug('Failed to stop watcher during shutdown:', error)
      })
    }

    if (this.parser) {
      this.parser.dispose()
    }

    this.exit(0)
  }
}
