// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ObsidianKeystone, GateFortress, ObsidianGateResult } from './obsidian-gate-helpers.js'

// ─── Color Palette (obsidian gate — dark purple/charcoal/midnight) ──
const high = chalk.rgb(75, 0, 130)
const midHigh = chalk.rgb(90, 20, 120)
const mid = chalk.rgb(110, 40, 110)
const lowMid = chalk.rgb(130, 60, 100)
const low = chalk.rgb(150, 80, 90)

const best = chalk.rgb(40, 0, 80).bold
const good = chalk.rgb(60, 0, 100)
const okay = chalk.rgb(80, 20, 100)
const poor = chalk.rgb(100, 40, 90)
const worst = chalk.rgb(120, 50, 80)

const heading = chalk.rgb(50, 0, 90).bold
const label = chalk.rgb(70, 10, 100)
const dim = chalk.rgb(100, 50, 100)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep obsidian
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
 * colorGrade('obsidian-masterpiece') // best (bold obsidian)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'perfect-obsidian': best, 'smooth-void': best,
    'shadow-sentinel': best, 'elegant-arch': best, 'obsidian-masterpiece': best,
    'dark-fortress': best, 'impregnable-fortress': best, 'shadow-warden': best,

    'dark-glass': good, 'strong-gate': good, 'proper-passage': good,
    'watchful-guard': good, 'beautiful-portal': good, 'dark-portal': good,
    'obsidian-castle': good, 'dark-citadel': good, 'gate-commander': good,

    'proper-opacity': okay, 'proper-barrier': okay, 'decent-flow': okay,
    'proper-watch': okay, 'proper-entrance': okay, 'proper-gate': okay,
    'proper-fortress': okay, 'decent-fortress': okay, 'skilled-guard': okay,

    'translucent': poor, 'weak-fence': poor, 'rough-transit': poor,
    'sleeping-guard': poor, 'rough-doorway': poor, 'iron-door': poor,
    'watchtower': poor, 'weak-wall': poor, 'apprentice': poor,

    'transparent': worst, 'open-portal': worst, 'blocked-portal': worst,
    'blind-watchman': worst, 'crude-hole': worst, 'wooden-gate': worst,
    'wooden-palisade': worst, 'breached': worst, 'novice': worst,

    'no-boundary': worst, 'no-security': worst, 'no-passage': worst,
    'no-guard': worst, 'no-entrance': worst, 'gap-in-wall': worst,
    'no-fortress': worst, 'void': worst, 'gate-crasher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Keystone Formatting ───────────────────────────────────────────

/**
 * Format a single keystone for display
 * @example
 * formatKeystoneTable(keystone) // colored keystone info
 */
export function formatKeystoneTable(keystone: ObsidianKeystone): string {
  const parts = [
    `${label('File:')} ${dim(keystone.file)}`,
    `${label('Threshold Darkness:')} ${colorScore(keystone.thresholdDarkness)} ${colorGrade(keystone.hiding.grade)}`,
    `${label('Gate Security:')} ${colorScore(keystone.gateSecurity)} ${colorGrade(keystone.securing.gate)}`,
    `${label('Void Passage:')} ${colorScore(keystone.voidPassage)} ${colorGrade(keystone.flowing.void)}`,
    `${label('Shadow Guard:')} ${colorScore(keystone.shadowGuard)} ${colorGrade(keystone.guarding.shadow)}`,
    `${label('Ethereal Boundary:')} ${colorScore(keystone.etherealBoundary)} ${colorGrade(keystone.arching.ethereal)}`,
    `${label('Score:')} ${colorScore(keystone.qualityScore)} ${colorGrade(keystone.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format keystones as summary table
 * @example
 * formatKeystonesTable(keystones) // multi-line table
 */
export function formatKeystonesTable(keystones: ObsidianKeystone[]): string {
  if (keystones.length === 0) return dim('No obsidian keystones found')
  const header = heading('Obsidian Gate Analysis')
  const rows = keystones.map(k => formatKeystoneTable(k))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Fortress Formatting ───────────────────────────────────────────

/**
 * Format a single fortress for display
 * @example
 * formatFortressTable(fortress) // colored fortress info
 */
export function formatFortressTable(fortress: GateFortress): string {
  const parts = [
    `${label('Fortress:')} ${dim(fortress.directory)}`,
    `${label('Type:')} ${colorGrade(fortress.fortressType)}`,
    `${label('Condition:')} ${colorGrade(fortress.condition)}`,
    `${label('Keystones:')} ${String(fortress.keystones.length)}`,
    `${label('Avg Darkness:')} ${colorScore(fortress.avgDarkness)}`,
    `${label('Avg Security:')} ${colorScore(fortress.avgSecurity)}`,
    `${label('Avg Boundary:')} ${colorScore(fortress.avgBoundary)}`,
    `${label('Obsidian Masterpieces:')} ${String(fortress.obsidianMasterpieceCount)}`,
    `${label('Gaps in Wall:')} ${String(fortress.gapInWallCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all fortresses as summary
 * @example
 * formatFortressesTable(fortresses) // multi-line summary
 */
export function formatFortressesTable(fortresses: GateFortress[]): string {
  if (fortresses.length === 0) return dim('No gate fortresses found')
  const header = heading('Gate Fortresses')
  const rows = fortresses.map(f => formatFortressTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ObsidianGateResult['stats']): string {
  const parts = [
    heading('Obsidian Gate Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Fortresses:')} ${String(stats.totalFortresses)}`,
    `${label('Avg Threshold Darkness:')} ${colorScore(stats.avgThresholdDarkness)}`,
    `${label('Avg Gate Security:')} ${colorScore(stats.avgGateSecurity)}`,
    `${label('Avg Void Passage:')} ${colorScore(stats.avgVoidPassage)}`,
    `${label('Avg Shadow Guard:')} ${colorScore(stats.avgShadowGuard)}`,
    `${label('Avg Ethereal Boundary:')} ${colorScore(stats.avgEtherealBoundary)}`,
    `${label('Obsidian Masterpiece:')} ${String(stats.obsidianMasterpieceCount)}`,
    `${label('Dark Portal:')} ${String(stats.darkPortalCount)}`,
    `${label('Proper Gate:')} ${String(stats.properGateCount)}`,
    `${label('Iron Door:')} ${String(stats.ironDoorCount)}`,
    `${label('Wooden Gate:')} ${String(stats.woodenGateCount)}`,
    `${label('Gap in Wall:')} ${String(stats.gapInWallCount)}`,
    `${label('High Darkness:')} ${String(stats.hasHighDarknessCount)}`,
    `${label('High Security:')} ${String(stats.hasHighSecurityCount)}`,
    `${label('High Passage:')} ${String(stats.hasHighPassageCount)}`,
    `${label('High Guard:')} ${String(stats.hasHighGuardCount)}`,
    `${label('High Boundary:')} ${String(stats.hasHighBoundaryCount)}`,
    `${label('Overall Fortification:')} ${colorScore(stats.overallFortification)}`,
    `${label('Warden Grade:')} ${colorGrade(stats.wardenGrade)}`,
    `${label('Best Keystone:')} ${stats.bestKeystone}`,
    `${label('Most Encapsulated:')} ${stats.mostEncapsulated}`,
    `${label('Most Secure:')} ${stats.mostSecure}`,
    `${label('Smoothest Flow:')} ${stats.smoothestFlow}`,
    `${label('Best Guarded:')} ${stats.bestGuarded}`,
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
export function formatResultTable(result: ObsidianGateResult): string {
  const sections = [
    formatKeystonesTable(result.keystones),
    '',
    formatFortressesTable(result.fortresses),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Realm')} ${label('Impregnable:')} ${result.realm.isImpregnable ? high('Yes') : low('No')} ${label('Fortification:')} ${colorScore(result.realm.overallFortification)}`,
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
export function formatResultJson(result: ObsidianGateResult): string {
  return JSON.stringify(result, null, 2)
}
