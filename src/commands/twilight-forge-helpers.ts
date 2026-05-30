// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Transition = 'seamless-fade' | 'smooth-crossing' | 'proper-bridge' | 'jarring-shift' | 'broken-transition' | 'no-grace'
export type Dusk = 'night-vision' | 'low-light-adapted' | 'proper-twilight' | 'light-dependent' | 'blind-in-dark' | 'no-resilience'
export type Star = 'first-star' | 'bright-planet' | 'proper-light' | 'dim-star' | 'invisible-body' | 'no-star'
export type Forge = 'adaptive-smith' | 'flexible-forge' | 'proper-adaptation' | 'rigid-forge' | 'stuck-in-daylight' | 'no-adaptation'
export type Ember = 'dying-sun-wisdom' | 'twilight-sage' | 'proper-insight' | 'fading-memory' | 'lost-light' | 'no-wisdom'
export type TwilightCondition = 'twilight-masterpiece' | 'starlit-forge' | 'proper-dusk' | 'fading-light' | 'dark-forge' | 'void'
export type WorkshopType = 'grand-atelier' | 'proper-forge' | 'small-workshop' | 'humble-shed' | 'dark-corner' | 'no-workshop'
export type WorkshopCondition = 'twilight-empire' | 'starlit-workshop' | 'proper-forge' | 'dim-foundry' | 'dark-cellar' | 'void'
export type SmithGrade = 'twilight-master' | 'star-forger' | 'dusk-smith' | 'apprentice' | 'novice' | 'blind-forger'

export interface BridgingMeasure {
  grace: number
  transition: Transition
  hasHighGrace: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasPredictable: boolean
  hasNoErratic: boolean
  hasConsistent: boolean
  hasNoVolatile: boolean
  hasGradual: boolean
  hasNoAbrupt: boolean
  hasHandled: boolean
  hasNoCrashOnSwitch: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasStable: boolean
  hasNoUnstable: boolean
  jerkyCount: number
  erraticCount: number
}

export interface EnduringMeasure {
  resilience: number
  dusk: Dusk
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface EmergingMeasure {
  emergence: number
  star: Star
  hasHighEmergence: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasObvious: boolean
  hasNoSubtle: boolean
  hasRevealed: boolean
  hasNoConcealed: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface AdaptingMeasure {
  twilight: number
  forge: Forge
  hasHighTwilight: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasExtensible: boolean
  hasNoHardcoded: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasEfficient: boolean
  hasNoBottlenecked: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hardcodedCount: number
  tangledCount: number
}

export interface KnowingMeasure {
  wisdom: number
  ember: Ember
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  hasBattleTested: boolean
  adHocCount: number
  hackyCount: number
}

export interface TwilightSpark {
  file: string
  transitionGrace: number
  duskResilience: number
  starEmergence: number
  forgeTwilight: number
  emberWisdom: number
  bridging: BridgingMeasure
  enduring: EnduringMeasure
  emerging: EmergingMeasure
  adapting: AdaptingMeasure
  knowing: KnowingMeasure
  condition: TwilightCondition
  qualityScore: number
}

export interface TwilightWorkshop {
  directory: string
  sparks: TwilightSpark[]
  avgGrace: number
  avgResilience: number
  avgWisdom: number
  twilightMasterpieceCount: number
  voidCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

export interface TwilightForgeResult {
  sparks: TwilightSpark[]
  workshops: TwilightWorkshop[]
  dusk: {
    avgGrace: number
    avgResilience: number
    avgWisdom: number
    isTwilight: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalWorkshops: number
    avgTransitionGrace: number
    avgDuskResilience: number
    avgStarEmergence: number
    avgForgeTwilight: number
    avgEmberWisdom: number
    twilightMasterpieceCount: number
    starlitForgeCount: number
    properDuskCount: number
    fadingLightCount: number
    darkForgeCount: number
    voidCount: number
    hasHighGraceCount: number
    hasHighResilienceCount: number
    hasHighEmergenceCount: number
    hasHighTwilightCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    smithGrade: SmithGrade
    bestSpark: string
    mostGraceful: string
    mostResilient: string
    brightest: string
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

// ─── measureBridging ───────────────────────────────────────────────

/**
 * @example measureBridging('export function transition(state: State): Void {}')
 */
export function measureBridging(content: string): BridgingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasDoc) score += 4
  if (hasInterface) score += 4
  if (hasNamed) score += 4
  if (hasGenerics) score += 4
  if (hasOptional) score += 6
  if (hasTryCatch) score += 6
  if (hasAsync) score += 4
  if (hasPipeline) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const grace = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const jerkyCount = (hasVar > 0 ? 1 : 0) + (hasEval ? 1 : 0)
  const erraticCount = (hasAny ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    grace,
    transition: classifyTransition(grace),
    hasHighGrace: grace >= 80,
    hasSmooth: hasReturnType && hasNamed,
    hasNoJerky: hasVar === 0 && !hasEval,
    hasPredictable: hasReturnType && !hasAny,
    hasNoErratic: !hasEval && !hasAny,
    hasConsistent: hasReturnType && hasConst,
    hasNoVolatile: hasVar === 0 && !hasDebugger,
    hasGradual: hasOptional && hasReturnType,
    hasNoAbrupt: !hasEval,
    hasHandled: hasTryCatch,
    hasNoCrashOnSwitch: !hasEval && !hasDebugger,
    hasReliable: hasConst && !hasDebugger,
    hasNoFlaky: hasVar === 0 && !hasDebugger,
    hasStable: hasExport && hasConst && !hasAny,
    hasNoUnstable: !hasAny && !hasDebugger,
    jerkyCount,
    erraticCount,
  }
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('try { const result = parse(data) } catch { return fallback }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExtends = hasPattern(content, /\bextends\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasTryCatch) score += 6
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasOptional) score += 6
  if (hasReadonly) score += 4
  if (hasGenerics) score += 4
  if (hasPrivate) score += 4
  if (hasInterface) score += 4
  if (hasAsync) score += 4
  if (hasDoc) score += 6
  if (hasExtends) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 6

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bareCrashCount = hasVar > 0 ? 1 : 0
  const untestedCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    resilience,
    dusk: classifyDusk(resilience),
    hasHighResilience: resilience >= 80,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: hasVar === 0,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasDefensive: hasOptional && !hasAny,
    hasNoNaive: !hasEval && !hasAny,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasGraceful: hasTryCatch && hasReturnType,
    hasNoHarshFail: !hasEval && !hasDebugger,
    hasRecoverable: hasTryCatch && hasConst,
    hasNoFatal: !hasEval,
    hasRobust: hasTryCatch && hasReturnType && !hasAny,
    hasNoFragile: hasVar === 0 && !hasEval && !hasDebugger,
    bareCrashCount,
    untestedCount,
  }
}

// ─── measureEmerging ───────────────────────────────────────────────

/**
 * @example measureEmerging('export interface Catalog<T> { list(): T[] }')
 */
export function measureEmerging(content: string): EmergingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasType = hasPattern(content, /\btype\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasDoc) score += 6
  if (hasInterface) score += 6
  if (hasNamed) score += 4
  if (hasGenerics) score += 4
  if (hasReadonly) score += 4
  if (hasEnum) score += 4
  if (hasType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const emergence = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    emergence,
    star: classifyStar(emergence),
    hasHighEmergence: emergence >= 80,
    hasVisible: hasExport,
    hasNoHidden: !hasEval,
    hasReadable: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasClear: hasReturnType && !hasAny,
    hasNoObfuscated: !hasEval && !hasAny,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoMystery: !hasEval,
    hasUnderstandable: hasTypeAnnotation && hasConst,
    hasNoArcane: !hasEval && !hasAny,
    hasObvious: hasDoc && hasReturnType && hasExport,
    hasNoSubtle: !hasAny,
    hasRevealed: hasExport && hasReturnType,
    hasNoConcealed: !hasDebugger,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureAdapting ───────────────────────────────────────────────

/**
 * @example measureAdapting('export interface Plugin<T> { configure(opts?: T): Void }')
 */
export function measureAdapting(content: string): AdaptingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 4
  if (hasImplements) score += 4
  if (hasGenerics) score += 6
  if (hasOptional) score += 6
  if (hasPipeline) score += 4
  if (hasArrow) score += 4
  if (hasAsync) score += 4
  if (hasConst) score += 4
  if (hasAbstract) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4

  const twilight = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const hardcodedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const tangledCount = hasVar > 0 ? 1 : 0

  return {
    twilight,
    forge: classifyForge(twilight),
    hasHighTwilight: twilight >= 80,
    hasFlexible: hasOptional && hasGenerics,
    hasNoRigid: !hasEval && !hasAny,
    hasExtensible: hasExtends || hasImplements,
    hasNoHardcoded: !hasEval && !hasAny,
    hasModular: hasExport && (hasInterface || hasType),
    hasNoMonolithic: !hasEval,
    hasCleanPipelines: hasPipeline && hasConst,
    hasNoTangled: hasVar === 0,
    hasEfficient: hasPipeline && hasArrow,
    hasNoBottlenecked: !hasEval,
    hasStreamlined: hasAsync && hasPipeline,
    hasNoCircuits: hasVar === 0 && !hasAny,
    hasWellStructured: hasInterface && hasExport,
    hasNoChaotic: hasVar === 0 && !hasEval,
    hardcodedCount,
    tangledCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('/** docs *\\/ export class Vault extends Base implements IStore {}')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 4
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4
  if (hasGenerics) score += 4
  if (hasClass) score += 4
  if (hasPrivate) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const hackyCount = hasHackyCast

  return {
    wisdom,
    ember: classifyEmber(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && hasExtends && !hasAny,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoHacky: hasHackyCast === 0,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasEstablished: hasExtends && hasImplements,
    hasBattleTested: hasTryCatch && hasDoc && !hasAny,
    adHocCount,
    hackyCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyTransition(grace: number): Transition {
  if (grace >= 90) return 'seamless-fade'
  if (grace >= 75) return 'smooth-crossing'
  if (grace >= 60) return 'proper-bridge'
  if (grace >= 40) return 'jarring-shift'
  if (grace >= 20) return 'broken-transition'
  return 'no-grace'
}

function classifyDusk(resilience: number): Dusk {
  if (resilience >= 90) return 'night-vision'
  if (resilience >= 75) return 'low-light-adapted'
  if (resilience >= 60) return 'proper-twilight'
  if (resilience >= 40) return 'light-dependent'
  if (resilience >= 20) return 'blind-in-dark'
  return 'no-resilience'
}

function classifyStar(emergence: number): Star {
  if (emergence >= 90) return 'first-star'
  if (emergence >= 75) return 'bright-planet'
  if (emergence >= 60) return 'proper-light'
  if (emergence >= 40) return 'dim-star'
  if (emergence >= 20) return 'invisible-body'
  return 'no-star'
}

function classifyForge(twilight: number): Forge {
  if (twilight >= 90) return 'adaptive-smith'
  if (twilight >= 75) return 'flexible-forge'
  if (twilight >= 60) return 'proper-adaptation'
  if (twilight >= 40) return 'rigid-forge'
  if (twilight >= 20) return 'stuck-in-daylight'
  return 'no-adaptation'
}

function classifyEmber(wisdom: number): Ember {
  if (wisdom >= 90) return 'dying-sun-wisdom'
  if (wisdom >= 75) return 'twilight-sage'
  if (wisdom >= 60) return 'proper-insight'
  if (wisdom >= 40) return 'fading-memory'
  if (wisdom >= 20) return 'lost-light'
  return 'no-wisdom'
}

export function classifyTwilightCondition(qualityScore: number): TwilightCondition {
  if (qualityScore >= 90) return 'twilight-masterpiece'
  if (qualityScore >= 75) return 'starlit-forge'
  if (qualityScore >= 60) return 'proper-dusk'
  if (qualityScore >= 40) return 'fading-light'
  if (qualityScore >= 20) return 'dark-forge'
  return 'void'
}

export function classifyWorkshopType(sparks: TwilightSpark[]): WorkshopType {
  if (sparks.length === 0) return 'no-workshop'
  const avgQs = sparks.reduce((s, sp) => s + sp.qualityScore, 0) / sparks.length
  const masterpieceRatio = sparks.filter(sp => sp.condition === 'twilight-masterpiece').length / sparks.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'grand-atelier'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'proper-forge'
  if (avgQs >= 55) return 'small-workshop'
  if (avgQs >= 35) return 'humble-shed'
  if (avgQs >= 15) return 'dark-corner'
  return 'no-workshop'
}

export function classifyWorkshopCondition(avgGrace: number): WorkshopCondition {
  if (avgGrace >= 85) return 'twilight-empire'
  if (avgGrace >= 70) return 'starlit-workshop'
  if (avgGrace >= 55) return 'proper-forge'
  if (avgGrace >= 35) return 'dim-foundry'
  if (avgGrace >= 15) return 'dark-cellar'
  return 'void'
}

export function classifySmithGrade(avgLuminosity: number): SmithGrade {
  if (avgLuminosity >= 85) return 'twilight-master'
  if (avgLuminosity >= 70) return 'star-forger'
  if (avgLuminosity >= 55) return 'dusk-smith'
  if (avgLuminosity >= 40) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'blind-forger'
}

// ─── analyzeTwilightSpark ──────────────────────────────────────────

/**
 * @example analyzeTwilightSpark(content, 'src/foo.ts')
 */
export function analyzeTwilightSpark(content: string, filePath: string): TwilightSpark {
  const bridging = measureBridging(content)
  const enduring = measureEnduring(content)
  const emerging = measureEmerging(content)
  const adapting = measureAdapting(content)
  const knowing = measureKnowing(content)

  const transitionGrace = bridging.grace
  const duskResilience = enduring.resilience
  const starEmergence = emerging.emergence
  const forgeTwilight = adapting.twilight
  const emberWisdom = knowing.wisdom

  const qualityScore = Math.round(
    transitionGrace * 0.2 +
    duskResilience * 0.2 +
    starEmergence * 0.2 +
    forgeTwilight * 0.2 +
    emberWisdom * 0.2,
  )

  return {
    file: filePath,
    transitionGrace,
    duskResilience,
    starEmergence,
    forgeTwilight,
    emberWisdom,
    bridging,
    enduring,
    emerging,
    adapting,
    knowing,
    condition: classifyTwilightCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeTwilightWorkshop ───────────────────────────────────────

/**
 * @example analyzeTwilightWorkshop(sparks, 'src')
 */
export function analyzeTwilightWorkshop(sparks: TwilightSpark[], dirPath: string): TwilightWorkshop {
  if (sparks.length === 0) {
    return {
      directory: dirPath,
      sparks: [],
      avgGrace: 0,
      avgResilience: 0,
      avgWisdom: 0,
      twilightMasterpieceCount: 0,
      voidCount: 0,
      workshopType: 'no-workshop',
      condition: 'void',
    }
  }

  const avgGrace = Math.round(sparks.reduce((s, sp) => s + sp.transitionGrace, 0) / sparks.length)
  const avgResilience = Math.round(sparks.reduce((s, sp) => s + sp.duskResilience, 0) / sparks.length)
  const avgWisdom = Math.round(sparks.reduce((s, sp) => s + sp.emberWisdom, 0) / sparks.length)
  const twilightMasterpieceCount = sparks.filter(sp => sp.condition === 'twilight-masterpiece').length
  const voidCount = sparks.filter(sp => sp.condition === 'void').length

  return {
    directory: dirPath,
    sparks,
    avgGrace,
    avgResilience,
    avgWisdom,
    twilightMasterpieceCount,
    voidCount,
    workshopType: classifyWorkshopType(sparks),
    condition: classifyWorkshopCondition(avgGrace),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(sparks, workshops, dusk, stats)
 */
export function generateRecommendations(
  sparks: TwilightSpark[],
  workshops: TwilightWorkshop[],
  _dusk: TwilightForgeResult['dusk'],
  stats: TwilightForgeResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallLuminosity >= 85 && stats.voidCount === 0) {
    recs.push('Twilight forge perfection — the forge burns with dying-sun brilliance')
    return recs
  }

  if (stats.avgTransitionGrace < 60) {
    recs.push('Smooth the transitions — add return types, optionals, error handling, remove eval and var')
  }
  if (stats.avgDuskResilience < 60) {
    recs.push('Strengthen dusk resilience — add try-catch, type safety, defensive patterns, remove eval and debugger')
  }
  if (stats.avgStarEmergence < 60) {
    recs.push('Reveal the stars — add exports, return types, docs, generics, remove eval and any')
  }
  if (stats.avgForgeTwilight < 60) {
    recs.push('Adapt the forge — add generics, optionals, interfaces, pipelines, remove eval and any')
  }
  if (stats.avgEmberWisdom < 60) {
    recs.push('Gather ember wisdom — add documentation, abstractions, proven patterns, remove eval and any')
  }

  if (stats.voidCount > 0) {
    const voidFiles = sparks.filter(sp => sp.condition === 'void').map(sp => sp.file)
    if (voidFiles.length <= 3) {
      recs.push(`Void detected: ${voidFiles.join(', ')} — these need twilight energy`)
    } else {
      recs.push(`${voidFiles.length} void files detected — they need twilight energy`)
    }
  }

  if (workshops.length > 1) {
    const dimWorkshops = workshops.filter(w => w.condition === 'dim-foundry' || w.condition === 'dark-cellar')
    if (dimWorkshops.length > 0) {
      recs.push(`${dimWorkshops.length} workshop(s) have dim or dark conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The twilight forge holds steady — maintain current luminosity')
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

// ─── buildTwilightForgeResult ──────────────────────────────────────

/**
 * @example buildTwilightForgeResult(['a.ts'], [content])
 */
export async function buildTwilightForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TwilightForgeResult> {
  const sparks: TwilightSpark[] = files.map((file, i) =>
    analyzeTwilightSpark(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TwilightSpark[]>()
  for (const spark of sparks) {
    const dir = path.dirname(spark.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(spark)
    } else {
      dirMap.set(dir, [spark])
    }
  }

  const workshops: TwilightWorkshop[] = Array.from(dirMap.entries()).map(([dir, dirSparks]) =>
    analyzeTwilightWorkshop(dirSparks, dir),
  )

  const avgTransitionGrace = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.transitionGrace, 0) / sparks.length)
    : 0
  const avgDuskResilience = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.duskResilience, 0) / sparks.length)
    : 0
  const avgStarEmergence = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.starEmergence, 0) / sparks.length)
    : 0
  const avgForgeTwilight = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.forgeTwilight, 0) / sparks.length)
    : 0
  const avgEmberWisdom = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.emberWisdom, 0) / sparks.length)
    : 0

  const overallLuminosity = Math.round(
    (avgTransitionGrace + avgDuskResilience + avgEmberWisdom) / 3,
  )

  const dusk = {
    avgGrace: avgTransitionGrace,
    avgResilience: avgDuskResilience,
    avgWisdom: avgEmberWisdom,
    isTwilight: overallLuminosity >= 80,
    overallLuminosity,
  }

  const bestSpark = sparks.length > 0
    ? sparks.reduce((best, sp) => sp.qualityScore > best.qualityScore ? sp : best).file
    : ''
  const mostGraceful = sparks.length > 0
    ? sparks.reduce((best, sp) => sp.transitionGrace > best.transitionGrace ? sp : best).file
    : ''
  const mostResilient = sparks.length > 0
    ? sparks.reduce((best, sp) => sp.duskResilience > best.duskResilience ? sp : best).file
    : ''
  const brightest = sparks.length > 0
    ? sparks.reduce((best, sp) => sp.starEmergence > best.starEmergence ? sp : best).file
    : ''
  const wisest = sparks.length > 0
    ? sparks.reduce((best, sp) => sp.emberWisdom > best.emberWisdom ? sp : best).file
    : ''

  const stats = {
    totalFiles: sparks.length,
    totalWorkshops: workshops.length,
    avgTransitionGrace,
    avgDuskResilience,
    avgStarEmergence,
    avgForgeTwilight,
    avgEmberWisdom,
    twilightMasterpieceCount: sparks.filter(sp => sp.condition === 'twilight-masterpiece').length,
    starlitForgeCount: sparks.filter(sp => sp.condition === 'starlit-forge').length,
    properDuskCount: sparks.filter(sp => sp.condition === 'proper-dusk').length,
    fadingLightCount: sparks.filter(sp => sp.condition === 'fading-light').length,
    darkForgeCount: sparks.filter(sp => sp.condition === 'dark-forge').length,
    voidCount: sparks.filter(sp => sp.condition === 'void').length,
    hasHighGraceCount: sparks.filter(sp => sp.bridging.hasHighGrace).length,
    hasHighResilienceCount: sparks.filter(sp => sp.enduring.hasHighResilience).length,
    hasHighEmergenceCount: sparks.filter(sp => sp.emerging.hasHighEmergence).length,
    hasHighTwilightCount: sparks.filter(sp => sp.adapting.hasHighTwilight).length,
    hasHighWisdomCount: sparks.filter(sp => sp.knowing.hasHighWisdom).length,
    overallLuminosity,
    smithGrade: classifySmithGrade(overallLuminosity),
    bestSpark,
    mostGraceful,
    mostResilient,
    brightest,
    wisest,
  }

  const recommendations = generateRecommendations(sparks, workshops, dusk, { ...stats, recommendations: [] } as TwilightForgeResult['stats'])

  return {
    sparks,
    workshops,
    dusk,
    stats,
    recommendations,
  }
}
