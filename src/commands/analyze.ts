import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import ora, { type Ora } from 'ora'
import pLimit from 'p-limit'

import { type RuleViolation } from '../ast/visitor.js'
import { ConfigCache } from '../config/cache.js'
import { type DiscoveredFile, discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { type OutputFormat, Reporter } from '../core/reporter.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { applyFixesToFile, type RuleWithFix } from '../fix/fixer.js'
import { allRules } from '../rules/index.js'
import { CLIError } from '../utils/errors.js'
import { getGitRoot, getStagedFiles, isGitRepository } from '../utils/git-helpers.js'
import { logger, LogLevel } from '../utils/logger.js'
import { loadCommandConfig, setupRuleRegistry } from './command-helpers.js'

interface FileReport {
  filePath: string
  violations: RuleViolation[]
}

interface AnalysisSummary {
  duration: number
  errors: number
  info: number
  totalFiles: number
  totalViolations: number
  warnings: number
}

interface FailedFile {
  error: string
  filePath: string
}

interface AnalysisResult {
  allViolations: RuleViolation[]
  failedFiles: FailedFile[]
  fileReports: FileReport[]
}

interface FixResult {
  fixesApplied: number
  fixesSkipped: number
}

interface AnalyzeFilesOptions {
  concurrency: number
  discoveredFiles: DiscoveredFile[]
  parseCache: Map<string, import('../core/parser.js').ParseResult>
  parser: Parser
  registry: RuleRegistry
  spinner: null | Ora
  verbose: boolean
}

interface ApplyFixesOptions {
  allViolations: RuleViolation[]
  concurrency: number
  discoveredFiles: DiscoveredFile[]
  dryRun: boolean
  parseCache: Map<string, import('../core/parser.js').ParseResult>
  parser: Parser
  rulesWithFixes: Map<string, RuleWithFix>
  verbose: boolean
}

interface DiscoverFilesOptions {
  cwd: string
  files: string[]
  ignore: string[]
  spinner: null | Ora
  stagedMode: boolean
}

export default class Analyze extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze (file or directory)',
      required: false,
    }),
  }

  static override description = 'Analyze code for violations and issues'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Analyze the src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --staged',
      description: 'Analyze only staged files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --files "**/*.ts"',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore "**/test/**"',
      description: 'Ignore test directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Output results as JSON to file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --rules no-circular-deps,max-params',
      description: 'Run specific rules only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --max-warnings 10',
      description: 'Fail if more than 10 warnings found',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --concurrency 4',
      description: 'Process 4 files in parallel',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
  ]

  static override flags = {
    ci: Flags.boolean({
      default: false,
      description: 'Run in CI mode (disables colors, progress, sets JSON output)',
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
      default: false,
      description: 'Preview fixes without applying them (use with --fix)',
    }),
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    'fail-on-warnings': Flags.boolean({
      default: false,
      description: 'Exit with error code on warnings',
    }),
    files: Flags.string({
      char: 'f',
      description: 'Glob patterns for files to analyze',
      multiple: true,
    }),
    fix: Flags.boolean({
      default: false,
      description: 'Automatically fix violations where possible',
    }),
    format: Flags.string({
      default: 'console',
      description: 'Output format',
      options: ['console', 'html', 'json', 'junit', 'markdown', 'sarif', 'gitlab', 'csv'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'max-warnings': Flags.integer({
      default: -1,
      description: 'Number of warnings to trigger a non-zero exit code (-1 to ignore)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    quiet: Flags.boolean({
      char: 'q',
      default: false,
      description: 'Suppress progress output',
    }),
    rules: Flags.string({
      char: 'r',
      description: 'Specific rules to run',
      multiple: true,
    }),
    staged: Flags.boolean({
      default: false,
      description: 'Analyze only staged files in git',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  private configCache = new ConfigCache()

  async catch(error: Error): Promise<void> {
    if (error instanceof CLIError) {
      this.error(error.message, {
        exit: 1,
        suggestions: error.suggestions,
      })
    }

    throw error
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Analyze)

    const config = await loadCommandConfig(flags, this.configCache)
    const files = config.files ?? []
    const ignore = config.ignore ?? []

    const ciMode = flags.ci
    const format = ciMode && flags.format === 'console' ? 'json' : (flags.format as OutputFormat)
    const { output } = flags
    const quiet = ciMode || flags.quiet
    const verbose = flags.verbose && !ciMode
    const failOnWarnings = flags['fail-on-warnings']
    const maxWarnings = flags['max-warnings']
    const shouldFix = flags.fix
    const dryRun = flags['dry-run']
    const stagedMode = flags.staged
    const { concurrency } = flags

    this.configureLogging(verbose, quiet)

    const startTime = performance.now()

    const targetPath = path.resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const spinner = quiet ? null : ora('Discovering files...').start()

    const discoveredFiles = await this.discoverFiles({
      cwd: targetPath,
      files,
      ignore,
      spinner,
      stagedMode,
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = path.extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    if (filteredFiles.length === 0) {
      spinner?.warn('No files found to analyze')
      this.exit(0)
      return
    }

    spinner?.succeed(`Found ${filteredFiles.length} files to analyze`)

    const requestedRules = flags.rules
    const registry = setupRuleRegistry(requestedRules)

    const parser = new Parser()
    await parser.initialize()

    const parseCache = new Map<string, import('../core/parser.js').ParseResult>()

    const analysisSpinner = quiet ? null : ora('Analyzing files...').start()

    const { allViolations, fileReports } = await this.analyzeFiles({
      concurrency,
      discoveredFiles: filteredFiles,
      parseCache,
      parser,
      registry,
      spinner: analysisSpinner,
      verbose,
    })

    analysisSpinner?.succeed('Analysis complete')

    let fixesApplied = 0
    let fixesSkipped = 0

    if (shouldFix && allViolations.length > 0) {
      const fixSpinner = quiet
        ? null
        : ora(dryRun ? 'Previewing fixes...' : 'Applying fixes...').start()

      const rulesWithFixes = this.getRulesWithFixes()

      const fixResult = await this.applyFixes({
        allViolations,
        concurrency,
        discoveredFiles: filteredFiles,
        dryRun,
        parseCache,
        parser,
        rulesWithFixes,
        verbose,
      })

      fixesApplied = fixResult.fixesApplied
      fixesSkipped = fixResult.fixesSkipped

      fixSpinner?.succeed(
        dryRun
          ? `Would apply ${fixesApplied} fixes, skip ${fixesSkipped} (dry run)`
          : `Applied ${fixesApplied} fixes, skipped ${fixesSkipped}`,
      )
    }

    parser.dispose()

    const duration = performance.now() - startTime

    const summary = this.generateSummary(allViolations, filteredFiles.length, duration)

    const reporter = new Reporter({
      color: !ciMode,
      format,
      outputPath: output,
      quiet,
      verbose,
    })

    await reporter.writeReport({
      files: fileReports,
      summary,
    })

    const exitCode = this.determineExitCode(summary, failOnWarnings, maxWarnings)
    this.exit(exitCode)
  }

  private async analyzeFiles(options: AnalyzeFilesOptions): Promise<AnalysisResult> {
    const { concurrency, discoveredFiles, parseCache, parser, registry, spinner, verbose } = options
    const limit = pLimit(concurrency)

    const results = await Promise.all(
      discoveredFiles.map((file, index) =>
        limit(async () => {
          if (!file) return null

          if (spinner && verbose) {
            spinner.text = `Analyzing ${file.path} (${index + 1}/${discoveredFiles.length})`
          }

          try {
            const parseResult = await parser.parseFile(file.absolutePath)
            parseCache.set(file.absolutePath, parseResult)

            const violations = registry.runRules(parseResult.sourceFile)

            const violationsWithFilePath = violations.map((v) => ({
              ...v,
              filePath: file.path,
            }))

            return {
              filePath: file.path,
              violations: violationsWithFilePath,
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            logger.debug(`Failed to analyze ${file.path}: ${errorMessage}`)

            return {
              error: errorMessage,
              filePath: file.path,
            }
          }
        }),
      ),
    )

    const allViolations: RuleViolation[] = []
    const fileReports: FileReport[] = []
    const failedFiles: FailedFile[] = []

    for (const result of results) {
      if (!result) continue

      if ('violations' in result) {
        fileReports.push(result as FileReport)
        allViolations.push(...(result as FileReport).violations)
      } else if ('error' in result) {
        failedFiles.push(result as FailedFile)
      }
    }

    return { allViolations, failedFiles, fileReports }
  }

  private async applyFixes(options: ApplyFixesOptions): Promise<FixResult> {
    const {
      allViolations,
      concurrency,
      discoveredFiles,
      dryRun,
      parseCache,
      parser,
      rulesWithFixes,
      verbose,
    } = options

    const violationsByFile = new Map<string, RuleViolation[]>()
    for (const violation of allViolations) {
      const existing = violationsByFile.get(violation.filePath)
      if (existing) {
        existing.push(violation)
      } else {
        violationsByFile.set(violation.filePath, [violation])
      }
    }

    const limit = pLimit(concurrency)

    const results = await Promise.all(
      discoveredFiles.map((file) =>
        limit(async () => {
          if (!file) return { fixesApplied: 0, fixesSkipped: 0 }

          const fileViolations = violationsByFile.get(file.path) ?? []
          if (fileViolations.length === 0) return { fixesApplied: 0, fixesSkipped: 0 }

          try {
            // Use cached parse result if available
            let parseResult = parseCache.get(file.absolutePath)
            if (!parseResult) {
              parseResult = await parser.parseFile(file.absolutePath)
            }

            const report = applyFixesToFile(
              parseResult.sourceFile,
              fileViolations,
              rulesWithFixes,
              dryRun,
            )

            if (!dryRun && report.changes.length > 0) {
              parseResult.sourceFile.saveSync()
            }

            if (verbose && report.conflicts.length > 0) {
              for (const conflict of report.conflicts) {
                logger.warn(
                  `Fix conflict in ${file.path}: ${conflict.ruleId} conflicts with ${conflict.conflictingRule}`,
                )
              }
            }

            return { fixesApplied: report.fixesApplied, fixesSkipped: report.fixesSkipped }
          } catch (error) {
            if (verbose) {
              logger.warn(`Failed to fix ${file.path}: ${(error as Error).message}`)
            }

            return { fixesApplied: 0, fixesSkipped: 0 }
          }
        }),
      ),
    )

    let fixesApplied = 0
    let fixesSkipped = 0
    for (const result of results) {
      fixesApplied += result.fixesApplied
      fixesSkipped += result.fixesSkipped
    }

    return { fixesApplied, fixesSkipped }
  }

  private configureLogging(verbose: boolean, quiet: boolean): void {
    if (verbose) {
      logger.setLevel(LogLevel.DEBUG)
    } else if (quiet) {
      logger.setLevel(LogLevel.SILENT)
    }
  }

  private determineExitCode(
    summary: { errors: number; warnings: number },
    failOnWarnings: boolean,
    maxWarnings: number,
  ): number {
    if (summary.errors > 0) {
      return 1
    }

    if (failOnWarnings && summary.warnings > 0) {
      return 2
    }

    if (maxWarnings >= 0 && summary.warnings > maxWarnings) {
      return 1
    }

    return 0
  }

  private async discoverFiles(options: DiscoverFilesOptions): Promise<DiscoveredFile[]> {
    const { cwd, files, ignore, spinner, stagedMode } = options

    if (stagedMode) {
      if (!isGitRepository(cwd)) {
        spinner?.fail()
        this.error('Not a git repository. --staged requires a git repository.', { exit: 1 })
      }

      const gitRoot = getGitRoot(cwd)
      if (!gitRoot) {
        spinner?.fail()
        this.error('Could not determine git repository root.', { exit: 1 })
      }

      const stagedFilePaths = getStagedFiles(gitRoot)

      if (stagedFilePaths.length === 0) {
        return []
      }

      return stagedFilePaths
        .filter((filePath) => {
          const absolutePath = path.join(gitRoot, filePath)
          return existsSync(absolutePath)
        })
        .map((filePath) => ({
          absolutePath: path.join(gitRoot, filePath),
          path: filePath,
        }))
    }

    return discoverFiles({
      cwd,
      ignore,
      patterns: files,
    })
  }

  private generateSummary(
    violations: RuleViolation[],
    fileCount: number,
    duration: number,
  ): AnalysisSummary {
    let errors = 0
    let warnings = 0
    let info = 0

    for (const v of violations) {
      if (v.severity === 'error') errors++
      else if (v.severity === 'warning') warnings++
      else info++
    }

    return {
      duration,
      errors,
      info,
      totalFiles: fileCount,
      totalViolations: violations.length,
      warnings,
    }
  }

  private getRulesWithFixes(): Map<string, RuleWithFix> {
    const rulesWithFixes = new Map<string, RuleWithFix>()

    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      if (ruleDef.fix && typeof ruleDef.fix === 'function') {
        rulesWithFixes.set(ruleId, {
          fix: ({ sourceFile, violation }) => ruleDef.fix!(sourceFile, violation),
          id: ruleId,
          priority: 10,
        })
      }
    }

    return rulesWithFixes
  }
}
