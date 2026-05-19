// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single function-level hotspot.
 *
 * @example
 * const fn: FunctionHotspot = { name: 'processData', complexity: 8, score: 45, riskLevel: 'medium' }
 */
export interface FunctionHotspot {
  name: string
  lineStart: number
  complexity: number
  size: number
  score: number
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * A file-level hotspot entry.
 *
 * @example
 * const h: HotspotEntry = { file: 'src/core.ts', complexity: 25, changeFrequency: 12, hotspotScore: 78, riskLevel: 'critical' }
 */
export interface HotspotEntry {
  file: string
  complexity: number
  changeFrequency: number
  hotspotScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  functions: FunctionHotspot[]
  linesOfCode: number
  lastChanged: string
  authors: string[]
}

/**
 * Distribution of hotspots by risk level.
 *
 * @example
 * const d: HotspotDistribution = { low: 10, medium: 5, high: 3, critical: 1 }
 */
export interface HotspotDistribution {
  low: number
  medium: number
  high: number
  critical: number
}

/**
 * Aggregate hotspot statistics.
 *
 * @example
 * const s: HotspotStats = { totalFiles: 20, hotspotFiles: 8, averageScore: 42.5 }
 */
export interface HotspotStats {
  totalFiles: number
  hotspotFiles: number
  averageScore: number
  maxScore: number
  criticalFiles: number
  totalComplexity: number
  averageChangeFrequency: number
}

/**
 * Complete hotspot analysis result.
 *
 * @example
 * const r: HotspotResult = { hotspots: [...], distribution: {...}, topHotspots: [...], ... }
 */
export interface HotspotResult {
  hotspots: HotspotEntry[]
  distribution: HotspotDistribution
  stats: HotspotStats
  topHotspots: HotspotEntry[]
  recommendations: string[]
}

/**
 * Options for hotspot analysis.
 *
 * @example
 * const opts: HotspotOptions = { threshold: 70, verbose: true }
 */
export interface HotspotOptions {
  threshold?: number
  verbose?: boolean
}

/**
 * Pre-parsed commit data for a file (avoids git calls in tests).
 *
 * @example
 * const d: FileCommitData = { file: 'a.ts', commitCount: 5, lastChanged: '2024-06-01', authors: ['Alice'] }
 */
export interface FileCommitData {
  file: string
  commitCount: number
  lastChanged: string
  authors: string[]
}

// ─── Complexity Computation ───────────────────────────────────────────────────

/**
 * Count decision points in a line of code.
 *
 * @example
 * countDecisionPoints('if (x && y) {') // 3
 */
export function countDecisionPoints(line: string): number {
  let count = 0
  const keywords = ['if', 'else if', 'for', 'while', 'case', 'catch', '&&', '||', '??', '?.']
  for (const kw of keywords) {
    let idx = 0
    while ((idx = line.indexOf(kw, idx)) !== -1) {
      count++
      idx += kw.length
    }
  }
  return count
}

/**
 * Compute cyclomatic complexity per function in source content.
 *
 * @example
 * computeFunctionComplexity('function foo() { if (x) { } }') // [{ name: 'foo', complexity: 2, ... }]
 */
export function computeFunctionComplexity(content: string): FunctionHotspot[] {
  const results: FunctionHotspot[] = []
  const lines = content.split('\n')

  let currentFn: { name: string; lineStart: number; complexity: number; size: number } | null = null

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue

    const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/)
      ?? trimmed.match(/^(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/)
    const isArrow = /^\s*(?:async\s*)?\(.*\)\s*=>/.test(trimmed) || /^(?:export\s+)?(?:const|let)\s+\w+\s*=\s*(?:async\s*)?\(.*\)\s*=>/.test(trimmed)

    if (funcMatch) {
      if (currentFn) {
        results.push(buildFunctionHotspot(currentFn))
      }
      currentFn = { name: funcMatch[1]!, lineStart: i + 1, complexity: 1, size: 1 }
    } else if (isArrow && !funcMatch) {
      const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let)\s+(\w+)\s*=/)
      if (arrowMatch) {
        if (currentFn) results.push(buildFunctionHotspot(currentFn))
        currentFn = { name: arrowMatch[1]!, lineStart: i + 1, complexity: 1, size: 1 }
      }
    }

    if (currentFn) {
      currentFn.complexity += countDecisionPoints(trimmed)
      currentFn.size++
    }
  }

  if (currentFn) {
    results.push(buildFunctionHotspot(currentFn))
  }

  return results
}

function buildFunctionHotspot(fn: { name: string; lineStart: number; complexity: number; size: number }): FunctionHotspot {
  const score = Math.min(100, fn.complexity * 5 + Math.max(0, fn.size - 20))
  return {
    name: fn.name,
    lineStart: fn.lineStart,
    complexity: fn.complexity,
    size: fn.size,
    score,
    riskLevel: score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low',
  }
}

/**
 * Compute total cyclomatic complexity for a file.
 *
 * @example
 * computeFileComplexity('function a() { if (x) {} }\nfunction b() { }') // 3
 */
export function computeFileComplexity(content: string): number {
  const fns = computeFunctionComplexity(content)
  if (fns.length === 0) {
    let total = 1
    for (const line of content.split('\n')) {
      total += countDecisionPoints(line.trim())
    }
    return total
  }
  return fns.reduce((sum, fn) => sum + fn.complexity, 0)
}

// ─── Hotspot Score ─────────────────────────────────────────────────────────────

/**
 * Compute hotspot score (0-100) from normalized complexity and frequency.
 *
 * @example
 * computeHotspotScore(20, 10, 50, 30) // ~37
 */
export function computeHotspotScore(
  complexity: number,
  changeFrequency: number,
  maxComplexity: number,
  maxFrequency: number,
): number {
  const normComplexity = maxComplexity > 0 ? complexity / maxComplexity : 0
  const normFrequency = maxFrequency > 0 ? changeFrequency / maxFrequency : 0
  const score = (normComplexity * 0.5 + normFrequency * 0.5) * 100
  return Math.round(Math.min(100, score) * 10) / 10
}

// ─── Risk Classification ──────────────────────────────────────────────────────

/**
 * Classify risk level from hotspot score.
 *
 * @example
 * classifyRisk(80) // 'critical'
 * classifyRisk(30) // 'medium'
 */
export function classifyRisk(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

// ─── Distribution ─────────────────────────────────────────────────────────────

/**
 * Compute distribution of hotspots by risk level.
 *
 * @example
 * computeDistribution([{ riskLevel: 'high' }, { riskLevel: 'low' }]) // { low: 1, medium: 0, high: 1, critical: 0 }
 */
export function computeDistribution(hotspots: HotspotEntry[]): HotspotDistribution {
  const dist: HotspotDistribution = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const h of hotspots) {
    dist[h.riskLevel]++
  }
  return dist
}

// ─── Top Hotspots ──────────────────────────────────────────────────────────────

/**
 * Find top N hotspots by score.
 *
 * @example
 * findTopHotspots(hotspots, 5) // top 5 entries sorted by score
 */
export function findTopHotspots(hotspots: HotspotEntry[], count: number): HotspotEntry[] {
  return [...hotspots].sort((a, b) => b.hotspotScore - a.hotspotScore).slice(0, count)
}

// ─── Statistics ────────────────────────────────────────────────────────────────

/**
 * Compute aggregate hotspot statistics.
 *
 * @example
 * computeHotspotStats(hotspots) // { totalFiles: 10, hotspotFiles: 3, ... }
 */
export function computeHotspotStats(hotspots: HotspotEntry[], threshold: number = 70): HotspotStats {
  if (hotspots.length === 0) {
    return { totalFiles: 0, hotspotFiles: 0, averageScore: 0, maxScore: 0, criticalFiles: 0, totalComplexity: 0, averageChangeFrequency: 0 }
  }

  const hotspotFiles = hotspots.filter((h) => h.hotspotScore >= threshold).length
  const totalScore = hotspots.reduce((s, h) => s + h.hotspotScore, 0)
  const maxScore = Math.max(...hotspots.map((h) => h.hotspotScore))
  const criticalFiles = hotspots.filter((h) => h.riskLevel === 'critical').length
  const totalComplexity = hotspots.reduce((s, h) => s + h.complexity, 0)
  const totalFreq = hotspots.reduce((s, h) => s + h.changeFrequency, 0)

  return {
    totalFiles: hotspots.length,
    hotspotFiles,
    averageScore: Math.round((totalScore / hotspots.length) * 10) / 10,
    maxScore,
    criticalFiles,
    totalComplexity,
    averageChangeFrequency: Math.round((totalFreq / hotspots.length) * 10) / 10,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate hotspot-related recommendations.
 *
 * @example
 * generateHotspotRecommendations(topHotspots, stats) // ['Critical hotspot in src/core.ts...']
 */
export function generateHotspotRecommendations(topHotspots: HotspotEntry[], stats: HotspotStats): string[] {
  const recs: string[] = []

  const critical = topHotspots.filter((h) => h.riskLevel === 'critical')
  for (const h of critical.slice(0, 3)) {
    recs.push(`Critical hotspot: ${h.file} (score: ${h.hotspotScore}). Needs immediate refactoring.`)
  }

  const high = topHotspots.filter((h) => h.riskLevel === 'high')
  if (high.length > 0) {
    recs.push(`${high.length} high-risk file(s) should get priority test coverage.`)
  }

  if (stats.criticalFiles > stats.totalFiles * 0.2) {
    recs.push('More than 20% of files are critical hotspots. Consider a focused refactoring sprint.')
  }

  const complexHotspots = topHotspots.filter((h) => h.complexity > 20 && h.changeFrequency > 5)
  if (complexHotspots.length > 0) {
    recs.push(`${complexHotspots.length} file(s) are both complex and frequently changed. Consider splitting them.`)
  }

  if (recs.length === 0) {
    recs.push('No critical hotspots detected. Codebase looks manageable.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete hotspot result from pre-computed data.
 *
 * @example
 * const result = buildHotspotResult(files, contents, commitData, {})
 */
export function buildHotspotResult(
  files: string[],
  contents: string[],
  commitData: FileCommitData[],
  options: HotspotOptions = {},
): HotspotResult {
  const threshold = options.threshold ?? 70

  const commitMap = new Map(commitData.map((d) => [d.file, d]))

  const rawEntries: { file: string; complexity: number; changeFrequency: number; functions: FunctionHotspot[]; linesOfCode: number }[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const complexity = computeFileComplexity(content)
    const functions = computeFunctionComplexity(content)
    const data = commitMap.get(file)
    const changeFrequency = data?.commitCount ?? 0

    rawEntries.push({
      file,
      complexity,
      changeFrequency,
      functions,
      linesOfCode: content.split('\n').length,
    })
  }

  const maxComplexity = Math.max(...rawEntries.map((e) => e.complexity), 1)
  const maxFrequency = Math.max(...rawEntries.map((e) => e.changeFrequency), 1)

  const hotspots: HotspotEntry[] = rawEntries.map((entry) => {
    const score = computeHotspotScore(entry.complexity, entry.changeFrequency, maxComplexity, maxFrequency)
    const data = commitMap.get(entry.file)

    return {
      file: entry.file,
      complexity: entry.complexity,
      changeFrequency: entry.changeFrequency,
      hotspotScore: score,
      riskLevel: classifyRisk(score),
      functions: entry.functions,
      linesOfCode: entry.linesOfCode,
      lastChanged: data?.lastChanged ?? '',
      authors: data?.authors ?? [],
    }
  })

  hotspots.sort((a, b) => b.hotspotScore - a.hotspotScore)

  const topHotspots = findTopHotspots(hotspots, 10)
  const distribution = computeDistribution(hotspots)
  const stats = computeHotspotStats(hotspots, threshold)
  const recommendations = generateHotspotRecommendations(topHotspots, stats)

  return { hotspots, distribution, stats, topHotspots, recommendations }
}
