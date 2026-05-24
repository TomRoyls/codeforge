// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Luminosity grade */
export type LuminosityGrade =
  | 'blinding-neon'
  | 'bright-highway'
  | 'proper-glow'
  | 'dim-lights'
  | 'flickering'
  | 'dark-road'

/** Traffic flow */
export type TrafficFlow =
  | 'autobahn'
  | 'expressway'
  | 'highway'
  | 'city-street'
  | 'dirt-road'
  | 'gridlock'

/** Lane discipline */
export type LaneDiscipline =
  | 'perfect-lane'
  | 'proper-lane'
  | 'decent-lane'
  | 'wobbly-lane'
  | 'weaving'
  | 'wrong-way'

/** Signal quality */
export type SignalQuality =
  | 'green-wave'
  | 'clear-signals'
  | 'proper-signs'
  | 'flickering-signals'
  | 'mixed-signals'
  | 'no-signals'

/** Route efficiency */
export type RouteEfficiency =
  | 'optimal-path'
  | 'efficient-route'
  | 'proper-path'
  | 'detour'
  | 'scenic-route'
  | 'dead-end'

/** Neon condition */
export type NeonCondition =
  | 'neon-boulevard'
  | 'bright-highway'
  | 'lit-road'
  | 'dim-street'
  | 'dark-alley'
  | 'abandoned-road'

/** System type */
export type SystemType =
  | 'interstate'
  | 'state-highway'
  | 'county-road'
  | 'city-street'
  | 'dirt-road'
  | 'no-road'

/** System condition */
export type SystemCondition =
  | 'autobahn'
  | 'expressway'
  | 'highway'
  | 'local-road'
  | 'goat-path'
  | 'impassable'

/** Engineer grade */
export type EngineerGrade =
  | 'highway-engineer'
  | 'traffic-engineer'
  | 'road-designer'
  | 'surveyor'
  | 'apprentice'
  | 'pothole'

/** Illuminating measurement */
export interface IlluminatingMeasure {
  luminosity: number
  grade: LuminosityGrade
  hasHighLuminosity: boolean
  hasVisible: boolean
  hasClear: boolean
  hasNoObscured: boolean
  hasBright: boolean
  hasNoDark: boolean
  hasIlluminated: boolean
  hasNoHidden: boolean
  hasGlowing: boolean
  hasNoMurky: boolean
  hasRadiant: boolean
  obscuredCount: number
  darkCount: number
}

/** Flowing measurement */
export interface FlowingMeasure {
  quality: number
  flow: TrafficFlow
  hasHighQuality: boolean
  hasSmooth: boolean
  hasFluid: boolean
  hasNoJammed: boolean
  hasContinuous: boolean
  hasNoBlocked: boolean
  hasUninterrupted: boolean
  hasNoStalled: boolean
  hasStreaming: boolean
  hasNoCongested: boolean
  hasFlowing: boolean
  jammedCount: number
  blockedCount: number
}

/** Disciplining measurement */
export interface DiscipliningMeasure {
  discipline: number
  lane: LaneDiscipline
  hasHighDiscipline: boolean
  hasOrganized: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasOrdered: boolean
  hasNoMessy: boolean
  hasDisciplined: boolean
  hasNoHaphazard: boolean
  hasTidy: boolean
  hasNoScattered: boolean
  hasNeat: boolean
  chaoticCount: number
  messyCount: number
}

/** Signaling measurement */
export interface SignalingMeasure {
  quality: number
  signal: SignalQuality
  hasHighQuality: boolean
  hasClear: boolean
  hasCommunicative: boolean
  hasNoAmbiguous: boolean
  hasExplicit: boolean
  hasNoVague: boolean
  hasExpressive: boolean
  hasNoCryptic: boolean
  hasUnderstandable: boolean
  hasNoConfusing: boolean
  hasInformative: boolean
  ambiguousCount: number
  vagueCount: number
}

/** Routing measurement */
export interface RoutingMeasure {
  efficiency: number
  route: RouteEfficiency
  hasHighEfficiency: boolean
  hasDirect: boolean
  hasEfficient: boolean
  hasNoCircuitous: boolean
  hasStraightforward: boolean
  hasNoRoundabout: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  hasLean: boolean
  hasNoRedundant: boolean
  hasMinimal: boolean
  circuitousCount: number
  roundaboutCount: number
}

/** Single file analysis */
export interface HighwayNeon {
  file: string
  luminosity: number
  trafficFlow: number
  laneDiscipline: number
  signalQuality: number
  routeEfficiency: number
  illuminating: IlluminatingMeasure
  flowing: FlowingMeasure
  disciplining: DiscipliningMeasure
  signaling: SignalingMeasure
  routing: RoutingMeasure
  condition: NeonCondition
  qualityScore: number
}

/** Directory-level system */
export interface HighwaySystem {
  directory: string
  neons: HighwayNeon[]
  avgLuminosity: number
  avgFlow: number
  avgEfficiency: number
  neonBoulevardCount: number
  abandonedRoadCount: number
  systemType: SystemType
  condition: SystemCondition
}

/** Network summary */
export interface NetworkSummary {
  avgLuminosity: number
  avgFlow: number
  avgEfficiency: number
  isFlowing: boolean
  overallPerformance: number
}

/** Full stats */
export interface NeonHighwayStats {
  totalFiles: number
  totalSystems: number
  avgLuminosity: number
  avgTrafficFlow: number
  avgLaneDiscipline: number
  avgSignalQuality: number
  avgRouteEfficiency: number
  neonBoulevardCount: number
  brightHighwayCount: number
  litRoadCount: number
  dimStreetCount: number
  darkAlleyCount: number
  abandonedRoadCount: number
  hasHighLuminosityCount: number
  hasHighQualityCount: number
  hasHighDisciplineCount: number
  hasHighSignalCount: number
  hasHighEfficiencyCount: number
  overallPerformance: number
  engineerGrade: EngineerGrade
  bestNeon: string
  brightest: string
  smoothest: string
  mostDisciplined: string
  clearest: string
}

/** Full result */
export interface NeonHighwayResult {
  neons: HighwayNeon[]
  systems: HighwaySystem[]
  network: NetworkSummary
  stats: NeonHighwayStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure code luminosity
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.grade) // 'blinding-neon'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasVisible = hasExport(content) && hasImport(content)
  const hasClear = hasInterface(content) && hasClass(content)
  const hasBright = hasGenerics(content) && hasTypeAlias(content)
  const hasIlluminated = hasNamedExport(content) && hasReturnType(content)
  const hasGlowing = hasAsync(content) && hasDocComments(content)
  const hasRadiant = hasExport(content) && hasGenerics(content)

  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasBright ? 5 : 0
  score += hasIlluminated ? 5 : 0
  score += hasGlowing ? 5 : 0
  score += hasRadiant ? 5 : 0

  const luminosity = Math.min(score, 100)
  const obscuredCount = count(/\bvar\b/, content)
  const darkCount = count(/\bany\b/, content)

  const hasNoObscured = obscuredCount === 0
  const hasNoDark = darkCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoMurky = !has(/\bdebugger\b/, content)
  const hasHighLuminosity = luminosity >= 70

  let grade: LuminosityGrade
  if (luminosity >= 85) grade = 'blinding-neon'
  else if (luminosity >= 70) grade = 'bright-highway'
  else if (luminosity >= 55) grade = 'proper-glow'
  else if (luminosity >= 40) grade = 'dim-lights'
  else if (luminosity >= 25) grade = 'flickering'
  else grade = 'dark-road'

  return {
    luminosity, grade, hasHighLuminosity, hasVisible, hasClear, hasNoObscured,
    hasBright, hasNoDark, hasIlluminated, hasNoHidden, hasGlowing, hasNoMurky,
    hasRadiant, obscuredCount, darkCount,
  }
}

/**
 * Measure traffic flow
 * @example
 * const m = measureFlowing(content)
 * console.log(m.flow) // 'autobahn'
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0

  const hasSmooth = hasTryCatch(content) && hasAsync(content)
  const hasFluid = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasContinuous = hasStrictEq(content) && hasConst(content)
  const hasUninterrupted = hasReadonly(content) && hasReturnType(content)
  const hasStreaming = hasExport(content) && hasInterface(content)
  const hasFlowing = hasTryCatch(content) && hasConst(content)

  score += hasSmooth ? 5 : 0
  score += hasFluid ? 5 : 0
  score += hasContinuous ? 5 : 0
  score += hasUninterrupted ? 5 : 0
  score += hasStreaming ? 5 : 0
  score += hasFlowing ? 5 : 0

  const quality = Math.min(score, 100)
  const jammedCount = count(/\bvar\b/, content)
  const blockedCount = count(/\bany\b/, content)

  const hasNoJammed = jammedCount === 0
  const hasNoBlocked = blockedCount === 0
  const hasNoStalled = !has(/\beval\b/, content)
  const hasNoCongested = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let flow: TrafficFlow
  if (quality >= 85) flow = 'autobahn'
  else if (quality >= 70) flow = 'expressway'
  else if (quality >= 55) flow = 'highway'
  else if (quality >= 40) flow = 'city-street'
  else if (quality >= 25) flow = 'dirt-road'
  else flow = 'gridlock'

  return {
    quality, flow, hasHighQuality, hasSmooth, hasFluid, hasNoJammed,
    hasContinuous, hasNoBlocked, hasUninterrupted, hasNoStalled, hasStreaming,
    hasNoCongested, hasFlowing, jammedCount, blockedCount,
  }
}

/**
 * Measure lane discipline
 * @example
 * const m = measureDisciplining(content)
 * console.log(m.lane) // 'perfect-lane'
 */
export function measureDisciplining(content: string): DiscipliningMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasClass(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasOrganized = hasInterface(content) && hasGenerics(content)
  const hasStructured = hasClass(content) && hasPrivate(content)
  const hasOrdered = hasReadonly(content) && hasConst(content)
  const hasDisciplined = hasExport(content) && hasImport(content)
  const hasTidy = hasReturnType(content) && hasTypeAlias(content)
  const hasNeat = hasInterface(content) && hasClass(content)

  score += hasOrganized ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasDisciplined ? 5 : 0
  score += hasTidy ? 5 : 0
  score += hasNeat ? 5 : 0

  const discipline = Math.min(score, 100)
  const chaoticCount = count(/\bvar\b/, content)
  const messyCount = count(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoMessy = messyCount === 0
  const hasNoHaphazard = !has(/\beval\b/, content)
  const hasNoScattered = !has(/\bdebugger\b/, content)
  const hasHighDiscipline = discipline >= 70

  let lane: LaneDiscipline
  if (discipline >= 85) lane = 'perfect-lane'
  else if (discipline >= 70) lane = 'proper-lane'
  else if (discipline >= 55) lane = 'decent-lane'
  else if (discipline >= 40) lane = 'wobbly-lane'
  else if (discipline >= 25) lane = 'weaving'
  else lane = 'wrong-way'

  return {
    discipline, lane, hasHighDiscipline, hasOrganized, hasStructured, hasNoChaotic,
    hasOrdered, hasNoMessy, hasDisciplined, hasNoHaphazard, hasTidy, hasNoScattered,
    hasNeat, chaoticCount, messyCount,
  }
}

/**
 * Measure signal quality
 * @example
 * const m = measureSignaling(content)
 * console.log(m.signal) // 'green-wave'
 */
export function measureSignaling(content: string): SignalingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasClear = hasDocComments(content) && hasReturnType(content)
  const hasCommunicative = hasExport(content) && hasDocComments(content)
  const hasExplicit = hasInterface(content) && hasGenerics(content)
  const hasExpressive = hasNamedExport(content) && hasReturnType(content)
  const hasUnderstandable = hasConst(content) && hasTypeAlias(content)
  const hasInformative = hasClass(content) && hasDocComments(content)

  score += hasClear ? 5 : 0
  score += hasCommunicative ? 5 : 0
  score += hasExplicit ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasInformative ? 5 : 0

  const quality = Math.min(score, 100)
  const ambiguousCount = count(/\bvar\b/, content)
  const vagueCount = count(/\bany\b/, content)

  const hasNoAmbiguous = ambiguousCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoCryptic = !has(/\beval\b/, content)
  const hasNoConfusing = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let signal: SignalQuality
  if (quality >= 85) signal = 'green-wave'
  else if (quality >= 70) signal = 'clear-signals'
  else if (quality >= 55) signal = 'proper-signs'
  else if (quality >= 40) signal = 'flickering-signals'
  else if (quality >= 25) signal = 'mixed-signals'
  else signal = 'no-signals'

  return {
    quality, signal, hasHighQuality, hasClear, hasCommunicative, hasNoAmbiguous,
    hasExplicit, hasNoVague, hasExpressive, hasNoCryptic, hasUnderstandable,
    hasNoConfusing, hasInformative, ambiguousCount, vagueCount,
  }
}

/**
 * Measure route efficiency
 * @example
 * const m = measureRouting(content)
 * console.log(m.route) // 'optimal-path'
 */
export function measureRouting(content: string): RoutingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasDirect = hasExport(content) && hasImport(content)
  const hasEfficient = hasInterface(content) && hasClass(content)
  const hasStraightforward = hasGenerics(content) && hasTypeAlias(content)
  const hasOptimized = hasAsync(content) && hasNamedExport(content)
  const hasLean = hasReturnType(content) && hasConst(content)
  const hasMinimal = hasExport(content) && hasInterface(content)

  score += hasDirect ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasStraightforward ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasMinimal ? 5 : 0

  const efficiency = Math.min(score, 100)
  const circuitousCount = count(/\bvar\b/, content)
  const roundaboutCount = count(/\bany\b/, content)

  const hasNoCircuitous = circuitousCount === 0
  const hasNoRoundabout = roundaboutCount === 0
  const hasNoWasteful = !has(/\beval\b/, content)
  const hasNoRedundant = !has(/\bdebugger\b/, content)
  const hasHighEfficiency = efficiency >= 70

  let route: RouteEfficiency
  if (efficiency >= 85) route = 'optimal-path'
  else if (efficiency >= 70) route = 'efficient-route'
  else if (efficiency >= 55) route = 'proper-path'
  else if (efficiency >= 40) route = 'detour'
  else if (efficiency >= 25) route = 'scenic-route'
  else route = 'dead-end'

  return {
    efficiency, route, hasHighEfficiency, hasDirect, hasEfficient, hasNoCircuitous,
    hasStraightforward, hasNoRoundabout, hasOptimized, hasNoWasteful, hasLean,
    hasNoRedundant, hasMinimal, circuitousCount, roundaboutCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify neon condition
 * @example
 * classifyNeonCondition(90) // 'neon-boulevard'
 */
export function classifyNeonCondition(score: number): NeonCondition {
  if (score >= 85) return 'neon-boulevard'
  if (score >= 70) return 'bright-highway'
  if (score >= 55) return 'lit-road'
  if (score >= 40) return 'dim-street'
  if (score >= 25) return 'dark-alley'
  return 'abandoned-road'
}

/**
 * Classify system type
 * @example
 * classifySystemType(neons) // 'interstate'
 */
export function classifySystemType(neons: HighwayNeon[]): SystemType {
  if (neons.length === 0) return 'no-road'
  const avgQs = Math.round(neons.reduce((s, n) => s + n.qualityScore, 0) / neons.length)
  const neonRatio = neons.filter(n => n.condition === 'neon-boulevard').length / neons.length
  if (avgQs >= 75 && neonRatio >= 0.5) return 'interstate'
  if (avgQs >= 60) return 'state-highway'
  if (avgQs >= 45) return 'county-road'
  if (avgQs >= 30) return 'city-street'
  if (avgQs >= 15) return 'dirt-road'
  return 'no-road'
}

/**
 * Classify engineer grade
 * @example
 * classifyEngineerGrade(85) // 'highway-engineer'
 */
export function classifyEngineerGrade(avgPerformance: number): EngineerGrade {
  if (avgPerformance >= 80) return 'highway-engineer'
  if (avgPerformance >= 65) return 'traffic-engineer'
  if (avgPerformance >= 50) return 'road-designer'
  if (avgPerformance >= 35) return 'surveyor'
  if (avgPerformance >= 20) return 'apprentice'
  return 'pothole'
}

/**
 * Classify system condition
 * @example
 * classifySystemCondition(80) // 'autobahn'
 */
export function classifySystemCondition(avgQs: number): SystemCondition {
  if (avgQs >= 75) return 'autobahn'
  if (avgQs >= 60) return 'expressway'
  if (avgQs >= 45) return 'highway'
  if (avgQs >= 30) return 'local-road'
  if (avgQs >= 15) return 'goat-path'
  return 'impassable'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(neons, systems, network, stats)
 */
export function generateRecommendations(
  neons: HighwayNeon[],
  systems: HighwaySystem[],
  network: NetworkSummary,
  stats: NeonHighwayStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLuminosity < 50) {
    recs.push('Brighten code luminosity with clear documentation, visible exports, and illuminating type signatures')
  }
  if (stats.avgTrafficFlow < 50) {
    recs.push('Improve traffic flow with robust error handling, optional chaining, and smooth async patterns')
  }
  if (stats.avgLaneDiscipline < 50) {
    recs.push('Strengthen lane discipline with organized interfaces, structured classes, and ordered imports')
  }
  if (stats.avgSignalQuality < 50) {
    recs.push('Enhance signal quality with clear documentation, expressive return types, and communicative exports')
  }
  if (stats.avgRouteEfficiency < 50) {
    recs.push('Optimize route efficiency with direct imports, efficient interfaces, and streamlined paths')
  }
  if (stats.abandonedRoadCount > 0) {
    recs.push(`${stats.abandonedRoadCount} file(s) are abandoned roads — consider significant refactoring`)
  }
  if (network.overallPerformance < 40) {
    recs.push('Overall network performance is low — focus on luminosity and traffic flow')
  }
  const allDead = systems.every(s => s.systemType === 'no-road' || s.systemType === 'dirt-road')
  if (allDead && systems.length > 0) {
    recs.push('All road systems are dark — consider a major infrastructure overhaul')
  }
  const dead = neons.filter(n => n.condition === 'abandoned-road').map(n => n.file)
  if (dead.length > 0 && dead.length <= 3) {
    recs.push(`Illuminate these dark roads: ${dead.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your neon highway is a masterpiece! Every road glows with purpose and efficiency')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a highway neon
 * @example
 * const neon = analyzeHighwayNeon(content, 'index.ts')
 * console.log(neon.condition) // 'neon-boulevard'
 */
export function analyzeHighwayNeon(content: string, filePath: string): HighwayNeon {
  const illuminating = measureIlluminating(content)
  const flowing = measureFlowing(content)
  const disciplining = measureDisciplining(content)
  const signaling = measureSignaling(content)
  const routing = measureRouting(content)

  const qualityScore = Math.round(
    illuminating.luminosity * 0.2 +
    flowing.quality * 0.2 +
    disciplining.discipline * 0.2 +
    signaling.quality * 0.2 +
    routing.efficiency * 0.2,
  )

  return {
    file: filePath,
    luminosity: illuminating.luminosity,
    trafficFlow: flowing.quality,
    laneDiscipline: disciplining.discipline,
    signalQuality: signaling.quality,
    routeEfficiency: routing.efficiency,
    illuminating,
    flowing,
    disciplining,
    signaling,
    routing,
    condition: classifyNeonCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a highway system
 * @example
 * const system = analyzeHighwaySystem(neons, 'src')
 * console.log(system.systemType) // 'interstate'
 */
export function analyzeHighwaySystem(neons: HighwayNeon[], dirPath: string): HighwaySystem {
  if (neons.length === 0) {
    return {
      directory: dirPath, neons: [], avgLuminosity: 0, avgFlow: 0, avgEfficiency: 0,
      neonBoulevardCount: 0, abandonedRoadCount: 0, systemType: 'no-road', condition: 'impassable',
    }
  }

  const avgLuminosity = Math.round(neons.reduce((s, n) => s + n.luminosity, 0) / neons.length)
  const avgFlow = Math.round(neons.reduce((s, n) => s + n.trafficFlow, 0) / neons.length)
  const avgEfficiency = Math.round(neons.reduce((s, n) => s + n.routeEfficiency, 0) / neons.length)
  const neonBoulevardCount = neons.filter(n => n.condition === 'neon-boulevard').length
  const abandonedRoadCount = neons.filter(n => n.condition === 'abandoned-road').length
  const avgQs = Math.round(neons.reduce((s, n) => s + n.qualityScore, 0) / neons.length)

  return {
    directory: dirPath, neons, avgLuminosity, avgFlow, avgEfficiency,
    neonBoulevardCount, abandonedRoadCount, systemType: classifySystemType(neons),
    condition: classifySystemCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete neon highway result
 * @example
 * const result = await buildNeonHighwayResult(files, contents)
 * console.log(result.stats.engineerGrade) // 'highway-engineer'
 */
export async function buildNeonHighwayResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<NeonHighwayResult> {
  const neons = files.map((file, i) => analyzeHighwayNeon(contents[i] ?? '', file))

  const dirMap = new Map<string, HighwayNeon[]>()
  for (const neon of neons) {
    const dir = path.dirname(neon.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(neon) } else { dirMap.set(dir, [neon]) }
  }

  const systems = Array.from(dirMap.entries()).map(([dir, dirNeons]) =>
    analyzeHighwaySystem(dirNeons, dir),
  )

  const avgLuminosity = neons.length > 0
    ? Math.round(neons.reduce((s, n) => s + n.luminosity, 0) / neons.length) : 0
  const avgFlow = neons.length > 0
    ? Math.round(neons.reduce((s, n) => s + n.trafficFlow, 0) / neons.length) : 0
  const avgEfficiency = neons.length > 0
    ? Math.round(neons.reduce((s, n) => s + n.routeEfficiency, 0) / neons.length) : 0

  const overallPerformance = neons.length > 0
    ? Math.round((avgLuminosity + avgFlow + avgEfficiency) / 3) : 0
  const isFlowing = avgFlow >= 60

  const network: NetworkSummary = { avgLuminosity, avgFlow, avgEfficiency, isFlowing, overallPerformance }

  const avgTrafficFlow = avgFlow
  const avgLaneDiscipline = neons.length > 0
    ? Math.round(neons.reduce((s, n) => s + n.laneDiscipline, 0) / neons.length) : 0
  const avgSignalQuality = neons.length > 0
    ? Math.round(neons.reduce((s, n) => s + n.signalQuality, 0) / neons.length) : 0
  const avgRouteEfficiency = avgEfficiency

  const bestNeon = neons.length > 0
    ? neons.reduce((best, n) => n.qualityScore > best.qualityScore ? n : best).file : ''
  const brightest = neons.length > 0
    ? neons.reduce((best, n) => n.luminosity > best.luminosity ? n : best).file : ''
  const smoothest = neons.length > 0
    ? neons.reduce((best, n) => n.trafficFlow > best.trafficFlow ? n : best).file : ''
  const mostDisciplined = neons.length > 0
    ? neons.reduce((best, n) => n.laneDiscipline > best.laneDiscipline ? n : best).file : ''
  const clearest = neons.length > 0
    ? neons.reduce((best, n) => n.signalQuality > best.signalQuality ? n : best).file : ''

  const stats: NeonHighwayStats = {
    totalFiles: neons.length,
    totalSystems: systems.length,
    avgLuminosity,
    avgTrafficFlow,
    avgLaneDiscipline,
    avgSignalQuality,
    avgRouteEfficiency,
    neonBoulevardCount: neons.filter(n => n.condition === 'neon-boulevard').length,
    brightHighwayCount: neons.filter(n => n.condition === 'bright-highway').length,
    litRoadCount: neons.filter(n => n.condition === 'lit-road').length,
    dimStreetCount: neons.filter(n => n.condition === 'dim-street').length,
    darkAlleyCount: neons.filter(n => n.condition === 'dark-alley').length,
    abandonedRoadCount: neons.filter(n => n.condition === 'abandoned-road').length,
    hasHighLuminosityCount: neons.filter(n => n.illuminating.hasHighLuminosity).length,
    hasHighQualityCount: neons.filter(n => n.flowing.hasHighQuality).length,
    hasHighDisciplineCount: neons.filter(n => n.disciplining.hasHighDiscipline).length,
    hasHighSignalCount: neons.filter(n => n.signaling.hasHighQuality).length,
    hasHighEfficiencyCount: neons.filter(n => n.routing.hasHighEfficiency).length,
    overallPerformance,
    engineerGrade: classifyEngineerGrade(overallPerformance),
    bestNeon, brightest, smoothest, mostDisciplined, clearest,
  }

  const recommendations = generateRecommendations(neons, systems, network, stats)

  return { neons, systems, network, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
