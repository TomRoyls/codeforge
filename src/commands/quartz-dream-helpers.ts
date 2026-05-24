// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Clarity grade for crystalline clarity */
export type ClarityGrade =
  | 'flawless-crystal'
  | 'clear-quartz'
  | 'proper-transparency'
  | 'cloudy-crystal'
  | 'foggy-quartz'
  | 'opaque'

/** Resonance grade for signal purity */
export type ResonanceGrade =
  | 'pure-tone'
  | 'clear-signal'
  | 'proper-frequency'
  | 'noisy-signal'
  | 'static-noise'
  | 'silence'

/** Vibration grade for execution rhythm */
export type VibrationGrade =
  | 'perfect-rhythm'
  | 'steady-pulse'
  | 'proper-beat'
  | 'irregular-pulse'
  | 'arrhythmia'
  | 'flatline'

/** Prism grade for type diversity */
export type PrismGrade =
  | 'rainbow-spectrum'
  | 'full-prism'
  | 'proper-refraction'
  | 'partial-spectrum'
  | 'monochromatic'
  | 'no-prism'

/** Tuning grade for configuration precision */
export type TuningGrade =
  | 'atomic-clock'
  | 'precision-tuned'
  | 'proper-calibration'
  | 'rough-tuning'
  | 'detuned'
  | 'no-tuning'

/** Span condition */
export type SpanCondition =
  | 'master-crystal'
  | 'tuned-quartz'
  | 'proper-crystal'
  | 'cloudy-quartz'
  | 'cracked-crystal'
  | 'dust'

/** Dream type */
export type DreamType =
  | 'crystal-cathedral'
  | 'quartz-chamber'
  | 'proper-cave'
  | 'rocky-tunnel'
  | 'gravel-pit'
  | 'no-dream'

/** Dream condition */
export type DreamCondition =
  | 'transcendent-dream'
  | 'beautiful-vision'
  | 'decent-dream'
  | 'fuzzy-dream'
  | 'nightmare'
  | 'void'

/** Tuner grade for overall quality */
export type TunerGrade =
  | 'crystal-master'
  | 'expert-tuner'
  | 'skilled-resonator'
  | 'apprentice'
  | 'novice'
  | 'dissonant'

/** Clarifying measurement (crystalline clarity) */
export interface ClarifyingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasWellStructured: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasClear: boolean
  obfuscatedCount: number
  crypticCount: number
}

/** Resonating measurement (resonance purity) */
export interface ResonatingMeasure {
  purity: number
  resonance: ResonanceGrade
  hasHighPurity: boolean
  hasHighSignal: boolean
  hasLowNoise: boolean
  hasNoDeadCode: boolean
  hasPurposeful: boolean
  hasNoFiller: boolean
  hasEssential: boolean
  hasNoBoilerplate: boolean
  hasClean: boolean
  hasNoRedundant: boolean
  hasFocused: boolean
  deadCodeCount: number
  fillerCount: number
}

/** Vibrating measurement (vibration quality) */
export interface VibratingMeasure {
  quality: number
  vibration: VibrationGrade
  hasHighQuality: boolean
  hasOptimized: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasPerformant: boolean
  hasNoSluggish: boolean
  hasRhythmic: boolean
  hasNoJerky: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasSmooth: boolean
  wastefulCount: number
  sluggishCount: number
}

/** Splitting measurement (prism diversity) */
export interface SplittingMeasure {
  diversity: number
  prism: PrismGrade
  hasHighDiversity: boolean
  hasTypeHandling: boolean
  hasCaseCoverage: boolean
  hasNoSinglePath: boolean
  hasPolymorphic: boolean
  hasNoMonomorphic: boolean
  hasGeneric: boolean
  hasNoHardcoded: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasAdaptive: boolean
  singlePathCount: number
  monomorphicCount: number
}

/** Tuning measurement (tuning precision) */
export interface TuningMeasure {
  precision: number
  tuning: TuningGrade
  hasHighPrecision: boolean
  hasAccurateConfig: boolean
  hasValidatedInputs: boolean
  hasNoHardcoded: boolean
  hasConstants: boolean
  hasNoMagicNumbers: boolean
  hasConfigurable: boolean
  hasNoFixed: boolean
  hasParameterized: boolean
  hasNoInlineValues: boolean
  hasPrecise: boolean
  hardcodedCount: number
  magicNumberCount: number
}

/** Single file analysis */
export interface QuartzVibration {
  file: string
  crystallineClarity: number
  resonancePurity: number
  vibrationQuality: number
  prismDiversity: number
  tuningPrecision: number
  clarifying: ClarifyingMeasure
  resonating: ResonatingMeasure
  vibrating: VibratingMeasure
  splitting: SplittingMeasure
  tuning: TuningMeasure
  condition: SpanCondition
  qualityScore: number
}

/** Directory-level dream */
export interface CrystalDream {
  directory: string
  vibrations: QuartzVibration[]
  avgClarity: number
  avgPurity: number
  avgPrecision: number
  masterCrystalCount: number
  dustCount: number
  dreamType: DreamType
  condition: DreamCondition
}

/** Spectrum summary */
export interface QuartzSpectrum {
  avgClarity: number
  avgPurity: number
  avgPrecision: number
  isTranscendent: boolean
  overallResonance: number
}

/** Full stats */
export interface QuartzDreamStats {
  totalFiles: number
  totalDreams: number
  avgCrystallineClarity: number
  avgResonancePurity: number
  avgVibrationQuality: number
  avgPrismDiversity: number
  avgTuningPrecision: number
  masterCrystalCount: number
  tunedQuartzCount: number
  properCrystalCount: number
  cloudyQuartzCount: number
  crackedCrystalCount: number
  dustCount: number
  hasHighClarityCount: number
  hasHighPurityCount: number
  hasHighQualityCount: number
  hasHighDiversityCount: number
  hasHighPrecisionCount: number
  overallResonance: number
  tunerGrade: TunerGrade
  bestVibration: string
  clearest: string
  purest: string
  bestRhythm: string
  mostDiverse: string
}

/** Full result */
export interface QuartzDreamResult {
  vibrations: QuartzVibration[]
  dreams: CrystalDream[]
  spectrum: QuartzSpectrum
  stats: QuartzDreamStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
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
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasSwitch = (c: string) => has(/\bswitch\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasTernary = (c: string) => has(/\?[^?]*:/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasConstantPatterns = (c: string) => has(/\b(?:const|readonly|UPPER_CASE|[A-Z_]{3,})\b/, c)
const hasFunctionDeclaration = (c: string) => has(/\bfunction\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure crystalline clarity (clarifying)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.grade) // 'flawless-crystal'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0

  const hasReadable = hasExport(content) && hasReturnType(content)
  const hasWellStructured = hasInterface(content) && hasGenerics(content)
  const hasSelfDocumenting = hasNamedExport(content) && hasDocComments(content)
  const hasOrganized = hasImport(content) && hasConst(content)
  const hasTransparent = hasReturnType(content) && hasNamedExport(content)
  const hasClear = hasInterface(content) && hasExport(content)

  score += hasReadable ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoChaotic = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'flawless-crystal'
  else if (clarity >= 70) grade = 'clear-quartz'
  else if (clarity >= 55) grade = 'proper-transparency'
  else if (clarity >= 40) grade = 'cloudy-crystal'
  else if (clarity >= 25) grade = 'foggy-quartz'
  else grade = 'opaque'

  return {
    clarity, grade, hasHighClarity, hasReadable, hasWellStructured,
    hasNoObfuscated, hasSelfDocumenting, hasNoCryptic, hasOrganized,
    hasNoChaotic, hasTransparent, hasNoHidden, hasClear,
    obfuscatedCount, crypticCount,
  }
}

/**
 * Measure resonance purity (resonating)
 * @example
 * const m = measureResonating(content)
 * console.log(m.resonance) // 'pure-tone'
 */
export function measureResonating(content: string): ResonatingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0

  const hasHighSignal = hasExport(content) && hasReturnType(content)
  const hasPurposeful = hasNamedExport(content) && hasConst(content)
  const hasEssential = hasInterface(content) && hasReadonly(content)
  const hasClean = hasStrictEq(content) && hasReturnType(content)
  const hasFocused = hasExport(content) && hasInterface(content)
  const hasLowNoise = hasConst(content) && hasReadonly(content)

  score += hasHighSignal ? 5 : 0
  score += hasPurposeful ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasLowNoise ? 5 : 0

  const purity = Math.min(score, 100)
  const deadCodeCount = countMatches(/\bvar\b/, content)
  const fillerCount = countMatches(/\bany\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoFiller = fillerCount === 0
  const hasNoBoilerplate = !has(/\beval\b/, content)
  const hasNoRedundant = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let resonance: ResonanceGrade
  if (purity >= 85) resonance = 'pure-tone'
  else if (purity >= 70) resonance = 'clear-signal'
  else if (purity >= 55) resonance = 'proper-frequency'
  else if (purity >= 40) resonance = 'noisy-signal'
  else if (purity >= 25) resonance = 'static-noise'
  else resonance = 'silence'

  return {
    purity, resonance, hasHighPurity, hasHighSignal, hasLowNoise,
    hasNoDeadCode, hasPurposeful, hasNoFiller, hasEssential, hasNoBoilerplate,
    hasClean, hasNoRedundant, hasFocused, deadCodeCount, fillerCount,
  }
}

/**
 * Measure vibration quality (vibrating)
 * @example
 * const m = measureVibrating(content)
 * console.log(m.vibration) // 'perfect-rhythm'
 */
export function measureVibrating(content: string): VibratingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasArrowFunction(content) ? 8 : 0
  score += hasFunctionDeclaration(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0

  const hasOptimized = hasMapFunction(content) && hasConst(content)
  const hasEfficient = hasAsync(content) && hasReturnType(content)
  const hasPerformant = hasArrowFunction(content) && hasStrictEq(content)
  const hasRhythmic = hasTryCatch(content) && hasAsync(content)
  const hasConsistent = hasReturnType(content) && hasInterface(content)
  const hasSmooth = hasOptional(content) && hasNullishCoalescing(content)

  score += hasOptimized ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasPerformant ? 5 : 0
  score += hasRhythmic ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasSmooth ? 5 : 0

  const quality = Math.min(score, 100)
  const wastefulCount = countMatches(/\bvar\b/, content)
  const sluggishCount = countMatches(/\bany\b/, content)

  const hasNoWasteful = wastefulCount === 0
  const hasNoSluggish = sluggishCount === 0
  const hasNoJerky = !has(/\beval\b/, content)
  const hasNoInconsistent = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let vibration: VibrationGrade
  if (quality >= 85) vibration = 'perfect-rhythm'
  else if (quality >= 70) vibration = 'steady-pulse'
  else if (quality >= 55) vibration = 'proper-beat'
  else if (quality >= 40) vibration = 'irregular-pulse'
  else if (quality >= 25) vibration = 'arrhythmia'
  else vibration = 'flatline'

  return {
    quality, vibration, hasHighQuality, hasOptimized, hasEfficient,
    hasNoWasteful, hasPerformant, hasNoSluggish, hasRhythmic, hasNoJerky,
    hasConsistent, hasNoInconsistent, hasSmooth, wastefulCount, sluggishCount,
  }
}

/**
 * Measure prism diversity (splitting)
 * @example
 * const m = measureSplitting(content)
 * console.log(m.prism) // 'rainbow-spectrum'
 */
export function measureSplitting(content: string): SplittingMeasure {
  let score = 0
  score += hasUnionType(content) ? 10 : 0
  score += hasEnum(content) ? 10 : 0
  score += hasSwitch(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTernary(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0

  const hasTypeHandling = hasUnionType(content) && hasEnum(content)
  const hasCaseCoverage = hasSwitch(content) && hasConditional(content)
  const hasPolymorphic = hasGenerics(content) && hasInterface(content)
  const hasGeneric = hasGenerics(content) && hasTypeAlias(content)
  const hasFlexible = hasOptional(content) && hasUnionType(content)
  const hasAdaptive = hasTernary(content) && hasGenerics(content)

  score += hasTypeHandling ? 5 : 0
  score += hasCaseCoverage ? 5 : 0
  score += hasPolymorphic ? 5 : 0
  score += hasGeneric ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasAdaptive ? 5 : 0

  const diversity = Math.min(score, 100)
  const singlePathCount = countMatches(/\bvar\b/, content)
  const monomorphicCount = countMatches(/\bany\b/, content)

  const hasNoSinglePath = singlePathCount === 0
  const hasNoMonomorphic = monomorphicCount === 0
  const hasNoHardcoded = !has(/\beval\b/, content)
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasHighDiversity = diversity >= 70

  let prism: PrismGrade
  if (diversity >= 85) prism = 'rainbow-spectrum'
  else if (diversity >= 70) prism = 'full-prism'
  else if (diversity >= 55) prism = 'proper-refraction'
  else if (diversity >= 40) prism = 'partial-spectrum'
  else if (diversity >= 25) prism = 'monochromatic'
  else prism = 'no-prism'

  return {
    diversity, prism, hasHighDiversity, hasTypeHandling, hasCaseCoverage,
    hasNoSinglePath, hasPolymorphic, hasNoMonomorphic, hasGeneric,
    hasNoHardcoded, hasFlexible, hasNoRigid, hasAdaptive,
    singlePathCount, monomorphicCount,
  }
}

/**
 * Measure tuning precision (tuning)
 * @example
 * const m = measureTuning(content)
 * console.log(m.tuning) // 'atomic-clock'
 */
export function measureTuning(content: string): TuningMeasure {
  let score = 0
  score += hasConstantPatterns(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDefaultParam(content) ? 8 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasAccurateConfig = hasInterface(content) && hasReturnType(content)
  const hasValidatedInputs = hasConst(content) && hasOptional(content)
  const hasConfigurable = hasDefaultParam(content) && hasOptional(content)
  const hasParameterized = hasGenerics(content) && hasReturnType(content)
  const hasPrecise = hasReadonly(content) && hasConst(content)
  const hasNoInlineValues = hasEnum(content) && hasConstantPatterns(content)

  score += hasAccurateConfig ? 5 : 0
  score += hasValidatedInputs ? 5 : 0
  score += hasConfigurable ? 5 : 0
  score += hasParameterized ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasNoInlineValues ? 5 : 0

  const precision = Math.min(score, 100)
  const hardcodedCount = countMatches(/\bvar\b/, content)
  const magicNumberCount = countMatches(/\bany\b/, content)

  const hasConstantsDetected = hasConstantPatterns(content)
  const hasNoHardcoded = hardcodedCount === 0
  const hasNoMagicNumbers = magicNumberCount === 0
  const hasNoFixed = !has(/\beval\b/, content)
  const hasHighPrecision = precision >= 70

  let tuning: TuningGrade
  if (precision >= 85) tuning = 'atomic-clock'
  else if (precision >= 70) tuning = 'precision-tuned'
  else if (precision >= 55) tuning = 'proper-calibration'
  else if (precision >= 40) tuning = 'rough-tuning'
  else if (precision >= 25) tuning = 'detuned'
  else tuning = 'no-tuning'

  return {
    precision, tuning, hasHighPrecision, hasAccurateConfig, hasValidatedInputs,
    hasNoHardcoded, hasConstants: hasConstantsDetected, hasNoMagicNumbers, hasConfigurable,
    hasNoFixed, hasParameterized, hasNoInlineValues, hasPrecise,
    hardcodedCount, magicNumberCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify span condition
 * @example
 * classifySpanCondition(90) // 'master-crystal'
 */
export function classifySpanCondition(score: number): SpanCondition {
  if (score >= 85) return 'master-crystal'
  if (score >= 70) return 'tuned-quartz'
  if (score >= 55) return 'proper-crystal'
  if (score >= 40) return 'cloudy-quartz'
  if (score >= 25) return 'cracked-crystal'
  return 'dust'
}

/**
 * Classify dream type
 * @example
 * classifyDreamType(vibrations) // 'crystal-cathedral'
 */
export function classifyDreamType(vibrations: QuartzVibration[]): DreamType {
  if (vibrations.length === 0) return 'no-dream'
  const avgQs = Math.round(vibrations.reduce((s, v) => s + v.qualityScore, 0) / vibrations.length)
  const masterRatio = vibrations.filter(v => v.condition === 'master-crystal').length / vibrations.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'crystal-cathedral'
  if (avgQs >= 60) return 'quartz-chamber'
  if (avgQs >= 45) return 'proper-cave'
  if (avgQs >= 30) return 'rocky-tunnel'
  if (avgQs >= 15) return 'gravel-pit'
  return 'no-dream'
}

/**
 * Classify dream condition
 * @example
 * classifyDreamCondition(80) // 'transcendent-dream'
 */
export function classifyDreamCondition(avgQs: number): DreamCondition {
  if (avgQs >= 75) return 'transcendent-dream'
  if (avgQs >= 60) return 'beautiful-vision'
  if (avgQs >= 45) return 'decent-dream'
  if (avgQs >= 30) return 'fuzzy-dream'
  if (avgQs >= 15) return 'nightmare'
  return 'void'
}

/**
 * Classify tuner grade
 * @example
 * classifyTunerGrade(85) // 'crystal-master'
 */
export function classifyTunerGrade(avgResonance: number): TunerGrade {
  if (avgResonance >= 80) return 'crystal-master'
  if (avgResonance >= 65) return 'expert-tuner'
  if (avgResonance >= 50) return 'skilled-resonator'
  if (avgResonance >= 35) return 'apprentice'
  if (avgResonance >= 20) return 'novice'
  return 'dissonant'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(vibrations, dreams, spectrum, stats)
 */
export function generateRecommendations(
  vibrations: QuartzVibration[],
  dreams: CrystalDream[],
  spectrum: QuartzSpectrum,
  stats: QuartzDreamStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCrystallineClarity < 50) {
    recs.push('Improve crystalline clarity with better documentation, typed exports, and structured interfaces')
  }
  if (stats.avgResonancePurity < 50) {
    recs.push('Boost resonance purity by removing dead code, reducing filler, and focusing on essential logic')
  }
  if (stats.avgVibrationQuality < 50) {
    recs.push('Enhance vibration quality with async patterns, error handling, and functional iteration')
  }
  if (stats.avgPrismDiversity < 50) {
    recs.push('Expand prism diversity with union types, enums, switch statements, and generic patterns')
  }
  if (stats.avgTuningPrecision < 50) {
    recs.push('Refine tuning precision with constants, readonly modifiers, and parameterized configuration')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — they need complete quartz crystal restoration`)
  }
  if (spectrum.overallResonance < 40) {
    recs.push('Overall resonance is low — focus on crystalline clarity and resonance purity first')
  }
  const allBroken = dreams.every(d => d.dreamType === 'no-dream' || d.dreamType === 'gravel-pit')
  if (allBroken && dreams.length > 0) {
    recs.push('All dreams are shattered — consider a major crystal reconstruction')
  }
  const dustFiles = vibrations.filter(v => v.condition === 'dust').map(v => v.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Restore these dust files into quartz vibrations: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your quartz dream achieves crystal master quality! Every vibration resonates with transcendent precision')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as quartz vibration
 * @example
 * const v = analyzeQuartzVibration(content, 'index.ts')
 * console.log(v.condition) // 'master-crystal'
 */
export function analyzeQuartzVibration(content: string, filePath: string): QuartzVibration {
  const clarifying = measureClarifying(content)
  const resonating = measureResonating(content)
  const vibrating = measureVibrating(content)
  const splitting = measureSplitting(content)
  const tuning = measureTuning(content)

  const qualityScore = Math.round(
    clarifying.clarity * 0.2 +
    resonating.purity * 0.2 +
    vibrating.quality * 0.2 +
    splitting.diversity * 0.2 +
    tuning.precision * 0.2,
  )

  return {
    file: filePath,
    crystallineClarity: clarifying.clarity,
    resonancePurity: resonating.purity,
    vibrationQuality: vibrating.quality,
    prismDiversity: splitting.diversity,
    tuningPrecision: tuning.precision,
    clarifying,
    resonating,
    vibrating,
    splitting,
    tuning,
    condition: classifySpanCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as crystal dream
 * @example
 * const d = analyzeCrystalDream(vibrations, 'src')
 * console.log(d.dreamType) // 'crystal-cathedral'
 */
export function analyzeCrystalDream(vibrations: QuartzVibration[], dirPath: string): CrystalDream {
  if (vibrations.length === 0) {
    return {
      directory: dirPath, vibrations: [], avgClarity: 0, avgPurity: 0,
      avgPrecision: 0, masterCrystalCount: 0, dustCount: 0,
      dreamType: 'no-dream', condition: 'void',
    }
  }

  const avgClarity = Math.round(vibrations.reduce((s, v) => s + v.crystallineClarity, 0) / vibrations.length)
  const avgPurity = Math.round(vibrations.reduce((s, v) => s + v.resonancePurity, 0) / vibrations.length)
  const avgPrecision = Math.round(vibrations.reduce((s, v) => s + v.tuningPrecision, 0) / vibrations.length)
  const masterCrystalCount = vibrations.filter(v => v.condition === 'master-crystal').length
  const dustCount = vibrations.filter(v => v.condition === 'dust').length
  const avgQs = Math.round(vibrations.reduce((s, v) => s + v.qualityScore, 0) / vibrations.length)

  return {
    directory: dirPath, vibrations, avgClarity, avgPurity, avgPrecision,
    masterCrystalCount, dustCount,
    dreamType: classifyDreamType(vibrations),
    condition: classifyDreamCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete quartz dream result
 * @example
 * const result = await buildQuartzDreamResult(files, contents)
 * console.log(result.stats.tunerGrade) // 'crystal-master'
 */
export async function buildQuartzDreamResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<QuartzDreamResult> {
  const vibrations = files.map((file, i) => analyzeQuartzVibration(contents[i] ?? '', file))

  const dirMap = new Map<string, QuartzVibration[]>()
  for (const vib of vibrations) {
    const dir = path.dirname(vib.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(vib) } else { dirMap.set(dir, [vib]) }
  }

  const dreams = Array.from(dirMap.entries()).map(([dir, dirVibrations]) =>
    analyzeCrystalDream(dirVibrations, dir),
  )

  const avgClarity = vibrations.length > 0
    ? Math.round(vibrations.reduce((s, v) => s + v.crystallineClarity, 0) / vibrations.length) : 0
  const avgPurity = vibrations.length > 0
    ? Math.round(vibrations.reduce((s, v) => s + v.resonancePurity, 0) / vibrations.length) : 0
  const avgPrecision = vibrations.length > 0
    ? Math.round(vibrations.reduce((s, v) => s + v.tuningPrecision, 0) / vibrations.length) : 0

  const overallResonance = vibrations.length > 0
    ? Math.round((avgClarity + avgPurity + avgPrecision) / 3) : 0
  const isTranscendent = avgClarity >= 60

  const spectrum: QuartzSpectrum = { avgClarity, avgPurity, avgPrecision, isTranscendent, overallResonance }

  const avgVibrationQuality = vibrations.length > 0
    ? Math.round(vibrations.reduce((s, v) => s + v.vibrationQuality, 0) / vibrations.length) : 0
  const avgPrismDiversity = vibrations.length > 0
    ? Math.round(vibrations.reduce((s, v) => s + v.prismDiversity, 0) / vibrations.length) : 0
  const avgTuningPrecision = vibrations.length > 0
    ? Math.round(vibrations.reduce((s, v) => s + v.tuningPrecision, 0) / vibrations.length) : 0

  const bestVibration = vibrations.length > 0
    ? vibrations.reduce((best, v) => v.qualityScore > best.qualityScore ? v : best).file : ''
  const clearest = vibrations.length > 0
    ? vibrations.reduce((best, v) => v.crystallineClarity > best.crystallineClarity ? v : best).file : ''
  const purest = vibrations.length > 0
    ? vibrations.reduce((best, v) => v.resonancePurity > best.resonancePurity ? v : best).file : ''
  const bestRhythm = vibrations.length > 0
    ? vibrations.reduce((best, v) => v.vibrationQuality > best.vibrationQuality ? v : best).file : ''
  const mostDiverse = vibrations.length > 0
    ? vibrations.reduce((best, v) => v.prismDiversity > best.prismDiversity ? v : best).file : ''

  const stats: QuartzDreamStats = {
    totalFiles: vibrations.length,
    totalDreams: dreams.length,
    avgCrystallineClarity: avgClarity,
    avgResonancePurity: avgPurity,
    avgVibrationQuality,
    avgPrismDiversity,
    avgTuningPrecision: avgPrecision,
    masterCrystalCount: vibrations.filter(v => v.condition === 'master-crystal').length,
    tunedQuartzCount: vibrations.filter(v => v.condition === 'tuned-quartz').length,
    properCrystalCount: vibrations.filter(v => v.condition === 'proper-crystal').length,
    cloudyQuartzCount: vibrations.filter(v => v.condition === 'cloudy-quartz').length,
    crackedCrystalCount: vibrations.filter(v => v.condition === 'cracked-crystal').length,
    dustCount: vibrations.filter(v => v.condition === 'dust').length,
    hasHighClarityCount: vibrations.filter(v => v.clarifying.hasHighClarity).length,
    hasHighPurityCount: vibrations.filter(v => v.resonating.hasHighPurity).length,
    hasHighQualityCount: vibrations.filter(v => v.vibrating.hasHighQuality).length,
    hasHighDiversityCount: vibrations.filter(v => v.splitting.hasHighDiversity).length,
    hasHighPrecisionCount: vibrations.filter(v => v.tuning.hasHighPrecision).length,
    overallResonance,
    tunerGrade: classifyTunerGrade(overallResonance),
    bestVibration, clearest, purest, bestRhythm, mostDiverse,
  }

  const recommendations = generateRecommendations(vibrations, dreams, spectrum, stats)

  return { vibrations, dreams, spectrum, stats, recommendations }
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
