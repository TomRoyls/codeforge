// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Hardness grade */
export type HardnessGrade =
  | 'flawless-hardness'
  | 'mohs-ten'
  | 'proper-hard'
  | 'semi-hard'
  | 'soft-mineral'
  | 'talc-grade'

/** Clarity grade */
export type ClarityGrade =
  | 'flawless'
  | 'vvs'
  | 'vs'
  | 'si'
  | 'i1'
  | 'i2'

/** Cut grade */
export type CutGrade =
  | 'ideal-cut'
  | 'excellent-cut'
  | 'very-good-cut'
  | 'good-cut'
  | 'fair-cut'
  | 'poor-cut'

/** Dispersion grade */
export type DispersionGrade =
  | 'hearts-arrows'
  | 'brilliant-fire'
  | 'proper-sparkle'
  | 'some-scintillation'
  | 'dull-stone'
  | 'dead-light'

/** Carat grade */
export type CaratGrade =
  | 'heavy-carat'
  | 'substantial-weight'
  | 'proper-mass'
  | 'light-weight'
  | 'featherweight'
  | 'weightless'

/** Diamond condition */
export type DiamondCondition =
  | 'hope-diamond'
  | 'koh-i-noor'
  | 'proper-diamond'
  | 'industrial-diamond'
  | 'rough-crystal'
  | 'graphite'

/** Mine type */
export type MineType =
  | 'kimberley-pipe'
  | 'alluvial-deposit'
  | 'proper-mine'
  | 'test-pit'
  | 'surface-find'
  | 'no-mine'

/** Mine condition */
export type MineCondition =
  | 'premium-pipe'
  | 'rich-seam'
  | 'decent-yield'
  | 'low-grade'
  | 'exhausted'
  | 'barren'

/** Gemologist grade */
export type GemologistGrade =
  | 'master-gemologist'
  | 'expert-lapidary'
  | 'skilled-cutter'
  | 'appraiser'
  | 'novice'
  | 'coal-miner'

/** Hardening measurement */
export interface HardeningMeasure {
  hardness: number
  grade: HardnessGrade
  hasHighHardness: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasSolid: boolean
  hasNoWeak: boolean
  hasHard: boolean
  fragileCount: number
  brittleCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  grade2: ClarityGrade
  hasHighClarity: boolean
  hasTransparent: boolean
  hasClear: boolean
  hasNoInclusion: boolean
  hasPure: boolean
  hasNoFlaw: boolean
  hasPristine: boolean
  hasNoBlemish: boolean
  hasClean: boolean
  hasNoCloudy: boolean
  hasLucid: boolean
  inclusionCount: number
  flawCount: number
}

/** Cutting measurement */
export interface CuttingMeasure {
  precision: number
  cut: CutGrade
  hasHighPrecision: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasSharp: boolean
  hasNoDull: boolean
  hasPrecise: boolean
  hasNoSloppy: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasMasterful: boolean
  roughCount: number
  dullCount: number
}

/** Dispersing measurement */
export interface DispersingMeasure {
  fire: number
  dispersion: DispersionGrade
  hasHighFire: boolean
  hasBrilliant: boolean
  hasImpactful: boolean
  hasNoDull: boolean
  hasVivid: boolean
  hasNoFlat: boolean
  hasDazzling: boolean
  hasNoLifeless: boolean
  hasSparkling: boolean
  hasNoDark: boolean
  hasRadiant: boolean
  dullCount: number
  flatCount: number
}

/** Weighing measurement */
export interface WeighingMeasure {
  density: number
  carat: CaratGrade
  hasHighDensity: boolean
  hasSubstantial: boolean
  hasDense: boolean
  hasNoSparse: boolean
  hasMeaty: boolean
  hasNoThin: boolean
  hasRich: boolean
  hasNoBarren: boolean
  hasFull: boolean
  hasNoEmpty: boolean
  hasHeavy: boolean
  sparseCount: number
  thinCount: number
}

/** Single file analysis */
export interface DiamondGem {
  file: string
  hardness: number
  clarity: number
  cutPrecision: number
  fireDispersion: number
  caratDensity: number
  hardening: HardeningMeasure
  clarifying: ClarifyingMeasure
  cutting: CuttingMeasure
  dispersing: DispersingMeasure
  weighing: WeighingMeasure
  condition: DiamondCondition
  qualityScore: number
}

/** Directory-level mine */
export interface DiamondMine {
  directory: string
  gems: DiamondGem[]
  avgHardness: number
  avgClarity: number
  avgFire: number
  hopeDiamondCount: number
  graphiteCount: number
  mineType: MineType
  condition: MineCondition
}

/** Vault summary */
export interface VaultSummary {
  avgHardness: number
  avgClarity: number
  avgFire: number
  isPrecious: boolean
  overallBrilliance: number
}

/** Full stats */
export interface DiamondCoreStats {
  totalFiles: number
  totalMines: number
  avgHardness: number
  avgClarity: number
  avgCutPrecision: number
  avgFireDispersion: number
  avgCaratDensity: number
  hopeDiamondCount: number
  kohINoorCount: number
  properDiamondCount: number
  industrialDiamondCount: number
  roughCrystalCount: number
  graphiteCount: number
  hasHighHardnessCount: number
  hasHighClarityCount: number
  hasHighPrecisionCount: number
  hasHighFireCount: number
  hasHighDensityCount: number
  overallBrilliance: number
  gemologistGrade: GemologistGrade
  bestGem: string
  hardest: string
  clearest: string
  bestCut: string
  mostBrilliant: string
}

/** Full result */
export interface DiamondCoreResult {
  gems: DiamondGem[]
  mines: DiamondMine[]
  vault: VaultSummary
  stats: DiamondCoreStats
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
 * Measure hardness (robustness)
 * @example
 * const m = measureHardening(content)
 * console.log(m.grade) // 'flawless-hardness'
 */
export function measureHardening(content: string): HardeningMeasure {
  let score = 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0

  const hasRobust = hasPrivate(content) && hasReadonly(content)
  const hasDurable = hasStrictEq(content) && hasReturnType(content)
  const hasTough = hasInterface(content) && hasGenerics(content)
  const hasResilient = hasClass(content) && hasAsync(content)
  const hasSolid = hasExport(content) && hasImport(content)
  const hasHard = hasPrivate(content) && hasGenerics(content)

  score += hasRobust ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasHard ? 5 : 0

  const hardness = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBrittle = brittleCount === 0
  const hasNoBreakable = !has(/\beval\b/, content)
  const hasNoWeak = !has(/\bdebugger\b/, content)
  const hasHighHardness = hardness >= 70

  let grade: HardnessGrade
  if (hardness >= 85) grade = 'flawless-hardness'
  else if (hardness >= 70) grade = 'mohs-ten'
  else if (hardness >= 55) grade = 'proper-hard'
  else if (hardness >= 40) grade = 'semi-hard'
  else if (hardness >= 25) grade = 'soft-mineral'
  else grade = 'talc-grade'

  return {
    hardness, grade, hasHighHardness, hasRobust, hasDurable, hasNoFragile,
    hasTough, hasNoBrittle, hasResilient, hasNoBreakable, hasSolid,
    hasNoWeak, hasHard, fragileCount, brittleCount,
  }
}

/**
 * Measure clarity (transparency)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.grade2) // 'flawless'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasTransparent = hasReturnType(content) && hasStrictEq(content)
  const hasClear = hasDocComments(content) && hasInterface(content)
  const hasPure = hasGenerics(content) && hasTypeAlias(content)
  const hasPristine = hasReadonly(content) && hasPrivate(content)
  const hasClean = hasClass(content) && hasReturnType(content)
  const hasLucid = hasConst(content) && hasStrictEq(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasLucid ? 5 : 0

  const clarity = Math.min(score, 100)
  const inclusionCount = count(/\bvar\b/, content)
  const flawCount = count(/\bany\b/, content)

  const hasNoInclusion = inclusionCount === 0
  const hasNoFlaw = flawCount === 0
  const hasNoBlemish = !has(/\beval\b/, content)
  const hasNoCloudy = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade2: ClarityGrade
  if (clarity >= 85) grade2 = 'flawless'
  else if (clarity >= 70) grade2 = 'vvs'
  else if (clarity >= 55) grade2 = 'vs'
  else if (clarity >= 40) grade2 = 'si'
  else if (clarity >= 25) grade2 = 'i1'
  else grade2 = 'i2'

  return {
    clarity, grade2, hasHighClarity, hasTransparent, hasClear, hasNoInclusion,
    hasPure, hasNoFlaw, hasPristine, hasNoBlemish, hasClean, hasNoCloudy,
    hasLucid, inclusionCount, flawCount,
  }
}

/**
 * Measure cut precision (refinement)
 * @example
 * const m = measureCutting(content)
 * console.log(m.cut) // 'ideal-cut'
 */
export function measureCutting(content: string): CuttingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasRefined = hasExport(content) && hasImport(content)
  const hasPolished = hasReturnType(content) && hasStrictEq(content)
  const hasSharp = hasInterface(content) && hasGenerics(content)
  const hasPrecise = hasTypeAlias(content) && hasConst(content)
  const hasElegant = hasReadonly(content) && hasPrivate(content)
  const hasMasterful = hasExport(content) && hasGenerics(content)

  score += hasRefined ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasMasterful ? 5 : 0

  const precision = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const dullCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoDull = dullCount === 0
  const hasNoSloppy = !has(/\beval\b/, content)
  const hasNoClunky = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let cut: CutGrade
  if (precision >= 85) cut = 'ideal-cut'
  else if (precision >= 70) cut = 'excellent-cut'
  else if (precision >= 55) cut = 'very-good-cut'
  else if (precision >= 40) cut = 'good-cut'
  else if (precision >= 25) cut = 'fair-cut'
  else cut = 'poor-cut'

  return {
    precision, cut, hasHighPrecision, hasRefined, hasPolished, hasNoRough,
    hasSharp, hasNoDull, hasPrecise, hasNoSloppy, hasElegant, hasNoClunky,
    hasMasterful, roughCount, dullCount,
  }
}

/**
 * Measure fire dispersion (brilliance/impact)
 * @example
 * const m = measureDispersing(content)
 * console.log(m.dispersion) // 'hearts-arrows'
 */
export function measureDispersing(content: string): DispersingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasBrilliant = hasNamedExport(content) && hasExport(content)
  const hasImpactful = hasInterface(content) && hasGenerics(content)
  const hasVivid = hasTypeAlias(content) && hasAsync(content)
  const hasDazzling = hasImport(content) && hasClass(content)
  const hasSparkling = hasReturnType(content) && hasDocComments(content)
  const hasRadiant = hasNamedExport(content) && hasInterface(content)

  score += hasBrilliant ? 5 : 0
  score += hasImpactful ? 5 : 0
  score += hasVivid ? 5 : 0
  score += hasDazzling ? 5 : 0
  score += hasSparkling ? 5 : 0
  score += hasRadiant ? 5 : 0

  const fire = Math.min(score, 100)
  const dullCount = count(/\bvar\b/, content)
  const flatCount = count(/\bany\b/, content)

  const hasNoDull = dullCount === 0
  const hasNoFlat = flatCount === 0
  const hasNoLifeless = !has(/\beval\b/, content)
  const hasNoDark = !has(/\bdebugger\b/, content)
  const hasHighFire = fire >= 70

  let dispersion: DispersionGrade
  if (fire >= 85) dispersion = 'hearts-arrows'
  else if (fire >= 70) dispersion = 'brilliant-fire'
  else if (fire >= 55) dispersion = 'proper-sparkle'
  else if (fire >= 40) dispersion = 'some-scintillation'
  else if (fire >= 25) dispersion = 'dull-stone'
  else dispersion = 'dead-light'

  return {
    fire, dispersion, hasHighFire, hasBrilliant, hasImpactful, hasNoDull,
    hasVivid, hasNoFlat, hasDazzling, hasNoLifeless, hasSparkling, hasNoDark,
    hasRadiant, dullCount, flatCount,
  }
}

/**
 * Measure carat density (substance)
 * @example
 * const m = measureWeighing(content)
 * console.log(m.carat) // 'heavy-carat'
 */
export function measureWeighing(content: string): WeighingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasSubstantial = hasConst(content) && hasClass(content)
  const hasDense = hasInterface(content) && hasGenerics(content)
  const hasMeaty = hasTypeAlias(content) && hasAsync(content)
  const hasRich = hasImport(content) && hasExport(content)
  const hasFull = hasReturnType(content) && hasDocComments(content)
  const hasHeavy = hasConst(content) && hasInterface(content)

  score += hasSubstantial ? 5 : 0
  score += hasDense ? 5 : 0
  score += hasMeaty ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasFull ? 5 : 0
  score += hasHeavy ? 5 : 0

  const density = Math.min(score, 100)
  const sparseCount = count(/\bvar\b/, content)
  const thinCount = count(/\bany\b/, content)

  const hasNoSparse = sparseCount === 0
  const hasNoThin = thinCount === 0
  const hasNoBarren = !has(/\beval\b/, content)
  const hasNoEmpty = !has(/\bdebugger\b/, content)
  const hasHighDensity = density >= 70

  let carat: CaratGrade
  if (density >= 85) carat = 'heavy-carat'
  else if (density >= 70) carat = 'substantial-weight'
  else if (density >= 55) carat = 'proper-mass'
  else if (density >= 40) carat = 'light-weight'
  else if (density >= 25) carat = 'featherweight'
  else carat = 'weightless'

  return {
    density, carat, hasHighDensity, hasSubstantial, hasDense, hasNoSparse,
    hasMeaty, hasNoThin, hasRich, hasNoBarren, hasFull, hasNoEmpty,
    hasHeavy, sparseCount, thinCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify diamond condition
 * @example
 * classifyDiamondCondition(90) // 'hope-diamond'
 */
export function classifyDiamondCondition(score: number): DiamondCondition {
  if (score >= 85) return 'hope-diamond'
  if (score >= 70) return 'koh-i-noor'
  if (score >= 55) return 'proper-diamond'
  if (score >= 40) return 'industrial-diamond'
  if (score >= 25) return 'rough-crystal'
  return 'graphite'
}

/**
 * Classify mine type
 * @example
 * classifyMineType(gems) // 'kimberley-pipe'
 */
export function classifyMineType(gems: DiamondGem[]): MineType {
  if (gems.length === 0) return 'no-mine'
  const avgQs = Math.round(gems.reduce((s, g) => s + g.qualityScore, 0) / gems.length)
  const hopeRatio = gems.filter(g => g.condition === 'hope-diamond').length / gems.length
  if (avgQs >= 75 && hopeRatio >= 0.5) return 'kimberley-pipe'
  if (avgQs >= 60) return 'alluvial-deposit'
  if (avgQs >= 45) return 'proper-mine'
  if (avgQs >= 30) return 'test-pit'
  if (avgQs >= 15) return 'surface-find'
  return 'no-mine'
}

/**
 * Classify mine condition
 * @example
 * classifyMineCondition(80) // 'premium-pipe'
 */
export function classifyMineCondition(avgQs: number): MineCondition {
  if (avgQs >= 75) return 'premium-pipe'
  if (avgQs >= 60) return 'rich-seam'
  if (avgQs >= 45) return 'decent-yield'
  if (avgQs >= 30) return 'low-grade'
  if (avgQs >= 15) return 'exhausted'
  return 'barren'
}

/**
 * Classify gemologist grade
 * @example
 * classifyGemologistGrade(85) // 'master-gemologist'
 */
export function classifyGemologistGrade(avgBrilliance: number): GemologistGrade {
  if (avgBrilliance >= 80) return 'master-gemologist'
  if (avgBrilliance >= 65) return 'expert-lapidary'
  if (avgBrilliance >= 50) return 'skilled-cutter'
  if (avgBrilliance >= 35) return 'appraiser'
  if (avgBrilliance >= 20) return 'novice'
  return 'coal-miner'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(gems, mines, vault, stats)
 */
export function generateRecommendations(
  gems: DiamondGem[],
  mines: DiamondMine[],
  vault: VaultSummary,
  stats: DiamondCoreStats,
): string[] {
  const recs: string[] = []
  if (stats.avgHardness < 50) {
    recs.push('Increase hardness with robust private access, durable readonly properties, and tough type guards')
  }
  if (stats.avgClarity < 50) {
    recs.push('Improve clarity with transparent return types, pure interfaces, and pristine type definitions')
  }
  if (stats.avgCutPrecision < 50) {
    recs.push('Refine cut precision with polished exports, sharp interfaces, and precise type aliases')
  }
  if (stats.avgFireDispersion < 50) {
    recs.push('Boost fire dispersion with brilliant named exports, vivid async patterns, and dazzling class designs')
  }
  if (stats.avgCaratDensity < 50) {
    recs.push('Increase carat density with substantial const definitions, dense interfaces, and rich import structures')
  }
  if (stats.graphiteCount > 0) {
    recs.push(`${stats.graphiteCount} file(s) are graphite — consider significant refactoring into diamond`)
  }
  if (vault.overallBrilliance < 40) {
    recs.push('Overall diamond brilliance is poor — focus on hardness and clarity first')
  }
  const allBarren = mines.every(m => m.mineType === 'no-mine' || m.mineType === 'surface-find')
  if (allBarren && mines.length > 0) {
    recs.push('All mines are surface finds or barren — consider a major quality overhaul')
  }
  const graphite = gems.filter(g => g.condition === 'graphite').map(g => g.file)
  if (graphite.length > 0 && graphite.length <= 3) {
    recs.push(`Transform these graphite files into diamonds: ${graphite.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('460 commands - a diamond core of code analysis excellence')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as diamond gem
 * @example
 * const gem = analyzeDiamondGem(content, 'index.ts')
 * console.log(gem.condition) // 'hope-diamond'
 */
export function analyzeDiamondGem(content: string, filePath: string): DiamondGem {
  const hardening = measureHardening(content)
  const clarifying = measureClarifying(content)
  const cutting = measureCutting(content)
  const dispersing = measureDispersing(content)
  const weighing = measureWeighing(content)

  const qualityScore = Math.round(
    hardening.hardness * 0.2 +
    clarifying.clarity * 0.2 +
    cutting.precision * 0.2 +
    dispersing.fire * 0.2 +
    weighing.density * 0.2,
  )

  return {
    file: filePath,
    hardness: hardening.hardness,
    clarity: clarifying.clarity,
    cutPrecision: cutting.precision,
    fireDispersion: dispersing.fire,
    caratDensity: weighing.density,
    hardening,
    clarifying,
    cutting,
    dispersing,
    weighing,
    condition: classifyDiamondCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a diamond mine
 * @example
 * const mine = analyzeDiamondMine(gems, 'src')
 * console.log(mine.mineType) // 'kimberley-pipe'
 */
export function analyzeDiamondMine(gems: DiamondGem[], dirPath: string): DiamondMine {
  if (gems.length === 0) {
    return {
      directory: dirPath, gems: [], avgHardness: 0, avgClarity: 0, avgFire: 0,
      hopeDiamondCount: 0, graphiteCount: 0, mineType: 'no-mine', condition: 'barren',
    }
  }

  const avgHardness = Math.round(gems.reduce((s, g) => s + g.hardness, 0) / gems.length)
  const avgClarity = Math.round(gems.reduce((s, g) => s + g.clarity, 0) / gems.length)
  const avgFire = Math.round(gems.reduce((s, g) => s + g.fireDispersion, 0) / gems.length)
  const hopeDiamondCount = gems.filter(g => g.condition === 'hope-diamond').length
  const graphiteCount = gems.filter(g => g.condition === 'graphite').length
  const avgQs = Math.round(gems.reduce((s, g) => s + g.qualityScore, 0) / gems.length)

  return {
    directory: dirPath, gems, avgHardness, avgClarity, avgFire,
    hopeDiamondCount, graphiteCount, mineType: classifyMineType(gems),
    condition: classifyMineCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete diamond core result
 * @example
 * const result = await buildDiamondCoreResult(files, contents)
 * console.log(result.stats.gemologistGrade) // 'master-gemologist'
 */
export async function buildDiamondCoreResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<DiamondCoreResult> {
  const gems = files.map((file, i) => analyzeDiamondGem(contents[i] ?? '', file))

  const dirMap = new Map<string, DiamondGem[]>()
  for (const gem of gems) {
    const dir = path.dirname(gem.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(gem) } else { dirMap.set(dir, [gem]) }
  }

  const mines = Array.from(dirMap.entries()).map(([dir, dirGems]) =>
    analyzeDiamondMine(dirGems, dir),
  )

  const avgHardness = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.hardness, 0) / gems.length) : 0
  const avgClarity = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.clarity, 0) / gems.length) : 0
  const avgFire = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.fireDispersion, 0) / gems.length) : 0

  const overallBrilliance = gems.length > 0
    ? Math.round((avgHardness + avgClarity + avgFire) / 3) : 0
  const isPrecious = avgHardness >= 60

  const vault: VaultSummary = { avgHardness, avgClarity, avgFire, isPrecious, overallBrilliance }

  const avgCutPrecision = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.cutPrecision, 0) / gems.length) : 0
  const avgCaratDensity = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.caratDensity, 0) / gems.length) : 0

  const bestGem = gems.length > 0
    ? gems.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file : ''
  const hardest = gems.length > 0
    ? gems.reduce((best, g) => g.hardness > best.hardness ? g : best).file : ''
  const clearest = gems.length > 0
    ? gems.reduce((best, g) => g.clarity > best.clarity ? g : best).file : ''
  const bestCut = gems.length > 0
    ? gems.reduce((best, g) => g.cutPrecision > best.cutPrecision ? g : best).file : ''
  const mostBrilliant = gems.length > 0
    ? gems.reduce((best, g) => g.fireDispersion > best.fireDispersion ? g : best).file : ''

  const stats: DiamondCoreStats = {
    totalFiles: gems.length,
    totalMines: mines.length,
    avgHardness,
    avgClarity,
    avgCutPrecision,
    avgFireDispersion: avgFire,
    avgCaratDensity,
    hopeDiamondCount: gems.filter(g => g.condition === 'hope-diamond').length,
    kohINoorCount: gems.filter(g => g.condition === 'koh-i-noor').length,
    properDiamondCount: gems.filter(g => g.condition === 'proper-diamond').length,
    industrialDiamondCount: gems.filter(g => g.condition === 'industrial-diamond').length,
    roughCrystalCount: gems.filter(g => g.condition === 'rough-crystal').length,
    graphiteCount: gems.filter(g => g.condition === 'graphite').length,
    hasHighHardnessCount: gems.filter(g => g.hardening.hasHighHardness).length,
    hasHighClarityCount: gems.filter(g => g.clarifying.hasHighClarity).length,
    hasHighPrecisionCount: gems.filter(g => g.cutting.hasHighPrecision).length,
    hasHighFireCount: gems.filter(g => g.dispersing.hasHighFire).length,
    hasHighDensityCount: gems.filter(g => g.weighing.hasHighDensity).length,
    overallBrilliance,
    gemologistGrade: classifyGemologistGrade(overallBrilliance),
    bestGem, hardest, clearest, bestCut, mostBrilliant,
  }

  const recommendations = generateRecommendations(gems, mines, vault, stats)

  return { gems, mines, vault, stats, recommendations }
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
