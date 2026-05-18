import type { DiffLine, DiffHunk, DiffStats } from './types.js'
import { roundTo } from '../../utils/math-helpers.js'

export class DiffComputer {
  compute(oldLines: string[], newLines: string[]): DiffLine[] {
    const lcs = this.lcs(oldLines, newLines)
    const result: DiffLine[] = []
    let oi = 0
    let ni = 0
    let li = 0

    while (oi < oldLines.length || ni < newLines.length) {
      if (oi < oldLines.length && ni < newLines.length) {
        const oldLine = oldLines[oi]!
        const newLine = newLines[ni]!

        if (li < lcs.length && oldLine === lcs[li] && newLine === lcs[li]) {
          result.push({
            type: 'unchanged',
            content: oldLine,
            oldLineNumber: oi + 1,
            newLineNumber: ni + 1,
          })
          oi++
          ni++
          li++
        } else if (li < lcs.length && oldLine === lcs[li]) {
          result.push({
            type: 'added',
            content: newLine,
            newLineNumber: ni + 1,
          })
          ni++
        } else if (li < lcs.length && newLine === lcs[li]) {
          result.push({
            type: 'removed',
            content: oldLine,
            oldLineNumber: oi + 1,
          })
          oi++
        } else {
          result.push({
            type: 'removed',
            content: oldLine,
            oldLineNumber: oi + 1,
          })
          result.push({
            type: 'added',
            content: newLine,
            newLineNumber: ni + 1,
          })
          oi++
          ni++
        }
      } else if (oi < oldLines.length) {
        result.push({
          type: 'removed',
          content: oldLines[oi]!,
          oldLineNumber: oi + 1,
        })
        oi++
      } else if (ni < newLines.length) {
        result.push({
          type: 'added',
          content: newLines[ni]!,
          newLineNumber: ni + 1,
        })
        ni++
      }
    }

    return result
  }

  computeHunks(diffLines: DiffLine[], contextLines: number): DiffHunk[] {
    if (diffLines.length === 0) return []

    const changedIndices: number[] = []
    for (let i = 0; i < diffLines.length; i++) {
      if (diffLines[i]!.type !== 'unchanged') {
        changedIndices.push(i)
      }
    }

    if (changedIndices.length === 0) return []

    const ranges: Array<{ start: number; end: number }> = []
    let currentStart = Math.max(0, changedIndices[0]! - contextLines)
    let currentEnd = Math.min(diffLines.length - 1, changedIndices[0]! + contextLines)

    for (let i = 1; i < changedIndices.length; i++) {
      const idx = changedIndices[i]!
      const expandedStart = Math.max(0, idx - contextLines)
      const expandedEnd = Math.min(diffLines.length - 1, idx + contextLines)

      if (expandedStart <= currentEnd + 1) {
        currentEnd = expandedEnd
      } else {
        ranges.push({ start: currentStart, end: currentEnd })
        currentStart = expandedStart
        currentEnd = expandedEnd
      }
    }
    ranges.push({ start: currentStart, end: currentEnd })

    const hunks: DiffHunk[] = []
    for (const range of ranges) {
      const hunkLines = diffLines.slice(range.start, range.end + 1)
      const firstOld = hunkLines.find((l) => l.oldLineNumber !== undefined)
      const firstNew = hunkLines.find((l) => l.newLineNumber !== undefined)

      const oldStart = firstOld?.oldLineNumber ?? 1
      const newStart = firstNew?.newLineNumber ?? 1

      let oldCount = 0
      let newCount = 0
      for (const l of hunkLines) {
        if (l.type === 'removed' || l.type === 'unchanged') oldCount++
        if (l.type === 'added' || l.type === 'unchanged') newCount++
      }

      const header = `@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`

      hunks.push({
        oldStart,
        oldCount,
        newStart,
        newCount,
        lines: hunkLines,
        header,
      })
    }

    return hunks
  }

  lcs(a: string[], b: string[]): string[] {
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

  computeStats(diffLines: DiffLine[]): DiffStats {
    let additions = 0
    let deletions = 0
    let modifications = 0
    let unchanged = 0

    for (const line of diffLines) {
      switch (line.type) {
        case 'added':
          additions++
          break
        case 'removed':
          deletions++
          break
        case 'modified':
          modifications++
          break
        case 'unchanged':
          unchanged++
          break
      }
    }

    const totalLines = additions + deletions + modifications + unchanged
    const changePercent = totalLines > 0 ? ((additions + deletions + modifications) / totalLines) * 100 : 0

    return {
      additions,
      deletions,
      modifications,
      unchanged,
      totalLines,
      changePercent: roundTo(changePercent, 2),
    }
  }

  isUnchanged(oldContent: string, newContent: string): boolean {
    return oldContent === newContent
  }
}
