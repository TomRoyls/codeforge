// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Luminosity grade */
export type LuminosityGrade =
  | 'brilliant-aurora'
  | 'bright-curtain'
  | 'proper-glow'
  | 'dim-light'
  | 'faint-shimmer'
  | 'dark-sky'

/** Spectrum grade */
export type SpectrumGrade =
  | 'full-spectrum'
  | 'rich-palette'
  | 'proper-colors'
  | 'limited-palette'
  | 'monochrome'
  | 'colorless'

/** Magnetic field grade */
export type FieldGrade =
  | 'true-north'
  | 'strong-field'
  | 'proper-alignment'
  | 'weak-field'
  | 'misaligned'
  | 'no-field'

/** Dance grade */
export type DanceGrade =
  | 'graceful-waltz'
  | 'flowing-ballet'
  | 'proper-rhythm'
  | 'stiff-march'
  | 'awkward-stumble'
  | 'static'

/** Cosmic harmony grade */
export type CosmicGrade =
  | 'symphony'
  | 'harmonic-convergence'
  | 'proper-harmony'
  | 'slight-dissonance'
  | 'cacophony'
  | 'chaos'

/** Curtain condition */
export type CurtainCondition =
  | 'northern-lights'
  | 'bright-aurora'
  | 'proper-curtain'
  | 'faint-glow'
  | 'twilight'
  | 'dark-night'

/** Belt type */
export type BeltType =
  | 'polar-belt'
  | 'auroral-zone'
  | 'sub-auroral'
  | 'mid-latitude'
  | 'tropical'
  | 'equatorial'

/** Belt condition */
export type BeltCondition =
  | 'spectacular-display'
  | 'beautiful-show'
  | 'decent-display'
  | 'faint-glow-belt'
  | 'barely-visible'
  | 'invisible'

/** Astronomer grade */
export type AstronomerGrade =
  | 'chief-astronomer'
  | 'aurora-hunter'
  | 'northern-lighter'
  | 'sky-watcher'
  | 'stargazer'
  | 'cave-dweller'

/** Shining measurement */
export interface ShiningMeasure {
  luminosity: number
  grade: LuminosityGrade
  hasHighLuminosity: boolean
  hasBright: boolean
  hasClear: boolean
  hasNoDark: boolean
  hasRadiant: boolean
  hasNoDim: boolean
  hasGlowing: boolean
  hasNoMurky: boolean
  hasLuminous: boolean
  hasNoObscure: boolean
  hasShining: boolean
  darkCount: number
  dimCount: number
}

/** Enriching measurement */
export interface EnrichingMeasure {
  richness: number
  spectrum: SpectrumGrade
  hasHighRichness: boolean
  hasDiverse: boolean
  hasVaried: boolean
  hasNoUniform: boolean
  hasColorful: boolean
  hasNoDrab: boolean
  hasRich: boolean
  hasNoSparse: boolean
  hasVibrant: boolean
  hasNoFlat: boolean
  hasMultifaceted: boolean
  uniformCount: number
  drabCount: number
}

/** Aligning measurement */
export interface AligningMeasure {
  alignment: number
  field: FieldGrade
  hasHighAlignment: boolean
  hasConsistent: boolean
  hasPrincipled: boolean
  hasNoContradictory: boolean
  hasAligned: boolean
  hasNoConflicting: boolean
  hasCoherent: boolean
  hasNoIncoherent: boolean
  hasHarmonious: boolean
  hasNoClashing: boolean
  hasUnited: boolean
  contradictoryCount: number
  conflictingCount: number
}

/** Dancing measurement */
export interface DancingMeasure {
  quality: number
  dance: DanceGrade
  hasHighQuality: boolean
  hasGraceful: boolean
  hasFlowing: boolean
  hasNoJerky: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasSmooth: boolean
  hasNoRough: boolean
  hasFluid: boolean
  hasNoRigid: boolean
  hasHarmonious2: boolean
  jerkyCount: number
  clunkyCount: number
}

/** Harmonizing measurement */
export interface HarmonizingMeasure {
  harmony: number
  cosmic: CosmicGrade
  hasHighHarmony: boolean
  hasBalanced: boolean
  hasIntegrated: boolean
  hasNoFragmented: boolean
  hasUnified: boolean
  hasNoScattered: boolean
  hasCohesive: boolean
  hasNoDisjoint: boolean
  hasWhole: boolean
  hasNoBroken: boolean
  hasComplete: boolean
  fragmentedCount: number
  scatteredCount: number
}

/** Single file analysis */
export interface AuroraCurtain {
  file: string
  luminosity: number
  spectralRichness: number
  magneticAlignment: number
  danceQuality: number
  cosmicHarmony: number
  shining: ShiningMeasure
  enriching: EnrichingMeasure
  aligning: AligningMeasure
  dancing: DancingMeasure
  harmonizing: HarmonizingMeasure
  condition: CurtainCondition
  qualityScore: number
}

/** Directory-level belt */
export interface AuroraBelt {
  directory: string
  curtains: AuroraCurtain[]
  avgLuminosity: number
  avgAlignment: number
  avgHarmony: number
  northernLightsCount: number
  darkNightCount: number
  beltType: BeltType
  condition: BeltCondition
}

/** Sky summary */
export interface SkySummary {
  avgLuminosity: number
  avgAlignment: number
  avgHarmony: number
  isLuminous: boolean
  overallRadiance: number
}

/** Full stats */
export interface AuroraBorealisStats {
  totalFiles: number
  totalBelts: number
  avgLuminosity: number
  avgSpectralRichness: number
  avgMagneticAlignment: number
  avgDanceQuality: number
  avgCosmicHarmony: number
  northernLightsCount: number
  brightAuroraCount: number
  properCurtainCount: number
  faintGlowCount: number
  twilightCount: number
  darkNightCount: number
  hasHighLuminosityCount: number
  hasHighRichnessCount: number
  hasHighAlignmentCount: number
  hasHighQualityCount: number
  hasHighHarmonyCount: number
  overallRadiance: number
  astronomerGrade: AstronomerGrade
  bestCurtain: string
  brightest: string
  mostColorful: string
  mostAligned: string
  mostGraceful: string
}

/** Full result */
export interface AuroraBorealisResult {
  curtains: AuroraCurtain[]
  belts: AuroraBelt[]
  sky: SkySummary
  stats: AuroraBorealisStats
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
 * Measure luminosity
 * @example
 * const m = measureShining(content)
 * console.log(m.grade) // 'brilliant-aurora'
 */
export function measureShining(content: string): ShiningMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasBright = hasDocComments(content) && hasExport(content)
  const hasClear = hasReturnType(content) && hasInterface(content)
  const hasRadiant = hasNamedExport(content) && hasGenerics(content)
  const hasGlowing = hasClass(content) && hasTypeAlias(content)
  const hasLuminous = hasAsync(content) && hasExport(content)
  const hasShining = hasDocComments(content) && hasReturnType(content)

  score += hasBright ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasRadiant ? 5 : 0
  score += hasGlowing ? 5 : 0
  score += hasLuminous ? 5 : 0
  score += hasShining ? 5 : 0

  const luminosity = Math.min(score, 100)
  const darkCount = count(/\bvar\b/, content)
  const dimCount = count(/\bany\b/, content)

  const hasNoDark = darkCount === 0
  const hasNoDim = dimCount === 0
  const hasNoMurky = !has(/\beval\b/, content)
  const hasNoObscure = !has(/\bdebugger\b/, content)
  const hasHighLuminosity = luminosity >= 70

  let grade: LuminosityGrade
  if (luminosity >= 85) grade = 'brilliant-aurora'
  else if (luminosity >= 70) grade = 'bright-curtain'
  else if (luminosity >= 55) grade = 'proper-glow'
  else if (luminosity >= 40) grade = 'dim-light'
  else if (luminosity >= 25) grade = 'faint-shimmer'
  else grade = 'dark-sky'

  return {
    luminosity, grade, hasHighLuminosity, hasBright, hasClear, hasNoDark,
    hasRadiant, hasNoDim, hasGlowing, hasNoMurky, hasLuminous,
    hasNoObscure, hasShining, darkCount, dimCount,
  }
}

/**
 * Measure spectral richness
 * @example
 * const m = measureEnriching(content)
 * console.log(m.spectrum) // 'full-spectrum'
 */
export function measureEnriching(content: string): EnrichingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasDiverse = hasExport(content) && hasImport(content)
  const hasVaried = hasInterface(content) && hasClass(content)
  const hasColorful = hasGenerics(content) && hasTypeAlias(content)
  const hasRich = hasNamedExport(content) && hasConst(content)
  const hasVibrant = hasAsync(content) && hasDocComments(content)
  const hasMultifaceted = hasExport(content) && hasGenerics(content)

  score += hasDiverse ? 5 : 0
  score += hasVaried ? 5 : 0
  score += hasColorful ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasVibrant ? 5 : 0
  score += hasMultifaceted ? 5 : 0

  const richness = Math.min(score, 100)
  const uniformCount = count(/\bvar\b/, content)
  const drabCount = count(/\bany\b/, content)

  const hasNoUniform = uniformCount === 0
  const hasNoDrab = drabCount === 0
  const hasNoSparse = !has(/\beval\b/, content)
  const hasNoFlat = !has(/\bdebugger\b/, content)
  const hasHighRichness = richness >= 70

  let spectrum: SpectrumGrade
  if (richness >= 85) spectrum = 'full-spectrum'
  else if (richness >= 70) spectrum = 'rich-palette'
  else if (richness >= 55) spectrum = 'proper-colors'
  else if (richness >= 40) spectrum = 'limited-palette'
  else if (richness >= 25) spectrum = 'monochrome'
  else spectrum = 'colorless'

  return {
    richness, spectrum, hasHighRichness, hasDiverse, hasVaried, hasNoUniform,
    hasColorful, hasNoDrab, hasRich, hasNoSparse, hasVibrant,
    hasNoFlat, hasMultifaceted, uniformCount, drabCount,
  }
}

/**
 * Measure magnetic alignment
 * @example
 * const m = measureAligning(content)
 * console.log(m.field) // 'true-north'
 */
export function measureAligning(content: string): AligningMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasConsistent = hasConst(content) && hasReadonly(content)
  const hasPrincipled = hasStrictEq(content) && hasReturnType(content)
  const hasAligned = hasPrivate(content) && hasInterface(content)
  const hasCoherent = hasGenerics(content) && hasClass(content)
  const hasHarmonious = hasExport(content) && hasDocComments(content)
  const hasUnited = hasConst(content) && hasStrictEq(content)

  score += hasConsistent ? 5 : 0
  score += hasPrincipled ? 5 : 0
  score += hasAligned ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasUnited ? 5 : 0

  const alignment = Math.min(score, 100)
  const contradictoryCount = count(/\bvar\b/, content)
  const conflictingCount = count(/\bany\b/, content)

  const hasNoContradictory = contradictoryCount === 0
  const hasNoConflicting = conflictingCount === 0
  const hasNoIncoherent = !has(/\beval\b/, content)
  const hasNoClashing = !has(/\bdebugger\b/, content)
  const hasHighAlignment = alignment >= 70

  let field: FieldGrade
  if (alignment >= 85) field = 'true-north'
  else if (alignment >= 70) field = 'strong-field'
  else if (alignment >= 55) field = 'proper-alignment'
  else if (alignment >= 40) field = 'weak-field'
  else if (alignment >= 25) field = 'misaligned'
  else field = 'no-field'

  return {
    alignment, field, hasHighAlignment, hasConsistent, hasPrincipled, hasNoContradictory,
    hasAligned, hasNoConflicting, hasCoherent, hasNoIncoherent, hasHarmonious,
    hasNoClashing, hasUnited, contradictoryCount, conflictingCount,
  }
}

/**
 * Measure dance quality
 * @example
 * const m = measureDancing(content)
 * console.log(m.dance) // 'graceful-waltz'
 */
export function measureDancing(content: string): DancingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasGraceful = hasReturnType(content) && hasAsync(content)
  const hasFlowing = hasDocComments(content) && hasInterface(content)
  const hasElegant = hasExport(content) && hasConst(content)
  const hasSmooth = hasGenerics(content) && hasNamedExport(content)
  const hasFluid = hasClass(content) && hasAsync(content)
  const hasHarmonious2 = hasDocComments(content) && hasReturnType(content)

  score += hasGraceful ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasFluid ? 5 : 0
  score += hasHarmonious2 ? 5 : 0

  const quality = Math.min(score, 100)
  const jerkyCount = count(/\bvar\b/, content)
  const clunkyCount = count(/\bany\b/, content)

  const hasNoJerky = jerkyCount === 0
  const hasNoClunky = clunkyCount === 0
  const hasNoRough = !has(/\beval\b/, content)
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let dance: DanceGrade
  if (quality >= 85) dance = 'graceful-waltz'
  else if (quality >= 70) dance = 'flowing-ballet'
  else if (quality >= 55) dance = 'proper-rhythm'
  else if (quality >= 40) dance = 'stiff-march'
  else if (quality >= 25) dance = 'awkward-stumble'
  else dance = 'static'

  return {
    quality, dance, hasHighQuality, hasGraceful, hasFlowing, hasNoJerky,
    hasElegant, hasNoClunky, hasSmooth, hasNoRough, hasFluid,
    hasNoRigid, hasHarmonious2, jerkyCount, clunkyCount,
  }
}

/**
 * Measure cosmic harmony
 * @example
 * const m = measureHarmonizing(content)
 * console.log(m.cosmic) // 'symphony'
 */
export function measureHarmonizing(content: string): HarmonizingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasBalanced = hasExport(content) && hasImport(content)
  const hasIntegrated = hasInterface(content) && hasClass(content)
  const hasUnified = hasDocComments(content) && hasReturnType(content)
  const hasCohesive = hasGenerics(content) && hasConst(content)
  const hasWhole = hasAsync(content) && hasExport(content)
  const hasComplete = hasReadonly(content) && hasInterface(content)

  score += hasBalanced ? 5 : 0
  score += hasIntegrated ? 5 : 0
  score += hasUnified ? 5 : 0
  score += hasCohesive ? 5 : 0
  score += hasWhole ? 5 : 0
  score += hasComplete ? 5 : 0

  const harmony = Math.min(score, 100)
  const fragmentedCount = count(/\bvar\b/, content)
  const scatteredCount = count(/\bany\b/, content)

  const hasNoFragmented = fragmentedCount === 0
  const hasNoScattered = scatteredCount === 0
  const hasNoDisjoint = !has(/\beval\b/, content)
  const hasNoBroken = !has(/\bdebugger\b/, content)
  const hasHighHarmony = harmony >= 70

  let cosmic: CosmicGrade
  if (harmony >= 85) cosmic = 'symphony'
  else if (harmony >= 70) cosmic = 'harmonic-convergence'
  else if (harmony >= 55) cosmic = 'proper-harmony'
  else if (harmony >= 40) cosmic = 'slight-dissonance'
  else if (harmony >= 25) cosmic = 'cacophony'
  else cosmic = 'chaos'

  return {
    harmony, cosmic, hasHighHarmony, hasBalanced, hasIntegrated, hasNoFragmented,
    hasUnified, hasNoScattered, hasCohesive, hasNoDisjoint, hasWhole,
    hasNoBroken, hasComplete, fragmentedCount, scatteredCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify curtain condition
 * @example
 * classifyCurtainCondition(90) // 'northern-lights'
 */
export function classifyCurtainCondition(score: number): CurtainCondition {
  if (score >= 85) return 'northern-lights'
  if (score >= 70) return 'bright-aurora'
  if (score >= 55) return 'proper-curtain'
  if (score >= 40) return 'faint-glow'
  if (score >= 25) return 'twilight'
  return 'dark-night'
}

/**
 * Classify belt type
 * @example
 * classifyBeltType(curtains) // 'polar-belt'
 */
export function classifyBeltType(curtains: AuroraCurtain[]): BeltType {
  if (curtains.length === 0) return 'equatorial'
  const avgQs = Math.round(curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length)
  const northernRatio = curtains.filter(c => c.condition === 'northern-lights').length / curtains.length
  if (avgQs >= 75 && northernRatio >= 0.5) return 'polar-belt'
  if (avgQs >= 60) return 'auroral-zone'
  if (avgQs >= 45) return 'sub-auroral'
  if (avgQs >= 30) return 'mid-latitude'
  if (avgQs >= 15) return 'tropical'
  return 'equatorial'
}

/**
 * Classify astronomer grade
 * @example
 * classifyAstronomerGrade(85) // 'chief-astronomer'
 */
export function classifyAstronomerGrade(avgRadiance: number): AstronomerGrade {
  if (avgRadiance >= 80) return 'chief-astronomer'
  if (avgRadiance >= 65) return 'aurora-hunter'
  if (avgRadiance >= 50) return 'northern-lighter'
  if (avgRadiance >= 35) return 'sky-watcher'
  if (avgRadiance >= 20) return 'stargazer'
  return 'cave-dweller'
}

/**
 * Classify belt condition
 * @example
 * classifyBeltCondition(80) // 'spectacular-display'
 */
export function classifyBeltCondition(avgQs: number): BeltCondition {
  if (avgQs >= 75) return 'spectacular-display'
  if (avgQs >= 60) return 'beautiful-show'
  if (avgQs >= 45) return 'decent-display'
  if (avgQs >= 30) return 'faint-glow-belt'
  if (avgQs >= 15) return 'barely-visible'
  return 'invisible'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(curtains, belts, sky, stats)
 */
export function generateRecommendations(
  curtains: AuroraCurtain[],
  belts: AuroraBelt[],
  sky: SkySummary,
  stats: AuroraBorealisStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLuminosity < 50) {
    recs.push('Brighten luminosity with clear documentation, bright exports, and radiant type signatures')
  }
  if (stats.avgSpectralRichness < 50) {
    recs.push('Enrich spectral variety with diverse imports/exports, colorful generics, and vibrant patterns')
  }
  if (stats.avgMagneticAlignment < 50) {
    recs.push('Strengthen magnetic alignment with consistent const usage, principled equality, and coherent types')
  }
  if (stats.avgDanceQuality < 50) {
    recs.push('Improve dance quality with graceful async patterns, flowing documentation, and elegant exports')
  }
  if (stats.avgCosmicHarmony < 50) {
    recs.push('Harmonize cosmic balance with integrated interfaces, unified types, and cohesive async patterns')
  }
  if (stats.darkNightCount > 0) {
    recs.push(`${stats.darkNightCount} file(s) are dark night — consider significant refactoring`)
  }
  if (sky.overallRadiance < 40) {
    recs.push('Overall sky radiance is poor — focus on luminosity and spectral richness first')
  }
  const allEquatorial = belts.every(b => b.beltType === 'equatorial' || b.beltType === 'tropical')
  if (allEquatorial && belts.length > 0) {
    recs.push('All aurora belts are faint or absent — consider a major quality overhaul')
  }
  const dark = curtains.filter(c => c.condition === 'dark-night').map(c => c.file)
  if (dark.length > 0 && dark.length <= 3) {
    recs.push(`Illuminate these dark-night files: ${dark.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your aurora borealis dances brilliantly across the sky! Every curtain shimmers with cosmic beauty')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as an aurora curtain
 * @example
 * const curtain = analyzeAuroraCurtain(content, 'index.ts')
 * console.log(curtain.condition) // 'northern-lights'
 */
export function analyzeAuroraCurtain(content: string, filePath: string): AuroraCurtain {
  const shining = measureShining(content)
  const enriching = measureEnriching(content)
  const aligning = measureAligning(content)
  const dancing = measureDancing(content)
  const harmonizing = measureHarmonizing(content)

  const qualityScore = Math.round(
    shining.luminosity * 0.2 +
    enriching.richness * 0.2 +
    aligning.alignment * 0.2 +
    dancing.quality * 0.2 +
    harmonizing.harmony * 0.2,
  )

  return {
    file: filePath,
    luminosity: shining.luminosity,
    spectralRichness: enriching.richness,
    magneticAlignment: aligning.alignment,
    danceQuality: dancing.quality,
    cosmicHarmony: harmonizing.harmony,
    shining,
    enriching,
    aligning,
    dancing,
    harmonizing,
    condition: classifyCurtainCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as an aurora belt
 * @example
 * const belt = analyzeAuroraBelt(curtains, 'src')
 * console.log(belt.beltType) // 'polar-belt'
 */
export function analyzeAuroraBelt(curtains: AuroraCurtain[], dirPath: string): AuroraBelt {
  if (curtains.length === 0) {
    return {
      directory: dirPath, curtains: [], avgLuminosity: 0, avgAlignment: 0, avgHarmony: 0,
      northernLightsCount: 0, darkNightCount: 0, beltType: 'equatorial', condition: 'invisible',
    }
  }

  const avgLuminosity = Math.round(curtains.reduce((s, c) => s + c.luminosity, 0) / curtains.length)
  const avgAlignment = Math.round(curtains.reduce((s, c) => s + c.magneticAlignment, 0) / curtains.length)
  const avgHarmony = Math.round(curtains.reduce((s, c) => s + c.cosmicHarmony, 0) / curtains.length)
  const northernLightsCount = curtains.filter(c => c.condition === 'northern-lights').length
  const darkNightCount = curtains.filter(c => c.condition === 'dark-night').length
  const avgQs = Math.round(curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length)

  return {
    directory: dirPath, curtains, avgLuminosity, avgAlignment, avgHarmony,
    northernLightsCount, darkNightCount, beltType: classifyBeltType(curtains),
    condition: classifyBeltCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete aurora borealis result
 * @example
 * const result = await buildAuroraBorealisResult(files, contents)
 * console.log(result.stats.astronomerGrade) // 'chief-astronomer'
 */
export async function buildAuroraBorealisResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AuroraBorealisResult> {
  const curtains = files.map((file, i) => analyzeAuroraCurtain(contents[i] ?? '', file))

  const dirMap = new Map<string, AuroraCurtain[]>()
  for (const curtain of curtains) {
    const dir = path.dirname(curtain.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(curtain) } else { dirMap.set(dir, [curtain]) }
  }

  const belts = Array.from(dirMap.entries()).map(([dir, dirCurtains]) =>
    analyzeAuroraBelt(dirCurtains, dir),
  )

  const avgLuminosity = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.luminosity, 0) / curtains.length) : 0
  const avgAlignment = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.magneticAlignment, 0) / curtains.length) : 0
  const avgHarmony = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.cosmicHarmony, 0) / curtains.length) : 0

  const overallRadiance = curtains.length > 0
    ? Math.round((avgLuminosity + avgAlignment + avgHarmony) / 3) : 0
  const isLuminous = avgLuminosity >= 60

  const sky: SkySummary = { avgLuminosity, avgAlignment, avgHarmony, isLuminous, overallRadiance }

  const avgSpectralRichness = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.spectralRichness, 0) / curtains.length) : 0
  const avgDanceQuality = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.danceQuality, 0) / curtains.length) : 0

  const bestCurtain = curtains.length > 0
    ? curtains.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const brightest = curtains.length > 0
    ? curtains.reduce((best, c) => c.luminosity > best.luminosity ? c : best).file : ''
  const mostColorful = curtains.length > 0
    ? curtains.reduce((best, c) => c.spectralRichness > best.spectralRichness ? c : best).file : ''
  const mostAligned = curtains.length > 0
    ? curtains.reduce((best, c) => c.magneticAlignment > best.magneticAlignment ? c : best).file : ''
  const mostGraceful = curtains.length > 0
    ? curtains.reduce((best, c) => c.danceQuality > best.danceQuality ? c : best).file : ''

  const stats: AuroraBorealisStats = {
    totalFiles: curtains.length,
    totalBelts: belts.length,
    avgLuminosity,
    avgSpectralRichness,
    avgMagneticAlignment: avgAlignment,
    avgDanceQuality,
    avgCosmicHarmony: avgHarmony,
    northernLightsCount: curtains.filter(c => c.condition === 'northern-lights').length,
    brightAuroraCount: curtains.filter(c => c.condition === 'bright-aurora').length,
    properCurtainCount: curtains.filter(c => c.condition === 'proper-curtain').length,
    faintGlowCount: curtains.filter(c => c.condition === 'faint-glow').length,
    twilightCount: curtains.filter(c => c.condition === 'twilight').length,
    darkNightCount: curtains.filter(c => c.condition === 'dark-night').length,
    hasHighLuminosityCount: curtains.filter(c => c.shining.hasHighLuminosity).length,
    hasHighRichnessCount: curtains.filter(c => c.enriching.hasHighRichness).length,
    hasHighAlignmentCount: curtains.filter(c => c.aligning.hasHighAlignment).length,
    hasHighQualityCount: curtains.filter(c => c.dancing.hasHighQuality).length,
    hasHighHarmonyCount: curtains.filter(c => c.harmonizing.hasHighHarmony).length,
    overallRadiance,
    astronomerGrade: classifyAstronomerGrade(overallRadiance),
    bestCurtain, brightest, mostColorful, mostAligned, mostGraceful,
  }

  const recommendations = generateRecommendations(curtains, belts, sky, stats)

  return { curtains, belts, sky, stats, recommendations }
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
