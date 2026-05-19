import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildAgesResult, type AgesOptions } from './ages-helpers.js'
import { formatAgesCsv, formatAgesJson, formatAgesTable } from './ages-format-helpers.js'

export default class Ages extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze file ages',
      required: false,
    }),
  }

  static override description = 'Analyze file ages and staleness using git history'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze file ages in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze file ages in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --stale-days 90',
      description: 'Use 90 days as stale threshold',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sort newest --top 10',
      description: 'Show top 10 newest files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output with authors',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output ages.csv',
      description: 'Export ages to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
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
    'sort': Flags.string({
      description: 'Sort order',
      options: ['changes', 'newest', 'oldest'],
      default: 'oldest',
    }),
    'stale-days': Flags.integer({
      default: 180,
      description: 'Days threshold for stale files',
    }),
    'top': Flags.integer({
      char: 't',
      default: 20,
      description: 'Show top N files',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output with authors',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Ages)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags
    const staleDays = flags['stale-days']
    const top = flags['top']
    const sort = flags['sort'] as 'changes' | 'newest' | 'oldest'

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : ['.ts', '.tsx', '.js', '.jsx']

    const spinner = ora('Analyzing file ages...').start()

    const options: AgesOptions = {
      ext: extensions,
      ignore: flags.ignore ?? [],
      sort,
      staleDays,
      top,
    }

    const result = buildAgesResult(targetPath, options)

    spinner.succeed(
      `Analyzed ${result.stats.totalFiles} files (${result.staleFiles.length} stale)`,
    )

    const outputData =
      format === 'json'
        ? formatAgesJson(result)
        : format === 'csv'
          ? formatAgesCsv(result)
          : formatAgesTable(result, verbose)

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

export { buildAgesResult, computeAgeStats, computeAgeInDays, categorizeAge, parseGitLogDates, parseGitLogNumstat } from './ages-helpers.js'
export type { AgesResult, AgesOptions, AgeStats, FileAge } from './ages-helpers.js'
export { formatAgesCsv, formatAgesJson, formatAgesTable, formatAge, getAgeColor } from './ages-format-helpers.js'
