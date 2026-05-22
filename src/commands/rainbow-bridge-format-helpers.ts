import chalk from 'chalk'

import type { RainbowBridgeResult } from './rainbow-bridge-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('divine-rainbow') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'divine-rainbow': return chalk.rgb(255, 215, 0).bold(condition)
    case 'vibrant-arc': return chalk.rgb(46, 204, 113)(condition)
    case 'painted-bridge': return chalk.rgb(52, 152, 219)(condition)
    case 'faded-arch': return chalk.rgb(241, 196, 15)(condition)
    case 'misty-outline': return chalk.rgb(230, 126, 34)(condition)
    case 'no-bridge': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('bridge-architect') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'bridge-architect': return chalk.rgb(255, 215, 0).bold(grade)
    case 'rainbow-weaver': return chalk.rgb(46, 204, 113)(grade)
    case 'span-builder': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(52, 152, 219)(grade)
    case 'observer': return chalk.rgb(241, 196, 15)(grade)
    case 'colorblind': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example spanColor('bifrost') returns colored string */
export function spanColor(span: string): string {
  switch (span) {
    case 'bifrost': return chalk.rgb(255, 215, 0).bold(span)
    case 'golden-gate': return chalk.rgb(46, 204, 113)(span)
    case 'stone-arch': return chalk.rgb(155, 89, 182)(span)
    case 'rope-bridge': return chalk.rgb(52, 152, 219)(span)
    case 'plank': return chalk.rgb(241, 196, 15)(span)
    case 'broken': return chalk.rgb(231, 76, 60)(span)
    default: return span
  }
}

/** @example spectrumColor('full-spectrum') returns colored string */
export function spectrumColor(colors: string): string {
  switch (colors) {
    case 'full-spectrum': return chalk.rgb(255, 215, 0).bold(colors)
    case 'rich-palette': return chalk.rgb(46, 204, 113)(colors)
    case 'primary': return chalk.rgb(155, 89, 182)(colors)
    case 'monochrome': return chalk.rgb(52, 152, 219)(colors)
    case 'faded': return chalk.rgb(241, 196, 15)(colors)
    case 'invisible': return chalk.rgb(231, 76, 60)(colors)
    default: return colors
  }
}

/** @example eleganceColor('ballet') returns colored string */
export function eleganceColor(elegance: string): string {
  switch (elegance) {
    case 'ballet': return chalk.rgb(255, 215, 0).bold(elegance)
    case 'waltz': return chalk.rgb(46, 204, 113)(elegance)
    case 'smooth': return chalk.rgb(155, 89, 182)(elegance)
    case 'stiff': return chalk.rgb(52, 152, 219)(elegance)
    case 'clumsy': return chalk.rgb(241, 196, 15)(elegance)
    case 'falling': return chalk.rgb(231, 76, 60)(elegance)
    default: return elegance
  }
}

/** @example atmosphereColor('crystal-clear') returns colored string */
export function atmosphereColor(condition: string): string {
  switch (condition) {
    case 'crystal-clear': return chalk.rgb(255, 215, 0).bold(condition)
    case 'clear-sky': return chalk.rgb(46, 204, 113)(condition)
    case 'light-haze': return chalk.rgb(155, 89, 182)(condition)
    case 'cloudy': return chalk.rgb(52, 152, 219)(condition)
    case 'foggy': return chalk.rgb(241, 196, 15)(condition)
    case 'opaque': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example visionClarityColor('panoramic') returns colored string */
export function visionClarityColor(clarity: string): string {
  switch (clarity) {
    case 'panoramic': return chalk.rgb(255, 215, 0).bold(clarity)
    case 'eagle-eye': return chalk.rgb(46, 204, 113)(clarity)
    case 'clear-vision': return chalk.rgb(155, 89, 182)(clarity)
    case 'near-sighted': return chalk.rgb(52, 152, 219)(clarity)
    case 'tunnel-vision': return chalk.rgb(241, 196, 15)(clarity)
    case 'blind': return chalk.rgb(231, 76, 60)(clarity)
    default: return clarity
  }
}

/** @example brightnessColor('blinding') returns colored string */
export function brightnessColor(brightness: string): string {
  switch (brightness) {
    case 'blinding': return chalk.rgb(255, 215, 0).bold(brightness)
    case 'bright': return chalk.rgb(46, 204, 113)(brightness)
    case 'luminous': return chalk.rgb(155, 89, 182)(brightness)
    case 'dim': return chalk.rgb(52, 152, 219)(brightness)
    case 'dark': return chalk.rgb(241, 196, 15)(brightness)
    case 'void': return chalk.rgb(231, 76, 60)(brightness)
    default: return brightness
  }
}

/** @example arcTypeColor('grand-rainbow') returns colored string */
export function arcTypeColor(type: string): string {
  switch (type) {
    case 'grand-rainbow': return chalk.rgb(255, 215, 0).bold(type)
    case 'double-rainbow': return chalk.rgb(46, 204, 113)(type)
    case 'single-arc': return chalk.rgb(155, 89, 182)(type)
    case 'sun-dog': return chalk.rgb(52, 152, 219)(type)
    case 'mist-arc': return chalk.rgb(241, 196, 15)(type)
    case 'no-light': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example arcConditionColor('celestial-bridge') returns colored string */
export function arcConditionColor(condition: string): string {
  switch (condition) {
    case 'celestial-bridge': return chalk.rgb(255, 215, 0).bold(condition)
    case 'vibrant-arc': return chalk.rgb(46, 204, 113)(condition)
    case 'steady-span': return chalk.rgb(155, 89, 182)(condition)
    case 'fading-light': return chalk.rgb(52, 152, 219)(condition)
    case 'dim-outline': return chalk.rgb(241, 196, 15)(condition)
    case 'darkness': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatRainbowBridgeJson(result) returns JSON string */
export function formatRainbowBridgeJson(result: RainbowBridgeResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatRainbowBridgeTable(result, verbose) returns formatted string */
export function formatRainbowBridgeTable(result: RainbowBridgeResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 105, 180).bold('  Rainbow Bridge Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Sky Overview:'))
  lines.push(`    Overall Connection:  ${scoreColor(result.sky.overallConnection)}`)
  lines.push(`    Avg Strength:        ${scoreColor(result.sky.avgStrength)}`)
  lines.push(`    Avg Spectrum:        ${scoreColor(result.sky.avgSpectrum)}`)
  lines.push(`    Avg Vision:          ${scoreColor(result.sky.avgVision)}`)
  lines.push(`    Is Connected:        ${result.sky.isConnected ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Arcs:           ${result.stats.totalArcs}`)
  lines.push(`    Avg Bridge Strength:  ${scoreColor(result.stats.avgBridgeStrength)}`)
  lines.push(`    Avg Spectrum:         ${scoreColor(result.stats.avgSpectrumBreadth)}`)
  lines.push(`    Avg Transition:       ${scoreColor(result.stats.avgTransitionGrace)}`)
  lines.push(`    Avg Atmosphere:       ${scoreColor(result.stats.avgAtmosphericClarity)}`)
  lines.push(`    Avg Vision:           ${scoreColor(result.stats.avgVisionQuality)}`)
  lines.push(`    Avg Luminance:        ${scoreColor(result.stats.avgLuminance)}`)
  lines.push(`    Architect Grade:      ${gradeColor(result.stats.architectGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Divine Rainbow:  ${result.stats.divineRainbowCount}`)
  lines.push(`    Vibrant Arc:     ${result.stats.vibrantArcCount}`)
  lines.push(`    Painted Bridge:  ${result.stats.paintedBridgeCount}`)
  lines.push(`    Faded Arch:      ${result.stats.fadedArchCount}`)
  lines.push(`    Misty Outline:   ${result.stats.mistyOutlineCount}`)
  lines.push(`    No Bridge:       ${result.stats.noBridgeCount}`)
  lines.push('')

  if (result.stats.bestSpan) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Span:       ${result.stats.bestSpan}`)
    lines.push(`    Strongest:       ${result.stats.strongest}`)
    lines.push(`    Most Diverse:    ${result.stats.mostDiverse}`)
    lines.push(`    Most Graceful:   ${result.stats.mostGraceful}`)
    lines.push(`    Clearest:        ${result.stats.clearest}`)
    lines.push(`    Brightest:       ${result.stats.brightest}`)
    lines.push('')
  }

  if (verbose && result.spans.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const s of result.spans) {
      lines.push(`    ${chalk.rgb(255, 105, 180)(s.file)}`)
      lines.push(`      Score: ${scoreColor(s.qualityScore)}  Condition: ${conditionColor(s.condition)}`)
      lines.push(`      Bridge: ${spanColor(s.bridge.span)}(${s.bridgeStrength})  Spectrum: ${spectrumColor(s.spectrum.colors)}(${s.spectrumBreadth})  Transition: ${eleganceColor(s.transition.elegance)}(${s.transitionGrace})`)
      lines.push(`      Atmosphere: ${atmosphereColor(s.atmosphere.condition)}(${s.atmosphericClarity})  Vision: ${visionClarityColor(s.vision.clarity)}(${s.visionQuality})  Luminance: ${brightnessColor(s.luminanceMeasure.brightness)}(${s.luminance})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 105, 180)('\u{1F308}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
