import chalk from 'chalk'

import type { HotspotEntry, HotspotResult } from './hotspot-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskBadge(level: string): string {
  switch (level) {
    case 'critical': return chalk.bgRed.white(' CRITICAL ')
    case 'high': return chalk.red(' HIGH ')
    case 'medium': return chalk.yellow(' MED ')
    default: return chalk.green(' LOW ')
  }
}

// ─── Hotspot Table ────────────────────────────────────────────────────────────

/**
 * Format hotspot entries as a table.
 *
 * @example
 * formatHotspotTable(hotspots) // 'File  Score  Complexity  Changes  Risk'
 */
export function formatHotspotTable(hotspots: HotspotEntry[]): string {
  if (hotspots.length === 0) return chalk.gray('  No hotspots detected.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Code Hotspots'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────'))
  lines.push(`  ${chalk.bold(padRight('File', 35))} ${chalk.bold(padRight('Score', 8))} ${chalk.bold(padRight('Cmplx', 8))} ${chalk.bold(padRight('Chgs', 8))} ${chalk.bold(padRight('LOC', 8))} ${chalk.bold('Risk')}`)

  for (const h of hotspots.slice(0, 20)) {
    const file = h.file.length > 33 ? '...' + h.file.slice(-31) : h.file
    const scoreStr = String(h.hotspotScore)
    const scoreColor = h.hotspotScore >= 75 ? chalk.red : h.hotspotScore >= 50 ? chalk.yellow : chalk.green
    lines.push(`  ${padRight(file, 35)} ${scoreColor(padRight(scoreStr, 8))} ${padRight(String(h.complexity), 8)} ${padRight(String(h.changeFrequency), 8)} ${padRight(String(h.linesOfCode), 8)} ${riskBadge(h.riskLevel)}`)
  }

  if (hotspots.length > 20) {
    lines.push(`  ${chalk.gray(`... and ${hotspots.length - 20} more`)}`)
  }

  return lines.join('\n')
}

// ─── Distribution Chart ───────────────────────────────────────────────────────

/**
 * Format risk distribution as ASCII chart.
 *
 * @example
 * formatDistributionChart({ low: 10, medium: 5, high: 3, critical: 1 })
 */
export function formatDistributionChart(distribution: { low: number; medium: number; high: number; critical: number }): string {
  const total = distribution.low + distribution.medium + distribution.high + distribution.critical
  if (total === 0) return ''

  const width = 30

  const lines: string[] = []
  lines.push(chalk.bold('\n  Risk Distribution'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  const entries: [string, number, (s: string) => string][] = [
    ['critical', distribution.critical, chalk.red],
    ['high', distribution.high, chalk.rgb(255, 165, 0)],
    ['medium', distribution.medium, chalk.yellow],
    ['low', distribution.low, chalk.green],
  ]

  for (const [label, count, color] of entries) {
    const barLen = Math.round((count / total) * width)
    const bar = '█'.repeat(barLen)
    lines.push(`  ${color(padRight(label, 10))} ${color(bar)} ${chalk.bold(String(count))}`)
  }

  return lines.join('\n')
}

// ─── Top Hotspots Detail ──────────────────────────────────────────────────────

/**
 * Format top hotspots with function breakdown.
 *
 * @example
 * formatTopHotspotsDetail(hotspots) // detailed function-level view
 */
export function formatTopHotspotsDetail(hotspots: HotspotEntry[]): string {
  if (hotspots.length === 0) return ''

  const lines: string[] = []
  lines.push(chalk.bold('\n  Top Hotspots — Function Breakdown'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const h of hotspots.slice(0, 5)) {
    lines.push(`  ${chalk.bold(h.file)} ${riskBadge(h.riskLevel)} (score: ${h.hotspotScore})`)
    for (const fn of h.functions.sort((a, b) => b.score - a.score).slice(0, 5)) {
      const fnRisk = fn.riskLevel === 'high' ? chalk.red : fn.riskLevel === 'medium' ? chalk.yellow : chalk.green
      lines.push(`    ${chalk.gray('•')} ${fn.name} L${fn.lineStart} ${chalk.gray(`cmplx:${fn.complexity} size:${fn.size}`)} ${fnRisk(`(${fn.score})`)}`)
    }
    if (h.functions.length > 5) {
      lines.push(`    ${chalk.gray(`... and ${h.functions.length - 5} more functions`)}`)
    }
  }

  return lines.join('\n')
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete hotspot result as table output.
 *
 * @example
 * formatHotspotResultTable(result, false) // full dashboard output
 */
export function formatHotspotResultTable(result: HotspotResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatHotspotTable(result.hotspots))
  sections.push(formatDistributionChart(result.distribution))

  const s = result.stats
  sections.push(chalk.gray(`\n  Files: ${s.totalFiles}  Hotspots (>=70): ${s.hotspotFiles}  Critical: ${s.criticalFiles}  Avg Score: ${s.averageScore}  Max: ${s.maxScore}`))

  if (verbose) {
    sections.push(formatTopHotspotsDetail(result.topHotspots))
  }

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ─────────────────────────────────────────'))
    for (const rec of result.recommendations) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format hotspot result as JSON.
 *
 * @example
 * formatHotspotJson(result) // '{"hotspots":[...]...}'
 */
export function formatHotspotJson(result: HotspotResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format hotspot result as CSV.
 *
 * @example
 * formatHotspotCsv(result) // 'file,score,complexity,...'
 */
export function formatHotspotCsv(result: HotspotResult): string {
  const lines: string[] = ['file,score,complexity,changeFrequency,riskLevel,linesOfCode']

  for (const h of result.hotspots) {
    lines.push(`${h.file},${h.hotspotScore},${h.complexity},${h.changeFrequency},${h.riskLevel},${h.linesOfCode}`)
  }

  return lines.join('\n')
}
