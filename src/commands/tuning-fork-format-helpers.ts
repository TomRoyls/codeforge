import chalk from 'chalk'
import type { TuningForkResult, TuningResult, ResonanceChamber } from './tuning-fork-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function pitchColor(p: string): string {
  switch (p) {
    case 'in-tune': return chalk.green(p)
    case 'sharp': return chalk.rgb(255, 165, 0)(p)
    case 'flat': return chalk.blue(p)
    case 'atonal': return chalk.red(p)
    default: return chalk.dim(p)
  }
}

function materialColor(m: string): string {
  switch (m) {
    case 'steel': return chalk.rgb(192, 192, 192)(m)
    case 'aluminum': return chalk.rgb(211, 211, 211)(m)
    case 'quartz': return chalk.rgb(255, 250, 240)(m)
    case 'wood': return chalk.rgb(139, 90, 43)(m)
    case 'plastic': return chalk.yellow(m)
    case 'rubber': return chalk.red(m)
    default: return chalk.dim(m)
  }
}

function toneColor(t: string): string {
  switch (t) {
    case 'pure': return chalk.green(t)
    case 'warm': return chalk.rgb(255, 165, 0)(t)
    case 'bright': return chalk.yellow(t)
    case 'dull': return chalk.dim(t)
    case 'harsh': return chalk.rgb(255, 69, 0)(t)
    case 'dissonant': return chalk.red(t)
    case 'noise': return chalk.rgb(139, 0, 0)(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'perfect-pitch': return chalk.rgb(255, 215, 0)(c)
    case 'well-tuned': return chalk.green(c)
    case 'slightly-off': return chalk.yellow(c)
    case 'out-of-tune': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    case 'silent': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function acousticColor(a: string): string {
  switch (a) {
    case 'concert-hall': return chalk.rgb(255, 215, 0)(a)
    case 'studio': return chalk.green(a)
    case 'living-room': return chalk.blue(a)
    case 'garage': return chalk.yellow(a)
    case 'warehouse': return chalk.rgb(255, 165, 0)(a)
    case 'anechoic': return chalk.red(a)
    default: return chalk.dim(a)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'virtuoso': return chalk.rgb(255, 215, 0)(g)
    case 'concert-master': return chalk.green(g)
    case 'musician': return chalk.blue(g)
    case 'student': return chalk.yellow(g)
    case 'tone-deaf': return chalk.rgb(255, 165, 0)(g)
    case 'deaf': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Result Formatting ───────────────────────────────────────────────────────

function formatResult(r: TuningResult, verbose: boolean): string {
  const beatMarker = r.beats.present ? chalk.red('BEAT') : ' '
  const line = ` ${beatMarker} ${chalk.bold(r.file)} ${pitchColor(r.pitch)} ${conditionColor(r.condition)} ${materialColor(r.forkMaterial)} ${toneColor(r.toneQuality)} freq:${scoreColor(r.frequency)}Hz note:${chalk.cyan(r.note)}${r.octave} q:${scoreColor(r.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    fundamental:${scoreColor(r.fundamentalFrequency)} resonance:${scoreColor(r.resonanceQuality)} tuning:${scoreColor(r.tuningAccuracy)} harmonic:${scoreColor(r.harmonicContent)} damping:${scoreColor(r.damping)}`)
  details.push(`    amp:${scoreColor(r.vibrations.amplitude)} freq:${scoreColor(r.vibrations.frequency)} sustain:${scoreColor(r.vibrations.sustain)} decay:${scoreColor(r.vibrations.decay)}`)
  if (r.beats.present) {
    details.push(`    beats: ${r.beats.beatFrequency}Hz sources: ${r.beats.beatSources.join(', ')}`)
  }
  return details.join('\n')
}

// ─── Chamber Formatting ──────────────────────────────────────────────────────

function formatChamber(c: ResonanceChamber, verbose: boolean): string {
  const line = `  ${chalk.bold(c.directory)} ${acousticColor(c.acousticHealth)} resonance:${scoreColor(c.chamberResonance)} tuning:${c.chamberTuning} in:${c.inTuneCount} out:${c.outOfTuneCount} beats:${c.beatCount}`

  if (!verbose) return line
  const details = [line]
  details.push(`    key:${c.dominantKey} note:${c.dominantNote} harmonious:${c.isHarmonious ? chalk.green('yes') : chalk.red('no')} cacophonous:${c.isCacophonous ? chalk.red('yes') : chalk.green('no')}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format tuning fork result as a table
 * @example
 * formatTuningForkTable(result, false) // string
 */
export function formatTuningForkTable(result: TuningForkResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🎵 Tuning Fork - Code Resonance Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔊 Tuning Results'))
  if (result.results.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.results : result.results.slice(0, 15)
    for (const r of display) {
      lines.push(formatResult(r, verbose))
    }
    if (!verbose && result.results.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.results.length - 15} more`))
    }
  }
  lines.push('')

  if (result.chambers.length > 0) {
    lines.push(chalk.bold('🏛️ Resonance Chambers'))
    for (const c of result.chambers) {
      lines.push(formatChamber(c, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🎼 Concert'))
  const concert = result.concert
  lines.push(`  Resonance: ${scoreColor(concert.avgResonance)} | Tuning: ${scoreColor(concert.avgTuningAccuracy)} | Note: ${chalk.cyan(concert.dominantNote)} | Orchestral: ${concert.isOrchestral ? chalk.green('yes') : chalk.red('no')} | Beats: ${concert.totalBeats} | Dissonant: ${concert.isDissonant ? chalk.red('yes') : chalk.green('no')}`)
  lines.push('')

  lines.push(chalk.bold('📊 Statistics'))
  const s = result.stats
  lines.push(`  Grade: ${gradeColor(s.maestroGrade)} | Resonance: ${scoreColor(s.overallResonance)} | Perfect: ${chalk.rgb(255, 215, 0)(String(s.perfectPitchCount))} | Well: ${chalk.green(String(s.wellTunedCount))} | Out: ${chalk.yellow(String(s.outOfTuneCount))} | Broken: ${chalk.red(String(s.brokenCount))} | Silent: ${chalk.dim(String(s.silentCount))}`)
  lines.push(`  Best: ${chalk.green(s.bestTuned)} | Worst: ${chalk.red(s.worstTuned)} | Resonant: ${chalk.blue(s.mostResonant)} | Dissonant: ${chalk.rgb(255, 69, 0)(s.mostDissonant)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format tuning fork result as JSON
 * @example
 * formatTuningForkJson(result) // string
 */
export function formatTuningForkJson(result: TuningForkResult): string {
  return JSON.stringify(result, null, 2)
}
