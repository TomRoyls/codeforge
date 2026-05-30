// ─── Types ────────────────────────────────────────────────────────────────────

export type FunctionType = 'orchestrator' | 'worker' | 'pipeline' | 'adapter' | 'hybrid'

export type PatternType =
  | 'sequential'
  | 'parallel'
  | 'conditional'
  | 'recursive'
  | 'event-driven'
  | 'middleware-chain'
  | 'pipeline'

export interface OrchestratorFunction {
  name: string
  file: string
  line: number
  type: FunctionType
  callsCount: number
  calledByCount: number
  orchestrates: string[]
  orchestratedBy: string[]
  coordinationPatterns: string[]
  complexity: number
  linesOfCode: number
  hasSideEffects: boolean
  isPure: boolean
}

export interface OrchestrationPattern {
  type: PatternType
  functions: string[]
  description: string
  file: string
  line: number
}

export interface OrchestrationLayer {
  name: string
  functions: string[]
  averageCalls: number
  averageCalledBy: number
  description: string
}

export interface OrchestratorStats {
  totalFunctions: number
  orchestrators: number
  workers: number
  pipelines: number
  pureFunctions: number
  sideEffectFunctions: number
  maxOrchestrationDepth: number
  averageCallsPerFunction: number
}

export interface OrchestratorResult {
  functions: OrchestratorFunction[]
  patterns: OrchestrationPattern[]
  layers: OrchestrationLayer[]
  stats: OrchestratorStats
  hotOrchestrators: OrchestratorFunction[]
  isolatedWorkers: OrchestratorFunction[]
  recommendations: string[]
}

export interface OrchestratorOptions {
  verbose?: boolean
}

// ─── Regex helpers ────────────────────────────────────────────────────────────

const CALL_EXPRESSION = /(?<!\w)(\w+)\s*\(/g
const IMPORT_LINE = /^\s*(?:import|export)\s/
const COMMENT_LINE = /^\s*(?:\/\/|\/\*|\*)/
const STRING_CONTENT = /'[^']*'|"[^"]*"|`[^`]*`/g

// ─── classifyFunction ─────────────────────────────────────────────────────────

/**
 * Classify a function based on its coordination characteristics.
 *
 * @example
 * classifyFunction(5, 2, false, 15)
 * // => 'orchestrator'
 */
export function classifyFunction(
  callsCount: number,
  calledByCount: number,
  hasSideEffects: boolean,
  linesOfCode: number,
): FunctionType {
  if (callsCount > 3 && linesOfCode < 30) return 'orchestrator'
  if ((callsCount === 0 || callsCount === 1) && calledByCount > 0) return 'worker'
  if (callsCount >= 2 && callsCount <= 3 && !hasSideEffects) return 'pipeline'
  if (callsCount === 1 && calledByCount > 0 && linesOfCode < 15) return 'adapter'
  return 'hybrid'
}

// ─── detectSideEffects ────────────────────────────────────────────────────────

const SIDE_EFFECT_PATTERNS = [
  /\bconsole\.\w+/,
  /\bprocess\.stdout/,
  /\bprocess\.stderr/,
  /\bfs\.\w+/,
  /\breadFile/,
  /\bwriteFile/,
  /\bmkdir/,
  /\brmdir/,
  /\bunlink/,
  /\bfetch\s*\(/,
  /\bhttp\.\w+/,
  /\bhttps\.\w+/,
  /\baxios\.\w+/,
  /\bXMLHttpRequest/,
  /\bWebSocket/,
  /\blocalStorage/,
  /\bsessionStorage/,
  /\bdocument\.\w+/,
  /\bwindow\.\w+/,
  /\bglobalThis\./,
  /\bprocess\.env/,
  /\bMath\.random/,
  /\bDate\.now/,
  /\bnew Date\b/,
  /\.push\(/,
  /\.splice\(/,
  /\.sort\(/,
  /\.reverse\(/,
  /\bdelete\s/,
  /\bthrow\s/,
  /\.innerHTML/,
  /\.textContent/,
]

/**
 * Detect whether content contains side-effect patterns.
 *
 * @example
 * detectSideEffects('console.log("hi")')
 * // => true
 */
export function detectSideEffects(content: string): boolean {
  return SIDE_EFFECT_PATTERNS.some((p) => p.test(content))
}

// ─── detectPurity ─────────────────────────────────────────────────────────────

/**
 * Determine if a function is pure (no side effects, output depends only on inputs).
 *
 * @example
 * detectPurity(true)
 * // => false
 */
export function detectPurity(hasSideEffects: boolean): boolean {
  return !hasSideEffects
}

// ─── extractFunctions ─────────────────────────────────────────────────────────

export interface RawFunction {
  name: string
  file: string
  line: number
  body: string
  linesOfCode: number
}

/**
 * Extract function declarations from source content.
 *
 * @example
 * extractFunctions('function hello() { return 1 }', 'a.ts')
 * // => [{ name: 'hello', file: 'a.ts', line: 1, ... }]
 */
export function extractFunctions(content: string, filePath: string): RawFunction[] {
  const results: RawFunction[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (COMMENT_LINE.test(line) || IMPORT_LINE.test(line)) continue

    const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function)/)
    if (!funcMatch) continue

    const name = funcMatch[1] ?? funcMatch[2] ?? funcMatch[3]
    if (!name) continue

    let bodyEnd = i + 1
    let braceDepth = 0
    let started = false
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j] ?? '') {
        if (ch === '{') { braceDepth++; started = true }
        if (ch === '}') braceDepth--
      }
      if (started && braceDepth <= 0) {
        bodyEnd = j + 1
        break
      }
    }

    const body = lines.slice(i, bodyEnd).join('\n')
    results.push({
      name,
      file: filePath,
      line: i + 1,
      body,
      linesOfCode: bodyEnd - i,
    })
  }

  return results
}

// ─── extractCalls ─────────────────────────────────────────────────────────────

/**
 * Extract function call names from function body.
 *
 * @example
 * extractCalls('const x = foo(bar())')
 * // => ['foo', 'bar']
 */
export function extractCalls(body: string): string[] {
  const calls = new Set<string>()
  const cleaned = body.replace(STRING_CONTENT, '""')
  const keywords = new Set([
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'return',
    'try', 'catch', 'finally', 'throw', 'new', 'typeof', 'instanceof',
    'void', 'delete', 'in', 'of', 'async', 'await', 'yield', 'import',
    'export', 'const', 'let', 'var', 'function', 'class', 'extends',
    'super', 'this', 'true', 'false', 'null', 'undefined', 'console',
    'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
    'Promise', 'Error', 'Map', 'Set', 'Symbol', 'RegExp', 'Date',
    'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'NaN', 'Infinity',
  ])

  let match: RegExpExecArray | null
  const regex = new RegExp(CALL_EXPRESSION.source, 'g')
  while ((match = regex.exec(cleaned)) !== null) {
    const name = match[1]
    if (name && !keywords.has(name) && !/^[A-Z]/.test(name)) {
      calls.add(name)
    }
  }

  return [...calls]
}

// ─── computeComplexity ────────────────────────────────────────────────────────

const COMPLEXITY_PATTERNS = [
  /\bif\b/g,
  /\belse\b/g,
  /\bfor\b/g,
  /\bwhile\b/g,
  /\bswitch\b/g,
  /\bcase\b/g,
  /\bcatch\b/g,
  /\?\?/g,
  /\?\./g,
  /&&/g,
  /\|\|/g,
  /\?[^.?]/g,
]

/**
 * Compute cyclomatic complexity of function body.
 *
 * @example
 * computeComplexity('if (x) { return 1 }')
 * // => 2
 */
export function computeComplexity(body: string): number {
  let complexity = 1
  for (const pattern of COMPLEXITY_PATTERNS) {
    const matches = body.match(pattern)
    if (matches) complexity += matches.length
  }
  return complexity
}

// ─── detectOrchestrationPatterns ──────────────────────────────────────────────

/**
 * Detect orchestration patterns in source content.
 *
 * @example
 * detectOrchestrationPatterns('Promise.all([a(), b()])', 'a.ts')
 * // => [{ type: 'parallel', ... }]
 */
export function detectOrchestrationPatterns(content: string, filePath: string): OrchestrationPattern[] {
  const patterns: OrchestrationPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (COMMENT_LINE.test(line) || IMPORT_LINE.test(line)) continue

    if (/Promise\.all\s*\(/.test(line)) {
      const funcs = extractCallsFromPromiseAll(line)
      patterns.push({
        type: 'parallel',
        functions: funcs,
        description: `Parallel execution: ${funcs.join(', ')}`,
        file: filePath,
        line: i + 1,
      })
    }

    if (/\.then\s*\(/.test(line) || /\.pipe\s*\(/.test(line) || /^\s*\w+\s*\(\s*\)\s*\.\s*\w+\s*\(/.test(line)) {
      const funcs = extractCalls(line)
      if (funcs.length >= 2) {
        patterns.push({
          type: 'pipeline',
          functions: funcs,
          description: `Pipeline chain: ${funcs.join(' → ')}`,
          file: filePath,
          line: i + 1,
        })
      }
    }

    if (/\bif\s*\(/.test(line) && /\belse\b/.test(lines[i + 1] ?? '')) {
      const combinedLine = line + ' ' + (lines[i + 1] ?? '')
      const funcs = extractCalls(combinedLine)
      if (funcs.length >= 2) {
        patterns.push({
          type: 'conditional',
          functions: funcs,
          description: `Conditional branching: ${funcs.join(', ')}`,
          file: filePath,
          line: i + 1,
        })
      }
    }

    if (/\.on\s*\(\s*['"]/.test(line) || /addEventListener\s*\(/.test(line)) {
      const funcs = extractCalls(line)
      patterns.push({
        type: 'event-driven',
        functions: funcs,
        description: `Event-driven: ${funcs.join(', ')}`,
        file: filePath,
        line: i + 1,
      })
    }

    if (/\bnext\s*\(\s*\)/.test(line)) {
      patterns.push({
        type: 'middleware-chain',
        functions: ['next'],
        description: 'Middleware chain pattern detected',
        file: filePath,
        line: i + 1,
      })
    }
  }

  const rawFns = extractFunctions(content, filePath)
  for (const fn of rawFns) {
    if (fn.body.includes(fn.name + '(') || fn.body.includes(fn.name + ' (')) {
      const callCount = (fn.body.match(new RegExp(`\\b${escapeRegex(fn.name)}\\s*\\(`, 'g')) ?? []).length
      if (callCount > 1) {
        patterns.push({
          type: 'recursive',
          functions: [fn.name],
          description: `Recursive function: ${fn.name}`,
          file: filePath,
          line: fn.line,
        })
      }
    }
  }

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i]
    const nextLine = lines[i + 1]
    if (!currentLine || !nextLine) continue
    const stripped = currentLine.trim()
    const nextStripped = nextLine.trim()
    if (
      stripped && nextStripped &&
      !COMMENT_LINE.test(stripped) && !COMMENT_LINE.test(nextStripped) &&
      !IMPORT_LINE.test(stripped) && !IMPORT_LINE.test(nextStripped)
    ) {
      const calls1 = extractCalls(stripped)
      const calls2 = extractCalls(nextStripped)
      if (calls1.length > 0 && calls2.length > 0) {
        patterns.push({
          type: 'sequential',
          functions: [...calls1, ...calls2],
          description: `Sequential: ${[...calls1, ...calls2].join(', ')}`,
          file: filePath,
          line: i + 1,
        })
      }
    }
  }

  return patterns
}

function extractCallsFromPromiseAll(line: string): string[] {
  const match = line.match(/Promise\.all\s*\(\s*\[([^\]]*)\]\s*\)/)
  if (!match || match[1] === undefined) return []
  return extractCalls(match[1])
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── computeOrchestrationLayers ───────────────────────────────────────────────

/**
 * Group functions by coordination level (entry → high → mid → worker).
 *
 * @example
 * computeOrchestrationLayers(fns)
 * // => [{ name: 'Entry Points', ... }, ...]
 */
export function computeOrchestrationLayers(functions: OrchestratorFunction[]): OrchestrationLayer[] {
  const layer0 = functions.filter((f) => f.orchestratedBy.length === 0)
  const layer1 = functions.filter((f) => f.type === 'orchestrator' && f.orchestratedBy.length > 0)
  const layer2 = functions.filter((f) => f.type === 'hybrid' || f.type === 'pipeline')
  const layer3 = functions.filter((f) => f.type === 'worker' || f.type === 'adapter')

  const makeLayer = (name: string, fns: OrchestratorFunction[], desc: string): OrchestrationLayer => ({
    name,
    functions: fns.map((f) => f.name),
    averageCalls: fns.length > 0 ? fns.reduce((s, f) => s + f.callsCount, 0) / fns.length : 0,
    averageCalledBy: fns.length > 0 ? fns.reduce((s, f) => s + f.calledByCount, 0) / fns.length : 0,
    description: desc,
  })

  return [
    makeLayer('Entry Points', layer0, 'Functions not called by any other function'),
    makeLayer('High-level Orchestrators', layer1, 'Orchestrator functions that coordinate others'),
    makeLayer('Mid-level Coordinators', layer2, 'Hybrid and pipeline functions'),
    makeLayer('Low-level Workers', layer3, 'Worker and adapter functions doing actual work'),
  ].filter((l) => l.functions.length > 0)
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on orchestration analysis.
 *
 * @example
 * generateRecommendations(hotOrchestrators, isolatedWorkers, stats)
 * // => ['Consider splitting orchestrator "runAll"...']
 */
export function generateRecommendations(
  hotOrchestrators: OrchestratorFunction[],
  isolatedWorkers: OrchestratorFunction[],
  stats: OrchestratorStats,
): string[] {
  const recs: string[] = []

  if (hotOrchestrators.length > 0) {
    for (const ho of hotOrchestrators) {
      recs.push(`Consider splitting orchestrator "${ho.name}" (${ho.callsCount} calls, complexity ${ho.complexity})`)
    }
  }

  if (isolatedWorkers.length > 0) {
    recs.push(`${isolatedWorkers.length} isolated worker(s) never called: ${isolatedWorkers.map((w) => w.name).join(', ')}`)
  }

  if (stats.averageCallsPerFunction < 1) {
    recs.push('Low average calls per function — functions may be too isolated')
  }

  if (stats.sideEffectFunctions > stats.totalFunctions * 0.5) {
    recs.push(`${Math.round(stats.sideEffectFunctions / stats.totalFunctions * 100)}% of functions have side effects — consider isolating side effects`)
  }

  if (stats.pureFunctions === 0 && stats.totalFunctions > 0) {
    recs.push('No pure functions detected — consider extracting pure logic for testability')
  }

  if (stats.maxOrchestrationDepth > 5) {
    recs.push(`Max orchestration depth is ${stats.maxOrchestrationDepth} — consider flattening call hierarchy`)
  }

  if (recs.length === 0) {
    recs.push('Orchestration looks healthy — good balance of coordinators and workers')
  }

  return recs
}

// ─── buildOrchestratorResult ──────────────────────────────────────────────────

/**
 * Build the complete orchestration analysis result.
 *
 * @example
 * buildOrchestratorResult(['a.ts'], ['function run() { foo(); bar(); baz(); }'], {})
 */
export function buildOrchestratorResult(
  filePaths: string[],
  contents: string[],
  _options?: OrchestratorOptions,
): OrchestratorResult {
  const callGraph = new Map<string, Set<string>>()
  const reverseGraph = new Map<string, Set<string>>()
  const allRaw = new Map<string, RawFunction>()

  for (let fi = 0; fi < filePaths.length; fi++) {
    const content = contents[fi] ?? ''
    const filePath = filePaths[fi] ?? ''
    const rawFns = extractFunctions(content, filePath)

    for (const raw of rawFns) {
      const key = `${filePath}:${raw.name}`
      allRaw.set(key, raw)
      const calls = extractCalls(raw.body).filter((c) => c !== raw.name)
      callGraph.set(key, new Set(calls))

      for (const call of calls) {
        const calleeKey = `${filePath}:${call}`
        const reverseSet = reverseGraph.get(calleeKey)
        if (!reverseSet) {
          reverseGraph.set(calleeKey, new Set([key]))
        } else {
          reverseSet.add(key)
        }
      }
    }
  }

  const functions: OrchestratorFunction[] = []

  for (const [key, raw] of allRaw) {
    const calls = callGraph.get(key) ?? new Set()
    const calledBy = reverseGraph.get(key) ?? new Set()
    const hasSideEffects = detectSideEffects(raw.body)
    const isPure = detectPurity(hasSideEffects)
    const complexity = computeComplexity(raw.body)
    const callsCount = calls.size
    const calledByCount = calledBy.size

    const type = classifyFunction(callsCount, calledByCount, hasSideEffects, raw.linesOfCode)

    const coordinationPatterns: string[] = []
    const filePatterns = detectOrchestrationPatterns(raw.body, raw.file)
    const uniqueTypes = new Set(filePatterns.map((p) => p.type))
    for (const pt of uniqueTypes) coordinationPatterns.push(pt)

    functions.push({
      name: raw.name,
      file: raw.file,
      line: raw.line,
      type,
      callsCount,
      calledByCount,
      orchestrates: [...calls],
      orchestratedBy: [...calledBy].map((k) => k.split(':').pop() ?? ''),
      coordinationPatterns,
      complexity,
      linesOfCode: raw.linesOfCode,
      hasSideEffects,
      isPure,
    })
  }

  const patterns: OrchestrationPattern[] = []
  for (let fi = 0; fi < filePaths.length; fi++) {
    patterns.push(...detectOrchestrationPatterns(contents[fi] ?? '', filePaths[fi] ?? ''))
  }

  const layers = computeOrchestrationLayers(functions)

  const orchestratorCount = functions.filter((f) => f.type === 'orchestrator').length
  const workerCount = functions.filter((f) => f.type === 'worker').length
  const pipelineCount = functions.filter((f) => f.type === 'pipeline').length
  const pureCount = functions.filter((f) => f.isPure).length
  const sideEffectCount = functions.filter((f) => f.hasSideEffects).length

  const maxDepth = computeMaxDepth(callGraph, new Set(allRaw.keys()))
  const avgCalls = functions.length > 0
    ? functions.reduce((s, f) => s + f.callsCount, 0) / functions.length
    : 0

  const stats: OrchestratorStats = {
    totalFunctions: functions.length,
    orchestrators: orchestratorCount,
    workers: workerCount,
    pipelines: pipelineCount,
    pureFunctions: pureCount,
    sideEffectFunctions: sideEffectCount,
    maxOrchestrationDepth: maxDepth,
    averageCallsPerFunction: Math.round(avgCalls * 10) / 10,
  }

  const hotOrchestrators = functions
    .filter((f) => f.type === 'orchestrator' && f.callsCount > 5)
    .sort((a, b) => b.callsCount - a.callsCount)

  const isolatedWorkers = functions
    .filter((f) => f.calledByCount === 0 && f.type !== 'orchestrator')

  const recommendations = generateRecommendations(hotOrchestrators, isolatedWorkers, stats)

  return {
    functions,
    patterns,
    layers,
    stats,
    hotOrchestrators,
    isolatedWorkers,
    recommendations,
  }
}

function computeMaxDepth(callGraph: Map<string, Set<string>>, allKeys: Set<string>): number {
  let maxDepth = 0
  const visited = new Set<string>()

  function dfs(key: string, depth: number) {
    if (visited.has(key)) return
    visited.add(key)
    if (depth > maxDepth) maxDepth = depth
    const calls = callGraph.get(key)
    if (calls) {
      for (const call of calls) {
        const calleeKey = [...allKeys].find((k) => k.endsWith(':' + call))
        if (calleeKey) dfs(calleeKey, depth + 1)
      }
    }
  }

  for (const key of allKeys) {
    visited.clear()
    dfs(key, 0)
  }

  return maxDepth
}
