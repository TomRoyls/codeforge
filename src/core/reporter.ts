import * as fs from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import type { RuleViolation } from '../ast/visitor.js'

export type OutputFormat = 'console' | 'gitlab' | 'html' | 'json' | 'junit' | 'markdown' | 'sarif'

export interface ReporterOptions {
  color?: boolean
  format: OutputFormat
  outputPath?: string
  quiet: boolean
  verbose: boolean
}

export interface FileReport {
  filePath: string
  violations: RuleViolation[]
}

export interface AnalysisReport {
  files: FileReport[]
  summary: {
    duration: number
    errors: number
    info: number
    totalFiles: number
    totalViolations: number
    warnings: number
  }
}

const COLORS = {
  blue: '\u001B[34m',
  bold: '\u001B[1m',
  dim: '\u001B[2m',
  red: '\u001B[31m',
  reset: '\u001B[0m',
  yellow: '\u001B[33m',
}

export class Reporter {
  private colors: typeof COLORS
  private options: ReporterOptions

  constructor(options: ReporterOptions) {
    this.options = options
    this.colors = options.color === false ? this.getNoColorColors() : COLORS
  }

  formatReport(report: AnalysisReport): string {
    switch (this.options.format) {
      case 'console': {
        return this.formatConsole(report)
      }

      case 'gitlab': {
        return this.formatGitlab(report)
      }

      case 'html': {
        return this.formatHtml(report)
      }

      case 'json': {
        return this.formatJson(report)
      }

      case 'junit': {
        return this.formatJunit(report)
      }

      case 'markdown': {
        return this.formatMarkdown(report)
      }

      case 'sarif': {
        return this.formatSarif(report)
      }

      default: {
        throw new Error(
          `Unsupported output format: "${this.options.format}". ` +
            `Valid formats are: console, json, html, junit, sarif, markdown, gitlab. ` +
            `Please check your configuration and try again.`,
        )
      }
    }
  }

  printProgress(message: string): void {
    if (!this.options.quiet) {
      console.log(message)
    }
  }

  async writeReport(report: AnalysisReport): Promise<void> {
    const content = this.formatReport(report)

    if (this.options.outputPath) {
      const absolutePath = resolve(this.options.outputPath)
      try {
        await fs.mkdir(dirname(absolutePath), { recursive: true })
        await fs.writeFile(absolutePath, content, 'utf8')
      } catch (error) {
        if (error instanceof Error) {
          throw new TypeError(
            `Failed to write report to "${this.options.outputPath}". ` +
              `Error: ${error.message}. ` +
              `Please ensure the path is valid and you have write permissions.`,
          )
        }

        throw error
      }
    } else {
      console.log(content)
    }
  }

  private escapeHtml(text: string): string {
    const escapeMap: Record<string, string> = {
      '"': '&quot;',
      '&': '&amp;',
      "'": '&#039;',
      '<': '&lt;',
      '>': '&gt;',
    }
    return text.replaceAll(/[&<>"']/g, (char) => escapeMap[char] ?? char)
  }

  private escapeXml(text: string): string {
    const escapeMap: Record<string, string> = {
      '"': '&quot;',
      '&': '&amp;',
      "'": '&#039;',
      '<': '&lt;',
      '>': '&gt;',
    }
    return text.replaceAll(/[&<>"']/g, (char) => escapeMap[char] ?? char)
  }

  private extractSarifResults(report: AnalysisReport): unknown[] {
    const results: unknown[] = []

    for (const file of report.files) {
      for (const violation of file.violations) {
        results.push({
          level: this.mapSeverityToSarifLevel(violation.severity),
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

  private extractSarifRules(report: AnalysisReport): unknown[] {
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

  private formatConsole(report: AnalysisReport): string {
    const lines: string[] = []

    if (!this.options.quiet) {
      lines.push('', `${this.colors.bold}CodeForge Analysis Report${this.colors.reset}`, '')
    }

    for (const file of report.files) {
      if (file.violations.length === 0) continue

      lines.push(`${this.colors.bold}${file.filePath}${this.colors.reset}`)

      for (const violation of file.violations) {
        const severityColor = this.getSeverityColor(violation.severity)
        const severityLabel = violation.severity.toUpperCase().padEnd(7)

        lines.push(
          `  ${severityColor}${severityLabel}${this.colors.reset} ` +
            `[${violation.range.start.line}:${violation.range.start.column}] ` +
            `${violation.message} ` +
            `${this.colors.dim}${violation.ruleId}${this.colors.reset}`,
        )

        if (this.options.verbose && violation.suggestion) {
          lines.push(
            `    ${this.colors.dim}Suggestion: ${violation.suggestion}${this.colors.reset}`,
          )
        }
      }

      lines.push('')
    }

    const { summary } = report
    lines.push(
      `${this.colors.bold}Summary${this.colors.reset}`,
      `  Files analyzed: ${summary.totalFiles}`,
      `  Total violations: ${summary.totalViolations}`,
      `    ${this.colors.red}Errors: ${summary.errors}${this.colors.reset}`,
      `    ${this.colors.yellow}Warnings: ${summary.warnings}${this.colors.reset}`,
      `    ${this.colors.blue}Info: ${summary.info}${this.colors.reset}`,
      `  Duration: ${summary.duration.toFixed(2)}ms`,
      '',
    )

    return lines.join('\n')
  }

  private formatGitlab(report: AnalysisReport): string {
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

  private formatHtml(report: AnalysisReport): string {
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
      lines.push(
        '<div class="file">',
        `<div class="file-path">${this.escapeHtml(file.filePath)}</div>`,
      )
      for (const violation of file.violations) {
        const severityClass = violation.severity
        lines.push(
          '<div class="violation">',
          `<span class="${severityClass}">[${violation.severity.toUpperCase()}]</span>`,
          ` ${this.escapeHtml(violation.message)} `,
          `<span class="location">at line ${violation.range.start.line}:${violation.range.start.column}</span>`,
          `<span class="rule">${this.escapeHtml(violation.ruleId)}</span>`,
          '</div>',
        )
      }

      lines.push('</div>')
    }

    lines.push('</div>', '</body>', '</html>')
    return lines.join('\n')
  }

  private formatJson(report: AnalysisReport): string {
    return JSON.stringify(report, null, 2)
  }

  private formatJunit(report: AnalysisReport): string {
    const lines: string[] = []
    lines.push(
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<testsuit name="codeforge-analysis" tests="1" errors="0" failures="0" skipped="0">',
      `  <properties>`,
      '    <property name="files-analyzed" value="1" />',
      `  </properties>`,
    )

    for (const file of report.files) {
      if (file.violations.length === 0) continue
      lines.push(
        '  <testsuite name="' + file.filePath + '" tests="' + file.violations.length + '">',
        '    <properties>',
      )
      for (const violation of file.violations) {
        const testcase = this.formatTestCase(violation)
        lines.push(`      ${testcase}`)
      }

      lines.push('  </testsuite>')
    }

    lines.push('</testsuit>')
    return lines.join('\n')
  }

  private formatMarkdown(report: AnalysisReport): string {
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

  private formatSarif(report: AnalysisReport): string {
    const sarifLog = {
      $schema:
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: [
        {
          results: this.extractSarifResults(report),
          tool: {
            driver: {
              informationUri: 'https://github.com/codeforge-dev/codeforge',
              name: 'CodeForge',
              rules: this.extractSarifRules(report),
              version: '0.1.0',
            },
          },
        },
      ],
      version: '2.1.0',
    }
    return JSON.stringify(sarifLog, null, 2)
  }

  private formatTestCase(violation: RuleViolation): string {
    const location = `${violation.filePath}:${violation.range.start.line}:${violation.range.start.column}`
    const message = this.escapeXml(violation.message)
    const ruleId = this.escapeXml(violation.ruleId)

    return `<testcase name="${ruleId}: ${message}" classname="${violation.ruleId}">
      <failure message="${location}">${message}</failure>
    </testcase>`
  }

  private getNoColorColors(): typeof COLORS {
    return {
      blue: '',
      bold: '',
      dim: '',
      red: '',
      reset: '',
      yellow: '',
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'error': {
        return this.colors.red
      }

      case 'info': {
        return this.colors.blue
      }

      case 'warning': {
        return this.colors.yellow
      }

      default: {
        return this.colors.reset
      }
    }
  }

  private mapSeverityToSarifLevel(severity: string): string {
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
}
