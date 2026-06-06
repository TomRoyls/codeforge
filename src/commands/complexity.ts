import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  analyzeFileComplexity,
  calculateComplexitySummary,
  type FunctionComplexity,
} from '../core/complexity.js'
import { Parser } from '../core/parser.js'
import {
  buildIgnorePatterns,
  buildJsonOutput,
  filterByThreshold,
  filterFilesByExtension,
  formatOutput,
  limitResults,
  parseExtensions,
  sortByField,
} from './complexity-helpers.js'

const DEFAULT_EXTENSIONS = ['.ts', '.tsx']
const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.git/**',
]

export default class Complexity extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description =
    'Analyze and report cyclomatic complexity metrics for TypeScript files'

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
      description: 'Show only functions with complexity above threshold',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 most complex functions',
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
      options: ['csv', 'json', 'markdown', 'table'],
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
      char: 's',
      default: 'complexity',
      description: 'Sort results by',
      options: ['complexity', 'file', 'name'],
    }),
    threshold: Flags.integer({
      char: 't',
      default: 1,
      description: 'Minimum complexity threshold (only show functions at or above threshold)',
    }),
    top: Flags.integer({
      char: 'n',
      default: 20,
      description: 'Show top N most complex functions',
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

    const spinner = ora('Discovering files...').start()

    const ignore = buildIgnorePatterns(DEFAULT_IGNORE, flags.ignore)
    const extensions = parseExtensions(flags.ext)
    const patterns = (
      extensions && extensions.length > 0 ? extensions : DEFAULT_EXTENSIONS
    ).map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = filterFilesByExtension(discoveredFiles, extensions)

    spinner.text = 'Analyzing files...'

    const allFunctions: FunctionComplexity[] = []
    const parser = new Parser()
    try {
      await parser.initialize()
      for (const file of filteredFiles) {
        try {
          const parsed = await parser.parseFile(file.absolutePath)
          const sourceFile = parsed.sourceFile
          const funcs = analyzeFileComplexity(sourceFile)
          allFunctions.push(...funcs)
        } catch {
        }
      }
    } finally {
      parser.dispose()
    }

    const filtered = filterByThreshold(allFunctions, flags.threshold)
    const sorted = sortByField(filtered, flags.sort)
    const limited = limitResults(sorted, flags.top)

    spinner.succeed(`Analyzed ${filteredFiles.length} files`)

    const summary = calculateComplexitySummary(limited)

    const outputData =
      flags.format === 'json'
        ? buildJsonOutput(limited, summary)
        : flags.format === 'markdown'
          ? formatOutput(limited, 'markdown')
          : formatOutput(limited, 'table')

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
