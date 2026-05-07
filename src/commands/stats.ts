import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'
import { type BinaryExpression, type SourceFile } from 'ts-morph'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { logger } from '../utils/logger.js'
import {
  aggregateStats,
  buildStatsResult,
  calculateFileComplexity,
  type CodeStructures,
  countCodeStructures as countCodeStructuresHelper,
  countLines,
  formatOutput,
  isLogicalOperator as isLogicalOperatorHelper,
  type ProcessedFileResult,
  sortFileStats,
  type StatsResult,
} from './stats-helpers.js'

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

  private parser: null | Parser = null

  static isLogicalOperator(node: BinaryExpression): boolean {
    return isLogicalOperatorHelper(node)
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stats)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
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

    spinner.text = 'Analyzing files...'

    this.parser = new Parser()
    await this.parser.initialize()

    let stats: StatsResult
    try {
      stats = await this.collectStats(filteredFiles, verbose, flags['sort-by'], format)
    } finally {
      this.parser.dispose()
      this.parser = null
    }

    spinner.succeed(`Analyzed ${filteredFiles.length} files`)

    const outputData =
      format === 'json'
        ? JSON.stringify(stats, null, 2)
        : formatOutput(stats, format, flags.top)

    if (flags.output) {
      try {
        await fs.writeFile(flags.output, outputData, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write stats output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    } else if (format === 'json') {
      this.log(outputData)
    } else {
      this.log(outputData)
    }
  }

  private async collectStats(
    files: Array<{ absolutePath: string; path: string }>,
    verbose: boolean,
    sortBy: string,
    format: 'json' | 'table',
  ): Promise<StatsResult> {
    const tsExtensions = new Set(['.ts', '.tsx'])
    const defaultStructures: CodeStructures = {
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    }

    const results: (null | ProcessedFileResult)[] = await Promise.all(
      files.map(async (file) => {
        if (!file) return null

        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          const { blank, comments, loc } = countLines(content)
          const ext = extname(file.path).toLowerCase()

          let complexity = 1
          let structures: CodeStructures = { ...defaultStructures }

          if (this.parser && tsExtensions.has(ext)) {
            try {
              const parseResult = await this.parser.parseFile(file.absolutePath)
              complexity = calculateFileComplexity(parseResult.sourceFile)
              structures = this.countCodeStructures(parseResult.sourceFile)
            } catch (error) {
              logger.debug(`Failed to parse ${file.path} for complexity/structures: ${error}`)
              complexity = 1
              structures = { ...defaultStructures }
            }
          }

          return { blank, comments, complexity, ext, file, loc, size: content.length, structures }
        } catch (error) {
          if (format !== 'json') {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            this.log(`Failed to process file ${file.path}: ${errorMessage}`)
          }

          return {
            blank: 0,
            comments: 0,
            complexity: 1,
            ext: extname(file.path).toLowerCase(),
            file,
            loc: 0,
            size: 0,
            structures: { ...defaultStructures },
          }
        }
      }),
    )

    const aggregated = aggregateStats(results, verbose)
    const sortedStats = sortFileStats(aggregated.fileStats, sortBy)
    return buildStatsResult(files.length, sortedStats, aggregated)
  }

  private countCodeStructures(sourceFile: SourceFile): CodeStructures {
    return countCodeStructuresHelper(sourceFile)
  }
}
