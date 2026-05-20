import chalk from 'chalk'

import type { Forecast, MaintenanceWindow, PredictResult, PredictStats, RiskFactor } from './predict-helpers.js'

// ─── Forecast Cards ───────────────────────────────────────────────────────────

/**
 * Format forecast cards.
 *
 * @example
 * formatForecastCards(forecasts)
 */
export function formatForecastCards(forecasts: Forecast[]): string {
  if (forecasts.length === 0) return chalk.gray('  No forecasts generated')

  const lines: string[] = []
  lines.push(chalk.bold('  Forecast Cards'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const f of forecasts) {
    const riskColor = f.riskLevel === 'critical'
      ? chalk.rgb(220, 50, 50)
      : f.riskLevel === 'high'
        ? chalk.rgb(255, 140, 0)
        : f.riskLevel === 'medium'
          ? chalk.rgb(255, 200, 50)
          : chalk.rgb(100, 200, 100)

    lines.push('')
    lines.push(`  ${chalk.bold(f.file)} ${riskColor(`[${f.riskLevel.toUpperCase()}]`)} ${chalk.gray(`score: ${f.maintenanceScore}`)}`)

    for (const p of f.predictions) {
      const typeColor = p.type === 'bug-risk'
        ? chalk.rgb(220, 50, 50)
        : p.type === 'refactor-needed'
          ? chalk.rgb(255, 140, 0)
          : p.type === 'breaking-change'
            ? chalk.rgb(200, 50, 200)
            : p.type === 'tech-debt'
              ? chalk.rgb(180, 130, 50)
              : p.type === 'performance'
                ? chalk.rgb(50, 150, 220)
                : chalk.rgb(150, 150, 150)

      lines.push(`    ${typeColor(p.type)} ${chalk.gray(`${p.confidence}%`)} ${chalk.dim(p.timeframe)}`)
      lines.push(`      ${chalk.dim(p.description)}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Risk Heatmap ──────────────────────────────────────────────────────────────

/**
 * Format risk heatmap.
 *
 * @example
 * formatRiskHeatmap(forecasts)
 */
export function formatRiskHeatmap(forecasts: Forecast[]): string {
  if (forecasts.length === 0) return chalk.gray('  No risk data')

  const lines: string[] = []
  lines.push(chalk.bold('  Risk Heatmap'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const f of forecasts) {
    const bar = '█'.repeat(Math.min(20, Math.round(f.predictions.length * 2)))
    const color = f.riskLevel === 'critical'
      ? chalk.rgb(220, 50, 50)
      : f.riskLevel === 'high'
        ? chalk.rgb(255, 140, 0)
        : f.riskLevel === 'medium'
          ? chalk.rgb(255, 200, 50)
          : chalk.rgb(100, 200, 100)

    lines.push(`  ${chalk.dim(f.file.padEnd(30))} ${color(bar)} ${f.maintenanceScore}/100`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Maintenance Timeline ─────────────────────────────────────────────────────

/**
 * Format maintenance windows timeline.
 *
 * @example
 * formatMaintenanceTimeline(windows)
 */
export function formatMaintenanceTimeline(windows: MaintenanceWindow[]): string {
  if (windows.length === 0) return chalk.gray('  No maintenance windows predicted')

  const lines: string[] = []
  lines.push(chalk.bold('  Maintenance Timeline'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const w of windows) {
    const effortColor = w.estimatedEffort === 'major'
      ? chalk.rgb(220, 50, 50)
      : w.estimatedEffort === 'significant'
        ? chalk.rgb(255, 140, 0)
        : w.estimatedEffort === 'moderate'
          ? chalk.rgb(255, 200, 50)
          : chalk.rgb(100, 200, 100)

    lines.push(`  ${chalk.bold(w.file)} ${effortColor(`[${w.estimatedEffort}]`)} ${chalk.gray(`urgency: ${w.urgency}`)}`)
    lines.push(`    ${chalk.dim(w.reason)}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Tech Debt Meter ───────────────────────────────────────────────────────────

/**
 * Format tech debt index meter.
 *
 * @example
 * formatTechDebtMeter(42)
 */
export function formatTechDebtMeter(index: number): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Tech Debt Index'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const filled = Math.round(index / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = index > 60
    ? chalk.rgb(220, 50, 50)
    : index > 30
      ? chalk.rgb(255, 165, 0)
      : chalk.rgb(50, 205, 50)

  lines.push(`  ${color(bar)} ${index}/100`)
  lines.push('')
  return lines.join('\n')
}

// ─── Risk Factor Table ─────────────────────────────────────────────────────────

/**
 * Format risk factors.
 *
 * @example
 * formatRiskFactors(factors)
 */
export function formatRiskFactors(factors: RiskFactor[]): string {
  if (factors.length === 0) return chalk.gray('  No significant risk factors')

  const lines: string[] = []
  lines.push(chalk.bold('  Risk Factors'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const top = factors.slice(0, 10)
  for (const f of top) {
    const weightBar = '█'.repeat(f.weight) + '░'.repeat(10 - f.weight)
    const color = f.weight >= 8
      ? chalk.rgb(220, 50, 50)
      : f.weight >= 5
        ? chalk.rgb(255, 140, 0)
        : chalk.rgb(100, 200, 100)

    lines.push(`  ${color(weightBar)} ${chalk.bold(f.name)} ${chalk.dim(f.file)}`)
    lines.push(`    ${chalk.dim(f.description)}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format predict stats.
 *
 * @example
 * formatPredictStats(stats)
 */
export function formatPredictStats(stats: PredictStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Prediction Stats'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Total forecasts:    ${stats.totalForecasts}`)
  lines.push(`  Low risk:           ${chalk.rgb(100, 200, 100)(String(stats.lowRiskCount))}`)
  lines.push(`  Medium risk:        ${chalk.rgb(255, 200, 50)(String(stats.mediumRiskCount))}`)
  lines.push(`  High risk:          ${chalk.rgb(255, 140, 0)(String(stats.highRiskCount))}`)
  lines.push(`  Critical risk:      ${chalk.rgb(220, 50, 50)(String(stats.criticalRiskCount))}`)
  lines.push(`  Avg maintenance:    ${stats.avgMaintenanceScore}/100`)
  lines.push(`  Most at risk:       ${stats.mostAtRiskFile}`)
  lines.push(`  Safest file:        ${stats.safestFile}`)
  lines.push(`  Top risk type:      ${stats.topRiskType}`)
  lines.push(`  Immediate actions:  ${stats.immediateActionsNeeded}`)
  lines.push(`  Tech debt index:    ${stats.estimatedTechDebtIndex}/100`)
  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X', 'Refactor Y'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${chalk.bold(`${i + 1}.`)} ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full predict result as table.
 *
 * @example
 * formatPredictTable(result)
 */
export function formatPredictTable(result: PredictResult): string {
  const parts: string[] = []
  parts.push(formatForecastCards(result.forecasts))
  parts.push(formatRiskHeatmap(result.forecasts))
  parts.push(formatMaintenanceTimeline(result.maintenanceWindows))
  parts.push(formatTechDebtMeter(result.stats.estimatedTechDebtIndex))
  parts.push(formatRiskFactors(result.riskFactors))
  parts.push(formatPredictStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format predict result as JSON.
 *
 * @example
 * formatPredictJSON(result)
 */
export function formatPredictJSON(result: PredictResult): string {
  return JSON.stringify(result, null, 2)
}
