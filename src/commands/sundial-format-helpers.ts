import chalk from 'chalk'
import type { SundialResult, DialReading, ShadowPath, DialSegment, SundialStats } from './sundial-helpers.js'

// ─── Color Utilities ──────────────────────────────────────────────────────────

function gradeColor(g: string): string {
  if (g === 'optimal') return chalk.green(g)
  if (g === 'efficient') return chalk.blue(g)
  if (g === 'adequate') return chalk.cyan(g)
  if (g === 'wasteful') return chalk.yellow(g)
  return chalk.red(g)
}

function overallGradeColor(g: string): string {
  if (g === 'atomic-clock') return chalk.green(g)
  if (g === 'precision') return chalk.blue(g)
  if (g === 'standard') return chalk.cyan(g)
  if (g === 'sundial') return chalk.yellow(g)
  return chalk.red(g)
}

function wasteColor(w: string): string {
  if (w === 'minor') return chalk.green(w)
  if (w === 'moderate') return chalk.yellow(w)
  if (w === 'major') return chalk.rgb(255, 165, 0)(w)
  return chalk.red(w)
}

function segmentColor(t: string): string {
  if (t === 'golden-hour') return chalk.rgb(255, 215, 0)(t)
  if (t === 'midday') return chalk.yellow(t)
  if (t === 'afternoon') return chalk.cyan(t)
  if (t === 'twilight') return chalk.rgb(255, 140, 0)(t)
  return chalk.rgb(100, 100, 200)(t)
}

function complexityColor(c: string): string {
  if (c === 'O(1)' || c === 'O(log n)') return chalk.green(c)
  if (c === 'O(n)' || c === 'O(n log n)') return chalk.yellow(c)
  return chalk.red(c)
}

// ─── Reading Formatting ───────────────────────────────────────────────────────

function formatReadings(readings: DialReading[], verbose: boolean): string {
  if (readings.length === 0) return chalk.dim('  No readings taken.')
  const display = verbose ? readings : readings.slice(0, 10)
  return display.map((r, i) => {
    const eff = r.efficiency >= 70 ? chalk.green(String(r.efficiency)) : r.efficiency >= 40 ? chalk.yellow(String(r.efficiency)) : chalk.red(String(r.efficiency))
    const shadows = r.shadowPaths > 0 ? chalk.yellow(` (${r.shadowPaths} shadow)`) : ''
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(r.file)} ${gradeColor(r.grade)}`,
      `     Efficiency: ${eff}/100 | Ops: ${chalk.white(String(r.operationCount))} | Unnecessary: ${chalk.white(String(r.unnecessaryOps))}${shadows}`,
      `     Time: ${complexityColor(r.timeComplexity)} | Space: ${chalk.white(r.spaceComplexity)} | Obstruction: ${chalk.white(String(r.obstructionLevel))}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Shadow Path Formatting ───────────────────────────────────────────────────

function formatShadowPaths(paths: ShadowPath[]): string {
  if (paths.length === 0) return chalk.dim('  No shadow paths detected.')
  return paths.slice(0, 15).map((sp, i) => {
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(sp.type)} ${wasteColor(sp.wasteLevel)} ${chalk.dim(`(${sp.file}:${sp.line})`)}`,
      `     ${chalk.dim(sp.description)}`,
      `     Savings: ${chalk.cyan(sp.estimatedSavings)} | Fix: ${chalk.green(sp.fix)}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Segment Formatting ───────────────────────────────────────────────────────

function formatSegments(segments: DialSegment[]): string {
  if (segments.length === 0) return chalk.dim('  No segments classified.')
  return segments.map((seg, i) => {
    const fileCount = seg.files.length
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${segmentColor(seg.type)} (${fileCount} file${fileCount !== 1 ? 's' : ''})`,
      `     Avg Efficiency: ${chalk.white(String(seg.avgEfficiency))}/100`,
      `     ${chalk.dim(seg.description)}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

function formatStats(stats: SundialStats): string {
  const effBar = (v: number) => {
    const filled = Math.round(v / 5)
    return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(20 - filled))
  }
  return [
    `  Readings: ${chalk.white(String(stats.totalReadings))} | Avg Efficiency: ${chalk.white(String(stats.avgEfficiency))}/100`,
    `  Optimal: ${chalk.green(String(stats.optimalFiles))} | Extravagant: ${chalk.red(String(stats.extravagantFiles))} | Shadow Paths: ${chalk.yellow(String(stats.totalShadowPaths))} (${chalk.red(String(stats.severeShadowPaths))} severe)`,
    `  Golden Hour: ${chalk.rgb(255, 215, 0)(String(stats.goldenHourFiles))} | Midnight: ${chalk.rgb(100, 100, 200)(String(stats.midnightFiles))} | Common Complexity: ${complexityColor(stats.commonTimeComplexity)}`,
    `  Efficiency Index: ${effBar(stats.efficiencyIndex)} ${chalk.white(String(stats.efficiencyIndex))}`,
    `  Waste Index:      ${effBar(100 - stats.wasteIndex)} ${chalk.white(String(100 - stats.wasteIndex))} ${chalk.dim(`(waste: ${stats.wasteIndex})`)}`,
    `  Sundial Accuracy: ${effBar(stats.sundialAccuracy)} ${chalk.white(String(stats.sundialAccuracy))}`,
    `  Overall Grade: ${overallGradeColor(stats.overallGrade)}`,
  ].join('\n')
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format sundial result as a table
 * @example
 * formatSundialTable(result, false) // string
 */
export function formatSundialTable(result: SundialResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌅 Sundial — Code Efficiency Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('📊 Readings'))
  lines.push(formatReadings(result.readings, verbose))
  lines.push('')
  lines.push(chalk.bold('🌑 Shadow Paths'))
  lines.push(formatShadowPaths(result.shadowPaths))
  lines.push('')
  lines.push(chalk.bold('🕐 Dial Segments'))
  lines.push(formatSegments(result.segments))
  lines.push('')
  lines.push(chalk.bold('📈 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format sundial result as JSON
 * @example
 * formatSundialJson(result) // string
 */
export function formatSundialJson(result: SundialResult): string {
  return JSON.stringify(result, null, 2)
}
