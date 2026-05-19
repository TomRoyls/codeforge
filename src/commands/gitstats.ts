import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildGitStatsResult } from './gitstats-helpers.js'
import { formatGitStatsJson, formatGitStatsTable } from './gitstats-format-helpers.js'

export default class GitStats extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to git repository',
      required: false,
    }),
  }

  static override description = 'Display git repository statistics dashboard'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show git stats for current repository',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./my-project',
      description: 'Show git stats for another repository',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output git stats as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --since "6 months ago"',
      description: 'Stats for the last 6 months',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --branch main --verbose',
      description: 'Verbose stats for main branch',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output stats.json',
      description: 'Export stats to JSON file',
    },
  ]

  static override flags = {
    branch: Flags.string({
      default: '',
      description: 'Branch to analyze (default: current)',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    since: Flags.string({
      description: 'Start date (e.g. "2024-01-01" or "6 months ago")',
    }),
    until: Flags.string({
      description: 'End date (e.g. "2024-12-31")',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed breakdowns',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(GitStats)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    // Verify it's a git repo
    const gitCheck = resolve(targetPath, '.git')
    if (!existsSync(gitCheck)) {
      this.error(`Not a git repository: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing repository...').start()

    try {
      const result = buildGitStatsResult(targetPath, {
        branch: flags.branch || undefined,
        since: flags.since,
        until: flags.until,
      })

      spinner.succeed(`Analyzed ${result.totalCommits} commits by ${result.totalAuthors} authors`)

      const outputData =
        format === 'json' ? formatGitStatsJson(result) : formatGitStatsTable(result, flags.verbose)

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
    } catch (error) {
      spinner.fail('Failed to analyze repository')
      this.error(
        `Git analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        { exit: 1 },
      )
    }
  }
}

export { buildGitStatsResult } from './gitstats-helpers.js'
export type {
  BusFactor,
  CommitActivity,
  ContributorStat,
  DailyActivity,
  GitStatsOptions,
  GitStatsResult,
  HourlyActivity,
} from './gitstats-helpers.js'
export { formatGitStatsJson, formatGitStatsTable } from './gitstats-format-helpers.js'
