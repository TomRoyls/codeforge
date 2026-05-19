import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildStatsResult } from './stats-helpers.js'
import { formatStatsJson, formatStatsTable } from './stats-format-helpers.js'

/**
 * @example
 * codeforge stats
 * codeforge stats ./src --format json
 * codeforge stats --ext .ts,.tsx --detailed
 * codeforge stats --sort functions --format table
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
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Show statistics for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --detailed',
      description: 'Show per-file breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sort functions',
      description: 'Sort results by function count',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output stats.json',
      description: 'Save statistics to JSON file',
    },
  ]

  static override flags = {
    detailed: Flags.boolean({
      default: false,
      description: 'Show per-file breakdown',
    }),
    ext: Flags.string({
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
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
      default: 'lines',
      description: 'Sort results by metric',
      options: ['classes', 'files', 'functions', 'language', 'lines'],
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Stats)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { detailed, sort } = flags

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
        '**/*.json',
        '**/*.css',
        '**/*.scss',
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.c',
        '**/*.h',
        '**/*.cpp',
        '**/*.hpp',
        '**/*.rb',
        '**/*.zig',
      ],
    })

    const extensions = flags.ext
      ? flags.ext
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean)
      : ['.ts', '.tsx', '.js', '.jsx']

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing files...'

    const result = await buildStatsResult(filteredFiles, async (absolutePath: string) => {
      return fs.readFile(absolutePath, 'utf8')
    })

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.languages.length} languages`)

    const outputData =
      format === 'json'
        ? formatStatsJson(result)
        : formatStatsTable(result, detailed, sort)

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

export { buildStatsResult } from './stats-helpers.js'
export type { FileStats, LanguageStats, MaintainabilityIndex, StatsResult } from './stats-helpers.js'
export { formatStatsJson, formatStatsTable } from './stats-format-helpers.js'
