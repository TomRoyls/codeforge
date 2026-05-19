import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { extname, resolve } from 'node:path'

import { discoverFiles } from '../core/file-discovery.js'
import { formatGraph, formatGraphJson, formatTree } from './graph-format-helpers.js'
import { buildDependencyGraph, findCycles } from './graph-helpers.js'
import ora from 'ora'

export default class Graph extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze dependencies for',
      required: false,
    }),
  }

  static override description = 'Visualize file dependency graph as ASCII tree or graph'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Show dependency tree for current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> ./src --format json',
      description: 'Output dependency graph as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --ext .ts,.tsx --depth 5',
      description: 'Analyze TypeScript dependencies with depth 5',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --direction imported-by',
      description: 'Show reverse dependency graph (who imports each file)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --highlight count',
      description: 'Highlight files matching "count" pattern',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format graph',
      description: 'Show ASCII box-and-arrow graph view',
    },
  ]

  static override flags = {
    depth: Flags.integer({
      default: 3,
      description: 'Maximum traversal depth',
    }),
    direction: Flags.string({
      default: 'imports',
      description: 'Direction to traverse dependencies',
      options: ['imported-by', 'imports'],
    }),
    ext: Flags.string({
      char: 'e',
      default: '.ts,.tsx,.js,.jsx',
      description: 'Comma-separated file extensions to analyze (e.g., ".ts,.tsx")',
    }),
    format: Flags.string({
      char: 'f',
      default: 'tree',
      description: 'Output format',
      options: ['graph', 'json', 'tree'],
    }),
    highlight: Flags.string({
      description: 'File pattern to highlight in the output',
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
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Graph)

    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const format = flags.format as 'graph' | 'json' | 'tree'
    const direction = flags.direction as 'imports' | 'imported-by'
    const maxDepth = flags.depth

    const spinner = ora('Discovering files...').start()

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const extensions = flags.ext
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)

    const globPatterns = extensions.map((ext) => `**/*${ext}`)

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: globPatterns,
    })

    const filteredFiles = extensions.length > 0
      ? discoveredFiles.filter((f) => {
          const ext = extname(f.path).toLowerCase()
          return extensions.includes(ext)
        })
      : discoveredFiles

    if (filteredFiles.length === 0) {
      spinner.warn('No files found matching the specified extensions')
      return
    }

    spinner.text = 'Building dependency graph...'

    const filesMap = new Map<string, string>()
    for (const file of filteredFiles) {
      filesMap.set(file.absolutePath, file.path)
    }

    const contentReader = async (path: string): Promise<string> => {
      try {
        return await fs.readFile(path, 'utf8')
      } catch {
        return ''
      }
    }

    const rootPath = filteredFiles[0]!.absolutePath
    const result = await buildDependencyGraph(rootPath, filesMap, contentReader, maxDepth, direction)

    const cycles = findCycles(result.nodes)

    spinner.succeed(
      `Analyzed ${result.totalNodes} files with ${result.totalEdges} dependencies` +
        (cycles.length > 0 ? ` (${cycles.length} cycle${cycles.length > 1 ? 's' : ''} detected)` : ''),
    )

    const outputData =
      format === 'json'
        ? formatGraphJson(result)
        : format === 'graph'
          ? formatGraph(result, flags.highlight)
          : formatTree(result, flags.highlight)

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

export { buildDependencyGraph, computeNodeDepths, extractDependencies, findCycles, resolveImportPath } from './graph-helpers.js'
export type { DependencyEdge, DependencyNode, GraphResult } from './graph-helpers.js'
export { drawBox, formatGraph, formatGraphJson, formatTreeNode, formatTree } from './graph-format-helpers.js'
