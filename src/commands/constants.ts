import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildConstantsResult, type ConstantsResult } from './constants-helpers.js'
import { formatConstantsJson, formatConstantsTable } from './constants-format-helpers.js'

export default class Constants extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for constants and magic numbers',
      required: false,
    }),
  }

  static override description = 'Find magic numbers, hardcoded strings, and constants'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for magic numbers',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 3',
      description: 'Only show values appearing 3+ times',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show all findings including low-priority',
    },
  ]

  static override flags = {
    ext: Flags.string({
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
    threshold: Flags.integer({
      char: 't',
      default: 1,
      description: 'Minimum occurrences to flag (default: 1)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show all findings',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Constants)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for magic numbers and constants...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    const filePaths = filteredFiles.map((f) => f.absolutePath)

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result: ConstantsResult = await buildConstantsResult(filePaths, contentReader, {
      threshold: flags.threshold,
      verbose: flags.verbose,
    })

    spinner.succeed(
      `Found ${result.stats.totalMagicNumbers} magic numbers, ${result.stats.totalHardcodedStrings} hardcoded strings, ${result.stats.totalExistingConstants} constants`,
    )

    const outputData = format === 'json' ? formatConstantsJson(result) : formatConstantsTable(result)

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

export { buildConstantsResult, computeConstantsStats, countOccurrences, findExistingConstants, findHardcodedStrings, findMagicNumbers, suggestConstantName } from './constants-helpers.js'
export type { ConstantsOptions, ConstantsResult, ConstantsStats, ContentReader, ExistingConstant, HardcodedString, MagicNumber } from './constants-helpers.js'
export { formatConstantsJson, formatConstantsStats, formatConstantsTable, formatExistingConstants, formatHardcodedStrings, formatMagicNumbers } from './constants-format-helpers.js'
