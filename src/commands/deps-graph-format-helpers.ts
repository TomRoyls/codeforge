import chalk from 'chalk'

import type { DepGraph, HubFile } from './deps-graph-helpers.js'

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

export function formatGraphTable(graph: DepGraph, hubs: HubFile[]): string {
  const lines: string[] = [chalk.bold('\n📊 Dependency Graph Report'), '']

  // ─── Most Depended-Upon section ─────────────────────
  lines.push(chalk.bold('Most Depended-Upon Files:'))
  lines.push('')

  if (hubs.length > 0) {
    const colWidths = {
      importedBy: Math.max(11, ...hubs.map((h) => String(h.importedByCount).length)),
      imports: Math.max(8, ...hubs.map((h) => String(h.importCount).length)),
      score: Math.max(6, ...hubs.map((h) => String(h.score).length)),
      file: Math.max(12, ...hubs.map((h) => h.filePath.length)),
    }

    const header =
      chalk.cyan(padRight('File', colWidths.file)) +
      '  ' +
      chalk.cyan(padLeft('Imported By', colWidths.importedBy)) +
      '  ' +
      chalk.cyan(padLeft('Imports', colWidths.imports)) +
      '  ' +
      chalk.cyan(padLeft('Score', colWidths.score))

    lines.push(header)
    lines.push(chalk.dim('─'.repeat(header.length)))

    const maxScore = hubs[0]?.score ?? 0
    const minScore = hubs[hubs.length - 1]?.score ?? 0
    const scoreRange = maxScore - minScore || 1

    for (const hub of hubs) {
      const ratio = (hub.score - minScore) / scoreRange
      const colorFn = ratio > 0.66 ? chalk.red : ratio > 0.33 ? chalk.yellow : chalk.green

      const row =
        colorFn(padRight(hub.filePath, colWidths.file)) +
        '  ' +
        padLeft(String(hub.importedByCount), colWidths.importedBy) +
        '  ' +
        padLeft(String(hub.importCount), colWidths.imports) +
        '  ' +
        padLeft(String(hub.score), colWidths.score)
      lines.push(row)
    }

    lines.push(chalk.dim('─'.repeat(header.length)))
  } else {
    lines.push(chalk.dim('  No files found.'))
  }

  // ─── Stats section ──────────────────────────────────
  lines.push('')
  lines.push(chalk.bold('Statistics:'))
  lines.push(`  Total files:         ${graph.stats.totalFiles}`)
  lines.push(`  Total imports:       ${graph.stats.totalImports}`)
  lines.push(`  Total edges:         ${graph.stats.totalEdges}`)
  lines.push(`  Avg imports/file:    ${graph.stats.avgImportsPerFile}`)
  lines.push(`  Max depth:           ${graph.stats.maxDepth}`)
  lines.push(`  External imports:    ${graph.stats.externalImports}`)

  return lines.join('\n')
}

// ─── DOT/Graphviz formatting ────────────────────────────

export function formatGraphDot(graph: DepGraph): string {
  const lines: string[] = ['digraph {']
  lines.push('  rankdir=LR;')

  // Only internal edges
  const internalEdges = graph.edges.filter((edge) => {
    const fromNode = graph.nodes.get(edge.from)
    return fromNode !== undefined || !edge.to.startsWith('.')
  })

  const edgeSet = new Set<string>()
  for (const edge of internalEdges) {
    const key = `${edge.from}->${edge.to}`
    if (edgeSet.has(key)) continue
    edgeSet.add(key)

    const fromLabel = edge.from.split('/').pop() ?? edge.from
    const toLabel = edge.to.split('/').pop() ?? edge.to
    lines.push(`  "${fromLabel}" -> "${toLabel}";`)
  }

  lines.push('}')
  return lines.join('\n')
}

// ─── Text tree formatting ───────────────────────────────

export function formatGraphText(graph: DepGraph, maxDepth: number): string {
  const lines: string[] = []

  // Find root files (files with no importers)
  const importedPaths = new Set<string>()
  for (const edge of graph.edges) {
    importedPaths.add(edge.to)
  }

  const roots = Array.from(graph.nodes.keys()).filter((fp) => !importedPaths.has(fp))
  const displayRoots = roots.length > 0 ? roots : Array.from(graph.nodes.keys()).slice(0, 20)

  function renderTree(filePath: string, prefix: string, depth: number, visited: Set<string>): void {
    const node = graph.nodes.get(filePath)
    if (!node || depth > maxDepth) return

    const fileName = filePath.split('/').pop() ?? filePath
    lines.push(`${prefix}${fileName}`)

    if (visited.has(filePath)) return
    visited.add(filePath)

    const internalImports = node.imports.filter((imp) => !imp.isExternal)
    const children = internalImports
      .map((imp) => {
        const resolved = imp.source.startsWith('.') || imp.source.startsWith('/')
          ? filePath.substring(0, filePath.lastIndexOf('/')) + '/' + imp.source.replace(/^\.\//, '')
          : imp.source
        return resolved
      })
      .filter((target) => graph.nodes.has(target))

    for (let i = 0; i < children.length; i++) {
      const isLast = i === children.length - 1
      const connector = isLast ? '└── ' : '├── '
      const childPrefix = prefix + (isLast ? '    ' : '│   ')
      lines.push(`${prefix}${connector}`)
      renderTree(children[i]!, childPrefix, depth + 1, new Set(visited))
    }
  }

  for (const root of displayRoots.slice(0, 20)) {
    renderTree(root, '', 0, new Set())
  }

  return lines.join('\n') || 'No dependency relationships found.'
}

// ─── JSON formatting ────────────────────────────────────

export function formatGraphJson(graph: DepGraph): string {
  const serializable = {
    edges: graph.edges,
    nodes: Array.from(graph.nodes.entries()).map(([key, node]) => ({
      depth: node.depth,
      filePath: key,
      importedBy: node.importedBy,
      imports: node.imports,
    })),
    stats: graph.stats,
  }
  return JSON.stringify(serializable, null, 2)
}
