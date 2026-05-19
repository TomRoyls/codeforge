import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildExportGraphResult, type ExportGraphResult } from './export-graph-helpers.js'
import { formatExportGraphJson, formatExportGraphTable } from './export-graph-format-helpers.js'

export default class ExportGraph extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze export graph',
      required: false,
    }),
  }

  static override description = 'Analyze export/import dependency graph'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze export graph in current project',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src',
      description: 'Analyze export graph in src directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --verbose',
      description: 'Show detailed node information',
    },
  ]

  static override flags = {
    ext: Flags.string({
      default: '',
      description: 'Comma-separated file extensions (e.g., ".ts,.tsx")',
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
    const { args, flags } = await this.parse(ExportGraph)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'json' | 'table'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: [
        '**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs',
      ],
    })

    const extensions = flags.ext
      ? flags.ext.split(',').map((e) => e.trim()).filter(Boolean)
      : null

    const filteredFiles = extensions
      ? discoveredFiles.filter((f) => extensions.includes(extname(f.path).toLowerCase()))
      : discoveredFiles

    spinner.text = 'Building export graph...'

    const contentReader = async (filePath: string) => fs.readFile(filePath, 'utf8')

    const result: ExportGraphResult = await buildExportGraphResult(
      filteredFiles.map((f) => f.path),
      contentReader,
      { verbose: flags.verbose },
    )

    spinner.succeed(
      `Found ${result.stats.totalExports} exports across ${filteredFiles.length} files`,
    )

    const outputData = format === 'json'
      ? formatExportGraphJson(result.graph, result.stats)
      : formatExportGraphTable(result.graph, result.stats)

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
  buildExportGraph,
  buildExportGraphResult,
  computeExportGraphStats,
  extractExports,
  extractImports,
  findHubExports,
  findOrphanExports,
  sourceBaseName,
} from './export-graph-helpers.js'
export type {
  ContentReader as ExportGraphContentReader,
  ExportEdge,
  ExportGraph,
  ExportGraphOptions,
  ExportGraphResult,
  ExportGraphStats,
  ExportInfo,
  ExportNode,
  ImportDetail,
} from './export-graph-helpers.js'
export {
  formatEdges,
  formatExportGraphJson,
  formatExportGraphStats,
  formatExportGraphTable,
  formatExportNode,
  formatExportNodes,
  formatHubExports,
  formatOrphanExports,
  typeLabel,
} from './export-graph-format-helpers.js'
