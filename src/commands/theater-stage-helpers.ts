// ─── Types ──────────────────────────────────────────────────────────────────

export type StageRole = 'protagonist' | 'antagonist' | 'supporting' | 'ensemble' | 'extra' | 'understudy'
export type ScriptGenre = 'tragedy' | 'comedy' | 'drama' | 'musical' | 'farce' | 'improvisation'
export type CostumeStyle = 'period-accurate' | 'avant-garde' | 'minimalist' | 'baroque' | 'casual' | 'naked'
export type SetDesign = 'proscenium' | 'thrust' | 'arena' | 'black-box' | 'site-specific' | 'found-space'
export type AudienceReaction = 'standing-ovation' | 'applause' | 'polite-clapping' | 'silence' | 'booing' | 'walkout'
export type PerformanceCaliber = 'broadway' | 'west-end' | 'regional' | 'community' | 'school' | 'backyard'
export type PerformanceCondition = 'tony-award' | 'standing-ovation' | 'critical-acclaim' | 'community-theater' | 'amateur-night' | 'flop'
export type CompanyType = 'royal-opera' | 'broadway-company' | 'regional-theater' | 'community-theater' | 'drama-club' | 'puppet-show'
export type CompanyCondition = 'world-premiere' | 'hit-show' | 'running-show' | 'workshop' | 'rehearsal' | 'cancelled'
export type DirectorGrade = 'award-winning-director' | 'experienced-director' | 'director' | 'assistant-director' | 'stage-manager' | 'audience-member'

export interface PresenceMeasure {
  quality: number
  role: StageRole
  isLeadingRole: boolean
  hasStrongEntrance: boolean
  hasMemorableExit: boolean
  hasStagePresence: boolean
  hasGoodProjection: boolean
  hasCharacterArc: boolean
  hasMotivation: boolean
  hasBlocking: boolean
  hasChemistry: boolean
  blockingCount: number
}

export interface ScriptMeasure {
  quality: number
  genre: ScriptGenre
  hasWellWrittenDialogue: boolean
  hasProperStructure: boolean
  hasCharacterDevelopment: boolean
  hasPlotTwists: boolean
  hasDeusExMachina: boolean
  hasPlotHoles: boolean
  hasContinuity: boolean
  hasDramaticTension: boolean
  hasResolution: boolean
  plotHoleCount: number
}

export interface CostumeMeasure {
  quality: number
  style: CostumeStyle
  isWellFitted: boolean
  hasProperAttire: boolean
  hasConsistentStyle: boolean
  hasAccessorized: boolean
  hasWardrobeMalfunction: boolean
  hasCostumeChanges: boolean
  hasPeriodAppropriate: boolean
  hasSparkle: boolean
  malfunctionCount: number
}

export interface SetMeasure {
  quality: number
  design: SetDesign
  isWellConstructed: boolean
  hasProperLighting: boolean
  hasSceneChanges: boolean
  hasPracticalSet: boolean
  hasHiddenMechanisms: boolean
  hasRevolvingStage: boolean
  hasFlySystem: boolean
  hasTrapDoor: boolean
  hasBackdrop: boolean
  sceneChangeCount: number
}

export interface EngagementMeasure {
  quality: number
  reaction: AudienceReaction
  isEngaging: boolean
  hasEmotionalImpact: boolean
  hasSuspensionOfDisbelief: boolean
  hasAudienceParticipation: boolean
  hasFourthWall: boolean
  hasBreakingCharacter: boolean
  hasAudienceConnection: boolean
  hasStandingOvation: boolean
  hasEncores: boolean
  participationPoints: number
}

export interface PerformanceMeasure {
  quality: number
  caliber: PerformanceCaliber
  hasPerfectTiming: boolean
  hasEmotionalRange: boolean
  hasImprovisation: boolean
  hasStamina: boolean
  hasPrecision: boolean
  hasFlair: boolean
  hasMissedCue: boolean
  hasForgottenLine: boolean
  hasStageFright: boolean
  missedCueCount: number
}

export interface StagePerformance {
  file: string
  stagePresence: number
  scriptQuality: number
  costumeDesign: number
  setDesign: number
  audienceEngagement: number
  performanceQuality: number
  presence: PresenceMeasure
  script: ScriptMeasure
  costume: CostumeMeasure
  set: SetMeasure
  engagement: EngagementMeasure
  performance: PerformanceMeasure
  condition: PerformanceCondition
  qualityScore: number
}

export interface TheaterCompany {
  directory: string
  performances: StagePerformance[]
  avgPresence: number
  avgScript: number
  avgEngagement: number
  tonyAwardCount: number
  flopCount: number
  standingOvationCount: number
  engagingCount: number
  companyType: CompanyType
  condition: CompanyCondition
}

export interface TheaterStageStats {
  totalFiles: number
  totalCompanies: number
  avgStagePresence: number
  avgScriptQuality: number
  avgCostumeDesign: number
  avgSetDesign: number
  avgAudienceEngagement: number
  avgPerformanceQuality: number
  tonyAwardCount: number
  standingOvationCount: number
  criticalAcclaimCount: number
  communityTheaterCount: number
  amateurNightCount: number
  flopCount: number
  isLeadingRoleCount: number
  hasStrongEntranceCount: number
  hasPlotHolesCount: number
  hasResolutionCount: number
  isWellFittedCount: number
  hasWardrobeMalfunctionCount: number
  isWellConstructedCount: number
  hasHiddenMechanismsCount: number
  isEngagingCount: number
  hasBreakingCharacterCount: number
  hasPerfectTimingCount: number
  hasMissedCueCount: number
  overallProduction: number
  directorGrade: DirectorGrade
  bestPerformance: string
  bestScript: string
  bestCostume: string
  bestSet: string
  bestEngagement: string
}

export interface TheaterStageResult {
  performances: StagePerformance[]
  companies: TheaterCompany[]
  festival: {
    avgPresence: number
    avgScript: number
    avgEngagement: number
    isCriticallyAcclaimed: boolean
    overallProduction: number
  }
  stats: TheaterStageStats
  recommendations: string[]
}

// ─── Regex Patterns ─────────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:\{[^}]*\}|\w+)\s+from\s+['"]([^'"]+)['"]/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum|async\s+function)\s+(\w+)/g
const EXPORT_DEFAULT_RE = /export\s+default\s+/g
const FUNCTION_RE = /\bfunction\s+(\w+)/g
const ARROW_RE = /=>\s*[{(]/g
const CLASS_RE = /\bclass\s+\w+/g
const INTERFACE_RE = /(?:interface|type)\s+\w+\s*(?:<[^>]+>)?\s*\{/
const TYPE_ANNOTATION_RE = /:\s*(?:string|number|boolean|void|Promise|Record|Map|Set|Array|Date|RegExp|Error|[A-Z]\w+)/
const GENERIC_RE = /<\w+>/
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const COMMENT_RE = /\/\/.*$/gm
const TRY_CATCH_RE = /try\s*\{/g
const IF_RE = /\bif\s*\(/g
const ELSE_RE = /\belse\s*[{(]/g
const PIPE_RE = /[.\s](map|filter|reduce|forEach|flatMap|find|some|every)\s*\(/g
const RETURN_RE = /\breturn\b/g
const THROW_RE = /\bthrow\b/g
const CONST_RE = /\bconst\s+/g
const LET_RE = /\blet\s+/g
const MUTATION_RE = /\.\s*(push|pop|shift|unshift|splice|sort|reverse)\s*\(/g
const SIDE_EFFECT_RE = /\b(console|process|fs|fetch|http|writeFile|readFile)\b/g
const ANY_TYPE_RE = /:\s*any\b/
const DEAD_CODE_RE = /\b(debugger|with)\s*[(;]/
const SEMICOLON_RE = /;\s*$/gm
const BLANK_LINE_RE = /\n\s*\n/g
const NESTED_BLOCK_RE = /\{[^{}]*\{[^{}]*\{/

// ─── measurePresence ────────────────────────────────────────────────────────

/**
 * Measure API design and stage presence
 * @example
 * measurePresence('export function processData(input: Data): Result {}') // { quality: 70, ... }
 */
export function measurePresence(content: string): PresenceMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, role: 'understudy', isLeadingRole: false, hasStrongEntrance: false,
      hasMemorableExit: false, hasStagePresence: false, hasGoodProjection: false,
      hasCharacterArc: false, hasMotivation: false, hasBlocking: false, hasChemistry: false,
      blockingCount: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const defaults = (content.match(EXPORT_DEFAULT_RE) ?? []).length

  const hasStrongEntrance = exports > 0 && types > 0
  const hasMemorableExit = returns > 0 && types > 0
  const hasStagePresence = exports > 0 && functions > 0
  const hasGoodProjection = exports >= 2
  const hasCharacterArc = functions > 1 && returns > 0
  const hasMotivation = jsdoc > 0 || interfaces > 0
  const hasBlocking = classes > 0 || functions >= 3
  const hasChemistry = (content.match(IMPORT_RE) ?? []).length > 0 && exports > 0

  let quality = 0
  if (hasStrongEntrance) quality += 15
  if (hasMemorableExit) quality += 15
  if (hasStagePresence) quality += 15
  if (hasGoodProjection) quality += 10
  if (hasCharacterArc) quality += 10
  if (hasMotivation) quality += 10
  if (hasBlocking) quality += 10
  if (hasChemistry) quality += 10
  if (generics > 0) quality += 5
  if (defaults > 0) quality -= 5
  quality = Math.max(0, Math.min(100, quality))

  let role: StageRole = 'understudy'
  if (quality >= 85) role = 'protagonist'
  else if (quality >= 65) role = 'supporting'
  else if (quality >= 45) role = 'ensemble'
  else if (quality >= 25) role = 'extra'
  else if (defaults > 0 && exports === 0) role = 'antagonist'

  return {
    quality, role, isLeadingRole: quality >= 65, hasStrongEntrance, hasMemorableExit,
    hasStagePresence, hasGoodProjection, hasCharacterArc, hasMotivation,
    hasBlocking, hasChemistry, blockingCount: functions,
  }
}

// ─── measureScript ──────────────────────────────────────────────────────────

/**
 * Measure code logic quality
 * @example
 * measureScript('function add(a: number, b: number) { return a + b }') // { quality: 60, ... }
 */
export function measureScript(content: string): ScriptMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, genre: 'improvisation', hasWellWrittenDialogue: false, hasProperStructure: false,
      hasCharacterDevelopment: false, hasPlotTwists: false, hasDeusExMachina: false,
      hasPlotHoles: false, hasContinuity: false, hasDramaticTension: false,
      hasResolution: false, plotHoleCount: 0,
    }
  }

  const ifs = (content.match(IF_RE) ?? []).length
  const elses = (content.match(ELSE_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const throws = (content.match(THROW_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length

  const hasWellWrittenDialogue = types > 0 && anyTypes === 0
  const hasProperStructure = functions > 0 && (ifs === 0 || elses > 0)
  const hasCharacterDevelopment = pipes > 0 && returns > 0
  const hasPlotTwists = elses > 0 && ifs > 0
  const hasDeusExMachina = anyTypes > 0
  const hasPlotHoles = deadCode > 0 || (ifs > 5 && tryCatch === 0)
  const hasContinuity = types > 0
  const hasDramaticTension = ifs > 0 && functions > 1
  const hasResolution = tryCatch > 0 || throws > 0

  let quality = 20
  if (hasWellWrittenDialogue) quality += 15
  if (hasProperStructure) quality += 15
  if (hasCharacterDevelopment) quality += 10
  if (hasPlotTwists) quality += 5
  if (hasContinuity) quality += 10
  if (hasResolution) quality += 15
  if (hasDramaticTension) quality += 5
  if (hasDeusExMachina) quality -= 10
  if (hasPlotHoles) quality -= 10
  quality = Math.max(0, Math.min(100, quality))

  let genre: ScriptGenre = 'improvisation'
  if (quality >= 85) genre = 'musical'
  else if (quality >= 70) genre = 'drama'
  else if (quality >= 55) genre = 'comedy'
  else if (quality >= 35) genre = 'tragedy'
  else if (quality >= 20) genre = 'farce'

  return {
    quality, genre, hasWellWrittenDialogue, hasProperStructure, hasCharacterDevelopment,
    hasPlotTwists, hasDeusExMachina, hasPlotHoles, hasContinuity, hasDramaticTension,
    hasResolution, plotHoleCount: deadCode,
  }
}

// ─── measureCostume ─────────────────────────────────────────────────────────

/**
 * Measure formatting and style quality
 * @example
 * measureCostume('const x: number = 1;\nconst y: string = "hi";') // { quality: 60, ... }
 */
export function measureCostume(content: string): CostumeMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, style: 'naked', isWellFitted: false, hasProperAttire: false,
      hasConsistentStyle: false, hasAccessorized: false, hasWardrobeMalfunction: false,
      hasCostumeChanges: false, hasPeriodAppropriate: false, hasSparkle: false,
      malfunctionCount: 0,
    }
  }

  const semicolons = (content.match(SEMICOLON_RE) ?? []).length
  const blankLines = (content.match(BLANK_LINE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const nestedBlocks = (content.match(NESTED_BLOCK_RE) ?? []).length

  const isWellFitted = loc > 0 && loc <= 300
  const hasProperAttire = semicolons > loc * 0.3 || types > 0
  const hasConsistentStyle = (semicolons === 0 || semicolons > loc * 0.5) && (lets === 0 || consts > lets)
  const hasAccessorized = jsdoc > 0 || types > 0
  const hasWardrobeMalfunction = anyTypes > 0 || deadCode > 0
  const hasCostumeChanges = semicolons > 0 && (content.match(/(?<!;)\s*$/gm) ?? []).length > 0
  const hasPeriodAppropriate = consts > 0 && lets === 0
  const hasSparkle = jsdoc > 0 && types > 0 && blankLines > 0

  let quality = 20
  if (isWellFitted) quality += 10
  if (hasProperAttire) quality += 15
  if (hasConsistentStyle) quality += 15
  if (hasAccessorized) quality += 15
  if (hasPeriodAppropriate) quality += 10
  if (hasSparkle) quality += 10
  if (blankLines > 2) quality += 5
  if (hasWardrobeMalfunction) quality -= 15
  if (nestedBlocks > 3) quality -= 5
  quality = Math.max(0, Math.min(100, quality))

  let style: CostumeStyle = 'naked'
  if (quality >= 85) style = 'period-accurate'
  else if (quality >= 70) style = 'minimalist'
  else if (quality >= 55) style = 'avant-garde'
  else if (quality >= 40) style = 'casual'
  else if (quality >= 25) style = 'baroque'

  return {
    quality, style, isWellFitted, hasProperAttire, hasConsistentStyle,
    hasAccessorized, hasWardrobeMalfunction, hasCostumeChanges, hasPeriodAppropriate,
    hasSparkle, malfunctionCount: anyTypes + deadCode,
  }
}

// ─── measureSet ─────────────────────────────────────────────────────────────

/**
 * Measure architecture quality
 * @example
 * measureSet('import { X } from "y"; export function run(): void {}') // { quality: 70, ... }
 */
export function measureSet(content: string): SetMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, design: 'found-space', isWellConstructed: false, hasProperLighting: false,
      hasSceneChanges: false, hasPracticalSet: false, hasHiddenMechanisms: false,
      hasRevolvingStage: false, hasFlySystem: false, hasTrapDoor: false,
      hasBackdrop: false, sceneChangeCount: 0,
    }
  }

  const imports = (content.match(IMPORT_RE) ?? []).length
  const exports = (content.match(EXPORT_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const mutations = (content.match(MUTATION_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const isWellConstructed = exports > 0 && (classes > 0 || functions > 0)
  const hasProperLighting = types_count(content) > 0
  const hasSceneChanges = imports > 0 && exports > 0
  const hasPracticalSet = functions > 0 && sideEffects === 0
  const hasHiddenMechanisms = mutations > 2
  const hasRevolvingStage = classes > 1
  const hasFlySystem = generics > 0 || interfaces > 0
  const hasTrapDoor = sideEffects > 0 && tryCatch === 0
  const hasBackdrop = imports > 0

  let quality = 0
  if (isWellConstructed) quality += 15
  if (hasProperLighting) quality += 15
  if (hasSceneChanges) quality += 15
  if (hasPracticalSet) quality += 10
  if (hasFlySystem) quality += 15
  if (hasBackdrop) quality += 10
  if (hasRevolvingStage) quality += 5
  if (hasTrapDoor) quality -= 10
  if (hasHiddenMechanisms) quality -= 5
  quality = Math.max(0, Math.min(100, quality))

  let design: SetDesign = 'found-space'
  if (quality >= 85) design = 'proscenium'
  else if (quality >= 65) design = 'thrust'
  else if (quality >= 50) design = 'arena'
  else if (quality >= 35) design = 'black-box'
  else if (quality >= 20) design = 'site-specific'

  return {
    quality, design, isWellConstructed, hasProperLighting, hasSceneChanges,
    hasPracticalSet, hasHiddenMechanisms, hasRevolvingStage, hasFlySystem,
    hasTrapDoor, hasBackdrop, sceneChangeCount: imports + exports,
  }
}

function types_count(content: string): number {
  return (content.match(TYPE_ANNOTATION_RE) ?? []).length
}

// ─── measureEngagement ──────────────────────────────────────────────────────

/**
 * Measure developer experience quality
 * @example
 * measureEngagement('/** Adds two numbers *\/ export function add(a: number, b: number): number {}') // { quality: 80, ... }
 */
export function measureEngagement(content: string): EngagementMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, reaction: 'walkout', isEngaging: false, hasEmotionalImpact: false,
      hasSuspensionOfDisbelief: false, hasAudienceParticipation: false, hasFourthWall: false,
      hasBreakingCharacter: false, hasAudienceConnection: false, hasStandingOvation: false,
      hasEncores: false, participationPoints: 0,
    }
  }

  const exports = (content.match(EXPORT_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const generics = (content.match(GENERIC_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length

  const isEngaging = exports > 0 && (jsdoc > 0 || types > 0)
  const hasEmotionalImpact = pipes > 0 && generics > 0
  const hasSuspensionOfDisbelief = types > 0 && anyTypes === 0
  const hasAudienceParticipation = exports > 0 && interfaces > 0
  const hasFourthWall = sideEffects === 0 || (content.match(TRY_CATCH_RE) ?? []).length > 0
  const hasBreakingCharacter = anyTypes > 0 || sideEffects > 2
  const hasAudienceConnection = jsdoc > 0 || comments > 0
  const hasStandingOvation = exports >= 3 && jsdoc > 0 && types > 0
  const hasEncores = pipes > 0 && functions > 0

  let quality = 15
  if (isEngaging) quality += 15
  if (hasEmotionalImpact) quality += 10
  if (hasSuspensionOfDisbelief) quality += 15
  if (hasAudienceParticipation) quality += 10
  if (hasFourthWall) quality += 10
  if (hasAudienceConnection) quality += 10
  if (hasStandingOvation) quality += 10
  if (hasEncores) quality += 5
  if (hasBreakingCharacter) quality -= 15
  quality = Math.max(0, Math.min(100, quality))

  let reaction: AudienceReaction = 'walkout'
  if (quality >= 85) reaction = 'standing-ovation'
  else if (quality >= 70) reaction = 'applause'
  else if (quality >= 55) reaction = 'polite-clapping'
  else if (quality >= 35) reaction = 'silence'
  else if (quality >= 20) reaction = 'booing'

  return {
    quality, reaction, isEngaging, hasEmotionalImpact, hasSuspensionOfDisbelief,
    hasAudienceParticipation, hasFourthWall, hasBreakingCharacter, hasAudienceConnection,
    hasStandingOvation, hasEncores, participationPoints: exports + jsdoc,
  }
}

// ─── measurePerformance ─────────────────────────────────────────────────────

/**
 * Measure execution quality
 * @example
 * measurePerformance('try { await run() } catch { handle() }') // { quality: 70, ... }
 */
export function measurePerformance(content: string): PerformanceMeasure {
  const loc = content.split('\n').filter((l) => l.trim().length > 0).length
  if (loc === 0) {
    return {
      quality: 0, caliber: 'backyard', hasPerfectTiming: false, hasEmotionalRange: false,
      hasImprovisation: false, hasStamina: false, hasPrecision: false, hasFlair: false,
      hasMissedCue: false, hasForgottenLine: false, hasStageFright: false, missedCueCount: 0,
    }
  }

  const tryCatch = (content.match(TRY_CATCH_RE) ?? []).length
  const returns = (content.match(RETURN_RE) ?? []).length
  const types = (content.match(TYPE_ANNOTATION_RE) ?? []).length
  const pipes = (content.match(PIPE_RE) ?? []).length
  const consts = (content.match(CONST_RE) ?? []).length
  const lets = (content.match(LET_RE) ?? []).length
  const sideEffects = (content.match(SIDE_EFFECT_RE) ?? []).length
  const deadCode = (content.match(DEAD_CODE_RE) ?? []).length
  const anyTypes = (content.match(ANY_TYPE_RE) ?? []).length

  const hasPerfectTiming = consts > 0 && lets === 0
  const hasEmotionalRange = pipes > 0 && functions_count(content) > 1
  const hasImprovisation = tryCatch > 0
  const hasStamina = types > 0 && sideEffects === 0
  const hasPrecision = types > 0 && anyTypes === 0
  const hasFlair = pipes > 0 && returns > 0
  const hasMissedCue = sideEffects > 0 && tryCatch === 0
  const hasForgottenLine = functions_count(content) > 0 && returns === 0
  const hasStageFright = anyTypes > 0 || deadCode > 0

  let quality = 15
  if (hasPerfectTiming) quality += 10
  if (hasEmotionalRange) quality += 10
  if (hasImprovisation) quality += 15
  if (hasStamina) quality += 10
  if (hasPrecision) quality += 15
  if (hasFlair) quality += 10
  if (hasMissedCue) quality -= 10
  if (hasStageFright) quality -= 10
  quality = Math.max(0, Math.min(100, quality))

  let caliber: PerformanceCaliber = 'backyard'
  if (quality >= 85) caliber = 'broadway'
  else if (quality >= 70) caliber = 'west-end'
  else if (quality >= 55) caliber = 'regional'
  else if (quality >= 40) caliber = 'community'
  else if (quality >= 20) caliber = 'school'

  return {
    quality, caliber, hasPerfectTiming, hasEmotionalRange, hasImprovisation,
    hasStamina, hasPrecision, hasFlair, hasMissedCue, hasForgottenLine,
    hasStageFright, missedCueCount: sideEffects > 0 && tryCatch === 0 ? sideEffects : 0,
  }
}

function functions_count(content: string): number {
  return (content.match(FUNCTION_RE) ?? []).length + (content.match(ARROW_RE) ?? []).length
}

// ─── analyzeStagePerformance ────────────────────────────────────────────────

/**
 * Analyze a single file as a stage performance
 * @example
 * analyzeStagePerformance('export function run(): void {}', 'main.ts') // { qualityScore: 60, ... }
 */
export function analyzeStagePerformance(content: string, filePath: string): StagePerformance {
  const presence = measurePresence(content)
  const script = measureScript(content)
  const costume = measureCostume(content)
  const set = measureSet(content)
  const engagement = measureEngagement(content)
  const performance = measurePerformance(content)

  const stagePresence = presence.quality
  const scriptQuality = script.quality
  const costumeDesign = costume.quality
  const setDesignNum = set.quality
  const audienceEngagement = engagement.quality
  const performanceQuality = performance.quality

  const qualityScore = Math.round(
    (stagePresence + scriptQuality + costumeDesign + setDesignNum + audienceEngagement + performanceQuality) / 6,
  )

  let condition: PerformanceCondition = 'flop'
  if (qualityScore >= 90) condition = 'tony-award'
  else if (qualityScore >= 75) condition = 'standing-ovation'
  else if (qualityScore >= 60) condition = 'critical-acclaim'
  else if (qualityScore >= 40) condition = 'community-theater'
  else if (qualityScore >= 20) condition = 'amateur-night'

  return {
    file: filePath,
    stagePresence, scriptQuality, costumeDesign, setDesign: setDesignNum,
    audienceEngagement, performanceQuality,
    presence, script, costume, set, engagement, performance,
    condition, qualityScore,
  }
}

// ─── classifyCompanyType ────────────────────────────────────────────────────

/**
 * Classify company type based on performances
 * @example
 * classifyCompanyType(performances) // 'broadway-company'
 */
export function classifyCompanyType(performances: StagePerformance[]): CompanyType {
  if (performances.length === 0) return 'puppet-show'
  const avgQuality = performances.reduce((s, p) => s + p.qualityScore, 0) / performances.length
  const tonyCount = performances.filter((p) => p.condition === 'tony-award').length

  if (avgQuality >= 80 && tonyCount >= 2) return 'royal-opera'
  if (avgQuality >= 65) return 'broadway-company'
  if (avgQuality >= 50) return 'regional-theater'
  if (avgQuality >= 35) return 'community-theater'
  if (avgQuality >= 15) return 'drama-club'
  return 'puppet-show'
}

// ─── classifyDirectorGrade ──────────────────────────────────────────────────

/**
 * Classify director grade based on average production quality
 * @example
 * classifyDirectorGrade(85) // 'experienced-director'
 */
export function classifyDirectorGrade(avgProduction: number): DirectorGrade {
  if (avgProduction >= 90) return 'award-winning-director'
  if (avgProduction >= 75) return 'experienced-director'
  if (avgProduction >= 55) return 'director'
  if (avgProduction >= 35) return 'assistant-director'
  if (avgProduction >= 15) return 'stage-manager'
  return 'audience-member'
}

// ─── classifyCompanyCondition ───────────────────────────────────────────────

function classifyCompanyCondition(avgQuality: number): CompanyCondition {
  if (avgQuality >= 80) return 'world-premiere'
  if (avgQuality >= 65) return 'hit-show'
  if (avgQuality >= 45) return 'running-show'
  if (avgQuality >= 30) return 'workshop'
  if (avgQuality >= 15) return 'rehearsal'
  return 'cancelled'
}

// ─── analyzeTheaterCompany ──────────────────────────────────────────────────

/**
 * Analyze a directory as a theater company
 * @example
 * analyzeTheaterCompany(performances, 'src/') // { companyType: 'broadway-company', ... }
 */
export function analyzeTheaterCompany(performances: StagePerformance[], dirPath: string): TheaterCompany {
  if (performances.length === 0) {
    return {
      directory: dirPath, performances: [],
      avgPresence: 0, avgScript: 0, avgEngagement: 0,
      tonyAwardCount: 0, flopCount: 0, standingOvationCount: 0, engagingCount: 0,
      companyType: 'puppet-show', condition: 'cancelled',
    }
  }

  const avgPresence = Math.round(performances.reduce((s, p) => s + p.stagePresence, 0) / performances.length)
  const avgScript = Math.round(performances.reduce((s, p) => s + p.scriptQuality, 0) / performances.length)
  const avgEngagement = Math.round(performances.reduce((s, p) => s + p.audienceEngagement, 0) / performances.length)
  const avgQuality = Math.round(performances.reduce((s, p) => s + p.qualityScore, 0) / performances.length)

  return {
    directory: dirPath, performances,
    avgPresence, avgScript, avgEngagement,
    tonyAwardCount: performances.filter((p) => p.condition === 'tony-award').length,
    flopCount: performances.filter((p) => p.condition === 'flop').length,
    standingOvationCount: performances.filter((p) => p.condition === 'standing-ovation').length,
    engagingCount: performances.filter((p) => p.engagement.isEngaging).length,
    companyType: classifyCompanyType(performances),
    condition: classifyCompanyCondition(avgQuality),
  }
}

// ─── generateRecommendations ────────────────────────────────────────────────

/**
 * Generate improvement recommendations
 * @example
 * generateRecommendations(performances, companies, festival, stats) // ['Improve stage presence...']
 */
export function generateRecommendations(
  performances: StagePerformance[],
  companies: TheaterCompany[],
  _festival: { avgPresence: number; avgScript: number; avgEngagement: number; isCriticallyAcclaimed: boolean; overallProduction: number },
  stats: TheaterStageStats,
): string[] {
  const recs: string[] = []

  if (stats.flopCount > stats.totalFiles * 0.3) {
    recs.push('Too many flops in the lineup — consider rewriting or removing low-quality files')
  }
  if (stats.avgStagePresence < 40) {
    recs.push('Weak stage presence — add exports, type annotations, and clear function signatures')
  }
  if (stats.avgScriptQuality < 40) {
    recs.push('Script needs revision — improve error handling and type safety')
  }
  if (stats.hasWardrobeMalfunctionCount > stats.totalFiles * 0.2) {
    recs.push('Wardrobe malfunctions detected — remove any types and dead code')
  }
  if (stats.hasBreakingCharacterCount > stats.totalFiles * 0.3) {
    recs.push('Breaking character too often — reduce side effects and improve encapsulation')
  }
  if (stats.avgAudienceEngagement < 40) {
    recs.push('Audience losing interest — add documentation, JSDoc, and clear interfaces')
  }
  if (stats.hasMissedCueCount > stats.totalFiles * 0.3) {
    recs.push('Too many missed cues — add try-catch around side effects')
  }

  const worst = performances.length > 0 && performances[0]
    ? performances.reduce((w, p) => p.qualityScore < w.qualityScore ? p : w, performances[0] as typeof performances[number])
    : null
  if (worst && worst.qualityScore < 25) {
    recs.push(`Worst performance "${worst.file}" needs a complete rewrite (score: ${worst.qualityScore})`)
  }

  if (companies.some((c) => c.condition === 'cancelled')) {
    recs.push('Some companies have cancelled shows — major reorganization needed')
  }

  return recs.length > 0 ? recs : ['Production is Broadway-caliber — keep up the excellent work!']
}

// ─── buildTheaterStageResult ────────────────────────────────────────────────

/**
 * Build the complete theater stage result
 * @example
 * buildTheaterStageResult(['a.ts'], ['export function run(): void {}'], {}) // { performances: [...], ... }
 */
export function buildTheaterStageResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): TheaterStageResult {
  const performances: StagePerformance[] = []
  for (let i = 0; i < files.length; i++) {
    performances.push(analyzeStagePerformance(contents[i] ?? '', files[i] ?? ''))
  }

  const dirMap = new Map<string, StagePerformance[]>()
  for (const perf of performances) {
    const dir = perf.file.includes('/') ? perf.file.substring(0, perf.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(perf)
    } else {
      dirMap.set(dir, [perf])
    }
  }

  const companies: TheaterCompany[] = []
  for (const [dir, dirPerfs] of dirMap) {
    companies.push(analyzeTheaterCompany(dirPerfs, dir))
  }

  const avgPresence = performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.stagePresence, 0) / performances.length) : 0
  const avgScript = performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.scriptQuality, 0) / performances.length) : 0
  const avgEngagement = performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.audienceEngagement, 0) / performances.length) : 0
  const overallProduction = performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.qualityScore, 0) / performances.length) : 0

  const festival = {
    avgPresence, avgScript, avgEngagement,
    isCriticallyAcclaimed: overallProduction >= 70,
    overallProduction,
  }

  const conditions = performances.map((p) => p.condition)
  const first = performances[0]
  const bestPerformance = first
    ? performances.reduce((b, p) => p.qualityScore > b.qualityScore ? p : b, first)
    : null
  const bestScript = first
    ? performances.reduce((b, p) => p.scriptQuality > b.scriptQuality ? p : b, first)
    : null
  const bestCostume = first
    ? performances.reduce((b, p) => p.costumeDesign > b.costumeDesign ? p : b, first)
    : null
  const bestSet = first
    ? performances.reduce((b, p) => p.setDesign > b.setDesign ? p : b, first)
    : null
  const bestEngagement = first
    ? performances.reduce((b, p) => p.audienceEngagement > b.audienceEngagement ? p : b, first)
    : null

  const stats: TheaterStageStats = {
    totalFiles: performances.length,
    totalCompanies: companies.length,
    avgStagePresence: avgPresence,
    avgScriptQuality: avgScript,
    avgCostumeDesign: performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.costumeDesign, 0) / performances.length) : 0,
    avgSetDesign: performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.setDesign, 0) / performances.length) : 0,
    avgAudienceEngagement: avgEngagement,
    avgPerformanceQuality: performances.length > 0 ? Math.round(performances.reduce((s, p) => s + p.performanceQuality, 0) / performances.length) : 0,
    tonyAwardCount: conditions.filter((c) => c === 'tony-award').length,
    standingOvationCount: conditions.filter((c) => c === 'standing-ovation').length,
    criticalAcclaimCount: conditions.filter((c) => c === 'critical-acclaim').length,
    communityTheaterCount: conditions.filter((c) => c === 'community-theater').length,
    amateurNightCount: conditions.filter((c) => c === 'amateur-night').length,
    flopCount: conditions.filter((c) => c === 'flop').length,
    isLeadingRoleCount: performances.filter((p) => p.presence.isLeadingRole).length,
    hasStrongEntranceCount: performances.filter((p) => p.presence.hasStrongEntrance).length,
    hasPlotHolesCount: performances.filter((p) => p.script.hasPlotHoles).length,
    hasResolutionCount: performances.filter((p) => p.script.hasResolution).length,
    isWellFittedCount: performances.filter((p) => p.costume.isWellFitted).length,
    hasWardrobeMalfunctionCount: performances.filter((p) => p.costume.hasWardrobeMalfunction).length,
    isWellConstructedCount: performances.filter((p) => p.set.isWellConstructed).length,
    hasHiddenMechanismsCount: performances.filter((p) => p.set.hasHiddenMechanisms).length,
    isEngagingCount: performances.filter((p) => p.engagement.isEngaging).length,
    hasBreakingCharacterCount: performances.filter((p) => p.engagement.hasBreakingCharacter).length,
    hasPerfectTimingCount: performances.filter((p) => p.performance.hasPerfectTiming).length,
    hasMissedCueCount: performances.filter((p) => p.performance.hasMissedCue).length,
    overallProduction,
    directorGrade: classifyDirectorGrade(overallProduction),
    bestPerformance: bestPerformance?.file ?? '',
    bestScript: bestScript?.file ?? '',
    bestCostume: bestCostume?.file ?? '',
    bestSet: bestSet?.file ?? '',
    bestEngagement: bestEngagement?.file ?? '',
  }

  const recommendations = generateRecommendations(performances, companies, festival, stats)

  return { performances, companies, festival, stats, recommendations }
}
