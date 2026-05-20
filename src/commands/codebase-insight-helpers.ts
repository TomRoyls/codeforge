// ─── Types ─────────────────────────────────────────────────────────────────────

export type InsightCategory = 'surprising' | 'hidden-pattern' | 'correlation' | 'paradox' | 'opportunity' | 'warning'

export interface Insight {
  id: string
  title: string
  category: InsightCategory
  description: string
  evidence: string[]
  confidence: number
  impact: number
  actionItems: string[]
}

export interface Dimension {
  name: string
  value: number
  files: Map<string, number>
}

export interface Correlation {
  dimensionA: string
  dimensionB: string
  strength: number
  description: string
  surprising: boolean
}

export interface InsightStats {
  totalInsights: number
  surprisingCount: number
  hiddenPatternCount: number
  correlationCount: number
  strongCorrelations: number
  wisdomScore: number
  deepestInsight: string
  blindSpots: number
}

export interface CodebaseInsightResult {
  insights: Insight[]
  correlations: Correlation[]
  dimensions: Dimension[]
  stats: InsightStats
  recommendations: string[]
}

// ─── Per-File Metrics ──────────────────────────────────────────────────────────

export interface FileMetrics {
  file: string
  complexity: number
  size: number
  coupling: number
  documentation: number
  errorHandling: number
  exports: number
  testIndicator: number
}

/**
 * Measure file metrics for a single file.
 *
 * @example
 * measureFile('a.ts', content)
 */
export function measureFile(file: string, content: string): FileMetrics {
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  const imports = (content.match(/^import\s+/gm) || []).length
  const exportCount = (content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm) || []).length
  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const catches = (content.match(/\bcatch\s*\(/g) || []).length
  const functions = (content.match(/\bfunction\b|=>\s*[{(]/g) || []).length

  const ifPat = (content.match(/\bif\b/g) || []).length
  const forPat = (content.match(/\bfor\b/g) || []).length
  const whilePat = (content.match(/\bwhile\b/g) || []).length
  const switchPat = (content.match(/\bswitch\b/g) || []).length
  const catchPat = (content.match(/\bcatch\b/g) || []).length
  const andPat = (content.match(/&&/g) || []).length
  const orPat = (content.match(/\|\|/g) || []).length
  const complexity = 1 + ifPat + forPat + whilePat + switchPat + catchPat + andPat + orPat

  const docRatio = exportCount > 0 ? Math.min(100, Math.round((jsdoc / exportCount) * 100)) : (jsdoc > 0 ? 100 : 0)
  const errorRatio = functions > 0 ? Math.min(100, Math.round((catches / functions) * 100)) : 0
  const isTest = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file) ? 100 : 0

  return {
    file,
    complexity: Math.min(100, complexity),
    size: Math.min(100, lines),
    coupling: Math.min(100, imports * 10),
    documentation: docRatio,
    errorHandling: errorRatio,
    exports: Math.min(100, exportCount * 10),
    testIndicator: isTest,
  }
}

/**
 * Measure dimensions across all files.
 *
 * @example
 * measureDimensions(['a.ts'], ['const x = 1'])
 */
export function measureDimensions(files: string[], contents: string[]): Dimension[] {
  const metrics = files.map((f, i) => measureFile(f, contents[i] ?? ''))

  const dimNames = ['complexity', 'size', 'coupling', 'documentation', 'errorHandling', 'exports'] as const

  return dimNames.map((name) => {
    const fileMap = new Map<string, number>()
    let total = 0
    for (const m of metrics) {
      const val = m[name]
      fileMap.set(m.file, val)
      total += val
    }
    const value = metrics.length > 0 ? Math.round(total / metrics.length) : 0
    return { name, value, files: fileMap }
  })
}

// ─── Pearson Correlation ───────────────────────────────────────────────────────

/**
 * Compute Pearson correlation between two number arrays.
 *
 * @example
 * pearsonCorrelation([1, 2, 3], [2, 4, 6])
 */
export function pearsonCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 2) return 0

  const ax = a.slice(0, n)
  const bx = b.slice(0, n)
  const meanA = ax.reduce((s, v) => s + v, 0) / n
  const meanB = bx.reduce((s, v) => s + v, 0) / n

  let num = 0
  let denA = 0
  let denB = 0
  for (let i = 0; i < n; i++) {
    const da = ax[i]! - meanA
    const db = bx[i]! - meanB
    num += da * db
    denA += da * da
    denB += db * db
  }

  const den = Math.sqrt(denA * denB)
  if (den === 0) return 0
  return num / den
}

/**
 * Compute correlations between all dimension pairs.
 *
 * @example
 * computeCorrelations(dimensions)
 */
export function computeCorrelations(dimensions: Dimension[]): Correlation[] {
  const correlations: Correlation[] = []

  for (let i = 0; i < dimensions.length; i++) {
    for (let j = i + 1; j < dimensions.length; j++) {
      const dimA = dimensions[i]!
      const dimB = dimensions[j]!
      const commonFiles = [...dimA.files.keys()].filter((f) => dimB.files.has(f))
      if (commonFiles.length < 2) continue

      const valsA = commonFiles.map((f) => dimA.files.get(f) ?? 0)
      const valsB = commonFiles.map((f) => dimB.files.get(f) ?? 0)
      const r = pearsonCorrelation(valsA, valsB)
      const strength = Math.round(r * 100)

      const surprising = isSurprisingCorrelation(dimA.name, dimB.name, r)
      const direction = strength >= 0 ? 'positive' : 'negative'
      const magnitude = Math.abs(strength) >= 70 ? 'strong' : Math.abs(strength) >= 40 ? 'moderate' : 'weak'
      const description = `${magnitude} ${direction} correlation between ${dimA.name} and ${dimB.name} (r=${r.toFixed(2)})`

      correlations.push({ dimensionA: dimA.name, dimensionB: dimB.name, strength, description, surprising })
    }
  }

  return correlations
}

function isSurprisingCorrelation(dimA: string, dimB: string, r: number): boolean {
  const expectedPositive: [string, string][] = [
    ['complexity', 'size'],
    ['coupling', 'exports'],
    ['size', 'exports'],
  ]
  const expectedNegative: [string, string][] = [
    ['complexity', 'documentation'],
    ['documentation', 'errorHandling'],
  ]

  const pair = [dimA, dimB].sort().join('-') as string
  const revPair = [dimB, dimA].sort().join('-') as string

  for (const [a, b] of expectedPositive) {
    const key = [a, b].sort().join('-')
    if (pair === key || revPair === key) {
      if (r < -0.3) return true
    }
  }

  for (const [a, b] of expectedNegative) {
    const key = [a, b].sort().join('-')
    if (pair === key || revPair === key) {
      if (r > 0.3) return true
    }
  }

  return false
}

// ─── Insight Detection ─────────────────────────────────────────────────────────

/**
 * Detect surprising insights.
 *
 * @example
 * detectSurprisingInsights(dimensions, correlations)
 */
export function detectSurprisingInsights(dimensions: Dimension[], correlations: Correlation[]): Insight[] {
  const insights: Insight[] = []
  let id = 0

  const complexDim = dimensions.find((d) => d.name === 'complexity')
  const sizeDim = dimensions.find((d) => d.name === 'size')
  const docDim = dimensions.find((d) => d.name === 'documentation')
  const couplingDim = dimensions.find((d) => d.name === 'coupling')
  const exportDim = dimensions.find((d) => d.name === 'exports')

  if (complexDim && sizeDim) {
    const highComplexFiles = [...complexDim.files.entries()].filter(([, v]) => v > 50).map(([f]) => f)
    const largeFiles = [...sizeDim.files.entries()].filter(([, v]) => v > 50).map(([f]) => f)
    const complexNotLarge = highComplexFiles.filter((f) => !largeFiles.includes(f))
    if (complexNotLarge.length > 0) {
      insights.push({
        id: `surprising-${++id}`,
        title: 'Compact complexity bombs',
        category: 'surprising',
        description: 'Some small files pack disproportionate complexity — high cyclomatic complexity in compact code.',
        evidence: complexNotLarge.map((f) => `${f} has complexity ${complexDim.files.get(f)} but size ${sizeDim.files.get(f)}`),
        confidence: 80,
        impact: 70,
        actionItems: ['Review compact complex files for refactoring opportunities'],
      })
    }
  }

  if (docDim && complexDim) {
    const wellDocComplex = [...complexDim.files.entries()].filter(([f, v]) => v > 40 && (docDim.files.get(f) ?? 0) > 70)
    if (wellDocComplex.length > 0) {
      insights.push({
        id: `surprising-${++id}`,
        title: 'Well-documented complexity',
        category: 'surprising',
        description: 'Complex files are unusually well-documented, suggesting conscious effort to explain difficult code.',
        evidence: wellDocComplex.map(([f]) => `${f}: complexity ${complexDim.files.get(f)}, docs ${docDim.files.get(f)}%`),
        confidence: 75,
        impact: 40,
        actionItems: ['Consider if documentation can be replaced with simpler code'],
      })
    }
  }

  for (const corr of correlations) {
    if (corr.surprising) {
      insights.push({
        id: `surprising-${++id}`,
        title: `Unexpected correlation: ${corr.dimensionA} ↔ ${corr.dimensionB}`,
        category: 'surprising',
        description: corr.description,
        evidence: [corr.description],
        confidence: 70,
        impact: 60,
        actionItems: ['Investigate why this correlation deviates from expectations'],
      })
    }
  }

  return insights
}

/**
 * Detect hidden patterns in the codebase.
 *
 * @example
 * detectHiddenPatterns(files, contents, dimensions)
 */
export function detectHiddenPatterns(files: string[], contents: string[], dimensions: Dimension[]): Insight[] {
  const insights: Insight[] = []
  let id = 0

  const couplingDim = dimensions.find((d) => d.name === 'coupling')

  if (couplingDim) {
    const highCoupling = [...couplingDim.files.entries()].filter(([, v]) => v > 50)
    if (highCoupling.length >= 2) {
      const avgCoupling = Math.round(highCoupling.reduce((s, [, v]) => s + v, 0) / highCoupling.length)
      insights.push({
        id: `hidden-${++id}`,
        title: 'Hidden coupling cluster',
        category: 'hidden-pattern',
        description: `${highCoupling.length} files share high coupling (${avgCoupling}% avg), suggesting an undocumented dependency layer.`,
        evidence: highCoupling.map(([f, v]) => `${f}: ${v}% coupling`),
        confidence: 75,
        impact: 65,
        actionItems: ['Map the hidden dependency layer', 'Consider extracting a shared module'],
      })
    }
  }

  const exportDim = dimensions.find((d) => d.name === 'exports')
  const docDim = dimensions.find((d) => d.name === 'documentation')
  if (exportDim && docDim) {
    const manyExportsNoDocs = [...exportDim.files.entries()].filter(([f, v]) => v > 30 && (docDim.files.get(f) ?? 0) < 20)
    if (manyExportsNoDocs.length > 0) {
      insights.push({
        id: `hidden-${++id}`,
        title: 'Undocumented API surface',
        category: 'hidden-pattern',
        description: 'Files with many exports but minimal documentation represent an undocumented API surface.',
        evidence: manyExportsNoDocs.map(([f]) => `${f}: ${exportDim.files.get(f)}% exports, ${docDim.files.get(f)}% docs`),
        confidence: 85,
        impact: 70,
        actionItems: ['Prioritize documentation for heavily-exported files'],
      })
    }
  }

  const sizeDim = dimensions.find((d) => d.name === 'size')
  if (sizeDim) {
    const tinyFiles = [...sizeDim.files.entries()].filter(([, v]) => v <= 10).map(([f]) => f)
    const fileGroups = new Map<string, number>()
    for (const f of tinyFiles) {
      const dir = f.includes('/') ? f.substring(0, f.lastIndexOf('/')) : '.'
      fileGroups.set(dir, (fileGroups.get(dir) ?? 0) + 1)
    }
    const fragmented = [...fileGroups.entries()].filter(([, c]) => c >= 3)
    if (fragmented.length > 0) {
      insights.push({
        id: `hidden-${++id}`,
        title: 'Code fragmentation pattern',
        category: 'hidden-pattern',
        description: 'Directories with many tiny files suggest over-modularization or incomplete refactoring.',
        evidence: fragmented.map(([d, c]) => `${d}: ${c} tiny files`),
        confidence: 65,
        impact: 45,
        actionItems: ['Evaluate if tiny files should be consolidated'],
      })
    }
  }

  return insights
}

/**
 * Detect paradoxes in the codebase.
 *
 * @example
 * detectParadoxes(dimensions, correlations)
 */
export function detectParadoxes(dimensions: Dimension[], correlations: Correlation[]): Insight[] {
  const insights: Insight[] = []
  let id = 0

  const errorDim = dimensions.find((d) => d.name === 'errorHandling')
  const complexDim = dimensions.find((d) => d.name === 'complexity')

  if (errorDim && complexDim) {
    const simpleNoError = [...complexDim.files.entries()].filter(([f, v]) => v < 20 && (errorDim.files.get(f) ?? 0) > 50)
    if (simpleNoError.length > 0) {
      insights.push({
        id: `paradox-${++id}`,
        title: 'Over-cautious simple code',
        category: 'paradox',
        description: 'Simple files with excessive error handling may be over-engineered.',
        evidence: simpleNoError.map(([f]) => `${f}: complexity ${complexDim.files.get(f)}, error handling ${errorDim.files.get(f)}%`),
        confidence: 60,
        impact: 35,
        actionItems: ['Simplify error handling in low-complexity files'],
      })
    }
  }

  const docDim = dimensions.find((d) => d.name === 'documentation')
  if (docDim && complexDim) {
    const complexNoDoc = [...complexDim.files.entries()].filter(([f, v]) => v > 60 && (docDim.files.get(f) ?? 0) < 20)
    if (complexNoDoc.length > 0) {
      insights.push({
        id: `paradox-${++id}`,
        title: 'Complex but undocumented',
        category: 'paradox',
        description: 'Highly complex files with minimal documentation are the hardest to maintain.',
        evidence: complexNoDoc.map(([f]) => `${f}: complexity ${complexDim.files.get(f)}, docs ${docDim.files.get(f)}%`),
        confidence: 90,
        impact: 85,
        actionItems: ['Add documentation to complex undocumented files immediately'],
      })
    }
  }

  return insights
}

/**
 * Detect opportunities for improvement.
 *
 * @example
 * detectOpportunities(dimensions)
 */
export function detectOpportunities(dimensions: Dimension[]): Insight[] {
  const insights: Insight[] = []
  let id = 0

  const docDim = dimensions.find((d) => d.name === 'documentation')
  if (docDim) {
    const lowDoc = [...docDim.files.entries()].filter(([, v]) => v < 30 && v > 0)
    if (lowDoc.length > 0) {
      insights.push({
        id: `opportunity-${++id}`,
        title: 'Documentation quick wins',
        category: 'opportunity',
        description: `${lowDoc.length} files have partial documentation — small effort to complete.`,
        evidence: lowDoc.slice(0, 5).map(([f, v]) => `${f}: ${v}% documented`),
        confidence: 85,
        impact: 60,
        actionItems: ['Focus on partially-documented files for maximum ROI'],
      })
    }
  }

  const couplingDim = dimensions.find((d) => d.name === 'coupling')
  const exportDim = dimensions.find((d) => d.name === 'exports')
  if (couplingDim && exportDim) {
    const leveraged = [...couplingDim.files.entries()].filter(([f, v]) => v > 40 && (exportDim.files.get(f) ?? 0) > 30)
    if (leveraged.length > 0) {
      insights.push({
        id: `opportunity-${++id}`,
        title: 'Leverage points identified',
        category: 'opportunity',
        description: 'Files with high coupling AND many exports are leverage points — improvements here ripple widely.',
        evidence: leveraged.slice(0, 5).map(([f]) => `${f}: coupling ${couplingDim.files.get(f)}%, exports ${exportDim.files.get(f)}%`),
        confidence: 80,
        impact: 75,
        actionItems: ['Prioritize quality improvements on leverage-point files'],
      })
    }
  }

  return insights
}

/**
 * Detect warnings in the codebase.
 *
 * @example
 * detectWarnings(dimensions)
 */
export function detectWarnings(dimensions: Dimension[]): Insight[] {
  const insights: Insight[] = []
  let id = 0

  const complexDim = dimensions.find((d) => d.name === 'complexity')
  if (complexDim) {
    const veryComplex = [...complexDim.files.entries()].filter(([, v]) => v > 70)
    if (veryComplex.length > 0) {
      insights.push({
        id: `warning-${++id}`,
        title: 'Complexity danger zone',
        category: 'warning',
        description: `${veryComplex.length} file(s) have extremely high complexity, risking maintainability collapse.`,
        evidence: veryComplex.map(([f, v]) => `${f}: ${v}% complexity`),
        confidence: 90,
        impact: 85,
        actionItems: ['Break down complex files into smaller focused modules'],
      })
    }
  }

  const couplingDim = dimensions.find((d) => d.name === 'coupling')
  if (couplingDim) {
    const veryCoupled = [...couplingDim.files.entries()].filter(([, v]) => v > 60)
    if (veryCoupled.length > 0) {
      insights.push({
        id: `warning-${++id}`,
        title: 'Coupling hotspot',
        category: 'warning',
        description: `${veryCoupled.length} file(s) have excessive imports, indicating tight coupling.`,
        evidence: veryCoupled.map(([f, v]) => `${f}: ${v}% coupling`),
        confidence: 85,
        impact: 70,
        actionItems: ['Decouple by extracting interfaces and reducing direct dependencies'],
      })
    }
  }

  const docDim = dimensions.find((d) => d.name === 'documentation')
  if (docDim) {
    const noDocs = [...docDim.files.entries()].filter(([, v]) => v === 0)
    const noDocRatio = docDim.files.size > 0 ? noDocs.length / docDim.files.size : 0
    if (noDocRatio > 0.5) {
      insights.push({
        id: `warning-${++id}`,
        title: 'Documentation debt',
        category: 'warning',
        description: `${Math.round(noDocRatio * 100)}% of files have zero documentation.`,
        evidence: [`${noDocs.length} of ${docDim.files.size} files undocumented`],
        confidence: 95,
        impact: 60,
        actionItems: ['Establish documentation standards', 'Start with the most-exported files'],
      })
    }
  }

  return insights
}

// ─── Wisdom Score ──────────────────────────────────────────────────────────────

/**
 * Compute wisdom score (how well-understood the codebase is).
 *
 * @example
 * computeWisdomScore(insights, correlations)
 */
export function computeWisdomScore(insights: Insight[], correlations: Correlation[]): number {
  let score = 50

  const highConfInsights = insights.filter((i) => i.confidence >= 70)
  score += Math.min(20, highConfInsights.length * 3)

  const strongCorr = correlations.filter((c) => Math.abs(c.strength) >= 50)
  score += Math.min(15, strongCorr.length * 5)

  const categories = new Set(insights.map((i) => i.category))
  score += Math.min(10, categories.size * 2)

  const warnings = insights.filter((i) => i.category === 'warning')
  score -= Math.min(15, warnings.length * 5)

  return Math.max(0, Math.min(100, score))
}

/**
 * Identify blind spots (files with low understanding).
 *
 * @example
 * identifyBlindSpots(dimensions)
 */
export function identifyBlindSpots(dimensions: Dimension[]): number {
  if (dimensions.length === 0) return 0

  const docDim = dimensions.find((d) => d.name === 'documentation')
  const errorDim = dimensions.find((d) => d.name === 'errorHandling')

  if (!docDim || !errorDim) return 0

  let blindCount = 0
  for (const [file, docVal] of docDim.files) {
    const errorVal = errorDim.files.get(file) ?? 0
    if (docVal < 20 && errorVal < 20) blindCount++
  }

  return blindCount
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate recommendations.
 *
 * @example
 * generateRecommendations(insights, correlations, stats)
 */
export function generateRecommendations(
  insights: Insight[],
  correlations: Correlation[],
  stats: InsightStats,
): string[] {
  const recs: string[] = []

  const warnings = insights.filter((i) => i.category === 'warning')
  if (warnings.length > 0) {
    recs.push(`Address ${warnings.length} warning(s) to prevent maintainability decline`)
  }

  const surprising = insights.filter((i) => i.category === 'surprising')
  if (surprising.length > 0) {
    recs.push(`Investigate ${surprising.length} surprising finding(s) — they may reveal hidden truths`)
  }

  const opportunities = insights.filter((i) => i.category === 'opportunity')
  if (opportunities.length > 0) {
    recs.push(`Act on ${opportunities.length} opportunity(ies) for quick improvements`)
  }

  if (stats.blindSpots > 0) {
    recs.push(`Explore ${stats.blindSpots} blind spot(s) — files with low documentation and error handling`)
  }

  if (stats.wisdomScore < 40) {
    recs.push('Wisdom score is low — invest in understanding your codebase through documentation and testing')
  }

  const strongCorr = correlations.filter((c) => Math.abs(c.strength) >= 70)
  if (strongCorr.length > 0) {
    recs.push(`Leverage ${strongCorr.length} strong correlation(s) to predict change impact`)
  }

  if (recs.length === 0) {
    recs.push('The codebase shows strong wisdom — continue current practices and share knowledge')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete codebase insight result.
 *
 * @example
 * buildInsightResult(['a.ts'], ['const x = 1'], {})
 */
export function buildInsightResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): CodebaseInsightResult {
  if (files.length === 0) {
    const emptyStats: InsightStats = {
      totalInsights: 0, surprisingCount: 0, hiddenPatternCount: 0,
      correlationCount: 0, strongCorrelations: 0, wisdomScore: 0,
      deepestInsight: 'none', blindSpots: 0,
    }
    return { insights: [], correlations: [], dimensions: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const dimensions = measureDimensions(files, contents)
  const correlations = computeCorrelations(dimensions)

  const surprising = detectSurprisingInsights(dimensions, correlations)
  const hidden = detectHiddenPatterns(files, contents, dimensions)
  const paradoxes = detectParadoxes(dimensions, correlations)
  const opportunities = detectOpportunities(dimensions)
  const warnings = detectWarnings(dimensions)

  const correlationInsights: Insight[] = correlations
    .filter((c) => Math.abs(c.strength) >= 60)
    .map((c, i) => ({
      id: `correlation-${i}`,
      title: `Correlation: ${c.dimensionA} ↔ ${c.dimensionB}`,
      category: 'correlation' as InsightCategory,
      description: c.description,
      evidence: [c.description],
      confidence: Math.round(Math.abs(c.strength)),
      impact: Math.round(Math.abs(c.strength) * 0.8),
      actionItems: c.surprising ? ['Investigate this unexpected relationship'] : ['Use this correlation for prediction'],
    }))

  const allInsights = [...surprising, ...hidden, ...paradoxes, ...opportunities, ...warnings, ...correlationInsights]
  const sortedInsights = allInsights.sort((a, b) => b.impact - a.impact)

  const wisdomScore = computeWisdomScore(sortedInsights, correlations)
  const blindSpots = identifyBlindSpots(dimensions)

  const deepestImpact = sortedInsights.length > 0 ? sortedInsights[0]!.title : 'none'

  const stats: InsightStats = {
    totalInsights: sortedInsights.length,
    surprisingCount: surprising.length,
    hiddenPatternCount: hidden.length,
    correlationCount: correlationInsights.length,
    strongCorrelations: correlations.filter((c) => Math.abs(c.strength) >= 60).length,
    wisdomScore,
    deepestInsight: deepestImpact,
    blindSpots,
  }

  const recommendations = generateRecommendations(sortedInsights, correlations, stats)

  return { insights: sortedInsights, correlations, dimensions, stats, recommendations }
}
