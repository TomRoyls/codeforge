// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { QuartzVibration, CrystalDream, QuartzDreamResult } from './quartz-dream-helpers.js'

// ─── Color Palette (quartz dream — amethyst/lavender/crystal) ────
const high = chalk.rgb(180, 150, 220)
const midHigh = chalk.rgb(170, 140, 210)
const mid = chalk.rgb(160, 130, 200)
const lowMid = chalk.rgb(150, 120, 190)
const low = chalk.rgb(140, 110, 180)

const best = chalk.rgb(200, 170, 240).bold
const good = chalk.rgb(185, 155, 225)
const okay = chalk.rgb(170, 140, 210)
const poor = chalk.rgb(155, 125, 195)
const worst = chalk.rgb(140, 110, 180)

const heading = chalk.rgb(175, 145, 220).bold
const label = chalk.rgb(165, 135, 205)
const dim = chalk.rgb(145, 115, 185)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // amethyst
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
 * colorGrade('master-crystal') // best (bold amethyst)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'flawless-crystal': best, 'pure-tone': best, 'perfect-rhythm': best,
    'rainbow-spectrum': best, 'atomic-clock': best, 'master-crystal': best,
    'crystal-cathedral': best, 'transcendent-dream': best, 'crystal-master': best,

    'clear-quartz': good, 'clear-signal': good, 'steady-pulse': good,
    'full-prism': good, 'precision-tuned': good, 'tuned-quartz': good,
    'quartz-chamber': good, 'beautiful-vision': good, 'expert-tuner': good,

    'proper-transparency': okay, 'proper-frequency': okay, 'proper-beat': okay,
    'proper-refraction': okay, 'proper-calibration': okay, 'proper-crystal': okay,
    'proper-cave': okay, 'decent-dream': okay, 'skilled-resonator': okay,

    'cloudy-crystal': poor, 'noisy-signal': poor, 'irregular-pulse': poor,
    'partial-spectrum': poor, 'rough-tuning': poor, 'cloudy-quartz': poor,
    'rocky-tunnel': poor, 'fuzzy-dream': poor, 'apprentice': poor,

    'foggy-quartz': worst, 'static-noise': worst, 'arrhythmia': worst,
    'monochromatic': worst, 'detuned': worst, 'cracked-crystal': worst,
    'gravel-pit': worst, 'nightmare': worst, 'novice': worst,

    'opaque': worst, 'silence': worst, 'flatline': worst,
    'no-prism': worst, 'no-tuning': worst, 'dust': worst,
    'no-dream': worst, 'void': worst, 'dissonant': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Vibration Formatting ─────────────────────────────────────────

/**
 * Format a single vibration for display
 * @example
 * formatVibrationTable(vib) // colored vibration info
 */
export function formatVibrationTable(vib: QuartzVibration): string {
  const parts = [
    `${label('File:')} ${dim(vib.file)}`,
    `${label('Crystalline Clarity:')} ${colorScore(vib.crystallineClarity)} ${colorGrade(vib.clarifying.grade)}`,
    `${label('Resonance Purity:')} ${colorScore(vib.resonancePurity)} ${colorGrade(vib.resonating.resonance)}`,
    `${label('Vibration Quality:')} ${colorScore(vib.vibrationQuality)} ${colorGrade(vib.vibrating.vibration)}`,
    `${label('Prism Diversity:')} ${colorScore(vib.prismDiversity)} ${colorGrade(vib.splitting.prism)}`,
    `${label('Tuning Precision:')} ${colorScore(vib.tuningPrecision)} ${colorGrade(vib.tuning.tuning)}`,
    `${label('Score:')} ${colorScore(vib.qualityScore)} ${colorGrade(vib.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format vibrations as summary table
 * @example
 * formatVibrationsTable(vibrations) // multi-line table
 */
export function formatVibrationsTable(vibrations: QuartzVibration[]): string {
  if (vibrations.length === 0) return dim('No quartz vibrations found')
  const header = heading('Quartz Dream Analysis')
  const rows = vibrations.map(v => formatVibrationTable(v))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Dream Formatting ─────────────────────────────────────────────

/**
 * Format a dream for display
 * @example
 * formatDreamTable(dream) // colored dream info
 */
export function formatDreamTable(dream: CrystalDream): string {
  const parts = [
    `${label('Dream:')} ${dim(dream.directory)}`,
    `${label('Type:')} ${colorGrade(dream.dreamType)}`,
    `${label('Condition:')} ${colorGrade(dream.condition)}`,
    `${label('Vibrations:')} ${String(dream.vibrations.length)}`,
    `${label('Avg Clarity:')} ${colorScore(dream.avgClarity)}`,
    `${label('Avg Purity:')} ${colorScore(dream.avgPurity)}`,
    `${label('Avg Precision:')} ${colorScore(dream.avgPrecision)}`,
    `${label('Master Crystals:')} ${String(dream.masterCrystalCount)}`,
    `${label('Dust:')} ${String(dream.dustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all dreams as summary
 * @example
 * formatDreamsTable(dreams) // multi-line summary
 */
export function formatDreamsTable(dreams: CrystalDream[]): string {
  if (dreams.length === 0) return dim('No crystal dreams found')
  const header = heading('Crystal Dreams')
  const rows = dreams.map(d => formatDreamTable(d))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: QuartzDreamResult['stats']): string {
  const parts = [
    heading('Quartz Dream Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Dreams:')} ${String(stats.totalDreams)}`,
    `${label('Avg Crystalline Clarity:')} ${colorScore(stats.avgCrystallineClarity)}`,
    `${label('Avg Resonance Purity:')} ${colorScore(stats.avgResonancePurity)}`,
    `${label('Avg Vibration Quality:')} ${colorScore(stats.avgVibrationQuality)}`,
    `${label('Avg Prism Diversity:')} ${colorScore(stats.avgPrismDiversity)}`,
    `${label('Avg Tuning Precision:')} ${colorScore(stats.avgTuningPrecision)}`,
    `${label('Master Crystal:')} ${String(stats.masterCrystalCount)}`,
    `${label('Tuned Quartz:')} ${String(stats.tunedQuartzCount)}`,
    `${label('Proper Crystal:')} ${String(stats.properCrystalCount)}`,
    `${label('Cloudy Quartz:')} ${String(stats.cloudyQuartzCount)}`,
    `${label('Cracked Crystal:')} ${String(stats.crackedCrystalCount)}`,
    `${label('Dust:')} ${String(stats.dustCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Diversity:')} ${String(stats.hasHighDiversityCount)}`,
    `${label('High Precision:')} ${String(stats.hasHighPrecisionCount)}`,
    `${label('Overall Resonance:')} ${colorScore(stats.overallResonance)}`,
    `${label('Tuner Grade:')} ${colorGrade(stats.tunerGrade)}`,
    `${label('Best Vibration:')} ${stats.bestVibration}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Best Rhythm:')} ${stats.bestRhythm}`,
    `${label('Most Diverse:')} ${stats.mostDiverse}`,
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
export function formatResultTable(result: QuartzDreamResult): string {
  const sections = [
    formatVibrationsTable(result.vibrations),
    '',
    formatDreamsTable(result.dreams),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Spectrum')} ${label('Transcendent:')} ${result.spectrum.isTranscendent ? high('Yes') : low('No')} ${label('Overall Resonance:')} ${colorScore(result.spectrum.overallResonance)}`,
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
export function formatResultJson(result: QuartzDreamResult): string {
  return JSON.stringify(result, null, 2)
}
