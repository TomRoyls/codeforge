import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  aggregateByLanguage,
  calculateTotals,
  countLineTypes,
  detectLanguage,
  type CountResult,
  type PerFileStats,
  sortLanguages,
  type SortByMetric,
} from './count-helpers.js'
import { formatCountCsv, formatCountJson, formatCountTable } from './count-format-helpers.js'

export default class Count extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to count lines in',
      required: false,
    }),
  }

  static override description = 'Count lines of code by language'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Count lines in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Count lines in src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Count lines for TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sort-by language',
      description: 'Sort results by language name',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format csv --output counts.csv',
      description: 'Export counts to CSV file',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions to count (e.g., ".ts,.tsx")',
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
      default: 'code',
      description: 'Sort results by metric',
      options: ['blank', 'code', 'comment', 'files', 'language'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show per-file breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Count)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'csv' | 'json' | 'table'
    const sortBy = flags['sort-by'] as SortByMetric
    const { verbose } = flags

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
        '**/*.html',
        '**/*.md',
        '**/*.py',
        '**/*.rs',
        '**/*.go',
        '**/*.java',
        '**/*.rb',
        '**/*.sh',
        '**/*.yaml',
        '**/*.yml',
        '**/*.xml',
        '**/*.sql',
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

    spinner.text = 'Counting lines...'

    const fileStats: PerFileStats[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          const language = detectLanguage(file.path)
          const { code, comment, blank } = countLineTypes(content, language)
          return { blank, code, comment, filePath: file.path, language }
        } catch {
          return { blank: 0, code: 0, comment: 0, filePath: file.path, language: 'Unknown' }
        }
      }),
    )

    const languages = sortLanguages(aggregateByLanguage(fileStats), sortBy)
    const totals = calculateTotals(languages)

    const result: CountResult = {
      fileBreakdown: verbose ? fileStats : undefined,
      languages,
      totals,
    }

    spinner.succeed(`Counted ${filteredFiles.length} files across ${languages.length} languages`)

    const outputData =
      format === 'json'
        ? formatCountJson(result)
        : format === 'csv'
          ? formatCountCsv(result)
          : formatCountTable(result, verbose)

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

export { aggregateByLanguage, calculateTotals, countLineTypes, detectLanguage, sortLanguages } from './count-helpers.js'
export type { CountResult, CountTotals, LanguageStats, PerFileStats, SortByMetric } from './count-helpers.js'
export { formatCountCsv, formatCountJson, formatCountTable } from './count-format-helpers.js'
