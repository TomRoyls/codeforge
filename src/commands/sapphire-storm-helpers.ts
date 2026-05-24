// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Storm = 'category-5' | 'major-hurricane' | 'proper-storm' | 'tropical-storm' | 'gentle-breeze' | 'no-wind'
export type Strike = 'surgical-bolt' | 'precision-strike' | 'proper-hit' | 'near-miss' | 'scattered-bolt' | 'no-precision'
export type Lightning = 'blinding-flash' | 'bright-bolt' | 'proper-flash' | 'dim-flicker' | 'dark-sky' | 'no-flash'
export type Thunder = 'earth-shattering' | 'powerful-roll' | 'proper-rumble' | 'distant-thunder' | 'faint-crackle' | 'no-thunder'
export type Rain = 'life-giving-rain' | 'nourishing-shower' | 'proper-drizzle' | 'light-mist' | 'dry-spell' | 'no-rain'
export type BoltCondition = 'perfect-storm' | 'mighty-tempest' | 'proper-thunderstorm' | 'light-rain' | 'drizzle' | 'drought'
export type CloudType = 'super-cell' | 'thunderhead' | 'proper-nimbus' | 'cumulus' | 'wispy-cloud' | 'no-cloud'
export type CloudCondition = 'magnificent-tempest' | 'powerful-storm' | 'proper-weather' | 'light-rain' | 'clear-sky' | 'void'
export type MeteorologistGrade = 'storm-chaser' | 'weather-expert' | 'skilled-forecaster' | 'apprentice' | 'novice' | 'fair-weather'

export interface StrikingMeasure {
  fury: number
  storm: Storm
  hasHighFury: boolean
  hasImpactful: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasHighValue: boolean
  hasNoDeadCode: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasStrong: boolean
  fillerCount: number
  boilerplateCount: number
}

export interface TargetingMeasure {
  precision: number
  strike: Strike
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasTargeted: boolean
  approximateCount: number
  sloppyCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  lightning: Lightning
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasInstant: boolean
  hasNoRequiresStudy: boolean
  hasObvious: boolean
  hasNoSubtle: boolean
  hasLuminous: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EnduringMeasure {
  resilience: number
  thunder: Thunder
  hasHighResilience: boolean
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
  hasLoadResistant: boolean
  hasNoSinglePointFailure: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface NourishingMeasure {
  wisdom: number
  rain: Rain
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasReusable: boolean
  hasNoSingleUse: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasProven: boolean
  adHocCount: number
  hackyCount: number
}

export interface SapphireBolt {
  file: string
  gemFury: number
  strikePrecision: number
  lightningClarity: number
  thunderResilience: number
  rainWisdom: number
  striking: StrikingMeasure
  targeting: TargetingMeasure
  illuminating: IlluminatingMeasure
  enduring: EnduringMeasure
  nourishing: NourishingMeasure
  condition: BoltCondition
  qualityScore: number
}

export interface SapphireCloud {
  directory: string
  bolts: SapphireBolt[]
  avgFury: number
  avgPrecision: number
  avgWisdom: number
  perfectStormCount: number
  droughtCount: number
  cloudType: CloudType
  condition: CloudCondition
}

export interface SapphireStormResult {
  bolts: SapphireBolt[]
  clouds: SapphireCloud[]
  atmosphere: {
    avgFury: number
    avgPrecision: number
    avgWisdom: number
    isTempest: boolean
    overallPower: number
  }
  stats: {
    totalFiles: number
    totalClouds: number
    avgGemFury: number
    avgStrikePrecision: number
    avgLightningClarity: number
    avgThunderResilience: number
    avgRainWisdom: number
    perfectStormCount: number
    mightyTempestCount: number
    properThunderstormCount: number
    lightRainCount: number
    drizzleCount: number
    droughtCount: number
    hasHighFuryCount: number
    hasHighPrecisionCount: number
    hasHighClarityCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallPower: number
    meteorologistGrade: MeteorologistGrade
    bestBolt: string
    mostFurious: string
    mostPrecise: string
    clearest: string
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

// ─── measureStriking ───────────────────────────────────────────────

/**
 * @example measureStriking('export function foo(): string { return "a" }')
 */
export function measureStriking(content: string): StrikingMeasure {
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

  const fury = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const fillerCount = (hasVar > 0 ? 1 : 0) + (hasConsole > 3 ? 1 : 0)
  const boilerplateCount = hasGodFile ? 1 : 0

  return {
    fury,
    storm: classifyStorm(fury),
    hasHighFury: fury >= 80,
    hasImpactful: hasExport && (hasFunction || hasArrow),
    hasEssential: hasExport,
    hasNoFiller: hasVar === 0 && hasConsole <= 3,
    hasMeaningful: hasExport && hasReturn,
    hasNoBoilerplate: !hasGodFile,
    hasPowerful: hasPipeline || hasAsync,
    hasNoWeak: !hasDebugger,
    hasHighValue: fury >= 70,
    hasNoDeadCode: !hasDebugger,
    hasDynamic: hasPipeline || hasOptionalChain,
    hasNoStatic: hasVar === 0,
    hasStrong: hasReturn && !hasGodFile,
    fillerCount,
    boilerplateCount,
  }
}

// ─── measureTargeting ──────────────────────────────────────────────

/**
 * @example measureTargeting('export function add(a: number, b: number): number { return a + b }')
 */
export function measureTargeting(content: string): TargetingMeasure {
  let score = 0

  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasDefault = hasPattern(content, /=\s*[^=]+\)/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasReturnType) score += 8
  if (hasConst) score += 6
  if (hasTypeAnnotation) score += 6
  if (hasOptional) score += 4
  if (hasReadonly) score += 4
  if (hasEnum) score += 4
  if (hasInterface) score += 6
  if (hasGenerics) score += 6
  if (hasPrivate) score += 4
  if (hasExport) score += 4
  if (hasDefault) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasAny) score -= 8
  if (hasDebugger) score -= 6
  if (hasEval) score -= 8

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const approximateCount = (hasVar > 0 ? 1 : 0) + (hasAny ? 1 : 0)
  const sloppyCount = (hasDebugger ? 1 : 0) + (hasEval ? 1 : 0)

  return {
    precision,
    strike: classifyStrike(precision),
    hasHighPrecision: precision >= 80,
    hasExact: hasReturnType && !hasAny,
    hasAccurate: hasTypeAnnotation && !hasVar,
    hasNoApproximate: !hasAny,
    hasCorrect: hasReturnType && !hasEval,
    hasNoAlmostRight: !hasVar && !hasAny,
    hasSharp: hasReturnType && hasConst,
    hasNoSloppy: !hasDebugger && !hasEval,
    hasPrecise: precision >= 60,
    hasNoVague: !hasAny && !hasVar,
    hasDefined: hasInterface || hasEnum,
    hasNoFuzzy: !hasDebugger,
    hasTargeted: hasReturnType && hasExport,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureIlluminating ───────────────────────────────────────────

/**
 * @example measureIlluminating('export function foo(): string { return "a" }')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasFunction = hasPattern(content, /\bfunction\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasArrow = hasPattern(content, /=>/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasSingleLetter = countPattern(content, /\b[a-z]\b(?!\s*[=<>!])/)

  if (hasExport) score += 8
  if (hasFunction) score += 6
  if (hasDoc) score += 8
  if (hasNamed) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasEnum) score += 4
  if (hasClass) score += 4
  if (hasReturn) score += 4
  if (hasArrow) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasSingleLetter > 5) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const obfuscatedCount = (hasDebugger ? 1 : 0) + (hasSingleLetter > 5 ? 1 : 0)

  return {
    clarity,
    lightning: classifyLightning(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport && hasReturn,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval,
    hasTransparent: hasDoc && !hasEval,
    hasNoObfuscated: !hasDebugger && !hasEval,
    hasClear: hasInterface || hasReturnType(content),
    hasNoHidden: !hasDebugger,
    hasInstant: hasNamed && hasDoc,
    hasNoRequiresStudy: !hasEval && !hasVar,
    hasObvious: hasExport && hasConst,
    hasNoSubtle: !hasDebugger,
    hasLuminous: clarity >= 70,
    crypticCount,
    obfuscatedCount,
  }
}

function hasReturnType(content: string): boolean {
  return /\):\s*[A-Z]\w+/.test(content)
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('export async function foo(): Promise<void> { try { await bar() } catch(e) { throw e } }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasTryCatch) score += 10
  if (hasAsync) score += 8
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasExport) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasThrow) score += 8
  if (hasPrivate) score += 4
  if (hasInterface) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasAny) score -= 6
  if (hasDebugger) score -= 8
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasHackyCast > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    resilience,
    thunder: classifyThunder(resilience),
    hasHighResilience: resilience >= 80,
    hasTested: hasTryCatch,
    hasNoUntested: !hasVar,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasVar && !hasAny,
    hasErrorHandled: hasTryCatch || hasThrow,
    hasNoBareCrash: hasHackyCast === 0 && !hasDebugger,
    hasRobust: hasTryCatch && hasThrow,
    hasNoFragile: !hasVar && !hasDebugger,
    hasDefensive: hasTryCatch && hasReturnType,
    hasNoNaive: !hasDebugger,
    hasLoadResistant: hasAsync && hasTryCatch,
    hasNoSinglePointFailure: !hasDebugger && hasHackyCast === 0,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureNourishing ─────────────────────────────────────────────

/**
 * @example measureNourishing('export abstract class Base { abstract doWork(): void }')
 */
export function measureNourishing(content: string): NourishingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasVar = countPattern(content, /\bvar\b/)

  if (hasDoc) score += 10
  if (hasInterface) score += 8
  if (hasType) score += 8
  if (hasEnum) score += 6
  if (hasClass) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasOptional) score += 4

  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 15)
  if (hasDebugger) score -= 8
  if (hasTodo) score -= 5
  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasTodo ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    wisdom,
    rain: classifyRain(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasVar,
    hasPatterned: hasInterface || hasEnum,
    hasNoReinvented: !hasTodo,
    hasReusable: hasExport && (hasFunction(content) || hasClass),
    hasNoSingleUse: hasExport,
    hasModular: hasInterface || hasType,
    hasNoMonolithic: !hasVar,
    hasPrincipled: hasExport && hasConst && !hasPattern(content, /\bas\s+any\b/),
    hasNoHacky: !hasPattern(content, /\bas\s+any\b/) && !hasDebugger,
    hasProven: wisdom >= 70,
    adHocCount,
    hackyCount,
  }
}

function hasFunction(content: string): boolean {
  return /\bfunction\b/.test(content)
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyStorm(fury: number): Storm {
  if (fury >= 90) return 'category-5'
  if (fury >= 75) return 'major-hurricane'
  if (fury >= 60) return 'proper-storm'
  if (fury >= 40) return 'tropical-storm'
  if (fury >= 20) return 'gentle-breeze'
  return 'no-wind'
}

function classifyStrike(precision: number): Strike {
  if (precision >= 90) return 'surgical-bolt'
  if (precision >= 75) return 'precision-strike'
  if (precision >= 60) return 'proper-hit'
  if (precision >= 40) return 'near-miss'
  if (precision >= 20) return 'scattered-bolt'
  return 'no-precision'
}

function classifyLightning(clarity: number): Lightning {
  if (clarity >= 90) return 'blinding-flash'
  if (clarity >= 75) return 'bright-bolt'
  if (clarity >= 60) return 'proper-flash'
  if (clarity >= 40) return 'dim-flicker'
  if (clarity >= 20) return 'dark-sky'
  return 'no-flash'
}

function classifyThunder(resilience: number): Thunder {
  if (resilience >= 90) return 'earth-shattering'
  if (resilience >= 75) return 'powerful-roll'
  if (resilience >= 60) return 'proper-rumble'
  if (resilience >= 40) return 'distant-thunder'
  if (resilience >= 20) return 'faint-crackle'
  return 'no-thunder'
}

function classifyRain(wisdom: number): Rain {
  if (wisdom >= 90) return 'life-giving-rain'
  if (wisdom >= 75) return 'nourishing-shower'
  if (wisdom >= 60) return 'proper-drizzle'
  if (wisdom >= 40) return 'light-mist'
  if (wisdom >= 20) return 'dry-spell'
  return 'no-rain'
}

export function classifyBoltCondition(qualityScore: number): BoltCondition {
  if (qualityScore >= 90) return 'perfect-storm'
  if (qualityScore >= 75) return 'mighty-tempest'
  if (qualityScore >= 60) return 'proper-thunderstorm'
  if (qualityScore >= 40) return 'light-rain'
  if (qualityScore >= 20) return 'drizzle'
  return 'drought'
}

export function classifyCloudType(bolts: SapphireBolt[]): CloudType {
  if (bolts.length === 0) return 'no-cloud'
  const avgQs = bolts.reduce((s, b) => s + b.qualityScore, 0) / bolts.length
  const perfectRatio = bolts.filter(b => b.condition === 'perfect-storm').length / bolts.length
  if (avgQs >= 85 && perfectRatio >= 0.5) return 'super-cell'
  if (avgQs >= 70 && perfectRatio >= 0.3) return 'thunderhead'
  if (avgQs >= 55) return 'proper-nimbus'
  if (avgQs >= 35) return 'cumulus'
  if (avgQs >= 15) return 'wispy-cloud'
  return 'no-cloud'
}

export function classifyCloudCondition(avgFury: number): CloudCondition {
  if (avgFury >= 85) return 'magnificent-tempest'
  if (avgFury >= 70) return 'powerful-storm'
  if (avgFury >= 55) return 'proper-weather'
  if (avgFury >= 35) return 'light-rain'
  if (avgFury >= 15) return 'clear-sky'
  return 'void'
}

export function classifyMeteorologistGrade(avgPower: number): MeteorologistGrade {
  if (avgPower >= 85) return 'storm-chaser'
  if (avgPower >= 70) return 'weather-expert'
  if (avgPower >= 55) return 'skilled-forecaster'
  if (avgPower >= 40) return 'apprentice'
  if (avgPower >= 20) return 'novice'
  return 'fair-weather'
}

// ─── analyzeSapphireBolt ───────────────────────────────────────────

/**
 * @example analyzeSapphireBolt(content, 'src/foo.ts')
 */
export function analyzeSapphireBolt(content: string, filePath: string): SapphireBolt {
  const striking = measureStriking(content)
  const targeting = measureTargeting(content)
  const illuminating = measureIlluminating(content)
  const enduring = measureEnduring(content)
  const nourishing = measureNourishing(content)

  const gemFury = striking.fury
  const strikePrecision = targeting.precision
  const lightningClarity = illuminating.clarity
  const thunderResilience = enduring.resilience
  const rainWisdom = nourishing.wisdom

  const qualityScore = Math.round(
    gemFury * 0.2 +
    strikePrecision * 0.2 +
    lightningClarity * 0.2 +
    thunderResilience * 0.2 +
    rainWisdom * 0.2,
  )

  return {
    file: filePath,
    gemFury,
    strikePrecision,
    lightningClarity,
    thunderResilience,
    rainWisdom,
    striking,
    targeting,
    illuminating,
    enduring,
    nourishing,
    condition: classifyBoltCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeSapphireCloud ──────────────────────────────────────────

/**
 * @example analyzeSapphireCloud(bolts, 'src')
 */
export function analyzeSapphireCloud(bolts: SapphireBolt[], dirPath: string): SapphireCloud {
  if (bolts.length === 0) {
    return {
      directory: dirPath,
      bolts: [],
      avgFury: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      perfectStormCount: 0,
      droughtCount: 0,
      cloudType: 'no-cloud',
      condition: 'void',
    }
  }

  const avgFury = Math.round(bolts.reduce((s, b) => s + b.gemFury, 0) / bolts.length)
  const avgPrecision = Math.round(bolts.reduce((s, b) => s + b.strikePrecision, 0) / bolts.length)
  const avgWisdom = Math.round(bolts.reduce((s, b) => s + b.rainWisdom, 0) / bolts.length)
  const perfectStormCount = bolts.filter(b => b.condition === 'perfect-storm').length
  const droughtCount = bolts.filter(b => b.condition === 'drought').length

  return {
    directory: dirPath,
    bolts,
    avgFury,
    avgPrecision,
    avgWisdom,
    perfectStormCount,
    droughtCount,
    cloudType: classifyCloudType(bolts),
    condition: classifyCloudCondition(avgFury),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(bolts, clouds, atmosphere, stats)
 */
export function generateRecommendations(
  bolts: SapphireBolt[],
  clouds: SapphireCloud[],
  atmosphere: SapphireStormResult['atmosphere'],
  stats: SapphireStormResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallPower >= 85 && stats.droughtCount === 0) {
    recs.push('Sapphire perfection — the storm rages with absolute power and grace')
    return recs
  }

  if (stats.avgGemFury < 60) {
    recs.push('Increase gem fury — add exports, pipelines, async/await, and data transformations')
  }
  if (stats.avgStrikePrecision < 60) {
    recs.push('Sharpen strike precision — add return types, interfaces, generics, remove var and any')
  }
  if (stats.avgLightningClarity < 60) {
    recs.push('Brighten lightning clarity — add JSDoc, named exports, interfaces, remove eval and debugger')
  }
  if (stats.avgThunderResilience < 60) {
    recs.push('Strengthen thunder resilience — add try/catch, throw, async/await, remove debugger and as any')
  }
  if (stats.avgRainWisdom < 60) {
    recs.push('Deepen rain wisdom — add proven patterns, interfaces, enums, JSDoc, remove TODO and var')
  }

  if (stats.droughtCount > 0) {
    const droughtFiles = bolts.filter(b => b.condition === 'drought').map(b => b.file)
    if (droughtFiles.length <= 3) {
      recs.push(`Drought detected: ${droughtFiles.join(', ')} — these need rain`)
    } else {
      recs.push(`${droughtFiles.length} drought files detected — they need rain`)
    }
  }

  if (clouds.length > 1) {
    const weakClouds = clouds.filter(c => c.condition === 'light-rain' || c.condition === 'clear-sky')
    if (weakClouds.length > 0) {
      recs.push(`${weakClouds.length} cloud(s) have light rain or clear sky conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The sapphire storm holds steady — maintain current quality')
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

// ─── buildSapphireStormResult ──────────────────────────────────────

/**
 * @example buildSapphireStormResult(['a.ts'], [content])
 */
export async function buildSapphireStormResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireStormResult> {
  const bolts: SapphireBolt[] = files.map((file, i) =>
    analyzeSapphireBolt(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SapphireBolt[]>()
  for (const bolt of bolts) {
    const dir = path.dirname(bolt.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bolt)
    } else {
      dirMap.set(dir, [bolt])
    }
  }

  const clouds: SapphireCloud[] = Array.from(dirMap.entries()).map(([dir, dirBolts]) =>
    analyzeSapphireCloud(dirBolts, dir),
  )

  const avgGemFury = bolts.length > 0
    ? Math.round(bolts.reduce((s, b) => s + b.gemFury, 0) / bolts.length)
    : 0
  const avgStrikePrecision = bolts.length > 0
    ? Math.round(bolts.reduce((s, b) => s + b.strikePrecision, 0) / bolts.length)
    : 0
  const avgLightningClarity = bolts.length > 0
    ? Math.round(bolts.reduce((s, b) => s + b.lightningClarity, 0) / bolts.length)
    : 0
  const avgThunderResilience = bolts.length > 0
    ? Math.round(bolts.reduce((s, b) => s + b.thunderResilience, 0) / bolts.length)
    : 0
  const avgRainWisdom = bolts.length > 0
    ? Math.round(bolts.reduce((s, b) => s + b.rainWisdom, 0) / bolts.length)
    : 0

  const overallPower = Math.round(
    (avgGemFury + avgStrikePrecision + avgRainWisdom) / 3,
  )

  const atmosphere = {
    avgFury: avgGemFury,
    avgPrecision: avgStrikePrecision,
    avgWisdom: avgRainWisdom,
    isTempest: overallPower >= 80,
    overallPower,
  }

  const bestBolt = bolts.length > 0
    ? bolts.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const mostFurious = bolts.length > 0
    ? bolts.reduce((best, b) => b.gemFury > best.gemFury ? b : best).file
    : ''
  const mostPrecise = bolts.length > 0
    ? bolts.reduce((best, b) => b.strikePrecision > best.strikePrecision ? b : best).file
    : ''
  const clearest = bolts.length > 0
    ? bolts.reduce((best, b) => b.lightningClarity > best.lightningClarity ? b : best).file
    : ''
  const wisest = bolts.length > 0
    ? bolts.reduce((best, b) => b.rainWisdom > best.rainWisdom ? b : best).file
    : ''

  const stats = {
    totalFiles: bolts.length,
    totalClouds: clouds.length,
    avgGemFury,
    avgStrikePrecision,
    avgLightningClarity,
    avgThunderResilience,
    avgRainWisdom,
    perfectStormCount: bolts.filter(b => b.condition === 'perfect-storm').length,
    mightyTempestCount: bolts.filter(b => b.condition === 'mighty-tempest').length,
    properThunderstormCount: bolts.filter(b => b.condition === 'proper-thunderstorm').length,
    lightRainCount: bolts.filter(b => b.condition === 'light-rain').length,
    drizzleCount: bolts.filter(b => b.condition === 'drizzle').length,
    droughtCount: bolts.filter(b => b.condition === 'drought').length,
    hasHighFuryCount: bolts.filter(b => b.striking.hasHighFury).length,
    hasHighPrecisionCount: bolts.filter(b => b.targeting.hasHighPrecision).length,
    hasHighClarityCount: bolts.filter(b => b.illuminating.hasHighClarity).length,
    hasHighResilienceCount: bolts.filter(b => b.enduring.hasHighResilience).length,
    hasHighWisdomCount: bolts.filter(b => b.nourishing.hasHighWisdom).length,
    overallPower,
    meteorologistGrade: classifyMeteorologistGrade(overallPower),
    bestBolt,
    mostFurious,
    mostPrecise,
    clearest,
    wisest,
  }

  const recommendations = generateRecommendations(bolts, clouds, atmosphere, { ...stats, recommendations: [] } as SapphireStormResult['stats'])

  return {
    bolts,
    clouds,
    atmosphere,
    stats,
    recommendations,
  }
}
