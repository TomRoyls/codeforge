import { Args, Command, Flags } from '@oclif/core'
import { writeFile } from 'node:fs/promises'

import { Parser } from '../core/parser.js'
import {
  detectCircularDependencies,
  extractImports as extractImportsHelper,
  findOrphanFiles as findOrphanFilesHelper,
} from './dependencies-helpers.js'
import type { CircularDependency, DependenciesReport } from './dependencies-helpers.js'
import {
  detectCyclesFromNode as detectCyclesFromNodeHelper,
  finishNodeVisit as finishNodeVisitHelper,
  normalizeCycle as normalizeCycleHelper,
  processDependency as processDependencyHelper,
  recordCycle as recordCycleHelper,
} from './dependencies-cycle-helpers.js'
import {
  displayCircularDependencies as displayCircularDependenciesHelper,
  displayDependencyTree as displayDependencyTreeHelper,
  displayDotFormat as displayDotFormatHelper,
  displayExternalModules as displayExternalModulesHelper,
  displayFullReport as displayFullReportHelper,
  formatOutput as formatOutputHelper,
  graphToDotFormat as graphToDotFormatHelper,
} from './dependencies-display-helpers.js'

/**
 * Analyze and visualize module dependencies.
 *
 * @example
 * codeforge dependencies
 * codeforge dependencies --format json
 * codeforge dependencies --circular
 * codeforge dependencies --tree
 */
export default class Dependencies extends Command {
  static override description = 'Analyze npm package.json dependencies'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Analyze dependencies in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output dependencies as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --circular',
      description: 'Show only circular dependencies',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --tree',
      description: 'Display dependency tree',
    },
  ]

  static override flags = {
    'check-updates': Flags.boolean({
      default: false,
      description: 'Check for outdated dependencies',
    }),
    circular: Flags.boolean({
      char: 'c',
      default: false,
      description: 'Only detect and show circular dependencies',
    }),
    depth: Flags.integer({
      char: 'd',
      default: 3,
      description: 'Maximum dependency tree depth',
    }),
    external: Flags.boolean({
      char: 'e',
      default: false,
      description: 'Show external module dependencies',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['csv', 'dot', 'json', 'table'],
    }),
    ignore: Flags.string({
      char: 'i',
      multiple: true,
      description: 'Patterns to ignore',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path',
    }),
    tree: Flags.boolean({
      char: 't',
      default: false,
      description: 'Display dependency tree',
    }),
    type: Flags.string({
      default: 'all',
      description: 'Type of dependencies to show',
      options: ['all', 'deps', 'devDeps'],
    }),
    verbose: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Show detailed output',
    }),
  }

  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Dependencies)

    const targetPath = (args as { path?: string }).path ?? '.'
    const { discoverFiles } = await import('../core/file-discovery.js')

    const files = await discoverFiles({
      cwd: targetPath,
      ignore: flags.ignore ?? [],
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    const spinner = {
      start: () => undefined,
      stop: () => undefined,
      text: '',
    }
    const report = await this.analyzeDependencies(files, spinner)

    const outputData = this.formatOutput(report, flags)

    if (flags.output) {
      try {
        await writeFile(flags.output, outputData, 'utf8')
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

  // ─── Instance methods (delegating to helpers) ─────────

  extractImports(sourceCode: string, filePath: string): unknown[] {
    return extractImportsHelper(sourceCode, filePath)
  }

  detectCircularDependencies(graph: unknown): CircularDependency[] {
    return detectCircularDependencies(graph as Parameters<typeof detectCircularDependencies>[0])
  }

  findOrphanFiles(graph: unknown): string[] {
    return findOrphanFilesHelper(graph as Parameters<typeof findOrphanFilesHelper>[0])
  }

  normalizeCycle(cycle: readonly string[]): string[] {
    return normalizeCycleHelper(cycle)
  }

  deduplicateCycles<T extends { cycle: readonly string[] }>(cycles: T[]): T[] {
    const seen = new Set<string>()
    const unique: T[] = []
    for (const c of cycles) {
      const normalized = normalizeCycleHelper(c.cycle)
      const key = normalized.join('->')
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(c)
      }
    }
    return unique
  }

  graphToDotFormat(graph: unknown): { edges: [string, string][]; nodes: string[] } {
    return graphToDotFormatHelper(graph as Parameters<typeof graphToDotFormatHelper>[0])
  }

  formatOutput(
    report: Parameters<typeof formatOutputHelper>[0],
    flags: Parameters<typeof formatOutputHelper>[1],
  ): string {
    return formatOutputHelper(report, flags)
  }

  processDependency(
    dependency: string,
    node: Parameters<typeof processDependencyHelper>[1],
    context: Parameters<typeof processDependencyHelper>[2],
  ): void {
    processDependencyHelper(dependency, node, context)
  }

  recordCycle(
    dependency: string,
    node: Parameters<typeof recordCycleHelper>[1],
    context: Parameters<typeof recordCycleHelper>[2],
  ): void {
    recordCycleHelper(dependency, node, context)
  }

  finishNodeVisit(
    currentPath: string,
    path: string[],
    recursionStack: Set<string>,
  ): void {
    finishNodeVisitHelper(currentPath, path, recursionStack)
  }

  detectCyclesFromNode(
    currentPath: string,
    context: Parameters<typeof detectCyclesFromNodeHelper>[1],
  ): void {
    detectCyclesFromNodeHelper(currentPath, context)
  }

  displayCircularDependencies(
    report: Parameters<typeof displayCircularDependenciesHelper>[0],
    format: string,
  ): void {
    displayCircularDependenciesHelper(report, format, (msg: string) => this.log(msg))
  }

  displayExternalModules(
    report: Parameters<typeof displayExternalModulesHelper>[0],
    format: string,
  ): void {
    displayExternalModulesHelper(report, format, (msg: string) => this.log(msg))
  }

  displayDotFormat(report: Parameters<typeof displayDotFormatHelper>[0]): void {
    displayDotFormatHelper(report, (msg: string) => this.log(msg))
  }

  displayFullReport(
    report: Parameters<typeof displayFullReportHelper>[0],
    format: string,
  ): void {
    displayFullReportHelper(report, format, (msg: string) => this.log(msg))
  }

  displayDependencyTree(report: Parameters<typeof displayDependencyTreeHelper>[0]): void {
    displayDependencyTreeHelper(report, (msg: string) => this.log(msg))
  }

  async analyzeDependencies(
    files: Array<{ absolutePath: string; path: string }>,
    spinner: { start: () => unknown; stop: () => unknown; text?: string },
  ): Promise<DependenciesReport> {
    const result: DependenciesReport = {
      circularDependencies: [],
      externalModules: [],
      filesAnalyzed: 0,
      graph: { edges: [], nodes: [] },
      internalModules: [],
      orphanFiles: [],
    }

    if (!files || files.length === 0) {
      return result
    }

    spinner?.start?.()

    type DependencyNode = {
      filePath: string
      importDetails: Map<string, unknown>
      imports: Set<string>
    }
    type DependencyGraph = { nodes: Map<string, DependencyNode> }
    const graph: DependencyGraph = { nodes: new Map() }
    const externalSet = new Set<string>()
    const internalSet = new Set<string>()

    const parser = new Parser({})
    await parser.initialize()

    try {
      for (const file of files) {
        try {
          const parseResult = await parser.parseFile(file.absolutePath)
          const sourceCode = parseResult.sourceFile.getText()
          const imports = this.extractImports(sourceCode, file.path) as Array<{
            modulePath: string
            sourceFile: string
            location: { column: number; line: number; end?: number }
          }>

          const importSet = new Set<string>()
          const importDetails = new Map<string, unknown>()
          for (const imp of imports) {
            importSet.add(imp.modulePath)
            importDetails.set(imp.modulePath, imp)
            if (imp.modulePath.startsWith('.')) {
              internalSet.add(imp.modulePath)
            } else {
              externalSet.add(imp.modulePath)
            }
          }

          graph.nodes.set(file.path, {
            filePath: file.path,
            importDetails,
            imports: importSet,
          })
          result.filesAnalyzed++
        } catch {
          // skip on parse error
        }
      }
    } finally {
      parser.dispose()
      spinner?.stop?.()
    }

    result.externalModules = [...externalSet].sort()
    result.internalModules = [...internalSet].sort()
    result.circularDependencies = this.detectCircularDependencies(graph)
    result.graph = this.graphToDotFormat(graph)
    result.orphanFiles = this.findOrphanFiles(graph)

    return result
  }
}

// ─── Backward-compatibility re-exports ──────────────────
// Keep these to avoid breaking consumers of the previous NPM-focused API.

export {
  buildDependencyTree,
  buildDependenciesResult,
  calculateHealthScore,
  calculateMaxDepth,
  categorizeVersionType,
  extractDependencies,
  parsePackageJson,
  parseVersionRange,
} from './dependencies-helpers.js'
export type {
  DependenciesResult,
  DependencyInfo,
  DependencyTree,
  SemverRange,
} from './dependencies-helpers.js'
export {
  formatDependenciesCsv,
  formatDependenciesJson,
  formatDependenciesTable,
  formatHealthBar,
  formatDependencyTree,
} from './dependencies-format-helpers.js'
