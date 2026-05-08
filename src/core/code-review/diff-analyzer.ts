import type { DiffFile, DiffHunk, DiffChange } from './types.js'

export class DiffAnalyzer {
  parseUnifiedDiff(diffText: string): DiffFile[] {
    if (!diffText.trim()) return []

    const files: DiffFile[] = []
    const lines = diffText.split('\n')
    let i = 0

    while (i < lines.length) {
      if (lines[i]!.startsWith('diff --git')) {
        const fileInfo = this.parseDiffHeader(lines[i]!)
        let status: DiffFile['status'] = 'modified'
        let path = fileInfo.path

        i++

        let newFilePath = ''
        while (i < lines.length && !lines[i]!.startsWith('diff --git') && !lines[i]!.startsWith('@@')) {
          const line = lines[i]!
          if (line.startsWith('new file mode')) {
            status = 'added'
          } else if (line.startsWith('deleted file mode')) {
            status = 'deleted'
          } else if (line.startsWith('rename from')) {
            status = 'renamed'
          } else if (line.startsWith('rename to')) {
            newFilePath = line.substring('rename to '.length).trim()
          } else if (line.startsWith('--- a/')) {
            path = line.substring(6)
          } else if (line.startsWith('+++ b/')) {
            if (status !== 'renamed') {
              path = line.substring(6)
            }
          }
          i++
        }

        if (status === 'renamed' && newFilePath) {
          path = newFilePath
        }

        const hunks: DiffHunk[] = []
        while (i < lines.length && !lines[i]!.startsWith('diff --git')) {
          if (lines[i]!.startsWith('@@')) {
            const hunkStart = i
            i++
            const hunkLines: string[] = [lines[hunkStart]!]
            while (i < lines.length && !lines[i]!.startsWith('@@') && !lines[i]!.startsWith('diff --git')) {
              hunkLines.push(lines[i]!)
              i++
            }
            const hunk = this.parseHunk(hunkLines.join('\n'))
            hunks.push(hunk)
          } else {
            i++
          }
        }

        const file: DiffFile = {
          path,
          status,
          additions: 0,
          deletions: 0,
          hunks,
        }
        file.additions = this.countAdditions(file)
        file.deletions = this.countDeletions(file)
        files.push(file)
      } else {
        i++
      }
    }

    return files
  }

  parseDiffHeader(header: string): { path: string; status: DiffFile['status'] } {
    const match = header.match(/^diff --git a\/(.+?) b\/(.+)$/)
    if (!match || !match[2]) {
      return { path: '', status: 'modified' }
    }

    const pathA = match[1]!
    const pathB = match[2]

    if (pathA === pathB) {
      return { path: pathB, status: 'modified' }
    }

    if (pathA === '/dev/null') {
      return { path: pathB, status: 'added' }
    }

    if (pathB === '/dev/null') {
      return { path: pathA, status: 'deleted' }
    }

    return { path: pathB, status: 'renamed' }
  }

  parseHunk(hunkText: string): DiffHunk {
    const lines = hunkText.split('\n')
    const headerLine = lines[0]!

    const match = headerLine.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/)
    if (!match) {
      return {
        oldStart: 0,
        oldLines: 0,
        newStart: 0,
        newLines: 0,
        content: headerLine,
        changes: [],
      }
    }

    const oldStart = parseInt(match[1]!, 10)
    const oldLines = match[2] ? parseInt(match[2], 10) : 1
    const newStart = parseInt(match[3]!, 10)
    const newLines = match[4] ? parseInt(match[4], 10) : 1

    const changes: DiffChange[] = []
    let currentOldLine = oldStart
    let currentNewLine = newStart

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]!
      if (line.startsWith('+')) {
        changes.push({
          type: 'add',
          content: line.substring(1),
          lineNumber: currentNewLine,
        })
        currentNewLine++
      } else if (line.startsWith('-')) {
        changes.push({
          type: 'delete',
          content: line.substring(1),
          lineNumber: currentOldLine,
        })
        currentOldLine++
      } else {
        const content = line.startsWith(' ') ? line.substring(1) : line
        changes.push({
          type: 'normal',
          content,
          lineNumber: currentNewLine,
        })
        currentOldLine++
        currentNewLine++
      }
    }

    return {
      oldStart,
      oldLines,
      newStart,
      newLines,
      content: headerLine,
      changes,
    }
  }

  countAdditions(file: DiffFile): number {
    let count = 0
    for (const hunk of file.hunks) {
      for (const change of hunk.changes) {
        if (change.type === 'add') count++
      }
    }
    return count
  }

  countDeletions(file: DiffFile): number {
    let count = 0
    for (const hunk of file.hunks) {
      for (const change of hunk.changes) {
        if (change.type === 'delete') count++
      }
    }
    return count
  }

  getChangedLines(file: DiffFile): { additions: number[]; deletions: number[] } {
    const additions: number[] = []
    const deletions: number[] = []

    for (const hunk of file.hunks) {
      for (const change of hunk.changes) {
        if (change.type === 'add') {
          additions.push(change.lineNumber)
        } else if (change.type === 'delete') {
          deletions.push(change.lineNumber)
        }
      }
    }

    return { additions, deletions }
  }

  isLargeChange(file: DiffFile, threshold = 500): boolean {
    return file.additions + file.deletions > threshold
  }

  getFileExtension(filePath: string): string {
    const lastDot = filePath.lastIndexOf('.')
    if (lastDot === -1 || lastDot === filePath.length - 1) return ''
    return filePath.substring(lastDot + 1)
  }

  isTestFile(path: string): boolean {
    const normalized = path.toLowerCase()
    return (
      normalized.includes('.test.') ||
      normalized.includes('.spec.') ||
      normalized.includes('__tests__/') ||
      normalized.includes('/test/') ||
      normalized.includes('/tests/') ||
      normalized.startsWith('test/') ||
      normalized.startsWith('tests/')
    )
  }

  isConfigFile(path: string): boolean {
    const normalized = path.toLowerCase()
    const configPatterns = [
      '.json',
      '.yaml',
      '.yml',
      '.toml',
      '.ini',
      '.env',
      '.config.',
      'tsconfig',
      'package.json',
      '.eslintrc',
      '.prettierrc',
      '.babelrc',
      'vitest.config',
      'webpack.config',
      'rollup.config',
      'jest.config',
    ]
    return configPatterns.some((p) => normalized.includes(p))
  }
}
