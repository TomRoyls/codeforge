import chalk from 'chalk'

import type { PrismLightResult } from './prism-light-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('diamond-prism') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'diamond-prism': return chalk.rgb(46, 204, 113).bold(condition)
    case 'glass-prism': return chalk.rgb(52, 152, 219)(condition)
    case 'crystal-prism': return chalk.rgb(155, 89, 182)(condition)
    case 'plastic-prism': return chalk.rgb(241, 196, 15)(condition)
    case 'cracked-glass': return chalk.rgb(230, 126, 34)(condition)
    case 'ice-cube': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-optician') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-optician': return chalk.rgb(46, 204, 113).bold(grade)
    case 'optical-engineer': return chalk.rgb(52, 152, 219)(grade)
    case 'optician': return chalk.rgb(155, 89, 182)(grade)
    case 'glassblower': return chalk.rgb(241, 196, 15)(grade)
    case 'lens-grinder': return chalk.rgb(230, 126, 34)(grade)
    case 'cave-dweller': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example spectrumTypeColor('rainbow-display') returns colored string */
export function spectrumTypeColor(spectrumType: string): string {
  switch (spectrumType) {
    case 'rainbow-display': return chalk.rgb(46, 204, 113)(spectrumType)
    case 'spectrum-analysis': return chalk.rgb(52, 152, 219)(spectrumType)
    case 'light-show': return chalk.rgb(155, 89, 182)(spectrumType)
    case 'dim-glow': return chalk.rgb(241, 196, 15)(spectrumType)
    case 'shadow-play': return chalk.rgb(230, 126, 34)(spectrumType)
    case 'darkness': return chalk.rgb(231, 76, 60)(spectrumType)
    default: return spectrumType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatPrismLightJson(result) returns JSON string */
export function formatPrismLightJson(result: PrismLightResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatPrismLightTable(result, verbose) returns formatted string */
export function formatPrismLightTable(result: PrismLightResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Prism Light Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Laboratory Overview:'))
  lines.push(`    Overall Brilliance:      ${scoreColor(result.laboratory.overallBrilliance)}`)
  lines.push(`    Avg Transparency:        ${scoreColor(result.laboratory.avgTransparency)}`)
  lines.push(`    Avg Dispersion:          ${scoreColor(result.laboratory.avgDispersion)}`)
  lines.push(`    Avg Intensity:           ${scoreColor(result.laboratory.avgIntensity)}`)
  lines.push(`    Is Brilliant:            ${result.laboratory.isBrilliant ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Spectrums:           ${result.stats.totalSpectrums}`)
  lines.push(`    Avg Light Transparency:    ${scoreColor(result.stats.avgLightTransparency)}`)
  lines.push(`    Avg Spectrum Decomposition:${scoreColor(result.stats.avgSpectrumDecomposition)}`)
  lines.push(`    Avg Refraction Index:      ${scoreColor(result.stats.avgRefractionIndex)}`)
  lines.push(`    Avg Dispersion Accuracy:   ${scoreColor(result.stats.avgDispersionAccuracy)}`)
  lines.push(`    Avg Chromatic Purity:      ${scoreColor(result.stats.avgChromaticPurity)}`)
  lines.push(`    Avg Luminous Intensity:    ${scoreColor(result.stats.avgLuminousIntensity)}`)
  lines.push(`    Diamond Prism:             ${result.stats.diamondPrismCount}`)
  lines.push(`    Glass Prism:               ${result.stats.glassPrismCount}`)
  lines.push(`    Crystal Prism:             ${result.stats.crystalPrismCount}`)
  lines.push(`    Plastic Prism:             ${result.stats.plasticPrismCount}`)
  lines.push(`    Cracked Glass:             ${result.stats.crackedGlassCount}`)
  lines.push(`    Ice Cube:                  ${result.stats.iceCubeCount}`)
  lines.push(`    High Transparency:         ${result.stats.hasHighTransparencyCount}`)
  lines.push(`    Rich Spectrum:             ${result.stats.hasRichSpectrumCount}`)
  lines.push(`    Proper Refraction:         ${result.stats.hasProperRefractionCount}`)
  lines.push(`    Precise Dispersion:        ${result.stats.hasPreciseDispersionCount}`)
  lines.push(`    High Purity:               ${result.stats.hasHighPurityCount}`)
  lines.push(`    High Intensity:            ${result.stats.hasHighIntensityCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Optician Grade:            ${gradeColor(result.stats.opticianGrade)}`)
  lines.push(`    Best Beam:                 ${result.stats.bestBeam || 'N/A'}`)
  lines.push(`    Most Transparent:          ${result.stats.mostTransparent || 'N/A'}`)
  lines.push(`    Richest Spectrum:          ${result.stats.richestSpectrum || 'N/A'}`)
  lines.push(`    Best Refraction:           ${result.stats.bestRefraction || 'N/A'}`)
  lines.push(`    Most Precise:              ${result.stats.mostPrecise || 'N/A'}`)
  lines.push(`    Brightest:                 ${result.stats.brightest || 'N/A'}`)
  lines.push('')

  if (verbose && result.beams.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Beam Breakdown:'))
    for (const b of result.beams) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(b.file)}`)
      lines.push(`      Condition:              ${conditionColor(b.condition)}`)
      lines.push(`      Quality Score:          ${scoreColor(b.qualityScore)}`)
      lines.push(`      Transparency:           ${scoreColor(b.lightTransparency)} (${b.transparency.grade})`)
      lines.push(`      Spectrum:               ${scoreColor(b.spectrumDecomposition)} (${b.spectrum.range})`)
      lines.push(`      Refraction:             ${scoreColor(b.refractionIndex)} (${b.refraction.angle})`)
      lines.push(`      Dispersion:             ${scoreColor(b.dispersionAccuracy)} (${b.dispersion.type})`)
      lines.push(`      Purity:                 ${scoreColor(b.chromaticPurity)} (${b.purity.state})`)
      lines.push(`      Luminous:               ${scoreColor(b.luminousIntensity)} (${b.luminous.source})`)
    }
    lines.push('')
  }

  if (result.spectrums.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Spectrums:'))
    for (const s of result.spectrums) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(s.directory)} — ${spectrumTypeColor(s.spectrumType)} (${s.condition})`)
      lines.push(`      Beams: ${s.beams.length}, Diamond: ${s.diamondCount}, Ice: ${s.iceCubeCount}, Transparent: ${s.transparentCount}`)
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
