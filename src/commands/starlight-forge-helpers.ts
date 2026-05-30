// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Flame = 'supernova' | 'blue-giant' | 'proper-star' | 'red-dwarf' | 'brown-dwarf' | 'no-flame'
export type StarGrade = 'neutron-star' | 'white-dwarf' | 'proper-star' | 'red-giant' | 'gas-giant' | 'no-hardness'
export type Constellation = 'grand-constellation' | 'recognized-pattern' | 'proper-stars' | 'random-dots' | 'scattered-debris' | 'no-pattern'
export type Nebula = 'bright-nebula' | 'clear-gas' | 'proper-cloud' | 'dark-nebula' | 'opaque-cloud' | 'no-clarity'
export type Cosmos = 'universal-wisdom' | 'galactic-knowledge' | 'proper-understanding' | 'solar-system' | 'planetary' | 'no-wisdom'
export type IngotCondition = 'stellar-masterpiece' | 'bright-star' | 'proper-body' | 'dim-object' | 'dark-matter' | 'void'
export type NurseryType = 'stellar-nursery' | 'star-cluster' | 'proper-field' | 'small-group' | 'lone-star' | 'no-nursery'
export type NurseryCondition = 'magnificent-cosmos' | 'beautiful-constellation' | 'proper-galaxy' | 'dim-cluster' | 'dark-void' | 'void'
export type AstronomerGrade = 'stellar-architect' | 'star-forger' | 'cosmic-smith' | 'apprentice' | 'novice' | 'groundling'

export interface IgnitingMeasure {
  forging: number
  flame: Flame
  hasHighForging: boolean
  hasCreative: boolean
  hasNoFormulaic: boolean
  hasTransformative: boolean
  hasNoBoilerplate: boolean
  hasInnovative: boolean
  hasNoRepetitive: boolean
  hasExpressive: boolean
  hasNoMonotone: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  formulaicCount: number
  boilerplateCount: number
}

export interface HardeningMeasure {
  hardness: number
  grade: StarGrade
  hasHighHardness: boolean
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
  untestedCount: number
  bareCrashCount: number
}

export interface PatterningMeasure {
  pattern: number
  constellation: Constellation
  hasHighPattern: boolean
  hasStructured: boolean
  hasWellOrganized: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasGrouped: boolean
  hasNoScattered: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasHarmonious: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  nebula: Nebula
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasLuminous: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  cosmos: Cosmos
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellArchitected: boolean
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

export interface StarlightIngot {
  file: string
  celestialForging: number
  starHardness: number
  constellationPattern: number
  nebulaClarity: number
  cosmicWisdom: number
  igniting: IgnitingMeasure
  hardening: HardeningMeasure
  patterning: PatterningMeasure
  clarifying: ClarifyingMeasure
  knowing: KnowingMeasure
  condition: IngotCondition
  qualityScore: number
}

export interface StarlightNursery {
  directory: string
  ingots: StarlightIngot[]
  avgForging: number
  avgHardness: number
  avgWisdom: number
  stellarMasterpieceCount: number
  voidCount: number
  nurseryType: NurseryType
  condition: NurseryCondition
}

export interface StarlightForgeResult {
  ingots: StarlightIngot[]
  nurseries: StarlightNursery[]
  cosmos: {
    avgForging: number
    avgHardness: number
    avgWisdom: number
    isStellar: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalNurseries: number
    avgCelestialForging: number
    avgStarHardness: number
    avgConstellationPattern: number
    avgNebulaClarity: number
    avgCosmicWisdom: number
    stellarMasterpieceCount: number
    brightStarCount: number
    properBodyCount: number
    dimObjectCount: number
    darkMatterCount: number
    voidCount: number
    hasHighForgingCount: number
    hasHighHardnessCount: number
    hasHighPatternCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    astronomerGrade: AstronomerGrade
    bestIngot: string
    mostForged: string
    hardest: string
    bestPatterned: string
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

// ─── measureIgniting ───────────────────────────────────────────────

/**
 * @example measureIgniting('export function foo() {}')
 */
export function measureIgniting(content: string): IgnitingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasFunction = hasPattern(content, /\bfunction\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturn = hasPattern(content, /\breturn\b/)
  const hasDestructure = hasPattern(content, /\{[^}]+\}\s*=/)
  const hasSpread = hasPattern(content, /\.\.\./)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasTemplate = hasPattern(content, /`[^`]*\$\{/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasDuplicateExport = countPattern(content, /\bexport\s+default\b/) > 1 ? 1 : 0

  if (hasExport) score += 8
  if (hasImport) score += 6
  if (hasFunction) score += 6
  if (hasArrow) score += 6
  if (hasAsync) score += 8
  if (hasAwait) score += 4
  if (hasClass) score += 6
  if (hasGenerics) score += 8
  if (hasInterface) score += 6
  if (hasEnum) score += 4
  if (hasType) score += 6
  if (hasConst) score += 4
  if (hasReturn) score += 2
  if (hasDestructure) score += 4
  if (hasSpread) score += 4
  if (hasOptionalChain) score += 4
  if (hasNullish) score += 4
  if (hasTemplate) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasDuplicateExport > 0) score -= 5

  const forging = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const formulaicCount = hasVar
  const boilerplateCount = hasDuplicateExport

  return {
    forging,
    flame: classifyFlame(forging),
    hasHighForging: forging >= 80,
    hasCreative: hasExport || hasAsync,
    hasNoFormulaic: !hasPattern(content, /\bvar\b/),
    hasTransformative: hasAsync || hasGenerics,
    hasNoBoilerplate: hasDuplicateExport === 0,
    hasInnovative: hasGenerics || hasOptionalChain || hasNullish,
    hasNoRepetitive: !hasPattern(content, /\bvar\b/),
    hasExpressive: hasTemplate || hasDestructure || hasSpread,
    hasNoMonotone: !hasPattern(content, /\bvar\b/),
    hasPowerful: hasAsync && hasGenerics,
    hasNoWeak: !hasPattern(content, /\bvar\b/),
    hasDynamic: hasAsync || hasArrow,
    hasNoStatic: !hasPattern(content, /\bvar\b/),
    formulaicCount,
    boilerplateCount,
  }
}

// ─── measureHardening ──────────────────────────────────────────────

/**
 * @example measureHardening('try { foo() } catch(e) { throw new Error(e) }')
 */
export function measureHardening(content: string): HardeningMeasure {
  let score = 0

  const hasType = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasDefaultParam = hasPattern(content, /=\s*[^=]+\)/)
  const hasStrictNull = hasPattern(content, /!==\s*null|!==\s*undefined/)

  const hasVar = hasPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasBareThrow = hasPattern(content, /\bthrow\b/) && !hasPattern(content, /\bthrow\s+new\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasUnsafeCast = hasPattern(content, /\bas\s+any\b/)

  if (hasType) score += 8
  if (hasInterface) score += 6
  if (hasConst) score += 4
  if (hasTryCatch) score += 10
  if (hasThrow) score += 8
  if (hasAsync) score += 6
  if (hasExport) score += 4
  if (hasGenerics) score += 6
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasDefaultParam) score += 6
  if (hasStrictNull) score += 6

  if (hasVar) score -= 10
  if (hasAny) score -= 10
  if (hasDebugger) score -= 10
  if (hasUnsafeCast) score -= 8

  const hardness = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar ? 1 : 0
  const bareCrashCount = (hasBareThrow ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    hardness,
    grade: classifyGrade(hardness),
    hasHighHardness: hardness >= 80,
    hasTested: hasTryCatch || hasAsync,
    hasNoUntested: !hasVar,
    hasTypeSafe: hasType && !hasAny,
    hasNoUnsafe: !hasVar,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasBareThrow && !hasDebugger,
    hasRobust: hasTryCatch && hasThrow,
    hasNoFragile: !hasVar && !hasAny,
    hasDefensive: hasOptional || hasStrictNull || hasDefaultParam,
    hasNoNaive: !hasDebugger,
    hasSolid: hardness >= 70,
    hasNoShaky: !hasVar && !hasAny && !hasDebugger,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measurePatterning ─────────────────────────────────────────────

/**
 * @example measurePatterning('export interface Foo {} export class Bar implements Foo {}')
 */
export function measurePatterning(content: string): PatterningMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasDefault = hasPattern(content, /\bdefault\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasGodFile = content.split('\n').length > 300
  const hasDeepNesting = countPattern(content, /\bif\s*\(/) > 5
  const hasGlobalLeak = hasPattern(content, /\bvar\b/)

  if (hasExport) score += 8
  if (hasImport) score += 10
  if (hasInterface) score += 8
  if (hasClass) score += 8
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasType) score += 6
  if (hasEnum) score += 4
  if (hasAsync) score += 4
  if (hasConst) score += 4
  if (hasGenerics) score += 6
  if (hasDefault) score += 2
  if (hasNamed) score += 8

  if (hasGodFile) score -= 8
  if (hasDeepNesting) score -= 6
  if (hasGlobalLeak) score -= 8

  const pattern = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const chaoticCount = hasGlobalLeak ? 1 : 0
  const monolithicCount = hasGodFile ? 1 : 0

  return {
    pattern,
    constellation: classifyConstellation(pattern),
    hasHighPattern: pattern >= 80,
    hasStructured: hasExport && (hasInterface || hasClass),
    hasWellOrganized: hasExport && hasImport,
    hasNoChaotic: !hasGlobalLeak,
    hasModular: hasExport && hasImport,
    hasNoMonolithic: !hasGodFile,
    hasLayered: hasExtends || hasImplements,
    hasNoFlat: hasInterface || hasClass || hasEnum,
    hasGrouped: hasNamed,
    hasNoScattered: !hasGodFile,
    hasSystematic: hasExport && hasImport && (hasInterface || hasClass),
    hasNoHaphazard: !hasGlobalLeak && !hasDeepNesting,
    hasHarmonious: pattern >= 75,
    chaoticCount,
    monolithicCount,
  }
}

// ─── measureClarifying ─────────────────────────────────────────────

/**
 * @example measureClarifying('export function foo(): string { return "a" }')
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasGenerics = hasPattern(content, /<\w+/)

  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasWith = hasPattern(content, /\bwith\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 8
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasConst) score += 4
  if (hasDoc) score += 10
  if (hasNamed) score += 6
  if (hasReturnType) score += 8
  if (hasEnum) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasPrivate) score += 4
  if (hasAsync) score += 6
  if (hasGenerics) score += 6

  if (hasEval) score -= 15
  if (hasWith) score -= 10
  if (hasDebugger) score -= 10

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasWith ? 1 : 0)
  const obfuscatedCount = hasDebugger ? 1 : 0

  return {
    clarity,
    nebula: classifyNebula(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport || hasConst,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && !hasWith,
    hasTransparent: hasExport && (hasInterface || hasType),
    hasNoObfuscated: !hasDebugger,
    hasClear: hasReturnType || hasConst,
    hasNoHidden: !hasEval,
    hasUnderstandable: hasInterface || hasType || hasEnum,
    hasNoArcane: !hasDebugger && !hasEval,
    hasVisible: hasExport,
    hasNoInvisible: !hasWith,
    hasLuminous: clarity >= 90,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('export interface Foo { bar: string }')
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
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasAdHoc = countPattern(content, /\bvar\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)

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
  if (hasAsync) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4

  if (hasAdHoc > 0) score -= Math.min(hasAdHoc * 5, 15)
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 5, 15)
  if (hasDebugger) score -= 10
  if (hasTodo) score -= 5

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = Math.min(hasAdHoc, 5)
  const hackyCount = Math.min(hasHackyCast, 5)

  return {
    wisdom,
    cosmos: classifyCosmos(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellArchitected: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasPattern(content, /\bvar\b/),
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

// ─── Classification Helpers ────────────────────────────────────────

function classifyFlame(forging: number): Flame {
  if (forging >= 90) return 'supernova'
  if (forging >= 75) return 'blue-giant'
  if (forging >= 60) return 'proper-star'
  if (forging >= 40) return 'red-dwarf'
  if (forging >= 20) return 'brown-dwarf'
  return 'no-flame'
}

function classifyGrade(hardness: number): StarGrade {
  if (hardness >= 90) return 'neutron-star'
  if (hardness >= 75) return 'white-dwarf'
  if (hardness >= 60) return 'proper-star'
  if (hardness >= 40) return 'red-giant'
  if (hardness >= 20) return 'gas-giant'
  return 'no-hardness'
}

function classifyConstellation(pattern: number): Constellation {
  if (pattern >= 90) return 'grand-constellation'
  if (pattern >= 75) return 'recognized-pattern'
  if (pattern >= 60) return 'proper-stars'
  if (pattern >= 40) return 'random-dots'
  if (pattern >= 20) return 'scattered-debris'
  return 'no-pattern'
}

function classifyNebula(clarity: number): Nebula {
  if (clarity >= 90) return 'bright-nebula'
  if (clarity >= 75) return 'clear-gas'
  if (clarity >= 60) return 'proper-cloud'
  if (clarity >= 40) return 'dark-nebula'
  if (clarity >= 20) return 'opaque-cloud'
  return 'no-clarity'
}

function classifyCosmos(wisdom: number): Cosmos {
  if (wisdom >= 90) return 'universal-wisdom'
  if (wisdom >= 75) return 'galactic-knowledge'
  if (wisdom >= 60) return 'proper-understanding'
  if (wisdom >= 40) return 'solar-system'
  if (wisdom >= 20) return 'planetary'
  return 'no-wisdom'
}

export function classifyIngotCondition(qualityScore: number): IngotCondition {
  if (qualityScore >= 90) return 'stellar-masterpiece'
  if (qualityScore >= 75) return 'bright-star'
  if (qualityScore >= 60) return 'proper-body'
  if (qualityScore >= 40) return 'dim-object'
  if (qualityScore >= 20) return 'dark-matter'
  return 'void'
}

export function classifyNurseryType(ingots: StarlightIngot[]): NurseryType {
  if (ingots.length === 0) return 'no-nursery'
  const avgQs = ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length
  const masterpieceRatio = ingots.filter(i => i.condition === 'stellar-masterpiece').length / ingots.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'stellar-nursery'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'star-cluster'
  if (avgQs >= 55) return 'proper-field'
  if (avgQs >= 35) return 'small-group'
  if (avgQs >= 15) return 'lone-star'
  return 'no-nursery'
}

export function classifyNurseryCondition(avgForging: number): NurseryCondition {
  if (avgForging >= 85) return 'magnificent-cosmos'
  if (avgForging >= 70) return 'beautiful-constellation'
  if (avgForging >= 55) return 'proper-galaxy'
  if (avgForging >= 35) return 'dim-cluster'
  if (avgForging >= 15) return 'dark-void'
  return 'void'
}

export function classifyAstronomerGrade(avgLuminosity: number): AstronomerGrade {
  if (avgLuminosity >= 85) return 'stellar-architect'
  if (avgLuminosity >= 70) return 'star-forger'
  if (avgLuminosity >= 55) return 'cosmic-smith'
  if (avgLuminosity >= 40) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'groundling'
}

// ─── analyzeStarlightIngot ─────────────────────────────────────────

/**
 * @example analyzeStarlightIngot(content, 'src/foo.ts')
 */
export function analyzeStarlightIngot(content: string, filePath: string): StarlightIngot {
  const igniting = measureIgniting(content)
  const hardening = measureHardening(content)
  const patterning = measurePatterning(content)
  const clarifying = measureClarifying(content)
  const knowing = measureKnowing(content)

  const celestialForging = igniting.forging
  const starHardness = hardening.hardness
  const constellationPattern = patterning.pattern
  const nebulaClarity = clarifying.clarity
  const cosmicWisdom = knowing.wisdom

  const qualityScore = Math.round(
    celestialForging * 0.2 +
    starHardness * 0.2 +
    constellationPattern * 0.2 +
    nebulaClarity * 0.2 +
    cosmicWisdom * 0.2,
  )

  return {
    file: filePath,
    celestialForging,
    starHardness,
    constellationPattern,
    nebulaClarity,
    cosmicWisdom,
    igniting,
    hardening,
    patterning,
    clarifying,
    knowing,
    condition: classifyIngotCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeStarlightNursery ───────────────────────────────────────

/**
 * @example analyzeStarlightNursery(ingots, 'src')
 */
export function analyzeStarlightNursery(ingots: StarlightIngot[], dirPath: string): StarlightNursery {
  if (ingots.length === 0) {
    return {
      directory: dirPath,
      ingots: [],
      avgForging: 0,
      avgHardness: 0,
      avgWisdom: 0,
      stellarMasterpieceCount: 0,
      voidCount: 0,
      nurseryType: 'no-nursery',
      condition: 'void',
    }
  }

  const avgForging = Math.round(ingots.reduce((s, i) => s + i.celestialForging, 0) / ingots.length)
  const avgHardness = Math.round(ingots.reduce((s, i) => s + i.starHardness, 0) / ingots.length)
  const avgWisdom = Math.round(ingots.reduce((s, i) => s + i.cosmicWisdom, 0) / ingots.length)
  const stellarMasterpieceCount = ingots.filter(i => i.condition === 'stellar-masterpiece').length
  const voidCount = ingots.filter(i => i.condition === 'void').length

  return {
    directory: dirPath,
    ingots,
    avgForging,
    avgHardness,
    avgWisdom,
    stellarMasterpieceCount,
    voidCount,
    nurseryType: classifyNurseryType(ingots),
    condition: classifyNurseryCondition(avgForging),
  }
}

// ─── generateRecommendations ──────────────────────────────────────

/**
 * @example generateRecommendations(ingots, nurseries, cosmos, stats)
 */
export function generateRecommendations(
  ingots: StarlightIngot[],
  nurseries: StarlightNursery[],
  _cosmos: StarlightForgeResult['cosmos'],
  stats: StarlightForgeResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallLuminosity >= 85 && stats.voidCount === 0) {
    recs.push('Stellar luminosity achieved — the forge burns at cosmic perfection')
    return recs
  }

  if (stats.avgCelestialForging < 60) {
    recs.push('Ignite the forge — add async/await, generics, and modern patterns')
  }
  if (stats.avgStarHardness < 60) {
    recs.push('Harden your stars — add error handling with try/catch and type safety')
  }
  if (stats.avgConstellationPattern < 60) {
    recs.push('Improve constellation patterns — organize with exports, imports, and interfaces')
  }
  if (stats.avgNebulaClarity < 60) {
    recs.push('Clear the nebula — add documentation, return types, and named exports')
  }
  if (stats.avgCosmicWisdom < 60) {
    recs.push('Deepen cosmic wisdom — add JSDoc documentation and architectural patterns')
  }

  if (stats.voidCount > 0) {
    const voidFiles = ingots.filter(i => i.condition === 'void').map(i => i.file)
    if (voidFiles.length <= 3) {
      recs.push(`Void ingots detected: ${voidFiles.join(', ')} — these emit no light`)
    } else {
      recs.push(`${voidFiles.length} void ingots detected — they emit no light`)
    }
  }

  if (nurseries.length > 1) {
    const weakNurseries = nurseries.filter(n => n.condition === 'dark-void' || n.condition === 'dim-cluster')
    if (weakNurseries.length > 0) {
      recs.push(`${weakNurseries.length} nursery(ies) have dim or dark conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The starlight forge burns steadily — maintain current luminosity')
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

// ─── buildStarlightForgeResult ─────────────────────────────────────

/**
 * @example buildStarlightForgeResult(['a.ts'], [content])
 */
export async function buildStarlightForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StarlightForgeResult> {
  const ingots: StarlightIngot[] = files.map((file, i) =>
    analyzeStarlightIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StarlightIngot[]>()
  for (const ingot of ingots) {
    const dir = path.dirname(ingot.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ingot)
    } else {
      dirMap.set(dir, [ingot])
    }
  }

  const nurseries: StarlightNursery[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeStarlightNursery(dirIngots, dir),
  )

  const avgCelestialForging = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.celestialForging, 0) / ingots.length)
    : 0
  const avgStarHardness = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.starHardness, 0) / ingots.length)
    : 0
  const avgConstellationPattern = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.constellationPattern, 0) / ingots.length)
    : 0
  const avgNebulaClarity = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.nebulaClarity, 0) / ingots.length)
    : 0
  const avgCosmicWisdom = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.cosmicWisdom, 0) / ingots.length)
    : 0

  const overallLuminosity = Math.round(
    (avgCelestialForging + avgStarHardness + avgCosmicWisdom) / 3,
  )

  const cosmos = {
    avgForging: avgCelestialForging,
    avgHardness: avgStarHardness,
    avgWisdom: avgCosmicWisdom,
    isStellar: overallLuminosity >= 80,
    overallLuminosity,
  }

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => i.qualityScore > best.qualityScore ? i : best).file
    : ''
  const mostForged = ingots.length > 0
    ? ingots.reduce((best, i) => i.celestialForging > best.celestialForging ? i : best).file
    : ''
  const hardest = ingots.length > 0
    ? ingots.reduce((best, i) => i.starHardness > best.starHardness ? i : best).file
    : ''
  const bestPatterned = ingots.length > 0
    ? ingots.reduce((best, i) => i.constellationPattern > best.constellationPattern ? i : best).file
    : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, i) => i.cosmicWisdom > best.cosmicWisdom ? i : best).file
    : ''

  const stats = {
    totalFiles: ingots.length,
    totalNurseries: nurseries.length,
    avgCelestialForging,
    avgStarHardness,
    avgConstellationPattern,
    avgNebulaClarity,
    avgCosmicWisdom,
    stellarMasterpieceCount: ingots.filter(i => i.condition === 'stellar-masterpiece').length,
    brightStarCount: ingots.filter(i => i.condition === 'bright-star').length,
    properBodyCount: ingots.filter(i => i.condition === 'proper-body').length,
    dimObjectCount: ingots.filter(i => i.condition === 'dim-object').length,
    darkMatterCount: ingots.filter(i => i.condition === 'dark-matter').length,
    voidCount: ingots.filter(i => i.condition === 'void').length,
    hasHighForgingCount: ingots.filter(i => i.igniting.hasHighForging).length,
    hasHighHardnessCount: ingots.filter(i => i.hardening.hasHighHardness).length,
    hasHighPatternCount: ingots.filter(i => i.patterning.hasHighPattern).length,
    hasHighClarityCount: ingots.filter(i => i.clarifying.hasHighClarity).length,
    hasHighWisdomCount: ingots.filter(i => i.knowing.hasHighWisdom).length,
    overallLuminosity,
    astronomerGrade: classifyAstronomerGrade(overallLuminosity),
    bestIngot,
    mostForged,
    hardest,
    bestPatterned,
    wisest,
  }

  const recommendations = generateRecommendations(ingots, nurseries, cosmos, { ...stats, recommendations: [] } as StarlightForgeResult['stats'])

  return {
    ingots,
    nurseries,
    cosmos,
    stats,
    recommendations,
  }
}
