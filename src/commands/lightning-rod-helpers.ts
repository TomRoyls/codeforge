// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Conduction grade for a file */
export type ConductionGrade =
  | 'superconductor'
  | 'high-conductor'
  | 'proper-conductor'
  | 'semiconductor'
  | 'resistor'
  | 'insulator'

/** Grounding system for a file */
export type GroundingSystem =
  | 'deep-ground'
  | 'solid-ground'
  | 'proper-ground'
  | 'shallow-ground'
  | 'floating-ground'
  | 'no-ground'

/** Spark quality level for a file */
export type SparkLevel =
  | 'lightning-strike'
  | 'strong-spark'
  | 'proper-spark'
  | 'weak-spark'
  | 'flicker'
  | 'dead-circuit'

/** Surge protection shield for a file */
export type ProtectionShield =
  | 'faraday-cage'
  | 'surge-protector'
  | 'circuit-breaker'
  | 'fuse'
  | 'bare-wire'
  | 'no-protection'

/** Voltage stability level for a file */
export type VoltageLevel =
  | 'rock-steady'
  | 'regulated'
  | 'proper-voltage'
  | 'fluctuating'
  | 'spiking'
  | 'brownout'

/** Overall electrical rod condition */
export type RodCondition =
  | 'power-plant'
  | 'power-station'
  | 'transformer'
  | 'junction-box'
  | 'extension-cord'
  | 'dead-wire'

/** Grid type classification */
export type GridType =
  | 'national-grid'
  | 'city-grid'
  | 'neighborhood'
  | 'home-wiring'
  | 'extension-cord-grid'
  | 'no-grid'

/** Grid condition classification */
export type GridCondition =
  | 'ultra-reliable'
  | 'reliable'
  | 'adequate'
  | 'unreliable'
  | 'dangerous'
  | 'offline'

/** Engineer grade classification */
export type EngineerGrade =
  | 'chief-engineer'
  | 'senior-electrician'
  | 'journeyman'
  | 'apprentice'
  | 'hobbyist'
  | 'short-circuit'

/** Conducting measurement for a file */
export interface ConductingMeasure {
  quality: number
  grade: ConductionGrade
  hasHighQuality: boolean
  hasEfficient: boolean
  hasFlowing: boolean
  hasNoBlockage: boolean
  hasConductive: boolean
  hasNoResistance: boolean
  hasSmooth: boolean
  hasNoBottleneck: boolean
  hasRapid: boolean
  hasNoSluggish: boolean
  hasOptimal: boolean
  blockageCount: number
  resistanceCount: number
}

/** Grounding measurement for a file */
export interface GroundingMeasure {
  groundedness: number
  system: GroundingSystem
  hasHighGroundedness: boolean
  hasStable: boolean
  hasFirm: boolean
  hasNoWobbly: boolean
  hasSecure: boolean
  hasNoFloating: boolean
  hasAnchored: boolean
  hasNoDrifting: boolean
  hasRooted: boolean
  hasNoUnstable: boolean
  hasFixed: boolean
  wobblyCount: number
  floatingCount: number
}

/** Sparking measurement for a file */
export interface SparkingMeasure {
  quality: number
  spark: SparkLevel
  hasHighQuality: boolean
  hasInnovative: boolean
  hasCreative: boolean
  hasNoStale: boolean
  hasFresh: boolean
  hasNoDerivative: boolean
  hasClever: boolean
  hasNoDull: boolean
  hasBrilliant: boolean
  hasNoDim: boolean
  hasOriginal: boolean
  staleCount: number
  derivativeCount: number
}

/** Protecting measurement for a file */
export interface ProtectingMeasure {
  protection: number
  shield: ProtectionShield
  hasHighProtection: boolean
  hasSafe: boolean
  hasGuarded: boolean
  hasNoVulnerable: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasShielded: boolean
  hasNoUnguarded: boolean
  hasResilient: boolean
  hasNoFragile: boolean
  hasDefended: boolean
  vulnerableCount: number
  exposedCount: number
}

/** Stabilizing measurement for a file */
export interface StabilizingMeasure {
  stability: number
  voltage: VoltageLevel
  hasHighStability: boolean
  hasConsistent: boolean
  hasSteady: boolean
  hasNoFluctuation: boolean
  hasReliable: boolean
  hasNoSpiking: boolean
  hasUniform: boolean
  hasNoDropping: boolean
  hasEven: boolean
  hasNoIrregular: boolean
  hasPredictable: boolean
  fluctuationCount: number
  spikingCount: number
}

/** Single file analysis result */
export interface ElectricalRod {
  file: string
  conductionQuality: number
  groundedness: number
  sparkQuality: number
  surgeProtection: number
  voltageStability: number
  conducting: ConductingMeasure
  grounding: GroundingMeasure
  sparking: SparkingMeasure
  protecting: ProtectingMeasure
  stabilizing: StabilizingMeasure
  condition: RodCondition
  qualityScore: number
}

/** Directory-level grid result */
export interface PowerGrid {
  directory: string
  rods: ElectricalRod[]
  avgConduction: number
  avgGrounding: number
  avgStability: number
  powerPlantCount: number
  deadWireCount: number
  gridType: GridType
  condition: GridCondition
}

/** Network-level summary */
export interface LightningNetwork {
  avgConduction: number
  avgGrounding: number
  avgStability: number
  isPowered: boolean
  overallPower: number
}

/** Full analysis stats */
export interface LightningRodStats {
  totalFiles: number
  totalGrids: number
  avgConductionQuality: number
  avgGroundedness: number
  avgSparkQuality: number
  avgSurgeProtection: number
  avgVoltageStability: number
  powerPlantCount: number
  powerStationCount: number
  transformerCount: number
  junctionBoxCount: number
  extensionCordCount: number
  deadWireCount: number
  hasHighQualityCount: number
  hasHighGroundednessCount: number
  hasHighSparkCount: number
  hasHighProtectionCount: number
  hasHighStabilityCount: number
  overallPower: number
  engineerGrade: EngineerGrade
  bestRod: string
  bestConductor: string
  mostGrounded: string
  brightestSpark: string
  safestCircuit: string
}

/** Full analysis result */
export interface LightningRodResult {
  rods: ElectricalRod[]
  grids: PowerGrid[]
  network: LightningNetwork
  stats: LightningRodStats
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
const hasTypeAnnotation = (c: string) => has(/:\s*(?:string|number|boolean|void)\b/, c)
const hasDefaultParam = (c: string) => has(/\w+\s*=\s*[^=]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure conduction quality of code
 * @example
 * const m = measureConducting(content)
 * console.log(m.grade) // 'superconductor'
 */
export function measureConducting(content: string): ConductingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0

  const hasEfficient = hasExport(content) && hasImport(content)
  const hasFlowing = hasReturnType(content) && hasConst(content)
  const hasConductive = hasGenerics(content) && hasAsync(content)
  const hasSmooth = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasRapid = hasNamedExport(content) && hasReturnType(content)
  const hasOptimal = hasExport(content) && hasConst(content)

  score += hasEfficient ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasConductive ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasRapid ? 5 : 0
  score += hasOptimal ? 5 : 0

  const quality = Math.min(score, 100)
  const blockageCount = count(/\bvar\b/, content)
  const resistanceCount = count(/\bany\b/, content)

  const hasNoBlockage = blockageCount === 0
  const hasNoResistance = resistanceCount === 0
  const hasNoBottleneck = !has(/\beval\b/, content)
  const hasNoSluggish = !has(/\bdebugger\b/, content)

  const hasHighQuality = quality >= 70

  let grade: ConductionGrade
  if (quality >= 85) grade = 'superconductor'
  else if (quality >= 70) grade = 'high-conductor'
  else if (quality >= 55) grade = 'proper-conductor'
  else if (quality >= 40) grade = 'semiconductor'
  else if (quality >= 25) grade = 'resistor'
  else grade = 'insulator'

  return {
    quality,
    grade,
    hasHighQuality,
    hasEfficient,
    hasFlowing,
    hasNoBlockage,
    hasConductive,
    hasNoResistance,
    hasSmooth,
    hasNoBottleneck,
    hasRapid,
    hasNoSluggish,
    hasOptimal,
    blockageCount,
    resistanceCount,
  }
}

/**
 * Measure grounding stability of code
 * @example
 * const m = measureGrounding(content)
 * console.log(m.system) // 'deep-ground'
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0

  const hasStable = hasInterface(content) && hasReadonly(content)
  const hasFirm = hasGenerics(content) && hasTypeAlias(content)
  const hasSecure = hasPrivate(content) && hasReadonly(content)
  const hasAnchored = hasExport(content) && hasDocComments(content)
  const hasRooted = hasStrictEq(content) && hasConst(content)
  const hasFixed = hasReturnType(content) && hasInterface(content)

  score += hasStable ? 5 : 0
  score += hasFirm ? 5 : 0
  score += hasSecure ? 5 : 0
  score += hasAnchored ? 5 : 0
  score += hasRooted ? 5 : 0
  score += hasFixed ? 5 : 0

  const groundedness = Math.min(score, 100)
  const wobblyCount = count(/\bvar\b/, content)
  const floatingCount = count(/\bany\b/, content)

  const hasNoWobbly = wobblyCount === 0
  const hasNoFloating = floatingCount === 0
  const hasNoDrifting = !has(/\beval\b/, content)
  const hasNoUnstable = !has(/\bdebugger\b/, content)

  const hasHighGroundedness = groundedness >= 70

  let system: GroundingSystem
  if (groundedness >= 85) system = 'deep-ground'
  else if (groundedness >= 70) system = 'solid-ground'
  else if (groundedness >= 55) system = 'proper-ground'
  else if (groundedness >= 40) system = 'shallow-ground'
  else if (groundedness >= 25) system = 'floating-ground'
  else system = 'no-ground'

  return {
    groundedness,
    system,
    hasHighGroundedness,
    hasStable,
    hasFirm,
    hasNoWobbly,
    hasSecure,
    hasNoFloating,
    hasAnchored,
    hasNoDrifting,
    hasRooted,
    hasNoUnstable,
    hasFixed,
    wobblyCount,
    floatingCount,
  }
}

/**
 * Measure spark quality of code
 * @example
 * const m = measureSparking(content)
 * console.log(m.spark) // 'lightning-strike'
 */
export function measureSparking(content: string): SparkingMeasure {
  let score = 0
  score += hasGenerics(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasInnovative = hasGenerics(content) && hasTypeAlias(content)
  const hasCreative = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasFresh = hasImport(content) && hasExport(content)
  const hasClever = hasInterface(content) && hasClass(content)
  const hasBrilliant = hasAsync(content) && hasDocComments(content)
  const hasOriginal = hasGenerics(content) && hasClass(content)

  score += hasInnovative ? 5 : 0
  score += hasCreative ? 5 : 0
  score += hasFresh ? 5 : 0
  score += hasClever ? 5 : 0
  score += hasBrilliant ? 5 : 0
  score += hasOriginal ? 5 : 0

  const quality = Math.min(score, 100)
  const staleCount = count(/\bvar\b/, content)
  const derivativeCount = count(/\bany\b/, content)

  const hasNoStale = staleCount === 0
  const hasNoDerivative = derivativeCount === 0
  const hasNoDull = !has(/\beval\b/, content)
  const hasNoDim = !has(/\bdebugger\b/, content)

  const hasHighQuality = quality >= 70

  let spark: SparkLevel
  if (quality >= 85) spark = 'lightning-strike'
  else if (quality >= 70) spark = 'strong-spark'
  else if (quality >= 55) spark = 'proper-spark'
  else if (quality >= 40) spark = 'weak-spark'
  else if (quality >= 25) spark = 'flicker'
  else spark = 'dead-circuit'

  return {
    quality,
    spark,
    hasHighQuality,
    hasInnovative,
    hasCreative,
    hasNoStale,
    hasFresh,
    hasNoDerivative,
    hasClever,
    hasNoDull,
    hasBrilliant,
    hasNoDim,
    hasOriginal,
    staleCount,
    derivativeCount,
  }
}

/**
 * Measure surge protection of code
 * @example
 * const m = measureProtecting(content)
 * console.log(m.shield) // 'faraday-cage'
 */
export function measureProtecting(content: string): ProtectingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasConst(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasSafe = hasTryCatch(content) && hasAsync(content)
  const hasGuarded = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasProtected = hasStrictEq(content) && hasConst(content)
  const hasShielded = hasInterface(content) && hasReadonly(content)
  const hasResilient = hasReturnType(content) && hasTryCatch(content)
  const hasDefended = hasExport(content) && hasConst(content)

  score += hasSafe ? 5 : 0
  score += hasGuarded ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasShielded ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasDefended ? 5 : 0

  const protection = Math.min(score, 100)
  const vulnerableCount = count(/\bvar\b/, content)
  const exposedCount = count(/\bany\b/, content)

  const hasNoVulnerable = vulnerableCount === 0
  const hasNoExposed = exposedCount === 0
  const hasNoUnguarded = !has(/\beval\b/, content)
  const hasNoFragile = !has(/\bdebugger\b/, content)

  const hasHighProtection = protection >= 70

  let shield: ProtectionShield
  if (protection >= 85) shield = 'faraday-cage'
  else if (protection >= 70) shield = 'surge-protector'
  else if (protection >= 55) shield = 'circuit-breaker'
  else if (protection >= 40) shield = 'fuse'
  else if (protection >= 25) shield = 'bare-wire'
  else shield = 'no-protection'

  return {
    protection,
    shield,
    hasHighProtection,
    hasSafe,
    hasGuarded,
    hasNoVulnerable,
    hasProtected,
    hasNoExposed,
    hasShielded,
    hasNoUnguarded,
    hasResilient,
    hasNoFragile,
    hasDefended,
    vulnerableCount,
    exposedCount,
  }
}

/**
 * Measure voltage stability of code
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.voltage) // 'rock-steady'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAnnotation(content) ? 8 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0

  const hasConsistent = hasExport(content) && hasConst(content)
  const hasSteady = hasReturnType(content) && hasStrictEq(content)
  const hasReliable = hasInterface(content) && hasTypeAlias(content)
  const hasUniform = hasNamedExport(content) && hasTypeAnnotation(content)
  const hasEven = hasReadonly(content) && hasDefaultParam(content)
  const hasPredictable = hasExport(content) && hasReturnType(content)

  score += hasConsistent ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasUniform ? 5 : 0
  score += hasEven ? 5 : 0
  score += hasPredictable ? 5 : 0

  const stability = Math.min(score, 100)
  const fluctuationCount = count(/\bvar\b/, content)
  const spikingCount = count(/\bany\b/, content)

  const hasNoFluctuation = fluctuationCount === 0
  const hasNoSpiking = spikingCount === 0
  const hasNoDropping = !has(/\beval\b/, content)
  const hasNoIrregular = !has(/\bdebugger\b/, content)

  const hasHighStability = stability >= 70

  let voltage: VoltageLevel
  if (stability >= 85) voltage = 'rock-steady'
  else if (stability >= 70) voltage = 'regulated'
  else if (stability >= 55) voltage = 'proper-voltage'
  else if (stability >= 40) voltage = 'fluctuating'
  else if (stability >= 25) voltage = 'spiking'
  else voltage = 'brownout'

  return {
    stability,
    voltage,
    hasHighStability,
    hasConsistent,
    hasSteady,
    hasNoFluctuation,
    hasReliable,
    hasNoSpiking,
    hasUniform,
    hasNoDropping,
    hasEven,
    hasNoIrregular,
    hasPredictable,
    fluctuationCount,
    spikingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify overall rod condition based on quality score
 * @example
 * classifyRodCondition(90) // 'power-plant'
 */
export function classifyRodCondition(score: number): RodCondition {
  if (score >= 85) return 'power-plant'
  if (score >= 70) return 'power-station'
  if (score >= 55) return 'transformer'
  if (score >= 40) return 'junction-box'
  if (score >= 25) return 'extension-cord'
  return 'dead-wire'
}

/**
 * Classify grid type based on rods
 * @example
 * classifyGridType(rods) // 'national-grid'
 */
export function classifyGridType(rods: ElectricalRod[]): GridType {
  if (rods.length === 0) return 'no-grid'
  const avgQs = Math.round(rods.reduce((s, r) => s + r.qualityScore, 0) / rods.length)
  const powerPlantRatio = rods.filter(r => r.condition === 'power-plant').length / rods.length
  if (avgQs >= 75 && powerPlantRatio >= 0.5) return 'national-grid'
  if (avgQs >= 60) return 'city-grid'
  if (avgQs >= 45) return 'neighborhood'
  if (avgQs >= 30) return 'home-wiring'
  if (avgQs >= 15) return 'extension-cord-grid'
  return 'no-grid'
}

/**
 * Classify engineer grade based on overall power
 * @example
 * classifyEngineerGrade(85) // 'chief-engineer'
 */
export function classifyEngineerGrade(avgPower: number): EngineerGrade {
  if (avgPower >= 80) return 'chief-engineer'
  if (avgPower >= 65) return 'senior-electrician'
  if (avgPower >= 50) return 'journeyman'
  if (avgPower >= 35) return 'apprentice'
  if (avgPower >= 20) return 'hobbyist'
  return 'short-circuit'
}

/**
 * Classify grid condition based on average quality score
 * @example
 * classifyGridCondition(80) // 'ultra-reliable'
 */
export function classifyGridCondition(avgQs: number): GridCondition {
  if (avgQs >= 75) return 'ultra-reliable'
  if (avgQs >= 60) return 'reliable'
  if (avgQs >= 45) return 'adequate'
  if (avgQs >= 30) return 'unreliable'
  if (avgQs >= 15) return 'dangerous'
  return 'offline'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate actionable recommendations based on analysis
 * @example
 * generateRecommendations(rods, grids, network, stats)
 */
export function generateRecommendations(
  rods: ElectricalRod[],
  grids: PowerGrid[],
  network: LightningNetwork,
  stats: LightningRodStats,
): string[] {
  const recs: string[] = []
  if (stats.avgConductionQuality < 50) {
    recs.push('Improve conduction with clean exports, efficient flow patterns, and smooth data channels')
  }
  if (stats.avgGroundedness < 50) {
    recs.push('Strengthen grounding with stable foundations, firm types, and secure abstractions')
  }
  if (stats.avgSparkQuality < 50) {
    recs.push('Boost spark quality with innovative generics, creative type compositions, and fresh patterns')
  }
  if (stats.avgSurgeProtection < 50) {
    recs.push('Enhance surge protection with robust error handling, safe operations, and guarded flows')
  }
  if (stats.avgVoltageStability < 50) {
    recs.push('Stabilize voltage with consistent patterns, steady types, and predictable structures')
  }
  if (stats.deadWireCount > 0) {
    recs.push(`${stats.deadWireCount} file(s) are dead wires — consider significant refactoring`)
  }
  if (network.overallPower < 40) {
    recs.push('Overall power is low — focus on conduction quality and grounding stability')
  }
  const allOffline = grids.every(g => g.gridType === 'no-grid' || g.gridType === 'extension-cord-grid')
  if (allOffline && grids.length > 0) {
    recs.push('All power grids are offline — consider a major quality improvement effort')
  }
  const deadWires = rods.filter(r => r.condition === 'dead-wire').map(r => r.file)
  if (deadWires.length > 0 && deadWires.length <= 3) {
    recs.push(`Repair these dead-wire files: ${deadWires.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your lightning rod system is fully powered! Every circuit conducts with excellence')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as an electrical rod
 * @example
 * const rod = analyzeElectricalRod(content, 'index.ts')
 * console.log(rod.condition) // 'power-plant'
 */
export function analyzeElectricalRod(content: string, filePath: string): ElectricalRod {
  const conducting = measureConducting(content)
  const grounding = measureGrounding(content)
  const sparking = measureSparking(content)
  const protecting = measureProtecting(content)
  const stabilizing = measureStabilizing(content)

  const qualityScore = Math.round(
    conducting.quality * 0.2 +
    grounding.groundedness * 0.2 +
    sparking.quality * 0.2 +
    protecting.protection * 0.2 +
    stabilizing.stability * 0.2,
  )

  return {
    file: filePath,
    conductionQuality: conducting.quality,
    groundedness: grounding.groundedness,
    sparkQuality: sparking.quality,
    surgeProtection: protecting.protection,
    voltageStability: stabilizing.stability,
    conducting,
    grounding,
    sparking,
    protecting,
    stabilizing,
    condition: classifyRodCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a power grid
 * @example
 * const grid = analyzePowerGrid(rods, 'src')
 * console.log(grid.gridType) // 'national-grid'
 */
export function analyzePowerGrid(rods: ElectricalRod[], dirPath: string): PowerGrid {
  if (rods.length === 0) {
    return {
      directory: dirPath,
      rods: [],
      avgConduction: 0,
      avgGrounding: 0,
      avgStability: 0,
      powerPlantCount: 0,
      deadWireCount: 0,
      gridType: 'no-grid',
      condition: 'offline',
    }
  }

  const avgConduction = Math.round(rods.reduce((s, r) => s + r.conductionQuality, 0) / rods.length)
  const avgGrounding = Math.round(rods.reduce((s, r) => s + r.groundedness, 0) / rods.length)
  const avgStability = Math.round(rods.reduce((s, r) => s + r.voltageStability, 0) / rods.length)
  const powerPlantCount = rods.filter(r => r.condition === 'power-plant').length
  const deadWireCount = rods.filter(r => r.condition === 'dead-wire').length
  const gridType = classifyGridType(rods)
  const avgQs = Math.round(rods.reduce((s, r) => s + r.qualityScore, 0) / rods.length)

  return {
    directory: dirPath,
    rods,
    avgConduction,
    avgGrounding,
    avgStability,
    powerPlantCount,
    deadWireCount,
    gridType,
    condition: classifyGridCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete lightning rod analysis result
 * @example
 * const result = buildLightningRodResult(files, contents)
 * console.log(result.stats.engineerGrade) // 'chief-engineer'
 */
export async function buildLightningRodResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<LightningRodResult> {
  const rods = files.map((file, i) => analyzeElectricalRod(contents[i] ?? '', file))

  // Group by directory
  const dirMap = new Map<string, ElectricalRod[]>()
  for (const rod of rods) {
    const dir = path.dirname(rod.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(rod)
    } else {
      dirMap.set(dir, [rod])
    }
  }

  const grids = Array.from(dirMap.entries()).map(([dir, dirRods]) =>
    analyzePowerGrid(dirRods, dir),
  )

  const avgConduction = rods.length > 0
    ? Math.round(rods.reduce((s, r) => s + r.conductionQuality, 0) / rods.length)
    : 0
  const avgGrounding = rods.length > 0
    ? Math.round(rods.reduce((s, r) => s + r.groundedness, 0) / rods.length)
    : 0
  const avgStability = rods.length > 0
    ? Math.round(rods.reduce((s, r) => s + r.voltageStability, 0) / rods.length)
    : 0

  const overallPower = rods.length > 0
    ? Math.round((avgConduction + avgGrounding + avgStability) / 3)
    : 0
  const isPowered = avgConduction >= 60

  const network: LightningNetwork = { avgConduction, avgGrounding, avgStability, isPowered, overallPower }

  const avgConductionQuality = avgConduction
  const avgGroundedness = avgGrounding
  const avgSparkQuality = rods.length > 0
    ? Math.round(rods.reduce((s, r) => s + r.sparkQuality, 0) / rods.length)
    : 0
  const avgSurgeProtection = rods.length > 0
    ? Math.round(rods.reduce((s, r) => s + r.surgeProtection, 0) / rods.length)
    : 0
  const avgVoltageStability = avgStability

  const bestRod = rods.length > 0
    ? rods.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const bestConductor = rods.length > 0
    ? rods.reduce((best, r) => r.conductionQuality > best.conductionQuality ? r : best).file
    : ''
  const mostGrounded = rods.length > 0
    ? rods.reduce((best, r) => r.groundedness > best.groundedness ? r : best).file
    : ''
  const brightestSpark = rods.length > 0
    ? rods.reduce((best, r) => r.sparkQuality > best.sparkQuality ? r : best).file
    : ''
  const safestCircuit = rods.length > 0
    ? rods.reduce((best, r) => r.surgeProtection > best.surgeProtection ? r : best).file
    : ''

  const stats: LightningRodStats = {
    totalFiles: rods.length,
    totalGrids: grids.length,
    avgConductionQuality,
    avgGroundedness,
    avgSparkQuality,
    avgSurgeProtection,
    avgVoltageStability,
    powerPlantCount: rods.filter(r => r.condition === 'power-plant').length,
    powerStationCount: rods.filter(r => r.condition === 'power-station').length,
    transformerCount: rods.filter(r => r.condition === 'transformer').length,
    junctionBoxCount: rods.filter(r => r.condition === 'junction-box').length,
    extensionCordCount: rods.filter(r => r.condition === 'extension-cord').length,
    deadWireCount: rods.filter(r => r.condition === 'dead-wire').length,
    hasHighQualityCount: rods.filter(r => r.conducting.hasHighQuality).length,
    hasHighGroundednessCount: rods.filter(r => r.grounding.hasHighGroundedness).length,
    hasHighSparkCount: rods.filter(r => r.sparking.hasHighQuality).length,
    hasHighProtectionCount: rods.filter(r => r.protecting.hasHighProtection).length,
    hasHighStabilityCount: rods.filter(r => r.stabilizing.hasHighStability).length,
    overallPower,
    engineerGrade: classifyEngineerGrade(overallPower),
    bestRod,
    bestConductor,
    mostGrounded,
    brightestSpark,
    safestCircuit,
  }

  const recommendations = generateRecommendations(rods, grids, network, stats)

  return { rods, grids, network, stats, recommendations }
}

/**
 * Gather files matching the given patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  exts: string[],
  ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0
    ? ignore
    : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, {
    cwd: targetPath,
    ignore: ignorePatterns,
    absolute: true,
  })
  return Array.from(new Set(entries)).sort()
}
