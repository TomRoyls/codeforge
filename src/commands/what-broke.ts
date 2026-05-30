import { Command, Flags } from '@oclif/core'
import { resolve } from 'node:path'
import ora from 'ora'

import { getCommitRange, getDiffSummary, buildWhatBrokeResult, execGit } from './what-broke-helpers.js'
import { formatWhatBrokeJson, formatWhatBrokeTable } from './what-broke-format-helpers.js'

/**
 * @example
 * codeforge what-broke --since HEAD~10
 */
export default class WhatBroke extends Command {
  static override description = 'Analyze what changed between git commits'

  static override examples = [
    { command: '<%= config.bin %> <%= command.id %> --since HEAD~5', description: 'Analyze last 5 commits' },
    { command: '<%= config.bin %> <%= command.id %> --since v1.0.0 --until v2.0.0', description: 'Between tags' },
    { command: '<%= config.bin %> <%= command.id %> --since HEAD~20 --format json', description: 'JSON output' },
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
      default: 'HEAD~10',
      description: 'Start commit/tag/date',
    }),
    until: Flags.string({
      char: 'u',
      default: 'HEAD',
      description: 'End commit/tag/date',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(WhatBroke)
    const cwd = resolve('.')
    const spinner = ora('Analyzing git history...').start()

    const since = flags.since
    const until = flags.until

    const commits = await getCommitRange(cwd, since, until)
    const files = await getDiffSummary(cwd, since, until)

    spinner.text = 'Analyzing diff...'
    const diffOutput = await execGit('diff', [`${since}..${until}`], cwd)

    const result = buildWhatBrokeResult(commits, files, diffOutput)

    spinner.succeed(
      `Analyzed ${commits.length} commits, ${files.length} files changed — ${result.analysis.riskLevel} risk`,
    )

    const output = flags.format === 'json'
      ? formatWhatBrokeJson(result)
      : formatWhatBrokeTable(result)

    if (flags.output) {
      const { writeFile } = await import('node:fs/promises')
      await writeFile(flags.output, output, 'utf8')
      this.log(`Results written to ${flags.output}`)
    } else {
      this.log(output)
    }
  }
}
