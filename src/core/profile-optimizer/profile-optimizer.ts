import type {
  ProfileEntry,
  ProfileSnapshot,
  OptimizationSuggestion,
  Regression,
  Improvement,
  ComparisonResult,
  BudgetRule,
  BudgetResult,
  ProfileStatistics,
} from './types.js'

export class ProfileOptimizer {
  private snapshots: ProfileSnapshot[] = []
  private budgetRules: BudgetRule[] = []

  addSnapshot(snapshot: ProfileSnapshot): void {
    this.snapshots.push(snapshot)
  }

  addEntry(snapshotLabel: string, entry: ProfileEntry): void {
    const snapshot = this.snapshots.find((s) => s.label === snapshotLabel)
    if (snapshot) {
      snapshot.entries.push(entry)
    } else {
      this.snapshots.push({
        entries: [entry],
        timestamp: Date.now(),
        label: snapshotLabel,
      })
    }
  }

  getSnapshots(): ProfileSnapshot[] {
    return [...this.snapshots]
  }

  getSnapshot(label: string): ProfileSnapshot | undefined {
    return this.snapshots.find((s) => s.label === label)
  }

  compare(baselineLabel: string, currentLabel: string): ComparisonResult {
    const baseline = this.snapshots.find((s) => s.label === baselineLabel)
    const current = this.snapshots.find((s) => s.label === currentLabel)

    if (!baseline || !current) {
      throw new Error(`Snapshot not found: ${!baseline ? baselineLabel : currentLabel}`)
    }

    return {
      baseline,
      current,
      regressions: this.detectRegressions(baseline, current),
      improvements: this.detectImprovements(baseline, current),
    }
  }

  detectRegressions(baseline: ProfileSnapshot, current: ProfileSnapshot, threshold = 0): Regression[] {
    const regressions: Regression[] = []

    for (const currentEntry of current.entries) {
      const baselineEntry = baseline.entries.find((e) => e.name === currentEntry.name)
      if (!baselineEntry) continue

      const increase = currentEntry.duration - baselineEntry.duration
      const percentageChange =
        baselineEntry.duration === 0
          ? 0
          : (increase / baselineEntry.duration) * 100

      if (percentageChange > threshold) {
        regressions.push({
          name: currentEntry.name,
          baselineDuration: baselineEntry.duration,
          currentDuration: currentEntry.duration,
          increase,
          percentageChange,
        })
      }
    }

    return regressions
  }

  detectImprovements(baseline: ProfileSnapshot, current: ProfileSnapshot, threshold = 0): Improvement[] {
    const improvements: Improvement[] = []

    for (const currentEntry of current.entries) {
      const baselineEntry = baseline.entries.find((e) => e.name === currentEntry.name)
      if (!baselineEntry) continue

      const decrease = baselineEntry.duration - currentEntry.duration
      const percentageChange =
        baselineEntry.duration === 0
          ? 0
          : (decrease / baselineEntry.duration) * 100

      if (percentageChange > threshold) {
        improvements.push({
          name: currentEntry.name,
          baselineDuration: baselineEntry.duration,
          currentDuration: currentEntry.duration,
          decrease,
          percentageChange,
        })
      }
    }

    return improvements
  }

  getTopEntries(snapshot: ProfileSnapshot, n: number): ProfileEntry[] {
    return [...snapshot.entries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, n)
  }

  getHotspots(snapshot: ProfileSnapshot, threshold: number): ProfileEntry[] {
    const totalDuration = snapshot.entries.reduce((sum, e) => sum + e.duration, 0)
    if (totalDuration === 0) return []

    return snapshot.entries.filter((entry) => {
      const percentage = (entry.duration / totalDuration) * 100
      return percentage > threshold
    })
  }

  generateSuggestions(snapshot: ProfileSnapshot): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []
    const totalDuration = snapshot.entries.reduce((sum, e) => sum + e.duration, 0)

    for (const entry of snapshot.entries) {
      const durationPercentage = totalDuration === 0 ? 0 : (entry.duration / totalDuration) * 100

      if (entry.duration > 1000) {
        suggestions.push({
          target: entry.name,
          category: 'performance',
          description: `Entry '${entry.name}' has high duration of ${entry.duration}ms`,
          impact: durationPercentage > 50 ? 'high' : durationPercentage > 20 ? 'medium' : 'low',
          estimatedSaving: entry.duration * 0.3,
        })
      }

      if (entry.memory > 100) {
        suggestions.push({
          target: entry.name,
          category: 'memory',
          description: `Entry '${entry.name}' uses ${entry.memory}MB of memory`,
          impact: entry.memory > 500 ? 'high' : entry.memory > 200 ? 'medium' : 'low',
          estimatedSaving: entry.memory * 0.2,
        })
      }

      if (entry.calls > 1000) {
        suggestions.push({
          target: entry.name,
          category: 'calls',
          description: `Entry '${entry.name}' is called ${entry.calls} times`,
          impact: entry.calls > 10000 ? 'high' : entry.calls > 5000 ? 'medium' : 'low',
          estimatedSaving: entry.calls * 0.1,
        })
      }
    }

    return suggestions
  }

  addBudgetRule(rule: BudgetRule): void {
    this.budgetRules.push(rule)
  }

  removeBudgetRule(name: string): boolean {
    const index = this.budgetRules.findIndex((r) => r.name === name)
    if (index === -1) return false
    this.budgetRules.splice(index, 1)
    return true
  }

  checkBudget(snapshot: ProfileSnapshot): BudgetResult[] {
    return this.budgetRules.map((rule) => {
      const matchingEntries = snapshot.entries.filter((e) => e.name === rule.target)
      const actualDuration = matchingEntries.reduce((sum, e) => sum + e.duration, 0)
      const actualCalls = matchingEntries.reduce((sum, e) => sum + e.calls, 0)
      const actualMemory = matchingEntries.reduce((sum, e) => sum + e.memory, 0)

      const passed =
        actualDuration <= rule.maxDuration &&
        actualCalls <= rule.maxCalls &&
        actualMemory <= rule.maxMemory

      return {
        rule,
        passed,
        actualDuration,
        actualCalls,
        actualMemory,
      }
    })
  }

  getBudgetRules(): BudgetRule[] {
    return [...this.budgetRules]
  }

  getStatistics(snapshot: ProfileSnapshot): ProfileStatistics {
    const totalEntries = snapshot.entries.length
    const totalDuration = snapshot.entries.reduce((sum, e) => sum + e.duration, 0)
    const totalMemory = snapshot.entries.reduce((sum, e) => sum + e.memory, 0)
    const totalCalls = snapshot.entries.reduce((sum, e) => sum + e.calls, 0)
    const avgDuration = totalEntries === 0 ? 0 : totalDuration / totalEntries
    let maxDuration = 0
    if (totalEntries > 0) {
      maxDuration = snapshot.entries[0]!.duration
      for (let i = 1; i < snapshot.entries.length; i++) {
        if (snapshot.entries[i]!.duration > maxDuration) maxDuration = snapshot.entries[i]!.duration
      }
    }

    const categories: Record<string, number> = {}
    for (const entry of snapshot.entries) {
      if (entry.category in categories) {
        categories[entry.category]! += 1
      } else {
        categories[entry.category] = 1
      }
    }

    return {
      totalEntries,
      totalDuration,
      totalMemory,
      totalCalls,
      avgDuration,
      maxDuration,
      categories,
    }
  }

  mergeSnapshots(snapshots: ProfileSnapshot[]): ProfileSnapshot {
    if (snapshots.length === 0) {
      return {
        entries: [],
        timestamp: Date.now(),
        label: 'merged',
      }
    }

    const entryMap = new Map<string, { duration: number; calls: number; memory: number; category: string; count: number }>()

    for (const snapshot of snapshots) {
      for (const entry of snapshot.entries) {
        const existing = entryMap.get(entry.name)
        if (existing) {
          existing.duration += entry.duration
          existing.calls += entry.calls
          existing.memory += entry.memory
          existing.count += 1
        } else {
          entryMap.set(entry.name, {
            duration: entry.duration,
            calls: entry.calls,
            memory: entry.memory,
            category: entry.category,
            count: 1,
          })
        }
      }
    }

    const entries: ProfileEntry[] = [...entryMap].map(([name, data]) => ({
      name,
      duration: data.duration / data.count,
      calls: data.calls / data.count,
      memory: data.memory / data.count,
      category: data.category,
    }))

    return {
      entries,
      timestamp: Date.now(),
      label: 'merged',
    }
  }

  clear(): void {
    this.snapshots = []
    this.budgetRules = []
  }
}
