import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildRiverDeltaResult } from './river-delta-helpers.js'
import { formatRiverDeltaJson, formatRiverDeltaTable } from './river-delta-format-helpers.js'

export default class RiverDelta extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze for branching/fan-out',
      required: false,
    }),
  }

  static override description = 'Analyze code branching and fan-out like a river delta'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze current directory for code branching',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Analyze src directory with JSON output',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed per-file channel metrics',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
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
      description: 'Show detailed per-file metrics',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(RiverDelta)

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
          const ext = '.' + f.path.split('.').pop()?.toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Analyzing river channels...'

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

    const result = buildRiverDeltaResult(files, contents, {})

    spinner.succeed(`Analyzed ${files.length} files across ${result.regions.length} delta regions`)

    const outputData = format === 'json'
      ? formatRiverDeltaJson(result)
      : formatRiverDeltaTable(result, verbose)

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
  analyzeDeltaRegion,
  analyzeWaterChannel,
  buildRiverDeltaResult,
  classifyCondition,
  classifyHydrologistGrade,
  classifyRegionCondition,
  classifyRegionType,
  countBranches,
  countClasses,
  countComments,
  countConsole,
  countDescriptiveNames,
  countErrorHandling,
  countExports,
  countFunctions,
  countImports,
  countJSDoc,
  countLoc,
  countTodos,
  countTypeAnnotations,
  countValidations,
  generateRecommendations,
  maxNesting,
  measureBank,
  measureChannel,
  measureDistributary,
  measureFlood,
  measureFlow,
  measureSediment,
} from './river-delta-helpers.js'
export type {
  BankMeasure,
  Basin,
  ChannelCondition,
  ChannelMeasure,
  ChannelType,
  DeltaRegion,
  DistributaryMeasure,
  FloodMeasure,
  FlowDirection,
  FlowMeasure,
  HydrologistGrade,
  RegionCondition,
  RegionType,
  RiverDeltaResult,
  RiverDeltaStats,
  SedimentMeasure,
  WaterChannel,
} from './river-delta-helpers.js'
export { formatRiverDeltaJson, formatRiverDeltaTable } from './river-delta-format-helpers.js'
