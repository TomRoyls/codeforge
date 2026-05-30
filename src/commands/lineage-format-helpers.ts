import chalk from 'chalk'
import type { LineageNode, LineagePath, LineageCluster, LineageResult, LineageStats } from './lineage-helpers.js'

// ─── Badge Helpers ────────────────────────────────────────────────────────────

export function criticalityBadge(criticality: number): string {
  if (criticality >= 80) return chalk.rgb(255, 50, 50).bold(`[${criticality}] CRITICAL`)
  if (criticality >= 50) return chalk.rgb(255, 165, 0)(`[${criticality}] HIGH`)
  if (criticality >= 20) return chalk.rgb(255, 215, 0)(`[${criticality}] MEDIUM`)
  return chalk.rgb(100, 200, 100)(`[${criticality}] LOW`)
}

export function typeBadge(type: string): string {
  const colors: Record<string, (s: string) => string> = {
    function: chalk.rgb(100, 200, 255),
    class: chalk.rgb(180, 130, 255),
    interface: chalk.rgb(130, 255, 180),
    type: chalk.rgb(255, 200, 130),
    constant: chalk.rgb(200, 200, 200),
  }
  return (colors[type] ?? chalk.white)(type)
}

export function depthMeter(depth: number, maxDepth: number): string {
  if (maxDepth === 0) return chalk.green('▏0')
  const ratio = depth / maxDepth
  const filled = Math.round(ratio * 10)
  const empty = 10 - filled
  const bar = chalk.rgb(100, 200, 100)('█'.repeat(filled)) + chalk.rgb(80, 80, 80)('░'.repeat(empty))
  return `${bar} ${depth}`
}

export function breadthMeter(breadth: number, maxBreadth: number): string {
  if (maxBreadth === 0) return chalk.green('▏0')
  const ratio = maxBreadth > 0 ? breadth / maxBreadth : 0
  const filled = Math.round(ratio * 10)
  const empty = 10 - filled
  const bar = chalk.rgb(100, 180, 255)('█'.repeat(filled)) + chalk.rgb(80, 80, 80)('░'.repeat(empty))
  return `${bar} ${breadth}`
}

// ─── Node Formatting ──────────────────────────────────────────────────────────

export function formatNodeRow(node: LineageNode, maxDepth: number, maxBreadth: number): string {
  const name = chalk.bold(node.name)
  const file = chalk.rgb(150, 150, 150)(node.file)
  const type = typeBadge(node.type)
  const crit = criticalityBadge(node.criticality)
  const d = depthMeter(node.depth, maxDepth)
  const b = breadthMeter(node.breadth, maxBreadth)
  return `${name} ${file} ${type} ${crit} depth:${d} breadth:${b}`
}

export function formatNodeTable(nodes: LineageNode[], verbose: boolean): string {
  const maxD = nodes.reduce((m, n) => Math.max(m, n.depth), 0)
  const maxB = nodes.reduce((m, n) => Math.max(m, n.breadth), 0)

  const header = [
    chalk.bold('Name'),
    chalk.bold('File'),
    chalk.bold('Type'),
    chalk.bold('Criticality'),
    chalk.bold('Depth'),
    chalk.bold('Breadth'),
  ].join('  ')

  const rows = nodes.map((n) => {
    const parts = [
      chalk.bold(n.name),
      chalk.rgb(150, 150, 150)(n.file),
      typeBadge(n.type),
      criticalityBadge(n.criticality),
      depthMeter(n.depth, maxD),
      breadthMeter(n.breadth, maxB),
    ]
    if (verbose) {
      parts.push(chalk.rgb(120, 120, 120)(`anc:[${n.ancestors.join(',')}]`))
      parts.push(chalk.rgb(120, 120, 120)(`desc:[${n.descendants.join(',')}]`))
    }
    return parts.join('  ')
  })

  return [header, ...rows].join('\n')
}

// ─── Path Formatting ──────────────────────────────────────────────────────────

export function formatPathChain(chain: string[]): string {
  return chain
    .map((c) => {
      const parts = c.split(':')
      const name = parts.at(-1) ?? ''
      return chalk.rgb(200, 200, 255)(name)
    })
    .join(` ${chalk.rgb(100, 100, 100)('→')} `)
}

export function formatPath(path: LineagePath): string {
  const crit = path.isCritical ? chalk.rgb(255, 50, 50)(' ⚠ CRITICAL') : ''
  const chain = formatPathChain(path.chain)
  const len = chalk.rgb(150, 150, 150)(`(len: ${path.length})`)
  return `${chain} ${len}${crit}`
}

export function formatPathTable(paths: LineagePath[]): string {
  const header = [
    chalk.bold('Chain'),
    chalk.bold('Length'),
    chalk.bold('Files'),
    chalk.bold('Critical'),
  ].join('  ')

  const rows = paths.map((p) => {
    const chain = formatPathChain(p.chain)
    const len = String(p.length)
    const files = chalk.rgb(150, 150, 150)(`${p.files.length} file(s)`)
    const crit = p.isCritical ? chalk.rgb(255, 50, 50)('YES') : chalk.rgb(100, 200, 100)('no')
    return `${chain}  ${len}  ${files}  ${crit}`
  })

  return [header, ...rows].join('\n')
}

// ─── Cluster Formatting ───────────────────────────────────────────────────────

export function formatCluster(cluster: LineageCluster): string {
  const root = chalk.bold(cluster.root)
  const desc = chalk.rgb(180, 180, 255)(cluster.descendants.join(', '))
  const info = chalk.rgb(150, 150, 150)(`depth:${cluster.depth} breadth:${cluster.breadth}`)
  return `${root} → { ${desc} } ${info}`
}

export function formatClusterTable(clusters: LineageCluster[]): string {
  const header = [
    chalk.bold('Root'),
    chalk.bold('Descendants'),
    chalk.bold('Depth'),
    chalk.bold('Breadth'),
  ].join('  ')

  const rows = clusters.map((c) => {
    const root = chalk.bold(c.root)
    const desc = chalk.rgb(180, 180, 255)(c.descendants.join(', '))
    const depth = String(c.depth)
    const breadth = String(c.breadth)
    return `${root}  ${desc}  ${depth}  ${breadth}`
  })

  return [header, ...rows].join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

export function formatStats(stats: LineageStats): string {
  const lines = [
    chalk.bold('Lineage Statistics'),
    `  Nodes:           ${stats.totalNodes}`,
    `  Paths:           ${stats.totalPaths}`,
    `  Max Depth:       ${stats.maxDepth}`,
    `  Max Breadth:     ${stats.maxBreadth}`,
    `  Average Depth:   ${stats.averageDepth}`,
    `  Critical Nodes:  ${chalk.rgb(255, 165, 0)(String(stats.criticalNodes))}`,
    `  Fragile Nodes:   ${chalk.rgb(255, 100, 100)(String(stats.fragileNodes))}`,
    `  Orphan Nodes:    ${chalk.rgb(150, 150, 150)(String(stats.orphanNodes))}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ───────────────────────────────────────────────

export function formatRecommendations(recommendations: string[]): string {
  const lines = [chalk.bold('Recommendations')]
  recommendations.forEach((r, i) => {
    lines.push(`  ${i + 1}. ${chalk.rgb(255, 220, 150)(r)}`)
  })
  return lines.join('\n')
}

// ─── Fragile Nodes Formatting ─────────────────────────────────────────────────

export function formatFragileNodes(nodes: LineageNode[]): string {
  if (nodes.length === 0) return chalk.rgb(100, 200, 100)('No fragile nodes detected')
  const lines = [chalk.bold.rgb(255, 100, 100)('Fragile Nodes')]
  nodes.forEach((n) => {
    lines.push(`  ${chalk.bold(n.name)} ${chalk.rgb(150, 150, 150)(n.file)} — ${n.descendants.length} dependents, no ancestors`)
  })
  return lines.join('\n')
}

// ─── Full Report ──────────────────────────────────────────────────────────────

export function formatLineageReport(result: LineageResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatStats(result.stats))
  sections.push('')

  if (result.nodes.length > 0) {
    const sorted = [...result.nodes].sort((a, b) => b.criticality - a.criticality)
    sections.push(chalk.bold('Nodes by Criticality'))
    sections.push(formatNodeTable(sorted, verbose))
    sections.push('')
  }

  if (result.criticalPaths.length > 0) {
    sections.push(chalk.bold.rgb(255, 50, 50)('Critical Paths'))
    sections.push(formatPathTable(result.criticalPaths))
    sections.push('')
  }

  if (result.clusters.length > 0) {
    sections.push(chalk.bold('Lineage Clusters'))
    sections.push(formatClusterTable(result.clusters))
    sections.push('')
  }

  sections.push(formatFragileNodes(result.fragileNodes))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

export function formatLineageJson(result: LineageResult): string {
  return JSON.stringify(result, null, 2)
}
