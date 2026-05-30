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
function countFunctionKeywords(content: string): number { return countMatches(content, FUNCTION_REGEX) }
function countArrowFunctions(content: string): number { return countMatches(content, ARROW_REGEX) }
function countJSDocBlocks(content: string): number { return countMatches(content, JSDOC_REGEX) }
function countAsyncKeywords(content: string): number { return countMatches(content, ASYNC_REGEX) }
function countTryCatch(content: string): number { return countMatches(content, TRY_CATCH_REGEX) }
function countDeepNested(content: string): number { return countMatches(content, DEEP_NESTED_REGEX) }
function countConsoleUsage(content: string): number { return countMatches(content, CONSOLE_REGEX) }
function countTodoComments(content: string): number { return countMatches(content, TODO_REGEX) }
function countPrivateMembers(content: string): number { return countMatches(content, PRIVATE_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface OriginMeasure {
  quality: number
  source: 'first-generation' | 'second-generation' | 'population-i' | 'population-ii' | 'primordial' | 'primordial-soup'
  hasHighOrigin: boolean
  hasCleanLineage: boolean
  hasProperNucleosynthesis: boolean
  hasNoContamination: boolean
  hasStellarForge: boolean
  hasNoDarkOrigin: boolean
  hasProperSeed: boolean
  hasNoAnomalous: boolean
  hasCosmicBackground: boolean
  hasNoInterference: boolean
  contaminationCount: number
  anomalousCount: number
}

export interface CompositionMeasure {
  diversity: number
  elements: 'heavy-elements' | 'carbon-based' | 'silicon-based' | 'hydrogen' | 'helium' | 'void'
  hasRichComposition: boolean
  hasHydrogen: boolean
  hasHelium: boolean
  hasCarbon: boolean
  hasOxygen: boolean
  hasIron: boolean
  hasNoMissing: boolean
  hasProperAbundance: boolean
  hasNoOverabundance: boolean
  hasHeavyMetals: boolean
  missingCount: number
  overabundanceCount: number
}

export interface GravityMeasure {
  pull: number
  mass: 'supermassive' | 'massive' | 'intermediate' | 'stellar' | 'planetary' | 'dust-grain'
  hasHighGravity: boolean
  hasOrbitalInfluence: boolean
  hasProperMass: boolean
  hasNoBlackHole: boolean
  hasGravitationalLens: boolean
  hasNoSingularity: boolean
  hasTidalForce: boolean
  hasEventHorizon: boolean
  hasNoAccretionDisk: boolean
  hasProperOrbit: boolean
  singularityCount: number
  accretionDiskCount: number
}

export interface StabilityMeasure {
  level: number
  orbit: 'stable-orbit' | 'circular' | 'elliptical' | 'decaying' | 'chaotic' | 'ejected'
  hasHighStability: boolean
  hasProperVelocity: boolean
  hasNoWobble: boolean
  hasKeplerian: boolean
  hasNoPrecession: boolean
  hasResonance: boolean
  hasNoCollision: boolean
  hasProperPeriod: boolean
  hasNoEscape: boolean
  hasLagrangian: boolean
  wobbleCount: number
  collisionCount: number
}

export interface RemnantMeasure {
  quality: number
  type: 'neutron-star' | 'white-dwarf' | 'pulsar' | 'black-dwarf' | 'brown-dwarf' | 'debris'
  hasHighQuality: boolean
  hasProperCollapse: boolean
  hasNoDegradation: boolean
  hasCompactForm: boolean
  hasNoInstability: boolean
  hasSpin: boolean
  hasMagnetic: boolean
  hasNoNova: boolean
  hasProperDensity: boolean
  hasNoFragmentation: boolean
  novaCount: number
  fragmentationCount: number
}

export interface LegacyMeasure {
  score: number
  impact: 'cosmic-legacy' | 'stellar-legacy' | 'planetary-legacy' | 'local-legacy' | 'ephemeral' | 'nonexistent'
  hasHighLegacy: boolean
  hasSeedContribution: boolean
  hasCosmicRecycling: boolean
  hasNoEntropy: boolean
  hasProperRadiation: boolean
  hasNoDimming: boolean
  hasGenerational: boolean
  hasNoExtinction: boolean
  hasSeedBank: boolean
  hasNoHeatDeath: boolean
  entropyCount: number
  extinctionCount: number
}

export interface StellarRemnant {
  file: string
  stellarOrigin: number
  elementalComposition: number
  gravitationalPull: number
  orbitalStability: number
  supernovaRemnant: number
  cosmicLegacy: number
  origin: OriginMeasure
  composition: CompositionMeasure
  gravity: GravityMeasure
  stability: StabilityMeasure
  remnant: RemnantMeasure
  legacy: LegacyMeasure
  condition: 'cosmic-treasure' | 'stellar-nursery' | 'main-sequence' | 'red-giant' | 'brown-dwarf' | 'cosmic-dust'
  qualityScore: number
}

export interface StarCluster {
  directory: string
  remnants: StellarRemnant[]
  avgOrigin: number
  avgStability: number
  avgLegacy: number
  cosmicCount: number
  dustCount: number
  highGravityCount: number
  stableCount: number
  clusterType: 'globular-cluster' | 'open-cluster' | 'stellar-association' | 'galaxy-arm' | 'dark-cloud' | 'void'
  condition: 'cosmos' | 'galaxy' | 'nebula' | 'star-field' | 'dark-matter' | 'empty-space'
}

export interface StardustTrailResult {
  remnants: StellarRemnant[]
  clusters: StarCluster[]
  cosmos: {
    avgOrigin: number
    avgStability: number
    avgLegacy: number
    isCosmic: boolean
    overallCosmic: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgStellarOrigin: number
    avgElementalComposition: number
    avgGravitationalPull: number
    avgOrbitalStability: number
    avgSupernovaRemnant: number
    avgCosmicLegacy: number
    cosmicTreasureCount: number
    stellarNurseryCount: number
    mainSequenceCount: number
    redGiantCount: number
    brownDwarfCount: number
    cosmicDustCount: number
    hasHighOriginCount: number
    hasRichCompositionCount: number
    hasHighGravityCount: number
    hasHighStabilityCount: number
    hasHighQualityCount: number
    hasHighLegacyCount: number
    overallCosmic: number
    astronomerGrade: 'cosmic-observer' | 'astrophysicist' | 'astronomer' | 'stargazer' | 'telescope-operator' | 'blind-spot'
    bestRemnant: string
    bestOrigin: string
    mostDiverse: string
    mostImportant: string
    mostStable: string
    greatestLegacy: string
  }
  recommendations: string[]
}

// ─── Origin Measurement ─────────────────────────────────────────────────────

/** @example measureOrigin(content) returns origin analysis */
export function measureOrigin(content: string): OriginMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 10
  if (exportCount > 0) quality += 8
  if (importCount > 0) quality += 5
  if (genericsCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (deepNestedCount === 0) quality += 5
  if (privateCount === 0) quality += 3
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const contaminationCount = consoleCount + anyCount
  const anomalousCount = deepNestedCount + privateCount

  const hasHighOrigin = quality >= 75 && hasStructure && hasTypes
  const hasCleanLineage = hasStructure && hasTypes && hasFunctions
  const hasProperNucleosynthesis = hasStructure && hasTypes && genericsCount > 0
  const hasNoContamination = contaminationCount === 0
  const hasStellarForge = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoDarkOrigin = anyCount === 0 && deepNestedCount === 0
  const hasProperSeed = hasFunctions && exportCount > 0
  const hasNoAnomalous = anomalousCount === 0
  const hasCosmicBackground = hasStructure && hasTypes && jsdocCount > 0
  const hasNoInterference = consoleCount === 0 && deepNestedCount === 0

  let source: OriginMeasure['source'] = 'primordial-soup'
  if (hasHighOrigin && hasNoContamination && hasNoAnomalous && hasStellarForge) source = 'first-generation'
  else if (hasHighOrigin && hasNoContamination) source = 'second-generation'
  else if (hasHighOrigin) source = 'population-i'
  else if (hasCleanLineage && hasProperSeed) source = 'population-ii'
  else if (quality > 30) source = 'primordial'

  return {
    quality, source, hasHighOrigin, hasCleanLineage, hasProperNucleosynthesis,
    hasNoContamination, hasStellarForge, hasNoDarkOrigin, hasProperSeed,
    hasNoAnomalous, hasCosmicBackground, hasNoInterference,
    contaminationCount, anomalousCount,
  }
}

// ─── Composition Measurement ────────────────────────────────────────────────

/** @example measureComposition(content) returns composition analysis */
export function measureComposition(content: string): CompositionMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
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
  if (exportCount > 0) diversity += 8
  if (genericsCount > 0) diversity += 5
  if (importCount > 0) diversity += 5
  if (anyCount === 0) diversity += 5
  if (consoleCount === 0) diversity += 5
  if (todoCount === 0) diversity += 5
  if (deepNestedCount === 0) diversity += 5
  diversity = Math.min(100, Math.max(0, Math.round(diversity)))

  const missingCount = (hasStructure ? 0 : 1) + (hasTypes ? 0 : 1) + (hasFunctions ? 0 : 1)
  const overabundanceCount = anyCount + consoleCount + todoCount

  const hasRichComposition = diversity >= 75 && hasStructure && hasTypes
  const hasHydrogen = hasStructure
  const hasHelium = hasTypes
  const hasCarbon = hasFunctions
  const hasOxygen = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasIron = hasStructure && hasTypes && genericsCount > 0
  const hasNoMissing = missingCount === 0
  const hasProperAbundance = exportCount > 0 && importCount > 0
  const hasNoOverabundance = overabundanceCount === 0
  const hasHeavyMetals = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0

  let elements: CompositionMeasure['elements'] = 'void'
  if (hasRichComposition && hasNoMissing && hasNoOverabundance && hasIron) elements = 'heavy-elements'
  else if (hasRichComposition && hasNoMissing) elements = 'carbon-based'
  else if (hasRichComposition) elements = 'silicon-based'
  else if (hasHydrogen && hasHelium && hasCarbon) elements = 'hydrogen'
  else if (diversity > 30) elements = 'helium'

  return {
    diversity, elements, hasRichComposition, hasHydrogen, hasHelium,
    hasCarbon, hasOxygen, hasIron, hasNoMissing, hasProperAbundance,
    hasNoOverabundance, hasHeavyMetals, missingCount, overabundanceCount,
  }
}

// ─── Gravity Measurement ────────────────────────────────────────────────────

/** @example measureGravity(content) returns gravity analysis */
export function measureGravity(content: string): GravityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let pull = 20
  if (hasStructure) pull += 12
  if (hasTypes) pull += 12
  if (hasFunctions) pull += 10
  if (jsdocCount > 0) pull += 8
  if (tryCatchCount > 0) pull += 8
  if (genericsCount > 0) pull += 5
  if (exportCount > 0) pull += 5
  if (importCount > 0) pull += 5
  if (asyncCount > 0) pull += 5
  if (anyCount === 0) pull += 5
  if (consoleCount === 0) pull += 5
  pull = Math.min(100, Math.max(0, Math.round(pull)))

  const singularityCount = deepNestedCount
  const accretionDiskCount = consoleCount + anyCount

  const hasHighGravity = pull >= 75 && hasStructure && hasTypes
  const hasOrbitalInfluence = exportCount > 0 && importCount > 0
  const hasProperMass = hasStructure && hasTypes && hasFunctions
  const hasNoBlackHole = deepNestedCount === 0
  const hasGravitationalLens = hasStructure && hasTypes && genericsCount > 0
  const hasNoSingularity = singularityCount === 0
  const hasTidalForce = hasStructure && hasTypes && jsdocCount > 0
  const hasEventHorizon = hasStructure && hasTypes && exportCount > 0
  const hasNoAccretionDisk = accretionDiskCount === 0
  const hasProperOrbit = importCount > 0 && exportCount > 0

  let mass: GravityMeasure['mass'] = 'dust-grain'
  if (hasHighGravity && hasNoSingularity && hasNoAccretionDisk && hasProperMass) mass = 'supermassive'
  else if (hasHighGravity && hasNoSingularity) mass = 'massive'
  else if (hasHighGravity) mass = 'intermediate'
  else if (hasProperMass && hasOrbitalInfluence) mass = 'stellar'
  else if (pull > 30) mass = 'planetary'

  return {
    pull, mass, hasHighGravity, hasOrbitalInfluence, hasProperMass,
    hasNoBlackHole, hasGravitationalLens, hasNoSingularity, hasTidalForce,
    hasEventHorizon, hasNoAccretionDisk, hasProperOrbit,
    singularityCount, accretionDiskCount,
  }
}

// ─── Stability Measurement ──────────────────────────────────────────────────

/** @example measureStability(content) returns stability analysis */
export function measureStability(content: string): StabilityMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (countTryCatch(content) > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const wobbleCount = todoCount + anyCount
  const collisionCount = deepNestedCount + privateCount

  const hasHighStability = level >= 75 && hasStructure && hasTypes
  const hasProperVelocity = hasFunctions && exportCount > 0
  const hasNoWobble = wobbleCount === 0
  const hasKeplerian = hasStructure && hasTypes && genericsCount > 0
  const hasNoPrecession = deepNestedCount === 0 && todoCount === 0
  const hasResonance = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoCollision = collisionCount === 0
  const hasProperPeriod = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoEscape = consoleCount === 0 && deepNestedCount === 0
  const hasLagrangian = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0

  let orbit: StabilityMeasure['orbit'] = 'ejected'
  if (hasHighStability && hasNoWobble && hasNoCollision && hasLagrangian) orbit = 'stable-orbit'
  else if (hasHighStability && hasNoWobble) orbit = 'circular'
  else if (hasHighStability) orbit = 'elliptical'
  else if (hasProperVelocity && hasKeplerian) orbit = 'decaying'
  else if (level > 30) orbit = 'chaotic'

  return {
    level, orbit, hasHighStability, hasProperVelocity, hasNoWobble,
    hasKeplerian, hasNoPrecession, hasResonance, hasNoCollision,
    hasProperPeriod, hasNoEscape, hasLagrangian, wobbleCount, collisionCount,
  }
}

// ─── Remnant Measurement ────────────────────────────────────────────────────

/** @example measureRemnant(content) returns remnant analysis */
export function measureRemnant(content: string): RemnantMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
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

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (exportCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (todoCount === 0) quality += 5
  if (deepNestedCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const novaCount = todoCount + anyCount
  const fragmentationCount = deepNestedCount + commentedCodeCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes
  const hasProperCollapse = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoDegradation = consoleCount === 0 && anyCount === 0
  const hasCompactForm = hasStructure && hasTypes && hasFunctions
  const hasNoInstability = deepNestedCount === 0 && todoCount === 0
  const hasSpin = hasFunctions && jsdocCount > 0
  const hasMagnetic = hasStructure && hasTypes && genericsCount > 0
  const hasNoNova = novaCount === 0
  const hasProperDensity = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0
  const hasNoFragmentation = fragmentationCount === 0

  let remnantType: RemnantMeasure['type'] = 'debris'
  if (hasHighQuality && hasNoNova && hasNoFragmentation && hasProperDensity) remnantType = 'neutron-star'
  else if (hasHighQuality && hasNoNova) remnantType = 'white-dwarf'
  else if (hasHighQuality) remnantType = 'pulsar'
  else if (hasCompactForm && hasSpin) remnantType = 'black-dwarf'
  else if (quality > 30) remnantType = 'brown-dwarf'

  return {
    quality, type: remnantType, hasHighQuality, hasProperCollapse,
    hasNoDegradation, hasCompactForm, hasNoInstability, hasSpin, hasMagnetic,
    hasNoNova, hasProperDensity, hasNoFragmentation, novaCount, fragmentationCount,
  }
}

// ─── Legacy Measurement ─────────────────────────────────────────────────────

/** @example measureLegacy(content) returns legacy analysis */
export function measureLegacy(content: string): LegacyMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = genericsCount_safe(content)
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

  let score = 20
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (exportCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (importCount > 0) score += 5
  if (anyCount === 0) score += 5
  if (consoleCount === 0) score += 5
  if (todoCount === 0) score += 5
  if (deepNestedCount === 0) score += 5
  score = Math.min(100, Math.max(0, Math.round(score)))

  const entropyCount = anyCount + todoCount
  const extinctionCount = deepNestedCount + commentedCodeCount

  const hasHighLegacy = score >= 75 && hasStructure && hasTypes
  const hasSeedContribution = exportCount > 0 && importCount > 0
  const hasCosmicRecycling = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoEntropy = entropyCount === 0
  const hasProperRadiation = hasStructure && hasTypes && jsdocCount > 0
  const hasNoDimming = consoleCount === 0 && commentedCodeCount === 0
  const hasGenerational = hasStructure && hasTypes && genericsCount > 0
  const hasNoExtinction = extinctionCount === 0
  const hasSeedBank = hasFunctions && jsdocCount > 0 && genericsCount > 0
  const hasNoHeatDeath = consoleCount === 0 && deepNestedCount === 0

  let impact: LegacyMeasure['impact'] = 'nonexistent'
  if (hasHighLegacy && hasNoEntropy && hasNoExtinction && hasSeedBank) impact = 'cosmic-legacy'
  else if (hasHighLegacy && hasNoEntropy) impact = 'stellar-legacy'
  else if (hasHighLegacy) impact = 'planetary-legacy'
  else if (hasProperRadiation && hasSeedContribution) impact = 'local-legacy'
  else if (score > 30) impact = 'ephemeral'

  return {
    score, impact, hasHighLegacy, hasSeedContribution, hasCosmicRecycling,
    hasNoEntropy, hasProperRadiation, hasNoDimming, hasGenerational,
    hasNoExtinction, hasSeedBank, hasNoHeatDeath, entropyCount, extinctionCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(remnant) returns condition string */
export function classifyCondition(remnant: StellarRemnant): StellarRemnant['condition'] {
  const { qualityScore } = remnant
  if (qualityScore >= 80) return 'cosmic-treasure'
  if (qualityScore >= 65) return 'stellar-nursery'
  if (qualityScore >= 50) return 'main-sequence'
  if (qualityScore >= 35) return 'red-giant'
  if (qualityScore >= 20) return 'brown-dwarf'
  return 'cosmic-dust'
}

// ─── Remnant Analysis ───────────────────────────────────────────────────────

/** @example analyzeStellarRemnant(content, filePath) returns full remnant */
export function analyzeStellarRemnant(content: string, filePath: string): StellarRemnant {
  const origin = measureOrigin(content)
  const composition = measureComposition(content)
  const gravity = measureGravity(content)
  const stability = measureStability(content)
  const remnant = measureRemnant(content)
  const legacy = measureLegacy(content)

  const stellarOrigin = origin.quality
  const elementalComposition = composition.diversity
  const gravitationalPull = gravity.pull
  const orbitalStability = stability.level
  const supernovaRemnant = remnant.quality
  const cosmicLegacy = legacy.score

  const qualityScore = Math.round(
    stellarOrigin * 0.15 +
    elementalComposition * 0.15 +
    gravitationalPull * 0.15 +
    orbitalStability * 0.2 +
    supernovaRemnant * 0.15 +
    cosmicLegacy * 0.2,
  )

  const result: StellarRemnant = {
    file: filePath,
    stellarOrigin, elementalComposition, gravitationalPull,
    orbitalStability, supernovaRemnant, cosmicLegacy,
    origin, composition, gravity, stability, remnant, legacy,
    condition: 'cosmic-dust',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Cluster Analysis ───────────────────────────────────────────────────────

/** @example analyzeStarCluster(remnants, dirPath) returns cluster */
export function analyzeStarCluster(remnants: StellarRemnant[], dirPath: string): StarCluster {
  if (remnants.length === 0) {
    return {
      directory: dirPath, remnants: [], avgOrigin: 0, avgStability: 0, avgLegacy: 0,
      cosmicCount: 0, dustCount: 0, highGravityCount: 0, stableCount: 0,
      clusterType: 'void', condition: 'empty-space',
    }
  }

  const avgOrigin = Math.round(remnants.reduce((s, r) => s + r.stellarOrigin, 0) / remnants.length)
  const avgStability = Math.round(remnants.reduce((s, r) => s + r.orbitalStability, 0) / remnants.length)
  const avgLegacy = Math.round(remnants.reduce((s, r) => s + r.cosmicLegacy, 0) / remnants.length)

  const cosmicCount = remnants.filter((r) => r.condition === 'cosmic-treasure').length
  const dustCount = remnants.filter((r) => r.condition === 'cosmic-dust').length
  const highGravityCount = remnants.filter((r) => r.gravity.hasHighGravity).length
  const stableCount = remnants.filter((r) => r.stability.hasHighStability).length

  const clusterType = classifyClusterType(remnants)
  const avgScore = remnants.reduce((s, r) => s + r.qualityScore, 0) / remnants.length
  const condition = classifyClusterCondition(avgScore)

  return {
    directory: dirPath, remnants, avgOrigin, avgStability, avgLegacy,
    cosmicCount, dustCount, highGravityCount, stableCount, clusterType, condition,
  }
}

// ─── Cluster Classification ─────────────────────────────────────────────────

/** @example classifyClusterType(remnants) returns cluster type */
export function classifyClusterType(remnants: StellarRemnant[]): StarCluster['clusterType'] {
  if (remnants.length === 0) return 'void'
  const avgScore = remnants.reduce((s, r) => s + r.qualityScore, 0) / remnants.length
  const cosmicCnt = remnants.filter((r) => r.condition === 'cosmic-treasure').length
  if (avgScore >= 75 && cosmicCnt >= Math.ceil(remnants.length * 0.3)) return 'globular-cluster'
  if (avgScore >= 60) return 'open-cluster'
  if (avgScore >= 45) return 'stellar-association'
  if (avgScore >= 30) return 'galaxy-arm'
  if (avgScore >= 15) return 'dark-cloud'
  return 'void'
}

/** @example classifyClusterCondition(avgScore) returns condition */
export function classifyClusterCondition(avgScore: number): StarCluster['condition'] {
  if (avgScore >= 80) return 'cosmos'
  if (avgScore >= 65) return 'galaxy'
  if (avgScore >= 50) return 'nebula'
  if (avgScore >= 35) return 'star-field'
  if (avgScore >= 20) return 'dark-matter'
  return 'empty-space'
}

/** @example classifyAstronomerGrade(avgCosmic) returns grade */
export function classifyAstronomerGrade(avgCosmic: number): StardustTrailResult['stats']['astronomerGrade'] {
  if (avgCosmic >= 80) return 'cosmic-observer'
  if (avgCosmic >= 65) return 'astrophysicist'
  if (avgCosmic >= 50) return 'astronomer'
  if (avgCosmic >= 35) return 'stargazer'
  if (avgCosmic >= 20) return 'telescope-operator'
  return 'blind-spot'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(remnants, clusters, cosmos, stats) returns recommendations */
export function generateRecommendations(
  remnants: StellarRemnant[],
  clusters: StarCluster[],
  cosmos: StardustTrailResult['cosmos'],
  stats: StardustTrailResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgStellarOrigin < 50) recs.push('Improve stellar origin — forge your code in hotter stars')
  if (stats.avgElementalComposition < 50) recs.push('Enrich elemental composition — diversify your code patterns')
  if (stats.avgGravitationalPull < 50) recs.push('Increase gravitational pull — make your code more important')
  if (stats.avgOrbitalStability < 50) recs.push('Stabilize orbital paths — make your code more reliable')
  if (stats.avgSupernovaRemnant < 50) recs.push('Improve supernova remnants — transform your code better')
  if (stats.avgCosmicLegacy < 50) recs.push('Strengthen cosmic legacy — make your code last')
  if (stats.cosmicDustCount > remnants.length * 0.5) recs.push('Too much cosmic dust — over half the codebase lacks stellar quality')
  if (stats.hasHighLegacyCount === 0) recs.push('No cosmic legacy found — cultivate your code heritage')
  if (clusters.length > 0 && cosmos.overallCosmic < 60) recs.push('Overall cosmic quality is low — consult the cosmic observer')
  if (recs.length === 0) recs.push('Cosmic treasure achieved — your code spans the universe')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildStardustTrailResult(files, contents, options) returns full result */
export function buildStardustTrailResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): StardustTrailResult {
  const remnants: StellarRemnant[] = files.map((file, i) =>
    analyzeStellarRemnant(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, StellarRemnant[]>()
  for (const remnant of remnants) {
    const dir = remnant.file.includes('/')
      ? remnant.file.substring(0, remnant.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(remnant)
    } else {
      dirMap.set(dir, [remnant])
    }
  }

  const clusters: StarCluster[] = Array.from(dirMap.entries()).map(([dir, dirRemnants]) =>
    analyzeStarCluster(dirRemnants, dir),
  )

  const avgOrigin = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.stellarOrigin, 0) / remnants.length)
    : 0
  const avgStability = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.orbitalStability, 0) / remnants.length)
    : 0
  const avgLegacy = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.cosmicLegacy, 0) / remnants.length)
    : 0
  const overallCosmic = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.qualityScore, 0) / remnants.length)
    : 0
  const isCosmic = overallCosmic >= 65

  const cosmos: StardustTrailResult['cosmos'] = {
    avgOrigin, avgStability, avgLegacy, isCosmic, overallCosmic,
  }

  const avgStellarOrigin = avgOrigin
  const avgElementalComposition = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.elementalComposition, 0) / remnants.length)
    : 0
  const avgGravitationalPull = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.gravitationalPull, 0) / remnants.length)
    : 0
  const avgOrbitalStability = avgStability
  const avgSupernovaRemnant = remnants.length > 0
    ? Math.round(remnants.reduce((s, r) => s + r.supernovaRemnant, 0) / remnants.length)
    : 0
  const avgCosmicLegacy = avgLegacy

  const conditionCounts = {
    cosmicTreasure: 0, stellarNursery: 0, mainSequence: 0,
    redGiant: 0, brownDwarf: 0, cosmicDust: 0,
  }
  for (const r of remnants) {
    switch (r.condition) {
      case 'cosmic-treasure': conditionCounts.cosmicTreasure++; break
      case 'stellar-nursery': conditionCounts.stellarNursery++; break
      case 'main-sequence': conditionCounts.mainSequence++; break
      case 'red-giant': conditionCounts.redGiant++; break
      case 'brown-dwarf': conditionCounts.brownDwarf++; break
      case 'cosmic-dust': conditionCounts.cosmicDust++; break
    }
  }

  const hasHighOriginCount = remnants.filter((r) => r.origin.hasHighOrigin).length
  const hasRichCompositionCount = remnants.filter((r) => r.composition.hasRichComposition).length
  const hasHighGravityCount = remnants.filter((r) => r.gravity.hasHighGravity).length
  const hasHighStabilityCount = remnants.filter((r) => r.stability.hasHighStability).length
  const hasHighQualityCount = remnants.filter((r) => r.remnant.hasHighQuality).length
  const hasHighLegacyCount = remnants.filter((r) => r.legacy.hasHighLegacy).length

  const bestRemnant = remnants.length > 0
    ? remnants.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file
    : ''
  const bestOrigin = remnants.length > 0
    ? remnants.reduce((best, r) => r.stellarOrigin > best.stellarOrigin ? r : best).file
    : ''
  const mostDiverse = remnants.length > 0
    ? remnants.reduce((best, r) => r.elementalComposition > best.elementalComposition ? r : best).file
    : ''
  const mostImportant = remnants.length > 0
    ? remnants.reduce((best, r) => r.gravitationalPull > best.gravitationalPull ? r : best).file
    : ''
  const mostStable = remnants.length > 0
    ? remnants.reduce((best, r) => r.orbitalStability > best.orbitalStability ? r : best).file
    : ''
  const greatestLegacy = remnants.length > 0
    ? remnants.reduce((best, r) => r.cosmicLegacy > best.cosmicLegacy ? r : best).file
    : ''

  const astronomerGrade = classifyAstronomerGrade(overallCosmic)

  const stats: StardustTrailResult['stats'] = {
    totalFiles: files.length, totalClusters: clusters.length,
    avgStellarOrigin, avgElementalComposition, avgGravitationalPull,
    avgOrbitalStability, avgSupernovaRemnant, avgCosmicLegacy,
    cosmicTreasureCount: conditionCounts.cosmicTreasure,
    stellarNurseryCount: conditionCounts.stellarNursery,
    mainSequenceCount: conditionCounts.mainSequence,
    redGiantCount: conditionCounts.redGiant,
    brownDwarfCount: conditionCounts.brownDwarf,
    cosmicDustCount: conditionCounts.cosmicDust,
    hasHighOriginCount, hasRichCompositionCount, hasHighGravityCount,
    hasHighStabilityCount, hasHighQualityCount, hasHighLegacyCount,
    overallCosmic, astronomerGrade,
    bestRemnant, bestOrigin, mostDiverse,
    mostImportant, mostStable, greatestLegacy,
  }

  const recommendations = generateRecommendations(remnants, clusters, cosmos, stats)

  return { remnants, clusters, cosmos, stats, recommendations }
}
