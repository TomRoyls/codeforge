// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { TabletInscription, TabletArchive, EmeraldTabletResult } from './emerald-tablet-helpers.js'

// ─── Color Palette (emerald) ───────────────────────────────────────
const high = chalk.rgb(80, 220, 120)
const midHigh = chalk.rgb(70, 200, 110)
const mid = chalk.rgb(60, 180, 100)
const lowMid = chalk.rgb(50, 155, 90)
const low = chalk.rgb(40, 135, 80)

const best = chalk.rgb(50, 240, 130).bold
const good = chalk.rgb(60, 225, 120)
const okay = chalk.rgb(65, 205, 110)
const poor = chalk.rgb(55, 175, 95)
const worst = chalk.rgb(45, 150, 85)

const heading = chalk.rgb(70, 235, 125).bold
const label = chalk.rgb(75, 215, 115)
const dim = chalk.rgb(130, 150, 140)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright emerald
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
 * colorGrade('hermetic-masterpiece') // best (bold emerald)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'divine-script': best, 'adamantine': best, 'profound-mystery': best,
    'sealed-vessel': best, 'philosopher-stone': best, 'hermetic-masterpiece': best,
    'great-library': best, 'pristine-collection': best, 'archmage': best,

    'clear-inscription': good, 'strong-stone': good, 'deep-wisdom': good,
    'proper-isolation': good, 'master-transmuter': good, 'sacred-tablet': good,
    'temple-archive': good, 'well-preserved': good, 'master-sage': good,

    'proper-writing': okay, 'proper-tablet': okay, 'proper-depth': okay,
    'contained': okay, 'proper-alchemist': okay, 'proper-scroll': okay,
    'scholars-study': okay, 'decent-records': okay, 'learned-scholar': okay,

    'faded-text': poor, 'cracked-tablet': poor, 'surface-level': poor,
    'leaking': poor, 'apprentice-chemist': poor, 'worn-inscription': poor,
    'scroll-shelf': poor, 'fading-ink': poor, 'student': poor,

    'illegible': worst, 'crumbling': worst, 'shallow-thinking': worst,
    'contaminated': worst, 'failed-experiment': worst, 'broken-fragment': worst,
    'scrap-pile': worst, 'crumbling-scrolls': worst, 'novice': worst,

    'blank-tablet': worst, 'dust': worst, 'no-depth': worst,
    'open-wound': worst, 'no-transmutation': worst,
    'no-archive': worst, 'ruins': worst, 'illiterate': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Inscription Formatting ────────────────────────────────────────

/**
 * Format a single inscription for display
 * @example
 * formatInscriptionTable(inscription) // colored inscription info
 */
export function formatInscriptionTable(inscription: TabletInscription): string {
  const parts = [
    `${label('File:')} ${dim(inscription.file)}`,
    `${label('Clarity:')} ${colorScore(inscription.inscriptionClarity)} ${colorGrade(inscription.inscribing.grade)}`,
    `${label('Strength:')} ${colorScore(inscription.tabletStrength)} ${colorGrade(inscription.strengthening.tablet)}`,
    `${label('Depth:')} ${colorScore(inscription.enigmaticDepth)} ${colorGrade(inscription.deepening.enigma)}`,
    `${label('Purity:')} ${colorScore(inscription.hermeticPurity)} ${colorGrade(inscription.purifying.hermetic)}`,
    `${label('Wisdom:')} ${colorScore(inscription.transmutationWisdom)} ${colorGrade(inscription.transmuting.alchemy)}`,
    `${label('Score:')} ${colorScore(inscription.qualityScore)} ${colorGrade(inscription.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format inscriptions as summary table
 * @example
 * formatInscriptionsTable(inscriptions) // multi-line table
 */
export function formatInscriptionsTable(inscriptions: TabletInscription[]): string {
  if (inscriptions.length === 0) return dim('No tablet inscriptions found')
  const header = heading('Emerald Tablet Analysis')
  const rows = inscriptions.map(i => formatInscriptionTable(i))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Archive Formatting ────────────────────────────────────────────

/**
 * Format an archive for display
 * @example
 * formatArchiveTable(archive) // colored archive info
 */
export function formatArchiveTable(archive: TabletArchive): string {
  const parts = [
    `${label('Archive:')} ${dim(archive.directory)}`,
    `${label('Type:')} ${colorGrade(archive.archiveType)}`,
    `${label('Condition:')} ${colorGrade(archive.condition)}`,
    `${label('Inscriptions:')} ${String(archive.inscriptions.length)}`,
    `${label('Avg Clarity:')} ${colorScore(archive.avgClarity)}`,
    `${label('Avg Strength:')} ${colorScore(archive.avgStrength)}`,
    `${label('Avg Depth:')} ${colorScore(archive.avgDepth)}`,
    `${label('Masterpieces:')} ${String(archive.hermeticMasterpieceCount)}`,
    `${label('Dust:')} ${String(archive.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all archives as summary
 * @example
 * formatArchivesTable(archives) // multi-line archive summary
 */
export function formatArchivesTable(archives: TabletArchive[]): string {
  if (archives.length === 0) return dim('No tablet archives found')
  const header = heading('Tablet Archive Analysis')
  const rows = archives.map(a => formatArchiveTable(a))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EmeraldTabletResult['stats']): string {
  const parts = [
    heading('Emerald Tablet Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Archives:')} ${String(stats.totalArchives)}`,
    `${label('Avg Inscription Clarity:')} ${colorScore(stats.avgInscriptionClarity)}`,
    `${label('Avg Tablet Strength:')} ${colorScore(stats.avgTabletStrength)}`,
    `${label('Avg Enigmatic Depth:')} ${colorScore(stats.avgEnigmaticDepth)}`,
    `${label('Avg Hermetic Purity:')} ${colorScore(stats.avgHermeticPurity)}`,
    `${label('Avg Transmutation Wisdom:')} ${colorScore(stats.avgTransmutationWisdom)}`,
    `${label('Hermetic Masterpiece:')} ${String(stats.hermeticMasterpieceCount)}`,
    `${label('Sacred Tablet:')} ${String(stats.sacredTabletCount)}`,
    `${label('Proper Scroll:')} ${String(stats.properScrollCount)}`,
    `${label('Worn Inscription:')} ${String(stats.wornInscriptionCount)}`,
    `${label('Broken Fragment:')} ${String(stats.brokenFragmentCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('Overall Wisdom:')} ${colorScore(stats.overallWisdom)}`,
    `${label('Sage Grade:')} ${colorGrade(stats.sageGrade)}`,
    `${label('Best Inscription:')} ${stats.bestInscription}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Strongest:')} ${stats.strongest}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Purest:')} ${stats.purest}`,
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
export function formatResultTable(result: EmeraldTabletResult): string {
  const sections = [
    formatInscriptionsTable(result.inscriptions),
    '',
    formatArchivesTable(result.archives),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Library')} ${label('Enlightened:')} ${result.library.isEnlightened ? high('Yes') : low('No')} ${label('Overall Wisdom:')} ${colorScore(result.library.overallWisdom)}`,
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
export function formatResultJson(result: EmeraldTabletResult): string {
  return JSON.stringify(result, null, 2)
}
