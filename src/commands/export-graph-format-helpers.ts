import chalk from 'chalk'

import type { ExportEdge, ExportGraph, ExportGraphStats, ExportInfo, ExportNode } from './export-graph-helpers.js'

// ─── Type Label ─────────────────────────────────────────

/**
 * @example
 * const label = typeLabel('function')
 * console.log(label)
 */
export function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    class: chalk.magenta('cls'),
    const: chalk.blue('con'),
    default: chalk.rgb(255, 165, 0)('def'),
    enum: chalk.cyan('enum'),
    function: chalk.green('fn'),
    interface: chalk.yellow('ifc'),
    type: chalk.gray('typ'),
  }
  return labels[type] ?? chalk.gray(type)
}

// ─── Format Export Node ─────────────────────────────────

/**
 * @example
 * const text = formatExportNode(node)
 * console.log(text)
 */
export function formatExportNode(node: ExportNode): string {
  const lines: string[] = []
  const ratio = isFinite(node.exportToImportRatio) ? String(node.exportToImportRatio) : '∞'

  lines.push(`  ${chalk.bold(node.file)}`)
  lines.push(`    ${chalk.cyan('exports:')} ${node.totalExports}  ${chalk.cyan('imports:')} ${node.totalImports}  ${chalk.cyan('ratio:')} ${ratio}`)

  for (const exp of node.exports) {
    const label = typeLabel(exp.type)
    const importers = exp.importCount > 0
      ? chalk.gray(` (${exp.importCount} importer${exp.importCount !== 1 ? 's' : ''})`)
      : chalk.red(' (unused)')
    lines.push(`    ${label} ${exp.name}${importers}`)
  }

  return lines.join('\n')
}

// ─── Format Export Nodes ────────────────────────────────

/**
 * @example
 * const text = formatExportNodes(nodes)
 * console.log(text)
 */
export function formatExportNodes(nodes: ExportNode[]): string {
  const parts: string[] = []
  parts.push(chalk.bold('  Export Nodes'))
  parts.push(chalk.gray('  ──────────────────────────────────────────────'))
  for (const node of nodes) {
    parts.push(formatExportNode(node))
  }
  return parts.join('\n')
}

// ─── Format Edges ───────────────────────────────────────

/**
 * @example
 * const text = formatEdges(edges)
 * console.log(text)
 */
export function formatEdges(edges: ExportEdge[]): string {
  if (edges.length === 0) return chalk.gray('  No edges found')

  const lines: string[] = []
  lines.push(chalk.bold('  Edges'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const edge of edges) {
    const symbols = edge.symbols.length > 0
      ? chalk.gray(` [${edge.symbols.join(', ')}]`)
      : ''
    lines.push(`  ${chalk.cyan(edge.from)} ${chalk.gray('→')} ${chalk.cyan(edge.to)}${symbols}`)
  }

  return lines.join('\n')
}

// ─── Format Orphan Exports ──────────────────────────────

/**
 * @example
 * const text = formatOrphanExports(orphans)
 * console.log(text)
 */
export function formatOrphanExports(orphans: ExportInfo[]): string {
  if (orphans.length === 0) return chalk.green('  ✓ No orphan exports')

  const lines: string[] = []
  lines.push(chalk.bold('  Orphan Exports (unused)'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const orphan of orphans) {
    const label = typeLabel(orphan.type)
    lines.push(`  ${chalk.red('✗')} ${label} ${orphan.name} ${chalk.gray(`in ${orphan.file}:${orphan.line}`)}`)
  }

  return lines.join('\n')
}

// ─── Format Hub Exports ─────────────────────────────────

/**
 * @example
 * const text = formatHubExports(hubs)
 * console.log(text)
 */
export function formatHubExports(hubs: ExportInfo[]): string {
  if (hubs.length === 0) return chalk.gray('  No hub exports (>5 importers)')

  const lines: string[] = []
  lines.push(chalk.bold('  Hub Exports (>5 importers)'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))

  for (const hub of hubs) {
    const label = typeLabel(hub.type)
    lines.push(`  ${chalk.green('★')} ${label} ${hub.name} ${chalk.gray(`${hub.importCount} importers`)}`)
  }

  return lines.join('\n')
}

// ─── Format Stats ───────────────────────────────────────

/**
 * @example
 * const text = formatExportGraphStats(stats)
 * console.log(text)
 */
export function formatExportGraphStats(stats: ExportGraphStats): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold('  Statistics'))
  lines.push(chalk.gray('  ──────────────────────────────────────────────'))
  lines.push(`  ${chalk.cyan('Total Exports:')}        ${stats.totalExports}`)
  lines.push(`  ${chalk.cyan('Total Imports:')}        ${stats.totalImports}`)
  lines.push(`  ${chalk.cyan('Total Edges:')}          ${stats.totalEdges}`)
  lines.push(`  ${chalk.cyan('Orphan Exports:')}      ${stats.orphanCount}`)
  lines.push(`  ${chalk.cyan('Hub Exports:')}          ${stats.hubCount}`)
  lines.push(`  ${chalk.cyan('Avg Exports/File:')}    ${stats.avgExportsPerFile}`)
  lines.push(`  ${chalk.cyan('Avg Imports/File:')}    ${stats.avgImportsPerFile}`)

  if (stats.mostUsedExport) {
    lines.push(`  ${chalk.cyan('Most Used:')}           ${stats.mostUsedExport.name} (${stats.mostUsedExport.importCount} importers)`)
  }

  return lines.join('\n')
}

// ─── Format Table ───────────────────────────────────────

/**
 * @example
 * const text = formatExportGraphTable(graph, stats)
 * console.log(text)
 */
export function formatExportGraphTable(graph: ExportGraph, stats: ExportGraphStats): string {
  const parts: string[] = []

  parts.push('')
  parts.push(chalk.bold('  Export Dependency Graph'))
  parts.push(chalk.gray('  ══════════════════════════════════════════════'))

  parts.push(formatExportNodes(graph.nodes))
  parts.push('')
  parts.push(formatEdges(graph.edges))
  parts.push('')
  parts.push(formatOrphanExports(graph.orphanExports))
  parts.push('')
  parts.push(formatHubExports(graph.hubExports))
  parts.push(formatExportGraphStats(stats))

  parts.push('')
  return parts.join('\n')
}

// ─── Format JSON ────────────────────────────────────────

/**
 * @example
 * const json = formatExportGraphJson(graph, stats)
 * console.log(json.length)
 */
export function formatExportGraphJson(graph: ExportGraph, stats: ExportGraphStats): string {
  return JSON.stringify({ graph, stats }, null, 2)
}
