// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { VoidSpire, CathedralVoid, VoidCathedralResult } from './void-cathedral-helpers.js'

// ─── Color Palette (void cathedral — deep indigo/violet/void-black) ─
const high = chalk.rgb(140, 120, 220)
const midHigh = chalk.rgb(155, 135, 210)
const mid = chalk.rgb(170, 150, 200)
const lowMid = chalk.rgb(185, 165, 190)
const low = chalk.rgb(195, 175, 180)

const best = chalk.rgb(160, 140, 240).bold
const good = chalk.rgb(165, 150, 225)
const okay = chalk.rgb(175, 160, 210)
const poor = chalk.rgb(185, 170, 195)
const worst = chalk.rgb(195, 180, 185)

const heading = chalk.rgb(150, 130, 235).bold
const label = chalk.rgb(170, 155, 220)
const dim = chalk.rgb(175, 170, 185)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep violet
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
 * colorGrade('void-masterpiece') // best (bold violet)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'perfect-void': best, 'divine-geometry': best, 'enlightened-mute': best,
    'weightless-strength': best, 'nirvana-code': best, 'void-masterpiece': best,
    'cosmic-void': best, 'divine-emptiness': best, 'void-architect': best,

    'elegant-emptiness': good, 'sacred-architecture': good, 'wise-silence': good,
    'airy-foundation': good, 'clear-mind': good, 'ethereal-spire': good,
    'sacred-space': good, 'beautiful-space': good, 'sacred-builder': good,

    'proper-simplicity': okay, 'proper-temple': okay, 'proper-quiet': okay,
    'proper-base': okay, 'proper-understanding': okay, 'proper-chapel': okay,
    'proper-void': okay, 'decent-void': okay, 'proper-mason': okay,

    'mundane-building': poor, 'noisy-code': poor,
    'heavy-anchor': poor, 'foggy-thought': poor, 'stone-church': poor,
    'crowded-hall': poor, 'cluttered-space': poor, 'apprentice': poor,

    'overstuffed': worst, 'ramshackle': worst, 'chattering': worst,
    'sinking-stone': worst, 'confused-mind': worst, 'ruined-shrine': worst,
    'stuffed-room': worst, 'filled-void': worst, 'novice': worst,

    'no-void': worst, 'no-structure': worst, 'babble': worst,
    'no-foundation': worst, 'oblivion': worst, 'dust': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Spire Formatting ─────────────────────────────────────────────

/**
 * Format a single spire for display
 * @example
 * formatSpireTable(spire) // colored spire info
 */
export function formatSpireTable(spire: VoidSpire): string {
  const parts = [
    `${label('File:')} ${dim(spire.file)}`,
    `${label('Emptiness Elegance:')} ${colorScore(spire.emptinessElegance)} ${colorGrade(spire.emptying.grade)}`,
    `${label('Sacred Structure:')} ${colorScore(spire.sacredStructure)} ${colorGrade(spire.structuring.structure)}`,
    `${label('Silent Wisdom:')} ${colorScore(spire.silentWisdom)} ${colorGrade(spire.silencing.silence)}`,
    `${label('Ethereal Foundation:')} ${colorScore(spire.etherealFoundation)} ${colorGrade(spire.floating.foundation)}`,
    `${label('Transcendent Clarity:')} ${colorScore(spire.transcendentClarity)} ${colorGrade(spire.transcending.transcendence)}`,
    `${label('Score:')} ${colorScore(spire.qualityScore)} ${colorGrade(spire.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format spires as summary table
 * @example
 * formatSpiresTable(spires) // multi-line table
 */
export function formatSpiresTable(spires: VoidSpire[]): string {
  if (spires.length === 0) return dim('No void spires found')
  const header = heading('Void Cathedral Analysis')
  const rows = spires.map(sp => formatSpireTable(sp))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Void Formatting ──────────────────────────────────────────────

/**
 * Format a void for display
 * @example
 * formatVoidTable(v) // colored void info
 */
export function formatVoidTable(v: CathedralVoid): string {
  const parts = [
    `${label('Void:')} ${dim(v.directory)}`,
    `${label('Type:')} ${colorGrade(v.voidType)}`,
    `${label('Condition:')} ${colorGrade(v.condition)}`,
    `${label('Spires:')} ${String(v.spires.length)}`,
    `${label('Avg Emptiness:')} ${colorScore(v.avgEmptiness)}`,
    `${label('Avg Sacred:')} ${colorScore(v.avgSacred)}`,
    `${label('Avg Clarity:')} ${colorScore(v.avgClarity)}`,
    `${label('Masterpieces:')} ${String(v.voidMasterpieceCount)}`,
    `${label('Dust:')} ${String(v.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all voids as summary
 * @example
 * formatVoidsTable(voids) // multi-line summary
 */
export function formatVoidsTable(voids: CathedralVoid[]): string {
  if (voids.length === 0) return dim('No cathedral voids found')
  const header = heading('Cathedral Voids')
  const rows = voids.map(v => formatVoidTable(v))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: VoidCathedralResult['stats']): string {
  const parts = [
    heading('Void Cathedral Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Voids:')} ${String(stats.totalVoids)}`,
    `${label('Avg Emptiness Elegance:')} ${colorScore(stats.avgEmptinessElegance)}`,
    `${label('Avg Sacred Structure:')} ${colorScore(stats.avgSacredStructure)}`,
    `${label('Avg Silent Wisdom:')} ${colorScore(stats.avgSilentWisdom)}`,
    `${label('Avg Ethereal Foundation:')} ${colorScore(stats.avgEtherealFoundation)}`,
    `${label('Avg Transcendent Clarity:')} ${colorScore(stats.avgTranscendentClarity)}`,
    `${label('Void Masterpieces:')} ${String(stats.voidMasterpieceCount)}`,
    `${label('Ethereal Spires:')} ${String(stats.etherealSpireCount)}`,
    `${label('Proper Chapels:')} ${String(stats.properChapelCount)}`,
    `${label('Stone Churches:')} ${String(stats.stoneChurchCount)}`,
    `${label('Ruined Shrines:')} ${String(stats.ruinedShrineCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('High Sacred:')} ${String(stats.hasHighSacredCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Ethereal:')} ${String(stats.hasHighEtherealCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('Overall Sublimity:')} ${colorScore(stats.overallSublimity)}`,
    `${label('Architect Grade:')} ${colorGrade(stats.architectGrade)}`,
    `${label('Best Spire:')} ${stats.bestSpire}`,
    `${label('Most Empty:')} ${stats.mostEmpty}`,
    `${label('Most Sacred:')} ${stats.mostSacred}`,
    `${label('Wisest:')} ${stats.wisest}`,
    `${label('Clearest:')} ${stats.clearest}`,
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
export function formatResultTable(result: VoidCathedralResult): string {
  const sections = [
    formatSpiresTable(result.spires),
    '',
    formatVoidsTable(result.voids),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Cosmos')} ${label('Transcendent:')} ${result.cosmos.isTranscendent ? high('Yes') : low('No')} ${label('Overall Sublimity:')} ${colorScore(result.cosmos.overallSublimity)}`,
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
export function formatResultJson(result: VoidCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
