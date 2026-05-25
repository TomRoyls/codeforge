// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { SilverTideResult, SilverWave, SilverShore } from './silver-tide-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const SILVER = chalk.rgb(192, 210, 230)
const TIDE = chalk.rgb(100, 180, 255)
const MOON = chalk.rgb(200, 200, 255)
const DIM = chalk.rgb(140, 150, 165)
const BULLET = '\u{1F30A}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return TIDE.bold(String(score))
  if (score >= 60) return MOON(String(score))
  if (score >= 40) return SILVER.bold(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('silver-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('silver') || grade.includes('full') || grade.includes('surgical') || grade.includes('abyssal') || grade.includes('moon-driven') || grade.includes('moon-captain') || grade.includes('silver-coast') || grade.includes('magnificent')) return TIDE.bold(grade)
  if (grade.includes('bright') || grade.includes('steady') || grade.includes('silver-river') || grade.includes('precise') || grade.includes('deep') || grade.includes('silver-navigator') || grade.includes('moonlit-beach') || grade.includes('beautiful')) return MOON(grade)
  if (grade.includes('proper') || grade.includes('smooth') || grade.includes('skilled-sailor') || grade.includes('proper-shore') || grade.includes('proper-beach')) return SILVER.bold(grade)
  return DIM(grade)
}

// ─── Wave Table ────────────────────────────────────────────────────

/**
 * @example formatWaveTable(wave)
 */
export function formatWaveTable(wave: SilverWave): string {
  const lines: string[] = []
  lines.push(TIDE.bold(`${BULLET} ${wave.file}`))
  lines.push(`  Lunar Purity      : ${colorScore(wave.lunarPurity)}  ${colorGrade(wave.purifying.moon)}`)
  lines.push(`  Tidal Rhythm      : ${colorScore(wave.tidalRhythm)}  ${colorGrade(wave.pulsing.tide)}`)
  lines.push(`  Moonlit Current   : ${colorScore(wave.moonlitCurrent)}  ${colorGrade(wave.flowing.stream)}`)
  lines.push(`  Wave Precision    : ${colorScore(wave.wavePrecision)}  ${colorGrade(wave.striking.wave)}`)
  lines.push(`  Ocean Wisdom      : ${colorScore(wave.oceanWisdom)}  ${colorGrade(wave.knowing.depth)}`)
  lines.push(`  Quality Score     : ${colorScore(wave.qualityScore)}  ${colorGrade(wave.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatWavesTable(waves)
 */
export function formatWavesTable(waves: SilverWave[]): string {
  if (waves.length === 0) return chalk.gray('No silver waves to display')
  return waves.map(formatWaveTable).join('\n\n')
}

// ─── Shore Table ───────────────────────────────────────────────────

/**
 * @example formatShoreTable(shore)
 */
export function formatShoreTable(shore: SilverShore): string {
  const lines: string[] = []
  lines.push(TIDE.bold(`${BULLET} ${shore.directory}`))
  lines.push(`  Waves              : ${shore.waves.length}`)
  lines.push(`  Avg Purity         : ${colorScore(shore.avgPurity)}`)
  lines.push(`  Avg Rhythm         : ${colorScore(shore.avgRhythm)}`)
  lines.push(`  Avg Wisdom         : ${colorScore(shore.avgWisdom)}`)
  lines.push(`  Silver Masterpiece : ${shore.silverMasterpieceCount}`)
  lines.push(`  Dry Beds           : ${shore.dryBedCount}`)
  lines.push(`  Shore Type         : ${colorGrade(shore.shoreType)}`)
  lines.push(`  Condition          : ${colorGrade(shore.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatShoresTable(shores)
 */
export function formatShoresTable(shores: SilverShore[]): string {
  if (shores.length === 0) return chalk.gray('No silver shores to display')
  return shores.map(formatShoreTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: SilverTideResult['stats']): string {
  const lines: string[] = []
  lines.push(TIDE.bold('Silver Tide Statistics'))
  lines.push(`  Total Files         : ${stats.totalFiles}`)
  lines.push(`  Total Shores        : ${stats.totalShores}`)
  lines.push(`  Avg Lunar Purity    : ${colorScore(stats.avgLunarPurity)}`)
  lines.push(`  Avg Tidal Rhythm    : ${colorScore(stats.avgTidalRhythm)}`)
  lines.push(`  Avg Moonlit Current : ${colorScore(stats.avgMoonlitCurrent)}`)
  lines.push(`  Avg Wave Precision  : ${colorScore(stats.avgWavePrecision)}`)
  lines.push(`  Avg Ocean Wisdom    : ${colorScore(stats.avgOceanWisdom)}`)
  lines.push(`  Silver Masterpiece  : ${stats.silverMasterpieceCount}`)
  lines.push(`  Moonlit Wave        : ${stats.moonlitWaveCount}`)
  lines.push(`  Proper Tide         : ${stats.properTideCount}`)
  lines.push(`  Murky Current       : ${stats.murkyCurrentCount}`)
  lines.push(`  Stagnant Pool       : ${stats.stagnantPoolCount}`)
  lines.push(`  Dry Bed             : ${stats.dryBedCount}`)
  lines.push(`  Overall Luminosity  : ${colorScore(stats.overallLuminosity)}`)
  lines.push(`  Navigator Grade     : ${colorGrade(stats.navigatorGrade)}`)
  lines.push(`  Best Wave           : ${MOON(stats.bestWave)}`)
  lines.push(`  Purest              : ${MOON(stats.purest)}`)
  lines.push(`  Best Rhythm         : ${MOON(stats.bestRhythm)}`)
  lines.push(`  Most Fluid          : ${MOON(stats.mostFluid)}`)
  lines.push(`  Wisest              : ${MOON(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${MOON(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: SilverTideResult): string {
  const sections: string[] = []

  sections.push(TIDE.bold('Silver Wave Analysis'))
  sections.push(formatWavesTable(result.waves))
  sections.push('')
  sections.push(TIDE.bold('Silver Shores'))
  sections.push(formatShoresTable(result.shores))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(TIDE.bold('Ocean'))
  sections.push(`  Avg Purity        : ${colorScore(result.ocean.avgPurity)}`)
  sections.push(`  Avg Rhythm        : ${colorScore(result.ocean.avgRhythm)}`)
  sections.push(`  Avg Wisdom        : ${colorScore(result.ocean.avgWisdom)}`)
  sections.push(`  Is Silver         : ${result.ocean.isSilver ? TIDE.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Luminosity: ${colorScore(result.ocean.overallLuminosity)}`)
  sections.push('')
  sections.push(TIDE.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: SilverTideResult): string {
  return JSON.stringify(result, null, 2)
}
