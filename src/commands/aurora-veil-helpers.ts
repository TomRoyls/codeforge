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
const TERNARY_REGEX = /\?[^:]+:/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const RETURN_TYPE_REGEX = /\)\s*:\s*\w+/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const ERROR_THROW_REGEX = /\bthrow\s+/g
const PROMISE_REGEX = /\bPromise\b/g
const STRING_TEMPLATE_REGEX = /`[^`]*\$\{/g
const DESTRUCTURE_REGEX = /\{[^}]*\}\s*=/g
const DECORATOR_REGEX = /@\w+/g

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
function countTernaryOps(content: string): number { return countMatches(content, TERNARY_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countGenericsUsage(content: string): number { return countMatches(content, GENERICS_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countProtectedMembers(content: string): number { return countMatches(content, PROTECTED_REGEX) }
function countStaticMembers(content: string): number { return countMatches(content, STATIC_REGEX) }
function countReadonlyMembers(content: string): number { return countMatches(content, READONLY_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function countConditionals(content: string): number { return countMatches(content, CONDITIONAL_REGEX) }
function countLoops(content: string): number { return countMatches(content, LOOP_REGEX) }
function countErrorThrows(content: string): number { return countMatches(content, ERROR_THROW_REGEX) }
function countPromiseUsage(content: string): number { return countMatches(content, PROMISE_REGEX) }
function countTemplateLiterals(content: string): number { return countMatches(content, STRING_TEMPLATE_REGEX) }
function countDestructures(content: string): number { return countMatches(content, DESTRUCTURE_REGEX) }
function countDecorators(content: string): number { return countMatches(content, DECORATOR_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface LuminosityMeasure {
  level: number
  brightness: 'blinding' | 'bright' | 'moderate' | 'faint' | 'dim' | 'dark'
  hasHighLuminosity: boolean
  hasGreenEmission: boolean
  hasRedEmission: boolean
  hasBlueEmission: boolean
  hasVioletEmission: boolean
  hasNoLightPollution: boolean
  hasProperAltitude: boolean
  hasCurtainForm: boolean
  hasNoBreakup: boolean
  hasPersistent: boolean
  lightPollutionCount: number
  breakupCount: number
}

export interface SpectrumMeasure {
  diversity: number
  palette: 'full-rainbow' | 'tricolor' | 'bicolor' | 'monochrome' | 'infrared' | 'invisible'
  hasRichSpectrum: boolean
  hasOxygenGreen: boolean
  hasOxygenRed: boolean
  hasNitrogenBlue: boolean
  hasNitrogenViolet: boolean
  hasNoSpectralGap: boolean
  hasProperWavelength: boolean
  hasContinuousEmission: boolean
  hasNoAbsorption: boolean
  hasEmissionPeaks: boolean
  gapCount: number
  absorptionCount: number
}

export interface MagneticMeasure {
  deflection: number
  field: 'dipole' | 'quadrupole' | 'multipole' | 'distorted' | 'weak' | 'absent'
  hasProperStructure: boolean
  hasFieldLines: boolean
  hasMagnetopause: boolean
  hasNoReconnection: boolean
  hasVanAllenBelt: boolean
  hasPolarCusp: boolean
  hasAuroralOval: boolean
  hasNoMagneticStorm: boolean
  hasProperFieldStrength: boolean
  hasNoFieldCollapse: boolean
  reconnectionCount: number
  stormCount: number
}

export interface IonosphereMeasure {
  charge: number
  layer: 'f-layer' | 'e-layer' | 'd-layer' | 'sporadic-e' | 'ionospheric-storm' | 'dead-zone'
  hasHighEnergy: boolean
  hasProperIonization: boolean
  hasElectronDensity: boolean
  hasNoAbsorption: boolean
  hasProperConductivity: boolean
  hasNoScintillation: boolean
  hasPlasmaBubbles: boolean
  hasTravelingWave: boolean
  hasNoBlackout: boolean
  hasProperReflection: boolean
  blackoutCount: number
  scintillationCount: number
}

export interface ParticleMeasure {
  collision: number
  source: 'solar-wind' | 'magnetosphere' | 'cosmic-rays' | 'precipitation' | 'scattered' | 'none'
  hasHighInteraction: boolean
  hasProperPrecipitation: boolean
  hasElectronCascade: boolean
  hasNoOverIonization: boolean
  hasProperEnergy: boolean
  hasBremsstrahlung: boolean
  hasNoParticleLoss: boolean
  hasProperScattering: boolean
  hasNoBeamInstability: boolean
  hasMirroring: boolean
  overIonizationCount: number
  beamInstabilityCount: number
}

export interface GrandeurMeasure {
  score: number
  display: 'corona' | 'curtain' | 'band' | 'patch' | 'glow' | 'void'
  isGrand: boolean
  hasSubstorm: boolean
  hasPiPulsations: boolean
  hasNoFadeout: boolean
  hasCrown: boolean
  hasRayedStructure: boolean
  hasNoDisruption: boolean
  hasProperDuration: boolean
  hasNoOscillation: boolean
  hasZenith: boolean
  fadeoutCount: number
  disruptionCount: number
}

export interface AuroraCurtain {
  file: string
  curtainLuminosity: number
  colorSpectrum: number
  magneticDeflection: number
  ionosphericCharge: number
  particleCollision: number
  celestialGrandeur: number
  luminosity: LuminosityMeasure
  spectrum: SpectrumMeasure
  magnetic: MagneticMeasure
  ionosphere: IonosphereMeasure
  particle: ParticleMeasure
  grandeur: GrandeurMeasure
  condition: 'solar-maximum' | 'storm-peak' | 'active-night' | 'quiet-arc' | 'substorm' | 'clouded-out'
  qualityScore: number
}

export interface AuroraRegion {
  directory: string
  curtains: AuroraCurtain[]
  avgLuminosity: number
  avgStructure: number
  avgGrandeur: number
  solarMaximumCount: number
  cloudedOutCount: number
  highLuminosityCount: number
  grandCount: number
  regionType: 'aurora-oval' | 'polar-cap' | 'sub-auroral' | 'mid-latitude' | 'equatorial' | 'dark-side'
  condition: 'observatory' | 'viewing-station' | 'dark-sky-reserve' | 'city-lights' | 'overcast' | 'daylight'
}

export interface AuroraVeilResult {
  curtains: AuroraCurtain[]
  regions: AuroraRegion[]
  sky: {
    avgLuminosity: number
    avgStructure: number
    avgGrandeur: number
    isBreathtaking: boolean
    overallGrandeur: number
  }
  stats: {
    totalFiles: number
    totalRegions: number
    avgCurtainLuminosity: number
    avgColorSpectrum: number
    avgMagneticDeflection: number
    avgIonosphericCharge: number
    avgParticleCollision: number
    avgCelestialGrandeur: number
    solarMaximumCount: number
    stormPeakCount: number
    activeNightCount: number
    quietArcCount: number
    substormCount: number
    cloudedOutCount: number
    hasHighLuminosityCount: number
    hasRichSpectrumCount: number
    hasProperStructureCount: number
    hasHighEnergyCount: number
    hasHighInteractionCount: number
    isGrandCount: number
    overallGrandeur: number
    astronomerGrade: 'aurora-hunter' | 'astrophysicist' | 'astronomer' | 'sky-watcher' | 'stargazer' | 'blind-spot'
    bestCurtain: string
    brightest: string
    mostDiverse: string
    bestStructured: string
    mostEnergetic: string
    grandest: string
  }
  recommendations: string[]
}

// ─── Luminosity Measurement ─────────────────────────────────────────────────

/** @example measureLuminosity(content) returns luminosity analysis */
export function measureLuminosity(content: string): LuminosityMeasure {
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
  if (asyncCount > 0) level += 5
  if (consoleCount === 0) level += 5
  if (anyCount === 0) level += 4
  if (todoCount === 0) level += 3
  level = Math.min(100, Math.max(0, Math.round(level)))

  const lightPollutionCount = consoleCount + commentedCodeCount
  const breakupCount = deepNestedCount + todoCount

  const hasHighLuminosity = level >= 80 && hasStructure && hasTypes
  const hasGreenEmission = hasStructure && hasTypes
  const hasRedEmission = hasStructure && hasTypes && jsdocCount > 0
  const hasBlueEmission = asyncCount > 0 && hasFunctions
  const hasVioletEmission = hasStructure && hasTypes && hasFunctions && jsdocCount > 0 && exportCount > 0
  const hasNoLightPollution = lightPollutionCount === 0
  const hasProperAltitude = hasStructure && hasTypes && hasFunctions
  const hasCurtainForm = hasStructure && exportCount > 0 && importCount > 0
  const hasNoBreakup = breakupCount === 0
  const hasPersistent = hasStructure && hasTypes && anyCount === 0 && todoCount === 0

  let brightness: LuminosityMeasure['brightness'] = 'dark'
  if (level >= 90) brightness = 'blinding'
  else if (level >= 75) brightness = 'bright'
  else if (level >= 55) brightness = 'moderate'
  else if (level >= 35) brightness = 'faint'
  else if (level >= 20) brightness = 'dim'

  return {
    level,
    brightness,
    hasHighLuminosity,
    hasGreenEmission,
    hasRedEmission,
    hasBlueEmission,
    hasVioletEmission,
    hasNoLightPollution,
    hasProperAltitude,
    hasCurtainForm,
    hasNoBreakup,
    hasPersistent,
    lightPollutionCount,
    breakupCount,
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
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const asyncCount = countAsyncKeywords(content)
  const destructures = countDestructures(content)
  const decorators = countDecorators(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let diversity = 20
  if (hasStructure) diversity += 12
  if (hasTypes) diversity += 12
  if (enumCount > 0) diversity += 5
  if (hasFunctions) diversity += 10
  if (jsdocCount > 0) diversity += 8
  if (genericsCount > 0) diversity += 5
  if (exportCount > 0) diversity += 5
  if (importCount > 0) diversity += 5
  if (readonlyCount > 0) diversity += 3
  if (privateCount > 0 || protectedCount > 0) diversity += 3
  if (staticCount > 0) diversity += 2
  if (asyncCount > 0) diversity += 3
  if (destructures > 0) diversity += 2
  if (decorators > 0) diversity += 2
  if (anyCount === 0) diversity += 3
  diversity = Math.min(100, Math.max(0, Math.round(diversity)))

  const gapCount = anyCount + consoleCount
  const absorptionCount = anyCount

  const hasRichSpectrum = diversity >= 75
  const hasOxygenGreen = hasStructure && hasTypes
  const hasOxygenRed = hasStructure && hasTypes && genericsCount > 0
  const hasNitrogenBlue = hasFunctions && asyncCount > 0
  const hasNitrogenViolet = hasStructure && hasTypes && hasFunctions && jsdocCount > 0 && genericsCount > 0
  const hasNoSpectralGap = gapCount === 0
  const hasProperWavelength = exportCount > 0 && importCount > 0
  const hasContinuousEmission = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasNoAbsorption = absorptionCount === 0
  const hasEmissionPeaks = hasStructure && hasTypes && hasFunctions && jsdocCount > 0 && exportCount > 0

  let palette: SpectrumMeasure['palette'] = 'invisible'
  if (hasNitrogenViolet && hasRichSpectrum && hasNoSpectralGap) palette = 'full-rainbow'
  else if (hasOxygenRed && hasNitrogenBlue && hasOxygenGreen) palette = 'tricolor'
  else if (hasOxygenGreen && hasNitrogenBlue) palette = 'bicolor'
  else if (hasOxygenGreen) palette = 'monochrome'
  else if (diversity > 30) palette = 'infrared'

  return {
    diversity,
    palette,
    hasRichSpectrum,
    hasOxygenGreen,
    hasOxygenRed,
    hasNitrogenBlue,
    hasNitrogenViolet,
    hasNoSpectralGap,
    hasProperWavelength,
    hasContinuousEmission,
    hasNoAbsorption,
    hasEmissionPeaks,
    gapCount,
    absorptionCount,
  }
}

// ─── Magnetic Measurement ──────────────────────────────────────────────────

/** @example measureMagnetic(content) returns magnetic analysis */
export function measureMagnetic(content: string): MagneticMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const errorThrowCount = countErrorThrows(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const staticCount = countStaticMembers(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const consoleCount = countConsoleUsage(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let deflection = 25
  if (hasStructure) deflection += 15
  if (hasTypes) deflection += 15
  if (enumCount > 0) deflection += 5
  if (hasFunctions) deflection += 10
  if (exportCount > 0) deflection += 5
  if (importCount > 0) deflection += 5
  if (tryCatchCount > 0) deflection += 5
  if (errorThrowCount > 0) deflection += 3
  if (privateCount > 0 || protectedCount > 0) deflection += 3
  if (staticCount > 0) deflection += 2
  if (readonlyCount > 0) deflection += 2
  if (anyCount === 0) deflection += 3
  if (consoleCount === 0) deflection += 2
  deflection = Math.min(100, Math.max(0, Math.round(deflection)))

  const reconnectionCount = deepNestedCount
  const stormCount = consoleCount + anyCount

  const hasProperStructure = hasStructure && hasTypes && hasFunctions
  const hasFieldLines = hasStructure && hasTypes && exportCount > 0
  const hasMagnetopause = importCount > 0 && exportCount > 0
  const hasNoReconnection = reconnectionCount === 0
  const hasVanAllenBelt = hasStructure && hasTypes && tryCatchCount > 0
  const hasPolarCusp = hasFunctions && exportCount > 0
  const hasAuroralOval = hasProperStructure && (privateCount > 0 || protectedCount > 0)
  const hasNoMagneticStorm = stormCount === 0
  const hasProperFieldStrength = hasProperStructure && anyCount === 0
  const hasNoFieldCollapse = hasStructure && hasTypes

  let field: MagneticMeasure['field'] = 'absent'
  if (hasProperStructure && hasAuroralOval && hasNoMagneticStorm && hasNoReconnection) field = 'dipole'
  else if (hasProperStructure && hasAuroralOval) field = 'quadrupole'
  else if (hasProperStructure) field = 'multipole'
  else if (hasStructure || hasTypes) field = 'distorted'
  else if (hasFunctions) field = 'weak'

  return {
    deflection,
    field,
    hasProperStructure,
    hasFieldLines,
    hasMagnetopause,
    hasNoReconnection,
    hasVanAllenBelt,
    hasPolarCusp,
    hasAuroralOval,
    hasNoMagneticStorm,
    hasProperFieldStrength,
    hasNoFieldCollapse,
    reconnectionCount,
    stormCount,
  }
}

// ─── Ionosphere Measurement ────────────────────────────────────────────────

/** @example measureIonosphere(content) returns ionosphere analysis */
export function measureIonosphere(content: string): IonosphereMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const promiseCount = countPromiseUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const templateLiterals = countTemplateLiterals(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let charge = 25
  if (hasStructure) charge += 12
  if (hasTypes) charge += 12
  if (hasFunctions) charge += 10
  if (jsdocCount > 0) charge += 8
  if (genericsCount > 0) charge += 5
  if (asyncCount > 0) charge += 5
  if (tryCatchCount > 0) charge += 5
  if (promiseCount > 0) charge += 3
  if (exportCount > 0) charge += 5
  if (importCount > 0) charge += 5
  if (readonlyCount > 0) charge += 3
  if (templateLiterals > 0) charge += 2
  if (anyCount === 0) charge += 3
  if (consoleCount === 0) charge += 2
  charge = Math.min(100, Math.max(0, Math.round(charge)))

  const blackoutCount = consoleCount + deepNestedCount
  const scintillationCount = todoCount + anyCount

  const hasHighEnergy = charge >= 75 && hasStructure && hasTypes
  const hasProperIonization = hasStructure && hasTypes && hasFunctions
  const hasElectronDensity = hasFunctions && (asyncCount > 0 || promiseCount > 0)
  const hasNoAbsorption = blackoutCount === 0
  const hasProperConductivity = hasStructure && hasTypes && exportCount > 0
  const hasNoScintillation = scintillationCount === 0
  const hasPlasmaBubbles = hasStructure && hasTypes && genericsCount > 0
  const hasTravelingWave = hasFunctions && importCount > 0 && exportCount > 0
  const hasNoBlackout = blackoutCount === 0
  const hasProperReflection = tryCatchCount > 0 && hasFunctions

  let layer: IonosphereMeasure['layer'] = 'dead-zone'
  if (hasHighEnergy && hasProperIonization && hasNoAbsorption && hasNoScintillation) layer = 'f-layer'
  else if (hasProperIonization && hasNoAbsorption) layer = 'e-layer'
  else if (hasProperIonization) layer = 'd-layer'
  else if (hasProperConductivity) layer = 'sporadic-e'
  else if (charge > 30) layer = 'ionospheric-storm'

  return {
    charge,
    layer,
    hasHighEnergy,
    hasProperIonization,
    hasElectronDensity,
    hasNoAbsorption,
    hasProperConductivity,
    hasNoScintillation,
    hasPlasmaBubbles,
    hasTravelingWave,
    hasNoBlackout,
    hasProperReflection,
    blackoutCount,
    scintillationCount,
  }
}

// ─── Particle Measurement ──────────────────────────────────────────────────

/** @example measureParticle(content) returns particle analysis */
export function measureParticle(content: string): ParticleMeasure {
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
  const conditionalsCount = countConditionals(content)
  const loopsCount = countLoops(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let collision = 25
  if (hasStructure) collision += 12
  if (hasTypes) collision += 12
  if (hasFunctions) collision += 10
  if (jsdocCount > 0) collision += 8
  if (genericsCount > 0) collision += 5
  if (exportCount > 0) collision += 5
  if (importCount > 0) collision += 5
  if (reExportCount > 0) collision += 5
  if (asyncCount > 0) collision += 3
  if (tryCatchCount > 0) collision += 5
  if (conditionalsCount > 0) collision += 3
  if (loopsCount > 0) collision += 2
  if (anyCount === 0) collision += 3
  if (consoleCount === 0) collision += 2
  collision = Math.min(100, Math.max(0, Math.round(collision)))

  const overIonizationCount = deepNestedCount + todoCount
  const beamInstabilityCount = anyCount + consoleCount

  const hasHighInteraction = collision >= 75 && hasStructure && hasTypes
  const hasProperPrecipitation = hasFunctions && exportCount > 0
  const hasElectronCascade = hasStructure && hasTypes && hasFunctions && genericsCount > 0
  const hasNoOverIonization = overIonizationCount === 0
  const hasProperEnergy = hasStructure && hasTypes && tryCatchCount > 0
  const hasBremsstrahlung = reExportCount > 0 || (exportCount > 0 && importCount > 0)
  const hasNoParticleLoss = anyCount === 0 && consoleCount === 0
  const hasProperScattering = conditionalsCount > 0 || loopsCount > 0
  const hasNoBeamInstability = beamInstabilityCount === 0
  const hasMirroring = hasStructure && hasTypes && exportCount > 0 && importCount > 0

  let source: ParticleMeasure['source'] = 'none'
  if (hasHighInteraction && hasElectronCascade && hasNoOverIonization) source = 'solar-wind'
  else if (hasHighInteraction) source = 'magnetosphere'
  else if (hasElectronCascade) source = 'cosmic-rays'
  else if (hasProperPrecipitation) source = 'precipitation'
  else if (collision > 30) source = 'scattered'

  return {
    collision,
    source,
    hasHighInteraction,
    hasProperPrecipitation,
    hasElectronCascade,
    hasNoOverIonization,
    hasProperEnergy,
    hasBremsstrahlung,
    hasNoParticleLoss,
    hasProperScattering,
    hasNoBeamInstability,
    hasMirroring,
    overIonizationCount,
    beamInstabilityCount,
  }
}

// ─── Grandeur Measurement ──────────────────────────────────────────────────

/** @example measureGrandeur(content) returns grandeur analysis */
export function measureGrandeur(content: string): GrandeurMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let score = 20
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (enumCount > 0) score += 5
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (asyncCount > 0) score += 5
  if (tryCatchCount > 0) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (privateCount > 0 || protectedCount > 0) score += 3
  if (staticCount > 0) score += 3
  if (readonlyCount > 0) score += 2
  if (anyCount === 0) score += 3
  if (consoleCount === 0) score += 3
  score = Math.min(100, Math.max(0, Math.round(score)))

  const fadeoutCount = todoCount + commentedCodeCount
  const disruptionCount = deepNestedCount + consoleCount

  const isGrand = score >= 80 && anyCount === 0 && todoCount === 0
  const hasSubstorm = hasStructure && hasTypes && hasFunctions && tryCatchCount > 0
  const hasPiPulsations = hasFunctions && (asyncCount > 0 || genericsCount > 0)
  const hasNoFadeout = fadeoutCount === 0
  const hasCrown = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0
  const hasRayedStructure = hasStructure && hasTypes && (privateCount > 0 || protectedCount > 0) && readonlyCount > 0
  const hasNoDisruption = disruptionCount === 0
  const hasProperDuration = hasStructure && hasTypes && hasFunctions && exportCount > 0
  const hasNoOscillation = deepNestedCount === 0 && anyCount === 0
  const hasZenith = isGrand && hasCrown && hasNoDisruption

  let display: GrandeurMeasure['display'] = 'void'
  if (isGrand && hasCrown && hasRayedStructure && hasNoDisruption) display = 'corona'
  else if (isGrand && hasCrown) display = 'curtain'
  else if (score >= 65 && hasProperDuration) display = 'band'
  else if (score >= 45 && hasProperDuration) display = 'patch'
  else if (score >= 25) display = 'glow'

  return {
    score,
    display,
    isGrand,
    hasSubstorm,
    hasPiPulsations,
    hasNoFadeout,
    hasCrown,
    hasRayedStructure,
    hasNoDisruption,
    hasProperDuration,
    hasNoOscillation,
    hasZenith,
    fadeoutCount,
    disruptionCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(curtain) returns condition string */
export function classifyCondition(curtain: AuroraCurtain): AuroraCurtain['condition'] {
  const { qualityScore } = curtain
  if (qualityScore >= 80) return 'solar-maximum'
  if (qualityScore >= 65) return 'storm-peak'
  if (qualityScore >= 50) return 'active-night'
  if (qualityScore >= 35) return 'quiet-arc'
  if (qualityScore >= 20) return 'substorm'
  return 'clouded-out'
}

// ─── Curtain Analysis ───────────────────────────────────────────────────────

/** @example analyzeAuroraCurtain(content, filePath) returns full curtain */
export function analyzeAuroraCurtain(content: string, filePath: string): AuroraCurtain {
  const luminosity = measureLuminosity(content)
  const spectrum = measureSpectrum(content)
  const magnetic = measureMagnetic(content)
  const ionosphere = measureIonosphere(content)
  const particle = measureParticle(content)
  const grandeur = measureGrandeur(content)

  const curtainLuminosity = luminosity.level
  const colorSpectrum = spectrum.diversity
  const magneticDeflection = magnetic.deflection
  const ionosphericCharge = ionosphere.charge
  const particleCollision = particle.collision
  const celestialGrandeur = grandeur.score

  const qualityScore = Math.round(
    curtainLuminosity * 0.15 +
    colorSpectrum * 0.15 +
    magneticDeflection * 0.2 +
    ionosphericCharge * 0.15 +
    particleCollision * 0.15 +
    celestialGrandeur * 0.2,
  )

  const curtain: AuroraCurtain = {
    file: filePath,
    curtainLuminosity,
    colorSpectrum,
    magneticDeflection,
    ionosphericCharge,
    particleCollision,
    celestialGrandeur,
    luminosity,
    spectrum,
    magnetic,
    ionosphere,
    particle,
    grandeur,
    condition: 'clouded-out',
    qualityScore,
  }

  curtain.condition = classifyCondition(curtain)

  return curtain
}

// ─── Region Analysis ────────────────────────────────────────────────────────

/** @example analyzeAuroraRegion(curtains, dirPath) returns region */
export function analyzeAuroraRegion(curtains: AuroraCurtain[], dirPath: string): AuroraRegion {
  if (curtains.length === 0) {
    return {
      directory: dirPath,
      curtains: [],
      avgLuminosity: 0,
      avgStructure: 0,
      avgGrandeur: 0,
      solarMaximumCount: 0,
      cloudedOutCount: 0,
      highLuminosityCount: 0,
      grandCount: 0,
      regionType: 'dark-side',
      condition: 'daylight',
    }
  }

  const avgLuminosity = Math.round(curtains.reduce((s, c) => s + c.curtainLuminosity, 0) / curtains.length)
  const avgStructure = Math.round(curtains.reduce((s, c) => s + c.magneticDeflection, 0) / curtains.length)
  const avgGrandeur = Math.round(curtains.reduce((s, c) => s + c.celestialGrandeur, 0) / curtains.length)

  const solarMaximumCount = curtains.filter((c) => c.condition === 'solar-maximum').length
  const cloudedOutCount = curtains.filter((c) => c.condition === 'clouded-out').length
  const highLuminosityCount = curtains.filter((c) => c.luminosity.hasHighLuminosity).length
  const grandCount = curtains.filter((c) => c.grandeur.isGrand).length

  const regionType = classifyRegionType(curtains)
  const avgQuality = curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length
  const condition = classifyRegionCondition(avgQuality)

  return {
    directory: dirPath,
    curtains,
    avgLuminosity,
    avgStructure,
    avgGrandeur,
    solarMaximumCount,
    cloudedOutCount,
    highLuminosityCount,
    grandCount,
    regionType,
    condition,
  }
}

// ─── Region Classification ─────────────────────────────────────────────────

/** @example classifyRegionType(curtains) returns region type */
export function classifyRegionType(curtains: AuroraCurtain[]): AuroraRegion['regionType'] {
  if (curtains.length === 0) return 'dark-side'
  const avgQuality = curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length
  const solarMaximumCount = curtains.filter((c) => c.condition === 'solar-maximum').length
  if (avgQuality >= 75 && solarMaximumCount >= Math.ceil(curtains.length * 0.3)) return 'aurora-oval'
  if (avgQuality >= 60) return 'polar-cap'
  if (avgQuality >= 45) return 'sub-auroral'
  if (avgQuality >= 30) return 'mid-latitude'
  if (avgQuality >= 15) return 'equatorial'
  return 'dark-side'
}

/** @example classifyRegionCondition(avgQuality) returns condition */
export function classifyRegionCondition(avgQuality: number): AuroraRegion['condition'] {
  if (avgQuality >= 80) return 'observatory'
  if (avgQuality >= 65) return 'viewing-station'
  if (avgQuality >= 50) return 'dark-sky-reserve'
  if (avgQuality >= 35) return 'city-lights'
  if (avgQuality >= 20) return 'overcast'
  return 'daylight'
}

/** @example classifyAstronomerGrade(avgGrandeur) returns grade */
export function classifyAstronomerGrade(avgGrandeur: number): AuroraVeilResult['stats']['astronomerGrade'] {
  if (avgGrandeur >= 80) return 'aurora-hunter'
  if (avgGrandeur >= 65) return 'astrophysicist'
  if (avgGrandeur >= 50) return 'astronomer'
  if (avgGrandeur >= 35) return 'sky-watcher'
  if (avgGrandeur >= 20) return 'stargazer'
  return 'blind-spot'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(curtains, regions, sky, stats) returns recommendations */
export function generateRecommendations(
  curtains: AuroraCurtain[],
  regions: AuroraRegion[],
  sky: AuroraVeilResult['sky'],
  stats: AuroraVeilResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgCurtainLuminosity < 50) {
    recs.push('Increase curtain luminosity — add clearer structure, types, and documentation')
  }
  if (stats.avgColorSpectrum < 50) {
    recs.push('Broaden color spectrum — use more diverse code patterns and constructs')
  }
  if (stats.avgMagneticDeflection < 50) {
    recs.push('Strengthen magnetic deflection — build a more structured code foundation')
  }
  if (stats.avgIonosphericCharge < 50) {
    recs.push('Boost ionospheric charge — add async patterns, generics, and error handling')
  }
  if (stats.avgParticleCollision < 50) {
    recs.push('Enhance particle collision — improve code interaction and integration')
  }
  if (stats.avgCelestialGrandeur < 50) {
    recs.push('Elevate celestial grandeur — aim for grand, well-crafted code')
  }
  if (stats.cloudedOutCount > curtains.length * 0.5) {
    recs.push('Too many clouded-out files — over half lack aurora quality')
  }
  if (stats.isGrandCount === 0) {
    recs.push('No grand displays found — strive for breathtaking code')
  }
  if (regions.length > 0 && sky.overallGrandeur < 60) {
    recs.push('Overall sky grandeur is low — systematic improvement recommended')
  }
  if (recs.length === 0) {
    recs.push('Breathtaking aurora display — your code radiates celestial beauty')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildAuroraVeilResult(files, contents, options) returns full result */
export function buildAuroraVeilResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): AuroraVeilResult {
  const curtains: AuroraCurtain[] = files.map((file, i) =>
    analyzeAuroraCurtain(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AuroraCurtain[]>()
  for (const curtain of curtains) {
    const dir = curtain.file.includes('/')
      ? curtain.file.substring(0, curtain.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(curtain)
    } else {
      dirMap.set(dir, [curtain])
    }
  }

  const regions: AuroraRegion[] = Array.from(dirMap.entries()).map(([dir, dirCurtains]) =>
    analyzeAuroraRegion(dirCurtains, dir),
  )

  const avgLuminosity = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.curtainLuminosity, 0) / curtains.length)
    : 0
  const avgStructure = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.magneticDeflection, 0) / curtains.length)
    : 0
  const avgGrandeur = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.celestialGrandeur, 0) / curtains.length)
    : 0
  const overallGrandeur = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.qualityScore, 0) / curtains.length)
    : 0
  const isBreathtaking = overallGrandeur >= 65

  const sky: AuroraVeilResult['sky'] = {
    avgLuminosity,
    avgStructure,
    avgGrandeur,
    isBreathtaking,
    overallGrandeur,
  }

  const avgCurtainLuminosity = avgLuminosity
  const avgColorSpectrum = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.colorSpectrum, 0) / curtains.length)
    : 0
  const avgMagneticDeflection = avgStructure
  const avgIonosphericCharge = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.ionosphericCharge, 0) / curtains.length)
    : 0
  const avgParticleCollision = curtains.length > 0
    ? Math.round(curtains.reduce((s, c) => s + c.particleCollision, 0) / curtains.length)
    : 0
  const avgCelestialGrandeur = avgGrandeur

  const conditionCounts = {
    solarMaximum: 0,
    stormPeak: 0,
    activeNight: 0,
    quietArc: 0,
    substorm: 0,
    cloudedOut: 0,
  }
  for (const c of curtains) {
    switch (c.condition) {
      case 'solar-maximum': conditionCounts.solarMaximum++; break
      case 'storm-peak': conditionCounts.stormPeak++; break
      case 'active-night': conditionCounts.activeNight++; break
      case 'quiet-arc': conditionCounts.quietArc++; break
      case 'substorm': conditionCounts.substorm++; break
      case 'clouded-out': conditionCounts.cloudedOut++; break
    }
  }

  const hasHighLuminosityCount = curtains.filter((c) => c.luminosity.hasHighLuminosity).length
  const hasRichSpectrumCount = curtains.filter((c) => c.spectrum.hasRichSpectrum).length
  const hasProperStructureCount = curtains.filter((c) => c.magnetic.hasProperStructure).length
  const hasHighEnergyCount = curtains.filter((c) => c.ionosphere.hasHighEnergy).length
  const hasHighInteractionCount = curtains.filter((c) => c.particle.hasHighInteraction).length
  const isGrandCount = curtains.filter((c) => c.grandeur.isGrand).length

  const bestCurtain = curtains.length > 0
    ? curtains.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file
    : ''
  const brightest = curtains.length > 0
    ? curtains.reduce((best, c) => c.curtainLuminosity > best.curtainLuminosity ? c : best).file
    : ''
  const mostDiverse = curtains.length > 0
    ? curtains.reduce((best, c) => c.colorSpectrum > best.colorSpectrum ? c : best).file
    : ''
  const bestStructured = curtains.length > 0
    ? curtains.reduce((best, c) => c.magneticDeflection > best.magneticDeflection ? c : best).file
    : ''
  const mostEnergetic = curtains.length > 0
    ? curtains.reduce((best, c) => c.ionosphericCharge > best.ionosphericCharge ? c : best).file
    : ''
  const grandest = curtains.length > 0
    ? curtains.reduce((best, c) => c.celestialGrandeur > best.celestialGrandeur ? c : best).file
    : ''

  const astronomerGrade = classifyAstronomerGrade(overallGrandeur)

  const stats: AuroraVeilResult['stats'] = {
    totalFiles: files.length,
    totalRegions: regions.length,
    avgCurtainLuminosity,
    avgColorSpectrum,
    avgMagneticDeflection,
    avgIonosphericCharge,
    avgParticleCollision,
    avgCelestialGrandeur,
    solarMaximumCount: conditionCounts.solarMaximum,
    stormPeakCount: conditionCounts.stormPeak,
    activeNightCount: conditionCounts.activeNight,
    quietArcCount: conditionCounts.quietArc,
    substormCount: conditionCounts.substorm,
    cloudedOutCount: conditionCounts.cloudedOut,
    hasHighLuminosityCount,
    hasRichSpectrumCount,
    hasProperStructureCount,
    hasHighEnergyCount,
    hasHighInteractionCount,
    isGrandCount,
    overallGrandeur,
    astronomerGrade,
    bestCurtain,
    brightest,
    mostDiverse,
    bestStructured,
    mostEnergetic,
    grandest,
  }

  const recommendations = generateRecommendations(curtains, regions, sky, stats)

  return {
    curtains,
    regions,
    sky,
    stats,
    recommendations,
  }
}
