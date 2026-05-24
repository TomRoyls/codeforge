import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildJadeDragonResult,
} from './jade-dragon-helpers.js'
import { formatResultJson, formatResultTable } from './jade-dragon-format-helpers.js'

export default class JadeDragon extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as jade dragon',
      required: false,
    }),
  }

  static override description = 'Analyze code wisdom-depth, scale-resilience, breath-vitality, treasure-guardianship, and flight-elegance'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as jade dragon',
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
      description: 'Show per-file scale breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output dragon.json',
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
      description: 'Show per-file scale breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(JadeDragon)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for dragon scales...').start()

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

    spinner.text = 'Analyzing dragon scales...'

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

    const result = await buildJadeDragonResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.lairs.length} dragon lairs`)

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

export { buildJadeDragonResult, analyzeDragonScale, analyzeDragonLair, classifyDragonCondition, classifyLairType, classifyLairCondition, classifyDragonGrade, measureKnowing, measureArmoring, measureBreathing, measureGuarding, measureSoaring, generateRecommendations } from './jade-dragon-helpers.js'
export type { DragonScale as DragonScaleType, DragonLair, DragonSummary, JadeDragonStats, JadeDragonResult, DragonCondition, LairType, LairCondition, DragonGrade, WisdomGrade, ArmorGrade, BreathGrade, TreasureGrade, FlightGrade, KnowingMeasure, ArmoringMeasure, BreathingMeasure, GuardingMeasure, SoaringMeasure } from './jade-dragon-helpers.js'
export { formatResultTable, formatResultJson, formatScaleTable, formatScalesTable, formatLairTable, formatLairsTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './jade-dragon-format-helpers.js'
