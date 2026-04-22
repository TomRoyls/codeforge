import type { RuleViolation } from '../ast/visitor.js'
import type { AnalysisReport } from './reporter.js'

export const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

export function formatJunit(report: AnalysisReport): string {
  const lines: string[] = []
  lines.push('<?xml version="1.0" encoding="UTF-8"?>')
  lines.push('<testsuit name="codeforge-analysis" tests="1" errors="0" failures="0" skipped="0">')
  lines.push(`  <properties>`)
  lines.push('    <property name="files-analyzed" value="1" />')
  lines.push(`  </properties>`)

  for (const file of report.files) {
    if (file.violations.length === 0) continue
    lines.push('  <testsuite name="' + file.filePath + '" tests="' + file.violations.length + '">')
    lines.push('    <properties>')
    for (const violation of file.violations) {
      const testcase = formatTestCase(violation)
      lines.push(`      ${testcase}`)
    }
    lines.push('  </testsuite>')
  }

  lines.push('</testsuit>')
  return lines.join('\n')
}

function formatTestCase(violation: RuleViolation): string {
  const location = `${violation.filePath}:${violation.range.start.line}:${violation.range.start.column}`
  const message = escapeXml(violation.message)
  const ruleId = escapeXml(violation.ruleId)

  return `<testcase name="${ruleId}: ${message}" classname="${violation.ruleId}">
      <failure message="${location}">${message}</failure>
    </testcase>`
}

function escapeXml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] ?? char)
}

export function formatSarif(report: AnalysisReport): string {
  const sarifLog = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'CodeForge',
            version: '0.1.0',
            informationUri: 'https://github.com/codeforge-dev/codeforge',
            rules: extractSarifRules(report),
          },
        },
        results: extractSarifResults(report),
      },
    ],
  }
  return JSON.stringify(sarifLog, null, 2)
}

function extractSarifRules(report: AnalysisReport): unknown[] {
  const rulesMap = new Map<string, { id: string; shortDescription: string }>()

  for (const file of report.files) {
    for (const violation of file.violations) {
      if (!rulesMap.has(violation.ruleId)) {
        rulesMap.set(violation.ruleId, {
          id: violation.ruleId,
          shortDescription: violation.message.split('.')[0] + '.',
        })
      }
    }
  }

  return Array.from(rulesMap.values())
}

function extractSarifResults(report: AnalysisReport): unknown[] {
  const results: unknown[] = []

  for (const file of report.files) {
    for (const violation of file.violations) {
      results.push({
        ruleId: violation.ruleId,
        level: mapSeverityToSarifLevel(violation.severity),
        message: {
          text: violation.message,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: file.filePath,
              },
              region: {
                startLine: violation.range.start.line,
                startColumn: violation.range.start.column,
              },
            },
          },
        ],
      })
    }
  }

  return results
}

function mapSeverityToSarifLevel(severity: string): string {
  switch (severity) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'note'
    default:
      return 'none'
  }
}

export function formatMarkdown(report: AnalysisReport): string {
  const lines: string[] = []
  lines.push('# CodeForge Analysis Report\n')
  lines.push(`Generated on ${new Date().toISOString()}\n`)
  lines.push('## Summary\n')
  lines.push('| Metric | Value |')
  lines.push('|--------|-------|')
  lines.push(`| Total Files Analyzed | ${report.summary.totalFiles} |`)
  lines.push(
    `| Files with Violations | ${report.files.filter((f) => f.violations.length > 0).length} |`,
  )
  lines.push(`| Total Violations | ${report.summary.totalViolations} |`)
  lines.push(`| Errors | ${report.summary.errors} |`)
  lines.push(`| Warnings | ${report.summary.warnings} |`)
  lines.push(`| Info | ${report.summary.info} |`)
  lines.push(`| Analysis Time | ${report.summary.duration.toFixed(2)}ms |`)

  const filesWithViolations = report.files.filter((f) => f.violations.length > 0)
  if (filesWithViolations.length > 0) {
    lines.push('\n## Violations\n')
    for (const file of filesWithViolations) {
      lines.push(`### ${file.filePath}\n`)
      for (const v of file.violations) {
        const icon = v.severity === 'error' ? '🔴' : v.severity === 'warning' ? '🟡' : '🔵'
        lines.push(
          `${icon} **${v.ruleId}** at line ${v.range.start.line}:${v.range.start.column} - ${v.message}`,
        )
      }
      lines.push('')
    }
  } else {
    lines.push('\n✅ No violations found!\n')
  }

  lines.push('\n---\n')
  lines.push('*Generated by [CodeForge](https://github.com/codeforge-dev/codeforge)*')
  return lines.join('\n')
}

export function formatGitlab(report: AnalysisReport): string {
  const results: unknown[] = []
  for (const file of report.files) {
    for (const v of file.violations) {
      results.push({
        description: v.message,
        check_name: v.ruleId,
        fingerprint: `${file.filePath}:${v.ruleId}:${v.range.start.line}`,
        severity:
          v.severity === 'error' ? 'critical' : v.severity === 'warning' ? 'major' : 'minor',
        location: {
          path: file.filePath,
          lines: {
            begin: v.range.start.line,
          },
        },
      })
    }
  }
  return JSON.stringify(results, null, 2)
}

export function formatJson(report: AnalysisReport): string {
  return JSON.stringify(report, null, 2)
}

export function formatHtml(report: AnalysisReport): string {
  const lines: string[] = []
  lines.push('<!DOCTYPE html>')
  lines.push('<html lang="en">')
  lines.push('<head>')
  lines.push('<meta charset="UTF-8">')
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
  lines.push('<title>CodeForge Analysis Report</title>')
  lines.push('<style>')
  lines.push(
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #e0e0e0; }',
  )
  lines.push('.container { max-width: 1200px; margin: 0 auto; }')
  lines.push('h1 { color: #a78bfa; margin-bottom: 20px; }')
  lines.push(
    '.summary { background: #2d2d3a; padding: 15px; border-radius: 8px; margin-bottom: 20px; }',
  )
  lines.push('.summary span { margin-right: 20px; }')
  lines.push('.error { color: #ff6b6b; }')
  lines.push('.warning { color: #f0c674; }')
  lines.push('.info { color: #4ecdc4; }')
  lines.push(
    '.file { background: #2d2d3a; padding: 15px; border-radius: 8px; margin-bottom: 15px; }',
  )
  lines.push('.file-path { font-weight: bold; color: #a78bfa; margin-bottom: 10px; }')
  lines.push(
    '.violation { padding: 8px 12px; margin: 5px 0; background: #1a1a2e; border-radius: 4px; }',
  )
  lines.push('.violation .location { color: #888; font-size: 0.9em; }')
  lines.push('.violation .rule { color: #666; font-size: 0.8em; }')
  lines.push('</style>')
  lines.push('</head>')
  lines.push('<body>')
  lines.push('<div class="container">')
  lines.push('<h1>CodeForge Analysis Report</h1>')
  lines.push('<div class="summary">')
  lines.push(`<span>Files: ${report.summary.totalFiles}</span>`)
  lines.push(`<span class="error">Errors: ${report.summary.errors}</span>`)
  lines.push(`<span class="warning">Warnings: ${report.summary.warnings}</span>`)
  lines.push(`<span class="info">Info: ${report.summary.info}</span>`)
  lines.push(`<span>Duration: ${report.summary.duration.toFixed(2)}ms</span>`)
  lines.push('</div>')

  for (const file of report.files) {
    if (file.violations.length === 0) continue
    lines.push('<div class="file">')
    lines.push(`<div class="file-path">${escapeHtml(file.filePath)}</div>`)
    for (const violation of file.violations) {
      const severityClass = violation.severity
      lines.push('<div class="violation">')
      lines.push(`<span class="${severityClass}">[${violation.severity.toUpperCase()}]</span>`)
      lines.push(` ${escapeHtml(violation.message)} `)
      lines.push(
        `<span class="location">at line ${violation.range.start.line}:${violation.range.start.column}</span>`,
      )
      lines.push(`<span class="rule">${escapeHtml(violation.ruleId)}</span>`)
      lines.push('</div>')
    }
    lines.push('</div>')
  }

  lines.push('</div>')
  lines.push('</body>')
  lines.push('</html>')
  return lines.join('\n')
}

function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] ?? char)
}

export function formatConsole(
  report: AnalysisReport,
  colors: typeof COLORS,
  quiet: boolean,
  verbose: boolean,
): string {
  const lines: string[] = []

  if (!quiet) {
    lines.push('')
    lines.push(`${colors.bold}CodeForge Analysis Report${colors.reset}`)
    lines.push('')
  }

  for (const file of report.files) {
    if (file.violations.length === 0) continue

    lines.push(`${colors.bold}${file.filePath}${colors.reset}`)

    for (const violation of file.violations) {
      const severityColor = getSeverityColor(violation.severity, colors)
      const severityLabel = violation.severity.toUpperCase().padEnd(7)

      lines.push(
        `  ${severityColor}${severityLabel}${colors.reset} ` +
          `[${violation.range.start.line}:${violation.range.start.column}] ` +
          `${violation.message} ` +
          `${colors.dim}${violation.ruleId}${colors.reset}`,
      )

      if (verbose && violation.suggestion) {
        lines.push(`    ${colors.dim}Suggestion: ${violation.suggestion}${colors.reset}`)
      }
    }

    lines.push('')
  }

  const { summary } = report
  lines.push(`${colors.bold}Summary${colors.reset}`)
  lines.push(`  Files analyzed: ${summary.totalFiles}`)
  lines.push(`  Total violations: ${summary.totalViolations}`)
  lines.push(`    ${colors.red}Errors: ${summary.errors}${colors.reset}`)
  lines.push(`    ${colors.yellow}Warnings: ${summary.warnings}${colors.reset}`)
  lines.push(`    ${colors.blue}Info: ${summary.info}${colors.reset}`)
  lines.push(`  Duration: ${summary.duration.toFixed(2)}ms`)
  lines.push('')

  return lines.join('\n')
}

function getSeverityColor(severity: string, colors: typeof COLORS): string {
  switch (severity) {
    case 'error':
      return colors.red
    case 'warning':
      return colors.yellow
    case 'info':
      return colors.blue
    default:
      return colors.reset
  }
}
