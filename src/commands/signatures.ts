import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildSignaturesResult, type SignaturesResult } from './signatures-helpers.js'
import { formatSignaturesJson, formatSignaturesTable } from './signatures-format-helpers.js'

export default class Signatures extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze function signatures',
      required: false,
    }),
  }

  static override description = 'Analyze function signatures and complexity'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze signatures in current project',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --sort complexity',
      description: 'Sort by complexity',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed parameter info',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
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
    sort: Flags.string({
      char: 's',
      default: 'name',
      description: 'Sort results by',
      options: ['complexity', 'name', 'params'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Signatures)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const sort = flags.sort as 'complexity' | 'name' | 'params'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    spinner.text = 'Analyzing signatures...'

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result: SignaturesResult = await buildSignaturesResult(
      filteredFiles.map((f) => f.path),
      contentReader,
      { sort, verbose: flags.verbose },
    )

    spinner.succeed(
      `Analyzed ${result.stats.totalFunctions} functions across ${filteredFiles.length} files`,
    )

    const outputData = format === 'json'
      ? formatSignaturesJson(result.signatures, result.stats)
      : formatSignaturesTable(result.signatures, result.stats)

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

export {
  buildSignaturesResult,
  computeSignatureComplexity,
  computeSignatureStats,
  extractSignatures,
  generateSignatureSuggestions,
  parseParameter,
  sourceBaseName,
} from './signatures-helpers.js'
export type {
  ContentReader as SignaturesContentReader,
  ParamDetail,
  SignatureInfo,
  SignatureStats,
  SignaturesOptions,
  SignaturesResult,
  SortBy,
} from './signatures-helpers.js'
export {
  complexityBadge,
  formatParamDistribution,
  formatSignature,
  formatSignatures,
  formatSignaturesJson,
  formatSignaturesTable,
  formatSignatureStats,
} from './signatures-format-helpers.js'
