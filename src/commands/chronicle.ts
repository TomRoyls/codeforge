import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as cp from 'node:child_process'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildChronicleResult, parseGitLog } from './chronicle-helpers.js'
import { formatChronicleJSON, formatChronicleTable } from './chronicle-format-helpers.js'

export default class Chronicle extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Generate a narrative chronicle of the codebase from git history'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Chronicle current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output chronicle as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show full event timeline',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to filter (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Chronicle)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Reading the scrolls...').start()

    let rawLog: string
    try {
      rawLog = cp.execSync(
        'git log --format="COMMIT_START%H%x00%an%x00%ai%x00%s" --shortstat --no-merges',
        { cwd: targetPath, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
      )
    } catch {
      spinner.fail('No git history found')
      this.error('Could not read git log. Ensure the directory is a git repository.', { exit: 1 })
      return
    }

    spinner.text = 'Writing the chronicle...'

    const commits = parseGitLog(rawLog)
    const result = buildChronicleResult(commits, { projectPath: targetPath })

    spinner.succeed(`Chronicled ${result.stats.totalEvents} events across ${result.stats.totalChapters} chapters`)

    const outputData = format === 'json' ? formatChronicleJSON(result) : formatChronicleTable(result)

    if (flags.output) {
      const { writeFile } = await import('node:fs/promises')
      try {
        await writeFile(flags.output, outputData, 'utf8')
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

export { buildChronicleResult, parseGitLog } from './chronicle-helpers.js'
export type { ChronicleResult, ChronicleStats, Chapter, Character, Event, EventType, CharacterRole, GitCommit } from './chronicle-helpers.js'
export { formatChronicleJSON, formatChronicleTable } from './chronicle-format-helpers.js'
