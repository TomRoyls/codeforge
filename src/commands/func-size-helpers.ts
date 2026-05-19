// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Function type classification.
 *
 * @example
 * type: 'function'  // regular named function
 * type: 'method'    // class method
 * type: 'arrow'     // arrow function assigned to const
 * type: 'constructor' // class constructor
 */
export type FunctionType = 'function' | 'method' | 'arrow' | 'constructor'

/**
 * Size category based on line count.
 *
 * @example
 * classifySize(3) // 'tiny'
 * classifySize(25) // 'medium'
 * classifySize(80) // 'huge'
 */
export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'huge'

/**
 * Information about a single function.
 *
 * @example
 * const fn: FunctionInfo = {
 *   name: 'formatOutput',
 *   file: 'src/commands/count.ts',
 *   lineStart: 10,
 *   lineEnd: 25,
 *   lineCount: 16,
 *   parameterCount: 2,
 *   nestingDepth: 3,
 *   complexity: 5,
 *   isExported: true,
 *   isAsync: false,
 *   type: 'function',
 *   sizeCategory: 'medium',
 * }
 */
export interface FunctionInfo {
  name: string
  file: string
  lineStart: number
  lineEnd: number
  lineCount: number
  parameterCount: number
  nestingDepth: number
  complexity: number
  isExported: boolean
  isAsync: boolean
  type: FunctionType
  sizeCategory: SizeCategory
}

/**
 * Size distribution histogram with statistics.
 *
 * @example
 * const dist: SizeDistribution = {
 *   tiny: 10, small: 20, medium: 15, large: 5, huge: 2,
 *   total: 52, average: 12.5, median: 8, p95: 35, max: 80,
 * }
 */
export interface SizeDistribution {
  tiny: number
  small: number
  medium: number
  large: number
  huge: number
  total: number
  average: number
  median: number
  p95: number
  max: number
}

/**
 * Per-file function statistics.
 *
 * @example
 * const stats: FileFunctionStats = {
 *   file: 'src/commands/count.ts',
 *   functionCount: 8,
 *   averageSize: 15.2,
 *   maxSize: 45,
 *   oversizedCount: 2,
 *   totalLines: 198,
 * }
 */
export interface FileFunctionStats {
  file: string
  functionCount: number
  averageSize: number
  maxSize: number
  oversizedCount: number
  totalLines: number
}

/**
 * Complete function size analysis result.
 *
 * @example
 * const result: FuncSizeResult = {
 *   functions: [...],
 *   distribution: { tiny: 10, ... },
 *   fileStats: [...],
 *   oversizedFunctions: [...],
 *   stats: { totalFunctions: 52, ... },
 *   recommendations: [...],
 * }
 */
export interface FuncSizeResult {
  functions: FunctionInfo[]
  distribution: SizeDistribution
  fileStats: FileFunctionStats[]
  oversizedFunctions: FunctionInfo[]
  stats: {
    totalFunctions: number
    totalFiles: number
    exportedFunctions: number
    asyncFunctions: number
    averageParameters: number
  }
  recommendations: string[]
}

/**
 * Options for function size analysis.
 *
 * @example
 * const opts: FuncSizeOptions = { threshold: 50, verbose: true }
 */
export interface FuncSizeOptions {
  threshold?: number
  verbose?: boolean
}

// ─── Size Classification ──────────────────────────────────────────────────────

/**
 * Classify a function by its line count.
 *
 * @example
 * classifySize(3) // 'tiny'
 * classifySize(12) // 'small'
 * classifySize(25) // 'medium'
 * classifySize(45) // 'large'
 * classifySize(80) // 'huge'
 */
export function classifySize(lineCount: number): SizeCategory {
  if (lineCount <= 5) return 'tiny'
  if (lineCount <= 15) return 'small'
  if (lineCount <= 30) return 'medium'
  if (lineCount <= 60) return 'large'
  return 'huge'
}

// ─── Parameter Counting ───────────────────────────────────────────────────────

/**
 * Count parameters in a function signature string.
 *
 * @example
 * countParameters('(a: string, b: number)') // 2
 * countParameters('()') // 0
 * countParameters('(...args: string[])') // 1
 */
export function countParameters(signature: string): number {
  const inner = signature.replace(/^\(/, '').replace(/\)$/, '').trim()
  if (!inner) return 0

  let count = 0
  let depth = 0
  for (const ch of inner) {
    if (ch === '(' || ch === '[' || ch === '{' || ch === '<') depth++
    if (ch === ')' || ch === ']' || ch === '}' || ch === '>') depth--
    if (ch === ',' && depth === 0) count++
  }
  return count + 1
}

// ─── Nesting Depth ────────────────────────────────────────────────────────────

/**
 * Compute maximum nesting depth in a code block.
 *
 * @example
 * computeNestingDepth('if (x) { if (y) { return 1 } }') // 2
 * computeNestingDepth('return 1') // 0
 */
export function computeNestingDepth(body: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of body) {
    if (ch === '{') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    }
    if (ch === '}') {
      currentDepth--
    }
  }
  return maxDepth
}

// ─── Complexity Estimation ────────────────────────────────────────────────────

/**
 * Estimate cyclomatic complexity by counting decision points.
 *
 * @example
 * estimateComplexity('if (x) { foo() }') // 2
 * estimateComplexity('for (let i = 0; i < 10; i++) { if (x) {} }') // 3
 */
export function estimateComplexity(code: string): number {
  let complexity = 1
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /&&/g,
    /\|\|/g,
    /\?\?/g,
  ]
  for (const pattern of patterns) {
    const matches = code.match(pattern)
    complexity += matches ? matches.length : 0
  }
  return complexity
}

// ─── Function Extraction ──────────────────────────────────────────────────────

/**
 * Extract all functions from source content.
 *
 * @example
 * const fns = extractFunctions('function foo(a: number) { return a + 1 }', 'test.ts')
 * // [{ name: 'foo', lineStart: 1, lineEnd: 1, lineCount: 1, ... }]
 */
export function extractFunctions(content: string, filePath: string): FunctionInfo[] {
  const functions: FunctionInfo[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    const lineNum = i + 1
    const trimmed = line.trim()

    // Skip lines inside multi-line strings or comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

    let match: RegExpExecArray | null

    // Regular functions: function name(...)
    match = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(?:<[^>]*>)?\s*\(/)
    if (match) {
      const fn = buildFunctionInfo(lines, i, filePath, match[1], 'function', trimmed)
      if (fn) functions.push(fn)
      continue
    }

    // Arrow functions: const name = (...) =>
    match = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:async\s+)?\(/)
    if (match) {
      const fn = buildFunctionInfo(lines, i, filePath, match[1], 'arrow', trimmed)
      if (fn) functions.push(fn)
      continue
    }

    // Arrow with single param: const name = x =>
    match = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*[^=]+?)?\s*=\s*(?:async\s+)?(\w+)\s*=>/)
    if (match) {
      const fn = buildFunctionInfo(lines, i, filePath, match[1], 'arrow', trimmed)
      if (fn) functions.push(fn)
      continue
    }

    // Constructor
    match = trimmed.match(/^\s*(?:public\s+|private\s+|protected\s+)?constructor\s*\(/)
    if (match) {
      const fn = buildFunctionInfo(lines, i, filePath, 'constructor', 'constructor', trimmed)
      if (fn) functions.push(fn)
      continue
    }

    // Class methods (must be indented, inside a class body)
    match = trimmed.match(/^(?:public\s+|private\s+|protected\s+|static\s+|async\s+|readonly\s+)*(?:get\s+|set\s+)?(\w+)\s*(?:<[^>]*>)?\s*\(/)
    if (match && match[1] !== 'if' && match[1] !== 'for' && match[1] !== 'while' && match[1] !== 'switch' && match[1] !== 'catch' && match[1] !== 'class' && match[1] !== 'function' && match[1] !== 'return' && match[1] !== 'new' && match[1] !== 'throw' && match[1] !== 'delete' && match[1] !== 'type' && match[1] !== 'interface' && match[1] !== 'export' && match[1] !== 'import') {
      // Only if indented (inside a class)
      if (line !== trimmed && trimmed.includes('{')) {
        const fn = buildFunctionInfo(lines, i, filePath, match[1], 'method', trimmed)
        if (fn) functions.push(fn)
      }
    }
  }

  return functions
}

/**
 * Build a FunctionInfo from a detected function start.
 *
 * @example
 * buildFunctionInfo(lines, 0, 'test.ts', 'foo', 'function', 'function foo() {')
 */
export function buildFunctionInfo(
  lines: string[],
  startIdx: number,
  filePath: string,
  name: string,
  type: FunctionType,
  firstLine: string,
): FunctionInfo | null {
  const lineStart = startIdx + 1

  // Find the end by tracking brace depth
  let depth = 0
  let foundOpen = false
  let endIdx = startIdx

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) break
    for (const ch of line) {
      if (ch === '{') {
        depth++
        foundOpen = true
      }
      if (ch === '}') {
        depth--
      }
    }
    endIdx = i
    if (foundOpen && depth <= 0) break
  }

  const lineEnd = endIdx + 1
  const lineCount = lineEnd - lineStart + 1
  const body = lines.slice(startIdx, endIdx + 1).join('\n')

  // Extract parameter count
  let paramCount = 0
  const parenMatch = firstLine.match(/\(([^)]*)\)/)
  if (parenMatch) {
    paramCount = countParameters(parenMatch[0])
  } else if (type === 'arrow') {
    const arrowSingle = firstLine.match(/=\s*(\w+)\s*=>/)
    if (arrowSingle) paramCount = 1
  }

  const nestingDepth = computeNestingDepth(body)
  const complexity = estimateComplexity(body)
  const isExported = firstLine.includes('export')
  const isAsync = firstLine.includes('async')
  const sizeCategory = classifySize(lineCount)

  return {
    name,
    file: filePath,
    lineStart,
    lineEnd,
    lineCount,
    parameterCount: paramCount,
    nestingDepth: Math.max(0, nestingDepth - 1),
    complexity,
    isExported,
    isAsync,
    type,
    sizeCategory,
  }
}

// ─── Distribution ─────────────────────────────────────────────────────────────

/**
 * Compute size distribution across all functions.
 *
 * @example
 * const dist = computeDistribution(functions)
 * // { tiny: 10, small: 20, ..., average: 12.5, median: 8, p95: 35, max: 80 }
 */
export function computeDistribution(functions: FunctionInfo[]): SizeDistribution {
  const dist: SizeDistribution = {
    tiny: 0,
    small: 0,
    medium: 0,
    large: 0,
    huge: 0,
    total: functions.length,
    average: 0,
    median: 0,
    p95: 0,
    max: 0,
  }

  if (functions.length === 0) return dist

  for (const fn of functions) {
    dist[fn.sizeCategory]++
  }

  const sizes = functions.map((f) => f.lineCount).sort((a, b) => a - b)
  const sum = sizes.reduce((a, b) => a + b, 0)
  dist.average = Math.round((sum / sizes.length) * 10) / 10
  dist.median = sizes[Math.floor(sizes.length / 2)] ?? 0
  dist.p95 = sizes[Math.floor(sizes.length * 0.95)] ?? sizes[sizes.length - 1] ?? 0
  dist.max = sizes[sizes.length - 1] ?? 0

  return dist
}

// ─── File Stats ───────────────────────────────────────────────────────────────

/**
 * Compute per-file function statistics.
 *
 * @example
 * computeFileStats(functions) // [{ file: 'a.ts', functionCount: 5, ... }]
 */
export function computeFileStats(functions: FunctionInfo[], threshold: number): FileFunctionStats[] {
  const fileMap = new Map<string, FunctionInfo[]>()

  for (const fn of functions) {
    const existing = fileMap.get(fn.file)
    if (existing) {
      existing.push(fn)
    } else {
      fileMap.set(fn.file, [fn])
    }
  }

  const stats: FileFunctionStats[] = []
  for (const [file, fns] of fileMap) {
    const sizes = fns.map((f) => f.lineCount)
    const maxSize = Math.max(...sizes)
    const avgSize = Math.round((sizes.reduce((a, b) => a + b, 0) / sizes.length) * 10) / 10
    const oversized = fns.filter((f) => f.lineCount > threshold).length
    const totalLines = fns.reduce((sum, f) => sum + f.lineCount, 0)

    stats.push({
      file,
      functionCount: fns.length,
      averageSize: avgSize,
      maxSize,
      oversizedCount: oversized,
      totalLines,
    })
  }

  stats.sort((a, b) => b.averageSize - a.averageSize)
  return stats
}

// ─── Oversized Detection ──────────────────────────────────────────────────────

/**
 * Find functions exceeding the line threshold.
 *
 * @example
 * findOversized(functions, 30) // functions with >30 lines
 */
export function findOversized(functions: FunctionInfo[], threshold: number): FunctionInfo[] {
  return functions
    .filter((f) => f.lineCount > threshold)
    .sort((a, b) => b.lineCount - a.lineCount)
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations based on function size analysis.
 *
 * @example
 * generateRecommendations(oversized, distribution)
 * // ['3 functions exceed the 50-line threshold...', ...]
 */
export function generateRecommendations(
  oversized: FunctionInfo[],
  distribution: SizeDistribution,
  fileStats: FileFunctionStats[],
): string[] {
  const recs: string[] = []

  if (oversized.length > 0) {
    recs.push(
      `${oversized.length} function${oversized.length > 1 ? 's' : ''} exceed the size threshold. Consider splitting into smaller functions.`,
    )
  }

  const hugeFunctions = oversized.filter((f) => f.lineCount > 100)
  if (hugeFunctions.length > 0) {
    const names = hugeFunctions.slice(0, 3).map((f) => `${f.name} (${f.lineCount} lines)`).join(', ')
    recs.push(`Very large functions detected: ${names}. These need immediate refactoring.`)
  }

  if (distribution.large > distribution.total * 0.3) {
    recs.push('High proportion of large functions (30-60 lines). Consider the "extract method" refactoring pattern.')
  }

  if (distribution.huge > 0) {
    recs.push(`${distribution.huge} function${distribution.huge > 1 ? 's are' : ' is'} over 60 lines. Functions should generally be under 30 lines.`)
  }

  const worstFiles = fileStats.filter((f) => f.oversizedCount > 0)
  if (worstFiles.length > 0) {
    const top = worstFiles.slice(0, 2).map((f) => `${f.file} (avg ${f.averageSize} lines)`).join(', ')
    recs.push(`Files with largest average function size: ${top}`)
  }

  const deepNesting = oversized.filter((f) => f.nestingDepth > 3)
  if (deepNesting.length > 0) {
    recs.push(`${deepNesting.length} oversized function${deepNesting.length > 1 ? 's have' : ' has'} nesting depth > 3. Consider early returns or guard clauses.`)
  }

  if (recs.length === 0) {
    recs.push('All functions are within healthy size limits. Great job!')
  }

  return recs
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Build a complete function size analysis result.
 *
 * @example
 * const result = buildFuncSizeResult(['a.ts'], [content], { threshold: 50 })
 */
export function buildFuncSizeResult(
  files: string[],
  contents: string[],
  options: FuncSizeOptions,
): FuncSizeResult {
  const threshold = options.threshold ?? 50

  const allFunctions: FunctionInfo[] = []
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const content = contents[i]
    if (filePath === undefined || content === undefined) continue
    allFunctions.push(...extractFunctions(content, filePath))
  }

  const distribution = computeDistribution(allFunctions)
  const fileStats = computeFileStats(allFunctions, threshold)
  const oversized = findOversized(allFunctions, threshold)
  const recommendations = generateRecommendations(oversized, distribution, fileStats)

  const uniqueFiles = new Set(allFunctions.map((f) => f.file))
  const exported = allFunctions.filter((f) => f.isExported).length
  const asyncFns = allFunctions.filter((f) => f.isAsync).length
  const avgParams = allFunctions.length > 0
    ? Math.round((allFunctions.reduce((sum, f) => sum + f.parameterCount, 0) / allFunctions.length) * 10) / 10
    : 0

  return {
    functions: allFunctions,
    distribution,
    fileStats,
    oversizedFunctions: oversized,
    stats: {
      totalFunctions: allFunctions.length,
      totalFiles: uniqueFiles.size,
      exportedFunctions: exported,
      asyncFunctions: asyncFns,
      averageParameters: avgParams,
    },
    recommendations,
  }
}
