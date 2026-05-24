// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { JadePoint, MeridianPath, JadeMeridianResult } from './jade-meridian-helpers.js'

// ─── Color Palette (jade meridian — green/jade/emerald) ────────────
const high = chalk.rgb(100, 220, 140)
const midHigh = chalk.rgb(80, 195, 120)
const mid = chalk.rgb(60, 170, 100)
const lowMid = chalk.rgb(50, 145, 85)
const low = chalk.rgb(40, 120, 70)

const best = chalk.rgb(130, 240, 160).bold
const good = chalk.rgb(105, 215, 140)
const okay = chalk.rgb(80, 185, 115)
const poor = chalk.rgb(60, 155, 95)
const worst = chalk.rgb(45, 125, 75)

const heading = chalk.rgb(120, 230, 150).bold
const label = chalk.rgb(90, 200, 130)
const dim = chalk.rgb(70, 165, 105)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright jade
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
 * colorGrade('grandmaster-art') // best (bold jade)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'unobstructed-flow': best, 'perfect-balance': best, 'vital-chi': best,
    'master-healer': best, 'symphony-of-code': best, 'grandmaster-art': best,
    'master-meridian': best, 'flowing-harmony': best, 'grandmaster': best,

    'smooth-current': good, 'harmonious-yin-yang': good, 'strong-energy': good,
    'precise-touch': good, 'harmonic-system': good, 'healing-jade': good,
    'proper-channel': good, 'balanced-energy': good, 'master-healer': good,

    'proper-flow': okay, 'proper-balance': okay, 'proper-vitality': okay,
    'proper-targeting': okay, 'proper-resonance': okay, 'proper-meridian': okay,
    'decent-pathway': okay, 'decent-flow': okay, 'skilled-practitioner': okay,

    'blocked-channel': poor, 'imbalanced-meridian': poor, 'weak-chi': poor,
    'approximate-aim': poor, 'dissonant-code': poor, 'dull-stone': poor,
    'blocked-route': poor, 'stagnant-channel': poor, 'apprentice': poor,

    'stagnant-energy': worst, 'no-balance': worst, 'depleted-energy': worst,
    'missed-point': worst, 'cacophony': worst, 'cracked-jade': worst,
    'broken-channel': worst, 'blocked': worst, 'novice': worst,

    'no-flow': worst, 'no-chi': worst, 'no-precision': worst,
    'silence': worst, 'gravel': worst, 'no-path': worst,
    'void': worst, 'quack': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Point Formatting ─────────────────────────────────────────────

/**
 * Format a single jade point for display
 * @example
 * formatPointTable(point) // colored point info
 */
export function formatPointTable(point: JadePoint): string {
  const parts = [
    `${label('File:')} ${dim(point.file)}`,
    `${label('Energy Flow:')} ${colorScore(point.energyFlow)} ${colorGrade(point.flowing.grade)}`,
    `${label('Meridian Balance:')} ${colorScore(point.meridianBalance)} ${colorGrade(point.balancing.meridian)}`,
    `${label('Chi Vitality:')} ${colorScore(point.chiVitality)} ${colorGrade(point.vitalizing.chi)}`,
    `${label('Acu-Point Precision:')} ${colorScore(point.acuPointPrecision)} ${colorGrade(point.precisioning.acupoint)}`,
    `${label('Harmonic Resonance:')} ${colorScore(point.harmonicResonance)} ${colorGrade(point.harmonizing.harmonic)}`,
    `${label('Score:')} ${colorScore(point.qualityScore)} ${colorGrade(point.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format points as summary table
 * @example
 * formatPointsTable(points) // multi-line table
 */
export function formatPointsTable(points: JadePoint[]): string {
  if (points.length === 0) return dim('No jade points found')
  const header = heading('Jade Meridian Analysis')
  const rows = points.map(p => formatPointTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Path Formatting ──────────────────────────────────────────────

/**
 * Format a single meridian path for display
 * @example
 * formatPathTable(path) // colored path info
 */
export function formatPathTable(mp: MeridianPath): string {
  const parts = [
    `${label('Path:')} ${dim(mp.directory)}`,
    `${label('Type:')} ${colorGrade(mp.pathType)}`,
    `${label('Condition:')} ${colorGrade(mp.condition)}`,
    `${label('Points:')} ${String(mp.points.length)}`,
    `${label('Avg Energy:')} ${colorScore(mp.avgEnergy)}`,
    `${label('Avg Balance:')} ${colorScore(mp.avgBalance)}`,
    `${label('Avg Resonance:')} ${colorScore(mp.avgResonance)}`,
    `${label('Grandmaster Art:')} ${String(mp.grandmasterArtCount)}`,
    `${label('Gravel:')} ${String(mp.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all meridian paths as summary
 * @example
 * formatPathsTable(paths) // multi-line summary
 */
export function formatPathsTable(paths: MeridianPath[]): string {
  if (paths.length === 0) return dim('No meridian paths found')
  const header = heading('Meridian Paths')
  const rows = paths.map(p => formatPathTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: JadeMeridianResult['stats']): string {
  const parts = [
    heading('Jade Meridian Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Paths:')} ${String(stats.totalPaths)}`,
    `${label('Avg Energy Flow:')} ${colorScore(stats.avgEnergyFlow)}`,
    `${label('Avg Meridian Balance:')} ${colorScore(stats.avgMeridianBalance)}`,
    `${label('Avg Chi Vitality:')} ${colorScore(stats.avgChiVitality)}`,
    `${label('Avg Acu-Point Precision:')} ${colorScore(stats.avgAcuPointPrecision)}`,
    `${label('Avg Harmonic Resonance:')} ${colorScore(stats.avgHarmonicResonance)}`,
    `${label('Grandmaster Art:')} ${String(stats.grandmasterArtCount)}`,
    `${label('Healing Jade:')} ${String(stats.healingJadeCount)}`,
    `${label('Proper Meridian:')} ${String(stats.properMeridianCount)}`,
    `${label('Dull Stone:')} ${String(stats.dullStoneCount)}`,
    `${label('Cracked Jade:')} ${String(stats.crackedJadeCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Energy:')} ${String(stats.hasHighEnergyCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Resonance:')} ${String(stats.hasHighResonanceCount)}`,
    `${label('Overall Vitality:')} ${colorScore(stats.overallVitality)}`,
    `${label('Healer Grade:')} ${colorGrade(stats.healerGrade)}`,
    `${label('Best Point:')} ${stats.bestPoint}`,
    `${label('Most Flowing:')} ${stats.mostFlowing}`,
    `${label('Most Balanced:')} ${stats.mostBalanced}`,
    `${label('Most Vital:')} ${stats.mostVital}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2663')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: JadeMeridianResult): string {
  const sections = [
    formatPointsTable(result.points),
    '',
    formatPathsTable(result.paths),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Body')} ${label('Harmonious:')} ${result.body.isHarmonious ? high('Yes') : low('No')} ${label('Overall Vitality:')} ${colorScore(result.body.overallVitality)}`,
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
export function formatResultJson(result: JadeMeridianResult): string {
  return JSON.stringify(result, null, 2)
}
