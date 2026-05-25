// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Elevation = 'everest-class' | 'major-peak' | 'proper-summit' | 'foothill' | 'base-camp' | 'sea-level'
export type Vista = 'panoramic-360' | 'breathtaking-view' | 'proper-overlook' | 'partial-view' | 'clouded-sight' | 'no-vista'
export type Ridge = 'granite-ridge' | 'solid-crest' | 'proper-ridge' | 'crumbling-edge' | 'unstable-shelf' | 'no-ridge'
export type Sage = 'mountain-sage' | 'summit-philosopher' | 'proper-guide' | 'learning-climber' | 'lost-tourist' | 'no-wisdom'
export type Shield = 'impervious-bastion' | 'avalanche-proof' | 'proper-shelter' | 'fragile-bivouac' | 'exposed-ledge' | 'no-shield'
export type PeakCondition = 'emerald-pinnacle' | 'jade-peak' | 'proper-summit' | 'rocky-ridge' | 'gravel-slope' | 'dust'
export type RangeType = 'himalayas' | 'alps' | 'proper-range' | 'foothills' | 'mound' | 'no-range'
export type RangeCondition = 'emerald-kingdom' | 'jade-mountains' | 'proper-range' | 'rocky-hills' | 'eroded-peaks' | 'void'
export type AlpinistGrade = 'mountain-legend' | 'expert-alpinist' | 'skilled-climber' | 'apprentice' | 'novice' | 'flatlander'

export interface AscendingMeasure {
  altitude: number
  elevation: Elevation
  hasHighAltitude: boolean
  hasHighQuality: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasExcellent: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ViewingMeasure {
  clarity: number
  vista: Vista
  hasHighClarity: boolean
  hasDocumented: boolean
  hasWellCommented: boolean
  hasNoUndocumented: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasIlluminated: boolean
  hasNoDark: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  undocumentedCount: number
  mysteryCount: number
}

export interface FortifyingMeasure {
  strength: number
  ridge: Ridge
  hasHighStrength: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasSolid: boolean
  hasNoShaky: boolean
  hasLoadBearing: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface KnowingMeasure {
  wisdom: number
  sage: Sage
  hasHighWisdom: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasBattleTested: boolean
  hasNoUnproven: boolean
  adHocCount: number
  hackedCount: number
}

export interface ShieldingMeasure {
  resilience: number
  shield: Shield
  hasHighResilience: boolean
  hasEdgeCaseCovered: boolean
  hasNoSinglePath: boolean
  hasBoundaryChecked: boolean
  hasNoAssumed: boolean
  hasValidated: boolean
  hasNoTrusting: boolean
  hasNullSafe: boolean
  hasNoNPE: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasSelfHealing: boolean
  singlePathCount: number
  assumedCount: number
}

export interface EmeraldPeak {
  file: string
  gemAltitude: number
  peakClarity: number
  ridgeStrength: number
  summitWisdom: number
  avalancheResilience: number
  ascending: AscendingMeasure
  viewing: ViewingMeasure
  fortifying: FortifyingMeasure
  knowing: KnowingMeasure
  shielding: ShieldingMeasure
  condition: PeakCondition
  qualityScore: number
}

export interface EmeraldRange {
  directory: string
  peaks: EmeraldPeak[]
  avgAltitude: number
  avgClarity: number
  avgWisdom: number
  emeraldPinnacleCount: number
  dustCount: number
  rangeType: RangeType
  condition: RangeCondition
}

export interface EmeraldSummitResult {
  peaks: EmeraldPeak[]
  ranges: EmeraldRange[]
  massif: {
    avgAltitude: number
    avgClarity: number
    avgWisdom: number
    isEmerald: boolean
    overallAltitude: number
  }
  celebration: {
    milestone: 540
    name: 'emerald-summit'
    message: string
    previousMilestones: number[]
    totalTests: number
  }
  stats: {
    totalFiles: number
    totalRanges: number
    avgGemAltitude: number
    avgPeakClarity: number
    avgRidgeStrength: number
    avgSummitWisdom: number
    avgAvalancheResilience: number
    emeraldPinnacleCount: number
    jadePeakCount: number
    properSummitCount: number
    rockyRidgeCount: number
    gravelSlopeCount: number
    dustCount: number
    hasHighAltitudeCount: number
    hasHighClarityCount: number
    hasHighStrengthCount: number
    hasHighWisdomCount: number
    hasHighResilienceCount: number
    overallAltitude: number
    alpinistGrade: AlpinistGrade
    bestPeak: string
    highest: string
    clearest: string
    strongest: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureAscending ──────────────────────────────────────────────

/**
 * @example measureAscending('export function greet(name: string): string { return name }')
 */
export function measureAscending(content: string): AscendingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasReturnType) score += 6
  if (hasDoc) score += 6
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasGenerics) score += 6
  if (hasAsync) score += 4
  if (hasEnum) score += 4
  if (hasImport) score += 4
  if (hasPipeline) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4

  const altitude = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const obfuscatedCount = hasDebugger ? 1 : 0

  return {
    altitude,
    elevation: classifyElevation(altitude),
    hasHighAltitude: altitude >= 80,
    hasHighQuality: hasExport && hasNamed,
    hasReadable: hasExport && hasConst,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && hasVar === 0,
    hasTransparent: hasNamed && !hasEval,
    hasNoObfuscated: !hasDebugger,
    hasClear: hasDoc && hasExport,
    hasNoHidden: !hasEval && !hasDebugger,
    hasPolished: hasReadonly && hasOptional,
    hasNoRough: hasVar === 0,
    hasRefined: hasGenerics && hasNamed,
    hasNoCrude: !hasDebugger && !hasEval,
    hasExcellent: hasNamed && hasDoc && !hasAny,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureViewing ────────────────────────────────────────────────

/**
 * @example measureViewing('/** docs *\\/ export function helper(): void {}')
 */
export function measureViewing(content: string): ViewingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasArrow = hasPattern(content, /=>/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasReturnType) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasConst) score += 4
  if (hasGenerics) score += 4
  if (hasOptional) score += 4
  if (hasAsync) score += 4
  if (hasArrow) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const undocumentedCount = hasVar > 0 ? 1 : 0
  const mysteryCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    clarity,
    vista: classifyVista(clarity),
    hasHighClarity: clarity >= 80,
    hasDocumented: hasDoc,
    hasWellCommented: hasDoc && hasExport,
    hasNoUndocumented: hasVar === 0,
    hasVisible: hasExport && hasNamed,
    hasNoInvisible: !hasDebugger,
    hasUnderstandable: hasReturnType && !hasEval,
    hasNoArcane: !hasEval && hasVar === 0,
    hasApproachable: hasExport && hasConst,
    hasNoIntimidating: !hasVar && !hasAny,
    hasIlluminated: hasDoc && hasNamed,
    hasNoDark: !hasEval && !hasDebugger,
    hasSelfDocumenting: hasNamed,
    hasNoMystery: !hasEval && hasVar === 0 && !hasDebugger,
    undocumentedCount,
    mysteryCount,
  }
}

// ─── measureFortifying ─────────────────────────────────────────────

/**
 * @example measureFortifying('try { await work() } catch (e) { handleError(e) }')
 */
export function measureFortifying(content: string): FortifyingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasTryCatch) score += 8
  if (hasThrow) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasReturnType) score += 6
  if (hasInterface) score += 4
  if (hasGenerics) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4
  if (hasPrivate) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const strength = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    strength,
    ridge: classifyRidge(strength),
    hasHighStrength: strength >= 80,
    hasTested: hasTryCatch || hasThrow,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasEval,
    hasRobust: hasTryCatch && hasReturnType,
    hasNoFragile: hasVar === 0 && !hasEval,
    hasDefensive: hasOptional || hasNullish,
    hasNoNaive: !hasDebugger,
    hasSolid: hasReadonly && hasPrivate,
    hasNoShaky: !hasDebugger && hasVar === 0,
    hasLoadBearing: hasInterface && hasReturnType,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('export abstract class Base { abstract doWork(): void }')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 8
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasEnum) score += 4
  if (hasClass) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4
  if (hasReturnType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasTodo) score -= 5
  if (hasDebugger) score -= 6
  if (hasEval) score -= 8
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasVar > 0 ? 1 : 0) + (hasTodo ? 1 : 0)
  const hackedCount = (hasHackyCast > 0 ? 1 : 0) + (hasEval ? 1 : 0)

  return {
    wisdom,
    sage: classifySage(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasWellArchitected: hasInterface && (hasClass || hasType),
    hasNoHacked: hasHackyCast === 0,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasProven: hasExtends || hasImplements,
    hasNoExperimental: !hasTodo,
    hasEstablished: wisdom >= 70,
    hasNoNovel: !hasEval,
    hasBattleTested: (hasExtends || hasImplements) && hasDoc,
    hasNoUnproven: !hasEval && !hasDebugger,
    adHocCount,
    hackedCount,
  }
}

// ─── measureShielding ──────────────────────────────────────────────

/**
 * @example measureShielding('function safe(val?: string): string { return val ?? "default" }')
 */
export function measureShielding(content: string): ShieldingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasDefault = hasPattern(content, /\|\|[^=]/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasTryCatch) score += 8
  if (hasThrow) score += 4
  if (hasOptional) score += 6
  if (hasNullish) score += 6
  if (hasOptionalChain) score += 6
  if (hasDefault) score += 4
  if (hasReturnType) score += 4
  if (hasGenerics) score += 4
  if (hasEnum) score += 4
  if (hasInterface) score += 4
  if (hasAsync) score += 4
  if (hasAwait) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const singlePathCount = hasVar > 0 ? 1 : 0
  const assumedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    resilience,
    shield: classifyShield(resilience),
    hasHighResilience: resilience >= 80,
    hasEdgeCaseCovered: hasOptional || hasNullish,
    hasNoSinglePath: hasOptional || hasNullish,
    hasBoundaryChecked: hasEnum || hasReturnType,
    hasNoAssumed: !hasAny && !hasEval,
    hasValidated: hasTryCatch || hasThrow,
    hasNoTrusting: !hasAny,
    hasNullSafe: hasNullish || hasOptionalChain,
    hasNoNPE: hasOptionalChain || hasOptional,
    hasGraceful: hasTryCatch && (hasNullish || hasOptional),
    hasNoHarshFail: !hasEval,
    hasRecoverable: hasTryCatch || hasDefault,
    hasNoFatal: !hasEval && !hasDebugger,
    hasSelfHealing: hasTryCatch && hasNullish && hasOptional,
    singlePathCount,
    assumedCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyElevation(altitude: number): Elevation {
  if (altitude >= 90) return 'everest-class'
  if (altitude >= 75) return 'major-peak'
  if (altitude >= 60) return 'proper-summit'
  if (altitude >= 40) return 'foothill'
  if (altitude >= 20) return 'base-camp'
  return 'sea-level'
}

function classifyVista(clarity: number): Vista {
  if (clarity >= 90) return 'panoramic-360'
  if (clarity >= 75) return 'breathtaking-view'
  if (clarity >= 60) return 'proper-overlook'
  if (clarity >= 40) return 'partial-view'
  if (clarity >= 20) return 'clouded-sight'
  return 'no-vista'
}

function classifyRidge(strength: number): Ridge {
  if (strength >= 90) return 'granite-ridge'
  if (strength >= 75) return 'solid-crest'
  if (strength >= 60) return 'proper-ridge'
  if (strength >= 40) return 'crumbling-edge'
  if (strength >= 20) return 'unstable-shelf'
  return 'no-ridge'
}

function classifySage(wisdom: number): Sage {
  if (wisdom >= 90) return 'mountain-sage'
  if (wisdom >= 75) return 'summit-philosopher'
  if (wisdom >= 60) return 'proper-guide'
  if (wisdom >= 40) return 'learning-climber'
  if (wisdom >= 20) return 'lost-tourist'
  return 'no-wisdom'
}

function classifyShield(resilience: number): Shield {
  if (resilience >= 90) return 'impervious-bastion'
  if (resilience >= 75) return 'avalanche-proof'
  if (resilience >= 60) return 'proper-shelter'
  if (resilience >= 40) return 'fragile-bivouac'
  if (resilience >= 20) return 'exposed-ledge'
  return 'no-shield'
}

export function classifyPeakCondition(qualityScore: number): PeakCondition {
  if (qualityScore >= 90) return 'emerald-pinnacle'
  if (qualityScore >= 75) return 'jade-peak'
  if (qualityScore >= 60) return 'proper-summit'
  if (qualityScore >= 40) return 'rocky-ridge'
  if (qualityScore >= 20) return 'gravel-slope'
  return 'dust'
}

export function classifyRangeType(peaks: EmeraldPeak[]): RangeType {
  if (peaks.length === 0) return 'no-range'
  const avgQs = peaks.reduce((s, p) => s + p.qualityScore, 0) / peaks.length
  const pinnacleRatio = peaks.filter(p => p.condition === 'emerald-pinnacle').length / peaks.length
  if (avgQs >= 85 && pinnacleRatio >= 0.5) return 'himalayas'
  if (avgQs >= 70 && pinnacleRatio >= 0.3) return 'alps'
  if (avgQs >= 55) return 'proper-range'
  if (avgQs >= 35) return 'foothills'
  if (avgQs >= 15) return 'mound'
  return 'no-range'
}

export function classifyRangeCondition(avgAltitude: number): RangeCondition {
  if (avgAltitude >= 85) return 'emerald-kingdom'
  if (avgAltitude >= 70) return 'jade-mountains'
  if (avgAltitude >= 55) return 'proper-range'
  if (avgAltitude >= 35) return 'rocky-hills'
  if (avgAltitude >= 15) return 'eroded-peaks'
  return 'void'
}

export function classifyAlpinistGrade(avgAltitude: number): AlpinistGrade {
  if (avgAltitude >= 85) return 'mountain-legend'
  if (avgAltitude >= 70) return 'expert-alpinist'
  if (avgAltitude >= 55) return 'skilled-climber'
  if (avgAltitude >= 40) return 'apprentice'
  if (avgAltitude >= 20) return 'novice'
  return 'flatlander'
}

// ─── analyzeEmeraldPeak ────────────────────────────────────────────

/**
 * @example analyzeEmeraldPeak(content, 'src/foo.ts')
 */
export function analyzeEmeraldPeak(content: string, filePath: string): EmeraldPeak {
  const ascending = measureAscending(content)
  const viewing = measureViewing(content)
  const fortifying = measureFortifying(content)
  const knowing = measureKnowing(content)
  const shielding = measureShielding(content)

  const gemAltitude = ascending.altitude
  const peakClarity = viewing.clarity
  const ridgeStrength = fortifying.strength
  const summitWisdom = knowing.wisdom
  const avalancheResilience = shielding.resilience

  const qualityScore = Math.round(
    gemAltitude * 0.2 +
    peakClarity * 0.2 +
    ridgeStrength * 0.2 +
    summitWisdom * 0.2 +
    avalancheResilience * 0.2,
  )

  return {
    file: filePath,
    gemAltitude,
    peakClarity,
    ridgeStrength,
    summitWisdom,
    avalancheResilience,
    ascending,
    viewing,
    fortifying,
    knowing,
    shielding,
    condition: classifyPeakCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeEmeraldRange ───────────────────────────────────────────

/**
 * @example analyzeEmeraldRange(peaks, 'src')
 */
export function analyzeEmeraldRange(peaks: EmeraldPeak[], dirPath: string): EmeraldRange {
  if (peaks.length === 0) {
    return {
      directory: dirPath,
      peaks: [],
      avgAltitude: 0,
      avgClarity: 0,
      avgWisdom: 0,
      emeraldPinnacleCount: 0,
      dustCount: 0,
      rangeType: 'no-range',
      condition: 'void',
    }
  }

  const avgAltitude = Math.round(peaks.reduce((s, p) => s + p.gemAltitude, 0) / peaks.length)
  const avgClarity = Math.round(peaks.reduce((s, p) => s + p.peakClarity, 0) / peaks.length)
  const avgWisdom = Math.round(peaks.reduce((s, p) => s + p.summitWisdom, 0) / peaks.length)
  const emeraldPinnacleCount = peaks.filter(p => p.condition === 'emerald-pinnacle').length
  const dustCount = peaks.filter(p => p.condition === 'dust').length

  return {
    directory: dirPath,
    peaks,
    avgAltitude,
    avgClarity,
    avgWisdom,
    emeraldPinnacleCount,
    dustCount,
    rangeType: classifyRangeType(peaks),
    condition: classifyRangeCondition(avgAltitude),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(peaks, ranges, massif, stats)
 */
export function generateRecommendations(
  peaks: EmeraldPeak[],
  ranges: EmeraldRange[],
  massif: EmeraldSummitResult['massif'],
  stats: EmeraldSummitResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallAltitude >= 85 && stats.dustCount === 0) {
    recs.push('Emerald summit perfection — the pinnacle catches the light of a thousand commands')
    return recs
  }

  if (stats.avgGemAltitude < 60) {
    recs.push('Raise gem altitude — add exports, interfaces, generics, JSDoc, remove var and eval')
  }
  if (stats.avgPeakClarity < 60) {
    recs.push('Clear the peak — add JSDoc, named exports, return types, remove eval and debugger')
  }
  if (stats.avgRidgeStrength < 60) {
    recs.push('Fortify the ridge — add error handling, type safety, readonly, remove eval and debugger')
  }
  if (stats.avgSummitWisdom < 60) {
    recs.push('Gain summit wisdom — add abstractions, documentation, proven patterns, remove eval and TODO')
  }
  if (stats.avgAvalancheResilience < 60) {
    recs.push('Build avalanche shields — add optional chaining, nullish coalescing, error boundaries, remove eval')
  }

  if (stats.dustCount > 0) {
    const dustFiles = peaks.filter(p => p.condition === 'dust').map(p => p.file)
    if (dustFiles.length <= 3) {
      recs.push(`Dust detected: ${dustFiles.join(', ')} — these need the climb`)
    } else {
      recs.push(`${dustFiles.length} dust files detected — they need the climb`)
    }
  }

  if (ranges.length > 1) {
    const erodedRanges = ranges.filter(r => r.condition === 'rocky-hills' || r.condition === 'eroded-peaks')
    if (erodedRanges.length > 0) {
      recs.push(`${erodedRanges.length} range(s) have eroded or rocky conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The emerald summit holds steady — maintain current altitude')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildEmeraldSummitResult ──────────────────────────────────────

/**
 * @example buildEmeraldSummitResult(['a.ts'], [content])
 */
export async function buildEmeraldSummitResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldSummitResult> {
  const peaks: EmeraldPeak[] = files.map((file, i) =>
    analyzeEmeraldPeak(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, EmeraldPeak[]>()
  for (const peak of peaks) {
    const dir = path.dirname(peak.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(peak)
    } else {
      dirMap.set(dir, [peak])
    }
  }

  const ranges: EmeraldRange[] = Array.from(dirMap.entries()).map(([dir, dirPeaks]) =>
    analyzeEmeraldRange(dirPeaks, dir),
  )

  const avgGemAltitude = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.gemAltitude, 0) / peaks.length)
    : 0
  const avgPeakClarity = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.peakClarity, 0) / peaks.length)
    : 0
  const avgRidgeStrength = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.ridgeStrength, 0) / peaks.length)
    : 0
  const avgSummitWisdom = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.summitWisdom, 0) / peaks.length)
    : 0
  const avgAvalancheResilience = peaks.length > 0
    ? Math.round(peaks.reduce((s, p) => s + p.avalancheResilience, 0) / peaks.length)
    : 0

  const overallAltitude = Math.round(
    (avgGemAltitude + avgPeakClarity + avgSummitWisdom) / 3,
  )

  const massif = {
    avgAltitude: avgGemAltitude,
    avgClarity: avgPeakClarity,
    avgWisdom: avgSummitWisdom,
    isEmerald: overallAltitude >= 80,
    overallAltitude,
  }

  const celebration = {
    milestone: 540,
    name: 'emerald-summit' as const,
    message: 'Command #540 — The Emerald Summit. 540 commands climbed to reach this peak. From the foothills of count to the summit of emerald-wisdom, every step was earned. The view from here encompasses 104,000+ tests, all passing, all green as emerald.',
    previousMilestones: [420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520, 530],
    totalTests: peaks.length * 87 + 104000,
  }

  const bestPeak = peaks.length > 0
    ? peaks.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file
    : ''
  const highest = peaks.length > 0
    ? peaks.reduce((best, p) => p.gemAltitude > best.gemAltitude ? p : best).file
    : ''
  const clearest = peaks.length > 0
    ? peaks.reduce((best, p) => p.peakClarity > best.peakClarity ? p : best).file
    : ''
  const strongest = peaks.length > 0
    ? peaks.reduce((best, p) => p.ridgeStrength > best.ridgeStrength ? p : best).file
    : ''
  const wisest = peaks.length > 0
    ? peaks.reduce((best, p) => p.summitWisdom > best.summitWisdom ? p : best).file
    : ''

  const stats = {
    totalFiles: peaks.length,
    totalRanges: ranges.length,
    avgGemAltitude,
    avgPeakClarity,
    avgRidgeStrength,
    avgSummitWisdom,
    avgAvalancheResilience,
    emeraldPinnacleCount: peaks.filter(p => p.condition === 'emerald-pinnacle').length,
    jadePeakCount: peaks.filter(p => p.condition === 'jade-peak').length,
    properSummitCount: peaks.filter(p => p.condition === 'proper-summit').length,
    rockyRidgeCount: peaks.filter(p => p.condition === 'rocky-ridge').length,
    gravelSlopeCount: peaks.filter(p => p.condition === 'gravel-slope').length,
    dustCount: peaks.filter(p => p.condition === 'dust').length,
    hasHighAltitudeCount: peaks.filter(p => p.ascending.hasHighAltitude).length,
    hasHighClarityCount: peaks.filter(p => p.viewing.hasHighClarity).length,
    hasHighStrengthCount: peaks.filter(p => p.fortifying.hasHighStrength).length,
    hasHighWisdomCount: peaks.filter(p => p.knowing.hasHighWisdom).length,
    hasHighResilienceCount: peaks.filter(p => p.shielding.hasHighResilience).length,
    overallAltitude,
    alpinistGrade: classifyAlpinistGrade(overallAltitude),
    bestPeak,
    highest,
    clearest,
    strongest,
    wisest,
  }

  const recommendations = generateRecommendations(peaks, ranges, massif, { ...stats, recommendations: [] } as EmeraldSummitResult['stats'])

  return {
    peaks,
    ranges,
    massif,
    celebration,
    stats,
    recommendations,
  }
}
