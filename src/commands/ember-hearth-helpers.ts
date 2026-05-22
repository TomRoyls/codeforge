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

export interface WarmthMeasure {
  level: number
  glow: 'radiant' | 'warm' | 'glowing' | 'lukewarm' | 'cool' | 'cold'
  hasHighWarmth: boolean
  hasWelcoming: boolean
  hasInviting: boolean
  hasNoHostility: boolean
  hasGentleCurve: boolean
  hasNoSharpEdges: boolean
  hasComfortable: boolean
  hasNoIntimidation: boolean
  hasApproachable: boolean
  hasNoBarrier: boolean
  hostilityCount: number
  barrierCount: number
}

export interface PersistenceMeasure {
  level: number
  state: 'eternal-flame' | 'steady-burn' | 'smoldering' | 'fading' | 'dying' | 'extinguished'
  hasHighPersistence: boolean
  hasLongBurn: boolean
  hasNoFlameout: boolean
  hasConsistent: boolean
  hasProperDraft: boolean
  hasNoSuffocation: boolean
  hasSteadyGlow: boolean
  hasNoFlickering: boolean
  hasProperVentilation: boolean
  hasNoBackdraft: boolean
  flameoutCount: number
  backdraftCount: number
}

export interface FuelMeasure {
  quality: number
  type: 'hardwood' | 'softwood' | 'charcoal' | 'peat' | 'dung' | 'wet-leaves'
  hasHighEfficiency: boolean
  hasCleanBurn: boolean
  hasNoSmoke: boolean
  hasProperCombustion: boolean
  hasHighEnergy: boolean
  hasNoWaste: boolean
  hasProperStorage: boolean
  hasNoSparks: boolean
  hasSustained: boolean
  hasNoUnburned: boolean
  wasteCount: number
  sparkCount: number
}

export interface SmokeMeasure {
  quality: number
  clarity: 'clear' | 'wispy' | 'hazy' | 'thick' | 'toxic' | 'choking'
  hasClearOutput: boolean
  hasProperSignal: boolean
  hasNoNoise: boolean
  hasInformative: boolean
  hasNoPollution: boolean
  hasProperDrift: boolean
  hasNoObstruction: boolean
  hasVisible: boolean
  hasNoIrritation: boolean
  hasProperChimney: boolean
  noiseCount: number
  pollutionCount: number
}

export interface AshMeasure {
  utility: number
  type: 'useful-ash' | 'clean-ash' | 'gray-ash' | 'soot' | 'clinker' | 'toxic-residue'
  hasProperCleanup: boolean
  hasNoResidue: boolean
  hasProperDisposal: boolean
  hasNoBuildup: boolean
  hasRecyclable: boolean
  hasNoContamination: boolean
  hasProperMaintenance: boolean
  hasNoBlockage: boolean
  hasCleanBurn: boolean
  hasNoWaste: boolean
  residueCount: number
  buildupCount: number
}

export interface ComfortMeasure {
  score: number
  level: 'sanctuary' | 'comfortable' | 'adequate' | 'sparse' | 'cold' | 'barren'
  hasHighComfort: boolean
  hasCozy: boolean
  hasReliable: boolean
  hasNoAnxiety: boolean
  hasPeaceful: boolean
  hasNoStress: boolean
  hasNourishing: boolean
  hasNoFear: boolean
  hasProtective: boolean
  hasNoDanger: boolean
  hasGathering: boolean
  anxietyCount: number
  stressCount: number
}

export interface HearthEmber {
  file: string
  emberWarmth: number
  hearthPersistence: number
  fuelQuality: number
  smokeQuality: number
  ashUtility: number
  hearthComfort: number
  warmth: WarmthMeasure
  persistence: PersistenceMeasure
  fuel: FuelMeasure
  smoke: SmokeMeasure
  ash: AshMeasure
  comfort: ComfortMeasure
  condition: 'eternal-flame' | 'roaring-fire' | 'steady-hearth' | 'banked-coals' | 'dying-ember' | 'cold-ash'
  qualityScore: number
}

export interface HearthCircle {
  directory: string
  embers: HearthEmber[]
  avgWarmth: number
  avgPersistence: number
  avgComfort: number
  eternalCount: number
  coldAshCount: number
  warmCount: number
  comfortableCount: number
  circleType: 'great-hall' | 'family-hearth' | 'campfire' | 'fire-pit' | 'candle' | 'darkness'
  condition: 'ancestral-hall' | 'warm-home' | 'campsite' | 'shelter' | 'ruins' | 'void'
}

export interface EmberHearthResult {
  embers: HearthEmber[]
  circles: HearthCircle[]
  home: {
    avgWarmth: number
    avgPersistence: number
    avgComfort: number
    isWarm: boolean
    overallWarmth: number
  }
  stats: {
    totalFiles: number
    totalCircles: number
    avgEmberWarmth: number
    avgHearthPersistence: number
    avgFuelQuality: number
    avgSmokeQuality: number
    avgAshUtility: number
    avgHearthComfort: number
    eternalFlameCount: number
    roaringFireCount: number
    steadyHearthCount: number
    bankedCoalsCount: number
    dyingEmberCount: number
    coldAshCount: number
    hasHighWarmthCount: number
    hasHighPersistenceCount: number
    hasHighEfficiencyCount: number
    hasClearOutputCount: number
    hasProperCleanupCount: number
    hasHighComfortCount: number
    overallWarmth: number
    keeperGrade: 'hearth-master' | 'firekeeper' | 'stoker' | 'tender' | 'lighter' | 'ice-walker'
    bestEmber: string
    warmest: string
    mostPersistent: string
    mostEfficient: string
    clearestOutput: string
    mostComfortable: string
  }
  recommendations: string[]
}

// ─── Warmth Measurement ─────────────────────────────────────────────────────

/** @example measureWarmth(content) returns warmth analysis */
export function measureWarmth(content: string): WarmthMeasure {
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

  const hostilityCount = consoleCount + anyCount
  const barrierCount = deepNestedCount + privateCount

  const hasHighWarmth = level >= 75 && hasStructure && hasTypes
  const hasWelcoming = hasStructure && hasTypes && hasFunctions
  const hasInviting = exportCount > 0 && importCount > 0
  const hasNoHostility = hostilityCount === 0
  const hasGentleCurve = hasTypes && genericsCount > 0
  const hasNoSharpEdges = deepNestedCount === 0 && privateCount === 0
  const hasComfortable = hasStructure && hasTypes && jsdocCount > 0
  const hasNoIntimidation = anyCount === 0 && deepNestedCount === 0
  const hasApproachable = hasFunctions && exportCount > 0
  const hasNoBarrier = barrierCount === 0

  let glow: WarmthMeasure['glow'] = 'cold'
  if (hasHighWarmth && hasNoHostility && hasNoBarrier && hasWelcoming) glow = 'radiant'
  else if (hasHighWarmth && hasNoHostility) glow = 'warm'
  else if (hasHighWarmth) glow = 'glowing'
  else if (hasWelcoming && hasInviting) glow = 'lukewarm'
  else if (level > 30) glow = 'cool'

  return {
    level, glow, hasHighWarmth, hasWelcoming, hasInviting, hasNoHostility,
    hasGentleCurve, hasNoSharpEdges, hasComfortable, hasNoIntimidation,
    hasApproachable, hasNoBarrier, hostilityCount, barrierCount,
  }
}

// ─── Persistence Measurement ────────────────────────────────────────────────

/** @example measurePersistence(content) returns persistence analysis */
export function measurePersistence(content: string): PersistenceMeasure {
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

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (tryCatchCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (asyncCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const flameoutCount = todoCount + anyCount
  const backdraftCount = deepNestedCount

  const hasHighPersistence = level >= 75 && hasStructure && hasTypes
  const hasLongBurn = tryCatchCount > 0 && asyncCount > 0
  const hasNoFlameout = flameoutCount === 0
  const hasConsistent = hasStructure && hasTypes && hasFunctions
  const hasProperDraft = importCount > 0 && exportCount > 0
  const hasNoSuffocation = consoleCount === 0 && deepNestedCount === 0
  const hasSteadyGlow = hasStructure && hasTypes && genericsCount > 0
  const hasNoFlickering = deepNestedCount === 0 && todoCount === 0
  const hasProperVentilation = tryCatchCount > 0 && asyncCount > 0
  const hasNoBackdraft = backdraftCount === 0

  let state: PersistenceMeasure['state'] = 'extinguished'
  if (hasHighPersistence && hasNoFlameout && hasNoBackdraft && hasLongBurn) state = 'eternal-flame'
  else if (hasHighPersistence && hasNoFlameout) state = 'steady-burn'
  else if (hasHighPersistence) state = 'smoldering'
  else if (hasConsistent && hasProperDraft) state = 'fading'
  else if (level > 30) state = 'dying'

  return {
    level, state, hasHighPersistence, hasLongBurn, hasNoFlameout, hasConsistent,
    hasProperDraft, hasNoSuffocation, hasSteadyGlow, hasNoFlickering,
    hasProperVentilation, hasNoBackdraft, flameoutCount, backdraftCount,
  }
}

// ─── Fuel Measurement ───────────────────────────────────────────────────────

/** @example measureFuel(content) returns fuel analysis */
export function measureFuel(content: string): FuelMeasure {
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

  const wasteCount = anyCount + consoleCount + todoCount
  const sparkCount = deepNestedCount + commentedCodeCount

  const hasHighEfficiency = quality >= 75 && hasStructure && hasTypes
  const hasCleanBurn = consoleCount === 0 && anyCount === 0
  const hasNoSmoke = consoleCount === 0
  const hasProperCombustion = hasStructure && hasTypes && hasFunctions
  const hasHighEnergy = hasStructure && hasTypes && genericsCount > 0
  const hasNoWaste = wasteCount === 0
  const hasProperStorage = exportCount > 0 && importCount > 0
  const hasNoSparks = sparkCount === 0
  const hasSustained = hasFunctions && jsdocCount > 0
  const hasNoUnburned = commentedCodeCount === 0 && todoCount === 0

  let fuelType: FuelMeasure['type'] = 'wet-leaves'
  if (quality >= 75 && hasNoWaste && hasNoSparks && hasHighEnergy) fuelType = 'hardwood'
  else if (quality >= 75 && hasNoWaste) fuelType = 'softwood'
  else if (quality >= 75) fuelType = 'charcoal'
  else if (hasProperCombustion && hasSustained) fuelType = 'peat'
  else if (quality > 30) fuelType = 'dung'

  return {
    quality, type: fuelType, hasHighEfficiency, hasCleanBurn, hasNoSmoke,
    hasProperCombustion, hasHighEnergy, hasNoWaste, hasProperStorage,
    hasNoSparks, hasSustained, hasNoUnburned, wasteCount, sparkCount,
  }
}

// ─── Smoke Measurement ──────────────────────────────────────────────────────

/** @example measureSmoke(content) returns smoke analysis */
export function measureSmoke(content: string): SmokeMeasure {
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

  let quality = 20
  if (hasStructure) quality += 10
  if (hasTypes) quality += 10
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 10
  if (enumCount > 0) quality += 5
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 8
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 5
  if (deepNestedCount === 0) quality += 4
  if (commentedCodeCount === 0) quality += 3
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const noiseCount = consoleCount + anyCount
  const pollutionCount = deepNestedCount + commentedCodeCount

  const hasClearOutput = quality >= 75 && hasStructure && hasTypes
  const hasProperSignal = exportCount > 0 && importCount > 0
  const hasNoNoise = noiseCount === 0
  const hasInformative = hasFunctions && jsdocCount > 0
  const hasNoPollution = pollutionCount === 0
  const hasProperDrift = hasStructure && hasTypes && genericsCount > 0
  const hasNoObstruction = consoleCount === 0 && deepNestedCount === 0
  const hasVisible = hasFunctions && exportCount > 0
  const hasNoIrritation = consoleCount === 0 && commentedCodeCount === 0
  const hasProperChimney = hasStructure && hasTypes && jsdocCount > 0

  let clarity: SmokeMeasure['clarity'] = 'choking'
  if (hasClearOutput && hasNoNoise && hasNoPollution && hasInformative) clarity = 'clear'
  else if (hasClearOutput && hasNoNoise) clarity = 'wispy'
  else if (hasClearOutput) clarity = 'hazy'
  else if (hasProperChimney && hasInformative) clarity = 'thick'
  else if (quality > 30) clarity = 'toxic'

  return {
    quality, clarity, hasClearOutput, hasProperSignal, hasNoNoise,
    hasInformative, hasNoPollution, hasProperDrift, hasNoObstruction,
    hasVisible, hasNoIrritation, hasProperChimney, noiseCount, pollutionCount,
  }
}

// ─── Ash Measurement ────────────────────────────────────────────────────────

/** @example measureAsh(content) returns ash analysis */
export function measureAsh(content: string): AshMeasure {
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

  let utility = 20
  if (hasStructure) utility += 12
  if (hasTypes) utility += 12
  if (hasFunctions) utility += 10
  if (jsdocCount > 0) utility += 8
  if (exportCount > 0) utility += 8
  if (genericsCount > 0) utility += 5
  if (importCount > 0) utility += 5
  if (anyCount === 0) utility += 5
  if (consoleCount === 0) utility += 5
  if (todoCount === 0) utility += 5
  if (deepNestedCount === 0) utility += 5
  utility = Math.min(100, Math.max(0, Math.round(utility)))

  const residueCount = anyCount + consoleCount + todoCount
  const buildupCount = deepNestedCount + privateCount + commentedCodeCount

  const hasProperCleanup = utility >= 75 && hasStructure && hasTypes
  const hasNoResidue = residueCount === 0
  const hasProperDisposal = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoBuildup = buildupCount === 0
  const hasRecyclable = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoContamination = commentedCodeCount === 0 && anyCount === 0
  const hasProperMaintenance = hasStructure && hasTypes && genericsCount > 0
  const hasNoBlockage = consoleCount === 0 && deepNestedCount === 0
  const hasCleanBurn = privateCount === 0 && todoCount === 0
  const hasNoWaste = residueCount === 0 && buildupCount === 0

  let ashType: AshMeasure['type'] = 'toxic-residue'
  if (hasProperCleanup && hasNoResidue && hasNoBuildup && hasNoContamination) ashType = 'useful-ash'
  else if (hasProperCleanup && hasNoResidue) ashType = 'clean-ash'
  else if (hasProperCleanup) ashType = 'gray-ash'
  else if (hasStructure && hasTypes && exportCount > 0) ashType = 'soot'
  else if (utility > 30) ashType = 'clinker'

  return {
    utility, type: ashType, hasProperCleanup, hasNoResidue, hasProperDisposal,
    hasNoBuildup, hasRecyclable, hasNoContamination, hasProperMaintenance,
    hasNoBlockage, hasCleanBurn, hasNoWaste, residueCount, buildupCount,
  }
}

// ─── Comfort Measurement ────────────────────────────────────────────────────

/** @example measureComfort(content) returns comfort analysis */
export function measureComfort(content: string): ComfortMeasure {
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

  const anxietyCount = anyCount + todoCount
  const stressCount = deepNestedCount + commentedCodeCount

  const hasHighComfort = score >= 75 && hasStructure && hasTypes
  const hasCozy = hasStructure && hasTypes && jsdocCount > 0
  const hasReliable = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoAnxiety = anxietyCount === 0
  const hasPeaceful = consoleCount === 0 && commentedCodeCount === 0
  const hasNoStress = stressCount === 0
  const hasNourishing = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0
  const hasNoFear = consoleCount === 0 && deepNestedCount === 0
  const hasProtective = hasStructure && hasTypes && genericsCount > 0
  const hasNoDanger = anyCount === 0 && deepNestedCount === 0
  const hasGathering = hasFunctions && jsdocCount > 0 && genericsCount > 0

  let comfortLevel: ComfortMeasure['level'] = 'barren'
  if (hasHighComfort && hasNoAnxiety && hasNoStress && hasGathering) comfortLevel = 'sanctuary'
  else if (hasHighComfort && hasNoAnxiety) comfortLevel = 'comfortable'
  else if (hasHighComfort) comfortLevel = 'adequate'
  else if (hasCozy && hasReliable) comfortLevel = 'sparse'
  else if (score > 30) comfortLevel = 'cold'

  return {
    score, level: comfortLevel, hasHighComfort, hasCozy, hasReliable,
    hasNoAnxiety, hasPeaceful, hasNoStress, hasNourishing, hasNoFear,
    hasProtective, hasNoDanger, hasGathering, anxietyCount, stressCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(ember) returns condition string */
export function classifyCondition(ember: HearthEmber): HearthEmber['condition'] {
  const { qualityScore } = ember
  if (qualityScore >= 80) return 'eternal-flame'
  if (qualityScore >= 65) return 'roaring-fire'
  if (qualityScore >= 50) return 'steady-hearth'
  if (qualityScore >= 35) return 'banked-coals'
  if (qualityScore >= 20) return 'dying-ember'
  return 'cold-ash'
}

// ─── Ember Analysis ─────────────────────────────────────────────────────────

/** @example analyzeHearthEmber(content, filePath) returns full ember */
export function analyzeHearthEmber(content: string, filePath: string): HearthEmber {
  const warmth = measureWarmth(content)
  const persistence = measurePersistence(content)
  const fuel = measureFuel(content)
  const smoke = measureSmoke(content)
  const ash = measureAsh(content)
  const comfort = measureComfort(content)

  const emberWarmth = warmth.level
  const hearthPersistence = persistence.level
  const fuelQuality = fuel.quality
  const smokeQuality = smoke.quality
  const ashUtility = ash.utility
  const hearthComfort = comfort.score

  const qualityScore = Math.round(
    emberWarmth * 0.15 +
    hearthPersistence * 0.15 +
    fuelQuality * 0.15 +
    smokeQuality * 0.2 +
    ashUtility * 0.15 +
    hearthComfort * 0.2,
  )

  const result: HearthEmber = {
    file: filePath,
    emberWarmth, hearthPersistence, fuelQuality, smokeQuality,
    ashUtility, hearthComfort,
    warmth, persistence, fuel, smoke, ash, comfort,
    condition: 'cold-ash',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Circle Analysis ────────────────────────────────────────────────────────

/** @example analyzeHearthCircle(embers, dirPath) returns circle */
export function analyzeHearthCircle(embers: HearthEmber[], dirPath: string): HearthCircle {
  if (embers.length === 0) {
    return {
      directory: dirPath, embers: [], avgWarmth: 0, avgPersistence: 0, avgComfort: 0,
      eternalCount: 0, coldAshCount: 0, warmCount: 0, comfortableCount: 0,
      circleType: 'darkness', condition: 'void',
    }
  }

  const avgWarmth = Math.round(embers.reduce((s, e) => s + e.emberWarmth, 0) / embers.length)
  const avgPersistence = Math.round(embers.reduce((s, e) => s + e.hearthPersistence, 0) / embers.length)
  const avgComfort = Math.round(embers.reduce((s, e) => s + e.hearthComfort, 0) / embers.length)

  const eternalCount = embers.filter((e) => e.condition === 'eternal-flame').length
  const coldAshCount = embers.filter((e) => e.condition === 'cold-ash').length
  const warmCount = embers.filter((e) => e.warmth.hasHighWarmth).length
  const comfortableCount = embers.filter((e) => e.comfort.hasHighComfort).length

  const circleType = classifyCircleType(embers)
  const avgScore = embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length
  const condition = classifyCircleCondition(avgScore)

  return {
    directory: dirPath, embers, avgWarmth, avgPersistence, avgComfort,
    eternalCount, coldAshCount, warmCount, comfortableCount, circleType, condition,
  }
}

// ─── Circle Classification ──────────────────────────────────────────────────

/** @example classifyCircleType(embers) returns circle type */
export function classifyCircleType(embers: HearthEmber[]): HearthCircle['circleType'] {
  if (embers.length === 0) return 'darkness'
  const avgScore = embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length
  const eternalCnt = embers.filter((e) => e.condition === 'eternal-flame').length
  if (avgScore >= 75 && eternalCnt >= Math.ceil(embers.length * 0.3)) return 'great-hall'
  if (avgScore >= 60) return 'family-hearth'
  if (avgScore >= 45) return 'campfire'
  if (avgScore >= 30) return 'fire-pit'
  if (avgScore >= 15) return 'candle'
  return 'darkness'
}

/** @example classifyCircleCondition(avgScore) returns condition */
export function classifyCircleCondition(avgScore: number): HearthCircle['condition'] {
  if (avgScore >= 80) return 'ancestral-hall'
  if (avgScore >= 65) return 'warm-home'
  if (avgScore >= 50) return 'campsite'
  if (avgScore >= 35) return 'shelter'
  if (avgScore >= 20) return 'ruins'
  return 'void'
}

/** @example classifyKeeperGrade(avgWarmth) returns grade */
export function classifyKeeperGrade(avgWarmth: number): EmberHearthResult['stats']['keeperGrade'] {
  if (avgWarmth >= 80) return 'hearth-master'
  if (avgWarmth >= 65) return 'firekeeper'
  if (avgWarmth >= 50) return 'stoker'
  if (avgWarmth >= 35) return 'tender'
  if (avgWarmth >= 20) return 'lighter'
  return 'ice-walker'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(embers, circles, home, stats) returns recommendations */
export function generateRecommendations(
  embers: HearthEmber[],
  circles: HearthCircle[],
  home: EmberHearthResult['home'],
  stats: EmberHearthResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgEmberWarmth < 50) recs.push('Stoke the embers — make your code more approachable')
  if (stats.avgHearthPersistence < 50) recs.push('Build persistence — make your code more reliable')
  if (stats.avgFuelQuality < 50) recs.push('Improve fuel quality — write more efficient code')
  if (stats.avgSmokeQuality < 50) recs.push('Clear the smoke — improve your code output clarity')
  if (stats.avgAshUtility < 50) recs.push('Clean the hearth — improve your code cleanup practices')
  if (stats.avgHearthComfort < 50) recs.push('Warm the hearth — make your code more comfortable')
  if (stats.coldAshCount > embers.length * 0.5) recs.push('Too many cold ashes — over half the codebase lacks warmth')
  if (stats.hasHighComfortCount === 0) recs.push('No sanctuary found — cultivate comfort with patience')
  if (circles.length > 0 && home.overallWarmth < 60) recs.push('Overall hearth warmth is low — consult the hearth master')
  if (recs.length === 0) recs.push('Eternal hearth achieved — your code is a warm sanctuary')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildEmberHearthResult(files, contents, options) returns full result */
export function buildEmberHearthResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): EmberHearthResult {
  const embers: HearthEmber[] = files.map((file, i) =>
    analyzeHearthEmber(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, HearthEmber[]>()
  for (const ember of embers) {
    const dir = ember.file.includes('/')
      ? ember.file.substring(0, ember.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ember)
    } else {
      dirMap.set(dir, [ember])
    }
  }

  const circles: HearthCircle[] = Array.from(dirMap.entries()).map(([dir, dirEmbers]) =>
    analyzeHearthCircle(dirEmbers, dir),
  )

  const avgWarmth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.emberWarmth, 0) / embers.length)
    : 0
  const avgPersistence = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.hearthPersistence, 0) / embers.length)
    : 0
  const avgComfort = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.hearthComfort, 0) / embers.length)
    : 0
  const overallWarmth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)
    : 0
  const isWarm = overallWarmth >= 65

  const home: EmberHearthResult['home'] = {
    avgWarmth, avgPersistence, avgComfort, isWarm, overallWarmth,
  }

  const avgEmberWarmth = avgWarmth
  const avgHearthPersistence = avgPersistence
  const avgFuelQuality = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.fuelQuality, 0) / embers.length)
    : 0
  const avgSmokeQuality = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.smokeQuality, 0) / embers.length)
    : 0
  const avgAshUtility = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.ashUtility, 0) / embers.length)
    : 0
  const avgHearthComfort = avgComfort

  const conditionCounts = {
    eternalFlame: 0, roaringFire: 0, steadyHearth: 0,
    bankedCoals: 0, dyingEmber: 0, coldAsh: 0,
  }
  for (const e of embers) {
    switch (e.condition) {
      case 'eternal-flame': conditionCounts.eternalFlame++; break
      case 'roaring-fire': conditionCounts.roaringFire++; break
      case 'steady-hearth': conditionCounts.steadyHearth++; break
      case 'banked-coals': conditionCounts.bankedCoals++; break
      case 'dying-ember': conditionCounts.dyingEmber++; break
      case 'cold-ash': conditionCounts.coldAsh++; break
    }
  }

  const hasHighWarmthCount = embers.filter((e) => e.warmth.hasHighWarmth).length
  const hasHighPersistenceCount = embers.filter((e) => e.persistence.hasHighPersistence).length
  const hasHighEfficiencyCount = embers.filter((e) => e.fuel.hasHighEfficiency).length
  const hasClearOutputCount = embers.filter((e) => e.smoke.hasClearOutput).length
  const hasProperCleanupCount = embers.filter((e) => e.ash.hasProperCleanup).length
  const hasHighComfortCount = embers.filter((e) => e.comfort.hasHighComfort).length

  const bestEmber = embers.length > 0
    ? embers.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file
    : ''
  const warmest = embers.length > 0
    ? embers.reduce((best, e) => e.emberWarmth > best.emberWarmth ? e : best).file
    : ''
  const mostPersistent = embers.length > 0
    ? embers.reduce((best, e) => e.hearthPersistence > best.hearthPersistence ? e : best).file
    : ''
  const mostEfficient = embers.length > 0
    ? embers.reduce((best, e) => e.fuelQuality > best.fuelQuality ? e : best).file
    : ''
  const clearestOutput = embers.length > 0
    ? embers.reduce((best, e) => e.smokeQuality > best.smokeQuality ? e : best).file
    : ''
  const mostComfortable = embers.length > 0
    ? embers.reduce((best, e) => e.hearthComfort > best.hearthComfort ? e : best).file
    : ''

  const keeperGrade = classifyKeeperGrade(overallWarmth)

  const stats: EmberHearthResult['stats'] = {
    totalFiles: files.length, totalCircles: circles.length,
    avgEmberWarmth, avgHearthPersistence, avgFuelQuality,
    avgSmokeQuality, avgAshUtility, avgHearthComfort,
    eternalFlameCount: conditionCounts.eternalFlame,
    roaringFireCount: conditionCounts.roaringFire,
    steadyHearthCount: conditionCounts.steadyHearth,
    bankedCoalsCount: conditionCounts.bankedCoals,
    dyingEmberCount: conditionCounts.dyingEmber,
    coldAshCount: conditionCounts.coldAsh,
    hasHighWarmthCount, hasHighPersistenceCount, hasHighEfficiencyCount,
    hasClearOutputCount, hasProperCleanupCount, hasHighComfortCount,
    overallWarmth, keeperGrade,
    bestEmber, warmest, mostPersistent, mostEfficient,
    clearestOutput, mostComfortable,
  }

  const recommendations = generateRecommendations(embers, circles, home, stats)

  return { embers, circles, home, stats, recommendations }
}
