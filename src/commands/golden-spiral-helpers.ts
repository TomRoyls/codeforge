// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Growth grade */
export type GrowthGrade =
  | 'golden-ratio'
  | 'fibonacci-perfect'
  | 'proper-sequence'
  | 'uneven-growth'
  | 'stunted'
  | 'no-growth'

/** Balance grade */
export type BalanceGrade =
  | 'golden-section'
  | 'well-proportioned'
  | 'proper-balance'
  | 'uneven-weight'
  | 'imbalanced'
  | 'distorted'

/** Elegance grade */
export type EleganceGrade =
  | 'elegant-curve'
  | 'graceful-arc'
  | 'proper-expansion'
  | 'clunky-growth'
  | 'forced-expansion'
  | 'no-expansion'

/** Curve grade */
export type CurveGrade =
  | 'logarithmic-perfection'
  | 'smooth-arc'
  | 'proper-curve'
  | 'angular'
  | 'jagged-line'
  | 'broken-path'

/** Expansion grade */
export type ExpansionGrade =
  | 'symphonic-growth'
  | 'harmonic-expansion'
  | 'proper-scaling'
  | 'discordant-growth'
  | 'chaotic-expansion'
  | 'implosion'

/** Curve condition */
export type CurveCondition =
  | 'golden-masterpiece'
  | 'nautilus-perfection'
  | 'proper-spiral'
  | 'wonky-curve'
  | 'broken-coil'
  | 'straight-line'

/** Galaxy type */
export type GalaxyType =
  | 'spiral-galaxy'
  | 'barred-spiral'
  | 'proper-vortex'
  | 'elliptical'
  | 'irregular'
  | 'void'

/** Galaxy condition */
export type GalaxyCondition =
  | 'golden-age'
  | 'renaissance'
  | 'classical'
  | 'medieval'
  | 'primitive'
  | 'void'

/** Architect grade */
export type ArchitectGrade =
  | 'golden-architect'
  | 'master-designer'
  | 'skilled-builder'
  | 'apprentice'
  | 'novice'
  | 'square-peg'

/** Growing measurement */
export interface GrowingMeasure {
  quality: number
  grade: GrowthGrade
  hasHighQuality: boolean
  hasProportional: boolean
  hasBalanced: boolean
  hasNoLopsided: boolean
  hasOrganic: boolean
  hasNoArtificial: boolean
  hasNatural: boolean
  hasNoForced: boolean
  hasProgressive: boolean
  hasNoStagnant: boolean
  hasMeasured: boolean
  lopsidedCount: number
  artificialCount: number
}

/** Balancing measurement */
export interface BalancingMeasure {
  proportion: number
  balance: BalanceGrade
  hasHighProportion: boolean
  hasEven: boolean
  hasSymmetric: boolean
  hasNoAsymmetric: boolean
  hasHarmonious: boolean
  hasNoDisproportionate: boolean
  hasBalanced: boolean
  hasNoSkewed: boolean
  hasProportioned: boolean
  hasNoUneven: boolean
  hasEquilibrated: boolean
  asymmetricCount: number
  disproportionateCount: number
}

/** Elegancing measurement */
export interface ElegancingMeasure {
  elegance: number
  growth: EleganceGrade
  hasHighElegance: boolean
  hasGraceful: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasSophisticated: boolean
  hasNoBrute: boolean
  hasPolished: boolean
  hasNoRaw: boolean
  hasSmooth: boolean
  hasNoJagged: boolean
  hasElegant: boolean
  crudeCount: number
  bruteCount: number
}

/** Smoothing measurement */
export interface SmoothingMeasure {
  smoothness: number
  curve: CurveGrade
  hasHighSmoothness: boolean
  hasFlowing: boolean
  hasContinuous: boolean
  hasNoJerky: boolean
  hasSeamless: boolean
  hasNoAbrupt: boolean
  hasFluid: boolean
  hasNoRigid: boolean
  hasGradual: boolean
  hasNoSudden: boolean
  hasOrganic: boolean
  jerkyCount: number
  abruptCount: number
}

/** Harmonizing measurement */
export interface HarmonizingMeasure {
  harmony: number
  expansion: ExpansionGrade
  hasHighHarmony: boolean
  hasCoordinated: boolean
  hasUnified: boolean
  hasNoFragmented: boolean
  hasSynchronized: boolean
  hasNoDesynchronized: boolean
  hasCoherent: boolean
  hasNoIncoherent: boolean
  hasHarmonious: boolean
  hasNoClashing: boolean
  hasAligned: boolean
  fragmentedCount: number
  desynchronizedCount: number
}

/** Single file analysis */
export interface GoldenCurve {
  file: string
  fibonacciQuality: number
  proportionBalance: number
  growthElegance: number
  curveSmoothness: number
  expansionHarmony: number
  growing: GrowingMeasure
  balancing: BalancingMeasure
  elegancing: ElegancingMeasure
  smoothing: SmoothingMeasure
  harmonizing: HarmonizingMeasure
  condition: CurveCondition
  qualityScore: number
}

/** Directory-level galaxy */
export interface SpiralGalaxy {
  directory: string
  curves: GoldenCurve[]
  avgProportion: number
  avgElegance: number
  avgHarmony: number
  goldenMasterpieceCount: number
  straightLineCount: number
  galaxyType: GalaxyType
  condition: GalaxyCondition
}

/** Universe summary */
export interface UniverseSummary {
  avgProportion: number
  avgElegance: number
  avgHarmony: number
  isGolden: boolean
  overallProportion: number
}

/** Full stats */
export interface GoldenSpiralStats {
  totalFiles: number
  totalGalaxies: number
  avgFibonacciQuality: number
  avgProportionBalance: number
  avgGrowthElegance: number
  avgCurveSmoothness: number
  avgExpansionHarmony: number
  goldenMasterpieceCount: number
  nautilusPerfectionCount: number
  properSpiralCount: number
  wonkyCurveCount: number
  brokenCoilCount: number
  straightLineCount: number
  hasHighQualityCount: number
  hasHighProportionCount: number
  hasHighEleganceCount: number
  hasHighSmoothnessCount: number
  hasHighHarmonyCount: number
  overallProportion: number
  architectGrade: ArchitectGrade
  bestCurve: string
  mostProportional: string
  mostElegant: string
  smoothest: string
  mostHarmonious: string
}

/** Full result */
export interface GoldenSpiralResult {
  curves: GoldenCurve[]
  galaxies: SpiralGalaxy[]
  universe: UniverseSummary
  stats: GoldenSpiralStats
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
 * Measure fibonacci quality (growth pattern)
 * @example
 * const m = measureGrowing(content)
 * console.log(m.grade) // 'golden-ratio'
 */
export function measureGrowing(content: string): GrowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasProportional = hasDocComments(content) && hasExport(content)
  const hasBalanced = hasImport(content) && hasInterface(content)
  const hasOrganic = hasClass(content) && hasGenerics(content)
  const hasNatural = hasTypeAlias(content) && hasConst(content)
  const hasProgressive = hasAsync(content) && hasReturnType(content)
  const hasMeasured = hasExport(content) && hasDocComments(content)

  score += hasProportional ? 5 : 0
  score += hasBalanced ? 5 : 0
  score += hasOrganic ? 5 : 0
  score += hasNatural ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasMeasured ? 5 : 0

  const quality = Math.min(score, 100)
  const lopsidedCount = count(/\bvar\b/, content)
  const artificialCount = count(/\bany\b/, content)

  const hasNoLopsided = lopsidedCount === 0
  const hasNoArtificial = artificialCount === 0
  const hasNoForced = !has(/\beval\b/, content)
  const hasNoStagnant = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: GrowthGrade
  if (quality >= 85) grade = 'golden-ratio'
  else if (quality >= 70) grade = 'fibonacci-perfect'
  else if (quality >= 55) grade = 'proper-sequence'
  else if (quality >= 40) grade = 'uneven-growth'
  else if (quality >= 25) grade = 'stunted'
  else grade = 'no-growth'

  return {
    quality, grade, hasHighQuality, hasProportional, hasBalanced, hasNoLopsided,
    hasOrganic, hasNoArtificial, hasNatural, hasNoForced, hasProgressive,
    hasNoStagnant, hasMeasured, lopsidedCount, artificialCount,
  }
}

/**
 * Measure proportion balance
 * @example
 * const m = measureBalancing(content)
 * console.log(m.balance) // 'golden-section'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasEven = hasInterface(content) && hasClass(content)
  const hasSymmetric = hasExport(content) && hasImport(content)
  const hasHarmonious = hasGenerics(content) && hasTypeAlias(content)
  const hasBalanced = hasConst(content) && hasReturnType(content)
  const hasProportioned = hasDocComments(content) && hasExport(content)
  const hasEquilibrated = hasNamedExport(content) && hasInterface(content)

  score += hasEven ? 5 : 0
  score += hasSymmetric ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasBalanced ? 5 : 0
  score += hasProportioned ? 5 : 0
  score += hasEquilibrated ? 5 : 0

  const proportion = Math.min(score, 100)
  const asymmetricCount = count(/\bvar\b/, content)
  const disproportionateCount = count(/\bany\b/, content)

  const hasNoAsymmetric = asymmetricCount === 0
  const hasNoDisproportionate = disproportionateCount === 0
  const hasNoSkewed = !has(/\beval\b/, content)
  const hasNoUneven = !has(/\bdebugger\b/, content)
  const hasHighProportion = proportion >= 70

  let balance: BalanceGrade
  if (proportion >= 85) balance = 'golden-section'
  else if (proportion >= 70) balance = 'well-proportioned'
  else if (proportion >= 55) balance = 'proper-balance'
  else if (proportion >= 40) balance = 'uneven-weight'
  else if (proportion >= 25) balance = 'imbalanced'
  else balance = 'distorted'

  return {
    proportion, balance, hasHighProportion, hasEven, hasSymmetric, hasNoAsymmetric,
    hasHarmonious, hasNoDisproportionate, hasBalanced, hasNoSkewed, hasProportioned,
    hasNoUneven, hasEquilibrated, asymmetricCount, disproportionateCount,
  }
}

/**
 * Measure growth elegance
 * @example
 * const m = measureElegancing(content)
 * console.log(m.growth) // 'elegant-curve'
 */
export function measureElegancing(content: string): ElegancingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasGraceful = hasReturnType(content) && hasStrictEq(content)
  const hasRefined = hasReadonly(content) && hasPrivate(content)
  const hasSophisticated = hasDocComments(content) && hasInterface(content)
  const hasPolished = hasGenerics(content) && hasExport(content)
  const hasSmooth = hasAsync(content) && hasReturnType(content)
  const hasElegant = hasStrictEq(content) && hasClass(content)

  score += hasGraceful ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasSophisticated ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasElegant ? 5 : 0

  const elegance = Math.min(score, 100)
  const crudeCount = count(/\bvar\b/, content)
  const bruteCount = count(/\bany\b/, content)

  const hasNoCrude = crudeCount === 0
  const hasNoBrute = bruteCount === 0
  const hasNoRaw = !has(/\beval\b/, content)
  const hasNoJagged = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let growth: EleganceGrade
  if (elegance >= 85) growth = 'elegant-curve'
  else if (elegance >= 70) growth = 'graceful-arc'
  else if (elegance >= 55) growth = 'proper-expansion'
  else if (elegance >= 40) growth = 'clunky-growth'
  else if (elegance >= 25) growth = 'forced-expansion'
  else growth = 'no-expansion'

  return {
    elegance, growth, hasHighElegance, hasGraceful, hasRefined, hasNoCrude,
    hasSophisticated, hasNoBrute, hasPolished, hasNoRaw, hasSmooth,
    hasNoJagged, hasElegant, crudeCount, bruteCount,
  }
}

/**
 * Measure curve smoothness
 * @example
 * const m = measureSmoothing(content)
 * console.log(m.curve) // 'logarithmic-perfection'
 */
export function measureSmoothing(content: string): SmoothingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasFlowing = hasExport(content) && hasConst(content)
  const hasContinuous = hasInterface(content) && hasAsync(content)
  const hasSeamless = hasDocComments(content) && hasReturnType(content)
  const hasFluid = hasGenerics(content) && hasClass(content)
  const hasGradual = hasImport(content) && hasExport(content)
  const hasOrganic = hasNamedExport(content) && hasConst(content)

  score += hasFlowing ? 5 : 0
  score += hasContinuous ? 5 : 0
  score += hasSeamless ? 5 : 0
  score += hasFluid ? 5 : 0
  score += hasGradual ? 5 : 0
  score += hasOrganic ? 5 : 0

  const smoothness = Math.min(score, 100)
  const jerkyCount = count(/\bvar\b/, content)
  const abruptCount = count(/\bany\b/, content)

  const hasNoJerky = jerkyCount === 0
  const hasNoAbrupt = abruptCount === 0
  const hasNoRigid = !has(/\beval\b/, content)
  const hasNoSudden = !has(/\bdebugger\b/, content)
  const hasHighSmoothness = smoothness >= 70

  let curve: CurveGrade
  if (smoothness >= 85) curve = 'logarithmic-perfection'
  else if (smoothness >= 70) curve = 'smooth-arc'
  else if (smoothness >= 55) curve = 'proper-curve'
  else if (smoothness >= 40) curve = 'angular'
  else if (smoothness >= 25) curve = 'jagged-line'
  else curve = 'broken-path'

  return {
    smoothness, curve, hasHighSmoothness, hasFlowing, hasContinuous, hasNoJerky,
    hasSeamless, hasNoAbrupt, hasFluid, hasNoRigid, hasGradual,
    hasNoSudden, hasOrganic, jerkyCount, abruptCount,
  }
}

/**
 * Measure expansion harmony
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.expansion) // 'symphonic-growth'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasCoordinated = hasExport(content) && hasImport(content)
  const hasUnified = hasDocComments(content) && hasInterface(content)
  const hasSynchronized = hasClass(content) && hasReturnType(content)
  const hasCoherent = hasGenerics(content) && hasConst(content)
  const hasHarmonious = hasAsync(content) && hasExport(content)
  const hasAligned = hasReadonly(content) && hasInterface(content)

  score += hasCoordinated ? 5 : 0
  score += hasUnified ? 5 : 0
  score += hasSynchronized ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasAligned ? 5 : 0

  const harmony = Math.min(score, 100)
  const fragmentedCount = count(/\bvar\b/, content)
  const desynchronizedCount = count(/\bany\b/, content)

  const hasNoFragmented = fragmentedCount === 0
  const hasNoDesynchronized = desynchronizedCount === 0
  const hasNoIncoherent = !has(/\beval\b/, content)
  const hasNoClashing = !has(/\bdebugger\b/, content)
  const hasHighHarmony = harmony >= 70

  let expansion: ExpansionGrade
  if (harmony >= 85) expansion = 'symphonic-growth'
  else if (harmony >= 70) expansion = 'harmonic-expansion'
  else if (harmony >= 55) expansion = 'proper-scaling'
  else if (harmony >= 40) expansion = 'discordant-growth'
  else if (harmony >= 25) expansion = 'chaotic-expansion'
  else expansion = 'implosion'

  return {
    harmony, expansion, hasHighHarmony, hasCoordinated, hasUnified, hasNoFragmented,
    hasSynchronized, hasNoDesynchronized, hasCoherent, hasNoIncoherent, hasHarmonious,
    hasNoClashing, hasAligned, fragmentedCount, desynchronizedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify curve condition
 * @example
 * classifyCurveCondition(90) // 'golden-masterpiece'
 */
export function classifyCurveCondition(score: number): CurveCondition {
  if (score >= 85) return 'golden-masterpiece'
  if (score >= 70) return 'nautilus-perfection'
  if (score >= 55) return 'proper-spiral'
  if (score >= 40) return 'wonky-curve'
  if (score >= 25) return 'broken-coil'
  return 'straight-line'
}

/**
 * Classify galaxy type
 * @example
 * classifyGalaxyType(curves) // 'spiral-galaxy'
 */
export function classifyGalaxyType(curves: GoldenCurve[]): GalaxyType {
  if (curves.length === 0) return 'void'
  const avgQs = Math.round(curves.reduce((s, c) => s + c.qualityScore, 0) / curves.length)
  const goldenRatio = curves.filter(c => c.condition === 'golden-masterpiece').length / curves.length
  if (avgQs >= 75 && goldenRatio >= 0.5) return 'spiral-galaxy'
  if (avgQs >= 60) return 'barred-spiral'
  if (avgQs >= 45) return 'proper-vortex'
  if (avgQs >= 30) return 'elliptical'
  if (avgQs >= 15) return 'irregular'
  return 'void'
}

/**
 * Classify architect grade
 * @example
 * classifyArchitectGrade(85) // 'golden-architect'
 */
export function classifyArchitectGrade(avgProportion: number): ArchitectGrade {
  if (avgProportion >= 80) return 'golden-architect'
  if (avgProportion >= 65) return 'master-designer'
  if (avgProportion >= 50) return 'skilled-builder'
  if (avgProportion >= 35) return 'apprentice'
  if (avgProportion >= 20) return 'novice'
  return 'square-peg'
}

/**
 * Classify galaxy condition
 * @example
 * classifyGalaxyCondition(80) // 'golden-age'
 */
export function classifyGalaxyCondition(avgQs: number): GalaxyCondition {
  if (avgQs >= 75) return 'golden-age'
  if (avgQs >= 60) return 'renaissance'
  if (avgQs >= 45) return 'classical'
  if (avgQs >= 30) return 'medieval'
  if (avgQs >= 15) return 'primitive'
  return 'void'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(curves, galaxies, universe, stats)
 */
export function generateRecommendations(
  curves: GoldenCurve[],
  galaxies: SpiralGalaxy[],
  universe: UniverseSummary,
  stats: GoldenSpiralStats,
): string[] {
  const recs: string[] = []
  if (stats.avgFibonacciQuality < 50) {
    recs.push('Grow fibonacci quality with organic interfaces, balanced classes, and progressive type patterns')
  }
  if (stats.avgProportionBalance < 50) {
    recs.push('Balance proportions with even interfaces, symmetric exports, and harmonious generics')
  }
  if (stats.avgGrowthElegance < 50) {
    recs.push('Refine growth elegance with graceful return types, refined readonly, and polished async patterns')
  }
  if (stats.avgCurveSmoothness < 50) {
    recs.push('Smooth curve flow with flowing exports, continuous interfaces, and seamless documentation')
  }
  if (stats.avgExpansionHarmony < 50) {
    recs.push('Harmonize expansion with coordinated imports/exports, unified types, and coherent patterns')
  }
  if (stats.straightLineCount > 0) {
    recs.push(`${stats.straightLineCount} file(s) are straight lines — consider significant refactoring`)
  }
  if (universe.overallProportion < 40) {
    recs.push('Overall golden proportion is poor — focus on fibonacci quality and proportion balance first')
  }
  const allVoid = galaxies.every(g => g.galaxyType === 'void' || g.galaxyType === 'irregular')
  if (allVoid && galaxies.length > 0) {
    recs.push('All galaxies are void or irregular — consider a major quality overhaul')
  }
  const lines = curves.filter(c => c.condition === 'straight-line').map(c => c.file)
  if (lines.length > 0 && lines.length <= 3) {
    recs.push(`Bend these straight-line files into curves: ${lines.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('450 commands - a golden spiral of code analysis excellence! Your code spirals with fibonacci perfection')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a golden curve
 * @example
 * const curve = analyzeGoldenCurve(content, 'index.ts')
 * console.log(curve.condition) // 'golden-masterpiece'
 */
export function analyzeGoldenCurve(content: string, filePath: string): GoldenCurve {
  const growing = measureGrowing(content)
  const balancing = measureBalancing(content)
  const elegancing = measureElegancing(content)
  const smoothing = measureSmoothing(content)
  const harmonizing = measureHarmonizing(content)

  const qualityScore = Math.round(
    growing.quality * 0.2 +
    balancing.proportion * 0.2 +
    elegancing.elegance * 0.2 +
    smoothing.smoothness * 0.2 +
    harmonizing.harmony * 0.2,
  )

  return {
    file: filePath,
    fibonacciQuality: growing.quality,
    proportionBalance: balancing.proportion,
    growthElegance: elegancing.elegance,
    curveSmoothness: smoothing.smoothness,
    expansionHarmony: harmonizing.harmony,
    growing,
    balancing,
    elegancing,
    smoothing,
    harmonizing,
    condition: classifyCurveCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a spiral galaxy
 * @example
 * const galaxy = analyzeSpiralGalaxy(curves, 'src')
 * console.log(galaxy.galaxyType) // 'spiral-galaxy'
 */
export function analyzeSpiralGalaxy(curves: GoldenCurve[], dirPath: string): SpiralGalaxy {
  if (curves.length === 0) {
    return {
      directory: dirPath, curves: [], avgProportion: 0, avgElegance: 0, avgHarmony: 0,
      goldenMasterpieceCount: 0, straightLineCount: 0, galaxyType: 'void', condition: 'void',
    }
  }

  const avgProportion = Math.round(curves.reduce((s, c) => s + c.proportionBalance, 0) / curves.length)
  const avgElegance = Math.round(curves.reduce((s, c) => s + c.growthElegance, 0) / curves.length)
  const avgHarmony = Math.round(curves.reduce((s, c) => s + c.expansionHarmony, 0) / curves.length)
  const goldenMasterpieceCount = curves.filter(c => c.condition === 'golden-masterpiece').length
  const straightLineCount = curves.filter(c => c.condition === 'straight-line').length
  const avgQs = Math.round(curves.reduce((s, c) => s + c.qualityScore, 0) / curves.length)

  return {
    directory: dirPath, curves, avgProportion, avgElegance, avgHarmony,
    goldenMasterpieceCount, straightLineCount, galaxyType: classifyGalaxyType(curves),
    condition: classifyGalaxyCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete golden spiral result
 * @example
 * const result = await buildGoldenSpiralResult(files, contents)
 * console.log(result.stats.architectGrade) // 'golden-architect'
 */
export async function buildGoldenSpiralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GoldenSpiralResult> {
  const curves = files.map((file, i) => analyzeGoldenCurve(contents[i] ?? '', file))

  const dirMap = new Map<string, GoldenCurve[]>()
  for (const curve of curves) {
    const dir = path.dirname(curve.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(curve) } else { dirMap.set(dir, [curve]) }
  }

  const galaxies = Array.from(dirMap.entries()).map(([dir, dirCurves]) =>
    analyzeSpiralGalaxy(dirCurves, dir),
  )

  const avgProportion = curves.length > 0
    ? Math.round(curves.reduce((s, c) => s + c.proportionBalance, 0) / curves.length) : 0
  const avgElegance = curves.length > 0
    ? Math.round(curves.reduce((s, c) => s + c.growthElegance, 0) / curves.length) : 0
  const avgHarmony = curves.length > 0
    ? Math.round(curves.reduce((s, c) => s + c.expansionHarmony, 0) / curves.length) : 0

  const overallProportion = curves.length > 0
    ? Math.round((avgProportion + avgElegance + avgHarmony) / 3) : 0
  const isGolden = avgProportion >= 60

  const universe: UniverseSummary = { avgProportion, avgElegance, avgHarmony, isGolden, overallProportion }

  const avgFibonacciQuality = curves.length > 0
    ? Math.round(curves.reduce((s, c) => s + c.fibonacciQuality, 0) / curves.length) : 0
  const avgCurveSmoothness = curves.length > 0
    ? Math.round(curves.reduce((s, c) => s + c.curveSmoothness, 0) / curves.length) : 0
  const avgGrowthElegance = avgElegance
  const avgExpansionHarmony = avgHarmony

  const bestCurve = curves.length > 0
    ? curves.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const mostProportional = curves.length > 0
    ? curves.reduce((best, c) => c.proportionBalance > best.proportionBalance ? c : best).file : ''
  const mostElegant = curves.length > 0
    ? curves.reduce((best, c) => c.growthElegance > best.growthElegance ? c : best).file : ''
  const smoothest = curves.length > 0
    ? curves.reduce((best, c) => c.curveSmoothness > best.curveSmoothness ? c : best).file : ''
  const mostHarmonious = curves.length > 0
    ? curves.reduce((best, c) => c.expansionHarmony > best.expansionHarmony ? c : best).file : ''

  const stats: GoldenSpiralStats = {
    totalFiles: curves.length,
    totalGalaxies: galaxies.length,
    avgFibonacciQuality,
    avgProportionBalance: avgProportion,
    avgGrowthElegance: avgGrowthElegance,
    avgCurveSmoothness,
    avgExpansionHarmony,
    goldenMasterpieceCount: curves.filter(c => c.condition === 'golden-masterpiece').length,
    nautilusPerfectionCount: curves.filter(c => c.condition === 'nautilus-perfection').length,
    properSpiralCount: curves.filter(c => c.condition === 'proper-spiral').length,
    wonkyCurveCount: curves.filter(c => c.condition === 'wonky-curve').length,
    brokenCoilCount: curves.filter(c => c.condition === 'broken-coil').length,
    straightLineCount: curves.filter(c => c.condition === 'straight-line').length,
    hasHighQualityCount: curves.filter(c => c.growing.hasHighQuality).length,
    hasHighProportionCount: curves.filter(c => c.balancing.hasHighProportion).length,
    hasHighEleganceCount: curves.filter(c => c.elegancing.hasHighElegance).length,
    hasHighSmoothnessCount: curves.filter(c => c.smoothing.hasHighSmoothness).length,
    hasHighHarmonyCount: curves.filter(c => c.harmonizing.hasHighHarmony).length,
    overallProportion,
    architectGrade: classifyArchitectGrade(overallProportion),
    bestCurve, mostProportional, mostElegant, smoothest, mostHarmonious,
  }

  const recommendations = generateRecommendations(curves, galaxies, universe, stats)

  return { curves, galaxies, universe, stats, recommendations }
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
