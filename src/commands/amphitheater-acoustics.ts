import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildAmphitheaterAcousticsResult,
  type AmphitheaterAcousticsResult,
  type AcousticReading,
  type AcousticVenue,
  type AmphitheaterAcousticsStats,
  type FestivalMeasure,
  type VoiceMeasure,
  type ResonanceMeasure,
  type ReachMeasure,
  type PresenceMeasure,
  type EchoMeasure,
  type ArchitectureMeasure,
} from './amphitheater-acoustics-helpers.js'
import { formatAmphitheaterAcousticsJson, formatAmphitheaterAcousticsTable } from './amphitheater-acoustics-format-helpers.js'

export default class AmphitheaterAcoustics extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for amphitheater acoustics metrics',
      required: false,
    }),
  }

  static override description = 'Analyze code communication, resonance, and projection'

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
      description: 'Show detailed per-file breakdown',
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
      description: 'Show detailed per-file breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AmphitheaterAcoustics)

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
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx',
        '**/*.json', '**/*.css', '**/*.html', '**/*.md',
        '**/*.py', '**/*.rs', '**/*.go', '**/*.java',
        '**/*.rb', '**/*.sh', '**/*.yaml', '**/*.yml',
        '**/*.xml', '**/*.sql',
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

    spinner.text = 'Analyzing amphitheater acoustics...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: AmphitheaterAcousticsResult = buildAmphitheaterAcousticsResult(
      filteredFiles.map(f => f.path),
      contents,
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.venues.length} venues`)

    const outputData =
      format === 'json'
        ? formatAmphitheaterAcousticsJson(result)
        : formatAmphitheaterAcousticsTable(result, verbose)

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

export {
  buildAmphitheaterAcousticsResult,
} from './amphitheater-acoustics-helpers.js'
export type {
  AmphitheaterAcousticsResult,
  AcousticReading,
  AcousticVenue,
  AmphitheaterAcousticsStats,
  FestivalMeasure,
  VoiceMeasure,
  ResonanceMeasure,
  ReachMeasure,
  PresenceMeasure,
  EchoMeasure,
  ArchitectureMeasure,
} from './amphitheater-acoustics-helpers.js'
export { formatAmphitheaterAcousticsJson, formatAmphitheaterAcousticsTable } from './amphitheater-acoustics-format-helpers.js'
