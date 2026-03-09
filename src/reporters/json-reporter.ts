import * as fs from 'node:fs'
import path from 'node:path'

import type {
  AnalysisResult,
  FileAnalysisResult,
  Reporter,
  ReporterOptions,
  Violation,
} from './types.js'

export interface JsonOutput {
  files: JsonFileResult[]
  summary: AnalysisResult['summary']
  timestamp: string
  version: string
}

export interface JsonFileResult {
  filePath: string
  stats: {
    analysisTime: number
    parseTime: number
    totalTime: number
  }
  violations: JsonViolation[]
}

export interface JsonViolation {
  location: {
    column: number
    endColumn?: number
    endLine?: number
    file: string
    line: number
  }
  message: string
  meta?: Record<string, unknown>
  ruleId: string
  severity: Violation['severity']
  source?: string
  suggestion?: string
}

export class JSONReporter implements Reporter {
  readonly name = 'json'
  private readonly outputPath: string | undefined
  private readonly pretty: boolean

  constructor(options: ReporterOptions = {}) {
    this.pretty = options.pretty ?? false
    this.outputPath = options.outputPath
  }

  format(violation: Violation): string {
    const output: JsonViolation = {
      location: {
        column: violation.column,
        endColumn: violation.endColumn,
        endLine: violation.endLine,
        file: violation.filePath,
        line: violation.line,
      },
      message: violation.message,
      meta: violation.meta,
      ruleId: violation.ruleId,
      severity: violation.severity,
      source: violation.source,
      suggestion: violation.suggestion,
    }
    return JSON.stringify(output)
  }

  report(results: AnalysisResult): void {
    const output = this.transformResults(results)
    const json = this.pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output)

    if (this.outputPath) {
      this.writeToFile(json)
    } else {
      console.log(json)
    }
  }

  private transformResults(results: AnalysisResult): JsonOutput {
    return {
      files: results.files.map((file: FileAnalysisResult) => ({
        filePath: file.filePath,
        stats: file.stats,
        violations: file.violations.map((v: Violation) => this.transformViolation(v)),
      })),
      summary: results.summary,
      timestamp: results.timestamp,
      version: results.version ?? '1.0.0',
    }
  }

  private transformViolation(violation: Violation): JsonViolation {
    return {
      location: {
        column: violation.column,
        endColumn: violation.endColumn,
        endLine: violation.endLine,
        file: violation.filePath,
        line: violation.line,
      },
      message: violation.message,
      meta: violation.meta,
      ruleId: violation.ruleId,
      severity: violation.severity,
      source: violation.source,
      suggestion: violation.suggestion,
    }
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
