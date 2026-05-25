// ─── Types ───────────────────────────────────────────────

import { dirname } from 'node:path'
import fg from 'fast-glob'

// ─── Measure Enums ──────────────────────────────────────

export type ForgingIron = 'unbreakable-steel' | 'forged-iron' | 'proper-metal' | 'brittle-cast' | 'rusty-iron' | 'no-strength'
export type CommandingCommand = 'absolute-monarch' | 'sovereign-rule' | 'proper-authority' | 'weak-leadership' | 'powerless-figurehead' | 'no-authority'
export type RefiningJewel = 'flawless-diamond' | 'perfect-ruby' | 'proper-setting' | 'chipped-stone' | 'glass-bead' | 'no-jewel'
export type FlexingCirclet = 'adamant-flex' | 'spring-steel' | 'proper-give' | 'brittle-wire' | 'snapped-band' | 'no-resilience'
export type EnduringReign = 'eternal-dynasty' | 'long-reign' | 'proper-rule' | 'brief-tenure' | 'usurped-throne' | 'no-endurance'
export type IronCondition = 'imperial-crown' | 'royal-diadem' | 'proper-circlet' | 'tarnished-band' | 'broken-crown' | 'void'
export type ThroneType = 'grand-throne' | 'royal-court' | 'proper-hall' | 'small-chamber' | 'dark-dungeon' | 'no-throne'
export type ThroneCondition = 'golden-palace' | 'royal-court' | 'proper-hall' | 'tarnished-room' | 'ruined-keep' | 'void'
export type MonarchGrade = 'emperor' | 'king' | 'duke' | 'count' | 'knight' | 'peasant'

// ─── Measure Interfaces ─────────────────────────────────

export interface ForgingMeasure {
  strength: number
  iron: ForgingIron
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasScalable: boolean
  hasNoBottlenecked: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasStrong: boolean
  hasNoWeak: boolean
  hasPowerful: boolean
  hasNoFeeble: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface CommandingMeasure {
  authority: number
  command: CommandingCommand
  hasHighAuthority: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasClearAPI: boolean
  hasNoMysteryAPI: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasDecisive: boolean
  hasNoAmbiguous: boolean
  hasTyped: boolean
  hasNoUntyped: boolean
  hasNamed: boolean
  hasNoAnonymous: boolean
  hasVisible: boolean
  hiddenCount: number
  undocumentedCount: number
}

export interface RefiningMeasure {
  precision: number
  jewel: RefiningJewel
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasRefined: boolean
  hasNoRough: boolean
  unsafeCount: number
  buggyCount: number
}

export interface FlexingMeasure {
  resilience: number
  circlet: FlexingCirclet
  hasHighResilience: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasForgiving: boolean
  hasNoPunishing: boolean
  hasAdaptive: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface EnduringMeasure {
  endurance: number
  reign: EnduringReign
  hasHighEndurance: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasTimeless: boolean
  hasNoFaddish: boolean
  hasEnduring: boolean
  experimentalCount: number
  adHocCount: number
}

// ─── Core Types ─────────────────────────────────────────

export interface IronJewel {
  file: string
  sovereignStrength: number
  crownAuthority: number
  jewelPrecision: number
  circletResilience: number
  reignEndurance: number
  forging: ForgingMeasure
  commanding: CommandingMeasure
  refining: RefiningMeasure
  flexing: FlexingMeasure
  enduring: EnduringMeasure
  condition: IronCondition
  qualityScore: number
}

export interface IronThrone {
  directory: string
  jewels: IronJewel[]
  avgStrength: number
  avgPrecision: number
  avgEndurance: number
  imperialCrownCount: number
  voidCount: number
  throneType: ThroneType
  condition: ThroneCondition
}

export interface IronKingdom {
  avgStrength: number
  avgPrecision: number
  avgEndurance: number
  isImperial: boolean
  overallSovereignty: number
}

export interface IronStats {
  totalFiles: number
  totalThrones: number
  avgSovereignStrength: number
  avgCrownAuthority: number
  avgJewelPrecision: number
  avgCircletResilience: number
  avgReignEndurance: number
  imperialCrownCount: number
  royalDiademCount: number
  properCircletCount: number
  tarnishedBandCount: number
  brokenCrownCount: number
  voidCount: number
  hasHighStrengthCount: number
  hasHighAuthorityCount: number
  hasHighPrecisionCount: number
  hasHighResilienceCount: number
  hasHighEnduranceCount: number
  overallSovereignty: number
  monarchGrade: MonarchGrade
  bestJewel: string
  strongest: string
  mostAuthoritative: string
  mostPrecise: string
  mostResilient: string
  mostEnduring: string
}

export interface IronCrownResult {
  jewels: IronJewel[]
  thrones: IronThrone[]
  kingdom: IronKingdom
  stats: IronStats
  recommendations: string[]
}

// ─── Utility ────────────────────────────────────────────

function hasPattern(content: string, re: RegExp): boolean {
  return re.test(content)
}

function countPattern(content: string, re: RegExp): number {
  return (content.match(new RegExp(re.source, 'g')) ?? []).length
}

// ─── Grade Classifiers ──────────────────────────────────

function classifyForgingIron(strength: number): ForgingIron {
  if (strength >= 90) return 'unbreakable-steel'
  if (strength >= 75) return 'forged-iron'
  if (strength >= 60) return 'proper-metal'
  if (strength >= 40) return 'brittle-cast'
  if (strength >= 20) return 'rusty-iron'
  return 'no-strength'
}

function classifyCommandingCommand(authority: number): CommandingCommand {
  if (authority >= 90) return 'absolute-monarch'
  if (authority >= 75) return 'sovereign-rule'
  if (authority >= 60) return 'proper-authority'
  if (authority >= 40) return 'weak-leadership'
  if (authority >= 20) return 'powerless-figurehead'
  return 'no-authority'
}

function classifyRefiningJewel(precision: number): RefiningJewel {
  if (precision >= 90) return 'flawless-diamond'
  if (precision >= 75) return 'perfect-ruby'
  if (precision >= 60) return 'proper-setting'
  if (precision >= 40) return 'chipped-stone'
  if (precision >= 20) return 'glass-bead'
  return 'no-jewel'
}

function classifyFlexingCirclet(resilience: number): FlexingCirclet {
  if (resilience >= 90) return 'adamant-flex'
  if (resilience >= 75) return 'spring-steel'
  if (resilience >= 60) return 'proper-give'
  if (resilience >= 40) return 'brittle-wire'
  if (resilience >= 20) return 'snapped-band'
  return 'no-resilience'
}

function classifyEnduringReign(endurance: number): EnduringReign {
  if (endurance >= 90) return 'eternal-dynasty'
  if (endurance >= 75) return 'long-reign'
  if (endurance >= 60) return 'proper-rule'
  if (endurance >= 40) return 'brief-tenure'
  if (endurance >= 20) return 'usurped-throne'
  return 'no-endurance'
}

/**
 * @example classifyIronCondition(85) // 'imperial-crown'
 */
export function classifyIronCondition(score: number): IronCondition {
  if (score >= 90) return 'imperial-crown'
  if (score >= 75) return 'royal-diadem'
  if (score >= 60) return 'proper-circlet'
  if (score >= 40) return 'tarnished-band'
  if (score >= 20) return 'broken-crown'
  return 'void'
}

/**
 * @example classifyThroneType(jewels)
 */
export function classifyThroneType(jewels: IronJewel[]): ThroneType {
  if (jewels.length === 0) return 'no-throne'
  const avg = jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length
  if (avg >= 85) return 'grand-throne'
  if (avg >= 70) return 'royal-court'
  if (avg >= 55) return 'proper-hall'
  if (avg >= 35) return 'small-chamber'
  if (avg >= 15) return 'dark-dungeon'
  return 'no-throne'
}

/**
 * @example classifyMonarchGrade(80) // 'emperor'
 */
export function classifyMonarchGrade(sovereignty: number): MonarchGrade {
  if (sovereignty >= 80) return 'emperor'
  if (sovereignty >= 65) return 'king'
  if (sovereignty >= 50) return 'duke'
  if (sovereignty >= 35) return 'count'
  if (sovereignty >= 20) return 'knight'
  return 'peasant'
}

/**
 * @example classifyThroneCondition(75) // 'golden-palace'
 */
export function classifyThroneCondition(avg: number): ThroneCondition {
  if (avg >= 85) return 'golden-palace'
  if (avg >= 70) return 'royal-court'
  if (avg >= 55) return 'proper-hall'
  if (avg >= 35) return 'tarnished-room'
  if (avg >= 15) return 'ruined-keep'
  return 'void'
}

// ─── measureForging ─────────────────────────────────────
// richContent: hasDoc, hasExport, hasInterface, hasReturnType, hasGenerics, hasReadonly,
//              hasExtends(no), hasAbstract(no), hasClass, hasPrivate, hasConst → 100
// minimalContent ('const x = 1'): hasConst → 0

/**
 * @example measureForging('export interface Config<T> { readonly items: ReadonlyArray<T> }')
 */
export function measureForging(content: string): ForgingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasDoc) score += 13
  if (hasExport) score += 13
  if (hasInterface) score += 13
  if (hasReturnType) score += 13
  if (hasGenerics) score += 12
  if (hasReadonly) score += 12
  if (hasClass) score += 12
  if (hasPrivate) score += 12

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5

  const chaoticCount = hasVar
  const monolithicCount = hasAny ? 1 : 0

  const strength = Math.min(100, Math.max(0, score))

  return {
    strength,
    iron: classifyForgingIron(strength),
    hasHighStrength: strength >= 80,
    hasWellStructured: hasInterface && !hasAny,
    hasNoChaotic: chaoticCount === 0,
    hasModular: hasInterface || hasClass,
    hasNoMonolithic: monolithicCount === 0,
    hasScalable: hasGenerics && !hasAny,
    hasNoBottlenecked: !hasAny,
    hasEfficient: hasReturnType && hasExport,
    hasNoWasteful: !hasAny,
    hasOrganized: hasDoc && hasExport,
    hasNoScattered: hasVar === 0,
    hasStrong: hasReturnType && !hasAny,
    hasNoWeak: !hasAny,
    hasPowerful: hasGenerics && hasReadonly && !hasAny,
    hasNoFeeble: !hasAny,
    chaoticCount,
    monolithicCount,
  }
}

// ─── measureCommanding ──────────────────────────────────
// richContent: hasDoc, hasExport, hasReturnType, hasGenerics, hasNamed, hasInterface, hasConst → 100
// minimalContent ('const x = 1'): hasConst → 0

/**
 * @example measureCommanding('export function command(input: string): Result {}')
 */
export function measureCommanding(content: string): CommandingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasConst = hasPattern(content, /\bconst\b/)

  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasTsIgnore = hasPattern(content, /\/\/\s*@ts-ignore|\/\/\s*@ts-expect-error/)

  if (hasDoc) score += 17
  if (hasExport) score += 17
  if (hasReturnType) score += 17
  if (hasGenerics) score += 17
  if (hasNamed) score += 16
  if (hasInterface) score += 16

  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const hiddenCount = (hasEval ? 1 : 0) + (hasTsIgnore ? 1 : 0)
  const undocumentedCount = hasAny ? 1 : 0

  const authority = Math.min(100, Math.max(0, score))

  return {
    authority,
    command: classifyCommandingCommand(authority),
    hasHighAuthority: authority >= 80,
    hasExported: hasExport,
    hasNoHidden: hiddenCount === 0,
    hasDocumented: hasDoc,
    hasNoUndocumented: !hasAny,
    hasClearAPI: hasExport && hasReturnType,
    hasNoMysteryAPI: !hasAny && !hasEval,
    hasConsistent: hasConst && !hasAny,
    hasNoContradictory: !hasAny,
    hasDecisive: hasReturnType && hasExport,
    hasNoAmbiguous: !hasAny,
    hasTyped: hasReturnType && !hasAny,
    hasNoUntyped: !hasAny,
    hasNamed: hasNamed,
    hasNoAnonymous: !hasEval,
    hasVisible: hasExport,
    hiddenCount,
    undocumentedCount,
  }
}

// ─── measureRefining ────────────────────────────────────
// richContent: hasDoc, hasExport, hasReturnType, hasGenerics, hasStrictChecks, hasTryCatch,
//              hasConst, hasReadonly → 100
// minimalContent ('const x = 1'): hasConst → 0

/**
 * @example measureRefining('export function refine(val: Readonly<Type>): Type { if (val === 0) return val }')
 */
export function measureRefining(content: string): RefiningMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasStrictChecks = hasPattern(content, /===|!==/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasStrictChecks) score += 14
  if (hasTryCatch) score += 14
  if (hasReadonly) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 6
  if (hasEval) score -= 10

  const unsafeCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)
  const buggyCount = hasVar + (hasAny ? 1 : 0)

  const precision = Math.min(100, Math.max(0, score))

  return {
    precision,
    jewel: classifyRefiningJewel(precision),
    hasHighPrecision: precision >= 80,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: unsafeCount === 0,
    hasAccurate: hasReturnType && !hasAny,
    hasNoWrong: !hasAny,
    hasExact: hasStrictChecks && hasReturnType,
    hasNoApproximate: !hasAny,
    hasCorrect: hasConst && hasReturnType,
    hasNoBuggy: buggyCount === 0,
    hasConsistent: hasConst && !hasAny,
    hasNoErratic: !hasEval,
    hasValidated: hasStrictChecks && hasTryCatch,
    hasNoAssumed: !hasAny,
    hasClean: !hasAny && !hasEval,
    hasNoDirty: !hasEval,
    hasRefined: hasGenerics && hasReadonly && !hasAny,
    hasNoRough: buggyCount === 0,
    unsafeCount,
    buggyCount,
  }
}

// ─── measureFlexing ─────────────────────────────────────
// richContent: hasDoc, hasExport, hasReturnType, hasGenerics, hasTryCatch, hasConst,
//              hasReadonly, hasStrictChecks → 100
// minimalContent ('const x = 1'): hasConst → 0

/**
 * @example measureFlexing('export function flex(input: string): Result { try { return parse(input) } catch { throw new Error("fail") } }')
 */
export function measureFlexing(content: string): FlexingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasStrictChecks = hasPattern(content, /===|!==/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasTryCatch) score += 14
  if (hasReadonly) score += 14
  if (hasStrictChecks) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8
  if (hasDebugger) score -= 5

  const untestedCount = hasVar + (hasDebugger ? 1 : 0)
  const bareCrashCount = (hasEval ? 1 : 0) + (hasAny ? 1 : 0)

  const resilience = Math.min(100, Math.max(0, score))

  return {
    resilience,
    circlet: classifyFlexingCirclet(resilience),
    hasHighResilience: resilience >= 80,
    hasTested: hasTryCatch,
    hasNoUntested: untestedCount === 0,
    hasErrorHandled: hasTryCatch,
    hasNoBareCrash: bareCrashCount === 0,
    hasDefensive: hasTryCatch && !hasAny,
    hasNoNaive: !hasAny,
    hasRecoverable: hasTryCatch && hasReturnType,
    hasNoFatal: !hasEval,
    hasGraceful: hasTryCatch && hasReturnType && !hasAny,
    hasNoHarshFail: !hasEval,
    hasRobust: hasReturnType && hasTryCatch && !hasAny,
    hasNoFragile: !hasAny,
    hasForgiving: hasTryCatch && !hasAny,
    hasNoPunishing: !hasEval,
    hasAdaptive: hasGenerics && hasTryCatch,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureEnduring ────────────────────────────────────
// richContent: hasDoc, hasExport, hasReturnType, hasGenerics, hasTryCatch, hasConst,
//              hasReadonly, hasStrictChecks → 100
// minimalContent ('const x = 1'): hasConst → 0

/**
 * @example measureEnduring('export function endure(val: Readonly<Type>): Type { try { return val } catch { throw new Error("fail") } }')
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasStrictChecks = hasPattern(content, /===|!==/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)

  if (hasDoc) score += 15
  if (hasExport) score += 15
  if (hasReturnType) score += 14
  if (hasGenerics) score += 14
  if (hasTryCatch) score += 14
  if (hasReadonly) score += 14
  if (hasStrictChecks) score += 14

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasAny) score -= 5
  if (hasEval) score -= 8

  const experimentalCount = hasVar
  const adHocCount = (hasAny ? 1 : 0) + (hasEval ? 1 : 0)

  const endurance = Math.min(100, Math.max(0, score))

  return {
    endurance,
    reign: classifyEnduringReign(endurance),
    hasHighEndurance: endurance >= 80,
    hasProven: hasTryCatch && hasReturnType,
    hasNoExperimental: experimentalCount === 0,
    hasMature: hasDoc && hasExport,
    hasNoNaive: !hasAny,
    hasEstablished: hasReturnType && hasConst,
    hasNoNovel: !hasEval,
    hasMaintained: hasDoc && hasReturnType,
    hasNoAbandoned: !hasEval,
    hasStable: hasConst && !hasAny,
    hasNoVolatile: !hasEval,
    hasPrincipled: hasGenerics && hasReturnType,
    hasNoAdHoc: adHocCount === 0,
    hasTimeless: hasReadonly && hasGenerics && !hasAny,
    hasNoFaddish: !hasAny,
    hasEnduring: hasDoc && hasExport && hasTryCatch,
    experimentalCount,
    adHocCount,
  }
}

// ─── analyzeIronJewel ───────────────────────────────────

/**
 * @example analyzeIronJewel(richContent, 'crown.ts')
 */
export function analyzeIronJewel(content: string, filePath: string): IronJewel {
  const forging = measureForging(content)
  const commanding = measureCommanding(content)
  const refining = measureRefining(content)
  const flexing = measureFlexing(content)
  const enduring = measureEnduring(content)

  const sovereignStrength = forging.strength
  const crownAuthority = commanding.authority
  const jewelPrecision = refining.precision
  const circletResilience = flexing.resilience
  const reignEndurance = enduring.endurance

  const qualityScore = Math.round(
    sovereignStrength * 0.2 +
    crownAuthority * 0.2 +
    jewelPrecision * 0.2 +
    circletResilience * 0.2 +
    reignEndurance * 0.2,
  )

  return {
    file: filePath,
    sovereignStrength,
    crownAuthority,
    jewelPrecision,
    circletResilience,
    reignEndurance,
    forging,
    commanding,
    refining,
    flexing,
    enduring,
    condition: classifyIronCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeIronThrone ──────────────────────────────────

/**
 * @example analyzeIronThrone(jewels, 'src')
 */
export function analyzeIronThrone(jewels: IronJewel[], dirPath: string): IronThrone {
  if (jewels.length === 0) {
    return {
      directory: dirPath,
      jewels: [],
      avgStrength: 0,
      avgPrecision: 0,
      avgEndurance: 0,
      imperialCrownCount: 0,
      voidCount: 0,
      throneType: 'no-throne',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(jewels.reduce((s, j) => s + j.sovereignStrength, 0) / jewels.length)
  const avgPrecision = Math.round(jewels.reduce((s, j) => s + j.jewelPrecision, 0) / jewels.length)
  const avgEndurance = Math.round(jewels.reduce((s, j) => s + j.reignEndurance, 0) / jewels.length)

  const imperialCrownCount = jewels.filter(j => j.condition === 'imperial-crown').length
  const voidCount = jewels.filter(j => j.condition === 'void').length

  const throneType = classifyThroneType(jewels)
  const overallAvg = Math.round((avgStrength + avgPrecision + avgEndurance) / 3)

  return {
    directory: dirPath,
    jewels,
    avgStrength,
    avgPrecision,
    avgEndurance,
    imperialCrownCount,
    voidCount,
    throneType,
    condition: classifyThroneCondition(overallAvg),
  }
}

// ─── generateRecommendations ────────────────────────────

/**
 * @example generateRecommendations(jewels, thrones, kingdom, stats)
 */
export function generateRecommendations(
  jewels: IronJewel[],
  thrones: IronThrone[],
  kingdom: IronKingdom,
  stats: IronStats,
): string[] {
  const recs: string[] = []

  if (kingdom.overallSovereignty >= 90 && stats.voidCount === 0) {
    recs.push('Your iron crown is forged to perfection! The sovereign rules with absolute authority and every jewel gleams with precision')
    return recs
  }

  if (stats.avgSovereignStrength < 50) {
    recs.push('Strengthen the iron foundations — add interfaces, generics, and structural patterns for sovereign power')
  }
  if (stats.avgCrownAuthority < 50) {
    recs.push('Assert crown authority — add exports, documentation, and clear APIs for decisive command')
  }
  if (stats.avgJewelPrecision < 50) {
    recs.push('Refine the jewels — use strict equality, type safety, and exact implementations')
  }
  if (stats.avgCircletResilience < 50) {
    recs.push('Fortify the circlet — add error handling, defensive patterns, and graceful recovery')
  }
  if (stats.avgReignEndurance < 50) {
    recs.push('Ensure the reign endures — use proven patterns, stable constructs, and principled design')
  }

  const broken = jewels.filter(j => j.condition === 'void' || j.condition === 'broken-crown')
  if (broken.length > 0 && broken.length <= 3) {
    recs.push(`Reforge these broken crowns: ${broken.map(j => j.file).join(', ')}`)
  } else if (broken.length > 3) {
    recs.push(`${broken.length} broken crowns need reforging — prioritize the weakest`)
  }

  const darkThrones = thrones.filter(t => t.throneType === 'dark-dungeon' || t.throneType === 'no-throne')
  if (darkThrones.length > 0) {
    recs.push(`${darkThrones.length} throne(s) lie in darkness — consider restructuring or removing dead code`)
  }

  if (!kingdom.isImperial) {
    recs.push('Overall sovereignty is below 60 — focus on forging stronger foundational code')
  }

  if (recs.length === 0) {
    recs.push('The iron crown endures — keep forging with sovereign quality')
  }

  return recs
}

// ─── gatherFiles ────────────────────────────────────────

/**
 * @example gatherFiles('/path', ['.ts'], ['ignore-patterns'])
 */
export async function gatherFiles(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  const patterns = extensions.map(ext => `**/*${ext}`)
  const entries = await fg(patterns, {
    cwd: rootDir,
    ignore: ignorePatterns,
    absolute: false,
    onlyFiles: true,
  })
  return entries.sort()
}

// ─── buildIronCrownResult ───────────────────────────────

/**
 * @example buildIronCrownResult(['a.ts'], [content])
 */
export async function buildIronCrownResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronCrownResult> {
  const jewels = files.map((file, i) =>
    analyzeIronJewel(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, IronJewel[]>()
  for (const j of jewels) {
    const dir = dirname(j.file) || '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(j)
    } else {
      dirMap.set(dir, [j])
    }
  }

  const thrones = Array.from(dirMap.entries()).map(([dir, js]) =>
    analyzeIronThrone(js, dir),
  )

  const totalFiles = jewels.length
  const avgSovereignStrength = totalFiles > 0 ? Math.round(jewels.reduce((s, j) => s + j.sovereignStrength, 0) / totalFiles) : 0
  const avgCrownAuthority = totalFiles > 0 ? Math.round(jewels.reduce((s, j) => s + j.crownAuthority, 0) / totalFiles) : 0
  const avgJewelPrecision = totalFiles > 0 ? Math.round(jewels.reduce((s, j) => s + j.jewelPrecision, 0) / totalFiles) : 0
  const avgCircletResilience = totalFiles > 0 ? Math.round(jewels.reduce((s, j) => s + j.circletResilience, 0) / totalFiles) : 0
  const avgReignEndurance = totalFiles > 0 ? Math.round(jewels.reduce((s, j) => s + j.reignEndurance, 0) / totalFiles) : 0

  const overallSovereignty = Math.round(
    (avgSovereignStrength + avgCrownAuthority + avgJewelPrecision + avgCircletResilience + avgReignEndurance) / 5,
  )

  const bestBy = (fn: (j: IronJewel) => number) =>
    jewels.length > 0 ? jewels.reduce((best, j) => fn(j) > fn(best) ? j : best).file : 'none'

  const stats: IronStats = {
    totalFiles,
    totalThrones: thrones.length,
    avgSovereignStrength,
    avgCrownAuthority,
    avgJewelPrecision,
    avgCircletResilience,
    avgReignEndurance,
    imperialCrownCount: jewels.filter(j => j.condition === 'imperial-crown').length,
    royalDiademCount: jewels.filter(j => j.condition === 'royal-diadem').length,
    properCircletCount: jewels.filter(j => j.condition === 'proper-circlet').length,
    tarnishedBandCount: jewels.filter(j => j.condition === 'tarnished-band').length,
    brokenCrownCount: jewels.filter(j => j.condition === 'broken-crown').length,
    voidCount: jewels.filter(j => j.condition === 'void').length,
    hasHighStrengthCount: jewels.filter(j => j.forging.hasHighStrength).length,
    hasHighAuthorityCount: jewels.filter(j => j.commanding.hasHighAuthority).length,
    hasHighPrecisionCount: jewels.filter(j => j.refining.hasHighPrecision).length,
    hasHighResilienceCount: jewels.filter(j => j.flexing.hasHighResilience).length,
    hasHighEnduranceCount: jewels.filter(j => j.enduring.hasHighEndurance).length,
    overallSovereignty,
    monarchGrade: classifyMonarchGrade(overallSovereignty),
    bestJewel: bestBy(j => j.qualityScore),
    strongest: bestBy(j => j.sovereignStrength),
    mostAuthoritative: bestBy(j => j.crownAuthority),
    mostPrecise: bestBy(j => j.jewelPrecision),
    mostResilient: bestBy(j => j.circletResilience),
    mostEnduring: bestBy(j => j.reignEndurance),
  }

  const kingdom: IronKingdom = {
    avgStrength: avgSovereignStrength,
    avgPrecision: avgJewelPrecision,
    avgEndurance: avgReignEndurance,
    isImperial: overallSovereignty >= 60,
    overallSovereignty,
  }

  const recommendations = generateRecommendations(jewels, thrones, kingdom, stats)

  return { jewels, thrones, kingdom, stats, recommendations }
}
