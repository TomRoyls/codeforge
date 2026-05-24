// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { OnyxShadow, OnyxChamber, OnyxShadowResult } from './onyx-shadow-helpers.js'

// ─── Color Palette (onyx deep black) ───────────────────────────────
const high = chalk.rgb(80, 80, 100)
const midHigh = chalk.rgb(65, 65, 85)
const mid = chalk.rgb(50, 50, 70)
const lowMid = chalk.rgb(40, 40, 55)
const low = chalk.rgb(30, 30, 40)

const best = chalk.rgb(100, 100, 130).bold
const good = chalk.rgb(85, 85, 115)
const okay = chalk.rgb(65, 65, 95)
const poor = chalk.rgb(50, 50, 75)
const worst = chalk.rgb(35, 35, 55)

const heading = chalk.rgb(120, 120, 150).bold
const label = chalk.rgb(95, 95, 125)
const dim = chalk.rgb(100, 100, 100)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep indigo
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
 * colorGrade('masterpiece-onyx') // best (bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'abyssal-depth': best, 'mirror-black': best, 'bedrock-solid': best,
    'shadow-master': best, 'total-focus': best, 'masterpiece-onyx': best,
    'shadow-vault': best, 'obsidian-hall': best, 'shadow-lord': best,

    'deep-shadow': good, 'silk-polish': good, 'deep-rooted': good,
    'dark-integration': good, 'deep-concentration': good, 'fine-black-onyx': good,
    'deep-crypt': good, 'dark-gallery': good, 'dark-keeper': good,

    'proper-darkness': okay, 'proper-sheen': okay, 'proper-grounding': okay,
    'proper-handling': okay, 'proper-absorption': okay, 'proper-stone': okay,
    'proper-chamber': okay, 'decent-display': okay, 'stone-guardian': okay,

    'surface-shadow': poor, 'rough-surface': poor, 'shallow-ground': poor,
    'partial-coverage': poor, 'scattered': poor, 'banded-agate': poor,
    'stone-room': poor, 'dim-room': poor, 'apprentice': poor,

    'thin-veil': worst, 'unpolished': worst, 'floating': worst,
    'shadow-gaps': worst, 'distracted': worst, 'common-chalcedony': worst,
    'pebble-box': worst, 'empty-shelf': worst, 'novice': worst,

    'transparent': worst, 'raw-stone': worst, 'unanchored': worst,
    'no-handling': worst, 'dispersed': worst, 'gravel': worst,
    'no-chamber': worst, 'void': worst, 'surface-dweller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Shadow Formatting ─────────────────────────────────────────────

/**
 * Format a single shadow for display
 * @example
 * formatShadowTable(shadow) // colored shadow info
 */
export function formatShadowTable(shadow: OnyxShadow): string {
  const parts = [
    `${label('File:')} ${dim(shadow.file)}`,
    `${label('Mystery:')} ${colorScore(shadow.depthMystery)} ${colorGrade(shadow.deepening.grade)}`,
    `${label('Polish:')} ${colorScore(shadow.polishPerfection)} ${colorGrade(shadow.polishing.polish)}`,
    `${label('Strength:')} ${colorScore(shadow.groundingStrength)} ${colorGrade(shadow.grounding.ground)}`,
    `${label('Integration:')} ${colorScore(shadow.shadowIntegration)} ${colorGrade(shadow.integrating.integration)}`,
    `${label('Absorption:')} ${colorScore(shadow.lightAbsorption)} ${colorGrade(shadow.absorbing.focus)}`,
    `${label('Score:')} ${colorScore(shadow.qualityScore)} ${colorGrade(shadow.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format shadows as summary table
 * @example
 * formatShadowsTable(shadows) // multi-line table
 */
export function formatShadowsTable(shadows: OnyxShadow[]): string {
  if (shadows.length === 0) return dim('No onyx shadows found')
  const header = heading('Onyx Shadow Analysis')
  const rows = shadows.map(sh => formatShadowTable(sh))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Chamber Formatting ────────────────────────────────────────────

/**
 * Format a chamber for display
 * @example
 * formatChamberTable(chamber) // colored chamber info
 */
export function formatChamberTable(chamber: OnyxChamber): string {
  const parts = [
    `${label('Chamber:')} ${dim(chamber.directory)}`,
    `${label('Type:')} ${colorGrade(chamber.chamberType)}`,
    `${label('Condition:')} ${colorGrade(chamber.condition)}`,
    `${label('Shadows:')} ${String(chamber.shadows.length)}`,
    `${label('Avg Mystery:')} ${colorScore(chamber.avgMystery)}`,
    `${label('Avg Polish:')} ${colorScore(chamber.avgPerfection)}`,
    `${label('Avg Strength:')} ${colorScore(chamber.avgStrength)}`,
    `${label('Masterpiece Onyx:')} ${String(chamber.masterpieceOnyxCount)}`,
    `${label('Gravel:')} ${String(chamber.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all chambers as summary
 * @example
 * formatChambersTable(chambers) // multi-line chamber summary
 */
export function formatChambersTable(chambers: OnyxChamber[]): string {
  if (chambers.length === 0) return dim('No onyx chambers found')
  const header = heading('Onyx Chambers')
  const rows = chambers.map(ch => formatChamberTable(ch))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: OnyxShadowResult['stats']): string {
  const parts = [
    heading('Onyx Shadow Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Chambers:')} ${String(stats.totalChambers)}`,
    `${label('Avg Depth Mystery:')} ${colorScore(stats.avgDepthMystery)}`,
    `${label('Avg Polish Perfection:')} ${colorScore(stats.avgPolishPerfection)}`,
    `${label('Avg Grounding Strength:')} ${colorScore(stats.avgGroundingStrength)}`,
    `${label('Avg Shadow Integration:')} ${colorScore(stats.avgShadowIntegration)}`,
    `${label('Avg Light Absorption:')} ${colorScore(stats.avgLightAbsorption)}`,
    `${label('Masterpiece Onyx:')} ${String(stats.masterpieceOnyxCount)}`,
    `${label('Fine Black Onyx:')} ${String(stats.fineBlackOnyxCount)}`,
    `${label('Proper Stone:')} ${String(stats.properStoneCount)}`,
    `${label('Banded Agate:')} ${String(stats.bandedAgateCount)}`,
    `${label('Common Chalcedony:')} ${String(stats.commonChalcedonyCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Mystery:')} ${String(stats.hasHighMysteryCount)}`,
    `${label('High Perfection:')} ${String(stats.hasHighPerfectionCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Shadow:')} ${String(stats.hasHighShadowCount)}`,
    `${label('High Absorption:')} ${String(stats.hasHighAbsorptionCount)}`,
    `${label('Overall Depth:')} ${colorScore(stats.overallDepth)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Shadow:')} ${stats.bestShadow}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Most Polished:')} ${stats.mostPolished}`,
    `${label('Most Grounded:')} ${stats.mostGrounded}`,
    `${label('Most Integrated:')} ${stats.mostIntegrated}`,
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
export function formatResultTable(result: OnyxShadowResult): string {
  const sections = [
    formatShadowsTable(result.shadows),
    '',
    formatChambersTable(result.chambers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Abyss')} ${label('Deep:')} ${result.abyss.isDeep ? high('Yes') : low('No')} ${label('Overall Depth:')} ${colorScore(result.abyss.overallDepth)}`,
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
export function formatResultJson(result: OnyxShadowResult): string {
  return JSON.stringify(result, null, 2)
}
