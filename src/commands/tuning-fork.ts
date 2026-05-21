import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTuningForkResult } from './tuning-fork-helpers.js'
import type { TuningForkResult } from './tuning-fork-helpers.js'
import { formatTuningForkJson, formatTuningForkTable } from './tuning-fork-format-helpers.js'

export default class TuningFork extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze code resonance',
      required: false,
    }),
  }

  static override description = 'Analyze code resonance and tuning quality'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze code resonance in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze resonance as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed vibration and harmonic info',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output resonance.json',
      description: 'Export resonance analysis to file',
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
      description: 'Show detailed vibration and harmonic info',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TuningFork)

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
          const ext = f.path.slice(f.path.lastIndexOf('.')).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing code resonance...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: TuningForkResult = buildTuningForkResult(
      filteredFiles.map((f) => f.path),
      contents,
      { ext: flags.ext, format, verbose },
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.chambers.length} chambers`)

    const outputData =
      format === 'json'
        ? formatTuningForkJson(result)
        : formatTuningForkTable(result, verbose)

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

export { buildTuningForkResult, analyzeTuningResult, analyzeResonanceChamber, classifyForkMaterial, classifyMaestroGrade, classifyAcousticHealth, detectBeats, measureHarmonics, computeFrequency, classifyPitch, classifyToneQuality, classifyCondition, measureFundamentalFrequency, measureResonanceQuality, measureTuningAccuracy, measureHarmonicContent, measureDamping, measureVibrations, countExports, countFunctions, countImports, detectNamingStyle, measureComplexity, measureAsyncUsage, measureErrorHandling, measureCommentRatio, maxNestingDepth, detectKeySignature, generateRecommendations } from './tuning-fork-helpers.js'
export type { TuningForkResult, TuningForkStats, TuningResult, ResonanceChamber, ConcertInfo, Vibrations, Harmonics, Beats, TuningInfo, ResonanceInfo } from './tuning-fork-helpers.js'
export { formatTuningForkJson, formatTuningForkTable } from './tuning-fork-format-helpers.js'
