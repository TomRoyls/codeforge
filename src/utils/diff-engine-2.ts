export interface DiffEntry {
  type: 'equal' | 'insert' | 'delete'
  value: string
  oldLine?: number
  newLine?: number
}

export class DiffEngine2 {
  static diff(oldLines: string[], newLines: string[]): DiffEntry[] {
    const m = oldLines.length
    const n = newLines.length
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }

    const entries: DiffEntry[] = []
    let i = m, j = n
    while (i > 0 && j > 0) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        entries.unshift({ type: 'equal', value: oldLines[i - 1], oldLine: i, newLine: j })
        i--; j--
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        entries.unshift({ type: 'delete', value: oldLines[i - 1], oldLine: i })
        i--
      } else {
        entries.unshift({ type: 'insert', value: newLines[j - 1], newLine: j })
        j--
      }
    }
    while (i > 0) {
      entries.unshift({ type: 'delete', value: oldLines[i - 1], oldLine: i })
      i--
    }
    while (j > 0) {
      entries.unshift({ type: 'insert', value: newLines[j - 1], newLine: j })
      j--
    }

    return entries
  }

  static toUnifiedDiff(entries: DiffEntry[], oldName = 'old', newName = 'new'): string {
    const lines: string[] = []
    lines.push(`--- ${oldName}`)
    lines.push(`+++ ${newName}`)
    for (const entry of entries) {
      if (entry.type === 'equal') {
        lines.push(` ${entry.value}`)
      } else if (entry.type === 'insert') {
        lines.push(`+${entry.value}`)
      } else {
        lines.push(`-${entry.value}`)
      }
    }
    return lines.join('\n')
  }

  static stats(entries: DiffEntry[]): { additions: number; deletions: number; unchanged: number } {
    let additions = 0, deletions = 0, unchanged = 0
    for (const entry of entries) {
      if (entry.type === 'insert') additions++
      else if (entry.type === 'delete') deletions++
      else unchanged++
    }
    return { additions, deletions, unchanged }
  }

  static applyDiff(oldLines: string[], entries: DiffEntry[]): string[] {
    const result: string[] = []
    for (const entry of entries) {
      if (entry.type === 'equal' || entry.type === 'insert') {
        result.push(entry.value)
      }
    }
    return result
  }

  static hasChanges(entries: DiffEntry[]): boolean {
    return entries.some(e => e.type !== 'equal')
  }

  static wordDiff(oldText: string, newText: string): DiffEntry[] {
    return DiffEngine2.diff(oldText.split(/\s+/), newText.split(/\s+/))
  }

  static charDiff(oldText: string, newText: string): DiffEntry[] {
    return DiffEngine2.diff(oldText.split(''), newText.split(''))
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): DiffEngine2 { return new DiffEngine2() }
  equals(other: unknown): boolean { return other instanceof DiffEngine2 }
}
