// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type GrowthGrade = 'ancient-spirit-tree' | 'flourishing-ghost-vine' | 'proper-ethereal' | 'wilting-phantom' | 'fading-spirit' | 'no-growth'
export type BlossomGrade = 'spectral-blossom' | 'ghost-flower' | 'proper-phantom' | 'wilting-ghost' | 'invisible-bloom' | 'no-bloom'
export type SpectralGrade = 'deep-ethereal' | 'strong-spirit-root' | 'proper-invisible' | 'shallow-ghost' | 'surface-wisp' | 'no-root'
export type WraithGrade = 'abundant-spirit' | 'rich-phantom-yield' | 'proper-harvest' | 'meager-ghost' | 'barren-spirit' | 'no-harvest'
export type SeedGrade = 'legendary-seed' | 'future-sprout' | 'proper-seed' | 'dormant-seed' | 'sterile-seed' | 'no-seed'
export type BloomCondition = 'ethereal-masterpiece' | 'ghost-paradise' | 'proper-phantom-garden' | 'wilting-spirit-bed' | 'dead-ghost-garden' | 'void'
export type PlotType = 'spirit-garden' | 'ghost-grove' | 'proper-plot' | 'withered-bed' | 'barren-ground' | 'no-plot'
export type PlotCondition = 'transcendent-garden' | 'beautiful-phantom' | 'decent-spirit-garden' | 'fading-grove' | 'dead-earth' | 'void'
export type GardenerGrade = 'spirit-gardener' | 'phantom-botanist' | 'skilled-cultivator' | 'apprentice' | 'novice' | 'ghost'

export interface EvolvingMeasure {
  growth: number
  grade: GrowthGrade
  hasHighGrowth: boolean
  hasOrganic: boolean
  hasIterative: boolean
  hasNoBigBang: boolean
  hasSustainable: boolean
  hasNoDisposable: boolean
  hasProgressive: boolean
  hasNoAllAtOnce: boolean
  hasEvolving: boolean
  hasNoStatic: boolean
  hasLiving: boolean
  bigBangCount: number
  disposableCount: number
}

export interface FloweringMeasure {
  bloom: number
  blossom: BlossomGrade
  hasHighBloom: boolean
  hasGracefulFeatureFlags: boolean
  hasProgressiveRollout: boolean
  hasNoAbruptChanges: boolean
  hasBackwardCompatible: boolean
  hasNoBreakingRemoval: boolean
  hasDeprecationPaths: boolean
  hasNoSuddenRemoval: boolean
  hasFeatureLifecycle: boolean
  hasNoAbandonedFeatures: boolean
  hasManagedLifecycle: boolean
  abruptChangesCount: number
  breakingRemovalCount: number
}

export interface RootingMeasure {
  root: number
  spectral: SpectralGrade
  hasHighRoot: boolean
  hasSolidAbstractions: boolean
  hasWellDesignedInterfaces: boolean
  hasNoShakyBase: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasCleanPatterns: boolean
  hasNoAdhoc: boolean
  hasFoundational: boolean
  shakyBaseCount: number
  unsafeCount: number
}

export interface YieldingMeasure {
  harvest: number
  wraith: WraithGrade
  hasHighHarvest: boolean
  hasHighValue: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasDeliverable: boolean
  hasNoPrototype: boolean
  hasProductionReady: boolean
  hasNoDeadCode: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasValuable: boolean
  fillerCount: number
  prototypeCount: number
}

export interface SeedingMeasure {
  seed: number
  phantom: SeedGrade
  hasHighSeed: boolean
  hasExtensible: boolean
  hasPluginArchitecture: boolean
  hasNoMonolithic: boolean
  hasConfigurable: boolean
  hasNoHardcoded: boolean
  hasModular: boolean
  hasNoRigid: boolean
  hasScalable: boolean
  hasNoFixedCapacity: boolean
  hasPlantable: boolean
  monolithicCount: number
  hardcodedCount: number
}

export interface GhostBloom {
  file: string
  etherealGrowth: number
  ghostBloom: number
  spectralRoot: number
  wraithHarvest: number
  phantomSeed: number
  evolving: EvolvingMeasure
  flowering: FloweringMeasure
  rooting: RootingMeasure
  yielding: YieldingMeasure
  seeding: SeedingMeasure
  condition: BloomCondition
  qualityScore: number
}

export interface PhantomPlot {
  directory: string
  blooms: GhostBloom[]
  avgGrowth: number
  avgRoot: number
  avgSeed: number
  etherealMasterpieceCount: number
  voidCount: number
  plotType: PlotType
  condition: PlotCondition
}

export interface PhantomRealm {
  avgGrowth: number
  avgRoot: number
  avgSeed: number
  isEthereal: boolean
  overallSpirit: number
}

export interface PhantomGardenStats {
  totalFiles: number
  totalPlots: number
  avgEtherealGrowth: number
  avgGhostBloom: number
  avgSpectralRoot: number
  avgWraithHarvest: number
  avgPhantomSeed: number
  etherealMasterpieceCount: number
  ghostParadiseCount: number
  properPhantomGardenCount: number
  wiltingSpiritBedCount: number
  deadGhostGardenCount: number
  voidCount: number
  hasHighGrowthCount: number
  hasHighBloomCount: number
  hasHighRootCount: number
  hasHighHarvestCount: number
  hasHighSeedCount: number
  overallSpirit: number
  gardenerGrade: GardenerGrade
  bestBloom: string
  mostEvolving: string
  bestBlossoming: string
  deepestRooted: string
  bestSeeded: string
}

export interface PhantomGardenResult {
  blooms: GhostBloom[]
  plots: PhantomPlot[]
  realm: PhantomRealm
  stats: PhantomGardenStats
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
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure ethereal growth (evolving)
 * @example
 * const m = measureEvolving(content)
 * console.log(m.grade) // 'ancient-spirit-tree'
 */
export function measureEvolving(content: string): EvolvingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasOrganic = hasExport(content) && hasImport(content)
  const hasIterative = hasConst(content) && hasArrowFunction(content)
  const hasSustainable = hasInterface(content) && hasTypeAlias(content)
  const hasProgressive = hasAsync(content) && hasMapFunction(content)
  const hasEvolving = hasGenerics(content) && hasReturnType(content)
  const hasLiving = hasNamedExport(content) && hasOptional(content)

  score += hasOrganic ? 5 : 0
  score += hasIterative ? 5 : 0
  score += hasSustainable ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasLiving ? 5 : 0

  const growth = Math.min(score, 100)
  const bigBangCount = countMatches(/\bvar\b/, content)
  const disposableCount = countMatches(/\bany\b/, content)

  const hasNoBigBang = bigBangCount === 0
  const hasNoDisposable = disposableCount === 0
  const hasNoAllAtOnce = !has(/\beval\b/, content)
  const hasNoStatic = !has(/\bdebugger\b/, content)
  const hasHighGrowth = growth >= 70

  let grade: GrowthGrade
  if (growth >= 85) grade = 'ancient-spirit-tree'
  else if (growth >= 70) grade = 'flourishing-ghost-vine'
  else if (growth >= 55) grade = 'proper-ethereal'
  else if (growth >= 40) grade = 'wilting-phantom'
  else if (growth >= 25) grade = 'fading-spirit'
  else grade = 'no-growth'

  return {
    growth, grade, hasHighGrowth, hasOrganic, hasIterative, hasNoBigBang,
    hasSustainable, hasNoDisposable, hasProgressive, hasNoAllAtOnce,
    hasEvolving, hasNoStatic, hasLiving, bigBangCount, disposableCount,
  }
}

/**
 * Measure ghost bloom (flowering)
 * @example
 * const m = measureFlowering(content)
 * console.log(m.blossom) // 'spectral-blossom'
 */
export function measureFlowering(content: string): FloweringMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0

  const hasGracefulFeatureFlags = hasEnum(content) && hasUnionType(content)
  const hasProgressiveRollout = hasOptional(content) && hasDefaultParam(content)
  const hasBackwardCompatible = hasReadonly(content) && hasConst(content)
  const hasDeprecationPaths = hasDocComments(content) && hasReturnType(content)
  const hasFeatureLifecycle = hasExport(content) && hasImport(content)
  const hasManagedLifecycle = hasInterface(content) && hasStrictEq(content)

  score += hasGracefulFeatureFlags ? 5 : 0
  score += hasProgressiveRollout ? 5 : 0
  score += hasBackwardCompatible ? 5 : 0
  score += hasDeprecationPaths ? 5 : 0
  score += hasFeatureLifecycle ? 5 : 0
  score += hasManagedLifecycle ? 5 : 0

  const bloom = Math.min(score, 100)
  const abruptChangesCount = countMatches(/\bvar\b/, content)
  const breakingRemovalCount = countMatches(/\bany\b/, content)

  const hasNoAbruptChanges = abruptChangesCount === 0
  const hasNoBreakingRemoval = breakingRemovalCount === 0
  const hasNoSuddenRemoval = !has(/\beval\b/, content)
  const hasNoAbandonedFeatures = !has(/\bdebugger\b/, content)
  const hasHighBloom = bloom >= 70

  let blossom: BlossomGrade
  if (bloom >= 85) blossom = 'spectral-blossom'
  else if (bloom >= 70) blossom = 'ghost-flower'
  else if (bloom >= 55) blossom = 'proper-phantom'
  else if (bloom >= 40) blossom = 'wilting-ghost'
  else if (bloom >= 25) blossom = 'invisible-bloom'
  else blossom = 'no-bloom'

  return {
    bloom, blossom, hasHighBloom, hasGracefulFeatureFlags, hasProgressiveRollout,
    hasNoAbruptChanges, hasBackwardCompatible, hasNoBreakingRemoval, hasDeprecationPaths,
    hasNoSuddenRemoval, hasFeatureLifecycle, hasNoAbandonedFeatures, hasManagedLifecycle,
    abruptChangesCount, breakingRemovalCount,
  }
}

/**
 * Measure spectral root (rooting)
 * @example
 * const m = measureRooting(content)
 * console.log(m.spectral) // 'deep-ethereal'
 */
export function measureRooting(content: string): RootingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0

  const hasSolidAbstractions = hasInterface(content) && hasReturnType(content)
  const hasWellDesignedInterfaces = hasGenerics(content) && hasOptional(content)
  const hasTypeSafe = hasStrictEq(content) && hasConst(content)
  const hasTested = hasTryCatch(content) && hasStrictEq(content)
  const hasCleanPatterns = hasExport(content) && hasImport(content)
  const hasFoundational = hasEnum(content) && hasUnionType(content)

  score += hasSolidAbstractions ? 5 : 0
  score += hasWellDesignedInterfaces ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasCleanPatterns ? 5 : 0
  score += hasFoundational ? 5 : 0

  const root = Math.min(score, 100)
  const shakyBaseCount = countMatches(/\bvar\b/, content)
  const unsafeCount = countMatches(/\bany\b/, content)

  const hasNoShakyBase = shakyBaseCount === 0
  const hasNoUnsafe = unsafeCount === 0
  const hasNoUntested = !has(/\beval\b/, content)
  const hasNoAdhoc = !has(/\bdebugger\b/, content)
  const hasHighRoot = root >= 70

  let spectral: SpectralGrade
  if (root >= 85) spectral = 'deep-ethereal'
  else if (root >= 70) spectral = 'strong-spirit-root'
  else if (root >= 55) spectral = 'proper-invisible'
  else if (root >= 40) spectral = 'shallow-ghost'
  else if (root >= 25) spectral = 'surface-wisp'
  else spectral = 'no-root'

  return {
    root, spectral, hasHighRoot, hasSolidAbstractions, hasWellDesignedInterfaces,
    hasNoShakyBase, hasTypeSafe, hasNoUnsafe, hasTested, hasNoUntested,
    hasCleanPatterns, hasNoAdhoc, hasFoundational, shakyBaseCount, unsafeCount,
  }
}

/**
 * Measure wraith harvest (yielding)
 * @example
 * const m = measureYielding(content)
 * console.log(m.wraith) // 'abundant-spirit'
 */
export function measureYielding(content: string): YieldingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0

  const hasHighValue = hasExport(content) && hasReturnType(content)
  const hasEssential = hasDocComments(content) && hasInterface(content)
  const hasDeliverable = hasNamedExport(content) && hasAsync(content)
  const hasProductionReady = hasTryCatch(content) && hasThrow(content)
  const hasMeaningful = hasStrictEq(content) && hasConst(content)
  const hasValuable = hasMapFunction(content) && hasArrowFunction(content)

  score += hasHighValue ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasDeliverable ? 5 : 0
  score += hasProductionReady ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasValuable ? 5 : 0

  const harvest = Math.min(score, 100)
  const fillerCount = countMatches(/\bvar\b/, content)
  const prototypeCount = countMatches(/\bany\b/, content)

  const hasNoFiller = fillerCount === 0
  const hasNoPrototype = prototypeCount === 0
  const hasNoDeadCode = !has(/\beval\b/, content)
  const hasNoBoilerplate = !has(/\bdebugger\b/, content)
  const hasHighHarvest = harvest >= 70

  let wraith: WraithGrade
  if (harvest >= 85) wraith = 'abundant-spirit'
  else if (harvest >= 70) wraith = 'rich-phantom-yield'
  else if (harvest >= 55) wraith = 'proper-harvest'
  else if (harvest >= 40) wraith = 'meager-ghost'
  else if (harvest >= 25) wraith = 'barren-spirit'
  else wraith = 'no-harvest'

  return {
    harvest, wraith, hasHighHarvest, hasHighValue, hasEssential, hasNoFiller,
    hasDeliverable, hasNoPrototype, hasProductionReady, hasNoDeadCode,
    hasMeaningful, hasNoBoilerplate, hasValuable, fillerCount, prototypeCount,
  }
}

/**
 * Measure phantom seed (seeding)
 * @example
 * const m = measureSeeding(content)
 * console.log(m.phantom) // 'legendary-seed'
 */
export function measureSeeding(content: string): SeedingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0

  const hasExtensible = hasInterface(content) && hasGenerics(content)
  const hasPluginArchitecture = hasExport(content) && hasImport(content)
  const hasConfigurable = hasOptional(content) && hasDefaultParam(content)
  const hasModular = hasNamedExport(content) && hasTypeAlias(content)
  const hasScalable = hasAsync(content) && hasMapFunction(content)
  const hasPlantable = hasEnum(content) && hasDocComments(content)

  score += hasExtensible ? 5 : 0
  score += hasPluginArchitecture ? 5 : 0
  score += hasConfigurable ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasPlantable ? 5 : 0

  const seed = Math.min(score, 100)
  const monolithicCount = countMatches(/\bvar\b/, content)
  const hardcodedCount = countMatches(/\bany\b/, content)

  const hasNoMonolithic = monolithicCount === 0
  const hasNoHardcoded = hardcodedCount === 0
  const hasNoRigid = !has(/\beval\b/, content)
  const hasNoFixedCapacity = !has(/\bdebugger\b/, content)
  const hasHighSeed = seed >= 70

  let phantom: SeedGrade
  if (seed >= 85) phantom = 'legendary-seed'
  else if (seed >= 70) phantom = 'future-sprout'
  else if (seed >= 55) phantom = 'proper-seed'
  else if (seed >= 40) phantom = 'dormant-seed'
  else if (seed >= 25) phantom = 'sterile-seed'
  else phantom = 'no-seed'

  return {
    seed, phantom, hasHighSeed, hasExtensible, hasPluginArchitecture,
    hasNoMonolithic, hasConfigurable, hasNoHardcoded, hasModular,
    hasNoRigid, hasScalable, hasNoFixedCapacity, hasPlantable,
    monolithicCount, hardcodedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify bloom condition
 * @example
 * classifyBloomCondition(90) // 'ethereal-masterpiece'
 */
export function classifyBloomCondition(score: number): BloomCondition {
  if (score >= 85) return 'ethereal-masterpiece'
  if (score >= 70) return 'ghost-paradise'
  if (score >= 55) return 'proper-phantom-garden'
  if (score >= 40) return 'wilting-spirit-bed'
  if (score >= 25) return 'dead-ghost-garden'
  return 'void'
}

/**
 * Classify plot type
 * @example
 * classifyPlotType(blooms) // 'spirit-garden'
 */
export function classifyPlotType(blooms: GhostBloom[]): PlotType {
  if (blooms.length === 0) return 'no-plot'
  const avgQs = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)
  const masterpieceRatio = blooms.filter(b => b.condition === 'ethereal-masterpiece').length / blooms.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'spirit-garden'
  if (avgQs >= 60) return 'ghost-grove'
  if (avgQs >= 45) return 'proper-plot'
  if (avgQs >= 30) return 'withered-bed'
  if (avgQs >= 15) return 'barren-ground'
  return 'no-plot'
}

/**
 * Classify plot condition
 * @example
 * classifyPlotCondition(80) // 'transcendent-garden'
 */
export function classifyPlotCondition(avgQs: number): PlotCondition {
  if (avgQs >= 75) return 'transcendent-garden'
  if (avgQs >= 60) return 'beautiful-phantom'
  if (avgQs >= 45) return 'decent-spirit-garden'
  if (avgQs >= 30) return 'fading-grove'
  if (avgQs >= 15) return 'dead-earth'
  return 'void'
}

/**
 * Classify gardener grade
 * @example
 * classifyGardenerGrade(85) // 'spirit-gardener'
 */
export function classifyGardenerGrade(avgSpirit: number): GardenerGrade {
  if (avgSpirit >= 80) return 'spirit-gardener'
  if (avgSpirit >= 65) return 'phantom-botanist'
  if (avgSpirit >= 50) return 'skilled-cultivator'
  if (avgSpirit >= 35) return 'apprentice'
  if (avgSpirit >= 20) return 'novice'
  return 'ghost'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(blooms, plots, realm, stats)
 */
export function generateRecommendations(
  blooms: GhostBloom[],
  plots: PhantomPlot[],
  realm: PhantomRealm,
  stats: PhantomGardenStats,
): string[] {
  const recs: string[] = []
  if (stats.avgEtherealGrowth < 50) {
    recs.push('Nurture ethereal growth with organic imports, iterative patterns, and living exports')
  }
  if (stats.avgGhostBloom < 50) {
    recs.push('Encourage ghost bloom with graceful feature flags, progressive rollout, and managed lifecycle')
  }
  if (stats.avgSpectralRoot < 50) {
    recs.push('Deepen spectral roots with solid abstractions, type safety, and clean foundational patterns')
  }
  if (stats.avgWraithHarvest < 50) {
    recs.push('Enrich wraith harvest with essential exports, production-ready error handling, and meaningful code')
  }
  if (stats.avgPhantomSeed < 50) {
    recs.push('Plant phantom seeds with extensible interfaces, modular architecture, and scalable patterns')
  }
  if (stats.voidCount > 0) {
    recs.push(`${stats.voidCount} file(s) are void — they need complete phantom restoration`)
  }
  if (realm.overallSpirit < 40) {
    recs.push('Overall spirit is low — focus on ethereal growth and spectral root first')
  }
  const allBarren = plots.every(p => p.plotType === 'no-plot' || p.plotType === 'barren-ground')
  if (allBarren && plots.length > 0) {
    recs.push('All plots are barren — consider a major phantom garden reconstruction')
  }
  const voidFiles = blooms.filter(b => b.condition === 'void').map(b => b.file)
  if (voidFiles.length > 0 && voidFiles.length <= 3) {
    recs.push(`Restore these void files: ${voidFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your phantom garden achieves spirit gardener grade! Every bloom radiates ethereal brilliance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ghost bloom
 * @example
 * const b = analyzeGhostBloom(content, 'index.ts')
 * console.log(b.condition) // 'ethereal-masterpiece'
 */
export function analyzeGhostBloom(content: string, filePath: string): GhostBloom {
  const evolving = measureEvolving(content)
  const flowering = measureFlowering(content)
  const rooting = measureRooting(content)
  const yielding = measureYielding(content)
  const seeding = measureSeeding(content)

  const qualityScore = Math.round(
    evolving.growth * 0.2 +
    flowering.bloom * 0.2 +
    rooting.root * 0.2 +
    yielding.harvest * 0.2 +
    seeding.seed * 0.2,
  )

  return {
    file: filePath,
    etherealGrowth: evolving.growth,
    ghostBloom: flowering.bloom,
    spectralRoot: rooting.root,
    wraithHarvest: yielding.harvest,
    phantomSeed: seeding.seed,
    evolving,
    flowering,
    rooting,
    yielding,
    seeding,
    condition: classifyBloomCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as phantom plot
 * @example
 * const p = analyzePhantomPlot(blooms, 'src')
 * console.log(p.plotType) // 'spirit-garden'
 */
export function analyzePhantomPlot(blooms: GhostBloom[], dirPath: string): PhantomPlot {
  if (blooms.length === 0) {
    return {
      directory: dirPath, blooms: [], avgGrowth: 0, avgRoot: 0,
      avgSeed: 0, etherealMasterpieceCount: 0, voidCount: 0,
      plotType: 'no-plot', condition: 'void',
    }
  }

  const avgGrowth = Math.round(blooms.reduce((s, b) => s + b.etherealGrowth, 0) / blooms.length)
  const avgRoot = Math.round(blooms.reduce((s, b) => s + b.spectralRoot, 0) / blooms.length)
  const avgSeed = Math.round(blooms.reduce((s, b) => s + b.phantomSeed, 0) / blooms.length)
  const etherealMasterpieceCount = blooms.filter(b => b.condition === 'ethereal-masterpiece').length
  const voidCount = blooms.filter(b => b.condition === 'void').length
  const avgQs = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)

  return {
    directory: dirPath, blooms, avgGrowth, avgRoot, avgSeed,
    etherealMasterpieceCount, voidCount,
    plotType: classifyPlotType(blooms),
    condition: classifyPlotCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete phantom garden result
 * @example
 * const result = await buildPhantomGardenResult(files, contents)
 * console.log(result.stats.gardenerGrade) // 'spirit-gardener'
 */
export async function buildPhantomGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomGardenResult> {
  const blooms = files.map((file, i) => analyzeGhostBloom(contents[i] ?? '', file))

  const dirMap = new Map<string, GhostBloom[]>()
  for (const bloom of blooms) {
    const dir = path.dirname(bloom.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(bloom) } else { dirMap.set(dir, [bloom]) }
  }

  const plots = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzePhantomPlot(dirBlooms, dir),
  )

  const avgGrowth = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.etherealGrowth, 0) / blooms.length) : 0
  const avgRoot = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.spectralRoot, 0) / blooms.length) : 0
  const avgSeed = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.phantomSeed, 0) / blooms.length) : 0

  const overallSpirit = blooms.length > 0
    ? Math.round((avgGrowth + avgRoot + avgSeed) / 3) : 0
  const isEthereal = avgGrowth >= 60

  const realm: PhantomRealm = { avgGrowth, avgRoot, avgSeed, isEthereal, overallSpirit }

  const avgGhostBloom = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.ghostBloom, 0) / blooms.length) : 0
  const avgWraithHarvest = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.wraithHarvest, 0) / blooms.length) : 0
  const avgPhantomSeed = avgSeed

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file : ''
  const mostEvolving = blooms.length > 0
    ? blooms.reduce((best, b) => b.etherealGrowth > best.etherealGrowth ? b : best).file : ''
  const bestBlossoming = blooms.length > 0
    ? blooms.reduce((best, b) => b.ghostBloom > best.ghostBloom ? b : best).file : ''
  const deepestRooted = blooms.length > 0
    ? blooms.reduce((best, b) => b.spectralRoot > best.spectralRoot ? b : best).file : ''
  const bestSeeded = blooms.length > 0
    ? blooms.reduce((best, b) => b.phantomSeed > best.phantomSeed ? b : best).file : ''

  const stats: PhantomGardenStats = {
    totalFiles: blooms.length,
    totalPlots: plots.length,
    avgEtherealGrowth: avgGrowth,
    avgGhostBloom,
    avgSpectralRoot: avgRoot,
    avgWraithHarvest,
    avgPhantomSeed: avgPhantomSeed,
    etherealMasterpieceCount: blooms.filter(b => b.condition === 'ethereal-masterpiece').length,
    ghostParadiseCount: blooms.filter(b => b.condition === 'ghost-paradise').length,
    properPhantomGardenCount: blooms.filter(b => b.condition === 'proper-phantom-garden').length,
    wiltingSpiritBedCount: blooms.filter(b => b.condition === 'wilting-spirit-bed').length,
    deadGhostGardenCount: blooms.filter(b => b.condition === 'dead-ghost-garden').length,
    voidCount: blooms.filter(b => b.condition === 'void').length,
    hasHighGrowthCount: blooms.filter(b => b.evolving.hasHighGrowth).length,
    hasHighBloomCount: blooms.filter(b => b.flowering.hasHighBloom).length,
    hasHighRootCount: blooms.filter(b => b.rooting.hasHighRoot).length,
    hasHighHarvestCount: blooms.filter(b => b.yielding.hasHighHarvest).length,
    hasHighSeedCount: blooms.filter(b => b.seeding.hasHighSeed).length,
    overallSpirit,
    gardenerGrade: classifyGardenerGrade(overallSpirit),
    bestBloom, mostEvolving, bestBlossoming, deepestRooted, bestSeeded,
  }

  const recommendations = generateRecommendations(blooms, plots, realm, stats)

  return { blooms, plots, realm, stats, recommendations }
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
