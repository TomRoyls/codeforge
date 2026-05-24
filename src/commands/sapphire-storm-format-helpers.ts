// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { SapphireStormResult, SapphireBolt, SapphireCloud } from './sapphire-storm-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const SAPPHIRE = chalk.rgb(50, 100, 255)
const LIGHTNING = chalk.rgb(150, 200, 255)
const STORM = chalk.rgb(100, 150, 255)
const DIM = chalk.rgb(130, 130, 170)
const BULLET = '\u{26A1}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return SAPPHIRE.bold(String(score))
  if (score >= 60) return LIGHTNING(String(score))
  if (score >= 40) return STORM(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('perfect-storm')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('perfect') || grade.includes('category-5') || grade.includes('surgical') || grade.includes('blinding') || grade.includes('earth') || grade.includes('life-giving') || grade.includes('super-cell') || grade.includes('magnificent') || grade.includes('storm-chaser')) return SAPPHIRE.bold(grade)
  if (grade.includes('major') || grade.includes('precision') || grade.includes('bright') || grade.includes('powerful') || grade.includes('nourishing') || grade.includes('thunderhead') || grade.includes('weather-expert') || grade.includes('mighty')) return LIGHTNING(grade)
  if (grade.includes('proper') || grade.includes('skilled')) return STORM(grade)
  return DIM(grade)
}

// ─── Bolt Table ────────────────────────────────────────────────────

/**
 * @example formatBoltTable(bolt)
 */
export function formatBoltTable(bolt: SapphireBolt): string {
  const lines: string[] = []
  lines.push(SAPPHIRE.bold(`${BULLET} ${bolt.file}`))
  lines.push(`  Gem Fury          : ${colorScore(bolt.gemFury)}  ${colorGrade(bolt.striking.storm)}`)
  lines.push(`  Strike Precision  : ${colorScore(bolt.strikePrecision)}  ${colorGrade(bolt.targeting.strike)}`)
  lines.push(`  Lightning Clarity : ${colorScore(bolt.lightningClarity)}  ${colorGrade(bolt.illuminating.lightning)}`)
  lines.push(`  Thunder Resilience: ${colorScore(bolt.thunderResilience)}  ${colorGrade(bolt.enduring.thunder)}`)
  lines.push(`  Rain Wisdom       : ${colorScore(bolt.rainWisdom)}  ${colorGrade(bolt.nourishing.rain)}`)
  lines.push(`  Quality Score     : ${colorScore(bolt.qualityScore)}  ${colorGrade(bolt.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatBoltsTable(bolts)
 */
export function formatBoltsTable(bolts: SapphireBolt[]): string {
  if (bolts.length === 0) return chalk.gray('No sapphire bolts to display')
  return bolts.map(formatBoltTable).join('\n\n')
}

// ─── Cloud Table ───────────────────────────────────────────────────

/**
 * @example formatCloudTable(cloud)
 */
export function formatCloudTable(cloud: SapphireCloud): string {
  const lines: string[] = []
  lines.push(SAPPHIRE.bold(`${BULLET} ${cloud.directory}`))
  lines.push(`  Bolts          : ${cloud.bolts.length}`)
  lines.push(`  Avg Fury       : ${colorScore(cloud.avgFury)}`)
  lines.push(`  Avg Precision  : ${colorScore(cloud.avgPrecision)}`)
  lines.push(`  Avg Wisdom     : ${colorScore(cloud.avgWisdom)}`)
  lines.push(`  Perfect Storms : ${cloud.perfectStormCount}`)
  lines.push(`  Droughts       : ${cloud.droughtCount}`)
  lines.push(`  Cloud Type     : ${colorGrade(cloud.cloudType)}`)
  lines.push(`  Condition      : ${colorGrade(cloud.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatCloudsTable(clouds)
 */
export function formatCloudsTable(clouds: SapphireCloud[]): string {
  if (clouds.length === 0) return chalk.gray('No sapphire clouds to display')
  return clouds.map(formatCloudTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: SapphireStormResult['stats']): string {
  const lines: string[] = []
  lines.push(SAPPHIRE.bold('Sapphire Storm Statistics'))
  lines.push(`  Total Files        : ${stats.totalFiles}`)
  lines.push(`  Total Clouds       : ${stats.totalClouds}`)
  lines.push(`  Avg Gem Fury       : ${colorScore(stats.avgGemFury)}`)
  lines.push(`  Avg Strike Prec.   : ${colorScore(stats.avgStrikePrecision)}`)
  lines.push(`  Avg Lightning Clar.: ${colorScore(stats.avgLightningClarity)}`)
  lines.push(`  Avg Thunder Resil. : ${colorScore(stats.avgThunderResilience)}`)
  lines.push(`  Avg Rain Wisdom    : ${colorScore(stats.avgRainWisdom)}`)
  lines.push(`  Perfect Storm      : ${stats.perfectStormCount}`)
  lines.push(`  Mighty Tempest     : ${stats.mightyTempestCount}`)
  lines.push(`  Proper Thunderstorm: ${stats.properThunderstormCount}`)
  lines.push(`  Light Rain         : ${stats.lightRainCount}`)
  lines.push(`  Drizzle            : ${stats.drizzleCount}`)
  lines.push(`  Drought            : ${stats.droughtCount}`)
  lines.push(`  Overall Power      : ${colorScore(stats.overallPower)}`)
  lines.push(`  Meteorologist Grade: ${colorGrade(stats.meteorologistGrade)}`)
  lines.push(`  Best Bolt          : ${LIGHTNING(stats.bestBolt)}`)
  lines.push(`  Most Furious       : ${LIGHTNING(stats.mostFurious)}`)
  lines.push(`  Most Precise       : ${LIGHTNING(stats.mostPrecise)}`)
  lines.push(`  Clearest           : ${LIGHTNING(stats.clearest)}`)
  lines.push(`  Wisest             : ${LIGHTNING(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${LIGHTNING(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: SapphireStormResult): string {
  const sections: string[] = []

  sections.push(SAPPHIRE.bold('Sapphire Bolt Analysis'))
  sections.push(formatBoltsTable(result.bolts))
  sections.push('')
  sections.push(SAPPHIRE.bold('Sapphire Clouds'))
  sections.push(formatCloudsTable(result.clouds))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(SAPPHIRE.bold('Atmosphere'))
  sections.push(`  Avg Fury      : ${colorScore(result.atmosphere.avgFury)}`)
  sections.push(`  Avg Precision : ${colorScore(result.atmosphere.avgPrecision)}`)
  sections.push(`  Avg Wisdom    : ${colorScore(result.atmosphere.avgWisdom)}`)
  sections.push(`  Is Tempest    : ${result.atmosphere.isTempest ? SAPPHIRE.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Power : ${colorScore(result.atmosphere.overallPower)}`)
  sections.push('')
  sections.push(SAPPHIRE.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: SapphireStormResult): string {
  return JSON.stringify(result, null, 2)
}
