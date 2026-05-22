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

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface EmissionMeasure {
  level: number
  brightness: 'dazzling' | 'brilliant' | 'bright' | 'visible' | 'faint' | 'invisible'
  hasHighEmission: boolean
  hasProperIntensity: boolean
  hasNoDimSpots: boolean
  hasConsistentOutput: boolean
  hasProperSpectrum: boolean
  hasNoFlickering: boolean
  hasSteadyGlow: boolean
  hasNoBlackout: boolean
  hasProperProjection: boolean
  hasRadiant: boolean
  dimSpotCount: number
  blackoutCount: number
}

export interface PatternMeasure {
  quality: number
  type: 'curtain' | 'corona' | 'band' | 'arc' | 'patchy' | 'absent'
  hasBeautifulPattern: boolean
  hasFlowingForm: boolean
  hasVerticalStructure: boolean
  hasHorizontalSpread: boolean
  hasNoBreakup: boolean
  hasProperDrape: boolean
  hasRibbonStructure: boolean
  hasNoFragmentation: boolean
  hasCoherentForm: boolean
  hasNoChaos: boolean
  breakupCount: number
  fragmentationCount: number
}

export interface EnergyMeasure {
  transformation: number
  source: 'solar-wind' | 'magnetosphere' | 'ionosphere' | 'atmospheric' | 'static' | 'dead'
  hasHighEfficiency: boolean
  hasProperConversion: boolean
  hasNoWaste: boolean
  hasProperTransfer: boolean
  hasNoLeakage: boolean
  hasOptimalPath: boolean
  hasNoDissipation: boolean
  hasProperAmplification: boolean
  hasNoOverload: boolean
  hasEfficientCoupling: boolean
  wasteCount: number
  leakageCount: number
}

export interface ColorMeasure {
  dynamics: number
  palette: 'full-spectrum' | 'aurora-green' | 'aurora-blue' | 'aurora-red' | 'monochrome' | 'colorless'
  hasRichColors: boolean
  hasGreenPhase: boolean
  hasBluePhase: boolean
  hasRedPhase: boolean
  hasPurplePhase: boolean
  hasNoColorBlindness: boolean
  hasProperTransition: boolean
  hasNoFading: boolean
  hasDynamicRange: boolean
  hasNoStaticDisplay: boolean
  fadingCount: number
  staticCount: number
}

export interface MovementMeasure {
  quality: number
  style: 'flowing' | 'dancing' | 'rippling' | 'pulsing' | 'static' | 'frozen'
  hasGracefulMovement: boolean
  hasProperRhythm: boolean
  hasNoStuttering: boolean
  hasFluidMotion: boolean
  hasProperAcceleration: boolean
  hasNoJerking: boolean
  hasSmoothTransitions: boolean
  hasProperVelocity: boolean
  hasNoStalling: boolean
  hasDynamic: boolean
  stutteringCount: number
  stallingCount: number
}

export interface IlluminationMeasure {
  power: number
  reach: 'hemisphere' | 'regional' | 'local' | 'spotlight' | 'candle' | 'dark'
  hasHighIllumination: boolean
  hasWideReach: boolean
  hasProperFocusing: boolean
  hasNoScatter: boolean
  hasProperProjection: boolean
  hasDeepPenetration: boolean
  hasNoShadow: boolean
  hasAtmospheric: boolean
  hasNoInterference: boolean
  hasLastingImpression: boolean
  scatterCount: number
  shadowCount: number
}

export interface CurtainRay {
  file: string
  lightEmission: number
  curtainPattern: number
  energyTransformation: number
  colorDynamics: number
  movementQuality: number
  illuminationPower: number
  emission: EmissionMeasure
  pattern: PatternMeasure
  energy: EnergyMeasure
  color: ColorMeasure
  movement: MovementMeasure
  illumination: IlluminationMeasure
  condition: 'northern-lights' | 'aurora-australis' | 'substorm-peak' | 'quiet-arc' | 'clouded-over' | 'light-pollution'
  qualityScore: number
}

export interface CurtainDisplay {
  directory: string
  rays: CurtainRay[]
  avgEmission: number
  avgPattern: number
  avgIllumination: number
  northernLightsCount: number
  lightPollutionCount: number
  highEmissionCount: number
  gracefulCount: number
  displayType: 'grand-display' | 'coronal-ejection' | 'substorm' | 'quiet-aurora' | 'faint-glow' | 'overcast'
  condition: 'observatory' | 'aurora-station' | 'dark-sky' | 'suburban' | 'urban' | 'daylight'
}

export interface AuroraCurtainResult {
  rays: CurtainRay[]
  displays: CurtainDisplay[]
  atmosphere: {
    avgEmission: number
    avgPattern: number
    avgIllumination: number
    isBreathtaking: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalDisplays: number
    avgLightEmission: number
    avgCurtainPattern: number
    avgEnergyTransformation: number
    avgColorDynamics: number
    avgMovementQuality: number
    avgIlluminationPower: number
    northernLightsCount: number
    auroraAustralisCount: number
    substormPeakCount: number
    quietArcCount: number
    cloudedOverCount: number
    lightPollutionCount: number
    hasHighEmissionCount: number
    hasBeautifulPatternCount: number
    hasHighEfficiencyCount: number
    hasRichColorsCount: number
    hasGracefulMovementCount: number
    hasHighIlluminationCount: number
    overallRadiance: number
    auroraGrade: 'chief-aurora-hunter' | 'aurora-photographer' | 'sky-watcher' | 'stargazer' | 'cloud-gazer' | 'cave-dweller'
    bestRay: string
    brightest: string
    bestPattern: string
    mostEfficient: string
    mostColorful: string
    mostGraceful: string
  }
  recommendations: string[]
}

// ─── Emission Measurement ───────────────────────────────────────────────────

/** @example measureEmission(content) returns emission analysis */
export function measureEmission(content: string): EmissionMeasure {
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

  const dimSpotCount = anyCount + todoCount
  const blackoutCount = deepNestedCount + commentedCodeCount

  const hasHighEmission = level >= 80 && hasStructure && hasTypes
  const hasProperIntensity = hasStructure && hasTypes && exportCount > 0
  const hasNoDimSpots = dimSpotCount === 0
  const hasConsistentOutput = hasStructure && hasTypes && hasFunctions
  const hasProperSpectrum = hasFunctions && consoleCount === 0
  const hasNoFlickering = todoCount === 0 && commentedCodeCount === 0
  const hasSteadyGlow = hasStructure && hasTypes && genericsCount_safe(content) > 0
  const hasNoBlackout = blackoutCount === 0
  const hasProperProjection = hasStructure && hasTypes && exportCount > 0
  const hasRadiant = hasStructure && hasTypes && hasFunctions && jsdocCount > 0

  let brightness: EmissionMeasure['brightness'] = 'invisible'
  if (hasHighEmission && hasNoDimSpots && hasNoBlackout && hasRadiant) brightness = 'dazzling'
  else if (hasHighEmission && hasNoDimSpots) brightness = 'brilliant'
  else if (hasHighEmission) brightness = 'bright'
  else if (hasConsistentOutput && hasProperIntensity) brightness = 'visible'
  else if (level > 30) brightness = 'faint'

  return {
    level, brightness, hasHighEmission, hasProperIntensity, hasNoDimSpots,
    hasConsistentOutput, hasProperSpectrum, hasNoFlickering, hasSteadyGlow,
    hasNoBlackout, hasProperProjection, hasRadiant, dimSpotCount, blackoutCount,
  }
}

// ─── Pattern Measurement ────────────────────────────────────────────────────

/** @example measurePattern(content) returns pattern analysis */
export function measurePattern(content: string): PatternMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 10
  if (exportCount > 0) quality += 10
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 4
  if (genericsCount > 0) quality += 4
  if (privateCount === 0 && protectedCount === 0) quality += 3
  if (commentedCodeCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const breakupCount = privateCount + protectedCount
  const fragmentationCount = anyCount + consoleCount

  const hasBeautifulPattern = quality >= 75 && hasStructure && hasTypes
  const hasFlowingForm = hasStructure && hasTypes && hasFunctions
  const hasVerticalStructure = hasStructure && hasTypes
  const hasHorizontalSpread = exportCount > 0 && importCount > 0
  const hasNoBreakup = breakupCount === 0
  const hasProperDrape = hasStructure && hasTypes && genericsCount > 0
  const hasRibbonStructure = hasStructure && hasTypes && exportCount > 0
  const hasNoFragmentation = fragmentationCount === 0
  const hasCoherentForm = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoChaos = deepNestedCount === 0 && commentedCodeCount === 0

  let patternType: PatternMeasure['type'] = 'absent'
  if (hasBeautifulPattern && hasNoBreakup && hasNoFragmentation && hasCoherentForm) patternType = 'curtain'
  else if (hasBeautifulPattern && hasNoBreakup) patternType = 'corona'
  else if (hasBeautifulPattern) patternType = 'band'
  else if (hasFlowingForm && hasRibbonStructure) patternType = 'arc'
  else if (quality > 30) patternType = 'patchy'

  return {
    quality, type: patternType, hasBeautifulPattern, hasFlowingForm,
    hasVerticalStructure, hasHorizontalSpread, hasNoBreakup, hasProperDrape,
    hasRibbonStructure, hasNoFragmentation, hasCoherentForm, hasNoChaos,
    breakupCount, fragmentationCount,
  }
}

// ─── Energy Measurement ─────────────────────────────────────────────────────

/** @example measureEnergy(content) returns energy analysis */
export function measureEnergy(content: string): EnergyMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
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

  let transformation = 25
  if (hasStructure) transformation += 12
  if (hasTypes) transformation += 12
  if (hasFunctions) transformation += 10
  if (jsdocCount > 0) transformation += 8
  if (genericsCount > 0) transformation += 5
  if (exportCount > 0) transformation += 5
  if (importCount > 0) transformation += 5
  if (tryCatchCount > 0) transformation += 5
  if (asyncCount > 0) transformation += 3
  if (consoleCount === 0) transformation += 4
  if (anyCount === 0) transformation += 3
  if (deepNestedCount === 0) transformation += 3
  transformation = Math.min(100, Math.max(0, Math.round(transformation)))

  const wasteCount = anyCount + todoCount
  const leakageCount = deepNestedCount

  const hasHighEfficiency = transformation >= 80 && hasStructure && hasTypes
  const hasProperConversion = hasStructure && hasTypes && exportCount > 0
  const hasNoWaste = wasteCount === 0
  const hasProperTransfer = hasStructure && hasTypes && genericsCount > 0
  const hasNoLeakage = leakageCount === 0
  const hasOptimalPath = hasStructure && hasTypes && hasFunctions
  const hasNoDissipation = consoleCount === 0
  const hasProperAmplification = hasStructure && hasTypes && importCount > 0
  const hasNoOverload = deepNestedCount === 0 && consoleCount === 0
  const hasEfficientCoupling = hasStructure && hasTypes && hasFunctions

  let source: EnergyMeasure['source'] = 'dead'
  if (hasHighEfficiency && hasNoWaste && hasNoLeakage && hasProperAmplification) source = 'solar-wind'
  else if (hasHighEfficiency && hasNoWaste) source = 'magnetosphere'
  else if (hasHighEfficiency) source = 'ionosphere'
  else if (hasOptimalPath && hasProperConversion) source = 'atmospheric'
  else if (transformation > 30) source = 'static'

  return {
    transformation, source, hasHighEfficiency, hasProperConversion,
    hasNoWaste, hasProperTransfer, hasNoLeakage, hasOptimalPath,
    hasNoDissipation, hasProperAmplification, hasNoOverload,
    hasEfficientCoupling, wasteCount, leakageCount,
  }
}

// ─── Color Measurement ──────────────────────────────────────────────────────

/** @example measureColor(content) returns color analysis */
export function measureColor(content: string): ColorMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let dynamics = 20
  if (hasStructure) dynamics += 12
  if (hasTypes) dynamics += 12
  if (hasFunctions) dynamics += 10
  if (jsdocCount > 0) dynamics += 10
  if (genericsCount > 0) dynamics += 5
  if (enumCount > 0) dynamics += 5
  if (anyCount === 0) dynamics += 8
  if (consoleCount === 0) dynamics += 5
  if (todoCount === 0) dynamics += 5
  if (deepNestedCount === 0) dynamics += 8
  dynamics = Math.min(100, Math.max(0, Math.round(dynamics)))

  const fadingCount = todoCount + commentedCodeCount
  const staticCount = deepNestedCount + consoleCount

  const hasRichColors = dynamics >= 80 && hasStructure && hasTypes && anyCount === 0
  const hasGreenPhase = hasStructure && hasTypes
  const hasBluePhase = hasFunctions && asyncCount > 0
  const hasRedPhase = hasStructure && hasTypes && genericsCount > 0
  const hasPurplePhase = enumCount > 0 || reExportCount_safe(content) > 0
  const hasNoColorBlindness = anyCount === 0
  const hasProperTransition = hasStructure && hasTypes && exportCount > 0
  const hasNoFading = fadingCount === 0
  const hasDynamicRange = hasStructure && hasTypes && hasFunctions && genericsCount > 0
  const hasNoStaticDisplay = consoleCount === 0 && commentedCodeCount === 0

  let palette: ColorMeasure['palette'] = 'colorless'
  if (hasRichColors && hasGreenPhase && hasBluePhase && hasRedPhase && hasPurplePhase) palette = 'full-spectrum'
  else if (hasRichColors && hasGreenPhase) palette = 'aurora-green'
  else if (hasRichColors && hasBluePhase) palette = 'aurora-blue'
  else if (hasRichColors && hasRedPhase) palette = 'aurora-red'
  else if (dynamics > 30) palette = 'monochrome'

  return {
    dynamics, palette, hasRichColors, hasGreenPhase, hasBluePhase,
    hasRedPhase, hasPurplePhase, hasNoColorBlindness, hasProperTransition,
    hasNoFading, hasDynamicRange, hasNoStaticDisplay, fadingCount, staticCount,
  }
}

// ─── Movement Measurement ───────────────────────────────────────────────────

/** @example measureMovement(content) returns movement analysis */
export function measureMovement(content: string): MovementMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = reExportCount_safe(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 25
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (reExportCount > 0) quality += 5
  if (asyncCount > 0) quality += 3
  if (tryCatchCount > 0) quality += 5
  if (anyCount === 0) quality += 3
  if (consoleCount === 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const stutteringCount = todoCount
  const stallingCount = deepNestedCount

  const hasGracefulMovement = quality >= 80 && hasStructure && hasTypes
  const hasProperRhythm = jsdocCount > 0 && genericsCount > 0
  const hasNoStuttering = stutteringCount === 0
  const hasPatience = hasStructure && hasTypes && hasFunctions && todoCount === 0
  const hasFluidMotion = hasStructure && hasTypes && hasFunctions && consoleCount === 0
  const hasProperAcceleration = hasFunctions && exportCount > 0
  const hasNoJerking = deepNestedCount === 0 && consoleCount === 0
  const hasSmoothTransitions = hasStructure && hasTypes && genericsCount > 0
  const hasProperVelocity = hasStructure && hasTypes && reExportCount > 0
  const hasNoStalling = deepNestedCount === 0
  const hasDynamic = asyncCount > 0 || tryCatchCount > 0

  let style: MovementMeasure['style'] = 'frozen'
  if (hasGracefulMovement && hasNoStuttering && hasNoStalling && hasProperVelocity) style = 'flowing'
  else if (hasGracefulMovement && hasNoStuttering) style = 'dancing'
  else if (hasGracefulMovement) style = 'rippling'
  else if (hasPatience && hasFluidMotion) style = 'pulsing'
  else if (quality > 30) style = 'static'

  return {
    quality, style, hasGracefulMovement, hasProperRhythm, hasNoStuttering,
    hasFluidMotion, hasProperAcceleration, hasNoJerking, hasSmoothTransitions,
    hasProperVelocity, hasNoStalling, hasDynamic, stutteringCount, stallingCount,
  }
}

// ─── Illumination Measurement ───────────────────────────────────────────────

/** @example measureIllumination(content) returns illumination analysis */
export function measureIllumination(content: string): IlluminationMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = reExportCount_safe(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const commentedCodeCount = countCommentedCode(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let power = 20
  if (hasStructure) power += 12
  if (hasTypes) power += 12
  if (hasFunctions) power += 10
  if (jsdocCount > 0) power += 10
  if (genericsCount > 0) power += 5
  if (exportCount > 0) power += 5
  if (importCount > 0) power += 5
  if (reExportCount > 0) power += 5
  if (asyncCount > 0) power += 3
  if (tryCatchCount > 0) power += 8
  if (anyCount === 0) power += 5
  if (consoleCount === 0) power += 5
  power = Math.min(100, Math.max(0, Math.round(power)))

  const scatterCount = todoCount + countDeepNested(content)
  const shadowCount = anyCount + commentedCodeCount

  const hasHighIllumination = power >= 75 && hasStructure && hasTypes
  const hasWideReach = exportCount > 0 && importCount > 0
  const hasProperFocusing = hasStructure && hasTypes && hasFunctions
  const hasNoScatter = scatterCount === 0
  const hasProperProjection = hasStructure && hasTypes && genericsCount > 0
  const hasDeepPenetration = hasStructure && hasTypes && reExportCount > 0
  const hasNoShadow = shadowCount === 0
  const hasAtmospheric = tryCatchCount > 0 && asyncCount > 0
  const hasNoInterference = privateCount === 0 && protectedCount === 0
  const hasLastingImpression = hasStructure && hasTypes && hasFunctions && jsdocCount > 0

  let reach: IlluminationMeasure['reach'] = 'dark'
  if (hasHighIllumination && hasNoScatter && hasNoShadow && hasDeepPenetration) reach = 'hemisphere'
  else if (hasHighIllumination && hasNoScatter) reach = 'regional'
  else if (hasHighIllumination) reach = 'local'
  else if (hasProperFocusing && hasWideReach) reach = 'spotlight'
  else if (power > 30) reach = 'candle'

  return {
    power, reach, hasHighIllumination, hasWideReach, hasProperFocusing,
    hasNoScatter, hasProperProjection, hasDeepPenetration, hasNoShadow,
    hasAtmospheric, hasNoInterference, hasLastingImpression, scatterCount, shadowCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(ray) returns condition string */
export function classifyCondition(ray: CurtainRay): CurtainRay['condition'] {
  const { qualityScore } = ray
  if (qualityScore >= 80) return 'northern-lights'
  if (qualityScore >= 65) return 'aurora-australis'
  if (qualityScore >= 50) return 'substorm-peak'
  if (qualityScore >= 35) return 'quiet-arc'
  if (qualityScore >= 20) return 'clouded-over'
  return 'light-pollution'
}

// ─── Ray Analysis ───────────────────────────────────────────────────────────

/** @example analyzeCurtainRay(content, filePath) returns full ray */
export function analyzeCurtainRay(content: string, filePath: string): CurtainRay {
  const emission = measureEmission(content)
  const pattern = measurePattern(content)
  const energy = measureEnergy(content)
  const color = measureColor(content)
  const movement = measureMovement(content)
  const illumination = measureIllumination(content)

  const lightEmission = emission.level
  const curtainPattern = pattern.quality
  const energyTransformation = energy.transformation
  const colorDynamics = color.dynamics
  const movementQuality = movement.quality
  const illuminationPower = illumination.power

  const qualityScore = Math.round(
    lightEmission * 0.15 +
    curtainPattern * 0.15 +
    energyTransformation * 0.15 +
    colorDynamics * 0.2 +
    movementQuality * 0.15 +
    illuminationPower * 0.2,
  )

  const ray: CurtainRay = {
    file: filePath,
    lightEmission, curtainPattern, energyTransformation, colorDynamics,
    movementQuality, illuminationPower,
    emission, pattern, energy, color, movement, illumination,
    condition: 'light-pollution',
    qualityScore,
  }

  ray.condition = classifyCondition(ray)

  return ray
}

// ─── Display Analysis ───────────────────────────────────────────────────────

/** @example analyzeCurtainDisplay(rays, dirPath) returns display */
export function analyzeCurtainDisplay(rays: CurtainRay[], dirPath: string): CurtainDisplay {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [], avgEmission: 0, avgPattern: 0, avgIllumination: 0,
      northernLightsCount: 0, lightPollutionCount: 0, highEmissionCount: 0, gracefulCount: 0,
      displayType: 'overcast', condition: 'daylight',
    }
  }

  const avgEmission = Math.round(rays.reduce((s, r) => s + r.lightEmission, 0) / rays.length)
  const avgPattern = Math.round(rays.reduce((s, r) => s + r.curtainPattern, 0) / rays.length)
  const avgIllumination = Math.round(rays.reduce((s, r) => s + r.illuminationPower, 0) / rays.length)

  const northernLightsCount = rays.filter((r) => r.condition === 'northern-lights').length
  const lightPollutionCount = rays.filter((r) => r.condition === 'light-pollution').length
  const highEmissionCount = rays.filter((r) => r.emission.hasHighEmission).length
  const gracefulCount = rays.filter((r) => r.movement.hasGracefulMovement).length

  const displayType = classifyDisplayType(rays)
  const avgScore = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  const condition = classifyDisplayCondition(avgScore)

  return {
    directory: dirPath, rays, avgEmission, avgPattern, avgIllumination,
    northernLightsCount, lightPollutionCount, highEmissionCount, gracefulCount,
    displayType, condition,
  }
}

// ─── Display Classification ─────────────────────────────────────────────────

/** @example classifyDisplayType(rays) returns display type */
export function classifyDisplayType(rays: CurtainRay[]): CurtainDisplay['displayType'] {
  if (rays.length === 0) return 'overcast'
  const avgScore = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  const nlCount = rays.filter((r) => r.condition === 'northern-lights').length
  if (avgScore >= 75 && nlCount >= Math.ceil(rays.length * 0.3)) return 'grand-display'
  if (avgScore >= 60) return 'coronal-ejection'
  if (avgScore >= 45) return 'substorm'
  if (avgScore >= 30) return 'quiet-aurora'
  if (avgScore >= 15) return 'faint-glow'
  return 'overcast'
}

/** @example classifyDisplayCondition(avgScore) returns condition */
export function classifyDisplayCondition(avgScore: number): CurtainDisplay['condition'] {
  if (avgScore >= 80) return 'observatory'
  if (avgScore >= 65) return 'aurora-station'
  if (avgScore >= 50) return 'dark-sky'
  if (avgScore >= 35) return 'suburban'
  if (avgScore >= 20) return 'urban'
  return 'daylight'
}

/** @example classifyAuroraGrade(avgRadiance) returns grade */
export function classifyAuroraGrade(avgRadiance: number): AuroraCurtainResult['stats']['auroraGrade'] {
  if (avgRadiance >= 80) return 'chief-aurora-hunter'
  if (avgRadiance >= 65) return 'aurora-photographer'
  if (avgRadiance >= 50) return 'sky-watcher'
  if (avgRadiance >= 35) return 'stargazer'
  if (avgRadiance >= 20) return 'cloud-gazer'
  return 'cave-dweller'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(rays, displays, atmosphere, stats) returns recommendations */
export function generateRecommendations(
  rays: CurtainRay[],
  displays: CurtainDisplay[],
  atmosphere: AuroraCurtainResult['atmosphere'],
  stats: AuroraCurtainResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgLightEmission < 50) recs.push('Increase light emission — make your code more visible and expressive')
  if (stats.avgCurtainPattern < 50) recs.push('Improve curtain pattern — strengthen code architecture and structure')
  if (stats.avgEnergyTransformation < 50) recs.push('Boost energy transformation — improve code efficiency')
  if (stats.avgColorDynamics < 50) recs.push('Enhance color dynamics — diversify code patterns and types')
  if (stats.avgMovementQuality < 50) recs.push('Smooth movement quality — improve code flow and rhythm')
  if (stats.avgIlluminationPower < 50) recs.push('Amplify illumination power — increase code impact and reach')
  if (stats.lightPollutionCount > rays.length * 0.5) recs.push('Too much light pollution — over half the codebase is barely visible')
  if (stats.hasGracefulMovementCount === 0) recs.push('No graceful movement found — cultivate flowing code patterns')
  if (displays.length > 0 && atmosphere.overallRadiance < 60) recs.push('Overall radiance is dim — patient cultivation of code beauty recommended')
  if (recs.length === 0) recs.push('Breathtaking aurora — your code illuminates the sky like a curtain of light')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildAuroraCurtainResult(files, contents, options) returns full result */
export function buildAuroraCurtainResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): AuroraCurtainResult {
  const rays: CurtainRay[] = files.map((file, i) =>
    analyzeCurtainRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CurtainRay[]>()
  for (const ray of rays) {
    const dir = ray.file.includes('/')
      ? ray.file.substring(0, ray.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const displays: CurtainDisplay[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeCurtainDisplay(dirRays, dir),
  )

  const avgEmission = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.lightEmission, 0) / rays.length)
    : 0
  const avgPattern = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.curtainPattern, 0) / rays.length)
    : 0
  const avgIllumination = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.illuminationPower, 0) / rays.length)
    : 0
  const overallRadiance = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
    : 0
  const isBreathtaking = overallRadiance >= 65

  const atmosphere: AuroraCurtainResult['atmosphere'] = {
    avgEmission, avgPattern, avgIllumination, isBreathtaking, overallRadiance,
  }

  const avgLightEmission = avgEmission
  const avgCurtainPattern = avgPattern
  const avgEnergyTransformation = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.energyTransformation, 0) / rays.length)
    : 0
  const avgColorDynamics = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.colorDynamics, 0) / rays.length)
    : 0
  const avgMovementQuality = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.movementQuality, 0) / rays.length)
    : 0
  const avgIlluminationPower = avgIllumination

  const conditionCounts = {
    northernLights: 0, auroraAustralis: 0, substormPeak: 0,
    quietArc: 0, cloudedOver: 0, lightPollution: 0,
  }
  for (const r of rays) {
    switch (r.condition) {
      case 'northern-lights': conditionCounts.northernLights++; break
      case 'aurora-australis': conditionCounts.auroraAustralis++; break
      case 'substorm-peak': conditionCounts.substormPeak++; break
      case 'quiet-arc': conditionCounts.quietArc++; break
      case 'clouded-over': conditionCounts.cloudedOver++; break
      case 'light-pollution': conditionCounts.lightPollution++; break
    }
  }

  const hasHighEmissionCount = rays.filter((r) => r.emission.hasHighEmission).length
  const hasBeautifulPatternCount = rays.filter((r) => r.pattern.hasBeautifulPattern).length
  const hasHighEfficiencyCount = rays.filter((r) => r.energy.hasHighEfficiency).length
  const hasRichColorsCount = rays.filter((r) => r.color.hasRichColors).length
  const hasGracefulMovementCount = rays.filter((r) => r.movement.hasGracefulMovement).length
  const hasHighIlluminationCount = rays.filter((r) => r.illumination.hasHighIllumination).length

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const brightest = rays.length > 0
    ? rays.reduce((best, r) => r.lightEmission > best.lightEmission ? r : best).file
    : ''
  const bestPattern = rays.length > 0
    ? rays.reduce((best, r) => r.curtainPattern > best.curtainPattern ? r : best).file
    : ''
  const mostEfficient = rays.length > 0
    ? rays.reduce((best, r) => r.energyTransformation > best.energyTransformation ? r : best).file
    : ''
  const mostColorful = rays.length > 0
    ? rays.reduce((best, r) => r.colorDynamics > best.colorDynamics ? r : best).file
    : ''
  const mostGraceful = rays.length > 0
    ? rays.reduce((best, r) => r.movementQuality > best.movementQuality ? r : best).file
    : ''

  const auroraGrade = classifyAuroraGrade(overallRadiance)

  const stats: AuroraCurtainResult['stats'] = {
    totalFiles: files.length, totalDisplays: displays.length,
    avgLightEmission, avgCurtainPattern, avgEnergyTransformation,
    avgColorDynamics, avgMovementQuality, avgIlluminationPower,
    northernLightsCount: conditionCounts.northernLights,
    auroraAustralisCount: conditionCounts.auroraAustralis,
    substormPeakCount: conditionCounts.substormPeak,
    quietArcCount: conditionCounts.quietArc,
    cloudedOverCount: conditionCounts.cloudedOver,
    lightPollutionCount: conditionCounts.lightPollution,
    hasHighEmissionCount, hasBeautifulPatternCount, hasHighEfficiencyCount,
    hasRichColorsCount, hasGracefulMovementCount, hasHighIlluminationCount,
    overallRadiance, auroraGrade,
    bestRay, brightest, bestPattern, mostEfficient, mostColorful, mostGraceful,
  }

  const recommendations = generateRecommendations(rays, displays, atmosphere, stats)

  return { rays, displays, atmosphere, stats, recommendations }
}
