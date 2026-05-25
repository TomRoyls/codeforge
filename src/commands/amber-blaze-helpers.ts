// ─── Types ───────────────────────────────────────────────

import { dirname } from 'node:path'
import fg from 'fast-glob'

// ─── Measure Enums ──────────────────────────────────────

export type PreservingAmber = 'golden-preservation' | 'warm-amber' | 'proper-resin' | 'cool-stone' | 'cold-ice' | 'no-warmth'
export type IlluminatingGlow = 'radiant-amber' | 'warm-glow' | 'proper-light' | 'dim-flicker' | 'dark-ember' | 'no-glow'
export type PersistingFire = 'eternal-ember' | 'persistent-flame' | 'proper-glow' | 'fading-spark' | 'dead-ash' | 'no-persistence'
export type LearningAsh = 'ancient-wisdom' | 'experienced-ash' | 'proper-remains' | 'fresh-smoke' | 'no-fire' | 'no-wisdom'
export type BindingResin = 'diamond-hard-resin' | 'strong-amber' | 'proper-bond' | 'weak-glue' | 'crumbling-bond' | 'no-strength'
export type EmberCondition = 'amber-masterpiece' | 'golden-ember' | 'proper-glow' | 'cool-stone' | 'dead-ash' | 'void'
export type HearthType = 'grand-fireplace' | 'warm-hearth' | 'proper-fire' | 'small-flame' | 'cold-ash' | 'no-hearth'
export type HearthCondition = 'amber-temple' | 'golden-hearth' | 'proper-fireplace' | 'cool-hearth' | 'dead-ashes' | 'void'
export type KeeperGrade = 'amber-keeper' | 'fire-tender' | 'ember-guardian' | 'apprentice' | 'novice' | 'ash-scatterer'

// ─── Measure Interfaces ─────────────────────────────────

export interface PreservingMeasure {
  warmth: number
  amber: PreservingAmber
  hasHighWarmth: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasValuable: boolean
  hasNoTrivial: boolean
  hasPreserved: boolean
  hasNoDiscarded: boolean
  undocumentedCount: number
  untestedCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  glow: IlluminatingGlow
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasObvious: boolean
  hasNoSubtle: boolean
  hasWarm: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface PersistingMeasure {
  persistence: number
  fire: PersistingFire
  hasHighPersistence: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasResilient: boolean
  hasNoBrittle: boolean
  hasEnduring: boolean
  hasNoTemporary: boolean
  hasReliable: boolean
  bareCrashCount: number
  fragileCount: number
}

export interface LearningMeasure {
  wisdom: number
  ash: LearningAsh
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasInsightful: boolean
  hasNoObvious: boolean
  hasStrategic: boolean
  hackedCount: number
  adHocCount: number
}

export interface BindingMeasure {
  strength: number
  resin: BindingResin
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasCohesive: boolean
  hasNoFragmented: boolean
  hasStrong: boolean
  hasNoWeak: boolean
  hasSolid: boolean
  chaoticCount: number
  tangledCount: number
}

// ─── Core Types ─────────────────────────────────────────

export interface AmberGlow {
  file: string
  preservationWarmth: number
  glowClarity: number
  firePersistence: number
  ashWisdom: number
  resinStrength: number
  preserving: PreservingMeasure
  illuminating: IlluminatingMeasure
  persisting: PersistingMeasure
  learning: LearningMeasure
  binding: BindingMeasure
  condition: EmberCondition
  qualityScore: number
}

export interface AmberHearth {
  directory: string
  glows: AmberGlow[]
  avgWarmth: number
  avgPersistence: number
  avgStrength: number
  amberMasterpieceCount: number
  voidCount: number
  hearthType: HearthType
  condition: HearthCondition
}

export interface AmberFire {
  avgWarmth: number
  avgPersistence: number
  avgStrength: number
  isAmber: boolean
  overallRadiance: number
}

export interface AmberStats {
  totalFiles: number
  totalHearths: number
  avgPreservationWarmth: number
  avgGlowClarity: number
  avgFirePersistence: number
  avgAshWisdom: number
  avgResinStrength: number
  amberMasterpieceCount: number
  goldenEmberCount: number
  properGlowCount: number
  coolStoneCount: number
  deadAshCount: number
  voidCount: number
  hasHighWarmthCount: number
  hasHighClarityCount: number
  hasHighPersistenceCount: number
  hasHighWisdomCount: number
  hasHighStrengthCount: number
  overallRadiance: number
  keeperGrade: KeeperGrade
  bestGlow: string
  warmest: string
  clearest: string
  mostPersistent: string
  wisest: string
  strongest: string
}

export interface AmberEmberResult {
  glows: AmberGlow[]
  hearths: AmberHearth[]
  fire: AmberFire
  stats: AmberStats
  recommendations: string[]
}

// ─── Utility ────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Grade Classifiers ──────────────────────────────────

function classifyPreservingAmber(warmth: number): PreservingAmber {
  if (warmth >= 90) return 'golden-preservation'
  if (warmth >= 75) return 'warm-amber'
  if (warmth >= 60) return 'proper-resin'
  if (warmth >= 40) return 'cool-stone'
  if (warmth >= 20) return 'cold-ice'
  return 'no-warmth'
}

function classifyIlluminatingGlow(clarity: number): IlluminatingGlow {
  if (clarity >= 90) return 'radiant-amber'
  if (clarity >= 75) return 'warm-glow'
  if (clarity >= 60) return 'proper-light'
  if (clarity >= 40) return 'dim-flicker'
  if (clarity >= 20) return 'dark-ember'
  return 'no-glow'
}

function classifyPersistingFire(persistence: number): PersistingFire {
  if (persistence >= 90) return 'eternal-ember'
  if (persistence >= 75) return 'persistent-flame'
  if (persistence >= 60) return 'proper-glow'
  if (persistence >= 40) return 'fading-spark'
  if (persistence >= 20) return 'dead-ash'
  return 'no-persistence'
}

function classifyLearningAsh(wisdom: number): LearningAsh {
  if (wisdom >= 90) return 'ancient-wisdom'
  if (wisdom >= 75) return 'experienced-ash'
  if (wisdom >= 60) return 'proper-remains'
  if (wisdom >= 40) return 'fresh-smoke'
  if (wisdom >= 20) return 'no-fire'
  return 'no-wisdom'
}

function classifyBindingResin(strength: number): BindingResin {
  if (strength >= 90) return 'diamond-hard-resin'
  if (strength >= 75) return 'strong-amber'
  if (strength >= 60) return 'proper-bond'
  if (strength >= 40) return 'weak-glue'
  if (strength >= 20) return 'crumbling-bond'
  return 'no-strength'
}

/**
 * @example classifyEmberCondition(85) // 'amber-masterpiece'
 */
export function classifyEmberCondition(score: number): EmberCondition {
  if (score >= 90) return 'amber-masterpiece'
  if (score >= 75) return 'golden-ember'
  if (score >= 60) return 'proper-glow'
  if (score >= 40) return 'cool-stone'
  if (score >= 20) return 'dead-ash'
  return 'void'
}

/**
 * @example classifyHearthType(glows)
 */
export function classifyHearthType(glows: AmberGlow[]): HearthType {
  if (glows.length === 0) return 'no-hearth'
  const avg = glows.reduce((s, g) => s + g.qualityScore, 0) / glows.length
  if (avg >= 85) return 'grand-fireplace'
  if (avg >= 70) return 'warm-hearth'
  if (avg >= 55) return 'proper-fire'
  if (avg >= 35) return 'small-flame'
  if (avg >= 15) return 'cold-ash'
  return 'no-hearth'
}

/**
 * @example classifyKeeperGrade(80) // 'amber-keeper'
 */
export function classifyKeeperGrade(avgRadiance: number): KeeperGrade {
  if (avgRadiance >= 80) return 'amber-keeper'
  if (avgRadiance >= 65) return 'fire-tender'
  if (avgRadiance >= 50) return 'ember-guardian'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'ash-scatterer'
}

/**
 * @example classifyHearthCondition(75) // 'amber-temple'
 */
export function classifyHearthCondition(avg: number): HearthCondition {
  if (avg >= 85) return 'amber-temple'
  if (avg >= 70) return 'golden-hearth'
  if (avg >= 55) return 'proper-fireplace'
  if (avg >= 35) return 'cool-hearth'
  if (avg >= 15) return 'dead-ashes'
  return 'void'
}

// ─── measurePreserving ──────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasReadonly, hasPrivate, hasTryCatch = 7 → 100

/**
 * @example measurePreserving('export function preserve(input: string): Result { try { return parse(input) } catch { throw new Error("fail") } }')
 */
export function measurePreserving(content: string): PreservingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasReadonly) score += 14
  if (hasPrivate) score += 14
  if (hasTryCatch) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const undocumentedCount = hasAny ? 1 : 0
  const untestedCount = hasVar

  const warmth = Math.min(100, Math.max(0, score))

  return {
    warmth,
    amber: classifyPreservingAmber(warmth),
    hasHighWarmth: warmth >= 80,
    hasDocumented: hasDoc,
    hasNoUndocumented: undocumentedCount === 0,
    hasTested: hasTryCatch,
    hasNoUntested: untestedCount === 0,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasAny,
    hasEncapsulated: hasPrivate && !hasAny,
    hasNoLeaked: !hasAny,
    hasMaintained: hasDoc && hasReturnType,
    hasNoAbandoned: !hasEval,
    hasStable: hasReturnType && !hasAny,
    hasNoVolatile: !hasEval,
    hasValuable: hasExport && hasReturnType,
    hasNoTrivial: hasExport,
    hasPreserved: hasDoc && hasTryCatch && !hasAny,
    hasNoDiscarded: !hasEval,
    undocumentedCount,
    untestedCount,
  }
}

// ─── measureIlluminating ────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasNamed, hasInterface = 6 → 100

/**
 * @example measureIlluminating('export function illuminate(input: string): Result {}')
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)

  if (hasDoc) score += 17
  if (hasExport) score += 17
  if (hasReturnType) score += 17
  if (hasGenerics) score += 17
  if (hasNamed) score += 16
  if (hasInterface) score += 16

  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const crypticCount = (hasEval ? 1 : 0) + (hasTsIgnore ? 1 : 0)
  const obfuscatedCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const clarity = Math.min(100, Math.max(0, score))

  return {
    clarity,
    glow: classifyIlluminatingGlow(clarity),
    hasHighClarity: clarity >= 80,
    hasReadable: hasDoc && hasExport,
    hasNoCryptic: crypticCount === 0,
    hasSelfDocumenting: hasNamed && hasReturnType,
    hasNoMystery: crypticCount === 0,
    hasClear: hasReturnType || hasDoc,
    hasNoObfuscated: obfuscatedCount === 0,
    hasTransparent: hasExport && hasReturnType,
    hasNoHidden: !hasAny,
    hasUnderstandable: hasDoc || hasNamed,
    hasNoArcane: !hasEval && !hasAny,
    hasVisible: hasExport,
    hasNoInvisible: !hasEval,
    hasObvious: hasReturnType && hasExport,
    hasNoSubtle: !hasTsIgnore,
    hasWarm: hasDoc && hasReturnType && !hasAny,
    crypticCount,
    obfuscatedCount,
  }
}

// ─── measurePersisting ──────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasReturnType, hasGenerics,
//   hasReadonly, hasTryCatch, hasStrictChecks = 7 → 100

/**
 * @example measurePersisting('export function persist(input: Readonly<Type>): Type { try { return input } catch { throw new Error("fail") } }')
 */
export function measurePersisting(content: string): PersistingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasStrictChecks = hasPattern(content, /===|!==/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasReadonly) score += 14
  if (hasTryCatch) score += 14
  if (hasStrictChecks) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const bareCrashCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)
  const fragileCount = hasVar + (hasAny ? 1 : 0)

  const persistence = Math.min(100, Math.max(0, score))

  return {
    persistence,
    fire: classifyPersistingFire(persistence),
    hasHighPersistence: persistence >= 80,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: bareCrashCount === 0,
    hasDefensive: hasTryCatch && !hasAny,
    hasNoNaive: !hasAny,
    hasGraceful: hasTryCatch && hasReturnType,
    hasNoHarshFail: !hasEval,
    hasRecoverable: hasTryCatch && hasReturnType,
    hasNoFatal: !hasEval,
    hasRobust: hasReturnType && hasTryCatch && !hasAny,
    hasNoFragile: fragileCount === 0,
    hasResilient: hasTryCatch && hasGenerics,
    hasNoBrittle: !hasAny,
    hasEnduring: hasDoc && hasTryCatch,
    hasNoTemporary: !hasEval,
    hasReliable: hasReturnType && hasTryCatch && !hasAny,
    bareCrashCount,
    fragileCount,
  }
}

// ─── measureLearning ────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasInterface, hasReturnType,
//   hasGenerics, hasReadonly, hasClass, hasPrivate, hasTryCatch = 9 → 100

/**
 * @example measureLearning('export interface Config<T> { readonly items: ReadonlyArray<T> }')
 */
export function measureLearning(content: string): LearningMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 11
  if (hasExport) score += 11
  if (hasInterface) score += 11
  if (hasReturnType) score += 11
  if (hasGenerics) score += 11
  if (hasReadonly) score += 11
  if (hasClass) score += 11
  if (hasPrivate) score += 11
  if (hasTryCatch) score += 12

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const hackedCount = hasVar
  const adHocCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const wisdom = Math.min(100, Math.max(0, score))

  return {
    wisdom,
    ash: classifyLearningAsh(wisdom),
    hasHighWisdom: wisdom >= 80,
    hasWellArchitected: hasInterface && !hasAny,
    hasNoHacked: hackedCount === 0,
    hasPrincipled: hasGenerics && hasReturnType,
    hasNoAdHoc: adHocCount === 0,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: hackedCount === 0,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasAny,
    hasPatterned: hasInterface || hasClass,
    hasNoReinvented: !hasAny,
    hasDeep: hasGenerics && hasReadonly,
    hasNoShallow: !hasAny,
    hasInsightful: hasDoc && hasReturnType,
    hasNoObvious: !hasAny,
    hasStrategic: hasTryCatch && hasGenerics,
    hackedCount,
    adHocCount,
  }
}

// ─── measureBinding ─────────────────────────────────────
// richContent features (no hasConst): hasDoc, hasExport, hasInterface, hasReturnType,
//   hasGenerics, hasReadonly, hasClass, hasPrivate, hasTryCatch = 9 → 100

/**
 * @example measureBinding('export interface Config<T> { readonly items: ReadonlyArray<T> }')
 */
export function measureBinding(content: string): BindingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 11
  if (hasExport) score += 11
  if (hasInterface) score += 11
  if (hasReturnType) score += 11
  if (hasGenerics) score += 11
  if (hasReadonly) score += 11
  if (hasClass) score += 11
  if (hasPrivate) score += 11
  if (hasTryCatch) score += 12

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const chaoticCount = hasVar
  const tangledCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const strength = Math.min(100, Math.max(0, score))

  return {
    strength,
    resin: classifyBindingResin(strength),
    hasHighStrength: strength >= 80,
    hasWellStructured: hasInterface && !hasAny,
    hasNoChaotic: chaoticCount === 0,
    hasModular: hasInterface || hasClass,
    hasNoMonolithic: !hasAny,
    hasOrganized: hasDoc && hasExport,
    hasNoScattered: chaoticCount === 0,
    hasCleanPipelines: hasReturnType && hasExport,
    hasNoTangled: tangledCount === 0,
    hasEfficient: hasReturnType && !hasAny,
    hasNoWasteful: !hasAny,
    hasCohesive: hasGenerics && hasReadonly && !hasAny,
    hasNoFragmented: tangledCount === 0,
    hasStrong: hasReturnType && hasGenerics && !hasAny,
    hasNoWeak: !hasAny,
    hasSolid: hasInterface && hasReturnType && !hasAny,
    chaoticCount,
    tangledCount,
  }
}

// ─── analyzeAmberGlow ───────────────────────────────────

/**
 * @example analyzeAmberGlow(richContent, 'ember.ts')
 */
export function analyzeAmberGlow(content: string, filePath: string): AmberGlow {
  const preserving = measurePreserving(content)
  const illuminating = measureIlluminating(content)
  const persisting = measurePersisting(content)
  const learning = measureLearning(content)
  const binding = measureBinding(content)

  const preservationWarmth = preserving.warmth
  const glowClarity = illuminating.clarity
  const firePersistence = persisting.persistence
  const ashWisdom = learning.wisdom
  const resinStrength = binding.strength

  const qualityScore = Math.round(
    preservationWarmth * 0.2 +
    glowClarity * 0.2 +
    firePersistence * 0.2 +
    ashWisdom * 0.2 +
    resinStrength * 0.2,
  )

  return {
    file: filePath,
    preservationWarmth,
    glowClarity,
    firePersistence,
    ashWisdom,
    resinStrength,
    preserving,
    illuminating,
    persisting,
    learning,
    binding,
    condition: classifyEmberCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeAmberHearth ─────────────────────────────────

/**
 * @example analyzeAmberHearth(glows, 'src')
 */
export function analyzeAmberHearth(glows: AmberGlow[], dirPath: string): AmberHearth {
  if (glows.length === 0) {
    return {
      directory: dirPath,
      glows: [],
      avgWarmth: 0,
      avgPersistence: 0,
      avgStrength: 0,
      amberMasterpieceCount: 0,
      voidCount: 0,
      hearthType: 'no-hearth',
      condition: 'void',
    }
  }

  const avgWarmth = Math.round(glows.reduce((s, g) => s + g.preservationWarmth, 0) / glows.length)
  const avgPersistence = Math.round(glows.reduce((s, g) => s + g.firePersistence, 0) / glows.length)
  const avgStrength = Math.round(glows.reduce((s, g) => s + g.resinStrength, 0) / glows.length)

  const amberMasterpieceCount = glows.filter(g => g.condition === 'amber-masterpiece').length
  const voidCount = glows.filter(g => g.condition === 'void').length

  const hearthType = classifyHearthType(glows)
  const overallAvg = Math.round((avgWarmth + avgPersistence + avgStrength) / 3)

  return {
    directory: dirPath,
    glows,
    avgWarmth,
    avgPersistence,
    avgStrength,
    amberMasterpieceCount,
    voidCount,
    hearthType,
    condition: classifyHearthCondition(overallAvg),
  }
}

// ─── generateRecommendations ────────────────────────────

/**
 * @example generateRecommendations(glows, hearths, fire, stats)
 */
export function generateRecommendations(
  glows: AmberGlow[],
  hearths: AmberHearth[],
  fire: AmberFire,
  stats: AmberStats,
): string[] {
  const recs: string[] = []

  if (fire.overallRadiance >= 90 && stats.voidCount === 0) {
    recs.push('Your amber ember burns with eternal warmth! Every glow is preservation, every ember is wisdom')
    return recs
  }

  if (stats.avgPreservationWarmth < 50) {
    recs.push('Warm the amber preservation — add documentation, type safety, and error handling to protect valuable logic')
  }
  if (stats.avgGlowClarity < 50) {
    recs.push('Brighten the ember glow — add exports, clear naming, and transparent logic for warm understanding')
  }
  if (stats.avgFirePersistence < 50) {
    recs.push('Stoke the fire persistence — add error handling, defensive patterns, and graceful recovery')
  }
  if (stats.avgAshWisdom < 50) {
    recs.push('Gather ash wisdom — add interfaces, proven patterns, and principled design from experience')
  }
  if (stats.avgResinStrength < 50) {
    recs.push('Strengthen the resin bonds — add interfaces, generics, and structural patterns for unyielding integrity')
  }

  const dead = glows.filter(g => g.condition === 'void' || g.condition === 'dead-ash')
  if (dead.length > 0 && dead.length <= 3) {
    recs.push(`Rekindle these dead ashes: ${dead.map(g => g.file).join(', ')}`)
  } else if (dead.length > 3) {
    recs.push(`${dead.length} dead ashes need rekindling — prioritize the coldest embers`)
  }

  const coldHearths = hearths.filter(h => h.hearthType === 'cold-ash' || h.hearthType === 'no-hearth')
  if (coldHearths.length > 0) {
    recs.push(`${coldHearths.length} hearth(s) are cold or empty — consider restructuring or removing dead code`)
  }

  if (!fire.isAmber) {
    recs.push('Overall radiance is below 60 — focus on strengthening core code quality')
  }

  if (recs.length === 0) {
    recs.push('The amber ember endures — keep glowing with preservation and wisdom')
  }

  return recs
}

// ─── gatherFiles ────────────────────────────────────────

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

// ─── buildAmberEmberResult ──────────────────────────────

/**
 * @example buildAmberEmberResult(['a.ts'], [content])
 */
export async function buildAmberEmberResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberEmberResult> {
  const glows = files.map((file, i) =>
    analyzeAmberGlow(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberGlow[]>()
  for (const g of glows) {
    const dir = dirname(g.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(g)
    } else {
      dirMap.set(dir, [g])
    }
  }

  const hearths = Array.from(dirMap.entries()).map(([dir, gs]) =>
    analyzeAmberHearth(gs, dir),
  )

  const totalFiles = glows.length
  const avgPreservationWarmth = totalFiles > 0 ? Math.round(glows.reduce((s, g) => s + g.preservationWarmth, 0) / totalFiles) : 0
  const avgGlowClarity = totalFiles > 0 ? Math.round(glows.reduce((s, g) => s + g.glowClarity, 0) / totalFiles) : 0
  const avgFirePersistence = totalFiles > 0 ? Math.round(glows.reduce((s, g) => s + g.firePersistence, 0) / totalFiles) : 0
  const avgAshWisdom = totalFiles > 0 ? Math.round(glows.reduce((s, g) => s + g.ashWisdom, 0) / totalFiles) : 0
  const avgResinStrength = totalFiles > 0 ? Math.round(glows.reduce((s, g) => s + g.resinStrength, 0) / totalFiles) : 0

  const overallRadiance = Math.round(
    (avgPreservationWarmth + avgGlowClarity + avgFirePersistence + avgAshWisdom + avgResinStrength) / 5,
  )

  const bestBy = (fn: (g: AmberGlow) => number) =>
    glows.length > 0 ? glows.reduce((best, g) => fn(g) > fn(best) ? g : best).file : 'none'

  const stats: AmberStats = {
    totalFiles,
    totalHearths: hearths.length,
    avgPreservationWarmth,
    avgGlowClarity,
    avgFirePersistence,
    avgAshWisdom,
    avgResinStrength,
    amberMasterpieceCount: glows.filter(g => g.condition === 'amber-masterpiece').length,
    goldenEmberCount: glows.filter(g => g.condition === 'golden-ember').length,
    properGlowCount: glows.filter(g => g.condition === 'proper-glow').length,
    coolStoneCount: glows.filter(g => g.condition === 'cool-stone').length,
    deadAshCount: glows.filter(g => g.condition === 'dead-ash').length,
    voidCount: glows.filter(g => g.condition === 'void').length,
    hasHighWarmthCount: glows.filter(g => g.preserving.hasHighWarmth).length,
    hasHighClarityCount: glows.filter(g => g.illuminating.hasHighClarity).length,
    hasHighPersistenceCount: glows.filter(g => g.persisting.hasHighPersistence).length,
    hasHighWisdomCount: glows.filter(g => g.learning.hasHighWisdom).length,
    hasHighStrengthCount: glows.filter(g => g.binding.hasHighStrength).length,
    overallRadiance,
    keeperGrade: classifyKeeperGrade(overallRadiance),
    bestGlow: bestBy(g => g.qualityScore),
    warmest: bestBy(g => g.preservationWarmth),
    clearest: bestBy(g => g.glowClarity),
    mostPersistent: bestBy(g => g.firePersistence),
    wisest: bestBy(g => g.ashWisdom),
    strongest: bestBy(g => g.resinStrength),
  }

  const fire: AmberFire = {
    avgWarmth: avgPreservationWarmth,
    avgPersistence: avgFirePersistence,
    avgStrength: avgResinStrength,
    isAmber: overallRadiance >= 60,
    overallRadiance,
  }

  const recommendations = generateRecommendations(glows, hearths, fire, stats)

  return { glows, hearths, fire, stats, recommendations }
}
