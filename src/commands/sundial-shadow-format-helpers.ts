import chalk from 'chalk'
import type { SundialShadowResult, ShadowTrace, ShadowCluster, SundialTimeline, SundialShadowStats } from './sundial-shadow-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function sunColor(s: string): string {
  switch (s) {
    case 'dawn': return chalk.rgb(255, 183, 77)(s)
    case 'morning': return chalk.rgb(255, 213, 79)(s)
    case 'noon': return chalk.rgb(255, 235, 59)(s)
    case 'afternoon': return chalk.rgb(255, 193, 7)(s)
    case 'evening': return chalk.rgb(255, 152, 0)(s)
    case 'dusk': return chalk.rgb(233, 30, 99)(s)
    case 'night': return chalk.rgb(63, 81, 181)(s)
    default: return chalk.dim(s)
  }
}

function lifecycleColor(l: string): string {
  switch (l) {
    case 'embryonic': return chalk.rgb(156, 204, 101)(l)
    case 'infant': return chalk.green(l)
    case 'growing': return chalk.blue(l)
    case 'mature': return chalk.rgb(255, 215, 0)(l)
    case 'aging': return chalk.yellow(l)
    case 'legacy': return chalk.rgb(255, 165, 0)(l)
    case 'ancient': return chalk.red(l)
    case 'fossil': return chalk.gray(l)
    default: return chalk.dim(l)
  }
}

function epochColor(e: string): string {
  switch (e) {
    case 'pioneer': return chalk.rgb(139, 69, 19)(e)
    case 'foundation': return chalk.rgb(210, 180, 140)(e)
    case 'expansion': return chalk.blue(e)
    case 'consolidation': return chalk.green(e)
    case 'optimization': return chalk.cyan(e)
    case 'maintenance': return chalk.yellow(e)
    case 'legacy': return chalk.red(e)
    default: return chalk.dim(e)
  }
}

function classificationColor(c: string): string {
  switch (c) {
    case 'sunlit': return chalk.rgb(255, 215, 0)(c)
    case 'daylight': return chalk.green(c)
    case 'shadowed': return chalk.blue(c)
    case 'twilight': return chalk.magenta(c)
    case 'midnight': return chalk.gray(c)
    default: return chalk.dim(c)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'thriving': return chalk.rgb(255, 215, 0)(c)
    case 'vibrant': return chalk.green(c)
    case 'maturing': return chalk.blue(c)
    case 'aging': return chalk.yellow(c)
    case 'declining': return chalk.rgb(255, 165, 0)(c)
    case 'decaying': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'golden-age': return chalk.rgb(255, 215, 0)(g)
    case 'renaissance': return chalk.green(g)
    case 'industrial': return chalk.blue(g)
    case 'modern': return chalk.cyan(g)
    case 'post-modern': return chalk.yellow(g)
    case 'dark-age': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Trace Formatting ────────────────────────────────────────────────────────

function formatTrace(t: ShadowTrace, verbose: boolean): string {
  const markers: string[] = []
  if (t.isDawn) markers.push(chalk.rgb(255, 183, 77)('DA'))
  if (t.isNoon) markers.push(chalk.rgb(255, 235, 59)('NO'))
  if (t.isDusk) markers.push(chalk.rgb(233, 30, 99)('DU'))
  if (t.isNight) markers.push(chalk.rgb(63, 81, 181)('NI'))
  if (t.decay.present) markers.push(chalk.red('DC'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(t.file)} ${sunColor(t.sunPosition)} mat:${scoreColor(t.maturity)} len:${scoreColor(t.shadowLength)} clr:${scoreColor(t.shadowClarity)} ${lifecycleColor(t.lifecycle)} ${classificationColor(t.classification)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    depth:${t.temporalDepth} angle:${t.shadowAngle} epoch:${epochColor(t.epoch)} chrono:${t.chronotype} growth:${t.growth.direction}(${t.growth.rate})`)
  details.push(`    caster: size:${t.shadowCaster.size} h:${t.shadowCaster.height} op:${t.shadowCaster.opacity} traces: leg:${t.traces.legacyPatterns} mod:${t.traces.modernPatterns} exp:${t.traces.experimentalPatterns} dep:${t.traces.deprecatedPatterns} ref:${t.traces.refactoringTraces}`)
  if (t.decay.indicators.length > 0) {
    details.push(`    decay[${t.decay.level}]: ${t.decay.indicators.join(', ')}`)
  }
  return details.join('\n')
}

// ─── Cluster Formatting ──────────────────────────────────────────────────────

function formatCluster(c: ShadowCluster, verbose: boolean): string {
  const line = `  ${chalk.bold(c.directory)} ${conditionColor(c.condition)} ${sunColor(c.timeOfDay)} traces:${c.traces.length} mat:${scoreColor(c.avgMaturity)} hrich:${scoreColor(c.historicalRichness)} evo:${scoreColor(c.evolutionaryHealth)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    shadow:${scoreColor(c.avgShadowLength)} depth:${scoreColor(c.avgTemporalDepth)} lc:${c.dominantLifecycle} epoch:${epochColor(c.dominantEpoch)} sun:${sunColor(c.dominantSunPosition)}`)
  details.push(`    dawn:${c.dawnFiles} noon:${c.noonFiles} dusk:${c.duskFiles} night:${c.nightFiles} leg:${c.totalLegacyPatterns} mod:${c.totalModernPatterns} dep:${c.totalDeprecatedPatterns}`)
  details.push(`    growth:${c.growthDirection} decay:${c.hasDecay}`)
  return details.join('\n')
}

// ─── Timeline Formatting ─────────────────────────────────────────────────────

function formatTimeline(tl: SundialTimeline): string {
  return [
    `  Phase: ${sunColor(tl.dominantPhase)} | Dawn: ${chalk.rgb(255, 183, 77)(String(tl.totalDawn))} | Morning: ${chalk.rgb(255, 213, 79)(String(tl.totalMorning))} | Noon: ${chalk.rgb(255, 235, 59)(String(tl.totalNoon))} | Afternoon: ${chalk.rgb(255, 193, 7)(String(tl.totalAfternoon))} | Evening: ${chalk.rgb(255, 152, 0)(String(tl.totalEvening))} | Night: ${chalk.rgb(63, 81, 181)(String(tl.totalNight))}`,
    `  Maturity: ${scoreColor(tl.avgMaturity)} | Depth: ${scoreColor(tl.avgTemporalDepth)} | Growth: ${scoreColor(tl.growthRate)} | Decay: ${chalk.red(String(tl.decayRate))}`,
  ].join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: SundialShadowStats): string {
  return [
    `  Files: ${stats.totalFiles} | Clusters: ${stats.totalClusters} | Shadow: ${scoreColor(stats.avgShadowLength)} | Clarity: ${scoreColor(stats.avgShadowClarity)} | Depth: ${scoreColor(stats.avgTemporalDepth)} | Maturity: ${scoreColor(stats.avgMaturity)}`,
    `  Sunlit: ${chalk.rgb(255, 215, 0)(String(stats.sunlitFiles))} | Daylight: ${chalk.green(String(stats.daylightFiles))} | Shadowed: ${chalk.blue(String(stats.shadowedFiles))} | Twilight: ${chalk.magenta(String(stats.twilightFiles))} | Midnight: ${chalk.gray(String(stats.midnightFiles))}`,
    `  Dawn: ${chalk.rgb(255, 183, 77)(String(stats.dawnFiles))} | Noon: ${chalk.rgb(255, 235, 59)(String(stats.noonFiles))} | Dusk: ${chalk.rgb(233, 30, 99)(String(stats.duskFiles))} | Night: ${chalk.rgb(63, 81, 181)(String(stats.nightFiles))}`,
    `  Legacy: ${chalk.red(String(stats.totalLegacyPatterns))} | Modern: ${chalk.green(String(stats.totalModernPatterns))} | Experimental: ${chalk.cyan(String(stats.totalExperimentalPatterns))} | Deprecated: ${chalk.yellow(String(stats.totalDeprecatedPatterns))} | Refactor: ${chalk.blue(String(stats.totalRefactoringTraces))}`,
    `  Expanding: ${chalk.green(String(stats.expandingFiles))} | Stable: ${chalk.blue(String(stats.stableFiles))} | Contracting: ${chalk.red(String(stats.contractingFiles))} | Healthy: ${chalk.rgb(255, 215, 0)(String(stats.healthyGrowth))}`,
    `  Health: ${scoreColor(stats.overallEvolutionaryHealth)} | Grade: ${gradeColor(stats.epochGrade)}`,
    `  Best: ${chalk.green(stats.bestPreserved)} | Evolved: ${chalk.blue(stats.mostEvolved)} | Fresh: ${chalk.cyan(stats.freshestCode)} | Legacy: ${chalk.red(stats.mostLegacy)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format sundial shadow result as a table
 * @example
 * formatSundialShadowTable(result, false) // string
 */
export function formatSundialShadowTable(result: SundialShadowResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🕐 Sundial Shadow - Code Evolution Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🌑 Shadow Traces'))
  if (result.traces.length === 0) {
    lines.push(chalk.dim('  No traces detected.'))
  } else {
    const display = verbose ? result.traces : result.traces.slice(0, 15)
    for (const t of display) {
      lines.push(formatTrace(t, verbose))
    }
    if (!verbose && result.traces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.traces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.clusters.length > 0) {
    lines.push(chalk.bold('🏙️ Shadow Clusters'))
    for (const c of result.clusters) {
      lines.push(formatCluster(c, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('⏳ Timeline'))
  lines.push(formatTimeline(result.timeline))
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
 * Format sundial shadow result as JSON
 * @example
 * formatSundialShadowJson(result) // string
 */
export function formatSundialShadowJson(result: SundialShadowResult): string {
  return JSON.stringify(result, null, 2)
}
