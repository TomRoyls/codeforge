// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Lens {
  name: string
  description: string
  focus: string
  blur: string
}

export interface FocusResult {
  file: string
  score: number
  rank: number
  highlights: string[]
  blurred: string[]
  sharpness: number
}

export interface LensView {
  lens: Lens
  results: FocusResult[]
  topFocus: string[]
  bottomFocus: string[]
  avgScore: number
  distribution: 'uniform' | 'normal' | 'skewed' | 'bimodal'
}

export interface LensStats {
  lensCount: number
  totalFiles: number
  bestOverallFile: string
  worstOverallFile: string
  mostConsistent: string
  mostPolarizing: string
  overallClarity: number
  dominantDistribution: string
}

export interface LensResult {
  views: LensView[]
  stats: LensStats
  recommendations: string[]
}

export interface LensOptions {
  verbose?: boolean
}

// ─── Lens Definitions ──────────────────────────────────────────────────────────

export const LENSES: Lens[] = [
  { name: 'complexity', description: 'Code complexity analysis', focus: 'cyclomatic complexity, nesting, function length', blur: 'documentation, naming' },
  { name: 'coupling', description: 'Inter-module coupling analysis', focus: 'imports, dependencies, god objects', blur: 'internal quality' },
  { name: 'documentation', description: 'Documentation quality analysis', focus: 'JSDoc coverage, comments, type annotations', blur: 'code complexity' },
  { name: 'testing', description: 'Test coverage estimation', focus: 'test files, assertions, test-to-source ratio', blur: 'source quality' },
  { name: 'freshness', description: 'Code recency and activity', focus: 'recent changes, active areas, growth', blur: 'code quality' },
  { name: 'stability', description: 'Code stability analysis', focus: 'change frequency, pattern consistency, maturity', blur: 'documentation, testing' },
]

// ─── Complexity Lens ───────────────────────────────────────────────────────────

/**
 * Apply complexity lens to content.
 * High score = complex (bad for maintenance).
 *
 * @example
 * applyComplexityLens('if (x) { for (let i = 0; i < 10; i++) { if (y) {} } }')
 */
export function applyComplexityLens(content: string): { score: number; highlights: string[]; blurred: string[] } {
  const highlights: string[] = []
  const blurred: string[] = []
  if (!content || content.trim().length === 0) return { score: 0, highlights, blurred }

  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return { score: 0, highlights, blurred }

  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcase\b/g) || []).length
  const ternaries = (content.match(/\?[^?]*:/g) || []).length
  const tryCatch = (content.match(/\btry\b|\bcatch\b/g) || []).length
  const nesting = computeMaxNesting(content)

  const longFunctions = (content.match(/function\s+\w+[^}]{300,}/gs) || []).length
  const anyTypes = (content.match(/:\s*any\b/g) || []).length

  let score = branches * 3 + ternaries * 2 + tryCatch * 3 + nesting * 5 + longFunctions * 8 + anyTypes * 2
  score = Math.round((score / Math.max(total, 1)) * 100)
  score = Math.max(0, Math.min(100, score))

  if (nesting > 3) highlights.push(`deep-nesting(${nesting})`)
  if (branches > 5) highlights.push(`many-branches(${branches})`)
  if (longFunctions > 0) highlights.push(`long-functions(${longFunctions})`)
  if (anyTypes > 0) highlights.push(`any-types(${anyTypes})`)
  if (branches <= 2 && nesting <= 2) highlights.push('low-complexity')

  blurred.push('documentation')
  blurred.push('naming')

  return { score, highlights, blurred }
}

// ─── Coupling Lens ─────────────────────────────────────────────────────────────

/**
 * Apply coupling lens.
 * High score = tightly coupled (bad).
 *
 * @example
 * applyCouplingLens('file.ts', ['./a', './b', './c', './d', './e'], [])
 */
export function applyCouplingLens(file: string, imports: string[], importedBy: string[]): { score: number; highlights: string[]; blurred: string[] } {
  const highlights: string[] = []
  const blurred: string[] = []
  if (!file) return { score: 0, highlights, blurred }

  const importCount = imports.length
  const importedByCount = importedBy.length
  const fanOut = importCount
  const fanIn = importedByCount
  const totalCoupling = fanOut + fanIn

  let score = totalCoupling * 8
  if (fanOut > 5) score += (fanOut - 5) * 10
  if (fanIn > 8) score += (fanIn - 8) * 5
  score = Math.max(0, Math.min(100, score))

  if (fanOut > 5) highlights.push(`high-fan-out(${fanOut})`)
  if (fanIn > 8) highlights.push(`high-fan-in(${fanIn})`)
  if (fanOut === 0 && fanIn === 0) highlights.push('isolated')
  if (fanOut > 0 && fanIn > 0) highlights.push('bidirectional')
  if (fanOut <= 2 && fanIn <= 2) highlights.push('loosely-coupled')

  blurred.push('internal-quality')
  blurred.push('documentation')

  return { score, highlights, blurred }
}

// ─── Documentation Lens ────────────────────────────────────────────────────────

/**
 * Apply documentation lens.
 * High score = well documented (good).
 *
 * @example
 * applyDocumentationLens('/** Docs *\\/ function foo() {}')
 */
export function applyDocumentationLens(content: string): { score: number; highlights: string[]; blurred: string[] } {
  const highlights: string[] = []
  const blurred: string[] = []
  if (!content || content.trim().length === 0) return { score: 0, highlights, blurred }

  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return { score: 0, highlights, blurred }

  const jsdocBlocks = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const paramTags = (content.match(/@param/g) || []).length
  const returnsTags = (content.match(/@returns/g) || []).length
  const exampleTags = (content.match(/@example/g) || []).length
  const inlineComments = lines.filter((l) => l.trim().startsWith('//')).length
  const typeAnnotations = (content.match(/:\s*(?:string|number|boolean|void|never|unknown)\b/g) || []).length

  const functions = (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) || []).length
  const docRatio = functions > 0 ? jsdocBlocks / functions : 0

  let score = jsdocBlocks * 8 + paramTags * 3 + returnsTags * 3 + exampleTags * 5 + inlineComments * 1 + typeAnnotations * 2 + Math.round(docRatio * 20)
  score = Math.round((score / Math.max(total, 1)) * 100)
  score = Math.max(0, Math.min(100, score))

  if (jsdocBlocks > 0) highlights.push(`jsdoc-coverage(${jsdocBlocks})`)
  if (exampleTags > 0) highlights.push(`has-examples(${exampleTags})`)
  if (docRatio >= 0.8) highlights.push('well-documented')
  if (docRatio < 0.3 && functions > 2) highlights.push('under-documented')
  if (typeAnnotations > 0) highlights.push(`typed(${typeAnnotations})`)

  blurred.push('complexity')
  blurred.push('coupling')

  return { score, highlights, blurred }
}

// ─── Testing Lens ──────────────────────────────────────────────────────────────

/**
 * Apply testing lens.
 * High score = well tested (good).
 *
 * @example
 * applyTestingLens('file.test.ts', ['file.ts', 'file.test.ts', 'other.ts'])
 */
export function applyTestingLens(file: string, allFiles: string[]): { score: number; highlights: string[]; blurred: string[] } {
  const highlights: string[] = []
  const blurred: string[] = []
  if (!file) return { score: 0, highlights, blurred }

  const isTestFile = /\.test\.[jt]s$/.test(file) || /\.spec\.[jt]s$/.test(file)

  let score = 0
  if (isTestFile) {
    score = 60
    const baseName = file.replace(/\.test\.[jt]s$/, '.ts').replace(/\.spec\.[jt]s$/, '.ts')
    const sourceExists = allFiles.includes(baseName)
    if (sourceExists) {
      score += 15
      highlights.push('paired-with-source')
    }
    highlights.push('test-file')
  } else {
    const testName = file.replace(/\.ts$/, '.test.ts').replace(/\.js$/, '.test.js')
    const specName = file.replace(/\.ts$/, '.spec.ts').replace(/\.js$/, '.spec.js')
    const hasTest = allFiles.includes(testName) || allFiles.includes(specName)
    if (hasTest) {
      score = 40
      highlights.push('has-tests')
    } else {
      score = 5
      highlights.push('no-tests')
    }
  }

  const testFiles = allFiles.filter((f) => /\.test\.[jt]s$/.test(f) || /\.spec\.[jt]s$/.test(f))
  const ratio = allFiles.length > 0 ? testFiles.length / allFiles.length : 0
  if (ratio > 0.3) highlights.push(`good-test-ratio(${Math.round(ratio * 100)}%)`)
  else if (ratio < 0.1) highlights.push('low-test-ratio')

  score = Math.max(0, Math.min(100, score))

  blurred.push('source-quality')
  blurred.push('complexity')

  return { score, highlights, blurred }
}

// ─── Freshness Lens ────────────────────────────────────────────────────────────

/**
 * Apply freshness lens.
 * High score = recently maintained (good).
 *
 * @example
 * applyFreshnessLens('file.ts', { linesChanged: 50, totalLines: 200 })
 */
export function applyFreshnessLens(file: string, gitHistory: { linesChanged?: number; totalLines?: number } | null): { score: number; highlights: string[]; blurred: string[] } {
  const highlights: string[] = []
  const blurred: string[] = []
  if (!file) return { score: 0, highlights, blurred }

  let score = 30

  if (gitHistory) {
    const changeRatio = gitHistory.totalLines && gitHistory.totalLines > 0
      ? (gitHistory.linesChanged || 0) / gitHistory.totalLines
      : 0
    score = Math.round(changeRatio * 100)
    score = Math.max(0, Math.min(100, score))

    if (changeRatio > 0.5) highlights.push('heavily-modified')
    else if (changeRatio > 0.1) highlights.push('actively-changed')
    else if (changeRatio === 0) highlights.push('unchanged')
  } else {
    highlights.push('no-git-history')
    score = 50
  }

  blurred.push('quality')
  blurred.push('stability')

  return { score, highlights, blurred }
}

// ─── Stability Lens ────────────────────────────────────────────────────────────

/**
 * Apply stability lens.
 * High score = stable (good).
 *
 * @example
 * applyStabilityLens('function foo() { return 1 }', { changeCount: 0 })
 */
export function applyStabilityLens(content: string, gitHistory: { changeCount?: number } | null): { score: number; highlights: string[]; blurred: string[] } {
  const highlights: string[] = []
  const blurred: string[] = []
  if (!content || content.trim().length === 0) return { score: 0, highlights, blurred }

  let stabilityScore = 80

  if (gitHistory) {
    const changes = gitHistory.changeCount || 0
    if (changes === 0) stabilityScore = 95
    else if (changes <= 2) stabilityScore = 85
    else if (changes <= 5) stabilityScore = 70
    else if (changes <= 10) stabilityScore = 50
    else stabilityScore = 30

    if (changes === 0) highlights.push('never-changed')
    else if (changes <= 2) highlights.push('rarely-changed')
    else if (changes > 10) highlights.push('frequently-changed')
  }

  const hasReadonly = /\breadonly\b/.test(content)
  const hasConst = /\bconst\b/.test(content)
  const hasTodo = /TODO|FIXME|HACK/i.test(content)

  if (hasReadonly) { stabilityScore = Math.min(100, stabilityScore + 5); highlights.push('uses-readonly') }
  if (hasConst) { stabilityScore = Math.min(100, stabilityScore + 3) }
  if (hasTodo) { stabilityScore = Math.max(0, stabilityScore - 10); highlights.push('has-todos') }

  if (highlights.length === 0) highlights.push('stable')
  blurred.push('documentation')
  blurred.push('testing')

  return { score: Math.max(0, Math.min(100, stabilityScore)), highlights, blurred }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute maximum nesting depth.
 *
 * @example
 * computeMaxNesting('if (x) { if (y) { if (z) {} } }') // 3
 */
export function computeMaxNesting(content: string): number {
  let maxDepth = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') {
      depth++
      if (depth > maxDepth) maxDepth = depth
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1)
    }
  }
  return maxDepth
}

/**
 * Compute sharpness (confidence) for a score.
 *
 * @example
 * computeSharpness(50, 'function foo() {}') // moderate
 */
export function computeSharpness(score: number, content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n').length
  if (lines <= 2) return 40

  const baseSharpness = Math.min(90, 50 + lines)
  const scoreExtremeness = Math.abs(score - 50) / 50
  return Math.round(Math.min(100, baseSharpness * (0.7 + scoreExtremeness * 0.3)))
}

/**
 * Classify distribution of scores.
 *
 * @example
 * classifyDistribution([10, 20, 30, 40, 50]) // 'uniform'
 */
export function classifyDistribution(scores: number[]): 'uniform' | 'normal' | 'skewed' | 'bimodal' {
  if (scores.length < 3) return 'uniform'

  const sorted = [...scores].sort((a, b) => a - b)
  const min = sorted[0] ?? 0
  const max = sorted[sorted.length - 1] ?? 0
  const range = max - min
  if (range === 0) return 'uniform'

  const mid = Math.floor(sorted.length / 2)
  const lowerHalf = sorted.slice(0, mid)
  const upperHalf = sorted.slice(mid)

  const lowerAvg = lowerHalf.reduce((s, v) => s + v, 0) / lowerHalf.length
  const upperAvg = upperHalf.reduce((s, v) => s + v, 0) / upperHalf.length
  const overallAvg = sorted.reduce((s, v) => s + v, 0) / sorted.length

  const median = sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0)

  const deviationFromMedian = Math.abs(overallAvg - median) / range
  if (deviationFromMedian > 0.2) return 'skewed'

  const gap = Math.abs(upperAvg - lowerAvg)
  if (gap < range * 0.3) return 'uniform'

  const buckets = [0, 0, 0, 0, 0]
  for (const s of sorted) {
    const bucket = Math.min(4, Math.floor((s - min) / (range || 1) * 5))
    if (buckets[bucket] !== undefined) buckets[bucket]++
  }

  const nonEmpty = buckets.filter((b) => b > 0).length
  if (nonEmpty <= 2) return 'bimodal'

  return 'normal'
}

/**
 * Find top-focus files.
 *
 * @example
 * findTopFocus(results, 3)
 */
export function findTopFocus(results: FocusResult[], count: number): string[] {
  return [...results].sort((a, b) => b.score - a.score).slice(0, count).map((r) => r.file)
}

/**
 * Find bottom-focus files.
 *
 * @example
 * findBottomFocus(results, 3)
 */
export function findBottomFocus(results: FocusResult[], count: number): string[] {
  return [...results].sort((a, b) => a.score - b.score).slice(0, count).map((r) => r.file)
}

/**
 * Extract imports from content.
 *
 * @example
 * extractImports("import { foo } from './bar'") // ['./bar']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const matches = content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []
  for (const m of matches) {
    if (m[1]) imports.push(m[1])
  }
  return imports
}

/**
 * Resolve import path to known file.
 *
 * @example
 * resolveImportPath('./utils', new Set(['utils.ts'])) // 'utils.ts'
 */
export function resolveImportPath(importPath: string, knownFiles: Set<string>): string | null {
  let stripped = importPath.replace(/^\.\//, '')
  const candidates = [stripped, stripped + '.ts', stripped + '.js', stripped + '.tsx', stripped + '.jsx', stripped + '/index.ts', stripped + '/index.js']
  for (const c of candidates) {
    if (knownFiles.has(c)) return c
  }
  return null
}

// ─── Stats Computation ─────────────────────────────────────────────────────────

/**
 * Compute overall clarity (average sharpness).
 *
 * @example
 * computeOverallClarity(views)
 */
export function computeOverallClarity(views: LensView[]): number {
  if (views.length === 0) return 0
  let totalSharpness = 0
  let count = 0
  for (const view of views) {
    for (const r of view.results) {
      totalSharpness += r.sharpness
      count++
    }
  }
  return count > 0 ? Math.round(totalSharpness / count) : 0
}

/**
 * Find best overall file (highest average across lenses).
 *
 * @example
 * findBestOverallFile(views)
 */
export function findBestOverallFile(views: LensView[]): string {
  return findFileByVariance(views, 'best')
}

/**
 * Find worst overall file (lowest average across lenses).
 *
 * @example
 * findWorstOverallFile(views)
 */
export function findWorstOverallFile(views: LensView[]): string {
  return findFileByVariance(views, 'worst')
}

/**
 * Find most consistent file (smallest score variance).
 *
 * @example
 * findMostConsistent(views)
 */
export function findMostConsistent(views: LensView[]): string {
  return findFileByVariance(views, 'consistent')
}

/**
 * Find most polarizing file (largest score variance).
 *
 * @example
 * findMostPolarizing(views)
 */
export function findMostPolarizing(views: LensView[]): string {
  return findFileByVariance(views, 'polarizing')
}

function findFileByVariance(views: LensView[], mode: 'best' | 'worst' | 'consistent' | 'polarizing'): string {
  if (views.length === 0) return ''
  const fileScores: Record<string, number[]> = {}
  for (const view of views) {
    for (const r of view.results) {
      const file = r.file ?? ''
      if (!fileScores[file]) fileScores[file] = []
      fileScores[file].push(r.score)
    }
  }

  let bestFile = ''
  let bestValue = mode === 'best' ? -1 : mode === 'worst' ? Infinity : mode === 'consistent' ? Infinity : -1

  for (const [file, scores] of Object.entries(fileScores)) {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length
    const variance = scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length

    if (mode === 'best' && avg > bestValue) { bestValue = avg; bestFile = file }
    else if (mode === 'worst' && avg < bestValue) { bestValue = avg; bestFile = file }
    else if (mode === 'consistent' && variance < bestValue) { bestValue = variance; bestFile = file }
    else if (mode === 'polarizing' && variance > bestValue) { bestValue = variance; bestFile = file }
  }

  return bestFile
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate lens recommendations.
 *
 * @example
 * generateLensRecommendations(views, stats)
 */
export function generateLensRecommendations(views: LensView[], stats: LensStats): string[] {
  const recs: string[] = []

  const worstLens = [...views].sort((a, b) => a.avgScore - b.avgScore)[0]
  if (worstLens && worstLens.avgScore < 40) {
    recs.push(`Priority: improve ${worstLens.lens.name} — average score only ${worstLens.avgScore}`)
  }

  if (stats.mostPolarizing) {
    recs.push(`Investigate "${stats.mostPolarizing}" — scores vary wildly across lenses`)
  }

  if (stats.mostConsistent) {
    recs.push(`Use "${stats.mostConsistent}" as a standard — consistent scores across all lenses`)
  }

  for (const view of views) {
    const lowScores = view.results.filter((r) => r.score < 20)
    if (lowScores.length > view.results.length * 0.5) {
      recs.push(`${view.lens.name}: over half of files score below 20 — systemic issue`)
    }
  }

  if (stats.overallClarity < 40) {
    recs.push('Low overall clarity — add more code to files for better analysis confidence')
  }

  if (recs.length === 0) {
    recs.push('Codebase looks well-balanced across all lenses')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete lens result.
 *
 * @example
 * buildLensResult(['a.ts'], ['function foo() {}'], {})
 */
export function buildLensResult(files: string[], contents: string[], options: LensOptions): LensResult {
  const knownSet = new Set(files)
  const views: LensView[] = []

  for (const lens of LENSES) {
    const results: FocusResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const content = contents[i] || ''
      let lensResult: { score: number; highlights: string[]; blurred: string[] }

      switch (lens.name) {
        case 'complexity':
          lensResult = applyComplexityLens(content)
          break
        case 'coupling': {
          const imports = extractImports(content).map((imp) => resolveImportPath(imp, knownSet)).filter((r): r is string => r !== null)
          const importedBy: string[] = []
          for (let j = 0; j < files.length; j++) {
            if (j === i) continue
            const otherFile = files[j]
            const otherContent = contents[j]
            if (otherFile === undefined || otherContent === undefined) continue
            const otherImports = extractImports(otherContent)
            for (const imp of otherImports) {
              if (resolveImportPath(imp, knownSet) === file) {
                importedBy.push(otherFile)
                break
              }
            }
          }
          lensResult = applyCouplingLens(file ?? '', imports, importedBy)
          break
        }
        case 'documentation':
          lensResult = applyDocumentationLens(content)
          break
        case 'testing':
          lensResult = applyTestingLens(file ?? '', [...files])
          break
        case 'freshness':
          lensResult = applyFreshnessLens(file ?? '', null)
          break
        case 'stability':
          lensResult = applyStabilityLens(content, null)
          break
        default:
          lensResult = { score: 0, highlights: [], blurred: [] }
      }

      const sharpness = computeSharpness(lensResult.score, content)

      results.push({
        file: file ?? '',
        score: lensResult.score,
        rank: 0,
        highlights: lensResult.highlights,
        blurred: lensResult.blurred,
        sharpness,
      })
    }

    const sorted = [...results].sort((a, b) => b.score - a.score)
    for (let i = 0; i < results.length; i++) {
      const current = results[i]
      if (current === undefined) continue
      const rank = sorted.findIndex((r) => r.file === current.file) + 1
      current.rank = rank
    }

    const scores = results.map((r) => r.score)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0

    views.push({
      lens,
      results,
      topFocus: findTopFocus(results, 5),
      bottomFocus: findBottomFocus(results, 5),
      avgScore,
      distribution: classifyDistribution(scores),
    })
  }

  const overallClarity = computeOverallClarity(views)
  const bestOverallFile = findBestOverallFile(views)
  const worstOverallFile = findWorstOverallFile(views)
  const mostConsistent = findMostConsistent(views)
  const mostPolarizing = findMostPolarizing(views)

  const distCounts: Record<string, number> = {}
  for (const v of views) {
    distCounts[v.distribution] = (distCounts[v.distribution] || 0) + 1
  }
  const dominantDistribution = Object.entries(distCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'uniform'

  const stats: LensStats = {
    lensCount: LENSES.length,
    totalFiles: files.length,
    bestOverallFile,
    worstOverallFile,
    mostConsistent,
    mostPolarizing,
    overallClarity,
    dominantDistribution,
  }

  const recommendations = generateLensRecommendations(views, stats)

  if (options.verbose) {
    for (const view of views) {
      for (const r of view.results) {
        if (r.highlights.length === 0) {
          r.highlights.push('no-significant-features')
        }
      }
    }
  }

  return { views, stats, recommendations }
}
