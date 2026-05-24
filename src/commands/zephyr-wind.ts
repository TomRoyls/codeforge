import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildZephyrWindResult,
} from './zephyr-wind-helpers.js'
import { formatResultJson, formatResultTable } from './zephyr-wind-format-helpers.js'

export default class ZephyrWind extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as zephyr wind',
      required: false,
    }),
  }

  static override description = 'Analyze code breeze-lightness, current-direction, gust-resilience, breeze-carriage, and atmosphere-quality'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as zephyr wind',
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
      description: 'Show per-file wind breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output wind.json',
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
      description: 'Show per-file wind breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ZephyrWind)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for wind currents...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json',
        '**/*.css', '**/*.html', '**/*.md', '**/*.py', '**/*.rs',
        '**/*.go', '**/*.java', '**/*.rb', '**/*.sh', '**/*.yaml',
        '**/*.yml', '**/*.xml', '**/*.sql',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing wind currents...'

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

    const result = await buildZephyrWindResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.fields.length} wind fields`)

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

export { buildZephyrWindResult, analyzeWindCurrent, analyzeWindField, classifyWindCondition, classifyFieldType, classifyFieldCondition, classifyPilotGrade, measureLightening, measureDirecting, measureResisting, measureCarrying, measureSurrounding, generateRecommendations } from './zephyr-wind-helpers.js'
export type { WindCurrent as WindCurrentType, WindField, SkySummary, ZephyrWindStats, ZephyrWindResult, WindCondition, FieldType, FieldCondition, PilotGrade, LightnessGrade, DirectionGrade, ResilienceGrade, CarriageGrade, AtmosphereGrade, LighteningMeasure, DirectingMeasure, ResistingMeasure, CarryingMeasure, SurroundingMeasure } from './zephyr-wind-helpers.js'
export { formatResultTable, formatResultJson, formatCurrentTable, formatCurrentsTable, formatFieldTable, formatFieldsTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './zephyr-wind-format-helpers.js'
