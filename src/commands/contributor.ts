import { Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import ora from 'ora'

import { buildContributorResult, parseGitLogForContributors, type ContributorResult } from './contributor-helpers.js'
import { formatContributorCsv, formatContributorJson, formatContributorTable } from './contributor-format-helpers.js'

export default class Contributor extends Command {
  static override description = 'Analyze git contributors and contribution patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze contributors in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output contributor analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --since 2024-01-01 --until 2024-12-31',
      description: 'Analyze contributors for a date range',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 5 --verbose',
      description: 'Show top 5 contributors with expertise details',
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
    since: Flags.string({
      char: 's',
      description: 'Start date for analysis (YYYY-MM-DD)',
    }),
    top: Flags.integer({
      char: 't',
      description: 'Show top N contributors',
    }),
    until: Flags.string({
      char: 'u',
      description: 'End date for analysis (YYYY-MM-DD)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show expertise details for each contributor',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Contributor)

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose, top } = flags

    const spinner = ora('Analyzing git history...').start()

    let gitArgs = [
      'log',
      '--format=COMMIT|%H|%aN|%ai',
      '--numstat',
    ]
    if (flags.since) gitArgs = [...gitArgs, `--since=${flags.since}`]
    if (flags.until) gitArgs = [...gitArgs, `--until=${flags.until}`]

    let gitOutput: string
    try {
      const { execFileSync } = await import('node:child_process')
      gitOutput = execFileSync('git', gitArgs, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })
    } catch {
      spinner.warn('Git history not available. Using empty data.')
      gitOutput = ''
    }

    const commits = parseGitLogForContributors(gitOutput)
    const result: ContributorResult = buildContributorResult(commits, { verbose, top })

    spinner.succeed(`Analyzed ${result.stats.totalCommits} commits from ${result.stats.totalContributors} contributors`)

    const outputData =
      format === 'json'
        ? formatContributorJson(result)
        : format === 'csv'
          ? formatContributorCsv(result)
          : formatContributorTable(result, verbose)

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

export { buildContributorResult, parseGitShortlog, parseGitLogForContributors, computeBusFactor, computeDistribution, detectKnowledgeSilos, buildContributors, computeContributorAreas, computeExpertise, computeContributorStats, generateContributorRecommendations } from './contributor-helpers.js'
export type { Contributor, ContributorArea, ContributorResult, ContributionDistribution, KnowledgeSilos, ContributorStats, ParsedCommit, ContributorOptions } from './contributor-helpers.js'
export { formatContributorCsv, formatContributorJson, formatContributorTable, formatLeaderboard, formatBusFactor, formatSilos, formatExpertiseMap, formatDistributionChart } from './contributor-format-helpers.js'
