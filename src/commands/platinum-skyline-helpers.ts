// ─── Interfaces ──────────────────────────────────────────

export interface PurifyingMeasure {
  purity: number
  grade: 'triple-nine' | 'refined-platinum' | 'proper-grade' | 'industrial-grade' | 'ore-grade' | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasPure: boolean
  hasHonest: boolean
  hasUncontaminated: boolean
  hasFaithful: boolean
  hasGenuine: boolean
  hasAuthentic: boolean
  hasRefined: boolean
  unsafeCount: number
  contradictoryCount: number
}

export interface EnvisioningMeasure {
  vision: number
  horizon: 'infinite-vista' | 'far-horizon' | 'proper-sight' | 'near-hill' | 'blind-alley' | 'no-vision'
  hasHighVision: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasScalable: boolean
  hasFutureProof: boolean
  hasAbstracted: boolean
  hasGeneralized: boolean
  hasPluggable: boolean
  hasConfigurable: boolean
  hasDecoupled: boolean
  hasOpen: boolean
  hasEvolving: boolean
  hasAdaptive: boolean
  hasForward: boolean
  hackedCount: number
  rigidCount: number
}

export interface EnduringMeasure {
  resilience: number
  temper: 'indestructible' | 'platinum-hard' | 'proper-temper' | 'soft-metal' | 'crumbles' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasReinforced: boolean
  hasImpervious: boolean
  hasDurable: boolean
  hasPermanent: boolean
  hasUnfailing: boolean
  unhandledCount: number
  untestedCount: number
}

export interface CommandingMeasure {
  authority: number
  crest: 'platinum-record' | 'gold-standard' | 'proper-medal' | 'honorable-mention' | 'participation' | 'no-authority'
  hasHighAuthority: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasClear: boolean
  hasConfident: boolean
  hasDecisive: boolean
  hasAuthoritative: boolean
  hasStrong: boolean
  hasBold: boolean
  hasCommanding: boolean
  hasDirect: boolean
  hasAssertive: boolean
  hasFirm: boolean
  hasPrincipled: boolean
  chaoticCount: number
  weakCount: number
}

export interface AnticipatingMeasure {
  wisdom: number
  foresight: 'oracle-vision' | 'strategic-thinker' | 'proper-planner' | 'reactive-coder' | 'surprised' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasHolistic: boolean
  hasLongTerm: boolean
  hasAnticipating: boolean
  hasPrepared: boolean
  hasFarsighted: boolean
  hasPrescient: boolean
  hasProphetic: boolean
  shallowCount: number
  reactiveCount: number
}

export type IngotCondition =
  | 'platinum-masterpiece'
  | 'royal-standard'
  | 'proper-metal'
  | 'base-alloy'
  | 'scrap-metal'
  | 'void'

export interface PlatinumIngot {
  file: string
  royalPurity: number
  horizonVision: number
  platinumResilience: number
  crestAuthority: number
  futureWisdom: number
  purifying: PurifyingMeasure
  envisioning: EnvisioningMeasure
  enduring: EnduringMeasure
  commanding: CommandingMeasure
  anticipating: AnticipatingMeasure
  condition: IngotCondition
  qualityScore: number
}

export type RidgeType =
  | 'mountain-range'
  | 'platinum-ridge'
  | 'proper-crest'
  | 'foothill'
  | 'flatland'
  | 'no-ridge'

export type RidgeCondition =
  | 'platinum-summit'
  | 'golden-peak'
  | 'proper-mountain'
  | 'rocky-hill'
  | 'sand-dune'
  | 'void'

export interface PlatinumRidge {
  directory: string
  ingots: PlatinumIngot[]
  avgPurity: number
  avgVision: number
  avgWisdom: number
  platinumMasterpieceCount: number
  voidCount: number
  ridgeType: RidgeType
  condition: RidgeCondition
}

export interface PlatinumSkylineResult {
  ingots: PlatinumIngot[]
  ridges: PlatinumRidge[]
  vista: {
    avgPurity: number
    avgVision: number
    avgWisdom: number
    isPlatinum: boolean
    overallElevation: number
  }
  stats: {
    totalFiles: number
    totalRidges: number
    avgRoyalPurity: number
    avgHorizonVision: number
    avgPlatinumResilience: number
    avgCrestAuthority: number
    avgFutureWisdom: number
    platinumMasterpieceCount: number
    royalStandardCount: number
    properMetalCount: number
    baseAlloyCount: number
    scrapMetalCount: number
    voidCount: number
    hasHighPurityCount: number
    hasHighVisionCount: number
    hasHighResilienceCount: number
    hasHighAuthorityCount: number
    hasHighWisdomCount: number
    overallElevation: number
    alchemistGrade: 'grand-alchemist' | 'platinum-smith' | 'proper-metallurgist' | 'apprentice' | 'novice' | 'lead-painter'
    bestIngot: string
    purest: string
    mostVisionary: string
    mostResilient: string
    mostAuthoritative: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifyIngotCondition(90) */
export function classifyIngotCondition(score: number): IngotCondition {
  if (score >= 90) return 'platinum-masterpiece'
  if (score >= 75) return 'royal-standard'
  if (score >= 60) return 'proper-metal'
  if (score >= 40) return 'base-alloy'
  if (score >= 20) return 'scrap-metal'
  return 'void'
}

/** @example classifyRidgeType(ingots) */
export function classifyRidgeType(ingots: PlatinumIngot[]): RidgeType {
  if (ingots.length === 0) return 'no-ridge'
  const avg =
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length
  if (avg >= 85) return 'mountain-range'
  if (avg >= 70) return 'platinum-ridge'
  if (avg >= 55) return 'proper-crest'
  if (avg >= 35) return 'foothill'
  return 'flatland'
}

/** @example classifyRidgeCondition(85) */
export function classifyRidgeCondition(score: number): RidgeCondition {
  if (score >= 85) return 'platinum-summit'
  if (score >= 70) return 'golden-peak'
  if (score >= 55) return 'proper-mountain'
  if (score >= 35) return 'rocky-hill'
  if (score >= 15) return 'sand-dune'
  return 'void'
}

/** @example classifyAlchemistGrade(80) */
export function classifyAlchemistGrade(
  avgElevation: number,
): PlatinumSkylineResult['stats']['alchemistGrade'] {
  if (avgElevation >= 80) return 'grand-alchemist'
  if (avgElevation >= 65) return 'platinum-smith'
  if (avgElevation >= 50) return 'proper-metallurgist'
  if (avgElevation >= 35) return 'apprentice'
  if (avgElevation >= 20) return 'novice'
  return 'lead-painter'
}

// ─── Measure functions ──────────────────────────────────

/** @example measurePurifying('const x: string = ""') */
export function measurePurifying(content: string): PurifyingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasNoDirty = (content.match(/\b(dirty|hacky|gross)\b/gi) ?? []).length === 0
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradictory|inconsistent|conflicting)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasPure = /\b(readonly|as const)\b/.test(content)
  const hasHonest = !/\b(eval|Function)\b/.test(content)
  const hasUncontaminated = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasFaithful = /\b(try|catch|if)\b/.test(content)
  const hasGenuine = /\b(import|export)\b/.test(content)
  const hasAuthentic = /\b(class|interface|type)\b/.test(content)
  const hasRefined = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasConsistent,
    hasNoContradictory,
    hasAccurate,
    hasNoApproximate,
    hasPure,
    hasHonest,
    hasUncontaminated,
    hasFaithful,
    hasGenuine,
    hasAuthentic,
    hasRefined,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let grade: PurifyingMeasure['grade'] = 'no-purity'
  if (purity >= 90) grade = 'triple-nine'
  else if (purity >= 75) grade = 'refined-platinum'
  else if (purity >= 60) grade = 'proper-grade'
  else if (purity >= 40) grade = 'industrial-grade'
  else if (purity >= 20) grade = 'ore-grade'

  return {
    purity,
    grade,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasConsistent,
    hasNoContradictory,
    hasAccurate,
    hasNoApproximate,
    hasPure,
    hasHonest,
    hasUncontaminated,
    hasFaithful,
    hasGenuine,
    hasAuthentic,
    hasRefined,
    unsafeCount,
    contradictoryCount,
  }
}

/** @example measureEnvisioning('export interface X { readonly y: string }') */
export function measureEnvisioning(content: string): EnvisioningMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasExtensible = /\b(import|export)\b/.test(content)
  const rigidCount = (content.match(/\b(hardcoded|rigid|inflexible)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasScalable = /\b(async|await|Promise)\b/.test(content)
  const hasFutureProof = !/\bany\b/.test(content)
  const hasAbstracted = /\b(readonly|private|protected)\b/.test(content)
  const hasGeneralized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPluggable = /\b(function|=>|return)\b/.test(content)
  const hasConfigurable = /\b(try|catch|if)\b/.test(content)
  const hasDecoupled = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasOpen = /\b(export|public)\b/.test(content)
  const hasEvolving = /\b(readonly|as const)\b/.test(content)
  const hasAdaptive = /\b(return|throw)\b/.test(content)
  const hasForward = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasExtensible,
    hasNoRigid,
    hasScalable,
    hasFutureProof,
    hasAbstracted,
    hasGeneralized,
    hasPluggable,
    hasConfigurable,
    hasDecoupled,
    hasOpen,
    hasEvolving,
    hasAdaptive,
    hasForward,
  ]

  const vision = computeScore(positiveBooleans)
  const hasHighVision = vision >= 60

  let horizon: EnvisioningMeasure['horizon'] = 'no-vision'
  if (vision >= 90) horizon = 'infinite-vista'
  else if (vision >= 75) horizon = 'far-horizon'
  else if (vision >= 60) horizon = 'proper-sight'
  else if (vision >= 40) horizon = 'near-hill'
  else if (vision >= 20) horizon = 'blind-alley'

  return {
    vision,
    horizon,
    hasHighVision,
    hasWellArchitected,
    hasNoHacked,
    hasExtensible,
    hasNoRigid,
    hasScalable,
    hasFutureProof,
    hasAbstracted,
    hasGeneralized,
    hasPluggable,
    hasConfigurable,
    hasDecoupled,
    hasOpen,
    hasEvolving,
    hasAdaptive,
    hasForward,
    hackedCount,
    rigidCount,
  }
}

/** @example measureEnduring('try { x() } catch { y() }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|throw)\b/.test(content)
  const unhandledCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|readonly|const)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasHardened = !/\bany\b/.test(content)
  const hasEnduring = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasReinforced = /\b(import|export)\b/.test(content)
  const hasImpervious = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDurable = /\b(readonly|private|protected)\b/.test(content)
  const hasPermanent = /\b(async|await|Promise)\b/.test(content)
  const hasUnfailing = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasHardened,
    hasEnduring,
    hasReinforced,
    hasImpervious,
    hasDurable,
    hasPermanent,
    hasUnfailing,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let temper: EnduringMeasure['temper'] = 'no-resilience'
  if (resilience >= 90) temper = 'indestructible'
  else if (resilience >= 75) temper = 'platinum-hard'
  else if (resilience >= 60) temper = 'proper-temper'
  else if (resilience >= 40) temper = 'soft-metal'
  else if (resilience >= 20) temper = 'crumbles'

  return {
    resilience,
    temper,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasHardened,
    hasEnduring,
    hasReinforced,
    hasImpervious,
    hasDurable,
    hasPermanent,
    hasUnfailing,
    unhandledCount,
    untestedCount,
  }
}

/** @example measureCommanding('export class X { readonly y: string }') */
export function measureCommanding(content: string): CommandingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasClear = !/\bany\b/.test(content)
  const hasConfident = /\b(return|throw)\b/.test(content)
  const hasDecisive = /\b(if|switch|else)\b/.test(content)
  const hasAuthoritative = /\b(readonly|private|protected)\b/.test(content)
  const hasStrong = /\b(import|export)\b/.test(content)
  const hasBold = /\b(async|await|Promise)\b/.test(content)
  const hasCommanding = /\b(function|=>)\b/.test(content)
  const hasDirect = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasAssertive = /\b(readonly|as const)\b/.test(content)
  const hasFirm = /\b(const)\b/.test(content)
  const weakCount = (content.match(/\b(weak|fragile|flimsy)\b/gi) ?? []).length
  const hasPrincipled = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasDocumented,
    hasTyped,
    hasClear,
    hasConfident,
    hasDecisive,
    hasAuthoritative,
    hasStrong,
    hasBold,
    hasCommanding,
    hasDirect,
    hasAssertive,
    hasFirm,
    hasPrincipled,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60

  let crest: CommandingMeasure['crest'] = 'no-authority'
  if (authority >= 90) crest = 'platinum-record'
  else if (authority >= 75) crest = 'gold-standard'
  else if (authority >= 60) crest = 'proper-medal'
  else if (authority >= 40) crest = 'honorable-mention'
  else if (authority >= 20) crest = 'participation'

  return {
    authority,
    crest,
    hasHighAuthority,
    hasWellStructured,
    hasNoChaotic,
    hasDocumented,
    hasTyped,
    hasClear,
    hasConfident,
    hasDecisive,
    hasAuthoritative,
    hasStrong,
    hasBold,
    hasCommanding,
    hasDirect,
    hasAssertive,
    hasFirm,
    hasPrincipled,
    chaoticCount,
    weakCount,
  }
}

/** @example measureAnticipating('export async function plan() { await future() }') */
export function measureAnticipating(content: string): AnticipatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasProven = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMature = !/\bany\b/.test(content)
  const hasInsightful = /\b(import|export)\b/.test(content)
  const hasVisionary = /\b(function|=>|return)\b/.test(content)
  const hasHolistic = /\b(try|catch|if)\b/.test(content)
  const hasLongTerm = /\b(readonly|as const)\b/.test(content)
  const hasAnticipating = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasPrepared = /\b(export|public)\b/.test(content)
  const hasFarsighted = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const shallowCount = (content.match(/\b(shallow|superficial|quick.fix)\b/gi) ?? []).length
  const hasPrescient = shallowCount === 0
  const reactiveCount = (content.match(/\b(reactive|impulsive|hasty)\b/gi) ?? []).length
  const hasProphetic = reactiveCount === 0

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasStrategic,
    hasProven,
    hasMature,
    hasInsightful,
    hasVisionary,
    hasHolistic,
    hasLongTerm,
    hasAnticipating,
    hasPrepared,
    hasFarsighted,
    hasPrescient,
    hasProphetic,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let foresight: AnticipatingMeasure['foresight'] = 'no-wisdom'
  if (wisdom >= 90) foresight = 'oracle-vision'
  else if (wisdom >= 75) foresight = 'strategic-thinker'
  else if (wisdom >= 60) foresight = 'proper-planner'
  else if (wisdom >= 40) foresight = 'reactive-coder'
  else if (wisdom >= 20) foresight = 'surprised'

  return {
    wisdom,
    foresight,
    hasHighWisdom,
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasStrategic,
    hasProven,
    hasMature,
    hasInsightful,
    hasVisionary,
    hasHolistic,
    hasLongTerm,
    hasAnticipating,
    hasPrepared,
    hasFarsighted,
    hasPrescient,
    hasProphetic,
    shallowCount,
    reactiveCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzePlatinumIngot(content, 'app.ts') */
export function analyzePlatinumIngot(content: string, filePath: string): PlatinumIngot {
  const purifying = measurePurifying(content)
  const envisioning = measureEnvisioning(content)
  const enduring = measureEnduring(content)
  const commanding = measureCommanding(content)
  const anticipating = measureAnticipating(content)

  const royalPurity = purifying.purity
  const horizonVision = envisioning.vision
  const platinumResilience = enduring.resilience
  const crestAuthority = commanding.authority
  const futureWisdom = anticipating.wisdom

  const qualityScore = Math.round(
    royalPurity * 0.2 +
    horizonVision * 0.2 +
    platinumResilience * 0.2 +
    crestAuthority * 0.2 +
    futureWisdom * 0.2,
  )

  const condition = classifyIngotCondition(qualityScore)

  return {
    file: filePath,
    royalPurity,
    horizonVision,
    platinumResilience,
    crestAuthority,
    futureWisdom,
    purifying,
    envisioning,
    enduring,
    commanding,
    anticipating,
    condition,
    qualityScore,
  }
}

/** @example analyzePlatinumRidge(ingots, 'src') */
export function analyzePlatinumRidge(ingots: PlatinumIngot[], dirPath: string): PlatinumRidge {
  if (ingots.length === 0) {
    return {
      directory: dirPath,
      ingots: [],
      avgPurity: 0,
      avgVision: 0,
      avgWisdom: 0,
      platinumMasterpieceCount: 0,
      voidCount: 0,
      ridgeType: 'no-ridge',
      condition: 'void',
    }
  }

  const avgPurity = Math.round(
    ingots.reduce((s, i) => s + i.royalPurity, 0) / ingots.length,
  )
  const avgVision = Math.round(
    ingots.reduce((s, i) => s + i.horizonVision, 0) / ingots.length,
  )
  const avgWisdom = Math.round(
    ingots.reduce((s, i) => s + i.futureWisdom, 0) / ingots.length,
  )

  const platinumMasterpieceCount = ingots.filter(
    (i) => i.condition === 'platinum-masterpiece',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const ridgeType = classifyRidgeType(ingots)
  const avgQuality = Math.round(
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length,
  )
  const condition = classifyRidgeCondition(avgQuality)

  return {
    directory: dirPath,
    ingots,
    avgPurity,
    avgVision,
    avgWisdom,
    platinumMasterpieceCount,
    voidCount,
    ridgeType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildPlatinumSkylineResult(['a.ts'], [content]) */
export async function buildPlatinumSkylineResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PlatinumSkylineResult> {
  const ingots: PlatinumIngot[] = files.map((file, i) =>
    analyzePlatinumIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PlatinumIngot[]>()
  for (const ingot of ingots) {
    const dir = ingot.file.includes('/')
      ? ingot.file.substring(0, ingot.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ingot)
    } else {
      dirMap.set(dir, [ingot])
    }
  }

  const ridges: PlatinumRidge[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzePlatinumRidge(dirIngots, dir),
  )

  const avgPurity =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.royalPurity, 0) / ingots.length)
      : 0
  const avgVision =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.horizonVision, 0) / ingots.length)
      : 0
  const avgWisdom =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.futureWisdom, 0) / ingots.length)
      : 0

  const overallElevation =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)
      : 0
  const isPlatinum = overallElevation >= 60

  const vista = { avgPurity, avgVision, avgWisdom, isPlatinum, overallElevation }

  const avgRoyalPurity = avgPurity
  const avgHorizonVision = avgVision
  const avgPlatinumResilience =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.platinumResilience, 0) / ingots.length)
      : 0
  const avgCrestAuthority =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.crestAuthority, 0) / ingots.length)
      : 0
  const avgFutureWisdom = avgWisdom

  const platinumMasterpieceCount = ingots.filter(
    (i) => i.condition === 'platinum-masterpiece',
  ).length
  const royalStandardCount = ingots.filter(
    (i) => i.condition === 'royal-standard',
  ).length
  const properMetalCount = ingots.filter(
    (i) => i.condition === 'proper-metal',
  ).length
  const baseAlloyCount = ingots.filter(
    (i) => i.condition === 'base-alloy',
  ).length
  const scrapMetalCount = ingots.filter(
    (i) => i.condition === 'scrap-metal',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const hasHighPurityCount = ingots.filter(
    (i) => i.purifying.hasHighPurity,
  ).length
  const hasHighVisionCount = ingots.filter(
    (i) => i.envisioning.hasHighVision,
  ).length
  const hasHighResilienceCount = ingots.filter(
    (i) => i.enduring.hasHighResilience,
  ).length
  const hasHighAuthorityCount = ingots.filter(
    (i) => i.commanding.hasHighAuthority,
  ).length
  const hasHighWisdomCount = ingots.filter(
    (i) => i.anticipating.hasHighWisdom,
  ).length

  const alchemistGrade = classifyAlchemistGrade(overallElevation)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => (i.qualityScore > best.qualityScore ? i : best)).file
    : ''
  const purest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.royalPurity > best.royalPurity ? i : best)).file
    : ''
  const mostVisionary = ingots.length > 0
    ? ingots.reduce((best, i) => (i.horizonVision > best.horizonVision ? i : best)).file
    : ''
  const mostResilient = ingots.length > 0
    ? ingots.reduce((best, i) => (i.platinumResilience > best.platinumResilience ? i : best)).file
    : ''
  const mostAuthoritative = ingots.length > 0
    ? ingots.reduce((best, i) => (i.crestAuthority > best.crestAuthority ? i : best)).file
    : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.futureWisdom > best.futureWisdom ? i : best)).file
    : ''

  const stats: PlatinumSkylineResult['stats'] = {
    totalFiles: files.length,
    totalRidges: ridges.length,
    avgRoyalPurity,
    avgHorizonVision,
    avgPlatinumResilience,
    avgCrestAuthority,
    avgFutureWisdom,
    platinumMasterpieceCount,
    royalStandardCount,
    properMetalCount,
    baseAlloyCount,
    scrapMetalCount,
    voidCount,
    hasHighPurityCount,
    hasHighVisionCount,
    hasHighResilienceCount,
    hasHighAuthorityCount,
    hasHighWisdomCount,
    overallElevation,
    alchemistGrade,
    bestIngot,
    purest,
    mostVisionary,
    mostResilient,
    mostAuthoritative,
    wisest,
  }

  const recommendations = generateRecommendations(ingots, ridges, vista, stats)

  return { ingots, ridges, vista, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, ridges, vista, stats) */
export function generateRecommendations(
  ingots: PlatinumIngot[],
  ridges: PlatinumRidge[],
  _vista: PlatinumSkylineResult['vista'],
  stats: PlatinumSkylineResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgRoyalPurity >= 90 &&
    stats.avgHorizonVision >= 90 &&
    stats.avgPlatinumResilience >= 90 &&
    stats.avgCrestAuthority >= 90 &&
    stats.avgFutureWisdom >= 90
  ) {
    recs.push(
      'Your platinum skyline is a masterpiece of precious architecture! Each ingot shines with the rarest purity across an infinite horizon of possibility!',
    )
    return recs
  }

  if (stats.avgRoyalPurity < 60) {
    recs.push(
      'Refine the platinum purity — the rarest metal demands the highest standards; eliminate every trace of contamination from your code',
    )
  }

  if (stats.avgHorizonVision < 60) {
    recs.push(
      'Expand the horizon vision — platinum gazes beyond the visible spectrum; your architecture should see further than the immediate implementation',
    )
  }

  if (stats.avgPlatinumResilience < 60) {
    recs.push(
      'Strengthen the platinum resilience — platinum survives temperatures that melt gold; your code must endure conditions that break lesser systems',
    )
  }

  if (stats.avgCrestAuthority < 60) {
    recs.push(
      'Elevate the crest authority — platinum records represent the highest achievement; your code should command quality at the peak',
    )
  }

  if (stats.avgFutureWisdom < 60) {
    recs.push(
      'Cultivate future wisdom — platinum investments are bets on tomorrow; your code should be informed by long-term thinking, not short-term convenience',
    )
  }

  if (stats.overallElevation < 40) {
    recs.push(
      'The skyline lies barren — until platinum seeds are planted on the horizon, no vista can emerge',
    )
  }

  const voidIngots = ingots.filter((i) => i.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(
      `Re-examine these scrap metal files: ${voidIngots.map((i) => i.file).join(', ')}`,
    )
  } else if (voidIngots.length > 5) {
    recs.push(
      `Re-examine these ${voidIngots.length} scrap metal files before the entire skyline corrodes`,
    )
  }

  const poorRidges = ridges.filter(
    (r) => r.condition === 'void' || r.condition === 'sand-dune',
  )
  if (poorRidges.length === ridges.length && ridges.length > 0) {
    recs.push(
      'All ridges have turned to sand dunes — the platinum skyline needs a complete reconstruction',
    )
  }

  if (recs.length === 0) {
    recs.push('Your platinum skyline gleams across the horizon — each ingot reflects the rarest quality under an infinite sky of possibility')
  }

  return recs
}
