import chalk from 'chalk'
import type { SilverBellResult } from './silver-bell-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(192, 192, 192)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example ringColor('thunderous-peal') returns colored string */
export function ringColor(r: string): string {
  switch (r) {
    case 'thunderous-peal': return chalk.rgb(192, 192, 192).bold(r)
    case 'clear-chime': return chalk.rgb(46, 204, 113)(r)
    case 'pleasant-ring': return chalk.rgb(52, 152, 219)(r)
    case 'dull-thud': return chalk.rgb(241, 196, 15)(r)
    case 'muffled-clank': return chalk.rgb(230, 126, 34)(r)
    case 'silent': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example toneColor('crystal-clear') returns colored string */
export function toneColor(t: string): string {
  switch (t) {
    case 'crystal-clear': return chalk.rgb(192, 192, 192).bold(t)
    case 'bright-tone': return chalk.rgb(46, 204, 113)(t)
    case 'clear-note': return chalk.rgb(52, 152, 219)(t)
    case 'slightly-cloudy': return chalk.rgb(241, 196, 15)(t)
    case 'muddy': return chalk.rgb(230, 126, 34)(t)
    case 'opaque': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example strikeColor('perfect-strike') returns colored string */
export function strikeColor(s: string): string {
  switch (s) {
    case 'perfect-strike': return chalk.rgb(192, 192, 192).bold(s)
    case 'clean-ring': return chalk.rgb(46, 204, 113)(s)
    case 'proper-tone': return chalk.rgb(52, 152, 219)(s)
    case 'off-key': return chalk.rgb(241, 196, 15)(s)
    case 'dissonant': return chalk.rgb(230, 126, 34)(s)
    case 'cacophony': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example purityColor('pure-tone') returns colored string */
export function purityColor(p: string): string {
  switch (p) {
    case 'pure-tone': return chalk.rgb(192, 192, 192).bold(p)
    case 'harmonic': return chalk.rgb(46, 204, 113)(p)
    case 'clean-note': return chalk.rgb(52, 152, 219)(p)
    case 'slightly-off': return chalk.rgb(241, 196, 15)(p)
    case 'dissonant': return chalk.rgb(230, 126, 34)(p)
    case 'atonal': return chalk.rgb(231, 76, 60)(p)
    default: return p
  }
}

/** @example durationColor('eternal-ring') returns colored string */
export function durationColor(d: string): string {
  switch (d) {
    case 'eternal-ring': return chalk.rgb(192, 192, 192).bold(d)
    case 'long-sustain': return chalk.rgb(46, 204, 113)(d)
    case 'proper-decay': return chalk.rgb(52, 152, 219)(d)
    case 'short-ring': return chalk.rgb(241, 196, 15)(d)
    case 'quick-fade': return chalk.rgb(230, 126, 34)(d)
    case 'immediate-silence': return chalk.rgb(231, 76, 60)(d)
    default: return d
  }
}

/** @example harmonyColor('perfect-harmony') returns colored string */
export function harmonyColor(h: string): string {
  switch (h) {
    case 'perfect-harmony': return chalk.rgb(192, 192, 192).bold(h)
    case 'well-balanced': return chalk.rgb(46, 204, 113)(h)
    case 'proper-mix': return chalk.rgb(52, 152, 219)(h)
    case 'uneven': return chalk.rgb(241, 196, 15)(h)
    case 'unbalanced': return chalk.rgb(230, 126, 34)(h)
    case 'chaotic': return chalk.rgb(231, 76, 60)(h)
    default: return h
  }
}

/** @example conditionColor('silver-chime') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'silver-chime': return chalk.rgb(192, 192, 192).bold(c)
    case 'clear-bell': return chalk.rgb(46, 204, 113)(c)
    case 'pleasant-tone': return chalk.rgb(52, 152, 219)(c)
    case 'dull-ring': return chalk.rgb(241, 196, 15)(c)
    case 'rattle': return chalk.rgb(230, 126, 34)(c)
    case 'cracked-bell': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('master-bellmaker') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'master-bellmaker': return chalk.rgb(192, 192, 192).bold(g)
    case 'expert-ringer': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-campanologist': return chalk.rgb(52, 152, 219)(g)
    case 'bell-ringer': return chalk.rgb(241, 196, 15)(g)
    case 'novice-chimer': return chalk.rgb(230, 126, 34)(g)
    case 'tone-deaf': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSilverBellJson(result) returns JSON string */
export function formatSilverBellJson(result: SilverBellResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSilverBellTable(result, verbose) returns formatted string */
export function formatSilverBellTable(result: SilverBellResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(192, 192, 192).bold('  Silver Bell Analysis'))
  lines.push('')

  lines.push(chalk.rgb(192, 192, 192)('  Cathedral:'))
  lines.push(`    Overall Resonance:   ${scoreColor(result.cathedral.overallResonance)}`)
  lines.push(`    Avg Resonance:       ${scoreColor(result.cathedral.avgResonance)}`)
  lines.push(`    Avg Clarity:         ${scoreColor(result.cathedral.avgClarity)}`)
  lines.push(`    Avg Quality:         ${scoreColor(result.cathedral.avgQuality)}`)
  lines.push(`    Is Resonant:         ${result.cathedral.isResonant ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(192, 192, 192)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Choirs:           ${result.stats.totalChoirs}`)
  lines.push(`    Avg Resonance:          ${scoreColor(result.stats.avgResonance)}`)
  lines.push(`    Avg Clarity:            ${scoreColor(result.stats.avgClarity)}`)
  lines.push(`    Avg Ring Quality:       ${scoreColor(result.stats.avgRingQuality)}`)
  lines.push(`    Avg Tone Purity:        ${scoreColor(result.stats.avgTonePurity)}`)
  lines.push(`    Avg Sustain:            ${scoreColor(result.stats.avgSustain)}`)
  lines.push(`    Avg Volume Balance:     ${scoreColor(result.stats.avgVolumeBalance)}`)
  lines.push(`    Bellmaster Grade:       ${gradeColor(result.stats.bellmasterGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(192, 192, 192)('  Condition Counts:'))
  lines.push(`    Silver Chime:      ${result.stats.silverChimeCount}`)
  lines.push(`    Clear Bell:        ${result.stats.clearBellCount}`)
  lines.push(`    Pleasant Tone:     ${result.stats.pleasantToneCount}`)
  lines.push(`    Dull Ring:         ${result.stats.dullRingCount}`)
  lines.push(`    Rattle:            ${result.stats.rattleCount}`)
  lines.push(`    Cracked Bell:      ${result.stats.crackedBellCount}`)
  lines.push('')

  if (result.stats.bestTone) {
    lines.push(chalk.rgb(192, 192, 192)('  Highlights:'))
    lines.push(`    Best Tone:         ${result.stats.bestTone}`)
    lines.push(`    Most Resonant:     ${result.stats.mostResonant}`)
    lines.push(`    Clearest:          ${result.stats.clearest}`)
    lines.push(`    Best Quality:      ${result.stats.bestQuality}`)
    lines.push(`    Purest:            ${result.stats.purest}`)
    lines.push(`    Most Lasting:      ${result.stats.mostLasting}`)
    lines.push('')
  }

  if (verbose && result.tones.length > 0) {
    lines.push(chalk.rgb(192, 192, 192)('  Per-File Tones:'))
    for (const t of result.tones) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(t.file)}`)
      lines.push(`      Score: ${scoreColor(t.qualityScore)}  Condition: ${conditionColor(t.condition)}`)
      lines.push(`      Resonant: ${ringColor(t.resonant.ring)}(${t.resonance})  Clear: ${toneColor(t.clear.tone)}(${t.clarity})  Ringing: ${strikeColor(t.ringing.strike)}(${t.ringQuality})`)
      lines.push(`      Pure: ${purityColor(t.pure.tone)}(${t.tonePurity})  Sustain: ${durationColor(t.sustaining.duration)}(${t.sustain})  Balanced: ${harmonyColor(t.balanced.harmony)}(${t.volumeBalance})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(192, 192, 192)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(192, 192, 192)('\u{1F514}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
