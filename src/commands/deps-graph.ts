import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import ora from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { buildGraph, findChains, findHubs } from './deps-graph-helpers.js'
import { formatGraphDot, formatGraphJson, formatGraphTable, formatGraphText } from './deps-graph-format-helpers.js'

export default class DepsGraph extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze import dependency graph across source files'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze dependency graph in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output dependency graph as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format dot --output graph.dot',
      description: 'Export graph as DOT file for Graphviz',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --top 20',
      description: 'Show top 20 most-depended-upon files',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --external',
      description: 'Include external/node_modules imports',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx',
      description: 'Analyze TypeScript files only',
    },
  ]

  static override flags = {
    depth: Flags.integer({
      default: 10,
      description: 'Max depth for dependency chains',
    }),
    ext: Flags.string({
      char: 'e',
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated extensions to analyze',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['dot', 'json', 'table', 'text'],
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
    top: Flags.integer({
      default: 10,
      description: 'Show top N most-depended-upon files',
    }),
    external: Flags.boolean({
      default: false,
      description: 'Include external/node_modules imports',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DepsGraph)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'dot' | 'json' | 'table' | 'text'

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean)
    const patterns = extensions.map((ext: string) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns,
    })

    const filteredFiles = extensions.length > 0
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    spinner.text = 'Building dependency graph...'

    const graph = await buildGraph(filteredFiles, (path: string) => fs.readFile(path, 'utf8'), {
      includeExternal: flags.external,
      maxDepth: flags.depth,
    })

    const hubs = findHubs(graph, flags.top)
    const chains = findChains(graph, flags.depth)

    spinner.succeed(
      `Analyzed ${graph.stats.totalFiles} files with ${graph.stats.totalEdges} edges`,
    )

    const outputData =
      format === 'json'
        ? formatGraphJson(graph)
        : format === 'dot'
          ? formatGraphDot(graph)
          : format === 'text'
            ? formatGraphText(graph, flags.depth)
            : formatGraphTable(graph, hubs)

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

    if (chains.length > 0 && format === 'table') {
      this.log('')
      this.log(chalk.bold('Longest Dependency Chains:'))
      for (let i = 0; i < chains.length; i++) {
        const chain = chains[i]!
        this.log(`  ${i + 1}. ${chain.join(' → ')}`)
      }
    }
  }
}

import chalk from 'chalk'

export {
  buildGraph,
  extractImports,
  findChains,
  findHubs,
  isExternalImport,
  resolveImportPath,
} from './deps-graph-helpers.js'
export type {
  BuildGraphOptions,
  DepGraph,
  FileNode,
  GraphStats,
  HubFile,
  ImportInfo,
} from './deps-graph-helpers.js'
export {
  formatGraphDot,
  formatGraphJson,
  formatGraphTable,
  formatGraphText,
} from './deps-graph-format-helpers.js'
