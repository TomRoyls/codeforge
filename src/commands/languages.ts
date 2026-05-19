import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildLanguagesResult, type LanguagesOptions } from './languages-helpers.js'
import { formatLanguagesJson, formatLanguagesTable } from './languages-format-helpers.js'

/**
 * Analyze programming language breakdown of the codebase.
 *
 * @example
 * ```sh
 * codeforge languages ./src
 * codeforge languages ./src --format json
 * codeforge languages --verbose
 * ```
 */
export default class Languages extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze programming language breakdown'

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
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed stats and tooling suggestions',
    },
  ]

  static override flags = {
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
      description: 'Show detailed stats and tooling suggestions',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Languages)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Analyzing languages...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.css', '**/*.scss',
        '**/*.html', '**/*.json', '**/*.md', '**/*.py', '**/*.rb', '**/*.go',
        '**/*.rs', '**/*.java', '**/*.c', '**/*.h', '**/*.cpp', '**/*.hpp',
        '**/*.cs', '**/*.php', '**/*.swift', '**/*.kt', '**/*.zig', '**/*.sh',
        '**/*.sql', '**/*.yaml', '**/*.yml', '**/*.toml', '**/*.xml', '**/*.vue',
        '**/*.svelte', '**/*.graphql', '**/*.gql',
      ],
    })

    const options: LanguagesOptions = { ignorePatterns: ignore }

    const filePaths = discoveredFiles.map((f) => f.absolutePath)
    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildLanguagesResult(filePaths, contentReader, options)

    spinner.succeed(`Analyzed ${result.stats.totalFiles} files across ${result.stats.languages.length} languages`)

    const outputData =
      format === 'json'
        ? formatLanguagesJson(result)
        : formatLanguagesTable(result, flags.verbose)

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
