import type { AnalysisFinding, AnalysisReport, AggregatedReport, AggregatorConfig } from './types.js'
import { FindingDeduplicator } from './finding-dedup.js'

const SEVERITY_ORDER: Record<string, number> = {
  error: 0,
  warning: 1,
  info: 2,
}

const DEFAULT_DEDUP_KEY = (f: AnalysisFinding): string => `${f.ruleId}:${f.file}:${f.line}`
const DEFAULT_SORT_BY: ('severity' | 'file' | 'line')[] = ['severity', 'file', 'line']

export class ReportAggregator {
  private config: AggregatorConfig
  private dedup: FindingDeduplicator

  constructor(config?: Partial<AggregatorConfig>) {
    this.config = {
      deduplicate: config?.deduplicate ?? true,
      dedupKey: config?.dedupKey ?? DEFAULT_DEDUP_KEY,
      sortBy: config?.sortBy ?? DEFAULT_SORT_BY,
    }
    this.dedup = new FindingDeduplicator(this.config.dedupKey)
  }

  aggregate(reports: AnalysisReport[]): AggregatedReport {
    const sources = reports.map((r) => r.source)
    const allFindings = reports.flatMap((r) => r.findings)
    const metricSets = reports.map((r) => r.metrics)

    let findings = [...allFindings]
    let duplicatesRemoved = 0

    if (this.config.deduplicate) {
      const result = this.dedup.deduplicate(findings)
      findings = result.findings
      duplicatesRemoved = result.duplicatesRemoved
    }

    findings = this.applySorting(findings)

    return {
      sources,
      totalFindings: findings.length,
      findings,
      bySeverity: this.getSeverityCounts(findings),
      byRule: this.getRuleCounts(findings),
      byFile: this.getFileCounts(findings),
      mergedMetrics: this.mergeMetrics(metricSets),
      duplicatesRemoved,
    }
  }

  mergeMetrics(metricSets: Record<string, number>[]): Record<string, number> {
    const result: Record<string, number> = {}
    for (const metrics of metricSets) {
      for (const [key, value] of Object.entries(metrics)) {
        result[key] = (result[key] ?? 0) + value
      }
    }
    return result
  }

  sortBySeverity(findings: AnalysisFinding[]): AnalysisFinding[] {
    return [...findings].sort((a, b) => {
      const orderA = SEVERITY_ORDER[a.severity] ?? 99
      const orderB = SEVERITY_ORDER[b.severity] ?? 99
      return orderA - orderB
    })
  }

  sortByFile(findings: AnalysisFinding[]): AnalysisFinding[] {
    return [...findings].sort((a, b) => {
      const fileCompare = a.file.localeCompare(b.file)
      if (fileCompare !== 0) return fileCompare
      return a.line - b.line
    })
  }

  getSeverityCounts(findings: AnalysisFinding[]): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const finding of findings) {
      counts[finding.severity] = (counts[finding.severity] ?? 0) + 1
    }
    return counts
  }

  getRuleCounts(findings: AnalysisFinding[]): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const finding of findings) {
      counts[finding.ruleId] = (counts[finding.ruleId] ?? 0) + 1
    }
    return counts
  }

  getFileCounts(findings: AnalysisFinding[]): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const finding of findings) {
      counts[finding.file] = (counts[finding.file] ?? 0) + 1
    }
    return counts
  }

  getConfig(): AggregatorConfig {
    return this.config
  }

  private applySorting(findings: AnalysisFinding[]): AnalysisFinding[] {
    let sorted = [...findings]
    const reversed = [...this.config.sortBy].reverse()
    for (const field of reversed) {
      if (field === 'severity') {
        sorted = this.sortBySeverity(sorted)
      } else if (field === 'file') {
        sorted = this.sortByFile(sorted)
      } else if (field === 'line') {
        sorted = [...sorted].sort((a, b) => a.line - b.line)
      }
    }
    return sorted
  }
}
