// ─── Interfaces ──────────────────────────────────────────

/**
 * Represents a single dead code finding.
 *
 * @example
 * ```ts
 * const item: DeadCodeItem = {
 *   file: 'src/utils.ts',
 *   line: 42,
 *   type: 'unused-export',
 *   name: 'helperFn',
 *   confidence: 80,
 *   reason: 'Exported but never imported elsewhere',
 *   context: 'export function helperFn() { ... }',
 * }
 * ```
 */
export interface DeadCodeItem {
  /** File path relative to project root */
  file: string
  /** 1-based line number where the issue was found */
  line: number
  /** Category of dead code detected */
  type: 'unused-export' | 'unreachable' | 'unused-var' | 'unreferenced-fn' | 'shadowed-decl' | 'unused-param' | 'dead-branch'
  /** Name of the dead code symbol */
  name: string
  /** Confidence score from 0 (low) to 100 (high) */
  confidence: number
  /** Human-readable explanation of why this is flagged */
  reason: string
  /** Surrounding code snippet for context */
  context: string
}

/**
 * Aggregated statistics about detected dead code.
 *
 * @example
 * ```ts
 * const stats: DeadCodeStats = {
 *   totalIssues: 12,
 *   byType: { 'unused-var': 5, 'unreferenced-fn': 7 },
 *   byFile: { 'src/a.ts': 3, 'src/b.ts': 9 },
 *   highConfidence: 4,
 *   mediumConfidence: 5,
 *   lowConfidence: 3,
 *   estimatedLines: 24,
 * }
 * ```
 */
export interface DeadCodeStats {
  /** Total number of issues found */
  totalIssues: number
  /** Count of issues grouped by type */
  byType: Record<string, number>
  /** Count of issues grouped by file */
  byFile: Record<string, number>
  /** Issues with confidence >= 80 */
  highConfidence: number
  /** Issues with confidence 50-79 */
  mediumConfidence: number
  /** Issues with confidence < 50 */
  lowConfidence: number
  /** Estimated dead lines of code */
  estimatedLines: number
}

/**
 * Complete dead code analysis result.
 *
 * @example
 * ```ts
 * const result: DeadCodeResult = {
 *   items: [],
 *   stats: { totalIssues: 0, byType: {}, byFile: {}, highConfidence: 0, mediumConfidence: 0, lowConfidence: 0, estimatedLines: 0 },
 *   files: ['src/index.ts'],
 * }
 * ```
 */
export interface DeadCodeResult {
  /** All detected dead code items */
  items: DeadCodeItem[]
  /** Aggregated statistics */
  stats: DeadCodeStats
  /** List of analyzed files */
  files: string[]
}

/** Options for buildDeadCodeResult */
export interface DeadCodeOptions {
  /** Confidence threshold 0-100, filter items below this */
  threshold: number
}

// ─── Helpers ─────────────────────────────────────────────

/** Get a line of code by 1-based line number, returns empty string if out of range. */
function getLine(content: string, lineNum: number): string {
  const lines = content.split('\n')
  const idx = lineNum - 1
  if (idx < 0 || idx >= lines.length) return ''
  return lines[idx] ?? ''
}

/** Get surrounding context lines around a given line number. */
function getContext(content: string, lineNum: number, radius = 1): string {
  const lines = content.split('\n')
  const start = Math.max(0, lineNum - 1 - radius)
  const end = Math.min(lines.length, lineNum + radius)
  return lines.slice(start, end).join('\n').trim()
}

/** Check if a name is used anywhere in the content (excluding the declaration line). */
function isNameUsed(content: string, name: string, declarationLine: number): boolean {
  const lines = content.split('\n')
  // Build a regex that matches the name as a word boundary usage
  const namePattern = new RegExp(`\\b${escapeRegex(name)}\\b`)
  for (let i = 0; i < lines.length; i++) {
    if (i === declarationLine - 1) continue
    const line = lines[i] ?? ''
    // Skip import/export type lines for the declaration itself
    if (namePattern.test(line)) return true
  }
  return false
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Check if a line is a comment or empty. */
function isCommentOrBlank(line: string): boolean {
  const trimmed = line.trim()
  return trimmed.length === 0 || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')
}

// ─── detectUnusedExports ─────────────────────────────────

/**
 * Find exported functions/classes/types/interfaces/enums that are never
 * imported elsewhere in the same file.
 *
 * @example
 * ```ts
 * const content = 'export function foo() {}'
 * const items = detectUnusedExports(content, 'test.ts')
 * // items[0].name === 'foo', items[0].type === 'unused-export'
 * ```
 */
export function detectUnusedExports(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  // Collect all import specifiers in the file
  const importNames = new Set<string>()
  const importPattern = /import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from/g
  for (const line of lines) {
    let match: RegExpExecArray | null
    importPattern.lastIndex = 0
    match = importPattern.exec(line)
    while (match !== null) {
      if (match[1]) {
        const names = match[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()?.trim() ?? '')
        for (const n of names) {
          if (n) importNames.add(n)
        }
      }
      if (match[2]) {
        importNames.add(match[2])
      }
      match = importPattern.exec(line)
    }
  }

  // Also collect re-export names
  const reExportPattern = /export\s+\{([^}]+)\}\s+from/g
  for (const line of lines) {
    reExportPattern.lastIndex = 0
    const match = reExportPattern.exec(line)
    while (match !== null) {
      const names = match[1].split(',').map((n) => n.trim().split(/\s+as\s+/).pop()?.trim() ?? '')
      for (const n of names) {
        if (n) importNames.add(n)
      }
      reExportPattern.lastIndex = 0
      break
    }
  }

  // Patterns for exported declarations
  const exportPatterns: Array<{ pattern: RegExp; kind: string; confidence: number }> = [
    { pattern: /^export\s+function\s+(\w+)/, kind: 'function', confidence: 80 },
    { pattern: /^export\s+async\s+function\s+(\w+)/, kind: 'function', confidence: 80 },
    { pattern: /^export\s+class\s+(\w+)/, kind: 'class', confidence: 85 },
    { pattern: /^export\s+interface\s+(\w+)/, kind: 'interface', confidence: 70 },
    { pattern: /^export\s+type\s+(\w+)/, kind: 'type', confidence: 70 },
    { pattern: /^export\s+enum\s+(\w+)/, kind: 'enum', confidence: 80 },
    { pattern: /^export\s+const\s+(\w+)/, kind: 'const', confidence: 75 },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    for (const { pattern, kind, confidence } of exportPatterns) {
      const match = trimmed.match(pattern)
      if (match && match[1]) {
        const name = match[1]
        // Check if the exported name appears in any import statement
        if (!importNames.has(name)) {
          // Also check if the name is used elsewhere in the file (non-import usage)
          const usedInFile = isNameUsed(content, name, i + 1)
          if (!usedInFile) {
            items.push({
              confidence,
              context: getContext(content, i + 1),
              file: filePath,
              line: i + 1,
              name,
              reason: `Exported ${kind} '${name}' is never imported or used in this file`,
              type: 'unused-export',
            })
          }
        }
        break
      }
    }
  }

  return items
}

// ─── detectUnreachableCode ───────────────────────────────

/**
 * Find code after return/throw/break/continue statements.
 *
 * @example
 * ```ts
 * const content = 'function foo() {\n  return 1;\n  console.log("dead");\n}'
 * const items = detectUnreachableCode(content, 'test.ts')
 * // items[0].name contains the unreachable line
 * ```
 */
export function detectUnreachableCode(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  const terminators = /\b(return|throw|break|continue)\b/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    if (!terminators.test(trimmed) || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      continue
    }

    // Check if this line is inside a single-line statement context
    // Look ahead for non-comment, non-blank, non-closing-brace lines
    for (let j = i + 1; j < lines.length; j++) {
      const nextLine = lines[j] ?? ''
      const nextTrimmed = nextLine.trim()

      // Stop at closing brace or blank/comment lines
      if (nextTrimmed === '}' || nextTrimmed === '};' || nextTrimmed === '},') break
      if (isCommentOrBlank(nextLine)) continue

      // Found actual code after a terminator — flag it
      items.push({
        confidence: 90,
        context: getContext(content, j + 1),
        file: filePath,
        line: j + 1,
        name: nextTrimmed.slice(0, 60),
        reason: `Code after '${trimmed.split(/\s+/)[0]}' statement is unreachable`,
        type: 'unreachable',
      })
      break
    }
  }

  return items
}

// ─── detectUnusedVariables ───────────────────────────────

/**
 * Find declared but unused variables (const, let, var).
 *
 * @example
 * ```ts
 * const content = 'const used = 1; const unused = 2; console.log(used);'
 * const items = detectUnusedVariables(content, 'test.ts')
 * // items contains 'unused' but not 'used'
 * ```
 */
export function detectUnusedVariables(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  // Patterns for variable declarations
  const varPatterns: Array<{ pattern: RegExp; kind: string }> = [
    { pattern: /(?:^|;|\s)(?:const|let|var)\s+(\w+)/, kind: 'variable' },
    { pattern: /(?:const|let|var)\s+(\w+)\s*=/, kind: 'variable' },
  ]

  // Skip patterns: loop variables, destructured params
  const skipNames = new Set(['i', 'j', 'k', 'x', 'y', 'z', '_', 'args', 'err', 'error', 'e'])

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // Skip import lines, export lines, function parameters, for-in/of heads
    if (
      trimmed.startsWith('import ') ||
      trimmed.startsWith('export ') ||
      trimmed.startsWith('for (') ||
      trimmed.startsWith('for(') ||
      trimmed.startsWith('function ') ||
      trimmed.startsWith('async function') ||
      trimmed.startsWith('* ')
    ) {
      continue
    }

    for (const { pattern } of varPatterns) {
      const match = trimmed.match(pattern)
      if (match && match[1]) {
        const name = match[1]

        // Skip _prefixed variables
        if (name.startsWith('_')) continue
        // Skip common loop variables
        if (skipNames.has(name)) continue
        // Skip if it's a destructuring pattern
        if (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':')) continue

        // Check if used elsewhere
        if (!isNameUsed(content, name, i + 1)) {
          items.push({
            confidence: 70,
            context: getContext(content, i + 1),
            file: filePath,
            line: i + 1,
            name,
            reason: `Variable '${name}' is declared but never used`,
            type: 'unused-var',
          })
        }
        break
      }
    }
  }

  return items
}

// ─── detectUnreferencedFunctions ─────────────────────────

/**
 * Find local (non-exported) functions that are never called.
 *
 * @example
 * ```ts
 * const content = 'function foo() {} function bar() { foo(); }'
 * const items = detectUnreferencedFunctions(content, 'test.ts')
 * // items contains 'bar' (never called) but not 'foo' (called by bar)
 * ```
 */
export function detectUnreferencedFunctions(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  // Find all function declarations and arrow/const function assignments
  const funcPatterns: Array<{ pattern: RegExp; kind: string }> = [
    { pattern: /^function\s+(\w+)\s*\(/, kind: 'function' },
    { pattern: /^async\s+function\s+(\w+)\s*\(/, kind: 'async function' },
    { pattern: /^(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[a-zA-Z_]\w*)\s*=>/, kind: 'arrow function' },
    { pattern: /^(?:const|let)\s+(\w+)\s*=\s*function/, kind: 'function expression' },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // Skip exported functions
    if (trimmed.startsWith('export ')) continue
    // Skip class methods (indented functions)
    if (line !== trimmed && (trimmed.startsWith('function') || trimmed.startsWith('async function'))) continue

    for (const { pattern } of funcPatterns) {
      const match = trimmed.match(pattern)
      if (match && match[1]) {
        const name = match[1]
        // Check if the function is called elsewhere
        if (!isNameUsed(content, name, i + 1)) {
          items.push({
            confidence: 75,
            context: getContext(content, i + 1),
            file: filePath,
            line: i + 1,
            name,
            reason: `Local function '${name}' is defined but never called`,
            type: 'unreferenced-fn',
          })
        }
        break
      }
    }
  }

  return items
}

// ─── detectShadowedDeclarations ──────────────────────────

/**
 * Find variable shadowing between inner and outer scopes.
 *
 * @example
 * ```ts
 * const content = 'const x = 1; { const x = 2; }'
 * const items = detectShadowedDeclarations(content, 'test.ts')
 * // items[0].name === 'x', items[0].type === 'shadowed-decl'
 * ```
 */
export function detectShadowedDeclarations(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  // Track declarations at each scope depth
  const declarationsByScope: Map<number, Map<string, number>> = new Map()

  let depth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // Skip comments and blanks
    if (isCommentOrBlank(line)) continue

    // Count braces to track scope depth
    for (const char of line) {
      if (char === '{') {
        depth++
        if (!declarationsByScope.has(depth)) {
          declarationsByScope.set(depth, new Map())
        }
      }
      if (char === '}') {
        depth = Math.max(0, depth - 1)
      }
    }

    // Find variable declarations at current depth
    const varPattern = /(?:const|let|var)\s+(\w+)/g
    let match: RegExpExecArray | null
    match = varPattern.exec(trimmed)
    while (match !== null) {
      const name = match[1]
      if (name.startsWith('_')) {
        match = varPattern.exec(trimmed)
        continue
      }

      // Check if this name exists in any outer scope
      for (let d = 0; d < depth; d++) {
        const scopeDecls = declarationsByScope.get(d)
        if (scopeDecls && scopeDecls.has(name)) {
          items.push({
            confidence: 60,
            context: getContext(content, i + 1),
            file: filePath,
            line: i + 1,
            name,
            reason: `Variable '${name}' shadows declaration in outer scope`,
            type: 'shadowed-decl',
          })
          break
        }
      }

      // Record this declaration at current depth
      let currentScope = declarationsByScope.get(depth)
      if (!currentScope) {
        currentScope = new Map()
        declarationsByScope.set(depth, currentScope)
      }
      currentScope.set(name, i + 1)

      match = varPattern.exec(trimmed)
    }
  }

  return items
}

// ─── detectUnusedParameters ──────────────────────────────

/**
 * Find function parameters that are never used in the function body.
 *
 * @example
 * ```ts
 * const content = 'function foo(unused, used) { return used; }'
 * const items = detectUnusedParameters(content, 'test.ts')
 * // items[0].name === 'unused'
 * ```
 */
export function detectUnusedParameters(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  // Find function declarations with parameters
  const funcPattern = /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/
  const arrowPattern = /(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/
  const methodPattern = /(?:(?:public|private|protected|static|async)\s+)*(\w+)\s*\(([^)]*)\)\s*(?:\{|:)/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // Try each pattern
    const funcMatch = trimmed.match(funcPattern)
    const arrowMatch = trimmed.match(arrowPattern)
    const methodMatch = trimmed.match(methodPattern)

    const match = funcMatch || arrowMatch || methodMatch
    if (!match) continue

    const paramStr = match[2]
    if (!paramStr || paramStr.trim().length === 0) continue

    const params = paramStr
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => {
        // Handle rest params, typed params, default values
        let name = p.replace(/\.\.\./, '').split(':')[0]?.split('=')[0]?.trim() ?? ''
        // Handle destructured params — skip those
        if (name.startsWith('{') || name.startsWith('[')) return ''
        return name
      })
      .filter((p) => p.length > 0)

    // Get function body — find the block
    let bodyStart = -1
    let braceCount = 0
    let bodyLines: string[] = []

    // Search for opening brace from current line
    for (let j = i; j < lines.length; j++) {
      const l = lines[j] ?? ''
      for (let c = 0; c < l.length; c++) {
        if (l[c] === '{') {
          if (bodyStart === -1) bodyStart = j
          braceCount++
        }
        if (l[c] === '}') {
          braceCount--
          if (braceCount === 0 && bodyStart !== -1) {
            bodyLines = lines.slice(bodyStart, j + 1)
            break
          }
        }
      }
      if (braceCount === 0 && bodyStart !== -1) break
    }

    // Build body content excluding the parameter list part
    let bodyContent: string
    if (bodyLines.length === 1) {
      // Single-line function: body is after the first '{'
      const firstLine = bodyLines[0] ?? ''
      const braceIdx = firstLine.indexOf('{')
      bodyContent = braceIdx >= 0 ? firstLine.slice(braceIdx + 1) : ''
    } else {
      // Multi-line: exclude the signature line (params are there)
      bodyContent = bodyLines.slice(1).join('\n')
    }

    for (const param of params) {
      if (param.startsWith('_')) continue

      const paramPattern = new RegExp(`\\b${escapeRegex(param)}\\b`)
      if (!paramPattern.test(bodyContent)) {
        items.push({
          confidence: 65,
          context: getContext(content, i + 1),
          file: filePath,
          line: i + 1,
          name: param,
          reason: `Parameter '${param}' is declared but never used in function body`,
          type: 'unused-param',
        })
      }
    }
  }

  return items
}

// ─── detectDeadBranches ──────────────────────────────────

/**
 * Find always-false or always-true conditions that create dead branches.
 *
 * @example
 * ```ts
 * const content = 'if (false) { doSomething(); }'
 * const items = detectDeadBranches(content, 'test.ts')
 * // items[0].type === 'dead-branch'
 * ```
 */
export function detectDeadBranches(content: string, filePath: string): DeadCodeItem[] {
  const items: DeadCodeItem[] = []
  const lines = content.split('\n')

  const deadConditions = [
    { pattern: /\bif\s*\(\s*false\s*\)/, condition: 'false', branch: 'if', confidence: 95 },
    { pattern: /\bif\s*\(\s*0\s*\)/, condition: '0', branch: 'if', confidence: 95 },
    { pattern: /\bif\s*\(\s*null\s*\)/, condition: 'null', branch: 'if', confidence: 90 },
    { pattern: /\bif\s*\(\s*undefined\s*\)/, condition: 'undefined', branch: 'if', confidence: 90 },
    { pattern: /\bif\s*\(\s*!\s*true\s*\)/, condition: '!true', branch: 'if', confidence: 95 },
    { pattern: /\bif\s*\(\s*!\s*1\s*\)/, condition: '!1', branch: 'if', confidence: 95 },
  ]

  const alwaysTrueConditions = [
    { pattern: /\bif\s*\(\s*true\s*\)/, condition: 'true', confidence: 95 },
    { pattern: /\bif\s*\(\s*1\s*\)/, condition: '1', confidence: 95 },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const trimmed = line.trim()

    // Check dead (always-false) conditions
    for (const { pattern, condition, confidence } of deadConditions) {
      if (pattern.test(trimmed)) {
        items.push({
          confidence,
          context: getContext(content, i + 1),
          file: filePath,
          line: i + 1,
          name: condition,
          reason: `Condition is always false ('${condition}'), branch will never execute`,
          type: 'dead-branch',
        })
        break
      }
    }

    // Check always-true conditions (else branch is dead)
    for (const { pattern, condition, confidence } of alwaysTrueConditions) {
      if (pattern.test(trimmed)) {
        // Check if there's an else branch
        const remaining = content.slice(content.indexOf(trimmed))
        if (/\belse\b/.test(remaining)) {
          items.push({
            confidence,
            context: getContext(content, i + 1),
            file: filePath,
            line: i + 1,
            name: condition,
            reason: `Condition is always true ('${condition}'), else branch will never execute`,
            type: 'dead-branch',
          })
        }
        break
      }
    }
  }

  return items
}

// ─── analyzeFile ─────────────────────────────────────────

/**
 * Run all dead code detectors on a single file.
 *
 * @example
 * ```ts
 * const items = analyzeFile(content, 'src/utils.ts')
 * // Combines results from all detect* functions
 * ```
 */
export function analyzeFile(content: string, filePath: string): DeadCodeItem[] {
  return [
    ...detectUnusedExports(content, filePath),
    ...detectUnreachableCode(content, filePath),
    ...detectUnusedVariables(content, filePath),
    ...detectUnreferencedFunctions(content, filePath),
    ...detectShadowedDeclarations(content, filePath),
    ...detectUnusedParameters(content, filePath),
    ...detectDeadBranches(content, filePath),
  ]
}

// ─── computeDeadCodeStats ────────────────────────────────

/**
 * Aggregate dead code statistics from detected items.
 *
 * @example
 * ```ts
 * const stats = computeDeadCodeStats(items, 50)
 * // stats.highConfidence >= 0
 * ```
 */
export function computeDeadCodeStats(items: DeadCodeItem[], threshold: number): DeadCodeStats {
  const filtered = items.filter((item) => item.confidence >= threshold)

  const byType: Record<string, number> = {}
  const byFile: Record<string, number> = {}
  let highConfidence = 0
  let mediumConfidence = 0
  let lowConfidence = 0

  for (const item of filtered) {
    byType[item.type] = (byType[item.type] ?? 0) + 1
    byFile[item.file] = (byFile[item.file] ?? 0) + 1

    if (item.confidence >= 80) highConfidence++
    else if (item.confidence >= 50) mediumConfidence++
    else lowConfidence++
  }

  // Estimate dead lines: 1-3 lines per item (rough heuristic)
  const estimatedLines = filtered.length * 2

  return {
    byFile,
    byType,
    estimatedLines,
    highConfidence,
    lowConfidence,
    mediumConfidence,
    totalIssues: filtered.length,
  }
}

// ─── buildDeadCodeResult ─────────────────────────────────

/**
 * Orchestrate full dead code analysis across multiple files.
 *
 * @example
 * ```ts
 * const result = await buildDeadCodeResult(
 *   ['src/a.ts', 'src/b.ts'],
 *   async (path) => fs.readFile(path, 'utf8'),
 *   { threshold: 50 },
 * )
 * ```
 */
export async function buildDeadCodeResult(
  files: string[],
  contentReader: (filePath: string) => Promise<string>,
  options: DeadCodeOptions,
): Promise<DeadCodeResult> {
  const allItems: DeadCodeItem[] = []

  for (const file of files) {
    try {
      const content = await contentReader(file)
      const fileItems = analyzeFile(content, file)
      allItems.push(...fileItems)
    } catch {
      // Skip files that can't be read
    }
  }

  const stats = computeDeadCodeStats(allItems, options.threshold)

  return {
    files,
    items: allItems.filter((item) => item.confidence >= options.threshold),
    stats,
  }
}
