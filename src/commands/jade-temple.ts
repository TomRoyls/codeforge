import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildJadeTempleResult,
} from './jade-temple-helpers.js'
import { formatResultJson, formatResultTable } from './jade-temple-format-helpers.js'

export default class JadeTemple extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as jade temple',
      required: false,
    }),
  }

  static override description = 'Analyze code serenity-strength, cultural-depth, carving-precision, translucency-quality, and symbolic-wisdom'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as jade temple',
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
      description: 'Show per-file jade breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output jade.json',
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
      description: 'Show per-file jade breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(JadeTemple)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for jade carvings...').start()

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

    spinner.text = 'Analyzing jade carvings...'

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

    const result = await buildJadeTempleResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.temples.length} jade temples`)

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

export { buildJadeTempleResult, analyzeJadeCarving, analyzeJadeTemple, classifyJadeCondition, classifyTempleType, classifyTempleCondition, classifyArtisanGrade, measureStrengthening, measureDeepening, measureCarving, measureTranslucency, measureSymbolizing, generateRecommendations } from './jade-temple-helpers.js'
export type { JadeCarving, JadeTemple, DynastySummary, JadeTempleStats, JadeTempleResult, JadeCondition, TempleType, TempleCondition, ArtisanGrade, SerenityGrade, CultureGrade, CraftsmanshipGrade, GlowGrade, SymbolGrade, StrengtheningMeasure, DeepeningMeasure, CarvingMeasure, TranslucencyMeasure, SymbolizingMeasure } from './jade-temple-helpers.js'
export { formatResultTable, formatResultJson, formatCarvingTable, formatCarvingsTable, formatTempleTable, formatTemplesTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './jade-temple-format-helpers.js'
