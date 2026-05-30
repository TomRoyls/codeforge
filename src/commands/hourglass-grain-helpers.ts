// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface GrainDistribution {
  fineGrains: number
  mediumGrains: number
  coarseGrains: number
  boulders: number
  dust: number
}

export interface FlowAnalysis {
  direction: 'descending' | 'ascending' | 'lateral' | 'mixed'
  smoothness: number
  hasClogs: boolean
  hasLeaks: boolean
  hasTurbulence: boolean
  hasPooling: boolean
  clogPoints: string[]
  leakPoints: string[]
  turbulencePoints: string[]
  poolingPoints: string[]
}

export interface NeckAnalysis {
  width: number
  hasNarrowing: boolean
  narrowestPoint: string
  isChoked: boolean
}

export interface ChamberAnalysis {
  topWeight: number
  bottomWeight: number
  balance: number
  isTopHeavy: boolean
  isBottomHeavy: boolean
  isBalanced: boolean
}

export interface TimeAnalysis {
  estimatedFlowTime: number
  hasBlocking: boolean
  hasAsync: boolean
  timeUniformity: number
}

export interface SandGrain {
  file: string
  grainSize: number
  flowRate: number
  sandQuality: number
  grainCount: number
  avgGrainWeight: number
  grainDistribution: GrainDistribution
  flow: FlowAnalysis
  neck: NeckAnalysis
  chamber: ChamberAnalysis
  time: TimeAnalysis
  sandType: 'silica' | 'quartz' | 'garnet' | 'corundum' | 'diamond' | 'dust' | 'mud'
  hourglassRole: 'timer' | 'measure' | 'filter' | 'buffer' | 'valve' | 'reservoir'
  condition: 'flowing' | 'smooth' | 'steady' | 'clogging' | 'jammed' | 'broken'
  qualityScore: number
}

export interface SandLayer {
  directory: string
  grains: SandGrain[]
  avgGrainSize: number
  avgFlowRate: number
  avgSandQuality: number
  totalGrainCount: number
  fineGrains: number
  coarseGrains: number
  boulders: number
  clogCount: number
  leakCount: number
  turbulenceCount: number
  neckWidth: number
  isChoked: boolean
  chamberBalance: number
  flowDirection: string
  sandType: string
  condition: 'flowing-freely' | 'smooth-flow' | 'steady' | 'slow' | 'clogged' | 'jammed'
  layerQuality: number
}

export interface HourglassStructure {
  totalSand: number
  avgGrainSize: number
  avgFlowRate: number
  avgSandQuality: number
  neckWidth: number
  chamberBalance: number
  totalClogs: number
  totalLeaks: number
  totalBoulders: number
  flowHealth: number
}

export interface HourglassGrainStats {
  totalFiles: number
  totalLayers: number
  avgGrainSize: number
  avgFlowRate: number
  avgSandQuality: number
  avgSmoothness: number
  avgNeckWidth: number
  avgChamberBalance: number
  fineGrains: number
  mediumGrains: number
  coarseGrains: number
  boulders: number
  dustGrains: number
  totalClogs: number
  totalLeaks: number
  totalTurbulence: number
  totalPooling: number
  chokedFiles: number
  balancedFiles: number
  topHeavyFiles: number
  bottomHeavyFiles: number
  overallFlowHealth: number
  timekeeperGrade: 'precision-clock' | 'hourglass' | 'sundial' | 'water-clock' | 'stopped-clock'
  bestFlow: string
  worstFlow: string
  finestGrain: string
  coarsestGrain: string
  biggestBottleneck: string
}

export interface HourglassGrainResult {
  grains: SandGrain[]
  layers: SandLayer[]
  hourglass: HourglassStructure
  stats: HourglassGrainStats
  recommendations: string[]
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify sand type from quality score
 * @example
 * classifySandType(90) // 'diamond'
 */
export function classifySandType(quality: number): SandGrain['sandType'] {
  if (quality >= 85) return 'diamond'
  if (quality >= 70) return 'corundum'
  if (quality >= 55) return 'garnet'
  if (quality >= 40) return 'quartz'
  if (quality >= 25) return 'silica'
  if (quality >= 10) return 'dust'
  return 'mud'
}

/**
 * Classify hourglass role from content analysis
 * @example
 * classifyHourglassRole('export function process() {}') // 'filter'
 */
export function classifyHourglassRole(content: string): SandGrain['hourglassRole'] {
  const hasTimers = /setTimeout|setInterval|requestAnimationFrame|debounce|throttle/.test(content)
  const hasMeasurements = /performance\.now|Date\.now|console\.time|benchmark/.test(content)
  const hasFilters = /\.filter\(|\.map\(|\.reduce\(|\.some\(|\.every\(/.test(content)
  const hasBuffers = /Buffer|Queue|Stack|cache|buffer/i.test(content)
  const hasValves = /if\s*\(|switch\s*\(|ternary|&&|\?\?/.test(content)
  const hasStorage = /localStorage|sessionStorage|database|store|save|persist/i.test(content)

  if (hasTimers) return 'timer'
  if (hasMeasurements) return 'measure'
  if (hasBuffers) return 'buffer'
  if (hasStorage) return 'reservoir'
  if (hasFilters) return 'filter'
  if (hasValves) return 'valve'
  return 'filter'
}

/**
 * Classify condition from flow metrics
 * @example
 * classifyCondition(80, 90) // 'flowing'
 */
export function classifyCondition(flowRate: number, qualityScore: number): SandGrain['condition'] {
  if (flowRate >= 80 && qualityScore >= 80) return 'flowing'
  if (flowRate >= 65 && qualityScore >= 65) return 'smooth'
  if (flowRate >= 45) return 'steady'
  if (flowRate >= 25) return 'clogging'
  if (flowRate >= 10) return 'jammed'
  return 'broken'
}

/**
 * Classify timekeeper grade from overall flow health
 * @example
 * classifyTimekeeperGrade(90) // 'precision-clock'
 */
export function classifyTimekeeperGrade(flowHealth: number): HourglassGrainStats['timekeeperGrade'] {
  if (flowHealth >= 80) return 'precision-clock'
  if (flowHealth >= 60) return 'hourglass'
  if (flowHealth >= 40) return 'sundial'
  if (flowHealth >= 20) return 'water-clock'
  return 'stopped-clock'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect clogs (bottlenecks) in code
 * @example
 * detectClogs('function big() { if(a){if(b){if(c){}}}') // { hasClogs: true, ... }
 */
export function detectClogs(content: string): { hasClogs: boolean; clogPoints: string[] } {
  const clogPoints: string[] = []

  const lines = content.split('\n')
  let maxNesting = 0
  let currentNesting = 0
  for (const line of lines) {
    const opens = (line.match(/\{/g) ?? []).length
    const closes = (line.match(/\}/g) ?? []).length
    currentNesting += opens - closes
    if (currentNesting > maxNesting) maxNesting = currentNesting
  }
  if (maxNesting >= 4) clogPoints.push(`Deep nesting: ${maxNesting} levels`)

  const funcMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\n\}/g) ?? []
  for (const f of funcMatches) {
    const lineCount = f.split('\n').length
    if (lineCount > 30) {
      const nameMatch = f.match(/function\s+(\w+)/)
      clogPoints.push(`Large function: ${nameMatch?.[1] ?? 'anonymous'} (${lineCount} lines)`)
    }
  }

  const arrowMatches = content.match(/(?:const|let|var)\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>\s*\{[\s\S]*?\n\s*\}/g) ?? []
  for (const f of arrowMatches) {
    const lineCount = f.split('\n').length
    if (lineCount > 25) clogPoints.push(`Large arrow function (${lineCount} lines)`)
  }

  const hasLoopNesting = /for\s*\(.*for\s*\(/s.test(content) || /while\s*\(.*while\s*\(/s.test(content)
  if (hasLoopNesting) clogPoints.push('Nested loops detected')

  return { hasClogs: clogPoints.length > 0, clogPoints }
}

/**
 * Detect leaks (data loss points)
 * @example
 * detectLeaks('function f() { const x = 1 }') // { hasLeaks: true, ... }
 */
export function detectLeaks(content: string): { hasLeaks: boolean; leakPoints: string[] } {
  const leakPoints: string[] = []

  const funcBlocks = content.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g) ?? []
  for (const block of funcBlocks) {
    const nameMatch = block.match(/function\s+(\w+)/)
    const hasReturn = /\breturn\b/.test(block)
    const hasAssignment = /(?:const|let|var)\s+\w+\s*=/.test(block)
    if (hasAssignment && !hasReturn && !/void\s/.test(block)) {
      leakPoints.push(`Missing return: ${nameMatch?.[1] ?? 'anonymous'}`)
    }
  }

  const hasUnhandledPromises = /\.then\s*\(/g.test(content) && !/\.catch\s*\(/g.test(content) && !/try\s*\{/g.test(content)
  if (hasUnhandledPromises) leakPoints.push('Unhandled promise: .then without .catch')

  const hasEmptyCatch = /catch\s*\(\w*\)\s*\{\s*\}/g.test(content)
  if (hasEmptyCatch) leakPoints.push('Empty catch block: swallowed errors')

  return { hasLeaks: leakPoints.length > 0, leakPoints }
}

/**
 * Detect turbulence (chaotic flow)
 * @example
 * detectTurbulence('async function a() { syncCall() }') // { hasTurbulence: true, ... }
 */
export function detectTurbulence(content: string): { hasTurbulence: boolean; turbulencePoints: string[] } {
  const turbulencePoints: string[] = []

  const hasAsync = /async\s+|await\s+|Promise\s|\.then\s*\(/g.test(content)
  const hasSync = /fs\.readFileSync|fs\.writeFileSync|execSync|\.exec\(/g.test(content)
  if (hasAsync && hasSync) turbulencePoints.push('Mixed sync/async patterns')

  const callbacks = (content.match(/function\s*\([^)]*\)\s*\{/g) ?? []).length
  const arrowFuncs = (content.match(/=>\s*\{/g) ?? []).length
  const totalStyles = (callbacks > 0 ? 1 : 0) + (arrowFuncs > 0 ? 1 : 0) +
    (/function\s+\w+/.test(content) ? 1 : 0)
  if (totalStyles >= 3) turbulencePoints.push('Inconsistent function styles')

  const hasVar = /\bvar\s+/.test(content)
  const hasLet = /\blet\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const declStyles = (hasVar ? 1 : 0) + (hasLet ? 1 : 0) + (hasConst ? 1 : 0)
  if (hasVar && declStyles >= 2) turbulencePoints.push('Mixed declaration styles (var with let/const)')

  return { hasTurbulence: turbulencePoints.length > 0, turbulencePoints }
}

/**
 * Detect pooling (data accumulation)
 * @example
 * detectPooling('const arr = []; arr.push(1); arr.push(2);') // { hasPooling: true, ... }
 */
export function detectPooling(content: string): { hasPooling: boolean; poolingPoints: string[] } {
  const poolingPoints: string[] = []

  const pushCount = (content.match(/\.push\s*\(/g) ?? []).length
  if (pushCount > 5) poolingPoints.push(`Heavy array accumulation: ${pushCount} .push calls`)

  const globalAssignments = (content.match(/^[ \t]*(?:let|var)\s+\w+\s*=\s*\[/gm) ?? []).length
  if (globalAssignments > 3) poolingPoints.push('Multiple mutable array declarations')

  const hasUnboundedGrowth = /while\s*\(true\)|for\s*\(\s*;/g.test(content)
  if (hasUnboundedGrowth) poolingPoints.push('Potential unbounded loop')

  return { hasPooling: poolingPoints.length > 0, poolingPoints }
}

/**
 * Analyze grain distribution of operations
 * @example
 * analyzeGrainDistribution('const x = 1; function f() {}') // { fineGrains: ..., ... }
 */
export function analyzeGrainDistribution(content: string): GrainDistribution {
  let fineGrains = 0
  let mediumGrains = 0
  let coarseGrains = 0
  let boulders = 0
  let dust = 0

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0 || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      dust++
      continue
    }

    const complexity = (trimmed.match(/if|else|for|while|switch|case|try|catch|&&|\|\||[?!]/g) ?? []).length
    const hasDeclaration = /(?:const|let|var|function|class|interface|type|export|import)\s/.test(trimmed)

    if (complexity >= 4) boulders++
    else if (complexity >= 2) coarseGrains++
    else if (complexity >= 1) mediumGrains++
    else if (hasDeclaration || trimmed.length > 10) fineGrains++
    else dust++
  }

  return { fineGrains, mediumGrains, coarseGrains, boulders, dust }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a sand grain
 * @example
 * analyzeSandGrain('export function f() { return 1 }', 'f.ts') // SandGrain
 */
export function analyzeSandGrain(content: string, filePath: string): SandGrain {
  const lines = content.split('\n')
  const totalLines = lines.length
  const codeLines = lines.filter(l => {
    const t = l.trim()
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*')
  })

  const dist = analyzeGrainDistribution(content)
  const grainCount = dist.fineGrains + dist.mediumGrains + dist.coarseGrains + dist.boulders
  const avgGrainWeight = grainCount > 0
    ? Math.round((dist.fineGrains * 1 + dist.mediumGrains * 3 + dist.coarseGrains * 7 + dist.boulders * 15) / grainCount)
    : 0

  const totalOps = dist.fineGrains + dist.mediumGrains + dist.coarseGrains + dist.boulders
  const grainSize = totalOps > 0
    ? Math.round((dist.fineGrains * 100 + dist.mediumGrains * 60 + dist.coarseGrains * 30 + dist.boulders * 5) / totalOps)
    : 0

  const exportCount = (content.match(/\bexport\s+/g) ?? []).length
  const importCount = (content.match(/\bimport\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(])/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const hasJSDoc = /\/\*\*[\s\S]*?\*\//g.test(content)
  const hasTests = /describe\s*\(|it\s*\(|test\s*\(/g.test(content)
  const hasAny = /\bany\b/.test(content)
  const hasConsole = /console\.\w+\s*\(/.test(content)
  const hasTsIgnore = /@ts-ignore|@ts-expect-error/.test(content)

  const flowRate = Math.min(100, Math.max(0, Math.round(
    80 + (hasJSDoc ? 5 : 0) + (hasTests ? 5 : 0) +
    (interfaceCount > 0 ? 5 : 0) -
    (dist.boulders * 10) -
    (hasAny ? 10 : 0) -
    (hasConsole ? 5 : 0) -
    (hasTsIgnore ? 10 : 0),
  )))

  const sandQuality = Math.min(100, Math.max(0, Math.round(
    (exportCount > 0 ? 15 : 0) + (interfaceCount > 0 ? 15 : 0) +
    (hasJSDoc ? 15 : 0) + (hasTests ? 10 : 0) +
    (functionCount > 0 && functionCount <= 10 ? 15 : 5) +
    (importCount > 0 ? 10 : 0) + Math.min(20, codeLines.length) -
    (dist.boulders * 8) - (hasAny ? 15 : 0) - (hasTsIgnore ? 10 : 0),
  )))

  const clogResult = detectClogs(content)
  const leakResult = detectLeaks(content)
  const turbulenceResult = detectTurbulence(content)
  const poolingResult = detectPooling(content)

  let flowDirection: FlowAnalysis['direction'] = 'mixed'
  if (importCount > exportCount * 2) flowDirection = 'descending'
  else if (exportCount > importCount * 2) flowDirection = 'ascending'
  else if (importCount === exportCount && importCount > 0) flowDirection = 'lateral'

  const smoothness = Math.min(100, Math.max(0, 100 -
    clogResult.clogPoints.length * 15 -
    leakResult.leakPoints.length * 12 -
    turbulenceResult.turbulencePoints.length * 10 -
    poolingResult.poolingPoints.length * 8,
  ))

  const flow: FlowAnalysis = {
    direction: flowDirection,
    smoothness,
    hasClogs: clogResult.hasClogs,
    hasLeaks: leakResult.hasLeaks,
    hasTurbulence: turbulenceResult.hasTurbulence,
    hasPooling: poolingResult.hasPooling,
    clogPoints: clogResult.clogPoints,
    leakPoints: leakResult.leakPoints,
    turbulencePoints: turbulenceResult.turbulencePoints,
    poolingPoints: poolingResult.poolingPoints,
  }

  const neckWidth = Math.min(100, Math.max(0, 100 -
    clogResult.clogPoints.length * 20 -
    (dist.boulders > 3 ? 20 : 0) -
    (maxFunctionLength(content) > 50 ? 15 : 0),
  ))

  const neck: NeckAnalysis = {
    width: neckWidth,
    hasNarrowing: neckWidth < 60,
    narrowestPoint: clogResult.clogPoints[0] ?? filePath,
    isChoked: neckWidth < 30,
  }

  const inputLines = Math.round(codeLines.length * 0.4)
  const outputLines = Math.round(codeLines.length * 0.4)
  const topWeight = inputLines
  const bottomWeight = outputLines
  const balance = topWeight + bottomWeight > 0
    ? Math.round(Math.min(topWeight, bottomWeight) / Math.max(topWeight, bottomWeight) * 100)
    : 100

  const chamber: ChamberAnalysis = {
    topWeight,
    bottomWeight,
    balance,
    isTopHeavy: topWeight > bottomWeight * 2,
    isBottomHeavy: bottomWeight > topWeight * 2,
    isBalanced: balance >= 50,
  }

  const hasAsync = /async\s+|await\s+|Promise\s/.test(content)
  const hasSyncBlock = /readFileSync|writeFileSync|execSync/.test(content)

  const time: TimeAnalysis = {
    estimatedFlowTime: totalLines,
    hasBlocking: hasSyncBlock,
    hasAsync,
    timeUniformity: Math.min(100, Math.max(0,
      80 - (hasSyncBlock && hasAsync ? 30 : 0) - (hasSyncBlock ? 15 : 0) - (dist.boulders * 5),
    )),
  }

  const qualityScore = Math.round(
    (grainSize * 0.2) + (flowRate * 0.25) + (sandQuality * 0.25) +
    (smoothness * 0.15) + (neckWidth * 0.15),
  )

  const sandType = classifySandType(qualityScore)
  const hourglassRole = classifyHourglassRole(content)
  const condition = classifyCondition(flowRate, qualityScore)

  return {
    file: filePath,
    grainSize,
    flowRate,
    sandQuality,
    grainCount,
    avgGrainWeight,
    grainDistribution: dist,
    flow,
    neck,
    chamber,
    time,
    sandType,
    hourglassRole,
    condition,
    qualityScore,
  }
}

function maxFunctionLength(content: string): number {
  const funcStarts: number[] = []
  const lines = content.split('\n')
  let maxLen = 0

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i]
    if (lineText !== undefined && /function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>/.test(lineText)) {
      funcStarts.push(i)
    }
  }

  for (const start of funcStarts) {
    let depth = 0
    let started = false
    let len = 0
    for (let i = start; i < lines.length; i++) {
      const line = lines[i]
      if (line === undefined) continue
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
      if (depth > 0) started = true
      if (started) len++
      if (started && depth <= 0) break
    }
    if (len > maxLen) maxLen = len
  }

  return maxLen
}

// ─── Layer Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a sand layer
 * @example
 * analyzeSandLayer(grains, 'src') // SandLayer
 */
export function analyzeSandLayer(grains: SandGrain[], dirPath: string): SandLayer {
  if (grains.length === 0) {
    return {
      directory: dirPath,
      grains: [],
      avgGrainSize: 0,
      avgFlowRate: 0,
      avgSandQuality: 0,
      totalGrainCount: 0,
      fineGrains: 0,
      coarseGrains: 0,
      boulders: 0,
      clogCount: 0,
      leakCount: 0,
      turbulenceCount: 0,
      neckWidth: 0,
      isChoked: false,
      chamberBalance: 0,
      flowDirection: 'mixed',
      sandType: 'mud',
      condition: 'jammed',
      layerQuality: 0,
    }
  }

  const n = grains.length
  const avgGrainSize = Math.round(grains.reduce((s, g) => s + g.grainSize, 0) / n)
  const avgFlowRate = Math.round(grains.reduce((s, g) => s + g.flowRate, 0) / n)
  const avgSandQuality = Math.round(grains.reduce((s, g) => s + g.sandQuality, 0) / n)
  const totalGrainCount = grains.reduce((s, g) => s + g.grainCount, 0)
  const fineGrains = grains.reduce((s, g) => s + g.grainDistribution.fineGrains, 0)
  const coarseGrains = grains.reduce((s, g) => s + g.grainDistribution.coarseGrains, 0)
  const boulders = grains.reduce((s, g) => s + g.grainDistribution.boulders, 0)
  const clogCount = grains.filter(g => g.flow.hasClogs).length
  const leakCount = grains.filter(g => g.flow.hasLeaks).length
  const turbulenceCount = grains.filter(g => g.flow.hasTurbulence).length
  const neckWidth = Math.round(grains.reduce((s, g) => s + g.neck.width, 0) / n)
  const isChoked = grains.some(g => g.neck.isChoked)
  const chamberBalance = Math.round(grains.reduce((s, g) => s + g.chamber.balance, 0) / n)

  const directions = grains.map(g => g.flow.direction)
  const dirCounts = new Map<string, number>()
  for (const d of directions) {
    dirCounts.set(d, (dirCounts.get(d) ?? 0) + 1)
  }
  const flowDirection = Array.from(dirCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mixed'

  const sandTypes = grains.map(g => g.sandType)
  const typeCounts = new Map<string, number>()
  for (const t of sandTypes) {
    typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1)
  }
  const sandType = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mud'

  const layerQuality = Math.round((avgFlowRate + avgSandQuality + avgGrainSize) / 3)

  let condition: SandLayer['condition']
  if (avgFlowRate >= 75 && layerQuality >= 70) condition = 'flowing-freely'
  else if (avgFlowRate >= 60) condition = 'smooth-flow'
  else if (avgFlowRate >= 40) condition = 'steady'
  else if (avgFlowRate >= 20) condition = 'slow'
  else if (avgFlowRate >= 10) condition = 'clogged'
  else condition = 'jammed'

  return {
    directory: dirPath,
    grains,
    avgGrainSize,
    avgFlowRate,
    avgSandQuality,
    totalGrainCount,
    fineGrains,
    coarseGrains,
    boulders,
    clogCount,
    leakCount,
    turbulenceCount,
    neckWidth,
    isChoked,
    chamberBalance,
    flowDirection,
    sandType,
    condition,
    layerQuality,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate hourglass grain recommendations
 * @example
 * generateRecommendations(grains, layers, hg, stats) // string[]
 */
export function generateRecommendations(
  _grains: SandGrain[],
  layers: SandLayer[],
  _hourglass: HourglassStructure,
  stats: HourglassGrainStats,
): string[] {
  const recs: string[] = []

  if (stats.boulders > 0) {
    recs.push(`Boulders detected: ${stats.boulders} overly complex operations — break into finer grains`)
  }

  if (stats.totalClogs > 0) {
    recs.push(`Clogs: ${stats.totalClogs} bottleneck points found — remove or widen`)
  }

  if (stats.totalLeaks > 0) {
    recs.push(`Leaks: ${stats.totalLeaks} data loss points — add missing returns and error handling`)
  }

  if (stats.totalTurbulence > 0) {
    recs.push(`Turbulence: ${stats.totalTurbulence} chaotic flow patterns — standardize sync/async`)
  }

  if (stats.totalPooling > 0) {
    recs.push(`Pooling: ${stats.totalPooling} data accumulation points — bound growth`)
  }

  if (stats.chokedFiles > 0) {
    recs.push(`Choked necks: ${stats.chokedFiles} files have severely bottlenecked flow`)
  }

  if (stats.topHeavyFiles > stats.balancedFiles) {
    recs.push('Top-heavy: many files have excessive input processing — balance chambers')
  }

  if (stats.coarseGrains > stats.fineGrains) {
    recs.push('Coarse grains dominate: refactor into smaller, focused operations')
  }

  if (stats.overallFlowHealth < 40) {
    recs.push('Poor flow health: significant code flow issues need attention')
  }

  if (stats.avgGrainSize < 30) {
    recs.push('Very coarse grain: operations too large — increase granularity')
  }

  if (stats.avgNeckWidth < 40) {
    recs.push('Narrow necks: consider adding parallelism or caching to widen flow')
  }

  if (stats.overallFlowHealth >= 75) {
    recs.push('Good flow health: code flows smoothly through the codebase')
  }

  const slowLayers = layers.filter(l => l.condition === 'clogged' || l.condition === 'jammed')
  if (slowLayers.length > 0) {
    recs.push(`Slow layers: ${slowLayers.length} directories have poor flow — investigate`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete hourglass grain result from files and contents
 * @example
 * buildHourglassGrainResult(['a.ts'], ['export function a() {}'], {}) // HourglassGrainResult
 */
export function buildHourglassGrainResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): HourglassGrainResult {
  void options

  const grains: SandGrain[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSandGrain(content, file)
    } catch {
      return analyzeSandGrain('', file)
    }
  })

  const dirMap = new Map<string, SandGrain[]>()
  for (const grain of grains) {
    const dir = grain.file.includes('/') ? grain.file.slice(0, grain.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(grain)
    } else {
      dirMap.set(dir, [grain])
    }
  }

  const layers: SandLayer[] = Array.from(dirMap.entries()).map(([dir, gs]) =>
    analyzeSandLayer(gs, dir),
  )

  const n = grains.length || 1
  const totalSand = grains.reduce((s, g) => s + g.grainCount, 0)
  const avgGrainSize = Math.round(grains.reduce((s, g) => s + g.grainSize, 0) / n)
  const avgFlowRate = Math.round(grains.reduce((s, g) => s + g.flowRate, 0) / n)
  const avgSandQuality = Math.round(grains.reduce((s, g) => s + g.sandQuality, 0) / n)
  const neckWidth = Math.round(grains.reduce((s, g) => s + g.neck.width, 0) / n)
  const chamberBalance = Math.round(grains.reduce((s, g) => s + g.chamber.balance, 0) / n)
  const totalClogs = grains.reduce((s, g) => s + g.flow.clogPoints.length, 0)
  const totalLeaks = grains.reduce((s, g) => s + g.flow.leakPoints.length, 0)
  const totalBoulders = grains.reduce((s, g) => s + g.grainDistribution.boulders, 0)
  const flowHealth = Math.round((avgFlowRate * 0.3 + avgSandQuality * 0.3 + avgGrainSize * 0.2 + neckWidth * 0.2))

  const hourglass: HourglassStructure = {
    totalSand,
    avgGrainSize,
    avgFlowRate,
    avgSandQuality,
    neckWidth,
    chamberBalance,
    totalClogs,
    totalLeaks,
    totalBoulders,
    flowHealth,
  }

  const avgSmoothness = Math.round(grains.reduce((s, g) => s + g.flow.smoothness, 0) / n)
  const fineGrains = grains.reduce((s, g) => s + g.grainDistribution.fineGrains, 0)
  const mediumGrains = grains.reduce((s, g) => s + g.grainDistribution.mediumGrains, 0)
  const coarseGrains = grains.reduce((s, g) => s + g.grainDistribution.coarseGrains, 0)
  const boulders = totalBoulders
  const dustGrains = grains.reduce((s, g) => s + g.grainDistribution.dust, 0)
  const totalTurbulence = grains.reduce((s, g) => s + g.flow.turbulencePoints.length, 0)
  const totalPooling = grains.reduce((s, g) => s + g.flow.poolingPoints.length, 0)
  const chokedFiles = grains.filter(g => g.neck.isChoked).length
  const balancedFiles = grains.filter(g => g.chamber.isBalanced).length
  const topHeavyFiles = grains.filter(g => g.chamber.isTopHeavy).length
  const bottomHeavyFiles = grains.filter(g => g.chamber.isBottomHeavy).length

  const stats: HourglassGrainStats = {
    totalFiles: files.length,
    totalLayers: layers.length,
    avgGrainSize,
    avgFlowRate,
    avgSandQuality,
    avgSmoothness,
    avgNeckWidth: neckWidth,
    avgChamberBalance: chamberBalance,
    fineGrains,
    mediumGrains,
    coarseGrains,
    boulders,
    dustGrains,
    totalClogs,
    totalLeaks,
    totalTurbulence,
    totalPooling,
    chokedFiles,
    balancedFiles,
    topHeavyFiles,
    bottomHeavyFiles,
    overallFlowHealth: flowHealth,
    timekeeperGrade: classifyTimekeeperGrade(flowHealth),
    bestFlow: grains.length > 0
      ? grains.reduce((b, g) => g.flowRate > b.flowRate ? g : b, grains[0] as typeof grains[number]).file : 'none',
    worstFlow: grains.length > 0
      ? grains.reduce((w, g) => g.flowRate < w.flowRate ? g : w, grains[0] as typeof grains[number]).file : 'none',
    finestGrain: grains.length > 0
      ? grains.reduce((f, g) => g.grainSize > f.grainSize ? g : f, grains[0] as typeof grains[number]).file : 'none',
    coarsestGrain: grains.length > 0
      ? grains.reduce((c, g) => g.grainSize < c.grainSize ? g : c, grains[0] as typeof grains[number]).file : 'none',
    biggestBottleneck: grains.length > 0
      ? grains.reduce((b, g) => g.neck.width < b.neck.width ? g : b, grains[0] as typeof grains[number]).file : 'none',
  }

  const recommendations = generateRecommendations(grains, layers, hourglass, stats)

  return { grains, layers, hourglass, stats, recommendations }
}
