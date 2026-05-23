import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildMirrorLakeResult,
  type LakeReflection,
  type LakeSystem,
  type MirrorLakeResult,
} from './mirror-lake-helpers.js'
import { formatResultJson, formatResultTable } from './mirror-lake-format-helpers.js'

export default class MirrorLake extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as mirror lake',
      required: false,
    }),
  }

  static override description = 'Analyze code reflection quality, surface calm, depth clarity, ripple resilience, and ecosystem balance'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as mirror lake',
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
      description: 'Show per-file reflection breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output lake.json',
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
      description: 'Show per-file reflection breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(MirrorLake)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const { verbose } = flags

    const spinner = ora('Scanning mirror lake...').start()

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

    spinner.text = 'Reflecting on lake waters...'

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

    const result = await buildMirrorLakeResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.lakes.length} lake systems`)

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

export { buildMirrorLakeResult, analyzeLakeReflection, analyzeLakeSystem, classifyLakeType, classifyKeeperGrade, classifyLakeCondition, classifyWatershedCondition, measureReflecting, measureCalming, measureClarifying, measureRippling, measureBalancing, generateRecommendations } from './mirror-lake-helpers.js'
export type { LakeReflection, LakeSystem, WatershedSummary, MirrorLakeStats, MirrorLakeResult, LakeCondition, LakeType, WatershedCondition, KeeperGrade, ReflectionGrade, SurfaceGrade, DepthGrade, RecoveryGrade, EcosystemGrade, ReflectingMeasure, CalmingMeasure, ClarifyingMeasure, RipplingMeasure, BalancingMeasure } from './mirror-lake-helpers.js'
export { formatResultTable, formatResultJson, formatReflectionTable, formatReflectionsTable, formatLakeTable, formatLakesTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './mirror-lake-format-helpers.js'
