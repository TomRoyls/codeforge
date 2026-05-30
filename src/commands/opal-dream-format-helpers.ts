// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { OpalDream, DreamField, OpalDreamResult } from './opal-dream-helpers.js'

// ─── Color Palette (opal iridescent) ───────────────────────────────
const high = chalk.rgb(180, 120, 220)
const midHigh = chalk.rgb(160, 100, 200)
const mid = chalk.rgb(140, 80, 180)
const lowMid = chalk.rgb(120, 60, 160)
const low = chalk.rgb(100, 40, 140)

const best = chalk.rgb(200, 140, 255).bold
const good = chalk.rgb(180, 120, 240)
const okay = chalk.rgb(160, 100, 220)
const poor = chalk.rgb(140, 80, 200)
const worst = chalk.rgb(120, 60, 180)

const heading = chalk.rgb(220, 160, 255).bold
const label = chalk.rgb(190, 130, 240)
const dim = chalk.rgb(140, 100, 160)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright opal
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
 * colorGrade('precious-opal') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'vivid-dream': best, 'lightning-flash': best, 'black-body': best,
    'perfectly-stable': best, 'symphony-pattern': best, 'precious-opal': best,
    'lightning-ridge': best, 'brilliant-field': best, 'master-dreamer': best,

    'colorful-vision': good, 'bright-spark': good, 'dark-body': good,
    'well-maintained': good, 'harmonious-design': good, 'boulder-opal': good,
    'coober-pedy': good, 'colorful-display': good, 'opal-hunter': good,

    'proper-dream': okay, 'proper-flash': okay, 'proper-body': okay,
    'proper-moisture': okay, 'proper-arrangement': okay, 'proper-opal': okay,
    'wello': okay, 'decent-patch': okay, 'gem-dreamer': okay,

    'fading-dream': poor, 'dim-flicker': poor, 'light-body': poor,
    'drying-out': poor, 'clashing-pattern': poor, 'common-opal': poor,
    'proper-field': poor, 'faint-glow': poor, 'apprentice': poor,

    'hazy-image': worst, 'white-body': worst,
    'cracking': worst, 'random-mix': worst, 'potch': worst,
    'dry-bed': worst, 'barely-visible': worst, 'novice': worst,

    'no-dream': worst, 'no-flash': worst, 'no-body': worst,
    'crazed': worst, 'no-pattern': worst, 'dust': worst,
    'no-field': worst, 'invisible': worst, 'sleepwalker': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Dream Formatting ──────────────────────────────────────────────

/**
 * Format a single dream for display
 * @example
 * formatDreamTable(dream) // colored dream info
 */
export function formatDreamTable(dream: OpalDream): string {
  const parts = [
    `${label('File:')} ${dim(dream.file)}`,
    `${label('Vividness:')} ${colorScore(dream.dreamVividness)} ${colorGrade(dream.dreaming.grade)}`,
    `${label('Brilliance:')} ${colorScore(dream.flashBrilliance)} ${colorGrade(dream.flashing.flash)}`,
    `${label('Body Tone:')} ${colorScore(dream.bodyTone)} ${colorGrade(dream.toning.tone)}`,
    `${label('Stability:')} ${colorScore(dream.hydroStability)} ${colorGrade(dream.stabilizing.hydro)}`,
    `${label('Harmony:')} ${colorScore(dream.patternHarmony)} ${colorGrade(dream.harmonizing.pattern)}`,
    `${label('Score:')} ${colorScore(dream.qualityScore)} ${colorGrade(dream.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format dreams as summary table
 * @example
 * formatDreamsTable(dreams) // multi-line table
 */
export function formatDreamsTable(dreams: OpalDream[]): string {
  if (dreams.length === 0) return dim('No opal dreams found')
  const header = heading('Opal Dream Analysis')
  const rows = dreams.map(d => formatDreamTable(d))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Field Formatting ──────────────────────────────────────────────

/**
 * Format a field for display
 * @example
 * formatFieldTable(field) // colored field info
 */
export function formatFieldTable(field: DreamField): string {
  const parts = [
    `${label('Field:')} ${dim(field.directory)}`,
    `${label('Type:')} ${colorGrade(field.fieldType)}`,
    `${label('Condition:')} ${colorGrade(field.condition)}`,
    `${label('Dreams:')} ${String(field.dreams.length)}`,
    `${label('Avg Vividness:')} ${colorScore(field.avgVividness)}`,
    `${label('Avg Brilliance:')} ${colorScore(field.avgBrilliance)}`,
    `${label('Avg Harmony:')} ${colorScore(field.avgHarmony)}`,
    `${label('Precious Opals:')} ${String(field.preciousOpalCount)}`,
    `${label('Dust:')} ${String(field.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all fields as summary
 * @example
 * formatFieldsTable(fields) // multi-line field summary
 */
export function formatFieldsTable(fields: DreamField[]): string {
  if (fields.length === 0) return dim('No opal fields found')
  const header = heading('Opal Dream Fields')
  const rows = fields.map(f => formatFieldTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: OpalDreamResult['stats']): string {
  const parts = [
    heading('Opal Dream Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Fields:')} ${String(stats.totalFields)}`,
    `${label('Avg Dream Vividness:')} ${colorScore(stats.avgDreamVividness)}`,
    `${label('Avg Flash Brilliance:')} ${colorScore(stats.avgFlashBrilliance)}`,
    `${label('Avg Body Tone:')} ${colorScore(stats.avgBodyTone)}`,
    `${label('Avg Hydro Stability:')} ${colorScore(stats.avgHydroStability)}`,
    `${label('Avg Pattern Harmony:')} ${colorScore(stats.avgPatternHarmony)}`,
    `${label('Precious Opals:')} ${String(stats.preciousOpalCount)}`,
    `${label('Boulder Opals:')} ${String(stats.boulderOpalCount)}`,
    `${label('Proper Opals:')} ${String(stats.properOpalCount)}`,
    `${label('Common Opals:')} ${String(stats.commonOpalCount)}`,
    `${label('Potch:')} ${String(stats.potchCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Vividness:')} ${String(stats.hasHighVividnessCount)}`,
    `${label('High Brilliance:')} ${String(stats.hasHighBrillianceCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('High Harmony:')} ${String(stats.hasHighHarmonyCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Dreamer Grade:')} ${colorGrade(stats.dreamerGrade)}`,
    `${label('Best Dream:')} ${stats.bestDream}`,
    `${label('Most Vivid:')} ${stats.mostVivid}`,
    `${label('Most Brilliant:')} ${stats.mostBrilliant}`,
    `${label('Strongest Body:')} ${stats.strongestBody}`,
    `${label('Most Stable:')} ${stats.mostStable}`,
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
export function formatResultTable(result: OpalDreamResult): string {
  const sections = [
    formatDreamsTable(result.dreams),
    '',
    formatFieldsTable(result.fields),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Vision')} ${label('Vivid:')} ${result.vision.isVivid ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.vision.overallBrilliance)}`,
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
export function formatResultJson(result: OpalDreamResult): string {
  return JSON.stringify(result, null, 2)
}
