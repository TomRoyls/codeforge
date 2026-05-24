// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AmberSpecimen, AmberTower, AmberSpireResult } from './amber-spire-helpers.js'

// ─── Color Palette (amber spire — amber/gold/honey) ───────────────
const high = chalk.rgb(255, 191, 0)
const midHigh = chalk.rgb(235, 171, 0)
const mid = chalk.rgb(215, 151, 0)
const lowMid = chalk.rgb(195, 131, 0)
const low = chalk.rgb(175, 111, 0)

const best = chalk.rgb(255, 215, 0).bold
const good = chalk.rgb(255, 191, 0)
const okay = chalk.rgb(230, 165, 0)
const poor = chalk.rgb(200, 130, 0)
const worst = chalk.rgb(165, 95, 0)

const heading = chalk.rgb(245, 185, 10).bold
const label = chalk.rgb(225, 165, 8)
const dim = chalk.rgb(200, 140, 5)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // golden amber
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
 * colorGrade('masterpiece-amber') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'perfect-amber': best, 'monumental-spire': best, 'visible-through-amber': best,
    'diamond-hard-resin': best, 'prehistoric-amber': best, 'masterpiece-amber': best,
    'amber-cathedral': best, 'magnificent-amber': best, 'master-curator': best,

    'golden-preservation': good, 'strong-tower': good, 'clear-specimen': good,
    'strong-amber': good, 'ancient-resin': good, 'golden-specimen': good,
    'golden-tower': good, 'golden-collection': good, 'expert-paleontologist': good,

    'proper-resin': okay, 'proper-pillar': okay, 'proper-detail': okay,
    'proper-hardening': okay, 'proper-longevity': okay, 'proper-fossil': okay,
    'proper-spire': okay, 'decent-museum': okay, 'skilled-collector': okay,

    'cloudy-amber': poor, 'weak-column': poor, 'blurred-detail': poor,
    'soft-resin': poor, 'recent-fossil': poor, 'cloudy-resin': poor,
    'small-pillar': poor, 'cracked-display': poor, 'apprentice': poor,

    'cracked-resin': worst, 'crumbling-tower': worst, 'hidden-insect': worst,
    'sticky-sap': worst, 'fresh-sap': worst, 'cracked-amber': worst,
    'broken-shaft': worst, 'dusty-shelf': worst, 'novice': worst,

    'no-preservation': worst, 'no-structure': worst, 'no-detail': worst,
    'no-resin': worst, 'no-time': worst, 'dust': worst,
    'no-tower': worst, 'void': worst, 'looter': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Specimen Formatting ──────────────────────────────────────────

/**
 * Format a single specimen for display
 * @example
 * formatSpecimenTable(specimen) // colored specimen info
 */
export function formatSpecimenTable(specimen: AmberSpecimen): string {
  const parts = [
    `${label('File:')} ${dim(specimen.file)}`,
    `${label('Preservation Quality:')} ${colorScore(specimen.preservationQuality)} ${colorGrade(specimen.capturing.grade)}`,
    `${label('Golden Structure:')} ${colorScore(specimen.goldenStructure)} ${colorGrade(specimen.structuring.structure)}`,
    `${label('Insect Clarity:')} ${colorScore(specimen.insectClarity)} ${colorGrade(specimen.revealing.insect)}`,
    `${label('Resin Strength:')} ${colorScore(specimen.resinStrength)} ${colorGrade(specimen.encapsulating.resin)}`,
    `${label('Time Depth:')} ${colorScore(specimen.timeDepth)} ${colorGrade(specimen.enduring.time)}`,
    `${label('Score:')} ${colorScore(specimen.qualityScore)} ${colorGrade(specimen.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format specimens as summary table
 * @example
 * formatSpecimensTable(specimens) // multi-line table
 */
export function formatSpecimensTable(specimens: AmberSpecimen[]): string {
  if (specimens.length === 0) return dim('No amber specimens found')
  const header = heading('Amber Spire Analysis')
  const rows = specimens.map(sp => formatSpecimenTable(sp))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Tower Formatting ──────────────────────────────────────────────

/**
 * Format a tower for display
 * @example
 * formatTowerTable(tower) // colored tower info
 */
export function formatTowerTable(tower: AmberTower): string {
  const parts = [
    `${label('Tower:')} ${dim(tower.directory)}`,
    `${label('Type:')} ${colorGrade(tower.towerType)}`,
    `${label('Condition:')} ${colorGrade(tower.condition)}`,
    `${label('Specimens:')} ${String(tower.specimens.length)}`,
    `${label('Avg Preservation:')} ${colorScore(tower.avgPreservation)}`,
    `${label('Avg Structure:')} ${colorScore(tower.avgStructure)}`,
    `${label('Avg Depth:')} ${colorScore(tower.avgDepth)}`,
    `${label('Masterpiece Amber:')} ${String(tower.masterpieceAmberCount)}`,
    `${label('Dust:')} ${String(tower.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all towers as summary
 * @example
 * formatTowersTable(towers) // multi-line summary
 */
export function formatTowersTable(towers: AmberTower[]): string {
  if (towers.length === 0) return dim('No amber towers found')
  const header = heading('Amber Towers')
  const rows = towers.map(t => formatTowerTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AmberSpireResult['stats']): string {
  const parts = [
    heading('Amber Spire Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Towers:')} ${String(stats.totalTowers)}`,
    `${label('Avg Preservation Quality:')} ${colorScore(stats.avgPreservationQuality)}`,
    `${label('Avg Golden Structure:')} ${colorScore(stats.avgGoldenStructure)}`,
    `${label('Avg Insect Clarity:')} ${colorScore(stats.avgInsectClarity)}`,
    `${label('Avg Resin Strength:')} ${colorScore(stats.avgResinStrength)}`,
    `${label('Avg Time Depth:')} ${colorScore(stats.avgTimeDepth)}`,
    `${label('Masterpiece Amber:')} ${String(stats.masterpieceAmberCount)}`,
    `${label('Golden Specimen:')} ${String(stats.goldenSpecimenCount)}`,
    `${label('Proper Fossil:')} ${String(stats.properFossilCount)}`,
    `${label('Cloudy Resin:')} ${String(stats.cloudyResinCount)}`,
    `${label('Cracked Amber:')} ${String(stats.crackedAmberCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Golden:')} ${String(stats.hasHighGoldenCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('Overall Preservation:')} ${colorScore(stats.overallPreservation)}`,
    `${label('Curator Grade:')} ${colorGrade(stats.curatorGrade)}`,
    `${label('Best Specimen:')} ${stats.bestSpecimen}`,
    `${label('Best Preserved:')} ${stats.bestPreserved}`,
    `${label('Best Structure:')} ${stats.bestStructure}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Deepest:')} ${stats.deepest}`,
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
export function formatResultTable(result: AmberSpireResult): string {
  const sections = [
    formatSpecimensTable(result.specimens),
    '',
    formatTowersTable(result.towers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Museum')} ${label('Preserved:')} ${result.museum.isPreserved ? high('Yes') : low('No')} ${label('Overall Preservation:')} ${colorScore(result.museum.overallPreservation)}`,
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
export function formatResultJson(result: AmberSpireResult): string {
  return JSON.stringify(result, null, 2)
}
