// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { HighwayNeon, HighwaySystem, NeonHighwayResult } from './neon-highway-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(0, 255, 200)
const midHigh = chalk.rgb(0, 210, 180)
const mid = chalk.rgb(0, 170, 150)
const lowMid = chalk.rgb(0, 130, 120)
const low = chalk.rgb(0, 90, 80)

const best = chalk.rgb(50, 255, 220).bold
const good = chalk.rgb(0, 220, 200)
const okay = chalk.rgb(0, 180, 170)
const poor = chalk.rgb(0, 140, 130)
const worst = chalk.rgb(0, 100, 90)

const heading = chalk.rgb(0, 240, 210).bold
const label = chalk.rgb(0, 200, 185)
const dim = chalk.rgb(140, 160, 160)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // neon cyan
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
 * colorGrade('neon-boulevard') // best (bold cyan)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'blinding-neon': best, 'autobahn': best, 'perfect-lane': best, 'green-wave': best, 'optimal-path': best,
    'neon-boulevard': best, 'interstate': best, 'highway-engineer': best,

    'bright-highway': good, 'expressway': good, 'proper-lane': good, 'clear-signals': good, 'efficient-route': good,
    'lit-road': good, 'state-highway': good, 'traffic-engineer': good,

    'proper-glow': okay, 'highway': okay, 'decent-lane': okay, 'proper-signs': okay, 'proper-path': okay,
    'county-road': okay, 'road-designer': okay,

    'dim-lights': poor, 'city-street': poor, 'wobbly-lane': poor, 'flickering-signals': poor, 'detour': poor,
    'dark-alley': poor, 'surveyor': poor,

    'flickering': worst, 'dirt-road': worst, 'weaving': worst, 'mixed-signals': worst, 'scenic-route': worst,
    'abandoned-road': worst, 'no-road': worst, 'impassable': worst, 'pothole': worst,

    'dark-road': worst, 'gridlock': worst, 'wrong-way': worst, 'no-signals': worst, 'dead-end': worst,
    'goat-path': worst, 'apprentice': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Neon Formatting ───────────────────────────────────────────────

/**
 * Format a single neon for display
 * @example
 * formatNeonTable(neon) // colored neon info
 */
export function formatNeonTable(neon: HighwayNeon): string {
  const parts = [
    `${label('File:')} ${dim(neon.file)}`,
    `${label('Luminosity:')} ${colorScore(neon.luminosity)} ${colorGrade(neon.illuminating.grade)}`,
    `${label('Traffic Flow:')} ${colorScore(neon.trafficFlow)} ${colorGrade(neon.flowing.flow)}`,
    `${label('Lane Discipline:')} ${colorScore(neon.laneDiscipline)} ${colorGrade(neon.disciplining.lane)}`,
    `${label('Signal Quality:')} ${colorScore(neon.signalQuality)} ${colorGrade(neon.signaling.signal)}`,
    `${label('Route Efficiency:')} ${colorScore(neon.routeEfficiency)} ${colorGrade(neon.routing.route)}`,
    `${label('Score:')} ${colorScore(neon.qualityScore)} ${colorGrade(neon.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format neons as summary table
 * @example
 * formatNeonsTable(neons) // multi-line table
 */
export function formatNeonsTable(neons: HighwayNeon[]): string {
  if (neons.length === 0) return dim('No highway neons found')
  const header = heading('Neon Highway Analysis')
  const rows = neons.map(n => formatNeonTable(n))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── System Formatting ─────────────────────────────────────────────

/**
 * Format a system for display
 * @example
 * formatSystemTable(system) // colored system info
 */
export function formatSystemTable(system: HighwaySystem): string {
  const parts = [
    `${label('System:')} ${dim(system.directory)}`,
    `${label('Type:')} ${colorGrade(system.systemType)}`,
    `${label('Condition:')} ${colorGrade(system.condition)}`,
    `${label('Neons:')} ${String(system.neons.length)}`,
    `${label('Avg Luminosity:')} ${colorScore(system.avgLuminosity)}`,
    `${label('Avg Flow:')} ${colorScore(system.avgFlow)}`,
    `${label('Avg Efficiency:')} ${colorScore(system.avgEfficiency)}`,
    `${label('Neon Boulevard:')} ${String(system.neonBoulevardCount)}`,
    `${label('Abandoned Road:')} ${String(system.abandonedRoadCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all systems as summary
 * @example
 * formatSystemsTable(systems) // multi-line system summary
 */
export function formatSystemsTable(systems: HighwaySystem[]): string {
  if (systems.length === 0) return dim('No highway systems found')
  const header = heading('Highway System Analysis')
  const rows = systems.map(s => formatSystemTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: NeonHighwayResult['stats']): string {
  const parts = [
    heading('Network Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Systems:')} ${String(stats.totalSystems)}`,
    `${label('Avg Luminosity:')} ${colorScore(stats.avgLuminosity)}`,
    `${label('Avg Traffic Flow:')} ${colorScore(stats.avgTrafficFlow)}`,
    `${label('Avg Lane Discipline:')} ${colorScore(stats.avgLaneDiscipline)}`,
    `${label('Avg Signal Quality:')} ${colorScore(stats.avgSignalQuality)}`,
    `${label('Avg Route Efficiency:')} ${colorScore(stats.avgRouteEfficiency)}`,
    `${label('Neon Boulevard:')} ${String(stats.neonBoulevardCount)}`,
    `${label('Bright Highway:')} ${String(stats.brightHighwayCount)}`,
    `${label('Lit Road:')} ${String(stats.litRoadCount)}`,
    `${label('Dim Street:')} ${String(stats.dimStreetCount)}`,
    `${label('Dark Alley:')} ${String(stats.darkAlleyCount)}`,
    `${label('Abandoned Road:')} ${String(stats.abandonedRoadCount)}`,
    `${label('High Luminosity:')} ${String(stats.hasHighLuminosityCount)}`,
    `${label('High Flow Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Discipline:')} ${String(stats.hasHighDisciplineCount)}`,
    `${label('High Signal:')} ${String(stats.hasHighSignalCount)}`,
    `${label('High Efficiency:')} ${String(stats.hasHighEfficiencyCount)}`,
    `${label('Overall Performance:')} ${colorScore(stats.overallPerformance)}`,
    `${label('Engineer Grade:')} ${colorGrade(stats.engineerGrade)}`,
    `${label('Best Neon:')} ${stats.bestNeon}`,
    `${label('Brightest:')} ${stats.brightest}`,
    `${label('Smoothest:')} ${stats.smoothest}`,
    `${label('Most Disciplined:')} ${stats.mostDisciplined}`,
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
export function formatResultTable(result: NeonHighwayResult): string {
  const sections = [
    formatNeonsTable(result.neons),
    '',
    formatSystemsTable(result.systems),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Network')} ${label('Flowing:')} ${result.network.isFlowing ? high('Yes') : low('No')} ${label('Overall Performance:')} ${colorScore(result.network.overallPerformance)}`,
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
export function formatResultJson(result: NeonHighwayResult): string {
  return JSON.stringify(result, null, 2)
}
