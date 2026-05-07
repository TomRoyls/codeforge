/**
 * Analyze command - analyzes code for violations and issues.
 *
 * This is the main CodeForge command that runs analysis on source files
 * to detect code quality issues, style violations, and potential bugs.
 *
 * Features:
 * - Multi-file parallel analysis
 * - Support for multiple output formats (console, JSON, HTML, etc.)
 * - Auto-fix capability for certain violations
 * - Git integration for staged file analysis
 * - Configurable rule sets and severity levels
 *
 * @example
 * ```bash
 * codeforge analyze src/
 * codeforge analyze --staged
 * codeforge analyze --format json --output report.json
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import ora, { type Ora } from 'ora'
import pLimit from 'p-limit'

import { type RuleViolation } from '../ast/visitor.js'
import { hashFile, ResultCache } from '../cache/index.js'
import { ConfigCache } from '../config/cache.js'
import { type DiscoveredFile, discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { type OutputFormat, Reporter } from '../core/reporter.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { filterSuppressedViolations, parseSuppressionsFromSourceFile } from '../core/suppression-parser.js'
import { applyFixesToFile, type RuleWithFix } from '../fix/fixer.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import {
  applyFixesToFiles,
  filterFilesByExtension,
  getProfileSeverityOverrides,
  loadCommandConfig,
  normalizeFlags,
  setupRuleRegistryLazy,
} from '../utils/command-helpers.js'
import { CLIError } from '../utils/errors.js'
import { getGitRoot, getStagedFiles, isGitRepository } from '../utils/git-helpers.js'
import { logger, LogLevel } from '../utils/logger.js'

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
  configHash: null | string
  discoveredFiles: DiscoveredFile[]
  parseCache: Map<string, import('../core/parser.js').ParseResult>
  parser: Parser
  registry: RuleRegistry
  resultCache: null | ResultCache
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
    {
      command: '<%= config.bin %> <%= command.id %> --severity-level warning',
      description: 'Show only warnings and errors (no info)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore-path .codeforgeignore',
      description: 'Use custom ignore file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --profile strict',
      description: 'Run with strict severity profile (all rules as errors)',
    },
  ]

  static override flags = {
    'cache-results': Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Enable caching of analysis results for unchanged files',
    }),
    ci: Flags.boolean({
      default: false,
      description: 'Run in CI mode (disables colors, progress, sets JSON output)',
    }),
    color: Flags.boolean({
      allowNo: true,
      default: true,
      description: 'Control color output in terminal',
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
    'ignore-path': Flags.string({
      description: 'Path to ignore file (one pattern per line)',
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
    'severity-level': Flags.string({
      default: 'info',
      description: 'Minimum severity level to report (error, warning, info)',
      options: ['error', 'info', 'warning'],
    }),
    profile: Flags.string({
      char: 'p',
      description:
        'Use a severity profile to override rule severities (strict, moderate, lenient)',
      options: ['strict', 'moderate', 'lenient'],
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

    const normalized = normalizeFlags(flags)
    this.configureLogging(normalized.verbose, normalized.quiet)

    const targetPath = path.resolve(args.path as string)
    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const config = await loadCommandConfig(flags, this.configCache)
    const ignore = await this.resolveIgnorePatterns(config.ignore ?? [], flags['ignore-path'])

    const filteredFiles = await this.collectFiles({
      cwd: targetPath,
      ext: flags.ext,
      files: config.files ?? [],
      ignore,
      quiet: normalized.quiet,
      stagedMode: normalized.stagedMode,
    })

    if (filteredFiles.length === 0) {
      this.exit(0)
    }

    const registry = await setupRuleRegistryLazy(flags.rules)
    const parser = new Parser()
    await parser.initialize()

    const parseCache = new Map<string, import('../core/parser.js').ParseResult>()
    const resultCache = normalized.cacheResults ? new ResultCache() : null
    const activeRuleIds = registry.getEnabledRules().map((r) => r.definition.meta.name)
    const configHash = resultCache ? resultCache.hashConfig(activeRuleIds) : ''

    const startTime = performance.now()
    const analysisSpinner = normalized.quiet ? null : ora('Analyzing files...').start()

    const { allViolations, fileReports } = await this.analyzeFiles({
      concurrency: normalized.concurrency,
      configHash,
      discoveredFiles: filteredFiles,
      parseCache,
      parser,
      registry,
      resultCache,
      spinner: analysisSpinner,
      verbose: normalized.verbose,
    })

    analysisSpinner?.succeed('Analysis complete')

    const profileName = flags.profile as 'lenient' | 'moderate' | 'strict' | undefined
    const violationsToFilter = profileName
      ? this.applyProfileOverrides(allViolations, profileName)
      : allViolations

    const severityLevel = flags['severity-level'] as 'error' | 'info' | 'warning'
    const filteredViolations = this.filterBySeverity(violationsToFilter, severityLevel)
    const profiledFileReports = profileName
      ? this.applyProfileOverridesToFileReports(fileReports, profileName)
      : fileReports
    const filteredFileReports = this.filterFileReports(profiledFileReports, severityLevel)

    if (normalized.shouldFix) {
      await this.runFixes({
        allViolations: filteredViolations,
        concurrency: normalized.concurrency,
        discoveredFiles: filteredFiles,
        dryRun: normalized.dryRun,
        parseCache,
        parser,
        quiet: normalized.quiet,
        verbose: normalized.verbose,
      })
    }

    parser.dispose()

    const duration = performance.now() - startTime
    const summary = this.generateSummary(filteredViolations, filteredFiles.length, duration)

    const reporter = new Reporter({
      color: normalized.ciMode ? false : flags.color,
      format: normalized.format as OutputFormat,
      outputPath: normalized.output,
      quiet: normalized.ciMode || flags.quiet,
      verbose: normalized.ciMode ? false : flags.verbose,
    })

    await reporter.writeReport({ files: filteredFileReports, summary })

    const exitCode = this.determineExitCode(
      summary,
      normalized.failOnWarnings,
      normalized.maxWarnings,
    )
    this.exit(exitCode)
  }

  private async analyzeFiles(options: AnalyzeFilesOptions): Promise<AnalysisResult> {
    const {
      concurrency,
      configHash,
      discoveredFiles,
      parseCache,
      parser,
      registry,
      resultCache,
      spinner,
      verbose,
    } = options
    const limit = pLimit(concurrency)

    const results = await Promise.all(
      discoveredFiles.map((file, index) =>
        limit(async () => {
          if (!file) return null

          if (spinner && verbose) {
            spinner.text = `Analyzing ${file.path} (${index + 1}/${discoveredFiles.length})`
          }

          try {
            // Check result cache first
            if (resultCache && configHash) {
              try {
                const fileHash = await hashFile(file.absolutePath)
                const cachedViolations = await resultCache.get(
                  file.absolutePath,
                  fileHash,
                  configHash,
                )
                if (cachedViolations) {
                  logger.debug(`Result cache HIT for ${file.path}`)
                  const violationsWithFilePath = cachedViolations.map((v) => ({
                    ...v,
                    filePath: file.path,
                  }))
                  return {
                    filePath: file.path,
                    violations: violationsWithFilePath,
                  }
                }
              } catch (cacheError) {
                logger.debug(`Result cache error for ${file.path}: ${cacheError}`)
              }
            }

            const parseResult = await parser.parseFile(file.absolutePath)
            parseCache.set(file.absolutePath, parseResult)

            const violations = registry.runRules(parseResult.sourceFile)

            const { suppressions } = parseSuppressionsFromSourceFile(parseResult.sourceFile)
            const unsuppressedViolations = filterSuppressedViolations(violations, suppressions)

            const violationsWithFilePath = unsuppressedViolations.map((v) => ({
              ...v,
              filePath: file.path,
            }))

            // Cache results if caching is enabled
            if (resultCache && configHash) {
              try {
                const fileHash = await hashFile(file.absolutePath)
                await resultCache.set(file.absolutePath, fileHash, configHash, violations)
              } catch (cacheError) {
                logger.debug(`Failed to cache results for ${file.path}: ${cacheError}`)
              }
            }

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

  private async collectFiles(options: {
    cwd: string
    ext: string
    files: string[]
    ignore: string[]
    quiet: boolean
    stagedMode: boolean
  }): Promise<DiscoveredFile[]> {
    const { cwd, ext, files, ignore, quiet, stagedMode } = options
    const spinner = quiet ? null : ora('Discovering files...').start()

    const targetStat = statSync(cwd)
    const discoveredFiles: DiscoveredFile[] = targetStat.isFile()
      ? [{ absolutePath: cwd, path: path.relative(process.cwd(), cwd) }]
      : await this.discoverFiles({ cwd, files, ignore, spinner, stagedMode })

    const filtered = filterFilesByExtension(discoveredFiles, ext)

    if (filtered.length === 0) {
      spinner?.warn('No files found to analyze')
    } else {
      spinner?.succeed(`Found ${filtered.length} files to analyze`)
    }

    return filtered
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

  private filterBySeverity(
    violations: RuleViolation[],
    minLevel: 'error' | 'info' | 'warning',
  ): RuleViolation[] {
    const severityOrder = { error: 3, info: 1, warning: 2 }
    const minOrder = severityOrder[minLevel]

    return violations.filter((v) => {
      const vOrder = severityOrder[v.severity as keyof typeof severityOrder] ?? 0
      return vOrder >= minOrder
    })
  }

  private filterFileReports(
    fileReports: FileReport[],
    minLevel: 'error' | 'info' | 'warning',
  ): FileReport[] {
    const severityOrder = { error: 3, info: 1, warning: 2 }
    const minOrder = severityOrder[minLevel]

    return fileReports
      .map((report) => ({
        ...report,
        violations: report.violations.filter((v) => {
          const vOrder = severityOrder[v.severity as keyof typeof severityOrder] ?? 0
          return vOrder >= minOrder
        }),
      }))
      .filter((report) => report.violations.length > 0)
  }

  private applyProfileOverrides(
    violations: RuleViolation[],
    profile: 'lenient' | 'moderate' | 'strict',
  ): RuleViolation[] {
    const overrides = getProfileSeverityOverrides(profile)
    if (Object.keys(overrides).length === 0) return violations
    return violations.map((v) => {
      const override = overrides[v.ruleId]
      return override ? { ...v, severity: override } : v
    })
  }

  private applyProfileOverridesToFileReports(
    reports: FileReport[],
    profile: 'lenient' | 'moderate' | 'strict',
  ): FileReport[] {
    const overrides = getProfileSeverityOverrides(profile)
    if (Object.keys(overrides).length === 0) return reports
    return reports.map((report) => ({
      ...report,
      violations: report.violations.map((v) => {
        const override = overrides[v.ruleId]
        return override ? { ...v, severity: override } : v
      }),
    }))
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

  private async getRulesWithFixes(): Promise<Map<string, RuleWithFix>> {
    const rulesWithFixes = new Map<string, RuleWithFix>()
    const allRules = await lazyRuleLoader.loadAllRules()

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

  private async readIgnoreFile(ignorePath: string): Promise<string[]> {
    try {
      const content = await readFile(ignorePath, 'utf8')
      return content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))
    } catch {
      return []
    }
  }

  private async resolveIgnorePatterns(
    baseIgnore: string[],
    ignorePath: string | undefined,
  ): Promise<string[]> {
    if (!ignorePath) return baseIgnore
    const patterns = await this.readIgnoreFile(ignorePath)
    return [...baseIgnore, ...patterns]
  }

  private async runFixes(options: {
    allViolations: RuleViolation[]
    concurrency: number
    discoveredFiles: DiscoveredFile[]
    dryRun: boolean
    parseCache: Map<string, import('../core/parser.js').ParseResult>
    parser: Parser
    quiet: boolean
    verbose: boolean
  }): Promise<FixResult> {
    const {
      allViolations,
      concurrency,
      discoveredFiles,
      dryRun,
      parseCache,
      parser,
      quiet,
      verbose,
    } = options
    if (allViolations.length === 0) return { fixesApplied: 0, fixesSkipped: 0 }

    const fixSpinner = quiet
      ? null
      : ora(dryRun ? 'Previewing fixes...' : 'Applying fixes...').start()
    const rulesWithFixes = await this.getRulesWithFixes()

    const fixResult = await applyFixesToFiles({
      allViolations,
      applyFixesFn: (opts) =>
        this.applyFixes({
          allViolations: opts.allViolations,
          concurrency: opts.concurrency,
          discoveredFiles: opts.discoveredFiles,
          dryRun: opts.dryRun,
          parseCache: opts.parseCache,
          parser: opts.parser,
          rulesWithFixes: opts.rulesWithFixes,
          verbose: opts.verbose,
        }),
      concurrency,
      discoveredFiles,
      dryRun,
      parseCache,
      parser,
      quiet,
      rulesWithFixes,
      verbose,
    })

    fixSpinner?.succeed(
      dryRun
        ? `Would apply ${fixResult.fixesApplied} fixes, skip ${fixResult.fixesSkipped} (dry run)`
        : `Applied ${fixResult.fixesApplied} fixes, skipped ${fixResult.fixesSkipped}`,
    )

    return fixResult
  }
}
