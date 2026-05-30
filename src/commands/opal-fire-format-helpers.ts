// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { OpalFire, OpalMine, OpalFireResult } from './opal-fire-helpers.js'

// ─── Color Palette (opal) ──────────────────────────────────────────
const high = chalk.rgb(180, 120, 255)
const midHigh = chalk.rgb(160, 100, 230)
const mid = chalk.rgb(140, 80, 210)
const lowMid = chalk.rgb(120, 60, 180)
const low = chalk.rgb(100, 50, 150)

const best = chalk.rgb(220, 160, 255).bold
const good = chalk.rgb(200, 140, 240)
const okay = chalk.rgb(170, 120, 220)
const poor = chalk.rgb(140, 90, 190)
const worst = chalk.rgb(110, 70, 160)

const heading = chalk.rgb(200, 150, 255).bold
const label = chalk.rgb(180, 130, 240)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // opal purple
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
 * colorGrade('black-opal') // best (bold opal)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'rainbow-fire': best, 'white-fire': best, 'flawless-opal': best,
    'perfectly-hydrated': best, 'master-cut': best, 'black-opal': best,
    'lightning-ridge': best, 'gem-quality': best, 'master-lapidary': best,

    'vivid-play': good, 'bright-flame': good, 'strong-structure': good,
    'well-balanced': good, 'expert-cabochon': good, 'boulder-opal': good,
    'coober-pedy': good, 'good-find': good, 'expert-gem-cutter': good,

    'proper-color': okay, 'proper-glow': okay, 'proper-body': okay,
    'proper-moisture': okay, 'proper-shape': okay, 'white-opal': okay,
    'proper-mine': okay, 'decent-yield': okay, 'skilled-artisan': okay,

    'dull-play': poor, 'faint-shimmer': poor, 'hairline-crack': poor,
    'dehydrated': poor, 'rough-cut': poor, 'common-opal': poor,
    'surface-find': poor, 'low-grade': poor, 'apprentice': poor,

    'dull-stone': poor, 'fractured': poor,    'waterlogged': poor, 'chipped': poor, 'cracked-opal': poor,
    'dry-dig': poor, 'mine-tailings': poor, 'novice': poor,

    'no-color': worst, 'dead-opal': worst, 'shattered': worst,
    'desiccated': worst, 'uncut': worst, 'opal-dust': worst,
    'no-mine': worst, 'empty-shaft': worst, 'rock-smasher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Fire Formatting ──────────────────────────────────────────────

/**
 * Format a single fire for display
 * @example
 * formatFireTable(fire) // colored fire info
 */
export function formatFireTable(fire: OpalFire): string {
  const parts = [
    `${label('File:')} ${dim(fire.file)}`,
    `${label('Play of Color:')} ${colorScore(fire.playOfColor)} ${colorGrade(fire.coloring.grade)}`,
    `${label('Fire Brilliance:')} ${colorScore(fire.fireBrilliance)} ${colorGrade(fire.blazing.fire)}`,
    `${label('Crack Resistance:')} ${colorScore(fire.crackResistance)} ${colorGrade(fire.resisting.crack)}`,
    `${label('Hydration Balance:')} ${colorScore(fire.hydrationBalance)} ${colorGrade(fire.balancing.hydration)}`,
    `${label('Cutting Quality:')} ${colorScore(fire.cuttingQuality)} ${colorGrade(fire.cutting.cut)}`,
    `${label('Score:')} ${colorScore(fire.qualityScore)} ${colorGrade(fire.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format fires as summary table
 * @example
 * formatFiresTable(fires) // multi-line table
 */
export function formatFiresTable(fires: OpalFire[]): string {
  if (fires.length === 0) return dim('No opal fires found')
  const header = heading('Opal Fire Analysis')
  const rows = fires.map(f => formatFireTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Mine Formatting ──────────────────────────────────────────────

/**
 * Format a mine for display
 * @example
 * formatMineTable(mine) // colored mine info
 */
export function formatMineTable(mine: OpalMine): string {
  const parts = [
    `${label('Mine:')} ${dim(mine.directory)}`,
    `${label('Type:')} ${colorGrade(mine.mineType)}`,
    `${label('Condition:')} ${colorGrade(mine.condition)}`,
    `${label('Fires:')} ${String(mine.fires.length)}`,
    `${label('Avg Play:')} ${colorScore(mine.avgPlay)}`,
    `${label('Avg Brilliance:')} ${colorScore(mine.avgBrilliance)}`,
    `${label('Avg Resistance:')} ${colorScore(mine.avgResistance)}`,
    `${label('Black Opals:')} ${String(mine.blackOpalCount)}`,
    `${label('Opal Dust:')} ${String(mine.opalDustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all mines as summary
 * @example
 * formatMinesTable(mines) // multi-line mine summary
 */
export function formatMinesTable(mines: OpalMine[]): string {
  if (mines.length === 0) return dim('No opal mines found')
  const header = heading('Opal Mine Analysis')
  const rows = mines.map(m => formatMineTable(m))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: OpalFireResult['stats']): string {
  const parts = [
    heading('Opal Fire Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Mines:')} ${String(stats.totalMines)}`,
    `${label('Avg Play of Color:')} ${colorScore(stats.avgPlayOfColor)}`,
    `${label('Avg Fire Brilliance:')} ${colorScore(stats.avgFireBrilliance)}`,
    `${label('Avg Crack Resistance:')} ${colorScore(stats.avgCrackResistance)}`,
    `${label('Avg Hydration Balance:')} ${colorScore(stats.avgHydrationBalance)}`,
    `${label('Avg Cutting Quality:')} ${colorScore(stats.avgCuttingQuality)}`,
    `${label('Black Opal:')} ${String(stats.blackOpalCount)}`,
    `${label('Boulder Opal:')} ${String(stats.boulderOpalCount)}`,
    `${label('White Opal:')} ${String(stats.whiteOpalCount)}`,
    `${label('Common Opal:')} ${String(stats.commonOpalCount)}`,
    `${label('Cracked Opal:')} ${String(stats.crackedOpalCount)}`,
    `${label('Opal Dust:')} ${String(stats.opalDustCount)}`,
    `${label('High Play:')} ${String(stats.hasHighPlayCount)}`,
    `${label('High Brilliance:')} ${String(stats.hasHighBrillianceCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('Overall Fire:')} ${colorScore(stats.overallFire)}`,
    `${label('Lapidary Grade:')} ${colorGrade(stats.lapidaryGrade)}`,
    `${label('Best Fire:')} ${stats.bestFire}`,
    `${label('Most Colorful:')} ${stats.mostColorful}`,
    `${label('Most Brilliant:')} ${stats.mostBrilliant}`,
    `${label('Most Durable:')} ${stats.mostDurable}`,
    `${label('Best Balanced:')} ${stats.bestBalanced}`,
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
export function formatResultTable(result: OpalFireResult): string {
  const sections = [
    formatFiresTable(result.fires),
    '',
    formatMinesTable(result.mines),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Field')} ${label('Brilliant:')} ${result.field.isBrilliant ? high('Yes') : low('No')} ${label('Overall Fire:')} ${colorScore(result.field.overallFire)}`,
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
export function formatResultJson(result: OpalFireResult): string {
  return JSON.stringify(result, null, 2)
}
