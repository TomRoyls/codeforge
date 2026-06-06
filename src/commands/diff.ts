import { Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'

import { buildDiffResult, type DiffResult } from './diff-helpers.js'
import { formatDiffJson, formatDiffTable } from './diff-format-helpers.js'

export {
  buildDiffResult,
  type DiffLine,
  type DiffOptions,
  type DiffResult,
  type DiffSummary,
  type FileDiff,
} from './diff-helpers.js'
export { formatDiffJson, formatDiffTable } from './diff-format-helpers.js'

export default class Diff extends Command {
  static override args = {}

  static override description = 'Analyze git diffs with risk assessment and statistics'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze changes in the working tree',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --staged',
      description: 'Analyze staged changes',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --commit abc123',
      description: 'Analyze changes for a specific commit',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --stat',
      description: 'Show diff statistics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output',
    },
  ]

  static override flags = {
    commit: Flags.string({
      char: 'c',
      description: 'Specific commit to compare',
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
    staged: Flags.boolean({
      default: false,
      description: 'Compare staged changes only',
    }),
    stat: Flags.boolean({
      default: false,
      description: 'Show diff statistics',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Diff)
    const cwd = process.cwd()

    if (!existsSync(cwd)) {
      this.error(`Path not found: ${cwd}`)
    }

    let result: DiffResult
    try {
      result = buildDiffResult(cwd, {
        commit: flags.commit,
        staged: flags.staged,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.error(message)
    }

    const output =
      flags.format === 'json'
        ? formatDiffJson(result)
        : formatDiffTable(result, flags.stat, flags.verbose)

    if (flags.output) {
      try {
        await writeFile(flags.output, output, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch {
        this.error('Failed to write output')
      }
    } else {
      this.log(output)
    }
  }
}
