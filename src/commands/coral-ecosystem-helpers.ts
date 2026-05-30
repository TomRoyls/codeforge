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

export interface PolypMeasure {
  density: number
  species: 'brain-coral' | 'staghorn' | 'elkhorn' | 'table' | 'pillar' | 'dead-coral'
  isHealthy: boolean
  hasZooxanthellae: boolean
  hasProperCalcification: boolean
  hasNoBleaching: boolean
  hasSpawningCycle: boolean
  hasFeedingPolyps: boolean
  hasReefBuilding: boolean
  hasNoOvergrowth: boolean
  hasProperZonation: boolean
  hasNoCrownOfThorns: boolean
  bleachingCount: number
  crownOfThornsCount: number
}

export interface ComplexityMeasure {
  level: number
  formation: 'atoll' | 'barrier' | 'fringing' | 'patch' | 'ribbon' | 'none'
  hasComplexStructure: boolean
  hasBranchingPattern: boolean
  hasMassiveStructure: boolean
  hasPlateauFormation: boolean
  hasEncrustingGrowth: boolean
  hasNoAlgalOvergrowth: boolean
  hasProperFringing: boolean
  hasNoErosion: boolean
  hasSpurAndGroove: boolean
  hasNoStructuralCollapse: boolean
  erosionCount: number
  collapseCount: number
}

export interface SymbioticMeasure {
  index: number
  relationship: 'mutualism' | 'commensalism' | 'parasitism' | 'competition' | 'neutralism' | 'amensalism'
  hasMutualism: boolean
  hasCleanerWrasse: boolean
  hasClownfish: boolean
  hasAnemone: boolean
  hasSeaUrchin: boolean
  hasNoParasite: boolean
  hasNoInvasiveSpecies: boolean
  hasProperNichePartition: boolean
  hasTrophicLevel: boolean
  hasNoOvergrazing: boolean
  parasiteCount: number
  invasiveCount: number
}

export interface ClarityMeasure {
  level: number
  condition: 'crystal' | 'clear' | 'turbid' | 'murky' | 'cloudy' | 'opaque'
  isClear: boolean
  hasGoodVisibility: boolean
  hasNoSediment: boolean
  hasProperCurrent: boolean
  hasNoAlgalBloom: boolean
  hasUVPenetration: boolean
  hasNoThermalPlume: boolean
  hasNoChemicalRunoff: boolean
  hasProperFiltration: boolean
  hasNoTurbidity: boolean
  sedimentCount: number
  turbidityCount: number
}

export interface CalciumMeasure {
  deposit: number
  hardness: 'aragonite' | 'calcite' | 'dolomite' | 'chalk' | 'marl' | 'sand'
  hasQualityDeposit: boolean
  hasSolidFoundation: boolean
  hasProperLayering: boolean
  hasNoSoftDeposit: boolean
  hasNoDissolution: boolean
  hasFossilRecord: boolean
  hasNoErosionRate: boolean
  hasProperPhBalance: boolean
  hasNoAcidification: boolean
  hasReefFramework: boolean
  dissolutionCount: number
  acidificationCount: number
}

export interface VitalityMeasure {
  score: number
  status: 'thriving' | 'healthy' | 'recovering' | 'stressed' | 'bleached' | 'dead'
  isVital: boolean
  hasBiodiversity: boolean
  hasResilience: boolean
  hasRecoveryCapacity: boolean
  hasNoBleaching: boolean
  hasNoDisease: boolean
  hasConnectivity: boolean
  hasRecruitment: boolean
  hasNoOceanAcidification: boolean
  hasNoOverfishing: boolean
  diseaseCount: number
  bleachingVitalityCount: number
}

export interface CoralColony {
  file: string
  polypDensity: number
  reefComplexity: number
  symbioticIndex: number
  waterClarity: number
  calciumDeposit: number
  reefVitality: number
  polyp: PolypMeasure
  complexity: ComplexityMeasure
  symbiotic: SymbioticMeasure
  clarity: ClarityMeasure
  calcium: CalciumMeasure
  vitality: VitalityMeasure
  condition: 'great-barrier' | 'coral-triangle' | 'caribbean' | 'red-sea' | 'bleached-zone' | 'dead-zone'
  qualityScore: number
}

export interface ReefSystem {
  directory: string
  colonies: CoralColony[]
  avgDensity: number
  avgComplexity: number
  avgVitality: number
  greatBarrierCount: number
  deadZoneCount: number
  healthyCount: number
  mutualismCount: number
  systemType: 'atoll-chain' | 'barrier-system' | 'fringing-complex' | 'patch-mosaic' | 'seamount' | 'abyssal-plain'
  condition: 'unesco-heritage' | 'marine-reserve' | 'reef-sanctuary' | 'fishing-zone' | 'dead-zone' | 'wasteland'
}

export interface CoralReefResult {
  colonies: CoralColony[]
  systems: ReefSystem[]
  ocean: {
    avgDensity: number
    avgComplexity: number
    avgVitality: number
    isThriving: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalSystems: number
    avgPolypDensity: number
    avgReefComplexity: number
    avgSymbioticIndex: number
    avgWaterClarity: number
    avgCalciumDeposit: number
    avgReefVitality: number
    greatBarrierCount: number
    coralTriangleCount: number
    caribbeanCount: number
    redSeaCount: number
    bleachedZoneCount: number
    deadZoneCount: number
    isHealthyCount: number
    hasComplexStructureCount: number
    hasMutualismCount: number
    isClearCount: number
    hasQualityDepositCount: number
    isVitalCount: number
    overallHealth: number
    marineBiologistGrade: 'chief-scientist' | 'marine-biologist' | 'oceanographer' | 'diver' | 'snorkeler' | 'beachgoer'
    bestColony: string
    densest: string
    mostComplex: string
    mostSymbiotic: string
    clearest: string
    mostVital: string
  }
  recommendations: string[]
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

/** @example countExports('export const x = 1') returns 1 */
export function countExports(content: string): number {
  return (content.match(EXPORT_REGEX) ?? []).length
}

/** @example countImports('import { x }') returns 1 */
export function countImports(content: string): number {
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

/** @example measurePolyp(content) returns PolypMeasure */
export function measurePolyp(content: string): PolypMeasure {
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const deepNested = countDeepNested(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const enums = countEnums(content)
  const accessMods = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)

  const bleachingCount = consoleCount + todos
  const crownOfThornsCount = anyCount + commentedCode
  const hasNoBleaching = bleachingCount === 0
  const hasNoCrownOfThorns = crownOfThornsCount === 0
  const hasZooxanthellae = exports > 0 && imports > 0
  const hasProperCalcification = classes > 0 && (interfaces > 0 || enums > 0)
  const hasSpawningCycle = exports > 0
  const hasFeedingPolyps = countAsync(content) > 0
  const hasReefBuilding = exports > 2
  const hasNoOvergrowth = deepNested === 0
  const hasProperZonation = readonlyCount > 0 || accessMods > 0
  const isHealthy = hasZooxanthellae && hasNoBleaching && hasNoOvergrowth

  let density = 0
  if (hasNoBleaching) density += 15
  if (hasNoCrownOfThorns) density += 15
  if (hasZooxanthellae) density += 10
  if (hasProperCalcification) density += 10
  if (hasSpawningCycle) density += 10
  if (hasFeedingPolyps) density += 10
  if (hasReefBuilding) density += 10
  if (hasNoOvergrowth) density += 10
  if (hasProperZonation) density += 10
  density = Math.min(density, 100)
  density = Math.max(density, 0)

  let species: PolypMeasure['species'] = 'dead-coral'
  if (density >= 80 && hasProperCalcification) species = 'brain-coral'
  else if (density >= 65) species = 'staghorn'
  else if (density >= 50) species = 'elkhorn'
  else if (density >= 35) species = 'table'
  else if (density >= 20) species = 'pillar'

  return {
    bleachingCount,
    crownOfThornsCount,
    density,
    hasFeedingPolyps,
    hasNoBleaching,
    hasNoCrownOfThorns,
    hasNoOvergrowth,
    hasProperCalcification,
    hasProperZonation,
    hasReefBuilding,
    hasSpawningCycle,
    hasZooxanthellae,
    isHealthy,
    species,
  }
}

/** @example measureComplexity(content) returns ComplexityMeasure */
export function measureComplexity(content: string): ComplexityMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const functions = countFunctions(content)
  const arrows = countArrows(content)
  const enums = countEnums(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)

  const erosionCount = deepNested
  const collapseCount = anyCount + consoleCount
  const hasNoErosion = erosionCount === 0
  const hasNoStructuralCollapse = collapseCount === 0
  const hasComplexStructure = classes > 0 && (interfaces > 0 || types > 0)
  const hasBranchingPattern = functions > 0 && arrows > 0
  const hasMassiveStructure = classes > 0
  const hasPlateauFormation = interfaces > 0 && types > 0
  const hasEncrustingGrowth = enums > 0
  const hasNoAlgalOvergrowth = deepNested === 0
  const hasProperFringing = exports > 0 && imports > 0
  const hasSpurAndGroove = functions > 0 && exports > 0

  let level = 0
  if (hasComplexStructure) level += 15
  if (hasBranchingPattern) level += 15
  if (hasMassiveStructure) level += 10
  if (hasPlateauFormation) level += 10
  if (hasEncrustingGrowth) level += 10
  if (hasNoAlgalOvergrowth) level += 10
  if (hasProperFringing) level += 10
  if (hasNoErosion) level += 10
  if (hasSpurAndGroove) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let formation: ComplexityMeasure['formation'] = 'none'
  if (hasComplexStructure && hasPlateauFormation) formation = 'atoll'
  else if (hasComplexStructure && hasBranchingPattern) formation = 'barrier'
  else if (hasBranchingPattern) formation = 'fringing'
  else if (hasPlateauFormation) formation = 'patch'
  else if (hasProperFringing) formation = 'ribbon'

  return {
    collapseCount,
    erosionCount,
    formation,
    hasBranchingPattern,
    hasComplexStructure,
    hasEncrustingGrowth,
    hasMassiveStructure,
    hasNoAlgalOvergrowth,
    hasNoErosion,
    hasNoStructuralCollapse,
    hasPlateauFormation,
    hasProperFringing,
    hasSpurAndGroove,
    level,
  }
}

/** @example measureSymbiotic(content) returns SymbioticMeasure */
export function measureSymbiotic(content: string): SymbioticMeasure {
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const generics = countGenerics(content)
  const accessMods = countAccessModifiers(content)
  const reexports = countReexports(content)

  const parasiteCount = anyCount + consoleCount
  const invasiveCount = commentedCode
  const hasNoParasite = parasiteCount === 0
  const hasNoInvasiveSpecies = invasiveCount === 0
  const hasMutualism = exports > 0 && imports > 0
  const hasCleanerWrasse = reexports > 0
  const hasClownfish = generics > 0
  const hasAnemone = classes > 0 && (interfaces > 0 || types > 0)
  const hasSeaUrchin = accessMods > 0
  const hasProperNichePartition = interfaces > 0 && types > 0
  const hasTrophicLevel = generics > 0 && accessMods > 0
  const hasNoOvergrazing = consoleCount === 0

  let index = 0
  if (hasMutualism) index += 15
  if (hasCleanerWrasse) index += 10
  if (hasClownfish) index += 10
  if (hasAnemone) index += 15
  if (hasSeaUrchin) index += 10
  if (hasNoParasite) index += 15
  if (hasNoInvasiveSpecies) index += 10
  if (hasProperNichePartition) index += 5
  if (hasNoOvergrazing) index += 10
  index = Math.min(index, 100)
  index = Math.max(index, 0)

  let relationship: SymbioticMeasure['relationship'] = 'amensalism'
  if (hasMutualism && hasAnemone && hasNoParasite) relationship = 'mutualism'
  else if (hasMutualism && hasNoParasite) relationship = 'commensalism'
  else if (hasMutualism) relationship = 'commensalism'
  else if (!hasNoParasite) relationship = 'parasitism'
  else if (exports > 0 && !hasMutualism) relationship = 'competition'
  else if (exports === 0 && imports === 0) relationship = 'neutralism'

  return {
    hasAnemone,
    hasCleanerWrasse,
    hasClownfish,
    hasMutualism,
    hasNoInvasiveSpecies,
    hasNoOvergrazing,
    hasNoParasite,
    hasProperNichePartition,
    hasSeaUrchin,
    hasTrophicLevel,
    index,
    invasiveCount,
    parasiteCount,
    relationship,
  }
}

/** @example measureClarity(content) returns ClarityMeasure */
export function measureClarity(content: string): ClarityMeasure {
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)
  const jsdoc = countJSDoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const deepNested = countDeepNested(content)
  const ternaries = countTernaries(content)

  const sedimentCount = consoleCount + todos + commentedCode
  const turbidityCount = anyCount + ternaries
  const hasNoSediment = sedimentCount === 0
  const hasNoTurbidity = turbidityCount === 0
  const hasGoodVisibility = jsdoc > 0
  const hasProperCurrent = exports > 0 && imports > 0
  const hasNoAlgalBloom = consoleCount === 0
  const hasUVPenetration = jsdoc > 0 && hasNoSediment
  const hasNoThermalPlume = deepNested === 0
  const hasNoChemicalRunoff = anyCount === 0
  const hasProperFiltration = countTryCatch(content) > 0
  const isClear = hasNoSediment && hasNoTurbidity && hasGoodVisibility

  let level = 0
  if (hasNoSediment) level += 15
  if (hasNoTurbidity) level += 15
  if (hasGoodVisibility) level += 10
  if (hasProperCurrent) level += 10
  if (hasNoAlgalBloom) level += 10
  if (hasUVPenetration) level += 10
  if (hasNoThermalPlume) level += 10
  if (hasNoChemicalRunoff) level += 10
  if (hasProperFiltration) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let condition: ClarityMeasure['condition'] = 'opaque'
  if (level >= 80) condition = 'crystal'
  else if (level >= 65) condition = 'clear'
  else if (level >= 50) condition = 'turbid'
  else if (level >= 35) condition = 'murky'
  else if (level >= 20) condition = 'cloudy'

  return {
    condition,
    hasGoodVisibility,
    hasNoAlgalBloom,
    hasNoChemicalRunoff,
    hasNoSediment,
    hasNoThermalPlume,
    hasNoTurbidity,
    hasProperCurrent,
    hasProperFiltration,
    hasUVPenetration,
    isClear,
    level,
    sedimentCount,
    turbidityCount,
  }
}

/** @example measureCalcium(content) returns CalciumMeasure */
export function measureCalcium(content: string): CalciumMeasure {
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)
  const jsdoc = countJSDoc(content)
  const generics = countGenerics(content)
  const staticCount = countStatic(content)
  const readonlyCount = countReadonly(content)

  const dissolutionCount = commentedCode
  const acidificationCount = anyCount
  const hasNoDissolution = dissolutionCount === 0
  const hasNoAcidification = acidificationCount === 0
  const hasSolidFoundation = classes > 0 && (interfaces > 0 || types > 0)
  const hasProperLayering = interfaces > 0 && types > 0
  const hasNoSoftDeposit = anyCount === 0
  const hasFossilRecord = jsdoc > 0
  const hasNoErosionRate = commentedCode === 0
  const hasProperPhBalance = generics > 0
  const hasReefFramework = readonlyCount > 0 || staticCount > 0
  const hasQualityDeposit = hasSolidFoundation && hasNoDissolution && hasNoAcidification

  let deposit = 0
  if (hasSolidFoundation) deposit += 15
  if (hasProperLayering) deposit += 15
  if (hasNoSoftDeposit) deposit += 10
  if (hasNoDissolution) deposit += 10
  if (hasFossilRecord) deposit += 10
  if (hasNoErosionRate) deposit += 10
  if (hasProperPhBalance) deposit += 10
  if (hasNoAcidification) deposit += 10
  if (hasReefFramework) deposit += 10
  deposit = Math.min(deposit, 100)
  deposit = Math.max(deposit, 0)

  let hardness: CalciumMeasure['hardness'] = 'sand'
  if (deposit >= 80 && hasSolidFoundation) hardness = 'aragonite'
  else if (deposit >= 65 && hasProperLayering) hardness = 'calcite'
  else if (deposit >= 50) hardness = 'dolomite'
  else if (deposit >= 35) hardness = 'chalk'
  else if (deposit >= 20) hardness = 'marl'

  return {
    acidificationCount,
    deposit,
    dissolutionCount,
    hasFossilRecord,
    hasNoAcidification,
    hasNoDissolution,
    hasNoErosionRate,
    hasNoSoftDeposit,
    hasProperLayering,
    hasProperPhBalance,
    hasQualityDeposit,
    hasReefFramework,
    hasSolidFoundation,
    hardness,
  }
}

/** @example measureVitality(content) returns VitalityMeasure */
export function measureVitality(content: string): VitalityMeasure {
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const todos = countTodos(content)
  const commentedCode = countCommentedCode(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAliases(content)
  const functions = countFunctions(content)
  const arrows = countArrows(content)
  const asyncCount = countAsync(content)
  const tryCatch = countTryCatch(content)

  const diseaseCount = consoleCount + anyCount
  const bleachingVitalityCount = todos + commentedCode
  const hasNoBleaching = bleachingVitalityCount === 0
  const hasNoDisease = diseaseCount === 0
  const hasBiodiversity = classes > 0 && (interfaces > 0 || types > 0)
  const hasResilience = tryCatch > 0
  const hasRecoveryCapacity = asyncCount > 0
  const hasConnectivity = exports > 0 && imports > 0
  const hasRecruitment = functions > 0 && (arrows > 0 || classes > 0)
  const hasNoOceanAcidification = anyCount === 0
  const hasNoOverfishing = consoleCount === 0
  const isVital = hasBiodiversity && hasNoDisease && hasNoBleaching && hasConnectivity

  let score = 0
  if (hasBiodiversity) score += 15
  if (hasResilience) score += 10
  if (hasRecoveryCapacity) score += 10
  if (hasNoBleaching) score += 15
  if (hasNoDisease) score += 10
  if (hasConnectivity) score += 15
  if (hasRecruitment) score += 10
  if (hasNoOceanAcidification) score += 10
  if (hasNoOverfishing) score += 5
  score = Math.min(score, 100)
  score = Math.max(score, 0)

  let status: VitalityMeasure['status'] = 'dead'
  if (isVital && score >= 80) status = 'thriving'
  else if (score >= 65) status = 'healthy'
  else if (score >= 50) status = 'recovering'
  else if (score >= 35) status = 'stressed'
  else if (score >= 20) status = 'bleached'

  return {
    bleachingVitalityCount,
    diseaseCount,
    hasBiodiversity,
    hasConnectivity,
    hasNoBleaching,
    hasNoDisease,
    hasNoOceanAcidification,
    hasNoOverfishing,
    hasRecoveryCapacity,
    hasRecruitment,
    hasResilience,
    isVital,
    score,
    status,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): CoralColony['condition'] {
  if (score >= 80) return 'great-barrier'
  if (score >= 65) return 'coral-triangle'
  if (score >= 50) return 'caribbean'
  if (score >= 35) return 'red-sea'
  if (score >= 20) return 'bleached-zone'
  return 'dead-zone'
}

/** @example classifySystemType(colonies) returns system type */
export function classifySystemType(colonies: CoralColony[]): ReefSystem['systemType'] {
  if (colonies.length === 0) return 'abyssal-plain'
  const avgQuality = colonies.reduce((s, c) => s + c.qualityScore, 0) / colonies.length
  const greatCount = colonies.filter((c) => c.condition === 'great-barrier').length
  if (avgQuality >= 75 && greatCount >= Math.ceil(colonies.length * 0.3)) return 'atoll-chain'
  if (avgQuality >= 60) return 'barrier-system'
  if (avgQuality >= 45) return 'fringing-complex'
  if (avgQuality >= 30) return 'patch-mosaic'
  if (avgQuality >= 15) return 'seamount'
  return 'abyssal-plain'
}

/** @example classifySystemCondition(avgQuality) returns condition */
export function classifySystemCondition(avgQuality: number): ReefSystem['condition'] {
  if (avgQuality >= 80) return 'unesco-heritage'
  if (avgQuality >= 65) return 'marine-reserve'
  if (avgQuality >= 50) return 'reef-sanctuary'
  if (avgQuality >= 35) return 'fishing-zone'
  if (avgQuality >= 20) return 'dead-zone'
  return 'wasteland'
}

/** @example classifyMarineBiologistGrade(avgHealth) returns grade */
export function classifyMarineBiologistGrade(avgHealth: number): CoralReefResult['stats']['marineBiologistGrade'] {
  if (avgHealth >= 80) return 'chief-scientist'
  if (avgHealth >= 65) return 'marine-biologist'
  if (avgHealth >= 50) return 'oceanographer'
  if (avgHealth >= 35) return 'diver'
  if (avgHealth >= 20) return 'snorkeler'
  return 'beachgoer'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeCoralColony(content, filePath) returns CoralColony */
export function analyzeCoralColony(content: string, filePath: string): CoralColony {
  const polyp = measurePolyp(content)
  const complexity = measureComplexity(content)
  const symbiotic = measureSymbiotic(content)
  const clarity = measureClarity(content)
  const calcium = measureCalcium(content)
  const vitality = measureVitality(content)

  const qualityScore = Math.round(
    polyp.density * 0.2 + complexity.level * 0.2 + symbiotic.index * 0.15 +
    clarity.level * 0.15 + calcium.deposit * 0.15 + vitality.score * 0.15,
  )

  return {
    calcium,
    calciumDeposit: calcium.deposit,
    clarity,
    complexity,
    condition: classifyCondition(qualityScore),
    file: filePath,
    polyp,
    polypDensity: polyp.density,
    qualityScore,
    reefComplexity: complexity.level,
    reefVitality: vitality.score,
    symbiotic,
    symbioticIndex: symbiotic.index,
    vitality,
    waterClarity: clarity.level,
  }
}

/** @example analyzeReefSystem(colonies, dirPath) returns ReefSystem */
export function analyzeReefSystem(colonies: CoralColony[], dirPath: string): ReefSystem {
  const avgDensity = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.polypDensity, 0) / colonies.length) : 0
  const avgComplexity = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.reefComplexity, 0) / colonies.length) : 0
  const avgVitality = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.reefVitality, 0) / colonies.length) : 0
  const greatBarrierCount = colonies.filter((c) => c.condition === 'great-barrier').length
  const deadZoneCount = colonies.filter((c) => c.condition === 'dead-zone').length
  const healthyCount = colonies.filter((c) => c.polyp.isHealthy).length
  const mutualismCount = colonies.filter((c) => c.symbiotic.hasMutualism).length
  const systemType = classifySystemType(colonies)
  const avgQuality = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.qualityScore, 0) / colonies.length) : 0
  const condition = classifySystemCondition(avgQuality)

  return {
    avgComplexity,
    avgDensity,
    avgVitality,
    colonies,
    condition,
    deadZoneCount,
    directory: dirPath,
    greatBarrierCount,
    healthyCount,
    mutualismCount,
    systemType,
  }
}

/** @example generateRecommendations(colonies, systems, ocean, stats) returns string[] */
export function generateRecommendations(
  colonies: CoralColony[],
  _systems: ReefSystem[],
  ocean: CoralReefResult['ocean'],
  _stats: CoralReefResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (ocean.overallHealth < 50) {
    recommendations.push('Reef health is critical — increase biodiversity with types, interfaces, and error handling')
  }

  const stressedColonies = colonies.filter((c) => !c.vitality.isVital)
  if (stressedColonies.length > 0) {
    recommendations.push(`${stressedColonies.length} colony/colonies are stressed — reduce any usage, console logs, and technical debt`)
  }

  const deadColonies = colonies.filter((c) => c.condition === 'dead-zone')
  if (deadColonies.length > 0) {
    recommendations.push(`${deadColonies.length} colony/colonies are dead zones — consider complete refactoring`)
  }

  const parasiticColonies = colonies.filter((c) => c.symbiotic.relationship === 'parasitism')
  if (parasiticColonies.length > 0) {
    recommendations.push(`${parasiticColonies.length} colony/colonies have parasitic patterns — remove any types and console statements`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Coral reef is thriving with high biodiversity — maintain current ecosystem balance')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildCoralReefResult(files, contents, options) returns CoralReefResult */
export function buildCoralReefResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): CoralReefResult {
  const colonies: CoralColony[] = files.map((file, i) =>
    analyzeCoralColony(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CoralColony[]>()
  for (const colony of colonies) {
    const dir = colony.file.includes('/') ? colony.file.substring(0, colony.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(colony)
    } else {
      dirMap.set(dir, [colony])
    }
  }

  const systems: ReefSystem[] = Array.from(dirMap.entries()).map(([dir, dirColonies]) =>
    analyzeReefSystem(dirColonies, dir),
  )

  const avgPolypDensity = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.polypDensity, 0) / colonies.length) : 0
  const avgReefComplexity = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.reefComplexity, 0) / colonies.length) : 0
  const avgSymbioticIndex = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.symbioticIndex, 0) / colonies.length) : 0
  const avgWaterClarity = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.waterClarity, 0) / colonies.length) : 0
  const avgCalciumDeposit = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.calciumDeposit, 0) / colonies.length) : 0
  const avgReefVitality = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.reefVitality, 0) / colonies.length) : 0
  const overallHealth = colonies.length > 0 ? Math.round(colonies.reduce((s, c) => s + c.qualityScore, 0) / colonies.length) : 0

  const ocean = {
    avgComplexity: avgReefComplexity,
    avgDensity: avgPolypDensity,
    avgVitality: avgReefVitality,
    isThriving: overallHealth >= 65,
    overallHealth,
  }

  const greatBarrierCount = colonies.filter((c) => c.condition === 'great-barrier').length
  const coralTriangleCount = colonies.filter((c) => c.condition === 'coral-triangle').length
  const caribbeanCount = colonies.filter((c) => c.condition === 'caribbean').length
  const redSeaCount = colonies.filter((c) => c.condition === 'red-sea').length
  const bleachedZoneCount = colonies.filter((c) => c.condition === 'bleached-zone').length
  const deadZoneCount = colonies.filter((c) => c.condition === 'dead-zone').length
  const isHealthyCount = colonies.filter((c) => c.polyp.isHealthy).length
  const hasComplexStructureCount = colonies.filter((c) => c.complexity.hasComplexStructure).length
  const hasMutualismCount = colonies.filter((c) => c.symbiotic.hasMutualism).length
  const isClearCount = colonies.filter((c) => c.clarity.isClear).length
  const hasQualityDepositCount = colonies.filter((c) => c.calcium.hasQualityDeposit).length
  const isVitalCount = colonies.filter((c) => c.vitality.isVital).length

  const marineBiologistGrade = classifyMarineBiologistGrade(overallHealth)

  const bestColony = colonies.length > 0
    ? colonies.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const densest = colonies.length > 0
    ? colonies.reduce((best, c) => c.polypDensity > best.polypDensity ? c : best).file : ''
  const mostComplex = colonies.length > 0
    ? colonies.reduce((best, c) => c.reefComplexity > best.reefComplexity ? c : best).file : ''
  const mostSymbiotic = colonies.length > 0
    ? colonies.reduce((best, c) => c.symbioticIndex > best.symbioticIndex ? c : best).file : ''
  const clearest = colonies.length > 0
    ? colonies.reduce((best, c) => c.waterClarity > best.waterClarity ? c : best).file : ''
  const mostVital = colonies.length > 0
    ? colonies.reduce((best, c) => c.reefVitality > best.reefVitality ? c : best).file : ''

  const stats = {
    avgCalciumDeposit,
    avgPolypDensity,
    avgReefComplexity,
    avgReefVitality,
    avgSymbioticIndex,
    avgWaterClarity,
    bestColony,
    bleachedZoneCount,
    caribbeanCount,
    clearest,
    coralTriangleCount,
    deadZoneCount,
    densest,
    greatBarrierCount,
    hasComplexStructureCount,
    hasMutualismCount,
    hasQualityDepositCount,
    isClearCount,
    isHealthyCount,
    isVitalCount,
    marineBiologistGrade,
    mostComplex,
    mostSymbiotic,
    mostVital,
    overallHealth,
    redSeaCount,
    totalFiles: files.length,
    totalSystems: systems.length,
  }

  const recommendations = generateRecommendations(colonies, systems, ocean, stats)

  return { colonies, ocean, recommendations, stats, systems }
}
