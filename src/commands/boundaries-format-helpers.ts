import chalk from 'chalk'

import type { BoundaryCheck, BoundaryViolation, BoundariesResult, BoundariesStats, ModuleDefinition, ModuleHealth } from './boundaries-helpers.js'

// ─── Format Boundary Matrix ───────────────────────────────────────────────────

/**
 * Format boundary matrix showing which modules can talk to which.
 *
 * @example
 * formatBoundaryMatrix(modules, rules) // formatted matrix
 */
export function formatBoundaryMatrix(modules: ModuleDefinition[], checks: BoundaryCheck[]): string {
  if (modules.length === 0) return chalk.rgb(100, 200, 150)('  No modules detected.')

  const names = modules.map((m) => m.name)
  const lines: string[] = [chalk.bold('\n  Boundary Matrix\n')]

  const header = '  ' + ''.padEnd(14) + names.map((n) => n.substring(0, 6).padEnd(7)).join('')
  lines.push(header)

  for (const row of names) {
    let line = '  ' + chalk.bold(row.padEnd(14))
    for (const col of names) {
      if (row === col) {
        line += chalk.rgb(60, 60, 60)('  —   ')
      } else {
        const hasViolation = checks.some((c) => c.source === row && c.target === col && !c.allowed)
        const hasAllowed = checks.some((c) => c.source === row && c.target === col && c.allowed)
        if (hasViolation) {
          line += chalk.rgb(255, 80, 80)('  ✕   ')
        } else if (hasAllowed) {
          line += chalk.rgb(80, 255, 120)('  ✓   ')
        } else {
          line += chalk.rgb(80, 80, 80)('  ·   ')
        }
      }
    }
    lines.push(line)
  }

  return lines.join('\n')
}

// ─── Format Violations Table ──────────────────────────────────────────────────

/**
 * Format boundary violations table.
 *
 * @example
 * formatViolationsTable(violations) // formatted string
 */
export function formatViolationsTable(violations: BoundaryViolation[]): string {
  if (violations.length === 0) return chalk.rgb(80, 255, 120)('  No boundary violations.')

  const lines: string[] = [chalk.bold('\n  Boundary Violations\n')]

  for (const v of violations) {
    const icon = v.severity === 'error' ? chalk.rgb(255, 80, 80)('✕') : chalk.rgb(255, 200, 50)('⚠')
    const sev = v.severity === 'error' ? chalk.rgb(255, 80, 80)('ERROR') : chalk.rgb(255, 200, 50)('WARN ')
    lines.push(`  ${icon} ${sev} ${chalk.bold(v.source)} → ${chalk.bold(v.target)}`)
    lines.push(`    ${chalk.rgb(150, 150, 150)(v.sourceFile)} imports from ${chalk.rgb(150, 150, 150)(v.targetFile)}`)
    lines.push(`    ${chalk.rgb(120, 180, 120)(`→ ${v.suggestion}`)}`)
  }

  return lines.join('\n')
}

// ─── Format Module Health Cards ───────────────────────────────────────────────

/**
 * Format module health cards.
 *
 * @example
 * formatModuleHealth(health) // formatted string
 */
export function formatModuleHealth(health: ModuleHealth[]): string {
  if (health.length === 0) return ''

  const lines: string[] = [chalk.bold('\n  Module Health\n')]

  for (const mh of health) {
    const statusColor = mh.status === 'healthy' ? chalk.rgb(80, 255, 120) : mh.status === 'warning' ? chalk.rgb(255, 200, 50) : chalk.rgb(255, 80, 80)
    const icon = mh.status === 'healthy' ? '✓' : mh.status === 'warning' ? '⚠' : '✕'
    const bar = statusColor('█'.repeat(Math.max(1, Math.round(mh.compliance / 5))))
    const name = mh.module.padEnd(14)
    lines.push(`  ${statusColor(icon)} ${name} ${bar} ${mh.compliance}/100 (${mh.violations} violations)`)
  }

  return lines.join('\n')
}

// ─── Format Compliance Gauge ──────────────────────────────────────────────────

/**
 * Format compliance score as a visual gauge.
 *
 * @example
 * formatComplianceGauge(85) // visual gauge string
 */
export function formatComplianceGauge(score: number): string {
  const width = 30
  const filled = Math.round((score / 100) * width)
  const empty = width - filled

  let barColor: (s: string) => string
  if (score >= 80) barColor = chalk.rgb(80, 255, 120)
  else if (score >= 50) barColor = chalk.rgb(255, 255, 80)
  else barColor = chalk.rgb(255, 80, 80)

  const bar = barColor('█'.repeat(filled)) + chalk.rgb(60, 60, 60)('░'.repeat(empty))
  return `\n  Compliance: [${bar}] ${score}/100\n`
}

// ─── Format Stats Line ────────────────────────────────────────────────────────

/**
 * Format boundaries stats summary.
 *
 * @example
 * formatBoundariesStatsLine(stats) // 'Modules: 5 | Checks: 20 | Score: 85/100'
 */
export function formatBoundariesStatsLine(stats: BoundariesStats): string {
  return [
    `Modules: ${stats.totalModules}`,
    `Checks: ${stats.totalChecks}`,
    `Violations: ${stats.violationsCount}`,
    `Compliance: ${stats.complianceScore}/100`,
    `Healthy: ${stats.compliantModules}/${stats.totalModules}`,
  ].join(' | ')
}

// ─── Format Recommendations ───────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatBoundariesRecommendations(recs) // formatted string
 */
export function formatBoundariesRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [chalk.bold('\n  Recommendations\n')]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 200, 50)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Format Boundaries Result Table ───────────────────────────────────────────

/**
 * Format the full boundaries result.
 *
 * @example
 * formatBoundariesResultTable(result, false) // complete formatted output
 */
export function formatBoundariesResultTable(result: BoundariesResult, verbose: boolean): string {
  const parts: string[] = []

  parts.push(formatBoundariesStatsLine(result.stats))
  parts.push(formatComplianceGauge(result.stats.complianceScore))
  parts.push(formatModuleHealth(result.moduleHealth))
  parts.push(formatBoundaryMatrix(result.modules, result.checks))

  if (verbose || result.violations.length > 0) {
    parts.push(formatViolationsTable(result.violations))
  }

  parts.push(formatBoundariesRecommendations(result.recommendations))

  return parts.join('\n')
}

// ─── Format Boundaries JSON ───────────────────────────────────────────────────

/**
 * Format boundaries result as JSON.
 *
 * @example
 * formatBoundariesJson(result) // JSON string
 */
export function formatBoundariesJson(result: BoundariesResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Format Boundaries CSV ────────────────────────────────────────────────────

/**
 * Format violations as CSV.
 *
 * @example
 * formatBoundariesCsv(result) // CSV string
 */
export function formatBoundariesCsv(result: BoundariesResult): string {
  const header = 'source,target,sourceFile,targetFile,severity,reason'
  const rows = result.violations.map((v) =>
    [
      v.source,
      v.target,
      v.sourceFile,
      v.targetFile,
      v.severity,
      `"${v.reason.replace(/"/g, '""')}"`,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
