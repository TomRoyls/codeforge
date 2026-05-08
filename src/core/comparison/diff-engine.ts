import type {
  CodeStructure,
  LineDiff,
  StructureModification,
  WordDiff,
} from './types.js'
import { StructureComparator } from './structure-comparator.js'

export class DiffEngine {
  private comparator: StructureComparator

  constructor() {
    this.comparator = new StructureComparator()
  }

  computeLineDiff(left: string, right: string): LineDiff[] {
    const leftLines = left.split('\n')
    const rightLines = right.split('\n')
    return this.lcsDiff(leftLines, rightLines)
  }

  computeWordDiff(left: string, right: string): WordDiff[] {
    const leftWords = left.split(/(\s+)/)
    const rightWords = right.split(/(\s+)/)
    const lcs = this.computeLCS(leftWords, rightWords)
    const result: WordDiff[] = []

    let li = 0
    let ri = 0
    let pos = 0

    for (const common of lcs) {
      while (li < leftWords.length && leftWords[li] !== common) {
        result.push({
          type: 'delete',
          text: leftWords[li]!,
          position: pos,
        })
        li++
      }
      while (ri < rightWords.length && rightWords[ri] !== common) {
        result.push({
          type: 'add',
          text: rightWords[ri]!,
          position: pos,
        })
        ri++
      }
      if (li < leftWords.length && ri < rightWords.length) {
        result.push({
          type: 'equal',
          text: common,
          position: pos,
        })
        pos += common.length
        li++
        ri++
      }
    }

    while (li < leftWords.length) {
      result.push({
        type: 'delete',
        text: leftWords[li]!,
        position: pos,
      })
      li++
    }
    while (ri < rightWords.length) {
      result.push({
        type: 'add',
        text: rightWords[ri]!,
        position: pos,
      })
      ri++
    }

    return result
  }

  computeSemanticDiff(
    left: CodeStructure,
    right: CodeStructure
  ): StructureModification[] {
    const diff = this.comparator.compare(left, right)
    return diff.modified
  }

  applyPatch(source: string, diff: LineDiff[]): string {
    const lines = source.split('\n')
    const result: string[] = []
    let lineIdx = 0

    for (const d of diff) {
      if (d.type === 'equal') {
        if (lineIdx < lines.length) {
          result.push(lines[lineIdx]!)
          lineIdx++
        }
      } else if (d.type === 'add') {
        result.push(d.content)
      } else if (d.type === 'delete') {
        lineIdx++
      }
    }

    while (lineIdx < lines.length) {
      result.push(lines[lineIdx]!)
      lineIdx++
    }

    return result.join('\n')
  }

  reverseDiff(diff: LineDiff[]): LineDiff[] {
    return diff.map((d) => {
      if (d.type === 'add') {
        return { ...d, type: 'delete' }
      }
      if (d.type === 'delete') {
        return { ...d, type: 'add' }
      }
      return { ...d }
    })
  }

  countChanges(diff: LineDiff[]): {
    additions: number
    deletions: number
    changes: number
  } {
    let additions = 0
    let deletions = 0

    for (const d of diff) {
      if (d.type === 'add') additions++
      else if (d.type === 'delete') deletions++
    }

    return {
      additions,
      deletions,
      changes: additions + deletions,
    }
  }

  mergeDiffs(a: LineDiff[], b: LineDiff[]): LineDiff[] {
    const result: LineDiff[] = []
    let ai = 0
    let bi = 0

    while (ai < a.length || bi < b.length) {
      const aItem = a[ai]
      const bItem = b[bi]

      if (aItem && aItem.type === 'equal' && bItem && bItem.type === 'equal') {
        result.push(aItem)
        ai++
        bi++
      } else if (aItem && aItem.type === 'delete') {
        result.push(aItem)
        ai++
      } else if (bItem && bItem.type === 'add') {
        result.push(bItem)
        bi++
      } else if (aItem && bItem) {
        if (aItem.type === 'equal') {
          result.push(bItem)
          bi++
        } else if (bItem.type === 'equal') {
          result.push(aItem)
          ai++
        } else {
          result.push(aItem)
          result.push(bItem)
          ai++
          bi++
        }
      } else if (aItem) {
        result.push(aItem)
        ai++
      } else if (bItem) {
        result.push(bItem)
        bi++
      }
    }

    return result
  }

  createPatch(diffs: LineDiff[]): string {
    const lines: string[] = []

    for (const d of diffs) {
      if (d.type === 'add') {
        lines.push(`+${d.content}`)
      } else if (d.type === 'delete') {
        lines.push(`-${d.content}`)
      } else {
        lines.push(` ${d.content}`)
      }
    }

    return lines.join('\n')
  }

  private lcsDiff(left: string[], right: string[]): LineDiff[] {
    const lcs = this.computeLCS(left, right)
    const result: LineDiff[] = []

    let li = 0
    let ri = 0
    let lineNum = 0

    for (const common of lcs) {
      while (li < left.length && left[li] !== common) {
        result.push({
          type: 'delete',
          content: left[li]!,
          lineNumber: li + 1,
        })
        li++
      }
      while (ri < right.length && right[ri] !== common) {
        result.push({
          type: 'add',
          content: right[ri]!,
          lineNumber: ri + 1,
        })
        ri++
      }
      if (li < left.length && ri < right.length) {
        lineNum++
        result.push({
          type: 'equal',
          content: common,
          lineNumber: lineNum,
        })
        li++
        ri++
      }
    }

    while (li < left.length) {
      result.push({
        type: 'delete',
        content: left[li]!,
        lineNumber: li + 1,
      })
      li++
    }
    while (ri < right.length) {
      result.push({
        type: 'add',
        content: right[ri]!,
        lineNumber: ri + 1,
      })
      ri++
    }

    return result
  }

  private computeLCS<T>(a: T[], b: T[]): T[] {
    const m = a.length
    const n = b.length

    if (m === 0 || n === 0) return []

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
      new Array(n + 1).fill(0)
    )

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]! + 1
        } else {
          dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
        }
      }
    }

    const result: T[] = []
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
