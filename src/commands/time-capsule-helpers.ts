// ─── Types ─────────────────────────────────────────────────────────────────────

export type MaturityLevel = 'infant' | 'child' | 'adolescent' | 'adult' | 'elder'

export type TrendDirection = 'improving' | 'stable' | 'declining'

export interface Snapshot {
  timestamp: string
  version: string
  summary: string
}

export interface CurrentState {
  health: number
  maturity: MaturityLevel
  personality: string[]
  strengths: string[]
  weaknesses: string[]
  achievements: string[]
  concerns: string[]
}

export interface GrowthMetrics {
  totalLines: number
  totalFiles: number
  totalFunctions: number
  totalExports: number
  avgComplexity: number
  avgDocumentation: number
  testRatio: number
  dependencyRatio: number
  couplingIndex: number
  consistencyScore: number
}

export interface TrendIndicator {
  metric: string
  direction: TrendDirection
  velocity: number
  confidence: number
}

export interface Prediction {
  category: string
  prediction: string
  confidence: number
  timeframe: string
  basis: string
}

export interface CapsuleStats {
  capsuleDate: string
  codebaseAge: number
  commitCount: number
  authorCount: number
  linesPerDay: number
  filesPerWeek: number
  healthTrend: string
  maturityIndex: number
  consistencyIndex: number
  resilienceScore: number
}

export interface TimeCapsuleResult {
  snapshot: Snapshot
  state: CurrentState
  metrics: GrowthMetrics
  trends: TrendIndicator[]
  predictions: Prediction[]
  stats: CapsuleStats
  recommendations: string[]
}

// ─── Content Analysis Helpers ──────────────────────────────────────────────────

/**
 * Count lines in content.
 *
 * @example
 * countLines('a\nb\nc')
 */
export function countLines(content: string): number {
  return content.split('\n').length
}

/**
 * Count functions in content.
 *
 * @example
 * countFunctions('function foo() {} function bar() {}')
 */
export function countFunctions(content: string): number {
  const funcMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+\w+/g) || []
  const arrowMatches = content.match(/(?:const|let)\s+\w+\s*=\s*(?:\([^)]*\)|[^=])\s*=>\s*{/g) || []
  return funcMatches.length + arrowMatches.length
}

/**
 * Count exports in content.
 *
 * @example
 * countExports('export const x = 1')
 */
export function countExports(content: string): number {
  const named = (content.match(/export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+\w+/g) || []).length
  const destructured = (content.match(/export\s+\{[^}]+\}/g) || []).length
  return named + destructured
}

/**
 * Count imports in content.
 *
 * @example
 * countImports('import { x } from "y"')
 */
export function countImports(content: string): number {
  return (content.match(/import\s+/g) || []).length
}

/**
 * Compute cyclomatic complexity of content.
 *
 * @example
 * computeComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeComplexity(content: string): number {
  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b|\bcatch\b|\?:/g) || []).length
  return Math.max(1, branches + 1)
}

/**
 * Compute documentation density (0-100).
 *
 * @example
 * computeDocumentation('/* doc *\/\nfunction foo() {}')
 */
export function computeDocumentation(content: string): number {
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0
  const docLines = lines.filter((l) =>
    l.trim().startsWith('/**') ||
    l.trim().startsWith('*') ||
    l.trim().startsWith('//') ||
    l.trim().startsWith('*/'),
  ).length
  return Math.min(100, Math.round((docLines / total) * 100))
}

/**
 * Check if file is a test file.
 *
 * @example
 * isTestFile('foo.test.ts')
 */
export function isTestFile(file: string): boolean {
  return /\.(test|spec)\.[jt]sx?$/.test(file)
}

// ─── Capture Snapshot ──────────────────────────────────────────────────────────

/**
 * Capture a timestamp snapshot.
 *
 * @example
 * captureSnapshot(5, '1.0.0')
 */
export function captureSnapshot(totalFiles: number, version: string): Snapshot {
  const timestamp = new Date().toISOString()
  const summary = `Time capsule of a codebase with ${totalFiles} files, captured on ${timestamp.split('T')[0]}.`
  return { timestamp, version, summary }
}

// ─── Assess Current State ──────────────────────────────────────────────────────

/**
 * Assess the current state of the codebase.
 *
 * @example
 * assessCurrentState(files, contents)
 */
export function assessCurrentState(files: string[], contents: string[]): CurrentState {
  const metrics = measureGrowth(files, contents)

  const health = computeHealth(metrics)
  const maturity = classifyMaturity(0, files.length, metrics.avgComplexity)
  const personality = identifyPersonality(metrics, contents)
  const scores = computeAreaScores(metrics, contents)

  const strengths: string[] = []
  const weaknesses: string[] = []
  const achievements: string[] = []
  const concerns: string[] = []

  for (const [area, score] of Object.entries(scores)) {
    if (score > 75) strengths.push(`${area} (${score}%)`)
    if (score < 40) weaknesses.push(`${area} (${score}%)`)
    if (score > 85) achievements.push(`Excellent ${area.toLowerCase()} at ${score}%`)
  }

  if (metrics.couplingIndex > 70) concerns.push('High coupling between modules')
  if (metrics.testRatio < 0.2) concerns.push('Low test coverage ratio')
  if (metrics.avgDocumentation < 20) concerns.push('Insufficient documentation')
  if (metrics.avgComplexity > 10) concerns.push('High average complexity')
  if (metrics.consistencyScore < 50) concerns.push('Inconsistent coding patterns')

  if (concerns.length === 0) concerns.push('No major concerns identified')
  if (achievements.length === 0) achievements.push('Codebase meets baseline quality standards')

  return {
    health,
    maturity,
    personality: personality.slice(0, 5),
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    achievements: achievements.slice(0, 5),
    concerns: concerns.slice(0, 5),
  }
}

function computeHealth(metrics: GrowthMetrics): number {
  const docScore = metrics.avgDocumentation
  const testScore = Math.min(100, metrics.testRatio * 200)
  const complexityScore = Math.max(0, 100 - metrics.avgComplexity * 5)
  const consistency = metrics.consistencyScore
  return Math.round(
    docScore * 0.2 +
    testScore * 0.25 +
    complexityScore * 0.25 +
    consistency * 0.3,
  )
}

function identifyPersonality(metrics: GrowthMetrics, contents: string[]): string[] {
  const traits: string[] = []
  if (metrics.totalExports > metrics.totalFiles * 2) traits.push('Export-rich')
  if (metrics.testRatio > 0.5) traits.push('Test-oriented')
  if (metrics.avgDocumentation > 30) traits.push('Well-documented')
  if (metrics.avgComplexity > 8) traits.push('Complex')
  if (metrics.avgComplexity <= 3) traits.push('Simple')
  if (metrics.couplingIndex > 60) traits.push('Tightly-coupled')
  if (metrics.couplingIndex < 30) traits.push('Loosely-coupled')
  if (metrics.dependencyRatio > 5) traits.push('Import-heavy')
  if (metrics.dependencyRatio < 2) traits.push('Self-contained')

  const asyncCount = contents.reduce((s, c) => s + (c.match(/\basync\b|\bawait\b/g) || []).length, 0)
  if (asyncCount > contents.length * 3) traits.push('Async-heavy')

  if (traits.length < 3) traits.push('Balanced')
  return traits
}

function computeAreaScores(metrics: GrowthMetrics, _contents: string[]): Record<string, number> {
  return {
    Documentation: metrics.avgDocumentation,
    Testing: Math.min(100, Math.round(metrics.testRatio * 200)),
    Complexity: Math.max(0, 100 - metrics.avgComplexity * 5),
    Consistency: metrics.consistencyScore,
    Coupling: Math.max(0, 100 - metrics.couplingIndex),
    Modularity: Math.min(100, Math.round(metrics.totalExports / Math.max(1, metrics.totalFiles) * 30)),
  }
}

// ─── Measure Growth ────────────────────────────────────────────────────────────

/**
 * Measure growth metrics from files.
 *
 * @example
 * measureGrowth(files, contents)
 */
export function measureGrowth(files: string[], contents: string[]): GrowthMetrics {
  const totalLines = contents.reduce((s, c) => s + countLines(c), 0)
  const totalFunctions = contents.reduce((s, c) => s + countFunctions(c), 0)
  const totalExports = contents.reduce((s, c) => s + countExports(c), 0)
  const totalImports = contents.reduce((s, c) => s + countImports(c), 0)

  const complexities = contents.map((c) => computeComplexity(c))
  const avgComplexity = complexities.length > 0
    ? Math.round(complexities.reduce((a, b) => a + b, 0) / complexities.length * 10) / 10
    : 0

  const docScores = contents.map((c) => computeDocumentation(c))
  const avgDocumentation = docScores.length > 0
    ? Math.round(docScores.reduce((a, b) => a + b, 0) / docScores.length)
    : 0

  const testFiles = files.filter((f) => isTestFile(f)).length
  const testRatio = files.length > 0 ? Math.round((testFiles / files.length) * 100) / 100 : 0

  const dependencyRatio = files.length > 0
    ? Math.round((totalImports / files.length) * 10) / 10
    : 0

  const couplingIndex = computeCouplingIndex(contents)
  const consistencyScore = computeConsistencyIndex(contents)

  return {
    totalLines,
    totalFiles: files.length,
    totalFunctions,
    totalExports,
    avgComplexity,
    avgDocumentation,
    testRatio,
    dependencyRatio,
    couplingIndex,
    consistencyScore,
  }
}

/**
 * Compute coupling index (0-100).
 *
 * @example
 * computeCouplingIndex(contents)
 */
export function computeCouplingIndex(contents: string[]): number {
  if (contents.length === 0) return 0
  const importCounts = contents.map((c) => countImports(c))
  const avgImports = importCounts.reduce((a, b) => a + b, 0) / importCounts.length
  return Math.min(100, Math.round(avgImports * 10))
}

/**
 * Compute consistency index (0-100).
 *
 * @example
 * computeConsistencyIndex(contents)
 */
export function computeConsistencyIndex(contents: string[]): number {
  if (contents.length < 2) return contents.length === 1 ? 80 : 0

  const patterns = contents.map((c) => {
    const hasSemicolons = /;$/.test(c.trim().split('\n').filter((l) => l.trim().length > 0).pop() ?? '')
    const usesExport = /export\s/.test(c)
    const usesTypes = /:\s*(string|number|boolean|void)/.test(c)
    const usesJSDoc = /\/\*\*/.test(c)
    return { hasSemicolons, usesExport, usesTypes, usesJSDoc }
  })

  const semicolonRatio = patterns.filter((p) => p.hasSemicolons).length / patterns.length
  const exportRatio = patterns.filter((p) => p.usesExport).length / patterns.length
  const typeRatio = patterns.filter((p) => p.usesTypes).length / patterns.length
  const jsdocRatio = patterns.filter((p) => p.usesJSDoc).length / patterns.length

  const semicolonScore = Math.min(100, semicolonRatio > 0.5 ? semicolonRatio * 100 : (1 - semicolonRatio) * 100)
  const consistency = (semicolonScore + exportRatio * 100 + typeRatio * 100 + jsdocRatio * 100) / 4

  return Math.round(Math.min(100, consistency))
}

// ─── Classify Maturity ─────────────────────────────────────────────────────────

/**
 * Classify codebase maturity level.
 *
 * @example
 * classifyMaturity(100, 50, 5)
 */
export function classifyMaturity(age: number, size: number, sophistication: number): MaturityLevel {
  if (age > 730) return 'elder'
  if (size > 500) return 'elder'
  if (size <= 5 && sophistication <= 3) return 'infant'
  if (size <= 20 && sophistication <= 5) return 'child'
  if (size <= 100 || age < 180) return 'adolescent'
  return 'adult'
}

/**
 * Compute maturity index (0-100).
 *
 * @example
 * computeMaturityIndex(100, 50, 5)
 */
export function computeMaturityIndex(age: number, size: number, complexity: number): number {
  const ageScore = Math.min(40, age / 10)
  const sizeScore = Math.min(30, size / 10)
  const complexityScore = Math.min(30, complexity * 3)
  return Math.round(Math.min(100, ageScore + sizeScore + complexityScore))
}

// ─── Resilience ────────────────────────────────────────────────────────────────

/**
 * Compute resilience score (ability to handle change).
 *
 * @example
 * computeResilience(metrics, state)
 */
export function computeResilience(metrics: GrowthMetrics, state: CurrentState): number {
  const testBonus = Math.min(30, metrics.testRatio * 60)
  const docBonus = Math.min(20, metrics.avgDocumentation * 0.4)
  const consistencyBonus = metrics.consistencyScore * 0.2
  const healthBonus = state.health * 0.3
  return Math.round(Math.min(100, testBonus + docBonus + consistencyBonus + healthBonus))
}

// ─── Trends & Predictions ──────────────────────────────────────────────────────

/**
 * Analyze trends from current metrics.
 *
 * @example
 * analyzeTrends(metrics)
 */
export function analyzeTrends(metrics: GrowthMetrics): TrendIndicator[] {
  const trends: TrendIndicator[] = []

  trends.push({
    metric: 'Complexity',
    direction: metrics.avgComplexity > 8 ? 'declining' : metrics.avgComplexity < 4 ? 'improving' : 'stable',
    velocity: metrics.avgComplexity > 8 ? -2 : metrics.avgComplexity < 4 ? 2 : 0,
    confidence: 60,
  })

  trends.push({
    metric: 'Documentation',
    direction: metrics.avgDocumentation > 30 ? 'improving' : metrics.avgDocumentation < 15 ? 'declining' : 'stable',
    velocity: metrics.avgDocumentation > 30 ? 3 : metrics.avgDocumentation < 15 ? -2 : 0,
    confidence: 55,
  })

  trends.push({
    metric: 'Test Coverage',
    direction: metrics.testRatio > 0.4 ? 'improving' : metrics.testRatio < 0.15 ? 'declining' : 'stable',
    velocity: metrics.testRatio > 0.4 ? 2 : metrics.testRatio < 0.15 ? -3 : 0,
    confidence: 50,
  })

  trends.push({
    metric: 'Coupling',
    direction: metrics.couplingIndex < 30 ? 'improving' : metrics.couplingIndex > 60 ? 'declining' : 'stable',
    velocity: metrics.couplingIndex < 30 ? 2 : metrics.couplingIndex > 60 ? -2 : 0,
    confidence: 55,
  })

  trends.push({
    metric: 'Consistency',
    direction: metrics.consistencyScore > 70 ? 'improving' : metrics.consistencyScore < 40 ? 'declining' : 'stable',
    velocity: metrics.consistencyScore > 70 ? 1 : metrics.consistencyScore < 40 ? -1 : 0,
    confidence: 65,
  })

  return trends
}

/**
 * Generate predictions from state and trends.
 *
 * @example
 * generatePredictions(state, metrics, trends)
 */
export function generatePredictions(
  state: CurrentState,
  metrics: GrowthMetrics,
  trends: TrendIndicator[],
): Prediction[] {
  const predictions: Prediction[] = []

  const complexityTrend = trends.find((t) => t.metric === 'Complexity')
  if (complexityTrend?.direction === 'declining') {
    predictions.push({
      category: 'Maintenance',
      prediction: 'Rising complexity will require refactoring within 2-3 months',
      confidence: 70,
      timeframe: '2-3 months',
      basis: `Average complexity is ${metrics.avgComplexity} and trending upward`,
    })
  }

  const testTrend = trends.find((t) => t.metric === 'Test Coverage')
  if (testTrend?.direction === 'declining') {
    predictions.push({
      category: 'Risk',
      prediction: 'Declining test ratio increases regression risk',
      confidence: 65,
      timeframe: '1-2 months',
      basis: `Test ratio is ${metrics.testRatio} — below recommended threshold`,
    })
  }

  if (state.health > 70) {
    predictions.push({
      category: 'Growth',
      prediction: 'Codebase is healthy enough to sustain feature development',
      confidence: 80,
      timeframe: '6+ months',
      basis: `Health score is ${state.health}% — above the sustainability threshold`,
    })
  }

  if (metrics.avgDocumentation > 40) {
    predictions.push({
      category: 'Onboarding',
      prediction: 'New developers can onboard faster due to good documentation',
      confidence: 75,
      timeframe: 'Ongoing',
      basis: `Documentation density is ${metrics.avgDocumentation}%`,
    })
  }

  if (metrics.couplingIndex > 60) {
    predictions.push({
      category: 'Architecture',
      prediction: 'High coupling will slow down independent module development',
      confidence: 70,
      timeframe: '3-6 months',
      basis: `Coupling index is ${metrics.couplingIndex}%`,
    })
  }

  if (predictions.length === 0) {
    predictions.push({
      category: 'Stability',
      prediction: 'Codebase shows balanced metrics with no immediate risks',
      confidence: 60,
      timeframe: 'Ongoing',
      basis: 'All metrics within normal ranges',
    })
  }

  return predictions
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate time capsule recommendations.
 *
 * @example
 * generateRecommendations(state, metrics, trends, predictions)
 */
export function generateRecommendations(
  state: CurrentState,
  _metrics: GrowthMetrics,
  trends: TrendIndicator[],
  predictions: Prediction[],
): string[] {
  const recs: string[] = []

  const decliningTrends = trends.filter((t) => t.direction === 'declining')
  if (decliningTrends.length > 0) {
    recs.push(`Address declining trends: ${decliningTrends.map((t) => t.metric).join(', ')}`)
  }

  if (state.strengths.length > 0) {
    recs.push(`Leverage strengths: ${state.strengths.slice(0, 2).join(', ')}`)
  }

  if (state.weaknesses.length > 0) {
    recs.push(`Improve weaknesses: ${state.weaknesses.slice(0, 2).join(', ')}`)
  }

  const highConfidencePredictions = predictions.filter((p) => p.confidence > 65)
  if (highConfidencePredictions.length > 0) {
    recs.push(`Prepare for: ${    recs.push(`Prepare for: ${highConfidencePredictions[0]?.prediction}`)}`)
  }

  if (state.health < 50) {
    recs.push('Codebase health is below recommended — prioritize quality improvements')
  }

  if (state.health > 75) {
    recs.push(`Health is ${state.health}% — maintain current practices and plan next growth phase`)
  }

  if (recs.length === 0) {
    recs.push('Codebase is in good shape — continue current development practices')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete time capsule result.
 *
 * @example
 * buildTimeCapsuleResult(['a.ts'], ['code'], {})
 */
export function buildTimeCapsuleResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TimeCapsuleResult {
  const version = (options.version as string) ?? '0.0.0'

  if (files.length === 0) {
    const emptyMetrics: GrowthMetrics = {
      totalLines: 0, totalFiles: 0, totalFunctions: 0, totalExports: 0,
      avgComplexity: 0, avgDocumentation: 0, testRatio: 0, dependencyRatio: 0,
      couplingIndex: 0, consistencyScore: 0,
    }
    const emptyState: CurrentState = {
      health: 0, maturity: 'infant', personality: [], strengths: [], weaknesses: [],
      achievements: [], concerns: ['No files to analyze'],
    }
    const emptyStats: CapsuleStats = {
      capsuleDate: new Date().toISOString().split('T')[0] ?? '', codebaseAge: 0, commitCount: 0,
      authorCount: 0, linesPerDay: 0, filesPerWeek: 0, healthTrend: 'unknown',
      maturityIndex: 0, consistencyIndex: 0, resilienceScore: 0,
    }
    return {
      snapshot: captureSnapshot(0, version),
      state: emptyState,
      metrics: emptyMetrics,
      trends: [],
      predictions: [],
      stats: emptyStats,
      recommendations: ['No files to analyze'],
    }
  }

  const snapshot = captureSnapshot(files.length, version)
  const metrics = measureGrowth(files, contents)
  const state = assessCurrentState(files, contents)
  const trends = analyzeTrends(metrics)
  const predictions = generatePredictions(state, metrics, trends)

  const maturityIndex = computeMaturityIndex(0, files.length, metrics.avgComplexity)
  const consistencyIndex = metrics.consistencyScore
  const resilienceScore = computeResilience(metrics, state)
  const decliningCount = trends.filter((t) => t.direction === 'declining').length
  const healthTrend = decliningCount > 2 ? 'declining' : decliningCount === 0 ? 'improving' : 'stable'

  const stats: CapsuleStats = {
    capsuleDate: snapshot.timestamp.split('T')[0] ?? '',
    codebaseAge: 0,
    commitCount: 0,
    authorCount: 0,
    linesPerDay: 0,
    filesPerWeek: 0,
    healthTrend,
    maturityIndex,
    consistencyIndex,
    resilienceScore,
  }

  const recommendations = generateRecommendations(state, metrics, trends, predictions)

  return { snapshot, state, metrics, trends, predictions, stats, recommendations }
}
