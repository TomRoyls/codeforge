import type { AnalysisResult, Reporter, ReporterOptions, Violation } from './types.js'

import { writeToFile } from '../utils/file-writer.js'
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replaceAll('"', '""')}"`
  return str
}
export class CSVReporter implements Reporter {
  readonly name = 'csv'
  private readonly outputPath: string | undefined
  constructor(options: ReporterOptions = {}) {
    this.outputPath = options.outputPath
  }
  format(violation: Violation): string {
    const fields = [
      violation.filePath,
      violation.line.toString(),
      violation.column.toString(),
      violation.severity,
      violation.ruleId,
      violation.message,
      violation.endLine?.toString() ?? '',
      violation.endColumn?.toString() ?? '',
      violation.source ?? '',
      violation.suggestion ?? '',
    ]
    return fields.map((field) => escapeCSVField(field)).join(',')
  }
  report(results: AnalysisResult): void {
    const lines: string[] = []
    lines.push(this.getHeader())
    for (const file of results.files) {
      for (const violation of file.violations) {
        lines.push(this.formatViolation(violation))
      }
    }
    lines.push('')
    lines.push(this.formatSummary(results))
    const csv = lines.join('\n')
    if (this.outputPath) {
      writeToFile(this.outputPath, csv)
    } else {
      console.log(csv)
    }
  }
  private formatSummary(results: AnalysisResult): string {
    return [
      '# Summary',
      `# Total Files: ${results.summary.totalFiles}`,
      `# Files with Violations: ${results.summary.filesWithViolations}`,
      `# Errors: ${results.summary.errorCount}`,
      `# Warnings: ${results.summary.warningCount}`,
      `# Info: ${results.summary.infoCount}`,
      `# Total Time: ${results.summary.totalTime}ms`,
      `# Timestamp: ${results.timestamp}`,
    ].join('\n')
  }
  private formatViolation(violation: Violation): string {
    return this.format(violation)
  }
  private getHeader(): string {
    const headers = [
      'file',
      'line',
      'column',
      'severity',
      'rule',
      'message',
      'end_line',
      'end_column',
      'source',
      'suggestion',
    ]
    return headers.map((header) => escapeCSVField(header)).join(',')
  }
}
export function createCSVReporter(options: ReporterOptions): Reporter {
  return new CSVReporter(options)
}

