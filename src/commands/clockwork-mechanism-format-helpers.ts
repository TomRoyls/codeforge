import chalk from 'chalk'
import type {
  ClockworkGear,
  ClockTower,
  AtelierMeasure,
  ClockworkMechanismStats,
  ClockworkMechanismResult,
  GearCondition,
  TowerType,
  TowerCondition,
  HorologistGrade,
} from './clockwork-mechanism-helpers.js'

const gearConditionColor: Record<GearCondition, (t: string) => string> = {
  'grand-complication': (t: string) => chalk.rgb(46, 204, 113)(t),
  'chronometer': (t: string) => chalk.rgb(52, 152, 219)(t),
  'precision-watch': (t: string) => chalk.rgb(241, 196, 15)(t),
  'standard-clock': (t: string) => chalk.rgb(230, 126, 34)(t),
  'pocket-watch': (t: string) => chalk.rgb(231, 76, 60)(t),
  'broken-clock': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const towerTypeColor: Record<TowerType, (t: string) => string> = {
  'observatory-clock': (t: string) => chalk.rgb(46, 204, 113)(t),
  'church-clock': (t: string) => chalk.rgb(52, 152, 219)(t),
  'town-clock': (t: string) => chalk.rgb(241, 196, 15)(t),
  'mantel-clock': (t: string) => chalk.rgb(230, 126, 34)(t),
  'cuckoo-clock': (t: string) => chalk.rgb(231, 76, 60)(t),
  'stopped-clock': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const towerConditionColor: Record<TowerCondition, (t: string) => string> = {
  'swiss-precision': (t: string) => chalk.rgb(46, 204, 113)(t),
  'well-regulated': (t: string) => chalk.rgb(52, 152, 219)(t),
  'keeping-time': (t: string) => chalk.rgb(241, 196, 15)(t),
  'losing-time': (t: string) => chalk.rgb(230, 126, 34)(t),
  'erratic': (t: string) => chalk.rgb(231, 76, 60)(t),
  'stopped': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const horologistGradeColor: Record<HorologistGrade, (t: string) => string> = {
  'master-watchmaker': (t: string) => chalk.rgb(46, 204, 113)(t),
  'watchmaker': (t: string) => chalk.rgb(52, 152, 219)(t),
  'horologist': (t: string) => chalk.rgb(241, 196, 15)(t),
  'repairman': (t: string) => chalk.rgb(230, 126, 34)(t),
  'tinkerer': (t: string) => chalk.rgb(231, 76, 60)(t),
  'child': (t: string) => chalk.rgb(142, 68, 173)(t),
}

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

/**
 * Format gears as a table
 * @example
 * formatGearTable(gears) // formatted string
 */
export function formatGearTable(gears: ClockworkGear[]): string {
  if (gears.length === 0) return chalk.rgb(150, 150, 150)('  No clockwork gears to display')
  const rows = gears.map(g => {
    const cond = gearConditionColor[g.condition](g.condition.padEnd(20))
    return [chalk.rgb(200, 200, 200)(g.file.padEnd(30)), scoreBar(g.qualityScore, 10), cond].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('File'.padEnd(30)), chalk.rgb(100, 200, 255)('Precision'.padEnd(24)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format towers as a table
 * @example
 * formatTowerTable(towers) // formatted string
 */
export function formatTowerTable(towers: ClockTower[]): string {
  if (towers.length === 0) return chalk.rgb(150, 150, 150)('  No clock towers to display')
  const rows = towers.map(t => {
    const tt = towerTypeColor[t.towerType](t.towerType.padEnd(20))
    const tc = towerConditionColor[t.condition](t.condition.padEnd(16))
    return [chalk.rgb(200, 200, 200)(t.directory.padEnd(20)), chalk.rgb(200, 200, 200)(String(t.gears.length).padEnd(6)), scoreBar(t.avgPrecision, 10), tt, tc].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('Directory'.padEnd(20)), chalk.rgb(100, 200, 255)('Files'.padEnd(6)), chalk.rgb(100, 200, 255)('Avg Precision'.padEnd(24)), chalk.rgb(100, 200, 255)('Type'.padEnd(20)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format atelier summary
 * @example
 * formatAtelier(atelier) // formatted string
 */
export function formatAtelier(atelier: AtelierMeasure): string {
  const precise = atelier.isPrecise ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Atelier Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Precision: ${scoreBar(atelier.overallPrecision)}`,
    `  Avg Gear Precision:${scoreBar(atelier.avgPrecision)}`,
    `  Avg Regulation:    ${scoreBar(atelier.avgRegulation)}`,
    `  Avg Tick Regularity:${scoreBar(atelier.avgTickRegularity)}`,
    `  Is Precise:        ${precise}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

/**
 * Format statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: ClockworkMechanismStats): string {
  const grade = horologistGradeColor[stats.horologistGrade](stats.horologistGrade)
  return [
    '', chalk.rgb(100, 200, 255)('  Clockwork Statistics'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:          ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Towers:         ${chalk.rgb(200, 200, 200)(String(stats.totalTowers))}`,
    `  Horologist Grade:     ${grade}`,
    '', `  Avg Gear Precision:   ${scoreBar(stats.avgGearPrecision)}`,
    `  Avg Escapement:       ${scoreBar(stats.avgEscapementRegulation)}`,
    `  Avg Spring Tension:   ${scoreBar(stats.avgSpringTension)}`,
    `  Avg Chime Accuracy:   ${scoreBar(stats.avgChimeAccuracy)}`,
    `  Avg Winding State:    ${scoreBar(stats.avgWindingState)}`,
    `  Avg Tick Regularity:  ${scoreBar(stats.avgTickRegularity)}`,
    '', `  Grand Complication:   ${chalk.rgb(46, 204, 113)(String(stats.grandComplicationCount))}`,
    `  Chronometer:          ${chalk.rgb(52, 152, 219)(String(stats.chronometerCount))}`,
    `  Precision Watch:      ${chalk.rgb(241, 196, 15)(String(stats.precisionWatchCount))}`,
    `  Standard Clock:       ${chalk.rgb(230, 126, 34)(String(stats.standardClockCount))}`,
    `  Pocket Watch:         ${chalk.rgb(231, 76, 60)(String(stats.pocketWatchCount))}`,
    `  Broken Clock:         ${chalk.rgb(142, 68, 173)(String(stats.brokenClockCount))}`,
    '', `  Spur Gears:           ${chalk.rgb(200, 200, 200)(String(stats.spurCount))}`,
    `  Planetary Gears:      ${chalk.rgb(200, 200, 200)(String(stats.planetaryCount))}`,
    `  Lever Escapements:    ${chalk.rgb(200, 200, 200)(String(stats.leverEscapementCount))}`,
    `  Tourbillons:          ${chalk.rgb(200, 200, 200)(String(stats.tourbillonCount))}`,
    `  Has Backlash:         ${chalk.rgb(200, 200, 200)(String(stats.hasBacklashCount))}`,
    `  Skipped Beats:        ${chalk.rgb(200, 200, 200)(String(stats.hasSkippedBeatsCount))}`,
    `  Has Fatigue:          ${chalk.rgb(200, 200, 200)(String(stats.hasFatigueCount))}`,
    `  Fully Wound:          ${chalk.rgb(200, 200, 200)(String(stats.isFullyWoundCount))}`,
    `  Has Rust:             ${chalk.rgb(200, 200, 200)(String(stats.hasRustCount))}`,
    `  Metronomic:           ${chalk.rgb(200, 200, 200)(String(stats.metronomicCount))}`,
    `  Readable Faces:       ${chalk.rgb(200, 200, 200)(String(stats.isReadableCount))}`,
    `  Luminous Faces:       ${chalk.rgb(200, 200, 200)(String(stats.isLuminousCount))}`,
    '', `  Most Precise:         ${chalk.rgb(46, 204, 113)(stats.mostPrecise)}`,
    `  Best Regulated:       ${chalk.rgb(46, 204, 113)(stats.bestRegulated)}`,
    `  Highest Tension:      ${chalk.rgb(46, 204, 113)(stats.highestTension)}`,
    `  Most Accurate Chime:  ${chalk.rgb(46, 204, 113)(stats.mostAccurateChime)}`,
    `  Best Maintained:      ${chalk.rgb(46, 204, 113)(stats.bestMaintained)}`,
    '',
  ].join('\n')
}

/**
 * Format recommendations
 * @example
 * formatRecommendations(recs) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - mechanism keeps perfect time')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

/**
 * Format complete report
 * @example
 * formatClockworkMechanismReport(result) // formatted string
 */
export function formatClockworkMechanismReport(result: ClockworkMechanismResult): string {
  return [formatAtelier(result.atelier), formatGearTable(result.gears), '', formatTowerTable(result.towers), formatStats(result.stats), formatRecommendations(result.recommendations)].join('\n')
}

/**
 * Format result as JSON
 * @example
 * formatClockworkMechanismJSON(result) // JSON string
 */
export function formatClockworkMechanismJSON(result: ClockworkMechanismResult): string {
  return JSON.stringify(result, null, 2)
}
