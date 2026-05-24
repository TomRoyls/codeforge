// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Emptiness elegance grade */
export type EmptinessGrade =
  | 'perfect-void'
  | 'elegant-emptiness'
  | 'proper-simplicity'
  | 'cluttered-space'
  | 'overstuffed'
  | 'no-void'

/** Sacred structure grade */
export type SacredGrade =
  | 'divine-geometry'
  | 'sacred-architecture'
  | 'proper-temple'
  | 'mundane-building'
  | 'ramshackle'
  | 'no-structure'

/** Silent wisdom grade */
export type SilenceGrade =
  | 'enlightened-mute'
  | 'wise-silence'
  | 'proper-quiet'
  | 'noisy-code'
  | 'chattering'
  | 'babble'

/** Ethereal foundation grade */
export type EtherealGrade =
  | 'weightless-strength'
  | 'airy-foundation'
  | 'proper-base'
  | 'heavy-anchor'
  | 'sinking-stone'
  | 'no-foundation'

/** Transcendent clarity grade */
export type TranscendenceGrade =
  | 'nirvana-code'
  | 'clear-mind'
  | 'proper-understanding'
  | 'foggy-thought'
  | 'confused-mind'
  | 'oblivion'

/** Spire condition */
export type SpireCondition =
  | 'void-masterpiece'
  | 'ethereal-spire'
  | 'proper-chapel'
  | 'stone-church'
  | 'ruined-shrine'
  | 'dust'

/** Void type */
export type VoidType =
  | 'cosmic-void'
  | 'sacred-space'
  | 'proper-void'
  | 'crowded-hall'
  | 'stuffed-room'
  | 'no-void'

/** Void condition */
export type VoidCondition =
  | 'divine-emptiness'
  | 'beautiful-space'
  | 'decent-void'
  | 'cluttered-space'
  | 'filled-void'
  | 'void'

/** Architect grade */
export type ArchitectGrade =
  | 'void-architect'
  | 'sacred-builder'
  | 'proper-mason'
  | 'apprentice'
  | 'novice'
  | 'destroyer'

/** Emptying (elegance) measurement */
export interface EmptyingMeasure {
  elegance: number
  grade: EmptinessGrade
  hasHighElegance: boolean
  hasConcise: boolean
  hasMinimal: boolean
  hasNoVerbose: boolean
  hasEssential: boolean
  hasNoRedundant: boolean
  hasClean: boolean
  hasNoNoisy: boolean
  hasSparse: boolean
  hasNoDense: boolean
  hasRefined: boolean
  verboseCount: number
  redundantCount: number
}

/** Structuring (sacred) measurement */
export interface StructuringMeasure {
  sacred: number
  structure: SacredGrade
  hasHighSacred: boolean
  hasWellOrganized: boolean
  hasLogicalFlow: boolean
  hasNoScattered: boolean
  hasHierarchical: boolean
  hasNoFlat: boolean
  hasSymmetrical: boolean
  hasNoLopsided: boolean
  hasProportioned: boolean
  hasNoUnbalanced: boolean
  hasHarmonious: boolean
  scatteredCount: number
  flatCount: number
}

/** Silencing (wisdom) measurement */
export interface SilencingMeasure {
  wisdom: number
  silence: SilenceGrade
  hasHighWisdom: boolean
  hasSelfDocumenting: boolean
  hasDescriptive: boolean
  hasNoCommentsNeeded: boolean
  hasExpressive: boolean
  hasNoUnreadable: boolean
  hasClearIntent: boolean
  hasNoAmbiguous: boolean
  hasObvious: boolean
  hasNoCryptic: boolean
  hasSelfEvident: boolean
  commentsNeededCount: number
  unreadableCount: number
}

/** Floating (ethereal) measurement */
export interface FloatingMeasure {
  ethereal: number
  foundation: EtherealGrade
  hasHighEthereal: boolean
  hasLightweight: boolean
  hasNoHeavyDependencies: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasComposable: boolean
  hasNoMonolithic: boolean
  hasPortable: boolean
  hasNoTied: boolean
  hasModular: boolean
  hasNoCoupled: boolean
  heavyDependencyCount: number
  wastefulCount: number
}

/** Transcending (clarity) measurement */
export interface TranscendingMeasure {
  clarity: number
  transcendence: TranscendenceGrade
  hasHighClarity: boolean
  hasImmediatelyClear: boolean
  hasNoRereadingNeeded: boolean
  hasIntuitive: boolean
  hasNoCounterintuitive: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasFlowing: boolean
  hasNoJarring: boolean
  rereadingNeededCount: number
  counterintuitiveCount: number
}

/** Single file analysis */
export interface VoidSpire {
  file: string
  emptinessElegance: number
  sacredStructure: number
  silentWisdom: number
  etherealFoundation: number
  transcendentClarity: number
  emptying: EmptyingMeasure
  structuring: StructuringMeasure
  silencing: SilencingMeasure
  floating: FloatingMeasure
  transcending: TranscendingMeasure
  condition: SpireCondition
  qualityScore: number
}

/** Directory-level void */
export interface CathedralVoid {
  directory: string
  spires: VoidSpire[]
  avgEmptiness: number
  avgSacred: number
  avgClarity: number
  voidMasterpieceCount: number
  dustCount: number
  voidType: VoidType
  condition: VoidCondition
}

/** Cosmos summary */
export interface CosmosSummary {
  avgEmptiness: number
  avgSacred: number
  avgClarity: number
  isTranscendent: boolean
  overallSublimity: number
}

/** Full stats */
export interface VoidCathedralStats {
  totalFiles: number
  totalVoids: number
  avgEmptinessElegance: number
  avgSacredStructure: number
  avgSilentWisdom: number
  avgEtherealFoundation: number
  avgTranscendentClarity: number
  voidMasterpieceCount: number
  etherealSpireCount: number
  properChapelCount: number
  stoneChurchCount: number
  ruinedShrineCount: number
  dustCount: number
  hasHighEleganceCount: number
  hasHighSacredCount: number
  hasHighWisdomCount: number
  hasHighEtherealCount: number
  hasHighClarityCount: number
  overallSublimity: number
  architectGrade: ArchitectGrade
  bestSpire: string
  mostEmpty: string
  mostSacred: string
  wisest: string
  clearest: string
}

/** Full result */
export interface VoidCathedralResult {
  spires: VoidSpire[]
  voids: CathedralVoid[]
  cosmos: CosmosSummary
  stats: VoidCathedralStats
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
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure emptiness elegance (emptying)
 * @example
 * const m = measureEmptying(content)
 * console.log(m.grade) // 'perfect-void'
 */
export function measureEmptying(content: string): EmptyingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasConcise = hasConst(content) && hasReturnType(content)
  const hasMinimal = hasNamedExport(content) && hasOptional(content)
  const hasEssential = hasInterface(content) && hasReturnType(content)
  const hasClean = hasExport(content) && hasImport(content)
  const hasSparse = hasReadonly(content) && hasConst(content)
  const hasRefined = hasGenerics(content) && hasInterface(content)

  score += hasConcise ? 5 : 0
  score += hasMinimal ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasSparse ? 5 : 0
  score += hasRefined ? 5 : 0

  const elegance = Math.min(score, 100)
  const verboseCount = countMatches(/\bvar\b/, content)
  const redundantCount = countMatches(/\bany\b/, content)

  const hasNoVerbose = verboseCount === 0
  const hasNoRedundant = redundantCount === 0
  const hasNoNoisy = !has(/\beval\b/, content)
  const hasNoDense = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let grade: EmptinessGrade
  if (elegance >= 85) grade = 'perfect-void'
  else if (elegance >= 70) grade = 'elegant-emptiness'
  else if (elegance >= 55) grade = 'proper-simplicity'
  else if (elegance >= 40) grade = 'cluttered-space'
  else if (elegance >= 25) grade = 'overstuffed'
  else grade = 'no-void'

  return {
    elegance, grade, hasHighElegance, hasConcise, hasMinimal, hasNoVerbose,
    hasEssential, hasNoRedundant, hasClean, hasNoNoisy, hasSparse, hasNoDense,
    hasRefined, verboseCount, redundantCount,
  }
}

/**
 * Measure sacred structure (structuring)
 * @example
 * const m = measureStructuring(content)
 * console.log(m.structure) // 'divine-geometry'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0

  const hasWellOrganized = hasExport(content) && hasImport(content)
  const hasLogicalFlow = hasInterface(content) && hasReturnType(content)
  const hasHierarchical = hasClass(content) && hasPrivate(content)
  const hasSymmetrical = hasConst(content) && hasNamedExport(content)
  const hasProportioned = hasGenerics(content) && hasInterface(content)
  const hasHarmonious = hasReadonly(content) && hasExport(content)

  score += hasWellOrganized ? 5 : 0
  score += hasLogicalFlow ? 5 : 0
  score += hasHierarchical ? 5 : 0
  score += hasSymmetrical ? 5 : 0
  score += hasProportioned ? 5 : 0
  score += hasHarmonious ? 5 : 0

  const sacred = Math.min(score, 100)
  const scatteredCount = countMatches(/\bvar\b/, content)
  const flatCount = countMatches(/\bany\b/, content)

  const hasNoScattered = scatteredCount === 0
  const hasNoFlat = flatCount === 0
  const hasNoLopsided = !has(/\beval\b/, content)
  const hasNoUnbalanced = !has(/\bdebugger\b/, content)
  const hasHighSacred = sacred >= 70

  let structure: SacredGrade
  if (sacred >= 85) structure = 'divine-geometry'
  else if (sacred >= 70) structure = 'sacred-architecture'
  else if (sacred >= 55) structure = 'proper-temple'
  else if (sacred >= 40) structure = 'mundane-building'
  else if (sacred >= 25) structure = 'ramshackle'
  else structure = 'no-structure'

  return {
    sacred, structure, hasHighSacred, hasWellOrganized, hasLogicalFlow,
    hasNoScattered, hasHierarchical, hasNoFlat, hasSymmetrical, hasNoLopsided,
    hasProportioned, hasNoUnbalanced, hasHarmonious, scatteredCount, flatCount,
  }
}

/**
 * Measure silent wisdom (silencing)
 * @example
 * const m = measureSilencing(content)
 * console.log(m.silence) // 'enlightened-mute'
 */
export function measureSilencing(content: string): SilencingMeasure {
  let score = 0
  score += hasDocComments(content) ? 12 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasSelfDocumenting = hasReturnType(content) && hasStrictEq(content)
  const hasDescriptive = hasDocComments(content) && hasNamedExport(content)
  const hasExpressive = hasConst(content) && hasExport(content)
  const hasClearIntent = hasInterface(content) && hasReturnType(content)
  const hasObvious = hasNamedExport(content) && hasConst(content)
  const hasSelfEvident = hasOptional(content) && hasDocComments(content)

  score += hasSelfDocumenting ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasClearIntent ? 5 : 0
  score += hasObvious ? 5 : 0
  score += hasSelfEvident ? 5 : 0

  const wisdom = Math.min(score, 100)
  const commentsNeededCount = countMatches(/\bvar\b/, content)
  const unreadableCount = countMatches(/\bany\b/, content)

  const hasNoCommentsNeeded = commentsNeededCount === 0
  const hasNoUnreadable = unreadableCount === 0
  const hasNoAmbiguous = !has(/\beval\b/, content)
  const hasNoCryptic = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let silence: SilenceGrade
  if (wisdom >= 85) silence = 'enlightened-mute'
  else if (wisdom >= 70) silence = 'wise-silence'
  else if (wisdom >= 55) silence = 'proper-quiet'
  else if (wisdom >= 40) silence = 'noisy-code'
  else if (wisdom >= 25) silence = 'chattering'
  else silence = 'babble'

  return {
    wisdom, silence, hasHighWisdom, hasSelfDocumenting, hasDescriptive,
    hasNoCommentsNeeded, hasExpressive, hasNoUnreadable, hasClearIntent,
    hasNoAmbiguous, hasObvious, hasNoCryptic, hasSelfEvident,
    commentsNeededCount, unreadableCount,
  }
}

/**
 * Measure ethereal foundation (floating)
 * @example
 * const m = measureFloating(content)
 * console.log(m.foundation) // 'weightless-strength'
 */
export function measureFloating(content: string): FloatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasLightweight = hasExport(content) && hasImport(content)
  const hasEfficient = hasConst(content) && hasReturnType(content)
  const hasComposable = hasInterface(content) && hasGenerics(content)
  const hasPortable = hasNamedExport(content) && hasTypeAlias(content)
  const hasModular = hasExport(content) && hasOptional(content)
  const hasNoHeavyDependencies = hasInterface(content) && hasConst(content)

  score += hasLightweight ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasComposable ? 5 : 0
  score += hasPortable ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasNoHeavyDependencies ? 5 : 0

  const ethereal = Math.min(score, 100)
  const heavyDependencyCount = countMatches(/\bvar\b/, content)
  const wastefulCount = countMatches(/\bany\b/, content)

  const hasNoWasteful = wastefulCount === 0
  const hasNoMonolithic = !has(/\beval\b/, content)
  const hasNoTied = !has(/\bdebugger\b/, content)
  const hasNoCoupled = heavyDependencyCount === 0
  const hasHighEthereal = ethereal >= 70

  let foundation: EtherealGrade
  if (ethereal >= 85) foundation = 'weightless-strength'
  else if (ethereal >= 70) foundation = 'airy-foundation'
  else if (ethereal >= 55) foundation = 'proper-base'
  else if (ethereal >= 40) foundation = 'heavy-anchor'
  else if (ethereal >= 25) foundation = 'sinking-stone'
  else foundation = 'no-foundation'

  return {
    ethereal, foundation, hasHighEthereal, hasLightweight, hasNoHeavyDependencies,
    hasEfficient, hasNoWasteful, hasComposable, hasNoMonolithic, hasPortable,
    hasNoTied, hasModular, hasNoCoupled, heavyDependencyCount, wastefulCount,
  }
}

/**
 * Measure transcendent clarity (transcending)
 * @example
 * const m = measureTranscending(content)
 * console.log(m.transcendence) // 'nirvana-code'
 */
export function measureTranscending(content: string): TranscendingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasImmediatelyClear = hasReturnType(content) && hasStrictEq(content)
  const hasIntuitive = hasConst(content) && hasNamedExport(content)
  const hasPredictable = hasInterface(content) && hasReturnType(content)
  const hasConsistent = hasExport(content) && hasImport(content)
  const hasFlowing = hasDocComments(content) && hasNamedExport(content)
  const hasNoRereadingNeeded = hasConst(content) && hasStrictEq(content)

  score += hasImmediatelyClear ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasNoRereadingNeeded ? 5 : 0

  const clarity = Math.min(score, 100)
  const rereadingNeededCount = countMatches(/\bvar\b/, content)
  const counterintuitiveCount = countMatches(/\bany\b/, content)

  const hasNoSurprising = !has(/\beval\b/, content)
  const hasNoInconsistent = !has(/\bdebugger\b/, content)
  const hasNoCounterintuitive = counterintuitiveCount === 0
  const hasNoJarring = rereadingNeededCount === 0
  const hasHighClarity = clarity >= 70

  let transcendence: TranscendenceGrade
  if (clarity >= 85) transcendence = 'nirvana-code'
  else if (clarity >= 70) transcendence = 'clear-mind'
  else if (clarity >= 55) transcendence = 'proper-understanding'
  else if (clarity >= 40) transcendence = 'foggy-thought'
  else if (clarity >= 25) transcendence = 'confused-mind'
  else transcendence = 'oblivion'

  return {
    clarity, transcendence, hasHighClarity, hasImmediatelyClear, hasNoRereadingNeeded,
    hasIntuitive, hasNoCounterintuitive, hasPredictable, hasNoSurprising,
    hasConsistent, hasNoInconsistent, hasFlowing, hasNoJarring,
    rereadingNeededCount, counterintuitiveCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify spire condition
 * @example
 * classifySpireCondition(90) // 'void-masterpiece'
 */
export function classifySpireCondition(score: number): SpireCondition {
  if (score >= 85) return 'void-masterpiece'
  if (score >= 70) return 'ethereal-spire'
  if (score >= 55) return 'proper-chapel'
  if (score >= 40) return 'stone-church'
  if (score >= 25) return 'ruined-shrine'
  return 'dust'
}

/**
 * Classify void type
 * @example
 * classifyVoidType(spires) // 'cosmic-void'
 */
export function classifyVoidType(spires: VoidSpire[]): VoidType {
  if (spires.length === 0) return 'no-void'
  const avgQs = Math.round(spires.reduce((s, sp) => s + sp.qualityScore, 0) / spires.length)
  const masterpieceRatio = spires.filter(sp => sp.condition === 'void-masterpiece').length / spires.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'cosmic-void'
  if (avgQs >= 60) return 'sacred-space'
  if (avgQs >= 45) return 'proper-void'
  if (avgQs >= 30) return 'crowded-hall'
  if (avgQs >= 15) return 'stuffed-room'
  return 'no-void'
}

/**
 * Classify void condition
 * @example
 * classifyVoidCondition(80) // 'divine-emptiness'
 */
export function classifyVoidCondition(avgQs: number): VoidCondition {
  if (avgQs >= 75) return 'divine-emptiness'
  if (avgQs >= 60) return 'beautiful-space'
  if (avgQs >= 45) return 'decent-void'
  if (avgQs >= 30) return 'cluttered-space'
  if (avgQs >= 15) return 'filled-void'
  return 'void'
}

/**
 * Classify architect grade
 * @example
 * classifyArchitectGrade(85) // 'void-architect'
 */
export function classifyArchitectGrade(avgSublimity: number): ArchitectGrade {
  if (avgSublimity >= 80) return 'void-architect'
  if (avgSublimity >= 65) return 'sacred-builder'
  if (avgSublimity >= 50) return 'proper-mason'
  if (avgSublimity >= 35) return 'apprentice'
  if (avgSublimity >= 20) return 'novice'
  return 'destroyer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(spires, voids, cosmos, stats)
 */
export function generateRecommendations(
  spires: VoidSpire[],
  voids: CathedralVoid[],
  cosmos: CosmosSummary,
  stats: VoidCathedralStats,
): string[] {
  const recs: string[] = []
  if (stats.avgEmptinessElegance < 50) {
    recs.push('Achieve emptiness elegance with concise exports, minimal types, and essential-only patterns')
  }
  if (stats.avgSacredStructure < 50) {
    recs.push('Build sacred structure with organized exports, logical flows, and hierarchical class design')
  }
  if (stats.avgSilentWisdom < 50) {
    recs.push('Find silent wisdom with self-documenting code, descriptive naming, and expressive patterns')
  }
  if (stats.avgEtherealFoundation < 50) {
    recs.push('Float on ethereal foundations with lightweight modules, composable interfaces, and portable types')
  }
  if (stats.avgTranscendentClarity < 50) {
    recs.push('Reach transcendent clarity with consistent naming, predictable patterns, and flowing code')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — they need void restoration`)
  }
  if (cosmos.overallSublimity < 40) {
    recs.push('Overall sublimity is low — focus on emptiness elegance and sacred structure first')
  }
  const allStuffed = voids.every(v => v.voidType === 'no-void' || v.voidType === 'stuffed-room')
  if (allStuffed && voids.length > 0) {
    recs.push('All voids are filled — consider a major architectural purification')
  }
  const dustFiles = spires.filter(sp => sp.condition === 'dust').map(sp => sp.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Restore these dust files into void masterpieces: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your void cathedral achieves void architect sublimity! Every spire resonates with perfect emptiness')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as void spire
 * @example
 * const sp = analyzeVoidSpire(content, 'index.ts')
 * console.log(sp.condition) // 'void-masterpiece'
 */
export function analyzeVoidSpire(content: string, filePath: string): VoidSpire {
  const emptying = measureEmptying(content)
  const structuring = measureStructuring(content)
  const silencing = measureSilencing(content)
  const floating = measureFloating(content)
  const transcending = measureTranscending(content)

  const qualityScore = Math.round(
    emptying.elegance * 0.2 +
    structuring.sacred * 0.2 +
    silencing.wisdom * 0.2 +
    floating.ethereal * 0.2 +
    transcending.clarity * 0.2,
  )

  return {
    file: filePath,
    emptinessElegance: emptying.elegance,
    sacredStructure: structuring.sacred,
    silentWisdom: silencing.wisdom,
    etherealFoundation: floating.ethereal,
    transcendentClarity: transcending.clarity,
    emptying,
    structuring,
    silencing,
    floating,
    transcending,
    condition: classifySpireCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as cathedral void
 * @example
 * const v = analyzeCathedralVoid(spires, 'src')
 * console.log(v.voidType) // 'cosmic-void'
 */
export function analyzeCathedralVoid(spires: VoidSpire[], dirPath: string): CathedralVoid {
  if (spires.length === 0) {
    return {
      directory: dirPath, spires: [], avgEmptiness: 0, avgSacred: 0, avgClarity: 0,
      voidMasterpieceCount: 0, dustCount: 0, voidType: 'no-void', condition: 'void',
    }
  }

  const avgEmptiness = Math.round(spires.reduce((s, sp) => s + sp.emptinessElegance, 0) / spires.length)
  const avgSacred = Math.round(spires.reduce((s, sp) => s + sp.sacredStructure, 0) / spires.length)
  const avgClarity = Math.round(spires.reduce((s, sp) => s + sp.transcendentClarity, 0) / spires.length)
  const voidMasterpieceCount = spires.filter(sp => sp.condition === 'void-masterpiece').length
  const dustCount = spires.filter(sp => sp.condition === 'dust').length
  const avgQs = Math.round(spires.reduce((s, sp) => s + sp.qualityScore, 0) / spires.length)

  return {
    directory: dirPath, spires, avgEmptiness, avgSacred, avgClarity,
    voidMasterpieceCount, dustCount, voidType: classifyVoidType(spires),
    condition: classifyVoidCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete void cathedral result
 * @example
 * const result = await buildVoidCathedralResult(files, contents)
 * console.log(result.stats.architectGrade) // 'void-architect'
 */
export async function buildVoidCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<VoidCathedralResult> {
  const spires = files.map((file, i) => analyzeVoidSpire(contents[i] ?? '', file))

  const dirMap = new Map<string, VoidSpire[]>()
  for (const spire of spires) {
    const dir = path.dirname(spire.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(spire) } else { dirMap.set(dir, [spire]) }
  }

  const voids = Array.from(dirMap.entries()).map(([dir, dirSpires]) =>
    analyzeCathedralVoid(dirSpires, dir),
  )

  const avgEmptiness = spires.length > 0
    ? Math.round(spires.reduce((s, sp) => s + sp.emptinessElegance, 0) / spires.length) : 0
  const avgSacred = spires.length > 0
    ? Math.round(spires.reduce((s, sp) => s + sp.sacredStructure, 0) / spires.length) : 0
  const avgClarity = spires.length > 0
    ? Math.round(spires.reduce((s, sp) => s + sp.transcendentClarity, 0) / spires.length) : 0

  const overallSublimity = spires.length > 0
    ? Math.round((avgEmptiness + avgSacred + avgClarity) / 3) : 0
  const isTranscendent = avgEmptiness >= 60

  const cosmos: CosmosSummary = { avgEmptiness, avgSacred, avgClarity, isTranscendent, overallSublimity }

  const avgSilentWisdom = spires.length > 0
    ? Math.round(spires.reduce((s, sp) => s + sp.silentWisdom, 0) / spires.length) : 0
  const avgEtherealFoundation = spires.length > 0
    ? Math.round(spires.reduce((s, sp) => s + sp.etherealFoundation, 0) / spires.length) : 0
  const avgTranscendentClarity = avgClarity

  const bestSpire = spires.length > 0
    ? spires.reduce((best, sp) => sp.qualityScore > best.qualityScore ? sp : best).file : ''
  const mostEmpty = spires.length > 0
    ? spires.reduce((best, sp) => sp.emptinessElegance > best.emptinessElegance ? sp : best).file : ''
  const mostSacred = spires.length > 0
    ? spires.reduce((best, sp) => sp.sacredStructure > best.sacredStructure ? sp : best).file : ''
  const wisest = spires.length > 0
    ? spires.reduce((best, sp) => sp.silentWisdom > best.silentWisdom ? sp : best).file : ''
  const clearest = spires.length > 0
    ? spires.reduce((best, sp) => sp.transcendentClarity > best.transcendentClarity ? sp : best).file : ''

  const stats: VoidCathedralStats = {
    totalFiles: spires.length,
    totalVoids: voids.length,
    avgEmptinessElegance: avgEmptiness,
    avgSacredStructure: avgSacred,
    avgSilentWisdom,
    avgEtherealFoundation,
    avgTranscendentClarity,
    voidMasterpieceCount: spires.filter(sp => sp.condition === 'void-masterpiece').length,
    etherealSpireCount: spires.filter(sp => sp.condition === 'ethereal-spire').length,
    properChapelCount: spires.filter(sp => sp.condition === 'proper-chapel').length,
    stoneChurchCount: spires.filter(sp => sp.condition === 'stone-church').length,
    ruinedShrineCount: spires.filter(sp => sp.condition === 'ruined-shrine').length,
    dustCount: spires.filter(sp => sp.condition === 'dust').length,
    hasHighEleganceCount: spires.filter(sp => sp.emptying.hasHighElegance).length,
    hasHighSacredCount: spires.filter(sp => sp.structuring.hasHighSacred).length,
    hasHighWisdomCount: spires.filter(sp => sp.silencing.hasHighWisdom).length,
    hasHighEtherealCount: spires.filter(sp => sp.floating.hasHighEthereal).length,
    hasHighClarityCount: spires.filter(sp => sp.transcending.hasHighClarity).length,
    overallSublimity,
    architectGrade: classifyArchitectGrade(overallSublimity),
    bestSpire, mostEmpty, mostSacred, wisest, clearest,
  }

  const recommendations = generateRecommendations(spires, voids, cosmos, stats)

  return { spires, voids, cosmos, stats, recommendations }
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
