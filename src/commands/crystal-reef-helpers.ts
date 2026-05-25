// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Lattice = 'perfect-crystal' | 'well-formed' | 'proper-lattice' | 'flawed-crystal' | 'amorphous' | 'no-structure'
export type Reef = 'great-barrier' | 'rich-ecosystem' | 'proper-reef' | 'small-colony' | 'bleached-coral' | 'no-diversity'
export type Tide = 'tsunami-proof' | 'storm-resistant' | 'proper-anchor' | 'wave-worn' | 'washed-away' | 'no-resilience'
export type Depth = 'crystal-water' | 'clear-depth' | 'proper-visibility' | 'murky-water' | 'dark-abyss' | 'no-clarity'
export type Ocean = 'ancient-depths' | 'deep-wisdom' | 'proper-current' | 'surface-knowledge' | 'shallow-pool' | 'no-wisdom'
export type CoralCondition = 'pristine-reef' | 'healthy-ecosystem' | 'proper-formation' | 'stressed-coral' | 'bleached-reef' | 'dead-zone'
export type AtollType = 'great-barrier' | 'coral-kingdom' | 'proper-reef' | 'small-atoll' | 'sandbar' | 'no-atoll'
export type AtollCondition = 'marine-paradise' | 'healthy-ocean' | 'proper-sea' | 'stressed-waters' | 'dead-sea' | 'void'
export type MarineGrade = 'master-oceanographer' | 'coral-scientist' | 'marine-biologist' | 'apprentice' | 'novice' | 'landlubber'

export interface StructuringMeasure {
  structure: number
  lattice: Lattice
  hasHighStructure: boolean
  hasOrganized: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasOrdered: boolean
  hasNoRandom: boolean
  hasMethodical: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface DiversifyingMeasure {
  diversity: number
  reef: Reef
  hasHighDiversity: boolean
  hasVaried: boolean
  hasNoMonotone: boolean
  hasExpressive: boolean
  hasNoFormulaic: boolean
  hasTypeHandling: boolean
  hasNoSinglePath: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasGeneric: boolean
  hasNoHardcoded: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasColorful: boolean
  monotoneCount: number
  hardcodedCount: number
}

export interface EnduringMeasure {
  resilience: number
  tide: Tide
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
  hasChangeResistant: boolean
  hasNoBreakable: boolean
  hasFutureProof: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  depth: Depth
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
  hasNoDark: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  ocean: Ocean
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
  hasNoNovel: boolean
  adHocCount: number
  hackyCount: number
}

export interface CoralCrystal {
  file: string
  crystallineStructure: number
  coralDiversity: number
  tideResilience: number
  depthClarity: number
  oceanWisdom: number
  structuring: StructuringMeasure
  diversifying: DiversifyingMeasure
  enduring: EnduringMeasure
  clarifying: ClarifyingMeasure
  knowing: KnowingMeasure
  condition: CoralCondition
  qualityScore: number
}

export interface CrystalAtoll {
  directory: string
  corals: CoralCrystal[]
  avgStructure: number
  avgDiversity: number
  avgWisdom: number
  pristineReefCount: number
  deadZoneCount: number
  atollType: AtollType
  condition: AtollCondition
}

export interface CrystalReefResult {
  corals: CoralCrystal[]
  atolls: CrystalAtoll[]
  ocean: {
    avgStructure: number
    avgDiversity: number
    avgWisdom: number
    isPristine: boolean
    overallVitality: number
  }
  stats: {
    totalFiles: number
    totalAtolls: number
    avgCrystallineStructure: number
    avgCoralDiversity: number
    avgTideResilience: number
    avgDepthClarity: number
    avgOceanWisdom: number
    pristineReefCount: number
    healthyEcosystemCount: number
    properFormationCount: number
    stressedCoralCount: number
    bleachedReefCount: number
    deadZoneCount: number
    hasHighStructureCount: number
    hasHighDiversityCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallVitality: number
    marineGrade: MarineGrade
    bestCoral: string
    mostStructured: string
    mostDiverse: string
    mostResilient: string
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

// ─── measureStructuring ────────────────────────────────────────────

/**
 * @example measureStructuring('export function greet(name: string): string { return name }')
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasGodFile = content.split('\n').length > 300
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasEnum) score += 4
  if (hasClass) score += 6
  if (hasImport) score += 6
  if (hasReturnType) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasAsync) score += 4
  if (hasPrivate) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasAny) score -= 4
  if (hasGodFile) score -= 6

  const structure = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const chaoticCount = hasVar > 0 ? 1 : 0
  const monolithicCount = hasGodFile ? 1 : 0

  return {
    structure,
    lattice: classifyLattice(structure),
    hasHighStructure: structure >= 80,
    hasOrganized: hasExport && hasImport,
    hasWellStructured: hasInterface && (hasClass || hasType),
    hasNoChaotic: hasVar === 0,
    hasLayered: hasImport && hasExport,
    hasNoFlat: !hasGodFile,
    hasModular: hasImport,
    hasNoMonolithic: !hasGodFile,
    hasSystematic: hasExport && hasReturnType,
    hasNoHaphazard: hasVar === 0 && !hasAny,
    hasOrdered: hasNamed && hasImport,
    hasNoRandom: !hasVar && !hasAny,
    hasMethodical: hasInterface && hasNamed,
    chaoticCount,
    monolithicCount,
  }
}

// ─── measureDiversifying ───────────────────────────────────────────

/**
 * @example measureDiversifying('export interface Widget<T> { readonly id: string }')
 */
export function measureDiversifying(content: string): DiversifyingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasLiteral = countPattern(content, /'[^']*'|"[^"]*"/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasClass) score += 4
  if (hasGenerics) score += 8
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasAsync) score += 4
  if (hasPipeline) score += 6
  if (hasArrow) score += 4
  if (hasReturnType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 4

  const diversity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const monotoneCount = hasVar > 0 ? 1 : 0
  const hardcodedCount = hasLiteral > 5 ? 1 : 0

  return {
    diversity,
    reef: classifyReef(diversity),
    hasHighDiversity: diversity >= 80,
    hasVaried: hasExport && (hasInterface || hasClass || hasType),
    hasNoMonotone: hasVar === 0,
    hasExpressive: hasNamed && hasGenerics,
    hasNoFormulaic: !hasAny,
    hasTypeHandling: hasGenerics || hasOptional,
    hasNoSinglePath: hasOptional || hasNullish,
    hasFlexible: hasOptional || hasNullish,
    hasNoRigid: hasVar === 0,
    hasGeneric: hasGenerics,
    hasNoHardcoded: hardcodedCount === 0,
    hasAdaptive: hasOptional && hasGenerics,
    hasNoStatic: !hasAny,
    hasColorful: hasPipeline && hasArrow,
    monotoneCount,
    hardcodedCount,
  }
}

// ─── measureEnduring ───────────────────────────────────────────────

/**
 * @example measureEnduring('try { await work() } catch (e) { handleError(e) }')
 */
export function measureEnduring(content: string): EnduringMeasure {
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
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasTryCatch) score += 8
  if (hasThrow) score += 6
  if (hasAsync) score += 6
  if (hasAwait) score += 4
  if (hasReturnType) score += 6
  if (hasInterface) score += 4
  if (hasGenerics) score += 4
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const resilience = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    resilience,
    tide: classifyTide(resilience),
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
    hasChangeResistant: hasInterface && !hasAny,
    hasNoBreakable: !hasVar && !hasDebugger,
    hasFutureProof: hasReadonly && hasGenerics,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureClarifying ─────────────────────────────────────────────

/**
 * @example measureClarifying('export function helper(val: string): string { return val }')
 */
export function measureClarifying(content: string): ClarifyingMeasure {
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
    depth: classifyDepth(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasExport && hasReturnType,
    hasSelfDocumenting: hasNamed,
    hasNoCryptic: !hasEval && hasVar === 0,
    hasTransparent: hasNamed && !hasEval,
    hasNoObfuscated: !hasDebugger,
    hasClear: hasDoc && hasExport,
    hasNoHidden: !hasEval && !hasDebugger,
    hasUnderstandable: hasReturnType && !hasEval,
    hasNoArcane: !hasEval && hasVar === 0,
    hasVisible: hasExport && hasNamed,
    hasNoInvisible: !hasDebugger,
    hasLuminous: hasDoc && hasNamed,
    hasNoDark: !hasEval && !hasDebugger && hasVar === 0,
    crypticCount,
    obfuscatedCount,
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
  const hackyCount = (hasHackyCast > 0 ? 1 : 0) + (hasEval ? 1 : 0)

  return {
    wisdom,
    ocean: classifyOcean(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasDocumented: hasDoc,
    hasWellArchitected: hasInterface && (hasClass || hasType),
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoHacky: hasHackyCast === 0,
    hasMature: hasAbstract || hasExtends,
    hasNoNaive: !hasDebugger,
    hasProven: hasExtends || hasImplements,
    hasNoExperimental: !hasTodo,
    hasEstablished: wisdom >= 70,
    hasNoNovel: !hasEval,
    adHocCount,
    hackyCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyLattice(structure: number): Lattice {
  if (structure >= 90) return 'perfect-crystal'
  if (structure >= 75) return 'well-formed'
  if (structure >= 60) return 'proper-lattice'
  if (structure >= 40) return 'flawed-crystal'
  if (structure >= 20) return 'amorphous'
  return 'no-structure'
}

function classifyReef(diversity: number): Reef {
  if (diversity >= 90) return 'great-barrier'
  if (diversity >= 75) return 'rich-ecosystem'
  if (diversity >= 60) return 'proper-reef'
  if (diversity >= 40) return 'small-colony'
  if (diversity >= 20) return 'bleached-coral'
  return 'no-diversity'
}

function classifyTide(resilience: number): Tide {
  if (resilience >= 90) return 'tsunami-proof'
  if (resilience >= 75) return 'storm-resistant'
  if (resilience >= 60) return 'proper-anchor'
  if (resilience >= 40) return 'wave-worn'
  if (resilience >= 20) return 'washed-away'
  return 'no-resilience'
}

function classifyDepth(clarity: number): Depth {
  if (clarity >= 90) return 'crystal-water'
  if (clarity >= 75) return 'clear-depth'
  if (clarity >= 60) return 'proper-visibility'
  if (clarity >= 40) return 'murky-water'
  if (clarity >= 20) return 'dark-abyss'
  return 'no-clarity'
}

function classifyOcean(wisdom: number): Ocean {
  if (wisdom >= 90) return 'ancient-depths'
  if (wisdom >= 75) return 'deep-wisdom'
  if (wisdom >= 60) return 'proper-current'
  if (wisdom >= 40) return 'surface-knowledge'
  if (wisdom >= 20) return 'shallow-pool'
  return 'no-wisdom'
}

export function classifyCoralCondition(qualityScore: number): CoralCondition {
  if (qualityScore >= 90) return 'pristine-reef'
  if (qualityScore >= 75) return 'healthy-ecosystem'
  if (qualityScore >= 60) return 'proper-formation'
  if (qualityScore >= 40) return 'stressed-coral'
  if (qualityScore >= 20) return 'bleached-reef'
  return 'dead-zone'
}

export function classifyAtollType(corals: CoralCrystal[]): AtollType {
  if (corals.length === 0) return 'no-atoll'
  const avgQs = corals.reduce((s, c) => s + c.qualityScore, 0) / corals.length
  const pristineRatio = corals.filter(c => c.condition === 'pristine-reef').length / corals.length
  if (avgQs >= 85 && pristineRatio >= 0.5) return 'great-barrier'
  if (avgQs >= 70 && pristineRatio >= 0.3) return 'coral-kingdom'
  if (avgQs >= 55) return 'proper-reef'
  if (avgQs >= 35) return 'small-atoll'
  if (avgQs >= 15) return 'sandbar'
  return 'no-atoll'
}

export function classifyAtollCondition(avgStructure: number): AtollCondition {
  if (avgStructure >= 85) return 'marine-paradise'
  if (avgStructure >= 70) return 'healthy-ocean'
  if (avgStructure >= 55) return 'proper-sea'
  if (avgStructure >= 35) return 'stressed-waters'
  if (avgStructure >= 15) return 'dead-sea'
  return 'void'
}

export function classifyMarineGrade(avgVitality: number): MarineGrade {
  if (avgVitality >= 85) return 'master-oceanographer'
  if (avgVitality >= 70) return 'coral-scientist'
  if (avgVitality >= 55) return 'marine-biologist'
  if (avgVitality >= 40) return 'apprentice'
  if (avgVitality >= 20) return 'novice'
  return 'landlubber'
}

// ─── analyzeCoralCrystal ──────────────────────────────────────────

/**
 * @example analyzeCoralCrystal(content, 'src/foo.ts')
 */
export function analyzeCoralCrystal(content: string, filePath: string): CoralCrystal {
  const structuring = measureStructuring(content)
  const diversifying = measureDiversifying(content)
  const enduring = measureEnduring(content)
  const clarifying = measureClarifying(content)
  const knowing = measureKnowing(content)

  const crystallineStructure = structuring.structure
  const coralDiversity = diversifying.diversity
  const tideResilience = enduring.resilience
  const depthClarity = clarifying.clarity
  const oceanWisdom = knowing.wisdom

  const qualityScore = Math.round(
    crystallineStructure * 0.2 +
    coralDiversity * 0.2 +
    tideResilience * 0.2 +
    depthClarity * 0.2 +
    oceanWisdom * 0.2,
  )

  return {
    file: filePath,
    crystallineStructure,
    coralDiversity,
    tideResilience,
    depthClarity,
    oceanWisdom,
    structuring,
    diversifying,
    enduring,
    clarifying,
    knowing,
    condition: classifyCoralCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeCrystalAtoll ──────────────────────────────────────────

/**
 * @example analyzeCrystalAtoll(corals, 'src')
 */
export function analyzeCrystalAtoll(corals: CoralCrystal[], dirPath: string): CrystalAtoll {
  if (corals.length === 0) {
    return {
      directory: dirPath,
      corals: [],
      avgStructure: 0,
      avgDiversity: 0,
      avgWisdom: 0,
      pristineReefCount: 0,
      deadZoneCount: 0,
      atollType: 'no-atoll',
      condition: 'void',
    }
  }

  const avgStructure = Math.round(corals.reduce((s, c) => s + c.crystallineStructure, 0) / corals.length)
  const avgDiversity = Math.round(corals.reduce((s, c) => s + c.coralDiversity, 0) / corals.length)
  const avgWisdom = Math.round(corals.reduce((s, c) => s + c.oceanWisdom, 0) / corals.length)
  const pristineReefCount = corals.filter(c => c.condition === 'pristine-reef').length
  const deadZoneCount = corals.filter(c => c.condition === 'dead-zone').length

  return {
    directory: dirPath,
    corals,
    avgStructure,
    avgDiversity,
    avgWisdom,
    pristineReefCount,
    deadZoneCount,
    atollType: classifyAtollType(corals),
    condition: classifyAtollCondition(avgStructure),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(corals, atolls, ocean, stats)
 */
export function generateRecommendations(
  corals: CoralCrystal[],
  atolls: CrystalAtoll[],
  ocean: CrystalReefResult['ocean'],
  stats: CrystalReefResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallVitality >= 85 && stats.deadZoneCount === 0) {
    recs.push('Crystal reef perfection — the reef thrives with pristine coral formations')
    return recs
  }

  if (stats.avgCrystallineStructure < 60) {
    recs.push('Improve crystalline structure — add exports, interfaces, generics, remove var and god files')
  }
  if (stats.avgCoralDiversity < 60) {
    recs.push('Enrich coral diversity — add type variety, generics, pipelines, remove var and any')
  }
  if (stats.avgTideResilience < 60) {
    recs.push('Strengthen tide resilience — add error handling, type safety, remove eval and debugger')
  }
  if (stats.avgDepthClarity < 60) {
    recs.push('Deepen clarity — add JSDoc, named exports, return types, remove eval and var')
  }
  if (stats.avgOceanWisdom < 60) {
    recs.push('Grow ocean wisdom — add abstractions, documentation, proven patterns, remove eval and TODO')
  }

  if (stats.deadZoneCount > 0) {
    const deadFiles = corals.filter(c => c.condition === 'dead-zone').map(c => c.file)
    if (deadFiles.length <= 3) {
      recs.push(`Dead zone detected: ${deadFiles.join(', ')} — these need reef restoration`)
    } else {
      recs.push(`${deadFiles.length} dead zone files detected — they need reef restoration`)
    }
  }

  if (atolls.length > 1) {
    const stressedAtolls = atolls.filter(a => a.condition === 'stressed-waters' || a.condition === 'dead-sea')
    if (stressedAtolls.length > 0) {
      recs.push(`${stressedAtolls.length} atoll(s) have stressed or dead conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The crystal reef holds steady — maintain current vitality')
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

// ─── buildCrystalReefResult ───────────────────────────────────────

/**
 * @example buildCrystalReefResult(['a.ts'], [content])
 */
export async function buildCrystalReefResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrystalReefResult> {
  const corals: CoralCrystal[] = files.map((file, i) =>
    analyzeCoralCrystal(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CoralCrystal[]>()
  for (const coral of corals) {
    const dir = path.dirname(coral.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(coral)
    } else {
      dirMap.set(dir, [coral])
    }
  }

  const atolls: CrystalAtoll[] = Array.from(dirMap.entries()).map(([dir, dirCorals]) =>
    analyzeCrystalAtoll(dirCorals, dir),
  )

  const avgCrystallineStructure = corals.length > 0
    ? Math.round(corals.reduce((s, c) => s + c.crystallineStructure, 0) / corals.length)
    : 0
  const avgCoralDiversity = corals.length > 0
    ? Math.round(corals.reduce((s, c) => s + c.coralDiversity, 0) / corals.length)
    : 0
  const avgTideResilience = corals.length > 0
    ? Math.round(corals.reduce((s, c) => s + c.tideResilience, 0) / corals.length)
    : 0
  const avgDepthClarity = corals.length > 0
    ? Math.round(corals.reduce((s, c) => s + c.depthClarity, 0) / corals.length)
    : 0
  const avgOceanWisdom = corals.length > 0
    ? Math.round(corals.reduce((s, c) => s + c.oceanWisdom, 0) / corals.length)
    : 0

  const overallVitality = Math.round(
    (avgCrystallineStructure + avgCoralDiversity + avgOceanWisdom) / 3,
  )

  const ocean = {
    avgStructure: avgCrystallineStructure,
    avgDiversity: avgCoralDiversity,
    avgWisdom: avgOceanWisdom,
    isPristine: overallVitality >= 80,
    overallVitality,
  }

  const bestCoral = corals.length > 0
    ? corals.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file
    : ''
  const mostStructured = corals.length > 0
    ? corals.reduce((best, c) => c.crystallineStructure > best.crystallineStructure ? c : best).file
    : ''
  const mostDiverse = corals.length > 0
    ? corals.reduce((best, c) => c.coralDiversity > best.coralDiversity ? c : best).file
    : ''
  const mostResilient = corals.length > 0
    ? corals.reduce((best, c) => c.tideResilience > best.tideResilience ? c : best).file
    : ''
  const wisest = corals.length > 0
    ? corals.reduce((best, c) => c.oceanWisdom > best.oceanWisdom ? c : best).file
    : ''

  const stats = {
    totalFiles: corals.length,
    totalAtolls: atolls.length,
    avgCrystallineStructure,
    avgCoralDiversity,
    avgTideResilience,
    avgDepthClarity,
    avgOceanWisdom,
    pristineReefCount: corals.filter(c => c.condition === 'pristine-reef').length,
    healthyEcosystemCount: corals.filter(c => c.condition === 'healthy-ecosystem').length,
    properFormationCount: corals.filter(c => c.condition === 'proper-formation').length,
    stressedCoralCount: corals.filter(c => c.condition === 'stressed-coral').length,
    bleachedReefCount: corals.filter(c => c.condition === 'bleached-reef').length,
    deadZoneCount: corals.filter(c => c.condition === 'dead-zone').length,
    hasHighStructureCount: corals.filter(c => c.structuring.hasHighStructure).length,
    hasHighDiversityCount: corals.filter(c => c.diversifying.hasHighDiversity).length,
    hasHighResilienceCount: corals.filter(c => c.enduring.hasHighResilience).length,
    hasHighClarityCount: corals.filter(c => c.clarifying.hasHighClarity).length,
    hasHighWisdomCount: corals.filter(c => c.knowing.hasHighWisdom).length,
    overallVitality,
    marineGrade: classifyMarineGrade(overallVitality),
    bestCoral,
    mostStructured,
    mostDiverse,
    mostResilient,
    wisest,
  }

  const recommendations = generateRecommendations(corals, atolls, ocean, { ...stats, recommendations: [] } as CrystalReefResult['stats'])

  return {
    corals,
    atolls,
    ocean,
    stats,
    recommendations,
  }
}
