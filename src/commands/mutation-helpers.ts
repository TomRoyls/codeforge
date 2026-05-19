// ─── Types ────────────────────────────────────────────────────────────────────

export type MutationType =
  | 'arithmetic-operator'
  | 'comparison-operator'
  | 'logical-operator'
  | 'boolean-literal'
  | 'number-literal'
  | 'string-literal'
  | 'return-value'
  | 'conditional-boundary'
  | 'negate-condition'
  | 'remove-statement'
  | 'array-method'

export type DetectionLikelihood = 'high' | 'medium' | 'low' | 'unlikely'

export interface MutablePoint {
  file: string
  line: number
  code: string
  mutationType: MutationType
  mutatedCode: string
  detectionLikelihood: DetectionLikelihood
  reason: string
}

export interface MutationCoverage {
  file: string
  totalMutations: number
  detectedMutations: number
  survivalEstimate: number
  coverageScore: number
  riskyMutations: MutablePoint[]
}

export interface MutationStats {
  totalMutationPoints: number
  estimatedDetected: number
  estimatedSurvival: number
  averageCoverageScore: number
  filesBelowThreshold: number
  mostRiskyFile: string
  mutationTypes: Record<string, number>
}

export interface MutationResult {
  files: MutationCoverage[]
  mutations: MutablePoint[]
  stats: MutationStats
  riskyMutations: MutablePoint[]
  recommendations: string[]
}

export interface MutationOptions {
  verbose?: boolean
}

// ─── findArithmeticOperators ──────────────────────────────────────────────────

/**
 * Find arithmetic operators that could be swapped.
 *
 * @example
 * findArithmeticOperators('x + y', 'a.ts') // [MutablePoint]
 */
export function findArithmeticOperators(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')
  const swaps: Record<string, string> = { '+': '-', '-': '+', '*': '/', '/': '*' }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    for (const [op, replacement] of Object.entries(swaps)) {
      const regex = new RegExp(`\\b\\w+\\s*\\${op}\\s*\\w+`, 'g')
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        const code = match[0]!
        const mutated = code.replace(op, replacement)
        mutations.push({
          file: filePath, line: i + 1, code,
          mutationType: 'arithmetic-operator',
          mutatedCode: mutated,
          detectionLikelihood: 'medium',
          reason: `Arithmetic operator ${op} could be swapped to ${replacement}`,
        })
      }
    }
  }
  return mutations
}

// ─── findComparisonOperators ──────────────────────────────────────────────────

/**
 * Find comparison operators that could be changed.
 *
 * @example
 * findComparisonOperators('x === y', 'a.ts') // [MutablePoint]
 */
export function findComparisonOperators(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')
  const swaps: Array<[RegExp, string, string]> = [
    [/===/g, '!==', 'comparison-operator'],
    [/!==/g, '===', 'comparison-operator'],
    [/<=/g, '<', 'conditional-boundary'],
    [/>=/g, '>', 'conditional-boundary'],
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    for (const [regex, replacement, mType] of swaps) {
      const globalRegex = new RegExp(regex.source, 'g')
      let match: RegExpExecArray | null
      while ((match = globalRegex.exec(line)) !== null) {
        const original = match[0]!
        mutations.push({
          file: filePath, line: i + 1, code: original,
          mutationType: mType as MutationType,
          mutatedCode: replacement,
          detectionLikelihood: 'medium',
          reason: `${original} could be mutated to ${replacement}`,
        })
      }
    }
  }
  return mutations
}

// ─── findLogicalOperators ─────────────────────────────────────────────────────

/**
 * Find logical operators that could be swapped.
 *
 * @example
 * findLogicalOperators('x && y', 'a.ts') // [MutablePoint]
 */
export function findLogicalOperators(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue

    const andMatches = line.matchAll(/&&/g)
    for (const m of andMatches) {
      mutations.push({
        file: filePath, line: i + 1, code: '&&',
        mutationType: 'logical-operator', mutatedCode: '||',
        detectionLikelihood: 'medium',
        reason: '&& could be swapped to ||',
      })
    }

    const orMatches = line.matchAll(/\|\|/g)
    for (const m of orMatches) {
      mutations.push({
        file: filePath, line: i + 1, code: '||',
        mutationType: 'logical-operator', mutatedCode: '&&',
        detectionLikelihood: 'medium',
        reason: '|| could be swapped to &&',
      })
    }
  }
  return mutations
}

// ─── findBooleanLiterals ──────────────────────────────────────────────────────

/**
 * Find true/false literals that could be flipped.
 *
 * @example
 * findBooleanLiterals('const x = true', 'a.ts') // [MutablePoint]
 */
export function findBooleanLiterals(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    if (/import\s/.test(line)) continue

    const trueMatches = line.matchAll(/\btrue\b/g)
    for (const m of trueMatches) {
      mutations.push({
        file: filePath, line: i + 1, code: 'true',
        mutationType: 'boolean-literal', mutatedCode: 'false',
        detectionLikelihood: 'medium',
        reason: 'true could be flipped to false',
      })
    }

    const falseMatches = line.matchAll(/\bfalse\b/g)
    for (const m of falseMatches) {
      mutations.push({
        file: filePath, line: i + 1, code: 'false',
        mutationType: 'boolean-literal', mutatedCode: 'true',
        detectionLikelihood: 'medium',
        reason: 'false could be flipped to true',
      })
    }
  }
  return mutations
}

// ─── findNumberLiterals ───────────────────────────────────────────────────────

/**
 * Find number literals (excluding 0, 1) that could change.
 *
 * @example
 * findNumberLiterals('const x = 42', 'a.ts') // [MutablePoint]
 */
export function findNumberLiterals(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    if (/import\s/.test(line)) continue

    const numMatches = line.matchAll(/\b(\d+(?:\.\d+)?)\b/g)
    for (const m of numMatches) {
      const num = parseFloat(m[1]!)
      if (num === 0 || num === 1 || num === -1) continue
      const offset = num > 0 ? num + 1 : num - 1
      mutations.push({
        file: filePath, line: i + 1, code: m[1]!,
        mutationType: 'number-literal', mutatedCode: String(offset),
        detectionLikelihood: 'medium',
        reason: `Number ${num} could be changed to ${offset}`,
      })
    }
  }
  return mutations
}

// ─── findStringLiterals ───────────────────────────────────────────────────────

/**
 * Find string literals that could be changed.
 *
 * @example
 * findStringLiterals("const x = 'hello'", 'a.ts') // [MutablePoint]
 */
export function findStringLiterals(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    if (/import\s|from\s/.test(line) && !/return/.test(line)) continue

    const strMatches = line.matchAll(/['"]([a-zA-Z][a-zA-Z0-9_ ]{2,})['"]/g)
    for (const m of strMatches) {
      const original = m[0]!
      const inner = m[1]!
      const mutated = original.replace(inner, inner + '_mutated')
      mutations.push({
        file: filePath, line: i + 1, code: original,
        mutationType: 'string-literal', mutatedCode: mutated,
        detectionLikelihood: 'low',
        reason: `String "${inner}" could be mutated`,
      })
    }
  }
  return mutations
}

// ─── findReturnStatements ─────────────────────────────────────────────────────

/**
 * Find return statements that could return null.
 *
 * @example
 * findReturnStatements('return x', 'a.ts') // [MutablePoint]
 */
export function findReturnStatements(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const match = line.match(/\breturn\s+([^;{}\n]+)/)
    if (match) {
      const value = match[1]!.trim()
      if (value === 'null' || value === 'undefined' || value === 'void') continue
      mutations.push({
        file: filePath, line: i + 1, code: `return ${value}`,
        mutationType: 'return-value', mutatedCode: 'return null',
        detectionLikelihood: 'medium',
        reason: `Return ${value} could be replaced with null`,
      })
    }
  }
  return mutations
}

// ─── findConditionals ─────────────────────────────────────────────────────────

/**
 * Find conditions that could be negated.
 *
 * @example
 * findConditionals('if (x > 0) {}', 'a.ts') // [MutablePoint]
 */
export function findConditionals(content: string, filePath: string): MutablePoint[] {
  const mutations: MutablePoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const ifMatch = line.match(/\bif\s*\(([^)]+)\)/)
    if (ifMatch) {
      const condition = ifMatch[1]!.trim()
      if (condition.startsWith('!')) continue
      mutations.push({
        file: filePath, line: i + 1, code: condition,
        mutationType: 'negate-condition', mutatedCode: `!(${condition})`,
        detectionLikelihood: 'medium',
        reason: 'Condition could be negated',
      })
    }

    const ternaryMatch = line.match(/\?\s*([^:]+)\s*:/)
    if (ternaryMatch) {
      mutations.push({
        file: filePath, line: i + 1, code: '? :',
        mutationType: 'negate-condition', mutatedCode: 'swapped branches',
        detectionLikelihood: 'medium',
        reason: 'Ternary branches could be swapped',
      })
    }
  }
  return mutations
}

// ─── estimateDetectionLikelihood ──────────────────────────────────────────────

/**
 * Estimate how likely a mutation would be detected by tests.
 *
 * @example
 * estimateDetectionLikelihood(mutation, srcContent, testContent) // 'high'
 */
export function estimateDetectionLikelihood(
  mutation: MutablePoint,
  _sourceContent: string,
  testContent: string,
): DetectionLikelihood {
  if (!testContent) return 'unlikely'

  const hasSpecificAssert = /toBe\(|toEqual\(|toStrictEqual\(|toMatch\(/.test(testContent)
  const hasLooseAssert = /toBeTruthy|toBeFalsy|toBeDefined|toBeUndefined|toBeNull/.test(testContent)
  const hasDescribe = /describe\s*\(/.test(testContent)

  if (hasSpecificAssert && hasDescribe) return 'high'
  if (hasLooseAssert || hasDescribe) return 'medium'
  return 'low'
}

// ─── computeMutationCoverage ──────────────────────────────────────────────────

/**
 * Compute per-file mutation coverage.
 *
 * @example
 * computeMutationCoverage(mutations, 'a.ts') // MutationCoverage
 */
export function computeMutationCoverage(mutations: MutablePoint[], filePath: string): MutationCoverage {
  const fileMutations = mutations.filter((m) => m.file === filePath)
  const totalMutations = fileMutations.length
  const detected = fileMutations.filter(
    (m) => m.detectionLikelihood === 'high' || m.detectionLikelihood === 'medium',
  )
  const detectedMutations = detected.length
  const survivalEstimate = totalMutations > 0
    ? Math.round(((totalMutations - detectedMutations) / totalMutations) * 100)
    : 0
  const coverageScore = totalMutations > 0
    ? Math.round((detectedMutations / totalMutations) * 100)
    : 100
  const riskyMutations = fileMutations.filter(
    (m) => m.detectionLikelihood === 'low' || m.detectionLikelihood === 'unlikely',
  )

  return {
    file: filePath, totalMutations, detectedMutations,
    survivalEstimate, coverageScore, riskyMutations,
  }
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations for improving mutation coverage.
 *
 * @example
 * generateRecommendations(risky, stats) // ['Add assertions for X']
 */
export function generateRecommendations(risky: MutablePoint[], stats: MutationStats): string[] {
  const recs: string[] = []

  if (stats.mostRiskyFile) {
    recs.push(`Most risky file: ${stats.mostRiskyFile} — needs more specific assertions`)
  }

  if (stats.filesBelowThreshold > 0) {
    recs.push(`${stats.filesBelowThreshold} file(s) below coverage threshold — add dedicated test cases`)
  }

  const typeEntries = Object.entries(stats.mutationTypes).sort((a, b) => a[1] - b[1])
  if (typeEntries.length > 0) {
    const weakest = typeEntries[0]!
    recs.push(`Weakest mutation type: ${weakest[0]} (${weakest[1]} points) — focus tests here`)
  }

  if (stats.averageCoverageScore < 50) {
    recs.push(`Average mutation coverage is ${stats.averageCoverageScore}% — significant testing gaps`)
  }

  const riskyNames = risky.slice(0, 3).map((r) => r.mutationType)
  if (riskyNames.length > 0) {
    const unique = [...new Set(riskyNames)]
    recs.push(`Risky mutation types: ${unique.join(', ')} — add precise assertions`)
  }

  if (recs.length === 0) {
    recs.push('Mutation coverage looks healthy — good test quality.')
  }

  return recs
}

// ─── buildMutationResult ──────────────────────────────────────────────────────

/**
 * Orchestrate full mutation analysis.
 *
 * @example
 * buildMutationResult(['a.ts'], ['code...']) // MutationResult
 */
export function buildMutationResult(
  files: string[],
  contents: string[],
  _options?: MutationOptions,
): MutationResult {
  const allMutations: MutablePoint[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''

    allMutations.push(...findArithmeticOperators(content, file))
    allMutations.push(...findComparisonOperators(content, file))
    allMutations.push(...findLogicalOperators(content, file))
    allMutations.push(...findBooleanLiterals(content, file))
    allMutations.push(...findNumberLiterals(content, file))
    allMutations.push(...findStringLiterals(content, file))
    allMutations.push(...findReturnStatements(content, file))
    allMutations.push(...findConditionals(content, file))
  }

  const fileCoverages = files.map((f) => computeMutationCoverage(allMutations, f))
  const riskyMutations = allMutations.filter(
    (m) => m.detectionLikelihood === 'low' || m.detectionLikelihood === 'unlikely',
  )

  const totalMutationPoints = allMutations.length
  const estimatedDetected = allMutations.filter(
    (m) => m.detectionLikelihood === 'high' || m.detectionLikelihood === 'medium',
  ).length
  const estimatedSurvival = totalMutationPoints - estimatedDetected
  const averageCoverageScore = fileCoverages.length > 0
    ? Math.round(fileCoverages.reduce((s, f) => s + f.coverageScore, 0) / fileCoverages.length)
    : 100
  const filesBelowThreshold = fileCoverages.filter((f) => f.coverageScore < 50).length
  const sorted = [...fileCoverages].sort((a, b) => a.coverageScore - b.coverageScore)
  const mostRiskyFile = sorted[0]?.file ?? ''

  const mutationTypes: Record<string, number> = {}
  for (const m of allMutations) {
    mutationTypes[m.mutationType] = (mutationTypes[m.mutationType] ?? 0) + 1
  }

  const stats: MutationStats = {
    totalMutationPoints, estimatedDetected, estimatedSurvival,
    averageCoverageScore, filesBelowThreshold, mostRiskyFile, mutationTypes,
  }

  const recommendations = generateRecommendations(riskyMutations, stats)

  return {
    files: fileCoverages, mutations: allMutations, stats,
    riskyMutations, recommendations,
  }
}
