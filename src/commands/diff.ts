/**
 * Diff command — analyzes git diffs with risk assessment and statistics.
 *
 * Shows what changed, categorizes changes, highlights risky modifications,
 * and computes diff statistics for code review and CI workflows.
 *
 * @example
 * ```bash
 * codeforge diff
 * codeforge diff --staged
 * codeforge diff --commit abc123
 * codeforge diff --format json --output diff.json
 * codeforge diff --stat
 * codeforge diff --verbose
 * ```
 */
import { Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildDiffResult, type DiffResult } from './diff-helpers.js'
import { formatDiffJson, formatDiffTable } from './diff-format-helpers.js'

export default class Diff extends Command {
  static override args = {}

  static override description = 'Analyze git diffs with risk assessment and statistics'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show working tree changes',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --staged',
      description: 'Show staged changes',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --commit abc123',
      description: 'Show diff for a specific commit',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output diff.json',
      description: 'Export diff analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --stat',
      description: 'Show only statistics summary',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file diff lines with colors',
    },
  ]

  static override flags = {
    commit: Flags.string({
      char: 'c',
      description: 'Specific commit hash to diff',
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
      description: 'Show staged changes',
    }),
    stat: Flags.boolean({
      default: false,
      description: 'Show only statistics, no per-file details',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Diff)

    const cwd = resolve('.')

    if (!existsSync(cwd)) {
      this.error(`Path not found: ${cwd}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const spinner = ora('Analyzing git diff...').start()

    let result: DiffResult
    try {
      result = buildDiffResult(cwd, {
        commit: flags.commit,
        staged: flags.staged,
      })
    } catch (error) {
      spinner.fail('Failed to run git diff')
      this.error(
        error instanceof Error ? error.message : String(error),
        { exit: 1 },
      )
    }

    const fileCount = result.summary.totalFiles
    const additionCount = result.summary.totalAdditions
    const deletionCount = result.summary.totalDeletions

    spinner.succeed(
      `Analyzed ${fileCount} files: ${additionCount} additions, ${deletionCount} deletions`,
    )

    const outputData =
      format === 'json'
        ? formatDiffJson(result)
        : formatDiffTable(result, flags.stat, flags.verbose)

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

export { buildDiffResult, type DiffOptions, type DiffResult, type FileDiff, type DiffLine, type DiffSummary } from './diff-helpers.js'
export { formatDiffJson, formatDiffTable } from './diff-format-helpers.js'
