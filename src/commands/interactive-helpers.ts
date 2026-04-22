/**
 * Pure helper functions for the interactive command.
 *
 * Extracted from Interactive class to enable independent testing and reuse.
 * All functions are stateless — they accept parameters and return results.
 */
import chalk from 'chalk'
import * as fs from 'node:fs/promises'

import type { RuleViolation } from '../ast/visitor.js'

import {
  SEVERITY_ERROR,
  SEVERITY_INFO,
  SEVERITY_WARNING,
  TABLE_DASH_SEPARATOR_WIDTH,
} from '../utils/constants.js'
import { colorizeSeverity } from '../utils/formatting.js'

const formatSeverity = colorizeSeverity

export { formatSeverity }

export interface FixResult {
  applied: number
  skipped: number
  total: number
}

export function filterBySeverity(
  violations: RuleViolation[],
  minSeverity: 'error' | 'info' | 'warning',
): RuleViolation[] {
  const severityOrder = { error: SEVERITY_ERROR, info: SEVERITY_INFO, warning: SEVERITY_WARNING }

  return violations.filter((v) => severityOrder[v.severity] >= severityOrder[minSeverity])
}

export function displayViolation(
  violation: RuleViolation,
  index: number,
  total: number,
  verbose: boolean,
): string[] {
  const lines: string[] = []

  lines.push(
    '',
    chalk.bold(`  Violation ${index + 1}/${total}`),
    chalk.gray('  ' + '─'.repeat(TABLE_DASH_SEPARATOR_WIDTH)),
    `  ${chalk.red('File:')} ${violation.filePath}:${violation.range.start.line}`,
    `  ${chalk.red('Rule:')} ${violation.ruleId}`,
    `  ${chalk.red('Severity:')} ${formatSeverity(violation.severity)}`,
    `  ${chalk.red('Message:')} ${violation.message}`,
  )

  if (verbose && violation.suggestion) {
    lines.push(`  ${chalk.green('Suggestion:')} ${violation.suggestion}`)
  }

  lines.push('')

  return lines
}

export async function applyFix(filePath: string, violation: RuleViolation): Promise<boolean> {
  if (!violation.suggestion) {
    return false
  }

  try {
    const content = await fs.readFile(filePath, 'utf8')
    const lines = content.split('\n')
    const lineIndex = violation.range.start.line - 1

    if (lineIndex < 0 || lineIndex >= lines.length) {
      return false
    }

    const originalLine = lines[lineIndex]
    if (originalLine === undefined) {
      return false
    }

    lines[lineIndex] = violation.suggestion
    await fs.writeFile(filePath, lines.join('\n'), 'utf8')
    return true
  } catch {
    return false
  }
}

export function formatSummary(result: FixResult): string[] {
  const lines: string[] = []

  lines.push(
    '',
    chalk.bold('  Summary:'),
    `    Applied: ${chalk.green(result.applied.toString())}`,
    `    Skipped: ${chalk.yellow(result.skipped.toString())}`,
    `    Total:   ${result.total}`,
    '',
  )

  return lines
}
