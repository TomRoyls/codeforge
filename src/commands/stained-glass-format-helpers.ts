// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GlassPane, GlassWorkshop, StainedGlassResult } from './stained-glass-helpers.js'

// ─── Color Palette (stained glass) ─────────────────────────────────
const high = chalk.rgb(180, 120, 220)
const midHigh = chalk.rgb(160, 100, 200)
const mid = chalk.rgb(140, 80, 180)
const lowMid = chalk.rgb(120, 70, 160)
const low = chalk.rgb(100, 60, 140)

const best = chalk.rgb(200, 140, 255).bold
const good = chalk.rgb(180, 120, 240)
const okay = chalk.rgb(160, 100, 220)
const poor = chalk.rgb(130, 80, 190)
const worst = chalk.rgb(100, 60, 160)

const heading = chalk.rgb(190, 130, 250).bold
const label = chalk.rgb(170, 110, 230)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // stained purple
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
 * colorGrade('cathedral-window') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'symphony-colors': best, 'pure-lead': best, 'crystal-clear': best, 'masterwork-design': best, 'iron-frame': best,
    'cathedral-window': best, 'masterwork-collection': best, 'cathedral-studio': best, 'master-glazier': best,

    'harmonious-palette': good, 'strong-came': good, 'bright-transmission': good, 'beautiful-mosaic': good, 'strong-armature': good,
    'beautiful-panel': good, 'beautiful-display': good, 'glass-atelier': good, 'stained-glass-artist': good,

    'proper-matching': okay, 'proper-binding': okay, 'proper-light': okay, 'proper-pattern': okay, 'proper-support': okay,
    'proper-window': okay, 'decent-gallery': okay, 'proper-workshop': okay, 'skilled-craftsman': okay,

    'clashing-colors': poor, 'weak-joint': poor, 'tinted-glass': poor, 'random-tiles': poor, 'weak-frame': poor,
    'cracked-glass': poor, 'cracked-display': poor, 'home-studio': poor, 'apprentice': poor,

    'random-palette': worst, 'cracked-lead': worst, 'frosted': worst, 'broken-pattern': worst, 'buckling': worst,
    'shattered-pane': worst, 'broken-pieces': worst, 'craft-table': worst, 'novice': worst,

    'monochrome-drab': worst, 'no-binding': worst, 'opaque': worst, 'no-pattern': worst, 'no-frame': worst,
    'no-glass': worst, 'empty': worst, 'no-studio': worst, 'window-shopper': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Pane Formatting ───────────────────────────────────────────────

/**
 * Format a single pane for display
 * @example
 * formatPaneTable(pane) // colored pane info
 */
export function formatPaneTable(pane: GlassPane): string {
  const parts = [
    `${label('File:')} ${dim(pane.file)}`,
    `${label('Color Harmony:')} ${colorScore(pane.colorHarmony)} ${colorGrade(pane.harmonizing.grade)}`,
    `${label('Lead Quality:')} ${colorScore(pane.leadQuality)} ${colorGrade(pane.binding.lead)}`,
    `${label('Light Transmission:')} ${colorScore(pane.lightTransmission)} ${colorGrade(pane.transmitting.light)}`,
    `${label('Pattern Coherence:')} ${colorScore(pane.patternCoherence)} ${colorGrade(pane.patterning.pattern)}`,
    `${label('Structural Integrity:')} ${colorScore(pane.structuralIntegrity)} ${colorGrade(pane.structuring.frame)}`,
    `${label('Score:')} ${colorScore(pane.qualityScore)} ${colorGrade(pane.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format panes as summary table
 * @example
 * formatPanesTable(panes) // multi-line table
 */
export function formatPanesTable(panes: GlassPane[]): string {
  if (panes.length === 0) return dim('No glass panes found')
  const header = heading('Stained Glass Pane Analysis')
  const rows = panes.map(p => formatPaneTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Workshop Formatting ───────────────────────────────────────────

/**
 * Format a workshop for display
 * @example
 * formatWorkshopTable(workshop) // colored workshop info
 */
export function formatWorkshopTable(workshop: GlassWorkshop): string {
  const parts = [
    `${label('Workshop:')} ${dim(workshop.directory)}`,
    `${label('Type:')} ${colorGrade(workshop.workshopType)}`,
    `${label('Condition:')} ${colorGrade(workshop.condition)}`,
    `${label('Panes:')} ${String(workshop.panes.length)}`,
    `${label('Avg Harmony:')} ${colorScore(workshop.avgHarmony)}`,
    `${label('Avg Binding:')} ${colorScore(workshop.avgBinding)}`,
    `${label('Avg Integrity:')} ${colorScore(workshop.avgIntegrity)}`,
    `${label('Cathedral Windows:')} ${String(workshop.cathedralWindowCount)}`,
    `${label('No Glass:')} ${String(workshop.noGlassCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all workshops as summary
 * @example
 * formatWorkshopsTable(workshops) // multi-line workshop summary
 */
export function formatWorkshopsTable(workshops: GlassWorkshop[]): string {
  if (workshops.length === 0) return dim('No glass workshops found')
  const header = heading('Glass Workshop Analysis')
  const rows = workshops.map(w => formatWorkshopTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: StainedGlassResult['stats']): string {
  const parts = [
    heading('Stained Glass Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Workshops:')} ${String(stats.totalWorkshops)}`,
    `${label('Avg Color Harmony:')} ${colorScore(stats.avgColorHarmony)}`,
    `${label('Avg Lead Quality:')} ${colorScore(stats.avgLeadQuality)}`,
    `${label('Avg Light Transmission:')} ${colorScore(stats.avgLightTransmission)}`,
    `${label('Avg Pattern Coherence:')} ${colorScore(stats.avgPatternCoherence)}`,
    `${label('Avg Structural Integrity:')} ${colorScore(stats.avgStructuralIntegrity)}`,
    `${label('Cathedral Window:')} ${String(stats.cathedralWindowCount)}`,
    `${label('Beautiful Panel:')} ${String(stats.beautifulPanelCount)}`,
    `${label('Proper Window:')} ${String(stats.properWindowCount)}`,
    `${label('Cracked Glass:')} ${String(stats.crackedGlassCount)}`,
    `${label('Shattered Pane:')} ${String(stats.shatteredPaneCount)}`,
    `${label('No Glass:')} ${String(stats.noGlassCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Coherence:')} ${String(stats.hasHighCoherenceCount)}`,
    `${label('High Integrity:')} ${String(stats.hasHighIntegrityCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Artisan Grade:')} ${colorGrade(stats.artisanGrade)}`,
    `${label('Best Pane:')} ${stats.bestPane}`,
    `${label('Most Harmonious:')} ${stats.mostHarmonious}`,
    `${label('Best Bound:')} ${stats.bestBound}`,
    `${label('Most Transparent:')} ${stats.mostTransparent}`,
    `${label('Most Coherent:')} ${stats.mostCoherent}`,
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
export function formatResultTable(result: StainedGlassResult): string {
  const sections = [
    formatPanesTable(result.panes),
    '',
    formatWorkshopsTable(result.workshops),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Cathedral')} ${label('Luminous:')} ${result.cathedral.isLuminous ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.cathedral.overallBrilliance)}`,
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
export function formatResultJson(result: StainedGlassResult): string {
  return JSON.stringify(result, null, 2)
}
