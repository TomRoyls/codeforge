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

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface ElevationMeasure {
  height: number
  grade: 'summit' | 'peak' | 'ridge' | 'foothill' | 'valley' | 'canyon-floor'
  isHigh: boolean
  hasPanoramicView: boolean
  hasProperAltitude: boolean
  hasNoFalseSummit: boolean
  hasTrigPoint: boolean
  hasContourLines: boolean
  hasNoAltitudeSickness: boolean
  hasProperGradient: boolean
  hasNoSheerDrop: boolean
  hasPlateauTop: boolean
  falseSummitCount: number
  sheerDropCount: number
}

export interface LayeringMeasure {
  quality: number
  type: 'sedimentary' | 'metamorphic' | 'igneous' | 'volcanic' | 'alluvial' | 'unstratified'
  isWellLayered: boolean
  hasClearStrata: boolean
  hasProperBedding: boolean
  hasNoUnconformity: boolean
  hasCrossBedding: boolean
  hasGradedBeds: boolean
  hasNoFold: boolean
  hasNoFault: boolean
  hasFossilBeds: boolean
  hasNoIntrusion: boolean
  unconformityCount: number
  faultCount: number
}

export interface ErosionMeasure {
  resistance: number
  rate: 'negligible' | 'slow' | 'moderate' | 'rapid' | 'severe' | 'catastrophic'
  isErosionResistant: boolean
  hasWeatheringResistance: boolean
  hasHardRock: boolean
  hasNoSoftSandstone: boolean
  hasProperDrainage: boolean
  hasNoRillErosion: boolean
  hasNoGullyErosion: boolean
  hasVegetation: boolean
  hasNoFlashFlood: boolean
  hasProperSlope: boolean
  rillCount: number
  gullyCount: number
}

export interface CliffMeasure {
  quality: number
  face: 'vertical' | 'overhanging' | 'stepped' | 'talus' | 'scree' | 'gentle-slope'
  hasCleanInterface: boolean
  hasVerticalFace: boolean
  hasNoOverhang: boolean
  hasProperHandholds: boolean
  hasNoLooseRock: boolean
  hasNaturalTerrace: boolean
  hasNoRockfall: boolean
  hasAnchorPoints: boolean
  hasProperExposure: boolean
  hasNoUndercutting: boolean
  looseRockCount: number
  rockfallCount: number
}

export interface CaprockMeasure {
  strength: number
  material: 'basalt' | 'granite' | 'sandstone' | 'limestone' | 'shale' | 'clay'
  isStrong: boolean
  hasProtectiveLayer: boolean
  hasUniformHardness: boolean
  hasNoFracturing: boolean
  hasNoSpalling: boolean
  hasJointPattern: boolean
  hasNoExfoliation: boolean
  hasDesertVarnish: boolean
  hasNoUndermining: boolean
  hasProperAnchoring: boolean
  fracturingCount: number
  underminingCount: number
}

export interface HealthMeasure {
  score: number
  status: 'majestic' | 'stable' | 'weathering' | 'eroding' | 'crumbling' | 'collapsed'
  isStable: boolean
  hasLongevity: boolean
  hasNoStructuralWeakness: boolean
  hasNaturalBeauty: boolean
  hasEcologicalValue: boolean
  hasNoLandslideRisk: boolean
  hasProperSealing: boolean
  hasNoSettling: boolean
  hasArchaeological: boolean
  hasNoDesertification: boolean
  landslideRiskCount: number
  settlingCount: number
}

export interface MesaLayer {
  file: string
  elevation: number
  layering: number
  erosionResistance: number
  cliffFace: number
  caprockStrength: number
  plateauHealth: number
  elev: ElevationMeasure
  layer: LayeringMeasure
  erosion: ErosionMeasure
  cliff: CliffMeasure
  caprock: CaprockMeasure
  health: HealthMeasure
  condition: 'monument-valley' | 'table-mountain' | 'mesa-verde' | 'butte' | 'hoodoo' | 'dust'
  qualityScore: number
}

export interface PlateauRegion {
  directory: string
  layers: MesaLayer[]
  avgElevation: number
  avgLayering: number
  avgHealth: number
  monumentCount: number
  dustCount: number
  highCount: number
  stableCount: number
  regionType: 'national-park' | 'wilderness' | 'badlands' | 'canyon' | 'plains' | 'wasteland'
  condition: 'world-heritage' | 'protected' | 'monument' | 'recreational' | 'abandoned' | 'quarry'
}

export interface MesaPlateauResult {
  layers: MesaLayer[]
  regions: PlateauRegion[]
  range: {
    avgElevation: number
    avgLayering: number
    avgHealth: number
    isMajestic: boolean
    overallStability: number
  }
  stats: {
    totalFiles: number
    totalRegions: number
    avgElevation: number
    avgLayering: number
    avgErosionResistance: number
    avgCliffFace: number
    avgCaprockStrength: number
    avgPlateauHealth: number
    monumentValleyCount: number
    tableMountainCount: number
    mesaVerdeCount: number
    butteCount: number
    hoodooCount: number
    dustCount: number
    isHighCount: number
    isWellLayeredCount: number
    isErosionResistantCount: number
    hasCleanInterfaceCount: number
    isStrongCount: number
    isStableCount: number
    overallStability: number
    geologistGrade: 'field-geologist' | 'stratigrapher' | 'geomorphologist' | 'geologist' | 'rockhound' | 'tourist'
    bestLayer: string
    highest: string
    bestLayered: string
    mostResistant: string
    bestCliff: string
    strongestCaprock: string
  }
  recommendations: string[]
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

/** @example countExports('export const x = 1') returns 1 */
export function countExports(content: string): number {
  return (content.match(EXPORT_REGEX) ?? []).length
}

/** @example countImportKeywords('import { x }') returns 1 */
export function countImportKeywords(content: string): number {
  return (content.match(IMPORT_REGEX) ?? []).length
}

/** @example countFunctions('function foo()') returns 1 */
export function countFunctions(content: string): number {
  return (content.match(FUNCTION_REGEX) ?? []).length
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return (content.match(ARROW_REGEX) ?? []).length
}

/** @example countClasses('class Foo') returns 1 */
export function countClasses(content: string): number {
  return (content.match(CLASS_REGEX) ?? []).length
}

/** @example countInterfaces('interface Foo') returns 1 */
export function countInterfaces(content: string): number {
  return (content.match(INTERFACE_REGEX) ?? []).length
}

/** @example countTypeAliases('type X = string') returns 1 */
export function countTypeAliases(content: string): number {
  return (content.match(TYPE_REGEX) ?? []).length
}

/** @example countEnums('enum X') returns 1 */
export function countEnums(content: string): number {
  return (content.match(ENUM_REGEX) ?? []).length
}

/** @example countJSDoc(content) returns JSDoc count */
export function countJSDoc(content: string): number {
  return (content.match(JSDOC_REGEX) ?? []).length
}

/** @example countAsync('async function') returns count */
export function countAsync(content: string): number {
  return (content.match(ASYNC_REGEX) ?? []).length
}

/** @example countTryCatch('try {') returns count */
export function countTryCatch(content: string): number {
  return (content.match(TRY_CATCH_REGEX) ?? []).length
}

/** @example countDeepNested(code) returns count */
export function countDeepNested(content: string): number {
  return (content.match(DEEP_NESTED_REGEX) ?? []).length
}

/** @example countTernaries('x ? 1 : 2') returns count */
export function countTernaries(content: string): number {
  return (content.match(TERNARY_REGEX) ?? []).length
}

/** @example countConsole('console.log()') returns count */
export function countConsole(content: string): number {
  return (content.match(CONSOLE_REGEX) ?? []).length
}

/** @example countTodos('// TODO') returns count */
export function countTodos(content: string): number {
  return (content.match(TODO_REGEX) ?? []).length
}

/** @example countAny('any') returns count */
export function countAny(content: string): number {
  return (content.match(ANY_REGEX) ?? []).length
}

/** @example countCommentedCode('// function') returns count */
export function countCommentedCode(content: string): number {
  return (content.match(COMMENTED_CODE_REGEX) ?? []).length
}

/** @example countGenerics('<T>') returns count */
export function countGenerics(content: string): number {
  return (content.match(GENERICS_REGEX) ?? []).length
}

/** @example countAccessModifiers('private x') returns count */
export function countAccessModifiers(content: string): number {
  return (
    (content.match(PRIVATE_REGEX) ?? []).length +
    (content.match(PROTECTED_REGEX) ?? []).length +
    (content.match(PUBLIC_REGEX) ?? []).length
  )
}

/** @example countStatic('static x') returns count */
export function countStatic(content: string): number {
  return (content.match(STATIC_REGEX) ?? []).length
}

/** @example countReadonly('readonly') returns count */
export function countReadonly(content: string): number {
  return (content.match(READONLY_REGEX) ?? []).length
}

/** @example countReexports("export { x } from 'y'") returns count */
export function countReexports(content: string): number {
  return (content.match(REEXPORT_REGEX) ?? []).length
}

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureElevation(content) returns ElevationMeasure */
export function measureElevation(content: string): ElevationMeasure {
  const exportCount = countExports(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const jsdoc = countJSDoc(content)

  const falseSummitCount = consoleCount
  const sheerDropCount = deepNested
  const isHigh = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasPanoramicView = exportCount > 2
  const hasProperAltitude = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasNoFalseSummit = falseSummitCount === 0
  const hasTrigPoint = exportCount > 0
  const hasContourLines = interfaceCount > 0 && typeCount > 0
  const hasNoAltitudeSickness = anyCount === 0
  const hasProperGradient = functionCount > 0 && arrowCount > 0
  const hasNoSheerDrop = sheerDropCount === 0
  const hasPlateauTop = jsdoc > 0 && exportCount > 0

  let height = 0
  if (isHigh) height += 15
  if (hasPanoramicView) height += 15
  if (hasProperAltitude) height += 10
  if (hasNoFalseSummit) height += 10
  if (hasTrigPoint) height += 10
  if (hasContourLines) height += 10
  if (hasNoAltitudeSickness) height += 10
  if (hasProperGradient) height += 10
  if (hasNoSheerDrop) height += 10
  height = Math.min(height, 100)
  height = Math.max(height, 0)

  let grade: ElevationMeasure['grade'] = 'canyon-floor'
  if (height >= 80 && hasPanoramicView) grade = 'summit'
  else if (height >= 65) grade = 'peak'
  else if (height >= 50) grade = 'ridge'
  else if (height >= 35) grade = 'foothill'
  else if (height >= 20) grade = 'valley'

  return {
    falseSummitCount,
    grade,
    hasContourLines,
    hasNoAltitudeSickness,
    hasNoFalseSummit,
    hasNoSheerDrop,
    hasPanoramicView,
    hasPlateauTop,
    hasProperAltitude,
    hasProperGradient,
    hasTrigPoint,
    height,
    isHigh,
    sheerDropCount,
  }
}

/** @example measureLayering(content) returns LayeringMeasure */
export function measureLayering(content: string): LayeringMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const enumCount = countEnums(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const anyCount = countAny(content)
  const deepNested = countDeepNested(content)
  const generics = countGenerics(content)

  const unconformityCount = anyCount
  const faultCount = deepNested
  const isWellLayered = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasClearStrata = interfaceCount > 0 && typeCount > 0
  const hasProperBedding = classCount > 0 && interfaceCount > 0
  const hasNoUnconformity = unconformityCount === 0
  const hasCrossBedding = generics > 0
  const hasGradedBeds = exportCount > 0 && importCount > 0
  const hasNoFold = deepNested === 0
  const hasNoFault = faultCount === 0
  const hasFossilBeds = enumCount > 0
  const hasNoIntrusion = anyCount === 0

  let quality = 0
  if (isWellLayered) quality += 15
  if (hasClearStrata) quality += 15
  if (hasProperBedding) quality += 10
  if (hasNoUnconformity) quality += 10
  if (hasCrossBedding) quality += 10
  if (hasGradedBeds) quality += 10
  if (hasNoFold) quality += 10
  if (hasNoFault) quality += 10
  if (hasFossilBeds) quality += 10
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let type: LayeringMeasure['type'] = 'unstratified'
  if (quality >= 80 && hasClearStrata) type = 'sedimentary'
  else if (quality >= 65 && isWellLayered) type = 'metamorphic'
  else if (quality >= 50 && hasProperBedding) type = 'igneous'
  else if (quality >= 35) type = 'volcanic'
  else if (quality >= 20) type = 'alluvial'

  return {
    faultCount,
    hasClearStrata,
    hasCrossBedding,
    hasFossilBeds,
    hasGradedBeds,
    hasNoFault,
    hasNoFold,
    hasNoIntrusion,
    hasNoUnconformity,
    hasProperBedding,
    isWellLayered,
    quality,
    type,
    unconformityCount,
  }
}

/** @example measureErosion(content) returns ErosionMeasure */
export function measureErosion(content: string): ErosionMeasure {
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)
  const tryCatch = countTryCatch(content)
  const jsdoc = countJSDoc(content)
  const deepNested = countDeepNested(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)

  const rillCount = consoleCount + todos
  const gullyCount = deepNested + anyCount
  const isErosionResistant = rillCount === 0 && gullyCount === 0
  const hasWeatheringResistance = tryCatch > 0
  const hasHardRock = exportCount > 0 && (countClasses(content) > 0)
  const hasNoSoftSandstone = commentedCode === 0
  const hasProperDrainage = tryCatch > 0
  const hasNoRillErosion = rillCount === 0
  const hasNoGullyErosion = gullyCount === 0
  const hasVegetation = jsdoc > 0
  const hasNoFlashFlood = consoleCount === 0
  const hasProperSlope = exportCount > 0 && importCount > 0

  let resistance = 0
  if (isErosionResistant) resistance += 15
  if (hasWeatheringResistance) resistance += 15
  if (hasHardRock) resistance += 10
  if (hasNoSoftSandstone) resistance += 10
  if (hasProperDrainage) resistance += 10
  if (hasNoRillErosion) resistance += 10
  if (hasVegetation) resistance += 10
  if (hasNoFlashFlood) resistance += 10
  if (hasProperSlope) resistance += 10
  resistance = Math.min(resistance, 100)
  resistance = Math.max(resistance, 0)

  let rate: ErosionMeasure['rate'] = 'catastrophic'
  if (resistance >= 80) rate = 'negligible'
  else if (resistance >= 65) rate = 'slow'
  else if (resistance >= 50) rate = 'moderate'
  else if (resistance >= 35) rate = 'rapid'
  else if (resistance >= 20) rate = 'severe'

  return {
    gullyCount,
    hasHardRock,
    hasNoFlashFlood,
    hasNoGullyErosion,
    hasNoRillErosion,
    hasNoSoftSandstone,
    hasProperDrainage,
    hasProperSlope,
    hasVegetation,
    hasWeatheringResistance,
    isErosionResistant,
    rate,
    resistance,
    rillCount,
  }
}

/** @example measureCliff(content) returns CliffMeasure */
export function measureCliff(content: string): CliffMeasure {
  const exportCount = countExports(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const classCount = countClasses(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)
  const staticCount = countStatic(content)

  const looseRockCount = anyCount
  const rockfallCount = consoleCount
  const hasCleanInterface = interfaceCount > 0 && typeCount > 0
  const hasVerticalFace = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasNoOverhang = deepNestedCount(content) === 0
  const hasProperHandholds = exportCount > 0 && (countFunctions(content) > 0 || countArrows(content) > 0)
  const hasNoLooseRock = looseRockCount === 0
  const hasNaturalTerrace = generics > 0
  const hasNoRockfall = rockfallCount === 0
  const hasAnchorPoints = readonlyCount > 0 || staticCount > 0
  const hasProperExposure = accessMods > 0
  const hasNoUndercutting = anyCount === 0

  let quality = 0
  if (hasCleanInterface) quality += 15
  if (hasVerticalFace) quality += 15
  if (hasNoOverhang) quality += 10
  if (hasProperHandholds) quality += 10
  if (hasNoLooseRock) quality += 10
  if (hasNaturalTerrace) quality += 10
  if (hasNoRockfall) quality += 10
  if (hasAnchorPoints) quality += 10
  if (hasProperExposure) quality += 10
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let face: CliffMeasure['face'] = 'gentle-slope'
  if (quality >= 80 && hasCleanInterface) face = 'vertical'
  else if (quality >= 65 && hasVerticalFace) face = 'overhanging'
  else if (quality >= 50) face = 'stepped'
  else if (quality >= 35) face = 'talus'
  else if (quality >= 20) face = 'scree'

  return {
    face,
    hasAnchorPoints,
    hasCleanInterface,
    hasNaturalTerrace,
    hasNoLooseRock,
    hasNoOverhang,
    hasNoRockfall,
    hasNoUndercutting,
    hasProperExposure,
    hasProperHandholds,
    hasVerticalFace,
    looseRockCount,
    quality,
    rockfallCount,
  }
}

/** @example measureCaprock(content) returns CaprockMeasure */
export function measureCaprock(content: string): CaprockMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const enumCount = countEnums(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const readonlyCount = countReadonly(content)
  const staticCount = countStatic(content)
  const accessMods = countAccessModifiers(content)
  const generics = countGenerics(content)

  const fracturingCount = anyCount + consoleCount
  const underminingCount = commentedCode
  const isStrong = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && fracturingCount === 0
  const hasProtectiveLayer = readonlyCount > 0 || staticCount > 0
  const hasUniformHardness = accessMods > 0
  const hasNoFracturing = fracturingCount === 0
  const hasNoSpalling = consoleCount === 0
  const hasJointPattern = generics > 0
  const hasNoExfoliation = deepNestedCount(content) === 0
  const hasDesertVarnish = enumCount > 0
  const hasNoUndermining = underminingCount === 0
  const hasProperAnchoring = interfaceCount > 0 && typeCount > 0

  let strength = 0
  if (isStrong) strength += 15
  if (hasProtectiveLayer) strength += 10
  if (hasUniformHardness) strength += 10
  if (hasNoFracturing) strength += 15
  if (hasNoSpalling) strength += 10
  if (hasJointPattern) strength += 10
  if (hasNoExfoliation) strength += 10
  if (hasDesertVarnish) strength += 10
  if (hasProperAnchoring) strength += 10
  strength = Math.min(strength, 100)
  strength = Math.max(strength, 0)

  let material: CaprockMeasure['material'] = 'clay'
  if (strength >= 80 && isStrong) material = 'basalt'
  else if (strength >= 65 && hasProperAnchoring) material = 'granite'
  else if (strength >= 50) material = 'sandstone'
  else if (strength >= 35) material = 'limestone'
  else if (strength >= 20) material = 'shale'

  return {
    fracturingCount,
    hasDesertVarnish,
    hasJointPattern,
    hasNoExfoliation,
    hasNoFracturing,
    hasNoSpalling,
    hasNoUndermining,
    hasProperAnchoring,
    hasProtectiveLayer,
    hasUniformHardness,
    isStrong,
    material,
    strength,
    underminingCount,
  }
}

/** @example measureHealth(content) returns HealthMeasure */
export function measureHealth(content: string): HealthMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const deepNested = countDeepNested(content)

  const landslideRiskCount = anyCount + consoleCount
  const settlingCount = commentedCode
  const isStable = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && landslideRiskCount === 0
  const hasLongevity = exportCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasNoStructuralWeakness = deepNested === 0
  const hasNaturalBeauty = countJSDoc(content) > 0
  const hasEcologicalValue = exportCount > 0 && importCount > 0
  const hasNoLandslideRisk = landslideRiskCount === 0
  const hasProperSealing = accessModsCount(content) > 0
  const hasNoSettling = settlingCount === 0
  const hasArchaeological = enumCount(content) > 0
  const hasNoDesertification = exportCount > 0

  let score = 0
  if (isStable) score += 15
  if (hasLongevity) score += 10
  if (hasNoStructuralWeakness) score += 10
  if (hasNaturalBeauty) score += 10
  if (hasEcologicalValue) score += 10
  if (hasNoLandslideRisk) score += 10
  if (hasProperSealing) score += 10
  if (hasNoSettling) score += 10
  if (hasNoDesertification) score += 5
  score = Math.min(score, 100)
  score = Math.max(score, 0)

  let status: HealthMeasure['status'] = 'collapsed'
  if (isStable && score >= 80) status = 'majestic'
  else if (score >= 65) status = 'stable'
  else if (score >= 50) status = 'weathering'
  else if (score >= 35) status = 'eroding'
  else if (score >= 20) status = 'crumbling'

  return {
    hasArchaeological,
    hasEcologicalValue,
    hasLongevity,
    hasNaturalBeauty,
    hasNoDesertification,
    hasNoLandslideRisk,
    hasNoSettling,
    hasNoStructuralWeakness,
    hasProperSealing,
    isStable,
    landslideRiskCount,
    score,
    settlingCount,
    status,
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function deepNestedCount(content: string): number {
  return (content.match(DEEP_NESTED_REGEX) ?? []).length
}

function accessModsCount(content: string): number {
  return (
    (content.match(PRIVATE_REGEX) ?? []).length +
    (content.match(PROTECTED_REGEX) ?? []).length +
    (content.match(PUBLIC_REGEX) ?? []).length
  )
}

function enumCount(content: string): number {
  return (content.match(ENUM_REGEX) ?? []).length
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): MesaLayer['condition'] {
  if (score >= 80) return 'monument-valley'
  if (score >= 65) return 'table-mountain'
  if (score >= 50) return 'mesa-verde'
  if (score >= 35) return 'butte'
  if (score >= 20) return 'hoodoo'
  return 'dust'
}

/** @example classifyRegionType(layers) returns region type */
export function classifyRegionType(layers: MesaLayer[]): PlateauRegion['regionType'] {
  if (layers.length === 0) return 'wasteland'
  const avgQuality = layers.reduce((s, l) => s + l.qualityScore, 0) / layers.length
  const monumentCount = layers.filter((l) => l.condition === 'monument-valley').length
  if (avgQuality >= 75 && monumentCount >= Math.ceil(layers.length * 0.3)) return 'national-park'
  if (avgQuality >= 60) return 'wilderness'
  if (avgQuality >= 45) return 'badlands'
  if (avgQuality >= 30) return 'canyon'
  if (avgQuality >= 15) return 'plains'
  return 'wasteland'
}

/** @example classifyRegionCondition(avgQuality) returns condition */
export function classifyRegionCondition(avgQuality: number): PlateauRegion['condition'] {
  if (avgQuality >= 80) return 'world-heritage'
  if (avgQuality >= 65) return 'protected'
  if (avgQuality >= 50) return 'monument'
  if (avgQuality >= 35) return 'recreational'
  if (avgQuality >= 20) return 'abandoned'
  return 'quarry'
}

/** @example classifyGeologistGrade(avgStability) returns grade */
export function classifyGeologistGrade(avgStability: number): MesaPlateauResult['stats']['geologistGrade'] {
  if (avgStability >= 80) return 'field-geologist'
  if (avgStability >= 65) return 'stratigrapher'
  if (avgStability >= 50) return 'geomorphologist'
  if (avgStability >= 35) return 'geologist'
  if (avgStability >= 20) return 'rockhound'
  return 'tourist'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeMesaLayer(content, filePath) returns MesaLayer */
export function analyzeMesaLayer(content: string, filePath: string): MesaLayer {
  const elev = measureElevation(content)
  const layer = measureLayering(content)
  const erosion = measureErosion(content)
  const cliff = measureCliff(content)
  const caprock = measureCaprock(content)
  const health = measureHealth(content)

  const qualityScore = Math.round(
    elev.height * 0.2 + layer.quality * 0.2 + erosion.resistance * 0.15 +
    cliff.quality * 0.15 + caprock.strength * 0.15 + health.score * 0.15,
  )

  return {
    caprock,
    caprockStrength: caprock.strength,
    cliff,
    cliffFace: cliff.quality,
    condition: classifyCondition(qualityScore),
    elev,
    elevation: elev.height,
    erosion,
    erosionResistance: erosion.resistance,
    file: filePath,
    health,
    layer,
    layering: layer.quality,
    plateauHealth: health.score,
    qualityScore,
  }
}

/** @example analyzePlateauRegion(layers, dirPath) returns PlateauRegion */
export function analyzePlateauRegion(layers: MesaLayer[], dirPath: string): PlateauRegion {
  const avgElevation = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.elevation, 0) / layers.length) : 0
  const avgLayering = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.layering, 0) / layers.length) : 0
  const avgHealth = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.plateauHealth, 0) / layers.length) : 0
  const monumentCount = layers.filter((l) => l.condition === 'monument-valley').length
  const dustCount = layers.filter((l) => l.condition === 'dust').length
  const highCount = layers.filter((l) => l.elev.isHigh).length
  const stableCount = layers.filter((l) => l.health.isStable).length
  const regionType = classifyRegionType(layers)
  const avgQuality = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.qualityScore, 0) / layers.length) : 0
  const condition = classifyRegionCondition(avgQuality)

  return {
    avgElevation,
    avgHealth,
    avgLayering,
    condition,
    directory: dirPath,
    dustCount,
    highCount,
    layers,
    monumentCount,
    regionType,
    stableCount,
  }
}

/** @example generateRecommendations(layers, regions, range, stats) returns string[] */
export function generateRecommendations(
  layers: MesaLayer[],
  _regions: PlateauRegion[],
  range: MesaPlateauResult['range'],
  _stats: MesaPlateauResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (range.overallStability < 50) {
    recommendations.push('Plateau stability is low — add types, interfaces, and error handling to strengthen geological layers')
  }

  const erodingLayers = layers.filter((l) => !l.erosion.isErosionResistant)
  if (erodingLayers.length > 0) {
    recommendations.push(`${erodingLayers.length} layer/layers are eroding — reduce any types, console logs, and technical debt`)
  }

  const dustLayers = layers.filter((l) => l.condition === 'dust')
  if (dustLayers.length > 0) {
    recommendations.push(`${dustLayers.length} layer/layers are dust — consider adding meaningful code structure`)
  }

  const weakCaprock = layers.filter((l) => !l.caprock.isStrong)
  if (weakCaprock.length > 0) {
    recommendations.push(`${weakCaprock.length} layer/layers have weak caprock — strengthen core with classes, types, and encapsulation`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Mesa plateau is majestic with strong geological layers — maintain current stability')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildMesaPlateauResult(files, contents, options) returns MesaPlateauResult */
export function buildMesaPlateauResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): MesaPlateauResult {
  const layers: MesaLayer[] = files.map((file, i) =>
    analyzeMesaLayer(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, MesaLayer[]>()
  for (const layer of layers) {
    const dir = layer.file.includes('/') ? layer.file.substring(0, layer.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(layer)
    } else {
      dirMap.set(dir, [layer])
    }
  }

  const regions: PlateauRegion[] = Array.from(dirMap.entries()).map(([dir, dirLayers]) =>
    analyzePlateauRegion(dirLayers, dir),
  )

  const avgElevation = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.elevation, 0) / layers.length) : 0
  const avgLayering = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.layering, 0) / layers.length) : 0
  const avgErosionResistance = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.erosionResistance, 0) / layers.length) : 0
  const avgCliffFace = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.cliffFace, 0) / layers.length) : 0
  const avgCaprockStrength = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.caprockStrength, 0) / layers.length) : 0
  const avgPlateauHealth = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.plateauHealth, 0) / layers.length) : 0
  const overallStability = layers.length > 0 ? Math.round(layers.reduce((s, l) => s + l.qualityScore, 0) / layers.length) : 0

  const range = {
    avgElevation,
    avgHealth: avgPlateauHealth,
    avgLayering,
    isMajestic: overallStability >= 65,
    overallStability,
  }

  const monumentValleyCount = layers.filter((l) => l.condition === 'monument-valley').length
  const tableMountainCount = layers.filter((l) => l.condition === 'table-mountain').length
  const mesaVerdeCount = layers.filter((l) => l.condition === 'mesa-verde').length
  const butteCount = layers.filter((l) => l.condition === 'butte').length
  const hoodooCount = layers.filter((l) => l.condition === 'hoodoo').length
  const dustCount = layers.filter((l) => l.condition === 'dust').length
  const isHighCount = layers.filter((l) => l.elev.isHigh).length
  const isWellLayeredCount = layers.filter((l) => l.layer.isWellLayered).length
  const isErosionResistantCount = layers.filter((l) => l.erosion.isErosionResistant).length
  const hasCleanInterfaceCount = layers.filter((l) => l.cliff.hasCleanInterface).length
  const isStrongCount = layers.filter((l) => l.caprock.isStrong).length
  const isStableCount = layers.filter((l) => l.health.isStable).length

  const geologistGrade = classifyGeologistGrade(overallStability)

  const bestLayer = layers.length > 0
    ? layers.reduce((best, l) => l.qualityScore > best.qualityScore ? l : best).file : ''
  const highest = layers.length > 0
    ? layers.reduce((best, l) => l.elevation > best.elevation ? l : best).file : ''
  const bestLayered = layers.length > 0
    ? layers.reduce((best, l) => l.layering > best.layering ? l : best).file : ''
  const mostResistant = layers.length > 0
    ? layers.reduce((best, l) => l.erosionResistance > best.erosionResistance ? l : best).file : ''
  const bestCliff = layers.length > 0
    ? layers.reduce((best, l) => l.cliffFace > best.cliffFace ? l : best).file : ''
  const strongestCaprock = layers.length > 0
    ? layers.reduce((best, l) => l.caprockStrength > best.caprockStrength ? l : best).file : ''

  const stats = {
    avgCaprockStrength,
    avgCliffFace,
    avgElevation,
    avgErosionResistance,
    avgLayering,
    avgPlateauHealth,
    bestCliff,
    bestLayer,
    bestLayered,
    butteCount,
    dustCount,
    geologistGrade,
    hasCleanInterfaceCount,
    highest,
    hoodooCount,
    isErosionResistantCount,
    isHighCount,
    isStableCount,
    isStrongCount,
    isWellLayeredCount,
    mesaVerdeCount,
    monumentValleyCount,
    mostResistant,
    overallStability,
    strongestCaprock,
    tableMountainCount,
    totalFiles: files.length,
    totalRegions: regions.length,
  }

  const recommendations = generateRecommendations(layers, regions, range, stats)

  return { layers, range, recommendations, regions, stats }
}
