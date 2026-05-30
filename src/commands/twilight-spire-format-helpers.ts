// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { TwilightStone, SpireTower, TwilightSpireResult } from './twilight-spire-helpers.js'

// ─── Color Palette (twilight spire — deep purple/amber/indigo) ─────
const high = chalk.rgb(180, 120, 220)
const midHigh = chalk.rgb(160, 100, 200)
const mid = chalk.rgb(140, 80, 180)
const lowMid = chalk.rgb(120, 60, 160)
const low = chalk.rgb(100, 40, 140)

const best = chalk.rgb(200, 150, 255).bold
const good = chalk.rgb(180, 120, 220)
const okay = chalk.rgb(160, 100, 200)
const poor = chalk.rgb(140, 80, 180)
const worst = chalk.rgb(100, 40, 140)

const heading = chalk.rgb(170, 110, 230).bold
const label = chalk.rgb(155, 95, 215)
const dim = chalk.rgb(130, 70, 190)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // purple
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
 * colorGrade('twilight-masterpiece') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'seamless-twilight': best, 'eternal-spire': best, 'first-star': best,
    'perfect-twilight': best, 'sunrise-ready': best, 'twilight-masterpiece': best,
    'grand-cathedral': best, 'twilight-peak': best, 'twilight-architect': best,

    'smooth-transition': good, 'twilight-tower': good, 'bright-emergence': good,
    'balanced-dusk': good, 'morning-prepared': good, 'evening-spire': good,
    'proper-spire': good, 'evening-tower': good, 'tower-master': good,

    'proper-shift': okay, 'proper-pillar': okay, 'proper-clarity': okay,
    'proper-balance': okay, 'proper-readiness': okay, 'proper-tower': okay,
    'decent-tower': okay, 'decent-spire': okay, 'skilled-builder': okay,

    'abrupt-change': poor, 'crumbling-tower': poor, 'dim-light': poor,
    'over-explicit': poor, 'caught-off-guard': poor, 'dim-tower': poor,
    'small-minaret': poor, 'dim-spire': poor, 'apprentice': poor,

    'jarring-switch': worst, 'falling-stones': worst, 'hidden-star': worst,
    'over-implicit': worst, 'asleep-at-dawn': worst, 'shadow-ruin': worst,
    'ruined-pillar': worst, 'novice': worst,

    'no-transition': worst, 'no-endurance': worst, 'no-light': worst,
    'no-balance': worst, 'no-readiness': worst, 'collapsed': worst,
    'no-tower': worst, 'void': worst, 'ruin-dweller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Stone Formatting ─────────────────────────────────────────────

/**
 * Format a single stone for display
 * @example
 * formatStoneTable(stone) // colored stone info
 */
export function formatStoneTable(stone: TwilightStone): string {
  const parts = [
    `${label('File:')} ${dim(stone.file)}`,
    `${label('Transition Grace:')} ${colorScore(stone.transitionGrace)} ${colorGrade(stone.shifting.grade)}`,
    `${label('Dusk Resilience:')} ${colorScore(stone.duskResilience)} ${colorGrade(stone.enduring.dusk)}`,
    `${label('Star Emergence:')} ${colorScore(stone.starEmergence)} ${colorGrade(stone.revealing.star)}`,
    `${label('Shadow Balance:')} ${colorScore(stone.shadowBalance)} ${colorGrade(stone.balancing.shadow)}`,
    `${label('Dawn Readiness:')} ${colorScore(stone.dawnReadiness)} ${colorGrade(stone.preparing.dawn)}`,
    `${label('Score:')} ${colorScore(stone.qualityScore)} ${colorGrade(stone.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format stones as summary table
 * @example
 * formatStonesTable(stones) // multi-line table
 */
export function formatStonesTable(stones: TwilightStone[]): string {
  if (stones.length === 0) return dim('No twilight stones found')
  const header = heading('Twilight Spire Analysis')
  const rows = stones.map(s => formatStoneTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Tower Formatting ─────────────────────────────────────────────

/**
 * Format a tower for display
 * @example
 * formatTowerTable(tower) // colored tower info
 */
export function formatTowerTable(tower: SpireTower): string {
  const parts = [
    `${label('Tower:')} ${dim(tower.directory)}`,
    `${label('Type:')} ${colorGrade(tower.towerType)}`,
    `${label('Condition:')} ${colorGrade(tower.condition)}`,
    `${label('Stones:')} ${String(tower.stones.length)}`,
    `${label('Avg Grace:')} ${colorScore(tower.avgGrace)}`,
    `${label('Avg Resilience:')} ${colorScore(tower.avgResilience)}`,
    `${label('Avg Readiness:')} ${colorScore(tower.avgReadiness)}`,
    `${label('Masterpieces:')} ${String(tower.twilightMasterpieceCount)}`,
    `${label('Collapsed:')} ${String(tower.collapsedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all towers as summary
 * @example
 * formatTowersTable(towers) // multi-line summary
 */
export function formatTowersTable(towers: SpireTower[]): string {
  if (towers.length === 0) return dim('No spire towers found')
  const header = heading('Spire Towers')
  const rows = towers.map(t => formatTowerTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: TwilightSpireResult['stats']): string {
  const parts = [
    heading('Twilight Spire Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Towers:')} ${String(stats.totalTowers)}`,
    `${label('Avg Transition Grace:')} ${colorScore(stats.avgTransitionGrace)}`,
    `${label('Avg Dusk Resilience:')} ${colorScore(stats.avgDuskResilience)}`,
    `${label('Avg Star Emergence:')} ${colorScore(stats.avgStarEmergence)}`,
    `${label('Avg Shadow Balance:')} ${colorScore(stats.avgShadowBalance)}`,
    `${label('Avg Dawn Readiness:')} ${colorScore(stats.avgDawnReadiness)}`,
    `${label('Twilight Masterpiece:')} ${String(stats.twilightMasterpieceCount)}`,
    `${label('Evening Spire:')} ${String(stats.eveningSpireCount)}`,
    `${label('Proper Tower:')} ${String(stats.properTowerCount)}`,
    `${label('Dim Tower:')} ${String(stats.dimTowerCount)}`,
    `${label('Shadow Ruin:')} ${String(stats.shadowRuinCount)}`,
    `${label('Collapsed:')} ${String(stats.collapsedCount)}`,
    `${label('High Grace:')} ${String(stats.hasHighGraceCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Emergence:')} ${String(stats.hasHighEmergenceCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('High Readiness:')} ${String(stats.hasHighReadinessCount)}`,
    `${label('Overall Majesty:')} ${colorScore(stats.overallMajesty)}`,
    `${label('Architect Grade:')} ${colorGrade(stats.architectGrade)}`,
    `${label('Best Stone:')} ${stats.bestStone}`,
    `${label('Most Graceful:')} ${stats.mostGraceful}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Clearest Star:')} ${stats.clearestStar}`,
    `${label('Most Prepared:')} ${stats.mostPrepared}`,
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
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: TwilightSpireResult): string {
  const sections = [
    formatStonesTable(result.stones),
    '',
    formatTowersTable(result.towers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Skyline')} ${label('Twilight:')} ${result.skyline.isTwilight ? high('Yes') : low('No')} ${label('Overall Majesty:')} ${colorScore(result.skyline.overallMajesty)}`,
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
export function formatResultJson(result: TwilightSpireResult): string {
  return JSON.stringify(result, null, 2)
}
