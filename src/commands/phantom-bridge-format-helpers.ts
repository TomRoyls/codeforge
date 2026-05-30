// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PhantomSpan, BridgeCrossing, PhantomBridgeResult } from './phantom-bridge-helpers.js'

// ─── Color Palette (phantom bridge — ethereal blue/ghost-white/mist) ─
const high = chalk.rgb(140, 180, 220)
const midHigh = chalk.rgb(130, 170, 210)
const mid = chalk.rgb(120, 160, 200)
const lowMid = chalk.rgb(110, 150, 190)
const low = chalk.rgb(100, 140, 180)

const best = chalk.rgb(160, 200, 240).bold
const good = chalk.rgb(145, 190, 230)
const okay = chalk.rgb(130, 175, 215)
const poor = chalk.rgb(115, 155, 195)
const worst = chalk.rgb(100, 135, 175)

const heading = chalk.rgb(130, 175, 220).bold
const label = chalk.rgb(140, 165, 200)
const dim = chalk.rgb(120, 145, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // ethereal-blue
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
 * colorGrade('ethereal-crossing') // best (bold ghost-white)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'stone-arch': best, 'exorcist': best, 'lighthouse-guided': best,
    'crystal-clear': best, 'eternal-bridge': best, 'ethereal-crossing': best,
    'grand-viaduct': best, 'magnificent-span': best, 'master-architect': best,

    'proper-bridge': good, 'ghost-whisperer': good, 'fog-horn': good,
    'transparent-ghost': good, 'resilient-structure': good, 'solid-phantom': good,
    'proper-crossing': good, 'sturdy-bridge': good, 'bridge-engineer': good,

    'suspension-cable': okay, 'proper-handler': okay, 'proper-compass': okay,
    'proper-visibility': okay, 'proper-endurance': okay,
    'decent-bridge': okay, 'decent-crossing': okay, 'skilled-builder': okay,

    'rope-bridge': poor, 'ghost-ignorer': poor, 'lost-in-fog': poor,
    'translucent': poor, 'crumbling-arch': poor,
    'narrow-footbridge': poor, 'rickety-planks': poor, 'apprentice': poor,

    'rotting-planks': worst, 'haunted-code': worst, 'blind-wandering': worst,
    'nearly-invisible': worst, 'collapsing-bridge': worst, 'ghostly-remains': worst,
    'stepping-stones': worst, 'broken-bridge': worst, 'novice': worst,

    'no-bridge': worst, 'poltergeist': worst, 'no-navigation': worst,
    'invisible': worst, 'no-resilience': worst, 'void': worst,
    'no-crossing': worst, 'collapser': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Span Formatting ──────────────────────────────────────────────

/**
 * Format a single span for display
 * @example
 * formatSpanTable(span) // colored span info
 */
export function formatSpanTable(span: PhantomSpan): string {
  const parts = [
    `${label('File:')} ${dim(span.file)}`,
    `${label('Connection Stability:')} ${colorScore(span.connectionStability)} ${colorGrade(span.bridging.grade)}`,
    `${label('Ghost Handling:')} ${colorScore(span.ghostHandling)} ${colorGrade(span.haunting.ghost)}`,
    `${label('Fog Navigation:')} ${colorScore(span.fogNavigation)} ${colorGrade(span.navigating.fog)}`,
    `${label('Spirit Transparency:')} ${colorScore(span.spiritTransparency)} ${colorGrade(span.revealing.spirit)}`,
    `${label('Phantom Resilience:')} ${colorScore(span.phantomResilience)} ${colorGrade(span.enduring.phantom)}`,
    `${label('Score:')} ${colorScore(span.qualityScore)} ${colorGrade(span.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format spans as summary table
 * @example
 * formatSpansTable(spans) // multi-line table
 */
export function formatSpansTable(spans: PhantomSpan[]): string {
  if (spans.length === 0) return dim('No phantom spans found')
  const header = heading('Phantom Bridge Analysis')
  const rows = spans.map(s => formatSpanTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Crossing Formatting ──────────────────────────────────────────

/**
 * Format a crossing for display
 * @example
 * formatCrossingTable(crossing) // colored crossing info
 */
export function formatCrossingTable(crossing: BridgeCrossing): string {
  const parts = [
    `${label('Crossing:')} ${dim(crossing.directory)}`,
    `${label('Type:')} ${colorGrade(crossing.crossingType)}`,
    `${label('Condition:')} ${colorGrade(crossing.condition)}`,
    `${label('Spans:')} ${String(crossing.spans.length)}`,
    `${label('Avg Stability:')} ${colorScore(crossing.avgStability)}`,
    `${label('Avg Transparency:')} ${colorScore(crossing.avgTransparency)}`,
    `${label('Avg Resilience:')} ${colorScore(crossing.avgResilience)}`,
    `${label('Ethereal Crossings:')} ${String(crossing.etherealCrossingCount)}`,
    `${label('Void:')} ${String(crossing.voidCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all crossings as summary
 * @example
 * formatCrossingsTable(crossings) // multi-line summary
 */
export function formatCrossingsTable(crossings: BridgeCrossing[]): string {
  if (crossings.length === 0) return dim('No bridge crossings found')
  const header = heading('Bridge Crossings')
  const rows = crossings.map(c => formatCrossingTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: PhantomBridgeResult['stats']): string {
  const parts = [
    heading('Phantom Bridge Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Crossings:')} ${String(stats.totalCrossings)}`,
    `${label('Avg Connection Stability:')} ${colorScore(stats.avgConnectionStability)}`,
    `${label('Avg Ghost Handling:')} ${colorScore(stats.avgGhostHandling)}`,
    `${label('Avg Fog Navigation:')} ${colorScore(stats.avgFogNavigation)}`,
    `${label('Avg Spirit Transparency:')} ${colorScore(stats.avgSpiritTransparency)}`,
    `${label('Avg Phantom Resilience:')} ${colorScore(stats.avgPhantomResilience)}`,
    `${label('Ethereal Crossing:')} ${String(stats.etherealCrossingCount)}`,
    `${label('Solid Phantom:')} ${String(stats.solidPhantomCount)}`,
    `${label('Proper Bridge:')} ${String(stats.properBridgeCount)}`,
    `${label('Crumbling Arch:')} ${String(stats.crumblingArchCount)}`,
    `${label('Ghostly Remains:')} ${String(stats.ghostlyRemainsCount)}`,
    `${label('Void:')} ${String(stats.voidCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('High Handling:')} ${String(stats.hasHighHandlingCount)}`,
    `${label('High Navigation:')} ${String(stats.hasHighNavigationCount)}`,
    `${label('High Transparency:')} ${String(stats.hasHighTransparencyCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('Overall Span Quality:')} ${colorScore(stats.overallSpanQuality)}`,
    `${label('Engineer Grade:')} ${colorGrade(stats.engineerGrade)}`,
    `${label('Best Span:')} ${stats.bestSpan}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
    `${label('Best Ghost Handler:')} ${stats.bestGhostHandler}`,
    `${label('Best Navigator:')} ${stats.bestNavigator}`,
    `${label('Most Transparent:')} ${stats.mostTransparent}`,
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
export function formatResultTable(result: PhantomBridgeResult): string {
  const sections = [
    formatSpansTable(result.spans),
    '',
    formatCrossingsTable(result.crossings),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Network')} ${label('Connected:')} ${result.network.isConnected ? high('Yes') : low('No')} ${label('Overall Span Quality:')} ${colorScore(result.network.overallSpanQuality)}`,
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
export function formatResultJson(result: PhantomBridgeResult): string {
  return JSON.stringify(result, null, 2)
}
