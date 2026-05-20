// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface StillnessObject {
  file: string
  stillness: number
  volatility: number
  fragility: number
  composure: number
  weight: number
  balance: number
  position: 'foreground' | 'midground' | 'background' | 'shadow' | 'highlight'
  objectType: 'vessel' | 'fruit' | 'flower' | 'fabric' | 'utensil' | 'book' | 'candle' | 'skull'
  stability: 'anchored' | 'resting' | 'balanced' | 'precarious' | 'tipping' | 'falling' | 'shattered'
  lightExposure: number
  shadowDepth: number
  surfaceQuality: 'polished' | 'smooth' | 'textured' | 'rough' | 'cracked' | 'broken'
  composition: {
    isFocalPoint: boolean
    supportsOthers: boolean
    isSupported: boolean
    createsBalance: boolean
    isOrnamental: boolean
  }
  risks: string[]
  strengths: string[]
}

export interface StillLifeArrangement {
  directory: string
  objects: StillnessObject[]
  arrangementType: 'classical' | 'baroque' | 'modern' | 'minimalist' | 'cluttered' | 'chaotic' | 'empty'
  overallStillness: number
  overallBalance: number
  overallComposure: number
  focalPoint: string
  supportingFiles: string[]
  backgroundFiles: string[]
  isBalanced: boolean
  hasTension: boolean
  tensionPoints: string[]
  cohesion: number
  lightBalance: number
  health: 'masterwork' | 'well-composed' | 'pleasant' | 'mediocre' | 'disjointed' | 'chaotic'
}

export interface StillLifeStats {
  totalFiles: number
  totalArrangements: number
  avgStillness: number
  avgVolatility: number
  avgFragility: number
  avgComposure: number
  avgBalance: number
  anchoredFiles: number
  precariousFiles: number
  shatteredFiles: number
  focalPoints: number
  isOverallBalanced: boolean
  overallStillness: number
  overallComposure: number
  dominantPosition: string
  dominantObjectType: string
  lightBalance: number
  stillnessGrade: 'rock' | 'stone' | 'wood' | 'water' | 'wind' | 'sand'
  arrangementScore: number
  masterworkArrangements: number
  chaoticArrangements: number
  bestArrangement: string
  worstArrangement: string
}

export interface StillLifeResult {
  objects: StillnessObject[]
  arrangements: StillLifeArrangement[]
  stats: StillLifeStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"][^'"]+['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ERROR_HANDLE_RE = /(?:try\s*\{|catch\s*\(|\.catch\(|\.then\()/g
const CONDITIONAL_RE = /(?:if\s*\(|switch\s*\(|ternary|\?\.)/g
const NESTED_IF_RE = /if\s*\([^)]+\)\s*\{[^}]*if\s*\(/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const TEST_INDICATOR_RE = /(?:describe|it|test|expect)\s*\(/g
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const ASYNC_RE = /async\s+/g
const CALLBACK_RE = /(?:callback|cb|next)\s*[\(:]/g

// ─── Stillness Object Analysis ───────────────────────────────────────────────

/**
 * Evaluate a single file as a stillness object
 * @example
 * analyzeStillnessObject('export function add(a, b) { return a + b }', 'math.ts') // StillnessObject
 */
export function analyzeStillnessObject(content: string, filePath: string): StillnessObject {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)
  const totalLines = codeLines.length

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const errorHandling = (content.match(ERROR_HANDLE_RE) ?? []).length
  const conditionals = (content.match(CONDITIONAL_RE) ?? []).length
  const nestedIfs = (content.match(NESTED_IF_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const tests = (content.match(TEST_INDICATOR_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const asyncs = (content.match(ASYNC_RE) ?? []).length
  const callbacks = (content.match(CALLBACK_RE) ?? []).length

  const stillness = computeStillness(totalLines, todos, anys, consoles, errorHandling, jsdoc, exports)
  const volatility = computeVolatility(conditionals, asyncs, callbacks, nestedIfs, todos, totalLines)
  const fragility = computeFragility(errorHandling, anys, callbacks, nestedIfs, totalLines)
  const composure = computeComposure(exports, interfaces, types, functions, classes, jsdoc, totalLines)
  const weight = totalLines
  const balance = computeBalance(composure, stillness, fragility)

  const position = classifyPosition(filePath, exports, imports)
  const objectType = classifyObjectType(functions, classes, interfaces, types, totalLines, filePath)
  const stability = classifyStability(stillness, volatility, fragility)
  const lightExposure = computeLightExposure(jsdoc, comments, tests, totalLines)
  const shadowDepth = computeShadowDepth(nestedIfs, callbacks, asyncs, totalLines)
  const surfaceQuality = classifySurfaceQuality(composure, fragility, lightExposure)

  const risks = identifyRisks(todos, anys, consoles, nestedIfs, errorHandling, totalLines)
  const strengths = identifyStrengths(exports, interfaces, types, jsdoc, errorHandling, tests)

  return {
    file: filePath,
    stillness,
    volatility,
    fragility,
    composure,
    weight,
    balance,
    position,
    objectType,
    stability,
    lightExposure,
    shadowDepth,
    surfaceQuality,
    composition: {
      isFocalPoint: false,
      supportsOthers: exports > 3,
      isSupported: imports > 2,
      createsBalance: balance >= 60,
      isOrnamental: totalLines < 10,
    },
    risks,
    strengths,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeStillness(
  lines: number, todos: number, anys: number, consoles: number,
  errorHandling: number, jsdoc: number, exports: number,
): number {
  let score = 50
  score += Math.min(15, jsdoc * 3)
  score += Math.min(10, errorHandling * 2)
  score += Math.min(10, exports * 2)
  score -= todos * 8
  score -= anys * 5
  score -= consoles * 3
  if (lines > 0 && lines < 5) score -= 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeVolatility(
  conditionals: number, asyncs: number, callbacks: number,
  nestedIfs: number, todos: number, lines: number,
): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(30, conditionals * 3)
  score += Math.min(15, asyncs * 5)
  score += Math.min(15, callbacks * 5)
  score += Math.min(20, nestedIfs * 8)
  score += Math.min(10, todos * 3)
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeFragility(
  errorHandling: number, anys: number, callbacks: number,
  nestedIfs: number, lines: number,
): number {
  if (lines === 0) return 50
  let score = 30
  score -= Math.min(30, errorHandling * 5)
  score += Math.min(20, anys * 5)
  score += Math.min(15, callbacks * 5)
  score += Math.min(20, nestedIfs * 8)
  if (errorHandling === 0 && lines > 20) score += 15
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeComposure(
  exports: number, interfaces: number, types: number,
  functions: number, classes: number, jsdoc: number, lines: number,
): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(20, exports * 3)
  score += Math.min(15, (interfaces + types) * 5)
  score += Math.min(15, functions * 2)
  score += Math.min(10, classes * 3)
  score += Math.min(10, jsdoc * 3)
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeBalance(composure: number, stillness: number, fragility: number): number {
  return Math.round(composure * 0.3 + stillness * 0.4 + (100 - fragility) * 0.3)
}

// ─── Classification Functions ────────────────────────────────────────────────

function classifyPosition(filePath: string, exports: number, imports: number): StillnessObject['position'] {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase()
  if (normalized.includes('index.') && exports > 2) return 'foreground'
  if (exports > 3) return 'foreground'
  if (exports > 0 && imports > 0) return 'midground'
  if (imports > 0 && exports === 0) return 'background'
  if (normalized.includes('test') || normalized.includes('spec')) return 'highlight'
  return 'shadow'
}

function classifyObjectType(
  functions: number, classes: number, interfaces: number,
  types: number, lines: number, filePath: string,
): StillnessObject['objectType'] {
  if (classes > 0) return 'vessel'
  if (interfaces > 0 || types > 0) return 'book'
  if (functions > 3) return 'flower'
  if (functions > 0 && lines < 20) return 'fruit'
  if (filePath.includes('config') || filePath.includes('constant')) return 'candle'
  if (filePath.includes('test') || filePath.includes('spec')) return 'utensil'
  if (lines > 100) return 'fabric'
  return 'utensil'
}

function classifyStability(
  stillness: number, volatility: number, fragility: number,
): StillnessObject['stability'] {
  const score = stillness - volatility * 0.5 - fragility * 0.3
  if (score >= 60) return 'anchored'
  if (score >= 40) return 'resting'
  if (score >= 20) return 'balanced'
  if (score >= 0) return 'precarious'
  if (score >= -20) return 'tipping'
  if (score >= -40) return 'falling'
  return 'shattered'
}

function computeLightExposure(
  jsdoc: number, comments: number, tests: number, lines: number,
): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(30, jsdoc * 5)
  score += Math.min(25, (comments / lines) * 100)
  score += Math.min(25, tests * 8)
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeShadowDepth(
  nestedIfs: number, callbacks: number, asyncs: number, lines: number,
): number {
  if (lines === 0) return 0
  let score = 10
  score += Math.min(30, nestedIfs * 10)
  score += Math.min(25, callbacks * 8)
  score += Math.min(20, asyncs * 4)
  return Math.min(100, Math.max(0, Math.round(score)))
}

function classifySurfaceQuality(
  composure: number, fragility: number, lightExposure: number,
): StillnessObject['surfaceQuality'] {
  const score = (composure + lightExposure + (100 - fragility)) / 3
  if (score >= 80) return 'polished'
  if (score >= 60) return 'smooth'
  if (score >= 40) return 'textured'
  if (score >= 25) return 'rough'
  if (score >= 10) return 'cracked'
  return 'broken'
}

// ─── Risk & Strength Identification ─────────────────────────────────────────

function identifyRisks(
  todos: number, anys: number, consoles: number,
  nestedIfs: number, errorHandling: number, lines: number,
): string[] {
  const risks: string[] = []
  if (todos > 0) risks.push('unfinished-work')
  if (anys > 0) risks.push('type-unsafe')
  if (consoles > 0) risks.push('debug-residue')
  if (nestedIfs > 0) risks.push('nested-complexity')
  if (errorHandling === 0 && lines > 20) risks.push('no-error-handling')
  return risks
}

function identifyStrengths(
  exports: number, interfaces: number, types: number,
  jsdoc: number, errorHandling: number, tests: number,
): string[] {
  const strengths: string[] = []
  if (exports > 3) strengths.push('rich-api')
  if (interfaces + types > 0) strengths.push('well-typed')
  if (jsdoc > 0) strengths.push('documented')
  if (errorHandling > 0) strengths.push('error-aware')
  if (tests > 0) strengths.push('tested')
  return strengths
}

// ─── Arrangement Analysis ────────────────────────────────────────────────────

/**
 * Evaluate a directory as a still life arrangement
 * @example
 * analyzeArrangement(objects, 'src') // StillLifeArrangement
 */
export function analyzeArrangement(
  objects: StillnessObject[],
  dirPath: string,
): StillLifeArrangement {
  if (objects.length === 0) {
    return {
      directory: dirPath, objects: [], arrangementType: 'empty',
      overallStillness: 0, overallBalance: 0, overallComposure: 0,
      focalPoint: 'none', supportingFiles: [], backgroundFiles: [],
      isBalanced: false, hasTension: false, tensionPoints: [],
      cohesion: 0, lightBalance: 0, health: 'chaotic',
    }
  }

  const overallStillness = Math.round(objects.reduce((s, o) => s + o.stillness, 0) / objects.length)
  const overallBalance = Math.round(objects.reduce((s, o) => s + o.balance, 0) / objects.length)
  const overallComposure = Math.round(objects.reduce((s, o) => s + o.composure, 0) / objects.length)

  // Identify focal point: highest composure + weight
  let focalPoint = objects[0].file
  let focalScore = 0
  for (const obj of objects) {
    const score = obj.composure + Math.min(20, obj.weight / 5)
    if (score > focalScore) {
      focalScore = score
      focalPoint = obj.file
    }
  }

  // Mark focal point
  for (const obj of objects) {
    if (obj.file === focalPoint) {
      obj.composition.isFocalPoint = true
    }
  }

  const supportingFiles = objects.filter(o => o.composition.supportsOthers).map(o => o.file)
  const backgroundFiles = objects.filter(o => o.position === 'background' || o.position === 'shadow').map(o => o.file)

  const isBalanced = overallBalance >= 50
  const tensionPoints = objects.filter(o => o.stability === 'precarious' || o.stability === 'tipping' || o.stability === 'falling').map(o => o.file)
  const hasTension = tensionPoints.length > 0

  const cohesion = computeCohesion(objects)
  const lightBalance = computeLightBalance(objects)

  const arrangementType = classifyArrangementType(objects)
  const health = classifyArrangementHealth(overallStillness, overallBalance, cohesion, hasTension)

  return {
    directory: dirPath,
    objects,
    arrangementType,
    overallStillness,
    overallBalance,
    overallComposure,
    focalPoint,
    supportingFiles,
    backgroundFiles,
    isBalanced,
    hasTension,
    tensionPoints,
    cohesion,
    lightBalance,
    health,
  }
}

function computeCohesion(objects: StillnessObject[]): number {
  if (objects.length <= 1) return 100
  const supporting = objects.filter(o => o.composition.supportsOthers).length
  const supported = objects.filter(o => o.composition.isSupported).length
  const ratio = (supporting + supported) / (objects.length * 2)
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
}

function computeLightBalance(objects: StillnessObject[]): number {
  if (objects.length === 0) return 0
  const avg = objects.reduce((s, o) => s + o.lightExposure, 0) / objects.length
  const variance = objects.reduce((s, o) => s + Math.pow(o.lightExposure - avg, 2), 0) / objects.length
  const stdDev = Math.sqrt(variance)
  return Math.min(100, Math.max(0, Math.round(100 - stdDev)))
}

/**
 * Classify the arrangement type based on objects
 * @example
 * classifyArrangementType(objects) // 'classical'
 */
export function classifyArrangementType(objects: StillnessObject[]): StillLifeArrangement['arrangementType'] {
  if (objects.length === 0) return 'empty'
  if (objects.length > 20) return 'cluttered'
  if (objects.length === 1) return 'minimalist'

  const types = new Map<string, number>()
  for (const o of objects) {
    types.set(o.objectType, (types.get(o.objectType) ?? 0) + 1)
  }

  const avgStillness = objects.reduce((s, o) => s + o.stillness, 0) / objects.length
  const hasForeground = objects.some(o => o.position === 'foreground')
  const hasMidground = objects.some(o => o.position === 'midground')
  const hasBackground = objects.some(o => o.position === 'background')

  if (avgStillness >= 60 && hasForeground && hasMidground && hasBackground) return 'classical'
  if (avgStillness >= 50 && objects.length >= 5) return 'baroque'
  if (avgStillness >= 50) return 'modern'

  if (avgStillness < 30) return 'chaotic'
  return 'modern'
}

function classifyArrangementHealth(
  stillness: number, balance: number, cohesion: number, hasTension: boolean,
): StillLifeArrangement['health'] {
  if (stillness >= 70 && balance >= 70 && cohesion >= 60 && !hasTension) return 'masterwork'
  if (stillness >= 55 && balance >= 55) return 'well-composed'
  if (stillness >= 40 && balance >= 40) return 'pleasant'
  if (stillness >= 25) return 'mediocre'
  if (hasTension) return 'disjointed'
  return 'chaotic'
}

// ─── Grades & Scores ─────────────────────────────────────────────────────────

/**
 * Compute stillness grade from average stillness
 * @example
 * computeStillnessGrade(85) // 'rock'
 */
export function computeStillnessGrade(avgStillness: number): StillLifeStats['stillnessGrade'] {
  if (avgStillness >= 80) return 'rock'
  if (avgStillness >= 60) return 'stone'
  if (avgStillness >= 40) return 'wood'
  if (avgStillness >= 25) return 'water'
  if (avgStillness >= 10) return 'wind'
  return 'sand'
}

/**
 * Compute arrangement score 0-100
 * @example
 * computeArrangementScore(arrangements) // 75
 */
export function computeArrangementScore(arrangements: StillLifeArrangement[]): number {
  if (arrangements.length === 0) return 0
  const total = arrangements.reduce((s, a) => {
    return s + a.overallStillness * 0.3 + a.overallBalance * 0.3 + a.cohesion * 0.2 + a.lightBalance * 0.2
  }, 0)
  return Math.round(total / arrangements.length)
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving stillness
 * @example
 * generateRecommendations(objects, arrangements, stats) // string[]
 */
export function generateRecommendations(
  objects: StillnessObject[],
  arrangements: StillLifeArrangement[],
  stats: StillLifeStats,
): string[] {
  const recs: string[] = []

  if (stats.shatteredFiles > 0) recs.push(`Rebuild ${stats.shatteredFiles} shattered file(s) from scratch`)
  if (stats.precariousFiles > stats.anchoredFiles) recs.push('More precarious than stable files - prioritize stabilization')
  if (stats.avgVolatility > 60) recs.push('High volatility detected - reduce branching and dynamic patterns')
  if (stats.avgFragility > 50) recs.push('Fragile codebase - add error handling and type safety')

  const tensionArrangements = arrangements.filter(a => a.hasTension)
  if (tensionArrangements.length > 0) {
    recs.push(`Resolve tension in ${tensionArrangements.length} arrangement(s): ${tensionArrangements.map(a => a.directory).join(', ')}`)
  }

  if (stats.lightBalance < 40) recs.push('Uneven documentation/testing - bring dark areas into the light')
  if (stats.chaoticArrangements > stats.masterworkArrangements) recs.push('More chaotic than well-composed areas - focus on restructuring')
  if (stats.avgStillness < 30) recs.push('Very low stillness - code is unstable and needs settling time')

  if (recs.length === 0) recs.push('Still life is well-composed and balanced - maintain current practices')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete still-life analysis result
 * @example
 * buildStillLifeResult(files, contents, {}) // StillLifeResult
 */
export function buildStillLifeResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): StillLifeResult {
  const objects: StillnessObject[] = []
  for (let i = 0; i < files.length; i++) {
    objects.push(analyzeStillnessObject(contents[i], files[i]))
  }

  const dirMap = new Map<string, StillnessObject[]>()
  for (const obj of objects) {
    const normalized = obj.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(obj)
    else dirMap.set(dir, [obj])
  }

  const arrangements: StillLifeArrangement[] = []
  for (const [dir, dirObjects] of dirMap) {
    arrangements.push(analyzeArrangement(dirObjects, dir))
  }

  const stats = computeStats(objects, arrangements)
  const recommendations = generateRecommendations(objects, arrangements, stats)

  return { objects, arrangements, stats, recommendations }
}

function computeStats(objects: StillnessObject[], arrangements: StillLifeArrangement[]): StillLifeStats {
  const totalFiles = objects.length
  const totalArrangements = arrangements.length

  const avgStillness = totalFiles > 0 ? Math.round(objects.reduce((s, o) => s + o.stillness, 0) / totalFiles) : 0
  const avgVolatility = totalFiles > 0 ? Math.round(objects.reduce((s, o) => s + o.volatility, 0) / totalFiles) : 0
  const avgFragility = totalFiles > 0 ? Math.round(objects.reduce((s, o) => s + o.fragility, 0) / totalFiles) : 0
  const avgComposure = totalFiles > 0 ? Math.round(objects.reduce((s, o) => s + o.composure, 0) / totalFiles) : 0
  const avgBalance = totalFiles > 0 ? Math.round(objects.reduce((s, o) => s + o.balance, 0) / totalFiles) : 0

  const anchoredFiles = objects.filter(o => o.stability === 'anchored' || o.stability === 'resting').length
  const precariousFiles = objects.filter(o => o.stability === 'precarious' || o.stability === 'tipping').length
  const shatteredFiles = objects.filter(o => o.stability === 'shattered' || o.stability === 'falling').length
  const focalPoints = objects.filter(o => o.composition.isFocalPoint).length

  const isOverallBalanced = avgBalance >= 50
  const overallStillness = avgStillness
  const overallComposure = avgComposure

  const positionCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  for (const o of objects) {
    positionCounts.set(o.position, (positionCounts.get(o.position) ?? 0) + 1)
    typeCounts.set(o.objectType, (typeCounts.get(o.objectType) ?? 0) + 1)
  }

  let dominantPosition = 'midground'
  let maxPos = 0
  for (const [pos, count] of positionCounts) {
    if (count > maxPos) { maxPos = count; dominantPosition = pos }
  }

  let dominantObjectType = 'utensil'
  let maxType = 0
  for (const [type, count] of typeCounts) {
    if (count > maxType) { maxType = count; dominantObjectType = type }
  }

  const lightBalance = totalFiles > 0
    ? Math.round(arrangements.reduce((s, a) => s + a.lightBalance, 0) / Math.max(1, arrangements.length))
    : 0

  const stillnessGrade = computeStillnessGrade(avgStillness)
  const arrangementScore = computeArrangementScore(arrangements)

  const masterworkArrangements = arrangements.filter(a => a.health === 'masterwork').length
  const chaoticArrangements = arrangements.filter(a => a.health === 'chaotic' || a.health === 'disjointed').length

  const sortedByHealth = [...arrangements].sort((a, b) =>
    (b.overallStillness + b.overallBalance) - (a.overallStillness + a.overallBalance),
  )
  const bestArrangement = sortedByHealth.length > 0 ? sortedByHealth[0].directory : 'none'
  const worstArrangement = sortedByHealth.length > 0 ? sortedByHealth[sortedByHealth.length - 1].directory : 'none'

  return {
    totalFiles,
    totalArrangements,
    avgStillness,
    avgVolatility,
    avgFragility,
    avgComposure,
    avgBalance,
    anchoredFiles,
    precariousFiles,
    shatteredFiles,
    focalPoints,
    isOverallBalanced,
    overallStillness,
    overallComposure,
    dominantPosition,
    dominantObjectType,
    lightBalance,
    stillnessGrade,
    arrangementScore,
    masterworkArrangements,
    chaoticArrangements,
    bestArrangement,
    worstArrangement,
  }
}
