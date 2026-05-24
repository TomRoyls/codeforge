// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type HidingGrade = 'perfect-obsidian' | 'dark-glass' | 'proper-opacity' | 'translucent' | 'transparent' | 'no-boundary'
export type SecuringGate = 'impregnable-fortress' | 'strong-gate' | 'proper-barrier' | 'weak-fence' | 'open-portal' | 'no-security'
export type FlowingVoid = 'smooth-void' | 'proper-passage' | 'decent-flow' | 'rough-transit' | 'blocked-portal' | 'no-passage'
export type GuardingShadow = 'shadow-sentinel' | 'watchful-guard' | 'proper-watch' | 'sleeping-guard' | 'blind-watchman' | 'no-guard'
export type ArchingEthereal = 'elegant-arch' | 'beautiful-portal' | 'proper-entrance' | 'rough-doorway' | 'crude-hole' | 'no-entrance'
export type KeystoneCondition = 'obsidian-masterpiece' | 'dark-portal' | 'proper-gate' | 'iron-door' | 'wooden-gate' | 'gap-in-wall'
export type FortressType = 'dark-fortress' | 'obsidian-castle' | 'proper-fortress' | 'watchtower' | 'wooden-palisade' | 'no-fortress'
export type FortressCondition = 'impregnable-fortress' | 'dark-citadel' | 'decent-fortress' | 'weak-wall' | 'breached' | 'void'
export type WardenGrade = 'shadow-warden' | 'gate-commander' | 'skilled-guard' | 'apprentice' | 'novice' | 'gate-crasher'

export interface HidingMeasure {
  darkness: number
  grade: HidingGrade
  hasHighDarkness: boolean
  hasEncapsulated: boolean
  hasPrivateByDefault: boolean
  hasNoLeaked: boolean
  hasHiddenInternals: boolean
  hasNoExposedGuts: boolean
  hasSealed: boolean
  hasNoOpenInternals: boolean
  hasProtected: boolean
  hasNoPublicState: boolean
  hasOpaque: boolean
  leakedCount: number
  exposedGutsCount: number
}

export interface SecuringMeasure {
  security: number
  gate: SecuringGate
  hasHighSecurity: boolean
  hasInputValidation: boolean
  hasAccessControl: boolean
  hasNoUnprotected: boolean
  hasAuthentication: boolean
  hasNoAnonymous: boolean
  hasSanitization: boolean
  hasNoRawInput: boolean
  hasAuthorization: boolean
  hasNoPrivilegeEscalation: boolean
  hasGuarded: boolean
  unprotectedCount: number
  rawInputCount: number
}

export interface FlowingMeasure {
  passage: number
  void: FlowingVoid
  hasHighPassage: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasCleanInterfaces: boolean
  hasNoLeakyAbstractions: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  bottleneckCount: number
  circuitCount: number
}

export interface GuardingMeasure {
  guard: number
  shadow: GuardingShadow
  hasHighGuard: boolean
  hasBoundaryChecks: boolean
  hasTypeGuards: boolean
  hasNoCasting: boolean
  hasNullChecks: boolean
  hasNoAssumption: boolean
  hasEdgeCaseHandling: boolean
  hasNoUncovered: boolean
  hasErrorBoundaries: boolean
  hasNoUnguarded: boolean
  hasValidated: boolean
  castingCount: number
  assumptionCount: number
}

export interface ArchingMeasure {
  boundary: number
  ethereal: ArchingEthereal
  hasHighBoundary: boolean
  hasCleanInterface: boolean
  hasWellDesignedAPI: boolean
  hasNoClunky: boolean
  hasIntuitive: boolean
  hasNoHostile: boolean
  hasGraceful: boolean
  hasNoUgly: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasElegant: boolean
  clunkyCount: number
  hostileCount: number
}

export interface ObsidianKeystone {
  file: string
  thresholdDarkness: number
  gateSecurity: number
  voidPassage: number
  shadowGuard: number
  etherealBoundary: number
  hiding: HidingMeasure
  securing: SecuringMeasure
  flowing: FlowingMeasure
  guarding: GuardingMeasure
  arching: ArchingMeasure
  condition: KeystoneCondition
  qualityScore: number
}

export interface GateFortress {
  directory: string
  keystones: ObsidianKeystone[]
  avgDarkness: number
  avgSecurity: number
  avgBoundary: number
  obsidianMasterpieceCount: number
  gapInWallCount: number
  fortressType: FortressType
  condition: FortressCondition
}

export interface ObsidianRealm {
  avgDarkness: number
  avgSecurity: number
  avgBoundary: number
  isImpregnable: boolean
  overallFortification: number
}

export interface ObsidianGateStats {
  totalFiles: number
  totalFortresses: number
  avgThresholdDarkness: number
  avgGateSecurity: number
  avgVoidPassage: number
  avgShadowGuard: number
  avgEtherealBoundary: number
  obsidianMasterpieceCount: number
  darkPortalCount: number
  properGateCount: number
  ironDoorCount: number
  woodenGateCount: number
  gapInWallCount: number
  hasHighDarknessCount: number
  hasHighSecurityCount: number
  hasHighPassageCount: number
  hasHighGuardCount: number
  hasHighBoundaryCount: number
  overallFortification: number
  wardenGrade: WardenGrade
  bestKeystone: string
  mostEncapsulated: string
  mostSecure: string
  smoothestFlow: string
  bestGuarded: string
}

export interface ObsidianGateResult {
  keystones: ObsidianKeystone[]
  fortresses: GateFortress[]
  realm: ObsidianRealm
  stats: ObsidianGateStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const countMatches = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure threshold darkness (encapsulation quality)
 * @example
 * const m = measureHiding(content)
 * console.log(m.grade) // 'perfect-obsidian'
 */
export function measureHiding(content: string): HidingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasEncapsulated = hasExport(content) && hasInterface(content) && hasReadonly(content)
  const hasPrivateByDefault = hasPrivate(content) && hasClass(content)
  const hasHiddenInternals = hasReadonly(content) && hasPrivate(content)
  const hasSealed = hasEnum(content) && hasOptional(content)
  const hasProtected = hasGenerics(content) && hasInterface(content)
  const hasOpaque = hasConst(content) && hasReadonly(content)

  score += hasEncapsulated ? 5 : 0
  score += hasPrivateByDefault ? 5 : 0
  score += hasHiddenInternals ? 5 : 0
  score += hasSealed ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasOpaque ? 5 : 0

  const darkness = Math.min(score, 100)
  const leakedCount = countMatches(/\bvar\b/, content)
  const exposedGutsCount = countMatches(/\bany\b/, content)

  const hasNoLeaked = leakedCount === 0
  const hasNoExposedGuts = exposedGutsCount === 0
  const hasNoOpenInternals = !has(/\beval\b/, content)
  const hasNoPublicState = !has(/\bdebugger\b/, content)
  const hasHighDarkness = darkness >= 70

  let grade: HidingGrade
  if (darkness >= 85) grade = 'perfect-obsidian'
  else if (darkness >= 70) grade = 'dark-glass'
  else if (darkness >= 55) grade = 'proper-opacity'
  else if (darkness >= 40) grade = 'translucent'
  else if (darkness >= 25) grade = 'transparent'
  else grade = 'no-boundary'

  return {
    darkness, grade, hasHighDarkness, hasEncapsulated, hasPrivateByDefault,
    hasNoLeaked, hasHiddenInternals, hasNoExposedGuts, hasSealed,
    hasNoOpenInternals, hasProtected, hasNoPublicState, hasOpaque,
    leakedCount, exposedGutsCount,
  }
}

/**
 * Measure gate security (access control strength)
 * @example
 * const m = measureSecuring(content)
 * console.log(m.gate) // 'impregnable-fortress'
 */
export function measureSecuring(content: string): SecuringMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 4 : 0

  const hasInputValidation = hasStrictEq(content) && hasTryCatch(content)
  const hasAccessControl = hasThrow(content) && hasConditional(content)
  const hasSanitization = hasInterface(content) && hasOptional(content)
  const hasAuthorization = hasConst(content) && hasReadonly(content)
  const hasGuarded = hasEnum(content) && hasPrivate(content)
  const hasAuthentication = hasNullishCoalescing(content) && hasReturnType(content)

  score += hasInputValidation ? 5 : 0
  score += hasAccessControl ? 5 : 0
  score += hasSanitization ? 5 : 0
  score += hasAuthorization ? 5 : 0
  score += hasGuarded ? 5 : 0
  score += hasAuthentication ? 5 : 0

  const security = Math.min(score, 100)
  const unprotectedCount = countMatches(/\bvar\b/, content)
  const rawInputCount = countMatches(/\bany\b/, content)

  const hasNoUnprotected = unprotectedCount === 0
  const hasNoAnonymous = !has(/\beval\b/, content)
  const hasNoRawInput = rawInputCount === 0
  const hasNoPrivilegeEscalation = !has(/\bdebugger\b/, content)
  const hasHighSecurity = security >= 70

  let gate: SecuringGate
  if (security >= 85) gate = 'impregnable-fortress'
  else if (security >= 70) gate = 'strong-gate'
  else if (security >= 55) gate = 'proper-barrier'
  else if (security >= 40) gate = 'weak-fence'
  else if (security >= 25) gate = 'open-portal'
  else gate = 'no-security'

  return {
    security, gate, hasHighSecurity, hasInputValidation, hasAccessControl,
    hasNoUnprotected, hasAuthentication, hasNoAnonymous, hasSanitization,
    hasNoRawInput, hasAuthorization, hasNoPrivilegeEscalation, hasGuarded,
    unprotectedCount, rawInputCount,
  }
}

/**
 * Measure void passage (data flow through boundaries)
 * @example
 * const m = measureFlowing(content)
 * console.log(m.void) // 'smooth-void'
 */
export function measureFlowing(content: string): FlowingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 4 : 0
  score += hasNullishCoalescing(content) ? 4 : 0

  const hasEfficientFlow = hasExport(content) && hasNamedExport(content)
  const hasStreamlined = hasReturnType(content) && hasInterface(content)
  const hasCleanInterfaces = hasConst(content) && hasAsync(content)
  const hasDirectPaths = hasArrowFunction(content) && hasMapFunction(content)
  const hasOptimized = hasGenerics(content) && hasOptional(content)
  const hasSmoothDataFlow = hasTypeAlias(content) && hasNullishCoalescing(content)

  score += hasEfficientFlow ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasCleanInterfaces ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasSmoothDataFlow ? 5 : 0

  const passage = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const circuitCount = countMatches(/\beval\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoCircuits = circuitCount === 0
  const hasNoLeakyAbstractions = countMatches(/\bany\b/, content) === 0
  const hasNoIndirection = !has(/\bdebugger\b/, content)
  const hasHighPassage = passage >= 70

  let voidGrade: FlowingVoid
  if (passage >= 85) voidGrade = 'smooth-void'
  else if (passage >= 70) voidGrade = 'proper-passage'
  else if (passage >= 55) voidGrade = 'decent-flow'
  else if (passage >= 40) voidGrade = 'rough-transit'
  else if (passage >= 25) voidGrade = 'blocked-portal'
  else voidGrade = 'no-passage'

  return {
    passage, void: voidGrade, hasHighPassage, hasEfficientFlow, hasNoBottlenecks,
    hasStreamlined, hasNoCircuits, hasCleanInterfaces, hasNoLeakyAbstractions,
    hasDirectPaths, hasNoIndirection, hasOptimized, hasNoWasteful: hasNoLeakyAbstractions,
    bottleneckCount, circuitCount,
  }
}

/**
 * Measure shadow guard (boundary validation)
 * @example
 * const m = measureGuarding(content)
 * console.log(m.shadow) // 'shadow-sentinel'
 */
export function measureGuarding(content: string): GuardingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConditional(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasBoundaryChecks = hasStrictEq(content) && hasConditional(content)
  const hasTypeGuards = hasInterface(content) && hasReturnType(content)
  const hasNullChecks = hasOptional(content) && hasNullishCoalescing(content)
  const hasEdgeCaseHandling = hasTryCatch(content) && hasThrow(content)
  const hasErrorBoundaries = hasEnum(content) && hasReadonly(content)
  const hasValidated = hasGenerics(content) && hasPrivate(content)

  score += hasBoundaryChecks ? 5 : 0
  score += hasTypeGuards ? 5 : 0
  score += hasNullChecks ? 5 : 0
  score += hasEdgeCaseHandling ? 5 : 0
  score += hasErrorBoundaries ? 5 : 0
  score += hasValidated ? 5 : 0

  const guard = Math.min(score, 100)
  const castingCount = countMatches(/\bvar\b/, content)
  const assumptionCount = countMatches(/\beval\b/, content)

  const hasNoCasting = castingCount === 0
  const hasNoAssumption = assumptionCount === 0
  const hasNoUncovered = countMatches(/\bany\b/, content) === 0
  const hasNoUnguarded = !has(/\bdebugger\b/, content)
  const hasHighGuard = guard >= 70

  let shadow: GuardingShadow
  if (guard >= 85) shadow = 'shadow-sentinel'
  else if (guard >= 70) shadow = 'watchful-guard'
  else if (guard >= 55) shadow = 'proper-watch'
  else if (guard >= 40) shadow = 'sleeping-guard'
  else if (guard >= 25) shadow = 'blind-watchman'
  else shadow = 'no-guard'

  return {
    guard, shadow, hasHighGuard, hasBoundaryChecks, hasTypeGuards,
    hasNoCasting, hasNullChecks, hasNoAssumption, hasEdgeCaseHandling,
    hasNoUncovered, hasErrorBoundaries, hasNoUnguarded, hasValidated,
    castingCount, assumptionCount,
  }
}

/**
 * Measure ethereal boundary (interface elegance)
 * @example
 * const m = measureArching(content)
 * console.log(m.ethereal) // 'elegant-arch'
 */
export function measureArching(content: string): ArchingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasCleanInterface = hasDocComments(content) && hasExport(content)
  const hasWellDesignedAPI = hasInterface(content) && hasReturnType(content)
  const hasIntuitive = hasTypeAlias(content) && hasNamedExport(content)
  const hasGraceful = hasEnum(content) && hasConst(content)
  const hasApproachable = hasStrictEq(content) && hasGenerics(content)
  const hasElegant = hasAsync(content) && hasPrivate(content)

  score += hasCleanInterface ? 5 : 0
  score += hasWellDesignedAPI ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasElegant ? 5 : 0

  const boundary = Math.min(score, 100)
  const clunkyCount = countMatches(/\bvar\b/, content)
  const hostileCount = countMatches(/\beval\b/, content)

  const hasNoClunky = clunkyCount === 0
  const hasNoHostile = hostileCount === 0
  const hasNoUgly = countMatches(/\bany\b/, content) === 0
  const hasNoIntimidating = !has(/\bdebugger\b/, content)
  const hasHighBoundary = boundary >= 70

  let ethereal: ArchingEthereal
  if (boundary >= 85) ethereal = 'elegant-arch'
  else if (boundary >= 70) ethereal = 'beautiful-portal'
  else if (boundary >= 55) ethereal = 'proper-entrance'
  else if (boundary >= 40) ethereal = 'rough-doorway'
  else if (boundary >= 25) ethereal = 'crude-hole'
  else ethereal = 'no-entrance'

  return {
    boundary, ethereal, hasHighBoundary, hasCleanInterface, hasWellDesignedAPI,
    hasNoClunky, hasIntuitive, hasNoHostile, hasGraceful, hasNoUgly,
    hasApproachable, hasNoIntimidating, hasElegant,
    clunkyCount, hostileCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify keystone condition
 * @example
 * classifyKeystoneCondition(90) // 'obsidian-masterpiece'
 */
export function classifyKeystoneCondition(score: number): KeystoneCondition {
  if (score >= 85) return 'obsidian-masterpiece'
  if (score >= 70) return 'dark-portal'
  if (score >= 55) return 'proper-gate'
  if (score >= 40) return 'iron-door'
  if (score >= 25) return 'wooden-gate'
  return 'gap-in-wall'
}

/**
 * Classify fortress type
 * @example
 * classifyFortressType(keystones) // 'dark-fortress'
 */
export function classifyFortressType(keystones: ObsidianKeystone[]): FortressType {
  if (keystones.length === 0) return 'no-fortress'
  const avgQs = Math.round(keystones.reduce((s, k) => s + k.qualityScore, 0) / keystones.length)
  const masterpieceRatio = keystones.filter(k => k.condition === 'obsidian-masterpiece').length / keystones.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'dark-fortress'
  if (avgQs >= 60) return 'obsidian-castle'
  if (avgQs >= 45) return 'proper-fortress'
  if (avgQs >= 30) return 'watchtower'
  if (avgQs >= 15) return 'wooden-palisade'
  return 'no-fortress'
}

/**
 * Classify fortress condition
 * @example
 * classifyFortressCondition(80) // 'impregnable-fortress'
 */
export function classifyFortressCondition(avgQs: number): FortressCondition {
  if (avgQs >= 75) return 'impregnable-fortress'
  if (avgQs >= 60) return 'dark-citadel'
  if (avgQs >= 45) return 'decent-fortress'
  if (avgQs >= 30) return 'weak-wall'
  if (avgQs >= 15) return 'breached'
  return 'void'
}

/**
 * Classify warden grade
 * @example
 * classifyWardenGrade(85) // 'shadow-warden'
 */
export function classifyWardenGrade(avgFortification: number): WardenGrade {
  if (avgFortification >= 80) return 'shadow-warden'
  if (avgFortification >= 65) return 'gate-commander'
  if (avgFortification >= 50) return 'skilled-guard'
  if (avgFortification >= 35) return 'apprentice'
  if (avgFortification >= 20) return 'novice'
  return 'gate-crasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(keystones, fortresses, realm, stats)
 */
export function generateRecommendations(
  keystones: ObsidianKeystone[],
  fortresses: GateFortress[],
  realm: ObsidianRealm,
  stats: ObsidianGateStats,
): string[] {
  const recs: string[] = []
  if (stats.avgThresholdDarkness < 50) {
    recs.push('Deepen threshold darkness with stronger encapsulation, readonly modifiers, and private access')
  }
  if (stats.avgGateSecurity < 50) {
    recs.push('Strengthen gate security with error handling, strict equality, and access control patterns')
  }
  if (stats.avgVoidPassage < 50) {
    recs.push('Improve void passage with cleaner data flow, streamlined interfaces, and efficient exports')
  }
  if (stats.avgShadowGuard < 50) {
    recs.push('Enhance shadow guard with boundary checks, type guards, null checks, and edge case handling')
  }
  if (stats.avgEtherealBoundary < 50) {
    recs.push('Refine ethereal boundary with documentation, clean interfaces, and elegant type designs')
  }
  if (stats.gapInWallCount > 0) {
    recs.push(`${stats.gapInWallCount} file(s) are gaps in the wall — they need complete gate construction`)
  }
  if (realm.overallFortification < 40) {
    recs.push('Overall fortification is dangerously low — focus on darkness and security first')
  }
  const allWeak = fortresses.every(f => f.fortressType === 'no-fortress' || f.fortressType === 'wooden-palisade')
  if (allWeak && fortresses.length > 0) {
    recs.push('All fortresses are weak — consider a major security reconstruction')
  }
  const gapFiles = keystones.filter(k => k.condition === 'gap-in-wall').map(k => k.file)
  if (gapFiles.length > 0 && gapFiles.length <= 3) {
    recs.push(`Seal these gaps immediately: ${gapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The obsidian gate stands impenetrable! Every threshold is sealed, every guard vigilant, every boundary elegant')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as obsidian keystone
 * @example
 * const keystone = analyzeObsidianKeystone(content, 'index.ts')
 * console.log(keystone.condition) // 'obsidian-masterpiece'
 */
export function analyzeObsidianKeystone(content: string, filePath: string): ObsidianKeystone {
  const hiding = measureHiding(content)
  const securing = measureSecuring(content)
  const flowing = measureFlowing(content)
  const guarding = measureGuarding(content)
  const arching = measureArching(content)

  const qualityScore = Math.round(
    hiding.darkness * 0.2 +
    securing.security * 0.2 +
    flowing.passage * 0.2 +
    guarding.guard * 0.2 +
    arching.boundary * 0.2,
  )

  return {
    file: filePath,
    thresholdDarkness: hiding.darkness,
    gateSecurity: securing.security,
    voidPassage: flowing.passage,
    shadowGuard: guarding.guard,
    etherealBoundary: arching.boundary,
    hiding, securing, flowing, guarding, arching,
    condition: classifyKeystoneCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as gate fortress
 * @example
 * const fortress = analyzeGateFortress(keystones, 'src')
 * console.log(fortress.fortressType) // 'dark-fortress'
 */
export function analyzeGateFortress(keystones: ObsidianKeystone[], dirPath: string): GateFortress {
  if (keystones.length === 0) {
    return {
      directory: dirPath, keystones: [], avgDarkness: 0, avgSecurity: 0,
      avgBoundary: 0, obsidianMasterpieceCount: 0, gapInWallCount: 0,
      fortressType: 'no-fortress', condition: 'void',
    }
  }

  const avgDarkness = Math.round(keystones.reduce((s, k) => s + k.thresholdDarkness, 0) / keystones.length)
  const avgSecurity = Math.round(keystones.reduce((s, k) => s + k.gateSecurity, 0) / keystones.length)
  const avgBoundary = Math.round(keystones.reduce((s, k) => s + k.etherealBoundary, 0) / keystones.length)
  const obsidianMasterpieceCount = keystones.filter(k => k.condition === 'obsidian-masterpiece').length
  const gapInWallCount = keystones.filter(k => k.condition === 'gap-in-wall').length
  const avgQs = Math.round(keystones.reduce((s, k) => s + k.qualityScore, 0) / keystones.length)

  return {
    directory: dirPath, keystones, avgDarkness, avgSecurity, avgBoundary,
    obsidianMasterpieceCount, gapInWallCount,
    fortressType: classifyFortressType(keystones),
    condition: classifyFortressCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete obsidian gate result
 * @example
 * const result = await buildObsidianGateResult(files, contents)
 * console.log(result.stats.wardenGrade) // 'shadow-warden'
 */
export async function buildObsidianGateResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianGateResult> {
  const keystones = files.map((file, i) => analyzeObsidianKeystone(contents[i] ?? '', file))

  const dirMap = new Map<string, ObsidianKeystone[]>()
  for (const keystone of keystones) {
    const dir = path.dirname(keystone.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(keystone) } else { dirMap.set(dir, [keystone]) }
  }

  const fortresses = Array.from(dirMap.entries()).map(([dir, dirKeystones]) =>
    analyzeGateFortress(dirKeystones, dir),
  )

  const avgDarkness = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.thresholdDarkness, 0) / keystones.length) : 0
  const avgSecurity = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.gateSecurity, 0) / keystones.length) : 0
  const avgBoundary = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.etherealBoundary, 0) / keystones.length) : 0

  const overallFortification = keystones.length > 0
    ? Math.round((avgDarkness + avgSecurity + avgBoundary) / 3) : 0
  const isImpregnable = avgDarkness >= 60

  const realm: ObsidianRealm = { avgDarkness, avgSecurity, avgBoundary, isImpregnable, overallFortification }

  const avgVoidPassage = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.voidPassage, 0) / keystones.length) : 0
  const avgShadowGuard = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.shadowGuard, 0) / keystones.length) : 0
  const avgEtherealBoundary = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.etherealBoundary, 0) / keystones.length) : 0

  const bestKeystone = keystones.length > 0
    ? keystones.reduce((best, k) => k.qualityScore > best.qualityScore ? k : best).file : ''
  const mostEncapsulated = keystones.length > 0
    ? keystones.reduce((best, k) => k.thresholdDarkness > best.thresholdDarkness ? k : best).file : ''
  const mostSecure = keystones.length > 0
    ? keystones.reduce((best, k) => k.gateSecurity > best.gateSecurity ? k : best).file : ''
  const smoothestFlow = keystones.length > 0
    ? keystones.reduce((best, k) => k.voidPassage > best.voidPassage ? k : best).file : ''
  const bestGuarded = keystones.length > 0
    ? keystones.reduce((best, k) => k.shadowGuard > best.shadowGuard ? k : best).file : ''

  const stats: ObsidianGateStats = {
    totalFiles: keystones.length,
    totalFortresses: fortresses.length,
    avgThresholdDarkness: avgDarkness,
    avgGateSecurity: avgSecurity,
    avgVoidPassage,
    avgShadowGuard,
    avgEtherealBoundary,
    obsidianMasterpieceCount: keystones.filter(k => k.condition === 'obsidian-masterpiece').length,
    darkPortalCount: keystones.filter(k => k.condition === 'dark-portal').length,
    properGateCount: keystones.filter(k => k.condition === 'proper-gate').length,
    ironDoorCount: keystones.filter(k => k.condition === 'iron-door').length,
    woodenGateCount: keystones.filter(k => k.condition === 'wooden-gate').length,
    gapInWallCount: keystones.filter(k => k.condition === 'gap-in-wall').length,
    hasHighDarknessCount: keystones.filter(k => k.hiding.hasHighDarkness).length,
    hasHighSecurityCount: keystones.filter(k => k.securing.hasHighSecurity).length,
    hasHighPassageCount: keystones.filter(k => k.flowing.hasHighPassage).length,
    hasHighGuardCount: keystones.filter(k => k.guarding.hasHighGuard).length,
    hasHighBoundaryCount: keystones.filter(k => k.arching.hasHighBoundary).length,
    overallFortification,
    wardenGrade: classifyWardenGrade(overallFortification),
    bestKeystone, mostEncapsulated, mostSecure, smoothestFlow, bestGuarded,
  }

  const recommendations = generateRecommendations(keystones, fortresses, realm, stats)

  return { keystones, fortresses, realm, stats, recommendations }
}

/**
 * Gather files matching patterns
 * @example
 * const files = gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string, exts: string[], ignore: string[],
): Promise<string[]> {
  const extensions = exts.length > 0 ? exts : ['.ts', '.js', '.tsx', '.jsx']
  const patterns = extensions.map(ext => `**/*${ext}`)
  const ignorePatterns = ignore.length > 0 ? ignore : ['**/node_modules/**', '**/dist/**', '**/.git/**']
  const entries = await fg(patterns, { cwd: targetPath, ignore: ignorePatterns, absolute: true })
  return Array.from(new Set(entries)).sort()
}
