// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ClockworkGear, ClockworkTower, PhantomClockworkResult } from './phantom-clockwork-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(192, 192, 192)
const midHigh = chalk.rgb(205, 175, 149)
const mid = chalk.rgb(184, 134, 11)
const lowMid = chalk.rgb(139, 119, 101)
const low = chalk.rgb(100, 100, 100)

const best = chalk.rgb(192, 192, 192).bold
const good = chalk.rgb(205, 175, 149)
const okay = chalk.rgb(184, 134, 11)
const poor = chalk.rgb(139, 119, 101)
const worst = chalk.rgb(60, 60, 60)

const heading = chalk.rgb(192, 192, 192).bold
const label = chalk.rgb(205, 175, 149)
const dim = chalk.rgb(150, 150, 140)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // silver
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
 * colorGrade('atomic-clock') // best (silver bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'atomic-clock': best, 'perfect-mesh': best, 'ghost-proof': best,
    'perfect-tension': best, 'westminster': best, 'swiss-masterpiece': best,
    'big-ben': best, 'master-crafted': best, 'master-horologist': best,

    'chronometer': good, 'tight-gears': good, 'phantom-resistant': good,
    'well-wound': good, 'grand-father': good, 'precision-movement': good,
    'clock-tower': good, 'well-maintained': good, 'expert-watchmaker': good,

    'precision-watch': okay, 'proper-mesh': okay, 'proper-tolerance': okay,
    'proper-tension': okay, 'clear-bell': okay, 'proper-clockwork': okay,
    'grandfather-clock': okay, 'ticking-fine': okay, 'skilled-clockmaker': okay,

    'wall-clock': poor, 'loose-gears': poor, 'narrow-tolerance': poor,
    'over-wound': poor, 'muffled-chime': poor, 'rusty-mechanism': poor,
    'mantel-clock': poor, 'needs-oiling': poor, 'apprentice': poor,

    'sundial': worst, 'grinding': worst, 'zero-tolerance': worst,
    'slack-spring': worst, 'dull-thud': worst, 'jammed-gears': worst,
    'pocket-watch': worst, 'rusted': worst, 'tinkerer': worst,

    'broken-clock': worst, 'stripped-gears': worst, 'shattered': worst,
    'broken-spring': worst, 'silent': worst, 'stopped-clock': worst,
    'broken-timepiece': worst, 'stopped': worst, 'time-breaker': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Gear Formatting ───────────────────────────────────────────────

/**
 * Format a single gear for display
 * @example
 * formatGearTable(gear) // colored gear info
 */
export function formatGearTable(gear: ClockworkGear): string {
  const parts = [
    `${label('File:')} ${dim(gear.file)}`,
    `${label('Temporal Precision:')} ${colorScore(gear.temporalPrecision)} ${colorGrade(gear.timing.grade)}`,
    `${label('Gear Meshing:')} ${colorScore(gear.gearMeshing)} ${colorGrade(gear.meshing.mesh)}`,
    `${label('Ghost Tolerance:')} ${colorScore(gear.ghostTolerance)} ${colorGrade(gear.tolerating.phantom)}`,
    `${label('Spring Tension:')} ${colorScore(gear.springTension)} ${colorGrade(gear.tensioning.spring)}`,
    `${label('Chime Quality:')} ${colorScore(gear.chimeQuality)} ${colorGrade(gear.chiming.chime)}`,
    `${label('Score:')} ${colorScore(gear.qualityScore)} ${colorGrade(gear.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format gears as summary table
 * @example
 * formatGearsTable(gears) // multi-line table
 */
export function formatGearsTable(gears: ClockworkGear[]): string {
  if (gears.length === 0) return dim('No clockwork gears found')
  const header = heading('Clockwork Gear Analysis')
  const rows = gears.map(g => formatGearTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Tower Formatting ──────────────────────────────────────────────

/**
 * Format a tower for display
 * @example
 * formatTowerTable(tower) // colored tower info
 */
export function formatTowerTable(tower: ClockworkTower): string {
  const parts = [
    `${label('Tower:')} ${dim(tower.directory)}`,
    `${label('Type:')} ${colorGrade(tower.towerType)}`,
    `${label('Condition:')} ${colorGrade(tower.condition)}`,
    `${label('Gears:')} ${String(tower.gears.length)}`,
    `${label('Avg Precision:')} ${colorScore(tower.avgPrecision)}`,
    `${label('Avg Meshing:')} ${colorScore(tower.avgMeshing)}`,
    `${label('Avg Tension:')} ${colorScore(tower.avgTension)}`,
    `${label('Masterpieces:')} ${String(tower.masterpieceCount)}`,
    `${label('Stopped:')} ${String(tower.stoppedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all towers as summary
 * @example
 * formatTowersTable(towers) // multi-line tower summary
 */
export function formatTowersTable(towers: ClockworkTower[]): string {
  if (towers.length === 0) return dim('No clockwork towers found')
  const header = heading('Clockwork Tower Analysis')
  const rows = towers.map(t => formatTowerTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PhantomClockworkResult['stats']): string {
  const parts = [
    heading('Mechanism Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Towers:')} ${String(stats.totalTowers)}`,
    `${label('Avg Temporal Precision:')} ${colorScore(stats.avgTemporalPrecision)}`,
    `${label('Avg Gear Meshing:')} ${colorScore(stats.avgGearMeshing)}`,
    `${label('Avg Ghost Tolerance:')} ${colorScore(stats.avgGhostTolerance)}`,
    `${label('Avg Spring Tension:')} ${colorScore(stats.avgSpringTension)}`,
    `${label('Avg Chime Quality:')} ${colorScore(stats.avgChimeQuality)}`,
    `${label('Swiss Masterpieces:')} ${String(stats.swissMasterpieceCount)}`,
    `${label('Precision Movements:')} ${String(stats.precisionMovementCount)}`,
    `${label('Proper Clockwork:')} ${String(stats.properClockworkCount)}`,
    `${label('Rusty Mechanisms:')} ${String(stats.rustyMechanismCount)}`,
    `${label('Jammed Gears:')} ${String(stats.jammedGearsCount)}`,
    `${label('Stopped Clocks:')} ${String(stats.stoppedClockCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('High Mesh Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Tolerance:')} ${String(stats.hasHighToleranceCount)}`,
    `${label('High Tension:')} ${String(stats.hasHighTensionCount)}`,
    `${label('High Chime:')} ${String(stats.hasHighChimeCount)}`,
    `${label('Overall Precision:')} ${colorScore(stats.overallPrecision)}`,
    `${label('Horologist Grade:')} ${colorGrade(stats.horologistGrade)}`,
    `${label('Best Gear:')} ${stats.bestGear}`,
    `${label('Most Precise:')} ${stats.mostPrecise}`,
    `${label('Best Meshed:')} ${stats.bestMeshed}`,
    `${label('Most Tolerant:')} ${stats.mostTolerant}`,
    `${label('Best Tensioned:')} ${stats.bestTensioned}`,
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
  const items = recommendations.map(r => `${dim('•')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: PhantomClockworkResult): string {
  const sections = [
    formatGearsTable(result.gears),
    '',
    formatTowersTable(result.towers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Mechanism')} ${label('Running:')} ${result.mechanism.isRunning ? high('Yes') : low('No')} ${label('Overall Precision:')} ${colorScore(result.mechanism.overallPrecision)}`,
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
export function formatResultJson(result: PhantomClockworkResult): string {
  return JSON.stringify(result, null, 2)
}
