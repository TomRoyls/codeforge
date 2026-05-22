import chalk from 'chalk'

import type { AuroraBorealisResult } from './aurora-borealis-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('magnificent-display') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'magnificent-display': return chalk.rgb(255, 215, 0).bold(condition)
    case 'brilliant-aurora': return chalk.rgb(46, 204, 113)(condition)
    case 'visible-shimmer': return chalk.rgb(52, 152, 219)(condition)
    case 'faint-glow': return chalk.rgb(241, 196, 15)(condition)
    case 'subvisual': return chalk.rgb(230, 126, 34)(condition)
    case 'darkness': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('aurora-master') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'aurora-master': return chalk.rgb(255, 215, 0).bold(grade)
    case 'polar-observer': return chalk.rgb(46, 204, 113)(grade)
    case 'aurora-hunter': return chalk.rgb(155, 89, 182)(grade)
    case 'sky-watcher': return chalk.rgb(52, 152, 219)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'indoor': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example intensityColor('solar-flare') returns colored string */
export function intensityColor(intensity: string): string {
  switch (intensity) {
    case 'solar-flare': return chalk.rgb(255, 215, 0).bold(intensity)
    case 'geomagnetic-storm': return chalk.rgb(46, 204, 113)(intensity)
    case 'aurora-maximum': return chalk.rgb(155, 89, 182)(intensity)
    case 'substorm': return chalk.rgb(52, 152, 219)(intensity)
    case 'quiet': return chalk.rgb(241, 196, 15)(intensity)
    case 'dormant': return chalk.rgb(231, 76, 60)(intensity)
    default: return intensity
  }
}

/** @example fieldColor('perfect-dipole') returns colored string */
export function fieldColor(field: string): string {
  switch (field) {
    case 'perfect-dipole': return chalk.rgb(255, 215, 0).bold(field)
    case 'strong-alignment': return chalk.rgb(46, 204, 113)(field)
    case 'magnetic-field': return chalk.rgb(155, 89, 182)(field)
    case 'weak-field': return chalk.rgb(52, 152, 219)(field)
    case 'distorted': return chalk.rgb(241, 196, 15)(field)
    case 'collapsed': return chalk.rgb(231, 76, 60)(field)
    default: return field
  }
}

/** @example paletteColor('full-spectrum') returns colored string */
export function paletteColor(palette: string): string {
  switch (palette) {
    case 'full-spectrum': return chalk.rgb(255, 215, 0).bold(palette)
    case 'green-curtain': return chalk.rgb(46, 204, 113)(palette)
    case 'violet-waves': return chalk.rgb(155, 89, 182)(palette)
    case 'faint-glow': return chalk.rgb(52, 152, 219)(palette)
    case 'monochrome': return chalk.rgb(241, 196, 15)(palette)
    case 'invisible': return chalk.rgb(231, 76, 60)(palette)
    default: return palette
  }
}

/** @example processColor('fusion-reactor') returns colored string */
export function processColor(process: string): string {
  switch (process) {
    case 'fusion-reactor': return chalk.rgb(255, 215, 0).bold(process)
    case 'high-ionization': return chalk.rgb(46, 204, 113)(process)
    case 'partial-ionization': return chalk.rgb(155, 89, 182)(process)
    case 'excited-state': return chalk.rgb(52, 152, 219)(process)
    case 'ground-state': return chalk.rgb(241, 196, 15)(process)
    case 'frozen': return chalk.rgb(231, 76, 60)(process)
    default: return process
  }
}

/** @example atmosphericConditionColor('crystal-clear') returns colored string */
export function atmosphericConditionColor(condition: string): string {
  switch (condition) {
    case 'crystal-clear': return chalk.rgb(255, 215, 0).bold(condition)
    case 'arctic-clear': return chalk.rgb(46, 204, 113)(condition)
    case 'high-altitude': return chalk.rgb(155, 89, 182)(condition)
    case 'partly-cloudy': return chalk.rgb(52, 152, 219)(condition)
    case 'overcast': return chalk.rgb(241, 196, 15)(condition)
    case 'opaque': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example powerColor('mega-flare') returns colored string */
export function powerColor(power: string): string {
  switch (power) {
    case 'mega-flare': return chalk.rgb(255, 215, 0).bold(power)
    case 'strong-force': return chalk.rgb(46, 204, 113)(power)
    case 'moderate-field': return chalk.rgb(155, 89, 182)(power)
    case 'weak-field': return chalk.rgb(52, 152, 219)(power)
    case 'residual': return chalk.rgb(241, 196, 15)(power)
    case 'void': return chalk.rgb(231, 76, 60)(power)
    default: return power
  }
}

/** @example regionTypeColor('aurora-oval') returns colored string */
export function regionTypeColor(type: string): string {
  switch (type) {
    case 'aurora-oval': return chalk.rgb(255, 215, 0).bold(type)
    case 'polar-cap': return chalk.rgb(46, 204, 113)(type)
    case 'sub-auroral': return chalk.rgb(155, 89, 182)(type)
    case 'mid-latitude': return chalk.rgb(52, 152, 219)(type)
    case 'equatorial': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example regionConditionColor('spectacular-display') returns colored string */
export function regionConditionColor(condition: string): string {
  switch (condition) {
    case 'spectacular-display': return chalk.rgb(255, 215, 0).bold(condition)
    case 'active-aurora': return chalk.rgb(46, 204, 113)(condition)
    case 'quiet-aurora': return chalk.rgb(155, 89, 182)(condition)
    case 'faint-glimmer': return chalk.rgb(52, 152, 219)(condition)
    case 'dark-sky': return chalk.rgb(241, 196, 15)(condition)
    case 'void': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAuroraBorealisJson(result) returns JSON string */
export function formatAuroraBorealisJson(result: AuroraBorealisResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAuroraBorealisTable(result, verbose) returns formatted string */
export function formatAuroraBorealisTable(result: AuroraBorealisResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(100, 200, 255).bold('  Aurora Borealis Analysis'))
  lines.push('')

  lines.push(chalk.rgb(100, 200, 255)('  Magnetosphere Overview:'))
  lines.push(`    Overall Brilliance:  ${scoreColor(result.magnetosphere.overallBrilliance)}`)
  lines.push(`    Avg Energy:          ${scoreColor(result.magnetosphere.avgEnergy)}`)
  lines.push(`    Avg Alignment:       ${scoreColor(result.magnetosphere.avgAlignment)}`)
  lines.push(`    Avg Electromagnetic: ${scoreColor(result.magnetosphere.avgElectromagnetic)}`)
  lines.push(`    Is Brilliant:        ${result.magnetosphere.isBrilliant ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(100, 200, 255)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Regions:             ${result.stats.totalRegions}`)
  lines.push(`    Avg Polar Energy:          ${scoreColor(result.stats.avgPolarEnergy)}`)
  lines.push(`    Avg Magnetic Alignment:    ${scoreColor(result.stats.avgMagneticAlignment)}`)
  lines.push(`    Avg Spectral Beauty:       ${scoreColor(result.stats.avgSpectralBeauty)}`)
  lines.push(`    Avg Ionization Quality:    ${scoreColor(result.stats.avgIonizationQuality)}`)
  lines.push(`    Avg Atmospheric Clarity:   ${scoreColor(result.stats.avgAtmosphericClarity)}`)
  lines.push(`    Avg Electromagnetic Force: ${scoreColor(result.stats.avgElectromagneticForce)}`)
  lines.push(`    Observer Grade:            ${gradeColor(result.stats.observerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(100, 200, 255)('  Condition Counts:'))
  lines.push(`    Magnificent Display: ${result.stats.magnificentDisplayCount}`)
  lines.push(`    Brilliant Aurora:    ${result.stats.brilliantAuroraCount}`)
  lines.push(`    Visible Shimmer:     ${result.stats.visibleShimmerCount}`)
  lines.push(`    Faint Glow:          ${result.stats.faintGlowCount}`)
  lines.push(`    Subvisual:           ${result.stats.subvisualCount}`)
  lines.push(`    Darkness:            ${result.stats.darknessCount}`)
  lines.push('')

  if (result.stats.bestFlare) {
    lines.push(chalk.rgb(100, 200, 255)('  Highlights:'))
    lines.push(`    Best Flare:           ${result.stats.bestFlare}`)
    lines.push(`    Most Energetic:       ${result.stats.mostEnergetic}`)
    lines.push(`    Most Aligned:         ${result.stats.mostAligned}`)
    lines.push(`    Most Beautiful:       ${result.stats.mostBeautiful}`)
    lines.push(`    Most Transformative:  ${result.stats.mostTransformative}`)
    lines.push(`    Strongest Force:      ${result.stats.strongestForce}`)
    lines.push('')
  }

  if (verbose && result.flares.length > 0) {
    lines.push(chalk.rgb(100, 200, 255)('  Per-File Details:'))
    for (const f of result.flares) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Energy: ${intensityColor(f.energy.intensity)}(${f.polarEnergy})  Alignment: ${fieldColor(f.alignment.field)}(${f.magneticAlignment})  Spectral: ${paletteColor(f.spectral.palette)}(${f.spectralBeauty})`)
      lines.push(`      Ion: ${processColor(f.ionization.process)}(${f.ionizationQuality})  Atmo: ${atmosphericConditionColor(f.atmospheric.condition)}(${f.atmosphericClarity})  EM: ${powerColor(f.electromagnetic.power)}(${f.electromagneticForce})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(100, 200, 255)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(100, 200, 255)('\u{2728}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
