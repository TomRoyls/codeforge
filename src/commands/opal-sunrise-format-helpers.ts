// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { OpalShard, SunriseField, OpalSunriseResult } from './opal-sunrise-helpers.js'

// ─── Color Palette (opal sunrise — iridescent teal/purple/silver) ──
const high = chalk.rgb(180, 230, 245)
const midHigh = chalk.rgb(140, 210, 220)
const mid = chalk.rgb(170, 160, 235)
const lowMid = chalk.rgb(150, 130, 210)
const low = chalk.rgb(120, 100, 185)

const best = chalk.rgb(220, 245, 255).bold
const good = chalk.rgb(160, 225, 235)
const okay = chalk.rgb(180, 165, 240)
const poor = chalk.rgb(155, 135, 215)
const worst = chalk.rgb(125, 105, 190)

const heading = chalk.rgb(200, 240, 250).bold
const label = chalk.rgb(165, 215, 235)
const dim = chalk.rgb(145, 195, 225)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // iridescent
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
 * colorGrade('black-opal') // best (bold iridescent)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'black-opal': best, 'kaleidoscopic': best, 'crystal-dawn': best,
    'blazing-hearth': best, 'full-spectrum': best, 'dreamlike-glow': best,
    'lightning-ridge': best, 'magnificent-sunrise': best, 'master-lapidary': best,

    'precious-opal': good, 'vivid-play': good, 'clear-morning': good,
    'warm-ember': good, 'rich-range': good, 'luminous-sheen': good,
    'coober-pedy': good, 'beautiful-dawn': good, 'expert-cutter': good,

    'common-opal': okay, 'proper-color': okay, 'proper-daybreak': okay,
    'proper-glow': okay, 'proper-variety': okay, 'proper-glow': okay,
    'proper-deposit': okay, 'decent-morning': okay, 'skilled-polisher': okay,

    'fire-opal': poor, 'faint-flash': poor, 'misty-dawn': poor,
    'cool-flame': poor, 'limited-palette': poor, 'dull-shine': poor,
    'small-seam': poor, 'grey-dawn': poor, 'apprentice': poor,

    'wood-opal': worst, 'dull-opal': worst, 'foggy-morning': worst,
    'cold-cinder': worst, 'monochrome': worst, 'flat-surface': worst,
    'surface-find': worst, 'dark-morning': worst, 'novice': worst,

    'potch': worst, 'no-play': worst, 'no-light': worst,
    'no-fire': worst, 'no-spectrum': worst, 'no-opalescence': worst,
    'no-field': worst, 'void': worst, 'rock-tumbler': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Shard Formatting ─────────────────────────────────────────────

/**
 * Format a single opal shard for display
 * @example
 * formatShardTable(shard) // colored shard info
 */
export function formatShardTable(shard: OpalShard): string {
  const parts = [
    `${label('File:')} ${dim(shard.file)}`,
    `${label('Play of Color:')} ${colorScore(shard.playOfColor)} ${colorGrade(shard.diffracting.grade)}`,
    `${label('Dawn Clarity:')} ${colorScore(shard.dawnClarity)} ${colorGrade(shard.illuminating.dawn)}`,
    `${label('Fire Warmth:')} ${colorScore(shard.fireWarmth)} ${colorGrade(shard.warming.fire)}`,
    `${label('Spectrum Richness:')} ${colorScore(shard.spectrumRichness)} ${colorGrade(shard.spanning.spectrum)}`,
    `${label('Opalescence Quality:')} ${colorScore(shard.opalescenceQuality)} ${colorGrade(shard.glowing.quality)}`,
    `${label('Score:')} ${colorScore(shard.qualityScore)} ${colorGrade(shard.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format shards as summary table
 * @example
 * formatShardsTable(shards) // multi-line table
 */
export function formatShardsTable(shards: OpalShard[]): string {
  if (shards.length === 0) return dim('No opal shards found')
  const header = heading('Opal Shard Analysis')
  const rows = shards.map(sh => formatShardTable(sh))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Field Formatting ──────────────────────────────────────────────

/**
 * Format a single sunrise field for display
 * @example
 * formatFieldTable(field) // colored field info
 */
export function formatFieldTable(field: SunriseField): string {
  const parts = [
    `${label('Field:')} ${dim(field.directory)}`,
    `${label('Type:')} ${colorGrade(field.fieldType)}`,
    `${label('Condition:')} ${colorGrade(field.condition)}`,
    `${label('Shards:')} ${String(field.shards.length)}`,
    `${label('Avg Play:')} ${colorScore(field.avgPlay)}`,
    `${label('Avg Clarity:')} ${colorScore(field.avgClarity)}`,
    `${label('Avg Opalescence:')} ${colorScore(field.avgOpalescence)}`,
    `${label('Black Opals:')} ${String(field.blackOpalCount)}`,
    `${label('Potch Count:')} ${String(field.potchCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all sunrise fields as summary
 * @example
 * formatFieldsTable(fields) // multi-line summary
 */
export function formatFieldsTable(fields: SunriseField[]): string {
  if (fields.length === 0) return dim('No sunrise fields found')
  const header = heading('Sunrise Fields')
  const rows = fields.map(f => formatFieldTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: OpalSunriseResult['stats']): string {
  const parts = [
    heading('Opal Sunrise Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Fields:')} ${String(stats.totalFields)}`,
    `${label('Avg Play of Color:')} ${colorScore(stats.avgPlayOfColor)}`,
    `${label('Avg Dawn Clarity:')} ${colorScore(stats.avgDawnClarity)}`,
    `${label('Avg Fire Warmth:')} ${colorScore(stats.avgFireWarmth)}`,
    `${label('Avg Spectrum Richness:')} ${colorScore(stats.avgSpectrumRichness)}`,
    `${label('Avg Opalescence Quality:')} ${colorScore(stats.avgOpalescenceQuality)}`,
    `${label('Black Opal:')} ${String(stats.blackOpalCount)}`,
    `${label('Precious Opal:')} ${String(stats.preciousOpalCount)}`,
    `${label('Common Opal:')} ${String(stats.commonOpalCount)}`,
    `${label('Fire Opal:')} ${String(stats.fireOpalCount)}`,
    `${label('Wood Opal:')} ${String(stats.woodOpalCount)}`,
    `${label('Potch:')} ${String(stats.potchCount)}`,
    `${label('High Play:')} ${String(stats.hasHighPlayCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Warmth:')} ${String(stats.hasHighWarmthCount)}`,
    `${label('High Richness:')} ${String(stats.hasHighRichnessCount)}`,
    `${label('High Opalescence:')} ${String(stats.hasHighOpalescenceCount)}`,
    `${label('Overall Brilliance:')} ${colorScore(stats.overallBrilliance)}`,
    `${label('Lapidary Grade:')} ${colorGrade(stats.lapidaryGrade)}`,
    `${label('Best Shard:')} ${stats.bestShard}`,
    `${label('Most Colorful:')} ${stats.mostColorful}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Warmest:')} ${stats.warmest}`,
    `${label('Most Luminous:')} ${stats.mostLuminous}`,
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
  const items = recommendations.map(r => `${dim('\u{1F48E}')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: OpalSunriseResult): string {
  const sections = [
    formatShardsTable(result.shards),
    '',
    formatFieldsTable(result.fields),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Sunrise')} ${label('Luminous:')} ${result.sunrise.isLuminous ? high('Yes') : low('No')} ${label('Overall Brilliance:')} ${colorScore(result.sunrise.overallBrilliance)}`,
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
export function formatResultJson(result: OpalSunriseResult): string {
  return JSON.stringify(result, null, 2)
}
