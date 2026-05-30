// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Alloy = 'masterwork-bronze' | 'proper-alloy' | 'decent-mix' | 'weak-blend' | 'impure-metal' | 'no-alloy'
export type Patina = 'noble-patina' | 'aged-bronze' | 'proper-patina' | 'tarnished-metal' | 'corroded-alloy' | 'no-patina'
export type Dawn = 'copper-dawn' | 'warm-morning' | 'proper-daybreak' | 'grey-dawn' | 'dark-morning' | 'no-dawn'
export type ForgeCraft = 'master-smith' | 'skilled-forger' | 'proper-craft' | 'rough-hewn' | 'crude-cast' | 'no-craft'
export type Flow = 'ancient-river' | 'strong-current' | 'proper-stream' | 'weak-creek' | 'dry-channel' | 'no-flow'
export type RayCondition = 'bronze-masterpiece' | 'aged-treasure' | 'proper-alloy' | 'tarnished-metal' | 'rusty-iron' | 'scrap'
export type ForgeType = 'ancient-foundry' | 'proper-forge' | 'workshop' | 'small-anvil' | 'campfire' | 'no-forge'
export type ForgeCondition = 'golden-age' | 'prosperous-era' | 'proper-workshop' | 'declining-era' | 'abandoned-mine' | 'void'
export type SmithGrade = 'master-smith' | 'expert-forger' | 'skilled-metallurgist' | 'apprentice' | 'novice' | 'scrap-collector'

export interface CombiningMeasure {
  strength: number
  alloy: Alloy
  hasHighStrength: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasComposable: boolean
  hasNoRigid: boolean
  hasFlexible: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  untestedCount: number
  monolithicCount: number
}

export interface AgingMeasure {
  wisdom: number
  patina: Patina
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasBattleTested: boolean
  hasNoUnproven: boolean
  hasTimeless: boolean
  adHocCount: number
  experimentalCount: number
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
  hasWarm: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface CraftingMeasure {
  precision: number
  forge: ForgeCraft
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasImmaculate: boolean
  approximateCount: number
  sloppyCount: number
}

export interface ConductingMeasure {
  current: number
  flow: Flow
  hasHighCurrent: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasDurable: boolean
  bottleneckCount: number
  tangledCount: number
}

export interface BronzeRay {
  file: string
  alloyStrength: number
  patinaWisdom: number
  dawnClarity: number
  forgePrecision: number
  durableCurrent: number
  combining: CombiningMeasure
  aging: AgingMeasure
  illuminating: IlluminatingMeasure
  crafting: CraftingMeasure
  conducting: ConductingMeasure
  condition: RayCondition
  qualityScore: number
}

export interface BronzeForge {
  directory: string
  rays: BronzeRay[]
  avgStrength: number
  avgClarity: number
  avgCurrent: number
  bronzeMasterpieceCount: number
  scrapCount: number
  forgeType: ForgeType
  condition: ForgeCondition
}

export interface BronzeHorizonResult {
  rays: BronzeRay[]
  forges: BronzeForge[]
  age: {
    avgStrength: number
    avgClarity: number
    avgCurrent: number
    isBronze: boolean
    overallLuster: number
  }
  stats: {
    totalFiles: number
    totalForges: number
    avgAlloyStrength: number
    avgPatinaWisdom: number
    avgDawnClarity: number
    avgForgePrecision: number
    avgDurableCurrent: number
    bronzeMasterpieceCount: number
    agedTreasureCount: number
    properAlloyCount: number
    tarnishedMetalCount: number
    rustyIronCount: number
    scrapCount: number
    hasHighStrengthCount: number
    hasHighWisdomCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighCurrentCount: number
    overallLuster: number
    smithGrade: SmithGrade
    bestRay: string
    strongest: string
    wisest: string
    clearest: string
    mostConductive: string
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

// ─── measureCombining ──────────────────────────────────────────────

/**
 * @example measureCombining('export function greet(name: string): string { return name }')
 */
export function measureCombining(content: string): CombiningMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasGodFile = content.split('\n').length > 300

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasTryCatch) score += 6
  if (hasThrow) score += 4
  if (hasReturnType) score += 6
  if (hasGenerics) score += 6
  if (hasOptional) score += 4
  if (hasReadonly) score += 4
  if (hasAsync) score += 4
  if (hasImport) score += 4
  if (hasPipeline) score += 4
  if (hasNullish) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)
  if (hasAny) score -= 4
  if (hasGodFile) score -= 6

  const strength = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const monolithicCount = hasGodFile ? 1 : 0

  return {
    strength,
    alloy: classifyAlloy(strength),
    hasHighStrength: strength >= 80,
    hasRobust: hasExport && hasNamed,
    hasTested: hasTryCatch || hasThrow,
    hasNoUntested: !hasVar,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasVar && !hasAny,
    hasModular: hasImport,
    hasNoMonolithic: !hasGodFile,
    hasComposable: hasExport && hasOptional,
    hasNoRigid: !hasVar,
    hasFlexible: hasOptional || hasNullish,
    hasNoBrittle: !hasVar && !hasAny,
    hasResilient: hasTryCatch || hasNullish,
    untestedCount,
    monolithicCount,
  }
}

// ─── measureAging ──────────────────────────────────────────────────

/**
 * @example measureAging('export abstract class Base { abstract doWork(): void }')
 */
export function measureAging(content: string): AgingMeasure {
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
  const experimentalCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    wisdom,
    patina: classifyPatina(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellStructured: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasVar,
    hasProven: hasExtends || hasImplements,
    hasNoExperimental: !hasTodo,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasEstablished: wisdom >= 70,
    hasNoNovel: !hasEval,
    hasBattleTested: (hasExtends || hasImplements) && hasDoc,
    hasNoUnproven: !hasEval && !hasDebugger,
    hasTimeless: hasDoc && hasInterface && (hasExtends || hasAbstract),
    adHocCount,
    experimentalCount,
  }
}

// ─── measureIlluminating ───────────────────────────────────────────

/**
 * @example measureIlluminating('export function helper(val: string): string { return val }')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasArrow = hasPattern(content, /=>/)
  const hasAsync = hasPattern(content, /\basync\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 8
  if (hasNamed) score += 6
  if (hasDoc) score += 8
  if (hasReturnType) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasOptional) score += 6
  if (hasGenerics) score += 4
  if (hasArrow) score += 4
  if (hasAsync) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const obfuscatedCount = hasDebugger ? 1 : 0

  return {
    clarity,
    dawn: classifyDawn(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport && hasReturnType,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && hasVar === 0,
    hasClear: hasDoc && hasExport,
    hasNoObfuscated: !hasDebugger,
    hasTransparent: hasNamed && !hasEval,
    hasNoHidden: !hasEval && !hasDebugger,
    hasApproachable: hasExport && hasNamed,
    hasNoIntimidating: !hasVar,
    hasInviting: hasDoc && hasExport,
    hasNoHostile: !hasEval && !hasDebugger,
    hasWarm: hasDoc && hasConst,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureCrafting ───────────────────────────────────────────────

/**
 * @example measureCrafting('export interface Widget<T> { readonly id: string }')
 */
export function measureCrafting(content: string): CraftingMeasure {
  let score = 0

  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasInterface) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 6
  if (hasOptional) score += 6
  if (hasEnum) score += 4
  if (hasType) score += 4
  if (hasExport) score += 4
  if (hasNamed) score += 4
  if (hasDoc) score += 6
  if (hasPrivate) score += 4
  if (hasPipeline) score += 4

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
    forge: classifyForgeCraft(precision),
    hasHighPrecision: precision >= 80,
    hasExact: hasReturnType && hasTypeAnnotation,
    hasAccurate: hasInterface && hasGenerics,
    hasNoApproximate: !hasVar,
    hasPrecise: hasReadonly && hasOptional,
    hasNoVague: !hasVar && !hasEval,
    hasSharp: hasReturnType && !hasAny,
    hasNoSloppy: !hasDebugger && !hasEval,
    hasDefined: hasInterface || hasType,
    hasNoFuzzy: !hasAny,
    hasRefined: hasReadonly && hasNamed,
    hasNoCrude: !hasDebugger && !hasEval,
    hasImmaculate: hasNamed && hasDoc && !hasDebugger,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureConducting ─────────────────────────────────────────────

/**
 * @example measureConducting('export async function run(): Promise<void> { await work() }')
 */
export function measureConducting(content: string): ConductingMeasure {
  let score = 0

  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasGodFile = content.split('\n').length > 300
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasPipeline) score += 8
  if (hasArrow) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4
  if (hasGenerics) score += 4
  if (hasReturnType) score += 4
  if (hasTryCatch) score += 4
  if (hasImport) score += 4
  if (hasNamed) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasGodFile) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 6)

  const current = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bottleneckCount = (hasGodFile ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const tangledCount = (hasDebugger ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)

  return {
    current,
    flow: classifyFlow(current),
    hasHighCurrent: current >= 80,
    hasEfficientFlow: hasPipeline || hasArrow,
    hasNoBottlenecks: !hasGodFile && !hasVar,
    hasStreamlined: hasArrow && hasConst,
    hasNoCircuits: !hasDebugger,
    hasDirectPaths: hasExport && !hasAny,
    hasNoIndirection: !hasDebugger && hasHackyCast === 0,
    hasCleanPipelines: hasPipeline && !hasDebugger,
    hasNoTangled: !hasDebugger && hasHackyCast === 0,
    hasMaintainable: hasNamed && !hasVar,
    hasNoFragile: !hasVar && !hasAny,
    hasExtensible: hasOptional || hasGenerics,
    hasNoRigid: !hasVar,
    hasDurable: hasTryCatch || hasAsync,
    bottleneckCount,
    tangledCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyAlloy(strength: number): Alloy {
  if (strength >= 90) return 'masterwork-bronze'
  if (strength >= 75) return 'proper-alloy'
  if (strength >= 60) return 'decent-mix'
  if (strength >= 40) return 'weak-blend'
  if (strength >= 20) return 'impure-metal'
  return 'no-alloy'
}

function classifyPatina(wisdom: number): Patina {
  if (wisdom >= 90) return 'noble-patina'
  if (wisdom >= 75) return 'aged-bronze'
  if (wisdom >= 60) return 'proper-patina'
  if (wisdom >= 40) return 'tarnished-metal'
  if (wisdom >= 20) return 'corroded-alloy'
  return 'no-patina'
}

function classifyDawn(clarity: number): Dawn {
  if (clarity >= 90) return 'copper-dawn'
  if (clarity >= 75) return 'warm-morning'
  if (clarity >= 60) return 'proper-daybreak'
  if (clarity >= 40) return 'grey-dawn'
  if (clarity >= 20) return 'dark-morning'
  return 'no-dawn'
}

function classifyForgeCraft(precision: number): ForgeCraft {
  if (precision >= 90) return 'master-smith'
  if (precision >= 75) return 'skilled-forger'
  if (precision >= 60) return 'proper-craft'
  if (precision >= 40) return 'rough-hewn'
  if (precision >= 20) return 'crude-cast'
  return 'no-craft'
}

function classifyFlow(current: number): Flow {
  if (current >= 90) return 'ancient-river'
  if (current >= 75) return 'strong-current'
  if (current >= 60) return 'proper-stream'
  if (current >= 40) return 'weak-creek'
  if (current >= 20) return 'dry-channel'
  return 'no-flow'
}

export function classifyRayCondition(qualityScore: number): RayCondition {
  if (qualityScore >= 90) return 'bronze-masterpiece'
  if (qualityScore >= 75) return 'aged-treasure'
  if (qualityScore >= 60) return 'proper-alloy'
  if (qualityScore >= 40) return 'tarnished-metal'
  if (qualityScore >= 20) return 'rusty-iron'
  return 'scrap'
}

export function classifyForgeType(rays: BronzeRay[]): ForgeType {
  if (rays.length === 0) return 'no-forge'
  const avgQs = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  const masterpieceRatio = rays.filter(r => r.condition === 'bronze-masterpiece').length / rays.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'ancient-foundry'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'proper-forge'
  if (avgQs >= 55) return 'workshop'
  if (avgQs >= 35) return 'small-anvil'
  if (avgQs >= 15) return 'campfire'
  return 'no-forge'
}

export function classifyForgeCondition(avgStrength: number): ForgeCondition {
  if (avgStrength >= 85) return 'golden-age'
  if (avgStrength >= 70) return 'prosperous-era'
  if (avgStrength >= 55) return 'proper-workshop'
  if (avgStrength >= 35) return 'declining-era'
  if (avgStrength >= 15) return 'abandoned-mine'
  return 'void'
}

export function classifySmithGrade(avgLuster: number): SmithGrade {
  if (avgLuster >= 85) return 'master-smith'
  if (avgLuster >= 70) return 'expert-forger'
  if (avgLuster >= 55) return 'skilled-metallurgist'
  if (avgLuster >= 40) return 'apprentice'
  if (avgLuster >= 20) return 'novice'
  return 'scrap-collector'
}

// ─── analyzeBronzeRay ──────────────────────────────────────────────

/**
 * @example analyzeBronzeRay(content, 'src/foo.ts')
 */
export function analyzeBronzeRay(content: string, filePath: string): BronzeRay {
  const combining = measureCombining(content)
  const aging = measureAging(content)
  const illuminating = measureIlluminating(content)
  const crafting = measureCrafting(content)
  const conducting = measureConducting(content)

  const alloyStrength = combining.strength
  const patinaWisdom = aging.wisdom
  const dawnClarity = illuminating.clarity
  const forgePrecision = crafting.precision
  const durableCurrent = conducting.current

  const qualityScore = Math.round(
    alloyStrength * 0.2 +
    patinaWisdom * 0.2 +
    dawnClarity * 0.2 +
    forgePrecision * 0.2 +
    durableCurrent * 0.2,
  )

  return {
    file: filePath,
    alloyStrength,
    patinaWisdom,
    dawnClarity,
    forgePrecision,
    durableCurrent,
    combining,
    aging,
    illuminating,
    crafting,
    conducting,
    condition: classifyRayCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeBronzeForge ────────────────────────────────────────────

/**
 * @example analyzeBronzeForge(rays, 'src')
 */
export function analyzeBronzeForge(rays: BronzeRay[], dirPath: string): BronzeForge {
  if (rays.length === 0) {
    return {
      directory: dirPath,
      rays: [],
      avgStrength: 0,
      avgClarity: 0,
      avgCurrent: 0,
      bronzeMasterpieceCount: 0,
      scrapCount: 0,
      forgeType: 'no-forge',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(rays.reduce((s, r) => s + r.alloyStrength, 0) / rays.length)
  const avgClarity = Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
  const avgCurrent = Math.round(rays.reduce((s, r) => s + r.durableCurrent, 0) / rays.length)
  const bronzeMasterpieceCount = rays.filter(r => r.condition === 'bronze-masterpiece').length
  const scrapCount = rays.filter(r => r.condition === 'scrap').length

  return {
    directory: dirPath,
    rays,
    avgStrength,
    avgClarity,
    avgCurrent,
    bronzeMasterpieceCount,
    scrapCount,
    forgeType: classifyForgeType(rays),
    condition: classifyForgeCondition(avgStrength),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(rays, forges, age, stats)
 */
export function generateRecommendations(
  rays: BronzeRay[],
  forges: BronzeForge[],
  _age: BronzeHorizonResult['age'],
  stats: BronzeHorizonResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallLuster >= 85 && stats.scrapCount === 0) {
    recs.push('Bronze horizon perfection — the first alloy catches the dawn light eternally')
    return recs
  }

  if (stats.avgAlloyStrength < 60) {
    recs.push('Strengthen the alloy — combine exports, interfaces, generics, error handling, remove var')
  }
  if (stats.avgPatinaWisdom < 60) {
    recs.push('Deepen patina wisdom — add abstractions, documentation, proven patterns, remove eval and TODO')
  }
  if (stats.avgDawnClarity < 60) {
    recs.push('Illuminate the dawn — add JSDoc, named exports, return types, remove eval and var')
  }
  if (stats.avgForgePrecision < 60) {
    recs.push('Sharpen forge precision — add type annotations, generics, readonly, remove var and debugger')
  }
  if (stats.avgDurableCurrent < 60) {
    recs.push('Strengthen the current — add async/await, pipelines, error handling, remove debugger and var')
  }

  if (stats.scrapCount > 0) {
    const scrapFiles = rays.filter(r => r.condition === 'scrap').map(r => r.file)
    if (scrapFiles.length <= 3) {
      recs.push(`Scrap detected: ${scrapFiles.join(', ')} — these need the forge`)
    } else {
      recs.push(`${scrapFiles.length} scrap files detected — they need the forge`)
    }
  }

  if (forges.length > 1) {
    const weakForges = forges.filter(f => f.condition === 'declining-era' || f.condition === 'abandoned-mine')
    if (weakForges.length > 0) {
      recs.push(`${weakForges.length} forge(s) have declining or abandoned conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The bronze horizon holds steady — maintain current luster')
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

// ─── buildBronzeHorizonResult ──────────────────────────────────────

/**
 * @example buildBronzeHorizonResult(['a.ts'], [content])
 */
export async function buildBronzeHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<BronzeHorizonResult> {
  const rays: BronzeRay[] = files.map((file, i) =>
    analyzeBronzeRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, BronzeRay[]>()
  for (const ray of rays) {
    const dir = path.dirname(ray.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const forges: BronzeForge[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeBronzeForge(dirRays, dir),
  )

  const avgAlloyStrength = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.alloyStrength, 0) / rays.length)
    : 0
  const avgPatinaWisdom = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.patinaWisdom, 0) / rays.length)
    : 0
  const avgDawnClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
    : 0
  const avgForgePrecision = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.forgePrecision, 0) / rays.length)
    : 0
  const avgDurableCurrent = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.durableCurrent, 0) / rays.length)
    : 0

  const overallLuster = Math.round(
    (avgAlloyStrength + avgDawnClarity + avgDurableCurrent) / 3,
  )

  const age = {
    avgStrength: avgAlloyStrength,
    avgClarity: avgDawnClarity,
    avgCurrent: avgDurableCurrent,
    isBronze: overallLuster >= 80,
    overallLuster,
  }

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const strongest = rays.length > 0
    ? rays.reduce((best, r) => r.alloyStrength > best.alloyStrength ? r : best).file
    : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => r.patinaWisdom > best.patinaWisdom ? r : best).file
    : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => r.dawnClarity > best.dawnClarity ? r : best).file
    : ''
  const mostConductive = rays.length > 0
    ? rays.reduce((best, r) => r.durableCurrent > best.durableCurrent ? r : best).file
    : ''

  const stats = {
    totalFiles: rays.length,
    totalForges: forges.length,
    avgAlloyStrength,
    avgPatinaWisdom,
    avgDawnClarity,
    avgForgePrecision,
    avgDurableCurrent,
    bronzeMasterpieceCount: rays.filter(r => r.condition === 'bronze-masterpiece').length,
    agedTreasureCount: rays.filter(r => r.condition === 'aged-treasure').length,
    properAlloyCount: rays.filter(r => r.condition === 'proper-alloy').length,
    tarnishedMetalCount: rays.filter(r => r.condition === 'tarnished-metal').length,
    rustyIronCount: rays.filter(r => r.condition === 'rusty-iron').length,
    scrapCount: rays.filter(r => r.condition === 'scrap').length,
    hasHighStrengthCount: rays.filter(r => r.combining.hasHighStrength).length,
    hasHighWisdomCount: rays.filter(r => r.aging.hasHighWisdom).length,
    hasHighClarityCount: rays.filter(r => r.illuminating.hasHighClarity).length,
    hasHighPrecisionCount: rays.filter(r => r.crafting.hasHighPrecision).length,
    hasHighCurrentCount: rays.filter(r => r.conducting.hasHighCurrent).length,
    overallLuster,
    smithGrade: classifySmithGrade(overallLuster),
    bestRay,
    strongest,
    wisest,
    clearest,
    mostConductive,
  }

  const recommendations = generateRecommendations(rays, forges, age, { ...stats, recommendations: [] } as BronzeHorizonResult['stats'])

  return {
    rays,
    forges,
    age,
    stats,
    recommendations,
  }
}
