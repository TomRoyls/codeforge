import chalk from 'chalk'
import type { CallNode, CallEdge, CallChain, SymgraphResult, SymgraphStats } from './symgraph-helpers.js'

// ─── formatNodeRow ────────────────────────────────────────────────────────────

/**
 * Format a single node as a table row string.
 *
 * @example
 * formatNodeRow(node) // '  foo  a.ts  function  2  1  0'
 */
export function formatNodeRow(node: CallNode): string {
  const typeIcon = node.type === 'function' ? 'ƒ' : node.type === 'method' ? 'M' : node.type === 'arrow' ? '→' : 'C'
  const asyncBadge = node.isAsync ? ' async' : ''
  const exportBadge = node.isExported ? ' exported' : ''
  return `  ${node.name.padEnd(20)} ${node.file.padEnd(15)} ${typeIcon}${asyncBadge}${exportBadge}  calls:${node.calls.length}  calledBy:${node.calledBy.length}  depth:${node.depth}`
}

// ─── formatNodeTable ──────────────────────────────────────────────────────────

/**
 * Format all nodes as a table with header.
 *
 * @example
 * formatNodeTable(nodes) // 'Name  File  Type  ...'
 */
export function formatNodeTable(nodes: CallNode[]): string {
  if (nodes.length === 0) return '  (none)'

  const header = chalk.bold('  Function             File            Type                Calls  CalledBy  Depth')
  const separator = chalk.gray('  ' + '─'.repeat(85))
  const rows = nodes.map((n) => formatNodeRow(n))
  return [header, separator, ...rows].join('\n')
}

// ─── formatEdgeRow ────────────────────────────────────────────────────────────

/**
 * Format a single edge as a readable string.
 *
 * @example
 * formatEdgeRow(edge) // 'foo → bar (direct)'
 */
export function formatEdgeRow(edge: CallEdge): string {
  const fromName = edge.from.split(':').pop() ?? edge.from
  const toName = edge.to.split(':').pop() ?? edge.to
  const typeColor = edge.type === 'direct' ? chalk.green : edge.type === 'indirect' ? chalk.yellow : chalk.gray
  return `  ${fromName} ${chalk.gray('→')} ${toName} ${typeColor(`(${edge.type})`)}`
}

// ─── formatEdgeList ───────────────────────────────────────────────────────────

/**
 * Format all edges as a list.
 *
 * @example
 * formatEdgeList(edges) // 'foo → bar (direct)\n ...'
 */
export function formatEdgeList(edges: CallEdge[]): string {
  if (edges.length === 0) return '  (no edges)'
  return edges.map((e) => formatEdgeRow(e)).join('\n')
}

// ─── formatCallTree ───────────────────────────────────────────────────────────

/**
 * Format call tree from entry points with indentation.
 *
 * @example
 * formatCallTree(graph, entryPoints, 3) // 'main\n  ├── foo\n  │   └── bar'
 */
export function formatCallTree(
  nodes: Map<string, CallNode>,
  entryPoints: CallNode[],
  maxDepth: number,
): string {
  if (entryPoints.length === 0) return '  (no entry points)'

  const lines: string[] = []
  const visited = new Set<string>()

  function render(key: string, prefix: string, depth: number) {
    if (depth > maxDepth) return
    const node = nodes.get(key)
    if (!node) return

    const name = node.name
    const badge = node.isAsync ? chalk.cyan(' [async]') : node.isExported ? chalk.green(' [exported]') : ''
    lines.push(`${prefix}${name}${badge}`)

    if (visited.has(key)) {
      lines.push(`${prefix}  ${chalk.gray('└── (cycle)')}`)
      return
    }
    visited.add(key)

    const children = node.calls
    children.forEach((childKey, idx) => {
      const isLast = idx === children.length - 1
      const connector = isLast ? '└── ' : '├── '
      const childPrefix = prefix + (isLast ? '    ' : '│   ')
      const childName = childKey.split(':').pop() ?? childKey
      const childNode = nodes.get(childKey)

      if (childNode) {
        const childBadge = childNode.isAsync ? chalk.cyan(' [async]') : ''
        lines.push(`${prefix}${connector}${childName}${childBadge}`)
        if (depth + 1 <= maxDepth && !visited.has(childKey)) {
          render(childKey, childPrefix, depth + 1)
        }
      } else {
        lines.push(`${prefix}${connector}${chalk.gray(childName)} (external)`)
      }
    })

    visited.delete(key)
  }

  for (const ep of entryPoints) {
    render(`${ep.file}:${ep.name}`, '', 0)
  }

  return lines.join('\n')
}

// ─── formatChain ──────────────────────────────────────────────────────────────

/**
 * Format a call chain as arrow-separated string.
 *
 * @example
 * formatChain(chain) // 'main → foo → bar (depth: 2)'
 */
export function formatChain(chain: CallChain): string {
  const names = chain.path.map((p) => p.split(':').pop() ?? p)
  return `  ${names.join(` ${chalk.gray('→')} `)} ${chalk.gray(`(depth: ${chain.depth})`)}`
}

// ─── formatChains ─────────────────────────────────────────────────────────────

/**
 * Format top call chains.
 *
 * @example
 * formatChains(chains) // formatted chain strings
 */
export function formatChains(chains: CallChain[]): string {
  if (chains.length === 0) return '  (no chains found)'
  return chains.map((c) => formatChain(c)).join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format statistics summary.
 *
 * @example
 * formatStats(stats) // 'Functions: 10  Edges: 15  ...'
 */
export function formatStats(stats: SymgraphStats): string {
  const lines = [
    `${chalk.bold('Functions:')}     ${stats.totalFunctions}`,
    `${chalk.bold('Edges:')}         ${stats.totalEdges}`,
    `${chalk.bold('Avg Calls/Fn:')}  ${stats.averageCallsPerFunction}`,
    `${chalk.bold('Max Depth:')}     ${stats.maxDepth}`,
    `${chalk.bold('Entry Points:')}  ${stats.entryPointCount}`,
    `${chalk.bold('Central Nodes:')} ${stats.centralCount}`,
    `${chalk.bold('Leaf Nodes:')}    ${stats.leafCount}`,
    `${chalk.bold('Orphans:')}       ${stats.orphanCount}`,
    `${chalk.bold('Density:')}       ${(stats.graphDensity * 100).toFixed(2)}%`,
  ]
  return lines.join('\n')
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations as bullet list.
 *
 * @example
 * formatRecommendations(['X is dead code']) // '  • X is dead code'
 */
export function formatRecommendations(recs: string[]): string {
  return recs.map((r) => `  ${chalk.yellow('•')} ${r}`).join('\n')
}

// ─── formatSymgraphOutput ─────────────────────────────────────────────────────

/**
 * Format full symgraph result for terminal output.
 *
 * @example
 * formatSymgraphOutput(result, 3) // full formatted output string
 */
export function formatSymgraphOutput(result: SymgraphResult, maxDepth: number): string {
  const sections: string[] = []

  sections.push(chalk.bold.cyan('\n📊 Call Graph Statistics'))
  sections.push(formatStats(result.stats))

  sections.push(chalk.bold.cyan('\n🌳 Call Tree'))
  sections.push(formatCallTree(result.graph.nodes, result.entryPoints, maxDepth))

  if (result.centralNodes.length > 0) {
    sections.push(chalk.bold.cyan('\n⭐ Central Nodes (called by 3+)'))
    sections.push(formatNodeTable(result.centralNodes))
  }

  if (result.orphans.length > 0) {
    sections.push(chalk.bold.cyan('\n👻 Orphan Functions'))
    sections.push(formatNodeTable(result.orphans))
  }

  if (result.longestChains.length > 0) {
    sections.push(chalk.bold.cyan('\n🔗 Longest Call Chains'))
    sections.push(formatChains(result.longestChains))
  }

  sections.push(chalk.bold.cyan('\n💡 Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatSymgraphJson ───────────────────────────────────────────────────────

/**
 * Format symgraph result as JSON string.
 *
 * @example
 * formatSymgraphJson(result) // '{"stats":{...}, ...}'
 */
export function formatSymgraphJson(result: SymgraphResult): string {
  const serializable = {
    stats: result.stats,
    entryPoints: result.entryPoints.map((n) => ({ name: n.name, file: n.file, line: n.line, type: n.type })),
    centralNodes: result.centralNodes.map((n) => ({ name: n.name, file: n.file, calledBy: n.calledBy.length })),
    leafNodes: result.leafNodes.length,
    orphans: result.orphans.map((n) => ({ name: n.name, file: n.file })),
    longestChains: result.longestChains.map((c) => ({ path: c.path, depth: c.depth })),
    recommendations: result.recommendations,
    edges: result.graph.edges.map((e) => ({ from: e.from, to: e.to, type: e.type })),
  }
  return JSON.stringify(serializable, null, 2)
}
