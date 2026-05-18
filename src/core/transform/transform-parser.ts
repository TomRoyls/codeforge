export interface FunctionLocation {
  start: number
  end: number
  content: string
}

import { unique } from '../../utils/array-helpers.js'
import { escapeRegex } from '../../utils/string-helpers.js'

export interface ImportStatement {
  module: string
  imports: string[]
  fullMatch: string
  startIndex: number
}

export interface ExportStatement {
  name: string
  type: 'named' | 'default' | 're-export'
  fullMatch: string
  startIndex: number
}

export interface StringLiteral {
  value: string
  quote: string
  startIndex: number
}

const _funcPatternCache = new Map<string, RegExp>()

export class TransformParser {
  findFunctionByName(source: string, name: string): FunctionLocation | null {
    const cacheKey = `func|${name}`
    let cached = _funcPatternCache.get(cacheKey)
    if (!cached) {
      cached = [
        new RegExp(
          `(?:export\\s+)?(?:async\\s+)?function\\s+${escapeRegex(name)}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+)?\\{`,
          'g'
        ),
        new RegExp(
          `(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(name)}\\s*=\\s*(?:async\\s+)?(?:function\\s*)?(?:\\([^)]*\\)\\s*(?::\\s*[^=]+)?|[^=]+)\\s*=>\\s*\\{`,
          'g'
        ),
      ]
      _funcPatternCache.set(cacheKey, cached)
    }
    const patterns = [new RegExp(cached[0].source, cached[0].flags), new RegExp(cached[1].source, cached[1].flags)]

    for (const pattern of patterns) {
      pattern.lastIndex = 0
      const match = pattern.exec(source)
      if (match) {
        const start = match.index
        const braceStart = source.indexOf('{', start)
        if (braceStart === -1) continue
        const end = findMatchingBrace(source, braceStart)
        if (end === -1) continue
        return {
          start,
          end: end + 1,
          content: source.slice(start, end + 1),
        }
      }
    }

    const arrowCacheKey = `arrow|${name}`
    let arrowNoBrace = _funcPatternCache.get(arrowCacheKey)
    if (!arrowNoBrace) {
      arrowNoBrace = new RegExp(
        `(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(name)}\\s*=\\s*(?:async\\s+)?\\([^)]*\\)\\s*(?::\\s*[^=]+)?\\s*=>\\s*`,
        'g'
      )
      _funcPatternCache.set(arrowCacheKey, arrowNoBrace)
    }
    const freshArrow = new RegExp(arrowNoBrace.source, arrowNoBrace.flags)
    freshArrow.lastIndex = 0
    const arrowMatch = freshArrow.exec(source)
    if (arrowMatch) {
      const start = arrowMatch.index
      const afterArrow = start + arrowMatch[0].length
      const char = source[afterArrow]
      if (char === '{') {
        const end = findMatchingBrace(source, afterArrow)
        if (end !== -1) {
          return {
            start,
            end: end + 1,
            content: source.slice(start, end + 1),
          }
        }
      }
      const lineEnd = source.indexOf('\n', afterArrow)
      const endPos = lineEnd === -1 ? source.length : lineEnd
      return {
        start,
        end: endPos,
        content: source.slice(start, endPos),
      }
    }

    return null
  }

  findClassByName(source: string, name: string): FunctionLocation | null {
    const cacheKey = `class|${name}`
    let cached = _funcPatternCache.get(cacheKey)
    if (!cached) {
      cached = new RegExp(
        `(?:export\\s+)?(?:abstract\\s+)?class\\s+${escapeRegex(name)}\\s*(?:extends\\s+\\S+\\s*)?(?:implements\\s+[^{]+)?\\{`,
        'g'
      )
      _funcPatternCache.set(cacheKey, cached)
    }
    const pattern = new RegExp(cached.source, cached.flags)
    pattern.lastIndex = 0
    const match = pattern.exec(source)
    if (!match) return null

    const start = match.index
    const braceStart = source.indexOf('{', start)
    if (braceStart === -1) return null
    const end = findMatchingBrace(source, braceStart)
    if (end === -1) return null

    return {
      start,
      end: end + 1,
      content: source.slice(start, end + 1),
    }
  }

  findImportStatements(source: string): ImportStatement[] {
    const results: ImportStatement[] = []
    const importRegex = /import\s+(?:type\s+)?(?:\{([^}]*)\}|(\*)\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g
    let match: RegExpExecArray | null

    while ((match = importRegex.exec(source)) !== null) {
      const fullMatch = match[0]
      const startIndex = match.index
      const module = match[5] ?? ''

      if (match[1]) {
        const imports = match[1]
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .map((s: string) => s.replace(/\s+as\s+\w+/, '').trim())
        results.push({ module, imports, fullMatch, startIndex })
      } else if (match[2] && match[3]) {
        results.push({ module, imports: [`* as ${match[3]}`], fullMatch, startIndex })
      } else if (match[4]) {
        results.push({ module, imports: [match[4]], fullMatch, startIndex })
      }
    }

    return results
  }

  findExportStatements(source: string): ExportStatement[] {
    const results: ExportStatement[] = []

    const namedExportRegex = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g
    let match: RegExpExecArray | null
    while ((match = namedExportRegex.exec(source)) !== null) {
      results.push({
        name: match[1] ?? 'anonymous',
        type: 'named',
        fullMatch: match[0],
        startIndex: match.index,
      })
    }

    const defaultExportRegex = /export\s+default\s+(?:function\s+(?:\w+)?|class\s+(?:\w+)?)/g
    while ((match = defaultExportRegex.exec(source)) !== null) {
      const nameMatch = match[0].match(/(?:function|class)\s+(\w+)/)
      results.push({
        name: nameMatch ? nameMatch[1] ?? 'default' : 'default',
        type: 'default',
        fullMatch: match[0],
        startIndex: match.index,
      })
    }

    const reExportRegex = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g
    while ((match = reExportRegex.exec(source)) !== null) {
      const names = (match[1] ?? '').split(',').map((s: string) => s.trim())
      for (const n of names) {
        const parts = n.split(/\s+as\s+/)
        results.push({
          name: parts[0] ?? '',
          type: 're-export',
          fullMatch: match[0],
          startIndex: match.index,
        })
      }
    }

    return results
  }

  findStringLiterals(source: string): StringLiteral[] {
    const results: StringLiteral[] = []
    const stringRegex = /(['"`])(?:(?!\1|\\).|\\.)*\1/g
    let match: RegExpExecArray | null

    while ((match = stringRegex.exec(source)) !== null) {
      const full = match[0]
      const quote = match[1] ?? "'"
      const value = full.slice(1, -1)
      results.push({
        value,
        quote,
        startIndex: match.index,
      })
    }

    return results
  }

  replaceInRange(source: string, start: number, end: number, replacement: string): string {
    return source.slice(0, start) + replacement + source.slice(end)
  }

  addImport(source: string, module: string, imports: string[]): string {
    const existing = this.findImportStatements(source)
    const existingFromModule = existing.find((imp) => imp.module === module)

    if (existingFromModule) {
      const merged = unique([...existingFromModule.imports, ...imports])
      const newImport = `import { ${merged.join(', ')} } from '${module}'`
      return this.replaceInRange(
        source,
        existingFromModule.startIndex,
        existingFromModule.startIndex + existingFromModule.fullMatch.length,
        newImport
      )
    }

    const newImport = `import { ${imports.join(', ')} } from '${module}'`
    const firstImport = existing[0]
    if (firstImport) {
      return (
        source.slice(0, firstImport.startIndex) +
        newImport +
        '\n' +
        source.slice(firstImport.startIndex)
      )
    }

    const lines = source.split('\n')
    let insertIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.trim() === '' || lines[i]!.startsWith('//') || lines[i]!.startsWith('/*')) {
        insertIndex = i + 1
      } else {
        break
      }
    }

    const before = lines.slice(0, insertIndex).join('\n')
    const after = lines.slice(insertIndex).join('\n')
    if (before.length === 0) return newImport + '\n' + after
    return before + '\n' + newImport + '\n' + after
  }

  removeImport(source: string, module: string): string {
    const existing = this.findImportStatements(source)
    const target = existing.find((imp) => imp.module === module)
    if (!target) return source

    const start = target.startIndex
    const end = start + target.fullMatch.length
    const after = source.slice(end)
    const trimmed = after.startsWith('\n') ? after.slice(1) : after
    return source.slice(0, start) + trimmed
  }

  addExport(source: string, name: string, type: string): string {
    if (type === 'default') {
      return source + `\nexport default ${name}\n`
    }
    const exportLine = `export { ${name} }`
    const exports = this.findExportStatements(source)
    const namedExport = exports.filter((e) => e.type === 'named')
    if (namedExport.length > 0) {
      const lastExport = namedExport[namedExport.length - 1]!
      const lastLine = source.lastIndexOf('\n', lastExport.startIndex)
      const insertAt = lastLine === -1 ? lastExport.startIndex : lastLine
      return source.slice(0, insertAt) + '\n' + exportLine + source.slice(insertAt)
    }
    return source + '\n' + exportLine + '\n'
  }
}

function findMatchingBrace(source: string, openBracePos: number): number {
  let depth = 0
  let inString: string | null = null
  let escaped = false

  for (let i = openBracePos; i < source.length; i++) {
    const char = source[i]!

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (inString) {
      if (char === inString) inString = null
      continue
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char
      continue
    }

    if (char === '{') depth++
    if (char === '}') {
      depth--
      if (depth === 0) return i
    }
  }

  return -1
}
