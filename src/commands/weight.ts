import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildWeightResult } from './weight-helpers.js'
import { formatWeightCsv, formatWeightJson, formatWeightResultTable } from './weight-format-helpers.js'

export default class Weight extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze import weights',
      required: false,
    }),
  }

  static override description = 'Analyze dependency weight and import cost'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx --top 10',
      description: 'Show top 10 heaviest TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show full weight table and heatmap',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output weights.csv',
      description: 'Export weights to CSV',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
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
    top: Flags.integer({
      char: 't',
      default: 10,
      description: 'Number of heaviest files to show',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show full weight table and heatmap',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Weight)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
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

    spinner.text = 'Analyzing import weights...'

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

    const result = buildWeightResult(filePaths, contents, { top: flags.top })

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files — avg weight: ${result.stats.averageWeightScore}/100`)

    const outputData =
      format === 'json'
        ? formatWeightJson(result)
        : format === 'csv'
          ? formatWeightCsv(result)
          : formatWeightResultTable(result, verbose)

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

export { buildImportGraph, buildWeightResult, classifyWeight, computeDistribution, computeFileWeight, computeTransitiveImports, findHeaviest, generateRecommendations, resolveImportPath } from './weight-helpers.js'
export type { FileWeight, ImportWeight, WeightDistribution, WeightOptions, WeightResult, WeightStats } from './weight-helpers.js'
export { formatWeightCsv, formatWeightDistribution, formatWeightHeatmap, formatWeightJson, formatWeightRecommendations, formatWeightResultTable, formatWeightStatsLine, formatWeightTable, formatHeaviestFiles } from './weight-format-helpers.js'
