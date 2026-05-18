import chalk from 'chalk'

import { formatNumber } from '../utils/format-utils.js'
import type { FileInspection } from './inspect-helpers.js'

function colorForComplexity(complexity: number): typeof chalk {
  if (complexity > 20) return chalk.red
  if (complexity > 10) return chalk.yellow
  return chalk.green
}

function colorForMaintainability(index: number): typeof chalk {
  if (index < 40) return chalk.red
  if (index < 70) return chalk.yellow
  return chalk.green
}

export function formatInspectionTable(inspection: FileInspection, verbose: boolean): string {
  const lines: string[] = [
    chalk.bold('\n📋 File Inspection Report\n'),
    `${chalk.bold('File:')} ${chalk.cyan(inspection.path)}`,
    `${chalk.bold('Language:')} ${inspection.language}`,
  ]

  lines.push('')
  lines.push(chalk.dim('Size & Lines:'))
  lines.push(`  Size: ${formatNumber(inspection.size)} bytes`)
  lines.push(`  Total lines: ${formatNumber(inspection.lines.total)}`)
  lines.push(`  Code lines: ${formatNumber(inspection.lines.code)}`)
  lines.push(`  Blank lines: ${formatNumber(inspection.lines.blank)}`)
  lines.push(`  Comment lines: ${formatNumber(inspection.lines.comment)}`)

  if (inspection.imports.length > 0) {
    lines.push('')
    lines.push(chalk.dim('Dependencies:'))
    for (const imp of inspection.imports) {
      const lineStr = verbose ? chalk.gray(` L${imp.line}`) : ''
      const typeStr = imp.isTypeOnly ? chalk.dim(' (type)') : ''
      const itemsStr = imp.items.length > 0 ? ` (${imp.items.length} items)` : ''
      lines.push(`  ${chalk.cyan(imp.source)}${itemsStr}${typeStr}${lineStr}`)
    }
  }

  if (inspection.exports.length > 0) {
    lines.push('')
    lines.push(chalk.dim('Exports:'))
    for (const exp of inspection.exports) {
      const lineStr = verbose ? chalk.gray(` L${exp.line}`) : ''
      lines.push(`  ${chalk.green(exp.name)} ${chalk.dim(`[${exp.type}]`)}${lineStr}`)
    }
  }

  if (inspection.functions.length > 0) {
    lines.push('')
    lines.push(chalk.dim('Functions:'))
    for (const fn of inspection.functions) {
      const lineStr = verbose ? chalk.gray(` L${fn.line}`) : ''
      const asyncStr = fn.isAsync ? chalk.yellow(' async') : ''
      const exportStr = fn.isExported ? chalk.green(' exported') : ''
      lines.push(`  ${chalk.bold(fn.name)}${asyncStr}${exportStr} (${fn.params} params)${lineStr}`)
    }
  }

  if (inspection.classes.length > 0) {
    lines.push('')
    lines.push(chalk.dim('Classes:'))
    for (const cls of inspection.classes) {
      const lineStr = verbose ? chalk.gray(` L${cls.line}`) : ''
      const exportStr = cls.isExported ? chalk.green(' exported') : ''
      lines.push(`  ${chalk.bold(cls.name)} (${cls.methods} methods)${exportStr}${lineStr}`)
    }
  }

  lines.push('')
  lines.push(chalk.dim('Metrics:'))
  const complexityColor = colorForComplexity(inspection.metrics.complexity)
  lines.push(`  Cyclomatic complexity: ${complexityColor.bold(formatNumber(inspection.metrics.complexity))}`)

  const miColor = colorForMaintainability(inspection.metrics.maintainabilityIndex)
  lines.push(`  Maintainability index: ${miColor.bold(inspection.metrics.maintainabilityIndex.toFixed(1))}`)

  lines.push(`  Avg LOC per function: ${chalk.yellow(formatNumber(inspection.metrics.linesOfCodePerFunction))}`)
  lines.push(`  Dependencies: ${chalk.yellow(formatNumber(inspection.metrics.dependencyCount))}`)
  lines.push(`  Exports: ${chalk.yellow(formatNumber(inspection.metrics.exportCount))}`)

  return lines.join('\n')
}

export function formatInspectionOutput(
  inspection: FileInspection,
  format: string,
  verbose: boolean,
): string {
  if (format === 'json') {
    return JSON.stringify(inspection, null, 2)
  }
  return formatInspectionTable(inspection, verbose)
}
