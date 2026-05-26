import chalk from 'chalk'

import type { ClusterCondition, ClusterType, GemologistGrade, TourmalineCondition, TourmalineShard, TourmalineSpectrumResult } from './tourmaline-spectrum-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 50, 140)(String(score))
  if (score >= 75) return chalk.rgb(150, 40, 120)(String(score))
  if (score >= 60) return chalk.rgb(120, 35, 100)(String(score))
  if (score >= 40) return chalk.rgb(85, 25, 70)(String(score))
  if (score >= 20) return chalk.rgb(50, 15, 45)(String(score))
  return chalk.gray(String(score))
}

/** @example colorTourmalineCondition('tourmaline-masterpiece') */
export function colorTourmalineCondition(condition: TourmalineCondition | string): string {
  switch (condition) {
    case 'tourmaline-masterpiece': return chalk.rgb(180, 50, 140)('tourmaline-masterpiece')
    case 'paraiba-gem': return chalk.rgb(150, 40, 120)('paraiba-gem')
    case 'proper-tourmaline': return chalk.rgb(120, 35, 100)('proper-tourmaline')
    case 'common-stone': return chalk.rgb(85, 25, 70)('common-stone')
    case 'rough-crystal': return chalk.rgb(50, 15, 45)('rough-crystal')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorClusterType('rainbow-cluster') */
export function colorClusterType(type: ClusterType | string): string {
  switch (type) {
    case 'rainbow-cluster': return chalk.rgb(180, 50, 140)('rainbow-cluster')
    case 'colorful-deposit': return chalk.rgb(150, 40, 120)('colorful-deposit')
    case 'proper-pocket': return chalk.rgb(120, 35, 100)('proper-pocket')
    case 'single-crystal': return chalk.rgb(85, 25, 70)('single-crystal')
    case 'empty-cavity': return chalk.rgb(50, 15, 45)('empty-cavity')
    case 'no-cluster': return chalk.gray('no-cluster')
    default: return chalk.gray(String(type))
  }
}

/** @example colorClusterCondition('tourmaline-palace') */
export function colorClusterCondition(condition: ClusterCondition | string): string {
  switch (condition) {
    case 'tourmaline-palace': return chalk.rgb(180, 50, 140)('tourmaline-palace')
    case 'gem-cave': return chalk.rgb(150, 40, 120)('gem-cave')
    case 'proper-display': return chalk.rgb(120, 35, 100)('proper-display')
    case 'stone-shelf': return chalk.rgb(85, 25, 70)('stone-shelf')
    case 'empty-case': return chalk.rgb(50, 15, 45)('empty-case')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGemologistGrade('spectrum-master') */
export function colorGemologistGrade(grade: GemologistGrade | string): string {
  switch (grade) {
    case 'spectrum-master': return chalk.rgb(180, 50, 140)('spectrum-master')
    case 'color-expert': return chalk.rgb(150, 40, 120)('color-expert')
    case 'proper-gemologist': return chalk.rgb(120, 35, 100)('proper-gemologist')
    case 'apprentice': return chalk.rgb(85, 25, 70)('apprentice')
    case 'novice': return chalk.rgb(50, 15, 45)('novice')
    case 'color-blind': return chalk.gray('color-blind')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatShardTable(shard) */
export function formatShardTable(shard: TourmalineShard): string {
  const lines: string[] = [
    chalk.bold(`Tourmaline Shard: ${shard.file}`),
    '',
    `  Rainbow Diversity:        ${colorScore(shard.rainbowDiversity)}  ${chalk.dim(`(${shard.diversifying.spectrum})`)}`,
    `  Crystal Clarity:          ${colorScore(shard.crystalClarity)}  ${chalk.dim(`(${shard.clarifying.gem})`)}`,
    `  Prism Precision:          ${colorScore(shard.prismPrecision)}  ${chalk.dim(`(${shard.refracting.cut})`)}`,
    `  Piezoelectric Resilience: ${colorScore(shard.piezoelectricResilience)}  ${chalk.dim(`(${shard.charging.charge})`)}`,
    `  Mineral Wisdom:           ${colorScore(shard.mineralWisdom)}  ${chalk.dim(`(${shard.understanding.insight})`)}`,
    '',
    `  Quality Score: ${colorScore(shard.qualityScore)}  ${chalk.dim(`(${shard.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatShardsTable(shards) */
export function formatShardsTable(shards: TourmalineShard[]): string {
  if (shards.length === 0) return chalk.dim('No tourmaline shards found')
  const lines: string[] = [chalk.bold('Tourmaline Shards'), '']
  for (const sh of shards) {
    lines.push(`  ${chalk.rgb(180, 50, 140)(sh.file)}  Div:${colorScore(sh.rainbowDiversity)}  Prec:${colorScore(sh.prismPrecision)}  Score:${colorScore(sh.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatClusterTable(cluster) */
export function formatClusterTable(cluster: TourmalineSpectrumResult['clusters'][number]): string {
  const lines: string[] = [
    chalk.bold(`Tourmaline Cluster: ${cluster.directory}`),
    '',
    `  Shards:               ${cluster.shards.length}`,
    `  Avg Diversity:        ${colorScore(cluster.avgDiversity)}`,
    `  Avg Precision:        ${colorScore(cluster.avgPrecision)}`,
    `  Avg Wisdom:           ${colorScore(cluster.avgWisdom)}`,
    `  Masterpieces:         ${cluster.tourmalineMasterpieceCount}`,
    `  Cluster Type:         ${colorClusterType(cluster.clusterType)}`,
    `  Condition:            ${colorClusterCondition(cluster.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatClustersTable(clusters) */
export function formatClustersTable(clusters: TourmalineSpectrumResult['clusters']): string {
  if (clusters.length === 0) return chalk.dim('No tourmaline clusters found')
  const lines: string[] = [chalk.bold('Tourmaline Clusters'), '']
  for (const c of clusters) {
    lines.push(`  ${chalk.rgb(180, 50, 140)(c.directory)}  ${colorScore(c.avgDiversity)}  ${colorClusterCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: TourmalineSpectrumResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Tourmaline Spectrum Statistics'),
    '',
    `  Total Files:                ${stats.totalFiles}`,
    `  Total Clusters:             ${stats.totalClusters}`,
    `  Avg Rainbow Diversity:      ${colorScore(stats.avgRainbowDiversity)}`,
    `  Avg Crystal Clarity:        ${colorScore(stats.avgCrystalClarity)}`,
    `  Avg Prism Precision:        ${colorScore(stats.avgPrismPrecision)}`,
    `  Avg Piezoelectric Resil.:   ${colorScore(stats.avgPiezoelectricResilience)}`,
    `  Avg Mineral Wisdom:         ${colorScore(stats.avgMineralWisdom)}`,
    `  Tourmaline Masterpieces:    ${stats.tourmalineMasterpieceCount}`,
    `  Paraiba Gems:               ${stats.paraibaGemCount}`,
    `  Proper Tourmaline:          ${stats.properTourmalineCount}`,
    `  Common Stones:              ${stats.commonStoneCount}`,
    `  Rough Crystals:             ${stats.roughCrystalCount}`,
    `  Void:                       ${stats.voidCount}`,
    `  High Diversity Count:       ${stats.hasHighDiversityCount}`,
    `  High Clarity Count:         ${stats.hasHighClarityCount}`,
    `  High Precision Count:       ${stats.hasHighPrecisionCount}`,
    `  High Resilience Count:      ${stats.hasHighResilienceCount}`,
    `  High Wisdom Count:          ${stats.hasHighWisdomCount}`,
    `  Overall Spectrum:           ${colorScore(stats.overallSpectrum)}`,
    `  Gemologist Grade:           ${colorGemologistGrade(stats.gemologistGrade)}`,
    `  Best Shard:                 ${stats.bestShard || 'N/A'}`,
    `  Most Diverse:               ${stats.mostDiverse || 'N/A'}`,
    `  Clearest:                   ${stats.clearest || 'N/A'}`,
    `  Most Precise:               ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:             ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                     ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(180, 50, 140)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: TourmalineSpectrumResult): string {
  const lines: string[] = [
    chalk.bold('Tourmaline Spectrum Analysis'),
    '',
    formatShardsTable(result.shards),
    '',
    formatClustersTable(result.clusters),
    '',
    chalk.bold('Rainbow Overview'),
    '',
    `  Avg Diversity:   ${colorScore(result.rainbow.avgDiversity)}`,
    `  Avg Precision:   ${colorScore(result.rainbow.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(result.rainbow.avgWisdom)}`,
    `  Overall Spectrum: ${colorScore(result.rainbow.overallSpectrum)}`,
    `  Is Tourmaline:   ${result.rainbow.isTourmaline ? chalk.rgb(180, 50, 140)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: TourmalineSpectrumResult): string {
  return JSON.stringify(result, null, 2)
}
