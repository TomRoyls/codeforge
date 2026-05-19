import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildImportsResult, parseImports } from './imports-helpers.js'
import type { ImportsResult } from './imports-helpers.js'
import { formatImportsCsv, formatImportsJson, formatImportsTable } from './imports-format-helpers.js'

export default class Imports extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze imports in',
      required: false,
    }),
  }

  static override description = 'Analyze import statements in your codebase'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze imports in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze imports in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze imports for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --circular',
      description: 'Detect circular dependencies',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 most-imported modules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output with all imports per file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output imports.csv',
      description: 'Export import analysis to CSV file',
    },
  ]

  static override flags = {
    circular: Flags.boolean({
      default: false,
      description: 'Detect circular dependencies',
    }),
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
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
    top: Flags.string({
      default: '20',
      description: 'Show top N most-imported modules',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Imports)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const top = parseInt(flags.top, 10)
    const { circular, verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    spinner.text = 'Analyzing imports...'

    const allImports = []
    const filePaths = new Set<string>()

    for (const file of discoveredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const fileImports = parseImports(content, file.path)
        allImports.push(...fileImports)
        filePaths.add(file.path)
      } catch {
        // Skip files that can't be read
      }
    }

    const result: ImportsResult = buildImportsResult(allImports, {
      circular,
      filePaths,
      top,
    })

    spinner.succeed(
      `Analyzed ${discoveredFiles.length} files, found ${result.totalImports} imports across ${result.moduleStats.length} modules`,
    )

    const outputData =
      format === 'json'
        ? formatImportsJson(result)
        : format === 'csv'
          ? formatImportsCsv(result)
          : formatImportsTable(result, verbose)

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

export { buildImportsResult, parseImports } from './imports-helpers.js'
export type { CircularDep, ImportInfo, ImportStyle, ImportsResult, ModuleStats } from './imports-helpers.js'
export { formatImportsCsv, formatImportsJson, formatImportsTable } from './imports-format-helpers.js'
