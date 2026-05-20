import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildMyceliumResult, type MyceliumOptions } from './mycelium-helpers.js'
import { formatMyceliumJson, formatMyceliumTable } from './mycelium-format-helpers.js'

export default class Mycelium extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze mycelium network',
      required: false,
    }),
  }

  static override description = 'Analyze codebase mycelium network'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze mycelium network in current directory',
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
      command: '<%= config.bin %> <%= command.id %> --format json --output mycelium.json',
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
    const { args, flags } = await this.parse(Mycelium)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const verbose = flags.verbose

    const spinner = ora('Scanning mycelium network...').start()

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

    spinner.text = 'Tracing mycelium network...'

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
    const options: MyceliumOptions = { verbose, format, output: flags.output, ignore }

    const result = buildMyceliumResult(files, contents, options)

    spinner.succeed(`Analyzed ${files.length} files — Network health: ${result.stats.networkHealth} (density: ${result.stats.networkDensity}%)`)

    const outputData = format === 'json' ? formatMyceliumJson(result) : formatMyceliumTable(result)

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

export { buildMyceliumResult } from './mycelium-helpers.js'
export type {
  ClusterHealth,
  ConnectionType,
  FlowType,
  HyphaeConnection,
  HyphaeNode,
  MyceliumCluster,
  MyceliumOptions,
  MyceliumResult,
  MyceliumStats,
  NetworkHealth,
  NodeType,
  NutrientFlow,
} from './mycelium-helpers.js'
export {
  formatClusters,
  formatConnections,
  formatHealthLabel,
  formatMyceliumJson,
  formatMyceliumStats,
  formatMyceliumTable,
  formatNetworkGauge,
  formatNodes,
  formatNodeTypeLabel,
  formatRecommendations,
  formatFlows,
} from './mycelium-format-helpers.js'
