// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CopperPatina, CopperForge, CopperBloomResult } from './copper-bloom-helpers.js'

// ─── Color Palette (copper bloom — copper/verdigris/green) ─────────
const high = chalk.rgb(200, 160, 100)
const midHigh = chalk.rgb(190, 155, 110)
const mid = chalk.rgb(175, 155, 120)
const lowMid = chalk.rgb(165, 150, 125)
const low = chalk.rgb(150, 140, 130)

const best = chalk.rgb(120, 190, 140).bold
const good = chalk.rgb(150, 180, 130)
const okay = chalk.rgb(170, 165, 125)
const poor = chalk.rgb(180, 155, 120)
const worst = chalk.rgb(165, 145, 135)

const heading = chalk.rgb(190, 145, 90).bold
const label = chalk.rgb(180, 160, 115)
const dim = chalk.rgb(160, 155, 140)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // copper-gold
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
 * colorGrade('statue-of-liberty') // best (bold verdigris)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'ancient-patina': best, 'impervious-copper': best, 'superconductor': best,
    'bronze-masterpiece': best, 'stunning-patina': best, 'statue-of-liberty': best,
    'grand-foundry': best, 'masterwork-forge': best, 'master-smith': best,

    'aged-wisdom': good, 'protective-patina': good, 'high-conductivity': good,
    'strong-alloy': good, 'beautiful-green': good, 'aged-masterpiece': good,
    'proper-forge': good, 'quality-foundry': good, 'expert-forge': good,

    'proper-aging': okay, 'proper-coating': okay, 'proper-flow': okay,
    'proper-mix': okay, 'proper-color': okay, 'proper-copper': okay,
    'decent-workshop': okay, 'skilled-craftsman': okay,

    'premature-aging': poor, 'corroding-surface': poor, 'resistive-wire': poor,
    'weak-bond': poor, 'patchy-surface': poor, 'tarnished-metal': poor,
    'small-anvil': poor, 'rusty-shed': poor, 'apprentice': poor,

    'raw-copper': worst, 'rusting-metal': worst, 'insulated': worst,
    'brittle-composite': worst, 'raw-wire': worst,
    'cold-hearth': worst, 'abandoned': worst, 'novice': worst,

    'no-patina': worst, 'no-resistance': worst, 'no-conductivity': worst,
    'no-alloy': worst, 'no-beauty': worst, 'scrap': worst,
    'no-forge': worst, 'void': worst, 'scrap-dealer': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Patina Formatting ────────────────────────────────────────────

/**
 * Format a single patina for display
 * @example
 * formatPatinaTable(patina) // colored patina info
 */
export function formatPatinaTable(patina: CopperPatina): string {
  const parts = [
    `${label('File:')} ${dim(patina.file)}`,
    `${label('Patina Wisdom:')} ${colorScore(patina.patinaWisdom)} ${colorGrade(patina.aging.grade)}`,
    `${label('Oxidation Resilience:')} ${colorScore(patina.oxidationResilience)} ${colorGrade(patina.resisting.oxidation)}`,
    `${label('Conductivity Quality:')} ${colorScore(patina.conductivityQuality)} ${colorGrade(patina.conducting.conductivity)}`,
    `${label('Alloy Strength:')} ${colorScore(patina.alloyStrength)} ${colorGrade(patina.alloying.alloy)}`,
    `${label('Verdigris Beauty:')} ${colorScore(patina.verdigrisBeauty)} ${colorGrade(patina.beautifying.verdigris)}`,
    `${label('Score:')} ${colorScore(patina.qualityScore)} ${colorGrade(patina.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format patinas as summary table
 * @example
 * formatPatinasTable(patinas) // multi-line table
 */
export function formatPatinasTable(patinas: CopperPatina[]): string {
  if (patinas.length === 0) return dim('No copper patinas found')
  const header = heading('Copper Bloom Analysis')
  const rows = patinas.map(p => formatPatinaTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Forge Formatting ─────────────────────────────────────────────

/**
 * Format a forge for display
 * @example
 * formatForgeTable(forge) // colored forge info
 */
export function formatForgeTable(forge: CopperForge): string {
  const parts = [
    `${label('Forge:')} ${dim(forge.directory)}`,
    `${label('Type:')} ${colorGrade(forge.forgeType)}`,
    `${label('Condition:')} ${colorGrade(forge.condition)}`,
    `${label('Patinas:')} ${String(forge.patinas.length)}`,
    `${label('Avg Wisdom:')} ${colorScore(forge.avgWisdom)}`,
    `${label('Avg Conductivity:')} ${colorScore(forge.avgConductivity)}`,
    `${label('Avg Strength:')} ${colorScore(forge.avgStrength)}`,
    `${label('Statues:')} ${String(forge.statueOfLibertyCount)}`,
    `${label('Scrap:')} ${String(forge.scrapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all forges as summary
 * @example
 * formatForgesTable(forges) // multi-line summary
 */
export function formatForgesTable(forges: CopperForge[]): string {
  if (forges.length === 0) return dim('No copper forges found')
  const header = heading('Copper Forges')
  const rows = forges.map(f => formatForgeTable(f))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CopperBloomResult['stats']): string {
  const parts = [
    heading('Copper Bloom Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Forges:')} ${String(stats.totalForges)}`,
    `${label('Avg Patina Wisdom:')} ${colorScore(stats.avgPatinaWisdom)}`,
    `${label('Avg Oxidation Resilience:')} ${colorScore(stats.avgOxidationResilience)}`,
    `${label('Avg Conductivity Quality:')} ${colorScore(stats.avgConductivityQuality)}`,
    `${label('Avg Alloy Strength:')} ${colorScore(stats.avgAlloyStrength)}`,
    `${label('Avg Verdigris Beauty:')} ${colorScore(stats.avgVerdigrisBeauty)}`,
    `${label('Statue of Liberty:')} ${String(stats.statueOfLibertyCount)}`,
    `${label('Aged Masterpieces:')} ${String(stats.agedMasterpieceCount)}`,
    `${label('Proper Copper:')} ${String(stats.properCopperCount)}`,
    `${label('Tarnished Metal:')} ${String(stats.tarnishedMetalCount)}`,
    `${label('Raw Wire:')} ${String(stats.rawWireCount)}`,
    `${label('Scrap:')} ${String(stats.scrapCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Resilience:')} ${String(stats.hasHighResilienceCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Beauty:')} ${String(stats.hasHighBeautyCount)}`,
    `${label('Overall Craftsmanship:')} ${colorScore(stats.overallCraftsmanship)}`,
    `${label('Smith Grade:')} ${colorGrade(stats.smithGrade)}`,
    `${label('Best Patina:')} ${stats.bestPatina}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Most Resilient:')} ${stats.mostResilient}`,
    `${label('Best Conductor:')} ${stats.bestConductor}`,
    `${label('Strongest:')} ${stats.strongest}`,
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
export function formatResultTable(result: CopperBloomResult): string {
  const sections = [
    formatPatinasTable(result.patinas),
    '',
    formatForgesTable(result.forges),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Foundry')} ${label('Masterwork:')} ${result.foundry.isMasterwork ? high('Yes') : low('No')} ${label('Overall Craftsmanship:')} ${colorScore(result.foundry.overallCraftsmanship)}`,
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
export function formatResultJson(result: CopperBloomResult): string {
  return JSON.stringify(result, null, 2)
}
