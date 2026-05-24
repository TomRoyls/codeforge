// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Crown = 'flawless-platinum' | 'pure-metal' | 'proper-alloy' | 'tarnished-silver' | 'corroded-bronze' | 'no-purity'
export type Crest = 'imperial-seal' | 'royal-decree' | 'proper-authority' | 'weak-command' | 'empty-title' | 'no-authority'
export type Setting = 'master-jeweler' | 'expert-setting' | 'proper-mount' | 'loose-gem' | 'fallen-jewel' | 'no-setting'
export type Circlet = 'indestructible' | 'resilient-band' | 'proper-circlet' | 'bent-wire' | 'broken-ring' | 'no-circlet'
export type Reign = 'eternal-dynasty' | 'century-reign' | 'proper-rule' | 'brief-era' | 'passing-moment' | 'no-reign'
export type JewelCondition = 'imperial-crown' | 'royal-tiara' | 'proper-circlet' | 'metal-band' | 'rusty-ring' | 'scrap'
export type ThroneType = 'grand-throne' | 'royal-court' | 'proper-hall' | 'small-room' | 'hut' | 'no-throne'
export type ThroneCondition = 'golden-age' | 'prosperous-reign' | 'stable-kingdom' | 'declining-realm' | 'fallen-empire' | 'void'
export type MonarchGrade = 'emperor' | 'king' | 'duke' | 'baron' | 'knight' | 'peasant'

export interface PurifyingMeasure {
  purity: number
  crown: Crown
  hasHighPurity: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasNoHacky: boolean
  hasNoDuplicates: boolean
  hasPristine: boolean
  hasNoMessy: boolean
  hasReadable: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasLuminous: boolean
  deadCodeCount: number
  hackyCount: number
}

export interface CommandingMeasure {
  authority: number
  crest: Crest
  hasHighAuthority: boolean
  hasReliable: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasConsistent: boolean
  hasNoFlaky: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasCommanding: boolean
  untestedCount: number
  flakyCount: number
}

export interface SettingMeasure {
  precision: number
  setting: Setting
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasFlawless: boolean
  approximateCount: number
  sloppyCount: number
}

export interface EnduringMeasure {
  resilience: number
  circlet: Circlet
  hasHighResilience: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasSolid: boolean
  hasNoShaky: boolean
  hasBattleTested: boolean
  unsafeCount: number
  bareCrashCount: number
}

export interface ReigningMeasure {
  endurance: number
  reign: Reign
  hasHighEndurance: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasStableAPI: boolean
  hasNoBreaking: boolean
  hasProven: boolean
  fragileCount: number
  adHocCount: number
}

export interface PlatinumJewel {
  file: string
  royalPurity: number
  crestAuthority: number
  jewelPrecision: number
  circletResilience: number
  reignEndurance: number
  purifying: PurifyingMeasure
  commanding: CommandingMeasure
  setting: SettingMeasure
  enduring: EnduringMeasure
  reigning: ReigningMeasure
  condition: JewelCondition
  qualityScore: number
}

export interface PlatinumThrone {
  directory: string
  jewels: PlatinumJewel[]
  avgPurity: number
  avgAuthority: number
  avgEndurance: number
  imperialCrownCount: number
  scrapCount: number
  throneType: ThroneType
  condition: ThroneCondition
}

export interface PlatinumKingdom {
  avgPurity: number
  avgAuthority: number
  avgEndurance: number
  isImperial: boolean
  overallSovereignty: number
}

export interface PlatinumCrownStats {
  totalFiles: number
  totalThrones: number
  avgRoyalPurity: number
  avgCrestAuthority: number
  avgJewelPrecision: number
  avgCircletResilience: number
  avgReignEndurance: number
  imperialCrownCount: number
  royalTiaraCount: number
  properCircletCount: number
  metalBandCount: number
  rustyRingCount: number
  scrapCount: number
  hasHighPurityCount: number
  hasHighAuthorityCount: number
  hasHighPrecisionCount: number
  hasHighResilienceCount: number
  hasHighEnduranceCount: number
  overallSovereignty: number
  monarchGrade: MonarchGrade
  bestJewel: string
  purest: string
  mostAuthoritative: string
  mostPrecise: string
  mostEnduring: string
}

export interface PlatinumCrownResult {
  jewels: PlatinumJewel[]
  thrones: PlatinumThrone[]
  kingdom: PlatinumKingdom
  stats: PlatinumCrownStats
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

function classifyCrown(purity: number): Crown {
  if (purity >= 85) return 'flawless-platinum'
  if (purity >= 70) return 'pure-metal'
  if (purity >= 55) return 'proper-alloy'
  if (purity >= 40) return 'tarnished-silver'
  if (purity >= 25) return 'corroded-bronze'
  return 'no-purity'
}

function classifyCrest(authority: number): Crest {
  if (authority >= 85) return 'imperial-seal'
  if (authority >= 70) return 'royal-decree'
  if (authority >= 55) return 'proper-authority'
  if (authority >= 40) return 'weak-command'
  if (authority >= 25) return 'empty-title'
  return 'no-authority'
}

function classifySetting(precision: number): Setting {
  if (precision >= 85) return 'master-jeweler'
  if (precision >= 70) return 'expert-setting'
  if (precision >= 55) return 'proper-mount'
  if (precision >= 40) return 'loose-gem'
  if (precision >= 25) return 'fallen-jewel'
  return 'no-setting'
}

function classifyCirclet(resilience: number): Circlet {
  if (resilience >= 85) return 'indestructible'
  if (resilience >= 70) return 'resilient-band'
  if (resilience >= 55) return 'proper-circlet'
  if (resilience >= 40) return 'bent-wire'
  if (resilience >= 25) return 'broken-ring'
  return 'no-circlet'
}

function classifyReign(endurance: number): Reign {
  if (endurance >= 85) return 'eternal-dynasty'
  if (endurance >= 70) return 'century-reign'
  if (endurance >= 55) return 'proper-rule'
  if (endurance >= 40) return 'brief-era'
  if (endurance >= 25) return 'passing-moment'
  return 'no-reign'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure royal purity (untarnished quality)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.crown) // 'flawless-platinum'
 */
export function measurePurifying(content: string): PurifyingMeasure {
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

  const hasClean = hasExport(content) && hasInterface(content)
  const hasNoDuplicates = hasDocComments(content) && hasReturnType(content)
  const hasPristine = hasConst(content) && hasNamedExport(content)
  const hasReadable = hasTypeAlias(content) && hasReadonly(content)
  const hasClear = hasGenerics(content) && hasOptional(content)
  const hasLuminous = hasPrivate(content) && hasAsync(content)

  score += hasClean ? 5 : 0
  score += hasNoDuplicates ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasLuminous ? 5 : 0

  const purity = Math.min(score, 100)
  const deadCodeCount = countMatches(/\beval\b/, content)
  const hackyCount = countMatches(/\bany\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoHacky = hackyCount === 0
  const hasNoMessy = countMatches(/\bvar\b/, content) === 0
  const hasNoObfuscated = hackyCount === 0
  const hasNoCryptic = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  return {
    purity, crown: classifyCrown(purity), hasHighPurity, hasClean, hasNoDeadCode,
    hasNoHacky, hasNoDuplicates, hasPristine, hasNoMessy, hasReadable, hasNoObfuscated,
    hasClear, hasNoCryptic, hasLuminous, deadCodeCount, hackyCount,
  }
}

/**
 * Measure crest authority (commanding reliability)
 * @example
 * const m = measureCommanding(content)
 * console.log(m.crest) // 'imperial-seal'
 */
export function measureCommanding(content: string): CommandingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasReliable = hasTryCatch(content) && hasThrow(content)
  const hasTested = hasInterface(content) && hasReturnType(content)
  const hasDeterministic = hasEnum(content) && hasConst(content)
  const hasConsistent = hasReadonly(content) && hasTypeAlias(content)
  const hasPowerful = hasExport(content) && hasOptional(content)
  const hasCommanding = hasGenerics(content) && hasAsync(content)

  score += hasReliable ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasDeterministic ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasPowerful ? 5 : 0
  score += hasCommanding ? 5 : 0

  const authority = Math.min(score, 100)
  const untestedCount = countMatches(/\bvar\b/, content)
  const flakyCount = countMatches(/\bany\b/, content)

  const hasNoUntested = untestedCount === 0
  const hasNoRandom = flakyCount === 0
  const hasNoFlaky = countMatches(/\beval\b/, content) === 0
  const hasNoWeak = !has(/\bdebugger\b/, content)
  const hasHighAuthority = authority >= 70

  return {
    authority, crest: classifyCrest(authority), hasHighAuthority, hasReliable, hasTested,
    hasNoUntested, hasDeterministic, hasNoRandom, hasConsistent, hasNoFlaky, hasPowerful,
    hasNoWeak, hasCommanding, untestedCount, flakyCount,
  }
}

/**
 * Measure jewel precision (embedded correctness)
 * @example
 * const m = measureSetting(content)
 * console.log(m.setting) // 'master-jeweler'
 */
export function measureSetting(content: string): SettingMeasure {
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

  const hasExact = hasReturnType(content) && hasReadonly(content)
  const hasAccurate = hasEnum(content) && hasInterface(content)
  const hasCorrect = hasConst(content) && hasTypeAlias(content)
  const hasPrecise = hasExport(content) && hasGenerics(content)
  const hasSharp = hasOptional(content) && hasPrivate(content)
  const hasFlawless = hasAsync(content) && hasDocComments(content)

  score += hasExact ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasFlawless ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bany\b/, content)
  const sloppyCount = countMatches(/\bvar\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoAlmostRight = sloppyCount === 0
  const hasNoVague = countMatches(/\beval\b/, content) === 0
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  return {
    precision, setting: classifySetting(precision), hasHighPrecision, hasExact, hasAccurate,
    hasNoApproximate, hasCorrect, hasNoAlmostRight, hasPrecise, hasNoVague, hasSharp,
    hasNoSloppy, hasFlawless, approximateCount, sloppyCount,
  }
}

/**
 * Measure circlet resilience (structural endurance)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.circlet) // 'indestructible'
 */
export function measureEnduring(content: string): EnduringMeasure {
  let score = 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasTypeSafe = hasReadonly(content) && hasOptional(content)
  const hasErrorHandled = hasTryCatch(content) && hasInterface(content)
  const hasRobust = hasThrow(content) && hasTypeAlias(content)
  const hasDefensive = hasEnum(content) && hasConst(content)
  const hasSolid = hasExport(content) && hasReturnType(content)
  const hasBattleTested = hasGenerics(content) && hasAsync(content)

  score += hasTypeSafe ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasDefensive ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasBattleTested ? 5 : 0

  const resilience = Math.min(score, 100)
  const unsafeCount = countMatches(/\bvar\b/, content)
  const bareCrashCount = countMatches(/\bany\b/, content)

  const hasNoUnsafe = unsafeCount === 0
  const hasNoBareCrash = bareCrashCount === 0
  const hasNoFragile = countMatches(/\beval\b/, content) === 0
  const hasNoNaive = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  return {
    resilience, circlet: classifyCirclet(resilience), hasHighResilience, hasTypeSafe, hasNoUnsafe,
    hasErrorHandled, hasNoBareCrash, hasRobust, hasNoFragile, hasDefensive, hasNoNaive,
    hasSolid, hasNoShaky: hasNoNaive, hasBattleTested, unsafeCount, bareCrashCount,
  }
}

/**
 * Measure reign endurance (lasting legacy)
 * @example
 * const m = measureReigning(content)
 * console.log(m.reign) // 'eternal-dynasty'
 */
export function measureReigning(content: string): ReigningMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTryCatch(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0

  const hasMaintainable = hasInterface(content) && hasExport(content)
  const hasExtensible = hasDocComments(content) && hasReturnType(content)
  const hasDocumented = hasEnum(content) && hasTypeAlias(content)
  const hasWellStructured = hasReadonly(content) && hasConst(content)
  const hasStableAPI = hasGenerics(content) && hasAsync(content)
  const hasProven = hasTryCatch(content) && hasOptional(content)

  score += hasMaintainable ? 5 : 0
  score += hasExtensible ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasStableAPI ? 5 : 0
  score += hasProven ? 5 : 0

  const endurance = Math.min(score, 100)
  const fragileCount = countMatches(/\bvar\b/, content)
  const adHocCount = countMatches(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoRigid = adHocCount === 0
  const hasNoUndocumented = countMatches(/\beval\b/, content) === 0
  const hasNoAdHoc = !has(/\bdebugger\b/, content)
  const hasNoBreaking = hasNoAdHoc
  const hasHighEndurance = endurance >= 70

  return {
    endurance, reign: classifyReign(endurance), hasHighEndurance, hasMaintainable, hasNoFragile,
    hasExtensible, hasNoRigid, hasDocumented, hasNoUndocumented, hasWellStructured, hasNoAdHoc,
    hasStableAPI, hasNoBreaking, hasProven, fragileCount, adHocCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify jewel condition
 * @example
 * classifyJewelCondition(90) // 'imperial-crown'
 */
export function classifyJewelCondition(score: number): JewelCondition {
  if (score >= 85) return 'imperial-crown'
  if (score >= 70) return 'royal-tiara'
  if (score >= 55) return 'proper-circlet'
  if (score >= 40) return 'metal-band'
  if (score >= 25) return 'rusty-ring'
  return 'scrap'
}

/**
 * Classify throne type
 * @example
 * classifyThroneType(jewels) // 'grand-throne'
 */
export function classifyThroneType(jewels: PlatinumJewel[]): ThroneType {
  if (jewels.length === 0) return 'no-throne'
  const avgQs = Math.round(jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length)
  const imperialRatio = jewels.filter(j => j.condition === 'imperial-crown').length / jewels.length
  if (avgQs >= 75 && imperialRatio >= 0.5) return 'grand-throne'
  if (avgQs >= 60) return 'royal-court'
  if (avgQs >= 45) return 'proper-hall'
  if (avgQs >= 30) return 'small-room'
  if (avgQs >= 15) return 'hut'
  return 'no-throne'
}

/**
 * Classify throne condition
 * @example
 * classifyThroneCondition(80) // 'golden-age'
 */
export function classifyThroneCondition(avgQs: number): ThroneCondition {
  if (avgQs >= 75) return 'golden-age'
  if (avgQs >= 60) return 'prosperous-reign'
  if (avgQs >= 45) return 'stable-kingdom'
  if (avgQs >= 30) return 'declining-realm'
  if (avgQs >= 15) return 'fallen-empire'
  return 'void'
}

/**
 * Classify monarch grade
 * @example
 * classifyMonarchGrade(85) // 'emperor'
 */
export function classifyMonarchGrade(avgSovereignty: number): MonarchGrade {
  if (avgSovereignty >= 80) return 'emperor'
  if (avgSovereignty >= 65) return 'king'
  if (avgSovereignty >= 50) return 'duke'
  if (avgSovereignty >= 35) return 'baron'
  if (avgSovereignty >= 20) return 'knight'
  return 'peasant'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(jewels, thrones, kingdom, stats)
 */
export function generateRecommendations(
  jewels: PlatinumJewel[],
  thrones: PlatinumThrone[],
  kingdom: PlatinumKingdom,
  stats: PlatinumCrownStats,
): string[] {
  const recs: string[] = []
  if (stats.avgRoyalPurity < 50) {
    recs.push('Purify code with clean exports, pristine documentation, and readable type architecture')
  }
  if (stats.avgCrestAuthority < 50) {
    recs.push('Strengthen crest authority with reliable try-catch blocks, tested interfaces, and deterministic enum patterns')
  }
  if (stats.avgJewelPrecision < 50) {
    recs.push('Hone jewel precision with exact return types, accurate enums, and correct const patterns')
  }
  if (stats.avgCircletResilience < 50) {
    recs.push('Reinforce circlet resilience with type-safe readonly properties, error-handled try-catch, and defensive enum patterns')
  }
  if (stats.avgReignEndurance < 50) {
    recs.push('Extend reign endurance with maintainable interfaces, extensible doc comments, and well-structured readonly patterns')
  }
  if (stats.scrapCount > 0) {
    recs.push(`${stats.scrapCount} jewel(s) are scrap — they need royal forging to become imperial crowns`)
  }
  if (kingdom.overallSovereignty < 40) {
    recs.push('Overall sovereignty is dangerously low — focus on royal purity and reign endurance first')
  }
  const allWeak = thrones.every(t => t.throneType === 'no-throne' || t.throneType === 'hut')
  if (allWeak && thrones.length > 0) {
    recs.push('All thrones are huts — consider a major refactoring of the entire codebase')
  }
  const scrapFiles = jewels.filter(j => j.condition === 'scrap').map(j => j.file)
  if (scrapFiles.length > 0 && scrapFiles.length <= 3) {
    recs.push(`Forge these scrap jewels: ${scrapFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The platinum crown gleams with imperial perfection! Every jewel radiates purity, authority, and enduring reign')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as platinum jewel
 * @example
 * const jewel = analyzePlatinumJewel(content, 'index.ts')
 * console.log(jewel.condition) // 'imperial-crown'
 */
export function analyzePlatinumJewel(content: string, filePath: string): PlatinumJewel {
  const purifying = measurePurifying(content)
  const commanding = measureCommanding(content)
  const setting = measureSetting(content)
  const enduring = measureEnduring(content)
  const reigning = measureReigning(content)

  const qualityScore = Math.round(
    purifying.purity * 0.2 +
    commanding.authority * 0.2 +
    setting.precision * 0.2 +
    enduring.resilience * 0.2 +
    reigning.endurance * 0.2,
  )

  return {
    file: filePath,
    royalPurity: purifying.purity,
    crestAuthority: commanding.authority,
    jewelPrecision: setting.precision,
    circletResilience: enduring.resilience,
    reignEndurance: reigning.endurance,
    purifying, commanding, setting, enduring, reigning,
    condition: classifyJewelCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as platinum throne
 * @example
 * const throne = analyzePlatinumThrone(jewels, 'src')
 * console.log(throne.throneType) // 'grand-throne'
 */
export function analyzePlatinumThrone(jewels: PlatinumJewel[], dirPath: string): PlatinumThrone {
  if (jewels.length === 0) {
    return {
      directory: dirPath, jewels: [], avgPurity: 0, avgAuthority: 0,
      avgEndurance: 0, imperialCrownCount: 0, scrapCount: 0,
      throneType: 'no-throne', condition: 'void',
    }
  }

  const avgPurity = Math.round(jewels.reduce((s, j) => s + j.royalPurity, 0) / jewels.length)
  const avgAuthority = Math.round(jewels.reduce((s, j) => s + j.crestAuthority, 0) / jewels.length)
  const avgEndurance = Math.round(jewels.reduce((s, j) => s + j.reignEndurance, 0) / jewels.length)
  const imperialCrownCount = jewels.filter(j => j.condition === 'imperial-crown').length
  const scrapCount = jewels.filter(j => j.condition === 'scrap').length
  const avgQs = Math.round(jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length)

  return {
    directory: dirPath, jewels, avgPurity, avgAuthority, avgEndurance,
    imperialCrownCount, scrapCount,
    throneType: classifyThroneType(jewels),
    condition: classifyThroneCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete platinum crown result
 * @example
 * const result = await buildPlatinumCrownResult(files, contents)
 * console.log(result.stats.monarchGrade) // 'emperor'
 */
export async function buildPlatinumCrownResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PlatinumCrownResult> {
  const jewels = files.map((file, i) => analyzePlatinumJewel(contents[i] ?? '', file))

  const dirMap = new Map<string, PlatinumJewel[]>()
  for (const jewel of jewels) {
    const dir = path.dirname(jewel.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(jewel) } else { dirMap.set(dir, [jewel]) }
  }

  const thrones = Array.from(dirMap.entries()).map(([dir, dirJewels]) =>
    analyzePlatinumThrone(dirJewels, dir),
  )

  const avgPurity = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.royalPurity, 0) / jewels.length) : 0
  const avgAuthority = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.crestAuthority, 0) / jewels.length) : 0
  const avgEndurance = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.reignEndurance, 0) / jewels.length) : 0

  const overallSovereignty = jewels.length > 0
    ? Math.round((avgPurity + avgAuthority + avgEndurance) / 3) : 0
  const isImperial = avgPurity >= 60

  const kingdom: PlatinumKingdom = { avgPurity, avgAuthority, avgEndurance, isImperial, overallSovereignty }

  const avgJewelPrecision = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.jewelPrecision, 0) / jewels.length) : 0
  const avgCircletResilience = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.circletResilience, 0) / jewels.length) : 0

  const bestJewel = jewels.length > 0
    ? jewels.reduce((best, j) => j.qualityScore > best.qualityScore ? j : best).file : ''
  const purest = jewels.length > 0
    ? jewels.reduce((best, j) => j.royalPurity > best.royalPurity ? j : best).file : ''
  const mostAuthoritative = jewels.length > 0
    ? jewels.reduce((best, j) => j.crestAuthority > best.crestAuthority ? j : best).file : ''
  const mostPrecise = jewels.length > 0
    ? jewels.reduce((best, j) => j.jewelPrecision > best.jewelPrecision ? j : best).file : ''
  const mostEnduring = jewels.length > 0
    ? jewels.reduce((best, j) => j.reignEndurance > best.reignEndurance ? j : best).file : ''

  const stats: PlatinumCrownStats = {
    totalFiles: jewels.length,
    totalThrones: thrones.length,
    avgRoyalPurity: avgPurity,
    avgCrestAuthority: avgAuthority,
    avgJewelPrecision,
    avgCircletResilience,
    avgReignEndurance: avgEndurance,
    imperialCrownCount: jewels.filter(j => j.condition === 'imperial-crown').length,
    royalTiaraCount: jewels.filter(j => j.condition === 'royal-tiara').length,
    properCircletCount: jewels.filter(j => j.condition === 'proper-circlet').length,
    metalBandCount: jewels.filter(j => j.condition === 'metal-band').length,
    rustyRingCount: jewels.filter(j => j.condition === 'rusty-ring').length,
    scrapCount: jewels.filter(j => j.condition === 'scrap').length,
    hasHighPurityCount: jewels.filter(j => j.purifying.hasHighPurity).length,
    hasHighAuthorityCount: jewels.filter(j => j.commanding.hasHighAuthority).length,
    hasHighPrecisionCount: jewels.filter(j => j.setting.hasHighPrecision).length,
    hasHighResilienceCount: jewels.filter(j => j.enduring.hasHighResilience).length,
    hasHighEnduranceCount: jewels.filter(j => j.reigning.hasHighEndurance).length,
    overallSovereignty,
    monarchGrade: classifyMonarchGrade(overallSovereignty),
    bestJewel, purest, mostAuthoritative, mostPrecise, mostEnduring,
  }

  const recommendations = generateRecommendations(jewels, thrones, kingdom, stats)

  return { jewels, thrones, kingdom, stats, recommendations }
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
