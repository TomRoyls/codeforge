import chalk from 'chalk'

import type { BayCondition, BayType, EmeraldBay, EmeraldSwell, EmeraldTideResult, NavigatorGrade, SwellCondition } from './emerald-wave-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(0, 200, 120)(String(score))
  if (score >= 75) return chalk.rgb(0, 180, 100)(String(score))
  if (score >= 60) return chalk.rgb(0, 160, 80)(String(score))
  if (score >= 40) return chalk.rgb(0, 130, 70)(String(score))
  if (score >= 20) return chalk.rgb(0, 100, 60)(String(score))
  return chalk.gray(String(score))
}

/** @example colorSwellCondition('emerald-masterpiece') */
export function colorSwellCondition(condition: SwellCondition | string): string {
  switch (condition) {
    case 'emerald-masterpiece': return chalk.rgb(0, 200, 120)('emerald-masterpiece')
    case 'tidal-gem': return chalk.rgb(0, 180, 100)('tidal-gem')
    case 'proper-wave': return chalk.rgb(0, 160, 80)('proper-wave')
    case 'murky-water': return chalk.rgb(0, 130, 70)('murky-water')
    case 'dry-sand': return chalk.rgb(0, 100, 60)('dry-sand')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorBayType('emerald-bay') */
export function colorBayType(type: BayType | string): string {
  switch (type) {
    case 'emerald-bay': return chalk.rgb(0, 200, 120)('emerald-bay')
    case 'green-harbor': return chalk.rgb(0, 180, 100)('green-harbor')
    case 'proper-cove': return chalk.rgb(0, 160, 80)('proper-cove')
    case 'rocky-shore': return chalk.rgb(0, 130, 70)('rocky-shore')
    case 'dry-beach': return chalk.rgb(0, 100, 60)('dry-beach')
    case 'no-bay': return chalk.gray('no-bay')
    default: return chalk.gray(String(type))
  }
}

/** @example colorBayCondition('ocean-palace') */
export function colorBayCondition(condition: BayCondition | string): string {
  switch (condition) {
    case 'ocean-palace': return chalk.rgb(0, 200, 120)('ocean-palace')
    case 'tidal-pool': return chalk.rgb(0, 180, 100)('tidal-pool')
    case 'proper-harbor': return chalk.rgb(0, 160, 80)('proper-harbor')
    case 'muddy-bank': return chalk.rgb(0, 130, 70)('muddy-bank')
    case 'empty-shore': return chalk.rgb(0, 100, 60)('empty-shore')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorNavigatorGrade('tidal-master') */
export function colorNavigatorGrade(grade: NavigatorGrade | string): string {
  switch (grade) {
    case 'tidal-master': return chalk.rgb(0, 200, 120)('tidal-master')
    case 'experienced-captain': return chalk.rgb(0, 180, 100)('experienced-captain')
    case 'proper-sailor': return chalk.rgb(0, 160, 80)('proper-sailor')
    case 'apprentice': return chalk.rgb(0, 130, 70)('apprentice')
    case 'novice': return chalk.rgb(0, 100, 60)('novice')
    case 'beachcomber': return chalk.gray('beachcomber')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatSwellTable(swell) */
export function formatSwellTable(swell: EmeraldSwell): string {
  const lines: string[] = [
    chalk.bold(`Emerald Swell: ${swell.file}`),
    '',
    `  Green Wave:          ${colorScore(swell.greenWave)}  ${chalk.dim(`(${swell.flowing.surf})`)}`,
    `  Tidal Rhythm:        ${colorScore(swell.tidalRhythm)}  ${chalk.dim(`(${swell.pulsing.beat})`)}`,
    `  Ocean Purity:        ${colorScore(swell.oceanPurity)}  ${chalk.dim(`(${swell.cleansing.water})`)}`,
    `  Coastal Precision:   ${colorScore(swell.coastalPrecision)}  ${chalk.dim(`(${swell.meeting.shoreline})`)}`,
    `  Tide Wisdom:         ${colorScore(swell.tideWisdom)}  ${chalk.dim(`(${swell.understanding.moon})`)}`,
    '',
    `  Quality Score: ${colorScore(swell.qualityScore)}  ${chalk.dim(`(${swell.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatSwellsTable(swells) */
export function formatSwellsTable(swells: EmeraldSwell[]): string {
  if (swells.length === 0) return chalk.dim('No emerald swells found')
  const lines: string[] = [chalk.bold('Emerald Swells'), '']
  for (const s of swells) {
    lines.push(`  ${chalk.rgb(0, 200, 120)(s.file)}  Wave:${colorScore(s.greenWave)}  Rhythm:${colorScore(s.tidalRhythm)}  Score:${colorScore(s.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatBayTable(bay) */
export function formatBayTable(bay: EmeraldBay): string {
  const lines: string[] = [
    chalk.bold(`Emerald Bay: ${bay.directory}`),
    '',
    `  Swells:           ${bay.swells.length}`,
    `  Avg Wave:         ${colorScore(bay.avgWave)}`,
    `  Avg Precision:    ${colorScore(bay.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(bay.avgWisdom)}`,
    `  Masterpieces:     ${bay.emeraldMasterpieceCount}`,
    `  Type:             ${colorBayType(bay.bayType)}`,
    `  Condition:        ${colorBayCondition(bay.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatBaysTable(bays) */
export function formatBaysTable(bays: EmeraldBay[]): string {
  if (bays.length === 0) return chalk.dim('No emerald bays found')
  const lines: string[] = [chalk.bold('Emerald Bays'), '']
  for (const b of bays) {
    lines.push(`  ${chalk.rgb(0, 200, 120)(b.directory)}  ${colorScore(b.avgWave)}  ${colorBayCondition(b.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: EmeraldTideResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Emerald Tide Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Bays:              ${stats.totalBays}`,
    `  Avg Green Wave:          ${colorScore(stats.avgGreenWave)}`,
    `  Avg Tidal Rhythm:        ${colorScore(stats.avgTidalRhythm)}`,
    `  Avg Ocean Purity:        ${colorScore(stats.avgOceanPurity)}`,
    `  Avg Coastal Precision:   ${colorScore(stats.avgCoastalPrecision)}`,
    `  Avg Tide Wisdom:         ${colorScore(stats.avgTideWisdom)}`,
    `  Emerald Masterpieces:    ${stats.emeraldMasterpieceCount}`,
    `  Tidal Gems:              ${stats.tidalGemCount}`,
    `  Proper Waves:            ${stats.properWaveCount}`,
    `  Murky Waters:            ${stats.murkyWaterCount}`,
    `  Dry Sand:                ${stats.drySandCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Flow:            ${colorScore(stats.overallFlow)}`,
    `  Navigator Grade:         ${colorNavigatorGrade(stats.navigatorGrade)}`,
    `  Best Swell:              ${stats.bestSwell || 'N/A'}`,
    `  Most Flowing:            ${stats.mostFlowing || 'N/A'}`,
    `  Most Rhythmic:           ${stats.mostRhythmic || 'N/A'}`,
    `  Purest:                  ${stats.purest || 'N/A'}`,
    `  Most Precise:            ${stats.mostPrecise || 'N/A'}`,
    `  Wisest:                  ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(0, 200, 120)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: EmeraldTideResult): string {
  const lines: string[] = [
    chalk.bold('Emerald Tide Analysis'),
    '',
    formatSwellsTable(result.swells),
    '',
    formatBaysTable(result.bays),
    '',
    chalk.bold('Ocean Overview'),
    '',
    `  Avg Wave:         ${colorScore(result.ocean.avgWave)}`,
    `  Avg Precision:    ${colorScore(result.ocean.avgPrecision)}`,
    `  Avg Wisdom:       ${colorScore(result.ocean.avgWisdom)}`,
    `  Overall Flow:     ${colorScore(result.ocean.overallFlow)}`,
    `  Is Emerald:       ${result.ocean.isEmerald ? chalk.rgb(0, 200, 120)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: EmeraldTideResult): string {
  return JSON.stringify(result, null, 2)
}
