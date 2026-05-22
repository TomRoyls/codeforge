import chalk from 'chalk'

import type { SymphonyHallResult } from './symphony-hall-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('standing-ovation') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'standing-ovation': return chalk.rgb(46, 204, 113).bold(condition)
    case 'bravo': return chalk.rgb(52, 152, 219)(condition)
    case 'applause': return chalk.rgb(155, 89, 182)(condition)
    case 'polite-clapping': return chalk.rgb(241, 196, 15)(condition)
    case 'silence': return chalk.rgb(230, 126, 34)(condition)
    case 'booing': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('maestro') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'maestro': return chalk.rgb(46, 204, 113).bold(grade)
    case 'principal-conductor': return chalk.rgb(52, 152, 219)(grade)
    case 'conductor': return chalk.rgb(155, 89, 182)(grade)
    case 'assistant-conductor': return chalk.rgb(241, 196, 15)(grade)
    case 'rehearsal-pianist': return chalk.rgb(230, 126, 34)(grade)
    case 'metronome': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example venueColor('carnegie-hall') returns colored string */
export function venueColor(venue: string): string {
  switch (venue) {
    case 'carnegie-hall': return chalk.rgb(46, 204, 113)(venue)
    case 'royal-albert': return chalk.rgb(52, 152, 219)(venue)
    case 'concertgebouw': return chalk.rgb(155, 89, 182)(venue)
    case 'local-hall': return chalk.rgb(241, 196, 15)(venue)
    case 'school-gym': return chalk.rgb(230, 126, 34)(venue)
    case 'street-corner': return chalk.rgb(231, 76, 60)(venue)
    default: return venue
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSymphonyHallJson(result) returns JSON string */
export function formatSymphonyHallJson(result: SymphonyHallResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSymphonyHallTable(result, false) returns formatted string */
export function formatSymphonyHallTable(result: SymphonyHallResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push(chalk.rgb(155, 89, 182).bold('Symphony Hall Analysis'))
  lines.push('')
  lines.push(`Overall Symphony: ${scoreColor(result.festival.overallSymphony)}/100`)
  lines.push(`Conductor Grade: ${gradeColor(result.stats.conductorGrade)}`)
  lines.push(`Files: ${result.stats.totalFiles} | Halls: ${result.stats.totalHalls}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182).bold('Averages'))
  lines.push(`  Harmonic Coordination: ${scoreColor(result.stats.avgHarmonicCoordination)}`)
  lines.push(`  Rhythmic Precision:    ${scoreColor(result.stats.avgRhythmicPrecision)}`)
  lines.push(`  Dynamic Range:         ${scoreColor(result.stats.avgDynamicRange)}`)
  lines.push(`  Section Balance:       ${scoreColor(result.stats.avgSectionBalance)}`)
  lines.push(`  Score Fidelity:        ${scoreColor(result.stats.avgScoreFidelity)}`)
  lines.push(`  Performance Quality:   ${scoreColor(result.stats.avgPerformanceQuality)}`)

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('Condition Distribution'))
  lines.push(`  Standing Ovation:  ${result.stats.standingOvationCount}`)
  lines.push(`  Bravo:             ${result.stats.bravoCount}`)
  lines.push(`  Applause:          ${result.stats.applauseCount}`)
  lines.push(`  Polite Clapping:   ${result.stats.politeClappingCount}`)
  lines.push(`  Silence:           ${result.stats.silenceCount}`)
  lines.push(`  Booing:            ${result.stats.booingCount}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.rgb(155, 89, 182).bold('Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(241, 196, 15)('♫')} ${rec}`)
    }
  }

  if (verbose && result.movements.length > 0) {
    lines.push('')
    lines.push(chalk.rgb(155, 89, 182).bold('Per-Movement Breakdown'))
    for (const m of result.movements) {
      lines.push(`  ${chalk.rgb(241, 196, 15)(m.file)} [${conditionColor(m.condition)}] ${scoreColor(m.qualityScore)}`)
      lines.push(`    Harmony: ${scoreColor(m.harmony.coordination)} (${m.harmony.key})`)
      lines.push(`    Rhythm:  ${scoreColor(m.rhythm.precision)} (${m.rhythm.timeSignature})`)
      lines.push(`    Dynamics: ${scoreColor(m.dynamics.range)} (${m.dynamics.marking})`)
      lines.push(`    Sections: ${scoreColor(m.sections.balance)}`)
      lines.push(`    Score:   ${scoreColor(m.score.fidelity)}`)
      lines.push(`    Performance: ${scoreColor(m.performance.quality)} (${venueColor(m.performance.venue)})`)
    }
  }

  return lines.join('\n')
}
