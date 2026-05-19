import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTokenResult, type TokenAnalysisOptions, type TokenType } from './tokens-helpers.js'
import { formatTokensCsv, formatTokensJson, formatTokensTable } from './tokens-format-helpers.js'

export default class Tokens extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze tokens in',
      required: false,
    }),
  }

  static override description = 'Analyze token and keyword frequency across codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze tokens in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output token analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type identifier --top 30',
      description: 'Show top 30 identifiers only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --min-length 4 --verbose',
      description: 'Show tokens with 4+ chars and recommendations',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output tokens.csv',
      description: 'Export token analysis to CSV',
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
      options: ['csv', 'json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      description: 'Patterns to ignore',
      multiple: true,
    }),
    'min-length': Flags.integer({
      default: 1,
      description: 'Minimum token length to include',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    top: Flags.integer({
      char: 't',
      default: 20,
      description: 'Number of top tokens to show',
    }),
    type: Flags.string({
      char: 'T',
      default: 'all',
      description: 'Token type to analyze',
      options: ['all', 'comment-word', 'identifier', 'keyword', 'string-literal'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show recommendations',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Tokens)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const typeFilter = flags.type as TokenType | 'all'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing tokens...'

    const filePaths: string[] = []
    const fileContents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        filePaths.push(file.path)
        fileContents.push(content)
      } catch {
        // skip unreadable files
      }
    }

    const options: TokenAnalysisOptions = {
      minLength: flags['min-length'],
      top: flags.top,
      type: typeFilter,
      verbose: flags.verbose,
    }

    const result = buildTokenResult(filePaths, fileContents, options)

    spinner.succeed(`Analyzed ${result.totalTokens} tokens across ${result.files} files`)

    const outputData =
      format === 'json'
        ? formatTokensJson(result)
        : format === 'csv'
          ? formatTokensCsv(result)
          : formatTokensTable(result, flags.verbose)

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

export { buildTokenResult } from './tokens-helpers.js'
export type { TokenAnalysisResult, TokenAnalysisOptions, TokenEntry } from './tokens-helpers.js'
export { formatTokensCsv, formatTokensJson, formatTokensTable } from './tokens-format-helpers.js'
