// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type AgingGrade = 'ancient-patina' | 'aged-beauty' | 'proper-aging' | 'premature-wear' | 'fresh-copper' | 'no-patina'
export type ConductivityType = 'superconductor' | 'high-conductivity' | 'proper-flow' | 'resistive-wire' | 'insulated' | 'no-conductivity'
export type VerdigrisType = 'stunning-patina' | 'beautiful-green' | 'proper-color' | 'patchy-surface' | 'tarnished' | 'no-beauty'
export type AlloyType = 'bronze-masterpiece' | 'strong-alloy' | 'proper-mix' | 'weak-bond' | 'brittle-composite' | 'no-alloy'
export type TowerType = 'century-tower' | 'solid-foundation' | 'proper-base' | 'shaky-ground' | 'sinking-foundation' | 'no-stability'
export type ShingleCondition = 'cathedral-spire' | 'patina-tower' | 'proper-spire' | 'rusty-pole' | 'corroded-wire' | 'scrap'
export type SpireTowerType = 'grand-cathedral' | 'copper-tower' | 'proper-spire' | 'small-steeple' | 'weather-vane' | 'no-tower'
export type SpireCondition = 'magnificent-spire' | 'beautiful-tower' | 'decent-steeple' | 'weathered-pole' | 'fallen-spire' | 'void'
export type ArchitectGrade = 'master-architect' | 'tower-builder' | 'skilled-craftsman' | 'apprentice' | 'novice' | 'scrap-dealer'

export interface AgingMeasure {
  wisdom: number
  grade: AgingGrade
  hasHighWisdom: boolean
  hasIterated: boolean
  hasNoFirstDraft: boolean
  hasRefactored: boolean
  hasNoUnchanged: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasEvolved: boolean
  hasNoStatic: boolean
  hasImproved: boolean
  hasNoStagnant: boolean
  firstDraftCount: number
  unchangedCount: number
}

export interface ConductingMeasure {
  quality: number
  conductivity: ConductivityType
  hasHighQuality: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoRedundant: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasCached: boolean
  hasNoRecalculating: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  bottleneckCount: number
  recalculatingCount: number
}

export interface BeautifyingMeasure {
  beauty: number
  verdigris: VerdigrisType
  hasHighBeauty: boolean
  hasElegant: boolean
  hasReadable: boolean
  hasNoUgly: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasFormatted: boolean
  hasNoMessy: boolean
  hasGraceful: boolean
  uglyCount: number
  crypticCount: number
}

export interface AlloyingMeasure {
  resilience: number
  alloy: AlloyType
  hasHighResilience: boolean
  hasWellIntegrated: boolean
  hasCleanInterfaces: boolean
  hasNoLeakyAbstractions: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCompatible: boolean
  hasNoConflicts: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasCohesive: boolean
  leakyAbstractionCount: number
  monolithicCount: number
}

export interface StabilizingMeasure {
  stability: number
  tower: TowerType
  hasHighStability: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasBackwardCompatible: boolean
  hasNoBreakingChanges: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  untestedCount: number
  unsafeCount: number
}

export interface CopperShingle {
  file: string
  patinaWisdom: number
  conductivityQuality: number
  verdigrisBeauty: number
  alloyResilience: number
  towerStability: number
  aging: AgingMeasure
  conducting: ConductingMeasure
  beautifying: BeautifyingMeasure
  alloying: AlloyingMeasure
  stabilizing: StabilizingMeasure
  condition: ShingleCondition
  qualityScore: number
}

export interface SpireTower {
  directory: string
  shingles: CopperShingle[]
  avgWisdom: number
  avgConductivity: number
  avgStability: number
  cathedralSpireCount: number
  scrapCount: number
  towerType: SpireTowerType
  condition: SpireCondition
}

export interface CopperSkyline {
  avgWisdom: number
  avgConductivity: number
  avgStability: number
  isMagnificent: boolean
  overallElegance: number
}

export interface CopperSpireStats {
  totalFiles: number
  totalTowers: number
  avgPatinaWisdom: number
  avgConductivityQuality: number
  avgVerdigrisBeauty: number
  avgAlloyResilience: number
  avgTowerStability: number
  cathedralSpireCount: number
  patinaTowerCount: number
  properSpireCount: number
  rustyPoleCount: number
  corrodedWireCount: number
  scrapCount: number
  hasHighWisdomCount: number
  hasHighQualityCount: number
  hasHighBeautyCount: number
  hasHighResilienceCount: number
  hasHighStabilityCount: number
  overallElegance: number
  architectGrade: ArchitectGrade
  bestShingle: string
  wisest: string
  bestConductor: string
  mostBeautiful: string
  mostStable: string
}

export interface CopperSpireResult {
  shingles: CopperShingle[]
  towers: SpireTower[]
  skyline: CopperSkyline
  stats: CopperSpireStats
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
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure patina wisdom (code that gains character through iteration)
 * @example
 * const m = measureAging(content)
 * console.log(m.grade) // 'ancient-patina'
 */
export function measureAging(content: string): AgingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasIterated = hasInterface(content) && hasEnum(content)
  const hasRefactored = hasTypeAlias(content) && hasExport(content)
  const hasPolished = hasReturnType(content) && hasDocComments(content)
  const hasEvolved = hasConst(content) && hasNamedExport(content)
  const hasImproved = hasReadonly(content) && hasGenerics(content)
  const hasNoStagnant = hasOptional(content) && hasPrivate(content)

  score += hasIterated ? 5 : 0
  score += hasRefactored ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasEvolved ? 5 : 0
  score += hasImproved ? 5 : 0
  score += hasNoStagnant ? 5 : 0

  const wisdom = Math.min(score, 100)
  const firstDraftCount = countMatches(/\bvar\b/, content)
  const unchangedCount = countMatches(/\bany\b/, content)

  const hasNoFirstDraft = firstDraftCount === 0
  const hasNoUnchanged = unchangedCount === 0
  const hasNoRough = countMatches(/\beval\b/, content) === 0
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let grade: AgingGrade
  if (wisdom >= 85) grade = 'ancient-patina'
  else if (wisdom >= 70) grade = 'aged-beauty'
  else if (wisdom >= 55) grade = 'proper-aging'
  else if (wisdom >= 40) grade = 'premature-wear'
  else if (wisdom >= 25) grade = 'fresh-copper'
  else grade = 'no-patina'

  return {
    wisdom, grade, hasHighWisdom, hasIterated, hasNoFirstDraft, hasRefactored,
    hasNoUnchanged, hasPolished, hasNoRough, hasEvolved, hasNoStatic, hasImproved,
    hasNoStagnant, firstDraftCount, unchangedCount,
  }
}

/**
 * Measure conductivity quality (data flow efficiency)
 * @example
 * const m = measureConducting(content)
 * console.log(m.conductivity) // 'superconductor'
 */
export function measureConducting(content: string): ConductingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasMapFunction(content) ? 8 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasEfficientFlow = hasExport(content) && hasReturnType(content)
  const hasDirectPaths = hasNamedExport(content) && hasConst(content)
  const hasStreamlined = hasMapFunction(content) && hasArrowFunction(content)
  const hasCached = hasInterface(content) && hasTypeAlias(content)
  const hasOptimized = hasAsync(content) && hasOptional(content)
  const hasNoIndirection = hasGenerics(content) && hasDocComments(content)

  score += hasEfficientFlow ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasNoIndirection ? 5 : 0

  const quality = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const recalculatingCount = countMatches(/\beval\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoRedundant = countMatches(/\bany\b/, content) === 0
  const hasNoRecalculating = recalculatingCount === 0
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let conductivity: ConductivityType
  if (quality >= 85) conductivity = 'superconductor'
  else if (quality >= 70) conductivity = 'high-conductivity'
  else if (quality >= 55) conductivity = 'proper-flow'
  else if (quality >= 40) conductivity = 'resistive-wire'
  else if (quality >= 25) conductivity = 'insulated'
  else conductivity = 'no-conductivity'

  return {
    quality, conductivity, hasHighQuality, hasEfficientFlow, hasNoBottlenecks,
    hasStreamlined, hasNoRedundant, hasDirectPaths, hasNoIndirection, hasCached,
    hasNoRecalculating, hasOptimized, hasNoWasteful, bottleneckCount, recalculatingCount,
  }
}

/**
 * Measure verdigris beauty (code aesthetic evolution)
 * @example
 * const m = measureBeautifying(content)
 * console.log(m.verdigris) // 'stunning-patina'
 */
export function measureBeautifying(content: string): BeautifyingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasStrictEq(content) ? 4 : 0

  const hasElegant = hasExport(content) && hasInterface(content)
  const hasReadable = hasConst(content) && hasReturnType(content)
  const hasWellNamed = hasNamedExport(content) && hasTypeAlias(content)
  const hasConsistent = hasEnum(content) && hasReadonly(content)
  const hasFormatted = hasDocComments(content) && hasOptional(content)
  const hasGraceful = hasGenerics(content) && hasStrictEq(content)

  score += hasElegant ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasFormatted ? 5 : 0
  score += hasGraceful ? 5 : 0

  const beauty = Math.min(score, 100)
  const uglyCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoUgly = uglyCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoInconsistent = countMatches(/\beval\b/, content) === 0
  const hasNoMessy = !has(/\bdebugger\b/, content)
  const hasHighBeauty = beauty >= 70

  let verdigris: VerdigrisType
  if (beauty >= 85) verdigris = 'stunning-patina'
  else if (beauty >= 70) verdigris = 'beautiful-green'
  else if (beauty >= 55) verdigris = 'proper-color'
  else if (beauty >= 40) verdigris = 'patchy-surface'
  else if (beauty >= 25) verdigris = 'tarnished'
  else verdigris = 'no-beauty'

  return {
    beauty, verdigris, hasHighBeauty, hasElegant, hasReadable, hasNoUgly,
    hasWellNamed, hasNoCryptic, hasConsistent, hasNoInconsistent, hasFormatted,
    hasNoMessy, hasGraceful, uglyCount, crypticCount,
  }
}

/**
 * Measure alloy resilience (integration strength)
 * @example
 * const m = measureAlloying(content)
 * console.log(m.alloy) // 'bronze-masterpiece'
 */
export function measureAlloying(content: string): AlloyingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasWellIntegrated = hasInterface(content) && hasExport(content)
  const hasCleanInterfaces = hasEnum(content) && hasTypeAlias(content)
  const hasModular = hasReturnType(content) && hasConst(content)
  const hasCompatible = hasDocComments(content) && hasReadonly(content)
  const hasTested = hasNamedExport(content) && hasGenerics(content)
  const hasCohesive = hasOptional(content) && hasPrivate(content)

  score += hasWellIntegrated ? 5 : 0
  score += hasCleanInterfaces ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasCompatible ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasCohesive ? 5 : 0

  const resilience = Math.min(score, 100)
  const leakyAbstractionCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoLeakyAbstractions = leakyAbstractionCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoConflicts = countMatches(/\beval\b/, content) === 0
  const hasNoUntested = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let alloy: AlloyType
  if (resilience >= 85) alloy = 'bronze-masterpiece'
  else if (resilience >= 70) alloy = 'strong-alloy'
  else if (resilience >= 55) alloy = 'proper-mix'
  else if (resilience >= 40) alloy = 'weak-bond'
  else if (resilience >= 25) alloy = 'brittle-composite'
  else alloy = 'no-alloy'

  return {
    resilience, alloy, hasHighResilience, hasWellIntegrated, hasCleanInterfaces,
    hasNoLeakyAbstractions, hasModular, hasNoMonolithic, hasCompatible, hasNoConflicts,
    hasTested, hasNoUntested, hasCohesive, leakyAbstractionCount, monolithicCount,
  }
}

/**
 * Measure tower stability (foundational reliability)
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.tower) // 'century-tower'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasTypeSafe = hasStrictEq(content) && hasReturnType(content)
  const hasDocumented = hasInterface(content) && hasExport(content)
  const hasBackwardCompatible = hasReadonly(content) && hasOptional(content)
  const hasVersioned = hasEnum(content) && hasTypeAlias(content)
  const hasTested = hasConst(content) && hasGenerics(content)
  const hasNoUnversioned = hasDocComments(content) && hasPrivate(content)

  score += hasTypeSafe ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasBackwardCompatible ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasNoUnversioned ? 5 : 0

  const stability = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const unsafeCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = unsafeCount === 0
  const hasNoBreakingChanges = countMatches(/\beval\b/, content) === 0
  const hasNoUndocumented = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let tower: TowerType
  if (stability >= 85) tower = 'century-tower'
  else if (stability >= 70) tower = 'solid-foundation'
  else if (stability >= 55) tower = 'proper-base'
  else if (stability >= 40) tower = 'shaky-ground'
  else if (stability >= 25) tower = 'sinking-foundation'
  else tower = 'no-stability'

  return {
    stability, tower, hasHighStability, hasTested, hasNoUntested, hasTypeSafe,
    hasNoUnsafe, hasDocumented, hasNoUndocumented, hasBackwardCompatible,
    hasNoBreakingChanges, hasVersioned, hasNoUnversioned, untestedCount, unsafeCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify shingle condition
 * @example
 * classifyShingleCondition(90) // 'cathedral-spire'
 */
export function classifyShingleCondition(score: number): ShingleCondition {
  if (score >= 85) return 'cathedral-spire'
  if (score >= 70) return 'patina-tower'
  if (score >= 55) return 'proper-spire'
  if (score >= 40) return 'rusty-pole'
  if (score >= 25) return 'corroded-wire'
  return 'scrap'
}

/**
 * Classify tower type
 * @example
 * classifyTowerType(shingles) // 'grand-cathedral'
 */
export function classifyTowerType(shingles: CopperShingle[]): SpireTowerType {
  if (shingles.length === 0) return 'no-tower'
  const avgQs = Math.round(shingles.reduce((s, sh) => s + sh.qualityScore, 0) / shingles.length)
  const masterpieceRatio = shingles.filter(sh => sh.condition === 'cathedral-spire').length / shingles.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'grand-cathedral'
  if (avgQs >= 60) return 'copper-tower'
  if (avgQs >= 45) return 'proper-spire'
  if (avgQs >= 30) return 'small-steeple'
  if (avgQs >= 15) return 'weather-vane'
  return 'no-tower'
}

/**
 * Classify tower condition
 * @example
 * classifyTowerCondition(80) // 'magnificent-spire'
 */
export function classifyTowerCondition(avgQs: number): SpireCondition {
  if (avgQs >= 75) return 'magnificent-spire'
  if (avgQs >= 60) return 'beautiful-tower'
  if (avgQs >= 45) return 'decent-steeple'
  if (avgQs >= 30) return 'weathered-pole'
  if (avgQs >= 15) return 'fallen-spire'
  return 'void'
}

/**
 * Classify architect grade
 * @example
 * classifyArchitectGrade(85) // 'master-architect'
 */
export function classifyArchitectGrade(avgElegance: number): ArchitectGrade {
  if (avgElegance >= 80) return 'master-architect'
  if (avgElegance >= 65) return 'tower-builder'
  if (avgElegance >= 50) return 'skilled-craftsman'
  if (avgElegance >= 35) return 'apprentice'
  if (avgElegance >= 20) return 'novice'
  return 'scrap-dealer'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(shingles, towers, skyline, stats)
 */
export function generateRecommendations(
  shingles: CopperShingle[],
  towers: SpireTower[],
  skyline: CopperSkyline,
  stats: CopperSpireStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPatinaWisdom < 50) {
    recs.push('Build patina wisdom with interfaces, enums, type aliases, and iterative refinements')
  }
  if (stats.avgConductivityQuality < 50) {
    recs.push('Improve conductivity quality with efficient exports, direct data paths, and streamlined pipelines')
  }
  if (stats.avgVerdigrisBeauty < 50) {
    recs.push('Cultivate verdigris beauty with elegant patterns, well-named exports, and consistent formatting')
  }
  if (stats.avgAlloyResilience < 50) {
    recs.push('Strengthen alloy resilience with clean interfaces, modular exports, and cohesive integration')
  }
  if (stats.avgTowerStability < 50) {
    recs.push('Reinforce tower stability with strict equality, type safety, and thorough documentation')
  }
  if (stats.scrapCount > 0) {
    recs.push(`${stats.scrapCount} file(s) are scrap — they need complete spire reconstruction`)
  }
  if (skyline.overallElegance < 40) {
    recs.push('Overall elegance is dangerously low — focus on wisdom, conductivity, and stability first')
  }
  const allWeak = towers.every(t => t.towerType === 'no-tower' || t.towerType === 'weather-vane')
  if (allWeak && towers.length > 0) {
    recs.push('All spire towers are weak — consider a major system-wide architectural reconstruction')
  }
  const scrapFiles = shingles.filter(sh => sh.condition === 'scrap').map(sh => sh.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Rebuild these scrap files: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The copper spire gleams magnificently! Every shingle radiates wisdom, conductivity, beauty, resilience, and stability')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as copper shingle
 * @example
 * const shingle = analyzeCopperShingle(content, 'index.ts')
 * console.log(shingle.condition) // 'cathedral-spire'
 */
export function analyzeCopperShingle(content: string, filePath: string): CopperShingle {
  const aging = measureAging(content)
  const conducting = measureConducting(content)
  const beautifying = measureBeautifying(content)
  const alloying = measureAlloying(content)
  const stabilizing = measureStabilizing(content)

  const qualityScore = Math.round(
    aging.wisdom * 0.2 +
    conducting.quality * 0.2 +
    beautifying.beauty * 0.2 +
    alloying.resilience * 0.2 +
    stabilizing.stability * 0.2,
  )

  return {
    file: filePath,
    patinaWisdom: aging.wisdom,
    conductivityQuality: conducting.quality,
    verdigrisBeauty: beautifying.beauty,
    alloyResilience: alloying.resilience,
    towerStability: stabilizing.stability,
    aging, conducting, beautifying, alloying, stabilizing,
    condition: classifyShingleCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as spire tower
 * @example
 * const tower = analyzeSpireTower(shingles, 'src')
 * console.log(tower.towerType) // 'grand-cathedral'
 */
export function analyzeSpireTower(shingles: CopperShingle[], dirPath: string): SpireTower {
  if (shingles.length === 0) {
    return {
      directory: dirPath, shingles: [], avgWisdom: 0, avgConductivity: 0,
      avgStability: 0, cathedralSpireCount: 0, scrapCount: 0,
      towerType: 'no-tower', condition: 'void',
    }
  }

  const avgWisdom = Math.round(shingles.reduce((s, sh) => s + sh.patinaWisdom, 0) / shingles.length)
  const avgConductivity = Math.round(shingles.reduce((s, sh) => s + sh.conductivityQuality, 0) / shingles.length)
  const avgStability = Math.round(shingles.reduce((s, sh) => s + sh.towerStability, 0) / shingles.length)
  const cathedralSpireCount = shingles.filter(sh => sh.condition === 'cathedral-spire').length
  const scrapCount = shingles.filter(sh => sh.condition === 'scrap').length
  const avgQs = Math.round(shingles.reduce((s, sh) => s + sh.qualityScore, 0) / shingles.length)

  return {
    directory: dirPath, shingles, avgWisdom, avgConductivity, avgStability,
    cathedralSpireCount, scrapCount,
    towerType: classifyTowerType(shingles),
    condition: classifyTowerCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete copper spire result
 * @example
 * const result = await buildCopperSpireResult(files, contents)
 * console.log(result.stats.architectGrade) // 'master-architect'
 */
export async function buildCopperSpireResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperSpireResult> {
  const shingles = files.map((file, i) => analyzeCopperShingle(contents[i] ?? '', file))

  const dirMap = new Map<string, CopperShingle[]>()
  for (const shingle of shingles) {
    const dir = path.dirname(shingle.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(shingle) } else { dirMap.set(dir, [shingle]) }
  }

  const towers = Array.from(dirMap.entries()).map(([dir, dirShingles]) =>
    analyzeSpireTower(dirShingles, dir),
  )

  const avgWisdom = shingles.length > 0
    ? Math.round(shingles.reduce((s, sh) => s + sh.patinaWisdom, 0) / shingles.length) : 0
  const avgConductivity = shingles.length > 0
    ? Math.round(shingles.reduce((s, sh) => s + sh.conductivityQuality, 0) / shingles.length) : 0
  const avgStability = shingles.length > 0
    ? Math.round(shingles.reduce((s, sh) => s + sh.towerStability, 0) / shingles.length) : 0

  const overallElegance = shingles.length > 0
    ? Math.round((avgWisdom + avgConductivity + avgStability) / 3) : 0
  const isMagnificent = avgWisdom >= 60

  const skyline: CopperSkyline = { avgWisdom, avgConductivity, avgStability, isMagnificent, overallElegance }

  const avgPatinaWisdom = avgWisdom
  const avgConductivityQuality = avgConductivity
  const avgVerdigrisBeauty = shingles.length > 0
    ? Math.round(shingles.reduce((s, sh) => s + sh.verdigrisBeauty, 0) / shingles.length) : 0
  const avgAlloyResilience = shingles.length > 0
    ? Math.round(shingles.reduce((s, sh) => s + sh.alloyResilience, 0) / shingles.length) : 0
  const avgTowerStability = avgStability

  const bestShingle = shingles.length > 0
    ? shingles.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file : ''
  const wisest = shingles.length > 0
    ? shingles.reduce((best, sh) => sh.patinaWisdom > best.patinaWisdom ? sh : best).file : ''
  const bestConductor = shingles.length > 0
    ? shingles.reduce((best, sh) => sh.conductivityQuality > best.conductivityQuality ? sh : best).file : ''
  const mostBeautiful = shingles.length > 0
    ? shingles.reduce((best, sh) => sh.verdigrisBeauty > best.verdigrisBeauty ? sh : best).file : ''
  const mostStable = shingles.length > 0
    ? shingles.reduce((best, sh) => sh.towerStability > best.towerStability ? sh : best).file : ''

  const stats: CopperSpireStats = {
    totalFiles: shingles.length,
    totalTowers: towers.length,
    avgPatinaWisdom, avgConductivityQuality, avgVerdigrisBeauty, avgAlloyResilience, avgTowerStability,
    cathedralSpireCount: shingles.filter(sh => sh.condition === 'cathedral-spire').length,
    patinaTowerCount: shingles.filter(sh => sh.condition === 'patina-tower').length,
    properSpireCount: shingles.filter(sh => sh.condition === 'proper-spire').length,
    rustyPoleCount: shingles.filter(sh => sh.condition === 'rusty-pole').length,
    corrodedWireCount: shingles.filter(sh => sh.condition === 'corroded-wire').length,
    scrapCount: shingles.filter(sh => sh.condition === 'scrap').length,
    hasHighWisdomCount: shingles.filter(sh => sh.aging.hasHighWisdom).length,
    hasHighQualityCount: shingles.filter(sh => sh.conducting.hasHighQuality).length,
    hasHighBeautyCount: shingles.filter(sh => sh.beautifying.hasHighBeauty).length,
    hasHighResilienceCount: shingles.filter(sh => sh.alloying.hasHighResilience).length,
    hasHighStabilityCount: shingles.filter(sh => sh.stabilizing.hasHighStability).length,
    overallElegance,
    architectGrade: classifyArchitectGrade(overallElegance),
    bestShingle, wisest, bestConductor, mostBeautiful, mostStable,
  }

  const recommendations = generateRecommendations(shingles, towers, skyline, stats)

  return { shingles, towers, skyline, stats, recommendations }
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
