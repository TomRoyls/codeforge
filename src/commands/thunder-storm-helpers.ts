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
const CATCH_REGEX = /\bcatch\b/g
const FINALLY_REGEX = /\bfinally\b/g
const THROW_REGEX = /\bthrow\b/g
const IF_REGEX = /\bif\s*\(/g
const FOR_REGEX = /\bfor\s*[\(;]/g
const DEEP_NESTED_REGEX = /\{[^{}]*\{[^{}]*\{[^{}]*\}/g
const TERNARY_REGEX = /\?[^:]+:/g
const CONSOLE_REGEX = /\bconsole\.\w+/g
const TODO_REGEX = /\/\/\s*(TODO|FIXME|HACK|XXX|BUG)/gi
const ERROR_REGEX = /\bnew\s+Error\b/g
const GENERICS_REGEX = /<[^>]+>/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const COMMENT_REGEX = /\/\/.*$/gm
const DEFAULT_EXPORT_REGEX = /\bexport\s+default\b/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface LightningMeasure {
  intensity: number
  type: 'bolt' | 'forked' | 'sheet' | 'heat' | 'ball' | 'none'
  hasHighImpact: boolean
  hasGroundStrike: boolean
  hasCloudToCloud: boolean
  hasPositiveStrike: boolean
  hasNoMisfire: boolean
  hasNoStrayVoltage: boolean
  hasProperChannel: boolean
  hasReturnStroke: boolean
  hasSteppedLeader: boolean
  hasNoFlashover: boolean
  misfireCount: number
  strayVoltageCount: number
}

export interface ThunderMeasure {
  resonance: number
  volume: 'deafening' | 'loud' | 'moderate' | 'distant' | 'rumble' | 'silent'
  hasWideReach: boolean
  hasLowFrequency: boolean
  hasHighFrequency: boolean
  hasClap: boolean
  hasRoll: boolean
  hasNoEchoChamber: boolean
  hasProperPropagation: boolean
  hasNoInterference: boolean
  hasReverberation: boolean
  hasNoDeadZone: boolean
  echoChamberCount: number
  deadZoneCount: number
}

export interface WindMeasure {
  force: number
  scale: 'hurricane' | 'tornado' | 'gale' | 'strong' | 'breeze' | 'calm'
  hasHighVelocity: boolean
  hasProperDirection: boolean
  hasGustFront: boolean
  hasDownburst: boolean
  hasNoCrosswind: boolean
  hasNoWindShear: boolean
  hasUplift: boolean
  hasConvergence: boolean
  hasDivergence: boolean
  hasNoTurbulence: boolean
  crosswindCount: number
  turbulenceCount: number
}

export interface RainfallMeasure {
  volume: number
  intensity: 'torrential' | 'heavy' | 'moderate' | 'light' | 'drizzle' | 'dry'
  hasHighOutput: boolean
  hasProperDrainage: boolean
  hasNoFlooding: boolean
  hasNoDrought: boolean
  hasEvenDistribution: boolean
  hasProperCollection: boolean
  hasRunoff: boolean
  hasPercolation: boolean
  hasNoErosion: boolean
  hasNoContamination: boolean
  floodingCount: number
  contaminationCount: number
}

export interface PressureMeasure {
  level: number
  system: 'high-pressure' | 'ridge' | 'col' | 'trough' | 'low-pressure' | 'cyclone'
  hasProperComplexity: boolean
  hasNoBarometricExtremes: boolean
  hasIsobarClarity: boolean
  hasFrontalSystem: boolean
  hasNoStagnation: boolean
  hasProperCirculation: boolean
  hasConvectionCell: boolean
  hasNoInversion: boolean
  hasAdiabatic: boolean
  hasNoSupercell: boolean
  stagnationCount: number
  supercellCount: number
}

export interface StormMeasure {
  category: number
  classification: 'supercell' | 'squall-line' | 'multicell' | 'single-cell' | 'air-mass' | 'clear-sky'
  isPowerful: boolean
  hasOrganizedStructure: boolean
  hasRotation: boolean
  hasHookEcho: boolean
  hasMesocyclone: boolean
  hasNoAnvilSpreading: boolean
  hasProperLifeCycle: boolean
  hasNoDissipation: boolean
  hasCumulonimbus: boolean
  hasNoFunnelCloud: boolean
  dissipationCount: number
  funnelCount: number
}

export interface StormCell {
  file: string
  lightningIntensity: number
  thunderResonance: number
  windForce: number
  rainfallVolume: number
  atmosphericPressure: number
  stormCategory: number
  lightning: LightningMeasure
  thunder: ThunderMeasure
  wind: WindMeasure
  rainfall: RainfallMeasure
  pressure: PressureMeasure
  storm: StormMeasure
  condition: 'category-5' | 'category-4' | 'category-3' | 'category-2' | 'tropical-storm' | 'clear-day'
  qualityScore: number
}

export interface StormCluster {
  directory: string
  cells: StormCell[]
  avgIntensity: number
  avgReach: number
  avgPower: number
  cat5Count: number
  clearDayCount: number
  highImpactCount: number
  powerfulCount: number
  clusterType: 'hurricane' | 'typhoon' | 'cyclone' | 'squall' | 'shower' | 'drought'
  condition: 'apocalyptic' | 'severe' | 'moderate' | 'mild' | 'fair' | 'sunny'
}

export interface ThunderStormResult {
  cells: StormCell[]
  clusters: StormCluster[]
  atmosphere: {
    avgIntensity: number
    avgReach: number
    avgPower: number
    isElectrifying: boolean
    overallPower: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgLightningIntensity: number
    avgThunderResonance: number
    avgWindForce: number
    avgRainfallVolume: number
    avgAtmosphericPressure: number
    avgStormCategory: number
    category5Count: number
    category4Count: number
    category3Count: number
    category2Count: number
    tropicalStormCount: number
    clearDayCount: number
    hasHighImpactCount: number
    hasWideReachCount: number
    hasHighVelocityCount: number
    hasHighOutputCount: number
    hasProperComplexityCount: number
    isPowerfulCount: number
    overallPower: number
    meteorologistGrade: 'chief-meteorologist' | 'senior-forecaster' | 'meteorologist' | 'weather-observer' | 'storm-chaser' | 'umbrella-carrier'
    bestCell: string
    mostIntense: string
    widestReach: string
    fastest: string
    highestOutput: string
    mostPowerful: string
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

/** @example countThrow('throw new Error()') returns count */
export function countThrow(content: string): number {
  return (content.match(THROW_REGEX) ?? []).length
}

/** @example countFinally('finally {') returns count */
export function countFinally(content: string): number {
  return (content.match(FINALLY_REGEX) ?? []).length
}

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureLightning(content) returns LightningMeasure */
export function measureLightning(content: string): LightningMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)
  const throwCount = countThrow(content)
  const tryCatch = countTryCatch(content)

  const misfireCount = consoleCount + todos
  const strayVoltageCount = anyCount + commentedCode
  const hasNoMisfire = misfireCount === 0
  const hasNoStrayVoltage = strayVoltageCount === 0
  const hasHighImpact = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasGroundStrike = exportCount > 0 && throwCount > 0
  const hasCloudToCloud = importCount > 0 && exportCount > 0
  const hasPositiveStrike = tryCatch > 0 && throwCount > 0
  const hasProperChannel = functionCount > 0 || arrowCount > 0
  const hasReturnStroke = tryCatch > 0
  const hasSteppedLeader = exportCount > 0
  const hasNoFlashover = strayVoltageCount === 0 && misfireCount === 0

  let intensity = 0
  if (hasHighImpact) intensity += 15
  if (hasGroundStrike) intensity += 15
  if (hasCloudToCloud) intensity += 10
  if (hasPositiveStrike) intensity += 10
  if (hasNoMisfire) intensity += 10
  if (hasNoStrayVoltage) intensity += 10
  if (hasProperChannel) intensity += 10
  if (hasReturnStroke) intensity += 10
  if (hasSteppedLeader) intensity += 10
  intensity = Math.min(intensity, 100)
  intensity = Math.max(intensity, 0)

  let type: LightningMeasure['type'] = 'none'
  if (intensity >= 80 && hasHighImpact && hasGroundStrike) type = 'bolt'
  else if (intensity >= 65 && hasCloudToCloud) type = 'forked'
  else if (intensity >= 50 && hasProperChannel) type = 'sheet'
  else if (intensity >= 35) type = 'heat'
  else if (intensity >= 20) type = 'ball'

  return {
    hasCloudToCloud,
    hasGroundStrike,
    hasHighImpact,
    hasNoFlashover,
    hasNoMisfire,
    hasNoStrayVoltage,
    hasPositiveStrike,
    hasProperChannel,
    hasReturnStroke,
    hasSteppedLeader,
    intensity,
    misfireCount,
    strayVoltageCount,
    type,
  }
}

/** @example measureThunder(content) returns ThunderMeasure */
export function measureThunder(content: string): ThunderMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const enumCount = countEnums(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const ternaries = countTernaries(content)

  const echoChamberCount = deepNested
  const deadZoneCount = anyCount
  const hasNoEchoChamber = echoChamberCount === 0
  const hasNoDeadZone = deadZoneCount === 0
  const hasWideReach = exportCount > 2
  const hasLowFrequency = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasHighFrequency = exportCount > 0 && importCount > 0
  const hasClap = classCount > 0
  const hasRoll = exportCount > 0 && (countFunctions(content) > 0 || countArrows(content) > 0)
  const hasProperPropagation = importCount > 0 && exportCount > 0
  const hasNoInterference = consoleCount === 0
  const hasReverberation = enumCount > 0
  const hasNoDeadZone2 = hasNoDeadZone

  let resonance = 0
  if (hasWideReach) resonance += 15
  if (hasLowFrequency) resonance += 15
  if (hasHighFrequency) resonance += 10
  if (hasClap) resonance += 10
  if (hasRoll) resonance += 10
  if (hasNoEchoChamber) resonance += 10
  if (hasProperPropagation) resonance += 10
  if (hasNoInterference) resonance += 10
  if (hasNoDeadZone2) resonance += 10
  resonance = Math.min(resonance, 100)
  resonance = Math.max(resonance, 0)

  let volume: ThunderMeasure['volume'] = 'silent'
  if (resonance >= 80) volume = 'deafening'
  else if (resonance >= 65) volume = 'loud'
  else if (resonance >= 50) volume = 'moderate'
  else if (resonance >= 35) volume = 'distant'
  else if (resonance >= 20) volume = 'rumble'

  return {
    deadZoneCount,
    echoChamberCount,
    hasClap,
    hasHighFrequency,
    hasLowFrequency,
    hasNoDeadZone,
    hasNoEchoChamber,
    hasNoInterference,
    hasProperPropagation,
    hasReverberation,
    hasRoll,
    hasWideReach,
    resonance,
    volume,
  }
}

/** @example measureWind(content) returns WindMeasure */
export function measureWind(content: string): WindMeasure {
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const classCount = countClasses(content)
  const asyncCount = countAsync(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const deepNested = countDeepNested(content)
  const ternaries = countTernaries(content)
  const generics = countGenerics(content)

  const crosswindCount = ternaries
  const turbulenceCount = deepNested
  const hasNoCrosswind = crosswindCount === 0
  const hasNoTurbulence = turbulenceCount === 0
  const hasHighVelocity = functionCount > 0 && arrowCount > 0
  const hasProperDirection = exportCount > 0 && importCount > 0
  const hasGustFront = asyncCount > 0
  const hasDownburst = classCount > 0 && asyncCount > 0
  const hasUplift = classCount > 0
  const hasConvergence = generics > 0
  const hasDivergence = exportCount > 2

  let force = 0
  if (hasHighVelocity) force += 15
  if (hasProperDirection) force += 15
  if (hasGustFront) force += 10
  if (hasDownburst) force += 10
  if (hasNoCrosswind) force += 10
  if (hasNoTurbulence) force += 10
  if (hasUplift) force += 10
  if (hasConvergence) force += 10
  if (hasDivergence) force += 10
  force = Math.min(force, 100)
  force = Math.max(force, 0)

  let scale: WindMeasure['scale'] = 'calm'
  if (force >= 80 && hasDownburst) scale = 'hurricane'
  else if (force >= 65 && hasHighVelocity) scale = 'tornado'
  else if (force >= 50) scale = 'gale'
  else if (force >= 35) scale = 'strong'
  else if (force >= 20) scale = 'breeze'

  return {
    crosswindCount,
    force,
    hasConvergence,
    hasDivergence,
    hasDownburst,
    hasGustFront,
    hasHighVelocity,
    hasNoCrosswind,
    hasNoTurbulence,
    hasProperDirection,
    hasUplift,
    scale,
    turbulenceCount,
  }
}

/** @example measureRainfall(content) returns RainfallMeasure */
export function measureRainfall(content: string): RainfallMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const jsdoc = countJSDoc(content)
  const consoleCount = countConsole(content)
  const anyCount = countAny(content)
  const todos = countTodos(content)
  const tryCatch = countTryCatch(content)

  const floodingCount = consoleCount + todos
  const contaminationCount = anyCount
  const hasNoFlooding = floodingCount === 0
  const hasNoContamination = contaminationCount === 0
  const hasHighOutput = exportCount > 2
  const hasProperDrainage = tryCatch > 0
  const hasNoDrought = exportCount > 0
  const hasEvenDistribution = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasProperCollection = importCount > 0 && exportCount > 0
  const hasRunoff = tryCatch > 0
  const hasPercolation = jsdoc > 0
  const hasNoErosion = consoleCount === 0

  let volume = 0
  if (hasHighOutput) volume += 15
  if (hasProperDrainage) volume += 15
  if (hasNoFlooding) volume += 10
  if (hasNoDrought) volume += 10
  if (hasEvenDistribution) volume += 10
  if (hasProperCollection) volume += 10
  if (hasRunoff) volume += 10
  if (hasPercolation) volume += 10
  if (hasNoContamination) volume += 10
  volume = Math.min(volume, 100)
  volume = Math.max(volume, 0)

  let intensity: RainfallMeasure['intensity'] = 'dry'
  if (volume >= 80 && hasEvenDistribution) intensity = 'torrential'
  else if (volume >= 65) intensity = 'heavy'
  else if (volume >= 50) intensity = 'moderate'
  else if (volume >= 35) intensity = 'light'
  else if (volume >= 20) intensity = 'drizzle'

  return {
    contaminationCount,
    floodingCount,
    hasEvenDistribution,
    hasHighOutput,
    hasNoContamination,
    hasNoDrought,
    hasNoErosion,
    hasNoFlooding,
    hasPercolation,
    hasProperCollection,
    hasProperDrainage,
    hasRunoff,
    intensity,
    volume,
  }
}

/** @example measurePressure(content) returns PressureMeasure */
export function measurePressure(content: string): PressureMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)
  const staticCount = countStatic(content)
  const ternaries = countTernaries(content)

  const stagnationCount = consoleCount + anyCount
  const supercellCount = deepNested
  const hasNoStagnation = stagnationCount === 0
  const hasNoSupercell = supercellCount === 0
  const hasProperComplexity = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasNoBarometricExtremes = deepNested === 0
  const hasIsobarClarity = interfaceCount > 0 && typeCount > 0
  const hasFrontalSystem = functionCount > 0 && arrowCount > 0
  const hasProperCirculation = countExports(content) > 0 && countImportKeywords(content) > 0
  const hasConvectionCell = generics > 0
  const hasNoInversion = (content.match(TERNARY_REGEX) ?? []).length === 0
  const hasAdiabatic = readonlyCount > 0 || staticCount > 0

  let level = 0
  if (hasProperComplexity) level += 15
  if (hasNoBarometricExtremes) level += 15
  if (hasIsobarClarity) level += 10
  if (hasFrontalSystem) level += 10
  if (hasNoStagnation) level += 10
  if (hasProperCirculation) level += 10
  if (hasConvectionCell) level += 10
  if (hasNoInversion) level += 10
  if (hasAdiabatic) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let system: PressureMeasure['system'] = 'cyclone'
  if (level >= 80 && hasProperComplexity) system = 'high-pressure'
  else if (level >= 65 && hasIsobarClarity) system = 'ridge'
  else if (level >= 50) system = 'col'
  else if (level >= 35) system = 'trough'
  else if (level >= 20) system = 'low-pressure'

  return {
    hasAdiabatic,
    hasConvectionCell,
    hasFrontalSystem,
    hasIsobarClarity,
    hasNoBarometricExtremes,
    hasNoInversion,
    hasNoStagnation,
    hasNoSupercell,
    hasProperCirculation,
    hasProperComplexity,
    level,
    stagnationCount,
    supercellCount,
    system,
  }
}

/** @example measureStorm(content) returns StormMeasure */
export function measureStorm(content: string): StormMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const enumCount = countEnums(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const deepNested = countDeepNested(content)

  const dissipationCount = anyCount + consoleCount + commentedCode
  const funnelCount = deepNested
  const hasNoDissipation = dissipationCount === 0
  const hasNoFunnelCloud = funnelCount === 0
  const hasOrganizedStructure = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasRotation = functionCount > 0 && arrowCount > 0
  const hasHookEcho = exportCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasMesocyclone = classCount > 0 && asyncCount > 0
  const hasNoAnvilSpreading = deepNested === 0
  const hasProperLifeCycle = tryCatch > 0
  const hasCumulonimbus = classCount > 0 && enumCount > 0
  const isPowerful = hasOrganizedStructure && hasRotation && hasNoDissipation

  let category = 0
  if (hasOrganizedStructure) category += 15
  if (hasRotation) category += 15
  if (hasHookEcho) category += 10
  if (hasMesocyclone) category += 10
  if (hasNoAnvilSpreading) category += 10
  if (hasProperLifeCycle) category += 10
  if (hasNoDissipation) category += 10
  if (hasCumulonimbus) category += 10
  if (hasNoFunnelCloud) category += 10
  category = Math.min(category, 100)
  category = Math.max(category, 0)

  let classification: StormMeasure['classification'] = 'clear-sky'
  if (isPowerful && hasMesocyclone && hasCumulonimbus) classification = 'supercell'
  else if (hasOrganizedStructure && hasRotation) classification = 'squall-line'
  else if (hasRotation && hasHookEcho) classification = 'multicell'
  else if (hasOrganizedStructure) classification = 'single-cell'
  else if (exportCount > 0) classification = 'air-mass'

  return {
    category,
    classification,
    dissipationCount,
    funnelCount,
    hasCumulonimbus,
    hasHookEcho,
    hasMesocyclone,
    hasNoAnvilSpreading,
    hasNoDissipation,
    hasNoFunnelCloud,
    hasOrganizedStructure,
    hasProperLifeCycle,
    hasRotation,
    isPowerful,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): StormCell['condition'] {
  if (score >= 80) return 'category-5'
  if (score >= 65) return 'category-4'
  if (score >= 50) return 'category-3'
  if (score >= 35) return 'category-2'
  if (score >= 20) return 'tropical-storm'
  return 'clear-day'
}

/** @example classifyClusterType(cells) returns cluster type */
export function classifyClusterType(cells: StormCell[]): StormCluster['clusterType'] {
  if (cells.length === 0) return 'drought'
  const avgQuality = cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length
  const cat5Count = cells.filter((c) => c.condition === 'category-5').length
  if (avgQuality >= 75 && cat5Count >= Math.ceil(cells.length * 0.3)) return 'hurricane'
  if (avgQuality >= 60) return 'typhoon'
  if (avgQuality >= 45) return 'cyclone'
  if (avgQuality >= 30) return 'squall'
  if (avgQuality >= 15) return 'shower'
  return 'drought'
}

/** @example classifyClusterCondition(avgQuality) returns condition */
export function classifyClusterCondition(avgQuality: number): StormCluster['condition'] {
  if (avgQuality >= 80) return 'apocalyptic'
  if (avgQuality >= 65) return 'severe'
  if (avgQuality >= 50) return 'moderate'
  if (avgQuality >= 35) return 'mild'
  if (avgQuality >= 20) return 'fair'
  return 'sunny'
}

/** @example classifyMeteorologistGrade(avgPower) returns grade */
export function classifyMeteorologistGrade(avgPower: number): ThunderStormResult['stats']['meteorologistGrade'] {
  if (avgPower >= 80) return 'chief-meteorologist'
  if (avgPower >= 65) return 'senior-forecaster'
  if (avgPower >= 50) return 'meteorologist'
  if (avgPower >= 35) return 'weather-observer'
  if (avgPower >= 20) return 'storm-chaser'
  return 'umbrella-carrier'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeStormCell(content, filePath) returns StormCell */
export function analyzeStormCell(content: string, filePath: string): StormCell {
  const lightning = measureLightning(content)
  const thunder = measureThunder(content)
  const wind = measureWind(content)
  const rainfall = measureRainfall(content)
  const pressure = measurePressure(content)
  const storm = measureStorm(content)

  const qualityScore = Math.round(
    lightning.intensity * 0.2 + thunder.resonance * 0.2 + wind.force * 0.15 +
    rainfall.volume * 0.15 + pressure.level * 0.15 + storm.category * 0.15,
  )

  return {
    atmosphericPressure: pressure.level,
    condition: classifyCondition(qualityScore),
    file: filePath,
    lightning,
    lightningIntensity: lightning.intensity,
    pressure,
    qualityScore,
    rainfall,
    rainfallVolume: rainfall.volume,
    storm,
    stormCategory: storm.category,
    thunder,
    thunderResonance: thunder.resonance,
    wind,
    windForce: wind.force,
  }
}

/** @example analyzeStormCluster(cells, dirPath) returns StormCluster */
export function analyzeStormCluster(cells: StormCell[], dirPath: string): StormCluster {
  const avgIntensity = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.lightningIntensity, 0) / cells.length) : 0
  const avgReach = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.thunderResonance, 0) / cells.length) : 0
  const avgPower = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length) : 0
  const cat5Count = cells.filter((c) => c.condition === 'category-5').length
  const clearDayCount = cells.filter((c) => c.condition === 'clear-day').length
  const highImpactCount = cells.filter((c) => c.lightning.hasHighImpact).length
  const powerfulCount = cells.filter((c) => c.storm.isPowerful).length
  const clusterType = classifyClusterType(cells)
  const condition = classifyClusterCondition(avgPower)

  return {
    avgIntensity,
    avgPower,
    avgReach,
    cat5Count,
    cells,
    clearDayCount,
    clusterType,
    condition,
    directory: dirPath,
    highImpactCount,
    powerfulCount,
  }
}

/** @example generateRecommendations(cells, clusters, atmosphere, stats) returns string[] */
export function generateRecommendations(
  cells: StormCell[],
  _clusters: StormCluster[],
  atmosphere: ThunderStormResult['atmosphere'],
  _stats: ThunderStormResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (atmosphere.overallPower < 50) {
    recommendations.push('Storm power is low — add more exports, types, and error handling to increase energy')
  }

  const dissipatingCells = cells.filter((c) => !c.storm.hasNoDissipation)
  if (dissipatingCells.length > 0) {
    recommendations.push(`${dissipatingCells.length} cell/cells are dissipating — remove any types, console logs, and commented-out code`)
  }

  const clearDayCells = cells.filter((c) => c.condition === 'clear-day')
  if (clearDayCells.length > 0) {
    recommendations.push(`${clearDayCells.length} cell/cells are clear-day (no storm activity) — consider adding meaningful code structure`)
  }

  const turbulentCells = cells.filter((c) => !c.wind.hasNoTurbulence)
  if (turbulentCells.length > 0) {
    recommendations.push(`${turbulentCells.length} cell/cells have deep nesting turbulence — flatten nested structures`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Thunderstorm is electrifying with high energy output — maintain current atmospheric conditions')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildThunderStormResult(files, contents, options) returns ThunderStormResult */
export function buildThunderStormResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): ThunderStormResult {
  const cells: StormCell[] = files.map((file, i) =>
    analyzeStormCell(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StormCell[]>()
  for (const cell of cells) {
    const dir = cell.file.includes('/') ? cell.file.substring(0, cell.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(cell)
    } else {
      dirMap.set(dir, [cell])
    }
  }

  const clusters: StormCluster[] = Array.from(dirMap.entries()).map(([dir, dirCells]) =>
    analyzeStormCluster(dirCells, dir),
  )

  const avgLightningIntensity = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.lightningIntensity, 0) / cells.length) : 0
  const avgThunderResonance = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.thunderResonance, 0) / cells.length) : 0
  const avgWindForce = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.windForce, 0) / cells.length) : 0
  const avgRainfallVolume = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.rainfallVolume, 0) / cells.length) : 0
  const avgAtmosphericPressure = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.atmosphericPressure, 0) / cells.length) : 0
  const avgStormCategory = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.stormCategory, 0) / cells.length) : 0
  const overallPower = cells.length > 0 ? Math.round(cells.reduce((s, c) => s + c.qualityScore, 0) / cells.length) : 0

  const atmosphere = {
    avgIntensity: avgLightningIntensity,
    avgPower: avgStormCategory,
    avgReach: avgThunderResonance,
    isElectrifying: overallPower >= 65,
    overallPower,
  }

  const category5Count = cells.filter((c) => c.condition === 'category-5').length
  const category4Count = cells.filter((c) => c.condition === 'category-4').length
  const category3Count = cells.filter((c) => c.condition === 'category-3').length
  const category2Count = cells.filter((c) => c.condition === 'category-2').length
  const tropicalStormCount = cells.filter((c) => c.condition === 'tropical-storm').length
  const clearDayCount = cells.filter((c) => c.condition === 'clear-day').length
  const hasHighImpactCount = cells.filter((c) => c.lightning.hasHighImpact).length
  const hasWideReachCount = cells.filter((c) => c.thunder.hasWideReach).length
  const hasHighVelocityCount = cells.filter((c) => c.wind.hasHighVelocity).length
  const hasHighOutputCount = cells.filter((c) => c.rainfall.hasHighOutput).length
  const hasProperComplexityCount = cells.filter((c) => c.pressure.hasProperComplexity).length
  const isPowerfulCount = cells.filter((c) => c.storm.isPowerful).length

  const meteorologistGrade = classifyMeteorologistGrade(overallPower)

  const bestCell = cells.length > 0
    ? cells.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const mostIntense = cells.length > 0
    ? cells.reduce((best, c) => c.lightningIntensity > best.lightningIntensity ? c : best).file : ''
  const widestReach = cells.length > 0
    ? cells.reduce((best, c) => c.thunderResonance > best.thunderResonance ? c : best).file : ''
  const fastest = cells.length > 0
    ? cells.reduce((best, c) => c.windForce > best.windForce ? c : best).file : ''
  const highestOutput = cells.length > 0
    ? cells.reduce((best, c) => c.rainfallVolume > best.rainfallVolume ? c : best).file : ''
  const mostPowerful = cells.length > 0
    ? cells.reduce((best, c) => c.stormCategory > best.stormCategory ? c : best).file : ''

  const stats = {
    avgAtmosphericPressure,
    avgLightningIntensity,
    avgRainfallVolume,
    avgStormCategory,
    avgThunderResonance,
    avgWindForce,
    bestCell,
    category2Count,
    category3Count,
    category4Count,
    category5Count,
    clearDayCount,
    fastest,
    hasHighImpactCount,
    hasHighOutputCount,
    hasHighVelocityCount,
    hasProperComplexityCount,
    hasWideReachCount,
    highestOutput,
    isPowerfulCount,
    meteorologistGrade,
    mostIntense,
    mostPowerful,
    overallPower,
    totalClusters: clusters.length,
    totalFiles: files.length,
    tropicalStormCount,
    widestReach,
  }

  const recommendations = generateRecommendations(cells, clusters, atmosphere, stats)

  return { atmosphere, cells, clusters, recommendations, stats }
}
