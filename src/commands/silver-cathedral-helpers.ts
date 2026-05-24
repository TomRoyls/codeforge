// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Moon = 'full-moon' | 'bright-crescent' | 'proper-glow' | 'clouded-moon' | 'dark-night' | 'no-light'
export type Vault = 'flying-buttress' | 'gothic-arch' | 'proper-vault' | 'flat-ceiling' | 'collapsing-roof' | 'no-structure'
export type Bell = 'crystal-chime' | 'clear-bell' | 'proper-ring' | 'muffled-tone' | 'cracked-bell' | 'no-sound'
export type Temper = 'master-tempered' | 'well-forged' | 'proper-alloy' | 'brittle-silver' | 'bendy-wire' | 'no-strength'
export type Candle = 'eternal-flame' | 'bright-candle' | 'proper-light' | 'flickering-wick' | 'burnt-out' | 'no-candle'
export type PillarCondition = 'holy-relic' | 'blessed-silver' | 'proper-shrine' | 'tarnished-altar' | 'rusted-iron' | 'dust'
export type NaveType = 'grand-cathedral' | 'proper-church' | 'small-chapel' | 'wayside-shrine' | 'ruined-abbey' | 'no-nave'
export type NaveCondition = 'sacred-ground' | 'blessed-hall' | 'proper-sanctuary' | 'secular-building' | 'abandoned-ruin' | 'void'
export type BishopGrade = 'archbishop' | 'bishop' | 'abbot' | 'prior' | 'novice' | 'pilgrim'

export interface PurifyingMeasure {
  purity: number
  moon: Moon
  hasHighPurity: boolean
  hasReadable: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasPristine: boolean
  hasNoTarnished: boolean
  hasLuminous: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface ArchitectingMeasure {
  architecture: number
  vault: Vault
  hasHighArchitecture: boolean
  hasStructured: boolean
  hasWellOrganized: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasBalanced: boolean
  hasNoLopsided: boolean
  hasSound: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface ResonatingMeasure {
  clarity: number
  bell: Bell
  hasHighClarity: boolean
  hasSelfDocumenting: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasClearIntent: boolean
  hasNoAmbiguous: boolean
  hasExpressive: boolean
  hasNoTerse: boolean
  hasCommunicative: boolean
  hasNoSilent: boolean
  hasResonant: boolean
  crypticCount: number
  ambiguousCount: number
}

export interface TemperingMeasure {
  strength: number
  temper: Temper
  hasHighStrength: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasExtensible: boolean
  hasNoHardcoded: boolean
  hasResilient: boolean
  hasNoFragile: boolean
  hasAdaptive: boolean
  unsafeCount: number
  fragileCount: number
}

export interface IlluminatingMeasure {
  wisdom: number
  candle: Candle
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasWellCommented: boolean
  hasNoUndocumented: boolean
  hasJSDoc: boolean
  hasNoBare: boolean
  hasExplained: boolean
  hasNoOpaque: boolean
  hasIlluminated: boolean
  hasNoDark: boolean
  hasGuiding: boolean
  undocumentedCount: number
  bareCount: number
}

export interface SilverPillar {
  file: string
  lunarPurity: number
  vaultArchitecture: number
  bellClarity: number
  silverStrength: number
  candleWisdom: number
  purifying: PurifyingMeasure
  architecting: ArchitectingMeasure
  resonating: ResonatingMeasure
  tempering: TemperingMeasure
  illuminating: IlluminatingMeasure
  condition: PillarCondition
  qualityScore: number
}

export interface SilverNave {
  directory: string
  pillars: SilverPillar[]
  avgPurity: number
  avgArchitecture: number
  avgWisdom: number
  holyRelicCount: number
  dustCount: number
  naveType: NaveType
  condition: NaveCondition
}

export interface SilverDiocese {
  avgPurity: number
  avgArchitecture: number
  avgWisdom: number
  isSacred: boolean
  overallHoliness: number
}

export interface SilverCathedralStats {
  totalFiles: number
  totalNaves: number
  avgLunarPurity: number
  avgVaultArchitecture: number
  avgBellClarity: number
  avgSilverStrength: number
  avgCandleWisdom: number
  holyRelicCount: number
  blessedSilverCount: number
  properShrineCount: number
  tarnishedAltarCount: number
  rustedIronCount: number
  dustCount: number
  hasHighPurityCount: number
  hasHighArchitectureCount: number
  hasHighClarityCount: number
  hasHighStrengthCount: number
  hasHighWisdomCount: number
  overallHoliness: number
  bishopGrade: BishopGrade
  bestPillar: string
  purest: string
  bestArchitecture: string
  clearest: string
  wisest: string
}

export interface SilverCathedralResult {
  pillars: SilverPillar[]
  naves: SilverNave[]
  diocese: SilverDiocese
  stats: SilverCathedralStats
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

function classifyMoon(purity: number): Moon {
  if (purity >= 85) return 'full-moon'
  if (purity >= 70) return 'bright-crescent'
  if (purity >= 55) return 'proper-glow'
  if (purity >= 40) return 'clouded-moon'
  if (purity >= 25) return 'dark-night'
  return 'no-light'
}

function classifyVault(architecture: number): Vault {
  if (architecture >= 85) return 'flying-buttress'
  if (architecture >= 70) return 'gothic-arch'
  if (architecture >= 55) return 'proper-vault'
  if (architecture >= 40) return 'flat-ceiling'
  if (architecture >= 25) return 'collapsing-roof'
  return 'no-structure'
}

function classifyBell(clarity: number): Bell {
  if (clarity >= 85) return 'crystal-chime'
  if (clarity >= 70) return 'clear-bell'
  if (clarity >= 55) return 'proper-ring'
  if (clarity >= 40) return 'muffled-tone'
  if (clarity >= 25) return 'cracked-bell'
  return 'no-sound'
}

function classifyTemper(strength: number): Temper {
  if (strength >= 85) return 'master-tempered'
  if (strength >= 70) return 'well-forged'
  if (strength >= 55) return 'proper-alloy'
  if (strength >= 40) return 'brittle-silver'
  if (strength >= 25) return 'bendy-wire'
  return 'no-strength'
}

function classifyCandle(wisdom: number): Candle {
  if (wisdom >= 85) return 'eternal-flame'
  if (wisdom >= 70) return 'bright-candle'
  if (wisdom >= 55) return 'proper-light'
  if (wisdom >= 40) return 'flickering-wick'
  if (wisdom >= 25) return 'burnt-out'
  return 'no-candle'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure lunar purity (timeless readability)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.moon) // 'full-moon'
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
  const hasLuminous = hasPrivate(content) && hasAsync(content)

  score += hasReadable ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasLuminous ? 5 : 0

  const purity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bany\b/, content)
  const crypticCount = countMatches(/\bvar\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoDeadCode = countMatches(/\beval\b/, content) === 0
  const hasNoTarnished = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  return {
    purity, moon: classifyMoon(purity), hasHighPurity, hasReadable, hasTransparent,
    hasNoObfuscated, hasClear, hasNoCryptic, hasClean, hasNoDeadCode, hasPristine,
    hasNoTarnished, hasLuminous, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure vault architecture (structural soundness)
 * @example
 * const m = measureArchitecting(content)
 * console.log(m.vault) // 'flying-buttress'
 */
export function measureArchitecting(content: string): ArchitectingMeasure {
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

  const hasStructured = hasInterface(content) && hasReturnType(content)
  const hasWellOrganized = hasReadonly(content) && hasTypeAlias(content)
  const hasModular = hasEnum(content) && hasConst(content)
  const hasLayered = hasExport(content) && hasOptional(content)
  const hasBalanced = hasGenerics(content) && hasDocComments(content)
  const hasSound = hasPrivate(content) && hasAsync(content)

  score += hasStructured ? 5 : 0
  score += hasWellOrganized ? 5 : 0
  score += hasModular ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasBalanced ? 5 : 0
  score += hasSound ? 5 : 0

  const architecture = Math.min(score, 100)
  const chaoticCount = countMatches(/\bvar\b/, content)
  const monolithicCount = countMatches(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoMonolithic = monolithicCount === 0
  const hasNoFlat = countMatches(/\beval\b/, content) === 0
  const hasNoLopsided = !has(/\bdebugger\b/, content)
  const hasHighArchitecture = architecture >= 70

  return {
    architecture, vault: classifyVault(architecture), hasHighArchitecture, hasStructured,
    hasWellOrganized, hasNoChaotic, hasModular, hasNoMonolithic, hasLayered, hasNoFlat,
    hasBalanced, hasNoLopsided, hasSound, chaoticCount, monolithicCount,
  }
}

/**
 * Measure bell clarity (communication clarity)
 * @example
 * const m = measureResonating(content)
 * console.log(m.bell) // 'crystal-chime'
 */
export function measureResonating(content: string): ResonatingMeasure {
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

  const hasSelfDocumenting = hasDocComments(content) && hasInterface(content)
  const hasWellNamed = hasReturnType(content) && hasConst(content)
  const hasClearIntent = hasEnum(content) && hasTypeAlias(content)
  const hasExpressive = hasExport(content) && hasReadonly(content)
  const hasCommunicative = hasGenerics(content) && hasPrivate(content)
  const hasResonant = hasOptional(content) && hasAsync(content)

  score += hasSelfDocumenting ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasClearIntent ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasCommunicative ? 5 : 0
  score += hasResonant ? 5 : 0

  const clarity = Math.min(score, 100)
  const crypticCount = countMatches(/\bany\b/, content)
  const ambiguousCount = countMatches(/\bvar\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoAmbiguous = ambiguousCount === 0
  const hasNoTerse = countMatches(/\beval\b/, content) === 0
  const hasNoSilent = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  return {
    clarity, bell: classifyBell(clarity), hasHighClarity, hasSelfDocumenting, hasWellNamed,
    hasNoCryptic, hasClearIntent, hasNoAmbiguous, hasExpressive, hasNoTerse, hasCommunicative,
    hasNoSilent, hasResonant, crypticCount, ambiguousCount,
  }
}

/**
 * Measure silver strength (flexible strength)
 * @example
 * const m = measureTempering(content)
 * console.log(m.temper) // 'master-tempered'
 */
export function measureTempering(content: string): TemperingMeasure {
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

  const hasTypeSafe = hasReadonly(content) && hasOptional(content)
  const hasTested = hasInterface(content) && hasTryCatch(content)
  const hasFlexible = hasThrow(content) && hasTypeAlias(content)
  const hasExtensible = hasEnum(content) && hasConst(content)
  const hasResilient = hasExport(content) && hasReturnType(content)
  const hasAdaptive = hasGenerics(content) && hasAsync(content)

  score += hasTypeSafe ? 5 : 0
  score += hasTested ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasExtensible ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasAdaptive ? 5 : 0

  const strength = Math.min(score, 100)
  const unsafeCount = countMatches(/\bvar\b/, content)
  const fragileCount = countMatches(/\bany\b/, content)

  const hasNoUnsafe = unsafeCount === 0
  const hasNoUntested = countMatches(/\beval\b/, content) === 0
  const hasNoRigid = fragileCount === 0
  const hasNoHardcoded = countMatches(/\bconsole\.log\b/, content) === 0
  const hasNoFragile = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  return {
    strength, temper: classifyTemper(strength), hasHighStrength, hasTypeSafe, hasNoUnsafe,
    hasTested, hasNoUntested, hasFlexible, hasNoRigid, hasExtensible, hasNoHardcoded,
    hasResilient, hasNoFragile, hasAdaptive, unsafeCount, fragileCount,
  }
}

/**
 * Measure candle wisdom (documentation light)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.candle) // 'eternal-flame'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasDocumented = hasDocComments(content) && hasInterface(content)
  const hasWellCommented = hasReturnType(content) && hasAsync(content)
  const hasJSDoc = hasDocComments(content) && hasReturnType(content)
  const hasExplained = hasThrow(content) && hasExport(content)
  const hasIlluminated = hasConst(content) && hasTryCatch(content)
  const hasGuiding = hasEnum(content) && hasTypeAlias(content)

  score += hasDocumented ? 5 : 0
  score += hasWellCommented ? 5 : 0
  score += hasJSDoc ? 5 : 0
  score += hasExplained ? 5 : 0
  score += hasIlluminated ? 5 : 0
  score += hasGuiding ? 5 : 0

  const wisdom = Math.min(score, 100)
  const undocumentedCount = countMatches(/\bvar\b/, content)
  const bareCount = countMatches(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoBare = bareCount === 0
  const hasNoOpaque = countMatches(/\beval\b/, content) === 0
  const hasNoDark = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  return {
    wisdom, candle: classifyCandle(wisdom), hasHighWisdom, hasDocumented, hasWellCommented,
    hasNoUndocumented, hasJSDoc, hasNoBare, hasExplained, hasNoOpaque, hasIlluminated,
    hasNoDark, hasGuiding, undocumentedCount, bareCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify pillar condition
 * @example
 * classifyPillarCondition(90) // 'holy-relic'
 */
export function classifyPillarCondition(score: number): PillarCondition {
  if (score >= 85) return 'holy-relic'
  if (score >= 70) return 'blessed-silver'
  if (score >= 55) return 'proper-shrine'
  if (score >= 40) return 'tarnished-altar'
  if (score >= 25) return 'rusted-iron'
  return 'dust'
}

/**
 * Classify nave type
 * @example
 * classifyNaveType(pillars) // 'grand-cathedral'
 */
export function classifyNaveType(pillars: SilverPillar[]): NaveType {
  if (pillars.length === 0) return 'no-nave'
  const avgQs = Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)
  const masterpieceRatio = pillars.filter(p => p.condition === 'holy-relic').length / pillars.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'grand-cathedral'
  if (avgQs >= 60) return 'proper-church'
  if (avgQs >= 45) return 'small-chapel'
  if (avgQs >= 30) return 'wayside-shrine'
  if (avgQs >= 15) return 'ruined-abbey'
  return 'no-nave'
}

/**
 * Classify nave condition
 * @example
 * classifyNaveCondition(80) // 'sacred-ground'
 */
export function classifyNaveCondition(avgQs: number): NaveCondition {
  if (avgQs >= 75) return 'sacred-ground'
  if (avgQs >= 60) return 'blessed-hall'
  if (avgQs >= 45) return 'proper-sanctuary'
  if (avgQs >= 30) return 'secular-building'
  if (avgQs >= 15) return 'abandoned-ruin'
  return 'void'
}

/**
 * Classify bishop grade
 * @example
 * classifyBishopGrade(85) // 'archbishop'
 */
export function classifyBishopGrade(avgHoliness: number): BishopGrade {
  if (avgHoliness >= 80) return 'archbishop'
  if (avgHoliness >= 65) return 'bishop'
  if (avgHoliness >= 50) return 'abbot'
  if (avgHoliness >= 35) return 'prior'
  if (avgHoliness >= 20) return 'novice'
  return 'pilgrim'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(pillars, naves, diocese, stats)
 */
export function generateRecommendations(
  pillars: SilverPillar[],
  naves: SilverNave[],
  diocese: SilverDiocese,
  stats: SilverCathedralStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLunarPurity < 50) {
    recs.push('Purify code under moonlight with readable exports, transparent documentation, and clean type architecture')
  }
  if (stats.avgVaultArchitecture < 50) {
    recs.push('Reinforce vault architecture with structured interfaces, modular enums, and layered export patterns')
  }
  if (stats.avgBellClarity < 50) {
    recs.push('Sharpen bell clarity with self-documenting interfaces, well-named return types, and expressive type patterns')
  }
  if (stats.avgSilverStrength < 50) {
    recs.push('Temper silver strength with type-safe readonly properties, tested try-catch blocks, and resilient export patterns')
  }
  if (stats.avgCandleWisdom < 50) {
    recs.push('Light more candles with documented interfaces, JSDoc return types, and explained error handling patterns')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust in the cathedral — they need to be forged into silver pillars`)
  }
  if (diocese.overallHoliness < 40) {
    recs.push('Overall holiness is dangerously low — focus on lunar purity and candle wisdom first')
  }
  const allWeak = naves.every(n => n.naveType === 'no-nave' || n.naveType === 'ruined-abbey')
  if (allWeak && naves.length > 0) {
    recs.push('All naves are ruined abbeys — consider a major refactoring of the entire codebase')
  }
  const dustFiles = pillars.filter(p => p.condition === 'dust').map(p => p.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Forge these dust files into silver: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The silver cathedral gleams with sacred perfection! Every pillar radiates lunar purity, vault strength, and candle wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as silver pillar
 * @example
 * const pillar = analyzeSilverPillar(content, 'index.ts')
 * console.log(pillar.condition) // 'holy-relic'
 */
export function analyzeSilverPillar(content: string, filePath: string): SilverPillar {
  const purifying = measurePurifying(content)
  const architecting = measureArchitecting(content)
  const resonating = measureResonating(content)
  const tempering = measureTempering(content)
  const illuminating = measureIlluminating(content)

  const qualityScore = Math.round(
    purifying.purity * 0.2 +
    architecting.architecture * 0.2 +
    resonating.clarity * 0.2 +
    tempering.strength * 0.2 +
    illuminating.wisdom * 0.2,
  )

  return {
    file: filePath,
    lunarPurity: purifying.purity,
    vaultArchitecture: architecting.architecture,
    bellClarity: resonating.clarity,
    silverStrength: tempering.strength,
    candleWisdom: illuminating.wisdom,
    purifying, architecting, resonating, tempering, illuminating,
    condition: classifyPillarCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as silver nave
 * @example
 * const nave = analyzeSilverNave(pillars, 'src')
 * console.log(nave.naveType) // 'grand-cathedral'
 */
export function analyzeSilverNave(pillars: SilverPillar[], dirPath: string): SilverNave {
  if (pillars.length === 0) {
    return {
      directory: dirPath, pillars: [], avgPurity: 0, avgArchitecture: 0,
      avgWisdom: 0, holyRelicCount: 0, dustCount: 0,
      naveType: 'no-nave', condition: 'void',
    }
  }

  const avgPurity = Math.round(pillars.reduce((s, p) => s + p.lunarPurity, 0) / pillars.length)
  const avgArchitecture = Math.round(pillars.reduce((s, p) => s + p.vaultArchitecture, 0) / pillars.length)
  const avgWisdom = Math.round(pillars.reduce((s, p) => s + p.candleWisdom, 0) / pillars.length)
  const holyRelicCount = pillars.filter(p => p.condition === 'holy-relic').length
  const dustCount = pillars.filter(p => p.condition === 'dust').length
  const avgQs = Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)

  return {
    directory: dirPath, pillars, avgPurity, avgArchitecture, avgWisdom,
    holyRelicCount, dustCount,
    naveType: classifyNaveType(pillars),
    condition: classifyNaveCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete silver cathedral result
 * @example
 * const result = await buildSilverCathedralResult(files, contents)
 * console.log(result.stats.bishopGrade) // 'archbishop'
 */
export async function buildSilverCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverCathedralResult> {
  const pillars = files.map((file, i) => analyzeSilverPillar(contents[i] ?? '', file))

  const dirMap = new Map<string, SilverPillar[]>()
  for (const pillar of pillars) {
    const dir = path.dirname(pillar.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(pillar) } else { dirMap.set(dir, [pillar]) }
  }

  const naves = Array.from(dirMap.entries()).map(([dir, dirPillars]) =>
    analyzeSilverNave(dirPillars, dir),
  )

  const avgPurity = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.lunarPurity, 0) / pillars.length) : 0
  const avgArchitecture = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.vaultArchitecture, 0) / pillars.length) : 0
  const avgWisdom = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.candleWisdom, 0) / pillars.length) : 0

  const overallHoliness = pillars.length > 0
    ? Math.round((avgPurity + avgArchitecture + avgWisdom) / 3) : 0
  const isSacred = avgPurity >= 60

  const diocese: SilverDiocese = { avgPurity, avgArchitecture, avgWisdom, isSacred, overallHoliness }

  const avgClarity = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.bellClarity, 0) / pillars.length) : 0
  const avgStrength = pillars.length > 0
    ? Math.round(pillars.reduce((s, p) => s + p.silverStrength, 0) / pillars.length) : 0

  const bestPillar = pillars.length > 0
    ? pillars.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const purest = pillars.length > 0
    ? pillars.reduce((best, p) => p.lunarPurity > best.lunarPurity ? p : best).file : ''
  const bestArchitecture = pillars.length > 0
    ? pillars.reduce((best, p) => p.vaultArchitecture > best.vaultArchitecture ? p : best).file : ''
  const clearest = pillars.length > 0
    ? pillars.reduce((best, p) => p.bellClarity > best.bellClarity ? p : best).file : ''
  const wisest = pillars.length > 0
    ? pillars.reduce((best, p) => p.candleWisdom > best.candleWisdom ? p : best).file : ''

  const stats: SilverCathedralStats = {
    totalFiles: pillars.length,
    totalNaves: naves.length,
    avgLunarPurity: avgPurity,
    avgVaultArchitecture: avgArchitecture,
    avgBellClarity: avgClarity,
    avgSilverStrength: avgStrength,
    avgCandleWisdom: avgWisdom,
    holyRelicCount: pillars.filter(p => p.condition === 'holy-relic').length,
    blessedSilverCount: pillars.filter(p => p.condition === 'blessed-silver').length,
    properShrineCount: pillars.filter(p => p.condition === 'proper-shrine').length,
    tarnishedAltarCount: pillars.filter(p => p.condition === 'tarnished-altar').length,
    rustedIronCount: pillars.filter(p => p.condition === 'rusted-iron').length,
    dustCount: pillars.filter(p => p.condition === 'dust').length,
    hasHighPurityCount: pillars.filter(p => p.purifying.hasHighPurity).length,
    hasHighArchitectureCount: pillars.filter(p => p.architecting.hasHighArchitecture).length,
    hasHighClarityCount: pillars.filter(p => p.resonating.hasHighClarity).length,
    hasHighStrengthCount: pillars.filter(p => p.tempering.hasHighStrength).length,
    hasHighWisdomCount: pillars.filter(p => p.illuminating.hasHighWisdom).length,
    overallHoliness,
    bishopGrade: classifyBishopGrade(overallHoliness),
    bestPillar, purest, bestArchitecture, clearest, wisest,
  }

  const recommendations = generateRecommendations(pillars, naves, diocese, stats)

  return { pillars, naves, diocese, stats, recommendations }
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
