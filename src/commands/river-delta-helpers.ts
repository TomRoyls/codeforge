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

export interface UpstreamMeasure {
  force: number
  current: 'torrent' | 'rapid' | 'moderate' | 'gentle' | 'sluggish' | 'stagnant'
  hasHighForce: boolean
  hasHeadwater: boolean
  hasSteadyFlow: boolean
  hasNoFlooding: boolean
  hasProperGradient: boolean
  hasNoDrought: boolean
  hasKinetic: boolean
  hasNoWhirlpool: boolean
  hasCleanSource: boolean
  hasNoContamination: boolean
  floodingCount: number
  whirlpoolCount: number
}

export interface ChannelMeasure {
  clarity: number
  state: 'crystal' | 'clear' | 'murky' | 'turbid' | 'muddy' | 'polluted'
  hasHighClarity: boolean
  hasDirectPath: boolean
  hasNoMeandering: boolean
  hasProperWidth: boolean
  hasNoBlockage: boolean
  hasSmoothFlow: boolean
  hasNoEddies: boolean
  hasProperDepth: boolean
  hasNavigable: boolean
  hasNoUndercurrent: boolean
  blockageCount: number
  eddyCount: number
}

export interface SedimentMeasure {
  richness: number
  quality: 'alluvial-gold' | 'rich-silt' | 'sand' | 'gravel' | 'clay' | 'bedrock'
  hasRichSediment: boolean
  hasAlluvial: boolean
  hasProperStrata: boolean
  hasNoContamination: boolean
  hasNutrientRich: boolean
  hasNoToxins: boolean
  hasProperDeposition: boolean
  hasNoErosion: boolean
  hasFertileGround: boolean
  hasNoSalinization: boolean
  toxinCount: number
  erosionCount: number
}

export interface DistributaryMeasure {
  reach: number
  network: 'mega-delta' | 'large-delta' | 'medium-delta' | 'small-delta' | 'creek' | 'trickle'
  hasHighReach: boolean
  hasProperChannels: boolean
  hasBalanced: boolean
  hasNoBottleneck: boolean
  hasEvenFlow: boolean
  hasNoDead: boolean
  hasProperBranching: boolean
  hasNoConfluence: boolean
  hasWideReach: boolean
  hasNoIsolation: boolean
  bottleneckCount: number
  deadChannelCount: number
}

export interface FertilityMeasure {
  level: number
  zone: 'fertile-crescent' | 'rich-farmland' | 'meadow' | 'scrubland' | 'desert' | 'wasteland'
  hasHighFertility: boolean
  hasYield: boolean
  hasProperCropping: boolean
  hasNoDepletion: boolean
  hasAbundant: boolean
  hasNoOveruse: boolean
  hasRegenerative: boolean
  hasNoMonoculture: boolean
  hasSustainable: boolean
  hasNoExhaustion: boolean
  depletionCount: number
  monocultureCount: number
}

export interface ErosionMeasure {
  resistance: number
  strength: 'granite' | 'limestone' | 'sandstone' | 'shale' | 'loose-soil' | 'quicksand'
  hasHighResistance: boolean
  hasSolidBank: boolean
  hasNoUndercutting: boolean
  hasProperReinforcement: boolean
  hasVegetation: boolean
  hasNoLandslide: boolean
  hasStable: boolean
  hasNoScouring: boolean
  hasArmored: boolean
  hasNoBreaching: boolean
  landslideCount: number
  scouringCount: number
}

export interface SedimentLayer {
  file: string
  upstreamForce: number
  channelClarity: number
  sedimentRichness: number
  distributaryReach: number
  deltaFertility: number
  erosionResistance: number
  upstream: UpstreamMeasure
  channel: ChannelMeasure
  sediment: SedimentMeasure
  distributary: DistributaryMeasure
  fertility: FertilityMeasure
  erosion: ErosionMeasure
  condition: 'fertile-estuary' | 'healthy-delta' | 'developing' | 'eroding' | 'barren' | 'dead-river'
  qualityScore: number
}

export interface DeltaRegion {
  directory: string
  layers: SedimentLayer[]
  avgForce: number
  avgClarity: number
  avgFertility: number
  fertileCount: number
  barrenCount: number
  highForceCount: number
  clearCount: number
  regionType: 'mega-delta' | 'river-mouth' | 'estuary' | 'creek' | 'ditch' | 'dry-bed'
  condition: 'lush-wetland' | 'fertile-plain' | 'developing-marsh' | 'barren-shore' | 'salt-flat' | 'desert'
}

export interface RiverDeltaResult {
  layers: SedimentLayer[]
  regions: DeltaRegion[]
  basin: {
    avgForce: number
    avgClarity: number
    avgFertility: number
    isFertile: boolean
    overallFertility: number
  }
  stats: {
    totalFiles: number
    totalRegions: number
    avgUpstreamForce: number
    avgChannelClarity: number
    avgSedimentRichness: number
    avgDistributaryReach: number
    avgDeltaFertility: number
    avgErosionResistance: number
    fertileEstuaryCount: number
    healthyDeltaCount: number
    developingCount: number
    erodingCount: number
    barrenCount: number
    deadRiverCount: number
    hasHighForceCount: number
    hasHighClarityCount: number
    hasRichSedimentCount: number
    hasHighReachCount: number
    hasHighFertilityCount: number
    hasHighResistanceCount: number
    overallFertility: number
    stewardGrade: 'master-steward' | 'riverkeeper' | 'warden' | 'guard' | 'watchman' | 'absentee'
    bestLayer: string
    mostForceful: string
    clearest: string
    richest: string
    widestReach: string
    mostFertile: string
  }
  recommendations: string[]
}

// ─── Upstream Measurement ───────────────────────────────────────────────────

/** @example measureUpstream(content) returns upstream analysis */
export function measureUpstream(content: string): UpstreamMeasure {
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

  let force = 20
  if (hasStructure) force += 12
  if (hasTypes) force += 12
  if (hasFunctions) force += 10
  if (jsdocCount > 0) force += 8
  if (tryCatchCount > 0) force += 8
  if (genericsCount > 0) force += 5
  if (exportCount > 0) force += 5
  if (importCount > 0) force += 5
  if (asyncCount > 0) force += 5
  if (anyCount === 0) force += 5
  if (consoleCount === 0) force += 5
  force = Math.min(100, Math.max(0, Math.round(force)))

  const floodingCount = consoleCount + anyCount
  const whirlpoolCount = deepNestedCount

  const hasHighForce = force >= 75 && hasStructure && hasTypes
  const hasHeadwater = hasStructure && hasTypes && hasFunctions
  const hasSteadyFlow = tryCatchCount > 0 && asyncCount > 0
  const hasNoFlooding = floodingCount === 0
  const hasProperGradient = hasStructure && hasTypes && genericsCount > 0
  const hasNoDrought = hasFunctions && exportCount > 0
  const hasKinetic = asyncCount > 0 && exportCount > 0
  const hasNoWhirlpool = whirlpoolCount === 0
  const hasCleanSource = anyCount === 0 && deepNestedCount === 0
  const hasNoContamination = consoleCount === 0 && deepNestedCount === 0

  let current: UpstreamMeasure['current'] = 'stagnant'
  if (hasHighForce && hasNoFlooding && hasNoWhirlpool && hasSteadyFlow) current = 'torrent'
  else if (hasHighForce && hasNoFlooding) current = 'rapid'
  else if (hasHighForce) current = 'moderate'
  else if (hasHeadwater && hasNoDrought) current = 'gentle'
  else if (force > 30) current = 'sluggish'

  return {
    force, current, hasHighForce, hasHeadwater, hasSteadyFlow, hasNoFlooding,
    hasProperGradient, hasNoDrought, hasKinetic, hasNoWhirlpool, hasCleanSource,
    hasNoContamination, floodingCount, whirlpoolCount,
  }
}

// ─── Channel Measurement ────────────────────────────────────────────────────

/** @example measureChannel(content) returns channel analysis */
export function measureChannel(content: string): ChannelMeasure {
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

  let clarity = 20
  if (hasStructure) clarity += 12
  if (hasTypes) clarity += 12
  if (hasFunctions) clarity += 10
  if (jsdocCount > 0) clarity += 10
  if (exportCount > 0) clarity += 8
  if (importCount > 0) clarity += 5
  if (genericsCount > 0) clarity += 5
  if (anyCount === 0) clarity += 5
  if (consoleCount === 0) clarity += 5
  if (deepNestedCount === 0) clarity += 5
  if (privateCount === 0) clarity += 3
  clarity = Math.min(100, Math.max(0, Math.round(clarity)))

  const blockageCount = consoleCount + anyCount
  const eddyCount = deepNestedCount

  const hasHighClarity = clarity >= 75 && hasStructure && hasTypes
  const hasDirectPath = hasFunctions && exportCount > 0
  const hasNoMeandering = deepNestedCount === 0
  const hasProperWidth = hasStructure && hasTypes && hasFunctions
  const hasNoBlockage = blockageCount === 0
  const hasSmoothFlow = hasStructure && hasTypes && jsdocCount > 0
  const hasNoEddies = eddyCount === 0
  const hasProperDepth = hasStructure && hasTypes && genericsCount > 0
  const hasNavigable = exportCount > 0 && importCount > 0
  const hasNoUndercurrent = anyCount === 0 && deepNestedCount === 0

  let state: ChannelMeasure['state'] = 'polluted'
  if (hasHighClarity && hasNoBlockage && hasNoEddies && hasDirectPath) state = 'crystal'
  else if (hasHighClarity && hasNoBlockage) state = 'clear'
  else if (hasHighClarity) state = 'murky'
  else if (hasProperWidth && hasNavigable) state = 'turbid'
  else if (clarity > 30) state = 'muddy'

  return {
    clarity, state, hasHighClarity, hasDirectPath, hasNoMeandering,
    hasProperWidth, hasNoBlockage, hasSmoothFlow, hasNoEddies, hasProperDepth,
    hasNavigable, hasNoUndercurrent, blockageCount, eddyCount,
  }
}

// ─── Sediment Measurement ───────────────────────────────────────────────────

/** @example measureSediment(content) returns sediment analysis */
export function measureSediment(content: string): SedimentMeasure {
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

  let richness = 20
  if (hasStructure) richness += 12
  if (hasTypes) richness += 12
  if (hasFunctions) richness += 10
  if (jsdocCount > 0) richness += 8
  if (exportCount > 0) richness += 8
  if (genericsCount > 0) richness += 5
  if (importCount > 0) richness += 5
  if (anyCount === 0) richness += 5
  if (consoleCount === 0) richness += 5
  if (todoCount === 0) richness += 5
  if (deepNestedCount === 0) richness += 5
  richness = Math.min(100, Math.max(0, Math.round(richness)))

  const toxinCount = anyCount + consoleCount + todoCount
  const erosionCount = deepNestedCount + commentedCodeCount

  const hasRichSediment = richness >= 75 && hasStructure && hasTypes
  const hasAlluvial = hasStructure && hasTypes && genericsCount > 0
  const hasProperStrata = hasStructure && hasTypes && hasFunctions
  const hasNoContamination = toxinCount === 0
  const hasNutrientRich = jsdocCount > 0 && hasFunctions
  const hasNoToxins = anyCount === 0 && todoCount === 0
  const hasProperDeposition = exportCount > 0 && importCount > 0
  const hasNoErosion = erosionCount === 0
  const hasFertileGround = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0
  const hasNoSalinization = commentedCodeCount === 0

  let quality: SedimentMeasure['quality'] = 'bedrock'
  if (hasRichSediment && hasNoContamination && hasNoErosion && hasAlluvial) quality = 'alluvial-gold'
  else if (hasRichSediment && hasNoContamination) quality = 'rich-silt'
  else if (hasRichSediment) quality = 'sand'
  else if (hasProperStrata && hasNutrientRich) quality = 'gravel'
  else if (richness > 30) quality = 'clay'

  return {
    richness, quality, hasRichSediment, hasAlluvial, hasProperStrata,
    hasNoContamination, hasNutrientRich, hasNoToxins, hasProperDeposition,
    hasNoErosion, hasFertileGround, hasNoSalinization, toxinCount, erosionCount,
  }
}

// ─── Distributary Measurement ───────────────────────────────────────────────

/** @example measureDistributary(content) returns distributary analysis */
export function measureDistributary(content: string): DistributaryMeasure {
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

  let reach = 20
  if (hasStructure) reach += 12
  if (hasTypes) reach += 12
  if (hasFunctions) reach += 10
  if (jsdocCount > 0) reach += 8
  if (exportCount > 0) reach += 8
  if (genericsCount > 0) reach += 5
  if (importCount > 0) reach += 5
  if (anyCount === 0) reach += 5
  if (consoleCount === 0) reach += 5
  if (todoCount === 0) reach += 5
  if (deepNestedCount === 0) reach += 5
  reach = Math.min(100, Math.max(0, Math.round(reach)))

  const bottleneckCount = anyCount + consoleCount
  const deadChannelCount = todoCount + deepNestedCount

  const hasHighReach = reach >= 75 && hasStructure && hasTypes
  const hasProperChannels = hasStructure && hasTypes && hasFunctions
  const hasBalanced = exportCount > 0 && importCount > 0
  const hasNoBottleneck = bottleneckCount === 0
  const hasEvenFlow = consoleCount === 0 && deepNestedCount === 0
  const hasNoDead = deadChannelCount === 0
  const hasProperBranching = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoConfluence = deepNestedCount === 0
  const hasWideReach = hasStructure && hasTypes && exportCount > 0
  const hasNoIsolation = importCount > 0 && exportCount > 0

  let network: DistributaryMeasure['network'] = 'trickle'
  if (hasHighReach && hasNoBottleneck && hasNoDead && hasProperBranching) network = 'mega-delta'
  else if (hasHighReach && hasNoBottleneck) network = 'large-delta'
  else if (hasHighReach) network = 'medium-delta'
  else if (hasProperChannels && hasBalanced) network = 'small-delta'
  else if (reach > 30) network = 'creek'

  return {
    reach, network, hasHighReach, hasProperChannels, hasBalanced,
    hasNoBottleneck, hasEvenFlow, hasNoDead, hasProperBranching,
    hasNoConfluence, hasWideReach, hasNoIsolation, bottleneckCount, deadChannelCount,
  }
}

// ─── Fertility Measurement ──────────────────────────────────────────────────

/** @example measureFertility(content) returns fertility analysis */
export function measureFertility(content: string): FertilityMeasure {
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
  if (jsdocCount > 0) level += 8
  if (exportCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const depletionCount = anyCount + todoCount
  const monocultureCount = deepNestedCount + commentedCodeCount

  const hasHighFertility = level >= 75 && hasStructure && hasTypes
  const hasYield = hasFunctions && exportCount > 0
  const hasProperCropping = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoDepletion = depletionCount === 0
  const hasAbundant = hasStructure && hasTypes && genericsCount > 0
  const hasNoOveruse = consoleCount === 0 && commentedCodeCount === 0
  const hasRegenerative = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoMonoculture = monocultureCount === 0
  const hasSustainable = hasStructure && hasTypes && jsdocCount > 0
  const hasNoExhaustion = consoleCount === 0 && deepNestedCount === 0

  let zone: FertilityMeasure['zone'] = 'wasteland'
  if (hasHighFertility && hasNoDepletion && hasNoMonoculture && hasYield) zone = 'fertile-crescent'
  else if (hasHighFertility && hasNoDepletion) zone = 'rich-farmland'
  else if (hasHighFertility) zone = 'meadow'
  else if (hasSustainable && hasProperCropping) zone = 'scrubland'
  else if (level > 30) zone = 'desert'

  return {
    level, zone, hasHighFertility, hasYield, hasProperCropping, hasNoDepletion,
    hasAbundant, hasNoOveruse, hasRegenerative, hasNoMonoculture, hasSustainable,
    hasNoExhaustion, depletionCount, monocultureCount,
  }
}

// ─── Erosion Measurement ────────────────────────────────────────────────────

/** @example measureErosion(content) returns erosion analysis */
export function measureErosion(content: string): ErosionMeasure {
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
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let resistance = 20
  if (hasStructure) resistance += 12
  if (hasTypes) resistance += 12
  if (hasFunctions) resistance += 10
  if (jsdocCount > 0) resistance += 8
  if (exportCount > 0) resistance += 8
  if (genericsCount > 0) resistance += 5
  if (importCount > 0) resistance += 5
  if (anyCount === 0) resistance += 5
  if (consoleCount === 0) resistance += 5
  if (todoCount === 0) resistance += 5
  if (deepNestedCount === 0) resistance += 5
  resistance = Math.min(100, Math.max(0, Math.round(resistance)))

  const landslideCount = todoCount + anyCount
  const scouringCount = deepNestedCount + privateCount + commentedCodeCount

  const hasHighResistance = resistance >= 75 && hasStructure && hasTypes
  const hasSolidBank = hasStructure && hasTypes && hasFunctions
  const hasNoUndercutting = consoleCount === 0 && anyCount === 0
  const hasProperReinforcement = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasVegetation = countTryCatch(content) > 0
  const hasNoLandslide = landslideCount === 0
  const hasStable = hasStructure && hasTypes && genericsCount > 0
  const hasNoScouring = scouringCount === 0
  const hasArmored = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoBreaching = consoleCount === 0 && deepNestedCount === 0

  let strength: ErosionMeasure['strength'] = 'quicksand'
  if (hasHighResistance && hasNoLandslide && hasNoScouring && hasArmored) strength = 'granite'
  else if (hasHighResistance && hasNoLandslide) strength = 'limestone'
  else if (hasHighResistance) strength = 'sandstone'
  else if (hasSolidBank && hasVegetation) strength = 'shale'
  else if (resistance > 30) strength = 'loose-soil'

  return {
    resistance, strength, hasHighResistance, hasSolidBank, hasNoUndercutting,
    hasProperReinforcement, hasVegetation, hasNoLandslide, hasStable,
    hasNoScouring, hasArmored, hasNoBreaching, landslideCount, scouringCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(layer) returns condition string */
export function classifyCondition(layer: SedimentLayer): SedimentLayer['condition'] {
  const { qualityScore } = layer
  if (qualityScore >= 80) return 'fertile-estuary'
  if (qualityScore >= 65) return 'healthy-delta'
  if (qualityScore >= 50) return 'developing'
  if (qualityScore >= 35) return 'eroding'
  if (qualityScore >= 20) return 'barren'
  return 'dead-river'
}

// ─── Layer Analysis ─────────────────────────────────────────────────────────

/** @example analyzeSedimentLayer(content, filePath) returns full layer */
export function analyzeSedimentLayer(content: string, filePath: string): SedimentLayer {
  const upstream = measureUpstream(content)
  const channel = measureChannel(content)
  const sediment = measureSediment(content)
  const distributary = measureDistributary(content)
  const fertility = measureFertility(content)
  const erosion = measureErosion(content)

  const upstreamForce = upstream.force
  const channelClarity = channel.clarity
  const sedimentRichness = sediment.richness
  const distributaryReach = distributary.reach
  const deltaFertility = fertility.level
  const erosionResistance = erosion.resistance

  const qualityScore = Math.round(
    upstreamForce * 0.15 +
    channelClarity * 0.15 +
    sedimentRichness * 0.15 +
    distributaryReach * 0.2 +
    deltaFertility * 0.15 +
    erosionResistance * 0.2,
  )

  const result: SedimentLayer = {
    file: filePath,
    upstreamForce, channelClarity, sedimentRichness,
    distributaryReach, deltaFertility, erosionResistance,
    upstream, channel, sediment, distributary, fertility, erosion,
    condition: 'dead-river',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Region Analysis ────────────────────────────────────────────────────────

/** @example analyzeDeltaRegion(layers, dirPath) returns region */
export function analyzeDeltaRegion(layers: SedimentLayer[], dirPath: string): DeltaRegion {
  if (layers.length === 0) {
    return {
      directory: dirPath, layers: [], avgForce: 0, avgClarity: 0, avgFertility: 0,
      fertileCount: 0, barrenCount: 0, highForceCount: 0, clearCount: 0,
      regionType: 'dry-bed', condition: 'desert',
    }
  }

  const avgForce = Math.round(layers.reduce((s, l) => s + l.upstreamForce, 0) / layers.length)
  const avgClarity = Math.round(layers.reduce((s, l) => s + l.channelClarity, 0) / layers.length)
  const avgFertility = Math.round(layers.reduce((s, l) => s + l.deltaFertility, 0) / layers.length)

  const fertileCount = layers.filter((l) => l.condition === 'fertile-estuary').length
  const barrenCount = layers.filter((l) => l.condition === 'barren').length
  const highForceCount = layers.filter((l) => l.upstream.hasHighForce).length
  const clearCount = layers.filter((l) => l.channel.hasHighClarity).length

  const regionType = classifyRegionType(layers)
  const avgScore = layers.reduce((s, l) => s + l.qualityScore, 0) / layers.length
  const condition = classifyRegionCondition(avgScore)

  return {
    directory: dirPath, layers, avgForce, avgClarity, avgFertility,
    fertileCount, barrenCount, highForceCount, clearCount, regionType, condition,
  }
}

// ─── Region Classification ──────────────────────────────────────────────────

/** @example classifyRegionType(layers) returns region type */
export function classifyRegionType(layers: SedimentLayer[]): DeltaRegion['regionType'] {
  if (layers.length === 0) return 'dry-bed'
  const avgScore = layers.reduce((s, l) => s + l.qualityScore, 0) / layers.length
  const fertileCnt = layers.filter((l) => l.condition === 'fertile-estuary').length
  if (avgScore >= 75 && fertileCnt >= Math.ceil(layers.length * 0.3)) return 'mega-delta'
  if (avgScore >= 60) return 'river-mouth'
  if (avgScore >= 45) return 'estuary'
  if (avgScore >= 30) return 'creek'
  if (avgScore >= 15) return 'ditch'
  return 'dry-bed'
}

/** @example classifyRegionCondition(avgScore) returns condition */
export function classifyRegionCondition(avgScore: number): DeltaRegion['condition'] {
  if (avgScore >= 80) return 'lush-wetland'
  if (avgScore >= 65) return 'fertile-plain'
  if (avgScore >= 50) return 'developing-marsh'
  if (avgScore >= 35) return 'barren-shore'
  if (avgScore >= 20) return 'salt-flat'
  return 'desert'
}

/** @example classifyStewardGrade(avgFertility) returns grade */
export function classifyStewardGrade(avgFertility: number): RiverDeltaResult['stats']['stewardGrade'] {
  if (avgFertility >= 80) return 'master-steward'
  if (avgFertility >= 65) return 'riverkeeper'
  if (avgFertility >= 50) return 'warden'
  if (avgFertility >= 35) return 'guard'
  if (avgFertility >= 20) return 'watchman'
  return 'absentee'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(layers, regions, basin, stats) returns recommendations */
export function generateRecommendations(
  layers: SedimentLayer[],
  regions: DeltaRegion[],
  basin: RiverDeltaResult['basin'],
  stats: RiverDeltaResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgUpstreamForce < 50) recs.push('Increase upstream force — build more code momentum')
  if (stats.avgChannelClarity < 50) recs.push('Clear the channels — improve code readability')
  if (stats.avgSedimentRichness < 50) recs.push('Enrich sediment deposits — improve code quality')
  if (stats.avgDistributaryReach < 50) recs.push('Widen distributary reach — distribute code better')
  if (stats.avgDeltaFertility < 50) recs.push('Boost delta fertility — make code more productive')
  if (stats.avgErosionResistance < 50) recs.push('Strengthen erosion resistance — improve code maintainability')
  if (stats.deadRiverCount > layers.length * 0.5) recs.push('Too many dead rivers — over half the codebase lacks vitality')
  if (stats.hasHighFertilityCount === 0) recs.push('No fertile zones found — cultivate your code with patience')
  if (regions.length > 0 && basin.overallFertility < 60) recs.push('Overall fertility is low — consult the master steward')
  if (recs.length === 0) recs.push('Fertile estuary achieved — your code delta teems with life')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildRiverDeltaResult(files, contents, options) returns full result */
export function buildRiverDeltaResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): RiverDeltaResult {
  const layers: SedimentLayer[] = files.map((file, i) =>
    analyzeSedimentLayer(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SedimentLayer[]>()
  for (const layer of layers) {
    const dir = layer.file.includes('/')
      ? layer.file.substring(0, layer.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(layer)
    } else {
      dirMap.set(dir, [layer])
    }
  }

  const regions: DeltaRegion[] = Array.from(dirMap.entries()).map(([dir, dirLayers]) =>
    analyzeDeltaRegion(dirLayers, dir),
  )

  const avgForce = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.upstreamForce, 0) / layers.length)
    : 0
  const avgClarity = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.channelClarity, 0) / layers.length)
    : 0
  const avgFertility = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.deltaFertility, 0) / layers.length)
    : 0
  const overallFertility = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.qualityScore, 0) / layers.length)
    : 0
  const isFertile = overallFertility >= 65

  const basin: RiverDeltaResult['basin'] = {
    avgForce, avgClarity, avgFertility, isFertile, overallFertility,
  }

  const avgUpstreamForce = avgForce
  const avgChannelClarity = avgClarity
  const avgSedimentRichness = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.sedimentRichness, 0) / layers.length)
    : 0
  const avgDistributaryReach = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.distributaryReach, 0) / layers.length)
    : 0
  const avgDeltaFertility = avgFertility
  const avgErosionResistance = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.erosionResistance, 0) / layers.length)
    : 0

  const conditionCounts = {
    fertileEstuary: 0, healthyDelta: 0, developing: 0,
    eroding: 0, barren: 0, deadRiver: 0,
  }
  for (const l of layers) {
    switch (l.condition) {
      case 'fertile-estuary': conditionCounts.fertileEstuary++; break
      case 'healthy-delta': conditionCounts.healthyDelta++; break
      case 'developing': conditionCounts.developing++; break
      case 'eroding': conditionCounts.eroding++; break
      case 'barren': conditionCounts.barren++; break
      case 'dead-river': conditionCounts.deadRiver++; break
    }
  }

  const hasHighForceCount = layers.filter((l) => l.upstream.hasHighForce).length
  const hasHighClarityCount = layers.filter((l) => l.channel.hasHighClarity).length
  const hasRichSedimentCount = layers.filter((l) => l.sediment.hasRichSediment).length
  const hasHighReachCount = layers.filter((l) => l.distributary.hasHighReach).length
  const hasHighFertilityCount = layers.filter((l) => l.fertility.hasHighFertility).length
  const hasHighResistanceCount = layers.filter((l) => l.erosion.hasHighResistance).length

  const bestLayer = layers.length > 0
    ? layers.reduce((best, l) => l.qualityScore > best.qualityScore ? l : best).file
    : ''
  const mostForceful = layers.length > 0
    ? layers.reduce((best, l) => l.upstreamForce > best.upstreamForce ? l : best).file
    : ''
  const clearest = layers.length > 0
    ? layers.reduce((best, l) => l.channelClarity > best.channelClarity ? l : best).file
    : ''
  const richest = layers.length > 0
    ? layers.reduce((best, l) => l.sedimentRichness > best.sedimentRichness ? l : best).file
    : ''
  const widestReach = layers.length > 0
    ? layers.reduce((best, l) => l.distributaryReach > best.distributaryReach ? l : best).file
    : ''
  const mostFertile = layers.length > 0
    ? layers.reduce((best, l) => l.deltaFertility > best.deltaFertility ? l : best).file
    : ''

  const stewardGrade = classifyStewardGrade(overallFertility)

  const stats: RiverDeltaResult['stats'] = {
    totalFiles: files.length, totalRegions: regions.length,
    avgUpstreamForce, avgChannelClarity, avgSedimentRichness,
    avgDistributaryReach, avgDeltaFertility, avgErosionResistance,
    fertileEstuaryCount: conditionCounts.fertileEstuary,
    healthyDeltaCount: conditionCounts.healthyDelta,
    developingCount: conditionCounts.developing,
    erodingCount: conditionCounts.eroding,
    barrenCount: conditionCounts.barren,
    deadRiverCount: conditionCounts.deadRiver,
    hasHighForceCount, hasHighClarityCount, hasRichSedimentCount,
    hasHighReachCount, hasHighFertilityCount, hasHighResistanceCount,
    overallFertility, stewardGrade,
    bestLayer, mostForceful, clearest, richest, widestReach, mostFertile,
  }

  const recommendations = generateRecommendations(layers, regions, basin, stats)

  return { layers, regions, basin, stats, recommendations }
}
