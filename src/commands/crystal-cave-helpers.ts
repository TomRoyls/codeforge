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

function genericsCount_safe(content: string): number { return countMatches(content, GENERICS_REGEX) }
function reExportCount_safe(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function enumCount_safe(content: string): number { return countMatches(content, ENUM_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface ClarityMeasure {
  level: number
  grade: 'diamond-grade' | 'quartz-clear' | 'frosted' | 'cloudy' | 'opaque' | 'muddy'
  hasHighClarity: boolean
  hasTransparency: boolean
  hasNoInclusions: boolean
  hasProperRefraction: boolean
  hasNoFractures: boolean
  hasBrilliance: boolean
  hasDispersion: boolean
  hasNoInternalReflections: boolean
  hasScintillation: boolean
  hasPerfectTermination: boolean
  inclusionCount: number
  fractureCount: number
}

export interface FormationMeasure {
  quality: number
  type: 'selenite' | 'amethyst' | 'calcite' | 'stalactite' | 'flowstone' | 'mud'
  hasProperStructure: boolean
  hasCrystalHabits: boolean
  hasProperGrowth: boolean
  hasNoMalformation: boolean
  hasGeometricPrecision: boolean
  hasNoIrregularGrowth: boolean
  hasProperOrientation: boolean
  hasPrismaticForm: boolean
  hasNoTwinning: boolean
  hasPerfectSymmetry: boolean
  malformationCount: number
  twinningCount: number
}

export interface LuminescenceMeasure {
  level: number
  type: 'fluorescent' | 'phosphorescent' | 'triboluminescent' | 'radioluminescent' | 'dim' | 'dark'
  hasHighLuminescence: boolean
  hasProperGlow: boolean
  hasUVResponse: boolean
  hasNoDarkZones: boolean
  hasProperEmission: boolean
  hasCathodoluminescence: boolean
  hasNoQuenching: boolean
  hasProperExcitation: boolean
  hasNoShadow: boolean
  hasAfterglow: boolean
  hasProperWavelength: boolean
  darkZoneCount: number
  quenchingCount: number
}

export interface GeodeMeasure {
  depth: number
  interior: 'crystal-filled' | 'partially-filled' | 'hollow' | 'solid' | 'cracked' | 'empty'
  hasDeepContent: boolean
  hasHiddenBeauty: boolean
  hasProperCavity: boolean
  hasInnerCrystals: boolean
  hasNoDeadSpace: boolean
  hasProperFormation: boolean
  hasNoCollapse: boolean
  hasRevealable: boolean
  hasNoFalseExterior: boolean
  hasTreasure: boolean
  deadSpaceCount: number
  collapseCount: number
}

export interface PurityMeasure {
  level: number
  state: 'ultra-pure' | 'high-purity' | 'pure' | 'impure' | 'contaminated' | 'polluted'
  hasHighPurity: boolean
  hasNoContamination: boolean
  hasProperComposition: boolean
  hasNoForeignMatter: boolean
  hasChemicalStability: boolean
  hasNoOxidation: boolean
  hasProperCrystallization: boolean
  hasNoInclusions: boolean
  hasHomogeneous: boolean
  hasNoSegregation: boolean
  contaminationCount: number
  segregationCount: number
}

export interface WonderMeasure {
  score: number
  impact: 'breathtaking' | 'magnificent' | 'beautiful' | 'pleasant' | 'ordinary' | 'none'
  hasHighWonder: boolean
  hasAwe: boolean
  hasBeauty: boolean
  hasNoMediocrity: boolean
  hasNaturalWonder: boolean
  hasNoArtificiality: boolean
  hasInspiring: boolean
  hasNoDullness: boolean
  hasSpectacular: boolean
  hasNoBoredom: boolean
  hasMemorable: boolean
  mediocrityCount: number
  dullnessCount: number
}

export interface CrystalFormation {
  file: string
  crystalClarity: number
  formationQuality: number
  luminescence: number
  geodeDepth: number
  mineralPurity: number
  caveWonder: number
  clarity: ClarityMeasure
  formation: FormationMeasure
  luminescence: LuminescenceMeasure
  geode: GeodeMeasure
  purity: PurityMeasure
  wonder: WonderMeasure
  condition: 'naica-mine' | 'crystal-cathedral' | 'amethyst-cave' | 'geode-collection' | 'rock-shop' | 'gravel-pit'
  qualityScore: number
}

export interface CaveChamber {
  directory: string
  formations: CrystalFormation[]
  avgClarity: number
  avgFormation: number
  avgWonder: number
  naicaCount: number
  gravelCount: number
  clearCount: number
  wonderCount: number
  chamberType: 'grand-cathedral' | 'crystal-gallery' | 'geode-room' | 'flowstone-chamber' | 'dripping-cave' | 'mud-cave'
  condition: 'natural-wonder' | 'show-cave' | 'wild-cave' | 'mine-tunnel' | 'basement' | 'pothole'
}

export interface CrystalCaveResult {
  formations: CrystalFormation[]
  chambers: CaveChamber[]
  cavern: {
    avgClarity: number
    avgFormation: number
    avgWonder: number
    isMagnificent: boolean
    overallWonder: number
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgCrystalClarity: number
    avgFormationQuality: number
    avgLuminescence: number
    avgGeodeDepth: number
    avgMineralPurity: number
    avgCaveWonder: number
    naicaMineCount: number
    crystalCathedralCount: number
    amethystCaveCount: number
    geodeCollectionCount: number
    rockShopCount: number
    gravelPitCount: number
    hasHighClarityCount: number
    hasProperStructureCount: number
    hasHighLuminescenceCount: number
    hasDeepContentCount: number
    hasHighPurityCount: number
    hasHighWonderCount: number
    overallWonder: number
    spelunkerGrade: 'master-spelunker' | 'geologist' | 'crystallographer' | 'collector' | 'tourist' | 'surface-dweller'
    bestFormation: string
    clearest: string
    bestFormed: string
    mostLuminous: string
    deepest: string
    mostWonderful: string
  }
  recommendations: string[]
}

// ─── Clarity Measurement ────────────────────────────────────────────────────

/** @example measureClarity(content) returns clarity analysis */
export function measureClarity(content: string): ClarityMeasure {
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

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (exportCount > 0) level += 8
  if (importCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  if (privateCount === 0) level += 3
  level = Math.min(100, Math.max(0, Math.round(level)))

  const inclusionCount = consoleCount + anyCount
  const fractureCount = deepNestedCount + privateCount

  const hasHighClarity = level >= 75 && hasStructure && hasTypes
  const hasTransparency = hasStructure && hasTypes && hasFunctions
  const hasNoInclusions = inclusionCount === 0
  const hasProperRefraction = hasStructure && hasTypes && genericsCount > 0
  const hasNoFractures = fractureCount === 0
  const hasBrilliance = exportCount > 0 && importCount > 0
  const hasDispersion = hasStructure && hasTypes && jsdocCount > 0
  const hasNoInternalReflections = anyCount === 0 && deepNestedCount === 0
  const hasScintillation = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasPerfectTermination = hasFunctions && exportCount > 0

  let grade: ClarityMeasure['grade'] = 'muddy'
  if (hasHighClarity && hasNoInclusions && hasNoFractures && hasProperRefraction) grade = 'diamond-grade'
  else if (hasHighClarity && hasNoInclusions) grade = 'quartz-clear'
  else if (hasHighClarity) grade = 'frosted'
  else if (hasTransparency && hasBrilliance) grade = 'cloudy'
  else if (level > 30) grade = 'opaque'

  return {
    level, grade, hasHighClarity, hasTransparency, hasNoInclusions,
    hasProperRefraction, hasNoFractures, hasBrilliance, hasDispersion,
    hasNoInternalReflections, hasScintillation, hasPerfectTermination,
    inclusionCount, fractureCount,
  }
}

// ─── Formation Measurement ──────────────────────────────────────────────────

/** @example measureFormation(content) returns formation analysis */
export function measureFormation(content: string): FormationMeasure {
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

  const malformationCount = todoCount + anyCount
  const twinningCount = deepNestedCount + commentedCodeCount

  const hasProperStructure = hasStructure && hasTypes && hasFunctions
  const hasCrystalHabits = hasStructure && hasTypes
  const hasProperGrowth = hasFunctions && exportCount > 0
  const hasNoMalformation = malformationCount === 0
  const hasGeometricPrecision = hasStructure && hasTypes && genericsCount > 0
  const hasNoIrregularGrowth = consoleCount === 0 && deepNestedCount === 0
  const hasProperOrientation = importCount > 0 && exportCount > 0
  const hasPrismaticForm = hasStructure && hasTypes && jsdocCount > 0
  const hasNoTwinning = twinningCount === 0
  const hasPerfectSymmetry = hasStructure && hasTypes && genericsCount > 0 && jsdocCount > 0

  let formationType: FormationMeasure['type'] = 'mud'
  if (quality >= 75 && hasNoMalformation && hasNoTwinning && hasPerfectSymmetry) formationType = 'selenite'
  else if (quality >= 75 && hasNoMalformation) formationType = 'amethyst'
  else if (quality >= 75) formationType = 'calcite'
  else if (hasProperStructure && hasProperGrowth) formationType = 'stalactite'
  else if (quality > 30) formationType = 'flowstone'

  return {
    quality, type: formationType, hasProperStructure, hasCrystalHabits,
    hasProperGrowth, hasNoMalformation, hasGeometricPrecision,
    hasNoIrregularGrowth, hasProperOrientation, hasPrismaticForm,
    hasNoTwinning, hasPerfectSymmetry, malformationCount, twinningCount,
  }
}

// ─── Luminescence Measurement ───────────────────────────────────────────────

/** @example measureLuminescence(content) returns luminescence analysis */
export function measureLuminescence(content: string): LuminescenceMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
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

  let level = 20
  if (hasStructure) level += 10
  if (hasTypes) level += 10
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (enumCount > 0) level += 5
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 8
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (deepNestedCount === 0) level += 4
  if (commentedCodeCount === 0) level += 3
  level = Math.min(100, Math.max(0, Math.round(level)))

  const darkZoneCount = consoleCount + anyCount
  const quenchingCount = deepNestedCount + commentedCodeCount

  const hasHighLuminescence = level >= 75 && hasStructure && hasTypes
  const hasProperGlow = hasStructure && hasTypes && jsdocCount > 0
  const hasUVResponse = exportCount > 0 && importCount > 0
  const hasNoDarkZones = darkZoneCount === 0
  const hasProperEmission = hasFunctions && jsdocCount > 0
  const hasCathodoluminescence = hasStructure && hasTypes && genericsCount > 0
  const hasNoQuenching = quenchingCount === 0
  const hasProperExcitation = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoShadow = consoleCount === 0 && deepNestedCount === 0
  const hasAfterglow = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasProperWavelength = hasFunctions && exportCount > 0

  let luminescenceType: LuminescenceMeasure['type'] = 'dark'
  if (hasHighLuminescence && hasNoDarkZones && hasNoQuenching && hasAfterglow) luminescenceType = 'fluorescent'
  else if (hasHighLuminescence && hasNoDarkZones) luminescenceType = 'phosphorescent'
  else if (hasHighLuminescence) luminescenceType = 'triboluminescent'
  else if (hasProperGlow && hasProperEmission) luminescenceType = 'radioluminescent'
  else if (level > 30) luminescenceType = 'dim'

  return {
    level, type: luminescenceType, hasHighLuminescence, hasProperGlow,
    hasUVResponse, hasNoDarkZones, hasProperEmission, hasCathodoluminescence,
    hasNoQuenching, hasProperExcitation, hasNoShadow, hasAfterglow,
    hasProperWavelength, darkZoneCount, quenchingCount,
  }
}

// ─── Geode Measurement ─────────────────────────────────────────────────────

/** @example measureGeode(content) returns geode analysis */
export function measureGeode(content: string): GeodeMeasure {
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

  const deadSpaceCount = todoCount + anyCount
  const collapseCount = deepNestedCount

  const hasDeepContent = depth >= 75 && hasStructure && hasTypes
  const hasHiddenBeauty = hasStructure && hasTypes && genericsCount > 0
  const hasProperCavity = hasStructure && hasTypes && hasFunctions
  const hasInnerCrystals = hasFunctions && jsdocCount > 0
  const hasNoDeadSpace = deadSpaceCount === 0
  const hasProperFormation = tryCatchCount > 0 && asyncCount > 0
  const hasNoCollapse = collapseCount === 0
  const hasRevealable = hasStructure && hasTypes && exportCount > 0
  const hasNoFalseExterior = consoleCount === 0 && deepNestedCount === 0
  const hasTreasure = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0

  let interior: GeodeMeasure['interior'] = 'empty'
  if (hasDeepContent && hasNoDeadSpace && hasNoCollapse && hasProperFormation) interior = 'crystal-filled'
  else if (hasDeepContent && hasNoDeadSpace) interior = 'partially-filled'
  else if (hasDeepContent) interior = 'hollow'
  else if (hasProperCavity && hasInnerCrystals) interior = 'solid'
  else if (depth > 30) interior = 'cracked'

  return {
    depth, interior, hasDeepContent, hasHiddenBeauty, hasProperCavity,
    hasInnerCrystals, hasNoDeadSpace, hasProperFormation, hasNoCollapse,
    hasRevealable, hasNoFalseExterior, hasTreasure, deadSpaceCount, collapseCount,
  }
}

// ─── Purity Measurement ─────────────────────────────────────────────────────

/** @example measurePurity(content) returns purity analysis */
export function measurePurity(content: string): PurityMeasure {
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

  const contaminationCount = anyCount + consoleCount + todoCount
  const segregationCount = deepNestedCount + privateCount + commentedCodeCount

  const hasHighPurity = level >= 75 && hasStructure && hasTypes
  const hasNoContamination = contaminationCount === 0
  const hasProperComposition = hasStructure && hasTypes && hasFunctions
  const hasNoForeignMatter = commentedCodeCount === 0 && anyCount === 0
  const hasChemicalStability = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoOxidation = consoleCount === 0 && deepNestedCount === 0
  const hasProperCrystallization = hasStructure && hasTypes && genericsCount > 0
  const hasNoInclusions = privateCount === 0 && todoCount === 0
  const hasHomogeneous = exportCount > 0 && importCount > 0
  const hasNoSegregation = segregationCount === 0

  let state: PurityMeasure['state'] = 'polluted'
  if (hasHighPurity && hasNoContamination && hasNoSegregation && hasNoForeignMatter) state = 'ultra-pure'
  else if (hasHighPurity && hasNoContamination) state = 'high-purity'
  else if (hasHighPurity) state = 'pure'
  else if (hasProperComposition && hasHomogeneous) state = 'impure'
  else if (level > 30) state = 'contaminated'

  return {
    level, state, hasHighPurity, hasNoContamination, hasProperComposition,
    hasNoForeignMatter, hasChemicalStability, hasNoOxidation, hasProperCrystallization,
    hasNoInclusions, hasHomogeneous, hasNoSegregation, contaminationCount, segregationCount,
  }
}

// ─── Wonder Measurement ─────────────────────────────────────────────────────

/** @example measureWonder(content) returns wonder analysis */
export function measureWonder(content: string): WonderMeasure {
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

  const mediocrityCount = anyCount + todoCount
  const dullnessCount = deepNestedCount + commentedCodeCount

  const hasHighWonder = score >= 75 && hasStructure && hasTypes
  const hasAwe = hasStructure && hasTypes && genericsCount > 0
  const hasBeauty = hasStructure && hasTypes && jsdocCount > 0
  const hasNoMediocrity = mediocrityCount === 0
  const hasNaturalWonder = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoArtificiality = consoleCount === 0 && commentedCodeCount === 0
  const hasInspiring = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoDullness = dullnessCount === 0
  const hasSpectacular = hasStructure && hasTypes && exportCount > 0
  const hasNoBoredom = consoleCount === 0 && deepNestedCount === 0
  const hasMemorable = hasFunctions && jsdocCount > 0 && genericsCount > 0

  let impact: WonderMeasure['impact'] = 'none'
  if (hasHighWonder && hasNoMediocrity && hasNoDullness && hasMemorable) impact = 'breathtaking'
  else if (hasHighWonder && hasNoMediocrity) impact = 'magnificent'
  else if (hasHighWonder) impact = 'beautiful'
  else if (hasBeauty && hasInspiring) impact = 'pleasant'
  else if (score > 30) impact = 'ordinary'

  return {
    score, impact, hasHighWonder, hasAwe, hasBeauty, hasNoMediocrity,
    hasNaturalWonder, hasNoArtificiality, hasInspiring, hasNoDullness,
    hasSpectacular, hasNoBoredom, hasMemorable, mediocrityCount, dullnessCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(formation) returns condition string */
export function classifyCondition(formation: CrystalFormation): CrystalFormation['condition'] {
  const { qualityScore } = formation
  if (qualityScore >= 80) return 'naica-mine'
  if (qualityScore >= 65) return 'crystal-cathedral'
  if (qualityScore >= 50) return 'amethyst-cave'
  if (qualityScore >= 35) return 'geode-collection'
  if (qualityScore >= 20) return 'rock-shop'
  return 'gravel-pit'
}

// ─── Formation Analysis ─────────────────────────────────────────────────────

/** @example analyzeCrystalFormation(content, filePath) returns full formation */
export function analyzeCrystalFormation(content: string, filePath: string): CrystalFormation {
  const clarity = measureClarity(content)
  const formation = measureFormation(content)
  const luminescence = measureLuminescence(content)
  const geode = measureGeode(content)
  const purity = measurePurity(content)
  const wonder = measureWonder(content)

  const crystalClarity = clarity.level
  const formationQuality = formation.quality
  const luminescenceLevel = luminescence.level
  const geodeDepth = geode.depth
  const mineralPurity = purity.level
  const caveWonder = wonder.score

  const qualityScore = Math.round(
    crystalClarity * 0.15 +
    formationQuality * 0.15 +
    luminescenceLevel * 0.15 +
    geodeDepth * 0.2 +
    mineralPurity * 0.15 +
    caveWonder * 0.2,
  )

  const result: CrystalFormation = {
    file: filePath,
    crystalClarity, formationQuality, luminescence: luminescenceLevel,
    geodeDepth, mineralPurity, caveWonder,
    clarity, formation, luminescence, geode, purity, wonder,
    condition: 'gravel-pit',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Chamber Analysis ───────────────────────────────────────────────────────

/** @example analyzeCaveChamber(formations, dirPath) returns chamber */
export function analyzeCaveChamber(formations: CrystalFormation[], dirPath: string): CaveChamber {
  if (formations.length === 0) {
    return {
      directory: dirPath, formations: [], avgClarity: 0, avgFormation: 0, avgWonder: 0,
      naicaCount: 0, gravelCount: 0, clearCount: 0, wonderCount: 0,
      chamberType: 'mud-cave', condition: 'pothole',
    }
  }

  const avgClarity = Math.round(formations.reduce((s, f) => s + f.crystalClarity, 0) / formations.length)
  const avgFormation = Math.round(formations.reduce((s, f) => s + f.formationQuality, 0) / formations.length)
  const avgWonder = Math.round(formations.reduce((s, f) => s + f.caveWonder, 0) / formations.length)

  const naicaCount = formations.filter((f) => f.condition === 'naica-mine').length
  const gravelCount = formations.filter((f) => f.condition === 'gravel-pit').length
  const clearCount = formations.filter((f) => f.clarity.hasHighClarity).length
  const wonderCount = formations.filter((f) => f.wonder.hasHighWonder).length

  const chamberType = classifyChamberType(formations)
  const avgScore = formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length
  const condition = classifyChamberCondition(avgScore)

  return {
    directory: dirPath, formations, avgClarity, avgFormation, avgWonder,
    naicaCount, gravelCount, clearCount, wonderCount, chamberType, condition,
  }
}

// ─── Chamber Classification ─────────────────────────────────────────────────

/** @example classifyChamberType(formations) returns chamber type */
export function classifyChamberType(formations: CrystalFormation[]): CaveChamber['chamberType'] {
  if (formations.length === 0) return 'mud-cave'
  const avgScore = formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length
  const naicaCnt = formations.filter((f) => f.condition === 'naica-mine').length
  if (avgScore >= 75 && naicaCnt >= Math.ceil(formations.length * 0.3)) return 'grand-cathedral'
  if (avgScore >= 60) return 'crystal-gallery'
  if (avgScore >= 45) return 'geode-room'
  if (avgScore >= 30) return 'flowstone-chamber'
  if (avgScore >= 15) return 'dripping-cave'
  return 'mud-cave'
}

/** @example classifyChamberCondition(avgScore) returns condition */
export function classifyChamberCondition(avgScore: number): CaveChamber['condition'] {
  if (avgScore >= 80) return 'natural-wonder'
  if (avgScore >= 65) return 'show-cave'
  if (avgScore >= 50) return 'wild-cave'
  if (avgScore >= 35) return 'mine-tunnel'
  if (avgScore >= 20) return 'basement'
  return 'pothole'
}

/** @example classifySpelunkerGrade(avgWonder) returns grade */
export function classifySpelunkerGrade(avgWonder: number): CrystalCaveResult['stats']['spelunkerGrade'] {
  if (avgWonder >= 80) return 'master-spelunker'
  if (avgWonder >= 65) return 'geologist'
  if (avgWonder >= 50) return 'crystallographer'
  if (avgWonder >= 35) return 'collector'
  if (avgWonder >= 20) return 'tourist'
  return 'surface-dweller'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(formations, chambers, cavern, stats) returns recommendations */
export function generateRecommendations(
  formations: CrystalFormation[],
  chambers: CaveChamber[],
  cavern: CrystalCaveResult['cavern'],
  stats: CrystalCaveResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgCrystalClarity < 50) recs.push('Improve crystal clarity — make your code more transparent')
  if (stats.avgFormationQuality < 50) recs.push('Enhance formation quality — build better code structure')
  if (stats.avgLuminescence < 50) recs.push('Increase luminescence — illuminate your code with documentation')
  if (stats.avgGeodeDepth < 50) recs.push('Deepen geode content — add more substance to your code')
  if (stats.avgMineralPurity < 50) recs.push('Purify your minerals — clean contaminants from your code')
  if (stats.avgCaveWonder < 50) recs.push('Increase cave wonder — make your code more awe-inspiring')
  if (stats.gravelPitCount > formations.length * 0.5) recs.push('Too many gravel pits — over half the codebase lacks crystalline quality')
  if (stats.hasHighWonderCount === 0) recs.push('No breathtaking formations found — cultivate wonder with patience')
  if (chambers.length > 0 && cavern.overallWonder < 60) recs.push('Overall cave wonder is low — consult the master spelunker')
  if (recs.length === 0) recs.push('Magnificent crystal cave achieved — your formations are a natural wonder')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildCrystalCaveResult(files, contents, options) returns full result */
export function buildCrystalCaveResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): CrystalCaveResult {
  const formations: CrystalFormation[] = files.map((file, i) =>
    analyzeCrystalFormation(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CrystalFormation[]>()
  for (const formation of formations) {
    const dir = formation.file.includes('/')
      ? formation.file.substring(0, formation.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(formation)
    } else {
      dirMap.set(dir, [formation])
    }
  }

  const chambers: CaveChamber[] = Array.from(dirMap.entries()).map(([dir, dirFormations]) =>
    analyzeCaveChamber(dirFormations, dir),
  )

  const avgClarity = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.crystalClarity, 0) / formations.length)
    : 0
  const avgFormation = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.formationQuality, 0) / formations.length)
    : 0
  const avgWonder = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.caveWonder, 0) / formations.length)
    : 0
  const overallWonder = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.qualityScore, 0) / formations.length)
    : 0
  const isMagnificent = overallWonder >= 65

  const cavern: CrystalCaveResult['cavern'] = {
    avgClarity, avgFormation, avgWonder, isMagnificent, overallWonder,
  }

  const avgCrystalClarity = avgClarity
  const avgFormationQuality = avgFormation
  const avgLuminescence = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.luminescence.level, 0) / formations.length)
    : 0
  const avgGeodeDepth = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.geodeDepth, 0) / formations.length)
    : 0
  const avgMineralPurity = formations.length > 0
    ? Math.round(formations.reduce((s, f) => s + f.mineralPurity, 0) / formations.length)
    : 0
  const avgCaveWonder = avgWonder

  const conditionCounts = {
    naicaMine: 0, crystalCathedral: 0, amethystCave: 0,
    geodeCollection: 0, rockShop: 0, gravelPit: 0,
  }
  for (const f of formations) {
    switch (f.condition) {
      case 'naica-mine': conditionCounts.naicaMine++; break
      case 'crystal-cathedral': conditionCounts.crystalCathedral++; break
      case 'amethyst-cave': conditionCounts.amethystCave++; break
      case 'geode-collection': conditionCounts.geodeCollection++; break
      case 'rock-shop': conditionCounts.rockShop++; break
      case 'gravel-pit': conditionCounts.gravelPit++; break
    }
  }

  const hasHighClarityCount = formations.filter((f) => f.clarity.hasHighClarity).length
  const hasProperStructureCount = formations.filter((f) => f.formation.hasProperStructure).length
  const hasHighLuminescenceCount = formations.filter((f) => f.luminescence.hasHighLuminescence).length
  const hasDeepContentCount = formations.filter((f) => f.geode.hasDeepContent).length
  const hasHighPurityCount = formations.filter((f) => f.purity.hasHighPurity).length
  const hasHighWonderCount = formations.filter((f) => f.wonder.hasHighWonder).length

  const bestFormation = formations.length > 0
    ? formations.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file
    : ''
  const clearest = formations.length > 0
    ? formations.reduce((best, f) => f.crystalClarity > best.crystalClarity ? f : best).file
    : ''
  const bestFormed = formations.length > 0
    ? formations.reduce((best, f) => f.formationQuality > best.formationQuality ? f : best).file
    : ''
  const mostLuminous = formations.length > 0
    ? formations.reduce((best, f) => f.luminescence.level > best.luminescence.level ? f : best).file
    : ''
  const deepest = formations.length > 0
    ? formations.reduce((best, f) => f.geodeDepth > best.geodeDepth ? f : best).file
    : ''
  const mostWonderful = formations.length > 0
    ? formations.reduce((best, f) => f.caveWonder > best.caveWonder ? f : best).file
    : ''

  const spelunkerGrade = classifySpelunkerGrade(overallWonder)

  const stats: CrystalCaveResult['stats'] = {
    totalFiles: files.length, totalChambers: chambers.length,
    avgCrystalClarity, avgFormationQuality, avgLuminescence,
    avgGeodeDepth, avgMineralPurity, avgCaveWonder,
    naicaMineCount: conditionCounts.naicaMine,
    crystalCathedralCount: conditionCounts.crystalCathedral,
    amethystCaveCount: conditionCounts.amethystCave,
    geodeCollectionCount: conditionCounts.geodeCollection,
    rockShopCount: conditionCounts.rockShop,
    gravelPitCount: conditionCounts.gravelPit,
    hasHighClarityCount, hasProperStructureCount, hasHighLuminescenceCount,
    hasDeepContentCount, hasHighPurityCount, hasHighWonderCount,
    overallWonder, spelunkerGrade,
    bestFormation, clearest, bestFormed,
    mostLuminous, deepest, mostWonderful,
  }

  const recommendations = generateRecommendations(formations, chambers, cavern, stats)

  return { formations, chambers, cavern, stats, recommendations }
}
