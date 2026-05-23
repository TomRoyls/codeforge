import chalk from 'chalk'
import type { PhantomMirrorResult } from './phantom-mirror-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(155, 89, 182)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example clarityColor('perfect-reflection') returns colored string */
export function clarityColor(c: string): string {
  switch (c) {
    case 'perfect-reflection': return chalk.rgb(155, 89, 182).bold(c)
    case 'clear-mirror': return chalk.rgb(46, 204, 113)(c)
    case 'slightly-blurred': return chalk.rgb(52, 152, 219)(c)
    case 'distorted': return chalk.rgb(241, 196, 15)(c)
    case 'foggy': return chalk.rgb(230, 126, 34)(c)
    case 'blank-surface': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example visibilityColor('luminous-trail') returns colored string */
export function visibilityColor(v: string): string {
  switch (v) {
    case 'luminous-trail': return chalk.rgb(155, 89, 182).bold(v)
    case 'visible-footprints': return chalk.rgb(46, 204, 113)(v)
    case 'fading-traces': return chalk.rgb(52, 152, 219)(v)
    case 'dim-signals': return chalk.rgb(241, 196, 15)(v)
    case 'barely-visible': return chalk.rgb(230, 126, 34)(v)
    case 'invisible': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example accuracyColor('sharp-shadow') returns colored string */
export function accuracyColor(a: string): string {
  switch (a) {
    case 'sharp-shadow': return chalk.rgb(155, 89, 182).bold(a)
    case 'clear-silhouette': return chalk.rgb(46, 204, 113)(a)
    case 'recognizable': return chalk.rgb(52, 152, 219)(a)
    case 'blurred-outline': return chalk.rgb(241, 196, 15)(a)
    case 'faint-shadow': return chalk.rgb(230, 126, 34)(a)
    case 'no-shadow': return chalk.rgb(231, 76, 60)(a)
    default: return a
  }
}

/** @example resonanceColor('crystal-echo') returns colored string */
export function resonanceColor(r: string): string {
  switch (r) {
    case 'crystal-echo': return chalk.rgb(155, 89, 182).bold(r)
    case 'clear-reverberation': return chalk.rgb(46, 204, 113)(r)
    case 'audible-feedback': return chalk.rgb(52, 152, 219)(r)
    case 'muffled-echo': return chalk.rgb(241, 196, 15)(r)
    case 'faint-whisper': return chalk.rgb(230, 126, 34)(r)
    case 'silence': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example phantomVisibilityColor('fully-visible') returns colored string */
export function phantomVisibilityColor(v: string): string {
  switch (v) {
    case 'fully-visible': return chalk.rgb(155, 89, 182).bold(v)
    case 'clearly-seen': return chalk.rgb(46, 204, 113)(v)
    case 'partially-visible': return chalk.rgb(52, 152, 219)(v)
    case 'translucent': return chalk.rgb(241, 196, 15)(v)
    case 'barely-there': return chalk.rgb(230, 126, 34)(v)
    case 'invisible': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example truthColor('perfect-fidelity') returns colored string */
export function truthColor(t: string): string {
  switch (t) {
    case 'perfect-fidelity': return chalk.rgb(155, 89, 182).bold(t)
    case 'high-accuracy': return chalk.rgb(46, 204, 113)(t)
    case 'mostly-accurate': return chalk.rgb(52, 152, 219)(t)
    case 'slightly-off': return chalk.rgb(241, 196, 15)(t)
    case 'misleading': return chalk.rgb(230, 126, 34)(t)
    case 'fiction': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example conditionColor('lucid-mirror') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'lucid-mirror': return chalk.rgb(155, 89, 182).bold(c)
    case 'clear-reflection': return chalk.rgb(46, 204, 113)(c)
    case 'ghostly-image': return chalk.rgb(52, 152, 219)(c)
    case 'distorted-phantom': return chalk.rgb(241, 196, 15)(c)
    case 'shadowy-trace': return chalk.rgb(230, 126, 34)(c)
    case 'void': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example gradeColor('spirit-medium') returns colored string */
export function gradeColor(g: string): string {
  switch (g) {
    case 'spirit-medium': return chalk.rgb(155, 89, 182).bold(g)
    case 'mirror-master': return chalk.rgb(46, 204, 113)(g)
    case 'ghost-whisperer': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice-seer': return chalk.rgb(241, 196, 15)(g)
    case 'blind-fortune-teller': return chalk.rgb(230, 126, 34)(g)
    case 'skeptical-muggle': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatPhantomMirrorJson(result) returns JSON string */
export function formatPhantomMirrorJson(result: PhantomMirrorResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatPhantomMirrorTable(result, verbose) returns formatted string */
export function formatPhantomMirrorTable(result: PhantomMirrorResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Phantom Mirror Analysis'))
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182)('  Mansion Overview:'))
  lines.push(`    Overall Clarity:    ${scoreColor(result.mansion.overallClarity)}`)
  lines.push(`    Avg Reflection:     ${scoreColor(result.mansion.avgReflection)}`)
  lines.push(`    Avg Echo Clarity:   ${scoreColor(result.mansion.avgEchoClarity)}`)
  lines.push(`    Avg Fidelity:       ${scoreColor(result.mansion.avgFidelity)}`)
  lines.push(`    Is Clear:           ${result.mansion.isClear ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Galleries:        ${result.stats.totalGalleries}`)
  lines.push(`    Avg Reflection:         ${scoreColor(result.stats.avgReflection)}`)
  lines.push(`    Avg Ghost Trace:        ${scoreColor(result.stats.avgGhostTrace)}`)
  lines.push(`    Avg Shadow Quality:     ${scoreColor(result.stats.avgShadowQuality)}`)
  lines.push(`    Avg Echo Clarity:       ${scoreColor(result.stats.avgEchoClarity)}`)
  lines.push(`    Avg Phantom Depth:      ${scoreColor(result.stats.avgPhantomDepth)}`)
  lines.push(`    Avg Mirror Fidelity:    ${scoreColor(result.stats.avgMirrorFidelity)}`)
  lines.push(`    Medium Grade:           ${gradeColor(result.stats.mediumGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182)('  Condition Counts:'))
  lines.push(`    Lucid Mirror:        ${result.stats.lucidMirrorCount}`)
  lines.push(`    Clear Reflection:    ${result.stats.clearReflectionCount}`)
  lines.push(`    Ghostly Image:       ${result.stats.ghostlyImageCount}`)
  lines.push(`    Distorted Phantom:   ${result.stats.distortedPhantomCount}`)
  lines.push(`    Shadowy Trace:       ${result.stats.shadowyTraceCount}`)
  lines.push(`    Void:                ${result.stats.voidCount}`)
  lines.push('')

  if (result.stats.bestReflection) {
    lines.push(chalk.rgb(155, 89, 182)('  Highlights:'))
    lines.push(`    Best Reflection:    ${result.stats.bestReflection}`)
    lines.push(`    Most Self-Aware:    ${result.stats.mostSelfAware}`)
    lines.push(`    Most Traceable:     ${result.stats.mostTraceable}`)
    lines.push(`    Most Predictable:   ${result.stats.mostPredictable}`)
    lines.push(`    Most Debuggable:    ${result.stats.mostDebuggable}`)
    lines.push(`    Most Transparent:   ${result.stats.mostTransparent}`)
    lines.push('')
  }

  if (verbose && result.reflections.length > 0) {
    lines.push(chalk.rgb(155, 89, 182)('  Per-File Reflections:'))
    for (const r of result.reflections) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(r.file)}`)
      lines.push(`      Score: ${scoreColor(r.qualityScore)}  Condition: ${conditionColor(r.condition)}`)
      lines.push(`      Reflective: ${clarityColor(r.reflective.clarity)}(${r.reflection})  Ghost: ${visibilityColor(r.ghost.visibility)}(${r.ghostTrace})  Shadow: ${accuracyColor(r.shadow.accuracy)}(${r.shadowQuality})`)
      lines.push(`      Echo: ${resonanceColor(r.echo.resonance)}(${r.echoClarity})  Phantom: ${phantomVisibilityColor(r.phantom.visibility)}(${r.phantomDepth})  Fidelity: ${truthColor(r.fidelity.truth)}(${r.mirrorFidelity})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(155, 89, 182)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u{1FA9E}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
