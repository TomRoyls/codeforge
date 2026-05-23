import chalk from 'chalk'
import type { CopperWireResult } from './copper-wire-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example gradeColor('superconductor') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'superconductor': return chalk.rgb(118, 255, 3).bold(g)
    case 'high-conductivity': return chalk.rgb(46, 204, 113)(g)
    case 'proper-copper': return chalk.rgb(52, 152, 219)(g)
    case 'resistive': return chalk.rgb(241, 196, 15)(g)
    case 'semiconductor': return chalk.rgb(230, 126, 34)(g)
    case 'insulator': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example signalColor('crystal-clear') returns colored string */
export function signalColor(s: string): string {
  switch (s) {
    case 'crystal-clear': return chalk.rgb(118, 255, 3).bold(s)
    case 'high-fidelity': return chalk.rgb(46, 204, 113)(s)
    case 'proper-signal': return chalk.rgb(52, 152, 219)(s)
    case 'some-noise': return chalk.rgb(241, 196, 15)(s)
    case 'noisy': return chalk.rgb(230, 126, 34)(s)
    case 'static': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example insulationColor('triple-shielded') returns colored string */
export function insulationColor(i: string): string {
  switch (i) {
    case 'triple-shielded': return chalk.rgb(118, 255, 3).bold(i)
    case 'double-insulated': return chalk.rgb(46, 204, 113)(i)
    case 'proper-sheath': return chalk.rgb(52, 152, 219)(i)
    case 'single-layer': return chalk.rgb(241, 196, 15)(i)
    case 'bare-wire': return chalk.rgb(230, 126, 34)(i)
    case 'exposed': return chalk.rgb(231, 76, 60)(i)
    default: return i
  }
}

/** @example circuitColor('complete-circuit') returns colored string */
export function circuitColor(c: string): string {
  switch (c) {
    case 'complete-circuit': return chalk.rgb(118, 255, 3).bold(c)
    case 'well-connected': return chalk.rgb(46, 204, 113)(c)
    case 'proper-wiring': return chalk.rgb(52, 152, 219)(c)
    case 'partial-circuit': return chalk.rgb(241, 196, 15)(c)
    case 'open-circuit': return chalk.rgb(230, 126, 34)(c)
    case 'disconnected': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gaugeColor('heavy-gauge') returns colored string */
export function gaugeColor(g: string): string {
  switch (g) {
    case 'heavy-gauge': return chalk.rgb(118, 255, 3).bold(g)
    case 'proper-size': return chalk.rgb(46, 204, 113)(g)
    case 'right-gauge': return chalk.rgb(52, 152, 219)(g)
    case 'undersized': return chalk.rgb(241, 196, 15)(g)
    case 'thin-wire': return chalk.rgb(230, 126, 34)(g)
    case 'filament': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example flexibilityColor('highly-flexible') returns colored string */
export function flexibilityColor(f: string): string {
  switch (f) {
    case 'highly-flexible': return chalk.rgb(118, 255, 3).bold(f)
    case 'proper-flex': return chalk.rgb(46, 204, 113)(f)
    case 'reasonable-bend': return chalk.rgb(52, 152, 219)(f)
    case 'stiff': return chalk.rgb(241, 196, 15)(f)
    case 'rigid': return chalk.rgb(230, 126, 34)(f)
    case 'brittle': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example conditionColor('perfect-conductor') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'perfect-conductor': return chalk.rgb(118, 255, 3).bold(c)
    case 'quality-wire': return chalk.rgb(46, 204, 113)(c)
    case 'proper-cable': return chalk.rgb(52, 152, 219)(c)
    case 'fraying-wire': return chalk.rgb(241, 196, 15)(c)
    case 'corroded-wire': return chalk.rgb(230, 126, 34)(c)
    case 'broken-circuit': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example electricianColor('master-electrician') returns colored string */
export function electricianColor(g: string): string {
  switch (g) {
    case 'master-electrician': return chalk.rgb(118, 255, 3).bold(g)
    case 'expert-wirer': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-technician': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'short-circuiter': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCopperWireJson(result) returns JSON string */
export function formatCopperWireJson(result: CopperWireResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCopperWireTable(result, verbose) returns formatted string */
export function formatCopperWireTable(result: CopperWireResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Copper Wire Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Network:'))
  lines.push(`    Avg Conductivity:       ${scoreColor(result.network.avgConductivity)}`)
  lines.push(`    Avg Completeness:       ${scoreColor(result.network.avgCompleteness)}`)
  lines.push(`    Avg Flexibility:        ${scoreColor(result.network.avgFlexibility)}`)
  lines.push(`    Is Conductive:          ${result.network.isConductive ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Conductivity:   ${scoreColor(result.network.overallConductivity)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Harnesses:          ${result.stats.totalHarnesses}`)
  lines.push(`    Avg Conductivity:         ${scoreColor(result.stats.avgConductivity)}`)
  lines.push(`    Avg Signal Integrity:     ${scoreColor(result.stats.avgSignalIntegrity)}`)
  lines.push(`    Avg Insulation Quality:   ${scoreColor(result.stats.avgInsulationQuality)}`)
  lines.push(`    Avg Circuit Completeness: ${scoreColor(result.stats.avgCircuitCompleteness)}`)
  lines.push(`    Avg Wire Gauge:           ${scoreColor(result.stats.avgWireGauge)}`)
  lines.push(`    Avg Flexibility:          ${scoreColor(result.stats.avgFlexibility)}`)
  lines.push(`    Electrician Grade:        ${electricianColor(result.stats.electricianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Perfect Conductor:  ${result.stats.perfectConductorCount}`)
  lines.push(`    Quality Wire:       ${result.stats.qualityWireCount}`)
  lines.push(`    Proper Cable:       ${result.stats.properCableCount}`)
  lines.push(`    Fraying Wire:       ${result.stats.frayingWireCount}`)
  lines.push(`    Corroded Wire:      ${result.stats.corrodedWireCount}`)
  lines.push(`    Broken Circuit:     ${result.stats.brokenCircuitCount}`)
  lines.push('')

  if (result.stats.bestSegment) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Segment:      ${result.stats.bestSegment}`)
    lines.push(`    Most Conductive:   ${result.stats.mostConductive}`)
    lines.push(`    Best Signal:       ${result.stats.bestSignal}`)
    lines.push(`    Best Insulated:    ${result.stats.bestInsulated}`)
    lines.push(`    Most Complete:     ${result.stats.mostComplete}`)
    lines.push(`    Most Flexible:     ${result.stats.mostFlexible}`)
    lines.push('')
  }

  if (verbose && result.segments.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Segments:'))
    for (const seg of result.segments) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(seg.file)}`)
      lines.push(`      Score: ${scoreColor(seg.qualityScore)}  Condition: ${conditionColor(seg.condition)}`)
      lines.push(`      Conductive: ${gradeColor(seg.conductive.grade)}(${seg.conductivity})  Signal: ${signalColor(seg.signal.quality)}(${seg.signalIntegrity})  Insulation: ${insulationColor(seg.insulation.rating)}(${seg.insulationQuality})`)
      lines.push(`      Circuit: ${circuitColor(seg.circuit.connection)}(${seg.circuitCompleteness})  Gauge: ${gaugeColor(seg.gauge.size)}(${seg.wireGauge})  Flexibility: ${flexibilityColor(seg.flexible.bend)}(${seg.flexibility})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{26A1}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
