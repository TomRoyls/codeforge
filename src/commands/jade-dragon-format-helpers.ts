// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { DragonScale, DragonLair, JadeDragonResult } from './jade-dragon-helpers.js'

// ─── Color Palette (jade dragon — green/jade) ────────────────────
const high = chalk.rgb(0, 200, 120)
const midHigh = chalk.rgb(40, 180, 110)
const mid = chalk.rgb(80, 160, 100)
const lowMid = chalk.rgb(120, 140, 90)
const low = chalk.rgb(160, 120, 80)

const best = chalk.rgb(0, 220, 130).bold
const good = chalk.rgb(30, 195, 115)
const okay = chalk.rgb(70, 170, 105)
const poor = chalk.rgb(120, 145, 95)
const worst = chalk.rgb(150, 125, 85)

const heading = chalk.rgb(0, 190, 120).bold
const label = chalk.rgb(50, 175, 110)
const dim = chalk.rgb(140, 160, 140)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // jade green
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
 * colorGrade('celestial-dragon') // best (bold jade)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'ancient-wyrm': best, 'impenetrable-scales': best, 'celestial-breath': best,
    'celestial-guardian': best, 'celestial-flight': best, 'celestial-dragon': best,
    'celestial-palace': best, 'divine-realm': best, 'dragon-emperor': best,

    'elder-dragon': good, 'dragon-armor': good, 'vital-flame': good,
    'treasure-hoarder': good, 'graceful-soar': good, 'jade-serpent': good,
    'mountain-lair': good, 'mountain-fortress': good, 'elder-wyrm': good,

    'proper-wisdom': okay, 'proper-scales': okay, 'proper-breath': okay,
    'proper-guardian': okay, 'proper-flight': okay, 'proper-wyrm': okay,
    'proper-cave': okay, 'decent-lair': okay, 'adult-dragon': okay,

    'young-dragon': poor, 'thin-hide': poor, 'wheezing': poor,
    'negligent-keeper': poor, 'clumsy-flight': poor, 'wounded-drake': poor,
    'shallow-den': poor, 'humble-den': poor, 'juvenile': poor,

    'hatchling-wisdom': worst, 'exposed-skin': worst, 'shallow-breath': worst,
    'open-vault': worst, 'crash-landing': worst, 'earthbound-lizard': worst,
    'exposed-nest': worst, 'ruined': worst, 'hatchling': worst,

    'no-wisdom': worst, 'no-protection': worst, 'no-breath': worst,
    'no-guard': worst, 'no-flight': worst, 'egg': worst,
    'no-lair': worst, 'void': worst, 'egg-grade': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Scale Formatting ─────────────────────────────────────────────

/**
 * Format a single scale for display
 * @example
 * formatScaleTable(scale) // colored scale info
 */
export function formatScaleTable(scale: DragonScale): string {
  const parts = [
    `${label('File:')} ${dim(scale.file)}`,
    `${label('Wisdom Depth:')} ${colorScore(scale.wisdomDepth)} ${colorGrade(scale.knowing.grade)}`,
    `${label('Scale Resilience:')} ${colorScore(scale.scaleResilience)} ${colorGrade(scale.armoring.armor)}`,
    `${label('Breath Vitality:')} ${colorScore(scale.breathVitality)} ${colorGrade(scale.breathing.breath)}`,
    `${label('Treasure Guardianship:')} ${colorScore(scale.treasureGuardianship)} ${colorGrade(scale.guarding.treasure)}`,
    `${label('Flight Elegance:')} ${colorScore(scale.flightElegance)} ${colorGrade(scale.soaring.flight)}`,
    `${label('Score:')} ${colorScore(scale.qualityScore)} ${colorGrade(scale.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format scales as summary table
 * @example
 * formatScalesTable(scales) // multi-line table
 */
export function formatScalesTable(scales: DragonScale[]): string {
  if (scales.length === 0) return dim('No dragon scales found')
  const header = heading('Jade Dragon Analysis')
  const rows = scales.map(sc => formatScaleTable(sc))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Lair Formatting ──────────────────────────────────────────────

/**
 * Format a lair for display
 * @example
 * formatLairTable(lair) // colored lair info
 */
export function formatLairTable(lair: DragonLair): string {
  const parts = [
    `${label('Lair:')} ${dim(lair.directory)}`,
    `${label('Type:')} ${colorGrade(lair.lairType)}`,
    `${label('Condition:')} ${colorGrade(lair.condition)}`,
    `${label('Scales:')} ${String(lair.scales.length)}`,
    `${label('Avg Wisdom:')} ${colorScore(lair.avgWisdom)}`,
    `${label('Avg Resilience:')} ${colorScore(lair.avgResilience)}`,
    `${label('Avg Elegance:')} ${colorScore(lair.avgElegance)}`,
    `${label('Celestial Dragons:')} ${String(lair.celestialDragonCount)}`,
    `${label('Eggs:')} ${String(lair.eggCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all lairs as summary
 * @example
 * formatLairsTable(lairs) // multi-line lair summary
 */
export function formatLairsTable(lairs: DragonLair[]): string {
  if (lairs.length === 0) return dim('No dragon lairs found')
  const header = heading('Dragon Lairs')
  const rows = lairs.map(l => formatLairTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: JadeDragonResult['stats']): string {
  const parts = [
    heading('Jade Dragon Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Lairs:')} ${String(stats.totalLairs)}`,
    `${label('Avg Wisdom Depth:')} ${colorScore(stats.avgWisdomDepth)}`,
    `${label('Avg Scale Resilience:')} ${colorScore(stats.avgScaleResilience)}`,
    `${label('Avg Breath Vitality:')} ${colorScore(stats.avgBreathVitality)}`,
    `${label('Avg Treasure Guardianship:')} ${colorScore(stats.avgTreasureGuardianship)}`,
    `${label('Avg Flight Elegance:')} ${colorScore(stats.avgFlightElegance)}`,
    `${label('Celestial Dragons:')} ${String(stats.celestialDragonCount)}`,
    `${label('Jade Serpents:')} ${String(stats.jadeSerpentCount)}`,
    `${label('Proper Wyrms:')} ${String(stats.properWyrmCount)}`,
    `${label('Wounded Drakes:')} ${String(stats.woundedDrakeCount)}`,
    `${label('Earthbound Lizards:')} ${String(stats.earthboundLizardCount)}`,
    `${label('Eggs:')} ${String(stats.eggCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Vitality:')} ${String(stats.hasHighVitalityCount)}`,
    `${label('High Guardianship:')} ${String(stats.hasHighGuardianshipCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('Overall Majesty:')} ${colorScore(stats.overallMajesty)}`,
    `${label('Dragon Grade:')} ${colorGrade(stats.dragonGrade)}`,
    `${label('Best Scale:')} ${stats.bestScale}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Most Vital:')} ${stats.mostVital}`,
    `${label('Most Guarding:')} ${stats.mostGuarding}`,
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
export function formatResultTable(result: JadeDragonResult): string {
  const sections = [
    formatScalesTable(result.scales),
    '',
    formatLairsTable(result.lairs),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Dragon')} ${label('Celestial:')} ${result.dragon.isCelestial ? high('Yes') : low('No')} ${label('Overall Majesty:')} ${colorScore(result.dragon.overallMajesty)}`,
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
export function formatResultJson(result: JadeDragonResult): string {
  return JSON.stringify(result, null, 2)
}
