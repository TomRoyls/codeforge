import chalk from 'chalk'

import type { BoundaryViolation, DriftIndicator, DriftResult, DriftStats, ModuleBoundary } from './drift-helpers.js'

// ─── Severity Colors ──────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, (s: string) => string> = {
  critical: chalk.rgb(255, 80, 80),
  warning: chalk.rgb(255, 200, 50),
  high: chalk.rgb(255, 100, 80),
  medium: chalk.rgb(255, 200, 50),
  low: chalk.rgb(100, 200, 150),
}

// ─── Format Boundary Map ──────────────────────────────────────────────────────

/**
 * Format module boundaries as a visual map.
 *
 * @example
 * formatBoundaryMap(boundaries) // formatted string
 */
export function formatBoundaryMap(boundaries: ModuleBoundary[]): string {
  if (boundaries.length === 0) return chalk.rgb(100, 200, 150)('  No modules detected.')

  const lines: string[] = [chalk.bold('\n  Module Boundaries\n')]

  for (const b of boundaries) {
    const hasViolations = b.violations.length > 0
    const icon = hasViolations ? chalk.rgb(255, 80, 80)('✕') : chalk.rgb(80, 255, 120)('✓')
    const name = chalk.bold(b.name.padEnd(14))
    const purpose = chalk.rgb(150, 150, 150)(b.intendedPurpose)
    lines.push(`  ${icon} ${name} ${purpose}`)

    if (b.actualDependencies.length > 0) {
      const deps = b.actualDependencies.map((d) => {
        const isViolation = !b.allowedDependencies.includes(d)
        return isViolation ? chalk.rgb(255, 80, 80)(d) : chalk.rgb(100, 200, 150)(d)
      }).join(', ')
      lines.push(`    deps: ${deps}`)
    }

    for (const v of b.violations) {
      const sevColor = SEVERITY_COLORS[v.severity] ?? chalk.white
      lines.push(`    ${sevColor(`→ ${v.type}: ${v.description}`)}`)
    }
  }

  return lines.join('\n')
}

// ─── Format Violations ────────────────────────────────────────────────────────

/**
 * Format boundary violations list.
 *
 * @example
 * formatViolations(violations) // formatted string
 */
export function formatViolations(violations: BoundaryViolation[]): string {
  if (violations.length === 0) return chalk.rgb(80, 255, 120)('  No boundary violations.')

  const lines: string[] = [chalk.bold('\n  Boundary Violations\n')]

  for (const v of violations) {
    const icon = v.severity === 'critical' ? chalk.rgb(255, 80, 80)('✕') : chalk.rgb(255, 200, 50)('⚠')
    const type = chalk.rgb(150, 150, 150)(v.type.padEnd(18))
    lines.push(`  ${icon} ${type} ${v.from} → ${v.to}`)
    lines.push(`    ${chalk.rgb(150, 150, 150)(v.description)}`)
  }

  return lines.join('\n')
}

// ─── Format Drift Indicators ──────────────────────────────────────────────────

/**
 * Format drift indicators as a table.
 *
 * @example
 * formatDriftIndicators(indicators) // formatted string
 */
export function formatDriftIndicators(indicators: DriftIndicator[]): string {
  if (indicators.length === 0) return ''

  const lines: string[] = [chalk.bold('\n  Drift Indicators\n')]
  const maxTypeLen = Math.max(...indicators.map((i) => i.type.length), 10)

  for (const ind of indicators) {
    const sevColor = SEVERITY_COLORS[ind.severity] ?? chalk.white
    const type = ind.type.padEnd(maxTypeLen)
    const sev = sevColor(ind.severity.toUpperCase().padEnd(6))
    lines.push(`  ${sev} ${type} ${ind.description}`)
    lines.push(`    ${chalk.rgb(150, 150, 150)(`expected: ${ind.before} → actual: ${ind.after} (drift: ${ind.drift})`)}`)
  }

  return lines.join('\n')
}

// ─── Format Drift Gauge ───────────────────────────────────────────────────────

/**
 * Format drift score as a visual gauge.
 *
 * @example
 * formatDriftGauge(35) // visual gauge string
 */
export function formatDriftGauge(score: number): string {
  const width = 30
  const filled = Math.round((score / 100) * width)
  const empty = width - filled

  let barColor: (s: string) => string
  if (score < 20) barColor = chalk.rgb(80, 255, 120)
  else if (score < 50) barColor = chalk.rgb(255, 255, 80)
  else barColor = chalk.rgb(255, 80, 80)

  const bar = barColor('█'.repeat(filled)) + chalk.rgb(60, 60, 60)('░'.repeat(empty))
  return `\n  Drift Score: [${bar}] ${score}/100\n`
}

// ─── Format Stats Line ────────────────────────────────────────────────────────

/**
 * Format drift stats summary line.
 *
 * @example
 * formatDriftStatsLine(stats) // 'Modules: 5 | Violations: 3 | Drift: 35/100'
 */
export function formatDriftStatsLine(stats: DriftStats): string {
  const trendColor = stats.driftTrend === 'improving' ? chalk.rgb(80, 255, 120) : stats.driftTrend === 'worsening' ? chalk.rgb(255, 80, 80) : chalk.rgb(255, 255, 80)
  return [
    `Modules: ${stats.totalModules}`,
    `Boundaries: ${stats.totalBoundaries}`,
    `Violations: ${stats.violationCount}`,
    `Drift: ${stats.driftScore}/100`,
    `Trend: ${trendColor(stats.driftTrend)}`,
  ].join(' | ')
}

// ─── Format Recommendations ───────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatDriftRecommendations(recs) // formatted string
 */
export function formatDriftRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [chalk.bold('\n  Recommendations\n')]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 200, 50)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Format Drift Result Table ────────────────────────────────────────────────

/**
 * Format the full drift result.
 *
 * @example
 * formatDriftResultTable(result, false) // complete formatted output
 */
export function formatDriftResultTable(result: DriftResult, verbose: boolean): string {
  const parts: string[] = []

  parts.push(formatDriftStatsLine(result.stats))
  parts.push(formatDriftGauge(result.stats.driftScore))
  parts.push(formatBoundaryMap(result.boundaries))

  if (verbose || result.violations.length > 0) {
    parts.push(formatViolations(result.violations))
  }

  parts.push(formatDriftIndicators(result.indicators))
  parts.push(formatDriftRecommendations(result.recommendations))

  return parts.join('\n')
}

// ─── Format Drift JSON ────────────────────────────────────────────────────────

/**
 * Format drift result as JSON.
 *
 * @example
 * formatDriftJson(result) // JSON string
 */
export function formatDriftJson(result: DriftResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Format Drift CSV ─────────────────────────────────────────────────────────

/**
 * Format violations as CSV.
 *
 * @example
 * formatDriftCsv(result) // CSV string
 */
export function formatDriftCsv(result: DriftResult): string {
  const header = 'from,to,type,severity,description'
  const rows = result.violations.map((v) =>
    [
      v.from,
      v.to,
      v.type,
      v.severity,
      `"${v.description.replace(/"/g, '""')}"`,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
