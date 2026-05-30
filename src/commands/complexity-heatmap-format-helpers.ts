import chalk from 'chalk'

import type { HeatmapRiskLevel } from './complexity-heatmap-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Heatmap block characters ────────────────────────────

const BLOCK_CHARS = ['░', '▒', '▓', '█'] as const

// ─── Risk coloring ─────────────────────────────────────

/**
 * Returns the chalk color function for a given heatmap risk level.
 *
 * @param level - The risk level
 * @returns A chalk styling function
 *
 * @example
 * getHeatmapRiskColor('low')('safe')       // green text
 * getHeatmapRiskColor('critical')('!!!')   // bold red text
 */
export function getHeatmapRiskColor(level: HeatmapRiskLevel): (text: string) => string {
  switch (level) {
    case 'low': return chalk.green
    case 'medium': return chalk.yellow
    case 'high': return chalk.red
    case 'critical': return chalk.bold.red
  }
}

// ─── Padding helpers ────────────────────────────────────

// ─── Heatmap bar generation ─────────────────────────────

/**
 * Generates a colorized heatmap bar using Unicode block characters.
 *
 * @param complexity - The complexity value for this file
 * @param maxComplexity - The maximum complexity across all files (for scaling)
 * @param width - Total width of the heatmap bar in characters
 * @returns A chalk-colored string representing the heatmap bar
 *
 * @example
 * generateHeatmapBar(10, 50, 20)  // colored bar scaled to 10/50
 */
export function generateHeatmapBar(complexity: number, maxComplexity: number, width: number): string {
  if (maxComplexity === 0) return chalk.dim('░'.repeat(width))

  const ratio = Math.min(complexity / maxComplexity, 1)
  const filledCount = Math.max(1, Math.round(ratio * width))
  const emptyCount = width - filledCount

  const segments: string[] = []

  for (let i = 0; i < filledCount; i++) {
    const segmentRatio = i / filledCount
    const blockChar = BLOCK_CHARS[Math.min(Math.floor(segmentRatio * BLOCK_CHARS.length), BLOCK_CHARS.length - 1)]!
    const colorFn = getSegmentColor(segmentRatio)
    segments.push(colorFn(blockChar))
  }

  if (emptyCount > 0) {
    segments.push(chalk.dim('░'.repeat(emptyCount)))
  }

  return segments.join('')
}

/**
 * Returns the chalk color function for a heatmap segment based on position ratio.
 *
 * Green (0-0.33) → Yellow (0.33-0.66) → Red (0.66-0.85) → Bold Red (0.85-1.0)
 */
function getSegmentColor(ratio: number): (text: string) => string {
  if (ratio < 0.33) return chalk.green
  if (ratio < 0.66) return chalk.yellow
  if (ratio < 0.85) return chalk.red
  return chalk.bold.red
}

// ─── Table formatting ───────────────────────────────────

export interface HeatmapTableRow {
  filePath: string
  totalComplexity: number
  functionCount: number
  maxFunctionComplexity: number
  heatmapBar: string
  riskLevel: HeatmapRiskLevel
}

export interface HeatmapTableResult {
  rows: HeatmapTableRow[]
  totalFiles: number
  totalComplexity: number
  averageComplexity: number
  riskDistribution: { level: HeatmapRiskLevel; count: number }[]
}

/**
 * Formats heatmap results as a colorized table with heatmap bars.
 *
 * @param result - The HeatmapTableResult to format
 * @param width - Width of the heatmap bar column
 * @returns Formatted table string with chalk colors
 *
 * @example
 * formatHeatmapTable(result, 40)  // colored terminal output with bars
 */
export function formatHeatmapTable(result: HeatmapTableResult, width: number): string {
  const { rows, totalFiles, totalComplexity, averageComplexity, riskDistribution } = result
  const lines: string[] = [chalk.bold('\n🔥 Complexity Heatmap'), '']

  if (rows.length === 0) {
    lines.push(chalk.dim('No files found matching criteria.'))
    return lines.join('\n')
  }

  const colWidths = {
    complexity: Math.max(10, ...rows.map((r) => String(r.totalComplexity).length)),
    file: Math.max(12, ...rows.map((r) => r.filePath.length)),
    funcCount: Math.max(5, ...rows.map((r) => String(r.functionCount).length)),
    maxComplexity: Math.max(4, ...rows.map((r) => String(r.maxFunctionComplexity).length)),
    risk: 10,
  }

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Complexity', colWidths.complexity)) +
    '  ' +
    chalk.cyan(padLeft('Funcs', colWidths.funcCount)) +
    '  ' +
    chalk.cyan(padLeft('Max', colWidths.maxComplexity)) +
    '  ' +
    chalk.cyan('Heatmap') +
    ' '.repeat(Math.max(0, width - 7)) +
    '  ' +
    chalk.cyan(padLeft('Risk', colWidths.risk))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const row of rows) {
    const riskColor = getHeatmapRiskColor(row.riskLevel)
    const heatmapBar = generateHeatmapBar(row.totalComplexity, totalComplexity, width)
    const rowStr =
      padRight(row.filePath, colWidths.file) +
      '  ' +
      riskColor(padLeft(String(row.totalComplexity), colWidths.complexity)) +
      '  ' +
      padLeft(String(row.functionCount), colWidths.funcCount) +
      '  ' +
      riskColor(padLeft(String(row.maxFunctionComplexity), colWidths.maxComplexity)) +
      '  ' +
      heatmapBar +
      '  ' +
      riskColor(padLeft(row.riskLevel, colWidths.risk))
    lines.push(rowStr)
  }

  lines.push(chalk.dim('─'.repeat(header.length)))

  // Legend
  lines.push('')
  lines.push(chalk.dim('Legend: ') +
    chalk.green('░') + chalk.dim(' low ') +
    chalk.yellow('▒') + chalk.dim(' medium ') +
    chalk.red('▓') + chalk.dim(' high ') +
    chalk.bold.red('█') + chalk.dim(' critical'))

  // Summary
  lines.push('')
  lines.push(chalk.bold('Summary:'))
  lines.push(`  Files analyzed: ${totalFiles}`)
  lines.push(`  Total complexity: ${totalComplexity}`)
  lines.push(`  Average complexity: ${averageComplexity.toFixed(1)}`)

  lines.push('')
  lines.push(chalk.dim('Risk distribution:'))
  for (const { level, count } of riskDistribution) {
    const colorFn = getHeatmapRiskColor(level)
    lines.push(`  ${colorFn(`${level}: ${count}`)}`)
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export interface HeatmapJsonOutput {
  files: Array<{
    filePath: string
    totalComplexity: number
    functionCount: number
    maxFunctionComplexity: number
    riskLevel: HeatmapRiskLevel
  }>
  summary: {
    totalFiles: number
    totalComplexity: number
    averageComplexity: number
    riskDistribution: { level: HeatmapRiskLevel; count: number }[]
  }
}

/**
 * Formats heatmap results as pretty-printed JSON.
 *
 * @param result - The HeatmapTableResult to format
 * @returns JSON string
 *
 * @example
 * formatHeatmapJson(result)  // '{ "files": [...], "summary": {...} }'
 */
export function formatHeatmapJson(result: HeatmapTableResult): string {
  const output: HeatmapJsonOutput = {
    files: result.rows.map((row) => ({
      filePath: row.filePath,
      functionCount: row.functionCount,
      maxFunctionComplexity: row.maxFunctionComplexity,
      riskLevel: row.riskLevel,
      totalComplexity: row.totalComplexity,
    })),
    summary: {
      averageComplexity: result.averageComplexity,
      riskDistribution: result.riskDistribution,
      totalComplexity: result.totalComplexity,
      totalFiles: result.totalFiles,
    },
  }
  return JSON.stringify(output, null, 2)
}
