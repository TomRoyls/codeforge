import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  analyzeFile,
  filterByExtension,
  type MetricKey,
  rankFiles,
  type TopResult,
} from './top-helpers.js'
import { formatTopCsv, formatTopJson, formatTopTable } from './top-format-helpers.js'

export default class Top extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Show top files ranked by a code quality metric'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show top 10 files by size',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --metric lines',
      description: 'Show top 10 files by line count',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --metric complexity -n 20',
      description: 'Show top 20 most complex files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output top.json',
      description: 'Save results to JSON file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx --metric todos',
      description: 'Show top files with most TODOs in TypeScript',
    },
  ]

  static override flags = {
    count: Flags.integer({
      char: 'n',
      default: 10,
      description: 'Number of files to show',
    }),
    desc: Flags.boolean({
      default: true,
      description: 'Sort descending',
      allowNo: true,
    }),
    ext: Flags.string({
      char: 'e',
      default: '',
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
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
    metric: Flags.string({
      char: 'm',
      default: 'size',
      description: 'Metric to rank by',
      options: ['complexity', 'lines', 'size', 'todos'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Top)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const metric = flags.metric as MetricKey
    const descending = flags.desc

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

    spinner.text = 'Analyzing files...'

    const fileMetrics = await Promise.all(
      discoveredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return analyzeFile(content, file.path)
        } catch {
          return analyzeFile('', file.path)
        }
      }),
    )

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : []

    const filtered = extensions.length > 0 ? filterByExtension(fileMetrics, extensions) : fileMetrics

    const ranked = rankFiles(filtered, metric, flags.count, descending)

    const result: TopResult = {
      files: ranked,
      metric: flags.metric,
      totalAnalyzed: filtered.length,
      totalCount: discoveredFiles.length,
    }

    spinner.succeed(`Analyzed ${filtered.length} files`)

    const outputData =
      format === 'json'
        ? formatTopJson(result)
        : format === 'csv'
          ? formatTopCsv(result)
          : formatTopTable(result)

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

export { analyzeFile, filterByExtension, rankFiles } from './top-helpers.js'
export type { FileMetric, MetricKey, TopResult } from './top-helpers.js'
export { formatTopCsv, formatTopJson, formatTopTable } from './top-format-helpers.js'
