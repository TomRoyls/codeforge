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
      console.log(xml)
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private generateTestCase(violation: Violation, filepath: string): string {
    const className = escapeXml(filepath)
    const testName = escapeXml(`${violation.ruleId}: ${violation.message}`)
    const location = `${filepath}:${violation.line}:${violation.column}`

    let xml = '    <testcase\n'
    xml += `      name="${testName}"\n`
    xml += `      classname="${className}"\n`
    xml += `    >\n`

    if (violation.severity === 'error') {
      xml += '      <error\n'
      xml += `        message="${escapeXml(violation.message)}"\n`
      xml += `        type="${violation.ruleId}"\n`
      xml += `      >\n`
      xml += `        Location: ${escapeXml(location)}\n`
      if (violation.source) {
        xml += `        Source:\n${escapeXml(violation.source)}\n`
      }

      if (violation.suggestion) {
        xml += `        Suggestion: ${escapeXml(violation.suggestion)}\n`
      }

      xml += '      </error>\n'
    } else {
      // warning and info are treated as failures in JUnit
      xml += '      <failure\n'
      xml += `        message="${escapeXml(violation.message)}"\n`
      xml += `        type="${violation.severity}"\n`
      xml += `      >\n`
      xml += `        Location: ${escapeXml(location)}\n`
      if (violation.source) {
        xml += `        Source:\n${escapeXml(violation.source)}\n`
      }

      if (violation.suggestion) {
        xml += `        Suggestion: ${escapeXml(violation.suggestion)}\n`
      }

      xml += '      </failure>\n'
    }

    xml += '    </testcase>\n'
    return xml
  }

  private generateTestSuite(file: FileAnalysisResult): string {
    const counts = countSeverities(file.violations)
    const errorCount = counts.error
    const warningCount = counts.warning
    const infoCount = counts.info
    const totalViolations = file.violations.length
    const timeInSeconds = (file.stats.totalTime / 1000).toFixed(3)

    let xml = '  <testsuite\n'
    xml += `    name="${escapeXml(file.filePath)}"\n`
    xml += `    tests="${totalViolations}"\n`
    xml += `    failures="${warningCount + infoCount}"\n`
    xml += `    errors="${errorCount}"\n`
    xml += `    time="${timeInSeconds}"\n`
    xml += `    timestamp="${this.formatTimestamp()}"\n`
    xml += '  >\n'

    for (const violation of file.violations) {
      xml += this.generateTestCase(violation, file.filePath)
    }

    xml += '  </testsuite>\n'
    return xml
  }

  private generateXML(results: AnalysisResult): string {
    const { summary } = results
    const totalTests = summary.errorCount + summary.warningCount + summary.infoCount

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<testsuites\n'
    xml += `  name="CodeForge Analysis"\n`
    xml += `  tests="${totalTests}"\n`
    xml += `  failures="${summary.warningCount + summary.infoCount}"\n`
    xml += `  errors="${summary.errorCount}"\n`
    xml += `  time="${formatTimeSeconds(summary.totalTime)}"\n`
    xml += '>\n'

    for (const file of results.files) {
      xml += this.generateTestSuite(file)
    }

    xml += '</testsuites>'
    return xml
  }
}
