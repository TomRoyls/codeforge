import chalk from 'chalk'
import type { HourglassGrainResult, SandGrain, SandLayer, HourglassStructure } from './hourglass-grain-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function sandTypeColor(t: string): string {
  switch (t) {
    case 'diamond': return chalk.rgb(185, 242, 255)(t)
    case 'corundum': return chalk.rgb(144, 238, 144)(t)
    case 'garnet': return chalk.rgb(220, 20, 60)(t)
    case 'quartz': return chalk.rgb(255, 250, 205)(t)
    case 'silica': return chalk.rgb(210, 180, 140)(t)
    case 'dust': return chalk.gray(t)
    case 'mud': return chalk.rgb(139, 90, 43)(t)
    default: return chalk.dim(t)
  }
}

function condColor(c: string): string {
  switch (c) {
    case 'flowing': return chalk.green(c)
    case 'smooth': return chalk.blue(c)
    case 'steady': return chalk.yellow(c)
    case 'clogging': return chalk.rgb(255, 165, 0)(c)
    case 'jammed': return chalk.red(c)
    case 'broken': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function layerCondColor(c: string): string {
  switch (c) {
    case 'flowing-freely': return chalk.green(c)
    case 'smooth-flow': return chalk.blue(c)
    case 'steady': return chalk.yellow(c)
    case 'slow': return chalk.rgb(255, 165, 0)(c)
    case 'clogged': return chalk.red(c)
    case 'jammed': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'precision-clock': return chalk.rgb(255, 215, 0)(g)
    case 'hourglass': return chalk.green(g)
    case 'sundial': return chalk.blue(g)
    case 'water-clock': return chalk.yellow(g)
    case 'stopped-clock': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Grain Formatting ────────────────────────────────────────────────────────

function formatGrain(g: SandGrain, verbose: boolean): string {
  const markers: string[] = []
  if (g.neck.isChoked) markers.push(chalk.red('CK'))
  if (g.flow.hasClogs) markers.push(chalk.yellow('CG'))
  if (g.flow.hasLeaks) markers.push(chalk.rgb(255, 165, 0)('LK'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(g.file)} ${sandTypeColor(g.sandType)} ${condColor(g.condition)} grain:${scoreColor(g.grainSize)} flow:${scoreColor(g.flowRate)} qual:${scoreColor(g.sandQuality)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    role:${g.hourglassRole} weight:${g.avgGrainWeight} count:${g.grainCount} neck:${scoreColor(g.neck.width)} chamber:${scoreColor(g.chamber.balance)} time:${g.time.timeUniformity}`)
  if (g.flow.clogPoints.length > 0) details.push(`    clogs: ${g.flow.clogPoints.join('; ')}`)
  if (g.flow.leakPoints.length > 0) details.push(`    leaks: ${g.flow.leakPoints.join('; ')}`)
  return details.join('\n')
}

// ─── Layer Formatting ────────────────────────────────────────────────────────

function formatLayer(l: SandLayer, verbose: boolean): string {
  const line = `  ${chalk.bold(l.directory)} ${sandTypeColor(l.sandType)} ${layerCondColor(l.condition)} grain:${scoreColor(l.avgGrainSize)} flow:${scoreColor(l.avgFlowRate)} neck:${scoreColor(l.neckWidth)} bal:${scoreColor(l.chamberBalance)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    grains:${l.totalGrainCount} fine:${l.fineGrains} coarse:${l.coarseGrains} boulders:${l.boulders} clogs:${l.clogCount} leaks:${l.leakCount}`)
  return details.join('\n')
}

// ─── Hourglass Formatting ────────────────────────────────────────────────────

function formatHourglass(h: HourglassStructure): string {
  return [
    `  Total Sand: ${h.totalSand} | Grain: ${scoreColor(h.avgGrainSize)} | Flow: ${scoreColor(h.avgFlowRate)} | Quality: ${scoreColor(h.avgSandQuality)}`,
    `  Neck: ${scoreColor(h.neckWidth)} | Balance: ${scoreColor(h.chamberBalance)} | Clogs: ${chalk.yellow(String(h.totalClogs))} | Leaks: ${chalk.rgb(255, 165, 0)(String(h.totalLeaks))} | Boulders: ${chalk.red(String(h.totalBoulders))} | Health: ${scoreColor(h.flowHealth)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format hourglass grain result as a table
 * @example
 * formatHourglassGrainTable(result, false) // string
 */
export function formatHourglassGrainTable(result: HourglassGrainResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⏳ Hourglass Grain - Code Flow Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🏜️ Sand Grains'))
  if (result.grains.length === 0) {
    lines.push(chalk.dim('  No grains detected.'))
  } else {
    const display = verbose ? result.grains : result.grains.slice(0, 15)
    for (const g of display) {
      lines.push(formatGrain(g, verbose))
    }
    if (!verbose && result.grains.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.grains.length - 15} more`))
    }
  }
  lines.push('')

  if (result.layers.length > 0) {
    lines.push(chalk.bold('📊 Sand Layers'))
    for (const l of result.layers) {
      lines.push(formatLayer(l, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('⏲️ Hourglass'))
  lines.push(formatHourglass(result.hourglass))
  lines.push('')

  lines.push(chalk.bold('📈 Statistics'))
  const s = result.stats
  lines.push(`  Grade: ${gradeColor(s.timekeeperGrade)} | Best Flow: ${chalk.green(s.bestFlow)} | Worst: ${chalk.red(s.worstFlow)}`)
  lines.push(`  Finest: ${chalk.cyan(s.finestGrain)} | Coarsest: ${chalk.red(s.coarsestGrain)} | Bottleneck: ${chalk.yellow(s.biggestBottleneck)}`)
  lines.push(`  Fine:${s.fineGrains} Medium:${s.mediumGrains} Coarse:${s.coarseGrains} Boulder:${s.boulders} Dust:${s.dustGrains} | Choked:${s.chokedFiles} Balanced:${s.balancedFiles}`)

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
 * Format hourglass grain result as JSON
 * @example
 * formatHourglassGrainJson(result) // string
 */
export function formatHourglassGrainJson(result: HourglassGrainResult): string {
  return JSON.stringify(result, null, 2)
}
