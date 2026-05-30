// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { AmberTideResult, AmberWave, AmberShore } from './amber-tide-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const AMBER = chalk.rgb(255, 191, 0)
const GOLD = chalk.rgb(255, 215, 0)
const TIDE = chalk.rgb(100, 180, 255)
const DIM = chalk.rgb(130, 130, 170)
const BULLET = '\u{1F525}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return AMBER.bold(String(score))
  if (score >= 60) return GOLD(String(score))
  if (score >= 40) return TIDE(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('amber-masterpiece')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('amber') || grade.includes('perfect') || grade.includes('ancient') || grade.includes('crystal') || grade.includes('pure') || grade.includes('magnificent') || grade.includes('master')) return AMBER.bold(grade)
  if (grade.includes('golden') || grade.includes('clear') || grade.includes('moon') || grade.includes('wise') || grade.includes('rich') || grade.includes('clean') || grade.includes('sea-captain') || grade.includes('proper')) return GOLD(grade)
  if (grade.includes('proper-') || grade.includes('steady') || grade.includes('skilled')) return TIDE(grade)
  return DIM(grade)
}

// ─── Wave Table ────────────────────────────────────────────────────

/**
 * @example formatWaveTable(wave)
 */
export function formatWaveTable(wave: AmberWave): string {
  const lines: string[] = []
  lines.push(AMBER.bold(`${BULLET} ${wave.file}`))
  lines.push(`  Preservation Power : ${colorScore(wave.preservationPower)}  ${colorGrade(wave.preserving.resin)}`)
  lines.push(`  Tidal Rhythm       : ${colorScore(wave.tidalRhythm)}  ${colorGrade(wave.pulsing.tide)}`)
  lines.push(`  Golden Current     : ${colorScore(wave.goldenCurrent)}  ${colorGrade(wave.flowing.gold)}`)
  lines.push(`  Wave Purity        : ${colorScore(wave.wavePurity)}  ${colorGrade(wave.cleansing.wave)}`)
  lines.push(`  Ancient Wisdom     : ${colorScore(wave.ancientWisdom)}  ${colorGrade(wave.knowing.sage)}`)
  lines.push(`  Quality Score      : ${colorScore(wave.qualityScore)}  ${colorGrade(wave.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatWavesTable(waves)
 */
export function formatWavesTable(waves: AmberWave[]): string {
  if (waves.length === 0) return chalk.gray('No amber waves to display')
  return waves.map(formatWaveTable).join('\n\n')
}

// ─── Shore Table ───────────────────────────────────────────────────

/**
 * @example formatShoreTable(shore)
 */
export function formatShoreTable(shore: AmberShore): string {
  const lines: string[] = []
  lines.push(AMBER.bold(`${BULLET} ${shore.directory}`))
  lines.push(`  Waves            : ${shore.waves.length}`)
  lines.push(`  Avg Preservation : ${colorScore(shore.avgPreservation)}`)
  lines.push(`  Avg Rhythm       : ${colorScore(shore.avgRhythm)}`)
  lines.push(`  Avg Wisdom       : ${colorScore(shore.avgWisdom)}`)
  lines.push(`  Masterpieces     : ${shore.amberMasterpieceCount}`)
  lines.push(`  Dry Beds         : ${shore.dryBedCount}`)
  lines.push(`  Shore Type       : ${colorGrade(shore.shoreType)}`)
  lines.push(`  Condition        : ${colorGrade(shore.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatShoresTable(shores)
 */
export function formatShoresTable(shores: AmberShore[]): string {
  if (shores.length === 0) return chalk.gray('No amber shores to display')
  return shores.map(formatShoreTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: AmberTideResult['stats']): string {
  const lines: string[] = []
  lines.push(AMBER.bold('Amber Tide Statistics'))
  lines.push(`  Total Files        : ${stats.totalFiles}`)
  lines.push(`  Total Shores       : ${stats.totalShores}`)
  lines.push(`  Avg Preservation   : ${colorScore(stats.avgPreservationPower)}`)
  lines.push(`  Avg Tidal Rhythm   : ${colorScore(stats.avgTidalRhythm)}`)
  lines.push(`  Avg Golden Current : ${colorScore(stats.avgGoldenCurrent)}`)
  lines.push(`  Avg Wave Purity    : ${colorScore(stats.avgWavePurity)}`)
  lines.push(`  Avg Ancient Wisdom : ${colorScore(stats.avgAncientWisdom)}`)
  lines.push(`  Amber Masterpiece  : ${stats.amberMasterpieceCount}`)
  lines.push(`  Golden Wave        : ${stats.goldenWaveCount}`)
  lines.push(`  Proper Tide        : ${stats.properTideCount}`)
  lines.push(`  Murky Current      : ${stats.murkyCurrentCount}`)
  lines.push(`  Stagnant Pool      : ${stats.stagnantPoolCount}`)
  lines.push(`  Dry Bed            : ${stats.dryBedCount}`)
  lines.push(`  Overall Flow       : ${colorScore(stats.overallFlow)}`)
  lines.push(`  Captain Grade      : ${colorGrade(stats.captainGrade)}`)
  lines.push(`  Best Wave          : ${GOLD(stats.bestWave)}`)
  lines.push(`  Most Preserved     : ${GOLD(stats.mostPreserved)}`)
  lines.push(`  Best Rhythm        : ${GOLD(stats.bestRhythm)}`)
  lines.push(`  Most Valuable      : ${GOLD(stats.mostValuable)}`)
  lines.push(`  Wisest             : ${GOLD(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${GOLD(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: AmberTideResult): string {
  const sections: string[] = []

  sections.push(AMBER.bold('Amber Wave Analysis'))
  sections.push(formatWavesTable(result.waves))
  sections.push('')
  sections.push(AMBER.bold('Amber Shores'))
  sections.push(formatShoresTable(result.shores))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(AMBER.bold('Ocean'))
  sections.push(`  Avg Preservation : ${colorScore(result.ocean.avgPreservation)}`)
  sections.push(`  Avg Rhythm       : ${colorScore(result.ocean.avgRhythm)}`)
  sections.push(`  Avg Wisdom       : ${colorScore(result.ocean.avgWisdom)}`)
  sections.push(`  Is Amber         : ${result.ocean.isAmber ? AMBER.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Flow     : ${colorScore(result.ocean.overallFlow)}`)
  sections.push('')
  sections.push(AMBER.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: AmberTideResult): string {
  return JSON.stringify(result, null, 2)
}
