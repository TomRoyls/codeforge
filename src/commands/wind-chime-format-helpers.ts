import chalk from 'chalk'
import type { WindChimeResult, ChimeTube, ChimeCluster, Symphony, WindChimeStats } from './wind-chime-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function toneColor(t: string): string {
  switch (t) {
    case 'C': return chalk.rgb(255, 215, 0)(t)
    case 'D': return chalk.rgb(255, 165, 0)(t)
    case 'E': return chalk.rgb(255, 255, 100)(t)
    case 'F': return chalk.green(t)
    case 'G': return chalk.blue(t)
    case 'A': return chalk.magenta(t)
    case 'B': return chalk.cyan(t)
    default: return chalk.dim(t)
  }
}

function toneQualityColor(q: string): string {
  switch (q) {
    case 'pure': return chalk.rgb(255, 215, 0)(q)
    case 'warm': return chalk.green(q)
    case 'bright': return chalk.blue(q)
    case 'dull': return chalk.yellow(q)
    case 'harsh': return chalk.rgb(255, 165, 0)(q)
    case 'dissonant': return chalk.red(q)
    default: return chalk.dim(q)
  }
}

function materialColor(m: string): string {
  switch (m) {
    case 'aluminum': return chalk.rgb(192, 192, 192)(m)
    case 'bamboo': return chalk.green(m)
    case 'glass': return chalk.cyan(m)
    case 'ceramic': return chalk.rgb(210, 180, 140)(m)
    case 'shell': return chalk.rgb(255, 228, 196)(m)
    case 'wood': return chalk.rgb(139, 90, 43)(m)
    case 'metal': return chalk.gray(m)
    default: return chalk.dim(m)
  }
}

function classificationColor(c: string): string {
  switch (c) {
    case 'soloist': return chalk.rgb(255, 215, 0)(c)
    case 'section-leader': return chalk.green(c)
    case 'ensemble': return chalk.blue(c)
    case 'accompaniment': return chalk.yellow(c)
    case 'rest': return chalk.gray(c)
    default: return chalk.dim(c)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'symphonic': return chalk.rgb(255, 215, 0)(h)
    case 'harmonious': return chalk.green(h)
    case 'pleasant': return chalk.blue(h)
    case 'tolerable': return chalk.yellow(h)
    case 'noisy': return chalk.rgb(255, 165, 0)(h)
    case 'cacophonous': return chalk.red(h)
    default: return chalk.dim(h)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'symphony': return chalk.rgb(255, 215, 0)(g)
    case 'orchestra': return chalk.green(g)
    case 'band': return chalk.blue(g)
    case 'jam-session': return chalk.yellow(g)
    case 'noise': return chalk.rgb(255, 165, 0)(g)
    case 'silence': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Tube Formatting ─────────────────────────────────────────────────────────

function formatTube(t: ChimeTube, verbose: boolean): string {
  const markers: string[] = []
  if (t.isBroken) markers.push(chalk.red('BK'))
  if (t.isSilent) markers.push(chalk.gray('SI'))
  if (t.isTuned) markers.push(chalk.green('TU'))
  if (t.toneQuality === 'pure') markers.push(chalk.rgb(255, 215, 0)('PR'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(t.file)} ${toneColor(t.note)} res:${scoreColor(t.resonance)} hrm:${scoreColor(t.harmony)} dis:${scoreColor(t.dissonance)} ${toneQualityColor(t.toneQuality)} ${materialColor(t.material)} ${classificationColor(t.classification)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    pitch:${t.pitch} sustain:${scoreColor(t.sustain)} amp:${scoreColor(t.amplitude)} freq:${scoreColor(t.frequency)} oct:${t.octave} strike:${scoreColor(t.strikeResponse)}`)
  details.push(`    harm:[f:${t.harmonicContent.fundamental}/2nd:${t.harmonicContent.secondHarmonic}/3rd:${t.harmonicContent.thirdHarmonic}/ov:${t.harmonicContent.overtones}] dia:${t.diameter} wall:${t.wallThickness}`)
  details.push(`    conn: res[${t.connections.resonatesWith.length}] dis[${t.connections.dissonantWith.length}] damp[${t.connections.dampensBy.length}] amp[${t.connections.amplifiesBy.length}]`)
  return details.join('\n')
}

// ─── Cluster Formatting ──────────────────────────────────────────────────────

function formatCluster(c: ChimeCluster, verbose: boolean): string {
  const line = `  ${chalk.bold(c.directory)} ${healthColor(c.health)} ${c.clusterType} tubes:${c.tubes.length} hrm:${scoreColor(c.overallHarmony)} res:${scoreColor(c.resonanceProfile)} ${c.chordQuality} ${c.windResponse}`

  if (!verbose) return line
  const details = [line]
  details.push(`    avgRes:${scoreColor(c.avgResonance)} avgHrm:${scoreColor(c.avgHarmony)} avgDis:${scoreColor(c.avgDissonance)} amp:${c.totalAmplitude} tone:${c.dominantTone} mat:${c.dominantMaterial}`)
  details.push(`    tuned:${c.tunedTubes} broken:${c.brokenTubes} silent:${c.silentTubes} musical:${c.isMusical} dissonance:${c.hasDissonance}`)
  if (c.dissonancePoints.length > 0) {
    details.push(`    dissonance: ${c.dissonancePoints.join(', ')}`)
  }
  return details.join('\n')
}

// ─── Symphony Formatting ─────────────────────────────────────────────────────

function formatSymphony(sym: Symphony): string {
  return [
    `  Key: ${toneColor(sym.dominantKey)} | Tempo: ${chalk.blue(sym.tempo)} | Dynamics: ${chalk.magenta(sym.dynamics)}`,
    `  Resonance: ${scoreColor(sym.avgResonance)} | Harmony: ${scoreColor(sym.avgHarmony)} | Dissonance: ${scoreColor(sym.avgDissonance)} | Amplitude: ${chalk.bold(String(sym.totalAmplitude))}`,
  ].join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: WindChimeStats): string {
  return [
    `  Files: ${stats.totalFiles} | Clusters: ${stats.totalClusters} | Pitch: ${stats.avgPitch} | Resonance: ${scoreColor(stats.avgResonance)} | Sustain: ${scoreColor(stats.avgSustain)}`,
    `  Harmony: ${scoreColor(stats.avgHarmony)} | Dissonance: ${scoreColor(stats.avgDissonance)} | Pure: ${chalk.rgb(255, 215, 0)(String(stats.pureTones))} | Harsh: ${chalk.red(String(stats.dissonantTones))}`,
    `  Soloists: ${chalk.rgb(255, 215, 0)(String(stats.soloists))} | Ensemble: ${chalk.blue(String(stats.ensemble))} | Tuned: ${chalk.green(String(stats.tunedTubes))} | Broken: ${chalk.red(String(stats.brokenTubes))} | Silent: ${chalk.gray(String(stats.silentTubes))}`,
    `  Musical: ${stats.isMusical ? chalk.green('yes') : chalk.red('no')} | Symphonic: ${stats.symphonicClusters} | Cacophonous: ${stats.cacophonousClusters}`,
    `  Tone: ${toneColor(stats.dominantTone)} | Material: ${materialColor(stats.dominantMaterial)} | Grade: ${gradeColor(stats.harmonyGrade)}`,
    `  Best: ${chalk.green(stats.bestTube)} | Worst: ${chalk.red(stats.worstTube)} | Resonant: ${chalk.blue(stats.mostResonant)} | Dissonant: ${chalk.rgb(255, 165, 0)(stats.mostDissonant)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format wind chime result as a table
 * @example
 * formatWindChimeTable(result, false) // string
 */
export function formatWindChimeTable(result: WindChimeResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔔 Wind Chime - Code Harmony Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🎵 Chime Tubes'))
  if (result.tubes.length === 0) {
    lines.push(chalk.dim('  No tubes detected.'))
  } else {
    const display = verbose ? result.tubes : result.tubes.slice(0, 15)
    for (const t of display) {
      lines.push(formatTube(t, verbose))
    }
    if (!verbose && result.tubes.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.tubes.length - 15} more`))
    }
  }
  lines.push('')

  if (result.clusters.length > 0) {
    lines.push(chalk.bold('🎼 Chime Clusters'))
    for (const c of result.clusters) {
      lines.push(formatCluster(c, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🎼 Symphony'))
  lines.push(formatSymphony(result.symphony))
  lines.push('')

  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format wind chime result as JSON
 * @example
 * formatWindChimeJson(result) // string
 */
export function formatWindChimeJson(result: WindChimeResult): string {
  return JSON.stringify(result, null, 2)
}
