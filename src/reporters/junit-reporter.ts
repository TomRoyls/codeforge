import * as fs from 'node:fs'
import path from 'node:path'

import type {
  AnalysisResult,
  FileAnalysisResult,
  Reporter,
  ReporterOptions,
  Violation,
} from './types.js'

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
      this.writeToFile(xml)
    } else {
      console.log(xml)
    }
  }

  private escapeXML(str: string): string {
    return str
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;')
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private generateTestCase(violation: Violation, filepath: string): string {
    const className = this.escapeXML(filepath)
    const testName = this.escapeXML(`${violation.ruleId}: ${violation.message}`)
    const location = `${filepath}:${violation.line}:${violation.column}`

    let xml = '    <testcase\n'
    xml += `      name="${testName}"\n`
    xml += `      classname="${className}"\n`
    xml += `    >\n`

    if (violation.severity === 'error') {
      xml += '      <error\n'
      xml += `        message="${this.escapeXML(violation.message)}"\n`
      xml += `        type="${violation.ruleId}"\n`
      xml += `      >\n`
      xml += `        Location: ${this.escapeXML(location)}\n`
      if (violation.source) {
        xml += `        Source:\n${this.escapeXML(violation.source)}\n`
      }

      if (violation.suggestion) {
        xml += `        Suggestion: ${this.escapeXML(violation.suggestion)}\n`
      }

      xml += '      </error>\n'
    } else {
      // warning and info are treated as failures in JUnit
      xml += '      <failure\n'
      xml += `        message="${this.escapeXML(violation.message)}"\n`
      xml += `        type="${violation.severity}"\n`
      xml += `      >\n`
      xml += `        Location: ${this.escapeXML(location)}\n`
      if (violation.source) {
        xml += `        Source:\n${this.escapeXML(violation.source)}\n`
      }

      if (violation.suggestion) {
        xml += `        Suggestion: ${this.escapeXML(violation.suggestion)}\n`
      }

      xml += '      </failure>\n'
    }

    xml += '    </testcase>\n'
    return xml
  }

  private generateTestSuite(file: FileAnalysisResult): string {
    const errorCount = file.violations.filter((v) => v.severity === 'error').length
    const warningCount = file.violations.filter((v) => v.severity === 'warning').length
    const infoCount = file.violations.filter((v) => v.severity === 'info').length
    const totalViolations = file.violations.length
    const timeInSeconds = (file.stats.totalTime / 1000).toFixed(3)

    let xml = '  <testsuite\n'
    xml += `    name="${this.escapeXML(file.filePath)}"\n`
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
    xml += `  time="${(summary.totalTime / 1000).toFixed(3)}"\n`
    xml += '>\n'

    for (const file of results.files) {
      xml += this.generateTestSuite(file)
    }

    xml += '</testsuites>'
    return xml
  }

  private writeToFile(content: string): void {
    if (!this.outputPath) return

    const dir = path.dirname(this.outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(this.outputPath, content, 'utf8')
  }
}
