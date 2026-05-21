import chalk from 'chalk'
import type { LoomResult, Thread, Fabric, LoomStats } from './loom-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function materialColor(m: string): string {
  switch (m) {
    case 'silk': return chalk.rgb(255, 215, 0)(m)
    case 'cotton': return chalk.white(m)
    case 'linen': return chalk.rgb(210, 180, 140)(m)
    case 'wool': return chalk.rgb(139, 90, 43)(m)
    case 'synthetic': return chalk.cyan(m)
    case 'metallic': return chalk.gray(m)
    case 'rag': return chalk.red(m)
    default: return chalk.dim(m)
  }
}

function threadTypeColor(t: string): string {
  switch (t) {
    case 'warp': return chalk.blue(t)
    case 'weft': return chalk.green(t)
    case 'structural': return chalk.rgb(255, 215, 0)(t)
    case 'decorative': return chalk.magenta(t)
    case 'fill': return chalk.gray(t)
    case 'selvedge': return chalk.dim(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'pristine': return chalk.rgb(255, 215, 0)(c)
    case 'excellent': return chalk.green(c)
    case 'good': return chalk.blue(c)
    case 'fair': return chalk.yellow(c)
    case 'worn': return chalk.rgb(255, 165, 0)(c)
    case 'threadbare': return chalk.rgb(255, 100, 100)(c)
    case 'torn': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'A': return chalk.green(g)
    case 'B': return chalk.blue(g)
    case 'C': return chalk.yellow(g)
    case 'D': return chalk.rgb(255, 165, 0)(g)
    case 'F': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function classificationColor(c: string): string {
  switch (c) {
    case 'premium': return chalk.rgb(255, 215, 0)(c)
    case 'fine': return chalk.green(c)
    case 'standard': return chalk.blue(c)
    case 'economy': return chalk.yellow(c)
    case 'reject': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function weaveColor(w: string): string {
  switch (w) {
    case 'jacquard': return chalk.rgb(255, 215, 0)(w)
    case 'twill': return chalk.green(w)
    case 'satin': return chalk.blue(w)
    case 'basket': return chalk.yellow(w)
    case 'leno': return chalk.cyan(w)
    case 'plain': return chalk.white(w)
    case 'knit': return chalk.magenta(w)
    default: return chalk.dim(w)
  }
}

function weaverGradeColor(g: string): string {
  switch (g) {
    case 'master-weaver': return chalk.rgb(255, 215, 0)(g)
    case 'journeyman': return chalk.green(g)
    case 'apprentice': return chalk.blue(g)
    case 'novice': return chalk.yellow(g)
    case 'clumsy': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Thread Formatting ───────────────────────────────────────────────────────

function formatThread(t: Thread, verbose: boolean): string {
  const markers: string[] = []
  if (t.isFrayed) markers.push(chalk.yellow('FR'))
  if (t.isBroken) markers.push(chalk.red('BK'))
  if (t.isKnot) markers.push(chalk.rgb(255, 165, 0)('KN'))
  if (t.isLoose) markers.push(chalk.blue('LO'))
  if (t.isTight) markers.push(chalk.red('TI'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(t.file)} ${materialColor(t.material)} ${threadTypeColor(t.threadType)} str:${scoreColor(t.strength)} elas:${scoreColor(t.elasticity)} ten:${scoreColor(t.tension)} smo:${scoreColor(t.smoothness)} Q:${scoreColor(t.quality)} ${classificationColor(t.classification)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    thick:${scoreColor(t.thickness)} color:${t.color} pattern:${t.pattern} conn:${t.connections.totalConnections} defects:${t.defects.pills + t.defects.snags + t.defects.holes + t.defects.runs}`)
  return details.join('\n')
}

// ─── Fabric Formatting ───────────────────────────────────────────────────────

function formatFabric(f: Fabric, verbose: boolean): string {
  const line = `  ${chalk.bold(f.directory)} ${conditionColor(f.condition)} grade:${gradeColor(f.qualityGrade)} ${weaveColor(f.weaveType)} threads:${f.threadCount} Q:${scoreColor(Math.round(f.threads.reduce((s, t) => s + t.quality, 0) / f.threads.length))}`

  if (!verbose) return line
  const details = [line]
  details.push(`    tension:${scoreColor(f.avgTension)} variance:${f.tensionVariance} str:${scoreColor(f.avgStrength)} smo:${scoreColor(f.avgSmoothness)} warp:${f.warpCount} weft:${f.weftCount}`)
  details.push(`    defects:${f.totalDefects} frayed:${f.frayedThreads} broken:${f.brokenThreads} knotted:${f.knottedThreads} density:${scoreColor(f.density)} breath:${scoreColor(f.breathability)} dur:${scoreColor(f.durability)}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: LoomStats): string {
  return [
    `  Files: ${stats.totalFiles} | Fabrics: ${stats.totalFabrics} | Threads: ${stats.totalThreads} | Warp: ${chalk.blue(String(stats.warpThreads))} | Weft: ${chalk.green(String(stats.weftThreads))}`,
    `  Str: ${scoreColor(stats.avgThreadStrength)} | Elas: ${scoreColor(stats.avgThreadElasticity)} | Ten: ${scoreColor(stats.avgThreadTension)} | Smo: ${scoreColor(stats.avgThreadSmoothness)}`,
    `  Premium: ${chalk.rgb(255, 215, 0)(String(stats.premiumThreads))} | Reject: ${chalk.red(String(stats.rejectThreads))} | Frayed: ${chalk.yellow(String(stats.frayedThreads))} | Broken: ${chalk.red(String(stats.brokenThreads))} | Knotted: ${chalk.rgb(255, 165, 0)(String(stats.knottedThreads))}`,
    `  Defects: ${stats.totalDefects} | Density: ${scoreColor(stats.avgFabricDensity)} | Breath: ${scoreColor(stats.avgFabricBreathability)} | Dur: ${scoreColor(stats.avgFabricDurability)}`,
    `  Best: ${chalk.green(stats.masterWeaver)} | Worst: ${chalk.red(stats.apprenticeWork)} | Weave: ${weaveColor(stats.dominantWeave)} | Material: ${materialColor(stats.dominantMaterial)}`,
    `  Quality: ${scoreColor(stats.overallWeaveQuality)} | Grade: ${weaverGradeColor(stats.weaverGrade)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format loom result as a table
 * @example
 * formatLoomTable(result, false) // string
 */
export function formatLoomTable(result: LoomResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧵 Loom - Code Weaving Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🧶 Threads'))
  if (result.threads.length === 0) {
    lines.push(chalk.dim('  No threads detected.'))
  } else {
    const display = verbose ? result.threads : result.threads.slice(0, 15)
    for (const t of display) {
      lines.push(formatThread(t, verbose))
    }
    if (!verbose && result.threads.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.threads.length - 15} more`))
    }
  }
  lines.push('')

  if (result.fabrics.length > 0) {
    lines.push(chalk.bold('🎨 Fabrics'))
    for (const f of result.fabrics) {
      lines.push(formatFabric(f, verbose))
    }
    lines.push('')
  }

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
 * Format loom result as JSON
 * @example
 * formatLoomJson(result) // string
 */
export function formatLoomJson(result: LoomResult): string {
  return JSON.stringify(result, null, 2)
}
