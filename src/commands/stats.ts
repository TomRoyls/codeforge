import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import {
  aggregateStats,
  buildStatsResult,
  calculateFileComplexity,
  countCodeStructures as countStructures,
  countLines,
  formatOutput,
  isLogicalOperator,
  sortFileStats,
  type CodeStructures,
  type ProcessedFileResult,
} from './stats-helpers.js'

const EMPTY_STRUCTURES: CodeStructures = {
  classes: 0,
  enums: 0,
  functions: 0,
  interfaces: 0,
  methods: 0,
  typeAliases: 0,
}

const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/.git/**',
]

const DISCOVERY_PATTERNS = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

/**
 * @example
 * codeforge stats
 * codeforge stats ./src --format json
 * codeforge stats --top 10
 * codeforge stats --format json --output stats.json
 * codeforge stats --ext .ts,.tsx
 */
export default class Stats extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Display codebase statistics and metrics'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show statistics for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Show statistics for src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 10',
      description: 'Show top 10 largest files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output stats.json',
      description: 'Save statistics to JSON file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Show statistics for TypeScript files only',
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
    'sort-by': Flags.string({
      char: 's',
      default: 'size',
      description: 'Sort files by metric',
      options: ['complexity', 'loc', 'name', 'size'],
    }),
    top: Flags.integer({
      char: 't',
      default: 10,
      description: 'Number of top files to show',
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed file statistics',
    }),
  }

  static isLogicalOperator = isLogicalOperator

  countCodeStructures = countStructures

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stats)

    const targetPath = resolve(args.path as string)
    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const sortBy = flags['sort-by'] as string
    const { ext, ignore, output: outputFlag, top, verbose } = flags

    const allIgnore = ignore
      ? [...DEFAULT_IGNORE_PATTERNS, ...ignore]
      : DEFAULT_IGNORE_PATTERNS

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore: allIgnore,
      patterns: DISCOVERY_PATTERNS,
    })

    const extensions = ext
      ? ext
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0)
      : null

    const filteredFiles = extensions === null
      ? discoveredFiles
      : discoveredFiles.filter((f) =>
          extensions.includes(extname(f.path).toLowerCase()),
        )

    const parser = new Parser()
    await parser.initialize()

    const results: (ProcessedFileResult | null)[] = []

    try {
      for (const file of filteredFiles) {
        let content: string
        try {
          content = await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          results.push(null)
          continue
        }

        const { loc, blank, comments } = countLines(content)
        const size = Buffer.byteLength(content, 'utf8')
        const fileExt = extname(file.absolutePath).toLowerCase()

        let complexity = 1
        let structures: CodeStructures = { ...EMPTY_STRUCTURES }
        if (fileExt === '.ts' || fileExt === '.tsx') {
          try {
            const parseResult = await parser.parseFile(file.absolutePath)
            const sourceFile = parseResult.sourceFile
            complexity = calculateFileComplexity(sourceFile)
            structures = countStructures(sourceFile)
          } catch {
            complexity = 1
            structures = { ...EMPTY_STRUCTURES }
          }
        }

        results.push({
          blank,
          comments,
          complexity,
          ext: fileExt,
          file,
          loc,
          size,
          structures,
        })
      }
    } finally {
      await parser.dispose()
    }

    const aggregated = aggregateStats(results, verbose as boolean)
    const sortedStats = sortFileStats(aggregated.fileStats, sortBy)
    const totalFiles = results.filter((r) => r !== null).length
    const statsResult = buildStatsResult(totalFiles, sortedStats, aggregated)

    let outputStr: string
    if (format === 'json') {
      outputStr = JSON.stringify(statsResult, null, 2)
    } else {
      outputStr = formatOutput(statsResult as unknown as Record<string, unknown>, format, top as number)
    }

    if (outputFlag) {
      try {
        await fs.writeFile(outputFlag, outputStr, 'utf8')
        this.log(`Results written to ${outputFlag}`)
      } catch (error) {
        this.error(
          `Failed to write stats output to ${outputFlag}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else {
      this.log(outputStr)
    }
  }
}

export { buildStatsResult } from './stats-helpers.js'
export type { FileStats, LanguageStats, MaintainabilityIndex, StatsResult } from './stats-helpers.js'
export { formatStatsJson, formatStatsTable } from './stats-format-helpers.js'
