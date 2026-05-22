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

export interface VitalityMeasure {
  level: number
  species: 'sphagnum' | 'polytrichum' | 'bryum' | 'hypnum' | 'ceratodon' | 'dust'
  hasHighVitality: boolean
  hasProperGrowth: boolean
  hasProperColoration: boolean
  hasNoBrowning: boolean
  hasProperHydration: boolean
  hasProperStructure: boolean
  hasNoDieback: boolean
  hasClonalGrowth: boolean
  hasProperColony: boolean
  hasNoInvasion: boolean
  browningCount: number
  diebackCount: number
}

export interface RhizoidMeasure {
  depth: number
  type: 'deep-penetration' | 'extensive' | 'moderate' | 'shallow' | 'surface' | 'absent'
  hasDeepRoots: boolean
  hasProperAnchorage: boolean
  hasNoUprooting: boolean
  hasNutrientAbsorption: boolean
  hasNoRootRot: boolean
  hasCapillaryAction: boolean
  hasProperSubstrate: boolean
  hasNoErosion: boolean
  hasStableAttachment: boolean
  hasNoDisplacement: boolean
  rootRotCount: number
  erosionCount: number
}

export interface CushionMeasure {
  density: number
  form: 'dense-mound' | 'cushion' | 'mat' | 'feathery' | 'stringy' | 'patchy'
  hasProperDensity: boolean
  hasUniformGrowth: boolean
  hasNoGap: boolean
  hasProperLayering: boolean
  hasInterwoven: boolean
  hasNoThinning: boolean
  hasProperCompactness: boolean
  hasNoOvergrowth: boolean
  hasResilientForm: boolean
  hasNoBarePatches: boolean
  gapCount: number
  barePatchCount: number
}

export interface SporophyteMeasure {
  maturity: number
  stage: 'spore-release' | 'mature-capsule' | 'developing' | 'embryo' | 'spore' | 'infertile'
  isMature: boolean
  hasProperDevelopment: boolean
  hasSporeProduction: boolean
  hasProperDispersal: boolean
  hasNoPremature: boolean
  hasProperCapsule: boolean
  hasNoAbortion: boolean
  hasGermination: boolean
  hasProperCycle: boolean
  hasNoSterility: boolean
  prematureCount: number
  abortionCount: number
}

export interface MoistureMeasure {
  retention: number
  state: 'saturated' | 'moist' | 'damp' | 'dry' | 'desiccated' | 'fossilized'
  hasProperRetention: boolean
  hasGoodHydration: boolean
  hasNoDesiccation: boolean
  hasProperDrainage: boolean
  hasNoWaterlogging: boolean
  hasCapillary: boolean
  hasNoRunoff: boolean
  hasProperHumidity: boolean
  hasNoDrought: boolean
  hasSelfRegulation: boolean
  desiccationCount: number
  waterloggingCount: number
}

export interface SerenityMeasure {
  score: number
  atmosphere: 'zen-garden' | 'temple-moss' | 'forest-floor' | 'rock-garden' | 'crack-in-sidewalk' | 'barren-rock'
  hasHighSerenity: boolean
  hasQuietBeauty: boolean
  hasNoNoise: boolean
  hasPatience: boolean
  hasProperContemplation: boolean
  hasNoChaos: boolean
  hasHarmony: boolean
  hasProperRestraint: boolean
  hasNoOveractivity: boolean
  hasTimelessness: boolean
  noiseCount: number
  chaosCount: number
}

export interface MossCushion {
  file: string
  growthVitality: number
  rhizoidDepth: number
  cushionDensity: number
  sporophyteMaturity: number
  moistureRetention: number
  gardenSerenity: number
  vitality: VitalityMeasure
  rhizoid: RhizoidMeasure
  cushion: CushionMeasure
  sporophyte: SporophyteMeasure
  moisture: MoistureMeasure
  serenity: SerenityMeasure
  condition: 'kyoto-garden' | 'temple-moss' | 'zen-garden' | 'forest-floor' | 'crack-moss' | 'dust'
  qualityScore: number
}

export interface MossColony {
  directory: string
  cushions: MossCushion[]
  avgVitality: number
  avgDepth: number
  avgSerenity: number
  kyotoCount: number
  dustCount: number
  vitalCount: number
  sereneCount: number
  colonyType: 'sacred-garden' | 'temple-grounds' | 'forest-moss' | 'rock-garden' | 'pavement-moss' | 'barren'
  condition: 'world-heritage' | 'national-garden' | 'monastery-garden' | 'courtyard' | 'alley' | 'parking-lot'
}

export interface MossGardenResult {
  cushions: MossCushion[]
  colonies: MossColony[]
  landscape: {
    avgVitality: number
    avgDepth: number
    avgSerenity: number
    isSerene: boolean
    overallSerenity: number
  }
  stats: {
    totalFiles: number
    totalColonies: number
    avgGrowthVitality: number
    avgRhizoidDepth: number
    avgCushionDensity: number
    avgSporophyteMaturity: number
    avgMoistureRetention: number
    avgGardenSerenity: number
    kyotoGardenCount: number
    templeMossCount: number
    zenGardenCount: number
    forestFloorCount: number
    crackMossCount: number
    dustCount: number
    hasHighVitalityCount: number
    hasDeepRootsCount: number
    hasProperDensityCount: number
    isMatureCount: number
    hasProperRetentionCount: number
    hasHighSerenityCount: number
    overallSerenity: number
    gardenerGrade: 'zen-master' | 'master-gardener' | 'gardener' | 'groundskeeper' | 'amateur' | 'concrete-paver'
    bestCushion: string
    mostVital: string
    deepestRooted: string
    densest: string
    mostMature: string
    mostSerene: string
  }
  recommendations: string[]
}

// ─── Vitality Measurement ───────────────────────────────────────────────────

/** @example measureVitality(content) returns vitality analysis */
export function measureVitality(content: string): VitalityMeasure {
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

  const browningCount = anyCount + todoCount
  const diebackCount = deepNestedCount + commentedCodeCount

  const hasHighVitality = level >= 80 && hasStructure && hasTypes
  const hasProperGrowth = hasStructure && hasTypes && exportCount > 0
  const hasProperColoration = hasStructure && hasTypes && hasFunctions
  const hasNoBrowning = browningCount === 0
  const hasProperHydration = hasFunctions && consoleCount === 0
  const hasProperStructure = hasStructure && hasTypes && hasFunctions
  const hasNoDieback = diebackCount === 0
  const hasClonalGrowth = hasStructure && hasTypes && genericsCount_safe(content) > 0
  const hasProperColony = hasStructure && hasTypes && exportCount > 0
  const hasNoInvasion = todoCount === 0 && commentedCodeCount === 0

  let species: VitalityMeasure['species'] = 'dust'
  if (hasHighVitality && hasNoBrowning && hasNoDieback && hasProperColony) species = 'sphagnum'
  else if (hasHighVitality && hasNoBrowning) species = 'polytrichum'
  else if (hasHighVitality) species = 'bryum'
  else if (hasProperStructure && hasProperGrowth) species = 'hypnum'
  else if (level > 30) species = 'ceratodon'

  return {
    level, species, hasHighVitality, hasProperGrowth, hasProperColoration,
    hasNoBrowning, hasProperHydration, hasProperStructure, hasNoDieback,
    hasClonalGrowth, hasProperColony, hasNoInvasion, browningCount, diebackCount,
  }
}

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }

// ─── Rhizoid Measurement ────────────────────────────────────────────────────

/** @example measureRhizoid(content) returns rhizoid analysis */
export function measureRhizoid(content: string): RhizoidMeasure {
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

  let depth = 25
  if (hasStructure) depth += 12
  if (hasTypes) depth += 12
  if (hasFunctions) depth += 10
  if (jsdocCount > 0) depth += 8
  if (genericsCount > 0) depth += 5
  if (exportCount > 0) depth += 5
  if (importCount > 0) depth += 5
  if (tryCatchCount > 0) depth += 5
  if (asyncCount > 0) depth += 3
  if (consoleCount === 0) depth += 4
  if (anyCount === 0) depth += 3
  if (deepNestedCount === 0) depth += 3
  depth = Math.min(100, Math.max(0, Math.round(depth)))

  const rootRotCount = anyCount + todoCount
  const erosionCount = deepNestedCount

  const hasDeepRoots = depth >= 80 && hasStructure && hasTypes
  const hasProperAnchorage = hasStructure && hasTypes && exportCount > 0
  const hasNoUprooting = exportCount > 0
  const hasNutrientAbsorption = hasStructure && hasTypes && genericsCount > 0
  const hasNoRootRot = rootRotCount === 0
  const hasCapillaryAction = hasStructure && hasTypes && hasFunctions
  const hasProperSubstrate = hasStructure && hasTypes && importCount > 0
  const hasNoErosion = erosionCount === 0
  const hasStableAttachment = hasStructure && hasTypes && hasFunctions
  const hasNoDisplacement = consoleCount === 0

  let rhizoidType: RhizoidMeasure['type'] = 'absent'
  if (hasDeepRoots && hasNoRootRot && hasNoErosion && hasNutrientAbsorption) rhizoidType = 'deep-penetration'
  else if (hasDeepRoots && hasNoRootRot) rhizoidType = 'extensive'
  else if (hasDeepRoots) rhizoidType = 'moderate'
  else if (hasProperAnchorage && hasCapillaryAction) rhizoidType = 'shallow'
  else if (depth > 30) rhizoidType = 'surface'

  return {
    depth, type: rhizoidType, hasDeepRoots, hasProperAnchorage, hasNoUprooting,
    hasNutrientAbsorption, hasNoRootRot, hasCapillaryAction, hasProperSubstrate,
    hasNoErosion, hasStableAttachment, hasNoDisplacement, rootRotCount, erosionCount,
  }
}

// ─── Cushion Measurement ────────────────────────────────────────────────────

/** @example measureCushion(content) returns cushion analysis */
export function measureCushion(content: string): CushionMeasure {
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
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let density = 20
  if (hasStructure) density += 12
  if (hasTypes) density += 12
  if (hasFunctions) density += 10
  if (jsdocCount > 0) density += 10
  if (exportCount > 0) density += 10
  if (importCount > 0) density += 5
  if (anyCount === 0) density += 5
  if (consoleCount === 0) density += 4
  if (tryCatchCount > 0) density += 4
  if (privateCount === 0 && protectedCount === 0) density += 3
  if (commentedCodeCount === 0) density += 5
  density = Math.min(100, Math.max(0, Math.round(density)))

  const gapCount = privateCount + protectedCount
  const barePatchCount = anyCount + consoleCount

  const hasProperDensity = density >= 75 && hasStructure && hasTypes
  const hasUniformGrowth = hasStructure && hasTypes && hasFunctions
  const hasNoGap = gapCount === 0
  const hasProperLayering = hasStructure && hasTypes && exportCount > 0
  const hasInterwoven = hasStructure && hasTypes && genericsCount > 0
  const hasNoThinning = commentedCodeCount === 0
  const hasProperCompactness = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoOvergrowth = gapCount === 0 && barePatchCount === 0
  const hasResilientForm = hasStructure && hasTypes && hasFunctions
  const hasNoBarePatches = barePatchCount === 0

  let form: CushionMeasure['form'] = 'patchy'
  if (hasProperDensity && hasNoGap && hasNoBarePatches && hasProperCompactness) form = 'dense-mound'
  else if (hasProperDensity && hasNoGap) form = 'cushion'
  else if (hasProperDensity) form = 'mat'
  else if (hasResilientForm && hasProperLayering) form = 'feathery'
  else if (density > 30) form = 'stringy'

  return {
    density, form, hasProperDensity, hasUniformGrowth, hasNoGap,
    hasProperLayering, hasInterwoven, hasNoThinning, hasProperCompactness,
    hasNoOvergrowth, hasResilientForm, hasNoBarePatches, gapCount, barePatchCount,
  }
}

// ─── Sporophyte Measurement ─────────────────────────────────────────────────

/** @example measureSporophyte(content) returns sporophyte analysis */
export function measureSporophyte(content: string): SporophyteMeasure {
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

  let maturity = 20
  if (hasStructure) maturity += 12
  if (hasTypes) maturity += 12
  if (hasFunctions) maturity += 10
  if (jsdocCount > 0) maturity += 10
  if (genericsCount > 0) maturity += 5
  if (enumCount > 0) maturity += 5
  if (anyCount === 0) maturity += 8
  if (consoleCount === 0) maturity += 5
  if (todoCount === 0) maturity += 5
  if (deepNestedCount === 0) maturity += 8
  maturity = Math.min(100, Math.max(0, Math.round(maturity)))

  const prematureCount = todoCount + commentedCodeCount
  const abortionCount = deepNestedCount + consoleCount

  const isMature = maturity >= 80 && hasStructure && hasTypes && anyCount === 0
  const hasProperDevelopment = hasStructure && hasTypes && hasFunctions
  const hasSporeProduction = exportCount > 0 && reExportCount_safe(content) > 0
  const hasProperDispersal = hasStructure && hasTypes && exportCount > 0
  const hasNoPremature = prematureCount === 0
  const hasProperCapsule = hasStructure && hasTypes && genericsCount > 0
  const hasNoAbortion = abortionCount === 0
  const hasGermination = asyncCount > 0 || tryCatchCount > 0
  const hasProperCycle = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoSterility = hasFunctions && exportCount > 0

  let stage: SporophyteMeasure['stage'] = 'infertile'
  if (isMature && hasNoPremature && hasNoAbortion && hasSporeProduction) stage = 'spore-release'
  else if (isMature && hasNoPremature) stage = 'mature-capsule'
  else if (isMature) stage = 'developing'
  else if (hasProperDevelopment && hasProperDispersal) stage = 'embryo'
  else if (maturity > 30) stage = 'spore'

  return {
    maturity, stage, isMature, hasProperDevelopment, hasSporeProduction,
    hasProperDispersal, hasNoPremature, hasProperCapsule, hasNoAbortion,
    hasGermination, hasProperCycle, hasNoSterility, prematureCount, abortionCount,
  }
}

function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }

// ─── Moisture Measurement ───────────────────────────────────────────────────

/** @example measureMoisture(content) returns moisture analysis */
export function measureMoisture(content: string): MoistureMeasure {
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
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let retention = 20
  if (hasStructure) retention += 12
  if (hasTypes) retention += 12
  if (hasFunctions) retention += 10
  if (jsdocCount > 0) retention += 10
  if (genericsCount > 0) retention += 5
  if (exportCount > 0) retention += 5
  if (importCount > 0) retention += 5
  if (asyncCount > 0) retention += 3
  if (tryCatchCount > 0) retention += 8
  if (anyCount === 0) retention += 5
  if (consoleCount === 0) retention += 5
  retention = Math.min(100, Math.max(0, Math.round(retention)))

  const desiccationCount = todoCount + deepNestedCount
  const waterloggingCount = anyCount + commentedCodeCount

  const hasProperRetention = retention >= 75 && hasStructure && hasTypes
  const hasGoodHydration = retention >= 60 && hasStructure && hasTypes
  const hasNoDesiccation = desiccationCount === 0
  const hasProperDrainage = hasStructure && hasTypes && hasFunctions
  const hasNoWaterlogging = waterloggingCount === 0
  const hasCapillary = hasStructure && hasTypes && genericsCount > 0
  const hasNoRunoff = consoleCount === 0
  const hasProperHumidity = jsdocCount > 0 && exportCount > 0
  const hasNoDrought = hasFunctions && exportCount > 0
  const hasSelfRegulation = tryCatchCount > 0 && asyncCount > 0

  let state: MoistureMeasure['state'] = 'fossilized'
  if (hasProperRetention && hasNoDesiccation && hasNoWaterlogging && hasSelfRegulation) state = 'saturated'
  else if (hasProperRetention && hasNoDesiccation) state = 'moist'
  else if (hasProperRetention) state = 'damp'
  else if (hasGoodHydration && hasProperDrainage) state = 'dry'
  else if (retention > 30) state = 'desiccated'

  return {
    retention, state, hasProperRetention, hasGoodHydration, hasNoDesiccation,
    hasProperDrainage, hasNoWaterlogging, hasCapillary, hasNoRunoff,
    hasProperHumidity, hasNoDrought, hasSelfRegulation, desiccationCount, waterloggingCount,
  }
}

// ─── Serenity Measurement ───────────────────────────────────────────────────

/** @example measureSerenity(content) returns serenity analysis */
export function measureSerenity(content: string): SerenityMeasure {
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

  let score = 25
  if (hasStructure) score += 12
  if (hasTypes) score += 12
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (reExportCount > 0) score += 5
  if (asyncCount > 0) score += 3
  if (tryCatchCount > 0) score += 5
  if (anyCount === 0) score += 3
  if (consoleCount === 0) score += 2
  score = Math.min(100, Math.max(0, Math.round(score)))

  const noiseCount = todoCount
  const chaosCount = deepNestedCount

  const hasHighSerenity = score >= 80 && hasStructure && hasTypes
  const hasQuietBeauty = jsdocCount > 0 && genericsCount > 0
  const hasNoNoise = noiseCount === 0
  const hasPatience = hasStructure && hasTypes && hasFunctions && todoCount === 0
  const hasProperContemplation = hasStructure && hasTypes && genericsCount > 0
  const hasNoChaos = deepNestedCount === 0
  const hasHarmony = hasStructure && hasTypes && hasFunctions && consoleCount === 0
  const hasProperRestraint = hasFunctions && exportCount > 0
  const hasNoOveractivity = deepNestedCount === 0 && consoleCount === 0
  const hasTimelessness = hasStructure && hasTypes && reExportCount > 0

  let atmosphere: SerenityMeasure['atmosphere'] = 'barren-rock'
  if (hasHighSerenity && hasNoNoise && hasNoChaos && hasTimelessness) atmosphere = 'zen-garden'
  else if (hasHighSerenity && hasNoNoise) atmosphere = 'temple-moss'
  else if (hasHighSerenity) atmosphere = 'forest-floor'
  else if (hasPatience && hasHarmony) atmosphere = 'rock-garden'
  else if (score > 30) atmosphere = 'crack-in-sidewalk'

  return {
    score, atmosphere, hasHighSerenity, hasQuietBeauty, hasNoNoise, hasPatience,
    hasProperContemplation, hasNoChaos, hasHarmony, hasProperRestraint,
    hasNoOveractivity, hasTimelessness, noiseCount, chaosCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(cushion) returns condition string */
export function classifyCondition(cushion: MossCushion): MossCushion['condition'] {
  const { qualityScore } = cushion
  if (qualityScore >= 80) return 'kyoto-garden'
  if (qualityScore >= 65) return 'temple-moss'
  if (qualityScore >= 50) return 'zen-garden'
  if (qualityScore >= 35) return 'forest-floor'
  if (qualityScore >= 20) return 'crack-moss'
  return 'dust'
}

// ─── Cushion Analysis ───────────────────────────────────────────────────────

/** @example analyzeMossCushion(content, filePath) returns full cushion */
export function analyzeMossCushion(content: string, filePath: string): MossCushion {
  const vitality = measureVitality(content)
  const rhizoid = measureRhizoid(content)
  const cushion = measureCushion(content)
  const sporophyte = measureSporophyte(content)
  const moisture = measureMoisture(content)
  const serenity = measureSerenity(content)

  const growthVitality = vitality.level
  const rhizoidDepth = rhizoid.depth
  const cushionDensity = cushion.density
  const sporophyteMaturity = sporophyte.maturity
  const moistureRetention = moisture.retention
  const gardenSerenity = serenity.score

  const qualityScore = Math.round(
    growthVitality * 0.15 +
    rhizoidDepth * 0.15 +
    cushionDensity * 0.15 +
    sporophyteMaturity * 0.2 +
    moistureRetention * 0.15 +
    gardenSerenity * 0.2,
  )

  const mossCushion: MossCushion = {
    file: filePath,
    growthVitality, rhizoidDepth, cushionDensity, sporophyteMaturity,
    moistureRetention, gardenSerenity,
    vitality, rhizoid, cushion, sporophyte, moisture, serenity,
    condition: 'dust',
    qualityScore,
  }

  mossCushion.condition = classifyCondition(mossCushion)

  return mossCushion
}

// ─── Colony Analysis ────────────────────────────────────────────────────────

/** @example analyzeMossColony(cushions, dirPath) returns colony */
export function analyzeMossColony(cushions: MossCushion[], dirPath: string): MossColony {
  if (cushions.length === 0) {
    return {
      directory: dirPath, cushions: [], avgVitality: 0, avgDepth: 0, avgSerenity: 0,
      kyotoCount: 0, dustCount: 0, vitalCount: 0, sereneCount: 0,
      colonyType: 'barren', condition: 'parking-lot',
    }
  }

  const avgVitality = Math.round(cushions.reduce((s, c) => s + c.growthVitality, 0) / cushions.length)
  const avgDepth = Math.round(cushions.reduce((s, c) => s + c.rhizoidDepth, 0) / cushions.length)
  const avgSerenity = Math.round(cushions.reduce((s, c) => s + c.gardenSerenity, 0) / cushions.length)

  const kyotoCount = cushions.filter((c) => c.condition === 'kyoto-garden').length
  const dustCount = cushions.filter((c) => c.condition === 'dust').length
  const vitalCount = cushions.filter((c) => c.vitality.hasHighVitality).length
  const sereneCount = cushions.filter((c) => c.serenity.hasHighSerenity).length

  const colonyType = classifyColonyType(cushions)
  const avgScore = cushions.reduce((s, c) => s + c.qualityScore, 0) / cushions.length
  const condition = classifyColonyCondition(avgScore)

  return {
    directory: dirPath, cushions, avgVitality, avgDepth, avgSerenity,
    kyotoCount, dustCount, vitalCount, sereneCount, colonyType, condition,
  }
}

// ─── Colony Classification ──────────────────────────────────────────────────

/** @example classifyColonyType(cushions) returns colony type */
export function classifyColonyType(cushions: MossCushion[]): MossColony['colonyType'] {
  if (cushions.length === 0) return 'barren'
  const avgScore = cushions.reduce((s, c) => s + c.qualityScore, 0) / cushions.length
  const kyotoCnt = cushions.filter((c) => c.condition === 'kyoto-garden').length
  if (avgScore >= 75 && kyotoCnt >= Math.ceil(cushions.length * 0.3)) return 'sacred-garden'
  if (avgScore >= 60) return 'temple-grounds'
  if (avgScore >= 45) return 'forest-moss'
  if (avgScore >= 30) return 'rock-garden'
  if (avgScore >= 15) return 'pavement-moss'
  return 'barren'
}

/** @example classifyColonyCondition(avgScore) returns condition */
export function classifyColonyCondition(avgScore: number): MossColony['condition'] {
  if (avgScore >= 80) return 'world-heritage'
  if (avgScore >= 65) return 'national-garden'
  if (avgScore >= 50) return 'monastery-garden'
  if (avgScore >= 35) return 'courtyard'
  if (avgScore >= 20) return 'alley'
  return 'parking-lot'
}

/** @example classifyGardenerGrade(avgSerenity) returns grade */
export function classifyGardenerGrade(avgSerenity: number): MossGardenResult['stats']['gardenerGrade'] {
  if (avgSerenity >= 80) return 'zen-master'
  if (avgSerenity >= 65) return 'master-gardener'
  if (avgSerenity >= 50) return 'gardener'
  if (avgSerenity >= 35) return 'groundskeeper'
  if (avgSerenity >= 20) return 'amateur'
  return 'concrete-paver'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(cushions, colonies, landscape, stats) returns recommendations */
export function generateRecommendations(
  cushions: MossCushion[],
  colonies: MossColony[],
  landscape: MossGardenResult['landscape'],
  stats: MossGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgGrowthVitality < 50) recs.push('Improve growth vitality — add more impactful code structures')
  if (stats.avgRhizoidDepth < 50) recs.push('Deepen rhizoid roots — strengthen code foundations with types')
  if (stats.avgCushionDensity < 50) recs.push('Increase cushion density — improve code density and organization')
  if (stats.avgSporophyteMaturity < 50) recs.push('Advance sporophyte maturity — evolve code toward production quality')
  if (stats.avgMoistureRetention < 50) recs.push('Improve moisture retention — enhance code maintainability and resilience')
  if (stats.avgGardenSerenity < 50) recs.push('Cultivate garden serenity — reduce noise and increase code harmony')
  if (stats.dustCount > cushions.length * 0.5) recs.push('Too much dust — over half the codebase is barren')
  if (stats.hasHighSerenityCount === 0) recs.push('No serene code found — cultivate patience and contemplation')
  if (colonies.length > 0 && landscape.overallSerenity < 60) recs.push('Garden serenity is low — patient cultivation recommended')
  if (recs.length === 0) recs.push('Zen garden mastery — your code grows with the patience of ancient moss')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildMossGardenResult(files, contents, options) returns full result */
export function buildMossGardenResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): MossGardenResult {
  const cushions: MossCushion[] = files.map((file, i) =>
    analyzeMossCushion(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, MossCushion[]>()
  for (const cushion of cushions) {
    const dir = cushion.file.includes('/')
      ? cushion.file.substring(0, cushion.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(cushion)
    } else {
      dirMap.set(dir, [cushion])
    }
  }

  const colonies: MossColony[] = Array.from(dirMap.entries()).map(([dir, dirCushions]) =>
    analyzeMossColony(dirCushions, dir),
  )

  const avgVitality = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.growthVitality, 0) / cushions.length)
    : 0
  const avgDepth = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.rhizoidDepth, 0) / cushions.length)
    : 0
  const avgSerenity = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.gardenSerenity, 0) / cushions.length)
    : 0
  const overallSerenity = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.qualityScore, 0) / cushions.length)
    : 0
  const isSerene = overallSerenity >= 65

  const landscape: MossGardenResult['landscape'] = {
    avgVitality, avgDepth, avgSerenity, isSerene, overallSerenity,
  }

  const avgGrowthVitality = avgVitality
  const avgRhizoidDepth = avgDepth
  const avgCushionDensity = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.cushionDensity, 0) / cushions.length)
    : 0
  const avgSporophyteMaturity = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.sporophyteMaturity, 0) / cushions.length)
    : 0
  const avgMoistureRetention = cushions.length > 0
    ? Math.round(cushions.reduce((s, c) => s + c.moistureRetention, 0) / cushions.length)
    : 0
  const avgGardenSerenity = avgSerenity

  const conditionCounts = {
    kyoto: 0, temple: 0, zen: 0, forest: 0, crack: 0, dustCnt: 0,
  }
  for (const c of cushions) {
    switch (c.condition) {
      case 'kyoto-garden': conditionCounts.kyoto++; break
      case 'temple-moss': conditionCounts.temple++; break
      case 'zen-garden': conditionCounts.zen++; break
      case 'forest-floor': conditionCounts.forest++; break
      case 'crack-moss': conditionCounts.crack++; break
      case 'dust': conditionCounts.dustCnt++; break
    }
  }

  const hasHighVitalityCount = cushions.filter((c) => c.vitality.hasHighVitality).length
  const hasDeepRootsCount = cushions.filter((c) => c.rhizoid.hasDeepRoots).length
  const hasProperDensityCount = cushions.filter((c) => c.cushion.hasProperDensity).length
  const isMatureCount = cushions.filter((c) => c.sporophyte.isMature).length
  const hasProperRetentionCount = cushions.filter((c) => c.moisture.hasProperRetention).length
  const hasHighSerenityCount = cushions.filter((c) => c.serenity.hasHighSerenity).length

  const bestCushion = cushions.length > 0
    ? cushions.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file
    : ''
  const mostVital = cushions.length > 0
    ? cushions.reduce((best, c) => c.growthVitality > best.growthVitality ? c : best).file
    : ''
  const deepestRooted = cushions.length > 0
    ? cushions.reduce((best, c) => c.rhizoidDepth > best.rhizoidDepth ? c : best).file
    : ''
  const densest = cushions.length > 0
    ? cushions.reduce((best, c) => c.cushionDensity > best.cushionDensity ? c : best).file
    : ''
  const mostMature = cushions.length > 0
    ? cushions.reduce((best, c) => c.sporophyteMaturity > best.sporophyteMaturity ? c : best).file
    : ''
  const mostSerene = cushions.length > 0
    ? cushions.reduce((best, c) => c.gardenSerenity > best.gardenSerenity ? c : best).file
    : ''

  const gardenerGrade = classifyGardenerGrade(overallSerenity)

  const stats: MossGardenResult['stats'] = {
    totalFiles: files.length, totalColonies: colonies.length,
    avgGrowthVitality, avgRhizoidDepth, avgCushionDensity,
    avgSporophyteMaturity, avgMoistureRetention, avgGardenSerenity,
    kyotoGardenCount: conditionCounts.kyoto, templeMossCount: conditionCounts.temple,
    zenGardenCount: conditionCounts.zen, forestFloorCount: conditionCounts.forest,
    crackMossCount: conditionCounts.crack, dustCount: conditionCounts.dustCnt,
    hasHighVitalityCount, hasDeepRootsCount, hasProperDensityCount,
    isMatureCount, hasProperRetentionCount, hasHighSerenityCount,
    overallSerenity, gardenerGrade,
    bestCushion, mostVital, deepestRooted, densest, mostMature, mostSerene,
  }

  const recommendations = generateRecommendations(cushions, colonies, landscape, stats)

  return { cushions, colonies, landscape, stats, recommendations }
}
