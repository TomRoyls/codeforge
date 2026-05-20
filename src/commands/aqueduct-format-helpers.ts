import chalk from 'chalk'
import type { AqueductResult, AqueductFile, Channel, Reservoir, Leak, AqueductStats } from './aqueduct-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function gradeColor(g: string): string {
  if (g === 'roman-engineering') return chalk.green(g)
  if (g === 'modern-plumbing') return chalk.blue(g)
  if (g === 'standard') return chalk.cyan(g)
  if (g === 'leaky-pipes') return chalk.yellow(g)
  return chalk.red(g)
}

function classificationColor(c: string): string {
  if (c === 'spring') return chalk.green(c)
  if (c === 'well') return chalk.blue(c)
  if (c === 'reservoir-hub') return chalk.cyan(c)
  if (c === 'distribution') return chalk.magenta(c)
  if (c === 'drain') return chalk.yellow(c)
  return chalk.red(c)
}

function flowColor(q: string): string {
  if (q === 'clean') return chalk.green(q)
  if (q === 'filtered') return chalk.blue(q)
  if (q === 'murky') return chalk.yellow(q)
  return chalk.red(q)
}

function severityColor(s: string): string {
  if (s === 'flood') return chalk.red(s)
  if (s === 'stream') return chalk.yellow(s)
  if (s === 'trickle') return chalk.cyan(s)
  return chalk.dim(s)
}

// ─── File Formatting ───────────────────────────────────────────────────────────

function formatFile(f: AqueductFile): string {
  return `  ${chalk.bold(f.file)} ${classificationColor(f.classification)} ` +
    `Flow:${scoreColor(f.flowEfficiency)} Quality:${scoreColor(f.waterQuality)} ` +
    `S:${f.sources} C:${f.channels} R:${f.reservoirs} L:${chalk.red(String(f.leaks))}`
}

// ─── Channel Formatting ────────────────────────────────────────────────────────

function formatChannels(channels: Channel[]): string {
  if (channels.length === 0) return chalk.dim('  No channels detected.')
  return channels.slice(0, 8).map(c =>
    `  ${chalk.bold(c.from)} → ${chalk.bold(c.to)} [${c.type}] ${flowColor(c.flowQuality)} width:${c.width}`
  ).join('\n')
}

// ─── Reservoir Formatting ──────────────────────────────────────────────────────

function formatReservoirs(reservoirs: Reservoir[]): string {
  if (reservoirs.length === 0) return chalk.dim('  No reservoirs detected.')
  return reservoirs.slice(0, 8).map(r => {
    const stagnant = r.isStagnant ? chalk.red(' STAGNANT') : ''
    const overflow = r.isOverflowing ? chalk.yellow(' OVERFLOW') : ''
    return `  ${chalk.bold(r.name)} ${r.type} cap:${r.capacity} in:${r.inflow} out:${r.outflow} q:${scoreColor(r.quality)}${stagnant}${overflow}`
  }).join('\n')
}

// ─── Leak Formatting ───────────────────────────────────────────────────────────

function formatLeaks(leaks: Leak[]): string {
  if (leaks.length === 0) return chalk.green('  No leaks detected — dry system!')
  return leaks.slice(0, 10).map(l =>
    `  ${severityColor(l.severity)} [${l.type}] line ${l.line}: ${l.description}`
  ).join('\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: AqueductStats): string {
  return [
    `  Grade: ${gradeColor(stats.overallGrade)} | Efficiency: ${scoreColor(stats.avgFlowEfficiency)} | Quality: ${scoreColor(stats.avgWaterQuality)}`,
    `  Sources: ${stats.totalSources} | Channels: ${stats.totalChannels} | Reservoirs: ${stats.totalReservoirs} | Leaks: ${chalk.red(String(stats.totalLeaks))}`,
    `  Flood leaks: ${stats.floodLeaks > 0 ? chalk.red(String(stats.floodLeaks)) : chalk.green('0')} | Stagnant: ${stats.stagnantReservoirs} | Overflow: ${stats.overflowingReservoirs}`,
    `  Network: ${scoreColor(stats.networkEfficiency)} | Loss: ${chalk.red(stats.waterLoss + '%')} | Capacity: ${scoreColor(stats.systemCapacity)}`,
    `  Files — Spring:${stats.springFiles} Well/Dist/Hub | Drain:${stats.drainFiles} Dry:${stats.dryFiles}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format aqueduct result as a table
 * @example
 * formatAqueductTable(result, false) // string
 */
export function formatAqueductTable(result: AqueductResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏛️ Aqueduct — Code Data Flow Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📄 Files'))
  const display = verbose ? result.files : result.files.slice(0, 10)
  if (display.length === 0) {
    lines.push(chalk.dim('  No files to display.'))
  } else {
    lines.push(display.map(f => formatFile(f)).join('\n'))
  }
  lines.push('')

  lines.push(chalk.bold('🔄 Channels'))
  lines.push(formatChannels(result.channels))
  lines.push('')

  lines.push(chalk.bold('💾 Reservoirs'))
  lines.push(formatReservoirs(result.reservoirs))
  lines.push('')

  lines.push(chalk.bold('💧 Leaks'))
  lines.push(formatLeaks(result.leaks))
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
 * Format aqueduct result as JSON
 * @example
 * formatAqueductJson(result) // string
 */
export function formatAqueductJson(result: AqueductResult): string {
  return JSON.stringify(result, null, 2)
}
