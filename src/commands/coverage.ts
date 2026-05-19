import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildCoverageResult, type CoverageOptions } from './coverage-helpers.js'
import { formatCoverageJson, formatCoverageTable } from './coverage-format-helpers.js'

/**
 * Estimate test coverage by analyzing source-to-test file mapping.
 *
 * @example
 * ```sh
 * codeforge coverage ./src
 * codeforge coverage ./src --format json
 * codeforge coverage --verbose
 * ```
 */
export default class Coverage extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Estimate test coverage without running tests'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze test coverage in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze test coverage in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output coverage as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file mapping details',
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
      description: 'Show per-file mapping details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Coverage)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing test coverage...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : undefined

    const options: CoverageOptions = { extensions, ignorePatterns: ignore }

    const filePaths = discoveredFiles.map((f) => f.absolutePath)
    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildCoverageResult(filePaths, contentReader, options)

    spinner.succeed(
      `Coverage: ${result.stats.coveragePercentage}% (${result.stats.coveredFiles}/${result.stats.totalSourceFiles} files)`,
    )

    const outputData =
      format === 'json'
        ? formatCoverageJson(result)
        : formatCoverageTable(result, flags.verbose)

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
