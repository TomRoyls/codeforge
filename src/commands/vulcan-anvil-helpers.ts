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
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const RETURN_TYPE_REGEX = /\)\s*:\s*\w+/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const ERROR_THROW_REGEX = /\bthrow\s+/g
const PROMISE_REGEX = /\bPromise\b/g

// ─── Helper Functions ───────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

function countImportKeywords(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

function countExportKeywords(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

function countClassKeywords(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

function countInterfaceKeywords(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

function countTypeKeywords(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

function countEnumKeywords(content: string): number {
  return countMatches(content, ENUM_REGEX)
}

function countFunctionKeywords(content: string): number {
  return countMatches(content, FUNCTION_REGEX)
}

function countArrowFunctions(content: string): number {
  return countMatches(content, ARROW_REGEX)
}

function countJSDocBlocks(content: string): number {
  return countMatches(content, JSDOC_REGEX)
}

function countAsyncKeywords(content: string): number {
  return countMatches(content, ASYNC_REGEX)
}

function countTryCatch(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

function countDeepNested(content: string): number {
  return countMatches(content, DEEP_NESTED_REGEX)
}

function countTernaryOps(content: string): number {
  return countMatches(content, TERNARY_REGEX)
}

function countConsoleUsage(content: string): number {
  return countMatches(content, CONSOLE_REGEX)
}

function countTodoComments(content: string): number {
  return countMatches(content, TODO_REGEX)
}

function countGenericsUsage(content: string): number {
  return countMatches(content, GENERICS_REGEX)
}

function countPrivateMembers(content: string): number {
  return countMatches(content, PRIVATE_REGEX)
}

function countProtectedMembers(content: string): number {
  return countMatches(content, PROTECTED_REGEX)
}

function countStaticMembers(content: string): number {
  return countMatches(content, STATIC_REGEX)
}

function countReadonlyMembers(content: string): number {
  return countMatches(content, READONLY_REGEX)
}

function countAnyUsage(content: string): number {
  return countMatches(content, ANY_REGEX)
}

function countCommentedCode(content: string): number {
  return countMatches(content, COMMENTED_CODE_REGEX)
}

function countConditionals(content: string): number {
  return countMatches(content, CONDITIONAL_REGEX)
}

function countLoops(content: string): number {
  return countMatches(content, LOOP_REGEX)
}

function countErrorThrows(content: string): number {
  return countMatches(content, ERROR_THROW_REGEX)
}

function countPromiseUsage(content: string): number {
  return countMatches(content, PROMISE_REGEX)
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface HeatMeasure {
  intensity: number
  source: 'volcanic' | 'forge-fire' | 'bellows' | 'charcoal' | 'embers' | 'cold'
  hasProperHeat: boolean
  hasForgingTemperature: boolean
  hasNoOverheating: boolean
  hasNoUnderheating: boolean
  hasEvenHeating: boolean
  hasProperOxidation: boolean
  hasNoScale: boolean
  hasNoBurnoff: boolean
  hasProperColor: boolean
  hasNoThermalShock: boolean
  scaleCount: number
  burnoffCount: number
}

export interface HammerMeasure {
  blows: number
  technique: 'power-hammer' | 'cross-peen' | 'ball-peen' | 'chasing' | 'planishing' | 'no-striking'
  hasProperRefinement: boolean
  hasDrawing: boolean
  hasUpsetting: boolean
  hasBending: boolean
  hasPunching: boolean
  hasNoColdShut: boolean
  hasNoLaps: boolean
  hasProperFuller: boolean
  hasProperSet: boolean
  hasNoMismatches: boolean
  coldShutCount: number
  lapCount: number
}

export interface AnvilMeasure {
  stability: number
  material: 'steel-face' | 'cast-iron' | 'wrought-iron' | 'stone' | 'wood-stump' | 'ground'
  isStable: boolean
  hasHardie: boolean
  hasPritchel: boolean
  hasProperHorn: boolean
  hasFlatFace: boolean
  hasNoRing: boolean
  hasProperRebound: boolean
  hasProperMass: boolean
  hasNoDeflection: boolean
  hasStableBase: boolean
  deadRingCount: number
  deflectionCount: number
}

export interface QuenchMeasure {
  quality: number
  medium: 'oil' | 'water' | 'brine' | 'polymer' | 'air' | 'none'
  hasProperHardening: boolean
  hasNoCracking: boolean
  hasNoWarping: boolean
  hasProperCooling: boolean
  hasNoSteamPockets: boolean
  hasUniformCooling: boolean
  hasNoSoftSpots: boolean
  hasProperTransformation: boolean
  hasNoResidualStress: boolean
  hasRapidSetting: boolean
  crackCount: number
  warpCount: number
}

export interface TemperMeasure {
  balance: number
  method: 'double-temper' | 'single-temper' | 'austemper' | 'martemper' | 'flash' | 'raw'
  isBalanced: boolean
  hasHardnessAndToughness: boolean
  hasNoBrittleness: boolean
  hasNoSoftness: boolean
  hasProperGrain: boolean
  hasNoTemperEmbrittlement: boolean
  hasStableStructure: boolean
  hasProperSpring: boolean
  hasNoFragility: boolean
  hasProperDuctility: boolean
  embrittlementCount: number
  fragilityCount: number
}

export interface CraftMeasure {
  score: number
  level: 'divine' | 'masterwork' | 'journeyman' | 'apprentice' | 'novice' | 'unforged'
  isDivine: boolean
  hasArtistry: boolean
  hasPrecision: boolean
  hasFunction: boolean
  hasDurability: boolean
  hasNoDefects: boolean
  hasProperFinish: boolean
  hasSignature: boolean
  hasNoShortcuts: boolean
  hasLegacy: boolean
  defectCount: number
  shortcutCount: number
}

export interface ForgedWork {
  file: string
  forgeHeat: number
  hammerWork: number
  anvilStability: number
  quenchQuality: number
  temperBalance: number
  divineCraft: number
  heat: HeatMeasure
  hammer: HammerMeasure
  anvil: AnvilMeasure
  quench: QuenchMeasure
  temper: TemperMeasure
  craft: CraftMeasure
  condition: 'aegis-shield' | 'thunderbolt' | 'masterwork-sword' | 'good-steel' | 'pig-iron' | 'slag'
  qualityScore: number
}

export interface ForgeWorkshop {
  directory: string
  works: ForgedWork[]
  avgHeat: number
  avgStability: number
  avgCraft: number
  aegisCount: number
  slagCount: number
  stableCount: number
  divineCount: number
  workshopType: 'divine-forge' | 'master-workshop' | 'guild-hall' | 'village-forge' | 'campfire' | 'ruins'
  condition: 'olympus' | 'renowned' | 'respectable' | 'functional' | 'dilapidated' | 'abandoned'
}

export interface VulcanAnvilResult {
  works: ForgedWork[]
  workshops: ForgeWorkshop[]
  pantheon: {
    avgHeat: number
    avgStability: number
    avgCraft: number
    isDivine: boolean
    overallQuality: number
  }
  stats: {
    totalFiles: number
    totalWorkshops: number
    avgForgeHeat: number
    avgHammerWork: number
    avgAnvilStability: number
    avgQuenchQuality: number
    avgTemperBalance: number
    avgDivineCraft: number
    aegisShieldCount: number
    thunderboltCount: number
    masterworkSwordCount: number
    goodSteelCount: number
    pigIronCount: number
    slagCount: number
    hasProperHeatCount: number
    hasProperRefinementCount: number
    isStableCount: number
    hasProperHardeningCount: number
    isBalancedCount: number
    isDivineCount: number
    overallQuality: number
    smithGrade: 'god-of-forge' | 'master-smith' | 'journeyman-smith' | 'apprentice-smith' | 'village-smith' | 'scrap-collector'
    bestWork: string
    hottest: string
    mostRefined: string
    mostStable: string
    bestHardened: string
    mostDivine: string
  }
  recommendations: string[]
}

// ─── Heat Measurement ───────────────────────────────────────────────────────

/** @example measureHeat(content) returns heat analysis */
export function measureHeat(content: string): HeatMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const ternaryCount = countTernaryOps(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let intensity = 25
  if (hasStructure) intensity += 15
  if (hasTypes) intensity += 15
  if (hasFunctions) intensity += 10
  if (exportCount > 0) intensity += 5
  if (importCount > 0) intensity += 5
  if (jsdocCount > 0) intensity += 8
  if (genericsCount > 0) intensity += 5
  if (asyncCount > 0) intensity += 5
  if (ternaryCount === 0) intensity += 2
  if (anyCount === 0) intensity += 5
  intensity = Math.min(100, Math.max(0, Math.round(intensity)))

  const scaleCount = consoleCount + commentedCodeCount
  const burnoffCount = todoCount + deepNestedCount

  const hasProperHeat = hasStructure && hasTypes && hasFunctions
  const hasForgingTemperature = hasStructure && hasTypes && exportCount > 0
  const hasNoOverheating = deepNestedCount === 0 && ternaryCount <= 3
  const hasNoUnderheating = hasStructure && hasFunctions
  const hasEvenHeating = hasStructure && hasTypes && hasFunctions
  const hasProperOxidation = importCount > 0 && exportCount > 0
  const hasNoScale = consoleCount === 0 && commentedCodeCount === 0
  const hasNoBurnoff = todoCount === 0 && deepNestedCount === 0
  const hasProperColor = hasStructure && hasTypes && jsdocCount > 0
  const hasNoThermalShock = deepNestedCount === 0

  let source: HeatMeasure['source'] = 'cold'
  if (intensity >= 90 && hasProperHeat && hasNoBurnoff) source = 'volcanic'
  else if (intensity >= 75 && hasProperHeat) source = 'forge-fire'
  else if (intensity >= 60 && hasStructure) source = 'bellows'
  else if (intensity >= 45) source = 'charcoal'
  else if (intensity >= 25) source = 'embers'

  return {
    intensity,
    source,
    hasProperHeat,
    hasForgingTemperature,
    hasNoOverheating,
    hasNoUnderheating,
    hasEvenHeating,
    hasProperOxidation,
    hasNoScale,
    hasNoBurnoff,
    hasProperColor,
    hasNoThermalShock,
    scaleCount,
    burnoffCount,
  }
}

// ─── Hammer Measurement ─────────────────────────────────────────────────────

/** @example measureHammer(content) returns hammer analysis */
export function measureHammer(content: string): HammerMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const returnTypes = countMatches(content, RETURN_TYPE_REGEX)
  const conditionalsCount = countConditionals(content)
  const loopsCount = countLoops(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let blows = 25
  if (hasStructure) blows += 12
  if (hasTypes) blows += 12
  if (hasFunctions) blows += 10
  if (jsdocCount > 0) blows += 8
  if (genericsCount > 0) blows += 5
  if (exportCount > 0) blows += 5
  if (importCount > 0) blows += 5
  if (readonlyCount > 0) blows += 3
  if (privateCount > 0 || protectedCount > 0) blows += 3
  if (staticCount > 0) blows += 2
  if (returnTypes > 0) blows += 5
  if (anyCount === 0) blows += 3
  if (consoleCount === 0) blows += 2
  blows = Math.min(100, Math.max(0, Math.round(blows)))

  const coldShutCount = deepNestedCount + consoleCount
  const lapCount = anyCount + commentedCodeCount

  const hasProperRefinement = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasDrawing = hasStructure && hasFunctions && returnTypes > 0
  const hasUpsetting = hasStructure && hasTypes && genericsCount > 0
  const hasBending = conditionalsCount > 0 && loopsCount > 0
  const hasPunching = hasFunctions && exportCount > 0
  const hasNoColdShut = coldShutCount === 0
  const hasNoLaps = lapCount === 0
  const hasProperFuller = importCount > 0 && exportCount > 0
  const hasProperSet = hasStructure && hasTypes && hasFunctions
  const hasNoMismatches = anyCount === 0 && todoCount === 0

  let technique: HammerMeasure['technique'] = 'no-striking'
  if (hasProperRefinement && hasDrawing && hasUpsetting) technique = 'power-hammer'
  else if (hasProperRefinement && hasDrawing) technique = 'cross-peen'
  else if (hasProperRefinement) technique = 'ball-peen'
  else if (hasDrawing || hasBending) technique = 'chasing'
  else if (hasProperSet) technique = 'planishing'

  return {
    blows,
    technique,
    hasProperRefinement,
    hasDrawing,
    hasUpsetting,
    hasBending,
    hasPunching,
    hasNoColdShut,
    hasNoLaps,
    hasProperFuller,
    hasProperSet,
    hasNoMismatches,
    coldShutCount,
    lapCount,
  }
}

// ─── Anvil Measurement ──────────────────────────────────────────────────────

/** @example measureAnvil(content) returns anvil analysis */
export function measureAnvil(content: string): AnvilMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const jsdocCount = countJSDocBlocks(content)
  const tryCatchCount = countTryCatch(content)
  const errorThrowCount = countErrorThrows(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let stability = 25
  if (hasStructure) stability += 15
  if (hasTypes) stability += 15
  if (enumCount > 0) stability += 5
  if (hasFunctions) stability += 10
  if (exportCount > 0) stability += 5
  if (importCount > 0) stability += 5
  if (jsdocCount > 0) stability += 5
  if (tryCatchCount > 0) stability += 5
  if (errorThrowCount > 0) stability += 3
  if (privateCount > 0 || protectedCount > 0) stability += 3
  if (staticCount > 0) stability += 2
  if (readonlyCount > 0) stability += 2
  if (anyCount === 0) stability += 3
  stability = Math.min(100, Math.max(0, Math.round(stability)))

  const deadRingCount = deepNestedCount
  const deflectionCount = consoleCount + anyCount

  const isStable = hasStructure && hasTypes && anyCount === 0
  const hasHardie = hasStructure && hasTypes
  const hasPritchel = tryCatchCount > 0 && errorThrowCount > 0
  const hasProperHorn = hasStructure && hasFunctions && (privateCount > 0 || protectedCount > 0)
  const hasFlatFace = hasStructure && hasTypes && hasFunctions
  const hasNoRing = deadRingCount === 0
  const hasProperRebound = hasFunctions && exportCount > 0
  const hasProperMass = hasStructure && hasTypes && enumCount > 0
  const hasNoDeflection = deflectionCount === 0
  const hasStableBase = importCount > 0 && exportCount > 0

  let material: AnvilMeasure['material'] = 'ground'
  if (isStable && hasFlatFace && hasProperMass && hasNoDeflection) material = 'steel-face'
  else if (isStable && hasFlatFace) material = 'cast-iron'
  else if (isStable) material = 'wrought-iron'
  else if (hasFlatFace) material = 'stone'
  else if (hasStructure || hasTypes) material = 'wood-stump'

  return {
    stability,
    material,
    isStable,
    hasHardie,
    hasPritchel,
    hasProperHorn,
    hasFlatFace,
    hasNoRing,
    hasProperRebound,
    hasProperMass,
    hasNoDeflection,
    hasStableBase,
    deadRingCount,
    deflectionCount,
  }
}

// ─── Quench Measurement ─────────────────────────────────────────────────────

/** @example measureQuench(content) returns quench analysis */
export function measureQuench(content: string): QuenchMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const readonlyCount = countReadonlyMembers(content)
  const asyncCount = countAsyncKeywords(content)
  const promiseCount = countPromiseUsage(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const ternaryCount = countTernaryOps(content)
  const commentedCodeCount = countCommentedCode(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let quality = 25
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (tryCatchCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (readonlyCount > 0) quality += 3
  if (asyncCount > 0 || promiseCount > 0) quality += 5
  if (anyCount === 0) quality += 3
  if (consoleCount === 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const crackCount = deepNestedCount + ternaryCount
  const warpCount = todoCount + commentedCodeCount

  const hasProperHardening = hasStructure && hasTypes && tryCatchCount > 0 && anyCount === 0
  const hasNoCracking = crackCount === 0
  const hasNoWarping = warpCount === 0
  const hasProperCooling = hasStructure && hasTypes && consoleCount === 0
  const hasNoSteamPockets = deepNestedCount === 0 && todoCount === 0
  const hasUniformCooling = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasNoSoftSpots = consoleCount === 0 && commentedCodeCount === 0
  const hasProperTransformation = exportCount > 0 && importCount > 0
  const hasNoResidualStress = deepNestedCount === 0 && anyCount === 0
  const hasRapidSetting = hasFunctions && exportCount > 0

  let medium: QuenchMeasure['medium'] = 'none'
  if (hasProperHardening && hasUniformCooling && hasNoCracking) medium = 'oil'
  else if (hasProperHardening && hasNoCracking) medium = 'water'
  else if (hasProperHardening) medium = 'brine'
  else if (hasProperCooling) medium = 'polymer'
  else if (quality > 30) medium = 'air'

  return {
    quality,
    medium,
    hasProperHardening,
    hasNoCracking,
    hasNoWarping,
    hasProperCooling,
    hasNoSteamPockets,
    hasUniformCooling,
    hasNoSoftSpots,
    hasProperTransformation,
    hasNoResidualStress,
    hasRapidSetting,
    crackCount,
    warpCount,
  }
}

// ─── Temper Measurement ─────────────────────────────────────────────────────

/** @example measureTemper(content) returns temper analysis */
export function measureTemper(content: string): TemperMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const readonlyCount = countReadonlyMembers(content)
  const staticCount = countStaticMembers(content)
  const ternaryCount = countTernaryOps(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let balance = 20
  if (hasStructure) balance += 12
  if (hasTypes) balance += 12
  if (hasFunctions) balance += 10
  if (jsdocCount > 0) balance += 8
  if (genericsCount > 0) balance += 5
  if (asyncCount > 0) balance += 5
  if (tryCatchCount > 0) balance += 5
  if (exportCount > 0) balance += 5
  if (importCount > 0) balance += 5
  if (privateCount > 0 || protectedCount > 0) balance += 3
  if (staticCount > 0) balance += 2
  if (readonlyCount > 0) balance += 3
  if (anyCount === 0) balance += 3
  if (consoleCount === 0) balance += 2
  balance = Math.min(100, Math.max(0, Math.round(balance)))

  const embrittlementCount = ternaryCount + deepNestedCount
  const fragilityCount = anyCount + todoCount

  const isBalanced = balance >= 70 && anyCount === 0 && todoCount === 0
  const hasHardnessAndToughness = hasStructure && hasTypes && tryCatchCount > 0
  const hasNoBrittleness = ternaryCount <= 2 && deepNestedCount === 0
  const hasNoSoftness = hasStructure && hasTypes && hasFunctions
  const hasProperGrain = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoTemperEmbrittlement = embrittlementCount === 0
  const hasStableStructure = hasStructure && hasTypes && anyCount === 0
  const hasProperSpring = tryCatchCount > 0 && (asyncCount > 0 || hasFunctions)
  const hasNoFragility = fragilityCount === 0
  const hasProperDuctility = hasFunctions && exportCount > 0 && importCount > 0

  let method: TemperMeasure['method'] = 'raw'
  if (isBalanced && hasProperGrain && hasNoBrittleness && hasNoFragility) method = 'double-temper'
  else if (isBalanced && hasProperGrain) method = 'single-temper'
  else if (hasHardnessAndToughness && hasNoBrittleness) method = 'austemper'
  else if (hasHardnessAndToughness) method = 'martemper'
  else if (balance > 30) method = 'flash'

  return {
    balance,
    method,
    isBalanced,
    hasHardnessAndToughness,
    hasNoBrittleness,
    hasNoSoftness,
    hasProperGrain,
    hasNoTemperEmbrittlement,
    hasStableStructure,
    hasProperSpring,
    hasNoFragility,
    hasProperDuctility,
    embrittlementCount,
    fragilityCount,
  }
}

// ─── Craft Measurement ──────────────────────────────────────────────────────

/** @example measureCraft(content) returns craft analysis */
export function measureCraft(content: string): CraftMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const enumCount = countEnumKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)
  const staticCount = countStaticMembers(content)
  const readonlyCount = countReadonlyMembers(content)
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
  if (enumCount > 0) score += 5
  if (hasFunctions) score += 10
  if (jsdocCount > 0) score += 8
  if (genericsCount > 0) score += 5
  if (asyncCount > 0) score += 5
  if (tryCatchCount > 0) score += 5
  if (exportCount > 0) score += 5
  if (importCount > 0) score += 5
  if (privateCount > 0 || protectedCount > 0) score += 3
  if (staticCount > 0) score += 3
  if (readonlyCount > 0) score += 2
  if (anyCount === 0) score += 3
  if (consoleCount === 0) score += 3
  score = Math.min(100, Math.max(0, Math.round(score)))

  const defectCount = consoleCount + anyCount + deepNestedCount
  const shortcutCount = todoCount + commentedCodeCount

  const isDivine = score >= 85 && anyCount === 0 && todoCount === 0 && deepNestedCount === 0
  const hasArtistry = hasStructure && hasTypes && jsdocCount > 0 && genericsCount > 0
  const hasPrecision = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasFunction = hasFunctions && exportCount > 0
  const hasDurability = tryCatchCount > 0 && (privateCount > 0 || protectedCount > 0)
  const hasNoDefects = defectCount === 0
  const hasProperFinish = jsdocCount > 0 && exportCount > 0 && consoleCount === 0
  const hasSignature = privateCount > 0 && readonlyCount > 0 && staticCount > 0
  const hasNoShortcuts = shortcutCount === 0
  const hasLegacy = isDivine && hasProperFinish && hasNoShortcuts

  let level: CraftMeasure['level'] = 'unforged'
  if (isDivine && hasLegacy) level = 'divine'
  else if (score >= 80 && hasNoDefects) level = 'masterwork'
  else if (score >= 65) level = 'journeyman'
  else if (score >= 45) level = 'apprentice'
  else if (score >= 25) level = 'novice'

  return {
    score,
    level,
    isDivine,
    hasArtistry,
    hasPrecision,
    hasFunction,
    hasDurability,
    hasNoDefects,
    hasProperFinish,
    hasSignature,
    hasNoShortcuts,
    hasLegacy,
    defectCount,
    shortcutCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(work) returns condition string */
export function classifyCondition(work: ForgedWork): ForgedWork['condition'] {
  const { qualityScore } = work
  if (qualityScore >= 80) return 'aegis-shield'
  if (qualityScore >= 65) return 'thunderbolt'
  if (qualityScore >= 50) return 'masterwork-sword'
  if (qualityScore >= 35) return 'good-steel'
  if (qualityScore >= 20) return 'pig-iron'
  return 'slag'
}

// ─── Work Analysis ──────────────────────────────────────────────────────────

/** @example analyzeForgedWork(content, filePath) returns full work */
export function analyzeForgedWork(content: string, filePath: string): ForgedWork {
  const heat = measureHeat(content)
  const hammer = measureHammer(content)
  const anvil = measureAnvil(content)
  const quench = measureQuench(content)
  const temper = measureTemper(content)
  const craft = measureCraft(content)

  const forgeHeat = heat.intensity
  const hammerWork = hammer.blows
  const anvilStability = anvil.stability
  const quenchQuality = quench.quality
  const temperBalance = temper.balance
  const divineCraft = craft.score

  const qualityScore = Math.round(
    forgeHeat * 0.15 +
    hammerWork * 0.15 +
    anvilStability * 0.2 +
    quenchQuality * 0.15 +
    temperBalance * 0.15 +
    divineCraft * 0.2,
  )

  const work: ForgedWork = {
    file: filePath,
    forgeHeat,
    hammerWork,
    anvilStability,
    quenchQuality,
    temperBalance,
    divineCraft,
    heat,
    hammer,
    anvil,
    quench,
    temper,
    craft,
    condition: 'slag',
    qualityScore,
  }

  work.condition = classifyCondition(work)

  return work
}

// ─── Workshop Analysis ──────────────────────────────────────────────────────

/** @example analyzeForgeWorkshop(works, dirPath) returns workshop */
export function analyzeForgeWorkshop(works: ForgedWork[], dirPath: string): ForgeWorkshop {
  if (works.length === 0) {
    return {
      directory: dirPath,
      works: [],
      avgHeat: 0,
      avgStability: 0,
      avgCraft: 0,
      aegisCount: 0,
      slagCount: 0,
      stableCount: 0,
      divineCount: 0,
      workshopType: 'ruins',
      condition: 'abandoned',
    }
  }

  const avgHeat = Math.round(works.reduce((s, w) => s + w.forgeHeat, 0) / works.length)
  const avgStability = Math.round(works.reduce((s, w) => s + w.anvilStability, 0) / works.length)
  const avgCraft = Math.round(works.reduce((s, w) => s + w.divineCraft, 0) / works.length)

  const aegisCount = works.filter((w) => w.condition === 'aegis-shield').length
  const slagCount = works.filter((w) => w.condition === 'slag').length
  const stableCount = works.filter((w) => w.anvil.isStable).length
  const divineCount = works.filter((w) => w.craft.isDivine).length

  const workshopType = classifyWorkshopType(works)
  const avgQuality = works.reduce((s, w) => s + w.qualityScore, 0) / works.length
  const condition = classifyWorkshopCondition(avgQuality)

  return {
    directory: dirPath,
    works,
    avgHeat,
    avgStability,
    avgCraft,
    aegisCount,
    slagCount,
    stableCount,
    divineCount,
    workshopType,
    condition,
  }
}

// ─── Workshop Classification ────────────────────────────────────────────────

/** @example classifyWorkshopType(works) returns workshop type */
export function classifyWorkshopType(works: ForgedWork[]): ForgeWorkshop['workshopType'] {
  if (works.length === 0) return 'ruins'
  const avgQuality = works.reduce((s, w) => s + w.qualityScore, 0) / works.length
  const aegisCount = works.filter((w) => w.condition === 'aegis-shield').length
  if (avgQuality >= 75 && aegisCount >= Math.ceil(works.length * 0.3)) return 'divine-forge'
  if (avgQuality >= 60) return 'master-workshop'
  if (avgQuality >= 45) return 'guild-hall'
  if (avgQuality >= 30) return 'village-forge'
  if (avgQuality >= 15) return 'campfire'
  return 'ruins'
}

/** @example classifyWorkshopCondition(avgQuality) returns condition */
export function classifyWorkshopCondition(avgQuality: number): ForgeWorkshop['condition'] {
  if (avgQuality >= 80) return 'olympus'
  if (avgQuality >= 65) return 'renowned'
  if (avgQuality >= 50) return 'respectable'
  if (avgQuality >= 35) return 'functional'
  if (avgQuality >= 20) return 'dilapidated'
  return 'abandoned'
}

/** @example classifySmithGrade(avgQuality) returns grade */
export function classifySmithGrade(avgQuality: number): VulcanAnvilResult['stats']['smithGrade'] {
  if (avgQuality >= 80) return 'god-of-forge'
  if (avgQuality >= 65) return 'master-smith'
  if (avgQuality >= 50) return 'journeyman-smith'
  if (avgQuality >= 35) return 'apprentice-smith'
  if (avgQuality >= 20) return 'village-smith'
  return 'scrap-collector'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(works, workshops, pantheon, stats) returns recommendations */
export function generateRecommendations(
  works: ForgedWork[],
  workshops: ForgeWorkshop[],
  pantheon: VulcanAnvilResult['pantheon'],
  stats: VulcanAnvilResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgForgeHeat < 50) {
    recs.push('Increase forge heat — add more structure, types, and exports')
  }
  if (stats.avgHammerWork < 50) {
    recs.push('Refine hammer work — add JSDoc, generics, and proper type annotations')
  }
  if (stats.avgAnvilStability < 50) {
    recs.push('Strengthen anvil stability — build a solid foundation with error handling')
  }
  if (stats.avgQuenchQuality < 50) {
    recs.push('Improve quench quality — harden code with proper async handling and type safety')
  }
  if (stats.avgTemperBalance < 50) {
    recs.push('Improve temper balance — find the right balance between strength and flexibility')
  }
  if (stats.avgDivineCraft < 50) {
    recs.push('Elevate divine craft — aim for complete, well-documented, defect-free code')
  }
  if (stats.slagCount > works.length * 0.5) {
    recs.push('Too much slag — over half your files are poor quality')
  }
  if (stats.isDivineCount === 0) {
    recs.push('No divine works found — strive for godlike craftsmanship')
  }
  if (workshops.length > 0 && pantheon.overallQuality < 60) {
    recs.push('Overall forge quality is low — systematic improvement recommended')
  }
  if (recs.length === 0) {
    recs.push('Divine craftsmanship — your forge produces work worthy of the gods')
  }

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildVulcanAnvilResult(files, contents, options) returns full result */
export function buildVulcanAnvilResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): VulcanAnvilResult {
  const works: ForgedWork[] = files.map((file, i) =>
    analyzeForgedWork(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ForgedWork[]>()
  for (const work of works) {
    const dir = work.file.includes('/')
      ? work.file.substring(0, work.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(work)
    } else {
      dirMap.set(dir, [work])
    }
  }

  const workshops: ForgeWorkshop[] = Array.from(dirMap.entries()).map(([dir, dirWorks]) =>
    analyzeForgeWorkshop(dirWorks, dir),
  )

  const avgHeat = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.forgeHeat, 0) / works.length)
    : 0
  const avgStability = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.anvilStability, 0) / works.length)
    : 0
  const avgCraft = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.divineCraft, 0) / works.length)
    : 0
  const overallQuality = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.qualityScore, 0) / works.length)
    : 0
  const isDivine = overallQuality >= 65

  const pantheon: VulcanAnvilResult['pantheon'] = {
    avgHeat,
    avgStability,
    avgCraft,
    isDivine,
    overallQuality,
  }

  const avgForgeHeat = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.forgeHeat, 0) / works.length)
    : 0
  const avgHammerWork = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.hammerWork, 0) / works.length)
    : 0
  const avgAnvilStability = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.anvilStability, 0) / works.length)
    : 0
  const avgQuenchQuality = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.quenchQuality, 0) / works.length)
    : 0
  const avgTemperBalance = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.temperBalance, 0) / works.length)
    : 0
  const avgDivineCraft = works.length > 0
    ? Math.round(works.reduce((s, w) => s + w.divineCraft, 0) / works.length)
    : 0

  const conditionCounts = {
    aegisShield: 0,
    thunderbolt: 0,
    masterworkSword: 0,
    goodSteel: 0,
    pigIron: 0,
    slag: 0,
  }
  for (const w of works) {
    switch (w.condition) {
      case 'aegis-shield': conditionCounts.aegisShield++; break
      case 'thunderbolt': conditionCounts.thunderbolt++; break
      case 'masterwork-sword': conditionCounts.masterworkSword++; break
      case 'good-steel': conditionCounts.goodSteel++; break
      case 'pig-iron': conditionCounts.pigIron++; break
      case 'slag': conditionCounts.slag++; break
    }
  }

  const hasProperHeatCount = works.filter((w) => w.heat.hasProperHeat).length
  const hasProperRefinementCount = works.filter((w) => w.hammer.hasProperRefinement).length
  const isStableCount = works.filter((w) => w.anvil.isStable).length
  const hasProperHardeningCount = works.filter((w) => w.quench.hasProperHardening).length
  const isBalancedCount = works.filter((w) => w.temper.isBalanced).length
  const isDivineCount = works.filter((w) => w.craft.isDivine).length

  const bestWork = works.length > 0
    ? works.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file
    : ''
  const hottest = works.length > 0
    ? works.reduce((best, w) => w.forgeHeat > best.forgeHeat ? w : best).file
    : ''
  const mostRefined = works.length > 0
    ? works.reduce((best, w) => w.hammerWork > best.hammerWork ? w : best).file
    : ''
  const mostStable = works.length > 0
    ? works.reduce((best, w) => w.anvilStability > best.anvilStability ? w : best).file
    : ''
  const bestHardened = works.length > 0
    ? works.reduce((best, w) => w.quenchQuality > best.quenchQuality ? w : best).file
    : ''
  const mostDivine = works.length > 0
    ? works.reduce((best, w) => w.divineCraft > best.divineCraft ? w : best).file
    : ''

  const smithGrade = classifySmithGrade(overallQuality)

  const stats: VulcanAnvilResult['stats'] = {
    totalFiles: files.length,
    totalWorkshops: workshops.length,
    avgForgeHeat,
    avgHammerWork,
    avgAnvilStability,
    avgQuenchQuality,
    avgTemperBalance,
    avgDivineCraft,
    aegisShieldCount: conditionCounts.aegisShield,
    thunderboltCount: conditionCounts.thunderbolt,
    masterworkSwordCount: conditionCounts.masterworkSword,
    goodSteelCount: conditionCounts.goodSteel,
    pigIronCount: conditionCounts.pigIron,
    slagCount: conditionCounts.slag,
    hasProperHeatCount,
    hasProperRefinementCount,
    isStableCount,
    hasProperHardeningCount,
    isBalancedCount,
    isDivineCount,
    overallQuality,
    smithGrade,
    bestWork,
    hottest,
    mostRefined,
    mostStable,
    bestHardened,
    mostDivine,
  }

  const recommendations = generateRecommendations(works, workshops, pantheon, stats)

  return {
    works,
    workshops,
    pantheon,
    stats,
    recommendations,
  }
}
