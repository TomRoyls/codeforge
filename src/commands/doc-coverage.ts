import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  analyzeFileDocCoverage,
  buildDocCoverageResult,
  filterResults,
  type DocCoverageResult,
  type FilterOptions,
} from './doc-coverage-helpers.js'
import { formatDocCoverageCsv, formatDocCoverageJson, formatDocCoverageTable } from './doc-coverage-format-helpers.js'

export default class DocCoverage extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze documentation coverage',
      required: false,
    }),
  }

  static override description = 'Measure documentation coverage for exported items'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Check doc coverage in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Check doc coverage in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Check doc coverage for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --show-undocumented',
      description: 'Show only undocumented exports',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --by-type',
      description: 'Group results by export type',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed output with quality scores',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output coverage.csv',
      description: 'Export coverage to CSV file',
    },
  ]

  static override flags = {
    'by-type': Flags.boolean({
      default: false,
      description: 'Group results by export type',
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
    'show-documented': Flags.boolean({
      default: false,
      description: 'Show only documented items',
    }),
    'show-undocumented': Flags.boolean({
      default: false,
      description: 'Show only undocumented items',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DocCoverage)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const byType = flags['by-type']
    const filterOptions: FilterOptions = {
      showDocumented: flags['show-documented'],
      showUndocumented: flags['show-undocumented'],
    }

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

    const filteredFiles = extensions.length > 0
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing documentation coverage...'

    const fileResults = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return analyzeFileDocCoverage(content, file.path)
        } catch {
          return {
            coveragePercentage: 100,
            documentedExports: 0,
            exports: [],
            filePath: file.path,
            relativePath: file.path,
            totalExports: 0,
          }
        }
      }),
    )

    let result: DocCoverageResult = buildDocCoverageResult(fileResults)

    if (filterOptions.showUndocumented || filterOptions.showDocumented) {
      result = filterResults(result, filterOptions)
    }

    spinner.succeed(
      `Analyzed ${filteredFiles.length} files — ${result.documentedExports}/${result.totalExports} exports documented (${result.coveragePercentage.toFixed(1)}%)`,
    )

    const outputData =
      format === 'json'
        ? formatDocCoverageJson(result)
        : format === 'csv'
          ? formatDocCoverageCsv(result)
          : formatDocCoverageTable(result, byType)

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

export { analyzeFileDocCoverage, buildDocCoverageResult, extractExportedItems, checkJSDoc, filterResults } from './doc-coverage-helpers.js'
export type { DocCoverageResult, ExportItem, FileDocCoverage, FilterOptions, JSDocQuality } from './doc-coverage-helpers.js'
export { formatDocCoverageCsv, formatDocCoverageJson, formatDocCoverageTable, formatCoverageBar, getCoverageColor } from './doc-coverage-format-helpers.js'
