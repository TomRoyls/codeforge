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
const STATIC_REGEX = /\bstatic\s+/g
const READONLY_REGEX = /\breadonly\b/g
const ANY_REGEX = /\bany\b/g
const COMMENTED_CODE_REGEX = /\/\/\s*(function|const|let|var|import|export|class|if|for|while|return|switch)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const CONDITIONAL_REGEX = /\bif\s*\(/g
const LOOP_REGEX = /\b(for|while|do)\s*[\({]/g
const PROMISE_REGEX = /\bPromise\b/g
const STRING_TEMPLATE_REGEX = /`[^`]*\$\{/g
const DESTRUCTURE_REGEX = /\{[^}]*\}\s*=/g

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
function countStaticMembers(content: string): number { return countMatches(content, STATIC_REGEX) }
function countReadonlyMembers(content: string): number { return countMatches(content, READONLY_REGEX) }
function countAnyUsage(content: string): number { return countMatches(content, ANY_REGEX) }
function countCommentedCode(content: string): number { return countMatches(content, COMMENTED_CODE_REGEX) }
function countReExports(content: string): number { return countMatches(content, REEXPORT_REGEX) }
function countConditionals(content: string): number { return countMatches(content, CONDITIONAL_REGEX) }
function countLoops(content: string): number { return countMatches(content, LOOP_REGEX) }
function countPromiseUsage(content: string): number { return countMatches(content, PROMISE_REGEX) }
function countTemplateLiterals(content: string): number { return countMatches(content, STRING_TEMPLATE_REGEX) }
function countDestructures(content: string): number { return countMatches(content, DESTRUCTURE_REGEX) }

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface FlowMeasure {
  level: number
  pattern: 'zephyr' | 'breeze' | 'draft' | 'whisper' | 'still' | 'blocked'
  hasGoodFlow: boolean
  hasNaturalVentilation: boolean
  hasProperChannels: boolean
  hasNoBlockage: boolean
  hasWindward: boolean
  hasLeeward: boolean
  hasNoTurbulence: boolean
  hasProperDraft: boolean
  hasCrossVentilation: boolean
  hasNoStagnation: boolean
  blockageCount: number
  turbulenceCount: number
}

export interface HarmonyMeasure {
  level: number
  tone: 'symphony' | 'harmony' | 'melody' | 'hum' | 'dissonance' | 'noise'
  hasHighHarmony: boolean
  hasResonance: boolean
  hasProperProportions: boolean
  hasBalance: boolean
  hasNoDiscord: boolean
  hasSacredGeometry: boolean
  hasProperRhythm: boolean
  hasNoConflict: boolean
  hasUnity: boolean
  hasNoChaos: boolean
  discordCount: number
  chaosCount: number
}

export interface AlignmentMeasure {
  level: number
  direction: 'true-north' | 'cardinal' | 'ordinal' | 'magnetic' | 'lost' | 'aimless'
  hasProperAlignment: boolean
  hasClearPurpose: boolean
  hasProperOrientation: boolean
  hasNoMisalignment: boolean
  hasAstronomical: boolean
  hasSolar: boolean
  hasLunar: boolean
  hasNoDrift: boolean
  hasProperAxis: boolean
  hasNoObstruction: boolean
  misalignmentCount: number
  driftCount: number
}

export interface GraceMeasure {
  level: number
  style: 'flying-eaves' | 'pagoda' | 'shrine' | 'pavilion' | 'hut' | 'ruins'
  hasGracefulStructure: boolean
  hasProperColumns: boolean
  hasProperBeams: boolean
  hasNoOverloading: boolean
  hasElegantJoinery: boolean
  hasNoWeakJoints: boolean
  hasProperSpacing: boolean
  hasBalancedLoad: boolean
  hasNoSagging: boolean
  hasProperFoundation: boolean
  weakJointCount: number
  saggingCount: number
}

export interface OpennessMeasure {
  level: number
  design: 'open-air' | 'courtyard' | 'arcade' | 'cloister' | 'walled' | 'fortress'
  hasTransparency: boolean
  hasProperExposure: boolean
  hasNoHiddenChambers: boolean
  hasProperLighting: boolean
  hasVentilation: boolean
  hasNoDarkCorners: boolean
  hasOpenPlan: boolean
  hasNoSecretPassages: boolean
  hasProperWindows: boolean
  hasNoBlindSpots: boolean
  hiddenChamberCount: number
  blindSpotCount: number
}

export interface ClarityMeasure {
  level: number
  state: 'enlightened' | 'clear' | 'mediative' | 'clouded' | 'obscured' | 'void'
  hasHighClarity: boolean
  hasMeditation: boolean
  hasNoDistraction: boolean
  hasProperFocus: boolean
  hasInnerPeace: boolean
  hasNoConfusion: boolean
  hasZen: boolean
  hasNoComplexity: boolean
  hasProperBreathing: boolean
  hasNoStress: boolean
  hasMindfulness: boolean
  distractionCount: number
  stressCount: number
}

export interface TempleChamber {
  file: string
  windFlow: number
  templeHarmony: number
  energyAlignment: number
  structuralGrace: number
  opennessQuality: number
  spiritualClarity: number
  flow: FlowMeasure
  harmony: HarmonyMeasure
  alignment: AlignmentMeasure
  grace: GraceMeasure
  openness: OpennessMeasure
  clarity: ClarityMeasure
  condition: 'mountain-shrine' | 'garden-temple' | 'forest-sanctuary' | 'wayside-shrine' | 'abandoned-ruin' | 'rubble'
  qualityScore: number
}

export interface TempleComplex {
  directory: string
  chambers: TempleChamber[]
  avgFlow: number
  avgHarmony: number
  avgClarity: number
  mountainShrineCount: number
  rubbleCount: number
  goodFlowCount: number
  highHarmonyCount: number
  complexType: 'grand-temple' | 'monastery' | 'shrine-complex' | 'meditation-garden' | 'clearing' | 'overgrown'
  condition: 'sacred-site' | 'pilgrimage' | 'retreat' | 'village-temple' | 'abandoned' | 'lost'
}

export interface WindTempleResult {
  chambers: TempleChamber[]
  complexes: TempleComplex[]
  sanctuary: {
    avgFlow: number
    avgHarmony: number
    avgClarity: number
    isEnlightened: boolean
    overallHarmony: number
  }
  stats: {
    totalFiles: number
    totalComplexes: number
    avgWindFlow: number
    avgTempleHarmony: number
    avgEnergyAlignment: number
    avgStructuralGrace: number
    avgOpennessQuality: number
    avgSpiritualClarity: number
    mountainShrineCount: number
    gardenTempleCount: number
    forestSanctuaryCount: number
    waysideShrineCount: number
    abandonedRuinCount: number
    rubbleCount: number
    hasGoodFlowCount: number
    hasHighHarmonyCount: number
    hasProperAlignmentCount: number
    hasGracefulStructureCount: number
    hasTransparencyCount: number
    hasHighClarityCount: number
    overallHarmony: number
    architectGrade: 'master-architect' | 'temple-architect' | 'builder' | 'apprentice' | 'novice' | 'iconoclast'
    bestChamber: string
    bestFlow: string
    mostHarmonious: string
    bestAligned: string
    mostGraceful: string
    clearest: string
  }
  recommendations: string[]
}

// ─── Flow Measurement ───────────────────────────────────────────────────────

/** @example measureFlow(content) returns flow analysis */
export function measureFlow(content: string): FlowMeasure {
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
  const tryCatchCount = countTryCatch(content)
  const promiseCount = countPromiseUsage(content)

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
  if (asyncCount > 0) level += 5
  if (consoleCount === 0) level += 4
  if (anyCount === 0) level += 4
  if (todoCount === 0) level += 4
  level = Math.min(100, Math.max(0, Math.round(level)))

  const blockageCount = deepNestedCount + commentedCodeCount
  const turbulenceCount = consoleCount + todoCount

  const hasGoodFlow = level >= 80 && hasStructure && hasTypes
  const hasNaturalVentilation = hasStructure && hasTypes && hasFunctions
  const hasProperChannels = hasStructure && hasTypes && exportCount > 0
  const hasNoBlockage = blockageCount === 0
  const hasWindward = importCount > 0
  const hasLeeward = exportCount > 0
  const hasNoTurbulence = turbulenceCount === 0
  const hasProperDraft = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasCrossVentilation = hasStructure && hasTypes && exportCount > 0 && importCount > 0
  const hasNoStagnation = hasFunctions

  let pattern: FlowMeasure['pattern'] = 'blocked'
  if (hasGoodFlow && hasNoBlockage && hasNoTurbulence && hasCrossVentilation) pattern = 'zephyr'
  else if (hasGoodFlow && hasNoBlockage) pattern = 'breeze'
  else if (hasGoodFlow) pattern = 'draft'
  else if (hasNaturalVentilation) pattern = 'whisper'
  else if (level > 30) pattern = 'still'

  return {
    level, pattern, hasGoodFlow, hasNaturalVentilation, hasProperChannels,
    hasNoBlockage, hasWindward, hasLeeward, hasNoTurbulence, hasProperDraft,
    hasCrossVentilation, hasNoStagnation, blockageCount, turbulenceCount,
  }
}

// ─── Harmony Measurement ────────────────────────────────────────────────────

/** @example measureHarmony(content) returns harmony analysis */
export function measureHarmony(content: string): HarmonyMeasure {
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
  const asyncCount = countAsyncKeywords(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
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
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (readonlyCount > 0) level += 3
  if (privateCount > 0 || protectedCount > 0) level += 3
  if (staticCount > 0) level += 2
  if (asyncCount > 0) level += 3
  if (anyCount === 0) level += 3
  if (consoleCount === 0) level += 4
  level = Math.min(100, Math.max(0, Math.round(level)))

  const discordCount = anyCount + consoleCount
  const chaosCount = todoCount + deepNestedCount

  const hasHighHarmony = level >= 80 && hasStructure && hasTypes
  const hasResonance = hasStructure && hasTypes && genericsCount > 0
  const hasProperProportions = hasStructure && hasTypes && hasFunctions
  const hasBalance = hasStructure && hasTypes && exportCount > 0
  const hasNoDiscord = discordCount === 0
  const hasSacredGeometry = hasStructure && hasTypes && genericsCount > 0 && jsdocCount > 0
  const hasProperRhythm = hasFunctions && (asyncCount > 0 || exportCount > 0)
  const hasNoConflict = todoCount === 0
  const hasUnity = hasStructure && hasTypes && hasFunctions && anyCount === 0
  const hasNoChaos = chaosCount === 0

  let tone: HarmonyMeasure['tone'] = 'noise'
  if (hasHighHarmony && hasNoDiscord && hasNoChaos && hasSacredGeometry) tone = 'symphony'
  else if (hasHighHarmony && hasNoDiscord) tone = 'harmony'
  else if (hasHighHarmony) tone = 'melody'
  else if (hasProperProportions) tone = 'hum'
  else if (level > 30) tone = 'dissonance'

  return {
    level, tone, hasHighHarmony, hasResonance, hasProperProportions, hasBalance,
    hasNoDiscord, hasSacredGeometry, hasProperRhythm, hasNoConflict, hasUnity,
    hasNoChaos, discordCount, chaosCount,
  }
}

// ─── Alignment Measurement ──────────────────────────────────────────────────

/** @example measureAlignment(content) returns alignment analysis */
export function measureAlignment(content: string): AlignmentMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
  const consoleCount = countConsoleUsage(content)
  const anyCount = countAnyUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)
  const privateCount = countPrivateMembers(content)
  const protectedCount = countProtectedMembers(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 25
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (tryCatchCount > 0) level += 5
  if (asyncCount > 0) level += 3
  if (consoleCount === 0) level += 4
  if (anyCount === 0) level += 3
  level = Math.min(100, Math.max(0, Math.round(level)))

  const misalignmentCount = anyCount + todoCount
  const driftCount = deepNestedCount

  const hasProperAlignment = level >= 75 && hasStructure && hasTypes
  const hasClearPurpose = hasStructure && hasTypes && hasFunctions
  const hasProperOrientation = hasStructure && hasTypes && exportCount > 0
  const hasNoMisalignment = misalignmentCount === 0
  const hasAstronomical = hasStructure && hasTypes && genericsCount > 0
  const hasSolar = hasStructure && hasTypes && hasFunctions
  const hasLunar = tryCatchCount > 0 || asyncCount > 0
  const hasNoDrift = deepNestedCount === 0
  const hasProperAxis = hasStructure && hasTypes && hasFunctions
  const hasNoObstruction = consoleCount === 0

  let direction: AlignmentMeasure['direction'] = 'aimless'
  if (hasProperAlignment && hasNoMisalignment && hasNoDrift && hasAstronomical) direction = 'true-north'
  else if (hasProperAlignment && hasNoMisalignment) direction = 'cardinal'
  else if (hasProperAlignment) direction = 'ordinal'
  else if (hasClearPurpose) direction = 'magnetic'
  else if (level > 30) direction = 'lost'

  return {
    level, direction, hasProperAlignment, hasClearPurpose, hasProperOrientation,
    hasNoMisalignment, hasAstronomical, hasSolar, hasLunar, hasNoDrift,
    hasProperAxis, hasNoObstruction, misalignmentCount, driftCount,
  }
}

// ─── Grace Measurement ──────────────────────────────────────────────────────

/** @example measureGrace(content) returns grace analysis */
export function measureGrace(content: string): GraceMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
  const exportCount = countExportKeywords(content)
  const importCount = countImportKeywords(content)
  const reExportCount = countReExports(content)
  const asyncCount = countAsyncKeywords(content)
  const tryCatchCount = countTryCatch(content)
  const anyCount = countAnyUsage(content)
  const consoleCount = countConsoleUsage(content)
  const todoCount = countTodoComments(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let level = 25
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (exportCount > 0) level += 5
  if (importCount > 0) level += 5
  if (reExportCount > 0) level += 5
  if (asyncCount > 0) level += 3
  if (tryCatchCount > 0) level += 5
  if (anyCount === 0) level += 3
  if (consoleCount === 0) level += 2
  level = Math.min(100, Math.max(0, Math.round(level)))

  const weakJointCount = todoCount
  const saggingCount = deepNestedCount

  const hasGracefulStructure = level >= 75 && hasStructure && hasTypes
  const hasProperColumns = hasStructure && hasTypes
  const hasProperBeams = hasStructure && hasTypes && exportCount > 0
  const hasNoOverloading = deepNestedCount === 0
  const hasElegantJoinery = hasStructure && hasTypes && genericsCount > 0
  const hasNoWeakJoints = weakJointCount === 0
  const hasProperSpacing = hasStructure && hasTypes && hasFunctions
  const hasBalancedLoad = hasFunctions && (asyncCount > 0 || tryCatchCount > 0)
  const hasNoSagging = saggingCount === 0
  const hasProperFoundation = hasStructure && hasTypes && hasFunctions

  let style: GraceMeasure['style'] = 'ruins'
  if (hasGracefulStructure && hasElegantJoinery && hasNoOverloading && hasNoWeakJoints) style = 'flying-eaves'
  else if (hasGracefulStructure && hasElegantJoinery) style = 'pagoda'
  else if (hasGracefulStructure) style = 'shrine'
  else if (hasProperColumns && hasProperBeams) style = 'pavilion'
  else if (level > 30) style = 'hut'

  return {
    level, style, hasGracefulStructure, hasProperColumns, hasProperBeams,
    hasNoOverloading, hasElegantJoinery, hasNoWeakJoints, hasProperSpacing,
    hasBalancedLoad, hasNoSagging, hasProperFoundation, weakJointCount, saggingCount,
  }
}

// ─── Openness Measurement ───────────────────────────────────────────────────

/** @example measureOpenness(content) returns openness analysis */
export function measureOpenness(content: string): OpennessMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
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

  let level = 20
  if (hasStructure) level += 12
  if (hasTypes) level += 12
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 10
  if (exportCount > 0) level += 10
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 4
  if (tryCatchCount > 0) level += 4
  if (privateCount === 0 && protectedCount === 0) level += 3
  if (commentedCodeCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const hiddenChamberCount = privateCount + protectedCount
  const blindSpotCount = anyCount + consoleCount

  const hasTransparency = level >= 75 && hasStructure && hasTypes
  const hasProperExposure = exportCount > 0
  const hasNoHiddenChambers = hiddenChamberCount === 0
  const hasProperLighting = jsdocCount > 0
  const hasVentilation = tryCatchCount > 0 || asyncCount > 0
  const hasNoDarkCorners = consoleCount === 0
  const hasOpenPlan = hasStructure && hasTypes && hasFunctions
  const hasNoSecretPassages = commentedCodeCount === 0
  const hasProperWindows = hasStructure && hasTypes && exportCount > 0
  const hasNoBlindSpots = blindSpotCount === 0

  let design: OpennessMeasure['design'] = 'fortress'
  if (hasTransparency && hasNoHiddenChambers && hasNoBlindSpots && hasProperLighting) design = 'open-air'
  else if (hasTransparency && hasNoHiddenChambers) design = 'courtyard'
  else if (hasTransparency) design = 'arcade'
  else if (hasOpenPlan && hasProperExposure) design = 'cloister'
  else if (level > 30) design = 'walled'

  return {
    level, design, hasTransparency, hasProperExposure, hasNoHiddenChambers,
    hasProperLighting, hasVentilation, hasNoDarkCorners, hasOpenPlan,
    hasNoSecretPassages, hasProperWindows, hasNoBlindSpots,
    hiddenChamberCount, blindSpotCount,
  }
}

// ─── Clarity Measurement ────────────────────────────────────────────────────

/** @example measureClarity(content) returns clarity analysis */
export function measureClarity(content: string): ClarityMeasure {
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
  if (genericsCount > 0) level += 5
  if (enumCount > 0) level += 5
  if (anyCount === 0) level += 8
  if (consoleCount === 0) level += 5
  if (todoCount === 0) level += 5
  if (deepNestedCount === 0) level += 8
  level = Math.min(100, Math.max(0, Math.round(level)))

  const distractionCount = todoCount + commentedCodeCount
  const stressCount = deepNestedCount + consoleCount

  const hasHighClarity = level >= 80 && anyCount === 0 && todoCount === 0
  const hasMeditation = hasStructure && hasTypes && hasFunctions && deepNestedCount === 0
  const hasNoDistraction = distractionCount === 0
  const hasProperFocus = hasStructure && hasTypes && hasFunctions
  const hasInnerPeace = anyCount === 0 && consoleCount === 0
  const hasNoConfusion = anyCount === 0
  const hasZen = hasStructure && hasTypes && hasFunctions && deepNestedCount === 0 && anyCount === 0
  const hasNoComplexity = deepNestedCount === 0
  const hasProperBreathing = jsdocCount > 0
  const hasNoStress = stressCount === 0
  const hasMindfulness = jsdocCount > 0 && exportCount > 0

  let clarityState: ClarityMeasure['state'] = 'void'
  if (hasHighClarity && hasZen && hasNoDistraction && hasMindfulness) clarityState = 'enlightened'
  else if (hasHighClarity && hasZen) clarityState = 'clear'
  else if (hasHighClarity) clarityState = 'mediative'
  else if (level >= 60 && hasStructure && hasTypes) clarityState = 'clouded'
  else if (level > 30) clarityState = 'obscured'

  return {
    level, state: clarityState, hasHighClarity, hasMeditation, hasNoDistraction,
    hasProperFocus, hasInnerPeace, hasNoConfusion, hasZen, hasNoComplexity,
    hasProperBreathing, hasNoStress, hasMindfulness, distractionCount, stressCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(chamber) returns condition string */
export function classifyCondition(chamber: TempleChamber): TempleChamber['condition'] {
  const { qualityScore } = chamber
  if (qualityScore >= 80) return 'mountain-shrine'
  if (qualityScore >= 65) return 'garden-temple'
  if (qualityScore >= 50) return 'forest-sanctuary'
  if (qualityScore >= 35) return 'wayside-shrine'
  if (qualityScore >= 20) return 'abandoned-ruin'
  return 'rubble'
}

// ─── Chamber Analysis ───────────────────────────────────────────────────────

/** @example analyzeTempleChamber(content, filePath) returns full chamber */
export function analyzeTempleChamber(content: string, filePath: string): TempleChamber {
  const flow = measureFlow(content)
  const harmony = measureHarmony(content)
  const alignment = measureAlignment(content)
  const grace = measureGrace(content)
  const openness = measureOpenness(content)
  const clarity = measureClarity(content)

  const windFlow = flow.level
  const templeHarmony = harmony.level
  const energyAlignment = alignment.level
  const structuralGrace = grace.level
  const opennessQuality = openness.level
  const spiritualClarity = clarity.level

  const qualityScore = Math.round(
    windFlow * 0.15 +
    templeHarmony * 0.15 +
    energyAlignment * 0.15 +
    structuralGrace * 0.2 +
    opennessQuality * 0.15 +
    spiritualClarity * 0.2,
  )

  const chamber: TempleChamber = {
    file: filePath,
    windFlow, templeHarmony, energyAlignment, structuralGrace,
    opennessQuality, spiritualClarity,
    flow, harmony, alignment, grace, openness, clarity,
    condition: 'rubble',
    qualityScore,
  }

  chamber.condition = classifyCondition(chamber)

  return chamber
}

// ─── Complex Analysis ───────────────────────────────────────────────────────

/** @example analyzeTempleComplex(chambers, dirPath) returns complex */
export function analyzeTempleComplex(chambers: TempleChamber[], dirPath: string): TempleComplex {
  if (chambers.length === 0) {
    return {
      directory: dirPath, chambers: [], avgFlow: 0, avgHarmony: 0, avgClarity: 0,
      mountainShrineCount: 0, rubbleCount: 0, goodFlowCount: 0, highHarmonyCount: 0,
      complexType: 'overgrown', condition: 'lost',
    }
  }

  const avgFlow = Math.round(chambers.reduce((s, c) => s + c.windFlow, 0) / chambers.length)
  const avgHarmony = Math.round(chambers.reduce((s, c) => s + c.templeHarmony, 0) / chambers.length)
  const avgClarity = Math.round(chambers.reduce((s, c) => s + c.spiritualClarity, 0) / chambers.length)

  const mountainShrineCount = chambers.filter((c) => c.condition === 'mountain-shrine').length
  const rubbleCount = chambers.filter((c) => c.condition === 'rubble').length
  const goodFlowCount = chambers.filter((c) => c.flow.hasGoodFlow).length
  const highHarmonyCount = chambers.filter((c) => c.harmony.hasHighHarmony).length

  const complexType = classifyComplexType(chambers)
  const avgQuality = chambers.reduce((s, c) => s + c.qualityScore, 0) / chambers.length
  const condition = classifyComplexCondition(avgQuality)

  return {
    directory: dirPath, chambers, avgFlow, avgHarmony, avgClarity,
    mountainShrineCount, rubbleCount, goodFlowCount, highHarmonyCount,
    complexType, condition,
  }
}

// ─── Complex Classification ────────────────────────────────────────────────

/** @example classifyComplexType(chambers) returns complex type */
export function classifyComplexType(chambers: TempleChamber[]): TempleComplex['complexType'] {
  if (chambers.length === 0) return 'overgrown'
  const avgQuality = chambers.reduce((s, c) => s + c.qualityScore, 0) / chambers.length
  const shrineCnt = chambers.filter((c) => c.condition === 'mountain-shrine').length
  if (avgQuality >= 75 && shrineCnt >= Math.ceil(chambers.length * 0.3)) return 'grand-temple'
  if (avgQuality >= 60) return 'monastery'
  if (avgQuality >= 45) return 'shrine-complex'
  if (avgQuality >= 30) return 'meditation-garden'
  if (avgQuality >= 15) return 'clearing'
  return 'overgrown'
}

/** @example classifyComplexCondition(avgQuality) returns condition */
export function classifyComplexCondition(avgQuality: number): TempleComplex['condition'] {
  if (avgQuality >= 80) return 'sacred-site'
  if (avgQuality >= 65) return 'pilgrimage'
  if (avgQuality >= 50) return 'retreat'
  if (avgQuality >= 35) return 'village-temple'
  if (avgQuality >= 20) return 'abandoned'
  return 'lost'
}

/** @example classifyArchitectGrade(avgHarmony) returns grade */
export function classifyArchitectGrade(avgHarmony: number): WindTempleResult['stats']['architectGrade'] {
  if (avgHarmony >= 80) return 'master-architect'
  if (avgHarmony >= 65) return 'temple-architect'
  if (avgHarmony >= 50) return 'builder'
  if (avgHarmony >= 35) return 'apprentice'
  if (avgHarmony >= 20) return 'novice'
  return 'iconoclast'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(chambers, complexes, sanctuary, stats) returns recommendations */
export function generateRecommendations(
  chambers: TempleChamber[],
  complexes: TempleComplex[],
  sanctuary: WindTempleResult['sanctuary'],
  stats: WindTempleResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgWindFlow < 50) recs.push('Improve wind flow — enhance code flow and data movement')
  if (stats.avgTempleHarmony < 50) recs.push('Restore temple harmony — improve code coherence')
  if (stats.avgEnergyAlignment < 50) recs.push('Realign energy — improve code alignment with purpose')
  if (stats.avgStructuralGrace < 50) recs.push('Strengthen structural grace — improve code architecture')
  if (stats.avgOpennessQuality < 50) recs.push('Increase openness — improve code transparency')
  if (stats.avgSpiritualClarity < 50) recs.push('Seek clarity — reduce code complexity and distractions')
  if (stats.rubbleCount > chambers.length * 0.5) recs.push('Too much rubble — over half the codebase is poor quality')
  if (stats.hasHighClarityCount === 0) recs.push('No enlightened code found — strive for clearer code')
  if (complexes.length > 0 && sanctuary.overallHarmony < 60) recs.push('Overall harmony is low — systematic improvement recommended')
  if (recs.length === 0) recs.push('Wind temple masterpiece — your code channels harmonious, graceful flow')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildWindTempleResult(files, contents, options) returns full result */
export function buildWindTempleResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): WindTempleResult {
  const chambers: TempleChamber[] = files.map((file, i) =>
    analyzeTempleChamber(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TempleChamber[]>()
  for (const chamber of chambers) {
    const dir = chamber.file.includes('/')
      ? chamber.file.substring(0, chamber.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(chamber)
    } else {
      dirMap.set(dir, [chamber])
    }
  }

  const complexes: TempleComplex[] = Array.from(dirMap.entries()).map(([dir, dirChambers]) =>
    analyzeTempleComplex(dirChambers, dir),
  )

  const avgFlow = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.windFlow, 0) / chambers.length)
    : 0
  const avgHarmony = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.templeHarmony, 0) / chambers.length)
    : 0
  const avgClarity = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.spiritualClarity, 0) / chambers.length)
    : 0
  const overallHarmony = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.qualityScore, 0) / chambers.length)
    : 0
  const isEnlightened = overallHarmony >= 65

  const sanctuary: WindTempleResult['sanctuary'] = {
    avgFlow, avgHarmony, avgClarity, isEnlightened, overallHarmony,
  }

  const avgWindFlow = avgFlow
  const avgTempleHarmony = avgHarmony
  const avgEnergyAlignment = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.energyAlignment, 0) / chambers.length)
    : 0
  const avgStructuralGrace = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.structuralGrace, 0) / chambers.length)
    : 0
  const avgOpennessQuality = chambers.length > 0
    ? Math.round(chambers.reduce((s, c) => s + c.opennessQuality, 0) / chambers.length)
    : 0
  const avgSpiritualClarity = avgClarity

  const conditionCounts = {
    mountain: 0, garden: 0, forest: 0, wayside: 0, abandoned: 0, rubble: 0,
  }
  for (const c of chambers) {
    switch (c.condition) {
      case 'mountain-shrine': conditionCounts.mountain++; break
      case 'garden-temple': conditionCounts.garden++; break
      case 'forest-sanctuary': conditionCounts.forest++; break
      case 'wayside-shrine': conditionCounts.wayside++; break
      case 'abandoned-ruin': conditionCounts.abandoned++; break
      case 'rubble': conditionCounts.rubble++; break
    }
  }

  const hasGoodFlowCount = chambers.filter((c) => c.flow.hasGoodFlow).length
  const hasHighHarmonyCount = chambers.filter((c) => c.harmony.hasHighHarmony).length
  const hasProperAlignmentCount = chambers.filter((c) => c.alignment.hasProperAlignment).length
  const hasGracefulStructureCount = chambers.filter((c) => c.grace.hasGracefulStructure).length
  const hasTransparencyCount = chambers.filter((c) => c.openness.hasTransparency).length
  const hasHighClarityCount = chambers.filter((c) => c.clarity.hasHighClarity).length

  const bestChamber = chambers.length > 0
    ? chambers.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file
    : ''
  const bestFlow = chambers.length > 0
    ? chambers.reduce((best, c) => c.windFlow > best.windFlow ? c : best).file
    : ''
  const mostHarmonious = chambers.length > 0
    ? chambers.reduce((best, c) => c.templeHarmony > best.templeHarmony ? c : best).file
    : ''
  const bestAligned = chambers.length > 0
    ? chambers.reduce((best, c) => c.energyAlignment > best.energyAlignment ? c : best).file
    : ''
  const mostGraceful = chambers.length > 0
    ? chambers.reduce((best, c) => c.structuralGrace > best.structuralGrace ? c : best).file
    : ''
  const clearest = chambers.length > 0
    ? chambers.reduce((best, c) => c.spiritualClarity > best.spiritualClarity ? c : best).file
    : ''

  const architectGrade = classifyArchitectGrade(overallHarmony)

  const stats: WindTempleResult['stats'] = {
    totalFiles: files.length, totalClusters: complexes.length,
    avgWindFlow, avgTempleHarmony, avgEnergyAlignment, avgStructuralGrace,
    avgOpennessQuality, avgSpiritualClarity,
    mountainShrineCount: conditionCounts.mountain, gardenTempleCount: conditionCounts.garden,
    forestSanctuaryCount: conditionCounts.forest, waysideShrineCount: conditionCounts.wayside,
    abandonedRuinCount: conditionCounts.abandoned, rubbleCount: conditionCounts.rubble,
    hasGoodFlowCount, hasHighHarmonyCount, hasProperAlignmentCount,
    hasGracefulStructureCount, hasTransparencyCount, hasHighClarityCount,
    overallHarmony, architectGrade,
    bestChamber, bestFlow, mostHarmonious, bestAligned, mostGraceful, clearest,
  }

  const recommendations = generateRecommendations(chambers, complexes, sanctuary, stats)

  return { chambers, complexes, sanctuary, stats, recommendations }
}
