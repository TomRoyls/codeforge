import type {
  AnalysisResult,
  FileAnalysisResult,
  Reporter,
  ReporterOptions,
  Violation,
} from './types.js'

import { escapeXml } from '../utils/escape.js'
import { writeToFile } from '../utils/file-writer.js'
import { countSeverities, formatTimeSeconds } from '../utils/format-utils.js'

export class JUnitReporter implements Reporter {
  readonly name = 'junit'
  private readonly outputPath: string | undefined

  constructor(options: ReporterOptions = {}) {
    this.outputPath = options.outputPath
  }

  format(violation: Violation): string {
    return `[${violation.severity.toUpperCase()}] [${violation.ruleId}] ${violation.filePath}:${violation.line}:${violation.column} ${violation.message}`
  }

  report(results: AnalysisResult): void {
    const xml = this.generateXML(results)

    if (this.outputPath) {
      writeToFile(this.outputPath, xml)
    } else {
      process.stdout.write(xml + '\n')
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private generateTestCase(violation: Violation, filepath: string): string {
    const className = escapeXml(filepath)
    const testName = escapeXml(`${violation.ruleId}: ${violation.message}`)
    const location = `${filepath}:${violation.line}:${violation.column}`

    const parts: string[] = [
      '    <testcase\n',
      `      name="${testName}"\n`,
      `      classname="${className}"\n`,
      '    >\n',
    ]

    if (violation.severity === 'error') {
      parts.push(
        '      <error\n',
        `        message="${escapeXml(violation.message)}"\n`,
        `        type="${violation.ruleId}"\n`,
        '      >\n',
        `        Location: ${escapeXml(location)}\n`,
      )
      if (violation.source) {
        parts.push(`        Source:\n${escapeXml(violation.source)}\n`)
      }

      if (violation.suggestion) {
        parts.push(`        Suggestion: ${escapeXml(violation.suggestion)}\n`)
      }

      parts.push('      </error>\n')
    } else {
      // warning and info are treated as failures in JUnit
      parts.push(
        '      <failure\n',
        `        message="${escapeXml(violation.message)}"\n`,
        `        type="${violation.severity}"\n`,
        '      >\n',
        `        Location: ${escapeXml(location)}\n`,
      )
      if (violation.source) {
        parts.push(`        Source:\n${escapeXml(violation.source)}\n`)
      }

      if (violation.suggestion) {
        parts.push(`        Suggestion: ${escapeXml(violation.suggestion)}\n`)
      }

      parts.push('      </failure>\n')
    }

    parts.push('    </testcase>\n')
    return parts.join('')
  }

  private generateTestSuite(file: FileAnalysisResult): string {
    const counts = countSeverities(file.violations)
    const errorCount = counts.error
    const warningCount = counts.warning
    const infoCount = counts.info
    const totalViolations = file.violations.length
    const timeInSeconds = (file.stats.totalTime / 1000).toFixed(3)

    const parts: string[] = [
      '  <testsuite\n',
      `    name="${escapeXml(file.filePath)}"\n`,
      `    tests="${totalViolations}"\n`,
      `    failures="${warningCount + infoCount}"\n`,
      `    errors="${errorCount}"\n`,
      `    time="${timeInSeconds}"\n`,
      `    timestamp="${this.formatTimestamp()}"\n`,
      '  >\n',
    ]

    for (const violation of file.violations) {
      parts.push(this.generateTestCase(violation, file.filePath))
    }

    parts.push('  </testsuite>\n')
    return parts.join('')
  }

  private generateXML(results: AnalysisResult): string {
    const { summary } = results
    const totalTests = summary.errorCount + summary.warningCount + summary.infoCount

    const parts: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<testsuites\n',
      `  name="CodeForge Analysis"\n`,
      `  tests="${totalTests}"\n`,
      `  failures="${summary.warningCount + summary.infoCount}"\n`,
      `  errors="${summary.errorCount}"\n`,
      `  time="${formatTimeSeconds(summary.totalTime)}"\n`,
      '>\n',
    ]

    for (const file of results.files) {
      parts.push(this.generateTestSuite(file))
    }

    parts.push('</testsuites>')
    return parts.join('')
  }
}
