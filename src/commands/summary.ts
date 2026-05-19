import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildSummaryResult } from './summary-helpers.js'
import { formatSummaryJson, formatSummaryTable } from './summary-format-helpers.js'

export default class Summary extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to project directory',
      required: false,
    }),
  }

  static override description = 'Show a quick project overview dashboard'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show summary for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Show summary for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output summary as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --no-git',
      description: 'Skip git-related analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --output summary.txt',
      description: 'Save summary to file',
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
    'no-git': Flags.boolean({
      default: false,
      description: 'Skip git-related analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Summary)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const noGit = flags['no-git']

    const spinner = ora('Analyzing project...').start()

    const result = await buildSummaryResult(targetPath, { noGit })

    spinner.succeed(
      `Project ${result.project.name} — Grade: ${result.health.grade} (${result.health.overall}/100)`,
    )

    const outputData = format === 'json' ? formatSummaryJson(result) : formatSummaryTable(result)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Summary written to ${flags.output}`)
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

export { buildSummaryResult } from './summary-helpers.js'
export type {
  BuildSummaryOptions,
  CodeOverview,
  FileContent,
  FileEntry,
  GitOverview,
  HealthScore,
  ProjectInfo,
  QuickIssues,
  SummaryResult,
} from './summary-helpers.js'
export { formatHealthBar, formatSummaryJson, formatSummaryTable } from './summary-format-helpers.js'
