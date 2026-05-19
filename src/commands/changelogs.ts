import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildChangelogsResult } from './changelogs-helpers.js'
import {
  formatChangelogJson,
  formatConventional,
  formatDetailed,
  formatSimple,
} from './changelogs-format-helpers.js'

export default class Changelogs extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to git repository',
      required: false,
    }),
  }

  static override description = 'Generate changelogs from git commit history'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate changelog from git history',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type conventional',
      description: 'Generate conventional commit changelog',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type simple',
      description: 'Generate flat list changelog',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type detailed --verbose',
      description: 'Generate detailed changelog with bodies',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --since "2024-01-01" --until "2024-06-01"',
      description: 'Limit to date range',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output CHANGELOG.md',
      description: 'Export changelog to file',
    },
  ]

  static override flags = {
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
      char: 's',
      description: 'Start date for commits (git log --since format)',
    }),
    type: Flags.string({
      char: 't',
      default: 'conventional',
      description: 'Changelog style',
      options: ['conventional', 'detailed', 'simple'],
    }),
    until: Flags.string({
      char: 'u',
      description: 'End date for commits (git log --until format)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show commit bodies in detailed mode',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Changelogs)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const changelogType = flags.type as 'conventional' | 'detailed' | 'simple'
    const { verbose } = flags

    const spinner = ora('Generating changelog...').start()

    const result = await buildChangelogsResult(targetPath, {
      since: flags.since ?? '',
      type: changelogType,
      until: flags.until ?? '',
    })

    spinner.succeed(
      `Generated changelog: ${result.totalCommits} commits, ${result.authors.length} authors`,
    )

    let outputData: string
    if (format === 'json') {
      outputData = formatChangelogJson(result)
    } else if (changelogType === 'simple') {
      outputData = formatSimple(result)
    } else if (changelogType === 'detailed') {
      outputData = formatDetailed(result, verbose)
    } else {
      outputData = formatConventional(result)
    }

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

export {
  parseGitLog,
  classifyCommit,
  extractScope,
  detectBreaking,
  groupByType,
  groupByVersion,
  buildChangelogsResult,
} from './changelogs-helpers.js'
export type {
  CommitType,
  CommitInfo,
  ChangelogGroup,
  VersionGroup,
  ChangelogsResult,
  ChangelogsOptions,
} from './changelogs-helpers.js'
export {
  formatConventional,
  formatSimple,
  formatDetailed,
  formatChangelogJson,
} from './changelogs-format-helpers.js'
