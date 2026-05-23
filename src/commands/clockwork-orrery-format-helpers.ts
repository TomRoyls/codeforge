import chalk from 'chalk'

import type { ClockworkOrreryResult } from './clockwork-orrery-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('masterwork-orrery') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'masterwork-orrery': return chalk.rgb(255, 215, 0).bold(condition)
    case 'precision-instrument': return chalk.rgb(46, 204, 113)(condition)
    case 'functional-clock': return chalk.rgb(52, 152, 219)(condition)
    case 'ticking-device': return chalk.rgb(241, 196, 15)(condition)
    case 'broken-mechanism': return chalk.rgb(230, 126, 34)(condition)
    case 'static': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chronometer-grade') returns colored string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chronometer-grade': return chalk.rgb(255, 215, 0).bold(grade)
    case 'swiss-watch': return chalk.rgb(46, 204, 113)(grade)
    case 'precision': return chalk.rgb(155, 89, 182)(grade)
    case 'standard': return chalk.rgb(52, 152, 219)(grade)
    case 'rough': return chalk.rgb(241, 196, 15)(grade)
    case 'broken-gear': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example harmonyColor('symphony-of-gears') returns colored string */
export function harmonyColor(state: string): string {
  switch (state) {
    case 'symphony-of-gears': return chalk.rgb(255, 215, 0).bold(state)
    case 'well-coordinated': return chalk.rgb(46, 204, 113)(state)
    case 'synchronized': return chalk.rgb(155, 89, 182)(state)
    case 'mostly-synced': return chalk.rgb(52, 152, 219)(state)
    case 'desynchronized': return chalk.rgb(241, 196, 15)(state)
    case 'seized': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example orbitalColor('keplerian-orbit') returns colored string */
export function orbitalColor(pattern: string): string {
  switch (pattern) {
    case 'keplerian-orbit': return chalk.rgb(255, 215, 0).bold(pattern)
    case 'stable-orbit': return chalk.rgb(46, 204, 113)(pattern)
    case 'circular': return chalk.rgb(155, 89, 182)(pattern)
    case 'elliptical': return chalk.rgb(52, 152, 219)(pattern)
    case 'decaying': return chalk.rgb(241, 196, 15)(pattern)
    case 'chaotic': return chalk.rgb(231, 76, 60)(pattern)
    default: return pattern
  }
}

/** @example escapementColor('tourbillon') returns colored string */
export function escapementColor(mechanism: string): string {
  switch (mechanism) {
    case 'tourbillon': return chalk.rgb(255, 215, 0).bold(mechanism)
    case 'coaxial-escapement': return chalk.rgb(46, 204, 113)(mechanism)
    case 'lever-escapement': return chalk.rgb(155, 89, 182)(mechanism)
    case 'simple-escapement': return chalk.rgb(52, 152, 219)(mechanism)
    case 'dead-beat': return chalk.rgb(241, 196, 15)(mechanism)
    case 'stopped': return chalk.rgb(231, 76, 60)(mechanism)
    default: return mechanism
  }
}

/** @example timeColor('atomic-clock') returns colored string */
export function timeColor(accuracy: string): string {
  switch (accuracy) {
    case 'atomic-clock': return chalk.rgb(255, 215, 0).bold(accuracy)
    case 'chronometer': return chalk.rgb(46, 204, 113)(accuracy)
    case 'precision-time': return chalk.rgb(155, 89, 182)(accuracy)
    case 'standard-time': return chalk.rgb(52, 152, 219)(accuracy)
    case 'slow-clock': return chalk.rgb(241, 196, 15)(accuracy)
    case 'broken-clock': return chalk.rgb(231, 76, 60)(accuracy)
    default: return accuracy
  }
}

/** @example astroColor('planetarium-grade') returns colored string */
export function astroColor(fidelity: string): string {
  switch (fidelity) {
    case 'planetarium-grade': return chalk.rgb(255, 215, 0).bold(fidelity)
    case 'astronomical': return chalk.rgb(46, 204, 113)(fidelity)
    case 'navigational': return chalk.rgb(155, 89, 182)(fidelity)
    case 'educational': return chalk.rgb(52, 152, 219)(fidelity)
    case 'decorative': return chalk.rgb(241, 196, 15)(fidelity)
    case 'broken': return chalk.rgb(231, 76, 60)(fidelity)
    default: return fidelity
  }
}

/** @example horologistColor('master-horologist') returns colored string */
export function horologistColor(grade: string): string {
  switch (grade) {
    case 'master-horologist': return chalk.rgb(255, 215, 0).bold(grade)
    case 'clockmaker': return chalk.rgb(46, 204, 113)(grade)
    case 'watchmaker': return chalk.rgb(155, 89, 182)(grade)
    case 'repairman': return chalk.rgb(52, 152, 219)(grade)
    case 'tinkerer': return chalk.rgb(241, 196, 15)(grade)
    case 'breaker': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example chamberTypeColor('grand-orrery') returns colored string */
export function chamberTypeColor(type: string): string {
  switch (type) {
    case 'grand-orrery': return chalk.rgb(255, 215, 0).bold(type)
    case 'clock-tower': return chalk.rgb(46, 204, 113)(type)
    case 'watchmakers-bench': return chalk.rgb(155, 89, 182)(type)
    case 'clock-workshop': return chalk.rgb(52, 152, 219)(type)
    case 'junk-drawer': return chalk.rgb(241, 196, 15)(type)
    case 'empty': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example chamberConditionColor('horological-masterpiece') returns colored string */
export function chamberConditionColor(condition: string): string {
  switch (condition) {
    case 'horological-masterpiece': return chalk.rgb(255, 215, 0).bold(condition)
    case 'precision-workshop': return chalk.rgb(46, 204, 113)(condition)
    case 'working-clock': return chalk.rgb(155, 89, 182)(condition)
    case 'ticking': return chalk.rgb(52, 152, 219)(condition)
    case 'stopped': return chalk.rgb(241, 196, 15)(condition)
    case 'ruined': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatClockworkOrreryJson(result) returns JSON string */
export function formatClockworkOrreryJson(result: ClockworkOrreryResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatClockworkOrreryTable(result, verbose) returns formatted string */
export function formatClockworkOrreryTable(result: ClockworkOrreryResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(218, 165, 32).bold('  Clockwork Orrery Analysis'))
  lines.push('')

  lines.push(chalk.rgb(218, 165, 32)('  Clocktower Overview:'))
  lines.push(`    Overall Precision:    ${scoreColor(result.clocktower.overallPrecision)}`)
  lines.push(`    Avg Gear Precision:   ${scoreColor(result.clocktower.avgPrecision)}`)
  lines.push(`    Avg Harmony:          ${scoreColor(result.clocktower.avgHarmony)}`)
  lines.push(`    Avg Accuracy:         ${scoreColor(result.clocktower.avgAccuracy)}`)
  lines.push(`    Is Precise:           ${result.clocktower.isPrecise ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(218, 165, 32)('  Statistics:'))
  lines.push(`    Total Files:                ${result.stats.totalFiles}`)
  lines.push(`    Total Chambers:             ${result.stats.totalChambers}`)
  lines.push(`    Avg Gear Precision:         ${scoreColor(result.stats.avgGearPrecision)}`)
  lines.push(`    Avg Mechanical Harmony:     ${scoreColor(result.stats.avgMechanicalHarmony)}`)
  lines.push(`    Avg Orbital Logic:          ${scoreColor(result.stats.avgOrbitalLogic)}`)
  lines.push(`    Avg Escapement Quality:     ${scoreColor(result.stats.avgEscapementQuality)}`)
  lines.push(`    Avg Timekeeping:            ${scoreColor(result.stats.avgTimekeeping)}`)
  lines.push(`    Avg Astronomical Accuracy:  ${scoreColor(result.stats.avgAstronomicalAccuracy)}`)
  lines.push(`    Horologist Grade:           ${horologistColor(result.stats.horologistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(218, 165, 32)('  Condition Counts:'))
  lines.push(`    Masterwork Orrery:    ${result.stats.masterworkOrreryCount}`)
  lines.push(`    Precision Instrument: ${result.stats.precisionInstrumentCount}`)
  lines.push(`    Functional Clock:     ${result.stats.functionalClockCount}`)
  lines.push(`    Ticking Device:       ${result.stats.tickingDeviceCount}`)
  lines.push(`    Broken Mechanism:     ${result.stats.brokenMechanismCount}`)
  lines.push(`    Static:               ${result.stats.staticCount}`)
  lines.push('')

  if (result.stats.bestAssembly) {
    lines.push(chalk.rgb(218, 165, 32)('  Highlights:'))
    lines.push(`    Best Assembly:     ${result.stats.bestAssembly}`)
    lines.push(`    Most Precise:      ${result.stats.mostPrecise}`)
    lines.push(`    Most Harmonious:   ${result.stats.mostHarmonious}`)
    lines.push(`    Best Logic:        ${result.stats.bestLogic}`)
    lines.push(`    Best Timing:       ${result.stats.bestTiming}`)
    lines.push(`    Most Reliable:     ${result.stats.mostReliable}`)
    lines.push('')
  }

  if (verbose && result.assemblies.length > 0) {
    lines.push(chalk.rgb(218, 165, 32)('  Per-File Details:'))
    for (const a of result.assemblies) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(a.file)}`)
      lines.push(`      Score: ${scoreColor(a.qualityScore)}  Condition: ${conditionColor(a.condition)}`)
      lines.push(`      Gear: ${gradeColor(a.gear.grade)}(${a.gearPrecision})  Harmony: ${harmonyColor(a.harmony.state)}(${a.mechanicalHarmony})  Orbital: ${orbitalColor(a.orbital.pattern)}(${a.orbitalLogic})`)
      lines.push(`      Escapement: ${escapementColor(a.escapement.mechanism)}(${a.escapementQuality})  Time: ${timeColor(a.time.accuracy)}(${a.timekeeping})  Astro: ${astroColor(a.astronomical.fidelity)}(${a.astronomicalAccuracy})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(218, 165, 32)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(218, 165, 32)('\u{2699}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
