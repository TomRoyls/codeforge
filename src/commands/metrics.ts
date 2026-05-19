import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { collectMetrics } from './metrics-helpers.js'
import { formatMetricsCsv, formatMetricsDashboard, formatMetricsJson } from './metrics-format-helpers.js'

export default class Metrics extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Display codebase health metrics dashboard'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show metrics for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Show metrics for src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Show metrics for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed per-file metrics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output metrics.csv',
      description: 'Export metrics to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'dashboard',
      description: 'Output format',
      options: ['csv', 'dashboard', 'json'],
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show per-file details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Metrics)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'dashboard' | 'json'
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
        '**/*.json',
        '**/*.css',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
        '**/*.xml',
        '**/*.sql',
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

    spinner.text = 'Collecting metrics...'

    const metrics = await collectMetrics(filteredFiles, verbose)

    spinner.succeed(
      `Analyzed ${metrics.files} files across ${metrics.languages.length} languages`,
    )

    const outputData =
      format === 'json'
        ? formatMetricsJson(metrics)
        : format === 'csv'
          ? formatMetricsCsv(metrics)
          : formatMetricsDashboard(metrics)

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

export { collectMetrics, computeAverages, countComplexity, countTodos, detectLanguage } from './metrics-helpers.js'
export type { CodebaseMetrics, ComplexityMetric, DerivedMetrics, ExtensionMetric, LanguageMetric, SizeMetric, TodoCounts, TodoMetric } from './metrics-helpers.js'
export { formatMetricsCsv, formatMetricsDashboard, formatMetricsJson } from './metrics-format-helpers.js'
