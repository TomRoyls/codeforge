import chalk from 'chalk'

import type { GardenerGrade, OrchardCondition, OrchardType, PeridotBloom, PeridotCondition, PeridotGardenResult, PeridotOrchard } from './peridot-garden-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(124, 179, 66)(String(score))
  if (score >= 75) return chalk.rgb(110, 160, 58)(String(score))
  if (score >= 60) return chalk.rgb(96, 140, 50)(String(score))
  if (score >= 40) return chalk.rgb(80, 118, 42)(String(score))
  if (score >= 20) return chalk.rgb(64, 96, 34)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPeridotCondition('peridot-masterpiece') */
export function colorPeridotCondition(condition: PeridotCondition | string): string {
  switch (condition) {
    case 'peridot-masterpiece': return chalk.rgb(124, 179, 66)('peridot-masterpiece')
    case 'golden-bloom': return chalk.rgb(110, 160, 58)('golden-bloom')
    case 'proper-peridot': return chalk.rgb(96, 140, 50)('proper-peridot')
    case 'pale-stone': return chalk.rgb(80, 118, 42)('pale-stone')
    case 'raw-mineral': return chalk.rgb(64, 96, 34)('raw-mineral')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorOrchardType('lush-garden') */
export function colorOrchardType(type: OrchardType | string): string {
  switch (type) {
    case 'lush-garden': return chalk.rgb(124, 179, 66)('lush-garden')
    case 'green-oasis': return chalk.rgb(110, 160, 58)('green-oasis')
    case 'proper-plot': return chalk.rgb(96, 140, 50)('proper-plot')
    case 'small-bed': return chalk.rgb(80, 118, 42)('small-bed')
    case 'empty-pot': return chalk.rgb(64, 96, 34)('empty-pot')
    case 'no-orchard': return chalk.gray('no-orchard')
    default: return chalk.gray(String(type))
  }
}

/** @example colorOrchardCondition('peridot-palace') */
export function colorOrchardCondition(condition: OrchardCondition | string): string {
  switch (condition) {
    case 'peridot-palace': return chalk.rgb(124, 179, 66)('peridot-palace')
    case 'green-gazebo': return chalk.rgb(110, 160, 58)('green-gazebo')
    case 'proper-greenhouse': return chalk.rgb(96, 140, 50)('proper-greenhouse')
    case 'dusty-plot': return chalk.rgb(80, 118, 42)('dusty-plot')
    case 'empty-field': return chalk.rgb(64, 96, 34)('empty-field')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGardenerGrade('master-gardener') */
export function colorGardenerGrade(grade: GardenerGrade | string): string {
  switch (grade) {
    case 'master-gardener': return chalk.rgb(124, 179, 66)('master-gardener')
    case 'expert-horticulturist': return chalk.rgb(110, 160, 58)('expert-horticulturist')
    case 'proper-gardener': return chalk.rgb(96, 140, 50)('proper-gardener')
    case 'apprentice': return chalk.rgb(80, 118, 42)('apprentice')
    case 'novice': return chalk.rgb(64, 96, 34)('novice')
    case 'weed-puller': return chalk.gray('weed-puller')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBloomTable(bloom) */
export function formatBloomTable(bloom: PeridotBloom): string {
  const lines: string[] = [
    chalk.bold(`Peridot Bloom: ${bloom.file}`),
    '',
    `  Olive Vitality:    ${colorScore(bloom.oliveVitality)}  ${chalk.dim(`(${bloom.growing.bloom})`)}`,
    `  Garden Serenity:   ${colorScore(bloom.gardenSerenity)}  ${chalk.dim(`(${bloom.tending.garden})`)}`,
    `  Growth Precision:  ${colorScore(bloom.growthPrecision)}  ${chalk.dim(`(${bloom.pruning.trim})`)}`,
    `  Root Resilience:   ${colorScore(bloom.rootResilience)}  ${chalk.dim(`(${bloom.rooting.root})`)}`,
    `  Harvest Wisdom:    ${colorScore(bloom.harvestWisdom)}  ${chalk.dim(`(${bloom.reaping.yield})`)}`,
    '',
    `  Quality Score: ${colorScore(bloom.qualityScore)}  ${chalk.dim(`(${bloom.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBloomsTable(blooms) */
export function formatBloomsTable(blooms: PeridotBloom[]): string {
  if (blooms.length === 0) return chalk.dim('No peridot blooms found')
  const lines: string[] = [chalk.bold('Peridot Blooms'), '']
  for (const b of blooms) {
    lines.push(`  ${chalk.rgb(124, 179, 66)(b.file)}  Vit:${colorScore(b.oliveVitality)}  Ser:${colorScore(b.gardenSerenity)}  Score:${colorScore(b.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatOrchardTable(orchard) */
export function formatOrchardTable(orchard: PeridotOrchard): string {
  const lines: string[] = [
    chalk.bold(`Peridot Orchard: ${orchard.directory}`),
    '',
    `  Blooms:          ${orchard.blooms.length}`,
    `  Avg Vitality:    ${colorScore(orchard.avgVitality)}`,
    `  Avg Precision:   ${colorScore(orchard.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(orchard.avgWisdom)}`,
    `  Masterpieces:    ${orchard.peridotMasterpieceCount}`,
    `  Type:            ${colorOrchardType(orchard.orchardType)}`,
    `  Condition:       ${colorOrchardCondition(orchard.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatOrchardsTable(orchards) */
export function formatOrchardsTable(orchards: PeridotOrchard[]): string {
  if (orchards.length === 0) return chalk.dim('No peridot orchards found')
  const lines: string[] = [chalk.bold('Peridot Orchards'), '']
  for (const o of orchards) {
    lines.push(`  ${chalk.rgb(124, 179, 66)(o.directory)}  ${colorScore(o.avgVitality)}  ${colorOrchardCondition(o.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: PeridotGardenResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Peridot Garden Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Orchards:        ${stats.totalOrchards}`,
    `  Avg Olive Vitality:    ${colorScore(stats.avgOliveVitality)}`,
    `  Avg Garden Serenity:   ${colorScore(stats.avgGardenSerenity)}`,
    `  Avg Growth Precision:  ${colorScore(stats.avgGrowthPrecision)}`,
    `  Avg Root Resilience:   ${colorScore(stats.avgRootResilience)}`,
    `  Avg Harvest Wisdom:    ${colorScore(stats.avgHarvestWisdom)}`,
    `  Peridot Masterpieces:  ${stats.peridotMasterpieceCount}`,
    `  Golden Blooms:         ${stats.goldenBloomCount}`,
    `  Proper Peridot:        ${stats.properPeridotCount}`,
    `  Pale Stone:            ${stats.paleStoneCount}`,
    `  Raw Mineral:           ${stats.rawMineralCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Fertility:     ${colorScore(stats.overallFertility)}`,
    `  Gardener Grade:        ${colorGardenerGrade(stats.gardenerGrade)}`,
    `  Best Bloom:            ${stats.bestBloom || 'N/A'}`,
    `  Most Vital:            ${stats.mostVital || 'N/A'}`,
    `  Most Serene:           ${stats.mostSerene || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(124, 179, 66)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: PeridotGardenResult): string {
  const lines: string[] = [
    chalk.bold('Peridot Garden Analysis'),
    '',
    formatBloomsTable(result.blooms),
    '',
    formatOrchardsTable(result.orchards),
    '',
    chalk.bold('Harvest Overview'),
    '',
    `  Avg Vitality:      ${colorScore(result.harvest.avgVitality)}`,
    `  Avg Precision:     ${colorScore(result.harvest.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(result.harvest.avgWisdom)}`,
    `  Overall Fertility: ${colorScore(result.harvest.overallFertility)}`,
    `  Is Peridot:        ${result.harvest.isPeridot ? chalk.rgb(124, 179, 66)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: PeridotGardenResult): string {
  return JSON.stringify(result, null, 2)
}
