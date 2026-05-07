import type { AnalysisResult, Reporter, ReporterOptions, Severity, Violation } from './types.js'

import { writeToFile } from '../utils/file-writer.js'

export type SonarQubeSeverity = 'BLOCKER' | 'CRITICAL' | 'INFO' | 'MAJOR' | 'MINOR'
export type SonarQubeType = 'BUG' | 'CODE_SMELL' | 'SECURITY_HOTSPOT' | 'VULNERABILITY'

export interface SonarQubeTextRange {
  endColumn: number
  endLine: number
  startColumn: number
  startLine: number
}

export interface SonarQubePrimaryLocation {
  filePath: string
  message: string
  textRange: SonarQubeTextRange
}

export interface SonarQubeIssue {
  engineId: string
  primaryLocation: SonarQubePrimaryLocation
  ruleId: string
  severity: SonarQubeSeverity
  type: SonarQubeType
}

export interface SonarQubeReport {
  issues: SonarQubeIssue[]
}

function mapSeverity(severity: Severity): SonarQubeSeverity {
  switch (severity) {
    case 'error': {
      return 'CRITICAL'
    }

    case 'warning': {
      return 'MAJOR'
    }

    case 'info': {
      return 'MINOR'
    }

    default: {
      return 'INFO'
    }
  }
}

function mapType(severity: Severity): SonarQubeType {
  switch (severity) {
    case 'error': {
      return 'BUG'
    }

    case 'warning': {
      return 'CODE_SMELL'
    }

    case 'info': {
      return 'CODE_SMELL'
    }

    default: {
      return 'CODE_SMELL'
    }
  }
}

export class SonarQubeReporter implements Reporter {
  readonly name = 'sonarqube'
  private readonly outputPath: string | undefined
  private readonly pretty: boolean

  constructor(options: ReporterOptions = {}) {
    this.pretty = options.pretty ?? false
    this.outputPath = options.outputPath
  }

  format(violation: Violation): string {
    const issue = this.transformViolation(violation)
    return JSON.stringify(issue)
  }

  report(results: AnalysisResult): void {
    const output = this.transformResults(results)
    const json = this.pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output)

    if (this.outputPath) {
      writeToFile(this.outputPath, json)
    } else {
      process.stdout.write(json + '\n')
    }
  }

  private transformResults(results: AnalysisResult): SonarQubeReport {
    const issues: SonarQubeIssue[] = []

    for (const file of results.files) {
      for (const violation of file.violations) {
        issues.push(this.transformViolation(violation))
      }
    }

    return { issues }
  }

  private transformViolation(violation: Violation): SonarQubeIssue {
    return {
      engineId: 'CodeForge',
      primaryLocation: {
        filePath: violation.filePath,
        message: violation.message,
        textRange: {
          startColumn: violation.column - 1,
          startLine: violation.line,
          endColumn: (violation.endColumn ?? violation.column) - 1,
          endLine: violation.endLine ?? violation.line,
        },
      },
      ruleId: violation.ruleId,
      severity: mapSeverity(violation.severity),
      type: mapType(violation.severity),
    }
  }
}
