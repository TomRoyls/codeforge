// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RegionMetrics {
  linesOfCode: number
  complexity: number
  functionCount: number
  testCount: number
  dependencyCount: number
  exportCount: number
  changeFrequency: number
  bugRiskScore: number
}

export interface Region {
  name: string
  files: string[]
  metrics: RegionMetrics
}

export interface RegionMetric {
  name: string
  value: number
  percentage: number
  area: number
  rank: number
  color: string
}

export interface CartogramView {
  name: string
  description: string
  regions: RegionMetric[]
  total: number
  max: number
  distribution: 'balanced' | 'concentrated' | 'extreme'
}

export interface ComparisonView {
  region: string
  metrics: Record<string, number>
  dominant: string
  weakest: string
}

export interface CartogramStats {
  regionCount: number
  viewCount: number
  mostBalancedRegion: string
  leastBalancedRegion: string
  overallBalance: number
  dominantRegion: string
  smallestRegion: string
}

export interface CartogramResult {
  regions: Region[]
  views: CartogramView[]
  comparison: ComparisonView[]
  stats: CartogramStats
  recommendations: string[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Group files by parent directory.
 *
 * @example
 * groupFilesByRegion(['src/a.ts', 'src/b.ts', 'test/a.test.ts'])
 */
export function groupFilesByRegion(files: string[]): Map<string, string[]> {
  const regions = new Map<string, string[]>()
  for (const file of files) {
    const parts = file.split('/')
    const region = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)'
    const existing = regions.get(region)
    if (existing) {
      existing.push(file)
    } else {
      regions.set(region, [file])
    }
  }
  return regions
}

/**
 * Count effective lines of code.
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
 * Compute cyclomatic complexity.
 *
 * @example
 * computeCyclomaticComplexity('if (x) { for (let i = 0; i < 10; i++) {} }')
 */
export function computeCyclomaticComplexity(content: string): number {
  const patterns = [/\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\?\s*[^?]/g, /&&/g, /\|\|/g]
  let total = 1
  for (const pat of patterns) {
    const matches = content.match(pat)
    if (matches) total += matches.length
  }
  return total
}

/**
 * Count function declarations.
 *
 * @example
 * countFunctions('function foo() {} const bar = () => {}')
 */
export function countFunctions(content: string): number {
  const namedFn = content.match(/\bfunction\s+\w+/g)
  const arrowFn = content.match(/=>\s*[{(]/g)
  const methodFn = content.match(/\b\w+\s*\([^)]*\)\s*{/g)
  return (namedFn ? namedFn.length : 0) + (arrowFn ? arrowFn.length : 0) + (methodFn ? methodFn.length : 0)
}

/**
 * Count test functions.
 *
 * @example
 * countTests("describe('x', () => { it('y', () => {}) })")
 */
export function countTests(content: string): number {
  const its = content.match(/\bit\s*\(/g)
  const tests = content.match(/\btest\s*\(/g)
  return (its ? its.length : 0) + (tests ? tests.length : 0)
}

/**
 * Count import/require dependencies.
 *
 * @example
 * countDependencies("import { a } from 'x'\nconst b = require('y')")
 */
export function countDependencies(content: string): number {
  const imports = content.match(/^import\s+/gm)
  const requires = content.match(/\brequire\s*\(/g)
  return (imports ? imports.length : 0) + (requires ? requires.length : 0)
}

/**
 * Count exports.
 *
 * @example
 * countExported('export function foo() {}\nexport const bar = 1')
 */
export function countExported(content: string): number {
  const matches = content.match(/^export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/gm)
  return matches ? matches.length : 0
}

/**
 * Compute bug risk score from metrics.
 *
 * @example
 * computeBugRisk({ complexity: 50, linesOfCode: 200, changeFrequency: 5, functionCount: 10, testCount: 1, dependencyCount: 8, exportCount: 5 })
 */
export function computeBugRisk(metrics: { complexity: number; linesOfCode: number; changeFrequency: number; functionCount: number; testCount: number; dependencyCount: number; exportCount: number }): number {
  const complexityRisk = Math.min(40, metrics.complexity * 0.5)
  const sizeRisk = Math.min(20, metrics.linesOfCode * 0.02)
  const testRatio = metrics.functionCount > 0 ? metrics.testCount / metrics.functionCount : 0
  const testRisk = Math.min(20, (1 - Math.min(1, testRatio)) * 20)
  const depRisk = Math.min(10, metrics.dependencyCount * 0.5)
  const changeRisk = Math.min(10, metrics.changeFrequency * 2)
  return Math.min(100, Math.round(complexityRisk + sizeRisk + testRisk + depRisk + changeRisk))
}

// ─── Region Metrics ────────────────────────────────────────────────────────────

/**
 * Compute all metrics for a region from its file contents.
 *
 * @example
 * computeRegionMetrics(['a.ts'], [content])
 */
export function computeRegionMetrics(_files: string[], contents: string[]): RegionMetrics {
  let linesOfCode = 0
  let complexity = 0
  let functionCount = 0
  let testCount = 0
  let dependencyCount = 0
  let exportCount = 0

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i] ?? ''
    linesOfCode += countEffectiveLines(content)
    complexity += computeCyclomaticComplexity(content)
    functionCount += countFunctions(content)
    testCount += countTests(content)
    dependencyCount += countDependencies(content)
    exportCount += countExported(content)
  }

  const bugRiskScore = computeBugRisk({ complexity, linesOfCode, changeFrequency: 0, functionCount, testCount, dependencyCount, exportCount })

  return {
    linesOfCode,
    complexity,
    functionCount,
    testCount,
    dependencyCount,
    exportCount,
    changeFrequency: 0,
    bugRiskScore,
  }
}

// ─── Views ─────────────────────────────────────────────────────────────────────

/**
 * Compute proportional area (1-50 chars).
 *
 * @example
 * computeArea(100, 200, 50)
 */
export function computeArea(value: number, max: number, maxWidth = 50): number {
  if (max === 0) return 1
  return Math.max(1, Math.round((value / max) * maxWidth))
}

/**
 * Compute distribution type.
 *
 * @example
 * computeDistribution([{ percentage: 80 }, { percentage: 10 }, { percentage: 10 }])
 */
export function computeDistribution(regions: RegionMetric[]): 'balanced' | 'concentrated' | 'extreme' {
  if (regions.length <= 1) return 'balanced'
  const sorted = [...regions].sort((a, b) => b.percentage - a.percentage)
  const topPct = sorted[0]!.percentage
  if (topPct >= 70) return 'extreme'
  if (topPct >= 45) return 'concentrated'
  return 'balanced'
}

/**
 * Create a cartogram view for a specific metric.
 *
 * @example
 * createView(regions, 'linesOfCode', 'Size View', 'Lines of code per region')
 */
export function createView(regions: Region[], metricKey: keyof RegionMetrics, viewName: string, viewDesc: string): CartogramView {
  const entries = regions.map((r) => ({
    name: r.name,
    value: r.metrics[metricKey],
  }))

  const total = entries.reduce((s, e) => s + e.value, 0)
  const max = Math.max(...entries.map((e) => e.value), 1)

  const sorted = [...entries].sort((a, b) => b.value - a.value)

  const regionMetrics: RegionMetric[] = sorted.map((e, idx) => ({
    name: e.name,
    value: e.value,
    percentage: total > 0 ? Math.round((e.value / total) * 100) : 0,
    area: computeArea(e.value, max),
    rank: idx + 1,
    color: e.value === max ? 'bright' : e.value > max * 0.5 ? 'medium' : 'dim',
  }))

  return {
    name: viewName,
    description: viewDesc,
    regions: regionMetrics,
    total,
    max,
    distribution: computeDistribution(regionMetrics),
  }
}

/**
 * Create all standard views.
 *
 * @example
 * createAllViews(regions)
 */
export function createAllViews(regions: Region[]): CartogramView[] {
  return [
    createView(regions, 'linesOfCode', 'Size View', 'Lines of code per region'),
    createView(regions, 'complexity', 'Complexity View', 'Cyclomatic complexity per region'),
    createView(regions, 'functionCount', 'Density View', 'Function count per region'),
    createView(regions, 'testCount', 'Testing View', 'Test count per region'),
    createView(regions, 'dependencyCount', 'Connectivity View', 'Dependencies per region'),
    createView(regions, 'changeFrequency', 'Activity View', 'Change frequency per region'),
    createView(regions, 'bugRiskScore', 'Risk View', 'Bug risk score per region'),
  ]
}

// ─── Comparison ────────────────────────────────────────────────────────────────

/**
 * Compare regions across all metrics.
 *
 * @example
 * compareRegions(regions)
 */
export function compareRegions(regions: Region[]): ComparisonView[] {
  const metricKeys: (keyof RegionMetrics)[] = ['linesOfCode', 'complexity', 'functionCount', 'testCount', 'dependencyCount', 'exportCount', 'changeFrequency', 'bugRiskScore']

  return regions.map((r) => {
    const metrics: Record<string, number> = {}
    for (const key of metricKeys) {
      metrics[key] = r.metrics[key]
    }

    const entries = Object.entries(metrics)
    entries.sort(([, a], [, b]) => b - a)
    const dominant = entries[0]?.[0] ?? 'none'
    const weakest = entries[entries.length - 1]?.[0] ?? 'none'

    return { region: r.name, metrics, dominant, weakest }
  })
}

// ─── Balance ───────────────────────────────────────────────────────────────────

/**
 * Compute overall codebase balance (0-100, 100 = perfectly balanced).
 *
 * @example
 * computeOverallBalance(views)
 */
export function computeOverallBalance(views: CartogramView[]): number {
  if (views.length === 0) return 100
  let totalBalance = 0
  for (const view of views) {
    if (view.regions.length <= 1) {
      totalBalance += 100
      continue
    }
    const values = view.regions.map((r) => r.value)
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    if (avg === 0) {
      totalBalance += 100
      continue
    }
    const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length
    const cv = Math.sqrt(variance) / avg
    const balance = Math.max(0, Math.round(100 - cv * 50))
    totalBalance += balance
  }
  return Math.round(totalBalance / views.length)
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Build cartogram stats.
 *
 * @example
 * buildStats(regions, views, comparison)
 */
export function buildStats(regions: Region[], views: CartogramView[], comparison: ComparisonView[]): CartogramStats {
  const locView = views.find((v) => v.name === 'Size View')
  const dominantRegion = locView?.regions[0]?.name ?? 'none'
  const smallestRegion = locView?.regions[locView.regions.length - 1]?.name ?? 'none'

  let mostBalanced = comparison[0]?.region ?? 'none'
  let leastBalanced = comparison[0]?.region ?? 'none'
  let smallestGap = Infinity
  let largestGap = 0

  for (const c of comparison) {
    const vals = Object.values(c.metrics)
    const maxVal = Math.max(...vals)
    const minVal = Math.min(...vals)
    const gap = maxVal - minVal
    if (gap < smallestGap) {
      smallestGap = gap
      mostBalanced = c.region
    }
    if (gap > largestGap) {
      largestGap = gap
      leastBalanced = c.region
    }
  }

  return {
    regionCount: regions.length,
    viewCount: views.length,
    mostBalancedRegion: mostBalanced,
    leastBalancedRegion: leastBalanced,
    overallBalance: computeOverallBalance(views),
    dominantRegion,
    smallestRegion,
  }
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate cartogram recommendations.
 *
 * @example
 * generateCartogramRecommendations(regions, views, comparison, stats)
 */
export function generateCartogramRecommendations(regions: Region[], views: CartogramView[], _comparison: ComparisonView[], stats: CartogramStats): string[] {
  const recs: string[] = []

  const extremeViews = views.filter((v) => v.distribution === 'extreme')
  for (const v of extremeViews) {
    const top = v.regions[0]
    recs.push(`${v.name}: "${top!.name}" dominates at ${top!.percentage}% — consider splitting`)
  }

  const concentratedViews = views.filter((v) => v.distribution === 'concentrated')
  for (const v of concentratedViews.slice(0, 2)) {
    const top = v.regions[0]
    recs.push(`${v.name}: "${top!.name}" holds ${top!.percentage}% — monitor for concentration risk`)
  }

  for (const r of regions) {
    if (r.metrics.bugRiskScore > 60 && r.metrics.linesOfCode > 200) {
      recs.push(`"${r.name}" has high risk (${r.metrics.bugRiskScore}) and large size — priority for review`)
    }
  }

  for (const r of regions) {
    if (r.metrics.complexity > 30 && r.metrics.testCount < 3) {
      recs.push(`"${r.name}" has high complexity (${r.metrics.complexity}) but few tests (${r.metrics.testCount}) — add tests`)
    }
  }

  if (stats.overallBalance < 30) {
    recs.push(`Overall balance is ${stats.overallBalance}/100 — significant metric imbalance across regions`)
  }

  if (recs.length === 0) {
    recs.push('Codebase is well-balanced across regions and metrics')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete cartogram result.
 *
 * @example
 * buildCartogramResult(['src/a.ts', 'test/a.test.ts'], [srcContent, testContent])
 */
export function buildCartogramResult(files: string[], contents: string[]): CartogramResult {
  const regionMap = groupFilesByRegion(files)

  const regions: Region[] = []
  for (const [name, regionFiles] of regionMap) {
    const regionContents = regionFiles.map((f) => {
      const idx = files.indexOf(f)
      return idx >= 0 ? contents[idx] ?? '' : ''
    })
    regions.push({
      name,
      files: regionFiles,
      metrics: computeRegionMetrics(regionFiles, regionContents),
    })
  }

  const views = createAllViews(regions)
  const comparison = compareRegions(regions)
  const stats = buildStats(regions, views, comparison)
  const recommendations = generateCartogramRecommendations(regions, views, comparison, stats)

  return { regions, views, comparison, stats, recommendations }
}
