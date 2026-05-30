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
function countEnumKeywords(content: string): number { return countMatches(content, ENUM_REGEX) }
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

export interface ShieldMeasure {
  strength: number
  material: 'iron' | 'bronze' | 'oak' | 'leather' | 'wicker' | 'paper'
  hasHighStrength: boolean
  hasProperThickness: boolean
  hasNoWeakPoints: boolean
  hasProperBoss: boolean
  hasReinforcedEdge: boolean
  hasNoCracks: boolean
  hasProperWeight: boolean
  hasNoRusting: boolean
  hasImpactResistance: boolean
  hasNoDenting: boolean
  crackCount: number
  rustingCount: number
}

export interface OverlapMeasure {
  coverage: number
  quality: 'full-overlap' | 'proper-overlap' | 'minimal-overlap' | 'gap' | 'wide-gap' | 'no-coverage'
  hasProperOverlap: boolean
  hasNoGaps: boolean
  hasInterlocking: boolean
  hasProperSealing: boolean
  hasNoBlindSpots: boolean
  hasLayered: boolean
  hasNoPenetration: boolean
  hasProperEdge: boolean
  hasNoUnderlap: boolean
  hasComplete: boolean
  gapCount: number
  penetrationCount: number
}

export interface FormationMeasure {
  integrity: number
  type: 'testudo' | 'phalanx' | 'shield-wall' | 'shield-burh' | 'skirmish' | 'rout'
  hasHighIntegrity: boolean
  hasProperAlignment: boolean
  hasNoBreakInLine: boolean
  hasProperSpacing: boolean
  hasDiscipline: boolean
  hasNoRogueElements: boolean
  hasProperDepth: boolean
  hasNoFlanks: boolean
  hasUnified: boolean
  hasNoFragmentation: boolean
  breakCount: number
  flankCount: number
}

export interface CoordinationMeasure {
  level: number
  style: 'synchronized' | 'coordinated' | 'responsive' | 'delayed' | 'confused' | 'chaotic'
  hasHighCoordination: boolean
  hasProperTiming: boolean
  hasSignalResponse: boolean
  hasNoMiscommunication: boolean
  hasProperHandoff: boolean
  hasNoCollision: boolean
  hasSeamlessIntegration: boolean
  hasNoInterference: boolean
  hasProperProtocol: boolean
  hasNoDeadlock: boolean
  collisionCount: number
  deadlockCount: number
}

export interface ReadinessMeasure {
  level: number
  state: 'battle-ready' | 'well-prepared' | 'prepared' | 'under-prepared' | 'unprepared' | 'defenseless'
  hasHighReadiness: boolean
  hasProperArmor: boolean
  hasNoExposedFlanks: boolean
  hasProperTraining: boolean
  hasNoRust: boolean
  hasQuickResponse: boolean
  hasNoSurprise: boolean
  hasProperEquipment: boolean
  hasNoFatigue: boolean
  hasReserves: boolean
  exposedCount: number
  fatigueCount: number
}

export interface ResilienceMeasure {
  score: number
  grade: 'spartan' | 'legionary' | 'housecarl' | 'militia' | 'conscript' | 'fleeing'
  hasHighResilience: boolean
  hasEndurance: boolean
  hasNoBreaking: boolean
  hasRecovery: boolean
  hasNoSurrender: boolean
  hasMoralStrength: boolean
  hasNoDesertion: boolean
  hasFightingSpirit: boolean
  hasNoFatigue: boolean
  hasLastStand: boolean
  breakingCount: number
  desertionCount: number
}

export interface ShieldBearer {
  file: string
  shieldStrength: number
  overlapCoverage: number
  formationIntegrity: number
  spearCoordination: number
  battleReadiness: number
  wallResilience: number
  shield: ShieldMeasure
  overlap: OverlapMeasure
  formation: FormationMeasure
  coordination: CoordinationMeasure
  readiness: ReadinessMeasure
  resilience: ResilienceMeasure
  condition: 'spartan-hoplon' | 'roman-scutum' | 'viking-round' | 'kite-shield' | 'buckler' | 'broken-board'
  qualityScore: number
}

export interface WallSegment {
  directory: string
  bearers: ShieldBearer[]
  avgStrength: number
  avgCoverage: number
  avgReadiness: number
  spartanCount: number
  brokenCount: number
  strongCount: number
  readyCount: number
  segmentType: 'phalanx' | 'shield-wall' | 'shield-burh' | 'shield-ring' | 'skirmish-line' | 'broken-ranks'
  condition: 'spartan-phalanx' | 'roman-legion' | 'viking-shieldwall' | 'medieval-battle' | 'peasant-militia' | 'routed-army'
}

export interface ShieldWallResult {
  bearers: ShieldBearer[]
  segments: WallSegment[]
  army: {
    avgStrength: number
    avgCoverage: number
    avgReadiness: number
    isImpenetrable: boolean
    overallDefense: number
  }
  stats: {
    totalFiles: number
    totalSegments: number
    avgShieldStrength: number
    avgOverlapCoverage: number
    avgFormationIntegrity: number
    avgSpearCoordination: number
    avgBattleReadiness: number
    avgWallResilience: number
    spartanHoplonCount: number
    romanScutumCount: number
    vikingRoundCount: number
    kiteShieldCount: number
    bucklerCount: number
    brokenBoardCount: number
    hasHighStrengthCount: number
    hasProperOverlapCount: number
    hasHighIntegrityCount: number
    hasHighCoordinationCount: number
    hasHighReadinessCount: number
    hasHighResilienceCount: number
    overallDefense: number
    commanderGrade: 'strategos' | 'centurion' | 'shield-maiden' | 'knight' | 'militia-captain' | 'coward'
    bestBearer: string
    strongest: string
    bestCovered: string
    bestFormation: string
    mostCoordinated: string
    mostReady: string
  }
  recommendations: string[]
}

// ─── Shield Measurement ─────────────────────────────────────────────────────

/** @example measureShield(content) returns shield analysis */
export function measureShield(content: string): ShieldMeasure {
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

  let strength = 20
  if (hasStructure) strength += 12
  if (hasTypes) strength += 12
  if (hasFunctions) strength += 10
  if (jsdocCount > 0) strength += 10
  if (exportCount > 0) strength += 8
  if (importCount > 0) strength += 5
  if (genericsCount > 0) strength += 5
  if (anyCount === 0) strength += 5
  if (consoleCount === 0) strength += 5
  if (deepNestedCount === 0) strength += 5
  if (privateCount === 0) strength += 3
  strength = Math.min(100, Math.max(0, Math.round(strength)))

  const crackCount = consoleCount + anyCount
  const rustingCount = deepNestedCount + privateCount

  const hasHighStrength = strength >= 75 && hasStructure && hasTypes
  const hasProperThickness = hasStructure && hasTypes && hasFunctions
  const hasNoWeakPoints = crackCount === 0
  const hasProperBoss = hasFunctions && exportCount > 0
  const hasReinforcedEdge = hasStructure && hasTypes && genericsCount > 0
  const hasNoCracks = crackCount === 0
  const hasProperWeight = exportCount > 0 && importCount > 0
  const hasNoRusting = rustingCount === 0
  const hasImpactResistance = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoDenting = consoleCount === 0 && deepNestedCount === 0

  let material: ShieldMeasure['material'] = 'paper'
  if (hasHighStrength && hasNoWeakPoints && hasNoRusting && hasReinforcedEdge) material = 'iron'
  else if (hasHighStrength && hasNoWeakPoints) material = 'bronze'
  else if (hasHighStrength) material = 'oak'
  else if (hasProperThickness && hasProperBoss) material = 'leather'
  else if (strength > 30) material = 'wicker'

  return {
    strength, material, hasHighStrength, hasProperThickness,
    hasNoWeakPoints, hasProperBoss, hasReinforcedEdge, hasNoCracks,
    hasProperWeight, hasNoRusting, hasImpactResistance, hasNoDenting,
    crackCount, rustingCount,
  }
}

// ─── Overlap Measurement ────────────────────────────────────────────────────

/** @example measureOverlap(content) returns overlap analysis */
export function measureOverlap(content: string): OverlapMeasure {
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
  const tryCatchCount = countTryCatch(content)
  const asyncCount = countAsyncKeywords(content)
  const deepNestedCount = countDeepNested(content)

  const hasStructure = classCount > 0
  const hasTypes = interfaceCount > 0 || typeCount > 0
  const hasFunctions = functionCount > 0 || arrowCount > 0

  let coverage = 20
  if (hasStructure) coverage += 12
  if (hasTypes) coverage += 12
  if (hasFunctions) coverage += 10
  if (tryCatchCount > 0) coverage += 10
  if (jsdocCount > 0) coverage += 8
  if (exportCount > 0) coverage += 8
  if (asyncCount > 0) coverage += 5
  if (genericsCount > 0) coverage += 5
  if (anyCount === 0) coverage += 5
  if (consoleCount === 0) coverage += 5
  coverage = Math.min(100, Math.max(0, Math.round(coverage)))

  const gapCount = consoleCount + anyCount
  const penetrationCount = deepNestedCount

  const hasProperOverlap = coverage >= 75 && hasStructure && hasTypes
  const hasNoGaps = gapCount === 0
  const hasInterlocking = hasStructure && hasTypes && genericsCount > 0
  const hasProperSealing = tryCatchCount > 0 && asyncCount > 0
  const hasNoBlindSpots = anyCount === 0 && consoleCount === 0
  const hasLayered = hasStructure && hasTypes && tryCatchCount > 0
  const hasNoPenetration = penetrationCount === 0
  const hasProperEdge = hasFunctions && jsdocCount > 0
  const hasNoUnderlap = importCount > 0 && exportCount > 0
  const hasComplete = hasProperOverlap && hasNoGaps && hasNoPenetration

  let quality: OverlapMeasure['quality'] = 'no-coverage'
  if (hasComplete && hasInterlocking) quality = 'full-overlap'
  else if (hasProperOverlap && hasNoGaps) quality = 'proper-overlap'
  else if (hasProperOverlap) quality = 'minimal-overlap'
  else if (hasProperSealing && hasProperEdge) quality = 'gap'
  else if (coverage > 30) quality = 'wide-gap'

  return {
    coverage, quality, hasProperOverlap, hasNoGaps, hasInterlocking,
    hasProperSealing, hasNoBlindSpots, hasLayered, hasNoPenetration,
    hasProperEdge, hasNoUnderlap, hasComplete, gapCount, penetrationCount,
  }
}

// ─── Formation Measurement ──────────────────────────────────────────────────

/** @example measureFormation(content) returns formation analysis */
export function measureFormation(content: string): FormationMeasure {
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

  let integrity = 20
  if (hasStructure) integrity += 10
  if (hasTypes) integrity += 10
  if (hasFunctions) integrity += 10
  if (jsdocCount > 0) integrity += 8
  if (enumCount > 0) integrity += 5
  if (genericsCount > 0) integrity += 5
  if (exportCount > 0) integrity += 8
  if (importCount > 0) integrity += 5
  if (anyCount === 0) integrity += 5
  if (consoleCount === 0) integrity += 5
  if (deepNestedCount === 0) integrity += 5
  if (commentedCodeCount === 0) integrity += 4
  integrity = Math.min(100, Math.max(0, Math.round(integrity)))

  const breakCount = consoleCount + anyCount
  const flankCount = deepNestedCount + commentedCodeCount

  const hasHighIntegrity = integrity >= 75 && hasStructure && hasTypes
  const hasProperAlignment = hasStructure && hasTypes && hasFunctions
  const hasNoBreakInLine = breakCount === 0
  const hasProperSpacing = exportCount > 0 && importCount > 0
  const hasDiscipline = hasStructure && hasTypes && jsdocCount > 0
  const hasNoRogueElements = flankCount === 0
  const hasProperDepth = hasStructure && hasTypes && genericsCount > 0
  const hasNoFlanks = deepNestedCount === 0 && consoleCount === 0
  const hasUnified = hasFunctions && exportCount > 0
  const hasNoFragmentation = enumCount_safe(content) > 0 || reExportCount_safe(content) > 0

  let formationType: FormationMeasure['type'] = 'rout'
  if (hasHighIntegrity && hasNoBreakInLine && hasNoRogueElements && hasProperDepth) formationType = 'testudo'
  else if (hasHighIntegrity && hasNoBreakInLine) formationType = 'phalanx'
  else if (hasHighIntegrity) formationType = 'shield-wall'
  else if (hasProperAlignment && hasUnified) formationType = 'shield-burh'
  else if (integrity > 30) formationType = 'skirmish'

  return {
    integrity, type: formationType, hasHighIntegrity, hasProperAlignment,
    hasNoBreakInLine, hasProperSpacing, hasDiscipline, hasNoRogueElements,
    hasProperDepth, hasNoFlanks, hasUnified, hasNoFragmentation,
    breakCount, flankCount,
  }
}

// ─── Coordination Measurement ───────────────────────────────────────────────

/** @example measureCoordination(content) returns coordination analysis */
export function measureCoordination(content: string): CoordinationMeasure {
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

  const collisionCount = todoCount + anyCount
  const deadlockCount = deepNestedCount

  const hasHighCoordination = level >= 75 && hasStructure && hasTypes
  const hasProperTiming = asyncCount > 0 && tryCatchCount > 0
  const hasSignalResponse = hasStructure && hasTypes && genericsCount > 0
  const hasNoMiscommunication = collisionCount === 0
  const hasProperHandoff = hasFunctions && exportCount > 0
  const hasNoCollision = collisionCount === 0
  const hasSeamlessIntegration = hasStructure && hasTypes && jsdocCount > 0
  const hasNoInterference = consoleCount === 0
  const hasProperProtocol = importCount > 0 && exportCount > 0
  const hasNoDeadlock = deadlockCount === 0

  let style: CoordinationMeasure['style'] = 'chaotic'
  if (hasHighCoordination && hasNoMiscommunication && hasNoDeadlock && hasProperTiming) style = 'synchronized'
  else if (hasHighCoordination && hasNoMiscommunication) style = 'coordinated'
  else if (hasHighCoordination) style = 'responsive'
  else if (hasProperHandoff && hasProperTiming) style = 'delayed'
  else if (level > 30) style = 'confused'

  return {
    level, style, hasHighCoordination, hasProperTiming, hasSignalResponse,
    hasNoMiscommunication, hasProperHandoff, hasNoCollision, hasSeamlessIntegration,
    hasNoInterference, hasProperProtocol, hasNoDeadlock, collisionCount, deadlockCount,
  }
}

// ─── Readiness Measurement ──────────────────────────────────────────────────

/** @example measureReadiness(content) returns readiness analysis */
export function measureReadiness(content: string): ReadinessMeasure {
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
  if (hasStructure) level += 10
  if (hasTypes) level += 10
  if (hasFunctions) level += 10
  if (jsdocCount > 0) level += 8
  if (exportCount > 0) level += 8
  if (genericsCount > 0) level += 5
  if (importCount > 0) level += 5
  if (anyCount === 0) level += 5
  if (consoleCount === 0) level += 5
  if (deepNestedCount === 0) level += 5
  if (commentedCodeCount === 0) level += 4
  if (todoCount === 0) level += 5
  level = Math.min(100, Math.max(0, Math.round(level)))

  const exposedCount = consoleCount + anyCount
  const fatigueCount = todoCount + commentedCodeCount

  const hasHighReadiness = level >= 75 && hasStructure && hasTypes
  const hasProperArmor = hasStructure && hasTypes && genericsCount > 0
  const hasNoExposedFlanks = exposedCount === 0
  const hasProperTraining = hasFunctions && jsdocCount > 0
  const hasNoRust = todoCount === 0
  const hasQuickResponse = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoSurprise = anyCount === 0 && consoleCount === 0
  const hasProperEquipment = importCount > 0 && exportCount > 0
  const hasNoFatigue = fatigueCount === 0
  const hasReserves = reExportCount_safe(content) > 0 || enumCount_safe(content) > 0

  let state: ReadinessMeasure['state'] = 'defenseless'
  if (hasHighReadiness && hasNoExposedFlanks && hasNoFatigue && hasProperArmor) state = 'battle-ready'
  else if (hasHighReadiness && hasNoExposedFlanks) state = 'well-prepared'
  else if (hasHighReadiness) state = 'prepared'
  else if (hasProperTraining && hasProperEquipment) state = 'under-prepared'
  else if (level > 30) state = 'unprepared'

  return {
    level, state, hasHighReadiness, hasProperArmor, hasNoExposedFlanks,
    hasProperTraining, hasNoRust, hasQuickResponse, hasNoSurprise,
    hasProperEquipment, hasNoFatigue, hasReserves, exposedCount, fatigueCount,
  }
}

// ─── Resilience Measurement ─────────────────────────────────────────────────

/** @example measureResilience(content) returns resilience analysis */
export function measureResilience(content: string): ResilienceMeasure {
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

  const breakingCount = anyCount + todoCount
  const desertionCount = deepNestedCount

  const hasHighResilience = score >= 75 && hasStructure && hasTypes
  const hasEndurance = hasStructure && hasTypes && hasFunctions
  const hasNoBreaking = breakingCount === 0
  const hasRecovery = countTryCatch(content) > 0 && countAsyncKeywords(content) > 0
  const hasNoSurrender = anyCount === 0 && consoleCount === 0
  const hasMoralStrength = hasStructure && hasTypes && jsdocCount > 0
  const hasNoDesertion = desertionCount === 0
  const hasFightingSpirit = hasFunctions && genericsCount > 0
  const hasNoFatigue = deepNestedCount === 0 && consoleCount === 0
  const hasLastStand = reExportCount_safe(content) > 0 || enumCount_safe(content) > 0

  let grade: ResilienceMeasure['grade'] = 'fleeing'
  if (hasHighResilience && hasNoBreaking && hasNoDesertion && hasRecovery) grade = 'spartan'
  else if (hasHighResilience && hasNoBreaking) grade = 'legionary'
  else if (hasHighResilience) grade = 'housecarl'
  else if (hasEndurance && hasMoralStrength) grade = 'militia'
  else if (score > 30) grade = 'conscript'

  return {
    score, grade, hasHighResilience, hasEndurance, hasNoBreaking,
    hasRecovery, hasNoSurrender, hasMoralStrength, hasNoDesertion,
    hasFightingSpirit, hasNoFatigue, hasLastStand, breakingCount, desertionCount,
  }
}

// ─── Condition Classification ───────────────────────────────────────────────

/** @example classifyCondition(bearer) returns condition string */
export function classifyCondition(bearer: ShieldBearer): ShieldBearer['condition'] {
  const { qualityScore } = bearer
  if (qualityScore >= 80) return 'spartan-hoplon'
  if (qualityScore >= 65) return 'roman-scutum'
  if (qualityScore >= 50) return 'viking-round'
  if (qualityScore >= 35) return 'kite-shield'
  if (qualityScore >= 20) return 'buckler'
  return 'broken-board'
}

// ─── Bearer Analysis ────────────────────────────────────────────────────────

/** @example analyzeShieldBearer(content, filePath) returns full bearer */
export function analyzeShieldBearer(content: string, filePath: string): ShieldBearer {
  const shield = measureShield(content)
  const overlap = measureOverlap(content)
  const formation = measureFormation(content)
  const coordination = measureCoordination(content)
  const readiness = measureReadiness(content)
  const resilience = measureResilience(content)

  const shieldStrength = shield.strength
  const overlapCoverage = overlap.coverage
  const formationIntegrity = formation.integrity
  const spearCoordination = coordination.level
  const battleReadiness = readiness.level
  const wallResilience = resilience.score

  const qualityScore = Math.round(
    shieldStrength * 0.15 +
    overlapCoverage * 0.15 +
    formationIntegrity * 0.15 +
    spearCoordination * 0.2 +
    battleReadiness * 0.15 +
    wallResilience * 0.2,
  )

  const result: ShieldBearer = {
    file: filePath,
    shieldStrength, overlapCoverage, formationIntegrity, spearCoordination,
    battleReadiness, wallResilience,
    shield, overlap, formation, coordination, readiness, resilience,
    condition: 'broken-board',
    qualityScore,
  }

  result.condition = classifyCondition(result)

  return result
}

// ─── Segment Analysis ───────────────────────────────────────────────────────

/** @example analyzeWallSegment(bearers, dirPath) returns segment */
export function analyzeWallSegment(bearers: ShieldBearer[], dirPath: string): WallSegment {
  if (bearers.length === 0) {
    return {
      directory: dirPath, bearers: [], avgStrength: 0, avgCoverage: 0, avgReadiness: 0,
      spartanCount: 0, brokenCount: 0, strongCount: 0, readyCount: 0,
      segmentType: 'broken-ranks', condition: 'routed-army',
    }
  }

  const avgStrength = Math.round(bearers.reduce((s, b) => s + b.shieldStrength, 0) / bearers.length)
  const avgCoverage = Math.round(bearers.reduce((s, b) => s + b.overlapCoverage, 0) / bearers.length)
  const avgReadiness = Math.round(bearers.reduce((s, b) => s + b.battleReadiness, 0) / bearers.length)

  const spartanCount = bearers.filter((b) => b.condition === 'spartan-hoplon').length
  const brokenCount = bearers.filter((b) => b.condition === 'broken-board').length
  const strongCount = bearers.filter((b) => b.shield.hasHighStrength).length
  const readyCount = bearers.filter((b) => b.readiness.hasHighReadiness).length

  const segmentType = classifySegmentType(bearers)
  const avgScore = bearers.reduce((s, b) => s + b.qualityScore, 0) / bearers.length
  const condition = classifySegmentCondition(avgScore)

  return {
    directory: dirPath, bearers, avgStrength, avgCoverage, avgReadiness,
    spartanCount, brokenCount, strongCount, readyCount, segmentType, condition,
  }
}

// ─── Segment Classification ─────────────────────────────────────────────────

/** @example classifySegmentType(bearers) returns segment type */
export function classifySegmentType(bearers: ShieldBearer[]): WallSegment['segmentType'] {
  if (bearers.length === 0) return 'broken-ranks'
  const avgScore = bearers.reduce((s, b) => s + b.qualityScore, 0) / bearers.length
  const spartanCnt = bearers.filter((b) => b.condition === 'spartan-hoplon').length
  if (avgScore >= 75 && spartanCnt >= Math.ceil(bearers.length * 0.3)) return 'phalanx'
  if (avgScore >= 60) return 'shield-wall'
  if (avgScore >= 45) return 'shield-burh'
  if (avgScore >= 30) return 'shield-ring'
  if (avgScore >= 15) return 'skirmish-line'
  return 'broken-ranks'
}

/** @example classifySegmentCondition(avgScore) returns condition */
export function classifySegmentCondition(avgScore: number): WallSegment['condition'] {
  if (avgScore >= 80) return 'spartan-phalanx'
  if (avgScore >= 65) return 'roman-legion'
  if (avgScore >= 50) return 'viking-shieldwall'
  if (avgScore >= 35) return 'medieval-battle'
  if (avgScore >= 20) return 'peasant-militia'
  return 'routed-army'
}

/** @example classifyCommanderGrade(avgDefense) returns grade */
export function classifyCommanderGrade(avgDefense: number): ShieldWallResult['stats']['commanderGrade'] {
  if (avgDefense >= 80) return 'strategos'
  if (avgDefense >= 65) return 'centurion'
  if (avgDefense >= 50) return 'shield-maiden'
  if (avgDefense >= 35) return 'knight'
  if (avgDefense >= 20) return 'militia-captain'
  return 'coward'
}

// ─── Recommendations ────────────────────────────────────────────────────────

/** @example generateRecommendations(bearers, segments, army, stats) returns recommendations */
export function generateRecommendations(
  bearers: ShieldBearer[],
  segments: WallSegment[],
  army: ShieldWallResult['army'],
  stats: ShieldWallResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.avgShieldStrength < 50) recs.push('Strengthen shields — reinforce code robustness and defense')
  if (stats.avgOverlapCoverage < 50) recs.push('Improve overlap coverage — fill error handling gaps')
  if (stats.avgFormationIntegrity < 50) recs.push('Tighten formation — improve code structure and alignment')
  if (stats.avgSpearCoordination < 50) recs.push('Improve coordination — enhance module cohesion and timing')
  if (stats.avgBattleReadiness < 50) recs.push('Raise battle readiness — improve test coverage and preparation')
  if (stats.avgWallResilience < 50) recs.push('Build wall resilience — eliminate weaknesses and improve endurance')
  if (stats.brokenBoardCount > bearers.length * 0.5) recs.push('Too many broken boards — over half the shields are shattered')
  if (stats.hasHighResilienceCount === 0) recs.push('No spartan-grade resilience — train your warriors harder')
  if (segments.length > 0 && army.overallDefense < 60) recs.push('Army defense is weak — consult the strategos')
  if (recs.length === 0) recs.push('Impenetrable shield wall achieved — your army is ready for any siege')

  return recs
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildShieldWallResult(files, contents, options) returns full result */
export function buildShieldWallResult(
  files: string[],
  contents: string[],
  _options?: { verbose?: boolean },
): ShieldWallResult {
  const bearers: ShieldBearer[] = files.map((file, i) =>
    analyzeShieldBearer(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ShieldBearer[]>()
  for (const bearer of bearers) {
    const dir = bearer.file.includes('/')
      ? bearer.file.substring(0, bearer.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bearer)
    } else {
      dirMap.set(dir, [bearer])
    }
  }

  const segments: WallSegment[] = Array.from(dirMap.entries()).map(([dir, dirBearers]) =>
    analyzeWallSegment(dirBearers, dir),
  )

  const avgStrength = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.shieldStrength, 0) / bearers.length)
    : 0
  const avgCoverage = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.overlapCoverage, 0) / bearers.length)
    : 0
  const avgReadiness = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.battleReadiness, 0) / bearers.length)
    : 0
  const overallDefense = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.qualityScore, 0) / bearers.length)
    : 0
  const isImpenetrable = overallDefense >= 65

  const army: ShieldWallResult['army'] = {
    avgStrength, avgCoverage, avgReadiness, isImpenetrable, overallDefense,
  }

  const avgShieldStrength = avgStrength
  const avgOverlapCoverage = avgCoverage
  const avgFormationIntegrity = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.formationIntegrity, 0) / bearers.length)
    : 0
  const avgSpearCoordination = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.spearCoordination, 0) / bearers.length)
    : 0
  const avgBattleReadiness = avgReadiness
  const avgWallResilience = bearers.length > 0
    ? Math.round(bearers.reduce((s, b) => s + b.wallResilience, 0) / bearers.length)
    : 0

  const conditionCounts = {
    spartanHoplon: 0, romanScutum: 0, vikingRound: 0,
    kiteShield: 0, buckler: 0, brokenBoard: 0,
  }
  for (const b of bearers) {
    switch (b.condition) {
      case 'spartan-hoplon': conditionCounts.spartanHoplon++; break
      case 'roman-scutum': conditionCounts.romanScutum++; break
      case 'viking-round': conditionCounts.vikingRound++; break
      case 'kite-shield': conditionCounts.kiteShield++; break
      case 'buckler': conditionCounts.buckler++; break
      case 'broken-board': conditionCounts.brokenBoard++; break
    }
  }

  const hasHighStrengthCount = bearers.filter((b) => b.shield.hasHighStrength).length
  const hasProperOverlapCount = bearers.filter((b) => b.overlap.hasProperOverlap).length
  const hasHighIntegrityCount = bearers.filter((b) => b.formation.hasHighIntegrity).length
  const hasHighCoordinationCount = bearers.filter((b) => b.coordination.hasHighCoordination).length
  const hasHighReadinessCount = bearers.filter((b) => b.readiness.hasHighReadiness).length
  const hasHighResilienceCount = bearers.filter((b) => b.resilience.hasHighResilience).length

  const bestBearer = bearers.length > 0
    ? bearers.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const strongest = bearers.length > 0
    ? bearers.reduce((best, b) => b.shieldStrength > best.shieldStrength ? b : best).file
    : ''
  const bestCovered = bearers.length > 0
    ? bearers.reduce((best, b) => b.overlapCoverage > best.overlapCoverage ? b : best).file
    : ''
  const bestFormation = bearers.length > 0
    ? bearers.reduce((best, b) => b.formationIntegrity > best.formationIntegrity ? b : best).file
    : ''
  const mostCoordinated = bearers.length > 0
    ? bearers.reduce((best, b) => b.spearCoordination > best.spearCoordination ? b : best).file
    : ''
  const mostReady = bearers.length > 0
    ? bearers.reduce((best, b) => b.battleReadiness > best.battleReadiness ? b : best).file
    : ''

  const commanderGrade = classifyCommanderGrade(overallDefense)

  const stats: ShieldWallResult['stats'] = {
    totalFiles: files.length, totalSegments: segments.length,
    avgShieldStrength, avgOverlapCoverage, avgFormationIntegrity,
    avgSpearCoordination, avgBattleReadiness, avgWallResilience,
    spartanHoplonCount: conditionCounts.spartanHoplon,
    romanScutumCount: conditionCounts.romanScutum,
    vikingRoundCount: conditionCounts.vikingRound,
    kiteShieldCount: conditionCounts.kiteShield,
    bucklerCount: conditionCounts.buckler,
    brokenBoardCount: conditionCounts.brokenBoard,
    hasHighStrengthCount, hasProperOverlapCount, hasHighIntegrityCount,
    hasHighCoordinationCount, hasHighReadinessCount, hasHighResilienceCount,
    overallDefense, commanderGrade,
    bestBearer, strongest, bestCovered,
    bestFormation, mostCoordinated, mostReady,
  }

  const recommendations = generateRecommendations(bearers, segments, army, stats)

  return { bearers, segments, army, stats, recommendations }
}
