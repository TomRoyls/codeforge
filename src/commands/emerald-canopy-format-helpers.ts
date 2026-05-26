import chalk from 'chalk'

import type { CanopyCondition, CanopyLayer, CanopyLeaf, EmeraldCanopyResult, LayerCondition, LayerType, RangerGrade } from './emerald-canopy-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(34, 139, 34)(String(score))
  if (score >= 75) return chalk.rgb(28, 120, 28)(String(score))
  if (score >= 60) return chalk.rgb(22, 100, 22)(String(score))
  if (score >= 40) return chalk.rgb(16, 80, 16)(String(score))
  if (score >= 20) return chalk.rgb(10, 60, 10)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCanopyCondition('canopy-masterpiece') */
export function colorCanopyCondition(condition: CanopyCondition | string): string {
  switch (condition) {
    case 'canopy-masterpiece': return chalk.rgb(34, 139, 34)('canopy-masterpiece')
    case 'emerald-crown': return chalk.rgb(28, 120, 28)('emerald-crown')
    case 'proper-canopy': return chalk.rgb(22, 100, 22)('proper-canopy')
    case 'thin-foliage': return chalk.rgb(16, 80, 16)('thin-foliage')
    case 'bare-branches': return chalk.rgb(10, 60, 10)('bare-branches')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorLayerType('primary-canopy') */
export function colorLayerType(type: LayerType | string): string {
  switch (type) {
    case 'primary-canopy': return chalk.rgb(34, 139, 34)('primary-canopy')
    case 'secondary-growth': return chalk.rgb(28, 120, 28)('secondary-growth')
    case 'proper-understory': return chalk.rgb(22, 100, 22)('proper-understory')
    case 'shrub-layer': return chalk.rgb(16, 80, 16)('shrub-layer')
    case 'forest-floor': return chalk.rgb(10, 60, 10)('forest-floor')
    case 'no-layer': return chalk.gray('no-layer')
    default: return chalk.gray(String(type))
  }
}

/** @example colorLayerCondition('emerald-forest') */
export function colorLayerCondition(condition: LayerCondition | string): string {
  switch (condition) {
    case 'emerald-forest': return chalk.rgb(34, 139, 34)('emerald-forest')
    case 'green-canopy': return chalk.rgb(28, 120, 28)('green-canopy')
    case 'proper-woodland': return chalk.rgb(22, 100, 22)('proper-woodland')
    case 'thin-grove': return chalk.rgb(16, 80, 16)('thin-grove')
    case 'empty-clearing': return chalk.rgb(10, 60, 10)('empty-clearing')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorRangerGrade('forest-elder') */
export function colorRangerGrade(grade: RangerGrade | string): string {
  switch (grade) {
    case 'forest-elder': return chalk.rgb(34, 139, 34)('forest-elder')
    case 'master-ranger': return chalk.rgb(28, 120, 28)('master-ranger')
    case 'proper-forester': return chalk.rgb(22, 100, 22)('proper-forester')
    case 'apprentice': return chalk.rgb(16, 80, 16)('apprentice')
    case 'novice': return chalk.rgb(10, 60, 10)('novice')
    case 'city-dweller': return chalk.gray('city-dweller')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatLeafTable(leaf) */
export function formatLeafTable(leaf: CanopyLeaf): string {
  const lines: string[] = [
    chalk.bold(`Canopy Leaf: ${leaf.file}`),
    '',
    `  Forest Vitality:     ${colorScore(leaf.forestVitality)}  ${chalk.dim(`(${leaf.thriving.growth})`)}`,
    `  Leaf Clarity:        ${colorScore(leaf.leafClarity)}  ${chalk.dim(`(${leaf.filtering.light})`)}`,
    `  Root Precision:      ${colorScore(leaf.rootPrecision)}  ${chalk.dim(`(${leaf.reaching.depth})`)}`,
    `  Branch Resilience:   ${colorScore(leaf.branchResilience)}  ${chalk.dim(`(${leaf.flexing.wood})`)}`,
    `  Ecosystem Wisdom:    ${colorScore(leaf.ecosystemWisdom)}  ${chalk.dim(`(${leaf.networking.web})`)}`,
    '',
    `  Quality Score: ${colorScore(leaf.qualityScore)}  ${chalk.dim(`(${leaf.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatLeavesTable(leaves) */
export function formatLeavesTable(leaves: CanopyLeaf[]): string {
  if (leaves.length === 0) return chalk.dim('No canopy leaves found')
  const lines: string[] = [chalk.bold('Canopy Leaves'), '']
  for (const l of leaves) {
    lines.push(`  ${chalk.rgb(34, 139, 34)(l.file)}  Vit:${colorScore(l.forestVitality)}  Clr:${colorScore(l.leafClarity)}  Score:${colorScore(l.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatLayerTable(layer) */
export function formatLayerTable(layer: CanopyLayer): string {
  const lines: string[] = [
    chalk.bold(`Canopy Layer: ${layer.directory}`),
    '',
    `  Leaves:              ${layer.leaves.length}`,
    `  Avg Vitality:        ${colorScore(layer.avgVitality)}`,
    `  Avg Precision:       ${colorScore(layer.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(layer.avgWisdom)}`,
    `  Masterpieces:        ${layer.canopyMasterpieceCount}`,
    `  Layer Type:          ${colorLayerType(layer.layerType)}`,
    `  Condition:           ${colorLayerCondition(layer.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatLayersTable(layers) */
export function formatLayersTable(layers: CanopyLayer[]): string {
  if (layers.length === 0) return chalk.dim('No canopy layers found')
  const lines: string[] = [chalk.bold('Canopy Layers'), '']
  for (const ly of layers) {
    lines.push(`  ${chalk.rgb(34, 139, 34)(ly.directory)}  ${colorScore(ly.avgVitality)}  ${colorLayerCondition(ly.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldCanopyResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Canopy Statistics'),
    '',
    `  Total Files:                ${stats.totalFiles}`,
    `  Total Layers:               ${stats.totalLayers}`,
    `  Avg Forest Vitality:        ${colorScore(stats.avgForestVitality)}`,
    `  Avg Leaf Clarity:           ${colorScore(stats.avgLeafClarity)}`,
    `  Avg Root Precision:         ${colorScore(stats.avgRootPrecision)}`,
    `  Avg Branch Resilience:      ${colorScore(stats.avgBranchResilience)}`,
    `  Avg Ecosystem Wisdom:       ${colorScore(stats.avgEcosystemWisdom)}`,
    `  Canopy Masterpieces:        ${stats.canopyMasterpieceCount}`,
    `  Emerald Crowns:             ${stats.emeraldCrownCount}`,
    `  Proper Canopies:            ${stats.properCanopyCount}`,
    `  Thin Foliage:               ${stats.thinFoliageCount}`,
    `  Bare Branches:              ${stats.bareBranchesCount}`,
    `  Void:                       ${stats.voidCount}`,
    `  Overall Health:             ${colorScore(stats.overallHealth)}`,
    `  Ranger Grade:               ${colorRangerGrade(stats.rangerGrade)}`,
    `  Best Leaf:                  ${stats.bestLeaf || 'N/A'}`,
    `  Most Vital:                 ${stats.mostVital || 'N/A'}`,
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
    lines.push(`  ${chalk.rgb(34, 139, 34)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldCanopyResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Canopy Analysis'),
    '',
    formatLeavesTable(result.leaves),
    '',
    formatLayersTable(result.layers),
    '',
    chalk.bold('Forest Overview'),
    '',
    `  Avg Vitality:          ${colorScore(result.forest.avgVitality)}`,
    `  Avg Precision:         ${colorScore(result.forest.avgPrecision)}`,
    `  Avg Wisdom:            ${colorScore(result.forest.avgWisdom)}`,
    `  Overall Health:        ${colorScore(result.forest.overallHealth)}`,
    `  Is Emerald:            ${result.forest.isEmerald ? chalk.rgb(34, 139, 34)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldCanopyResult): string {
  return JSON.stringify(result, null, 2)
}
