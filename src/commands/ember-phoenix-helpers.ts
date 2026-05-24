// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Rebirth quality grade */
export type RebirthGrade =
  | 'legendary-phoenix'
  | 'rising-phoenix'
  | 'reborn-bird'
  | 'struggling-chick'
  | 'sinking-ash'
  | 'extinguished'

/** Ash wisdom insight */
export type AshInsight =
  | 'ancient-wisdom'
  | 'sage-knowledge'
  | 'proper-learning'
  | 'shallow-wisdom'
  | 'unlearned'
  | 'ignorant'

/** Flame purity level */
export type FlamePurity =
  | 'white-flame'
  | 'golden-fire'
  | 'proper-blaze'
  | 'smoky-fire'
  | 'dying-ember'
  | 'cold-ash'

/** Wing span level */
export type WingSpan =
  | 'majestic-wings'
  | 'broad-wings'
  | 'proper-span'
  | 'narrow-wings'
  | 'clipped-wings'
  | 'broken-wings'

/** Resurrection capacity */
export type ResurrectionCapacity =
  | 'immortal'
  | 'fast-revival'
  | 'proper-recovery'
  | 'slow-revival'
  | 'near-death'
  | 'terminal'

/** Ember condition */
export type EmberCondition =
  | 'immortal-phoenix'
  | 'rising-flame'
  | 'steady-glow'
  | 'flickering'
  | 'dying-ember'
  | 'cold-ash'

/** Nest type */
export type NestType =
  | 'golden-nest'
  | 'proper-nest'
  | 'twig-nest'
  | 'ground-nest'
  | 'ash-pile'
  | 'empty-hearth'

/** Nest condition */
export type NestCondition =
  | 'eternal-flame'
  | 'burning-bright'
  | 'steady-glow'
  | 'fading-light'
  | 'dying-embers'
  | 'extinguished'

/** Keeper grade */
export type KeeperGrade =
  | 'phoenix-lord'
  | 'fire-keeper'
  | 'flame-guardian'
  | 'ember-tender'
  | 'ash-collector'
  | 'fire-extinguisher'

/** Rebirthing measurement */
export interface RebirthingMeasure {
  quality: number
  grade: RebirthGrade
  hasHighQuality: boolean
  hasRenewed: boolean
  hasRefreshed: boolean
  hasNoStagnation: boolean
  hasRevitalized: boolean
  hasNoDecay: boolean
  hasTransformed: boolean
  hasNoRust: boolean
  hasEnergized: boolean
  hasNoDormancy: boolean
  hasAscended: boolean
  stagnationCount: number
  decayCount: number
}

/** Learning measurement */
export interface LearningMeasure {
  wisdom: number
  insight: AshInsight
  hasHighWisdom: boolean
  hasExperienced: boolean
  hasMature: boolean
  hasNoNaivety: boolean
  hasTested: boolean
  hasNoInnocence: boolean
  hasBattleHardened: boolean
  hasNoFragility: boolean
  hasProven: boolean
  hasNoUntried: boolean
  hasVeteran: boolean
  naivetyCount: number
  innocenceCount: number
}

/** Purifying measurement */
export interface PurifyingMeasure {
  purity: number
  flame: FlamePurity
  hasHighPurity: boolean
  hasClean: boolean
  hasRefined: boolean
  hasNoPollution: boolean
  hasPure: boolean
  hasNoContamination: boolean
  hasCleansed: boolean
  hasNoImpurity: boolean
  hasTransformed2: boolean
  hasNoCorruption: boolean
  hasPristine: boolean
  pollutionCount: number
  contaminationCount: number
}

/** Spreading measurement */
export interface SpreadingMeasure {
  span: number
  wings: WingSpan
  hasHighSpan: boolean
  hasExpansive: boolean
  hasBroad: boolean
  hasNoNarrow: boolean
  hasFarReaching: boolean
  hasNoLimited: boolean
  hasWidespread: boolean
  hasNoRestricted: boolean
  hasComprehensive: boolean
  hasNoConstrained: boolean
  hasSpacious: boolean
  narrowCount: number
  limitedCount: number
}

/** Resurrecting measurement */
export interface ResurrectingMeasure {
  potential: number
  capacity: ResurrectionCapacity
  hasHighPotential: boolean
  hasRecoverable: boolean
  hasResilient: boolean
  hasNoFatal: boolean
  hasRepairable: boolean
  hasNoIrreparable: boolean
  hasRestorable: boolean
  hasNoBeyondRepair: boolean
  hasRevivable: boolean
  hasNoPermanentLoss: boolean
  hasSurvivable: boolean
  fatalCount: number
  irreparableCount: number
}

/** Single file analysis */
export interface PhoenixEmber {
  file: string
  rebirthQuality: number
  ashWisdom: number
  flamePurity: number
  wingSpan: number
  resurrectionPotential: number
  rebirthing: RebirthingMeasure
  learning: LearningMeasure
  purifying: PurifyingMeasure
  spreading: SpreadingMeasure
  resurrecting: ResurrectingMeasure
  condition: EmberCondition
  qualityScore: number
}

/** Directory-level nest */
export interface PhoenixNest {
  directory: string
  embers: PhoenixEmber[]
  avgRebirth: number
  avgWisdom: number
  avgPurity: number
  immortalPhoenixCount: number
  coldAshCount: number
  nestType: NestType
  condition: NestCondition
}

/** Flame summary */
export interface PhoenixFlame {
  avgRebirth: number
  avgWisdom: number
  avgPurity: number
  isBurning: boolean
  overallResilience: number
}

/** Full stats */
export interface EmberPhoenixStats {
  totalFiles: number
  totalNests: number
  avgRebirthQuality: number
  avgAshWisdom: number
  avgFlamePurity: number
  avgWingSpan: number
  avgResurrectionPotential: number
  immortalPhoenixCount: number
  risingFlameCount: number
  steadyGlowCount: number
  flickeringCount: number
  dyingEmberCount: number
  coldAshCount: number
  hasHighQualityCount: number
  hasHighWisdomCount: number
  hasHighPurityCount: number
  hasHighSpanCount: number
  hasHighPotentialCount: number
  overallResilience: number
  keeperGrade: KeeperGrade
  bestEmber: string
  mostReborn: string
  wisest: string
  purest: string
  broadest: string
}

/** Full result */
export interface EmberPhoenixResult {
  embers: PhoenixEmber[]
  nests: PhoenixNest[]
  flame: PhoenixFlame
  stats: EmberPhoenixStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
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
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure rebirth quality of code
 * @example
 * const m = measureRebirthing(content)
 * console.log(m.grade) // 'legendary-phoenix'
 */
export function measureRebirthing(content: string): RebirthingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasImport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0

  const hasRenewed = hasExport(content) && hasImport(content)
  const hasRefreshed = hasReturnType(content) && hasConst(content)
  const hasRevitalized = hasGenerics(content) && hasAsync(content)
  const hasTransformed = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasEnergized = hasNamedExport(content) && hasReturnType(content)
  const hasAscended = hasExport(content) && hasConst(content)

  score += hasRenewed ? 5 : 0
  score += hasRefreshed ? 5 : 0
  score += hasRevitalized ? 5 : 0
  score += hasTransformed ? 5 : 0
  score += hasEnergized ? 5 : 0
  score += hasAscended ? 5 : 0

  const quality = Math.min(score, 100)
  const stagnationCount = count(/\bvar\b/, content)
  const decayCount = count(/\bany\b/, content)

  const hasNoStagnation = stagnationCount === 0
  const hasNoDecay = decayCount === 0
  const hasNoRust = !has(/\beval\b/, content)
  const hasNoDormancy = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: RebirthGrade
  if (quality >= 85) grade = 'legendary-phoenix'
  else if (quality >= 70) grade = 'rising-phoenix'
  else if (quality >= 55) grade = 'reborn-bird'
  else if (quality >= 40) grade = 'struggling-chick'
  else if (quality >= 25) grade = 'sinking-ash'
  else grade = 'extinguished'

  return {
    quality, grade, hasHighQuality, hasRenewed, hasRefreshed, hasNoStagnation,
    hasRevitalized, hasNoDecay, hasTransformed, hasNoRust, hasEnergized,
    hasNoDormancy, hasAscended, stagnationCount, decayCount,
  }
}

/**
 * Measure ash wisdom of code
 * @example
 * const m = measureLearning(content)
 * console.log(m.insight) // 'ancient-wisdom'
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasExperienced = hasExport(content) && hasImport(content)
  const hasMature = hasInterface(content) && hasClass(content)
  const hasTested = hasGenerics(content) && hasTypeAlias(content)
  const hasBattleHardened = hasAsync(content) && hasNamedExport(content)
  const hasProven = hasReturnType(content) && hasConst(content)
  const hasVeteran = hasExport(content) && hasInterface(content)

  score += hasExperienced ? 5 : 0
  score += hasMature ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasBattleHardened ? 5 : 0
  score += hasProven ? 5 : 0
  score += hasVeteran ? 5 : 0

  const wisdom = Math.min(score, 100)
  const naivetyCount = count(/\bvar\b/, content)
  const innocenceCount = count(/\bany\b/, content)

  const hasNoNaivety = naivetyCount === 0
  const hasNoInnocence = innocenceCount === 0
  const hasNoFragility = !has(/\beval\b/, content)
  const hasNoUntried = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let insight: AshInsight
  if (wisdom >= 85) insight = 'ancient-wisdom'
  else if (wisdom >= 70) insight = 'sage-knowledge'
  else if (wisdom >= 55) insight = 'proper-learning'
  else if (wisdom >= 40) insight = 'shallow-wisdom'
  else if (wisdom >= 25) insight = 'unlearned'
  else insight = 'ignorant'

  return {
    wisdom, insight, hasHighWisdom, hasExperienced, hasMature, hasNoNaivety,
    hasTested, hasNoInnocence, hasBattleHardened, hasNoFragility, hasProven,
    hasNoUntried, hasVeteran, naivetyCount, innocenceCount,
  }
}

/**
 * Measure flame purity of code
 * @example
 * const m = measurePurifying(content)
 * console.log(m.flame) // 'white-flame'
 */
export function measurePurifying(content: string): PurifyingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasClean = hasTryCatch(content) && hasAsync(content)
  const hasRefined = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasPure = hasStrictEq(content) && hasConst(content)
  const hasCleansed = hasInterface(content) && hasReadonly(content)
  const hasTransformed2 = hasExport(content) && hasConst(content)
  const hasPristine = hasReturnType(content) && hasTryCatch(content)

  score += hasClean ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasCleansed ? 5 : 0
  score += hasTransformed2 ? 5 : 0
  score += hasPristine ? 5 : 0

  const purity = Math.min(score, 100)
  const pollutionCount = count(/\bvar\b/, content)
  const contaminationCount = count(/\bany\b/, content)

  const hasNoPollution = pollutionCount === 0
  const hasNoContamination = contaminationCount === 0
  const hasNoImpurity = !has(/\beval\b/, content)
  const hasNoCorruption = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let flame: FlamePurity
  if (purity >= 85) flame = 'white-flame'
  else if (purity >= 70) flame = 'golden-fire'
  else if (purity >= 55) flame = 'proper-blaze'
  else if (purity >= 40) flame = 'smoky-fire'
  else if (purity >= 25) flame = 'dying-ember'
  else flame = 'cold-ash'

  return {
    purity, flame, hasHighPurity, hasClean, hasRefined, hasNoPollution,
    hasPure, hasNoContamination, hasCleansed, hasNoImpurity, hasTransformed2,
    hasNoCorruption, hasPristine, pollutionCount, contaminationCount,
  }
}

/**
 * Measure wing span of code
 * @example
 * const m = measureSpreading(content)
 * console.log(m.wings) // 'majestic-wings'
 */
export function measureSpreading(content: string): SpreadingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasExpansive = hasDocComments(content) && hasExport(content)
  const hasBroad = hasInterface(content) && hasClass(content)
  const hasFarReaching = hasGenerics(content) && hasTypeAlias(content)
  const hasWidespread = hasNamedExport(content) && hasReturnType(content)
  const hasComprehensive = hasAsync(content) && hasDocComments(content)
  const hasSpacious = hasExport(content) && hasGenerics(content)

  score += hasExpansive ? 5 : 0
  score += hasBroad ? 5 : 0
  score += hasFarReaching ? 5 : 0
  score += hasWidespread ? 5 : 0
  score += hasComprehensive ? 5 : 0
  score += hasSpacious ? 5 : 0

  const span = Math.min(score, 100)
  const narrowCount = count(/\bvar\b/, content)
  const limitedCount = count(/\bany\b/, content)

  const hasNoNarrow = narrowCount === 0
  const hasNoLimited = limitedCount === 0
  const hasNoRestricted = !has(/\beval\b/, content)
  const hasNoConstrained = !has(/\bdebugger\b/, content)
  const hasHighSpan = span >= 70

  let wings: WingSpan
  if (span >= 85) wings = 'majestic-wings'
  else if (span >= 70) wings = 'broad-wings'
  else if (span >= 55) wings = 'proper-span'
  else if (span >= 40) wings = 'narrow-wings'
  else if (span >= 25) wings = 'clipped-wings'
  else wings = 'broken-wings'

  return {
    span, wings, hasHighSpan, hasExpansive, hasBroad, hasNoNarrow,
    hasFarReaching, hasNoLimited, hasWidespread, hasNoRestricted,
    hasComprehensive, hasNoConstrained, hasSpacious, narrowCount, limitedCount,
  }
}

/**
 * Measure resurrection potential of code
 * @example
 * const m = measureResurrecting(content)
 * console.log(m.capacity) // 'immortal'
 */
export function measureResurrecting(content: string): ResurrectingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasRecoverable = hasConst(content) && hasStrictEq(content)
  const hasResilient = hasExport(content) && hasDocComments(content)
  const hasRepairable = hasReadonly(content) && hasPrivate(content)
  const hasRestorable = hasInterface(content) && hasTypeAlias(content)
  const hasRevivable = hasReturnType(content) && hasGenerics(content)
  const hasSurvivable = hasConst(content) && hasExport(content)

  score += hasRecoverable ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasRepairable ? 5 : 0
  score += hasRestorable ? 5 : 0
  score += hasRevivable ? 5 : 0
  score += hasSurvivable ? 5 : 0

  const potential = Math.min(score, 100)
  const fatalCount = count(/\bvar\b/, content)
  const irreparableCount = count(/\bany\b/, content)

  const hasNoFatal = fatalCount === 0
  const hasNoIrreparable = irreparableCount === 0
  const hasNoBeyondRepair = !has(/\beval\b/, content)
  const hasNoPermanentLoss = !has(/\bdebugger\b/, content)
  const hasHighPotential = potential >= 70

  let capacity: ResurrectionCapacity
  if (potential >= 85) capacity = 'immortal'
  else if (potential >= 70) capacity = 'fast-revival'
  else if (potential >= 55) capacity = 'proper-recovery'
  else if (potential >= 40) capacity = 'slow-revival'
  else if (potential >= 25) capacity = 'near-death'
  else capacity = 'terminal'

  return {
    potential, capacity, hasHighPotential, hasRecoverable, hasResilient,
    hasNoFatal, hasRepairable, hasNoIrreparable, hasRestorable, hasNoBeyondRepair,
    hasRevivable, hasNoPermanentLoss, hasSurvivable, fatalCount, irreparableCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ember condition
 * @example
 * classifyEmberCondition(90) // 'immortal-phoenix'
 */
export function classifyEmberCondition(score: number): EmberCondition {
  if (score >= 85) return 'immortal-phoenix'
  if (score >= 70) return 'rising-flame'
  if (score >= 55) return 'steady-glow'
  if (score >= 40) return 'flickering'
  if (score >= 25) return 'dying-ember'
  return 'cold-ash'
}

/**
 * Classify nest type
 * @example
 * classifyNestType(embers) // 'golden-nest'
 */
export function classifyNestType(embers: PhoenixEmber[]): NestType {
  if (embers.length === 0) return 'empty-hearth'
  const avgQs = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)
  const immortalRatio = embers.filter(e => e.condition === 'immortal-phoenix').length / embers.length
  if (avgQs >= 75 && immortalRatio >= 0.5) return 'golden-nest'
  if (avgQs >= 60) return 'proper-nest'
  if (avgQs >= 45) return 'twig-nest'
  if (avgQs >= 30) return 'ground-nest'
  if (avgQs >= 15) return 'ash-pile'
  return 'empty-hearth'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'phoenix-lord'
 */
export function classifyKeeperGrade(avgResilience: number): KeeperGrade {
  if (avgResilience >= 80) return 'phoenix-lord'
  if (avgResilience >= 65) return 'fire-keeper'
  if (avgResilience >= 50) return 'flame-guardian'
  if (avgResilience >= 35) return 'ember-tender'
  if (avgResilience >= 20) return 'ash-collector'
  return 'fire-extinguisher'
}

/**
 * Classify nest condition
 * @example
 * classifyNestCondition(80) // 'eternal-flame'
 */
export function classifyNestCondition(avgQs: number): NestCondition {
  if (avgQs >= 75) return 'eternal-flame'
  if (avgQs >= 60) return 'burning-bright'
  if (avgQs >= 45) return 'steady-glow'
  if (avgQs >= 30) return 'fading-light'
  if (avgQs >= 15) return 'dying-embers'
  return 'extinguished'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(embers, nests, flame, stats)
 */
export function generateRecommendations(
  embers: PhoenixEmber[],
  nests: PhoenixNest[],
  flame: PhoenixFlame,
  stats: EmberPhoenixStats,
): string[] {
  const recs: string[] = []
  if (stats.avgRebirthQuality < 50) {
    recs.push('Improve rebirth quality with clean exports, efficient imports, and modern syntax')
  }
  if (stats.avgAshWisdom < 50) {
    recs.push('Deepen ash wisdom with better module alignment, engaged interfaces, and mature exports')
  }
  if (stats.avgFlamePurity < 50) {
    recs.push('Purify flames with robust error handling, flexible chaining, and forgiving patterns')
  }
  if (stats.avgWingSpan < 50) {
    recs.push('Expand wing span with clear documentation, broad interfaces, and comprehensive exports')
  }
  if (stats.avgResurrectionPotential < 50) {
    recs.push('Strengthen resurrection potential with balanced const usage, steady typing, and measured strictness')
  }
  if (stats.coldAshCount > 0) {
    recs.push(`${stats.coldAshCount} file(s) are cold ash — consider significant refactoring`)
  }
  if (flame.overallResilience < 40) {
    recs.push('Overall resilience is low — focus on rebirth quality and ash wisdom')
  }
  const allCold = nests.every(n => n.nestType === 'empty-hearth' || n.nestType === 'ash-pile')
  if (allCold && nests.length > 0) {
    recs.push('All phoenix nests are degraded — consider a major restoration effort')
  }
  const cold = embers.filter(e => e.condition === 'cold-ash').map(e => e.file)
  if (cold.length > 0 && cold.length <= 3) {
    recs.push(`Rekindle these cold ashes: ${cold.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your phoenix rises with legendary grace! Every ember burns with purpose')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a phoenix ember
 * @example
 * const ember = analyzePhoenixEmber(content, 'index.ts')
 * console.log(ember.condition) // 'immortal-phoenix'
 */
export function analyzePhoenixEmber(content: string, filePath: string): PhoenixEmber {
  const rebirthing = measureRebirthing(content)
  const learning = measureLearning(content)
  const purifying = measurePurifying(content)
  const spreading = measureSpreading(content)
  const resurrecting = measureResurrecting(content)

  const qualityScore = Math.round(
    rebirthing.quality * 0.2 +
    learning.wisdom * 0.2 +
    purifying.purity * 0.2 +
    spreading.span * 0.2 +
    resurrecting.potential * 0.2,
  )

  return {
    file: filePath,
    rebirthQuality: rebirthing.quality,
    ashWisdom: learning.wisdom,
    flamePurity: purifying.purity,
    wingSpan: spreading.span,
    resurrectionPotential: resurrecting.potential,
    rebirthing,
    learning,
    purifying,
    spreading,
    resurrecting,
    condition: classifyEmberCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a phoenix nest
 * @example
 * const nest = analyzePhoenixNest(embers, 'src')
 * console.log(nest.nestType) // 'golden-nest'
 */
export function analyzePhoenixNest(embers: PhoenixEmber[], dirPath: string): PhoenixNest {
  if (embers.length === 0) {
    return {
      directory: dirPath, embers: [], avgRebirth: 0, avgWisdom: 0, avgPurity: 0,
      immortalPhoenixCount: 0, coldAshCount: 0, nestType: 'empty-hearth', condition: 'extinguished',
    }
  }

  const avgRebirth = Math.round(embers.reduce((s, e) => s + e.rebirthQuality, 0) / embers.length)
  const avgWisdom = Math.round(embers.reduce((s, e) => s + e.ashWisdom, 0) / embers.length)
  const avgPurity = Math.round(embers.reduce((s, e) => s + e.flamePurity, 0) / embers.length)
  const immortalPhoenixCount = embers.filter(e => e.condition === 'immortal-phoenix').length
  const coldAshCount = embers.filter(e => e.condition === 'cold-ash').length
  const avgQs = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)

  return {
    directory: dirPath, embers, avgRebirth, avgWisdom, avgPurity,
    immortalPhoenixCount, coldAshCount, nestType: classifyNestType(embers),
    condition: classifyNestCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete ember-phoenix result
 * @example
 * const result = await buildEmberPhoenixResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'phoenix-lord'
 */
export async function buildEmberPhoenixResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmberPhoenixResult> {
  const embers = files.map((file, i) => analyzePhoenixEmber(contents[i] ?? '', file))

  const dirMap = new Map<string, PhoenixEmber[]>()
  for (const ember of embers) {
    const dir = path.dirname(ember.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ember) } else { dirMap.set(dir, [ember]) }
  }

  const nests = Array.from(dirMap.entries()).map(([dir, dirEmbers]) =>
    analyzePhoenixNest(dirEmbers, dir),
  )

  const avgRebirth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.rebirthQuality, 0) / embers.length) : 0
  const avgWisdom = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.ashWisdom, 0) / embers.length) : 0
  const avgPurity = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.flamePurity, 0) / embers.length) : 0

  const overallResilience = embers.length > 0
    ? Math.round((avgRebirth + avgWisdom + avgPurity) / 3) : 0
  const isBurning = avgRebirth >= 60

  const flame: PhoenixFlame = { avgRebirth, avgWisdom, avgPurity, isBurning, overallResilience }

  const avgWingSpan = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.wingSpan, 0) / embers.length) : 0
  const avgResurrectionPotential = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.resurrectionPotential, 0) / embers.length) : 0

  const bestEmber = embers.length > 0
    ? embers.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const mostReborn = embers.length > 0
    ? embers.reduce((best, e) => e.rebirthQuality > best.rebirthQuality ? e : best).file : ''
  const wisest = embers.length > 0
    ? embers.reduce((best, e) => e.ashWisdom > best.ashWisdom ? e : best).file : ''
  const purest = embers.length > 0
    ? embers.reduce((best, e) => e.flamePurity > best.flamePurity ? e : best).file : ''
  const broadest = embers.length > 0
    ? embers.reduce((best, e) => e.wingSpan > best.wingSpan ? e : best).file : ''

  const stats: EmberPhoenixStats = {
    totalFiles: embers.length,
    totalNests: nests.length,
    avgRebirthQuality: avgRebirth,
    avgAshWisdom: avgWisdom,
    avgFlamePurity: avgPurity,
    avgWingSpan,
    avgResurrectionPotential,
    immortalPhoenixCount: embers.filter(e => e.condition === 'immortal-phoenix').length,
    risingFlameCount: embers.filter(e => e.condition === 'rising-flame').length,
    steadyGlowCount: embers.filter(e => e.condition === 'steady-glow').length,
    flickeringCount: embers.filter(e => e.condition === 'flickering').length,
    dyingEmberCount: embers.filter(e => e.condition === 'dying-ember').length,
    coldAshCount: embers.filter(e => e.condition === 'cold-ash').length,
    hasHighQualityCount: embers.filter(e => e.rebirthing.hasHighQuality).length,
    hasHighWisdomCount: embers.filter(e => e.learning.hasHighWisdom).length,
    hasHighPurityCount: embers.filter(e => e.purifying.hasHighPurity).length,
    hasHighSpanCount: embers.filter(e => e.spreading.hasHighSpan).length,
    hasHighPotentialCount: embers.filter(e => e.resurrecting.hasHighPotential).length,
    overallResilience,
    keeperGrade: classifyKeeperGrade(overallResilience),
    bestEmber, mostReborn, wisest, purest, broadest,
  }

  const recommendations = generateRecommendations(embers, nests, flame, stats)

  return { embers, nests, flame, stats, recommendations }
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
