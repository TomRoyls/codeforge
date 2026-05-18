import type { AnalysisSnapshot, DiffEntry, ComparisonSummary } from './types.js'

export class SnapshotDiffComputer {
  compute(a: AnalysisSnapshot, b: AnalysisSnapshot): DiffEntry[] {
    const allKeys = new Set([...a.entries.keys(), ...b.entries.keys()])
    const diffs: DiffEntry[] = []
    for (const key of allKeys) {
      const entryA = a.entries.get(key)
      const entryB = b.entries.get(key)
      const valA = entryA !== undefined ? entryA.value : undefined
      const valB = entryB !== undefined ? entryB.value : undefined
      const changeType = this.computeKey(valA, valB)
      diffs.push({ key, changeType, oldValue: valA, newValue: valB })
    }
    return diffs
  }

  computeKey(valA: unknown | undefined, valB: unknown | undefined): DiffEntry['changeType'] {
    const hasA = valA !== undefined
    const hasB = valB !== undefined
    if (!hasA && hasB) return 'added'
    if (hasA && !hasB) return 'removed'
    if (this.valuesEqual(valA, valB)) return 'unchanged'
    return 'modified'
  }

  summarize(diffs: DiffEntry[]): ComparisonSummary {
    const totalKeys = diffs.length
    let added = 0
    let removed = 0
    let modified = 0
    let unchanged = 0
    for (let i = 0; i < diffs.length; i++) {
      const ct = diffs[i]!.changeType
      if (ct === 'added') added++
      else if (ct === 'removed') removed++
      else if (ct === 'modified') modified++
      else unchanged++
    }
    const changed = added + removed + modified
    const changePercent = totalKeys === 0 ? 0 : Math.round((changed / totalKeys) * 10000) / 100
    return { totalKeys, added, removed, modified, unchanged, changePercent }
  }

  private valuesEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
