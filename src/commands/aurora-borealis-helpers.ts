// ─── Interfaces ────────────────────────────────────────────────────────────

export interface LightMeasure {
  intensity: number
  brightness: 'dazzling' | 'bright' | 'moderate' | 'faint' | 'dim' | 'dark'
  isBrilliant: boolean
  hasHighIntensity: boolean
  hasPersistentGlow: boolean
  hasPulsating: boolean
  hasSubstorm: boolean
  hasQuietArc: boolean
  hasRayedBand: boolean
  hasCorona: boolean
  hasDiffuse: boolean
  hasNoLight: boolean
  peakIntensity: number
}

export interface ColorMeasure {
  spectrum: number
  dominant: 'green' | 'purple' | 'red' | 'blue' | 'yellow' | 'white'
  hasGreenEmission: boolean
  hasPurpleEmission: boolean
  hasRedEmission: boolean
  hasBlueEmission: boolean
  hasYellowEmission: boolean
  hasWhiteEmission: boolean
  hasFullSpectrum: boolean
  hasMonochrome: boolean
  hasColorShift: boolean
  emissionCount: number
}

export interface MagneticMeasure {
  alignment: number
  pole: 'north' | 'south' | 'equatorial' | 'polar-cap' | 'auroral-oval' | 'disconnected'
  isAligned: boolean
  hasFieldLineConnection: boolean
  hasProperOrientation: boolean
  hasMagneticReconnection: boolean
  hasFieldStrength: boolean
  hasPolarity: boolean
  hasDipAngle: number
  hasMagnetopause: boolean
  hasVanAllenBelt: boolean
  hasDisturbance: boolean
  disturbanceCount: number
}

export interface SolarMeasure {
  activity: number
  cycle: 'solar-maximum' | 'rising' | 'solar-minimum' | 'declining' | 'flare' | 'quiet-sun'
  isActive: boolean
  hasCoronalMassEjection: boolean
  hasSolarFlare: boolean
  hasSolarWind: boolean
  hasSunspotCycle: boolean
  hasProtonEvent: boolean
  hasGeomagneticStorm: boolean
  hasQuietPeriod: boolean
  hasSolarConstant: boolean
  hasProminence: boolean
  flareCount: number
}

export interface AtmosphereMeasure {
  clarity: number
  transparency: 'crystal' | 'clear' | 'hazy' | 'cloudy' | 'overcast' | 'opaque'
  isClear: boolean
  hasNoLightPollution: boolean
  hasNoCloudCover: boolean
  hasHighAltitude: boolean
  hasProperDensity: boolean
  hasOxygenEmission: boolean
  hasNitrogenEmission: boolean
  hasAtmosphericRefraction: boolean
  hasScattering: boolean
  hasAbsorption: boolean
  cloudCoverPercent: number
}

export interface DisplayMeasure {
  quality: number
  type: 'corona' | 'curtain' | 'arc' | 'band' | 'patch' | 'glow'
  isSpectacular: boolean
  hasDynamicMovement: boolean
  hasVerticalStructure: boolean
  hasHorizontalExtent: boolean
  hasRapidVariation: boolean
  hasSlowEvolution: boolean
  hasMultimedia: boolean
  hasTimeLapse: boolean
  hasStillFrame: boolean
  hasSymmetry: boolean
  hasFractal: boolean
  featureCount: number
}

export interface AuroraReading {
  file: string
  lightIntensity: number
  colorSpectrum: number
  magneticAlignment: number
  solarActivity: number
  atmosphericClarity: number
  displayQuality: number
  light: LightMeasure
  color: ColorMeasure
  magnetic: MagneticMeasure
  solar: SolarMeasure
  atmosphere: AtmosphereMeasure
  display: DisplayMeasure
  condition: 'spectacular-display' | 'vivid-aurora' | 'visible-lights' | 'faint-glow' | 'subvisual' | 'dark-sky'
  qualityScore: number
}

export interface AuroraZone {
  directory: string
  readings: AuroraReading[]
  avgLightIntensity: number
  avgColorSpectrum: number
  avgDisplayQuality: number
  spectacularCount: number
  darkSkyCount: number
  brilliantCount: number
  clearAtmosphereCount: number
  zoneType: 'auroral-oval' | 'polar-cap' | 'mid-latitude' | 'sub-auroral' | 'equatorial' | 'dark-side'
  condition: 'northern-lights-festival' | 'aurora-season' | 'occasional-sightings' | 'rare-display' | 'never-seen' | 'light-polluted'
}

export interface AuroraObservatory {
  avgLightIntensity: number
  avgColorSpectrum: number
  avgDisplayQuality: number
  isSpectacular: boolean
  overallLuminosity: number
}

export interface AuroraStats {
  totalFiles: number
  totalZones: number
  avgLightIntensity: number
  avgColorSpectrum: number
  avgMagneticAlignment: number
  avgSolarActivity: number
  avgAtmosphericClarity: number
  avgDisplayQuality: number
  spectacularDisplayCount: number
  vividAuroraCount: number
  visibleLightsCount: number
  faintGlowCount: number
  subvisualCount: number
  darkSkyCount: number
  isBrilliantCount: number
  hasFullSpectrumCount: number
  isAlignedCount: number
  hasDisturbanceCount: number
  isActiveCount: number
  hasSolarFlareCount: number
  isClearCount: number
  hasNoLightPollutionCount: number
  isSpectacularCount: number
  hasDynamicMovementCount: number
  hasSymmetryCount: number
  overallLuminosity: number
  astronomerGrade: 'chief-astronomer' | 'aurora-hunter' | 'astrophysicist' | 'stargazer' | 'amateur' | 'blind-spotter'
  bestReading: string
  brightestLight: string
  richestColor: string
  bestAligned: string
  mostActive: string
}

export interface AuroraBorealisResult {
  readings: AuroraReading[]
  zones: AuroraZone[]
  observatory: AuroraObservatory
  stats: AuroraStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────────────

const TODO_REGEX = /TODO/gi
const FIXME_REGEX = /FIXME/gi
const HACK_REGEX = /HACK/gi
const DEPRECATED_REGEX = /@deprecated/g
const CONSOLE_REGEX = /console\.\w+/g
const ANY_REGEX = /:\s*any\b/g
const TS_IGNORE_REGEX = /\/\/\s*@ts-ignore/g
const TS_EXPECT_ERROR_REGEX = /\/\/\s*@ts-expect-error/g
const FUNCTION_REGEX = /\bfunction\b/g
const ARROW_REGEX = /=>\s*{/g
const CLASS_REGEX = /\bclass\b/g
const INTERFACE_REGEX = /\binterface\b/g
const TYPE_REGEX = /\btype\s+\w+\s*=/g
const EXPORT_REGEX = /\bexport\b/g
const IMPORT_REGEX = /\bimport\b/g
const ASYNC_REGEX = /\basync\b/g
const TRY_REGEX = /\btry\s*{/g
const CATCH_REGEX = /\bcatch\s*\(/g
const FINALLY_REGEX = /\bfinally\s*{/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*\(/g
const WHILE_REGEX = /\bwhile\s*\(/g
const SWITCH_REGEX = /\bswitch\s*\(/g
const RETURN_REGEX = /\breturn\b/g
const THROW_REGEX = /\bthrow\b/g
const TYPE_ANNOTATION_REGEX = /:\s*(?:string|number|boolean|void|never|unknown|any|null|undefined|object)/g
const JSDOC_REGEX = /\/\*\*[\s\S]*?\*\//g
const LINE_COMMENT_REGEX = /\/\/.*$/gm
const TEST_REGEX = /\b(?:describe|it|test|expect)\b/g
const EMPTY_LINE_REGEX = /^\s*$/gm
const ENUM_REGEX = /\benum\b/g
const NAMESPACE_REGEX = /\bnamespace\b/g
const GENERIC_REGEX = /<[^>]+>/g
const SPREAD_REGEX = /\.\.\./g
const DESTRUCTURE_REGEX = /[{}]\s*[,.]?\s*[a-zA-Z]/g

// ─── Counting Helpers ──────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countNonEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

function countEmptyLines(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length === 0).length
}

function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX) + countMatches(content, ARROW_REGEX)
}

function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, IF_REGEX) + countMatches(content, SWITCH_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, FOR_REGEX) + countMatches(content, WHILE_REGEX)
}

function countErrorHandling(content: string): number {
  return countMatches(content, TRY_REGEX) + countMatches(content, CATCH_REGEX) + countMatches(content, FINALLY_REGEX)
}

function countTypeAnnotations(content: string): number {
  return countMatches(content, TYPE_ANNOTATION_REGEX)
}

function countComments(content: string): number {
  return countMatches(content, JSDOC_REGEX) + countMatches(content, LINE_COMMENT_REGEX)
}

function countTodos(content: string): number {
  return countMatches(content, TODO_REGEX) + countMatches(content, FIXME_REGEX) + countMatches(content, HACK_REGEX)
}

function countSmells(content: string): number {
  return countMatches(content, CONSOLE_REGEX) + countMatches(content, ANY_REGEX) + countMatches(content, TS_IGNORE_REGEX) + countMatches(content, TS_EXPECT_ERROR_REGEX)
}

// ─── Measure Light ─────────────────────────────────────────────────────────

/** @example measureLight('export function foo(): void {}') returns LightMeasure */
export function measureLight(content: string): LightMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const typeAnnotations = countTypeAnnotations(content)
  const exports = countExports(content)
  const comments = countComments(content)
  const smells = countSmells(content)
  const todos = countTodos(content)

  const totalDeclarations = funcs + classes + interfaces + typeAliases
  const hasDeclarations = totalDeclarations > 0
  const hasTyped = typeAnnotations > 0
  const hasExports = exports > 0

  const baseIntensity = lines === 0 ? 5 : Math.min(45, totalDeclarations * 8 + lines * 2)
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const exportBonus = Math.min(15, exports * 4)
  const commentBonus = Math.min(10, Math.min(comments, 4) * 2)
  const smellPenalty = Math.min(25, (smells + todos) * 5)
  const intensity = Math.max(0, Math.min(100, baseIntensity + typeBonus + exportBonus + commentBonus - smellPenalty))

  const isBrilliant = intensity >= 80 && smells === 0
  const hasHighIntensity = intensity >= 65
  const hasPersistentGlow = hasExports && hasDeclarations
  const hasPulsating = funcs > 0 && classes > 0
  const hasSubstorm = totalDeclarations > 8
  const hasQuietArc = hasTyped && hasDeclarations && smells === 0
  const hasRayedBand = classes > 0 && interfaces > 0
  const hasCorona = intensity >= 70 && hasTyped && hasExports
  const hasDiffuse = lines > 10 && exports === 0
  const hasNoLight = lines === 0 || (totalDeclarations === 0 && exports === 0)
  const peakIntensity = Math.min(100, intensity + Math.min(20, totalDeclarations * 3))

  let brightness: LightMeasure['brightness']
  if (intensity >= 80) brightness = 'dazzling'
  else if (intensity >= 65) brightness = 'bright'
  else if (intensity >= 45) brightness = 'moderate'
  else if (intensity >= 25) brightness = 'faint'
  else if (intensity >= 10) brightness = 'dim'
  else brightness = 'dark'

  return {
    intensity,
    brightness,
    isBrilliant,
    hasHighIntensity,
    hasPersistentGlow,
    hasPulsating,
    hasSubstorm,
    hasQuietArc,
    hasRayedBand,
    hasCorona,
    hasDiffuse,
    hasNoLight,
    peakIntensity,
  }
}

// ─── Measure Color ─────────────────────────────────────────────────────────

/** @example measureColor('export class Foo implements Bar {}') returns ColorMeasure */
export function measureColor(content: string): ColorMeasure {
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAliases = countTypeAliases(content)
  const enums = countMatches(content, ENUM_REGEX)
  const namespaces = countMatches(content, NAMESPACE_REGEX)
  const generics = countMatches(content, GENERIC_REGEX)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const exports = countExports(content)
  const imports = countImports(content)
  const spreads = countMatches(content, SPREAD_REGEX)
  const destructures = countMatches(content, DESTRUCTURE_REGEX)

  const constructTypes = [funcs, classes, interfaces, typeAliases, enums, namespaces]
  const activeTypes = constructTypes.filter((c) => c > 0).length

  const baseSpectrum = Math.min(30, activeTypes * 5)
  const featureBonus = Math.min(20, (generics + asyncs + spreads + destructures) * 3)
  const flowBonus = Math.min(15, (imports + exports) * 2)
  const diversityBonus = activeTypes >= 4 ? 15 : activeTypes >= 3 ? 10 : activeTypes >= 2 ? 5 : 0
  const spectrum = Math.max(0, Math.min(100, baseSpectrum + featureBonus + flowBonus + diversityBonus))

  const hasGreenEmission = funcs > 0
  const hasPurpleEmission = classes > 0 && interfaces > 0
  const hasRedEmission = enums > 0 || namespaces > 0
  const hasBlueEmission = generics > 0
  const hasYellowEmission = asyncs > 0
  const hasWhiteEmission = typeAliases.length > 0 ? typeAliases > 0 : false
  const hasFullSpectrum = activeTypes >= 5
  const hasMonochrome = activeTypes <= 1
  const hasColorShift = generics > 0 && asyncs > 0
  const emissionCount = [hasGreenEmission, hasPurpleEmission, hasRedEmission, hasBlueEmission, hasYellowEmission, hasWhiteEmission].filter(Boolean).length

  let dominant: ColorMeasure['dominant']
  if (spectrum >= 70 && hasPurpleEmission && hasBlueEmission) dominant = 'purple'
  else if (spectrum >= 55 && hasGreenEmission && exports > 0) dominant = 'green'
  else if (hasRedEmission && spectrum >= 40) dominant = 'red'
  else if (hasBlueEmission && generics > 2) dominant = 'blue'
  else if (hasYellowEmission && asyncs > 2) dominant = 'yellow'
  else dominant = 'white'

  return {
    spectrum,
    dominant,
    hasGreenEmission,
    hasPurpleEmission,
    hasRedEmission,
    hasBlueEmission,
    hasYellowEmission,
    hasWhiteEmission: typeAliases > 0,
    hasFullSpectrum,
    hasMonochrome,
    hasColorShift,
    emissionCount,
  }
}

// ─── Measure Magnetic ──────────────────────────────────────────────────────

/** @example measureMagnetic('export function handler(req: Request): Response {}') returns MagneticMeasure */
export function measureMagnetic(content: string): MagneticMeasure {
  const lines = countNonEmptyLines(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const hasCode = funcs > 0 || lines > 0

  const balanceScore = exports > 0 && imports > 0 ? 20 : exports > 0 ? 10 : 0
  const structureScore = Math.min(25, (classes + interfaces) * 8)
  const typeScore = Math.min(20, typeAnnotations * 3)
  const docScore = Math.min(15, Math.min(comments, 5) * 3)
  const errorScore = Math.min(10, errorHandling * 3)
  const disturbancePenalty = Math.min(25, (todos + deprecated) * 8)
  const alignment = Math.max(0, Math.min(100, 10 + balanceScore + structureScore + typeScore + docScore + errorScore - disturbancePenalty))

  const isAligned = alignment >= 60
  const hasFieldLineConnection = exports > 0 && imports > 0
  const hasProperOrientation = typeAnnotations > 0 && hasCode
  const hasMagneticReconnection = errorHandling > 0 && hasCode
  const hasFieldStrength = alignment >= 50 && hasCode
  const hasPolarity = exports > 0
  const hasDipAngle = Math.min(90, Math.max(0, 90 - alignment))
  const hasMagnetopause = errorHandling > 0
  const hasVanAllenBelt = comments > 0 && errorHandling > 0
  const hasDisturbance = todos > 0 || deprecated > 0
  const disturbanceCount = todos + deprecated

  let pole: MagneticMeasure['pole']
  if (alignment >= 80 && hasFieldLineConnection) pole = 'north'
  else if (alignment >= 65 && exports > 0) pole = 'auroral-oval'
  else if (alignment >= 50) pole = 'south'
  else if (alignment >= 35) pole = 'polar-cap'
  else if (alignment >= 20) pole = 'equatorial'
  else pole = 'disconnected'

  return {
    alignment,
    pole,
    isAligned,
    hasFieldLineConnection,
    hasProperOrientation,
    hasMagneticReconnection,
    hasFieldStrength,
    hasPolarity,
    hasDipAngle,
    hasMagnetopause,
    hasVanAllenBelt,
    hasDisturbance,
    disturbanceCount,
  }
}

// ─── Measure Solar ─────────────────────────────────────────────────────────

/** @example measureSolar('export async function process(): Promise<void> {}') returns SolarMeasure */
export function measureSolar(content: string): SolarMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const exports = countExports(content)
  const imports = countImports(content)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const returns = countMatches(content, RETURN_REGEX)
  const throws = countMatches(content, THROW_REGEX)
  const comments = countComments(content)
  const smells = countSmells(content)
  const todos = countTodos(content)

  const complexity = conditionals + loops
  const hasCode = funcs > 0 || lines > 0

  const baseActivity = lines === 0 ? 5 : Math.min(35, funcs * 6 + lines)
  const asyncBonus = Math.min(20, asyncs * 6)
  const complexityBonus = Math.min(15, complexity * 2)
  const flowBonus = Math.min(10, (returns + throws) * 2)
  const exportBonus = Math.min(10, exports * 3)
  const smellPenalty = Math.min(20, (smells + todos) * 4)
  const activity = Math.max(0, Math.min(100, baseActivity + asyncBonus + complexityBonus + flowBonus + exportBonus - smellPenalty))

  const isActive = activity >= 40
  const hasCoronalMassEjection = exports > 3 && asyncs > 0
  const hasSolarFlare = complexity > 5 && asyncs > 0
  const hasSolarWind = exports > 0 && imports > 0
  const hasSunspotCycle = loops > 0 && conditionals > 0
  const hasProtonEvent = throws > 0 && asyncs > 0
  const hasGeomagneticStorm = complexity > 10
  const hasQuietPeriod = activity <= 30 && hasCode
  const hasSolarConstant = exports > 0 && imports > 0 && smells === 0
  const hasProminence = comments > 0 && funcs > 0
  const flareCount = Math.max(0, complexity - 5)

  let cycle: SolarMeasure['cycle']
  if (activity >= 80 && complexity > 8) cycle = 'flare'
  else if (activity >= 65 && asyncs > 0) cycle = 'solar-maximum'
  else if (activity >= 45 && exports > 0) cycle = 'rising'
  else if (activity >= 30) cycle = 'declining'
  else if (activity >= 15 && hasCode) cycle = 'solar-minimum'
  else cycle = 'quiet-sun'

  return {
    activity,
    cycle,
    isActive,
    hasCoronalMassEjection,
    hasSolarFlare,
    hasSolarWind,
    hasSunspotCycle,
    hasProtonEvent,
    hasGeomagneticStorm,
    hasQuietPeriod,
    hasSolarConstant,
    hasProminence,
    flareCount,
  }
}

// ─── Measure Atmosphere ────────────────────────────────────────────────────

/** @example measureAtmosphere('export function clean(): string { return "pure"; }') returns AtmosphereMeasure */
export function measureAtmosphere(content: string): AtmosphereMeasure {
  const lines = countNonEmptyLines(content)
  const emptyLines = countEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const errorHandling = countErrorHandling(content)
  const smells = countSmells(content)
  const todos = countTodos(content)
  const deprecated = countMatches(content, DEPRECATED_REGEX)
  const hasCode = funcs > 0 || lines > 0

  const baseClarity = lines === 0 ? 5 : Math.min(35, lines + Math.min(15, funcs * 5))
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const errorBonus = Math.min(10, errorHandling * 3)
  const commentBonus = Math.min(10, Math.min(comments, 3) * 2)
  const smellPenalty = Math.min(20, smells * 5)
  const todoPenalty = Math.min(15, (todos + deprecated) * 5)
  const clarity = Math.max(0, Math.min(100, baseClarity + typeBonus + errorBonus + commentBonus - smellPenalty - todoPenalty))

  const isClear = clarity >= 60
  const hasNoLightPollution = smells === 0 && todos === 0
  const hasNoCloudCover = todos === 0 && deprecated === 0
  const hasHighAltitude = classes > 0 && typeAnnotations > 0
  const hasProperDensity = hasCode && emptyLines <= lines * 0.4
  const hasOxygenEmission = funcs > 0 && typeAnnotations > 0
  const hasNitrogenEmission = classes > 0 && interfaces > 0
  const hasAtmosphericRefraction = errorHandling > 0 && hasCode
  const hasScattering = funcs > 5 || classes > 3
  const hasAbsorption = smells > 0 || deprecated > 0
  const cloudCoverPercent = Math.min(100, Math.round(((todos + deprecated + smells) * 15)))

  let transparency: AtmosphereMeasure['transparency']
  if (clarity >= 80 && hasNoLightPollution) transparency = 'crystal'
  else if (clarity >= 65) transparency = 'clear'
  else if (clarity >= 45) transparency = 'hazy'
  else if (clarity >= 25) transparency = 'cloudy'
  else if (clarity >= 10) transparency = 'overcast'
  else transparency = 'opaque'

  return {
    clarity,
    transparency,
    isClear,
    hasNoLightPollution,
    hasNoCloudCover,
    hasHighAltitude,
    hasProperDensity,
    hasOxygenEmission,
    hasNitrogenEmission: classes > 0 && countInterfaces(content) > 0,
    hasAtmosphericRefraction,
    hasScattering,
    hasAbsorption,
    cloudCoverPercent,
  }
}

// ─── Measure Display ───────────────────────────────────────────────────────

/** @example measureDisplay('export class Service { constructor() {} async run() {} }') returns DisplayMeasure */
export function measureDisplay(content: string): DisplayMeasure {
  const lines = countNonEmptyLines(content)
  const funcs = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const asyncs = countMatches(content, ASYNC_REGEX)
  const conditionals = countConditionals(content)
  const loops = countLoops(content)
  const typeAnnotations = countTypeAnnotations(content)
  const comments = countComments(content)
  const hasCode = funcs > 0 || lines > 0

  const structureScore = Math.min(25, (classes + interfaces) * 8)
  const typeBonus = Math.min(15, typeAnnotations * 2)
  const exportBonus = Math.min(15, exports * 3)
  const asyncBonus = Math.min(10, asyncs * 4)
  const commentBonus = Math.min(10, Math.min(comments, 3) * 2)
  const importExportBonus = exports > 0 && imports > 0 ? 10 : 0
  const complexityBonus = Math.min(10, (conditionals + loops) * 2)
  const quality = Math.max(0, Math.min(100, 5 + structureScore + typeBonus + exportBonus + asyncBonus + commentBonus + importExportBonus + complexityBonus))

  const isSpectacular = quality >= 80 && hasCode
  const hasDynamicMovement = asyncs > 0
  const hasVerticalStructure = classes > 0 && funcs > 0
  const hasHorizontalExtent = exports > 2
  const hasRapidVariation = conditionals > 3
  const hasSlowEvolution = loops > 0 && conditionals > 0
  const hasMultimedia = classes > 0 && asyncs > 0 && exports > 0
  const hasTimeLapse = comments > 0 && exports > 0
  const hasStillFrame = funcs > 0 && exports === 0
  const hasSymmetry = classes > 0 && interfaces > 0
  const hasFractal = classes > 0 && loops > 0 && conditionals > 0
  const featureCount = [hasDynamicMovement, hasVerticalStructure, hasHorizontalExtent, hasRapidVariation, hasSlowEvolution, hasMultimedia, hasTimeLapse, hasSymmetry, hasFractal].filter(Boolean).length

  let type: DisplayMeasure['type']
  if (quality >= 80 && hasVerticalStructure && hasDynamicMovement) type = 'corona'
  else if (quality >= 65 && hasVerticalStructure) type = 'curtain'
  else if (quality >= 50 && exports > 0) type = 'arc'
  else if (quality >= 35 && hasCode) type = 'band'
  else if (quality >= 20) type = 'patch'
  else type = 'glow'

  return {
    quality,
    type,
    isSpectacular,
    hasDynamicMovement,
    hasVerticalStructure,
    hasHorizontalExtent,
    hasRapidVariation,
    hasSlowEvolution,
    hasMultimedia,
    hasTimeLapse,
    hasStillFrame,
    hasSymmetry,
    hasFractal,
    featureCount,
  }
}

// ─── Classify Reading Condition ────────────────────────────────────────────

/** @example classifyReadingCondition(85) returns 'spectacular-display' */
export function classifyReadingCondition(score: number): AuroraReading['condition'] {
  if (score >= 80) return 'spectacular-display'
  if (score >= 65) return 'vivid-aurora'
  if (score >= 50) return 'visible-lights'
  if (score >= 35) return 'faint-glow'
  if (score >= 20) return 'subvisual'
  return 'dark-sky'
}

// ─── Analyze Aurora Reading ────────────────────────────────────────────────

/** @example analyzeAuroraReading('export function foo(): void {}', 'aurora.ts') returns AuroraReading */
export function analyzeAuroraReading(content: string, filePath: string): AuroraReading {
  const light = measureLight(content)
  const color = measureColor(content)
  const magnetic = measureMagnetic(content)
  const solar = measureSolar(content)
  const atmosphere = measureAtmosphere(content)
  const display = measureDisplay(content)

  const lightIntensity = light.intensity
  const colorSpectrum = color.spectrum
  const magneticAlignment = magnetic.alignment
  const solarActivity = solar.activity
  const atmosphericClarity = atmosphere.clarity
  const displayQuality = display.quality

  const qualityScore = Math.round(
    (lightIntensity + colorSpectrum + magneticAlignment + solarActivity + atmosphericClarity + displayQuality) / 6,
  )

  const condition = classifyReadingCondition(qualityScore)

  return {
    file: filePath,
    lightIntensity,
    colorSpectrum,
    magneticAlignment,
    solarActivity,
    atmosphericClarity,
    displayQuality,
    light,
    color,
    magnetic,
    solar,
    atmosphere,
    display,
    condition,
    qualityScore,
  }
}

// ─── Classify Zone Type ────────────────────────────────────────────────────

/** @example classifyZoneType(readings) returns 'auroral-oval' */
export function classifyZoneType(readings: AuroraReading[]): AuroraZone['zoneType'] {
  if (readings.length === 0) return 'dark-side'
  const avgScore = Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / readings.length)
  const spectacularCount = readings.filter((r) => r.condition === 'spectacular-display').length
  const ratio = spectacularCount / readings.length

  if (avgScore >= 75 && ratio >= 0.5) return 'auroral-oval'
  if (avgScore >= 60) return 'polar-cap'
  if (avgScore >= 45) return 'mid-latitude'
  if (avgScore >= 30) return 'sub-auroral'
  if (avgScore >= 15) return 'equatorial'
  return 'dark-side'
}

/** @example classifyZoneCondition(70) returns 'aurora-season' */
export function classifyZoneCondition(avgScore: number): AuroraZone['condition'] {
  if (avgScore >= 80) return 'northern-lights-festival'
  if (avgScore >= 65) return 'aurora-season'
  if (avgScore >= 50) return 'occasional-sightings'
  if (avgScore >= 35) return 'rare-display'
  if (avgScore >= 20) return 'never-seen'
  return 'light-polluted'
}

// ─── Classify Astronomer Grade ─────────────────────────────────────────────

/** @example classifyAstronomerGrade(85) returns 'chief-astronomer' */
export function classifyAstronomerGrade(avgLuminosity: number): AuroraStats['astronomerGrade'] {
  if (avgLuminosity >= 80) return 'chief-astronomer'
  if (avgLuminosity >= 65) return 'aurora-hunter'
  if (avgLuminosity >= 50) return 'astrophysicist'
  if (avgLuminosity >= 35) return 'stargazer'
  if (avgLuminosity >= 20) return 'amateur'
  return 'blind-spotter'
}

// ─── Analyze Aurora Zone ───────────────────────────────────────────────────

/** @example analyzeAuroraZone(readings, 'src') returns AuroraZone */
export function analyzeAuroraZone(readings: AuroraReading[], dirPath: string): AuroraZone {
  const count = readings.length
  const avgLightIntensity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.lightIntensity, 0) / count) : 0
  const avgColorSpectrum = count > 0 ? Math.round(readings.reduce((s, r) => s + r.colorSpectrum, 0) / count) : 0
  const avgDisplayQuality = count > 0 ? Math.round(readings.reduce((s, r) => s + r.displayQuality, 0) / count) : 0

  const spectacularCount = readings.filter((r) => r.condition === 'spectacular-display').length
  const darkSkyCount = readings.filter((r) => r.condition === 'dark-sky').length
  const brilliantCount = readings.filter((r) => r.light.isBrilliant).length
  const clearAtmosphereCount = readings.filter((r) => r.atmosphere.isClear).length

  const zoneType = classifyZoneType(readings)
  const avgScore = count > 0 ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / count) : 0
  const condition = classifyZoneCondition(avgScore)

  return {
    directory: dirPath,
    readings,
    avgLightIntensity,
    avgColorSpectrum,
    avgDisplayQuality,
    spectacularCount,
    darkSkyCount,
    brilliantCount,
    clearAtmosphereCount,
    zoneType,
    condition,
  }
}

// ─── Generate Recommendations ──────────────────────────────────────────────

/** @example generateRecommendations(readings, zones, observatory, stats) returns string[] */
export function generateRecommendations(
  readings: AuroraReading[],
  _zones: AuroraZone[],
  _observatory: AuroraObservatory,
  _stats: AuroraStats,
): string[] {
  const recommendations: string[] = []

  const hasDarkSky = readings.some((r) => r.condition === 'dark-sky')
  if (hasDarkSky) {
    recommendations.push('Light up the dark sky — add exports, functions, and type annotations to dormant files')
  }

  const hasCloudCover = readings.some((r) => r.atmosphere.hasAbsorption)
  if (hasCloudCover) {
    recommendations.push('Clear atmospheric absorption — remove console calls, any types, and ts-ignore')
  }

  const hasDisconnected = readings.some((r) => r.magnetic.pole === 'disconnected')
  if (hasDisconnected) {
    recommendations.push('Reconnect magnetic field lines — add exports and imports for codebase alignment')
  }

  const hasDisturbance = readings.some((r) => r.magnetic.hasDisturbance)
  if (hasDisturbance) {
    recommendations.push('Reduce magnetic disturbances — clean up TODOs and deprecated markers')
  }

  const hasLowActivity = readings.some((r) => r.solar.activity < 20 && r.light.hasNoLight === false)
  if (hasLowActivity) {
    recommendations.push('Increase solar activity — add async patterns and dynamic features')
  }

  const hasMonochrome = readings.some((r) => r.color.hasMonochrome && r.light.intensity > 20)
  if (hasMonochrome) {
    recommendations.push('Expand color spectrum — diversify with classes, interfaces, enums, and type aliases')
  }

  const hasOpaque = readings.some((r) => r.atmosphere.transparency === 'opaque')
  if (hasOpaque) {
    recommendations.push('Improve atmospheric transparency — add type annotations and error handling')
  }

  const hasGlowOnly = readings.some((r) => r.display.type === 'glow' || r.display.type === 'patch')
  if (hasGlowOnly) {
    recommendations.push('Enhance display quality — structure code with classes, exports, and vertical layering')
  }

  if (recommendations.length === 0) {
    recommendations.push('The aurora borealis is in full spectacular display — breathtaking code luminosity achieved')
  }

  return recommendations
}

// ─── Build Result ──────────────────────────────────────────────────────────

/** @example buildAuroraBorealisResult(['a.ts'], ['export function foo(): void {}']) returns AuroraBorealisResult */
export function buildAuroraBorealisResult(
  files: string[],
  contents: string[],
  options?: { ignore?: string[]; ext?: string[] },
): AuroraBorealisResult {
  const _opts = options ?? {}

  const readings: AuroraReading[] = files.map((file, i) =>
    analyzeAuroraReading(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AuroraReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      dirMap.set(dir, [reading])
    }
  }

  const zones: AuroraZone[] = Array.from(dirMap.entries()).map(
    ([dir, dirReadings]) => analyzeAuroraZone(dirReadings, dir),
  )

  const count = readings.length
  const avgLightIntensity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.lightIntensity, 0) / count) : 0
  const avgColorSpectrum = count > 0 ? Math.round(readings.reduce((s, r) => s + r.colorSpectrum, 0) / count) : 0
  const avgMagneticAlignment = count > 0 ? Math.round(readings.reduce((s, r) => s + r.magneticAlignment, 0) / count) : 0
  const avgSolarActivity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.solarActivity, 0) / count) : 0
  const avgAtmosphericClarity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.atmosphericClarity, 0) / count) : 0
  const avgDisplayQuality = count > 0 ? Math.round(readings.reduce((s, r) => s + r.displayQuality, 0) / count) : 0
  const overallLuminosity = count > 0 ? Math.round(readings.reduce((s, r) => s + r.qualityScore, 0) / count) : 0

  const observatory: AuroraObservatory = {
    avgLightIntensity,
    avgColorSpectrum,
    avgDisplayQuality,
    isSpectacular: overallLuminosity >= 70,
    overallLuminosity,
  }

  const stats: AuroraStats = {
    totalFiles: count,
    totalZones: zones.length,
    avgLightIntensity,
    avgColorSpectrum,
    avgMagneticAlignment,
    avgSolarActivity,
    avgAtmosphericClarity,
    avgDisplayQuality,
    spectacularDisplayCount: readings.filter((r) => r.condition === 'spectacular-display').length,
    vividAuroraCount: readings.filter((r) => r.condition === 'vivid-aurora').length,
    visibleLightsCount: readings.filter((r) => r.condition === 'visible-lights').length,
    faintGlowCount: readings.filter((r) => r.condition === 'faint-glow').length,
    subvisualCount: readings.filter((r) => r.condition === 'subvisual').length,
    darkSkyCount: readings.filter((r) => r.condition === 'dark-sky').length,
    isBrilliantCount: readings.filter((r) => r.light.isBrilliant).length,
    hasFullSpectrumCount: readings.filter((r) => r.color.hasFullSpectrum).length,
    isAlignedCount: readings.filter((r) => r.magnetic.isAligned).length,
    hasDisturbanceCount: readings.filter((r) => r.magnetic.hasDisturbance).length,
    isActiveCount: readings.filter((r) => r.solar.isActive).length,
    hasSolarFlareCount: readings.filter((r) => r.solar.hasSolarFlare).length,
    isClearCount: readings.filter((r) => r.atmosphere.isClear).length,
    hasNoLightPollutionCount: readings.filter((r) => r.atmosphere.hasNoLightPollution).length,
    isSpectacularCount: readings.filter((r) => r.display.isSpectacular).length,
    hasDynamicMovementCount: readings.filter((r) => r.display.hasDynamicMovement).length,
    hasSymmetryCount: readings.filter((r) => r.display.hasSymmetry).length,
    overallLuminosity,
    astronomerGrade: classifyAstronomerGrade(overallLuminosity),
    bestReading: count > 0
      ? readings.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
      : '',
    brightestLight: count > 0
      ? readings.reduce((best, r) => r.lightIntensity > best.lightIntensity ? r : best).file
      : '',
    richestColor: count > 0
      ? readings.reduce((best, r) => r.colorSpectrum > best.colorSpectrum ? r : best).file
      : '',
    bestAligned: count > 0
      ? readings.reduce((best, r) => r.magneticAlignment > best.magneticAlignment ? r : best).file
      : '',
    mostActive: count > 0
      ? readings.reduce((best, r) => r.solarActivity > best.solarActivity ? r : best).file
      : '',
  }

  const recommendations = generateRecommendations(readings, zones, observatory, stats)

  return { readings, zones, observatory, stats, recommendations }
}
