// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Reflection quality grade */
export type ReflectionGrade =
  | 'perfect-mirror'
  | 'clear-reflection'
  | 'proper-image'
  | 'distorted'
  | 'rippled'
  | 'opaque'

/** Surface calm grade */
export type SurfaceGrade =
  | 'glass-surface'
  | 'calm-waters'
  | 'gentle-ripple'
  | 'choppy'
  | 'rough-waters'
  | 'stormy'

/** Depth clarity grade */
export type DepthGrade =
  | 'crystal-clear'
  | 'clear-water'
  | 'proper-clarity'
  | 'murky'
  | 'cloudy'
  | 'opaque-depth'

/** Ripple resilience recovery */
export type RecoveryGrade =
  | 'instant-calm'
  | 'quick-recovery'
  | 'proper-recovery'
  | 'slow-settle'
  | 'persistent-ripple'
  | 'permanent-wave'

/** Ecosystem balance grade */
export type EcosystemGrade =
  | 'pristine-ecosystem'
  | 'healthy-balance'
  | 'proper-harmony'
  | 'stressed-system'
  | 'imbalanced'
  | 'dead-water'

/** Lake condition */
export type LakeCondition =
  | 'mountain-lake'
  | 'clear-pond'
  | 'proper-lake'
  | 'murky-pool'
  | 'stagnant-water'
  | 'dry-bed'

/** Lake type */
export type LakeType =
  | 'great-lake'
  | 'mountain-lake'
  | 'forest-pond'
  | 'garden-pool'
  | 'puddle'
  | 'no-water'

/** Watershed condition */
export type WatershedCondition =
  | 'pristine-waters'
  | 'healthy-lake'
  | 'decent-pond'
  | 'murky-pool'
  | 'stagnant'
  | 'dried-up'

/** Keeper grade */
export type KeeperGrade =
  | 'lake-guardian'
  | 'master-angler'
  | 'skilled-ranger'
  | 'fisherman'
  | 'tourist'
  | 'polluter'

/** Reflecting measurement */
export interface ReflectingMeasure {
  quality: number
  grade: ReflectionGrade
  hasHighQuality: boolean
  hasSelfAware: boolean
  hasIntrospective: boolean
  hasNoBlind: boolean
  hasReflective: boolean
  hasNoUnaware: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasRevealing: boolean
  hasNoConcealing: boolean
  hasIlluminating: boolean
  blindCount: number
  unawareCount: number
}

/** Calming measurement */
export interface CalmingMeasure {
  calm: number
  surface: SurfaceGrade
  hasHighCalm: boolean
  hasStable: boolean
  hasSteady: boolean
  hasNoTurbulent: boolean
  hasPeaceful: boolean
  hasNoChaotic: boolean
  hasSerene: boolean
  hasNoViolent: boolean
  hasTranquil: boolean
  hasNoAgitated: boolean
  hasSmooth: boolean
  turbulentCount: number
  chaoticCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  depth: DepthGrade
  hasHighClarity: boolean
  hasUnderstandable: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasTransparent: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  hasNoMurky: boolean
  hasLucid: boolean
  crypticCount: number
  opaqueCount: number
}

/** Rippling measurement */
export interface RipplingMeasure {
  resilience: number
  recovery: RecoveryGrade
  hasHighResilience: boolean
  hasRecoverable: boolean
  hasAdaptive: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoFragile: boolean
  hasElastic: boolean
  hasNoRigid: boolean
  hasBouncing: boolean
  hasNoBreaking: boolean
  hasFlexible: boolean
  brittleCount: number
  fragileCount: number
}

/** Balancing measurement */
export interface BalancingMeasure {
  balance: number
  ecosystem: EcosystemGrade
  hasHighBalance: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasNoConflicting: boolean
  hasSymbiotic: boolean
  hasNoParasitic: boolean
  hasIntegrated: boolean
  hasNoFragmented: boolean
  hasCooperative: boolean
  hasNoCompeting: boolean
  hasCohesive: boolean
  conflictingCount: number
  parasiticCount: number
}

/** Single file analysis */
export interface LakeReflection {
  file: string
  reflectionQuality: number
  surfaceCalm: number
  depthClarity: number
  rippleResilience: number
  ecosystemBalance: number
  reflecting: ReflectingMeasure
  calming: CalmingMeasure
  clarifying: ClarifyingMeasure
  rippling: RipplingMeasure
  balancing: BalancingMeasure
  condition: LakeCondition
  qualityScore: number
}

/** Directory-level lake system */
export interface LakeSystem {
  directory: string
  reflections: LakeReflection[]
  avgCalm: number
  avgClarity: number
  avgBalance: number
  mountainLakeCount: number
  dryBedCount: number
  lakeType: LakeType
  condition: WatershedCondition
}

/** Watershed summary */
export interface WatershedSummary {
  avgCalm: number
  avgClarity: number
  avgBalance: number
  isClear: boolean
  overallSerenity: number
}

/** Full stats */
export interface MirrorLakeStats {
  totalFiles: number
  totalLakes: number
  avgReflectionQuality: number
  avgSurfaceCalm: number
  avgDepthClarity: number
  avgRippleResilience: number
  avgEcosystemBalance: number
  mountainLakeCount: number
  clearPondCount: number
  properLakeCount: number
  murkyPoolCount: number
  stagnantWaterCount: number
  dryBedCount: number
  hasHighQualityCount: number
  hasHighCalmCount: number
  hasHighClarityCount: number
  hasHighResilienceCount: number
  hasHighBalanceCount: number
  overallSerenity: number
  keeperGrade: KeeperGrade
  bestReflection: string
  mostReflective: string
  calmest: string
  clearest: string
  mostResilient: string
}

/** Full result */
export interface MirrorLakeResult {
  reflections: LakeReflection[]
  lakes: LakeSystem[]
  watershed: WatershedSummary
  stats: MirrorLakeStats
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
 * Measure reflection quality
 * @example
 * const m = measureReflecting(content)
 * console.log(m.grade) // 'perfect-mirror'
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasSelfAware = hasExport(content) && hasImport(content)
  const hasIntrospective = hasInterface(content) && hasTypeAlias(content)
  const hasReflective = hasDocComments(content) && hasReturnType(content)
  const hasTransparent = hasGenerics(content) && hasNamedExport(content)
  const hasRevealing = hasExport(content) && hasAsync(content)
  const hasIlluminating = hasClass(content) && hasDocComments(content)

  score += hasSelfAware ? 5 : 0
  score += hasIntrospective ? 5 : 0
  score += hasReflective ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasIlluminating ? 5 : 0

  const quality = Math.min(score, 100)
  const blindCount = count(/\bvar\b/, content)
  const unawareCount = count(/\bany\b/, content)

  const hasNoBlind = blindCount === 0
  const hasNoUnaware = unawareCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoConcealing = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: ReflectionGrade
  if (quality >= 85) grade = 'perfect-mirror'
  else if (quality >= 70) grade = 'clear-reflection'
  else if (quality >= 55) grade = 'proper-image'
  else if (quality >= 40) grade = 'distorted'
  else if (quality >= 25) grade = 'rippled'
  else grade = 'opaque'

  return {
    quality, grade, hasHighQuality, hasSelfAware, hasIntrospective, hasNoBlind,
    hasReflective, hasNoUnaware, hasTransparent, hasNoHidden, hasRevealing,
    hasNoConcealing, hasIlluminating, blindCount, unawareCount,
  }
}

/**
 * Measure surface calm
 * @example
 * const m = measureCalming(content)
 * console.log(m.surface) // 'glass-surface'
 */
export function measureCalming(content: string): CalmingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasStable = hasConst(content) && hasReadonly(content)
  const hasSteady = hasStrictEq(content) && hasReturnType(content)
  const hasPeaceful = hasInterface(content) && hasGenerics(content)
  const hasSerene = hasClass(content) && hasPrivate(content)
  const hasTranquil = hasExport(content) && hasDocComments(content)
  const hasSmooth = hasStrictEq(content) && hasConst(content)

  score += hasStable ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasPeaceful ? 5 : 0
  score += hasSerene ? 5 : 0
  score += hasTranquil ? 5 : 0
  score += hasSmooth ? 5 : 0

  const calm = Math.min(score, 100)
  const turbulentCount = count(/\bvar\b/, content)
  const chaoticCount = count(/\bany\b/, content)

  const hasNoTurbulent = turbulentCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoViolent = !has(/\beval\b/, content)
  const hasNoAgitated = !has(/\bdebugger\b/, content)
  const hasHighCalm = calm >= 70

  let surface: SurfaceGrade
  if (calm >= 85) surface = 'glass-surface'
  else if (calm >= 70) surface = 'calm-waters'
  else if (calm >= 55) surface = 'gentle-ripple'
  else if (calm >= 40) surface = 'choppy'
  else if (calm >= 25) surface = 'rough-waters'
  else surface = 'stormy'

  return {
    calm, surface, hasHighCalm, hasStable, hasSteady, hasNoTurbulent,
    hasPeaceful, hasNoChaotic, hasSerene, hasNoViolent, hasTranquil,
    hasNoAgitated, hasSmooth, turbulentCount, chaoticCount,
  }
}

/**
 * Measure depth clarity
 * @example
 * const m = measureClarifying(content)
 * console.log(m.depth) // 'crystal-clear'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasUnderstandable = hasReturnType(content) && hasDocComments(content)
  const hasReadable = hasInterface(content) && hasNamedExport(content)
  const hasTransparent = hasExport(content) && hasConst(content)
  const hasVisible = hasGenerics(content) && hasTypeAlias(content)
  const hasClear = hasDocComments(content) && hasAsync(content)
  const hasLucid = hasClass(content) && hasReturnType(content)

  score += hasUnderstandable ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasLucid ? 5 : 0

  const clarity = Math.min(score, 100)
  const crypticCount = count(/\bvar\b/, content)
  const opaqueCount = count(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoMurky = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let depth: DepthGrade
  if (clarity >= 85) depth = 'crystal-clear'
  else if (clarity >= 70) depth = 'clear-water'
  else if (clarity >= 55) depth = 'proper-clarity'
  else if (clarity >= 40) depth = 'murky'
  else if (clarity >= 25) depth = 'cloudy'
  else depth = 'opaque-depth'

  return {
    clarity, depth, hasHighClarity, hasUnderstandable, hasReadable, hasNoCryptic,
    hasTransparent, hasNoOpaque, hasVisible, hasNoHidden, hasClear,
    hasNoMurky, hasLucid, crypticCount, opaqueCount,
  }
}

/**
 * Measure ripple resilience
 * @example
 * const m = measureRippling(content)
 * console.log(m.recovery) // 'instant-calm'
 */
export function measureRippling(content: string): RipplingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasRecoverable = hasStrictEq(content) && hasConst(content)
  const hasAdaptive = hasReadonly(content) && hasPrivate(content)
  const hasResilient = hasReturnType(content) && hasExport(content)
  const hasElastic = hasInterface(content) && hasGenerics(content)
  const hasBouncing = hasDocComments(content) && hasStrictEq(content)
  const hasFlexible = hasClass(content) && hasConst(content)

  score += hasRecoverable ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasElastic ? 5 : 0
  score += hasBouncing ? 5 : 0
  score += hasFlexible ? 5 : 0

  const resilience = Math.min(score, 100)
  const brittleCount = count(/\bvar\b/, content)
  const fragileCount = count(/\bany\b/, content)

  const hasNoBrittle = brittleCount === 0
  const hasNoFragile = fragileCount === 0
  const hasNoRigid = !has(/\beval\b/, content)
  const hasNoBreaking = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let recovery: RecoveryGrade
  if (resilience >= 85) recovery = 'instant-calm'
  else if (resilience >= 70) recovery = 'quick-recovery'
  else if (resilience >= 55) recovery = 'proper-recovery'
  else if (resilience >= 40) recovery = 'slow-settle'
  else if (resilience >= 25) recovery = 'persistent-ripple'
  else recovery = 'permanent-wave'

  return {
    resilience, recovery, hasHighResilience, hasRecoverable, hasAdaptive, hasNoBrittle,
    hasResilient, hasNoFragile, hasElastic, hasNoRigid, hasBouncing,
    hasNoBreaking, hasFlexible, brittleCount, fragileCount,
  }
}

/**
 * Measure ecosystem balance
 * @example
 * const m = measureBalancing(content)
 * console.log(m.ecosystem) // 'pristine-ecosystem'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasHarmonious = hasExport(content) && hasImport(content)
  const hasBalanced = hasInterface(content) && hasClass(content)
  const hasSymbiotic = hasNamedExport(content) && hasConst(content)
  const hasIntegrated = hasGenerics(content) && hasTypeAlias(content)
  const hasCooperative = hasExport(content) && hasDocComments(content)
  const hasCohesive = hasAsync(content) && hasImport(content)

  score += hasHarmonious ? 5 : 0
  score += hasBalanced ? 5 : 0
  score += hasSymbiotic ? 5 : 0
  score += hasIntegrated ? 5 : 0
  score += hasCooperative ? 5 : 0
  score += hasCohesive ? 5 : 0

  const balance = Math.min(score, 100)
  const conflictingCount = count(/\bvar\b/, content)
  const parasiticCount = count(/\bany\b/, content)

  const hasNoConflicting = conflictingCount === 0
  const hasNoParasitic = parasiticCount === 0
  const hasNoFragmented = !has(/\beval\b/, content)
  const hasNoCompeting = !has(/\bdebugger\b/, content)
  const hasHighBalance = balance >= 70

  let ecosystem: EcosystemGrade
  if (balance >= 85) ecosystem = 'pristine-ecosystem'
  else if (balance >= 70) ecosystem = 'healthy-balance'
  else if (balance >= 55) ecosystem = 'proper-harmony'
  else if (balance >= 40) ecosystem = 'stressed-system'
  else if (balance >= 25) ecosystem = 'imbalanced'
  else ecosystem = 'dead-water'

  return {
    balance, ecosystem, hasHighBalance, hasHarmonious, hasBalanced, hasNoConflicting,
    hasSymbiotic, hasNoParasitic, hasIntegrated, hasNoFragmented, hasCooperative,
    hasNoCompeting, hasCohesive, conflictingCount, parasiticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify lake condition
 * @example
 * classifyLakeCondition(90) // 'mountain-lake'
 */
export function classifyLakeCondition(score: number): LakeCondition {
  if (score >= 85) return 'mountain-lake'
  if (score >= 70) return 'clear-pond'
  if (score >= 55) return 'proper-lake'
  if (score >= 40) return 'murky-pool'
  if (score >= 25) return 'stagnant-water'
  return 'dry-bed'
}

/**
 * Classify lake type
 * @example
 * classifyLakeType(reflections) // 'great-lake'
 */
export function classifyLakeType(reflections: LakeReflection[]): LakeType {
  if (reflections.length === 0) return 'no-water'
  const avgQs = Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length)
  const mountainRatio = reflections.filter(r => r.condition === 'mountain-lake').length / reflections.length
  if (avgQs >= 75 && mountainRatio >= 0.5) return 'great-lake'
  if (avgQs >= 60) return 'mountain-lake'
  if (avgQs >= 45) return 'forest-pond'
  if (avgQs >= 30) return 'garden-pool'
  if (avgQs >= 15) return 'puddle'
  return 'no-water'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'lake-guardian'
 */
export function classifyKeeperGrade(avgSerenity: number): KeeperGrade {
  if (avgSerenity >= 80) return 'lake-guardian'
  if (avgSerenity >= 65) return 'master-angler'
  if (avgSerenity >= 50) return 'skilled-ranger'
  if (avgSerenity >= 35) return 'fisherman'
  if (avgSerenity >= 20) return 'tourist'
  return 'polluter'
}

/**
 * Classify watershed condition
 * @example
 * classifyWatershedCondition(80) // 'pristine-waters'
 */
export function classifyWatershedCondition(avgQs: number): WatershedCondition {
  if (avgQs >= 75) return 'pristine-waters'
  if (avgQs >= 60) return 'healthy-lake'
  if (avgQs >= 45) return 'decent-pond'
  if (avgQs >= 30) return 'murky-pool'
  if (avgQs >= 15) return 'stagnant'
  return 'dried-up'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(reflections, lakes, watershed, stats)
 */
export function generateRecommendations(
  reflections: LakeReflection[],
  lakes: LakeSystem[],
  watershed: WatershedSummary,
  stats: MirrorLakeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgReflectionQuality < 50) {
    recs.push('Improve reflection quality with self-aware exports, introspective interfaces, and revealing documentation')
  }
  if (stats.avgSurfaceCalm < 50) {
    recs.push('Calm surface waters with stable const usage, steady strict equality, and peaceful type patterns')
  }
  if (stats.avgDepthClarity < 50) {
    recs.push('Clarify depths with understandable return types, readable exports, and transparent naming')
  }
  if (stats.avgRippleResilience < 50) {
    recs.push('Build ripple resilience with recoverable patterns, adaptive readonly fields, and resilient type guards')
  }
  if (stats.avgEcosystemBalance < 50) {
    recs.push('Balance the ecosystem with harmonious imports/exports, balanced interfaces, and symbiotic type coverage')
  }
  if (stats.dryBedCount > 0) {
    recs.push(`${stats.dryBedCount} file(s) are dry beds — consider significant refactoring`)
  }
  if (watershed.overallSerenity < 40) {
    recs.push('Overall lake serenity is poor — focus on surface calm and depth clarity first')
  }
  const allDry = lakes.every(l => l.lakeType === 'no-water' || l.lakeType === 'puddle')
  if (allDry && lakes.length > 0) {
    recs.push('All lakes are barren or minimal — consider a major quality overhaul')
  }
  const dry = reflections.filter(r => r.condition === 'dry-bed').map(r => r.file)
  if (dry.length > 0 && dry.length <= 3) {
    recs.push(`Restore these dry-bed files: ${dry.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your mirror lake reflects perfection! Crystal waters reveal code excellence')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a lake reflection
 * @example
 * const reflection = analyzeLakeReflection(content, 'index.ts')
 * console.log(reflection.condition) // 'mountain-lake'
 */
export function analyzeLakeReflection(content: string, filePath: string): LakeReflection {
  const reflecting = measureReflecting(content)
  const calming = measureCalming(content)
  const clarifying = measureClarifying(content)
  const rippling = measureRippling(content)
  const balancing = measureBalancing(content)

  const qualityScore = Math.round(
    reflecting.quality * 0.2 +
    calming.calm * 0.2 +
    clarifying.clarity * 0.2 +
    rippling.resilience * 0.2 +
    balancing.balance * 0.2,
  )

  return {
    file: filePath,
    reflectionQuality: reflecting.quality,
    surfaceCalm: calming.calm,
    depthClarity: clarifying.clarity,
    rippleResilience: rippling.resilience,
    ecosystemBalance: balancing.balance,
    reflecting,
    calming,
    clarifying,
    rippling,
    balancing,
    condition: classifyLakeCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a lake system
 * @example
 * const lake = analyzeLakeSystem(reflections, 'src')
 * console.log(lake.lakeType) // 'great-lake'
 */
export function analyzeLakeSystem(reflections: LakeReflection[], dirPath: string): LakeSystem {
  if (reflections.length === 0) {
    return {
      directory: dirPath, reflections: [], avgCalm: 0, avgClarity: 0, avgBalance: 0,
      mountainLakeCount: 0, dryBedCount: 0, lakeType: 'no-water', condition: 'dried-up',
    }
  }

  const avgCalm = Math.round(reflections.reduce((s, r) => s + r.surfaceCalm, 0) / reflections.length)
  const avgClarity = Math.round(reflections.reduce((s, r) => s + r.depthClarity, 0) / reflections.length)
  const avgBalance = Math.round(reflections.reduce((s, r) => s + r.ecosystemBalance, 0) / reflections.length)
  const mountainLakeCount = reflections.filter(r => r.condition === 'mountain-lake').length
  const dryBedCount = reflections.filter(r => r.condition === 'dry-bed').length
  const avgQs = Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length)

  return {
    directory: dirPath, reflections, avgCalm, avgClarity, avgBalance,
    mountainLakeCount, dryBedCount, lakeType: classifyLakeType(reflections),
    condition: classifyWatershedCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete mirror lake result
 * @example
 * const result = await buildMirrorLakeResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'lake-guardian'
 */
export async function buildMirrorLakeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MirrorLakeResult> {
  const reflections = files.map((file, i) => analyzeLakeReflection(contents[i] ?? '', file))

  const dirMap = new Map<string, LakeReflection[]>()
  for (const reflection of reflections) {
    const dir = path.dirname(reflection.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(reflection) } else { dirMap.set(dir, [reflection]) }
  }

  const lakes = Array.from(dirMap.entries()).map(([dir, dirReflections]) =>
    analyzeLakeSystem(dirReflections, dir),
  )

  const avgCalm = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.surfaceCalm, 0) / reflections.length) : 0
  const avgClarity = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.depthClarity, 0) / reflections.length) : 0
  const avgBalance = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.ecosystemBalance, 0) / reflections.length) : 0

  const overallSerenity = reflections.length > 0
    ? Math.round((avgCalm + avgClarity + avgBalance) / 3) : 0
  const isClear = avgClarity >= 60

  const watershed: WatershedSummary = { avgCalm, avgClarity, avgBalance, isClear, overallSerenity }

  const avgReflectionQuality = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.reflectionQuality, 0) / reflections.length) : 0
  const avgRippleResilience = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.rippleResilience, 0) / reflections.length) : 0

  const bestReflection = reflections.length > 0
    ? reflections.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const mostReflective = reflections.length > 0
    ? reflections.reduce((best, r) => r.reflectionQuality > best.reflectionQuality ? r : best).file : ''
  const calmest = reflections.length > 0
    ? reflections.reduce((best, r) => r.surfaceCalm > best.surfaceCalm ? r : best).file : ''
  const clearest = reflections.length > 0
    ? reflections.reduce((best, r) => r.depthClarity > best.depthClarity ? r : best).file : ''
  const mostResilient = reflections.length > 0
    ? reflections.reduce((best, r) => r.rippleResilience > best.rippleResilience ? r : best).file : ''

  const stats: MirrorLakeStats = {
    totalFiles: reflections.length,
    totalLakes: lakes.length,
    avgReflectionQuality,
    avgSurfaceCalm: avgCalm,
    avgDepthClarity: avgClarity,
    avgRippleResilience,
    avgEcosystemBalance: avgBalance,
    mountainLakeCount: reflections.filter(r => r.condition === 'mountain-lake').length,
    clearPondCount: reflections.filter(r => r.condition === 'clear-pond').length,
    properLakeCount: reflections.filter(r => r.condition === 'proper-lake').length,
    murkyPoolCount: reflections.filter(r => r.condition === 'murky-pool').length,
    stagnantWaterCount: reflections.filter(r => r.condition === 'stagnant-water').length,
    dryBedCount: reflections.filter(r => r.condition === 'dry-bed').length,
    hasHighQualityCount: reflections.filter(r => r.reflecting.hasHighQuality).length,
    hasHighCalmCount: reflections.filter(r => r.calming.hasHighCalm).length,
    hasHighClarityCount: reflections.filter(r => r.clarifying.hasHighClarity).length,
    hasHighResilienceCount: reflections.filter(r => r.rippling.hasHighResilience).length,
    hasHighBalanceCount: reflections.filter(r => r.balancing.hasHighBalance).length,
    overallSerenity,
    keeperGrade: classifyKeeperGrade(overallSerenity),
    bestReflection, mostReflective, calmest, clearest, mostResilient,
  }

  const recommendations = generateRecommendations(reflections, lakes, watershed, stats)

  return { reflections, lakes, watershed, stats, recommendations }
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
