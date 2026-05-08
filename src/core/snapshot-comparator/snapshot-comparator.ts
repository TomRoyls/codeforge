import { SnapshotDiffComputer } from './diff-computer.js'
import type { AnalysisSnapshot, ComparisonResult, DiffEntry, TrendAnalysis } from './types.js'

export class SnapshotComparator {
  private snapshots: Map<string, AnalysisSnapshot> = new Map()
  private diffComputer: SnapshotDiffComputer

  constructor() {
    this.diffComputer = new SnapshotDiffComputer()
  }

  addSnapshot(snapshot: AnalysisSnapshot): void {
    this.snapshots.set(snapshot.id, snapshot)
  }

  getSnapshot(id: string): AnalysisSnapshot | undefined {
    return this.snapshots.get(id)
  }

  compare(idA: string, idB: string): ComparisonResult {
    const a = this.snapshots.get(idA)
    const b = this.snapshots.get(idB)
    if (a === undefined) {
      throw new Error(`Snapshot not found: ${idA}`)
    }
    if (b === undefined) {
      throw new Error(`Snapshot not found: ${idB}`)
    }
    const diffs = this.diffComputer.compute(a, b)
    const summary = this.diffComputer.summarize(diffs)
    return { snapshotA: idA, snapshotB: idB, diffs, summary }
  }

  compareLatest(n: number = 2): ComparisonResult[] {
    const sorted = [...this.snapshots.values()].sort(
      (a, b) => a.timestamp - b.timestamp,
    )
    const latest = sorted.slice(-n)
    const results: ComparisonResult[] = []
    for (let i = 0; i < latest.length - 1; i++) {
      const current = latest[i]!
      const next = latest[i + 1]!
      results.push(this.compare(current.id, next.id))
    }
    return results
  }

  analyzeTrend(metric: string, snapshots?: AnalysisSnapshot[]): TrendAnalysis {
    const source = snapshots ?? [...this.snapshots.values()].sort(
      (a, b) => a.timestamp - b.timestamp,
    )
    const values: number[] = []
    for (const snapshot of source) {
      const entry = snapshot.entries.get(metric)
      if (entry !== undefined && typeof entry.value === 'number') {
        values.push(entry.value)
      }
    }
    if (values.length < 2) {
      return { metric, direction: 'stable', changeRate: 0, dataPoints: values.length }
    }
    const diffs: number[] = []
    for (let i = 1; i < values.length; i++) {
      diffs.push(values[i]! - values[i - 1]!)
    }
    const allPositive = diffs.every((d) => d > 0)
    const allNegative = diffs.every((d) => d < 0)
    let direction: TrendAnalysis['direction'] = 'stable'
    if (allPositive) {
      direction = 'degrading'
    } else if (allNegative) {
      direction = 'improving'
    }
    const totalChange = diffs.reduce((sum, d) => sum + d, 0)
    const changeRate = Math.round((totalChange / diffs.length) * 100) / 100
    return { metric, direction, changeRate, dataPoints: values.length }
  }

  getDriftReport(idA: string, idB: string): DiffEntry[] {
    const result = this.compare(idA, idB)
    return result.diffs.filter((d) => d.changeType !== 'unchanged')
  }

  getSnapshotIds(): string[] {
    return [...this.snapshots.keys()]
  }

  clear(): void {
    this.snapshots.clear()
  }
}
