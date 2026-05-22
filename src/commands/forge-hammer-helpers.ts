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

export interface WeightMeasure {
  impact: number
  class: 'sledge' | 'engineer' | 'cross-peen' | 'ball-peen' | 'tack' | 'feather'
  hasProperWeight: boolean
  hasHeavyImpact: boolean
  hasControlledForce: boolean
  hasNoOverstriking: boolean
  hasNoUnderstriking: boolean
  hasProperMomentum: boolean
  hasKineticTransfer: boolean
  hasNoRebound: boolean
  hasProperSwing: boolean
  hasNoMishit: boolean
  overstrikeCount: number
  mishitCount: number
}

export interface PrecisionMeasure {
  accuracy: number
  aim: 'bullseye' | 'on-target' | 'near-miss' | 'glancing' | 'wild' | 'blind'
  hasHighPrecision: boolean
  hasConsistentAccuracy: boolean
  hasNoMisses: boolean
  hasProperAlignment: boolean
  hasNoDeflection: boolean
  hasFocusedImpact: boolean
  hasNoCollateral: boolean
  hasProperTiming: boolean
  hasNoMisalignment: boolean
  hasCleanStrike: boolean
  missCount: number
  collateralCount: number
}

export interface TemperMeasure {
  resilience: number
  grade: 'spring-steel' | 'tool-steel' | 'carbon-steel' | 'cast-iron' | 'wrought-iron' | 'clay'
  hasProperTemper: boolean
  hasResilience: boolean
  hasNoBrittleness: boolean
  hasNoSoftness: boolean
  hasProperHardness: boolean
  hasElasticRecovery: boolean
  hasNoFatigue: boolean
  hasProperGrain: boolean
  hasNoCracking: boolean
  hasToughness: boolean
  fatigueCount: number
  crackingCount: number
}

export interface EdgeMeasure {
  quality: number
  retention: 'diamond' | 'ceramic' | 'steel' | 'iron' | 'tin' | 'butter'
  hasLongEdge: boolean
  hasProperSharpness: boolean
  hasEdgeRetention: boolean
  hasNoDulling: boolean
  hasNoChipping: boolean
  hasNoRolling: boolean
  hasProperProfile: boolean
  hasMaintenanceFree: boolean
  hasNoCorrosion: boolean
  hasSelfHealing: boolean
  dullingCount: number
  corrosionCount: number
}

export interface TechniqueMeasure {
  craftsmanship: number
  method: 'pattern-welding' | 'folding' | 'laminating' | 'casting' | 'stamping' | 'unforged'
  hasHighCraftsmanship: boolean
  hasProperTechnique: boolean
  hasNoShortcuts: boolean
  hasProgressiveRefinement: boolean
  hasProperAnnealing: boolean
  hasNoRushing: boolean
  hasAttentionToDetail: boolean
  hasProperHeatTreatment: boolean
  hasNoSloppyWork: boolean
  hasMasterwork: boolean
  shortcutCount: number
  sloppyCount: number
}

export interface BladeMeasure {
  quality: number
  grade: 'legendary' | 'masterwork' | 'fine' | 'serviceable' | 'crude' | 'scrap'
  hasHighQuality: boolean
  hasProperBalance: boolean
  hasNoFlaws: boolean
  hasFunctional: boolean
  hasBeautiful: boolean
  hasNoDefects: boolean
  hasProperWeight: boolean
  hasNoWeakness: boolean
  hasTestedInBattle: boolean
  hasLegacy: boolean
  flawCount: number
  weaknessCount: number
}

export interface HammerBlow {
  file: string
  hammerWeight: number
  strikePrecision: number
  metalTemper: number
  edgeQuality: number
  forgingTechnique: number
  bladeQuality: number
  weight: WeightMeasure
  precision: PrecisionMeasure
  temper: TemperMeasure
  edge: EdgeMeasure
  technique: TechniqueMeasure
  blade: BladeMeasure
  condition: 'excalibur' | 'masterwork-blade' | 'fine-weapon' | 'serviceable-tool' | 'rusty-nail' | 'scrap-metal'
  qualityScore: number
}

export interface ForgeArmory {
  directory: string
  blows: HammerBlow[]
  avgImpact: number
  avgPrecision: number
  avgQuality: number
  excaliburCount: number
  scrapCount: number
  heavyImpactCount: number
  highPrecisionCount: number
  armoryType: 'royal-armory' | 'guild-armory' | 'village-forge' | 'field-forge' | 'scrap-yard' | 'ruins'
  condition: 'legendary-armory' | 'well-stocked' | 'functional' | 'basic' | 'depleted' | 'empty'
}

export interface ForgeHammerResult {
  blows: HammerBlow[]
  armories: ForgeArmory[]
  forge: {
    avgImpact: number
    avgPrecision: number
    avgQuality: number
    isLegendary: boolean
    overallQuality: number
  }
  stats: {
    totalFiles: number
    totalArmories: number
    avgHammerWeight: number
    avgStrikePrecision: number
    avgMetalTemper: number
    avgEdgeQuality: number
    avgForgingTechnique: number
    avgBladeQuality: number
    excaliburCount: number
    masterworkBladeCount: number
    fineWeaponCount: number
    serviceableToolCount: number
    rustyNailCount: number
    scrapMetalCount: number
    hasProperWeightCount: number
    hasHighPrecisionCount: number
    hasProperTemperCount: number
    hasLongEdgeCount: number
    hasHighCraftsmanshipCount: number
    hasHighQualityCount: number
    overallQuality: number
    smithGrade: 'legendary-smith' | 'master-smith' | 'journeyman' | 'apprentice' | 'novice' | 'vandal'
    bestBlow: string
    heaviest: string
    mostPrecise: string
    bestTemper: string
    sharpest: string
    finestCraft: string
  }
  recommendations: string[]
}

// ─── Weight Measurement ─────────────────────────────────────────────────────

/** @example measureWeight(content) returns weight analysis */
export function measureWeight(content: string): WeightMeasure {
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

  let impact = 25
  if (hasStructure) impact += 15
  if (hasTypes) impact += 15
  if (hasFunctions) impact += 10
  if (exportCount > 0) impact += 5
  if (importCount > 0) impact += 5
  if (jsdocCount > 0) impact += 8
  if (asyncCount > 0) impact += 4
  if (consoleCount === 0) impact += 4
  if (anyCount === 0) impact += 4
  if (todoCount === 0) impact += 5
  impact = Math.min(100, Math.max(0, Math.round(impact)))

  const overstrikeCount = anyCount + todoCount
  const mishitCount = deepNestedCount + commentedCodeCount

  const hasProperWeight = impact >= 75 && hasStructure && hasTypes
  const hasHeavyImpact = impact >= 80 && hasStructure && hasTypes
  const hasControlledForce = hasStructure && hasTypes && exportCount > 0
  const hasNoOverstriking = overstrikeCount === 0
  const hasNoUnderstriking = hasFunctions && consoleCount === 0
  const hasProperMomentum = hasStructure && hasTypes && hasFunctions
  const hasKineticTransfer = hasStructure && hasTypes && exportCount > 0
  const hasNoRebound = consoleCount === 0
  const hasProperSwing = hasStructure && hasTypes && hasFunctions
  const hasNoMishit = mishitCount === 0

  let hammerClass: WeightMeasure['class'] = 'feather'
  if (hasHeavyImpact && hasNoOverstriking && hasNoMishit && hasControlledForce) hammerClass = 'sledge'
  else if (hasHeavyImpact && hasNoOverstriking) hammerClass = 'engineer'
  else if (hasHeavyImpact) hammerClass = 'cross-peen'
  else if (hasProperWeight && hasControlledForce) hammerClass = 'ball-peen'
  else if (impact > 30) hammerClass = 'tack'

  return {
    impact, class: hammerClass, hasProperWeight, hasHeavyImpact, hasControlledForce,
    hasNoOverstriking, hasNoUnderstriking, hasProperMomentum, hasKineticTransfer,
    hasNoRebound, hasProperSwing, hasNoMishit, overstrikeCount, mishitCount,
  }
}

// ─── Precision Measurement ──────────────────────────────────────────────────

/** @example measurePrecision(content) returns precision analysis */
export function measurePrecision(content: string): PrecisionMeasure {
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

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let accuracy = 25
  if (hasStructure) accuracy += 12
  if (hasTypes) accuracy += 12
  if (hasFunctions) accuracy += 10
  if (jsdocCount > 0) accuracy += 8
  if (genericsCount > 0) accuracy += 5
  if (exportCount > 0) accuracy += 5
  if (importCount > 0) accuracy += 5
  if (tryCatchCount > 0) accuracy += 5
  if (asyncCount > 0) accuracy += 3
  if (consoleCount === 0) accuracy += 4
  if (anyCount === 0) accuracy += 3
  if (deepNestedCount === 0) accuracy += 3
  accuracy = Math.min(100, Math.max(0, Math.round(accuracy)))

  const missCount = anyCount + todoCount
  const collateralCount = deepNestedCount + consoleCount

  const hasHighPrecision = accuracy >= 80 && hasStructure && hasTypes
  const hasConsistentAccuracy = hasStructure && hasTypes && exportCount > 0
  const hasNoMisses = missCount === 0
  const hasProperAlignment = hasStructure && hasTypes && genericsCount > 0
  const hasNoDeflection = deepNestedCount === 0
  const hasFocusedImpact = hasStructure && hasTypes && hasFunctions
  const hasNoCollateral = collateralCount === 0
  const hasProperTiming = asyncCount > 0 || tryCatchCount > 0
  const hasNoMisalignment = hasStructure && hasTypes && exportCount > 0
  const hasCleanStrike = hasFunctions && consoleCount === 0

  let aim: PrecisionMeasure['aim'] = 'blind'
  if (hasHighPrecision && hasNoMisses && hasNoDeflection && hasProperAlignment) aim = 'bullseye'
  else if (hasHighPrecision && hasNoMisses) aim = 'on-target'
  else if (hasHighPrecision) aim = 'near-miss'
  else if (hasFocusedImpact && hasConsistentAccuracy) aim = 'glancing'
  else if (accuracy > 30) aim = 'wild'

  return {
    accuracy, aim, hasHighPrecision, hasConsistentAccuracy, hasNoMisses,
    hasProperAlignment, hasNoDeflection, hasFocusedImpact, hasNoCollateral,
    hasProperTiming, hasNoMisalignment, hasCleanStrike, missCount, collateralCount,
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

  let resilience = 20
  if (hasStructure) resilience += 12
  if (hasTypes) resilience += 12
  if (hasFunctions) resilience += 10
  if (jsdocCount > 0) resilience += 10
  if (genericsCount > 0) resilience += 5
  if (exportCount > 0) resilience += 5
  if (importCount > 0) resilience += 5
  if (asyncCount > 0) resilience += 3
  if (tryCatchCount > 0) resilience += 8
  if (anyCount === 0) resilience += 5
  if (consoleCount === 0) resilience += 5
  resilience = Math.min(100, Math.max(0, Math.round(resilience)))

  const fatigueCount = todoCount + deepNestedCount
  const crackingCount = anyCount + commentedCodeCount

  const hasProperTemper = resilience >= 75 && hasStructure && hasTypes
  const hasResilience = resilience >= 60 && hasStructure && hasTypes
  const hasNoBrittleness = anyCount === 0 && deepNestedCount === 0
  const hasNoSoftness = hasStructure && hasTypes && hasFunctions
  const hasProperHardness = hasStructure && hasTypes && genericsCount > 0
  const hasElasticRecovery = tryCatchCount > 0
  const hasNoFatigue = fatigueCount === 0
  const hasProperGrain = hasStructure && hasTypes && hasFunctions
  const hasNoCracking = crackingCount === 0
  const hasToughness = hasStructure && hasTypes && tryCatchCount > 0

  let grade: TemperMeasure['grade'] = 'clay'
  if (hasProperTemper && hasNoFatigue && hasNoCracking && hasElasticRecovery) grade = 'spring-steel'
  else if (hasProperTemper && hasNoFatigue) grade = 'tool-steel'
  else if (hasProperTemper) grade = 'carbon-steel'
  else if (hasResilience) grade = 'cast-iron'
  else if (resilience > 30) grade = 'wrought-iron'

  return {
    resilience, grade, hasProperTemper, hasResilience, hasNoBrittleness,
    hasNoSoftness, hasProperHardness, hasElasticRecovery, hasNoFatigue,
    hasProperGrain, hasNoCracking, hasToughness, fatigueCount, crackingCount,
  }
}

// ─── Edge Measurement ───────────────────────────────────────────────────────

/** @example measureEdge(content) returns edge analysis */
export function measureEdge(content: string): EdgeMeasure {
  const classCount = countClassKeywords(content)
  const interfaceCount = countInterfaceKeywords(content)
  const typeCount = countTypeKeywords(content)
  const functionCount = countFunctionKeywords(content)
  const arrowCount = countArrowFunctions(content)
  const jsdocCount = countJSDocBlocks(content)
  const genericsCount = countGenericsUsage(content)
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

  let quality = 20
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 10
  if (exportCount > 0) quality += 10
  if (importCount > 0) quality += 5
  if (anyCount === 0) quality += 5
  if (consoleCount === 0) quality += 4
  if (tryCatchCount > 0) quality += 4
  if (privateCount === 0 && protectedCount === 0) quality += 3
  if (commentedCodeCount === 0) quality += 5
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const dullingCount = privateCount + protectedCount
  const corrosionCount = anyCount + consoleCount

  const hasLongEdge = quality >= 75 && hasStructure && hasTypes
  const hasProperSharpness = hasStructure && hasTypes && genericsCount > 0
  const hasEdgeRetention = hasStructure && hasTypes && hasFunctions && jsdocCount > 0
  const hasNoDulling = dullingCount === 0
  const hasNoChipping = commentedCodeCount === 0
  const hasNoRolling = corrosionCount === 0
  const hasProperProfile = hasStructure && hasTypes && exportCount > 0
  const hasMaintenanceFree = dullingCount === 0 && corrosionCount === 0
  const hasNoCorrosion = anyCount === 0 && consoleCount === 0
  const hasSelfHealing = tryCatchCount > 0 && asyncCount > 0

  let retention: EdgeMeasure['retention'] = 'butter'
  if (hasLongEdge && hasNoDulling && hasNoCorrosion && hasEdgeRetention) retention = 'diamond'
  else if (hasLongEdge && hasNoDulling) retention = 'ceramic'
  else if (hasLongEdge) retention = 'steel'
  else if (hasProperProfile && hasEdgeRetention) retention = 'iron'
  else if (quality > 30) retention = 'tin'

  return {
    quality, retention, hasLongEdge, hasProperSharpness, hasEdgeRetention,
    hasNoDulling, hasNoChipping, hasNoRolling, hasProperProfile,
    hasMaintenanceFree, hasNoCorrosion, hasSelfHealing, dullingCount, corrosionCount,
  }
}

// ─── Technique Measurement ──────────────────────────────────────────────────

/** @example measureTechnique(content) returns technique analysis */
export function measureTechnique(content: string): TechniqueMeasure {
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

  let craftsmanship = 20
  if (hasStructure) craftsmanship += 12
  if (hasTypes) craftsmanship += 12
  if (hasFunctions) craftsmanship += 10
  if (jsdocCount > 0) craftsmanship += 10
  if (genericsCount > 0) craftsmanship += 5
  if (enumCount > 0) craftsmanship += 5
  if (anyCount === 0) craftsmanship += 8
  if (consoleCount === 0) craftsmanship += 5
  if (todoCount === 0) craftsmanship += 5
  if (deepNestedCount === 0) craftsmanship += 8
  craftsmanship = Math.min(100, Math.max(0, Math.round(craftsmanship)))

  const shortcutCount = todoCount + commentedCodeCount
  const sloppyCount = deepNestedCount + consoleCount

  const hasHighCraftsmanship = craftsmanship >= 80 && hasStructure && hasTypes && anyCount === 0
  const hasProperTechnique = hasStructure && hasTypes && hasFunctions
  const hasNoShortcuts = shortcutCount === 0
  const hasProgressiveRefinement = hasStructure && hasTypes && genericsCount > 0
  const hasProperAnnealing = hasFunctions && exportCount > 0
  const hasNoRushing = todoCount === 0
  const hasAttentionToDetail = jsdocCount > 0 && genericsCount > 0
  const hasProperHeatTreatment = hasStructure && hasTypes && tryCatchCount > 0
  const hasNoSloppyWork = sloppyCount === 0
  const hasMasterwork = hasHighCraftsmanship && hasNoShortcuts && hasNoSloppyWork

  let method: TechniqueMeasure['method'] = 'unforged'
  if (hasMasterwork) method = 'pattern-welding'
  else if (hasHighCraftsmanship && hasNoShortcuts) method = 'folding'
  else if (hasHighCraftsmanship) method = 'laminating'
  else if (hasProperTechnique && hasProgressiveRefinement) method = 'casting'
  else if (craftsmanship > 30) method = 'stamping'

  return {
    craftsmanship, method, hasHighCraftsmanship, hasProperTechnique, hasNoShortcuts,
    hasProgressiveRefinement, hasProperAnnealing, hasNoRushing, hasAttentionToDetail,
    hasProperHeatTreatment, hasNoSloppyWork, hasMasterwork, shortcutCount, sloppyCount,
  }
}

// ─── Blade Measurement ──────────────────────────────────────────────────────

/** @example measureBlade(content) returns blade analysis */
export function measureBlade(content: string): BladeMeasure {
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

  let quality = 25
  if (hasStructure) quality += 12
  if (hasTypes) quality += 12
  if (hasFunctions) quality += 10
  if (jsdocCount > 0) quality += 8
  if (genericsCount > 0) quality += 5
  if (exportCount > 0) quality += 5
  if (importCount > 0) quality += 5
  if (reExportCount > 0) quality += 5
  if (asyncCount > 0) quality += 3
  if (tryCatchCount > 0) quality += 5
  if (anyCount === 0) quality += 3
  if (consoleCount === 0) quality += 2
  quality = Math.min(100, Math.max(0, Math.round(quality)))

  const flawCount = anyCount + todoCount
  const weaknessCount = deepNestedCount + consoleCount

  const hasHighQuality = quality >= 80 && hasStructure && hasTypes
  const hasProperBalance = hasStructure && hasTypes && hasFunctions
  const hasNoFlaws = flawCount === 0
  const hasFunctional = hasFunctions && exportCount > 0
  const hasBeautiful = jsdocCount > 0 && genericsCount > 0
  const hasNoDefects = flawCount === 0 && weaknessCount === 0
  const hasProperWeight = hasStructure && hasTypes && genericsCount > 0
  const hasNoWeakness = weaknessCount === 0
  const hasTestedInBattle = tryCatchCount > 0
  const hasLegacy = hasStructure && hasTypes && reExportCount > 0

  let grade: BladeMeasure['grade'] = 'scrap'
  if (hasHighQuality && hasNoFlaws && hasNoWeakness && hasBeautiful) grade = 'legendary'
  else if (hasHighQuality && hasNoFlaws) grade = 'masterwork'
  else if (hasHighQuality) grade = 'fine'
  else if (hasProperBalance && hasFunctional) grade = 'serviceable'
  else if (quality > 30) grade = 'crude'

  return {
    quality, grade, hasHighQuality, hasProperBalance, hasNoFlaws, hasFunctional,
    hasBeautiful, hasNoDefects, hasProperWeight, hasNoWeakness, hasTestedInBattle,
    hasLegacy, flawCount, weaknessCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(blow) returns condition string */
export function classifyCondition(blow: HammerBlow): HammerBlow['condition'] {
  const { qualityScore } = blow
  if (qualityScore >= 80) return 'excalibur'
  if (qualityScore >= 65) return 'masterwork-blade'
  if (qualityScore >= 50) return 'fine-weapon'
  if (qualityScore >= 35) return 'serviceable-tool'
  if (qualityScore >= 20) return 'rusty-nail'
  return 'scrap-metal'
}

// ─── Blow Analysis ──────────────────────────────────────────────────────────

/** @example analyzeHammerBlow(content, filePath) returns full blow */
export function analyzeHammerBlow(content: string, filePath: string): HammerBlow {
  const weight = measureWeight(content)
  const precision = measurePrecision(content)
  const temper = measureTemper(content)
  const edge = measureEdge(content)
  const technique = measureTechnique(content)
  const blade = measureBlade(content)

  const hammerWeight = weight.impact
  const strikePrecision = precision.accuracy
  const metalTemper = temper.resilience
  const edgeQuality = edge.quality
  const forgingTechnique = technique.craftsmanship
  const bladeQuality = blade.quality

  const qualityScore = Math.round(
    hammerWeight * 0.15 +
    strikePrecision * 0.15 +
    metalTemper * 0.15 +
    edgeQuality * 0.2 +
    forgingTechnique * 0.15 +
    bladeQuality * 0.2,
  )

  const blow: HammerBlow = {
    file: filePath,
    hammerWeight, strikePrecision, metalTemper, edgeQuality,
    forgingTechnique, bladeQuality,
    weight, precision, temper, edge, technique, blade,
    condition: 'scrap-metal',
    qualityScore,
  }

  blow.condition = classifyCondition(blow)

  return blow
}

// ─── Armory Analysis ────────────────────────────────────────────────────────

/** @example analyzeForgeArmory(blows, dirPath) returns armory */
export function analyzeForgeArmory(blows: HammerBlow[], dirPath: string): ForgeArmory {
  if (blows.length === 0) {
    return {
      directory: dirPath, blows: [], avgImpact: 0, avgPrecision: 0, avgQuality: 0,
      excaliburCount: 0, scrapCount: 0, heavyImpactCount: 0, highPrecisionCount: 0,
      armoryType: 'ruins', condition: 'empty',
    }
  }

  const avgImpact = Math.round(blows.reduce((s, b) => s + b.hammerWeight, 0) / blows.length)
  const avgPrecision = Math.round(blows.reduce((s, b) => s + b.strikePrecision, 0) / blows.length)
  const avgQuality = Math.round(blows.reduce((s, b) => s + b.bladeQuality, 0) / blows.length)

  const excaliburCount = blows.filter((b) => b.condition === 'excalibur').length
  const scrapCount = blows.filter((b) => b.condition === 'scrap-metal').length
  const heavyImpactCount = blows.filter((b) => b.weight.hasHeavyImpact).length
  const highPrecisionCount = blows.filter((b) => b.precision.hasHighPrecision).length

  const armoryType = classifyArmoryType(blows)
  const avgScore = blows.reduce((s, b) => s + b.qualityScore, 0) / blows.length
  const condition = classifyArmoryCondition(avgScore)

  return {
    directory: dirPath, blows, avgImpact, avgPrecision, avgQuality,
    excaliburCount, scrapCount, heavyImpactCount, highPrecisionCount,
    armoryType, condition,
  }
}

// ─── Armory Classification ──────────────────────────────────────────────────

/** @example classifyArmoryType(blows) returns armory type */
export function classifyArmoryType(blows: HammerBlow[]): ForgeArmory['armoryType'] {
  if (blows.length === 0) return 'ruins'
  const avgScore = blows.reduce((s, b) => s + b.qualityScore, 0) / blows.length
  const excalCnt = blows.filter((b) => b.condition === 'excalibur').length
  if (avgScore >= 75 && excalCnt >= Math.ceil(blows.length * 0.3)) return 'royal-armory'
  if (avgScore >= 60) return 'guild-armory'
  if (avgScore >= 45) return 'village-forge'
  if (avgScore >= 30) return 'field-forge'
  if (avgScore >= 15) return 'scrap-yard'
  return 'ruins'
}

/** @example classifyArmoryCondition(avgScore) returns condition */
export function classifyArmoryCondition(avgScore: number): ForgeArmory['condition'] {
  if (avgScore >= 80) return 'legendary-armory'
  if (avgScore >= 65) return 'well-stocked'
  if (avgScore >= 50) return 'functional'
  if (avgScore >= 35) return 'basic'
  if (avgScore >= 20) return 'depleted'
  return 'empty'
}

/** @example classifySmithGrade(avgQuality) returns grade */
export function classifySmithGrade(avgQuality: number): ForgeHammerResult['stats']['smithGrade'] {
  if (avgQuality >= 80) return 'legendary-smith'
  if (avgQuality >= 65) return 'master-smith'
  if (avgQuality >= 50) return 'journeyman'
  if (avgQuality >= 35) return 'apprentice'
  if (avgQuality >= 20) return 'novice'
  return 'vandal'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(blows, armories, forge, stats) returns recommendations */
export function generateRecommendations(
  blows: HammerBlow[],
  armories: ForgeArmory[],
  forge: ForgeHammerResult['forge'],
  stats: ForgeHammerResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgHammerWeight < 50) recs.push('Increase hammer weight — add more impactful code structures')
  if (stats.avgStrikePrecision < 50) recs.push('Improve strike precision — enhance code accuracy with types')
  if (stats.avgMetalTemper < 50) recs.push('Improve temper — strengthen code resilience and error handling')
  if (stats.avgEdgeQuality < 50) recs.push('Sharpen the edge — improve code longevity and maintainability')
  if (stats.avgForgingTechnique < 50) recs.push('Refine technique — elevate code craftsmanship and reduce shortcuts')
  if (stats.avgBladeQuality < 50) recs.push('Improve blade quality — reduce defects and strengthen code quality')
  if (stats.scrapMetalCount > blows.length * 0.5) recs.push('Too much scrap — over half the codebase is poor quality')
  if (stats.hasHighQualityCount === 0) recs.push('No high-quality blades found — practice fundamental forging')
  if (armories.length > 0 && forge.overallQuality < 60) recs.push('Overall quality is low — systematic forging improvement recommended')
  if (recs.length === 0) recs.push('Legendary forge — your code is forged with the skill of a master smith')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildForgeHammerResult(files, contents, options) returns full result */
export function buildForgeHammerResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): ForgeHammerResult {
  const blows: HammerBlow[] = files.map((file, i) =>
    analyzeHammerBlow(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, HammerBlow[]>()
  for (const blow of blows) {
    const dir = blow.file.includes('/')
      ? blow.file.substring(0, blow.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(blow)
    } else {
      dirMap.set(dir, [blow])
    }
  }

  const armories: ForgeArmory[] = Array.from(dirMap.entries()).map(([dir, dirBlows]) =>
    analyzeForgeArmory(dirBlows, dir),
  )

  const avgImpact = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.hammerWeight, 0) / blows.length)
    : 0
  const avgPrecision = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.strikePrecision, 0) / blows.length)
    : 0
  const avgQuality = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.bladeQuality, 0) / blows.length)
    : 0
  const overallQuality = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.qualityScore, 0) / blows.length)
    : 0
  const isLegendary = overallQuality >= 65

  const forge: ForgeHammerResult['forge'] = {
    avgImpact, avgPrecision, avgQuality, isLegendary, overallQuality,
  }

  const avgHammerWeight = avgImpact
  const avgStrikePrecision = avgPrecision
  const avgMetalTemper = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.metalTemper, 0) / blows.length)
    : 0
  const avgEdgeQuality = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.edgeQuality, 0) / blows.length)
    : 0
  const avgForgingTechnique = blows.length > 0
    ? Math.round(blows.reduce((s, b) => s + b.forgingTechnique, 0) / blows.length)
    : 0
  const avgBladeQuality = avgQuality

  const conditionCounts = {
    excalibur: 0, masterworkBlade: 0, fineWeapon: 0,
    serviceableTool: 0, rustyNail: 0, scrapMetal: 0,
  }
  for (const b of blows) {
    switch (b.condition) {
      case 'excalibur': conditionCounts.excalibur++; break
      case 'masterwork-blade': conditionCounts.masterworkBlade++; break
      case 'fine-weapon': conditionCounts.fineWeapon++; break
      case 'serviceable-tool': conditionCounts.serviceableTool++; break
      case 'rusty-nail': conditionCounts.rustyNail++; break
      case 'scrap-metal': conditionCounts.scrapMetal++; break
    }
  }

  const hasProperWeightCount = blows.filter((b) => b.weight.hasProperWeight).length
  const hasHighPrecisionCount = blows.filter((b) => b.precision.hasHighPrecision).length
  const hasProperTemperCount = blows.filter((b) => b.temper.hasProperTemper).length
  const hasLongEdgeCount = blows.filter((b) => b.edge.hasLongEdge).length
  const hasHighCraftsmanshipCount = blows.filter((b) => b.technique.hasHighCraftsmanship).length
  const hasHighQualityCount = blows.filter((b) => b.blade.hasHighQuality).length

  const bestBlow = blows.length > 0
    ? blows.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const heaviest = blows.length > 0
    ? blows.reduce((best, b) => b.hammerWeight > best.hammerWeight ? b : best).file
    : ''
  const mostPrecise = blows.length > 0
    ? blows.reduce((best, b) => b.strikePrecision > best.strikePrecision ? b : best).file
    : ''
  const bestTemper = blows.length > 0
    ? blows.reduce((best, b) => b.metalTemper > best.metalTemper ? b : best).file
    : ''
  const sharpest = blows.length > 0
    ? blows.reduce((best, b) => b.edgeQuality > best.edgeQuality ? b : best).file
    : ''
  const finestCraft = blows.length > 0
    ? blows.reduce((best, b) => b.forgingTechnique > best.forgingTechnique ? b : best).file
    : ''

  const smithGrade = classifySmithGrade(overallQuality)

  const stats: ForgeHammerResult['stats'] = {
    totalFiles: files.length, totalArmories: armories.length,
    avgHammerWeight, avgStrikePrecision, avgMetalTemper,
    avgEdgeQuality, avgForgingTechnique, avgBladeQuality,
    excaliburCount: conditionCounts.excalibur,
    masterworkBladeCount: conditionCounts.masterworkBlade,
    fineWeaponCount: conditionCounts.fineWeapon,
    serviceableToolCount: conditionCounts.serviceableTool,
    rustyNailCount: conditionCounts.rustyNail,
    scrapMetalCount: conditionCounts.scrapMetal,
    hasProperWeightCount, hasHighPrecisionCount, hasProperTemperCount,
    hasLongEdgeCount, hasHighCraftsmanshipCount, hasHighQualityCount,
    overallQuality, smithGrade,
    bestBlow, heaviest, mostPrecise, bestTemper, sharpest, finestCraft,
  }

  const recommendations = generateRecommendations(blows, armories, forge, stats)

  return { blows, armories, forge, stats, recommendations }
}
