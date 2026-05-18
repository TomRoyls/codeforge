import { Args, Command, Flags } from '@oclif/core'
import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import ora from 'ora'
import pLimit from 'p-limit'

import type { AnalysisResult } from '../reporters/types.js'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import {
  createReporter,
  CUSTOM_REPORTER_PREFIX,
  type OutputFormat,
  readAnalysisFile,
} from './report-helpers.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import { CLIError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'
import { getPlatformOpenCommand } from './report-helpers.js'

const execAsync = promisify(exec)

export default class Report extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Generate analysis reports in various formats'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate console report for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Generate JSON report for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format html --output report.html --open',
      description: 'Generate and open HTML report',
    },
    {
      command:
        '<%= config.bin %> <%= command.id %> --input analysis.json --format html --output report.html',
      description: 'Generate HTML report from cached analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format junit --output junit.xml',
      description: 'Generate JUnit XML report for CI/CD',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format sarif --output results.sarif',
      description: 'Generate SARIF report for GitHub Code Scanning',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format gitlab --output gl-code-quality.json',
      description: 'Generate GitLab Code Quality report',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format markdown --output REPORT.md',
      description: 'Generate Markdown report for documentation',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --concurrency 4',
      description: 'Process 4 files in parallel',
    },
  ]

  static override flags = {
    concurrency: Flags.integer({
      default: os.cpus().length,
      description: 'Number of files to process in parallel',
    }),
    format: Flags.string({
      char: 'f',
      default: 'console',
      description:
        'Output format (console, json, html, junit, sarif, markdown, gitlab, csv, or custom:<path>)',
    }),
    input: Flags.string({
      char: 'i',
      description: 'Input JSON file from previous analyze command',
    }),
    open: Flags.boolean({
      default: false,
      description: 'Open HTML report in browser (only works with --format html)',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (required for html format)',
    }),
    pretty: Flags.boolean({
      default: false,
      description: 'Pretty print JSON output',
    }),
    verbose: Flags.boolean({
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Report)
    const format = flags.format as OutputFormat

    if (format === 'html' && !flags.output) {
      this.error(
        '--output is required when using --format html. Specify the path where the HTML report should be saved.',
        { exit: 1 },
      )
    }

    if (format.startsWith(CUSTOM_REPORTER_PREFIX) && !flags.output) {
      this.warn('Custom reporters typically need --output to write results')
    }

    const results = flags.input
      ? await this.loadFromInput(flags.input)
      : await this.runAnalysis(args.path, flags.concurrency)

    const reporter = await createReporter(format, {
      outputPath: flags.output,
      pretty: flags.pretty,
      verbose: flags.verbose,
    })

    reporter.report(results)

    if (flags.open && format === 'html' && flags.output) {
      await this.openInBrowser(flags.output)
    }
  }

  private async loadFromInput(inputPath: string): Promise<AnalysisResult> {
    try {
      return await readAnalysisFile(inputPath)
    } catch (error) {
      if (error instanceof CLIError) {
        this.error(error.message, { exit: 1 })
      }

      throw error
    }
  }

  private async openInBrowser(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath)

    if (!existsSync(absolutePath)) {
      this.error(`Report file not found: ${absolutePath}`, { exit: 1 })
    }

    this.log(`Opening report in browser: ${absolutePath}`)

    const command = getPlatformOpenCommand(absolutePath, process.platform)

    try {
      await execAsync(command)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.warn(`Failed to open browser: ${message}`)
      this.log(`Please open the report manually: ${absolutePath}`)
    }
  }

  private async runAnalysis(targetPath: string, concurrency: number): Promise<AnalysisResult> {
    const absolutePath = path.resolve(targetPath)

    if (!existsSync(absolutePath)) {
      this.error(`Path not found: ${absolutePath}`, { exit: 1 })
    }

    this.log(`Analyzing: ${absolutePath}`)

    const startTime = performance.now()

    const discoveredFiles = await discoverFiles({
      cwd: absolutePath,
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const registry = new RuleRegistry()
    const allRules = await lazyRuleLoader.loadAllRules()
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    const parser = new Parser()
    await parser.initialize()

    const limit = pLimit(concurrency)
    const spinner = ora('Analyzing files...').start()
    let completedCount = 0
    const totalFiles = discoveredFiles.length

    const fileResults = await Promise.all(
      discoveredFiles.map((file) =>
        limit(async () => {
          if (!file) return null

          try {
            const parseResult = await parser.parseFile(file.absolutePath)
            const violations = registry.runRules(parseResult.sourceFile)

            completedCount++
            spinner.text = `Analyzing files... (${completedCount}/${totalFiles})`

            return {
              filePath: file.path,
              stats: {
                analysisTime: 0,
                parseTime: parseResult.parseTime,
                totalTime: parseResult.parseTime,
              },
              violations: violations.map((v) => ({
                column: v.range.start.column,
                endColumn: v.range.end.column,
                endLine: v.range.end.line,
                filePath: file.path,
                line: v.range.start.line,
                message: v.message,
                ruleId: v.ruleId,
                severity: v.severity,
                suggestion: v.suggestion,
              })),
            }
          } catch (error) {
            logger.debug(`Failed to parse file ${file.path} during report analysis: ${error}`)
            completedCount++
            spinner.text = `Analyzing files... (${completedCount}/${totalFiles})`
            return null
          }
        }),
      ),
    )

    spinner.succeed(`Analyzed ${totalFiles} files`)

    parser.dispose()

    const validResults = fileResults.filter((r): r is NonNullable<typeof r> => r !== null)
    const allViolations = validResults.flatMap((r) => r.violations)
    const duration = performance.now() - startTime

    let errorCount = 0
    let warningCount = 0
    let infoCount = 0
    for (const v of allViolations) {
      if (v.severity === 'error') errorCount++
      else if (v.severity === 'warning') warningCount++
      else if (v.severity === 'info') infoCount++
    }
    let filesWithViolations = 0
    for (const r of validResults) {
      if (r.violations.length > 0) filesWithViolations++
    }

    return {
      files: validResults,
      summary: {
        errorCount,
        filesWithViolations,
        infoCount,
        totalFiles: validResults.length,
        totalTime: duration,
        warningCount,
      },
      timestamp: new Date().toISOString(),
      version: this.config.version,
    }
  }
}
