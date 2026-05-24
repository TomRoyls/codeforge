// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ArchGrade = 'silver-arch' | 'elegant-portal' | 'proper-entrance' | 'rough-doorway' | 'hole-in-wall' | 'no-arch'
export type ThresholdGrade = 'silver-shield' | 'proper-guard' | 'decent-check' | 'weak-barrier' | 'no-barrier' | 'no-guard'
export type MoonlitGrade = 'silver-path' | 'smooth-crossing' | 'proper-passage' | 'rough-crossing' | 'blocked-path' | 'no-passage'
export type ReflectionGrade = 'perfect-mirror' | 'clear-reflection' | 'proper-silver' | 'tarnished-mirror' | 'dull-metal' | 'no-reflection'
export type DawnGrade = 'golden-sunrise' | 'smooth-transition' | 'proper-change' | 'abrupt-switch' | 'jarring-change' | 'no-transition'
export type ArchCondition = 'silver-masterpiece' | 'moonlit-portal' | 'proper-arch' | 'iron-gate' | 'wooden-door' | 'gap'
export type HallType = 'silver-palace' | 'moonlit-hall' | 'proper-corridor' | 'dim-passageway' | 'dark-tunnel' | 'no-hall'
export type HallCondition = 'palace-of-silver' | 'moonlit-gallery' | 'decent-hallway' | 'dim-corridor' | 'dark-passage' | 'void'
export type GuardianGrade = 'silver-guardian' | 'palace-keeper' | 'skilled-doorkeeper' | 'apprentice' | 'novice' | 'gate-crasher'

export interface ArchingMeasure {
  elegance: number
  grade: ArchGrade
  hasHighElegance: boolean
  hasCleanInterface: boolean
  hasWellDesignedAPI: boolean
  hasNoClunky: boolean
  hasBeautiful: boolean
  hasNoUgly: boolean
  hasIntuitive: boolean
  hasNoCounterintuitive: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasGraceful: boolean
  clunkyCount: number
  uglyCount: number
}

export interface GuardingMeasure {
  security: number
  threshold: ThresholdGrade
  hasHighSecurity: boolean
  hasInputValidation: boolean
  hasTypeChecking: boolean
  hasNoCasting: boolean
  hasBoundaryChecks: boolean
  hasNoUnchecked: boolean
  hasNullGuards: boolean
  hasNoAssumption: boolean
  hasSanitized: boolean
  hasNoRawInput: boolean
  hasValidated: boolean
  castingCount: number
  uncheckedCount: number
}

export interface FlowingMeasure {
  passage: number
  moonlit: MoonlitGrade
  hasHighPassage: boolean
  hasSmoothFlow: boolean
  hasGracefulTransition: boolean
  hasNoJarring: boolean
  hasSeamless: boolean
  hasNoAbrupt: boolean
  hasProgressive: boolean
  hasNoAllAtOnce: boolean
  hasFlowing: boolean
  hasNoJerky: boolean
  hasGentle: boolean
  jarringCount: number
  abruptCount: number
}

export interface ReflectingMeasure {
  reflection: number
  silver: ReflectionGrade
  hasHighReflection: boolean
  hasSelfDocumenting: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasDescriptive: boolean
  hasNoVague: boolean
  hasReadable: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoHidden: boolean
  hasTransparent: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface TransitioningMeasure {
  transition: number
  dawn: DawnGrade
  hasHighTransition: boolean
  hasStateManaged: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasOrdered: boolean
  hasNoChaotic: boolean
  hasControlled: boolean
  mutableCount: number
  inconsistentCount: number
}

export interface SilverArch {
  file: string
  boundaryElegance: number
  thresholdSecurity: number
  moonlitPassage: number
  silverReflection: number
  dawnTransition: number
  arching: ArchingMeasure
  guarding: GuardingMeasure
  flowing: FlowingMeasure
  reflecting: ReflectingMeasure
  transitioning: TransitioningMeasure
  condition: ArchCondition
  qualityScore: number
}

export interface SilverHall {
  directory: string
  arches: SilverArch[]
  avgElegance: number
  avgSecurity: number
  avgReflection: number
  silverMasterpieceCount: number
  gapCount: number
  hallType: HallType
  condition: HallCondition
}

export interface SilverPalace {
  avgElegance: number
  avgSecurity: number
  avgReflection: number
  isLuminous: boolean
  overallRadiance: number
}

export interface SilverThresholdStats {
  totalFiles: number
  totalHalls: number
  avgBoundaryElegance: number
  avgThresholdSecurity: number
  avgMoonlitPassage: number
  avgSilverReflection: number
  avgDawnTransition: number
  silverMasterpieceCount: number
  moonlitPortalCount: number
  properArchCount: number
  ironGateCount: number
  woodenDoorCount: number
  gapCount: number
  hasHighEleganceCount: number
  hasHighSecurityCount: number
  hasHighPassageCount: number
  hasHighReflectionCount: number
  hasHighTransitionCount: number
  overallRadiance: number
  guardianGrade: GuardianGrade
  bestArch: string
  mostElegant: string
  mostSecure: string
  smoothestPassage: string
  clearest: string
}

export interface SilverThresholdResult {
  arches: SilverArch[]
  halls: SilverHall[]
  palace: SilverPalace
  stats: SilverThresholdStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure boundary elegance (interface design beauty)
 * @example
 * const m = measureArching(content)
 * console.log(m.grade) // 'silver-arch'
 */
export function measureArching(content: string): ArchingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0

  const hasCleanInterface = hasInterface(content) && hasTypeAlias(content)
  const hasWellDesignedAPI = hasExport(content) && hasNamedExport(content)
  const hasBeautiful = hasReturnType(content) && hasGenerics(content)
  const hasIntuitive = hasOptional(content) && hasReadonly(content)
  const hasApproachable = hasDocComments(content) && hasEnum(content)
  const hasGraceful = hasPrivate(content) && hasUnionType(content)

  score += hasCleanInterface ? 5 : 0
  score += hasWellDesignedAPI ? 5 : 0
  score += hasBeautiful ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasGraceful ? 5 : 0

  const elegance = Math.min(score, 100)
  const clunkyCount = countMatches(/\bvar\b/, content)
  const uglyCount = countMatches(/\bany\b/, content)

  const hasNoClunky = clunkyCount === 0
  const hasNoUgly = uglyCount === 0
  const hasNoCounterintuitive = !has(/\beval\b/, content)
  const hasNoHostile = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let grade: ArchGrade
  if (elegance >= 85) grade = 'silver-arch'
  else if (elegance >= 70) grade = 'elegant-portal'
  else if (elegance >= 55) grade = 'proper-entrance'
  else if (elegance >= 40) grade = 'rough-doorway'
  else if (elegance >= 25) grade = 'hole-in-wall'
  else grade = 'no-arch'

  return {
    elegance, grade, hasHighElegance, hasCleanInterface, hasWellDesignedAPI,
    hasNoClunky, hasBeautiful, hasNoUgly, hasIntuitive, hasNoCounterintuitive,
    hasApproachable, hasNoHostile, hasGraceful, clunkyCount, uglyCount,
  }
}

/**
 * Measure threshold security (boundary validation)
 * @example
 * const m = measureGuarding(content)
 * console.log(m.threshold) // 'silver-shield'
 */
export function measureGuarding(content: string): GuardingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasConditional(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasInputValidation = hasStrictEq(content) && hasConditional(content)
  const hasTypeChecking = hasTryCatch(content) && hasThrow(content)
  const hasBoundaryChecks = hasNullishCoalescing(content) && hasReturnType(content)
  const hasNullGuards = hasInterface(content) && hasOptional(content)
  const hasSanitized = hasConst(content) && hasReadonly(content)
  const hasValidated = hasEnum(content) && hasPrivate(content)

  score += hasInputValidation ? 5 : 0
  score += hasTypeChecking ? 5 : 0
  score += hasBoundaryChecks ? 5 : 0
  score += hasNullGuards ? 5 : 0
  score += hasSanitized ? 5 : 0
  score += hasValidated ? 5 : 0

  const security = Math.min(score, 100)
  const castingCount = countMatches(/\bvar\b/, content)
  const uncheckedCount = countMatches(/\bany\b/, content)

  const hasNoCasting = castingCount === 0
  const hasNoUnchecked = uncheckedCount === 0
  const hasNoAssumption = !has(/\beval\b/, content)
  const hasNoRawInput = !has(/\bdebugger\b/, content)
  const hasHighSecurity = security >= 70

  let threshold: ThresholdGrade
  if (security >= 85) threshold = 'silver-shield'
  else if (security >= 70) threshold = 'proper-guard'
  else if (security >= 55) threshold = 'decent-check'
  else if (security >= 40) threshold = 'weak-barrier'
  else if (security >= 25) threshold = 'no-barrier'
  else threshold = 'no-guard'

  return {
    security, threshold, hasHighSecurity, hasInputValidation, hasTypeChecking,
    hasNoCasting, hasBoundaryChecks, hasNoUnchecked, hasNullGuards, hasNoAssumption,
    hasSanitized, hasNoRawInput, hasValidated, castingCount, uncheckedCount,
  }
}

/**
 * Measure moonlit passage (smooth transitions)
 * @example
 * const m = measureFlowing(content)
 * console.log(m.moonlit) // 'silver-path'
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0

  const hasSmoothFlow = hasTryCatch(content) && hasAsync(content)
  const hasGracefulTransition = hasNullishCoalescing(content) && hasDefaultParam(content)
  const hasSeamless = hasOptional(content) && hasArrowFunction(content)
  const hasProgressive = hasMapFunction(content) && hasImport(content)
  const hasFlowing = hasExport(content) && hasConst(content)
  const hasGentle = hasReturnType(content) && hasInterface(content)

  score += hasSmoothFlow ? 5 : 0
  score += hasGracefulTransition ? 5 : 0
  score += hasSeamless ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasGentle ? 5 : 0

  const passage = Math.min(score, 100)
  const jarringCount = countMatches(/\bvar\b/, content)
  const abruptCount = countMatches(/\bany\b/, content)

  const hasNoJarring = jarringCount === 0
  const hasNoAbrupt = abruptCount === 0
  const hasNoAllAtOnce = !has(/\beval\b/, content)
  const hasNoJerky = !has(/\bdebugger\b/, content)
  const hasHighPassage = passage >= 70

  let moonlit: MoonlitGrade
  if (passage >= 85) moonlit = 'silver-path'
  else if (passage >= 70) moonlit = 'smooth-crossing'
  else if (passage >= 55) moonlit = 'proper-passage'
  else if (passage >= 40) moonlit = 'rough-crossing'
  else if (passage >= 25) moonlit = 'blocked-path'
  else moonlit = 'no-passage'

  return {
    passage, moonlit, hasHighPassage, hasSmoothFlow, hasGracefulTransition,
    hasNoJarring, hasSeamless, hasNoAbrupt, hasProgressive, hasNoAllAtOnce,
    hasFlowing, hasNoJerky, hasGentle, jarringCount, abruptCount,
  }
}

/**
 * Measure silver reflection (self-documenting quality)
 * @example
 * const m = measureReflecting(content)
 * console.log(m.silver) // 'perfect-mirror'
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasSelfDocumenting = hasDocComments(content) && hasExport(content)
  const hasWellNamed = hasReturnType(content) && hasInterface(content)
  const hasDescriptive = hasNamedExport(content) && hasTypeAlias(content)
  const hasReadable = hasGenerics(content) && hasConst(content)
  const hasClear = hasImport(content) && hasStrictEq(content)
  const hasTransparent = hasEnum(content) && hasAsync(content)

  score += hasSelfDocumenting ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasTransparent ? 5 : 0

  const reflection = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const obfuscatedCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoVague = obfuscatedCount === 0
  const hasNoObfuscated = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighReflection = reflection >= 70

  let silver: ReflectionGrade
  if (reflection >= 85) silver = 'perfect-mirror'
  else if (reflection >= 70) silver = 'clear-reflection'
  else if (reflection >= 55) silver = 'proper-silver'
  else if (reflection >= 40) silver = 'tarnished-mirror'
  else if (reflection >= 25) silver = 'dull-metal'
  else silver = 'no-reflection'

  return {
    reflection, silver, hasHighReflection, hasSelfDocumenting, hasWellNamed,
    hasNoCryptic, hasDescriptive, hasNoVague, hasReadable, hasNoObfuscated,
    hasClear, hasNoHidden, hasTransparent, crypticCount, obfuscatedCount,
  }
}

/**
 * Measure dawn transition (state changes handling)
 * @example
 * const m = measureTransitioning(content)
 * console.log(m.dawn) // 'golden-sunrise'
 */
export function measureTransitioning(content: string): TransitioningMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0

  const hasStateManaged = hasConst(content) && hasReadonly(content)
  const hasImmutable = hasEnum(content) && hasPrivate(content)
  const hasConsistent = hasInterface(content) && hasExport(content)
  const hasPredictable = hasTypeAlias(content) && hasReturnType(content)
  const hasOrdered = hasStrictEq(content) && hasOptional(content)
  const hasControlled = hasGenerics(content) && hasNamedExport(content)

  score += hasStateManaged ? 5 : 0
  score += hasImmutable ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasControlled ? 5 : 0

  const transition = Math.min(score, 100)
  const mutableCount = countMatches(/\bvar\b/, content)
  const inconsistentCount = countMatches(/\bany\b/, content)

  const hasNoMutable = mutableCount === 0
  const hasNoInconsistent = inconsistentCount === 0
  const hasNoSurprising = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighTransition = transition >= 70

  let dawn: DawnGrade
  if (transition >= 85) dawn = 'golden-sunrise'
  else if (transition >= 70) dawn = 'smooth-transition'
  else if (transition >= 55) dawn = 'proper-change'
  else if (transition >= 40) dawn = 'abrupt-switch'
  else if (transition >= 25) dawn = 'jarring-change'
  else dawn = 'no-transition'

  return {
    transition, dawn, hasHighTransition, hasStateManaged, hasImmutable,
    hasNoMutable, hasConsistent, hasNoInconsistent, hasPredictable, hasNoSurprising,
    hasOrdered, hasNoChaotic, hasControlled, mutableCount, inconsistentCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify arch condition
 * @example
 * classifyArchCondition(90) // 'silver-masterpiece'
 */
export function classifyArchCondition(score: number): ArchCondition {
  if (score >= 85) return 'silver-masterpiece'
  if (score >= 70) return 'moonlit-portal'
  if (score >= 55) return 'proper-arch'
  if (score >= 40) return 'iron-gate'
  if (score >= 25) return 'wooden-door'
  return 'gap'
}

/**
 * Classify hall type
 * @example
 * classifyHallType(arches) // 'silver-palace'
 */
export function classifyHallType(arches: SilverArch[]): HallType {
  if (arches.length === 0) return 'no-hall'
  const avgQs = Math.round(arches.reduce((s, a) => s + a.qualityScore, 0) / arches.length)
  const masterpieceRatio = arches.filter(a => a.condition === 'silver-masterpiece').length / arches.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'silver-palace'
  if (avgQs >= 60) return 'moonlit-hall'
  if (avgQs >= 45) return 'proper-corridor'
  if (avgQs >= 30) return 'dim-passageway'
  if (avgQs >= 15) return 'dark-tunnel'
  return 'no-hall'
}

/**
 * Classify hall condition
 * @example
 * classifyHallCondition(80) // 'palace-of-silver'
 */
export function classifyHallCondition(avgQs: number): HallCondition {
  if (avgQs >= 75) return 'palace-of-silver'
  if (avgQs >= 60) return 'moonlit-gallery'
  if (avgQs >= 45) return 'decent-hallway'
  if (avgQs >= 30) return 'dim-corridor'
  if (avgQs >= 15) return 'dark-passage'
  return 'void'
}

/**
 * Classify guardian grade
 * @example
 * classifyGuardianGrade(85) // 'silver-guardian'
 */
export function classifyGuardianGrade(avgRadiance: number): GuardianGrade {
  if (avgRadiance >= 80) return 'silver-guardian'
  if (avgRadiance >= 65) return 'palace-keeper'
  if (avgRadiance >= 50) return 'skilled-doorkeeper'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'gate-crasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(arches, halls, palace, stats)
 */
export function generateRecommendations(
  arches: SilverArch[],
  halls: SilverHall[],
  palace: SilverPalace,
  stats: SilverThresholdStats,
): string[] {
  const recs: string[] = []
  if (stats.avgBoundaryElegance < 50) {
    recs.push('Enhance boundary elegance with clean interfaces, well-designed APIs, and intuitive type designs')
  }
  if (stats.avgThresholdSecurity < 50) {
    recs.push('Strengthen threshold security with input validation, boundary checks, and null guards')
  }
  if (stats.avgMoonlitPassage < 50) {
    recs.push('Smooth moonlit passages with graceful transitions, progressive flows, and seamless error handling')
  }
  if (stats.avgSilverReflection < 50) {
    recs.push('Polish silver reflections with self-documenting code, descriptive names, and clear structure')
  }
  if (stats.avgDawnTransition < 50) {
    recs.push('Improve dawn transitions with immutable state, consistent patterns, and predictable changes')
  }
  if (stats.gapCount > 0) {
    recs.push(`${stats.gapCount} file(s) are gaps — they need complete silver threshold construction`)
  }
  if (palace.overallRadiance < 40) {
    recs.push('Overall radiance is dim — focus on boundary elegance and threshold security first')
  }
  const allDark = halls.every(h => h.hallType === 'no-hall' || h.hallType === 'dark-tunnel')
  if (allDark && halls.length > 0) {
    recs.push('All halls are dark — consider a major silver threshold reconstruction')
  }
  const gapFiles = arches.filter(a => a.condition === 'gap').map(a => a.file)
  if (gapFiles.length > 0 && gapFiles.length <= 3) {
    recs.push(`Seal these gaps: ${gapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your silver threshold shines with luminous perfection! Every arch reflects masterful elegance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as silver arch
 * @example
 * const a = analyzeSilverArch(content, 'index.ts')
 * console.log(a.condition) // 'silver-masterpiece'
 */
export function analyzeSilverArch(content: string, filePath: string): SilverArch {
  const arching = measureArching(content)
  const guarding = measureGuarding(content)
  const flowing = measureFlowing(content)
  const reflecting = measureReflecting(content)
  const transitioning = measureTransitioning(content)

  const qualityScore = Math.round(
    arching.elegance * 0.2 +
    guarding.security * 0.2 +
    flowing.passage * 0.2 +
    reflecting.reflection * 0.2 +
    transitioning.transition * 0.2,
  )

  return {
    file: filePath,
    boundaryElegance: arching.elegance,
    thresholdSecurity: guarding.security,
    moonlitPassage: flowing.passage,
    silverReflection: reflecting.reflection,
    dawnTransition: transitioning.transition,
    arching, guarding, flowing, reflecting, transitioning,
    condition: classifyArchCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as silver hall
 * @example
 * const h = analyzeSilverHall(arches, 'src')
 * console.log(h.hallType) // 'silver-palace'
 */
export function analyzeSilverHall(arches: SilverArch[], dirPath: string): SilverHall {
  if (arches.length === 0) {
    return {
      directory: dirPath, arches: [], avgElegance: 0, avgSecurity: 0,
      avgReflection: 0, silverMasterpieceCount: 0, gapCount: 0,
      hallType: 'no-hall', condition: 'void',
    }
  }

  const avgElegance = Math.round(arches.reduce((s, a) => s + a.boundaryElegance, 0) / arches.length)
  const avgSecurity = Math.round(arches.reduce((s, a) => s + a.thresholdSecurity, 0) / arches.length)
  const avgReflection = Math.round(arches.reduce((s, a) => s + a.silverReflection, 0) / arches.length)
  const silverMasterpieceCount = arches.filter(a => a.condition === 'silver-masterpiece').length
  const gapCount = arches.filter(a => a.condition === 'gap').length
  const avgQs = Math.round(arches.reduce((s, a) => s + a.qualityScore, 0) / arches.length)

  return {
    directory: dirPath, arches, avgElegance, avgSecurity, avgReflection,
    silverMasterpieceCount, gapCount,
    hallType: classifyHallType(arches),
    condition: classifyHallCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete silver threshold result
 * @example
 * const result = await buildSilverThresholdResult(files, contents)
 * console.log(result.stats.guardianGrade) // 'silver-guardian'
 */
export async function buildSilverThresholdResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverThresholdResult> {
  const arches = files.map((file, i) => analyzeSilverArch(contents[i] ?? '', file))

  const dirMap = new Map<string, SilverArch[]>()
  for (const arch of arches) {
    const dir = path.dirname(arch.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(arch) } else { dirMap.set(dir, [arch]) }
  }

  const halls = Array.from(dirMap.entries()).map(([dir, dirArches]) =>
    analyzeSilverHall(dirArches, dir),
  )

  const avgElegance = arches.length > 0
    ? Math.round(arches.reduce((s, a) => s + a.boundaryElegance, 0) / arches.length) : 0
  const avgSecurity = arches.length > 0
    ? Math.round(arches.reduce((s, a) => s + a.thresholdSecurity, 0) / arches.length) : 0
  const avgReflection = arches.length > 0
    ? Math.round(arches.reduce((s, a) => s + a.silverReflection, 0) / arches.length) : 0

  const overallRadiance = arches.length > 0
    ? Math.round((avgElegance + avgSecurity + avgReflection) / 3) : 0
  const isLuminous = avgElegance >= 60

  const palace: SilverPalace = { avgElegance, avgSecurity, avgReflection, isLuminous, overallRadiance }

  const avgMoonlitPassage = arches.length > 0
    ? Math.round(arches.reduce((s, a) => s + a.moonlitPassage, 0) / arches.length) : 0
  const avgDawnTransition = arches.length > 0
    ? Math.round(arches.reduce((s, a) => s + a.dawnTransition, 0) / arches.length) : 0

  const bestArch = arches.length > 0
    ? arches.reduce((best, a) => a.qualityScore > best.qualityScore ? a : best).file : ''
  const mostElegant = arches.length > 0
    ? arches.reduce((best, a) => a.boundaryElegance > best.boundaryElegance ? a : best).file : ''
  const mostSecure = arches.length > 0
    ? arches.reduce((best, a) => a.thresholdSecurity > best.thresholdSecurity ? a : best).file : ''
  const smoothestPassage = arches.length > 0
    ? arches.reduce((best, a) => a.moonlitPassage > best.moonlitPassage ? a : best).file : ''
  const clearest = arches.length > 0
    ? arches.reduce((best, a) => a.silverReflection > best.silverReflection ? a : best).file : ''

  const stats: SilverThresholdStats = {
    totalFiles: arches.length,
    totalHalls: halls.length,
    avgBoundaryElegance: avgElegance,
    avgThresholdSecurity: avgSecurity,
    avgMoonlitPassage,
    avgSilverReflection: avgReflection,
    avgDawnTransition,
    silverMasterpieceCount: arches.filter(a => a.condition === 'silver-masterpiece').length,
    moonlitPortalCount: arches.filter(a => a.condition === 'moonlit-portal').length,
    properArchCount: arches.filter(a => a.condition === 'proper-arch').length,
    ironGateCount: arches.filter(a => a.condition === 'iron-gate').length,
    woodenDoorCount: arches.filter(a => a.condition === 'wooden-door').length,
    gapCount: arches.filter(a => a.condition === 'gap').length,
    hasHighEleganceCount: arches.filter(a => a.arching.hasHighElegance).length,
    hasHighSecurityCount: arches.filter(a => a.guarding.hasHighSecurity).length,
    hasHighPassageCount: arches.filter(a => a.flowing.hasHighPassage).length,
    hasHighReflectionCount: arches.filter(a => a.reflecting.hasHighReflection).length,
    hasHighTransitionCount: arches.filter(a => a.transitioning.hasHighTransition).length,
    overallRadiance,
    guardianGrade: classifyGuardianGrade(overallRadiance),
    bestArch, mostElegant, mostSecure, smoothestPassage, clearest,
  }

  const recommendations = generateRecommendations(arches, halls, palace, stats)

  return { arches, halls, palace, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
