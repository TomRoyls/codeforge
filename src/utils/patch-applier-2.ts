export interface PatchHunk {
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  lines: string[]
}

export interface Patch {
  oldFile: string
  newFile: string
  hunks: PatchHunk[]
}

export class PatchApplier2 {
  static parse(unifiedDiff: string): Patch[] {
    const lines = unifiedDiff.split('\n')
    const patches: Patch[] = []
    let currentPatch: Patch | null = null
    let currentHunk: PatchHunk | null = null

    for (const line of lines) {
      if (line.startsWith('--- ')) {
        if (currentHunk && currentPatch) { currentPatch.hunks.push(currentHunk); currentHunk = null }
        if (currentPatch) patches.push(currentPatch)
        currentPatch = { oldFile: line.substring(4).trim(), newFile: '', hunks: [] }
      } else if (line.startsWith('+++ ')) {
        if (currentPatch) currentPatch.newFile = line.substring(4).trim()
      } else if (line.startsWith('@@')) {
        if (currentHunk && currentPatch) currentPatch.hunks.push(currentHunk)
        const match = line.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/)
        if (match) {
          currentHunk = {
            oldStart: parseInt(match[1]),
            oldCount: parseInt(match[2]),
            newStart: parseInt(match[3]),
            newCount: parseInt(match[4]),
            lines: [],
          }
        }
      } else if (currentHunk && (line.startsWith(' ') || line.startsWith('+') || line.startsWith('-'))) {
        currentHunk.lines.push(line)
      }
    }
    if (currentHunk && currentPatch) currentPatch.hunks.push(currentHunk)
    if (currentPatch) patches.push(currentPatch)
    return patches
  }

  static apply(source: string, patches: Patch[]): string {
    let lines = source.split('\n')

    for (const patch of patches) {
      for (const hunk of patch.hunks) {
        const result: string[] = []
        let lineIdx = 0
        for (const line of lines) {
          if (lineIdx + 1 >= hunk.oldStart && lineIdx + 1 < hunk.oldStart + hunk.oldCount) {
            const hunkLine = hunk.lines[lineIdx + 1 - hunk.oldStart]
            if (hunkLine !== undefined && hunkLine.startsWith('-')) {
              continue
            }
          }
          result.push(line)
          lineIdx++
        }
        for (const hunkLine of hunk.lines) {
          if (hunkLine.startsWith('+')) {
            const insertIdx = hunk.newStart - 1 + hunk.lines.indexOf(hunkLine) - hunk.lines.filter((l, i) => i < hunk.lines.indexOf(hunkLine) && l.startsWith('-')).length
            if (insertIdx >= 0 && insertIdx <= result.length) {
              result.splice(insertIdx, 0, hunkLine.substring(1))
            }
          }
        }
        lines = result
      }
    }
    return lines.join('\n')
  }

  static createPatch(oldFile: string, newFile: string, oldLines: string[], newLines: string[]): string {
    const lines: string[] = []
    lines.push(`--- ${oldFile}`)
    lines.push(`+++ ${newFile}`)
    lines.push(`@@ -1,${oldLines.length} +1,${newLines.length} @@`)
    const maxLen = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < maxLen; i++) {
      if (i < oldLines.length && i < newLines.length) {
        if (oldLines[i] === newLines[i]) {
          lines.push(` ${oldLines[i]}`)
        } else {
          lines.push(`-${oldLines[i]}`)
          lines.push(`+${newLines[i]}`)
        }
      } else if (i < oldLines.length) {
        lines.push(`-${oldLines[i]}`)
      } else if (i < newLines.length) {
        lines.push(`+${newLines[i]}`)
      }
    }
    return lines.join('\n')
  }

  static reverse(patch: Patch): Patch {
    return {
      oldFile: patch.newFile,
      newFile: patch.oldFile,
      hunks: patch.hunks.map(h => ({
        oldStart: h.newStart,
        oldCount: h.newCount,
        newStart: h.oldStart,
        newCount: h.oldCount,
        lines: h.lines.map(l => {
          if (l.startsWith('+')) return '-' + l.substring(1)
          if (l.startsWith('-')) return '+' + l.substring(1)
          return l
        }),
      })),
    }
  }

  static hunkCount(patches: Patch[]): number {
    return patches.reduce((sum, p) => sum + p.hunks.length, 0)
  }

  toArray(): Patch[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): PatchApplier2 { return new PatchApplier2() }
  equals(other: unknown): boolean { return other instanceof PatchApplier2 }
}
