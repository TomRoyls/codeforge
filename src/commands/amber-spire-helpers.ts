// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PreservationGrade = 'perfect-amber' | 'golden-preservation' | 'proper-resin' | 'cloudy-amber' | 'cracked-resin' | 'no-preservation'
export type StructureGrade = 'monumental-spire' | 'strong-tower' | 'proper-pillar' | 'weak-column' | 'crumbling-tower' | 'no-structure'
export type InsectGrade = 'visible-through-amber' | 'clear-specimen' | 'proper-detail' | 'blurred-detail' | 'hidden-insect' | 'no-detail'
export type ResinGrade = 'diamond-hard-resin' | 'strong-amber' | 'proper-hardening' | 'soft-resin' | 'sticky-sap' | 'no-resin'
export type TimeGrade = 'prehistoric-amber' | 'ancient-resin' | 'proper-longevity' | 'recent-fossil' | 'fresh-sap' | 'no-time'
export type SpecimenCondition = 'masterpiece-amber' | 'golden-specimen' | 'proper-fossil' | 'cloudy-resin' | 'cracked-amber' | 'dust'
export type TowerType = 'amber-cathedral' | 'golden-tower' | 'proper-spire' | 'small-pillar' | 'broken-shaft' | 'no-tower'
export type TowerCondition = 'magnificent-amber' | 'golden-collection' | 'decent-museum' | 'cracked-display' | 'dusty-shelf' | 'void'
export type CuratorGrade = 'master-curator' | 'expert-paleontologist' | 'skilled-collector' | 'apprentice' | 'novice' | 'looter'

export interface CapturingMeasure {
  quality: number
  grade: PreservationGrade
  hasHighQuality: boolean
  hasDocumented: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoUnreadable: boolean
  hasMeaningful: boolean
  hasNoArbitrary: boolean
  hasDescriptive: boolean
  hasNoVague: boolean
  hasClear: boolean
  crypticCount: number
  unreadableCount: number
}

export interface StructuringMeasure {
  golden: number
  structure: StructureGrade
  hasHighGolden: boolean
  hasSolidArchitecture: boolean
  hasWellDesigned: boolean
  hasNoShakyBase: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasScalable: boolean
  hasNoFixedCapacity: boolean
  hasEnduring: boolean
  shakyBaseCount: number
  monolithicCount: number
}

export interface RevealingMeasure {
  clarity: number
  insect: InsectGrade
  hasHighClarity: boolean
  hasTransparentLogic: boolean
  hasObservableInternals: boolean
  hasNoBlackBoxes: boolean
  hasDebuggable: boolean
  hasNoOpaque: boolean
  hasInspectable: boolean
  hasNoHiddenState: boolean
  hasLogged: boolean
  hasNoSilent: boolean
  hasVisible: boolean
  blackBoxCount: number
  opaqueCount: number
}

export interface EncapsulatingMeasure {
  strength: number
  resin: ResinGrade
  hasHighStrength: boolean
  hasEncapsulated: boolean
  hasPrivateByDefault: boolean
  hasNoLeaked: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasSealed: boolean
  hasNoOpenInternals: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasGuarded: boolean
  leakedCount: number
  mutableCount: number
}

export interface EnduringMeasure {
  depth: number
  time: TimeGrade
  hasHighDepth: boolean
  hasBackwardCompatible: boolean
  hasNoBreakingChanges: boolean
  hasVersioned: boolean
  hasNoUnversioned: boolean
  hasMigrationPaths: boolean
  hasNoDeadEnds: boolean
  hasStableAPI: boolean
  hasNoVolatileAPI: boolean
  hasDeprecationPolicy: boolean
  hasNoSuddenRemoval: boolean
  breakingChangesCount: number
  unversionedCount: number
}

export interface AmberSpecimen {
  file: string
  preservationQuality: number
  goldenStructure: number
  insectClarity: number
  resinStrength: number
  timeDepth: number
  capturing: CapturingMeasure
  structuring: StructuringMeasure
  revealing: RevealingMeasure
  encapsulating: EncapsulatingMeasure
  enduring: EnduringMeasure
  condition: SpecimenCondition
  qualityScore: number
}

export interface AmberTower {
  directory: string
  specimens: AmberSpecimen[]
  avgPreservation: number
  avgStructure: number
  avgDepth: number
  masterpieceAmberCount: number
  dustCount: number
  towerType: TowerType
  condition: TowerCondition
}

export interface AmberMuseum {
  avgPreservation: number
  avgStructure: number
  avgDepth: number
  isPreserved: boolean
  overallPreservation: number
}

export interface AmberSpireStats {
  totalFiles: number
  totalTowers: number
  avgPreservationQuality: number
  avgGoldenStructure: number
  avgInsectClarity: number
  avgResinStrength: number
  avgTimeDepth: number
  masterpieceAmberCount: number
  goldenSpecimenCount: number
  properFossilCount: number
  cloudyResinCount: number
  crackedAmberCount: number
  dustCount: number
  hasHighQualityCount: number
  hasHighGoldenCount: number
  hasHighClarityCount: number
  hasHighStrengthCount: number
  hasHighDepthCount: number
  overallPreservation: number
  curatorGrade: CuratorGrade
  bestSpecimen: string
  bestPreserved: string
  bestStructure: string
  clearest: string
  deepest: string
}

export interface AmberSpireResult {
  specimens: AmberSpecimen[]
  towers: AmberTower[]
  museum: AmberMuseum
  stats: AmberSpireStats
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
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure preservation quality (capturing)
 * @example
 * const m = measureCapturing(content)
 * console.log(m.grade) // 'perfect-amber'
 */
export function measureCapturing(content: string): CapturingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasWellNamed = hasNamedExport(content) && hasInterface(content)
  const hasSelfDocumenting = hasConst(content) && hasTypeAlias(content)
  const hasMeaningful = hasExport(content) && hasImport(content)
  const hasDescriptive = hasGenerics(content) && hasEnum(content)
  const hasClear = hasReadonly(content) && hasOptional(content)

  score += hasDocumented ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasClear ? 5 : 0

  const quality = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const unreadableCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoUnreadable = unreadableCount === 0
  const hasNoArbitrary = !has(/\beval\b/, content)
  const hasNoVague = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: PreservationGrade
  if (quality >= 85) grade = 'perfect-amber'
  else if (quality >= 70) grade = 'golden-preservation'
  else if (quality >= 55) grade = 'proper-resin'
  else if (quality >= 40) grade = 'cloudy-amber'
  else if (quality >= 25) grade = 'cracked-resin'
  else grade = 'no-preservation'

  return {
    quality, grade, hasHighQuality, hasDocumented, hasWellNamed, hasNoCryptic,
    hasSelfDocumenting, hasNoUnreadable, hasMeaningful, hasNoArbitrary,
    hasDescriptive, hasNoVague, hasClear, crypticCount, unreadableCount,
  }
}

/**
 * Measure golden structure (structuring)
 * @example
 * const m = measureStructuring(content)
 * console.log(m.structure) // 'monumental-spire'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasSolidArchitecture = hasInterface(content) && hasReturnType(content)
  const hasWellDesigned = hasGenerics(content) && hasOptional(content)
  const hasModular = hasExport(content) && hasImport(content)
  const hasLayered = hasEnum(content) && hasUnionType(content)
  const hasScalable = hasAsync(content) && hasMapFunction(content)
  const hasEnduring = hasReadonly(content) && hasConst(content)

  score += hasSolidArchitecture ? 5 : 0
  score += hasWellDesigned ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasEnduring ? 5 : 0

  const golden = Math.min(score, 100)
  const shakyBaseCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoShakyBase = shakyBaseCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoFlat = !has(/\beval\b/, content)
  const hasNoFixedCapacity = !has(/\bdebugger\b/, content)
  const hasHighGolden = golden >= 70

  let structure: StructureGrade
  if (golden >= 85) structure = 'monumental-spire'
  else if (golden >= 70) structure = 'strong-tower'
  else if (golden >= 55) structure = 'proper-pillar'
  else if (golden >= 40) structure = 'weak-column'
  else if (golden >= 25) structure = 'crumbling-tower'
  else structure = 'no-structure'

  return {
    golden, structure, hasHighGolden, hasSolidArchitecture, hasWellDesigned,
    hasNoShakyBase, hasModular, hasNoMonolithic, hasLayered, hasNoFlat,
    hasScalable, hasNoFixedCapacity, hasEnduring, shakyBaseCount, monolithicCount,
  }
}

/**
 * Measure insect clarity (revealing)
 * @example
 * const m = measureRevealing(content)
 * console.log(m.insect) // 'visible-through-amber'
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0

  const hasTransparentLogic = hasDocComments(content) && hasReturnType(content)
  const hasObservableInternals = hasInterface(content) && hasNamedExport(content)
  const hasDebuggable = hasTryCatch(content) && hasThrow(content)
  const hasInspectable = hasStrictEq(content) && hasConst(content)
  const hasLogged = hasConditional(content) && hasMapFunction(content)
  const hasVisible = hasExport(content) && hasImport(content)

  score += hasTransparentLogic ? 5 : 0
  score += hasObservableInternals ? 5 : 0
  score += hasDebuggable ? 5 : 0
  score += hasInspectable ? 5 : 0
  score += hasLogged ? 5 : 0
  score += hasVisible ? 5 : 0

  const clarity = Math.min(score, 100)
  const blackBoxCount = countMatches(/\bvar\b/, content)
  const opaqueCount = countMatches(/\bany\b/, content)

  const hasNoBlackBoxes = blackBoxCount === 0
  const hasNoOpaque = opaqueCount === 0
  const hasNoHiddenState = !has(/\beval\b/, content)
  const hasNoSilent = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let insect: InsectGrade
  if (clarity >= 85) insect = 'visible-through-amber'
  else if (clarity >= 70) insect = 'clear-specimen'
  else if (clarity >= 55) insect = 'proper-detail'
  else if (clarity >= 40) insect = 'blurred-detail'
  else if (clarity >= 25) insect = 'hidden-insect'
  else insect = 'no-detail'

  return {
    clarity, insect, hasHighClarity, hasTransparentLogic, hasObservableInternals,
    hasNoBlackBoxes, hasDebuggable, hasNoOpaque, hasInspectable, hasNoHiddenState,
    hasLogged, hasNoSilent, hasVisible, blackBoxCount, opaqueCount,
  }
}

/**
 * Measure resin strength (encapsulating)
 * @example
 * const m = measureEncapsulating(content)
 * console.log(m.resin) // 'diamond-hard-resin'
 */
export function measureEncapsulating(content: string): EncapsulatingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0

  const hasEncapsulated = hasInterface(content) && hasExport(content)
  const hasPrivateByDefault = hasReadonly(content) && hasConst(content)
  const hasImmutable = hasConst(content) && hasStrictEq(content)
  const hasSealed = hasEnum(content) && hasUnionType(content)
  const hasProtected = hasOptional(content) && hasNullishCoalescing(content)
  const hasGuarded = hasTryCatch(content) && hasReturnType(content)

  score += hasEncapsulated ? 5 : 0
  score += hasPrivateByDefault ? 5 : 0
  score += hasImmutable ? 5 : 0
  score += hasSealed ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasGuarded ? 5 : 0

  const strength = Math.min(score, 100)
  const leakedCount = countMatches(/\bvar\b/, content)
  const mutableCount = countMatches(/\bany\b/, content)

  const hasNoLeaked = leakedCount === 0
  const hasNoMutable = mutableCount === 0
  const hasNoOpenInternals = !has(/\beval\b/, content)
  const hasNoExposed = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let resin: ResinGrade
  if (strength >= 85) resin = 'diamond-hard-resin'
  else if (strength >= 70) resin = 'strong-amber'
  else if (strength >= 55) resin = 'proper-hardening'
  else if (strength >= 40) resin = 'soft-resin'
  else if (strength >= 25) resin = 'sticky-sap'
  else resin = 'no-resin'

  return {
    strength, resin, hasHighStrength, hasEncapsulated, hasPrivateByDefault,
    hasNoLeaked, hasImmutable, hasNoMutable, hasSealed, hasNoOpenInternals,
    hasProtected, hasNoExposed, hasGuarded, leakedCount, mutableCount,
  }
}

/**
 * Measure time depth (enduring)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.time) // 'prehistoric-amber'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasEnum(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0

  const hasBackwardCompatible = hasOptional(content) && hasReadonly(content)
  const hasVersioned = hasEnum(content) && hasUnionType(content)
  const hasMigrationPaths = hasDefaultParam(content) && hasOptional(content)
  const hasStableAPI = hasInterface(content) && hasReturnType(content)
  const hasDeprecationPolicy = hasDocComments(content) && hasTypeAlias(content)
  const hasNoDeadEnds = hasExport(content) && hasConst(content)

  score += hasBackwardCompatible ? 5 : 0
  score += hasVersioned ? 5 : 0
  score += hasMigrationPaths ? 5 : 0
  score += hasStableAPI ? 5 : 0
  score += hasDeprecationPolicy ? 5 : 0
  score += hasNoDeadEnds ? 5 : 0

  const depth = Math.min(score, 100)
  const breakingChangesCount = countMatches(/\bvar\b/, content)
  const unversionedCount = countMatches(/\bany\b/, content)

  const hasNoBreakingChanges = breakingChangesCount === 0
  const hasNoUnversioned = unversionedCount === 0
  const hasNoVolatileAPI = !has(/\beval\b/, content)
  const hasNoSuddenRemoval = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let time: TimeGrade
  if (depth >= 85) time = 'prehistoric-amber'
  else if (depth >= 70) time = 'ancient-resin'
  else if (depth >= 55) time = 'proper-longevity'
  else if (depth >= 40) time = 'recent-fossil'
  else if (depth >= 25) time = 'fresh-sap'
  else time = 'no-time'

  return {
    depth, time, hasHighDepth, hasBackwardCompatible, hasNoBreakingChanges,
    hasVersioned, hasNoUnversioned, hasMigrationPaths, hasNoDeadEnds,
    hasStableAPI, hasNoVolatileAPI, hasDeprecationPolicy, hasNoSuddenRemoval,
    breakingChangesCount, unversionedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify specimen condition
 * @example
 * classifySpecimenCondition(90) // 'masterpiece-amber'
 */
export function classifySpecimenCondition(score: number): SpecimenCondition {
  if (score >= 85) return 'masterpiece-amber'
  if (score >= 70) return 'golden-specimen'
  if (score >= 55) return 'proper-fossil'
  if (score >= 40) return 'cloudy-resin'
  if (score >= 25) return 'cracked-amber'
  return 'dust'
}

/**
 * Classify tower type
 * @example
 * classifyTowerType(specimens) // 'amber-cathedral'
 */
export function classifyTowerType(specimens: AmberSpecimen[]): TowerType {
  if (specimens.length === 0) return 'no-tower'
  const avgQs = Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length)
  const masterpieceRatio = specimens.filter(sp => sp.condition === 'masterpiece-amber').length / specimens.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'amber-cathedral'
  if (avgQs >= 60) return 'golden-tower'
  if (avgQs >= 45) return 'proper-spire'
  if (avgQs >= 30) return 'small-pillar'
  if (avgQs >= 15) return 'broken-shaft'
  return 'no-tower'
}

/**
 * Classify tower condition
 * @example
 * classifyTowerCondition(80) // 'magnificent-amber'
 */
export function classifyTowerCondition(avgQs: number): TowerCondition {
  if (avgQs >= 75) return 'magnificent-amber'
  if (avgQs >= 60) return 'golden-collection'
  if (avgQs >= 45) return 'decent-museum'
  if (avgQs >= 30) return 'cracked-display'
  if (avgQs >= 15) return 'dusty-shelf'
  return 'void'
}

/**
 * Classify curator grade
 * @example
 * classifyCuratorGrade(85) // 'master-curator'
 */
export function classifyCuratorGrade(avgPreservation: number): CuratorGrade {
  if (avgPreservation >= 80) return 'master-curator'
  if (avgPreservation >= 65) return 'expert-paleontologist'
  if (avgPreservation >= 50) return 'skilled-collector'
  if (avgPreservation >= 35) return 'apprentice'
  if (avgPreservation >= 20) return 'novice'
  return 'looter'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(specimens, towers, museum, stats)
 */
export function generateRecommendations(
  specimens: AmberSpecimen[],
  towers: AmberTower[],
  museum: AmberMuseum,
  stats: AmberSpireStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPreservationQuality < 50) {
    recs.push('Improve preservation quality with documentation, descriptive naming, and self-documenting code')
  }
  if (stats.avgGoldenStructure < 50) {
    recs.push('Strengthen golden structure with solid architecture, modular design, and layered abstractions')
  }
  if (stats.avgInsectClarity < 50) {
    recs.push('Enhance insect clarity with transparent logic, debuggable internals, and observable state')
  }
  if (stats.avgResinStrength < 50) {
    recs.push('Harden resin strength with encapsulation, immutability, and sealed boundaries')
  }
  if (stats.avgTimeDepth < 50) {
    recs.push('Deepen time depth with backward compatibility, versioned APIs, and migration paths')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — they need complete amber restoration`)
  }
  if (museum.overallPreservation < 40) {
    recs.push('Overall preservation is low — focus on preservation quality and golden structure first')
  }
  const allBroken = towers.every(t => t.towerType === 'no-tower' || t.towerType === 'broken-shaft')
  if (allBroken && towers.length > 0) {
    recs.push('All towers are broken — consider a major amber reconstruction')
  }
  const dustFiles = specimens.filter(sp => sp.condition === 'dust').map(sp => sp.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Restore these dust files: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your amber spire achieves master curator grade! Every specimen shines with golden perfection')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as amber specimen
 * @example
 * const sp = analyzeAmberSpecimen(content, 'index.ts')
 * console.log(sp.condition) // 'masterpiece-amber'
 */
export function analyzeAmberSpecimen(content: string, filePath: string): AmberSpecimen {
  const capturing = measureCapturing(content)
  const structuring = measureStructuring(content)
  const revealing = measureRevealing(content)
  const encapsulating = measureEncapsulating(content)
  const enduring = measureEnduring(content)

  const qualityScore = Math.round(
    capturing.quality * 0.2 +
    structuring.golden * 0.2 +
    revealing.clarity * 0.2 +
    encapsulating.strength * 0.2 +
    enduring.depth * 0.2,
  )

  return {
    file: filePath,
    preservationQuality: capturing.quality,
    goldenStructure: structuring.golden,
    insectClarity: revealing.clarity,
    resinStrength: encapsulating.strength,
    timeDepth: enduring.depth,
    capturing,
    structuring,
    revealing,
    encapsulating,
    enduring,
    condition: classifySpecimenCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as amber tower
 * @example
 * const t = analyzeAmberTower(specimens, 'src')
 * console.log(t.towerType) // 'amber-cathedral'
 */
export function analyzeAmberTower(specimens: AmberSpecimen[], dirPath: string): AmberTower {
  if (specimens.length === 0) {
    return {
      directory: dirPath, specimens: [], avgPreservation: 0, avgStructure: 0,
      avgDepth: 0, masterpieceAmberCount: 0, dustCount: 0,
      towerType: 'no-tower', condition: 'void',
    }
  }

  const avgPreservation = Math.round(specimens.reduce((s, sp) => s + sp.preservationQuality, 0) / specimens.length)
  const avgStructure = Math.round(specimens.reduce((s, sp) => s + sp.goldenStructure, 0) / specimens.length)
  const avgDepth = Math.round(specimens.reduce((s, sp) => s + sp.timeDepth, 0) / specimens.length)
  const masterpieceAmberCount = specimens.filter(sp => sp.condition === 'masterpiece-amber').length
  const dustCount = specimens.filter(sp => sp.condition === 'dust').length
  const avgQs = Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length)

  return {
    directory: dirPath, specimens, avgPreservation, avgStructure, avgDepth,
    masterpieceAmberCount, dustCount,
    towerType: classifyTowerType(specimens),
    condition: classifyTowerCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete amber spire result
 * @example
 * const result = await buildAmberSpireResult(files, contents)
 * console.log(result.stats.curatorGrade) // 'master-curator'
 */
export async function buildAmberSpireResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberSpireResult> {
  const specimens = files.map((file, i) => analyzeAmberSpecimen(contents[i] ?? '', file))

  const dirMap = new Map<string, AmberSpecimen[]>()
  for (const specimen of specimens) {
    const dir = path.dirname(specimen.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(specimen) } else { dirMap.set(dir, [specimen]) }
  }

  const towers = Array.from(dirMap.entries()).map(([dir, dirSpecimens]) =>
    analyzeAmberTower(dirSpecimens, dir),
  )

  const avgPreservation = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.preservationQuality, 0) / specimens.length) : 0
  const avgStructure = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.goldenStructure, 0) / specimens.length) : 0
  const avgDepth = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.timeDepth, 0) / specimens.length) : 0

  const overallPreservation = specimens.length > 0
    ? Math.round((avgPreservation + avgStructure + avgDepth) / 3) : 0
  const isPreserved = avgPreservation >= 60

  const museum: AmberMuseum = { avgPreservation, avgStructure, avgDepth, isPreserved, overallPreservation }

  const avgInsectClarity = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.insectClarity, 0) / specimens.length) : 0
  const avgResinStrength = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.resinStrength, 0) / specimens.length) : 0

  const bestSpecimen = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.qualityScore > best.qualityScore ? sp : best).file : ''
  const bestPreserved = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.preservationQuality > best.preservationQuality ? sp : best).file : ''
  const bestStructure = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.goldenStructure > best.goldenStructure ? sp : best).file : ''
  const clearest = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.insectClarity > best.insectClarity ? sp : best).file : ''
  const deepest = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.timeDepth > best.timeDepth ? sp : best).file : ''

  const stats: AmberSpireStats = {
    totalFiles: specimens.length,
    totalTowers: towers.length,
    avgPreservationQuality: avgPreservation,
    avgGoldenStructure: avgStructure,
    avgInsectClarity,
    avgResinStrength,
    avgTimeDepth: avgDepth,
    masterpieceAmberCount: specimens.filter(sp => sp.condition === 'masterpiece-amber').length,
    goldenSpecimenCount: specimens.filter(sp => sp.condition === 'golden-specimen').length,
    properFossilCount: specimens.filter(sp => sp.condition === 'proper-fossil').length,
    cloudyResinCount: specimens.filter(sp => sp.condition === 'cloudy-resin').length,
    crackedAmberCount: specimens.filter(sp => sp.condition === 'cracked-amber').length,
    dustCount: specimens.filter(sp => sp.condition === 'dust').length,
    hasHighQualityCount: specimens.filter(sp => sp.capturing.hasHighQuality).length,
    hasHighGoldenCount: specimens.filter(sp => sp.structuring.hasHighGolden).length,
    hasHighClarityCount: specimens.filter(sp => sp.revealing.hasHighClarity).length,
    hasHighStrengthCount: specimens.filter(sp => sp.encapsulating.hasHighStrength).length,
    hasHighDepthCount: specimens.filter(sp => sp.enduring.hasHighDepth).length,
    overallPreservation,
    curatorGrade: classifyCuratorGrade(overallPreservation),
    bestSpecimen, bestPreserved, bestStructure, clearest, deepest,
  }

  const recommendations = generateRecommendations(specimens, towers, museum, stats)

  return { specimens, towers, museum, stats, recommendations }
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
