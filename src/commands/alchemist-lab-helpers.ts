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

// ─── Helper Functions ────────────────────────────────────────────────────────

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
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface TransmutationMeasure {
  quality: number
  element: 'aurum' | 'argentum' | 'cuprum' | 'ferrum' | 'plumbum' | 'stercore'
  hasHighQuality: boolean
  hasProperVessel: boolean
  hasEvenHeat: boolean
  hasNoImpurities: boolean
  hasProperSequence: boolean
  hasNoReaction: boolean
  hasCatalyticAgent: boolean
  hasNoExplosion: boolean
  hasProperBalance: boolean
  hasNoToxicFumes: boolean
  impurityCount: number
  explosionCount: number
}

export interface PurificationMeasure {
  level: number
  state: 'distilled' | 'filtered' | 'clarified' | 'raw' | 'impure' | 'contaminated'
  hasHighLevel: boolean
  hasProperFilter: boolean
  hasNoSludge: boolean
  hasCrystal: boolean
  hasNoSediment: boolean
  hasPure: boolean
  hasNoContaminant: boolean
  hasProperWash: boolean
  hasRefined: boolean
  hasNoResidue: boolean
  sludgeCount: number
  sedimentCount: number
}

export interface EssenceMeasure {
  potency: number
  type: 'quintessence' | 'aether' | 'vital-essence' | 'tincture' | 'diluted' | 'inert'
  hasHighPotency: boolean
  hasConcentrated: boolean
  hasProperExtraction: boolean
  hasNoDilution: boolean
  hasPotent: boolean
  hasNoWeakening: boolean
  hasVolatile: boolean
  hasNoEvaporation: boolean
  hasEssential: boolean
  hasNoLoss: boolean
  dilutionCount: number
  evaporationCount: number
}

export interface CatalystMeasure {
  strength: number
  agent: 'philosopher-catalyst' | 'accelerator' | 'enzyme' | 'mild-agent' | 'inhibitor' | 'poison'
  hasHighStrength: boolean
  hasReaction: boolean
  hasAcceleration: boolean
  hasNoInhibition: boolean
  hasEnzymatic: boolean
  hasNoPoison: boolean
  hasProperDosage: boolean
  hasNoOverdose: boolean
  hasSustaining: boolean
  hasNoSuppression: boolean
  inhibitionCount: number
  poisonCount: number
}

export interface ElixirMeasure {
  quality: number
  grade: 'elixir-of-life' | 'grand-elixir' | 'minor-elixir' | 'potion' | 'brew' | 'sludge'
  hasHighQuality: boolean
  hasHealing: boolean
  hasRestorative: boolean
  hasNoToxicity: boolean
  hasBalanced: boolean
  hasNoSideEffects: boolean
  hasRejuvenating: boolean
  hasNoSpoilage: boolean
  hasStrengthening: boolean
  hasNoCorruption: boolean
  toxicityCount: number
  corruptionCount: number
}

export interface StoneMeasure {
  proximity: number
  stage: 'lapis-philosophorum' | 'rubedo' | 'albedo' | 'nigredo' | 'prima-materia' | 'void'
  hasHighProximity: boolean
  hasGold: boolean
  hasSilver: boolean
  hasTransmutationReady: boolean
  hasNoBaseMetal: boolean
  hasOpus: boolean
  hasNoFailedExperiment: boolean
  hasIlluminated: boolean
  hasNoShadow: boolean
  hasProjection: boolean
  baseMetalCount: number
  failedExperimentCount: number
}

export interface AlchemicalSample {
  file: string
  transmutationQuality: number
  purificationLevel: number
  essencePotency: number
  catalystStrength: number
  elixirQuality: number
  stoneProximity: number
  transmutation: TransmutationMeasure
  purification: PurificationMeasure
  essence: EssenceMeasure
  catalyst: CatalystMeasure
  elixir: ElixirMeasure
  stone: StoneMeasure
  condition: 'philosopher-stone' | 'aurum-potabile' | 'grand-elixir' | 'work-in-progress' | 'base-metal' | 'slag'
  qualityScore: number
}

export interface LaboratoryBench {
  directory: string
  samples: AlchemicalSample[]
  avgTransmutation: number
  avgPurification: number
  avgStoneProximity: number
  philosopherCount: number
  slagCount: number
  aurumCount: number
  pureCount: number
  benchType: 'grand-laboratory' | 'alchemist-study' | 'workshop' | 'apothecary' | 'closet' | 'dungeon'
  condition: 'master-atelier' | 'skilled-lab' | 'apprentice-bench' | 'amateur-setup' | 'ruined-lab' | 'abandoned'
}

export interface AlchemistLabResult {
  samples: AlchemicalSample[]
  benches: LaboratoryBench[]
  laboratory: {
    avgTransmutation: number
    avgPurification: number
    avgStoneProximity: number
    isGolden: boolean
    overallAlchemy: number
  }
  stats: {
    totalFiles: number
    totalBenches: number
    avgTransmutationQuality: number
    avgPurificationLevel: number
    avgEssencePotency: number
    avgCatalystStrength: number
    avgElixirQuality: number
    avgStoneProximity: number
    philosopherStoneCount: number
    aurumPotabileCount: number
    grandElixirCount: number
    workInProgressCount: number
    baseMetalCount: number
    slagCount: number
    hasHighTransmutationCount: number
    hasHighPurificationCount: number
    hasHighPotencyCount: number
    hasHighCatalystCount: number
    hasHighElixirCount: number
    hasHighProximityCount: number
    overallAlchemy: number
    alchemistGrade: 'grand-master' | 'master-alchemist' | 'adept' | 'apprentice' | 'novice' | 'charlatan'
    bestSample: string
    bestTransmuter: string
    purest: string
    mostPotent: string
    strongestCatalyst: string
    closestToStone: string
  }
  recommendations: string[]
}

// ─── Transmutation Measurement ──────────────────────────────────────────────

/** @example measureTransmutation(content) returns transmutation analysis */
export function measureTransmutation(content: string): TransmutationMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
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
  if (genericsCount > 0) quality += 8
  if (exportCount > 0) quality += 8
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (deepNestedCount === 0) quality += 5
  if (todoCount === 0) quality += 5
  if (commentedCodeCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const impurityCount = anyCount + consoleCount
  const explosionCount = deepNestedCount + commentedCodeCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes
  const hasProperVessel = hasStructure && hasTypes && hasFunctions
  const hasEvenHeat = deepNestedCount === 0
  const hasNoImpurities = impurityCount === 0
  const hasProperSequence = exportCount > 0 && importCount > 0
  const hasNoReaction = explosionCount === 0
  const hasCatalyticAgent = genericsCount > 0
  const hasNoExplosion = explosionCount === 0
  const hasProperBalance = hasStructure && hasTypes && genericsCount > 0
  const hasNoToxicFumes = consoleCount === 0 && anyCount === 0

  let element: TransmutationMeasure['element'] = 'stercore'
  if (hasHighQuality && hasNoImpurities && hasNoExplosion && hasCatalyticAgent) element = 'aurum'
  else if (hasHighQuality && hasNoImpurities) element = 'argentum'
  else if (hasHighQuality) element = 'cuprum'
  else if (hasProperVessel && hasProperSequence) element = 'ferrum'
  else if (quality > 30) element = 'plumbum'

  return {
    quality, element, hasHighQuality, hasProperVessel, hasEvenHeat,
    hasNoImpurities, hasProperSequence, hasNoReaction, hasCatalyticAgent,
    hasNoExplosion, hasProperBalance, hasNoToxicFumes, impurityCount, explosionCount,
  }
}

// ─── Purification Measurement ───────────────────────────────────────────────

/** @example measurePurification(content) returns purification analysis */
export function measurePurification(content: string): PurificationMeasure {
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

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (exportCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  if (commentedCodeCount === 0) level += 3
  level = Math.min(100, Math.max(0, Math.round(level)))

  const sludgeCount = anyCount + consoleCount + todoCount
  const sedimentCount = deepNestedCount + commentedCodeCount

  const hasHighLevel = level >= 75 && hasStructure && hasTypes
  const hasProperFilter = hasStructure && hasTypes && hasFunctions
  const hasNoSludge = sludgeCount === 0
  const hasCrystal = genericsCount > 0 && jsdocCount > 0
  const hasNoSediment = sedimentCount === 0
  const hasPure = anyCount === 0 && consoleCount === 0
  const hasNoContaminant = sludgeCount === 0 && sedimentCount === 0
  const hasProperWash = exportCount > 0 && importCount > 0
  const hasRefined = hasStructure && hasTypes && genericsCount > 0
  const hasNoResidue = commentedCodeCount === 0

  let state: PurificationMeasure['state'] = 'contaminated'
  if (hasHighLevel && hasNoSludge && hasNoSediment && hasCrystal) state = 'distilled'
  else if (hasHighLevel && hasNoSludge) state = 'filtered'
  else if (hasHighLevel) state = 'clarified'
  else if (hasProperFilter && hasProperWash) state = 'raw'
  else if (level > 30) state = 'impure'

  return {
    level, state, hasHighLevel, hasProperFilter, hasNoSludge, hasCrystal,
    hasNoSediment, hasPure, hasNoContaminant, hasProperWash, hasRefined,
    hasNoResidue, sludgeCount, sedimentCount,
  }
}

// ─── Essence Measurement ────────────────────────────────────────────────────

/** @example measureEssence(content) returns essence analysis */
export function measureEssence(content: string): EssenceMeasure {
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
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let potency = 20
  if (hasStructure) potency += 12
  if (hasTypes) potency += 12
  if (hasFunctions) potency += 10
  if (genericsCount > 0) potency += 10
  if (jsdocCount > 0) potency += 8
  if (exportCount > 0) potency += 5
  if (importCount > 0) potency += 5
  if (asyncCount > 0) potency += 5
  if (anyCount === 0) potency += 5
  if (consoleCount === 0) potency += 5
  if (deepNestedCount === 0) potency += 3
  potency = Math.min(100, Math.max(0, Math.round(potency)))

  const dilutionCount = anyCount + consoleCount
  const evaporationCount = todoCount + deepNestedCount

  const hasHighPotency = potency >= 75 && hasStructure && hasTypes
  const hasConcentrated = hasStructure && hasTypes && genericsCount > 0
  const hasProperExtraction = exportCount > 0 && importCount > 0
  const hasNoDilution = dilutionCount === 0
  const hasPotent = hasFunctions && genericsCount > 0
  const hasNoWeakening = deepNestedCount === 0
  const hasVolatile = asyncCount > 0 && genericsCount > 0
  const hasNoEvaporation = evaporationCount === 0
  const hasEssential = hasStructure && hasTypes && hasFunctions
  const hasNoLoss = todoCount === 0 && deepNestedCount === 0

  let type: EssenceMeasure['type'] = 'inert'
  if (hasHighPotency && hasNoDilution && hasNoEvaporation && hasConcentrated) type = 'quintessence'
  else if (hasHighPotency && hasNoDilution) type = 'aether'
  else if (hasHighPotency) type = 'vital-essence'
  else if (hasEssential && hasProperExtraction) type = 'tincture'
  else if (potency > 30) type = 'diluted'

  return {
    potency, type, hasHighPotency, hasConcentrated, hasProperExtraction,
    hasNoDilution, hasPotent, hasNoWeakening, hasVolatile, hasNoEvaporation,
    hasEssential, hasNoLoss, dilutionCount, evaporationCount,
  }
}

// ─── Catalyst Measurement ───────────────────────────────────────────────────

/** @example measureCatalyst(content) returns catalyst analysis */
export function measureCatalyst(content: string): CatalystMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
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

  let strength = 20
  if (hasStructure) strength += 10
  if (hasTypes) strength += 10
  if (hasFunctions) strength += 10
  if (tryCatchCount > 0) strength += 10
  if (asyncCount > 0) strength += 8
  if (genericsCount > 0) strength += 8
  if (exportCount > 0) strength += 5
  if (importCount > 0) strength += 5
  if (anyCount === 0) strength += 5
  if (consoleCount === 0) strength += 5
  if (deepNestedCount === 0) strength += 4
  strength = Math.min(100, Math.max(0, Math.round(strength)))

  const inhibitionCount = anyCount + consoleCount
  const poisonCount = todoCount + deepNestedCount

  const hasHighStrength = strength >= 75 && hasStructure && hasTypes && tryCatchCount > 0
  const hasReaction = tryCatchCount > 0
  const hasAcceleration = asyncCount > 0 && exportCount > 0
  const hasNoInhibition = inhibitionCount === 0
  const hasEnzymatic = genericsCount > 0 && hasFunctions
  const hasNoPoison = poisonCount === 0
  const hasProperDosage = hasStructure && hasTypes && hasFunctions
  const hasNoOverdose = consoleCount === 0 && deepNestedCount === 0
  const hasSustaining = tryCatchCount > 0 && asyncCount > 0
  const hasNoSuppression = todoCount === 0 && deepNestedCount === 0

  let agent: CatalystMeasure['agent'] = 'poison'
  if (hasHighStrength && hasNoInhibition && hasNoPoison && hasSustaining) agent = 'philosopher-catalyst'
  else if (hasHighStrength && hasNoInhibition) agent = 'accelerator'
  else if (hasHighStrength) agent = 'enzyme'
  else if (hasProperDosage && hasReaction) agent = 'mild-agent'
  else if (strength > 30) agent = 'inhibitor'

  return {
    strength, agent, hasHighStrength, hasReaction, hasAcceleration,
    hasNoInhibition, hasEnzymatic, hasNoPoison, hasProperDosage,
    hasNoOverdose, hasSustaining, hasNoSuppression, inhibitionCount, poisonCount,
  }
}

// ─── Elixir Measurement ─────────────────────────────────────────────────────

/** @example measureElixir(content) returns elixir analysis */
export function measureElixir(content: string): ElixirMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
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
  if (hasStructure) quality += 10
  if (hasTypes) quality += 10
  if (hasFunctions) quality += 10
  if (tryCatchCount > 0) quality += 10
  if (jsdocCount > 0) quality += 8
  if (asyncCount > 0) quality += 5
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (todoCount === 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const toxicityCount = anyCount + consoleCount
  const corruptionCount = todoCount + deepNestedCount + commentedCodeCount

  const hasHighQuality = quality >= 75 && hasStructure && hasTypes && tryCatchCount > 0
  const hasHealing = tryCatchCount > 0
  const hasRestorative = asyncCount > 0 && tryCatchCount > 0
  const hasNoToxicity = toxicityCount === 0
  const hasBalanced = hasStructure && hasTypes && hasFunctions
  const hasNoSideEffects = consoleCount === 0 && deepNestedCount === 0
  const hasRejuvenating = jsdocCount > 0 && genericsCount > 0
  const hasNoSpoilage = todoCount === 0 && commentedCodeCount === 0
  const hasStrengthening = exportCount > 0 && importCount > 0
  const hasNoCorruption = corruptionCount === 0

  let grade: ElixirMeasure['grade'] = 'sludge'
  if (hasHighQuality && hasNoToxicity && hasNoCorruption && hasHealing) grade = 'elixir-of-life'
  else if (hasHighQuality && hasNoToxicity) grade = 'grand-elixir'
  else if (hasHighQuality) grade = 'minor-elixir'
  else if (hasBalanced && hasHealing) grade = 'potion'
  else if (quality > 30) grade = 'brew'

  return {
    quality, grade, hasHighQuality, hasHealing, hasRestorative, hasNoToxicity,
    hasBalanced, hasNoSideEffects, hasRejuvenating, hasNoSpoilage,
    hasStrengthening, hasNoCorruption, toxicityCount, corruptionCount,
  }
}

// ─── Stone Measurement ──────────────────────────────────────────────────────

/** @example measureStone(content) returns stone analysis */
export function measureStone(content: string): StoneMeasure {
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
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let proximity = 20
  if (hasStructure) proximity += 10
  if (hasTypes) proximity += 10
  if (hasFunctions) proximity += 10
  if (tryCatchCount > 0) proximity += 8
  if (jsdocCount > 0) proximity += 8
  if (genericsCount > 0) proximity += 5
  if (asyncCount > 0) proximity += 5
  if (exportCount > 0) proximity += 5
  if (importCount > 0) proximity += 5
  if (anyCount === 0) proximity += 5
  if (consoleCount === 0) proximity += 5
  if (todoCount === 0) proximity += 2
  if (deepNestedCount === 0) proximity += 2
  proximity = Math.min(100, Math.max(0, Math.round(proximity)))

  const baseMetalCount = anyCount + consoleCount
  const failedExperimentCount = todoCount + deepNestedCount

  const hasHighProximity = proximity >= 75 && hasStructure && hasTypes && tryCatchCount > 0
  const hasGold = hasStructure && hasTypes && genericsCount > 0 && exportCount > 0
  const hasSilver = hasTypes && jsdocCount > 0
  const hasTransmutationReady = hasStructure && hasTypes && hasFunctions
  const hasNoBaseMetal = baseMetalCount === 0
  const hasOpus = hasStructure && hasTypes && genericsCount > 0 && tryCatchCount > 0
  const hasNoFailedExperiment = failedExperimentCount === 0
  const hasIlluminated = jsdocCount > 0 && genericsCount > 0
  const hasNoShadow = consoleCount === 0 && deepNestedCount === 0
  const hasProjection = exportCount > 0 && importCount > 0 && genericsCount > 0

  let stage: StoneMeasure['stage'] = 'void'
  if (hasHighProximity && hasNoBaseMetal && hasNoFailedExperiment && hasOpus) stage = 'lapis-philosophorum'
  else if (hasHighProximity && hasNoBaseMetal) stage = 'rubedo'
  else if (hasHighProximity) stage = 'albedo'
  else if (hasTransmutationReady && hasProjection) stage = 'nigredo'
  else if (proximity > 30) stage = 'prima-materia'

  return {
    proximity, stage, hasHighProximity, hasGold, hasSilver,
    hasTransmutationReady, hasNoBaseMetal, hasOpus, hasNoFailedExperiment,
    hasIlluminated, hasNoShadow, hasProjection, baseMetalCount, failedExperimentCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(sample) returns condition string */
export function classifyCondition(sample: AlchemicalSample): AlchemicalSample['condition'] {
  const { qualityScore } = sample
  if (qualityScore >= 80) return 'philosopher-stone'
  if (qualityScore >= 65) return 'aurum-potabile'
  if (qualityScore >= 50) return 'grand-elixir'
  if (qualityScore >= 35) return 'work-in-progress'
  if (qualityScore >= 20) return 'base-metal'
  return 'slag'
}

// ─── Sample Analysis ────────────────────────────────────────────────────────

/** @example analyzeAlchemicalSample(content, filePath) returns full sample */
export function analyzeAlchemicalSample(content: string, filePath: string): AlchemicalSample {
  const transmutation = measureTransmutation(content)
  const purification = measurePurification(content)
  const essence = measureEssence(content)
  const catalyst = measureCatalyst(content)
  const elixir = measureElixir(content)
  const stone = measureStone(content)

  const transmutationQuality = transmutation.quality
  const purificationLevel = purification.level
  const essencePotency = essence.potency
  const catalystStrength = catalyst.strength
  const elixirQuality = elixir.quality
  const stoneProximity = stone.proximity

  const qualityScore = Math.round(
    transmutationQuality * 0.15 +
    purificationLevel * 0.15 +
    essencePotency * 0.15 +
    catalystStrength * 0.2 +
    elixirQuality * 0.15 +
    stoneProximity * 0.2,
  )

  const result: AlchemicalSample = {
    file: filePath,
    transmutationQuality, purificationLevel, essencePotency,
    catalystStrength, elixirQuality, stoneProximity,
    transmutation, purification, essence, catalyst, elixir, stone,
    condition: 'slag',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Bench Analysis ─────────────────────────────────────────────────────────

/** @example analyzeLaboratoryBench(samples, dirPath) returns bench */
export function analyzeLaboratoryBench(samples: AlchemicalSample[], dirPath: string): LaboratoryBench {
  if (samples.length === 0) {
    return {
      directory: dirPath, samples: [], avgTransmutation: 0, avgPurification: 0,
      avgStoneProximity: 0, philosopherCount: 0, slagCount: 0, aurumCount: 0,
      pureCount: 0, benchType: 'dungeon', condition: 'abandoned',
    }
  }

  const avgTransmutation = Math.round(samples.reduce((s, p) => s + p.transmutationQuality, 0) / samples.length)
  const avgPurification = Math.round(samples.reduce((s, p) => s + p.purificationLevel, 0) / samples.length)
  const avgStoneProximity = Math.round(samples.reduce((s, p) => s + p.stoneProximity, 0) / samples.length)

  const philosopherCount = samples.filter((s) => s.condition === 'philosopher-stone').length
  const slagCount = samples.filter((s) => s.condition === 'slag').length
  const aurumCount = samples.filter((s) => s.transmutation.element === 'aurum').length
  const pureCount = samples.filter((s) => s.purification.hasHighLevel).length

  const benchType = classifyBenchType(samples)
  const avgScore = samples.reduce((s, p) => s + p.qualityScore, 0) / samples.length
  const condition = classifyBenchCondition(avgScore)

  return {
    directory: dirPath, samples, avgTransmutation, avgPurification,
    avgStoneProximity, philosopherCount, slagCount, aurumCount, pureCount,
    benchType, condition,
  }
}

// ─── Bench Classification ───────────────────────────────────────────────────

/** @example classifyBenchType(samples) returns bench type */
export function classifyBenchType(samples: AlchemicalSample[]): LaboratoryBench['benchType'] {
  if (samples.length === 0) return 'dungeon'
  const avgScore = samples.reduce((s, p) => s + p.qualityScore, 0) / samples.length
  const philosopherCnt = samples.filter((s) => s.condition === 'philosopher-stone').length
  if (avgScore >= 75 && philosopherCnt >= Math.ceil(samples.length * 0.3)) return 'grand-laboratory'
  if (avgScore >= 60) return 'alchemist-study'
  if (avgScore >= 45) return 'workshop'
  if (avgScore >= 30) return 'apothecary'
  if (avgScore >= 15) return 'closet'
  return 'dungeon'
}

/** @example classifyBenchCondition(avgScore) returns condition */
export function classifyBenchCondition(avgScore: number): LaboratoryBench['condition'] {
  if (avgScore >= 80) return 'master-atelier'
  if (avgScore >= 65) return 'skilled-lab'
  if (avgScore >= 50) return 'apprentice-bench'
  if (avgScore >= 35) return 'amateur-setup'
  if (avgScore >= 20) return 'ruined-lab'
  return 'abandoned'
}

/** @example classifyAlchemistGrade(avgAlchemy) returns grade */
export function classifyAlchemistGrade(avgAlchemy: number): AlchemistLabResult['stats']['alchemistGrade'] {
  if (avgAlchemy >= 80) return 'grand-master'
  if (avgAlchemy >= 65) return 'master-alchemist'
  if (avgAlchemy >= 50) return 'adept'
  if (avgAlchemy >= 35) return 'apprentice'
  if (avgAlchemy >= 20) return 'novice'
  return 'charlatan'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(samples, benches, laboratory, stats) returns recommendations */
export function generateRecommendations(
  samples: AlchemicalSample[],
  benches: LaboratoryBench[],
  laboratory: AlchemistLabResult['laboratory'],
  stats: AlchemistLabResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgTransmutationQuality < 50) recs.push('Improve transmutation — increase code transformability')
  if (stats.avgPurificationLevel < 50) recs.push('Purify your code — remove impurities and contaminants')
  if (stats.avgEssencePotency < 50) recs.push('Strengthen essence — concentrate code core value')
  if (stats.avgCatalystStrength < 50) recs.push('Boost catalyst — add error handling and acceleration')
  if (stats.avgElixirQuality < 50) recs.push('Refine elixir — improve code health and resilience')
  if (stats.avgStoneProximity < 50) recs.push('Approach the stone — bring code closer to perfection')
  if (stats.slagCount > samples.length * 0.5) recs.push('Too much slag — over half the codebase is unrefined')
  if (stats.hasHighProximityCount === 0) recs.push('No philosopher samples found — transmute with patience')
  if (benches.length > 0 && laboratory.overallAlchemy < 60) recs.push('Overall alchemy is weak — consult the grand master')
  if (recs.length === 0) recs.push('Philosopher\'s stone achieved — your code has reached perfection')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildAlchemistLabResult(files, contents, options) returns full result */
export function buildAlchemistLabResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): AlchemistLabResult {
  const samples: AlchemicalSample[] = files.map((file, i) =>
    analyzeAlchemicalSample(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AlchemicalSample[]>()
  for (const sample of samples) {
    const dir = sample.file.includes('/')
      ? sample.file.substring(0, sample.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(sample)
    } else {
      dirMap.set(dir, [sample])
    }
  }

  const benches: LaboratoryBench[] = Array.from(dirMap.entries()).map(([dir, dirSamples]) =>
    analyzeLaboratoryBench(dirSamples, dir),
  )

  const avgTransmutation = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.transmutationQuality, 0) / samples.length)
    : 0
  const avgPurification = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.purificationLevel, 0) / samples.length)
    : 0
  const avgStoneProximity = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.stoneProximity, 0) / samples.length)
    : 0
  const overallAlchemy = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.qualityScore, 0) / samples.length)
    : 0
  const isGolden = overallAlchemy >= 65

  const laboratory: AlchemistLabResult['laboratory'] = {
    avgTransmutation, avgPurification, avgStoneProximity, isGolden, overallAlchemy,
  }

  const avgTransmutationQuality = avgTransmutation
  const avgPurificationLevel = avgPurification
  const avgEssencePotency = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.essencePotency, 0) / samples.length)
    : 0
  const avgCatalystStrength = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.catalystStrength, 0) / samples.length)
    : 0
  const avgElixirQuality = samples.length > 0
    ? Math.round(samples.reduce((s, p) => s + p.elixirQuality, 0) / samples.length)
    : 0
  const avgStoneProximityStat = avgStoneProximity

  const conditionCounts = {
    philosopherStone: 0, aurumPotabile: 0, grandElixir: 0,
    workInProgress: 0, baseMetal: 0, slag: 0,
  }
  for (const s of samples) {
    switch (s.condition) {
      case 'philosopher-stone': conditionCounts.philosopherStone++; break
      case 'aurum-potabile': conditionCounts.aurumPotabile++; break
      case 'grand-elixir': conditionCounts.grandElixir++; break
      case 'work-in-progress': conditionCounts.workInProgress++; break
      case 'base-metal': conditionCounts.baseMetal++; break
      case 'slag': conditionCounts.slag++; break
    }
  }

  const hasHighTransmutationCount = samples.filter((s) => s.transmutation.hasHighQuality).length
  const hasHighPurificationCount = samples.filter((s) => s.purification.hasHighLevel).length
  const hasHighPotencyCount = samples.filter((s) => s.essence.hasHighPotency).length
  const hasHighCatalystCount = samples.filter((s) => s.catalyst.hasHighStrength).length
  const hasHighElixirCount = samples.filter((s) => s.elixir.hasHighQuality).length
  const hasHighProximityCount = samples.filter((s) => s.stone.hasHighProximity).length

  const bestSample = samples.length > 0
    ? samples.reduce((best, s) => s.qualityScore > best.qualityScore ? s : best).file
    : ''
  const bestTransmuter = samples.length > 0
    ? samples.reduce((best, s) => s.transmutationQuality > best.transmutationQuality ? s : best).file
    : ''
  const purest = samples.length > 0
    ? samples.reduce((best, s) => s.purificationLevel > best.purificationLevel ? s : best).file
    : ''
  const mostPotent = samples.length > 0
    ? samples.reduce((best, s) => s.essencePotency > best.essencePotency ? s : best).file
    : ''
  const strongestCatalyst = samples.length > 0
    ? samples.reduce((best, s) => s.catalystStrength > best.catalystStrength ? s : best).file
    : ''
  const closestToStone = samples.length > 0
    ? samples.reduce((best, s) => s.stoneProximity > best.stoneProximity ? s : best).file
    : ''

  const alchemistGrade = classifyAlchemistGrade(overallAlchemy)

  const stats: AlchemistLabResult['stats'] = {
    totalFiles: files.length, totalBenches: benches.length,
    avgTransmutationQuality, avgPurificationLevel, avgEssencePotency,
    avgCatalystStrength, avgElixirQuality, avgStoneProximity: avgStoneProximityStat,
    philosopherStoneCount: conditionCounts.philosopherStone,
    aurumPotabileCount: conditionCounts.aurumPotabile,
    grandElixirCount: conditionCounts.grandElixir,
    workInProgressCount: conditionCounts.workInProgress,
    baseMetalCount: conditionCounts.baseMetal,
    slagCount: conditionCounts.slag,
    hasHighTransmutationCount, hasHighPurificationCount, hasHighPotencyCount,
    hasHighCatalystCount, hasHighElixirCount, hasHighProximityCount,
    overallAlchemy, alchemistGrade,
    bestSample, bestTransmuter, purest, mostPotent, strongestCatalyst, closestToStone,
  }

  const recommendations = generateRecommendations(samples, benches, laboratory, stats)

  return { samples, benches, laboratory, stats, recommendations }
}
