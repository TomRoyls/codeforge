// ─── Types ────────────────────────────────────────────────────────────────────

export type LensType = 'correctness' | 'maintainability' | 'performance' | 'readability' | 'robustness'

export const LENS_TYPES: LensType[] = ['correctness', 'maintainability', 'performance', 'readability', 'robustness']

export interface LensFinding {
  file: string
  line: number
  severity: 'info' | 'warning' | 'error'
  category: string
  description: string
  suggestion: string
}

export interface LensView {
  lens: LensType
  color: string
  score: number
  findings: LensFinding[]
  highlights: string[]
  concerns: string[]
}

export interface FilteredFile {
  file: string
  lensScores: Record<string, number>
  avgScore: number
  dominantLens: string
  weakestLens: string
  disparity: number
  classification: 'balanced' | 'lopsided' | 'fragile' | 'resilient'
}

export interface LensComparison {
  bestLens: string
  worstLens: string
  mostCorrelated: [string, string]
  mostDivergent: [string, string]
  surpriseFiles: string[]
}

export interface MosaicLensStats {
  totalViews: number
  avgLensScores: Record<string, number>
  overallScore: number
  bestScoringLens: string
  worstScoringLens: string
  totalFindings: number
  errorFindings: number
  warningFindings: number
  balancedFiles: number
  lopsidedFiles: number
  avgDisparity: number
  surpriseCount: number
  mosaicClarity: number
  dominantPerspective: string
  overallGrade: 'panoramic' | 'focused' | 'tinted' | 'blurred' | 'opaque'
}

export interface MosaicLensResult {
  views: LensView[]
  files: FilteredFile[]
  comparison: LensComparison
  stats: MosaicLensStats
  recommendations: string[]
}

// ─── Lens Colors ──────────────────────────────────────────────────────────────

const LENS_COLORS: Record<LensType, string> = {
  correctness: 'green',
  maintainability: 'blue',
  performance: 'yellow',
  readability: 'cyan',
  robustness: 'red',
}

// ─── Correctness Lens ─────────────────────────────────────────────────────────

function applyCorrectnessLens(content: string, filePath: string): LensView {
  const findings: LensFinding[] = []
  const highlights: string[] = []
  const concerns: string[] = []
  const lines = content.split('\n')
  let score = 85

  if (/catch\s*\(|\.catch\s*\(|try\s*\{/.test(content)) {
    score += 5
    highlights.push('Error handling present')
  } else if (/async|await|Promise/.test(content)) {
    score -= 10
    concerns.push('Async code without error handling')
    findings.push({ file: filePath, line: 1, severity: 'warning', category: 'error-handling', description: 'Async code lacks error handling', suggestion: 'Add try/catch or .catch() for async operations' })
  }

  if (/===|!==/.test(content)) {
    score += 2
    highlights.push('Uses strict equality')
  }
  if (/==|!=/.test(content) && !/===|!==/.test(content)) {
    score -= 5
    concerns.push('Uses loose equality')
    findings.push({ file: filePath, line: 1, severity: 'warning', category: 'type-safety', description: 'Loose equality (== or !=) used', suggestion: 'Use strict equality (=== or !==)' })
  }

  if (/null\s*!\s*=|undefined\s*!\s*=/.test(content) || /typeof\s+\w+\s*(===|!==)/.test(content)) {
    score += 3
    highlights.push('Null/undefined checks present')
  }

  if (/\.length\s*[<>=]/.test(content) || /Array\.isArray/.test(content)) {
    score += 2
    highlights.push('Input validation present')
  }

  if (/as\s+any|@ts-ignore|@ts-expect-error/.test(content)) {
    score -= 10
    concerns.push('Type safety bypasses detected')
    const lineIdx = lines.findIndex(l => /as\s+any|@ts-ignore|@ts-expect-error/.test(l))
    findings.push({ file: filePath, line: lineIdx + 1, severity: 'error', category: 'type-safety', description: 'Type safety bypass', suggestion: 'Fix the type error properly' })
  }

  return {
    lens: 'correctness',
    color: LENS_COLORS.correctness,
    score: Math.max(0, Math.min(100, score)),
    findings,
    highlights,
    concerns,
  }
}

// ─── Maintainability Lens ─────────────────────────────────────────────────────

function applyMaintainabilityLens(content: string, filePath: string): LensView {
  const findings: LensFinding[] = []
  const highlights: string[] = []
  const concerns: string[] = []
  const lines = content.split('\n')
  let score = 75

  const exports = (content.match(/export\s+/g) || []).length
  if (exports >= 1 && exports <= 10) {
    score += 5
    highlights.push(`Well-scoped module with ${exports} exports`)
  } else if (exports > 10) {
    score -= 5
    concerns.push('Large number of exports — consider splitting')
    findings.push({ file: filePath, line: 1, severity: 'info', category: 'organization', description: `${exports} exports may indicate too many responsibilities`, suggestion: 'Split into focused modules' })
  }

  if (/\/\*\*|\*\//.test(content)) {
    score += 5
    highlights.push('JSDoc documentation present')
  }

  const hasInterface = /interface\s+\w+|type\s+\w+\s*=/.test(content)
  if (hasInterface) {
    score += 3
    highlights.push('Type definitions present')
  }

  const avgLineLength = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)
  if (avgLineLength > 120) {
    score -= 5
    concerns.push('Long average line length')
  }

  const hasPatterns = /import.*from/.test(content) && /export\s+(default\s+)?/.test(content)
  if (hasPatterns) {
    score += 5
    highlights.push('Follows module patterns')
  }

  if (/TODO|FIXME|HACK/i.test(content)) {
    score -= 5
    concerns.push('Contains TODO/FIXME markers')
  }

  return {
    lens: 'maintainability',
    color: LENS_COLORS.maintainability,
    score: Math.max(0, Math.min(100, score)),
    findings,
    highlights,
    concerns,
  }
}

// ─── Performance Lens ─────────────────────────────────────────────────────────

function applyPerformanceLens(content: string, filePath: string): LensView {
  const findings: LensFinding[] = []
  const highlights: string[] = []
  const concerns: string[] = []
  const lines = content.split('\n')
  let score = 80

  const nestedLoops = lines.some(l => {
    const loopCount = (l.match(/\bfor\s*\(|\bwhile\s*\(/g) || []).length
    return loopCount >= 2
  }) || (() => {
    let depth = 0
    for (const line of lines) {
      const loopCount = (line.match(/\bfor\s*\(|\bwhile\s*\(/g) || []).length
      depth += loopCount - ((line.match(/\}/g) || []).length)
      if (depth >= 2) return true
    }
    return false
  })()

  if (nestedLoops) {
    score -= 15
    concerns.push('Nested loops detected — potential O(n²)')
    const lineIdx = lines.findIndex(l => (l.match(/\bfor\s*\(/g) || []).length >= 2 || l.includes('for') && lines.indexOf(l) > 0 && lines[lines.indexOf(l) - 1]?.includes('for'))
    findings.push({ file: filePath, line: Math.max(1, lineIdx + 1), severity: 'warning', category: 'complexity', description: 'Nested loop may cause performance issues', suggestion: 'Consider using Map/Set for O(1) lookups' })
  }

  if (/\.slice\(\)\.sort\(\)|\.concat\(\[\]\)/.test(content)) {
    score -= 5
    concerns.push('Unnecessary array copies')
  }

  if (/\.map\(.*\.filter\(|\.filter\(.*\.map\(/.test(content)) {
    score -= 3
    concerns.push('Chained array operations — consider single pass')
  }

  if (/new\s+Set\(|new\s+Map\(/.test(content)) {
    score += 5
    highlights.push('Uses efficient data structures (Set/Map)')
  }

  if (/\.forEach\(/.test(content) && !/\.map\(|\.filter\(|\.reduce\(/.test(content)) {
    score += 2
    highlights.push('Uses forEach for side effects')
  }

  if (/JSON\.parse|JSON\.stringify/.test(content) && /for\s*\(/.test(content)) {
    score -= 10
    concerns.push('JSON serialization inside loop')
    findings.push({ file: filePath, line: 1, severity: 'error', category: 'serialization', description: 'JSON operations inside loop', suggestion: 'Move JSON operations outside the loop' })
  }

  return {
    lens: 'performance',
    color: LENS_COLORS.performance,
    score: Math.max(0, Math.min(100, score)),
    findings,
    highlights,
    concerns,
  }
}

// ─── Readability Lens ─────────────────────────────────────────────────────────

function applyReadabilityLens(content: string, filePath: string): LensView {
  const findings: LensFinding[] = []
  const highlights: string[] = []
  const concerns: string[] = []
  const lines = content.split('\n')
  let score = 75

  const totalLines = lines.length
  const commentLines = lines.filter(l => /\/\/|\/\*|\*/.test(l.trim())).length
  const commentRatio = totalLines > 0 ? commentLines / totalLines : 0

  if (commentRatio >= 0.1 && commentRatio <= 0.4) {
    score += 10
    highlights.push('Good comment density')
  } else if (commentRatio < 0.05) {
    score -= 5
    concerns.push('Low comment density')
  } else if (commentRatio > 0.5) {
    score -= 3
    concerns.push('Excessive comments — code may be unclear')
  }

  const avgLineLen = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)
  if (avgLineLen <= 80) {
    score += 5
    highlights.push('Short, readable lines')
  } else if (avgLineLen > 100) {
    score -= 5
    concerns.push('Long lines reduce readability')
    findings.push({ file: filePath, line: 1, severity: 'info', category: 'formatting', description: `Average line length ${Math.round(avgLineLen)} chars`, suggestion: 'Keep lines under 80-100 characters' })
  }

  const goodNames = lines.filter(l => {
    const match = l.match(/(?:const|let|function|class)\s+([a-zA-Z_]\w*)/)
    if (match && match[1]) return match[1].length >= 2 && /^[a-z]/.test(match[1])
    return true
  })
  if (goodNames.length === lines.length) {
    score += 5
    highlights.push('Clear naming conventions')
  }

  const fnCount = (content.match(/function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|function)/g) || []).length
  if (fnCount > 0 && totalLines / fnCount <= 30) {
    score += 5
    highlights.push('Well-sized functions')
  } else if (fnCount > 0 && totalLines / fnCount > 50) {
    score -= 5
    concerns.push('Large functions detected')
  }

  return {
    lens: 'readability',
    color: LENS_COLORS.readability,
    score: Math.max(0, Math.min(100, score)),
    findings,
    highlights,
    concerns,
  }
}

// ─── Robustness Lens ──────────────────────────────────────────────────────────

function applyRobustnessLens(content: string, filePath: string): LensView {
  const findings: LensFinding[] = []
  const highlights: string[] = []
  const concerns: string[] = []
  let score = 70

  if (/try\s*\{|catch\s*\(|\.catch\s*\(/.test(content)) {
    score += 10
    highlights.push('Error boundaries present')
  } else {
    score -= 5
    concerns.push('No error handling detected')
    findings.push({ file: filePath, line: 1, severity: 'warning', category: 'error-handling', description: 'No error handling', suggestion: 'Add try/catch or error boundaries' })
  }

  if (/default\s*:|\.toLowerCase\(\)|\.toUpperCase\(\)|Math\.max\(|Math\.min\(/.test(content)) {
    score += 5
    highlights.push('Default/fallback values present')
  }

  if (/\?\.\w|\?\?\s|typeof\s+\w+\s*!==?\s*['"]undefined['"]/.test(content)) {
    score += 5
    highlights.push('Optional chaining or nullish coalescing used')
  }

  if (/if\s*\(!\s*\w|if\s*\(\s*\w+\s*===?\s*null|if\s*\(\s*\w+\s*===?\s*undefined/.test(content)) {
    score += 5
    highlights.push('Guard clauses present')
  }

  if (/process\.exit|throw\s+new/.test(content)) {
    score += 3
    highlights.push('Explicit error termination')
  }

  if (/\.slice\(|\.substring\(|\.substr\(/.test(content)) {
    score += 2
    highlights.push('Safe string operations')
  }

  return {
    lens: 'robustness',
    color: LENS_COLORS.robustness,
    score: Math.max(0, Math.min(100, score)),
    findings,
    highlights,
    concerns,
  }
}

// ─── Apply Lens ────────────────────────────────────────────────────────────────

/**
 * Apply a specific lens to file content
 * @example
 * applyLens(content, 'a.ts', 'correctness') // LensView
 */
export function applyLens(content: string, filePath: string, lens: LensType): LensView {
  switch (lens) {
    case 'correctness': return applyCorrectnessLens(content, filePath)
    case 'maintainability': return applyMaintainabilityLens(content, filePath)
    case 'performance': return applyPerformanceLens(content, filePath)
    case 'readability': return applyReadabilityLens(content, filePath)
    case 'robustness': return applyRobustnessLens(content, filePath)
  }
}

/**
 * Apply all lenses to file content
 * @example
 * applyAllLenses(content, 'a.ts') // LensView[]
 */
export function applyAllLenses(content: string, filePath: string): LensView[] {
  return LENS_TYPES.map(lens => applyLens(content, filePath, lens))
}

// ─── File Filtering ───────────────────────────────────────────────────────────

/**
 * Classify a file based on its lens scores and disparity
 * @example
 * classifyFile({ correctness: 80, maintainability: 60 }, 20) // 'lopsided'
 */
export function classifyFile(scores: Record<string, number>, disparity: number): FilteredFile['classification'] {
  const values = Object.values(scores)
  const avg = values.reduce((s, v) => s + v, 0) / Math.max(1, values.length)
  const min = Math.min(...values)

  if (disparity <= 10 && avg >= 70) return 'resilient'
  if (disparity <= 15) return 'balanced'
  if (disparity > 25 && min < 50) return 'fragile'
  return 'lopsided'
}

/**
 * Create a FilteredFile from lens views
 * @example
 * filterFile('a.ts', views) // FilteredFile
 */
export function filterFile(filePath: string, views: LensView[]): FilteredFile {
  const lensScores: Record<string, number> = {}
  for (const v of views) {
    lensScores[v.lens] = v.score
  }

  const scores = Object.values(lensScores)
  const avgScore = Math.round(scores.reduce((s, v) => s + v, 0) / Math.max(1, scores.length))

  let dominantLens = views[0]?.lens || 'correctness'
  let weakestLens = views[0]?.lens || 'correctness'
  let maxScore = -1
  let minScore = 101

  for (const v of views) {
    if (v.score > maxScore) { maxScore = v.score; dominantLens = v.lens }
    if (v.score < minScore) { minScore = v.score; weakestLens = v.lens }
  }

  const disparity = maxScore - minScore
  const classification = classifyFile(lensScores, disparity)

  return { file: filePath, lensScores, avgScore, dominantLens, weakestLens, disparity, classification }
}

// ─── Cross-Lens Comparison ────────────────────────────────────────────────────

/**
 * Compare lenses across files
 * @example
 * compareLenses(views, files) // LensComparison
 */
export function compareLenses(_views: LensView[], files: FilteredFile[]): LensComparison {
  const avgScores: Record<string, number[]> = {}
  for (const f of files) {
    for (const [lens, score] of Object.entries(f.lensScores)) {
      if (!avgScores[lens]) avgScores[lens] = []
      avgScores[lens].push(score)
    }
  }

  let bestLens = 'correctness'
  let worstLens = 'correctness'
  let bestAvg = -1
  let worstAvg = 101

  for (const [lens, scores] of Object.entries(avgScores)) {
    const avg = scores.reduce((s, v) => s + v, 0) / scores.length
    if (avg > bestAvg) { bestAvg = avg; bestLens = lens }
    if (avg < worstAvg) { worstAvg = avg; worstLens = lens }
  }

  let mostCorrelated: [string, string] = ['correctness', 'maintainability']
  let mostDivergent: [string, string] = ['correctness', 'performance']
  let maxCorr = -2
  let maxDiv = -2

  for (let i = 0; i < LENS_TYPES.length; i++) {
    for (let j = i + 1; j < LENS_TYPES.length; j++) {
      const l1 = LENS_TYPES[i]
      const l2 = LENS_TYPES[j]
      if (l1 === undefined || l2 === undefined) continue
      const s1 = avgScores[l1] || []
      const s2 = avgScores[l2] || []

      if (s1.length === 0 || s2.length === 0) continue

      const mean1 = s1.reduce((a: number, b: number) => a + b, 0) / s1.length
      const mean2 = s2.reduce((a: number, b: number) => a + b, 0) / s2.length
      let diff = Math.abs(mean1 - mean2)

      if (diff > maxDiv) { maxDiv = diff; mostDivergent = [l1, l2] }
      if (diff < 100 - maxCorr) {
        const corr = 100 - diff
        if (corr > maxCorr) { maxCorr = corr; mostCorrelated = [l1, l2] }
      }
    }
  }

  const surpriseFiles = files
    .filter(f => f.disparity > 25)
    .map(f => f.file)
    .slice(0, 10)

  return { bestLens, worstLens, mostCorrelated, mostDivergent, surpriseFiles }
}

// ─── Mosaic Clarity ───────────────────────────────────────────────────────────

/**
 * Compute mosaic clarity (0-100)
 * @example
 * computeMosaicClarity(views, files) // 75
 */
export function computeMosaicClarity(_views: LensView[], files: FilteredFile[]): number {
  if (files.length === 0) return 100

  const avgDisp = files.reduce((s, f) => s + f.disparity, 0) / files.length
  const balancedRatio = files.filter(f => f.classification === 'balanced' || f.classification === 'resilient').length / files.length

  return Math.max(0, Math.min(100, Math.round(100 - avgDisp * 0.5 + balancedRatio * 20)))
}

/**
 * Classify overall grade based on clarity and average score
 * @example
 * classifyOverallGrade(80, 75) // 'panoramic'
 */
export function classifyOverallGrade(clarity: number, avgScore: number): MosaicLensStats['overallGrade'] {
  const combined = clarity * 0.5 + avgScore * 0.5
  if (combined >= 80) return 'panoramic'
  if (combined >= 65) return 'focused'
  if (combined >= 50) return 'tinted'
  if (combined >= 35) return 'blurred'
  return 'opaque'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate mosaic lens recommendations
 * @example
 * generateRecommendations(views, files, comparison, stats) // string[]
 */
export function generateRecommendations(
  _views: LensView[],
  files: FilteredFile[],
  comparison: LensComparison,
  stats: MosaicLensStats,
): string[] {
  const recs: string[] = []

  if (stats.worstScoringLens) {
    recs.push(`Focus on ${stats.worstScoringLens} — lowest scoring lens across the codebase`)
  }

  const lopsided = files.filter(f => f.classification === 'lopsided')
  if (lopsided.length > 0) {
    recs.push(`Improve ${lopsided[0]?.weakestLens ?? 'unknown'} in ${lopsided.length} lopsided file(s) for more balanced scores`)
  }

  if (comparison.surpriseFiles.length > 0) {
    recs.push(`Investigate ${comparison.surpriseFiles.length} surprise file(s) with high lens score disparity`)
  }

  const fragile = files.filter(f => f.classification === 'fragile')
  if (fragile.length > 0) {
    recs.push(`Strengthen ${fragile.length} fragile file(s) — low scores with high disparity indicate risk areas`)
  }

  if (stats.mosaicClarity < 50) {
    recs.push('Low mosaic clarity — codebase shows very different pictures through different lenses')
  }

  if (stats.errorFindings > 0) {
    recs.push(`Address ${stats.errorFindings} error-level finding(s) found across lenses`)
  }

  return Array.from(new Set(recs))
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the complete mosaic lens result
 * @example
 * buildMosaicLensResult(['a.ts'], ['export const x = 1'], {}) // MosaicLensResult
 */
export function buildMosaicLensResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): MosaicLensResult {
  const allViews: LensView[] = []
  const filteredFiles: FilteredFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    const views = applyAllLenses(content, file)
    allViews.push(...views)
    filteredFiles.push(filterFile(file, views))
  }

  const comparison = compareLenses(allViews, filteredFiles)
  const clarity = computeMosaicClarity(allViews, filteredFiles)

  const avgLensScores: Record<string, number> = {}
  for (const lt of LENS_TYPES) {
    const scores = allViews.filter(v => v.lens === lt).map(v => v.score)
    avgLensScores[lt] = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 100
  }

  const overallScore = Math.round(Object.values(avgLensScores).reduce((s, v) => s + v, 0) / LENS_TYPES.length)

  let bestScoringLens: string = 'correctness'
  let worstScoringLens: string = 'correctness'
  let bestVal = -1
  let worstVal = 101
  for (const [lens, score] of Object.entries(avgLensScores)) {
    if (score > bestVal) { bestVal = score; bestScoringLens = lens }
    if (score < worstVal) { worstVal = score; worstScoringLens = lens }
  }

  const allFindings = allViews.flatMap(v => v.findings)
  const overallGrade = classifyOverallGrade(clarity, overallScore)

  const avgDisparity = filteredFiles.length > 0
    ? Math.round(filteredFiles.reduce((s, f) => s + f.disparity, 0) / filteredFiles.length)
    : 0

  const stats: MosaicLensStats = {
    totalViews: allViews.length,
    avgLensScores,
    overallScore,
    bestScoringLens,
    worstScoringLens,
    totalFindings: allFindings.length,
    errorFindings: allFindings.filter(f => f.severity === 'error').length,
    warningFindings: allFindings.filter(f => f.severity === 'warning').length,
    balancedFiles: filteredFiles.filter(f => f.classification === 'balanced').length,
    lopsidedFiles: filteredFiles.filter(f => f.classification === 'lopsided').length,
    avgDisparity,
    surpriseCount: comparison.surpriseFiles.length,
    mosaicClarity: clarity,
    dominantPerspective: bestScoringLens,
    overallGrade,
  }

  const recommendations = generateRecommendations(allViews, filteredFiles, comparison, stats)

  return { views: allViews, files: filteredFiles, comparison, stats, recommendations }
}
