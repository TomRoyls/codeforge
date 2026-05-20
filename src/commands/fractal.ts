import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildFractalResult, type FractalOptions } from './fractal-helpers.js'
import { formatFractalJson, formatFractalTable } from './fractal-format-helpers.js'

export default class Fractal extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze fractal self-similarity',
      required: false,
    }),
  }

  static override description = 'Analyze code fractal/self-similarity patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze fractal patterns in current directory',
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
      command: '<%= config.bin %> <%= command.id %> --format json --output fractal.json',
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
    const { args, flags } = await this.parse(Fractal)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const verbose = flags.verbose

    const spinner = ora('Scanning fractal patterns...').start()

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

    spinner.text = 'Analyzing fractal self-similarity...'

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
    const options: FractalOptions = { verbose, format, output: flags.output, ignore }

    const result = buildFractalResult(files, contents, options)

    spinner.succeed(`Analyzed ${files.length} files — Fractal quality: ${result.stats.fractalQuality} (dimension: ${result.stats.fractalDimension.toFixed(2)})`)

    const outputData = format === 'json' ? formatFractalJson(result) : formatFractalTable(result)

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

export { buildFractalResult } from './fractal-helpers.js'
export type {
  DimensionInterpretation,
  FileQuality,
  FractalDimension,
  FractalFile,
  FractalLevel,
  FractalOptions,
  FractalOverallQuality,
  FractalPattern,
  FractalResult,
  FractalScale,
  FractalStats,
} from './fractal-helpers.js'
export {
  formatDimension,
  formatDimensionLabel,
  formatFiles,
  formatFractalJson,
  formatFractalStats,
  formatFractalTable,
  formatLevels,
  formatPatterns,
  formatQualityLabel,
  formatRecommendations,
  formatSimilarityGauge,
  formatFileQualityLabel,
} from './fractal-format-helpers.js'
