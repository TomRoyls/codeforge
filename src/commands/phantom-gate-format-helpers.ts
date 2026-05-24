// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GateKeystone, GateArch, PhantomGateResult } from './phantom-gate-helpers.js'

// ─── Color Palette (phantom gate — purple/silver/ethereal) ─────────
const high = chalk.rgb(180, 130, 255)
const midHigh = chalk.rgb(160, 115, 235)
const mid = chalk.rgb(140, 100, 215)
const lowMid = chalk.rgb(120, 85, 195)
const low = chalk.rgb(100, 70, 175)

const best = chalk.rgb(200, 160, 255).bold
const good = chalk.rgb(180, 145, 245)
const okay = chalk.rgb(160, 125, 225)
const poor = chalk.rgb(140, 105, 205)
const worst = chalk.rgb(120, 85, 185)

const heading = chalk.rgb(190, 150, 250).bold
const label = chalk.rgb(170, 135, 240)
const dim = chalk.rgb(150, 115, 220)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright purple
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
 * colorGrade('divine-portal') // best (bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'divine-arch': best, 'impregnable-gate': best, 'swift-passage': best,
    'eternal-sentinel': best, 'seamless-crossing': best, 'divine-portal': best,
    'grand-portal': best, 'magnificent-gateway': best, 'gatekeeper-supreme': best,

    'master-threshold': good, 'strong-portal': good, 'smooth-traversal': good,
    'watchful-guardian': good, 'graceful-passage': good, 'phantom-gateway': good,
    'proper-archway': good, 'strong-portal': good, 'master-guardian': good,

    'proper-gate': okay, 'proper-gate': okay, 'proper-flow': okay,
    'proper-watch': okay, 'proper-transition': okay, 'proper-gate': okay,
    'decent-gate': okay, 'decent-entrance': okay, 'skilled-watchman': okay,

    'rough-entrance': poor, 'weak-door': poor, 'slow-passage': poor,
    'sleeping-guard': poor, 'abrupt-shift': poor, 'wooden-door': poor,
    'narrow-door': poor, 'rusted-gate': poor, 'apprentice': poor,

    'broken-door': worst, 'open-portal': worst, 'blocked-path': worst,
    'blind-watchman': worst, 'jarring-change': worst, 'broken-arch': worst,
    'hole-in-wall': worst, 'collapsed': worst, 'novice': worst,

    'no-threshold': worst, 'no-gate': worst, 'no-traversal': worst,
    'no-guard': worst, 'no-passage': worst, 'rubble': worst,
    'no-arch': worst, 'void': worst, 'gate-crasher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Keystone Formatting ───────────────────────────────────────────

/**
 * Format a single keystone for display
 * @example
 * formatKeystoneTable(keystone) // colored keystone info
 */
export function formatKeystoneTable(keystone: GateKeystone): string {
  const parts = [
    `${label('File:')} ${dim(keystone.file)}`,
    `${label('Threshold Quality:')} ${colorScore(keystone.thresholdQuality)} ${colorGrade(keystone.arching.grade)}`,
    `${label('Gateway Security:')} ${colorScore(keystone.gatewaySecurity)} ${colorGrade(keystone.guarding.gateway)}`,
    `${label('Spirit Traversal:')} ${colorScore(keystone.spiritTraversal)} ${colorGrade(keystone.traversing.spirit)}`,
    `${label('Shadow Guardian:')} ${colorScore(keystone.shadowGuardian)} ${colorGrade(keystone.watching.shadow)}`,
    `${label('Ethereal Passage:')} ${colorScore(keystone.etherealPassage)} ${colorGrade(keystone.transitioning.ethereal)}`,
    `${label('Score:')} ${colorScore(keystone.qualityScore)} ${colorGrade(keystone.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format keystones as summary table
 * @example
 * formatKeystonesTable(keystones) // multi-line table
 */
export function formatKeystonesTable(keystones: GateKeystone[]): string {
  if (keystones.length === 0) return dim('No gate keystones found')
  const header = heading('Phantom Gate Analysis')
  const rows = keystones.map(k => formatKeystoneTable(k))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Arch Formatting ───────────────────────────────────────────────

/**
 * Format a single arch for display
 * @example
 * formatArchTable(arch) // colored arch info
 */
export function formatArchTable(arch: GateArch): string {
  const parts = [
    `${label('Arch:')} ${dim(arch.directory)}`,
    `${label('Type:')} ${colorGrade(arch.archType)}`,
    `${label('Condition:')} ${colorGrade(arch.condition)}`,
    `${label('Keystones:')} ${String(arch.keystones.length)}`,
    `${label('Avg Quality:')} ${colorScore(arch.avgQuality)}`,
    `${label('Avg Security:')} ${colorScore(arch.avgSecurity)}`,
    `${label('Avg Passage:')} ${colorScore(arch.avgPassage)}`,
    `${label('Divine Portals:')} ${String(arch.divinePortalCount)}`,
    `${label('Rubble Count:')} ${String(arch.rubbleCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all arches as summary
 * @example
 * formatArchesTable(arches) // multi-line summary
 */
export function formatArchesTable(arches: GateArch[]): string {
  if (arches.length === 0) return dim('No gate arches found')
  const header = heading('Gate Arches')
  const rows = arches.map(a => formatArchTable(a))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PhantomGateResult['stats']): string {
  const parts = [
    heading('Phantom Gate Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Arches:')} ${String(stats.totalArches)}`,
    `${label('Avg Threshold Quality:')} ${colorScore(stats.avgThresholdQuality)}`,
    `${label('Avg Gateway Security:')} ${colorScore(stats.avgGatewaySecurity)}`,
    `${label('Avg Spirit Traversal:')} ${colorScore(stats.avgSpiritTraversal)}`,
    `${label('Avg Shadow Guardian:')} ${colorScore(stats.avgShadowGuardian)}`,
    `${label('Avg Ethereal Passage:')} ${colorScore(stats.avgEtherealPassage)}`,
    `${label('Divine Portal:')} ${String(stats.divinePortalCount)}`,
    `${label('Phantom Gateway:')} ${String(stats.phantomGatewayCount)}`,
    `${label('Proper Gate:')} ${String(stats.properGateCount)}`,
    `${label('Wooden Door:')} ${String(stats.woodenDoorCount)}`,
    `${label('Broken Arch:')} ${String(stats.brokenArchCount)}`,
    `${label('Rubble:')} ${String(stats.rubbleCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Security:')} ${String(stats.hasHighSecurityCount)}`,
    `${label('High Traversal:')} ${String(stats.hasHighTraversalCount)}`,
    `${label('High Guardian:')} ${String(stats.hasHighGuardianCount)}`,
    `${label('High Passage:')} ${String(stats.hasHighPassageCount)}`,
    `${label('Overall Fortification:')} ${colorScore(stats.overallFortification)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Keystone:')} ${stats.bestKeystone}`,
    `${label('Best Threshold:')} ${stats.bestThreshold}`,
    `${label('Most Secure:')} ${stats.mostSecure}`,
    `${label('Smoothest Traversal:')} ${stats.smoothestTraversal}`,
    `${label('Best Guardian:')} ${stats.bestGuardian}`,
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
export function formatResultTable(result: PhantomGateResult): string {
  const sections = [
    formatKeystonesTable(result.keystones),
    '',
    formatArchesTable(result.arches),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Gateway')} ${label('Impregnable:')} ${result.gateway.isImpregnable ? high('Yes') : low('No')} ${label('Fortification:')} ${colorScore(result.gateway.overallFortification)}`,
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
export function formatResultJson(result: PhantomGateResult): string {
  return JSON.stringify(result, null, 2)
}
