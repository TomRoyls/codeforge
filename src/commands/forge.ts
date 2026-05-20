import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildForgeResult, type ForgeOptions } from './forge-helpers.js'
import { formatForgeJson, formatForgeTable } from './forge-format-helpers.js'

export default class Forge extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze forge quality',
      required: false,
    }),
  }

  static override description = 'Analyze code forging/smithing quality'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze forge quality in current directory',
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
      command: '<%= config.bin %> <%= command.id %> --format json --output forge.json',
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
    const { args, flags } = await this.parse(Forge)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const verbose = flags.verbose

    const spinner = ora('Lighting the forge...').start()

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

    spinner.text = 'Analyzing forge quality...'

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
    const options: ForgeOptions = { verbose, format, output: flags.output, ignore }

    const result = buildForgeResult(files, contents, options)

    spinner.succeed(`Analyzed ${files.length} files — Forge: ${result.stats.overallForge} (quality: ${result.stats.forgeQuality})`)

    const outputData = format === 'json' ? formatForgeJson(result) : formatForgeTable(result)

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

export { buildForgeResult } from './forge-helpers.js'
export type {
  ForgeOptions,
  ForgeResult,
  ForgeStats,
  ForgeWeld,
  ForgedPiece,
  HammerMark,
  HeatGrade,
  HeatTreatment,
  MetalType,
  OverallForge,
  PieceGrade,
  WeldQuality,
  WeldType,
} from './forge-helpers.js'
export {
  formatCraftsmanshipGauge,
  formatForgeJson,
  formatForgeStats,
  formatForgeTable,
  formatGradeLabel,
  formatHammerMarks,
  formatHeatGradeLabel,
  formatHeatTreatment,
  formatMetalLabel,
  formatOverallForgeLabel,
  formatPieces,
  formatRecommendations,
  formatWeldQualityLabel,
  formatWelds,
} from './forge-format-helpers.js'
