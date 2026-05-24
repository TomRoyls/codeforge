// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type WisdomSage = 'imperial-sage' | 'court-philosopher' | 'proper-scholar' | 'learning-student' | 'foolish-youth' | 'no-wisdom'
export type AuthoritySovereignty = 'divine-mandate' | 'imperial-decree' | 'proper-authority' | 'weak-rule' | 'figurehead' | 'no-authority'
export type PrecisionCraftsmanship = 'master-carver' | 'skilled-artisan' | 'proper-craft' | 'rough-hewn' | 'crude-chisel' | 'no-craft'
export type PurityClarity = 'flawless-jade' | 'imperial-green' | 'proper-stone' | 'cloudy-jade' | 'cracked-stone' | 'no-purity'
export type EnduranceLegacy = 'thousand-year-dynasty' | 'century-reign' | 'proper-rule' | 'brief-era' | 'passing-moment' | 'no-legacy'
export type SeatCondition = 'imperial-jade' | 'court-treasure' | 'proper-throne' | 'carved-stone' | 'rough-rock' | 'dust'
export type PalaceType = 'forbidden-city' | 'imperial-palace' | 'proper-courtyard' | 'small-temple' | 'humble-abode' | 'no-palace'
export type PalaceCondition = 'golden-age' | 'prosperous-reign' | 'stable-dynasty' | 'declining-era' | 'fallen-ruins' | 'void'
export type EmperorGrade = 'jade-emperor' | 'court-minister' | 'skilled-artisan' | 'apprentice' | 'novice' | 'peasant'

export interface KnowingMeasure {
  wisdom: number
  sage: WisdomSage
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasPrincipled: boolean
  hasNoHacky: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEnlightened: boolean
  adHocCount: number
  hackyCount: number
}

export interface CommandingMeasure {
  authority: number
  sovereignty: AuthoritySovereignty
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

export interface CraftingMeasure {
  precision: number
  craftsmanship: PrecisionCraftsmanship
  hasHighPrecision: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasNoApproximate: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDetailed: boolean
  hasNoVague: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasImmaculate: boolean
  approximateCount: number
  sloppyCount: number
}

export interface PurifyingMeasure {
  purity: number
  clarity: PurityClarity
  hasHighPurity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasNoDuplicates: boolean
  hasPristine: boolean
  hasNoTarnished: boolean
  hasFlawless: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface EnduringMeasure {
  endurance: number
  legacy: EnduranceLegacy
  hasHighEndurance: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasStableAPI: boolean
  hasNoBreaking: boolean
  fragileCount: number
  rigidCount: number
}

export interface JadeSeat {
  file: string
  wisdomDepth: number
  throneAuthority: number
  carvingPrecision: number
  jadePurity: number
  dynastyEndurance: number
  knowing: KnowingMeasure
  commanding: CommandingMeasure
  crafting: CraftingMeasure
  purifying: PurifyingMeasure
  enduring: EnduringMeasure
  condition: SeatCondition
  qualityScore: number
}

export interface JadePalace {
  directory: string
  seats: JadeSeat[]
  avgWisdom: number
  avgAuthority: number
  avgPurity: number
  imperialJadeCount: number
  dustCount: number
  palaceType: PalaceType
  condition: PalaceCondition
}

export interface JadeCourt {
  avgWisdom: number
  avgAuthority: number
  avgPurity: number
  isImperial: boolean
  overallSovereignty: number
}

export interface JadeThroneStats {
  totalFiles: number
  totalPalaces: number
  avgWisdomDepth: number
  avgThroneAuthority: number
  avgCarvingPrecision: number
  avgJadePurity: number
  avgDynastyEndurance: number
  imperialJadeCount: number
  courtTreasureCount: number
  properThroneCount: number
  carvedStoneCount: number
  roughRockCount: number
  dustCount: number
  hasHighWisdomCount: number
  hasHighAuthorityCount: number
  hasHighPrecisionCount: number
  hasHighPurityCount: number
  hasHighEnduranceCount: number
  overallSovereignty: number
  emperorGrade: EmperorGrade
  bestSeat: string
  wisest: string
  mostAuthoritative: string
  mostPrecise: string
  purest: string
}

export interface JadeThroneResult {
  seats: JadeSeat[]
  palaces: JadePalace[]
  court: JadeCourt
  stats: JadeThroneStats
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

function classifyWisdomSage(wisdom: number): WisdomSage {
  if (wisdom >= 85) return 'imperial-sage'
  if (wisdom >= 70) return 'court-philosopher'
  if (wisdom >= 55) return 'proper-scholar'
  if (wisdom >= 40) return 'learning-student'
  if (wisdom >= 25) return 'foolish-youth'
  return 'no-wisdom'
}

function classifyAuthoritySovereignty(authority: number): AuthoritySovereignty {
  if (authority >= 85) return 'divine-mandate'
  if (authority >= 70) return 'imperial-decree'
  if (authority >= 55) return 'proper-authority'
  if (authority >= 40) return 'weak-rule'
  if (authority >= 25) return 'figurehead'
  return 'no-authority'
}

function classifyPrecisionCraftsmanship(precision: number): PrecisionCraftsmanship {
  if (precision >= 85) return 'master-carver'
  if (precision >= 70) return 'skilled-artisan'
  if (precision >= 55) return 'proper-craft'
  if (precision >= 40) return 'rough-hewn'
  if (precision >= 25) return 'crude-chisel'
  return 'no-craft'
}

function classifyPurityClarity(purity: number): PurityClarity {
  if (purity >= 85) return 'flawless-jade'
  if (purity >= 70) return 'imperial-green'
  if (purity >= 55) return 'proper-stone'
  if (purity >= 40) return 'cloudy-jade'
  if (purity >= 25) return 'cracked-stone'
  return 'no-purity'
}

function classifyEnduranceLegacy(endurance: number): EnduranceLegacy {
  if (endurance >= 85) return 'thousand-year-dynasty'
  if (endurance >= 70) return 'century-reign'
  if (endurance >= 55) return 'proper-rule'
  if (endurance >= 40) return 'brief-era'
  if (endurance >= 25) return 'passing-moment'
  return 'no-legacy'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure wisdom depth (philosophical maturity)
 * @example
 * const m = measureKnowing(content)
 * console.log(m.sage) // 'imperial-sage'
 */
export function measureKnowing(content: string): KnowingMeasure {
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
  const hasPatterned = hasEnum(content) && hasTypeAlias(content)
  const hasPrincipled = hasExport(content) && hasReadonly(content)
  const hasMature = hasGenerics(content) && hasPrivate(content)
  const hasEnlightened = hasOptional(content) && hasAsync(content)

  score += hasDocumented ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasPatterned ? 5 : 0
  score += hasPrincipled ? 5 : 0
  score += hasMature ? 5 : 0
  score += hasEnlightened ? 5 : 0

  const wisdom = Math.min(score, 100)
  const adHocCount = countMatches(/\bvar\b/, content)
  const hackyCount = countMatches(/\beval\b/, content)

  const hasNoAdHoc = adHocCount === 0
  const hasNoReinvented = countMatches(/\bany\b/, content) === 0
  const hasNoHacky = hackyCount === 0
  const hasNoNaive = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  return {
    wisdom, sage: classifyWisdomSage(wisdom), hasHighWisdom, hasDocumented, hasWellStructured,
    hasNoAdHoc, hasPatterned, hasNoReinvented, hasPrincipled, hasNoHacky, hasMature,
    hasNoNaive, hasEnlightened, adHocCount, hackyCount,
  }
}

/**
 * Measure throne authority (commanding reliability)
 * @example
 * const m = measureCommanding(content)
 * console.log(m.sovereignty) // 'divine-mandate'
 */
export function measureCommanding(content: string): CommandingMeasure {
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

  const hasReliable = hasAsync(content) && hasTryCatch(content)
  const hasTested = hasReturnType(content) && hasExport(content)
  const hasDeterministic = hasConst(content) && hasThrow(content)
  const hasConsistent = hasInterface(content) && hasGenerics(content)
  const hasPowerful = hasReadonly(content) && hasDocComments(content)
  const hasCommanding = hasPrivate(content) && hasEnum(content)

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
  const hasNoRandom = countMatches(/\beval\b/, content) === 0
  const hasNoFlaky = flakyCount === 0
  const hasNoWeak = !has(/\bdebugger\b/, content)
  const hasHighAuthority = authority >= 70

  return {
    authority, sovereignty: classifyAuthoritySovereignty(authority), hasHighAuthority,
    hasReliable, hasTested, hasNoUntested, hasDeterministic, hasNoRandom, hasConsistent,
    hasNoFlaky, hasPowerful, hasNoWeak, hasCommanding, untestedCount, flakyCount,
  }
}

/**
 * Measure carving precision (craftsmanship detail)
 * @example
 * const m = measureCrafting(content)
 * console.log(m.craftsmanship) // 'master-carver'
 */
export function measureCrafting(content: string): CraftingMeasure {
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

  const hasExact = hasInterface(content) && hasReturnType(content)
  const hasPrecise = hasReadonly(content) && hasTypeAlias(content)
  const hasSharp = hasEnum(content) && hasConst(content)
  const hasDetailed = hasExport(content) && hasOptional(content)
  const hasRefined = hasGenerics(content) && hasDocComments(content)
  const hasImmaculate = hasPrivate(content) && hasAsync(content)

  score += hasExact ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDetailed ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasImmaculate ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const sloppyCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoSloppy = sloppyCount === 0
  const hasNoVague = countMatches(/\beval\b/, content) === 0
  const hasNoCrude = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  return {
    precision, craftsmanship: classifyPrecisionCraftsmanship(precision), hasHighPrecision,
    hasExact, hasPrecise, hasNoApproximate, hasSharp, hasNoSloppy, hasDetailed, hasNoVague,
    hasRefined, hasNoCrude, hasImmaculate, approximateCount, sloppyCount,
  }
}

/**
 * Measure jade purity (clarity and flawlessness)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.clarity) // 'flawless-jade'
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

  const hasReadable = hasExport(content) && hasInterface(content)
  const hasTransparent = hasDocComments(content) && hasReturnType(content)
  const hasClear = hasConst(content) && hasNamedExport(content)
  const hasClean = hasTypeAlias(content) && hasReadonly(content)
  const hasPristine = hasGenerics(content) && hasOptional(content)
  const hasFlawless = hasPrivate(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasFlawless ? 5 : 0

  const purity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bany\b/, content)
  const crypticCount = countMatches(/\bvar\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoDeadCode = countMatches(/\beval\b/, content) === 0
  const hasNoDuplicates = countMatches(/\bconsole\.log\b/, content) === 0
  const hasNoTarnished = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  return {
    purity, clarity: classifyPurityClarity(purity), hasHighPurity, hasReadable, hasTransparent,
    hasNoObfuscated, hasClear, hasNoCryptic, hasClean, hasNoDeadCode, hasNoDuplicates,
    hasPristine, hasNoTarnished, hasFlawless, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure dynasty endurance (lasting legacy)
 * @example
 * const m = measureEnduring(content)
 * console.log(m.legacy) // 'thousand-year-dynasty'
 */
export function measureEnduring(content: string): EnduringMeasure {
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

  const hasMaintainable = hasInterface(content) && hasTryCatch(content)
  const hasExtensible = hasReadonly(content) && hasOptional(content)
  const hasTypeSafe = hasThrow(content) && hasTypeAlias(content)
  const hasErrorHandled = hasEnum(content) && hasConst(content)
  const hasStableAPI = hasExport(content) && hasReturnType(content)

  score += hasMaintainable ? 5 : 0
  score += hasExtensible ? 5 : 0
  score += hasTypeSafe ? 5 : 0
  score += hasErrorHandled ? 5 : 0
  score += hasStableAPI ? 5 : 0

  const endurance = Math.min(score, 100)
  const fragileCount = countMatches(/\bvar\b/, content)
  const rigidCount = countMatches(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoRigid = rigidCount === 0
  const hasNoUnsafe = countMatches(/\beval\b/, content) === 0
  const hasNoBareCrash = !has(/\bdebugger\b/, content)
  const hasNoBreaking = countMatches(/\bconsole\.log\b/, content) === 0
  const hasHighEndurance = endurance >= 70

  return {
    endurance, legacy: classifyEnduranceLegacy(endurance), hasHighEndurance, hasMaintainable,
    hasNoFragile, hasExtensible, hasNoRigid, hasTypeSafe, hasNoUnsafe, hasErrorHandled,
    hasNoBareCrash, hasStableAPI, hasNoBreaking, fragileCount, rigidCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify seat condition
 * @example
 * classifySeatCondition(90) // 'imperial-jade'
 */
export function classifySeatCondition(score: number): SeatCondition {
  if (score >= 85) return 'imperial-jade'
  if (score >= 70) return 'court-treasure'
  if (score >= 55) return 'proper-throne'
  if (score >= 40) return 'carved-stone'
  if (score >= 25) return 'rough-rock'
  return 'dust'
}

/**
 * Classify palace type
 * @example
 * classifyPalaceType(seats) // 'forbidden-city'
 */
export function classifyPalaceType(seats: JadeSeat[]): PalaceType {
  if (seats.length === 0) return 'no-palace'
  const avgQs = Math.round(seats.reduce((s, st) => s + st.qualityScore, 0) / seats.length)
  const masterpieceRatio = seats.filter(st => st.condition === 'imperial-jade').length / seats.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'forbidden-city'
  if (avgQs >= 60) return 'imperial-palace'
  if (avgQs >= 45) return 'proper-courtyard'
  if (avgQs >= 30) return 'small-temple'
  if (avgQs >= 15) return 'humble-abode'
  return 'no-palace'
}

/**
 * Classify palace condition
 * @example
 * classifyPalaceCondition(80) // 'golden-age'
 */
export function classifyPalaceCondition(avgQs: number): PalaceCondition {
  if (avgQs >= 75) return 'golden-age'
  if (avgQs >= 60) return 'prosperous-reign'
  if (avgQs >= 45) return 'stable-dynasty'
  if (avgQs >= 30) return 'declining-era'
  if (avgQs >= 15) return 'fallen-ruins'
  return 'void'
}

/**
 * Classify emperor grade
 * @example
 * classifyEmperorGrade(85) // 'jade-emperor'
 */
export function classifyEmperorGrade(avgSovereignty: number): EmperorGrade {
  if (avgSovereignty >= 80) return 'jade-emperor'
  if (avgSovereignty >= 65) return 'court-minister'
  if (avgSovereignty >= 50) return 'skilled-artisan'
  if (avgSovereignty >= 35) return 'apprentice'
  if (avgSovereignty >= 20) return 'novice'
  return 'peasant'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(seats, palaces, court, stats)
 */
export function generateRecommendations(
  seats: JadeSeat[],
  palaces: JadePalace[],
  court: JadeCourt,
  stats: JadeThroneStats,
): string[] {
  const recs: string[] = []
  if (stats.avgWisdomDepth < 50) {
    recs.push('Deepen wisdom with documented interfaces, patterned enums, and principled type architecture')
  }
  if (stats.avgThroneAuthority < 50) {
    recs.push('Strengthen throne authority with reliable async patterns, tested return types, and deterministic logic')
  }
  if (stats.avgCarvingPrecision < 50) {
    recs.push('Refine carving precision with exact interfaces, precise readonly types, and sharp enum craftsmanship')
  }
  if (stats.avgJadePurity < 50) {
    recs.push('Purify jade with readable exports, transparent documentation, and clear named exports')
  }
  if (stats.avgDynastyEndurance < 50) {
    recs.push('Fortify dynasty endurance with maintainable interfaces, extensible readonly properties, and type-safe error handling')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — they need to be carved from jade by master craftsmen`)
  }
  if (court.overallSovereignty < 40) {
    recs.push('Overall sovereignty is dangerously low — focus on wisdom depth and throne authority first')
  }
  const allWeak = palaces.every(p => p.palaceType === 'no-palace' || p.palaceType === 'humble-abode')
  if (allWeak && palaces.length > 0) {
    recs.push('All palaces are humble abodes — consider a major refactoring of the entire codebase')
  }
  const dustFiles = seats.filter(st => st.condition === 'dust').map(st => st.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Carve these dust files into jade: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The jade throne gleams with imperial perfection! Every seat radiates wisdom, authority, and timeless craftsmanship')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as jade seat
 * @example
 * const seat = analyzeJadeSeat(content, 'index.ts')
 * console.log(seat.condition) // 'imperial-jade'
 */
export function analyzeJadeSeat(content: string, filePath: string): JadeSeat {
  const knowing = measureKnowing(content)
  const commanding = measureCommanding(content)
  const crafting = measureCrafting(content)
  const purifying = measurePurifying(content)
  const enduring = measureEnduring(content)

  const qualityScore = Math.round(
    knowing.wisdom * 0.2 +
    commanding.authority * 0.2 +
    crafting.precision * 0.2 +
    purifying.purity * 0.2 +
    enduring.endurance * 0.2,
  )

  return {
    file: filePath,
    wisdomDepth: knowing.wisdom,
    throneAuthority: commanding.authority,
    carvingPrecision: crafting.precision,
    jadePurity: purifying.purity,
    dynastyEndurance: enduring.endurance,
    knowing, commanding, crafting, purifying, enduring,
    condition: classifySeatCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as jade palace
 * @example
 * const palace = analyzeJadePalace(seats, 'src')
 * console.log(palace.palaceType) // 'forbidden-city'
 */
export function analyzeJadePalace(seats: JadeSeat[], dirPath: string): JadePalace {
  if (seats.length === 0) {
    return {
      directory: dirPath, seats: [], avgWisdom: 0, avgAuthority: 0,
      avgPurity: 0, imperialJadeCount: 0, dustCount: 0,
      palaceType: 'no-palace', condition: 'void',
    }
  }

  const avgWisdom = Math.round(seats.reduce((s, st) => s + st.wisdomDepth, 0) / seats.length)
  const avgAuthority = Math.round(seats.reduce((s, st) => s + st.throneAuthority, 0) / seats.length)
  const avgPurity = Math.round(seats.reduce((s, st) => s + st.jadePurity, 0) / seats.length)
  const imperialJadeCount = seats.filter(st => st.condition === 'imperial-jade').length
  const dustCount = seats.filter(st => st.condition === 'dust').length
  const avgQs = Math.round(seats.reduce((s, st) => s + st.qualityScore, 0) / seats.length)

  return {
    directory: dirPath, seats, avgWisdom, avgAuthority, avgPurity,
    imperialJadeCount, dustCount,
    palaceType: classifyPalaceType(seats),
    condition: classifyPalaceCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete jade throne result
 * @example
 * const result = await buildJadeThroneResult(files, contents)
 * console.log(result.stats.emperorGrade) // 'jade-emperor'
 */
export async function buildJadeThroneResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeThroneResult> {
  const seats = files.map((file, i) => analyzeJadeSeat(contents[i] ?? '', file))

  const dirMap = new Map<string, JadeSeat[]>()
  for (const seat of seats) {
    const dir = path.dirname(seat.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(seat) } else { dirMap.set(dir, [seat]) }
  }

  const palaces = Array.from(dirMap.entries()).map(([dir, dirSeats]) =>
    analyzeJadePalace(dirSeats, dir),
  )

  const avgWisdom = seats.length > 0
    ? Math.round(seats.reduce((s, st) => s + st.wisdomDepth, 0) / seats.length) : 0
  const avgAuthority = seats.length > 0
    ? Math.round(seats.reduce((s, st) => s + st.throneAuthority, 0) / seats.length) : 0
  const avgPurity = seats.length > 0
    ? Math.round(seats.reduce((s, st) => s + st.jadePurity, 0) / seats.length) : 0

  const overallSovereignty = seats.length > 0
    ? Math.round((avgWisdom + avgAuthority + avgPurity) / 3) : 0
  const isImperial = avgWisdom >= 60

  const court: JadeCourt = { avgWisdom, avgAuthority, avgPurity, isImperial, overallSovereignty }

  const avgPrecision = seats.length > 0
    ? Math.round(seats.reduce((s, st) => s + st.carvingPrecision, 0) / seats.length) : 0
  const avgEndurance = seats.length > 0
    ? Math.round(seats.reduce((s, st) => s + st.dynastyEndurance, 0) / seats.length) : 0

  const bestSeat = seats.length > 0
    ? seats.reduce((best, st) => st.qualityScore > best.qualityScore ? st : best).file : ''
  const wisest = seats.length > 0
    ? seats.reduce((best, st) => st.wisdomDepth > best.wisdomDepth ? st : best).file : ''
  const mostAuthoritative = seats.length > 0
    ? seats.reduce((best, st) => st.throneAuthority > best.throneAuthority ? st : best).file : ''
  const mostPrecise = seats.length > 0
    ? seats.reduce((best, st) => st.carvingPrecision > best.carvingPrecision ? st : best).file : ''
  const purest = seats.length > 0
    ? seats.reduce((best, st) => st.jadePurity > best.jadePurity ? st : best).file : ''

  const stats: JadeThroneStats = {
    totalFiles: seats.length,
    totalPalaces: palaces.length,
    avgWisdomDepth: avgWisdom,
    avgThroneAuthority: avgAuthority,
    avgCarvingPrecision: avgPrecision,
    avgJadePurity: avgPurity,
    avgDynastyEndurance: avgEndurance,
    imperialJadeCount: seats.filter(st => st.condition === 'imperial-jade').length,
    courtTreasureCount: seats.filter(st => st.condition === 'court-treasure').length,
    properThroneCount: seats.filter(st => st.condition === 'proper-throne').length,
    carvedStoneCount: seats.filter(st => st.condition === 'carved-stone').length,
    roughRockCount: seats.filter(st => st.condition === 'rough-rock').length,
    dustCount: seats.filter(st => st.condition === 'dust').length,
    hasHighWisdomCount: seats.filter(st => st.knowing.hasHighWisdom).length,
    hasHighAuthorityCount: seats.filter(st => st.commanding.hasHighAuthority).length,
    hasHighPrecisionCount: seats.filter(st => st.crafting.hasHighPrecision).length,
    hasHighPurityCount: seats.filter(st => st.purifying.hasHighPurity).length,
    hasHighEnduranceCount: seats.filter(st => st.enduring.hasHighEndurance).length,
    overallSovereignty,
    emperorGrade: classifyEmperorGrade(overallSovereignty),
    bestSeat, wisest, mostAuthoritative, mostPrecise, purest,
  }

  const recommendations = generateRecommendations(seats, palaces, court, stats)

  return { seats, palaces, court, stats, recommendations }
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
