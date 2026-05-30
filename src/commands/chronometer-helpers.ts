// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemporalPattern {
  type: 'sequential' | 'parallel' | 'async-chain' | 'callback-pyramid' | 'promise-race' | 'timeout' | 'interval' | 'event-driven' | 'synchronous-block'
  file: string
  location: number
  complexity: number
  risk: 'safe' | 'caution' | 'risky' | 'dangerous'
  description: string
}

export interface TimeDependency {
  from: string
  to: string
  type: 'data-flow' | 'state-mutation' | 'initialization' | 'resource-access'
  strength: 'loose' | 'moderate' | 'tight' | 'critical'
  isImplicit: boolean
  description: string
}

export interface TemporalFile {
  file: string
  patterns: TemporalPattern[]
  dependencies: TimeDependency[]
  asyncScore: number
  syncBlocks: number
  asyncBlocks: number
  timeoutHandling: number
  errorRecovery: number
  temporalComplexity: number
  classification: 'clockwork' | 'flowing' | 'erratic' | 'frozen' | 'racing'
}

export interface TemporalAnomaly {
  type: 'race-condition' | 'deadlock-risk' | 'time-bomb' | 'temporal-coupling' | 'callback-hell' | 'unhandled-timeout' | 'stale-state' | 'zombie-process'
  file: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
}

export interface ChronometerStats {
  totalPatterns: number
  sequentialPatterns: number
  parallelPatterns: number
  asyncChains: number
  callbackPyramids: number
  totalDependencies: number
  criticalDependencies: number
  implicitDependencies: number
  totalAnomalies: number
  raceConditions: number
  deadlockRisks: number
  callbackHells: number
  avgAsyncScore: number
  avgTimeoutHandling: number
  avgTemporalComplexity: number
  clockworkFiles: number
  erraticFiles: number
  racingFiles: number
  temporalHealth: 'synchronized' | 'flowing' | 'turbulent' | 'chaotic' | 'frozen'
  chronometerScore: number
}

export interface ChronometerResult {
  files: TemporalFile[]
  patterns: TemporalPattern[]
  anomalies: TemporalAnomaly[]
  dependencies: TimeDependency[]
  stats: ChronometerStats
  recommendations: string[]
}

// ─── Temporal Pattern Detection ───────────────────────────────────────────────

/**
 * Detect temporal patterns in source content
 * @example
 * detectTemporalPatterns('await foo()', 'a.ts') // [{ type: 'sequential', ... }]
 */
export function detectTemporalPatterns(content: string, filePath: string): TemporalPattern[] {
  const patterns: TemporalPattern[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    const lineNum = i + 1

    if (/await\s+\w+/.test(line) && !/Promise\.(all|allSettled|race|any)/.test(line)) {
      patterns.push({
        type: 'sequential',
        file: filePath,
        location: lineNum,
        complexity: 20,
        risk: 'safe',
        description: `Sequential await at line ${lineNum}`,
      })
    }

    if (/Promise\.(all|allSettled)\(/.test(line)) {
      patterns.push({
        type: 'parallel',
        file: filePath,
        location: lineNum,
        complexity: 40,
        risk: 'safe',
        description: `Parallel execution with Promise.${/Promise\.allSettled/.test(line) ? 'allSettled' : 'all'} at line ${lineNum}`,
      })
    }

    if (/Promise\.(race|any)\(/.test(line)) {
      patterns.push({
        type: 'promise-race',
        file: filePath,
        location: lineNum,
        complexity: 50,
        risk: 'caution',
        description: `Promise race/any pattern at line ${lineNum}`,
      })
    }

    if (/setTimeout\s*\(/.test(line)) {
      patterns.push({
        type: 'timeout',
        file: filePath,
        location: lineNum,
        complexity: 30,
        risk: 'caution',
        description: `setTimeout usage at line ${lineNum}`,
      })
    }

    if (/setInterval\s*\(/.test(line)) {
      patterns.push({
        type: 'interval',
        file: filePath,
        location: lineNum,
        complexity: 35,
        risk: 'risky',
        description: `setInterval usage at line ${lineNum}`,
      })
    }

    if (/\.on\s*\(|\.addEventListener\s*\(|\.emit\s*\(/.test(line)) {
      patterns.push({
        type: 'event-driven',
        file: filePath,
        location: lineNum,
        complexity: 25,
        risk: 'safe',
        description: `Event-driven pattern at line ${lineNum}`,
      })
    }

    if (/readFileSync|writeFileSync|existsSync|statSync|readdirSync/.test(line)) {
      patterns.push({
        type: 'synchronous-block',
        file: filePath,
        location: lineNum,
        complexity: 15,
        risk: 'risky',
        description: `Synchronous blocking call at line ${lineNum}`,
      })
    }

    if (/while\s*\(.+\)\s*\{/.test(line) && !/await/.test(line)) {
      const block = lines.slice(i, Math.min(i + 20, lines.length)).join('\n')
      if (!/await|break/.test(block.slice(0, 500))) {
        patterns.push({
          type: 'synchronous-block',
          file: filePath,
          location: lineNum,
          complexity: 30,
          risk: 'caution',
          description: `Potentially blocking while loop at line ${lineNum}`,
        })
      }
    }
  }

  let chainDepth = 0
  for (let i = 0; i < lines.length; i++) {
    const chainLine = lines[i]
    if (!chainLine) continue
    if (/await\s+/.test(chainLine)) chainDepth++
    if (chainDepth >= 3) {
      patterns.push({
        type: 'async-chain',
        file: filePath,
        location: i + 1,
        complexity: 45,
        risk: 'caution',
        description: `Async chain of ${chainDepth}+ awaits starting at line ${i + 1 - chainDepth + 1}`,
      })
      chainDepth = 0
    }
    if (!/await\s+/.test(chainLine) && !/^\s*$/.test(chainLine) && chainDepth > 0) {
      chainDepth = 0
    }
  }

  const callbackDepth = measureCallbackDepth(content)
  if (callbackDepth >= 3) {
    patterns.push({
      type: 'callback-pyramid',
      file: filePath,
      location: 1,
      complexity: 60 + callbackDepth * 5,
      risk: callbackDepth >= 5 ? 'dangerous' : 'risky',
      description: `Callback pyramid of depth ${callbackDepth}`,
    })
  }

  return patterns
}

/**
 * Measure callback nesting depth
 * @example
 * measureCallbackDepth('a(() => { b(() => { c() }) })') // 2
 */
export function measureCallbackDepth(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      depth++
      if (depth > maxDepth) maxDepth = depth
    }
    if (content[i] === '}') {
      depth = Math.max(0, depth - 1)
    }
  }
  const callbacks = (content.match(/\(.*?\)\s*=>\s*\{|function\s*\(.*?\)\s*\{/g) || []).length
  return maxDepth > 4 && callbacks >= 3 ? Math.min(callbacks, maxDepth) : 0
}

// ─── Time Dependency Detection ────────────────────────────────────────────────

/**
 * Detect time dependencies between code elements
 * @example
 * detectTimeDependencies('const x = await a(); const y = await b(x)', 'f.ts') // TimeDependency[]
 */
export function detectTimeDependencies(content: string, filePath: string): TimeDependency[] {
  const deps: TimeDependency[] = []
  const lines = content.split('\n')

  const varAssigns = new Map<string, number>()
  for (let i = 0; i < lines.length; i++) {
    const declLine = lines[i]
    if (!declLine) continue
    const match = declLine.match(/(?:const|let|var)\s+(\w+)\s*=/)
    if (match?.[1]) varAssigns.set(match[1], i + 1)
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue
    for (const [varName, defLine] of varAssigns) {
      if (defLine >= i + 1) continue
      const re = new RegExp(`\\b${varName}\\b`)
      if (re.test(line)) {
        const isDataFlow = /=.*\b${varName}\b/.test(line)
        const isInit = defLine < 5 && i > 5
        let depType: TimeDependency['type'] = 'data-flow'
        if (isInit) depType = 'initialization'
        else if (line.includes('await')) depType = 'data-flow'
        else if (/\.push|\.pop|\.splice|\.shift|\.unshift|\.sort|\.reverse/.test(line)) depType = 'state-mutation'
        else if (isDataFlow) depType = 'data-flow'

        const isImplicit = !/\/\/\s*(?:depends|requires|needs|must|after|before)/.test(line)
        const strength: TimeDependency['strength'] = depType === 'initialization' ? 'critical' : depType === 'state-mutation' ? 'tight' : depType === 'data-flow' ? 'moderate' : 'loose'

        deps.push({
          from: varName,
          to: `${filePath}:L${i + 1}`,
          type: depType,
          strength,
          isImplicit,
          description: `${varName} (L${defLine}) used at L${i + 1} as ${depType}`,
        })
      }
    }
  }

  if (/\.lock\s*\(|\.acquire\s*\(|mutex|semaphore/.test(content)) {
    deps.push({
      from: 'lock-acquire',
      to: 'lock-release',
      type: 'resource-access',
      strength: 'critical',
      isImplicit: !/\/\/\s*(?:depends|requires)/.test(content),
      description: 'Lock/acquire pattern requires ordered release',
    })
  }

  return deps
}

// ─── Temporal Anomaly Detection ───────────────────────────────────────────────

/**
 * Detect temporal anomalies in code
 * @example
 * detectTemporalAnomalies(patterns, 'sharedState++') // TemporalAnomaly[]
 */
export function detectTemporalAnomalies(patterns: TemporalPattern[], content: string): TemporalAnomaly[] {
  const anomalies: TemporalAnomaly[] = []
  const filePath = patterns[0]?.file ?? 'unknown'

  const hasAsync = patterns.some(p => p.type === 'sequential' || p.type === 'async-chain')
  const hasMutableState = /\b(let|var)\s+\w+/.test(content) && /\w+\s*[\+\-\*\/]?=/.test(content)
  if (hasAsync && hasMutableState) {
    anomalies.push({
      type: 'race-condition',
      file: filePath,
      severity: 'medium',
      description: 'Async code with mutable state may have race conditions',
      mitigation: 'Use immutable patterns or proper synchronization',
    })
  }

  const hasCircularAwait = detectCircularAwait(content)
  if (hasCircularAwait) {
    anomalies.push({
      type: 'deadlock-risk',
      file: filePath,
      severity: 'high',
      description: 'Potential circular await dependency detected',
      mitigation: 'Break circular dependencies by refactoring module structure',
    })
  }

  if (/new Date\(\)|Date\.now\(\)|\.getTime\(\)/.test(content)) {
    const hasConditionalTime = /if.*Date|switch.*Date|Date.*if|getHours|getMinutes|getDay/.test(content)
    if (hasConditionalTime) {
      anomalies.push({
        type: 'time-bomb',
        file: filePath,
        severity: 'low',
        description: 'Time-dependent logic that may break at specific times',
        mitigation: 'Use configurable time sources and test with different times',
      })
    }
  }

  const callbackPyramids = patterns.filter(p => p.type === 'callback-pyramid')
  if (callbackPyramids.length > 0) {
    for (const cp of callbackPyramids) {
      anomalies.push({
        type: 'callback-hell',
        file: filePath,
        severity: cp.complexity >= 70 ? 'high' : 'medium',
        description: `Callback pyramid with complexity ${cp.complexity}`,
        mitigation: 'Convert to async/await or use promise chaining',
      })
    }
  }

  const asyncPatterns = patterns.filter(p => p.type === 'sequential' || p.type === 'async-chain')
  const timeouts = patterns.filter(p => p.type === 'timeout')
  if (asyncPatterns.length > 2 && timeouts.length === 0) {
    anomalies.push({
      type: 'unhandled-timeout',
      file: filePath,
      severity: 'medium',
      description: `${asyncPatterns.length} async operations without timeout guards`,
      mitigation: 'Add timeout wrappers around async operations',
    })
  }

  if (/setInterval/.test(content) && !/clearInterval/.test(content)) {
    anomalies.push({
      type: 'zombie-process',
      file: filePath,
      severity: 'high',
      description: 'setInterval without corresponding clearInterval',
      mitigation: 'Store interval ID and call clearInterval on cleanup',
    })
  }

  if (/setTimeout/.test(content) && !/clearTimeout/.test(content) && !/await/.test(content)) {
    anomalies.push({
      type: 'zombie-process',
      file: filePath,
      severity: 'low',
      description: 'setTimeout without clearTimeout may cause stale execution',
      mitigation: 'Store timeout ID and clear on component unmount',
    })
  }

  if (/(?:let|var)\s+\w+\s*=/.test(content) && /await/.test(content)) {
    const lets = (content.match(/\b(?:let|var)\s+\w+/g) || []).length
    const awaits = (content.match(/\bawait\b/g) || []).length
    if (awaits >= 2 && lets >= 2) {
      anomalies.push({
        type: 'stale-state',
        file: filePath,
        severity: 'low',
        description: 'Mutable state may become stale across async boundaries',
        mitigation: 'Re-fetch state after await or use reactive patterns',
      })
    }
  }

  const implicitDeps = patterns.some(p => p.type === 'async-chain' || p.type === 'sequential')
  const hasOrdering = /\bthen\b/.test(content) && !/\/\//.test(content.split('.then')[0]?.slice(-30) || '')
  if (implicitDeps && hasOrdering) {
    anomalies.push({
      type: 'temporal-coupling',
      file: filePath,
      severity: 'low',
      description: 'Implicit ordering via promise chains creates temporal coupling',
      mitigation: 'Make dependencies explicit with named functions or dependency injection',
    })
  }

  return anomalies
}

/**
 * Detect circular await patterns
 * @example
 * detectCircularAwait('import { a } from "./b"; await a()') // false
 */
export function detectCircularAwait(content: string): boolean {
  const imports = Array.from(content.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g)).map(m => m[1])
  const exports = Array.from(content.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g)).map(m => m[1])
  const awaits = Array.from(content.matchAll(/await\s+(\w+)\(/g)).map(m => m[1])
  return imports.length >= 2 && exports.length >= 2 && awaits.length >= 2 && imports.length === exports.length
}

// ─── Score Computation ─────────────────────────────────────────────────────────

/**
 * Compute async quality score (0-100)
 * @example
 * computeAsyncScore(patterns, 'await foo()') // 70
 */
export function computeAsyncScore(patterns: TemporalPattern[], content: string): number {
  let score = 50

  const hasAsyncAwait = /async\s+/.test(content) && /await\s+/.test(content)
  if (hasAsyncAwait) score += 15

  const hasPromiseAll = /Promise\.(all|allSettled)/.test(content)
  if (hasPromiseAll) score += 10

  const syncBlocks = patterns.filter(p => p.type === 'synchronous-block')
  score -= syncBlocks.length * 10

  const callbackPyramids = patterns.filter(p => p.type === 'callback-pyramid')
  score -= callbackPyramids.length * 8

  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  if (hasTryCatch) score += 10

  if (/AbortController/.test(content)) score += 5

  if (/\.finally\s*\(/.test(content)) score += 5

  return Math.max(0, Math.min(100, score))
}

/**
 * Compute timeout handling score (0-100)
 * @example
 * computeTimeoutHandling('setTimeout(fn, 1000)') // 30
 */
export function computeTimeoutHandling(content: string): number {
  let score = 30

  const hasTimeout = /setTimeout|AbortController|timeout/.test(content)
  if (hasTimeout) score += 20

  if (/clearTimeout/.test(content)) score += 15
  if (/clearInterval/.test(content)) score += 15

  if (/AbortController/.test(content)) score += 10

  if (/AbortSignal/.test(content)) score += 5

  if (/signal\s*[:=]/.test(content)) score += 5

  return Math.max(0, Math.min(100, score))
}

/**
 * Compute temporal complexity score (0-100)
 * @example
 * computeTemporalComplexity(patterns, deps) // 35
 */
export function computeTemporalComplexity(patterns: TemporalPattern[], dependencies: TimeDependency[]): number {
  if (patterns.length === 0) return 0
  const avgComplexity = patterns.reduce((s, p) => s + p.complexity, 0) / patterns.length
  const depFactor = Math.min(30, dependencies.length * 5)
  const criticalFactor = dependencies.filter(d => d.strength === 'critical').length * 10
  return Math.min(100, Math.round(avgComplexity + depFactor + criticalFactor))
}

/**
 * Compute error recovery score (0-100)
 * @example
 * computeErrorRecovery('try { await foo() } catch(e) {}') // 60
 */
export function computeErrorRecovery(content: string): number {
  let score = 20

  if (/try\s*\{/.test(content)) score += 20
  if (/catch\s*\(/.test(content)) score += 15
  if (/\.catch\s*\(/.test(content)) score += 10
  if (/finally\s*\{/.test(content)) score += 10
  if (/throw new Error/.test(content)) score += 10
  if (/retry|withRetry/.test(content)) score += 10
  if (/on\(['"]error['"]/.test(content)) score += 5

  return Math.max(0, Math.min(100, score))
}

// ─── Classification ───────────────────────────────────────────────────────────

/**
 * Classify a temporal file based on its metrics
 * @example
 * classifyTemporalFile(80, 20, []) // 'clockwork'
 */
export function classifyTemporalFile(
  asyncScore: number,
  complexity: number,
  anomalies: TemporalAnomaly[],
): TemporalFile['classification'] {
  const hasRaceCondition = anomalies.some(a => a.type === 'race-condition' && a.severity === 'high')
  const hasDeadlock = anomalies.some(a => a.type === 'deadlock-risk')
  const criticalAnomalies = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical')

  if (hasRaceCondition || hasDeadlock) return 'racing'
  if (criticalAnomalies.length >= 2) return 'erratic'
  if (asyncScore >= 70 && complexity <= 30 && anomalies.length === 0) return 'clockwork'
  if (asyncScore >= 50 && complexity <= 50) return 'flowing'
  if (asyncScore < 30 && complexity < 20) return 'frozen'
  if (complexity >= 60 || anomalies.length >= 3) return 'erratic'
  return 'flowing'
}

/**
 * Compute chronometer score (0-100)
 * @example
 * computeChronometerScore(files, patterns, anomalies) // 75
 */
export function computeChronometerScore(
  files: TemporalFile[],
  patterns: TemporalPattern[],
  anomalies: TemporalAnomaly[],
): number {
  if (files.length === 0) return 100

  const avgAsync = files.reduce((s, f) => s + f.asyncScore, 0) / files.length
  const avgTimeout = files.reduce((s, f) => s + f.timeoutHandling, 0) / files.length
  const avgComplexity = files.reduce((s, f) => s + f.temporalComplexity, 0) / files.length
  const avgError = files.reduce((s, f) => s + f.errorRecovery, 0) / files.length

  const syncRatio = patterns.length > 0
    ? patterns.filter(p => p.type === 'synchronous-block').length / patterns.length
    : 0

  const anomalyPenalty = Math.min(30, anomalies.length * 5)
  const criticalPenalty = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical').length * 10
  const clockworkBonus = files.filter(f => f.classification === 'clockwork').length * 5

  const raw = avgAsync * 0.25 + avgTimeout * 0.2 + (100 - avgComplexity) * 0.2 + avgError * 0.15
    + (1 - syncRatio) * 100 * 0.1 + clockworkBonus - anomalyPenalty - criticalPenalty

  return Math.max(0, Math.min(100, Math.round(raw)))
}

/**
 * Classify temporal health
 * @example
 * classifyTemporalHealth(90, []) // 'synchronized'
 */
export function classifyTemporalHealth(
  score: number,
  anomalies: TemporalAnomaly[],
): ChronometerStats['temporalHealth'] {
  const criticals = anomalies.filter(a => a.severity === 'high' || a.severity === 'critical')
  if (criticals.length >= 3) return 'chaotic'
  if (score >= 75) return 'synchronized'
  if (score >= 55) return 'flowing'
  if (score >= 35) return 'turbulent'
  if (score < 20) return 'frozen'
  return 'turbulent'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate temporal improvement recommendations
 * @example
 * generateRecommendations(files, patterns, anomalies, stats) // ['Add timeout guards...']
 */
export function generateRecommendations(
  files: TemporalFile[],
  patterns: TemporalPattern[],
  anomalies: TemporalAnomaly[],
  stats: ChronometerStats,
): string[] {
  const recs: string[] = []

  const raceConds = anomalies.filter(a => a.type === 'race-condition')
  if (raceConds.length > 0) {
    recs.push(`Address ${raceConds.length} race condition(s) — add proper synchronization or use immutable state`)
  }

  const callbackHells = anomalies.filter(a => a.type === 'callback-hell')
  if (callbackHells.length > 0) {
    recs.push(`Convert ${callbackHells.length} callback pyramid(s) to async/await for better readability`)
  }

  const unhandledTimeouts = anomalies.filter(a => a.type === 'unhandled-timeout')
  if (unhandledTimeouts.length > 0) {
    recs.push(`Add timeout guards to ${unhandledTimeouts.length} async operation(s) using AbortController`)
  }

  const zombies = anomalies.filter(a => a.type === 'zombie-process')
  if (zombies.length > 0) {
    recs.push(`Clean up ${zombies.length} zombie timer(s) — add clearTimeout/clearInterval on cleanup`)
  }

  const tempCoupling = anomalies.filter(a => a.type === 'temporal-coupling')
  if (tempCoupling.length > 0) {
    recs.push(`Make ${tempCoupling.length} implicit temporal dependencies explicit`)
  }

  if (stats.avgAsyncScore < 40) {
    recs.push('Low async quality — consider adopting modern async/await patterns')
  }

  if (stats.avgTimeoutHandling < 30) {
    recs.push('Add timeout and cancellation support to async operations')
  }

  const syncBlocks = patterns.filter(p => p.type === 'synchronous-block')
  if (syncBlocks.length > 2) {
    recs.push(`Replace ${syncBlocks.length} synchronous blocking calls with async equivalents`)
  }

  const erraticFiles = files.filter(f => f.classification === 'erratic')
  if (erraticFiles.length > 0) {
    recs.push(`Refactor ${erraticFiles.length} erratic file(s) to reduce temporal complexity`)
  }

  const racingFiles = files.filter(f => f.classification === 'racing')
  if (racingFiles.length > 0) {
    recs.push(`Critical: Fix ${racingFiles.length} racing file(s) with race conditions or deadlock risks`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete chronometer analysis result
 * @example
 * buildChronometerResult(['src/a.ts'], ['await foo()'], {}) // ChronometerResult
 */
export function buildChronometerResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ChronometerResult {
  const allPatterns: TemporalPattern[] = []
  const allAnomalies: TemporalAnomaly[] = []
  const allDeps: TimeDependency[] = []
  const tempFiles: TemporalFile[] = []

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const content = contents[i]
    if (filePath === undefined || content === undefined) continue

    const patterns = detectTemporalPatterns(content, filePath)
    const deps = detectTimeDependencies(content, filePath)
    const anomalies = detectTemporalAnomalies(patterns, content)

    const asyncScore = computeAsyncScore(patterns, content)
    const timeoutHandling = computeTimeoutHandling(content)
    const errorRecovery = computeErrorRecovery(content)
    const temporalComplexity = computeTemporalComplexity(patterns, deps)
    const syncBlocks = patterns.filter(p => p.type === 'synchronous-block').length
    const asyncBlocks = patterns.filter(p => p.type === 'sequential' || p.type === 'async-chain' || p.type === 'parallel').length

    const classification = classifyTemporalFile(asyncScore, temporalComplexity, anomalies)

    const tf: TemporalFile = {
      file: filePath,
      patterns,
      dependencies: deps,
      asyncScore,
      syncBlocks,
      asyncBlocks,
      timeoutHandling,
      errorRecovery,
      temporalComplexity,
      classification,
    }

    tempFiles.push(tf)
    allPatterns.push(...patterns)
    allAnomalies.push(...anomalies)
    allDeps.push(...deps)
  }

  const avgAsyncScore = tempFiles.length > 0
    ? Math.round(tempFiles.reduce((s, f) => s + f.asyncScore, 0) / tempFiles.length * 10) / 10
    : 100
  const avgTimeoutHandling = tempFiles.length > 0
    ? Math.round(tempFiles.reduce((s, f) => s + f.timeoutHandling, 0) / tempFiles.length * 10) / 10
    : 100
  const avgTemporalComplexity = tempFiles.length > 0
    ? Math.round(tempFiles.reduce((s, f) => s + f.temporalComplexity, 0) / tempFiles.length * 10) / 10
    : 0

  const chronometerScore = computeChronometerScore(tempFiles, allPatterns, allAnomalies)
  const temporalHealth = classifyTemporalHealth(chronometerScore, allAnomalies)

  const stats: ChronometerStats = {
    totalPatterns: allPatterns.length,
    sequentialPatterns: allPatterns.filter(p => p.type === 'sequential').length,
    parallelPatterns: allPatterns.filter(p => p.type === 'parallel').length,
    asyncChains: allPatterns.filter(p => p.type === 'async-chain').length,
    callbackPyramids: allPatterns.filter(p => p.type === 'callback-pyramid').length,
    totalDependencies: allDeps.length,
    criticalDependencies: allDeps.filter(d => d.strength === 'critical').length,
    implicitDependencies: allDeps.filter(d => d.isImplicit).length,
    totalAnomalies: allAnomalies.length,
    raceConditions: allAnomalies.filter(a => a.type === 'race-condition').length,
    deadlockRisks: allAnomalies.filter(a => a.type === 'deadlock-risk').length,
    callbackHells: allAnomalies.filter(a => a.type === 'callback-hell').length,
    avgAsyncScore,
    avgTimeoutHandling,
    avgTemporalComplexity,
    clockworkFiles: tempFiles.filter(f => f.classification === 'clockwork').length,
    erraticFiles: tempFiles.filter(f => f.classification === 'erratic').length,
    racingFiles: tempFiles.filter(f => f.classification === 'racing').length,
    temporalHealth,
    chronometerScore,
  }

  const recommendations = generateRecommendations(tempFiles, allPatterns, allAnomalies, stats)

  return {
    files: tempFiles,
    patterns: allPatterns,
    anomalies: allAnomalies,
    dependencies: allDeps,
    stats,
    recommendations,
  }
}
