import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildPlatinumZenithResult,
} from './platinum-zenith-helpers.js'
import { formatResultJson, formatResultTable } from './platinum-zenith-format-helpers.js'

export default class PlatinumZenith extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as platinum zenith',
      required: false,
    }),
  }

  static override description = 'Analyze code peak-quality, pinnacle-clarity, summit-resilience, altitude-precision, and zenith-wisdom'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as platinum zenith',
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
      description: 'Show per-file peak breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output zenith.json',
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
      description: 'Show per-file peak breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(PlatinumZenith)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for platinum peaks...').start()

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

    spinner.text = 'Analyzing platinum zenith...'

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

    const result = await buildPlatinumZenithResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.ranges.length} mountain ranges`)

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

export { buildPlatinumZenithResult, analyzePlatinumPeak, analyzeMountainRange, classifyRangeType, classifyRangeCondition, classifyPeakCondition, classifyClimberGrade, measurePerfecting, measureClarifying, measureStrengthening, measurePrecisioning, measureKnowing, generateRecommendations, gatherFiles } from './platinum-zenith-helpers.js'
export type { PlatinumPeak as PlatinumPeakType, MountainRange as MountainRangeType, PlatinumExpedition, PlatinumCelebration, PlatinumZenithStats, PlatinumZenithResult as PlatinumZenithResultType, PeakCondition, RangeType, RangeCondition, ClimberGrade, PerfectingGrade, ClarifyingPinnacle, StrengtheningSummit, PrecisioningAltitude, KnowingZenith, PerfectingMeasure, ClarifyingMeasure, StrengtheningMeasure, PrecisioningMeasure, KnowingMeasure } from './platinum-zenith-helpers.js'
export { formatResultTable, formatResultJson, formatPeakTable, formatPeaksTable, formatRangeTable, formatRangesTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './platinum-zenith-format-helpers.js'
