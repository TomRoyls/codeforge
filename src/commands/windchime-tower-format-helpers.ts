import chalk from 'chalk'

import type { WindchimeTowerResult } from './windchime-tower-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('celestial-chime') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'celestial-chime': return chalk.rgb(255, 215, 0).bold(condition)
    case 'masterwork-bell': return chalk.rgb(46, 204, 113)(condition)
    case 'tuned-chime': return chalk.rgb(52, 152, 219)(condition)
    case 'untuned-pipe': return chalk.rgb(241, 196, 15)(condition)
    case 'rattling-tube': return chalk.rgb(230, 126, 34)(condition)
    case 'silence': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-tuner') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-tuner': return chalk.rgb(255, 215, 0).bold(grade)
    case 'harmonist': return chalk.rgb(46, 204, 113)(grade)
    case 'musician': return chalk.rgb(155, 89, 182)(grade)
    case 'tuner': return chalk.rgb(52, 152, 219)(grade)
    case 'listener': return chalk.rgb(241, 196, 15)(grade)
    case 'tone-deaf': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example pitchColor('perfect-pitch') returns colored string */
export function pitchColor(pitch: string): string {
  switch (pitch) {
    case 'perfect-pitch': return chalk.rgb(255, 215, 0).bold(pitch)
    case 'well-tuned': return chalk.rgb(46, 204, 113)(pitch)
    case 'harmonious': return chalk.rgb(155, 89, 182)(pitch)
    case 'slightly-off': return chalk.rgb(52, 152, 219)(pitch)
    case 'dissonant': return chalk.rgb(241, 196, 15)(pitch)
    case 'cacophony': return chalk.rgb(231, 76, 60)(pitch)
    default: return pitch
  }
}

/** @example sustainColor('singing-bowl') returns colored string */
export function sustainColor(sustain: string): string {
  switch (sustain) {
    case 'singing-bowl': return chalk.rgb(255, 215, 0).bold(sustain)
    case 'long-sustain': return chalk.rgb(46, 204, 113)(sustain)
    case 'medium-sustain': return chalk.rgb(155, 89, 182)(sustain)
    case 'short-ring': return chalk.rgb(52, 152, 219)(sustain)
    case 'dull-thud': return chalk.rgb(241, 196, 15)(sustain)
    case 'dead': return chalk.rgb(231, 76, 60)(sustain)
    default: return sustain
  }
}

/** @example sensitivityColor('gossamer') returns colored string */
export function sensitivityColor(sensitivity: string): string {
  switch (sensitivity) {
    case 'gossamer': return chalk.rgb(255, 215, 0).bold(sensitivity)
    case 'highly-sensitive': return chalk.rgb(46, 204, 113)(sensitivity)
    case 'responsive': return chalk.rgb(155, 89, 182)(sensitivity)
    case 'moderate': return chalk.rgb(52, 152, 219)(sensitivity)
    case 'sluggish': return chalk.rgb(241, 196, 15)(sensitivity)
    case 'unresponsive': return chalk.rgb(231, 76, 60)(sensitivity)
    default: return sensitivity
  }
}

/** @example chordColor('major-chord') returns colored string */
export function chordColor(chord: string): string {
  switch (chord) {
    case 'major-chord': return chalk.rgb(255, 215, 0).bold(chord)
    case 'perfect-harmony': return chalk.rgb(46, 204, 113)(chord)
    case 'consonance': return chalk.rgb(155, 89, 182)(chord)
    case 'neutral': return chalk.rgb(52, 152, 219)(chord)
    case 'tension': return chalk.rgb(241, 196, 15)(chord)
    case 'discord': return chalk.rgb(231, 76, 60)(chord)
    default: return chord
  }
}

/** @example fidelityColor('high-fidelity') returns colored string */
export function fidelityColor(fidelity: string): string {
  switch (fidelity) {
    case 'high-fidelity': return chalk.rgb(255, 215, 0).bold(fidelity)
    case 'clear': return chalk.rgb(46, 204, 113)(fidelity)
    case 'acceptable': return chalk.rgb(155, 89, 182)(fidelity)
    case 'muddy': return chalk.rgb(52, 152, 219)(fidelity)
    case 'garbled': return chalk.rgb(241, 196, 15)(fidelity)
    case 'static': return chalk.rgb(231, 76, 60)(fidelity)
    default: return fidelity
  }
}

/** @example strengthColor('titanium-chime') returns colored string */
export function strengthColor(strength: string): string {
  switch (strength) {
    case 'titanium-chime': return chalk.rgb(255, 215, 0).bold(strength)
    case 'bronze-bell': return chalk.rgb(46, 204, 113)(strength)
    case 'brass-tube': return chalk.rgb(155, 89, 182)(strength)
    case 'aluminum-rod': return chalk.rgb(52, 152, 219)(strength)
    case 'bamboo': return chalk.rgb(241, 196, 15)(strength)
    case 'glass-shard': return chalk.rgb(231, 76, 60)(strength)
    default: return strength
  }
}

/** @example levelTypeColor('cathedral-tower') returns colored string */
export function levelTypeColor(type: string): string {
  switch (type) {
    case 'cathedral-tower': return chalk.rgb(255, 215, 0).bold(type)
    case 'bell-tower': return chalk.rgb(46, 204, 113)(type)
    case 'garden-pagoda': return chalk.rgb(155, 89, 182)(type)
    case 'porch-chime': return chalk.rgb(52, 152, 219)(type)
    case 'window-hanging': return chalk.rgb(241, 196, 15)(type)
    case 'silent': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example levelConditionColor('symphony-hall') returns colored string */
export function levelConditionColor(condition: string): string {
  switch (condition) {
    case 'symphony-hall': return chalk.rgb(255, 215, 0).bold(condition)
    case 'harmonious-tower': return chalk.rgb(46, 204, 113)(condition)
    case 'pleasant-garden': return chalk.rgb(155, 89, 182)(condition)
    case 'clattering': return chalk.rgb(52, 152, 219)(condition)
    case 'silence': return chalk.rgb(241, 196, 15)(condition)
    case 'broken': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatWindchimeTowerJson(result) returns JSON string */
export function formatWindchimeTowerJson(result: WindchimeTowerResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatWindchimeTowerTable(result, verbose) returns formatted string */
export function formatWindchimeTowerTable(result: WindchimeTowerResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(176, 224, 230).bold('  Windchime Tower Analysis'))
  lines.push('')

  lines.push(chalk.rgb(176, 224, 230)('  Tower Overview:'))
  lines.push(`    Overall Harmony:      ${scoreColor(result.tower.overallHarmony)}`)
  lines.push(`    Avg Tone:             ${scoreColor(result.tower.avgTone)}`)
  lines.push(`    Avg Harmony:          ${scoreColor(result.tower.avgHarmony)}`)
  lines.push(`    Avg Resilience:       ${scoreColor(result.tower.avgResilience)}`)
  lines.push(`    Is Harmonious:        ${result.tower.isHarmonious ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(176, 224, 230)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Levels:             ${result.stats.totalLevels}`)
  lines.push(`    Avg Tonal Quality:        ${scoreColor(result.stats.avgTonalQuality)}`)
  lines.push(`    Avg Resonance:            ${scoreColor(result.stats.avgResonance)}`)
  lines.push(`    Avg Wind Responsiveness:  ${scoreColor(result.stats.avgWindResponsiveness)}`)
  lines.push(`    Avg Structural Harmony:   ${scoreColor(result.stats.avgStructuralHarmony)}`)
  lines.push(`    Avg Acoustic Clarity:     ${scoreColor(result.stats.avgAcousticClarity)}`)
  lines.push(`    Avg Chime Resilience:     ${scoreColor(result.stats.avgChimeResilience)}`)
  lines.push(`    Tuner Grade:              ${gradeColor(result.stats.tunerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(176, 224, 230)('  Condition Counts:'))
  lines.push(`    Celestial Chime:  ${result.stats.celestialChimeCount}`)
  lines.push(`    Masterwork Bell:  ${result.stats.masterworkBellCount}`)
  lines.push(`    Tuned Chime:      ${result.stats.tunedChimeCount}`)
  lines.push(`    Untuned Pipe:     ${result.stats.untunedPipeCount}`)
  lines.push(`    Rattling Tube:    ${result.stats.rattlingTubeCount}`)
  lines.push(`    Silence:          ${result.stats.silenceCount}`)
  lines.push('')

  if (result.stats.bestElement) {
    lines.push(chalk.rgb(176, 224, 230)('  Highlights:'))
    lines.push(`    Best Element:       ${result.stats.bestElement}`)
    lines.push(`    Best Tone:          ${result.stats.bestTone}`)
    lines.push(`    Most Resonant:      ${result.stats.mostResonant}`)
    lines.push(`    Most Responsive:    ${result.stats.mostResponsive}`)
    lines.push(`    Most Harmonious:    ${result.stats.mostHarmonious}`)
    lines.push(`    Clearest:           ${result.stats.clearest}`)
    lines.push('')
  }

  if (verbose && result.elements.length > 0) {
    lines.push(chalk.rgb(176, 224, 230)('  Per-File Details:'))
    for (const e of result.elements) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(e.file)}`)
      lines.push(`      Score: ${scoreColor(e.qualityScore)}  Condition: ${conditionColor(e.condition)}`)
      lines.push(`      Tone: ${pitchColor(e.tone.pitch)}(${e.tonalQuality})  Resonance: ${sustainColor(e.resonanceData.sustain)}(${e.resonance})  Wind: ${sensitivityColor(e.wind.sensitivity)}(${e.windResponsiveness})`)
      lines.push(`      Harmony: ${chordColor(e.harmony.chord)}(${e.structuralHarmony})  Acoustic: ${fidelityColor(e.acoustic.fidelity)}(${e.acousticClarity})  Resilience: ${strengthColor(e.resilience.strength)}(${e.chimeResilience})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(176, 224, 230)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(176, 224, 230)('\u{1F390}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
