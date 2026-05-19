import { Args, Command, Flags } from '@oclif/core'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { getCurrentBranch, isGitRepository } from '../utils/git-helpers.js'
import {
  getRecentFilesFromFS,
  getRecentFilesFromGit,
  parseSincePeriod,
  type RecentResult,
} from './recently-changed-helpers.js'
import { formatRecentCsv, formatRecentJson, formatRecentTable } from './recently-changed-format-helpers.js'

export default class RecentlyChanged extends Command {
  static override aliases = ['recent']

  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for recently changed files',
      required: false,
    }),
  }

  static override description = 'Show recently modified files based on git log or filesystem timestamps'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show 10 most recently changed files in the last week',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/',
      description: 'Show recently changed files in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --count 20 --since 1m',
      description: 'Show 20 files changed in the last month',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --author john --verbose',
      description: 'Show files changed by john with commit messages',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output recent.json',
      description: 'Export recently changed files as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --no-git',
      description: 'Use filesystem mtime instead of git log',
    },
  ]

  static override flags = {
    author: Flags.string({
      char: 'a',
      description: 'Filter by git author name',
    }),
    count: Flags.integer({
      char: 'n',
      default: 10,
      description: 'Number of files to show',
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
      default: '1w',
      description: 'Time period (e.g., "1d", "1w", "1m", "1y" for day/week/month/year)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show commit message',
    }),
    'no-git': Flags.boolean({
      default: false,
      description: 'Use filesystem mtime instead of git log',
    }),
  }

  static override id = 'recently-changed'

  async run(): Promise<void> {
    const { args, flags } = await this.parse(RecentlyChanged)

    const targetPath = resolve(args.path as string)
    const sinceDate = parseSincePeriod(flags.since)
    const count = flags.count

    const spinner = ora('Scanning for recently changed files...').start()

    let files
    let branch = ''

    if (flags['no-git']) {
      files = await getRecentFilesFromFS(targetPath, sinceDate, count)
    } else {
      if (!isGitRepository(targetPath)) {
        spinner.fail('Not a git repository. Use --no-git to use filesystem timestamps.')
        this.exit(1)
        return
      }

      branch = getCurrentBranch(targetPath)
      files = getRecentFilesFromGit(targetPath, sinceDate, count, flags.author)
    }

    const result: RecentResult = {
      branch,
      files,
      since: flags.since,
      totalScanned: files.length,
    }

    spinner.succeed(`Found ${files.length} recently changed file${files.length === 1 ? '' : 's'}`)

    const format = flags.format as 'csv' | 'json' | 'table'
    const outputData =
      format === 'json'
        ? formatRecentJson(result)
        : format === 'csv'
          ? formatRecentCsv(result, flags.verbose)
          : formatRecentTable(result, flags.verbose)

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

export {
  getRecentFilesFromFS,
  getRecentFilesFromGit,
  parseSincePeriod,
  type ChangedFile,
  type RecentResult,
} from './recently-changed-helpers.js'
export { formatRecentCsv, formatRecentJson, formatRecentTable } from './recently-changed-format-helpers.js'
