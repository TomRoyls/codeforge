import type { Snapshot, SnapshotDiff, DiffLine } from './types.js'

export class SnapshotComparator {
  compare(actual: string, expected: string): SnapshotDiff {
    const actualLines = actual === '' ? [] : actual.split('\n')
    const expectedLines = expected === '' ? [] : expected.split('\n')
    const changes = this.computeDiff(actualLines, expectedLines)
    const added = changes.filter((c) => c.type === 'add').length
    const removed = changes.filter((c) => c.type === 'remove').length
    const unchanged = changes.filter((c) => c.type === 'equal').length
    const diff: SnapshotDiff = {
      id: '',
      name: '',
      added,
      removed,
      unchanged,
      changes,
      matchPercentage: 0,
    }
    diff.matchPercentage = this.calculateMatchPercentage(diff)
    return diff
  }

  compareSnapshots(actual: Snapshot, expected: Snapshot): SnapshotDiff {
    const diff = this.compare(actual.content, expected.content)
    diff.id = expected.id
    diff.name = expected.name
    return diff
  }

  calculateMatchPercentage(diff: SnapshotDiff): number {
    const total = diff.added + diff.removed + diff.unchanged
    if (total === 0) return 100
    return Math.round((diff.unchanged / total) * 10000) / 100
  }

  hasDifferences(diff: SnapshotDiff): boolean {
    return diff.added > 0 || diff.removed > 0
  }

  formatDiff(diff: SnapshotDiff): string {
    if (diff.changes.length === 0) return ''
    return diff.changes
      .map((line) => {
        const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '
        return `${prefix} ${line.lineNumber}: ${line.content}`
      })
      .join('\n')
  }

  filterDiff(diff: SnapshotDiff, type: 'add' | 'remove' | 'equal'): DiffLine[] {
    return diff.changes.filter((line) => line.type === type)
  }

  private computeDiff(actual: string[], expected: string[]): DiffLine[] {
    const changes: DiffLine[] = []
    let lineNum = 0

    const lcs = this.computeLCS(actual, expected)
    let ai = 0
    let ei = 0
    let li = 0

    while (ai < actual.length || ei < expected.length) {
      lineNum++
      if (ai < actual.length && ei < expected.length && li < lcs.length && actual[ai] === lcs[li] && expected[ei] === lcs[li]) {
        changes.push({ type: 'equal', content: actual[ai]!, lineNumber: lineNum })
        ai++
        ei++
        li++
      } else if (ai < actual.length && (li >= lcs.length || actual[ai] !== lcs[li])) {
        changes.push({ type: 'remove', content: actual[ai]!, lineNumber: lineNum })
        ai++
      } else if (ei < expected.length && (li >= lcs.length || expected[ei] !== lcs[li])) {
        changes.push({ type: 'add', content: expected[ei]!, lineNumber: lineNum })
        ei++
      } else if (ai < actual.length && ei < expected.length) {
        if (actual[ai] === expected[ei]) {
          changes.push({ type: 'equal', content: actual[ai]!, lineNumber: lineNum })
          ai++
          ei++
          li++
        } else {
          changes.push({ type: 'remove', content: actual[ai]!, lineNumber: lineNum })
          changes.push({ type: 'add', content: expected[ei]!, lineNumber: lineNum })
          ai++
          ei++
        }
      }
    }

    return changes
  }

  private computeLCS(a: string[], b: string[]): string[] {
    const m = a.length
    const n = b.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0) as number[])

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }

    const result: string[] = []
    let i = m
    let j = n
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        result.unshift(a[i - 1]!)
        i--
        j--
      } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
        i--
      } else {
        j--
      }
    }
    return result
  }
}
