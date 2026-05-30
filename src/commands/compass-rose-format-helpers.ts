// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ChalkInstance } from 'chalk'
import type { CompassBearing, NavigationChart, CompassRoseResult } from './compass-rose-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(0, 200, 255)
const midHigh = chalk.rgb(0, 165, 220)
const mid = chalk.rgb(0, 130, 185)
const lowMid = chalk.rgb(0, 100, 150)
const low = chalk.rgb(0, 70, 115)

const best = chalk.rgb(100, 220, 255).bold
const good = chalk.rgb(50, 195, 245)
const okay = chalk.rgb(0, 165, 220)
const poor = chalk.rgb(0, 130, 190)
const worst = chalk.rgb(0, 100, 160)

const heading = chalk.rgb(0, 210, 255).bold
const label = chalk.rgb(0, 175, 230)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // compass blue
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
 * colorGrade('master-navigator') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, ChalkInstance> = {
    'true-north': best, 'gyroscopic': best, 'gps-grade': best, 'rock-steady': best, 'detailed-chart': best,
    'master-navigator': best, 'admiralty-chart': best, 'fleet-admiral': best, 'chart-room': best,

    'clear-bearing': good, 'magnetic-north': good, 'clear-charts': good, 'stable-platform': good, 'proper-map': good,
    'skilled-pilot': good, 'nautical-map': good, 'sea-captain': good, 'navigation-station': good,

    'proper-heading': okay, 'proper-compass': okay, 'proper-maps': okay, 'proper-gyroscope': okay, 'basic-sketch': okay,
    'proper-helmsman': okay, 'coastal-guide': okay, 'first-mate': okay, 'wheelhouse': okay,

    'uncertain-direction': poor, 'wobbly-needle': poor, 'vague-directions': poor, 'wobbling': poor, 'rough-outline': poor,
    'lost-sailor': poor, 'sketch-map': poor, 'deck-hand': poor, 'deck': poor,

    'lost-bearing': worst, 'spinning-needle': worst, 'no-signs': worst, 'tilting': worst, 'mental-map': worst,
    'drifting-raft': worst, 'scratched-rock': worst, 'cabin-boy': worst, 'lifeboat': worst,

    'spinning-compass': worst, 'broken-compass': worst, 'unmarked-trail': worst, 'tumbling': worst, 'no-map': worst,
    'shipwreck': worst, 'blank-page': worst, 'landlubber': worst, 'adrift': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Bearing Formatting ────────────────────────────────────────────

/**
 * Format a single bearing for display
 * @example
 * formatBearingTable(bearing) // colored bearing info
 */
export function formatBearingTable(bearing: CompassBearing): string {
  const parts = [
    `${label('File:')} ${dim(bearing.file)}`,
    `${label('Directional Clarity:')} ${colorScore(bearing.directionalClarity)} ${colorGrade(bearing.directing.grade)}`,
    `${label('Bearing Accuracy:')} ${colorScore(bearing.bearingAccuracy)} ${colorGrade(bearing.bearing.compass)}`,
    `${label('Navigation Quality:')} ${colorScore(bearing.navigationQuality)} ${colorGrade(bearing.navigating.nav)}`,
    `${label('Orientation Stability:')} ${colorScore(bearing.orientationStability)} ${colorGrade(bearing.orienting.orientation)}`,
    `${label('Charting Precision:')} ${colorScore(bearing.chartingPrecision)} ${colorGrade(bearing.charting.chart)}`,
    `${label('Score:')} ${colorScore(bearing.qualityScore)} ${colorGrade(bearing.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format bearings as summary table
 * @example
 * formatBearingsTable(bearings) // multi-line table
 */
export function formatBearingsTable(bearings: CompassBearing[]): string {
  if (bearings.length === 0) return dim('No compass bearings found')
  const header = heading('Compass Rose Analysis')
  const rows = bearings.map(b => formatBearingTable(b))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Chart Formatting ──────────────────────────────────────────────

/**
 * Format a chart for display
 * @example
 * formatChartTable(chart) // colored chart info
 */
export function formatChartTable(chart: NavigationChart): string {
  const parts = [
    `${label('Chart:')} ${dim(chart.directory)}`,
    `${label('Type:')} ${colorGrade(chart.chartType)}`,
    `${label('Condition:')} ${colorGrade(chart.condition)}`,
    `${label('Bearings:')} ${String(chart.bearings.length)}`,
    `${label('Avg Clarity:')} ${colorScore(chart.avgClarity)}`,
    `${label('Avg Accuracy:')} ${colorScore(chart.avgAccuracy)}`,
    `${label('Avg Stability:')} ${colorScore(chart.avgStability)}`,
    `${label('Master Navigator:')} ${String(chart.masterNavigatorCount)}`,
    `${label('Shipwreck:')} ${String(chart.shipwreckCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all charts as summary
 * @example
 * formatChartsTable(charts) // multi-line chart summary
 */
export function formatChartsTable(charts: NavigationChart[]): string {
  if (charts.length === 0) return dim('No navigation charts found')
  const header = heading('Navigation Chart Analysis')
  const rows = charts.map(c => formatChartTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CompassRoseResult['stats']): string {
  const parts = [
    heading('Fleet Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Charts:')} ${String(stats.totalCharts)}`,
    `${label('Avg Directional Clarity:')} ${colorScore(stats.avgDirectionalClarity)}`,
    `${label('Avg Bearing Accuracy:')} ${colorScore(stats.avgBearingAccuracy)}`,
    `${label('Avg Navigation Quality:')} ${colorScore(stats.avgNavigationQuality)}`,
    `${label('Avg Orientation Stability:')} ${colorScore(stats.avgOrientationStability)}`,
    `${label('Avg Charting Precision:')} ${colorScore(stats.avgChartingPrecision)}`,
    `${label('Master Navigator:')} ${String(stats.masterNavigatorCount)}`,
    `${label('Skilled Pilot:')} ${String(stats.skilledPilotCount)}`,
    `${label('Proper Helmsman:')} ${String(stats.properHelmsmanCount)}`,
    `${label('Lost Sailor:')} ${String(stats.lostSailorCount)}`,
    `${label('Drifting Raft:')} ${String(stats.driftingRaftCount)}`,
    `${label('Shipwreck:')} ${String(stats.shipwreckCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Accuracy:')} ${String(stats.hasHighAccuracyCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('Overall Navigation:')} ${colorScore(stats.overallNavigation)}`,
    `${label('Captain Grade:')} ${colorGrade(stats.captainGrade)}`,
    `${label('Best Bearing:')} ${stats.bestBearing}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Accurate:')} ${stats.mostAccurate}`,
    `${label('Most Navigable:')} ${stats.mostNavigable}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
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
export function formatResultTable(result: CompassRoseResult): string {
  const sections = [
    formatBearingsTable(result.bearings),
    '',
    formatChartsTable(result.charts),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Fleet')} ${label('Navigable:')} ${result.fleet.isNavigable ? high('Yes') : low('No')} ${label('Overall Navigation:')} ${colorScore(result.fleet.overallNavigation)}`,
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
export function formatResultJson(result: CompassRoseResult): string {
  return JSON.stringify(result, null, 2)
}
