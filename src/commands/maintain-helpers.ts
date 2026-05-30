// ─── Interfaces ──────────────────────────────────────────

/**
 * @example
 * ```ts
 * const metrics: FunctionMetrics = {
 *   name: 'processData',
 *   filePath: 'src/utils.ts',
 *   startLine: 10,
 *   endLine: 45,
 *   linesOfCode: 36,
 *   cyclomaticComplexity: 8,
 *   parameterCount: 3,
 *   nestingDepth: 2,
 *   returnStatementCount: 4,
 *   maintainabilityIndex: 72,
 *   issues: ['High cyclomatic complexity (8)'],
 * }
 * ```
 */
export interface FunctionMetrics {
  name: string
  filePath: string
  startLine: number
  endLine: number
  linesOfCode: number
  cyclomaticComplexity: number
  parameterCount: number
  nestingDepth: number
  returnStatementCount: number
  maintainabilityIndex: number
  issues: string[]
}

/**
 * @example
 * ```ts
 * const suggestion: RefactoringSuggestion = {
 *   type: 'extract-function',
 *   file: 'src/utils.ts',
 *   line: 42,
 *   description: 'Function processData is 80 lines long. Consider extracting sublogic.',
 *   impact: 'medium',
 *   effort: 'low',
 * }
 * ```
 */
export interface RefactoringSuggestion {
  type: 'extract-function' | 'reduce-params' | 'simplify-conditional' | 'split-file' | 'reduce-nesting' | 'extract-constant' | 'rename'
  file: string
  line: number
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
}

/**
 * @example
 * ```ts
 * const file: FileMaintainability = {
 *   filePath: 'src/utils.ts',
 *   linesOfCode: 200,
 *   functions: [],
 *   avgComplexity: 5.2,
 *   avgLinesPerFunction: 25,
 *   avgMaintainability: 70,
 *   maxNestingDepth: 3,
 *   maintainabilityIndex: 75,
 *   issues: [],
 *   suggestions: [],
 * }
 * ```
 */
export interface FileMaintainability {
  filePath: string
  linesOfCode: number
  functions: FunctionMetrics[]
  avgComplexity: number
  avgLinesPerFunction: number
  avgMaintainability: number
  maxNestingDepth: number
  maintainabilityIndex: number
  issues: string[]
  suggestions: RefactoringSuggestion[]
}

/**
 * @example
 * ```ts
 * const stats: MaintainabilityStats = {
 *   totalFiles: 10,
 *   totalFunctions: 45,
 *   avgMaintainability: 78,
 *   avgComplexity: 4.5,
 *   avgLinesPerFunction: 22,
 *   highRiskFiles: 2,
 *   suggestions: [],
 * }
 * ```
 */
export interface MaintainabilityStats {
  totalFiles: number
  totalFunctions: number
  avgMaintainability: number
  avgComplexity: number
  avgLinesPerFunction: number
  highRiskFiles: number
  suggestions: RefactoringSuggestion[]
}

/**
 * @example
 * ```ts
 * const result: MaintainResult = {
 *   files: [],
 *   stats: { totalFiles: 0, totalFunctions: 0, avgMaintainability: 100, avgComplexity: 0, avgLinesPerFunction: 0, highRiskFiles: 0, suggestions: [] },
 *   overallScore: 85,
 *   grade: 'A',
 * }
 * ```
 */
export interface MaintainResult {
  files: FileMaintainability[]
  stats: MaintainabilityStats
  overallScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

// ─── Function discovery ─────────────────────────────────

export interface RawFunction {
  name: string
  filePath: string
  startLine: number
  endLine: number
  body: string
}

/**
 * Find all function definitions and their line ranges.
 *
 * @example
 * ```ts
 * const functions = findFunctions('function hello() { return 1; }', 'test.ts')
 * // [{ name: 'hello', startLine: 1, endLine: 1, body: 'function hello() { return 1; }' }]
 * ```
 */
export function findFunctions(content: string, filePath: string): RawFunction[] {
  const results: RawFunction[] = []
  if (content.length === 0) return results

  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    // Named function declaration: function foo(
    const funcMatch = trimmed.match(/^function\s+([A-Za-z_$][\w$]*)\s*\(/)
    if (funcMatch) {
      const name = funcMatch[1] ?? ''
      const startLine = i + 1
      const endLine = findFunctionEnd(lines, i)
      const body = lines.slice(i, endLine).join('\n')
      results.push({ filePath, name, startLine, endLine, body })
      continue
    }

    // Arrow function: const foo = ( or const foo = (
    const arrowMatch = trimmed.match(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/)
    if (arrowMatch) {
      const name = arrowMatch[1] ?? ''
      const startLine = i + 1
      const endLine = findFunctionEnd(lines, i)
      const body = lines.slice(i, endLine).join('\n')
      results.push({ filePath, name, startLine, endLine, body })
      continue
    }

    // Function expression: const foo = function
    const funcExprMatch = trimmed.match(/^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*function/)
    if (funcExprMatch) {
      const name = funcExprMatch[1] ?? ''
      const startLine = i + 1
      const endLine = findFunctionEnd(lines, i)
      const body = lines.slice(i, endLine).join('\n')
      results.push({ filePath, name, startLine, endLine, body })
      continue
    }

    // Method in class/object: foo( or foo = (
    const methodMatch = trimmed.match(/^(?:async\s+)?([A-Za-z_$][\w$]*)\s*(?:<(?:[^>]|<[^>]*>)*>)?\s*\(/)
    if (methodMatch) {
      // Check it's not a control keyword
      const name = methodMatch[1] ?? ''
      const controlKeywords = new Set(['if', 'for', 'while', 'switch', 'catch', 'class', 'interface', 'type', 'import', 'export', 'return', 'throw', 'new', 'typeof', 'instanceof', 'delete', 'void'])
      if (!controlKeywords.has(name)) {
        // Only if this line contains a { or => indicating a function body
        const hasBody = trimmed.includes('{') || trimmed.includes('=>')
        if (hasBody) {
          const startLine = i + 1
          const endLine = findFunctionEnd(lines, i)
          const body = lines.slice(i, endLine).join('\n')
          results.push({ filePath, name, startLine, endLine, body })
        }
      }
    }
  }

  return results
}

/**
 * Find the end line of a function starting at the given line index.
 */
function findFunctionEnd(lines: string[], startIndex: number): number {
  let braceDepth = 0
  let foundOpen = false
  let inString: false | "'" | '"' | '`' = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]!
    inLineComment = false

    for (let j = 0; j < line.length; j++) {
      const ch = line[j]!
      const next = line[j + 1]

      // Handle string state
      if (inString) {
        if (ch === '\\') {
          j++ // skip escaped char
          continue
        }
        if (ch === inString) {
          inString = false
        }
        continue
      }

      // Handle comment states
      if (inBlockComment) {
        if (ch === '*' && next === '/') {
          inBlockComment = false
          j++
        }
        continue
      }

      if (inLineComment) {
        continue
      }

      // Check for comment start
      if (ch === '/' && next === '/') {
        inLineComment = true
        continue
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true
        j++
        continue
      }

      // Check for string start
      if (ch === "'" || ch === '"' || ch === '`') {
        inString = ch
        continue
      }

      // Track braces
      if (ch === '{') {
        braceDepth++
        foundOpen = true
      } else if (ch === '}') {
        braceDepth--
        if (foundOpen && braceDepth === 0) {
          return i + 1 // 1-indexed end line
        }
      }
    }
  }

  // If no braces found (arrow function without braces), return next line
  if (!foundOpen) {
    return Math.min(startIndex + 2, lines.length)
  }

  return lines.length
}

// ─── Cyclomatic complexity ──────────────────────────────

/**
 * Compute McCabe's cyclomatic complexity for a function body.
 * Starts at 1, +1 for each decision point.
 *
 * @example
 * ```ts
 * computeCyclomaticComplexity('if (x) { foo(); }') // 2
 * computeCyclomaticComplexity('function simple() { return 1; }') // 1
 * ```
 */
export function computeCyclomaticComplexity(functionBody: string): number {
  let complexity = 1

  // We need to avoid counting inside strings/comments
  let inString: false | "'" | '"' | '`' = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < functionBody.length; i++) {
    const ch = functionBody[i]!
    const next = functionBody[i + 1]

    // Handle string state
    if (inString) {
      if (ch === '\\') {
        i++ // skip escaped char
        continue
      }
      if (ch === inString) {
        inString = false
      }
      continue
    }

    // Handle comment states
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
      }
      continue
    }

    // Check for comment start
    if (ch === '/' && next === '/') {
      inLineComment = true
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }

    // Check for string start
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }

    // Count decision points
    if (ch === 'i' && next === 'f') {
      // "if" keyword
      const after = functionBody[i + 2]
      if (!after || !isWordChar(after)) {
        const before = functionBody[i - 1]
        if (!before || !isWordChar(before)) {
          complexity++
        }
      }
    }

    if (ch === 'e' && functionBody.slice(i, i + 7) === 'else if') {
      const before = functionBody[i - 1]
      if (!before || !isWordChar(before)) {
        complexity++
        i += 6 // skip "else i"
      }
    }

    if (ch === 'f' && functionBody.slice(i, i + 3) === 'for') {
      const after = functionBody[i + 3]
      if (!after || !isWordChar(after)) {
        const before = functionBody[i - 1]
        if (!before || !isWordChar(before)) {
          complexity++
        }
      }
    }

    if (ch === 'w' && functionBody.slice(i, i + 5) === 'while') {
      const after = functionBody[i + 5]
      if (!after || !isWordChar(after)) {
        const before = functionBody[i - 1]
        if (!before || !isWordChar(before)) {
          complexity++
        }
      }
    }

    if (ch === 'c' && functionBody.slice(i, i + 4) === 'case') {
      const after = functionBody[i + 4]
      if (!after || !isWordChar(after)) {
        const before = functionBody[i - 1]
        if (!before || !isWordChar(before)) {
          complexity++
        }
      }
    }

    if (ch === 'c' && functionBody.slice(i, i + 5) === 'catch') {
      const after = functionBody[i + 5]
      if (!after || !isWordChar(after)) {
        const before = functionBody[i - 1]
        if (!before || !isWordChar(before)) {
          complexity++
        }
      }
    }

    // && and ||
    if (ch === '&' && next === '&') {
      complexity++
    }
    if (ch === '|' && next === '|') {
      complexity++
    }

    // Ternary operator
    if (ch === '?') {
      // Skip ?. (optional chaining)
      if (next !== '.' && next !== '?') {
        complexity++
      }
    }
  }

  return complexity
}

function isWordChar(ch: string): boolean {
  return /[a-zA-Z0-9_$]/.test(ch)
}

// ─── Parameter counting ─────────────────────────────────

/**
 * Count function parameters from a signature string.
 * Handles destructuring, rest params, and default values.
 *
 * @example
 * ```ts
 * countParameters('(a, b, c)') // 3
 * countParameters('()') // 0
 * countParameters('(...args)') // 1
 * ```
 */
export function countParameters(functionSignature: string): number {
  const parenStart = functionSignature.indexOf('(')
  if (parenStart === -1) return 0

  let parenDepth = 0
  let braceDepth = 0
  let bracketDepth = 0
  let paramStart = -1
  let count = 0

  for (let i = parenStart; i < functionSignature.length; i++) {
    const ch = functionSignature[i]!
    if (ch === '(') {
      parenDepth++
      if (parenDepth === 1) {
        paramStart = i + 1
        continue
      }
    }
    if (ch === ')') {
      parenDepth--
      if (parenDepth === 0) {
        const paramStr = functionSignature.slice(paramStart, i).trim()
        if (paramStr.length > 0) {
          count++
        }
        break
      }
    }
    if (ch === '{') braceDepth++
    if (ch === '}') braceDepth--
    if (ch === '[') bracketDepth++
    if (ch === ']') bracketDepth--
    if (parenDepth === 1 && braceDepth === 0 && bracketDepth === 0 && ch === ',') {
      count++
      paramStart = i + 1
    }
  }

  return count
}

// ─── Nesting depth ──────────────────────────────────────

/**
 * Compute maximum nesting depth in a function body.
 *
 * @example
 * ```ts
 * computeNestingDepth('if (x) { if (y) { foo(); } }') // 2
 * computeNestingDepth('return 1;') // 0
 * ```
 */
export function computeNestingDepth(functionBody: string): number {
  let maxDepth = 0
  let currentDepth = 0
  let inString: false | "'" | '"' | '`' = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < functionBody.length; i++) {
    const ch = functionBody[i]!
    const next = functionBody[i + 1]

    if (inString) {
      if (ch === '\\') {
        i++
        continue
      }
      if (ch === inString) {
        inString = false
      }
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
      }
      continue
    }

    if (ch === '/' && next === '/') {
      inLineComment = true
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }

    if (ch === '{') {
      currentDepth++
      if (currentDepth > maxDepth) {
        maxDepth = currentDepth
      }
    } else if (ch === '}') {
      currentDepth--
    }
  }

  // Subtract 1 for the function's own body braces (if present)
  return maxDepth > 0 ? maxDepth - 1 : 0
}

// ─── Maintainability Index ──────────────────────────────

/**
 * Compute function-level maintainability index (0-100).
 * Higher is better.
 *
 * @example
 * ```ts
 * computeFunctionMI({ linesOfCode: 10, cyclomaticComplexity: 2, parameterCount: 2, nestingDepth: 1 })
 * // ~78
 * ```
 */
export function computeFunctionMI(metrics: {
  linesOfCode: number
  cyclomaticComplexity: number
  parameterCount: number
  nestingDepth: number
}): number {
  const raw = 100 - (metrics.linesOfCode * 0.2) - (metrics.cyclomaticComplexity * 5) - (metrics.parameterCount * 3) - (metrics.nestingDepth * 8)
  return Math.max(0, Math.min(100, Math.round(raw)))
}

// ─── Function issues ────────────────────────────────────

/**
 * Generate issue descriptions for function metrics.
 *
 * @example
 * ```ts
 * generateFunctionIssues({ cyclomaticComplexity: 15, linesOfCode: 10, parameterCount: 2, nestingDepth: 1 })
 * // ['High cyclomatic complexity (15)']
 * ```
 */
export function generateFunctionIssues(metrics: {
  cyclomaticComplexity: number
  linesOfCode: number
  parameterCount: number
  nestingDepth: number
}): string[] {
  const issues: string[] = []

  if (metrics.cyclomaticComplexity > 10) {
    issues.push(`High cyclomatic complexity (${metrics.cyclomaticComplexity})`)
  }
  if (metrics.linesOfCode > 50) {
    issues.push(`Function too long (${metrics.linesOfCode} lines)`)
  }
  if (metrics.parameterCount > 4) {
    issues.push(`Too many parameters (${metrics.parameterCount})`)
  }
  if (metrics.nestingDepth > 4) {
    issues.push(`Deep nesting (${metrics.nestingDepth} levels)`)
  }

  return issues
}

// ─── Return statement counting ──────────────────────────

function countReturnStatements(body: string): number {
  let count = 0
  let inString: false | "'" | '"' | '`' = false
  let inLineComment = false
  let inBlockComment = false

  for (let i = 0; i < body.length; i++) {
    const ch = body[i]!
    const next = body[i + 1]

    if (inString) {
      if (ch === '\\') {
        i++
        continue
      }
      if (ch === inString) {
        inString = false
      }
      continue
    }

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i++
      }
      continue
    }

    if (inLineComment) {
      if (ch === '\n') {
        inLineComment = false
      }
      continue
    }

    if (ch === '/' && next === '/') {
      inLineComment = true
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i++
      continue
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }

    if (ch === 'r' && body.slice(i, i + 6) === 'return') {
      const before = body[i - 1]
      const after = body[i + 6]
      if ((!before || !isWordChar(before)) && (!after || !isWordChar(after))) {
        count++
      }
    }
  }

  return count
}

// ─── Refactoring suggestions ────────────────────────────

/**
 * Generate refactoring suggestions for a file's metrics.
 *
 * @example
 * ```ts
 * const suggestions = generateRefactoringSuggestions(fileMetrics)
 * ```
 */
export function generateRefactoringSuggestions(fileMetrics: FileMaintainability): RefactoringSuggestion[] {
  const suggestions: RefactoringSuggestion[] = []

  for (const fn of fileMetrics.functions) {
    // Long function → extract-function
    if (fn.linesOfCode > 50) {
      suggestions.push({
        type: 'extract-function',
        file: fileMetrics.filePath,
        line: fn.startLine,
        description: `Function "${fn.name}" is ${fn.linesOfCode} lines long. Consider extracting sublogic into separate functions.`,
        impact: fn.linesOfCode > 100 ? 'high' : 'medium',
        effort: fn.linesOfCode > 100 ? 'medium' : 'low',
      })
    }

    // Many params → reduce-params
    if (fn.parameterCount > 4) {
      suggestions.push({
        type: 'reduce-params',
        file: fileMetrics.filePath,
        line: fn.startLine,
        description: `Function "${fn.name}" has ${fn.parameterCount} parameters. Consider using an options object or splitting responsibilities.`,
        impact: fn.parameterCount > 6 ? 'high' : 'medium',
        effort: 'low',
      })
    }

    // High complexity → simplify-conditional
    if (fn.cyclomaticComplexity > 10) {
      suggestions.push({
        type: 'simplify-conditional',
        file: fileMetrics.filePath,
        line: fn.startLine,
        description: `Function "${fn.name}" has cyclomatic complexity of ${fn.cyclomaticComplexity}. Consider simplifying conditional logic or using early returns.`,
        impact: fn.cyclomaticComplexity > 20 ? 'high' : 'medium',
        effort: 'medium',
      })
    }

    // Deep nesting → reduce-nesting
    if (fn.nestingDepth > 4) {
      suggestions.push({
        type: 'reduce-nesting',
        file: fileMetrics.filePath,
        line: fn.startLine,
        description: `Function "${fn.name}" has nesting depth of ${fn.nestingDepth}. Consider using guard clauses or extracting nested logic.`,
        impact: fn.nestingDepth > 6 ? 'high' : 'medium',
        effort: 'medium',
      })
    }

    // Short cryptic names → rename
    if (fn.name.length <= 2 && !fn.name.startsWith('_')) {
      suggestions.push({
        type: 'rename',
        file: fileMetrics.filePath,
        line: fn.startLine,
        description: `Function "${fn.name}" has a very short name. Consider using a more descriptive name.`,
        impact: 'low',
        effort: 'low',
      })
    }
  }

  // Large file → split-file
  if (fileMetrics.linesOfCode > 500) {
    suggestions.push({
      type: 'split-file',
      file: fileMetrics.filePath,
      line: 1,
      description: `File has ${fileMetrics.linesOfCode} lines. Consider splitting into smaller modules.`,
      impact: fileMetrics.linesOfCode > 1000 ? 'high' : 'medium',
      effort: 'high',
    })
  }

  // Magic numbers → extract-constant (simple heuristic)
  const content = fileMetrics.functions.map((f) => f.name).join('\n')
  if (content.length === 0) {
    // Use a simple check on the file itself
  }

  return suggestions
}

// ─── File analysis ──────────────────────────────────────

/**
 * Analyze a single file for maintainability.
 *
 * @example
 * ```ts
 * const result = analyzeFile('function hello() { return 1; }', 'test.ts')
 * // { filePath: 'test.ts', functions: [...], ... }
 * ```
 */
export function analyzeFile(content: string, filePath: string): FileMaintainability {
  const lines = content.split('\n')
  const linesOfCode = lines.length

  const rawFunctions = findFunctions(content, filePath)

  const functions: FunctionMetrics[] = rawFunctions.map((raw) => {
    // Extract signature from first line for parameter counting
    const firstLine = raw.body.split('\n')[0] ?? ''
    const cyclomaticComplexity = computeCyclomaticComplexity(raw.body)
    const parameterCount = countParameters(firstLine)
    const nestingDepth = computeNestingDepth(raw.body)
    const returnStatementCount = countReturnStatements(raw.body)
    const fnLines = raw.endLine - raw.startLine + 1
    const maintainabilityIndex = computeFunctionMI({
      linesOfCode: fnLines,
      cyclomaticComplexity,
      parameterCount,
      nestingDepth,
    })
    const issues = generateFunctionIssues({
      cyclomaticComplexity,
      linesOfCode: fnLines,
      parameterCount,
      nestingDepth,
    })

    return {
      name: raw.name,
      filePath,
      startLine: raw.startLine,
      endLine: raw.endLine,
      linesOfCode: fnLines,
      cyclomaticComplexity,
      parameterCount,
      nestingDepth,
      returnStatementCount,
      maintainabilityIndex,
      issues,
    }
  })

  const avgComplexity = functions.length > 0
    ? functions.reduce((sum, f) => sum + f.cyclomaticComplexity, 0) / functions.length
    : 0

  const avgLinesPerFunction = functions.length > 0
    ? functions.reduce((sum, f) => sum + f.linesOfCode, 0) / functions.length
    : 0

  const avgMaintainability = functions.length > 0
    ? functions.reduce((sum, f) => sum + f.maintainabilityIndex, 0) / functions.length
    : 100

  const maxNestingDepth = functions.length > 0
    ? Math.max(...functions.map((f) => f.nestingDepth))
    : 0

  // File-level MI based on averages
  const fileMI = functions.length > 0
    ? Math.round(avgMaintainability * 0.6 + (100 - avgComplexity * 3) * 0.2 + (100 - (avgLinesPerFunction / 100) * 20) * 0.2)
    : 100

  const fileIssues: string[] = []
  if (linesOfCode > 500) {
    fileIssues.push(`Large file (${linesOfCode} lines)`)
  }
  if (avgComplexity > 10) {
    fileIssues.push(`High average complexity (${avgComplexity.toFixed(1)})`)
  }

  const result: FileMaintainability = {
    filePath,
    linesOfCode,
    functions,
    avgComplexity: Math.round(avgComplexity * 10) / 10,
    avgLinesPerFunction: Math.round(avgLinesPerFunction * 10) / 10,
    avgMaintainability: Math.round(avgMaintainability),
    maxNestingDepth,
    maintainabilityIndex: Math.max(0, Math.min(100, fileMI)),
    issues: fileIssues,
    suggestions: [],
  }

  result.suggestions = generateRefactoringSuggestions(result)

  return result
}

// ─── Stats aggregation ──────────────────────────────────

/**
 * Compute aggregate maintainability stats across files.
 *
 * @example
 * ```ts
 * const stats = computeMaintainabilityStats(files, 65)
 * ```
 */
export function computeMaintainabilityStats(files: FileMaintainability[], threshold: number): MaintainabilityStats {
  const totalFiles = files.length
  const totalFunctions = files.reduce((sum, f) => sum + f.functions.length, 0)

  const avgMaintainability = totalFiles > 0
    ? files.reduce((sum, f) => sum + f.maintainabilityIndex, 0) / totalFiles
    : 100

  const avgComplexity = totalFiles > 0
    ? files.reduce((sum, f) => sum + f.avgComplexity, 0) / totalFiles
    : 0

  const avgLinesPerFunction = totalFiles > 0
    ? files.reduce((sum, f) => sum + f.avgLinesPerFunction, 0) / totalFiles
    : 0

  const highRiskFiles = files.filter((f) => f.maintainabilityIndex < threshold).length

  const allSuggestions = files.flatMap((f) => f.suggestions)

  // Sort by impact: high > medium > low
  const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  allSuggestions.sort((a, b) => (impactOrder[a.impact] ?? 2) - (impactOrder[b.impact] ?? 2))

  return {
    totalFiles,
    totalFunctions,
    avgMaintainability: Math.round(avgMaintainability * 10) / 10,
    avgComplexity: Math.round(avgComplexity * 10) / 10,
    avgLinesPerFunction: Math.round(avgLinesPerFunction * 10) / 10,
    highRiskFiles,
    suggestions: allSuggestions,
  }
}

// ─── Overall score ──────────────────────────────────────

/**
 * Compute overall maintainability score and grade.
 *
 * @example
 * ```ts
 * const { score, grade } = computeOverallScore(stats)
 * // { score: 82, grade: 'B' }
 * ```
 */
export function computeOverallScore(stats: MaintainabilityStats): { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F' } {
  const riskPenalty = stats.totalFiles > 0
    ? (stats.highRiskFiles / stats.totalFiles) * 100
    : 0

  const complexityFactor = Math.min(100, stats.avgComplexity * 5)

  const rawScore = (stats.avgMaintainability * 0.4) + ((100 - riskPenalty) * 0.3) + ((100 - complexityFactor) * 0.3)
  const score = Math.max(0, Math.min(100, Math.round(rawScore)))

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 40) grade = 'D'
  else grade = 'F'

  return { score, grade }
}

// ─── Orchestrator ───────────────────────────────────────

export type ContentReader = (filePath: string) => Promise<string>

export interface MaintainOptions {
  threshold: number
}

/**
 * Build the complete maintainability result.
 *
 * @example
 * ```ts
 * const result = await buildMaintainResult(
 *   ['src/index.ts'],
 *   async (p) => fs.readFile(p, 'utf8'),
 *   { threshold: 65 },
 * )
 * ```
 */
export async function buildMaintainResult(
  files: string[],
  contentReader: ContentReader,
  options: MaintainOptions,
): Promise<MaintainResult> {
  const fileResults: FileMaintainability[] = await Promise.all(
    files.map(async (filePath) => {
      try {
        const content = await contentReader(filePath)
        return analyzeFile(content, filePath)
      } catch {
        return {
          filePath,
          linesOfCode: 0,
          functions: [],
          avgComplexity: 0,
          avgLinesPerFunction: 0,
          avgMaintainability: 100,
          maxNestingDepth: 0,
          maintainabilityIndex: 100,
          issues: [],
          suggestions: [],
        }
      }
    }),
  )

  const stats = computeMaintainabilityStats(fileResults, options.threshold)
  const { score, grade } = computeOverallScore(stats)

  return {
    files: fileResults,
    stats,
    overallScore: score,
    grade,
  }
}
