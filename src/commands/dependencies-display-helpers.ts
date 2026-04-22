import chalk from 'chalk'

import type { DependenciesReport, DependencyGraph } from './dependencies-helpers.js'

export function formatOutput(
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

export function graphToDotFormat(graph: DependencyGraph): {
  edges: [string, string][]
  nodes: string[]
} {
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

export function displayCircularDependencies(
  report: DependenciesReport,
  format: string,
  log: (message: string) => void,
): void {
  if (report.circularDependencies.length === 0) {
    log(chalk.green('✓ No circular dependencies found!'))
    return
  }

  if (format === 'json') {
    log(JSON.stringify({ circularDependencies: report.circularDependencies }, null, 2))
  } else {
    log(chalk.red(`\nFound ${report.circularDependencies.length} circular dependencies:\n`))

    for (const dep of report.circularDependencies) {
      log(chalk.red(`  Cycle: ${dep.cycle.join(' -> ')}`))
    }
  }
}

export function displayDependencyTree(
  report: DependenciesReport,
  log: (message: string) => void,
): void {
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
      log(`${prefix}${chalk.dim(node)}`)
      return
    }

    visited.add(node)

    const children = tree.get(node)

    if (!children || children.length === 0) {
      log(`${prefix}${chalk.cyan(node)}`)
      return
    }

    log(`${prefix}${chalk.green(node)}`)

    for (const child of children) {
      printNode(child, `${prefix}  `, depth + 1)
    }
  }

  log(chalk.bold('\n📦 Dependency Tree\n'))

  const rootNodes = report.graph.nodes.filter(
    (node) => !report.graph.edges.some(([, to]) => to === node),
  )

  if (rootNodes.length === 0) {
    log(chalk.dim('No root files found (all files have imports)'))
    return
  }

  for (const root of rootNodes.slice(0, 5)) {
    printNode(root, '', 1)
  }

  if (rootNodes.length > 5) {
    log(chalk.dim(`\n... and ${rootNodes.length - 5} more root files`))
  }
}

export function displayDotFormat(report: DependenciesReport, log: (message: string) => void): void {
  log('digraph dependencies {')

  for (const node of report.graph.nodes) {
    log(`  "${node}" [label="${node}"];`)
  }

  log('')

  for (const [from, to] of report.graph.edges) {
    log(`  "${from}" -> "${to}";`)
  }

  log('}')
}

export function displayExternalModules(
  report: DependenciesReport,
  format: string,
  log: (message: string) => void,
): void {
  if (report.externalModules.length === 0) {
    log(chalk.green('✓ No external dependencies found'))
    return
  }

  if (format === 'json') {
    log(JSON.stringify({ externalModules: report.externalModules }, null, 2))
  } else {
    log(chalk.cyan(`\nExternal modules (${report.externalModules.length}):\n`))

    for (const mod of report.externalModules) {
      log(`  ${chalk.dim(mod)}`)
    }
  }
}

export function displayFullReport(
  report: DependenciesReport,
  format: string,
  log: (message: string) => void,
): void {
  if (format === 'json') {
    log(JSON.stringify(report, null, 2))
    return
  }

  if (format === 'dot') {
    displayDotFormat(report, log)
    return
  }

  log(chalk.bold('\n📊 Dependency Analysis\n'))
  log(chalk.dim(`Files analyzed: ${report.filesAnalyzed}`))

  if (report.circularDependencies.length > 0) {
    log(chalk.red(`\nCircular Dependencies (${report.circularDependencies.length}):`))

    for (const dep of report.circularDependencies.slice(0, 5)) {
      log(chalk.red(`  • ${dep.cycle.join(' -> ')}`))
    }

    if (report.circularDependencies.length > 5) {
      log(chalk.dim(`  ... and ${report.circularDependencies.length - 5} more`))
    }
  } else {
    log(chalk.green('\n✓ No circular dependencies'))
  }

  if (report.internalModules.length > 0) {
    log(chalk.cyan(`\nInternal Modules (${report.internalModules.length}):`))

    for (const mod of report.internalModules.slice(0, 10)) {
      log(`  ${mod}`)
    }

    if (report.internalModules.length > 10) {
      log(chalk.dim(`  ... and ${report.internalModules.length - 10} more`))
    }
  }

  if (report.externalModules.length > 0) {
    log(chalk.yellow(`\nExternal Modules (${report.externalModules.length}):`))

    for (const mod of report.externalModules.slice(0, 10)) {
      log(`  ${mod}`)
    }

    if (report.externalModules.length > 10) {
      log(chalk.dim(`  ... and ${report.externalModules.length - 10} more`))
    }
  }

  if (report.orphanFiles.length > 0) {
    log(chalk.magenta(`\nOrphan Files (not imported by any file) (${report.orphanFiles.length}):`))

    for (const file of report.orphanFiles.slice(0, 5)) {
      log(`  ${file}`)
    }

    if (report.orphanFiles.length > 5) {
      log(chalk.dim(`  ... and ${report.orphanFiles.length - 5} more`))
    }
  }
}
