// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Flower = 'night-queen' | 'moonflower' | 'evening-primrose' | 'closed-bud' | 'wilted-petal' | 'no-bloom'
export type Shadow = 'deep-forest' | 'proper-shadow' | 'twilight-zone' | 'shallow-ledge' | 'flat-ground' | 'no-shadow'
export type Moonlight = 'full-moon' | 'bright-crescent' | 'proper-glow' | 'clouded-moon' | 'dark-night' | 'no-light'
export type Scent = 'jasmine-night' | 'honeysuckle' | 'proper-fragrance' | 'faint-scent' | 'no-odor' | 'foul-smell'
export type Endurance = 'perpetual-night' | 'winter-hardy' | 'proper-endurance' | 'frost-sensitive' | 'annual-plant' | 'no-endurance'
export type BloomCondition = 'midnight-masterpiece' | 'moonlit-garden' | 'twilight-bed' | 'dim-corner' | 'dark-patch' | 'barren-soil'
export type BedType = 'royal-garden' | 'moonlit-parterre' | 'proper-bed' | 'small-plot' | 'window-box' | 'no-bed'
export type BedCondition = 'midnight-paradise' | 'moonlit-estate' | 'proper-garden' | 'dim-yard' | 'dark-corner' | 'void'
export type GardenerGrade = 'master-gardener' | 'night-curator' | 'skilled-botanist' | 'apprentice' | 'novice' | 'weed-puller'

export interface FloweringMeasure {
  bloom: number
  flower: Flower
  hasHighBloom: boolean
  hasProductionReady: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasSolid: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface ShadowingMeasure {
  depth: number
  shadow: Shadow
  hasHighDepth: boolean
  hasEdgeCaseCovered: boolean
  hasNoSinglePath: boolean
  hasValidated: boolean
  hasNoTrusting: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasBoundaryChecked: boolean
  hasNoAssumed: boolean
  hasNullSafe: boolean
  singlePathCount: number
  trustingCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  moonlight: Moonlight
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasGentle: boolean
  hasNoHarsh: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasInviting: boolean
  hasNoHostile: boolean
  hasWarm: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ScentingMeasure {
  fragrance: number
  scent: Scent
  hasHighFragrance: boolean
  hasCleanCode: boolean
  hasNoCodeSmell: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasWellCrafted: boolean
  hasNoHacked: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasBeautiful: boolean
  hasNoUgly: boolean
  codeSmellCount: number
  hackedCount: number
}

export interface EnduringMeasure {
  resilience: number
  endurance: Endurance
  hasHighResilience: boolean
  hasObservable: boolean
  hasNoSilent: boolean
  hasLogging: boolean
  hasNoBlind: boolean
  hasSelfHealing: boolean
  hasNoFatalCrash: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasMonitored: boolean
  hasNoAbandoned: boolean
  hasMaintained: boolean
  hasNoNeglected: boolean
  silentCount: number
  blindCount: number
}

export interface NightBloom {
  file: string
  nocturnalBloom: number
  shadowDepth: number
  moonlitClarity: number
  nightFragrance: number
  darkResilience: number
  flowering: FloweringMeasure
  shadowing: ShadowingMeasure
  illuminating: IlluminatingMeasure
  scenting: ScentingMeasure
  enduring: EnduringMeasure
  condition: BloomCondition
  qualityScore: number
}

export interface MoonlightBed {
  directory: string
  blooms: NightBloom[]
  avgBloom: number
  avgClarity: number
  avgResilience: number
  midnightMasterpieceCount: number
  barrenSoilCount: number
  bedType: BedType
  condition: BedCondition
}

export interface MidnightGardenResult {
  blooms: NightBloom[]
  beds: MoonlightBed[]
  estate: {
    avgBloom: number
    avgClarity: number
    avgResilience: number
    isMoonlit: boolean
    overallFragrance: number
  }
  stats: {
    totalFiles: number
    totalBeds: number
    avgNocturnalBloom: number
    avgShadowDepth: number
    avgMoonlitClarity: number
    avgNightFragrance: number
    avgDarkResilience: number
    midnightMasterpieceCount: number
    moonlitGardenCount: number
    twilightBedCount: number
    dimCornerCount: number
    darkPatchCount: number
    barrenSoilCount: number
    hasHighBloomCount: number
    hasHighDepthCount: number
    hasHighClarityCount: number
    hasHighFragranceCount: number
    hasHighResilienceCount: number
    overallFragrance: number
    gardenerGrade: GardenerGrade
    bestBloom: string
    bestBlooming: string
    deepestShadow: string
    clearest: string
    mostFragrant: string
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

// ─── measureFlowering ──────────────────────────────────────────────

/**
 * @example measureFlowering('export async function foo() { try { await bar() } catch(e) { throw new Error(e) } }')
 */
export function measureFlowering(content: string): FloweringMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasNewError = hasPattern(content, /\bthrow\s+new\b/)
  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasBareThrow = hasThrow && !hasNewError
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 8
  if (hasAsync) score += 10
  if (hasAwait) score += 8
  if (hasTryCatch) score += 10
  if (hasThrow) score += 6
  if (hasNewError) score += 4
  if (hasType) score += 8
  if (hasInterface) score += 6
  if (hasGenerics) score += 6
  if (hasConst) score += 4
  if (hasReturn) score += 4
  if (hasOptional) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 5, 15)
  if (hasAny) score -= 10
  if (hasDebugger) score -= 10

  const bloom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bareCrashCount = (hasBareThrow ? 1 : 0) + (hasDebugger ? 1 : 0)
  const untestedCount = hasVar > 0 ? 1 : 0

  return {
    bloom,
    flower: classifyFlower(bloom),
    hasHighBloom: bloom >= 80,
    hasProductionReady: hasExport && hasAsync,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasBareThrow && !hasDebugger,
    hasTested: hasTryCatch || hasAsync,
    hasNoUntested: !hasPattern(content, /\bvar\b/),
    hasTypeSafe: hasType && !hasAny,
    hasNoUnsafe: !hasVar,
    hasRobust: hasTryCatch && hasThrow,
    hasNoFragile: !hasVar && !hasAny,
    hasReliable: bloom >= 70,
    hasNoFlaky: !hasDebugger && !hasAny,
    hasSolid: bloom >= 60,
    bareCrashCount,
    untestedCount,
  }
}

// ─── measureShadowing ──────────────────────────────────────────────

/**
 * @example measureShadowing('function foo(x: string | undefined) { if (x === null) return; return x.toUpperCase() }')
 */
export function measureShadowing(content: string): ShadowingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasIfElse = hasPattern(content, /\bif\b/) && hasPattern(content, /\belse\b/)
  const hasTypeGuard = hasPattern(content, /typeof\s+\w+/)
  const hasNullCheck = hasPattern(content, /===?\s*null|!==?\s*null/)
  const hasUndefinedCheck = hasPattern(content, /===?\s*undefined|!==?\s*undefined/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasDefaultParam = hasPattern(content, /=\s*[^=]+\)/)
  const hasNonNullOr = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasSwitch = hasPattern(content, /\bswitch\b/)
  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)

  const hasBareThrow = hasThrow && !hasPattern(content, /\bthrow\s+new\b/)
  const hasVar = hasPattern(content, /\bvar\b/)
  const hasTrusting = countPattern(content, /!\w+\[/) // non-null assertion
  const hasSinglePath = hasPattern(content, /\bif\b/) && !hasPattern(content, /\belse\b/) && !hasPattern(content, /\breturn\b/)

  if (hasTryCatch) score += 10
  if (hasThrow) score += 6
  if (hasIfElse) score += 8
  if (hasTypeGuard) score += 8
  if (hasNullCheck) score += 6
  if (hasUndefinedCheck) score += 6
  if (hasOptional) score += 6
  if (hasDefaultParam) score += 6
  if (hasNonNullOr) score += 6
  if (hasOptionalChain) score += 6
  if (hasSwitch) score += 4
  if (hasType) score += 6

  if (hasBareThrow) score -= 5
  if (hasVar) score -= 8
  if (hasTrusting > 0) score -= Math.min(hasTrusting * 3, 9)
  if (hasSinglePath) score -= 4

  const depth = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const singlePathCount = hasSinglePath ? 1 : 0
  const trustingCount = Math.min(hasTrusting, 5)

  return {
    depth,
    shadow: classifyShadow(depth),
    hasHighDepth: depth >= 80,
    hasEdgeCaseCovered: hasTryCatch || hasIfElse,
    hasNoSinglePath: !hasSinglePath,
    hasValidated: hasTypeGuard || hasNullCheck || hasUndefinedCheck,
    hasNoTrusting: hasTrusting === 0,
    hasDefensive: hasOptional || hasDefaultParam || hasNonNullOr,
    hasNoNaive: !hasVar,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasBareThrow,
    hasBoundaryChecked: hasNullCheck || hasUndefinedCheck || hasTypeGuard,
    hasNoAssumed: hasTrusting === 0 && !hasVar,
    hasNullSafe: hasOptionalChain || hasNonNullOr || hasNullCheck,
    singlePathCount,
    trustingCount,
  }
}

// ─── measureIlluminating ───────────────────────────────────────────

/**
 * @example measureIlluminating('export function foo(): string { return "a" }')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasGenerics = hasPattern(content, /<\w+/)

  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasWith = hasPattern(content, /\bwith\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasCrypticName = countPattern(content, /\b[a-z]{1,2}\b\s*[=:(]/)

  if (hasExport) score += 8
  if (hasNamed) score += 6
  if (hasDoc) score += 10
  if (hasReturnType) score += 8
  if (hasType) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasEnum) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasGenerics) score += 6

  if (hasEval) score -= 15
  if (hasWith) score -= 10
  if (hasDebugger) score -= 10
  if (hasCrypticName > 3) score -= 5

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasWith ? 1 : 0)
  const obfuscatedCount = hasDebugger ? 1 : 0

  return {
    clarity,
    moonlight: classifyMoonlight(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport || hasConst,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && !hasWith,
    hasClear: hasReturnType || hasConst,
    hasNoObfuscated: !hasDebugger,
    hasGentle: hasExport && (hasInterface || hasType),
    hasNoHarsh: !hasEval,
    hasApproachable: hasInterface || hasEnum,
    hasNoIntimidating: !hasDebugger && !hasEval,
    hasInviting: clarity >= 70,
    hasNoHostile: !hasWith,
    hasWarm: hasDoc,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureScenting ───────────────────────────────────────────────

/**
 * @example measureScenting('export interface Foo { readonly bar: string }')
 */
export function measureScenting(content: string): ScentingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)

  if (hasExport) score += 8
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasEnum) score += 4
  if (hasClass) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasAsync) score += 4
  if (hasConst) score += 4
  if (hasDoc) score += 6
  if (hasPrivate) score += 4
  if (hasNamed) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasAny) score -= 8
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 10)
  if (hasEval) score -= 10
  if (hasDebugger) score -= 8
  if (hasTodo) score -= 4

  const fragrance = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const codeSmellCount = (hasVar > 0 ? 1 : 0) + (hasAny ? 1 : 0) + (hasEval ? 1 : 0)
  const hackedCount = Math.min(hasHackyCast, 5)

  return {
    fragrance,
    scent: classifyScent(fragrance),
    hasHighFragrance: fragrance >= 80,
    hasCleanCode: !hasAny && !hasEval,
    hasNoCodeSmell: codeSmellCount === 0,
    hasElegant: hasGenerics || hasReadonly,
    hasNoClunky: !hasVar,
    hasWellCrafted: hasExport && hasNamed,
    hasNoHacked: hasHackyCast === 0 && !hasDebugger,
    hasPolished: hasInterface && hasClass,
    hasNoRough: !hasDebugger && !hasTodo,
    hasRefined: hasDoc && hasPrivate,
    hasNoCrude: !hasVar && !hasAny && !hasEval,
    hasBeautiful: fragrance >= 75,
    hasNoUgly: codeSmellCount === 0 && hackedCount === 0,
    codeSmellCount,
    hackedCount,
  }
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('export class Foo { private logger = new Logger(); async run() { try { await this.doWork() } catch(e) { this.logger.error(e); throw new Error(e.message) } } }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasNewError = hasPattern(content, /\bthrow\s+new\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasFinally = hasPattern(content, /\bfinally\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasEmptyCatch = hasPattern(content, /catch\s*\([^)]*\)\s*\{\s*\}/)
  const hasSilent = hasPattern(content, /console\.(log|warn|error)\s*\(/) === false && hasPattern(content, /\btry\b/)
  const hasBareThrow = hasThrow && !hasNewError
  const hasVar = hasPattern(content, /\bvar\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)

  if (hasTryCatch) score += 10
  if (hasThrow) score += 6
  if (hasNewError) score += 4
  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasExport) score += 4
  if (hasClass) score += 6
  if (hasPrivate) score += 4
  if (hasReturn) score += 4
  if (hasDoc) score += 6
  if (hasFinally) score += 8
  if (hasConst) score += 4

  if (hasEmptyCatch) score -= 10
  if (hasBareThrow) score -= 5
  if (hasVar) score -= 8
  if (hasTodo) score -= 4

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const silentCount = hasSilent ? 1 : 0
  const blindCount = (hasEmptyCatch ? 1 : 0) + (hasVar ? 1 : 0)

  return {
    resilience,
    endurance: classifyEndurance(resilience),
    hasHighResilience: resilience >= 80,
    hasObservable: !hasSilent || hasFinally,
    hasNoSilent: !hasSilent,
    hasLogging: hasFinally || hasTryCatch,
    hasNoBlind: !hasEmptyCatch,
    hasSelfHealing: hasTryCatch && hasNewError,
    hasNoFatalCrash: !hasBareThrow && !hasEmptyCatch,
    hasGraceful: hasTryCatch && (hasNewError || hasFinally),
    hasNoHarshFail: !hasBareThrow,
    hasMonitored: hasDoc || hasExport,
    hasNoAbandoned: !hasTodo,
    hasMaintained: !hasVar && !hasTodo,
    hasNoNeglected: !hasEmptyCatch && !hasVar,
    silentCount,
    blindCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyFlower(bloom: number): Flower {
  if (bloom >= 90) return 'night-queen'
  if (bloom >= 75) return 'moonflower'
  if (bloom >= 60) return 'evening-primrose'
  if (bloom >= 40) return 'closed-bud'
  if (bloom >= 20) return 'wilted-petal'
  return 'no-bloom'
}

function classifyShadow(depth: number): Shadow {
  if (depth >= 90) return 'deep-forest'
  if (depth >= 75) return 'proper-shadow'
  if (depth >= 60) return 'twilight-zone'
  if (depth >= 40) return 'shallow-ledge'
  if (depth >= 20) return 'flat-ground'
  return 'no-shadow'
}

function classifyMoonlight(clarity: number): Moonlight {
  if (clarity >= 90) return 'full-moon'
  if (clarity >= 75) return 'bright-crescent'
  if (clarity >= 60) return 'proper-glow'
  if (clarity >= 40) return 'clouded-moon'
  if (clarity >= 20) return 'dark-night'
  return 'no-light'
}

function classifyScent(fragrance: number): Scent {
  if (fragrance >= 90) return 'jasmine-night'
  if (fragrance >= 75) return 'honeysuckle'
  if (fragrance >= 60) return 'proper-fragrance'
  if (fragrance >= 40) return 'faint-scent'
  if (fragrance >= 20) return 'no-odor'
  return 'foul-smell'
}

function classifyEndurance(resilience: number): Endurance {
  if (resilience >= 90) return 'perpetual-night'
  if (resilience >= 75) return 'winter-hardy'
  if (resilience >= 60) return 'proper-endurance'
  if (resilience >= 40) return 'frost-sensitive'
  if (resilience >= 20) return 'annual-plant'
  return 'no-endurance'
}

export function classifyBloomCondition(qualityScore: number): BloomCondition {
  if (qualityScore >= 90) return 'midnight-masterpiece'
  if (qualityScore >= 75) return 'moonlit-garden'
  if (qualityScore >= 60) return 'twilight-bed'
  if (qualityScore >= 40) return 'dim-corner'
  if (qualityScore >= 20) return 'dark-patch'
  return 'barren-soil'
}

export function classifyBedType(blooms: NightBloom[]): BedType {
  if (blooms.length === 0) return 'no-bed'
  const avgQs = blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length
  const masterpieceRatio = blooms.filter(b => b.condition === 'midnight-masterpiece').length / blooms.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'royal-garden'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'moonlit-parterre'
  if (avgQs >= 55) return 'proper-bed'
  if (avgQs >= 35) return 'small-plot'
  if (avgQs >= 15) return 'window-box'
  return 'no-bed'
}

export function classifyBedCondition(avgBloom: number): BedCondition {
  if (avgBloom >= 85) return 'midnight-paradise'
  if (avgBloom >= 70) return 'moonlit-estate'
  if (avgBloom >= 55) return 'proper-garden'
  if (avgBloom >= 35) return 'dim-yard'
  if (avgBloom >= 15) return 'dark-corner'
  return 'void'
}

export function classifyGardenerGrade(avgFragrance: number): GardenerGrade {
  if (avgFragrance >= 85) return 'master-gardener'
  if (avgFragrance >= 70) return 'night-curator'
  if (avgFragrance >= 55) return 'skilled-botanist'
  if (avgFragrance >= 40) return 'apprentice'
  if (avgFragrance >= 20) return 'novice'
  return 'weed-puller'
}

// ─── analyzeNightBloom ─────────────────────────────────────────────

/**
 * @example analyzeNightBloom(content, 'src/foo.ts')
 */
export function analyzeNightBloom(content: string, filePath: string): NightBloom {
  const flowering = measureFlowering(content)
  const shadowing = measureShadowing(content)
  const illuminating = measureIlluminating(content)
  const scenting = measureScenting(content)
  const enduring = measureEnduring(content)

  const nocturnalBloom = flowering.bloom
  const shadowDepth = shadowing.depth
  const moonlitClarity = illuminating.clarity
  const nightFragrance = scenting.fragrance
  const darkResilience = enduring.resilience

  const qualityScore = Math.round(
    nocturnalBloom * 0.2 +
    shadowDepth * 0.2 +
    moonlitClarity * 0.2 +
    nightFragrance * 0.2 +
    darkResilience * 0.2,
  )

  return {
    file: filePath,
    nocturnalBloom,
    shadowDepth,
    moonlitClarity,
    nightFragrance,
    darkResilience,
    flowering,
    shadowing,
    illuminating,
    scenting,
    enduring,
    condition: classifyBloomCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeMoonlightBed ───────────────────────────────────────────

/**
 * @example analyzeMoonlightBed(blooms, 'src')
 */
export function analyzeMoonlightBed(blooms: NightBloom[], dirPath: string): MoonlightBed {
  if (blooms.length === 0) {
    return {
      directory: dirPath,
      blooms: [],
      avgBloom: 0,
      avgClarity: 0,
      avgResilience: 0,
      midnightMasterpieceCount: 0,
      barrenSoilCount: 0,
      bedType: 'no-bed',
      condition: 'void',
    }
  }

  const avgBloom = Math.round(blooms.reduce((s, b) => s + b.nocturnalBloom, 0) / blooms.length)
  const avgClarity = Math.round(blooms.reduce((s, b) => s + b.moonlitClarity, 0) / blooms.length)
  const avgResilience = Math.round(blooms.reduce((s, b) => s + b.darkResilience, 0) / blooms.length)
  const midnightMasterpieceCount = blooms.filter(b => b.condition === 'midnight-masterpiece').length
  const barrenSoilCount = blooms.filter(b => b.condition === 'barren-soil').length

  return {
    directory: dirPath,
    blooms,
    avgBloom,
    avgClarity,
    avgResilience,
    midnightMasterpieceCount,
    barrenSoilCount,
    bedType: classifyBedType(blooms),
    condition: classifyBedCondition(avgBloom),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(blooms, beds, estate, stats)
 */
export function generateRecommendations(
  blooms: NightBloom[],
  beds: MoonlightBed[],
  estate: MidnightGardenResult['estate'],
  stats: MidnightGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallFragrance >= 85 && stats.barrenSoilCount === 0) {
    recs.push('Midnight paradise achieved — the garden blooms in cosmic perfection')
    return recs
  }

  if (stats.avgNocturnalBloom < 60) {
    recs.push('Nurture your blooms — add async/await, error handling, and type safety')
  }
  if (stats.avgShadowDepth < 60) {
    recs.push('Deepen shadows — add edge case handling, null checks, and defensive patterns')
  }
  if (stats.avgMoonlitClarity < 60) {
    recs.push('Brighten moonlight — add documentation, return types, and named exports')
  }
  if (stats.avgNightFragrance < 60) {
    recs.push('Enhance fragrance — remove code smells, use interfaces and generics')
  }
  if (stats.avgDarkResilience < 60) {
    recs.push('Strengthen resilience — add try/catch, logging, and graceful error handling')
  }

  if (stats.barrenSoilCount > 0) {
    const barrenFiles = blooms.filter(b => b.condition === 'barren-soil').map(b => b.file)
    if (barrenFiles.length <= 3) {
      recs.push(`Barren soil detected: ${barrenFiles.join(', ')} — these plots need tending`)
    } else {
      recs.push(`${barrenFiles.length} barren plots detected — they need tending`)
    }
  }

  if (beds.length > 1) {
    const weakBeds = beds.filter(b => b.condition === 'dark-corner' || b.condition === 'dim-yard')
    if (weakBeds.length > 0) {
      recs.push(`${weakBeds.length} bed(s) have dim or dark conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The midnight garden thrives — maintain current bloom quality')
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

// ─── buildMidnightGardenResult ──────────────────────────────────────

/**
 * @example buildMidnightGardenResult(['a.ts'], [content])
 */
export async function buildMidnightGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MidnightGardenResult> {
  const blooms: NightBloom[] = files.map((file, i) =>
    analyzeNightBloom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, NightBloom[]>()
  for (const bloom of blooms) {
    const dir = path.dirname(bloom.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bloom)
    } else {
      dirMap.set(dir, [bloom])
    }
  }

  const beds: MoonlightBed[] = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzeMoonlightBed(dirBlooms, dir),
  )

  const avgNocturnalBloom = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.nocturnalBloom, 0) / blooms.length)
    : 0
  const avgShadowDepth = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.shadowDepth, 0) / blooms.length)
    : 0
  const avgMoonlitClarity = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.moonlitClarity, 0) / blooms.length)
    : 0
  const avgNightFragrance = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.nightFragrance, 0) / blooms.length)
    : 0
  const avgDarkResilience = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.darkResilience, 0) / blooms.length)
    : 0

  const overallFragrance = Math.round(
    (avgNocturnalBloom + avgMoonlitClarity + avgNightFragrance) / 3,
  )

  const estate = {
    avgBloom: avgNocturnalBloom,
    avgClarity: avgMoonlitClarity,
    avgResilience: avgDarkResilience,
    isMoonlit: overallFragrance >= 80,
    overallFragrance,
  }

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const bestBlooming = blooms.length > 0
    ? blooms.reduce((best, b) => b.nocturnalBloom > best.nocturnalBloom ? b : best).file
    : ''
  const deepestShadow = blooms.length > 0
    ? blooms.reduce((best, b) => b.shadowDepth > best.shadowDepth ? b : best).file
    : ''
  const clearest = blooms.length > 0
    ? blooms.reduce((best, b) => b.moonlitClarity > best.moonlitClarity ? b : best).file
    : ''
  const mostFragrant = blooms.length > 0
    ? blooms.reduce((best, b) => b.nightFragrance > best.nightFragrance ? b : best).file
    : ''

  const stats = {
    totalFiles: blooms.length,
    totalBeds: beds.length,
    avgNocturnalBloom,
    avgShadowDepth,
    avgMoonlitClarity,
    avgNightFragrance,
    avgDarkResilience,
    midnightMasterpieceCount: blooms.filter(b => b.condition === 'midnight-masterpiece').length,
    moonlitGardenCount: blooms.filter(b => b.condition === 'moonlit-garden').length,
    twilightBedCount: blooms.filter(b => b.condition === 'twilight-bed').length,
    dimCornerCount: blooms.filter(b => b.condition === 'dim-corner').length,
    darkPatchCount: blooms.filter(b => b.condition === 'dark-patch').length,
    barrenSoilCount: blooms.filter(b => b.condition === 'barren-soil').length,
    hasHighBloomCount: blooms.filter(b => b.flowering.hasHighBloom).length,
    hasHighDepthCount: blooms.filter(b => b.shadowing.hasHighDepth).length,
    hasHighClarityCount: blooms.filter(b => b.illuminating.hasHighClarity).length,
    hasHighFragranceCount: blooms.filter(b => b.scenting.hasHighFragrance).length,
    hasHighResilienceCount: blooms.filter(b => b.enduring.hasHighResilience).length,
    overallFragrance,
    gardenerGrade: classifyGardenerGrade(overallFragrance),
    bestBloom,
    bestBlooming,
    deepestShadow,
    clearest,
    mostFragrant,
  }

  const recommendations = generateRecommendations(blooms, beds, estate, { ...stats, recommendations: [] } as MidnightGardenResult['stats'])

  return {
    blooms,
    beds,
    estate,
    stats,
    recommendations,
  }
}
