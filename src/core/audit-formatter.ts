import type { AuditEntry, ComplianceReport } from './audit-types.js'

/**
 * @internal
 */
export function formatComplianceReportMarkdown(report: ComplianceReport): string {
  const lines: string[] = []
  lines.push(`# CodeForge Compliance Report`)
  lines.push(``)
  lines.push(`**Generated:** ${report.generatedAt}`)
  lines.push(`**Period:** ${report.period.from} to ${report.period.to}`)
  lines.push(``)

  lines.push(`## Summary`)
  lines.push(``)
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Total Runs | ${report.totalRuns} |`)
  lines.push(`| Total Violations | ${report.totalViolations} |`)
  lines.push(`| Average Violations/Run | ${report.averageViolationsPerRun.toFixed(2)} |`)
  lines.push(`| Pass Rate | ${(report.passRate * 100).toFixed(1)}% |`)
  lines.push(``)

  lines.push(`## Top Violated Rules`)
  lines.push(``)
  if (report.topViolatedRules.length > 0) {
    lines.push(`| Rule ID | Count |`)
    lines.push(`|---------|-------|`)
    for (const rule of report.topViolatedRules) {
      lines.push(`| ${rule.ruleId} | ${rule.count} |`)
    }
  } else {
    lines.push(`No rule violations recorded.`)
  }
  lines.push(``)

  lines.push(`## Top Violated Files`)
  lines.push(``)
  if (report.topViolatedFiles.length > 0) {
    lines.push(`| File | Count |`)
    lines.push(`|------|-------|`)
    for (const file of report.topViolatedFiles) {
      lines.push(`| ${file.filePath} | ${file.count} |`)
    }
  } else {
    lines.push(`No file violations recorded.`)
  }
  lines.push(``)

  lines.push(`## Error Trend`)
  lines.push(``)
  lines.push(report.errorTrend.join(', '))
  lines.push(``)

  if (report.errorTrend.length > 0) {
    lines.push(`## Violation Distribution`)
    lines.push(``)
    const maxVal = Math.max(...report.errorTrend, 1)
    for (let i = 0; i < report.errorTrend.length; i++) {
      const val = report.errorTrend[i]!
      const barLen = Math.round((val / maxVal) * 20)
      const bar = '\u2588'.repeat(barLen)
      lines.push(`Run ${i + 1}: ${bar} (${val})`)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

/**
 * @internal
 */
export function formatComplianceReportJSON(report: ComplianceReport): string {
  return JSON.stringify(report, null, 2)
}

/**
 * @internal
 */
export function formatAuditEntryShort(entry: AuditEntry): string {
  return `[${entry.timestamp}] ${entry.command}: ${entry.filesAnalyzed} files, ${entry.totalViolations} violations (${entry.errorCount} errors, ${entry.warningCount} warnings) - exit ${entry.exitCode}`
}
