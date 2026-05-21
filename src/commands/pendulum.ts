import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildPendulumResult } from './pendulum-helpers.js'
import type { PendulumResult } from './pendulum-helpers.js'
import { formatPendulumJson, formatPendulumTable } from './pendulum-format-helpers.js'

export default class Pendulum extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze oscillation patterns',
      required: false,
    }),
  }

  static override description = 'Analyze code oscillation and change patterns'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze pendulum patterns in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output pendulum analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed swing and clock analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output pendulum.json',
      description: 'Export analysis to file',
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
      description: 'Show detailed swing and clock analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Pendulum)

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
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.json',
        '**/*.css', '**/*.html', '**/*.md', '**/*.py', '**/*.rs',
        '**/*.go', '**/*.java', '**/*.rb', '**/*.sh',
        '**/*.yaml', '**/*.yml', '**/*.xml', '**/*.sql',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => {
          const ext = f.path.slice(f.path.lastIndexOf('.')).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing pendulum oscillation...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: PendulumResult = buildPendulumResult(
      filteredFiles.map((f) => f.path),
      contents,
      { ext: flags.ext, format, verbose },
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} swings across ${result.clocks.length} clocks`)

    const outputData =
      format === 'json'
        ? formatPendulumJson(result)
        : formatPendulumTable(result, verbose)

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

export { buildPendulumResult, analyzePendulumSwing, analyzePendulumClock, computeDisplacement, computeEquilibrium, classifySwingPattern, classifyHorologistGrade, measureEnergy, computeDeviation, generateRecommendations } from './pendulum-helpers.js'
export type { PendulumResult, PendulumStats, SystemInfo, PendulumSwing, PendulumClock, Displacement, OscillationInfo, EquilibriumIdeal, DeviationInfo, EnergyInfo, SwingPattern, SwingPhase, PendulumType, SwingCondition, ClockCondition, HorologistGrade } from './pendulum-helpers.js'
export { formatPendulumJson, formatPendulumTable } from './pendulum-format-helpers.js'
