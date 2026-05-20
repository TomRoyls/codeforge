import chalk from 'chalk'

import type {
  ClusterHealth,
  HyphaeConnection,
  HyphaeNode,
  MyceliumCluster,
  MyceliumResult,
  MyceliumStats,
  NetworkHealth,
  NodeType,
  NutrientFlow,
} from './mycelium-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const NODE_TYPE_COLOR: Record<NodeType, (s: string) => string> = {
  hub: chalk.rgb(255, 165, 0),
  connector: chalk.rgb(100, 149, 237),
  leaf: chalk.rgb(72, 199, 142),
  root: chalk.rgb(148, 103, 189),
  'dead-wood': chalk.rgb(150, 150, 170),
}

const HEALTH_COLOR: Record<string, (s: string) => string> = {
  flourishing: chalk.rgb(72, 199, 142),
  healthy: chalk.rgb(100, 200, 180),
  stable: chalk.rgb(200, 200, 80),
  fragile: chalk.rgb(220, 150, 80),
  collapsing: chalk.rgb(220, 80, 80),
  thriving: chalk.rgb(72, 199, 142),
  stressed: chalk.rgb(220, 180, 80),
  dying: chalk.rgb(220, 100, 80),
  dead: chalk.rgb(180, 60, 60),
}

/**
 * Format node type label with color.
 *
 * @example
 * formatNodeTypeLabel('hub') // => colored string
 */
export function formatNodeTypeLabel(type: NodeType): string {
  const color = NODE_TYPE_COLOR[type] ?? ((s: string) => s)
  return color(type)
}

/**
 * Format health label with color.
 *
 * @example
 * formatHealthLabel('flourishing') // => colored string
 */
export function formatHealthLabel(health: string): string {
  const color = HEALTH_COLOR[health] ?? ((s: string) => s)
  return color(health)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a network gauge.
 *
 * @example
 * formatNetworkGauge(75) // => '███████████████░░░░░ 75%'
 */
export function formatNetworkGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Nodes ─────────────────────────────────────────────────────────────────────

/**
 * Format node inventory.
 *
 * @example
 * formatNodes(nodes) // => node list
 */
export function formatNodes(nodes: HyphaeNode[]): string {
  const header = chalk.bold('Network Nodes')
  const separator = '\u2500'.repeat(80)

  if (nodes.length === 0) {
    return `${header}\n${separator}\nNo files in network.`
  }

  const lines = [header, separator]
  for (const n of nodes) {
    const typeLabel = formatNodeTypeLabel(n.type)
    const hubTag = n.isHub ? chalk.rgb(255, 165, 0)(' HUB') : ''
    const deadTag = n.isDeadWood ? chalk.rgb(150, 150, 170)(' DEAD') : ''
    lines.push(`${chalk.cyan(n.file.padEnd(35))} ${typeLabel.padEnd(12)} conn:${n.connections.length}  dep:${n.dependencyScore}  nut:${n.nutrientLevel}  res:${n.resilience}${hubTag}${deadTag}`)
  }

  return lines.join('\n')
}

// ─── Connections ───────────────────────────────────────────────────────────────

/**
 * Format connections map.
 *
 * @example
 * formatConnections(connections) // => connection list
 */
export function formatConnections(connections: HyphaeConnection[]): string {
  const header = chalk.bold('Hyphae Connections')
  const separator = '\u2500'.repeat(70)

  if (connections.length === 0) {
    return `${header}\n${separator}\nNo connections detected.`
  }

  const lines = [header, separator]
  for (const c of connections) {
    const arrow = c.bidirectional ? '\u2194' : '\u2192'
    lines.push(`${c.from.padEnd(25)} ${arrow} ${c.to.padEnd(25)} str:${c.strength}  ${c.nutrients.length > 0 ? c.nutrients.join(', ') : ''}`)
  }

  return lines.join('\n')
}

// ─── Clusters ──────────────────────────────────────────────────────────────────

/**
 * Format clusters.
 *
 * @example
 * formatClusters(clusters) // => cluster table
 */
export function formatClusters(clusters: MyceliumCluster[]): string {
  const header = chalk.bold('Mycelium Clusters')
  const separator = '\u2500'.repeat(65)

  if (clusters.length === 0) {
    return `${header}\n${separator}\nNo clusters detected.`
  }

  const lines = [header, separator]
  for (const cl of clusters) {
    const health = formatHealthLabel(cl.health)
    lines.push(`${chalk.cyan(cl.name.padEnd(15))} nodes:${cl.nodes.length}  density:${cl.density}%  ${health}`)
    lines.push(`  center: ${cl.center}  ${cl.description}`)
  }

  return lines.join('\n')
}

// ─── Flows ─────────────────────────────────────────────────────────────────────

/**
 * Format nutrient flows.
 *
 * @example
 * formatFlows(flows) // => flow diagram
 */
export function formatFlows(flows: NutrientFlow[]): string {
  const header = chalk.bold('Nutrient Flows')
  const separator = '\u2500'.repeat(60)

  if (flows.length === 0) {
    return `${header}\n${separator}\nNo nutrient flows detected.`
  }

  const lines = [header, separator]
  for (const f of flows) {
    const dist = f.isWellDistributed ? chalk.rgb(72, 199, 142)('distributed') : chalk.rgb(200, 200, 80)('concentrated')
    lines.push(`${chalk.cyan(f.symbol.padEnd(20))} ${f.flowType.padEnd(10)} ${f.origin} \u2192 ${f.destinations.length} dest  ${dist}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format mycelium stats summary.
 *
 * @example
 * formatMyceliumStats(stats) // => stats summary
 */
export function formatMyceliumStats(stats: MyceliumStats): string {
  const header = chalk.bold('Mycelium Network Analysis')
  const separator = '\u2500'.repeat(55)

  const lines = [
    header,
    separator,
    `Nodes:          ${stats.totalNodes} (hub:${stats.hubCount} leaf:${stats.leafCount} dead:${stats.deadWoodCount})`,
    `Connections:    ${stats.totalConnections} (redundant:${stats.redundantConnections})`,
    `Avg Conn:       ${stats.avgConnections}   Max: ${stats.maxConnections}`,
    `Clusters:       ${stats.clusterCount} (thriving:${stats.thrivingClusters} dying:${stats.dyingClusters})`,
    `Flows:          ${stats.totalFlows} (avg volume:${stats.avgFlowVolume})`,
    `Critical Nodes: ${stats.criticalNodes}`,
    separator,
    `Density:        ${formatNetworkGauge(stats.networkDensity, 15)}`,
    `Resilience:     ${formatNetworkGauge(stats.networkResilience, 15)}`,
    `Monoculture:    ${formatNetworkGauge(stats.monocultureRisk, 15)}`,
    separator,
    `Health:         ${formatHealthLabel(stats.networkHealth)}`,
  ]

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Healthy network!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full mycelium table output.
 *
 * @example
 * formatMyceliumTable(result) // => full table string
 */
export function formatMyceliumTable(result: MyceliumResult): string {
  return [
    formatMyceliumStats(result.stats),
    '',
    formatNodes(result.nodes),
    '',
    formatConnections(result.connections),
    '',
    formatClusters(result.clusters),
    '',
    formatFlows(result.flows),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format mycelium result as JSON.
 *
 * @example
 * formatMyceliumJson(result) // => JSON string
 */
export function formatMyceliumJson(result: MyceliumResult): string {
  return JSON.stringify(result, null, 2)
}
