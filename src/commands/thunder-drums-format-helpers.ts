import chalk from 'chalk'
import type { ThunderDrumsResult } from './thunder-drums-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(148, 0, 211)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example volumeColor('thunderous') returns colored string */
export function volumeColor(v: string): string {
  switch (v) {
    case 'thunderous': return chalk.rgb(148, 0, 211).bold(v)
    case 'powerful': return chalk.rgb(46, 204, 113)(v)
    case 'resonant': return chalk.rgb(155, 89, 182)(v)
    case 'audible': return chalk.rgb(52, 152, 219)(v)
    case 'faint': return chalk.rgb(241, 196, 15)(v)
    case 'silent': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example strikeColor('hammer-strike') returns colored string */
export function strikeColor(s: string): string {
  switch (s) {
    case 'hammer-strike': return chalk.rgb(148, 0, 211).bold(s)
    case 'heavy-beat': return chalk.rgb(46, 204, 113)(s)
    case 'solid-hit': return chalk.rgb(155, 89, 182)(s)
    case 'moderate-tap': return chalk.rgb(52, 152, 219)(s)
    case 'light-touch': return chalk.rgb(241, 196, 15)(s)
    case 'miss': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example echoColor('cathedral-echo') returns colored string */
export function echoColor(e: string): string {
  switch (e) {
    case 'cathedral-echo': return chalk.rgb(148, 0, 211).bold(e)
    case 'canyon-reverb': return chalk.rgb(46, 204, 113)(e)
    case 'hall-reverb': return chalk.rgb(155, 89, 182)(e)
    case 'room-echo': return chalk.rgb(52, 152, 219)(e)
    case 'closet-muffle': return chalk.rgb(241, 196, 15)(e)
    case 'dead-room': return chalk.rgb(231, 76, 60)(e)
    default: return e
  }
}

/** @example beatColor('perfect-timing') returns colored string */
export function beatColor(b: string): string {
  switch (b) {
    case 'perfect-timing': return chalk.rgb(148, 0, 211).bold(b)
    case 'syncopated-master': return chalk.rgb(46, 204, 113)(b)
    case 'steady-beat': return chalk.rgb(155, 89, 182)(b)
    case 'off-beat': return chalk.rgb(52, 152, 219)(b)
    case 'irregular': return chalk.rgb(241, 196, 15)(b)
    case 'arrhythmic': return chalk.rgb(231, 76, 60)(b)
    default: return b
  }
}

/** @example toneColor('deep-bass') returns colored string */
export function toneColor(t: string): string {
  switch (t) {
    case 'deep-bass': return chalk.rgb(148, 0, 211).bold(t)
    case 'rich-baritone': return chalk.rgb(46, 204, 113)(t)
    case 'warm-tenor': return chalk.rgb(155, 89, 182)(t)
    case 'clear-alto': return chalk.rgb(52, 152, 219)(t)
    case 'thin-soprano': return chalk.rgb(241, 196, 15)(t)
    case 'tinny': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example skillColor('master-drummer') returns colored string */
export function skillColor(s: string): string {
  switch (s) {
    case 'master-drummer': return chalk.rgb(148, 0, 211).bold(s)
    case 'virtuoso': return chalk.rgb(46, 204, 113)(s)
    case 'skilled-percussionist': return chalk.rgb(155, 89, 182)(s)
    case 'competent-player': return chalk.rgb(52, 152, 219)(s)
    case 'beginner': return chalk.rgb(241, 196, 15)(s)
    case 'tone-deaf': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example conditionColor('thunder-roll') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'thunder-roll': return chalk.rgb(148, 0, 211).bold(c)
    case 'powerful-beat': return chalk.rgb(46, 204, 113)(c)
    case 'steady-drum': return chalk.rgb(155, 89, 182)(c)
    case 'fading-rhythm': return chalk.rgb(52, 152, 219)(c)
    case 'muffled-beat': return chalk.rgb(241, 196, 15)(c)
    case 'silence': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example drummerGradeColor('thunder-god') returns colored string */
export function drummerGradeColor(g: string): string {
  switch (g) {
    case 'thunder-god': return chalk.rgb(148, 0, 211).bold(g)
    case 'master-percussionist': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-drummer': return chalk.rgb(155, 89, 182)(g)
    case 'competent-player': return chalk.rgb(52, 152, 219)(g)
    case 'beginner': return chalk.rgb(241, 196, 15)(g)
    case 'tone-deaf': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example circleTypeColor('grand-ceremony') returns colored string */
export function circleTypeColor(t: string): string {
  switch (t) {
    case 'grand-ceremony': return chalk.rgb(148, 0, 211).bold(t)
    case 'tribal-gathering': return chalk.rgb(46, 204, 113)(t)
    case 'drum-circle': return chalk.rgb(155, 89, 182)(t)
    case 'rehearsal': return chalk.rgb(52, 152, 219)(t)
    case 'practice-session': return chalk.rgb(241, 196, 15)(t)
    case 'empty-hall': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example circleConditionColor('earth-shaking') returns colored string */
export function circleConditionColor(c: string): string {
  switch (c) {
    case 'earth-shaking': return chalk.rgb(148, 0, 211).bold(c)
    case 'powerful-thunder': return chalk.rgb(46, 204, 113)(c)
    case 'rhythmic-ensemble': return chalk.rgb(155, 89, 182)(c)
    case 'scattered-beats': return chalk.rgb(52, 152, 219)(c)
    case 'fading-echoes': return chalk.rgb(241, 196, 15)(c)
    case 'silence': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatThunderDrumsJson(result) returns JSON string */
export function formatThunderDrumsJson(result: ThunderDrumsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatThunderDrumsTable(result, verbose) returns formatted string */
export function formatThunderDrumsTable(result: ThunderDrumsResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(148, 0, 211).bold('  Thunder Drums Analysis'))
  lines.push('')

  lines.push(chalk.rgb(148, 0, 211)('  Orchestra Overview:'))
  lines.push(`    Overall Thunder:    ${scoreColor(result.orchestra.overallThunder)}`)
  lines.push(`    Avg Sonic:          ${scoreColor(result.orchestra.avgSonic)}`)
  lines.push(`    Avg Rhythm:         ${scoreColor(result.orchestra.avgRhythm)}`)
  lines.push(`    Avg Quality:        ${scoreColor(result.orchestra.avgQuality)}`)
  lines.push(`    Is Powerful:        ${result.orchestra.isPowerful ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(148, 0, 211)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Circles:        ${result.stats.totalCircles}`)
  lines.push(`    Avg Sonic Presence:   ${scoreColor(result.stats.avgSonicPresence)}`)
  lines.push(`    Avg Impact Force:     ${scoreColor(result.stats.avgImpactForce)}`)
  lines.push(`    Avg Reverberation:    ${scoreColor(result.stats.avgReverberation)}`)
  lines.push(`    Avg Rhythm Power:     ${scoreColor(result.stats.avgRhythmPower)}`)
  lines.push(`    Avg Resonance Depth:  ${scoreColor(result.stats.avgResonanceDepth)}`)
  lines.push(`    Avg Drum Quality:     ${scoreColor(result.stats.avgDrumQuality)}`)
  lines.push(`    Drummer Grade:        ${drummerGradeColor(result.stats.drummerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(148, 0, 211)('  Condition Counts:'))
  lines.push(`    Thunder Roll:         ${result.stats.thunderRollCount}`)
  lines.push(`    Powerful Beat:        ${result.stats.powerfulBeatCount}`)
  lines.push(`    Steady Drum:          ${result.stats.steadyDrumCount}`)
  lines.push(`    Fading Rhythm:        ${result.stats.fadingRhythmCount}`)
  lines.push(`    Muffled Beat:         ${result.stats.muffledBeatCount}`)
  lines.push(`    Silence:              ${result.stats.silenceCount}`)
  lines.push('')

  if (result.stats.bestBeat) {
    lines.push(chalk.rgb(148, 0, 211)('  Highlights:'))
    lines.push(`    Best Beat:         ${result.stats.bestBeat}`)
    lines.push(`    Most Present:      ${result.stats.mostPresent}`)
    lines.push(`    Most Powerful:     ${result.stats.mostPowerful}`)
    lines.push(`    Most Influential:  ${result.stats.mostInfluential}`)
    lines.push(`    Best Timed:        ${result.stats.bestTimed}`)
    lines.push(`    Deepest:           ${result.stats.deepest}`)
    lines.push('')
  }

  if (verbose && result.beats.length > 0) {
    lines.push(chalk.rgb(148, 0, 211)('  Per-File Beats:'))
    for (const b of result.beats) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(b.file)}`)
      lines.push(`      Score: ${scoreColor(b.qualityScore)}  Condition: ${conditionColor(b.condition)}`)
      lines.push(`      Sonic: ${volumeColor(b.sonic.volume)}(${b.sonicPresence})  Impact: ${strikeColor(b.impact.strike)}(${b.impactForce})  Reverb: ${echoColor(b.reverberating.echo)}(${b.reverberation})`)
      lines.push(`      Rhythm: ${beatColor(b.rhythm.beat)}(${b.rhythmPower})  Resonance: ${toneColor(b.resonance.tone)}(${b.resonanceDepth})  Drumming: ${skillColor(b.drumming.skill)}(${b.drumQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(148, 0, 211)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(148, 0, 211)('\u26A1')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
