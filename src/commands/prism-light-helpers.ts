// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const ASYNC_REGEX = /\basync\s+/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g

// ─── Helper Functions ───────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number { return countMatches(content, IMPORT_REGEX) }
function countExportKeywords(content: string): number { return countMatches(content, EXPORT_REGEX) }
function countClassKeywords(content: string): number { return countMatches(content, CLASS_REGEX) }
function countInterfaceKeywords(content: string): number { return countMatches(content, INTERFACE_REGEX) }
function countTypeKeywords(content: string): number { return countMatches(content, TYPE_REGEX) }
function countEnumKeywords(content: string): number { return countMatches(content, ENUM_REGEX) }
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface TransparencyMeasure {
  level: number
  grade: 'crystal' | 'glass' | 'frosted' | 'clouded' | 'opaque' | 'black'
  hasHighTransparency: boolean
  hasNoAbsorption: boolean
  hasProperTransmission: boolean
  hasNoScattering: boolean
  hasNoReflection: boolean
  hasUniformClarity: boolean
  hasProperFocus: boolean
  hasNoDistortion: boolean
  hasCleanPassage: boolean
  hasNoInterference: boolean
  absorptionCount: number
  scatteringCount: number
}

export interface SpectrumMeasure {
  diversity: number
  range: 'full-visible' | 'broad' | 'partial' | 'narrow' | 'monochromatic' | 'dark'
  hasRichSpectrum: boolean
  hasRedComponent: boolean
  hasOrangeComponent: boolean
  hasYellowComponent: boolean
  hasGreenComponent: boolean
  hasBlueComponent: boolean
  hasVioletComponent: boolean
  hasNoSpectralGaps: boolean
  hasContinuousSpectrum: boolean
  hasNoEmissionLines: boolean
  gapCount: number
  emissionCount: number
}

export interface RefractionMeasure {
  index: number
  angle: 'optimal' | 'shallow' | 'steep' | 'critical' | 'total-internal' | 'no-refraction'
  hasProperRefraction: boolean
  hasSnellCompliance: boolean
  hasNoAberration: boolean
  hasProperBending: boolean
  hasNoTotalReflection: boolean
  hasChromaticCorrection: boolean
  hasNoDistortion: boolean
  hasProperFocus: boolean
  hasNoSphericalAberration: boolean
  hasAchromatic: boolean
  aberrationCount: number
  distortionCount: number
}

export interface DispersionMeasure {
  accuracy: number
  type: 'normal' | 'anomalous' | 'zero' | 'negative' | 'chaotic' | 'absent'
  hasPreciseDispersion: boolean
  hasProperSeparation: boolean
  hasNoOverlap: boolean
  hasProperWavelength: boolean
  hasNoBlending: boolean
  hasHighResolution: boolean
  hasNoBlurring: boolean
  hasProperSpread: boolean
  hasNoMixing: boolean
  hasCleanSeparation: boolean
  overlapCount: number
  blurringCount: number
}

export interface PurityMeasure {
  level: number
  state: 'laser-pure' | 'monochromatic' | 'filtered' | 'scattered' | 'contaminated' | 'muddy'
  hasHighPurity: boolean
  hasNoContamination: boolean
  hasProperFiltration: boolean
  hasNoNoise: boolean
  hasCleanSignal: boolean
  hasNoCrosstalk: boolean
  hasProperIsolation: boolean
  hasNoInterference: boolean
  hasSignalToNoise: boolean
  hasNoClutter: boolean
  contaminationCount: number
  clutterCount: number
}

export interface LuminousMeasure {
  intensity: number
  source: 'laser' | 'led' | 'incandescent' | 'candle' | 'ember' | 'dark'
  hasHighIntensity: boolean
  hasProperBrightness: boolean
  hasNoFlicker: boolean
  hasStableOutput: boolean
  hasProperIllumination: boolean
  hasNoGlare: boolean
  hasProperBeam: boolean
  hasNoDimSpots: boolean
  hasConsistentEmission: boolean
  hasProperWattage: boolean
  flickerCount: number
  glareCount: number
}

export interface LightBeam {
  file: string
  lightTransparency: number
  spectrumDecomposition: number
  refractionIndex: number
  dispersionAccuracy: number
  chromaticPurity: number
  luminousIntensity: number
  transparency: TransparencyMeasure
  spectrum: SpectrumMeasure
  refraction: RefractionMeasure
  dispersion: DispersionMeasure
  purity: PurityMeasure
  luminous: LuminousMeasure
  condition: 'diamond-prism' | 'glass-prism' | 'crystal-prism' | 'plastic-prism' | 'cracked-glass' | 'ice-cube'
  qualityScore: number
}

export interface LightSpectrum {
  directory: string
  beams: LightBeam[]
  avgTransparency: number
  avgDispersion: number
  avgIntensity: number
  diamondCount: number
  iceCubeCount: number
  transparentCount: number
  pureCount: number
  spectrumType: 'rainbow-display' | 'spectrum-analysis' | 'light-show' | 'dim-glow' | 'shadow-play' | 'darkness'
  condition: 'laboratory' | 'observatory' | 'studio' | 'classroom' | 'basement' | 'cave'
}

export interface PrismLightResult {
  beams: LightBeam[]
  spectrums: LightSpectrum[]
  laboratory: {
    avgTransparency: number
    avgDispersion: number
    avgIntensity: number
    isBrilliant: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalSpectrums: number
    avgLightTransparency: number
    avgSpectrumDecomposition: number
    avgRefractionIndex: number
    avgDispersionAccuracy: number
    avgChromaticPurity: number
    avgLuminousIntensity: number
    diamondPrismCount: number
    glassPrismCount: number
    crystalPrismCount: number
    plasticPrismCount: number
    crackedGlassCount: number
    iceCubeCount: number
    hasHighTransparencyCount: number
    hasRichSpectrumCount: number
    hasProperRefractionCount: number
    hasPreciseDispersionCount: number
    hasHighPurityCount: number
    hasHighIntensityCount: number
    overallBrilliance: number
    opticianGrade: 'master-optician' | 'optical-engineer' | 'optician' | 'glassblower' | 'lens-grinder' | 'cave-dweller'
    bestBeam: string
    mostTransparent: string
    richestSpectrum: string
    bestRefraction: string
    mostPrecise: string
    brightest: string
  }
  recommendations: string[]
}

// ─── Transparency Measurement ──────────────────────────────────────────────

/** @example measureTransparency(content) returns transparency analysis */
export function measureTransparency(content: string): TransparencyMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const asyncCount = countAsyncKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 25
  if (hasStructure) level += 15
  if (hasTypes) level += 15
  if (hasFunctions) level += 10
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (jsdocCount > 0) level += 8
  if (asyncCount > 0) level += 4
  if (consoleCount === 0) level += 4
  if (anyCount === 0) level += 4
  if (todoCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const absorptionCount = anyCount + todoCount
  const scatteringCount = deepNestedCount + commentedCodeCount

  const hasHighTransparency = level >= 80 && hasStructure && hasTypes
  const hasNoAbsorption = absorptionCount === 0
  const hasProperTransmission = hasStructure && hasTypes && exportCount > 0
  const hasNoScattering = scatteringCount === 0
  const hasNoReflection = consoleCount === 0
  const hasUniformClarity = hasStructure && hasTypes && hasFunctions
  const hasProperFocus = hasStructure && hasTypes && hasFunctions
  const hasNoDistortion = deepNestedCount === 0
  const hasCleanPassage = hasFunctions && consoleCount === 0
  const hasNoInterference = todoCount === 0 && commentedCodeCount === 0

  let grade: TransparencyMeasure['grade'] = 'black'
  if (hasHighTransparency && hasNoAbsorption && hasNoScattering && hasNoReflection) grade = 'crystal'
  else if (hasHighTransparency && hasNoAbsorption) grade = 'glass'
  else if (hasHighTransparency) grade = 'frosted'
  else if (hasProperFocus) grade = 'clouded'
  else if (level > 30) grade = 'opaque'

  return {
    level, grade, hasHighTransparency, hasNoAbsorption, hasProperTransmission,
    hasNoScattering, hasNoReflection, hasUniformClarity, hasProperFocus,
    hasNoDistortion, hasCleanPassage, hasNoInterference,
    absorptionCount, scatteringCount,
  }
}

// ─── Spectrum Measurement ──────────────────────────────────────────────────

/** @example measureSpectrum(content) returns spectrum analysis */
export function measureSpectrum(content: string): SpectrumMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let diversity = 20
  if (hasStructure) diversity += 12
  if (hasTypes) diversity += 12
  if (hasFunctions) diversity += 10
  if (jsdocCount > 0) diversity += 8
  if (genericsCount > 0) diversity += 5
  if (enumCount > 0) diversity += 5
  if (exportCount > 0) diversity += 5
  if (importCount > 0) diversity += 5
  if (asyncCount > 0) diversity += 3
  if (tryCatchCount > 0) diversity += 3
  if (anyCount === 0) diversity += 4
  if (consoleCount === 0) diversity += 3
  if (todoCount === 0) diversity += 5
  diversity = Math.min(100, Math.max(0, Math.round(diversity)))

  const gapCount = todoCount + deepNestedCount
  const emissionCount = consoleCount + anyCount

  const hasRichSpectrum = diversity >= 80 && hasStructure && hasTypes
  const hasRedComponent = hasStructure
  const hasOrangeComponent = hasTypes
  const hasYellowComponent = jsdocCount > 0
  const hasGreenComponent = hasFunctions
  const hasBlueComponent = genericsCount > 0
  const hasVioletComponent = enumCount > 0
  const hasNoSpectralGaps = gapCount === 0
  const hasContinuousSpectrum = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoEmissionLines = emissionCount === 0

  let range: SpectrumMeasure['range'] = 'dark'
  if (hasRichSpectrum && hasNoSpectralGaps && hasNoEmissionLines && hasContinuousSpectrum) range = 'full-visible'
  else if (hasRichSpectrum && hasNoSpectralGaps) range = 'broad'
  else if (hasRichSpectrum) range = 'partial'
  else if (hasContinuousSpectrum) range = 'narrow'
  else if (diversity > 30) range = 'monochromatic'

  return {
    diversity, range, hasRichSpectrum, hasRedComponent, hasOrangeComponent,
    hasYellowComponent, hasGreenComponent, hasBlueComponent, hasVioletComponent,
    hasNoSpectralGaps, hasContinuousSpectrum, hasNoEmissionLines,
    gapCount, emissionCount,
  }
}

// ─── Refraction Measurement ────────────────────────────────────────────────

/** @example measureRefraction(content) returns refraction analysis */
export function measureRefraction(content: string): RefractionMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let index = 25
  if (hasStructure) index += 12
  if (hasTypes) index += 12
  if (hasFunctions) index += 10
  if (jsdocCount > 0) index += 8
  if (genericsCount > 0) index += 5
  if (exportCount > 0) index += 5
  if (importCount > 0) index += 5
  if (tryCatchCount > 0) index += 5
  if (asyncCount > 0) index += 3
  if (consoleCount === 0) index += 4
  if (anyCount === 0) index += 3
  if (deepNestedCount === 0) index += 3
  index = Math.min(100, Math.max(0, Math.round(index)))

  const aberrationCount = anyCount + todoCount
  const distortionCount = deepNestedCount

  const hasProperRefraction = index >= 75 && hasStructure && hasTypes
  const hasSnellCompliance = hasStructure && hasTypes && exportCount > 0 && importCount > 0
  const hasNoAberration = aberrationCount === 0
  const hasProperBending = hasStructure && hasTypes && genericsCount > 0
  const hasNoTotalReflection = exportCount > 0
  const hasChromaticCorrection = hasStructure && hasTypes && genericsCount > 0
  const hasNoDistortion = deepNestedCount === 0
  const hasProperFocus = hasStructure && hasTypes && hasFunctions
  const hasNoSphericalAberration = consoleCount === 0 && todoCount === 0
  const hasAchromatic = hasStructure && hasTypes && genericsCount > 0 && jsdocCount > 0

  let angle: RefractionMeasure['angle'] = 'no-refraction'
  if (hasProperRefraction && hasNoAberration && hasNoDistortion && hasAchromatic) angle = 'optimal'
  else if (hasProperRefraction && hasNoAberration) angle = 'shallow'
  else if (hasProperRefraction) angle = 'steep'
  else if (hasProperFocus) angle = 'critical'
  else if (index > 30) angle = 'total-internal'

  return {
    index, angle, hasProperRefraction, hasSnellCompliance, hasNoAberration,
    hasProperBending, hasNoTotalReflection, hasChromaticCorrection,
    hasNoDistortion, hasProperFocus, hasNoSphericalAberration, hasAchromatic,
    aberrationCount, distortionCount,
  }
}

// ─── Dispersion Measurement ────────────────────────────────────────────────

/** @example measureDispersion(content) returns dispersion analysis */
export function measureDispersion(content: string): DispersionMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let accuracy = 20
  if (hasStructure) accuracy += 12
  if (hasTypes) accuracy += 12
  if (hasFunctions) accuracy += 10
  if (jsdocCount > 0) accuracy += 10
  if (exportCount > 0) accuracy += 10
  if (importCount > 0) accuracy += 5
  if (anyCount === 0) accuracy += 5
  if (consoleCount === 0) accuracy += 4
  if (tryCatchCount > 0) accuracy += 4
  if (privateCount === 0 && protectedCount === 0) accuracy += 3
  if (commentedCodeCount === 0) accuracy += 5
  accuracy = Math.min(100, Math.max(0, Math.round(accuracy)))

  const overlapCount = privateCount + protectedCount
  const blurringCount = anyCount + consoleCount

  const hasPreciseDispersion = accuracy >= 75 && hasStructure && hasTypes
  const hasProperSeparation = hasStructure && hasTypes && exportCount > 0
  const hasNoOverlap = overlapCount === 0
  const hasProperWavelength = hasStructure && hasTypes && genericsCount > 0
  const hasNoBlending = commentedCodeCount === 0
  const hasHighResolution = jsdocCount > 0
  const hasNoBlurring = consoleCount === 0
  const hasProperSpread = hasStructure && hasTypes && hasFunctions
  const hasNoMixing = anyCount === 0
  const hasCleanSeparation = overlapCount === 0 && commentedCodeCount === 0

  let type: DispersionMeasure['type'] = 'absent'
  if (hasPreciseDispersion && hasNoOverlap && hasNoBlurring && hasCleanSeparation) type = 'normal'
  else if (hasPreciseDispersion && hasNoOverlap) type = 'anomalous'
  else if (hasPreciseDispersion) type = 'zero'
  else if (hasProperSpread && hasProperSeparation) type = 'negative'
  else if (accuracy > 30) type = 'chaotic'

  return {
    accuracy, type, hasPreciseDispersion, hasProperSeparation, hasNoOverlap,
    hasProperWavelength, hasNoBlending, hasHighResolution, hasNoBlurring,
    hasProperSpread, hasNoMixing, hasCleanSeparation,
    overlapCount, blurringCount,
  }
}

// ─── Purity Measurement ────────────────────────────────────────────────────

/** @example measurePurity(content) returns purity analysis */
export function measurePurity(content: string): PurityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (genericsCount > 0) level += 5
  if (enumCount > 0) level += 5
  if (anyCount === 0) level += 8
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (deepNestedCount === 0) level += 8
  level = Math.min(100, Math.max(0, Math.round(level)))

  const contaminationCount = todoCount + commentedCodeCount
  const clutterCount = deepNestedCount + consoleCount

  const hasHighPurity = level >= 80 && anyCount === 0 && todoCount === 0
  const hasNoContamination = contaminationCount === 0
  const hasProperFiltration = jsdocCount > 0
  const hasNoNoise = anyCount === 0
  const hasCleanSignal = hasStructure && hasTypes && hasFunctions && deepNestedCount === 0
  const hasNoCrosstalk = anyCount === 0 && consoleCount === 0
  const hasProperIsolation = hasStructure && hasTypes && hasFunctions && deepNestedCount === 0 && anyCount === 0
  const hasNoInterference = todoCount === 0
  const hasSignalToNoise = anyCount === 0 && todoCount === 0 && deepNestedCount === 0
  const hasNoClutter = clutterCount === 0

  let state: PurityMeasure['state'] = 'muddy'
  if (hasHighPurity && hasCleanSignal && hasNoContamination && hasSignalToNoise) state = 'laser-pure'
  else if (hasHighPurity && hasCleanSignal) state = 'monochromatic'
  else if (hasHighPurity) state = 'filtered'
  else if (level >= 60 && hasStructure && hasTypes) state = 'scattered'
  else if (level > 30) state = 'contaminated'

  return {
    level, state, hasHighPurity, hasNoContamination, hasProperFiltration,
    hasNoNoise, hasCleanSignal, hasNoCrosstalk, hasProperIsolation,
    hasNoInterference, hasSignalToNoise, hasNoClutter,
    contaminationCount, clutterCount,
  }
}

// ─── Luminous Measurement ──────────────────────────────────────────────────

/** @example measureLuminous(content) returns luminous analysis */
export function measureLuminous(content: string): LuminousMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let intensity = 25
  if (hasStructure) intensity += 12
  if (hasTypes) intensity += 12
  if (hasFunctions) intensity += 10
  if (jsdocCount > 0) intensity += 8
  if (genericsCount > 0) intensity += 5
  if (exportCount > 0) intensity += 5
  if (importCount > 0) intensity += 5
  if (reExportCount > 0) intensity += 5
  if (asyncCount > 0) intensity += 3
  if (tryCatchCount > 0) intensity += 5
  if (anyCount === 0) intensity += 3
  if (consoleCount === 0) intensity += 2
  intensity = Math.min(100, Math.max(0, Math.round(intensity)))

  const flickerCount = todoCount
  const glareCount = deepNestedCount

  const hasHighIntensity = intensity >= 80 && hasStructure && hasTypes
  const hasProperBrightness = hasStructure && hasTypes && hasFunctions
  const hasNoFlicker = flickerCount === 0
  const hasStableOutput = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasProperIllumination = hasStructure && hasTypes && exportCount > 0
  const hasNoGlare = deepNestedCount === 0
  const hasProperBeam = hasStructure && hasTypes && hasFunctions
  const hasNoDimSpots = hasFunctions
  const hasConsistentEmission = jsdocCount > 0 && exportCount > 0
  const hasProperWattage = hasStructure && hasTypes && genericsCount > 0

  let source: LuminousMeasure['source'] = 'dark'
  if (hasHighIntensity && hasNoFlicker && hasNoGlare && hasProperWattage) source = 'laser'
  else if (hasHighIntensity && hasNoFlicker) source = 'led'
  else if (hasHighIntensity) source = 'incandescent'
  else if (hasProperBrightness && hasProperIllumination) source = 'candle'
  else if (intensity > 30) source = 'ember'

  return {
    intensity, source, hasHighIntensity, hasProperBrightness, hasNoFlicker,
    hasStableOutput, hasProperIllumination, hasNoGlare, hasProperBeam,
    hasNoDimSpots, hasConsistentEmission, hasProperWattage,
    flickerCount, glareCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(beam) returns condition string */
export function classifyCondition(beam: LightBeam): LightBeam['condition'] {
  const { qualityScore } = beam
  if (qualityScore >= 80) return 'diamond-prism'
  if (qualityScore >= 65) return 'glass-prism'
  if (qualityScore >= 50) return 'crystal-prism'
  if (qualityScore >= 35) return 'plastic-prism'
  if (qualityScore >= 20) return 'cracked-glass'
  return 'ice-cube'
}

// ─── Beam Analysis ─────────────────────────────────────────────────────────

/** @example analyzeLightBeam(content, filePath) returns full beam */
export function analyzeLightBeam(content: string, filePath: string): LightBeam {
  const transparency = measureTransparency(content)
  const spectrum = measureSpectrum(content)
  const refraction = measureRefraction(content)
  const dispersion = measureDispersion(content)
  const purity = measurePurity(content)
  const luminous = measureLuminous(content)

  const lightTransparency = transparency.level
  const spectrumDecomposition = spectrum.diversity
  const refractionIndex = refraction.index
  const dispersionAccuracy = dispersion.accuracy
  const chromaticPurity = purity.level
  const luminousIntensity = luminous.intensity

  const qualityScore = Math.round(
    lightTransparency * 0.15 +
    spectrumDecomposition * 0.15 +
    refractionIndex * 0.15 +
    dispersionAccuracy * 0.2 +
    chromaticPurity * 0.15 +
    luminousIntensity * 0.2,
  )

  const beam: LightBeam = {
    file: filePath,
    lightTransparency, spectrumDecomposition, refractionIndex,
    dispersionAccuracy, chromaticPurity, luminousIntensity,
    transparency, spectrum, refraction, dispersion, purity, luminous,
    condition: 'ice-cube',
    qualityScore,
  }

  beam.condition = classifyCondition(beam)

  return beam
}

// ─── Spectrum Analysis ──────────────────────────────────────────────────────

/** @example analyzeLightSpectrum(beams, dirPath) returns spectrum */
export function analyzeLightSpectrum(beams: LightBeam[], dirPath: string): LightSpectrum {
  if (beams.length === 0) {
    return {
      directory: dirPath, beams: [], avgTransparency: 0, avgDispersion: 0,
      avgIntensity: 0, diamondCount: 0, iceCubeCount: 0, transparentCount: 0,
      pureCount: 0, spectrumType: 'darkness', condition: 'cave',
    }
  }

  const avgTransparency = Math.round(beams.reduce((s, b) => s + b.lightTransparency, 0) / beams.length)
  const avgDispersion = Math.round(beams.reduce((s, b) => s + b.dispersionAccuracy, 0) / beams.length)
  const avgIntensity = Math.round(beams.reduce((s, b) => s + b.luminousIntensity, 0) / beams.length)

  const diamondCount = beams.filter((b) => b.condition === 'diamond-prism').length
  const iceCubeCount = beams.filter((b) => b.condition === 'ice-cube').length
  const transparentCount = beams.filter((b) => b.transparency.hasHighTransparency).length
  const pureCount = beams.filter((b) => b.purity.hasHighPurity).length

  const spectrumType = classifySpectrumType(beams)
  const avgQuality = beams.reduce((s, b) => s + b.qualityScore, 0) / beams.length
  const condition = classifySpectrumCondition(avgQuality)

  return {
    directory: dirPath, beams, avgTransparency, avgDispersion, avgIntensity,
    diamondCount, iceCubeCount, transparentCount, pureCount,
    spectrumType, condition,
  }
}

// ─── Spectrum Classification ────────────────────────────────────────────────

/** @example classifySpectrumType(beams) returns spectrum type */
export function classifySpectrumType(beams: LightBeam[]): LightSpectrum['spectrumType'] {
  if (beams.length === 0) return 'darkness'
  const avgQuality = beams.reduce((s, b) => s + b.qualityScore, 0) / beams.length
  const diamondCnt = beams.filter((b) => b.condition === 'diamond-prism').length
  if (avgQuality >= 75 && diamondCnt >= Math.ceil(beams.length * 0.3)) return 'rainbow-display'
  if (avgQuality >= 60) return 'spectrum-analysis'
  if (avgQuality >= 45) return 'light-show'
  if (avgQuality >= 30) return 'dim-glow'
  if (avgQuality >= 15) return 'shadow-play'
  return 'darkness'
}

/** @example classifySpectrumCondition(avgQuality) returns condition */
export function classifySpectrumCondition(avgQuality: number): LightSpectrum['condition'] {
  if (avgQuality >= 80) return 'laboratory'
  if (avgQuality >= 65) return 'observatory'
  if (avgQuality >= 50) return 'studio'
  if (avgQuality >= 35) return 'classroom'
  if (avgQuality >= 20) return 'basement'
  return 'cave'
}

/** @example classifyOpticianGrade(avgBrilliance) returns grade */
export function classifyOpticianGrade(avgBrilliance: number): PrismLightResult['stats']['opticianGrade'] {
  if (avgBrilliance >= 80) return 'master-optician'
  if (avgBrilliance >= 65) return 'optical-engineer'
  if (avgBrilliance >= 50) return 'optician'
  if (avgBrilliance >= 35) return 'glassblower'
  if (avgBrilliance >= 20) return 'lens-grinder'
  return 'cave-dweller'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(beams, spectrums, laboratory, stats) returns recommendations */
export function generateRecommendations(
  beams: LightBeam[],
  spectrums: LightSpectrum[],
  laboratory: PrismLightResult['laboratory'],
  stats: PrismLightResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgLightTransparency < 50) recs.push('Improve transparency — make code more readable and clear')
  if (stats.avgSpectrumDecomposition < 50) recs.push('Expand spectrum — increase code pattern diversity')
  if (stats.avgRefractionIndex < 50) recs.push('Fix refraction — improve code transformation quality')
  if (stats.avgDispersionAccuracy < 50) recs.push('Sharpen dispersion — improve code precision and separation')
  if (stats.avgChromaticPurity < 50) recs.push('Clean purity — reduce code contamination and noise')
  if (stats.avgLuminousIntensity < 50) recs.push('Boost intensity — increase code impact and documentation')
  if (stats.iceCubeCount > beams.length * 0.5) recs.push('Too many ice cubes — over half the codebase is poor quality')
  if (stats.hasHighPurityCount === 0) recs.push('No pure code found — strive for cleaner code')
  if (spectrums.length > 0 && laboratory.overallBrilliance < 60) recs.push('Overall brilliance is low — systematic improvement recommended')
  if (recs.length === 0) recs.push('Prismatic masterpiece — your code refracts clarity into a beautiful spectrum')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildPrismLightResult(files, contents, options) returns full result */
export function buildPrismLightResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): PrismLightResult {
  const beams: LightBeam[] = files.map((file, i) =>
    analyzeLightBeam(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, LightBeam[]>()
  for (const beam of beams) {
    const dir = beam.file.includes('/')
      ? beam.file.substring(0, beam.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(beam)
    } else {
      dirMap.set(dir, [beam])
    }
  }

  const spectrums: LightSpectrum[] = Array.from(dirMap.entries()).map(([dir, dirBeams]) =>
    analyzeLightSpectrum(dirBeams, dir),
  )

  const avgTransparency = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.lightTransparency, 0) / beams.length)
    : 0
  const avgDispersion = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.dispersionAccuracy, 0) / beams.length)
    : 0
  const avgIntensity = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.luminousIntensity, 0) / beams.length)
    : 0
  const overallBrilliance = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.qualityScore, 0) / beams.length)
    : 0
  const isBrilliant = overallBrilliance >= 65

  const laboratory: PrismLightResult['laboratory'] = {
    avgTransparency, avgDispersion, avgIntensity, isBrilliant, overallBrilliance,
  }

  const avgLightTransparency = avgTransparency
  const avgSpectrumDecomposition = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.spectrumDecomposition, 0) / beams.length)
    : 0
  const avgRefractionIndex = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.refractionIndex, 0) / beams.length)
    : 0
  const avgDispersionAccuracy = avgDispersion
  const avgChromaticPurity = beams.length > 0
    ? Math.round(beams.reduce((s, b) => s + b.chromaticPurity, 0) / beams.length)
    : 0
  const avgLuminousIntensity = avgIntensity

  const conditionCounts = {
    diamond: 0, glass: 0, crystal: 0, plastic: 0, cracked: 0, ice: 0,
  }
  for (const b of beams) {
    switch (b.condition) {
      case 'diamond-prism': conditionCounts.diamond++; break
      case 'glass-prism': conditionCounts.glass++; break
      case 'crystal-prism': conditionCounts.crystal++; break
      case 'plastic-prism': conditionCounts.plastic++; break
      case 'cracked-glass': conditionCounts.cracked++; break
      case 'ice-cube': conditionCounts.ice++; break
    }
  }

  const hasHighTransparencyCount = beams.filter((b) => b.transparency.hasHighTransparency).length
  const hasRichSpectrumCount = beams.filter((b) => b.spectrum.hasRichSpectrum).length
  const hasProperRefractionCount = beams.filter((b) => b.refraction.hasProperRefraction).length
  const hasPreciseDispersionCount = beams.filter((b) => b.dispersion.hasPreciseDispersion).length
  const hasHighPurityCount = beams.filter((b) => b.purity.hasHighPurity).length
  const hasHighIntensityCount = beams.filter((b) => b.luminous.hasHighIntensity).length

  const bestBeam = beams.length > 0
    ? beams.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const mostTransparent = beams.length > 0
    ? beams.reduce((best, b) => b.lightTransparency > best.lightTransparency ? b : best).file
    : ''
  const richestSpectrum = beams.length > 0
    ? beams.reduce((best, b) => b.spectrumDecomposition > best.spectrumDecomposition ? b : best).file
    : ''
  const bestRefraction = beams.length > 0
    ? beams.reduce((best, b) => b.refractionIndex > best.refractionIndex ? b : best).file
    : ''
  const mostPrecise = beams.length > 0
    ? beams.reduce((best, b) => b.dispersionAccuracy > best.dispersionAccuracy ? b : best).file
    : ''
  const brightest = beams.length > 0
    ? beams.reduce((best, b) => b.luminousIntensity > best.luminousIntensity ? b : best).file
    : ''

  const opticianGrade = classifyOpticianGrade(overallBrilliance)

  const stats: PrismLightResult['stats'] = {
    totalFiles: files.length, totalSpectrums: spectrums.length,
    avgLightTransparency, avgSpectrumDecomposition, avgRefractionIndex,
    avgDispersionAccuracy, avgChromaticPurity, avgLuminousIntensity,
    diamondPrismCount: conditionCounts.diamond, glassPrismCount: conditionCounts.glass,
    crystalPrismCount: conditionCounts.crystal, plasticPrismCount: conditionCounts.plastic,
    crackedGlassCount: conditionCounts.cracked, iceCubeCount: conditionCounts.ice,
    hasHighTransparencyCount, hasRichSpectrumCount, hasProperRefractionCount,
    hasPreciseDispersionCount, hasHighPurityCount, hasHighIntensityCount,
    overallBrilliance, opticianGrade,
    bestBeam, mostTransparent, richestSpectrum, bestRefraction, mostPrecise, brightest,
  }

  const recommendations = generateRecommendations(beams, spectrums, laboratory, stats)

  return { beams, spectrums, laboratory, stats, recommendations }
}
