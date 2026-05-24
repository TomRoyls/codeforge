// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ArchGrade = 'divine-arch' | 'master-threshold' | 'proper-gate' | 'rough-entrance' | 'broken-door' | 'no-threshold'
export type GatewayGrade = 'impregnable-gate' | 'strong-portal' | 'proper-gate' | 'weak-door' | 'open-portal' | 'no-gate'
export type SpiritGrade = 'swift-passage' | 'smooth-traversal' | 'proper-flow' | 'slow-passage' | 'blocked-path' | 'no-traversal'
export type ShadowGrade = 'eternal-sentinel' | 'watchful-guardian' | 'proper-watch' | 'sleeping-guard' | 'blind-watchman' | 'no-guard'
export type EtherealGrade = 'seamless-crossing' | 'graceful-passage' | 'proper-transition' | 'abrupt-shift' | 'jarring-change' | 'no-passage'
export type KeystoneCondition = 'divine-portal' | 'phantom-gateway' | 'proper-gate' | 'wooden-door' | 'broken-arch' | 'rubble'
export type ArchType = 'grand-portal' | 'proper-archway' | 'decent-gate' | 'narrow-door' | 'hole-in-wall' | 'no-arch'
export type ArchCondition = 'magnificent-gateway' | 'strong-portal' | 'decent-entrance' | 'rusted-gate' | 'collapsed' | 'void'
export type KeeperGrade = 'gatekeeper-supreme' | 'master-guardian' | 'skilled-watchman' | 'apprentice' | 'novice' | 'gate-crasher'

export interface ArchingMeasure {
  quality: number
  grade: ArchGrade
  hasHighQuality: boolean
  hasClearInterface: boolean
  hasWellDefinedAPI: boolean
  hasNoVagueBoundary: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTyped: boolean
  hasNoUntyped: boolean
  hasExplicit: boolean
  hasNoImplicit: boolean
  hasStructured: boolean
  vagueBoundaryCount: number
  untypedCount: number
}

export interface GuardingMeasure {
  security: number
  gateway: GatewayGrade
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

export interface TraversingMeasure {
  traversal: number
  spirit: SpiritGrade
  hasHighTraversal: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasOptimized: boolean
  hasNoUnoptimized: boolean
  hasClean: boolean
  hasNoCluttered: boolean
  bottleneckCount: number
  circuitCount: number
}

export interface WatchingMeasure {
  guardian: number
  shadow: ShadowGrade
  hasHighGuardian: boolean
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

export interface TransitioningMeasure {
  passage: number
  ethereal: EtherealGrade
  hasHighPassage: boolean
  hasGracefulTransitions: boolean
  hasSmoothFlows: boolean
  hasNoJarring: boolean
  hasProgressive: boolean
  hasNoAllAtOnce: boolean
  hasSequenced: boolean
  hasNoUnordered: boolean
  hasManaged: boolean
  hasNoSudden: boolean
  hasFlowing: boolean
  jarringCount: number
  suddenCount: number
}

export interface GateKeystone {
  file: string
  thresholdQuality: number
  gatewaySecurity: number
  spiritTraversal: number
  shadowGuardian: number
  etherealPassage: number
  arching: ArchingMeasure
  guarding: GuardingMeasure
  traversing: TraversingMeasure
  watching: WatchingMeasure
  transitioning: TransitioningMeasure
  condition: KeystoneCondition
  qualityScore: number
}

export interface GateArch {
  directory: string
  keystones: GateKeystone[]
  avgQuality: number
  avgSecurity: number
  avgPassage: number
  divinePortalCount: number
  rubbleCount: number
  archType: ArchType
  condition: ArchCondition
}

export interface PhantomGateway {
  avgQuality: number
  avgSecurity: number
  avgPassage: number
  isImpregnable: boolean
  overallFortification: number
}

export interface PhantomGateStats {
  totalFiles: number
  totalArches: number
  avgThresholdQuality: number
  avgGatewaySecurity: number
  avgSpiritTraversal: number
  avgShadowGuardian: number
  avgEtherealPassage: number
  divinePortalCount: number
  phantomGatewayCount: number
  properGateCount: number
  woodenDoorCount: number
  brokenArchCount: number
  rubbleCount: number
  hasHighQualityCount: number
  hasHighSecurityCount: number
  hasHighTraversalCount: number
  hasHighGuardianCount: number
  hasHighPassageCount: number
  overallFortification: number
  keeperGrade: KeeperGrade
  bestKeystone: string
  bestThreshold: string
  mostSecure: string
  smoothestTraversal: string
  bestGuardian: string
}

export interface PhantomGateResult {
  keystones: GateKeystone[]
  arches: GateArch[]
  gateway: PhantomGateway
  stats: PhantomGateStats
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
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure threshold quality (boundary/interface quality)
 * @example
 * const m = measureArching(content)
 * console.log(m.grade) // 'divine-arch'
 */
export function measureArching(content: string): ArchingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0

  const hasClearInterface = hasInterface(content) && hasTypeAlias(content)
  const hasWellDefinedAPI = hasExport(content) && hasNamedExport(content)
  const hasDocumented = hasReturnType(content) && hasGenerics(content)
  const hasTyped = hasDocComments(content) && hasEnum(content)
  const hasExplicit = hasReadonly(content) && hasOptional(content)
  const hasStructured = hasPrivate(content) && hasUnionType(content)

  score += hasClearInterface ? 5 : 0
  score += hasWellDefinedAPI ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasTyped ? 5 : 0
  score += hasExplicit ? 5 : 0
  score += hasStructured ? 5 : 0

  const quality = Math.min(score, 100)
  const vagueBoundaryCount = countMatches(/\bvar\b/, content)
  const untypedCount = countMatches(/\bany\b/, content)

  const hasNoVagueBoundary = vagueBoundaryCount === 0
  const hasNoUndocumented = untypedCount === 0
  const hasNoUntyped = hasNoUndocumented
  const hasNoImplicit = !has(/\beval\b/, content)
  const hasHighQuality = quality >= 70

  let grade: ArchGrade
  if (quality >= 85) grade = 'divine-arch'
  else if (quality >= 70) grade = 'master-threshold'
  else if (quality >= 55) grade = 'proper-gate'
  else if (quality >= 40) grade = 'rough-entrance'
  else if (quality >= 25) grade = 'broken-door'
  else grade = 'no-threshold'

  return {
    quality, grade, hasHighQuality, hasClearInterface, hasWellDefinedAPI,
    hasNoVagueBoundary, hasDocumented, hasNoUndocumented, hasTyped, hasNoUntyped,
    hasExplicit, hasNoImplicit, hasStructured, vagueBoundaryCount, untypedCount,
  }
}

/**
 * Measure gateway security (access control)
 * @example
 * const m = measureGuarding(content)
 * console.log(m.gateway) // 'impregnable-gate'
 */
export function measureGuarding(content: string): GuardingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasInputValidation = hasTryCatch(content) && hasThrow(content)
  const hasAccessControl = hasStrictEq(content) && hasReturnType(content)
  const hasAuthentication = hasInterface(content) && hasConst(content)
  const hasSanitization = hasAsync(content) && hasNullishCoalescing(content)
  const hasAuthorization = hasDefaultParam(content) && hasOptional(content)
  const hasGuarded = hasPrivate(content) && hasEnum(content)

  score += hasInputValidation ? 5 : 0
  score += hasAccessControl ? 5 : 0
  score += hasAuthentication ? 5 : 0
  score += hasSanitization ? 5 : 0
  score += hasAuthorization ? 5 : 0
  score += hasGuarded ? 5 : 0

  const security = Math.min(score, 100)
  const unprotectedCount = countMatches(/\bvar\b/, content)
  const rawInputCount = countMatches(/\bany\b/, content)

  const hasNoUnprotected = unprotectedCount === 0
  const hasNoAnonymous = rawInputCount === 0
  const hasNoRawInput = hasNoAnonymous
  const hasNoPrivilegeEscalation = !has(/\beval\b/, content)
  const hasHighSecurity = security >= 70

  let gateway: GatewayGrade
  if (security >= 85) gateway = 'impregnable-gate'
  else if (security >= 70) gateway = 'strong-portal'
  else if (security >= 55) gateway = 'proper-gate'
  else if (security >= 40) gateway = 'weak-door'
  else if (security >= 25) gateway = 'open-portal'
  else gateway = 'no-gate'

  return {
    security, gateway, hasHighSecurity, hasInputValidation, hasAccessControl,
    hasNoUnprotected, hasAuthentication, hasNoAnonymous, hasSanitization,
    hasNoRawInput, hasAuthorization, hasNoPrivilegeEscalation, hasGuarded,
    unprotectedCount, rawInputCount,
  }
}

/**
 * Measure spirit traversal (data flow through boundaries)
 * @example
 * const m = measureTraversing(content)
 * console.log(m.spirit) // 'swift-passage'
 */
export function measureTraversing(content: string): TraversingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasMapFunction(content) ? 8 : 0
  score += hasArrowFunction(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasEfficientFlow = hasExport(content) && hasImport(content)
  const hasStreamlined = hasMapFunction(content) && hasArrowFunction(content)
  const hasDirectPaths = hasAsync(content) && hasConst(content)
  const hasOptimized = hasReturnType(content) && hasInterface(content)
  const hasClean = hasGenerics(content) && hasNamedExport(content)
  const hasNoCircuits = hasTypeAlias(content) && hasOptional(content)

  score += hasEfficientFlow ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasNoCircuits ? 5 : 0

  const traversal = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const circuitCount = countMatches(/\bany\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoIndirection = circuitCount === 0
  const hasNoUnoptimized = !has(/\beval\b/, content)
  const hasNoCluttered = !has(/\bdebugger\b/, content)
  const hasHighTraversal = traversal >= 70

  let spirit: SpiritGrade
  if (traversal >= 85) spirit = 'swift-passage'
  else if (traversal >= 70) spirit = 'smooth-traversal'
  else if (traversal >= 55) spirit = 'proper-flow'
  else if (traversal >= 40) spirit = 'slow-passage'
  else if (traversal >= 25) spirit = 'blocked-path'
  else spirit = 'no-traversal'

  return {
    traversal, spirit, hasHighTraversal, hasEfficientFlow, hasNoBottlenecks,
    hasStreamlined, hasNoCircuits, hasDirectPaths, hasNoIndirection, hasOptimized,
    hasNoUnoptimized, hasClean, hasNoCluttered, bottleneckCount, circuitCount,
  }
}

/**
 * Measure shadow guardian (validation at boundaries)
 * @example
 * const m = measureWatching(content)
 * console.log(m.shadow) // 'eternal-sentinel'
 */
export function measureWatching(content: string): WatchingMeasure {
  let score = 0
  score += hasConditional(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasBoundaryChecks = hasConditional(content) && hasStrictEq(content)
  const hasTypeGuards = hasTryCatch(content) && hasThrow(content)
  const hasNullChecks = hasReturnType(content) && hasInterface(content)
  const hasEdgeCaseHandling = hasNullishCoalescing(content) && hasOptional(content)
  const hasErrorBoundaries = hasReadonly(content) && hasEnum(content)
  const hasValidated = hasConst(content) && hasAsync(content)

  score += hasBoundaryChecks ? 5 : 0
  score += hasTypeGuards ? 5 : 0
  score += hasNullChecks ? 5 : 0
  score += hasEdgeCaseHandling ? 5 : 0
  score += hasErrorBoundaries ? 5 : 0
  score += hasValidated ? 5 : 0

  const guardian = Math.min(score, 100)
  const castingCount = countMatches(/\bvar\b/, content)
  const assumptionCount = countMatches(/\bany\b/, content)

  const hasNoCasting = castingCount === 0
  const hasNoAssumption = assumptionCount === 0
  const hasNoUncovered = !has(/\beval\b/, content)
  const hasNoUnguarded = !has(/\bdebugger\b/, content)
  const hasHighGuardian = guardian >= 70

  let shadow: ShadowGrade
  if (guardian >= 85) shadow = 'eternal-sentinel'
  else if (guardian >= 70) shadow = 'watchful-guardian'
  else if (guardian >= 55) shadow = 'proper-watch'
  else if (guardian >= 40) shadow = 'sleeping-guard'
  else if (guardian >= 25) shadow = 'blind-watchman'
  else shadow = 'no-guard'

  return {
    guardian, shadow, hasHighGuardian, hasBoundaryChecks, hasTypeGuards,
    hasNoCasting, hasNullChecks, hasNoAssumption, hasEdgeCaseHandling,
    hasNoUncovered, hasErrorBoundaries, hasNoUnguarded, hasValidated,
    castingCount, assumptionCount,
  }
}

/**
 * Measure ethereal passage (graceful transitions)
 * @example
 * const m = measureTransitioning(content)
 * console.log(m.ethereal) // 'seamless-crossing'
 */
export function measureTransitioning(content: string): TransitioningMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0

  const hasGracefulTransitions = hasTryCatch(content) && hasAsync(content)
  const hasSmoothFlows = hasThrow(content) && hasNullishCoalescing(content)
  const hasProgressive = hasDefaultParam(content) && hasOptional(content)
  const hasSequenced = hasConditional(content) && hasConst(content)
  const hasManaged = hasReturnType(content) && hasInterface(content)
  const hasFlowing = hasExport(content) && hasImport(content)

  score += hasGracefulTransitions ? 5 : 0
  score += hasSmoothFlows ? 5 : 0
  score += hasProgressive ? 5 : 0
  score += hasSequenced ? 5 : 0
  score += hasManaged ? 5 : 0
  score += hasFlowing ? 5 : 0

  const passage = Math.min(score, 100)
  const jarringCount = countMatches(/\bvar\b/, content)
  const suddenCount = countMatches(/\bany\b/, content)

  const hasNoJarring = jarringCount === 0
  const hasNoAllAtOnce = suddenCount === 0
  const hasNoUnordered = !has(/\beval\b/, content)
  const hasNoSudden = !has(/\bdebugger\b/, content)
  const hasHighPassage = passage >= 70

  let ethereal: EtherealGrade
  if (passage >= 85) ethereal = 'seamless-crossing'
  else if (passage >= 70) ethereal = 'graceful-passage'
  else if (passage >= 55) ethereal = 'proper-transition'
  else if (passage >= 40) ethereal = 'abrupt-shift'
  else if (passage >= 25) ethereal = 'jarring-change'
  else ethereal = 'no-passage'

  return {
    passage, ethereal, hasHighPassage, hasGracefulTransitions, hasSmoothFlows,
    hasNoJarring, hasProgressive, hasNoAllAtOnce, hasSequenced, hasNoUnordered,
    hasManaged, hasNoSudden, hasFlowing, jarringCount, suddenCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify keystone condition
 * @example
 * classifyKeystoneCondition(90) // 'divine-portal'
 */
export function classifyKeystoneCondition(score: number): KeystoneCondition {
  if (score >= 85) return 'divine-portal'
  if (score >= 70) return 'phantom-gateway'
  if (score >= 55) return 'proper-gate'
  if (score >= 40) return 'wooden-door'
  if (score >= 25) return 'broken-arch'
  return 'rubble'
}

/**
 * Classify arch type
 * @example
 * classifyArchType(keystones) // 'grand-portal'
 */
export function classifyArchType(keystones: GateKeystone[]): ArchType {
  if (keystones.length === 0) return 'no-arch'
  const avgQs = Math.round(keystones.reduce((s, k) => s + k.qualityScore, 0) / keystones.length)
  const divineRatio = keystones.filter(k => k.condition === 'divine-portal').length / keystones.length
  if (avgQs >= 75 && divineRatio >= 0.5) return 'grand-portal'
  if (avgQs >= 60) return 'proper-archway'
  if (avgQs >= 45) return 'decent-gate'
  if (avgQs >= 30) return 'narrow-door'
  if (avgQs >= 15) return 'hole-in-wall'
  return 'no-arch'
}

/**
 * Classify arch condition
 * @example
 * classifyArchCondition(80) // 'magnificent-gateway'
 */
export function classifyArchCondition(avgQs: number): ArchCondition {
  if (avgQs >= 75) return 'magnificent-gateway'
  if (avgQs >= 60) return 'strong-portal'
  if (avgQs >= 45) return 'decent-entrance'
  if (avgQs >= 30) return 'rusted-gate'
  if (avgQs >= 15) return 'collapsed'
  return 'void'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'gatekeeper-supreme'
 */
export function classifyKeeperGrade(avgFortification: number): KeeperGrade {
  if (avgFortification >= 80) return 'gatekeeper-supreme'
  if (avgFortification >= 65) return 'master-guardian'
  if (avgFortification >= 50) return 'skilled-watchman'
  if (avgFortification >= 35) return 'apprentice'
  if (avgFortification >= 20) return 'novice'
  return 'gate-crasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(keystones, arches, gateway, stats)
 */
export function generateRecommendations(
  keystones: GateKeystone[],
  arches: GateArch[],
  gateway: PhantomGateway,
  stats: PhantomGateStats,
): string[] {
  const recs: string[] = []
  if (stats.avgThresholdQuality < 50) {
    recs.push('Strengthen threshold quality with clear interfaces, well-defined APIs, and typed boundaries')
  }
  if (stats.avgGatewaySecurity < 50) {
    recs.push('Fortify gateway security with input validation, access control, and sanitization')
  }
  if (stats.avgSpiritTraversal < 50) {
    recs.push('Improve spirit traversal with efficient flow, streamlined data paths, and optimized patterns')
  }
  if (stats.avgShadowGuardian < 50) {
    recs.push('Deploy shadow guardians with boundary checks, type guards, and error boundaries')
  }
  if (stats.avgEtherealPassage < 50) {
    recs.push('Smooth ethereal passages with graceful transitions, progressive flows, and managed state')
  }
  if (stats.rubbleCount > 0) {
    recs.push(`${stats.rubbleCount} file(s) are rubble — they need complete phantom gate reconstruction`)
  }
  if (gateway.overallFortification < 40) {
    recs.push('Overall fortification is low — focus on threshold quality and gateway security first')
  }
  const allCollapsed = arches.every(a => a.archType === 'no-arch' || a.archType === 'hole-in-wall')
  if (allCollapsed && arches.length > 0) {
    recs.push('All arches are collapsed — consider a major phantom gate reconstruction')
  }
  const rubbleFiles = keystones.filter(k => k.condition === 'rubble').map(k => k.file)
  if (rubbleFiles.length > 0 && rubbleFiles.length <= 3) {
    recs.push(`Rebuild these rubble files: ${rubbleFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your phantom gate stands as an impregnable portal! Every keystone shines with ethereal perfection')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as gate keystone
 * @example
 * const k = analyzeGateKeystone(content, 'index.ts')
 * console.log(k.condition) // 'divine-portal'
 */
export function analyzeGateKeystone(content: string, filePath: string): GateKeystone {
  const arching = measureArching(content)
  const guarding = measureGuarding(content)
  const traversing = measureTraversing(content)
  const watching = measureWatching(content)
  const transitioning = measureTransitioning(content)

  const qualityScore = Math.round(
    arching.quality * 0.2 +
    guarding.security * 0.2 +
    traversing.traversal * 0.2 +
    watching.guardian * 0.2 +
    transitioning.passage * 0.2,
  )

  return {
    file: filePath,
    thresholdQuality: arching.quality,
    gatewaySecurity: guarding.security,
    spiritTraversal: traversing.traversal,
    shadowGuardian: watching.guardian,
    etherealPassage: transitioning.passage,
    arching, guarding, traversing, watching, transitioning,
    condition: classifyKeystoneCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as gate arch
 * @example
 * const a = analyzeGateArch(keystones, 'src')
 * console.log(a.archType) // 'grand-portal'
 */
export function analyzeGateArch(keystones: GateKeystone[], dirPath: string): GateArch {
  if (keystones.length === 0) {
    return {
      directory: dirPath, keystones: [], avgQuality: 0, avgSecurity: 0,
      avgPassage: 0, divinePortalCount: 0, rubbleCount: 0,
      archType: 'no-arch', condition: 'void',
    }
  }

  const avgQuality = Math.round(keystones.reduce((s, k) => s + k.thresholdQuality, 0) / keystones.length)
  const avgSecurity = Math.round(keystones.reduce((s, k) => s + k.gatewaySecurity, 0) / keystones.length)
  const avgPassage = Math.round(keystones.reduce((s, k) => s + k.etherealPassage, 0) / keystones.length)
  const divinePortalCount = keystones.filter(k => k.condition === 'divine-portal').length
  const rubbleCount = keystones.filter(k => k.condition === 'rubble').length
  const avgQs = Math.round(keystones.reduce((s, k) => s + k.qualityScore, 0) / keystones.length)

  return {
    directory: dirPath, keystones, avgQuality, avgSecurity, avgPassage,
    divinePortalCount, rubbleCount,
    archType: classifyArchType(keystones),
    condition: classifyArchCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete phantom gate result
 * @example
 * const result = await buildPhantomGateResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'gatekeeper-supreme'
 */
export async function buildPhantomGateResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PhantomGateResult> {
  const keystones = files.map((file, i) => analyzeGateKeystone(contents[i] ?? '', file))

  const dirMap = new Map<string, GateKeystone[]>()
  for (const keystone of keystones) {
    const dir = path.dirname(keystone.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(keystone) } else { dirMap.set(dir, [keystone]) }
  }

  const arches = Array.from(dirMap.entries()).map(([dir, dirKeystones]) =>
    analyzeGateArch(dirKeystones, dir),
  )

  const avgQuality = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.thresholdQuality, 0) / keystones.length) : 0
  const avgSecurity = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.gatewaySecurity, 0) / keystones.length) : 0
  const avgPassage = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.etherealPassage, 0) / keystones.length) : 0

  const overallFortification = keystones.length > 0
    ? Math.round((avgQuality + avgSecurity + avgPassage) / 3) : 0
  const isImpregnable = avgQuality >= 60

  const gateway: PhantomGateway = { avgQuality, avgSecurity, avgPassage, isImpregnable, overallFortification }

  const avgSpiritTraversal = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.spiritTraversal, 0) / keystones.length) : 0
  const avgShadowGuardian = keystones.length > 0
    ? Math.round(keystones.reduce((s, k) => s + k.shadowGuardian, 0) / keystones.length) : 0
  const avgEtherealPassage = avgPassage

  const bestKeystone = keystones.length > 0
    ? keystones.reduce((best, k) => k.qualityScore > best.qualityScore ? k : best).file : ''
  const bestThreshold = keystones.length > 0
    ? keystones.reduce((best, k) => k.thresholdQuality > best.thresholdQuality ? k : best).file : ''
  const mostSecure = keystones.length > 0
    ? keystones.reduce((best, k) => k.gatewaySecurity > best.gatewaySecurity ? k : best).file : ''
  const smoothestTraversal = keystones.length > 0
    ? keystones.reduce((best, k) => k.spiritTraversal > best.spiritTraversal ? k : best).file : ''
  const bestGuardian = keystones.length > 0
    ? keystones.reduce((best, k) => k.shadowGuardian > best.shadowGuardian ? k : best).file : ''

  const stats: PhantomGateStats = {
    totalFiles: keystones.length,
    totalArches: arches.length,
    avgThresholdQuality: avgQuality,
    avgGatewaySecurity: avgSecurity,
    avgSpiritTraversal,
    avgShadowGuardian,
    avgEtherealPassage,
    divinePortalCount: keystones.filter(k => k.condition === 'divine-portal').length,
    phantomGatewayCount: keystones.filter(k => k.condition === 'phantom-gateway').length,
    properGateCount: keystones.filter(k => k.condition === 'proper-gate').length,
    woodenDoorCount: keystones.filter(k => k.condition === 'wooden-door').length,
    brokenArchCount: keystones.filter(k => k.condition === 'broken-arch').length,
    rubbleCount: keystones.filter(k => k.condition === 'rubble').length,
    hasHighQualityCount: keystones.filter(k => k.arching.hasHighQuality).length,
    hasHighSecurityCount: keystones.filter(k => k.guarding.hasHighSecurity).length,
    hasHighTraversalCount: keystones.filter(k => k.traversing.hasHighTraversal).length,
    hasHighGuardianCount: keystones.filter(k => k.watching.hasHighGuardian).length,
    hasHighPassageCount: keystones.filter(k => k.transitioning.hasHighPassage).length,
    overallFortification,
    keeperGrade: classifyKeeperGrade(overallFortification),
    bestKeystone, bestThreshold, mostSecure, smoothestTraversal, bestGuardian,
  }

  const recommendations = generateRecommendations(keystones, arches, gateway, stats)

  return { keystones, arches, gateway, stats, recommendations }
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
