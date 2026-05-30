// ─── Types ────────────────────────────────────────────────────────────────────

export type CrystallizationLevel = 'fluid' | 'forming' | 'crystallizing' | 'crystallized' | 'diamond'

export interface CrystallizationFactor {
  name: string
  score: number
  weight: number
  description: string
  evidence: string
}

export interface CrystallizationScore {
  file: string
  score: number
  level: CrystallizationLevel
  factors: CrystallizationFactor[]
  recommendations: string[]
}

export interface FileMaturity {
  file: string
  age: number
  changeCount: number
  changeFrequency: number
  testCoverage: number
  documentationCoverage: number
  complexity: number
  exportCount: number
  isEntryFile: boolean
  hasDedicatedTests: boolean
}

export interface CrystallizeStats {
  totalFiles: number
  averageScore: number
  fluidCount: number
  formingCount: number
  crystallizingCount: number
  crystallizedCount: number
  diamondCount: number
  averageAge: number
  averageTestCoverage: number
  averageDocCoverage: number
}

export interface CrystallizeResult {
  files: CrystallizationScore[]
  maturity: FileMaturity[]
  stats: CrystallizeStats
  needsAttention: CrystallizationScore[]
  bestPractices: CrystallizationScore[]
  recommendations: string[]
}

export interface CrystallizeOptions {
  verbose?: boolean
  ageOverride?: number
  changeCountOverride?: number
}

// ─── computeStabilityScore ────────────────────────────────────────────────────

/**
 * Score stability based on change frequency. Less changes = more stable.
 *
 * @example
 * computeStabilityScore(0, 365)
 * // => 100
 */
export function computeStabilityScore(changeCount: number, age: number): number {
  if (age <= 0) return 50
  const changesPerWeek = (changeCount / age) * 7
  if (changeCount === 0) return 100
  if (changesPerWeek > 1) return 0
  if (changesPerWeek > 0.5) return 20
  if (changesPerWeek > 0.2) return 40
  if (changesPerWeek > 0.1) return 60
  return 80
}

// ─── computeAgeScore ──────────────────────────────────────────────────────────

/**
 * Score age: older files are more crystallized.
 *
 * @example
 * computeAgeScore(400)
 * // => 100
 */
export function computeAgeScore(ageDays: number): number {
  if (ageDays > 365) return 100
  if (ageDays > 180) return 80
  if (ageDays > 90) return 60
  if (ageDays > 30) return 40
  return 20
}

// ─── computeTestScore ─────────────────────────────────────────────────────────

/**
 * Score test coverage based on dedicated test file and assertion density.
 *
 * @example
 * computeTestScore(true, 80)
 * // => 90
 */
export function computeTestScore(hasTests: boolean, testCoverage: number): number {
  if (!hasTests) return 20
  if (testCoverage >= 90) return 100
  if (testCoverage >= 70) return 90
  if (testCoverage >= 50) return 70
  return 40
}

// ─── computeDocScore ──────────────────────────────────────────────────────────

/**
 * Score documentation coverage.
 *
 * @example
 * computeDocScore(85)
 * // => 85
 */
export function computeDocScore(jsDocCoverage: number): number {
  if (jsDocCoverage >= 90) return 100
  if (jsDocCoverage >= 70) return 85
  if (jsDocCoverage >= 50) return 60
  if (jsDocCoverage > 0) return 40
  return 20
}

// ─── computeComplexityScore ───────────────────────────────────────────────────

/**
 * Score complexity: low complexity = more crystallized.
 *
 * @example
 * computeComplexityScore(3)
 * // => 100
 */
export function computeComplexityScore(complexity: number): number {
  if (complexity < 5) return 100
  if (complexity <= 10) return 80
  if (complexity <= 20) return 50
  return 20
}

// ─── computeEncapsulationScore ────────────────────────────────────────────────

/**
 * Score encapsulation: fewer exports = more stable interface.
 *
 * @example
 * computeEncapsulationScore(2)
 * // => 100
 */
export function computeEncapsulationScore(exports: number): number {
  if (exports <= 3) return 100
  if (exports <= 10) return 70
  return 40
}

// ─── classifyCrystallization ──────────────────────────────────────────────────

/**
 * Classify a score into a crystallization level.
 *
 * @example
 * classifyCrystallization(85)
 * // => 'diamond'
 */
export function classifyCrystallization(score: number): CrystallizationLevel {
  if (score >= 80) return 'diamond'
  if (score >= 60) return 'crystallized'
  if (score >= 40) return 'crystallizing'
  if (score >= 20) return 'forming'
  return 'fluid'
}

// ─── computeMaturity ──────────────────────────────────────────────────────────

/**
 * Compute maturity indicators for a file from its content.
 *
 * @example
 * computeMaturity('export function foo() {}', 'foo.ts', {})
 */
export function computeMaturity(
  content: string,
  filePath: string,
  options?: CrystallizeOptions,
): FileMaturity {
  const lines = content.split('\n')
  const age = options?.ageOverride ?? 180
  const changeCount = options?.changeCountOverride ?? 5

  const exportCount = countExports(content)
  const jsDocCoverage = computeJsDocCoverage(lines)
  const complexity = computeFileComplexity(content)
  const isEntryFile = /^(index|main|app|mod)\.(ts|js|tsx|jsx|mjs)$/.test(filePath.split('/').pop() ?? '')
  const hasDedicatedTests = false
  const testCoverage = hasDedicatedTests ? 70 : estimateTestCoverage(content)
  const changeFrequency = age > 0 ? (changeCount / age) * 7 : 0

  return {
    file: filePath,
    age,
    changeCount,
    changeFrequency: Math.round(changeFrequency * 100) / 100,
    testCoverage,
    documentationCoverage: jsDocCoverage,
    complexity,
    exportCount,
    isEntryFile,
    hasDedicatedTests,
  }
}

function countExports(content: string): number {
  let count = 0
  const patterns = [
    /export\s+(?:async\s+)?function\s+\w+/g,
    /export\s+class\s+\w+/g,
    /export\s+interface\s+\w+/g,
    /export\s+type\s+\w+/g,
    /export\s+const\s+\w+/g,
    /export\s+enum\s+\w+/g,
    /export\s+\{[^}]+\}/g,
    /export\s+default\s+/g,
  ]
  for (const p of patterns) {
    const matches = content.match(p)
    if (matches) count += matches.length
  }
  return count
}

function computeJsDocCoverage(lines: string[]): number {
  const exportLines = lines.filter((l) => /^\s*export\s/.test(l) && !/^\s*\/\//.test(l))
  if (exportLines.length === 0) return 100

  let documented = 0
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*export\s/.test(lines[i] ?? '') && !/^\s*\/\//.test(lines[i] ?? '')) {
      if (i > 0 && /\*\//.test(lines[i - 1] ?? '')) documented++
      else if (i > 1 && /\*\//.test(lines[i - 2] ?? '') && /^\s*\*\s*$/.test(lines[i - 1] ?? '')) documented++
    }
  }

  return Math.round((documented / exportLines.length) * 100)
}

function computeFileComplexity(content: string): number {
  let complexity = 0
  const patterns = [/\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\?[^.?]/g, /&&/g, /\|\|/g]
  for (const p of patterns) {
    const m = content.match(p)
    if (m) complexity += m.length
  }
  return complexity
}

function estimateTestCoverage(content: string): number {
  const hasDescribe = /\bdescribe\s*\(/.test(content)
  const hasIt = /\bit\s*\(/.test(content) || /\btest\s*\(/.test(content)
  const hasExpect = /\bexpect\s*\(/.test(content)
  const hasAssert = /\bassert\s*\(/.test(content)

  if (hasDescribe && hasIt && (hasExpect || hasAssert)) return 70
  if (hasIt && (hasExpect || hasAssert)) return 50
  if (hasDescribe || hasIt) return 30
  return 10
}

// ─── computeCrystallizationScore ──────────────────────────────────────────────

/**
 * Compute weighted crystallization score from maturity factors.
 *
 * @example
 * computeCrystallizationScore(maturity)
 */
export function computeCrystallizationScore(maturity: FileMaturity): CrystallizationScore {
  const stability = computeStabilityScore(maturity.changeCount, maturity.age)
  const age = computeAgeScore(maturity.age)
  const test = computeTestScore(maturity.hasDedicatedTests, maturity.testCoverage)
  const doc = computeDocScore(maturity.documentationCoverage)
  const complexity = computeComplexityScore(maturity.complexity)
  const encapsulation = computeEncapsulationScore(maturity.exportCount)

  const factors: CrystallizationFactor[] = [
    { name: 'Stability', score: stability, weight: 0.20, description: 'Change frequency', evidence: `${maturity.changeCount} changes over ${maturity.age} days` },
    { name: 'Age', score: age, weight: 0.10, description: 'File age', evidence: `${maturity.age} days old` },
    { name: 'Tests', score: test, weight: 0.25, description: 'Test coverage', evidence: maturity.hasDedicatedTests ? `coverage ~${maturity.testCoverage}%` : 'no dedicated tests' },
    { name: 'Documentation', score: doc, weight: 0.20, description: 'JSDoc coverage', evidence: `${maturity.documentationCoverage}% documented` },
    { name: 'Complexity', score: complexity, weight: 0.15, description: 'Cyclomatic complexity', evidence: `complexity ${maturity.complexity}` },
    { name: 'Encapsulation', score: encapsulation, weight: 0.10, description: 'Export count', evidence: `${maturity.exportCount} exports` },
  ]

  const weightedScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  const score = Math.round(weightedScore)
  const level = classifyCrystallization(score)
  const recommendations = generateFileRecommendations(score, maturity, factors)

  return { file: maturity.file, score, level, factors, recommendations }
}

// ─── generateFileRecommendations ──────────────────────────────────────────────

/**
 * Generate targeted recommendations for a single file.
 *
 * @example
 * generateFileRecommendations(45, maturity, factors)
 */
export function generateFileRecommendations(
  score: number,
  maturity: FileMaturity,
  factors: CrystallizationFactor[],
): string[] {
  const recs: string[] = []

  if (score < 30) {
    recs.push('High priority: file needs significant stabilization effort')
  }

  const weakest = factors.reduce((w, f) => f.score < w.score ? f : w, factors[0] as typeof factors[number])
  if (weakest && weakest.score < 50) {
    recs.push(`Weakest factor: ${weakest.name} (${weakest.score}/100) — ${weakest.evidence}`)
  }

  if (!maturity.hasDedicatedTests) {
    recs.push('Add dedicated test file')
  }

  if (maturity.documentationCoverage < 50) {
    recs.push(`Improve documentation (currently ${maturity.documentationCoverage}%)`)
  }

  if (maturity.complexity > 20) {
    recs.push(`Reduce complexity (${maturity.complexity}) by extracting functions`)
  }

  if (maturity.exportCount > 10) {
    recs.push(`Consider splitting (${maturity.exportCount} exports) into smaller modules`)
  }

  if (recs.length === 0) {
    recs.push('File is well-crystallized — maintain current practices')
  }

  return recs
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate overall recommendations.
 *
 * @example
 * generateRecommendations(needsAttention, bestPractices, stats)
 */
export function generateRecommendations(
  needsAttention: CrystallizationScore[],
  _bestPractices: CrystallizationScore[],
  stats: CrystallizeStats,
): string[] {
  const recs: string[] = []

  if (needsAttention.length > 0) {
    recs.push(`${needsAttention.length} file(s) need attention (score < 30): ${needsAttention.slice(0, 3).map((f) => f.file).join(', ')}`)
  }

  if (stats.fluidCount > stats.totalFiles * 0.3) {
    recs.push(`${Math.round(stats.fluidCount / stats.totalFiles * 100)}% of files are in fluid state — prioritize stabilization`)
  }

  if (stats.averageTestCoverage < 40) {
    recs.push(`Low average test coverage (${Math.round(stats.averageTestCoverage)}%) — invest in testing`)
  }

  if (stats.averageDocCoverage < 40) {
    recs.push(`Low average documentation (${Math.round(stats.averageDocCoverage)}%) — add JSDoc to public APIs`)
  }

  if (recs.length === 0) {
    recs.push('Codebase crystallization is healthy — good maturity across files')
  }

  return recs
}

// ─── buildCrystallizeResult ───────────────────────────────────────────────────

/**
 * Build the complete crystallization analysis result.
 *
 * @example
 * buildCrystallizeResult(['a.ts'], ['export function foo() {}'])
 */
export function buildCrystallizeResult(
  filePaths: string[],
  contents: string[],
  options?: CrystallizeOptions,
): CrystallizeResult {
  const maturity: FileMaturity[] = []
  const scores: CrystallizationScore[] = []

  for (let i = 0; i < filePaths.length; i++) {
    const content = contents[i] ?? ''
    const filePath = filePaths[i] ?? ''
    const mat = computeMaturity(content, filePath, options)
    maturity.push(mat)
    scores.push(computeCrystallizationScore(mat))
  }

  const totalFiles = scores.length
  const averageScore = totalFiles > 0
    ? Math.round(scores.reduce((s, f) => s + f.score, 0) / totalFiles * 10) / 10
    : 0
  const fluidCount = scores.filter((s) => s.level === 'fluid').length
  const formingCount = scores.filter((s) => s.level === 'forming').length
  const crystallizingCount = scores.filter((s) => s.level === 'crystallizing').length
  const crystallizedCount = scores.filter((s) => s.level === 'crystallized').length
  const diamondCount = scores.filter((s) => s.level === 'diamond').length

  const averageAge = totalFiles > 0
    ? Math.round(maturity.reduce((s, m) => s + m.age, 0) / totalFiles)
    : 0
  const averageTestCoverage = totalFiles > 0
    ? Math.round(maturity.reduce((s, m) => s + m.testCoverage, 0) / totalFiles * 10) / 10
    : 0
  const averageDocCoverage = totalFiles > 0
    ? Math.round(maturity.reduce((s, m) => s + m.documentationCoverage, 0) / totalFiles * 10) / 10
    : 0

  const stats: CrystallizeStats = {
    totalFiles,
    averageScore,
    fluidCount,
    formingCount,
    crystallizingCount,
    crystallizedCount,
    diamondCount,
    averageAge,
    averageTestCoverage,
    averageDocCoverage,
  }

  const needsAttention = scores.filter((s) => s.score < 30).sort((a, b) => a.score - b.score)
  const bestPractices = scores.filter((s) => s.score > 80).sort((a, b) => b.score - a.score)
  const recommendations = generateRecommendations(needsAttention, bestPractices, stats)

  return { files: scores, maturity, stats, needsAttention, bestPractices, recommendations }
}
