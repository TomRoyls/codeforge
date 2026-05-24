import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildThunderWellResult,
} from './thunder-well-helpers.js'
import { formatResultJson, formatResultTable } from './thunder-well-format-helpers.js'

export default class ThunderWell extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as thunder well',
      required: false,
    }),
  }

  static override description = 'Analyze code resonance-depth, echo-clarity, reverberation-quality, sound-propagation, and acoustic-balance'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as thunder well',
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
      description: 'Show per-file echo breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output thunder.json',
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
      description: 'Show per-file echo breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ThunderWell)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for thunder echoes...').start()

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

    spinner.text = 'Analyzing thunder echoes...'

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

    const result = await buildThunderWellResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.chambers.length} acoustic chambers`)

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

export { buildThunderWellResult, analyzeThunderEcho, analyzeAcousticChamber, classifyChamberType, classifyChamberCondition, classifyEchoCondition, classifyAcousticGrade, measureResonating, measureEchoing, measureReverberating, measurePropagating, measureBalancing, generateRecommendations } from './thunder-well-helpers.js'
export type { ThunderEcho as ThunderEchoType, AcousticChamber, SymphonySummary, ThunderWellStats, ThunderWellResult, EchoCondition, ChamberType, ChamberCondition, AcousticGrade, ResonanceGrade, EchoGrade, ReverberationGrade, PropagationGrade, AcousticsGrade, ResonatingMeasure, EchoingMeasure, ReverberatingMeasure, PropagatingMeasure, BalancingMeasure } from './thunder-well-helpers.js'
export { formatResultTable, formatResultJson, formatEchoTable, formatEchoesTable, formatChamberTable, formatChambersTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './thunder-well-format-helpers.js'
