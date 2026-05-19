import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildUsageMap,
  calculateStats,
  extractAllImports,
  extractExports,
  findUnused,
} from './unused-helpers.js'
import { formatUnusedCsv, formatUnusedJson, formatUnusedTable } from './unused-format-helpers.js'

export default class Unused extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for unused exports',
      required: false,
    }),
  }

  static override description = 'Detect unused exports in TypeScript/JavaScript files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Find unused exports in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Find unused exports in src as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Scan TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type function --type class',
      description: 'Find unused functions and classes only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output unused.csv',
      description: 'Export unused exports to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to scan (e.g., ".ts,.tsx")',
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
      default: 0,
      description: 'Minimum export count to report file',
    }),
    type: Flags.string({
      char: 't',
      description: 'Filter by export type',
      multiple: true,
      options: ['class', 'const', 'function', 'interface', 'type'],
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Unused)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**', '**/*.d.ts']
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

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Extracting exports...'

    const allExports = []
    const fileContents = new Map<string, string>()

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        fileContents.set(file.path, content)
        const exports = extractExports(content, file.path)
        allExports.push(...exports)
      } catch {
        // Skip unreadable files
      }
    }

    spinner.text = 'Analyzing usage...'

    const usageMap = buildUsageMap(fileContents, allExports)
    const unused = findUnused(allExports, usageMap, flags.type)

    // Apply threshold filter
    const thresholdFiltered = flags.threshold > 0
      ? unused.filter((u) => u.usages >= flags.threshold)
      : unused

    const result = calculateStats(thresholdFiltered, allExports.length)

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files, found ${result.totalUnused} unused exports out of ${result.totalExports} total`,
    )

    const outputData =
      format === 'json'
        ? formatUnusedJson(result)
        : format === 'csv'
          ? formatUnusedCsv(result)
          : formatUnusedTable(result)

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
  buildUsageMap,
  calculateStats,
  extractAllImports,
  extractExports,
  findUnused,
} from './unused-helpers.js'
export type { ExportInfo, ExportType, UnusedExport, UnusedResult } from './unused-helpers.js'
export { formatUnusedCsv, formatUnusedJson, formatUnusedTable } from './unused-format-helpers.js'
