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

export interface ClarityMeasure {
  level: number
  grade: 'museum-grade' | 'gem-grade' | 'specimen-grade' | 'craft-grade' | 'rough' | 'opaque'
  isClear: boolean
  hasTransparency: boolean
  hasNoBubbles: boolean
  hasNoCloudiness: boolean
  hasNoCracks: boolean
  hasNoScratches: boolean
  hasFluorescence: boolean
  hasProperPolish: boolean
  hasNoInternalFractures: boolean
  hasColorDepth: boolean
  bubbleCount: number
  crackCount: number
}

export interface InclusionMeasure {
  quality: number
  type: 'complete-organism' | 'partial-organism' | 'trace-fossil' | 'plant-matter' | 'debris' | 'empty'
  hasCompleteDocumentation: boolean
  hasPreservedDetail: boolean
  hasVisibleStructure: boolean
  hasNoDecomposition: boolean
  hasProperEnvelopment: boolean
  hasNoShrinkage: boolean
  hasAirPocket: boolean
  hasNoContamination: boolean
  hasProperPosition: boolean
  hasAppendages: boolean
  decompositionCount: number
  contaminationCount: number
}

export interface HardnessMeasure {
  level: number
  scale: 'copal' | 'semi-fossilized' | 'baltic' | 'dominican' | 'burmite' | 'jet'
  isHard: boolean
  hasScratchResistance: boolean
  hasImpactResistance: boolean
  hasNoCrazing: boolean
  hasNoChipping: boolean
  hasProperPolymerization: boolean
  hasNoSoftSpots: boolean
  hasThermalStability: boolean
  hasChemicalResistance: boolean
  hasNoDeformation: boolean
  crazingCount: number
  softSpotCount: number
}

export interface AgeMeasure {
  depth: number
  era: 'cretaceous' | 'jurassic' | 'eocene' | 'oligocene' | 'miocene' | 'holocene'
  isMature: boolean
  hasGeologicalRecord: boolean
  hasStratigraphicContext: boolean
  hasIndexFossils: boolean
  hasNoPseudoFossils: boolean
  hasRadioactiveDating: boolean
  hasPaleoenvironment: boolean
  hasNoAgeContamination: boolean
  hasEvolutionaryRecord: boolean
  hasNoGap: boolean
  pseudoCount: number
  gapCount: number
}

export interface PreservationMeasure {
  state: number
  quality: 'pristine' | 'excellent' | 'good' | 'fair' | 'poor' | 'degraded'
  isWellPreserved: boolean
  hasProperConservation: boolean
  hasNoDegradation: boolean
  hasNoOxidation: boolean
  hasProperStorage: boolean
  hasUVProtection: boolean
  hasNoWeathering: boolean
  hasStabilization: boolean
  hasNoPyriteDecay: boolean
  hasConservationRecord: boolean
  degradationCount: number
  oxidationCount: number
}

export interface ValueMeasure {
  score: number
  appraisal: 'priceless' | 'museum-quality' | 'collector-grade' | 'specimen-grade' | 'craft-grade' | 'novelty'
  isValuable: boolean
  hasRarity: boolean
  hasScientificValue: boolean
  hasAestheticValue: boolean
  hasHistoricalValue: boolean
  hasNoForgery: boolean
  hasProperProvenance: boolean
  hasNoDamage: boolean
  hasMarketValue: boolean
  hasNoReproduction: boolean
  forgeryCount: number
  damageCount: number
}

export interface AmberSpecimen {
  file: string
  amberClarity: number
  inclusionQuality: number
  resinHardness: number
  fossilAge: number
  preservationState: number
  specimenValue: number
  clarity: ClarityMeasure
  inclusion: InclusionMeasure
  hardness: HardnessMeasure
  age: AgeMeasure
  preservation: PreservationMeasure
  value: ValueMeasure
  condition: 'baltic-gold' | 'dominican-blue' | 'burmite-royal' | 'copal-raw' | 'jet-black' | 'sandstone'
  qualityScore: number
}

export interface AmberCollection {
  directory: string
  specimens: AmberSpecimen[]
  avgClarity: number
  avgHardness: number
  avgValue: number
  balticGoldCount: number
  sandstoneCount: number
  clearCount: number
  hardCount: number
  collectionType: 'museum' | 'private-collection' | 'exhibition' | 'workshop' | 'quarry' | 'beach'
  condition: 'world-heritage' | 'national-collection' | 'university-museum' | 'shop-display' | 'flea-market' | 'sandbox'
}

export interface AmberFossilResult {
  specimens: AmberSpecimen[]
  collections: AmberCollection[]
  museum: {
    avgClarity: number
    avgHardness: number
    avgValue: number
    isPriceless: boolean
    overallValue: number
  }
  stats: {
    totalFiles: number
    totalCollections: number
    avgAmberClarity: number
    avgInclusionQuality: number
    avgResinHardness: number
    avgFossilAge: number
    avgPreservationState: number
    avgSpecimenValue: number
    balticGoldCount: number
    dominicanBlueCount: number
    burmiteRoyalCount: number
    copalRawCount: number
    jetBlackCount: number
    sandstoneCount: number
    isClearCount: number
    hasCompleteDocumentationCount: number
    isHardCount: number
    isMatureCount: number
    isWellPreservedCount: number
    isValuableCount: number
    overallValue: number
    paleontologistGrade: 'curator' | 'paleontologist' | 'collector' | 'enthusiast' | 'tourist' | 'beachcomber'
    bestSpecimen: string
    clearest: string
    bestDocumented: string
    hardest: string
    oldest: string
    mostValuable: string
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

// ─── Measure Functions ──────────────────────────────────────────────────────

/** @example measureClarity(content) returns ClarityMeasure */
export function measureClarity(content: string): ClarityMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const classCount = countClasses(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const generics = countGenerics(content)
  const jsdoc = countJSDoc(content)
  const accessMods = countAccessModifiers(content)

  const bubbleCount = consoleCount + anyCount
  const crackCount = deepNested
  const isClear = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && bubbleCount === 0
  const hasTransparency = interfaceCount > 0 && typeCount > 0
  const hasNoBubbles = bubbleCount === 0
  const hasNoCloudiness = anyCount === 0
  const hasNoCracks = crackCount === 0
  const hasNoScratches = consoleCount === 0
  const hasFluorescence = generics > 0
  const hasProperPolish = accessMods > 0
  const hasNoInternalFractures = deepNested === 0
  const hasColorDepth = exportCount > 0 && importCount > 0

  let level = 0
  if (isClear) level += 15
  if (hasTransparency) level += 15
  if (hasNoBubbles) level += 10
  if (hasNoCloudiness) level += 10
  if (hasNoCracks) level += 10
  if (hasNoScratches) level += 10
  if (hasFluorescence) level += 10
  if (hasProperPolish) level += 10
  if (hasColorDepth) level += 10
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let grade: ClarityMeasure['grade'] = 'opaque'
  if (level >= 80 && isClear) grade = 'museum-grade'
  else if (level >= 65 && hasTransparency) grade = 'gem-grade'
  else if (level >= 50) grade = 'specimen-grade'
  else if (level >= 35) grade = 'craft-grade'
  else if (level >= 20) grade = 'rough'

  return {
    bubbleCount,
    crackCount,
    grade,
    hasColorDepth,
    hasFluorescence,
    hasNoBubbles,
    hasNoCloudiness,
    hasNoCracks,
    hasNoInternalFractures,
    hasNoScratches,
    hasProperPolish,
    hasTransparency,
    isClear,
    level,
  }
}

/** @example measureInclusion(content) returns InclusionMeasure */
export function measureInclusion(content: string): InclusionMeasure {
  const jsdoc = countJSDoc(content)
  const exportCount = countExports(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const classCount = countClasses(content)
  const enumCountVal = enumCount(content)
  const generics = countGenerics(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)

  const decompositionCount = commentedCode
  const contaminationCount = anyCount + consoleCount
  const hasCompleteDocumentation = jsdoc > 0 && exportCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasPreservedDetail = jsdoc > 0
  const hasVisibleStructure = interfaceCount > 0 && typeCount > 0
  const hasNoDecomposition = decompositionCount === 0
  const hasProperEnvelopment = classCount > 0 && (interfaceCount > 0 || typeCount > 0)
  const hasNoShrinkage = exportCount > 0
  const hasAirPocket = jsdoc > 0 && generics > 0
  const hasNoContamination = contaminationCount === 0
  const hasProperPosition = exportCount > 0 && jsdoc > 0
  const hasAppendages = enumCountVal > 0

  let quality = 0
  if (hasCompleteDocumentation) quality += 15
  if (hasPreservedDetail) quality += 10
  if (hasVisibleStructure) quality += 10
  if (hasNoDecomposition) quality += 10
  if (hasProperEnvelopment) quality += 10
  if (hasNoShrinkage) quality += 10
  if (hasAirPocket) quality += 10
  if (hasNoContamination) quality += 10
  if (hasProperPosition) quality += 10
  if (hasAppendages) quality += 5
  quality = Math.min(quality, 100)
  quality = Math.max(quality, 0)

  let type: InclusionMeasure['type'] = 'empty'
  if (quality >= 80 && hasCompleteDocumentation) type = 'complete-organism'
  else if (quality >= 65 && hasPreservedDetail) type = 'partial-organism'
  else if (quality >= 50) type = 'trace-fossil'
  else if (quality >= 35) type = 'plant-matter'
  else if (quality >= 20) type = 'debris'

  return {
    contaminationCount,
    decompositionCount,
    hasAirPocket,
    hasAppendages,
    hasCompleteDocumentation,
    hasNoContamination,
    hasNoDecomposition,
    hasNoShrinkage,
    hasPreservedDetail,
    hasProperEnvelopment,
    hasProperPosition,
    hasVisibleStructure,
    quality,
    type,
  }
}

/** @example measureHardness(content) returns HardnessMeasure */
export function measureHardness(content: string): HardnessMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const readonlyCount = (content.match(READONLY_REGEX) ?? []).length
  const staticCount = (content.match(STATIC_REGEX) ?? []).length
  const tryCatch = countTryCatch(content)
  const accessMods = countAccessModifiers(content)

  const crazingCount = consoleCount + anyCount
  const softSpotCount = deepNested
  const isHard = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && crazingCount === 0
  const hasScratchResistance = readonlyCount > 0 || staticCount > 0
  const hasImpactResistance = tryCatch > 0
  const hasNoCrazing = crazingCount === 0
  const hasNoChipping = deepNested === 0
  const hasProperPolymerization = classCount > 0 && interfaceCount > 0
  const hasNoSoftSpots = softSpotCount === 0
  const hasThermalStability = accessMods > 0
  const hasChemicalResistance = anyCount === 0
  const hasNoDeformation = exportCount > 0 && importCount > 0

  let level = 0
  if (isHard) level += 15
  if (hasScratchResistance) level += 10
  if (hasImpactResistance) level += 10
  if (hasNoCrazing) level += 10
  if (hasNoChipping) level += 10
  if (hasProperPolymerization) level += 10
  if (hasNoSoftSpots) level += 10
  if (hasThermalStability) level += 10
  if (hasChemicalResistance) level += 10
  if (hasNoDeformation) level += 5
  level = Math.min(level, 100)
  level = Math.max(level, 0)

  let scale: HardnessMeasure['scale'] = 'jet'
  if (level >= 80 && isHard) scale = 'copal'
  else if (level >= 65 && hasProperPolymerization) scale = 'semi-fossilized'
  else if (level >= 50) scale = 'baltic'
  else if (level >= 35) scale = 'dominican'
  else if (level >= 20) scale = 'burmite'

  return {
    crazingCount,
    hasChemicalResistance,
    hasImpactResistance,
    hasNoChipping,
    hasNoCrazing,
    hasNoDeformation,
    hasNoSoftSpots,
    hasProperPolymerization,
    hasScratchResistance,
    hasThermalStability,
    isHard,
    level,
    scale,
    softSpotCount,
  }
}

/** @example measureAge(content) returns AgeMeasure */
export function measureAge(content: string): AgeMeasure {
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const asyncCount = countAsync(content)
  const generics = countGenerics(content)
  const enumCountVal = enumCount(content)
  const anyCount = countAny(content)
  const commentedCode = countCommentedCode(content)

  const pseudoCount = anyCount
  const gapCount = commentedCode
  const isMature = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && functionCount > 0
  const hasGeologicalRecord = exportCount > 0 && importCount > 0
  const hasStratigraphicContext = interfaceCount > 0 && typeCount > 0
  const hasIndexFossils = generics > 0
  const hasNoPseudoFossils = pseudoCount === 0
  const hasRadioactiveDating = asyncCount > 0
  const hasPaleoenvironment = classCount > 0 && interfaceCount > 0
  const hasNoAgeContamination = anyCount === 0
  const hasEvolutionaryRecord = (functionCount + arrowCount) >= 2
  const hasNoGap = gapCount === 0

  let depth = 0
  if (isMature) depth += 15
  if (hasGeologicalRecord) depth += 10
  if (hasStratigraphicContext) depth += 10
  if (hasIndexFossils) depth += 10
  if (hasNoPseudoFossils) depth += 10
  if (hasRadioactiveDating) depth += 10
  if (hasPaleoenvironment) depth += 10
  if (hasNoAgeContamination) depth += 10
  if (hasEvolutionaryRecord) depth += 10
  if (hasNoGap) depth += 5
  depth = Math.min(depth, 100)
  depth = Math.max(depth, 0)

  let era: AgeMeasure['era'] = 'holocene'
  if (depth >= 80 && isMature) era = 'cretaceous'
  else if (depth >= 65) era = 'jurassic'
  else if (depth >= 50) era = 'eocene'
  else if (depth >= 35) era = 'oligocene'
  else if (depth >= 20) era = 'miocene'

  return {
    depth,
    era,
    hasEvolutionaryRecord,
    hasGeologicalRecord,
    hasIndexFossils,
    hasNoAgeContamination,
    hasNoGap,
    hasNoPseudoFossils,
    hasPaleoenvironment,
    hasRadioactiveDating,
    hasStratigraphicContext,
    isMature,
    gapCount,
    pseudoCount,
  }
}

/** @example measurePreservation(content) returns PreservationMeasure */
export function measurePreservation(content: string): PreservationMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const deepNested = countDeepNested(content)
  const tryCatch = countTryCatch(content)
  const commentedCode = countCommentedCode(content)
  const jsdoc = countJSDoc(content)
  const accessMods = countAccessModifiers(content)

  const degradationCount = consoleCount + anyCount
  const oxidationCount = commentedCode
  const isWellPreserved = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && degradationCount === 0
  const hasProperConservation = tryCatch > 0
  const hasNoDegradation = degradationCount === 0
  const hasNoOxidation = oxidationCount === 0
  const hasProperStorage = exportCount > 0 && importCount > 0
  const hasUVProtection = accessMods > 0
  const hasNoWeathering = deepNested === 0
  const hasStabilization = interfaceCount > 0 && typeCount > 0
  const hasNoPyriteDecay = anyCount === 0
  const hasConservationRecord = jsdoc > 0

  let state = 0
  if (isWellPreserved) state += 15
  if (hasProperConservation) state += 10
  if (hasNoDegradation) state += 10
  if (hasNoOxidation) state += 10
  if (hasProperStorage) state += 10
  if (hasUVProtection) state += 10
  if (hasNoWeathering) state += 10
  if (hasStabilization) state += 10
  if (hasNoPyriteDecay) state += 10
  if (hasConservationRecord) state += 5
  state = Math.min(state, 100)
  state = Math.max(state, 0)

  let quality: PreservationMeasure['quality'] = 'degraded'
  if (isWellPreserved && state >= 80) quality = 'pristine'
  else if (state >= 65) quality = 'excellent'
  else if (state >= 50) quality = 'good'
  else if (state >= 35) quality = 'fair'
  else if (state >= 20) quality = 'poor'

  return {
    degradationCount,
    hasConservationRecord,
    hasNoDegradation,
    hasNoOxidation,
    hasNoPyriteDecay,
    hasNoWeathering,
    hasProperConservation,
    hasProperStorage,
    hasStabilization,
    hasUVProtection,
    isWellPreserved,
    oxidationCount,
    quality,
    state,
  }
}

/** @example measureValue(content) returns ValueMeasure */
export function measureValue(content: string): ValueMeasure {
  const exportCount = countExports(content)
  const importCount = countImportKeywords(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const enumCountVal = enumCount(content)
  const generics = countGenerics(content)
  const anyCount = countAny(content)
  const consoleCount = countConsole(content)
  const commentedCode = countCommentedCode(content)
  const jsdoc = countJSDoc(content)

  const forgeryCount = commentedCode
  const damageCount = anyCount + consoleCount
  const isValuable = classCount > 0 && (interfaceCount > 0 || typeCount > 0) && damageCount === 0
  const hasRarity = generics > 0
  const hasScientificValue = interfaceCount > 0 && typeCount > 0
  const hasAestheticValue = jsdoc > 0
  const hasHistoricalValue = enumCountVal > 0
  const hasNoForgery = forgeryCount === 0
  const hasProperProvenance = exportCount > 0 && importCount > 0
  const hasNoDamage = damageCount === 0
  const hasMarketValue = exportCount > 0
  const hasNoReproduction = classCount > 0

  let score = 0
  if (isValuable) score += 15
  if (hasRarity) score += 10
  if (hasScientificValue) score += 10
  if (hasAestheticValue) score += 10
  if (hasHistoricalValue) score += 10
  if (hasNoForgery) score += 10
  if (hasProperProvenance) score += 10
  if (hasNoDamage) score += 10
  if (hasMarketValue) score += 10
  if (hasNoReproduction) score += 5
  score = Math.min(score, 100)
  score = Math.max(score, 0)

  let appraisal: ValueMeasure['appraisal'] = 'novelty'
  if (isValuable && score >= 80) appraisal = 'priceless'
  else if (score >= 65) appraisal = 'museum-quality'
  else if (score >= 50) appraisal = 'collector-grade'
  else if (score >= 35) appraisal = 'specimen-grade'
  else if (score >= 20) appraisal = 'craft-grade'

  return {
    damageCount,
    forgeryCount,
    hasAestheticValue,
    hasHistoricalValue,
    hasMarketValue,
    hasNoDamage,
    hasNoForgery,
    hasNoReproduction,
    hasProperProvenance,
    hasRarity,
    hasScientificValue,
    isValuable,
    appraisal,
    score,
  }
}

// ─── Classifiers ────────────────────────────────────────────────────────────

/** @example classifyCondition(score) returns condition string */
export function classifyCondition(score: number): AmberSpecimen['condition'] {
  if (score >= 80) return 'baltic-gold'
  if (score >= 65) return 'dominican-blue'
  if (score >= 50) return 'burmite-royal'
  if (score >= 35) return 'copal-raw'
  if (score >= 20) return 'jet-black'
  return 'sandstone'
}

/** @example classifyCollectionType(specimens) returns collection type */
export function classifyCollectionType(specimens: AmberSpecimen[]): AmberCollection['collectionType'] {
  if (specimens.length === 0) return 'beach'
  const avgQuality = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  const balticCount = specimens.filter((sp) => sp.condition === 'baltic-gold').length
  if (avgQuality >= 75 && balticCount >= Math.ceil(specimens.length * 0.3)) return 'museum'
  if (avgQuality >= 60) return 'private-collection'
  if (avgQuality >= 45) return 'exhibition'
  if (avgQuality >= 30) return 'workshop'
  if (avgQuality >= 15) return 'quarry'
  return 'beach'
}

/** @example classifyCollectionCondition(avgQuality) returns condition */
export function classifyCollectionCondition(avgQuality: number): AmberCollection['condition'] {
  if (avgQuality >= 80) return 'world-heritage'
  if (avgQuality >= 65) return 'national-collection'
  if (avgQuality >= 50) return 'university-museum'
  if (avgQuality >= 35) return 'shop-display'
  if (avgQuality >= 20) return 'flea-market'
  return 'sandbox'
}

/** @example classifyPaleontologistGrade(avgValue) returns grade */
export function classifyPaleontologistGrade(avgValue: number): AmberFossilResult['stats']['paleontologistGrade'] {
  if (avgValue >= 80) return 'curator'
  if (avgValue >= 65) return 'paleontologist'
  if (avgValue >= 50) return 'collector'
  if (avgValue >= 35) return 'enthusiast'
  if (avgValue >= 20) return 'tourist'
  return 'beachcomber'
}

// ─── Specimen Analysis ──────────────────────────────────────────────────────

/** @example analyzeAmberSpecimen(content, filePath) returns AmberSpecimen */
export function analyzeAmberSpecimen(content: string, filePath: string): AmberSpecimen {
  const clarity = measureClarity(content)
  const inclusion = measureInclusion(content)
  const hardness = measureHardness(content)
  const age = measureAge(content)
  const preservation = measurePreservation(content)
  const value = measureValue(content)

  const qualityScore = Math.round(
    clarity.level * 0.2 + inclusion.quality * 0.2 + hardness.level * 0.15 +
    age.depth * 0.15 + preservation.state * 0.15 + value.score * 0.15,
  )

  return {
    age,
    amberClarity: clarity.level,
    clarity,
    condition: classifyCondition(qualityScore),
    file: filePath,
    fossilAge: age.depth,
    hardness,
    inclusion,
    inclusionQuality: inclusion.quality,
    preservation,
    preservationState: preservation.state,
    qualityScore,
    resinHardness: hardness.level,
    specimenValue: value.score,
    value,
  }
}

/** @example analyzeAmberCollection(specimens, dirPath) returns AmberCollection */
export function analyzeAmberCollection(specimens: AmberSpecimen[], dirPath: string): AmberCollection {
  const avgClarity = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.amberClarity, 0) / specimens.length) : 0
  const avgHardness = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.resinHardness, 0) / specimens.length) : 0
  const avgValue = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.specimenValue, 0) / specimens.length) : 0
  const balticGoldCount = specimens.filter((sp) => sp.condition === 'baltic-gold').length
  const sandstoneCount = specimens.filter((sp) => sp.condition === 'sandstone').length
  const clearCount = specimens.filter((sp) => sp.clarity.isClear).length
  const hardCount = specimens.filter((sp) => sp.hardness.isHard).length
  const collectionType = classifyCollectionType(specimens)
  const avgQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length) : 0
  const condition = classifyCollectionCondition(avgQuality)

  return {
    avgClarity,
    avgHardness,
    avgValue,
    balticGoldCount,
    clearCount,
    collectionType,
    condition,
    directory: dirPath,
    hardCount,
    sandstoneCount,
    specimens,
  }
}

/** @example generateRecommendations(specimens, collections, museum, stats) returns string[] */
export function generateRecommendations(
  specimens: AmberSpecimen[],
  _collections: AmberCollection[],
  museum: AmberFossilResult['museum'],
  _stats: AmberFossilResult['stats'],
): string[] {
  const recommendations: string[] = []

  if (museum.overallValue < 50) {
    recommendations.push('Collection value is low — add types, interfaces, and documentation to improve preservation quality')
  }

  const opaque = specimens.filter((sp) => sp.condition === 'sandstone')
  if (opaque.length > 0) {
    recommendations.push(`${opaque.length} specimen/specimens are sandstone — add meaningful code structure and exports`)
  }

  const poorClarity = specimens.filter((sp) => !sp.clarity.isClear)
  if (poorClarity.length > 0) {
    recommendations.push(`${poorClarity.length} specimen/specimens have poor clarity — remove any types, console logs, and reduce nesting`)
  }

  const degraded = specimens.filter((sp) => sp.preservation.degradationCount > 0)
  if (degraded.length > 0) {
    recommendations.push(`${degraded.length} specimen/specimens show degradation — clean up technical debt and improve maintainability`)
  }

  if (recommendations.length === 0) {
    recommendations.push('Amber collection is pristine with museum-quality specimens — maintain current preservation standards')
  }

  return recommendations
}

// ─── Builder ────────────────────────────────────────────────────────────────

/** @example buildAmberFossilResult(files, contents, options) returns AmberFossilResult */
export function buildAmberFossilResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): AmberFossilResult {
  const specimens: AmberSpecimen[] = files.map((file, i) =>
    analyzeAmberSpecimen(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberSpecimen[]>()
  for (const specimen of specimens) {
    const dir = specimen.file.includes('/') ? specimen.file.substring(0, specimen.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(specimen)
    } else {
      dirMap.set(dir, [specimen])
    }
  }

  const collections: AmberCollection[] = Array.from(dirMap.entries()).map(([dir, dirSpecimens]) =>
    analyzeAmberCollection(dirSpecimens, dir),
  )

  const avgAmberClarity = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.amberClarity, 0) / specimens.length) : 0
  const avgInclusionQuality = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.inclusionQuality, 0) / specimens.length) : 0
  const avgResinHardness = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.resinHardness, 0) / specimens.length) : 0
  const avgFossilAge = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.fossilAge, 0) / specimens.length) : 0
  const avgPreservationState = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.preservationState, 0) / specimens.length) : 0
  const avgSpecimenValue = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.specimenValue, 0) / specimens.length) : 0
  const overallValue = specimens.length > 0 ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length) : 0

  const museum = {
    avgClarity: avgAmberClarity,
    avgHardness: avgResinHardness,
    avgValue: avgSpecimenValue,
    isPriceless: overallValue >= 65,
    overallValue,
  }

  const balticGoldCount = specimens.filter((sp) => sp.condition === 'baltic-gold').length
  const dominicanBlueCount = specimens.filter((sp) => sp.condition === 'dominican-blue').length
  const burmiteRoyalCount = specimens.filter((sp) => sp.condition === 'burmite-royal').length
  const copalRawCount = specimens.filter((sp) => sp.condition === 'copal-raw').length
  const jetBlackCount = specimens.filter((sp) => sp.condition === 'jet-black').length
  const sandstoneCount = specimens.filter((sp) => sp.condition === 'sandstone').length
  const isClearCount = specimens.filter((sp) => sp.clarity.isClear).length
  const hasCompleteDocumentationCount = specimens.filter((sp) => sp.inclusion.hasCompleteDocumentation).length
  const isHardCount = specimens.filter((sp) => sp.hardness.isHard).length
  const isMatureCount = specimens.filter((sp) => sp.age.isMature).length
  const isWellPreservedCount = specimens.filter((sp) => sp.preservation.isWellPreserved).length
  const isValuableCount = specimens.filter((sp) => sp.value.isValuable).length

  const paleontologistGrade = classifyPaleontologistGrade(overallValue)

  const bestSpecimen = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.qualityScore > best.qualityScore ? sp : best).file : ''
  const clearest = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.amberClarity > best.amberClarity ? sp : best).file : ''
  const bestDocumented = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.inclusionQuality > best.inclusionQuality ? sp : best).file : ''
  const hardest = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.resinHardness > best.resinHardness ? sp : best).file : ''
  const oldest = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.fossilAge > best.fossilAge ? sp : best).file : ''
  const mostValuable = specimens.length > 0
    ? specimens.reduce((best, sp) => sp.specimenValue > best.specimenValue ? sp : best).file : ''

  const stats = {
    avgAmberClarity,
    avgFossilAge,
    avgInclusionQuality,
    avgPreservationState,
    avgResinHardness,
    avgSpecimenValue,
    balticGoldCount,
    bestDocumented,
    bestSpecimen,
    burmiteRoyalCount,
    clearest,
    copalRawCount,
    dominicanBlueCount,
    hasCompleteDocumentationCount,
    hardest,
    isClearCount,
    isHardCount,
    isMatureCount,
    isValuableCount,
    isWellPreservedCount,
    jetBlackCount,
    mostValuable,
    oldest,
    overallValue,
    paleontologistGrade,
    sandstoneCount,
    totalCollections: collections.length,
    totalFiles: files.length,
  }

  const recommendations = generateRecommendations(specimens, collections, museum, stats)

  return { collections, museum, recommendations, specimens, stats }
}
