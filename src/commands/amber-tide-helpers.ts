// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Resin = 'perfect-amber' | 'clear-resin' | 'proper-preservation' | 'cloudy-amber' | 'cracked-resin' | 'no-preservation'
export type Tide = 'moon-driven' | 'steady-rhythm' | 'proper-pulse' | 'irregular-beat' | 'arrhythmia' | 'no-rhythm'
export type Gold = 'pure-gold-flow' | 'rich-current' | 'proper-stream' | 'weak-flow' | 'stagnant-water' | 'no-current'
export type Wave = 'crystal-wave' | 'clean-surf' | 'proper-wash' | 'murky-tide' | 'polluted-water' | 'no-purity'
export type Sage = 'ancient-elder' | 'wise-captain' | 'proper-sailor' | 'learning-novice' | 'lost-soul' | 'no-wisdom'
export type WaveCondition = 'amber-masterpiece' | 'golden-wave' | 'proper-tide' | 'murky-current' | 'stagnant-pool' | 'dry-bed'
export type ShoreType = 'amber-coast' | 'golden-beach' | 'proper-shore' | 'sandy-bank' | 'mud-flat' | 'no-shore'
export type ShoreCondition = 'magnificent-shore' | 'golden-coast' | 'proper-beach' | 'murky-bank' | 'dried-up' | 'void'
export type CaptainGrade = 'ancient-mariner' | 'sea-captain' | 'skilled-sailor' | 'apprentice' | 'novice' | 'landlubber'

export interface PreservingMeasure {
  power: number
  resin: Resin
  hasHighPower: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasStableAPI: boolean
  hasNoBreaking: boolean
  hasLasting: boolean
  adHocCount: number
  crypticCount: number
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
  erraticCount: number
  untestedCount: number
}

export interface FlowingMeasure {
  current: number
  gold: Gold
  hasHighCurrent: boolean
  hasValuable: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasImpactful: boolean
  hasNoDeadCode: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasDirect: boolean
  fillerCount: number
  deadCodeCount: number
}

export interface CleansingMeasure {
  purity: number
  wave: Wave
  hasHighPurity: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasNoHacky: boolean
  hasNoDuplicates: boolean
  hasTidy: boolean
  hasNoMessy: boolean
  hasPristine: boolean
  hasNoTarnished: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  deadCodeCount: number
  hackyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  sage: Sage
  hasHighWisdom: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasBattleTested: boolean
  hasNoUnproven: boolean
  reinventedCount: number
  hackyCount: number
}

export interface AmberWave {
  file: string
  preservationPower: number
  tidalRhythm: number
  goldenCurrent: number
  wavePurity: number
  ancientWisdom: number
  preserving: PreservingMeasure
  pulsing: PulsingMeasure
  flowing: FlowingMeasure
  cleansing: CleansingMeasure
  knowing: KnowingMeasure
  condition: WaveCondition
  qualityScore: number
}

export interface AmberShore {
  directory: string
  waves: AmberWave[]
  avgPreservation: number
  avgRhythm: number
  avgWisdom: number
  amberMasterpieceCount: number
  dryBedCount: number
  shoreType: ShoreType
  condition: ShoreCondition
}

export interface AmberTideResult {
  waves: AmberWave[]
  shores: AmberShore[]
  ocean: {
    avgPreservation: number
    avgRhythm: number
    avgWisdom: number
    isAmber: boolean
    overallFlow: number
  }
  stats: {
    totalFiles: number
    totalShores: number
    avgPreservationPower: number
    avgTidalRhythm: number
    avgGoldenCurrent: number
    avgWavePurity: number
    avgAncientWisdom: number
    amberMasterpieceCount: number
    goldenWaveCount: number
    properTideCount: number
    murkyCurrentCount: number
    stagnantPoolCount: number
    dryBedCount: number
    hasHighPreservationCount: number
    hasHighRhythmCount: number
    hasHighCurrentCount: number
    hasHighPurityCount: number
    hasHighWisdomCount: number
    overallFlow: number
    captainGrade: CaptainGrade
    bestWave: string
    mostPreserved: string
    bestRhythm: string
    mostValuable: string
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

// ─── measurePreserving ─────────────────────────────────────────────

/**
 * @example measurePreserving('export interface Foo { readonly bar: string }')
 */
export function measurePreserving(content: string): PreservingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 10
  if (hasExport) score += 8
  if (hasNamed) score += 6
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasEnum) score += 4
  if (hasClass) score += 6
  if (hasReadonly) score += 6
  if (hasPrivate) score += 4
  if (hasGenerics) score += 6
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasOptional) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasAny) score -= 8
  if (hasEval) score -= 10
  if (hasDebugger) score -= 8

  const power = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = hasVar > 0 ? 1 : 0
  const crypticCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    power,
    resin: classifyResin(power),
    hasHighPower: power >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasPattern(content, /\bvar\b/),
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval,
    hasMaintainable: !hasVar && !hasAny,
    hasNoFragile: !hasVar && !hasDebugger,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasVar,
    hasStableAPI: hasExport && hasNamed,
    hasNoBreaking: !hasVar && !hasAny,
    hasLasting: power >= 70,
    adHocCount,
    crypticCount,
  }
}

// ─── measurePulsing ────────────────────────────────────────────────

/**
 * @example measurePulsing('export function foo(): string { return "a" }')
 */
export function measurePulsing(content: string): PulsingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasFunction = hasPattern(content, /\bfunction\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasDefault = hasPattern(content, /=\s*[^=]+\)/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasRandom = hasPattern(content, /\bMath\.random\b/)
  const hasDateNow = hasPattern(content, /\bDate\.now\b/) || hasPattern(content, /\bnew Date\b/)

  if (hasExport) score += 8
  if (hasFunction) score += 6
  if (hasArrow) score += 6
  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasTryCatch) score += 10
  if (hasReturn) score += 4
  if (hasConst) score += 4
  if (hasType) score += 6
  if (hasReturnType) score += 6
  if (hasDefault) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 5, 15)
  if (hasDebugger) score -= 10
  if (hasRandom) score -= 5
  if (hasDateNow) score -= 3

  const rhythm = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const erraticCount = (hasDebugger ? 1 : 0) + (hasRandom ? 1 : 0)
  const untestedCount = hasVar > 0 ? 1 : 0

  return {
    rhythm,
    tide: classifyTide(rhythm),
    hasHighRhythm: rhythm >= 80,
    hasReliable: hasTryCatch || hasAsync,
    hasConsistent: hasConst && !hasVar,
    hasNoErratic: !hasDebugger && !hasRandom,
    hasTested: hasTryCatch,
    hasNoUntested: !hasVar,
    hasDeterministic: !hasRandom,
    hasNoRandom: !hasRandom,
    hasPredictable: hasReturnType && !hasRandom,
    hasNoFlaky: !hasDebugger && !hasRandom,
    hasSmooth: hasAsync && hasAwait,
    hasNoJerky: !hasVar,
    erraticCount,
    untestedCount,
  }
}

// ─── measureFlowing ────────────────────────────────────────────────

/**
 * @example measureFlowing('export function add(a: number, b: number): number { return a + b }')
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasFunction = hasPattern(content, /\bfunction\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasGenerics = hasPattern(content, /<\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasConsole = countPattern(content, /\bconsole\./)
  const hasGodFile = content.split('\n').length > 300

  if (hasExport) score += 8
  if (hasImport) score += 6
  if (hasFunction) score += 6
  if (hasArrow) score += 6
  if (hasPipeline) score += 10
  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasReturn) score += 4
  if (hasConst) score += 4
  if (hasOptionalChain) score += 4
  if (hasNullish) score += 4
  if (hasGenerics) score += 6

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasDebugger) score -= 8
  if (hasConsole > 3) score -= 4
  if (hasGodFile) score -= 6

  const current = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const fillerCount = (hasVar > 0 ? 1 : 0) + (hasConsole > 3 ? 1 : 0)
  const deadCodeCount = hasDebugger ? 1 : 0

  return {
    current,
    gold: classifyGold(current),
    hasHighCurrent: current >= 80,
    hasValuable: hasExport && (hasFunction || hasArrow),
    hasEssential: hasExport,
    hasNoFiller: hasVar === 0 && hasConsole <= 3,
    hasMeaningful: hasExport && hasReturn,
    hasNoBoilerplate: !hasGodFile,
    hasImpactful: hasPipeline || hasAsync,
    hasNoDeadCode: !hasDebugger,
    hasEfficientFlow: hasPipeline || hasOptionalChain,
    hasNoBottlenecks: !hasGodFile,
    hasCleanPipelines: hasPipeline && !hasDebugger,
    hasNoTangled: hasVar === 0,
    hasDirect: hasReturn && !hasGodFile,
    fillerCount,
    deadCodeCount,
  }
}

// ─── measureCleansing ──────────────────────────────────────────────

/**
 * @example measureCleansing('export const add = (a: number, b: number): number => a + b')
 */
export function measureCleansing(content: string): CleansingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 8
  if (hasConst) score += 4
  if (hasReturnType) score += 8
  if (hasInterface) score += 6
  if (hasEnum) score += 4
  if (hasReadonly) score += 4
  if (hasArrow) score += 4
  if (hasNamed) score += 6
  if (hasDoc) score += 6
  if (hasPrivate) score += 4

  if (hasDebugger) score -= 10
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)
  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 12
  if (hasTodo) score -= 4
  if (hasAny) score -= 6

  const purity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const deadCodeCount = hasDebugger ? 1 : 0
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    purity,
    wave: classifyWavePurity(purity),
    hasHighPurity: purity >= 80,
    hasClean: !hasEval && !hasDebugger,
    hasNoDeadCode: !hasDebugger,
    hasNoHacky: hasHackyCast === 0 && !hasDebugger,
    hasNoDuplicates: !hasVar,
    hasTidy: !hasTodo && !hasDebugger,
    hasNoMessy: !hasVar && !hasTodo,
    hasPristine: purity >= 75,
    hasNoTarnished: !hasAny && !hasEval,
    hasPolished: hasInterface && hasNamed,
    hasNoRough: !hasDebugger && !hasTodo,
    hasClear: hasReturnType || hasConst,
    hasNoObfuscated: !hasDebugger && !hasEval,
    deadCodeCount,
    hackyCount,
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
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasVar = countPattern(content, /\bvar\b/)

  if (hasDoc) score += 10
  if (hasInterface) score += 8
  if (hasType) score += 8
  if (hasEnum) score += 6
  if (hasClass) score += 8
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasPrivate) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4

  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 15)
  if (hasDebugger) score -= 10
  if (hasTodo) score -= 5
  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const reinventedCount = (hasTodo ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    wisdom,
    sage: classifySage(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasPatterned: (hasExtends && hasImplements) || hasAbstract,
    hasNoReinvented: !hasTodo,
    hasProven: hasExtends || hasImplements,
    hasNoExperimental: !hasTodo,
    hasEstablished: wisdom >= 70,
    hasNoNovel: !hasTodo && !hasDebugger,
    hasPrincipled: hasExport && hasConst && !hasPattern(content, /\bas\s+any\b/),
    hasNoHacky: !hasPattern(content, /\bas\s+any\b/) && !hasDebugger,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasBattleTested: hasExtends && hasImplements,
    hasNoUnproven: !hasDebugger && !hasTodo,
    reinventedCount,
    hackyCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyResin(power: number): Resin {
  if (power >= 90) return 'perfect-amber'
  if (power >= 75) return 'clear-resin'
  if (power >= 60) return 'proper-preservation'
  if (power >= 40) return 'cloudy-amber'
  if (power >= 20) return 'cracked-resin'
  return 'no-preservation'
}

function classifyTide(rhythm: number): Tide {
  if (rhythm >= 90) return 'moon-driven'
  if (rhythm >= 75) return 'steady-rhythm'
  if (rhythm >= 60) return 'proper-pulse'
  if (rhythm >= 40) return 'irregular-beat'
  if (rhythm >= 20) return 'arrhythmia'
  return 'no-rhythm'
}

function classifyGold(current: number): Gold {
  if (current >= 90) return 'pure-gold-flow'
  if (current >= 75) return 'rich-current'
  if (current >= 60) return 'proper-stream'
  if (current >= 40) return 'weak-flow'
  if (current >= 20) return 'stagnant-water'
  return 'no-current'
}

function classifyWavePurity(purity: number): Wave {
  if (purity >= 90) return 'crystal-wave'
  if (purity >= 75) return 'clean-surf'
  if (purity >= 60) return 'proper-wash'
  if (purity >= 40) return 'murky-tide'
  if (purity >= 20) return 'polluted-water'
  return 'no-purity'
}

function classifySage(wisdom: number): Sage {
  if (wisdom >= 90) return 'ancient-elder'
  if (wisdom >= 75) return 'wise-captain'
  if (wisdom >= 60) return 'proper-sailor'
  if (wisdom >= 40) return 'learning-novice'
  if (wisdom >= 20) return 'lost-soul'
  return 'no-wisdom'
}

export function classifyWaveCondition(qualityScore: number): WaveCondition {
  if (qualityScore >= 90) return 'amber-masterpiece'
  if (qualityScore >= 75) return 'golden-wave'
  if (qualityScore >= 60) return 'proper-tide'
  if (qualityScore >= 40) return 'murky-current'
  if (qualityScore >= 20) return 'stagnant-pool'
  return 'dry-bed'
}

export function classifyShoreType(waves: AmberWave[]): ShoreType {
  if (waves.length === 0) return 'no-shore'
  const avgQs = waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length
  const masterpieceRatio = waves.filter(w => w.condition === 'amber-masterpiece').length / waves.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'amber-coast'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'golden-beach'
  if (avgQs >= 55) return 'proper-shore'
  if (avgQs >= 35) return 'sandy-bank'
  if (avgQs >= 15) return 'mud-flat'
  return 'no-shore'
}

export function classifyShoreCondition(avgPreservation: number): ShoreCondition {
  if (avgPreservation >= 85) return 'magnificent-shore'
  if (avgPreservation >= 70) return 'golden-coast'
  if (avgPreservation >= 55) return 'proper-beach'
  if (avgPreservation >= 35) return 'murky-bank'
  if (avgPreservation >= 15) return 'dried-up'
  return 'void'
}

export function classifyCaptainGrade(avgFlow: number): CaptainGrade {
  if (avgFlow >= 85) return 'ancient-mariner'
  if (avgFlow >= 70) return 'sea-captain'
  if (avgFlow >= 55) return 'skilled-sailor'
  if (avgFlow >= 40) return 'apprentice'
  if (avgFlow >= 20) return 'novice'
  return 'landlubber'
}

// ─── analyzeAmberWave ──────────────────────────────────────────────

/**
 * @example analyzeAmberWave(content, 'src/foo.ts')
 */
export function analyzeAmberWave(content: string, filePath: string): AmberWave {
  const preserving = measurePreserving(content)
  const pulsing = measurePulsing(content)
  const flowing = measureFlowing(content)
  const cleansing = measureCleansing(content)
  const knowing = measureKnowing(content)

  const preservationPower = preserving.power
  const tidalRhythm = pulsing.rhythm
  const goldenCurrent = flowing.current
  const wavePurity = cleansing.purity
  const ancientWisdom = knowing.wisdom

  const qualityScore = Math.round(
    preservationPower * 0.2 +
    tidalRhythm * 0.2 +
    goldenCurrent * 0.2 +
    wavePurity * 0.2 +
    ancientWisdom * 0.2,
  )

  return {
    file: filePath,
    preservationPower,
    tidalRhythm,
    goldenCurrent,
    wavePurity,
    ancientWisdom,
    preserving,
    pulsing,
    flowing,
    cleansing,
    knowing,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeAmberShore ─────────────────────────────────────────────

/**
 * @example analyzeAmberShore(waves, 'src')
 */
export function analyzeAmberShore(waves: AmberWave[], dirPath: string): AmberShore {
  if (waves.length === 0) {
    return {
      directory: dirPath,
      waves: [],
      avgPreservation: 0,
      avgRhythm: 0,
      avgWisdom: 0,
      amberMasterpieceCount: 0,
      dryBedCount: 0,
      shoreType: 'no-shore',
      condition: 'void',
    }
  }

  const avgPreservation = Math.round(waves.reduce((s, w) => s + w.preservationPower, 0) / waves.length)
  const avgRhythm = Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
  const avgWisdom = Math.round(waves.reduce((s, w) => s + w.ancientWisdom, 0) / waves.length)
  const amberMasterpieceCount = waves.filter(w => w.condition === 'amber-masterpiece').length
  const dryBedCount = waves.filter(w => w.condition === 'dry-bed').length

  return {
    directory: dirPath,
    waves,
    avgPreservation,
    avgRhythm,
    avgWisdom,
    amberMasterpieceCount,
    dryBedCount,
    shoreType: classifyShoreType(waves),
    condition: classifyShoreCondition(avgPreservation),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(waves, shores, ocean, stats)
 */
export function generateRecommendations(
  waves: AmberWave[],
  shores: AmberShore[],
  ocean: AmberTideResult['ocean'],
  stats: AmberTideResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallFlow >= 85 && stats.dryBedCount === 0) {
    recs.push('Amber perfection achieved — the tide flows with eternal grace')
    return recs
  }

  if (stats.avgPreservationPower < 60) {
    recs.push('Strengthen preservation — add documentation, types, and stable exports')
  }
  if (stats.avgTidalRhythm < 60) {
    recs.push('Steady the rhythm — add error handling, async/await, and deterministic logic')
  }
  if (stats.avgGoldenCurrent < 60) {
    recs.push('Enrich the current — add meaningful exports, pipelines, and data transformations')
  }
  if (stats.avgWavePurity < 60) {
    recs.push('Purify the waves — remove debugger, eval, as any, and dead code')
  }
  if (stats.avgAncientWisdom < 60) {
    recs.push('Deepen ancient wisdom — add proven patterns, abstractions, and JSDoc')
  }

  if (stats.dryBedCount > 0) {
    const dryFiles = waves.filter(w => w.condition === 'dry-bed').map(w => w.file)
    if (dryFiles.length <= 3) {
      recs.push(`Dry beds detected: ${dryFiles.join(', ')} — these need water`)
    } else {
      recs.push(`${dryFiles.length} dry beds detected — they need water`)
    }
  }

  if (shores.length > 1) {
    const weakShores = shores.filter(s => s.condition === 'murky-bank' || s.condition === 'dried-up')
    if (weakShores.length > 0) {
      recs.push(`${weakShores.length} shore(s) have murky or dried conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The amber tide flows steadily — maintain current quality')
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

// ─── buildAmberTideResult ──────────────────────────────────────────

/**
 * @example buildAmberTideResult(['a.ts'], [content])
 */
export async function buildAmberTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberTideResult> {
  const waves: AmberWave[] = files.map((file, i) =>
    analyzeAmberWave(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberWave[]>()
  for (const wave of waves) {
    const dir = path.dirname(wave.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(wave)
    } else {
      dirMap.set(dir, [wave])
    }
  }

  const shores: AmberShore[] = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeAmberShore(dirWaves, dir),
  )

  const avgPreservationPower = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.preservationPower, 0) / waves.length)
    : 0
  const avgTidalRhythm = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
    : 0
  const avgGoldenCurrent = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.goldenCurrent, 0) / waves.length)
    : 0
  const avgWavePurity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.wavePurity, 0) / waves.length)
    : 0
  const avgAncientWisdom = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.ancientWisdom, 0) / waves.length)
    : 0

  const overallFlow = Math.round(
    (avgPreservationPower + avgTidalRhythm + avgAncientWisdom) / 3,
  )

  const ocean = {
    avgPreservation: avgPreservationPower,
    avgRhythm: avgTidalRhythm,
    avgWisdom: avgAncientWisdom,
    isAmber: overallFlow >= 80,
    overallFlow,
  }

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file
    : ''
  const mostPreserved = waves.length > 0
    ? waves.reduce((best, w) => w.preservationPower > best.preservationPower ? w : best).file
    : ''
  const bestRhythm = waves.length > 0
    ? waves.reduce((best, w) => w.tidalRhythm > best.tidalRhythm ? w : best).file
    : ''
  const mostValuable = waves.length > 0
    ? waves.reduce((best, w) => w.goldenCurrent > best.goldenCurrent ? w : best).file
    : ''
  const wisest = waves.length > 0
    ? waves.reduce((best, w) => w.ancientWisdom > best.ancientWisdom ? w : best).file
    : ''

  const stats = {
    totalFiles: waves.length,
    totalShores: shores.length,
    avgPreservationPower,
    avgTidalRhythm,
    avgGoldenCurrent,
    avgWavePurity,
    avgAncientWisdom,
    amberMasterpieceCount: waves.filter(w => w.condition === 'amber-masterpiece').length,
    goldenWaveCount: waves.filter(w => w.condition === 'golden-wave').length,
    properTideCount: waves.filter(w => w.condition === 'proper-tide').length,
    murkyCurrentCount: waves.filter(w => w.condition === 'murky-current').length,
    stagnantPoolCount: waves.filter(w => w.condition === 'stagnant-pool').length,
    dryBedCount: waves.filter(w => w.condition === 'dry-bed').length,
    hasHighPreservationCount: waves.filter(w => w.preserving.hasHighPower).length,
    hasHighRhythmCount: waves.filter(w => w.pulsing.hasHighRhythm).length,
    hasHighCurrentCount: waves.filter(w => w.flowing.hasHighCurrent).length,
    hasHighPurityCount: waves.filter(w => w.cleansing.hasHighPurity).length,
    hasHighWisdomCount: waves.filter(w => w.knowing.hasHighWisdom).length,
    overallFlow,
    captainGrade: classifyCaptainGrade(overallFlow),
    bestWave,
    mostPreserved,
    bestRhythm,
    mostValuable,
    wisest,
  }

  const recommendations = generateRecommendations(waves, shores, ocean, { ...stats, recommendations: [] } as AmberTideResult['stats'])

  return {
    waves,
    shores,
    ocean,
    stats,
    recommendations,
  }
}
