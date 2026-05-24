// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type FlowGrade = 'unobstructed-flow' | 'smooth-current' | 'proper-flow' | 'blocked-channel' | 'stagnant-energy' | 'no-flow'
export type BalanceMeridian = 'perfect-balance' | 'harmonious-yin-yang' | 'proper-balance' | 'imbalanced-meridian' | 'blocked-channel' | 'no-balance'
export type VitalityChi = 'vital-chi' | 'strong-energy' | 'proper-vitality' | 'weak-chi' | 'depleted-energy' | 'no-chi'
export type PrecisionAcupoint = 'master-healer' | 'precise-touch' | 'proper-targeting' | 'approximate-aim' | 'missed-point' | 'no-precision'
export type ResonanceHarmonic = 'symphony-of-code' | 'harmonic-system' | 'proper-resonance' | 'dissonant-code' | 'cacophony' | 'silence'
export type PointCondition = 'grandmaster-art' | 'healing-jade' | 'proper-meridian' | 'dull-stone' | 'cracked-jade' | 'gravel'
export type PathType = 'master-meridian' | 'proper-channel' | 'decent-pathway' | 'blocked-route' | 'broken-channel' | 'no-path'
export type PathCondition = 'flowing-harmony' | 'balanced-energy' | 'decent-flow' | 'stagnant-channel' | 'blocked' | 'void'
export type HealerGrade = 'grandmaster' | 'master-healer' | 'skilled-practitioner' | 'apprentice' | 'novice' | 'quack'

export interface FlowingMeasure {
  energy: number
  grade: FlowGrade
  hasHighEnergy: boolean
  hasEfficientFlow: boolean
  hasStreamlined: boolean
  hasNoBottlenecks: boolean
  hasDirectPaths: boolean
  hasNoCircuits: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  hasFlowing: boolean
  bottleneckCount: number
  tangledCount: number
}

export interface BalancingMeasure {
  balance: number
  meridian: BalanceMeridian
  hasHighBalance: boolean
  hasEvenDistribution: boolean
  hasNoGodFunctions: boolean
  hasProportional: boolean
  hasNoOverweight: boolean
  hasWellSized: boolean
  hasNoGiant: boolean
  hasFairAllocation: boolean
  hasNoResourceHoarding: boolean
  hasBalanced: boolean
  hasNoExtreme: boolean
  godFunctionCount: number
  overweightCount: number
}

export interface VitalizingMeasure {
  vitality: number
  chi: VitalityChi
  hasHighVitality: boolean
  hasPerformant: boolean
  hasEfficient: boolean
  hasNoSluggish: boolean
  hasOptimized: boolean
  hasNoUnoptimized: boolean
  hasCached: boolean
  hasNoRedundant: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasEnergetic: boolean
  sluggishCount: number
  redundantCount: number
}

export interface PrecisioningMeasure {
  precision: number
  acupoint: PrecisionAcupoint
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasTargeted: boolean
  approximateCount: number
  vagueCount: number
}

export interface HarmonizingMeasure {
  resonance: number
  harmonic: ResonanceHarmonic
  hasHighResonance: boolean
  hasConsistent: boolean
  hasNoMixed: boolean
  hasUniform: boolean
  hasNoInconsistent: boolean
  hasIntegrated: boolean
  hasNoIsolated: boolean
  hasHarmonious: boolean
  hasNoConflicting: boolean
  hasCoherent: boolean
  hasNoContradictory: boolean
  mixedCount: number
  inconsistentCount: number
}

export interface JadePoint {
  file: string
  energyFlow: number
  meridianBalance: number
  chiVitality: number
  acuPointPrecision: number
  harmonicResonance: number
  flowing: FlowingMeasure
  balancing: BalancingMeasure
  vitalizing: VitalizingMeasure
  precisioning: PrecisioningMeasure
  harmonizing: HarmonizingMeasure
  condition: PointCondition
  qualityScore: number
}

export interface MeridianPath {
  directory: string
  points: JadePoint[]
  avgEnergy: number
  avgBalance: number
  avgResonance: number
  grandmasterArtCount: number
  gravelCount: number
  pathType: PathType
  condition: PathCondition
}

export interface JadeBody {
  avgEnergy: number
  avgBalance: number
  avgResonance: number
  isHarmonious: boolean
  overallVitality: number
}

export interface JadeMeridianStats {
  totalFiles: number
  totalPaths: number
  avgEnergyFlow: number
  avgMeridianBalance: number
  avgChiVitality: number
  avgAcuPointPrecision: number
  avgHarmonicResonance: number
  grandmasterArtCount: number
  healingJadeCount: number
  properMeridianCount: number
  dullStoneCount: number
  crackedJadeCount: number
  gravelCount: number
  hasHighEnergyCount: number
  hasHighBalanceCount: number
  hasHighVitalityCount: number
  hasHighPrecisionCount: number
  hasHighResonanceCount: number
  overallVitality: number
  healerGrade: HealerGrade
  bestPoint: string
  mostFlowing: string
  mostBalanced: string
  mostVital: string
  mostPrecise: string
}

export interface JadeMeridianResult {
  points: JadePoint[]
  paths: MeridianPath[]
  body: JadeBody
  stats: JadeMeridianStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^=]/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure energy flow (data flow efficiency)
 * @example
 * const m = measureFlowing(content)
 * console.log(m.grade) // 'unobstructed-flow'
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasEfficientFlow = hasExport(content) && hasReturnType(content)
  const hasDirectPaths = hasNamedExport(content) && hasConst(content)
  const hasCleanPipelines = hasMapFunction(content) && hasArrowFunction(content)
  const hasOptimized = hasInterface(content) && hasTypeAlias(content)
  const hasStreamlined = hasOptional(content) && hasGenerics(content)
  const hasFlowing = hasAsync(content) && hasDocComments(content)

  score += hasEfficientFlow ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasCleanPipelines ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasFlowing ? 5 : 0

  const energy = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const tangledCount = countMatches(/\bany\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoCircuits = tangledCount === 0
  const hasNoTangled = countMatches(/\beval\b/, content) === 0
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighEnergy = energy >= 70

  let grade: FlowGrade
  if (energy >= 85) grade = 'unobstructed-flow'
  else if (energy >= 70) grade = 'smooth-current'
  else if (energy >= 55) grade = 'proper-flow'
  else if (energy >= 40) grade = 'blocked-channel'
  else if (energy >= 25) grade = 'stagnant-energy'
  else grade = 'no-flow'

  return {
    energy, grade, hasHighEnergy, hasEfficientFlow, hasStreamlined, hasNoBottlenecks,
    hasDirectPaths, hasNoCircuits, hasCleanPipelines, hasNoTangled, hasOptimized,
    hasNoWasteful, hasFlowing, bottleneckCount, tangledCount,
  }
}

/**
 * Measure meridian balance (balanced across concerns)
 * @example
 * const m = measureBalancing(content)
 * console.log(m.meridian) // 'perfect-balance'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasEvenDistribution = hasInterface(content) && hasEnum(content)
  const hasProportional = hasExport(content) && hasTypeAlias(content)
  const hasWellSized = hasReturnType(content) && hasConst(content)
  const hasFairAllocation = hasDocComments(content) && hasReadonly(content)
  const hasBalanced = hasNamedExport(content) && hasGenerics(content)
  const hasNoExtreme = hasOptional(content) && hasPrivate(content)

  score += hasEvenDistribution ? 5 : 0
  score += hasProportional ? 5 : 0
  score += hasWellSized ? 5 : 0
  score += hasFairAllocation ? 5 : 0
  score += hasBalanced ? 5 : 0
  score += hasNoExtreme ? 5 : 0

  const balance = Math.min(score, 100)
  const godFunctionCount = countMatches(/\bvar\b/, content)
  const overweightCount = countMatches(/\bany\b/, content)

  const hasNoGodFunctions = godFunctionCount === 0
  const hasNoOverweight = overweightCount === 0
  const hasNoGiant = countMatches(/\beval\b/, content) === 0
  const hasNoResourceHoarding = !has(/\bdebugger\b/, content)
  const hasHighBalance = balance >= 70

  let meridian: BalanceMeridian
  if (balance >= 85) meridian = 'perfect-balance'
  else if (balance >= 70) meridian = 'harmonious-yin-yang'
  else if (balance >= 55) meridian = 'proper-balance'
  else if (balance >= 40) meridian = 'imbalanced-meridian'
  else if (balance >= 25) meridian = 'blocked-channel'
  else meridian = 'no-balance'

  return {
    balance, meridian, hasHighBalance, hasEvenDistribution, hasNoGodFunctions,
    hasProportional, hasNoOverweight, hasWellSized, hasNoGiant, hasFairAllocation,
    hasNoResourceHoarding, hasBalanced, hasNoExtreme, godFunctionCount, overweightCount,
  }
}

/**
 * Measure chi vitality (execution energy/performance)
 * @example
 * const m = measureVitalizing(content)
 * console.log(m.chi) // 'vital-chi'
 */
export function measureVitalizing(content: string): VitalizingMeasure {
  let score = 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasTypeAlias(content) ? 4 : 0

  const hasPerformant = hasConst(content) && hasStrictEq(content)
  const hasOptimized = hasReturnType(content) && hasExport(content)
  const hasCached = hasReadonly(content) && hasEnum(content)
  const hasLean = hasInterface(content) && hasAsync(content)
  const hasEfficient = hasMapFunction(content) && hasGenerics(content)
  const hasEnergetic = hasOptional(content) && hasTypeAlias(content)

  score += hasPerformant ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasEnergetic ? 5 : 0

  const vitality = Math.min(score, 100)
  const sluggishCount = countMatches(/\bvar\b/, content)
  const redundantCount = countMatches(/\beval\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoRedundant = redundantCount === 0
  const hasNoUnoptimized = countMatches(/\bany\b/, content) === 0
  const hasNoBloated = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  let chi: VitalityChi
  if (vitality >= 85) chi = 'vital-chi'
  else if (vitality >= 70) chi = 'strong-energy'
  else if (vitality >= 55) chi = 'proper-vitality'
  else if (vitality >= 40) chi = 'weak-chi'
  else if (vitality >= 25) chi = 'depleted-energy'
  else chi = 'no-chi'

  return {
    vitality, chi, hasHighVitality, hasPerformant, hasEfficient, hasNoSluggish,
    hasOptimized, hasNoUnoptimized, hasCached, hasNoRedundant, hasLean, hasNoBloated,
    hasEnergetic, sluggishCount, redundantCount,
  }
}

/**
 * Measure acu-point precision (precision at critical points)
 * @example
 * const m = measurePrecisioning(content)
 * console.log(m.acupoint) // 'master-healer'
 */
export function measurePrecisioning(content: string): PrecisioningMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasExact = hasStrictEq(content) && hasReturnType(content)
  const hasCorrect = hasInterface(content) && hasExport(content)
  const hasPrecise = hasReadonly(content) && hasOptional(content)
  const hasSharp = hasEnum(content) && hasTypeAlias(content)
  const hasAccurate = hasConst(content) && hasGenerics(content)
  const hasTargeted = hasDocComments(content) && hasPrivate(content)

  score += hasExact ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasTargeted ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const vagueCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoAlmostRight = countMatches(/\beval\b/, content) === 0
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let acupoint: PrecisionAcupoint
  if (precision >= 85) acupoint = 'master-healer'
  else if (precision >= 70) acupoint = 'precise-touch'
  else if (precision >= 55) acupoint = 'proper-targeting'
  else if (precision >= 40) acupoint = 'approximate-aim'
  else if (precision >= 25) acupoint = 'missed-point'
  else acupoint = 'no-precision'

  return {
    precision, acupoint, hasHighPrecision, hasExact, hasAccurate, hasNoApproximate,
    hasCorrect, hasNoAlmostRight, hasPrecise, hasNoVague, hasSharp, hasNoSloppy,
    hasTargeted, approximateCount, vagueCount,
  }
}

/**
 * Measure harmonic resonance (overall system harmony)
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.harmonic) // 'symphony-of-code'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasUnionType(content) ? 4 : 0

  const hasConsistent = hasExport(content) && hasInterface(content)
  const hasUniform = hasConst(content) && hasReturnType(content)
  const hasIntegrated = hasNamedExport(content) && hasTypeAlias(content)
  const hasHarmonious = hasEnum(content) && hasReadonly(content)
  const hasCoherent = hasDocComments(content) && hasOptional(content)
  const hasNoMixed = hasGenerics(content) && hasUnionType(content)

  score += hasConsistent ? 5 : 0
  score += hasUniform ? 5 : 0
  score += hasIntegrated ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasNoMixed ? 5 : 0

  const resonance = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const inconsistentCount = countMatches(/\bany\b/, content)

  const hasNoInconsistent = inconsistentCount === 0
  const hasNoIsolated = countMatches(/\beval\b/, content) === 0
  const hasNoConflicting = !has(/\bdebugger\b/, content)
  const hasNoContradictory = mixedCount === 0
  const hasHighResonance = resonance >= 70

  let harmonic: ResonanceHarmonic
  if (resonance >= 85) harmonic = 'symphony-of-code'
  else if (resonance >= 70) harmonic = 'harmonic-system'
  else if (resonance >= 55) harmonic = 'proper-resonance'
  else if (resonance >= 40) harmonic = 'dissonant-code'
  else if (resonance >= 25) harmonic = 'cacophony'
  else harmonic = 'silence'

  return {
    resonance, harmonic, hasHighResonance, hasConsistent, hasNoMixed, hasUniform,
    hasNoInconsistent, hasIntegrated, hasNoIsolated, hasHarmonious, hasNoConflicting,
    hasCoherent, hasNoContradictory, mixedCount, inconsistentCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify point condition
 * @example
 * classifyPointCondition(90) // 'grandmaster-art'
 */
export function classifyPointCondition(score: number): PointCondition {
  if (score >= 85) return 'grandmaster-art'
  if (score >= 70) return 'healing-jade'
  if (score >= 55) return 'proper-meridian'
  if (score >= 40) return 'dull-stone'
  if (score >= 25) return 'cracked-jade'
  return 'gravel'
}

/**
 * Classify path type
 * @example
 * classifyPathType(points) // 'master-meridian'
 */
export function classifyPathType(points: JadePoint[]): PathType {
  if (points.length === 0) return 'no-path'
  const avgQs = Math.round(points.reduce((s, p) => s + p.qualityScore, 0) / points.length)
  const masterpieceRatio = points.filter(p => p.condition === 'grandmaster-art').length / points.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'master-meridian'
  if (avgQs >= 60) return 'proper-channel'
  if (avgQs >= 45) return 'decent-pathway'
  if (avgQs >= 30) return 'blocked-route'
  if (avgQs >= 15) return 'broken-channel'
  return 'no-path'
}

/**
 * Classify path condition
 * @example
 * classifyPathCondition(80) // 'flowing-harmony'
 */
export function classifyPathCondition(avgQs: number): PathCondition {
  if (avgQs >= 75) return 'flowing-harmony'
  if (avgQs >= 60) return 'balanced-energy'
  if (avgQs >= 45) return 'decent-flow'
  if (avgQs >= 30) return 'stagnant-channel'
  if (avgQs >= 15) return 'blocked'
  return 'void'
}

/**
 * Classify healer grade
 * @example
 * classifyHealerGrade(85) // 'grandmaster'
 */
export function classifyHealerGrade(avgVitality: number): HealerGrade {
  if (avgVitality >= 80) return 'grandmaster'
  if (avgVitality >= 65) return 'master-healer'
  if (avgVitality >= 50) return 'skilled-practitioner'
  if (avgVitality >= 35) return 'apprentice'
  if (avgVitality >= 20) return 'novice'
  return 'quack'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(points, paths, body, stats)
 */
export function generateRecommendations(
  points: JadePoint[],
  paths: MeridianPath[],
  body: JadeBody,
  stats: JadeMeridianStats,
): string[] {
  const recs: string[] = []
  if (stats.avgEnergyFlow < 50) {
    recs.push('Improve energy flow with efficient exports, streamlined pipelines, and direct data paths')
  }
  if (stats.avgMeridianBalance < 50) {
    recs.push('Restore meridian balance with even type distribution, proportional exports, and well-sized modules')
  }
  if (stats.avgChiVitality < 50) {
    recs.push('Boost chi vitality with performant patterns, optimized types, and lean implementations')
  }
  if (stats.avgAcuPointPrecision < 50) {
    recs.push('Sharpen acu-point precision with strict equality, exact types, and targeted interfaces')
  }
  if (stats.avgHarmonicResonance < 50) {
    recs.push('Enhance harmonic resonance with consistent patterns, integrated exports, and coherent design')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — they need complete meridian reconstruction`)
  }
  if (body.overallVitality < 40) {
    recs.push('Overall vitality is dangerously low — focus on energy flow and chi vitality first')
  }
  const allWeak = paths.every(p => p.pathType === 'no-path' || p.pathType === 'broken-channel')
  if (allWeak && paths.length > 0) {
    recs.push('All meridian paths are weak — consider a major system-wide energy reconstruction')
  }
  const gravelFiles = points.filter(p => p.condition === 'gravel').map(p => p.file)
  if (gravelFiles.length > 0 && gravelFiles.length <= 3) {
    recs.push(`Rebuild these gravel files: ${gravelFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The jade meridian flows perfectly! Every point resonates with energy, balance, vitality, precision, and harmony')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as jade point
 * @example
 * const point = analyzeJadePoint(content, 'index.ts')
 * console.log(point.condition) // 'grandmaster-art'
 */
export function analyzeJadePoint(content: string, filePath: string): JadePoint {
  const flowing = measureFlowing(content)
  const balancing = measureBalancing(content)
  const vitalizing = measureVitalizing(content)
  const precisioning = measurePrecisioning(content)
  const harmonizing = measureHarmonizing(content)

  const qualityScore = Math.round(
    flowing.energy * 0.2 +
    balancing.balance * 0.2 +
    vitalizing.vitality * 0.2 +
    precisioning.precision * 0.2 +
    harmonizing.resonance * 0.2,
  )

  return {
    file: filePath,
    energyFlow: flowing.energy,
    meridianBalance: balancing.balance,
    chiVitality: vitalizing.vitality,
    acuPointPrecision: precisioning.precision,
    harmonicResonance: harmonizing.resonance,
    flowing, balancing, vitalizing, precisioning, harmonizing,
    condition: classifyPointCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as meridian path
 * @example
 * const path = analyzeMeridianPath(points, 'src')
 * console.log(path.pathType) // 'master-meridian'
 */
export function analyzeMeridianPath(points: JadePoint[], dirPath: string): MeridianPath {
  if (points.length === 0) {
    return {
      directory: dirPath, points: [], avgEnergy: 0, avgBalance: 0,
      avgResonance: 0, grandmasterArtCount: 0, gravelCount: 0,
      pathType: 'no-path', condition: 'void',
    }
  }

  const avgEnergy = Math.round(points.reduce((s, p) => s + p.energyFlow, 0) / points.length)
  const avgBalance = Math.round(points.reduce((s, p) => s + p.meridianBalance, 0) / points.length)
  const avgResonance = Math.round(points.reduce((s, p) => s + p.harmonicResonance, 0) / points.length)
  const grandmasterArtCount = points.filter(p => p.condition === 'grandmaster-art').length
  const gravelCount = points.filter(p => p.condition === 'gravel').length
  const avgQs = Math.round(points.reduce((s, p) => s + p.qualityScore, 0) / points.length)

  return {
    directory: dirPath, points, avgEnergy, avgBalance, avgResonance,
    grandmasterArtCount, gravelCount,
    pathType: classifyPathType(points),
    condition: classifyPathCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete jade meridian result
 * @example
 * const result = await buildJadeMeridianResult(files, contents)
 * console.log(result.stats.healerGrade) // 'grandmaster'
 */
export async function buildJadeMeridianResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeMeridianResult> {
  const points = files.map((file, i) => analyzeJadePoint(contents[i] ?? '', file))

  const dirMap = new Map<string, JadePoint[]>()
  for (const point of points) {
    const dir = path.dirname(point.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(point) } else { dirMap.set(dir, [point]) }
  }

  const paths = Array.from(dirMap.entries()).map(([dir, dirPoints]) =>
    analyzeMeridianPath(dirPoints, dir),
  )

  const avgEnergy = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.energyFlow, 0) / points.length) : 0
  const avgBalance = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.meridianBalance, 0) / points.length) : 0
  const avgResonance = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.harmonicResonance, 0) / points.length) : 0

  const overallVitality = points.length > 0
    ? Math.round((avgEnergy + avgBalance + avgResonance) / 3) : 0
  const isHarmonious = avgEnergy >= 60

  const body: JadeBody = { avgEnergy, avgBalance, avgResonance, isHarmonious, overallVitality }

  const avgChiVitality = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.chiVitality, 0) / points.length) : 0
  const avgAcuPointPrecision = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.acuPointPrecision, 0) / points.length) : 0
  const avgHarmonicResonance = points.length > 0
    ? Math.round(points.reduce((s, p) => s + p.harmonicResonance, 0) / points.length) : 0

  const bestPoint = points.length > 0
    ? points.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const mostFlowing = points.length > 0
    ? points.reduce((best, p) => p.energyFlow > best.energyFlow ? p : best).file : ''
  const mostBalanced = points.length > 0
    ? points.reduce((best, p) => p.meridianBalance > best.meridianBalance ? p : best).file : ''
  const mostVital = points.length > 0
    ? points.reduce((best, p) => p.chiVitality > best.chiVitality ? p : best).file : ''
  const mostPrecise = points.length > 0
    ? points.reduce((best, p) => p.acuPointPrecision > best.acuPointPrecision ? p : best).file : ''

  const stats: JadeMeridianStats = {
    totalFiles: points.length,
    totalPaths: paths.length,
    avgEnergyFlow: avgEnergy,
    avgMeridianBalance: avgBalance,
    avgChiVitality,
    avgAcuPointPrecision,
    avgHarmonicResonance,
    grandmasterArtCount: points.filter(p => p.condition === 'grandmaster-art').length,
    healingJadeCount: points.filter(p => p.condition === 'healing-jade').length,
    properMeridianCount: points.filter(p => p.condition === 'proper-meridian').length,
    dullStoneCount: points.filter(p => p.condition === 'dull-stone').length,
    crackedJadeCount: points.filter(p => p.condition === 'cracked-jade').length,
    gravelCount: points.filter(p => p.condition === 'gravel').length,
    hasHighEnergyCount: points.filter(p => p.flowing.hasHighEnergy).length,
    hasHighBalanceCount: points.filter(p => p.balancing.hasHighBalance).length,
    hasHighVitalityCount: points.filter(p => p.vitalizing.hasHighVitality).length,
    hasHighPrecisionCount: points.filter(p => p.precisioning.hasHighPrecision).length,
    hasHighResonanceCount: points.filter(p => p.harmonizing.hasHighResonance).length,
    overallVitality,
    healerGrade: classifyHealerGrade(overallVitality),
    bestPoint, mostFlowing, mostBalanced, mostVital, mostPrecise,
  }

  const recommendations = generateRecommendations(points, paths, body, stats)

  return { points, paths, body, stats, recommendations }
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
