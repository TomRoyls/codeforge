// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Spirit = 'pure-phantom' | 'light-spirit' | 'proper-ghost' | 'heavy-specter' | 'solid-rock' | 'no-spirit'
export type Ghost = 'exorcist' | 'ghost-hunter' | 'proper-medium' | 'fearful-mortal' | 'possessed' | 'no-handling'
export type Mist = 'revealing-mist' | 'clear-fog' | 'proper-haze' | 'obscuring-fog' | 'dark-smog' | 'no-clarity'
export type Root = 'deep-taproot' | 'strong-roots' | 'proper-foundation' | 'shallow-roots' | 'surface-root' | 'no-root'
export type Shadow = 'shadow-sage' | 'dark-scholar' | 'proper-observer' | 'daylight-thinker' | 'blind-wanderer' | 'no-wisdom'
export type PhantomCondition = 'phantom-masterpiece' | 'ethereal-grove' | 'proper-forest' | 'foggy-woods' | 'dead-trees' | 'void'
export type ClearingType = 'enchanted-grove' | 'mystical-clearing' | 'proper-glade' | 'small-thicket' | 'bare-patch' | 'no-clearing'
export type ClearingCondition = 'phantom-paradise' | 'mystical-forest' | 'proper-grove' | 'foggy-woods' | 'dead-forest' | 'void'
export type RangerGrade = 'phantom-ranger' | 'mystic-guide' | 'forest-warden' | 'apprentice' | 'novice' | 'lost-soul'

export interface DriftingMeasure {
  quality: number
  spirit: Spirit
  hasHighQuality: boolean
  hasLightweight: boolean
  hasNoBloated: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasNoDeadCode: boolean
  hasNoFiller: boolean
  hasEssential: boolean
  hasNoBoilerplate: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasMinimal: boolean
  bloatedCount: number
  fillerCount: number
}

export interface HauntingMeasure {
  handling: number
  ghost: Ghost
  hasHighHandling: boolean
  hasNullSafe: boolean
  hasNoNPE: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasEdgeCaseCovered: boolean
  hasNoSinglePath: boolean
  hasBoundaryChecked: boolean
  hasNoAssumed: boolean
  hasValidated: boolean
  hasNoTrusting: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  npeCount: number
  bareCrashCount: number
}

export interface RevealingMeasure {
  clarity: number
  mist: Mist
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasIlluminated: boolean
  hasNoDark: boolean
  hasObvious: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface GroundingMeasure {
  depth: number
  root: Root
  hasHighDepth: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasStable: boolean
  untestedCount: number
  undocumentedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  shadow: Shadow
  hasHighWisdom: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasDefensive: boolean
  hasNoOptimistic: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasBattleTested: boolean
  hasNoUnproven: boolean
  hasEstablished: boolean
  hasWellArchitected: boolean
  adHocCount: number
  optimisticCount: number
}

export interface PhantomTree {
  file: string
  etherealQuality: number
  ghostHandling: number
  mistClarity: number
  rootDepth: number
  shadowWisdom: number
  drifting: DriftingMeasure
  haunting: HauntingMeasure
  revealing: RevealingMeasure
  grounding: GroundingMeasure
  knowing: KnowingMeasure
  condition: PhantomCondition
  qualityScore: number
}

export interface PhantomClearing {
  directory: string
  trees: PhantomTree[]
  avgQuality: number
  avgHandling: number
  avgWisdom: number
  phantomMasterpieceCount: number
  voidCount: number
  clearingType: ClearingType
  condition: ClearingCondition
}

export interface PhantomGroveResult {
  trees: PhantomTree[]
  clearings: PhantomClearing[]
  forest: {
    avgQuality: number
    avgHandling: number
    avgWisdom: number
    isPhantom: boolean
    overallEtherealness: number
  }
  stats: {
    totalFiles: number
    totalClearings: number
    avgEtherealQuality: number
    avgGhostHandling: number
    avgMistClarity: number
    avgRootDepth: number
    avgShadowWisdom: number
    phantomMasterpieceCount: number
    etherealGroveCount: number
    properForestCount: number
    foggyWoodsCount: number
    deadTreesCount: number
    voidCount: number
    hasHighQualityCount: number
    hasHighHandlingCount: number
    hasHighClarityCount: number
    hasHighDepthCount: number
    hasHighWisdomCount: number
    overallEtherealness: number
    rangerGrade: RangerGrade
    bestTree: string
    mostEthereal: string
    bestGhostHunter: string
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

// ─── measureDrifting ───────────────────────────────────────────────

/**
 * @example measureDrifting('export const pipe = (x: T) => x')
 */
export function measureDrifting(content: string): DriftingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasConsole = countPattern(content, /\bconsole\.\w+\(/)

  if (hasExport) score += 6
  if (hasConst) score += 6
  if (hasArrow) score += 4
  if (hasReturnType) score += 6
  if (hasGenerics) score += 6
  if (hasNamed) score += 4
  if (hasPipeline) score += 4
  if (hasOptional) score += 4
  if (hasReadonly) score += 4
  if (hasTypeAnnotation) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4
  if (hasConsole > 0) score -= Math.min(hasConsole * 2, 6)

  const quality = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const bloatedCount = (hasConsole > 0 ? 1 : 0) + (hasVar > 0 ? 1 : 0)
  const fillerCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    quality,
    spirit: classifySpirit(quality),
    hasHighQuality: quality >= 80,
    hasLightweight: hasArrow && hasConst,
    hasNoBloated: hasConsole === 0,
    hasEfficient: hasPipeline && hasArrow,
    hasNoWasteful: hasConsole === 0 && hasVar === 0,
    hasElegant: hasReturnType && hasGenerics,
    hasNoClunky: !hasEval && hasVar === 0,
    hasNoDeadCode: !hasDebugger,
    hasNoFiller: !hasEval && !hasDebugger,
    hasEssential: hasNamed && !hasAny,
    hasNoBoilerplate: hasVar === 0,
    hasStreamlined: hasPipeline && !hasAny,
    hasNoCircuits: !hasEval,
    hasMinimal: hasConst && hasArrow && !hasAny,
    bloatedCount,
    fillerCount,
  }
}

// ─── measureHaunting ───────────────────────────────────────────────

/**
 * @example measureHaunting('try { const x = parse(d) } catch { return null }')
 */
export function measureHaunting(content: string): HauntingMeasure {
  let score = 0

  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNullCheck = hasPattern(content, /===\s*null|!==\s*null|===\s*undefined|!==\s*undefined|\?\s*\./)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasAsync = hasPattern(content, /\basync\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasTryCatch) score += 8
  if (hasOptional) score += 8
  if (hasReturnType) score += 6
  if (hasTypeAnnotation) score += 4
  if (hasConst) score += 4
  if (hasExport) score += 4
  if (hasNullCheck) score += 6
  if (hasGenerics) score += 4
  if (hasInterface) score += 4
  if (hasPrivate) score += 4
  if (hasReadonly) score += 4
  if (hasAsync) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 6

  const handling = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const npeCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    handling,
    ghost: classifyGhost(handling),
    hasHighHandling: handling >= 80,
    hasNullSafe: hasOptional && hasReturnType,
    hasNoNPE: hasOptional && hasReadonly,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: !hasEval && !hasDebugger,
    hasEdgeCaseCovered: hasOptional && hasTryCatch,
    hasNoSinglePath: hasVar === 0,
    hasBoundaryChecked: hasTypeAnnotation && hasOptional,
    hasNoAssumed: !hasEval && !hasAny,
    hasValidated: hasTypeAnnotation && hasReturnType,
    hasNoTrusting: !hasAny,
    hasGraceful: hasOptional && hasTryCatch,
    hasNoHarshFail: !hasEval,
    hasRecoverable: hasTryCatch || hasAsync,
    hasNoFatal: !hasEval && !hasDebugger,
    npeCount,
    bareCrashCount,
  }
}

// ─── measureRevealing ──────────────────────────────────────────────

/**
 * @example measureRevealing('export function calculateTotal(items: Item[]): Number')
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasGenerics = hasPattern(content, /<\w+/)

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
  if (hasNamed) score += 4
  if (hasReadonly) score += 4
  if (hasEnum) score += 4
  if (hasGenerics) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const clarity = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const crypticCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const obfuscatedCount = (hasVar > 0 ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    clarity,
    mist: classifyMist(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasReturnType && hasNamed,
    hasSelfDocumenting: hasReturnType && hasNamed,
    hasNoCryptic: !hasEval && !hasAny,
    hasClear: hasReturnType && !hasAny,
    hasNoObfuscated: !hasEval && !hasAny,
    hasUnderstandable: hasTypeAnnotation && hasConst,
    hasNoArcane: !hasEval && !hasAny,
    hasTransparent: hasExport && !hasAny,
    hasNoHidden: !hasEval,
    hasVisible: hasExport,
    hasNoInvisible: !hasDebugger,
    hasIlluminated: hasDoc && hasExport && !hasAny,
    hasNoDark: !hasEval && !hasDebugger,
    hasObvious: hasReturnType && hasReadonly,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measureGrounding ──────────────────────────────────────────────

/**
 * @example measureGrounding('export interface Store<T> extends Base { get(key: string): T }')
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasAbstract = hasPattern(content, /\babstract\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasExport) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasClass) score += 4
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4
  if (hasConst) score += 4
  if (hasDoc) score += 4
  if (hasGenerics) score += 4
  if (hasAbstract) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasDebugger) score -= 4

  const depth = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const undocumentedCount = hasVar > 0 ? 1 : 0

  return {
    depth,
    root: classifyRoot(depth),
    hasHighDepth: depth >= 80,
    hasTested: hasTryCatch,
    hasNoUntested: hasVar === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: hasVar === 0 && !hasAny,
    hasWellStructured: hasInterface && hasExport,
    hasNoChaotic: hasVar === 0 && !hasEval,
    hasModular: hasExport && (hasInterface || hasType),
    hasNoMonolithic: !hasEval,
    hasDocumented: hasDoc,
    hasNoUndocumented: hasVar === 0,
    hasLayered: hasExtends || hasImplements,
    hasNoFlat: hasInterface || hasClass,
    hasStable: hasExport && hasConst && !hasAny,
    untestedCount,
    undocumentedCount,
  }
}

// ─── measureKnowing ────────────────────────────────────────────────

/**
 * @example measureKnowing('/** docs *\\/ export class Store extends Base implements IStore {}')
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasClass = hasPattern(content, /\bclass\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasDoc) score += 6
  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 4
  if (hasTryCatch) score += 4
  if (hasReturnType) score += 4
  if (hasPrivate) score += 4
  if (hasOptional) score += 4
  if (hasGenerics) score += 4
  if (hasClass) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 4
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)

  const wisdom = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const optimisticCount = (hasVar > 0 ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)

  return {
    wisdom,
    shadow: classifyShadow(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasPrincipled: hasAbstract || hasExtends,
    hasNoAdHoc: hasVar === 0,
    hasPatterned: hasExtends || hasImplements,
    hasNoReinvented: !hasEval,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasEval && !hasAny,
    hasDefensive: hasTryCatch && hasReturnType,
    hasNoOptimistic: hasVar === 0 && hasHackyCast === 0,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: !hasAny,
    hasBattleTested: hasTryCatch && hasExport && !hasAny,
    hasNoUnproven: !hasEval && !hasAny,
    hasEstablished: hasExtends && hasImplements,
    hasWellArchitected: hasInterface && hasExtends && !hasAny,
    adHocCount,
    optimisticCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifySpirit(quality: number): Spirit {
  if (quality >= 90) return 'pure-phantom'
  if (quality >= 75) return 'light-spirit'
  if (quality >= 60) return 'proper-ghost'
  if (quality >= 40) return 'heavy-specter'
  if (quality >= 20) return 'solid-rock'
  return 'no-spirit'
}

function classifyGhost(handling: number): Ghost {
  if (handling >= 90) return 'exorcist'
  if (handling >= 75) return 'ghost-hunter'
  if (handling >= 60) return 'proper-medium'
  if (handling >= 40) return 'fearful-mortal'
  if (handling >= 20) return 'possessed'
  return 'no-handling'
}

function classifyMist(clarity: number): Mist {
  if (clarity >= 90) return 'revealing-mist'
  if (clarity >= 75) return 'clear-fog'
  if (clarity >= 60) return 'proper-haze'
  if (clarity >= 40) return 'obscuring-fog'
  if (clarity >= 20) return 'dark-smog'
  return 'no-clarity'
}

function classifyRoot(depth: number): Root {
  if (depth >= 90) return 'deep-taproot'
  if (depth >= 75) return 'strong-roots'
  if (depth >= 60) return 'proper-foundation'
  if (depth >= 40) return 'shallow-roots'
  if (depth >= 20) return 'surface-root'
  return 'no-root'
}

function classifyShadow(wisdom: number): Shadow {
  if (wisdom >= 90) return 'shadow-sage'
  if (wisdom >= 75) return 'dark-scholar'
  if (wisdom >= 60) return 'proper-observer'
  if (wisdom >= 40) return 'daylight-thinker'
  if (wisdom >= 20) return 'blind-wanderer'
  return 'no-wisdom'
}

export function classifyPhantomCondition(qualityScore: number): PhantomCondition {
  if (qualityScore >= 90) return 'phantom-masterpiece'
  if (qualityScore >= 75) return 'ethereal-grove'
  if (qualityScore >= 60) return 'proper-forest'
  if (qualityScore >= 40) return 'foggy-woods'
  if (qualityScore >= 20) return 'dead-trees'
  return 'void'
}

export function classifyClearingType(trees: PhantomTree[]): ClearingType {
  if (trees.length === 0) return 'no-clearing'
  const avgQs = trees.reduce((s, t) => s + t.qualityScore, 0) / trees.length
  const masterpieceRatio = trees.filter(t => t.condition === 'phantom-masterpiece').length / trees.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'enchanted-grove'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'mystical-clearing'
  if (avgQs >= 55) return 'proper-glade'
  if (avgQs >= 35) return 'small-thicket'
  if (avgQs >= 15) return 'bare-patch'
  return 'no-clearing'
}

export function classifyClearingCondition(avgQuality: number): ClearingCondition {
  if (avgQuality >= 85) return 'phantom-paradise'
  if (avgQuality >= 70) return 'mystical-forest'
  if (avgQuality >= 55) return 'proper-grove'
  if (avgQuality >= 35) return 'foggy-woods'
  if (avgQuality >= 15) return 'dead-forest'
  return 'void'
}

export function classifyRangerGrade(avgEtherealness: number): RangerGrade {
  if (avgEtherealness >= 85) return 'phantom-ranger'
  if (avgEtherealness >= 70) return 'mystic-guide'
  if (avgEtherealness >= 55) return 'forest-warden'
  if (avgEtherealness >= 40) return 'apprentice'
  if (avgEtherealness >= 20) return 'novice'
  return 'lost-soul'
}

// ─── analyzePhantomTree ────────────────────────────────────────────

/**
 * @example analyzePhantomTree(content, 'src/foo.ts')
 */
export function analyzePhantomTree(content: string, filePath: string): PhantomTree {
  const drifting = measureDrifting(content)
  const haunting = measureHaunting(content)
  const revealing = measureRevealing(content)
  const grounding = measureGrounding(content)
  const knowing = measureKnowing(content)

  const etherealQuality = drifting.quality
  const ghostHandling = haunting.handling
  const mistClarity = revealing.clarity
  const rootDepth = grounding.depth
  const shadowWisdom = knowing.wisdom

  const qualityScore = Math.round(
    etherealQuality * 0.2 +
    ghostHandling * 0.2 +
    mistClarity * 0.2 +
    rootDepth * 0.2 +
    shadowWisdom * 0.2,
  )

  return {
    file: filePath,
    etherealQuality,
    ghostHandling,
    mistClarity,
    rootDepth,
    shadowWisdom,
    drifting,
    haunting,
    revealing,
    grounding,
    knowing,
    condition: classifyPhantomCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzePhantomClearing ────────────────────────────────────────

/**
 * @example analyzePhantomClearing(trees, 'src')
 */
export function analyzePhantomClearing(trees: PhantomTree[], dirPath: string): PhantomClearing {
  if (trees.length === 0) {
    return {
      directory: dirPath,
      trees: [],
      avgQuality: 0,
      avgHandling: 0,
      avgWisdom: 0,
      phantomMasterpieceCount: 0,
      voidCount: 0,
      clearingType: 'no-clearing',
      condition: 'void',
    }
  }

  const avgQuality = Math.round(trees.reduce((s, t) => s + t.etherealQuality, 0) / trees.length)
  const avgHandling = Math.round(trees.reduce((s, t) => s + t.ghostHandling, 0) / trees.length)
  const avgWisdom = Math.round(trees.reduce((s, t) => s + t.shadowWisdom, 0) / trees.length)
  const phantomMasterpieceCount = trees.filter(t => t.condition === 'phantom-masterpiece').length
  const voidCount = trees.filter(t => t.condition === 'void').length

  return {
    directory: dirPath,
    trees,
    avgQuality,
    avgHandling,
    avgWisdom,
    phantomMasterpieceCount,
    voidCount,
    clearingType: classifyClearingType(trees),
    condition: classifyClearingCondition(avgQuality),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(trees, clearings, forest, stats)
 */
export function generateRecommendations(
  trees: PhantomTree[],
  clearings: PhantomClearing[],
  _forest: PhantomGroveResult['forest'],
  stats: PhantomGroveResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallEtherealness >= 85 && stats.voidCount === 0) {
    recs.push('Phantom grove perfection — the forest glows with ethereal light')
    return recs
  }

  if (stats.avgEtherealQuality < 60) {
    recs.push('Lighten the code — add arrow functions, generics, pipelines, remove console and eval')
  }
  if (stats.avgGhostHandling < 60) {
    recs.push('Handle the ghosts — add try-catch, optional params, null checks, remove eval and debugger')
  }
  if (stats.avgMistClarity < 60) {
    recs.push('Clear the mist — add return types, named exports, docs, remove eval and any')
  }
  if (stats.avgRootDepth < 60) {
    recs.push('Deepen the roots — add interfaces, abstractions, layering, remove eval and var')
  }
  if (stats.avgShadowWisdom < 60) {
    recs.push('Learn from shadows — add proven patterns, abstractions, documentation, remove eval and any')
  }

  if (stats.voidCount > 0) {
    const voidFiles = trees.filter(t => t.condition === 'void').map(t => t.file)
    if (voidFiles.length <= 3) {
      recs.push(`Void detected: ${voidFiles.join(', ')} — these need phantom energy`)
    } else {
      recs.push(`${voidFiles.length} void files detected — they need phantom energy`)
    }
  }

  if (clearings.length > 1) {
    const deadClearings = clearings.filter(c => c.condition === 'foggy-woods' || c.condition === 'dead-forest')
    if (deadClearings.length > 0) {
      recs.push(`${deadClearings.length} clearing(s) have foggy or dead conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The phantom grove holds steady — maintain current etherealness')
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

// ─── buildPhantomGroveResult ───────────────────────────────────────

/**
 * @example buildPhantomGroveResult(['a.ts'], [content])
 */
export async function buildPhantomGroveResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomGroveResult> {
  const trees: PhantomTree[] = files.map((file, i) =>
    analyzePhantomTree(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PhantomTree[]>()
  for (const tree of trees) {
    const dir = path.dirname(tree.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(tree)
    } else {
      dirMap.set(dir, [tree])
    }
  }

  const clearings: PhantomClearing[] = Array.from(dirMap.entries()).map(([dir, dirTrees]) =>
    analyzePhantomClearing(dirTrees, dir),
  )

  const avgEtherealQuality = trees.length > 0
    ? Math.round(trees.reduce((s, t) => s + t.etherealQuality, 0) / trees.length)
    : 0
  const avgGhostHandling = trees.length > 0
    ? Math.round(trees.reduce((s, t) => s + t.ghostHandling, 0) / trees.length)
    : 0
  const avgMistClarity = trees.length > 0
    ? Math.round(trees.reduce((s, t) => s + t.mistClarity, 0) / trees.length)
    : 0
  const avgRootDepth = trees.length > 0
    ? Math.round(trees.reduce((s, t) => s + t.rootDepth, 0) / trees.length)
    : 0
  const avgShadowWisdom = trees.length > 0
    ? Math.round(trees.reduce((s, t) => s + t.shadowWisdom, 0) / trees.length)
    : 0

  const overallEtherealness = Math.round(
    (avgEtherealQuality + avgGhostHandling + avgMistClarity) / 3,
  )

  const forest = {
    avgQuality: avgEtherealQuality,
    avgHandling: avgGhostHandling,
    avgWisdom: avgShadowWisdom,
    isPhantom: overallEtherealness >= 80,
    overallEtherealness,
  }

  const bestTree = trees.length > 0
    ? trees.reduce((best, t) => t.qualityScore > best.qualityScore ? t : best).file
    : ''
  const mostEthereal = trees.length > 0
    ? trees.reduce((best, t) => t.etherealQuality > best.etherealQuality ? t : best).file
    : ''
  const bestGhostHunter = trees.length > 0
    ? trees.reduce((best, t) => t.ghostHandling > best.ghostHandling ? t : best).file
    : ''
  const clearest = trees.length > 0
    ? trees.reduce((best, t) => t.mistClarity > best.mistClarity ? t : best).file
    : ''
  const wisest = trees.length > 0
    ? trees.reduce((best, t) => t.shadowWisdom > best.shadowWisdom ? t : best).file
    : ''

  const stats = {
    totalFiles: trees.length,
    totalClearings: clearings.length,
    avgEtherealQuality,
    avgGhostHandling,
    avgMistClarity,
    avgRootDepth,
    avgShadowWisdom,
    phantomMasterpieceCount: trees.filter(t => t.condition === 'phantom-masterpiece').length,
    etherealGroveCount: trees.filter(t => t.condition === 'ethereal-grove').length,
    properForestCount: trees.filter(t => t.condition === 'proper-forest').length,
    foggyWoodsCount: trees.filter(t => t.condition === 'foggy-woods').length,
    deadTreesCount: trees.filter(t => t.condition === 'dead-trees').length,
    voidCount: trees.filter(t => t.condition === 'void').length,
    hasHighQualityCount: trees.filter(t => t.drifting.hasHighQuality).length,
    hasHighHandlingCount: trees.filter(t => t.haunting.hasHighHandling).length,
    hasHighClarityCount: trees.filter(t => t.revealing.hasHighClarity).length,
    hasHighDepthCount: trees.filter(t => t.grounding.hasHighDepth).length,
    hasHighWisdomCount: trees.filter(t => t.knowing.hasHighWisdom).length,
    overallEtherealness,
    rangerGrade: classifyRangerGrade(overallEtherealness),
    bestTree,
    mostEthereal,
    bestGhostHunter,
    clearest,
    wisest,
  }

  const recommendations = generateRecommendations(trees, clearings, forest, { ...stats, recommendations: [] } as PhantomGroveResult['stats'])

  return {
    trees,
    clearings,
    forest,
    stats,
    recommendations,
  }
}
