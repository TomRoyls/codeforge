import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildApothecaryResult, type ApothecaryOptions } from './apothecary-helpers.js'
import { formatApothecaryJson, formatApothecaryTable } from './apothecary-format-helpers.js'

export default class Apothecary extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code health',
      required: false,
    }),
  }

  static override description = 'Analyze code ailments and prescribe remedies'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze code health in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output apothecary.json',
      description: 'Export analysis to JSON file',
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
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Apothecary)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const verbose = flags.verbose

    const spinner = ora('Diagnosing code ailments...').start()

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

    spinner.text = 'Prescribing remedies...'

    const contents = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const files = filteredFiles.map((f) => f.path)
    const options: ApothecaryOptions = { verbose, format, output: flags.output, ignore }

    const result = buildApothecaryResult(files, contents, options)

    spinner.succeed(`Analyzed ${files.length} files — Health: ${result.stats.overallHealth} (index: ${result.stats.healthIndex}, symptoms: ${result.stats.totalSymptoms})`)

    const outputData = format === 'json' ? formatApothecaryJson(result) : formatApothecaryTable(result)

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

export { buildApothecaryResult } from './apothecary-helpers.js'
export type {
  Ailment,
  ApothecaryOptions,
  ApothecaryResult,
  ApothecaryStats,
  ChronicLevel,
  Difficulty,
  Dosage,
  IngredientType,
  MedicineCabinet,
  OverallHealth,
  Recovery,
  Remedy,
  RemedyIngredient,
  SpreadRisk,
  Symptom,
  SymptomCategory,
  SymptomSeverity,
} from './apothecary-helpers.js'
export {
  formatAilments,
  formatApothecaryJson,
  formatApothecaryStats,
  formatApothecaryTable,
  formatCabinet,
  formatChronicLabel,
  formatHealthGauge,
  formatHealthLabel,
  formatRecommendations,
  formatRemedies,
  formatSeverityLabel,
  formatSpreadLabel,
  formatSymptoms,
} from './apothecary-format-helpers.js'
