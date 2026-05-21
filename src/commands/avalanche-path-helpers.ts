// ─── Interfaces ──────────────────────────────────────────────────────────────

export type RiskLevel = 'safe' | 'low' | 'moderate' | 'considerable' | 'high' | 'extreme'
export type SlopeCondition = 'bomb-proof' | 'stable' | 'moderate' | 'sensitive' | 'touchy' | 'hair-trigger'
export type FaceType = 'shield-wall' | 'stable-slope' | 'moderate-face' | 'exposed-face' | 'avalanche-prone' | 'no-go-zone'
export type OverallRisk = 'green' | 'yellow' | 'orange' | 'red' | 'black'
export type FaceCondition = 'fortress' | 'defended' | 'exposed' | 'vulnerable' | 'dangerous' | 'catastrophic'
export type Aspect = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'
export type PatrollerGrade = 'head-patroller' | 'patroller' | 'ski-guide' | 'skier' | 'novice' | 'buried'

export interface LayersInfo {
  count: number
  hasWeakLayer: boolean
  hasIceCrust: boolean
  hasSugarSnow: boolean
  hasWindSlab: boolean
  weakLayerPosition: number
  layerBonding: number
}

export interface AvalancheInfo {
  riskLevel: RiskLevel
  triggerPoints: string[]
  propagationPaths: string[]
  runoutZones: string[]
  isContained: boolean
  hasBarriers: boolean
  barrierCount: number
}

export interface TerrainInfo {
  slope: number
  aspect: Aspect
  elevation: number
  isConvex: boolean
  isConcave: boolean
  hasCliff: boolean
  hasGully: boolean
}

export interface SnowInfo {
  depth: number
  density: number
  temperature: number
  isWet: boolean
  isPacked: boolean
  hasCrust: boolean
}

export interface RescueInfo {
  hasTransceiver: boolean
  hasProbe: boolean
  hasShovel: boolean
  hasAvalung: boolean
  hasAirbag: boolean
  responseTime: number
  rescueReadiness: number
}

export interface SnowLayer {
  file: string
  snowpackStability: number
  slabThickness: number
  triggerSensitivity: number
  propagationSpeed: number
  runoutDistance: number
  rescuePotential: number
  layers: LayersInfo
  avalanche: AvalancheInfo
  terrain: TerrainInfo
  snow: SnowInfo
  rescue: RescueInfo
  condition: SlopeCondition
  qualityScore: number
}

export interface MountainFace {
  directory: string
  layers: SnowLayer[]
  avgStability: number
  avgTriggerSensitivity: number
  avgPropagationSpeed: number
  safeCount: number
  extremeCount: number
  containedCount: number
  uncontainedCount: number
  faceType: FaceType
  overallRisk: OverallRisk
  condition: FaceCondition
}

export interface MountainInfo {
  avgStability: number
  avgTriggerSensitivity: number
  avgPropagationSpeed: number
  avgRescuePotential: number
  totalTriggerPoints: number
  totalPropagationPaths: number
  isSafe: boolean
  overallRisk: number
}

export interface AvalanchePathStats {
  totalFiles: number
  totalFaces: number
  avgSnowpackStability: number
  avgSlabThickness: number
  avgTriggerSensitivity: number
  avgPropagationSpeed: number
  avgRunoutDistance: number
  avgRescuePotential: number
  bombProofCount: number
  stableCount: number
  moderateCount: number
  sensitiveCount: number
  touchyCount: number
  hairTriggerCount: number
  safeRiskCount: number
  highRiskCount: number
  extremeRiskCount: number
  containedCount: number
  uncontainedCount: number
  totalTriggerPoints: number
  totalPropagationPaths: number
  totalRunoutZones: number
  totalBarriers: number
  hasTransceiverCount: number
  hasProbeCount: number
  hasShovelCount: number
  hasAirbagCount: number
  overallRisk: number
  patrollerGrade: PatrollerGrade
  mostStable: string
  mostUnstable: string
  mostSensitive: string
  bestRescueReady: string
  worstCascader: string
}

export interface AvalanchePathResult {
  layers: SnowLayer[]
  faces: MountainFace[]
  mountain: MountainInfo
  stats: AvalanchePathStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling constructs
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify risk level from stability and trigger sensitivity
 * @example
 * classifyRiskLevel(90, 10) // 'safe'
 */
export function classifyRiskLevel(stability: number, trigger: number): RiskLevel {
  const score = stability - trigger * 0.5
  if (score >= 70) return 'safe'
  if (score >= 55) return 'low'
  if (score >= 40) return 'moderate'
  if (score >= 25) return 'considerable'
  if (score >= 10) return 'high'
  return 'extreme'
}

/**
 * Classify slope condition from quality score
 * @example
 * classifySlopeCondition(90) // 'bomb-proof'
 */
export function classifySlopeCondition(qualityScore: number): SlopeCondition {
  if (qualityScore >= 85) return 'bomb-proof'
  if (qualityScore >= 70) return 'stable'
  if (qualityScore >= 50) return 'moderate'
  if (qualityScore >= 30) return 'sensitive'
  if (qualityScore >= 15) return 'touchy'
  return 'hair-trigger'
}

/**
 * Classify face type from snow layers
 * @example
 * classifyFaceType([]) // 'shield-wall'
 */
export function classifyFaceType(layers: SnowLayer[]): FaceType {
  if (layers.length === 0) return 'shield-wall'
  const conditions = layers.map(l => l.condition)
  const bombProof = conditions.filter(c => c === 'bomb-proof' || c === 'stable').length
  const hairTrigger = conditions.filter(c => c === 'hair-trigger' || c === 'touchy').length
  const n = layers.length

  if (hairTrigger > n / 2) return 'no-go-zone'
  if (hairTrigger > n * 0.3) return 'avalanche-prone'
  if (bombProof > n * 0.7) return 'shield-wall'
  if (bombProof > n * 0.4) return 'stable-slope'
  if (bombProof > 0) return 'moderate-face'
  return 'exposed-face'
}

/**
 * Classify overall risk from score
 * @example
 * classifyOverallRisk(90) // 'green'
 */
export function classifyOverallRisk(score: number): OverallRisk {
  if (score >= 75) return 'green'
  if (score >= 55) return 'yellow'
  if (score >= 35) return 'orange'
  if (score >= 15) return 'red'
  return 'black'
}

/**
 * Classify face condition from average stability
 * @example
 * classifyFaceCondition(85) // 'fortress'
 */
export function classifyFaceCondition(avgStability: number): FaceCondition {
  if (avgStability >= 80) return 'fortress'
  if (avgStability >= 60) return 'defended'
  if (avgStability >= 40) return 'exposed'
  if (avgStability >= 25) return 'vulnerable'
  if (avgStability >= 10) return 'dangerous'
  return 'catastrophic'
}

/**
 * Classify patroller grade from average risk
 * @example
 * classifyPatrollerGrade(85) // 'head-patroller'
 */
export function classifyPatrollerGrade(avgRisk: number): PatrollerGrade {
  if (avgRisk >= 80) return 'head-patroller'
  if (avgRisk >= 65) return 'patroller'
  if (avgRisk >= 45) return 'ski-guide'
  if (avgRisk >= 30) return 'skier'
  if (avgRisk >= 15) return 'novice'
  return 'buried'
}

/**
 * Classify terrain aspect from code characteristics
 * @example
 * classifyAspect(0) // 'N'
 */
export function classifyAspect(imports: number, exports: number): Aspect {
  const diff = exports - imports
  if (diff > 3) return 'N'
  if (diff > 1) return 'NE'
  if (diff > 0) return 'E'
  if (diff === 0 && exports > 0) return 'SE'
  if (diff === 0) return 'S'
  if (diff > -2) return 'SW'
  if (diff > -4) return 'W'
  return 'NW'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure layers (abstraction, weak layers, bonding)
 * @example
 * measureLayers('export function a(): number { return 1 }') // LayersInfo
 */
export function measureLayers(content: string): LayersInfo {
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const interfaces = (content.match(/(?:export\s+)?interface\s+\w+/g) ?? []).length
  const typeAliases = (content.match(/(?:export\s+)?type\s+\w+\s*=/g) ?? []).length
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const count = Math.max(1, funcs + interfaces + typeAliases)
  const hasWeakLayer = errors === 0 && branches > 3
  const hasIceCrust = interfaces > 0 && funcs === 0
  const hasSugarSnow = types === 0 && funcs > 0
  const hasWindSlab = countTodos(content) > 0

  const weakLayerPosition = hasWeakLayer ? Math.min(100, Math.round(branches * 10)) : 0
  const layerBonding = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (countComments(content) > 0 ? 20 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (countLoc(content) > 0 ? 10 : 0),
  )))

  return { count, hasWeakLayer, hasIceCrust, hasSugarSnow, hasWindSlab, weakLayerPosition, layerBonding }
}

/**
 * Measure terrain (slope, aspect, elevation)
 * @example
 * measureTerrain('export function a(): number { return 1 }') // TerrainInfo
 */
export function measureTerrain(content: string): TerrainInfo {
  const nest = maxNesting(content)
  const branches = countBranches(content)
  const imports = countImports(content)
  const exports = countExports(content)

  const slope = Math.min(90, Math.round(nest * 8 + branches * 5))
  const aspect = classifyAspect(imports, exports)
  const elevation = Math.min(100, Math.round(
    countTypeAnnotations(content) * 5 +
    (countComments(content) > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0),
  ))

  const isConvex = exports > 0 && countErrorHandling(content) === 0
  const isConcave = imports > 2 && countErrorHandling(content) === 0
  const hasCliff = nest >= 5
  const hasGully = branches > 5 && countFunctions(content) === 0

  return { slope, aspect, elevation, isConvex, isConcave, hasCliff, hasGully }
}

/**
 * Measure snow (depth, density, temperature)
 * @example
 * measureSnow('export function a(): number { return 1 }') // SnowInfo
 */
export function measureSnow(content: string): SnowInfo {
  const loc = countLoc(content)
  const branches = countBranches(content)
  const nest = maxNesting(content)

  const depth = Math.min(100, loc)
  const density = Math.min(100, Math.round(
    branches * 5 + nest * 8 + countConsole(content) * 3,
  ))
  const temperature = Math.min(100, Math.round(
    countTodos(content) * 10 + countConsole(content) * 5 + (loc > 50 ? 15 : 0),
  ))

  const isWet = countTodos(content) > 0
  const isPacked = countErrorHandling(content) > 0 && countComments(content) > 0
  const hasCrust = countTypeAnnotations(content) === 0 && countExports(content) > 0

  return { depth, density, temperature, isWet, isPacked, hasCrust }
}

/**
 * Measure rescue capabilities
 * @example
 * measureRescue('try {} catch(e) { console.error(e) }') // RescueInfo
 */
export function measureRescue(content: string): RescueInfo {
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const hasLog = countConsole(content) > 0 || /console\.\w+/.test(content)
  const hasRetry = /retry|reconnect|fallback/i.test(content)
  const hasCircuitBreaker = /circuit.?breaker|timeout|debounce|throttle/i.test(content)

  const hasTransceiver = hasLog || errors > 0
  const hasProbe = comments > 0 || countTypeAnnotations(content) > 0
  const hasShovel = errors > 0
  const hasAvalung = hasRetry
  const hasAirbag = hasCircuitBreaker

  const rescueTools = (hasTransceiver ? 1 : 0) + (hasProbe ? 1 : 0) + (hasShovel ? 1 : 0) + (hasAvalung ? 1 : 0) + (hasAirbag ? 1 : 0)
  const responseTime = Math.min(100, Math.round(rescueTools * 20))

  const rescueReadiness = Math.min(100, Math.round(
    (hasTransceiver ? 25 : 0) +
    (hasProbe ? 20 : 0) +
    (hasShovel ? 25 : 0) +
    (hasAvalung ? 15 : 0) +
    (hasAirbag ? 15 : 0),
  ))

  return { hasTransceiver, hasProbe, hasShovel, hasAvalung, hasAirbag, responseTime, rescueReadiness }
}

/**
 * Detect avalanche paths (trigger points, propagation, runout)
 * @example
 * detectAvalanchePaths('function a() { if (b) { throw new Error() } }') // AvalancheInfo
 */
export function detectAvalanchePaths(content: string): AvalancheInfo {
  const triggerPoints: string[] = []
  const propagationPaths: string[] = []
  const runoutZones: string[] = []
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const exports = countExports(content)
  const imports = countImports(content)

  if (branches > 3 && errors === 0) triggerPoints.push('Unhandled branch complexity')
  if (maxNesting(content) > 4) triggerPoints.push('Deep nesting without containment')
  if (countTodos(content) > 2) triggerPoints.push('Multiple unresolved markers')

  if (exports > 0 && errors === 0) propagationPaths.push('Exported functions lack error boundaries')
  if (imports > 3 && errors === 0) propagationPaths.push('Heavy imports without error handling')

  if (exports > 2) runoutZones.push('Multiple consumers could be affected')
  if (countConsole(content) > 3) runoutZones.push('Excessive logging indicates instability')

  const isContained = errors > 0 && triggerPoints.length === 0
  const barrierCount = errors + (content.match(/finally\s*\{/g) ?? []).length
  const hasBarriers = barrierCount > 0

  const riskLevel = classifyRiskLevel(
    errors > 0 ? 70 : 20,
    triggerPoints.length * 20,
  )

  return { riskLevel, triggerPoints, propagationPaths, runoutZones, isContained, hasBarriers, barrierCount }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a snow layer
 * @example
 * analyzeSnowLayer('export function calc(): number { return 1 }', 'calc.ts') // SnowLayer
 */
export function analyzeSnowLayer(content: string, filePath: string): SnowLayer {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      snowpackStability: 0, slabThickness: 0, triggerSensitivity: 100,
      propagationSpeed: 0, runoutDistance: 0, rescuePotential: 0,
      layers: { count: 0, hasWeakLayer: false, hasIceCrust: false, hasSugarSnow: false, hasWindSlab: false, weakLayerPosition: 0, layerBonding: 0 },
      avalanche: { riskLevel: 'extreme', triggerPoints: [], propagationPaths: [], runoutZones: [], isContained: false, hasBarriers: false, barrierCount: 0 },
      terrain: { slope: 0, aspect: 'S', elevation: 0, isConvex: false, isConcave: false, hasCliff: false, hasGully: false },
      snow: { depth: 0, density: 0, temperature: 0, isWet: false, isPacked: false, hasCrust: false },
      rescue: { hasTransceiver: false, hasProbe: false, hasShovel: false, hasAvalung: false, hasAirbag: false, responseTime: 0, rescueReadiness: 0 },
      condition: 'hair-trigger',
      qualityScore: 0,
    }
  }

  const layerInfo = measureLayers(content)
  const terrain = measureTerrain(content)
  const snow = measureSnow(content)
  const rescue = measureRescue(content)
  const avalanche = detectAvalanchePaths(content)

  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const branches = countBranches(content)

  const snowpackStability = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (layerInfo.layerBonding * 0.2) +
    (exports > 0 ? 10 : 0) +
    (countLoc(content) > 0 ? 5 : 0),
  )))

  const slabThickness = Math.min(100, Math.round(
    exports * 10 + branches * 5 + maxNesting(content) * 3,
  ))

  const triggerSensitivity = Math.min(100, Math.max(0, Math.round(
    (errors === 0 ? 30 : 0) +
    (countTodos(content) > 0 ? 20 : 0) +
    (branches > 5 ? 20 : branches > 3 ? 10 : 0) +
    (maxNesting(content) > 3 ? 15 : 0) +
    (types === 0 && countFunctions(content) > 0 ? 15 : 0),
  )))

  const propagationSpeed = Math.min(100, Math.max(0, Math.round(
    (exports > 0 && errors === 0 ? 30 : 0) +
    (imports > 0 && errors === 0 ? 20 : 0) +
    (branches > 3 && errors === 0 ? 20 : 0) +
    (maxNesting(content) > 3 ? 15 : 0) +
    (countConsole(content) > 3 ? 15 : 0),
  )))

  const runoutDistance = Math.min(100, Math.round(exports * 12 + branches * 3))

  const rescuePotential = rescue.rescueReadiness

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    snowpackStability * 0.25 +
    (100 - triggerSensitivity) * 0.2 +
    (100 - propagationSpeed) * 0.15 +
    rescuePotential * 0.15 +
    layerInfo.layerBonding * 0.1 +
    (avalanche.isContained ? 10 : 0) +
    (snow.isPacked ? 5 : 0),
  )))

  const condition = classifySlopeCondition(qualityScore)

  return {
    file: filePath,
    snowpackStability, slabThickness, triggerSensitivity,
    propagationSpeed, runoutDistance, rescuePotential,
    layers: layerInfo, avalanche, terrain, snow, rescue,
    condition, qualityScore,
  }
}

// ─── Mountain Face Analysis ──────────────────────────────────────────────────

/**
 * Analyze a directory as a mountain face
 * @example
 * analyzeMountainFace(layers, 'src') // MountainFace
 */
export function analyzeMountainFace(layers: SnowLayer[], dirPath: string): MountainFace {
  if (layers.length === 0) {
    return {
      directory: dirPath, layers: [],
      avgStability: 100, avgTriggerSensitivity: 0, avgPropagationSpeed: 0,
      safeCount: 0, extremeCount: 0, containedCount: 0, uncontainedCount: 0,
      faceType: 'shield-wall', overallRisk: 'green', condition: 'fortress',
    }
  }

  const n = layers.length
  const avgStability = Math.round(layers.reduce((s, l) => s + l.snowpackStability, 0) / n)
  const avgTriggerSensitivity = Math.round(layers.reduce((s, l) => s + l.triggerSensitivity, 0) / n)
  const avgPropagationSpeed = Math.round(layers.reduce((s, l) => s + l.propagationSpeed, 0) / n)

  const safeCount = layers.filter(l => l.avalanche.riskLevel === 'safe' || l.avalanche.riskLevel === 'low').length
  const extremeCount = layers.filter(l => l.avalanche.riskLevel === 'high' || l.avalanche.riskLevel === 'extreme').length
  const containedCount = layers.filter(l => l.avalanche.isContained).length
  const uncontainedCount = n - containedCount

  const faceType = classifyFaceType(layers)
  const riskScore = Math.max(0, Math.min(100, Math.round(
    avgStability * 0.4 +
    (100 - avgTriggerSensitivity) * 0.3 +
    (100 - avgPropagationSpeed) * 0.2 +
    (containedCount / n) * 100 * 0.1,
  )))
  const overallRisk = classifyOverallRisk(riskScore)
  const condition = classifyFaceCondition(avgStability)

  return {
    directory: dirPath, layers,
    avgStability, avgTriggerSensitivity, avgPropagationSpeed,
    safeCount, extremeCount, containedCount, uncontainedCount,
    faceType, overallRisk, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate avalanche path recommendations
 * @example
 * generateRecommendations(layers, faces, mountain, stats) // string[]
 */
export function generateRecommendations(
  _layers: SnowLayer[],
  _faces: MountainFace[],
  _mountain: MountainInfo,
  stats: AvalanchePathStats,
): string[] {
  void _layers
  void _faces
  void _mountain
  const recs: string[] = []

  if (stats.hairTriggerCount > 0) {
    recs.push(`Hair-trigger zones: ${stats.hairTriggerCount} files could cascade at any disturbance`)
  }
  if (stats.uncontainedCount > 0) {
    recs.push(`Uncontained failures: ${stats.uncontainedCount} files lack error boundaries`)
  }
  if (stats.totalTriggerPoints > 0) {
    recs.push(`Trigger points: ${stats.totalTriggerPoints} potential cascade starters detected`)
  }
  if (stats.totalPropagationPaths > 0) {
    recs.push(`Propagation paths: ${stats.totalPropagationPaths} routes for error spread`)
  }
  if (stats.avgRescuePotential < 40) {
    recs.push('Low rescue readiness: add error handling, logging, and fallback mechanisms')
  }
  if (stats.overallRisk >= 60) {
    recs.push('Stable conditions: error handling is robust across the codebase')
  }
  if (stats.extremeRiskCount > 0) {
    recs.push(`Extreme risk: ${stats.extremeRiskCount} files pose catastrophic cascade risk`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete avalanche path result from files and contents
 * @example
 * buildAvalanchePathResult(['a.ts'], ['export function a() {}'], {}) // AvalanchePathResult
 */
export function buildAvalanchePathResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): AvalanchePathResult {
  void options

  const layers: SnowLayer[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSnowLayer(content, file)
    } catch {
      return analyzeSnowLayer('', file)
    }
  })

  const dirMap = new Map<string, SnowLayer[]>()
  for (const l of layers) {
    const dir = l.file.includes('/') ? l.file.slice(0, l.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(l) } else { dirMap.set(dir, [l]) }
  }

  const faces: MountainFace[] = Array.from(dirMap.entries()).map(([dir, ls]) =>
    analyzeMountainFace(ls, dir),
  )

  const n = layers.length || 1
  const avgStability = Math.round(layers.reduce((s, l) => s + l.snowpackStability, 0) / n)
  const avgTriggerSensitivity = Math.round(layers.reduce((s, l) => s + l.triggerSensitivity, 0) / n)
  const avgPropagationSpeed = Math.round(layers.reduce((s, l) => s + l.propagationSpeed, 0) / n)
  const avgRescuePotential = Math.round(layers.reduce((s, l) => s + l.rescuePotential, 0) / n)
  const totalTriggerPoints = layers.reduce((s, l) => s + l.avalanche.triggerPoints.length, 0)
  const totalPropagationPaths = layers.reduce((s, l) => s + l.avalanche.propagationPaths.length, 0)

  const overallRisk = Math.min(100, Math.max(0, Math.round(
    avgStability * 0.3 +
    (100 - avgTriggerSensitivity) * 0.25 +
    (100 - avgPropagationSpeed) * 0.2 +
    avgRescuePotential * 0.15 +
    (layers.filter(l => l.avalanche.isContained).length / n) * 100 * 0.1,
  )))

  const mountain: MountainInfo = {
    avgStability,
    avgTriggerSensitivity,
    avgPropagationSpeed,
    avgRescuePotential,
    totalTriggerPoints,
    totalPropagationPaths,
    isSafe: overallRisk >= 60,
    overallRisk,
  }

  const stats: AvalanchePathStats = {
    totalFiles: files.length,
    totalFaces: faces.length,
    avgSnowpackStability: avgStability,
    avgSlabThickness: Math.round(layers.reduce((s, l) => s + l.slabThickness, 0) / n),
    avgTriggerSensitivity,
    avgPropagationSpeed,
    avgRunoutDistance: Math.round(layers.reduce((s, l) => s + l.runoutDistance, 0) / n),
    avgRescuePotential,
    bombProofCount: layers.filter(l => l.condition === 'bomb-proof').length,
    stableCount: layers.filter(l => l.condition === 'stable').length,
    moderateCount: layers.filter(l => l.condition === 'moderate').length,
    sensitiveCount: layers.filter(l => l.condition === 'sensitive').length,
    touchyCount: layers.filter(l => l.condition === 'touchy').length,
    hairTriggerCount: layers.filter(l => l.condition === 'hair-trigger').length,
    safeRiskCount: layers.filter(l => l.avalanche.riskLevel === 'safe' || l.avalanche.riskLevel === 'low').length,
    highRiskCount: layers.filter(l => l.avalanche.riskLevel === 'high').length,
    extremeRiskCount: layers.filter(l => l.avalanche.riskLevel === 'extreme').length,
    containedCount: layers.filter(l => l.avalanche.isContained).length,
    uncontainedCount: layers.filter(l => !l.avalanche.isContained).length,
    totalTriggerPoints,
    totalPropagationPaths,
    totalRunoutZones: layers.reduce((s, l) => s + l.avalanche.runoutZones.length, 0),
    totalBarriers: layers.reduce((s, l) => s + l.avalanche.barrierCount, 0),
    hasTransceiverCount: layers.filter(l => l.rescue.hasTransceiver).length,
    hasProbeCount: layers.filter(l => l.rescue.hasProbe).length,
    hasShovelCount: layers.filter(l => l.rescue.hasShovel).length,
    hasAirbagCount: layers.filter(l => l.rescue.hasAirbag).length,
    overallRisk,
    patrollerGrade: classifyPatrollerGrade(overallRisk),
    mostStable: layers.length > 0
      ? layers.reduce((a, b) => b.snowpackStability > a.snowpackStability ? b : a, layers[0]).file : 'none',
    mostUnstable: layers.length > 0
      ? layers.reduce((a, b) => b.snowpackStability < a.snowpackStability ? b : a, layers[0]).file : 'none',
    mostSensitive: layers.length > 0
      ? layers.reduce((a, b) => b.triggerSensitivity > a.triggerSensitivity ? b : a, layers[0]).file : 'none',
    bestRescueReady: layers.length > 0
      ? layers.reduce((a, b) => b.rescue.rescueReadiness > a.rescue.rescueReadiness ? b : a, layers[0]).file : 'none',
    worstCascader: layers.length > 0
      ? layers.reduce((a, b) => b.propagationSpeed > a.propagationSpeed ? b : a, layers[0]).file : 'none',
  }

  const recommendations = generateRecommendations(layers, faces, mountain, stats)

  return { layers, faces, mountain, stats, recommendations }
}
