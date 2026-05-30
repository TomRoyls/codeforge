// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Moon = 'full-silver-moon' | 'bright-crescent' | 'proper-glow' | 'clouded-moon' | 'dark-night' | 'no-light'
export type Tide = 'moon-driven' | 'steady-rhythm' | 'proper-pulse' | 'irregular-beat' | 'arrhythmia' | 'no-rhythm'
export type Stream = 'silver-river' | 'smooth-flow' | 'proper-current' | 'turbulent-rapid' | 'stagnant-pool' | 'no-flow'
export type Wave = 'surgical-wave' | 'precise-break' | 'proper-crest' | 'approximate-splash' | 'scattered-surf' | 'no-precision'
export type Depth = 'abyssal-wisdom' | 'deep-knowledge' | 'proper-understanding' | 'surface-awareness' | 'shallow-pool' | 'no-wisdom'
export type WaveCondition = 'silver-masterpiece' | 'moonlit-wave' | 'proper-tide' | 'murky-current' | 'stagnant-pool' | 'dry-bed'
export type ShoreType = 'silver-coast' | 'moonlit-beach' | 'proper-shore' | 'sandy-bank' | 'mud-flat' | 'no-shore'
export type ShoreCondition = 'magnificent-shore' | 'beautiful-coast' | 'proper-beach' | 'murky-bank' | 'dried-up' | 'void'
export type NavigatorGrade = 'moon-captain' | 'silver-navigator' | 'skilled-sailor' | 'apprentice' | 'novice' | 'landlubber'

export interface PurifyingMeasure {
  purity: number
  moon: Moon
  hasHighPurity: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasNoHacky: boolean
  hasNoDuplicates: boolean
  hasReadable: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasPristine: boolean
  hasNoTarnished: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasLuminous: boolean
  deadCodeCount: number
  hackyCount: number
}

export interface PulsingMeasure {
  rhythm: number
  tide: Tide
  hasHighRhythm: boolean
  hasReliable: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasPredictable: boolean
  hasNoFlaky: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  erraticCount: number
  untestedCount: number
}

export interface FlowingMeasure {
  current: number
  stream: Stream
  hasHighCurrent: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasGraceful: boolean
  hasNoJerky: boolean
  hasFluid: boolean
  hasNoClunky: boolean
  hasElegant: boolean
  bottleneckCount: number
  tangledCount: number
}

export interface StrikingMeasure {
  precision: number
  wave: Wave
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasCrystalline: boolean
  hasNoMurky: boolean
  approximateCount: number
  sloppyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  depth: Depth
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

export interface SilverWave {
  file: string
  lunarPurity: number
  tidalRhythm: number
  moonlitCurrent: number
  wavePrecision: number
  oceanWisdom: number
  purifying: PurifyingMeasure
  pulsing: PulsingMeasure
  flowing: FlowingMeasure
  striking: StrikingMeasure
  knowing: KnowingMeasure
  condition: WaveCondition
  qualityScore: number
}

export interface SilverShore {
  directory: string
  waves: SilverWave[]
  avgPurity: number
  avgRhythm: number
  avgWisdom: number
  silverMasterpieceCount: number
  dryBedCount: number
  shoreType: ShoreType
  condition: ShoreCondition
}

export interface SilverTideResult {
  waves: SilverWave[]
  shores: SilverShore[]
  ocean: {
    avgPurity: number
    avgRhythm: number
    avgWisdom: number
    isSilver: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalShores: number
    avgLunarPurity: number
    avgTidalRhythm: number
    avgMoonlitCurrent: number
    avgWavePrecision: number
    avgOceanWisdom: number
    silverMasterpieceCount: number
    moonlitWaveCount: number
    properTideCount: number
    murkyCurrentCount: number
    stagnantPoolCount: number
    dryBedCount: number
    hasHighPurityCount: number
    hasHighRhythmCount: number
    hasHighCurrentCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    navigatorGrade: NavigatorGrade
    bestWave: string
    purest: string
    bestRhythm: string
    mostFluid: string
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

// ─── measurePurifying ──────────────────────────────────────────────

/**
 * @example measurePurifying('export function clean(): String { return "pure" }')
 */
export function measurePurifying(content: string): PurifyingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasType = hasPattern(content, /\btype\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasConsole = countPattern(content, /\bconsole\.\w+\(/)

  if (hasExport) score += 6
  if (hasConst) score += 4
  if (hasReturnType) score += 6
  if (hasInterface) score += 6
  if (hasGenerics) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasAsync) score += 4
  if (hasDoc) score += 6
  if (hasType) score += 4
  if (hasNamed) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasTodo) score -= 4
  if (hasConsole > 0) score -= Math.min(hasConsole * 2, 6)

  const purity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const deadCodeCount = (hasDebugger ? 1 : 0) + (hasConsole > 0 ? 1 : 0)
  const hackyCount = (hasEval ? 1 : 0) + (hasTodo ? 1 : 0)

  return {
    purity,
    moon: classifyMoon(purity),
    hasHighPurity: purity >= 80,
    hasClean: !hasEval && !hasDebugger,
    hasNoDeadCode: !hasDebugger && hasConsole === 0,
    hasNoHacky: !hasEval && !hasTodo,
    hasNoDuplicates: hasVar === 0,
    hasReadable: hasConst && !hasEval,
    hasNoObfuscated: !hasEval,
    hasClear: hasReturnType && !hasAny,
    hasNoCryptic: !hasEval && hasVar === 0,
    hasPristine: hasExport && !hasAny && !hasEval,
    hasNoTarnished: !hasTodo && !hasDebugger,
    hasPolished: hasReturnType && hasReadonly,
    hasNoRough: hasVar === 0 && !hasDebugger,
    hasLuminous: hasDoc && hasExport && !hasAny,
    deadCodeCount,
    hackyCount,
  }
}

// ─── measurePulsing ────────────────────────────────────────────────

/**
 * @example measurePulsing('try { await work() } catch (e) { handle(e) }')
 */
export function measurePulsing(content: string): PulsingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasCatch = hasPattern(content, /\bcatch\b/)
  const hasFinally = hasPattern(content, /\bfinally\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasThrow = hasPattern(content, /\bthrow\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasMathRandom = hasPattern(content, /Math\.random\(\)/)

  if (hasTryCatch) score += 8
  if (hasCatch) score += 4
  if (hasFinally) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasReturnType) score += 6
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasPipeline) score += 4
  if (hasGenerics) score += 4
  if (hasThrow) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasMathRandom) score -= 4

  const rhythm = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const erraticCount = (hasEval ? 1 : 0) + (hasMathRandom ? 1 : 0)
  const untestedCount = hasVar > 0 ? 1 : 0

  return {
    rhythm,
    tide: classifyTide(rhythm),
    hasHighRhythm: rhythm >= 80,
    hasReliable: hasTryCatch && !hasEval,
    hasConsistent: hasConst && !hasEval,
    hasNoErratic: !hasEval && !hasMathRandom,
    hasTested: hasTryCatch || hasThrow,
    hasNoUntested: hasVar === 0,
    hasDeterministic: !hasMathRandom && !hasEval,
    hasNoRandom: !hasMathRandom,
    hasPredictable: hasReturnType && !hasAny,
    hasNoFlaky: !hasDebugger && !hasMathRandom,
    hasSmooth: hasAsync && hasAwait,
    hasNoJerky: !hasDebugger && hasVar === 0,
    hasStable: hasTryCatch && hasReturnType,
    hasNoVolatile: !hasEval && !hasDebugger,
    erraticCount,
    untestedCount,
  }
}

// ─── measureFlowing ────────────────────────────────────────────────

/**
 * @example measureFlowing('export function pipe<T>(x: T): T { return x }')
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasNestedTernary = countPattern(content, /\?.*:.*/)

  if (hasExport) score += 6
  if (hasNamed) score += 4
  if (hasImport) score += 4
  if (hasConst) score += 4
  if (hasArrow) score += 4
  if (hasPipeline) score += 6
  if (hasAsync) score += 4
  if (hasAwait) score += 4
  if (hasReturnType) score += 6
  if (hasGenerics) score += 4
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasNestedTernary > 2) score -= 4

  const current = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bottleneckCount = hasNestedTernary > 2 ? 1 : 0
  const tangledCount = (hasVar > 0 ? 1 : 0) + (hasEval ? 1 : 0)

  return {
    current,
    stream: classifyStream(current),
    hasHighCurrent: current >= 80,
    hasEfficientFlow: hasPipeline && hasArrow,
    hasNoBottlenecks: hasNestedTernary <= 2,
    hasStreamlined: hasPipeline,
    hasNoCircuits: !hasEval,
    hasDirectPaths: hasReturnType && !hasAny,
    hasNoIndirection: !hasAny,
    hasCleanPipelines: hasPipeline && !hasEval,
    hasNoTangled: hasVar === 0 && !hasEval,
    hasGraceful: hasOptional && hasNullish,
    hasNoJerky: !hasEval && hasVar === 0,
    hasFluid: hasAsync && hasPipeline,
    hasNoClunky: hasVar === 0 && !hasAny,
    hasElegant: hasGenerics && hasPipeline,
    bottleneckCount,
    tangledCount,
  }
}

// ─── measureStriking ───────────────────────────────────────────────

/**
 * @example measureStriking('export function precise(x: String): String { return x }')
 */
export function measureStriking(content: string): StrikingMeasure {
  let score = 0

  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasInterface) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 6
  if (hasOptional) score += 4
  if (hasExport) score += 4
  if (hasNamed) score += 4
  if (hasEnum) score += 4
  if (hasType) score += 4
  if (hasPrivate) score += 4
  if (hasDoc) score += 6

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)
  if (hasAny) score -= 6

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const approximateCount = hasVar > 0 ? 1 : 0
  const sloppyCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    precision,
    wave: classifyWave(precision),
    hasHighPrecision: precision >= 80,
    hasExact: hasReturnType && hasTypeAnnotation,
    hasAccurate: hasInterface && hasGenerics,
    hasNoApproximate: hasVar === 0,
    hasCorrect: hasReadonly && !hasAny,
    hasNoAlmostRight: hasVar === 0 && !hasEval,
    hasSharp: hasReturnType && !hasAny,
    hasNoSloppy: !hasDebugger && !hasEval,
    hasDefined: hasInterface || hasType,
    hasNoFuzzy: !hasAny && !hasEval,
    hasPrecise: hasReadonly && hasOptional,
    hasNoVague: !hasAny,
    hasCrystalline: hasReturnType && hasReadonly && !hasAny,
    hasNoMurky: !hasEval && !hasAny && hasVar === 0,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('/** docs *\\/ export interface Store<T> { get(key: string): T }')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasGenerics) score += 6
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = hasVar > 0 ? 1 : 0
  const hackyCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    wisdom,
    depth: classifyDepth(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && hasExport,
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
    hasBattleTested: hasTryCatch && hasExport && !hasAny,
    adHocCount,
    hackyCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyMoon(purity: number): Moon {
  if (purity >= 90) return 'full-silver-moon'
  if (purity >= 75) return 'bright-crescent'
  if (purity >= 60) return 'proper-glow'
  if (purity >= 40) return 'clouded-moon'
  if (purity >= 20) return 'dark-night'
  return 'no-light'
}

function classifyTide(rhythm: number): Tide {
  if (rhythm >= 90) return 'moon-driven'
  if (rhythm >= 75) return 'steady-rhythm'
  if (rhythm >= 60) return 'proper-pulse'
  if (rhythm >= 40) return 'irregular-beat'
  if (rhythm >= 20) return 'arrhythmia'
  return 'no-rhythm'
}

function classifyStream(current: number): Stream {
  if (current >= 90) return 'silver-river'
  if (current >= 75) return 'smooth-flow'
  if (current >= 60) return 'proper-current'
  if (current >= 40) return 'turbulent-rapid'
  if (current >= 20) return 'stagnant-pool'
  return 'no-flow'
}

function classifyWave(precision: number): Wave {
  if (precision >= 90) return 'surgical-wave'
  if (precision >= 75) return 'precise-break'
  if (precision >= 60) return 'proper-crest'
  if (precision >= 40) return 'approximate-splash'
  if (precision >= 20) return 'scattered-surf'
  return 'no-precision'
}

function classifyDepth(wisdom: number): Depth {
  if (wisdom >= 90) return 'abyssal-wisdom'
  if (wisdom >= 75) return 'deep-knowledge'
  if (wisdom >= 60) return 'proper-understanding'
  if (wisdom >= 40) return 'surface-awareness'
  if (wisdom >= 20) return 'shallow-pool'
  return 'no-wisdom'
}

export function classifyWaveCondition(qualityScore: number): WaveCondition {
  if (qualityScore >= 90) return 'silver-masterpiece'
  if (qualityScore >= 75) return 'moonlit-wave'
  if (qualityScore >= 60) return 'proper-tide'
  if (qualityScore >= 40) return 'murky-current'
  if (qualityScore >= 20) return 'stagnant-pool'
  return 'dry-bed'
}

export function classifyShoreType(waves: SilverWave[]): ShoreType {
  if (waves.length === 0) return 'no-shore'
  const avgQs = waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length
  const masterpieceRatio = waves.filter(w => w.condition === 'silver-masterpiece').length / waves.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'silver-coast'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'moonlit-beach'
  if (avgQs >= 55) return 'proper-shore'
  if (avgQs >= 35) return 'sandy-bank'
  if (avgQs >= 15) return 'mud-flat'
  return 'no-shore'
}

export function classifyShoreCondition(avgPurity: number): ShoreCondition {
  if (avgPurity >= 85) return 'magnificent-shore'
  if (avgPurity >= 70) return 'beautiful-coast'
  if (avgPurity >= 55) return 'proper-beach'
  if (avgPurity >= 35) return 'murky-bank'
  if (avgPurity >= 15) return 'dried-up'
  return 'void'
}

export function classifyNavigatorGrade(avgLuminosity: number): NavigatorGrade {
  if (avgLuminosity >= 85) return 'moon-captain'
  if (avgLuminosity >= 70) return 'silver-navigator'
  if (avgLuminosity >= 55) return 'skilled-sailor'
  if (avgLuminosity >= 40) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'landlubber'
}

// ─── analyzeSilverWave ─────────────────────────────────────────────

/**
 * @example analyzeSilverWave(content, 'src/foo.ts')
 */
export function analyzeSilverWave(content: string, filePath: string): SilverWave {
  const purifying = measurePurifying(content)
  const pulsing = measurePulsing(content)
  const flowing = measureFlowing(content)
  const striking = measureStriking(content)
  const knowing = measureKnowing(content)

  const lunarPurity = purifying.purity
  const tidalRhythm = pulsing.rhythm
  const moonlitCurrent = flowing.current
  const wavePrecision = striking.precision
  const oceanWisdom = knowing.wisdom

  const qualityScore = Math.round(
    lunarPurity * 0.2 +
    tidalRhythm * 0.2 +
    moonlitCurrent * 0.2 +
    wavePrecision * 0.2 +
    oceanWisdom * 0.2,
  )

  return {
    file: filePath,
    lunarPurity,
    tidalRhythm,
    moonlitCurrent,
    wavePrecision,
    oceanWisdom,
    purifying,
    pulsing,
    flowing,
    striking,
    knowing,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeSilverShore ────────────────────────────────────────────

/**
 * @example analyzeSilverShore(waves, 'src')
 */
export function analyzeSilverShore(waves: SilverWave[], dirPath: string): SilverShore {
  if (waves.length === 0) {
    return {
      directory: dirPath,
      waves: [],
      avgPurity: 0,
      avgRhythm: 0,
      avgWisdom: 0,
      silverMasterpieceCount: 0,
      dryBedCount: 0,
      shoreType: 'no-shore',
      condition: 'void',
    }
  }

  const avgPurity = Math.round(waves.reduce((s, w) => s + w.lunarPurity, 0) / waves.length)
  const avgRhythm = Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
  const avgWisdom = Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length)
  const silverMasterpieceCount = waves.filter(w => w.condition === 'silver-masterpiece').length
  const dryBedCount = waves.filter(w => w.condition === 'dry-bed').length

  return {
    directory: dirPath,
    waves,
    avgPurity,
    avgRhythm,
    avgWisdom,
    silverMasterpieceCount,
    dryBedCount,
    shoreType: classifyShoreType(waves),
    condition: classifyShoreCondition(avgPurity),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(waves, shores, ocean, stats)
 */
export function generateRecommendations(
  waves: SilverWave[],
  shores: SilverShore[],
  _ocean: SilverTideResult['ocean'],
  stats: SilverTideResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallLuminosity >= 85 && stats.dryBedCount === 0) {
    recs.push('Silver tide perfection — the moonlit waters gleam with absolute purity')
    return recs
  }

  if (stats.avgLunarPurity < 60) {
    recs.push('Purify lunar clarity — remove eval, debugger, console statements, add type annotations')
  }
  if (stats.avgTidalRhythm < 60) {
    recs.push('Strengthen tidal rhythm — add error handling, async/await, remove var and Math.random')
  }
  if (stats.avgMoonlitCurrent < 60) {
    recs.push('Smooth moonlit current — add pipelines, arrow functions, generics, remove var and eval')
  }
  if (stats.avgWavePrecision < 60) {
    recs.push('Sharpen wave precision — add type annotations, generics, readonly, remove var and debugger')
  }
  if (stats.avgOceanWisdom < 60) {
    recs.push('Deepen ocean wisdom — add documentation, abstractions, proven patterns, remove eval and any')
  }

  if (stats.dryBedCount > 0) {
    const dryFiles = waves.filter(w => w.condition === 'dry-bed').map(w => w.file)
    if (dryFiles.length <= 3) {
      recs.push(`Dry beds detected: ${dryFiles.join(', ')} — these need the silver tide`)
    } else {
      recs.push(`${dryFiles.length} dry bed files detected — they need the silver tide`)
    }
  }

  if (shores.length > 1) {
    const murkyShores = shores.filter(s => s.condition === 'murky-bank' || s.condition === 'dried-up')
    if (murkyShores.length > 0) {
      recs.push(`${murkyShores.length} shore(s) have murky or dried-up conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The silver tide flows steady — maintain current luminosity')
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

// ─── buildSilverTideResult ─────────────────────────────────────────

/**
 * @example buildSilverTideResult(['a.ts'], [content])
 */
export async function buildSilverTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverTideResult> {
  const waves: SilverWave[] = files.map((file, i) =>
    analyzeSilverWave(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SilverWave[]>()
  for (const wave of waves) {
    const dir = path.dirname(wave.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(wave)
    } else {
      dirMap.set(dir, [wave])
    }
  }

  const shores: SilverShore[] = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeSilverShore(dirWaves, dir),
  )

  const avgLunarPurity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.lunarPurity, 0) / waves.length)
    : 0
  const avgTidalRhythm = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
    : 0
  const avgMoonlitCurrent = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.moonlitCurrent, 0) / waves.length)
    : 0
  const avgWavePrecision = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.wavePrecision, 0) / waves.length)
    : 0
  const avgOceanWisdom = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length)
    : 0

  const overallLuminosity = Math.round(
    (avgLunarPurity + avgTidalRhythm + avgOceanWisdom) / 3,
  )

  const ocean = {
    avgPurity: avgLunarPurity,
    avgRhythm: avgTidalRhythm,
    avgWisdom: avgOceanWisdom,
    isSilver: overallLuminosity >= 80,
    overallLuminosity,
  }

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file
    : ''
  const purest = waves.length > 0
    ? waves.reduce((best, w) => w.lunarPurity > best.lunarPurity ? w : best).file
    : ''
  const bestRhythm = waves.length > 0
    ? waves.reduce((best, w) => w.tidalRhythm > best.tidalRhythm ? w : best).file
    : ''
  const mostFluid = waves.length > 0
    ? waves.reduce((best, w) => w.moonlitCurrent > best.moonlitCurrent ? w : best).file
    : ''
  const wisest = waves.length > 0
    ? waves.reduce((best, w) => w.oceanWisdom > best.oceanWisdom ? w : best).file
    : ''

  const stats = {
    totalFiles: waves.length,
    totalShores: shores.length,
    avgLunarPurity,
    avgTidalRhythm,
    avgMoonlitCurrent,
    avgWavePrecision,
    avgOceanWisdom,
    silverMasterpieceCount: waves.filter(w => w.condition === 'silver-masterpiece').length,
    moonlitWaveCount: waves.filter(w => w.condition === 'moonlit-wave').length,
    properTideCount: waves.filter(w => w.condition === 'proper-tide').length,
    murkyCurrentCount: waves.filter(w => w.condition === 'murky-current').length,
    stagnantPoolCount: waves.filter(w => w.condition === 'stagnant-pool').length,
    dryBedCount: waves.filter(w => w.condition === 'dry-bed').length,
    hasHighPurityCount: waves.filter(w => w.purifying.hasHighPurity).length,
    hasHighRhythmCount: waves.filter(w => w.pulsing.hasHighRhythm).length,
    hasHighCurrentCount: waves.filter(w => w.flowing.hasHighCurrent).length,
    hasHighPrecisionCount: waves.filter(w => w.striking.hasHighPrecision).length,
    hasHighWisdomCount: waves.filter(w => w.knowing.hasHighWisdom).length,
    overallLuminosity,
    navigatorGrade: classifyNavigatorGrade(overallLuminosity),
    bestWave,
    purest,
    bestRhythm,
    mostFluid,
    wisest,
  }

  const recommendations = generateRecommendations(waves, shores, ocean, { ...stats, recommendations: [] } as SilverTideResult['stats'])

  return {
    waves,
    shores,
    ocean,
    stats,
    recommendations,
  }
}
