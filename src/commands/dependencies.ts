import { Args, Command, Flags } from '@oclif/core'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora, { type Ora } from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { logger } from '../utils/logger.js'
import {
  type CircularDependency,
  type CycleDetectionContext,
  deduplicateCycles as deduplicateCyclesHelper,
  type DependenciesReport,
  type DependencyGraph,
  type DependencyNode,
  detectCircularDependencies as detectCircularDependenciesHelper,
  detectCyclesFromNode as detectCyclesFromNodeHelper,
  displayCircularDependencies as displayCircularDependenciesHelper,
  displayDependencyTree as displayDependencyTreeHelper,
  displayDotFormat as displayDotFormatHelper,
  displayExternalModules as displayExternalModulesHelper,
  displayFullReport as displayFullReportHelper,
  extractImports as extractImportsHelper,
  findOrphanFiles as findOrphanFilesHelper,
  finishNodeVisit as finishNodeVisitHelper,
  formatOutput as formatOutputHelper,
  graphToDotFormat as graphToDotFormatHelper,
  type ImportInfo,
  normalizeCycle as normalizeCycleHelper,
  processDependency as processDependencyHelper,
  recordCycle as recordCycleHelper,
} from './dependencies-helpers.js'

export default class Dependencies extends Command {
  static override args = {
    path: Args.string({
      default: '.',
      description: 'Path to analyze',
      required: false,
    }),
  }

  static override description = 'Analyze and visualize module dependencies'

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
      description: 'Only show circular dependencies',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --tree',
      description: 'Display dependency tree visualization',
    },
  ]

  static override flags = {
    circular: Flags.boolean({
      char: 'c',
      default: false,
      description: 'Only detect and show circular dependencies',
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
      options: ['dot', 'json', 'table'],
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
    tree: Flags.boolean({
      char: 't',
      default: false,
      description: 'Display dependency tree visualization',
    }),
  }

  deduplicateCycles(cycles: CircularDependency[]): CircularDependency[] {
    return deduplicateCyclesHelper(cycles)
  }

  detectCyclesFromNode(currentPath: string, context: CycleDetectionContext): void {
    return detectCyclesFromNodeHelper(currentPath, context)
  }

  displayDotFormat(report: DependenciesReport): void {
    displayDotFormatHelper(report, (msg) => this.log(msg))
  }

  extractImports(sourceCode: string, filePath: string): ImportInfo[] {
    return extractImportsHelper(sourceCode, filePath)
  }

  finishNodeVisit(currentPath: string, path: string[], recursionStack: Set<string>): void {
    return finishNodeVisitHelper(currentPath, path, recursionStack)
  }

  normalizeCycle(cycle: readonly string[]): string[] {
    return normalizeCycleHelper(cycle)
  }

  processDependency(
    dependency: string,
    node: DependencyNode,
    context: CycleDetectionContext,
  ): void {
    return processDependencyHelper(dependency, node, context)
  }

  recordCycle(
    dependency: string,
    node: DependencyNode,
    context: { cycles: CircularDependency[]; path: string[] },
  ): void {
    return recordCycleHelper(dependency, node, context)
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Dependencies)
    const targetPath = resolve(args.path as string)

    if (!existsSync(targetPath)) {
      this.error(`Path not found: ${targetPath}`, { exit: 1 })
    }

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = flags.ignore ? [...defaultIgnore, ...flags.ignore] : defaultIgnore

    const spinner = ora('Analyzing dependencies...').start()

    const discoveredFiles = await discoverFiles({
      cwd: targetPath,
      ignore,
      patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    })

    spinner.text = 'Building dependency graph...'

    const report = await this.analyzeDependencies(discoveredFiles, spinner)

    spinner.stop()

    if (flags.tree) {
      this.displayDependencyTree(report)
    } else if (flags.circular) {
      this.displayCircularDependencies(report, flags.format)
    } else if (flags.external) {
      this.displayExternalModules(report, flags.format)
    } else {
      this.displayFullReport(report, flags.format)
    }

    if (flags.output) {
      const content = this.formatOutput(report, flags)

      try {
        await writeFile(flags.output, content, 'utf8')
        this.log(`Results written to ${flags.output}`)
      } catch (error) {
        this.error(
          `Failed to write dependencies output to ${flags.output}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }

  private async analyzeDependencies(
    files: { absolutePath: string; path: string }[],
    spinner: Ora,
  ): Promise<DependenciesReport> {
    const graph: DependencyGraph = { nodes: new Map() }
    const externalModules = new Set<string>()
    const internalModules = new Set<string>()
    const parser = new Parser()

    await parser.initialize()

    for (const file of files) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const parseResult = await parser.parseFile(file.absolutePath)
        const sourceCode = parseResult.sourceFile.getText()
        const imports = this.extractImports(sourceCode, file.path)

        const node: DependencyNode = {
          filePath: file.path,
          importDetails: new Map(imports.map((i) => [i.modulePath, i])),
          imports: new Set(imports.map((i) => i.modulePath)),
        }

        graph.nodes.set(file.path, node)

        for (const imp of imports) {
          if (imp.modulePath.startsWith('.')) {
            internalModules.add(imp.modulePath)
          } else {
            externalModules.add(imp.modulePath)
          }
        }
      } catch (error) {
        logger.debug(`Failed to parse ${file.path}: ${error}`)
      }

      spinner.text = `Analyzed ${graph.nodes.size}/${files.length} files`
    }

    parser.dispose()

    const circularDependencies = this.detectCircularDependencies(graph)
    const orphanFiles = this.findOrphanFiles(graph)

    return {
      circularDependencies,
      externalModules: [...externalModules].sort(),
      filesAnalyzed: graph.nodes.size,
      graph: this.graphToDotFormat(graph),
      internalModules: [...internalModules].sort(),
      orphanFiles,
    }
  }

  private detectCircularDependencies(graph: DependencyGraph): CircularDependency[] {
    return detectCircularDependenciesHelper(graph)
  }

  private displayCircularDependencies(report: DependenciesReport, format: string): void {
    displayCircularDependenciesHelper(report, format, (msg) => this.log(msg))
  }

  private displayDependencyTree(report: DependenciesReport): void {
    displayDependencyTreeHelper(report, (msg) => this.log(msg))
  }

  private displayExternalModules(report: DependenciesReport, format: string): void {
    displayExternalModulesHelper(report, format, (msg) => this.log(msg))
  }

  private displayFullReport(report: DependenciesReport, format: string): void {
    displayFullReportHelper(report, format, (msg) => this.log(msg))
  }

  private findOrphanFiles(graph: DependencyGraph): string[] {
    return findOrphanFilesHelper(graph)
  }

  private formatOutput(
    report: DependenciesReport,
    flags: { circular?: boolean; external?: boolean; format?: string },
  ): string {
    return formatOutputHelper(report, flags)
  }

  private graphToDotFormat(graph: DependencyGraph): { edges: [string, string][]; nodes: string[] } {
    return graphToDotFormatHelper(graph)
  }
}
