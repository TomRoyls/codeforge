// ─── Interfaces ───────────────────────────────────────────

export type FoldType =
  | 'indent'
  | 'block'
  | 'scope'
  | 'conditional'
  | 'loop'
  | 'try-catch'
  | 'class'
  | 'function'
  | 'callback'

export type PatternQuality = 'elegant' | 'acceptable' | 'messy' | 'spaghetti'

export type OverallQuality = 'masterwork' | 'clean' | 'average' | 'rough' | 'crumpled'

export type PatternName =
  | 'pyramid'
  | 'spiral'
  | 'accordion'
  | 'fan'
  | 'crane'
  | 'ball'
  | 'waterbomb'
  | 'flat'

export interface Fold {
  type: FoldType
  depth: number
  line: number
  lineCount: number
  cleanScore: number
  issues: string[]
}

export interface FoldPattern {
  name: string
  description: string
  files: string[]
  avgDepth: number
  foldCount: number
  quality: PatternQuality
  suggestion: string
}

export interface FoldScore {
  file: string
  totalFolds: number
  maxDepth: number
  avgDepth: number
  cleanScore: number
  unfoldability: number
  pattern: string
  issues: string[]
}

export interface OrigamiStats {
  totalFolds: number
  avgDepth: number
  maxDepth: number
  deepestFile: string
  cleanestFile: string
  messiestFile: string
  avgCleanScore: number
  avgUnfoldability: number
  patternDistribution: Record<string, number>
  overallFoldQuality: OverallQuality
  foldEfficiency: number
  unnecessaryFolds: number
  foldComplexityIndex: number
}

export interface OrigamiResult {
  folds: Fold[]
  patterns: FoldPattern[]
  scores: FoldScore[]
  stats: OrigamiStats
  recommendations: string[]
}

export interface OrigamiOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Fold Extraction ─────────────────────────────────────

const OPEN_BRACES = /[{(]/g
const CLOSE_BRACES = /[})]/g

/**
 * Detect fold type from a line of code.
 *
 * @example
 * detectFoldType('if (x > 0) {', 1) // => 'conditional'
 */
export function detectFoldType(line: string, depth: number): FoldType {
  const trimmed = line.trim()

  if (/\bclass\b/.test(trimmed)) return 'class'
  if (/\btry\b/.test(trimmed)) return 'try-catch'
  if (/\bcatch\b/.test(trimmed)) return 'try-catch'
  if (/\bfor\b/.test(trimmed) || /\bwhile\b/.test(trimmed)) return 'loop'
  if (/\bif\b/.test(trimmed) || /\belse\b/.test(trimmed) || /\bswitch\b/.test(trimmed)) return 'conditional'
  if (trimmed.includes('=>') && depth >= 1) return 'callback'
  if (/\bfunction\b/.test(trimmed)) return 'function'
  if (/\w+\s*\([^)]*\)\s*[{=]/.test(trimmed) && !/\b(if|for|while|switch|try|catch|class)\b/.test(trimmed)) return 'function'

  if (depth > 0 && /[{}]/.test(trimmed)) return 'block'
  if (depth > 0) return 'indent'

  return 'block'
}

/**
 * Count braces balance change in a line.
 *
 * @example
 * countBraceBalance('if (x) { foo() }') // => 0
 */
export function countBraceBalance(line: string): number {
  const opens = (line.match(OPEN_BRACES) ?? []).length
  const closes = (line.match(CLOSE_BRACES) ?? []).length
  return opens - closes
}

/**
 * Detect guard clause (early return at low depth).
 *
 * @example
 * isGuardClause('if (!x) return null;', 1) // => true
 */
export function isGuardClause(line: string, depth: number): boolean {
  if (depth > 2) return false
  const trimmed = line.trim()
  return /^\s*(if|guard)\b.*\b(return|throw|break|continue)\b/.test(trimmed)
}

/**
 * Detect arrow function usage.
 *
 * @example
 * hasArrowFunction('const fn = () => 42') // => true
 */
export function hasArrowFunction(content: string): boolean {
  return /=>\s*[^{]/m.test(content) || /=>\s*{/m.test(content)
}

/**
 * Extract all folds from file content.
 *
 * @example
 * extractFolds('if (x) {\n  foo()\n}', 'a.ts') // => [Fold]
 */
export function extractFolds(content: string, _filePath: string): Fold[] {
  const folds: Fold[] = []

  if (content.length === 0) return folds

  const lines = content.split('\n')
  let depth = 0
  let depthStack: Array<{ line: number; type: FoldType; openBraces: number }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const balance = countBraceBalance(line ?? '')

    if (balance > 0) {
      const foldType = detectFoldType(line ?? '', depth)
      for (let b = 0; b < balance; b++) {
        depthStack.push({ line: i + 1, type: foldType, openBraces: depth })
      }
      depth += balance
    }

    if (balance < 0) {
       const closing = Math.abs(balance)
       for (let c = 0; c < closing && depthStack.length > 0; c++) {
         const entry = depthStack.pop()
         if (!entry) continue
         const foldLineCount = i + 1 - entry.line
        const fold: Fold = {
          type: entry.type,
          depth: entry.openBraces + 1,
          line: entry.line,
          lineCount: foldLineCount,
          cleanScore: 0,
          issues: [],
        }
        fold.cleanScore = scoreFoldCleanliness(fold)
        fold.issues = identifyFoldIssues(fold, lines.slice(entry.line - 1, i + 1).join('\n'))
        folds.push(fold)
      }
      depth -= closing
      if (depth < 0) depth = 0
    }
  }

  return folds
}

// ─── Fold Scoring ────────────────────────────────────────

/**
 * Score fold cleanliness from 0 to 100.
 *
 * @example
 * scoreFoldCleanliness({ depth: 1, lineCount: 5, type: 'function', ... }) // => high score
 */
export function scoreFoldCleanliness(fold: Fold): number {
  let score = 100

  if (fold.depth > 6) score -= 40
  else if (fold.depth > 4) score -= 25
  else if (fold.depth > 3) score -= 10

  if (fold.lineCount > 50) score -= 30
  else if (fold.lineCount > 30) score -= 15
  else if (fold.lineCount > 20) score -= 5

  if (fold.type === 'callback') score -= 5
  if (fold.type === 'try-catch' && fold.depth > 2) score -= 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Identify quality issues for a fold.
 *
 * @example
 * identifyFoldIssues({ depth: 5, lineCount: 40, ... }, code) // => ['Deep nesting', 'Long fold']
 */
export function identifyFoldIssues(fold: Fold, _code: string): string[] {
  const issues: string[] = []

  if (fold.depth > 4) issues.push('Deep nesting')
  if (fold.lineCount > 30) issues.push('Long fold')
  if (fold.type === 'callback' && fold.depth > 2) issues.push('Nested callback')

  return issues
}

// ─── Pattern Detection ──────────────────────────────────

/**
 * Identify the dominant fold pattern for a file's folds.
 *
 * @example
 * identifyFoldPattern(folds) // => 'pyramid'
 */
export function identifyFoldPattern(folds: Fold[]): PatternName {
  if (folds.length === 0) return 'flat'

  const maxDepth = Math.max(...folds.map(f => f.depth))
  const avgDepth = folds.reduce((s, f) => s + f.depth, 0) / folds.length
  const callbacks = folds.filter(f => f.type === 'callback').length
  const conditionals = folds.filter(f => f.type === 'conditional').length
  const functions = folds.filter(f => f.type === 'function').length
  const sameDepthFolds = folds.filter(f => f.depth === folds[0]?.depth).length

  const callbackRatio = callbacks / folds.length
  const conditionalRatio = conditionals / folds.length
  const functionRatio = functions / folds.length
  const siblingRatio = sameDepthFolds / folds.length

  if (callbackRatio > 0.4) return 'spiral'
  if (maxDepth >= 5 && avgDepth >= 3 && conditionalRatio > 0.3) return 'pyramid'
  if (maxDepth >= 5 && avgDepth >= 3.5 && folds.every(f => f.cleanScore >= 70)) return 'crane'
  if (maxDepth >= 4 && avgDepth <= 1.5) return 'waterbomb'
  if (siblingRatio > 0.6 && functionRatio > 0.3) return 'fan'
  if (conditionalRatio > 0.3) return 'accordion'
  if (maxDepth >= 4 && avgDepth >= 2.5) return 'ball'

  return 'flat'
}

/**
 * Get human-readable description for a pattern.
 *
 * @example
 * getPatternDescription('pyramid') // => 'Deep nesting, narrow at bottom'
 */
export function getPatternDescription(pattern: PatternName): string {
  const descriptions: Record<PatternName, string> = {
    pyramid: 'Deep nesting, narrow at bottom — many nested conditions',
    spiral: 'Nested callbacks/promises spiraling inward',
    accordion: 'Alternating expand/contract — if/else chains with varying depth',
    fan: 'Many sibling folds at same depth — switch statements, multiple functions',
    crane: 'Complex but elegant folding — well-structured deep nesting',
    ball: 'Tangled folds with no clear structure — spaghetti nesting',
    waterbomb: 'Single deep fold surrounded by flat areas',
    flat: 'Minimal nesting — flat, linear code structure',
  }
  return descriptions[pattern]
}

/**
 * Get quality assessment for a pattern based on folds.
 *
 * @example
 * assessPatternQuality('pyramid', folds) // => 'messy'
 */
export function assessPatternQuality(pattern: PatternName, folds: Fold[]): PatternQuality {
  if (pattern === 'crane') return 'elegant'
  if (pattern === 'flat') return 'elegant'
  if (pattern === 'ball') return 'spaghetti'

  const avgClean = folds.length > 0 ? folds.reduce((s, f) => s + f.cleanScore, 0) / folds.length : 100

  if (pattern === 'pyramid') return avgClean >= 70 ? 'acceptable' : 'messy'
  if (pattern === 'spiral') return 'messy'

  if (avgClean >= 80) return 'elegant'
  if (avgClean >= 60) return 'acceptable'
  return 'messy'
}

/**
 * Get improvement suggestion for a pattern.
 *
 * @example
 * getPatternSuggestion('spiral') // => 'Consider async/await'
 */
export function getPatternSuggestion(pattern: PatternName): string {
  const suggestions: Record<PatternName, string> = {
    pyramid: 'Extract deeply nested conditions into separate functions',
    spiral: 'Refactor callbacks to use async/await',
    accordion: 'Consolidate if/else chains with early returns or strategy pattern',
    fan: 'Consider grouping sibling functions into classes or modules',
    crane: 'Well-structured — maintain current patterns',
    ball: 'Break apart tangled nesting — extract functions and reduce coupling',
    waterbomb: 'Extract the deep fold into its own function',
    flat: 'Structure is clean — no changes needed',
  }
  return suggestions[pattern]
}

// ─── Unfoldability ───────────────────────────────────────

/**
 * Compute unfoldability score (0-100) — how easy to understand/flatten.
 *
 * @example
 * computeUnfoldability(folds, content) // => 85
 */
export function computeUnfoldability(folds: Fold[], content: string): number {
  if (folds.length === 0) return 100

  let score = 100

  const maxDepth = Math.max(...folds.map(f => f.depth))
  const avgDepth = folds.reduce((s, f) => s + f.depth, 0) / folds.length

  score -= maxDepth * 4
  score -= avgDepth * 3

  const lines = content.split('\n')
  let guardCount = 0
  let earlyReturnCount = 0
  for (const line of lines) {
    if (isGuardClause(line, 1)) guardCount++
    if (/^\s*return\b/.test(line)) earlyReturnCount++
  }

  score += guardCount * 5
  score += earlyReturnCount * 2

  if (hasArrowFunction(content)) score += 3

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── File Scoring ────────────────────────────────────────

/**
 * Score a single file's folds.
 *
 * @example
 * scoreFile(folds, content, 'app.ts') // => FoldScore
 */
export function scoreFile(folds: Fold[], content: string, filePath: string): FoldScore {
  if (folds.length === 0) {
    return {
      file: filePath,
      totalFolds: 0,
      maxDepth: 0,
      avgDepth: 0,
      cleanScore: 100,
      unfoldability: 100,
      pattern: 'flat',
      issues: [],
    }
  }

  const totalFolds = folds.length
  const maxDepth = Math.max(...folds.map(f => f.depth))
  const avgDepth = folds.reduce((s, f) => s + f.depth, 0) / totalFolds
  const cleanScore = Math.round(folds.reduce((s, f) => s + f.cleanScore, 0) / totalFolds)
  const unfoldability = computeUnfoldability(folds, content)
  const pattern = identifyFoldPattern(folds)
  const allIssues = folds.flatMap(f => f.issues)
  const uniqueIssues = [...new Set(allIssues)]

  return {
    file: filePath,
    totalFolds,
    maxDepth,
    avgDepth: Math.round(avgDepth * 10) / 10,
    cleanScore,
    unfoldability,
    pattern,
    issues: uniqueIssues,
  }
}

// ─── Pattern Grouping ────────────────────────────────────

/**
 * Identify all patterns across scored files.
 *
 * @example
 * identifyAllPatterns(scores) // => [FoldPattern]
 */
export function identifyAllPatterns(scores: FoldScore[]): FoldPattern[] {
  const patternMap = new Map<PatternName, FoldScore[]>()

  for (const score of scores) {
    const p = score.pattern as PatternName
    const existing = patternMap.get(p) ?? []
    existing.push(score)
    patternMap.set(p, existing)
  }

  const patterns: FoldPattern[] = []
  for (const [name, fileScores] of patternMap) {
    const foldCount = fileScores.reduce((s, fs) => s + fs.totalFolds, 0)
    const avgDepth = fileScores.reduce((s, fs) => s + fs.avgDepth, 0) / fileScores.length
    const avgClean = fileScores.reduce((s, fs) => s + fs.cleanScore, 0) / fileScores.length

    let quality: PatternQuality
    if (avgClean >= 80) quality = 'elegant'
    else if (avgClean >= 60) quality = 'acceptable'
    else if (avgClean >= 40) quality = 'messy'
    else quality = 'spaghetti'

    if (name === 'ball') quality = 'spaghetti'
    if (name === 'crane') quality = 'elegant'

    patterns.push({
      name,
      description: getPatternDescription(name),
      files: fileScores.map(fs => fs.file),
      avgDepth: Math.round(avgDepth * 10) / 10,
      foldCount,
      quality,
      suggestion: getPatternSuggestion(name),
    })
  }

  return patterns.sort((a, b) => b.foldCount - a.foldCount)
}

// ─── Efficiency & Complexity ─────────────────────────────

/**
 * Compute fold efficiency — functionality per fold (0-100).
 *
 * @example
 * computeFoldEfficiency(folds, 100) // => 80
 */
export function computeFoldEfficiency(folds: Fold[], totalLines: number): number {
  if (folds.length === 0 || totalLines === 0) return 100

  const linesInFolds = folds.reduce((s, f) => s + f.lineCount, 0)
  const ratio = linesInFolds / totalLines
  const uniqueLines = Math.min(ratio, 1)

  return Math.round((1 - uniqueLines * 0.5) * 100)
}

/**
 * Count unnecessary folds — folds that could be flattened.
 *
 * @example
 * countUnnecessaryFolds(folds) // => 3
 */
export function countUnnecessaryFolds(folds: Fold[]): number {
  return folds.filter(f => {
    if (f.depth <= 1 && f.lineCount <= 3) return true
    if (f.type === 'block' && f.lineCount <= 2) return true
    return false
  }).length
}

/**
 * Compute fold complexity index — weighted depth measure.
 *
 * @example
 * computeFoldComplexityIndex(folds) // => 42
 */
export function computeFoldComplexityIndex(folds: Fold[]): number {
  if (folds.length === 0) return 0

  let index = 0
  for (const fold of folds) {
    let weight = 1
    if (fold.type === 'callback') weight = 2
    else if (fold.type === 'conditional') weight = 1.5
    else if (fold.type === 'loop') weight = 1.5
    else if (fold.type === 'try-catch') weight = 1.3

    index += fold.depth * weight
  }

  return Math.round(index)
}

// ─── Overall Quality ─────────────────────────────────────

/**
 * Classify overall fold quality from average scores.
 *
 * @example
 * classifyOverallQuality(85, 80) // => 'masterwork'
 */
export function classifyOverallQuality(avgClean: number, avgUnfoldability: number): OverallQuality {
  const composite = (avgClean + avgUnfoldability) / 2

  if (composite >= 85) return 'masterwork'
  if (composite >= 70) return 'clean'
  if (composite >= 50) return 'average'
  if (composite >= 30) return 'rough'
  return 'crumpled'
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Generate actionable recommendations.
 *
 * @example
 * generateOrigamiRecommendations(folds, patterns, scores, stats) // => ['Extract deep folds']
 */
export function generateOrigamiRecommendations(
  folds: Fold[],
  patterns: FoldPattern[],
  _scores: FoldScore[],
  stats: OrigamiStats,
): string[] {
  const recs: string[] = []

  const deepFolds = folds.filter(f => f.depth > 4)
  if (deepFolds.length > 0) {
    recs.push(`Extract ${deepFolds.length} deeply nested fold${deepFolds.length > 1 ? 's' : ''} into separate functions`)
  }

  const spiralPattern = patterns.find(p => p.name === 'spiral')
  if (spiralPattern) {
    recs.push('Refactor callback spirals to use async/await')
  }

  const ballPattern = patterns.find(p => p.name === 'ball')
  if (ballPattern) {
    recs.push('Untangle spaghetti nesting — break into smaller, focused functions')
  }

  if (stats.unnecessaryFolds > 3) {
    recs.push(`Flatten ${stats.unnecessaryFolds} unnecessary folds for cleaner structure`)
  }

  if (stats.foldComplexityIndex > 50) {
    recs.push('High fold complexity — consider simplifying nested structures')
  }

  if (stats.avgCleanScore < 50) {
    recs.push('Low fold cleanliness — review and refactor messy code structures')
  }

  const pyramidPattern = patterns.find(p => p.name === 'pyramid')
  if (pyramidPattern && pyramidPattern.files.length > 0) {
    recs.push('Use guard clauses and early returns to flatten pyramid nesting')
  }

  if (recs.length === 0) {
    return []
  }

  return recs
}

// ─── Build Result ────────────────────────────────────────

/**
 * Build the complete origami analysis result.
 *
 * @example
 * buildOrigamiResult(['a.ts'], ['code'], {}) // => OrigamiResult
 */
export function buildOrigamiResult(files: string[], contents: string[], _options: OrigamiOptions): OrigamiResult {
  const allFolds: Fold[] = []
  const scores: FoldScore[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const folds = extractFolds(content, file ?? '')
    allFolds.push(...folds)
    scores.push(scoreFile(folds, content, file ?? ''))
  }

  const patterns = identifyAllPatterns(scores)

  const totalFolds = allFolds.length
  const maxDepth = totalFolds > 0 ? Math.max(...allFolds.map(f => f.depth)) : 0
  const avgDepth = totalFolds > 0 ? Math.round((allFolds.reduce((s, f) => s + f.depth, 0) / totalFolds) * 10) / 10 : 0
  const avgCleanScore = scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.cleanScore, 0) / scores.length) : 100
  const avgUnfoldability = scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.unfoldability, 0) / scores.length) : 100

  const deepestScore = scores.length > 0 ? scores.reduce((a, b) => a.maxDepth > b.maxDepth ? a : b) : { file: '', maxDepth: 0 }
  const cleanestScore = scores.length > 0 ? scores.reduce((a, b) => a.cleanScore > b.cleanScore ? a : b) : { file: '', cleanScore: 100 }
  const messiestScore = scores.length > 0 ? scores.reduce((a, b) => a.cleanScore < b.cleanScore ? a : b) : { file: '', cleanScore: 100 }

  const patternDistribution: Record<string, number> = {}
  for (const score of scores) {
    patternDistribution[score.pattern] = (patternDistribution[score.pattern] ?? 0) + 1
  }

  const totalLines = contents.reduce((s, c) => s + c.split('\n').length, 0)
  const foldEfficiency = computeFoldEfficiency(allFolds, totalLines)
  const unnecessaryFolds = countUnnecessaryFolds(allFolds)
  const foldComplexityIndex = computeFoldComplexityIndex(allFolds)
  const overallFoldQuality = classifyOverallQuality(avgCleanScore, avgUnfoldability)

  const stats: OrigamiStats = {
    totalFolds,
    avgDepth,
    maxDepth,
    deepestFile: deepestScore.file,
    cleanestFile: cleanestScore.file,
    messiestFile: messiestScore.file,
    avgCleanScore,
    avgUnfoldability,
    patternDistribution,
    overallFoldQuality,
    foldEfficiency,
    unnecessaryFolds,
    foldComplexityIndex,
  }

  const recommendations = generateOrigamiRecommendations(allFolds, patterns, scores, stats)

  return { folds: allFolds, patterns, scores, stats, recommendations }
}
