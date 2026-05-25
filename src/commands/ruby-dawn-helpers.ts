// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Flame = 'inferno' | 'blazing-fire' | 'proper-flame' | 'flickering-candle' | 'dying-ember' | 'no-energy'
export type Dawn = 'crystal-dawn' | 'bright-morning' | 'proper-daybreak' | 'misty-dawn' | 'dark-morning' | 'no-dawn'
export type Glow = 'radiant-warmth' | 'gentle-heat' | 'proper-glow' | 'cool-surface' | 'cold-stone' | 'no-warmth'
export type Fire = 'surgical-flame' | 'precise-burn' | 'proper-fire' | 'wildfire' | 'smoldering' | 'no-fire'
export type Blood = 'iron-constitution' | 'strong-heartbeat' | 'proper-pulse' | 'weak-pulse' | 'failing-heart' | 'no-resilience'
export type RayCondition = 'ruby-masterpiece' | 'crimson-gem' | 'proper-ruby' | 'cloudy-stone' | 'rough-rock' | 'dust'
export type SunriseType = 'crimson-horizon' | 'ruby-sunrise' | 'proper-dawn' | 'grey-morning' | 'dark-dawn' | 'no-sunrise'
export type SunriseCondition = 'magnificent-dawn' | 'beautiful-sunrise' | 'proper-morning' | 'grey-dawn' | 'dark-morning' | 'void'
export type JewelerGrade = 'master-gemologist' | 'expert-jeweler' | 'skilled-cutter' | 'apprentice' | 'novice' | 'rock-smasher'

export interface EnergizingMeasure {
  energy: number
  flame: Flame
  hasHighEnergy: boolean
  hasImpactful: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasHighValue: boolean
  hasNoDeadCode: boolean
  hasAlive: boolean
  hasNoLifeless: boolean
  fillerCount: number
  boilerplateCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dawn: Dawn
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasInviting: boolean
  hasNoHostile: boolean
  hasObvious: boolean
  hasNoRequiresStudy: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface WarmingMeasure {
  warmth: number
  glow: Glow
  hasHighWarmth: boolean
  hasFriendly: boolean
  hasNoHostile: boolean
  hasHelpful: boolean
  hasNoCrypticError: boolean
  hasGraceful: boolean
  hasNoHarsh: boolean
  hasWelcoming: boolean
  hasNoRejecting: boolean
  hasHumanCentric: boolean
  hasNoMachineOnly: boolean
  hasEmpathetic: boolean
  hasNoColdLogic: boolean
  hasCompassionate: boolean
  hostileCount: number
  harshCount: number
}

export interface BurningMeasure {
  precision: number
  fire: Fire
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
  hasUnambiguous: boolean
  hasNoAmbiguous: boolean
  approximateCount: number
  sloppyCount: number
}

export interface SustainingMeasure {
  resilience: number
  blood: Blood
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
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasUnkillable: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface RubyRay {
  file: string
  crimsonEnergy: number
  dawnClarity: number
  gemWarmth: number
  firePrecision: number
  bloodResilience: number
  energizing: EnergizingMeasure
  illuminating: IlluminatingMeasure
  warming: WarmingMeasure
  burning: BurningMeasure
  sustaining: SustainingMeasure
  condition: RayCondition
  qualityScore: number
}

export interface RubySunrise {
  directory: string
  rays: RubyRay[]
  avgEnergy: number
  avgClarity: number
  avgResilience: number
  rubyMasterpieceCount: number
  dustCount: number
  sunriseType: SunriseType
  condition: SunriseCondition
}

export interface RubyDawnResult {
  rays: RubyRay[]
  sunrises: RubySunrise[]
  horizon: {
    avgEnergy: number
    avgClarity: number
    avgResilience: number
    isRuby: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalSunrises: number
    avgCrimsonEnergy: number
    avgDawnClarity: number
    avgGemWarmth: number
    avgFirePrecision: number
    avgBloodResilience: number
    rubyMasterpieceCount: number
    crimsonGemCount: number
    properRubyCount: number
    cloudyStoneCount: number
    roughRockCount: number
    dustCount: number
    hasHighEnergyCount: number
    hasHighClarityCount: number
    hasHighWarmthCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    overallBrilliance: number
    jewelerGrade: JewelerGrade
    bestRay: string
    mostEnergetic: string
    clearest: string
    warmest: string
    mostResilient: string
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

// ─── measureEnergizing ─────────────────────────────────────────────

/**
 * @example measureEnergizing('export async function process<T>(items: T[]): Promise<T[]>')
 */
export function measureEnergizing(content: string): EnergizingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasArrow = hasPattern(content, /=>/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasConsole = countPattern(content, /\bconsole\.\w+\(/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasConst) score += 4
  if (hasPipeline) score += 6
  if (hasGenerics) score += 4
  if (hasReturnType) score += 4
  if (hasArrow) score += 4
  if (hasDoc) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasDebugger) score -= 6
  if (hasConsole > 0) score -= Math.min(hasConsole * 2, 6)
  if (hasTodo) score -= 4

  const energy = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const fillerCount = (hasConsole > 0 ? 1 : 0) + (hasTodo ? 1 : 0)
  const boilerplateCount = (hasDebugger ? 1 : 0) + (hasVar > 0 ? 1 : 0)

  return {
    energy,
    flame: classifyFlame(energy),
    hasHighEnergy: energy >= 80,
    hasImpactful: hasExport && hasPipeline,
    hasEssential: hasNamed && hasConst,
    hasNoFiller: !hasTodo && hasConsole === 0,
    hasMeaningful: hasReturnType && !hasAny(content),
    hasNoBoilerplate: hasVar === 0 && !hasDebugger,
    hasDynamic: hasAsync && hasPipeline,
    hasNoStatic: hasVar === 0,
    hasPowerful: hasGenerics && hasAsync,
    hasNoWeak: !hasDebugger && !hasTodo,
    hasHighValue: hasExport && hasReturnType,
    hasNoDeadCode: !hasDebugger && hasConsole === 0,
    hasAlive: hasNamed && hasAsync,
    hasNoLifeless: !hasDebugger && !hasTodo && hasConsole === 0,
    fillerCount,
    boilerplateCount,
  }
}

// ─── measureIlluminating ───────────────────────────────────────────

/**
 * @example measureIlluminating('export function processItems(items: string[]): string[]')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

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
  if (hasType) score += 4
  if (hasNamed) score += 4
  if (hasOptional) score += 4
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    clarity,
    dawn: classifyDawn(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasConst && !hasEval,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasClear: hasReturnType && !hasAny,
    hasNoObfuscated: !hasEval && hasVar === 0,
    hasTransparent: hasExport && !hasAny,
    hasNoHidden: !hasEval,
    hasApproachable: hasConst && hasOptional,
    hasNoIntimidating: !hasEval && !hasAny,
    hasInviting: hasDoc && hasExport,
    hasNoHostile: !hasEval && !hasDebugger,
    hasObvious: hasReturnType && hasTypeAnnotation,
    hasNoRequiresStudy: hasVar === 0 && !hasAny,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureWarming ────────────────────────────────────────────────

/**
 * @example measureWarming('export function greet(name?: string): string { return name ?? "friend" }')
 */
export function measureWarming(content: string): WarmingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasDefault = hasPattern(content, /\|\|[^=]/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasOptionalChain = hasPattern(content, /\?\./)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 4
  if (hasOptional) score += 6
  if (hasNullish) score += 6
  if (hasDefault) score += 4
  if (hasDoc) score += 6
  if (hasNamed) score += 4
  if (hasAsync) score += 4
  if (hasConst) score += 4
  if (hasReturnType) score += 4
  if (hasTryCatch) score += 6
  if (hasOptionalChain) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 4
  if (hasAny) score -= 4

  const warmth = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const hostileCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const harshCount = (hasDebugger ? 1 : 0) + (hasVar > 0 ? 1 : 0)

  return {
    warmth,
    glow: classifyGlow(warmth),
    hasHighWarmth: warmth >= 80,
    hasFriendly: hasOptional || hasNullish,
    hasNoHostile: !hasEval && !hasAny,
    hasHelpful: hasDoc && hasExport,
    hasNoCrypticError: hasTryCatch || hasNullish,
    hasGraceful: hasTryCatch && hasNullish,
    hasNoHarsh: !hasDebugger && !hasEval,
    hasWelcoming: hasOptional && hasExport,
    hasNoRejecting: !hasEval && hasVar === 0,
    hasHumanCentric: hasOptional && hasNullish,
    hasNoMachineOnly: !hasAny,
    hasEmpathetic: hasOptionalChain && hasNullish,
    hasNoColdLogic: !hasAny && !hasEval,
    hasCompassionate: hasTryCatch && hasOptional,
    hostileCount,
    harshCount,
  }
}

// ─── measureBurning ────────────────────────────────────────────────

/**
 * @example measureBurning('export function precise(x: String): String { return x }')
 */
export function measureBurning(content: string): BurningMeasure {
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
    fire: classifyFire(precision),
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
    hasUnambiguous: hasReturnType && hasReadonly,
    hasNoAmbiguous: !hasAny && hasVar === 0,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureSustaining ─────────────────────────────────────────────

/**
 * @example measureSustaining('try { await work() } catch (e) { handleError(e) }')
 */
export function measureSustaining(content: string): SustainingMeasure {
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
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasFinally = hasPattern(content, /\bfinally\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasTryCatch) score += 8
  if (hasThrow) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasReturnType) score += 6
  if (hasInterface) score += 4
  if (hasGenerics) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4
  if (hasFinally) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    resilience,
    blood: classifyBlood(resilience),
    hasHighResilience: resilience >= 80,
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
    hasRecoverable: hasTryCatch || hasNullish,
    hasNoFatal: !hasEval && !hasDebugger,
    hasUnkillable: hasTryCatch && hasFinally && !hasAny,
    untestedCount,
    bareCrashCount,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

function hasAny(content: string): boolean {
  return hasPattern(content, /:\s*any\b/)
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyFlame(energy: number): Flame {
  if (energy >= 90) return 'inferno'
  if (energy >= 75) return 'blazing-fire'
  if (energy >= 60) return 'proper-flame'
  if (energy >= 40) return 'flickering-candle'
  if (energy >= 20) return 'dying-ember'
  return 'no-energy'
}

function classifyDawn(clarity: number): Dawn {
  if (clarity >= 90) return 'crystal-dawn'
  if (clarity >= 75) return 'bright-morning'
  if (clarity >= 60) return 'proper-daybreak'
  if (clarity >= 40) return 'misty-dawn'
  if (clarity >= 20) return 'dark-morning'
  return 'no-dawn'
}

function classifyGlow(warmth: number): Glow {
  if (warmth >= 90) return 'radiant-warmth'
  if (warmth >= 75) return 'gentle-heat'
  if (warmth >= 60) return 'proper-glow'
  if (warmth >= 40) return 'cool-surface'
  if (warmth >= 20) return 'cold-stone'
  return 'no-warmth'
}

function classifyFire(precision: number): Fire {
  if (precision >= 90) return 'surgical-flame'
  if (precision >= 75) return 'precise-burn'
  if (precision >= 60) return 'proper-fire'
  if (precision >= 40) return 'wildfire'
  if (precision >= 20) return 'smoldering'
  return 'no-fire'
}

function classifyBlood(resilience: number): Blood {
  if (resilience >= 90) return 'iron-constitution'
  if (resilience >= 75) return 'strong-heartbeat'
  if (resilience >= 60) return 'proper-pulse'
  if (resilience >= 40) return 'weak-pulse'
  if (resilience >= 20) return 'failing-heart'
  return 'no-resilience'
}

export function classifyRayCondition(qualityScore: number): RayCondition {
  if (qualityScore >= 90) return 'ruby-masterpiece'
  if (qualityScore >= 75) return 'crimson-gem'
  if (qualityScore >= 60) return 'proper-ruby'
  if (qualityScore >= 40) return 'cloudy-stone'
  if (qualityScore >= 20) return 'rough-rock'
  return 'dust'
}

export function classifySunriseType(rays: RubyRay[]): SunriseType {
  if (rays.length === 0) return 'no-sunrise'
  const avgQs = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  const masterpieceRatio = rays.filter(r => r.condition === 'ruby-masterpiece').length / rays.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'crimson-horizon'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'ruby-sunrise'
  if (avgQs >= 55) return 'proper-dawn'
  if (avgQs >= 35) return 'grey-morning'
  if (avgQs >= 15) return 'dark-dawn'
  return 'no-sunrise'
}

export function classifySunriseCondition(avgEnergy: number): SunriseCondition {
  if (avgEnergy >= 85) return 'magnificent-dawn'
  if (avgEnergy >= 70) return 'beautiful-sunrise'
  if (avgEnergy >= 55) return 'proper-morning'
  if (avgEnergy >= 35) return 'grey-dawn'
  if (avgEnergy >= 15) return 'dark-morning'
  return 'void'
}

export function classifyJewelerGrade(avgBrilliance: number): JewelerGrade {
  if (avgBrilliance >= 85) return 'master-gemologist'
  if (avgBrilliance >= 70) return 'expert-jeweler'
  if (avgBrilliance >= 55) return 'skilled-cutter'
  if (avgBrilliance >= 40) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-smasher'
}

// ─── analyzeRubyRay ────────────────────────────────────────────────

/**
 * @example analyzeRubyRay(content, 'src/foo.ts')
 */
export function analyzeRubyRay(content: string, filePath: string): RubyRay {
  const energizing = measureEnergizing(content)
  const illuminating = measureIlluminating(content)
  const warming = measureWarming(content)
  const burning = measureBurning(content)
  const sustaining = measureSustaining(content)

  const crimsonEnergy = energizing.energy
  const dawnClarity = illuminating.clarity
  const gemWarmth = warming.warmth
  const firePrecision = burning.precision
  const bloodResilience = sustaining.resilience

  const qualityScore = Math.round(
    crimsonEnergy * 0.2 +
    dawnClarity * 0.2 +
    gemWarmth * 0.2 +
    firePrecision * 0.2 +
    bloodResilience * 0.2,
  )

  return {
    file: filePath,
    crimsonEnergy,
    dawnClarity,
    gemWarmth,
    firePrecision,
    bloodResilience,
    energizing,
    illuminating,
    warming,
    burning,
    sustaining,
    condition: classifyRayCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeRubySunrise ────────────────────────────────────────────

/**
 * @example analyzeRubySunrise(rays, 'src')
 */
export function analyzeRubySunrise(rays: RubyRay[], dirPath: string): RubySunrise {
  if (rays.length === 0) {
    return {
      directory: dirPath,
      rays: [],
      avgEnergy: 0,
      avgClarity: 0,
      avgResilience: 0,
      rubyMasterpieceCount: 0,
      dustCount: 0,
      sunriseType: 'no-sunrise',
      condition: 'void',
    }
  }

  const avgEnergy = Math.round(rays.reduce((s, r) => s + r.crimsonEnergy, 0) / rays.length)
  const avgClarity = Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
  const avgResilience = Math.round(rays.reduce((s, r) => s + r.bloodResilience, 0) / rays.length)
  const rubyMasterpieceCount = rays.filter(r => r.condition === 'ruby-masterpiece').length
  const dustCount = rays.filter(r => r.condition === 'dust').length

  return {
    directory: dirPath,
    rays,
    avgEnergy,
    avgClarity,
    avgResilience,
    rubyMasterpieceCount,
    dustCount,
    sunriseType: classifySunriseType(rays),
    condition: classifySunriseCondition(avgEnergy),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(rays, sunrises, horizon, stats)
 */
export function generateRecommendations(
  rays: RubyRay[],
  sunrises: RubySunrise[],
  horizon: RubyDawnResult['horizon'],
  stats: RubyDawnResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallBrilliance >= 85 && stats.dustCount === 0) {
    recs.push('Ruby dawn perfection — the crimson gem catches the first light brilliantly')
    return recs
  }

  if (stats.avgCrimsonEnergy < 60) {
    recs.push('Ignite crimson energy — add exports, async, pipelines, remove console and TODO')
  }
  if (stats.avgDawnClarity < 60) {
    recs.push('Brighten dawn clarity — add type annotations, interfaces, docs, remove eval and any')
  }
  if (stats.avgGemWarmth < 60) {
    recs.push('Warm gem quality — add optional params, nullish coalescing, docs, remove eval and debugger')
  }
  if (stats.avgFirePrecision < 60) {
    recs.push('Sharpen fire precision — add type annotations, generics, readonly, remove var and debugger')
  }
  if (stats.avgBloodResilience < 60) {
    recs.push('Strengthen blood resilience — add error handling, type safety, remove eval and debugger')
  }

  if (stats.dustCount > 0) {
    const dustFiles = rays.filter(r => r.condition === 'dust').map(r => r.file)
    if (dustFiles.length <= 3) {
      recs.push(`Dust detected: ${dustFiles.join(', ')} — these need the ruby fire`)
    } else {
      recs.push(`${dustFiles.length} dust files detected — they need the ruby fire`)
    }
  }

  if (sunrises.length > 1) {
    const darkSunrises = sunrises.filter(s => s.condition === 'grey-dawn' || s.condition === 'dark-morning')
    if (darkSunrises.length > 0) {
      recs.push(`${darkSunrises.length} sunrise(s) have grey or dark conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The ruby dawn holds steady — maintain current brilliance')
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

// ─── buildRubyDawnResult ───────────────────────────────────────────

/**
 * @example buildRubyDawnResult(['a.ts'], [content])
 */
export async function buildRubyDawnResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyDawnResult> {
  const rays: RubyRay[] = files.map((file, i) =>
    analyzeRubyRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, RubyRay[]>()
  for (const ray of rays) {
    const dir = path.dirname(ray.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const sunrises: RubySunrise[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeRubySunrise(dirRays, dir),
  )

  const avgCrimsonEnergy = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.crimsonEnergy, 0) / rays.length)
    : 0
  const avgDawnClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
    : 0
  const avgGemWarmth = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.gemWarmth, 0) / rays.length)
    : 0
  const avgFirePrecision = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.firePrecision, 0) / rays.length)
    : 0
  const avgBloodResilience = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.bloodResilience, 0) / rays.length)
    : 0

  const overallBrilliance = Math.round(
    (avgCrimsonEnergy + avgDawnClarity + avgBloodResilience) / 3,
  )

  const horizon = {
    avgEnergy: avgCrimsonEnergy,
    avgClarity: avgDawnClarity,
    avgResilience: avgBloodResilience,
    isRuby: overallBrilliance >= 80,
    overallBrilliance,
  }

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const mostEnergetic = rays.length > 0
    ? rays.reduce((best, r) => r.crimsonEnergy > best.crimsonEnergy ? r : best).file
    : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => r.dawnClarity > best.dawnClarity ? r : best).file
    : ''
  const warmest = rays.length > 0
    ? rays.reduce((best, r) => r.gemWarmth > best.gemWarmth ? r : best).file
    : ''
  const mostResilient = rays.length > 0
    ? rays.reduce((best, r) => r.bloodResilience > best.bloodResilience ? r : best).file
    : ''

  const stats = {
    totalFiles: rays.length,
    totalSunrises: sunrises.length,
    avgCrimsonEnergy,
    avgDawnClarity,
    avgGemWarmth,
    avgFirePrecision,
    avgBloodResilience,
    rubyMasterpieceCount: rays.filter(r => r.condition === 'ruby-masterpiece').length,
    crimsonGemCount: rays.filter(r => r.condition === 'crimson-gem').length,
    properRubyCount: rays.filter(r => r.condition === 'proper-ruby').length,
    cloudyStoneCount: rays.filter(r => r.condition === 'cloudy-stone').length,
    roughRockCount: rays.filter(r => r.condition === 'rough-rock').length,
    dustCount: rays.filter(r => r.condition === 'dust').length,
    hasHighEnergyCount: rays.filter(r => r.energizing.hasHighEnergy).length,
    hasHighClarityCount: rays.filter(r => r.illuminating.hasHighClarity).length,
    hasHighWarmthCount: rays.filter(r => r.warming.hasHighWarmth).length,
    hasHighPrecisionCount: rays.filter(r => r.burning.hasHighPrecision).length,
    hasHighResilienceCount: rays.filter(r => r.sustaining.hasHighResilience).length,
    overallBrilliance,
    jewelerGrade: classifyJewelerGrade(overallBrilliance),
    bestRay,
    mostEnergetic,
    clearest,
    warmest,
    mostResilient,
  }

  const recommendations = generateRecommendations(rays, sunrises, horizon, { ...stats, recommendations: [] } as RubyDawnResult['stats'])

  return {
    rays,
    sunrises,
    horizon,
    stats,
    recommendations,
  }
}
