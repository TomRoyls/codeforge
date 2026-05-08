import type { AnalysisFinding } from './types.js'

const SEVERITY_RANK: Record<string, number> = {
  error: 3,
  warning: 2,
  info: 1,
}

export class FindingDeduplicator {
  private keyFn: (f: AnalysisFinding) => string

  constructor(keyFn?: (f: AnalysisFinding) => string) {
    this.keyFn = keyFn ?? ((f: AnalysisFinding): string => `${f.ruleId}:${f.file}:${f.line}`)
  }

  deduplicate(findings: AnalysisFinding[]): { findings: AnalysisFinding[]; duplicatesRemoved: number } {
    const best = new Map<string, AnalysisFinding>()
    let removed = 0

    for (const finding of findings) {
      const key = this.keyFn(finding)
      const existing = best.get(key)
      if (existing !== undefined) {
        removed++
        best.set(key, this.mergeFindings(existing, finding))
      } else {
        best.set(key, finding)
      }
    }

    return {
      findings: [...best.values()],
      duplicatesRemoved: removed,
    }
  }

  createKey(finding: AnalysisFinding): string {
    return this.keyFn(finding)
  }

  findDuplicates(findings: AnalysisFinding[]): Map<string, AnalysisFinding[]> {
    const groups = new Map<string, AnalysisFinding[]>()
    for (const finding of findings) {
      const key = this.keyFn(finding)
      const group = groups.get(key) ?? []
      group.push(finding)
      groups.set(key, group)
    }

    const duplicates = new Map<string, AnalysisFinding[]>()
    for (const [key, group] of groups) {
      if (group.length > 1) {
        duplicates.set(key, group)
      }
    }
    return duplicates
  }

  mergeFindings(a: AnalysisFinding, b: AnalysisFinding): AnalysisFinding {
    const rankA = SEVERITY_RANK[a.severity] ?? 0
    const rankB = SEVERITY_RANK[b.severity] ?? 0
    return rankA >= rankB ? a : b
  }
}
