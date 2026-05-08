import type { RenameResult, TextEdit } from './types.js'

export class RenameEngine {
  renameSymbol(source: string, oldName: string, newName: string): RenameResult {
    if (!oldName || !newName || oldName === newName) {
      return { success: false, oldName, newName, occurrences: 0, edits: new Map() }
    }

    const occurrences = this.findOccurrences(source, oldName)
    if (occurrences.length === 0) {
      return { success: false, oldName, newName, occurrences: 0, edits: new Map() }
    }

    const edits: TextEdit[] = []
    for (const occ of occurrences) {
      if (this.isInString(source, occ.line, occ.column) || this.isInComment(source, occ.line, occ.column)) {
        continue
      }
      if (!this.isWordBoundary(source, occ, oldName.length)) {
        continue
      }
      edits.push({
        startLine: occ.line,
        startColumn: occ.column,
        endLine: occ.line,
        endColumn: occ.column + oldName.length,
        newText: newName,
      })
    }

    const editMap = new Map<string, TextEdit[]>()
    editMap.set('file', edits)

    return {
      success: edits.length > 0,
      oldName,
      newName,
      occurrences: edits.length,
      edits: editMap,
    }
  }

  findOccurrences(source: string, name: string): Array<{ line: number; column: number; context: string }> {
    const results: Array<{ line: number; column: number; context: string }> = []
    const lines = source.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      let col = line.indexOf(name)
      while (col !== -1) {
        results.push({
          line: i + 1,
          column: col + 1,
          context: line.trim(),
        })
        col = line.indexOf(name, col + 1)
      }
    }

    return results
  }

  isInString(source: string, line: number, column: number): boolean {
    const lines = source.split('\n')
    if (line < 1 || line > lines.length) return false
    const lineContent = lines[line - 1]!
    if (column < 1 || column > lineContent.length) return false

    const before = lineContent.substring(0, column - 1)
    let singleQuotes = 0
    let doubleQuotes = 0
    let escaped = false

    for (const ch of before) {
      if (escaped) {
        escaped = false
        continue
      }
      if (ch === '\\') {
        escaped = true
        continue
      }
      if (ch === "'" && doubleQuotes % 2 === 0) singleQuotes++
      if (ch === '"' && singleQuotes % 2 === 0) doubleQuotes++
    }

    return singleQuotes % 2 === 1 || doubleQuotes % 2 === 1
  }

  isInComment(source: string, line: number, column: number): boolean {
    const lines = source.split('\n')
    if (line < 1 || line > lines.length) return false
    const lineContent = lines[line - 1]!
    const trimmed = lineContent.substring(0, column - 1)

    if (trimmed.includes('//')) {
      const commentIdx = trimmed.indexOf('//')
      if (commentIdx < column) return true
    }

    let inBlockComment = false
    for (let i = 0; i < line - 1; i++) {
      const prevLine = lines[i]!
      for (let j = 0; j < prevLine.length; j++) {
        if (j < prevLine.length - 1 && prevLine[j] === '/' && prevLine[j + 1] === '*') {
          inBlockComment = true
        }
        if (j > 0 && prevLine[j - 1] === '*' && prevLine[j] === '/') {
          inBlockComment = false
        }
      }
    }

    const currentLineBefore = lineContent.substring(0, column - 1)
    for (let j = 0; j < currentLineBefore.length; j++) {
      if (j < currentLineBefore.length - 1 && currentLineBefore[j] === '/' && currentLineBefore[j + 1] === '*') {
        inBlockComment = true
      }
      if (j > 0 && currentLineBefore[j - 1] === '*' && currentLineBefore[j] === '/') {
        inBlockComment = false
      }
    }

    return inBlockComment
  }

  renameInScope(source: string, name: string, newName: string, scopeStart: number, scopeEnd: number): string {
    const lines = source.split('\n')
    const result: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1
      if (lineNum >= scopeStart && lineNum <= scopeEnd) {
        result.push(this.renameInLine(lines[i]!, name, newName))
      } else {
        result.push(lines[i]!)
      }
    }

    return result.join('\n')
  }

  private isWordBoundary(source: string, occurrence: { line: number; column: number; context: string }, nameLength: number): boolean {
    const lines = source.split('\n')
    const lineIdx = occurrence.line - 1
    const colIdx = occurrence.column - 1
    const line = lines[lineIdx]

    if (!line) return false

    const before = colIdx > 0 ? line[colIdx - 1] : ''
    const afterIdx = colIdx + nameLength
    const after = afterIdx < line.length ? line[afterIdx] : ''

    const isWordChar = (ch: string) => /\w/.test(ch)

    if (before && isWordChar(before)) return false
    if (after && isWordChar(after)) return false

    return true
  }

  private renameInLine(line: string, oldName: string, newName: string): string {
    let result = ''
    let i = 0
    const isWordChar = (ch: string) => /\w/.test(ch)

    while (i < line.length) {
      if (line.substring(i, i + oldName.length) === oldName) {
        const before = i > 0 ? line[i - 1] : ''
        const afterIdx = i + oldName.length
        const after = afterIdx < line.length ? line[afterIdx] : ''

        if ((!before || !isWordChar(before)) && (!after || !isWordChar(after))) {
          result += newName
          i += oldName.length
          continue
        }
      }
      result += line[i]
      i++
    }

    return result
  }
}
