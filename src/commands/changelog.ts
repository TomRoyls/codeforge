import * as fs from 'node:fs/promises'

import { Command, Flags } from '@oclif/core'
import ora from 'ora'

import { isGitRepository } from '../utils/git-helpers.js'
import { categorizeCommits, getGitLog, type ChangelogResult } from './changelog-helpers.js'
import { formatChangelogJson, formatChangelogMarkdown, formatChangelogText } from './changelog-format-helpers.js'

export default class Changelog extends Command {
  static override description = 'Generate a changelog from git commit history'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate changelog from last 50 commits',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --from v1.0.0',
      description: 'Generate changelog from a specific tag',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --from v1.0.0 --to v2.0.0',
      description: 'Generate changelog between two tags',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json -o changelog.json',
      description: 'Output changelog as JSON to a file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> -n 100 --verbose',
      description: 'Show 100 commits with full hashes',
    },
  ]

  static override flags = {
    count: Flags.integer({
      char: 'n',
      default: 50,
      description: 'Number of commits to include',
    }),
    format: Flags.string({
      char: 'f',
      default: 'markdown',
      description: 'Output format',
      options: ['json', 'markdown', 'text'],
    }),
    from: Flags.string({
      description: 'Starting tag or commit',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    to: Flags.string({
      default: 'HEAD',
      description: 'Ending tag or commit',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show full commit hashes',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Changelog)

    const cwd = process.cwd()

    if (!isGitRepository(cwd)) {
      this.error('Not a git repository', { exit: 1 })
    }

    const spinner = ora('Generating changelog...').start()

    const commits = getGitLog(cwd, flags.count, flags.from, flags.to)
    const groups = categorizeCommits(commits)

    const result: ChangelogResult = {
      generatedAt: new Date().toISOString(),
      groups,
      totalCommits: commits.length,
      ...(flags.from ? { from: flags.from } : {}),
      to: flags.to,
    }

    spinner.succeed(`Generated changelog with ${commits.length} commits`)

    const format = flags.format as 'json' | 'markdown' | 'text'
    const outputData =
      format === 'json'
        ? formatChangelogJson(result)
        : format === 'text'
          ? formatChangelogText(result, flags.verbose)
          : formatChangelogMarkdown(result, flags.verbose)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Changelog written to ${flags.output}`)
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

export { categorizeCommits, getGitLog, type ChangelogGroup, type ChangelogResult, type CommitInfo } from './changelog-helpers.js'
export { formatChangelogJson, formatChangelogMarkdown, formatChangelogText } from './changelog-format-helpers.js'
