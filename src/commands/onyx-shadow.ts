import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import {
  buildOnyxShadowResult,
} from './onyx-shadow-helpers.js'
import { formatResultJson, formatResultTable } from './onyx-shadow-format-helpers.js'

export default class OnyxShadow extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze as onyx shadow',
      required: false,
    }),
  }

  static override description = 'Analyze code depth-mystery, polish-perfection, grounding-strength, shadow-integration, and light-absorption'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory as onyx shadow',
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
      description: 'Show per-file onyx breakdown',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output onyx.json',
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
      description: 'Show per-file onyx breakdown',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(OnyxShadow)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Scanning for onyx shadows...').start()

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

    spinner.text = 'Analyzing onyx shadows...'

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

    const result = await buildOnyxShadowResult(files, contents)

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.chambers.length} onyx chambers`)

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

export { buildOnyxShadowResult, analyzeOnyxShadow, analyzeOnyxChamber, classifyChamberType, classifyChamberCondition, classifyKeeperGrade, classifyOnyxCondition, measureDeepening, measurePolishing, measureGrounding, measureIntegrating, measureAbsorbing, generateRecommendations } from './onyx-shadow-helpers.js'
export type { OnyxShadow as OnyxShadowType, OnyxChamber, AbyssSummary, OnyxShadowStats, OnyxShadowResult, OnyxCondition, ChamberType, ChamberCondition, KeeperGrade, MysteryGrade, PolishGrade, GroundGrade, IntegrationGrade, FocusGrade, DeepeningMeasure, PolishingMeasure, GroundingMeasure, IntegratingMeasure, AbsorbingMeasure } from './onyx-shadow-helpers.js'
export { formatResultTable, formatResultJson, formatShadowTable, formatShadowsTable, formatChamberTable, formatChambersTable, formatStatsTable, formatRecommendations, colorScore, colorGrade } from './onyx-shadow-format-helpers.js'
