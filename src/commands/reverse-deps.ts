import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildReverseDepsResult, type ReverseDepsResult } from './reverse-deps-helpers.js'
import { formatReverseDepsJson, formatReverseDepsTable } from './reverse-deps-format-helpers.js'

export default class ReverseDeps extends Command {
  static override args = {
    file: Args.string({
      description: 'Target file to analyze reverse dependencies for',
      required: true,
    }),
  }

  static override description = 'Analyze reverse dependencies for a file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> src/utils.ts',
      description: 'Find all files depending on utils.ts',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/core.ts --depth 3',
      description: 'Limit transitive search depth',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/index.ts --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> src/main.ts --verbose',
      description: 'Show detailed node information',
    },
  ]

  static override flags = {
    depth: Flags.integer({
      char: 'd',
      default: 5,
      description: 'Maximum depth for transitive dependency search',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
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
    const { args, flags } = await this.parse(ReverseDeps)

    const targetFile = resolve(args.file as string)

    if (!existsSync(targetFile)) {
      this.error(`File not found: ${targetFile}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'
    const searchDir = resolve('.')

    const spinner = ora('Scanning for files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const discoveredFiles = await discoverFiles({
      cwd: searchDir,
      ignore: defaultIgnore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs',
      ],
    })

    spinner.text = 'Building reverse dependency map...'

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result: ReverseDepsResult = await buildReverseDepsResult(
      targetFile,
      discoveredFiles.map((f) => f.absolutePath),
      contentReader,
      { depth: flags.depth, verbose: flags.verbose },
    )

    spinner.succeed(
      `Found ${result.analysis.totalAffected} files affected by ${args.file}`,
    )

    const outputData = format === 'json'
      ? formatReverseDepsJson(result.analysis, result.nodes, result.stats)
      : formatReverseDepsTable(result.analysis, result.nodes, result.stats)

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
  buildReverseDependencyMap,
  buildReverseDepsResult,
  computeRiskLevel,
  extractExports,
  extractImports,
  findCriticalPaths,
  findDirectDependents,
  findTransitiveDependents,
  sourceBaseName,
} from './reverse-deps-helpers.js'
export type {
  ContentReader as ReverseDepsContentReader,
  DependencyNode,
  ExportInfo,
  ImpactAnalysis,
  ImportInfo,
  ReverseDepsOptions,
  ReverseDepsResult,
  ReverseDepsStats,
} from './reverse-deps-helpers.js'
export {
  formatAffectedTable,
  formatCriticalPaths,
  formatNodeTree,
  formatReverseDepsJson,
  formatReverseDepsStats,
  formatReverseDepsTable,
  riskIcon,
  riskLabel,
} from './reverse-deps-format-helpers.js'
