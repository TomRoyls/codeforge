// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { LanternLight, LanternStation, StormLanternResult } from './storm-lantern-helpers.js'

// ─── Color Palette (lantern) ───────────────────────────────────────
const high = chalk.rgb(255, 210, 80)
const midHigh = chalk.rgb(240, 190, 60)
const mid = chalk.rgb(220, 170, 40)
const lowMid = chalk.rgb(190, 140, 30)
const low = chalk.rgb(160, 120, 25)

const best = chalk.rgb(255, 230, 100).bold
const good = chalk.rgb(250, 210, 80)
const okay = chalk.rgb(230, 185, 60)
const poor = chalk.rgb(200, 155, 45)
const worst = chalk.rgb(170, 130, 35)

const heading = chalk.rgb(255, 220, 90).bold
const label = chalk.rgb(240, 200, 70)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // warm gold
 */
export function colorScore(score: number): string {
  if (score >= 80) return high(String(score))
  if (score >= 60) return midHigh(String(score))
  if (score >= 40) return mid(String(score))
  if (score >= 20) return lowMid(String(score))
  return low(String(score))
}

/**
 * Color a grade/tier string by quality
 * @example
 * colorGrade('eternal-flame') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'lighthouse-beam': best, 'hurricane-proof': best, 'perpetual-flame': best,
    'crystal-clear': best, 'lighthouse-range': best, 'eternal-flame': best,
    'lighthouse': best, 'blazing-station': best, 'lighthouse-keeper': best,

    'bright-flame': good, 'storm-resistant': good, 'efficient-burn': good,
    'clean-glass': good, 'far-beacon': good, 'bright-lantern': good,
    'watchtower': good, 'well-lit': good, 'lamp-lighter': good,

    'proper-glow': okay, 'proper-shield': okay, 'proper-consumption': okay,
    'proper-lens': okay, 'proper-range': okay, 'proper-light': okay,
    'lamp-post': okay, 'decent-light': okay, 'watchman': okay,

    'dim-light': poor, 'blown-out': poor, 'wasteful-burn': poor,
    'foggy-glass': poor, 'short-range': poor, 'dying-ember': poor,
    'candle-holder': poor, 'dim-corner': poor, 'candle-maker': poor,

    'flickering': worst, 'flickering-wildly': worst, 'guzzling': worst,
    'smudged': worst, 'dim-bulb': worst, 'smoking-wick': worst,
    'match-stick': worst, 'dark-alley': worst, 'match-girl': worst,

    'dark': worst, 'extinguished': worst, 'empty-tank': worst,
    'opaque': worst, 'no-signal': worst, 'darkness': worst,
    'no-light': worst, 'blackout': worst, 'dark-dweller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Light Formatting ─────────────────────────────────────────────

/**
 * Format a single light for display
 * @example
 * formatLightTable(light) // colored light info
 */
export function formatLightTable(light: LanternLight): string {
  const parts = [
    `${label('File:')} ${dim(light.file)}`,
    `${label('Illumination:')} ${colorScore(light.illuminationStrength)} ${colorGrade(light.illuminating.grade)}`,
    `${label('Wind Resistance:')} ${colorScore(light.windResistance)} ${colorGrade(light.resisting.wind)}`,
    `${label('Fuel Efficiency:')} ${colorScore(light.fuelEfficiency)} ${colorGrade(light.optimizing.fuel)}`,
    `${label('Glass Clarity:')} ${colorScore(light.glassClarity)} ${colorGrade(light.clarifying.glass)}`,
    `${label('Beacon Range:')} ${colorScore(light.beaconRange)} ${colorGrade(light.reaching.beacon)}`,
    `${label('Score:')} ${colorScore(light.qualityScore)} ${colorGrade(light.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format lights as summary table
 * @example
 * formatLightsTable(lights) // multi-line table
 */
export function formatLightsTable(lights: LanternLight[]): string {
  if (lights.length === 0) return dim('No lantern lights found')
  const header = heading('Storm Lantern Analysis')
  const rows = lights.map(l => formatLightTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Station Formatting ────────────────────────────────────────────

/**
 * Format a station for display
 * @example
 * formatStationTable(station) // colored station info
 */
export function formatStationTable(station: LanternStation): string {
  const parts = [
    `${label('Station:')} ${dim(station.directory)}`,
    `${label('Type:')} ${colorGrade(station.stationType)}`,
    `${label('Condition:')} ${colorGrade(station.condition)}`,
    `${label('Lights:')} ${String(station.lights.length)}`,
    `${label('Avg Illumination:')} ${colorScore(station.avgIllumination)}`,
    `${label('Avg Resistance:')} ${colorScore(station.avgResistance)}`,
    `${label('Avg Efficiency:')} ${colorScore(station.avgEfficiency)}`,
    `${label('Eternal Flames:')} ${String(station.eternalFlameCount)}`,
    `${label('Darkness:')} ${String(station.darknessCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all stations as summary
 * @example
 * formatStationsTable(stations) // multi-line station summary
 */
export function formatStationsTable(stations: LanternStation[]): string {
  if (stations.length === 0) return dim('No lantern stations found')
  const header = heading('Lantern Station Analysis')
  const rows = stations.map(s => formatStationTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: StormLanternResult['stats']): string {
  const parts = [
    heading('Storm Lantern Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Stations:')} ${String(stats.totalStations)}`,
    `${label('Avg Illumination:')} ${colorScore(stats.avgIlluminationStrength)}`,
    `${label('Avg Wind Resistance:')} ${colorScore(stats.avgWindResistance)}`,
    `${label('Avg Fuel Efficiency:')} ${colorScore(stats.avgFuelEfficiency)}`,
    `${label('Avg Glass Clarity:')} ${colorScore(stats.avgGlassClarity)}`,
    `${label('Avg Beacon Range:')} ${colorScore(stats.avgBeaconRange)}`,
    `${label('Eternal Flame:')} ${String(stats.eternalFlameCount)}`,
    `${label('Bright Lantern:')} ${String(stats.brightLanternCount)}`,
    `${label('Proper Light:')} ${String(stats.properLightCount)}`,
    `${label('Dying Ember:')} ${String(stats.dyingEmberCount)}`,
    `${label('Smoking Wick:')} ${String(stats.smokingWickCount)}`,
    `${label('Darkness:')} ${String(stats.darknessCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('High Efficiency:')} ${String(stats.hasHighEfficiencyCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Range:')} ${String(stats.hasHighRangeCount)}`,
    `${label('Overall Brightness:')} ${colorScore(stats.overallBrightness)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Light:')} ${stats.bestLight}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Most Resistant:')} ${stats.mostResistant}`,
    `${label('Most Efficient:')} ${stats.mostEfficient}`,
    `${label('Clearest:')} ${stats.clearest}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: StormLanternResult): string {
  const sections = [
    formatLightsTable(result.lights),
    '',
    formatStationsTable(result.stations),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Network')} ${label('Lit:')} ${result.network.isLit ? high('Yes') : low('No')} ${label('Overall Brightness:')} ${colorScore(result.network.overallBrightness)}`,
    '',
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format complete result as JSON
 * @example
 * formatResultJson(result) // JSON string
 */
export function formatResultJson(result: StormLanternResult): string {
  return JSON.stringify(result, null, 2)
}
