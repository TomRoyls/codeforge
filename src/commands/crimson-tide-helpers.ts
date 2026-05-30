// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type SurgeGrade = 'tidal-wave' | 'strong-surge' | 'proper-swell' | 'gentle-wave' | 'flat-calm' | 'no-surge'
export type EbbGrade = 'perpetual-return' | 'strong-recovery' | 'proper-ebb' | 'slow-recovery' | 'declining-tide' | 'no-recovery'
export type DepthGrade = 'concentrated-essence' | 'rich-depth' | 'proper-intensity' | 'diluted-value' | 'surface-only' | 'no-depth'
export type WaveGrade = 'surgical-strike' | 'precise-wave' | 'proper-aim' | 'approximate-hit' | 'scattered-splash' | 'no-precision'
export type OceanGrade = 'elephant-memory' | 'deep-recall' | 'proper-memory' | 'goldfish-memory' | 'amnesia' | 'no-memory'
export type WaveCondition = 'tidal-masterpiece' | 'crimson-surge' | 'proper-tide' | 'gentle-current' | 'stagnant-water' | 'dry-channel'
export type ShoreType = 'crimson-coast' | 'proper-shore' | 'decent-beach' | 'rocky-coast' | 'mud-flat' | 'no-shore'
export type ShoreCondition = 'powerful-coast' | 'resilient-shore' | 'decent-tide' | 'calm-bay' | 'dried-up' | 'void'
export type NavigatorGrade = 'tide-master' | 'sea-captain' | 'skilled-sailor' | 'apprentice' | 'novice' | 'landlubber'

export interface SurgingMeasure {
  power: number
  grade: SurgeGrade
  hasHighPower: boolean
  hasPerformant: boolean
  hasPowerful: boolean
  hasNoSluggish: boolean
  hasOptimized: boolean
  hasNoUnoptimized: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasPeakCapable: boolean
  hasNoBottlenecked: boolean
  hasStrong: boolean
  sluggishCount: number
  unoptimizedCount: number
}

export interface RecoveringMeasure {
  resilience: number
  ebb: EbbGrade
  hasHighResilience: boolean
  hasErrorRecovery: boolean
  hasRetryLogic: boolean
  hasNoBareCrash: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasFallbackPaths: boolean
  hasNoDeadEnd: boolean
  hasSelfHealing: boolean
  hasNoDegradedState: boolean
  hasResilient: boolean
  bareCrashCount: number
  hardCrashCount: number
}

export interface ConcentratingMeasure {
  intensity: number
  depth: DepthGrade
  hasHighIntensity: boolean
  hasHighValue: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasConcentrated: boolean
  hasNoScattered: boolean
  hasFocused: boolean
  hasNoDistracted: boolean
  hasValuable: boolean
  hasNoBoilerplate: boolean
  hasDense: boolean
  fillerCount: number
  scatteredCount: number
}

export interface PrecisioningMeasure {
  precision: number
  wave: WaveGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  approximateCount: number
  vagueCount: number
}

export interface RememberingMeasure {
  memory: number
  ocean: OceanGrade
  hasHighMemory: boolean
  hasStateManaged: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasPersistent: boolean
  hasNoLost: boolean
  hasReliable: boolean
  mutableCount: number
  leakedCount: number
}

export interface CrimsonWave {
  file: string
  surgePower: number
  ebbResilience: number
  depthIntensity: number
  wavePrecision: number
  oceanMemory: number
  surging: SurgingMeasure
  recovering: RecoveringMeasure
  concentrating: ConcentratingMeasure
  precisioning: PrecisioningMeasure
  remembering: RememberingMeasure
  condition: WaveCondition
  qualityScore: number
}

export interface TideShore {
  directory: string
  waves: CrimsonWave[]
  avgPower: number
  avgResilience: number
  avgPrecision: number
  tidalMasterpieceCount: number
  dryChannelCount: number
  shoreType: ShoreType
  condition: ShoreCondition
}

export interface CrimsonSea {
  avgPower: number
  avgResilience: number
  avgPrecision: number
  isCrimson: boolean
  overallSurge: number
}

export interface CrimsonTideStats {
  totalFiles: number
  totalShores: number
  avgSurgePower: number
  avgEbbResilience: number
  avgDepthIntensity: number
  avgWavePrecision: number
  avgOceanMemory: number
  tidalMasterpieceCount: number
  crimsonSurgeCount: number
  properTideCount: number
  gentleCurrentCount: number
  stagnantWaterCount: number
  dryChannelCount: number
  hasHighPowerCount: number
  hasHighResilienceCount: number
  hasHighIntensityCount: number
  hasHighPrecisionCount: number
  hasHighMemoryCount: number
  overallSurge: number
  navigatorGrade: NavigatorGrade
  bestWave: string
  mostPowerful: string
  mostResilient: string
  mostIntense: string
  mostPrecise: string
}

export interface CrimsonTideResult {
  waves: CrimsonWave[]
  shores: TideShore[]
  sea: CrimsonSea
  stats: CrimsonTideStats
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
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure surge power (peak performance)
 * @example
 * const m = measureSurging(content)
 * console.log(m.grade) // 'tidal-wave'
 */
export function measureSurging(content: string): SurgingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasPerformant = hasInterface(content) && hasTypeAlias(content)
  const hasPowerful = hasExport(content) && hasAsync(content)
  const hasOptimized = hasConst(content) && hasReturnType(content)
  const hasEfficient = hasGenerics(content) && hasMapFunction(content)
  const hasPeakCapable = hasArrowFunction(content) && hasNamedExport(content)
  const hasStrong = hasEnum(content) && hasReadonly(content)

  score += hasPerformant ? 5 : 0
  score += hasPowerful ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasPeakCapable ? 5 : 0
  score += hasStrong ? 5 : 0

  const power = Math.min(score, 100)
  const sluggishCount = countMatches(/\bvar\b/, content)
  const unoptimizedCount = countMatches(/\bany\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoUnoptimized = unoptimizedCount === 0
  const hasNoWasteful = !has(/\beval\b/, content)
  const hasNoBottlenecked = !has(/\bdebugger\b/, content)
  const hasHighPower = power >= 70

  let grade: SurgeGrade
  if (power >= 85) grade = 'tidal-wave'
  else if (power >= 70) grade = 'strong-surge'
  else if (power >= 55) grade = 'proper-swell'
  else if (power >= 40) grade = 'gentle-wave'
  else if (power >= 25) grade = 'flat-calm'
  else grade = 'no-surge'

  return {
    power, grade, hasHighPower, hasPerformant, hasPowerful, hasNoSluggish,
    hasOptimized, hasNoUnoptimized, hasEfficient, hasNoWasteful, hasPeakCapable,
    hasNoBottlenecked, hasStrong, sluggishCount, unoptimizedCount,
  }
}

/**
 * Measure ebb resilience (recovery from low points)
 * @example
 * const m = measureRecovering(content)
 * console.log(m.ebb) // 'perpetual-return'
 */
export function measureRecovering(content: string): RecoveringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasErrorRecovery = hasTryCatch(content) && hasThrow(content)
  const hasRetryLogic = hasConditional(content) && hasNullishCoalescing(content)
  const hasGracefulDegradation = hasStrictEq(content) && hasReturnType(content)
  const hasFallbackPaths = hasInterface(content) && hasDefaultParam(content)
  const hasSelfHealing = hasAsync(content) && hasOptional(content)
  const hasResilient = hasConst(content) && hasEnum(content)

  score += hasErrorRecovery ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasFallbackPaths ? 5 : 0
  score += hasSelfHealing ? 5 : 0
  score += hasResilient ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const hardCrashCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoHardCrash = hardCrashCount === 0
  const hasNoDeadEnd = !has(/\beval\b/, content)
  const hasNoDegradedState = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let ebb: EbbGrade
  if (resilience >= 85) ebb = 'perpetual-return'
  else if (resilience >= 70) ebb = 'strong-recovery'
  else if (resilience >= 55) ebb = 'proper-ebb'
  else if (resilience >= 40) ebb = 'slow-recovery'
  else if (resilience >= 25) ebb = 'declining-tide'
  else ebb = 'no-recovery'

  return {
    resilience, ebb, hasHighResilience, hasErrorRecovery, hasRetryLogic,
    hasNoBareCrash, hasGracefulDegradation, hasNoHardCrash, hasFallbackPaths,
    hasNoDeadEnd, hasSelfHealing, hasNoDegradedState, hasResilient,
    bareCrashCount, hardCrashCount,
  }
}

/**
 * Measure depth intensity (concentrated value)
 * @example
 * const m = measureConcentrating(content)
 * console.log(m.depth) // 'concentrated-essence'
 */
export function measureConcentrating(content: string): ConcentratingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasEnum(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasHighValue = hasInterface(content) && hasEnum(content)
  const hasEssential = hasTypeAlias(content) && hasExport(content)
  const hasConcentrated = hasGenerics(content) && hasReturnType(content)
  const hasFocused = hasReadonly(content) && hasPrivate(content)
  const hasValuable = hasDocComments(content) && hasUnionType(content)
  const hasDense = hasNamedExport(content) && hasOptional(content)

  score += hasHighValue ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasConcentrated ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasValuable ? 5 : 0
  score += hasDense ? 5 : 0

  const intensity = Math.min(score, 100)
  const fillerCount = countMatches(/\bvar\b/, content)
  const scatteredCount = countMatches(/\bany\b/, content)

  const hasNoFiller = fillerCount === 0
  const hasNoScattered = scatteredCount === 0
  const hasNoDistracted = !has(/\beval\b/, content)
  const hasNoBoilerplate = !has(/\bdebugger\b/, content)
  const hasHighIntensity = intensity >= 70

  let depth: DepthGrade
  if (intensity >= 85) depth = 'concentrated-essence'
  else if (intensity >= 70) depth = 'rich-depth'
  else if (intensity >= 55) depth = 'proper-intensity'
  else if (intensity >= 40) depth = 'diluted-value'
  else if (intensity >= 25) depth = 'surface-only'
  else depth = 'no-depth'

  return {
    intensity, depth, hasHighIntensity, hasHighValue, hasEssential, hasNoFiller,
    hasConcentrated, hasNoScattered, hasFocused, hasNoDistracted, hasValuable,
    hasNoBoilerplate, hasDense, fillerCount, scatteredCount,
  }
}

/**
 * Measure wave precision (operation accuracy)
 * @example
 * const m = measurePrecisioning(content)
 * console.log(m.wave) // 'surgical-strike'
 */
export function measurePrecisioning(content: string): PrecisioningMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasAccurate = hasStrictEq(content) && hasReturnType(content)
  const hasExact = hasInterface(content) && hasTypeAlias(content)
  const hasPrecise = hasConst(content) && hasEnum(content)
  const hasCorrect = hasReadonly(content) && hasGenerics(content)
  const hasSharp = hasOptional(content) && hasExport(content)
  const hasDefined = hasConditional(content) && hasPrivate(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const vagueCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoAlmostRight = !has(/\beval\b/, content)
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let wave: WaveGrade
  if (precision >= 85) wave = 'surgical-strike'
  else if (precision >= 70) wave = 'precise-wave'
  else if (precision >= 55) wave = 'proper-aim'
  else if (precision >= 40) wave = 'approximate-hit'
  else if (precision >= 25) wave = 'scattered-splash'
  else wave = 'no-precision'

  return {
    precision, wave, hasHighPrecision, hasAccurate, hasExact, hasNoApproximate,
    hasPrecise, hasNoVague, hasCorrect, hasNoAlmostRight, hasSharp, hasNoSloppy,
    hasDefined, approximateCount, vagueCount,
  }
}

/**
 * Measure ocean memory (state management)
 * @example
 * const m = measureRemembering(content)
 * console.log(m.ocean) // 'elephant-memory'
 */
export function measureRemembering(content: string): RememberingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0

  const hasStateManaged = hasConst(content) && hasReadonly(content)
  const hasImmutable = hasInterface(content) && hasExport(content)
  const hasConsistent = hasPrivate(content) && hasEnum(content)
  const hasEncapsulated = hasTypeAlias(content) && hasReturnType(content)
  const hasPersistent = hasOptional(content) && hasStrictEq(content)
  const hasReliable = hasGenerics(content) && hasNamedExport(content)

  score += hasStateManaged ? 5 : 0
  score += hasImmutable ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasEncapsulated ? 5 : 0
  score += hasPersistent ? 5 : 0
  score += hasReliable ? 5 : 0

  const memory = Math.min(score, 100)
  const mutableCount = countMatches(/\bvar\b/, content)
  const leakedCount = countMatches(/\bany\b/, content)

  const hasNoMutable = mutableCount === 0
  const hasNoInconsistent = leakedCount === 0
  const hasNoLeaked = !has(/\beval\b/, content)
  const hasNoLost = !has(/\bdebugger\b/, content)
  const hasHighMemory = memory >= 70

  let ocean: OceanGrade
  if (memory >= 85) ocean = 'elephant-memory'
  else if (memory >= 70) ocean = 'deep-recall'
  else if (memory >= 55) ocean = 'proper-memory'
  else if (memory >= 40) ocean = 'goldfish-memory'
  else if (memory >= 25) ocean = 'amnesia'
  else ocean = 'no-memory'

  return {
    memory, ocean, hasHighMemory, hasStateManaged, hasImmutable, hasNoMutable,
    hasConsistent, hasNoInconsistent, hasEncapsulated, hasNoLeaked, hasPersistent,
    hasNoLost, hasReliable, mutableCount, leakedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify wave condition
 * @example
 * classifyWaveCondition(90) // 'tidal-masterpiece'
 */
export function classifyWaveCondition(score: number): WaveCondition {
  if (score >= 85) return 'tidal-masterpiece'
  if (score >= 70) return 'crimson-surge'
  if (score >= 55) return 'proper-tide'
  if (score >= 40) return 'gentle-current'
  if (score >= 25) return 'stagnant-water'
  return 'dry-channel'
}

/**
 * Classify shore type
 * @example
 * classifyShoreType(waves) // 'crimson-coast'
 */
export function classifyShoreType(waves: CrimsonWave[]): ShoreType {
  if (waves.length === 0) return 'no-shore'
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
  const masterpieceRatio = waves.filter(w => w.condition === 'tidal-masterpiece').length / waves.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'crimson-coast'
  if (avgQs >= 60) return 'proper-shore'
  if (avgQs >= 45) return 'decent-beach'
  if (avgQs >= 30) return 'rocky-coast'
  if (avgQs >= 15) return 'mud-flat'
  return 'no-shore'
}

/**
 * Classify shore condition
 * @example
 * classifyShoreCondition(80) // 'powerful-coast'
 */
export function classifyShoreCondition(avgQs: number): ShoreCondition {
  if (avgQs >= 75) return 'powerful-coast'
  if (avgQs >= 60) return 'resilient-shore'
  if (avgQs >= 45) return 'decent-tide'
  if (avgQs >= 30) return 'calm-bay'
  if (avgQs >= 15) return 'dried-up'
  return 'void'
}

/**
 * Classify navigator grade
 * @example
 * classifyNavigatorGrade(85) // 'tide-master'
 */
export function classifyNavigatorGrade(avgSurge: number): NavigatorGrade {
  if (avgSurge >= 80) return 'tide-master'
  if (avgSurge >= 65) return 'sea-captain'
  if (avgSurge >= 50) return 'skilled-sailor'
  if (avgSurge >= 35) return 'apprentice'
  if (avgSurge >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(waves, shores, sea, stats)
 */
export function generateRecommendations(
  waves: CrimsonWave[],
  shores: TideShore[],
  sea: CrimsonSea,
  stats: CrimsonTideStats,
): string[] {
  const recs: string[] = []
  if (stats.avgSurgePower < 50) {
    recs.push('Boost surge power with performant interfaces, optimized async patterns, and efficient data transformations')
  }
  if (stats.avgEbbResilience < 50) {
    recs.push('Strengthen ebb resilience with error recovery, retry logic, and graceful degradation paths')
  }
  if (stats.avgDepthIntensity < 50) {
    recs.push('Deepen intensity with essential types, concentrated generics, and focused readonly properties')
  }
  if (stats.avgWavePrecision < 50) {
    recs.push('Sharpen wave precision with strict equality, exact types, and precise return annotations')
  }
  if (stats.avgOceanMemory < 50) {
    recs.push('Improve ocean memory with immutable const patterns, consistent state management, and encapsulated types')
  }
  if (stats.dryChannelCount > 0) {
    recs.push(`${stats.dryChannelCount} file(s) are dry channels — they need complete crimson tide restoration`)
  }
  if (sea.overallSurge < 40) {
    recs.push('Overall surge is low — focus on surge power and ebb resilience first')
  }
  const allDried = shores.every(s => s.shoreType === 'no-shore' || s.shoreType === 'mud-flat')
  if (allDried && shores.length > 0) {
    recs.push('All shores are dried up — consider a major crimson tide reconstruction')
  }
  const dryFiles = waves.filter(w => w.condition === 'dry-channel').map(w => w.file)
  if (dryFiles.length > 0 && dryFiles.length <= 3) {
    recs.push(`Restore these dry channels: ${dryFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your crimson tide surges with tidal perfection! Every wave crests with masterful precision')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as crimson wave
 * @example
 * const w = analyzeCrimsonWave(content, 'index.ts')
 * console.log(w.condition) // 'tidal-masterpiece'
 */
export function analyzeCrimsonWave(content: string, filePath: string): CrimsonWave {
  const surging = measureSurging(content)
  const recovering = measureRecovering(content)
  const concentrating = measureConcentrating(content)
  const precisioning = measurePrecisioning(content)
  const remembering = measureRemembering(content)

  const qualityScore = Math.round(
    surging.power * 0.2 +
    recovering.resilience * 0.2 +
    concentrating.intensity * 0.2 +
    precisioning.precision * 0.2 +
    remembering.memory * 0.2,
  )

  return {
    file: filePath,
    surgePower: surging.power,
    ebbResilience: recovering.resilience,
    depthIntensity: concentrating.intensity,
    wavePrecision: precisioning.precision,
    oceanMemory: remembering.memory,
    surging, recovering, concentrating, precisioning, remembering,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as tide shore
 * @example
 * const s = analyzeTideShore(waves, 'src')
 * console.log(s.shoreType) // 'crimson-coast'
 */
export function analyzeTideShore(waves: CrimsonWave[], dirPath: string): TideShore {
  if (waves.length === 0) {
    return {
      directory: dirPath, waves: [], avgPower: 0, avgResilience: 0,
      avgPrecision: 0, tidalMasterpieceCount: 0, dryChannelCount: 0,
      shoreType: 'no-shore', condition: 'void',
    }
  }

  const avgPower = Math.round(waves.reduce((s, w) => s + w.surgePower, 0) / waves.length)
  const avgResilience = Math.round(waves.reduce((s, w) => s + w.ebbResilience, 0) / waves.length)
  const avgPrecision = Math.round(waves.reduce((s, w) => s + w.wavePrecision, 0) / waves.length)
  const tidalMasterpieceCount = waves.filter(w => w.condition === 'tidal-masterpiece').length
  const dryChannelCount = waves.filter(w => w.condition === 'dry-channel').length
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)

  return {
    directory: dirPath, waves, avgPower, avgResilience, avgPrecision,
    tidalMasterpieceCount, dryChannelCount,
    shoreType: classifyShoreType(waves),
    condition: classifyShoreCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete crimson tide result
 * @example
 * const result = await buildCrimsonTideResult(files, contents)
 * console.log(result.stats.navigatorGrade) // 'tide-master'
 */
export async function buildCrimsonTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrimsonTideResult> {
  const waves = files.map((file, i) => analyzeCrimsonWave(contents[i] ?? '', file))

  const dirMap = new Map<string, CrimsonWave[]>()
  for (const wave of waves) {
    const dir = path.dirname(wave.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(wave) } else { dirMap.set(dir, [wave]) }
  }

  const shores = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeTideShore(dirWaves, dir),
  )

  const avgPower = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.surgePower, 0) / waves.length) : 0
  const avgResilience = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.ebbResilience, 0) / waves.length) : 0
  const avgPrecision = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.wavePrecision, 0) / waves.length) : 0

  const overallSurge = waves.length > 0
    ? Math.round((avgPower + avgResilience + avgPrecision) / 3) : 0
  const isCrimson = avgPower >= 60

  const sea: CrimsonSea = { avgPower, avgResilience, avgPrecision, isCrimson, overallSurge }

  const avgDepthIntensity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.depthIntensity, 0) / waves.length) : 0
  const avgOceanMemory = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.oceanMemory, 0) / waves.length) : 0

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file : ''
  const mostPowerful = waves.length > 0
    ? waves.reduce((best, w) => w.surgePower > best.surgePower ? w : best).file : ''
  const mostResilient = waves.length > 0
    ? waves.reduce((best, w) => w.ebbResilience > best.ebbResilience ? w : best).file : ''
  const mostIntense = waves.length > 0
    ? waves.reduce((best, w) => w.depthIntensity > best.depthIntensity ? w : best).file : ''
  const mostPrecise = waves.length > 0
    ? waves.reduce((best, w) => w.wavePrecision > best.wavePrecision ? w : best).file : ''

  const stats: CrimsonTideStats = {
    totalFiles: waves.length,
    totalShores: shores.length,
    avgSurgePower: avgPower,
    avgEbbResilience: avgResilience,
    avgDepthIntensity,
    avgWavePrecision: avgPrecision,
    avgOceanMemory,
    tidalMasterpieceCount: waves.filter(w => w.condition === 'tidal-masterpiece').length,
    crimsonSurgeCount: waves.filter(w => w.condition === 'crimson-surge').length,
    properTideCount: waves.filter(w => w.condition === 'proper-tide').length,
    gentleCurrentCount: waves.filter(w => w.condition === 'gentle-current').length,
    stagnantWaterCount: waves.filter(w => w.condition === 'stagnant-water').length,
    dryChannelCount: waves.filter(w => w.condition === 'dry-channel').length,
    hasHighPowerCount: waves.filter(w => w.surging.hasHighPower).length,
    hasHighResilienceCount: waves.filter(w => w.recovering.hasHighResilience).length,
    hasHighIntensityCount: waves.filter(w => w.concentrating.hasHighIntensity).length,
    hasHighPrecisionCount: waves.filter(w => w.precisioning.hasHighPrecision).length,
    hasHighMemoryCount: waves.filter(w => w.remembering.hasHighMemory).length,
    overallSurge,
    navigatorGrade: classifyNavigatorGrade(overallSurge),
    bestWave, mostPowerful, mostResilient, mostIntense, mostPrecise,
  }

  const recommendations = generateRecommendations(waves, shores, sea, stats)

  return { waves, shores, sea, stats, recommendations }
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
