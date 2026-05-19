import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import {
  buildTrendsResult,
  type PeriodType,
  type TrendsOptions,
} from './trends-helpers.js'
import { formatTrendsCsv, formatTrendsJson, formatTrendsTable } from './trends-format-helpers.js'

export default class Trends extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze git history for',
      required: false,
    }),
  }

  static override description = 'Analyze codebase trends over time'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show weekly trends for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --period month',
      description: 'Show monthly trends for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --period day --since 2024-01-01',
      description: 'Show daily trends since Jan 1, 2024',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output trends.json',
      description: 'Export trends to JSON file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 20 --verbose',
      description: 'Show top 20 churn files with details',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --since HEAD~50 --until HEAD',
      description: 'Show trends for last 50 commits',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    period: Flags.string({
      default: 'week',
      description: 'Grouping period',
      options: ['day', 'month', 'week'],
    }),
    since: Flags.string({
      description: 'Date or commit ref to start from',
    }),
    'top': Flags.integer({
      default: 10,
      description: 'Show top N churn files',
    }),
    until: Flags.string({
      description: 'Date or commit ref to end at',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Trends)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const period = flags.period as PeriodType

    const spinner = ora('Analyzing git history...').start()

    const options: TrendsOptions = {
      period,
      since: flags.since,
      top: flags.top,
      until: flags.until,
    }

    const result = buildTrendsResult(targetPath, options)

    spinner.succeed(
      `Analyzed ${result.summary.totalCommits} commits across ${result.summary.totalPeriods} ${period}(s)`,
    )

    const outputData =
      format === 'json'
        ? formatTrendsJson(result)
        : format === 'csv'
          ? formatTrendsCsv(result)
          : formatTrendsTable(result, flags.verbose)

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
