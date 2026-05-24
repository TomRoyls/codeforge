// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Wisdom depth grade */
export type WisdomGrade =
  | 'ancient-wyrm'
  | 'elder-dragon'
  | 'proper-wisdom'
  | 'young-dragon'
  | 'hatchling-wisdom'
  | 'no-wisdom'

/** Scale resilience grade */
export type ArmorGrade =
  | 'impenetrable-scales'
  | 'dragon-armor'
  | 'proper-scales'
  | 'thin-hide'
  | 'exposed-skin'
  | 'no-protection'

/** Breath vitality grade */
export type BreathGrade =
  | 'celestial-breath'
  | 'vital-flame'
  | 'proper-breath'
  | 'wheezing'
  | 'shallow-breath'
  | 'no-breath'

/** Treasure guardianship grade */
export type TreasureGrade =
  | 'celestial-guardian'
  | 'treasure-hoarder'
  | 'proper-guardian'
  | 'negligent-keeper'
  | 'open-vault'
  | 'no-guard'

/** Flight elegance grade */
export type FlightGrade =
  | 'celestial-flight'
  | 'graceful-soar'
  | 'proper-flight'
  | 'clumsy-flight'
  | 'crash-landing'
  | 'no-flight'

/** Dragon condition */
export type DragonCondition =
  | 'celestial-dragon'
  | 'jade-serpent'
  | 'proper-wyrm'
  | 'wounded-drake'
  | 'earthbound-lizard'
  | 'egg'

/** Lair type */
export type LairType =
  | 'celestial-palace'
  | 'mountain-lair'
  | 'proper-cave'
  | 'shallow-den'
  | 'exposed-nest'
  | 'no-lair'

/** Lair condition */
export type LairCondition =
  | 'divine-realm'
  | 'mountain-fortress'
  | 'decent-lair'
  | 'humble-den'
  | 'ruined'
  | 'void'

/** Dragon grade */
export type DragonGrade =
  | 'dragon-emperor'
  | 'elder-wyrm'
  | 'adult-dragon'
  | 'juvenile'
  | 'hatchling'
  | 'egg-grade'

/** Knowing measurement */
export interface KnowingMeasure {
  depth: number
  grade: WisdomGrade
  hasHighDepth: boolean
  hasDomainKnowledge: boolean
  hasBusinessLogic: boolean
  hasNoMagicNumbers: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasIntentional: boolean
  magicNumberCount: number
  crypticCount: number
}

/** Armoring measurement */
export interface ArmoringMeasure {
  resilience: number
  armor: ArmorGrade
  hasHighResilience: boolean
  hasInputValidation: boolean
  hasBoundaryChecks: boolean
  hasNoUnprotectedPaths: boolean
  hasErrorGuards: boolean
  hasNoBareAccess: boolean
  hasTypeGuards: boolean
  hasNoCasts: boolean
  hasNullChecks: boolean
  hasNoAssumptions: boolean
  hasSanitization: boolean
  unprotectedCount: number
  bareAccessCount: number
}

/** Breathing measurement */
export interface BreathingMeasure {
  vitality: number
  breath: BreathGrade
  hasHighVitality: boolean
  hasEfficient: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  hasCached: boolean
  hasNoRedundant: boolean
  hasLazy: boolean
  hasNoEager: boolean
  hasStreamed: boolean
  hasNoBulkLoaded: boolean
  hasMemoized: boolean
  wastefulCount: number
  redundantCount: number
}

/** Guarding measurement */
export interface GuardingMeasure {
  guardianship: number
  treasure: TreasureGrade
  hasHighGuardianship: boolean
  hasImmutable: boolean
  hasEncapsulated: boolean
  hasNoLeaked: boolean
  hasValidated: boolean
  hasNoUnvalidated: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasSealed: boolean
  hasNoMutable: boolean
  hasGuarded: boolean
  leakedCount: number
  unvalidatedCount: number
}

/** Soaring measurement */
export interface SoaringMeasure {
  elegance: number
  flight: FlightGrade
  hasHighElegance: boolean
  hasCleanArchitecture: boolean
  hasSeparationOfConcerns: boolean
  hasNoGodObjects: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasAbstracted: boolean
  hasNoDuplicated: boolean
  hasComposable: boolean
  hasNoRigid: boolean
  hasElegant: boolean
  godObjectCount: number
  monolithicCount: number
}

/** Single file analysis */
export interface DragonScale {
  file: string
  wisdomDepth: number
  scaleResilience: number
  breathVitality: number
  treasureGuardianship: number
  flightElegance: number
  knowing: KnowingMeasure
  armoring: ArmoringMeasure
  breathing: BreathingMeasure
  guarding: GuardingMeasure
  soaring: SoaringMeasure
  condition: DragonCondition
  qualityScore: number
}

/** Directory-level lair */
export interface DragonLair {
  directory: string
  scales: DragonScale[]
  avgWisdom: number
  avgResilience: number
  avgElegance: number
  celestialDragonCount: number
  eggCount: number
  lairType: LairType
  condition: LairCondition
}

/** Dragon summary */
export interface DragonSummary {
  avgWisdom: number
  avgResilience: number
  avgElegance: number
  isCelestial: boolean
  overallMajesty: number
}

/** Full stats */
export interface JadeDragonStats {
  totalFiles: number
  totalLairs: number
  avgWisdomDepth: number
  avgScaleResilience: number
  avgBreathVitality: number
  avgTreasureGuardianship: number
  avgFlightElegance: number
  celestialDragonCount: number
  jadeSerpentCount: number
  properWyrmCount: number
  woundedDrakeCount: number
  earthboundLizardCount: number
  eggCount: number
  hasHighDepthCount: number
  hasHighResilienceCount: number
  hasHighVitalityCount: number
  hasHighGuardianshipCount: number
  hasHighEleganceCount: number
  overallMajesty: number
  dragonGrade: DragonGrade
  bestScale: string
  wisest: string
  mostResilient: string
  mostVital: string
  mostGuarding: string
}

/** Full result */
export interface JadeDragonResult {
  scales: DragonScale[]
  lairs: DragonLair[]
  dragon: DragonSummary
  stats: JadeDragonStats
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
 * Measure wisdom depth
 * @example
 * const m = measureKnowing(content)
 * console.log(m.grade) // 'ancient-wyrm'
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasDomainKnowledge = hasExport(content) && hasInterface(content)
  const hasBusinessLogic = hasNamedExport(content) && hasReturnType(content)
  const hasWellNamed = hasConst(content) && hasImport(content)
  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasStructured = hasGenerics(content) && hasInterface(content)
  const hasIntentional = hasTypeAlias(content) && hasReturnType(content)

  score += hasDomainKnowledge ? 5 : 0
  score += hasBusinessLogic ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasIntentional ? 5 : 0

  const depth = Math.min(score, 100)
  const magicNumberCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoMagicNumbers = magicNumberCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoUndocumented = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grade: WisdomGrade
  if (depth >= 85) grade = 'ancient-wyrm'
  else if (depth >= 70) grade = 'elder-dragon'
  else if (depth >= 55) grade = 'proper-wisdom'
  else if (depth >= 40) grade = 'young-dragon'
  else if (depth >= 25) grade = 'hatchling-wisdom'
  else grade = 'no-wisdom'

  return {
    depth, grade, hasHighDepth, hasDomainKnowledge, hasBusinessLogic, hasNoMagicNumbers,
    hasWellNamed, hasNoCryptic, hasDocumented, hasNoUndocumented, hasStructured,
    hasNoChaotic, hasIntentional, magicNumberCount, crypticCount,
  }
}

/**
 * Measure scale resilience
 * @example
 * const m = measureArmoring(content)
 * console.log(m.armor) // 'impenetrable-scales'
 */
export function measureArmoring(content: string): ArmoringMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasDefaultParam(content) ? 10 : 0

  const hasInputValidation = hasReturnType(content) && hasStrictEq(content)
  const hasBoundaryChecks = hasOptional(content) || hasDefaultParam(content)
  const hasErrorGuards = hasTryCatch(content) && hasReturnType(content)
  const hasTypeGuards = hasInterface(content) && hasStrictEq(content)
  const hasNullChecks = hasNullishCoalescing(content) || hasOptional(content)
  const hasSanitization = hasPrivate(content) && hasReadonly(content)

  score += hasInputValidation ? 5 : 0
  score += hasBoundaryChecks ? 5 : 0
  score += hasErrorGuards ? 5 : 0
  score += hasTypeGuards ? 5 : 0

  const resilience = Math.min(score, 100)
  const unprotectedCount = countMatches(/\bvar\b/, content)
  const bareAccessCount = countMatches(/\bany\b/, content)

  const hasNoUnprotectedPaths = unprotectedCount === 0
  const hasNoBareAccess = bareAccessCount === 0
  const hasNoCasts = !has(/\beval\b/, content)
  const hasNoAssumptions = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let armor: ArmorGrade
  if (resilience >= 85) armor = 'impenetrable-scales'
  else if (resilience >= 70) armor = 'dragon-armor'
  else if (resilience >= 55) armor = 'proper-scales'
  else if (resilience >= 40) armor = 'thin-hide'
  else if (resilience >= 25) armor = 'exposed-skin'
  else armor = 'no-protection'

  return {
    resilience, armor, hasHighResilience, hasInputValidation, hasBoundaryChecks,
    hasNoUnprotectedPaths, hasErrorGuards, hasNoBareAccess, hasTypeGuards, hasNoCasts,
    hasNullChecks, hasNoAssumptions, hasSanitization, unprotectedCount, bareAccessCount,
  }
}

/**
 * Measure breath vitality
 * @example
 * const m = measureBreathing(content)
 * console.log(m.breath) // 'celestial-breath'
 */
export function measureBreathing(content: string): BreathingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 4 : 0

  const hasEfficient = hasExport(content) && hasImport(content)
  const hasOptimized = hasAsync(content) && hasConst(content)
  const hasCached = hasReturnType(content) && hasReadonly(content)
  const hasLazy = hasGenerics(content) && hasAsync(content)
  const hasStreamed = hasNamedExport(content) && hasInterface(content)
  const hasMemoized = hasDocComments(content) && hasPrivate(content)

  score += hasEfficient ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasLazy ? 5 : 0

  const vitality = Math.min(score, 100)
  const wastefulCount = countMatches(/\bvar\b/, content)
  const redundantCount = countMatches(/\bany\b/, content)

  const hasNoWasteful = wastefulCount === 0
  const hasNoRedundant = redundantCount === 0
  const hasNoEager = !has(/\beval\b/, content)
  const hasNoBulkLoaded = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  let breath: BreathGrade
  if (vitality >= 85) breath = 'celestial-breath'
  else if (vitality >= 70) breath = 'vital-flame'
  else if (vitality >= 55) breath = 'proper-breath'
  else if (vitality >= 40) breath = 'wheezing'
  else if (vitality >= 25) breath = 'shallow-breath'
  else breath = 'no-breath'

  return {
    vitality, breath, hasHighVitality, hasEfficient, hasOptimized, hasNoWasteful,
    hasCached, hasNoRedundant, hasLazy, hasNoEager, hasStreamed, hasNoBulkLoaded,
    hasMemoized, wastefulCount, redundantCount,
  }
}

/**
 * Measure treasure guardianship
 * @example
 * const m = measureGuarding(content)
 * console.log(m.treasure) // 'celestial-guardian'
 */
export function measureGuarding(content: string): GuardingMeasure {
  let score = 0
  score += hasReadonly(content) ? 15 : 0
  score += hasPrivate(content) ? 15 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasOptional(content) ? 5 : 0
  score += hasNullishCoalescing(content) ? 5 : 0

  const hasImmutable = hasReadonly(content) && hasConst(content)
  const hasEncapsulated = hasPrivate(content) && hasClass(content)
  const hasValidated = hasReturnType(content) && hasStrictEq(content)
  const hasProtected = hasInterface(content) && hasGenerics(content)
  const hasSealed = hasReadonly(content) && hasPrivate(content)
  const hasGuarded = hasDocComments(content) && hasReturnType(content)

  score += hasImmutable ? 5 : 0
  score += hasEncapsulated ? 5 : 0
  score += hasValidated ? 5 : 0

  const guardianship = Math.min(score, 100)
  const leakedCount = countMatches(/\bvar\b/, content)
  const unvalidatedCount = countMatches(/\bany\b/, content)

  const hasNoLeaked = leakedCount === 0
  const hasNoUnvalidated = unvalidatedCount === 0
  const hasNoExposed = !has(/\beval\b/, content)
  const hasNoMutable = !has(/\bdebugger\b/, content)
  const hasHighGuardianship = guardianship >= 70

  let treasure: TreasureGrade
  if (guardianship >= 85) treasure = 'celestial-guardian'
  else if (guardianship >= 70) treasure = 'treasure-hoarder'
  else if (guardianship >= 55) treasure = 'proper-guardian'
  else if (guardianship >= 40) treasure = 'negligent-keeper'
  else if (guardianship >= 25) treasure = 'open-vault'
  else treasure = 'no-guard'

  return {
    guardianship, treasure, hasHighGuardianship, hasImmutable, hasEncapsulated, hasNoLeaked,
    hasValidated, hasNoUnvalidated, hasProtected, hasNoExposed, hasSealed, hasNoMutable,
    hasGuarded, leakedCount, unvalidatedCount,
  }
}

/**
 * Measure flight elegance
 * @example
 * const m = measureSoaring(content)
 * console.log(m.flight) // 'celestial-flight'
 */
export function measureSoaring(content: string): SoaringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasCleanArchitecture = hasExport(content) && hasImport(content)
  const hasSeparationOfConcerns = hasInterface(content) && hasClass(content)
  const hasModular = hasNamedExport(content) && hasConst(content)
  const hasAbstracted = hasAsync(content) && hasGenerics(content)
  const hasComposable = hasReturnType(content) && hasInterface(content)
  const hasElegant = hasDocComments(content) && hasExport(content)

  score += hasCleanArchitecture ? 5 : 0
  score += hasSeparationOfConcerns ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasAbstracted ? 5 : 0
  score += hasComposable ? 5 : 0
  score += hasElegant ? 5 : 0

  const elegance = Math.min(score, 100)
  const godObjectCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoGodObjects = godObjectCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoDuplicated = !has(/\beval\b/, content)
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let flight: FlightGrade
  if (elegance >= 85) flight = 'celestial-flight'
  else if (elegance >= 70) flight = 'graceful-soar'
  else if (elegance >= 55) flight = 'proper-flight'
  else if (elegance >= 40) flight = 'clumsy-flight'
  else if (elegance >= 25) flight = 'crash-landing'
  else flight = 'no-flight'

  return {
    elegance, flight, hasHighElegance, hasCleanArchitecture, hasSeparationOfConcerns,
    hasNoGodObjects, hasModular, hasNoMonolithic, hasAbstracted, hasNoDuplicated,
    hasComposable, hasNoRigid, hasElegant, godObjectCount, monolithicCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify dragon condition
 * @example
 * classifyDragonCondition(90) // 'celestial-dragon'
 */
export function classifyDragonCondition(score: number): DragonCondition {
  if (score >= 85) return 'celestial-dragon'
  if (score >= 70) return 'jade-serpent'
  if (score >= 55) return 'proper-wyrm'
  if (score >= 40) return 'wounded-drake'
  if (score >= 25) return 'earthbound-lizard'
  return 'egg'
}

/**
 * Classify lair type
 * @example
 * classifyLairType(scales) // 'celestial-palace'
 */
export function classifyLairType(scales: DragonScale[]): LairType {
  if (scales.length === 0) return 'no-lair'
  const avgQs = Math.round(scales.reduce((s, sc) => s + sc.qualityScore, 0) / scales.length)
  const celestialRatio = scales.filter(sc => sc.condition === 'celestial-dragon').length / scales.length
  if (avgQs >= 75 && celestialRatio >= 0.5) return 'celestial-palace'
  if (avgQs >= 60) return 'mountain-lair'
  if (avgQs >= 45) return 'proper-cave'
  if (avgQs >= 30) return 'shallow-den'
  if (avgQs >= 15) return 'exposed-nest'
  return 'no-lair'
}

/**
 * Classify lair condition
 * @example
 * classifyLairCondition(80) // 'divine-realm'
 */
export function classifyLairCondition(avgQs: number): LairCondition {
  if (avgQs >= 75) return 'divine-realm'
  if (avgQs >= 60) return 'mountain-fortress'
  if (avgQs >= 45) return 'decent-lair'
  if (avgQs >= 30) return 'humble-den'
  if (avgQs >= 15) return 'ruined'
  return 'void'
}

/**
 * Classify dragon grade
 * @example
 * classifyDragonGrade(85) // 'dragon-emperor'
 */
export function classifyDragonGrade(avgMajesty: number): DragonGrade {
  if (avgMajesty >= 80) return 'dragon-emperor'
  if (avgMajesty >= 65) return 'elder-wyrm'
  if (avgMajesty >= 50) return 'adult-dragon'
  if (avgMajesty >= 35) return 'juvenile'
  if (avgMajesty >= 20) return 'hatchling'
  return 'egg-grade'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(scales, lairs, dragon, stats)
 */
export function generateRecommendations(
  scales: DragonScale[],
  lairs: DragonLair[],
  dragon: DragonSummary,
  stats: JadeDragonStats,
): string[] {
  const recs: string[] = []
  if (stats.avgWisdomDepth < 50) {
    recs.push('Deepen wisdom with documented interfaces, typed domain logic, and structured generics')
  }
  if (stats.avgScaleResilience < 50) {
    recs.push('Harden scale resilience with input validation, boundary checks, and error guards')
  }
  if (stats.avgBreathVitality < 50) {
    recs.push('Boost breath vitality with efficient async patterns, optimized const usage, and cached return types')
  }
  if (stats.avgTreasureGuardianship < 50) {
    recs.push('Strengthen treasure guardianship with readonly/private encapsulation, strict equality, and sealed types')
  }
  if (stats.avgFlightElegance < 50) {
    recs.push('Improve flight elegance with modular exports, separated concerns, and abstracted async/generics')
  }
  if (stats.eggCount > 0) {
    recs.push(`${stats.eggCount} file(s) are still eggs — they need wisdom incubation`)
  }
  if (dragon.overallMajesty < 40) {
    recs.push('Overall dragon majesty is low — focus on wisdom depth and scale resilience first')
  }
  const allExposed = lairs.every(l => l.lairType === 'no-lair' || l.lairType === 'exposed-nest')
  if (allExposed && lairs.length > 0) {
    recs.push('All lairs are exposed or void — consider a major architectural overhaul')
  }
  const eggFiles = scales.filter(sc => sc.condition === 'egg').map(sc => sc.file)
  if (eggFiles.length > 0 && eggFiles.length <= 3) {
    recs.push(`Transform these egg files into celestial dragons: ${eggFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your jade dragon is dragon-emperor quality! Every scale shines with celestial wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as dragon scale
 * @example
 * const s = analyzeDragonScale(content, 'index.ts')
 * console.log(s.condition) // 'celestial-dragon'
 */
export function analyzeDragonScale(content: string, filePath: string): DragonScale {
  const knowing = measureKnowing(content)
  const armoring = measureArmoring(content)
  const breathing = measureBreathing(content)
  const guarding = measureGuarding(content)
  const soaring = measureSoaring(content)

  const qualityScore = Math.round(
    knowing.depth * 0.2 +
    armoring.resilience * 0.2 +
    breathing.vitality * 0.2 +
    guarding.guardianship * 0.2 +
    soaring.elegance * 0.2,
  )

  return {
    file: filePath,
    wisdomDepth: knowing.depth,
    scaleResilience: armoring.resilience,
    breathVitality: breathing.vitality,
    treasureGuardianship: guarding.guardianship,
    flightElegance: soaring.elegance,
    knowing,
    armoring,
    breathing,
    guarding,
    soaring,
    condition: classifyDragonCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as dragon lair
 * @example
 * const l = analyzeDragonLair(scales, 'src')
 * console.log(l.lairType) // 'celestial-palace'
 */
export function analyzeDragonLair(scales: DragonScale[], dirPath: string): DragonLair {
  if (scales.length === 0) {
    return {
      directory: dirPath, scales: [], avgWisdom: 0, avgResilience: 0, avgElegance: 0,
      celestialDragonCount: 0, eggCount: 0, lairType: 'no-lair', condition: 'void',
    }
  }

  const avgWisdom = Math.round(scales.reduce((s, sc) => s + sc.wisdomDepth, 0) / scales.length)
  const avgResilience = Math.round(scales.reduce((s, sc) => s + sc.scaleResilience, 0) / scales.length)
  const avgElegance = Math.round(scales.reduce((s, sc) => s + sc.flightElegance, 0) / scales.length)
  const celestialDragonCount = scales.filter(sc => sc.condition === 'celestial-dragon').length
  const eggCount = scales.filter(sc => sc.condition === 'egg').length
  const avgQs = Math.round(scales.reduce((s, sc) => s + sc.qualityScore, 0) / scales.length)

  return {
    directory: dirPath, scales, avgWisdom, avgResilience, avgElegance,
    celestialDragonCount, eggCount, lairType: classifyLairType(scales),
    condition: classifyLairCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete jade dragon result
 * @example
 * const result = await buildJadeDragonResult(files, contents)
 * console.log(result.stats.dragonGrade) // 'dragon-emperor'
 */
export async function buildJadeDragonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeDragonResult> {
  const scales = files.map((file, i) => analyzeDragonScale(contents[i] ?? '', file))

  const dirMap = new Map<string, DragonScale[]>()
  for (const scale of scales) {
    const dir = path.dirname(scale.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(scale) } else { dirMap.set(dir, [scale]) }
  }

  const lairs = Array.from(dirMap.entries()).map(([dir, dirScales]) =>
    analyzeDragonLair(dirScales, dir),
  )

  const avgWisdom = scales.length > 0
    ? Math.round(scales.reduce((s, sc) => s + sc.wisdomDepth, 0) / scales.length) : 0
  const avgResilience = scales.length > 0
    ? Math.round(scales.reduce((s, sc) => s + sc.scaleResilience, 0) / scales.length) : 0
  const avgElegance = scales.length > 0
    ? Math.round(scales.reduce((s, sc) => s + sc.flightElegance, 0) / scales.length) : 0

  const overallMajesty = scales.length > 0
    ? Math.round((avgWisdom + avgResilience + avgElegance) / 3) : 0
  const isCelestial = avgWisdom >= 60

  const dragon: DragonSummary = { avgWisdom, avgResilience, avgElegance, isCelestial, overallMajesty }

  const avgBreathVitality = scales.length > 0
    ? Math.round(scales.reduce((s, sc) => s + sc.breathVitality, 0) / scales.length) : 0
  const avgTreasureGuardianship = scales.length > 0
    ? Math.round(scales.reduce((s, sc) => s + sc.treasureGuardianship, 0) / scales.length) : 0
  const avgFlightElegance = scales.length > 0
    ? Math.round(scales.reduce((s, sc) => s + sc.flightElegance, 0) / scales.length) : 0

  const bestScale = scales.length > 0
    ? scales.reduce((best, sc) => sc.qualityScore > best.qualityScore ? sc : best).file : ''
  const wisest = scales.length > 0
    ? scales.reduce((best, sc) => sc.wisdomDepth > best.wisdomDepth ? sc : best).file : ''
  const mostResilient = scales.length > 0
    ? scales.reduce((best, sc) => sc.scaleResilience > best.scaleResilience ? sc : best).file : ''
  const mostVital = scales.length > 0
    ? scales.reduce((best, sc) => sc.breathVitality > best.breathVitality ? sc : best).file : ''
  const mostGuarding = scales.length > 0
    ? scales.reduce((best, sc) => sc.treasureGuardianship > best.treasureGuardianship ? sc : best).file : ''

  const stats: JadeDragonStats = {
    totalFiles: scales.length,
    totalLairs: lairs.length,
    avgWisdomDepth: avgWisdom,
    avgScaleResilience: avgResilience,
    avgBreathVitality,
    avgTreasureGuardianship,
    avgFlightElegance,
    celestialDragonCount: scales.filter(sc => sc.condition === 'celestial-dragon').length,
    jadeSerpentCount: scales.filter(sc => sc.condition === 'jade-serpent').length,
    properWyrmCount: scales.filter(sc => sc.condition === 'proper-wyrm').length,
    woundedDrakeCount: scales.filter(sc => sc.condition === 'wounded-drake').length,
    earthboundLizardCount: scales.filter(sc => sc.condition === 'earthbound-lizard').length,
    eggCount: scales.filter(sc => sc.condition === 'egg').length,
    hasHighDepthCount: scales.filter(sc => sc.knowing.hasHighDepth).length,
    hasHighResilienceCount: scales.filter(sc => sc.armoring.hasHighResilience).length,
    hasHighVitalityCount: scales.filter(sc => sc.breathing.hasHighVitality).length,
    hasHighGuardianshipCount: scales.filter(sc => sc.guarding.hasHighGuardianship).length,
    hasHighEleganceCount: scales.filter(sc => sc.soaring.hasHighElegance).length,
    overallMajesty,
    dragonGrade: classifyDragonGrade(overallMajesty),
    bestScale, wisest, mostResilient, mostVital, mostGuarding,
  }

  const recommendations = generateRecommendations(scales, lairs, dragon, stats)

  return { scales, lairs, dragon, stats, recommendations }
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
