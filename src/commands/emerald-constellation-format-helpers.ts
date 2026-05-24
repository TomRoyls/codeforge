// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { EmeraldStar, ConstellationArm, EmeraldConstellationResult } from './emerald-constellation-helpers.js'

// ─── Color Palette (emerald constellation — green/gold starlight) ──
const high = chalk.rgb(80, 220, 120)
const midHigh = chalk.rgb(100, 200, 140)
const mid = chalk.rgb(130, 190, 150)
const lowMid = chalk.rgb(110, 160, 130)
const low = chalk.rgb(90, 130, 110)

const best = chalk.rgb(50, 255, 100).bold
const good = chalk.rgb(80, 220, 120)
const okay = chalk.rgb(120, 200, 150)
const poor = chalk.rgb(160, 180, 140)
const worst = chalk.rgb(130, 140, 120)

const heading = chalk.rgb(60, 230, 110).bold
const label = chalk.rgb(80, 200, 130)
const dim = chalk.rgb(100, 160, 120)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright emerald
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
 * colorGrade('emerald-masterpiece') // best (bold emerald)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'galactic-core': best, 'flawless-emerald': best, 'perfect-harmony': best,
    'fusion-reactor': best, 'ancient-constellation': best, 'emerald-masterpiece': best,
    'spiral-arm': best, 'brilliant-constellation': best, 'master-astronomer': best,

    'star-system': good, 'clear-gem': good, 'stable-orbit': good,
    'efficient-solar': good, 'wise-stars': good, 'green-constellation': good,
    'star-cluster': good, 'starlit-galaxy': good, 'star-captain': good,

    'proper-orbit': okay, 'proper-transparency': okay, 'proper-path': okay,
    'proper-energy': okay, 'proper-pattern': okay, 'proper-star': okay,
    'proper-group': okay, 'decent-cluster': okay, 'skilled-navigator': okay,

    'asteroid-belt': poor, 'cloudy-stone': poor, 'elliptical-drift': poor,
    'wasteful-grid': poor, 'random-points': poor, 'dim-gem': poor,
    'scattered-stars': poor, 'dim-nebula': poor, 'apprentice': poor,

    'space-debris': worst, 'opaque-rock': worst, 'collision-course': worst,
    'draining-circuit': worst, 'dim-lights': worst, 'faded-star': worst,
    'rogue-objects': worst, 'dark-void': worst, 'novice': worst,

    'no-organization': worst, 'no-gem': worst, 'chaotic-orbit': worst,
    'no-energy': worst, 'no-wisdom': worst, 'dark-matter': worst,
    'no-arm': worst, 'void': worst, 'lost-soul': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Star Formatting ───────────────────────────────────────────────

/**
 * Format a single star for display
 * @example
 * formatStarTable(star) // colored star info
 */
export function formatStarTable(star: EmeraldStar): string {
  const parts = [
    `${label('File:')} ${dim(star.file)}`,
    `${label('Stellar Organization:')} ${colorScore(star.stellarOrganization)} ${colorGrade(star.arranging.grade)}`,
    `${label('Gem Clarity:')} ${colorScore(star.gemClarity)} ${colorGrade(star.clarifying.gem)}`,
    `${label('Orbit Harmony:')} ${colorScore(star.orbitHarmony)} ${colorGrade(star.harmonizing.orbit)}`,
    `${label('Green Energy:')} ${colorScore(star.greenEnergy)} ${colorGrade(star.energizing.green)}`,
    `${label('Constellation Wisdom:')} ${colorScore(star.constellationWisdom)} ${colorGrade(star.knowing.constellation)}`,
    `${label('Score:')} ${colorScore(star.qualityScore)} ${colorGrade(star.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format stars as summary table
 * @example
 * formatStarsTable(stars) // multi-line table
 */
export function formatStarsTable(stars: EmeraldStar[]): string {
  if (stars.length === 0) return dim('No emerald stars found')
  const header = heading('Emerald Constellation Analysis')
  const rows = stars.map(st => formatStarTable(st))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Arm Formatting ────────────────────────────────────────────────

/**
 * Format a single arm for display
 * @example
 * formatArmTable(arm) // colored arm info
 */
export function formatArmTable(arm: ConstellationArm): string {
  const parts = [
    `${label('Arm:')} ${dim(arm.directory)}`,
    `${label('Type:')} ${colorGrade(arm.armType)}`,
    `${label('Condition:')} ${colorGrade(arm.condition)}`,
    `${label('Stars:')} ${String(arm.stars.length)}`,
    `${label('Avg Organization:')} ${colorScore(arm.avgOrganization)}`,
    `${label('Avg Harmony:')} ${colorScore(arm.avgHarmony)}`,
    `${label('Avg Wisdom:')} ${colorScore(arm.avgWisdom)}`,
    `${label('Emerald Masterpieces:')} ${String(arm.emeraldMasterpieceCount)}`,
    `${label('Dark Matter:')} ${String(arm.darkMatterCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all arms as summary
 * @example
 * formatArmsTable(arms) // multi-line summary
 */
export function formatArmsTable(arms: ConstellationArm[]): string {
  if (arms.length === 0) return dim('No constellation arms found')
  const header = heading('Constellation Arms')
  const rows = arms.map(a => formatArmTable(a))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EmeraldConstellationResult['stats']): string {
  const parts = [
    heading('Emerald Constellation Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Arms:')} ${String(stats.totalArms)}`,
    `${label('Avg Stellar Organization:')} ${colorScore(stats.avgStellarOrganization)}`,
    `${label('Avg Gem Clarity:')} ${colorScore(stats.avgGemClarity)}`,
    `${label('Avg Orbit Harmony:')} ${colorScore(stats.avgOrbitHarmony)}`,
    `${label('Avg Green Energy:')} ${colorScore(stats.avgGreenEnergy)}`,
    `${label('Avg Constellation Wisdom:')} ${colorScore(stats.avgConstellationWisdom)}`,
    `${label('Emerald Masterpiece:')} ${String(stats.emeraldMasterpieceCount)}`,
    `${label('Green Constellation:')} ${String(stats.greenConstellationCount)}`,
    `${label('Proper Star:')} ${String(stats.properStarCount)}`,
    `${label('Dim Gem:')} ${String(stats.dimGemCount)}`,
    `${label('Faded Star:')} ${String(stats.fadedStarCount)}`,
    `${label('Dark Matter:')} ${String(stats.darkMatterCount)}`,
    `${label('High Organization:')} ${String(stats.hasHighOrganizationCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('High Energy:')} ${String(stats.hasHighEnergyCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Splendor:')} ${colorScore(stats.overallSplendor)}`,
    `${label('Astronomer Grade:')} ${colorGrade(stats.astronomerGrade)}`,
    `${label('Best Star:')} ${stats.bestStar}`,
    `${label('Most Organized:')} ${stats.mostOrganized}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Harmonious:')} ${stats.mostHarmonious}`,
    `${label('Wisest:')} ${stats.wisest}`,
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
export function formatResultTable(result: EmeraldConstellationResult): string {
  const sections = [
    formatStarsTable(result.stars),
    '',
    formatArmsTable(result.arms),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Galaxy')} ${label('Brilliant:')} ${result.galaxy.isBrilliant ? high('Yes') : low('No')} ${label('Splendor:')} ${colorScore(result.galaxy.overallSplendor)}`,
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
export function formatResultJson(result: EmeraldConstellationResult): string {
  return JSON.stringify(result, null, 2)
}
