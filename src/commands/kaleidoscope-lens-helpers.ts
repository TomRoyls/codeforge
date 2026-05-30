// ─── Interfaces ───────────────────────────────────────────

export interface SymmetryMeasure {
  level: number
  order: 'six-fold-symmetry' | 'perfect-mirror' | 'balanced' | 'partial' | 'asymmetric' | 'broken-mirror'
  hasHighLevel: boolean
  hasConsistentPatterns: boolean
  hasProperMirroring: boolean
  hasNoDistortion: boolean
  hasRepeating: boolean
  hasNoIrregularity: boolean
  hasBalanced: boolean
  hasNoAsymmetry: boolean
  hasGeometric: boolean
  hasNoChaos: boolean
  distortionCount: number
  irregularityCount: number
}

export interface ColorMeasure {
  richness: number
  palette: 'rainbow-spectrum' | 'rich-palette' | 'primary-colors' | 'limited-palette' | 'monochrome' | 'colorless'
  hasHighRichness: boolean
  hasVibrant: boolean
  hasMultipleTechniques: boolean
  hasNoMonotony: boolean
  hasDiversePatterns: boolean
  hasNoRepetition: boolean
  hasRich: boolean
  hasNoFlatness: boolean
  hasVaried: boolean
  hasNoUniformity: boolean
  monotonyCount: number
  repetitionCount: number
}

export interface LensMeasure {
  clarity: number
  focus: 'crystal-clear' | 'sharp-focus' | 'clear' | 'slightly-blurry' | 'foggy' | 'opaque'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoObfuscation: boolean
  hasClearFocus: boolean
  hasNoBlurring: boolean
  hasProperZoom: boolean
  hasNoDistortion: boolean
  hasSharpEdges: boolean
  hasNoChromaticAberration: boolean
  hasTransparent: boolean
  obfuscationCount: number
  blurringCount: number
}

export interface OpticalMeasure {
  precision: number
  grade: 'laser-precision' | 'microscope-grade' | 'telescope-grade' | 'reading-glass' | 'blurred-vision' | 'blind'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoDistortion: boolean
  hasPreciseAlignment: boolean
  hasNoAberration: boolean
  hasProperFocus: boolean
  hasNoScattering: boolean
  hasCorrectWavelength: boolean
  hasNoRefraction: boolean
  hasSharp: boolean
  aberrationCount: number
  scatteringCount: number
}

export interface ReflectionMeasure {
  quality: number
  surface: 'perfect-mirror' | 'clear-reflection' | 'good-mirror' | 'cloudy-mirror' | 'tarnished' | 'dark-glass'
  hasHighQuality: boolean
  hasSelfDocumenting: boolean
  hasProperDocReflection: boolean
  hasNoObscuredDocs: boolean
  hasClearExamples: boolean
  hasNoMissingDocs: boolean
  hasAccurateDocs: boolean
  hasNoStaleDocs: boolean
  hasComprehensive: boolean
  hasNoContradictory: boolean
  obscuredCount: number
  missingCount: number
}

export interface HarmonyMeasure {
  level: number
  beauty: 'mesmerizing' | 'beautiful-pattern' | 'pleasing' | 'adequate' | 'disjointed' | 'ugly'
  hasHighLevel: boolean
  hasAesthetic: boolean
  hasProperComposition: boolean
  hasNoDissonance: boolean
  hasBalanced: boolean
  hasNoClutter: boolean
  hasHarmonious: boolean
  hasNoConflict: boolean
  hasComplete: boolean
  hasNoMissing: boolean
  dissonanceCount: number
  conflictCount: number
}

export interface KaleidoFragment {
  file: string
  patternSymmetry: number
  colorRichness: number
  lensClarity: number
  opticalPrecision: number
  reflectionQuality: number
  visualHarmony: number
  symmetry: SymmetryMeasure
  color: ColorMeasure
  lens: LensMeasure
  optical: OpticalMeasure
  reflection: ReflectionMeasure
  harmony: HarmonyMeasure
  condition: 'masterpiece-kaleidoscope' | 'beautiful-mandala' | 'colorful-pattern' | 'simple-shape' | 'broken-shard' | 'dust'
  qualityScore: number
}

export interface LensChamber {
  directory: string
  fragments: KaleidoFragment[]
  avgSymmetry: number
  avgClarity: number
  avgHarmony: number
  masterpieceCount: number
  dustCount: number
  symmetricCount: number
  clearCount: number
  chamberType: 'grand-kaleidoscope' | 'viewing-tube' | 'pocket-scope' | 'toy-kaleidoscope' | 'broken-tube' | 'empty'
  condition: 'mesmerizing-display' | 'beautiful-patterns' | 'colorful-view' | 'dim-image' | 'broken-glass' | 'darkness'
}

export interface KaleidoscopeLensResult {
  fragments: KaleidoFragment[]
  chambers: LensChamber[]
  kaleidoscope: {
    avgSymmetry: number
    avgClarity: number
    avgHarmony: number
    isBeautiful: boolean
    overallBeauty: number
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgPatternSymmetry: number
    avgColorRichness: number
    avgLensClarity: number
    avgOpticalPrecision: number
    avgReflectionQuality: number
    avgVisualHarmony: number
    masterpieceKaleidoscopeCount: number
    beautifulMandalaCount: number
    colorfulPatternCount: number
    simpleShapeCount: number
    brokenShardCount: number
    dustCount: number
    hasHighSymmetryCount: number
    hasHighRichnessCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighQualityCount: number
    hasHighHarmonyCount: number
    overallBeauty: number
    opticianGrade: 'master-optician' | 'lens-crafter' | 'glassblower' | 'observer' | 'tourist' | 'blind-spot'
    bestFragment: string
    mostSymmetric: string
    mostColorful: string
    clearest: string
    mostPrecise: string
    bestDocumented: string
  }
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────

const INTERFACE_RE = /\binterface\b/
const CLASS_RE = /\bclass\b/
const TYPE_RE = /\btype\b/
const EXPORT_RE = /\bexport\b/
const IMPORT_RE = /\bimport\b/
const FUNCTION_RE = /\bfunction\b/
const ARROW_RE = /=>/
const ASYNC_RE = /\basync\b/
const AWAIT_RE = /\bawait\b/
const TRY_RE = /\btry\b/
const CATCH_RE = /\bcatch\b/
const GENERIC_RE = /<[A-Z]\w*[,>]/
const OPTIONAL_RE = /\?\s*:/
const NESTED_TERNARY_RE = /\?.*:.*\?.*:/
const CONSOLE_RE = /\bconsole\.\w+/g
const ANY_RE = /:\s*any\b/g
const EVAL_RE = /\beval\s*\(/g
const HACK_RE = /\bHACK\b/gi
const FIXME_RE = /\bFIXME\b/gi
const DOC_COMMENT_RE = /\/\*\*[\s\S]*?\*\//g
const EMPTY_CATCH_RE = /catch\s*\(\w*\)\s*\{\s*\}/g

// ─── measureSymmetry ─────────────────────────────────────

/** @example measureSymmetry(content) returns SymmetryMeasure */
export function measureSymmetry(content: string): SymmetryMeasure {
  let score = 0

  const hasConsistentPatterns = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const distortionCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDistortion = distortionCount === 0
  const hasProperMirroring = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const irregularityCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoIrregularity = irregularityCount === 0
  const hasRepeating = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasBalanced = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoAsymmetry = !NESTED_TERNARY_RE.test(content)
  const hasGeometric = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoChaos = (content.match(EMPTY_CATCH_RE) || []).length === 0

  if (content.length > 0) score += 5
  if (hasConsistentPatterns) score += 12
  if (hasNoDistortion) score += 12
  if (hasProperMirroring) score += 10
  if (hasNoIrregularity) score += 10
  if (hasRepeating) score += 10
  if (hasBalanced) score += 10
  if (hasNoAsymmetry) score += 10
  if (hasGeometric) score += 11
  if (hasNoChaos) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let order: SymmetryMeasure['order'] = 'broken-mirror'
  if (hasHighLevel && hasNoDistortion && hasConsistentPatterns && hasGeometric) order = 'six-fold-symmetry'
  else if (hasHighLevel && hasNoDistortion) order = 'perfect-mirror'
  else if (hasHighLevel) order = 'balanced'
  else if (hasConsistentPatterns && hasProperMirroring) order = 'partial'
  else if (level > 30) order = 'asymmetric'

  return {
    level, order, hasHighLevel, hasConsistentPatterns, hasProperMirroring,
    hasNoDistortion, hasRepeating, hasNoIrregularity, hasBalanced, hasNoAsymmetry,
    hasGeometric, hasNoChaos, distortionCount, irregularityCount,
  }
}

// ─── measureColor ─────────────────────────────────────────

/** @example measureColor(content) returns ColorMeasure */
export function measureColor(content: string): ColorMeasure {
  let score = 0

  const hasVibrant = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasMultipleTechniques = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const monotonyCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoMonotony = monotonyCount === 0
  const hasDiversePatterns = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const repetitionCount = (content.match(CONSOLE_RE) || []).length
  const hasNoRepetition = repetitionCount === 0
  const hasRich = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoFlatness = (content.match(GENERIC_RE) || []).length > 0 || (content.match(OPTIONAL_RE) || []).length > 0
  const hasVaried = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoUniformity = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasVibrant) score += 12
  if (hasMultipleTechniques) score += 10
  if (hasNoMonotony) score += 12
  if (hasDiversePatterns) score += 10
  if (hasNoRepetition) score += 10
  if (hasRich) score += 10
  if (hasNoFlatness) score += 10
  if (hasVaried) score += 11
  if (hasNoUniformity) score += 10

  const richness = Math.min(100, Math.max(0, score))
  const hasHighRichness = richness >= 70

  let palette: ColorMeasure['palette'] = 'colorless'
  if (hasHighRichness && hasNoMonotony && hasRich && hasDiversePatterns) palette = 'rainbow-spectrum'
  else if (hasHighRichness && hasNoMonotony) palette = 'rich-palette'
  else if (hasHighRichness) palette = 'primary-colors'
  else if (hasVibrant && hasMultipleTechniques) palette = 'limited-palette'
  else if (richness > 30) palette = 'monochrome'

  return {
    richness, palette, hasHighRichness, hasVibrant, hasMultipleTechniques,
    hasNoMonotony, hasDiversePatterns, hasNoRepetition, hasRich, hasNoFlatness,
    hasVaried, hasNoUniformity, monotonyCount, repetitionCount,
  }
}

// ─── measureLens ──────────────────────────────────────────

/** @example measureLens(content) returns LensMeasure */
export function measureLens(content: string): LensMeasure {
  let score = 0

  const hasReadable = INTERFACE_RE.test(content) && EXPORT_RE.test(content)
  const obfuscationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoObfuscation = obfuscationCount === 0
  const hasClearFocus = IMPORT_RE.test(content) && EXPORT_RE.test(content)
  const blurringCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoBlurring = blurringCount === 0
  const hasProperZoom = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoDistortion = !NESTED_TERNARY_RE.test(content)
  const hasSharpEdges = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoChromaticAberration = (content.match(CONSOLE_RE) || []).length === 0
  const hasTransparent = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasProperFocus = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasReadable) score += 12
  if (hasNoObfuscation) score += 12
  if (hasClearFocus) score += 10
  if (hasNoBlurring) score += 10
  if (hasProperZoom) score += 10
  if (hasNoDistortion) score += 10
  if (hasSharpEdges) score += 10
  if (hasNoChromaticAberration) score += 11
  if (hasTransparent) score += 10

  const clarity = Math.min(100, Math.max(0, score))
  const hasHighClarity = clarity >= 70

  let focus: LensMeasure['focus'] = 'opaque'
  if (hasHighClarity && hasNoObfuscation && hasReadable && hasProperFocus) focus = 'crystal-clear'
  else if (hasHighClarity && hasNoObfuscation) focus = 'sharp-focus'
  else if (hasHighClarity) focus = 'clear'
  else if (hasReadable && hasClearFocus) focus = 'slightly-blurry'
  else if (clarity > 30) focus = 'foggy'

  return {
    clarity, focus, hasHighClarity, hasReadable, hasNoObfuscation, hasClearFocus,
    hasNoBlurring, hasProperZoom, hasNoDistortion, hasSharpEdges, hasNoChromaticAberration,
    hasTransparent, obfuscationCount, blurringCount,
  }
}

// ─── measureOptical ───────────────────────────────────────

/** @example measureOptical(content) returns OpticalMeasure */
export function measureOptical(content: string): OpticalMeasure {
  let score = 0

  const hasAccurate = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const aberrationCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoAberration = aberrationCount === 0
  const hasPreciseAlignment = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const scatteringCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoScattering = scatteringCount === 0
  const hasProperFocus = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoDistortion = !NESTED_TERNARY_RE.test(content)
  const hasCorrectWavelength = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoRefraction = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasSharp = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasAccurate) score += 12
  if (hasNoAberration) score += 12
  if (hasPreciseAlignment) score += 10
  if (hasNoScattering) score += 10
  if (hasProperFocus) score += 10
  if (hasNoDistortion) score += 10
  if (hasCorrectWavelength) score += 11
  if (hasNoRefraction) score += 10
  if (hasSharp) score += 10

  const precision = Math.min(100, Math.max(0, score))
  const hasHighPrecision = precision >= 70

  let grade: OpticalMeasure['grade'] = 'blind'
  if (hasHighPrecision && hasNoAberration && hasAccurate && hasSharp) grade = 'laser-precision'
  else if (hasHighPrecision && hasNoAberration) grade = 'microscope-grade'
  else if (hasHighPrecision) grade = 'telescope-grade'
  else if (hasAccurate && hasPreciseAlignment) grade = 'reading-glass'
  else if (precision > 30) grade = 'blurred-vision'

  return {
    precision, grade, hasHighPrecision, hasAccurate, hasNoDistortion, hasPreciseAlignment,
    hasNoAberration, hasProperFocus, hasNoScattering, hasCorrectWavelength, hasNoRefraction,
    hasSharp, aberrationCount, scatteringCount,
  }
}

// ─── measureReflection ────────────────────────────────────

/** @example measureReflection(content) returns ReflectionMeasure */
export function measureReflection(content: string): ReflectionMeasure {
  let score = 0

  const hasSelfDocumenting = INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasProperDocReflection = EXPORT_RE.test(content) && (FUNCTION_RE.test(content) || ARROW_RE.test(content))
  const obscuredCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoObscuredDocs = obscuredCount === 0
  const hasClearExamples = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const missingCount = (content.match(EMPTY_CATCH_RE) || []).length
  const hasNoMissingDocs = missingCount === 0
  const hasAccurateDocs = CLASS_RE.test(content) && INTERFACE_RE.test(content) && TYPE_RE.test(content)
  const hasNoStaleDocs = !NESTED_TERNARY_RE.test(content)
  const hasComprehensive = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasNoContradictory = (content.match(HACK_RE) || []).length === 0 && (content.match(FIXME_RE) || []).length === 0
  const hasDocReflection = (content.match(DOC_COMMENT_RE) || []).length > 0

  if (content.length > 0) score += 5
  if (hasSelfDocumenting) score += 12
  if (hasProperDocReflection) score += 10
  if (hasNoObscuredDocs) score += 12
  if (hasClearExamples) score += 10
  if (hasNoMissingDocs) score += 10
  if (hasAccurateDocs) score += 10
  if (hasNoStaleDocs) score += 10
  if (hasComprehensive) score += 11
  if (hasNoContradictory) score += 10

  const quality = Math.min(100, Math.max(0, score))
  const hasHighQuality = quality >= 70

  let surface: ReflectionMeasure['surface'] = 'dark-glass'
  if (hasHighQuality && hasNoObscuredDocs && hasSelfDocumenting && hasDocReflection) surface = 'perfect-mirror'
  else if (hasHighQuality && hasNoObscuredDocs) surface = 'clear-reflection'
  else if (hasHighQuality) surface = 'good-mirror'
  else if (hasSelfDocumenting && hasProperDocReflection) surface = 'cloudy-mirror'
  else if (quality > 30) surface = 'tarnished'

  return {
    quality, surface, hasHighQuality, hasSelfDocumenting, hasProperDocReflection,
    hasNoObscuredDocs, hasClearExamples, hasNoMissingDocs, hasAccurateDocs, hasNoStaleDocs,
    hasComprehensive, hasNoContradictory, obscuredCount, missingCount,
  }
}

// ─── measureHarmony ───────────────────────────────────────

/** @example measureHarmony(content) returns HarmonyMeasure */
export function measureHarmony(content: string): HarmonyMeasure {
  let score = 0

  const hasAesthetic = INTERFACE_RE.test(content) && CLASS_RE.test(content) && TYPE_RE.test(content)
  const dissonanceCount = (content.match(ANY_RE) || []).length + (content.match(EVAL_RE) || []).length
  const hasNoDissonance = dissonanceCount === 0
  const hasProperComposition = EXPORT_RE.test(content) && IMPORT_RE.test(content)
  const conflictCount = (content.match(HACK_RE) || []).length + (content.match(FIXME_RE) || []).length
  const hasNoConflict = conflictCount === 0
  const hasBalanced = ASYNC_RE.test(content) && AWAIT_RE.test(content)
  const hasNoClutter = (content.match(EMPTY_CATCH_RE) || []).length === 0
  const hasHarmonious = TRY_RE.test(content) && CATCH_RE.test(content)
  const hasComplete = (content.match(DOC_COMMENT_RE) || []).length > 0
  const hasNoMissing = !NESTED_TERNARY_RE.test(content)

  if (content.length > 0) score += 5
  if (hasAesthetic) score += 12
  if (hasNoDissonance) score += 12
  if (hasProperComposition) score += 10
  if (hasNoConflict) score += 10
  if (hasBalanced) score += 10
  if (hasNoClutter) score += 10
  if (hasHarmonious) score += 11
  if (hasComplete) score += 10
  if (hasNoMissing) score += 10

  const level = Math.min(100, Math.max(0, score))
  const hasHighLevel = level >= 70

  let beauty: HarmonyMeasure['beauty'] = 'ugly'
  if (hasHighLevel && hasNoDissonance && hasAesthetic && hasComplete) beauty = 'mesmerizing'
  else if (hasHighLevel && hasNoDissonance) beauty = 'beautiful-pattern'
  else if (hasHighLevel) beauty = 'pleasing'
  else if (hasAesthetic && hasProperComposition) beauty = 'adequate'
  else if (level > 30) beauty = 'disjointed'

  return {
    level, beauty, hasHighLevel, hasAesthetic, hasProperComposition, hasNoDissonance,
    hasBalanced, hasNoClutter, hasHarmonious, hasNoConflict, hasComplete, hasNoMissing,
    dissonanceCount, conflictCount,
  }
}

// ─── classifyCondition ────────────────────────────────────

/** @example classifyCondition(fragment) returns condition */
export function classifyCondition(fragment: KaleidoFragment): KaleidoFragment['condition'] {
  const { qualityScore } = fragment
  if (qualityScore >= 80) return 'masterpiece-kaleidoscope'
  if (qualityScore >= 65) return 'beautiful-mandala'
  if (qualityScore >= 50) return 'colorful-pattern'
  if (qualityScore >= 35) return 'simple-shape'
  if (qualityScore >= 20) return 'broken-shard'
  return 'dust'
}

// ─── analyzeKaleidoFragment ───────────────────────────────

/** @example analyzeKaleidoFragment(content, filePath) returns KaleidoFragment */
export function analyzeKaleidoFragment(content: string, filePath: string): KaleidoFragment {
  const symmetry = measureSymmetry(content)
  const color = measureColor(content)
  const lens = measureLens(content)
  const optical = measureOptical(content)
  const reflection = measureReflection(content)
  const harmony = measureHarmony(content)

  const patternSymmetry = symmetry.level
  const colorRichness = color.richness
  const lensClarity = lens.clarity
  const opticalPrecision = optical.precision
  const reflectionQuality = reflection.quality
  const visualHarmony = harmony.level

  const qualityScore = Math.round(
    patternSymmetry * 0.15 +
    colorRichness * 0.15 +
    lensClarity * 0.15 +
    opticalPrecision * 0.2 +
    reflectionQuality * 0.15 +
    visualHarmony * 0.2,
  )

  const result: KaleidoFragment = {
    file: filePath,
    patternSymmetry, colorRichness, lensClarity,
    opticalPrecision, reflectionQuality, visualHarmony,
    symmetry, color, lens, optical, reflection, harmony,
    qualityScore,
    condition: 'dust',
  }

  result.condition = classifyCondition(result)
  return result
}

// ─── classifyChamberType ──────────────────────────────────

/** @example classifyChamberType(fragments) returns chamber type */
export function classifyChamberType(fragments: KaleidoFragment[]): LensChamber['chamberType'] {
  if (fragments.length === 0) return 'empty'
  const avgScore = fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length
  const masterCnt = fragments.filter((f) => f.condition === 'masterpiece-kaleidoscope').length
  if (avgScore >= 75 && masterCnt >= Math.ceil(fragments.length * 0.3)) return 'grand-kaleidoscope'
  if (avgScore >= 60) return 'viewing-tube'
  if (avgScore >= 45) return 'pocket-scope'
  if (avgScore >= 30) return 'toy-kaleidoscope'
  if (avgScore >= 15) return 'broken-tube'
  return 'empty'
}

// ─── analyzeLensChamber ───────────────────────────────────

/** @example analyzeLensChamber(fragments, dirPath) returns LensChamber */
export function analyzeLensChamber(fragments: KaleidoFragment[], dirPath: string): LensChamber {
  if (fragments.length === 0) {
    return {
      directory: dirPath, fragments: [], avgSymmetry: 0, avgClarity: 0, avgHarmony: 0,
      masterpieceCount: 0, dustCount: 0, symmetricCount: 0, clearCount: 0,
      chamberType: 'empty', condition: 'darkness',
    }
  }

  const avgSymmetry = Math.round(fragments.reduce((s, f) => s + f.patternSymmetry, 0) / fragments.length)
  const avgClarity = Math.round(fragments.reduce((s, f) => s + f.lensClarity, 0) / fragments.length)
  const avgHarmony = Math.round(fragments.reduce((s, f) => s + f.visualHarmony, 0) / fragments.length)
  const masterpieceCount = fragments.filter((f) => f.condition === 'masterpiece-kaleidoscope').length
  const dustCount = fragments.filter((f) => f.condition === 'dust').length
  const symmetricCount = fragments.filter((f) => f.symmetry.hasHighLevel).length
  const clearCount = fragments.filter((f) => f.lens.hasHighClarity).length

  const chamberType = classifyChamberType(fragments)
  const avgScore = fragments.reduce((s, f) => s + f.qualityScore, 0) / fragments.length
  let condition: LensChamber['condition'] = 'darkness'
  if (avgScore >= 75) condition = 'mesmerizing-display'
  else if (avgScore >= 60) condition = 'beautiful-patterns'
  else if (avgScore >= 45) condition = 'colorful-view'
  else if (avgScore >= 30) condition = 'dim-image'
  else if (avgScore >= 15) condition = 'broken-glass'

  return {
    directory: dirPath, fragments, avgSymmetry, avgClarity, avgHarmony,
    masterpieceCount, dustCount, symmetricCount, clearCount, chamberType, condition,
  }
}

// ─── classifyOpticianGrade ────────────────────────────────

/** @example classifyOpticianGrade(avgBeauty) returns grade */
export function classifyOpticianGrade(avgBeauty: number): KaleidoscopeLensResult['stats']['opticianGrade'] {
  if (avgBeauty >= 80) return 'master-optician'
  if (avgBeauty >= 65) return 'lens-crafter'
  if (avgBeauty >= 50) return 'glassblower'
  if (avgBeauty >= 35) return 'observer'
  if (avgBeauty >= 20) return 'tourist'
  return 'blind-spot'
}

// ─── generateRecommendations ──────────────────────────────

/** @example generateRecommendations(fragments, chambers, kaleidoscope, stats) returns string[] */
export function generateRecommendations(
  fragments: KaleidoFragment[],
  chambers: LensChamber[],
  kaleidoscope: KaleidoscopeLensResult['kaleidoscope'],
  stats: KaleidoscopeLensResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPatternSymmetry < 50) recs.push('Improve pattern symmetry — add interfaces, types, and consistent patterns for code mirroring')
  if (stats.avgColorRichness < 50) recs.push('Enhance color richness — add diverse techniques and reduce any/eval for code vibrancy')
  if (stats.avgLensClarity < 50) recs.push('Sharpen lens clarity — improve readability and reduce obfuscation for code transparency')
  if (stats.avgOpticalPrecision < 50) recs.push('Refine optical precision — reduce aberrations and add alignment for code accuracy')
  if (stats.avgReflectionQuality < 50) recs.push('Polish reflection quality — add documentation and reduce obscured code for code clarity')
  if (stats.avgVisualHarmony < 50) recs.push('Restore visual harmony — reduce dissonance and conflict for code aesthetics')
  if (stats.dustCount > stats.totalFiles * 0.3) recs.push('Critical: over 30% of fragments are dust — consider major kaleidoscope restoration')
  if (stats.brokenShardCount > 0) recs.push('Warning: broken-shard fragments detected — these files need polishing')
  if (kaleidoscope.overallBeauty < 40) recs.push('Overall beauty is critically low — establish a kaleidoscope crafting regimen')
  if (chambers.length > 0 && chambers.every((c) => c.condition === 'darkness')) recs.push('All chambers are dark — your codebase needs fundamental kaleidoscope restoration')

  if (fragments.length > 0) {
    const highDistortion = fragments.filter((f) => f.symmetry.distortionCount > 2)
    if (highDistortion.length > fragments.length * 0.5) recs.push('Over 50% of fragments have high distortion — reduce any/eval usage')
  }

  return recs
}

// ─── buildKaleidoscopeLensResult ──────────────────────────

/** @example buildKaleidoscopeLensResult(files, contents, options) returns full result */
export function buildKaleidoscopeLensResult(files: string[], contents: string[], _options?: Record<string, unknown>): KaleidoscopeLensResult {
  const fragments = files.map((file, i) => analyzeKaleidoFragment(contents[i] ?? '', file))

  const chamberMap = new Map<string, KaleidoFragment[]>()
  fragments.forEach((fragment) => {
    const parts = fragment.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    const existing = chamberMap.get(dir)
    if (existing) existing.push(fragment)
    else chamberMap.set(dir, [fragment])
  })

  const chambers = Array.from(chamberMap.entries()).map(([dir, frags]) => analyzeLensChamber(frags, dir))

  const avgPatternSymmetry = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.patternSymmetry, 0) / fragments.length) : 0
  const avgColorRichness = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.colorRichness, 0) / fragments.length) : 0
  const avgLensClarity = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.lensClarity, 0) / fragments.length) : 0
  const avgOpticalPrecision = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.opticalPrecision, 0) / fragments.length) : 0
  const avgReflectionQuality = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.reflectionQuality, 0) / fragments.length) : 0
  const avgVisualHarmony = fragments.length > 0 ? Math.round(fragments.reduce((s, f) => s + f.visualHarmony, 0) / fragments.length) : 0

  const overallBeauty = Math.round(
    avgPatternSymmetry * 0.15 +
    avgColorRichness * 0.15 +
    avgLensClarity * 0.15 +
    avgOpticalPrecision * 0.2 +
    avgReflectionQuality * 0.15 +
    avgVisualHarmony * 0.2,
  )

  const kaleidoscope = {
    avgSymmetry: avgPatternSymmetry,
    avgClarity: avgLensClarity,
    avgHarmony: avgVisualHarmony,
    isBeautiful: overallBeauty >= 60,
    overallBeauty,
  }

  const stats = {
    totalFiles: files.length,
    totalChambers: chambers.length,
    avgPatternSymmetry,
    avgColorRichness,
    avgLensClarity,
    avgOpticalPrecision,
    avgReflectionQuality,
    avgVisualHarmony,
    masterpieceKaleidoscopeCount: fragments.filter((f) => f.condition === 'masterpiece-kaleidoscope').length,
    beautifulMandalaCount: fragments.filter((f) => f.condition === 'beautiful-mandala').length,
    colorfulPatternCount: fragments.filter((f) => f.condition === 'colorful-pattern').length,
    simpleShapeCount: fragments.filter((f) => f.condition === 'simple-shape').length,
    brokenShardCount: fragments.filter((f) => f.condition === 'broken-shard').length,
    dustCount: fragments.filter((f) => f.condition === 'dust').length,
    hasHighSymmetryCount: fragments.filter((f) => f.symmetry.hasHighLevel).length,
    hasHighRichnessCount: fragments.filter((f) => f.color.hasHighRichness).length,
    hasHighClarityCount: fragments.filter((f) => f.lens.hasHighClarity).length,
    hasHighPrecisionCount: fragments.filter((f) => f.optical.hasHighPrecision).length,
    hasHighQualityCount: fragments.filter((f) => f.reflection.hasHighQuality).length,
    hasHighHarmonyCount: fragments.filter((f) => f.harmony.hasHighLevel).length,
    overallBeauty,
    opticianGrade: classifyOpticianGrade(overallBeauty),
    bestFragment: '',
    mostSymmetric: '',
    mostColorful: '',
    clearest: '',
    mostPrecise: '',
    bestDocumented: '',
  }

  if (fragments.length > 0) {
    stats.bestFragment = fragments.reduce((a, b) => a.qualityScore >= b.qualityScore ? a : b).file
    stats.mostSymmetric = fragments.reduce((a, b) => a.patternSymmetry >= b.patternSymmetry ? a : b).file
    stats.mostColorful = fragments.reduce((a, b) => a.colorRichness >= b.colorRichness ? a : b).file
    stats.clearest = fragments.reduce((a, b) => a.lensClarity >= b.lensClarity ? a : b).file
    stats.mostPrecise = fragments.reduce((a, b) => a.opticalPrecision >= b.opticalPrecision ? a : b).file
    stats.bestDocumented = fragments.reduce((a, b) => a.reflectionQuality >= b.reflectionQuality ? a : b).file
  }

  const recommendations = generateRecommendations(fragments, chambers, kaleidoscope, stats)

  return { fragments, chambers, kaleidoscope, stats, recommendations }
}
