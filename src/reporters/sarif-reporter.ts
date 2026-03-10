import type { AnalysisResult, Reporter, ReporterOptions, Violation } from './types.js'

import { writeToFile } from '../utils/file-writer.js'

/**
 * SARIF (Static Analysis Results Interchange Format) v2.1.0
 * @see https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

export type SARIFLevel = 'error' | 'none' | 'note' | 'warning'

export interface SARIFArtifactLocation {
  uri: string
}

export interface SARIFRegion {
  endColumn?: number
  endLine?: number
  startColumn?: number
  startLine: number
}

export interface SARIFPhysicalLocation {
  artifactLocation: SARIFArtifactLocation
  region?: SARIFRegion
}

export interface SARIFLocation {
  physicalLocation: SARIFPhysicalLocation
}

export interface SARIFMessage {
  text: string
}

export interface SARIFFix {
  artifactChanges: Array<{
    artifactLocation: SARIFArtifactLocation
    replacements: Array<{
      deletedRegion: SARIFRegion
      insertedContent?: { text: string }
    }>
  }>
  description: SARIFMessage
}

export interface SARIFResult {
  fixes?: SARIFFix[]
  level: SARIFLevel
  locations: SARIFLocation[]
  message: SARIFMessage
  ruleId: string
}

export interface SARIFRule {
  fullDescription?: SARIFMessage
  helpUri?: string
  id: string
  shortDescription?: SARIFMessage
}

export interface SARIFToolComponent {
  informationUri?: string
  name: string
  rules?: SARIFRule[]
  version?: string
}

export interface SARIFTool {
  driver: SARIFToolComponent
}

export interface SARIFRun {
  results: SARIFResult[]
  tool: SARIFTool
}

export interface SARIFLog {
  $schema: string
  runs: SARIFRun[]
  version: '2.1.0'
}

function mapSeverity(severity: Violation['severity']): SARIFLevel {
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

/**
 * SARIF (Static Analysis Results Interchange Format) reporter
 * Outputs violations in SARIF v2.1.0 format for GitHub Advanced Security,
 * Azure DevOps, and VS Code integration.
 *
 * @see https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */
export class SARIFReporter implements Reporter {
  readonly name = 'sarif'
  private readonly outputPath: string | undefined
  private readonly pretty: boolean
  private version: string

  constructor(options: ReporterOptions = {}) {
    this.pretty = options.pretty ?? false
    this.outputPath = options.outputPath
    this.version = '0.1.0'
  }

  format(violation: Violation): string {
    const result = this.transformViolation(violation)
    return JSON.stringify(result)
  }

  report(results: AnalysisResult): void {
    const output = this.transformResults(results)
    const json = this.pretty ? JSON.stringify(output, null, 2) : JSON.stringify(output)

    if (this.outputPath) {
      writeToFile(this.outputPath, json)
    } else {
      console.log(json)
    }
  }

  private transformResults(results: AnalysisResult): SARIFLog {
    const sarifResults: SARIFResult[] = []
    const rulesMap = new Map<string, SARIFRule>()

    for (const file of results.files) {
      for (const violation of file.violations) {
        sarifResults.push(this.transformViolation(violation))

        if (!rulesMap.has(violation.ruleId)) {
          rulesMap.set(violation.ruleId, {
            id: violation.ruleId,
            shortDescription: { text: `Rule: ${violation.ruleId}` },
          })
        }
      }
    }

    if (results.version) {
      this.version = results.version
    }

    return {
      $schema:
        'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: [
        {
          results: sarifResults,
          tool: {
            driver: {
              informationUri: 'https://github.com/codeforge-dev/codeforge',
              name: 'CodeForge',
              rules: [...rulesMap.values()],
              version: this.version,
            },
          },
        },
      ],
      version: '2.1.0',
    }
  }

  private transformViolation(violation: Violation): SARIFResult {
    const result: SARIFResult = {
      level: mapSeverity(violation.severity),
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: violation.filePath,
            },
            region: {
              startColumn: violation.column,
              startLine: violation.line,
              ...(violation.endLine && { endLine: violation.endLine }),
              ...(violation.endColumn && { endColumn: violation.endColumn }),
            },
          },
        },
      ],
      message: { text: violation.message },
      ruleId: violation.ruleId,
    }

    if (violation.suggestion) {
      result.fixes = [
        {
          artifactChanges: [
            {
              artifactLocation: { uri: violation.filePath },
              replacements: [
                {
                  deletedRegion: {
                    startColumn: violation.column,
                    startLine: violation.line,
                  },
                  insertedContent: { text: violation.suggestion },
                },
              ],
            },
          ],
          description: { text: 'Suggested fix' },
        },
      ]
    }

    return result
  }
}
