import type { AnalyzedFunction, AnalyzedClass, AnalyzedParam } from './types.js'
import { escapeRegex } from '../../utils/string-helpers.js'

const FUNCTION_REGEX =
  /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+?))?\s*\{/g
const ARROW_FUNCTION_REGEX =
  /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*([^=]+?))?\s*=>\s*/g
const CLASS_REGEX = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)\s*(?:extends\s+\w+\s*)?(?:implements\s+[\w,\s]+\s*)?\{/g
const CONSTRUCTOR_REGEX = /constructor\s*\(([^)]*)\)\s*(?::\s*([^{]+?))?\s*\{/
const EXPORT_FUNCTION_REGEX = /export\s+(?:async\s+)?function\s+(\w+)/g
const EXPORT_CLASS_REGEX = /export\s+(?:abstract\s+)?class\s+(\w+)/g
const EXPORT_CONST_REGEX = /export\s+(?:const|let|var)\s+(\w+)/g

export class SourceAnalyzer {
  analyzeFunction(source: string, name: string): AnalyzedFunction | null {
    const funcMatch = this.findFunctionMatch(source, name)
    if (!funcMatch) return null

    const paramsStr = funcMatch[1]
    const returnTypeStr = funcMatch[2]
    const fullMatch = funcMatch[0]
    const isExported = this.checkExported(source, name)
    const isAsync = /\basync\b/.test(fullMatch)
    const params = this.extractParams(paramsStr ?? '')
    const returnType = this.detectReturnType(returnTypeStr ?? '')
    const body = this.extractFunctionBody(source, name)
    const complexity = this.getComplexity(body)
    const callsExternal = this.detectExternalCalls(body)

    return {
      name,
      params,
      returnType,
      isAsync,
      isExported,
      complexity,
      callsExternal,
      source: body,
    }
  }

  analyzeClass(source: string, name: string): AnalyzedClass | null {
    const classMatch = this.findClassMatch(source, name)
    if (!classMatch) return null

    const classBody = this.extractClassBody(source, name)
    const isExported = /export\s/.test(classMatch[0])
    const isAbstract = /\babstract\b/.test(classMatch[0])

    const methods = this.extractClassMethods(classBody)
    const properties = this.extractClassProperties(classBody)
    const constructor = this.extractConstructor(classBody)

    return {
      name,
      methods,
      properties,
      constructor,
      isExported,
      isAbstract,
    }
  }

  analyzeModule(source: string): {
    functions: AnalyzedFunction[]
    classes: AnalyzedClass[]
    exports: string[]
  } {
    const functions: AnalyzedFunction[] = []
    const classes: AnalyzedClass[] = []
    const exports: string[] = []

    const funcNames = this.extractFunctionNames(source)
    for (const name of funcNames) {
      const fn = this.analyzeFunction(source, name)
      if (fn) functions.push(fn)
    }

    const classNames = this.extractClassNames(source)
    for (const name of classNames) {
      const cls = this.analyzeClass(source, name)
      if (cls) classes.push(cls)
    }

    const exportMatches = [
      ...source.matchAll(EXPORT_FUNCTION_REGEX),
      ...source.matchAll(EXPORT_CLASS_REGEX),
      ...source.matchAll(EXPORT_CONST_REGEX),
    ]
    for (const match of exportMatches) {
      if (match[1]) exports.push(match[1])
    }

    return { functions, classes, exports }
  }

  extractParams(source: string): AnalyzedParam[] {
    if (!source.trim()) return []

    const params: AnalyzedParam[] = []
    const parts = this.splitParams(source)

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue

      const param = this.parseSingleParam(trimmed)
      if (param) params.push(param)
    }

    return params
  }

  detectReturnType(source: string): string {
    const trimmed = (source ?? '').trim()
    if (!trimmed) return 'void'
    return trimmed
  }

  isPureFunction(fn: AnalyzedFunction): boolean {
    if (fn.isAsync) return false
    if (fn.callsExternal) return false
    if (fn.complexity > 10) return false
    return true
  }

  getComplexity(source: string): number {
    if (!source) return 1

    let complexity = 1

    const elseIfMatches = source.match(/\belse\s+if\b/g)
    if (elseIfMatches) complexity += elseIfMatches.length

    const ifMatches = source.match(/\bif\b/g)
    if (ifMatches) complexity += ifMatches.length - (elseIfMatches?.length ?? 0)

    const forMatches = source.match(/\bfor\b/g)
    if (forMatches) complexity += forMatches.length

    const whileMatches = source.match(/\bwhile\b/g)
    if (whileMatches) complexity += whileMatches.length

    const caseMatches = source.match(/\bcase\b/g)
    if (caseMatches) complexity += caseMatches.length

    const catchMatches = source.match(/\bcatch\b/g)
    if (catchMatches) complexity += catchMatches.length

    const ternaryMatches = source.match(/\?[^:]*:/g)
    if (ternaryMatches) complexity += ternaryMatches.length

    const andMatches = source.match(/&&/g)
    if (andMatches) complexity += andMatches.length

    const orMatches = source.match(/\|\|/g)
    if (orMatches) complexity += orMatches.length

    const nullishMatches = source.match(/\?\?/g)
    if (nullishMatches) complexity += nullishMatches.length

    return complexity
  }

  private findFunctionMatch(source: string, name: string): RegExpMatchArray | null {
    const namedFuncRegex = new RegExp(
      `(?:export\\s+)?(?:async\\s+)?function\\s+${escapeRegex(name)}\\s*\\(([^)]*)\\)\\s*(?::\\s*([^{]+?))?\\s*\\{`,
    )
    let match = source.match(namedFuncRegex)
    if (match) return match

    const namedArrowRegex = new RegExp(
      `(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(name)}\\s*=\\s*(?:async\\s+)?\\(([^)]*)\\)\\s*(?::\\s*([^=]+?))?\\s*=>\\s*`,
    )
    match = source.match(namedArrowRegex)
    return match
  }

  private findClassMatch(source: string, name: string): RegExpMatchArray | null {
    const regex = new RegExp(
      `(?:export\\s+)?(?:abstract\\s+)?class\\s+${escapeRegex(name)}\\s*(?:extends\\s+\\w+\\s*)?(?:implements\\s+[\\w,\\s]+\\s*)?\\{`,
    )
    return source.match(regex)
  }

  private checkExported(source: string, name: string): boolean {
    const funcExportRegex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${escapeRegex(name)}`)
    if (funcExportRegex.test(source)) return true

    const arrowExportRegex = new RegExp(`export\\s+(?:const|let|var)\\s+${escapeRegex(name)}`)
    if (arrowExportRegex.test(source)) return true

    return false
  }

  private extractFunctionBody(source: string, name: string): string {
    const funcRegex = new RegExp(
      `(?:export\\s+)?(?:async\\s+)?function\\s+${escapeRegex(name)}\\s*\\([^)]*\\)\\s*(?::\\s*[^{]+?)?\\s*\\{`,
    )
    let match = source.match(funcRegex)
    if (match && match.index !== undefined) {
      return this.extractBraceBlock(source, match.index + match[0].length - 1)
    }

    const arrowRegex = new RegExp(
      `(?:export\\s+)?(?:const|let|var)\\s+${escapeRegex(name)}\\s*=\\s*(?:async\\s+)?\\([^)]*\\)\\s*(?::\\s*[^=]+?)?\\s*=>\\s*`,
    )
    match = source.match(arrowRegex)
    if (match && match.index !== undefined) {
      const afterArrow = source.slice(match.index + match[0].length)
      const trimmed = afterArrow.trimStart()
      if (trimmed.startsWith('{')) {
        return this.extractBraceBlock(source, match.index + match[0].length + (afterArrow.length - trimmed.length))
      }
      const endOfExpr = trimmed.search(/[;\n]/)
      return endOfExpr >= 0 ? trimmed.slice(0, endOfExpr) : trimmed
    }

    return ''
  }

  private extractBraceBlock(source: string, startIndex: number): string {
    let depth = 0
    let i = startIndex
    for (; i < source.length; i++) {
      if (source[i] === '{') depth++
      else if (source[i] === '}') {
        depth--
        if (depth === 0) break
      }
    }
    return source.slice(startIndex + 1, i)
  }

  private extractClassBody(source: string, name: string): string {
    const regex = new RegExp(
      `(?:export\\s+)?(?:abstract\\s+)?class\\s+${escapeRegex(name)}\\s*(?:extends\\s+\\w+\\s*)?(?:implements\\s+[\\w,\\s]+\\s*)?\\{`,
    )
    const match = source.match(regex)
    if (match && match.index !== undefined) {
      return this.extractBraceBlock(source, match.index + match[0].length - 1)
    }
    return ''
  }

  private extractClassMethods(classBody: string): AnalyzedFunction[] {
    const methods: AnalyzedFunction[] = []
    const methodMatches = classBody.matchAll(
      /(?:(?:public|private|protected|static|readonly|abstract|async)\s+)*(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+?))?\s*(?:\{|=>)/g,
    )

    for (const match of methodMatches) {
      const methodName = match[1]
      if (!methodName || methodName === 'constructor') continue

      const paramsStr = match[2] ?? ''
      const returnTypeStr = match[3] ?? ''
      const fullLine = match[0]
      const isAsync = /\basync\b/.test(fullLine)

      const methodStart = match.index + match[0].length
      let body = ''
      if (fullLine.endsWith('{')) {
        body = this.extractBraceBlock(classBody, methodStart - 1)
      }

      methods.push({
        name: methodName,
        params: this.extractParams(paramsStr),
        returnType: this.detectReturnType(returnTypeStr),
        isAsync,
        isExported: false,
        complexity: this.getComplexity(body),
        callsExternal: this.detectExternalCalls(body),
        source: body,
      })
    }

    return methods
  }

  private extractClassProperties(classBody: string): AnalyzedParam[] {
    const props: AnalyzedParam[] = []
    const propRegex =
      /(?:(?:public|private|protected|static|readonly)\s+)+(?:abstract\s+)?(\w+)(\??):\s*([^;=]+)[;=]/g
    const propMatches = classBody.matchAll(propRegex)

    for (const match of propMatches) {
      const propName = match[1]
      const optional = match[2] === '?'
      const propType = match[3]
      if (propName && propType) {
        props.push({
          name: propName,
          type: propType.trim(),
          optional,
        })
      }
    }

    return props
  }

  private extractConstructor(classBody: string): AnalyzedFunction | null {
    const match = classBody.match(CONSTRUCTOR_REGEX)
    if (!match || match.index === undefined) return null

    const paramsStr = match[1] ?? ''
    const returnTypeStr = match[2] ?? ''
    const constructorStart = (match.index ?? 0) + match[0].length
    const body = this.extractBraceBlock(classBody, constructorStart - 1)

    return {
      name: 'constructor',
      params: this.extractParams(paramsStr),
      returnType: this.detectReturnType(returnTypeStr),
      isAsync: false,
      isExported: false,
      complexity: this.getComplexity(body),
      callsExternal: this.detectExternalCalls(body),
      source: body,
    }
  }

  private extractFunctionNames(source: string): string[] {
    const names = new Set<string>()
    const funcMatches = source.matchAll(FUNCTION_REGEX)
    for (const match of funcMatches) {
      if (match[1]) names.add(match[1])
    }
    const arrowMatches = source.matchAll(ARROW_FUNCTION_REGEX)
    for (const match of arrowMatches) {
      if (match[1]) names.add(match[1])
    }
    return [...names]
  }

  private extractClassNames(source: string): string[] {
    const names = new Set<string>()
    const classMatches = source.matchAll(CLASS_REGEX)
    for (const match of classMatches) {
      if (match[1]) names.add(match[1])
    }
    return [...names]
  }

  private splitParams(paramsStr: string): string[] {
    const parts: string[] = []
    let depth = 0
    let current = ''

    for (const char of paramsStr) {
      if (char === '(' || char === '<' || char === '[' || char === '{') depth++
      else if (char === ')' || char === '>' || char === ']' || char === '}') depth--

      if (char === ',' && depth === 0) {
        parts.push(current)
        current = ''
      } else {
        current += char
      }
    }

    if (current.trim()) parts.push(current)
    return parts
  }

  private parseSingleParam(paramStr: string): AnalyzedParam | null {
    let rest = paramStr
    rest = rest.replace(/^\.\.\./, '')
    const isRest = rest !== paramStr

    const hasDefault = rest.includes('=')
    let defaultValue: string | undefined
    if (hasDefault) {
      const eqIndex = rest.indexOf('=')
      defaultValue = rest.slice(eqIndex + 1).trim()
      rest = rest.slice(0, eqIndex)
    }

    const colonIndex = rest.indexOf(':')
    if (colonIndex >= 0) {
      const name = rest.slice(0, colonIndex).trim()
      let type = rest.slice(colonIndex + 1).trim()
      const optional = type.includes('?') || name.endsWith('?')
      type = type.replace(/\?/g, '').trim()
      const finalName = name.replace(/\?/g, '').trim()
      if (isRest) type = `${type}[]`
      if (!finalName) return null
      return {
        name: finalName,
        type: type || 'unknown',
        optional,
        defaultValue,
      }
    }

    const optional = rest.includes('?')
    const cleanName = rest.replace(/\?/g, '').trim()
    if (!cleanName) return null
    return {
      name: cleanName,
      type: 'unknown',
      optional,
      defaultValue,
    }
  }

  private detectExternalCalls(body: string): boolean {
    const externalPatterns = [
      /\bfetch\s*\(/,
      /\bfs\./,
      /\brequire\s*\(/,
      /\bprocess\./,
      /\breadFile/,
      /\bwriteFile/,
      /\bhttp\./,
      /\bhttps\./,
      /\bdb\./,
      /\bquery/,
      /\bexec\(/,
      /\bspawn\(/,
      /\bexecSync/,
    ]
    return externalPatterns.some((p) => p.test(body))
  }
}
