// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AuroraCurtain, AuroraBelt, AuroraBorealisResult } from './aurora-borealis-helpers.js'

// ─── Color Palette (aurora green/cyan) ──────────────────────────────
const high = chalk.rgb(100, 255, 180)
const midHigh = chalk.rgb(80, 230, 160)
const mid = chalk.rgb(60, 200, 140)
const lowMid = chalk.rgb(40, 170, 120)
const low = chalk.rgb(20, 140, 100)

const best = chalk.rgb(130, 255, 200).bold
const good = chalk.rgb(110, 240, 185)
const okay = chalk.rgb(90, 215, 165)
const poor = chalk.rgb(70, 185, 145)
const worst = chalk.rgb(50, 155, 125)

const heading = chalk.rgb(120, 250, 195).bold
const label = chalk.rgb(100, 225, 170)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // aurora green
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
 * colorGrade('northern-lights') // best (bold green)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'brilliant-aurora': best, 'full-spectrum': best, 'true-north': best, 'graceful-waltz': best, 'symphony': best,
    'northern-lights': best, 'polar-belt': best, 'spectacular-display': best, 'chief-astronomer': best,

    'bright-curtain': good, 'rich-palette': good, 'strong-field': good, 'flowing-ballet': good, 'harmonic-convergence': good,
    'bright-aurora': good, 'auroral-zone': good, 'beautiful-show': good, 'aurora-hunter': good,

    'proper-glow': okay, 'proper-colors': okay, 'proper-alignment': okay, 'proper-rhythm': okay, 'proper-harmony': okay,
    'proper-curtain': okay, 'sub-auroral': okay, 'decent-display': okay, 'northern-lighter': okay,

    'dim-light': poor, 'limited-palette': poor, 'weak-field': poor, 'stiff-march': poor, 'slight-dissonance': poor,
    'faint-glow': poor, 'mid-latitude': poor, 'faint-glow-belt': poor, 'sky-watcher': poor,

    'faint-shimmer': worst, 'monochrome': worst, 'misaligned': worst, 'awkward-stumble': worst, 'cacophony': worst,
    'twilight': worst, 'tropical': worst, 'barely-visible': worst, 'stargazer': worst,

    'dark-sky': worst, 'colorless': worst, 'no-field': worst, 'static': worst, 'chaos': worst,
    'dark-night': worst, 'equatorial': worst, 'invisible': worst, 'cave-dweller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Curtain Formatting ────────────────────────────────────────────

/**
 * Format a single curtain for display
 * @example
 * formatCurtainTable(curtain) // colored curtain info
 */
export function formatCurtainTable(curtain: AuroraCurtain): string {
  const parts = [
    `${label('File:')} ${dim(curtain.file)}`,
    `${label('Luminosity:')} ${colorScore(curtain.luminosity)} ${colorGrade(curtain.shining.grade)}`,
    `${label('Spectral Richness:')} ${colorScore(curtain.spectralRichness)} ${colorGrade(curtain.enriching.spectrum)}`,
    `${label('Magnetic Alignment:')} ${colorScore(curtain.magneticAlignment)} ${colorGrade(curtain.aligning.field)}`,
    `${label('Dance Quality:')} ${colorScore(curtain.danceQuality)} ${colorGrade(curtain.dancing.dance)}`,
    `${label('Cosmic Harmony:')} ${colorScore(curtain.cosmicHarmony)} ${colorGrade(curtain.harmonizing.cosmic)}`,
    `${label('Score:')} ${colorScore(curtain.qualityScore)} ${colorGrade(curtain.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format curtains as summary table
 * @example
 * formatCurtainsTable(curtains) // multi-line table
 */
export function formatCurtainsTable(curtains: AuroraCurtain[]): string {
  if (curtains.length === 0) return dim('No aurora curtains found')
  const header = heading('Aurora Borealis Curtain Analysis')
  const rows = curtains.map(c => formatCurtainTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Belt Formatting ──────────────────────────────────────────────

/**
 * Format a belt for display
 * @example
 * formatBeltTable(belt) // colored belt info
 */
export function formatBeltTable(belt: AuroraBelt): string {
  const parts = [
    `${label('Belt:')} ${dim(belt.directory)}`,
    `${label('Type:')} ${colorGrade(belt.beltType)}`,
    `${label('Condition:')} ${colorGrade(belt.condition)}`,
    `${label('Curtains:')} ${String(belt.curtains.length)}`,
    `${label('Avg Luminosity:')} ${colorScore(belt.avgLuminosity)}`,
    `${label('Avg Alignment:')} ${colorScore(belt.avgAlignment)}`,
    `${label('Avg Harmony:')} ${colorScore(belt.avgHarmony)}`,
    `${label('Northern Lights:')} ${String(belt.northernLightsCount)}`,
    `${label('Dark Night:')} ${String(belt.darkNightCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all belts as summary
 * @example
 * formatBeltsTable(belts) // multi-line belt summary
 */
export function formatBeltsTable(belts: AuroraBelt[]): string {
  if (belts.length === 0) return dim('No aurora belts found')
  const header = heading('Aurora Belt Analysis')
  const rows = belts.map(b => formatBeltTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AuroraBorealisResult['stats']): string {
  const parts = [
    heading('Aurora Borealis Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Belts:')} ${String(stats.totalBelts)}`,
    `${label('Avg Luminosity:')} ${colorScore(stats.avgLuminosity)}`,
    `${label('Avg Spectral Richness:')} ${colorScore(stats.avgSpectralRichness)}`,
    `${label('Avg Magnetic Alignment:')} ${colorScore(stats.avgMagneticAlignment)}`,
    `${label('Avg Dance Quality:')} ${colorScore(stats.avgDanceQuality)}`,
    `${label('Avg Cosmic Harmony:')} ${colorScore(stats.avgCosmicHarmony)}`,
    `${label('Northern Lights:')} ${String(stats.northernLightsCount)}`,
    `${label('Bright Aurora:')} ${String(stats.brightAuroraCount)}`,
    `${label('Proper Curtain:')} ${String(stats.properCurtainCount)}`,
    `${label('Faint Glow:')} ${String(stats.faintGlowCount)}`,
    `${label('Twilight:')} ${String(stats.twilightCount)}`,
    `${label('Dark Night:')} ${String(stats.darkNightCount)}`,
    `${label('High Luminosity:')} ${String(stats.hasHighLuminosityCount)}`,
    `${label('High Richness:')} ${String(stats.hasHighRichnessCount)}`,
    `${label('High Alignment:')} ${String(stats.hasHighAlignmentCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('Overall Radiance:')} ${colorScore(stats.overallRadiance)}`,
    `${label('Astronomer Grade:')} ${colorGrade(stats.astronomerGrade)}`,
    `${label('Best Curtain:')} ${stats.bestCurtain}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Most Colorful:')} ${stats.mostColorful}`,
    `${label('Most Aligned:')} ${stats.mostAligned}`,
    `${label('Most Graceful:')} ${stats.mostGraceful}`,
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
export function formatResultTable(result: AuroraBorealisResult): string {
  const sections = [
    formatCurtainsTable(result.curtains),
    '',
    formatBeltsTable(result.belts),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sky')} ${label('Luminous:')} ${result.sky.isLuminous ? high('Yes') : low('No')} ${label('Overall Radiance:')} ${colorScore(result.sky.overallRadiance)}`,
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
export function formatResultJson(result: AuroraBorealisResult): string {
  return JSON.stringify(result, null, 2)
}
