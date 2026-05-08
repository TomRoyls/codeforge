import type { ScanConfig, SecurityFinding, ScanResult, SecurityRule } from './types.js'
import { DEFAULT_SCAN_CONFIG } from './types.js'
import { PatternMatcher } from './pattern-matcher.js'

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
}

export class SecurityScanner {
  private config: ScanConfig
  private matcher: PatternMatcher

  constructor(config: Partial<ScanConfig> = {}) {
    this.config = { ...DEFAULT_SCAN_CONFIG, ...config }
    this.matcher = new PatternMatcher(PatternMatcher.getDefaultRules())

    for (const rule of this.config.customRules) {
      this.matcher.addRule(rule)
    }
  }

  scanFiles(files: Map<string, string>): ScanResult {
    const startTime = performance.now()
    const allFindings: SecurityFinding[] = []
    const thresholdLevel = SEVERITY_ORDER[this.config.severityThreshold] ?? 4

    for (const [filePath, content] of files) {
      const findings = this.matcher.match(content, filePath)
      allFindings.push(...findings)
    }

    const filtered = allFindings.filter((finding) => {
      const findingLevel = SEVERITY_ORDER[finding.severity] ?? 4
      return findingLevel <= thresholdLevel
    })

    const capped = filtered.slice(0, this.config.maxFindings)

    const endTime = performance.now()

    return {
      findings: capped,
      fileCount: files.size,
      scanDuration: endTime - startTime,
      ruleCount: this.matcher.getRules().length,
    }
  }

  scanContent(content: string, file: string): SecurityFinding[] {
    const thresholdLevel = SEVERITY_ORDER[this.config.severityThreshold] ?? 4
    const findings = this.matcher.match(content, file)

    return findings.filter((finding) => {
      const findingLevel = SEVERITY_ORDER[finding.severity] ?? 4
      return findingLevel <= thresholdLevel
    })
  }

  addRule(rule: SecurityRule): void {
    this.matcher.addRule(rule)
  }

  getConfig(): ScanConfig {
    return this.config
  }

  getDefaultRules(): SecurityRule[] {
    return PatternMatcher.getDefaultRules()
  }
}
