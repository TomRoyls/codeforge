// ─── Types ────────────────────────────────────────────────────────────────────

export type AsyncPatternType = 'async-function' | 'promise' | 'callback' | 'event-handler' | 'timer' | 'stream' | 'generator'
export type AsyncComplexity = 'simple' | 'moderate' | 'complex'
export type AntiPatternType = 'unhandled-promise' | 'missing-await' | 'callback-hell' | 'nested-promises' | 'promise-constructor-anti-pattern' | 'sequential-parallelizable' | 'floating-promise' | 'sync-in-async'
export type AntiPatternSeverity = 'warning' | 'error'

export interface AsyncPattern {
  type: AsyncPatternType
  file: string
  line: number
  code: string
  complexity: AsyncComplexity
  hasErrorHandling: boolean
  hasTimeout: boolean
  nestingLevel: number
}

export interface AsyncAntiPattern {
  type: AntiPatternType
  file: string
  line: number
  code: string
  severity: AntiPatternSeverity
  description: string
  suggestion: string
}

export interface AsyncStats {
  totalAsyncFunctions: number
  totalPromises: number
  totalCallbacks: number
  totalEventHandlers: number
  totalTimers: number
  totalGenerators: number
  antiPatternCount: number
  errorHandlingRate: number
  averageNesting: number
}

export interface ThreadsResult {
  patterns: AsyncPattern[]
  antiPatterns: AsyncAntiPattern[]
  stats: AsyncStats
  complexityDistribution: Record<string, number>
  recommendations: string[]
}

export interface ThreadsOptions {
  verbose?: boolean
}

// ─── findAsyncFunctions ───────────────────────────────────────────────────────

/**
 * Find async functions and functions returning Promise.
 *
 * @example
 * findAsyncFunctions('async function foo() {}', 'a.ts')
 */
export function findAsyncFunctions(content: string, file: string): AsyncPattern[] {
  const patterns: AsyncPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    const asyncFuncMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s*\*?\s*(\w+)/)
      ?? line.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/)
      ?? line.match(/(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function/)

    if (asyncFuncMatch && (/async\s/.test(line) || /Promise/.test(line))) {
      const body = extractBody(lines, i)
      patterns.push({
        type: 'async-function',
        file,
        line: i + 1,
        code: line.trim(),
        complexity: classifyComplexity(body),
        hasErrorHandling: /try\s*\{|\.catch\s*\(/.test(body),
        hasTimeout: /setTimeout|setInterval/.test(body),
        nestingLevel: computeNesting(body),
      })
    }
  }

  return patterns
}

// ─── findPromises ─────────────────────────────────────────────────────────────

/**
 * Find Promise usage patterns.
 *
 * @example
 * findPromises('const p = new Promise((resolve) => resolve(1))', 'a.ts')
 */
export function findPromises(content: string, file: string): AsyncPattern[] {
  const patterns: AsyncPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/new\s+Promise|Promise\.(?:all|race|allSettled|any|resolve|reject)/.test(line)) {
      patterns.push({
        type: 'promise',
        file,
        line: i + 1,
        code: line.trim(),
        complexity: /\.then\s*\(/.test(line) ? 'moderate' : 'simple',
        hasErrorHandling: /\.catch\s*\(/.test(line),
        hasTimeout: false,
        nestingLevel: 0,
      })
    }
  }

  return patterns
}

// ─── findCallbacks ────────────────────────────────────────────────────────────

/**
 * Find callback patterns.
 *
 * @example
 * findCallbacks('arr.map((x) => x * 2)', 'a.ts')
 */
export function findCallbacks(content: string, file: string): AsyncPattern[] {
  const patterns: AsyncPattern[] = []
  const lines = content.split('\n')
  const cbMethods = /\.(?:map|filter|reduce|forEach|some|every|find|findIndex|flatMap|sort)\s*\(/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (cbMethods.test(line) && /(?:function\s*\(|=>)/.test(line)) {
      const body = extractBody(lines, i)
      patterns.push({
        type: 'callback',
        file,
        line: i + 1,
        code: line.trim(),
        complexity: 'simple',
        hasErrorHandling: /try\s*\{|\.catch\s*\(/.test(body),
        hasTimeout: false,
        nestingLevel: computeNesting(body),
      })
    }
  }

  return patterns
}

// ─── findEventHandlers ────────────────────────────────────────────────────────

/**
 * Find event handler patterns.
 *
 * @example
 * findEventHandlers('emitter.on("data", handler)', 'a.ts')
 */
export function findEventHandlers(content: string, file: string): AsyncPattern[] {
  const patterns: AsyncPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/\.on\s*\(|\.addEventListener\s*\(|\.once\s*\(|\.prependEventListener\s*\(/.test(line)) {
      patterns.push({
        type: 'event-handler',
        file,
        line: i + 1,
        code: line.trim(),
        complexity: 'simple',
        hasErrorHandling: /error/i.test(line),
        hasTimeout: false,
        nestingLevel: 0,
      })
    }
  }

  return patterns
}

// ─── findTimers ───────────────────────────────────────────────────────────────

/**
 * Find timer patterns.
 *
 * @example
 * findTimers('setTimeout(() => {}, 1000)', 'a.ts')
 */
export function findTimers(content: string, file: string): AsyncPattern[] {
  const patterns: AsyncPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/\b(?:setTimeout|setInterval|setImmediate|process\.nextTick)\s*\(/.test(line)) {
      patterns.push({
        type: 'timer',
        file,
        line: i + 1,
        code: line.trim(),
        complexity: 'simple',
        hasErrorHandling: false,
        hasTimeout: true,
        nestingLevel: 0,
      })
    }
  }

  return patterns
}

// ─── findGenerators ───────────────────────────────────────────────────────────

/**
 * Find generator function patterns.
 *
 * @example
 * findGenerators('function* gen() { yield 1 }', 'a.ts')
 */
export function findGenerators(content: string, file: string): AsyncPattern[] {
  const patterns: AsyncPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/function\s*\*/.test(line) || /yield\s/.test(line)) {
      patterns.push({
        type: 'generator',
        file,
        line: i + 1,
        code: line.trim(),
        complexity: 'simple',
        hasErrorHandling: false,
        hasTimeout: false,
        nestingLevel: 0,
      })
    }
  }

  return patterns
}

// ─── detectUnhandledPromises ──────────────────────────────────────────────────

/**
 * Detect Promises without .catch() or await.
 *
 * @example
 * detectUnhandledPromises('fetch("/api")', 'a.ts')
 */
export function detectUnhandledPromises(content: string, file: string): AsyncAntiPattern[] {
  const antiPatterns: AsyncAntiPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/\bfetch\s*\(|new\s+Promise|Promise\.(?:all|race|allSettled|any)/.test(line)) {
      if (!/await\s/.test(line) && !/\.catch\s*\(/.test(line) && !/\.then\s*\(/.test(line) && !/=\s*/.test(line)) {
        antiPatterns.push({
          type: 'unhandled-promise',
          file,
          line: i + 1,
          code: line.trim(),
          severity: 'error',
          description: 'Promise created without .catch() handler or await',
          suggestion: 'Add .catch() or await the promise',
        })
      }
    }
  }

  return antiPatterns
}

// ─── detectCallbackHell ───────────────────────────────────────────────────────

/**
 * Detect deeply nested callback patterns (>3 levels).
 *
 * @example
 * detectCallbackHell(code, 'a.ts')
 */
export function detectCallbackHell(content: string, file: string): AsyncAntiPattern[] {
  const antiPatterns: AsyncAntiPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    const nesting = computeNesting(line)
    if (nesting >= 4 && /(?:function\s*\(|=>)/.test(line)) {
      antiPatterns.push({
        type: 'callback-hell',
        file,
        line: i + 1,
        code: line.trim().substring(0, 80),
        severity: 'warning',
        description: `Callback nested ${nesting} levels deep`,
        suggestion: 'Refactor to use async/await or extract into named functions',
      })
    }
  }

  return antiPatterns
}

// ─── detectNestedPromises ─────────────────────────────────────────────────────

/**
 * Detect long .then() chains (>3 levels).
 *
 * @example
 * detectNestedPromises('p.then().then().then().then()', 'a.ts')
 */
export function detectNestedPromises(content: string, file: string): AsyncAntiPattern[] {
  const antiPatterns: AsyncAntiPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    const thenCount = (line.match(/\.then\s*\(/g) || []).length
    if (thenCount >= 3) {
      antiPatterns.push({
        type: 'nested-promises',
        file,
        line: i + 1,
        code: line.trim().substring(0, 80),
        severity: 'warning',
        description: `${thenCount} chained .then() calls`,
        suggestion: 'Replace .then() chain with async/await for readability',
      })
    }
  }

  return antiPatterns
}

// ─── detectSequentialParallelizable ───────────────────────────────────────────

/**
 * Detect sequential awaits that could be parallelized with Promise.all.
 *
 * @example
 * detectSequentialParallelizable(code, 'a.ts')
 */
export function detectSequentialParallelizable(content: string, file: string): AsyncAntiPattern[] {
  const antiPatterns: AsyncAntiPattern[] = []
  const lines = content.split('\n')
  let prevAwaitLine = -1
  let sequentialCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/^\s*await\s/.test(line) || /\bawait\s+\w+\s*\(/.test(line)) {
      if (prevAwaitLine >= 0 && i === prevAwaitLine + 1) {
        sequentialCount++
        if (sequentialCount >= 2) {
          antiPatterns.push({
            type: 'sequential-parallelizable',
            file,
            line: i + 1,
            code: line.trim(),
            severity: 'warning',
            description: `${sequentialCount + 1} sequential awaits that could run in parallel`,
            suggestion: 'Use Promise.all() to run independent async operations concurrently',
          })
        }
      } else {
        sequentialCount = 0
      }
      prevAwaitLine = i
    }
  }

  return antiPatterns
}

// ─── detectFloatingPromises ───────────────────────────────────────────────────

/**
 * Detect promises assigned to variables but never awaited or caught.
 *
 * @example
 * detectFloatingPromises('const p = fetch("/")', 'a.ts')
 */
export function detectFloatingPromises(content: string, file: string): AsyncAntiPattern[] {
  const antiPatterns: AsyncAntiPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

    if (/=\s*(?:await\s+)?(?:new\s+Promise|fetch\s*\(|Promise\.)/.test(line)) {
      if (!/await\s/.test(line) && !/\.catch\s*\(/.test(line) && !/\.then\s*\(/.test(line)) {
        antiPatterns.push({
          type: 'floating-promise',
          file,
          line: i + 1,
          code: line.trim(),
          severity: 'warning',
          description: 'Promise stored but never awaited or caught',
          suggestion: 'Await the promise or add .catch() handler',
        })
      }
    }
  }

  return antiPatterns
}

// ─── detectSyncInAsync ────────────────────────────────────────────────────────

/**
 * Detect synchronous I/O in async functions.
 *
 * @example
 * detectSyncInAsync('async function foo() { fs.readFileSync("x") }', 'a.ts')
 */
export function detectSyncInAsync(content: string, file: string): AsyncAntiPattern[] {
  const antiPatterns: AsyncAntiPattern[] = []
  const syncMethods = /\b(?:readFileSync|writeFileSync|existsSync|statSync|readdirSync|mkdirSync|rmSync|copyFileSync|accessSync|appendFileSync|openSync|closeSync|unlinkSync|renameSync)\s*\(/

  const asyncRanges = findAsyncFunctionRanges(content)

  for (const range of asyncRanges) {
    const body = content.substring(range.start, range.end)
    const bodyLines = body.split('\n')

    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i]
      if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) continue

      if (syncMethods.test(line)) {
        antiPatterns.push({
          type: 'sync-in-async',
          file,
          line: range.lineStart + i,
          code: line.trim(),
          severity: 'warning',
          description: 'Synchronous I/O call inside async function',
          suggestion: 'Use the async equivalent (e.g., readFile instead of readFileSync)',
        })
      }
    }
  }

  return antiPatterns
}

// ─── checkErrorHandling ───────────────────────────────────────────────────────

/**
 * Check if a pattern has error handling.
 *
 * @example
 * checkErrorHandling(pattern)
 */
export function checkErrorHandling(pattern: AsyncPattern): boolean {
  return pattern.hasErrorHandling
}

// ─── computeAsyncStats ────────────────────────────────────────────────────────

/**
 * Compute aggregate async statistics.
 *
 * @example
 * computeAsyncStats(patterns, antiPatterns)
 */
export function computeAsyncStats(patterns: AsyncPattern[], antiPatterns: AsyncAntiPattern[]): AsyncStats {
  const withErrorHandling = patterns.filter((p) => p.hasErrorHandling).length
  const totalNesting = patterns.reduce((s, p) => s + p.nestingLevel, 0)

  return {
    totalAsyncFunctions: patterns.filter((p) => p.type === 'async-function').length,
    totalPromises: patterns.filter((p) => p.type === 'promise').length,
    totalCallbacks: patterns.filter((p) => p.type === 'callback').length,
    totalEventHandlers: patterns.filter((p) => p.type === 'event-handler').length,
    totalTimers: patterns.filter((p) => p.type === 'timer').length,
    totalGenerators: patterns.filter((p) => p.type === 'generator').length,
    antiPatternCount: antiPatterns.length,
    errorHandlingRate: patterns.length > 0 ? Math.round((withErrorHandling / patterns.length) * 100) : 100,
    averageNesting: patterns.length > 0 ? Math.round((totalNesting / patterns.length) * 10) / 10 : 0,
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on async analysis.
 *
 * @example
 * generateRecommendations(antiPatterns, stats)
 */
export function generateRecommendations(antiPatterns: AsyncAntiPattern[], stats: AsyncStats): string[] {
  const recs: string[] = []

  if (stats.errorHandlingRate < 50) {
    recs.push(`Only ${stats.errorHandlingRate}% of async patterns have error handling — add try/catch or .catch()`)
  }

  if (stats.antiPatternCount > 0) {
    recs.push(`Found ${stats.antiPatternCount} anti-pattern(s) — review and fix`)
  }

  const unhandled = antiPatterns.filter((a) => a.type === 'unhandled-promise')
  if (unhandled.length > 0) {
    recs.push(`${unhandled.length} unhandled promise(s) — add error handling to prevent silent failures`)
  }

  const callbackHell = antiPatterns.filter((a) => a.type === 'callback-hell')
  if (callbackHell.length > 0) {
    recs.push(`${callbackHell.length} callback hell instance(s) — refactor to async/await`)
  }

  const sequential = antiPatterns.filter((a) => a.type === 'sequential-parallelizable')
  if (sequential.length > 0) {
    recs.push(`${sequential.length} sequential await(s) that could be parallelized with Promise.all()`)
  }

  if (recs.length === 0) {
    recs.push('Async patterns look healthy — good error handling coverage')
  }

  return recs
}

// ─── buildThreadsResult ───────────────────────────────────────────────────────

/**
 * Build the complete threads analysis result.
 *
 * @example
 * buildThreadsResult(['a.ts'], ['async function foo() { await bar() }'])
 */
export function buildThreadsResult(
  files: string[],
  contents: string[],
  _options?: ThreadsOptions,
): ThreadsResult {
  const patterns: AsyncPattern[] = []
  const antiPatterns: AsyncAntiPattern[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''

    patterns.push(...findAsyncFunctions(content, file))
    patterns.push(...findPromises(content, file))
    patterns.push(...findCallbacks(content, file))
    patterns.push(...findEventHandlers(content, file))
    patterns.push(...findTimers(content, file))
    patterns.push(...findGenerators(content, file))

    antiPatterns.push(...detectUnhandledPromises(content, file))
    antiPatterns.push(...detectCallbackHell(content, file))
    antiPatterns.push(...detectNestedPromises(content, file))
    antiPatterns.push(...detectSequentialParallelizable(content, file))
    antiPatterns.push(...detectFloatingPromises(content, file))
    antiPatterns.push(...detectSyncInAsync(content, file))
  }

  const stats = computeAsyncStats(patterns, antiPatterns)
  const complexityDistribution: Record<string, number> = { simple: 0, moderate: 0, complex: 0 }
  for (const p of patterns) {
    complexityDistribution[p.complexity] = (complexityDistribution[p.complexity] ?? 0) + 1
  }

  const recommendations = generateRecommendations(antiPatterns, stats)

  return { patterns, antiPatterns, stats, complexityDistribution, recommendations }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function extractBody(lines: string[], startLine: number): string {
  let depth = 0
  let started = false
  const bodyLines: string[] = []

  for (let i = startLine; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { depth++; started = true }
      if (ch === '}') depth--
    }
    bodyLines.push(lines[i])
    if (started && depth <= 0) break
  }

  return bodyLines.join('\n')
}

function classifyComplexity(body: string): AsyncComplexity {
  const branchCount = (body.match(/\b(if|else|for|while|switch|catch|&&|\|\|)\b/g) || []).length
  if (branchCount > 10) return 'complex'
  if (branchCount > 4) return 'moderate'
  return 'simple'
}

function computeNesting(code: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of code) {
    if (ch === '{' || ch === '(') { depth++; maxDepth = Math.max(maxDepth, depth) }
    if (ch === '}' || ch === ')') depth--
  }
  return maxDepth
}

interface FuncRange { start: number; end: number; lineStart: number }

function findAsyncFunctionRanges(content: string): FuncRange[] {
  const ranges: FuncRange[] = []
  const lines = content.split('\n')
  let offset = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/async\s+(?:function|(\w+)\s*=\s*(?:async\s+)?)/.test(line) || /async\s+function\s/.test(line)) {
      const funcStart = offset
      let depth = 0
      let started = false
      let funcEnd = content.length

      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { depth++; started = true }
          if (ch === '}') depth--
        }
        if (started && depth <= 0) {
          funcEnd = offset + lines.slice(i, j + 1).join('\n').length
          break
        }
      }

      ranges.push({ start: funcStart, end: funcEnd, lineStart: i + 1 })
    }
    offset += line.length + 1
  }

  return ranges
}
