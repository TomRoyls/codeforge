// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Fire grade */
export type FireGrade =
  | 'blazing-ember'
  | 'warm-glow'
  | 'proper-fire'
  | 'cool-flame'
  | 'dying-spark'
  | 'cold-ash'

/** Crystal strength grade */
export type CrystalGrade =
  | 'dodecahedron-perfect'
  | 'strong-crystal'
  | 'proper-gem'
  | 'soft-crystal'
  | 'brittle-stone'
  | 'crumbled'

/** Color warmth grade */
export type ColorGrade =
  | 'deep-crimson'
  | 'warm-red'
  | 'proper-garnet'
  | 'brownish-red'
  | 'cool-red'
  | 'colorless'

/** Commitment grade */
export type CommitmentGrade =
  | 'deep-devotion'
  | 'strong-commitment'
  | 'proper-dedication'
  | 'casual-effort'
  | 'half-hearted'
  | 'abandoned'

/** Foundation grade */
export type FoundationGrade =
  | 'bedrock-root'
  | 'deep-grounded'
  | 'proper-foundation'
  | 'shallow-root'
  | 'floating'
  | 'no-ground'

/** Ember condition */
export type EmberCondition =
  | 'pyrope-treasure'
  | 'almandine-gem'
  | 'proper-garnet'
  | 'andradite'
  | 'grossular-pebble'
  | 'sand'

/** Hearth type */
export type HearthType =
  | 'great-fireplace'
  | 'proper-hearth'
  | 'forge-fire'
  | 'camp-fire'
  | 'candle-flame'
  | 'no-fire'

/** Hearth condition */
export type HearthCondition =
  | 'blazing-hearth'
  | 'warm-fire'
  | 'steady-glow'
  | 'dying-embers'
  | 'cold-ashes'
  | 'extinguished'

/** Keeper grade */
export type KeeperGrade =
  | 'hearth-master'
  | 'fire-keeper'
  | 'skilled-tender'
  | 'apprentice'
  | 'novice'
  | 'ice-cold'

/** Firing measurement */
export interface FiringMeasure {
  fire: number
  grade: FireGrade
  hasHighFire: boolean
  hasEnergetic: boolean
  hasPassionate: boolean
  hasNoLifeless: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasVibrant: boolean
  hasNoDull: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasFiery: boolean
  lifelessCount: number
  staticCount: number
}

/** Strengthening measurement */
export interface StrengtheningMeasure {
  strength: number
  crystal: CrystalGrade
  hasHighStrength: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoWeak: boolean
  hasSolid: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasHardy: boolean
  fragileCount: number
  weakCount: number
}

/** Warming measurement */
export interface WarmingMeasure {
  warmth: number
  color: ColorGrade
  hasHighWarmth: boolean
  hasFriendly: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasWelcoming: boolean
  hasNoDistant: boolean
  hasInviting: boolean
  hasNoCold: boolean
  hasWarm: boolean
  hasNoFrosty: boolean
  hasComfortable: boolean
  hostileCount: number
  distantCount: number
}

/** Committing measurement */
export interface CommittingMeasure {
  depth: number
  commitment: CommitmentGrade
  hasHighDepth: boolean
  hasThorough: boolean
  hasDedicated: boolean
  hasNoSuperficial: boolean
  hasComplete: boolean
  hasNoPartial: boolean
  hasExhaustive: boolean
  hasNoSketchy: boolean
  hasComprehensive: boolean
  hasNoIncomplete: boolean
  hasMeticulous: boolean
  superficialCount: number
  partialCount: number
}

/** Grounding measurement */
export interface GroundingMeasure {
  root: number
  foundation: FoundationGrade
  hasHighRoot: boolean
  hasGrounded: boolean
  hasStable: boolean
  hasNoFloating: boolean
  hasAnchored: boolean
  hasNoDrifting: boolean
  hasSecure: boolean
  hasNoUnstable: boolean
  hasRooted: boolean
  hasNoWobbly: boolean
  hasFirm: boolean
  floatingCount: number
  driftingCount: number
}

/** Single file analysis */
export interface GarnetEmber {
  file: string
  innerFire: number
  crystalStrength: number
  colorWarmth: number
  commitmentDepth: number
  rootGrounding: number
  firing: FiringMeasure
  strengthening: StrengtheningMeasure
  warming: WarmingMeasure
  committing: CommittingMeasure
  grounding: GroundingMeasure
  condition: EmberCondition
  qualityScore: number
}

/** Directory-level hearth */
export interface GarnetHearth {
  directory: string
  embers: GarnetEmber[]
  avgFire: number
  avgStrength: number
  avgWarmth: number
  pyropeTreasureCount: number
  sandCount: number
  hearthType: HearthType
  condition: HearthCondition
}

/** Home summary */
export interface HomeSummary {
  avgFire: number
  avgStrength: number
  avgWarmth: number
  isWarm: boolean
  overallWarmth: number
}

/** Full stats */
export interface GarnetHearthStats {
  totalFiles: number
  totalHearths: number
  avgInnerFire: number
  avgCrystalStrength: number
  avgColorWarmth: number
  avgCommitmentDepth: number
  avgRootGrounding: number
  pyropeTreasureCount: number
  almandineGemCount: number
  properGarnetCount: number
  andraditeCount: number
  grossularPebbleCount: number
  sandCount: number
  hasHighFireCount: number
  hasHighStrengthCount: number
  hasHighWarmthCount: number
  hasHighDepthCount: number
  hasHighRootCount: number
  overallWarmth: number
  keeperGrade: KeeperGrade
  bestEmber: string
  mostFiery: string
  strongest: string
  warmest: string
  mostCommitted: string
}

/** Full result */
export interface GarnetHearthResult {
  embers: GarnetEmber[]
  hearths: GarnetHearth[]
  home: HomeSummary
  stats: GarnetHearthStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  const globalPattern = new RegExp(pattern.source, flags)
  return (content.match(globalPattern) ?? []).length
}

// ─── Boolean Detectors ─────────────────────────────────────────────

const hasExport = (c: string) => has(/\bexport\b/, c)
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure inner fire
 * @example
 * const m = measureFiring(content)
 * console.log(m.grade) // 'blazing-ember'
 */
export function measureFiring(content: string): FiringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasEnergetic = hasExport(content) && hasAsync(content)
  const hasPassionate = hasNamedExport(content) && hasReturnType(content)
  const hasDynamic = hasImport(content) && hasGenerics(content)
  const hasVibrant = hasDocComments(content) && hasConst(content)
  const hasAlive = hasInterface(content) && hasClass(content)
  const hasFiery = hasExport(content) && hasDocComments(content)

  score += hasEnergetic ? 5 : 0
  score += hasPassionate ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasVibrant ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasFiery ? 5 : 0

  const fire = Math.min(score, 100)
  const lifelessCount = count(/\bvar\b/, content)
  const staticCount = count(/\bany\b/, content)

  const hasNoLifeless = lifelessCount === 0
  const hasNoStatic = staticCount === 0
  const hasNoDull = !has(/\beval\b/, content)
  const hasNoDead = !has(/\bdebugger\b/, content)
  const hasHighFire = fire >= 70

  let grade: FireGrade
  if (fire >= 85) grade = 'blazing-ember'
  else if (fire >= 70) grade = 'warm-glow'
  else if (fire >= 55) grade = 'proper-fire'
  else if (fire >= 40) grade = 'cool-flame'
  else if (fire >= 25) grade = 'dying-spark'
  else grade = 'cold-ash'

  return {
    fire, grade, hasHighFire, hasEnergetic, hasPassionate, hasNoLifeless,
    hasDynamic, hasNoStatic, hasVibrant, hasNoDull, hasAlive, hasNoDead,
    hasFiery, lifelessCount, staticCount,
  }
}

/**
 * Measure crystal strength
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.crystal) // 'dodecahedron-perfect'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasRobust = hasReturnType(content) && hasStrictEq(content)
  const hasDurable = hasReadonly(content) && hasPrivate(content)
  const hasTough = hasInterface(content) && hasGenerics(content)
  const hasSolid = hasTypeAlias(content) && hasDocComments(content)
  const hasResilient = hasClass(content) && hasReturnType(content)
  const hasHardy = hasConst(content) && hasStrictEq(content)

  score += hasRobust ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasHardy ? 5 : 0

  const strength = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const weakCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoWeak = weakCount === 0
  const hasNoBrittle = !has(/\beval\b/, content)
  const hasNoBreakable = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let crystal: CrystalGrade
  if (strength >= 85) crystal = 'dodecahedron-perfect'
  else if (strength >= 70) crystal = 'strong-crystal'
  else if (strength >= 55) crystal = 'proper-gem'
  else if (strength >= 40) crystal = 'soft-crystal'
  else if (strength >= 25) crystal = 'brittle-stone'
  else crystal = 'crumbled'

  return {
    strength, crystal, hasHighStrength, hasRobust, hasDurable, hasNoFragile,
    hasTough, hasNoWeak, hasSolid, hasNoBrittle, hasResilient, hasNoBreakable,
    hasHardy, fragileCount, weakCount,
  }
}

/**
 * Measure color warmth
 * @example
 * const m = measureWarming(content)
 * console.log(m.color) // 'deep-crimson'
 */
export function measureWarming(content: string): WarmingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasFriendly = hasDocComments(content) && hasInterface(content)
  const hasApproachable = hasExport(content) && hasImport(content)
  const hasWelcoming = hasTypeAlias(content) && hasGenerics(content)
  const hasInviting = hasReturnType(content) && hasReadonly(content)
  const hasWarm = hasConst(content) && hasDocComments(content)
  const hasComfortable = hasAsync(content) && hasExport(content)

  score += hasFriendly ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasWelcoming ? 5 : 0
  score += hasInviting ? 5 : 0
  score += hasWarm ? 5 : 0
  score += hasComfortable ? 5 : 0

  const warmth = Math.min(score, 100)
  const hostileCount = count(/\bvar\b/, content)
  const distantCount = count(/\bany\b/, content)

  const hasNoHostile = hostileCount === 0
  const hasNoDistant = distantCount === 0
  const hasNoCold = !has(/\beval\b/, content)
  const hasNoFrosty = !has(/\bdebugger\b/, content)
  const hasHighWarmth = warmth >= 70

  let color: ColorGrade
  if (warmth >= 85) color = 'deep-crimson'
  else if (warmth >= 70) color = 'warm-red'
  else if (warmth >= 55) color = 'proper-garnet'
  else if (warmth >= 40) color = 'brownish-red'
  else if (warmth >= 25) color = 'cool-red'
  else color = 'colorless'

  return {
    warmth, color, hasHighWarmth, hasFriendly, hasApproachable, hasNoHostile,
    hasWelcoming, hasNoDistant, hasInviting, hasNoCold, hasWarm, hasNoFrosty,
    hasComfortable, hostileCount, distantCount,
  }
}

/**
 * Measure commitment depth
 * @example
 * const m = measureCommitting(content)
 * console.log(m.commitment) // 'deep-devotion'
 */
export function measureCommitting(content: string): CommittingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasThorough = hasNamedExport(content) && hasExport(content)
  const hasDedicated = hasReturnType(content) && hasStrictEq(content)
  const hasComplete = hasReadonly(content) && hasPrivate(content)
  const hasExhaustive = hasInterface(content) && hasGenerics(content)
  const hasComprehensive = hasDocComments(content) && hasNamedExport(content)
  const hasMeticulous = hasClass(content) && hasReturnType(content)

  score += hasThorough ? 5 : 0
  score += hasDedicated ? 5 : 0
  score += hasComplete ? 5 : 0
  score += hasExhaustive ? 5 : 0
  score += hasComprehensive ? 5 : 0
  score += hasMeticulous ? 5 : 0

  const depth = Math.min(score, 100)
  const superficialCount = count(/\bvar\b/, content)
  const partialCount = count(/\bany\b/, content)

  const hasNoSuperficial = superficialCount === 0
  const hasNoPartial = partialCount === 0
  const hasNoSketchy = !has(/\beval\b/, content)
  const hasNoIncomplete = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let commitment: CommitmentGrade
  if (depth >= 85) commitment = 'deep-devotion'
  else if (depth >= 70) commitment = 'strong-commitment'
  else if (depth >= 55) commitment = 'proper-dedication'
  else if (depth >= 40) commitment = 'casual-effort'
  else if (depth >= 25) commitment = 'half-hearted'
  else commitment = 'abandoned'

  return {
    depth, commitment, hasHighDepth, hasThorough, hasDedicated, hasNoSuperficial,
    hasComplete, hasNoPartial, hasExhaustive, hasNoSketchy, hasComprehensive,
    hasNoIncomplete, hasMeticulous, superficialCount, partialCount,
  }
}

/**
 * Measure root grounding
 * @example
 * const m = measureGrounding(content)
 * console.log(m.foundation) // 'bedrock-root'
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasGrounded = hasConst(content) && hasStrictEq(content)
  const hasStable = hasInterface(content) && hasTypeAlias(content)
  const hasAnchored = hasExport(content) && hasImport(content)
  const hasSecure = hasReturnType(content) && hasReadonly(content)
  const hasRooted = hasPrivate(content) && hasStrictEq(content)
  const hasFirm = hasClass(content) && hasConst(content)

  score += hasGrounded ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasAnchored ? 5 : 0
  score += hasSecure ? 5 : 0
  score += hasRooted ? 5 : 0
  score += hasFirm ? 5 : 0

  const root = Math.min(score, 100)
  const floatingCount = count(/\bvar\b/, content)
  const driftingCount = count(/\bany\b/, content)

  const hasNoFloating = floatingCount === 0
  const hasNoDrifting = driftingCount === 0
  const hasNoUnstable = !has(/\beval\b/, content)
  const hasNoWobbly = !has(/\bdebugger\b/, content)
  const hasHighRoot = root >= 70

  let foundation: FoundationGrade
  if (root >= 85) foundation = 'bedrock-root'
  else if (root >= 70) foundation = 'deep-grounded'
  else if (root >= 55) foundation = 'proper-foundation'
  else if (root >= 40) foundation = 'shallow-root'
  else if (root >= 25) foundation = 'floating'
  else foundation = 'no-ground'

  return {
    root, foundation, hasHighRoot, hasGrounded, hasStable, hasNoFloating,
    hasAnchored, hasNoDrifting, hasSecure, hasNoUnstable, hasRooted, hasNoWobbly,
    hasFirm, floatingCount, driftingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ember condition
 * @example
 * classifyEmberCondition(90) // 'pyrope-treasure'
 */
export function classifyEmberCondition(score: number): EmberCondition {
  if (score >= 85) return 'pyrope-treasure'
  if (score >= 70) return 'almandine-gem'
  if (score >= 55) return 'proper-garnet'
  if (score >= 40) return 'andradite'
  if (score >= 25) return 'grossular-pebble'
  return 'sand'
}

/**
 * Classify hearth type
 * @example
 * classifyHearthType(embers) // 'great-fireplace'
 */
export function classifyHearthType(embers: GarnetEmber[]): HearthType {
  if (embers.length === 0) return 'no-fire'
  const avgQs = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)
  const treasureRatio = embers.filter(e => e.condition === 'pyrope-treasure').length / embers.length
  if (avgQs >= 75 && treasureRatio >= 0.5) return 'great-fireplace'
  if (avgQs >= 60) return 'proper-hearth'
  if (avgQs >= 45) return 'forge-fire'
  if (avgQs >= 30) return 'camp-fire'
  if (avgQs >= 15) return 'candle-flame'
  return 'no-fire'
}

/**
 * Classify hearth condition
 * @example
 * classifyHearthCondition(80) // 'blazing-hearth'
 */
export function classifyHearthCondition(avgQs: number): HearthCondition {
  if (avgQs >= 75) return 'blazing-hearth'
  if (avgQs >= 60) return 'warm-fire'
  if (avgQs >= 45) return 'steady-glow'
  if (avgQs >= 30) return 'dying-embers'
  if (avgQs >= 15) return 'cold-ashes'
  return 'extinguished'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'hearth-master'
 */
export function classifyKeeperGrade(avgWarmth: number): KeeperGrade {
  if (avgWarmth >= 80) return 'hearth-master'
  if (avgWarmth >= 65) return 'fire-keeper'
  if (avgWarmth >= 50) return 'skilled-tender'
  if (avgWarmth >= 35) return 'apprentice'
  if (avgWarmth >= 20) return 'novice'
  return 'ice-cold'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(embers, hearths, home, stats)
 */
export function generateRecommendations(
  embers: GarnetEmber[],
  hearths: GarnetHearth[],
  home: HomeSummary,
  stats: GarnetHearthStats,
): string[] {
  const recs: string[] = []
  if (stats.avgInnerFire < 50) {
    recs.push('Ignite inner fire with energetic exports, passionate return types, and dynamic import patterns')
  }
  if (stats.avgCrystalStrength < 50) {
    recs.push('Strengthen crystal structure with robust return types, durable readonly guards, and tough interface foundations')
  }
  if (stats.avgColorWarmth < 50) {
    recs.push('Warm color palette with friendly doc comments, approachable export/import pairs, and welcoming type aliases')
  }
  if (stats.avgCommitmentDepth < 50) {
    recs.push('Deepen commitment with thorough named exports, dedicated strict equality, and complete readonly patterns')
  }
  if (stats.avgRootGrounding < 50) {
    recs.push('Ground roots with stable const declarations, anchored export/import pairs, and secure return type annotations')
  }
  if (stats.sandCount > 0) {
    recs.push(`${stats.sandCount} file(s) are sand — consider significant refactoring`)
  }
  if (home.overallWarmth < 40) {
    recs.push('Overall garnet warmth is poor — focus on inner fire and crystal strength first')
  }
  const allCold = hearths.every(h => h.hearthType === 'no-fire' || h.hearthType === 'candle-flame')
  if (allCold && hearths.length > 0) {
    recs.push('All hearths are cold or dying — consider a major quality overhaul')
  }
  const sands = embers.filter(e => e.condition === 'sand').map(e => e.file)
  if (sands.length > 0 && sands.length <= 3) {
    recs.push(`Transform these sand files into garnet treasures: ${sands.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your garnet hearth is hearth-master quality! Every ember radiates warm inner fire')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as garnet ember
 * @example
 * const ember = analyzeGarnetEmber(content, 'index.ts')
 * console.log(ember.condition) // 'pyrope-treasure'
 */
export function analyzeGarnetEmber(content: string, filePath: string): GarnetEmber {
  const firing = measureFiring(content)
  const strengthening = measureStrengthening(content)
  const warming = measureWarming(content)
  const committing = measureCommitting(content)
  const grounding = measureGrounding(content)

  const qualityScore = Math.round(
    firing.fire * 0.2 +
    strengthening.strength * 0.2 +
    warming.warmth * 0.2 +
    committing.depth * 0.2 +
    grounding.root * 0.2,
  )

  return {
    file: filePath,
    innerFire: firing.fire,
    crystalStrength: strengthening.strength,
    colorWarmth: warming.warmth,
    commitmentDepth: committing.depth,
    rootGrounding: grounding.root,
    firing,
    strengthening,
    warming,
    committing,
    grounding,
    condition: classifyEmberCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a garnet hearth
 * @example
 * const hearth = analyzeGarnetHearth(embers, 'src')
 * console.log(hearth.hearthType) // 'great-fireplace'
 */
export function analyzeGarnetHearth(embers: GarnetEmber[], dirPath: string): GarnetHearth {
  if (embers.length === 0) {
    return {
      directory: dirPath, embers: [], avgFire: 0, avgStrength: 0, avgWarmth: 0,
      pyropeTreasureCount: 0, sandCount: 0, hearthType: 'no-fire', condition: 'extinguished',
    }
  }

  const avgFire = Math.round(embers.reduce((s, e) => s + e.innerFire, 0) / embers.length)
  const avgStrength = Math.round(embers.reduce((s, e) => s + e.crystalStrength, 0) / embers.length)
  const avgWarmth = Math.round(embers.reduce((s, e) => s + e.colorWarmth, 0) / embers.length)
  const pyropeTreasureCount = embers.filter(e => e.condition === 'pyrope-treasure').length
  const sandCount = embers.filter(e => e.condition === 'sand').length
  const avgQs = Math.round(embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length)

  return {
    directory: dirPath, embers, avgFire, avgStrength, avgWarmth,
    pyropeTreasureCount, sandCount, hearthType: classifyHearthType(embers),
    condition: classifyHearthCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete garnet hearth result
 * @example
 * const result = await buildGarnetHearthResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'hearth-master'
 */
export async function buildGarnetHearthResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GarnetHearthResult> {
  const embers = files.map((file, i) => analyzeGarnetEmber(contents[i] ?? '', file))

  const dirMap = new Map<string, GarnetEmber[]>()
  for (const ember of embers) {
    const dir = path.dirname(ember.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ember) } else { dirMap.set(dir, [ember]) }
  }

  const hearths = Array.from(dirMap.entries()).map(([dir, dirEmbers]) =>
    analyzeGarnetHearth(dirEmbers, dir),
  )

  const avgFire = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.innerFire, 0) / embers.length) : 0
  const avgStrength = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.crystalStrength, 0) / embers.length) : 0
  const avgWarmth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.colorWarmth, 0) / embers.length) : 0

  const overallWarmth = embers.length > 0
    ? Math.round((avgFire + avgStrength + avgWarmth) / 3) : 0
  const isWarm = avgWarmth >= 60

  const home: HomeSummary = { avgFire, avgStrength, avgWarmth, isWarm, overallWarmth }

  const avgCommitmentDepth = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.commitmentDepth, 0) / embers.length) : 0
  const avgRootGrounding = embers.length > 0
    ? Math.round(embers.reduce((s, e) => s + e.rootGrounding, 0) / embers.length) : 0

  const bestEmber = embers.length > 0
    ? embers.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const mostFiery = embers.length > 0
    ? embers.reduce((best, e) => e.innerFire > best.innerFire ? e : best).file : ''
  const strongest = embers.length > 0
    ? embers.reduce((best, e) => e.crystalStrength > best.crystalStrength ? e : best).file : ''
  const warmest = embers.length > 0
    ? embers.reduce((best, e) => e.colorWarmth > best.colorWarmth ? e : best).file : ''
  const mostCommitted = embers.length > 0
    ? embers.reduce((best, e) => e.commitmentDepth > best.commitmentDepth ? e : best).file : ''

  const stats: GarnetHearthStats = {
    totalFiles: embers.length,
    totalHearths: hearths.length,
    avgInnerFire: avgFire,
    avgCrystalStrength: avgStrength,
    avgColorWarmth: avgWarmth,
    avgCommitmentDepth,
    avgRootGrounding,
    pyropeTreasureCount: embers.filter(e => e.condition === 'pyrope-treasure').length,
    almandineGemCount: embers.filter(e => e.condition === 'almandine-gem').length,
    properGarnetCount: embers.filter(e => e.condition === 'proper-garnet').length,
    andraditeCount: embers.filter(e => e.condition === 'andradite').length,
    grossularPebbleCount: embers.filter(e => e.condition === 'grossular-pebble').length,
    sandCount: embers.filter(e => e.condition === 'sand').length,
    hasHighFireCount: embers.filter(e => e.firing.hasHighFire).length,
    hasHighStrengthCount: embers.filter(e => e.strengthening.hasHighStrength).length,
    hasHighWarmthCount: embers.filter(e => e.warming.hasHighWarmth).length,
    hasHighDepthCount: embers.filter(e => e.committing.hasHighDepth).length,
    hasHighRootCount: embers.filter(e => e.grounding.hasHighRoot).length,
    overallWarmth,
    keeperGrade: classifyKeeperGrade(overallWarmth),
    bestEmber, mostFiery, strongest, warmest, mostCommitted,
  }

  const recommendations = generateRecommendations(embers, hearths, home, stats)

  return { embers, hearths, home, stats, recommendations }
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
