import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildSpectralHarmonicsResult, type SpectralHarmonicsResult } from './spectral-harmonics-helpers.js'
import { formatSpectralHarmonicsJson, formatSpectralHarmonicsTable } from './spectral-harmonics-format-helpers.js'

export default class SpectralHarmonics extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for spectral harmonics metrics',
      required: false,
    }),
  }

  static override description = 'Analyze code spectral purity, harmonic resonance, overtone richness, waveform clarity, and frequency distribution'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for spectral harmonics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show per-file wave details',
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
      description: 'Show per-file wave details',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SpectralHarmonics)

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

    spinner.text = 'Analyzing spectral harmonics...'

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

    const result: SpectralHarmonicsResult = buildSpectralHarmonicsResult(files, contents)

    spinner.succeed(`Analyzed ${files.length} files across ${result.chambers.length} chambers`)

    const outputData =
      format === 'json'
        ? formatSpectralHarmonicsJson(result)
        : formatSpectralHarmonicsTable(result, verbose)

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

export { buildSpectralHarmonicsResult } from './spectral-harmonics-helpers.js'
export type { SpectralHarmonicsResult, SpectralWave, ResonanceChamber, Spectrum, ConductorGrade, SpectralHarmonicsStats, WaveCondition, ChamberType, ChamberCondition, ResonatingMeasure, HarmonicMeasure, OvertoneMeasure, WaveformMeasure, FrequencyMeasure } from './spectral-harmonics-helpers.js'
export { formatSpectralHarmonicsJson, formatSpectralHarmonicsTable } from './spectral-harmonics-format-helpers.js'
