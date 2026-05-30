// ─── Interfaces ──────────────────────────────────────────────────────────────

export type CableType = 'main-cable' | 'stays' | 'suspenders' | 'deck-beam' | 'tower' | 'anchorage' | 'hanger'
export type CableMaterial = 'steel' | 'carbon-fiber' | 'concrete' | 'wood' | 'rope' | 'chain'
export type SegmentCondition = 'new' | 'good' | 'fair' | 'worn' | 'deteriorated' | 'critical' | 'failed'
export type BridgeType = 'suspension' | 'cable-stayed' | 'arch' | 'beam' | 'truss' | 'cantilever' | 'tied-arch'
export type SpanCondition = 'sound' | 'serviceable' | 'needs-repair' | 'weight-restricted' | 'condemned' | 'collapsed'
export type EngineerGrade = 'structural-engineer' | 'civil-engineer' | 'architect' | 'draftsman' | 'handyman' | 'toddler'

export interface LoadInfo {
  selfWeight: number
  liveLoad: number
  deadLoad: number
  windLoad: number
  totalLoad: number
  loadCapacity: number
  loadRatio: number
  isOverloaded: boolean
  safetyFactor: number
}

export interface StressInfo {
  tensile: number
  compressive: number
  shear: number
  torsion: number
  isWithinLimits: boolean
  maxStressPoint: string
  hasStressCracks: boolean
  hasFatigueSigns: boolean
  hasCorrosion: boolean
}

export interface ConnectionInfo {
  upperConnections: string[]
  lowerConnections: string[]
  lateralConnections: string[]
  connectionCount: number
  isRedundant: boolean
  hasSinglePointOfFailure: boolean
}

export interface GeometryInfo {
  span: number
  sag: number
  camber: number
  isLevel: boolean
  isPlumb: boolean
}

export interface CableSegment {
  file: string
  tension: number
  strength: number
  elasticity: number
  fatigue: number
  cableType: CableType
  material: CableMaterial
  load: LoadInfo
  stress: StressInfo
  connections: ConnectionInfo
  geometry: GeometryInfo
  condition: SegmentCondition
  qualityScore: number
}

export interface BridgeSpan {
  directory: string
  segments: CableSegment[]
  bridgeType: BridgeType
  totalSpan: number
  maxTowerHeight: number
  avgTension: number
  avgStrength: number
  maxLoadRatio: number
  overloadedCount: number
  criticalCount: number
  totalSafetyFactor: number
  isStructurallySound: boolean
  hasSinglePointsOfFailure: boolean
  swayFactor: number
  structuralHealth: number
  condition: SpanCondition
}

export interface BridgeNetwork {
  totalSpan: number
  avgTension: number
  avgStrength: number
  avgLoadRatio: number
  maxLoadRatio: number
  totalOverloaded: number
  totalCritical: number
  hasFailures: boolean
  isStructurallySound: boolean
  overallSafetyFactor: number
}

export interface BridgeCableStats {
  totalFiles: number
  totalSpans: number
  avgTension: number
  avgStrength: number
  avgElasticity: number
  avgFatigue: number
  avgLoadRatio: number
  avgSafetyFactor: number
  mainCables: number
  stays: number
  towers: number
  anchorages: number
  steelSegments: number
  ropeSegments: number
  overloadedCount: number
  criticalCount: number
  failedCount: number
  stressCracksCount: number
  fatigueSignsCount: number
  corrosionCount: number
  singlePointsOfFailure: number
  overallStructuralHealth: number
  engineerGrade: EngineerGrade
  strongestSegment: string
  weakestSegment: string
  heaviestLoad: string
  mostRedundant: string
  biggestSpan: string
}

export interface BridgeCableResult {
  segments: CableSegment[]
  spans: BridgeSpan[]
  network: BridgeNetwork
  stats: BridgeCableStats
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
 * Count error handling
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
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
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

// ─── Load Analysis ───────────────────────────────────────────────────────────

/**
 * Compute load analysis for a file
 * @example
 * computeLoadAnalysis('export function a() {}', 'a.ts') // LoadInfo
 */
export function computeLoadAnalysis(content: string, _filePath: string): LoadInfo {
  void _filePath
  const loc = countLoc(content)
  if (loc === 0) {
    return { selfWeight: 0, liveLoad: 0, deadLoad: 0, windLoad: 0, totalLoad: 0, loadCapacity: 100, loadRatio: 0, isOverloaded: false, safetyFactor: 100 }
  }

  const selfWeight = Math.min(100, Math.round(loc * 0.4))
  const liveLoad = Math.min(100, Math.round(
    countFunctions(content) * 8 +
    countBranches(content) * 4,
  ))
  const deadLoad = Math.min(100, Math.round(
    countImports(content) * 10 +
    countExports(content) * 6,
  ))
  const windLoad = Math.min(100, Math.round(
    countTodos(content) * 12 +
    countConsole(content) * 6,
  ))
  const totalLoad = Math.min(100, Math.round(
    selfWeight * 0.3 + liveLoad * 0.25 + deadLoad * 0.25 + windLoad * 0.2,
  ))

  const errorHandling = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const loadCapacity = Math.min(100, Math.max(10, Math.round(
    (errorHandling > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (comments > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0) +
    (loc <= 150 ? 20 : loc <= 300 ? 10 : 0),
  )))

  const loadRatio = loadCapacity > 0 ? Math.round((totalLoad / loadCapacity) * 100) / 100 : 99
  const isOverloaded = loadRatio > 1.0
  const safetyFactor = totalLoad > 0 ? Math.round((loadCapacity / totalLoad) * 100) / 100 : 100

  return { selfWeight, liveLoad, deadLoad, windLoad, totalLoad, loadCapacity, loadRatio, isOverloaded, safetyFactor }
}

// ─── Stress Analysis ─────────────────────────────────────────────────────────

/**
 * Compute stress analysis for a file
 * @example
 * computeStressAnalysis('import { a } from "b"') // StressInfo
 */
export function computeStressAnalysis(content: string): StressInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { tensile: 0, compressive: 0, shear: 0, torsion: 0, isWithinLimits: true, maxStressPoint: 'none', hasStressCracks: false, hasFatigueSigns: false, hasCorrosion: false }
  }

  const imports = countImports(content)
  const exports = countExports(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const todos = countTodos(content)
  const errorHandling = countErrorHandling(content)

  const tensile = Math.min(100, Math.round(imports * 12))
  const compressive = Math.min(100, Math.round(exports * 10))
  const shear = Math.min(100, Math.round(branches * 6 + nesting * 4))
  const torsion = Math.min(100, Math.round(
    (todos * 10) +
    (errorHandling === 0 && loc > 30 ? 15 : 0),
  ))

  const maxStress = Math.max(tensile, compressive, shear, torsion)
  const isWithinLimits = maxStress < 70

  const maxStressPoint = maxStress === tensile ? 'imports'
    : maxStress === compressive ? 'exports'
    : maxStress === shear ? 'branches'
    : 'requirements'

  const hasStressCracks = maxStress > 80
  const hasFatigueSigns = todos > 2 || nesting > 5
  const hasCorrosion = countConsole(content) > 3 || (errorHandling === 0 && loc > 50)

  return { tensile, compressive, shear, torsion, isWithinLimits, maxStressPoint, hasStressCracks, hasFatigueSigns, hasCorrosion }
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify cable type based on imports and dependents
 * @example
 * classifyCableType(5, 0) // 'main-cable'
 */
export function classifyCableType(imports: number, dependents: number): CableType {
  if (imports === 0 && dependents > 3) return 'anchorage'
  if (imports > 5 && dependents > 3) return 'tower'
  if (imports > 3) return 'main-cable'
  if (dependents > 2) return 'stays'
  if (imports > 0 && dependents > 0) return 'suspenders'
  if (imports > 0) return 'hanger'
  return 'deck-beam'
}

/**
 * Classify cable material based on code robustness
 * @example
 * classifyCableMaterial('export function a(): void {}') // 'steel'
 */
export function classifyCableMaterial(content: string): CableMaterial {
  const types = countTypeAnnotations(content)
  const errorHandling = countErrorHandling(content)
  const exports = countExports(content)
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /interface\s+\w/.test(content)

  if (hasInterface && hasClass && types > 2 && errorHandling > 0) return 'steel'
  if (hasClass && types > 0 && errorHandling > 0) return 'carbon-fiber'
  if (exports > 1 && types > 0) return 'concrete'
  if (exports > 0 && errorHandling > 0) return 'wood'
  if (exports > 0) return 'chain'
  return 'rope'
}

/**
 * Classify segment condition from quality score
 * @example
 * classifySegmentCondition(80) // 'good'
 */
export function classifySegmentCondition(qualityScore: number): SegmentCondition {
  if (qualityScore >= 85) return 'new'
  if (qualityScore >= 70) return 'good'
  if (qualityScore >= 55) return 'fair'
  if (qualityScore >= 40) return 'worn'
  if (qualityScore >= 20) return 'deteriorated'
  if (qualityScore >= 5) return 'critical'
  return 'failed'
}

/**
 * Classify bridge type from segment data
 * @example
 * classifyBridgeType([]) // 'beam'
 */
export function classifyBridgeType(segments: CableSegment[]): BridgeType {
  if (segments.length === 0) return 'beam'
  const types = new Map<CableType, number>()
  for (const seg of segments) {
    const count = types.get(seg.cableType) ?? 0
    types.set(seg.cableType, count + 1)
  }
  const hasTowers = (types.get('tower') ?? 0) > 0
  const hasAnchorage = (types.get('anchorage') ?? 0) > 0
  const hasMainCable = (types.get('main-cable') ?? 0) > 0
  const hasStays = (types.get('stays') ?? 0) > 0

  if (hasTowers && hasMainCable && hasAnchorage) return 'suspension'
  if (hasTowers && hasStays) return 'cable-stayed'
  if (hasAnchorage && hasMainCable) return 'arch'
  if (hasStays) return 'truss'
  if (hasMainCable) return 'cantilever'
  if (hasAnchorage) return 'tied-arch'
  return 'beam'
}

/**
 * Classify span condition from structural health
 * @example
 * classifySpanCondition(80) // 'serviceable'
 */
export function classifySpanCondition(structuralHealth: number): SpanCondition {
  if (structuralHealth >= 80) return 'sound'
  if (structuralHealth >= 60) return 'serviceable'
  if (structuralHealth >= 40) return 'needs-repair'
  if (structuralHealth >= 25) return 'weight-restricted'
  if (structuralHealth >= 10) return 'condemned'
  return 'collapsed'
}

/**
 * Classify engineer grade from average health
 * @example
 * classifyEngineerGrade(80) // 'civil-engineer'
 */
export function classifyEngineerGrade(avgHealth: number): EngineerGrade {
  if (avgHealth >= 85) return 'structural-engineer'
  if (avgHealth >= 70) return 'civil-engineer'
  if (avgHealth >= 55) return 'architect'
  if (avgHealth >= 35) return 'draftsman'
  if (avgHealth >= 15) return 'handyman'
  return 'toddler'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect fatigue signs in code (tech debt wear)
 * @example
 * detectFatigue('TODO: fix this') // number
 */
export function detectFatigue(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    countTodos(content) * 12 +
    countConsole(content) * 6 +
    (maxNesting(content) > 4 ? 15 : 0) +
    (loc > 300 ? 10 : 0) +
    (countErrorHandling(content) === 0 ? 10 : 0),
  ))
}

/**
 * Detect corrosion in code (degradation)
 * @example
 * detectCorrosion('console.log(1); console.log(2); console.log(3); console.log(4)') // number
 */
export function detectCorrosion(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countConsole(content) > 3 ? 20 : 0) +
    (countErrorHandling(content) === 0 && loc > 40 ? 20 : 0) +
    (countTypeAnnotations(content) === 0 && loc > 30 ? 15 : 0) +
    (countComments(content) === 0 && loc > 50 ? 15 : 0) +
    (countExports(content) === 0 && countFunctions(content) > 3 ? 10 : 0),
  ))
}

// ─── Connection & Geometry Helpers ───────────────────────────────────────────

/**
 * Build connection info for a segment
 * @example
 * buildConnectionInfo(['a.ts'], ['b.ts'], []) // ConnectionInfo
 */
export function buildConnectionInfo(
  upperConnections: string[],
  lowerConnections: string[],
  lateralConnections: string[],
): ConnectionInfo {
  const connectionCount = upperConnections.length + lowerConnections.length + lateralConnections.length
  const isRedundant = connectionCount >= 3 && upperConnections.length > 0 && lowerConnections.length > 0
  const hasSinglePointOfFailure = connectionCount === 1 || (upperConnections.length === 0 && lowerConnections.length === 0 && lateralConnections.length <= 1)

  return { upperConnections, lowerConnections, lateralConnections, connectionCount, isRedundant, hasSinglePointOfFailure }
}

/**
 * Compute geometry info from content
 * @example
 * computeGeometry(50, 20, 10) // GeometryInfo
 */
export function computeGeometry(span: number, sag: number, camber: number): GeometryInfo {
  const isLevel = sag < 20
  const isPlumb = camber < 15
  return { span, sag, camber, isLevel, isPlumb }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a cable segment
 * @example
 * analyzeCableSegment('export function calc() { return 1 }', 'calc.ts') // CableSegment
 */
export function analyzeCableSegment(content: string, filePath: string): CableSegment {
  const loc = countLoc(content)
  const imports = countImports(content)
  const load = computeLoadAnalysis(content, filePath)
  const stress = computeStressAnalysis(content)

  const tension = Math.min(100, Math.round(
    imports * 10 +
    (stress.tensile * 0.4) +
    (load.loadRatio > 0.8 ? 20 : 0),
  ))

  const strength = Math.min(100, Math.max(0, Math.round(
    (countErrorHandling(content) > 0 ? 25 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 20 : maxNesting(content) <= 5 ? 10 : 0) +
    (countExports(content) > 0 ? 10 : 0) +
    (loc > 0 && loc <= 200 ? 10 : 0),
  )))

  const elasticity = Math.min(100, Math.max(0, Math.round(
    (countBranches(content) <= 5 ? 20 : 5) +
    (loc <= 150 ? 20 : loc <= 300 ? 10 : 0) +
    (countFunctions(content) > 0 ? 15 : 0) +
    (countImports(content) <= 3 ? 15 : 5) +
    (maxNesting(content) <= 3 ? 15 : 5) +
    (countErrorHandling(content) > 0 ? 15 : 0),
  )))

  const fatigue = detectFatigue(content)
  const material = classifyCableMaterial(content)

  const cableType = classifyCableType(imports, countExports(content))

  const connections = buildConnectionInfo(
    imports > 0 ? Array.from({ length: Math.min(imports, 5) }, (_, i) => `dep-${i}`) : [],
    countExports(content) > 0 ? Array.from({ length: Math.min(countExports(content), 5) }, (_, i) => `used-by-${i}`) : [],
    [],
  )

  const spanLen = Math.min(100, loc)
  const sag = Math.min(100, Math.round(
    (maxNesting(content) * 8) +
    (countBranches(content) * 3) +
    (load.isOverloaded ? 15 : 0),
  ))
  const camber = Math.min(100, Math.round(elasticity * 0.4 + (stress.isWithinLimits ? 20 : 5)))
  const geometry = computeGeometry(spanLen, sag, camber)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    strength * 0.3 +
    (100 - tension) * 0.15 +
    elasticity * 0.15 +
    (100 - fatigue) * 0.15 +
    (stress.isWithinLimits ? 15 : 0) +
    (geometry.isLevel ? 5 : 0) +
    (geometry.isPlumb ? 5 : 0),
  )))

  const condition = classifySegmentCondition(qualityScore)

  return {
    file: filePath, tension, strength, elasticity, fatigue,
    cableType, material, load, stress, connections, geometry,
    condition, qualityScore,
  }
}

// ─── Span Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a directory as a bridge span
 * @example
 * analyzeBridgeSpan(segments, 'src') // BridgeSpan
 */
export function analyzeBridgeSpan(segments: CableSegment[], dirPath: string): BridgeSpan {
  if (segments.length === 0) {
    return {
      directory: dirPath, segments: [], bridgeType: 'beam',
      totalSpan: 0, maxTowerHeight: 0, avgTension: 0, avgStrength: 0,
      maxLoadRatio: 0, overloadedCount: 0, criticalCount: 0,
      totalSafetyFactor: 100, isStructurallySound: true,
      hasSinglePointsOfFailure: false, swayFactor: 0,
      structuralHealth: 100, condition: 'sound',
    }
  }

  const n = segments.length
  const bridgeType = classifyBridgeType(segments)
  const totalSpan = segments.reduce((s, seg) => s + seg.geometry.span, 0)
  const maxTowerHeight = Math.max(...segments.map(seg => seg.strength))
  const avgTension = Math.round(segments.reduce((s, seg) => s + seg.tension, 0) / n)
  const avgStrength = Math.round(segments.reduce((s, seg) => s + seg.strength, 0) / n)
  const maxLoadRatio = Math.max(...segments.map(seg => seg.load.loadRatio))
  const overloadedCount = segments.filter(seg => seg.load.isOverloaded).length
  const criticalCount = segments.filter(seg => seg.condition === 'critical' || seg.condition === 'failed').length
  const totalSafetyFactor = Math.round((segments.reduce((s, seg) => s + seg.load.safetyFactor, 0) / n) * 100) / 100
  const hasSinglePointsOfFailure = segments.some(seg => seg.connections.hasSinglePointOfFailure)
  const swayFactor = Math.min(100, Math.round(
    (overloadedCount * 10) +
    (criticalCount * 15) +
    (avgTension * 0.3) +
    (segments.filter(seg => !seg.stress.isWithinLimits).length * 8),
  ))
  const structuralHealth = Math.min(100, Math.max(0, Math.round(
    avgStrength * 0.35 +
    (100 - avgTension) * 0.15 +
    (100 - swayFactor) * 0.25 +
    (totalSafetyFactor > 1 ? 15 : totalSafetyFactor * 15) +
    (criticalCount === 0 ? 10 : 0),
  )))

  const isStructurallySound = structuralHealth >= 50 && criticalCount < n * 0.5
  const condition = classifySpanCondition(structuralHealth)

  return {
    directory: dirPath, segments, bridgeType, totalSpan, maxTowerHeight,
    avgTension, avgStrength, maxLoadRatio, overloadedCount, criticalCount,
    totalSafetyFactor, isStructurallySound, hasSinglePointsOfFailure,
    swayFactor, structuralHealth, condition,
  }
}

// ─── SPOF Detection ──────────────────────────────────────────────────────────

/**
 * Identify single points of failure across segments
 * @example
 * identifySinglePointOfFailure(segments) // string[]
 */
export function identifySinglePointOfFailure(segments: CableSegment[]): string[] {
  return segments
    .filter(seg => seg.connections.hasSinglePointOfFailure || seg.load.safetyFactor < 0.5)
    .map(seg => seg.file)
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate bridge cable recommendations
 * @example
 * generateRecommendations(segments, spans, network, stats) // string[]
 */
export function generateRecommendations(
  segments: CableSegment[],
  spans: BridgeSpan[],
  network: BridgeNetwork,
  stats: BridgeCableStats,
): string[] {
  void segments
  void spans
  const recs: string[] = []

  if (stats.overloadedCount > 0) {
    recs.push(`Overloaded cables: ${stats.overloadedCount} segments exceed safe load capacity`)
  }

  if (stats.criticalCount > 0) {
    recs.push(`Critical segments: ${stats.criticalCount} cables need immediate attention`)
  }

  if (stats.failedCount > 0) {
    recs.push(`Failed cables: ${stats.failedCount} segments have collapsed`)
  }

  if (stats.stressCracksCount > 0) {
    recs.push(`Stress cracks: ${stats.stressCracksCount} segments show cracking under pressure`)
  }

  if (stats.corrosionCount > 0) {
    recs.push(`Corrosion: ${stats.corrosionCount} segments show code degradation`)
  }

  if (stats.singlePointsOfFailure > 0) {
    recs.push(`Single points of failure: ${stats.singlePointsOfFailure} segments have no redundancy`)
  }

  if (stats.ropeSegments > stats.totalFiles * 0.3) {
    recs.push(`Weak material: ${stats.ropeSegments} segments are rope-grade (lack type safety)`)
  }

  if (network.isStructurallySound) {
    recs.push('Structural assessment: bridge network is structurally sound')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete bridge cable result from files and contents
 * @example
 * buildBridgeCableResult(['a.ts'], ['export function a() {}'], {}) // BridgeCableResult
 */
export function buildBridgeCableResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): BridgeCableResult {
  void options

  const segments: CableSegment[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeCableSegment(content, file)
    } catch {
      return analyzeCableSegment('', file)
    }
  })

  const dirMap = new Map<string, CableSegment[]>()
  for (const seg of segments) {
    const dir = seg.file.includes('/') ? seg.file.slice(0, seg.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(seg) } else { dirMap.set(dir, [seg]) }
  }

  const spans: BridgeSpan[] = Array.from(dirMap.entries()).map(([dir, segs]) =>
    analyzeBridgeSpan(segs, dir),
  )

  const n = segments.length || 1
  const avgTension = Math.round(segments.reduce((s, seg) => s + seg.tension, 0) / n)
  const avgStrength = Math.round(segments.reduce((s, seg) => s + seg.strength, 0) / n)
  const avgLoadRatio = Math.round((segments.reduce((s, seg) => s + seg.load.loadRatio, 0) / n) * 100) / 100
  const maxLoadRatio = segments.length > 0 ? Math.max(...segments.map(seg => seg.load.loadRatio)) : 0
  const totalOverloaded = segments.filter(seg => seg.load.isOverloaded).length
  const totalCritical = segments.filter(seg => seg.condition === 'critical' || seg.condition === 'failed').length
  const hasFailures = segments.some(seg => seg.condition === 'failed')
  const overallSafetyFactor = Math.round((segments.reduce((s, seg) => s + seg.load.safetyFactor, 0) / n) * 100) / 100
  const isStructurallySound = avgStrength >= 40 && totalCritical < segments.length * 0.5

  const network: BridgeNetwork = {
    totalSpan: segments.reduce((s, seg) => s + seg.geometry.span, 0),
    avgTension, avgStrength, avgLoadRatio, maxLoadRatio,
    totalOverloaded, totalCritical, hasFailures,
    isStructurallySound, overallSafetyFactor,
  }

  const overallStructuralHealth = Math.min(100, Math.max(0, Math.round(
    avgStrength * 0.3 +
    (100 - avgTension) * 0.15 +
    (isStructurallySound ? 20 : 5) +
    (overallSafetyFactor > 1 ? 15 : overallSafetyFactor * 15) +
    (totalCritical === 0 ? 10 : 0) +
    (hasFailures ? -10 : 0) +
    Math.min(10, segments.filter(seg => seg.stress.isWithinLimits).length * 2),
  )))

  const stats: BridgeCableStats = {
    totalFiles: files.length,
    totalSpans: spans.length,
    avgTension,
    avgStrength,
    avgElasticity: Math.round(segments.reduce((s, seg) => s + seg.elasticity, 0) / n),
    avgFatigue: Math.round(segments.reduce((s, seg) => s + seg.fatigue, 0) / n),
    avgLoadRatio,
    avgSafetyFactor: overallSafetyFactor,
    mainCables: segments.filter(seg => seg.cableType === 'main-cable').length,
    stays: segments.filter(seg => seg.cableType === 'stays').length,
    towers: segments.filter(seg => seg.cableType === 'tower').length,
    anchorages: segments.filter(seg => seg.cableType === 'anchorage').length,
    steelSegments: segments.filter(seg => seg.material === 'steel').length,
    ropeSegments: segments.filter(seg => seg.material === 'rope').length,
    overloadedCount: totalOverloaded,
    criticalCount: totalCritical,
    failedCount: segments.filter(seg => seg.condition === 'failed').length,
    stressCracksCount: segments.filter(seg => seg.stress.hasStressCracks).length,
    fatigueSignsCount: segments.filter(seg => seg.stress.hasFatigueSigns).length,
    corrosionCount: segments.filter(seg => seg.stress.hasCorrosion).length,
    singlePointsOfFailure: identifySinglePointOfFailure(segments).length,
    overallStructuralHealth,
    engineerGrade: classifyEngineerGrade(overallStructuralHealth),
    strongestSegment: segments.length > 0
      ? segments.reduce((b, seg) => seg.strength > b.strength ? seg : b, segments[0] as typeof segments[number]).file : 'none',
    weakestSegment: segments.length > 0
      ? segments.reduce((b, seg) => seg.strength < b.strength ? seg : b, segments[0] as typeof segments[number]).file : 'none',
    heaviestLoad: segments.length > 0
      ? segments.reduce((b, seg) => seg.load.totalLoad > b.load.totalLoad ? seg : b, segments[0] as typeof segments[number]).file : 'none',
    mostRedundant: segments.length > 0
      ? segments.reduce((b, seg) => seg.connections.connectionCount > b.connections.connectionCount ? seg : b, segments[0] as typeof segments[number]).file : 'none',
    biggestSpan: spans.length > 0
      ? spans.reduce((b, sp) => sp.segments.length > b.segments.length ? sp : b, spans[0] as typeof spans[number]).directory : 'none',
  }

  const recommendations = generateRecommendations(segments, spans, network, stats)

  return { segments, spans, network, stats, recommendations }
}
