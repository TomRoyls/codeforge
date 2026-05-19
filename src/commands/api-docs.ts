import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildApiDocsResult, type ApiDocsOptions } from './api-docs-helpers.js'
import { formatApiDocsHtml, formatApiDocsJson, formatApiDocsMarkdown, formatApiDocsTable } from './api-docs-format-helpers.js'

/**
 * Generate API documentation from source code.
 *
 * @example
 * ```sh
 * codeforge api-docs ./src
 * codeforge api-docs ./src --format markdown --output API.md
 * codeforge api-docs ./src --format html --output docs.html
 * ```
 */
export default class ApiDocs extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Generate API documentation from source code'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Generate API docs for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Generate API docs for src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format markdown --output API.md',
      description: 'Export API docs as Markdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output API docs as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format html --output docs.html',
      description: 'Generate HTML documentation',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show full parameter details',
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
      options: ['html', 'json', 'markdown', 'table'],
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
      description: 'Show full parameter and method details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ApiDocs)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'html' | 'json' | 'markdown' | 'table'

    const spinner = ora('Extracting API documentation...').start()

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
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    const options: ApiDocsOptions = {
      extensions,
      ignorePatterns: ignore,
    }

    const filePaths = filteredFiles.map((f) => f.absolutePath)
    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result = await buildApiDocsResult(filePaths, contentReader, options)

    spinner.succeed(`Extracted API docs from ${result.stats.totalModules} modules`)

    const outputData =
      format === 'json'
        ? formatApiDocsJson(result)
        : format === 'markdown'
          ? formatApiDocsMarkdown(result)
          : format === 'html'
            ? formatApiDocsHtml(result)
            : formatApiDocsTable(result, flags.verbose)

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
