// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Tensile grade */
export type TensileGrade =
  | 'spider-silk'
  | 'tensile-steel'
  | 'strong-thread'
  | 'proper-yarn'
  | 'weak-thread'
  | 'snapped'

/** Weave quality */
export type WeaveQuality =
  | 'damask'
  | 'jacquard'
  | 'proper-weave'
  | 'loose-weave'
  | 'fraying'
  | 'unraveled'

/** Dye consistency */
export type DyeConsistency =
  | 'uniform-color'
  | 'consistent-dye'
  | 'proper-shade'
  | 'patchy-dye'
  | 'faded'
  | 'bleached'

/** Loom precision */
export type LoomPrecision =
  | 'master-loom'
  | 'precision-loom'
  | 'proper-loom'
  | 'wobbly-loom'
  | 'misaligned'
  | 'broken-loom'

/** Thread count quality */
export type ThreadCountQuality =
  | 'egyptian-cotton'
  | 'high-thread'
  | 'proper-count'
  | 'low-thread'
  | 'see-through'
  | 'gauze'

/** Strand condition */
export type StrandCondition =
  | 'master-weaver'
  | 'fine-silk'
  | 'proper-thread'
  | 'cotton-yarn'
  | 'burlap'
  | 'shredded'

/** Loom type */
export type LoomType =
  | 'silk-mill'
  | 'weaving-workshop'
  | 'hand-loom'
  | 'spinning-wheel'
  | 'distaff'
  | 'no-loom'

/** Fabric condition */
export type FabricCondition =
  | 'luxury-fabric'
  | 'fine-textile'
  | 'decent-cloth'
  | 'rough-fabric'
  | 'tattered'
  | 'threads'

/** Weaver grade */
export type WeaverGrade =
  | 'master-weaver'
  | 'silk-merchant'
  | 'skilled-tailor'
  | 'seamstress'
  | 'apprentice'
  | 'rag-picker'

/** Strengthening measurement */
export interface StrengtheningMeasure {
  tensile: number
  grade: TensileGrade
  hasHighTensile: boolean
  hasStrong: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasTough: boolean
  hasNoWeak: boolean
  hasRobust: boolean
  hasNoFlimsy: boolean
  hasSturdy: boolean
  fragileCount: number
  breakableCount: number
}

/** Weaving measurement */
export interface WeavingMeasure {
  quality: number
  weave: WeaveQuality
  hasHighQuality: boolean
  hasIntegrated: boolean
  hasConnected: boolean
  hasNoSeparated: boolean
  hasCohesive: boolean
  hasNoFragmented: boolean
  hasWoven: boolean
  hasNoLoose: boolean
  hasInterlocked: boolean
  hasNoGapping: boolean
  hasSeamless: boolean
  separatedCount: number
  fragmentedCount: number
}

/** Dyeing measurement */
export interface DyeingMeasure {
  consistency: number
  dye: DyeConsistency
  hasHighConsistency: boolean
  hasUniform: boolean
  hasConsistent: boolean
  hasNoMismatched: boolean
  hasHarmonious: boolean
  hasNoClashing: boolean
  hasEven: boolean
  hasNoUneven: boolean
  hasMatching: boolean
  hasNoConflicting: boolean
  hasCoherent: boolean
  mismatchedCount: number
  clashingCount: number
}

/** Looming measurement */
export interface LoomingMeasure {
  precision: number
  loom: LoomPrecision
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoImprecise: boolean
  hasPrecise: boolean
  hasNoSloppy: boolean
  hasCalibrated: boolean
  hasNoMisaligned: boolean
  hasSharp: boolean
  hasNoBlurred: boolean
  hasDefined: boolean
  impreciseCount: number
  sloppyCount: number
}

/** Counting measurement */
export interface CountingMeasure {
  density: number
  count: ThreadCountQuality
  hasHighDensity: boolean
  hasDense: boolean
  hasSubstantial: boolean
  hasNoSparse: boolean
  hasRich: boolean
  hasNoThin: boolean
  hasAdequate: boolean
  hasNoMeager: boolean
  hasFull: boolean
  hasNoEmpty: boolean
  hasPlush: boolean
  sparseCount: number
  thinCount: number
}

/** Single file analysis */
export interface SilkStrand {
  file: string
  tensileStrength: number
  weaveQuality: number
  dyeConsistency: number
  loomPrecision: number
  threadCount: number
  strengthening: StrengtheningMeasure
  weaving: WeavingMeasure
  dyeing: DyeingMeasure
  looming: LoomingMeasure
  counting: CountingMeasure
  condition: StrandCondition
  qualityScore: number
}

/** Directory-level loom */
export interface SilkLoom {
  directory: string
  strands: SilkStrand[]
  avgTensile: number
  avgWeave: number
  avgDensity: number
  masterWeaverCount: number
  shreddedCount: number
  loomType: LoomType
  condition: FabricCondition
}

/** Fabric summary */
export interface FabricSummary {
  avgTensile: number
  avgWeave: number
  avgDensity: number
  isFineSilk: boolean
  overallQuality: number
}

/** Full stats */
export interface SilkThreadStats {
  totalFiles: number
  totalLooms: number
  avgTensileStrength: number
  avgWeaveQuality: number
  avgDyeConsistency: number
  avgLoomPrecision: number
  avgThreadCount: number
  masterWeaverCount: number
  fineSilkCount: number
  properThreadCount: number
  cottonYarnCount: number
  burlapCount: number
  shreddedCount: number
  hasHighTensileCount: number
  hasHighQualityCount: number
  hasHighConsistencyCount: number
  hasHighPrecisionCount: number
  hasHighDensityCount: number
  overallQuality: number
  weaverGrade: WeaverGrade
  bestStrand: string
  strongest: string
  bestWoven: string
  mostConsistent: string
  mostPrecise: string
}

/** Full result */
export interface SilkThreadResult {
  strands: SilkStrand[]
  looms: SilkLoom[]
  fabric: FabricSummary
  stats: SilkThreadStats
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
 * Measure tensile strength
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.grade) // 'spider-silk'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 10 : 0

  const hasStrong = hasExport(content) && hasImport(content)
  const hasDurable = hasInterface(content) && hasClass(content)
  const hasResilient = hasGenerics(content) && hasTypeAlias(content)
  const hasTough = hasNamedExport(content) && hasReturnType(content)
  const hasRobust = hasAsync(content) && hasDocComments(content)
  const hasSturdy = hasExport(content) && hasGenerics(content)

  score += hasStrong ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasSturdy ? 5 : 0

  const tensile = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const breakableCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBreakable = breakableCount === 0
  const hasNoWeak = !has(/\beval\b/, content)
  const hasNoFlimsy = !has(/\bdebugger\b/, content)
  const hasHighTensile = tensile >= 70

  let grade: TensileGrade
  if (tensile >= 85) grade = 'spider-silk'
  else if (tensile >= 70) grade = 'tensile-steel'
  else if (tensile >= 55) grade = 'strong-thread'
  else if (tensile >= 40) grade = 'proper-yarn'
  else if (tensile >= 25) grade = 'weak-thread'
  else grade = 'snapped'

  return {
    tensile, grade, hasHighTensile, hasStrong, hasDurable, hasNoFragile,
    hasResilient, hasNoBreakable, hasTough, hasNoWeak, hasRobust,
    hasNoFlimsy, hasSturdy, fragileCount, breakableCount,
  }
}

/**
 * Measure weave quality
 * @example
 * const m = measureWeaving(content)
 * console.log(m.weave) // 'damask'
 */
export function measureWeaving(content: string): WeavingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasIntegrated = hasExport(content) && hasNamedExport(content)
  const hasConnected = hasInterface(content) && hasClass(content)
  const hasCohesive = hasDocComments(content) && hasReturnType(content)
  const hasWoven = hasGenerics(content) && hasTypeAlias(content)
  const hasInterlocked = hasConst(content) && hasExport(content)
  const hasSeamless = hasDocComments(content) && hasAsync(content)

  score += hasIntegrated ? 5 : 0
  score += hasConnected ? 5 : 0
  score += hasCohesive ? 5 : 0
  score += hasWoven ? 5 : 0
  score += hasInterlocked ? 5 : 0
  score += hasSeamless ? 5 : 0

  const quality = Math.min(score, 100)
  const separatedCount = count(/\bvar\b/, content)
  const fragmentedCount = count(/\bany\b/, content)

  const hasNoSeparated = separatedCount === 0
  const hasNoFragmented = fragmentedCount === 0
  const hasNoLoose = !has(/\beval\b/, content)
  const hasNoGapping = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let weave: WeaveQuality
  if (quality >= 85) weave = 'damask'
  else if (quality >= 70) weave = 'jacquard'
  else if (quality >= 55) weave = 'proper-weave'
  else if (quality >= 40) weave = 'loose-weave'
  else if (quality >= 25) weave = 'fraying'
  else weave = 'unraveled'

  return {
    quality, weave, hasHighQuality, hasIntegrated, hasConnected, hasNoSeparated,
    hasCohesive, hasNoFragmented, hasWoven, hasNoLoose, hasInterlocked,
    hasNoGapping, hasSeamless, separatedCount, fragmentedCount,
  }
}

/**
 * Measure dye consistency
 * @example
 * const m = measureDyeing(content)
 * console.log(m.dye) // 'uniform-color'
 */
export function measureDyeing(content: string): DyeingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0

  const hasUniform = hasConst(content) && hasReadonly(content)
  const hasConsistent = hasStrictEq(content) && hasReturnType(content)
  const hasHarmonious = hasInterface(content) && hasGenerics(content)
  const hasEven = hasClass(content) && hasPrivate(content)
  const hasMatching = hasTypeAlias(content) && hasExport(content)
  const hasCoherent = hasConst(content) && hasInterface(content)

  score += hasUniform ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasEven ? 5 : 0
  score += hasMatching ? 5 : 0
  score += hasCoherent ? 5 : 0

  const consistency = Math.min(score, 100)
  const mismatchedCount = count(/\bvar\b/, content)
  const clashingCount = count(/\bany\b/, content)

  const hasNoMismatched = mismatchedCount === 0
  const hasNoClashing = clashingCount === 0
  const hasNoUneven = !has(/\beval\b/, content)
  const hasNoConflicting = !has(/\bdebugger\b/, content)
  const hasHighConsistency = consistency >= 70

  let dye: DyeConsistency
  if (consistency >= 85) dye = 'uniform-color'
  else if (consistency >= 70) dye = 'consistent-dye'
  else if (consistency >= 55) dye = 'proper-shade'
  else if (consistency >= 40) dye = 'patchy-dye'
  else if (consistency >= 25) dye = 'faded'
  else dye = 'bleached'

  return {
    consistency, dye, hasHighConsistency, hasUniform, hasConsistent, hasNoMismatched,
    hasHarmonious, hasNoClashing, hasEven, hasNoUneven, hasMatching,
    hasNoConflicting, hasCoherent, mismatchedCount, clashingCount,
  }
}

/**
 * Measure loom precision
 * @example
 * const m = measureLooming(content)
 * console.log(m.loom) // 'master-loom'
 */
export function measureLooming(content: string): LoomingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasAccurate = hasStrictEq(content) && hasConst(content)
  const hasExact = hasReturnType(content) && hasReadonly(content)
  const hasPrecise = hasPrivate(content) && hasClass(content)
  const hasCalibrated = hasInterface(content) && hasGenerics(content)
  const hasSharp = hasExport(content) && hasTypeAlias(content)
  const hasDefined = hasStrictEq(content) && hasReturnType(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasCalibrated ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0

  const precision = Math.min(score, 100)
  const impreciseCount = count(/\bvar\b/, content)
  const sloppyCount = count(/\bany\b/, content)

  const hasNoImprecise = impreciseCount === 0
  const hasNoSloppy = sloppyCount === 0
  const hasNoMisaligned = !has(/\beval\b/, content)
  const hasNoBlurred = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let loom: LoomPrecision
  if (precision >= 85) loom = 'master-loom'
  else if (precision >= 70) loom = 'precision-loom'
  else if (precision >= 55) loom = 'proper-loom'
  else if (precision >= 40) loom = 'wobbly-loom'
  else if (precision >= 25) loom = 'misaligned'
  else loom = 'broken-loom'

  return {
    precision, loom, hasHighPrecision, hasAccurate, hasExact, hasNoImprecise,
    hasPrecise, hasNoSloppy, hasCalibrated, hasNoMisaligned, hasSharp,
    hasNoBlurred, hasDefined, impreciseCount, sloppyCount,
  }
}

/**
 * Measure thread count quality
 * @example
 * const m = measureCounting(content)
 * console.log(m.count) // 'egyptian-cotton'
 */
export function measureCounting(content: string): CountingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasDense = hasDocComments(content) && hasReturnType(content)
  const hasSubstantial = hasExport(content) && hasDocComments(content)
  const hasRich = hasInterface(content) && hasGenerics(content)
  const hasAdequate = hasNamedExport(content) && hasReturnType(content)
  const hasFull = hasClass(content) && hasDocComments(content)
  const hasPlush = hasConst(content) && hasTypeAlias(content)

  score += hasDense ? 5 : 0
  score += hasSubstantial ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasAdequate ? 5 : 0
  score += hasFull ? 5 : 0
  score += hasPlush ? 5 : 0

  const density = Math.min(score, 100)
  const sparseCount = count(/\bvar\b/, content)
  const thinCount = count(/\bany\b/, content)

  const hasNoSparse = sparseCount === 0
  const hasNoThin = thinCount === 0
  const hasNoMeager = !has(/\beval\b/, content)
  const hasNoEmpty = !has(/\bdebugger\b/, content)
  const hasHighDensity = density >= 70

  let countGrade: ThreadCountQuality
  if (density >= 85) countGrade = 'egyptian-cotton'
  else if (density >= 70) countGrade = 'high-thread'
  else if (density >= 55) countGrade = 'proper-count'
  else if (density >= 40) countGrade = 'low-thread'
  else if (density >= 25) countGrade = 'see-through'
  else countGrade = 'gauze'

  return {
    density, count: countGrade, hasHighDensity, hasDense, hasSubstantial, hasNoSparse,
    hasRich, hasNoThin, hasAdequate, hasNoMeager, hasFull, hasNoEmpty,
    hasPlush, sparseCount, thinCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify strand condition
 * @example
 * classifyStrandCondition(90) // 'master-weaver'
 */
export function classifyStrandCondition(score: number): StrandCondition {
  if (score >= 85) return 'master-weaver'
  if (score >= 70) return 'fine-silk'
  if (score >= 55) return 'proper-thread'
  if (score >= 40) return 'cotton-yarn'
  if (score >= 25) return 'burlap'
  return 'shredded'
}

/**
 * Classify loom type
 * @example
 * classifyLoomType(strands) // 'silk-mill'
 */
export function classifyLoomType(strands: SilkStrand[]): LoomType {
  if (strands.length === 0) return 'no-loom'
  const avgQs = Math.round(strands.reduce((s, st) => s + st.qualityScore, 0) / strands.length)
  const masterRatio = strands.filter(st => st.condition === 'master-weaver').length / strands.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'silk-mill'
  if (avgQs >= 60) return 'weaving-workshop'
  if (avgQs >= 45) return 'hand-loom'
  if (avgQs >= 30) return 'spinning-wheel'
  if (avgQs >= 15) return 'distaff'
  return 'no-loom'
}

/**
 * Classify weaver grade
 * @example
 * classifyWeaverGrade(85) // 'master-weaver'
 */
export function classifyWeaverGrade(avgQuality: number): WeaverGrade {
  if (avgQuality >= 80) return 'master-weaver'
  if (avgQuality >= 65) return 'silk-merchant'
  if (avgQuality >= 50) return 'skilled-tailor'
  if (avgQuality >= 35) return 'seamstress'
  if (avgQuality >= 20) return 'apprentice'
  return 'rag-picker'
}

/**
 * Classify fabric condition
 * @example
 * classifyFabricCondition(80) // 'luxury-fabric'
 */
export function classifyFabricCondition(avgQs: number): FabricCondition {
  if (avgQs >= 75) return 'luxury-fabric'
  if (avgQs >= 60) return 'fine-textile'
  if (avgQs >= 45) return 'decent-cloth'
  if (avgQs >= 30) return 'rough-fabric'
  if (avgQs >= 15) return 'tattered'
  return 'threads'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(strands, looms, fabric, stats)
 */
export function generateRecommendations(
  strands: SilkStrand[],
  looms: SilkLoom[],
  fabric: FabricSummary,
  stats: SilkThreadStats,
): string[] {
  const recs: string[] = []
  if (stats.avgTensileStrength < 50) {
    recs.push('Strengthen tensile quality with strong exports, durable interfaces, and resilient type signatures')
  }
  if (stats.avgWeaveQuality < 50) {
    recs.push('Improve weave quality with integrated exports, connected interfaces, and cohesive documentation')
  }
  if (stats.avgDyeConsistency < 50) {
    recs.push('Enhance dye consistency with uniform const usage, consistent strict equality, and harmonious patterns')
  }
  if (stats.avgLoomPrecision < 50) {
    recs.push('Refine loom precision with accurate strict equality, exact return types, and calibrated interfaces')
  }
  if (stats.avgThreadCount < 50) {
    recs.push('Increase thread count with dense documentation, substantial exports, and rich type coverage')
  }
  if (stats.shreddedCount > 0) {
    recs.push(`${stats.shreddedCount} file(s) are shredded — consider significant refactoring`)
  }
  if (fabric.overallQuality < 40) {
    recs.push('Overall fabric quality is poor — focus on tensile strength and weave quality first')
  }
  const allNoLoom = looms.every(l => l.loomType === 'no-loom' || l.loomType === 'distaff')
  if (allNoLoom && looms.length > 0) {
    recs.push('All looms are bare or minimal — consider a major quality overhaul')
  }
  const wrecked = strands.filter(st => st.condition === 'shredded').map(st => st.file)
  if (wrecked.length > 0 && wrecked.length <= 3) {
    recs.push(`Repair these shredded files: ${wrecked.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your silk threads weave a masterpiece! Every strand gleams with quality')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a silk strand
 * @example
 * const strand = analyzeSilkStrand(content, 'index.ts')
 * console.log(strand.condition) // 'master-weaver'
 */
export function analyzeSilkStrand(content: string, filePath: string): SilkStrand {
  const strengthening = measureStrengthening(content)
  const weaving = measureWeaving(content)
  const dyeing = measureDyeing(content)
  const looming = measureLooming(content)
  const counting = measureCounting(content)

  const qualityScore = Math.round(
    strengthening.tensile * 0.2 +
    weaving.quality * 0.2 +
    dyeing.consistency * 0.2 +
    looming.precision * 0.2 +
    counting.density * 0.2,
  )

  return {
    file: filePath,
    tensileStrength: strengthening.tensile,
    weaveQuality: weaving.quality,
    dyeConsistency: dyeing.consistency,
    loomPrecision: looming.precision,
    threadCount: counting.density,
    strengthening,
    weaving,
    dyeing,
    looming,
    counting,
    condition: classifyStrandCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a silk loom
 * @example
 * const loom = analyzeSilkLoom(strands, 'src')
 * console.log(loom.loomType) // 'silk-mill'
 */
export function analyzeSilkLoom(strands: SilkStrand[], dirPath: string): SilkLoom {
  if (strands.length === 0) {
    return {
      directory: dirPath, strands: [], avgTensile: 0, avgWeave: 0, avgDensity: 0,
      masterWeaverCount: 0, shreddedCount: 0, loomType: 'no-loom', condition: 'threads',
    }
  }

  const avgTensile = Math.round(strands.reduce((s, st) => s + st.tensileStrength, 0) / strands.length)
  const avgWeave = Math.round(strands.reduce((s, st) => s + st.weaveQuality, 0) / strands.length)
  const avgDensity = Math.round(strands.reduce((s, st) => s + st.threadCount, 0) / strands.length)
  const masterWeaverCount = strands.filter(st => st.condition === 'master-weaver').length
  const shreddedCount = strands.filter(st => st.condition === 'shredded').length
  const avgQs = Math.round(strands.reduce((s, st) => s + st.qualityScore, 0) / strands.length)

  return {
    directory: dirPath, strands, avgTensile, avgWeave, avgDensity,
    masterWeaverCount, shreddedCount, loomType: classifyLoomType(strands),
    condition: classifyFabricCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete silk thread result
 * @example
 * const result = await buildSilkThreadResult(files, contents)
 * console.log(result.stats.weaverGrade) // 'master-weaver'
 */
export async function buildSilkThreadResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilkThreadResult> {
  const strands = files.map((file, i) => analyzeSilkStrand(contents[i] ?? '', file))

  const dirMap = new Map<string, SilkStrand[]>()
  for (const strand of strands) {
    const dir = path.dirname(strand.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(strand) } else { dirMap.set(dir, [strand]) }
  }

  const looms = Array.from(dirMap.entries()).map(([dir, dirStrands]) =>
    analyzeSilkLoom(dirStrands, dir),
  )

  const avgTensile = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.tensileStrength, 0) / strands.length) : 0
  const avgWeave = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.weaveQuality, 0) / strands.length) : 0
  const avgDensity = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.threadCount, 0) / strands.length) : 0

  const overallQuality = strands.length > 0
    ? Math.round((avgTensile + avgWeave + avgDensity) / 3) : 0
  const isFineSilk = avgWeave >= 60

  const fabric: FabricSummary = { avgTensile, avgWeave, avgDensity, isFineSilk, overallQuality }

  const avgDyeConsistency = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.dyeConsistency, 0) / strands.length) : 0
  const avgLoomPrecision = strands.length > 0
    ? Math.round(strands.reduce((s, st) => s + st.loomPrecision, 0) / strands.length) : 0

  const bestStrand = strands.length > 0
    ? strands.reduce((best, st) => st.qualityScore > best.qualityScore ? st : best).file : ''
  const strongest = strands.length > 0
    ? strands.reduce((best, st) => st.tensileStrength > best.tensileStrength ? st : best).file : ''
  const bestWoven = strands.length > 0
    ? strands.reduce((best, st) => st.weaveQuality > best.weaveQuality ? st : best).file : ''
  const mostConsistent = strands.length > 0
    ? strands.reduce((best, st) => st.dyeConsistency > best.dyeConsistency ? st : best).file : ''
  const mostPrecise = strands.length > 0
    ? strands.reduce((best, st) => st.loomPrecision > best.loomPrecision ? st : best).file : ''

  const stats: SilkThreadStats = {
    totalFiles: strands.length,
    totalLooms: looms.length,
    avgTensileStrength: avgTensile,
    avgWeaveQuality: avgWeave,
    avgDyeConsistency,
    avgLoomPrecision,
    avgThreadCount: avgDensity,
    masterWeaverCount: strands.filter(st => st.condition === 'master-weaver').length,
    fineSilkCount: strands.filter(st => st.condition === 'fine-silk').length,
    properThreadCount: strands.filter(st => st.condition === 'proper-thread').length,
    cottonYarnCount: strands.filter(st => st.condition === 'cotton-yarn').length,
    burlapCount: strands.filter(st => st.condition === 'burlap').length,
    shreddedCount: strands.filter(st => st.condition === 'shredded').length,
    hasHighTensileCount: strands.filter(st => st.strengthening.hasHighTensile).length,
    hasHighQualityCount: strands.filter(st => st.weaving.hasHighQuality).length,
    hasHighConsistencyCount: strands.filter(st => st.dyeing.hasHighConsistency).length,
    hasHighPrecisionCount: strands.filter(st => st.looming.hasHighPrecision).length,
    hasHighDensityCount: strands.filter(st => st.counting.hasHighDensity).length,
    overallQuality,
    weaverGrade: classifyWeaverGrade(overallQuality),
    bestStrand, strongest, bestWoven, mostConsistent, mostPrecise,
  }

  const recommendations = generateRecommendations(strands, looms, fabric, stats)

  return { strands, looms, fabric, stats, recommendations }
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
