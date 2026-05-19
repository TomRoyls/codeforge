import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildFuncSizeResult, type FuncSizeOptions } from './func-size-helpers.js'
import { formatFuncSizeCsv, formatFuncSizeJson, formatFuncSizeTable } from './func-size-format-helpers.js'

export default class FuncSize extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze function sizes',
      required: false,
    }),
  }

  static override description = 'Analyze function size distribution across codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze function sizes in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output function size analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 30',
      description: 'Use 30-line threshold for oversized detection',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts --verbose',
      description: 'Analyze only TypeScript files with detailed output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output sizes.csv',
      description: 'Export function sizes to CSV',
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
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    threshold: Flags.integer({
      char: 't',
      default: 50,
      description: 'Line count threshold for oversized functions',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show per-file stats',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(FuncSize)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'

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
        '**/*.mjs',
        '**/*.cjs',
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

    spinner.text = 'Analyzing function sizes...'

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

    const options: FuncSizeOptions = {
      threshold: flags.threshold,
      verbose: flags.verbose,
    }

    const result = buildFuncSizeResult(filePaths, fileContents, options)

    spinner.succeed(`Analyzed ${result.stats.totalFunctions} functions across ${result.stats.totalFiles} files`)

    const outputData =
      format === 'json'
        ? formatFuncSizeJson(result)
        : format === 'csv'
          ? formatFuncSizeCsv(result)
          : formatFuncSizeTable(result, flags.verbose)

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

export { buildFuncSizeResult } from './func-size-helpers.js'
export type { FuncSizeResult, FuncSizeOptions, FunctionInfo } from './func-size-helpers.js'
export { formatFuncSizeCsv, formatFuncSizeJson, formatFuncSizeTable } from './func-size-format-helpers.js'
