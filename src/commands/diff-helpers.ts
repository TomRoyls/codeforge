import chalk from 'chalk'

import { type RuleViolation } from '../ast/visitor.js'
import { MAX_DIFF_VIOLATIONS } from '../utils/constants.js'

export interface DiffReport {
  added: RuleViolation[]
  base: string
  head: string
  improved: RuleViolation[]
  removed: RuleViolation[]
  summary: {
    addedCount: number
    improvedCount: number
    netChange: number
    removedCount: number
    totalBase: number
    totalHead: number
  }
}

export function createViolationKey(v: RuleViolation): string {
  return `${v.filePath}:${v.range.start.line}:${v.ruleId}`
}

export function compareViolations(
  baseViolations: RuleViolation[],
  headViolations: RuleViolation[],
): { added: RuleViolation[]; improved: RuleViolation[]; removed: RuleViolation[] } {
  const baseMap = new Map<string, RuleViolation>()
  for (const v of baseViolations) {
    baseMap.set(createViolationKey(v), v)
  }

  const headMap = new Map<string, RuleViolation>()
  for (const v of headViolations) {
    headMap.set(createViolationKey(v), v)
  }

  const added: RuleViolation[] = []
  const removed: RuleViolation[] = []
  const improved: RuleViolation[] = []

  for (const [key, v] of headMap) {
    if (!baseMap.has(key)) {
      added.push(v)
    }
  }

  for (const [key, v] of baseMap) {
    if (!headMap.has(key)) {
      removed.push(v)
    }
  }

  return { added, improved, removed }
}

export function countByRule(violations: RuleViolation[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const v of violations) {
    counts[v.ruleId] = (counts[v.ruleId] ?? 0) + 1
  }

  return counts
}

export function countBySeverity(violations: RuleViolation[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const v of violations) {
    counts[v.severity] = (counts[v.severity] ?? 0) + 1
  }

  return counts
}

export function buildDiffReport(
  base: string,
  head: string,
  baseViolations: RuleViolation[],
  headViolations: RuleViolation[],
): DiffReport {
  const { added, improved, removed } = compareViolations(baseViolations, headViolations)
  const netChange = added.length - removed.length

  return {
    added,
    base,
    head,
    improved,
    removed,
    summary: {
      addedCount: added.length,
      improvedCount: improved.length,
      netChange,
      removedCount: removed.length,
      totalBase: baseViolations.length,
      totalHead: headViolations.length,
    },
  }
}

export function parseGitDiffOutput(output: string): string[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function formatSummary(report: DiffReport): string {
  const { summary } = report
  const netColor =
    summary.netChange < 0 ? chalk.green : summary.netChange > 0 ? chalk.red : chalk.gray

  const lines: string[] = []

  lines.push(
    '',
    chalk.bold('  Violation Diff Analysis'),
    '',
    chalk.gray(`  Comparing: ${report.base} → ${report.head}`),
    '',
    chalk.gray('  Summary:'),
    `    Base violations:  ${summary.totalBase}`,
    `    Head violations:  ${summary.totalHead}`,
    `    Added:            ${chalk.red(`+${summary.addedCount}`)}`,
    `    Removed:          ${chalk.green(`-${summary.removedCount}`)}`,
    `    Net change:       ${netColor(summary.netChange >= 0 ? `+${summary.netChange}` : summary.netChange.toString())}`,
    '',
  )

  if (summary.netChange < 0) {
    lines.push(
      chalk.green(`  ✓ Code quality improved! ${Math.abs(summary.netChange)} violations removed.`),
    )
  } else if (summary.netChange > 0) {
    lines.push(
      chalk.yellow(`  ⚠ Code quality regressed. ${summary.netChange} new violations added.`),
    )
  } else {
    lines.push(chalk.gray('  → No net change in violations.'))
  }

  lines.push('')

  return lines.join('\n')
}

export function displayAddedViolations(
  violations: RuleViolation[],
  logFn: (msg?: string) => void,
): void {
  if (violations.length === 0) return

  logFn(chalk.red('  Added Violations:'))
  for (const v of violations.slice(0, MAX_DIFF_VIOLATIONS)) {
    logFn(`    ${chalk.red('+')} ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
  }

  if (violations.length > MAX_DIFF_VIOLATIONS) {
    logFn(chalk.gray(`    ... and ${violations.length - MAX_DIFF_VIOLATIONS} more`))
  }

  logFn('')
}

export function displayRemovedViolations(
  violations: RuleViolation[],
  logFn: (msg?: string) => void,
): void {
  if (violations.length === 0) return

  logFn(chalk.green('  Removed Violations:'))
  for (const v of violations.slice(0, MAX_DIFF_VIOLATIONS)) {
    logFn(`    ${chalk.green('-')} ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
  }

  if (violations.length > MAX_DIFF_VIOLATIONS) {
    logFn(chalk.gray(`    ... and ${violations.length - MAX_DIFF_VIOLATIONS} more`))
  }

  logFn('')
}

export function displayDiffReport(
  report: DiffReport,
  verbose: boolean,
  logFn: (msg?: string) => void,
): void {
  const { summary } = report
  const netColor =
    summary.netChange < 0 ? chalk.green : summary.netChange > 0 ? chalk.red : chalk.gray

  logFn('')
  logFn(chalk.bold('  Violation Diff Analysis'))
  logFn('')
  logFn(chalk.gray(`  Comparing: ${report.base} → ${report.head}`))
  logFn('')

  logFn(chalk.gray('  Summary:'))
  logFn(`    Base violations:  ${summary.totalBase}`)
  logFn(`    Head violations:  ${summary.totalHead}`)
  logFn(`    Added:            ${chalk.red(`+${summary.addedCount}`)}`)
  logFn(`    Removed:          ${chalk.green(`-${summary.removedCount}`)}`)
  logFn(
    `    Net change:       ${netColor(summary.netChange >= 0 ? `+${summary.netChange}` : summary.netChange.toString())}`,
  )
  logFn('')

  if (verbose) {
    if (report.added.length > 0) {
      logFn(chalk.red('  Added Violations:'))
      for (const v of report.added.slice(0, MAX_DIFF_VIOLATIONS)) {
        logFn(`    ${chalk.red('+')} ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
      }

      if (report.added.length > MAX_DIFF_VIOLATIONS) {
        logFn(chalk.gray(`    ... and ${report.added.length - MAX_DIFF_VIOLATIONS} more`))
      }

      logFn('')
    }

    if (report.removed.length > 0) {
      logFn(chalk.green('  Removed Violations:'))
      for (const v of report.removed.slice(0, MAX_DIFF_VIOLATIONS)) {
        logFn(`    ${chalk.green('-')} ${v.filePath}:${v.range.start.line} [${v.ruleId}]`)
      }

      if (report.removed.length > MAX_DIFF_VIOLATIONS) {
        logFn(chalk.gray(`    ... and ${report.removed.length - MAX_DIFF_VIOLATIONS} more`))
      }

      logFn('')
    }
  }

  if (summary.netChange < 0) {
    logFn(
      chalk.green(`  ✓ Code quality improved! ${Math.abs(summary.netChange)} violations removed.`),
    )
  } else if (summary.netChange > 0) {
    logFn(chalk.yellow(`  ⚠ Code quality regressed. ${summary.netChange} new violations added.`))
  } else {
    logFn(chalk.gray('  → No net change in violations.'))
  }

  logFn('')
}
