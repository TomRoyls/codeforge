import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildRefactorResult, type RefactorOptions } from './refactor-suggest-helpers.js'
import { formatRefactorJson, formatRefactorTable } from './refactor-suggest-format-helpers.js'

/**
 * Analyze code for refactoring opportunities and code smells.
 *
 * @example
 * ```sh
 * codeforge refactor-suggest ./src
 * codeforge refactor-suggest --format json
 * codeforge refactor-suggest --severity high
 * ```
 */
export default class RefactorSuggest extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Suggest refactoring opportunities'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory',
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
      command: '<%= config.bin %> <%= command.id %> --severity high',
      description: 'Show only high-severity suggestions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show code examples',
    },
  ]

  static override flags = {
    ext: Flags.string({
      char: 'e',
      default: '',
      description: 'Comma-separated file extensions to analyze',
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
    severity: Flags.string({
      char: 's',
      default: 'all',
      description: 'Minimum severity level',
      options: ['all', 'high', 'medium', 'low'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show code examples',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(RefactorSuggest)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing refactoring opportunities...').start()

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

    const options: RefactorOptions = { extensions, ignorePatterns: ignore, severity: flags.severity }

    const filePaths = discoveredFiles.map((f) => f.absolutePath)
    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildRefactorResult(filePaths, contentReader, options)

    spinner.succeed(`Found ${result.stats.total} refactoring suggestions (${result.stats.totalEffort}h estimated effort)`)

    const outputData =
      format === 'json'
        ? formatRefactorJson(result)
        : formatRefactorTable(result, flags.verbose)

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
