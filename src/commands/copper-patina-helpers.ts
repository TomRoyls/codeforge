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

export interface PatinaMeasure {
  quality: number
  color: 'verdigris' | 'malachite' | 'copper-brown' | 'shiny-copper' | 'tarnished' | 'corroded'
  hasGracefulAging: boolean
  hasProtectiveLayer: boolean
  hasNoCorrosion: boolean
  hasProperOxidation: boolean
  hasNoPitting: boolean
  hasEvenDevelopment: boolean
  hasNoSpots: boolean
  hasNaturalFinish: boolean
  hasNoArtificial: boolean
  hasPatina: boolean
  corrosionCount: number
  pittingCount: number
}

export interface OxidationMeasure {
  depth: number
  stage: 'mature-patina' | 'developing' | 'early-oxide' | 'fresh-tarnish' | 'bare-metal' | 'unexposed'
  hasDeepMaturity: boolean
  hasProperEvolution: boolean
  hasLayeredDevelopment: boolean
  hasNoRapidDegradation: boolean
  hasProperTimeline: boolean
  hasNoRegression: boolean
  hasGradualImprovement: boolean
  hasNoReversal: boolean
  hasHistoricalLayers: boolean
  hasNoStripping: boolean
  degradationCount: number
  reversalCount: number
}

export interface VerdigrisMeasure {
  beauty: number
  style: 'sculptural' | 'architectural' | 'artistic' | 'functional' | 'utilitarian' | 'industrial'
  hasDistinctiveCharacter: boolean
  hasUniqueIdentity: boolean
  hasNoBlandness: boolean
  hasRichTexture: boolean
  hasNoUniformity: boolean
  hasExpressive: boolean
  hasNoGeneric: boolean
  hasMemorable: boolean
  hasNoCookieCutter: boolean
  hasPersonality: boolean
  blandCount: number
  genericCount: number
}

export interface IntegrityMeasure {
  level: number
  state: 'solid' | 'strong' | 'stable' | 'weakening' | 'fragile' | 'crumbling'
  hasHighIntegrity: boolean
  hasNoStressCracks: boolean
  hasProperSupport: boolean
  hasNoFatigue: boolean
  hasReinforced: boolean
  hasNoWeakJoints: boolean
  hasProperAnchoring: boolean
  hasNoLoosening: boolean
  hasLoadBearing: boolean
  hasNoDeformation: boolean
  stressCrackCount: number
  fatigueCount: number
}

export interface AdaptationMeasure {
  level: number
  environment: 'marine' | 'urban' | 'industrial' | 'rural' | 'indoor' | 'sealed'
  hasHighAdaptation: boolean
  hasEnvironmentalResponse: boolean
  hasClimateResistance: boolean
  hasNoBrittleness: boolean
  hasFlexibility: boolean
  hasNoStiffness: boolean
  hasThermalAdaptation: boolean
  hasNoSensitivity: boolean
  hasChemicalResistance: boolean
  hasNoVulnerability: boolean
  brittlenessCount: number
  sensitivityCount: number
}

export interface AntiqueMeasure {
  value: number
  appraisal: 'museum-piece' | 'collectors-item' | 'antique' | 'vintage' | 'used' | 'scrap'
  hasHighValue: boolean
  hasProvenance: boolean
  hasNoForgery: boolean
  hasAuthentic: boolean
  hasHistoricalSignificance: boolean
  hasNoReproduction: boolean
  hasRarity: boolean
  hasNoDamage: boolean
  hasProperRestoration: boolean
  hasInvestmentGrade: boolean
  forgeryCount: number
  damageCount: number
}

export interface CopperArtifact {
  file: string
  patinaQuality: number
  oxidationDepth: number
  verdigrisBeauty: number
  structuralIntegrity: number
  environmentalAdaptation: number
  antiqueValue: number
  patina: PatinaMeasure
  oxidation: OxidationMeasure
  verdigris: VerdigrisMeasure
  integrity: IntegrityMeasure
  adaptation: AdaptationMeasure
  antique: AntiqueMeasure
  condition: 'statue-of-liberty' | 'copper-dome' | 'weather-vane' | 'penny' | 'scrap-wire' | 'verdigris-dust'
  qualityScore: number
}

export interface CopperCollection {
  directory: string
  artifacts: CopperArtifact[]
  avgPatina: number
  avgIntegrity: number
  avgValue: number
  statueCount: number
  dustCount: number
  gracefulCount: number
  highIntegrityCount: number
  collectionType: 'museum' | 'gallery' | 'exhibition' | 'workshop' | 'salvage-yard' | 'scrap-heap'
  condition: 'national-treasure' | 'heritage-collection' | 'art-gallery' | 'antique-shop' | 'junk-yard' | 'recycling'
}

export interface CopperPatinaResult {
  artifacts: CopperArtifact[]
  collections: CopperCollection[]
  museum: {
    avgPatina: number
    avgIntegrity: number
    avgValue: number
    isHeritage: boolean
    overallValue: number
  }
  stats: {
    totalFiles: number
    totalCollections: number
    avgPatinaQuality: number
    avgOxidationDepth: number
    avgVerdigrisBeauty: number
    avgStructuralIntegrity: number
    avgEnvironmentalAdaptation: number
    avgAntiqueValue: number
    statueOfLibertyCount: number
    copperDomeCount: number
    weatherVaneCount: number
    pennyCount: number
    scrapWireCount: number
    verdigrisDustCount: number
    hasGracefulAgingCount: number
    hasDeepMaturityCount: number
    hasDistinctiveCharacterCount: number
    hasHighIntegrityCount: number
    hasHighAdaptationCount: number
    hasHighValueCount: number
    overallValue: number
    appraiserGrade: 'chief-curator' | 'master-appraiser' | 'antique-dealer' | 'collector' | 'scavenger' | 'scrapper'
    bestArtifact: string
    bestPatina: string
    mostMature: string
    mostCharacter: string
    strongest: string
    mostValuable: string
  }
  recommendations: string[]
}

// ─── Patina Measurement ─────────────────────────────────────────────────────

/** @example measurePatina(content) returns patina analysis */
export function measurePatina(content: string): PatinaMeasure {
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

  const corrosionCount = consoleCount + anyCount
  const pittingCount = deepNestedCount + privateCount

  const hasGracefulAging = quality >= 75 && hasStructure && hasTypes
  const hasProtectiveLayer = hasStructure && hasTypes && hasFunctions
  const hasNoCorrosion = corrosionCount === 0
  const hasProperOxidation = hasStructure && hasTypes && genericsCount > 0
  const hasNoPitting = pittingCount === 0
  const hasEvenDevelopment = exportCount > 0 && importCount > 0
  const hasNoSpots = anyCount === 0
  const hasNaturalFinish = jsdocCount > 0 && genericsCount > 0
  const hasNoArtificial = consoleCount === 0 && deepNestedCount === 0
  const hasPatina = hasStructure && hasTypes

  let color: PatinaMeasure['color'] = 'corroded'
  if (hasGracefulAging && hasNoCorrosion && hasNoPitting && hasProperOxidation) color = 'verdigris'
  else if (hasGracefulAging && hasNoCorrosion) color = 'malachite'
  else if (hasGracefulAging) color = 'copper-brown'
  else if (hasProtectiveLayer && hasEvenDevelopment) color = 'shiny-copper'
  else if (quality > 30) color = 'tarnished'

  return {
    quality, color, hasGracefulAging, hasProtectiveLayer, hasNoCorrosion,
    hasProperOxidation, hasNoPitting, hasEvenDevelopment, hasNoSpots,
    hasNaturalFinish, hasNoArtificial, hasPatina, corrosionCount, pittingCount,
  }
}

// ─── Oxidation Measurement ──────────────────────────────────────────────────

/** @example measureOxidation(content) returns oxidation analysis */
export function measureOxidation(content: string): OxidationMeasure {
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

  let depth = 20
  if (hasStructure) depth += 12
  if (hasTypes) depth += 12
  if (hasFunctions) depth += 10
  if (jsdocCount > 0) depth += 8
  if (tryCatchCount > 0) depth += 8
  if (genericsCount > 0) depth += 5
  if (exportCount > 0) depth += 5
  if (importCount > 0) depth += 5
  if (asyncCount > 0) depth += 5
  if (anyCount === 0) depth += 5
  if (consoleCount === 0) depth += 5
  depth = Math.min(100, Math.max(0, Math.round(depth)))

  const degradationCount = todoCount + anyCount
  const reversalCount = deepNestedCount

  const hasDeepMaturity = depth >= 75 && hasStructure && hasTypes
  const hasProperEvolution = hasStructure && hasTypes && hasFunctions
  const hasLayeredDevelopment = hasStructure && hasTypes && genericsCount > 0
  const hasNoRapidDegradation = degradationCount === 0
  const hasProperTimeline = tryCatchCount > 0 && asyncCount > 0
  const hasNoRegression = anyCount === 0 && todoCount === 0
  const hasGradualImprovement = hasFunctions && jsdocCount > 0
  const hasNoReversal = deepNestedCount === 0
  const hasHistoricalLayers = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoStripping = consoleCount === 0 && deepNestedCount === 0

  let stage: OxidationMeasure['stage'] = 'unexposed'
  if (hasDeepMaturity && hasNoRapidDegradation && hasNoReversal && hasProperTimeline) stage = 'mature-patina'
  else if (hasDeepMaturity && hasNoRapidDegradation) stage = 'developing'
  else if (hasDeepMaturity) stage = 'early-oxide'
  else if (hasProperEvolution && hasGradualImprovement) stage = 'fresh-tarnish'
  else if (depth > 30) stage = 'bare-metal'

  return {
    depth, stage, hasDeepMaturity, hasProperEvolution, hasLayeredDevelopment,
    hasNoRapidDegradation, hasProperTimeline, hasNoRegression, hasGradualImprovement,
    hasNoReversal, hasHistoricalLayers, hasNoStripping, degradationCount, reversalCount,
  }
}

// ─── Verdigris Measurement ──────────────────────────────────────────────────

/** @example measureVerdigris(content) returns verdigris analysis */
export function measureVerdigris(content: string): VerdigrisMeasure {
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
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let beauty = 20
  if (hasStructure) beauty += 12
  if (hasTypes) beauty += 12
  if (hasFunctions) beauty += 10
  if (jsdocCount > 0) beauty += 8
  if (exportCount > 0) beauty += 8
  if (genericsCount > 0) beauty += 5
  if (importCount > 0) beauty += 5
  if (anyCount === 0) beauty += 5
  if (consoleCount === 0) beauty += 5
  if (deepNestedCount === 0) beauty += 5
  if (commentedCodeCount === 0) beauty += 5
  beauty = Math.min(100, Math.max(0, Math.round(beauty)))

  const blandCount = anyCount + consoleCount
  const genericCount = deepNestedCount + commentedCodeCount

  const hasDistinctiveCharacter = beauty >= 75 && hasStructure && hasTypes
  const hasUniqueIdentity = hasStructure && hasTypes && genericsCount > 0
  const hasNoBlandness = blandCount === 0
  const hasRichTexture = hasStructure && hasTypes && jsdocCount > 0
  const hasNoUniformity = exportCount > 0 && importCount > 0
  const hasExpressive = hasFunctions && jsdocCount > 0
  const hasNoGeneric = genericCount === 0
  const hasMemorable = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoCookieCutter = consoleCount === 0 && deepNestedCount === 0
  const hasPersonality = hasStructure && hasTypes && hasFunctions

  let style: VerdigrisMeasure['style'] = 'industrial'
  if (hasDistinctiveCharacter && hasNoBlandness && hasNoGeneric && hasUniqueIdentity) style = 'sculptural'
  else if (hasDistinctiveCharacter && hasNoBlandness) style = 'architectural'
  else if (hasDistinctiveCharacter) style = 'artistic'
  else if (hasPersonality && hasRichTexture) style = 'functional'
  else if (beauty > 30) style = 'utilitarian'

  return {
    beauty, style, hasDistinctiveCharacter, hasUniqueIdentity, hasNoBlandness,
    hasRichTexture, hasNoUniformity, hasExpressive, hasNoGeneric, hasMemorable,
    hasNoCookieCutter, hasPersonality, blandCount, genericCount,
  }
}

// ─── Integrity Measurement ──────────────────────────────────────────────────

/** @example measureIntegrity(content) returns integrity analysis */
export function measureIntegrity(content: string): IntegrityMeasure {
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
  if (exportCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const stressCrackCount = todoCount + anyCount
  const fatigueCount = deepNestedCount + privateCount

  const hasHighIntegrity = level >= 75 && hasStructure && hasTypes
  const hasNoStressCracks = stressCrackCount === 0
  const hasProperSupport = hasStructure && hasTypes && hasFunctions
  const hasNoFatigue = fatigueCount === 0
  const hasReinforced = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoWeakJoints = consoleCount === 0 && deepNestedCount === 0
  const hasProperAnchoring = hasFunctions && exportCount > 0
  const hasNoLoosening = anyCount === 0 && todoCount === 0
  const hasLoadBearing = hasStructure && hasTypes && genericsCount > 0
  const hasNoDeformation = deepNestedCount === 0 && privateCount === 0

  let state: IntegrityMeasure['state'] = 'crumbling'
  if (hasHighIntegrity && hasNoStressCracks && hasNoFatigue && hasReinforced) state = 'solid'
  else if (hasHighIntegrity && hasNoStressCracks) state = 'strong'
  else if (hasHighIntegrity) state = 'stable'
  else if (hasProperSupport && hasProperAnchoring) state = 'weakening'
  else if (level > 30) state = 'fragile'

  return {
    level, state, hasHighIntegrity, hasNoStressCracks, hasProperSupport,
    hasNoFatigue, hasReinforced, hasNoWeakJoints, hasProperAnchoring,
    hasNoLoosening, hasLoadBearing, hasNoDeformation, stressCrackCount, fatigueCount,
  }
}

// ─── Adaptation Measurement ─────────────────────────────────────────────────

/** @example measureAdaptation(content) returns adaptation analysis */
export function measureAdaptation(content: string): AdaptationMeasure {
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
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let levelVal = 20
  if (hasStructure) levelVal += 10
  if (hasTypes) levelVal += 10
  if (hasFunctions) levelVal += 10
  if (jsdocCount > 0) levelVal += 8
  if (exportCount > 0) levelVal += 8
  if (genericsCount > 0) levelVal += 5
  if (importCount > 0) levelVal += 5
  if (asyncCount > 0) levelVal += 5
  if (anyCount === 0) levelVal += 5
  if (consoleCount === 0) levelVal += 5
  if (deepNestedCount === 0) levelVal += 5
  if (commentedCodeCount === 0) levelVal += 4
  levelVal = Math.min(100, Math.max(0, Math.round(levelVal)))

  const brittlenessCount = anyCount + consoleCount
  const sensitivityCount = deepNestedCount + commentedCodeCount

  const hasHighAdaptation = levelVal >= 75 && hasStructure && hasTypes
  const hasEnvironmentalResponse = hasStructure && hasTypes && genericsCount > 0
  const hasClimateResistance = tryCatchCount > 0 && asyncCount > 0
  const hasNoBrittleness = brittlenessCount === 0
  const hasFlexibility = hasFunctions && jsdocCount > 0
  const hasNoStiffness = consoleCount === 0 && commentedCodeCount === 0
  const hasThermalAdaptation = hasStructure && hasTypes && exportCount > 0
  const hasNoSensitivity = sensitivityCount === 0
  const hasChemicalResistance = importCount > 0 && exportCount > 0
  const hasNoVulnerability = anyCount === 0 && deepNestedCount === 0

  let environment: AdaptationMeasure['environment'] = 'sealed'
  if (hasHighAdaptation && hasNoBrittleness && hasNoSensitivity && hasEnvironmentalResponse) environment = 'marine'
  else if (hasHighAdaptation && hasNoBrittleness) environment = 'urban'
  else if (hasHighAdaptation) environment = 'industrial'
  else if (hasFlexibility && hasChemicalResistance) environment = 'rural'
  else if (levelVal > 30) environment = 'indoor'

  return {
    level: levelVal, environment, hasHighAdaptation, hasEnvironmentalResponse,
    hasClimateResistance, hasNoBrittleness, hasFlexibility, hasNoStiffness,
    hasThermalAdaptation, hasNoSensitivity, hasChemicalResistance, hasNoVulnerability,
    brittlenessCount, sensitivityCount,
  }
}

// ─── Antique Measurement ────────────────────────────────────────────────────

/** @example measureAntique(content) returns antique analysis */
export function measureAntique(content: string): AntiqueMeasure {
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

  let value = 20
  if (hasStructure) value += 12
  if (hasTypes) value += 12
  if (hasFunctions) value += 10
  if (jsdocCount > 0) value += 8
  if (exportCount > 0) value += 8
  if (genericsCount > 0) value += 5
  if (importCount > 0) value += 5
  if (anyCount === 0) value += 5
  if (consoleCount === 0) value += 5
  if (todoCount === 0) value += 5
  if (deepNestedCount === 0) value += 5
  value = Math.min(100, Math.max(0, Math.round(value)))

  const forgeryCount = anyCount + todoCount
  const damageCount = deepNestedCount + commentedCodeCount

  const hasHighValue = value >= 75 && hasStructure && hasTypes
  const hasProvenance = importCount > 0 && jsdocCount > 0
  const hasNoForgery = forgeryCount === 0
  const hasAuthentic = hasStructure && hasTypes && hasFunctions
  const hasHistoricalSignificance = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoReproduction = consoleCount === 0 && commentedCodeCount === 0
  const hasRarity = hasStructure && hasTypes && genericsCount > 0
  const hasNoDamage = damageCount === 0
  const hasProperRestoration = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasInvestmentGrade = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0

  let appraisal: AntiqueMeasure['appraisal'] = 'scrap'
  if (hasHighValue && hasNoForgery && hasNoDamage && hasInvestmentGrade) appraisal = 'museum-piece'
  else if (hasHighValue && hasNoForgery) appraisal = 'collectors-item'
  else if (hasHighValue) appraisal = 'antique'
  else if (hasAuthentic && hasProvenance) appraisal = 'vintage'
  else if (value > 30) appraisal = 'used'

  return {
    value, appraisal, hasHighValue, hasProvenance, hasNoForgery, hasAuthentic,
    hasHistoricalSignificance, hasNoReproduction, hasRarity, hasNoDamage,
    hasProperRestoration, hasInvestmentGrade, forgeryCount, damageCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(artifact) returns condition string */
export function classifyCondition(artifact: CopperArtifact): CopperArtifact['condition'] {
  const { qualityScore } = artifact
  if (qualityScore >= 80) return 'statue-of-liberty'
  if (qualityScore >= 65) return 'copper-dome'
  if (qualityScore >= 50) return 'weather-vane'
  if (qualityScore >= 35) return 'penny'
  if (qualityScore >= 20) return 'scrap-wire'
  return 'verdigris-dust'
}

// ─── Artifact Analysis ──────────────────────────────────────────────────────

/** @example analyzeCopperArtifact(content, filePath) returns full artifact */
export function analyzeCopperArtifact(content: string, filePath: string): CopperArtifact {
  const patina = measurePatina(content)
  const oxidation = measureOxidation(content)
  const verdigris = measureVerdigris(content)
  const integrity = measureIntegrity(content)
  const adaptation = measureAdaptation(content)
  const antique = measureAntique(content)

  const patinaQuality = patina.quality
  const oxidationDepth = oxidation.depth
  const verdigrisBeauty = verdigris.beauty
  const structuralIntegrity = integrity.level
  const environmentalAdaptation = adaptation.level
  const antiqueValue = antique.value

  const qualityScore = Math.round(
    patinaQuality * 0.15 +
    oxidationDepth * 0.15 +
    verdigrisBeauty * 0.15 +
    structuralIntegrity * 0.2 +
    environmentalAdaptation * 0.15 +
    antiqueValue * 0.2,
  )

  const result: CopperArtifact = {
    file: filePath,
    patinaQuality, oxidationDepth, verdigrisBeauty, structuralIntegrity,
    environmentalAdaptation, antiqueValue,
    patina, oxidation, verdigris, integrity, adaptation, antique,
    condition: 'verdigris-dust',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Collection Analysis ────────────────────────────────────────────────────

/** @example analyzeCopperCollection(artifacts, dirPath) returns collection */
export function analyzeCopperCollection(artifacts: CopperArtifact[], dirPath: string): CopperCollection {
  if (artifacts.length === 0) {
    return {
      directory: dirPath, artifacts: [], avgPatina: 0, avgIntegrity: 0, avgValue: 0,
      statueCount: 0, dustCount: 0, gracefulCount: 0, highIntegrityCount: 0,
      collectionType: 'scrap-heap', condition: 'recycling',
    }
  }

  const avgPatina = Math.round(artifacts.reduce((s, a) => s + a.patinaQuality, 0) / artifacts.length)
  const avgIntegrity = Math.round(artifacts.reduce((s, a) => s + a.structuralIntegrity, 0) / artifacts.length)
  const avgValue = Math.round(artifacts.reduce((s, a) => s + a.antiqueValue, 0) / artifacts.length)

  const statueCount = artifacts.filter((a) => a.condition === 'statue-of-liberty').length
  const dustCount = artifacts.filter((a) => a.condition === 'verdigris-dust').length
  const gracefulCount = artifacts.filter((a) => a.patina.hasGracefulAging).length
  const highIntegrityCount = artifacts.filter((a) => a.integrity.hasHighIntegrity).length

  const collectionType = classifyCollectionType(artifacts)
  const avgScore = artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length
  const condition = classifyCollectionCondition(avgScore)

  return {
    directory: dirPath, artifacts, avgPatina, avgIntegrity, avgValue,
    statueCount, dustCount, gracefulCount, highIntegrityCount,
    collectionType, condition,
  }
}

// ─── Collection Classification ──────────────────────────────────────────────

/** @example classifyCollectionType(artifacts) returns collection type */
export function classifyCollectionType(artifacts: CopperArtifact[]): CopperCollection['collectionType'] {
  if (artifacts.length === 0) return 'scrap-heap'
  const avgScore = artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length
  const statueCnt = artifacts.filter((a) => a.condition === 'statue-of-liberty').length
  if (avgScore >= 75 && statueCnt >= Math.ceil(artifacts.length * 0.3)) return 'museum'
  if (avgScore >= 60) return 'gallery'
  if (avgScore >= 45) return 'exhibition'
  if (avgScore >= 30) return 'workshop'
  if (avgScore >= 15) return 'salvage-yard'
  return 'scrap-heap'
}

/** @example classifyCollectionCondition(avgScore) returns condition */
export function classifyCollectionCondition(avgScore: number): CopperCollection['condition'] {
  if (avgScore >= 80) return 'national-treasure'
  if (avgScore >= 65) return 'heritage-collection'
  if (avgScore >= 50) return 'art-gallery'
  if (avgScore >= 35) return 'antique-shop'
  if (avgScore >= 20) return 'junk-yard'
  return 'recycling'
}

/** @example classifyAppraiserGrade(avgValue) returns grade */
export function classifyAppraiserGrade(avgValue: number): CopperPatinaResult['stats']['appraiserGrade'] {
  if (avgValue >= 80) return 'chief-curator'
  if (avgValue >= 65) return 'master-appraiser'
  if (avgValue >= 50) return 'antique-dealer'
  if (avgValue >= 35) return 'collector'
  if (avgValue >= 20) return 'scavenger'
  return 'scrapper'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(artifacts, collections, museum, stats) returns recommendations */
export function generateRecommendations(
  artifacts: CopperArtifact[],
  collections: CopperCollection[],
  museum: CopperPatinaResult['museum'],
  stats: CopperPatinaResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgPatinaQuality < 50) recs.push('Improve patina quality — let your code age more gracefully')
  if (stats.avgOxidationDepth < 50) recs.push('Deepen oxidation — build more mature code layers')
  if (stats.avgVerdigrisBeauty < 50) recs.push('Enhance verdigris beauty — add distinctive character to your code')
  if (stats.avgStructuralIntegrity < 50) recs.push('Strengthen structural integrity — reinforce your code foundations')
  if (stats.avgEnvironmentalAdaptation < 50) recs.push('Improve environmental adaptation — make code more flexible')
  if (stats.avgAntiqueValue < 50) recs.push('Increase antique value — invest in lasting code quality')
  if (stats.verdigrisDustCount > artifacts.length * 0.5) recs.push('Too much verdigris dust — over half the codebase is crumbling')
  if (stats.hasHighValueCount === 0) recs.push('No museum-piece artifacts found — cultivate your craft with patience')
  if (collections.length > 0 && museum.overallValue < 60) recs.push('Overall museum value is low — consult the chief curator')
  if (recs.length === 0) recs.push('Magnificent patina achieved — your copper artifacts stand the test of time')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildCopperPatinaResult(files, contents, options) returns full result */
export function buildCopperPatinaResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): CopperPatinaResult {
  const artifacts: CopperArtifact[] = files.map((file, i) =>
    analyzeCopperArtifact(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperArtifact[]>()
  for (const artifact of artifacts) {
    const dir = artifact.file.includes('/')
      ? artifact.file.substring(0, artifact.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(artifact)
    } else {
      dirMap.set(dir, [artifact])
    }
  }

  const collections: CopperCollection[] = Array.from(dirMap.entries()).map(([dir, dirArtifacts]) =>
    analyzeCopperCollection(dirArtifacts, dir),
  )

  const avgPatina = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.patinaQuality, 0) / artifacts.length)
    : 0
  const avgIntegrity = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.structuralIntegrity, 0) / artifacts.length)
    : 0
  const avgValue = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.antiqueValue, 0) / artifacts.length)
    : 0
  const overallValue = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length)
    : 0
  const isHeritage = overallValue >= 65

  const museum: CopperPatinaResult['museum'] = {
    avgPatina, avgIntegrity, avgValue, isHeritage, overallValue,
  }

  const avgPatinaQuality = avgPatina
  const avgOxidationDepth = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.oxidationDepth, 0) / artifacts.length)
    : 0
  const avgVerdigrisBeauty = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.verdigrisBeauty, 0) / artifacts.length)
    : 0
  const avgStructuralIntegrity = avgIntegrity
  const avgEnvironmentalAdaptation = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.environmentalAdaptation, 0) / artifacts.length)
    : 0
  const avgAntiqueValue = avgValue

  const conditionCounts = {
    statueOfLiberty: 0, copperDome: 0, weatherVane: 0,
    penny: 0, scrapWire: 0, verdigrisDust: 0,
  }
  for (const a of artifacts) {
    switch (a.condition) {
      case 'statue-of-liberty': conditionCounts.statueOfLiberty++; break
      case 'copper-dome': conditionCounts.copperDome++; break
      case 'weather-vane': conditionCounts.weatherVane++; break
      case 'penny': conditionCounts.penny++; break
      case 'scrap-wire': conditionCounts.scrapWire++; break
      case 'verdigris-dust': conditionCounts.verdigrisDust++; break
    }
  }

  const hasGracefulAgingCount = artifacts.filter((a) => a.patina.hasGracefulAging).length
  const hasDeepMaturityCount = artifacts.filter((a) => a.oxidation.hasDeepMaturity).length
  const hasDistinctiveCharacterCount = artifacts.filter((a) => a.verdigris.hasDistinctiveCharacter).length
  const hasHighIntegrityCount = artifacts.filter((a) => a.integrity.hasHighIntegrity).length
  const hasHighAdaptationCount = artifacts.filter((a) => a.adaptation.hasHighAdaptation).length
  const hasHighValueCount = artifacts.filter((a) => a.antique.hasHighValue).length

  const bestArtifact = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.qualityScore > best.qualityScore ? a : best).file
    : ''
  const bestPatina = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.patinaQuality > best.patinaQuality ? a : best).file
    : ''
  const mostMature = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.oxidationDepth > best.oxidationDepth ? a : best).file
    : ''
  const mostCharacter = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.verdigrisBeauty > best.verdigrisBeauty ? a : best).file
    : ''
  const strongest = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.structuralIntegrity > best.structuralIntegrity ? a : best).file
    : ''
  const mostValuable = artifacts.length > 0
    ? artifacts.reduce((best, a) => a.antiqueValue > best.antiqueValue ? a : best).file
    : ''

  const appraiserGrade = classifyAppraiserGrade(overallValue)

  const stats: CopperPatinaResult['stats'] = {
    totalFiles: files.length, totalCollections: collections.length,
    avgPatinaQuality, avgOxidationDepth, avgVerdigrisBeauty,
    avgStructuralIntegrity, avgEnvironmentalAdaptation, avgAntiqueValue,
    statueOfLibertyCount: conditionCounts.statueOfLiberty,
    copperDomeCount: conditionCounts.copperDome,
    weatherVaneCount: conditionCounts.weatherVane,
    pennyCount: conditionCounts.penny,
    scrapWireCount: conditionCounts.scrapWire,
    verdigrisDustCount: conditionCounts.verdigrisDust,
    hasGracefulAgingCount, hasDeepMaturityCount, hasDistinctiveCharacterCount,
    hasHighIntegrityCount, hasHighAdaptationCount, hasHighValueCount,
    overallValue, appraiserGrade,
    bestArtifact, bestPatina, mostMature,
    mostCharacter, strongest, mostValuable,
  }

  const recommendations = generateRecommendations(artifacts, collections, museum, stats)

  return { artifacts, collections, museum, stats, recommendations }
}
