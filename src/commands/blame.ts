import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { getCurrentBranch, getBlameForFile, isGitRepository } from '../utils/git-helpers.js'
import {
  aggregateAuthors,
  filterByAuthor,
  filterByLineRange,
  type BlameResult,
  sortBlameLines,
} from './blame-helpers.js'
import { formatBlameCsv, formatBlameJson, formatBlameTable } from './blame-format-helpers.js'

export default class Blame extends Command {
  static override args = {
    file: Args.string({
      description: 'Path to the file to blame',
      required: true,
    }),
  }

  static override description = 'Show git blame information for a specific file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/index.ts',
      description: 'Show blame for a file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/app.ts --format json',
      description: 'Show blame as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/utils.ts --author john',
      description: 'Filter blame by author name',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/main.ts --lines 10-20',
      description: 'Show blame for specific line range',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/core.ts --summary --verbose',
      description: 'Show blame with commit summaries and full hashes',
    },
  ]

  static override flags = {
    author: Flags.string({
      char: 'a',
      description: 'Filter by author name (substring match)',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'json', 'table'],
    }),
    lines: Flags.string({
      char: 'l',
      description: 'Filter by line range (e.g., "10-20")',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    summary: Flags.boolean({
      char: 's',
      default: false,
      description: 'Show commit summary in output',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed blame with full commit hashes',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Blame)

    const targetPath = resolve(args.file as string)

    if (!existsSync(targetPath)) {
      this.error(`File not found: ${targetPath}`, { exit: 1 })
    }

    const cwd = process.cwd()

    if (!isGitRepository(cwd)) {
      this.error('Not a git repository', { exit: 1 })
    }

    const spinner = ora('Loading blame information...').start()

    const blameLines = getBlameForFile(targetPath, cwd)
    let filtered = blameLines

    if (flags.author) {
      filtered = filterByAuthor(filtered, flags.author)
    }

    if (flags.lines) {
      filtered = filterByLineRange(filtered, flags.lines)
    }

    const authors = aggregateAuthors(filtered)
    const branch = getCurrentBranch(cwd)

    const result: BlameResult = {
      authors,
      branch,
      file: targetPath,
      lines: filtered,
      totalLines: filtered.length,
    }

    spinner.succeed(`Loaded blame for ${targetPath}`)

    const format = flags.format as 'csv' | 'json' | 'table'
    const outputData =
      format === 'json'
        ? formatBlameJson(result)
        : format === 'csv'
          ? formatBlameCsv(result, flags.summary)
          : formatBlameTable(result, flags.verbose, flags.summary)

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

export { aggregateAuthors, filterByAuthor, filterByLineRange, sortBlameLines, type BlameResult } from './blame-helpers.js'
export { formatBlameCsv, formatBlameJson, formatBlameTable } from './blame-format-helpers.js'
