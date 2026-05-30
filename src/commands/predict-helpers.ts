// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Prediction {
  type: 'bug-risk' | 'refactor-needed' | 'breaking-change' | 'tech-debt' | 'performance' | 'dependency-drift'
  confidence: number
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  description: string
  evidence: string[]
  suggestion: string
}

export interface RiskFactor {
  name: string
  file: string
  weight: number
  description: string
}

export interface Forecast {
  file: string
  predictions: Prediction[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  maintenanceScore: number
}

export interface MaintenanceWindow {
  file: string
  estimatedEffort: 'minimal' | 'moderate' | 'significant' | 'major'
  reason: string
  urgency: number
}

export interface PredictStats {
  totalForecasts: number
  lowRiskCount: number
  mediumRiskCount: number
  highRiskCount: number
  criticalRiskCount: number
  avgMaintenanceScore: number
  mostAtRiskFile: string
  safestFile: string
  topRiskType: string
  immediateActionsNeeded: number
  estimatedTechDebtIndex: number
}

export interface PredictResult {
  forecasts: Forecast[]
  riskFactors: RiskFactor[]
  maintenanceWindows: MaintenanceWindow[]
  stats: PredictStats
  recommendations: string[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Count lines of code (non-blank, non-comment).
 *
 * @example
 * countEffectiveLines('const x = 1\n// comment\n\nconst y = 2')
 */
export function countEffectiveLines(content: string): number {
  let count = 0
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
      count++
    }
  }
  return count
}

/**
 * Compute cyclomatic-style complexity from code.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) { while (y) {} } }')
 */
export function computeComplexity(content: string): number {
  const patterns = [/\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\?\s*[^?]/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const matches = content.match(pat)
    if (matches) total += matches.length
  }
  return total
}

/**
 * Measure maximum nesting depth.
 *
 * @example
 * measureNestingDepth('if (x) { if (y) { if (z) {} } }')
 */
export function measureNestingDepth(content: string): number {
  let depth = 0
  let maxDepth = 0
  for (const ch of content) {
    if (ch === '{') {
      depth++
      if (depth > maxDepth) maxDepth = depth
    } else if (ch === '}') {
      depth--
    }
  }
  return maxDepth
}

/**
 * Find functions exceeding a line threshold.
 *
 * @example
 * findLargeFunctions('function big() {\n  // 20 lines\n}', 10)
 */
export function findLargeFunctions(content: string, threshold = 20): { name: string; lines: number }[] {
  const large: { name: string; lines: number }[] = []
  const fnPat = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>)/g
  let m: RegExpExecArray | null
  while ((m = fnPat.exec(content)) !== null) {
    const name = m[1] ?? m[2] ?? 'anonymous'
    const startIdx = m.index
    let depth = 0
    let endIdx = startIdx
    let started = false
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') {
        depth++
        started = true
      } else if (content[i] === '}') {
        depth--
        if (started && depth === 0) {
          endIdx = i
          break
        }
      }
    }
    if (endIdx === startIdx) {
      const arrowIdx = content.indexOf('=>', startIdx)
      if (arrowIdx > -1) {
        endIdx = Math.min(content.indexOf('\n', arrowIdx) > -1 ? content.indexOf('\n', arrowIdx) : content.length, arrowIdx + 200)
      }
    }
    const body = content.substring(startIdx, endIdx)
    const lines = body.split('\n').length
    if (lines >= threshold) {
      large.push({ name, lines })
    }
  }
  return large
}

/**
 * Count TODO/FIXME/HACK/XXX markers.
 *
 * @example
 * countTodoMarkers('// TODO: fix this\n// FIXME: broken')
 */
export function countTodoMarkers(content: string): { type: string; line: number }[] {
  const markers: { type: string; line: number }[] = []
  const pat = /\/\/\s*(TODO|FIXME|HACK|XXX|WORKAROUND)[\s:]/gi
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    let m: RegExpExecArray | null
    const line = lines[i]!
    const localPat = new RegExp(pat.source, 'gi')
    while ((m = localPat.exec(line)) !== null) {
      markers.push({ type: m[1] ?? ''.toUpperCase(), line: i + 1 })
    }
  }
  return markers
}

/**
 * Count exported items.
 *
 * @example
 * countExports('export function foo() {}\nexport const bar = 1')
 */
export function countExports(content: string): number {
  const matches = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  return matches ? matches.length : 0
}

/**
 * Count nested loops.
 *
 * @example
 * countNestedLoops('for (let i = 0; i < 10; i++) { for (let j = 0; j < 10; j++) {} }')
 */
export function countNestedLoops(content: string): number {
  let count = 0
  const lines = content.split('\n')
  let inLoop = false
  for (const line of lines) {
    const hasLoop = /\b(for|while)\b\s*\(/.test(line)
    if (hasLoop && inLoop) count++
    if (hasLoop) inLoop = true
    if (line.includes('}')) inLoop = false
  }
  return count
}

/**
 * Detect synchronous patterns that should be async.
 *
 * @example
 * detectSyncPatterns('const data = fs.readFileSync("file")')
 */
export function detectSyncPatterns(content: string): string[] {
  const syncPatterns: string[] = []
  const pat = /\b(readFileSync|writeFileSync|existsSync|mkdirSync|readdirSync|statSync|copyFileSync|rmSync)\s*\(/g
  let m: RegExpExecArray | null
  while ((m = pat.exec(content)) !== null) {
    syncPatterns.push(m[1] ?? '')
  }
  return syncPatterns
}

/**
 * Detect deprecated API usage.
 *
 * @example
 * detectDeprecatedUsage('// DEPRECATED: use newFunc instead\nfunction oldFunc() {}')
 */
export function detectDeprecatedUsage(content: string): string[] {
  const deprecated: string[] = []
  const pat = /@deprecated|DEPRECATED|\.deprecated\b|\bisDeprecated\b/gi
  let m: RegExpExecArray | null
  while ((m = pat.exec(content)) !== null) {
    const ctx = content.substring(Math.max(0, m.index - 20), Math.min(content.length, m.index + 40)).trim()
    deprecated.push(ctx)
  }
  return deprecated
}

/**
 * Count error handling blocks.
 *
 * @example
 * countErrorHandling('try {} catch (e) {}\ntry {} catch (e) {}')
 */
export function countErrorHandling(content: string): number {
  const matches = content.match(/\bcatch\s*\(/g)
  return matches ? matches.length : 0
}

/**
 * Count import statements.
 *
 * @example
 * countImports("import { a } from 'x'\nimport { b } from 'y'")
 */
export function countImports(content: string): number {
  const matches = content.match(/^import\s+/gm)
  return matches ? matches.length : 0
}

/**
 * Detect `as any` usage.
 *
 * @example
 * countAsAny('const x = {} as any')
 */
export function countAsAny(content: string): number {
  const matches = content.match(/\bas\s+any\b/g)
  return matches ? matches.length : 0
}

// ─── Prediction Functions ─────────────────────────────────────────────────────

/**
 * Predict bug risk for a file.
 *
 * @example
 * predictBugRisk('app.ts', complexContent)
 */
export function predictBugRisk(file: string, content: string): Prediction[] {
  const predictions: Prediction[] = []
  const complexity = computeComplexity(content)
  const nesting = measureNestingDepth(content)
  const errorHandling = countErrorHandling(content)
  const largeFns = findLargeFunctions(content)
  const effectiveLines = countEffectiveLines(content)

  if (complexity > 20) {
    const evidence: string[] = [`Cyclomatic complexity: ${complexity}`]
    if (nesting > 4) evidence.push(`Deep nesting: ${nesting} levels`)
    predictions.push({
      type: 'bug-risk',
      confidence: Math.min(95, 40 + complexity),
      timeframe: complexity > 40 ? 'immediate' : 'short-term',
      description: `High complexity in ${file} increases bug probability`,
      evidence,
      suggestion: 'Break down complex functions into smaller, focused units',
    })
  }

  if (largeFns.length > 0) {
    predictions.push({
      type: 'bug-risk',
      confidence: Math.min(90, 50 + largeFns.length * 10),
      timeframe: 'short-term',
      description: `${largeFns.length} oversized function(s) in ${file}`,
      evidence: largeFns.map((f) => `${f.name}(): ${f.lines} lines`),
      suggestion: 'Extract logic from large functions into helper functions',
    })
  }

  if (effectiveLines > 50 && errorHandling === 0) {
    predictions.push({
      type: 'bug-risk',
      confidence: Math.min(85, 40 + effectiveLines),
      timeframe: 'medium-term',
      description: `No error handling in ${file} (${effectiveLines} effective lines)`,
      evidence: ['0 try-catch blocks found'],
      suggestion: 'Add error handling for critical operations',
    })
  }

  if (nesting > 5) {
    predictions.push({
      type: 'bug-risk',
      confidence: Math.min(80, 30 + nesting * 10),
      timeframe: 'short-term',
      description: `Deep nesting (${nesting} levels) in ${file} increases logic error risk`,
      evidence: [`Maximum nesting depth: ${nesting}`],
      suggestion: 'Flatten nesting with early returns and guard clauses',
    })
  }

  return predictions
}

/**
 * Predict refactoring need for a file.
 *
 * @example
 * predictRefactorNeed('god.ts', hugeContent)
 */
export function predictRefactorNeed(file: string, content: string): Prediction[] {
  const predictions: Prediction[] = []
  const effectiveLines = countEffectiveLines(content)
  const exports = countExports(content)
  const imports = countImports(content)

  if (effectiveLines > 300) {
    predictions.push({
      type: 'refactor-needed',
      confidence: Math.min(95, 40 + Math.floor(effectiveLines / 10)),
      timeframe: effectiveLines > 500 ? 'immediate' : 'medium-term',
      description: `${file} is oversized (${effectiveLines} effective lines)`,
      evidence: [`${effectiveLines} effective lines`, `${exports} exports`],
      suggestion: 'Split into smaller, focused modules',
    })
  }

  if (exports > 10) {
    predictions.push({
      type: 'refactor-needed',
      confidence: Math.min(85, 40 + exports * 5),
      timeframe: 'medium-term',
      description: `God object detected: ${file} exports ${exports} items`,
      evidence: [`${exports} public exports`],
      suggestion: 'Apply Single Responsibility Principle — split responsibilities',
    })
  }

  if (imports > 15) {
    predictions.push({
      type: 'refactor-needed',
      confidence: Math.min(80, 30 + imports * 3),
      timeframe: 'long-term',
      description: `High coupling: ${file} imports from ${imports} modules`,
      evidence: [`${imports} import statements`],
      suggestion: 'Reduce dependencies by consolidating related imports',
    })
  }

  return predictions
}

/**
 * Predict breaking change risk.
 *
 * @example
 * predictBreakingChange('api.ts', exportedContent)
 */
export function predictBreakingChange(file: string, content: string): Prediction[] {
  const predictions: Prediction[] = []
  const exports = countExports(content)
  const asAny = countAsAny(content)

  if (exports > 5) {
    predictions.push({
      type: 'breaking-change',
      confidence: Math.min(75, 20 + exports * 5),
      timeframe: 'medium-term',
      description: `${exports} exports in ${file} — changes likely to break consumers`,
      evidence: [`${exports} exported items`],
      suggestion: 'Stabilize public API with types and versioning',
    })
  }

  if (asAny > 0) {
    predictions.push({
      type: 'breaking-change',
      confidence: Math.min(70, 30 + asAny * 15),
      timeframe: 'short-term',
      description: `${asAny} 'as any' cast(s) in ${file} weaken type safety`,
      evidence: [`${asAny} unsafe type cast(s)`],
      suggestion: 'Replace `as any` with proper type definitions',
    })
  }

  return predictions
}

/**
 * Predict tech debt accumulation.
 *
 * @example
 * predictTechDebt('legacy.ts', debtContent)
 */
export function predictTechDebt(file: string, content: string): Prediction[] {
  const predictions: Prediction[] = []
  const markers = countTodoMarkers(content)
  const deprecated = detectDeprecatedUsage(content)

  const todoCount = markers.filter((m) => m.type === 'TODO').length
  const fixmeCount = markers.filter((m) => m.type === 'FIXME').length
  const hackCount = markers.filter((m) => m.type === 'HACK' || m.type === 'XXX' || m.type === 'WORKAROUND').length
  const totalMarkers = markers.length

  if (fixmeCount > 0) {
    predictions.push({
      type: 'tech-debt',
      confidence: Math.min(90, 50 + fixmeCount * 15),
      timeframe: 'immediate',
      description: `${fixmeCount} FIXME(s) in ${file} indicate known issues`,
      evidence: markers.filter((m) => m.type === 'FIXME').map((m) => `Line ${m.line}`),
      suggestion: 'Address FIXME items before they become bugs',
    })
  }

  if (hackCount > 0) {
    predictions.push({
      type: 'tech-debt',
      confidence: Math.min(85, 40 + hackCount * 20),
      timeframe: 'short-term',
      description: `${hackCount} hack/workaround(s) in ${file}`,
      evidence: markers.filter((m) => m.type === 'HACK' || m.type === 'XXX' || m.type === 'WORKAROUND').map((m) => `Line ${m.line}: ${m.type}`),
      suggestion: 'Replace workarounds with proper implementations',
    })
  }

  if (todoCount > 3) {
    predictions.push({
      type: 'tech-debt',
      confidence: Math.min(70, 30 + todoCount * 10),
      timeframe: 'medium-term',
      description: `${todoCount} TODOs in ${file} — growing tech debt`,
      evidence: [`Total TODO markers: ${todoCount}`],
      suggestion: 'Create a plan to resolve TODOs systematically',
    })
  }

  if (deprecated.length > 0) {
    predictions.push({
      type: 'tech-debt',
      confidence: Math.min(80, 40 + deprecated.length * 10),
      timeframe: 'short-term',
      description: `${deprecated.length} deprecated usage(s) in ${file}`,
      evidence: deprecated.slice(0, 3),
      suggestion: 'Migrate away from deprecated APIs',
    })
  }

  if (totalMarkers === 0 && deprecated.length === 0) {
    return predictions
  }

  return predictions
}

/**
 * Predict performance issues.
 *
 * @example
 * predictPerformance('slow.ts', loopContent)
 */
export function predictPerformance(file: string, content: string): Prediction[] {
  const predictions: Prediction[] = []
  const nestedLoops = countNestedLoops(content)
  const syncPatterns = detectSyncPatterns(content)

  if (nestedLoops > 0) {
    predictions.push({
      type: 'performance',
      confidence: Math.min(85, 40 + nestedLoops * 20),
      timeframe: 'short-term',
      description: `${nestedLoops} nested loop(s) in ${file} — O(n²) risk`,
      evidence: [`${nestedLoops} nested loop structure(s)`],
      suggestion: 'Optimize with Map/Set lookups or algorithmic improvements',
    })
  }

  if (syncPatterns.length > 0) {
    predictions.push({
      type: 'performance',
      confidence: Math.min(80, 40 + syncPatterns.length * 10),
      timeframe: 'medium-term',
      description: `Blocking I/O: ${syncPatterns.length} synchronous call(s) in ${file}`,
      evidence: syncPatterns,
      suggestion: 'Replace synchronous I/O with async alternatives',
    })
  }

  return predictions
}

/**
 * Predict dependency drift.
 *
 * @example
 * predictDependencyDrift('old.ts', legacyContent)
 */
export function predictDependencyDrift(file: string, content: string): Prediction[] {
  const predictions: Prediction[] = []
  const deprecated = detectDeprecatedUsage(content)

  const requireStyle = content.match(/\brequire\s*\(/g)
  if (requireStyle && requireStyle.length > 2) {
    predictions.push({
      type: 'dependency-drift',
      confidence: Math.min(65, 30 + requireStyle.length * 5),
      timeframe: 'long-term',
      description: `${requireStyle.length} CommonJS require(s) in ${file}`,
      evidence: [`${requireStyle.length} require() calls`],
      suggestion: 'Migrate to ES module imports for consistency',
    })
  }

  if (deprecated.length > 0) {
    const alreadyHasTechDebt = predictions.length > 0
    if (!alreadyHasTechDebt) {
      predictions.push({
        type: 'dependency-drift',
        confidence: Math.min(60, 30 + deprecated.length * 10),
        timeframe: 'long-term',
        description: `Deprecated API usage in ${file} may indicate outdated dependencies`,
        evidence: deprecated.slice(0, 2),
        suggestion: 'Update to current API patterns',
      })
    }
  }

  return predictions
}

// ─── Aggregation ───────────────────────────────────────────────────────────────

/**
 * Compute risk level from predictions.
 *
 * @example
 * computeRiskLevel(predictions)
 */
export function computeRiskLevel(predictions: Prediction[]): 'low' | 'medium' | 'high' | 'critical' {
  if (predictions.length === 0) return 'low'
  const maxConf = Math.max(...predictions.map((p) => p.confidence))
  const immediates = predictions.filter((p) => p.timeframe === 'immediate').length
  if (maxConf >= 80 || immediates >= 3) return 'critical'
  if (maxConf >= 60 || immediates >= 1) return 'high'
  if (maxConf >= 40 || predictions.length >= 3) return 'medium'
  return 'low'
}

/**
 * Compute maintenance score (100 = low maintenance).
 *
 * @example
 * computeMaintenanceScore(predictions)
 */
export function computeMaintenanceScore(predictions: Prediction[]): number {
  if (predictions.length === 0) return 100
  let score = 100
  for (const p of predictions) {
    const weight = p.timeframe === 'immediate' ? 1.0 : p.timeframe === 'short-term' ? 0.7 : p.timeframe === 'medium-term' ? 0.4 : 0.2
    score -= (p.confidence / 100) * 15 * weight
  }
  return Math.max(0, Math.round(score))
}

/**
 * Estimate effort from predictions.
 *
 * @example
 * estimateEffort(predictions)
 */
export function estimateEffort(predictions: Prediction[]): 'minimal' | 'moderate' | 'significant' | 'major' {
  const totalWeight = predictions.reduce((sum, p) => {
    const w = p.timeframe === 'immediate' ? 4 : p.timeframe === 'short-term' ? 3 : p.timeframe === 'medium-term' ? 2 : 1
    return sum + w * (p.confidence / 100)
  }, 0)
  if (totalWeight >= 5) return 'major'
  if (totalWeight >= 3) return 'significant'
  if (totalWeight >= 1.5) return 'moderate'
  return 'minimal'
}

/**
 * Compute tech debt index (0 = clean, 100 = max debt).
 *
 * @example
 * computeTechDebtIndex(forecasts)
 */
export function computeTechDebtIndex(forecasts: Forecast[]): number {
  if (forecasts.length === 0) return 0
  let totalDebt = 0
  for (const f of forecasts) {
    const debtPreds = f.predictions.filter((p) => p.type === 'tech-debt')
    for (const p of debtPreds) {
      totalDebt += p.confidence * 0.3
    }
    const otherHighConf = f.predictions.filter((p) => p.type !== 'tech-debt' && p.confidence > 70)
    totalDebt += otherHighConf.length * 5
  }
  return Math.min(100, Math.round(totalDebt / Math.max(1, forecasts.length) * 1.5))
}

// ─── Build Forecast ────────────────────────────────────────────────────────────

/**
 * Build a single file forecast.
 *
 * @example
 * buildForecast('app.ts', content)
 */
export function buildForecast(file: string, content: string): Forecast {
  const predictions: Prediction[] = [
    ...predictBugRisk(file, content),
    ...predictRefactorNeed(file, content),
    ...predictBreakingChange(file, content),
    ...predictTechDebt(file, content),
    ...predictPerformance(file, content),
    ...predictDependencyDrift(file, content),
  ]
  return {
    file,
    predictions,
    riskLevel: computeRiskLevel(predictions),
    maintenanceScore: computeMaintenanceScore(predictions),
  }
}

/**
 * Build risk factors from forecasts.
 *
 * @example
 * buildRiskFactors(forecasts)
 */
export function buildRiskFactors(forecasts: Forecast[]): RiskFactor[] {
  const factors: RiskFactor[] = []
  for (const f of forecasts) {
    for (const p of f.predictions) {
      if (p.confidence >= 60) {
        factors.push({
          name: p.type,
          file: f.file,
          weight: Math.min(10, Math.round(p.confidence / 10)),
          description: p.description,
        })
      }
    }
  }
  return factors.sort((a, b) => b.weight - a.weight)
}

/**
 * Build maintenance windows from forecasts.
 *
 * @example
 * buildMaintenanceWindows(forecasts)
 */
export function buildMaintenanceWindows(forecasts: Forecast[]): MaintenanceWindow[] {
  return forecasts
    .filter((f) => f.predictions.length > 0)
    .map((f) => ({
      file: f.file,
      estimatedEffort: estimateEffort(f.predictions),
      reason: f.predictions[0]!.description,
      urgency: Math.round(f.predictions.reduce((s, p) => s + p.confidence, 0) / f.predictions.length),
    }))
    .sort((a, b) => b.urgency - a.urgency)
}

/**
 * Build stats from forecasts.
 *
 * @example
 * buildStats(forecasts)
 */
export function buildStats(forecasts: Forecast[]): PredictStats {
  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const f of forecasts) {
    riskCounts[f.riskLevel]++
  }

  const typeCounts: Record<string, number> = {}
  let immediateActions = 0
  for (const f of forecasts) {
    for (const p of f.predictions) {
      typeCounts[p.type] = (typeCounts[p.type] ?? 0) + 1
      if (p.timeframe === 'immediate') immediateActions++
    }
  }

  const topRiskType = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'none'

  const avgScore = forecasts.length > 0
    ? Math.round(forecasts.reduce((s, f) => s + f.maintenanceScore, 0) / forecasts.length)
    : 100

  const sortedByRisk = [...forecasts].sort((a, b) => a.maintenanceScore - b.maintenanceScore)
  const mostAtRisk = sortedByRisk[0]?.file ?? 'none'
  const safest = sortedByRisk[sortedByRisk.length - 1]?.file ?? 'none'

  return {
    totalForecasts: forecasts.length,
    lowRiskCount: riskCounts.low,
    mediumRiskCount: riskCounts.medium,
    highRiskCount: riskCounts.high,
    criticalRiskCount: riskCounts.critical,
    avgMaintenanceScore: avgScore,
    mostAtRiskFile: mostAtRisk,
    safestFile: safest,
    topRiskType,
    immediateActionsNeeded: immediateActions,
    estimatedTechDebtIndex: computeTechDebtIndex(forecasts),
  }
}

/**
 * Generate recommendations from analysis.
 *
 * @example
 * generateRecommendations(forecasts, riskFactors, stats)
 */
export function generateRecommendations(forecasts: Forecast[], riskFactors: RiskFactor[], stats: PredictStats): string[] {
  const recs: string[] = []

  if (stats.criticalRiskCount > 0) {
    recs.push(`Address ${stats.criticalRiskCount} critical-risk file(s) immediately`)
  }

  if (stats.immediateActionsNeeded > 0) {
    recs.push(`${stats.immediateActionsNeeded} prediction(s) require immediate action`)
  }

  const bugRiskFiles = forecasts.filter((f) => f.predictions.some((p) => p.type === 'bug-risk'))
  if (bugRiskFiles.length > 0) {
    recs.push(`Review ${bugRiskFiles.length} file(s) flagged for bug risk`)
  }

  const refactorFiles = forecasts.filter((f) => f.predictions.some((p) => p.type === 'refactor-needed'))
  if (refactorFiles.length > 0) {
    recs.push(`Plan refactoring for ${refactorFiles.length} oversized/high-coupling file(s)`)
  }

  const techDebtFiles = forecasts.filter((f) => f.predictions.some((p) => p.type === 'tech-debt'))
  if (techDebtFiles.length > 0) {
    recs.push(`Reduce tech debt in ${techDebtFiles.length} file(s) with FIXMEs and workarounds`)
  }

  const perfFiles = forecasts.filter((f) => f.predictions.some((p) => p.type === 'performance'))
  if (perfFiles.length > 0) {
    recs.push(`Optimize performance in ${perfFiles.length} file(s) with nested loops or sync I/O`)
  }

  const topFactors = riskFactors.slice(0, 3)
  if (topFactors.length > 0) {
    recs.push(`Top risk: ${topFactors.map((f) => f.file).join(', ')}`)
  }

  if (stats.estimatedTechDebtIndex > 50) {
    recs.push(`Tech debt index is ${stats.estimatedTechDebtIndex}/100 — consider a dedicated sprint`)
  }

  if (recs.length === 0) {
    recs.push('Codebase looks healthy — no significant risks predicted')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete predict result from files and contents.
 *
 * @example
 * buildPredictResult(['a.ts'], [content])
 */
export function buildPredictResult(files: string[], contents: string[]): PredictResult {
  const forecasts = files.map((f, i) => buildForecast(f, contents[i] ?? ''))
  const riskFactors = buildRiskFactors(forecasts)
  const maintenanceWindows = buildMaintenanceWindows(forecasts)
  const stats = buildStats(forecasts)
  const recommendations = generateRecommendations(forecasts, riskFactors, stats)

  return { forecasts, riskFactors, maintenanceWindows, stats, recommendations }
}
