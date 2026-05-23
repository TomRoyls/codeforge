// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Harmony grade */
export type HarmonyGrade =
  | 'symphony-colors'
  | 'harmonious-palette'
  | 'proper-matching'
  | 'clashing-colors'
  | 'random-palette'
  | 'monochrome-drab'

/** Lead grade */
export type LeadGrade =
  | 'pure-lead'
  | 'strong-came'
  | 'proper-binding'
  | 'weak-joint'
  | 'cracked-lead'
  | 'no-binding'

/** Light grade */
export type LightGrade =
  | 'crystal-clear'
  | 'bright-transmission'
  | 'proper-light'
  | 'tinted-glass'
  | 'frosted'
  | 'opaque'

/** Pattern grade */
export type PatternGrade =
  | 'masterwork-design'
  | 'beautiful-mosaic'
  | 'proper-pattern'
  | 'random-tiles'
  | 'broken-pattern'
  | 'no-pattern'

/** Frame grade */
export type FrameGrade =
  | 'iron-frame'
  | 'strong-armature'
  | 'proper-support'
  | 'weak-frame'
  | 'buckling'
  | 'no-frame'

/** Pane condition */
export type PaneCondition =
  | 'cathedral-window'
  | 'beautiful-panel'
  | 'proper-window'
  | 'cracked-glass'
  | 'shattered-pane'
  | 'no-glass'

/** Workshop type */
export type WorkshopType =
  | 'cathedral-studio'
  | 'glass-atelier'
  | 'proper-workshop'
  | 'home-studio'
  | 'craft-table'
  | 'no-studio'

/** Workshop condition */
export type WorkshopCondition =
  | 'masterwork-collection'
  | 'beautiful-display'
  | 'decent-gallery'
  | 'cracked-display'
  | 'broken-pieces'
  | 'empty'

/** Artisan grade */
export type ArtisanGrade =
  | 'master-glazier'
  | 'stained-glass-artist'
  | 'skilled-craftsman'
  | 'apprentice'
  | 'novice'
  | 'window-shopper'

/** Harmonizing measurement */
export interface HarmonizingMeasure {
  harmony: number
  grade: HarmonyGrade
  hasHighHarmony: boolean
  hasConsistent: boolean
  hasMatching: boolean
  hasNoClashing: boolean
  hasUnified: boolean
  hasNoDiscordant: boolean
  hasHarmonious: boolean
  hasNoMismatched: boolean
  hasCoherent: boolean
  hasNoConflicting: boolean
  hasBlended: boolean
  clashingCount: number
  discordantCount: number
}

/** Binding measurement */
export interface BindingMeasure {
  quality: number
  lead: LeadGrade
  hasHighQuality: boolean
  hasConnected: boolean
  hasJoined: boolean
  hasNoSeparated: boolean
  hasBound: boolean
  hasNoLoose: boolean
  hasIntegrated: boolean
  hasNoFragmented: boolean
  hasCoupled: boolean
  hasNoUncoupled: boolean
  hasLinked: boolean
  separatedCount: number
  looseCount: number
}

/** Transmitting measurement */
export interface TransmittingMeasure {
  clarity: number
  light: LightGrade
  hasHighClarity: boolean
  hasTransparent: boolean
  hasRevealing: boolean
  hasNoHidden: boolean
  hasClear: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoObscured: boolean
  hasOpen: boolean
  hasNoConcealed: boolean
  hasLuminous: boolean
  hiddenCount: number
  opaqueCount: number
}

/** Patterning measurement */
export interface PatterningMeasure {
  coherence: number
  pattern: PatternGrade
  hasHighCoherence: boolean
  hasLogical: boolean
  hasFlowing: boolean
  hasNoChaotic: boolean
  hasStructured: boolean
  hasNoRandom: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasCoherent: boolean
  hasNoDisjointed: boolean
  hasOrdered: boolean
  chaoticCount: number
  scatteredCount: number
}

/** Structuring measurement */
export interface StructuringMeasure {
  integrity: number
  frame: FrameGrade
  hasHighIntegrity: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasStable: boolean
  hasNoUnstable: boolean
  hasStrong: boolean
  hasNoWeak: boolean
  hasSound: boolean
  hasNoBroken: boolean
  hasSecure: boolean
  fragileCount: number
  unstableCount: number
}

/** Single file analysis */
export interface GlassPane {
  file: string
  colorHarmony: number
  leadQuality: number
  lightTransmission: number
  patternCoherence: number
  structuralIntegrity: number
  harmonizing: HarmonizingMeasure
  binding: BindingMeasure
  transmitting: TransmittingMeasure
  patterning: PatterningMeasure
  structuring: StructuringMeasure
  condition: PaneCondition
  qualityScore: number
}

/** Directory-level workshop */
export interface GlassWorkshop {
  directory: string
  panes: GlassPane[]
  avgHarmony: number
  avgBinding: number
  avgIntegrity: number
  cathedralWindowCount: number
  noGlassCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

/** Cathedral summary */
export interface CathedralSummary {
  avgHarmony: number
  avgBinding: number
  avgIntegrity: number
  isLuminous: boolean
  overallBrilliance: number
}

/** Full stats */
export interface StainedGlassStats {
  totalFiles: number
  totalWorkshops: number
  avgColorHarmony: number
  avgLeadQuality: number
  avgLightTransmission: number
  avgPatternCoherence: number
  avgStructuralIntegrity: number
  cathedralWindowCount: number
  beautifulPanelCount: number
  properWindowCount: number
  crackedGlassCount: number
  shatteredPaneCount: number
  noGlassCount: number
  hasHighHarmonyCount: number
  hasHighQualityCount: number
  hasHighClarityCount: number
  hasHighCoherenceCount: number
  hasHighIntegrityCount: number
  overallBrilliance: number
  artisanGrade: ArtisanGrade
  bestPane: string
  mostHarmonious: string
  bestBound: string
  mostTransparent: string
  mostCoherent: string
}

/** Full result */
export interface StainedGlassResult {
  panes: GlassPane[]
  workshops: GlassWorkshop[]
  cathedral: CathedralSummary
  stats: StainedGlassStats
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
 * Measure color harmony (style consistency)
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.grade) // 'symphony-colors'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasConsistent = hasExport(content) && hasImport(content)
  const hasMatching = hasInterface(content) && hasClass(content)
  const hasUnified = hasGenerics(content) && hasTypeAlias(content)
  const hasHarmonious = hasConst(content) && hasReturnType(content)
  const hasCoherent = hasDocComments(content) && hasExport(content)
  const hasBlended = hasAsync(content) && hasInterface(content)

  score += hasConsistent ? 5 : 0
  score += hasMatching ? 5 : 0
  score += hasUnified ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasBlended ? 5 : 0

  const harmony = Math.min(score, 100)
  const clashingCount = count(/\bvar\b/, content)
  const discordantCount = count(/\bany\b/, content)

  const hasNoClashing = clashingCount === 0
  const hasNoDiscordant = discordantCount === 0
  const hasNoMismatched = !has(/\beval\b/, content)
  const hasNoConflicting = !has(/\bdebugger\b/, content)
  const hasHighHarmony = harmony >= 70

  let grade: HarmonyGrade
  if (harmony >= 85) grade = 'symphony-colors'
  else if (harmony >= 70) grade = 'harmonious-palette'
  else if (harmony >= 55) grade = 'proper-matching'
  else if (harmony >= 40) grade = 'clashing-colors'
  else if (harmony >= 25) grade = 'random-palette'
  else grade = 'monochrome-drab'

  return {
    harmony, grade, hasHighHarmony, hasConsistent, hasMatching, hasNoClashing,
    hasUnified, hasNoDiscordant, hasHarmonious, hasNoMismatched, hasCoherent,
    hasNoConflicting, hasBlended, clashingCount, discordantCount,
  }
}

/**
 * Measure lead quality (binding quality)
 * @example
 * const m = measureBinding(content)
 * console.log(m.lead) // 'pure-lead'
 */
export function measureBinding(content: string): BindingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasConnected = hasInterface(content) && hasClass(content)
  const hasJoined = hasExport(content) && hasImport(content)
  const hasBound = hasGenerics(content) && hasTypeAlias(content)
  const hasIntegrated = hasConst(content) && hasReturnType(content)
  const hasCoupled = hasNamedExport(content) && hasExport(content)
  const hasLinked = hasDocComments(content) && hasInterface(content)

  score += hasConnected ? 5 : 0
  score += hasJoined ? 5 : 0
  score += hasBound ? 5 : 0
  score += hasIntegrated ? 5 : 0
  score += hasCoupled ? 5 : 0
  score += hasLinked ? 5 : 0

  const quality = Math.min(score, 100)
  const separatedCount = count(/\bvar\b/, content)
  const looseCount = count(/\bany\b/, content)

  const hasNoSeparated = separatedCount === 0
  const hasNoLoose = looseCount === 0
  const hasNoFragmented = !has(/\beval\b/, content)
  const hasNoUncoupled = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let lead: LeadGrade
  if (quality >= 85) lead = 'pure-lead'
  else if (quality >= 70) lead = 'strong-came'
  else if (quality >= 55) lead = 'proper-binding'
  else if (quality >= 40) lead = 'weak-joint'
  else if (quality >= 25) lead = 'cracked-lead'
  else lead = 'no-binding'

  return {
    quality, lead, hasHighQuality, hasConnected, hasJoined, hasNoSeparated,
    hasBound, hasNoLoose, hasIntegrated, hasNoFragmented, hasCoupled,
    hasNoUncoupled, hasLinked, separatedCount, looseCount,
  }
}

/**
 * Measure light transmission (transparency)
 * @example
 * const m = measureTransmitting(content)
 * console.log(m.light) // 'crystal-clear'
 */
export function measureTransmitting(content: string): TransmittingMeasure {
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

  const hasTransparent = hasReturnType(content) && hasStrictEq(content)
  const hasRevealing = hasReadonly(content) && hasPrivate(content)
  const hasClear = hasDocComments(content) && hasInterface(content)
  const hasVisible = hasGenerics(content) && hasExport(content)
  const hasOpen = hasAsync(content) && hasReturnType(content)
  const hasLuminous = hasStrictEq(content) && hasClass(content)

  score += hasTransparent ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasOpen ? 5 : 0
  score += hasLuminous ? 5 : 0

  const clarity = Math.min(score, 100)
  const hiddenCount = count(/\bvar\b/, content)
  const opaqueCount = count(/\bany\b/, content)

  const hasNoHidden = hiddenCount === 0
  const hasNoOpaque = opaqueCount === 0
  const hasNoObscured = !has(/\beval\b/, content)
  const hasNoConcealed = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let light: LightGrade
  if (clarity >= 85) light = 'crystal-clear'
  else if (clarity >= 70) light = 'bright-transmission'
  else if (clarity >= 55) light = 'proper-light'
  else if (clarity >= 40) light = 'tinted-glass'
  else if (clarity >= 25) light = 'frosted'
  else light = 'opaque'

  return {
    clarity, light, hasHighClarity, hasTransparent, hasRevealing, hasNoHidden,
    hasClear, hasNoOpaque, hasVisible, hasNoObscured, hasOpen,
    hasNoConcealed, hasLuminous, hiddenCount, opaqueCount,
  }
}

/**
 * Measure pattern coherence (logical flow)
 * @example
 * const m = measurePatterning(content)
 * console.log(m.pattern) // 'masterwork-design'
 */
export function measurePatterning(content: string): PatterningMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasLogical = hasInterface(content) && hasClass(content)
  const hasFlowing = hasPrivate(content) && hasReadonly(content)
  const hasStructured = hasExport(content) && hasImport(content)
  const hasOrganized = hasGenerics(content) && hasTypeAlias(content)
  const hasCoherent = hasConst(content) && hasExport(content)
  const hasOrdered = hasNamedExport(content) && hasInterface(content)

  score += hasLogical ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasOrdered ? 5 : 0

  const coherence = Math.min(score, 100)
  const chaoticCount = count(/\bvar\b/, content)
  const scatteredCount = count(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoRandom = scatteredCount === 0
  const hasNoScattered = !has(/\beval\b/, content)
  const hasNoDisjointed = !has(/\bdebugger\b/, content)
  const hasHighCoherence = coherence >= 70

  let pattern: PatternGrade
  if (coherence >= 85) pattern = 'masterwork-design'
  else if (coherence >= 70) pattern = 'beautiful-mosaic'
  else if (coherence >= 55) pattern = 'proper-pattern'
  else if (coherence >= 40) pattern = 'random-tiles'
  else if (coherence >= 25) pattern = 'broken-pattern'
  else pattern = 'no-pattern'

  return {
    coherence, pattern, hasHighCoherence, hasLogical, hasFlowing, hasNoChaotic,
    hasStructured, hasNoRandom, hasOrganized, hasNoScattered, hasCoherent,
    hasNoDisjointed, hasOrdered, chaoticCount, scatteredCount,
  }
}

/**
 * Measure structural integrity (framework strength)
 * @example
 * const m = measureStructuring(content)
 * console.log(m.frame) // 'iron-frame'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasSolid = hasClass(content) && hasInterface(content)
  const hasRobust = hasExport(content) && hasImport(content)
  const hasStable = hasGenerics(content) && hasTypeAlias(content)
  const hasStrong = hasReadonly(content) && hasPrivate(content)
  const hasSound = hasDocComments(content) && hasReturnType(content)
  const hasSecure = hasClass(content) && hasGenerics(content)

  score += hasSolid ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasStrong ? 5 : 0
  score += hasSound ? 5 : 0
  score += hasSecure ? 5 : 0

  const integrity = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const unstableCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoUnstable = unstableCount === 0
  const hasNoBroken = !has(/\beval\b/, content)
  const hasNoWeak = !has(/\bdebugger\b/, content)
  const hasHighIntegrity = integrity >= 70

  let frame: FrameGrade
  if (integrity >= 85) frame = 'iron-frame'
  else if (integrity >= 70) frame = 'strong-armature'
  else if (integrity >= 55) frame = 'proper-support'
  else if (integrity >= 40) frame = 'weak-frame'
  else if (integrity >= 25) frame = 'buckling'
  else frame = 'no-frame'

  return {
    integrity, frame, hasHighIntegrity, hasSolid, hasRobust, hasNoFragile,
    hasStable, hasNoUnstable, hasStrong, hasNoWeak, hasSound,
    hasNoBroken, hasSecure, fragileCount, unstableCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify pane condition
 * @example
 * classifyPaneCondition(90) // 'cathedral-window'
 */
export function classifyPaneCondition(score: number): PaneCondition {
  if (score >= 85) return 'cathedral-window'
  if (score >= 70) return 'beautiful-panel'
  if (score >= 55) return 'proper-window'
  if (score >= 40) return 'cracked-glass'
  if (score >= 25) return 'shattered-pane'
  return 'no-glass'
}

/**
 * Classify workshop type
 * @example
 * classifyWorkshopType(panes) // 'cathedral-studio'
 */
export function classifyWorkshopType(panes: GlassPane[]): WorkshopType {
  if (panes.length === 0) return 'no-studio'
  const avgQs = Math.round(panes.reduce((s, p) => s + p.qualityScore, 0) / panes.length)
  const cathedralRatio = panes.filter(p => p.condition === 'cathedral-window').length / panes.length
  if (avgQs >= 75 && cathedralRatio >= 0.5) return 'cathedral-studio'
  if (avgQs >= 60) return 'glass-atelier'
  if (avgQs >= 45) return 'proper-workshop'
  if (avgQs >= 30) return 'home-studio'
  if (avgQs >= 15) return 'craft-table'
  return 'no-studio'
}

/**
 * Classify artisan grade
 * @example
 * classifyArtisanGrade(85) // 'master-glazier'
 */
export function classifyArtisanGrade(avgBrilliance: number): ArtisanGrade {
  if (avgBrilliance >= 80) return 'master-glazier'
  if (avgBrilliance >= 65) return 'stained-glass-artist'
  if (avgBrilliance >= 50) return 'skilled-craftsman'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'window-shopper'
}

/**
 * Classify workshop condition
 * @example
 * classifyWorkshopCondition(80) // 'masterwork-collection'
 */
export function classifyWorkshopCondition(avgQs: number): WorkshopCondition {
  if (avgQs >= 75) return 'masterwork-collection'
  if (avgQs >= 60) return 'beautiful-display'
  if (avgQs >= 45) return 'decent-gallery'
  if (avgQs >= 30) return 'cracked-display'
  if (avgQs >= 15) return 'broken-pieces'
  return 'empty'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(panes, workshops, cathedral, stats)
 */
export function generateRecommendations(
  panes: GlassPane[],
  workshops: GlassWorkshop[],
  cathedral: CathedralSummary,
  stats: StainedGlassStats,
): string[] {
  const recs: string[] = []
  if (stats.avgColorHarmony < 50) {
    recs.push('Harmonize colors with consistent exports, matching interfaces, and unified type patterns')
  }
  if (stats.avgLeadQuality < 50) {
    recs.push('Strengthen lead bindings with connected interfaces, joined exports, and integrated modules')
  }
  if (stats.avgLightTransmission < 50) {
    recs.push('Improve light transmission with transparent return types, clear documentation, and visible patterns')
  }
  if (stats.avgPatternCoherence < 50) {
    recs.push('Coherence patterns with logical interfaces, flowing visibility, and structured organization')
  }
  if (stats.avgStructuralIntegrity < 50) {
    recs.push('Reinforce structure with solid classes, robust exports, and stable generic types')
  }
  if (stats.noGlassCount > 0) {
    recs.push(`${stats.noGlassCount} file(s) have no glass — consider significant refactoring`)
  }
  if (cathedral.overallBrilliance < 40) {
    recs.push('Overall stained glass brilliance is poor — focus on color harmony and lead quality first')
  }
  const allEmpty = workshops.every(w => w.workshopType === 'no-studio' || w.workshopType === 'craft-table')
  if (allEmpty && workshops.length > 0) {
    recs.push('All workshops are empty or craft-tables — consider a major quality overhaul')
  }
  const noGlass = panes.filter(p => p.condition === 'no-glass').map(p => p.file)
  if (noGlass.length > 0 && noGlass.length <= 3) {
    recs.push(`Restore these no-glass files into panes: ${noGlass.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your stained glass masterpiece is complete! Every pane shimmers with color, light, and structural perfection')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a glass pane
 * @example
 * const pane = analyzeGlassPane(content, 'index.ts')
 * console.log(pane.condition) // 'cathedral-window'
 */
export function analyzeGlassPane(content: string, filePath: string): GlassPane {
  const harmonizing = measureHarmonizing(content)
  const binding = measureBinding(content)
  const transmitting = measureTransmitting(content)
  const patterning = measurePatterning(content)
  const structuring = measureStructuring(content)

  const qualityScore = Math.round(
    harmonizing.harmony * 0.2 +
    binding.quality * 0.2 +
    transmitting.clarity * 0.2 +
    patterning.coherence * 0.2 +
    structuring.integrity * 0.2,
  )

  return {
    file: filePath,
    colorHarmony: harmonizing.harmony,
    leadQuality: binding.quality,
    lightTransmission: transmitting.clarity,
    patternCoherence: patterning.coherence,
    structuralIntegrity: structuring.integrity,
    harmonizing,
    binding,
    transmitting,
    patterning,
    structuring,
    condition: classifyPaneCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a glass workshop
 * @example
 * const workshop = analyzeGlassWorkshop(panes, 'src')
 * console.log(workshop.workshopType) // 'cathedral-studio'
 */
export function analyzeGlassWorkshop(panes: GlassPane[], dirPath: string): GlassWorkshop {
  if (panes.length === 0) {
    return {
      directory: dirPath, panes: [], avgHarmony: 0, avgBinding: 0, avgIntegrity: 0,
      cathedralWindowCount: 0, noGlassCount: 0, workshopType: 'no-studio', condition: 'empty',
    }
  }

  const avgHarmony = Math.round(panes.reduce((s, p) => s + p.colorHarmony, 0) / panes.length)
  const avgBinding = Math.round(panes.reduce((s, p) => s + p.leadQuality, 0) / panes.length)
  const avgIntegrity = Math.round(panes.reduce((s, p) => s + p.structuralIntegrity, 0) / panes.length)
  const cathedralWindowCount = panes.filter(p => p.condition === 'cathedral-window').length
  const noGlassCount = panes.filter(p => p.condition === 'no-glass').length
  const avgQs = Math.round(panes.reduce((s, p) => s + p.qualityScore, 0) / panes.length)

  return {
    directory: dirPath, panes, avgHarmony, avgBinding, avgIntegrity,
    cathedralWindowCount, noGlassCount, workshopType: classifyWorkshopType(panes),
    condition: classifyWorkshopCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete stained glass result
 * @example
 * const result = await buildStainedGlassResult(files, contents)
 * console.log(result.stats.artisanGrade) // 'master-glazier'
 */
export async function buildStainedGlassResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StainedGlassResult> {
  const panes = files.map((file, i) => analyzeGlassPane(contents[i] ?? '', file))

  const dirMap = new Map<string, GlassPane[]>()
  for (const pane of panes) {
    const dir = path.dirname(pane.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(pane) } else { dirMap.set(dir, [pane]) }
  }

  const workshops = Array.from(dirMap.entries()).map(([dir, dirPanes]) =>
    analyzeGlassWorkshop(dirPanes, dir),
  )

  const avgHarmony = panes.length > 0
    ? Math.round(panes.reduce((s, p) => s + p.colorHarmony, 0) / panes.length) : 0
  const avgBinding = panes.length > 0
    ? Math.round(panes.reduce((s, p) => s + p.leadQuality, 0) / panes.length) : 0
  const avgIntegrity = panes.length > 0
    ? Math.round(panes.reduce((s, p) => s + p.structuralIntegrity, 0) / panes.length) : 0

  const overallBrilliance = panes.length > 0
    ? Math.round((avgHarmony + avgBinding + avgIntegrity) / 3) : 0
  const isLuminous = avgHarmony >= 60

  const cathedral: CathedralSummary = { avgHarmony, avgBinding, avgIntegrity, isLuminous, overallBrilliance }

  const avgColorHarmony = avgHarmony
  const avgLeadQuality = avgBinding
  const avgStructuralIntegrity = avgIntegrity
  const avgLightTransmission = panes.length > 0
    ? Math.round(panes.reduce((s, p) => s + p.lightTransmission, 0) / panes.length) : 0
  const avgPatternCoherence = panes.length > 0
    ? Math.round(panes.reduce((s, p) => s + p.patternCoherence, 0) / panes.length) : 0

  const bestPane = panes.length > 0
    ? panes.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const mostHarmonious = panes.length > 0
    ? panes.reduce((best, p) => p.colorHarmony > best.colorHarmony ? p : best).file : ''
  const bestBound = panes.length > 0
    ? panes.reduce((best, p) => p.leadQuality > best.leadQuality ? p : best).file : ''
  const mostTransparent = panes.length > 0
    ? panes.reduce((best, p) => p.lightTransmission > best.lightTransmission ? p : best).file : ''
  const mostCoherent = panes.length > 0
    ? panes.reduce((best, p) => p.patternCoherence > best.patternCoherence ? p : best).file : ''

  const stats: StainedGlassStats = {
    totalFiles: panes.length,
    totalWorkshops: workshops.length,
    avgColorHarmony,
    avgLeadQuality,
    avgLightTransmission,
    avgPatternCoherence,
    avgStructuralIntegrity,
    cathedralWindowCount: panes.filter(p => p.condition === 'cathedral-window').length,
    beautifulPanelCount: panes.filter(p => p.condition === 'beautiful-panel').length,
    properWindowCount: panes.filter(p => p.condition === 'proper-window').length,
    crackedGlassCount: panes.filter(p => p.condition === 'cracked-glass').length,
    shatteredPaneCount: panes.filter(p => p.condition === 'shattered-pane').length,
    noGlassCount: panes.filter(p => p.condition === 'no-glass').length,
    hasHighHarmonyCount: panes.filter(p => p.harmonizing.hasHighHarmony).length,
    hasHighQualityCount: panes.filter(p => p.binding.hasHighQuality).length,
    hasHighClarityCount: panes.filter(p => p.transmitting.hasHighClarity).length,
    hasHighCoherenceCount: panes.filter(p => p.patterning.hasHighCoherence).length,
    hasHighIntegrityCount: panes.filter(p => p.structuring.hasHighIntegrity).length,
    overallBrilliance,
    artisanGrade: classifyArtisanGrade(overallBrilliance),
    bestPane, mostHarmonious, bestBound, mostTransparent, mostCoherent,
  }

  const recommendations = generateRecommendations(panes, workshops, cathedral, stats)

  return { panes, workshops, cathedral, stats, recommendations }
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
