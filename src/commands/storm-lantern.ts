import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildStormLanternResult,
} from './storm-lantern-helpers.js'
import { formatResultJson, formatResultTable } from './storm-lantern-format-helpers.js'

export default class StormLantern extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as storm lantern',
      required: false,
    }),
  }

  static override description = 'Analyze code illumination-strength, wind-resistance, fuel-efficiency, glass-clarity, and beacon-range'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as storm lantern',
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
      description: 'Show per-file lantern breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output lantern.json',
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
      description: 'Show per-file lantern breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(StormLantern)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for lantern lights...').start()

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

    spinner.text = 'Analyzing lantern lights...'

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

    const result = await buildStormLanternResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.stations.length} lantern stations`)

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

export { buildStormLanternResult, analyzeLanternLight, analyzeLanternStation, classifyStationType, classifyKeeperGrade, classifyLanternCondition, classifyStationCondition, measureIlluminating, measureResisting, measureOptimizing, measureClarifying, measureReaching, generateRecommendations } from './storm-lantern-helpers.js'
export type { LanternLight, LanternStation, NetworkSummary, StormLanternStats, StormLanternResult, LanternCondition, StationType, StationCondition, KeeperGrade, IlluminationGrade, WindGrade, FuelGrade, GlassGrade, BeaconGrade, IlluminatingMeasure, ResistingMeasure, OptimizingMeasure, ClarifyingMeasure, ReachingMeasure } from './storm-lantern-helpers.js'
export { formatResultTable, formatResultJson, formatLightTable, formatLightsTable, formatStationTable, formatStationsTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './storm-lantern-format-helpers.js'
