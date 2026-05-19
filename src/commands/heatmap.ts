import * as fs from 'node:fs/promises'

import { Command, Flags } from '@oclif/core'
import ora from 'ora'

import { isGitRepository } from '../utils/git-helpers.js'
import {
  getCommitActivity,
  getPeriodDates,
  groupByAuthor,
  groupByDay,
  groupByHour,
  type HeatmapResult,
} from './heatmap-helpers.js'
import { formatHeatmapJson, formatHeatmapText } from './heatmap-format-helpers.js'

export default class Heatmap extends Command {
  static override description = 'Show git commit activity heatmap'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show commit heatmap for the last month',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --period week',
      description: 'Show commit heatmap for the last week',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --by-hour',
      description: 'Show hourly commit distribution',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --by-author',
      description: 'Show per-author commit breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --author Alice',
      description: 'Filter commits by author',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json -o heatmap.json',
      description: 'Output heatmap as JSON to a file',
    },
  ]

  static override flags = {
    author: Flags.string({
      char: 'a',
      description: 'Filter by git author',
    }),
    'by-author': Flags.boolean({
      default: false,
      description: 'Show per-author breakdown',
    }),
    'by-hour': Flags.boolean({
      default: false,
      description: 'Show hourly distribution instead of daily',
    }),
    format: Flags.string({
      char: 'f',
      default: 'text',
      description: 'Output format',
      options: ['json', 'text'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    period: Flags.string({
      default: 'month',
      description: 'Time period to cover',
      options: ['month', 'week', 'year'],
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Heatmap)

    const cwd = process.cwd()

    if (!isGitRepository(cwd)) {
      this.error('Not a git repository', { exit: 1 })
    }

    const spinner = ora('Generating heatmap...').start()

    const commits = getCommitActivity(cwd, flags.period, flags.author)
    const days = groupByDay(commits)
    const hours = groupByHour(commits)
    const authors = groupByAuthor(commits)

    const { startDate, endDate } = getPeriodDates(flags.period)

    const result: HeatmapResult = {
      authors,
      days,
      endDate,
      hours,
      period: flags.period,
      startDate,
      totalCommits: commits.length,
    }

    spinner.succeed(`Generated heatmap with ${commits.length} commits`)

    const format = flags.format as 'json' | 'text'
    const outputData =
      format === 'json'
        ? formatHeatmapJson(result)
        : formatHeatmapText(result, {
            byAuthor: flags['by-author'],
            byHour: flags['by-hour'],
          })

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Heatmap written to ${flags.output}`)
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

export {
  getCommitActivity,
  getPeriodDates,
  groupByAuthor,
  groupByDay,
  groupByHour,
  type AuthorActivity,
  type CommitEntry,
  type DayActivity,
  type HeatmapResult,
  type HourActivity,
} from './heatmap-helpers.js'
export { formatHeatmapJson, formatHeatmapText, type FormatOptions } from './heatmap-format-helpers.js'
