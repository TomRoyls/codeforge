import type { ErrorEntry, ErrorGroup, ErrorSummary, ErrorReport } from './types.js'

export class ErrorAggregator {
  aggregate(entries: ErrorEntry[]): ErrorGroup[] {
    const groups = new Map<string, { entries: ErrorEntry[]; files: Set<string> }>()

    for (const entry of entries) {
      const existing = groups.get(entry.ruleId)
      if (existing) {
        existing.entries.push(entry)
        existing.files.add(entry.filePath)
      } else {
        groups.set(entry.ruleId, { entries: [entry], files: new Set([entry.filePath]) })
      }
    }

    const result: ErrorGroup[] = []
    for (const [ruleId, data] of groups) {
      result.push({
        ruleId,
        count: data.entries.length,
        severity: data.entries[0]!.severity,
        files: Array.from(data.files),
        representative: data.entries[0]!,
      })
    }

    result.sort((a, b) => b.count - a.count)
    return result
  }

  summarize(entries: ErrorEntry[]): ErrorSummary {
    const byRule = new Map<string, number>()
    const byFile = new Map<string, number>()
    const bySeverity = new Map<string, number>()
    let fixableCount = 0
    let errors = 0
    let warnings = 0
    let info = 0
    let suggestions = 0

    for (const entry of entries) {
      byRule.set(entry.ruleId, (byRule.get(entry.ruleId) ?? 0) + 1)
      byFile.set(entry.filePath, (byFile.get(entry.filePath) ?? 0) + 1)
      if (entry.fix !== undefined) fixableCount++

      switch (entry.severity) {
        case 'error':
          errors++
          break
        case 'warning':
          warnings++
          break
        case 'info':
          info++
          break
        case 'suggestion':
          suggestions++
          break
      }
    }

    bySeverity.set('error', errors)
    bySeverity.set('warning', warnings)
    bySeverity.set('info', info)
    bySeverity.set('suggestion', suggestions)

    return {
      total: entries.length,
      errors,
      warnings,
      info,
      suggestions,
      fixableCount,
      filesAffected: byFile.size,
      byRule,
      byFile,
      bySeverity,
    }
  }

  generateReport(entries: ErrorEntry[], format: string): ErrorReport {
    return {
      summary: this.summarize(entries),
      groups: this.aggregate(entries),
      entries: [...entries],
      generatedAt: Date.now(),
      format,
    }
  }

  getTopRules(entries: ErrorEntry[], count: number): ErrorGroup[] {
    const groups = this.aggregate(entries)
    return groups.slice(0, count)
  }

  getTopFiles(entries: ErrorEntry[], count: number): string[] {
    const fileCounts = new Map<string, number>()
    for (const entry of entries) {
      fileCounts.set(entry.filePath, (fileCounts.get(entry.filePath) ?? 0) + 1)
    }
    const sorted = Array.from(fileCounts.entries()).sort((a, b) => b[1] - a[1])
    return sorted.slice(0, count).map(([file]) => file)
  }

  getHeatmap(entries: ErrorEntry[]): Map<string, number> {
    const heatmap = new Map<string, number>()
    for (const entry of entries) {
      heatmap.set(entry.filePath, (heatmap.get(entry.filePath) ?? 0) + 1)
    }
    return heatmap
  }

  getTrend(
    current: ErrorSummary,
    previous: ErrorSummary
  ): { improved: number; regressed: number; new: number; fixed: number } {
    const improved = previous.total > current.total ? previous.total - current.total : 0
    const regressed = current.total > previous.total ? current.total - previous.total : 0
    const newCount = current.errors - previous.errors > 0 ? current.errors - previous.errors : 0
    const fixedCount = previous.errors - current.errors > 0 ? previous.errors - current.errors : 0

    return {
      improved,
      regressed,
      new: newCount,
      fixed: fixedCount,
    }
  }
}
