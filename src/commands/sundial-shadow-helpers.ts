// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ShadowCaster {
  size: number
  height: number
  opacity: number
}

export interface ShadowTraces {
  legacyPatterns: number
  modernPatterns: number
  experimentalPatterns: number
  deprecatedPatterns: number
  refactoringTraces: number
}

export interface ShadowGrowth {
  direction: 'expanding' | 'stable' | 'contracting' | 'static'
  rate: number
  isHealthy: boolean
}

export interface ShadowDecay {
  present: boolean
  level: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe'
  indicators: string[]
}

export interface ShadowTrace {
  file: string
  shadowLength: number
  shadowClarity: number
  shadowAngle: number
  temporalDepth: number
  maturity: number
  sunPosition: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'dusk' | 'night'
  lifecycle: 'embryonic' | 'infant' | 'growing' | 'mature' | 'aging' | 'legacy' | 'ancient' | 'fossil'
  shadowCaster: ShadowCaster
  traces: ShadowTraces
  growth: ShadowGrowth
  decay: ShadowDecay
  chronotype: 'early-adopter' | 'mainstream' | 'late-adopter' | 'laggard' | 'relic'
  epoch: 'pioneer' | 'foundation' | 'expansion' | 'consolidation' | 'optimization' | 'maintenance' | 'legacy'
  shadowNeighbors: string[]
  isDawn: boolean
  isNoon: boolean
  isDusk: boolean
  isNight: boolean
  classification: 'sunlit' | 'daylight' | 'shadowed' | 'twilight' | 'midnight'
}

export interface ShadowCluster {
  directory: string
  traces: ShadowTrace[]
  avgShadowLength: number
  avgMaturity: number
  dominantLifecycle: string
  dominantEpoch: string
  dominantSunPosition: string
  dawnFiles: number
  noonFiles: number
  duskFiles: number
  nightFiles: number
  totalLegacyPatterns: number
  totalModernPatterns: number
  totalDeprecatedPatterns: number
  growthDirection: string
  hasDecay: boolean
  avgTemporalDepth: number
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'
  historicalRichness: number
  evolutionaryHealth: number
  condition: 'thriving' | 'vibrant' | 'maturing' | 'aging' | 'declining' | 'decaying'
}

export interface SundialTimeline {
  totalDawn: number
  totalMorning: number
  totalNoon: number
  totalAfternoon: number
  totalEvening: number
  totalNight: number
  dominantPhase: string
  avgMaturity: number
  avgTemporalDepth: number
  growthRate: number
  decayRate: number
}

export interface SundialShadowStats {
  totalFiles: number
  totalClusters: number
  avgShadowLength: number
  avgShadowClarity: number
  avgTemporalDepth: number
  avgMaturity: number
  sunlitFiles: number
  daylightFiles: number
  shadowedFiles: number
  twilightFiles: number
  midnightFiles: number
  dawnFiles: number
  noonFiles: number
  duskFiles: number
  nightFiles: number
  totalLegacyPatterns: number
  totalModernPatterns: number
  totalExperimentalPatterns: number
  totalDeprecatedPatterns: number
  totalRefactoringTraces: number
  expandingFiles: number
  stableFiles: number
  contractingFiles: number
  healthyGrowth: number
  hasDecay: boolean
  overallEvolutionaryHealth: number
  epochGrade: 'golden-age' | 'renaissance' | 'industrial' | 'modern' | 'post-modern' | 'dark-age'
  bestPreserved: string
  mostEvolved: string
  freshestCode: string
  mostLegacy: string
}

export interface SundialShadowResult {
  traces: ShadowTrace[]
  clusters: ShadowCluster[]
  timeline: SundialTimeline
  stats: SundialShadowStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"]([^'"]+)['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const VAR_RE = /\bvar\s+\w+/g
const ARROW_RE = /=>\s*[{(]/g
const ASYNC_RE = /async\s+function/g
const GENERIC_RE = /<\w+(\s+extends\s+\w+)?>/g
const DEPRECATED_RE = /@deprecated/g
const ENUM_RE = /(?:export\s+)?enum\s+\w+/g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify sun position from maturity score
 * @example
 * classifySunPosition(10) // 'dawn'
 */
export function classifySunPosition(maturity: number): ShadowTrace['sunPosition'] {
  if (maturity >= 85) return 'dusk'
  if (maturity >= 70) return 'afternoon'
  if (maturity >= 55) return 'noon'
  if (maturity >= 40) return 'morning'
  if (maturity >= 20) return 'dawn'
  if (maturity >= 10) return 'evening'
  return 'night'
}

/**
 * Classify lifecycle from content characteristics
 * @example
 * classifyLifecycle('export function a() {}') // 'infant'
 */
export function classifyLifecycle(content: string): ShadowTrace['lifecycle'] {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const deprecated = (content.match(DEPRECATED_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length

  if (lines === 0) return 'fossil'
  if (deprecated >= 2 && vars >= 2) return 'ancient'
  if (anys >= 3 && vars >= 1) return 'legacy'
  if (anys >= 2 || vars >= 2) return 'aging'
  if (classes >= 2 && interfaces >= 2 && jsdoc >= 3) return 'mature'
  if (exports >= 2 && jsdoc >= 1) return 'growing'
  if (exports >= 1 || lines >= 5) return 'infant'
  return 'embryonic'
}

/**
 * Classify epoch from code patterns
 * @example
 * classifyEpoch('export function a() {}') // 'expansion'
 */
export function classifyEpoch(content: string): ShadowTrace['epoch'] {
  const modern = countModernPatterns(content)
  const legacy = countLegacyPatterns(content)
  const experimental = countExperimentalPatterns(content)
  const deprecated = (content.match(DEPRECATED_RE) ?? []).length
  const lines = content.split('\n').filter(l => l.trim().length > 0).length

  if (lines === 0) return 'legacy'
  if (deprecated >= 2) return 'legacy'
  if (legacy >= 3 && modern <= 1) return 'pioneer'
  if (experimental >= 3) return 'optimization'
  if (modern >= 4) return 'consolidation'
  if (modern >= 2 && legacy >= 1) return 'expansion'
  if (modern >= 1) return 'foundation'
  return 'maintenance'
}

/**
 * Classify chronotype from pattern adoption
 * @example
 * classifyChronotype(5, 1, 3) // 'early-adopter'
 */
export function classifyChronotype(modern: number, legacy: number, experimental: number): ShadowTrace['chronotype'] {
  if (experimental >= 3 && modern >= 2) return 'early-adopter'
  if (modern >= 3 && legacy <= 1) return 'mainstream'
  if (legacy >= 3 && modern <= 1) return 'laggard'
  if (legacy >= 2 && experimental === 0 && modern === 0) return 'relic'
  return 'late-adopter'
}

/**
 * Classify epoch grade from overall evolutionary health
 * @example
 * classifyEpochGrade(85) // 'golden-age'
 */
export function classifyEpochGrade(avgHealth: number): SundialShadowStats['epochGrade'] {
  if (avgHealth >= 80) return 'golden-age'
  if (avgHealth >= 65) return 'renaissance'
  if (avgHealth >= 50) return 'modern'
  if (avgHealth >= 35) return 'industrial'
  if (avgHealth >= 20) return 'post-modern'
  return 'dark-age'
}

// ─── Pattern Counting ────────────────────────────────────────────────────────

/**
 * Count legacy patterns in code
 * @example
 * countLegacyPatterns('var x = 1') // 1
 */
export function countLegacyPatterns(content: string): number {
  let count = 0
  count += (content.match(VAR_RE) ?? []).length
  count += (content.match(ANY_RE) ?? []).length
  count += (content.match(DEPRECATED_RE) ?? []).length
  return Math.min(10, count)
}

/**
 * Count modern patterns in code
 * @example
 * countModernPatterns('const x = () => {}') // 2
 */
export function countModernPatterns(content: string): number {
  let count = 0
  count += (content.match(ARROW_RE) ?? []).length
  count += (content.match(ASYNC_RE) ?? []).length
  count += (content.match(INTERFACE_RE) ?? []).length
  count += (content.match(TYPE_RE) ?? []).length
  count += (content.match(GENERIC_RE) ?? []).length
  return Math.min(10, count)
}

/**
 * Count experimental patterns in code
 * @example
 * countExperimentalPatterns('async function* gen() {}') // 1
 */
export function countExperimentalPatterns(content: string): number {
  let count = 0
  count += (content.match(/async\s+function\s*\*/g) ?? []).length
  count += (content.match(/\byield\b/g) ?? []).length
  count += (content.match(/\bProxy\b/g) ?? []).length
  count += (content.match(/\bWeakRef\b/g) ?? []).length
  count += (content.match(/\bSymbol\./g) ?? []).length
  return Math.min(10, count)
}

/**
 * Count deprecated patterns in code
 * @example
 * countDeprecatedPatterns('@deprecated function a() {}') // 1
 */
export function countDeprecatedPatterns(content: string): number {
  let count = 0
  count += (content.match(DEPRECATED_RE) ?? []).length
  count += (content.match(/\/\/\s*DEPRECATED/gi) ?? []).length
  count += (content.match(/arguments\[/g) ?? []).length
  return Math.min(10, count)
}

/**
 * Count all pattern types
 * @example
 * countPatterns('var x: any = 1') // ShadowTraces
 */
export function countPatterns(content: string): ShadowTraces {
  return {
    legacyPatterns: countLegacyPatterns(content),
    modernPatterns: countModernPatterns(content),
    experimentalPatterns: countExperimentalPatterns(content),
    deprecatedPatterns: countDeprecatedPatterns(content),
    refactoringTraces: countRefactoringTraces(content),
  }
}

function countRefactoringTraces(content: string): number {
  let count = 0
  count += (content.match(/\/\/\s*refactor/gi) ?? []).length
  count += (content.match(/\/\/\s*moved\s+from/gi) ?? []).length
  count += (content.match(/\/\/\s*extracted/gi) ?? []).length
  count += (content.match(/\/\/\s*renamed/gi) ?? []).length
  return Math.min(10, count)
}

// ─── Decay Detection ─────────────────────────────────────────────────────────

/**
 * Detect decay indicators in code
 * @example
 * detectDecay('var x: any = 1') // ShadowDecay
 */
export function detectDecay(content: string): ShadowDecay {
  const indicators: string[] = []
  const anys = (content.match(ANY_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const deprecated = (content.match(DEPRECATED_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length

  if (anys >= 2) indicators.push('any types')
  if (vars >= 1) indicators.push('var usage')
  if (todos >= 3) indicators.push('many TODOs')
  if (deprecated >= 1) indicators.push('deprecated markers')
  if (consoles >= 3) indicators.push('console clutter')

  const score = anys + vars * 2 + todos + deprecated * 2 + consoles

  if (score === 0) return { present: false, level: 'none', indicators }
  if (score <= 2) return { present: true, level: 'minimal', indicators }
  if (score <= 5) return { present: true, level: 'moderate', indicators }
  if (score <= 8) return { present: true, level: 'significant', indicators }
  return { present: true, level: 'severe', indicators }
}

// ─── Growth Assessment ───────────────────────────────────────────────────────

/**
 * Assess growth direction from code characteristics
 * @example
 * assessGrowth('export function a() {}') // ShadowGrowth
 */
export function assessGrowth(content: string): ShadowGrowth {
  const lines = content.split('\n').filter(l => l.trim().length > 0).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const modern = countModernPatterns(content)
  const legacy = countLegacyPatterns(content)

  const rate = Math.min(100, Math.max(0, Math.round(exports * 10 + modern * 5 - legacy * 3 - todos * 2 + 10)))
  const isHealthy = rate >= 20 && legacy <= 2

  if (lines === 0) return { direction: 'static', rate: 0, isHealthy: false }
  if (exports >= 3 && modern >= 2) return { direction: 'expanding', rate, isHealthy }
  if (todos >= 3 || legacy >= 3) return { direction: 'contracting', rate, isHealthy }
  if (exports >= 1) return { direction: 'stable', rate, isHealthy }
  return { direction: 'stable', rate, isHealthy }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a shadow trace
 * @example
 * analyzeShadowTrace('export function a() {}', 'a.ts') // ShadowTrace
 */
export function analyzeShadowTrace(content: string, filePath: string): ShadowTrace {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const vars = (content.match(VAR_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const enums = (content.match(ENUM_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length

  const shadowLength = computeShadowLength(vars, anys, codeLines.length)
  const shadowClarity = computeShadowClarity(jsdoc, exports, interfaces + types, anys, codeLines.length)
  const shadowAngle = computeShadowAngle(classes, functions, imports, codeLines.length)
  const temporalDepth = computeTemporalDepth(functions, classes, interfaces, types, generics, enums)
  const maturity = computeMaturity(jsdoc, exports, interfaces + types, anys, vars, codeLines.length)

  const sunPosition = classifySunPosition(maturity)
  const lifecycle = classifyLifecycle(content)
  const epoch = classifyEpoch(content)

  const shadowCaster: ShadowCaster = {
    size: Math.min(100, codeLines.length),
    height: Math.min(100, (classes + functions) * 8),
    opacity: Math.min(100, Math.max(0, 30 + anys * 15 - jsdoc * 5)),
  }

  const traces = countPatterns(content)
  const growth = assessGrowth(content)
  const decay = detectDecay(content)

  const chronotype = classifyChronotype(traces.modernPatterns, traces.legacyPatterns, traces.experimentalPatterns)

  const shadowNeighbors: string[] = []
  const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : ''
  if (imports > 0 && dir) shadowNeighbors.push(`${dir}/index`)

  const isDawn = sunPosition === 'dawn'
  const isNoon = sunPosition === 'noon'
  const isDusk = sunPosition === 'dusk'
  const isNight = sunPosition === 'night'

  const classification = classifyShadow(maturity, decay.level)

  return {
    file: filePath,
    shadowLength,
    shadowClarity,
    shadowAngle,
    temporalDepth,
    maturity,
    sunPosition,
    lifecycle,
    shadowCaster,
    traces,
    growth,
    decay,
    chronotype,
    epoch,
    shadowNeighbors,
    isDawn,
    isNoon,
    isDusk,
    isNight,
    classification,
  }
}

function classifyShadow(maturity: number, decayLevel: string): ShadowTrace['classification'] {
  if (decayLevel === 'severe' || maturity < 10) return 'midnight'
  if (decayLevel === 'significant' || maturity < 25) return 'twilight'
  if (maturity >= 60) return 'sunlit'
  if (maturity >= 40) return 'daylight'
  return 'shadowed'
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeShadowLength(vars: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  const score = vars * 8 + anys * 6
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeShadowClarity(jsdoc: number, exports: number, structural: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(25, jsdoc * 4)
  score += Math.min(20, exports * 3)
  score += Math.min(15, structural * 4)
  score -= anys * 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeShadowAngle(classes: number, functions: number, imports: number, lines: number): number {
  if (lines === 0) return 0
  const structural = classes * 30
  const functional = functions * 15
  const integration = imports * 10
  return Math.min(360, structural + functional + integration)
}

function computeTemporalDepth(functions: number, classes: number, interfaces: number, types: number, generics: number, enums: number): number {
  const depth = functions + classes * 2 + interfaces + types + generics * 2 + enums
  return Math.min(100, Math.max(0, depth * 5))
}

function computeMaturity(jsdoc: number, exports: number, structural: number, anys: number, vars: number, lines: number): number {
  if (lines === 0) return 0
  let score = 15
  score += Math.min(20, jsdoc * 3)
  score += Math.min(15, exports * 3)
  score += Math.min(15, structural * 4)
  score -= anys * 6
  score -= vars * 5
  return Math.min(100, Math.max(0, Math.round(score)))
}

// ─── Cluster Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a shadow cluster
 * @example
 * analyzeShadowCluster(traces, 'src') // ShadowCluster
 */
export function analyzeShadowCluster(traces: ShadowTrace[], dirPath: string): ShadowCluster {
  if (traces.length === 0) {
    return {
      directory: dirPath,
      traces: [],
      avgShadowLength: 0,
      avgMaturity: 0,
      dominantLifecycle: 'fossil',
      dominantEpoch: 'legacy',
      dominantSunPosition: 'night',
      dawnFiles: 0,
      noonFiles: 0,
      duskFiles: 0,
      nightFiles: 0,
      totalLegacyPatterns: 0,
      totalModernPatterns: 0,
      totalDeprecatedPatterns: 0,
      growthDirection: 'static',
      hasDecay: false,
      avgTemporalDepth: 0,
      timeOfDay: 'night',
      historicalRichness: 0,
      evolutionaryHealth: 0,
      condition: 'decaying',
    }
  }

  const n = traces.length
  const avgShadowLength = Math.round(traces.reduce((s, t) => s + t.shadowLength, 0) / n)
  const avgMaturity = Math.round(traces.reduce((s, t) => s + t.maturity, 0) / n)
  const avgTemporalDepth = Math.round(traces.reduce((s, t) => s + t.temporalDepth, 0) / n)

  const dominantLifecycle = findDominant(traces.map(t => t.lifecycle))
  const dominantEpoch = findDominant(traces.map(t => t.epoch))
  const dominantSunPosition = findDominant(traces.map(t => t.sunPosition))

  const dawnFiles = traces.filter(t => t.isDawn).length
  const noonFiles = traces.filter(t => t.isNoon).length
  const duskFiles = traces.filter(t => t.isDusk).length
  const nightFiles = traces.filter(t => t.isNight).length

  const totalLegacyPatterns = traces.reduce((s, t) => s + t.traces.legacyPatterns, 0)
  const totalModernPatterns = traces.reduce((s, t) => s + t.traces.modernPatterns, 0)
  const totalDeprecatedPatterns = traces.reduce((s, t) => s + t.traces.deprecatedPatterns, 0)

  const growthDirections = traces.map(t => t.growth.direction)
  const expanding = growthDirections.filter(d => d === 'expanding').length
  const contracting = growthDirections.filter(d => d === 'contracting').length
  const growthDirection = expanding > contracting ? 'expanding' : contracting > expanding ? 'contracting' : 'stable'

  const hasDecay = traces.some(t => t.decay.present)
  const timeOfDay = classifyClusterTimeOfDay(avgMaturity, dawnFiles, noonFiles, nightFiles)

  const historicalRichness = Math.min(100, Math.max(0, Math.round(
    avgTemporalDepth * 0.3 + Math.min(30, totalModernPatterns * 5) + Math.min(20, totalLegacyPatterns * 2) + 20
  )))

  const evolutionaryHealth = Math.min(100, Math.max(0, Math.round(
    avgMaturity * 0.4 + (hasDecay ? 0 : 20) + Math.min(20, totalModernPatterns * 3) + Math.min(20, avgShadowClarity(traces))
  )))

  const condition = classifyClusterCondition(evolutionaryHealth, hasDecay)

  return {
    directory: dirPath,
    traces,
    avgShadowLength,
    avgMaturity,
    dominantLifecycle,
    dominantEpoch,
    dominantSunPosition,
    dawnFiles,
    noonFiles,
    duskFiles,
    nightFiles,
    totalLegacyPatterns,
    totalModernPatterns,
    totalDeprecatedPatterns,
    growthDirection,
    hasDecay,
    avgTemporalDepth,
    timeOfDay,
    historicalRichness,
    evolutionaryHealth,
    condition,
  }
}

function avgShadowClarity(traces: ShadowTrace[]): number {
  if (traces.length === 0) return 0
  return traces.reduce((s, t) => s + t.shadowClarity, 0) / traces.length
}

function classifyClusterTimeOfDay(avgMaturity: number, dawnFiles: number, noonFiles: number, nightFiles: number): ShadowCluster['timeOfDay'] {
  if (dawnFiles > noonFiles && dawnFiles > nightFiles) return 'dawn'
  if (avgMaturity >= 60) return 'noon'
  if (avgMaturity >= 40) return 'afternoon'
  if (nightFiles > dawnFiles) return 'night'
  if (avgMaturity >= 20) return 'morning'
  return 'evening'
}

function classifyClusterCondition(health: number, hasDecay: boolean): ShadowCluster['condition'] {
  if (health >= 75 && !hasDecay) return 'thriving'
  if (health >= 60) return 'vibrant'
  if (health >= 45) return 'maturing'
  if (health >= 30) return 'aging'
  if (hasDecay) return 'decaying'
  return 'declining'
}

function findDominant(items: string[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let dominant = items[0] ?? 'none'
  let max = 0
  for (const [item, count] of counts) {
    if (count > max) { max = count; dominant = item }
  }
  return dominant
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for code evolution
 * @example
 * generateRecommendations(traces, clusters, stats) // string[]
 */
export function generateRecommendations(
  traces: ShadowTrace[],
  clusters: ShadowCluster[],
  stats: SundialShadowStats,
): string[] {
  const recs: string[] = []

  const nightFiles = traces.filter(t => t.isNight)
  if (nightFiles.length > 0) recs.push(`${nightFiles.length} night file(s) - consider removal or revival`)

  const heavyLegacy = traces.filter(t => t.traces.legacyPatterns >= 3)
  if (heavyLegacy.length > 0) recs.push(`${heavyLegacy.length} file(s) with heavy legacy - modernize patterns`)

  const decaying = traces.filter(t => t.decay.present && t.decay.level !== 'minimal')
  if (decaying.length > 0) recs.push(`${decaying.length} file(s) with decay - refactor to restore health`)

  const lowMaturity = traces.filter(t => t.maturity < 20 && !t.isDawn)
  if (lowMaturity.length > 0) recs.push(`${lowMaturity.length} file(s) with low maturity - stabilize fundamentals`)

  const deprecated = traces.filter(t => t.traces.deprecatedPatterns >= 1)
  if (deprecated.length > 0) recs.push(`${deprecated.length} file(s) using deprecated patterns - update APIs`)

  const cacophonous = clusters.filter(c => c.condition === 'decaying' || c.condition === 'declining')
  if (cacophonous.length > 0) recs.push(`${cacophonous.length} declining cluster(s) - invest in modernization`)

  if (stats.overallEvolutionaryHealth >= 70) {
    recs.push('Codebase shows healthy evolution - maintain current practices')
  }

  if (recs.length === 0) recs.push('Sundial casts clear shadows - code evolution is well-managed')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete sundial shadow analysis result
 * @example
 * buildSundialShadowResult(files, contents, {}) // SundialShadowResult
 */
export function buildSundialShadowResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): SundialShadowResult {
  const traces: ShadowTrace[] = []
  for (let i = 0; i < files.length; i++) {
    traces.push(analyzeShadowTrace(contents[i], files[i]))
  }

  const dirMap = new Map<string, ShadowTrace[]>()
  for (const trace of traces) {
    const normalized = trace.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(trace)
    else dirMap.set(dir, [trace])
  }

  const clusters: ShadowCluster[] = []
  for (const [dir, dirTraces] of dirMap) {
    clusters.push(analyzeShadowCluster(dirTraces, dir))
  }

  const timeline = computeTimeline(traces)
  const stats = computeStats(traces, clusters)
  const recommendations = generateRecommendations(traces, clusters, stats)

  return { traces, clusters, timeline, stats, recommendations }
}

function computeTimeline(traces: ShadowTrace[]): SundialTimeline {
  const totalDawn = traces.filter(t => t.sunPosition === 'dawn').length
  const totalMorning = traces.filter(t => t.sunPosition === 'morning').length
  const totalNoon = traces.filter(t => t.sunPosition === 'noon').length
  const totalAfternoon = traces.filter(t => t.sunPosition === 'afternoon').length
  const totalEvening = traces.filter(t => t.sunPosition === 'evening').length
  const totalNight = traces.filter(t => t.sunPosition === 'night').length

  const phases: [string, number][] = [
    ['dawn', totalDawn], ['morning', totalMorning], ['noon', totalNoon],
    ['afternoon', totalAfternoon], ['evening', totalEvening], ['night', totalNight],
  ]
  let dominantPhase = 'dawn'
  let maxP = 0
  for (const [phase, count] of phases) { if (count > maxP) { maxP = count; dominantPhase = phase } }

  const avgMaturity = traces.length > 0 ? Math.round(traces.reduce((s, t) => s + t.maturity, 0) / traces.length) : 0
  const avgTemporalDepth = traces.length > 0 ? Math.round(traces.reduce((s, t) => s + t.temporalDepth, 0) / traces.length) : 0
  const growthRate = traces.length > 0 ? Math.round(traces.reduce((s, t) => s + t.growth.rate, 0) / traces.length) : 0
  const decayRate = traces.filter(t => t.decay.present).length

  return {
    totalDawn, totalMorning, totalNoon, totalAfternoon, totalEvening, totalNight,
    dominantPhase, avgMaturity, avgTemporalDepth, growthRate, decayRate,
  }
}

function computeStats(traces: ShadowTrace[], clusters: ShadowCluster[]): SundialShadowStats {
  const totalFiles = traces.length
  const totalClusters = clusters.length

  const avgShadowLength = totalFiles > 0 ? Math.round(traces.reduce((s, t) => s + t.shadowLength, 0) / totalFiles) : 0
  const avgShadowClarity = totalFiles > 0 ? Math.round(traces.reduce((s, t) => s + t.shadowClarity, 0) / totalFiles) : 0
  const avgTemporalDepth = totalFiles > 0 ? Math.round(traces.reduce((s, t) => s + t.temporalDepth, 0) / totalFiles) : 0
  const avgMaturity = totalFiles > 0 ? Math.round(traces.reduce((s, t) => s + t.maturity, 0) / totalFiles) : 0

  const sunlitFiles = traces.filter(t => t.classification === 'sunlit').length
  const daylightFiles = traces.filter(t => t.classification === 'daylight').length
  const shadowedFiles = traces.filter(t => t.classification === 'shadowed').length
  const twilightFiles = traces.filter(t => t.classification === 'twilight').length
  const midnightFiles = traces.filter(t => t.classification === 'midnight').length

  const dawnFiles = traces.filter(t => t.isDawn).length
  const noonFiles = traces.filter(t => t.isNoon).length
  const duskFiles = traces.filter(t => t.isDusk).length
  const nightFiles = traces.filter(t => t.isNight).length

  const totalLegacyPatterns = traces.reduce((s, t) => s + t.traces.legacyPatterns, 0)
  const totalModernPatterns = traces.reduce((s, t) => s + t.traces.modernPatterns, 0)
  const totalExperimentalPatterns = traces.reduce((s, t) => s + t.traces.experimentalPatterns, 0)
  const totalDeprecatedPatterns = traces.reduce((s, t) => s + t.traces.deprecatedPatterns, 0)
  const totalRefactoringTraces = traces.reduce((s, t) => s + t.traces.refactoringTraces, 0)

  const expandingFiles = traces.filter(t => t.growth.direction === 'expanding').length
  const stableFiles = traces.filter(t => t.growth.direction === 'stable').length
  const contractingFiles = traces.filter(t => t.growth.direction === 'contracting').length
  const healthyGrowth = traces.filter(t => t.growth.isHealthy).length

  const hasDecay = traces.some(t => t.decay.present)
  const overallEvolutionaryHealth = totalFiles > 0
    ? Math.min(100, Math.max(0, Math.round(
        avgMaturity * 0.3 + (hasDecay ? 10 : 30) + Math.min(20, avgShadowClarity * 0.3) + Math.min(20, totalModernPatterns / totalFiles * 10)
      )))
    : 0

  const epochGrade = classifyEpochGrade(overallEvolutionaryHealth)

  const sortedByClarity = [...traces].sort((a, b) => b.shadowClarity - a.shadowClarity)
  const bestPreserved = sortedByClarity.length > 0 ? sortedByClarity[0].file : 'none'

  const sortedByDepth = [...traces].sort((a, b) => b.temporalDepth - a.temporalDepth)
  const mostEvolved = sortedByDepth.length > 0 ? sortedByDepth[0].file : 'none'

  const sortedByMaturity = [...traces].sort((a, b) => b.maturity - a.maturity)
  const freshestCode = sortedByMaturity.length > 0 ? sortedByMaturity[0].file : 'none'

  const sortedByLegacy = [...traces].sort((a, b) => b.traces.legacyPatterns - a.traces.legacyPatterns)
  const mostLegacy = sortedByLegacy.length > 0 ? sortedByLegacy[0].file : 'none'

  return {
    totalFiles, totalClusters, avgShadowLength, avgShadowClarity,
    avgTemporalDepth, avgMaturity,
    sunlitFiles, daylightFiles, shadowedFiles, twilightFiles, midnightFiles,
    dawnFiles, noonFiles, duskFiles, nightFiles,
    totalLegacyPatterns, totalModernPatterns, totalExperimentalPatterns,
    totalDeprecatedPatterns, totalRefactoringTraces,
    expandingFiles, stableFiles, contractingFiles, healthyGrowth,
    hasDecay, overallEvolutionaryHealth, epochGrade,
    bestPreserved, mostEvolved, freshestCode, mostLegacy,
  }
}
