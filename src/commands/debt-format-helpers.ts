import chalk from 'chalk'

import type { ChalkColorFunction } from '../types/chalk.js'
import type { DebtHistoryEntry, DebtReport } from './debt-helpers.js'

import {
  DATE_FIELD_WIDTH,
  DEBT_COMPLEXITY_THRESHOLD_HIGH,
  DEBT_DEPENDENCIES_THRESHOLD_HIGH,
  DEBT_OVERALL_THRESHOLD_HIGH,
  DEBT_SECURITY_THRESHOLD_HIGH,
  MAX_RECOMMENDATIONS,
  TABLE_DASH_SEPARATOR_WIDTH,
} from '../utils/constants.js'

// ============================================================================
// Color and Formatting Helpers
// ============================================================================

export function getDebtColor(score: number): ChalkColorFunction {
  if (score <= 5) return chalk.green
  if (score <= 15) return chalk.yellow

  return chalk.red
}

export function formatDebt(score: number): string {
  const colorFn = getDebtColor(score)
  return colorFn(score.toString().padStart(3))
}

// ============================================================================
// Recommendations
// ============================================================================

export function getRecommendations(report: DebtReport): string[] {
  const recommendations: string[] = []

  if (report.breakdown.security > DEBT_SECURITY_THRESHOLD_HIGH) {
    recommendations.push('Address security issues - these have the highest debt cost')
  }

  if (report.breakdown.complexity > DEBT_COMPLEXITY_THRESHOLD_HIGH) {
    recommendations.push('Reduce code complexity by refactoring large functions')
  }

  if (report.breakdown.dependencies > DEBT_DEPENDENCIES_THRESHOLD_HIGH) {
    recommendations.push('Review and clean up circular dependencies')
  }

  if (report.breakdown.documentation > DEBT_COMPLEXITY_THRESHOLD_HIGH) {
    recommendations.push('Add JSDoc comments to improve code maintainability')
  }

  if (report.overall > DEBT_OVERALL_THRESHOLD_HIGH) {
    recommendations.push('Consider dedicating time to debt reduction in your next sprint')
  }

  return recommendations.slice(0, MAX_RECOMMENDATIONS)
}

// ============================================================================
// Report and History Display
// ============================================================================

export function formatReportLines(report: DebtReport, verbose: boolean): string[] {
  const lines: string[] = []
  const colorFn = getDebtColor(report.overall)

  lines.push(
    '',
    chalk.bold('  Technical Debt Analysis'),
    '',
    `  ${colorFn(`  Debt Score: ${report.overall}`)}`,
  )

  if (report.trend.previous !== null) {
    const trendIcon =
      report.trend.direction === 'decreasing'
        ? '↓'
        : report.trend.direction === 'increasing'
          ? '↑'
          : '→'
    const trendColor =
      report.trend.direction === 'decreasing'
        ? chalk.green
        : report.trend.direction === 'increasing'
          ? chalk.red
          : chalk.yellow

    lines.push(
      `  ${trendColor(`Trend: ${trendIcon} ${report.trend.change > 0 ? '+' : ''}${report.trend.change}`)}`,
    )
  }

  lines.push('')

  if (verbose) {
    lines.push(
      chalk.gray('  Category Breakdown:'),
      `    Complexity:     ${formatDebt(report.breakdown.complexity)}`,
      `    Dependencies:   ${formatDebt(report.breakdown.dependencies)}`,
      `    Documentation:  ${formatDebt(report.breakdown.documentation)}`,
      `    Patterns:       ${formatDebt(report.breakdown.patterns)}`,
      `    Security:       ${formatDebt(report.breakdown.security)}`,
      '',
      chalk.gray('  Debt Interest (time cost):'),
      `    Weekly:   ${report.interest.weekly}h`,
      `    Monthly:  ${report.interest.monthly}h`,
      `    Annual:   ${report.interest.annual}h`,
      '',
      chalk.gray('  Analysis:'),
      `    Files analyzed: ${report.filesAnalyzed}`,
      '',
    )
  }

  const recommendations = getRecommendations(report)
  if (recommendations.length > 0) {
    lines.push(chalk.gray('  Recommendations:'))
    for (const rec of recommendations) {
      lines.push(`    ${chalk.yellow('•')} ${rec}`)
    }

    lines.push('')
  }

  return lines
}

export function formatHistoryLines(history: DebtHistoryEntry[]): string[] {
  const lines: string[] = []

  lines.push('', chalk.bold('  Technical Debt History'), '')

  if (history.length === 0) {
    lines.push(
      chalk.yellow('  No history found. Run `codeforge debt --save` to start tracking.'),
      '',
    )
    return lines
  }

  lines.push(
    chalk.gray('  Date                 | Debt | Trend'),
    chalk.gray('  ' + '-'.repeat(TABLE_DASH_SEPARATOR_WIDTH)),
  )

  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i]!
    const date = new Date(entry.timestamp).toLocaleDateString()
    const colorFn = getDebtColor(entry.overall)

    let trendStr = '-'
    if (i > 0) {
      const prev = history[i - 1]!.overall
      const change = entry.overall - prev

      if (change < 0) {
        trendStr = chalk.green(`↓ ${Math.abs(change)}`)
      } else if (change > 0) {
        trendStr = chalk.red(`↑ ${change}`)
      }
    }

    lines.push(
      `  ${date.padEnd(DATE_FIELD_WIDTH)} | ${colorFn(entry.overall.toString().padStart(4))} | ${trendStr}`,
    )
  }

  lines.push('')

  const latest = history.at(-1)!
  const oldest = history.at(0)!
  const totalChange = latest.overall - oldest.overall

  if (totalChange < 0) {
    lines.push(
      chalk.green(`  Debt reduced by ${Math.abs(totalChange)} points since tracking started`),
    )
  } else if (totalChange > 0) {
    lines.push(chalk.red(`  Debt increased by ${totalChange} points since tracking started`))
  } else {
    lines.push(chalk.yellow('  Debt has remained stable'))
  }

  lines.push('')

  return lines
}
