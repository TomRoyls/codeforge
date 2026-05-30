// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { PuppetShadow, PuppetTheater, ShadowPuppetResult } from './shadow-puppet-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(120, 80, 160)
const midHigh = chalk.rgb(100, 70, 140)
const mid = chalk.rgb(80, 55, 120)
const lowMid = chalk.rgb(60, 40, 100)
const low = chalk.rgb(40, 25, 70)

const best = chalk.rgb(160, 120, 200).bold
const good = chalk.rgb(130, 100, 170)
const okay = chalk.rgb(100, 75, 140)
const poor = chalk.rgb(70, 50, 110)
const worst = chalk.rgb(40, 25, 70)

const heading = chalk.rgb(140, 100, 190).bold
const label = chalk.rgb(120, 85, 160)
const dim = chalk.rgb(140, 130, 160)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep purple
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
 * colorGrade('master-puppet') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'sharp-silhouette': best, 'vivid-projection': best, 'fully-articulated': best,
    'center-stage': best, 'epic-tale': best, 'master-puppet': best,
    'grand-opera': best, 'sold-out-show': best, 'master-puppeteer': best,

    'clear-outline': good, 'strong-presence': good, 'flexible-limbs': good,
    'spotlight': good, 'compelling-story': good, 'skilled-puppet': good,
    'shadow-theater': good, 'standing-ovation': good, 'skilled-performer': good,

    'proper-shape': okay, 'proper-shadow': okay, 'proper-joints': okay,
    'proper-stage': okay, 'proper-narrative': okay, 'proper-puppet': okay,
    'street-show': okay, 'applause': okay, 'proper-showman': okay,

    'blurred-edge': poor, 'faint-shadow': poor, 'stiff-joints': poor,
    'background': poor, 'rambling': poor, 'rag-doll': poor,
    'bedroom-show': poor, 'polite-clapping': poor, 'amateur': poor,

    'formless': worst, 'barely-visible': worst, 'rigid-body': worst,
    'offstage': worst, 'incoherent': worst, 'paper-cutout': worst,
    'empty-stage': worst, 'empty-seats': worst, 'novice': worst,

    'invisible': worst, 'no-shadow': worst, 'frozen': worst,
    'backstage': worst, 'silent': worst, 'no-puppet': worst,
    'no-theater': worst, 'theater-closed': worst, 'audience-member': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Shadow Formatting ─────────────────────────────────────────────

/**
 * Format a single shadow for display
 * @example
 * formatShadowTable(shadow) // colored shadow info
 */
export function formatShadowTable(shadow: PuppetShadow): string {
  const parts = [
    `${label('File:')} ${dim(shadow.file)}`,
    `${label('Silhouette Clarity:')} ${colorScore(shadow.silhouetteClarity)} ${colorGrade(shadow.defining.grade)}`,
    `${label('Projection Quality:')} ${colorScore(shadow.projectionQuality)} ${colorGrade(shadow.projecting.projection)}`,
    `${label('Limb Articulation:')} ${colorScore(shadow.limbArticulation)} ${colorGrade(shadow.articulating.articulation)}`,
    `${label('Screen Presence:')} ${colorScore(shadow.screenPresence)} ${colorGrade(shadow.presenting.stage)}`,
    `${label('Narrative Flow:')} ${colorScore(shadow.narrativeFlow)} ${colorGrade(shadow.narrating.story)}`,
    `${label('Score:')} ${colorScore(shadow.qualityScore)} ${colorGrade(shadow.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format shadows as summary table
 * @example
 * formatShadowsTable(shadows) // multi-line table
 */
export function formatShadowsTable(shadows: PuppetShadow[]): string {
  if (shadows.length === 0) return dim('No shadow puppets found')
  const header = heading('Shadow Puppet Analysis')
  const rows = shadows.map(s => formatShadowTable(s))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Theater Formatting ────────────────────────────────────────────

/**
 * Format a theater for display
 * @example
 * formatTheaterTable(theater) // colored theater info
 */
export function formatTheaterTable(theater: PuppetTheater): string {
  const parts = [
    `${label('Theater:')} ${dim(theater.directory)}`,
    `${label('Type:')} ${colorGrade(theater.theaterType)}`,
    `${label('Condition:')} ${colorGrade(theater.condition)}`,
    `${label('Shadows:')} ${String(theater.shadows.length)}`,
    `${label('Avg Clarity:')} ${colorScore(theater.avgClarity)}`,
    `${label('Avg Presence:')} ${colorScore(theater.avgPresence)}`,
    `${label('Avg Flow:')} ${colorScore(theater.avgFlow)}`,
    `${label('Master Puppets:')} ${String(theater.masterPuppetCount)}`,
    `${label('No Puppets:')} ${String(theater.noPuppetCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all theaters as summary
 * @example
 * formatTheatersTable(theaters) // multi-line theater summary
 */
export function formatTheatersTable(theaters: PuppetTheater[]): string {
  if (theaters.length === 0) return dim('No puppet theaters found')
  const header = heading('Puppet Theater Analysis')
  const rows = theaters.map(t => formatTheaterTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ShadowPuppetResult['stats']): string {
  const parts = [
    heading('Performance Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Theaters:')} ${String(stats.totalTheaters)}`,
    `${label('Avg Silhouette Clarity:')} ${colorScore(stats.avgSilhouetteClarity)}`,
    `${label('Avg Projection Quality:')} ${colorScore(stats.avgProjectionQuality)}`,
    `${label('Avg Limb Articulation:')} ${colorScore(stats.avgLimbArticulation)}`,
    `${label('Avg Screen Presence:')} ${colorScore(stats.avgScreenPresence)}`,
    `${label('Avg Narrative Flow:')} ${colorScore(stats.avgNarrativeFlow)}`,
    `${label('Master Puppets:')} ${String(stats.masterPuppetCount)}`,
    `${label('Skilled Puppets:')} ${String(stats.skilledPuppetCount)}`,
    `${label('Proper Puppets:')} ${String(stats.properPuppetCount)}`,
    `${label('Rag Dolls:')} ${String(stats.ragDollCount)}`,
    `${label('Paper Cutouts:')} ${String(stats.paperCutoutCount)}`,
    `${label('No Puppets:')} ${String(stats.noPuppetCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Flexibility:')} ${String(stats.hasHighFlexibilityCount)}`,
    `${label('High Presence:')} ${String(stats.hasHighPresenceCount)}`,
    `${label('High Flow:')} ${String(stats.hasHighFlowCount)}`,
    `${label('Overall Artistry:')} ${colorScore(stats.overallArtistry)}`,
    `${label('Puppeteer Grade:')} ${colorGrade(stats.puppeteerGrade)}`,
    `${label('Best Shadow:')} ${stats.bestShadow}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Projected:')} ${stats.bestProjected}`,
    `${label('Most Articulate:')} ${stats.mostArticulate}`,
    `${label('Best Presence:')} ${stats.bestPresence}`,
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
export function formatResultTable(result: ShadowPuppetResult): string {
  const sections = [
    formatShadowsTable(result.shadows),
    '',
    formatTheatersTable(result.theaters),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Performance')} ${label('Performing:')} ${result.performance.isPerforming ? high('Yes') : low('No')} ${label('Overall Artistry:')} ${colorScore(result.performance.overallArtistry)}`,
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
export function formatResultJson(result: ShadowPuppetResult): string {
  return JSON.stringify(result, null, 2)
}
