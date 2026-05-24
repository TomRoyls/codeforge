// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Clarity grade */
export type ClarityGrade =
  | 'crystal-dawn'
  | 'clear-morning'
  | 'proper-daylight'
  | 'hazy-dawn'
  | 'foggy-morning'
  | 'pitch-dark'

/** Vitality grade */
export type VitalityGrade =
  | 'bursting-energy'
  | 'high-vitality'
  | 'proper-energy'
  | 'low-energy'
  | 'sluggish'
  | 'dormant'

/** Crystal transparency grade */
export type CrystalGrade =
  | 'fully-transparent'
  | 'clear-peridot'
  | 'proper-openness'
  | 'slightly-cloudy'
  | 'translucent'
  | 'opaque'

/** Growth grade */
export type GrowthGrade =
  | 'exponential-growth'
  | 'rapid-expansion'
  | 'proper-growth'
  | 'slow-growth'
  | 'stagnant'
  | 'shrinking'

/** Sunlight grade */
export type SunlightGrade =
  | 'golden-sunrise'
  | 'warm-morning'
  | 'proper-light'
  | 'cool-dawn'
  | 'overcast'
  | 'eclipse'

/** Ray condition */
export type RayCondition =
  | 'olivine-treasure'
  | 'fine-peridot'
  | 'proper-olivine'
  | 'chrysolite'
  | 'serpentine'
  | 'sand'

/** Quarry type */
export type QuarryType =
  | 'zabargad-island'
  | 'proper-quarry'
  | 'volcanic-vent'
  | 'surface-find'
  | 'river-pebble'
  | 'no-source'

/** Quarry condition */
export type QuarryCondition =
  | 'gem-quality'
  | 'fine-find'
  | 'decent-yield'
  | 'low-grade'
  | 'exhausted'
  | 'barren'

/** Dawn grade */
export type DawnGrade =
  | 'sun-herald'
  | 'dawn-bringer'
  | 'morning-star'
  | 'early-bird'
  | 'late-riser'
  | 'night-owl'

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasFresh: boolean
  hasClean: boolean
  hasNoStale: boolean
  hasClear: boolean
  hasNoMuddy: boolean
  hasNew: boolean
  hasNoOutdated: boolean
  hasCrisp: boolean
  hasNoFoggy: boolean
  hasLuminous: boolean
  staleCount: number
  muddyCount: number
}

/** Vitalizing measurement */
export interface VitalizingMeasure {
  vitality: number
  energy: VitalityGrade
  hasHighVitality: boolean
  hasEnergetic: boolean
  hasAlive: boolean
  hasNoLifeless: boolean
  hasVibrant: boolean
  hasNoDull: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasLively: boolean
  hasNoSluggish: boolean
  hasAnimated: boolean
  lifelessCount: number
  dullCount: number
}

/** Opening measurement */
export interface OpeningMeasure {
  transparency: number
  crystal: CrystalGrade
  hasHighTransparency: boolean
  hasOpen: boolean
  hasRevealing: boolean
  hasNoHidden: boolean
  hasTransparent: boolean
  hasNoConcealed: boolean
  hasVisible: boolean
  hasNoSecret: boolean
  hasAccessible: boolean
  hasNoGuarded: boolean
  hasClear: boolean
  hiddenCount: number
  concealedCount: number
}

/** Growing measurement */
export interface GrowingMeasure {
  energy: number
  growth: GrowthGrade
  hasHighEnergy: boolean
  hasExpandable: boolean
  hasScalable: boolean
  hasNoRigid: boolean
  hasFlexible: boolean
  hasNoFixed: boolean
  hasAdaptable: boolean
  hasNoLocked: boolean
  hasEvolving: boolean
  hasNoFrozen: boolean
  hasExtensible: boolean
  rigidCount: number
  fixedCount: number
}

/** Warming measurement */
export interface WarmingMeasure {
  warmth: number
  sunlight: SunlightGrade
  hasHighWarmth: boolean
  hasPositive: boolean
  hasCheerful: boolean
  hasNoGloomy: boolean
  hasOptimistic: boolean
  hasNoPessimistic: boolean
  hasBright: boolean
  hasNoDark: boolean
  hasEncouraging: boolean
  hasNoDiscouraging: boolean
  hasWarm: boolean
  gloomyCount: number
  pessimisticCount: number
}

/** Single file analysis */
export interface PeridotRay {
  file: string
  morningClarity: number
  freshVitality: number
  crystalTransparency: number
  growthEnergy: number
  sunlightWarmth: number
  clarifying: ClarifyingMeasure
  vitalizing: VitalizingMeasure
  opening: OpeningMeasure
  growing: GrowingMeasure
  warming: WarmingMeasure
  condition: RayCondition
  qualityScore: number
}

/** Directory-level quarry */
export interface PeridotQuarry {
  directory: string
  rays: PeridotRay[]
  avgClarity: number
  avgVitality: number
  avgTransparency: number
  olivineTreasureCount: number
  sandCount: number
  quarryType: QuarryType
  condition: QuarryCondition
}

/** Sunrise summary */
export interface SunriseSummary {
  avgClarity: number
  avgVitality: number
  avgTransparency: number
  isDawning: boolean
  overallBrightness: number
}

/** Full stats */
export interface PeridotDawnStats {
  totalFiles: number
  totalQuarries: number
  avgMorningClarity: number
  avgFreshVitality: number
  avgCrystalTransparency: number
  avgGrowthEnergy: number
  avgSunlightWarmth: number
  olivineTreasureCount: number
  finePeridotCount: number
  properOlivineCount: number
  chrysoliteCount: number
  serpentineCount: number
  sandCount: number
  hasHighClarityCount: number
  hasHighVitalityCount: number
  hasHighTransparencyCount: number
  hasHighEnergyCount: number
  hasHighWarmthCount: number
  overallBrightness: number
  dawnGrade: DawnGrade
  bestRay: string
  clearest: string
  mostVital: string
  mostTransparent: string
  warmest: string
}

/** Full result */
export interface PeridotDawnResult {
  rays: PeridotRay[]
  quarries: PeridotQuarry[]
  sunrise: SunriseSummary
  stats: PeridotDawnStats
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
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure morning clarity
 * @example
 * const m = measureClarifying(content)
 * console.log(m.grade) // 'crystal-dawn'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasFresh = hasExport(content) && hasImport(content)
  const hasClean = hasInterface(content) && hasConst(content)
  const hasClear = hasReturnType(content) && hasStrictEq(content)
  const hasNew = hasNamedExport(content) && hasDocComments(content)
  const hasCrisp = hasGenerics(content) && hasClass(content)
  const hasLuminous = hasExport(content) && hasDocComments(content)

  score += hasFresh ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasNew ? 5 : 0
  score += hasCrisp ? 5 : 0
  score += hasLuminous ? 5 : 0

  const clarity = Math.min(score, 100)
  const staleCount = count(/\bvar\b/, content)
  const muddyCount = count(/\bany\b/, content)

  const hasNoStale = staleCount === 0
  const hasNoMuddy = muddyCount === 0
  const hasNoOutdated = !has(/\beval\b/, content)
  const hasNoFoggy = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'crystal-dawn'
  else if (clarity >= 70) grade = 'clear-morning'
  else if (clarity >= 55) grade = 'proper-daylight'
  else if (clarity >= 40) grade = 'hazy-dawn'
  else if (clarity >= 25) grade = 'foggy-morning'
  else grade = 'pitch-dark'

  return {
    clarity, grade, hasHighClarity, hasFresh, hasClean, hasNoStale,
    hasClear, hasNoMuddy, hasNew, hasNoOutdated, hasCrisp, hasNoFoggy,
    hasLuminous, staleCount, muddyCount,
  }
}

/**
 * Measure fresh vitality
 * @example
 * const m = measureVitalizing(content)
 * console.log(m.energy) // 'bursting-energy'
 */
export function measureVitalizing(content: string): VitalizingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasEnergetic = hasAsync(content) && hasExport(content)
  const hasAlive = hasInterface(content) && hasClass(content)
  const hasVibrant = hasDocComments(content) && hasConst(content)
  const hasDynamic = hasImport(content) && hasGenerics(content)
  const hasLively = hasNamedExport(content) && hasAsync(content)
  const hasAnimated = hasClass(content) && hasExport(content)

  score += hasEnergetic ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasVibrant ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasLively ? 5 : 0
  score += hasAnimated ? 5 : 0

  const vitality = Math.min(score, 100)
  const lifelessCount = count(/\bvar\b/, content)
  const dullCount = count(/\bany\b/, content)

  const hasNoLifeless = lifelessCount === 0
  const hasNoDull = dullCount === 0
  const hasNoStatic = !has(/\beval\b/, content)
  const hasNoSluggish = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  let energy: VitalityGrade
  if (vitality >= 85) energy = 'bursting-energy'
  else if (vitality >= 70) energy = 'high-vitality'
  else if (vitality >= 55) energy = 'proper-energy'
  else if (vitality >= 40) energy = 'low-energy'
  else if (vitality >= 25) energy = 'sluggish'
  else energy = 'dormant'

  return {
    vitality, energy, hasHighVitality, hasEnergetic, hasAlive, hasNoLifeless,
    hasVibrant, hasNoDull, hasDynamic, hasNoStatic, hasLively, hasNoSluggish,
    hasAnimated, lifelessCount, dullCount,
  }
}

/**
 * Measure crystal transparency
 * @example
 * const m = measureOpening(content)
 * console.log(m.crystal) // 'fully-transparent'
 */
export function measureOpening(content: string): OpeningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasOpen = hasExport(content) && hasImport(content)
  const hasRevealing = hasNamedExport(content) && hasInterface(content)
  const hasTransparent = hasReturnType(content) && hasDocComments(content)
  const hasVisible = hasTypeAlias(content) && hasGenerics(content)
  const hasAccessible = hasReadonly(content) && hasAsync(content)
  const hasClear = hasExport(content) && hasDocComments(content)

  score += hasOpen ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasAccessible ? 5 : 0
  score += hasClear ? 5 : 0

  const transparency = Math.min(score, 100)
  const hiddenCount = count(/\bvar\b/, content)
  const concealedCount = count(/\bany\b/, content)

  const hasNoHidden = hiddenCount === 0
  const hasNoConcealed = concealedCount === 0
  const hasNoSecret = !has(/\beval\b/, content)
  const hasNoGuarded = !has(/\bdebugger\b/, content)
  const hasHighTransparency = transparency >= 70

  let crystal: CrystalGrade
  if (transparency >= 85) crystal = 'fully-transparent'
  else if (transparency >= 70) crystal = 'clear-peridot'
  else if (transparency >= 55) crystal = 'proper-openness'
  else if (transparency >= 40) crystal = 'slightly-cloudy'
  else if (transparency >= 25) crystal = 'translucent'
  else crystal = 'opaque'

  return {
    transparency, crystal, hasHighTransparency, hasOpen, hasRevealing, hasNoHidden,
    hasTransparent, hasNoConcealed, hasVisible, hasNoSecret, hasAccessible, hasNoGuarded,
    hasClear, hiddenCount, concealedCount,
  }
}

/**
 * Measure growth energy
 * @example
 * const m = measureGrowing(content)
 * console.log(m.growth) // 'exponential-growth'
 */
export function measureGrowing(content: string): GrowingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasExpandable = hasInterface(content) && hasGenerics(content)
  const hasScalable = hasTypeAlias(content) && hasConst(content)
  const hasFlexible = hasExport(content) && hasImport(content)
  const hasAdaptable = hasNamedExport(content) && hasReturnType(content)
  const hasEvolving = hasDocComments(content) && hasInterface(content)
  const hasExtensible = hasClass(content) && hasGenerics(content)

  score += hasExpandable ? 5 : 0
  score += hasScalable ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasAdaptable ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasExtensible ? 5 : 0

  const energy = Math.min(score, 100)
  const rigidCount = count(/\bvar\b/, content)
  const fixedCount = count(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoFixed = fixedCount === 0
  const hasNoLocked = !has(/\beval\b/, content)
  const hasNoFrozen = !has(/\bdebugger\b/, content)
  const hasHighEnergy = energy >= 70

  let growth: GrowthGrade
  if (energy >= 85) growth = 'exponential-growth'
  else if (energy >= 70) growth = 'rapid-expansion'
  else if (energy >= 55) growth = 'proper-growth'
  else if (energy >= 40) growth = 'slow-growth'
  else if (energy >= 25) growth = 'stagnant'
  else growth = 'shrinking'

  return {
    energy, growth, hasHighEnergy, hasExpandable, hasScalable, hasNoRigid,
    hasFlexible, hasNoFixed, hasAdaptable, hasNoLocked, hasEvolving, hasNoFrozen,
    hasExtensible, rigidCount, fixedCount,
  }
}

/**
 * Measure sunlight warmth
 * @example
 * const m = measureWarming(content)
 * console.log(m.sunlight) // 'golden-sunrise'
 */
export function measureWarming(content: string): WarmingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasPositive = hasDocComments(content) && hasExport(content)
  const hasCheerful = hasAsync(content) && hasConst(content)
  const hasOptimistic = hasInterface(content) && hasImport(content)
  const hasBright = hasReturnType(content) && hasGenerics(content)
  const hasEncouraging = hasTypeAlias(content) && hasClass(content)
  const hasWarm = hasExport(content) && hasDocComments(content)

  score += hasPositive ? 5 : 0
  score += hasCheerful ? 5 : 0
  score += hasOptimistic ? 5 : 0
  score += hasBright ? 5 : 0
  score += hasEncouraging ? 5 : 0
  score += hasWarm ? 5 : 0

  const warmth = Math.min(score, 100)
  const gloomyCount = count(/\bvar\b/, content)
  const pessimisticCount = count(/\bany\b/, content)

  const hasNoGloomy = gloomyCount === 0
  const hasNoPessimistic = pessimisticCount === 0
  const hasNoDark = !has(/\beval\b/, content)
  const hasNoDiscouraging = !has(/\bdebugger\b/, content)
  const hasHighWarmth = warmth >= 70

  let sunlight: SunlightGrade
  if (warmth >= 85) sunlight = 'golden-sunrise'
  else if (warmth >= 70) sunlight = 'warm-morning'
  else if (warmth >= 55) sunlight = 'proper-light'
  else if (warmth >= 40) sunlight = 'cool-dawn'
  else if (warmth >= 25) sunlight = 'overcast'
  else sunlight = 'eclipse'

  return {
    warmth, sunlight, hasHighWarmth, hasPositive, hasCheerful, hasNoGloomy,
    hasOptimistic, hasNoPessimistic, hasBright, hasNoDark, hasEncouraging,
    hasNoDiscouraging, hasWarm, gloomyCount, pessimisticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ray condition
 * @example
 * classifyRayCondition(90) // 'olivine-treasure'
 */
export function classifyRayCondition(score: number): RayCondition {
  if (score >= 85) return 'olivine-treasure'
  if (score >= 70) return 'fine-peridot'
  if (score >= 55) return 'proper-olivine'
  if (score >= 40) return 'chrysolite'
  if (score >= 25) return 'serpentine'
  return 'sand'
}

/**
 * Classify quarry type
 * @example
 * classifyQuarryType(rays) // 'zabargad-island'
 */
export function classifyQuarryType(rays: PeridotRay[]): QuarryType {
  if (rays.length === 0) return 'no-source'
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const treasureRatio = rays.filter(r => r.condition === 'olivine-treasure').length / rays.length
  if (avgQs >= 75 && treasureRatio >= 0.5) return 'zabargad-island'
  if (avgQs >= 60) return 'proper-quarry'
  if (avgQs >= 45) return 'volcanic-vent'
  if (avgQs >= 30) return 'surface-find'
  if (avgQs >= 15) return 'river-pebble'
  return 'no-source'
}

/**
 * Classify quarry condition
 * @example
 * classifyQuarryCondition(80) // 'gem-quality'
 */
export function classifyQuarryCondition(avgQs: number): QuarryCondition {
  if (avgQs >= 75) return 'gem-quality'
  if (avgQs >= 60) return 'fine-find'
  if (avgQs >= 45) return 'decent-yield'
  if (avgQs >= 30) return 'low-grade'
  if (avgQs >= 15) return 'exhausted'
  return 'barren'
}

/**
 * Classify dawn grade
 * @example
 * classifyDawnGrade(85) // 'sun-herald'
 */
export function classifyDawnGrade(avgBrightness: number): DawnGrade {
  if (avgBrightness >= 80) return 'sun-herald'
  if (avgBrightness >= 65) return 'dawn-bringer'
  if (avgBrightness >= 50) return 'morning-star'
  if (avgBrightness >= 35) return 'early-bird'
  if (avgBrightness >= 20) return 'late-riser'
  return 'night-owl'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(rays, quarries, sunrise, stats)
 */
export function generateRecommendations(
  rays: PeridotRay[],
  quarries: PeridotQuarry[],
  sunrise: SunriseSummary,
  stats: PeridotDawnStats,
): string[] {
  const recs: string[] = []
  if (stats.avgMorningClarity < 50) {
    recs.push('Sharpen morning clarity with fresh export/import pairs, clean interfaces, and clear return types')
  }
  if (stats.avgFreshVitality < 50) {
    recs.push('Boost fresh vitality with energetic async patterns, vibrant doc comments, and dynamic import structures')
  }
  if (stats.avgCrystalTransparency < 50) {
    recs.push('Improve crystal transparency with open exports, revealing named exports, and transparent return type annotations')
  }
  if (stats.avgGrowthEnergy < 50) {
    recs.push('Expand growth energy with expandable interfaces, scalable type aliases, and flexible export/import patterns')
  }
  if (stats.avgSunlightWarmth < 50) {
    recs.push('Increase sunlight warmth with positive doc comments, cheerful async patterns, and optimistic interface foundations')
  }
  if (stats.sandCount > 0) {
    recs.push(`${stats.sandCount} file(s) are sand — consider significant refactoring`)
  }
  if (sunrise.overallBrightness < 40) {
    recs.push('Overall peridot brightness is dim — focus on morning clarity and fresh vitality first')
  }
  const allDark = quarries.every(q => q.quarryType === 'no-source' || q.quarryType === 'river-pebble')
  if (allDark && quarries.length > 0) {
    recs.push('All quarries are depleted or poor — consider a major quality overhaul')
  }
  const sands = rays.filter(r => r.condition === 'sand').map(r => r.file)
  if (sands.length > 0 && sands.length <= 3) {
    recs.push(`Transform these sand files into peridot treasures: ${sands.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your peridot dawn is sun-herald quality! Every ray radiates golden morning light')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as peridot ray
 * @example
 * const ray = analyzePeridotRay(content, 'index.ts')
 * console.log(ray.condition) // 'olivine-treasure'
 */
export function analyzePeridotRay(content: string, filePath: string): PeridotRay {
  const clarifying = measureClarifying(content)
  const vitalizing = measureVitalizing(content)
  const opening = measureOpening(content)
  const growing = measureGrowing(content)
  const warming = measureWarming(content)

  const qualityScore = Math.round(
    clarifying.clarity * 0.2 +
    vitalizing.vitality * 0.2 +
    opening.transparency * 0.2 +
    growing.energy * 0.2 +
    warming.warmth * 0.2,
  )

  return {
    file: filePath,
    morningClarity: clarifying.clarity,
    freshVitality: vitalizing.vitality,
    crystalTransparency: opening.transparency,
    growthEnergy: growing.energy,
    sunlightWarmth: warming.warmth,
    clarifying,
    vitalizing,
    opening,
    growing,
    warming,
    condition: classifyRayCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a peridot quarry
 * @example
 * const quarry = analyzePeridotQuarry(rays, 'src')
 * console.log(quarry.quarryType) // 'zabargad-island'
 */
export function analyzePeridotQuarry(rays: PeridotRay[], dirPath: string): PeridotQuarry {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [], avgClarity: 0, avgVitality: 0, avgTransparency: 0,
      olivineTreasureCount: 0, sandCount: 0, quarryType: 'no-source', condition: 'barren',
    }
  }

  const avgClarity = Math.round(rays.reduce((s, r) => s + r.morningClarity, 0) / rays.length)
  const avgVitality = Math.round(rays.reduce((s, r) => s + r.freshVitality, 0) / rays.length)
  const avgTransparency = Math.round(rays.reduce((s, r) => s + r.crystalTransparency, 0) / rays.length)
  const olivineTreasureCount = rays.filter(r => r.condition === 'olivine-treasure').length
  const sandCount = rays.filter(r => r.condition === 'sand').length
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)

  return {
    directory: dirPath, rays, avgClarity, avgVitality, avgTransparency,
    olivineTreasureCount, sandCount, quarryType: classifyQuarryType(rays),
    condition: classifyQuarryCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete peridot dawn result
 * @example
 * const result = await buildPeridotDawnResult(files, contents)
 * console.log(result.stats.dawnGrade) // 'sun-herald'
 */
export async function buildPeridotDawnResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PeridotDawnResult> {
  const rays = files.map((file, i) => analyzePeridotRay(contents[i] ?? '', file))

  const dirMap = new Map<string, PeridotRay[]>()
  for (const ray of rays) {
    const dir = path.dirname(ray.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ray) } else { dirMap.set(dir, [ray]) }
  }

  const quarries = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzePeridotQuarry(dirRays, dir),
  )

  const avgClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.morningClarity, 0) / rays.length) : 0
  const avgVitality = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.freshVitality, 0) / rays.length) : 0
  const avgTransparency = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.crystalTransparency, 0) / rays.length) : 0

  const overallBrightness = rays.length > 0
    ? Math.round((avgClarity + avgVitality + avgTransparency) / 3) : 0
  const isDawning = avgClarity >= 60

  const sunrise: SunriseSummary = { avgClarity, avgVitality, avgTransparency, isDawning, overallBrightness }

  const avgGrowthEnergy = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.growthEnergy, 0) / rays.length) : 0
  const avgSunlightWarmth = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.sunlightWarmth, 0) / rays.length) : 0

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => r.morningClarity > best.morningClarity ? r : best).file : ''
  const mostVital = rays.length > 0
    ? rays.reduce((best, r) => r.freshVitality > best.freshVitality ? r : best).file : ''
  const mostTransparent = rays.length > 0
    ? rays.reduce((best, r) => r.crystalTransparency > best.crystalTransparency ? r : best).file : ''
  const warmest = rays.length > 0
    ? rays.reduce((best, r) => r.sunlightWarmth > best.sunlightWarmth ? r : best).file : ''

  const stats: PeridotDawnStats = {
    totalFiles: rays.length,
    totalQuarries: quarries.length,
    avgMorningClarity: avgClarity,
    avgFreshVitality: avgVitality,
    avgCrystalTransparency: avgTransparency,
    avgGrowthEnergy,
    avgSunlightWarmth,
    olivineTreasureCount: rays.filter(r => r.condition === 'olivine-treasure').length,
    finePeridotCount: rays.filter(r => r.condition === 'fine-peridot').length,
    properOlivineCount: rays.filter(r => r.condition === 'proper-olivine').length,
    chrysoliteCount: rays.filter(r => r.condition === 'chrysolite').length,
    serpentineCount: rays.filter(r => r.condition === 'serpentine').length,
    sandCount: rays.filter(r => r.condition === 'sand').length,
    hasHighClarityCount: rays.filter(r => r.clarifying.hasHighClarity).length,
    hasHighVitalityCount: rays.filter(r => r.vitalizing.hasHighVitality).length,
    hasHighTransparencyCount: rays.filter(r => r.opening.hasHighTransparency).length,
    hasHighEnergyCount: rays.filter(r => r.growing.hasHighEnergy).length,
    hasHighWarmthCount: rays.filter(r => r.warming.hasHighWarmth).length,
    overallBrightness,
    dawnGrade: classifyDawnGrade(overallBrightness),
    bestRay, clearest, mostVital, mostTransparent, warmest,
  }

  const recommendations = generateRecommendations(rays, quarries, sunrise, stats)

  return { rays, quarries, sunrise, stats, recommendations }
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
