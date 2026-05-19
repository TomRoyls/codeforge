import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  analyzeFileComplexity,
  buildComplexityResult,
  filterByThreshold,
  takeTop,
} from './complexity-helpers.js'
import { formatComplexityCsv, formatComplexityJson, formatComplexityTable } from './complexity-format-helpers.js'

export default class Complexity extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for complexity',
      required: false,
    }),
  }

  static override description = 'Analyze cyclomatic complexity of functions and methods'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze complexity in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze complexity in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --threshold 5',
      description: 'Show only functions with complexity >= 5',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10 --sort complexity',
      description: 'Show top 10 most complex functions',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output complexity.csv',
      description: 'Export complexity to CSV file',
    },
  ]

  static override flags = {
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
    sort: Flags.string({
      default: 'complexity',
      description: 'Sort results by',
      options: ['complexity', 'file', 'name'],
    }),
    threshold: Flags.integer({
      default: 1,
      description: 'Minimum complexity to report',
    }),
    top: Flags.integer({
      default: 0,
      description: 'Show only top N most complex functions (0 = all)',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Complexity)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const { threshold, top, sort: sortBy, verbose } = flags

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

    spinner.text = 'Analyzing complexity...'

    const fileResults = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          return analyzeFileComplexity(content, file.path)
        } catch {
          return {
            averageComplexity: 0,
            filePath: file.path,
            functions: [],
            maxComplexity: 0,
            relativePath: file.path,
            totalComplexity: 0,
          }
        }
      }),
    )

    const result = buildComplexityResult(fileResults)

    let filtered = filterByThreshold(result.functions, threshold)

    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'file') {
      filtered = [...filtered].sort((a, b) => a.filePath.localeCompare(b.filePath))
    }
    // default 'complexity' — already sorted by buildComplexityResult

    if (top > 0) {
      filtered = takeTop(filtered, top)
    }

    const finalResult: typeof result = {
      ...result,
      functions: filtered,
      totalFunctions: filtered.length,
    }

    spinner.succeed(`Analyzed ${filteredFiles.length} files, found ${result.totalFunctions} functions`)

    if (verbose) {
      this.log(`  Threshold: >= ${threshold}`)
      this.log(`  Sort by: ${sortBy}`)
      if (top > 0) this.log(`  Showing top: ${top}`)
    }

    const outputData =
      format === 'json'
        ? formatComplexityJson(finalResult)
        : format === 'csv'
          ? formatComplexityCsv(finalResult)
          : formatComplexityTable(finalResult)

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
