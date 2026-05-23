// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { CanyonEcho, CanyonSystem, EchoCanyonResult } from './echo-canyon-helpers.js'

// ─── Color Palette (canyon/amber) ──────────────────────────────────
const high = chalk.rgb(210, 180, 140)
const midHigh = chalk.rgb(190, 160, 120)
const mid = chalk.rgb(170, 140, 100)
const lowMid = chalk.rgb(150, 120, 90)
const low = chalk.rgb(130, 100, 80)

const best = chalk.rgb(255, 200, 100).bold
const good = chalk.rgb(230, 180, 90)
const okay = chalk.rgb(200, 160, 80)
const poor = chalk.rgb(170, 130, 70)
const worst = chalk.rgb(140, 100, 60)

const heading = chalk.rgb(220, 190, 130).bold
const label = chalk.rgb(200, 170, 110)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // canyon gold
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
 * colorGrade('grand-canyon') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'deep-canyon': best, 'crystal-clear': best, 'granite-cliff': best, 'pure-tone': best, 'sonar-grade': best,
    'grand-canyon': best, 'perfect-acoustics': best, 'acoustic-engineer': best,

    'strong-echo': good, 'clear-echo': good, 'solid-rock': good, 'clean-signal': good, 'high-sensitivity': good,
    'echo-valley': good, 'great-echoes': good, 'sound-designer': good,

    'proper-resonance': okay, 'proper-reflection': okay, 'proper-wall': okay, 'proper-sound': okay, 'proper-detection': okay,
    'proper-gorge': okay, 'decent-reverb': okay, 'audio-technician': okay,

    'weak-echo': poor, 'muffled-echo': poor, 'crumbling-edge': poor, 'noisy-channel': poor, 'low-sensitivity': poor,
    'shallow-ravine': poor, 'poor-acoustics': poor, 'listener': poor,

    'fading-sound': worst, 'garbled': worst, 'eroded-slope': worst, 'static-heavy': worst, 'deaf-spot': worst,
    'silent-hollow': worst, 'dead-sound': worst, 'deaf-ear': worst,

    'silence': worst, 'no-echo': worst, 'no-boundary': worst, 'white-noise': worst, 'deaf': worst,
    'flat-plain': worst, 'silent': worst, 'mute': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Echo Formatting ───────────────────────────────────────────────

/**
 * Format a single echo for display
 * @example
 * formatEchoTable(echo) // colored echo info
 */
export function formatEchoTable(echo: CanyonEcho): string {
  const parts = [
    `${label('File:')} ${dim(echo.file)}`,
    `${label('Resonance Depth:')} ${colorScore(echo.resonanceDepth)} ${colorGrade(echo.resonating.grade)}`,
    `${label('Echo Clarity:')} ${colorScore(echo.echoClarity)} ${colorGrade(echo.clarifying.echo)}`,
    `${label('Wall Formation:')} ${colorScore(echo.wallFormation)} ${colorGrade(echo.forming.wall)}`,
    `${label('Acoustic Purity:')} ${colorScore(echo.acousticPurity)} ${colorGrade(echo.purifying.acoustic)}`,
    `${label('Whisper Detection:')} ${colorScore(echo.whisperDetection)} ${colorGrade(echo.detecting.detection)}`,
    `${label('Score:')} ${colorScore(echo.qualityScore)} ${colorGrade(echo.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format echoes as summary table
 * @example
 * formatEchoesTable(echoes) // multi-line table
 */
export function formatEchoesTable(echoes: CanyonEcho[]): string {
  if (echoes.length === 0) return dim('No canyon echoes found')
  const header = heading('Canyon Echo Analysis')
  const rows = echoes.map(e => formatEchoTable(e))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Canyon Formatting ─────────────────────────────────────────────

/**
 * Format a canyon system for display
 * @example
 * formatCanyonTable(canyon) // colored canyon info
 */
export function formatCanyonTable(canyon: CanyonSystem): string {
  const parts = [
    `${label('Canyon:')} ${dim(canyon.directory)}`,
    `${label('Type:')} ${colorGrade(canyon.canyonType)}`,
    `${label('Condition:')} ${colorGrade(canyon.condition)}`,
    `${label('Echoes:')} ${String(canyon.echoes.length)}`,
    `${label('Avg Depth:')} ${colorScore(canyon.avgDepth)}`,
    `${label('Avg Clarity:')} ${colorScore(canyon.avgClarity)}`,
    `${label('Avg Purity:')} ${colorScore(canyon.avgPurity)}`,
    `${label('Grand Canyons:')} ${String(canyon.grandCanyonCount)}`,
    `${label('Flat Plains:')} ${String(canyon.flatPlainCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all canyons as summary
 * @example
 * formatCanyonsTable(canyons) // multi-line canyon summary
 */
export function formatCanyonsTable(canyons: CanyonSystem[]): string {
  if (canyons.length === 0) return dim('No canyon systems found')
  const header = heading('Canyon System Analysis')
  const rows = canyons.map(c => formatCanyonTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: EchoCanyonResult['stats']): string {
  const parts = [
    heading('Echo Canyon Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Canyons:')} ${String(stats.totalCanyons)}`,
    `${label('Avg Resonance Depth:')} ${colorScore(stats.avgResonanceDepth)}`,
    `${label('Avg Echo Clarity:')} ${colorScore(stats.avgEchoClarity)}`,
    `${label('Avg Wall Formation:')} ${colorScore(stats.avgWallFormation)}`,
    `${label('Avg Acoustic Purity:')} ${colorScore(stats.avgAcousticPurity)}`,
    `${label('Avg Whisper Detection:')} ${colorScore(stats.avgWhisperDetection)}`,
    `${label('Grand Canyon:')} ${String(stats.grandCanyonCount)}`,
    `${label('Echo Valley:')} ${String(stats.echoValleyCount)}`,
    `${label('Proper Gorge:')} ${String(stats.properGorgeCount)}`,
    `${label('Shallow Ravine:')} ${String(stats.shallowRavineCount)}`,
    `${label('Silent Hollow:')} ${String(stats.silentHollowCount)}`,
    `${label('Flat Plain:')} ${String(stats.flatPlainCount)}`,
    `${label('High Depth:')} ${String(stats.hasHighDepthCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Sensitivity:')} ${String(stats.hasHighSensitivityCount)}`,
    `${label('Overall Acoustics:')} ${colorScore(stats.overallAcoustics)}`,
    `${label('Acoustic Grade:')} ${colorGrade(stats.acousticGrade)}`,
    `${label('Best Echo:')} ${stats.bestEcho}`,
    `${label('Deepest:')} ${stats.deepest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Walled:')} ${stats.bestWalled}`,
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
export function formatResultTable(result: EchoCanyonResult): string {
  const sections = [
    formatEchoesTable(result.echoes),
    '',
    formatCanyonsTable(result.canyons),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Landscape')} ${label('Resonant:')} ${result.landscape.isResonant ? high('Yes') : low('No')} ${label('Overall Acoustics:')} ${colorScore(result.landscape.overallAcoustics)}`,
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
export function formatResultJson(result: EchoCanyonResult): string {
  return JSON.stringify(result, null, 2)
}
