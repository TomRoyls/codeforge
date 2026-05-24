// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Patina = 'noble-verdigris' | 'aged-copper' | 'proper-patina' | 'tarnished-metal' | 'corroded-wire' | 'no-patina'
export type Dawn = 'rose-gold-dawn' | 'warm-morning' | 'proper-daybreak' | 'grey-dawn' | 'dark-morning' | 'no-dawn'
export type Flow = 'superconductor' | 'excellent-conductor' | 'proper-wire' | 'resistive-path' | 'insulated-wire' | 'no-flow'
export type Warmth = 'warm-hearth' | 'gentle-warmth' | 'proper-temperature' | 'cold-metal' | 'freezing-wire' | 'no-warmth'
export type Forge = 'masterwork-forge' | 'well-forged' | 'proper-temper' | 'weak-alloy' | 'brittle-metal' | 'no-strength'
export type RayCondition = 'masterwork-copper' | 'aged-bronze' | 'proper-copper' | 'tarnished-metal' | 'rusty-wire' | 'scrap'
export type ForgeType = 'grand-foundry' | 'proper-forge' | 'workshop' | 'small-anvil' | 'campfire' | 'no-forge'
export type ForgeCondition = 'golden-age' | 'prosperous-era' | 'proper-workshop' | 'rusty-shed' | 'abandoned-mine' | 'void'
export type SmithGrade = 'master-smith' | 'expert-forger' | 'skilled-metallurgist' | 'apprentice' | 'novice' | 'scrap-collector'

export interface AgingMeasure {
  wisdom: number
  patina: Patina
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasBattleTested: boolean
  adHocCount: number
  experimentalCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dawn: Dawn
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasInviting: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ConductingMeasure {
  quality: number
  flow: Flow
  hasHighQuality: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  bottleneckCount: number
  tangledCount: number
}

export interface ComfortingMeasure {
  resilience: number
  warmth: Warmth
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasGraceful: boolean
  hasNoHarsh: boolean
  hasHelpful: boolean
  hasNoCryptic: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasForgiving: boolean
  hasNoStrict: boolean
  hasCompassionate: boolean
  bareCrashCount: number
  harshCount: number
}

export interface StrengtheningMeasure {
  strength: number
  forge: Forge
  hasHighStrength: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasSolid: boolean
  hasNoShaky: boolean
  hasDurable: boolean
  hasNoBreakable: boolean
  untestedCount: number
  fragileCount: number
}

export interface CopperRay {
  file: string
  patinaWisdom: number
  dawnClarity: number
  conductivityQuality: number
  warmthResilience: number
  forgeStrength: number
  aging: AgingMeasure
  illuminating: IlluminatingMeasure
  conducting: ConductingMeasure
  comforting: ComfortingMeasure
  strengthening: StrengtheningMeasure
  condition: RayCondition
  qualityScore: number
}

export interface CopperForge {
  directory: string
  rays: CopperRay[]
  avgWisdom: number
  avgClarity: number
  avgStrength: number
  masterworkCopperCount: number
  scrapCount: number
  forgeType: ForgeType
  condition: ForgeCondition
}

export interface CopperFoundry {
  avgWisdom: number
  avgClarity: number
  avgStrength: number
  isMasterwork: boolean
  overallLuster: number
}

export interface CopperDawnStats {
  totalFiles: number
  totalForges: number
  avgPatinaWisdom: number
  avgDawnClarity: number
  avgConductivityQuality: number
  avgWarmthResilience: number
  avgForgeStrength: number
  masterworkCopperCount: number
  agedBronzeCount: number
  properCopperCount: number
  tarnishedMetalCount: number
  rustyWireCount: number
  scrapCount: number
  hasHighWisdomCount: number
  hasHighClarityCount: number
  hasHighQualityCount: number
  hasHighResilienceCount: number
  hasHighStrengthCount: number
  overallLuster: number
  smithGrade: SmithGrade
  bestRay: string
  wisest: string
  clearest: string
  mostConductive: string
  strongest: string
}

export interface CopperDawnResult {
  rays: CopperRay[]
  forges: CopperForge[]
  foundry: CopperFoundry
  stats: CopperDawnStats
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

function classifyPatina(wisdom: number): Patina {
  if (wisdom >= 85) return 'noble-verdigris'
  if (wisdom >= 70) return 'aged-copper'
  if (wisdom >= 55) return 'proper-patina'
  if (wisdom >= 40) return 'tarnished-metal'
  if (wisdom >= 25) return 'corroded-wire'
  return 'no-patina'
}

function classifyDawn(clarity: number): Dawn {
  if (clarity >= 85) return 'rose-gold-dawn'
  if (clarity >= 70) return 'warm-morning'
  if (clarity >= 55) return 'proper-daybreak'
  if (clarity >= 40) return 'grey-dawn'
  if (clarity >= 25) return 'dark-morning'
  return 'no-dawn'
}

function classifyFlow(quality: number): Flow {
  if (quality >= 85) return 'superconductor'
  if (quality >= 70) return 'excellent-conductor'
  if (quality >= 55) return 'proper-wire'
  if (quality >= 40) return 'resistive-path'
  if (quality >= 25) return 'insulated-wire'
  return 'no-flow'
}

function classifyWarmth(resilience: number): Warmth {
  if (resilience >= 85) return 'warm-hearth'
  if (resilience >= 70) return 'gentle-warmth'
  if (resilience >= 55) return 'proper-temperature'
  if (resilience >= 40) return 'cold-metal'
  if (resilience >= 25) return 'freezing-wire'
  return 'no-warmth'
}

function classifyForgeGrade(strength: number): Forge {
  if (strength >= 85) return 'masterwork-forge'
  if (strength >= 70) return 'well-forged'
  if (strength >= 55) return 'proper-temper'
  if (strength >= 40) return 'weak-alloy'
  if (strength >= 25) return 'brittle-metal'
  return 'no-strength'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure patina wisdom (maturity through aging)
 * @example
 * const m = measureAging(content)
 * console.log(m.patina) // 'noble-verdigris'
 */
export function measureAging(content: string): AgingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasDocumented = hasDocComments(content) && hasInterface(content)
  const hasWellStructured = hasReturnType(content) && hasConst(content)
  const hasProven = hasExport(content) && hasReadonly(content)
  const hasMature = hasGenerics(content) && hasPrivate(content)
  const hasEstablished = hasOptional(content) && hasAsync(content)
  const hasBattleTested = hasEnum(content) && hasTypeAlias(content)

  score += hasDocumented ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasProven ? 5 : 0
  score += hasMature ? 5 : 0
  score += hasEstablished ? 5 : 0
  score += hasBattleTested ? 5 : 0

  const wisdom = Math.min(score, 100)
  const adHocCount = countMatches(/\bvar\b/, content)
  const experimentalCount = countMatches(/\beval\b/, content)

  const hasNoAdHoc = adHocCount === 0
  const hasNoExperimental = experimentalCount === 0
  const hasNoNaive = !has(/\bdebugger\b/, content)
  const hasNoNovel = countMatches(/\bany\b/, content) === 0
  const hasHighWisdom = wisdom >= 70

  return {
    wisdom, patina: classifyPatina(wisdom), hasHighWisdom, hasDocumented, hasWellStructured,
    hasNoAdHoc, hasProven, hasNoExperimental, hasMature, hasNoNaive, hasEstablished,
    hasNoNovel, hasBattleTested, adHocCount, experimentalCount,
  }
}

/**
 * Measure dawn clarity (first-glance readability)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.dawn) // 'rose-gold-dawn'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
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
  const hasSelfDocumenting = hasDocComments(content) && hasReturnType(content)
  const hasClear = hasConst(content) && hasNamedExport(content)
  const hasTransparent = hasTypeAlias(content) && hasReadonly(content)
  const hasApproachable = hasGenerics(content) && hasOptional(content)
  const hasInviting = hasPrivate(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasInviting ? 5 : 0

  const clarity = Math.min(score, 100)
  const crypticCount = countMatches(/\bany\b/, content)
  const obfuscatedCount = countMatches(/\bvar\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoHidden = countMatches(/\beval\b/, content) === 0
  const hasNoIntimidating = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  return {
    clarity, dawn: classifyDawn(clarity), hasHighClarity, hasReadable, hasSelfDocumenting,
    hasNoCryptic, hasClear, hasNoObfuscated, hasTransparent, hasNoHidden, hasApproachable,
    hasNoIntimidating, hasInviting, crypticCount, obfuscatedCount,
  }
}

/**
 * Measure conductivity quality (data flow efficiency)
 * @example
 * const m = measureConducting(content)
 * console.log(m.flow) // 'superconductor'
 */
export function measureConducting(content: string): ConductingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasEfficientFlow = hasInterface(content) && hasReturnType(content)
  const hasStreamlined = hasReadonly(content) && hasTypeAlias(content)
  const hasDirectPaths = hasEnum(content) && hasConst(content)
  const hasCleanPipelines = hasExport(content) && hasOptional(content)
  const hasOptimized = hasGenerics(content) && hasDocComments(content)

  score += hasEfficientFlow ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasCleanPipelines ? 5 : 0
  score += hasOptimized ? 5 : 0

  const quality = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const tangledCount = countMatches(/\bany\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoCircuits = countMatches(/\beval\b/, content) === 0
  const hasNoIndirection = countMatches(/\bconsole\.log\b/, content) === 0
  const hasNoTangled = tangledCount === 0
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  return {
    quality, flow: classifyFlow(quality), hasHighQuality, hasEfficientFlow, hasNoBottlenecks,
    hasStreamlined, hasNoCircuits, hasDirectPaths, hasNoIndirection, hasCleanPipelines,
    hasNoTangled, hasOptimized, hasNoWasteful, bottleneckCount, tangledCount,
  }
}

/**
 * Measure warmth resilience (friendly error handling)
 * @example
 * const m = measureComforting(content)
 * console.log(m.warmth) // 'warm-hearth'
 */
export function measureComforting(content: string): ComfortingMeasure {
  let score = 0
  score += hasAsync(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasEnum(content) ? 4 : 0

  const hasErrorHandled = hasAsync(content) && hasTryCatch(content)
  const hasGraceful = hasReturnType(content) && hasExport(content)
  const hasHelpful = hasConst(content) && hasThrow(content)
  const hasRecoverable = hasInterface(content) && hasGenerics(content)
  const hasForgiving = hasReadonly(content) && hasDocComments(content)
  const hasCompassionate = hasPrivate(content) && hasEnum(content)

  score += hasErrorHandled ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasHelpful ? 5 : 0
  score += hasRecoverable ? 5 : 0
  score += hasForgiving ? 5 : 0
  score += hasCompassionate ? 5 : 0

  const resilience = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const harshCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoHarsh = harshCount === 0
  const hasNoCryptic = countMatches(/\beval\b/, content) === 0
  const hasNoFatal = !has(/\bdebugger\b/, content)
  const hasNoStrict = countMatches(/\bconsole\.log\b/, content) === 0
  const hasHighResilience = resilience >= 70

  return {
    resilience, warmth: classifyWarmth(resilience), hasHighResilience, hasErrorHandled,
    hasNoBareCrash, hasGraceful, hasNoHarsh, hasHelpful, hasNoCryptic, hasRecoverable,
    hasNoFatal, hasForgiving, hasNoStrict, hasCompassionate, bareCrashCount, harshCount,
  }
}

/**
 * Measure forge strength (structural robustness)
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.forge) // 'masterwork-forge'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasTested = hasInterface(content) && hasTryCatch(content)
  const hasTypeSafe = hasReadonly(content) && hasOptional(content)
  const hasRobust = hasThrow(content) && hasTypeAlias(content)
  const hasSolid = hasEnum(content) && hasConst(content)
  const hasDurable = hasExport(content) && hasReturnType(content)

  score += hasTested ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasDurable ? 5 : 0

  const strength = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const fragileCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoUnsafe = countMatches(/\beval\b/, content) === 0
  const hasNoFragile = fragileCount === 0
  const hasNoShaky = !has(/\bdebugger\b/, content)
  const hasNoBreakable = countMatches(/\bconsole\.log\b/, content) === 0
  const hasHighStrength = strength >= 70

  return {
    strength, forge: classifyForgeGrade(strength), hasHighStrength, hasTested, hasNoUntested,
    hasTypeSafe, hasNoUnsafe, hasRobust, hasNoFragile, hasSolid, hasNoShaky, hasDurable,
    hasNoBreakable, untestedCount, fragileCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ray condition
 * @example
 * classifyRayCondition(90) // 'masterwork-copper'
 */
export function classifyRayCondition(score: number): RayCondition {
  if (score >= 85) return 'masterwork-copper'
  if (score >= 70) return 'aged-bronze'
  if (score >= 55) return 'proper-copper'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 25) return 'rusty-wire'
  return 'scrap'
}

/**
 * Classify forge type
 * @example
 * classifyForgeType(rays) // 'grand-foundry'
 */
export function classifyForgeType(rays: CopperRay[]): ForgeType {
  if (rays.length === 0) return 'no-forge'
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const masterpieceRatio = rays.filter(r => r.condition === 'masterwork-copper').length / rays.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'grand-foundry'
  if (avgQs >= 60) return 'proper-forge'
  if (avgQs >= 45) return 'workshop'
  if (avgQs >= 30) return 'small-anvil'
  if (avgQs >= 15) return 'campfire'
  return 'no-forge'
}

/**
 * Classify forge condition
 * @example
 * classifyForgeCondition(80) // 'golden-age'
 */
export function classifyForgeCondition(avgQs: number): ForgeCondition {
  if (avgQs >= 75) return 'golden-age'
  if (avgQs >= 60) return 'prosperous-era'
  if (avgQs >= 45) return 'proper-workshop'
  if (avgQs >= 30) return 'rusty-shed'
  if (avgQs >= 15) return 'abandoned-mine'
  return 'void'
}

/**
 * Classify smith grade
 * @example
 * classifySmithGrade(85) // 'master-smith'
 */
export function classifySmithGrade(avgLuster: number): SmithGrade {
  if (avgLuster >= 80) return 'master-smith'
  if (avgLuster >= 65) return 'expert-forger'
  if (avgLuster >= 50) return 'skilled-metallurgist'
  if (avgLuster >= 35) return 'apprentice'
  if (avgLuster >= 20) return 'novice'
  return 'scrap-collector'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(rays, forges, foundry, stats)
 */
export function generateRecommendations(
  rays: CopperRay[],
  forges: CopperForge[],
  foundry: CopperFoundry,
  stats: CopperDawnStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPatinaWisdom < 50) {
    recs.push('Develop patina wisdom with documented interfaces, proven patterns, and mature type architecture')
  }
  if (stats.avgDawnClarity < 50) {
    recs.push('Improve dawn clarity with readable exports, self-documenting return types, and clear named exports')
  }
  if (stats.avgConductivityQuality < 50) {
    recs.push('Enhance conductivity with efficient interfaces, streamlined readonly types, and clean data pipelines')
  }
  if (stats.avgWarmthResilience < 50) {
    recs.push('Warm up error handling with graceful async patterns, helpful try-catch blocks, and compassionate error messages')
  }
  if (stats.avgForgeStrength < 50) {
    recs.push('Strengthen forge with tested interfaces, type-safe readonly properties, and solid structural foundations')
  }
  if (stats.scrapCount > 0) {
    recs.push(`${stats.scrapCount} file(s) are scrap metal — they need to be forged anew on the anvil`)
  }
  if (foundry.overallLuster < 40) {
    recs.push('Overall luster is dangerously low — focus on patina wisdom and dawn clarity first')
  }
  const allWeak = forges.every(f => f.forgeType === 'no-forge' || f.forgeType === 'campfire')
  if (allWeak && forges.length > 0) {
    recs.push('All forges are mere campfires — consider a major refactoring of the entire codebase')
  }
  const scrapFiles = rays.filter(r => r.condition === 'scrap').map(r => r.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Refine these scrap files into copper: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The copper dawn illuminates a masterwork foundry! Every ray gleams with patina wisdom, dawn clarity, and forge strength')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as copper ray
 * @example
 * const ray = analyzeCopperRay(content, 'index.ts')
 * console.log(ray.condition) // 'masterwork-copper'
 */
export function analyzeCopperRay(content: string, filePath: string): CopperRay {
  const aging = measureAging(content)
  const illuminating = measureIlluminating(content)
  const conducting = measureConducting(content)
  const comforting = measureComforting(content)
  const strengthening = measureStrengthening(content)

  const qualityScore = Math.round(
    aging.wisdom * 0.2 +
    illuminating.clarity * 0.2 +
    conducting.quality * 0.2 +
    comforting.resilience * 0.2 +
    strengthening.strength * 0.2,
  )

  return {
    file: filePath,
    patinaWisdom: aging.wisdom,
    dawnClarity: illuminating.clarity,
    conductivityQuality: conducting.quality,
    warmthResilience: comforting.resilience,
    forgeStrength: strengthening.strength,
    aging, illuminating, conducting, comforting, strengthening,
    condition: classifyRayCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as copper forge
 * @example
 * const forge = analyzeCopperForge(rays, 'src')
 * console.log(forge.forgeType) // 'grand-foundry'
 */
export function analyzeCopperForge(rays: CopperRay[], dirPath: string): CopperForge {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [], avgWisdom: 0, avgClarity: 0,
      avgStrength: 0, masterworkCopperCount: 0, scrapCount: 0,
      forgeType: 'no-forge', condition: 'void',
    }
  }

  const avgWisdom = Math.round(rays.reduce((s, r) => s + r.patinaWisdom, 0) / rays.length)
  const avgClarity = Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
  const avgStrength = Math.round(rays.reduce((s, r) => s + r.forgeStrength, 0) / rays.length)
  const masterworkCopperCount = rays.filter(r => r.condition === 'masterwork-copper').length
  const scrapCount = rays.filter(r => r.condition === 'scrap').length
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)

  return {
    directory: dirPath, rays, avgWisdom, avgClarity, avgStrength,
    masterworkCopperCount, scrapCount,
    forgeType: classifyForgeType(rays),
    condition: classifyForgeCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete copper dawn result
 * @example
 * const result = await buildCopperDawnResult(files, contents)
 * console.log(result.stats.smithGrade) // 'master-smith'
 */
export async function buildCopperDawnResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperDawnResult> {
  const rays = files.map((file, i) => analyzeCopperRay(contents[i] ?? '', file))

  const dirMap = new Map<string, CopperRay[]>()
  for (const ray of rays) {
    const dir = path.dirname(ray.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ray) } else { dirMap.set(dir, [ray]) }
  }

  const forges = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeCopperForge(dirRays, dir),
  )

  const avgWisdom = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.patinaWisdom, 0) / rays.length) : 0
  const avgClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length) : 0
  const avgStrength = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.forgeStrength, 0) / rays.length) : 0

  const overallLuster = rays.length > 0
    ? Math.round((avgWisdom + avgClarity + avgStrength) / 3) : 0
  const isMasterwork = avgWisdom >= 60

  const foundry: CopperFoundry = { avgWisdom, avgClarity, avgStrength, isMasterwork, overallLuster }

  const avgConductivity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.conductivityQuality, 0) / rays.length) : 0
  const avgWarmth = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.warmthResilience, 0) / rays.length) : 0

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => r.patinaWisdom > best.patinaWisdom ? r : best).file : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => r.dawnClarity > best.dawnClarity ? r : best).file : ''
  const mostConductive = rays.length > 0
    ? rays.reduce((best, r) => r.conductivityQuality > best.conductivityQuality ? r : best).file : ''
  const strongest = rays.length > 0
    ? rays.reduce((best, r) => r.forgeStrength > best.forgeStrength ? r : best).file : ''

  const stats: CopperDawnStats = {
    totalFiles: rays.length,
    totalForges: forges.length,
    avgPatinaWisdom: avgWisdom,
    avgDawnClarity: avgClarity,
    avgConductivityQuality: avgConductivity,
    avgWarmthResilience: avgWarmth,
    avgForgeStrength: avgStrength,
    masterworkCopperCount: rays.filter(r => r.condition === 'masterwork-copper').length,
    agedBronzeCount: rays.filter(r => r.condition === 'aged-bronze').length,
    properCopperCount: rays.filter(r => r.condition === 'proper-copper').length,
    tarnishedMetalCount: rays.filter(r => r.condition === 'tarnished-metal').length,
    rustyWireCount: rays.filter(r => r.condition === 'rusty-wire').length,
    scrapCount: rays.filter(r => r.condition === 'scrap').length,
    hasHighWisdomCount: rays.filter(r => r.aging.hasHighWisdom).length,
    hasHighClarityCount: rays.filter(r => r.illuminating.hasHighClarity).length,
    hasHighQualityCount: rays.filter(r => r.conducting.hasHighQuality).length,
    hasHighResilienceCount: rays.filter(r => r.comforting.hasHighResilience).length,
    hasHighStrengthCount: rays.filter(r => r.strengthening.hasHighStrength).length,
    overallLuster,
    smithGrade: classifySmithGrade(overallLuster),
    bestRay, wisest, clearest, mostConductive, strongest,
  }

  const recommendations = generateRecommendations(rays, forges, foundry, stats)

  return { rays, forges, foundry, stats, recommendations }
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
