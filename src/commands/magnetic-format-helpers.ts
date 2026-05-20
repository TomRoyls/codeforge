import chalk from 'chalk'
import type { MagneticResult, MagneticFile, MagneticConnection, FieldLine, MagneticPole, MagneticAnomaly, MagneticStats } from './magnetic-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function polarityColor(p: string): string {
  if (p === 'positive') return chalk.green(p)
  if (p === 'negative') return chalk.blue(p)
  return chalk.dim(p)
}

function fieldStrengthColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function classificationColor(c: string): string {
  if (c === 'superconductor') return chalk.green(c)
  if (c === 'conductor') return chalk.blue(c)
  if (c === 'resistor') return chalk.yellow(c)
  if (c === 'insulator') return chalk.cyan(c)
  return chalk.red(c)
}

function poleTypeColor(t: string): string {
  if (t === 'north') return chalk.red(t)
  return chalk.blue(t)
}

function riskColor(r: string): string {
  if (r === 'high') return chalk.red(r)
  if (r === 'medium') return chalk.yellow(r)
  if (r === 'low') return chalk.cyan(r)
  return chalk.dim(r)
}

function anomalySeverityColor(s: string): string {
  if (s === 'alarming') return chalk.red(s)
  if (s === 'concerning') return chalk.yellow(s)
  if (s === 'notable') return chalk.cyan(s)
  return chalk.dim(s)
}

function fieldColor(f: string): string {
  if (f === 'harmonious') return chalk.green(f)
  if (f === 'ordered') return chalk.blue(f)
  if (f === 'disturbed') return chalk.yellow(f)
  if (f === 'chaotic') return chalk.rgb(255, 100, 0)(f)
  return chalk.red(f)
}

// ─── File Formatting ───────────────────────────────────────────────────────────

function formatFiles(files: MagneticFile[], verbose: boolean): string {
  if (files.length === 0) return chalk.dim('  No files to analyze.')
  const display = verbose ? files : files.slice(0, 10)
  return display.map((f, i) => {
    const pole = f.isPole ? ' ⚡' : ''
    const anomaly = f.isAnomaly ? ' ⚠' : ''
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(f.file)} ${polarityColor(f.polarity)} ${classificationColor(f.classification)}${pole}${anomaly}`,
      `     Field:${fieldStrengthColor(f.fieldStrength)} Charge:${f.charge > 0 ? '+' : ''}${f.charge} Connections:${f.connections.length}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Pole Formatting ───────────────────────────────────────────────────────────

function formatPoles(poles: MagneticPole[]): string {
  if (poles.length === 0) return chalk.dim('  No poles detected.')
  return poles.map(p => {
    const affected = p.affectedBy.length > 0
      ? chalk.dim(` Affects: ${p.affectedBy.slice(0, 3).join(', ')}`)
      : ''
    return `  ${poleTypeColor(p.type)} ${chalk.bold(p.file)} Str:${p.strength} Risk:${riskColor(p.risk)}${affected}`
  }).join('\n')
}

// ─── Anomaly Formatting ────────────────────────────────────────────────────────

function formatAnomalies(anomalies: MagneticAnomaly[]): string {
  if (anomalies.length === 0) return chalk.dim('  No anomalies detected.')
  return anomalies.map(a => {
    return `  ${anomalySeverityColor(a.severity)} ${chalk.bold(a.type)}: ${chalk.dim(a.description)}`
  }).join('\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: MagneticStats): string {
  return [
    `  Field: ${chalk.bold(fieldColor(stats.overallField))} | Coherence: ${fieldStrengthColor(stats.fieldCoherence)} | Entropy: ${fieldStrengthColor(stats.couplingEntropy)}`,
    `  Files: ${chalk.white(String(stats.totalFiles))} (${chalk.green(String(stats.positivePolarity))}+ ${chalk.blue(String(stats.negativePolarity))}- ${chalk.dim(String(stats.neutralPolarity))}0)`,
    `  Avg Strength: ${fieldStrengthColor(stats.avgFieldStrength)} | Max: ${fieldStrengthColor(stats.maxFieldStrength)}`,
    `  ${chalk.green(`${stats.superconductors} super`)}, ${chalk.cyan(`${stats.insulators} insulator`)}, ${chalk.red(`${stats.antimatter} antimatter`)}`,
    `  Poles: ${chalk.white(String(stats.totalPoles))} (${chalk.red(`${stats.northPoles} N`)} ${chalk.blue(`${stats.southPoles} S`)})`,
    `  Anomalies: ${chalk.white(String(stats.totalAnomalies))} (${chalk.red(`${stats.alarmingAnomalies} alarming`)})`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format magnetic result as a table
 * @example
 * formatMagneticTable(result, false) // string
 */
export function formatMagneticTable(result: MagneticResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧲 Magnetic — Code Attraction Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('📡 Files'))
  lines.push(formatFiles(result.files, verbose))
  lines.push('')
  lines.push(chalk.bold('⚡ Poles'))
  lines.push(formatPoles(result.poles))
  lines.push('')
  lines.push(chalk.bold('🔍 Anomalies'))
  lines.push(formatAnomalies(result.anomalies))
  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format magnetic result as JSON
 * @example
 * formatMagneticJson(result) // string
 */
export function formatMagneticJson(result: MagneticResult): string {
  return JSON.stringify(result, null, 2)
}
