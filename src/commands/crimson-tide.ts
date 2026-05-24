import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildCrimsonTideResult,
} from './crimson-tide-helpers.js'
import { formatResultJson, formatResultTable } from './crimson-tide-format-helpers.js'

export default class CrimsonTide extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as crimson tide',
      required: false,
    }),
  }

  static override description = 'Analyze code surge-power, ebb-resilience, depth-intensity, wave-precision, and ocean-memory'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as crimson tide',
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
      description: 'Show per-file wave breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output tide.json',
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
      description: 'Show per-file wave breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(CrimsonTide)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for crimson waves...').start()

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

    spinner.text = 'Analyzing crimson tide...'

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

    const result = await buildCrimsonTideResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.shores.length} tide shores`)

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

export { buildCrimsonTideResult, analyzeCrimsonWave, analyzeTideShore, classifyShoreType, classifyShoreCondition, classifyWaveCondition, classifyNavigatorGrade, measureSurging, measureRecovering, measureConcentrating, measurePrecisioning, measureRemembering, generateRecommendations, gatherFiles } from './crimson-tide-helpers.js'
export type { CrimsonWave as CrimsonWaveType, TideShore as TideShoreType, CrimsonSea, CrimsonTideStats, CrimsonTideResult as CrimsonTideResultType, WaveCondition, ShoreType, ShoreCondition, NavigatorGrade, SurgeGrade, EbbGrade, DepthGrade, WaveGrade, OceanGrade, SurgingMeasure, RecoveringMeasure, ConcentratingMeasure, PrecisioningMeasure, RememberingMeasure } from './crimson-tide-helpers.js'
export { formatResultTable, formatResultJson, formatWaveTable, formatWavesTable, formatShoreTable, formatShoresTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './crimson-tide-format-helpers.js'
