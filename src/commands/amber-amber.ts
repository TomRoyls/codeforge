import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildAmberAmberResult,
} from './amber-amber-helpers.js'
import { formatResultJson, formatResultTable } from './amber-amber-format-helpers.js'

export default class AmberAmber extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as amber',
      required: false,
    }),
  }

  static override description = 'Analyze code preservation, inclusion-quality, transparency, age-wisdom, and fracture-resistance'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as amber',
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
      description: 'Show per-file resin breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output amber.json',
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
      description: 'Show per-file resin breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AmberAmber)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for amber resins...').start()

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

    spinner.text = 'Analyzing amber resins...'

    const files: string[] = []
    const contents: string[] = []

    await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          const content = await fs.readFile(file.absolutePath, 'utf8')
          files.push(file.path)
          contents.push(content)
        } catch {
          files.push(file.path)
          contents.push('')
        }
      }),
    )

    const result = await buildAmberAmberResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.collections.length} amber collections`)

    const outputData = format === 'json' ? formatResultJson(result) : formatResultTable(result)

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

export { buildAmberAmberResult, analyzeAmberResin, analyzeAmberCollection, classifyCollectionType, classifyCuratorGrade, classifyResinCondition, classifyCollectionCondition, measurePreserving, measureEncapsulating, measureClarifying, measureMaturing, measureResisting, generateRecommendations } from './amber-amber-helpers.js'
export type { AmberResin, AmberCollection, MuseumSummary, AmberAmberStats, AmberAmberResult, ResinCondition, CollectionType, CollectionCondition, CuratorGrade, PreservationGrade, InclusionGrade, ClarityGrade, AgeGrade, FractureGrade, PreservingMeasure, EncapsulatingMeasure, ClarifyingMeasure, MaturingMeasure, ResistingMeasure } from './amber-amber-helpers.js'
export { formatResultTable, formatResultJson, formatResinTable, formatResinsTable, formatCollectionTable, formatCollectionsTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './amber-amber-format-helpers.js'
