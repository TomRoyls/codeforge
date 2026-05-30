import { extname } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface RefactorSuggestion {
  type: string
  severity: 'high' | 'medium' | 'low'
  file: string
  line: number
  description: string
  currentCode: string
  suggestedCode: string
  effort: number
  impact: 'high' | 'medium' | 'low'
  category: string
}

export interface RefactorStats {
  total: number
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  byType: Record<string, number>
  totalEffort: number
}

export interface RefactorResult {
  suggestions: RefactorSuggestion[]
  stats: RefactorStats
}

export interface RefactorOptions {
  ignorePatterns: string[]
  extensions?: string[]
  severity?: string
}

export type ContentReader = (filePath: string) => Promise<string>

// ─── Detector: long functions ───────────────────────────

const FUNC_REGEX = /(?:export\s+)?(?:async\s+)?(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\()/g

/**
 * Detect functions longer than 40 lines.
 *
 * @example
 * ```ts
 * detectLongFunctions('function foo() {\n ...\n}', 'a.ts')
 * ```
 */
export function detectLongFunctions(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    if (!FUNC_REGEX.test(line) && !/^\s*(export\s+)?(async\s+)?function\s/.test(line)) {
      FUNC_REGEX.lastIndex = 0
      continue
    }
    FUNC_REGEX.lastIndex = 0

    let depth = 0
    for (let j = i; j < lines.length; j++) {
      const l = lines[j]
      if (l === undefined) break
      for (const ch of l) {
        if (ch === '{') depth++
        if (ch === '}') depth--
      }
      if (depth === 0 && j > i) {
        const funcLen = j - i + 1
        if (funcLen > 40) {
          const snippet = lines.slice(i, Math.min(i + 3, j + 1)).join('\n')
          suggestions.push({
            category: 'size',
            currentCode: snippet,
            description: `Function is ${funcLen} lines long (threshold: 40)`,
            effort: funcLen > 80 ? 2 : 1,
            file: filePath,
            impact: funcLen > 80 ? 'high' : 'medium',
            line: i + 1,
            severity: funcLen > 80 ? 'high' : 'medium',
            suggestedCode: '// Extract into smaller, focused functions',
            type: 'extract-function',
          })
        }
        break
      }
    }
  }

  return suggestions
}

// ─── Detector: deep nesting ─────────────────────────────

/**
 * Detect code with nesting depth > 4.
 *
 * @example
 * ```ts
 * detectDeepNesting('if { if { if { if { if {', 'a.ts')
 * ```
 */
export function detectDeepNesting(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    let depth = 0
    for (const ch of line) {
      if (ch === '{' || ch === '(') depth++
    }

    const existingDepth = (line.match(/{/g) ?? []).length + (line.match(/\(/g) ?? []).length
    const closingDepth = (line.match(/}/g) ?? []).length + (line.match(/\)/g) ?? []).length
    let currentNesting = 0
    for (let j = 0; j <= i; j++) {
      const prevLine = lines[j]
      if (prevLine === undefined) continue
      currentNesting += (prevLine.match(/{/g) ?? []).length + (prevLine.match(/\(/g) ?? []).length
      currentNesting -= (prevLine.match(/}/g) ?? []).length + (prevLine.match(/\)/g) ?? []).length
    }

    if (currentNesting > 4 && existingDepth > closingDepth) {
      suggestions.push({
        category: 'complexity',
        currentCode: line.trim(),
        description: `Nesting depth ${currentNesting} exceeds threshold (4)`,
        effort: 1,
        file: filePath,
        impact: 'medium',
        line: i + 1,
        severity: 'medium',
        suggestedCode: '// Use early returns, guard clauses, or extract nested logic',
        type: 'reduce-nesting',
      })
      break
    }
  }

  return suggestions
}

// ─── Detector: magic numbers ────────────────────────────

const MAGIC_NUMBER_REGEX = /(?<![.\w])\b(\d{2,})\b(?!\s*[;:,)]*\s*(\/\/|$))/g

/**
 * Detect unexplained numeric literals.
 *
 * @example
 * ```ts
 * detectMagicNumbers('if (x > 86400) {}', 'a.ts')
 * ```
 */
export function detectMagicNumbers(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = content.split('\n')
  const reported = new Set<number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue

    if (reported.has(i)) continue
    if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('import')) continue

    MAGIC_NUMBER_REGEX.lastIndex = 0
    const matches = line.matchAll(MAGIC_NUMBER_REGEX)
    for (const match of matches) {
      const num = match[1]
      if (num === undefined) continue
      const val = parseInt(num, 10)
      if (val < 10) continue
      if (line.includes('const') || line.includes('let') || line.includes('=')) {
        if (line.match(new RegExp(`(?:const|let|var)\\s+\\w+\\s*=\\s*${num}`))) continue
      }

      reported.add(i)
      suggestions.push({
        category: 'naming',
        currentCode: line.trim(),
        description: `Magic number ${num} should be a named constant`,
        effort: 0.5,
        file: filePath,
        impact: 'low',
        line: i + 1,
        severity: 'low',
        suggestedCode: `const MEANINGFUL_NAME = ${num};`,
        type: 'replace-magic-numbers',
      })
      break
    }
  }

  return suggestions
}

// ─── Detector: large files ──────────────────────────────

/**
 * Detect files with more than 300 lines.
 *
 * @example
 * ```ts
 * detectLargeFiles(content, 'big-file.ts')
 * ```
 */
export function detectLargeFiles(content: string, filePath: string): RefactorSuggestion[] {
  const lineCount = content.split('\n').length
  if (lineCount <= 300) return []

  return [{
    category: 'size',
    currentCode: `// ${lineCount} lines`,
    description: `File has ${lineCount} lines (threshold: 300)`,
    effort: lineCount > 500 ? 4 : 2,
    file: filePath,
    impact: lineCount > 500 ? 'high' : 'medium',
    line: 1,
    severity: lineCount > 500 ? 'high' : 'medium',
    suggestedCode: '// Split into focused modules by responsibility',
    type: 'split-file',
  }]
}

// ─── Detector: complex conditionals ─────────────────────

/**
 * Detect if/else chains with > 5 branches.
 *
 * @example
 * ```ts
 * detectComplexConditionals(content, 'a.ts')
 * ```
 */
export function detectComplexConditionals(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = content.split('\n')

  let chainStart = -1
  let branchCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    const trimmed = line.trim()

    if (/^(if|else\s+if|elif)\s*\(/.test(trimmed)) {
      if (chainStart === -1) chainStart = i
      branchCount++
    } else if (trimmed.startsWith('else') && !trimmed.includes('if')) {
      branchCount++
      if (branchCount > 5) {
        const snippet = lines.slice(chainStart, Math.min(chainStart + 3, i + 1)).join('\n')
        suggestions.push({
          category: 'structure',
          currentCode: snippet,
          description: `${branchCount}-branch conditional chain (threshold: 5)`,
          effort: 1,
          file: filePath,
          impact: 'medium',
          line: (chainStart ?? 0) + 1,
          severity: 'medium',
          suggestedCode: '// Use polymorphism, strategy pattern, or lookup table',
          type: 'replace-conditional',
        })
      }
      chainStart = -1
      branchCount = 0
    } else if (chainStart !== -1 && !trimmed.startsWith('}')) {
      if (branchCount > 5) {
        const snippet = lines.slice(chainStart, Math.min(chainStart + 3, i + 1)).join('\n')
        suggestions.push({
          category: 'structure',
          currentCode: snippet,
          description: `${branchCount}-branch conditional chain (threshold: 5)`,
          effort: 1,
          file: filePath,
          impact: 'medium',
          line: (chainStart ?? 0) + 1,
          severity: 'medium',
          suggestedCode: '// Use polymorphism, strategy pattern, or lookup table',
          type: 'replace-conditional',
        })
      }
      chainStart = -1
      branchCount = 0
    }
  }

  return suggestions
}

// ─── Detector: callback hell ────────────────────────────

/**
 * Detect deeply nested callback patterns.
 *
 * @example
 * ```ts
 * detectCallbackHell('fs.readFile(() => { fs.readFile(() => {', 'a.ts')
 * ```
 */
export function detectCallbackHell(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = content.split('\n')
  let depth = 0
  let maxDepth = 0
  let maxLine = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    const callbacks = (line.match(/\(.*?(?:=>|function)/g) ?? []).length
    const closes = (line.match(/\)\s*[;,{]/g) ?? []).length
    depth += callbacks - closes
    if (depth > maxDepth) {
      maxDepth = depth
      maxLine = i + 1
    }
  }

  if (maxDepth >= 3) {
    const snippet = lines.slice(Math.max(0, maxLine - 2), maxLine + 1).join('\n')
    suggestions.push({
      category: 'structure',
      currentCode: snippet,
      description: `Callback nesting depth ${maxDepth} (threshold: 3)`,
      effort: 1,
      file: filePath,
      impact: 'medium',
      line: maxLine,
      severity: 'medium',
      suggestedCode: '// Convert to async/await or use Promise chains',
      type: 'convert-to-async',
    })
  }

  return suggestions
}

// ─── Detector: god objects ──────────────────────────────

const METHOD_REGEX = /(?:public|private|protected)?\s*(?:async\s+)?(?:static\s+)?\w+\s*\(/g

/**
 * Detect classes with more than 15 methods.
 *
 * @example
 * ```ts
 * detectGodObjects('class Foo { m1() {} ... m16() {} }', 'a.ts')
 * ```
 */
export function detectGodObjects(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const classRegex = /class\s+(\w+)/g
  let classMatch: RegExpExecArray | null

  while ((classMatch = classRegex.exec(content)) !== null) {
    const className = classMatch[1] ?? 'Unknown'
    const classStart = content.indexOf('{', classMatch.index)
    if (classStart === -1) continue

    let braceDepth = 0
    let classEnd = classStart
    for (let i = classStart; i < content.length; i++) {
      if (content[i] === '{') braceDepth++
      if (content[i] === '}') braceDepth--
      if (braceDepth === 0) {
        classEnd = i
        break
      }
    }

    const classBody = content.slice(classStart, classEnd)
    METHOD_REGEX.lastIndex = 0
    const methods = classBody.match(METHOD_REGEX)
    const methodCount = methods ? methods.length : 0

    if (methodCount > 15) {
      const lineNum = content.slice(0, classMatch.index).split('\n').length
      suggestions.push({
        category: 'coupling',
        currentCode: `class ${className} { /* ${methodCount} methods */ }`,
        description: `Class ${className} has ${methodCount} methods (threshold: 15)`,
        effort: 3,
        file: filePath,
        impact: 'high',
        line: lineNum,
        severity: 'high',
        suggestedCode: '// Extract responsibilities into separate classes',
        type: 'extract-method',
      })
    }
  }

  return suggestions
}

// ─── Detector: duplicate patterns ───────────────────────

/**
 * Detect repeated 3+ line blocks.
 *
 * @example
 * ```ts
 * detectDuplicatePatterns('x=1\\ny=2\\nx=1\\ny=2', 'a.ts')
 * ```
 */
export function detectDuplicatePatterns(content: string, filePath: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = content.split('\n')
  const seen = new Map<string, { line: number; count: number }>()

  for (let i = 0; i < lines.length - 2; i++) {
    const block = [lines[i], lines[i + 1], lines[i + 2]].map((l) => (l ?? '').trim()).join('\n')
    if (block.length < 10) continue

    const existing = seen.get(block)
    if (existing) {
      existing.count++
    } else {
      seen.set(block, { count: 1, line: i + 1 })
    }
  }

  for (const [block, info] of seen) {
    if (info.count >= 3) {
      suggestions.push({
        category: 'duplication',
        currentCode: block.split('\n').slice(0, 3).join('\n'),
        description: `Code block repeated ${info.count} times`,
        effort: 1,
        file: filePath,
        impact: 'medium',
        line: info.line,
        severity: 'medium',
        suggestedCode: '// Extract into a shared function or utility',
        type: 'consolidate-duplicate',
      })
    }
  }

  return suggestions
}

// ─── generateSuggestionText ─────────────────────────────

/**
 * Generate human-readable suggestion text.
 *
 * @example
 * ```ts
 * generateSuggestionText('extract-function', { name: 'foo' })
 * ```
 */
export function generateSuggestionText(type: string, context: Record<string, string>): string {
  switch (type) {
    case 'extract-function': return `Extract logic into a separate function`
    case 'reduce-nesting': return `Use early returns or guard clauses to reduce nesting`
    case 'replace-magic-numbers': return `Replace magic number with a named constant`
    case 'split-file': return `Split file into focused modules`
    case 'replace-conditional': return `Replace conditional with polymorphism or strategy pattern`
    case 'convert-to-async': return `Convert callbacks to async/await`
    case 'extract-method': return `Extract methods into separate classes`
    case 'consolidate-duplicate': return `Consolidate duplicate code into shared function`
    default: return `Refactor: ${context.name ?? type}`
  }
}

// ─── computeRefactorStats ───────────────────────────────

/**
 * Compute aggregate refactoring statistics.
 *
 * @example
 * ```ts
 * const stats = computeRefactorStats(suggestions)
 * stats.total // 15
 * ```
 */
export function computeRefactorStats(suggestions: RefactorSuggestion[]): RefactorStats {
  const bySeverity: Record<string, number> = { high: 0, low: 0, medium: 0 }
  const byCategory: Record<string, number> = {}
  const byType: Record<string, number> = {}
  let totalEffort = 0

  for (const s of suggestions) {
    bySeverity[s.severity] = (bySeverity[s.severity] ?? 0) + 1
    byCategory[s.category] = (byCategory[s.category] ?? 0) + 1
    byType[s.type] = (byType[s.type] ?? 0) + 1
    totalEffort += s.effort
  }

  return { byCategory, bySeverity, byType, total: suggestions.length, totalEffort: Math.round(totalEffort * 10) / 10 }
}

// ─── buildRefactorResult ────────────────────────────────

/**
 * Orchestrate full refactoring analysis.
 *
 * @example
 * ```ts
 * const result = await buildRefactorResult(files, reader, { ignorePatterns: [] })
 * result.suggestions.length // 15
 * ```
 */
export async function buildRefactorResult(
  files: string[],
  contentReader: ContentReader,
  options: RefactorOptions,
): Promise<RefactorResult> {
  const extSet = options.extensions
    ? new Set(options.extensions)
    : new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

  const targetFiles = files.filter((f) => {
    const ext = extname(f)
    return extSet.has(ext)
  })

  const allSuggestions: RefactorSuggestion[] = []

  for (const file of targetFiles) {
    try {
      const content = await contentReader(file)

      allSuggestions.push(...detectLongFunctions(content, file))
      allSuggestions.push(...detectDeepNesting(content, file))
      allSuggestions.push(...detectMagicNumbers(content, file))
      allSuggestions.push(...detectLargeFiles(content, file))
      allSuggestions.push(...detectComplexConditionals(content, file))
      allSuggestions.push(...detectCallbackHell(content, file))
      allSuggestions.push(...detectGodObjects(content, file))
      allSuggestions.push(...detectDuplicatePatterns(content, file))
    } catch {
      // skip unreadable files
    }
  }

  const severityOrder = { high: 0, medium: 1, low: 2 }
  allSuggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  let filtered = allSuggestions
  if (options.severity && options.severity !== 'all') {
    const levels: Record<string, string[]> = {
      high: ['high'],
      low: ['low', 'medium', 'high'],
      medium: ['medium', 'high'],
    }
    const allowed = levels[options.severity] ?? ['high', 'medium', 'low']
    filtered = allSuggestions.filter((s) => allowed.includes(s.severity))
  }

  const stats = computeRefactorStats(filtered)
  return { stats, suggestions: filtered }
}
