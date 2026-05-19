// ─── Types ────────────────────────────────────────────────────────────────────

export type Severity = 'info' | 'warning' | 'critical'

export interface PrismFinding {
  file: string
  line: number
  severity: Severity
  message: string
}

export interface PrismFile {
  file: string
  score: number
  findings: PrismFinding[]
}

export interface PrismStats {
  averageScore: number
  bestFile: string
  worstFile: string
  findingCount: number
  criticalCount: number
}

export interface Prism {
  name: string
  color: string
  description: string
  files: PrismFile[]
  stats: PrismStats
  insights: string[]
}

export interface CompositeResult {
  overallScore: number
  overallGrade: string
  worstPrism: string
  bestPrism: string
}

export interface PrismResultStats {
  totalPrisms: number
  totalFindings: number
  averageScore: number
}

export interface PrismResult {
  prisms: Prism[]
  composite: CompositeResult
  stats: PrismResultStats
  recommendations: string[]
}

export interface PrismOptions {
  verbose?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const line of content.split('\n')) {
    const m = line.match(/import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/)
    if (m) imports.push(m[1])
  }
  return imports
}

function computePrismStats(files: PrismFile[]): PrismStats {
  if (files.length === 0) {
    return { averageScore: 50, bestFile: '', worstFile: '', findingCount: 0, criticalCount: 0 }
  }
  const avg = Math.round(files.reduce((s, f) => s + f.score, 0) / files.length)
  const best = files.reduce((a, b) => a.score >= b.score ? a : b)
  const worst = files.reduce((a, b) => a.score <= b.score ? a : b)
  const findingCount = files.reduce((s, f) => s + f.findings.length, 0)
  const criticalCount = files.reduce((s, f) => s + f.findings.filter((f2) => f2.severity === 'critical').length, 0)
  return { averageScore: avg, bestFile: best.file, worstFile: worst.file, findingCount, criticalCount }
}

function clampScore(score: number): number {
  return Math.min(Math.max(Math.round(score), 0), 100)
}

// ─── analyzeThroughReadability ────────────────────────────────────────────────

/**
 * Analyze code through the readability prism.
 *
 * @example
 * analyzeThroughReadability(files, contents)
 */
export function analyzeThroughReadability(files: string[], contents: string[]): Prism {
  const prismFiles: PrismFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const lines = content.split('\n')
    const findings: PrismFinding[] = []
    let score = 100

    const longLines = lines.filter((l) => l.length > 120).length
    if (longLines > 5) {
      score -= 10
      findings.push({ file, line: 1, severity: 'warning', message: `${longLines} lines exceed 120 characters` })
    }

    let maxNesting = 0
    let depth = 0
    for (const ch of content) {
      if (ch === '{') { depth++; if (depth > maxNesting) maxNesting = depth }
      if (ch === '}') depth--
    }
    if (maxNesting > 6) {
      score -= 15
      findings.push({ file, line: 1, severity: 'warning', message: `Deep nesting detected (depth: ${maxNesting})` })
    }

    const commentLines = lines.filter((l) => l.trimStart().startsWith('//') || l.trimStart().startsWith('*')).length
    const commentRatio = lines.length > 0 ? commentLines / lines.length : 0
    if (commentRatio < 0.05 && lines.length > 20) {
      score -= 10
      findings.push({ file, line: 1, severity: 'info', message: 'Low comment ratio — consider documenting intent' })
    }

    const shortNames = (content.match(/\b[a-z]\b\s*=/g) ?? []).length
    if (shortNames > 3) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: 'Single-letter variable names detected' })
    }

    prismFiles.push({ file, score: clampScore(score), findings })
  }

  const stats = computePrismStats(prismFiles)
  const insights: string[] = []
  if (stats.averageScore >= 80) insights.push('Code is generally readable')
  if (stats.averageScore < 60) insights.push('Readability needs improvement — consider refactoring')
  if (stats.findingCount > 0) insights.push(`${stats.findingCount} readability findings across ${files.length} files`)

  return {
    name: 'Readability',
    color: 'red',
    description: 'Line length, naming, comments, nesting depth',
    files: prismFiles,
    stats,
    insights,
  }
}

// ─── analyzeThroughReliability ────────────────────────────────────────────────

/**
 * Analyze code through the reliability prism.
 *
 * @example
 * analyzeThroughReliability(files, contents)
 */
export function analyzeThroughReliability(files: string[], contents: string[]): Prism {
  const prismFiles: PrismFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const lines = content.split('\n')
    const findings: PrismFinding[] = []
    let score = 100

    const silentCatch = (content.match(/catch\s*\(\s*\w+\s*\)\s*\{\s*\}/g) ?? []).length
    if (silentCatch > 0) {
      score -= silentCatch * 10
      findings.push({ file, line: 1, severity: 'critical', message: `${silentCatch} silent catch block(s) — errors may be swallowed` })
    }

    const anyTypes = (content.match(/:\s*any\b/g) ?? []).length
    if (anyTypes > 0) {
      score -= anyTypes * 5
      findings.push({ file, line: 1, severity: 'warning', message: `${anyTypes} 'any' type usage(s) weaken type safety` })
    }

    const hasTry = (content.match(/\btry\s*\{/g) ?? []).length
    const hasCatch = (content.match(/\bcatch\b/g) ?? []).length
    if (hasTry === 0 && lines.length > 20) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: 'No error handling detected' })
    }

    const bangOps = (content.match(/\w+!/g) ?? []).length
    if (bangOps > 3) {
      score -= 5
      findings.push({ file, line: 1, severity: 'warning', message: `${bangOps} non-null assertion(s) — potential runtime error` })
    }

    prismFiles.push({ file, score: clampScore(score), findings })
  }

  const stats = computePrismStats(prismFiles)
  const insights: string[] = []
  if (stats.criticalCount > 0) insights.push(`${stats.criticalCount} critical reliability issue(s) found`)
  if (stats.averageScore >= 80) insights.push('Error handling looks solid')
  if (stats.findingCount > 0) insights.push(`${stats.findingCount} reliability findings`)

  return {
    name: 'Reliability',
    color: 'orange',
    description: 'Error handling, null safety, type coverage',
    files: prismFiles,
    stats,
    insights,
  }
}

// ─── analyzeThroughEfficiency ──────────────────────────────────────────────────

/**
 * Analyze code through the efficiency prism.
 *
 * @example
 * analyzeThroughEfficiency(files, contents)
 */
export function analyzeThroughEfficiency(files: string[], contents: string[]): Prism {
  const prismFiles: PrismFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const findings: PrismFinding[] = []
    let score = 100

    const syncIo = (content.match(/readFileSync|writeFileSync|existsSync/g) ?? []).length
    if (syncIo > 0) {
      score -= syncIo * 8
      findings.push({ file, line: 1, severity: 'warning', message: `${syncIo} synchronous I/O call(s)` })
    }

    const awaitInLoop = (content.match(/for\s*\(.*await|while\s*\(.*await/g) ?? []).length
    if (awaitInLoop > 0) {
      score -= awaitInLoop * 10
      findings.push({ file, line: 1, severity: 'warning', message: `${awaitInLoop} await-in-loop pattern(s)` })
    }

    const consoleInCode = (content.match(/\bconsole\.\w+\(/g) ?? []).length
    if (consoleInCode > 5) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `${consoleInCode} console statement(s) — consider a logger` })
    }

    prismFiles.push({ file, score: clampScore(score), findings })
  }

  const stats = computePrismStats(prismFiles)
  const insights: string[] = []
  if (stats.findingCount > 0) insights.push(`${stats.findingCount} efficiency findings`)
  if (stats.averageScore >= 80) insights.push('Code runs efficiently')
  if (stats.worstFile) insights.push(`Least efficient file: ${stats.worstFile}`)

  return {
    name: 'Efficiency',
    color: 'yellow',
    description: 'Algorithm complexity, I/O patterns, memory usage',
    files: prismFiles,
    stats,
    insights,
  }
}

// ─── analyzeThroughModularity ──────────────────────────────────────────────────

/**
 * Analyze code through the modularity prism.
 *
 * @example
 * analyzeThroughModularity(files, contents)
 */
export function analyzeThroughModularity(files: string[], contents: string[]): Prism {
  const prismFiles: PrismFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const findings: PrismFinding[] = []
    let score = 100

    const imports = extractImports(content)
    if (imports.length > 15) {
      score -= 10
      findings.push({ file, line: 1, severity: 'warning', message: `High coupling: ${imports.length} imports` })
    } else if (imports.length > 10) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `Moderate coupling: ${imports.length} imports` })
    }

    const lineCount = content.split('\n').length
    if (lineCount > 500) {
      score -= 15
      findings.push({ file, line: 1, severity: 'warning', message: `Large file: ${lineCount} lines — consider splitting` })
    } else if (lineCount > 300) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `File getting large: ${lineCount} lines` })
    }

    const exports = (content.match(/export\s+(?:default\s+)?(?:function|class|const|type|interface)\s+\w+/g) ?? []).length
    if (exports > 10) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `${exports} exports — may violate single responsibility` })
    }

    prismFiles.push({ file, score: clampScore(score), findings })
  }

  const stats = computePrismStats(prismFiles)
  const insights: string[] = []
  if (stats.averageScore >= 80) insights.push('Good modularity and separation')
  if (stats.findingCount > 0) insights.push(`${stats.findingCount} modularity findings`)

  return {
    name: 'Modularity',
    color: 'green',
    description: 'Coupling, cohesion, single responsibility',
    files: prismFiles,
    stats,
    insights,
  }
}

// ─── analyzeThroughEvolution ──────────────────────────────────────────────────

/**
 * Analyze code through the evolution prism.
 *
 * @example
 * analyzeThroughEvolution(files, contents)
 */
export function analyzeThroughEvolution(files: string[], contents: string[]): Prism {
  const prismFiles: PrismFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const findings: PrismFinding[] = []
    let score = 100

    const hasInterfaces = /interface\s+\w+/.test(content)
    const hasTypes = /type\s+\w+\s*=/.test(content)
    const hasGenerics = /<\w+>/.test(content)
    if (!hasInterfaces && !hasTypes && !hasGenerics && content.split('\n').length > 20) {
      score -= 10
      findings.push({ file, line: 1, severity: 'info', message: 'No abstractions (interfaces/types/generics) — less extensible' })
    }

    const hardcodedValues = (content.match(/['"][A-Z][A-Z_]{3,}['"]/g) ?? []).length
    if (hardcodedValues > 5) {
      score -= 8
      findings.push({ file, line: 1, severity: 'warning', message: `${hardcodedValues} hardcoded value(s) — consider configuration` })
    }

    const switchCount = (content.match(/\bswitch\s*\(/g) ?? []).length
    if (switchCount > 3) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `${switchCount} switch statement(s) — consider strategy pattern` })
    }

    prismFiles.push({ file, score: clampScore(score), findings })
  }

  const stats = computePrismStats(prismFiles)
  const insights: string[] = []
  if (stats.averageScore >= 80) insights.push('Code is well-structured for evolution')
  if (stats.findingCount > 0) insights.push(`${stats.findingCount} evolution findings`)

  return {
    name: 'Evolution',
    color: 'blue',
    description: 'Extensibility, abstraction levels, config-driven',
    files: prismFiles,
    stats,
    insights,
  }
}

// ─── analyzeThroughClarity ────────────────────────────────────────────────────

/**
 * Analyze code through the clarity prism.
 *
 * @example
 * analyzeThroughClarity(files, contents)
 */
export function analyzeThroughClarity(files: string[], contents: string[]): Prism {
  const prismFiles: PrismFile[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const findings: PrismFinding[] = []
    let score = 100

    const magicNumbers = (content.match(/(?<![.\w])\d{2,}(?![.\w])/g) ?? []).filter((n) => {
      const v = parseInt(n, 10)
      return v > 1 && v !== 0 && v !== 100 && v !== 10 && v !== 1000
    }).length
    if (magicNumbers > 5) {
      score -= 8
      findings.push({ file, line: 1, severity: 'warning', message: `${magicNumbers} magic number(s) — extract to named constants` })
    }

    const hasJSDoc = /\/\*\*[\s\S]*?\*\//.test(content)
    if (!hasJSDoc && content.split('\n').length > 20) {
      score -= 10
      findings.push({ file, line: 1, severity: 'info', message: 'No JSDoc documentation found' })
    }

    const singleLetterVars = (content.match(/(?:let|var|const)\s+[a-z]\b/g) ?? []).length
    if (singleLetterVars > 5) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `${singleLetterVars} single-letter variable(s) — use descriptive names` })
    }

    const boolParams = (content.match(/\w+\(\s*(?:true|false)/g) ?? []).length
    if (boolParams > 3) {
      score -= 5
      findings.push({ file, line: 1, severity: 'info', message: `${boolParams} boolean parameter(s) — consider options object` })
    }

    prismFiles.push({ file, score: clampScore(score), findings })
  }

  const stats = computePrismStats(prismFiles)
  const insights: string[] = []
  if (stats.averageScore >= 80) insights.push('Code intent is clear and self-documenting')
  if (stats.findingCount > 0) insights.push(`${stats.findingCount} clarity findings`)

  return {
    name: 'Clarity',
    color: 'violet',
    description: 'Self-documentation, meaningful names, no magic values',
    files: prismFiles,
    stats,
    insights,
  }
}

// ─── computeComposite ─────────────────────────────────────────────────────────

/**
 * Compute composite score from all prisms.
 *
 * @example
 * computeComposite(prisms)
 */
export function computeComposite(prisms: Prism[]): CompositeResult {
  if (prisms.length === 0) return { overallScore: 50, overallGrade: 'C', worstPrism: '', bestPrism: '' }
  const overallScore = Math.round(prisms.reduce((s, p) => s + p.stats.averageScore, 0) / prisms.length)
  let overallGrade: string
  if (overallScore >= 90) overallGrade = 'A'
  else if (overallScore >= 80) overallGrade = 'B'
  else if (overallScore >= 70) overallGrade = 'C'
  else if (overallScore >= 60) overallGrade = 'D'
  else overallGrade = 'F'

  const best = prisms.reduce((a, b) => a.stats.averageScore >= b.stats.averageScore ? a : b)
  const worst = prisms.reduce((a, b) => a.stats.averageScore <= b.stats.averageScore ? a : b)

  return { overallScore, overallGrade, worstPrism: worst.name, bestPrism: best.name }
}

// ─── generateInsights ─────────────────────────────────────────────────────────

/**
 * Generate key insights for a prism.
 *
 * @example
 * generateInsights(prism)
 */
export function generateInsights(prism: Prism): string[] {
  return prism.insights.length > 0 ? prism.insights : [`${prism.name} analysis: no significant findings`]
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations from all prisms.
 *
 * @example
 * generateRecommendations(prisms, composite)
 */
export function generateRecommendations(prisms: Prism[], composite: CompositeResult): string[] {
  const recs: string[] = []

  if (composite.overallScore < 60) {
    recs.push(`Overall score is ${composite.overallScore}/100 — significant improvement needed`)
  }

  for (const prism of prisms) {
    if (prism.stats.averageScore < 60) {
      recs.push(`${prism.name} prism scores low (${prism.stats.averageScore}) — prioritize ${prism.description.toLowerCase()}`)
    }
  }

  if (composite.worstPrism) {
    recs.push(`Weakest dimension: ${composite.worstPrism} — focus here for biggest impact`)
  }

  const totalCritical = prisms.reduce((s, p) => s + p.stats.criticalCount, 0)
  if (totalCritical > 0) {
    recs.push(`${totalCritical} critical finding(s) across all prisms — address urgently`)
  }

  if (recs.length === 0) {
    recs.push('All prisms show healthy scores — maintain current quality standards')
  }

  return recs
}

// ─── buildPrismResult ─────────────────────────────────────────────────────────

/**
 * Build the complete prism analysis result.
 *
 * @example
 * buildPrismResult(['index.ts'], ['export {}'])
 */
export function buildPrismResult(
  files: string[],
  contents: string[],
  _options?: PrismOptions,
): PrismResult {
  const prisms: Prism[] = [
    analyzeThroughReadability(files, contents),
    analyzeThroughReliability(files, contents),
    analyzeThroughEfficiency(files, contents),
    analyzeThroughModularity(files, contents),
    analyzeThroughEvolution(files, contents),
    analyzeThroughClarity(files, contents),
  ]

  const composite = computeComposite(prisms)
  const totalFindings = prisms.reduce((s, p) => s + p.stats.findingCount, 0)
  const averageScore = Math.round(prisms.reduce((s, p) => s + p.stats.averageScore, 0) / prisms.length)

  const stats: PrismResultStats = {
    totalPrisms: prisms.length,
    totalFindings,
    averageScore,
  }

  const recommendations = generateRecommendations(prisms, composite)

  return { prisms, composite, stats, recommendations }
}
