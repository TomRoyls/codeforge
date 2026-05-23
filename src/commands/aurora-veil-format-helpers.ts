import chalk from 'chalk'
import type { AuroraVeilResult } from './aurora-veil-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example beautyColor('transcendent') returns colored string */
export function beautyColor(b: string): string {
  switch (b) {
    case 'transcendent': return chalk.rgb(118, 255, 3).bold(b)
    case 'breathtaking': return chalk.rgb(46, 204, 113)(b)
    case 'beautiful': return chalk.rgb(52, 152, 219)(b)
    case 'pleasant': return chalk.rgb(241, 196, 15)(b)
    case 'ordinary': return chalk.rgb(230, 126, 34)(b)
    case 'uninspiring': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example fieldColor('perfect-alignment') returns colored string */
export function fieldColor(f: string): string {
  switch (f) {
    case 'perfect-alignment': return chalk.rgb(118, 255, 3).bold(f)
    case 'strong-field': return chalk.rgb(46, 204, 113)(f)
    case 'proper-alignment': return chalk.rgb(52, 152, 219)(f)
    case 'drifting': return chalk.rgb(241, 196, 15)(f)
    case 'misaligned': return chalk.rgb(230, 126, 34)(f)
    case 'chaotic': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example spectrumColor('full-spectrum') returns colored string */
export function spectrumColor(s: string): string {
  switch (s) {
    case 'full-spectrum': return chalk.rgb(118, 255, 3).bold(s)
    case 'rich-palette': return chalk.rgb(46, 204, 113)(s)
    case 'colorful': return chalk.rgb(52, 152, 219)(s)
    case 'adequate-colors': return chalk.rgb(241, 196, 15)(s)
    case 'monochrome': return chalk.rgb(230, 126, 34)(s)
    case 'colorless': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example focusColor('laser-focused') returns colored string */
export function focusColor(f: string): string {
  switch (f) {
    case 'laser-focused': return chalk.rgb(118, 255, 3).bold(f)
    case 'sharp-focus': return chalk.rgb(46, 204, 113)(f)
    case 'clear-purpose': return chalk.rgb(52, 152, 219)(f)
    case 'somewhat-scattered': return chalk.rgb(241, 196, 15)(f)
    case 'diffuse': return chalk.rgb(230, 126, 34)(f)
    case 'scattered': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example pressureColor('deep-atmosphere') returns colored string */
export function pressureColor(p: string): string {
  switch (p) {
    case 'deep-atmosphere': return chalk.rgb(118, 255, 3).bold(p)
    case 'rich-context': return chalk.rgb(46, 204, 113)(p)
    case 'proper-layering': return chalk.rgb(52, 152, 219)(p)
    case 'surface-level': return chalk.rgb(241, 196, 15)(p)
    case 'thin-air': return chalk.rgb(230, 126, 34)(p)
    case 'vacuum': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example radianceColor('brilliant-flow') returns colored string */
export function radianceColor(r: string): string {
  switch (r) {
    case 'brilliant-flow': return chalk.rgb(118, 255, 3).bold(r)
    case 'bright-stream': return chalk.rgb(46, 204, 113)(r)
    case 'clear-current': return chalk.rgb(52, 152, 219)(r)
    case 'murky-flow': return chalk.rgb(241, 196, 15)(r)
    case 'turbulent': return chalk.rgb(230, 126, 34)(r)
    case 'opaque': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example conditionColor('ethereal-veil') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'ethereal-veil': return chalk.rgb(118, 255, 3).bold(c)
    case 'dancing-lights': return chalk.rgb(46, 204, 113)(c)
    case 'steady-glow': return chalk.rgb(52, 152, 219)(c)
    case 'fading-aurora': return chalk.rgb(241, 196, 15)(c)
    case 'dim-light': return chalk.rgb(230, 126, 34)(c)
    case 'dark-sky': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example astronomerColor('aurora-master') returns colored string */
export function astronomerColor(g: string): string {
  switch (g) {
    case 'aurora-master': return chalk.rgb(118, 255, 3).bold(g)
    case 'expert-observer': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-watcher': return chalk.rgb(52, 152, 219)(g)
    case 'amateur-stargazer': return chalk.rgb(241, 196, 15)(g)
    case 'casual-viewer': return chalk.rgb(230, 126, 34)(g)
    case 'cloudy-night': return chalk.rgb(231, 76, 60)(g)
    default: return g
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
  lines.push(chalk.rgb(118, 255, 3).bold('  Aurora Veil Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Sky:'))
  lines.push(`    Avg Beauty:         ${scoreColor(result.sky.avgBeauty)}`)
  lines.push(`    Avg Clarity:        ${scoreColor(result.sky.avgClarity)}`)
  lines.push(`    Avg Flow:           ${scoreColor(result.sky.avgFlow)}`)
  lines.push(`    Is Ethereal:        ${result.sky.isEthereal ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Luminosity: ${scoreColor(result.sky.overallLuminosity)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Displays:           ${result.stats.totalDisplays}`)
  lines.push(`    Avg Ethereal Beauty:      ${scoreColor(result.stats.avgEtherealBeauty)}`)
  lines.push(`    Avg Magnetic Alignment:   ${scoreColor(result.stats.avgMagneticAlignment)}`)
  lines.push(`    Avg Spectral Richness:    ${scoreColor(result.stats.avgSpectralRichness)}`)
  lines.push(`    Avg Polar Clarity:        ${scoreColor(result.stats.avgPolarClarity)}`)
  lines.push(`    Avg Atmospheric Depth:    ${scoreColor(result.stats.avgAtmosphericDepth)}`)
  lines.push(`    Avg Luminous Flow:        ${scoreColor(result.stats.avgLuminousFlow)}`)
  lines.push(`    Astronomer Grade:         ${astronomerColor(result.stats.astronomerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Ethereal Veil:    ${result.stats.etherealVeilCount}`)
  lines.push(`    Dancing Lights:   ${result.stats.dancingLightsCount}`)
  lines.push(`    Steady Glow:      ${result.stats.steadyGlowCount}`)
  lines.push(`    Fading Aurora:    ${result.stats.fadingAuroraCount}`)
  lines.push(`    Dim Light:        ${result.stats.dimLightCount}`)
  lines.push(`    Dark Sky:         ${result.stats.darkSkyCount}`)
  lines.push('')

  if (result.stats.bestRibbon) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Ribbon:       ${result.stats.bestRibbon}`)
    lines.push(`    Most Beautiful:    ${result.stats.mostBeautiful}`)
    lines.push(`    Best Aligned:      ${result.stats.bestAligned}`)
    lines.push(`    Most Diverse:      ${result.stats.mostDiverse}`)
    lines.push(`    Most Focused:      ${result.stats.mostFocused}`)
    lines.push(`    Deepest:           ${result.stats.deepest}`)
    lines.push('')
  }

  if (verbose && result.ribbons.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Ribbons:'))
    for (const r of result.ribbons) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(r.file)}`)
      lines.push(`      Score: ${scoreColor(r.qualityScore)}  Condition: ${conditionColor(r.condition)}`)
      lines.push(`      Ethereal: ${beautyColor(r.ethereal.beauty)}(${r.etherealBeauty})  Magnetic: ${fieldColor(r.magnetic.field)}(${r.magneticAlignment})  Spectral: ${spectrumColor(r.spectral.spectrum)}(${r.spectralRichness})`)
      lines.push(`      Polar: ${focusColor(r.polar.focus)}(${r.polarClarity})  Atmospheric: ${pressureColor(r.atmospheric.pressure)}(${r.atmosphericDepth})  Luminous: ${radianceColor(r.luminous.radiance)}(${r.luminousFlow})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F30C}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
