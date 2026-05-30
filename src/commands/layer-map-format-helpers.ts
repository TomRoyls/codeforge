import chalk from 'chalk'

import type { ArchLayer, LayerDependency, LayerMapResult, LayerViolation } from './layer-map-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function severityIcon(severity: 'warning' | 'critical'): string {
  return severity === 'critical' ? chalk.red('✖') : chalk.yellow('⚠')
}

function violationTypeLabel(type: LayerViolation['type']): string {
  switch (type) {
    case 'upward-dependency': return chalk.red('↑ upward')
    case 'skip-layer': return chalk.yellow('⤓ skip')
    case 'circular': return chalk.bgRed.white('↻ circular')
  }
}

// ─── ASCII Layer Diagram ──────────────────────────────────────────────────────

/**
 * Generate ASCII layer architecture diagram.
 *
 * @example
 * formatLayerDiagram(layers) // '┌─────────────────┐...'
 */
export function formatLayerDiagram(layers: ArchLayer[]): string {
  if (layers.length === 0) return chalk.gray('No layers detected.')

  const maxFileCount = Math.max(...layers.map((l) => l.fileCount), 1)
  const barWidth = 30
  const lines: string[] = []

  lines.push(chalk.bold('\n  Architectural Layer Map'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const layer of layers) {
    const barLen = Math.round((layer.fileCount / maxFileCount) * barWidth)
    const bar = '█'.repeat(barLen)
    const colorFn = layer.color === 'green' ? chalk.green
      : layer.color === 'cyan' ? chalk.cyan
      : layer.color === 'yellow' ? chalk.yellow
      : layer.color === 'magenta' ? chalk.magenta
      : layer.color === 'blue' ? chalk.blue
      : layer.color === 'gray' ? chalk.gray
      : chalk.white

    lines.push(`  ${colorFn(padRight(layer.name, 16))} ${colorFn(bar)} ${chalk.white(String(layer.fileCount))} files, ${chalk.gray(String(layer.totalLines) + ' lines')}`)
  }

  return lines.join('\n')
}

// ─── Dependency Arrows ────────────────────────────────────────────────────────

/**
 * Format dependency connections between layers.
 *
 * @example
 * formatDependencyArrows(deps) // 'presentation → business (5 imports)'
 */
export function formatDependencyArrows(dependencies: LayerDependency[]): string {
  if (dependencies.length === 0) return chalk.gray('\n  No cross-layer dependencies found.')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Layer Dependencies'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const dep of dependencies) {
    const arrow = dep.isViolation ? chalk.red('→') : chalk.green('→')
    const violation = dep.isViolation ? chalk.red(' [VIOLATION]') : ''
    lines.push(`  ${chalk.cyan(dep.from)} ${arrow} ${chalk.cyan(dep.to)}  ${chalk.gray(`(${dep.count} imports)`)}${violation}`)
  }

  return lines.join('\n')
}

// ─── Violations Table ─────────────────────────────────────────────────────────

/**
 * Format layer violations as a table.
 *
 * @example
 * formatViolationsTable(violations) // '✖ data → presentation ...'
 */
export function formatViolationsTable(violations: LayerViolation[]): string {
  if (violations.length === 0) return chalk.gray('\n  No violations detected. Architecture looks clean!')

  const lines: string[] = []
  lines.push(chalk.bold('\n  Layer Violations'))
  lines.push(chalk.gray('  ─────────────────────────────────────────'))

  for (const v of violations) {
    lines.push(`  ${severityIcon(v.severity)} ${violationTypeLabel(v.type)}  ${chalk.cyan(v.from)} → ${chalk.cyan(v.to)}`)
    lines.push(`    ${chalk.gray(v.description)}`)
    if (v.files.length > 0 && v.files.length <= 5) {
      for (const f of v.files) {
        lines.push(`    ${chalk.gray('•')} ${f}`)
      }
    } else if (v.files.length > 5) {
      for (const f of v.files.slice(0, 3)) {
        lines.push(`    ${chalk.gray('•')} ${f}`)
      }
      lines.push(`    ${chalk.gray(`... and ${v.files.length - 3} more`)}`)
    }
  }

  return lines.join('\n')
}

// ─── Health Score Meter ────────────────────────────────────────────────────────

/**
 * Format health score as a visual meter.
 *
 * @example
 * formatHealthMeter(85) // '████████████████████░░░░░ 85/100'
 */
export function formatHealthMeter(score: number): string {
  const width = 25
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  const colorFn = score >= 80 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red
  return `  ${colorFn(bar)} ${chalk.bold(String(score))}${chalk.gray('/100')}`
}

// ─── Balance Meter ─────────────────────────────────────────────────────────────

/**
 * Format layer balance as a visual meter.
 *
 * @example
 * formatBalanceMeter(0.75) // '███████████████████░░░░░░ 0.75'
 */
export function formatBalanceMeter(balance: number): string {
  const width = 25
  const filled = Math.round(balance * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  const colorFn = balance >= 0.7 ? chalk.green : balance >= 0.4 ? chalk.yellow : chalk.red
  return `  ${colorFn(bar)} ${chalk.bold(String(balance))}`
}

// ─── Table Format ─────────────────────────────────────────────────────────────

/**
 * Format complete layer map result as a table.
 *
 * @example
 * formatLayerMapTable(result, false) // colored table output
 */
export function formatLayerMapTable(result: LayerMapResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(formatLayerDiagram(result.layers))
  sections.push(formatDependencyArrows(result.dependencies))
  sections.push(formatViolationsTable(result.violations))

  sections.push(chalk.bold('\n  Health Score'))
  sections.push(chalk.gray('  ─────────────────────────────────────────'))
  sections.push(formatHealthMeter(result.stats.healthScore))
  sections.push(`  Balance: ${formatBalanceMeter(result.stats.layerBalance)}`)

  sections.push(chalk.gray(`\n  Layers: ${result.stats.totalLayers}  Files: ${result.stats.totalFiles}  Lines: ${result.stats.totalLines}  Violations: ${result.stats.violationsCount}`))

  if (result.recommendations.length > 0) {
    sections.push(chalk.bold('\n  Recommendations'))
    sections.push(chalk.gray('  ─────────────────────────────────────────'))
    for (const rec of result.recommendations) {
      sections.push(`  ${chalk.gray('•')} ${rec}`)
    }
  }

  if (verbose) {
    sections.push(chalk.bold('\n  Layer Details'))
    sections.push(chalk.gray('  ─────────────────────────────────────────'))
    for (const layer of result.layers) {
      sections.push(`  ${chalk.bold(layer.name)} (${layer.fileCount} files, ${layer.totalLines} lines)`)
      for (const f of layer.files.slice(0, 5)) {
        sections.push(`    ${chalk.gray('•')} ${f}`)
      }
      if (layer.files.length > 5) {
        sections.push(`    ${chalk.gray(`... and ${layer.files.length - 5} more`)}`)
      }
    }
  }

  return sections.join('\n') + '\n'
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format layer map result as JSON.
 *
 * @example
 * formatLayerMapJson(result) // '{"layers":[...]...}'
 */
export function formatLayerMapJson(result: LayerMapResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── CSV Format ───────────────────────────────────────────────────────────────

/**
 * Format layer map result as CSV.
 *
 * @example
 * formatLayerMapCsv(result) // 'name,fileCount,totalLines,...'
 */
export function formatLayerMapCsv(result: LayerMapResult): string {
  const lines: string[] = ['type,name,value']

  for (const layer of result.layers) {
    lines.push(`layer,${layer.name},${layer.fileCount}`)
  }

  for (const dep of result.dependencies) {
    lines.push(`dependency,${dep.from}->${dep.to},${dep.count}`)
  }

  for (const v of result.violations) {
    lines.push(`violation,${v.from}->${v.to},${v.severity}`)
  }

  lines.push(`stat,totalLayers,${result.stats.totalLayers}`)
  lines.push(`stat,totalFiles,${result.stats.totalFiles}`)
  lines.push(`stat,violationsCount,${result.stats.violationsCount}`)
  lines.push(`stat,layerBalance,${result.stats.layerBalance}`)
  lines.push(`stat,healthScore,${result.stats.healthScore}`)

  return lines.join('\n')
}
