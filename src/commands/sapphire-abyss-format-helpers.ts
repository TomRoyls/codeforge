import chalk from 'chalk'

import type { DiveCondition, DiverGrade, SapphireAbyssResult, SapphireDive, SapphireTrench, TrenchCondition, TrenchType } from './sapphire-abyss-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 80, 180)(String(score))
  if (score >= 75) return chalk.rgb(40, 100, 200)(String(score))
  if (score >= 60) return chalk.rgb(50, 120, 210)(String(score))
  if (score >= 40) return chalk.rgb(60, 140, 200)(String(score))
  if (score >= 20) return chalk.rgb(80, 160, 190)(String(score))
  return chalk.gray(String(score))
}

/** @example colorDiveCondition('sapphire-masterpiece') */
export function colorDiveCondition(condition: DiveCondition | string): string {
  switch (condition) {
    case 'sapphire-masterpiece': return chalk.rgb(30, 80, 180)('sapphire-masterpiece')
    case 'deep-gem': return chalk.rgb(40, 100, 200)('deep-gem')
    case 'proper-sapphire': return chalk.rgb(50, 120, 210)('proper-sapphire')
    case 'surface-glass': return chalk.rgb(60, 140, 200)('surface-glass')
    case 'pool-water': return chalk.rgb(80, 160, 190)('pool-water')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorTrenchType('mariana-depth') */
export function colorTrenchType(type: TrenchType | string): string {
  switch (type) {
    case 'mariana-depth': return chalk.rgb(30, 80, 180)('mariana-depth')
    case 'deep-trench': return chalk.rgb(40, 100, 200)('deep-trench')
    case 'proper-canyon': return chalk.rgb(50, 120, 210)('proper-canyon')
    case 'shallow-reef': return chalk.rgb(60, 140, 200)('shallow-reef')
    case 'tidal-pool': return chalk.rgb(80, 160, 190)('tidal-pool')
    case 'no-trench': return chalk.gray('no-trench')
    default: return chalk.gray(String(type))
  }
}

/** @example colorTrenchCondition('sapphire-palace') */
export function colorTrenchCondition(condition: TrenchCondition | string): string {
  switch (condition) {
    case 'sapphire-palace': return chalk.rgb(30, 80, 180)('sapphire-palace')
    case 'deep-vault': return chalk.rgb(40, 100, 200)('deep-vault')
    case 'proper-depth': return chalk.rgb(50, 120, 210)('proper-depth')
    case 'surface-chamber': return chalk.rgb(60, 140, 200)('surface-chamber')
    case 'empty-pool': return chalk.rgb(80, 160, 190)('empty-pool')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorDiverGrade('bathyscaphe-captain') */
export function colorDiverGrade(grade: DiverGrade | string): string {
  switch (grade) {
    case 'bathyscaphe-captain': return chalk.rgb(30, 80, 180)('bathyscaphe-captain')
    case 'deep-sea-diver': return chalk.rgb(40, 100, 200)('deep-sea-diver')
    case 'proper-submariner': return chalk.rgb(50, 120, 210)('proper-submariner')
    case 'surface-swimmer': return chalk.rgb(60, 140, 200)('surface-swimmer')
    case 'novice': return chalk.rgb(80, 160, 190)('novice')
    case 'landlubber': return chalk.gray('landlubber')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatDiveTable(dive) */
export function formatDiveTable(dive: SapphireDive): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Dive: ${dive.file}`),
    '',
    `  Ocean Depth:          ${colorScore(dive.oceanDepth)}  ${chalk.dim(`(${dive.descending.zone})`)}`,
    `  Gem Serenity:         ${colorScore(dive.gemSerenity)}  ${chalk.dim(`(${dive.calming.tide})`)}`,
    `  Pressure Resilience:  ${colorScore(dive.pressureResilience)}  ${chalk.dim(`(${dive.withstanding.hull})`)}`,
    `  Tidal Precision:      ${colorScore(dive.tidalPrecision)}  ${chalk.dim(`(${dive.flowing.current})`)}`,
    `  Depth Wisdom:         ${colorScore(dive.depthWisdom)}  ${chalk.dim(`(${dive.fathoming.chart})`)}`,
    '',
    `  Quality Score: ${colorScore(dive.qualityScore)}  ${chalk.dim(`(${dive.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatDivesTable(dives) */
export function formatDivesTable(dives: SapphireDive[]): string {
  if (dives.length === 0) return chalk.dim('No sapphire dives found')
  const lines: string[] = [chalk.bold('Sapphire Dives'), '']
  for (const d of dives) {
    lines.push(`  ${chalk.rgb(30, 80, 180)(d.file)}  Depth:${colorScore(d.oceanDepth)}  Ser:${colorScore(d.gemSerenity)}  Score:${colorScore(d.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatTrenchTable(trench) */
export function formatTrenchTable(trench: SapphireTrench): string {
  const lines: string[] = [
    chalk.bold(`Sapphire Trench: ${trench.directory}`),
    '',
    `  Dives:               ${trench.dives.length}`,
    `  Avg Depth:           ${colorScore(trench.avgDepth)}`,
    `  Avg Resilience:      ${colorScore(trench.avgResilience)}`,
    `  Avg Wisdom:          ${colorScore(trench.avgWisdom)}`,
    `  Masterpieces:        ${trench.sapphireMasterpieceCount}`,
    `  Trench Type:         ${colorTrenchType(trench.trenchType)}`,
    `  Condition:           ${colorTrenchCondition(trench.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatTrenchesTable(trenches) */
export function formatTrenchesTable(trenches: SapphireTrench[]): string {
  if (trenches.length === 0) return chalk.dim('No sapphire trenches found')
  const lines: string[] = [chalk.bold('Sapphire Trenches'), '']
  for (const t of trenches) {
    lines.push(`  ${chalk.rgb(30, 80, 180)(t.directory)}  ${colorScore(t.avgDepth)}  ${colorTrenchCondition(t.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SapphireAbyssResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Sapphire Abyss Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Trenches:           ${stats.totalTrenches}`,
    `  Avg Ocean Depth:          ${colorScore(stats.avgOceanDepth)}`,
    `  Avg Gem Serenity:         ${colorScore(stats.avgGemSerenity)}`,
    `  Avg Pressure Resilience:  ${colorScore(stats.avgPressureResilience)}`,
    `  Avg Tidal Precision:      ${colorScore(stats.avgTidalPrecision)}`,
    `  Avg Depth Wisdom:         ${colorScore(stats.avgDepthWisdom)}`,
    `  Sapphire Masterpieces:    ${stats.sapphireMasterpieceCount}`,
    `  Deep Gems:                ${stats.deepGemCount}`,
    `  Proper Sapphires:         ${stats.properSapphireCount}`,
    `  Surface Glass:            ${stats.surfaceGlassCount}`,
    `  Pool Water:               ${stats.poolWaterCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Depth:            ${colorScore(stats.overallDepth)}`,
    `  Diver Grade:              ${colorDiverGrade(stats.diverGrade)}`,
    `  Best Dive:                ${stats.bestDive || 'N/A'}`,
    `  Deepest:                  ${stats.deepest || 'N/A'}`,
    `  Most Serene:              ${stats.mostSerene || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 80, 180)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SapphireAbyssResult): string {
  const lines: string[] = [
    chalk.bold('Sapphire Abyss Analysis'),
    '',
    formatDivesTable(result.dives),
    '',
    formatTrenchesTable(result.trenches),
    '',
    chalk.bold('Ocean Overview'),
    '',
    `  Avg Depth:        ${colorScore(result.ocean.avgDepth)}`,
    `  Avg Resilience:   ${colorScore(result.ocean.avgResilience)}`,
    `  Avg Wisdom:       ${colorScore(result.ocean.avgWisdom)}`,
    `  Overall Depth:    ${colorScore(result.ocean.overallDepth)}`,
    `  Is Sapphire:      ${result.ocean.isSapphire ? chalk.rgb(30, 80, 180)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SapphireAbyssResult): string {
  return JSON.stringify(result, null, 2)
}
