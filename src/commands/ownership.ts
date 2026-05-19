import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import ora from 'ora'

import { buildOwnershipResult } from './ownership-helpers.js'
import { formatOwnershipJson, formatOwnershipTable } from './ownership-format-helpers.js'

export default class Ownership extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code ownership',
      required: false,
    }),
  }

  static override description = 'Analyze code ownership and knowledge distribution'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze ownership in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze ownership in src directory with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze ownership for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ignore "**/generated/**"',
      description: 'Ignore generated files in analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file ownership breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output ownership.json',
      description: 'Export ownership report to JSON file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      char: 'e',
      default: '',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
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
      description: 'Show per-file ownership breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Ownership)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Analyzing code ownership...').start()

    const result = await buildOwnershipResult(targetPath, {
      extensions: flags.ext
        ? flags.ext
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean)
        : null,
      ignorePatterns: flags.ignore ?? [],
    })

    spinner.succeed(
      `Found ${result.owners.length} owners across ${result.files.length} files (bus factor: ${result.busFactor})`,
    )

    const outputData =
      format === 'json' ? formatOwnershipJson(result) : formatOwnershipTable(result, verbose)

    if (flags.output) {
      const fs = await import('node:fs/promises')
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
  parseGitBlame,
  computeFileOwnership,
  computeDirOwnership,
  computeOwnerStats,
  computeBusFactor,
  findKnowledgeMonopolies,
  buildOwnershipResult,
} from './ownership-helpers.js'
export type {
  OwnerInfo,
  FileOwnerShare,
  FileOwnership,
  DirOwnership,
  OwnershipResult,
  OwnershipOptions,
} from './ownership-helpers.js'
export {
  formatOwnershipPercent,
  formatBusFactor,
  formatOwnershipTable,
  formatOwnershipJson,
} from './ownership-format-helpers.js'
