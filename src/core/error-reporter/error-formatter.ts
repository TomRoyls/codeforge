import type { ErrorEntry, ErrorSummary, ErrorReport } from './types.js'

const SEVERITY_LABELS: Record<ErrorEntry['severity'], string> = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  suggestion: 'Suggestion',
}

export class ErrorFormatter {
  formatSingle(error: ErrorEntry): string {
    const severity = SEVERITY_LABELS[error.severity]
    let result = `${severity}: ${error.message} (${error.ruleId})`
    result += `\n  at ${error.filePath}:${error.line}:${error.column}`
    if (error.source) {
      result += `\n  ${error.source}`
      result += '\n  ' + ' '.repeat(error.column - 1) + '^'
    }
    if (error.fix) {
      result += `\n  Fix: ${error.fix.description} ${error.fix.isSafe ? '[safe]' : '[unsafe]'}`
    }
    return result
  }

  formatText(entries: ErrorEntry[], summary: ErrorSummary): string {
    if (entries.length === 0) {
      return 'No issues found.'
    }
    const lines: string[] = []
    lines.push(this.formatSummary(summary))
    lines.push('')
    for (const entry of entries) {
      lines.push(this.formatSingle(entry))
      lines.push('')
    }
    return lines.join('\n')
  }

  formatSummary(summary: ErrorSummary): string {
    const parts: string[] = []
    parts.push(`Total: ${summary.total}`)
    if (summary.errors > 0) parts.push(`Errors: ${summary.errors}`)
    if (summary.warnings > 0) parts.push(`Warnings: ${summary.warnings}`)
    if (summary.info > 0) parts.push(`Info: ${summary.info}`)
    if (summary.suggestions > 0) parts.push(`Suggestions: ${summary.suggestions}`)
    if (summary.fixableCount > 0) parts.push(`Fixable: ${summary.fixableCount}`)
    parts.push(`Files affected: ${summary.filesAffected}`)
    return parts.join(', ')
  }

  formatJSON(report: ErrorReport): string {
    const serializable = {
      generatedAt: report.generatedAt,
      format: report.format,
      summary: {
        ...report.summary,
        byRule: Object.fromEntries(report.summary.byRule),
        byFile: Object.fromEntries(report.summary.byFile),
        bySeverity: Object.fromEntries(report.summary.bySeverity),
      },
      groups: report.groups,
      entries: report.entries,
    }
    return JSON.stringify(serializable, null, 2)
  }

  formatMarkdown(report: ErrorReport): string {
    const lines: string[] = []
    lines.push('# Error Report')
    lines.push('')
    lines.push(`**Generated:** ${new Date(report.generatedAt).toISOString()}`)
    lines.push(`**Format:** ${report.format}`)
    lines.push('')

    lines.push('## Summary')
    lines.push('')
    lines.push(`- **Total:** ${report.summary.total}`)
    lines.push(`- **Errors:** ${report.summary.errors}`)
    lines.push(`- **Warnings:** ${report.summary.warnings}`)
    lines.push(`- **Info:** ${report.summary.info}`)
    lines.push(`- **Suggestions:** ${report.summary.suggestions}`)
    lines.push(`- **Fixable:** ${report.summary.fixableCount}`)
    lines.push(`- **Files affected:** ${report.summary.filesAffected}`)
    lines.push('')

    if (report.groups.length > 0) {
      lines.push('## Issues by Rule')
      lines.push('')
      lines.push('| Rule | Severity | Count | Files |')
      lines.push('|------|----------|-------|-------|')
      for (const group of report.groups) {
        lines.push(`| ${group.ruleId} | ${group.severity} | ${group.count} | ${group.files.length} |`)
      }
      lines.push('')
    }

    if (report.entries.length > 0) {
      lines.push('## All Issues')
      lines.push('')
      for (const entry of report.entries) {
        const label = SEVERITY_LABELS[entry.severity]
        lines.push(`### ${label}: ${entry.message}`)
        lines.push(`- **Rule:** ${entry.ruleId}`)
        lines.push(`- **File:** ${entry.filePath}:${entry.line}:${entry.column}`)
        if (entry.fix) {
          lines.push(`- **Fix:** ${entry.fix.description} ${entry.fix.isSafe ? '(safe)' : '(unsafe)'}`)
        }
        if (entry.tags.length > 0) {
          lines.push(`- **Tags:** ${entry.tags.join(', ')}`)
        }
        lines.push('')
      }
    }

    return lines.join('\n')
  }

  formatHTML(report: ErrorReport): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const severityClass = (s: string) => `severity-${s}`
    const lines: string[] = []

    lines.push('<!DOCTYPE html>')
    lines.push('<html lang="en">')
    lines.push('<head>')
    lines.push('<meta charset="UTF-8">')
    lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    lines.push('<title>Error Report</title>')
    lines.push('<style>')
    lines.push('body { font-family: sans-serif; margin: 2rem; }')
    lines.push('.summary { margin-bottom: 2rem; }')
    lines.push('.summary-item { display: inline-block; margin-right: 1rem; }')
    lines.push(`.severity-error { color: #dc3545; }`)
    lines.push(`.severity-warning { color: #ffc107; }`)
    lines.push(`.severity-info { color: #17a2b8; }`)
    lines.push(`.severity-suggestion { color: #6c757d; }`)
    lines.push('.entry { border-left: 3px solid #ddd; padding: 0.5rem 1rem; margin-bottom: 1rem; }')
    lines.push('.entry.severity-error { border-color: #dc3545; }')
    lines.push('.entry.severity-warning { border-color: #ffc107; }')
    lines.push('.entry.severity-info { border-color: #17a2b8; }')
    lines.push('.entry.severity-suggestion { border-color: #6c757d; }')
    lines.push('table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; }')
    lines.push('th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }')
    lines.push('th { background: #f5f5f5; }')
    lines.push('</style>')
    lines.push('</head>')
    lines.push('<body>')
    lines.push('<h1>Error Report</h1>')

    lines.push('<div class="summary">')
    lines.push(`<span class="summary-item"><strong>Total:</strong> ${report.summary.total}</span>`)
    lines.push(`<span class="summary-item ${severityClass('error')}"><strong>Errors:</strong> ${report.summary.errors}</span>`)
    lines.push(`<span class="summary-item ${severityClass('warning')}"><strong>Warnings:</strong> ${report.summary.warnings}</span>`)
    lines.push(`<span class="summary-item ${severityClass('info')}"><strong>Info:</strong> ${report.summary.info}</span>`)
    lines.push(`<span class="summary-item ${severityClass('suggestion')}"><strong>Suggestions:</strong> ${report.summary.suggestions}</span>`)
    lines.push(`<span class="summary-item"><strong>Fixable:</strong> ${report.summary.fixableCount}</span>`)
    lines.push(`<span class="summary-item"><strong>Files affected:</strong> ${report.summary.filesAffected}</span>`)
    lines.push('</div>')

    if (report.groups.length > 0) {
      lines.push('<h2>Issues by Rule</h2>')
      lines.push('<table>')
      lines.push('<tr><th>Rule</th><th>Severity</th><th>Count</th><th>Files</th></tr>')
      for (const group of report.groups) {
        lines.push(`<tr>`)
        lines.push(`<td>${esc(group.ruleId)}</td>`)
        lines.push(`<td class="${severityClass(group.severity)}">${esc(group.severity)}</td>`)
        lines.push(`<td>${group.count}</td>`)
        lines.push(`<td>${group.files.length}</td>`)
        lines.push(`</tr>`)
      }
      lines.push('</table>')
    }

    if (report.entries.length > 0) {
      lines.push('<h2>All Issues</h2>')
      for (const entry of report.entries) {
        lines.push(`<div class="entry ${severityClass(entry.severity)}">`)
        lines.push(`<strong>${esc(SEVERITY_LABELS[entry.severity])}:</strong> ${esc(entry.message)}`)
        lines.push(` <code>[${esc(entry.ruleId)}]</code>`)
        lines.push(`<br><em>${esc(entry.filePath)}:${entry.line}:${entry.column}</em>`)
        if (entry.fix) {
          lines.push(`<br>Fix: ${esc(entry.fix.description)} ${entry.fix.isSafe ? '(safe)' : '(unsafe)'}`)
        }
        lines.push('</div>')
      }
    }

    lines.push('</body>')
    lines.push('</html>')

    return lines.join('\n')
  }

  formatSARIF(entries: ErrorEntry[]): object {
    const results = entries.map((entry) => ({
      ruleId: entry.ruleId,
      level: this.severityToSARIFLevel(entry.severity),
      message: { text: entry.message },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: entry.filePath },
            region: {
              startLine: entry.line,
              startColumn: entry.column,
              ...(entry.endLine !== undefined ? { endLine: entry.endLine } : {}),
              ...(entry.endColumn !== undefined ? { endColumn: entry.endColumn } : {}),
            },
          },
        },
      ],
      ...(entry.fix
        ? {
            fixes: [
              {
                description: { text: entry.fix.description },
                artifactChanges: [
                  {
                    artifactLocation: { uri: entry.filePath },
                    replacements: [
                      {
                        deletedRegion: {
                          startLine: entry.fix.range.startLine,
                          startColumn: entry.fix.range.startColumn,
                          endLine: entry.fix.range.endLine,
                          endColumn: entry.fix.range.endColumn,
                        },
                        insertedContent: { text: entry.fix.replacement },
                      },
                    ],
                  },
                ],
              },
            ],
          }
        : {}),
    }))

    const rules = Array.from(new Set(entries.map((e) => e.ruleId))).map((ruleId) => ({
      id: ruleId,
    }))

    return {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'CodeForge',
              version: '1.0.0',
              rules,
            },
          },
          results,
        },
      ],
    }
  }

  formatJUnit(entries: ErrorEntry[]): string {
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

    const fileMap = new Map<string, ErrorEntry[]>()
    for (const entry of entries) {
      const existing = fileMap.get(entry.filePath)
      if (existing) {
        existing.push(entry)
      } else {
        fileMap.set(entry.filePath, [entry])
      }
    }

    const failureCount = entries.filter((e) => e.severity === 'error').length
    const lines: string[] = []
    lines.push('<?xml version="1.0" encoding="UTF-8"?>')
    lines.push(`<testsuites tests="${entries.length}" failures="${failureCount}">`)

    for (const [filePath, fileEntries] of fileMap) {
      const fileFailures = fileEntries.filter((e) => e.severity === 'error').length
      lines.push(`  <testsuite name="${esc(filePath)}" tests="${fileEntries.length}" failures="${fileFailures}">`)
      for (const entry of fileEntries) {
        lines.push(`    <testcase name="${esc(entry.ruleId)}: ${esc(entry.message)}" classname="${esc(filePath)}">`)
        if (entry.severity === 'error' || entry.severity === 'warning') {
          lines.push(
            `      <failure message="${esc(entry.message)}">${esc(entry.filePath)}:${entry.line}:${entry.column}</failure>`
          )
        }
        lines.push('    </testcase>')
      }
      lines.push('  </testsuite>')
    }

    lines.push('</testsuites>')
    return lines.join('\n')
  }

  private severityToSARIFLevel(severity: ErrorEntry['severity']): string {
    switch (severity) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'note'
      case 'suggestion':
        return 'none'
    }
  }
}
