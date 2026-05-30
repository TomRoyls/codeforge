// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { ThunderEcho, AcousticChamber, ThunderWellResult } from './thunder-well-helpers.js'

// ─── Color Palette (thunder well — electric blue/purple/white) ─────
const high = chalk.rgb(100, 180, 255)
const midHigh = chalk.rgb(130, 165, 235)
const mid = chalk.rgb(160, 155, 215)
const lowMid = chalk.rgb(180, 150, 195)
const low = chalk.rgb(200, 150, 175)

const best = chalk.rgb(120, 190, 255).bold
const good = chalk.rgb(150, 180, 245)
const okay = chalk.rgb(170, 170, 230)
const poor = chalk.rgb(190, 165, 210)
const worst = chalk.rgb(205, 160, 190)

const heading = chalk.rgb(110, 185, 255).bold
const label = chalk.rgb(145, 175, 240)
const dim = chalk.rgb(165, 165, 195)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // electric blue
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
 * colorGrade('thunder-masterpiece') // best (bold blue)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'thunderous-depth': best, 'crystal-clear': best, 'harmonic-cascade': best,
    'sonic-boom': best, 'concert-hall': best, 'thunder-masterpiece': best,
    'grand-amphitheater': best, 'magnificent-acoustics': best, 'maestro': best,

    'deep-resonance': good, 'clear-tone': good, 'clean-chain': good,
    'clear-transmission': good, 'balanced-mix': good, 'resonant-chamber': good,
    'excellent-sound': good, 'virtuoso': good,

    'proper-echo': okay, 'proper-acoustics': okay, 'proper-ripple': okay,
    'proper-signal': okay, 'proper-equalization': okay, 'proper-well': okay,
    'proper-chamber': okay, 'decent-reverb': okay, 'musician': okay,

    'shallow-ring': poor, 'muffled-sound': poor, 'disrupted-wave': poor,
    'attenuated-wave': poor, 'uneven-sound': poor, 'cracked-basin': poor,
    'small-room': poor, 'poor-acoustics': poor, 'apprentice': poor,

    'hollow-sound': worst, 'garbled-echo': worst, 'broken-echo': worst,
    'lost-signal': worst, 'distorted-noise': worst, 'dry-well': worst,
    'closet': worst, 'dead-space': worst, 'novice': worst,

    'silence': worst, 'no-echo': worst, 'no-reverberation': worst,
    'no-propagation': worst, 'cacophony': worst, 'ruined-cistern': worst,
    'no-chamber': worst, 'void': worst, 'tone-deaf': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Echo Formatting ──────────────────────────────────────────────

/**
 * Format a single echo for display
 * @example
 * formatEchoTable(echo) // colored echo info
 */
export function formatEchoTable(echo: ThunderEcho): string {
  const parts = [
    `${label('File:')} ${dim(echo.file)}`,
    `${label('Resonance Depth:')} ${colorScore(echo.resonanceDepth)} ${colorGrade(echo.resonating.grade)}`,
    `${label('Echo Clarity:')} ${colorScore(echo.echoClarity)} ${colorGrade(echo.echoing.echo)}`,
    `${label('Reverberation Quality:')} ${colorScore(echo.reverberationQuality)} ${colorGrade(echo.reverberating.reverberation)}`,
    `${label('Sound Propagation:')} ${colorScore(echo.soundPropagation)} ${colorGrade(echo.propagating.sound)}`,
    `${label('Acoustic Balance:')} ${colorScore(echo.acousticBalance)} ${colorGrade(echo.balancing.acoustics)}`,
    `${label('Score:')} ${colorScore(echo.qualityScore)} ${colorGrade(echo.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format echoes as summary table
 * @example
 * formatEchoesTable(echoes) // multi-line table
 */
export function formatEchoesTable(echoes: ThunderEcho[]): string {
  if (echoes.length === 0) return dim('No thunder echoes found')
  const header = heading('Thunder Well Analysis')
  const rows = echoes.map(e => formatEchoTable(e))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Chamber Formatting ───────────────────────────────────────────

/**
 * Format a chamber for display
 * @example
 * formatChamberTable(chamber) // colored chamber info
 */
export function formatChamberTable(chamber: AcousticChamber): string {
  const parts = [
    `${label('Chamber:')} ${dim(chamber.directory)}`,
    `${label('Type:')} ${colorGrade(chamber.chamberType)}`,
    `${label('Condition:')} ${colorGrade(chamber.condition)}`,
    `${label('Echoes:')} ${String(chamber.echoes.length)}`,
    `${label('Avg Resonance:')} ${colorScore(chamber.avgResonance)}`,
    `${label('Avg Clarity:')} ${colorScore(chamber.avgClarity)}`,
    `${label('Avg Balance:')} ${colorScore(chamber.avgBalance)}`,
    `${label('Masterpieces:')} ${String(chamber.thunderMasterpieceCount)}`,
    `${label('Ruined:')} ${String(chamber.ruinedCisternCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all chambers as summary
 * @example
 * formatChambersTable(chambers) // multi-line summary
 */
export function formatChambersTable(chambers: AcousticChamber[]): string {
  if (chambers.length === 0) return dim('No acoustic chambers found')
  const header = heading('Acoustic Chambers')
  const rows = chambers.map(c => formatChamberTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: ThunderWellResult['stats']): string {
  const parts = [
    heading('Thunder Well Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Chambers:')} ${String(stats.totalChambers)}`,
    `${label('Avg Resonance Depth:')} ${colorScore(stats.avgResonanceDepth)}`,
    `${label('Avg Echo Clarity:')} ${colorScore(stats.avgEchoClarity)}`,
    `${label('Avg Reverberation Quality:')} ${colorScore(stats.avgReverberationQuality)}`,
    `${label('Avg Sound Propagation:')} ${colorScore(stats.avgSoundPropagation)}`,
    `${label('Avg Acoustic Balance:')} ${colorScore(stats.avgAcousticBalance)}`,
    `${label('Thunder Masterpieces:')} ${String(stats.thunderMasterpieceCount)}`,
    `${label('Resonant Chambers:')} ${String(stats.resonantChamberCount)}`,
    `${label('Proper Wells:')} ${String(stats.properWellCount)}`,
    `${label('Cracked Basins:')} ${String(stats.crackedBasinCount)}`,
    `${label('Dry Wells:')} ${String(stats.dryWellCount)}`,
    `${label('Ruined Cisterns:')} ${String(stats.ruinedCisternCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Propagation:')} ${String(stats.hasHighPropagationCount)}`,
    `${label('High Balance:')} ${String(stats.hasHighBalanceCount)}`,
    `${label('Overall Acoustics:')} ${colorScore(stats.overallAcoustics)}`,
    `${label('Acoustic Grade:')} ${colorGrade(stats.acousticGrade)}`,
    `${label('Best Echo:')} ${stats.bestEcho}`,
    `${label('Most Resonant:')} ${stats.mostResonant}`,
    `${label('Clearest Echo:')} ${stats.clearestEcho}`,
    `${label('Best Reverberation:')} ${stats.bestReverberation}`,
    `${label('Best Propagation:')} ${stats.bestPropagation}`,
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
export function formatResultTable(result: ThunderWellResult): string {
  const sections = [
    formatEchoesTable(result.echoes),
    '',
    formatChambersTable(result.chambers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Symphony')} ${label('Harmonious:')} ${result.symphony.isHarmonious ? high('Yes') : low('No')} ${label('Overall Acoustics:')} ${colorScore(result.symphony.overallAcoustics)}`,
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
export function formatResultJson(result: ThunderWellResult): string {
  return JSON.stringify(result, null, 2)
}
