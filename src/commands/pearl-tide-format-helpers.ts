import chalk from 'chalk'

import type { BedCondition, BedType, DiverGrade, PearlCondition, PearlLuster, PearlTideResult } from './pearl-tide-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(72, 191, 210)(String(score))
  if (score >= 75) return chalk.rgb(60, 165, 185)(String(score))
  if (score >= 60) return chalk.rgb(48, 140, 160)(String(score))
  if (score >= 40) return chalk.rgb(36, 115, 135)(String(score))
  if (score >= 20) return chalk.rgb(24, 90, 110)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPearlCondition('pearl-masterpiece') */
export function colorPearlCondition(condition: PearlCondition | string): string {
  switch (condition) {
    case 'pearl-masterpiece': return chalk.rgb(72, 191, 210)('pearl-masterpiece')
    case 'gem-quality': return chalk.rgb(60, 165, 185)('gem-quality')
    case 'proper-pearl': return chalk.rgb(48, 140, 160)('proper-pearl')
    case 'baroque-shape': return chalk.rgb(36, 115, 135)('baroque-shape')
    case 'seed-pearl': return chalk.rgb(24, 90, 110)('seed-pearl')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorBedType('pearl-fishery') */
export function colorBedType(type: BedType | string): string {
  switch (type) {
    case 'pearl-fishery': return chalk.rgb(72, 191, 210)('pearl-fishery')
    case 'oyster-bed': return chalk.rgb(60, 165, 185)('oyster-bed')
    case 'proper-reef': return chalk.rgb(48, 140, 160)('proper-reef')
    case 'small-colony': return chalk.rgb(36, 115, 135)('small-colony')
    case 'empty-shore': return chalk.rgb(24, 90, 110)('empty-shore')
    case 'no-bed': return chalk.gray('no-bed')
    default: return chalk.gray(String(type))
  }
}

/** @example colorBedCondition('pearl-palace') */
export function colorBedCondition(condition: BedCondition | string): string {
  switch (condition) {
    case 'pearl-palace': return chalk.rgb(72, 191, 210)('pearl-palace')
    case 'nacre-vault': return chalk.rgb(60, 165, 185)('nacre-vault')
    case 'proper-chamber': return chalk.rgb(48, 140, 160)('proper-chamber')
    case 'shell-collection': return chalk.rgb(36, 115, 135)('shell-collection')
    case 'empty-beach': return chalk.rgb(24, 90, 110)('empty-beach')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorDiverGrade('master-pearl-diver') */
export function colorDiverGrade(grade: DiverGrade | string): string {
  switch (grade) {
    case 'master-pearl-diver': return chalk.rgb(72, 191, 210)('master-pearl-diver')
    case 'experienced-fisher': return chalk.rgb(60, 165, 185)('experienced-fisher')
    case 'proper-diver': return chalk.rgb(48, 140, 160)('proper-diver')
    case 'apprentice': return chalk.rgb(36, 115, 135)('apprentice')
    case 'novice': return chalk.rgb(24, 90, 110)('novice')
    case 'shore-collector': return chalk.gray('shore-collector')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatLusterTable(luster) */
export function formatLusterTable(luster: PearlLuster): string {
  const lines: string[] = [
    chalk.bold(`Pearl Luster: ${luster.file}`),
    '',
    `  Lustrous Purity:      ${colorScore(luster.lustrousPurity)}  ${chalk.dim(`(${luster.gleaming.luster})`)}`,
    `  Ocean Wisdom:         ${colorScore(luster.oceanWisdom)}  ${chalk.dim(`(${luster.fathoming.depth})`)}`,
    `  Nacre Precision:      ${colorScore(luster.nacrePrecision)}  ${chalk.dim(`(${luster.layering.coat})`)}`,
    `  Tidal Resilience:     ${colorScore(luster.tidalResilience)}  ${chalk.dim(`(${luster.flowing.tide})`)}`,
    `  Iridescent Clarity:   ${colorScore(luster.iridescentClarity)}  ${chalk.dim(`(${luster.shimmering.rainbow})`)}`,
    '',
    `  Quality Score: ${colorScore(luster.qualityScore)}  ${chalk.dim(`(${luster.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatLustersTable(lusters) */
export function formatLustersTable(lusters: PearlLuster[]): string {
  if (lusters.length === 0) return chalk.dim('No pearl lusters found')
  const lines: string[] = [chalk.bold('Pearl Lusters'), '']
  for (const l of lusters) {
    lines.push(`  ${chalk.rgb(72, 191, 210)(l.file)}  Pur:${colorScore(l.lustrousPurity)}  Wis:${colorScore(l.oceanWisdom)}  Score:${colorScore(l.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatBedTable(bed) */
export function formatBedTable(bed: PearlTideResult['beds'][number]): string {
  const lines: string[] = [
    chalk.bold(`Pearl Bed: ${bed.directory}`),
    '',
    `  Lusters:          ${bed.lusters.length}`,
    `  Avg Purity:       ${colorScore(bed.avgPurity)}`,
    `  Avg Precision:    ${colorScore(bed.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(bed.avgWisdom)}`,
    `  Masterpieces:     ${bed.pearlMasterpieceCount}`,
    `  Type:             ${colorBedType(bed.bedType)}`,
    `  Condition:        ${colorBedCondition(bed.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatBedsTable(beds) */
export function formatBedsTable(beds: PearlTideResult['beds']): string {
  if (beds.length === 0) return chalk.dim('No pearl beds found')
  const lines: string[] = [chalk.bold('Pearl Beds'), '']
  for (const b of beds) {
    lines.push(`  ${chalk.rgb(72, 191, 210)(b.directory)}  ${colorScore(b.avgPurity)}  ${colorBedCondition(b.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: PearlTideResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Pearl Tide Statistics'),
    '',
    `  Total Files:                ${stats.totalFiles}`,
    `  Total Beds:                 ${stats.totalBeds}`,
    `  Avg Lustrous Purity:        ${colorScore(stats.avgLustrousPurity)}`,
    `  Avg Ocean Wisdom:           ${colorScore(stats.avgOceanWisdom)}`,
    `  Avg Nacre Precision:        ${colorScore(stats.avgNacrePrecision)}`,
    `  Avg Tidal Resilience:       ${colorScore(stats.avgTidalResilience)}`,
    `  Avg Iridescent Clarity:     ${colorScore(stats.avgIridescentClarity)}`,
    `  Pearl Masterpieces:         ${stats.pearlMasterpieceCount}`,
    `  Gem Quality:                ${stats.gemQualityCount}`,
    `  Proper Pearls:              ${stats.properPearlCount}`,
    `  Baroque Shapes:             ${stats.baroqueShapeCount}`,
    `  Seed Pearls:                ${stats.seedPearlCount}`,
    `  Void:                       ${stats.voidCount}`,
    `  Overall Luster:             ${colorScore(stats.overallLuster)}`,
    `  Diver Grade:                ${colorDiverGrade(stats.diverGrade)}`,
    `  Best Luster:                ${stats.bestLuster || 'N/A'}`,
    `  Purest:                     ${stats.purest || 'N/A'}`,
    `  Wisest:                     ${stats.wisest || 'N/A'}`,
    `  Most Precise:               ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:             ${stats.mostResilient || 'N/A'}`,
    `  Clearest:                   ${stats.clearest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(72, 191, 210)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: PearlTideResult): string {
  const lines: string[] = [
    chalk.bold('Pearl Tide Analysis'),
    '',
    formatLustersTable(result.lusters),
    '',
    formatBedsTable(result.beds),
    '',
    chalk.bold('Ocean Overview'),
    '',
    `  Avg Purity:            ${colorScore(result.ocean.avgPurity)}`,
    `  Avg Precision:         ${colorScore(result.ocean.avgPrecision)}`,
    `  Avg Wisdom:            ${colorScore(result.ocean.avgWisdom)}`,
    `  Overall Luster:        ${colorScore(result.ocean.overallLuster)}`,
    `  Is Pearl:              ${result.ocean.isPearl ? chalk.rgb(72, 191, 210)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: PearlTideResult): string {
  return JSON.stringify(result, null, 2)
}
