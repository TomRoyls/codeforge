import chalk from 'chalk'

import type { NodeCondition, ClusterCondition, EmeraldNode, EmeraldCluster, EmeraldNexusResult } from './emerald-nexus-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(80, 200, 120)(String(score))
  if (score >= 75) return chalk.rgb(60, 179, 113)(String(score))
  if (score >= 60) return chalk.rgb(46, 139, 87)(String(score))
  if (score >= 40) return chalk.rgb(60, 120, 80)(String(score))
  if (score >= 20) return chalk.rgb(85, 107, 47)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('emerald-masterpiece') */
export function colorCondition(condition: NodeCondition | string): string {
  switch (condition) {
    case 'emerald-masterpiece':
      return chalk.rgb(80, 200, 120)('emerald-masterpiece')
    case 'nexus-prime':
      return chalk.rgb(60, 179, 113)('nexus-prime')
    case 'proper-crystal':
      return chalk.rgb(46, 139, 87)('proper-crystal')
    case 'cloudy-gem':
      return chalk.rgb(60, 120, 80)('cloudy-gem')
    case 'rough-stone':
      return chalk.rgb(85, 107, 47)('rough-stone')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorClusterCondition('emerald-cathedral') */
export function colorClusterCondition(condition: ClusterCondition | string): string {
  switch (condition) {
    case 'emerald-cathedral':
      return chalk.rgb(80, 200, 120)('emerald-cathedral')
    case 'crystal-palace':
      return chalk.rgb(60, 179, 113)('crystal-palace')
    case 'proper-grotto':
      return chalk.rgb(46, 139, 87)('proper-grotto')
    case 'dull-cave':
      return chalk.rgb(60, 120, 80)('dull-cave')
    case 'empty-void':
      return chalk.rgb(85, 107, 47)('empty-void')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatNodeTable(node) */
export function formatNodeTable(node: EmeraldNode): string {
  const lines: string[] = [
    chalk.bold(`Emerald Node: ${node.file}`),
    '',
    `  Gem Connectivity:    ${colorScore(node.gemConnectivity)}  ${chalk.dim(`(${node.connecting.gem})`)}`,
    `  Nexus Radiance:      ${colorScore(node.nexusRadiance)}  ${chalk.dim(`(${node.radiating.nexus})`)}`,
    `  Matrix Harmony:      ${colorScore(node.matrixHarmony)}  ${chalk.dim(`(${node.harmonizing.matrix})`)}`,
    `  Crystal Network:     ${colorScore(node.crystalNetwork)}  ${chalk.dim(`(${node.networking.lattice})`)}`,
    `  Emerald Wisdom:      ${colorScore(node.emeraldWisdom)}  ${chalk.dim(`(${node.accumulating.emerald})`)}`,
    '',
    `  Quality Score: ${colorScore(node.qualityScore)}  ${chalk.dim(`(${colorCondition(node.condition)})`)}`,
  ]
  if (node.celebration) {
    lines.push('', chalk.rgb(80, 200, 120)(node.celebration))
  }
  return lines.join('\n')
}

/** @example formatNodesTable(nodes) */
export function formatNodesTable(nodes: EmeraldNode[]): string {
  if (nodes.length === 0) return chalk.dim('No emerald nodes found')

  const colWidths = {
    file: Math.max(4, ...nodes.map((n) => n.file.length)),
    gem: Math.max(3, ...nodes.map((n) => String(n.gemConnectivity).length)),
    nexus: Math.max(3, ...nodes.map((n) => String(n.nexusRadiance).length)),
    harm: Math.max(3, ...nodes.map((n) => String(n.matrixHarmony).length)),
    net: Math.max(3, ...nodes.map((n) => String(n.crystalNetwork).length)),
    wis: Math.max(3, ...nodes.map((n) => String(n.emeraldWisdom).length)),
    score: Math.max(5, ...nodes.map((n) => String(n.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Emerald Nodes'), '']

  const header =
    chalk.rgb(80, 200, 120)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Gem', colWidths.gem)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Nex', colWidths.nexus)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Harm', colWidths.harm)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Net', colWidths.net)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(80, 200, 120)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const n of nodes) {
    lines.push(
      padRight(n.file, colWidths.file) +
        '  ' +
        padLeft(String(n.gemConnectivity), colWidths.gem) +
        '  ' +
        padLeft(String(n.nexusRadiance), colWidths.nexus) +
        '  ' +
        padLeft(String(n.matrixHarmony), colWidths.harm) +
        '  ' +
        padLeft(String(n.crystalNetwork), colWidths.net) +
        '  ' +
        padLeft(String(n.emeraldWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(n.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatClusterTable(cluster) */
export function formatClusterTable(cluster: EmeraldCluster): string {
  const lines: string[] = [
    chalk.bold(`Emerald Cluster: ${cluster.directory}`),
    '',
    `  Nodes:               ${cluster.nodes.length}`,
    `  Avg Connectivity:    ${colorScore(cluster.avgConnectivity)}`,
    `  Avg Radiance:        ${colorScore(cluster.avgRadiance)}`,
    `  Avg Wisdom:          ${colorScore(cluster.avgWisdom)}`,
    `  Masterpieces:        ${cluster.emeraldMasterpieceCount}`,
    `  Cluster Type:        ${cluster.clusterType}`,
    `  Condition:           ${colorClusterCondition(cluster.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatClustersTable(clusters) */
export function formatClustersTable(clusters: EmeraldCluster[]): string {
  if (clusters.length === 0) return chalk.dim('No emerald clusters found')

  const lines: string[] = [chalk.bold('Emerald Clusters'), '']

  for (const c of clusters) {
    lines.push(
      `  ${chalk.rgb(80, 200, 120)(c.directory)}  ${colorScore(c.avgRadiance)}  ${colorClusterCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldNexusResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Nexus Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Clusters:        ${stats.totalClusters}`,
    `  Avg Gem Connectivity:  ${colorScore(stats.avgGemConnectivity)}`,
    `  Avg Nexus Radiance:    ${colorScore(stats.avgNexusRadiance)}`,
    `  Avg Matrix Harmony:    ${colorScore(stats.avgMatrixHarmony)}`,
    `  Avg Crystal Network:   ${colorScore(stats.avgCrystalNetwork)}`,
    `  Avg Emerald Wisdom:    ${colorScore(stats.avgEmeraldWisdom)}`,
    `  Emerald Masterpieces:  ${stats.emeraldMasterpieceCount}`,
    `  Nexus Primes:          ${stats.nexusPrimeCount}`,
    `  Proper Crystals:       ${stats.properCrystalCount}`,
    `  Cloudy Gems:           ${stats.cloudyGemCount}`,
    `  Rough Stones:          ${stats.roughStoneCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Radiance:      ${colorScore(stats.overallRadiance)}`,
    `  Architect Grade:       ${stats.architectGrade}`,
    `  Best Node:             ${stats.bestNode || 'N/A'}`,
    `  Most Connected:        ${stats.mostConnected || 'N/A'}`,
    `  Most Radiant:          ${stats.mostRadiant || 'N/A'}`,
    `  Most Harmonious:       ${stats.mostHarmonious || 'N/A'}`,
    `  Best Networked:        ${stats.bestNetworked || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  if (stats.celebration) {
    lines.push('', chalk.rgb(80, 200, 120)(stats.celebration))
  }
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(80, 200, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldNexusResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Nexus Analysis'),
    '',
    formatNodesTable(result.nodes),
    '',
    formatClustersTable(result.clusters),
    '',
    chalk.bold('Network Overview'),
    '',
    `  Avg Connectivity:  ${colorScore(result.network.avgConnectivity)}`,
    `  Avg Radiance:      ${colorScore(result.network.avgRadiance)}`,
    `  Avg Wisdom:        ${colorScore(result.network.avgWisdom)}`,
    `  Overall Radiance:  ${colorScore(result.network.overallRadiance)}`,
    `  Is Emerald:        ${result.network.isEmerald ? chalk.rgb(80, 200, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldNexusResult): string {
  return JSON.stringify(result, null, 2)
}
