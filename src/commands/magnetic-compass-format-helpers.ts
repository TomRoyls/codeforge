import chalk from 'chalk'

import type { MagneticCompassResult } from './magnetic-compass-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example accuracyColor('surveyor-grade') returns colored string */
export function accuracyColor(a: string): string {
  switch (a) {
    case 'surveyor-grade': return chalk.rgb(100, 149, 237).bold(a)
    case 'marine-compass': return chalk.rgb(46, 204, 113)(a)
    case 'hiking-compass': return chalk.rgb(155, 89, 182)(a)
    case 'basic-compass': return chalk.rgb(52, 152, 219)(a)
    case 'toy-compass': return chalk.rgb(241, 196, 15)(a)
    case 'broken': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example alignmentQualityColor('perfect-alignment') returns colored string */
export function alignmentQualityColor(q: string): string {
  switch (q) {
    case 'perfect-alignment': return chalk.rgb(100, 149, 237).bold(q)
    case 'strong-field': return chalk.rgb(46, 204, 113)(q)
    case 'good-alignment': return chalk.rgb(155, 89, 182)(q)
    case 'moderate': return chalk.rgb(52, 152, 219)(q)
    case 'weak-field': return chalk.rgb(241, 196, 15)(q)
    case 'demagnetized': return chalk.rgb(231, 76, 60)(q)
    default: return q
  }
}

/** @example clarityColor('true-north') returns colored string */
export function clarityColor(c: string): string {
  switch (c) {
    case 'true-north': return chalk.rgb(100, 149, 237).bold(c)
    case 'clear-bearing': return chalk.rgb(46, 204, 113)(c)
    case 'known-direction': return chalk.rgb(155, 89, 182)(c)
    case 'general-direction': return chalk.rgb(52, 152, 219)(c)
    case 'vague-heading': return chalk.rgb(241, 196, 15)(c)
    case 'lost': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example declinationColor('surveyor-corrected') returns colored string */
export function declinationColor(d: string): string {
  switch (d) {
    case 'surveyor-corrected': return chalk.rgb(100, 149, 237).bold(d)
    case 'well-adjusted': return chalk.rgb(46, 204, 113)(d)
    case 'properly-calibrated': return chalk.rgb(155, 89, 182)(d)
    case 'approximate': return chalk.rgb(52, 152, 219)(d)
    case 'uncorrected': return chalk.rgb(241, 196, 15)(d)
    case 'wildly-off': return chalk.rgb(231, 76, 60)(d)
    default: return d
  }
}

/** @example bearingColor('rock-steady') returns colored string */
export function bearingColor(b: string): string {
  switch (b) {
    case 'rock-steady': return chalk.rgb(100, 149, 237).bold(b)
    case 'stable-bearing': return chalk.rgb(46, 204, 113)(b)
    case 'reliable': return chalk.rgb(155, 89, 182)(b)
    case 'mostly-stable': return chalk.rgb(52, 152, 219)(b)
    case 'drifting': return chalk.rgb(241, 196, 15)(b)
    case 'spinning': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example ratingColor('master-navigator') returns colored string */
export function ratingColor(r: string): string {
  switch (r) {
    case 'master-navigator': return chalk.rgb(100, 149, 237).bold(r)
    case 'expert-pilot': return chalk.rgb(46, 204, 113)(r)
    case 'skilled-helmsman': return chalk.rgb(155, 89, 182)(r)
    case 'competent': return chalk.rgb(52, 152, 219)(r)
    case 'learner': return chalk.rgb(241, 196, 15)(r)
    case 'lost-at-sea': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example conditionColor('master-compass') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'master-compass': return chalk.rgb(100, 149, 237).bold(c)
    case 'precision-instrument': return chalk.rgb(46, 204, 113)(c)
    case 'reliable-compass': return chalk.rgb(155, 89, 182)(c)
    case 'basic-tool': return chalk.rgb(52, 152, 219)(c)
    case 'damaged-compass': return chalk.rgb(241, 196, 15)(c)
    case 'spinning-wheel': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example navigatorGradeColor('master-cartographer') returns colored string */
export function navigatorGradeColor(g: string): string {
  switch (g) {
    case 'master-cartographer': return chalk.rgb(100, 149, 237).bold(g)
    case 'sea-captain': return chalk.rgb(46, 204, 113)(g)
    case 'navigator': return chalk.rgb(155, 89, 182)(g)
    case 'helmsman': return chalk.rgb(52, 152, 219)(g)
    case 'passenger': return chalk.rgb(241, 196, 15)(g)
    case 'shipwreck-victim': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example roseTypeColor('master-rose') returns colored string */
export function roseTypeColor(t: string): string {
  switch (t) {
    case 'master-rose': return chalk.rgb(100, 149, 237).bold(t)
    case 'full-compass': return chalk.rgb(46, 204, 113)(t)
    case 'nautical-compass': return chalk.rgb(155, 89, 182)(t)
    case 'pocket-compass': return chalk.rgb(52, 152, 219)(t)
    case 'toy-compass': return chalk.rgb(241, 196, 15)(t)
    case 'broken': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example roseConditionColor('cartographic-quality') returns colored string */
export function roseConditionColor(c: string): string {
  switch (c) {
    case 'cartographic-quality': return chalk.rgb(100, 149, 237).bold(c)
    case 'navigational-aid': return chalk.rgb(46, 204, 113)(c)
    case 'basic-direction': return chalk.rgb(155, 89, 182)(c)
    case 'rough-bearing': return chalk.rgb(52, 152, 219)(c)
    case 'unreliable': return chalk.rgb(241, 196, 15)(c)
    case 'useless': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMagneticCompassJson(result) returns JSON string */
export function formatMagneticCompassJson(result: MagneticCompassResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMagneticCompassTable(result, verbose) returns formatted string */
export function formatMagneticCompassTable(result: MagneticCompassResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 149, 237).bold('  Magnetic Compass Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Chart Overview:'))
  lines.push(`    Overall Orientation:  ${scoreColor(result.chart.overallOrientation)}`)
  lines.push(`    Avg Precision:        ${scoreColor(result.chart.avgPrecision)}`)
  lines.push(`    Avg Alignment:        ${scoreColor(result.chart.avgAlignment)}`)
  lines.push(`    Avg Navigation:       ${scoreColor(result.chart.avgNavigation)}`)
  lines.push(`    Is Oriented:          ${result.chart.isOriented ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Roses:          ${result.stats.totalRoses}`)
  lines.push(`    Avg Needle:           ${scoreColor(result.stats.avgNeedlePrecision)}`)
  lines.push(`    Avg Alignment:        ${scoreColor(result.stats.avgMagneticAlignment)}`)
  lines.push(`    Avg Cardinal:         ${scoreColor(result.stats.avgCardinalDirection)}`)
  lines.push(`    Avg Declination:      ${scoreColor(result.stats.avgDeclinationCorrection)}`)
  lines.push(`    Avg Bearing:          ${scoreColor(result.stats.avgBearingStability)}`)
  lines.push(`    Avg Navigation:       ${scoreColor(result.stats.avgNavigationSkill)}`)
  lines.push(`    Navigator Grade:      ${navigatorGradeColor(result.stats.navigatorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 149, 237)('  Condition Counts:'))
  lines.push(`    Master Compass:     ${result.stats.masterCompassCount}`)
  lines.push(`    Precision Inst:     ${result.stats.precisionInstrumentCount}`)
  lines.push(`    Reliable:           ${result.stats.reliableCompassCount}`)
  lines.push(`    Basic Tool:         ${result.stats.basicToolCount}`)
  lines.push(`    Damaged:            ${result.stats.damagedCompassCount}`)
  lines.push(`    Spinning Wheel:     ${result.stats.spinningWheelCount}`)
  lines.push('')

  if (result.stats.bestReading) {
    lines.push(chalk.rgb(100, 149, 237)('  Highlights:'))
    lines.push(`    Best Reading:       ${result.stats.bestReading}`)
    lines.push(`    Most Precise:       ${result.stats.mostPrecise}`)
    lines.push(`    Most Aligned:       ${result.stats.mostAligned}`)
    lines.push(`    Clearest Dir:       ${result.stats.clearestDirection}`)
    lines.push(`    Best Adjusted:      ${result.stats.bestAdjusted}`)
    lines.push(`    Most Stable:        ${result.stats.mostStable}`)
    lines.push('')
  }

  if (verbose && result.readings.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Per-File Details:'))
    for (const reading of result.readings) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(reading.file)}`)
      lines.push(`      Score: ${scoreColor(reading.qualityScore)}  Condition: ${conditionColor(reading.condition)}`)
      lines.push(`      Needle: ${accuracyColor(reading.needle.accuracy)}(${reading.needlePrecision})  Alignment: ${alignmentQualityColor(reading.alignment.quality)}(${reading.magneticAlignment})  Cardinal: ${clarityColor(reading.cardinal.clarity)}(${reading.cardinalDirection})`)
      lines.push(`      Declination: ${declinationColor(reading.declination.accuracy)}(${reading.declinationCorrection})  Bearing: ${bearingColor(reading.bearing.quality)}(${reading.bearingStability})  Navigation: ${ratingColor(reading.navigation.rating)}(${reading.navigationSkill})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(100, 149, 237)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(100, 149, 237)('\u2728')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
