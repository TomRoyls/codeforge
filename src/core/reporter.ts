import * as fs from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import type { RuleViolation } from '../ast/visitor.js'

import { CLIError } from '../utils/errors.js'
import { COLORS, formatGitlab, formatJunit, formatSarif } from './reporter-formatters.js'

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
        return formatGitlab(report)
      }

      case 'html': {
        return this.formatHtml(report)
      }

      case 'json': {
        return this.formatJson(report)
      }

      case 'junit': {
        return formatJunit(report)
      }

      case 'markdown': {
        return this.formatMarkdown(report)
      }

      case 'sarif': {
        return formatSarif(report)
      }

      default: {
        throw CLIError.invalidInput(
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

}
