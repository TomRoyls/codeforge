import chalk from 'chalk'

import type {
  CapsuleStats,
  CurrentState,
  GrowthMetrics,
  Prediction,
  TimeCapsuleResult,
  TrendIndicator,
} from './time-capsule-helpers.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function healthColor(score: number, text: string): string {
  if (score >= 70) return chalk.rgb(76, 175, 80)(text)
  if (score >= 40) return chalk.rgb(255, 193, 7)(text)
  return chalk.rgb(244, 67, 54)(text)
}

function trendArrow(direction: string): string {
  switch (direction) {
    case 'improving': return chalk.rgb(76, 175, 80)('↑')
    case 'declining': return chalk.rgb(244, 67, 54)('↓')
    default: return chalk.rgb(158, 158, 158)('→')
  }
}

function maturityBadge(maturity: string): string {
  switch (maturity) {
    case 'infant': return chalk.rgb(158, 158, 158)('🌱 Infant')
    case 'child': return chalk.rgb(76, 175, 80)('🌿 Child')
    case 'adolescent': return chalk.rgb(255, 193, 7)('🌳 Adolescent')
    case 'adult': return chalk.rgb(33, 150, 243)('🏛 Adult')
    case 'elder': return chalk.rgb(156, 39, 176)('📜 Elder')
    default: return maturity
  }
}

// ─── State Portrait ────────────────────────────────────────────────────────────

/**
 * Format current state portrait.
 *
 * @example
 * formatStatePortrait(state)
 */
export function formatStatePortrait(state: CurrentState): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Current State'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Health:     ${healthColor(state.health, `${state.health}%`)}`)
  lines.push(`  Maturity:   ${maturityBadge(state.maturity)}`)
  lines.push(`  Personality:${state.personality.join(', ')}`)

  if (state.strengths.length > 0) {
    lines.push(chalk.rgb(76, 175, 80)('  Strengths:'))
    for (const s of state.strengths) lines.push(`    ✓ ${s}`)
  }

  if (state.weaknesses.length > 0) {
    lines.push(chalk.rgb(244, 67, 54)('  Weaknesses:'))
    for (const w of state.weaknesses) lines.push(`    ✗ ${w}`)
  }

  if (state.achievements.length > 0) {
    lines.push(chalk.rgb(255, 193, 7)('  Achievements:'))
    for (const a of state.achievements) lines.push(`    ★ ${a}`)
  }

  if (state.concerns.length > 0) {
    lines.push(chalk.rgb(255, 87, 34)('  Concerns:'))
    for (const c of state.concerns) lines.push(`    ⚠ ${c}`)
  }

  return lines.join('\n')
}

// ─── Metrics Dashboard ─────────────────────────────────────────────────────────

/**
 * Format growth metrics dashboard.
 *
 * @example
 * formatMetricsDashboard(metrics)
 */
export function formatMetricsDashboard(metrics: GrowthMetrics): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Growth Metrics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Lines:        ${metrics.totalLines.toLocaleString()}`)
  lines.push(`  Total Files:        ${metrics.totalFiles}`)
  lines.push(`  Total Functions:    ${metrics.totalFunctions}`)
  lines.push(`  Total Exports:      ${metrics.totalExports}`)
  lines.push(`  Avg Complexity:     ${metrics.avgComplexity}`)
  lines.push(`  Avg Documentation:  ${metrics.avgDocumentation}%`)
  lines.push(`  Test Ratio:         ${Math.round(metrics.testRatio * 100)}%`)
  lines.push(`  Dependency Ratio:   ${metrics.dependencyRatio}`)
  lines.push(`  Coupling Index:     ${metrics.couplingIndex}%`)
  lines.push(`  Consistency Score:  ${metrics.consistencyScore}%`)
  return lines.join('\n')
}

// ─── Trend Indicators ──────────────────────────────────────────────────────────

/**
 * Format trend indicators.
 *
 * @example
 * formatTrends(trends)
 */
export function formatTrends(trends: TrendIndicator[]): string {
  if (trends.length === 0) return chalk.gray('  No trend data available')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Trends'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const trend of trends) {
    const arrow = trendArrow(trend.direction)
    const dir = trend.direction.padEnd(10)
    lines.push(`  ${arrow} ${trend.metric.padEnd(20)} ${dir} confidence: ${trend.confidence}%`)
  }

  return lines.join('\n')
}

// ─── Predictions ───────────────────────────────────────────────────────────────

/**
 * Format predictions.
 *
 * @example
 * formatPredictions(predictions)
 */
export function formatPredictions(predictions: Prediction[]): string {
  if (predictions.length === 0) return chalk.gray('  No predictions')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Predictions'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const pred of predictions) {
    const conf = pred.confidence >= 70
      ? chalk.rgb(76, 175, 80)(`[${pred.confidence}%]`)
      : chalk.rgb(255, 193, 7)(`[${pred.confidence}%]`)
    lines.push(`  ${conf} ${pred.prediction}`)
    lines.push(`     Category: ${pred.category}  Timeframe: ${pred.timeframe}`)
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format capsule stats.
 *
 * @example
 * formatCapsuleStats(stats)
 */
export function formatCapsuleStats(stats: CapsuleStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Capsule Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Capsule Date:       ${stats.capsuleDate}`)
  lines.push(`  Health Trend:       ${stats.healthTrend}`)
  lines.push(`  Maturity Index:     ${stats.maturityIndex}%`)
  lines.push(`  Consistency Index:  ${stats.consistencyIndex}%`)
  lines.push(`  Resilience Score:   ${stats.resilienceScore}%`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix tests'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full time capsule result as table.
 *
 * @example
 * formatTimeCapsuleTable(result)
 */
export function formatTimeCapsuleTable(result: TimeCapsuleResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  ⏳ Time Capsule'))
  parts.push(chalk.gray(' ═'.repeat(50)))
  parts.push(`  ${chalk.bold(result.snapshot.summary)}`)
  parts.push(`  Version: ${result.snapshot.version}  |  ${result.snapshot.timestamp.split('T')[0]}`)
  parts.push(formatStatePortrait(result.state))
  parts.push(formatMetricsDashboard(result.metrics))
  parts.push(formatTrends(result.trends))
  parts.push(formatPredictions(result.predictions))
  parts.push(formatCapsuleStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format full time capsule result as JSON.
 *
 * @example
 * formatTimeCapsuleJSON(result)
 */
export function formatTimeCapsuleJSON(result: TimeCapsuleResult): string {
  return JSON.stringify(result, null, 2)
}
