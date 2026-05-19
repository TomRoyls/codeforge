import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import {
  buildContributors,
  buildContributorsResult,
  executeGitCommand,
  parseGitLogByFile,
  parseGitLogDates,
  parseGitLogNumstat,
  parseGitLogShort,
} from './contributors-helpers.js'
import { formatContributorsCsv, formatContributorsJson, formatContributorsTable } from './contributors-format-helpers.js'

export default class Contributors extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to git repository',
      required: false,
    }),
  }

  static override description = 'Analyze git contributors and commit patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze contributors in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output contributor analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --since 2024-01-01',
      description: 'Analyze contributors since a specific date',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --until HEAD~10',
      description: 'Analyze contributors up to 10 commits ago',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --by-file',
      description: 'Show per-file contributor breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 5 --verbose',
      description: 'Show top 5 contributors with detailed info',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output contributors.csv',
      description: 'Export contributor data to CSV',
    },
  ]

  static override flags = {
    'by-file': Flags.boolean({
      default: false,
      description: 'Show per-file contributor breakdown',
    }),
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
      description: 'Date or commit ref to start from',
    }),
    top: Flags.integer({
      description: 'Show only top N contributors',
    }),
    until: Flags.string({
      description: 'Date or commit ref to end at',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output including active periods',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Contributors)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { verbose } = flags
    const byFile = flags['by-file']

    const spinner = ora('Analyzing contributors...').start()

    const rangeArgs: string[] = []
    if (flags.since) rangeArgs.push(`--since=${flags.since}`)
    if (flags.until) rangeArgs.push(`--until=${flags.until}`)

    const shortLog = executeGitCommand(
      ['log', ...rangeArgs, '--format=%aN|%aE'],
      targetPath,
    )
    const numstatLog = executeGitCommand(
      ['log', ...rangeArgs, '--numstat', '--format=COMMIT:%aN|%aE'],
      targetPath,
    )
    const datesLog = executeGitCommand(
      ['log', ...rangeArgs, '--format=%aE|%aI'],
      targetPath,
    )

    const parsedShort = parseGitLogShort(shortLog)
    const parsedNumstat = parseGitLogNumstat(numstatLog)
    const parsedDates = parseGitLogDates(datesLog)

    const contributors = buildContributors(parsedShort, parsedNumstat, parsedDates)

    let byFileData: ReturnType<typeof parseGitLogByFile> = []
    if (byFile) {
      spinner.text = 'Analyzing per-file contributors...'
      const byFileLog = executeGitCommand(
        ['log', ...rangeArgs, '--format=COMMIT:%aN', '--name-only'],
        targetPath,
      )
      byFileData = parseGitLogByFile(byFileLog)
    }

    const topContributors = flags.top ? contributors.slice(0, flags.top) : contributors
    const result = buildContributorsResult(topContributors, byFileData)

    spinner.succeed(`Found ${contributors.length} contributors (${result.totalCommits} commits)`)

    const outputData =
      format === 'json'
        ? formatContributorsJson(result)
        : format === 'csv'
          ? formatContributorsCsv(result)
          : formatContributorsTable(result, verbose, byFile)

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

export { buildContributors, buildContributorsResult, calculateBusFactor, executeGitCommand, parseGitLogByFile, parseGitLogDates, parseGitLogNumstat, parseGitLogShort } from './contributors-helpers.js'
export type { Contributor, ContributorsResult, FileContributor, FileContributorEntry } from './contributors-helpers.js'
export { formatCommitBar, formatContributorsCsv, formatContributorsJson, formatContributorsTable } from './contributors-format-helpers.js'
