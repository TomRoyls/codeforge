import chalk from 'chalk'
import type { ClockworkResult, Gear, MeshPoint, Spring, MechanismInspection, ClockworkStats } from './clockwork-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function gearTypeColor(t: string): string {
  if (t === 'drive') return chalk.green(t)
  if (t === 'driven') return chalk.blue(t)
  if (t === 'idler') return chalk.dim(t)
  if (t === 'compound') return chalk.cyan(t)
  if (t === 'planetary') return chalk.magenta(t)
  return chalk.yellow(t)
}

function alignmentColor(a: string): string {
  if (a === 'perfect') return chalk.green(a)
  if (a === 'aligned') return chalk.blue(a)
  if (a === 'misaligned') return chalk.yellow(a)
  return chalk.red(a)
}

function springTypeColor(t: string): string {
  if (t === 'tension') return chalk.red(t)
  if (t === 'compression') return chalk.blue(t)
  if (t === 'torsion') return chalk.magenta(t)
  return chalk.cyan(t)
}

function classificationColor(c: string): string {
  if (c === 'swiss-watch') return chalk.green(c)
  if (c === 'precision') return chalk.blue(c)
  if (c === 'standard') return chalk.cyan(c)
  if (c === 'wind-up') return chalk.yellow(c)
  return chalk.red(c)
}

function gradeColor(g: string): string {
  if (g === 'swiss-chronometer') return chalk.green(g)
  if (g === 'precision-timepiece') return chalk.blue(g)
  if (g === 'standard-clock') return chalk.cyan(g)
  if (g === 'wind-up-toy') return chalk.yellow(g)
  return chalk.red(g)
}

function conditionColor(c: string): string {
  if (c === 'mint') return chalk.green(c)
  if (c === 'excellent') return chalk.blue(c)
  if (c === 'good') return chalk.cyan(c)
  if (c === 'fair') return chalk.yellow(c)
  if (c === 'needs-repair') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

// ─── Gear Formatting ───────────────────────────────────────────────────────────

function formatGear(g: Gear): string {
  const jammed = g.isJammed ? chalk.red(' ⚠jammed') : ''
  const overwound = g.isOverwound ? chalk.yellow(' ⚡overwound') : ''
  return `  ${chalk.bold(g.name)} ${gearTypeColor(g.type)} teeth:${g.teeth} size:${g.size} rpm:${g.rpm} precision:${scoreColor(g.precision)} wear:${scoreColor(g.wear)}${jammed}${overwound}`
}

// ─── Mesh Formatting ───────────────────────────────────────────────────────────

function formatMesh(m: MeshPoint): string {
  return `  ${alignmentColor(m.alignment)} ${m.type} ${chalk.dim(m.gearA)} ↔ ${chalk.dim(m.gearB)} friction:${scoreColor(m.friction)} lub:${scoreColor(m.lubrication)}`
}

// ─── Spring Formatting ─────────────────────────────────────────────────────────

function formatSpring(s: Spring): string {
  const status = s.isOverwound ? chalk.red(' OVERWOUND') : s.isUnwound ? chalk.dim(' UNWOUND') : ''
  return `  ${springTypeColor(s.type)} ${chalk.bold(s.name)} wound:${scoreColor(s.wound)}${status} — ${chalk.dim(s.description)}`
}

// ─── Inspection Formatting ─────────────────────────────────────────────────────

function formatInspection(i: MechanismInspection): string {
  return `  ${chalk.bold(i.file)} ${classificationColor(i.classification)} gears:${i.gears} meshes:${i.meshPoints} springs:${i.springs} precision:${scoreColor(i.precision)} lub:${scoreColor(i.lubrication)} eff:${scoreColor(i.efficiency)}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: ClockworkStats): string {
  return [
    `  Grade: ${gradeColor(stats.clockworkGrade)} | Condition: ${conditionColor(stats.overallCondition)} | Precision: ${scoreColor(stats.mechanismPrecision)}`,
    `  Gears: ${stats.totalGears} (${chalk.green(String(stats.driveGears))} drive, ${chalk.dim(String(stats.idlerGears))} idler, ${chalk.red(String(stats.jammedGears))} jammed)`,
    `  Meshes: ${stats.totalMeshPoints} (${chalk.green(String(stats.perfectMeshes))} perfect, ${chalk.red(String(stats.strippedMeshes))} stripped)`,
    `  Springs: ${stats.totalSprings} (${chalk.red(String(stats.overwoundSprings))} overwound, ${chalk.dim(String(stats.unwoundSprings))} unwound)`,
    `  Inspections: ${chalk.green(String(stats.swissWatches))} swiss-watch | ${chalk.red(String(stats.brokenClocks))} broken-clock`,
    `  Avg: precision=${scoreColor(stats.avgPrecision)} lubrication=${scoreColor(stats.avgLubrication)} efficiency=${scoreColor(stats.avgEfficiency)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format clockwork result as a table
 * @example
 * formatClockworkTable(result, false) // string
 */
export function formatClockworkTable(result: ClockworkResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⚙️  Clockwork — Code Mechanism Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🔧 Gears'))
  if (result.gears.length === 0) {
    lines.push(chalk.dim('  No gears detected.'))
  } else {
    const display = verbose ? result.gears : result.gears.slice(0, 10)
    lines.push(display.map(g => formatGear(g)).join('\n'))
  }
  lines.push('')

  if (result.meshPoints.length > 0) {
    lines.push(chalk.bold('🔗 Mesh Points'))
    const display = verbose ? result.meshPoints : result.meshPoints.slice(0, 8)
    lines.push(display.map(m => formatMesh(m)).join('\n'))
    lines.push('')
  }

  if (result.springs.length > 0) {
    lines.push(chalk.bold('🌀 Springs'))
    const display = verbose ? result.springs : result.springs.slice(0, 6)
    lines.push(display.map(s => formatSpring(s)).join('\n'))
    lines.push('')
  }

  lines.push(chalk.bold('🔍 Inspections'))
  if (result.inspections.length === 0) {
    lines.push(chalk.dim('  No files inspected.'))
  } else {
    const display = verbose ? result.inspections : result.inspections.slice(0, 10)
    lines.push(display.map(i => formatInspection(i)).join('\n'))
  }
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

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format clockwork result as JSON
 * @example
 * formatClockworkJson(result) // string
 */
export function formatClockworkJson(result: ClockworkResult): string {
  return JSON.stringify(result, null, 2)
}
