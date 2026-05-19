import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { analyzeFile, buildPatternResult } from './pattern-helpers.js'
import { formatPatternCsv, formatPatternJson, formatPatternTable } from './pattern-format-helpers.js'

/**
 * Detect common design patterns and anti-patterns in your codebase.
 *
 * @example
 * ```sh
 * codeforge pattern
 * ```
 *
 * @example
 * ```sh
 * codeforge pattern ./src --format json
 * ```
 *
 * @example
 * ```sh
 * codeforge pattern ./src --type anti
 * ```
 */
export default class Pattern extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to scan for patterns',
      required: false,
    }),
  }

  static override description = 'Detect design patterns and anti-patterns in code'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Scan current directory for patterns',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Scan src directory and output JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --type anti',
      description: 'Detect only anti-patterns',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed pattern information',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output patterns.csv',
      description: 'Export pattern results to CSV',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Scan only TypeScript files',
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
    type: Flags.string({
      default: 'all',
      description: 'Filter by pattern type',
      options: ['all', 'anti', 'design', 'idiom'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Pattern)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const typeFilter = flags.type as 'all' | 'anti' | 'design' | 'idiom'
    const { verbose } = flags

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean)

    const patterns = extensions.map((ext: string) => `**/*${ext}`)

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

    spinner.text = 'Analyzing patterns...'

    const allDetected: Awaited<ReturnType<typeof analyzeFile>> = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        const detected = analyzeFile(content, file.path)
        allDetected.push(...detected)
      } catch {
        // skip unreadable files
      }
    }

    const result = buildPatternResult(allDetected, typeFilter)

    spinner.succeed(
      `Found ${result.totalPatterns} patterns in ${filteredFiles.length} files (${result.designPatterns} design, ${result.antiPatterns} anti, ${result.idioms} idioms)`,
    )

    const outputData =
      format === 'json'
        ? formatPatternJson(result)
        : format === 'csv'
          ? formatPatternCsv(result)
          : formatPatternTable(result, verbose)

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

export { analyzeFile, buildPatternResult } from './pattern-helpers.js'
export type { DetectedPattern, PatternCategory, PatternResult, PatternSummary } from './pattern-helpers.js'
export { formatPatternCsv, formatPatternJson, formatPatternTable } from './pattern-format-helpers.js'
