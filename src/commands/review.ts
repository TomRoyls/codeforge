import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildReviewResult, type ReviewOptions } from './review-helpers.js'
import { formatReviewCsv, formatReviewJson, formatReviewResultTable } from './review-format-helpers.js'

export default class Review extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to review',
      required: false,
    }),
  }

  static override description = 'Automated code review with quality checks'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Review current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Review src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --severity error',
      description: 'Show only errors',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Review TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all findings',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output review.csv',
      description: 'Export review to CSV',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to review (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    severity: Flags.string({
      char: 's',
      default: 'all',
      description: 'Minimum severity level',
      options: ['all', 'warning', 'error'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show all findings',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Review)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const severityFilter = flags.severity as 'all' | 'warning' | 'error'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Reviewing code...'

    const filePaths: string[] = []
    const contents: string[] = []

    await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          filePaths.push(file.path)
          contents.push(content)
        } catch {
          // skip unreadable files
        }
      }),
    )

    const options: ReviewOptions = { severity: severityFilter }
    const result = buildReviewResult(filePaths, contents, options)

    spinner.succeed(`Reviewed ${result.stats.totalFiles} files — ${result.stats.totalFindings} findings (${result.stats.overallGrade})`)

    const outputData =
      format === 'json'
        ? formatReviewJson(result)
        : format === 'csv'
          ? formatReviewCsv(result)
          : formatReviewResultTable(result, verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputData)
    }
  }
}

export { buildReviewResult, computeFileScore, computeGrade, estimateFixTime, generateRecommendations, reviewFile, checkNoTypeAssertion, checkNoTsIgnore, checkNoEmptyCatch, checkNoConsoleLog, checkMaxComplexity, checkMaxFileLength, checkMaxFunctionLength, checkMaxNesting, checkNoMagicNumbers, checkRequireJsdoc, checkNoAnyType, checkNoVar, checkPreferConst, checkNoHardcodedStrings, checkConsistentReturn, resetCounter } from './review-helpers.js'
export type { ReviewFinding, FileReview, ReviewStats, ReviewResult, ReviewOptions } from './review-helpers.js'
export { formatFindingsTable, formatFileGrades, formatCategoryBreakdown, formatTopIssues, formatStatsLine, formatRecommendations, formatReviewResultTable, formatReviewJson, formatReviewCsv } from './review-format-helpers.js'
