import chalk from 'chalk'
import type { CrystalPrismResult } from './crystal-prism-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example angleColor('perfect-refraction') returns colored string */
export function angleColor(s: string): string {
  switch (s) {
    case 'perfect-refraction': return chalk.rgb(118, 255, 3).bold(s)
    case 'clean-bend': return chalk.rgb(46, 204, 113)(s)
    case 'proper-angle': return chalk.rgb(52, 152, 219)(s)
    case 'slight-distortion': return chalk.rgb(241, 196, 15)(s)
    case 'warped': return chalk.rgb(230, 126, 34)(s)
    case 'shattered': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example rangeColor('full-rainbow') returns colored string */
export function rangeColor(s: string): string {
  switch (s) {
    case 'full-rainbow': return chalk.rgb(118, 255, 3).bold(s)
    case 'rich-spectrum': return chalk.rgb(46, 204, 113)(s)
    case 'proper-range': return chalk.rgb(52, 152, 219)(s)
    case 'limited-palette': return chalk.rgb(241, 196, 15)(s)
    case 'monochrome': return chalk.rgb(230, 126, 34)(s)
    case 'infrared-only': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example decompositionColor('atomic-clarity') returns colored string */
export function decompositionColor(s: string): string {
  switch (s) {
    case 'atomic-clarity': return chalk.rgb(118, 255, 3).bold(s)
    case 'clean-breakdown': return chalk.rgb(46, 204, 113)(s)
    case 'proper-separation': return chalk.rgb(52, 152, 219)(s)
    case 'partial-split': return chalk.rgb(241, 196, 15)(s)
    case 'muddled': return chalk.rgb(230, 126, 34)(s)
    case 'opaque-mass': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example vividnessColor('vivid-spectrum') returns colored string */
export function vividnessColor(s: string): string {
  switch (s) {
    case 'vivid-spectrum': return chalk.rgb(118, 255, 3).bold(s)
    case 'clear-colors': return chalk.rgb(46, 204, 113)(s)
    case 'proper-distinction': return chalk.rgb(52, 152, 219)(s)
    case 'faded': return chalk.rgb(241, 196, 15)(s)
    case 'washed-out': return chalk.rgb(230, 126, 34)(s)
    case 'gray': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example cutColor('brilliant-cut') returns colored string */
export function cutColor(s: string): string {
  switch (s) {
    case 'brilliant-cut': return chalk.rgb(118, 255, 3).bold(s)
    case 'fine-facets': return chalk.rgb(46, 204, 113)(s)
    case 'proper-angles': return chalk.rgb(52, 152, 219)(s)
    case 'rough-cut': return chalk.rgb(241, 196, 15)(s)
    case 'chipped': return chalk.rgb(230, 126, 34)(s)
    case 'uncut': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example clarityColor('flawless-crystal') returns colored string */
export function clarityColor(s: string): string {
  switch (s) {
    case 'flawless-crystal': return chalk.rgb(118, 255, 3).bold(s)
    case 'clear-glass': return chalk.rgb(46, 204, 113)(s)
    case 'proper-transparency': return chalk.rgb(52, 152, 219)(s)
    case 'slight-haze': return chalk.rgb(241, 196, 15)(s)
    case 'cloudy': return chalk.rgb(230, 126, 34)(s)
    case 'opaque': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('perfect-prism') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'perfect-prism': return chalk.rgb(118, 255, 3).bold(c)
    case 'fine-crystal': return chalk.rgb(46, 204, 113)(c)
    case 'clear-glass': return chalk.rgb(52, 152, 219)(c)
    case 'cloudy-prism': return chalk.rgb(241, 196, 15)(c)
    case 'cracked-crystal': return chalk.rgb(230, 126, 34)(c)
    case 'shattered': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example opticianGradeColor('master-optician') returns colored string */
export function opticianGradeColor(g: string): string {
  switch (g) {
    case 'master-optician': return chalk.rgb(118, 255, 3).bold(g)
    case 'expert-lapidary': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-cutter': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'rock-tumbler': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCrystalPrismJson(result) returns JSON string */
export function formatCrystalPrismJson(result: CrystalPrismResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCrystalPrismTable(result, verbose) returns formatted string */
export function formatCrystalPrismTable(result: CrystalPrismResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Crystal Prism Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Spectrum:'))
  lines.push(`    Avg Refraction:       ${scoreColor(result.spectrum.avgRefraction)}`)
  lines.push(`    Avg Clarity:          ${scoreColor(result.spectrum.avgClarity)}`)
  lines.push(`    Avg Purity:           ${scoreColor(result.spectrum.avgPurity)}`)
  lines.push(`    Is Brilliant:         ${result.spectrum.isBrilliant ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Brilliance:   ${scoreColor(result.spectrum.overallBrilliance)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Arrays:             ${result.stats.totalArrays}`)
  lines.push(`    Avg Refraction:           ${scoreColor(result.stats.avgRefraction)}`)
  lines.push(`    Avg Spectrum Analysis:    ${scoreColor(result.stats.avgSpectrumAnalysis)}`)
  lines.push(`    Avg Light Decomposition:  ${scoreColor(result.stats.avgLightDecomposition)}`)
  lines.push(`    Avg Color Clarity:        ${scoreColor(result.stats.avgColorClarity)}`)
  lines.push(`    Avg Facet Quality:        ${scoreColor(result.stats.avgFacetQuality)}`)
  lines.push(`    Avg Optical Purity:       ${scoreColor(result.stats.avgOpticalPurity)}`)
  lines.push(`    Optician Grade:           ${opticianGradeColor(result.stats.opticianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Perfect Prism:      ${result.stats.perfectPrismCount}`)
  lines.push(`    Fine Crystal:       ${result.stats.fineCrystalCount}`)
  lines.push(`    Clear Glass:        ${result.stats.clearGlassCount}`)
  lines.push(`    Cloudy Prism:       ${result.stats.cloudyPrismCount}`)
  lines.push(`    Cracked Crystal:    ${result.stats.crackedCrystalCount}`)
  lines.push(`    Shattered:          ${result.stats.shatteredCount}`)
  lines.push('')

  if (result.stats.bestFacet) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Facet:        ${result.stats.bestFacet}`)
    lines.push(`    Best Refraction:   ${result.stats.bestRefraction}`)
    lines.push(`    Most Diverse:      ${result.stats.mostDiverse}`)
    lines.push(`    Clearest:          ${result.stats.clearest}`)
    lines.push(`    Most Distinct:     ${result.stats.mostDistinct}`)
    lines.push(`    Best Interface:    ${result.stats.bestInterface}`)
    lines.push('')
  }

  if (verbose && result.facets.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Facets:'))
    for (const f of result.facets) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Refraction: ${angleColor(f.refractive.angle)}(${f.refraction})  Spectrum: ${rangeColor(f.spectral.range)}(${f.spectrumAnalysis})  Decomposition: ${decompositionColor(f.decomposition.quality)}(${f.lightDecomposition})`)
      lines.push(`      Color: ${vividnessColor(f.colorful.vividness)}(${f.colorClarity})  Facet: ${cutColor(f.faceted.cut)}(${f.facetQuality})  Purity: ${clarityColor(f.pure.clarity)}(${f.opticalPurity})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F4A7}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
