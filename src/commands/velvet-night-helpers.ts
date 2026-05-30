// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Touch = 'silk-velvet' | 'soft-cloth' | 'proper-fabric' | 'rough-cotton' | 'sandpaper' | 'no-softness'
export type Embrace = 'warm-blanket' | 'cozy-wrap' | 'proper-comfort' | 'thin-sheet' | 'no-cover' | 'no-comfort'
export type Shadow = 'midnight-silk' | 'elegant-shadow' | 'proper-drape' | 'plain-cloth' | 'torn-fabric' | 'no-elegance'
export type Sage = 'night-owl' | 'wise-watchman' | 'proper-guardian' | 'sleepy-watcher' | 'blind-bat' | 'no-wisdom'
export type Night = 'eternal-night' | 'long-winter' | 'proper-darkness' | 'short-twilight' | 'brief-sunset' | 'no-endurance'
export type FoldCondition = 'velvet-masterpiece' | 'silk-night' | 'proper-darkness' | 'dim-twilight' | 'harsh-light' | 'void'
export type ChamberType = 'silk-boudoir' | 'velvet-room' | 'proper-chamber' | 'small-closet' | 'bare-wall' | 'no-chamber'
export type ChamberCondition = 'velvet-palace' | 'silk-chamber' | 'proper-room' | 'dim-quarters' | 'bare-cell' | 'void'
export type CuratorGrade = 'master-curator' | 'night-butler' | 'skilled-host' | 'apprentice' | 'novice' | 'homeless'

export interface SoothingMeasure {
  softness: number
  touch: Touch
  hasHighSoftness: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasGentle: boolean
  hasNoHarsh: boolean
  hasInviting: boolean
  hasNoHostile: boolean
  hasWarm: boolean
  hasNoCold: boolean
  hasSelfDocumenting: boolean
  hasNoArcane: boolean
  intimidatingCount: number
  crypticCount: number
}

export interface ComfortingMeasure {
  comfort: number
  embrace: Embrace
  hasHighComfort: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasGraceful: boolean
  hasNoHarsh: boolean
  hasHelpful: boolean
  hasNoCryptic: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasForgiving: boolean
  hasNoStrict: boolean
  hasSafe: boolean
  hasNoDangerous: boolean
  bareCrashCount: number
  harshCount: number
}

export interface AdorningMeasure {
  elegance: number
  shadow: Shadow
  hasHighElegance: boolean
  hasBeautiful: boolean
  hasNoClunky: boolean
  hasElegant: boolean
  hasNoCrude: boolean
  hasRefined: boolean
  hasNoRough: boolean
  hasPolished: boolean
  hasNoHacked: boolean
  hasWellCrafted: boolean
  hasNoSlappedTogether: boolean
  hasAesthetic: boolean
  hasNoUgly: boolean
  clunkyCount: number
  hackedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  sage: Sage
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
  adHocCount: number
  hackyCount: number
}

export interface EnduringMeasure {
  resilience: number
  night: Night
  hasHighResilience: boolean
  hasObservable: boolean
  hasNoSilent: boolean
  hasLogging: boolean
  hasNoBlind: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasSelfHealing: boolean
  hasNoFatalCrash: boolean
  hasAutonomous: boolean
  hasNoRequiresBabysitting: boolean
  silentCount: number
  untestedCount: number
}

export interface VelvetFold {
  file: string
  softnessQuality: number
  darkComfort: number
  shadowElegance: number
  nocturnalWisdom: number
  nightResilience: number
  soothing: SoothingMeasure
  comforting: ComfortingMeasure
  adorning: AdorningMeasure
  knowing: KnowingMeasure
  enduring: EnduringMeasure
  condition: FoldCondition
  qualityScore: number
}

export interface VelvetChamber {
  directory: string
  folds: VelvetFold[]
  avgSoftness: number
  avgElegance: number
  avgResilience: number
  velvetMasterpieceCount: number
  voidCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

export interface VelvetNightResult {
  folds: VelvetFold[]
  chambers: VelvetChamber[]
  manor: {
    avgSoftness: number
    avgElegance: number
    avgResilience: number
    isVelvet: boolean
    overallComfort: number
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgSoftnessQuality: number
    avgDarkComfort: number
    avgShadowElegance: number
    avgNocturnalWisdom: number
    avgNightResilience: number
    velvetMasterpieceCount: number
    silkNightCount: number
    properDarknessCount: number
    dimTwilightCount: number
    harshLightCount: number
    voidCount: number
    hasHighSoftnessCount: number
    hasHighComfortCount: number
    hasHighEleganceCount: number
    hasHighWisdomCount: number
    hasHighResilienceCount: number
    overallComfort: number
    curatorGrade: CuratorGrade
    bestFold: string
    softest: string
    mostComforting: string
    mostElegant: string
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

// ─── measureSoothing ───────────────────────────────────────────────

/**
 * @example measureSoothing('export function greet(name: string): string { return name }')
 */
export function measureSoothing(content: string): SoothingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasDefault = hasPattern(content, /=\s*[^=]+\)/)
  const hasArrow = hasPattern(content, /=>/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 8
  if (hasNamed) score += 6
  if (hasDoc) score += 8
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasReturnType) score += 6
  if (hasOptional) score += 6
  if (hasReadonly) score += 4
  if (hasDefault) score += 4
  if (hasArrow) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6

  const softness = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const intimidatingCount = hasVar > 0 ? 1 : 0
  const crypticCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    softness,
    touch: classifyTouch(softness),
    hasHighSoftness: softness >= 80,
    hasApproachable: hasExport && hasNamed,
    hasNoIntimidating: !hasVar,
    hasReadable: hasExport && hasReturnType,
    hasNoCryptic: !hasEval,
    hasGentle: !hasVar && !hasEval,
    hasNoHarsh: !hasDebugger,
    hasInviting: hasDoc && hasExport,
    hasNoHostile: !hasEval && !hasDebugger,
    hasWarm: hasDoc && hasConst,
    hasNoCold: !hasVar,
    hasSelfDocumenting: hasNamed,
    hasNoArcane: !hasEval && !hasVar,
    intimidatingCount,
    crypticCount,
  }
}

// ─── measureComforting ─────────────────────────────────────────────

/**
 * @example measureComforting('try { await foo() } catch(e) { throw new Error("msg") }')
 */
export function measureComforting(content: string): ComfortingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasDefault = hasPattern(content, /=\s*[^=]+\)/)
  const hasNullish = hasPattern(content, /\?\?/)

  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasTryCatch) score += 10
  if (hasThrow) score += 8
  if (hasAsync) score += 6
  if (hasAwait) score += 6
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasOptional) score += 4
  if (hasDefault) score += 4
  if (hasNullish) score += 4

  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)
  if (hasDebugger) score -= 8
  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasAny) score -= 6

  const comfort = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bareCrashCount = (hasHackyCast > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)
  const harshCount = (hasEval ? 1 : 0) + (hasVar > 0 ? 1 : 0)

  return {
    comfort,
    embrace: classifyEmbrace(comfort),
    hasHighComfort: comfort >= 80,
    hasErrorHandled: hasTryCatch || hasThrow,
    hasNoBareCrash: hasHackyCast === 0 && !hasDebugger,
    hasGraceful: hasTryCatch && hasThrow,
    hasNoHarsh: !hasEval,
    hasHelpful: hasReturnType && !hasAny,
    hasNoCryptic: !hasEval,
    hasRecoverable: hasTryCatch || hasNullish,
    hasNoFatal: !hasEval && !hasDebugger,
    hasForgiving: hasOptional && !hasVar,
    hasNoStrict: !hasVar && !hasAny,
    hasSafe: !hasEval && !hasDebugger && hasHackyCast === 0,
    hasNoDangerous: !hasEval,
    bareCrashCount,
    harshCount,
  }
}

// ─── measureAdorning ───────────────────────────────────────────────

/**
 * @example measureAdorning('export interface Widget<T> { readonly id: string }')
 */
export function measureAdorning(content: string): AdorningMeasure {
  let score = 0

  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasGodFile = content.split('\n').length > 300

  if (hasInterface) score += 8
  if (hasEnum) score += 6
  if (hasClass) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 6
  if (hasPrivate) score += 4
  if (hasReturnType) score += 6
  if (hasDoc) score += 6
  if (hasNamed) score += 6
  if (hasPipeline) score += 6
  if (hasArrow) score += 4
  if (hasOptional) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasDebugger) score -= 6
  if (hasTodo) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)
  if (hasGodFile) score -= 6

  const elegance = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const clunkyCount = (hasVar > 0 ? 1 : 0) + (hasGodFile ? 1 : 0)
  const hackedCount = (hasHackyCast > 0 ? 1 : 0) + (hasTodo ? 1 : 0)

  return {
    elegance,
    shadow: classifyShadow(elegance),
    hasHighElegance: elegance >= 80,
    hasBeautiful: hasInterface && hasDoc,
    hasNoClunky: hasVar === 0 && !hasGodFile,
    hasElegant: hasGenerics && hasReadonly,
    hasNoCrude: !hasDebugger,
    hasRefined: hasReturnType && hasOptional,
    hasNoRough: !hasVar && !hasTodo,
    hasPolished: hasInterface && hasNamed,
    hasNoHacked: hasHackyCast === 0 && !hasTodo,
    hasWellCrafted: hasDoc && !hasDebugger,
    hasNoSlappedTogether: !hasDebugger && !hasGodFile,
    hasAesthetic: hasInterface && hasEnum,
    hasNoUgly: !hasDebugger && !hasTodo,
    clunkyCount,
    hackedCount,
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

  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasVar = countPattern(content, /\bvar\b/)

  if (hasDoc) score += 10
  if (hasInterface) score += 8
  if (hasType) score += 8
  if (hasEnum) score += 6
  if (hasClass) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4

  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 15)
  if (hasDebugger) score -= 8
  if (hasTodo) score -= 5
  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasTodo ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    wisdom,
    sage: classifySage(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasVar,
    hasPatterned: (hasExtends && hasImplements) || hasAbstract,
    hasNoReinvented: !hasTodo,
    hasPrincipled: hasExport && hasConst && !hasPattern(content, /\bas\s+any\b/),
    hasNoHacky: !hasPattern(content, /\bas\s+any\b/) && !hasDebugger,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasProven: hasExtends || hasImplements,
    hasNoExperimental: !hasTodo,
    hasEstablished: wisdom >= 70,
    adHocCount,
    hackyCount,
  }
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('export async function run(): Promise<void> { try { await work() } catch(e) { log(e) } }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasTryCatch) score += 10
  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasThrow) score += 6
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasTypeAnnotation) score += 4
  if (hasPrivate) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasAny) score -= 6
  if (hasDebugger) score -= 8
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const silentCount = (hasDebugger ? 1 : 0)
  const untestedCount = hasVar > 0 ? 1 : 0

  return {
    resilience,
    night: classifyNight(resilience),
    hasHighResilience: resilience >= 80,
    hasObservable: hasTryCatch || hasThrow,
    hasNoSilent: !hasDebugger,
    hasLogging: hasTryCatch,
    hasNoBlind: !hasDebugger,
    hasTested: hasTryCatch,
    hasNoUntested: !hasVar,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasVar && !hasAny,
    hasSelfHealing: hasTryCatch && (hasNullish || hasOptionalChain),
    hasNoFatalCrash: !hasDebugger && hasHackyCast === 0,
    hasAutonomous: hasAsync && hasTryCatch,
    hasNoRequiresBabysitting: !hasVar && !hasDebugger,
    silentCount,
    untestedCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyTouch(softness: number): Touch {
  if (softness >= 90) return 'silk-velvet'
  if (softness >= 75) return 'soft-cloth'
  if (softness >= 60) return 'proper-fabric'
  if (softness >= 40) return 'rough-cotton'
  if (softness >= 20) return 'sandpaper'
  return 'no-softness'
}

function classifyEmbrace(comfort: number): Embrace {
  if (comfort >= 90) return 'warm-blanket'
  if (comfort >= 75) return 'cozy-wrap'
  if (comfort >= 60) return 'proper-comfort'
  if (comfort >= 40) return 'thin-sheet'
  if (comfort >= 20) return 'no-cover'
  return 'no-comfort'
}

function classifyShadow(elegance: number): Shadow {
  if (elegance >= 90) return 'midnight-silk'
  if (elegance >= 75) return 'elegant-shadow'
  if (elegance >= 60) return 'proper-drape'
  if (elegance >= 40) return 'plain-cloth'
  if (elegance >= 20) return 'torn-fabric'
  return 'no-elegance'
}

function classifySage(wisdom: number): Sage {
  if (wisdom >= 90) return 'night-owl'
  if (wisdom >= 75) return 'wise-watchman'
  if (wisdom >= 60) return 'proper-guardian'
  if (wisdom >= 40) return 'sleepy-watcher'
  if (wisdom >= 20) return 'blind-bat'
  return 'no-wisdom'
}

function classifyNight(resilience: number): Night {
  if (resilience >= 90) return 'eternal-night'
  if (resilience >= 75) return 'long-winter'
  if (resilience >= 60) return 'proper-darkness'
  if (resilience >= 40) return 'short-twilight'
  if (resilience >= 20) return 'brief-sunset'
  return 'no-endurance'
}

export function classifyFoldCondition(qualityScore: number): FoldCondition {
  if (qualityScore >= 90) return 'velvet-masterpiece'
  if (qualityScore >= 75) return 'silk-night'
  if (qualityScore >= 60) return 'proper-darkness'
  if (qualityScore >= 40) return 'dim-twilight'
  if (qualityScore >= 20) return 'harsh-light'
  return 'void'
}

export function classifyChamberType(folds: VelvetFold[]): ChamberType {
  if (folds.length === 0) return 'no-chamber'
  const avgQs = folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length
  const masterpieceRatio = folds.filter(f => f.condition === 'velvet-masterpiece').length / folds.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'silk-boudoir'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'velvet-room'
  if (avgQs >= 55) return 'proper-chamber'
  if (avgQs >= 35) return 'small-closet'
  if (avgQs >= 15) return 'bare-wall'
  return 'no-chamber'
}

export function classifyChamberCondition(avgSoftness: number): ChamberCondition {
  if (avgSoftness >= 85) return 'velvet-palace'
  if (avgSoftness >= 70) return 'silk-chamber'
  if (avgSoftness >= 55) return 'proper-room'
  if (avgSoftness >= 35) return 'dim-quarters'
  if (avgSoftness >= 15) return 'bare-cell'
  return 'void'
}

export function classifyCuratorGrade(avgComfort: number): CuratorGrade {
  if (avgComfort >= 85) return 'master-curator'
  if (avgComfort >= 70) return 'night-butler'
  if (avgComfort >= 55) return 'skilled-host'
  if (avgComfort >= 40) return 'apprentice'
  if (avgComfort >= 20) return 'novice'
  return 'homeless'
}

// ─── analyzeVelvetFold ─────────────────────────────────────────────

/**
 * @example analyzeVelvetFold(content, 'src/foo.ts')
 */
export function analyzeVelvetFold(content: string, filePath: string): VelvetFold {
  const soothing = measureSoothing(content)
  const comforting = measureComforting(content)
  const adorning = measureAdorning(content)
  const knowing = measureKnowing(content)
  const enduring = measureEnduring(content)

  const softnessQuality = soothing.softness
  const darkComfort = comforting.comfort
  const shadowElegance = adorning.elegance
  const nocturnalWisdom = knowing.wisdom
  const nightResilience = enduring.resilience

  const qualityScore = Math.round(
    softnessQuality * 0.2 +
    darkComfort * 0.2 +
    shadowElegance * 0.2 +
    nocturnalWisdom * 0.2 +
    nightResilience * 0.2,
  )

  return {
    file: filePath,
    softnessQuality,
    darkComfort,
    shadowElegance,
    nocturnalWisdom,
    nightResilience,
    soothing,
    comforting,
    adorning,
    knowing,
    enduring,
    condition: classifyFoldCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeVelvetChamber ──────────────────────────────────────────

/**
 * @example analyzeVelvetChamber(folds, 'src')
 */
export function analyzeVelvetChamber(folds: VelvetFold[], dirPath: string): VelvetChamber {
  if (folds.length === 0) {
    return {
      directory: dirPath,
      folds: [],
      avgSoftness: 0,
      avgElegance: 0,
      avgResilience: 0,
      velvetMasterpieceCount: 0,
      voidCount: 0,
      chamberType: 'no-chamber',
      condition: 'void',
    }
  }

  const avgSoftness = Math.round(folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length)
  const avgElegance = Math.round(folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length)
  const avgResilience = Math.round(folds.reduce((s, f) => s + f.nightResilience, 0) / folds.length)
  const velvetMasterpieceCount = folds.filter(f => f.condition === 'velvet-masterpiece').length
  const voidCount = folds.filter(f => f.condition === 'void').length

  return {
    directory: dirPath,
    folds,
    avgSoftness,
    avgElegance,
    avgResilience,
    velvetMasterpieceCount,
    voidCount,
    chamberType: classifyChamberType(folds),
    condition: classifyChamberCondition(avgSoftness),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(folds, chambers, manor, stats)
 */
export function generateRecommendations(
  folds: VelvetFold[],
  chambers: VelvetChamber[],
  _manor: VelvetNightResult['manor'],
  stats: VelvetNightResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallComfort >= 85 && stats.voidCount === 0) {
    recs.push('Velvet perfection — the night wraps everything in silk and comfort')
    return recs
  }

  if (stats.avgSoftnessQuality < 60) {
    recs.push('Soften the code — add JSDoc, named exports, optional params, and remove var and eval')
  }
  if (stats.avgDarkComfort < 60) {
    recs.push('Improve dark comfort — add try/catch, throw, async/await, remove debugger and as any')
  }
  if (stats.avgShadowElegance < 60) {
    recs.push('Enhance shadow elegance — add interfaces, generics, readonly, remove TODO and debugger')
  }
  if (stats.avgNocturnalWisdom < 60) {
    recs.push('Deepen nocturnal wisdom — add proven patterns, abstractions, JSDoc, remove var and TODO')
  }
  if (stats.avgNightResilience < 60) {
    recs.push('Strengthen night resilience — add error handling, type safety, remove debugger and var')
  }

  if (stats.voidCount > 0) {
    const voidFiles = folds.filter(f => f.condition === 'void').map(f => f.file)
    if (voidFiles.length <= 3) {
      recs.push(`Void detected: ${voidFiles.join(', ')} — these need velvet`)
    } else {
      recs.push(`${voidFiles.length} void files detected — they need velvet`)
    }
  }

  if (chambers.length > 1) {
    const weakChambers = chambers.filter(c => c.condition === 'dim-quarters' || c.condition === 'bare-cell')
    if (weakChambers.length > 0) {
      recs.push(`${weakChambers.length} chamber(s) have dim or bare conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The velvet night holds steady — maintain current comfort')
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

// ─── buildVelvetNightResult ────────────────────────────────────────

/**
 * @example buildVelvetNightResult(['a.ts'], [content])
 */
export async function buildVelvetNightResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<VelvetNightResult> {
  const folds: VelvetFold[] = files.map((file, i) =>
    analyzeVelvetFold(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, VelvetFold[]>()
  for (const fold of folds) {
    const dir = path.dirname(fold.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(fold)
    } else {
      dirMap.set(dir, [fold])
    }
  }

  const chambers: VelvetChamber[] = Array.from(dirMap.entries()).map(([dir, dirFolds]) =>
    analyzeVelvetChamber(dirFolds, dir),
  )

  const avgSoftnessQuality = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length)
    : 0
  const avgDarkComfort = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.darkComfort, 0) / folds.length)
    : 0
  const avgShadowElegance = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length)
    : 0
  const avgNocturnalWisdom = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.nocturnalWisdom, 0) / folds.length)
    : 0
  const avgNightResilience = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.nightResilience, 0) / folds.length)
    : 0

  const overallComfort = Math.round(
    (avgSoftnessQuality + avgShadowElegance + avgNightResilience) / 3,
  )

  const manor = {
    avgSoftness: avgSoftnessQuality,
    avgElegance: avgShadowElegance,
    avgResilience: avgNightResilience,
    isVelvet: overallComfort >= 80,
    overallComfort,
  }

  const bestFold = folds.length > 0
    ? folds.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file
    : ''
  const softest = folds.length > 0
    ? folds.reduce((best, f) => f.softnessQuality > best.softnessQuality ? f : best).file
    : ''
  const mostComforting = folds.length > 0
    ? folds.reduce((best, f) => f.darkComfort > best.darkComfort ? f : best).file
    : ''
  const mostElegant = folds.length > 0
    ? folds.reduce((best, f) => f.shadowElegance > best.shadowElegance ? f : best).file
    : ''
  const wisest = folds.length > 0
    ? folds.reduce((best, f) => f.nocturnalWisdom > best.nocturnalWisdom ? f : best).file
    : ''

  const stats = {
    totalFiles: folds.length,
    totalChambers: chambers.length,
    avgSoftnessQuality,
    avgDarkComfort,
    avgShadowElegance,
    avgNocturnalWisdom,
    avgNightResilience,
    velvetMasterpieceCount: folds.filter(f => f.condition === 'velvet-masterpiece').length,
    silkNightCount: folds.filter(f => f.condition === 'silk-night').length,
    properDarknessCount: folds.filter(f => f.condition === 'proper-darkness').length,
    dimTwilightCount: folds.filter(f => f.condition === 'dim-twilight').length,
    harshLightCount: folds.filter(f => f.condition === 'harsh-light').length,
    voidCount: folds.filter(f => f.condition === 'void').length,
    hasHighSoftnessCount: folds.filter(f => f.soothing.hasHighSoftness).length,
    hasHighComfortCount: folds.filter(f => f.comforting.hasHighComfort).length,
    hasHighEleganceCount: folds.filter(f => f.adorning.hasHighElegance).length,
    hasHighWisdomCount: folds.filter(f => f.knowing.hasHighWisdom).length,
    hasHighResilienceCount: folds.filter(f => f.enduring.hasHighResilience).length,
    overallComfort,
    curatorGrade: classifyCuratorGrade(overallComfort),
    bestFold,
    softest,
    mostComforting,
    mostElegant,
    wisest,
  }

  const recommendations = generateRecommendations(folds, chambers, manor, { ...stats, recommendations: [] } as VelvetNightResult['stats'])

  return {
    folds,
    chambers,
    manor,
    stats,
    recommendations,
  }
}
