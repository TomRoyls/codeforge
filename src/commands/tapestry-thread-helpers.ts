// ─── Types ──────────────────────────────────────────────────────────────────────

export type ThreadType = 'feature' | 'data-type' | 'error-path' | 'logging' | 'configuration' | 'authentication' | 'validation'
export type PointRole = 'entry' | 'pass-through' | 'transform' | 'branch' | 'merge' | 'exit' | 'dead-end'
export type TangleType = 'crossing' | 'knot' | 'splice' | 'fray'
export type TangleSeverity = 'minor' | 'moderate' | 'severe'
export type OverallWeave = 'seamless' | 'woven' | 'tangled' | 'frayed' | 'unraveled'

export interface ThreadPoint {
  file: string
  line: number
  symbol: string
  role: PointRole
  description: string
}

export interface Thread {
  id: string
  concern: string
  type: ThreadType
  startPoint: ThreadPoint
  endPoint: ThreadPoint | null
  path: ThreadPoint[]
  continuity: number
  visibility: number
  completeness: number
  length: number
  tangles: ThreadTangle[]
  isBroken: boolean
  isComplete: boolean
  color: string
}

export interface ThreadTangle {
  location: string
  threads: string[]
  type: TangleType
  severity: TangleSeverity
  description: string
}

export interface ThreadSpool {
  file: string
  outgoingThreads: number
  incomingThreads: number
  threadDensity: number
  isSpoolHub: boolean
  isDeadEnd: boolean
}

export interface TapestryThreadStats {
  totalThreads: number
  featureThreads: number
  dataTypeThreads: number
  errorPathThreads: number
  loggingThreads: number
  completeThreads: number
  brokenThreads: number
  avgContinuity: number
  avgVisibility: number
  avgCompleteness: number
  avgLength: number
  totalTangles: number
  severeTangles: number
  spoolHubs: number
  deadEnds: number
  threadCoverage: number
  threadIntegrity: number
  overallWeave: OverallWeave
}

export interface TapestryThreadResult {
  threads: Thread[]
  tangles: ThreadTangle[]
  spools: ThreadSpool[]
  stats: TapestryThreadStats
  recommendations: string[]
}

// ─── traceFeatureThreads ────────────────────────────────────────────────────────

/**
 * Trace feature threads through code
 * @example
 * traceFeatureThreads('export function process() {}', 'a.ts') // Thread[]
 */
export function traceFeatureThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const lines = content.split('\n')

  const exportMatches: { line: number; symbol: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]?.match(/export\s+(?:async\s+)?function\s+(\w+)/)
    if (m && m[1]) exportMatches.push({ line: i + 1, symbol: m[1] })
  }

  for (const exp of exportMatches) {
    const path: ThreadPoint[] = [
      { file: filePath, line: exp.line, symbol: exp.symbol, role: 'entry', description: `Entry: ${exp.symbol}` },
    ]

    const hasBranch = lines.some(l => /\bif\s*\(|else|switch\b/.test(l))
    if (hasBranch) {
      path.push({ file: filePath, line: exp.line + 1, symbol: exp.symbol, role: 'branch', description: `Branching in ${exp.symbol}` })
    }

    const hasReturn = lines.some(l => /\breturn\b/.test(l))
    if (hasReturn) {
      const exitLine = lines.findIndex(l => /\breturn\b/.test(l))
      path.push({ file: filePath, line: exitLine + 1, symbol: exp.symbol, role: 'exit', description: `Exit: ${exp.symbol}` })
    }

    const hasCall = lines.some(l => /\w+\(/.test(l) && !/function|if|switch|for|while/.test(l))
    if (hasCall) {
      path.push({ file: filePath, line: exp.line, symbol: exp.symbol, role: 'pass-through', description: `Delegation in ${exp.symbol}` })
    }

    const continuity = computeContinuity(path)
    const visibility = computeVisibility(content, path)
    const completeness = computeCompleteness(path)
    const isComplete = path.some(p => p.role === 'exit')
    const isBroken = !isComplete && path.length > 1

    const startPoint = path[0]
    if (startPoint === undefined) continue

    threads.push({
      id: `feature-${filePath}-${exp.symbol}`,
      concern: exp.symbol,
      type: 'feature',
      startPoint,
      endPoint: path.find(p => p.role === 'exit') ?? null,
      path,
      continuity,
      visibility,
      completeness,
      length: 1,
      tangles: [],
      isBroken,
      isComplete,
      color: 'blue',
    })
  }

  return threads
}

// ─── traceDataTypeThreads ───────────────────────────────────────────────────────

/**
 * Trace data type threads through code
 * @example
 * traceDataTypeThreads('interface Config { name: string }', 'a.ts') // Thread[]
 */
export function traceDataTypeThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const lines = content.split('\n')

  const typeMatches: { line: number; symbol: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]?.match(/(?:interface|type)\s+(\w+)/)
    if (m && m[1]) typeMatches.push({ line: i + 1, symbol: m[1] })
  }

  for (const tm of typeMatches) {
    const path: ThreadPoint[] = [
      { file: filePath, line: tm.line, symbol: tm.symbol, role: 'entry', description: `Type defined: ${tm.symbol}` },
    ]

    const isUsed = content.includes(tm.symbol) && (content.match(new RegExp(`\\b${tm.symbol}\\b`, 'g')) || []).length > 1
    if (isUsed) {
      const usageLine = lines.findIndex((l, idx) => idx !== tm.line - 1 && l.includes(tm.symbol))
      if (usageLine >= 0) {
        path.push({ file: filePath, line: usageLine + 1, symbol: tm.symbol, role: 'pass-through', description: `Type used: ${tm.symbol}` })
      }
    }

    const isExported = new RegExp(`export\\s+(?:interface|type)\\s+${tm.symbol}`).test(content)
    if (isExported) {
      path.push({ file: filePath, line: tm.line, symbol: tm.symbol, role: 'exit', description: `Type exported: ${tm.symbol}` })
    }

    const continuity = computeContinuity(path)
    const visibility = computeVisibility(content, path)
    const completeness = computeCompleteness(path)

    const startPoint = path[0]
    if (startPoint === undefined) continue

    threads.push({
      id: `datatype-${filePath}-${tm.symbol}`,
      concern: tm.symbol,
      type: 'data-type',
      startPoint,
      endPoint: path.find(p => p.role === 'exit') ?? null,
      path,
      continuity,
      visibility,
      completeness,
      length: 1,
      tangles: [],
      isBroken: !isExported && isUsed,
      isComplete: isExported,
      color: 'green',
    })
  }

  return threads
}

// ─── traceErrorPathThreads ──────────────────────────────────────────────────────

/**
 * Trace error handling threads through code
 * @example
 * traceErrorPathThreads('try { x() } catch(e) { log(e) }', 'a.ts') // Thread[]
 */
export function traceErrorPathThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const lines = content.split('\n')

  const tryMatches: { line: number }[] = []
  for (let i = 0; i < lines.length; i++) {
    if (/\btry\s*\{/.test(lines[i] ?? '')) tryMatches.push({ line: i + 1 })
  }

  for (const tm of tryMatches) {
    const path: ThreadPoint[] = [
      { file: filePath, line: tm.line, symbol: 'try', role: 'entry', description: 'Error boundary start' },
    ]

    const catchLine = lines.findIndex((l, i) => i >= tm.line - 1 && /\bcatch\s*\(/.test(l))
    if (catchLine >= 0) {
      path.push({ file: filePath, line: catchLine + 1, symbol: 'catch', role: 'branch', description: 'Error caught' })
    }

    const hasThrow = lines.some(l => /\bthrow\b/.test(l))
    if (hasThrow) {
      const throwLine = lines.findIndex(l => /\bthrow\b/.test(l))
      path.push({ file: filePath, line: throwLine + 1, symbol: 'throw', role: 'exit', description: 'Error propagated' })
    }

    const continuity = computeContinuity(path)
    const visibility = computeVisibility(content, path)
    const completeness = computeCompleteness(path)
    const hasCatch = catchLine >= 0
    const hasFinalExit = hasCatch || hasThrow

    const startPoint = path[0]
    if (startPoint === undefined) continue

    threads.push({
      id: `error-${filePath}-${tm.line}`,
      concern: `error-path-L${tm.line}`,
      type: 'error-path',
      startPoint,
      endPoint: path.find(p => p.role === 'exit') ?? null,
      path,
      continuity,
      visibility,
      completeness,
      length: 1,
      tangles: [],
      isBroken: !hasFinalExit,
      isComplete: hasCatch,
      color: 'red',
    })
  }

  return threads
}

// ─── traceLoggingThreads ────────────────────────────────────────────────────────

/**
 * Trace logging threads through code
 * @example
 * traceLoggingThreads('console.log("msg")', 'a.ts') // Thread[]
 */
export function traceLoggingThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const lines = content.split('\n')

  const logMatches: { line: number; symbol: string }[] = []
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]?.match(/(console\.(log|warn|error|debug|info)|logger\.\w+)\(/)
    if (m && m[1]) logMatches.push({ line: i + 1, symbol: m[1] })
  }

  if (logMatches.length === 0) return threads

  const firstLog = logMatches[0]
  const lastLog = logMatches[logMatches.length - 1]
  if (firstLog === undefined || lastLog === undefined) return threads

  const path: ThreadPoint[] = logMatches.map(lm => ({
    file: filePath,
    line: lm.line,
    symbol: lm.symbol,
    role: lm.line === firstLog.line ? 'entry' : lm.line === lastLog.line ? 'exit' : 'pass-through',
    description: `Log call: ${lm.symbol}`,
  }))

  const continuity = computeContinuity(path)
  const visibility = computeVisibility(content, path)
  const completeness = computeCompleteness(path)

  const startPoint = path[0]
  const endPoint = path[path.length - 1]
  if (startPoint === undefined || endPoint === undefined) return threads

  threads.push({
    id: `logging-${filePath}`,
    concern: 'logging',
    type: 'logging',
    startPoint,
    endPoint,
    path,
    continuity,
    visibility,
    completeness,
    length: 1,
    tangles: [],
    isBroken: false,
    isComplete: true,
    color: 'yellow',
  })

  return threads
}

// ─── computeContinuity ──────────────────────────────────────────────────────────

/**
 * Compute thread continuity 0-100
 * @example
 * computeContinuity(points) // 80
 */
export function computeContinuity(path: ThreadPoint[]): number {
  if (path.length === 0) return 0
  if (path.length === 1) return 50

  const hasEntry = path.some(p => p.role === 'entry')
  const hasExit = path.some(p => p.role === 'exit')
  if (hasEntry && hasExit) return 100
  if (hasEntry) return 70
  if (hasExit) return 60

  const roles = path.map(p => p.role)
  const uniqueRoles = Array.from(new Set(roles))
  return Math.min(90, 40 + uniqueRoles.length * 10)
}

// ─── computeVisibility ──────────────────────────────────────────────────────────

/**
 * Compute thread visibility 0-100
 * @example
 * computeVisibility('export function f() {}', points) // 75
 */
export function computeVisibility(content: string, path: ThreadPoint[]): number {
  let score = 40
  const hasDocs = /\/\*\*/.test(content)
  if (hasDocs) score += 15

  const hasNamedExports = /export\s+(?:function|class|const)\s+\w+/.test(content)
  if (hasNamedExports) score += 15

  const hasTypeAnnotations = /:\s*(string|number|boolean|void|Promise)/.test(content)
  if (hasTypeAnnotations) score += 10

  const hasComments = /\/\//.test(content)
  if (hasComments) score += 10

  const pathDescQuality = path.filter(p => p.description.length > 10).length
  if (pathDescQuality > 0) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeCompleteness ────────────────────────────────────────────────────────

/**
 * Compute thread completeness 0-100
 * @example
 * computeCompleteness(points) // 85
 */
export function computeCompleteness(path: ThreadPoint[]): number {
  if (path.length === 0) return 0
  if (path.length === 1) return 30

  const hasEntry = path.some(p => p.role === 'entry')
  const hasExit = path.some(p => p.role === 'exit')
  const hasDeadEnd = path.some(p => p.role === 'dead-end')

  if (hasEntry && hasExit && !hasDeadEnd) return 100
  if (hasEntry && hasExit) return 80
  if (hasEntry && hasDeadEnd) return 40
  if (hasEntry) return 60
  if (hasDeadEnd) return 20
  return 50
}

// ─── detectTangles ──────────────────────────────────────────────────────────────

/**
 * Detect thread tangles
 * @example
 * detectTangles(threads) // ThreadTangle[]
 */
export function detectTangles(threads: Thread[]): ThreadTangle[] {
  const tangles: ThreadTangle[] = []

  const fileThreads = new Map<string, Thread[]>()
  for (const t of threads) {
    const files = Array.from(new Set(t.path.map(p => p.file)))
    for (const f of files) {
      const group = fileThreads.get(f) || []
      group.push(t)
      fileThreads.set(f, group)
    }
  }

  for (const [file, fileThreadList] of fileThreads) {
    if (fileThreadList.length < 2) continue

    if (fileThreadList.length >= 4) {
      tangles.push({
        location: file,
        threads: fileThreadList.map(t => t.id),
        type: 'knot',
        severity: 'severe',
        description: `${fileThreadList.length} threads knotted in ${file}`,
      })
    } else if (fileThreadList.length >= 2) {
      const types = Array.from(new Set(fileThreadList.map(t => t.type)))
      if (types.length >= 2) {
        tangles.push({
          location: file,
          threads: fileThreadList.map(t => t.id),
          type: 'crossing',
          severity: 'minor',
          description: `${types.length} different thread types cross in ${file}`,
        })
      }
    }
  }

  const brokenInFile = new Map<string, Thread[]>()
  for (const t of threads) {
    if (t.isBroken) {
      const files = Array.from(new Set(t.path.map(p => p.file)))
      for (const f of files) {
        const group = brokenInFile.get(f) || []
        group.push(t)
        brokenInFile.set(f, group)
      }
    }
  }

  for (const [file, brokenList] of brokenInFile) {
    if (brokenList.length >= 2) {
      tangles.push({
        location: file,
        threads: brokenList.map(t => t.id),
        type: 'fray',
        severity: 'moderate',
        description: `${brokenList.length} frayed threads in ${file}`,
      })
    }
  }

  return tangles
}

// ─── analyzeSpools ──────────────────────────────────────────────────────────────

/**
 * Analyze thread spools (density per file)
 * @example
 * analyzeSpools(threads, ['a.ts']) // ThreadSpool[]
 */
export function analyzeSpools(threads: Thread[], files: string[]): ThreadSpool[] {
  const spools: ThreadSpool[] = []

  for (const file of files) {
    let outgoing = 0
    let incoming = 0

    for (const t of threads) {
      const filePoints = t.path.filter(p => p.file === file)
      if (filePoints.length === 0) continue

      const hasEntry = filePoints.some(p => p.role === 'entry')
      const hasExit = filePoints.some(p => p.role === 'exit')

      if (hasEntry) outgoing++
      if (hasExit || !hasEntry) incoming++
    }

    const density = Math.min(100, (outgoing + incoming) * 10)
    const isHub = outgoing + incoming >= 5
    const isDeadEnd = incoming > 0 && outgoing === 0

    spools.push({
      file,
      outgoingThreads: outgoing,
      incomingThreads: incoming,
      threadDensity: density,
      isSpoolHub: isHub,
      isDeadEnd: isDeadEnd,
    })
  }

  return spools
}

// ─── computeThreadCoverage ──────────────────────────────────────────────────────

/**
 * Compute thread coverage 0-100
 * @example
 * computeThreadCoverage(threads, ['a.ts', 'b.ts']) // 50
 */
export function computeThreadCoverage(threads: Thread[], files: string[]): number {
  if (files.length === 0) return 0
  const touchedFiles = Array.from(new Set(threads.flatMap(t => t.path.map(p => p.file))))
  return Math.round((touchedFiles.length / files.length) * 100)
}

// ─── computeThreadIntegrity ─────────────────────────────────────────────────────

/**
 * Compute thread integrity 0-100
 * @example
 * computeThreadIntegrity(threads) // 75
 */
export function computeThreadIntegrity(threads: Thread[]): number {
  if (threads.length === 0) return 50
  const avgContinuity = threads.reduce((s, t) => s + t.continuity, 0) / threads.length
  const avgCompleteness = threads.reduce((s, t) => s + t.completeness, 0) / threads.length
  const brokenPenalty = threads.filter(t => t.isBroken).length * 5
  return Math.max(0, Math.min(100, Math.round((avgContinuity + avgCompleteness) / 2 - brokenPenalty)))
}

// ─── classifyOverallWeave ───────────────────────────────────────────────────────

/**
 * Classify overall weave quality
 * @example
 * classifyOverallWeave(80, 2, 0) // 'seamless'
 */
export function classifyOverallWeave(integrity: number, severeTangles: number, brokenThreads: number): OverallWeave {
  if (integrity >= 75 && severeTangles === 0 && brokenThreads === 0) return 'seamless'
  if (integrity >= 60 && severeTangles <= 2) return 'woven'
  if (integrity >= 45) return 'tangled'
  if (integrity >= 30) return 'frayed'
  return 'unraveled'
}

// ─── generateRecommendations ────────────────────────────────────────────────────

/**
 * Generate tapestry thread recommendations
 * @example
 * generateRecommendations(threads, tangles, spools, stats) // string[]
 */
export function generateRecommendations(
  threads: Thread[],
  tangles: ThreadTangle[],
  _spools: ThreadSpool[],
  stats: TapestryThreadStats,
): string[] {
  const recs: string[] = []

  const broken = threads.filter(t => t.isBroken)
  if (broken.length > 0) {
    recs.push(`Fix ${broken.length} broken thread(s) with incomplete paths`)
  }

  const severe = tangles.filter(t => t.severity === 'severe')
  if (severe.length > 0) {
    recs.push(`Separate concerns in ${severe.length} severely tangled location(s)`)
  }

  if (stats.deadEnds > 0) {
    recs.push(`Connect or remove ${stats.deadEnds} dead-end file(s)`)
  }

  if (stats.avgVisibility < 40) {
    recs.push('Low thread visibility - add documentation and tracing')
  }

  if (stats.threadCoverage < 30) {
    recs.push('Low thread coverage - ensure all modules are properly connected')
  }

  if (stats.threadIntegrity < 40) {
    recs.push('Low thread integrity - review broken paths and incomplete traces')
  }

  if (stats.brokenThreads > stats.totalThreads * 0.3 && stats.totalThreads > 0) {
    recs.push('High broken thread rate - comprehensive path review needed')
  }

  return Array.from(new Set(recs))
}

// ─── buildTapestryThreadResult ──────────────────────────────────────────────────

/**
 * Build complete tapestry thread analysis result
 * @example
 * buildTapestryThreadResult(['a.ts'], ['export function f() {}'], {}) // TapestryThreadResult
 */
export function buildTapestryThreadResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): TapestryThreadResult {
  const allThreads: Thread[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]
    if (content === undefined || filePath === undefined) continue

    allThreads.push(...traceFeatureThreads(content, filePath))
    allThreads.push(...traceDataTypeThreads(content, filePath))
    allThreads.push(...traceErrorPathThreads(content, filePath))
    allThreads.push(...traceLoggingThreads(content, filePath))
  }

  const tangles = detectTangles(allThreads)
  const spools = analyzeSpools(allThreads, files)

  for (const t of tangles) {
    for (const thread of allThreads) {
      if (t.threads.includes(thread.id)) {
        thread.tangles.push(t)
      }
    }
  }

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const featureThreads = allThreads.filter(t => t.type === 'feature').length
  const dataTypeThreads = allThreads.filter(t => t.type === 'data-type').length
  const errorPathThreads = allThreads.filter(t => t.type === 'error-path').length
  const loggingThreads = allThreads.filter(t => t.type === 'logging').length
  const completeThreads = allThreads.filter(t => t.isComplete).length
  const brokenThreads = allThreads.filter(t => t.isBroken).length
  const severeTangles = tangles.filter(t => t.severity === 'severe').length
  const spoolHubs = spools.filter(s => s.isSpoolHub).length
  const deadEnds = spools.filter(s => s.isDeadEnd).length

  const threadCoverage = computeThreadCoverage(allThreads, files)
  const threadIntegrity = computeThreadIntegrity(allThreads)
  const overallWeave = classifyOverallWeave(threadIntegrity, severeTangles, brokenThreads)

  const stats: TapestryThreadStats = {
    totalThreads: allThreads.length,
    featureThreads,
    dataTypeThreads,
    errorPathThreads,
    loggingThreads,
    completeThreads,
    brokenThreads,
    avgContinuity: avg(allThreads.map(t => t.continuity)),
    avgVisibility: avg(allThreads.map(t => t.visibility)),
    avgCompleteness: avg(allThreads.map(t => t.completeness)),
    avgLength: avg(allThreads.map(t => t.length)),
    totalTangles: tangles.length,
    severeTangles,
    spoolHubs,
    deadEnds,
    threadCoverage,
    threadIntegrity,
    overallWeave,
  }

  const recommendations = generateRecommendations(allThreads, tangles, spools, stats)

  return { threads: allThreads, tangles, spools, stats, recommendations }
}
