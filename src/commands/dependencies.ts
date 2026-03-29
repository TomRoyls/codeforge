import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ora, { type Ora } from 'ora'

import { discoverFiles } from '../core/file-discovery.js'
import { Parser } from '../core/parser.js'
import { logger } from '../utils/logger.js'

interface ImportInfo {
  location: { column: number; end: number; line: number }
  modulePath: string
  sourceFile: string
}

interface DependencyNode {
  filePath: string
  importDetails: Map<string, ImportInfo>
  imports: Set<string>
}

interface DependencyGraph {
  nodes: Map<string, DependencyNode>
}

interface CircularDependency {
  cycle: readonly string[]
  location: ImportInfo['location']
}

interface DependenciesReport {
  circularDependencies: CircularDependency[]
  externalModules: string[]
  filesAnalyzed: number
  graph: { edges: [string, string][]; nodes: string[] }
  internalModules: string[]
  orphanFiles: string[]
}

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
      await writeFile(flags.output, content, 'utf8')
      this.log(`Results written to ${flags.output}`)
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

  private deduplicateCycles(cycles: CircularDependency[]): CircularDependency[] {
    const seen = new Set<string>()
    const unique: CircularDependency[] = []

    for (const cycle of cycles) {
      const normalized = this.normalizeCycle(cycle.cycle)
      const key = normalized.join('->')

      if (!seen.has(key)) {
        seen.add(key)
        unique.push(cycle)
      }
    }

    return unique
  }

  private detectCircularDependencies(graph: DependencyGraph): CircularDependency[] {
    const cycles: CircularDependency[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    for (const filePath of graph.nodes.keys()) {
      this.detectCyclesFromNode(filePath, {
        cycles,
        graph,
        maxDepth: 50,
        path: [],
        recursionStack,
        visited,
      })
    }

    return this.deduplicateCycles(cycles)
  }

  private detectCyclesFromNode(
    currentPath: string,
    context: {
      cycles: CircularDependency[]
      graph: DependencyGraph
      maxDepth: number
      path: string[]
      recursionStack: Set<string>
      visited: Set<string>
    },
  ): void {
    const { graph, maxDepth, path, recursionStack, visited } = context

    if (path.length > maxDepth) return

    visited.add(currentPath)
    recursionStack.add(currentPath)
    path.push(currentPath)

    const node = graph.nodes.get(currentPath)
    if (!node) {
      this.finishNodeVisit(currentPath, path, recursionStack)
      return
    }

    for (const dependency of node.imports) {
      this.processDependency(dependency, node, context)
    }

    this.finishNodeVisit(currentPath, path, recursionStack)
  }

  private displayCircularDependencies(report: DependenciesReport, format: string): void {
    if (report.circularDependencies.length === 0) {
      this.log(chalk.green('✓ No circular dependencies found!'))
      return
    }

    if (format === 'json') {
      this.log(JSON.stringify({ circularDependencies: report.circularDependencies }, null, 2))
    } else {
      this.log(chalk.red(`\nFound ${report.circularDependencies.length} circular dependencies:\n`))

      for (const dep of report.circularDependencies) {
        this.log(chalk.red(`  Cycle: ${dep.cycle.join(' -> ')}`))
      }
    }
  }
  private displayDependencyTree(report: DependenciesReport): void {
    const tree = new Map<string, string[]>()

    for (const [from, to] of report.graph.edges) {
      if (!tree.has(from)) {
        tree.set(from, [])
      }

      tree.get(from)?.push(to)
    }

    const visited = new Set<string>()

    const printNode = (node: string, prefix: string, depth: number): void => {
      if (depth > 10 || visited.has(node)) {
        this.log(`${prefix}${chalk.dim(node)}`)
        return
      }

      visited.add(node)

      const children = tree.get(node)

      if (!children || children.length === 0) {
        this.log(`${prefix}${chalk.cyan(node)}`)
        return
      }

      this.log(`${prefix}${chalk.green(node)}`)

      for (const child of children) {
        printNode(child, `${prefix}  `, depth + 1)
      }
    }

    this.log(chalk.bold('\n📦 Dependency Tree\n'))

    const rootNodes = report.graph.nodes.filter(
      (node) => !report.graph.edges.some(([, to]) => to === node),
    )

    if (rootNodes.length === 0) {
      this.log(chalk.dim('No root files found (all files have imports)'))
      return
    }

    for (const root of rootNodes.slice(0, 5)) {
      printNode(root, '', 1)
    }

    if (rootNodes.length > 5) {
      this.log(chalk.dim(`\n... and ${rootNodes.length - 5} more root files`))
    }
  }
  private displayDotFormat(report: DependenciesReport): void {
    this.log('digraph dependencies {')

    for (const node of report.graph.nodes) {
      this.log(`  "${node}" [label="${node}"];`)
    }

    this.log('')

    for (const [from, to] of report.graph.edges) {
      this.log(`  "${from}" -> "${to}";`)
    }

    this.log('}')
  }

  private displayExternalModules(report: DependenciesReport, format: string): void {
    if (report.externalModules.length === 0) {
      this.log(chalk.green('✓ No external dependencies found'))
      return
    }

    if (format === 'json') {
      this.log(JSON.stringify({ externalModules: report.externalModules }, null, 2))
    } else {
      this.log(chalk.cyan(`\nExternal modules (${report.externalModules.length}):\n`))

      for (const mod of report.externalModules) {
        this.log(`  ${chalk.dim(mod)}`)
      }
    }
  }

  private displayFullReport(report: DependenciesReport, format: string): void {
    if (format === 'json') {
      this.log(JSON.stringify(report, null, 2))
      return
    }

    if (format === 'dot') {
      this.displayDotFormat(report)
      return
    }

    this.log(chalk.bold('\n📊 Dependency Analysis\n'))
    this.log(chalk.dim(`Files analyzed: ${report.filesAnalyzed}`))

    if (report.circularDependencies.length > 0) {
      this.log(chalk.red(`\nCircular Dependencies (${report.circularDependencies.length}):`))

      for (const dep of report.circularDependencies.slice(0, 5)) {
        this.log(chalk.red(`  • ${dep.cycle.join(' -> ')}`))
      }

      if (report.circularDependencies.length > 5) {
        this.log(chalk.dim(`  ... and ${report.circularDependencies.length - 5} more`))
      }
    } else {
      this.log(chalk.green('\n✓ No circular dependencies'))
    }

    if (report.internalModules.length > 0) {
      this.log(chalk.cyan(`\nInternal Modules (${report.internalModules.length}):`))

      for (const mod of report.internalModules.slice(0, 10)) {
        this.log(`  ${mod}`)
      }

      if (report.internalModules.length > 10) {
        this.log(chalk.dim(`  ... and ${report.internalModules.length - 10} more`))
      }
    }

    if (report.externalModules.length > 0) {
      this.log(chalk.yellow(`\nExternal Modules (${report.externalModules.length}):`))

      for (const mod of report.externalModules.slice(0, 10)) {
        this.log(`  ${mod}`)
      }

      if (report.externalModules.length > 10) {
        this.log(chalk.dim(`  ... and ${report.externalModules.length - 10} more`))
      }
    }

    if (report.orphanFiles.length > 0) {
      this.log(
        chalk.magenta(`\nOrphan Files (not imported by any file) (${report.orphanFiles.length}):`),
      )

      for (const file of report.orphanFiles.slice(0, 5)) {
        this.log(`  ${file}`)
      }

      if (report.orphanFiles.length > 5) {
        this.log(chalk.dim(`  ... and ${report.orphanFiles.length - 5} more`))
      }
    }
  }

  private extractImports(sourceCode: string, filePath: string): ImportInfo[] {
    const imports: ImportInfo[] = []
    const lines = sourceCode.split('\n')

    for (const [lineIndex, line] of lines.entries()) {
      const trimmedLine = line.trim()

      const importMatch = trimmedLine.match(
        /^import\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/,
      )

      const dynamicMatch = trimmedLine.match(/import\s*\(\s*['"]([^'"]+)['"]/)

      const requireMatch = trimmedLine.match(/require\s*\(\s*['"]([^'"]+)['"]/)

      if (importMatch) {
        const modulePath = importMatch[1]

        if (modulePath) {
          imports.push({
            location: { column: 1, end: line.length, line: lineIndex + 1 },
            modulePath,
            sourceFile: filePath,
          })
        }
      } else if (dynamicMatch) {
        const modulePath = dynamicMatch[1]

        if (modulePath) {
          imports.push({
            location: { column: 1, end: line.length, line: lineIndex + 1 },
            modulePath,
            sourceFile: filePath,
          })
        }
      } else if (requireMatch) {
        const modulePath = requireMatch[1]

        if (modulePath) {
          imports.push({
            location: { column: 1, end: line.length, line: lineIndex + 1 },
            modulePath,
            sourceFile: filePath,
          })
        }
      }
    }

    return imports
  }

  private findOrphanFiles(graph: DependencyGraph): string[] {
    const importedFiles = new Set<string>()

    for (const node of graph.nodes.values()) {
      for (const imp of node.imports) {
        if (imp.startsWith('.')) {
          importedFiles.add(imp)
        }
      }
    }

    const orphans: string[] = []

    for (const filePath of graph.nodes.keys()) {
      if (!importedFiles.has(filePath)) {
        orphans.push(filePath)
      }
    }

    return orphans
  }

  private finishNodeVisit(currentPath: string, path: string[], recursionStack: Set<string>): void {
    path.pop()
    recursionStack.delete(currentPath)
  }

  private formatOutput(
    report: DependenciesReport,
    flags: { circular?: boolean; external?: boolean; format?: string },
  ): string {
    if (flags.circular) {
      return JSON.stringify({ circularDependencies: report.circularDependencies }, null, 2)
    }

    if (flags.external) {
      return JSON.stringify({ externalModules: report.externalModules }, null, 2)
    }

    if (flags.format === 'dot') {
      let output = 'digraph dependencies {\n'

      for (const node of report.graph.nodes) {
        output += `  "${node}" [label="${node}"];\n`
      }

      output += '\n'

      for (const [from, to] of report.graph.edges) {
        output += `  "${from}" -> "${to}";\n`
      }

      output += '}'
      return output
    }

    return JSON.stringify(report, null, 2)
  }

  private graphToDotFormat(graph: DependencyGraph): { edges: [string, string][]; nodes: string[] } {
    const nodes = [...graph.nodes.keys()]
    const edges: [string, string][] = []

    for (const node of graph.nodes.values()) {
      for (const imp of node.imports) {
        if (imp.startsWith('.')) {
          edges.push([node.filePath, imp])
        }
      }
    }

    return { edges, nodes }
  }

  private normalizeCycle(cycle: readonly string[]): string[] {
    const withoutLast = cycle.slice(0, -1)

    if (withoutLast.length === 0) return [...cycle] as string[]

    let minIndex = 0

    for (let i = 1; i < withoutLast.length; i++) {
      const current = withoutLast[i]
      const min = withoutLast[minIndex]

      if (current !== undefined && min !== undefined && current < min) {
        minIndex = i
      }
    }

    const minElement = withoutLast[minIndex]

    if (minElement === undefined) {
      return [...withoutLast] as string[]
    }

    const rotated = [...withoutLast.slice(minIndex), ...withoutLast.slice(0, minIndex), minElement]
    return rotated.filter((item): item is string => item !== undefined)
  }

  private processDependency(
    dependency: string,
    node: DependencyNode,
    context: {
      cycles: CircularDependency[]
      graph: DependencyGraph
      maxDepth: number
      path: string[]
      recursionStack: Set<string>
      visited: Set<string>
    },
  ): void {
    const depNode = context.graph.nodes.get(dependency)
    if (!depNode) return

    if (!context.visited.has(dependency)) {
      this.detectCyclesFromNode(dependency, {
        ...context,
        path: [...context.path],
      })
    } else if (context.recursionStack.has(dependency)) {
      this.recordCycle(dependency, node, context)
    }
  }

  private recordCycle(
    dependency: string,
    node: DependencyNode,
    context: { cycles: CircularDependency[]; path: string[] },
  ): void {
    const cycleStartIndex = context.path.indexOf(dependency)
    const cycle = [...context.path.slice(cycleStartIndex), dependency]
    const importDetail = node.importDetails.get(dependency)

    if (importDetail) {
      context.cycles.push({
        cycle,
        location: importDetail.location,
      })
    }
  }
}
