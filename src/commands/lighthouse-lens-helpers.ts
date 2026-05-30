// ─── Interfaces ──────────────────────────────────────────

export interface BeamMeasure {
  intensity: number
  type: 'fresnel' | 'parabolic' | 'LED' | 'halogen' | 'oil-lamp' | 'candle'
  isBright: boolean
  hasSteadyBeam: boolean
  hasFlashingPattern: boolean
  hasOmnidirectional: boolean
  hasDirectionalBeam: boolean
  hasColoredFilters: boolean
  hasProperIllumination: boolean
  hasDarkSpots: boolean
  hasGlare: boolean
  hasFlicker: boolean
  darkSpotCount: number
}

export interface LensMeasure {
  quality: number
  material: 'glass' | 'crystal' | 'plastic' | 'polycarbonate' | 'cloudy' | 'cracked'
  isCrystal: boolean
  hasNoScratches: boolean
  hasNoFogging: boolean
  hasNoChips: boolean
  hasProperFocalLength: boolean
  hasChromaticCorrection: boolean
  hasAntiReflectiveCoating: boolean
  hasCondensation: boolean
  isFresnelDesign: boolean
  defectCount: number
}

export interface FocalMeasure {
  precision: number
  length: number
  hasSharpFocus: boolean
  hasNarrowBeam: boolean
  hasWideBeam: boolean
  hasProperDivergence: boolean
  hasCollimated: boolean
  hasConvergent: boolean
  hasDivergent: boolean
  hasAberration: boolean
  hasAstigmatism: boolean
  aberrationCount: number
}

export interface RotationMeasure {
  speed: number
  pattern: 'fixed' | 'rotating' | 'flashing' | 'group-flashing' | 'occulting' | 'quick-flashing'
  isReliable: boolean
  hasRegularInterval: boolean
  hasProperTiming: boolean
  hasEmergencyMode: boolean
  hasBackupPower: boolean
  hasAutomaticRotation: boolean
  hasManualOverride: boolean
  hasLightSensor: boolean
  hasTimingMechanism: boolean
  reliability: number
}

export interface VisibilityMeasure {
  range: number
  condition: 'excellent' | 'good' | 'moderate' | 'poor' | 'minimal' | 'zero'
  hasLongRange: boolean
  hasMediumRange: boolean
  hasShortRange: boolean
  hasHorizonReach: boolean
  hasGeographicRange: boolean
  hasLuminousRange: boolean
  hasNominalRange: boolean
  hasPenetrationPower: boolean
  hasNightVisibility: boolean
  hasDayVisibility: boolean
}

export interface WarningMeasure {
  system: number
  type: 'fog-horn' | 'radio-beacon' | 'racon' | 'bell' | 'whistle' | 'silent'
  hasAudibleWarning: boolean
  hasVisualWarning: boolean
  hasProximalWarning: boolean
  hasDistanceWarning: boolean
  hasCollisionAvoidance: boolean
  hasStormWarning: boolean
  hasRockMarker: boolean
  hasSafePassage: boolean
  hasEmergencySignal: boolean
  hasMayday: boolean
  warningCount: number
}

export interface LensReading {
  file: string
  beamIntensity: number
  lensQuality: number
  focalPrecision: number
  rotationSpeed: number
  visibilityRange: number
  warningSystem: number
  beam: BeamMeasure
  lens: LensMeasure
  focal: FocalMeasure
  rotation: RotationMeasure
  visibility: VisibilityMeasure
  warning: WarningMeasure
  condition: 'pharos-of-alexandria' | 'modern-automated' | 'classic-fresnel' | 'solar-powered' | 'decommissioned' | 'shipwreck'
  qualityScore: number
}

export interface CoastalStation {
  directory: string
  readings: LensReading[]
  avgBeamIntensity: number
  avgLensQuality: number
  avgWarningSystem: number
  pharosCount: number
  shipwreckCount: number
  brightBeamCount: number
  crystalCount: number
  stationType: 'major-lightstation' | 'harbor-light' | 'beacon' | 'buoy' | 'daymark' | 'dark'
  condition: 'coast-guard-standard' | 'well-maintained' | 'functional' | 'aging' | 'dilapidated' | 'dark-coast'
}

export interface LighthouseService {
  avgBeamIntensity: number
  avgLensQuality: number
  avgWarningSystem: number
  isReliable: boolean
  overallIllumination: number
}

export interface LighthouseLensStats {
  totalFiles: number
  totalStations: number
  avgBeamIntensity: number
  avgLensQuality: number
  avgFocalPrecision: number
  avgRotationSpeed: number
  avgVisibilityRange: number
  avgWarningSystem: number
  pharosCount: number
  modernAutomatedCount: number
  classicFresnelCount: number
  solarPoweredCount: number
  decommissionedCount: number
  shipwreckCount: number
  isBrightCount: number
  hasDarkSpotsCount: number
  isCrystalCount: number
  hasCondensationCount: number
  hasSharpFocusCount: number
  hasAberrationCount: number
  isReliableCount: number
  hasEmergencyModeCount: number
  hasLongRangeCount: number
  hasAudibleWarningCount: number
  hasCollisionAvoidanceCount: number
  hasSafePassageCount: number
  overallIllumination: number
  keeperGrade: 'head-keeper' | 'principal-keeper' | 'assistant-keeper' | 'lamplighter' | 'watchman' | 'sleepwalker'
  bestReading: string
  brightestBeam: string
  clearestLens: string
  sharpestFocus: string
  bestWarning: string
}

export interface LighthouseLensResult {
  readings: LensReading[]
  stations: CoastalStation[]
  service: LighthouseService
  stats: LighthouseLensStats
  recommendations: string[]
}

// ─── Counting Utilities ─────────────────────────────────

/**
 * Count non-empty lines
 * @example
 * countLoc('const a = 1\n\nconst b = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count function declarations
 * @example
 * countFunctions('function foo() {}') // 1
 */
export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

/**
 * Count class declarations
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count interface declarations
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count type aliases
 * @example
 * countTypes('type Foo = string') // 1
 */
export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

/**
 * Count enum declarations
 * @example
 * countEnums('enum Dir { Up }') // 1
 */
export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count export statements
 * @example
 * countExports('export const a = 1') // 1
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

/**
 * Count import statements
 * @example
 * countImports("import { foo } from 'bar'") // 1
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** docs *\/ const x = 1') // 1
 */
export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

/**
 * Count all comments
 * @example
 * countComments('// inline') // 1
 */
export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

/**
 * Count error handling keywords
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

/**
 * Count TODO markers
 * @example
 * countTodos('// TODO: fix') // 1
 */
export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

/**
 * Count console calls
 * @example
 * countConsole('console.log("hi")') // 1
 */
export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

/**
 * Count branches
 * @example
 * countBranches('if (x) {}') // 1
 */
export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?\s*[^;:]*\s*:/g) || []).length
  return ifs + switches + ternaries
}

/**
 * Count descriptive names
 * @example
 * countDescriptiveNames('function getData() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

/**
 * Count default keywords
 * @example
 * countDefaults('export default class {}') // 1
 */
export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

/**
 * Count deprecated markers
 * @example
 * countDeprecated('@deprecated') // 1
 */
export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

/**
 * Count return type annotations
 * @example
 * countReturnTypes('function foo(): string {}') // 1
 */
export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

/**
 * Count generic type parameters
 * @example
 * countGenerics('function foo<T>() {}') // 1
 */
export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

/**
 * Count arrow functions
 * @example
 * countArrowFunctions('const f = () => 1') // 1
 */
export function countArrowFunctions(content: string): number {
  const m = content.match(/=>/g)
  return m ? m.length : 0
}

/**
 * Count async keywords
 * @example
 * countAsync('async function foo() {}') // 1
 */
export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

/**
 * Count await keywords
 * @example
 * countAwait('await foo()') // 1
 */
export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

/**
 * Count private members
 * @example
 * countPrivateMembers('private x: number') // 1
 */
export function countPrivateMembers(content: string): number {
  const m = content.match(/\bprivate\s+\w+/g)
  return m ? m.length : 0
}

// ─── Beam Measurement ───────────────────────────────────

/**
 * Measure documentation clarity
 * @example
 * measureBeam('/** docs *\/ export function foo() {}') // { intensity, type, ... }
 */
export function measureBeam(content: string): BeamMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const returns = countReturnTypes(content)
  const descriptives = countDescriptiveNames(content)
  const functions = countFunctions(content)
  const interfaces = countInterfaces(content)

  const intensity = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 10 : 0) +
    (exports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (descriptives > 0 ? 10 : 0) +
    (returns > 0 ? 10 : 0) +
    (interfaces > 0 ? 10 : 0) +
    (functions > 0 ? 5 : 0),
  )))

  const isBright = jsdoc >= 3 && exports > 0
  const hasSteadyBeam = comments > 0 && exports > 0
  const hasFlashingPattern = jsdoc > 0 && comments > jsdoc
  const hasOmnidirectional = interfaces > 0 && jsdoc > 0 && types > 0
  const hasDirectionalBeam = exports > 0 && returns > 0
  const hasColoredFilters = jsdoc > 0 && descriptives > 0
  const hasProperIllumination = jsdoc > 0 && exports > 0
  const darkSpotCount = countTodos(content) + countConsole(content)
  const hasDarkSpots = darkSpotCount > 0
  const hasGlare = comments > loc * 0.5 && loc > 0
  const hasFlicker = jsdoc > 0 && functions > jsdoc * 5

  let type: BeamMeasure['type'] = 'candle'
  if (intensity >= 80 && isBright) type = 'fresnel'
  else if (intensity >= 65 && hasOmnidirectional) type = 'parabolic'
  else if (intensity >= 50 && exports > 0) type = 'LED'
  else if (intensity >= 35 && types > 0) type = 'halogen'
  else if (intensity >= 20) type = 'oil-lamp'

  return {
    intensity, type, isBright, hasSteadyBeam, hasFlashingPattern,
    hasOmnidirectional, hasDirectionalBeam, hasColoredFilters,
    hasProperIllumination, hasDarkSpots, hasGlare, hasFlicker,
    darkSpotCount,
  }
}

// ─── Lens Measurement ───────────────────────────────────

/**
 * Measure code clarity
 * @example
 * measureLens('export function foo(a: number): void {}') // { quality, material, ... }
 */
export function measureLens(content: string): LensMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const interfaces = countInterfaces(content)
  const functions = countFunctions(content)
  const generics = countGenerics(content)
  const errors = countErrorHandling(content)
  const classes = countClasses(content)

  const quality = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (types > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (generics > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 5 : 0),
  )))

  const isCrystal = quality >= 80 && interfaces > 0 && types > 0
  const hasNoScratches = countTodos(content) === 0 && countDeprecated(content) === 0
  const hasNoFogging = countBranches(content) < functions * 4 || functions === 0
  const hasNoChips = exports > 0 && imports > 0
  const hasProperFocalLength = functions > 0 && exports > 0
  const hasChromaticCorrection = interfaces > 0 && classes > 0
  const hasAntiReflectiveCoating = generics > 0 && types > 0
  const hasCondensation = countBranches(content) > 10 && functions > 0
  const isFresnelDesign = classes > 0 && functions > 0 && interfaces > 0
  const defectCount = countTodos(content) + countConsole(content) + countDeprecated(content)

  let material: LensMeasure['material'] = 'cracked'
  if (quality >= 80 && isCrystal) material = 'crystal'
  else if (quality >= 60 && types > 0) material = 'glass'
  else if (quality >= 45 && exports > 0) material = 'polycarbonate'
  else if (quality >= 30) material = 'plastic'
  else if (quality >= 15) material = 'cloudy'

  return {
    quality, material, isCrystal, hasNoScratches, hasNoFogging,
    hasNoChips, hasProperFocalLength, hasChromaticCorrection,
    hasAntiReflectiveCoating, hasCondensation, isFresnelDesign, defectCount,
  }
}

// ─── Focal Measurement ──────────────────────────────────

/**
 * Measure API precision
 * @example
 * measureFocal('export function add(a: number, b: number): number {}') // { precision, length, ... }
 */
export function measureFocal(content: string): FocalMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const returns = countReturnTypes(content)
  const functions = countFunctions(content)
  const interfaces = countInterfaces(content)
  const generics = countGenerics(content)

  const precision = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (returns > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (generics > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0),
  )))

  const length = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (functions * 5) +
    (exports * 5) +
    (types * 3) +
    (interfaces * 5),
  )))

  const hasSharpFocus = exports > 0 && types > 0 && returns > 0
  const hasNarrowBeam = functions > 0 && functions <= 3 && exports > 0
  const hasWideBeam = functions > 5 || classes(content) > 0
  const hasProperDivergence = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 3
  const hasCollimated = interfaces > 0 && exports > 0
  const hasConvergent = functions > 0 && exports > 0 && functions <= exports * 2
  const hasDivergent = functions > exports * 4 && exports > 0
  const aberrationCount = countTodos(content) + countDeprecated(content)
  const hasAberration = aberrationCount > 2
  const hasAstigmatism = exports > 0 && returns === 0 && types > 0

  return {
    precision, length, hasSharpFocus, hasNarrowBeam, hasWideBeam,
    hasProperDivergence, hasCollimated, hasConvergent, hasDivergent,
    hasAberration, hasAstigmatism, aberrationCount,
  }
}

/**
 * Count classes helper for focal
 */
function classes(content: string): number {
  return countClasses(content)
}

// ─── Rotation Measurement ───────────────────────────────

/**
 * Measure update frequency and reliability
 * @example
 * measureRotation('try {} catch(e) { handle(e) }') // { speed, pattern, ... }
 */
export function measureRotation(content: string): RotationMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const defaults = countDefaults(content)
  const asyncs = countAsync(content)
  const awaits = countAwait(content)

  const speed = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 20 : 0) +
    (types > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (defaults > 0 ? 10 : 0) +
    (asyncs > 0 || awaits > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (imports > 0 ? 10 : 0) +
    (functions > 0 ? 5 : 0),
  )))

  const reliability = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (exports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (imports > 0 ? 15 : 0) +
    (functions > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0),
  )))

  const isReliable = errors > 0 && exports > 0 && types > 0
  const hasRegularInterval = imports > 0 && exports > 0
  const hasProperTiming = asyncs > 0 || functions > 0
  const hasEmergencyMode = errors > 0 && countBranches(content) > 0
  const hasBackupPower = errors > 0 && defaults > 0
  const hasAutomaticRotation = asyncs > 0 || awaits > 0
  const hasManualOverride = countGenerics(content) > 0
  const hasLightSensor = countInterfaces(content) > 0
  const hasTimingMechanism = functions > 0 && errors > 0

  let pattern: RotationMeasure['pattern'] = 'fixed'
  if (speed >= 80 && isReliable) pattern = 'quick-flashing'
  else if (speed >= 65 && hasAutomaticRotation) pattern = 'rotating'
  else if (speed >= 50 && errors > 0) pattern = 'group-flashing'
  else if (speed >= 35 && exports > 0) pattern = 'flashing'
  else if (speed >= 20) pattern = 'occulting'

  return {
    speed, pattern, isReliable, hasRegularInterval, hasProperTiming,
    hasEmergencyMode, hasBackupPower, hasAutomaticRotation,
    hasManualOverride, hasLightSensor, hasTimingMechanism, reliability,
  }
}

// ─── Visibility Measurement ─────────────────────────────

/**
 * Measure code reach and visibility
 * @example
 * measureVisibility('export function foo() {}') // { range, condition, ... }
 */
export function measureVisibility(content: string): VisibilityMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errors = countErrorHandling(content)
  const descriptives = countDescriptiveNames(content)

  const range = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (exports > 0 ? 20 : 0) +
    (imports > 0 ? 15 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (types > 0 ? 10 : 0) +
    (descriptives > 0 ? 10 : 0) +
    (errors > 0 ? 10 : 0) +
    (countClasses(content) > 0 ? 5 : 0),
  )))

  const hasLongRange = exports > 0 && interfaces > 0 && imports > 0
  const hasMediumRange = exports > 0 && imports > 0
  const hasShortRange = exports > 0 || imports > 0
  const hasHorizonReach = exports > 2 && interfaces > 0
  const hasGeographicRange = imports > 0 && exports > 0 && interfaces > 0
  const hasLuminousRange = jsdoc > 0 && exports > 0 && types > 0
  const hasNominalRange = exports > 0
  const hasPenetrationPower = errors > 0 && types > 0
  const hasNightVisibility = errors > 0
  const hasDayVisibility = exports > 0 && types > 0

  let condition: VisibilityMeasure['condition'] = 'zero'
  if (range >= 80) condition = 'excellent'
  else if (range >= 60) condition = 'good'
  else if (range >= 40) condition = 'moderate'
  else if (range >= 20) condition = 'poor'
  else if (range >= 10) condition = 'minimal'

  return {
    range, condition, hasLongRange, hasMediumRange, hasShortRange,
    hasHorizonReach, hasGeographicRange, hasLuminousRange, hasNominalRange,
    hasPenetrationPower, hasNightVisibility, hasDayVisibility,
  }
}

// ─── Warning Measurement ────────────────────────────────

/**
 * Measure error handling quality
 * @example
 * measureWarning('try {} catch(e) { console.error(e) }') // { system, type, ... }
 */
export function measureWarning(content: string): WarningMeasure {
  const loc = countLoc(content)
  const errors = countErrorHandling(content)
  const types = countTypeAnnotations(content)
  const returns = countReturnTypes(content)
  const exports = countExports(content)
  const descriptives = countDescriptiveNames(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)

  const system = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 25 : 0) +
    (types > 0 ? 15 : 0) +
    (returns > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (descriptives > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (branches > 0 ? 10 : 0) +
    (functions > 0 ? 5 : 0),
  )))

  const hasAudibleWarning = errors > 0
  const hasVisualWarning = countComments(content) > 0 && errors > 0
  const hasProximalWarning = errors > 0 && types > 0
  const hasDistanceWarning = branches > 0 && errors > 0
  const hasCollisionAvoidance = errors > 0 && countInterfaces(content) > 0
  const hasStormWarning = errors >= 3
  const hasRockMarker = countDeprecated(content) > 0 || countTodos(content) > 0
  const hasSafePassage = errors > 0 && returns > 0 && types > 0
  const hasEmergencySignal = errors > 0 && descriptives > 0
  const hasMayday = countConsole(content) > 0 && errors > 0
  const warningCount = errors + countDeprecated(content)

  let type: WarningMeasure['type'] = 'silent'
  if (system >= 80 && hasCollisionAvoidance) type = 'fog-horn'
  else if (system >= 65 && hasAudibleWarning) type = 'radio-beacon'
  else if (system >= 50 && errors > 0) type = 'racon'
  else if (system >= 35 && branches > 0) type = 'bell'
  else if (system >= 20) type = 'whistle'

  return {
    system, type, hasAudibleWarning, hasVisualWarning,
    hasProximalWarning, hasDistanceWarning, hasCollisionAvoidance,
    hasStormWarning, hasRockMarker, hasSafePassage,
    hasEmergencySignal, hasMayday, warningCount,
  }
}

// ─── Reading Analysis ───────────────────────────────────

/**
 * Analyze a single file as a lens reading
 * @example
 * analyzeLensReading(content, 'file.ts') // LensReading
 */
export function analyzeLensReading(content: string, filePath: string): LensReading {
  const beam = measureBeam(content)
  const lens = measureLens(content)
  const focal = measureFocal(content)
  const rotation = measureRotation(content)
  const visibility = measureVisibility(content)
  const warning = measureWarning(content)

  const beamIntensity = beam.intensity
  const lensQuality = lens.quality
  const focalPrecision = focal.precision
  const rotationSpeed = rotation.speed
  const visibilityRange = visibility.range
  const warningSystem = warning.system

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (beamIntensity * 0.20) +
    (lensQuality * 0.20) +
    (focalPrecision * 0.15) +
    (rotationSpeed * 0.15) +
    (visibilityRange * 0.15) +
    (warningSystem * 0.15),
  )))

  const condition = classifyReadingCondition(qualityScore, beam, lens)

  return {
    file: filePath,
    beamIntensity, lensQuality, focalPrecision, rotationSpeed,
    visibilityRange, warningSystem,
    beam, lens, focal, rotation, visibility, warning,
    condition, qualityScore,
  }
}

/**
 * Classify reading condition
 * @example
 * classifyReadingCondition(90, beam, lens) // 'pharos-of-alexandria'
 */
export function classifyReadingCondition(
  score: number,
  beam: BeamMeasure,
  lens: LensMeasure,
): LensReading['condition'] {
  if (score >= 80 && beam.isBright && lens.isCrystal) return 'pharos-of-alexandria'
  if (score >= 65 && beam.hasProperIllumination) return 'modern-automated'
  if (score >= 50 && lens.hasProperFocalLength) return 'classic-fresnel'
  if (score >= 35) return 'solar-powered'
  if (score >= 20) return 'decommissioned'
  return 'shipwreck'
}

// ─── Station Analysis ───────────────────────────────────

/**
 * Analyze a directory as a coastal station
 * @example
 * analyzeCoastalStation(readings, 'src/') // CoastalStation
 */
export function analyzeCoastalStation(readings: LensReading[], dirPath: string): CoastalStation {
  const count = readings.length
  if (count === 0) {
    return {
      directory: dirPath, readings: [],
      avgBeamIntensity: 0, avgLensQuality: 0, avgWarningSystem: 0,
      pharosCount: 0, shipwreckCount: 0, brightBeamCount: 0, crystalCount: 0,
      stationType: 'dark', condition: 'dark-coast',
    }
  }

  const avgBeamIntensity = Math.round(readings.reduce((s, r) => s + r.beamIntensity, 0) / count)
  const avgLensQuality = Math.round(readings.reduce((s, r) => s + r.lensQuality, 0) / count)
  const avgWarningSystem = Math.round(readings.reduce((s, r) => s + r.warningSystem, 0) / count)

  const pharosCount = readings.filter(r => r.condition === 'pharos-of-alexandria').length
  const shipwreckCount = readings.filter(r => r.condition === 'shipwreck').length
  const brightBeamCount = readings.filter(r => r.beam.isBright).length
  const crystalCount = readings.filter(r => r.lens.isCrystal).length

  const stationType = classifyStationType(readings, avgBeamIntensity)
  const condition = classifyStationCondition(avgBeamIntensity)

  return {
    directory: dirPath, readings,
    avgBeamIntensity, avgLensQuality, avgWarningSystem,
    pharosCount, shipwreckCount, brightBeamCount, crystalCount,
    stationType, condition,
  }
}

/**
 * Classify station type
 * @example
 * classifyStationType(readings, 80) // 'major-lightstation'
 */
export function classifyStationType(readings: LensReading[], avgBeam: number): CoastalStation['stationType'] {
  if (readings.length === 0) return 'dark'
  const pharosRatio = readings.filter(r => r.condition === 'pharos-of-alexandria').length / readings.length
  const allGood = readings.every(r => r.qualityScore >= 50)

  if (pharosRatio >= 0.5 && avgBeam >= 70) return 'major-lightstation'
  if (allGood && avgBeam >= 55) return 'harbor-light'
  if (avgBeam >= 45) return 'beacon'
  if (avgBeam >= 30) return 'buoy'
  if (avgBeam >= 15) return 'daymark'
  return 'dark'
}

/**
 * Classify station condition
 * @example
 * classifyStationCondition(80) // 'coast-guard-standard'
 */
export function classifyStationCondition(avgBeam: number): CoastalStation['condition'] {
  if (avgBeam >= 75) return 'coast-guard-standard'
  if (avgBeam >= 60) return 'well-maintained'
  if (avgBeam >= 45) return 'functional'
  if (avgBeam >= 30) return 'aging'
  if (avgBeam >= 15) return 'dilapidated'
  return 'dark-coast'
}

// ─── Keeper Grade ───────────────────────────────────────

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(90) // 'head-keeper'
 */
export function classifyKeeperGrade(avgIllumination: number): LighthouseLensStats['keeperGrade'] {
  if (avgIllumination >= 75) return 'head-keeper'
  if (avgIllumination >= 60) return 'principal-keeper'
  if (avgIllumination >= 45) return 'assistant-keeper'
  if (avgIllumination >= 30) return 'lamplighter'
  if (avgIllumination >= 15) return 'watchman'
  return 'sleepwalker'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate lighthouse recommendations
 * @example
 * generateRecommendations(readings, stations, service, stats) // ['Add JSDoc...']
 */
export function generateRecommendations(
  _readings: LensReading[],
  _stations: CoastalStation[],
  _service: LighthouseService,
  stats: LighthouseLensStats,
): string[] {
  const recs: string[] = []

  if (stats.shipwreckCount > 0) {
    recs.push('Add exports, types, and documentation to illuminate shipwreck files')
  }
  if (stats.hasDarkSpotsCount > stats.totalFiles * 0.3) {
    recs.push('Remove TODOs and console calls to eliminate dark spots in the beam')
  }
  if (stats.avgBeamIntensity < 35) {
    recs.push('Add JSDoc documentation and descriptive names to increase beam intensity')
  }
  if (stats.avgLensQuality < 35) {
    recs.push('Add interfaces and type annotations to improve lens clarity')
  }
  if (stats.hasAberrationCount > stats.totalFiles * 0.3) {
    recs.push('Resolve deprecated markers and excessive TODOs to correct focal aberration')
  }
  if (stats.hasCondensationCount > stats.totalFiles * 0.4) {
    recs.push('Reduce branch complexity to clear lens condensation')
  }
  if (stats.avgWarningSystem < 35) {
    recs.push('Add error handling and type guards to improve the warning system')
  }

  if (recs.length === 0) {
    recs.push('This lighthouse shines brilliantly — keep the light burning')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full lighthouse lens result
 * @example
 * buildLighthouseLensResult(files, contents, {}) // LighthouseLensResult
 */
export function buildLighthouseLensResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): LighthouseLensResult {
  const readings: LensReading[] = files.map((file, i) =>
    analyzeLensReading(contents[i] ?? '', file),
  )

  const stationMap = new Map<string, LensReading[]>()
  for (const reading of readings) {
    const dir = reading.file.includes('/') ? reading.file.substring(0, reading.file.lastIndexOf('/')) : '.'
    const existing = stationMap.get(dir)
    if (existing) {
      existing.push(reading)
    } else {
      stationMap.set(dir, [reading])
    }
  }

  const stations: CoastalStation[] = Array.from(stationMap.entries()).map(([dir, sReadings]) =>
    analyzeCoastalStation(sReadings, dir),
  )

  const totalFiles = readings.length
  const avg = (fn: (r: LensReading) => number) =>
    totalFiles === 0 ? 0 : Math.round(readings.reduce((s, r) => s + fn(r), 0) / totalFiles)

  const overallIllumination = avg(r => r.qualityScore)

  const service: LighthouseService = {
    avgBeamIntensity: avg(r => r.beamIntensity),
    avgLensQuality: avg(r => r.lensQuality),
    avgWarningSystem: avg(r => r.warningSystem),
    isReliable: overallIllumination >= 60,
    overallIllumination,
  }

  const bestReading = readings.length > 0
    ? readings.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best, readings[0] as typeof readings[number]).file
    : ''
  const brightestBeam = readings.length > 0
    ? readings.reduce((best, r) => r.beamIntensity > best.beamIntensity ? r : best, readings[0] as typeof readings[number]).file
    : ''
  const clearestLens = readings.length > 0
    ? readings.reduce((best, r) => r.lensQuality > best.lensQuality ? r : best, readings[0] as typeof readings[number]).file
    : ''
  const sharpestFocus = readings.length > 0
    ? readings.reduce((best, r) => r.focalPrecision > best.focalPrecision ? r : best, readings[0] as typeof readings[number]).file
    : ''
  const bestWarning = readings.length > 0
    ? readings.reduce((best, r) => r.warningSystem > best.warningSystem ? r : best, readings[0] as typeof readings[number]).file
    : ''

  const stats: LighthouseLensStats = {
    totalFiles,
    totalStations: stations.length,
    avgBeamIntensity: service.avgBeamIntensity,
    avgLensQuality: service.avgLensQuality,
    avgFocalPrecision: avg(r => r.focalPrecision),
    avgRotationSpeed: avg(r => r.rotationSpeed),
    avgVisibilityRange: avg(r => r.visibilityRange),
    avgWarningSystem: service.avgWarningSystem,
    pharosCount: readings.filter(r => r.condition === 'pharos-of-alexandria').length,
    modernAutomatedCount: readings.filter(r => r.condition === 'modern-automated').length,
    classicFresnelCount: readings.filter(r => r.condition === 'classic-fresnel').length,
    solarPoweredCount: readings.filter(r => r.condition === 'solar-powered').length,
    decommissionedCount: readings.filter(r => r.condition === 'decommissioned').length,
    shipwreckCount: readings.filter(r => r.condition === 'shipwreck').length,
    isBrightCount: readings.filter(r => r.beam.isBright).length,
    hasDarkSpotsCount: readings.filter(r => r.beam.hasDarkSpots).length,
    isCrystalCount: readings.filter(r => r.lens.isCrystal).length,
    hasCondensationCount: readings.filter(r => r.lens.hasCondensation).length,
    hasSharpFocusCount: readings.filter(r => r.focal.hasSharpFocus).length,
    hasAberrationCount: readings.filter(r => r.focal.hasAberration).length,
    isReliableCount: readings.filter(r => r.rotation.isReliable).length,
    hasEmergencyModeCount: readings.filter(r => r.rotation.hasEmergencyMode).length,
    hasLongRangeCount: readings.filter(r => r.visibility.hasLongRange).length,
    hasAudibleWarningCount: readings.filter(r => r.warning.hasAudibleWarning).length,
    hasCollisionAvoidanceCount: readings.filter(r => r.warning.hasCollisionAvoidance).length,
    hasSafePassageCount: readings.filter(r => r.warning.hasSafePassage).length,
    overallIllumination,
    keeperGrade: classifyKeeperGrade(overallIllumination),
    bestReading, brightestBeam, clearestLens, sharpestFocus, bestWarning,
  }

  const recommendations = generateRecommendations(readings, stations, service, stats)

  return { readings, stations, service, stats, recommendations }
}
