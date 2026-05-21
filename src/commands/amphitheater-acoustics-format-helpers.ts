import chalk from 'chalk'
import type { AmphitheaterAcousticsResult, AcousticReading, AcousticVenue, AmphitheaterAcousticsStats } from './amphitheater-acoustics-helpers.js'

// ─── Color Helpers ──────────────────────────────────────

/**
 * Colorize a numeric score
 * @example
 * scoreColor(85) // green bold
 */
export function scoreColor(score: number): string {
  if (score >= 70) return chalk.bold.green(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  return chalk.red(String(score))
}

/**
 * Colorize voice range
 * @example
 * voiceRangeColor('oration') // green bold
 */
export function voiceRangeColor(range: string): string {
  if (range === 'oration') return chalk.bold.green(range)
  if (range === 'presentation') return chalk.green(range)
  if (range === 'conversation') return chalk.cyan(range)
  if (range === 'whisper') return chalk.yellow(range)
  if (range === 'shout') return chalk.rgb(200, 130, 50)(range)
  return chalk.gray(range)
}

/**
 * Colorize condition
 * @example
 * conditionColor('carnegie-hall') // green bold
 */
export function conditionColor(condition: string): string {
  if (condition === 'carnegie-hall') return chalk.bold.green(condition)
  if (condition === 'sydney-opera') return chalk.green(condition)
  if (condition === 'royal-albert') return chalk.cyan(condition)
  if (condition === 'local-theater') return chalk.yellow(condition)
  if (condition === 'school-auditorium') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

/**
 * Colorize coverage
 * @example
 * coverageColor('front-row') // green bold
 */
export function coverageColor(coverage: string): string {
  if (coverage === 'front-row') return chalk.bold.green(coverage)
  if (coverage === 'orchestra') return chalk.green(coverage)
  if (coverage === 'mezzanine') return chalk.cyan(coverage)
  if (coverage === 'balcony') return chalk.yellow(coverage)
  if (coverage === 'nosebleed') return chalk.rgb(200, 130, 50)(coverage)
  return chalk.gray(coverage)
}

/**
 * Colorize performer type
 * @example
 * performerColor('virtuoso') // magenta bold
 */
export function performerColor(performer: string): string {
  if (performer === 'virtuoso') return chalk.bold.magenta(performer)
  if (performer === 'soloist') return chalk.magenta(performer)
  if (performer === 'ensemble') return chalk.cyan(performer)
  if (performer === 'chorus') return chalk.green(performer)
  if (performer === 'understudy') return chalk.yellow(performer)
  return chalk.gray(performer)
}

/**
 * Colorize architecture style
 * @example
 * archStyleColor('roman') // cyan
 */
export function archStyleColor(style: string): string {
  const colors: Record<string, (s: string) => string> = {
    roman: chalk.cyan, greek: chalk.blue, modern: chalk.green,
    baroque: chalk.magenta, renaissance: chalk.yellow, temporary: chalk.gray,
  }
  return (colors[style] ?? chalk.white)(style)
}

/**
 * Colorize acoustician grade
 * @example
 * acousticianGradeColor('master-acoustician') // green bold
 */
export function acousticianGradeColor(grade: string): string {
  if (grade === 'master-acoustician') return chalk.bold.green(grade)
  if (grade === 'sound-engineer') return chalk.green(grade)
  if (grade === 'audio-engineer') return chalk.cyan(grade)
  if (grade === 'sound-technician') return chalk.yellow(grade)
  if (grade === 'roadie') return chalk.rgb(200, 130, 50)(grade)
  return chalk.red(grade)
}

/**
 * Colorize venue condition
 * @example
 * venueConditionColor('world-class') // green bold
 */
export function venueConditionColor(condition: string): string {
  if (condition === 'world-class') return chalk.bold.green(condition)
  if (condition === 'premium') return chalk.green(condition)
  if (condition === 'professional') return chalk.cyan(condition)
  if (condition === 'amateur') return chalk.yellow(condition)
  if (condition === 'hobby') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

// ─── Reading Formatting ─────────────────────────────────

/**
 * Format a single acoustic reading
 * @example
 * formatReading(reading, false) // '  file.ts oration 75 carnegie-hall'
 */
export function formatReading(reading: AcousticReading, verbose: boolean): string {
  const lines: string[] = []
  const score = scoreColor(reading.qualityScore)
  const cond = conditionColor(reading.condition)
  lines.push(`  ${chalk.white(reading.file)} ${voiceRangeColor(reading.voice.range)} ${score} ${cond}`)

  if (verbose) {
    lines.push(`    Voice: projection=${scoreColor(reading.voiceProjection)} ${voiceRangeColor(reading.voice.range)} clear=${reading.voice.isClear} diction=${reading.voice.hasGoodDiction}`)
    lines.push(`    Resonance: quality=${scoreColor(reading.acousticResonance)} harmonic=${reading.resonance.hasHarmonicResonance} feedback=${reading.resonance.hasFeedback}`)
    lines.push(`    Reach: audience=${scoreColor(reading.audienceReach)} ${coverageColor(reading.reach.coverage)} accessible=${reading.reach.isAccessible}`)
    lines.push(`    Presence: quality=${scoreColor(reading.stagePresence)} ${performerColor(reading.presence.performer)} program=${reading.presence.hasProgram}`)
    lines.push(`    Echo: quality=${scoreColor(reading.echoQuality)} clean=${reading.echo.hasCleanEcho} shadows=${reading.echo.shadowCount}`)
    lines.push(`    Architecture: acoustics=${scoreColor(reading.architecturalAcoustics)} ${archStyleColor(reading.architecture.style)} isolation=${reading.architecture.hasIsolation}`)
  }

  return lines.join('\n')
}

// ─── Venue Formatting ──────────────────────────────────

/**
 * Format an acoustic venue
 * @example
 * formatVenue(venue, false) // '  src/ opera-house ...'
 */
export function formatVenue(venue: AcousticVenue, verbose: boolean): string {
  const lines: string[] = []
  const voice = scoreColor(venue.avgVoiceProjection)
  const cond = venueConditionColor(venue.condition)

  lines.push(`  ${chalk.white(venue.directory)} voice=${voice} presence=${scoreColor(venue.avgStagePresence)} ${cond}`)
  lines.push(`    type=${venue.venueType} readings=${venue.readings.length} carnegie=${venue.carnegieHallCount} echo-chamber=${venue.echoChamberCount}`)

  if (verbose) {
    for (const reading of venue.readings) {
      lines.push(formatReading(reading, false))
    }
  }

  return lines.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line stats
 */
export function formatStats(stats: AmphitheaterAcousticsStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold('Files')}: ${stats.totalFiles}  ${chalk.bold('Venues')}: ${stats.totalVenues}`)
  lines.push(`  ${chalk.bold('Avg Voice')}: ${scoreColor(stats.avgVoiceProjection)}  ${chalk.bold('Avg Resonance')}: ${scoreColor(stats.avgAcousticResonance)}`)
  lines.push(`  ${chalk.bold('Avg Reach')}: ${scoreColor(stats.avgAudienceReach)}  ${chalk.bold('Avg Presence')}: ${scoreColor(stats.avgStagePresence)}`)
  lines.push(`  ${chalk.bold('Avg Echo')}: ${scoreColor(stats.avgEchoQuality)}  ${chalk.bold('Avg Architecture')}: ${scoreColor(stats.avgArchitecturalAcoustics)}`)
  lines.push(`  ${chalk.bold('Overall')}: ${scoreColor(stats.overallAcoustics)}  ${chalk.bold('Grade')}: ${acousticianGradeColor(stats.acousticianGrade)}`)

  lines.push(`  ${chalk.bold('Conditions')}: carnegie=${stats.carnegieHallCount} sydney=${stats.sydneyOperaCount} royal=${stats.royalAlbertCount} local=${stats.localTheaterCount} school=${stats.schoolAuditoriumCount} echo=${stats.echoChamberCount}`)

  lines.push(`  ${chalk.bold('Best Reading')}: ${stats.bestReading}`)
  lines.push(`  ${chalk.bold('Clearest Voice')}: ${stats.clearestVoice}`)
  lines.push(`  ${chalk.bold('Best Resonance')}: ${stats.bestResonance}`)
  lines.push(`  ${chalk.bold('Widest Reach')}: ${stats.widestReach}`)
  lines.push(`  ${chalk.bold('Best Presence')}: ${stats.bestPresence}`)

  return lines.join('\n')
}

// ─── Table Formatter ────────────────────────────────────

/**
 * Format result as colored table
 * @example
 * formatAmphitheaterAcousticsTable(result, false) // colored output
 */
export function formatAmphitheaterAcousticsTable(result: AmphitheaterAcousticsResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.blue('🎭 Amphitheater Acoustics Analysis'))
  lines.push('═'.repeat(50))

  lines.push('')
  lines.push(chalk.bold('🎤 Acoustic Readings'))
  for (const reading of result.readings) {
    lines.push(formatReading(reading, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('🏛️  Venues'))
  for (const venue of result.venues) {
    lines.push(formatVenue(venue, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ─────────────────────────────────────

/**
 * Format result as JSON
 * @example
 * formatAmphitheaterAcousticsJson(result) // JSON string
 */
export function formatAmphitheaterAcousticsJson(result: AmphitheaterAcousticsResult): string {
  return JSON.stringify(result, null, 2)
}
