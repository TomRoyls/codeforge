// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Silhouette clarity grade */
export type SilhouetteGrade =
  | 'sharp-silhouette'
  | 'clear-outline'
  | 'proper-shape'
  | 'blurred-edge'
  | 'formless'
  | 'invisible'

/** Projection quality */
export type ProjectionQuality =
  | 'vivid-projection'
  | 'strong-presence'
  | 'proper-shadow'
  | 'faint-shadow'
  | 'barely-visible'
  | 'no-shadow'

/** Limb articulation */
export type ArticulationLevel =
  | 'fully-articulated'
  | 'flexible-limbs'
  | 'proper-joints'
  | 'stiff-joints'
  | 'rigid-body'
  | 'frozen'

/** Screen presence stage */
export type StagePresence =
  | 'center-stage'
  | 'spotlight'
  | 'proper-stage'
  | 'background'
  | 'offstage'
  | 'backstage'

/** Narrative flow story */
export type StoryFlow =
  | 'epic-tale'
  | 'compelling-story'
  | 'proper-narrative'
  | 'rambling'
  | 'incoherent'
  | 'silent'

/** Puppet condition */
export type PuppetCondition =
  | 'master-puppet'
  | 'skilled-puppet'
  | 'proper-puppet'
  | 'rag-doll'
  | 'paper-cutout'
  | 'no-puppet'

/** Theater type */
export type TheaterType =
  | 'grand-opera'
  | 'shadow-theater'
  | 'street-show'
  | 'bedroom-show'
  | 'empty-stage'
  | 'no-theater'

/** Theater condition */
export type TheaterCondition =
  | 'sold-out-show'
  | 'standing-ovation'
  | 'applause'
  | 'polite-clapping'
  | 'empty-seats'
  | 'theater-closed'

/** Puppeteer grade */
export type PuppeteerGrade =
  | 'master-puppeteer'
  | 'skilled-performer'
  | 'proper-showman'
  | 'amateur'
  | 'novice'
  | 'audience-member'

/** Defining measurement */
export interface DefiningMeasure {
  clarity: number
  grade: SilhouetteGrade
  hasHighClarity: boolean
  hasDefined: boolean
  hasDistinct: boolean
  hasNoBlurry: boolean
  hasSharp: boolean
  hasNoFuzzy: boolean
  hasClear: boolean
  hasNoVague: boolean
  hasCrisp: boolean
  hasNoIndistinct: boolean
  hasPrecise: boolean
  blurryCount: number
  fuzzyCount: number
}

/** Projecting measurement */
export interface ProjectingMeasure {
  quality: number
  projection: ProjectionQuality
  hasHighQuality: boolean
  hasVisible: boolean
  hasImpactful: boolean
  hasNoWeak: boolean
  hasBold: boolean
  hasNoTimid: boolean
  hasStriking: boolean
  hasNoSubtle: boolean
  hasCommanding: boolean
  hasNoFading: boolean
  hasVivid: boolean
  weakCount: number
  timidCount: number
}

/** Articulating measurement */
export interface ArticulatingMeasure {
  flexibility: number
  articulation: ArticulationLevel
  hasHighFlexibility: boolean
  hasModular: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasComposable: boolean
  hasNoMonolithic: boolean
  hasDecoupled: boolean
  hasNoTight: boolean
  hasAdaptable: boolean
  hasNoFixed: boolean
  hasExpressive: boolean
  rigidCount: number
  monolithicCount: number
}

/** Presenting measurement */
export interface PresentingMeasure {
  presence: number
  stage: StagePresence
  hasHighPresence: boolean
  hasCommanding: boolean
  hasEngaging: boolean
  hasNoForgettable: boolean
  hasMemorable: boolean
  hasNoAnonymous: boolean
  hasCaptivating: boolean
  hasNoBoring: boolean
  hasStriking: boolean
  hasNoDull: boolean
  hasImpressive: boolean
  forgettableCount: number
  anonymousCount: number
}

/** Narrating measurement */
export interface NarratingMeasure {
  flow: number
  story: StoryFlow
  hasHighFlow: boolean
  hasCoherent: boolean
  hasFlowing: boolean
  hasNoChaotic: boolean
  hasLogical: boolean
  hasNoConfusing: boolean
  hasSequential: boolean
  hasNoScattered: boolean
  hasProgressive: boolean
  hasNoDisjointed: boolean
  hasEngaging2: boolean
  chaoticCount: number
  confusingCount: number
}

/** Single file analysis */
export interface PuppetShadow {
  file: string
  silhouetteClarity: number
  projectionQuality: number
  limbArticulation: number
  screenPresence: number
  narrativeFlow: number
  defining: DefiningMeasure
  projecting: ProjectingMeasure
  articulating: ArticulatingMeasure
  presenting: PresentingMeasure
  narrating: NarratingMeasure
  condition: PuppetCondition
  qualityScore: number
}

/** Directory-level theater */
export interface PuppetTheater {
  directory: string
  shadows: PuppetShadow[]
  avgClarity: number
  avgPresence: number
  avgFlow: number
  masterPuppetCount: number
  noPuppetCount: number
  theaterType: TheaterType
  condition: TheaterCondition
}

/** Performance summary */
export interface ShadowPerformance {
  avgClarity: number
  avgPresence: number
  avgFlow: number
  isPerforming: boolean
  overallArtistry: number
}

/** Full stats */
export interface ShadowPuppetStats {
  totalFiles: number
  totalTheaters: number
  avgSilhouetteClarity: number
  avgProjectionQuality: number
  avgLimbArticulation: number
  avgScreenPresence: number
  avgNarrativeFlow: number
  masterPuppetCount: number
  skilledPuppetCount: number
  properPuppetCount: number
  ragDollCount: number
  paperCutoutCount: number
  noPuppetCount: number
  hasHighClarityCount: number
  hasHighQualityCount: number
  hasHighFlexibilityCount: number
  hasHighPresenceCount: number
  hasHighFlowCount: number
  overallArtistry: number
  puppeteerGrade: PuppeteerGrade
  bestShadow: string
  clearest: string
  bestProjected: string
  mostArticulate: string
  bestPresence: string
}

/** Full result */
export interface ShadowPuppetResult {
  shadows: PuppetShadow[]
  theaters: PuppetTheater[]
  performance: ShadowPerformance
  stats: ShadowPuppetStats
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
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure silhouette clarity
 * @example
 * const m = measureDefining(content)
 * console.log(m.grade) // 'sharp-silhouette'
 */
export function measureDefining(content: string): DefiningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasImport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0

  const hasDefined = hasExport(content) && hasImport(content)
  const hasDistinct = hasReturnType(content) && hasConst(content)
  const hasSharp = hasGenerics(content) && hasAsync(content)
  const hasClear = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasCrisp = hasNamedExport(content) && hasReturnType(content)
  const hasPrecise = hasExport(content) && hasConst(content)

  score += hasDefined ? 5 : 0
  score += hasDistinct ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasCrisp ? 5 : 0
  score += hasPrecise ? 5 : 0

  const clarity = Math.min(score, 100)
  const blurryCount = count(/\bvar\b/, content)
  const fuzzyCount = count(/\bany\b/, content)

  const hasNoBlurry = blurryCount === 0
  const hasNoFuzzy = fuzzyCount === 0
  const hasNoVague = !has(/\beval\b/, content)
  const hasNoIndistinct = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: SilhouetteGrade
  if (clarity >= 85) grade = 'sharp-silhouette'
  else if (clarity >= 70) grade = 'clear-outline'
  else if (clarity >= 55) grade = 'proper-shape'
  else if (clarity >= 40) grade = 'blurred-edge'
  else if (clarity >= 25) grade = 'formless'
  else grade = 'invisible'

  return {
    clarity, grade, hasHighClarity, hasDefined, hasDistinct, hasNoBlurry,
    hasSharp, hasNoFuzzy, hasClear, hasNoVague, hasCrisp, hasNoIndistinct,
    hasPrecise, blurryCount, fuzzyCount,
  }
}

/**
 * Measure projection quality
 * @example
 * const m = measureProjecting(content)
 * console.log(m.projection) // 'vivid-projection'
 */
export function measureProjecting(content: string): ProjectingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasVisible = hasExport(content) && hasImport(content)
  const hasImpactful = hasInterface(content) && hasClass(content)
  const hasBold = hasGenerics(content) && hasTypeAlias(content)
  const hasStriking = hasAsync(content) && hasNamedExport(content)
  const hasCommanding = hasReturnType(content) && hasConst(content)
  const hasVivid = hasExport(content) && hasInterface(content)

  score += hasVisible ? 5 : 0
  score += hasImpactful ? 5 : 0
  score += hasBold ? 5 : 0
  score += hasStriking ? 5 : 0
  score += hasCommanding ? 5 : 0
  score += hasVivid ? 5 : 0

  const quality = Math.min(score, 100)
  const weakCount = count(/\bvar\b/, content)
  const timidCount = count(/\bany\b/, content)

  const hasNoWeak = weakCount === 0
  const hasNoTimid = timidCount === 0
  const hasNoSubtle = !has(/\beval\b/, content)
  const hasNoFading = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let projection: ProjectionQuality
  if (quality >= 85) projection = 'vivid-projection'
  else if (quality >= 70) projection = 'strong-presence'
  else if (quality >= 55) projection = 'proper-shadow'
  else if (quality >= 40) projection = 'faint-shadow'
  else if (quality >= 25) projection = 'barely-visible'
  else projection = 'no-shadow'

  return {
    quality, projection, hasHighQuality, hasVisible, hasImpactful, hasNoWeak,
    hasBold, hasNoTimid, hasStriking, hasNoSubtle, hasCommanding, hasNoFading,
    hasVivid, weakCount, timidCount,
  }
}

/**
 * Measure limb articulation
 * @example
 * const m = measureArticulating(content)
 * console.log(m.articulation) // 'fully-articulated'
 */
export function measureArticulating(content: string): ArticulatingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasModular = hasTryCatch(content) && hasAsync(content)
  const hasFlexible = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasComposable = hasStrictEq(content) && hasConst(content)
  const hasDecoupled = hasInterface(content) && hasReadonly(content)
  const hasAdaptable = hasExport(content) && hasConst(content)
  const hasExpressive = hasReturnType(content) && hasTryCatch(content)

  score += hasModular ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasComposable ? 5 : 0
  score += hasDecoupled ? 5 : 0
  score += hasAdaptable ? 5 : 0
  score += hasExpressive ? 5 : 0

  const flexibility = Math.min(score, 100)
  const rigidCount = count(/\bvar\b/, content)
  const monolithicCount = count(/\bany\b/, content)

  const hasNoRigid = rigidCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoTight = !has(/\beval\b/, content)
  const hasNoFixed = !has(/\bdebugger\b/, content)
  const hasHighFlexibility = flexibility >= 70

  let articulation: ArticulationLevel
  if (flexibility >= 85) articulation = 'fully-articulated'
  else if (flexibility >= 70) articulation = 'flexible-limbs'
  else if (flexibility >= 55) articulation = 'proper-joints'
  else if (flexibility >= 40) articulation = 'stiff-joints'
  else if (flexibility >= 25) articulation = 'rigid-body'
  else articulation = 'frozen'

  return {
    flexibility, articulation, hasHighFlexibility, hasModular, hasFlexible, hasNoRigid,
    hasComposable, hasNoMonolithic, hasDecoupled, hasNoTight, hasAdaptable, hasNoFixed,
    hasExpressive, rigidCount, monolithicCount,
  }
}

/**
 * Measure screen presence
 * @example
 * const m = measurePresenting(content)
 * console.log(m.stage) // 'center-stage'
 */
export function measurePresenting(content: string): PresentingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasCommanding = hasDocComments(content) && hasExport(content)
  const hasEngaging = hasInterface(content) && hasClass(content)
  const hasMemorable = hasGenerics(content) && hasTypeAlias(content)
  const hasCaptivating = hasNamedExport(content) && hasReturnType(content)
  const hasStriking = hasAsync(content) && hasDocComments(content)
  const hasImpressive = hasExport(content) && hasGenerics(content)

  score += hasCommanding ? 5 : 0
  score += hasEngaging ? 5 : 0
  score += hasMemorable ? 5 : 0
  score += hasCaptivating ? 5 : 0
  score += hasStriking ? 5 : 0
  score += hasImpressive ? 5 : 0

  const presence = Math.min(score, 100)
  const forgettableCount = count(/\bvar\b/, content)
  const anonymousCount = count(/\bany\b/, content)

  const hasNoForgettable = forgettableCount === 0
  const hasNoAnonymous = anonymousCount === 0
  const hasNoBoring = !has(/\beval\b/, content)
  const hasNoDull = !has(/\bdebugger\b/, content)
  const hasHighPresence = presence >= 70

  let stage: StagePresence
  if (presence >= 85) stage = 'center-stage'
  else if (presence >= 70) stage = 'spotlight'
  else if (presence >= 55) stage = 'proper-stage'
  else if (presence >= 40) stage = 'background'
  else if (presence >= 25) stage = 'offstage'
  else stage = 'backstage'

  return {
    presence, stage, hasHighPresence, hasCommanding, hasEngaging, hasNoForgettable,
    hasMemorable, hasNoAnonymous, hasCaptivating, hasNoBoring, hasStriking, hasNoDull,
    hasImpressive, forgettableCount, anonymousCount,
  }
}

/**
 * Measure narrative flow
 * @example
 * const m = measureNarrating(content)
 * console.log(m.story) // 'epic-tale'
 */
export function measureNarrating(content: string): NarratingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasCoherent = hasConst(content) && hasStrictEq(content)
  const hasFlowing = hasExport(content) && hasDocComments(content)
  const hasLogical = hasReadonly(content) && hasPrivate(content)
  const hasSequential = hasInterface(content) && hasTypeAlias(content)
  const hasProgressive = hasReturnType(content) && hasGenerics(content)
  const hasEngaging2 = hasConst(content) && hasExport(content)

  score += hasCoherent ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasLogical ? 5 : 0
  score += hasSequential ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasEngaging2 ? 5 : 0

  const flow = Math.min(score, 100)
  const chaoticCount = count(/\bvar\b/, content)
  const confusingCount = count(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoConfusing = confusingCount === 0
  const hasNoScattered = !has(/\beval\b/, content)
  const hasNoDisjointed = !has(/\bdebugger\b/, content)
  const hasHighFlow = flow >= 70

  let story: StoryFlow
  if (flow >= 85) story = 'epic-tale'
  else if (flow >= 70) story = 'compelling-story'
  else if (flow >= 55) story = 'proper-narrative'
  else if (flow >= 40) story = 'rambling'
  else if (flow >= 25) story = 'incoherent'
  else story = 'silent'

  return {
    flow, story, hasHighFlow, hasCoherent, hasFlowing, hasNoChaotic,
    hasLogical, hasNoConfusing, hasSequential, hasNoScattered, hasProgressive,
    hasNoDisjointed, hasEngaging2, chaoticCount, confusingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify puppet condition
 * @example
 * classifyPuppetCondition(90) // 'master-puppet'
 */
export function classifyPuppetCondition(score: number): PuppetCondition {
  if (score >= 85) return 'master-puppet'
  if (score >= 70) return 'skilled-puppet'
  if (score >= 55) return 'proper-puppet'
  if (score >= 40) return 'rag-doll'
  if (score >= 25) return 'paper-cutout'
  return 'no-puppet'
}

/**
 * Classify theater type
 * @example
 * classifyTheaterType(shadows) // 'grand-opera'
 */
export function classifyTheaterType(shadows: PuppetShadow[]): TheaterType {
  if (shadows.length === 0) return 'no-theater'
  const avgQs = Math.round(shadows.reduce((s, sh) => s + sh.qualityScore, 0) / shadows.length)
  const masterRatio = shadows.filter(sh => sh.condition === 'master-puppet').length / shadows.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'grand-opera'
  if (avgQs >= 60) return 'shadow-theater'
  if (avgQs >= 45) return 'street-show'
  if (avgQs >= 30) return 'bedroom-show'
  if (avgQs >= 15) return 'empty-stage'
  return 'no-theater'
}

/**
 * Classify puppeteer grade
 * @example
 * classifyPuppeteerGrade(85) // 'master-puppeteer'
 */
export function classifyPuppeteerGrade(avgArtistry: number): PuppeteerGrade {
  if (avgArtistry >= 80) return 'master-puppeteer'
  if (avgArtistry >= 65) return 'skilled-performer'
  if (avgArtistry >= 50) return 'proper-showman'
  if (avgArtistry >= 35) return 'amateur'
  if (avgArtistry >= 20) return 'novice'
  return 'audience-member'
}

/**
 * Classify theater condition
 * @example
 * classifyTheaterCondition(80) // 'sold-out-show'
 */
export function classifyTheaterCondition(avgQs: number): TheaterCondition {
  if (avgQs >= 75) return 'sold-out-show'
  if (avgQs >= 60) return 'standing-ovation'
  if (avgQs >= 45) return 'applause'
  if (avgQs >= 30) return 'polite-clapping'
  if (avgQs >= 15) return 'empty-seats'
  return 'theater-closed'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(shadows, theaters, performance, stats)
 */
export function generateRecommendations(
  shadows: PuppetShadow[],
  theaters: PuppetTheater[],
  performance: ShadowPerformance,
  stats: ShadowPuppetStats,
): string[] {
  const recs: string[] = []
  if (stats.avgSilhouetteClarity < 50) {
    recs.push('Sharpen silhouette clarity with clean exports, efficient imports, and well-defined outlines')
  }
  if (stats.avgProjectionQuality < 50) {
    recs.push('Strengthen projection quality with better module alignment, impactful interfaces, and visible exports')
  }
  if (stats.avgLimbArticulation < 50) {
    recs.push('Improve limb articulation with robust error handling, flexible chaining, and modular patterns')
  }
  if (stats.avgScreenPresence < 50) {
    recs.push('Boost screen presence with clear documentation, engaging interfaces, and captivating exports')
  }
  if (stats.avgNarrativeFlow < 50) {
    recs.push('Enhance narrative flow with balanced const usage, logical sequencing, and progressive typing')
  }
  if (stats.noPuppetCount > 0) {
    recs.push(`${stats.noPuppetCount} file(s) have no puppet form — consider significant refactoring`)
  }
  if (performance.overallArtistry < 40) {
    recs.push('Overall artistry is low — focus on silhouette clarity and projection quality')
  }
  const allNone = theaters.every(t => t.theaterType === 'no-theater' || t.theaterType === 'empty-stage')
  if (allNone && theaters.length > 0) {
    recs.push('All puppet theaters are dark — consider a major restoration effort')
  }
  const noPuppet = shadows.filter(sh => sh.condition === 'no-puppet').map(sh => sh.file)
  if (noPuppet.length > 0 && noPuppet.length <= 3) {
    recs.push(`Craft these formless shadows: ${noPuppet.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your shadow puppet show is a masterpiece! Every silhouette tells a compelling story')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a shadow puppet
 * @example
 * const shadow = analyzePuppetShadow(content, 'index.ts')
 * console.log(shadow.condition) // 'master-puppet'
 */
export function analyzePuppetShadow(content: string, filePath: string): PuppetShadow {
  const defining = measureDefining(content)
  const projecting = measureProjecting(content)
  const articulating = measureArticulating(content)
  const presenting = measurePresenting(content)
  const narrating = measureNarrating(content)

  const qualityScore = Math.round(
    defining.clarity * 0.2 +
    projecting.quality * 0.2 +
    articulating.flexibility * 0.2 +
    presenting.presence * 0.2 +
    narrating.flow * 0.2,
  )

  return {
    file: filePath,
    silhouetteClarity: defining.clarity,
    projectionQuality: projecting.quality,
    limbArticulation: articulating.flexibility,
    screenPresence: presenting.presence,
    narrativeFlow: narrating.flow,
    defining,
    projecting,
    articulating,
    presenting,
    narrating,
    condition: classifyPuppetCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a puppet theater
 * @example
 * const theater = analyzePuppetTheater(shadows, 'src')
 * console.log(theater.theaterType) // 'grand-opera'
 */
export function analyzePuppetTheater(shadows: PuppetShadow[], dirPath: string): PuppetTheater {
  if (shadows.length === 0) {
    return {
      directory: dirPath, shadows: [], avgClarity: 0, avgPresence: 0, avgFlow: 0,
      masterPuppetCount: 0, noPuppetCount: 0, theaterType: 'no-theater', condition: 'theater-closed',
    }
  }

  const avgClarity = Math.round(shadows.reduce((s, sh) => s + sh.silhouetteClarity, 0) / shadows.length)
  const avgPresence = Math.round(shadows.reduce((s, sh) => s + sh.screenPresence, 0) / shadows.length)
  const avgFlow = Math.round(shadows.reduce((s, sh) => s + sh.narrativeFlow, 0) / shadows.length)
  const masterPuppetCount = shadows.filter(sh => sh.condition === 'master-puppet').length
  const noPuppetCount = shadows.filter(sh => sh.condition === 'no-puppet').length
  const avgQs = Math.round(shadows.reduce((s, sh) => s + sh.qualityScore, 0) / shadows.length)

  return {
    directory: dirPath, shadows, avgClarity, avgPresence, avgFlow,
    masterPuppetCount, noPuppetCount, theaterType: classifyTheaterType(shadows),
    condition: classifyTheaterCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete shadow puppet result
 * @example
 * const result = await buildShadowPuppetResult(files, contents)
 * console.log(result.stats.puppeteerGrade) // 'master-puppeteer'
 */
export async function buildShadowPuppetResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ShadowPuppetResult> {
  const shadows = files.map((file, i) => analyzePuppetShadow(contents[i] ?? '', file))

  const dirMap = new Map<string, PuppetShadow[]>()
  for (const shadow of shadows) {
    const dir = path.dirname(shadow.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(shadow) } else { dirMap.set(dir, [shadow]) }
  }

  const theaters = Array.from(dirMap.entries()).map(([dir, dirShadows]) =>
    analyzePuppetTheater(dirShadows, dir),
  )

  const avgClarity = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.silhouetteClarity, 0) / shadows.length) : 0
  const avgPresence = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.screenPresence, 0) / shadows.length) : 0
  const avgFlow = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.narrativeFlow, 0) / shadows.length) : 0

  const overallArtistry = shadows.length > 0
    ? Math.round((avgClarity + avgPresence + avgFlow) / 3) : 0
  const isPerforming = avgClarity >= 60

  const performance: ShadowPerformance = { avgClarity, avgPresence, avgFlow, isPerforming, overallArtistry }

  const avgProjectionQuality = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.projectionQuality, 0) / shadows.length) : 0
  const avgLimbArticulation = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.limbArticulation, 0) / shadows.length) : 0

  const bestShadow = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file : ''
  const clearest = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.silhouetteClarity > best.silhouetteClarity ? sh : best).file : ''
  const bestProjected = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.projectionQuality > best.projectionQuality ? sh : best).file : ''
  const mostArticulate = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.limbArticulation > best.limbArticulation ? sh : best).file : ''
  const bestPresence = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.screenPresence > best.screenPresence ? sh : best).file : ''

  const stats: ShadowPuppetStats = {
    totalFiles: shadows.length,
    totalTheaters: theaters.length,
    avgSilhouetteClarity: avgClarity,
    avgProjectionQuality,
    avgLimbArticulation,
    avgScreenPresence: avgPresence,
    avgNarrativeFlow: avgFlow,
    masterPuppetCount: shadows.filter(sh => sh.condition === 'master-puppet').length,
    skilledPuppetCount: shadows.filter(sh => sh.condition === 'skilled-puppet').length,
    properPuppetCount: shadows.filter(sh => sh.condition === 'proper-puppet').length,
    ragDollCount: shadows.filter(sh => sh.condition === 'rag-doll').length,
    paperCutoutCount: shadows.filter(sh => sh.condition === 'paper-cutout').length,
    noPuppetCount: shadows.filter(sh => sh.condition === 'no-puppet').length,
    hasHighClarityCount: shadows.filter(sh => sh.defining.hasHighClarity).length,
    hasHighQualityCount: shadows.filter(sh => sh.projecting.hasHighQuality).length,
    hasHighFlexibilityCount: shadows.filter(sh => sh.articulating.hasHighFlexibility).length,
    hasHighPresenceCount: shadows.filter(sh => sh.presenting.hasHighPresence).length,
    hasHighFlowCount: shadows.filter(sh => sh.narrating.hasHighFlow).length,
    overallArtistry,
    puppeteerGrade: classifyPuppeteerGrade(overallArtistry),
    bestShadow, clearest, bestProjected, mostArticulate, bestPresence,
  }

  const recommendations = generateRecommendations(shadows, theaters, performance, stats)

  return { shadows, theaters, performance, stats, recommendations }
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
