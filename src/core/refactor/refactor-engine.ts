import type { RefactoringAction, RefactoringContext, RefactorSuggestion, TextEdit } from './types.js'

export class RefactorEngine {

  applyEdit(source: string, edits: TextEdit[]): string {
    if (edits.length === 0) return source

    const sortedEdits = [...edits].sort((a, b) => {
      if (a.startLine !== b.startLine) return b.startLine - a.startLine
      return b.startColumn - a.startColumn
    })

    let lines = source.split('\n')

    for (const edit of sortedEdits) {
      lines = this.applySingleEdit(lines, edit)
    }

    return lines.join('\n')
  }

  applyAction(context: RefactoringContext, action: RefactoringAction): string {
    return this.applyEdit(context.source, action.edits)
  }

  getSuggestions(context: RefactoringContext): RefactorSuggestion[] {
    const suggestions: RefactorSuggestion[] = []

    suggestions.push(...this.detectDuplicatedCode(context.source))
    suggestions.push(...this.detectLongFunctions(context.source, 20))
    suggestions.push(...this.detectComplexConditions(context.source))

    return suggestions
  }

  detectDuplicatedCode(source: string): RefactorSuggestion[] {
    const suggestions: RefactorSuggestion[] = []
    const lines = source.split('\n')

    const minBlockLines = 3
    const blocks = new Map<string, { line: number; filePath: string }[]>()

    for (let i = 0; i <= lines.length - minBlockLines; i++) {
      const block = lines.slice(i, i + minBlockLines).join('\n').trim()
      if (block.length < 10) continue

      const normalized = block.replace(/\s+/g, ' ').trim()
      if (!blocks.has(normalized)) {
        blocks.set(normalized, [])
      }
      blocks.get(normalized)!.push({ line: i + 1, filePath: 'file' })
    }

    for (const [block, locations] of blocks) {
      if (locations.length >= 2) {
        suggestions.push({
          type: 'extract-function',
          description: `Duplicated code block found (${locations.length} occurrences): "${block.substring(0, 50)}..."`,
          confidence: Math.min(0.9, 0.5 + locations.length * 0.1),
          impact: locations.length > 3 ? 'high' : 'medium',
          location: { filePath: locations[0]!.filePath, line: locations[0]!.line },
        })
      }
    }

    return suggestions
  }

  detectLongFunctions(source: string, maxLines: number): RefactorSuggestion[] {
    const suggestions: RefactorSuggestion[] = []
    const lines = source.split('\n')

    let inFunction = false
    let funcStartLine = 0
    let braceCount = 0
    let funcName = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim()

      const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/)
      if (funcMatch && !inFunction) {
        inFunction = true
        funcStartLine = i + 1
        funcName = funcMatch[1] ?? funcMatch[2] ?? 'anonymous'
        braceCount = 0
      }

      for (const ch of line) {
        if (ch === '{') braceCount++
        if (ch === '}') braceCount--
      }

      if (inFunction && braceCount <= 0 && i > funcStartLine - 1) {
        const funcLength = i + 1 - funcStartLine
        if (funcLength > maxLines) {
          suggestions.push({
            type: 'extract-function',
            description: `Function "${funcName}" is ${funcLength} lines long (max: ${maxLines}). Consider extracting parts into separate functions.`,
            confidence: Math.min(0.95, 0.6 + (funcLength - maxLines) * 0.02),
            impact: funcLength > maxLines * 2 ? 'high' : 'medium',
            location: { filePath: 'file', line: funcStartLine },
          })
        }
        inFunction = false
      }
    }

    return suggestions
  }

  detectComplexConditions(source: string): RefactorSuggestion[] {
    const suggestions: RefactorSuggestion[] = []
    const lines = source.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim()
      const andCount = (line.match(/&&/g) ?? []).length
      const orCount = (line.match(/\|\|/g) ?? []).length
      const totalOps = andCount + orCount

      if (totalOps >= 3) {
        suggestions.push({
          type: 'extract-variable',
          description: `Complex condition with ${totalOps} logical operators on line ${i + 1}. Consider extracting to a named variable.`,
          confidence: Math.min(0.9, 0.5 + totalOps * 0.1),
          impact: totalOps >= 5 ? 'high' : 'medium',
          location: { filePath: 'file', line: i + 1 },
        })
      }

      const parenDepth = this.maxParenDepth(line)
      if (parenDepth >= 4) {
        suggestions.push({
          type: 'simplify',
          description: `Deeply nested expression (depth: ${parenDepth}) on line ${i + 1}. Consider simplifying.`,
          confidence: 0.7,
          impact: parenDepth >= 6 ? 'high' : 'medium',
          location: { filePath: 'file', line: i + 1 },
        })
      }
    }

    return suggestions
  }

  previewChanges(source: string, action: RefactoringAction): string {
    const result = this.applyEdit(source, action.edits)
    const lines = result.split('\n')
    const previewLines: string[] = []

    const affectedLines = new Set<number>()
    for (const edit of action.edits) {
      for (let i = edit.startLine; i <= Math.max(edit.startLine, edit.endLine); i++) {
        affectedLines.add(i)
      }
    }

    const context = 2
    for (const lineNum of affectedLines) {
      const start = Math.max(1, lineNum - context)
      const end = Math.min(lines.length, lineNum + context)
      for (let i = start; i <= end; i++) {
        const marker = affectedLines.has(i) ? '+' : ' '
        previewLines.push(`${marker} ${i}: ${lines[i - 1]}`)
      }
      previewLines.push('---')
    }

    return previewLines.join('\n')
  }

  private applySingleEdit(lines: string[], edit: TextEdit): string[] {
    if (edit.startLine < 1 || edit.startLine > lines.length) return lines

    const result = [...lines]

    if (edit.startLine === edit.endLine) {
      const line = result[edit.startLine - 1]!
      const before = line.substring(0, edit.startColumn - 1)
      const after = line.substring(edit.endColumn - 1)
      result[edit.startLine - 1] = before + edit.newText + after
    } else {
      const firstLine = result[edit.startLine - 1]!
      const lastLine = result[edit.endLine - 1]!
      const before = firstLine.substring(0, edit.startColumn - 1)
      const after = lastLine.substring(edit.endColumn - 1)
      const newLine = before + edit.newText + after

      result.splice(edit.startLine - 1, edit.endLine - edit.startLine + 1, newLine)
    }

    return result
  }

  private maxParenDepth(line: string): number {
    let max = 0
    let current = 0
    for (const ch of line) {
      if (ch === '(') {
        current++
        if (current > max) max = current
      }
      if (ch === ')') current--
    }
    return max
  }
}
