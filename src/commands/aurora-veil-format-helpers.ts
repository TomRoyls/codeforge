import chalk from 'chalk'

import type { AuroraVeilResult } from './aurora-veil-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('solar-maximum') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'solar-maximum': return chalk.rgb(46, 204, 113).bold(condition)
    case 'storm-peak': return chalk.rgb(52, 152, 219)(condition)
    case 'active-night': return chalk.rgb(155, 89, 182)(condition)
    case 'quiet-arc': return chalk.rgb(241, 196, 15)(condition)
    case 'substorm': return chalk.rgb(230, 126, 34)(condition)
    case 'clouded-out': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('aurora-hunter') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'aurora-hunter': return chalk.rgb(46, 204, 113).bold(grade)
    case 'astrophysicist': return chalk.rgb(52, 152, 219)(grade)
    case 'astronomer': return chalk.rgb(155, 89, 182)(grade)
    case 'sky-watcher': return chalk.rgb(241, 196, 15)(grade)
    case 'stargazer': return chalk.rgb(230, 126, 34)(grade)
    case 'blind-spot': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example regionTypeColor('aurora-oval') returns colored string */
export function regionTypeColor(regionType: string): string {
  switch (regionType) {
    case 'aurora-oval': return chalk.rgb(46, 204, 113)(regionType)
    case 'polar-cap': return chalk.rgb(52, 152, 219)(regionType)
    case 'sub-auroral': return chalk.rgb(155, 89, 182)(regionType)
    case 'mid-latitude': return chalk.rgb(241, 196, 15)(regionType)
    case 'equatorial': return chalk.rgb(230, 126, 34)(regionType)
    case 'dark-side': return chalk.rgb(231, 76, 60)(regionType)
    default: return regionType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAuroraVeilJson(result) returns JSON string */
export function formatAuroraVeilJson(result: AuroraVeilResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAuroraVeilTable(result, verbose) returns formatted string */
export function formatAuroraVeilTable(result: AuroraVeilResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Aurora Veil Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Sky Overview:'))
  lines.push(`    Overall Grandeur:     ${scoreColor(result.sky.overallGrandeur)}`)
  lines.push(`    Avg Luminosity:       ${scoreColor(result.sky.avgLuminosity)}`)
  lines.push(`    Avg Structure:        ${scoreColor(result.sky.avgStructure)}`)
  lines.push(`    Avg Grandeur:         ${scoreColor(result.sky.avgGrandeur)}`)
  lines.push(`    Breathtaking:         ${result.sky.isBreathtaking ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Regions:            ${result.stats.totalRegions}`)
  lines.push(`    Avg Luminosity:           ${scoreColor(result.stats.avgCurtainLuminosity)}`)
  lines.push(`    Avg Spectrum:             ${scoreColor(result.stats.avgColorSpectrum)}`)
  lines.push(`    Avg Magnetic:             ${scoreColor(result.stats.avgMagneticDeflection)}`)
  lines.push(`    Avg Ionosphere:           ${scoreColor(result.stats.avgIonosphericCharge)}`)
  lines.push(`    Avg Particle:             ${scoreColor(result.stats.avgParticleCollision)}`)
  lines.push(`    Avg Grandeur:             ${scoreColor(result.stats.avgCelestialGrandeur)}`)
  lines.push(`    Solar Maximum:            ${result.stats.solarMaximumCount}`)
  lines.push(`    Storm Peak:               ${result.stats.stormPeakCount}`)
  lines.push(`    Active Night:             ${result.stats.activeNightCount}`)
  lines.push(`    Quiet Arc:                ${result.stats.quietArcCount}`)
  lines.push(`    Substorm:                 ${result.stats.substormCount}`)
  lines.push(`    Clouded Out:              ${result.stats.cloudedOutCount}`)
  lines.push(`    High Luminosity:          ${result.stats.hasHighLuminosityCount}`)
  lines.push(`    Rich Spectrum:            ${result.stats.hasRichSpectrumCount}`)
  lines.push(`    Proper Structure:         ${result.stats.hasProperStructureCount}`)
  lines.push(`    High Energy:              ${result.stats.hasHighEnergyCount}`)
  lines.push(`    High Interaction:         ${result.stats.hasHighInteractionCount}`)
  lines.push(`    Grand:                    ${result.stats.isGrandCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Astronomer Grade:         ${gradeColor(result.stats.astronomerGrade)}`)
  lines.push(`    Best Curtain:             ${result.stats.bestCurtain || 'N/A'}`)
  lines.push(`    Brightest:                ${result.stats.brightest || 'N/A'}`)
  lines.push(`    Most Diverse:             ${result.stats.mostDiverse || 'N/A'}`)
  lines.push(`    Best Structured:          ${result.stats.bestStructured || 'N/A'}`)
  lines.push(`    Most Energetic:           ${result.stats.mostEnergetic || 'N/A'}`)
  lines.push(`    Grandest:                 ${result.stats.grandest || 'N/A'}`)
  lines.push('')

  if (verbose && result.curtains.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Curtain Breakdown:'))
    for (const c of result.curtains) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(c.file)}`)
      lines.push(`      Condition:             ${conditionColor(c.condition)}`)
      lines.push(`      Quality Score:         ${scoreColor(c.qualityScore)}`)
      lines.push(`      Luminosity:            ${scoreColor(c.curtainLuminosity)} (${c.luminosity.brightness})`)
      lines.push(`      Spectrum:              ${scoreColor(c.colorSpectrum)} (${c.spectrum.palette})`)
      lines.push(`      Magnetic:              ${scoreColor(c.magneticDeflection)} (${c.magnetic.field})`)
      lines.push(`      Ionosphere:            ${scoreColor(c.ionosphericCharge)} (${c.ionosphere.layer})`)
      lines.push(`      Particle:              ${scoreColor(c.particleCollision)} (${c.particle.source})`)
      lines.push(`      Grandeur:              ${scoreColor(c.celestialGrandeur)} (${c.grandeur.display})`)
    }
    lines.push('')
  }

  if (result.regions.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Regions:'))
    for (const r of result.regions) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(r.directory)} — ${regionTypeColor(r.regionType)} (${r.condition})`)
      lines.push(`      Curtains: ${r.curtains.length}, Solar Max: ${r.solarMaximumCount}, Clouded: ${r.cloudedOutCount}, Grand: ${r.grandCount}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    • ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
