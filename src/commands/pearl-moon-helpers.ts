// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Luster quality grade */
export type LusterGrade =
  | 'mirror-luster'
  | 'excellent-shine'
  | 'proper-glow'
  | 'dull-luster'
  | 'chalky'
  | 'no-luster'

/** Nacre depth grade */
export type NacreGrade =
  | 'thick-nacre'
  | 'proper-layers'
  | 'decent-coating'
  | 'thin-nacre'
  | 'paper-thin'
  | 'no-coating'

/** Iridescence grade */
export type IridescenceGrade =
  | 'rainbow-orient'
  | 'strong-iridescence'
  | 'proper-shift'
  | 'slight-glow'
  | 'static-color'
  | 'no-color'

/** Flawlessness grade */
export type FlawGrade =
  | 'flawless'
  | 'clean-surface'
  | 'minor-blemish'
  | 'spotted'
  | 'heavily-marked'
  | 'damaged'

/** Orient warmth grade */
export type OrientGrade =
  | 'warm-orient'
  | 'proper-glow'
  | 'decent-warmth'
  | 'cool-tone'
  | 'cold-luster'
  | 'lifeless'

/** Pearl condition */
export type PearlCondition =
  | 'south-sea-treasure'
  | 'akoya-perfect'
  | 'proper-pearl'
  | 'freshwater-decent'
  | 'imitation'
  | 'sand-grain'

/** Pearl bed type */
export type BedType =
  | 'south-sea-bed'
  | 'akoya-farm'
  | 'freshwater-bed'
  | 'cultured-pearl'
  | 'river-mussel'
  | 'no-oyster'

/** Bed condition */
export type BedCondition =
  | 'treasure-trove'
  | 'quality-harvest'
  | 'decent-yield'
  | 'poor-catch'
  | 'empty-shells'
  | 'barren'

/** Diver grade */
export type DiverGrade =
  | 'pearl-diver-master'
  | 'expert-diver'
  | 'skilled-fisher'
  | 'apprentice'
  | 'novice'
  | 'landlubber'

/** Shining measurement */
export interface ShiningMeasure {
  luster: number
  grade: LusterGrade
  hasHighLuster: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasNoRough: boolean
  hasPresentable: boolean
  hasNoUnfinished: boolean
  hasElegant: boolean
  hasNoCrude: boolean
  hasGlossy: boolean
  hasNoMatte: boolean
  hasBeautiful: boolean
  roughCount: number
  unfinishedCount: number
}

/** Layering measurement */
export interface LayeringMeasure {
  depth: number
  nacre: NacreGrade
  hasHighDepth: boolean
  hasLayered: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasRich: boolean
  hasNoThin: boolean
  hasSubstantive: boolean
  hasNoSuperficial: boolean
  hasBuilt: boolean
  hasNoHollow: boolean
  hasGradual: boolean
  shallowCount: number
  thinCount: number
}

/** Shifting measurement */
export interface ShiftingMeasure {
  level: number
  iridescence: IridescenceGrade
  hasHighLevel: boolean
  hasVaried: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasColorful: boolean
  hasNoMonotone: boolean
  hasShifting: boolean
  hasNoFixed: boolean
  hasMultifaceted: boolean
  hasNoOneDimensional: boolean
  hasDiverse: boolean
  staticCount: number
  monotoneCount: number
}

/** Perfecting measurement */
export interface PerfectingMeasure {
  grade: number
  flaw: FlawGrade
  hasHighGrade: boolean
  hasClean: boolean
  hasSmooth: boolean
  hasNoBlemished: boolean
  hasPristine: boolean
  hasNoMarked: boolean
  hasImmaculate: boolean
  hasNoFlawed: boolean
  hasPerfect: boolean
  hasNoDamaged: boolean
  hasUnblemished: boolean
  blemishedCount: number
  markedCount: number
}

/** Warming measurement */
export interface WarmingMeasure {
  warmth: number
  orient: OrientGrade
  hasHighWarmth: boolean
  hasWarm: boolean
  hasAlive: boolean
  hasNoCold: boolean
  hasInviting: boolean
  hasNoDistant: boolean
  hasGlowing: boolean
  hasNoDead: boolean
  hasFriendly: boolean
  hasNoHostile: boolean
  hasApproachable: boolean
  coldCount: number
  deadCount: number
}

/** Single file analysis */
export interface PearlLuster {
  file: string
  lusterQuality: number
  nacreDepth: number
  iridescenceLevel: number
  flawlessnessGrade: number
  orientWarmth: number
  shining: ShiningMeasure
  layering: LayeringMeasure
  shifting: ShiftingMeasure
  perfecting: PerfectingMeasure
  warming: WarmingMeasure
  condition: PearlCondition
  qualityScore: number
}

/** Directory-level pearl bed */
export interface PearlBed {
  directory: string
  lusters: PearlLuster[]
  avgLuster: number
  avgDepth: number
  avgFlawlessness: number
  southSeaTreasureCount: number
  sandGrainCount: number
  bedType: BedType
  condition: BedCondition
}

/** Ocean summary */
export interface OceanSummary {
  avgLuster: number
  avgDepth: number
  avgFlawlessness: number
  isLuminous: boolean
  overallLuminance: number
}

/** Full stats */
export interface PearlMoonStats {
  totalFiles: number
  totalBeds: number
  avgLusterQuality: number
  avgNacreDepth: number
  avgIridescenceLevel: number
  avgFlawlessnessGrade: number
  avgOrientWarmth: number
  southSeaTreasureCount: number
  akoyaPerfectCount: number
  properPearlCount: number
  freshwaterDecentCount: number
  imitationCount: number
  sandGrainCount: number
  hasHighLusterCount: number
  hasHighDepthCount: number
  hasHighLevelCount: number
  hasHighGradeCount: number
  hasHighWarmthCount: number
  overallLuminance: number
  diverGrade: DiverGrade
  bestLuster: string
  shiniest: string
  deepest: string
  mostColorful: string
  warmest: string
}

/** Full result */
export interface PearlMoonResult {
  lusters: PearlLuster[]
  beds: PearlBed[]
  ocean: OceanSummary
  stats: PearlMoonStats
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
 * Measure luster quality
 * @example
 * const m = measureShining(content)
 * console.log(m.grade) // 'mirror-luster'
 */
export function measureShining(content: string): ShiningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasPolished = hasExport(content) && hasImport(content)
  const hasRefined = hasPrivate(content) && hasReadonly(content)
  const hasPresentable = hasInterface(content) && hasClass(content)
  const hasElegant = hasStrictEq(content) && hasReturnType(content)
  const hasGlossy = hasGenerics(content) && hasAsync(content)
  const hasBeautiful = hasExport(content) && hasGenerics(content)

  score += hasPolished ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasPresentable ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasGlossy ? 5 : 0
  score += hasBeautiful ? 5 : 0

  const luster = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const unfinishedCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoUnfinished = unfinishedCount === 0
  const hasNoCrude = !has(/\beval\b/, content)
  const hasNoMatte = !has(/\bdebugger\b/, content)
  const hasHighLuster = luster >= 70

  let grade: LusterGrade
  if (luster >= 85) grade = 'mirror-luster'
  else if (luster >= 70) grade = 'excellent-shine'
  else if (luster >= 55) grade = 'proper-glow'
  else if (luster >= 40) grade = 'dull-luster'
  else if (luster >= 25) grade = 'chalky'
  else grade = 'no-luster'

  return {
    luster, grade, hasHighLuster, hasPolished, hasRefined, hasNoRough,
    hasPresentable, hasNoUnfinished, hasElegant, hasNoCrude, hasGlossy,
    hasNoMatte, hasBeautiful, roughCount, unfinishedCount,
  }
}

/**
 * Measure nacre depth
 * @example
 * const m = measureLayering(content)
 * console.log(m.nacre) // 'thick-nacre'
 */
export function measureLayering(content: string): LayeringMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasLayered = hasDocComments(content) && hasInterface(content)
  const hasDeep = hasGenerics(content) && hasTypeAlias(content)
  const hasRich = hasReadonly(content) && hasReturnType(content)
  const hasSubstantive = hasStrictEq(content) && hasPrivate(content)
  const hasBuilt = hasConst(content) && hasInterface(content)
  const hasGradual = hasClass(content) && hasDocComments(content)

  score += hasLayered ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasBuilt ? 5 : 0
  score += hasGradual ? 5 : 0

  const depth = Math.min(score, 100)
  const shallowCount = count(/\bvar\b/, content)
  const thinCount = count(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoThin = thinCount === 0
  const hasNoSuperficial = !has(/\beval\b/, content)
  const hasNoHollow = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let nacre: NacreGrade
  if (depth >= 85) nacre = 'thick-nacre'
  else if (depth >= 70) nacre = 'proper-layers'
  else if (depth >= 55) nacre = 'decent-coating'
  else if (depth >= 40) nacre = 'thin-nacre'
  else if (depth >= 25) nacre = 'paper-thin'
  else nacre = 'no-coating'

  return {
    depth, nacre, hasHighDepth, hasLayered, hasDeep, hasNoShallow,
    hasRich, hasNoThin, hasSubstantive, hasNoSuperficial, hasBuilt,
    hasNoHollow, hasGradual, shallowCount, thinCount,
  }
}

/**
 * Measure iridescence level
 * @example
 * const m = measureShifting(content)
 * console.log(m.iridescence) // 'rainbow-orient'
 */
export function measureShifting(content: string): ShiftingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasVaried = hasNamedExport(content) && hasExport(content)
  const hasDynamic = hasReturnType(content) && hasStrictEq(content)
  const hasColorful = hasInterface(content) && hasGenerics(content)
  const hasShifting = hasReadonly(content) && hasPrivate(content)
  const hasMultifaceted = hasClass(content) && hasConst(content)
  const hasDiverse = hasNamedExport(content) && hasReturnType(content)

  score += hasVaried ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasColorful ? 5 : 0
  score += hasShifting ? 5 : 0
  score += hasMultifaceted ? 5 : 0
  score += hasDiverse ? 5 : 0

  const level = Math.min(score, 100)
  const staticCount = count(/\bvar\b/, content)
  const monotoneCount = count(/\bany\b/, content)

  const hasNoStatic = staticCount === 0
  const hasNoMonotone = monotoneCount === 0
  const hasNoFixed = !has(/\beval\b/, content)
  const hasNoOneDimensional = !has(/\bdebugger\b/, content)
  const hasHighLevel = level >= 70

  let iridescence: IridescenceGrade
  if (level >= 85) iridescence = 'rainbow-orient'
  else if (level >= 70) iridescence = 'strong-iridescence'
  else if (level >= 55) iridescence = 'proper-shift'
  else if (level >= 40) iridescence = 'slight-glow'
  else if (level >= 25) iridescence = 'static-color'
  else iridescence = 'no-color'

  return {
    level, iridescence, hasHighLevel, hasVaried, hasDynamic, hasNoStatic,
    hasColorful, hasNoMonotone, hasShifting, hasNoFixed, hasMultifaceted,
    hasNoOneDimensional, hasDiverse, staticCount, monotoneCount,
  }
}

/**
 * Measure flawlessness grade
 * @example
 * const m = measurePerfecting(content)
 * console.log(m.flaw) // 'flawless'
 */
export function measurePerfecting(content: string): PerfectingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasClean = hasDocComments(content) && hasInterface(content)
  const hasSmooth = hasTypeAlias(content) && hasGenerics(content)
  const hasPristine = hasReturnType(content) && hasReadonly(content)
  const hasImmaculate = hasPrivate(content) && hasStrictEq(content)
  const hasPerfect = hasConst(content) && hasDocComments(content)
  const hasUnblemished = hasClass(content) && hasInterface(content)

  score += hasClean ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasImmaculate ? 5 : 0
  score += hasPerfect ? 5 : 0
  score += hasUnblemished ? 5 : 0

  const gradeScore = Math.min(score, 100)
  const blemishedCount = count(/\bvar\b/, content)
  const markedCount = count(/\bany\b/, content)

  const hasNoBlemished = blemishedCount === 0
  const hasNoMarked = markedCount === 0
  const hasNoFlawed = !has(/\beval\b/, content)
  const hasNoDamaged = !has(/\bdebugger\b/, content)
  const hasHighGrade = gradeScore >= 70

  let flaw: FlawGrade
  if (gradeScore >= 85) flaw = 'flawless'
  else if (gradeScore >= 70) flaw = 'clean-surface'
  else if (gradeScore >= 55) flaw = 'minor-blemish'
  else if (gradeScore >= 40) flaw = 'spotted'
  else if (gradeScore >= 25) flaw = 'heavily-marked'
  else flaw = 'damaged'

  return {
    grade: gradeScore, flaw, hasHighGrade, hasClean, hasSmooth, hasNoBlemished,
    hasPristine, hasNoMarked, hasImmaculate, hasNoFlawed, hasPerfect,
    hasNoDamaged, hasUnblemished, blemishedCount, markedCount,
  }
}

/**
 * Measure orient warmth
 * @example
 * const m = measureWarming(content)
 * console.log(m.orient) // 'warm-orient'
 */
export function measureWarming(content: string): WarmingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasWarm = hasReturnType(content) && hasStrictEq(content)
  const hasAlive = hasReadonly(content) && hasPrivate(content)
  const hasInviting = hasInterface(content) && hasGenerics(content)
  const hasGlowing = hasTypeAlias(content) && hasDocComments(content)
  const hasFriendly = hasClass(content) && hasReturnType(content)
  const hasApproachable = hasConst(content) && hasStrictEq(content)

  score += hasWarm ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasInviting ? 5 : 0
  score += hasGlowing ? 5 : 0
  score += hasFriendly ? 5 : 0
  score += hasApproachable ? 5 : 0

  const warmth = Math.min(score, 100)
  const coldCount = count(/\bvar\b/, content)
  const deadCount = count(/\bany\b/, content)

  const hasNoCold = coldCount === 0
  const hasNoDead = deadCount === 0
  const hasNoDistant = !has(/\beval\b/, content)
  const hasNoHostile = !has(/\bdebugger\b/, content)
  const hasHighWarmth = warmth >= 70

  let orient: OrientGrade
  if (warmth >= 85) orient = 'warm-orient'
  else if (warmth >= 70) orient = 'proper-glow'
  else if (warmth >= 55) orient = 'decent-warmth'
  else if (warmth >= 40) orient = 'cool-tone'
  else if (warmth >= 25) orient = 'cold-luster'
  else orient = 'lifeless'

  return {
    warmth, orient, hasHighWarmth, hasWarm, hasAlive, hasNoCold,
    hasInviting, hasNoDistant, hasGlowing, hasNoDead, hasFriendly,
    hasNoHostile, hasApproachable, coldCount, deadCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify pearl condition
 * @example
 * classifyPearlCondition(90) // 'south-sea-treasure'
 */
export function classifyPearlCondition(score: number): PearlCondition {
  if (score >= 85) return 'south-sea-treasure'
  if (score >= 70) return 'akoya-perfect'
  if (score >= 55) return 'proper-pearl'
  if (score >= 40) return 'freshwater-decent'
  if (score >= 25) return 'imitation'
  return 'sand-grain'
}

/**
 * Classify bed type
 * @example
 * classifyBedType(lusters) // 'south-sea-bed'
 */
export function classifyBedType(lusters: PearlLuster[]): BedType {
  if (lusters.length === 0) return 'no-oyster'
  const avgQs = Math.round(lusters.reduce((s, l) => s + l.qualityScore, 0) / lusters.length)
  const treasureRatio = lusters.filter(l => l.condition === 'south-sea-treasure').length / lusters.length
  if (avgQs >= 75 && treasureRatio >= 0.5) return 'south-sea-bed'
  if (avgQs >= 60) return 'akoya-farm'
  if (avgQs >= 45) return 'freshwater-bed'
  if (avgQs >= 30) return 'cultured-pearl'
  if (avgQs >= 15) return 'river-mussel'
  return 'no-oyster'
}

/**
 * Classify bed condition
 * @example
 * classifyBedCondition(80) // 'treasure-trove'
 */
export function classifyBedCondition(avgQs: number): BedCondition {
  if (avgQs >= 75) return 'treasure-trove'
  if (avgQs >= 60) return 'quality-harvest'
  if (avgQs >= 45) return 'decent-yield'
  if (avgQs >= 30) return 'poor-catch'
  if (avgQs >= 15) return 'empty-shells'
  return 'barren'
}

/**
 * Classify diver grade
 * @example
 * classifyDiverGrade(85) // 'pearl-diver-master'
 */
export function classifyDiverGrade(avgLuminance: number): DiverGrade {
  if (avgLuminance >= 80) return 'pearl-diver-master'
  if (avgLuminance >= 65) return 'expert-diver'
  if (avgLuminance >= 50) return 'skilled-fisher'
  if (avgLuminance >= 35) return 'apprentice'
  if (avgLuminance >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(lusters, beds, ocean, stats)
 */
export function generateRecommendations(
  lusters: PearlLuster[],
  beds: PearlBed[],
  ocean: OceanSummary,
  stats: PearlMoonStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLusterQuality < 50) {
    recs.push('Polish luster with clean exports, refined imports, and presentable interface foundations')
  }
  if (stats.avgNacreDepth < 50) {
    recs.push('Build nacre depth with layered doc comments, deep generics, and rich readonly patterns')
  }
  if (stats.avgIridescenceLevel < 50) {
    recs.push('Enhance iridescence with varied named exports, dynamic return types, and colorful interfaces')
  }
  if (stats.avgFlawlessnessGrade < 50) {
    recs.push('Improve flawlessness with clean doc comments, smooth type aliases, and pristine readonly guards')
  }
  if (stats.avgOrientWarmth < 50) {
    recs.push('Warm orient with meaningful return types, alive readonly guards, and inviting interface patterns')
  }
  if (stats.sandGrainCount > 0) {
    recs.push(`${stats.sandGrainCount} file(s) are sand-grain — consider significant refactoring`)
  }
  if (ocean.overallLuminance < 40) {
    recs.push('Overall pearl luminance is poor — focus on luster quality and nacre depth first')
  }
  const allBarren = beds.every(b => b.bedType === 'no-oyster' || b.bedType === 'river-mussel')
  if (allBarren && beds.length > 0) {
    recs.push('All beds are barren or river mussels — consider a major quality overhaul')
  }
  const grains = lusters.filter(l => l.condition === 'sand-grain').map(l => l.file)
  if (grains.length > 0 && grains.length <= 3) {
    recs.push(`Cultivate these sand-grain files into pearls: ${grains.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your pearl collection is pearl-diver-master quality! Every luster radiates moonlit perfection')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as pearl luster
 * @example
 * const luster = analyzePearlLuster(content, 'index.ts')
 * console.log(luster.condition) // 'south-sea-treasure'
 */
export function analyzePearlLuster(content: string, filePath: string): PearlLuster {
  const shining = measureShining(content)
  const layering = measureLayering(content)
  const shifting = measureShifting(content)
  const perfecting = measurePerfecting(content)
  const warming = measureWarming(content)

  const qualityScore = Math.round(
    shining.luster * 0.2 +
    layering.depth * 0.2 +
    shifting.level * 0.2 +
    perfecting.grade * 0.2 +
    warming.warmth * 0.2,
  )

  return {
    file: filePath,
    lusterQuality: shining.luster,
    nacreDepth: layering.depth,
    iridescenceLevel: shifting.level,
    flawlessnessGrade: perfecting.grade,
    orientWarmth: warming.warmth,
    shining,
    layering,
    shifting,
    perfecting,
    warming,
    condition: classifyPearlCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a pearl bed
 * @example
 * const bed = analyzePearlBed(lusters, 'src')
 * console.log(bed.bedType) // 'south-sea-bed'
 */
export function analyzePearlBed(lusters: PearlLuster[], dirPath: string): PearlBed {
  if (lusters.length === 0) {
    return {
      directory: dirPath, lusters: [], avgLuster: 0, avgDepth: 0, avgFlawlessness: 0,
      southSeaTreasureCount: 0, sandGrainCount: 0, bedType: 'no-oyster', condition: 'barren',
    }
  }

  const avgLuster = Math.round(lusters.reduce((s, l) => s + l.lusterQuality, 0) / lusters.length)
  const avgDepth = Math.round(lusters.reduce((s, l) => s + l.nacreDepth, 0) / lusters.length)
  const avgFlawlessness = Math.round(lusters.reduce((s, l) => s + l.flawlessnessGrade, 0) / lusters.length)
  const southSeaTreasureCount = lusters.filter(l => l.condition === 'south-sea-treasure').length
  const sandGrainCount = lusters.filter(l => l.condition === 'sand-grain').length
  const avgQs = Math.round(lusters.reduce((s, l) => s + l.qualityScore, 0) / lusters.length)

  return {
    directory: dirPath, lusters, avgLuster, avgDepth, avgFlawlessness,
    southSeaTreasureCount, sandGrainCount, bedType: classifyBedType(lusters),
    condition: classifyBedCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete pearl moon result
 * @example
 * const result = await buildPearlMoonResult(files, contents)
 * console.log(result.stats.diverGrade) // 'pearl-diver-master'
 */
export async function buildPearlMoonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PearlMoonResult> {
  const lusters = files.map((file, i) => analyzePearlLuster(contents[i] ?? '', file))

  const dirMap = new Map<string, PearlLuster[]>()
  for (const luster of lusters) {
    const dir = path.dirname(luster.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(luster) } else { dirMap.set(dir, [luster]) }
  }

  const beds = Array.from(dirMap.entries()).map(([dir, dirLusters]) =>
    analyzePearlBed(dirLusters, dir),
  )

  const avgLuster = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.lusterQuality, 0) / lusters.length) : 0
  const avgDepth = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.nacreDepth, 0) / lusters.length) : 0
  const avgFlawlessness = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.flawlessnessGrade, 0) / lusters.length) : 0

  const overallLuminance = lusters.length > 0
    ? Math.round((avgLuster + avgDepth + avgFlawlessness) / 3) : 0
  const isLuminous = avgLuster >= 60

  const ocean: OceanSummary = { avgLuster, avgDepth, avgFlawlessness, isLuminous, overallLuminance }

  const avgIridescenceLevel = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.iridescenceLevel, 0) / lusters.length) : 0
  const avgOrientWarmth = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.orientWarmth, 0) / lusters.length) : 0

  const bestLuster = lusters.length > 0
    ? lusters.reduce((best, l) => l.qualityScore > best.qualityScore ? l : best).file : ''
  const shiniest = lusters.length > 0
    ? lusters.reduce((best, l) => l.lusterQuality > best.lusterQuality ? l : best).file : ''
  const deepest = lusters.length > 0
    ? lusters.reduce((best, l) => l.nacreDepth > best.nacreDepth ? l : best).file : ''
  const mostColorful = lusters.length > 0
    ? lusters.reduce((best, l) => l.iridescenceLevel > best.iridescenceLevel ? l : best).file : ''
  const warmest = lusters.length > 0
    ? lusters.reduce((best, l) => l.orientWarmth > best.orientWarmth ? l : best).file : ''

  const stats: PearlMoonStats = {
    totalFiles: lusters.length,
    totalBeds: beds.length,
    avgLusterQuality: avgLuster,
    avgNacreDepth: avgDepth,
    avgIridescenceLevel,
    avgFlawlessnessGrade: avgFlawlessness,
    avgOrientWarmth,
    southSeaTreasureCount: lusters.filter(l => l.condition === 'south-sea-treasure').length,
    akoyaPerfectCount: lusters.filter(l => l.condition === 'akoya-perfect').length,
    properPearlCount: lusters.filter(l => l.condition === 'proper-pearl').length,
    freshwaterDecentCount: lusters.filter(l => l.condition === 'freshwater-decent').length,
    imitationCount: lusters.filter(l => l.condition === 'imitation').length,
    sandGrainCount: lusters.filter(l => l.condition === 'sand-grain').length,
    hasHighLusterCount: lusters.filter(l => l.shining.hasHighLuster).length,
    hasHighDepthCount: lusters.filter(l => l.layering.hasHighDepth).length,
    hasHighLevelCount: lusters.filter(l => l.shifting.hasHighLevel).length,
    hasHighGradeCount: lusters.filter(l => l.perfecting.hasHighGrade).length,
    hasHighWarmthCount: lusters.filter(l => l.warming.hasHighWarmth).length,
    overallLuminance,
    diverGrade: classifyDiverGrade(overallLuminance),
    bestLuster, shiniest, deepest, mostColorful, warmest,
  }

  const recommendations = generateRecommendations(lusters, beds, ocean, stats)

  return { lusters, beds, ocean, stats, recommendations }
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
