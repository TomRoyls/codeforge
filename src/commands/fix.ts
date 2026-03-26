import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import * as fs from 'node:fs/promises'
import os from 'node:os'
import pLimit from 'p-limit'

import { DEFAULT_CONFIG } from '../config/types.js'
import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { applyFixesToFile, type RuleWithFix } from '../fix/fixer.js'
import { allRules } from '../rules/index.js'
import { resolvePatterns, setupRuleRegistry } from '../utils/command-helpers.js'
import { CLIError } from '../utils/errors.js'
import { logger, LogLevel } from '../utils/logger.js'

interface FileFixResult {
  conflicts: Array<{ conflictingRule: string; ruleId: string }>
  error?: string
  file: string
  fixesApplied: number
  fixesSkipped: number
  status: 'error' | 'processed' | 'unchanged'
}

interface FixFlags {
  concurrency: number
  config: string | undefined
  'dry-run': boolean
  ignore?: string[]
  rules: string | undefined
  'safe-only': boolean
  verbose: boolean
}

interface ProcessContext {
  dryRun: boolean
  parser: Parser
  registry: RuleRegistry
  rulesWithFixes: Map<string, RuleWithFix>
}

export default class Fix extends Command {
  static override args = {
    files: Args.string({
      description: 'Files or patterns to fix',
      multiple: true,
      required: false,
    }),
  }

  static override description = 'Automatically fix violations in source files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Fix all violations in files matching config',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/**/*.ts',
      description: 'Fix violations in specific files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --dry-run',
      description: 'Preview fixes without applying them',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --rules prefer-const,no-eval',
      description: 'Fix only specific rules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --concurrency 4',
      description: 'Process 4 files in parallel',
    },
  ]

  static override flags = {
    ci: Flags.boolean({
      default: false,
      description: 'Run in CI mode (disables colors and progress)',
    }),
    concurrency: Flags.integer({
      default: os.cpus().length,
      description: 'Number of files to process in parallel',
    }),
    config: Flags.string({
      char: 'c',
      description: 'Path to config file',
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      default: false,
      description: 'Preview fixes without modifying files',
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'ignore-path': Flags.string({
      description: 'Path to ignore file (one pattern per line)',
    }),
    rules: Flags.string({
      char: 'r',
      description: 'Only fix violations from these rules (comma-separated)',
      multiple: false,
    }),
    'safe-only': Flags.boolean({
      default: false,
      description: 'Only apply fixes marked as safe',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed fix information',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Fix)

    const ciMode = flags.ci

    if (flags.verbose || ciMode) {
      logger.setLevel(LogLevel.DEBUG)
    }

    try {
      const setupResult = await this.setupFixContext(args, flags, ciMode)

      if (!setupResult) {
        return
      }

      const { context, discoveredFiles } = setupResult

      const results = await this.processFiles(discoveredFiles, context, flags)

      this.outputFixResults(results, flags, ciMode)
    } catch (error) {
      if (ciMode) {
        this.outputJson({ error: error instanceof Error ? error.message : String(error) })
        this.exit(1)
      } else if (error instanceof CLIError) {
        this.error(error.message)
      } else {
        this.error(`Fix failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  private getRulesWithFixes(safeOnly = false): Map<string, RuleWithFix> {
    const rulesWithFixes = new Map<string, RuleWithFix>()

    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      if (ruleDef.fix && typeof ruleDef.fix === 'function') {
        if (safeOnly && !ruleDef.meta?.fixable) {
          continue
        }

        rulesWithFixes.set(ruleId, {
          fix: ({ sourceFile, violation }) => ruleDef.fix!(sourceFile, violation),
          id: ruleId,
          priority: 10,
        })
      }
    }

    return rulesWithFixes
  }

  private outputFixResults(
    results: {
      filesModified: string[]
      filesUnchanged: string[]
      totalFixesApplied: number
      totalFixesSkipped: number
    },
    flags: FixFlags,
    ciMode: boolean,
  ): void {
    if (ciMode) {
      this.outputJson({
        dryRun: flags['dry-run'],
        filesModified: results.filesModified,
        filesUnchanged: results.filesUnchanged,
        summary: {
          fixesApplied: results.totalFixesApplied,
          fixesSkipped: results.totalFixesSkipped,
        },
      })
    } else {
      this.printSummary(results, flags)
    }
  }

  private outputJson(data: unknown): void {
    this.log(JSON.stringify(data, null, 2))
  }

  private printSummary(
    results: {
      filesModified: string[]
      filesUnchanged: string[]
      totalFixesApplied: number
      totalFixesSkipped: number
    },
    flags: FixFlags,
  ): void {
    this.log(chalk.bold('\n📊 Fix Summary\n'))

    if (flags['dry-run']) {
      this.log(chalk.dim('  Mode: Dry run (no files modified)'))
    }

    this.log(chalk.green(`  Fixes applied: ${results.totalFixesApplied}`))

    if (results.totalFixesSkipped > 0) {
      this.log(chalk.yellow(`  Fixes skipped: ${results.totalFixesSkipped} (conflicts)`))
    }

    if (!flags['dry-run']) {
      this.log(chalk.blue(`  Files modified: ${results.filesModified.length}`))
      this.log(chalk.dim(`  Files unchanged: ${results.filesUnchanged.length}`))
    } else if (results.totalFixesApplied > 0) {
      this.log(chalk.blue(`  Files would be modified: ${results.filesModified.length}`))
    }

    if (results.totalFixesApplied === 0 && results.totalFixesSkipped === 0) {
      this.log(chalk.green('\n✨ No violations found to fix!'))
    } else if (!flags['dry-run'] && results.totalFixesApplied > 0) {
      this.log(chalk.green('\n✨ Fixes applied successfully!'))
    }
  }

  private async processFile(
    file: { absolutePath: string; path: string },
    context: ProcessContext,
  ): Promise<FileFixResult> {
    const filePath = file.absolutePath

    try {
      const parseResult = await context.parser.parseFile(filePath)

      if (!parseResult.sourceFile) {
        return {
          conflicts: [],
          file: file.path,
          fixesApplied: 0,
          fixesSkipped: 0,
          status: 'unchanged',
        }
      }

      const violations = context.registry.runRules(parseResult.sourceFile)

      if (violations.length === 0) {
        return {
          conflicts: [],
          file: file.path,
          fixesApplied: 0,
          fixesSkipped: 0,
          status: 'unchanged',
        }
      }

      const fixReport = applyFixesToFile(
        parseResult.sourceFile,
        violations,
        context.rulesWithFixes,
        context.dryRun,
      )

      if (!context.dryRun && fixReport.fixesApplied > 0) {
        const newContent = parseResult.sourceFile.getFullText()

        await fs.writeFile(filePath, newContent, 'utf8')
      }

      return {
        conflicts: fixReport.conflicts,
        file: file.path,
        fixesApplied: fixReport.fixesApplied,
        fixesSkipped: fixReport.fixesSkipped,
        status: 'processed',
      }
    } catch (error) {
      return {
        conflicts: [],
        error: error instanceof Error ? error.message : String(error),
        file: file.path,
        fixesApplied: 0,
        fixesSkipped: 0,
        status: 'error',
      }
    }
  }

  private async processFiles(
    discoveredFiles: Array<{ absolutePath: string; path: string }>,
    context: ProcessContext,
    flags: FixFlags,
  ): Promise<{
    filesModified: string[]
    filesUnchanged: string[]
    totalFixesApplied: number
    totalFixesSkipped: number
  }> {
    const limit = pLimit(flags.concurrency)

    const results = await Promise.all(
      discoveredFiles.map((file) => limit(async () => this.processFile(file, context))),
    )

    let totalFixesApplied = 0
    let totalFixesSkipped = 0
    const filesModified: string[] = []
    const filesUnchanged: string[] = []

    for (const result of results) {
      if (result.status === 'error') {
        this.log(chalk.red(`  ✗ Error processing ${result.file}: ${result.error}`))
      } else if (result.status === 'processed') {
        totalFixesApplied += result.fixesApplied
        totalFixesSkipped += result.fixesSkipped

        if (!flags['dry-run'] && result.fixesApplied > 0) {
          filesModified.push(result.file)

          if (flags.verbose) {
            this.log(chalk.green(`  ✓ Fixed ${result.fixesApplied} violation(s) in ${result.file}`))
          }
        } else if (flags['dry-run'] && result.fixesApplied > 0 && flags.verbose) {
          this.log(chalk.dim(`  ○ Would fix ${result.fixesApplied} violation(s) in ${result.file}`))
        }

        if (result.conflicts.length > 0 && flags.verbose) {
          for (const conflict of result.conflicts) {
            this.log(
              chalk.yellow(
                `  ⚠ Skipped ${conflict.ruleId} (conflicts with ${conflict.conflictingRule}) in ${result.file}`,
              ),
            )
          }
        }
      } else {
        filesUnchanged.push(result.file)
      }
    }

    return { filesModified, filesUnchanged, totalFixesApplied, totalFixesSkipped }
  }

  private async setupFixContext(
    args: { files: string[] | undefined },
    flags: FixFlags,
    ciMode: boolean,
  ): Promise<null | {
    context: ProcessContext
    discoveredFiles: Array<{ absolutePath: string; path: string }>
  }> {
    const config = DEFAULT_CONFIG
    const patterns = resolvePatterns(args.files ?? [], config.files)
    const ignore = flags.ignore ?? config.ignore ?? []
    const requestedRules = flags.rules?.split(',').map((r) => r.trim())

    const cwd = process.cwd()
    const discoveredFiles = await discoverFiles({ cwd, ignore, patterns })

    if (discoveredFiles.length === 0) {
      if (ciMode) {
        this.outputJson({ error: 'No files found to fix', files: [] })
      } else {
        this.log(chalk.yellow('No files found to fix.'))
      }

      return null
    }

    if (!ciMode) {
      this.log(chalk.blue(`\n🔧 Fixing ${discoveredFiles.length} file(s)...\n`))
    }

    const rulesWithFixes = this.getRulesWithFixes(flags['safe-only'])

    if (rulesWithFixes.size === 0) {
      if (ciMode) {
        this.outputJson({ error: 'No fixable rules available', files: [] })
      } else {
        this.log(chalk.yellow('No fixable rules available.'))
      }

      return null
    }

    const registry = setupRuleRegistry(requestedRules)
    const parser = new Parser()

    const context: ProcessContext = {
      dryRun: flags['dry-run'],
      parser,
      registry,
      rulesWithFixes,
    }

    return { context, discoveredFiles }
  }
}
