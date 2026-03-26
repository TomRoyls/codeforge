import { Args, Command, Flags } from '@oclif/core'
import { exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import pLimit from 'p-limit'

import type { AnalysisResult, Reporter, ReporterOptions } from '../reporters/types.js'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { RuleRegistry } from '../core/rule-registry.js'
import { ConsoleReporter } from '../reporters/console-reporter.js'
import { GitLabReporter } from '../reporters/gitlab-reporter.js'
import { HTMLReporter } from '../reporters/html-reporter.js'
import { JSONReporter } from '../reporters/json-reporter.js'
import { JUnitReporter } from '../reporters/junit-reporter.js'
import { MarkdownReporter } from '../reporters/markdown-reporter.js'
import { SARIFReporter } from '../reporters/sarif-reporter.js'
import { allRules, getRuleCategory } from '../rules/index.js'
import { CLIError } from '../utils/errors.js'

const execAsync = promisify(exec)

type OutputFormat = 'console' | 'gitlab' | 'html' | 'json' | 'junit' | 'markdown' | 'sarif'

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
      description: 'Output format',
      options: ['console', 'gitlab', 'html', 'json', 'junit', 'markdown', 'sarif'],
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
      this.error('--output is required when using --format html', { exit: 1 })
    }

    const results = flags.input
      ? await this.loadFromInput(flags.input)
      : await this.runAnalysis(args.path, flags.concurrency)

    const reporter = this.createReporter(format, {
      outputPath: flags.output,
      pretty: flags.pretty,
      verbose: flags.verbose,
    })

    reporter.report(results)

    if (flags.open && format === 'html' && flags.output) {
      await this.openInBrowser(flags.output)
    }
  }

  private createReporter(format: OutputFormat, options: ReporterOptions): Reporter {
    switch (format) {
      case 'gitlab': {
        return new GitLabReporter(options)
      }

      case 'html': {
        return new HTMLReporter(options)
      }

      case 'json': {
        return new JSONReporter(options)
      }

      case 'junit': {
        return new JUnitReporter(options)
      }

      case 'markdown': {
        return new MarkdownReporter(options)
      }

      case 'sarif': {
        return new SARIFReporter(options)
      }

      default: {
        return new ConsoleReporter(options)
      }
    }
  }

  private async loadFromInput(inputPath: string): Promise<AnalysisResult> {
    if (!existsSync(inputPath)) {
      this.error(`Input file not found: ${inputPath}`, { exit: 1 })
    }

    const content = await readFile(inputPath, 'utf8')

    try {
      const data = JSON.parse(content) as AnalysisResult

      if (!data.files || !data.summary || !data.timestamp) {
        this.error('Invalid analysis file format: missing required fields', { exit: 1 })
      }

      return data
    } catch (jsonError) {
      const message = jsonError instanceof Error ? jsonError.message : 'Unknown error'
      throw CLIError.invalidInput(`Invalid JSON in input file: ${inputPath}\n  ${message}`, [
        'Validate your JSON syntax at jsonlint.com',
        'Ensure the file was generated by the analyze command',
        'Check for file corruption or incomplete download',
      ])
    }
  }

  private async openInBrowser(filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath)

    if (!existsSync(absolutePath)) {
      this.error(`Report file not found: ${absolutePath}`, { exit: 1 })
    }

    this.log(`Opening report in browser: ${absolutePath}`)

    const platformCommands: Record<string, string> = {
      darwin: `open "${absolutePath}"`,
      win32: `start "" "${absolutePath}"`,
    }

    const command = platformCommands[process.platform] ?? `xdg-open "${absolutePath}"`

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
    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      registry.register(ruleId, ruleDef, getRuleCategory(ruleId))
    }

    const parser = new Parser()
    await parser.initialize()

    const limit = pLimit(concurrency)

    const fileResults = await Promise.all(
      discoveredFiles.map((file) =>
        limit(async () => {
          if (!file) return null

          try {
            const parseResult = await parser.parseFile(file.absolutePath)
            const violations = registry.runRules(parseResult.sourceFile)

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
          } catch {
            return null
          }
        }),
      ),
    )

    parser.dispose()

    const validResults = fileResults.filter((r): r is NonNullable<typeof r> => r !== null)
    const allViolations = validResults.flatMap((r) => r.violations)
    const duration = performance.now() - startTime

    return {
      files: validResults,
      summary: {
        errorCount: allViolations.filter((v) => v.severity === 'error').length,
        filesWithViolations: validResults.filter((r) => r.violations.length > 0).length,
        infoCount: allViolations.filter((v) => v.severity === 'info').length,
        totalFiles: validResults.length,
        totalTime: duration,
        warningCount: allViolations.filter((v) => v.severity === 'warning').length,
      },
      timestamp: new Date().toISOString(),
      version: this.config.version,
    }
  }
}
