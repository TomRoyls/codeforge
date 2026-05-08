import { DiffComputer } from './diff-computer.js'
import type { DiffResult, DiffStats, DiffLine, PatchOptions, ApplyResult } from './types.js'
import { DEFAULT_PATCH_OPTIONS } from './types.js'

export class DiffEngine {
  private options: PatchOptions
  private computer: DiffComputer

  constructor(options?: Partial<PatchOptions>) {
    this.options = { ...DEFAULT_PATCH_OPTIONS, ...options }
    this.computer = new DiffComputer()
  }

  diff(oldContent: string, newContent: string, path?: string): DiffResult {
    const oldLines = this.prepareLines(oldContent)
    const newLines = this.prepareLines(newContent)

    const diffLines = this.computer.compute(oldLines, newLines)
    const hunks = this.computer.computeHunks(diffLines, this.options.contextLines)
    const stats = this.computer.computeStats(diffLines)

    return {
      hunks,
      oldContent,
      newContent,
      stats,
      path,
    }
  }

  diffFiles(oldFiles: Record<string, string>, newFiles: Record<string, string>): DiffResult[] {
    const results: DiffResult[] = []
    const allPaths = new Set<string>([...Object.keys(oldFiles), ...Object.keys(newFiles)])

    for (const filePath of allPaths) {
      const oldContent = oldFiles[filePath] ?? ''
      const newContent = newFiles[filePath] ?? ''

      if (!this.computer.isUnchanged(oldContent, newContent)) {
        results.push(this.diff(oldContent, newContent, filePath))
      }
    }

    return results
  }

  formatPatch(diffResult: DiffResult): string {
    const lines: string[] = []

    if (diffResult.path) {
      lines.push(`--- a/${diffResult.path}`)
      lines.push(`+++ b/${diffResult.path}`)
    } else {
      lines.push('--- a/original')
      lines.push('+++ b/modified')
    }

    for (const hunk of diffResult.hunks) {
      lines.push(hunk.header)
      for (const line of hunk.lines) {
        switch (line.type) {
          case 'added':
            lines.push(`+${line.content}`)
            break
          case 'removed':
            lines.push(`-${line.content}`)
            break
          case 'unchanged':
            lines.push(` ${line.content}`)
            break
          case 'modified':
            lines.push(`-${line.content}`)
            break
        }
      }
    }

    return lines.join('\n')
  }

  formatUnified(diffResult: DiffResult): string {
    const lines: string[] = []

    for (const hunk of diffResult.hunks) {
      lines.push(hunk.header)
      for (const line of hunk.lines) {
        const prefix =
          line.type === 'added' ? '+' : line.type === 'removed' ? '-' : line.type === 'modified' ? '!' : ' '
        lines.push(`${prefix}${line.content}`)
      }
    }

    return lines.join('\n')
  }

  formatSideBySide(diffResult: DiffResult, width: number = 80): string {
    const halfWidth = Math.floor(width / 2) - 3
    const lines: string[] = []

    for (const hunk of diffResult.hunks) {
      lines.push(hunk.header)

      let i = 0
      while (i < hunk.lines.length) {
        const line = hunk.lines[i]!
        if (line.type === 'removed' && i + 1 < hunk.lines.length && hunk.lines[i + 1]!.type === 'added') {
          const left = line.content.padEnd(halfWidth).slice(0, halfWidth)
          const right = hunk.lines[i + 1]!.content.padEnd(halfWidth).slice(0, halfWidth)
          lines.push(`- ${left} | + ${right}`)
          i += 2
        } else if (line.type === 'removed') {
          const left = line.content.padEnd(halfWidth).slice(0, halfWidth)
          lines.push(`- ${left} |`)
          i++
        } else if (line.type === 'added') {
          const right = line.content.padEnd(halfWidth).slice(0, halfWidth)
          lines.push(`  ${''.padEnd(halfWidth)} | + ${right}`)
          i++
        } else {
          const left = line.content.padEnd(halfWidth).slice(0, halfWidth)
          const right = line.content.padEnd(halfWidth).slice(0, halfWidth)
          lines.push(`  ${left} |   ${right}`)
          i++
        }
      }
    }

    return lines.join('\n')
  }

  applyPatch(original: string, patch: string): ApplyResult {
    const originalLines = original.split('\n')
    const patchLines = patch.split('\n')
    const result: string[] = []
    const conflicts: string[] = []
    let rejects = 0
    let applied = false

    let origIdx = 0
    let i = 0

    while (i < patchLines.length) {
      const line = patchLines[i]!

      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
        if (match) {
          const oldStart = parseInt(match[1]!, 10) - 1
          while (origIdx < oldStart && origIdx < originalLines.length) {
            result.push(originalLines[origIdx]!)
            origIdx++
          }
        }
        i++
        continue
      }

      if (line.startsWith('---') || line.startsWith('+++')) {
        i++
        continue
      }

      if (line.startsWith('-')) {
        const content = line.slice(1)
        if (origIdx < originalLines.length && originalLines[origIdx] === content) {
          origIdx++
          applied = true
        } else {
          rejects++
          conflicts.push(`Line ${origIdx + 1}: expected "${content}", found "${originalLines[origIdx] ?? ''}"`)
        }
        i++
        continue
      }

      if (line.startsWith('+')) {
        result.push(line.slice(1))
        applied = true
        i++
        continue
      }

      if (line.startsWith(' ') || line === '') {
        const content = line.startsWith(' ') ? line.slice(1) : ''
        if (origIdx < originalLines.length) {
          result.push(originalLines[origIdx]!)
          origIdx++
        } else {
          result.push(content)
        }
        i++
        continue
      }

      i++
    }

    while (origIdx < originalLines.length) {
      result.push(originalLines[origIdx]!)
      origIdx++
    }

    return {
      success: rejects === 0,
      applied,
      rejects,
      conflicts,
    }
  }

  reverse(diffResult: DiffResult): DiffResult {
    const reversedHunks = diffResult.hunks.map((hunk) => {
      const reversedLines: DiffLine[] = hunk.lines.map((line) => {
        switch (line.type) {
          case 'added':
            return { ...line, type: 'removed' as const, oldLineNumber: line.newLineNumber, newLineNumber: line.oldLineNumber }
          case 'removed':
            return { ...line, type: 'added' as const, oldLineNumber: line.newLineNumber, newLineNumber: line.oldLineNumber }
          default:
            return line
        }
      })

      const oldCount = reversedLines.filter((l) => l.type === 'removed' || l.type === 'unchanged').length
      const newCount = reversedLines.filter((l) => l.type === 'added' || l.type === 'unchanged').length

      return {
        oldStart: hunk.newStart,
        oldCount,
        newStart: hunk.oldStart,
        newCount,
        lines: reversedLines,
        header: `@@ -${hunk.newStart},${oldCount} +${hunk.oldStart},${newCount} @@`,
      }
    })

    const reversedStats: DiffStats = {
      additions: diffResult.stats.deletions,
      deletions: diffResult.stats.additions,
      modifications: diffResult.stats.modifications,
      unchanged: diffResult.stats.unchanged,
      totalLines: diffResult.stats.totalLines,
      changePercent: diffResult.stats.changePercent,
    }

    return {
      hunks: reversedHunks,
      oldContent: diffResult.newContent,
      newContent: diffResult.oldContent,
      stats: reversedStats,
      path: diffResult.path,
    }
  }

  getOptions(): PatchOptions {
    return { ...this.options }
  }

  mergeDiffs(diff1: DiffResult, diff2: DiffResult): DiffResult {
    const allLines: DiffLine[] = []

    for (const hunk of diff1.hunks) {
      allLines.push(...hunk.lines)
    }
    for (const hunk of diff2.hunks) {
      allLines.push(...hunk.lines)
    }

    const mergedHunks = this.computer.computeHunks(allLines, this.options.contextLines)
    const mergedStats = this.computer.computeStats(allLines)

    return {
      hunks: mergedHunks,
      oldContent: diff1.oldContent,
      newContent: diff2.newContent,
      stats: mergedStats,
      path: diff1.path ?? diff2.path,
    }
  }

  private prepareLines(content: string): string[] {
    let lines = content.split('\n')

    if (this.options.ignoreWhitespace) {
      lines = lines.map((l) => l.replace(/\s+/g, ' ').trim())
    }

    if (this.options.ignoreCase) {
      lines = lines.map((l) => l.toLowerCase())
    }

    if (this.options.maxLineLength > 0) {
      lines = lines.map((l) => (l.length > this.options.maxLineLength ? l.slice(0, this.options.maxLineLength) : l))
    }

    return lines
  }
}
