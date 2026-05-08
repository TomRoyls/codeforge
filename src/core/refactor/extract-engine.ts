import type { ExtractResult, TextEdit } from './types.js'

export class ExtractEngine {
  extractFunction(source: string, startLine: number, endLine: number, name: string): ExtractResult {
    const lines = source.split('\n')
    if (source.length === 0 || startLine < 1 || endLine > lines.length || startLine > endLine) {
      return { success: false, extractedName: name, sourceEdits: [], newDeclaration: '', declarationLocation: { line: 0, column: 0 } }
    }

    const extractedLines = lines.slice(startLine - 1, endLine)
    const extractedCode = extractedLines.join('\n')

    const params = this.detectParameters(extractedCode, source)
    const returnInfo = this.detectReturnValue(extractedCode)

    this.generateFunctionSignature(params, returnInfo.type)
    const indent = this.detectIndent(lines[startLine - 1]!)
    const bodyLines = extractedLines.map(l => indent + l)
    const newDeclaration = `function ${name}(${params.join(', ')}): ${returnInfo.type} {\n${bodyLines.join('\n')}\n}\n`

    const insertionPoint = this.findInsertionPoint(source, startLine)

    const callArgs = params.length > 0 ? params.map(p => this.getParameterName(p)).join(', ') : ''
    const callExpr = `${name}(${callArgs})`
    const replacement = returnInfo.hasReturn ? `const ${this.generateResultName(name)} = ${callExpr}` : callExpr

    const sourceEdits: TextEdit[] = [
      {
        startLine: insertionPoint.line,
        startColumn: 1,
        endLine: insertionPoint.line,
        endColumn: 1,
        newText: newDeclaration + '\n',
      },
      {
        startLine,
        startColumn: 1,
        endLine,
        endColumn: lines[endLine - 1]!.length + 1,
        newText: replacement,
      },
    ]

    return {
      success: true,
      extractedName: name,
      sourceEdits,
      newDeclaration,
      declarationLocation: { line: insertionPoint.line, column: 1 },
    }
  }

  extractVariable(source: string, expression: string, name: string, line: number): ExtractResult {
    if (!expression || !name) {
      return { success: false, extractedName: name, sourceEdits: [], newDeclaration: '', declarationLocation: { line: 0, column: 0 } }
    }

    const lines = source.split('\n')
    if (line < 1 || line > lines.length) {
      return { success: false, extractedName: name, sourceEdits: [], newDeclaration: '', declarationLocation: { line: 0, column: 0 } }
    }

    const lineContent = lines[line - 1]!
    const exprCol = lineContent.indexOf(expression)
    if (exprCol === -1) {
      return { success: false, extractedName: name, sourceEdits: [], newDeclaration: '', declarationLocation: { line: 0, column: 0 } }
    }

    const indent = this.detectIndent(lineContent)
    const newDeclaration = `${indent}const ${name} = ${expression}`
    const insertionPoint = this.findInsertionPoint(source, line)

    const sourceEdits: TextEdit[] = [
      {
        startLine: insertionPoint.line,
        startColumn: 1,
        endLine: insertionPoint.line,
        endColumn: 1,
        newText: newDeclaration + '\n',
      },
      {
        startLine: line,
        startColumn: exprCol + 1,
        endLine: line,
        endColumn: exprCol + 1 + expression.length,
        newText: name,
      },
    ]

    return {
      success: true,
      extractedName: name,
      sourceEdits,
      newDeclaration,
      declarationLocation: { line: insertionPoint.line, column: 1 },
    }
  }

  detectExpression(source: string, line: number, startCol: number, endCol: number): string {
    const lines = source.split('\n')
    if (line < 1 || line > lines.length) return ''
    const lineContent = lines[line - 1]!
    if (startCol < 1 || endCol > lineContent.length + 1 || startCol > endCol) return ''
    return lineContent.substring(startCol - 1, endCol - 1)
  }

  findInsertionPoint(source: string, line: number): { line: number; column: number } {
    const lines = source.split('\n')

    let scopeStart = line
    let braceCount = 0

    for (let i = line - 1; i >= 0; i--) {
      const l = lines[i]!
      for (const ch of l) {
        if (ch === '{') braceCount++
        if (ch === '}') braceCount--
      }
      if (braceCount > 0) {
        scopeStart = i + 1
        break
      }
      scopeStart = i + 1
    }

    let insertLine = scopeStart
    for (let i = scopeStart - 1; i < line - 1; i++) {
      const l = lines[i]!.trim()
      if (l.startsWith('function ') || l.startsWith('const ') || l.startsWith('let ') || l.startsWith('class ')) {
        insertLine = i + 2
      }
    }

    if (insertLine < 1) insertLine = 1
    return { line: insertLine, column: 1 }
  }

  generateFunctionSignature(params: string[], returnType: string): string {
    const paramList = params.join(', ')
    return `function extracted(${paramList}): ${returnType}`
  }

  private detectParameters(extractedCode: string, _fullSource: string): string[] {
    const identifierPattern = /\b([a-zA-Z_$][\w$]*)\b/g
    const declaredPattern = /\b(?:const|let|var|function|class|import|export)\s+([a-zA-Z_$][\w$]*)\b/g
    const paramsPattern = /\(([^)]*)\)/

    const declared = new Set<string>()
    let match: RegExpExecArray | null
    const keywords = new Set(['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try', 'catch', 'finally', 'new', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of', 'true', 'false', 'null', 'undefined', 'this', 'const', 'let', 'var', 'function', 'class', 'import', 'export', 'from', 'async', 'await', 'yield'])

    while ((match = declaredPattern.exec(extractedCode)) !== null) {
      declared.add(match[1]!)
    }

    const funcMatch = paramsPattern.exec(extractedCode)
    if (funcMatch) {
      const funcParams = funcMatch[1]!.split(',').map(p => p.trim().split(':')[0]!.trim().split('=')[0]!.trim()).filter(p => p && !p.startsWith('...'))
      for (const p of funcParams) {
        declared.add(p)
      }
    }

    const used = new Set<string>()
    identifierPattern.lastIndex = 0
    while ((match = identifierPattern.exec(extractedCode)) !== null) {
      const id = match[1]!
      if (!keywords.has(id) && !declared.has(id)) {
        used.add(id)
      }
    }

    return Array.from(used)
  }

  private detectReturnValue(extractedCode: string): { type: string; hasReturn: boolean } {
    const returnMatch = extractedCode.match(/\breturn\s+/)
    if (returnMatch) {
      return { type: 'unknown', hasReturn: true }
    }
    return { type: 'void', hasReturn: false }
  }

  private detectIndent(line: string): string {
    const match = line.match(/^(\s*)/)
    return match?.[1] ?? ''
  }

  private getParameterName(param: string): string {
    const parts = param.split(':')
    return parts[0]!.trim()
  }

  private generateResultName(funcName: string): string {
    return `${funcName}Result`
  }
}
