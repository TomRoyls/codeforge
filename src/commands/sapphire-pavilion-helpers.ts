// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type ClarityGrade = 'flawless-sapphire' | 'clear-gem' | 'proper-transparency' | 'cloudy-stone' | 'opaque-rock' | 'no-clarity'
export type PillarType = 'diamond-pillar' | 'strong-column' | 'proper-support' | 'weak-beam' | 'crumbling-pillar' | 'no-support'
export type RoofType = 'impervious-dome' | 'strong-canopy' | 'proper-roof' | 'leaky-roof' | 'no-shelter' | 'no-roof'
export type HallType = 'grand-reception' | 'beautiful-entrance' | 'proper-lobby' | 'crude-door' | 'hostile-entrance' | 'no-entrance'
export type FoundationType = 'bedrock-deep' | 'solid-foundation' | 'proper-base' | 'shallow-footing' | 'surface-slab' | 'no-foundation'
export type PillarCondition = 'sapphire-masterpiece' | 'gem-pavilion' | 'proper-hall' | 'stone-building' | 'wooden-hut' | 'ruins'
export type GroundType = 'palace-gardens' | 'gem-grounds' | 'proper-courtyard' | 'small-yard' | 'dirt-patch' | 'no-ground'
export type GroundCondition = 'magnificent-pavilion' | 'beautiful-hall' | 'decent-building' | 'modest-structure' | 'ruin' | 'void'
export type StewardGrade = 'master-steward' | 'palace-curator' | 'skilled-keeper' | 'apprentice' | 'novice' | 'squatter'

export interface ClarifyingMeasure {
  clarity: number
  grade: ClarityGrade
  hasHighClarity: boolean
  hasTransparent: boolean
  hasReadable: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  hasNoDense: boolean
  hasUnderstandable: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface BearingMeasure {
  strength: number
  pillar: PillarType
  hasHighStrength: boolean
  hasRobust: boolean
  hasPerformant: boolean
  hasNoSluggish: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasReliable: boolean
  hasNoFragile: boolean
  hasSolid: boolean
  sluggishCount: number
  untestedCount: number
}

export interface ShieldingMeasure {
  protection: number
  roof: RoofType
  hasHighProtection: boolean
  hasEncapsulated: boolean
  hasPrivateByDefault: boolean
  hasNoLeaked: boolean
  hasImmutable: boolean
  hasNoMutable: boolean
  hasSealed: boolean
  hasNoOpen: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasGuarded: boolean
  leakedCount: number
  mutableCount: number
}

export interface WelcomingMeasure {
  elegance: number
  hall: HallType
  hasHighElegance: boolean
  hasCleanAPI: boolean
  hasIntuitive: boolean
  hasNoHostile: boolean
  hasWellDocumented: boolean
  hasNoUndocumented: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasGraceful: boolean
  hasNoClunky: boolean
  hasInviting: boolean
  hostileCount: number
  undocumentedCount: number
}

export interface GroundingMeasure {
  depth: number
  foundation: FoundationType
  hasHighDepth: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasStableBase: boolean
  hasNoShaky: boolean
  untestedCount: number
  unsafeCount: number
}

export interface SapphirePillar {
  file: string
  gemClarity: number
  pillarStrength: number
  roofProtection: number
  hallElegance: number
  foundationDepth: number
  clarifying: ClarifyingMeasure
  bearing: BearingMeasure
  shielding: ShieldingMeasure
  welcoming: WelcomingMeasure
  grounding: GroundingMeasure
  condition: PillarCondition
  qualityScore: number
}

export interface PavilionGround {
  directory: string
  pillars: SapphirePillar[]
  avgClarity: number
  avgStrength: number
  avgDepth: number
  sapphireMasterpieceCount: number
  ruinsCount: number
  groundType: GroundType
  condition: GroundCondition
}

export interface SapphireEstate {
  avgClarity: number
  avgStrength: number
  avgDepth: number
  isMagnificent: boolean
  overallGrandeur: number
}

export interface SapphirePavilionStats {
  totalFiles: number
  totalGrounds: number
  avgGemClarity: number
  avgPillarStrength: number
  avgRoofProtection: number
  avgHallElegance: number
  avgFoundationDepth: number
  sapphireMasterpieceCount: number
  gemPavilionCount: number
  properHallCount: number
  stoneBuildingCount: number
  woodenHutCount: number
  ruinsCount: number
  hasHighClarityCount: number
  hasHighStrengthCount: number
  hasHighProtectionCount: number
  hasHighEleganceCount: number
  hasHighDepthCount: number
  overallGrandeur: number
  stewardGrade: StewardGrade
  bestPillar: string
  clearest: string
  strongest: string
  mostProtected: string
  deepest: string
}

export interface SapphirePavilionResult {
  pillars: SapphirePillar[]
  grounds: PavilionGround[]
  estate: SapphireEstate
  stats: SapphirePavilionStats
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
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure gem clarity (code transparency)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.grade) // 'flawless-sapphire'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasNamedExport(content) ? 4 : 0

  const hasTransparent = hasExport(content) && hasInterface(content)
  const hasReadable = hasReturnType(content) && hasConst(content)
  const hasSelfDocumenting = hasDocComments(content) && hasStrictEq(content)
  const hasVisible = hasAsync(content) && hasOptional(content)
  const hasClear = hasGenerics(content) && hasReadonly(content)
  const hasUnderstandable = hasNamedExport(content) && hasEnum(content)

  score += hasTransparent ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasUnderstandable ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoHidden = countMatches(/\beval\b/, content) === 0
  const hasNoDense = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: ClarityGrade
  if (clarity >= 85) grade = 'flawless-sapphire'
  else if (clarity >= 70) grade = 'clear-gem'
  else if (clarity >= 55) grade = 'proper-transparency'
  else if (clarity >= 40) grade = 'cloudy-stone'
  else if (clarity >= 25) grade = 'opaque-rock'
  else grade = 'no-clarity'

  return {
    clarity, grade, hasHighClarity, hasTransparent, hasReadable, hasNoObfuscated,
    hasSelfDocumenting, hasNoCryptic, hasVisible, hasNoHidden, hasClear, hasNoDense,
    hasUnderstandable, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure pillar strength (load-bearing functions)
 * @example
 * const m = measureBearing(content)
 * console.log(m.pillar) // 'diamond-pillar'
 */
export function measureBearing(content: string): BearingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasRobust = hasStrictEq(content) && hasReturnType(content)
  const hasPerformant = hasExport(content) && hasConst(content)
  const didTested = hasInterface(content) && hasTryCatch(content)
  const hasTypeSafe = hasReadonly(content) && hasOptional(content)
  const hasReliable = hasEnum(content) && hasTypeAlias(content)
  const hasSolid = hasGenerics(content) && hasPrivate(content)

  score += hasRobust ? 5 : 0
  score += hasPerformant ? 5 : 0
  score += didTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasSolid ? 5 : 0

  const strength = Math.min(score, 100)
  const sluggishCount = countMatches(/\bvar\b/, content)
  const untestedCount = countMatches(/\bany\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = countMatches(/\beval\b/, content) === 0
  const hasNoFragile = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let pillar: PillarType
  if (strength >= 85) pillar = 'diamond-pillar'
  else if (strength >= 70) pillar = 'strong-column'
  else if (strength >= 55) pillar = 'proper-support'
  else if (strength >= 40) pillar = 'weak-beam'
  else if (strength >= 25) pillar = 'crumbling-pillar'
  else pillar = 'no-support'

  return {
    strength, pillar, hasHighStrength, hasRobust, hasPerformant, hasNoSluggish,
    hasTested: didTested, hasNoUntested, hasTypeSafe, hasNoUnsafe, hasReliable,
    hasNoFragile, hasSolid, sluggishCount, untestedCount,
  }
}

/**
 * Measure roof protection (encapsulation)
 * @example
 * const m = measureShielding(content)
 * console.log(m.roof) // 'impervious-dome'
 */
export function measureShielding(content: string): ShieldingMeasure {
  let score = 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasReturnType(content) ? 4 : 0

  const hasEncapsulated = hasReadonly(content) && hasPrivate(content)
  const hasPrivateByDefault = hasPrivate(content) && hasInterface(content)
  const hasImmutable = hasReadonly(content) && hasConst(content)
  const hasSealed = hasInterface(content) && hasEnum(content)
  const hasProtected = hasTryCatch(content) && hasStrictEq(content)
  const hasGuarded = hasOptional(content) && hasTypeAlias(content)

  score += hasEncapsulated ? 5 : 0
  score += hasPrivateByDefault ? 5 : 0
  score += hasImmutable ? 5 : 0
  score += hasSealed ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasGuarded ? 5 : 0

  const protection = Math.min(score, 100)
  const leakedCount = countMatches(/\bvar\b/, content)
  const mutableCount = countMatches(/\bany\b/, content)

  const hasNoLeaked = leakedCount === 0
  const hasNoMutable = mutableCount === 0
  const hasNoOpen = countMatches(/\beval\b/, content) === 0
  const hasNoExposed = !has(/\bdebugger\b/, content)
  const hasHighProtection = protection >= 70

  let roof: RoofType
  if (protection >= 85) roof = 'impervious-dome'
  else if (protection >= 70) roof = 'strong-canopy'
  else if (protection >= 55) roof = 'proper-roof'
  else if (protection >= 40) roof = 'leaky-roof'
  else if (protection >= 25) roof = 'no-shelter'
  else roof = 'no-roof'

  return {
    protection, roof, hasHighProtection, hasEncapsulated, hasPrivateByDefault,
    hasNoLeaked, hasImmutable, hasNoMutable, hasSealed, hasNoOpen, hasProtected,
    hasNoExposed, hasGuarded, leakedCount, mutableCount,
  }
}

/**
 * Measure hall elegance (public interface beauty)
 * @example
 * const m = measureWelcoming(content)
 * console.log(m.hall) // 'grand-reception'
 */
export function measureWelcoming(content: string): WelcomingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasCleanAPI = hasExport(content) && hasInterface(content)
  const hasIntuitive = hasReturnType(content) && hasDocComments(content)
  const hasWellDocumented = hasDocComments(content) && hasNamedExport(content)
  const hasApproachable = hasEnum(content) && hasTypeAlias(content)
  const hasGraceful = hasAsync(content) && hasConst(content)
  const hasInviting = hasOptional(content) && hasReadonly(content)

  score += hasCleanAPI ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasWellDocumented ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasInviting ? 5 : 0

  const elegance = Math.min(score, 100)
  const hostileCount = countMatches(/\bvar\b/, content)
  const undocumentedCount = countMatches(/\bany\b/, content)

  const hasNoHostile = hostileCount === 0
  const hasNoUndocumented = undocumentedCount === 0
  const hasNoIntimidating = countMatches(/\beval\b/, content) === 0
  const hasNoClunky = !has(/\bdebugger\b/, content)
  const hasHighElegance = elegance >= 70

  let hall: HallType
  if (elegance >= 85) hall = 'grand-reception'
  else if (elegance >= 70) hall = 'beautiful-entrance'
  else if (elegance >= 55) hall = 'proper-lobby'
  else if (elegance >= 40) hall = 'crude-door'
  else if (elegance >= 25) hall = 'hostile-entrance'
  else hall = 'no-entrance'

  return {
    elegance, hall, hasHighElegance, hasCleanAPI, hasIntuitive, hasNoHostile,
    hasWellDocumented, hasNoUndocumented, hasApproachable, hasNoIntimidating,
    hasGraceful, hasNoClunky, hasInviting, hostileCount, undocumentedCount,
  }
}

/**
 * Measure foundation depth (test/type foundation)
 * @example
 * const m = measureGrounding(content)
 * console.log(m.foundation) // 'bedrock-deep'
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const didTested = hasTryCatch(content) && hasInterface(content)
  const hasTypeSafe = hasStrictEq(content) && hasReturnType(content)
  const hasWellStructured = hasExport(content) && hasConst(content)
  const hasErrorHandled = hasTryCatch(content) && hasStrictEq(content)
  const hasStableBase = hasEnum(content) && hasTypeAlias(content)
  const hasSolid = hasGenerics(content) && hasPrivate(content)

  score += didTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasStableBase ? 5 : 0
  score += hasSolid ? 5 : 0

  const depth = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const unsafeCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = unsafeCount === 0
  const hasNoChaotic = countMatches(/\beval\b/, content) === 0
  const hasNoBareCrash = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let foundation: FoundationType
  if (depth >= 85) foundation = 'bedrock-deep'
  else if (depth >= 70) foundation = 'solid-foundation'
  else if (depth >= 55) foundation = 'proper-base'
  else if (depth >= 40) foundation = 'shallow-footing'
  else if (depth >= 25) foundation = 'surface-slab'
  else foundation = 'no-foundation'

  return {
    depth, foundation, hasHighDepth, hasTested: didTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasWellStructured, hasNoChaotic, hasErrorHandled,
    hasNoBareCrash, hasStableBase, hasNoShaky: hasNoBareCrash, untestedCount, unsafeCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify pillar condition
 * @example
 * classifyPillarCondition(90) // 'sapphire-masterpiece'
 */
export function classifyPillarCondition(score: number): PillarCondition {
  if (score >= 85) return 'sapphire-masterpiece'
  if (score >= 70) return 'gem-pavilion'
  if (score >= 55) return 'proper-hall'
  if (score >= 40) return 'stone-building'
  if (score >= 25) return 'wooden-hut'
  return 'ruins'
}

/**
 * Classify ground type
 * @example
 * classifyGroundType(pillars) // 'palace-gardens'
 */
export function classifyGroundType(pillars: SapphirePillar[]): GroundType {
  if (pillars.length === 0) return 'no-ground'
  const avgQs = Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)
  const masterpieceRatio = pillars.filter(p => p.condition === 'sapphire-masterpiece').length / pillars.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'palace-gardens'
  if (avgQs >= 60) return 'gem-grounds'
  if (avgQs >= 45) return 'proper-courtyard'
  if (avgQs >= 30) return 'small-yard'
  if (avgQs >= 15) return 'dirt-patch'
  return 'no-ground'
}

/**
 * Classify ground condition
 * @example
 * classifyGroundCondition(80) // 'magnificent-pavilion'
 */
export function classifyGroundCondition(avgQs: number): GroundCondition {
  if (avgQs >= 75) return 'magnificent-pavilion'
  if (avgQs >= 60) return 'beautiful-hall'
  if (avgQs >= 45) return 'decent-building'
  if (avgQs >= 30) return 'modest-structure'
  if (avgQs >= 15) return 'ruin'
  return 'void'
}

/**
 * Classify steward grade
 * @example
 * classifyStewardGrade(85) // 'master-steward'
 */
export function classifyStewardGrade(avgGrandeur: number): StewardGrade {
  if (avgGrandeur >= 80) return 'master-steward'
  if (avgGrandeur >= 65) return 'palace-curator'
  if (avgGrandeur >= 50) return 'skilled-keeper'
  if (avgGrandeur >= 35) return 'apprentice'
  if (avgGrandeur >= 20) return 'novice'
  return 'squatter'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(pillars, grounds, estate, stats)
 */
export function generateRecommendations(
  pillars: SapphirePillar[],
  grounds: PavilionGround[],
  estate: SapphireEstate,
  stats: SapphirePavilionStats,
): string[] {
  const recs: string[] = []
  if (stats.avgGemClarity < 50) {
    recs.push('Polish gem clarity with explicit exports, documented interfaces, and self-documenting code patterns')
  }
  if (stats.avgPillarStrength < 50) {
    recs.push('Reinforce pillar strength with strict equality, type-safe foundations, and robust error handling')
  }
  if (stats.avgRoofProtection < 50) {
    recs.push('Raise roof protection with readonly properties, private encapsulation, and sealed interfaces')
  }
  if (stats.avgHallElegance < 50) {
    recs.push('Enhance hall elegance with clean APIs, intuitive return types, and well-documented named exports')
  }
  if (stats.avgFoundationDepth < 50) {
    recs.push('Deepen foundations with try/catch blocks, strict equality, and well-structured type systems')
  }
  if (stats.ruinsCount > 0) {
    recs.push(`${stats.ruinsCount} file(s) are ruins — they need complete reconstruction from the ground up`)
  }
  if (estate.overallGrandeur < 40) {
    recs.push('Overall grandeur is dangerously low — focus on gem clarity and pillar strength first')
  }
  const allWeak = grounds.every(g => g.groundType === 'no-ground' || g.groundType === 'dirt-patch')
  if (allWeak && grounds.length > 0) {
    recs.push('All pavilion grounds are weak — consider a major architectural renovation')
  }
  const ruinFiles = pillars.filter(p => p.condition === 'ruins').map(p => p.file)
  if (ruinFiles.length > 0 && ruinFiles.length <= 3) {
    recs.push(`Rebuild these ruined files: ${ruinFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The sapphire pavilion gleams with perfection! Every pillar radiates clarity, strength, protection, elegance, and depth')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as sapphire pillar
 * @example
 * const pillar = analyzeSapphirePillar(content, 'index.ts')
 * console.log(pillar.condition) // 'sapphire-masterpiece'
 */
export function analyzeSapphirePillar(content: string, filePath: string): SapphirePillar {
  const clarifying = measureClarifying(content)
  const bearing = measureBearing(content)
  const shielding = measureShielding(content)
  const welcoming = measureWelcoming(content)
  const grounding = measureGrounding(content)

  const qualityScore = Math.round(
    clarifying.clarity * 0.2 +
    bearing.strength * 0.2 +
    shielding.protection * 0.2 +
    welcoming.elegance * 0.2 +
    grounding.depth * 0.2,
  )

  return {
    file: filePath,
    gemClarity: clarifying.clarity,
    pillarStrength: bearing.strength,
    roofProtection: shielding.protection,
    hallElegance: welcoming.elegance,
    foundationDepth: grounding.depth,
    clarifying, bearing, shielding, welcoming, grounding,
    condition: classifyPillarCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as pavilion ground
 * @example
 * const ground = analyzePavilionGround(pillars, 'src')
 * console.log(ground.groundType) // 'palace-gardens'
 */
export function analyzePavilionGround(pillars: SapphirePillar[], dirPath: string): PavilionGround {
  if (pillars.length === 0) {
    return {
      directory: dirPath, pillars: [], avgClarity: 0, avgStrength: 0,
      avgDepth: 0, sapphireMasterpieceCount: 0, ruinsCount: 0,
      groundType: 'no-ground', condition: 'void',
    }
  }

  const avgClarity = Math.round(pillars.reduce((s, p) => s + p.gemClarity, 0) / pillars.length)
  const avgStrength = Math.round(pillars.reduce((s, p) => s + p.pillarStrength, 0) / pillars.length)
  const avgDepth = Math.round(pillars.reduce((s, p) => s + p.foundationDepth, 0) / pillars.length)
  const sapphireMasterpieceCount = pillars.filter(p => p.condition === 'sapphire-masterpiece').length
  const ruinsCount = pillars.filter(p => p.condition === 'ruins').length
  const avgQs = Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)

  return {
    directory: dirPath, pillars, avgClarity, avgStrength, avgDepth,
    sapphireMasterpieceCount, ruinsCount,
    groundType: classifyGroundType(pillars),
    condition: classifyGroundCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete sapphire pavilion result
 * @example
 * const result = await buildSapphirePavilionResult(files, contents)
 * console.log(result.stats.stewardGrade) // 'master-steward'
 */
export async function buildSapphirePavilionResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphirePavilionResult> {
  const pillars = files.map((file, i) => analyzeSapphirePillar(contents[i] ?? '', file))

  const dirMap = new Map<string, SapphirePillar[]>()
  for (const pillar of pillars) {
    const dir = path.dirname(pillar.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(pillar) } else { dirMap.set(dir, [pillar]) }
  }

  const grounds = Array.from(dirMap.entries()).map(([dir, dirPillars]) =>
    analyzePavilionGround(dirPillars, dir),
  )

  const avgClarity = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.gemClarity, 0) / pillars.length) : 0
  const avgStrength = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.pillarStrength, 0) / pillars.length) : 0
  const avgDepth = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.foundationDepth, 0) / pillars.length) : 0

  const overallGrandeur = pillars.length > 0
    ? Math.round((avgClarity + avgStrength + avgDepth) / 3) : 0
  const isMagnificent = avgClarity >= 60

  const estate: SapphireEstate = { avgClarity, avgStrength, avgDepth, isMagnificent, overallGrandeur }

  const avgRoofProtection = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.roofProtection, 0) / pillars.length) : 0
  const avgHallElegance = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.hallElegance, 0) / pillars.length) : 0
  const avgFoundationDepth = avgDepth

  const bestPillar = pillars.length > 0
    ? pillars.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const clearest = pillars.length > 0
    ? pillars.reduce((best, p) => p.gemClarity > best.gemClarity ? p : best).file : ''
  const strongest = pillars.length > 0
    ? pillars.reduce((best, p) => p.pillarStrength > best.pillarStrength ? p : best).file : ''
  const mostProtected = pillars.length > 0
    ? pillars.reduce((best, p) => p.roofProtection > best.roofProtection ? p : best).file : ''
  const deepest = pillars.length > 0
    ? pillars.reduce((best, p) => p.foundationDepth > best.foundationDepth ? p : best).file : ''

  const stats: SapphirePavilionStats = {
    totalFiles: pillars.length,
    totalGrounds: grounds.length,
    avgGemClarity: avgClarity,
    avgPillarStrength: avgStrength,
    avgRoofProtection,
    avgHallElegance,
    avgFoundationDepth,
    sapphireMasterpieceCount: pillars.filter(p => p.condition === 'sapphire-masterpiece').length,
    gemPavilionCount: pillars.filter(p => p.condition === 'gem-pavilion').length,
    properHallCount: pillars.filter(p => p.condition === 'proper-hall').length,
    stoneBuildingCount: pillars.filter(p => p.condition === 'stone-building').length,
    woodenHutCount: pillars.filter(p => p.condition === 'wooden-hut').length,
    ruinsCount: pillars.filter(p => p.condition === 'ruins').length,
    hasHighClarityCount: pillars.filter(p => p.clarifying.hasHighClarity).length,
    hasHighStrengthCount: pillars.filter(p => p.bearing.hasHighStrength).length,
    hasHighProtectionCount: pillars.filter(p => p.shielding.hasHighProtection).length,
    hasHighEleganceCount: pillars.filter(p => p.welcoming.hasHighElegance).length,
    hasHighDepthCount: pillars.filter(p => p.grounding.hasHighDepth).length,
    overallGrandeur,
    stewardGrade: classifyStewardGrade(overallGrandeur),
    bestPillar, clearest, strongest, mostProtected, deepest,
  }

  const recommendations = generateRecommendations(pillars, grounds, estate, stats)

  return { pillars, grounds, estate, stats, recommendations }
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
