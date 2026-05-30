import chalk from 'chalk'

import type { IngotCondition, ClusterCondition, StarIngot, StarCluster, StarlightForgeStats, StarlightForgeResult } from './starlight-foundry-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 215, 0)(String(score))
  if (score >= 75) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 60) return chalk.rgb(255, 165, 0)(String(score))
  if (score >= 40) return chalk.rgb(184, 134, 11)(String(score))
  if (score >= 20) return chalk.rgb(139, 119, 42)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('stellar-masterpiece') */
export function colorCondition(condition: IngotCondition | string): string {
  switch (condition) {
    case 'stellar-masterpiece':
      return chalk.rgb(255, 215, 0)('stellar-masterpiece')
    case 'star-forged':
      return chalk.rgb(255, 191, 0)('star-forged')
    case 'proper-alloy':
      return chalk.rgb(255, 165, 0)('proper-alloy')
    case 'meteor-scrap':
      return chalk.rgb(184, 134, 11)('meteor-scrap')
    case 'space-dust':
      return chalk.rgb(139, 119, 42)('space-dust')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorClusterCondition('galactic-core') */
export function colorClusterCondition(condition: ClusterCondition | string): string {
  switch (condition) {
    case 'galactic-core':
      return chalk.rgb(255, 215, 0)('galactic-core')
    case 'star-nursery':
      return chalk.rgb(255, 191, 0)('star-nursery')
    case 'proper-cluster':
      return chalk.rgb(255, 165, 0)('proper-cluster')
    case 'sparse-field':
      return chalk.rgb(184, 134, 11)('sparse-field')
    case 'empty-void':
      return chalk.rgb(139, 119, 42)('empty-void')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatIngotTable(ingot) */
export function formatIngotTable(ingot: StarIngot): string {
  const lines: string[] = [
    chalk.bold(`Star Ingot: ${ingot.file}`),
    '',
    `  Celestial Forging:     ${colorScore(ingot.celestialForging)}  ${chalk.dim(`(${ingot.forging.starlight})`)}`,
    `  Star Hardness:         ${colorScore(ingot.starHardness)}  ${chalk.dim(`(${ingot.hardening.core})`)}`,
    `  Constellation Pattern: ${colorScore(ingot.constellationPattern)}  ${chalk.dim(`(${ingot.patterning.constellation})`)}`,
    `  Nebula Clarity:        ${colorScore(ingot.nebulaClarity)}  ${chalk.dim(`(${ingot.revealing.nebula})`)}`,
    `  Cosmic Wisdom:         ${colorScore(ingot.cosmicWisdom)}  ${chalk.dim(`(${ingot.accumulating.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(ingot.qualityScore)}  ${chalk.dim(`(${colorCondition(ingot.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatIngotsTable(ingots) */
export function formatIngotsTable(ingots: StarIngot[]): string {
  if (ingots.length === 0) return chalk.dim('No star ingots found')

  const colWidths = {
    file: Math.max(4, ...ingots.map((i) => i.file.length)),
    cfg: Math.max(3, ...ingots.map((i) => String(i.celestialForging).length)),
    hrd: Math.max(3, ...ingots.map((i) => String(i.starHardness).length)),
    pat: Math.max(3, ...ingots.map((i) => String(i.constellationPattern).length)),
    clr: Math.max(3, ...ingots.map((i) => String(i.nebulaClarity).length)),
    wis: Math.max(3, ...ingots.map((i) => String(i.cosmicWisdom).length)),
    score: Math.max(5, ...ingots.map((i) => String(i.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Star Ingots'), '']

  const header =
    chalk.rgb(255, 215, 0)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Cfg', colWidths.cfg)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Hrd', colWidths.hrd)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Pat', colWidths.pat)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Clr', colWidths.clr)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(255, 215, 0)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const i of ingots) {
    lines.push(
      padRight(i.file, colWidths.file) +
        '  ' +
        padLeft(String(i.celestialForging), colWidths.cfg) +
        '  ' +
        padLeft(String(i.starHardness), colWidths.hrd) +
        '  ' +
        padLeft(String(i.constellationPattern), colWidths.pat) +
        '  ' +
        padLeft(String(i.nebulaClarity), colWidths.clr) +
        '  ' +
        padLeft(String(i.cosmicWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(i.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatClusterTable(cluster) */
export function formatClusterTable(cluster: StarCluster): string {
  const lines: string[] = [
    chalk.bold(`Star Cluster: ${cluster.directory}`),
    '',
    `  Ingots:                ${cluster.ingots.length}`,
    `  Avg Forging:           ${colorScore(cluster.avgForging)}`,
    `  Avg Pattern:           ${colorScore(cluster.avgPattern)}`,
    `  Avg Wisdom:            ${colorScore(cluster.avgWisdom)}`,
    `  Stellar Masterpieces:  ${cluster.stellarMasterpieceCount}`,
    `  Cluster Type:          ${cluster.clusterType}`,
    `  Condition:             ${colorClusterCondition(cluster.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatClustersTable(clusters) */
export function formatClustersTable(clusters: StarCluster[]): string {
  if (clusters.length === 0) return chalk.dim('No star clusters found')

  const lines: string[] = [chalk.bold('Star Clusters'), '']

  for (const c of clusters) {
    lines.push(
      `  ${chalk.rgb(255, 215, 0)(c.directory)}  ${colorScore(c.avgForging)}  ${colorClusterCondition(c.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: StarlightForgeStats): string {
  const lines: string[] = [
    chalk.bold('Starlight Forge Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Clusters:            ${stats.totalClusters}`,
    `  Avg Celestial Forging:     ${colorScore(stats.avgCelestialForging)}`,
    `  Avg Star Hardness:         ${colorScore(stats.avgStarHardness)}`,
    `  Avg Constellation Pattern: ${colorScore(stats.avgConstellationPattern)}`,
    `  Avg Nebula Clarity:        ${colorScore(stats.avgNebulaClarity)}`,
    `  Avg Cosmic Wisdom:         ${colorScore(stats.avgCosmicWisdom)}`,
    `  Stellar Masterpieces:      ${stats.stellarMasterpieceCount}`,
    `  Star Forged:               ${stats.starForgedCount}`,
    `  Proper Alloys:             ${stats.properAlloyCount}`,
    `  Meteor Scraps:             ${stats.meteorScrapCount}`,
    `  Space Dust:                ${stats.spaceDustCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Brilliance:        ${colorScore(stats.overallBrilliance)}`,
    `  Smith Grade:               ${stats.smithGrade}`,
    `  Best Ingot:                ${stats.bestIngot || 'N/A'}`,
    `  Most Masterful:            ${stats.mostMasterful || 'N/A'}`,
    `  Hardest:                   ${stats.hardest || 'N/A'}`,
    `  Most Connected:            ${stats.mostConnected || 'N/A'}`,
    `  Clearest:                  ${stats.clearest || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: StarlightForgeResult): string {
  const lines: string[] = [
    chalk.bold('Starlight Forge Analysis'),
    '',
    formatIngotsTable(result.ingots),
    '',
    formatClustersTable(result.clusters),
    '',
    chalk.bold('Cosmos Overview'),
    '',
    `  Avg Forging:     ${colorScore(result.cosmos.avgForging)}`,
    `  Avg Pattern:     ${colorScore(result.cosmos.avgPattern)}`,
    `  Avg Wisdom:      ${colorScore(result.cosmos.avgWisdom)}`,
    `  Overall Brilliance: ${colorScore(result.cosmos.overallBrilliance)}`,
    `  Is Stellar:      ${result.cosmos.isStellar ? chalk.rgb(255, 215, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: StarlightForgeResult): string {
  return JSON.stringify(result, null, 2)
}
