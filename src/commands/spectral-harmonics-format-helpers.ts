import chalk from 'chalk'
import type { SpectralHarmonicsResult } from './spectral-harmonics-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(0, 206, 209)(String(score))
  if (score >= 60) return chalk.rgb(72, 209, 204)(String(score))
  if (score >= 40) return chalk.rgb(32, 178, 170)(String(score))
  return chalk.rgb(0, 139, 139)(String(score))
}

/** @example gradeColor('pure-tone') returns colored string */
export function gradeColor(s: string): string {
  switch (s) {
    case 'pure-tone': return chalk.rgb(0, 206, 209).bold(s)
    case 'clear-harmonic': return chalk.rgb(72, 209, 204)(s)
    case 'clean-note': return chalk.rgb(32, 178, 170)(s)
    case 'muffled-sound': return chalk.rgb(0, 139, 139)(s)
    case 'distorted-noise': return chalk.rgb(47, 79, 79)(s)
    case 'cacophony': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example chordColor('perfect-chord') returns colored string */
export function chordColor(s: string): string {
  switch (s) {
    case 'perfect-chord': return chalk.rgb(0, 206, 209).bold(s)
    case 'major-triad': return chalk.rgb(72, 209, 204)(s)
    case 'minor-triad': return chalk.rgb(32, 178, 170)(s)
    case 'power-chord': return chalk.rgb(0, 139, 139)(s)
    case 'broken-chord': return chalk.rgb(47, 79, 79)(s)
    case 'discord': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example seriesColor('full-harmonic-series') returns colored string */
export function seriesColor(s: string): string {
  switch (s) {
    case 'full-harmonic-series': return chalk.rgb(0, 206, 209).bold(s)
    case 'rich-overtones': return chalk.rgb(72, 209, 204)(s)
    case 'proper-overtones': return chalk.rgb(32, 178, 170)(s)
    case 'thin-tone': return chalk.rgb(0, 139, 139)(s)
    case 'flat-note': return chalk.rgb(47, 79, 79)(s)
    case 'dead-tone': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example shapeColor('perfect-sine') returns colored string */
export function shapeColor(s: string): string {
  switch (s) {
    case 'perfect-sine': return chalk.rgb(0, 206, 209).bold(s)
    case 'clean-wave': return chalk.rgb(72, 209, 204)(s)
    case 'proper-waveform': return chalk.rgb(32, 178, 170)(s)
    case 'distorted-wave': return chalk.rgb(0, 139, 139)(s)
    case 'noisy-signal': return chalk.rgb(47, 79, 79)(s)
    case 'static': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example spectrumColor('full-spectrum') returns colored string */
export function spectrumColor(s: string): string {
  switch (s) {
    case 'full-spectrum': return chalk.rgb(0, 206, 209).bold(s)
    case 'wide-band': return chalk.rgb(72, 209, 204)(s)
    case 'proper-band': return chalk.rgb(32, 178, 170)(s)
    case 'narrow-band': return chalk.rgb(0, 139, 139)(s)
    case 'single-tone': return chalk.rgb(47, 79, 79)(s)
    case 'white-noise': return chalk.rgb(60, 60, 60)(s)
    default: return s
  }
}

/** @example conditionColor('pure-resonance') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'pure-resonance': return chalk.rgb(0, 206, 209).bold(c)
    case 'harmonic-balance': return chalk.rgb(72, 209, 204)(c)
    case 'clean-tone': return chalk.rgb(32, 178, 170)(c)
    case 'muffled-sound': return chalk.rgb(0, 139, 139)(c)
    case 'distorted': return chalk.rgb(47, 79, 79)(c)
    case 'noise-floor': return chalk.rgb(60, 60, 60)(c)
    default: return c
  }
}

/** @example conductorGradeColor('maestro') returns colored string */
export function conductorGradeColor(g: string): string {
  switch (g) {
    case 'maestro': return chalk.rgb(0, 206, 209).bold(g)
    case 'virtuoso': return chalk.rgb(72, 209, 204)(g)
    case 'concert-master': return chalk.rgb(32, 178, 170)(g)
    case 'section-player': return chalk.rgb(0, 139, 139)(g)
    case 'student-musician': return chalk.rgb(47, 79, 79)(g)
    case 'tone-deaf': return chalk.rgb(60, 60, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSpectralHarmonicsJson(result) returns JSON string */
export function formatSpectralHarmonicsJson(result: SpectralHarmonicsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSpectralHarmonicsTable(result, verbose) returns formatted string */
export function formatSpectralHarmonicsTable(result: SpectralHarmonicsResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(0, 206, 209).bold('  Spectral Harmonics Analysis'))
  lines.push('')

  lines.push(chalk.rgb(0, 206, 209)('  Spectrum:'))
  lines.push(`    Avg Purity:            ${scoreColor(result.spectrum.avgPurity)}`)
  lines.push(`    Avg Resonance:         ${scoreColor(result.spectrum.avgResonance)}`)
  lines.push(`    Avg Clarity:           ${scoreColor(result.spectrum.avgClarity)}`)
  lines.push(`    Is Harmonious:         ${result.spectrum.isHarmonious ? chalk.rgb(0, 206, 209)('Yes') : chalk.rgb(60, 60, 60)('No')}`)
  lines.push(`    Overall Harmonicity:   ${scoreColor(result.spectrum.overallHarmonicity)}`)
  lines.push('')

  lines.push(chalk.rgb(0, 206, 209)('  Statistics:'))
  lines.push(`    Total Files:                    ${result.stats.totalFiles}`)
  lines.push(`    Total Chambers:                 ${result.stats.totalChambers}`)
  lines.push(`    Avg Spectral Purity:            ${scoreColor(result.stats.avgSpectralPurity)}`)
  lines.push(`    Avg Harmonic Resonance:         ${scoreColor(result.stats.avgHarmonicResonance)}`)
  lines.push(`    Avg Overtone Richness:          ${scoreColor(result.stats.avgOvertoneRichness)}`)
  lines.push(`    Avg Waveform Clarity:           ${scoreColor(result.stats.avgWaveformClarity)}`)
  lines.push(`    Avg Frequency Distribution:     ${scoreColor(result.stats.avgFrequencyDistribution)}`)
  lines.push(`    Conductor Grade:                ${conductorGradeColor(result.stats.conductorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(0, 206, 209)('  Condition Counts:'))
  lines.push(`    Pure Resonance:     ${result.stats.pureResonanceCount}`)
  lines.push(`    Harmonic Balance:   ${result.stats.harmonicBalanceCount}`)
  lines.push(`    Clean Tone:         ${result.stats.cleanToneCount}`)
  lines.push(`    Muffled Sound:      ${result.stats.muffledSoundCount}`)
  lines.push(`    Distorted:          ${result.stats.distortedCount}`)
  lines.push(`    Noise Floor:        ${result.stats.noiseFloorCount}`)
  lines.push('')

  if (result.stats.bestWave) {
    lines.push(chalk.rgb(0, 206, 209)('  Highlights:'))
    lines.push(`    Best Wave:          ${result.stats.bestWave}`)
    lines.push(`    Purest:             ${result.stats.purest}`)
    lines.push(`    Most Resonant:      ${result.stats.mostResonant}`)
    lines.push(`    Richest:            ${result.stats.richest}`)
    lines.push(`    Clearest:           ${result.stats.clearest}`)
    lines.push('')
  }

  if (verbose && result.waves.length > 0) {
    lines.push(chalk.rgb(0, 206, 209)('  Per-File Waves:'))
    for (const w of result.waves) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(w.file)}`)
      lines.push(`      Score: ${scoreColor(w.qualityScore)}  Condition: ${conditionColor(w.condition)}`)
      lines.push(`      Resonating: ${gradeColor(w.resonating.grade)}(${w.spectralPurity})  Harmonic: ${chordColor(w.harmonic.chord)}(${w.harmonicResonance})  Overtone: ${seriesColor(w.overtone.series)}(${w.overtoneRichness})`)
      lines.push(`      Waveform: ${shapeColor(w.waveform.shape)}(${w.waveformClarity})  Frequency: ${spectrumColor(w.frequency.spectrum)}(${w.frequencyDistribution})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(0, 206, 209)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(0, 206, 209)('\u{1F3B5}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
