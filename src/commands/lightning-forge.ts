import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildThunderForgeResult } from './lightning-forge-helpers.js'
import { formatResultJson, formatResultTable } from './lightning-forge-format-helpers.js'

export default class LightningForge extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as a thunder forge',
      required: false,
    }),
  }

  static override description = 'Analyze code like a thunder forge — lightning-speed/thunder-authority/storm-resilience/spark-precision/bolt-wisdom'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory',
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
      description: 'Show per-file breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output report.json',
      description: 'Export to JSON file',
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
      description: 'Show per-file breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(LightningForge)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
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

    spinner.text = 'Forging thunder bolts...'

    const files: string[] = []
    const contents: string[] = []

    for (const file of filteredFiles) {
      try {
        const content = await fs.readFile(file.absolutePath, 'utf8')
        files.push(file.path)
        contents.push(content)
      } catch {
        files.push(file.path)
        contents.push('')
      }
    }

    const result = await buildThunderForgeResult(files, contents)

    spinner.succeed(
      `Analyzed ${files.length} files across ${result.anvils.length} anvils (power: ${result.storm.overallPower})`,
    )

    const outputData = verbose
      ? format === 'json'
        ? formatResultJson(result)
        : formatResultTable(result)
      : format === 'json'
        ? formatResultJson(result)
        : formatResultTable(result)

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

export { buildThunderForgeResult, analyzeThunderBolt, analyzeThunderAnvil, measureStriking, measureCommanding, measureWeathering, measureFocusing, measureLearning, classifyCondition, classifyAnvilType, classifyAnvilCondition, classifySmithGrade, generateRecommendations } from './lightning-forge-helpers.js'
export type { ThunderBolt, ThunderAnvil, ThunderForgeResult, ThunderStats, BoltCondition, AnvilType, AnvilCondition, SmithGrade, StrikingMeasure, CommandingMeasure, WeatheringMeasure, FocusingMeasure, LearningMeasure } from './lightning-forge-helpers.js'
export { colorScore, colorCondition, colorAnvilCondition, formatBoltTable, formatBoltsTable, formatAnvilTable, formatAnvilsTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson } from './lightning-forge-format-helpers.js'
