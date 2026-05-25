// ─── Interfaces ────────────────────────────────────────────

import { dirname } from 'node:path'
import fg from 'fast-glob'

export type Glass = 'flawless-crystal' | 'clear-obsidian' | 'proper-glass' | 'cloudy-stone' | 'murky-slag' | 'no-clarity'
export type Darkness = 'night-adapted' | 'shadow-walker' | 'proper-darkness' | 'light-dependent' | 'blind-in-dark' | 'no-resilience'
export type Mirror = 'true-reflection' | 'honest-glass' | 'proper-mirror' | 'distorted-image' | 'broken-mirror' | 'no-reflection'
export type Edge = 'surgical-steel' | 'razor-edge' | 'proper-blade' | 'dull-knife' | 'blunt-instrument' | 'no-edge'
export type Shadow = 'ancient-darkness' | 'deep-shadow' | 'proper-shade' | 'surface-gloom' | 'no-shadow' | 'no-wisdom'
export type ObsidianCondition = 'obsidian-masterpiece' | 'dark-sanctuary' | 'proper-temple' | 'crumbling-stone' | 'shattered-glass' | 'void'
export type ChamberType = 'grand-temple' | 'obsidian-hall' | 'proper-chamber' | 'small-niche' | 'dark-corner' | 'no-chamber'
export type ChamberCondition = 'volcanic-cathedral' | 'dark-sanctuary' | 'proper-temple' | 'crumbling-ruin' | 'shattered-vestibule' | 'void'
export type TempleGrade = 'obsidian-master' | 'dark-artisan' | 'stone-worker' | 'apprentice' | 'novice' | 'clueless'

export interface ForgingMeasure {
  clarity: number
  glass: Glass
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasDirect: boolean
  hasNoCircuits: boolean
  hasLuminous: boolean
  hasNoOpaque: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EnduringMeasure {
  resilience: number
  darkness: Darkness
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
  hasFearless: boolean
  hasNoPanicked: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface ReflectingMeasure {
  depth: number
  mirror: Mirror
  hasHighDepth: boolean
  hasSelfAware: boolean
  hasNoBlind: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasHonest: boolean
  hasNoDeceptive: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasTransparent: boolean
  hasNoOpaque: boolean
  blindCount: number
  contradictoryCount: number
}

export interface CuttingMeasure {
  precision: number
  edge: Edge
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasTypeSafe: boolean
  hasNoCasting: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  wrongCount: number
  buggyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  shadow: Shadow
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hasNoTactical: boolean
  hackedCount: number
  adHocCount: number
}

export interface ObsidianShard {
  file: string
  volcanicClarity: number
  darkResilience: number
  mirrorDepth: number
  bladePrecision: number
  shadowWisdom: number
  forging: ForgingMeasure
  enduring: EnduringMeasure
  reflecting: ReflectingMeasure
  cutting: CuttingMeasure
  knowing: KnowingMeasure
  condition: ObsidianCondition
  qualityScore: number
}

export interface ObsidianChamber {
  directory: string
  shards: ObsidianShard[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  obsidianMasterpieceCount: number
  voidCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

export interface ObsidianTemple {
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  isObsidian: boolean
  overallSharpness: number
}

export interface ObsidianStats {
  totalFiles: number
  totalChambers: number
  avgVolcanicClarity: number
  avgDarkResilience: number
  avgMirrorDepth: number
  avgBladePrecision: number
  avgShadowWisdom: number
  obsidianMasterpieceCount: number
  darkSanctuaryCount: number
  properTempleCount: number
  crumblingStoneCount: number
  shatteredGlassCount: number
  voidCount: number
  hasHighClarityCount: number
  hasHighResilienceCount: number
  hasHighDepthCount: number
  hasHighPrecisionCount: number
  hasHighWisdomCount: number
  overallSharpness: number
  templeGrade: TempleGrade
  bestShard: string
  clearest: string
  mostResilient: string
  deepest: string
  sharpest: string
  wisest: string
}

export interface ObsidianTempleResult {
  shards: ObsidianShard[]
  chambers: ObsidianChamber[]
  temple: ObsidianTemple
  stats: ObsidianStats
  recommendations: string[]
}

// ─── Utility ─────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Classification Helpers ──────────────────────────────

function classifyGlass(clarity: number): Glass {
  if (clarity >= 90) return 'flawless-crystal'
  if (clarity >= 75) return 'clear-obsidian'
  if (clarity >= 60) return 'proper-glass'
  if (clarity >= 40) return 'cloudy-stone'
  if (clarity >= 20) return 'murky-slag'
  return 'no-clarity'
}

function classifyDarkness(resilience: number): Darkness {
  if (resilience >= 90) return 'night-adapted'
  if (resilience >= 75) return 'shadow-walker'
  if (resilience >= 60) return 'proper-darkness'
  if (resilience >= 40) return 'light-dependent'
  if (resilience >= 20) return 'blind-in-dark'
  return 'no-resilience'
}

function classifyMirror(depth: number): Mirror {
  if (depth >= 90) return 'true-reflection'
  if (depth >= 75) return 'honest-glass'
  if (depth >= 60) return 'proper-mirror'
  if (depth >= 40) return 'distorted-image'
  if (depth >= 20) return 'broken-mirror'
  return 'no-reflection'
}

function classifyEdge(precision: number): Edge {
  if (precision >= 90) return 'surgical-steel'
  if (precision >= 75) return 'razor-edge'
  if (precision >= 60) return 'proper-blade'
  if (precision >= 40) return 'dull-knife'
  if (precision >= 20) return 'blunt-instrument'
  return 'no-edge'
}

function classifyShadow(wisdom: number): Shadow {
  if (wisdom >= 90) return 'ancient-darkness'
  if (wisdom >= 75) return 'deep-shadow'
  if (wisdom >= 60) return 'proper-shade'
  if (wisdom >= 40) return 'surface-gloom'
  if (wisdom >= 20) return 'no-shadow'
  return 'no-wisdom'
}

export function classifyObsidianCondition(score: number): ObsidianCondition {
  if (score >= 90) return 'obsidian-masterpiece'
  if (score >= 75) return 'dark-sanctuary'
  if (score >= 60) return 'proper-temple'
  if (score >= 40) return 'crumbling-stone'
  if (score >= 20) return 'shattered-glass'
  return 'void'
}

export function classifyChamberType(shards: ObsidianShard[]): ChamberType {
  if (shards.length === 0) return 'no-chamber'
  const avg = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  if (avg >= 85) return 'grand-temple'
  if (avg >= 70) return 'obsidian-hall'
  if (avg >= 55) return 'proper-chamber'
  if (avg >= 35) return 'small-niche'
  if (avg >= 15) return 'dark-corner'
  return 'no-chamber'
}

export function classifyChamberCondition(avg: number): ChamberCondition {
  if (avg >= 85) return 'volcanic-cathedral'
  if (avg >= 70) return 'dark-sanctuary'
  if (avg >= 55) return 'proper-temple'
  if (avg >= 35) return 'crumbling-ruin'
  if (avg >= 15) return 'shattered-vestibule'
  return 'void'
}

export function classifyTempleGrade(sharpness: number): TempleGrade {
  if (sharpness >= 85) return 'obsidian-master'
  if (sharpness >= 70) return 'dark-artisan'
  if (sharpness >= 55) return 'stone-worker'
  if (sharpness >= 40) return 'apprentice'
  if (sharpness >= 20) return 'novice'
  return 'clueless'
}

// ─── measureForging ──────────────────────────────────────

/**
 * @example measureForging('export function parse(input: Readonly<string>): Void {}')
 */
export function measureForging(content: string): ForgingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPipeline = hasPattern(content, /\.(map|filter|reduce|flatMap)\(/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasInterface) score += 5
  if (hasReturnType) score += 6
  if (hasGenerics) score += 5
  if (hasNamed) score += 5
  if (hasConst) score += 4
  if (hasArrow) score += 3
  if (hasOptional) score += 3
  if (hasReadonly) score += 3
  if (hasPipeline) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4

  const crypticCount = hasVar + (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    clarity,
    glass: classifyGlass(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasDoc && hasConst,
    hasSelfDocumenting: hasNamed && hasReturnType,
    hasNoCryptic: crypticCount === 0,
    hasClear: hasReturnType || hasDoc,
    hasNoObfuscated: obfuscatedCount === 0,
    hasTransparent: hasExport && hasReturnType,
    hasNoHidden: !hasAny,
    hasUnderstandable: hasDoc || hasNamed,
    hasNoArcane: !hasEval && !hasAny,
    hasVisible: hasExport,
    hasNoInvisible: hasVar === 0,
    hasDirect: hasPipeline && hasArrow,
    hasNoCircuits: !hasEval,
    hasLuminous: hasDoc && hasExport && hasReturnType,
    hasNoOpaque: !hasAny,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureEnduring ─────────────────────────────────────

/**
 * @example measureEnduring('try { const data = parse(raw) } catch (Error) { throw new Error("fail") }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 6
  if (hasExport) score += 5
  if (hasTryCatch) score += 8
  if (hasThrow) score += 5
  if (hasReturnType) score += 5
  if (hasGenerics) score += 4
  if (hasPrivate) score += 4
  if (hasConst) score += 5
  if (hasInterface) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 10
  if (hasAny) score -= 5
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasDebugger) score -= 5

  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)
  const untestedCount = hasVar + (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    resilience,
    darkness: classifyDarkness(resilience),
    hasHighResilience: resilience >= 80,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: bareCrashCount === 0,
    hasTested: hasTryCatch && hasConst,
    hasNoUntested: untestedCount === 0,
    hasDefensive: hasTryCatch && hasReturnType,
    hasNoNaive: !hasAny,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasHackyCast === 0,
    hasGraceful: hasTryCatch && hasThrow,
    hasNoHarshFail: !hasEval,
    hasRecoverable: hasTryCatch,
    hasNoFatal: !hasDebugger,
    hasRobust: hasTryCatch && hasDoc && !hasAny,
    hasNoFragile: !hasAny && !hasEval,
    hasFearless: hasTryCatch && !hasAny && !hasEval,
    hasNoPanicked: !hasDebugger,
    bareCrashCount,
    untestedCount,
  }
}

// ─── measureReflecting ───────────────────────────────────

/**
 * @example measureReflecting('/** Self-reflective parser *\/ export function parse(input: Readonly<string>): Void {}')
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)

  if (hasDoc) score += 8
  if (hasExport) score += 6
  if (hasInterface) score += 6
  if (hasExtends) score += 5
  if (hasReturnType) score += 5
  if (hasGenerics) score += 5
  if (hasConst) score += 4
  if (hasAbstract) score += 5

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 5
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasTsIgnore) score -= 5

  const blindCount = (hasEval ? 1 : 0) + (hasTsIgnore ? 1 : 0)
  const contradictoryCount = hasVar + (hasAny ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)

  const depth = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    depth,
    mirror: classifyMirror(depth),
    hasHighDepth: depth >= 80,
    hasSelfAware: hasDoc && hasReturnType,
    hasNoBlind: blindCount === 0,
    hasDocumented: hasDoc,
    hasNoUndocumented: hasDoc,
    hasHonest: !hasTsIgnore,
    hasNoDeceptive: !hasTsIgnore,
    hasConsistent: hasConst && !hasAny,
    hasNoContradictory: contradictoryCount === 0,
    hasPrincipled: hasInterface || hasAbstract,
    hasNoAdHoc: hasVar === 0,
    hasClean: hasConst && !hasAny,
    hasNoDirty: !hasEval,
    hasPure: !hasAny && hasHackyCast === 0,
    hasNoContaminated: !hasAny,
    hasTransparent: hasExport && hasReturnType,
    hasNoOpaque: !hasAny,
    blindCount,
    contradictoryCount,
  }
}

// ─── measureCutting ──────────────────────────────────────

/**
 * @example measureCutting('export function compute(val: Readonly<Number>): Number { if (val === 0) return 0; return val * 2 }')
 */
export function measureCutting(content: string): CuttingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasStrictChecks = hasPattern(content, /===|!==/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 5
  if (hasExport) score += 5
  if (hasReturnType) score += 7
  if (hasGenerics) score += 5
  if (hasStrictChecks) score += 6
  if (hasConst) score += 5
  if (hasTryCatch) score += 5
  if (hasThrow) score += 3
  if (hasReadonly) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 10
  if (hasAny) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasDebugger) score -= 5

  const wrongCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)
  const buggyCount = hasVar + (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.0)))

  return {
    precision,
    edge: classifyEdge(precision),
    hasHighPrecision: precision >= 80,
    hasAccurate: hasReturnType && !hasAny,
    hasNoWrong: wrongCount === 0,
    hasExact: hasStrictChecks && hasReturnType,
    hasNoApproximate: !hasAny,
    hasCorrect: hasConst && hasReturnType,
    hasNoBuggy: buggyCount === 0,
    hasTypeSafe: hasReturnType && hasHackyCast === 0,
    hasNoCasting: hasHackyCast === 0,
    hasValidated: hasTryCatch && hasThrow,
    hasNoAssumed: !hasAny,
    hasConsistent: hasConst && !hasAny,
    hasNoErratic: !hasEval && !hasDebugger,
    hasDeterministic: !hasAny && !hasEval,
    hasNoRandom: !hasDebugger,
    hasPrecise: hasStrictChecks && hasReturnType && !hasAny,
    hasNoVague: !hasAny,
    wrongCount,
    buggyCount,
  }
}

// ─── measureKnowing ──────────────────────────────────────

/**
 * @example measureKnowing('export abstract class Repository<T> extends Base implements IRepo { abstract find(id: String): Promise<T> }')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 7
  if (hasExport) score += 5
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 6
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 5
  if (hasGenerics) score += 5
  if (hasClass) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const hackedCount = hasHackyCast
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  return {
    wisdom,
    shadow: classifyShadow(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasWellArchitected: hasInterface && hasExtends && !hasAny,
    hasNoHacked: hasHackyCast === 0,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasDeep: hasGenerics && hasReturnType,
    hasNoShallow: !hasAny,
    hasInsightful: hasDoc && hasReturnType && hasGenerics,
    hasNoObvious: !hasAny,
    hasStrategic: hasAbstract && hasExtends,
    hasNoTactical: !hasEval,
    hackedCount,
    adHocCount,
  }
}

// ─── analyzeObsidianShard ────────────────────────────────

/**
 * @example analyzeObsidianShard(richContent, 'volcano.ts')
 */
export function analyzeObsidianShard(content: string, filePath: string): ObsidianShard {
  const forging = measureForging(content)
  const enduring = measureEnduring(content)
  const reflecting = measureReflecting(content)
  const cutting = measureCutting(content)
  const knowing = measureKnowing(content)

  const volcanicClarity = forging.clarity
  const darkResilience = enduring.resilience
  const mirrorDepth = reflecting.depth
  const bladePrecision = cutting.precision
  const shadowWisdom = knowing.wisdom

  const qualityScore = Math.round(
    volcanicClarity * 0.2 +
    darkResilience * 0.2 +
    mirrorDepth * 0.2 +
    bladePrecision * 0.2 +
    shadowWisdom * 0.2,
  )

  return {
    file: filePath,
    volcanicClarity,
    darkResilience,
    mirrorDepth,
    bladePrecision,
    shadowWisdom,
    forging,
    enduring,
    reflecting,
    cutting,
    knowing,
    condition: classifyObsidianCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeObsidianChamber ──────────────────────────────

/**
 * @example analyzeObsidianChamber(shards, 'src/temple')
 */
export function analyzeObsidianChamber(shards: ObsidianShard[], dirPath: string): ObsidianChamber {
  if (shards.length === 0) {
    return {
      directory: dirPath,
      shards: [],
      avgClarity: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      obsidianMasterpieceCount: 0,
      voidCount: 0,
      chamberType: 'no-chamber',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(shards.reduce((s, sh) => s + sh.volcanicClarity, 0) / shards.length)
  const avgPrecision = Math.round(shards.reduce((s, sh) => s + sh.bladePrecision, 0) / shards.length)
  const avgWisdom = Math.round(shards.reduce((s, sh) => s + sh.shadowWisdom, 0) / shards.length)

  const obsidianMasterpieceCount = shards.filter(sh => sh.condition === 'obsidian-masterpiece').length
  const voidCount = shards.filter(sh => sh.condition === 'void').length

  const chamberType = classifyChamberType(shards)
  const overallAvg = Math.round((avgClarity + avgPrecision + avgWisdom) / 3)

  return {
    directory: dirPath,
    shards,
    avgClarity,
    avgPrecision,
    avgWisdom,
    obsidianMasterpieceCount,
    voidCount,
    chamberType,
    condition: classifyChamberCondition(overallAvg),
  }
}

// ─── generateRecommendations ─────────────────────────────

/**
 * @example generateRecommendations(shards, chambers, temple, stats)
 */
export function generateRecommendations(
  shards: ObsidianShard[],
  chambers: ObsidianChamber[],
  temple: ObsidianTemple,
  stats: ObsidianStats,
): string[] {
  const recs: string[] = []

  if (temple.overallSharpness >= 90 && stats.voidCount === 0) {
    recs.push('Obsidian perfection — the temple shines with volcanic clarity and surgical precision')
    return recs
  }

  if (stats.avgVolcanicClarity < 50) {
    recs.push('Forge clearer volcanic glass — improve readability with documentation, named exports, and transparent types')
  }
  if (stats.avgDarkResilience < 50) {
    recs.push('Strengthen dark resilience — add error handling, defensive patterns, and type safety')
  }
  if (stats.avgMirrorDepth < 50) {
    recs.push('Deepen mirror reflection — add self-documenting patterns, interfaces, and honest abstractions')
  }
  if (stats.avgBladePrecision < 50) {
    recs.push('Sharpen blade precision — use strict equality, proper types, and validated logic')
  }
  if (stats.avgShadowWisdom < 50) {
    recs.push('Cultivate shadow wisdom — embrace principled architecture, proven patterns, and deep design')
  }

  const shattered = shards.filter(sh => sh.condition === 'void' || sh.condition === 'shattered-glass')
  if (shattered.length > 0 && shattered.length <= 3) {
    for (const sh of shattered) {
      recs.push(`Reforge ${sh.file} from ${sh.condition} into obsidian clarity`)
    }
  } else if (shattered.length > 3) {
    recs.push(`${shattered.length} shattered shards need reforging — prioritize the most fractured files`)
  }

  const darkChambers = chambers.filter(c => c.condition === 'crumbling-ruin' || c.condition === 'shattered-vestibule' || c.condition === 'void')
  if (darkChambers.length > 0) {
    recs.push(`${darkChambers.length} chamber(s) need restoration: ${darkChambers.map(c => c.directory).join(', ')}`)
  }

  if (temple.overallSharpness >= 70 && stats.voidCount === 0) {
    recs.push('The obsidian temple stands strong — maintain volcanic discipline and sharpen every edge')
  } else if (temple.overallSharpness >= 50 && stats.voidCount === 0) {
    recs.push('Foundations solid — continue forging toward obsidian mastery')
  }

  if (recs.length === 0) {
    recs.push('The obsidian temple endures — keep building with dark resilience')
  }

  return recs
}

// ─── gatherFiles ─────────────────────────────────────────

/**
 * @example gatherFiles('/path', ['.ts'], ['ignore-patterns'])
 */
export async function gatherFiles(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*${ext}`)
  const entries = await fg(patterns, {
    cwd: rootDir,
    ignore: ignorePatterns,
    absolute: false,
    onlyFiles: true,
  })
  return entries.sort()
}

// ─── buildObsidianTempleResult ────────────────────────────

/**
 * @example buildObsidianTempleResult(['a.ts'], [content])
 */
export async function buildObsidianTempleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianTempleResult> {
  const shards = files.map((file, i) =>
    analyzeObsidianShard(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ObsidianShard[]>()
  for (const sh of shards) {
    const dir = dirname(sh.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(sh)
    } else {
      dirMap.set(dir, [sh])
    }
  }

  const chambers = Array.from(dirMap.entries()).map(([dir, shs]) =>
    analyzeObsidianChamber(shs, dir),
  )

  const totalFiles = shards.length
  const avgVolcanicClarity = totalFiles > 0 ? Math.round(shards.reduce((s, sh) => s + sh.volcanicClarity, 0) / totalFiles) : 0
  const avgDarkResilience = totalFiles > 0 ? Math.round(shards.reduce((s, sh) => s + sh.darkResilience, 0) / totalFiles) : 0
  const avgMirrorDepth = totalFiles > 0 ? Math.round(shards.reduce((s, sh) => s + sh.mirrorDepth, 0) / totalFiles) : 0
  const avgBladePrecision = totalFiles > 0 ? Math.round(shards.reduce((s, sh) => s + sh.bladePrecision, 0) / totalFiles) : 0
  const avgShadowWisdom = totalFiles > 0 ? Math.round(shards.reduce((s, sh) => s + sh.shadowWisdom, 0) / totalFiles) : 0

  const overallSharpness = Math.round(
    (avgVolcanicClarity + avgDarkResilience + avgMirrorDepth + avgBladePrecision + avgShadowWisdom) / 5,
  )

  const temple: ObsidianTemple = {
    avgClarity: avgVolcanicClarity,
    avgPrecision: avgBladePrecision,
    avgWisdom: avgShadowWisdom,
    isObsidian: overallSharpness >= 80,
    overallSharpness,
  }

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file
    : 'none'
  const clearest = shards.length > 0
    ? shards.reduce((best, sh) => sh.volcanicClarity > best.volcanicClarity ? sh : best).file
    : 'none'
  const mostResilient = shards.length > 0
    ? shards.reduce((best, sh) => sh.darkResilience > best.darkResilience ? sh : best).file
    : 'none'
  const deepest = shards.length > 0
    ? shards.reduce((best, sh) => sh.mirrorDepth > best.mirrorDepth ? sh : best).file
    : 'none'
  const sharpest = shards.length > 0
    ? shards.reduce((best, sh) => sh.bladePrecision > best.bladePrecision ? sh : best).file
    : 'none'
  const wisest = shards.length > 0
    ? shards.reduce((best, sh) => sh.shadowWisdom > best.shadowWisdom ? sh : best).file
    : 'none'

  const stats: ObsidianStats = {
    totalFiles,
    totalChambers: chambers.length,
    avgVolcanicClarity,
    avgDarkResilience,
    avgMirrorDepth,
    avgBladePrecision,
    avgShadowWisdom,
    obsidianMasterpieceCount: shards.filter(sh => sh.condition === 'obsidian-masterpiece').length,
    darkSanctuaryCount: shards.filter(sh => sh.condition === 'dark-sanctuary').length,
    properTempleCount: shards.filter(sh => sh.condition === 'proper-temple').length,
    crumblingStoneCount: shards.filter(sh => sh.condition === 'crumbling-stone').length,
    shatteredGlassCount: shards.filter(sh => sh.condition === 'shattered-glass').length,
    voidCount: shards.filter(sh => sh.condition === 'void').length,
    hasHighClarityCount: shards.filter(sh => sh.forging.hasHighClarity).length,
    hasHighResilienceCount: shards.filter(sh => sh.enduring.hasHighResilience).length,
    hasHighDepthCount: shards.filter(sh => sh.reflecting.hasHighDepth).length,
    hasHighPrecisionCount: shards.filter(sh => sh.cutting.hasHighPrecision).length,
    hasHighWisdomCount: shards.filter(sh => sh.knowing.hasHighWisdom).length,
    overallSharpness,
    templeGrade: classifyTempleGrade(overallSharpness),
    bestShard,
    clearest,
    mostResilient,
    deepest,
    sharpest,
    wisest,
  }

  const recommendations = generateRecommendations(shards, chambers, temple, stats)

  return { shards, chambers, temple, stats, recommendations }
}
