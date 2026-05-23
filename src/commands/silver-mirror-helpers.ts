// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Reflection grade */
export type ReflectionGrade =
  | 'perfect-reflection'
  | 'clear-mirror'
  | 'proper-reflection'
  | 'dull-surface'
  | 'tarnished-mirror'
  | 'broken-glass'

/** Surface grade */
export type SurfaceGrade =
  | 'perfect-silver'
  | 'polished-surface'
  | 'proper-finish'
  | 'rough-surface'
  | 'pitted'
  | 'raw-metal'

/** Tarnish grade */
export type TarnishGrade =
  | 'anti-tarnish'
  | 'tarnish-resistant'
  | 'proper-coating'
  | 'tarnishing'
  | 'corroding'
  | 'blackened'

/** Image grade */
export type ImageGrade =
  | 'true-reflection'
  | 'accurate-image'
  | 'proper-likeness'
  | 'distorted'
  | 'funhouse-mirror'
  | 'no-image'

/** Frame grade */
export type FrameGrade =
  | 'ornate-gold'
  | 'solid-frame'
  | 'proper-mounting'
  | 'weak-frame'
  | 'loose-mounting'
  | 'no-frame'

/** Mirror condition */
export type MirrorCondition =
  | 'perfect-mirror'
  | 'clear-glass'
  | 'proper-reflector'
  | 'foggy-mirror'
  | 'cracked-mirror'
  | 'shattered'

/** Gallery type */
export type GalleryType =
  | 'hall-of-mirrors'
  | 'proper-gallery'
  | 'vanity-room'
  | 'compact-mirror'
  | 'shard'
  | 'no-mirror'

/** Gallery condition */
export type GalleryCondition =
  | 'crystal-gallery'
  | 'bright-hall'
  | 'decent-room'
  | 'dim-corridor'
  | 'dark-room'
  | 'boarded-up'

/** Curator grade */
export type CuratorGrade =
  | 'master-curator'
  | 'mirror-expert'
  | 'gallery-owner'
  | 'antique-dealer'
  | 'flea-market'
  | 'scrap-collector'

/** Reflecting measurement */
export interface ReflectingMeasure {
  quality: number
  grade: ReflectionGrade
  hasHighQuality: boolean
  hasSelfAware: boolean
  hasIntrospective: boolean
  hasNoBlind: boolean
  hasReflective: boolean
  hasNoOpaque: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasRevealing: boolean
  hasNoConcealing: boolean
  hasLucid: boolean
  blindCount: number
  opaqueCount: number
}

/** Polishing measurement */
export interface PolishingMeasure {
  quality: number
  surface: SurfaceGrade
  hasHighQuality: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasSmooth: boolean
  hasNoCoarse: boolean
  hasGlossy: boolean
  hasNoMatte: boolean
  hasFinished: boolean
  hasNoUnfinished: boolean
  hasElegant: boolean
  roughCount: number
  coarseCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resistance: number
  tarnish: TarnishGrade
  hasHighResistance: boolean
  hasAgingWell: boolean
  hasDurable: boolean
  hasNoDegrading: boolean
  hasResilient: boolean
  hasNoBrittle: boolean
  hasMaintained: boolean
  hasNoDeteriorating: boolean
  hasStable: boolean
  hasNoUnstable: boolean
  hasEnduring: boolean
  degradingCount: number
  deterioratingCount: number
}

/** Imaging measurement */
export interface ImagingMeasure {
  accuracy: number
  image: ImageGrade
  hasHighAccuracy: boolean
  hasCorrect: boolean
  hasPrecise: boolean
  hasNoDistorted: boolean
  hasTrue: boolean
  hasNoFalse: boolean
  hasFaithful: boolean
  hasNoInaccurate: boolean
  hasExact: boolean
  hasNoWarped: boolean
  hasReliable: boolean
  distortedCount: number
  falseCount: number
}

/** Framing measurement */
export interface FramingMeasure {
  strength: number
  frame: FrameGrade
  hasHighStrength: boolean
  hasSupported: boolean
  hasReinforced: boolean
  hasNoUnsupported: boolean
  hasFramed: boolean
  hasNoUnframed: boolean
  hasStructured: boolean
  hasNoUnstructured: boolean
  hasContained: boolean
  hasNoExposed: boolean
  hasAnchored: boolean
  unsupportedCount: number
  unframedCount: number
}

/** Single file analysis */
export interface MirrorReflection {
  file: string
  reflectivity: number
  surfaceQuality: number
  tarnishResistance: number
  imageAccuracy: number
  frameStrength: number
  reflecting: ReflectingMeasure
  polishing: PolishingMeasure
  resisting: ResistingMeasure
  imaging: ImagingMeasure
  framing: FramingMeasure
  condition: MirrorCondition
  qualityScore: number
}

/** Directory-level gallery */
export interface MirrorGallery {
  directory: string
  reflections: MirrorReflection[]
  avgReflectivity: number
  avgQuality: number
  avgStrength: number
  perfectMirrorCount: number
  shatteredCount: number
  galleryType: GalleryType
  condition: GalleryCondition
}

/** Mansion summary */
export interface MansionSummary {
  avgReflectivity: number
  avgQuality: number
  avgStrength: number
  isClear: boolean
  overallClarity: number
}

/** Full stats */
export interface SilverMirrorStats {
  totalFiles: number
  totalGalleries: number
  avgReflectivity: number
  avgSurfaceQuality: number
  avgTarnishResistance: number
  avgImageAccuracy: number
  avgFrameStrength: number
  perfectMirrorCount: number
  clearGlassCount: number
  properReflectorCount: number
  foggyMirrorCount: number
  crackedMirrorCount: number
  shatteredCount: number
  hasHighQualityCount: number
  hasHighPolishCount: number
  hasHighResistanceCount: number
  hasHighAccuracyCount: number
  hasHighStrengthCount: number
  overallClarity: number
  curatorGrade: CuratorGrade
  bestReflection: string
  mostReflective: string
  bestPolished: string
  mostTarnishResistant: string
  mostAccurate: string
}

/** Full result */
export interface SilverMirrorResult {
  reflections: MirrorReflection[]
  galleries: MirrorGallery[]
  mansion: MansionSummary
  stats: SilverMirrorStats
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
 * Measure reflectivity (introspection quality)
 * @example
 * const m = measureReflecting(content)
 * console.log(m.grade) // 'perfect-reflection'
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasSelfAware = hasReturnType(content) && hasStrictEq(content)
  const hasIntrospective = hasDocComments(content) && hasInterface(content)
  const hasReflective = hasGenerics(content) && hasTypeAlias(content)
  const hasTransparent = hasExport(content) && hasImport(content)
  const hasRevealing = hasAsync(content) && hasReturnType(content)
  const hasLucid = hasStrictEq(content) && hasClass(content)

  score += hasSelfAware ? 5 : 0
  score += hasIntrospective ? 5 : 0
  score += hasReflective ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasLucid ? 5 : 0

  const quality = Math.min(score, 100)
  const blindCount = count(/\bvar\b/, content)
  const opaqueCount = count(/\bany\b/, content)

  const hasNoBlind = blindCount === 0
  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoConcealing = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: ReflectionGrade
  if (quality >= 85) grade = 'perfect-reflection'
  else if (quality >= 70) grade = 'clear-mirror'
  else if (quality >= 55) grade = 'proper-reflection'
  else if (quality >= 40) grade = 'dull-surface'
  else if (quality >= 25) grade = 'tarnished-mirror'
  else grade = 'broken-glass'

  return {
    quality, grade, hasHighQuality, hasSelfAware, hasIntrospective, hasNoBlind,
    hasReflective, hasNoOpaque, hasTransparent, hasNoHidden, hasRevealing,
    hasNoConcealing, hasLucid, blindCount, opaqueCount,
  }
}

/**
 * Measure surface quality (polish/refinement)
 * @example
 * const m = measurePolishing(content)
 * console.log(m.surface) // 'perfect-silver'
 */
export function measurePolishing(content: string): PolishingMeasure {
  let score = 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasRefined = hasReadonly(content) && hasPrivate(content)
  const hasPolished = hasReturnType(content) && hasStrictEq(content)
  const hasSmooth = hasDocComments(content) && hasInterface(content)
  const hasGlossy = hasGenerics(content) && hasExport(content)
  const hasFinished = hasConst(content) && hasReturnType(content)
  const hasElegant = hasStrictEq(content) && hasClass(content)

  score += hasRefined ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasGlossy ? 5 : 0
  score += hasFinished ? 5 : 0
  score += hasElegant ? 5 : 0

  const quality = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const coarseCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoCoarse = coarseCount === 0
  const hasNoMatte = !has(/\beval\b/, content)
  const hasNoUnfinished = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let surface: SurfaceGrade
  if (quality >= 85) surface = 'perfect-silver'
  else if (quality >= 70) surface = 'polished-surface'
  else if (quality >= 55) surface = 'proper-finish'
  else if (quality >= 40) surface = 'rough-surface'
  else if (quality >= 25) surface = 'pitted'
  else surface = 'raw-metal'

  return {
    quality, surface, hasHighQuality, hasRefined, hasPolished, hasNoRough,
    hasSmooth, hasNoCoarse, hasGlossy, hasNoMatte, hasFinished,
    hasNoUnfinished, hasElegant, roughCount, coarseCount,
  }
}

/**
 * Measure tarnish resistance (aging resistance)
 * @example
 * const m = measureResisting(content)
 * console.log(m.tarnish) // 'anti-tarnish'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasAgingWell = hasInterface(content) && hasClass(content)
  const hasDurable = hasExport(content) && hasImport(content)
  const hasResilient = hasGenerics(content) && hasTypeAlias(content)
  const hasMaintained = hasReadonly(content) && hasPrivate(content)
  const hasStable = hasConst(content) && hasExport(content)
  const hasEnduring = hasNamedExport(content) && hasInterface(content)

  score += hasAgingWell ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasMaintained ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasEnduring ? 5 : 0

  const resistance = Math.min(score, 100)
  const degradingCount = count(/\bvar\b/, content)
  const deterioratingCount = count(/\bany\b/, content)

  const hasNoDegrading = degradingCount === 0
  const hasNoDeteriorating = deterioratingCount === 0
  const hasNoBrittle = !has(/\beval\b/, content)
  const hasNoUnstable = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let tarnish: TarnishGrade
  if (resistance >= 85) tarnish = 'anti-tarnish'
  else if (resistance >= 70) tarnish = 'tarnish-resistant'
  else if (resistance >= 55) tarnish = 'proper-coating'
  else if (resistance >= 40) tarnish = 'tarnishing'
  else if (resistance >= 25) tarnish = 'corroding'
  else tarnish = 'blackened'

  return {
    resistance, tarnish, hasHighResistance, hasAgingWell, hasDurable, hasNoDegrading,
    hasResilient, hasNoBrittle, hasMaintained, hasNoDeteriorating, hasStable,
    hasNoUnstable, hasEnduring, degradingCount, deterioratingCount,
  }
}

/**
 * Measure image accuracy (correctness)
 * @example
 * const m = measureImaging(content)
 * console.log(m.image) // 'true-reflection'
 */
export function measureImaging(content: string): ImagingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasCorrect = hasStrictEq(content) && hasReturnType(content)
  const hasPrecise = hasReadonly(content) && hasPrivate(content)
  const hasTrue = hasTypeAlias(content) && hasGenerics(content)
  const hasFaithful = hasDocComments(content) && hasInterface(content)
  const hasExact = hasExport(content) && hasStrictEq(content)
  const hasReliable = hasClass(content) && hasReturnType(content)

  score += hasCorrect ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasTrue ? 5 : 0
  score += hasFaithful ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasReliable ? 5 : 0

  const accuracy = Math.min(score, 100)
  const distortedCount = count(/\bvar\b/, content)
  const falseCount = count(/\bany\b/, content)

  const hasNoDistorted = distortedCount === 0
  const hasNoFalse = falseCount === 0
  const hasNoInaccurate = !has(/\beval\b/, content)
  const hasNoWarped = !has(/\bdebugger\b/, content)
  const hasHighAccuracy = accuracy >= 70

  let image: ImageGrade
  if (accuracy >= 85) image = 'true-reflection'
  else if (accuracy >= 70) image = 'accurate-image'
  else if (accuracy >= 55) image = 'proper-likeness'
  else if (accuracy >= 40) image = 'distorted'
  else if (accuracy >= 25) image = 'funhouse-mirror'
  else image = 'no-image'

  return {
    accuracy, image, hasHighAccuracy, hasCorrect, hasPrecise, hasNoDistorted,
    hasTrue, hasNoFalse, hasFaithful, hasNoInaccurate, hasExact,
    hasNoWarped, hasReliable, distortedCount, falseCount,
  }
}

/**
 * Measure frame strength (supporting structure)
 * @example
 * const m = measureFraming(content)
 * console.log(m.frame) // 'ornate-gold'
 */
export function measureFraming(content: string): FramingMeasure {
  let score = 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasSupported = hasClass(content) && hasInterface(content)
  const hasReinforced = hasExport(content) && hasImport(content)
  const hasFramed = hasGenerics(content) && hasTypeAlias(content)
  const hasStructured = hasPrivate(content) && hasReadonly(content)
  const hasContained = hasDocComments(content) && hasReturnType(content)
  const hasAnchored = hasClass(content) && hasGenerics(content)

  score += hasSupported ? 5 : 0
  score += hasReinforced ? 5 : 0
  score += hasFramed ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasContained ? 5 : 0
  score += hasAnchored ? 5 : 0

  const strength = Math.min(score, 100)
  const unsupportedCount = count(/\bvar\b/, content)
  const unframedCount = count(/\bany\b/, content)

  const hasNoUnsupported = unsupportedCount === 0
  const hasNoUnframed = unframedCount === 0
  const hasNoUnstructured = !has(/\beval\b/, content)
  const hasNoExposed = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let frame: FrameGrade
  if (strength >= 85) frame = 'ornate-gold'
  else if (strength >= 70) frame = 'solid-frame'
  else if (strength >= 55) frame = 'proper-mounting'
  else if (strength >= 40) frame = 'weak-frame'
  else if (strength >= 25) frame = 'loose-mounting'
  else frame = 'no-frame'

  return {
    strength, frame, hasHighStrength, hasSupported, hasReinforced, hasNoUnsupported,
    hasFramed, hasNoUnframed, hasStructured, hasNoUnstructured, hasContained,
    hasNoExposed, hasAnchored, unsupportedCount, unframedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify mirror condition
 * @example
 * classifyMirrorCondition(90) // 'perfect-mirror'
 */
export function classifyMirrorCondition(score: number): MirrorCondition {
  if (score >= 85) return 'perfect-mirror'
  if (score >= 70) return 'clear-glass'
  if (score >= 55) return 'proper-reflector'
  if (score >= 40) return 'foggy-mirror'
  if (score >= 25) return 'cracked-mirror'
  return 'shattered'
}

/**
 * Classify gallery type
 * @example
 * classifyGalleryType(reflections) // 'hall-of-mirrors'
 */
export function classifyGalleryType(reflections: MirrorReflection[]): GalleryType {
  if (reflections.length === 0) return 'no-mirror'
  const avgQs = Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length)
  const perfectRatio = reflections.filter(r => r.condition === 'perfect-mirror').length / reflections.length
  if (avgQs >= 75 && perfectRatio >= 0.5) return 'hall-of-mirrors'
  if (avgQs >= 60) return 'proper-gallery'
  if (avgQs >= 45) return 'vanity-room'
  if (avgQs >= 30) return 'compact-mirror'
  if (avgQs >= 15) return 'shard'
  return 'no-mirror'
}

/**
 * Classify curator grade
 * @example
 * classifyCuratorGrade(85) // 'master-curator'
 */
export function classifyCuratorGrade(avgClarity: number): CuratorGrade {
  if (avgClarity >= 80) return 'master-curator'
  if (avgClarity >= 65) return 'mirror-expert'
  if (avgClarity >= 50) return 'gallery-owner'
  if (avgClarity >= 35) return 'antique-dealer'
  if (avgClarity >= 20) return 'flea-market'
  return 'scrap-collector'
}

/**
 * Classify gallery condition
 * @example
 * classifyGalleryCondition(80) // 'crystal-gallery'
 */
export function classifyGalleryCondition(avgQs: number): GalleryCondition {
  if (avgQs >= 75) return 'crystal-gallery'
  if (avgQs >= 60) return 'bright-hall'
  if (avgQs >= 45) return 'decent-room'
  if (avgQs >= 30) return 'dim-corridor'
  if (avgQs >= 15) return 'dark-room'
  return 'boarded-up'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(reflections, galleries, mansion, stats)
 */
export function generateRecommendations(
  reflections: MirrorReflection[],
  galleries: MirrorGallery[],
  mansion: MansionSummary,
  stats: SilverMirrorStats,
): string[] {
  const recs: string[] = []
  if (stats.avgReflectivity < 50) {
    recs.push('Increase reflectivity with return types, strict equality, and self-documenting interfaces')
  }
  if (stats.avgSurfaceQuality < 50) {
    recs.push('Polish surface quality with readonly properties, private access, and refined type patterns')
  }
  if (stats.avgTarnishResistance < 50) {
    recs.push('Improve tarnish resistance with durable interfaces, resilient generics, and maintained exports')
  }
  if (stats.avgImageAccuracy < 50) {
    recs.push('Sharpen image accuracy with strict equality, precise types, and faithful documentation')
  }
  if (stats.avgFrameStrength < 50) {
    recs.push('Strengthen frame with solid classes, reinforced exports, and structured access modifiers')
  }
  if (stats.shatteredCount > 0) {
    recs.push(`${stats.shatteredCount} file(s) are shattered — consider significant refactoring`)
  }
  if (mansion.overallClarity < 40) {
    recs.push('Overall mirror clarity is poor — focus on reflectivity and surface quality first')
  }
  const allNone = galleries.every(g => g.galleryType === 'no-mirror' || g.galleryType === 'shard')
  if (allNone && galleries.length > 0) {
    recs.push('All galleries are shards or empty — consider a major quality overhaul')
  }
  const shattered = reflections.filter(r => r.condition === 'shattered').map(r => r.file)
  if (shattered.length > 0 && shattered.length <= 3) {
    recs.push(`Repair these shattered files into mirrors: ${shattered.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your silver mirror collection is flawless! Every reflection is perfect, every surface gleams with clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a mirror reflection
 * @example
 * const reflection = analyzeMirrorReflection(content, 'index.ts')
 * console.log(reflection.condition) // 'perfect-mirror'
 */
export function analyzeMirrorReflection(content: string, filePath: string): MirrorReflection {
  const reflecting = measureReflecting(content)
  const polishing = measurePolishing(content)
  const resisting = measureResisting(content)
  const imaging = measureImaging(content)
  const framing = measureFraming(content)

  const qualityScore = Math.round(
    reflecting.quality * 0.2 +
    polishing.quality * 0.2 +
    resisting.resistance * 0.2 +
    imaging.accuracy * 0.2 +
    framing.strength * 0.2,
  )

  return {
    file: filePath,
    reflectivity: reflecting.quality,
    surfaceQuality: polishing.quality,
    tarnishResistance: resisting.resistance,
    imageAccuracy: imaging.accuracy,
    frameStrength: framing.strength,
    reflecting,
    polishing,
    resisting,
    imaging,
    framing,
    condition: classifyMirrorCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a mirror gallery
 * @example
 * const gallery = analyzeMirrorGallery(reflections, 'src')
 * console.log(gallery.galleryType) // 'hall-of-mirrors'
 */
export function analyzeMirrorGallery(reflections: MirrorReflection[], dirPath: string): MirrorGallery {
  if (reflections.length === 0) {
    return {
      directory: dirPath, reflections: [], avgReflectivity: 0, avgQuality: 0, avgStrength: 0,
      perfectMirrorCount: 0, shatteredCount: 0, galleryType: 'no-mirror', condition: 'boarded-up',
    }
  }

  const avgReflectivity = Math.round(reflections.reduce((s, r) => s + r.reflectivity, 0) / reflections.length)
  const avgQuality = Math.round(reflections.reduce((s, r) => s + r.surfaceQuality, 0) / reflections.length)
  const avgStrength = Math.round(reflections.reduce((s, r) => s + r.frameStrength, 0) / reflections.length)
  const perfectMirrorCount = reflections.filter(r => r.condition === 'perfect-mirror').length
  const shatteredCount = reflections.filter(r => r.condition === 'shattered').length
  const avgQs = Math.round(reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length)

  return {
    directory: dirPath, reflections, avgReflectivity, avgQuality, avgStrength,
    perfectMirrorCount, shatteredCount, galleryType: classifyGalleryType(reflections),
    condition: classifyGalleryCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete silver mirror result
 * @example
 * const result = await buildSilverMirrorResult(files, contents)
 * console.log(result.stats.curatorGrade) // 'master-curator'
 */
export async function buildSilverMirrorResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverMirrorResult> {
  const reflections = files.map((file, i) => analyzeMirrorReflection(contents[i] ?? '', file))

  const dirMap = new Map<string, MirrorReflection[]>()
  for (const reflection of reflections) {
    const dir = path.dirname(reflection.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(reflection) } else { dirMap.set(dir, [reflection]) }
  }

  const galleries = Array.from(dirMap.entries()).map(([dir, dirReflections]) =>
    analyzeMirrorGallery(dirReflections, dir),
  )

  const avgReflectivity = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.reflectivity, 0) / reflections.length) : 0
  const avgQuality = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.surfaceQuality, 0) / reflections.length) : 0
  const avgStrength = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.frameStrength, 0) / reflections.length) : 0

  const overallClarity = reflections.length > 0
    ? Math.round((avgReflectivity + avgQuality + avgStrength) / 3) : 0
  const isClear = avgReflectivity >= 60

  const mansion: MansionSummary = { avgReflectivity, avgQuality, avgStrength, isClear, overallClarity }

  const avgSurfaceQuality = avgQuality
  const avgFrameStrength = avgStrength
  const avgTarnishResistance = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.tarnishResistance, 0) / reflections.length) : 0
  const avgImageAccuracy = reflections.length > 0
    ? Math.round(reflections.reduce((s, r) => s + r.imageAccuracy, 0) / reflections.length) : 0

  const bestReflection = reflections.length > 0
    ? reflections.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const mostReflective = reflections.length > 0
    ? reflections.reduce((best, r) => r.reflectivity > best.reflectivity ? r : best).file : ''
  const bestPolished = reflections.length > 0
    ? reflections.reduce((best, r) => r.surfaceQuality > best.surfaceQuality ? r : best).file : ''
  const mostTarnishResistant = reflections.length > 0
    ? reflections.reduce((best, r) => r.tarnishResistance > best.tarnishResistance ? r : best).file : ''
  const mostAccurate = reflections.length > 0
    ? reflections.reduce((best, r) => r.imageAccuracy > best.imageAccuracy ? r : best).file : ''

  const stats: SilverMirrorStats = {
    totalFiles: reflections.length,
    totalGalleries: galleries.length,
    avgReflectivity,
    avgSurfaceQuality,
    avgTarnishResistance,
    avgImageAccuracy,
    avgFrameStrength,
    perfectMirrorCount: reflections.filter(r => r.condition === 'perfect-mirror').length,
    clearGlassCount: reflections.filter(r => r.condition === 'clear-glass').length,
    properReflectorCount: reflections.filter(r => r.condition === 'proper-reflector').length,
    foggyMirrorCount: reflections.filter(r => r.condition === 'foggy-mirror').length,
    crackedMirrorCount: reflections.filter(r => r.condition === 'cracked-mirror').length,
    shatteredCount: reflections.filter(r => r.condition === 'shattered').length,
    hasHighQualityCount: reflections.filter(r => r.reflecting.hasHighQuality).length,
    hasHighPolishCount: reflections.filter(r => r.polishing.hasHighQuality).length,
    hasHighResistanceCount: reflections.filter(r => r.resisting.hasHighResistance).length,
    hasHighAccuracyCount: reflections.filter(r => r.imaging.hasHighAccuracy).length,
    hasHighStrengthCount: reflections.filter(r => r.framing.hasHighStrength).length,
    overallClarity,
    curatorGrade: classifyCuratorGrade(overallClarity),
    bestReflection, mostReflective, bestPolished, mostTarnishResistant, mostAccurate,
  }

  const recommendations = generateRecommendations(reflections, galleries, mansion, stats)

  return { reflections, galleries, mansion, stats, recommendations }
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
