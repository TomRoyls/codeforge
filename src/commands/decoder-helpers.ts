// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReadabilityDimensions {
  naming: number
  structure: number
  cognitive: number
  documentation: number
  consistency: number
  simplicity: number
}

export interface ReadabilityIssue {
  file: string
  line: number
  dimension: string
  severity: 'low' | 'medium' | 'high'
  message: string
  suggestion: string
}

export interface ReadabilityScore {
  file: string
  overall: number
  grade: string
  dimensions: ReadabilityDimensions
  issues: ReadabilityIssue[]
}

export interface DecoderStats {
  averageReadability: number
  gradeDistribution: Record<string, number>
  weakestDimension: string
  strongestDimension: string
  mostReadableFile: string
  leastReadableFile: string
  totalIssues: number
  highSeverityIssues: number
  readabilityTrend: 'improving' | 'stable' | 'declining'
}

export interface DecoderResult {
  scores: ReadabilityScore[]
  stats: DecoderStats
  recommendations: string[]
}

export interface DecoderOptions {
  verbose?: boolean
}

// ─── Grade Computation ────────────────────────────────────────────────────────

/**
 * Compute letter grade from score.
 *
 * @example
 * computeGrade(92)
 */
export function computeGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ─── Naming Score ─────────────────────────────────────────────────────────────

/**
 * Score naming clarity (0-100).
 *
 * @example
 * scoreNaming(fileContent)
 */
export function scoreNaming(content: string): number {
  let score = 80

  // Penalize single-letter variable names (except i, j, k in loops)
  const singleLetterVars = content.match(/\b(?:const|let|var)\s+([a-z])\b/g)
  if (singleLetterVars) {
    const loopLetters = new Set<string>()
    const loopBlocks = content.match(/for\s*\([^)]*\b([ijk])\b[^)]*\)/g)
    if (loopBlocks) {
      for (const block of loopBlocks) {
        const m = block.match(/([ijk])/)
        if (m) loopLetters.add(m[1] ?? '')
      }
    }
    const badVars = singleLetterVars.filter((v) => {
      const varMatch = v.match(/\b(?:const|let|var)\s+([a-z])\b/)
      const letter = varMatch?.[1]
      return letter && letter !== 'i' && letter !== 'j' && letter !== 'k' && !loopLetters.has(letter)
    })
    score -= Math.min(20, badVars.length * 4)
  }

  // Bonus: boolean prefixes
  const boolPrefixes = content.match(/\b(?:is|has|should|can|will|did|was)\w+/g)
  if (boolPrefixes && boolPrefixes.length > 0) {
    score += Math.min(10, boolPrefixes.length * 2)
  }

  // Bonus: descriptive names (longer variable names)
  const descriptiveVars = content.match(/\b(?:const|let)\s+([a-z][a-zA-Z]{3,})\b/g)
  if (descriptiveVars && descriptiveVars.length >= 5) {
    score += Math.min(10, descriptiveVars.length)
  }

  // Penalty: very short function names
  const shortFuncs = content.match(/(?:function\s+|const\s+|let\s+)([a-z])\s*[=(]/g)
  if (shortFuncs) {
    score -= Math.min(10, shortFuncs.length * 3)
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Structure Score ──────────────────────────────────────────────────────────

/**
 * Score code structure (0-100).
 *
 * @example
 * scoreStructure(fileContent)
 */
export function scoreStructure(content: string): number {
  let score = 80
  const lines = content.split('\n')

  // Find function bodies and measure their lengths
  const funcLengths = extractFunctionLengths(content)
  for (const len of funcLengths) {
    if (len > 50) score -= 15
    else if (len > 30) score -= 8
    else if (len > 20) score -= 3
  }

  // Nesting depth
  let maxNesting = 0
  let currentNesting = 0
  for (const line of lines) {
    const opens = (line.match(/{/g) ?? []).length
    const closes = (line.match(/}/g) ?? []).length
    currentNesting += opens - closes
    if (currentNesting > maxNesting) maxNesting = currentNesting
  }

  if (maxNesting > 6) score -= 20
  else if (maxNesting > 4) score -= 10
  else if (maxNesting > 3) score -= 5

  // Bonus: early returns
  const earlyReturns = content.match(/^\s*if\s*\([^)]+\)\s*(?:return|throw)/gm)
  if (earlyReturns && earlyReturns.length > 0) {
    score += Math.min(10, earlyReturns.length * 2)
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Extract function lengths from content.
 *
 * @example
 * extractFunctionLengths(content)
 */
export function extractFunctionLengths(content: string): number[] {
  const lengths: number[] = []
  const lines = content.split('\n')
  let funcStart = -1
  let depth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    if (funcStart === -1) {
      if (/^\s*(?:export\s+)?(?:async\s+)?(?:function\s|const\s+\w+\s*=\s*(?:async\s*)?\(|const\s+\w+\s*=\s*(?:async\s*)?function)/.test(line)) {
        funcStart = i
        depth = (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length
        if (depth <= 0) {
          funcStart = -1
          depth = 0
        }
      }
    } else {
      depth += (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length
      if (depth <= 0) {
        lengths.push(i - funcStart + 1)
        funcStart = -1
        depth = 0
      }
    }
  }

  return lengths
}

// ─── Cognitive Complexity Score ───────────────────────────────────────────────

/**
 * Score cognitive complexity (0-100). Higher = more readable (less complex).
 *
 * @example
 * scoreCognitiveComplexity(fileContent)
 */
export function scoreCognitiveComplexity(content: string): number {
  let complexity = 0
  let nestingLevel = 0
  let maxNesting = 0

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()

    // Track nesting
    const opens = (trimmed.match(/{/g) ?? []).length
    const closes = (trimmed.match(/}/g) ?? []).length
    nestingLevel += opens - closes
    if (nestingLevel > maxNesting) maxNesting = nestingLevel

    // Nested control flow adds more
    if (/\b(if|else|for|while|switch|catch)\b/.test(trimmed)) {
      complexity += 1 + Math.max(0, nestingLevel - 1)
    }

    // Break/continue in non-trivial contexts
    if (/\b(break|continue)\b/.test(trimmed)) {
      complexity += 1
    }

    // Boolean operator chaining
    const boolOps = trimmed.match(/&&|\|\|/g)
    if (boolOps) {
      complexity += Math.max(0, boolOps.length - 1)
    }

    // Recursive calls (simplified heuristic)
    const funcMatch = content.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/)
    if (funcMatch) {
      const funcName = funcMatch[1] ?? funcMatch[2]
      if (funcName && trimmed.includes(funcName) && trimmed !== lines[0]?.trim()) {
        complexity += 2
      }
    }
  }

  // Convert complexity to readability score (lower complexity = higher score)
  if (complexity <= 10) return 100
  if (complexity <= 25) return 90
  if (complexity <= 50) return 75
  if (complexity <= 100) return 60
  if (complexity <= 200) return 40
  return Math.max(0, 30 - Math.floor((complexity - 200) / 50))
}

// ─── Documentation Score ──────────────────────────────────────────────────────

/**
 * Score documentation quality (0-100).
 *
 * @example
 * scoreDocumentation(fileContent)
 */
export function scoreDocumentation(content: string): number {
  const lines = content.split('\n')
  const totalLines = lines.length
  if (totalLines === 0) return 50

  let score = 50

  // Comment density
  const commentLines = lines.filter((l) => l.trim().startsWith('//') || l.trim().startsWith('*') || l.trim().startsWith('/**')).length
  const commentRatio = commentLines / totalLines
  if (commentRatio >= 0.15 && commentRatio <= 0.4) {
    score += 20
  } else if (commentRatio > 0.4) {
    score += 10 // Over-commented is slightly penalized
  } else if (commentRatio >= 0.05) {
    score += 10
  }

  // JSDoc coverage on exported functions
  const exportedFuncs = content.match(/export\s+(?:async\s+)?function\s+\w+/g)
  if (exportedFuncs && exportedFuncs.length > 0) {
    const jsdocs = content.match(/\/\*\*[\s\S]*?\*\//g)
    const jsdocCount = jsdocs ? jsdocs.length : 0
    const coverage = jsdocCount / exportedFuncs.length
    score += Math.round(coverage * 20)
  }

  // Penalty: commented-out code
  const commentedCode = content.match(/^\s*\/\/\s*(?:const|let|var|function|class|import|export|if|for|while|return)\s/gm)
  if (commentedCode) {
    score -= Math.min(15, commentedCode.length * 3)
  }

  // Bonus: inline comments near complex logic
  const inlineComments = content.match(/\}\s*\/\/\s*.+/g)
  if (inlineComments && inlineComments.length > 0) {
    score += Math.min(5, inlineComments.length)
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Consistency Score ────────────────────────────────────────────────────────

/**
 * Score code consistency (0-100).
 *
 * @example
 * scoreConsistency(fileContent)
 */
export function scoreConsistency(content: string): number {
  let score = 80

  // Check naming convention consistency
  const camelCase = content.match(/\b[a-z][a-zA-Z]+\b/g) ?? []
  const snakeCase = content.match(/\b[a-z]+_[a-z_]+\b/g) ?? []
  const total = camelCase.length + snakeCase.length
  if (total > 0) {
    const ratio = Math.max(camelCase.length, snakeCase.length) / total
    score += Math.round(ratio * 15)
  }

  // Check import style consistency
  const importLines = content.match(/^import\s+.+from\s+['"][^'"]+['"]/gm) ?? []
  const requireLines = content.match(/require\s*\(/g) ?? []
  const totalImports = importLines.length + requireLines.length
  if (totalImports > 1) {
    const importRatio = Math.max(importLines.length, requireLines.length) / totalImports
    score += Math.round(importRatio * 5)
  }

  // Check export style consistency
  const namedExports = content.match(/^export\s+(?:function|const|class|interface|type)\s/gm) ?? []
  const defaultExports = content.match(/^export\s+default\s/gm) ?? []
  if (namedExports.length > 0 && defaultExports.length > 0) {
    score -= 5
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Simplicity Score ─────────────────────────────────────────────────────────

/**
 * Score code simplicity (0-100).
 *
 * @example
 * scoreSimplicity(fileContent)
 */
export function scoreSimplicity(content: string): number {
  let score = 85

  // Penalty: single-use interfaces/types
  const interfaces = content.match(/(?:export\s+)?interface\s+(\w+)/g) ?? []
  const types = content.match(/(?:export\s+)?type\s+(\w+)\s*=/g) ?? []
  const totalTypes = interfaces.length + types.length

  const totalLines = content.split('\n').length
  if (totalTypes > totalLines * 0.15) {
    score -= 15
  }

  // Penalty: complex generics
  const complexGenerics = content.match(/<[^>]+<[^>]+>/g)
  if (complexGenerics) {
    score -= Math.min(15, complexGenerics.length * 5)
  }

  // Penalty: overly long ternary chains
  const ternaryChains = content.match(/\?.+:.*\?.+:.*\?.+/g)
  if (ternaryChains) {
    score -= Math.min(10, ternaryChains.length * 5)
  }

  // Penalty: deep type nesting
  const deepNesting = content.match(/Record<[^>]+Record</g)
  if (deepNesting) {
    score -= 10
  }

  // Penalty: very long lines
  const longLines = content.split('\n').filter((l) => l.length > 150).length
  if (longLines > 0) {
    score -= Math.min(10, longLines * 2)
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Issue Identification ─────────────────────────────────────────────────────

/**
 * Identify specific readability issues.
 *
 * @example
 * identifyIssues(content, scores)
 */
export function identifyIssues(
  file: string,
  content: string,
  dimensions: ReadabilityDimensions,
): ReadabilityIssue[] {
  const issues: ReadabilityIssue[] = []
  const lines = content.split('\n')

  // Naming issues
  if (dimensions.naming < 70) {
    const singleLetter = content.match(/\b(?:const|let|var)\s+([a-z])\b/g)
    if (singleLetter) {
      for (const match of singleLetter) {
        const idx = content.indexOf(match)
        const lineNum = content.substring(0, idx).split('\n').length
        issues.push({
          file,
          line: lineNum,
          dimension: 'naming',
          severity: 'medium',
          message: 'Single-letter variable name',
          suggestion: 'Use a descriptive name that conveys purpose',
        })
      }
    }
  }

  // Structure issues
  if (dimensions.structure < 70) {
    const funcLengths = extractFunctionLengths(content)
    let funcIdx = 0
    const funcPattern = /^\s*(?:export\s+)?(?:async\s+)?(?:function\s|const\s+\w+\s*=\s*(?:async\s*)?\(|const\s+\w+\s*=\s*(?:async\s*)?function)/gm
    let match: RegExpExecArray | null
    while ((match = funcPattern.exec(content)) !== null) {
      const lineNum = content.substring(0, match.index).split('\n').length
      const len = funcLengths[funcIdx]
      if (len !== undefined && len > 30) {
        issues.push({
          file,
          line: lineNum,
          dimension: 'structure',
          severity: len > 50 ? 'high' : 'medium',
          message: `Function is ${len} lines long`,
          suggestion: 'Break into smaller functions (under 20 lines each)',
        })
      }
      funcIdx++
    }
  }

  // Cognitive issues — deep nesting
  if (dimensions.cognitive < 70) {
    let nesting = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      nesting += (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length
      if (nesting > 4) {
        issues.push({
          file,
          line: i + 1,
          dimension: 'cognitive',
          severity: nesting > 6 ? 'high' : 'medium',
          message: `Nesting depth of ${nesting} levels`,
          suggestion: 'Extract nested logic into separate functions',
        })
        break
      }
    }
  }

  // Documentation issues
  if (dimensions.documentation < 50) {
    const exportedFuncs = content.match(/export\s+(?:async\s+)?function\s+\w+/g)
    if (exportedFuncs && exportedFuncs.length > 0) {
      const jsdocs = content.match(/\/\*\*[\s\S]*?\*\//g)
      if (!jsdocs || jsdocs.length < exportedFuncs.length) {
        issues.push({
          file,
          line: 1,
          dimension: 'documentation',
          severity: 'low',
          message: 'Missing JSDoc on exported functions',
          suggestion: 'Add JSDoc documentation to all exported functions',
        })
      }
    }
  }

  // Simplicity issues — long lines
  if (dimensions.simplicity < 70) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.length > 150) {
        issues.push({
          file,
          line: i + 1,
          dimension: 'simplicity',
          severity: 'medium',
          message: `Line is ${lines[i]!.length} characters long`,
          suggestion: 'Break long lines into multiple lines',
        })
      }
    }
  }

  return issues
}

// ─── Score File ───────────────────────────────────────────────────────────────

/**
 * Score a single file's readability.
 *
 * @example
 * scoreFile('utils.ts', content)
 */
export function scoreFile(file: string, content: string): ReadabilityScore {
  const dimensions: ReadabilityDimensions = {
    naming: scoreNaming(content),
    structure: scoreStructure(content),
    cognitive: scoreCognitiveComplexity(content),
    documentation: scoreDocumentation(content),
    consistency: scoreConsistency(content),
    simplicity: scoreSimplicity(content),
  }

  const overall = Math.round(
    (dimensions.naming + dimensions.structure + dimensions.cognitive +
     dimensions.documentation + dimensions.consistency + dimensions.simplicity) / 6,
  )

  const issues = identifyIssues(file, content, dimensions)

  return {
    file,
    overall,
    grade: computeGrade(overall),
    dimensions,
    issues,
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute decoder statistics.
 *
 * @example
 * computeDecoderStats(scores)
 */
export function computeDecoderStats(scores: ReadabilityScore[]): DecoderStats {
  if (scores.length === 0) {
    return {
      averageReadability: 0,
      gradeDistribution: {},
      weakestDimension: 'none',
      strongestDimension: 'none',
      mostReadableFile: '',
      leastReadableFile: '',
      totalIssues: 0,
      highSeverityIssues: 0,
      readabilityTrend: 'stable',
    }
  }

  const avgReadability = Math.round(scores.reduce((s, sc) => s + sc.overall, 0) / scores.length)

  const gradeDistribution: Record<string, number> = {}
  for (const s of scores) {
    gradeDistribution[s.grade] = (gradeDistribution[s.grade] ?? 0) + 1
  }

  const dims: Record<string, number[]> = {
    naming: scores.map((s) => s.dimensions.naming),
    structure: scores.map((s) => s.dimensions.structure),
    cognitive: scores.map((s) => s.dimensions.cognitive),
    documentation: scores.map((s) => s.dimensions.documentation),
    consistency: scores.map((s) => s.dimensions.consistency),
    simplicity: scores.map((s) => s.dimensions.simplicity),
  }

  const dimAvgs = Object.fromEntries(
    Object.entries(dims).map(([k, v]) => [k, Math.round(v.reduce((s, n) => s + n, 0) / v.length)]),
  )

  let weakestDimension = 'naming'
  let weakestAvg = 101
  let strongestDimension = 'naming'
  let strongestAvg = -1
  for (const [dim, avg] of Object.entries(dimAvgs)) {
    if (avg < weakestAvg) {
      weakestAvg = avg
      weakestDimension = dim
    }
    if (avg > strongestAvg) {
      strongestAvg = avg
      strongestDimension = dim
    }
  }

  const sorted = [...scores].sort((a, b) => b.overall - a.overall)
  const mostReadableFile = sorted[0]?.file ?? ''
  const leastReadableFile = sorted[sorted.length - 1]?.file ?? ''

  const totalIssues = scores.reduce((s, sc) => s + sc.issues.length, 0)
  const highSeverityIssues = scores.reduce((s, sc) => s + sc.issues.filter((i) => i.severity === 'high').length, 0)

  const readabilityTrend = avgReadability >= 80 ? 'improving' : avgReadability >= 60 ? 'stable' : 'declining'

  return {
    averageReadability: avgReadability,
    gradeDistribution,
    weakestDimension,
    strongestDimension,
    mostReadableFile,
    leastReadableFile,
    totalIssues,
    highSeverityIssues,
    readabilityTrend,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate readability recommendations.
 *
 * @example
 * generateDecoderRecommendations(scores, stats)
 */
export function generateDecoderRecommendations(
  scores: ReadabilityScore[],
  stats: DecoderStats,
): string[] {
  const recs: string[] = []

  if (stats.weakestDimension !== 'none' && stats.averageReadability < 80) {
    recs.push(`Focus on improving ${stats.weakestDimension} — it's your weakest dimension (${stats.averageReadability} avg)`)
  }

  if (stats.highSeverityIssues > 0) {
    recs.push(`${stats.highSeverityIssues} high-severity readability issue(s) need immediate attention`)
  }

  const lowGradeFiles = scores.filter((s) => s.grade === 'D' || s.grade === 'F')
  if (lowGradeFiles.length > 0) {
    recs.push(`${lowGradeFiles.length} file(s) scored D or F — consider refactoring`)
  }

  const docScore = scores.length > 0
    ? Math.round(scores.reduce((s, sc) => s + sc.dimensions.documentation, 0) / scores.length)
    : 0
  if (docScore < 50) {
    recs.push('Documentation coverage is low — add JSDoc to exported functions')
  }

  const namingScore = scores.length > 0
    ? Math.round(scores.reduce((s, sc) => s + sc.dimensions.naming, 0) / scores.length)
    : 0
  if (namingScore < 60) {
    recs.push('Naming clarity needs improvement — use descriptive variable names')
  }

  if (stats.readabilityTrend === 'declining') {
    recs.push('Overall readability is declining — prioritize code quality over velocity')
  }

  if (recs.length === 0) {
    recs.push('Code readability looks good across all dimensions')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete decoder result.
 *
 * @example
 * buildDecoderResult(files, contents)
 */
export function buildDecoderResult(
  files: string[],
  contents: string[],
  _options?: DecoderOptions,
): DecoderResult {
  const scores = files.map((file, i) => scoreFile(file, contents[i] ?? ''))
  const stats = computeDecoderStats(scores)
  const recommendations = generateDecoderRecommendations(scores, stats)

  return { scores, stats, recommendations }
}
