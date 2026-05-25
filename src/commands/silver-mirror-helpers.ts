// ─── Interfaces ────────────────────────────────────────────

import { dirname } from 'node:path'
import fg from 'fast-glob'

// ─── Measure Types ──────────────────────────────────────

export type ReflectingGrade = 'perfect-reflection' | 'clear-insight' | 'proper-awareness' | 'dim-awareness' | 'dark-surface' | 'broken-glass'
export type PolishingSurface = 'perfect-silver' | 'polished-steel' | 'proper-shine' | 'dull-metal' | 'rough-surface' | 'raw-metal'
export type ResistingTarnish = 'anti-tarnish' | 'tarnish-resistant' | 'proper-coating' | 'slow-tarnish' | 'quick-tarnish' | 'blackened'
export type ImagingImage = 'true-reflection' | 'clear-image' | 'proper-likeness' | 'fuzzy-image' | 'distorted-view' | 'no-image'
export type FramingFrame = 'ornate-gold' | 'silver-filigree' | 'proper-craft' | 'simple-wood' | 'cracked-frame' | 'no-frame'
export type MirrorCondition = 'perfect-mirror' | 'clear-glass' | 'proper-reflector' | 'foggy-mirror' | 'cracked-mirror' | 'shattered'
export type GalleryType = 'hall-of-mirrors' | 'proper-gallery' | 'vanity-room' | 'shard' | 'no-mirror'
export type CuratorGrade = 'master-curator' | 'mirror-expert' | 'gallery-owner' | 'antique-dealer' | 'flea-market' | 'scrap-collector'
export type GalleryCondition = 'crystal-gallery' | 'bright-hall' | 'decent-room' | 'dim-corridor' | 'dark-room' | 'boarded-up'

// ─── Measure Interfaces ─────────────────────────────────

export interface ReflectingMeasure {
  quality: number
  grade: ReflectingGrade
  hasHighQuality: boolean
  hasSelfAware: boolean
  hasNoBlind: boolean
  hasIntrospective: boolean
  hasReflective: boolean
  hasTransparent: boolean
  hasRevealing: boolean
  hasLucid: boolean
  hasNoOpaque: boolean
  hasNoConcealing: boolean
  hasNoHidden: boolean
  blindCount: number
  opaqueCount: number
}

export interface PolishingMeasure {
  quality: number
  surface: PolishingSurface
  hasHighQuality: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasSmooth: boolean
  hasGlossy: boolean
  hasFinished: boolean
  hasElegant: boolean
  hasNoRough: boolean
  hasNoCoarse: boolean
  roughCount: number
  coarseCount: number
}

export interface ResistingMeasure {
  resistance: number
  tarnish: ResistingTarnish
  hasHighResistance: boolean
  hasAgingWell: boolean
  hasDurable: boolean
  hasResilient: boolean
  hasMaintained: boolean
  hasStable: boolean
  hasEnduring: boolean
  hasNoDegrading: boolean
  hasNoDeteriorating: boolean
  degradingCount: number
  deterioratingCount: number
}

export interface ImagingMeasure {
  accuracy: number
  image: ImagingImage
  hasHighAccuracy: boolean
  hasCorrect: boolean
  hasPrecise: boolean
  hasTrue: boolean
  hasFaithful: boolean
  hasExact: boolean
  hasReliable: boolean
  hasNoDistorted: boolean
  hasNoFalse: boolean
  distortedCount: number
  falseCount: number
}

export interface FramingMeasure {
  strength: number
  frame: FramingFrame
  hasHighStrength: boolean
  hasSupported: boolean
  hasReinforced: boolean
  hasFramed: boolean
  hasStructured: boolean
  hasContained: boolean
  hasAnchored: boolean
  hasNoUnsupported: boolean
  hasNoUnframed: boolean
  unsupportedCount: number
  unframedCount: number
}

// ─── Core Types ─────────────────────────────────────────

export interface SilverReflection {
  file: string
  reflectivity: number
  surfaceQuality: number
  tarnishResistance: number
  imageAccuracy: number
  frameStrength: number
  qualityScore: number
  condition: MirrorCondition
  reflecting: ReflectingMeasure
  polishing: PolishingMeasure
  resisting: ResistingMeasure
  imaging: ImagingMeasure
  framing: FramingMeasure
}

export interface SilverGallery {
  directory: string
  reflections: SilverReflection[]
  avgReflectivity: number
  avgSurfaceQuality: number
  avgTarnishResistance: number
  avgImageAccuracy: number
  avgFrameStrength: number
  perfectMirrorCount: number
  shatteredCount: number
  galleryType: GalleryType
  condition: GalleryCondition
}

export interface SilverMansion {
  overallClarity: number
  isClear: boolean
}

export interface SilverStats {
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

export interface SilverMirrorResult {
  reflections: SilverReflection[]
  galleries: SilverGallery[]
  mansion: SilverMansion
  stats: SilverStats
  recommendations: string[]
}

// ─── Utility ────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Classification Helpers ─────────────────────────────

function classifyReflectingGrade(quality: number): ReflectingGrade {
  if (quality >= 90) return 'perfect-reflection'
  if (quality >= 75) return 'clear-insight'
  if (quality >= 60) return 'proper-awareness'
  if (quality >= 40) return 'dim-awareness'
  if (quality >= 20) return 'dark-surface'
  return 'broken-glass'
}

function classifyPolishingSurface(quality: number): PolishingSurface {
  if (quality >= 90) return 'perfect-silver'
  if (quality >= 75) return 'polished-steel'
  if (quality >= 60) return 'proper-shine'
  if (quality >= 40) return 'dull-metal'
  if (quality >= 20) return 'rough-surface'
  return 'raw-metal'
}

function classifyResistingTarnish(resistance: number): ResistingTarnish {
  if (resistance >= 90) return 'anti-tarnish'
  if (resistance >= 75) return 'tarnish-resistant'
  if (resistance >= 60) return 'proper-coating'
  if (resistance >= 40) return 'slow-tarnish'
  if (resistance >= 20) return 'quick-tarnish'
  return 'blackened'
}

function classifyImagingImage(accuracy: number): ImagingImage {
  if (accuracy >= 90) return 'true-reflection'
  if (accuracy >= 75) return 'clear-image'
  if (accuracy >= 60) return 'proper-likeness'
  if (accuracy >= 40) return 'fuzzy-image'
  if (accuracy >= 20) return 'distorted-view'
  return 'no-image'
}

function classifyFramingFrame(strength: number): FramingFrame {
  if (strength >= 90) return 'ornate-gold'
  if (strength >= 75) return 'silver-filigree'
  if (strength >= 60) return 'proper-craft'
  if (strength >= 40) return 'simple-wood'
  if (strength >= 20) return 'cracked-frame'
  return 'no-frame'
}

/**
 * @example classifyMirrorCondition(85) // 'perfect-mirror'
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
 * @example classifyGalleryType(reflections)
 */
export function classifyGalleryType(reflections: SilverReflection[]): GalleryType {
  if (reflections.length === 0) return 'no-mirror'
  const avg = reflections.reduce((s, r) => s + r.qualityScore, 0) / reflections.length
  const perfectRatio = reflections.filter(r => r.condition === 'perfect-mirror').length / reflections.length
  if (avg >= 80 && perfectRatio >= 0.5) return 'hall-of-mirrors'
  if (avg >= 55) return 'proper-gallery'
  if (avg >= 40) return 'vanity-room'
  if (avg >= 15) return 'shard'
  return 'no-mirror'
}

/**
 * @example classifyCuratorGrade(80) // 'master-curator'
 */
export function classifyCuratorGrade(clarity: number): CuratorGrade {
  if (clarity >= 80) return 'master-curator'
  if (clarity >= 65) return 'mirror-expert'
  if (clarity >= 50) return 'gallery-owner'
  if (clarity >= 35) return 'antique-dealer'
  if (clarity >= 20) return 'flea-market'
  return 'scrap-collector'
}

/**
 * @example classifyGalleryCondition(75) // 'crystal-gallery'
 */
export function classifyGalleryCondition(avg: number): GalleryCondition {
  if (avg >= 75) return 'crystal-gallery'
  if (avg >= 60) return 'bright-hall'
  if (avg >= 45) return 'decent-room'
  if (avg >= 30) return 'dim-corridor'
  if (avg >= 15) return 'dark-room'
  return 'boarded-up'
}

// ─── measureReflecting ──────────────────────────────────
// richContent: hasDoc, hasExport, hasInterface, hasReturnType, hasGenerics, hasNamed → 100
// minimalContent: hasConst → 0 (const doesn't count)

/**
 * @example measureReflecting('export interface Config<T> { readonly items: ReadonlyArray<T> }')
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 18
  if (hasExport) score += 17
  if (hasInterface) score += 17
  if (hasReturnType) score += 17
  if (hasGenerics) score += 16
  if (hasNamed) score += 15

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 5
  if (hasTsIgnore) score -= 5

  const blindCount = hasVar + (hasEval ? 1 : 0) + (hasTsIgnore ? 1 : 0) + (hasDebugger ? 1 : 0)
  const opaqueCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const quality = Math.min(100, Math.max(0, score))

  return {
    quality,
    grade: classifyReflectingGrade(quality),
    hasHighQuality: quality >= 80,
    hasSelfAware: hasDoc && hasReturnType,
    hasNoBlind: blindCount === 0,
    hasIntrospective: hasInterface,
    hasReflective: hasReturnType || hasDoc,
    hasTransparent: hasExport && hasReturnType,
    hasRevealing: hasDoc && hasExport,
    hasLucid: hasDoc && hasExport && hasReturnType,
    hasNoOpaque: !hasAny,
    hasNoConcealing: !hasDebugger,
    hasNoHidden: !hasEval,
    blindCount,
    opaqueCount,
  }
}

// ─── measurePolishing ───────────────────────────────────
// richContent: hasDoc, hasExport, hasReturnType, hasGenerics, hasNamed, hasConst, hasOptional, hasReadonly → 100
// minimalContent: hasConst → 8

/**
 * @example measurePolishing('export function parse(input: Readonly<string>): Void {}')
 */
export function measurePolishing(content: string): PolishingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 14
  if (hasExport) score += 13
  if (hasReturnType) score += 13
  if (hasGenerics) score += 13
  if (hasNamed) score += 13
  if (hasConst) score += 8
  if (hasOptional) score += 13
  if (hasReadonly) score += 13

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 4

  const roughCount = hasVar
  const coarseCount = hasAny ? 1 : 0

  const quality = Math.min(100, Math.max(0, score))

  return {
    quality,
    surface: classifyPolishingSurface(quality),
    hasHighQuality: quality >= 80,
    hasRefined: hasDoc && hasConst,
    hasPolished: hasReturnType || hasDoc,
    hasSmooth: hasConst && hasExport,
    hasGlossy: hasDoc && hasExport && hasReturnType,
    hasFinished: hasConst && !hasAny,
    hasElegant: hasGenerics && hasReadonly && !hasAny,
    hasNoRough: roughCount === 0,
    hasNoCoarse: coarseCount === 0,
    roughCount,
    coarseCount,
  }
}

// ─── measureResisting ───────────────────────────────────
// richContent: hasDoc, hasExport, hasInterface, hasReturnType, hasGenerics, hasConst, hasOptional, hasReadonly, hasClass, hasPrivate → 100
// minimalContent: hasConst → 8

/**
 * @example measureResisting('export function compute<T>(val: Readonly<T>): T { try { return val } catch { throw new Error("fail") } }')
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 10
  if (hasExport) score += 10
  if (hasInterface) score += 11
  if (hasReturnType) score += 10
  if (hasGenerics) score += 10
  if (hasConst) score += 8
  if (hasOptional) score += 10
  if (hasReadonly) score += 11
  if (hasClass) score += 10
  if (hasPrivate) score += 10

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 8
  if (hasAny) score -= 5

  const degradingCount = hasVar
  const deterioratingCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const resistance = Math.min(100, Math.max(0, score))

  return {
    resistance,
    tarnish: classifyResistingTarnish(resistance),
    hasHighResistance: resistance >= 80,
    hasAgingWell: hasTryCatch,
    hasDurable: hasReturnType && !hasAny,
    hasResilient: hasConst && hasReturnType,
    hasMaintained: hasDoc && hasReturnType,
    hasStable: hasConst && !hasAny,
    hasEnduring: hasDoc && hasExport,
    hasNoDegrading: degradingCount === 0,
    hasNoDeteriorating: deterioratingCount === 0,
    degradingCount,
    deterioratingCount,
  }
}

// ─── measureImaging ─────────────────────────────────────
// richContent: hasDoc, hasExport, hasReturnType, hasGenerics, hasStrictChecks → 100
// minimalContent: hasConst → 0

/**
 * @example measureImaging('export function compute(val: Readonly<Number>): Number { if (val === 0) return 0; return val * 2 }')
 */
export function measureImaging(content: string): ImagingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasStrictChecks = hasPattern(content, /===|!==/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 20
  if (hasExport) score += 20
  if (hasReturnType) score += 20
  if (hasGenerics) score += 20
  if (hasStrictChecks) score += 20

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasEval) score -= 10
  if (hasAny) score -= 6

  const distortedCount = hasVar
  const falseCount = hasAny ? 1 : 0

  const accuracy = Math.min(100, Math.max(0, score))

  return {
    accuracy,
    image: classifyImagingImage(accuracy),
    hasHighAccuracy: accuracy >= 80,
    hasCorrect: hasReturnType && !hasAny,
    hasPrecise: hasStrictChecks && hasReturnType,
    hasTrue: hasReturnType && !hasAny,
    hasFaithful: hasReturnType && hasStrictChecks && !hasAny,
    hasExact: hasStrictChecks && hasReturnType,
    hasReliable: hasStrictChecks && !hasAny,
    hasNoDistorted: distortedCount === 0,
    hasNoFalse: falseCount === 0,
    distortedCount,
    falseCount,
  }
}

// ─── measureFraming ─────────────────────────────────────
// richContent: hasDoc, hasExport, hasInterface, hasReturnType, hasGenerics, hasOptional, hasReadonly, hasClass, hasPrivate → 100
// minimalContent: hasConst → 0

/**
 * @example measureFraming('export interface Config<T> extends BaseConfig { readonly items: ReadonlyArray<T> }')
 */
export function measureFraming(content: string): FramingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 11
  if (hasExport) score += 11
  if (hasInterface) score += 11
  if (hasReturnType) score += 11
  if (hasGenerics) score += 11
  if (hasOptional) score += 11
  if (hasReadonly) score += 12
  if (hasClass) score += 11
  if (hasPrivate) score += 11

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 4

  const unsupportedCount = hasVar
  const unframedCount = hasAny ? 1 : 0

  const strength = Math.min(100, Math.max(0, score))

  return {
    strength,
    frame: classifyFramingFrame(strength),
    hasHighStrength: strength >= 80,
    hasSupported: hasInterface && !hasAny,
    hasReinforced: hasReturnType && hasExport,
    hasFramed: hasDoc && hasExport,
    hasStructured: hasInterface || hasClass,
    hasContained: !hasAny,
    hasAnchored: hasGenerics && hasReadonly && !hasAny,
    hasNoUnsupported: unsupportedCount === 0,
    hasNoUnframed: unframedCount === 0,
    unsupportedCount,
    unframedCount,
  }
}

// ─── analyzeMirrorReflection ────────────────────────────

/**
 * @example analyzeMirrorReflection(richContent, 'mirror.ts')
 */
export function analyzeMirrorReflection(content: string, filePath: string): SilverReflection {
  const reflecting = measureReflecting(content)
  const polishing = measurePolishing(content)
  const resisting = measureResisting(content)
  const imaging = measureImaging(content)
  const framing = measureFraming(content)

  const reflectivity = reflecting.quality
  const surfaceQuality = polishing.quality
  const tarnishResistance = resisting.resistance
  const imageAccuracy = imaging.accuracy
  const frameStrength = framing.strength

  const qualityScore = Math.round(
    reflectivity * 0.2 +
    surfaceQuality * 0.2 +
    tarnishResistance * 0.2 +
    imageAccuracy * 0.2 +
    frameStrength * 0.2,
  )

  return {
    file: filePath,
    reflectivity,
    surfaceQuality,
    tarnishResistance,
    imageAccuracy,
    frameStrength,
    qualityScore,
    condition: classifyMirrorCondition(qualityScore),
    reflecting,
    polishing,
    resisting,
    imaging,
    framing,
  }
}

// ─── analyzeMirrorGallery ───────────────────────────────

/**
 * @example analyzeMirrorGallery(reflections, 'src/mirror')
 */
export function analyzeMirrorGallery(reflections: SilverReflection[], dirPath: string): SilverGallery {
  if (reflections.length === 0) {
    return {
      directory: dirPath,
      reflections: [],
      avgReflectivity: 0,
      avgSurfaceQuality: 0,
      avgTarnishResistance: 0,
      avgImageAccuracy: 0,
      avgFrameStrength: 0,
      perfectMirrorCount: 0,
      shatteredCount: 0,
      galleryType: 'no-mirror',
      condition: 'boarded-up',
    }
  }

  const avgReflectivity = Math.round(reflections.reduce((s, r) => s + r.reflectivity, 0) / reflections.length)
  const avgSurfaceQuality = Math.round(reflections.reduce((s, r) => s + r.surfaceQuality, 0) / reflections.length)
  const avgTarnishResistance = Math.round(reflections.reduce((s, r) => s + r.tarnishResistance, 0) / reflections.length)
  const avgImageAccuracy = Math.round(reflections.reduce((s, r) => s + r.imageAccuracy, 0) / reflections.length)
  const avgFrameStrength = Math.round(reflections.reduce((s, r) => s + r.frameStrength, 0) / reflections.length)

  const perfectMirrorCount = reflections.filter(r => r.condition === 'perfect-mirror').length
  const shatteredCount = reflections.filter(r => r.condition === 'shattered').length

  const galleryType = classifyGalleryType(reflections)
  const overallAvg = Math.round((avgReflectivity + avgSurfaceQuality + avgTarnishResistance + avgImageAccuracy + avgFrameStrength) / 5)

  return {
    directory: dirPath,
    reflections,
    avgReflectivity,
    avgSurfaceQuality,
    avgTarnishResistance,
    avgImageAccuracy,
    avgFrameStrength,
    perfectMirrorCount,
    shatteredCount,
    galleryType,
    condition: classifyGalleryCondition(overallAvg),
  }
}

// ─── generateRecommendations ────────────────────────────

/**
 * @example generateRecommendations(reflections, galleries, mansion, stats)
 */
export function generateRecommendations(
  reflections: SilverReflection[],
  galleries: SilverGallery[],
  mansion: SilverMansion,
  stats: SilverStats,
): string[] {
  const recs: string[] = []

  if (mansion.overallClarity >= 90 && stats.shatteredCount === 0) {
    recs.push('Your silver mirror collection is flawless! Every reflection is perfect, every surface gleams with clarity')
    return recs
  }

  if (stats.avgReflectivity < 50) {
    recs.push('Improve mirror reflectivity — add exports, return types, and documentation for clearer self-awareness')
  }
  if (stats.avgSurfaceQuality < 50) {
    recs.push('Improve surface quality — add documentation, clear naming, and readable constructs for better polish')
  }
  if (stats.avgTarnishResistance < 50) {
    recs.push('Improve tarnish resistance — add error handling, type safety, and defensive patterns')
  }
  if (stats.avgImageAccuracy < 50) {
    recs.push('Improve image accuracy — use strict equality, honest types, and faithful representations')
  }
  if (stats.avgFrameStrength < 50) {
    recs.push('Improve frame strength — use interfaces, generics, and structural patterns')
  }

  const shattered = reflections.filter(r => r.condition === 'shattered')
  if (shattered.length > 0 && shattered.length <= 3) {
    recs.push(`Repair these shattered reflections: ${shattered.map(r => r.file).join(', ')}`)
  } else if (shattered.length > 3) {
    recs.push(`${shattered.length} shattered reflections need repair — prioritize the most broken`)
  }

  const badGalleries = galleries.filter(g => g.galleryType === 'shard' || g.galleryType === 'no-mirror')
  if (badGalleries.length > 0) {
    recs.push(`${badGalleries.length} gallery(s) are shards or empty — consider restructuring or removing dead code`)
  }

  if (!mansion.isClear) {
    recs.push('Overall mirror clarity is below 60 — focus on improving core code quality')
  }

  if (recs.length === 0) {
    recs.push('The silver mirror endures — keep building with reflective quality')
  }

  return recs
}

// ─── gatherFiles ────────────────────────────────────────

/**
 * @example gatherFiles('/path', ['.ts'], ['ignore-patterns'])
 */
export async function gatherFiles(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*${ext}`)
  const entries = await fg(patterns, {
    cwd: rootDir,
    ignore: ignorePatterns,
    absolute: false,
    onlyFiles: true,
  })
  return entries.sort()
}

// ─── buildSilverMirrorResult ────────────────────────────

/**
 * @example buildSilverMirrorResult(['a.ts'], [content])
 */
export async function buildSilverMirrorResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverMirrorResult> {
  const reflections = files.map((file, i) =>
    analyzeMirrorReflection(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SilverReflection[]>()
  for (const r of reflections) {
    const dir = dirname(r.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(r)
    } else {
      dirMap.set(dir, [r])
    }
  }

  const galleries = Array.from(dirMap.entries()).map(([dir, rs]) =>
    analyzeMirrorGallery(rs, dir),
  )

  const totalFiles = reflections.length
  const avgReflectivity = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.reflectivity, 0) / totalFiles) : 0
  const avgSurfaceQuality = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.surfaceQuality, 0) / totalFiles) : 0
  const avgTarnishResistance = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.tarnishResistance, 0) / totalFiles) : 0
  const avgImageAccuracy = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.imageAccuracy, 0) / totalFiles) : 0
  const avgFrameStrength = totalFiles > 0 ? Math.round(reflections.reduce((s, r) => s + r.frameStrength, 0) / totalFiles) : 0

  const overallClarity = Math.round(
    (avgReflectivity + avgSurfaceQuality + avgTarnishResistance + avgImageAccuracy + avgFrameStrength) / 5,
  )

  const bestBy = (fn: (r: SilverReflection) => number) =>
    reflections.length > 0 ? reflections.reduce((best, r) => fn(r) > fn(best) ? r : best).file : 'none'

  const stats: SilverStats = {
    totalFiles,
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
    bestReflection: bestBy(r => r.qualityScore),
    mostReflective: bestBy(r => r.reflectivity),
    bestPolished: bestBy(r => r.surfaceQuality),
    mostTarnishResistant: bestBy(r => r.tarnishResistance),
    mostAccurate: bestBy(r => r.imageAccuracy),
  }

  const mansion: SilverMansion = {
    overallClarity,
    isClear: avgReflectivity >= 60,
  }

  const recommendations = generateRecommendations(reflections, galleries, mansion, stats)

  return { reflections, galleries, mansion, stats, recommendations }
}
