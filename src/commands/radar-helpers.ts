// ─── Types ────────────────────────────────────────────────────────────────────

export interface RadarDimension {
  name: string
  score: number
  grade: string
  weight: number
  description: string
  findings: string[]
}

export interface RadarChart {
  dimensions: RadarDimension[]
  overall: number
  overallGrade: string
  shape: string
  strengths: string[]
  weaknesses: string[]
}

export interface RadarStats {
  totalDimensions: number
  dimensionsAbove80: number
  dimensionsBelow50: number
  standardDeviation: number
  balanceScore: number
}

export interface RadarResult {
  chart: RadarChart
  asciiArt: string[]
  stats: RadarStats
  recommendations: string[]
}

export interface RadarOptions {
  verbose?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 65) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

function countPatterns(contents: string[], patterns: RegExp[]): number {
  let count = 0
  for (const content of contents) {
    for (const pattern of patterns) {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    }
  }
  return count
}

function countLines(contents: string[]): number {
  return contents.reduce((s, c) => s + c.split('\n').length, 0)
}

// ─── computeComplexityScore ───────────────────────────────────────────────────

/**
 * Score based on cyclomatic complexity patterns.
 *
 * @example
 * computeComplexityScore(['a.ts'], ['if (x) { if (y) {} }']) // 0-100
 */
export function computeComplexityScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  const totalLines = countLines(contents) || 1
  const ifCount = countPatterns(contents, [/\bif\s*\(/g])
  const elseCount = countPatterns(contents, [/\belse\b/g])
  const switchCount = countPatterns(contents, [/\bswitch\s*\(/g])
  const ternaryCount = countPatterns(contents, [/\?[^?]*:/g])
  const totalBranches = ifCount + elseCount + switchCount + ternaryCount
  const branchingDensity = totalBranches / totalLines

  let score = 100
  if (branchingDensity > 0.3) {
    score -= 40
    findings.push(`High branching density: ${branchingDensity.toFixed(2)} branches/line`)
  } else if (branchingDensity > 0.15) {
    score -= 15
    findings.push(`Moderate branching density: ${branchingDensity.toFixed(2)} branches/line`)
  }

  const maxNesting = contents.reduce((max, c) => {
    let depth = 0
    let localMax = 0
    for (const ch of c) {
      if (ch === '{') { depth++; localMax = Math.max(localMax, depth) }
      if (ch === '}') depth--
    }
    return Math.max(max, localMax)
  }, 0)

  if (maxNesting > 5) {
    score -= 25
    findings.push(`Deep nesting detected: ${maxNesting} levels`)
  } else if (maxNesting > 3) {
    score -= 10
    findings.push(`Moderate nesting: ${maxNesting} levels`)
  }

  score = Math.max(0, Math.min(100, score))
  if (findings.length === 0) findings.push('Complexity is within acceptable range')

  return { name: 'Complexity', score, grade: scoreToGrade(score), weight: 1.2, description: 'Cyclomatic complexity and branching density', findings }
}

// ─── computeDocumentationScore ────────────────────────────────────────────────

/**
 * Score based on comment ratio and JSDoc coverage.
 *
 * @example
 * computeDocumentationScore(['a.ts'], ['// docs\nfunction f() {}']) // 0-100
 */
export function computeDocumentationScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  let totalLines = 0
  let commentLines = 0
  let jsdocCount = 0
  let funcCount = 0

  for (const content of contents) {
    const lines = content.split('\n')
    totalLines += lines.length
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        commentLines++
      }
    }
    const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g)
    if (jsdocMatches) jsdocCount += jsdocMatches.length
    const funcMatches = content.match(/\bfunction\s+\w+/g)
    if (funcMatches) funcCount += funcMatches.length
    const arrowMatches = content.match(/(?:const|let)\s+\w+\s*=\s*(?:async\s*)?\(/g)
    if (arrowMatches) funcCount += arrowMatches.length
  }

  const commentRatio = totalLines > 0 ? commentLines / totalLines : 0
  const jsdocCoverage = funcCount > 0 ? jsdocCount / funcCount : (jsdocCount > 0 ? 1 : 0)

  let score = 30
  if (commentRatio > 0.15) score += 20
  else if (commentRatio > 0.05) score += 10
  if (jsdocCoverage > 0.5) score += 30
  else if (jsdocCoverage > 0.2) score += 15
  if (commentRatio > 0.25) score += 20
  else if (commentRatio > 0.1) score += 10

  score = Math.min(100, score)

  if (commentRatio < 0.05) findings.push('Very low comment ratio')
  if (jsdocCoverage < 0.2) findings.push(`Low JSDoc coverage: ${(jsdocCoverage * 100).toFixed(0)}%`)
  if (findings.length === 0) findings.push('Documentation is adequate')

  return { name: 'Documentation', score, grade: scoreToGrade(score), weight: 1.0, description: 'Comment ratio and JSDoc coverage', findings }
}

// ─── computeTestingScore ──────────────────────────────────────────────────────

/**
 * Score based on test-to-source file ratio.
 *
 * @example
 * computeTestingScore(['a.ts'], ['describe("x", () => {})']) // 0-100
 */
export function computeTestingScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  const testFiles = files.filter((f) => f.includes('.test.') || f.includes('.spec.') || f.includes('test/'))
  const sourceFiles = files.filter((f) => !f.includes('.test.') && !f.includes('.spec.') && !f.includes('test/'))

  const testRatio = sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0
  const describeCount = countPatterns(contents, [/\bdescribe\s*\(/g])
  const itCount = countPatterns(contents, [/\bit\s*\(/g])
  const expectCount = countPatterns(contents, [/\bexpect\s*\(/g])

  let score = 20
  if (testRatio > 0.8) score += 40
  else if (testRatio > 0.4) score += 25
  else if (testRatio > 0.1) score += 10
  if (describeCount > 0 && itCount > 0) score += 20
  if (expectCount > itCount) score += 20
  score = Math.min(100, score)

  if (testRatio < 0.1) findings.push(`Very low test-to-source ratio: ${testRatio.toFixed(2)}`)
  if (itCount === 0) findings.push('No test assertions found')
  if (findings.length === 0) findings.push(`Test ratio: ${testRatio.toFixed(2)}, ${itCount} test cases`)

  return { name: 'Testing', score, grade: scoreToGrade(score), weight: 1.3, description: 'Test-to-source ratio and assertion density', findings }
}

// ─── computeSecurityScore ─────────────────────────────────────────────────────

/**
 * Score based on dangerous patterns.
 *
 * @example
 * computeSecurityScore(['a.ts'], ['eval("x")']) // 0-100
 */
export function computeSecurityScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  const evalCount = countPatterns(contents, [/\beval\s*\(/g])
  const innerHtmlCount = countPatterns(contents, [/\.innerHTML\s*=/g])
  const hardcodedSecrets = countPatterns(contents, [/password\s*=\s*['"]/gi])
  const dangerousFlags = evalCount + innerHtmlCount + hardcodedSecrets

  let score = 100
  score -= evalCount * 25
  score -= innerHtmlCount * 15
  score -= hardcodedSecrets * 20
  score = Math.max(0, score)

  if (evalCount > 0) findings.push(`eval() usage found: ${evalCount} occurrence(s)`)
  if (innerHtmlCount > 0) findings.push(`innerHTML assignment: ${innerHtmlCount} occurrence(s)`)
  if (hardcodedSecrets > 0) findings.push('Potential hardcoded secrets detected')
  if (findings.length === 0) findings.push('No dangerous patterns detected')

  return { name: 'Security', score, grade: scoreToGrade(score), weight: 1.4, description: 'Dangerous patterns and hardcoded values', findings }
}

// ─── computePerformanceScore ──────────────────────────────────────────────────

/**
 * Score based on performance anti-patterns.
 *
 * @example
 * computePerformanceScore(['a.ts'], ['for (let i = 0; i < 10000; i++) {}']) // 0-100
 */
export function computePerformanceScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  const syncReadCount = countPatterns(contents, [/\breadFileSync\b/g, /\bwriteFileSync\b/g])
  const deepCopyCount = countPatterns(contents, [/JSON\.parse\(JSON\.stringify/g])
  const largeLoopCount = countPatterns(contents, [/\bfor\s*\(.*10000/g, /\bfor\s*\(.*100000/g])
  const blockingCount = syncReadCount + deepCopyCount

  let score = 100
  score -= syncReadCount * 10
  score -= deepCopyCount * 8
  score -= largeLoopCount * 5
  score = Math.max(0, Math.min(100, score))

  if (syncReadCount > 0) findings.push(`Sync file operations: ${syncReadCount}`)
  if (deepCopyCount > 0) findings.push(`JSON.parse/stringify deep copies: ${deepCopyCount}`)
  if (findings.length === 0) findings.push('No obvious performance anti-patterns')

  return { name: 'Performance', score, grade: scoreToGrade(score), weight: 1.1, description: 'Performance anti-patterns and blocking calls', findings }
}

// ─── computeMaintainabilityScore ──────────────────────────────────────────────

/**
 * Score based on function/file size and nesting.
 *
 * @example
 * computeMaintainabilityScore(['a.ts'], ['function f() {}']) // 0-100
 */
export function computeMaintainabilityScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  let longFunctions = 0
  let totalFunctions = 0
  let bigFiles = 0

  for (const content of contents) {
    const lines = content.split('\n')
    if (lines.length > 300) bigFiles++
    const funcMatches = content.match(/\bfunction\s+\w+/g)
    if (funcMatches) totalFunctions += funcMatches.length
  }

  for (const content of contents) {
    const lines = content.split('\n')
    let funcStart = -1
    let braceCount = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      for (const ch of line) {
        if (ch === '{') braceCount++
        if (ch === '}') braceCount--
      }
      if (/\bfunction\s+\w+/.test(line)) funcStart = i
      if (funcStart >= 0 && braceCount === 0 && i > funcStart) {
        if (i - funcStart > 50) longFunctions++
        funcStart = -1
      }
    }
  }

  let score = 100
  score -= bigFiles * 15
  score -= longFunctions * 10
  score = Math.max(0, Math.min(100, score))

  if (bigFiles > 0) findings.push(`${bigFiles} file(s) over 300 lines`)
  if (longFunctions > 0) findings.push(`${longFunctions} function(s) over 50 lines`)
  if (findings.length === 0) findings.push('Function and file sizes are manageable')

  return { name: 'Maintainability', score, grade: scoreToGrade(score), weight: 1.2, description: 'Function size, file size, and nesting depth', findings }
}

// ─── computeCouplingScore ─────────────────────────────────────────────────────

/**
 * Score based on import count and dependency patterns.
 *
 * @example
 * computeCouplingScore(['a.ts'], ['import a from "a"\nimport b from "b"']) // 0-100
 */
export function computeCouplingScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  let totalImports = 0
  let highImportFiles = 0

  for (const content of contents) {
    const importMatches = content.match(/^import\s/gm)
    const fileImports = importMatches ? importMatches.length : 0
    totalImports += fileImports
    if (fileImports > 10) highImportFiles++
  }

  const avgImports = files.length > 0 ? totalImports / files.length : 0

  let score = 100
  if (avgImports > 8) { score -= 30; findings.push(`High avg imports/file: ${avgImports.toFixed(1)}`) }
  else if (avgImports > 5) { score -= 15; findings.push(`Moderate avg imports/file: ${avgImports.toFixed(1)}`) }
  if (highImportFiles > 0) { score -= highImportFiles * 10; findings.push(`${highImportFiles} file(s) with 10+ imports`) }
  score = Math.max(0, Math.min(100, score))

  if (findings.length === 0) findings.push('Import counts are within acceptable range')

  return { name: 'Coupling', score, grade: scoreToGrade(score), weight: 1.1, description: 'Import count and dependency patterns', findings }
}

// ─── computeConsistencyScore ──────────────────────────────────────────────────

/**
 * Score based on naming and style uniformity.
 *
 * @example
 * computeConsistencyScore(['a.ts'], ['const fooBar = 1\nconst bazQux = 2']) // 0-100
 */
export function computeConsistencyScore(files: string[], contents: string[]): RadarDimension {
  const findings: string[] = []
  const camelCase = countPatterns(contents, [/\b[a-z][a-zA-Z0-9]*\b/g])
  const snakeCase = countPatterns(contents, [/\b[a-z][a-z0-9_]*\b/g])
  const importStyles = { esm: 0, commonjs: 0 }
  let quotesSingle = 0
  let quotesDouble = 0

  for (const content of contents) {
    const esmMatches = content.match(/^import\s/gm)
    const cjsMatches = content.match(/require\s*\(/g)
    importStyles.esm += esmMatches ? esmMatches.length : 0
    importStyles.commonjs += cjsMatches ? cjsMatches.length : 0
    const singleMatches = content.match(/'/g)
    const doubleMatches = content.match(/"/g)
    quotesSingle += singleMatches ? singleMatches.length : 0
    quotesDouble += doubleMatches ? doubleMatches.length : 0
  }

  let score = 100
  if (importStyles.esm > 0 && importStyles.commonjs > 0) {
    score -= 20
    findings.push('Mixed import styles (ESM and CommonJS)')
  }
  if (quotesSingle > 0 && quotesDouble > 0) {
    const ratio = Math.min(quotesSingle, quotesDouble) / Math.max(quotesSingle, quotesDouble)
    if (ratio > 0.3) { score -= 10; findings.push('Mixed quote styles') }
  }

  score = Math.max(0, Math.min(100, score))
  if (findings.length === 0) findings.push('Code style appears consistent')

  return { name: 'Consistency', score, grade: scoreToGrade(score), weight: 0.9, description: 'Naming and style uniformity', findings }
}

// ─── computeOverallScore ──────────────────────────────────────────────────────

/**
 * Compute weighted average across dimensions.
 *
 * @example
 * computeOverallScore(dimensions) // 72.5
 */
export function computeOverallScore(dimensions: RadarDimension[]): number {
  if (dimensions.length === 0) return 0
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0)
  const weightedSum = dimensions.reduce((s, d) => s + d.score * d.weight, 0)
  return Math.round((weightedSum / totalWeight) * 10) / 10
}

// ─── classifyShape ────────────────────────────────────────────────────────────

/**
 * Classify chart shape from score distribution.
 *
 * @example
 * classifyShape([80, 80, 80, 80]) // 'balanced'
 */
export function classifyShape(scores: number[]): string {
  if (scores.length === 0) return 'irregular'
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length
  const variance = scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length
  const stddev = Math.sqrt(variance)

  if (stddev < 10) return 'balanced'
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  if (maxScore - mean > 20 && mean - minScore < 15) return 'peaked'
  if (mean - minScore > 20 && maxScore - mean < 15) return 'valleyed'
  return 'irregular'
}

// ─── drawRadarChart ───────────────────────────────────────────────────────────

/**
 * Generate ASCII radar chart lines.
 *
 * @example
 * drawRadarChart(dimensions) // ['    ^ Complexity', ...]
 */
export function drawRadarChart(dimensions: RadarDimension[]): string[] {
  const width = 45
  const height = 23
  const cx = 22
  const cy = 11
  const maxR = 9
  const lines: string[] = Array.from({ length: height }, () => ' '.repeat(width))

  const axisLabels = ['Complexity', 'Documentation', 'Testing', 'Security', 'Performance', 'Maintainability', 'Coupling', 'Consistency']
  const labelPositions: Array<[number, number]> = [
    [cx, 0],
    [cx + 14, cy - 4],
    [cx + 14, cy + 4],
    [cx, height - 1],
    [cx - 14, cy + 4],
    [cx - 14, cy - 4],
    [cx - 18, cy],
    [cx + 14, cy],
  ]

  for (let ring = 1; ring <= 4; ring++) {
    const r = Math.round((ring / 4) * maxR)
    for (let angle = 0; angle < 360; angle += 5) {
      const rad = (angle * Math.PI) / 180
      const x = Math.round(cx + r * Math.cos(rad))
      const y = Math.round(cy + r * Math.sin(rad) * 0.5)
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const line = lines[y]!
        lines[y] = line.substring(0, x) + '·' + line.substring(x + 1)
      }
    }
  }

  const pointCoords: Array<[number, number]> = []
  for (let i = 0; i < dimensions.length; i++) {
    const angle = (i * 360) / dimensions.length - 90
    const rad = (angle * Math.PI) / 180
    const r = (dimensions[i]!.score / 100) * maxR
    const x = Math.round(cx + r * Math.cos(rad))
    const y = Math.round(cy + r * Math.sin(rad) * 0.5)
    pointCoords.push([x, y])
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const line = lines[y]!
      lines[y] = line.substring(0, x) + '◆' + line.substring(x + 1)
    }
  }

  for (let i = 0; i < pointCoords.length; i++) {
    const next = (i + 1) % pointCoords.length
    const [x1, y1] = pointCoords[i]!
    const [x2, y2] = pointCoords[next]!
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1)
    for (let s = 1; s < steps; s++) {
      const t = s / steps
      const x = Math.round(x1 + (x2 - x1) * t)
      const y = Math.round(y1 + (y2 - y1) * t)
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const line = lines[y]!
        if (line[x] === ' ') {
          lines[y] = line.substring(0, x) + '─' + line.substring(x + 1)
        }
      }
    }
  }

  for (let i = 0; i < dimensions.length; i++) {
    const angle = (i * 360) / dimensions.length - 90
    const rad = (angle * Math.PI) / 180
    const steps = maxR + 2
    for (let s = 1; s <= steps; s++) {
      const x = Math.round(cx + s * Math.cos(rad))
      const y = Math.round(cy + s * Math.sin(rad) * 0.5)
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const line = lines[y]!
        if (line[x] === ' ') {
          lines[y] = line.substring(0, x) + '·' + line.substring(x + 1)
        }
      }
    }
  }

  const nameIdx = dimensions.length < 8 ? dimensions.length : 8
  for (let i = 0; i < Math.min(nameIdx, axisLabels.length); i++) {
    const dimName = i < dimensions.length ? dimensions[i]!.name : axisLabels[i]!
    const dimScore = i < dimensions.length ? dimensions[i]!.score : 0
    const label = `${dimName}:${dimScore}`
    const [lx, ly] = labelPositions[i] ?? [cx, 0]
    const clampedX = Math.max(0, Math.min(width - label.length, lx))
    const clampedY = Math.max(0, Math.min(height - 1, ly))
    const line = lines[clampedY]!
    lines[clampedY] = line.substring(0, clampedX) + label + line.substring(clampedX + label.length)
  }

  return lines
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate targeted recommendations from radar chart.
 *
 * @example
 * generateRecommendations(chart) // ['Improve testing score']
 */
export function generateRecommendations(chart: RadarChart): string[] {
  const recs: string[] = []

  for (const w of chart.weaknesses) {
    const dim = chart.dimensions.find((d) => d.name === w)
    if (dim && dim.score < 50) {
      recs.push(`${w} scores ${dim.score}/100 (${dim.grade}) — ${dim.findings[0] ?? 'needs improvement'}`)
    }
  }

  if (chart.shape === 'irregular') {
    recs.push('Scores are irregular — some dimensions are strong while others lag behind')
  }

  if (chart.overall < 50) {
    recs.push(`Overall score is ${chart.overall}/100 — significant quality improvements needed`)
  } else if (chart.overall < 70) {
    recs.push(`Overall score is ${chart.overall}/100 — room for improvement in weak areas`)
  }

  if (recs.length === 0) {
    recs.push('Project quality looks good across all dimensions.')
  }

  return recs
}

// ─── buildRadarResult ─────────────────────────────────────────────────────────

/**
 * Orchestrate full radar analysis.
 *
 * @example
 * buildRadarResult(['a.ts'], ['code...']) // RadarResult
 */
export function buildRadarResult(files: string[], contents: string[], _options?: RadarOptions): RadarResult {
  const scorers = [
    computeComplexityScore,
    computeDocumentationScore,
    computeTestingScore,
    computeSecurityScore,
    computePerformanceScore,
    computeMaintainabilityScore,
    computeCouplingScore,
    computeConsistencyScore,
  ]

  const dimensions = scorers.map((fn) => fn(files, contents))
  const overall = computeOverallScore(dimensions)
  const overallGrade = scoreToGrade(overall)
  const scores = dimensions.map((d) => d.score)
  const shape = classifyShape(scores)

  const sorted = [...dimensions].sort((a, b) => b.score - a.score)
  const strengths = sorted.slice(0, 3).map((d) => d.name)
  const weaknesses = sorted.slice(-3).map((d) => d.name)

  const chart: RadarChart = { dimensions, overall, overallGrade, shape, strengths, weaknesses }
  const asciiArt = drawRadarChart(dimensions)

  const mean = scores.length > 0 ? scores.reduce((s, v) => s + v, 0) / scores.length : 0
  const variance = scores.length > 0 ? scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length : 0
  const stddev = Math.sqrt(variance)
  const balanceScore = Math.max(0, Math.round(100 - stddev * 2))

  const stats: RadarStats = {
    totalDimensions: dimensions.length,
    dimensionsAbove80: dimensions.filter((d) => d.score >= 80).length,
    dimensionsBelow50: dimensions.filter((d) => d.score < 50).length,
    standardDeviation: Math.round(stddev * 10) / 10,
    balanceScore,
  }

  const recommendations = generateRecommendations(chart)

  return { chart, asciiArt, stats, recommendations }
}
