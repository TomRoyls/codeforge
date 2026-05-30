// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ForgedIron, ForgeHall, IronForgeIIResult } from './iron-forge-ii-helpers.js'

// ─── Color Palette (iron forge) ────────────────────────────────────
const high = chalk.rgb(220, 160, 100)
const midHigh = chalk.rgb(200, 140, 85)
const mid = chalk.rgb(180, 120, 70)
const lowMid = chalk.rgb(155, 100, 60)
const low = chalk.rgb(130, 80, 50)

const best = chalk.rgb(240, 180, 120).bold
const good = chalk.rgb(220, 160, 105)
const okay = chalk.rgb(195, 140, 90)
const poor = chalk.rgb(160, 110, 75)
const worst = chalk.rgb(125, 85, 60)

const heading = chalk.rgb(230, 170, 110).bold
const label = chalk.rgb(210, 150, 95)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // forge orange
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
 * colorGrade('masterwork-iron') // best (bold orange)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'pure-steel': best, 'perfect-temper': best, 'titan-anvil': best,
    'master-rhythm': best, 'unbreakable-chain': best, 'masterwork-iron': best,
    'grand-forge': best, 'white-hot': best, 'master-blacksmith': best,

    'refined-iron': good, 'spring-steel': good, 'strong-block': good,
    'steady-beat': good, 'strong-links': good, 'fine-steel': good,
    'proper-foundry': good, 'red-hot': good, 'expert-forger': good,

    'proper-smelt': okay, 'proper-hardness': okay, 'proper-anvil': okay,
    'proper-cadence': okay, 'proper-chain': okay, 'proper-forging': okay,
    'village-forge': okay, 'warm-coals': okay, 'skilled-smith': okay,

    'slag-heavy': poor, 'over-hardened': poor, 'worn-anvil': poor,
    'irregular': poor, 'weak-links': poor, 'rough-iron': poor,
    'camp-fire': poor, 'cooling': poor, 'apprentice': poor,

    'poor-ore': worst, 'too-soft': worst, 'cracking': worst,
    'erratic': worst, 'rusty-chain': worst, 'pig-iron': worst,
    'cold-hearth': worst, 'cold': worst, 'novice': worst,

    'raw-iron': worst, 'raw-metal': worst, 'shattered': worst,
    'no-rhythm': worst, 'broken-chain': worst, 'scrap-heap': worst,
    'no-forge': worst, 'extinguished': worst, 'burn-victim': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Iron Formatting ──────────────────────────────────────────────

/**
 * Format a single iron for display
 * @example
 * formatIronTable(iron) // colored iron info
 */
export function formatIronTable(iron: ForgedIron): string {
  const parts = [
    `${label('File:')} ${dim(iron.file)}`,
    `${label('Smelting Quality:')} ${colorScore(iron.smeltingQuality)} ${colorGrade(iron.smelting.grade)}`,
    `${label('Tempering Balance:')} ${colorScore(iron.temperingBalance)} ${colorGrade(iron.tempering.temper)}`,
    `${label('Anvil Endurance:')} ${colorScore(iron.anvilEndurance)} ${colorGrade(iron.enduring.anvil)}`,
    `${label('Hammer Rhythm:')} ${colorScore(iron.hammerRhythm)} ${colorGrade(iron.hammering.hammer)}`,
    `${label('Chain Strength:')} ${colorScore(iron.chainStrength)} ${colorGrade(iron.chaining.chain)}`,
    `${label('Score:')} ${colorScore(iron.qualityScore)} ${colorGrade(iron.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format irons as summary table
 * @example
 * formatIronsTable(irons) // multi-line table
 */
export function formatIronsTable(irons: ForgedIron[]): string {
  if (irons.length === 0) return dim('No forged irons found')
  const header = heading('Iron Forge II Analysis')
  const rows = irons.map(r => formatIronTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Hall Formatting ──────────────────────────────────────────────

/**
 * Format a hall for display
 * @example
 * formatHallTable(hall) // colored hall info
 */
export function formatHallTable(hall: ForgeHall): string {
  const parts = [
    `${label('Hall:')} ${dim(hall.directory)}`,
    `${label('Type:')} ${colorGrade(hall.hallType)}`,
    `${label('Condition:')} ${colorGrade(hall.condition)}`,
    `${label('Irons:')} ${String(hall.irons.length)}`,
    `${label('Avg Smelting:')} ${colorScore(hall.avgSmelting)}`,
    `${label('Avg Balance:')} ${colorScore(hall.avgBalance)}`,
    `${label('Avg Endurance:')} ${colorScore(hall.avgEndurance)}`,
    `${label('Masterwork Irons:')} ${String(hall.masterworkIronCount)}`,
    `${label('Scrap Heap:')} ${String(hall.scrapHeapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all halls as summary
 * @example
 * formatHallsTable(halls) // multi-line hall summary
 */
export function formatHallsTable(halls: ForgeHall[]): string {
  if (halls.length === 0) return dim('No forge halls found')
  const header = heading('Forge Hall Analysis')
  const rows = halls.map(h => formatHallTable(h))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: IronForgeIIResult['stats']): string {
  const parts = [
    heading('Iron Forge II Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Halls:')} ${String(stats.totalHalls)}`,
    `${label('Avg Smelting Quality:')} ${colorScore(stats.avgSmeltingQuality)}`,
    `${label('Avg Tempering Balance:')} ${colorScore(stats.avgTemperingBalance)}`,
    `${label('Avg Anvil Endurance:')} ${colorScore(stats.avgAnvilEndurance)}`,
    `${label('Avg Hammer Rhythm:')} ${colorScore(stats.avgHammerRhythm)}`,
    `${label('Avg Chain Strength:')} ${colorScore(stats.avgChainStrength)}`,
    `${label('Masterwork Iron:')} ${String(stats.masterworkIronCount)}`,
    `${label('Fine Steel:')} ${String(stats.fineSteelCount)}`,
    `${label('Proper Forging:')} ${String(stats.properForgingCount)}`,
    `${label('Rough Iron:')} ${String(stats.roughIronCount)}`,
    `${label('Pig Iron:')} ${String(stats.pigIronCount)}`,
    `${label('Scrap Heap:')} ${String(stats.scrapHeapCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('High Endurance:')} ${String(stats.hasHighEnduranceCount)}`,
    `${label('High Rhythm:')} ${String(stats.hasHighRhythmCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('Overall Strength:')} ${colorScore(stats.overallStrength)}`,
    `${label('Blacksmith Grade:')} ${colorGrade(stats.blacksmithGrade)}`,
    `${label('Best Iron:')} ${stats.bestIron}`,
    `${label('Best Smelted:')} ${stats.bestSmelted}`,
    `${label('Best Tempered:')} ${stats.bestTempered}`,
    `${label('Most Enduring:')} ${stats.mostEnduring}`,
    `${label('Strongest Chain:')} ${stats.strongestChain}`,
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
export function formatResultTable(result: IronForgeIIResult): string {
  const sections = [
    formatIronsTable(result.irons),
    '',
    formatHallsTable(result.halls),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Guild')} ${label('Forging:')} ${result.guild.isForging ? high('Yes') : low('No')} ${label('Overall Strength:')} ${colorScore(result.guild.overallStrength)}`,
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
export function formatResultJson(result: IronForgeIIResult): string {
  return JSON.stringify(result, null, 2)
}
