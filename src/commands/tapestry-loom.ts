import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildTapestryLoomResult } from './tapestry-loom-helpers.js'
import type { TapestryLoomResult } from './tapestry-loom-helpers.js'
import { formatTapestryLoomJson, formatTapestryLoomTable } from './tapestry-loom-format-helpers.js'

export default class TapestryLoom extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze interconnection weaving',
      required: false,
    }),
  }

  static override description = 'Analyze code interconnection weaving mechanics'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze weaving in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output tapestry loom analysis as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed mechanics and bench analysis',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze only TypeScript files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json --output loom.json',
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
      description: 'Show detailed mechanics and bench analysis',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TapestryLoom)

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

    spinner.text = 'Analyzing interconnection weaving...'

    const contents: string[] = await Promise.all(
      filteredFiles.map(async (file) => {
        try {
          return await fs.readFile(file.absolutePath, 'utf8')
        } catch {
          return ''
        }
      }),
    )

    const result: TapestryLoomResult = buildTapestryLoomResult(
      filteredFiles.map((f) => f.path),
      contents,
      { ext: flags.ext, format, verbose },
    )

    spinner.succeed(`Analyzed ${filteredFiles.length} files across ${result.benches.length} benches`)

    const outputData =
      format === 'json'
        ? formatTapestryLoomJson(result)
        : formatTapestryLoomTable(result, verbose)

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

export { buildTapestryLoomResult, analyzeLoomMechanics, analyzeLoomBench, measureWarpTension, measureWeftTension, measureShedClarity, measureHeddleOperation, measureBeamWinding, measureTakeUp, classifyMechanics, classifyWeaverGrade, classifyLoomCondition, classifyBenchCondition, classifyThreadMaterial, analyzeShed, analyzeHeddles, analyzeBeams, analyzeReed, analyzeConnections, classifyThreadDirection, generateLoomRecommendations } from './tapestry-loom-helpers.js'
export type { TapestryLoomResult, TapestryLoomStats, WorkshopInfo, LoomMechanics, LoomBench, ShedInfo, HeddleInfo, BeamInfo, ReedInfo, ThreadConnections, LoomThread, LoomMechanicsType, LoomCondition, BenchCondition, ThreadDirection, ThreadMaterial } from './tapestry-loom-helpers.js'
export { formatTapestryLoomJson, formatTapestryLoomTable } from './tapestry-loom-format-helpers.js'
