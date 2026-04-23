import type { RuleViolation } from '../ast/visitor.js'
import type { AnalysisReport } from './reporter.js'

export const COLORS = {
  blue: '\u001B[34m',
  bold: '\u001B[1m',
  dim: '\u001B[2m',
  red: '\u001B[31m',
  reset: '\u001B[0m',
  yellow: '\u001B[33m',
}

export function formatJunit(report: AnalysisReport): string {
  const lines: string[] = []
  lines.push(
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<testsuit name="codeforge-analysis" tests="1" errors="0" failures="0" skipped="0">',
    '  <properties>',
    '    <property name="files-analyzed" value="1" />',
    '  </properties>',
  )

  for (const file of report.files) {
    if (file.violations.length === 0) continue
    lines.push(
      '  <testsuite name="' + file.filePath + '" tests="' + file.violations.length + '">',
      '    <properties>',
    )
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
    '"': '&quot;',
    '&': '&amp;',
    "'": '&#039;',
    '<': '&lt;',
    '>': '&gt;',
  }
  return text.replaceAll(/[&<>"']/g, (char) => escapeMap[char] ?? char)
}

export function formatSarif(report: AnalysisReport): string {
  const sarifLog = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [
      {
        results: extractSarifResults(report),
        tool: {
          driver: {
            informationUri: 'https://github.com/codeforge-dev/codeforge',
            name: 'CodeForge',
            rules: extractSarifRules(report),
            version: '0.1.0',
          },
        },
      },
    ],
    version: '2.1.0',
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

  return [...rulesMap.values()]
}

function extractSarifResults(report: AnalysisReport): unknown[] {
  const results: unknown[] = []

  for (const file of report.files) {
    for (const violation of file.violations) {
      results.push({
        level: mapSeverityToSarifLevel(violation.severity),
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: file.filePath,
              },
              region: {
                startColumn: violation.range.start.column,
                startLine: violation.range.start.line,
              },
            },
          },
        ],
        message: {
          text: violation.message,
        },
        ruleId: violation.ruleId,
      })
    }
  }

  return results
}

function mapSeverityToSarifLevel(severity: string): string {
  switch (severity) {
    case 'error': {
      return 'error'
    }

    case 'info': {
      return 'note'
    }

    case 'warning': {
      return 'warning'
    }

    default: {
      return 'none'
    }
  }
}

export function formatMarkdown(report: AnalysisReport): string {
  const lines: string[] = []
  lines.push(
    '# CodeForge Analysis Report\n',
    `Generated on ${new Date().toISOString()}\n`,
    '## Summary\n',
    '| Metric | Value |',
    '|--------|-------|',
    `| Total Files Analyzed | ${report.summary.totalFiles} |`,
    `| Files with Violations | ${report.files.filter((f) => f.violations.length > 0).length} |`,
    `| Total Violations | ${report.summary.totalViolations} |`,
    `| Errors | ${report.summary.errors} |`,
    `| Warnings | ${report.summary.warnings} |`,
    `| Info | ${report.summary.info} |`,
    `| Analysis Time | ${report.summary.duration.toFixed(2)}ms |`,
  )

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

  lines.push('\n---\n', '*Generated by [CodeForge](https://github.com/codeforge-dev/codeforge)*')
  return lines.join('\n')
}

export function formatGitlab(report: AnalysisReport): string {
  const results: unknown[] = []
  for (const file of report.files) {
    for (const v of file.violations) {
      results.push({
        check_name: v.ruleId,
        description: v.message,
        fingerprint: `${file.filePath}:${v.ruleId}:${v.range.start.line}`,
        location: {
          lines: {
            begin: v.range.start.line,
          },
          path: file.filePath,
        },
        severity:
          v.severity === 'error' ? 'critical' : v.severity === 'warning' ? 'major' : 'minor',
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
  lines.push(
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>CodeForge Analysis Report</title>',
    '<style>',
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #1a1a2e; color: #e0e0e0; }',
    '.container { max-width: 1200px; margin: 0 auto; }',
    'h1 { color: #a78bfa; margin-bottom: 20px; }',
    '.summary { background: #2d2d3a; padding: 15px; border-radius: 8px; margin-bottom: 20px; }',
    '.summary span { margin-right: 20px; }',
    '.error { color: #ff6b6b; }',
    '.warning { color: #f0c674; }',
    '.info { color: #4ecdc4; }',
    '.file { background: #2d2d3a; padding: 15px; border-radius: 8px; margin-bottom: 15px; }',
    '.file-path { font-weight: bold; color: #a78bfa; margin-bottom: 10px; }',
    '.violation { padding: 8px 12px; margin: 5px 0; background: #1a1a2e; border-radius: 4px; }',
    '.violation .location { color: #888; font-size: 0.9em; }',
    '.violation .rule { color: #666; font-size: 0.8em; }',
    '</style>',
    '</head>',
    '<body>',
    '<div class="container">',
    '<h1>CodeForge Analysis Report</h1>',
    '<div class="summary">',
    `<span>Files: ${report.summary.totalFiles}</span>`,
    `<span class="error">Errors: ${report.summary.errors}</span>`,
    `<span class="warning">Warnings: ${report.summary.warnings}</span>`,
    `<span class="info">Info: ${report.summary.info}</span>`,
    `<span>Duration: ${report.summary.duration.toFixed(2)}ms</span>`,
    '</div>',
  )

  for (const file of report.files) {
    if (file.violations.length === 0) continue
    lines.push('<div class="file">', `<div class="file-path">${escapeHtml(file.filePath)}</div>`)
    for (const violation of file.violations) {
      const severityClass = violation.severity
      lines.push(
        '<div class="violation">',
        `<span class="${severityClass}">[${violation.severity.toUpperCase()}]</span>`,
        ` ${escapeHtml(violation.message)} `,
        `<span class="location">at line ${violation.range.start.line}:${violation.range.start.column}</span>`,
        `<span class="rule">${escapeHtml(violation.ruleId)}</span>`,
        '</div>',
      )
    }

    lines.push('</div>')
  }

  lines.push('</div>', '</body>', '</html>')
  return lines.join('\n')
}

function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '"': '&quot;',
    '&': '&amp;',
    "'": '&#039;',
    '<': '&lt;',
    '>': '&gt;',
  }
  return text.replaceAll(/[&<>"']/g, (char) => escapeMap[char] ?? char)
}

export function formatConsole(
  report: AnalysisReport,
  colors: typeof COLORS,
  quiet: boolean,
  verbose: boolean,
): string {
  const lines: string[] = []

  if (!quiet) {
    lines.push('', `${colors.bold}CodeForge Analysis Report${colors.reset}`, '')
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
  lines.push(
    `${colors.bold}Summary${colors.reset}`,
    `  Files analyzed: ${summary.totalFiles}`,
    `  Total violations: ${summary.totalViolations}`,
    `    ${colors.red}Errors: ${summary.errors}${colors.reset}`,
    `    ${colors.yellow}Warnings: ${summary.warnings}${colors.reset}`,
    `    ${colors.blue}Info: ${summary.info}${colors.reset}`,
    `  Duration: ${summary.duration.toFixed(2)}ms`,
    '',
  )

  return lines.join('\n')
}

function getSeverityColor(severity: string, colors: typeof COLORS): string {
  switch (severity) {
    case 'error': {
      return colors.red
    }

    case 'info': {
      return colors.blue
    }

    case 'warning': {
      return colors.yellow
    }

    default: {
      return colors.reset
    }
  }
}
