import * as crypto from 'node:crypto'
import * as fs from 'node:fs'
import path from 'node:path'

import type { AnalysisResult, Reporter, ReporterOptions, Violation } from './types.js'

/**
 * GitLab Code Quality severity levels
 * @see https://docs.gitlab.com/ee/ci/testing/code_quality.html
 */
export type GitLabSeverity = 'blocker' | 'critical' | 'info' | 'major' | 'minor'

/**
 * GitLab Code Quality violation format
 * @see https://docs.gitlab.com/ee/ci/testing/code_quality.html#implementing-a-custom-tool
 */
export interface GitLabCodeQualityViolation {
  /** Optional: The source code content that caused the violation */
  content?: {
    /** Body of the content */
    body: string
  }
  /** Description of the code quality violation */
  description: string
  /** A unique fingerprint for this violation to track it across runs */
  fingerprint: string
  /** Location information */
  location: {
    /** Line information */
    lines: {
      /** Beginning line number */
      begin: number
    }
    /** The relative file path */
    path: string
  }
  /** The severity of the violation */
  severity: GitLabSeverity
}

/**
 * Maps internal severity to GitLab Code Quality severity
 */
function mapSeverity(severity: Violation['severity']): GitLabSeverity {
  switch (severity) {
    case 'error': {
      return 'major'
    }

    case 'info': {
      return 'info'
    }

    case 'warning': {
      return 'minor'
    }

    default: {
      return 'info'
    }
  }
}

/**
 * Generates a unique fingerprint for a violation using MD5 hash
 * Format: MD5(filePath:line:column:ruleId)
 */
function generateFingerprint(violation: Violation): string {
  const fingerprintInput = `${violation.filePath}:${violation.line}:${violation.column}:${violation.ruleId}`
  return crypto.createHash('md5').update(fingerprintInput).digest('hex')
}

/**
 * GitLab Code Quality JSON format reporter
 * Outputs violations in the GitLab Code Quality JSON format for
 * merge request widget integration.
 *
 * @see https://docs.gitlab.com/ee/ci/testing/code_quality.html
 */
export class GitLabReporter implements Reporter {
  readonly name = 'gitlab'
  private readonly outputPath: string | undefined
  private readonly pretty: boolean

  constructor(options: ReporterOptions = {}) {
    this.pretty = options.pretty ?? false
    this.outputPath = options.outputPath
  }

  format(violation: Violation): string {
    const output: GitLabCodeQualityViolation = this.transformViolation(violation)
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

  private transformResults(results: AnalysisResult): GitLabCodeQualityViolation[] {
    const violations: GitLabCodeQualityViolation[] = []

    for (const file of results.files) {
      for (const violation of file.violations) {
        violations.push(this.transformViolation(violation))
      }
    }

    return violations
  }

  private transformViolation(violation: Violation): GitLabCodeQualityViolation {
    const transformed: GitLabCodeQualityViolation = {
      description: violation.message,
      fingerprint: generateFingerprint(violation),
      location: {
        lines: {
          begin: violation.line,
        },
        path: violation.filePath,
      },
      severity: mapSeverity(violation.severity),
    }

    if (violation.source) {
      transformed.content = {
        body: violation.source,
      }
    }

    return transformed
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
