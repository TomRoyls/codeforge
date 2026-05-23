// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { BellTone, BellTower, CopperBellResult } from './copper-bell-helpers.js'

// ─── Color Palette (copper) ────────────────────────────────────────
const high = chalk.rgb(218, 145, 80)
const midHigh = chalk.rgb(200, 130, 65)
const mid = chalk.rgb(185, 115, 55)
const lowMid = chalk.rgb(165, 100, 45)
const low = chalk.rgb(145, 85, 40)

const best = chalk.rgb(230, 170, 100).bold
const good = chalk.rgb(215, 155, 85)
const okay = chalk.rgb(195, 140, 70)
const poor = chalk.rgb(175, 120, 55)
const worst = chalk.rgb(155, 100, 45)

const heading = chalk.rgb(220, 160, 90).bold
const label = chalk.rgb(210, 150, 80)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // warm copper
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
 * colorGrade('grand-cathedral-bell') // best (bold copper)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'temple-bell': best, 'pure-chime': best, 'crystal-chime': best,
    'beautiful-patina': best, 'instant-response': best, 'grand-cathedral-bell': best,
    'bell-tower': best, 'pealing-glory': best, 'master-bell-founder': best,

    'resonant-tone': good, 'clear-tone': good, 'clear-ring': good,
    'graceful-aging': good, 'quick-react': good, 'church-bell': good,
    'clock-tower': good, 'clear-ringing': good, 'expert-founder': good,

    'proper-ring': okay, 'proper-sound': okay, 'proper-chime': okay,
    'proper-wear': okay, 'proper-swing': okay, 'proper-handbell': okay,
    'carillon': okay, 'decent-chiming': okay, 'skilled-bell-maker': okay,

    'dull-thud': poor, 'muffled': poor, 'faint-ding': poor,
    'premature-aging': poor, 'slow-response': poor, 'doorbell': poor,
    'single-bell': poor, 'muffled-sound': poor, 'apprentice': poor,

    'dead-metal': worst, 'discordant': worst, 'buzz': worst,
    'corroding': worst, 'sluggish': worst, 'broken-clapper': worst,
    'chime-set': worst, 'silent-tower': worst, 'novice': worst,

    'cracked-bell': worst, 'noise': worst, 'silent': worst,
    'rusted': worst, 'stuck': worst, 'silent-metal': worst,
    'no-bells': worst, 'collapsed': worst, 'tin-ear': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Tone Formatting ───────────────────────────────────────────────

/**
 * Format a single tone for display
 * @example
 * formatToneTable(tone) // colored tone info
 */
export function formatToneTable(tone: BellTone): string {
  const parts = [
    `${label('File:')} ${dim(tone.file)}`,
    `${label('Resonance:')} ${colorScore(tone.resonanceQuality)} ${colorGrade(tone.resonating.grade)}`,
    `${label('Tone Purity:')} ${colorScore(tone.tonePurity)} ${colorGrade(tone.purifying.tone)}`,
    `${label('Clarity Ring:')} ${colorScore(tone.clarityRing)} ${colorGrade(tone.ringing.ring)}`,
    `${label('Patina Wisdom:')} ${colorScore(tone.patinaWisdom)} ${colorGrade(tone.aging.patina)}`,
    `${label('Swing:')} ${colorScore(tone.swingResponsiveness)} ${colorGrade(tone.swinging.swing)}`,
    `${label('Score:')} ${colorScore(tone.qualityScore)} ${colorGrade(tone.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format tones as summary table
 * @example
 * formatTonesTable(tones) // multi-line table
 */
export function formatTonesTable(tones: BellTone[]): string {
  if (tones.length === 0) return dim('No bell tones found')
  const header = heading('Copper Bell Analysis')
  const rows = tones.map(t => formatToneTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Tower Formatting ──────────────────────────────────────────────

/**
 * Format a tower for display
 * @example
 * formatTowerTable(tower) // colored tower info
 */
export function formatTowerTable(tower: BellTower): string {
  const parts = [
    `${label('Tower:')} ${dim(tower.directory)}`,
    `${label('Type:')} ${colorGrade(tower.towerType)}`,
    `${label('Condition:')} ${colorGrade(tower.condition)}`,
    `${label('Tones:')} ${String(tower.tones.length)}`,
    `${label('Avg Resonance:')} ${colorScore(tower.avgResonance)}`,
    `${label('Avg Purity:')} ${colorScore(tower.avgPurity)}`,
    `${label('Avg Responsiveness:')} ${colorScore(tower.avgResponsiveness)}`,
    `${label('Cathedral Bells:')} ${String(tower.grandCathedralBellCount)}`,
    `${label('Silent Metal:')} ${String(tower.silentMetalCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all towers as summary
 * @example
 * formatTowersTable(towers) // multi-line tower summary
 */
export function formatTowersTable(towers: BellTower[]): string {
  if (towers.length === 0) return dim('No bell towers found')
  const header = heading('Bell Tower Analysis')
  const rows = towers.map(t => formatTowerTable(t))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: CopperBellResult['stats']): string {
  const parts = [
    heading('Copper Bell Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Towers:')} ${String(stats.totalTowers)}`,
    `${label('Avg Resonance:')} ${colorScore(stats.avgResonanceQuality)}`,
    `${label('Avg Tone Purity:')} ${colorScore(stats.avgTonePurity)}`,
    `${label('Avg Clarity Ring:')} ${colorScore(stats.avgClarityRing)}`,
    `${label('Avg Patina Wisdom:')} ${colorScore(stats.avgPatinaWisdom)}`,
    `${label('Avg Swing:')} ${colorScore(stats.avgSwingResponsiveness)}`,
    `${label('Cathedral Bells:')} ${String(stats.grandCathedralBellCount)}`,
    `${label('Church Bells:')} ${String(stats.churchBellCount)}`,
    `${label('Handbells:')} ${String(stats.properHandbellCount)}`,
    `${label('Doorbell:')} ${String(stats.doorbellCount)}`,
    `${label('Broken Clapper:')} ${String(stats.brokenClapperCount)}`,
    `${label('Silent Metal:')} ${String(stats.silentMetalCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Purity:')} ${String(stats.hasHighPurityCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Wisdom:')} ${String(stats.hasHighWisdomCount)}`,
    `${label('High Responsiveness:')} ${String(stats.hasHighResponsivenessCount)}`,
    `${label('Overall Resonance:')} ${colorScore(stats.overallResonance)}`,
    `${label('Founder Grade:')} ${colorGrade(stats.bellFounderGrade)}`,
    `${label('Best Tone:')} ${stats.bestTone}`,
    `${label('Most Resonant:')} ${stats.mostResonant}`,
    `${label('Purest:')} ${stats.purest}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Responsive:')} ${stats.mostResponsive}`,
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
export function formatResultTable(result: CopperBellResult): string {
  const sections = [
    formatTonesTable(result.tones),
    '',
    formatTowersTable(result.towers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Carillon')} ${label('Ringing:')} ${result.carillon.isRinging ? high('Yes') : low('No')} ${label('Overall Resonance:')} ${colorScore(result.carillon.overallResonance)}`,
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
export function formatResultJson(result: CopperBellResult): string {
  return JSON.stringify(result, null, 2)
}
