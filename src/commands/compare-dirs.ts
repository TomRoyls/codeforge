import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { compareDirectories } from './compare-dirs-helpers.js'
import { formatComparisonJson, formatComparisonTable } from './compare-dirs-format-helpers.js'

export default class CompareDirs extends Command {
  static override args = {
    dir1: Args.string({
      description: 'First directory to compare',
      required: true,
    }),
    dir2: Args.string({
      description: 'Second directory to compare',
      required: true,
    }),
  }

  static override description = 'Compare two directories and show differences'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> ./src ./dist',
      description: 'Compare src and dist directories',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src ./dist --format json',
      description: 'Compare directories with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src ./dist --ext .ts,.tsx',
      description: 'Compare only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src ./dist --ignore "**/test/**"',
      description: 'Compare ignoring test directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src ./dist --verbose',
      description: 'Show all common files with status',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src ./dist --format json --output comparison.json',
      description: 'Export comparison to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      char: 'e',
      default: '',
      description: 'Comma-separated file extensions to compare (e.g., ".ts,.tsx")',
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
      description: 'Show diff for common files',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CompareDirs)

    const dir1Path = resolve(args.dir1 as string)
    const dir2Path = resolve(args.dir2 as string)

    if (!existsSync(dir1Path)) {
      this.error(`Directory not found: ${dir1Path}`, { exit: 1 })
    }

    if (!existsSync(dir2Path)) {
      this.error(`Directory not found: ${dir2Path}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Comparing directories...').start()

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const result = await compareDirectories(dir1Path, dir2Path, {
      extensions,
      ignorePatterns: flags.ignore ?? [],
    })

    spinner.succeed(
      `Compared ${result.stats.totalFilesDir1} vs ${result.stats.totalFilesDir2} files (${result.similarity}% similarity)`,
    )

    const outputData =
      format === 'json' ? formatComparisonJson(result) : formatComparisonTable(result, verbose)

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

export { compareDirectories, computeHash, computeSimilarity, computeComparisonStats } from './compare-dirs-helpers.js'
export type { CompareOptions, DirComparison, DirContent, FileDiff, FileInfo, ComparisonStats } from './compare-dirs-helpers.js'
export { formatComparisonJson, formatComparisonTable, formatDiff, formatSimilarity } from './compare-dirs-format-helpers.js'
