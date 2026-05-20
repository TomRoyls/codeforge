// ─── Types ────────────────────────────────────────────────────────────────────

export interface DisciplineIndicator {
  name: string
  measurement: number
  target: number
  unit: string
  status: 'exceeding' | 'meeting' | 'approaching' | 'below' | 'critical'
}

export interface Discipline {
  name: string
  score: number
  grade: 'masterwork' | 'excellent' | 'good' | 'fair' | 'poor' | 'neglected'
  indicators: DisciplineIndicator[]
  strengths: string[]
  weaknesses: string[]
  trend: 'improving' | 'stable' | 'declining'
}

export interface PolymathFile {
  file: string
  scores: Record<string, number>
  avgScore: number
  isRenaissance: boolean
  strongestDiscipline: string
  weakestDiscipline: string
  balance: number
  classification: 'polymath' | 'specialist' | 'generalist' | 'unbalanced' | 'novice'
}

export interface DarkAge {
  area: string
  neglectedDisciplines: string[]
  severity: 'minor' | 'moderate' | 'major' | 'dark'
  description: string
  recovery: string
}

export interface RenaissanceStats {
  totalDisciplines: number
  avgDisciplineScore: number
  masterworkDisciplines: number
  neglectedDisciplines: number
  polymathFiles: number
  specialistFiles: number
  noviceFiles: number
  darkAgeAreas: number
  majorDarkAges: number
  avgBalance: number
  renaissanceScore: number
  era: 'golden-age' | 'renaissance' | 'enlightenment' | 'medieval' | 'dark-ages'
  mostBalancedFile: string
  leastBalancedFile: string
  patronDiscipline: string
  neglectedDiscipline: string
}

export interface RenaissanceResult {
  disciplines: Discipline[]
  files: PolymathFile[]
  darkAges: DarkAge[]
  stats: RenaissanceStats
  recommendations: string[]
}

// ─── Discipline Evaluation ────────────────────────────────────────────────────

const DISCIPLINE_NAMES = ['architecture', 'testing', 'documentation', 'performance', 'security', 'devex'] as const
export type DisciplineName = typeof DISCIPLINE_NAMES[number]

/**
 * Make an indicator with computed status
 * @example
 * makeIndicator('exports', 5, 3, 'count') // { status: 'exceeding' }
 */
export function makeIndicator(name: string, measurement: number, target: number, unit: string): DisciplineIndicator {
  const ratio = target > 0 ? measurement / target : (measurement > 0 ? 1 : 0)
  const status: DisciplineIndicator['status'] = ratio >= 1.2 ? 'exceeding' : ratio >= 1.0 ? 'meeting' : ratio >= 0.7 ? 'approaching' : ratio >= 0.4 ? 'below' : 'critical'
  return { name, measurement, target, unit, status }
}

/**
 * Classify discipline grade from score
 * @example
 * classifyDisciplineGrade(90) // 'masterwork'
 */
export function classifyDisciplineGrade(score: number): Discipline['grade'] {
  if (score >= 85) return 'masterwork'
  if (score >= 70) return 'excellent'
  if (score >= 55) return 'good'
  if (score >= 40) return 'fair'
  if (score >= 25) return 'poor'
  return 'neglected'
}

/**
 * Evaluate architecture discipline
 * @example
 * evaluateArchitecture('export function foo() {}', 'a.ts') // Discipline
 */
export function evaluateArchitecture(content: string, _filePath: string): Discipline {
  const exports = (content.match(/\bexport\b/g) || []).length
  const imports = (content.match(/\bimport\b/g) || []).length
  const functions = (content.match(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\()/g) || []).length
  const classes = (content.match(/\bclass\s+\w+/g) || []).length

  let score = 20
  if (exports > 0) score += 15
  if (exports >= 2) score += 10
  if (imports > 0 && imports <= 5) score += 15
  if (imports > 5) score += 5
  if (functions > 0 && functions <= 10) score += 15
  if (classes > 0 && classes <= 3) score += 10
  if (content.length > 20) score += 5
  if (imports > 0 && exports > 0) score += 10

  score = Math.min(100, score)

  const indicators = [
    makeIndicator('exports', exports, 2, 'count'),
    makeIndicator('imports', imports, 1, 'count'),
    makeIndicator('functions', functions, 1, 'count'),
    makeIndicator('classes', classes, 0, 'count'),
  ]

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (exports >= 2) strengths.push('Good module exports')
  else weaknesses.push('Few or no exports')
  if (imports > 0 && imports <= 5) strengths.push('Healthy import count')
  if (imports > 8) weaknesses.push('High import count may indicate tight coupling')

  return {
    name: 'architecture', score, grade: classifyDisciplineGrade(score),
    indicators, strengths, weaknesses, trend: 'stable',
  }
}

/**
 * Evaluate testing discipline
 * @example
 * evaluateTesting('test("foo", () => { expect(1).toBe(1) })') // Discipline
 */
export function evaluateTesting(content: string, _filePath: string): Discipline {
  const testKeywords = (content.match(/\b(test|it|describe|expect|assert)\b/g) || []).length
  const hasTestFramework = /\b(vitest|jest|mocha|pytest)\b/.test(content)
  const hasAssertions = /\bexpect\b|\bassert\b/.test(content)
  const hasEdgeCases = /\b(error|null|undefined|empty|invalid|boundary)\b/i.test(content)

  let score = 10
  if (testKeywords >= 2) score += 20
  if (testKeywords >= 5) score += 15
  if (testKeywords >= 10) score += 10
  if (hasTestFramework) score += 15
  if (hasAssertions) score += 15
  if (hasEdgeCases) score += 10
  if (content.length > 100) score += 5

  score = Math.min(100, score)

  const indicators = [
    makeIndicator('test-keywords', testKeywords, 3, 'count'),
    makeIndicator('framework', hasTestFramework ? 1 : 0, 1, 'boolean'),
    makeIndicator('assertions', hasAssertions ? 1 : 0, 1, 'boolean'),
    makeIndicator('edge-cases', hasEdgeCases ? 1 : 0, 1, 'boolean'),
  ]

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (testKeywords >= 3) strengths.push('Active test patterns')
  else weaknesses.push('Few or no test patterns')
  if (hasAssertions) strengths.push('Uses assertions')
  if (!hasEdgeCases) weaknesses.push('Missing edge case coverage')

  return {
    name: 'testing', score, grade: classifyDisciplineGrade(score),
    indicators, strengths, weaknesses, trend: 'stable',
  }
}

/**
 * Evaluate documentation discipline
 * @example
 * evaluateDocumentation('docstring + export function') // Discipline
 */
export function evaluateDocumentation(content: string, _filePath: string): Discipline {
  const jsdoc = (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
  const comments = (content.match(/\/\/.*$/gm) || []).length
  const hasTypes = /:\s*(string|number|boolean|void|any|unknown)/.test(content)
  const hasExamples = /@example/.test(content)

  let score = 10
  if (jsdoc >= 1) score += 20
  if (jsdoc >= 3) score += 15
  if (comments >= 1) score += 10
  if (comments >= 5) score += 10
  if (hasTypes) score += 15
  if (hasExamples) score += 15
  if (content.length > 50) score += 5

  score = Math.min(100, score)

  const indicators = [
    makeIndicator('jsdoc', jsdoc, 2, 'blocks'),
    makeIndicator('comments', comments, 1, 'lines'),
    makeIndicator('type-annotations', hasTypes ? 1 : 0, 1, 'boolean'),
    makeIndicator('examples', hasExamples ? 1 : 0, 1, 'boolean'),
  ]

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (jsdoc >= 2) strengths.push('Strong JSDoc coverage')
  else weaknesses.push('Minimal JSDoc documentation')
  if (hasTypes) strengths.push('Type annotations present')
  if (!hasExamples) weaknesses.push('Missing usage examples')

  return {
    name: 'documentation', score, grade: classifyDisciplineGrade(score),
    indicators, strengths, weaknesses, trend: 'stable',
  }
}

/**
 * Evaluate performance discipline
 * @example
 * evaluatePerformance('const x = arr.map(f).filter(g)') // Discipline
 */
export function evaluatePerformance(content: string, _filePath: string): Discipline {
  const hasMapFilter = /\.(map|filter|reduce|forEach|find|some|every)\(/.test(content)
  const hasLoops = /\bfor\s*\(/.test(content)
  const hasDeepNesting = (() => {
    let depth = 0
    let maxDepth = 0
    for (const ch of content) {
      if (ch === '{' || ch === '(') { depth++; maxDepth = Math.max(maxDepth, depth) }
      if (ch === '}' || ch === ')') depth--
    }
    return maxDepth > 5
  })()
  const hasOptimizedPatterns = /(?:Set|Map|WeakMap|WeakSet)/.test(content)
  const lineCount = content.split('\n').length

  let score = 30
  if (hasMapFilter) score += 20
  if (hasLoops && !hasMapFilter) score -= 5
  if (!hasDeepNesting) score += 15
  if (hasDeepNesting) score -= 10
  if (hasOptimizedPatterns) score += 15
  if (lineCount <= 200) score += 10
  if (lineCount > 500) score -= 10

  score = Math.max(0, Math.min(100, score))

  const indicators = [
    makeIndicator('functional-methods', hasMapFilter ? 1 : 0, 1, 'boolean'),
    makeIndicator('optimized-data', hasOptimizedPatterns ? 1 : 0, 0, 'boolean'),
    makeIndicator('nesting', hasDeepNesting ? 1 : 0, 0, 'boolean'),
    makeIndicator('file-size', lineCount, 200, 'lines'),
  ]

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (hasMapFilter) strengths.push('Uses functional array methods')
  if (hasOptimizedPatterns) strengths.push('Uses optimized data structures')
  if (hasDeepNesting) weaknesses.push('Deep nesting may hurt readability and performance')
  if (lineCount > 500) weaknesses.push('Large file may benefit from splitting')

  return {
    name: 'performance', score, grade: classifyDisciplineGrade(score),
    indicators, strengths, weaknesses, trend: 'stable',
  }
}

/**
 * Evaluate security discipline
 * @example
 * evaluateSecurity('try { foo() } catch(e) { throw new Error("x") }') // Discipline
 */
export function evaluateSecurity(content: string, _filePath: string): Discipline {
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasErrorHandling = /\b(catch|throw|Error)\b/.test(content)
  const hasAny = (content.match(/\bany\b/g) || []).length
  const hasEval = /\beval\s*\(/.test(content)
  const hasTypeSafety = /:\s*(string|number|boolean|void|unknown|never)/.test(content)
  const hasValidation = /\b(validate|sanitize|check|verify|assert)\b/i.test(content)

  let score = 30
  if (hasTryCatch) score += 15
  if (hasErrorHandling) score += 10
  if (hasTypeSafety) score += 15
  if (hasValidation) score += 15
  if (hasEval) score -= 20
  if (hasAny >= 3) score -= 10
  if (!hasEval && hasAny === 0) score += 10

  score = Math.max(0, Math.min(100, score))

  const indicators = [
    makeIndicator('error-handling', hasErrorHandling ? 1 : 0, 1, 'boolean'),
    makeIndicator('type-safety', hasTypeSafety ? 1 : 0, 1, 'boolean'),
    makeIndicator('any-usage', Math.max(0, 3 - hasAny), 3, 'count'),
    makeIndicator('eval-usage', hasEval ? 0 : 1, 1, 'boolean'),
  ]

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (hasErrorHandling) strengths.push('Error handling present')
  else weaknesses.push('No error handling detected')
  if (hasEval) weaknesses.push('Uses eval() — security risk')
  if (hasAny >= 3) weaknesses.push('Excessive any type usage')
  if (hasTypeSafety) strengths.push('Type annotations improve safety')

  return {
    name: 'security', score, grade: classifyDisciplineGrade(score),
    indicators, strengths, weaknesses, trend: 'stable',
  }
}

/**
 * Evaluate developer experience discipline
 * @example
 * evaluateDevEx('export function computeTotalPrice(items: Item[]): number') // Discipline
 */
export function evaluateDevEx(content: string, _filePath: string): Discipline {
  const avgLineLength = content.length / Math.max(1, content.split('\n').length)
  const hasDescriptiveNames = /(?:compute|calculate|process|handle|validate|transform|create|build|generate|parse)/.test(content)
  const hasConsistentStyle = /^(?:export |const |function |class |import )/m.test(content)
  const hasArrowFunctions = /=>/.test(content)
  const hasDescriptiveVars = /\b(?:result|output|value|config|options|data|response|error|message)\b/.test(content)

  let score = 25
  if (avgLineLength > 20 && avgLineLength < 80) score += 15
  if (hasDescriptiveNames) score += 15
  if (hasConsistentStyle) score += 15
  if (hasArrowFunctions) score += 10
  if (hasDescriptiveVars) score += 10
  if (content.includes('export')) score += 10

  score = Math.min(100, score)

  const indicators = [
    makeIndicator('avg-line-length', Math.round(avgLineLength), 50, 'chars'),
    makeIndicator('descriptive-names', hasDescriptiveNames ? 1 : 0, 1, 'boolean'),
    makeIndicator('consistent-style', hasConsistentStyle ? 1 : 0, 1, 'boolean'),
    makeIndicator('modern-syntax', hasArrowFunctions ? 1 : 0, 1, 'boolean'),
  ]

  const strengths: string[] = []
  const weaknesses: string[] = []
  if (hasDescriptiveNames) strengths.push('Uses descriptive function names')
  else weaknesses.push('Function names could be more descriptive')
  if (hasConsistentStyle) strengths.push('Consistent coding style')
  if (avgLineLength > 100) weaknesses.push('Long lines may hurt readability')

  return {
    name: 'devex', score, grade: classifyDisciplineGrade(score),
    indicators, strengths, weaknesses, trend: 'stable',
  }
}

// ─── Multi-Discipline Evaluation ───────────────────────────────────────────────

/**
 * Evaluate all 6 disciplines for a file
 * @example
 * evaluateAllDisciplines('export function foo() {}', 'a.ts') // Discipline[]
 */
export function evaluateAllDisciplines(content: string, filePath: string): Discipline[] {
  return [
    evaluateArchitecture(content, filePath),
    evaluateTesting(content, filePath),
    evaluateDocumentation(content, filePath),
    evaluatePerformance(content, filePath),
    evaluateSecurity(content, filePath),
    evaluateDevEx(content, filePath),
  ]
}

// ─── Polymath Classification ──────────────────────────────────────────────────

/**
 * Compute balance score — how even the discipline scores are
 * @example
 * computeBalance({ architecture: 70, testing: 70 }) // 100
 */
export function computeBalance(scores: Record<string, number>): number {
  const vals = Object.values(scores)
  if (vals.length === 0) return 100
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length
  const variance = vals.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / vals.length
  const maxVariance = 2500
  return Math.max(0, Math.round(100 - (variance / maxVariance) * 100))
}

/**
 * Classify a file based on its discipline scores
 * @example
 * classifyPolymath({ architecture: 70, testing: 70 }) // 'generalist'
 */
export function classifyPolymath(scores: Record<string, number>): PolymathFile['classification'] {
  const vals = Object.values(scores)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length

  if (vals.every(v => v >= 60)) return 'polymath'
  if (max >= 80 && vals.filter(v => v >= 70).length <= 2) return 'specialist'
  if (avg < 40) return 'novice'
  if (max - min > 40) return 'unbalanced'
  return 'generalist'
}

/**
 * Create a PolymathFile from discipline evaluations
 * @example
 * createPolymathFile('a.ts', disciplines)
 */
export function createPolymathFile(filePath: string, disciplines: Discipline[]): PolymathFile {
  const scores: Record<string, number> = {}
  for (const d of disciplines) {
    scores[d.name] = d.score
  }
  const vals = Object.values(scores)
  const avgScore = vals.length > 0 ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10 : 0
  const isRenaissance = vals.every(v => v >= 60)

  let strongest = ''
  let weakest = ''
  let maxScore = -1
  let minScore = 101
  for (const [name, score] of Object.entries(scores)) {
    if (score > maxScore) { maxScore = score; strongest = name }
    if (score < minScore) { minScore = score; weakest = name }
  }

  const balance = computeBalance(scores)
  const classification = classifyPolymath(scores)

  return {
    file: filePath, scores, avgScore, isRenaissance,
    strongestDiscipline: strongest, weakestDiscipline: weakest,
    balance, classification,
  }
}

// ─── Dark Ages ────────────────────────────────────────────────────────────────

/**
 * Identify dark age areas in the codebase
 * @example
 * identifyDarkAges(files, disciplines) // DarkAge[]
 */
export function identifyDarkAges(files: PolymathFile[], _disciplines: Discipline[]): DarkAge[] {
  const darkAges: DarkAge[] = []

  const byDirectory = new Map<string, PolymathFile[]>()
  for (const f of files) {
    const dir = f.file.split('/').slice(0, -1).join('/') || 'root'
    if (!byDirectory.has(dir)) byDirectory.set(dir, [])
    byDirectory.get(dir)!.push(f)
  }

  for (const [dir, dirFiles] of byDirectory) {
    const avgScores: Record<string, number> = {}
    for (const dName of DISCIPLINE_NAMES) {
      const vals = dirFiles.map(f => f.scores[dName] || 0)
      avgScores[dName] = vals.reduce((s, v) => s + v, 0) / vals.length
    }

    const neglected = DISCIPLINE_NAMES.filter(d => avgScores[d] < 30)
    if (neglected.length > 0) {
      const minAvg = Math.min(...Object.values(avgScores))
      const severity: DarkAge['severity'] = neglected.length >= 4 ? 'dark' : neglected.length >= 3 ? 'major' : neglected.length >= 2 ? 'moderate' : 'minor'
      if (severity !== 'minor' || minAvg < 20) {
        darkAges.push({
          area: dir,
          neglectedDisciplines: Array.from(neglected),
          severity,
          description: `${dir} has low scores in ${neglected.join(', ')}`,
          recovery: `Focus on improving ${neglected.slice(0, 2).join(' and ')} in ${dir}`,
        })
      }
    }
  }

  return darkAges
}

// ─── Computed Stats ───────────────────────────────────────────────────────────

/**
 * Compute renaissance score from disciplines and files
 * @example
 * computeRenaissanceScore(disciplines, files) // 75
 */
export function computeRenaissanceScore(disciplines: Discipline[], files: PolymathFile[]): number {
  if (disciplines.length === 0) return 100
  const avgDisc = disciplines.reduce((s, d) => s + d.score, 0) / disciplines.length
  const avgFile = files.length > 0 ? files.reduce((s, f) => s + f.avgScore, 0) / files.length : 100
  const polymathRatio = files.length > 0 ? files.filter(f => f.isRenaissance).length / files.length : 1
  return Math.round(avgDisc * 0.4 + avgFile * 0.4 + polymathRatio * 100 * 0.2)
}

/**
 * Classify the era based on renaissance score
 * @example
 * classifyEra(90, 85) // 'golden-age'
 */
export function classifyEra(renaissanceScore: number, avgDisciplineScore: number): RenaissanceStats['era'] {
  const combined = (renaissanceScore + avgDisciplineScore) / 2
  if (combined >= 75) return 'golden-age'
  if (combined >= 60) return 'renaissance'
  if (combined >= 45) return 'enlightenment'
  if (combined >= 30) return 'medieval'
  return 'dark-ages'
}

/**
 * Find the highest-scoring discipline (patron)
 * @example
 * findPatronDiscipline(disciplines) // 'documentation'
 */
export function findPatronDiscipline(disciplines: Discipline[]): string {
  if (disciplines.length === 0) return 'none'
  return disciplines.reduce((best, d) => d.score > best.score ? d : best).name
}

/**
 * Find the lowest-scoring discipline (neglected)
 * @example
 * findNeglectedDiscipline(disciplines) // 'security'
 */
export function findNeglectedDiscipline(disciplines: Discipline[]): string {
  if (disciplines.length === 0) return 'none'
  return disciplines.reduce((worst, d) => d.score < worst.score ? d : worst).name
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate renaissance improvement recommendations
 * @example
 * generateRecommendations(disciplines, files, darkAges, stats)
 */
export function generateRecommendations(
  disciplines: Discipline[],
  files: PolymathFile[],
  darkAges: DarkAge[],
  stats: RenaissanceStats,
): string[] {
  const recs: string[] = []

  const neglected = disciplines.filter(d => d.grade === 'poor' || d.grade === 'neglected')
  if (neglected.length > 0) {
    recs.push(`Focus improvement on ${neglected.map(d => d.name).join(', ')} — currently underperforming`)
  }

  if (darkAges.length > 0) {
    recs.push(`Bring Renaissance to ${darkAges.length} dark age area(s): ${darkAges.map(d => d.area).join(', ')}`)
  }

  const unbalanced = files.filter(f => f.classification === 'unbalanced')
  if (unbalanced.length > 0) {
    recs.push(`Improve weakest discipline in ${unbalanced.length} unbalanced file(s)`)
  }

  const novice = files.filter(f => f.classification === 'novice')
  if (novice.length > 0) {
    recs.push(`Comprehensive improvement plan needed for ${novice.length} novice file(s)`)
  }

  if (stats.avgBalance < 50) {
    recs.push('Improve discipline balance — scores vary too widely across disciplines')
  }

  if (stats.era === 'dark-ages' || stats.era === 'medieval') {
    recs.push('Start with documentation and security — these foundational disciplines enable others')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete renaissance analysis result
 * @example
 * const result = buildRenaissanceResult(['src/a.ts'], ['export function a() {}'], {})
 */
export function buildRenaissanceResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): RenaissanceResult {
  const fileDisciplines = contents.map((c, i) => evaluateAllDisciplines(c, files[i]))

  const allDisciplineScores: Record<string, number[]> = {}
  for (const dList of fileDisciplines) {
    for (const d of dList) {
      if (!allDisciplineScores[d.name]) allDisciplineScores[d.name] = []
      allDisciplineScores[d.name].push(d.score)
    }
  }

  const disciplines: Discipline[] = DISCIPLINE_NAMES.map(name => {
    const scores = allDisciplineScores[name] || []
    const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0
    const sample = fileDisciplines[0]?.find(d => d.name === name)
    return {
      name, score: avg, grade: classifyDisciplineGrade(avg),
      indicators: sample?.indicators || [],
      strengths: sample?.strengths || [],
      weaknesses: sample?.weaknesses || [],
      trend: 'stable' as const,
    }
  })

  const polyFiles = files.map((f, i) => createPolymathFile(f, fileDisciplines[i]))

  const darkAges = identifyDarkAges(polyFiles, disciplines)

  const renaissanceScore = computeRenaissanceScore(disciplines, polyFiles)
  const avgDisciplineScore = disciplines.length > 0
    ? Math.round(disciplines.reduce((s, d) => s + d.score, 0) / disciplines.length * 10) / 10
    : 0
  const avgBalance = polyFiles.length > 0
    ? Math.round(polyFiles.reduce((s, f) => s + f.balance, 0) / polyFiles.length * 10) / 10
    : 100

  const mostBalanced = polyFiles.reduce<PolymathFile | null>((best, f) => {
    if (!best || f.balance > best.balance) return f
    return best
  }, null)
  const leastBalanced = polyFiles.reduce<PolymathFile | null>((worst, f) => {
    if (!worst || f.balance < worst.balance) return f
    return worst
  }, null)

  const stats: RenaissanceStats = {
    totalDisciplines: disciplines.length,
    avgDisciplineScore,
    masterworkDisciplines: disciplines.filter(d => d.grade === 'masterwork').length,
    neglectedDisciplines: disciplines.filter(d => d.grade === 'poor' || d.grade === 'neglected').length,
    polymathFiles: polyFiles.filter(f => f.classification === 'polymath').length,
    specialistFiles: polyFiles.filter(f => f.classification === 'specialist').length,
    noviceFiles: polyFiles.filter(f => f.classification === 'novice').length,
    darkAgeAreas: darkAges.length,
    majorDarkAges: darkAges.filter(d => d.severity === 'major' || d.severity === 'dark').length,
    avgBalance,
    renaissanceScore,
    era: classifyEra(renaissanceScore, avgDisciplineScore),
    mostBalancedFile: mostBalanced?.file || '',
    leastBalancedFile: leastBalanced?.file || '',
    patronDiscipline: findPatronDiscipline(disciplines),
    neglectedDiscipline: findNeglectedDiscipline(disciplines),
  }

  const recommendations = generateRecommendations(disciplines, polyFiles, darkAges, stats)

  return { disciplines, files: polyFiles, darkAges, stats, recommendations }
}
