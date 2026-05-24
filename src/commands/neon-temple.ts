import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildNeonTempleResult,
} from './neon-temple-helpers.js'
import { formatResultJson, formatResultTable } from './neon-temple-format-helpers.js'

export default class NeonTemple extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as neon temple',
      required: false,
    }),
  }

  static override description = 'Analyze code luminosity-quality, structure-vibrancy, glow-consistency, prayer-clarity, and energy-efficiency'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as neon temple',
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
      description: 'Show per-file prayer breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output temple.json',
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
      description: 'Show per-file prayer breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(NeonTemple)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for neon prayers...').start()

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

    spinner.text = 'Analyzing neon temple prayers...'

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

    const result = await buildNeonTempleResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.grids.length} temple grids`)

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

export { buildNeonTempleResult, analyzeNeonPrayer, analyzeTempleGrid, classifyPrayerCondition, classifyGridType, classifyGridCondition, classifyPriestGrade, measureIlluminating, measureVibrating, measureGlowing, measureExpressing, measurePowering, generateRecommendations, gatherFiles } from './neon-temple-helpers.js'
export type { NeonPrayer as NeonPrayerType, TempleGrid, CitySummary, NeonTempleStats, NeonTempleResult, PrayerCondition, GridType, GridCondition, PriestGrade, IlluminationGrade, VibrationGrade, GlowGrade, PrayerGrade, EnergyGrade, IlluminatingMeasure, VibratingMeasure, GlowingMeasure, ExpressingMeasure, PoweringMeasure } from './neon-temple-helpers.js'
export { formatResultTable, formatResultJson, formatPrayerTable, formatPrayersTable, formatGridTable, formatGridsTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './neon-temple-format-helpers.js'
