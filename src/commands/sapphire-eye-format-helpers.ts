// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { SapphireGaze, SapphireVault, SapphireEyeResult } from './sapphire-eye-helpers.js'

// ─── Color Palette (sapphire blue) ─────────────────────────────────
const high = chalk.rgb(100, 140, 255)
const midHigh = chalk.rgb(90, 130, 240)
const mid = chalk.rgb(80, 120, 225)
const lowMid = chalk.rgb(70, 105, 205)
const low = chalk.rgb(60, 90, 185)

const best = chalk.rgb(120, 160, 255).bold
const good = chalk.rgb(105, 150, 250)
const okay = chalk.rgb(90, 135, 235)
const poor = chalk.rgb(75, 115, 215)
const worst = chalk.rgb(60, 95, 195)

const heading = chalk.rgb(130, 170, 255).bold
const label = chalk.rgb(110, 155, 245)
const dim = chalk.rgb(130, 135, 155)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright sapphire blue
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
 * colorGrade('star-sapphire') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'all-seeing': best, 'diamond-level': best, 'royal-blue': best,
    'star-sapphire': best, 'ocean-depth': best, 'star-sapphire': best,
    'royal-treasury': best, 'crown-jewels': best, 'oracle': best,

    'eagle-eye': good, 'corundum-hard': good, 'cornflower-blue': good,
    'brilliant-flash': good, 'deep-serenity': good, 'royal-gem': good,
    'gem-vault': good, 'precious-collection': good, 'royal-seer': good,

    'proper-vision': okay, 'proper-hard': okay, 'proper-blue': okay,
    'proper-sparkle': okay, 'proper-calm': okay, 'proper-sapphire': okay,
    'proper-safe': okay, 'decent-gems': okay, 'skilled-diviner': okay,

    'short-sighted': poor, 'medium-grade': poor, 'teal': poor,
    'subtle-glow': poor, 'restless': poor, 'industrial-corundum': poor,
    'jewelry-box': poor, 'common-stones': poor, 'apprentice': poor,

    'dim-sight': worst, 'soft-mineral': worst, 'greenish': worst,
    'dull-stone': worst, 'turbulent': worst, 'cloudy-stone': worst,
    'display-case': worst, 'fakes': worst, 'novice': worst,

    'blind': worst, 'talc-soft': worst, 'colorless': worst,
    'no-light': worst, 'chaotic': worst, 'gravel': worst,
    'no-vault': worst, 'empty': worst, 'blind-fortune-teller': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Gaze Formatting ───────────────────────────────────────────────

/**
 * Format a single gaze for display
 * @example
 * formatGazeTable(gaze) // colored gaze info
 */
export function formatGazeTable(gaze: SapphireGaze): string {
  const parts = [
    `${label('File:')} ${dim(gaze.file)}`,
    `${label('Vision:')} ${colorScore(gaze.visionClarity)} ${colorGrade(gaze.seeing.grade)}`,
    `${label('Hardness:')} ${colorScore(gaze.hardnessGrade)} ${colorGrade(gaze.hardening.hardness)}`,
    `${label('Royalty:')} ${colorScore(gaze.colorRoyalty)} ${colorGrade(gaze.coloring.color)}`,
    `${label('Brilliance:')} ${colorScore(gaze.brillianceLevel)} ${colorGrade(gaze.shining.brilliance)}`,
    `${label('Calm:')} ${colorScore(gaze.calmDepth)} ${colorGrade(gaze.calming.calm)}`,
    `${label('Score:')} ${colorScore(gaze.qualityScore)} ${colorGrade(gaze.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format gazes as summary table
 * @example
 * formatGazesTable(gazes) // multi-line table
 */
export function formatGazesTable(gazes: SapphireGaze[]): string {
  if (gazes.length === 0) return dim('No sapphire gazes found')
  const header = heading('Sapphire Eye Analysis')
  const rows = gazes.map(g => formatGazeTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Vault Formatting ──────────────────────────────────────────────

/**
 * Format a vault for display
 * @example
 * formatVaultTable(vault) // colored vault info
 */
export function formatVaultTable(vault: SapphireVault): string {
  const parts = [
    `${label('Vault:')} ${dim(vault.directory)}`,
    `${label('Type:')} ${colorGrade(vault.vaultType)}`,
    `${label('Condition:')} ${colorGrade(vault.condition)}`,
    `${label('Gazes:')} ${String(vault.gazes.length)}`,
    `${label('Avg Clarity:')} ${colorScore(vault.avgClarity)}`,
    `${label('Avg Hardness:')} ${colorScore(vault.avgHardness)}`,
    `${label('Avg Calm:')} ${colorScore(vault.avgCalm)}`,
    `${label('Star Sapphires:')} ${String(vault.starSapphireCount)}`,
    `${label('Gravel:')} ${String(vault.gravelCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all vaults as summary
 * @example
 * formatVaultsTable(vaults) // multi-line vault summary
 */
export function formatVaultsTable(vaults: SapphireVault[]): string {
  if (vaults.length === 0) return dim('No sapphire vaults found')
  const header = heading('Sapphire Vault Analysis')
  const rows = vaults.map(v => formatVaultTable(v))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SapphireEyeResult['stats']): string {
  const parts = [
    heading('Sapphire Eye Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Vaults:')} ${String(stats.totalVaults)}`,
    `${label('Avg Vision Clarity:')} ${colorScore(stats.avgVisionClarity)}`,
    `${label('Avg Hardness Grade:')} ${colorScore(stats.avgHardnessGrade)}`,
    `${label('Avg Color Royalty:')} ${colorScore(stats.avgColorRoyalty)}`,
    `${label('Avg Brilliance Level:')} ${colorScore(stats.avgBrillianceLevel)}`,
    `${label('Avg Calm Depth:')} ${colorScore(stats.avgCalmDepth)}`,
    `${label('Star Sapphire:')} ${String(stats.starSapphireCount)}`,
    `${label('Royal Gem:')} ${String(stats.royalGemCount)}`,
    `${label('Proper Sapphire:')} ${String(stats.properSapphireCount)}`,
    `${label('Industrial Corundum:')} ${String(stats.industrialCorundumCount)}`,
    `${label('Cloudy Stone:')} ${String(stats.cloudyStoneCount)}`,
    `${label('Gravel:')} ${String(stats.gravelCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Grade:')} ${String(stats.hasHighGradeCount)}`,
    `${label('High Royalty:')} ${String(stats.hasHighRoyaltyCount)}`,
    `${label('High Level:')} ${String(stats.hasHighLevelCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('Overall Wisdom:')} ${colorScore(stats.overallWisdom)}`,
    `${label('Seer Grade:')} ${colorGrade(stats.seerGrade)}`,
    `${label('Best Gaze:')} ${stats.bestGaze}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Hardest:')} ${stats.hardest}`,
    `${label('Most Royal:')} ${stats.mostRoyal}`,
    `${label('Most Brilliant:')} ${stats.mostBrilliant}`,
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
export function formatResultTable(result: SapphireEyeResult): string {
  const sections = [
    formatGazesTable(result.gazes),
    '',
    formatVaultsTable(result.vaults),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Crown')} ${label('Wise:')} ${result.crown.isWise ? high('Yes') : low('No')} ${label('Overall Wisdom:')} ${colorScore(result.crown.overallWisdom)}`,
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
export function formatResultJson(result: SapphireEyeResult): string {
  return JSON.stringify(result, null, 2)
}
