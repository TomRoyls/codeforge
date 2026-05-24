// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Dream vividness grade */
export type VividnessGrade =
  | 'vivid-dream'
  | 'colorful-vision'
  | 'proper-dream'
  | 'fading-dream'
  | 'hazy-image'
  | 'no-dream'

/** Flash brilliance grade */
export type FlashGrade =
  | 'lightning-flash'
  | 'bright-spark'
  | 'proper-flash'
  | 'dim-flicker'
  | 'barely-visible'
  | 'no-flash'

/** Body tone grade */
export type ToneGrade =
  | 'black-body'
  | 'dark-body'
  | 'proper-body'
  | 'light-body'
  | 'white-body'
  | 'no-body'

/** Hydro stability grade */
export type HydroGrade =
  | 'perfectly-stable'
  | 'well-maintained'
  | 'proper-moisture'
  | 'drying-out'
  | 'cracking'
  | 'crazed'

/** Pattern harmony grade */
export type HarmonyGrade =
  | 'symphony-pattern'
  | 'harmonious-design'
  | 'proper-arrangement'
  | 'clashing-pattern'
  | 'random-mix'
  | 'no-pattern'

/** Opal condition */
export type OpalCondition =
  | 'precious-opal'
  | 'boulder-opal'
  | 'proper-opal'
  | 'common-opal'
  | 'potch'
  | 'dust'

/** Field type */
export type FieldType =
  | 'lightning-ridge'
  | 'coober-pedy'
  | 'wello'
  | 'proper-field'
  | 'dry-bed'
  | 'no-field'

/** Field condition */
export type FieldCondition =
  | 'brilliant-field'
  | 'colorful-display'
  | 'decent-patch'
  | 'faint-glow'
  | 'barely-visible'
  | 'invisible'

/** Dreamer grade */
export type DreamerGrade =
  | 'master-dreamer'
  | 'opal-hunter'
  | 'gem-dreamer'
  | 'apprentice'
  | 'novice'
  | 'sleepwalker'

/** Dreaming measurement */
export interface DreamingMeasure {
  vividness: number
  grade: VividnessGrade
  hasHighVividness: boolean
  hasImaginative: boolean
  hasCreative: boolean
  hasNoDerivative: boolean
  hasOriginal: boolean
  hasNoStale: boolean
  hasVivid: boolean
  hasNoDull: boolean
  hasExpressive: boolean
  hasNoFormulaic: boolean
  hasRich: boolean
  derivativeCount: number
  staleCount: number
}

/** Flashing measurement */
export interface FlashingMeasure {
  brilliance: number
  flash: FlashGrade
  hasHighBrilliance: boolean
  hasImpactful: boolean
  hasStriking: boolean
  hasNoWeak: boolean
  hasDazzling: boolean
  hasNoFaint: boolean
  hasBrilliant: boolean
  hasNoDim: boolean
  hasPowerful: boolean
  hasNoSubtle: boolean
  hasVivid2: boolean
  weakCount: number
  faintCount: number
}

/** Toning measurement */
export interface ToningMeasure {
  quality: number
  tone: ToneGrade
  hasHighQuality: boolean
  hasSolid: boolean
  hasSubstantial: boolean
  hasNoWeak: boolean
  hasStrong: boolean
  hasNoThin: boolean
  hasFoundational: boolean
  hasNoFlimsy: boolean
  hasGrounded: boolean
  hasNoShallow: boolean
  hasDeep: boolean
  weakCount: number
  thinCount: number
}

/** Stabilizing measurement */
export interface StabilizingMeasure {
  stability: number
  hydro: HydroGrade
  hasHighStability: boolean
  hasStable: boolean
  hasBalanced: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasNoFluctuating: boolean
  hasReliable: boolean
  hasNoErratic: boolean
  hasSteady: boolean
  hasNoShifting: boolean
  hasEnduring: boolean
  volatileCount: number
  fluctuatingCount: number
}

/** Harmonizing measurement */
export interface HarmonizingMeasure {
  harmony: number
  pattern: HarmonyGrade
  hasHighHarmony: boolean
  hasConsistent: boolean
  hasMatching: boolean
  hasNoClashing: boolean
  hasUnified: boolean
  hasNoDiscordant: boolean
  hasCoherent: boolean
  hasNoIncoherent: boolean
  hasHarmonious: boolean
  hasNoChaotic: boolean
  hasBlended: boolean
  clashingCount: number
  discordantCount: number
}

/** Single file analysis */
export interface OpalDream {
  file: string
  dreamVividness: number
  flashBrilliance: number
  bodyTone: number
  hydroStability: number
  patternHarmony: number
  dreaming: DreamingMeasure
  flashing: FlashingMeasure
  toning: ToningMeasure
  stabilizing: StabilizingMeasure
  harmonizing: HarmonizingMeasure
  condition: OpalCondition
  qualityScore: number
}

/** Directory-level field */
export interface DreamField {
  directory: string
  dreams: OpalDream[]
  avgVividness: number
  avgBrilliance: number
  avgHarmony: number
  preciousOpalCount: number
  dustCount: number
  fieldType: FieldType
  condition: FieldCondition
}

/** Vision summary */
export interface VisionSummary {
  avgVividness: number
  avgBrilliance: number
  avgHarmony: number
  isVivid: boolean
  overallBrilliance: number
}

/** Full stats */
export interface OpalDreamStats {
  totalFiles: number
  totalFields: number
  avgDreamVividness: number
  avgFlashBrilliance: number
  avgBodyTone: number
  avgHydroStability: number
  avgPatternHarmony: number
  preciousOpalCount: number
  boulderOpalCount: number
  properOpalCount: number
  commonOpalCount: number
  potchCount: number
  dustCount: number
  hasHighVividnessCount: number
  hasHighBrillianceCount: number
  hasHighQualityCount: number
  hasHighStabilityCount: number
  hasHighHarmonyCount: number
  overallBrilliance: number
  dreamerGrade: DreamerGrade
  bestDream: string
  mostVivid: string
  mostBrilliant: string
  strongestBody: string
  mostStable: string
}

/** Full result */
export interface OpalDreamResult {
  dreams: OpalDream[]
  fields: DreamField[]
  vision: VisionSummary
  stats: OpalDreamStats
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
 * Measure dream vividness
 * @example
 * const m = measureDreaming(content)
 * console.log(m.grade) // 'vivid-dream'
 */
export function measureDreaming(content: string): DreamingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasImaginative = hasExport(content) && hasAsync(content)
  const hasCreative = hasInterface(content) && hasGenerics(content)
  const hasOriginal = hasNamedExport(content) && hasReturnType(content)
  const hasVivid = hasDocComments(content) && hasImport(content)
  const hasExpressive = hasClass(content) && hasTypeAlias(content)
  const hasRich = hasExport(content) && hasInterface(content)

  score += hasImaginative ? 5 : 0
  score += hasCreative ? 5 : 0
  score += hasOriginal ? 5 : 0
  score += hasVivid ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasRich ? 5 : 0

  const vividness = Math.min(score, 100)
  const derivativeCount = count(/\bvar\b/, content)
  const staleCount = count(/\bany\b/, content)

  const hasNoDerivative = derivativeCount === 0
  const hasNoStale = staleCount === 0
  const hasNoDull = !has(/\beval\b/, content)
  const hasNoFormulaic = !has(/\bdebugger\b/, content)
  const hasHighVividness = vividness >= 70

  let grade: VividnessGrade
  if (vividness >= 85) grade = 'vivid-dream'
  else if (vividness >= 70) grade = 'colorful-vision'
  else if (vividness >= 55) grade = 'proper-dream'
  else if (vividness >= 40) grade = 'fading-dream'
  else if (vividness >= 25) grade = 'hazy-image'
  else grade = 'no-dream'

  return {
    vividness, grade, hasHighVividness, hasImaginative, hasCreative, hasNoDerivative,
    hasOriginal, hasNoStale, hasVivid, hasNoDull, hasExpressive, hasNoFormulaic,
    hasRich, derivativeCount, staleCount,
  }
}

/**
 * Measure flash brilliance
 * @example
 * const m = measureFlashing(content)
 * console.log(m.flash) // 'lightning-flash'
 */
export function measureFlashing(content: string): FlashingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasImpactful = hasReturnType(content) && hasStrictEq(content)
  const hasStriking = hasReadonly(content) && hasPrivate(content)
  const hasDazzling = hasNamedExport(content) && hasGenerics(content)
  const hasBrilliant = hasInterface(content) && hasAsync(content)
  const hasPowerful = hasDocComments(content) && hasConst(content)
  const hasVivid2 = hasReturnType(content) && hasReadonly(content)

  score += hasImpactful ? 5 : 0
  score += hasStriking ? 5 : 0
  score += hasDazzling ? 5 : 0
  score += hasBrilliant ? 5 : 0
  score += hasPowerful ? 5 : 0
  score += hasVivid2 ? 5 : 0

  const brilliance = Math.min(score, 100)
  const weakCount = count(/\bvar\b/, content)
  const faintCount = count(/\bany\b/, content)

  const hasNoWeak = weakCount === 0
  const hasNoFaint = faintCount === 0
  const hasNoDim = !has(/\beval\b/, content)
  const hasNoSubtle = !has(/\bdebugger\b/, content)
  const hasHighBrilliance = brilliance >= 70

  let flash: FlashGrade
  if (brilliance >= 85) flash = 'lightning-flash'
  else if (brilliance >= 70) flash = 'bright-spark'
  else if (brilliance >= 55) flash = 'proper-flash'
  else if (brilliance >= 40) flash = 'dim-flicker'
  else if (brilliance >= 25) flash = 'barely-visible'
  else flash = 'no-flash'

  return {
    brilliance, flash, hasHighBrilliance, hasImpactful, hasStriking, hasNoWeak,
    hasDazzling, hasNoFaint, hasBrilliant, hasNoDim, hasPowerful, hasNoSubtle,
    hasVivid2, weakCount, faintCount,
  }
}

/**
 * Measure body tone
 * @example
 * const m = measureToning(content)
 * console.log(m.tone) // 'black-body'
 */
export function measureToning(content: string): ToningMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasSolid = hasConst(content) && hasStrictEq(content)
  const hasSubstantial = hasInterface(content) && hasTypeAlias(content)
  const hasStrong = hasExport(content) && hasImport(content)
  const hasFoundational = hasReturnType(content) && hasReadonly(content)
  const hasGrounded = hasPrivate(content) && hasStrictEq(content)
  const hasDeep = hasClass(content) && hasConst(content)

  score += hasSolid ? 5 : 0
  score += hasSubstantial ? 5 : 0
  score += hasStrong ? 5 : 0
  score += hasFoundational ? 5 : 0
  score += hasGrounded ? 5 : 0
  score += hasDeep ? 5 : 0

  const quality = Math.min(score, 100)
  const weakCount = count(/\bvar\b/, content)
  const thinCount = count(/\bany\b/, content)

  const hasNoWeak = weakCount === 0
  const hasNoThin = thinCount === 0
  const hasNoFlimsy = !has(/\beval\b/, content)
  const hasNoShallow = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let tone: ToneGrade
  if (quality >= 85) tone = 'black-body'
  else if (quality >= 70) tone = 'dark-body'
  else if (quality >= 55) tone = 'proper-body'
  else if (quality >= 40) tone = 'light-body'
  else if (quality >= 25) tone = 'white-body'
  else tone = 'no-body'

  return {
    quality, tone, hasHighQuality, hasSolid, hasSubstantial, hasNoWeak,
    hasStrong, hasNoThin, hasFoundational, hasNoFlimsy, hasGrounded, hasNoShallow,
    hasDeep, weakCount, thinCount,
  }
}

/**
 * Measure hydro stability
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.hydro) // 'perfectly-stable'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasStable = hasNamedExport(content) && hasExport(content)
  const hasBalanced = hasReturnType(content) && hasStrictEq(content)
  const hasConsistent = hasReadonly(content) && hasPrivate(content)
  const hasReliable = hasInterface(content) && hasGenerics(content)
  const hasSteady = hasDocComments(content) && hasNamedExport(content)
  const hasEnduring = hasClass(content) && hasReturnType(content)

  score += hasStable ? 5 : 0
  score += hasBalanced ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasEnduring ? 5 : 0

  const stability = Math.min(score, 100)
  const volatileCount = count(/\bvar\b/, content)
  const fluctuatingCount = count(/\bany\b/, content)

  const hasNoVolatile = volatileCount === 0
  const hasNoFluctuating = fluctuatingCount === 0
  const hasNoErratic = !has(/\beval\b/, content)
  const hasNoShifting = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let hydro: HydroGrade
  if (stability >= 85) hydro = 'perfectly-stable'
  else if (stability >= 70) hydro = 'well-maintained'
  else if (stability >= 55) hydro = 'proper-moisture'
  else if (stability >= 40) hydro = 'drying-out'
  else if (stability >= 25) hydro = 'cracking'
  else hydro = 'crazed'

  return {
    stability, hydro, hasHighStability, hasStable, hasBalanced, hasNoVolatile,
    hasConsistent, hasNoFluctuating, hasReliable, hasNoErratic, hasSteady, hasNoShifting,
    hasEnduring, volatileCount, fluctuatingCount,
  }
}

/**
 * Measure pattern harmony
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.pattern) // 'symphony-pattern'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasConsistent = hasConst(content) && hasExport(content)
  const hasMatching = hasImport(content) && hasReturnType(content)
  const hasUnified = hasInterface(content) && hasGenerics(content)
  const hasCoherent = hasTypeAlias(content) && hasDocComments(content)
  const hasHarmonious = hasReadonly(content) && hasAsync(content)
  const hasBlended = hasConst(content) && hasImport(content)

  score += hasConsistent ? 5 : 0
  score += hasMatching ? 5 : 0
  score += hasUnified ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasBlended ? 5 : 0

  const harmony = Math.min(score, 100)
  const clashingCount = count(/\bvar\b/, content)
  const discordantCount = count(/\bany\b/, content)

  const hasNoClashing = clashingCount === 0
  const hasNoDiscordant = discordantCount === 0
  const hasNoIncoherent = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighHarmony = harmony >= 70

  let pattern: HarmonyGrade
  if (harmony >= 85) pattern = 'symphony-pattern'
  else if (harmony >= 70) pattern = 'harmonious-design'
  else if (harmony >= 55) pattern = 'proper-arrangement'
  else if (harmony >= 40) pattern = 'clashing-pattern'
  else if (harmony >= 25) pattern = 'random-mix'
  else pattern = 'no-pattern'

  return {
    harmony, pattern, hasHighHarmony, hasConsistent, hasMatching, hasNoClashing,
    hasUnified, hasNoDiscordant, hasCoherent, hasNoIncoherent, hasHarmonious, hasNoChaotic,
    hasBlended, clashingCount, discordantCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify opal condition
 * @example
 * classifyOpalCondition(90) // 'precious-opal'
 */
export function classifyOpalCondition(score: number): OpalCondition {
  if (score >= 85) return 'precious-opal'
  if (score >= 70) return 'boulder-opal'
  if (score >= 55) return 'proper-opal'
  if (score >= 40) return 'common-opal'
  if (score >= 25) return 'potch'
  return 'dust'
}

/**
 * Classify field type
 * @example
 * classifyFieldType(dreams) // 'lightning-ridge'
 */
export function classifyFieldType(dreams: OpalDream[]): FieldType {
  if (dreams.length === 0) return 'no-field'
  const avgQs = Math.round(dreams.reduce((s, d) => s + d.qualityScore, 0) / dreams.length)
  const preciousRatio = dreams.filter(d => d.condition === 'precious-opal').length / dreams.length
  if (avgQs >= 75 && preciousRatio >= 0.5) return 'lightning-ridge'
  if (avgQs >= 60) return 'coober-pedy'
  if (avgQs >= 45) return 'wello'
  if (avgQs >= 30) return 'proper-field'
  if (avgQs >= 15) return 'dry-bed'
  return 'no-field'
}

/**
 * Classify field condition
 * @example
 * classifyFieldCondition(80) // 'brilliant-field'
 */
export function classifyFieldCondition(avgQs: number): FieldCondition {
  if (avgQs >= 75) return 'brilliant-field'
  if (avgQs >= 60) return 'colorful-display'
  if (avgQs >= 45) return 'decent-patch'
  if (avgQs >= 30) return 'faint-glow'
  if (avgQs >= 15) return 'barely-visible'
  return 'invisible'
}

/**
 * Classify dreamer grade
 * @example
 * classifyDreamerGrade(85) // 'master-dreamer'
 */
export function classifyDreamerGrade(avgBrilliance: number): DreamerGrade {
  if (avgBrilliance >= 80) return 'master-dreamer'
  if (avgBrilliance >= 65) return 'opal-hunter'
  if (avgBrilliance >= 50) return 'gem-dreamer'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'sleepwalker'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(dreams, fields, vision, stats)
 */
export function generateRecommendations(
  dreams: OpalDream[],
  fields: DreamField[],
  vision: VisionSummary,
  stats: OpalDreamStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDreamVividness < 50) {
    recs.push('Enhance dream vividness with imaginative async patterns, creative interface/generic combos, and original named exports')
  }
  if (stats.avgFlashBrilliance < 50) {
    recs.push('Boost flash brilliance with impactful return types, striking strict equality, and dazzling readonly/private guards')
  }
  if (stats.avgBodyTone < 50) {
    recs.push('Strengthen body tone with solid const declarations, substantial interface foundations, and grounded type aliases')
  }
  if (stats.avgHydroStability < 50) {
    recs.push('Improve hydro stability with stable named exports, balanced type coverage, and consistent readonly patterns')
  }
  if (stats.avgPatternHarmony < 50) {
    recs.push('Harmonize patterns with consistent const/export pairs, matching import/return types, and unified interface/generics')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — consider significant refactoring`)
  }
  if (vision.overallBrilliance < 40) {
    recs.push('Overall opal brilliance is dim — focus on dream vividness and flash brilliance first')
  }
  const allDry = fields.every(f => f.fieldType === 'no-field' || f.fieldType === 'dry-bed')
  if (allDry && fields.length > 0) {
    recs.push('All fields are dry or empty — consider a major quality overhaul')
  }
  const dusts = dreams.filter(d => d.condition === 'dust').map(d => d.file)
  if (dusts.length > 0 && dusts.length <= 3) {
    recs.push(`Transform these dust files into precious opals: ${dusts.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your opal dreams are master-dreamer quality! Every flash reveals brilliant color play')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as opal dream
 * @example
 * const dream = analyzeOpalDream(content, 'index.ts')
 * console.log(dream.condition) // 'precious-opal'
 */
export function analyzeOpalDream(content: string, filePath: string): OpalDream {
  const dreaming = measureDreaming(content)
  const flashing = measureFlashing(content)
  const toning = measureToning(content)
  const stabilizing = measureStabilizing(content)
  const harmonizing = measureHarmonizing(content)

  const qualityScore = Math.round(
    dreaming.vividness * 0.2 +
    flashing.brilliance * 0.2 +
    toning.quality * 0.2 +
    stabilizing.stability * 0.2 +
    harmonizing.harmony * 0.2,
  )

  return {
    file: filePath,
    dreamVividness: dreaming.vividness,
    flashBrilliance: flashing.brilliance,
    bodyTone: toning.quality,
    hydroStability: stabilizing.stability,
    patternHarmony: harmonizing.harmony,
    dreaming,
    flashing,
    toning,
    stabilizing,
    harmonizing,
    condition: classifyOpalCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a dream field
 * @example
 * const field = analyzeDreamField(dreams, 'src')
 * console.log(field.fieldType) // 'lightning-ridge'
 */
export function analyzeDreamField(dreams: OpalDream[], dirPath: string): DreamField {
  if (dreams.length === 0) {
    return {
      directory: dirPath, dreams: [], avgVividness: 0, avgBrilliance: 0, avgHarmony: 0,
      preciousOpalCount: 0, dustCount: 0, fieldType: 'no-field', condition: 'invisible',
    }
  }

  const avgVividness = Math.round(dreams.reduce((s, d) => s + d.dreamVividness, 0) / dreams.length)
  const avgBrilliance = Math.round(dreams.reduce((s, d) => s + d.flashBrilliance, 0) / dreams.length)
  const avgHarmony = Math.round(dreams.reduce((s, d) => s + d.patternHarmony, 0) / dreams.length)
  const preciousOpalCount = dreams.filter(d => d.condition === 'precious-opal').length
  const dustCount = dreams.filter(d => d.condition === 'dust').length
  const avgQs = Math.round(dreams.reduce((s, d) => s + d.qualityScore, 0) / dreams.length)

  return {
    directory: dirPath, dreams, avgVividness, avgBrilliance, avgHarmony,
    preciousOpalCount, dustCount, fieldType: classifyFieldType(dreams),
    condition: classifyFieldCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete opal dream result
 * @example
 * const result = await buildOpalDreamResult(files, contents)
 * console.log(result.stats.dreamerGrade) // 'master-dreamer'
 */
export async function buildOpalDreamResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OpalDreamResult> {
  const dreams = files.map((file, i) => analyzeOpalDream(contents[i] ?? '', file))

  const dirMap = new Map<string, OpalDream[]>()
  for (const dream of dreams) {
    const dir = path.dirname(dream.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(dream) } else { dirMap.set(dir, [dream]) }
  }

  const fields = Array.from(dirMap.entries()).map(([dir, dirDreams]) =>
    analyzeDreamField(dirDreams, dir),
  )

  const avgVividness = dreams.length > 0
    ? Math.round(dreams.reduce((s, d) => s + d.dreamVividness, 0) / dreams.length) : 0
  const avgBrilliance = dreams.length > 0
    ? Math.round(dreams.reduce((s, d) => s + d.flashBrilliance, 0) / dreams.length) : 0
  const avgHarmony = dreams.length > 0
    ? Math.round(dreams.reduce((s, d) => s + d.patternHarmony, 0) / dreams.length) : 0

  const overallBrilliance = dreams.length > 0
    ? Math.round((avgVividness + avgBrilliance + avgHarmony) / 3) : 0
  const isVivid = avgVividness >= 60

  const vision: VisionSummary = { avgVividness, avgBrilliance, avgHarmony, isVivid, overallBrilliance }

  const avgBodyTone = dreams.length > 0
    ? Math.round(dreams.reduce((s, d) => s + d.bodyTone, 0) / dreams.length) : 0
  const avgHydroStability = dreams.length > 0
    ? Math.round(dreams.reduce((s, d) => s + d.hydroStability, 0) / dreams.length) : 0

  const bestDream = dreams.length > 0
    ? dreams.reduce((best, d) => d.qualityScore > best.qualityScore ? d : best).file : ''
  const mostVivid = dreams.length > 0
    ? dreams.reduce((best, d) => d.dreamVividness > best.dreamVividness ? d : best).file : ''
  const mostBrilliant = dreams.length > 0
    ? dreams.reduce((best, d) => d.flashBrilliance > best.flashBrilliance ? d : best).file : ''
  const strongestBody = dreams.length > 0
    ? dreams.reduce((best, d) => d.bodyTone > best.bodyTone ? d : best).file : ''
  const mostStable = dreams.length > 0
    ? dreams.reduce((best, d) => d.hydroStability > best.hydroStability ? d : best).file : ''

  const stats: OpalDreamStats = {
    totalFiles: dreams.length,
    totalFields: fields.length,
    avgDreamVividness: avgVividness,
    avgFlashBrilliance: avgBrilliance,
    avgBodyTone,
    avgHydroStability,
    avgPatternHarmony: avgHarmony,
    preciousOpalCount: dreams.filter(d => d.condition === 'precious-opal').length,
    boulderOpalCount: dreams.filter(d => d.condition === 'boulder-opal').length,
    properOpalCount: dreams.filter(d => d.condition === 'proper-opal').length,
    commonOpalCount: dreams.filter(d => d.condition === 'common-opal').length,
    potchCount: dreams.filter(d => d.condition === 'potch').length,
    dustCount: dreams.filter(d => d.condition === 'dust').length,
    hasHighVividnessCount: dreams.filter(d => d.dreaming.hasHighVividness).length,
    hasHighBrillianceCount: dreams.filter(d => d.flashing.hasHighBrilliance).length,
    hasHighQualityCount: dreams.filter(d => d.toning.hasHighQuality).length,
    hasHighStabilityCount: dreams.filter(d => d.stabilizing.hasHighStability).length,
    hasHighHarmonyCount: dreams.filter(d => d.harmonizing.hasHighHarmony).length,
    overallBrilliance,
    dreamerGrade: classifyDreamerGrade(overallBrilliance),
    bestDream, mostVivid, mostBrilliant, strongestBody, mostStable,
  }

  const recommendations = generateRecommendations(dreams, fields, vision, stats)

  return { dreams, fields, vision, stats, recommendations }
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
