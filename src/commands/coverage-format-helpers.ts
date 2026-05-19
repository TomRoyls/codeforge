import chalk from 'chalk'

import type { CoverageResult, CoverageStats } from './coverage-helpers.js'

// ─── Color helpers ──────────────────────────────────────

function coverageColor(pct: number): string {
  if (pct >= 80) return chalk.green(`${pct}%`)
  if (pct >= 50) return chalk.rgb(255, 165, 0)(`${pct}%`)
  return chalk.red(`${pct}%`)
}

function coverageBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

function priorityLabel(p: 'high' | 'medium' | 'low'): string {
  switch (p) {
    case 'high': return chalk.red('HIGH')
    case 'medium': return chalk.rgb(255, 165, 0)('MED')
    case 'low': return chalk.green('LOW')
  }
}

// ─── formatCoverageTable ────────────────────────────────

/**
 * Format coverage result as a colored table.
 *
 * @example
 * ```ts
 * const output = formatCoverageTable(result, false)
 * ```
 */
export function formatCoverageTable(result: CoverageResult, verbose: boolean): string {
  const lines: string[] = []
  const { stats, mappings, suggestions } = result

  lines.push('')
  lines.push(chalk.bold('  Test Coverage Estimation'))
  lines.push(chalk.gray('  ───────────────────────────────────'))
  lines.push('')

  lines.push(`  Coverage:    ${coverageColor(stats.coveragePercentage)}`)
  lines.push(`  Files:       ${chalk.cyan(String(stats.coveredFiles))}/${chalk.white(String(stats.totalSourceFiles))} covered`)
  lines.push(`  Test files:  ${chalk.cyan(String(stats.totalTestFiles))}`)
  lines.push(`  Ratio:       ${chalk.white(String(stats.testToSourceRatio))}`)
  lines.push('')

  if (Object.keys(stats.byDirectory).length > 0) {
    lines.push(chalk.bold('  By Directory'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const [dir, data] of Object.entries(stats.byDirectory)) {
      const pct = data.source > 0 ? Math.round((data.test / data.source) * 1000) / 10 : 0
      lines.push(`  ${chalk.white(dir.padEnd(20))} ${coverageBar(pct, 20)} ${coverageColor(pct)}`)
    }
    lines.push('')
  }

  if (verbose && mappings.length > 0) {
    lines.push(chalk.bold('  File Mappings'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const m of mappings) {
      const icon = m.covered ? chalk.green('✓') : chalk.red('✗')
      const type = m.coverageType !== 'none' ? chalk.gray(` (${m.coverageType})`) : ''
      lines.push(`  ${icon} ${chalk.white(m.sourceFile)}${type}`)
      for (const tf of m.testFiles) {
        lines.push(`    ${chalk.gray('→')} ${chalk.cyan(tf)}`)
      }
    }
    lines.push('')
  }

  if (stats.uncoveredModules.length > 0) {
    lines.push(chalk.bold('  Uncovered Modules'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const mod of stats.uncoveredModules) {
      lines.push(`  ${chalk.red('✗')} ${chalk.white(mod)}`)
    }
    lines.push('')
  }

  if (suggestions.length > 0) {
    lines.push(chalk.bold('  Suggestions'))
    lines.push(chalk.gray('  ───────────────────────────────────'))
    for (const s of suggestions.slice(0, 10)) {
      lines.push(`  ${priorityLabel(s.priority)} ${chalk.white(s.file)} ${chalk.gray(`(~${s.estimatedEffort}h)`)} - ${s.reason}`)
    }
    if (suggestions.length > 10) {
      lines.push(chalk.gray(`  ... and ${suggestions.length - 10} more`))
    }
    lines.push('')
  }

  lines.push(chalk.gray(`  Total: ${stats.totalSourceFiles} source, ${stats.totalTestFiles} test, ${stats.uncoveredFiles} uncovered`))
  lines.push('')

  return lines.join('\n')
}

// ─── formatCoverageJson ─────────────────────────────────

/**
 * Format coverage result as JSON string.
 *
 * @example
 * ```ts
 * const json = formatCoverageJson(result)
 * ```
 */
export function formatCoverageJson(result: CoverageResult): string {
  return JSON.stringify(result, null, 2)
}
