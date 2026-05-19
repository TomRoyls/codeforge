import { basename, extname } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export interface FunctionInfo {
  async: boolean
  complexity: number
  endLine: number
  line: number
  name: string
  params: number
}

export interface ClassInfo {
  line: number
  methods: number
  name: string
  properties: number
}

export interface ImportInfo {
  items: number
  line: number
  source: string
  type: 'cjs' | 'dynamic' | 'esm'
}

export interface ExportInfo {
  line: number
  name: string
  type: 'default' | 'named' | 're-export'
}

export interface InterfaceInfo {
  line: number
  name: string
  properties: number
}

export interface TypeInfo {
  line: number
  name: string
}

export interface TodoInfo {
  line: number
  text: string
  type: string
}

export interface IssueInfo {
  line: number
  message: string
  rule: string
  severity: string
}

export interface DeadCodeInfo {
  confidence: number
  line: number
  name: string
  type: string
}

export interface FileAnalysis {
  blankLines: number
  classes: ClassInfo[]
  codeLines: number
  commentLines: number
  cyclomaticComplexity: number
  deadCode: DeadCodeInfo[]
  exports: ExportInfo[]
  fileName: string
  filePath: string
  functions: FunctionInfo[]
  imports: ImportInfo[]
  indentationStyle: string
  interfaces: InterfaceInfo[]
  language: string
  lines: number
  maintainabilityIndex: number
  nestingDepth: number
  perfIssues: IssueInfo[]
  quoteStyle: string
  refactoringSuggestions: string[]
  securityIssues: IssueInfo[]
  semicolonUsage: boolean
  size: number
  todos: TodoInfo[]
  types: TypeInfo[]
}

export interface PlaygroundResult {
  analysis: FileAnalysis
  score: number
}

export interface PlaygroundOptions {
  all?: boolean
  verbose?: boolean
}

// ─── Language Detection ─────────────────────────────────

/**
 * @example
 * detectLanguage('app.ts') // 'TypeScript'
 */
export function detectLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.cjs': 'JavaScript',
    '.cts': 'TypeScript',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (JSX)',
    '.mjs': 'JavaScript',
    '.mts': 'TypeScript',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (TSX)',
  }
  return map[ext] ?? 'Unknown'
}

// ─── analyzeFileStructure ───────────────────────────────

/**
 * @example
 * const analysis = analyzeFileStructure('export function foo() {}', 'app.ts')
 * console.log(analysis.functions.length)
 */
export function analyzeFileStructure(content: string, filePath: string): FileAnalysis {
  const lines = content.split('\n')
  const fileName = basename(filePath)

  const blankLines = lines.filter((l) => l.trim() === '').length
  const commentLines = lines.filter((l) => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
  }).length
  const codeLines = lines.length - blankLines - commentLines

  const functions = extractFunctions(content)
  const classes = extractClasses(content)
  const imports = extractImports(content)
  const exports = extractExports(content)
  const interfaces = extractInterfaces(content)
  const types = extractTypes(content)

  const quality = analyzeFileQuality(content)
  const issues = analyzeFileIssues(content, filePath)
  const style = analyzeFileStyle(content)

  const suggestions = generateRefactoringSuggestions({
    blankLines,
    classes,
    codeLines,
    commentLines,
    cyclomaticComplexity: quality.cyclomaticComplexity,
    deadCode: issues.deadCode,
    exports,
    fileName,
    filePath,
    functions,
    imports,
    indentationStyle: style.indentationStyle,
    interfaces,
    language: detectLanguage(filePath),
    lines: lines.length,
    maintainabilityIndex: quality.maintainabilityIndex,
    nestingDepth: quality.nestingDepth,
    perfIssues: issues.perfIssues,
    quoteStyle: style.quoteStyle,
    refactoringSuggestions: [],
    securityIssues: issues.securityIssues,
    semicolonUsage: style.semicolonUsage,
    size: Buffer.byteLength(content, 'utf8'),
    todos: issues.todos,
    types,
  })

  return {
    blankLines,
    classes,
    codeLines,
    commentLines,
    cyclomaticComplexity: quality.cyclomaticComplexity,
    deadCode: issues.deadCode,
    exports,
    fileName,
    filePath,
    functions,
    imports,
    indentationStyle: style.indentationStyle,
    interfaces,
    language: detectLanguage(filePath),
    lines: lines.length,
    maintainabilityIndex: quality.maintainabilityIndex,
    nestingDepth: quality.nestingDepth,
    perfIssues: issues.perfIssues,
    quoteStyle: style.quoteStyle,
    refactoringSuggestions: suggestions,
    securityIssues: issues.securityIssues,
    semicolonUsage: style.semicolonUsage,
    size: Buffer.byteLength(content, 'utf8'),
    todos: issues.todos,
    types,
  }
}

// ─── extractFunctions ───────────────────────────────────

export function extractFunctions(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const fnMatch = line.match(
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/,
    )
    if (fnMatch) {
      const params = fnMatch[2].split(',').filter((p) => p.trim().length > 0).length
      functions.push({
        async: line.includes('async'),
        complexity: 1,
        endLine: findBlockEnd(lines, i),
        line: i + 1,
        name: fnMatch[1],
        params,
      })
    }

    const arrowMatch = line.match(
      /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+?\s*)?=>/,
    )
    if (arrowMatch && !fnMatch) {
      const params = (line.match(/\(/g) ?? []).length > 0
        ? (line.match(/,\s/g) ?? []).length + 1
        : 0
      functions.push({
        async: line.includes('async'),
        complexity: 1,
        endLine: i + 1,
        line: i + 1,
        name: arrowMatch[1],
        params: Math.max(params - 1, 0),
      })
    }
  }

  return functions
}

// ─── extractClasses ─────────────────────────────────────

export function extractClasses(content: string): ClassInfo[] {
  const classes: ClassInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/(?:export\s+)?(?:default\s+)?class\s+(\w+)/)
    if (match) {
      const block = extractBlock(lines, i)
      const methods = (block.match(/\b(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(/g) ?? []).length
      const properties = (block.match(/\b(?:public|private|protected|readonly)\s+\w+\s*[:=]/g) ?? []).length
      classes.push({ line: i + 1, methods, name: match[1], properties })
    }
  }

  return classes
}

// ─── extractImports ─────────────────────────────────────

export function extractImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    const esmMatch = line.match(/^import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/)
    if (esmMatch) {
      const items = esmMatch[1]
        ? esmMatch[1].split(',').filter((s) => s.trim().length > 0).length
        : 1
      imports.push({ items, line: i + 1, source: esmMatch[3], type: 'esm' })
      continue
    }

    const cjsMatch = line.match(/(?:const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (cjsMatch) {
      imports.push({ items: 1, line: i + 1, source: cjsMatch[1], type: 'cjs' })
      continue
    }

    const dynamicMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (dynamicMatch) {
      imports.push({ items: 1, line: i + 1, source: dynamicMatch[1], type: 'dynamic' })
    }
  }

  return imports
}

// ─── extractExports ─────────────────────────────────────

export function extractExports(content: string): ExportInfo[] {
  const exports: ExportInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/export\s+default\s+/.test(line) && !/export\s+default\s+\{/.test(line)) {
      const nameMatch = line.match(/export\s+default\s+(?:class|function)\s+(\w+)/)
      exports.push({
        line: i + 1,
        name: nameMatch?.[1] ?? 'default',
        type: 'default',
      })
    }

    const namedMatches = line.matchAll(/export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g)
    for (const m of namedMatches) {
      exports.push({ line: i + 1, name: m[1], type: 'named' })
    }

    const reExportMatch = line.match(/export\s*\{[^}]*\}\s*from\s*['"]/)
    if (reExportMatch) {
      exports.push({ line: i + 1, name: 're-export', type: 're-export' })
    }
  }

  return exports
}

// ─── extractInterfaces ──────────────────────────────────

export function extractInterfaces(content: string): InterfaceInfo[] {
  const interfaces: InterfaceInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/(?:export\s+)?interface\s+(\w+)/)
    if (match) {
      const block = extractBlock(lines, i)
      const properties = (block.match(/^\s+(?:readonly\s+)?\w+\s*[?:]/gm) ?? []).length
      interfaces.push({ line: i + 1, name: match[1], properties })
    }
  }

  return interfaces
}

// ─── extractTypes ───────────────────────────────────────

export function extractTypes(content: string): TypeInfo[] {
  const types: TypeInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/(?:export\s+)?type\s+(\w+)\s*[=<]/)
    if (match) {
      types.push({ line: i + 1, name: match[1] })
    }
  }

  return types
}

// ─── analyzeFileQuality ─────────────────────────────────

export function analyzeFileQuality(content: string): {
  cyclomaticComplexity: number
  maintainabilityIndex: number
  nestingDepth: number
} {
  let complexity = 1
  let maxNesting = 0

  const lines = content.split('\n')
  let currentNesting = 0

  for (const line of lines) {
    if (/\b(if|else|for|while|case|catch|&&|\|\||\?)\b/.test(line)) {
      complexity++
    }

    const opens = (line.match(/\{/g) ?? []).length
    const closes = (line.match(/\}/g) ?? []).length
    currentNesting += opens - closes
    if (currentNesting > maxNesting) maxNesting = currentNesting
  }

  const loc = Math.max(lines.length, 1)
  const mi = Math.max(0, Math.min(100,
    Math.round(171 - 5.2 * Math.log(loc) - 0.23 * complexity - 16.2 * Math.log(Math.max(loc, 1))),
  ))

  return {
    cyclomaticComplexity: complexity,
    maintainabilityIndex: mi > 100 ? 100 : mi,
    nestingDepth: maxNesting,
  }
}

// ─── analyzeFileIssues ──────────────────────────────────

export function analyzeFileIssues(content: string, _filePath: string): {
  todos: TodoInfo[]
  securityIssues: IssueInfo[]
  perfIssues: IssueInfo[]
  deadCode: DeadCodeInfo[]
} {
  const lines = content.split('\n')
  const todos: TodoInfo[] = []
  const securityIssues: IssueInfo[] = []
  const perfIssues: IssueInfo[] = []
  const deadCode: DeadCodeInfo[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const todoMatch = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG)[\s:]*(.*)/i)
    if (todoMatch) {
      todos.push({ line: i + 1, text: todoMatch[2].trim(), type: todoMatch[1].toUpperCase() })
    }

    if (/eval\s*\(/.test(line)) {
      securityIssues.push({ line: i + 1, message: 'Avoid eval() — security risk', rule: 'no-eval', severity: 'high' })
    }
    if (/password\s*=\s*['"]/.test(line)) {
      securityIssues.push({ line: i + 1, message: 'Hardcoded password detected', rule: 'no-hardcoded-secrets', severity: 'high' })
    }

    if (/readFileSync|writeFileSync/.test(line)) {
      perfIssues.push({ line: i + 1, message: 'Synchronous file I/O detected', rule: 'no-sync-io', severity: 'medium' })
    }

    if (/console\.(log|warn|error|info)\(/.test(line)) {
      const fnName = line.match(/console\.(\w+)/)?.[1] ?? 'log'
      perfIssues.push({ line: i + 1, message: `console.${fnName} in production code`, rule: 'no-console', severity: 'low' })
    }
  }

  const unusedVarPattern = /(?:const|let|var)\s+_(\w+)\s*[=:]/
  for (let i = 0; i < lines.length; i++) {
    if (unusedVarPattern.test(lines[i])) {
      const name = lines[i].match(unusedVarPattern)?.[1] ?? ''
      if (name.startsWith('_')) {
        deadCode.push({ confidence: 80, line: i + 1, name: `_${name}`, type: 'unused-variable' })
      }
    }
  }

  return { deadCode, perfIssues, securityIssues, todos }
}

// ─── analyzeFileStyle ───────────────────────────────────

export function analyzeFileStyle(content: string): {
  indentationStyle: string
  quoteStyle: string
  semicolonUsage: boolean
} {
  const lines = content.split('\n')

  let tabs = 0
  let spaces = 0
  for (const line of lines) {
    if (/^\t/.test(line)) tabs++
    else if (/^ {2,}/.test(line)) spaces++
  }
  const indentationStyle = tabs > spaces ? 'tabs' : spaces > tabs ? 'spaces' : 'mixed'

  const singleQuotes = (content.match(/'/g) ?? []).length
  const doubleQuotes = (content.match(/"/g) ?? []).length
  const quoteStyle = singleQuotes > doubleQuotes ? 'single' : doubleQuotes > singleQuotes ? 'double' : 'mixed'

  const linesWithSemicolons = lines.filter((l) => /;$/.test(l.trim())).length
  const codeLineCount = lines.filter((l) => l.trim().length > 0 && !l.trim().startsWith('//')).length
  const semicolonUsage = codeLineCount > 0 ? (linesWithSemicolons / codeLineCount) > 0.5 : true

  return { indentationStyle, quoteStyle, semicolonUsage }
}

// ─── generateRefactoringSuggestions ─────────────────────

export function generateRefactoringSuggestions(analysis: FileAnalysis): string[] {
  const suggestions: string[] = []

  if (analysis.functions.length > 20) {
    suggestions.push('Too many functions — consider splitting into multiple files')
  }

  if (analysis.lines > 300) {
    suggestions.push('File is long — consider breaking into smaller modules')
  }

  if (analysis.cyclomaticComplexity > 15) {
    suggestions.push('High cyclomatic complexity — simplify conditional logic')
  }

  if (analysis.nestingDepth > 4) {
    suggestions.push('Deep nesting — use early returns or extract helper functions')
  }

  for (const fn of analysis.functions) {
    if (fn.params > 4) {
      suggestions.push(`Function '${fn.name}' has ${fn.params} parameters — use an options object`)
    }
  }

  for (const cls of analysis.classes) {
    if (cls.methods > 15) {
      suggestions.push(`Class '${cls.name}' has ${cls.methods} methods — consider splitting`)
    }
  }

  if (analysis.todos.length > 0) {
    suggestions.push(`${analysis.todos.length} TODO/FIXME comments need attention`)
  }

  if (analysis.securityIssues.length > 0) {
    suggestions.push(`${analysis.securityIssues.length} security issues found`)
  }

  if (suggestions.length === 0) {
    suggestions.push('File looks good — no significant refactoring needed')
  }

  return suggestions
}

// ─── computeFileScore ───────────────────────────────────

/**
 * @example
 * const score = computeFileScore(analysis)
 * console.log(score) // 0-100
 */
export function computeFileScore(analysis: FileAnalysis): number {
  let score = 100

  if (analysis.cyclomaticComplexity > 10) score -= 15
  else if (analysis.cyclomaticComplexity > 20) score -= 30

  if (analysis.nestingDepth > 4) score -= 10
  if (analysis.nestingDepth > 6) score -= 15

  if (analysis.lines > 300) score -= 10
  if (analysis.lines > 500) score -= 15

  score -= analysis.securityIssues.length * 10
  score -= Math.min(analysis.perfIssues.length * 3, 20)
  score -= Math.min(analysis.todos.length * 2, 15)

  if (analysis.commentLines === 0 && analysis.codeLines > 20) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── Helpers ────────────────────────────────────────────

function findBlockEnd(lines: string[], startLine: number): number {
  let depth = 0
  for (let i = startLine; i < lines.length; i++) {
    depth += (lines[i].match(/\{/g) ?? []).length
    depth -= (lines[i].match(/\}/g) ?? []).length
    if (depth <= 0 && i > startLine) return i + 1
  }
  return lines.length
}

function extractBlock(lines: string[], startLine: number): string {
  let depth = 0
  const blockLines: string[] = []
  for (let i = startLine; i < lines.length; i++) {
    depth += (lines[i].match(/\{/g) ?? []).length
    depth -= (lines[i].match(/\}/g) ?? []).length
    blockLines.push(lines[i])
    if (depth <= 0 && i > startLine) break
  }
  return blockLines.join('\n')
}

// ─── buildPlaygroundResult ──────────────────────────────

/**
 * @example
 * const result = await buildPlaygroundResult('app.ts', reader, {})
 * console.log(result.score)
 */
export async function buildPlaygroundResult(
  filePath: string,
  contentReader: ContentReader,
  options?: PlaygroundOptions,
): Promise<PlaygroundResult> {
  const content = await contentReader(filePath)
  const analysis = analyzeFileStructure(content, filePath)

  if (options?.all || options?.verbose) {
    for (const fn of analysis.functions) {
      fn.complexity = computeFunctionComplexity(content, fn.line)
    }
  }

  const score = computeFileScore(analysis)

  return { analysis, score }
}

function computeFunctionComplexity(content: string, startLine: number): number {
  const lines = content.split('\n')
  let complexity = 1
  let depth = 0
  let started = false

  for (let i = startLine - 1; i < lines.length; i++) {
    const line = lines[i]
    depth += (line.match(/\{/g) ?? []).length
    depth -= (line.match(/\}/g) ?? []).length
    if (depth > 0) started = true

    if (/\b(if|else|for|while|case|catch|&&|\|\||\?)\b/.test(line)) {
      complexity++
    }

    if (started && depth <= 0) break
  }

  return complexity
}
