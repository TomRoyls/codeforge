// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Volcano = 'crystal-flow' | 'clear-glass' | 'proper-obsidian' | 'cloudy-stone' | 'pumice' | 'no-clarity'
export type Edge = 'surgical-blade' | 'razor-edge' | 'proper-knife' | 'dull-blade' | 'blunt-rock' | 'no-edge'
export type Mirror = 'scrying-mirror' | 'true-reflection' | 'proper-glass' | 'foggy-mirror' | 'cracked-glass' | 'no-reflection'
export type Darkness = 'ancient-wisdom' | 'deep-knowledge' | 'proper-understanding' | 'partial-insight' | 'surface-level' | 'no-wisdom'
export type Dawn = 'sunrise-revelation' | 'morning-clarity' | 'proper-daybreak' | 'twilight-zone' | 'pre-dawn' | 'no-emergence'
export type ShardCondition = 'volcanic-masterpiece' | 'razor-obsidian' | 'proper-glass' | 'rough-stone' | 'gravel' | 'dust'
export type CaveType = 'volcanic-chamber' | 'obsidian-gallery' | 'proper-cavern' | 'small-cave' | 'surface-crack' | 'no-cave'
export type CaveCondition = 'magnificent-grotto' | 'beautiful-cavern' | 'proper-cave' | 'rough-tunnel' | 'collapsed-mine' | 'void'
export type LapidaryGrade = 'master-flintknapper' | 'expert-knapper' | 'skilled-shaper' | 'apprentice' | 'novice' | 'rock-collector'

export interface FormingMeasure {
  clarity: number
  volcano: Volcano
  hasHighClarity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasVisible: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface HoningMeasure {
  sharpness: number
  edge: Edge
  hasHighSharpness: boolean
  hasPrecise: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasDecisive: boolean
  hasNoAmbiguous: boolean
  hasSharp: boolean
  hasNoVague: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasCrystalline: boolean
  approximateCount: number
  vagueCount: number
}

export interface ReflectingMeasure {
  depth: number
  mirror: Mirror
  hasHighDepth: boolean
  hasDocumented: boolean
  hasWellCommented: boolean
  hasNoUndocumented: boolean
  hasIntrospective: boolean
  hasNoShallow: boolean
  hasSelfAware: boolean
  hasNoBlind: boolean
  hasReflective: boolean
  hasNoOpaque: boolean
  hasInsightful: boolean
  undocumentedCount: number
  shallowCount: number
}

export interface KnowingMeasure {
  wisdom: number
  darkness: Darkness
  hasHighWisdom: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasEdgeCaseCovered: boolean
  hasNoSinglePath: boolean
  hasValidated: boolean
  hasNoTrusting: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasBattleTested: boolean
  hasNoOptimistic: boolean
  bareCrashCount: number
  singlePathCount: number
}

export interface EmergingMeasure {
  emergence: number
  dawn: Dawn
  hasHighEmergence: boolean
  hasSimplified: boolean
  hasNoOverComplex: boolean
  hasAbstracted: boolean
  hasNoConcreteSoup: boolean
  hasClean: boolean
  hasNoSpaghetti: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasClear: boolean
  hasNoMurky: boolean
  overComplexCount: number
  spaghettiCount: number
}

export interface ObsidianShard {
  file: string
  volcanicClarity: number
  edgeSharpness: number
  mirrorDepth: number
  darkWisdom: number
  dawnEmergence: number
  forming: FormingMeasure
  honing: HoningMeasure
  reflecting: ReflectingMeasure
  knowing: KnowingMeasure
  emerging: EmergingMeasure
  condition: ShardCondition
  qualityScore: number
}

export interface ObsidianCave {
  directory: string
  shards: ObsidianShard[]
  avgClarity: number
  avgSharpness: number
  avgWisdom: number
  volcanicMasterpieceCount: number
  dustCount: number
  caveType: CaveType
  condition: CaveCondition
}

export interface ObsidianVolcano {
  avgClarity: number
  avgSharpness: number
  avgWisdom: number
  isVolcanic: boolean
  overallLuminosity: number
}

export interface ObsidianDawnStats {
  totalFiles: number
  totalCaves: number
  avgVolcanicClarity: number
  avgEdgeSharpness: number
  avgMirrorDepth: number
  avgDarkWisdom: number
  avgDawnEmergence: number
  volcanicMasterpieceCount: number
  razorObsidianCount: number
  properGlassCount: number
  roughStoneCount: number
  gravelCount: number
  dustCount: number
  hasHighClarityCount: number
  hasHighSharpnessCount: number
  hasHighDepthCount: number
  hasHighWisdomCount: number
  hasHighEmergenceCount: number
  overallLuminosity: number
  lapidaryGrade: LapidaryGrade
  bestShard: string
  clearest: string
  sharpest: string
  deepest: string
  wisest: string
}

export interface ObsidianDawnResult {
  shards: ObsidianShard[]
  caves: ObsidianCave[]
  volcano: ObsidianVolcano
  stats: ObsidianDawnStats
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
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)

// ─── Grade Helpers ─────────────────────────────────────────────────

function classifyVolcano(clarity: number): Volcano {
  if (clarity >= 85) return 'crystal-flow'
  if (clarity >= 70) return 'clear-glass'
  if (clarity >= 55) return 'proper-obsidian'
  if (clarity >= 40) return 'cloudy-stone'
  if (clarity >= 25) return 'pumice'
  return 'no-clarity'
}

function classifyEdge(sharpness: number): Edge {
  if (sharpness >= 85) return 'surgical-blade'
  if (sharpness >= 70) return 'razor-edge'
  if (sharpness >= 55) return 'proper-knife'
  if (sharpness >= 40) return 'dull-blade'
  if (sharpness >= 25) return 'blunt-rock'
  return 'no-edge'
}

function classifyMirror(depth: number): Mirror {
  if (depth >= 85) return 'scrying-mirror'
  if (depth >= 70) return 'true-reflection'
  if (depth >= 55) return 'proper-glass'
  if (depth >= 40) return 'foggy-mirror'
  if (depth >= 25) return 'cracked-glass'
  return 'no-reflection'
}

function classifyDarkness(wisdom: number): Darkness {
  if (wisdom >= 85) return 'ancient-wisdom'
  if (wisdom >= 70) return 'deep-knowledge'
  if (wisdom >= 55) return 'proper-understanding'
  if (wisdom >= 40) return 'partial-insight'
  if (wisdom >= 25) return 'surface-level'
  return 'no-wisdom'
}

function classifyDawn(emergence: number): Dawn {
  if (emergence >= 85) return 'sunrise-revelation'
  if (emergence >= 70) return 'morning-clarity'
  if (emergence >= 55) return 'proper-daybreak'
  if (emergence >= 40) return 'twilight-zone'
  if (emergence >= 25) return 'pre-dawn'
  return 'no-emergence'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure volcanic clarity (pressure-formed readability)
 * @example
 * const m = measureForming(content)
 * console.log(m.volcano) // 'crystal-flow'
 */
export function measureForming(content: string): FormingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasReadable = hasExport(content) && hasInterface(content)
  const hasTransparent = hasDocComments(content) && hasReturnType(content)
  const hasClear = hasConst(content) && hasNamedExport(content)
  const hasSelfDocumenting = hasTypeAlias(content) && hasReadonly(content)
  const hasUnderstandable = hasGenerics(content) && hasOptional(content)
  const hasVisible = hasPrivate(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bany\b/, content)
  const crypticCount = countMatches(/\bvar\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoMystery = countMatches(/\beval\b/, content) === 0
  const hasNoArcane = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  return {
    clarity, volcano: classifyVolcano(clarity), hasHighClarity, hasReadable, hasTransparent,
    hasNoObfuscated, hasClear, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasUnderstandable,
    hasNoArcane, hasVisible, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure edge sharpness (precision/decisiveness)
 * @example
 * const m = measureHoning(content)
 * console.log(m.edge) // 'surgical-blade'
 */
export function measureHoning(content: string): HoningMeasure {
  let score = 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasAsync(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasPrecise = hasReturnType(content) && hasReadonly(content)
  const hasExact = hasEnum(content) && hasInterface(content)
  const hasDecisive = hasConst(content) && hasTypeAlias(content)
  const hasSharp = hasExport(content) && hasGenerics(content)
  const hasDefined = hasOptional(content) && hasPrivate(content)
  const hasCrystalline = hasAsync(content) && hasDocComments(content)

  score += hasPrecise ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasDecisive ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0
  score += hasCrystalline ? 5 : 0

  const sharpness = Math.min(score, 100)
  const approximateCount = countMatches(/\bany\b/, content)
  const vagueCount = countMatches(/\bvar\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoAmbiguous = vagueCount === 0
  const hasNoVague = countMatches(/\beval\b/, content) === 0
  const hasNoFuzzy = !has(/\bdebugger\b/, content)
  const hasHighSharpness = sharpness >= 70

  return {
    sharpness, edge: classifyEdge(sharpness), hasHighSharpness, hasPrecise, hasExact,
    hasNoApproximate, hasDecisive, hasNoAmbiguous, hasSharp, hasNoVague, hasDefined,
    hasNoFuzzy, hasCrystalline, approximateCount, vagueCount,
  }
}

/**
 * Measure mirror depth (reflective/introspective quality)
 * @example
 * const m = measureReflecting(content)
 * console.log(m.mirror) // 'scrying-mirror'
 */
export function measureReflecting(content: string): ReflectingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasEnum(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0

  const hasDocumented = hasDocComments(content) && hasInterface(content)
  const hasWellCommented = hasReturnType(content) && hasAsync(content)
  const hasIntrospective = hasExport(content) && hasReadonly(content)
  const hasSelfAware = hasConst(content) && hasTypeAlias(content)
  const hasReflective = hasGenerics(content) && hasPrivate(content)
  const hasInsightful = hasEnum(content) && hasOptional(content)

  score += hasDocumented ? 5 : 0
  score += hasWellCommented ? 5 : 0
  score += hasIntrospective ? 5 : 0
  score += hasSelfAware ? 5 : 0
  score += hasReflective ? 5 : 0
  score += hasInsightful ? 5 : 0

  const depth = Math.min(score, 100)
  const undocumentedCount = countMatches(/\bvar\b/, content)
  const shallowCount = countMatches(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoShallow = shallowCount === 0
  const hasNoBlind = countMatches(/\beval\b/, content) === 0
  const hasNoOpaque = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  return {
    depth, mirror: classifyMirror(depth), hasHighDepth, hasDocumented, hasWellCommented,
    hasNoUndocumented, hasIntrospective, hasNoShallow, hasSelfAware, hasNoBlind, hasReflective,
    hasNoOpaque, hasInsightful, undocumentedCount, shallowCount,
  }
}

/**
 * Measure dark wisdom (failure-mode knowledge)
 * @example
 * const m = measureKnowing(content)
 * console.log(m.darkness) // 'ancient-wisdom'
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasErrorHandled = hasTryCatch(content) && hasThrow(content)
  const hasEdgeCaseCovered = hasInterface(content) && hasOptional(content)
  const hasValidated = hasReadonly(content) && hasEnum(content)
  const hasDefensive = hasTypeAlias(content) && hasReturnType(content)
  const hasBattleTested = hasExport(content) && hasConst(content)
  const hasNoOptimistic = hasGenerics(content) && hasAsync(content)

  score += hasErrorHandled ? 5 : 0
  score += hasEdgeCaseCovered ? 5 : 0
  score += hasValidated ? 5 : 0
  score += hasDefensive ? 5 : 0
  score += hasBattleTested ? 5 : 0
  score += hasNoOptimistic ? 5 : 0

  const wisdom = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const singlePathCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoSinglePath = singlePathCount === 0
  const hasNoTrusting = countMatches(/\beval\b/, content) === 0
  const hasNoNaive = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  return {
    wisdom, darkness: classifyDarkness(wisdom), hasHighWisdom, hasErrorHandled, hasNoBareCrash,
    hasEdgeCaseCovered, hasNoSinglePath, hasValidated, hasNoTrusting, hasDefensive, hasNoNaive,
    hasBattleTested, hasNoOptimistic, bareCrashCount, singlePathCount,
  }
}

/**
 * Measure dawn emergence (complexity-to-clarity)
 * @example
 * const m = measureEmerging(content)
 * console.log(m.dawn) // 'sunrise-revelation'
 */
export function measureEmerging(content: string): EmergingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTryCatch(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0

  const hasSimplified = hasInterface(content) && hasExport(content)
  const hasAbstracted = hasConst(content) && hasReturnType(content)
  const hasClean = hasEnum(content) && hasTypeAlias(content)
  const hasElegant = hasReadonly(content) && hasDocComments(content)
  const hasClear = hasGenerics(content) && hasAsync(content)
  const hasNoMurky = hasTryCatch(content) && hasOptional(content)

  score += hasSimplified ? 5 : 0
  score += hasAbstracted ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasNoMurky ? 5 : 0

  const emergence = Math.min(score, 100)
  const overComplexCount = countMatches(/\bvar\b/, content)
  const spaghettiCount = countMatches(/\bany\b/, content)

  const hasNoOverComplex = overComplexCount === 0
  const hasNoConcreteSoup = spaghettiCount === 0
  const hasNoSpaghetti = countMatches(/\beval\b/, content) === 0
  const hasNoClunky = !has(/\bdebugger\b/, content)
  const hasHighEmergence = emergence >= 70

  return {
    emergence, dawn: classifyDawn(emergence), hasHighEmergence, hasSimplified, hasNoOverComplex,
    hasAbstracted, hasNoConcreteSoup, hasClean, hasNoSpaghetti, hasElegant, hasNoClunky,
    hasClear, hasNoMurky, overComplexCount, spaghettiCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify shard condition
 * @example
 * classifyShardCondition(90) // 'volcanic-masterpiece'
 */
export function classifyShardCondition(score: number): ShardCondition {
  if (score >= 85) return 'volcanic-masterpiece'
  if (score >= 70) return 'razor-obsidian'
  if (score >= 55) return 'proper-glass'
  if (score >= 40) return 'rough-stone'
  if (score >= 25) return 'gravel'
  return 'dust'
}

/**
 * Classify cave type
 * @example
 * classifyCaveType(shards) // 'volcanic-chamber'
 */
export function classifyCaveType(shards: ObsidianShard[]): CaveType {
  if (shards.length === 0) return 'no-cave'
  const avgQs = Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
  const masterpieceRatio = shards.filter(sh => sh.condition === 'volcanic-masterpiece').length / shards.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'volcanic-chamber'
  if (avgQs >= 60) return 'obsidian-gallery'
  if (avgQs >= 45) return 'proper-cavern'
  if (avgQs >= 30) return 'small-cave'
  if (avgQs >= 15) return 'surface-crack'
  return 'no-cave'
}

/**
 * Classify cave condition
 * @example
 * classifyCaveCondition(80) // 'magnificent-grotto'
 */
export function classifyCaveCondition(avgQs: number): CaveCondition {
  if (avgQs >= 75) return 'magnificent-grotto'
  if (avgQs >= 60) return 'beautiful-cavern'
  if (avgQs >= 45) return 'proper-cave'
  if (avgQs >= 30) return 'rough-tunnel'
  if (avgQs >= 15) return 'collapsed-mine'
  return 'void'
}

/**
 * Classify lapidary grade
 * @example
 * classifyLapidaryGrade(85) // 'master-flintknapper'
 */
export function classifyLapidaryGrade(avgLuminosity: number): LapidaryGrade {
  if (avgLuminosity >= 80) return 'master-flintknapper'
  if (avgLuminosity >= 65) return 'expert-knapper'
  if (avgLuminosity >= 50) return 'skilled-shaper'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'rock-collector'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(shards, caves, volcano, stats)
 */
export function generateRecommendations(
  shards: ObsidianShard[],
  caves: ObsidianCave[],
  volcano: ObsidianVolcano,
  stats: ObsidianDawnStats,
): string[] {
  const recs: string[] = []
  if (stats.avgVolcanicClarity < 50) {
    recs.push('Forge clearer obsidian with readable exports, transparent documentation, and clean type architecture')
  }
  if (stats.avgEdgeSharpness < 50) {
    recs.push('Hone sharper edges with precise return types, exact enums, and decisive const patterns')
  }
  if (stats.avgMirrorDepth < 50) {
    recs.push('Polish deeper mirrors with documented interfaces, well-commented return types, and introspective export patterns')
  }
  if (stats.avgDarkWisdom < 50) {
    recs.push('Gain dark wisdom with error-handling try-catch blocks, edge-case optional properties, and defensive type aliases')
  }
  if (stats.avgDawnEmergence < 50) {
    recs.push('Let dawn emerge through simplified interfaces, abstracted const patterns, and clean enum architecture')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} shard(s) are dust — they need volcanic pressure to become obsidian`)
  }
  if (volcano.overallLuminosity < 40) {
    recs.push('Overall luminosity is dangerously low — focus on volcanic clarity and dark wisdom first')
  }
  const allWeak = caves.every(c => c.caveType === 'no-cave' || c.caveType === 'surface-crack')
  if (allWeak && caves.length > 0) {
    recs.push('All caves are surface cracks — consider a major refactoring of the entire codebase')
  }
  const dustFiles = shards.filter(sh => sh.condition === 'dust').map(sh => sh.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Reforge these dust shards: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The obsidian gleams with volcanic perfection! Every shard radiates clarity, sharpness, and dark wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as obsidian shard
 * @example
 * const shard = analyzeObsidianShard(content, 'index.ts')
 * console.log(shard.condition) // 'volcanic-masterpiece'
 */
export function analyzeObsidianShard(content: string, filePath: string): ObsidianShard {
  const forming = measureForming(content)
  const honing = measureHoning(content)
  const reflecting = measureReflecting(content)
  const knowing = measureKnowing(content)
  const emerging = measureEmerging(content)

  const qualityScore = Math.round(
    forming.clarity * 0.2 +
    honing.sharpness * 0.2 +
    reflecting.depth * 0.2 +
    knowing.wisdom * 0.2 +
    emerging.emergence * 0.2,
  )

  return {
    file: filePath,
    volcanicClarity: forming.clarity,
    edgeSharpness: honing.sharpness,
    mirrorDepth: reflecting.depth,
    darkWisdom: knowing.wisdom,
    dawnEmergence: emerging.emergence,
    forming, honing, reflecting, knowing, emerging,
    condition: classifyShardCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as obsidian cave
 * @example
 * const cave = analyzeObsidianCave(shards, 'src')
 * console.log(cave.caveType) // 'volcanic-chamber'
 */
export function analyzeObsidianCave(shards: ObsidianShard[], dirPath: string): ObsidianCave {
  if (shards.length === 0) {
    return {
      directory: dirPath, shards: [], avgClarity: 0, avgSharpness: 0,
      avgWisdom: 0, volcanicMasterpieceCount: 0, dustCount: 0,
      caveType: 'no-cave', condition: 'void',
    }
  }

  const avgClarity = Math.round(shards.reduce((s, sh) => s + sh.volcanicClarity, 0) / shards.length)
  const avgSharpness = Math.round(shards.reduce((s, sh) => s + sh.edgeSharpness, 0) / shards.length)
  const avgWisdom = Math.round(shards.reduce((s, sh) => s + sh.darkWisdom, 0) / shards.length)
  const volcanicMasterpieceCount = shards.filter(sh => sh.condition === 'volcanic-masterpiece').length
  const dustCount = shards.filter(sh => sh.condition === 'dust').length
  const avgQs = Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)

  return {
    directory: dirPath, shards, avgClarity, avgSharpness, avgWisdom,
    volcanicMasterpieceCount, dustCount,
    caveType: classifyCaveType(shards),
    condition: classifyCaveCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete obsidian dawn result
 * @example
 * const result = await buildObsidianDawnResult(files, contents)
 * console.log(result.stats.lapidaryGrade) // 'master-flintknapper'
 */
export async function buildObsidianDawnResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianDawnResult> {
  const shards = files.map((file, i) => analyzeObsidianShard(contents[i] ?? '', file))

  const dirMap = new Map<string, ObsidianShard[]>()
  for (const shard of shards) {
    const dir = path.dirname(shard.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(shard) } else { dirMap.set(dir, [shard]) }
  }

  const caves = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeObsidianCave(dirShards, dir),
  )

  const avgClarity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.volcanicClarity, 0) / shards.length) : 0
  const avgSharpness = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.edgeSharpness, 0) / shards.length) : 0
  const avgWisdom = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.darkWisdom, 0) / shards.length) : 0

  const overallLuminosity = shards.length > 0
    ? Math.round((avgClarity + avgSharpness + avgWisdom) / 3) : 0
  const isVolcanic = avgClarity >= 60

  const volcano: ObsidianVolcano = { avgClarity, avgSharpness, avgWisdom, isVolcanic, overallLuminosity }

  const avgMirrorDepth = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.mirrorDepth, 0) / shards.length) : 0
  const avgDawnEmergence = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.dawnEmergence, 0) / shards.length) : 0

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file : ''
  const clearest = shards.length > 0
    ? shards.reduce((best, sh) => sh.volcanicClarity > best.volcanicClarity ? sh : best).file : ''
  const sharpest = shards.length > 0
    ? shards.reduce((best, sh) => sh.edgeSharpness > best.edgeSharpness ? sh : best).file : ''
  const deepest = shards.length > 0
    ? shards.reduce((best, sh) => sh.mirrorDepth > best.mirrorDepth ? sh : best).file : ''
  const wisest = shards.length > 0
    ? shards.reduce((best, sh) => sh.darkWisdom > best.darkWisdom ? sh : best).file : ''

  const stats: ObsidianDawnStats = {
    totalFiles: shards.length,
    totalCaves: caves.length,
    avgVolcanicClarity: avgClarity,
    avgEdgeSharpness: avgSharpness,
    avgMirrorDepth,
    avgDarkWisdom: avgWisdom,
    avgDawnEmergence,
    volcanicMasterpieceCount: shards.filter(sh => sh.condition === 'volcanic-masterpiece').length,
    razorObsidianCount: shards.filter(sh => sh.condition === 'razor-obsidian').length,
    properGlassCount: shards.filter(sh => sh.condition === 'proper-glass').length,
    roughStoneCount: shards.filter(sh => sh.condition === 'rough-stone').length,
    gravelCount: shards.filter(sh => sh.condition === 'gravel').length,
    dustCount: shards.filter(sh => sh.condition === 'dust').length,
    hasHighClarityCount: shards.filter(sh => sh.forming.hasHighClarity).length,
    hasHighSharpnessCount: shards.filter(sh => sh.honing.hasHighSharpness).length,
    hasHighDepthCount: shards.filter(sh => sh.reflecting.hasHighDepth).length,
    hasHighWisdomCount: shards.filter(sh => sh.knowing.hasHighWisdom).length,
    hasHighEmergenceCount: shards.filter(sh => sh.emerging.hasHighEmergence).length,
    overallLuminosity,
    lapidaryGrade: classifyLapidaryGrade(overallLuminosity),
    bestShard, clearest, sharpest, deepest, wisest,
  }

  const recommendations = generateRecommendations(shards, caves, volcano, stats)

  return { shards, caves, volcano, stats, recommendations }
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
