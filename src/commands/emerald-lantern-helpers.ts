// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type IlluminationGrade = 'beacon-light' | 'bright-lantern' | 'proper-glow' | 'dim-light' | 'flickering-candle' | 'dark'
export type ClarityGrade = 'flawless-emerald' | 'clear-lens' | 'proper-transparency' | 'cloudy-glass' | 'cracked-lens' | 'opaque'
export type FlameGrade = 'eternal-flame' | 'steady-burn' | 'proper-flicker' | 'unsteady-flame' | 'dying-ember' | 'no-flame'
export type FiltrationGrade = 'pure-signal' | 'clean-filter' | 'proper-filtration' | 'noisy-filter' | 'clogged-lens' | 'no-filter'
export type ReachGrade = 'lighthouse-beam' | 'far-reaching' | 'proper-spread' | 'short-range' | 'dim-corner' | 'no-reach'
export type FlameCondition = 'legendary-lantern' | 'emerald-beacon' | 'proper-lamp' | 'rusty-lantern' | 'cracked-glass' | 'extinguished'
export type HallType = 'grand-hall' | 'lantern-gallery' | 'proper-corridor' | 'dim-passageway' | 'dark-alley' | 'no-hall'
export type HallCondition = 'illuminated-palace' | 'bright-gallery' | 'decent-hallway' | 'dim-corridor' | 'dark-tunnel' | 'void'
export type KeeperGrade = 'light-keeper' | 'lantern-master' | 'skilled-illuminator' | 'apprentice' | 'novice' | 'dark-dweller'

export interface BrighteningMeasure {
  quality: number
  grade: IlluminationGrade
  hasHighQuality: boolean
  hasEnlightening: boolean
  hasSelfDocumenting: boolean
  hasNoObfuscated: boolean
  hasClear: boolean
  hasNoCryptic: boolean
  hasRevealing: boolean
  hasNoHidden: boolean
  hasIlluminating: boolean
  hasNoObscure: boolean
  hasBright: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  lens: ClarityGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasWellStructured: boolean
  hasNoDense: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasSpacious: boolean
  hasNoCluttered: boolean
  hasClean: boolean
  denseCount: number
  chaoticCount: number
}

export interface StabilizingMeasure {
  stability: number
  flame: FlameGrade
  hasHighStability: boolean
  hasErrorHandling: boolean
  hasExceptionRecovery: boolean
  hasNoBareCrash: boolean
  hasRetryLogic: boolean
  hasNoSinglePointFail: boolean
  hasGracefulDegradation: boolean
  hasNoHardCrash: boolean
  hasResilient: boolean
  hasNoFragile: boolean
  hasDependable: boolean
  bareCrashCount: number
  singlePointFailCount: number
}

export interface FilteringMeasure {
  filtration: number
  emerald: FiltrationGrade
  hasHighFiltration: boolean
  hasHighSignal: boolean
  hasLowNoise: boolean
  hasNoDeadCode: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasFocused: boolean
  hasNoRedundant: boolean
  hasClean: boolean
  deadCodeCount: number
  fillerCount: number
}

export interface ReachingMeasure {
  reach: number
  light: ReachGrade
  hasHighReach: boolean
  hasDocumented: boolean
  hasWellCommented: boolean
  hasNoUndocumented: boolean
  hasJSDocExamples: boolean
  hasNoSilent: boolean
  hasExplained: boolean
  hasNoUnexplained: boolean
  hasDescribed: boolean
  hasNoUndescribed: boolean
  hasVisible: boolean
  undocumentedCount: number
  silentCount: number
}

export interface EmeraldFlame {
  file: string
  illuminationQuality: number
  lensClarity: number
  flameStability: number
  emeraldFiltration: number
  lightReach: number
  brightening: BrighteningMeasure
  clarifying: ClarifyingMeasure
  stabilizing: StabilizingMeasure
  filtering: FilteringMeasure
  reaching: ReachingMeasure
  condition: FlameCondition
  qualityScore: number
}

export interface LanternHall {
  directory: string
  flames: EmeraldFlame[]
  avgIllumination: number
  avgClarity: number
  avgStability: number
  legendaryLanternCount: number
  extinguishedCount: number
  hallType: HallType
  condition: HallCondition
}

export interface EmeraldLight {
  avgIllumination: number
  avgClarity: number
  avgStability: number
  isBright: boolean
  overallBrilliance: number
}

export interface EmeraldLanternStats {
  totalFiles: number
  totalHalls: number
  avgIlluminationQuality: number
  avgLensClarity: number
  avgFlameStability: number
  avgEmeraldFiltration: number
  avgLightReach: number
  legendaryLanternCount: number
  emeraldBeaconCount: number
  properLampCount: number
  rustyLanternCount: number
  crackedGlassCount: number
  extinguishedCount: number
  hasHighQualityCount: number
  hasHighClarityCount: number
  hasHighStabilityCount: number
  hasHighFiltrationCount: number
  hasHighReachCount: number
  overallBrilliance: number
  keeperGrade: KeeperGrade
  bestFlame: string
  brightest: string
  clearest: string
  mostStable: string
  farthestReach: string
}

export interface EmeraldLanternResult {
  flames: EmeraldFlame[]
  halls: LanternHall[]
  light: EmeraldLight
  stats: EmeraldLanternStats
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
const hasConst = (c: string) => has(/\bconst\b/, c)
const hasReturnType = (c: string) => has(/:\s*(?:string|number|boolean|void|Promise|unknown|never)\b/, c)
const hasInterface = (c: string) => has(/\binterface\b/, c)
const hasGenerics = (c: string) => has(/<[A-Z][A-Za-z]*>/, c)
const hasAsync = (c: string) => has(/\basync\b/, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasDefaultParam = (c: string) => has(/=\s*[^>]/, c)
const hasEnum = (c: string) => has(/\benum\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)
const hasConditional = (c: string) => has(/\bif\b/, c)
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)
const hasArrowFunction = (c: string) => has(/=>/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasThrow = (c: string) => has(/\bthrow\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure illumination quality (brightening)
 * @example
 * const m = measureBrightening(content)
 * console.log(m.grade) // 'beacon-light'
 */
export function measureBrightening(content: string): BrighteningMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasEnlightening = hasDocComments(content) && hasReturnType(content)
  const hasSelfDocumenting = hasNamedExport(content) && hasInterface(content)
  const hasClear = hasExport(content) && hasImport(content)
  const hasRevealing = hasGenerics(content) && hasTypeAlias(content)
  const hasIlluminating = hasReadonly(content) && hasOptional(content)
  const hasBright = hasEnum(content) && hasConst(content)

  score += hasEnlightening ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasIlluminating ? 5 : 0
  score += hasBright ? 5 : 0

  const quality = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoObscure = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: IlluminationGrade
  if (quality >= 85) grade = 'beacon-light'
  else if (quality >= 70) grade = 'bright-lantern'
  else if (quality >= 55) grade = 'proper-glow'
  else if (quality >= 40) grade = 'dim-light'
  else if (quality >= 25) grade = 'flickering-candle'
  else grade = 'dark'

  return {
    quality, grade, hasHighQuality, hasEnlightening, hasSelfDocumenting,
    hasNoObfuscated, hasClear, hasNoCryptic, hasRevealing, hasNoHidden,
    hasIlluminating, hasNoObscure, hasBright, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure lens clarity (clarifying)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.lens) // 'flawless-emerald'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasReadable = hasInterface(content) && hasReturnType(content)
  const hasWellStructured = hasNamedExport(content) && hasConst(content)
  const hasOrganized = hasEnum(content) && hasUnionType(content)
  const hasTransparent = hasOptional(content) && hasGenerics(content)
  const hasSpacious = hasArrowFunction(content) && hasMapFunction(content)
  const hasClean = hasStrictEq(content) && hasDocComments(content)

  score += hasReadable ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasSpacious ? 5 : 0
  score += hasClean ? 5 : 0

  const clarity = Math.min(score, 100)
  const denseCount = countMatches(/\bvar\b/, content)
  const chaoticCount = countMatches(/\bany\b/, content)

  const hasNoDense = denseCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoObfuscated = !has(/\beval\b/, content)
  const hasNoCluttered = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let lens: ClarityGrade
  if (clarity >= 85) lens = 'flawless-emerald'
  else if (clarity >= 70) lens = 'clear-lens'
  else if (clarity >= 55) lens = 'proper-transparency'
  else if (clarity >= 40) lens = 'cloudy-glass'
  else if (clarity >= 25) lens = 'cracked-lens'
  else lens = 'opaque'

  return {
    clarity, lens, hasHighClarity, hasReadable, hasWellStructured, hasNoDense,
    hasOrganized, hasNoChaotic, hasTransparent, hasNoObfuscated, hasSpacious,
    hasNoCluttered, hasClean, denseCount, chaoticCount,
  }
}

/**
 * Measure flame stability (stabilizing)
 * @example
 * const m = measureStabilizing(content)
 * console.log(m.flame) // 'eternal-flame'
 */
export function measureStabilizing(content: string): StabilizingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasThrow(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0

  const hasErrorHandling = hasTryCatch(content) && hasThrow(content)
  const hasExceptionRecovery = hasAsync(content) && hasTryCatch(content)
  const hasRetryLogic = hasConditional(content) && hasNullishCoalescing(content)
  const hasGracefulDegradation = hasDefaultParam(content) && hasOptional(content)
  const hasResilient = hasStrictEq(content) && hasReturnType(content)
  const hasDependable = hasInterface(content) && hasEnum(content)

  score += hasErrorHandling ? 5 : 0
  score += hasExceptionRecovery ? 5 : 0
  score += hasRetryLogic ? 5 : 0
  score += hasGracefulDegradation ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasDependable ? 5 : 0

  const stability = Math.min(score, 100)
  const bareCrashCount = countMatches(/\bvar\b/, content)
  const singlePointFailCount = countMatches(/\bany\b/, content)

  const hasNoBareCrash = bareCrashCount === 0
  const hasNoSinglePointFail = singlePointFailCount === 0
  const hasNoHardCrash = !has(/\beval\b/, content)
  const hasNoFragile = !has(/\bdebugger\b/, content)
  const hasHighStability = stability >= 70

  let flame: FlameGrade
  if (stability >= 85) flame = 'eternal-flame'
  else if (stability >= 70) flame = 'steady-burn'
  else if (stability >= 55) flame = 'proper-flicker'
  else if (stability >= 40) flame = 'unsteady-flame'
  else if (stability >= 25) flame = 'dying-ember'
  else flame = 'no-flame'

  return {
    stability, flame, hasHighStability, hasErrorHandling, hasExceptionRecovery,
    hasNoBareCrash, hasRetryLogic, hasNoSinglePointFail, hasGracefulDegradation,
    hasNoHardCrash, hasResilient, hasNoFragile, hasDependable,
    bareCrashCount, singlePointFailCount,
  }
}

/**
 * Measure emerald filtration (filtering)
 * @example
 * const m = measureFiltering(content)
 * console.log(m.emerald) // 'pure-signal'
 */
export function measureFiltering(content: string): FilteringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTryCatch(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0

  const hasHighSignal = hasExport(content) && hasReturnType(content)
  const hasEssential = hasDocComments(content) && hasInterface(content)
  const hasMeaningful = hasStrictEq(content) && hasConst(content)
  const hasFocused = hasNamedExport(content) && hasAsync(content)
  const hasClean = hasMapFunction(content) && hasArrowFunction(content)
  const hasLowNoise = hasTryCatch(content) && hasThrow(content)

  score += hasHighSignal ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasLowNoise ? 5 : 0

  const filtration = Math.min(score, 100)
  const deadCodeCount = countMatches(/\bvar\b/, content)
  const fillerCount = countMatches(/\bany\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoFiller = fillerCount === 0
  const hasNoBoilerplate = !has(/\beval\b/, content)
  const hasNoRedundant = !has(/\bdebugger\b/, content)
  const hasHighFiltration = filtration >= 70

  let emerald: FiltrationGrade
  if (filtration >= 85) emerald = 'pure-signal'
  else if (filtration >= 70) emerald = 'clean-filter'
  else if (filtration >= 55) emerald = 'proper-filtration'
  else if (filtration >= 40) emerald = 'noisy-filter'
  else if (filtration >= 25) emerald = 'clogged-lens'
  else emerald = 'no-filter'

  return {
    filtration, emerald, hasHighFiltration, hasHighSignal, hasLowNoise,
    hasNoDeadCode, hasEssential, hasNoFiller, hasMeaningful, hasNoBoilerplate,
    hasFocused, hasNoRedundant, hasClean, deadCodeCount, fillerCount,
  }
}

/**
 * Measure light reach (reaching)
 * @example
 * const m = measureReaching(content)
 * console.log(m.light) // 'lighthouse-beam'
 */
export function measureReaching(content: string): ReachingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasWellCommented = hasDocComments(content) && hasReturnType(content)
  const hasJSDocExamples = hasDocComments(content) && hasInterface(content)
  const hasExplained = hasImport(content) && hasExport(content)
  const hasDescribed = hasTypeAlias(content) && hasGenerics(content)
  const hasVisible = hasNamedExport(content) && hasOptional(content)

  score += hasDocumented ? 5 : 0
  score += hasWellCommented ? 5 : 0
  score += hasJSDocExamples ? 5 : 0
  score += hasExplained ? 5 : 0
  score += hasDescribed ? 5 : 0
  score += hasVisible ? 5 : 0

  const reach = Math.min(score, 100)
  const undocumentedCount = countMatches(/\bvar\b/, content)
  const silentCount = countMatches(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoSilent = silentCount === 0
  const hasNoUnexplained = !has(/\beval\b/, content)
  const hasNoUndescribed = !has(/\bdebugger\b/, content)
  const hasHighReach = reach >= 70

  let light: ReachGrade
  if (reach >= 85) light = 'lighthouse-beam'
  else if (reach >= 70) light = 'far-reaching'
  else if (reach >= 55) light = 'proper-spread'
  else if (reach >= 40) light = 'short-range'
  else if (reach >= 25) light = 'dim-corner'
  else light = 'no-reach'

  return {
    reach, light, hasHighReach, hasDocumented, hasWellCommented,
    hasNoUndocumented, hasJSDocExamples, hasNoSilent, hasExplained,
    hasNoUnexplained, hasDescribed, hasNoUndescribed, hasVisible,
    undocumentedCount, silentCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify flame condition
 * @example
 * classifyFlameCondition(90) // 'legendary-lantern'
 */
export function classifyFlameCondition(score: number): FlameCondition {
  if (score >= 85) return 'legendary-lantern'
  if (score >= 70) return 'emerald-beacon'
  if (score >= 55) return 'proper-lamp'
  if (score >= 40) return 'rusty-lantern'
  if (score >= 25) return 'cracked-glass'
  return 'extinguished'
}

/**
 * Classify hall type
 * @example
 * classifyHallType(flames) // 'grand-hall'
 */
export function classifyHallType(flames: EmeraldFlame[]): HallType {
  if (flames.length === 0) return 'no-hall'
  const avgQs = Math.round(flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length)
  const legendaryRatio = flames.filter(f => f.condition === 'legendary-lantern').length / flames.length
  if (avgQs >= 75 && legendaryRatio >= 0.5) return 'grand-hall'
  if (avgQs >= 60) return 'lantern-gallery'
  if (avgQs >= 45) return 'proper-corridor'
  if (avgQs >= 30) return 'dim-passageway'
  if (avgQs >= 15) return 'dark-alley'
  return 'no-hall'
}

/**
 * Classify hall condition
 * @example
 * classifyHallCondition(80) // 'illuminated-palace'
 */
export function classifyHallCondition(avgQs: number): HallCondition {
  if (avgQs >= 75) return 'illuminated-palace'
  if (avgQs >= 60) return 'bright-gallery'
  if (avgQs >= 45) return 'decent-hallway'
  if (avgQs >= 30) return 'dim-corridor'
  if (avgQs >= 15) return 'dark-tunnel'
  return 'void'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'light-keeper'
 */
export function classifyKeeperGrade(avgBrilliance: number): KeeperGrade {
  if (avgBrilliance >= 80) return 'light-keeper'
  if (avgBrilliance >= 65) return 'lantern-master'
  if (avgBrilliance >= 50) return 'skilled-illuminator'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'dark-dweller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(flames, halls, light, stats)
 */
export function generateRecommendations(
  flames: EmeraldFlame[],
  halls: LanternHall[],
  light: EmeraldLight,
  stats: EmeraldLanternStats,
): string[] {
  const recs: string[] = []
  if (stats.avgIlluminationQuality < 50) {
    recs.push('Brighten illumination quality with documentation, descriptive naming, and self-documenting patterns')
  }
  if (stats.avgLensClarity < 50) {
    recs.push('Polish lens clarity with readable structures, organized types, and transparent abstractions')
  }
  if (stats.avgFlameStability < 50) {
    recs.push('Stabilize the flame with error handling, exception recovery, and graceful degradation')
  }
  if (stats.avgEmeraldFiltration < 50) {
    recs.push('Sharpen emerald filtration by removing dead code, reducing filler, and focusing on essentials')
  }
  if (stats.avgLightReach < 50) {
    recs.push('Extend light reach with comprehensive documentation, JSDoc examples, and described interfaces')
  }
  if (stats.extinguishedCount > 0) {
    recs.push(`${stats.extinguishedCount} file(s) are extinguished — they need complete lantern restoration`)
  }
  if (light.overallBrilliance < 40) {
    recs.push('Overall brilliance is low — focus on illumination quality and lens clarity first')
  }
  const allDark = halls.every(h => h.hallType === 'no-hall' || h.hallType === 'dark-alley')
  if (allDark && halls.length > 0) {
    recs.push('All halls are dark — consider a major lantern reconstruction')
  }
  const extinguishedFiles = flames.filter(f => f.condition === 'extinguished').map(f => f.file)
  if (extinguishedFiles.length > 0 && extinguishedFiles.length <= 3) {
    recs.push(`Restore these extinguished files: ${extinguishedFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your emerald lantern achieves light keeper grade! Every flame burns with brilliant clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as emerald flame
 * @example
 * const f = analyzeEmeraldFlame(content, 'index.ts')
 * console.log(f.condition) // 'legendary-lantern'
 */
export function analyzeEmeraldFlame(content: string, filePath: string): EmeraldFlame {
  const brightening = measureBrightening(content)
  const clarifying = measureClarifying(content)
  const stabilizing = measureStabilizing(content)
  const filtering = measureFiltering(content)
  const reaching = measureReaching(content)

  const qualityScore = Math.round(
    brightening.quality * 0.2 +
    clarifying.clarity * 0.2 +
    stabilizing.stability * 0.2 +
    filtering.filtration * 0.2 +
    reaching.reach * 0.2,
  )

  return {
    file: filePath,
    illuminationQuality: brightening.quality,
    lensClarity: clarifying.clarity,
    flameStability: stabilizing.stability,
    emeraldFiltration: filtering.filtration,
    lightReach: reaching.reach,
    brightening,
    clarifying,
    stabilizing,
    filtering,
    reaching,
    condition: classifyFlameCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as lantern hall
 * @example
 * const h = analyzeLanternHall(flames, 'src')
 * console.log(h.hallType) // 'grand-hall'
 */
export function analyzeLanternHall(flames: EmeraldFlame[], dirPath: string): LanternHall {
  if (flames.length === 0) {
    return {
      directory: dirPath, flames: [], avgIllumination: 0, avgClarity: 0,
      avgStability: 0, legendaryLanternCount: 0, extinguishedCount: 0,
      hallType: 'no-hall', condition: 'void',
    }
  }

  const avgIllumination = Math.round(flames.reduce((s, f) => s + f.illuminationQuality, 0) / flames.length)
  const avgClarity = Math.round(flames.reduce((s, f) => s + f.lensClarity, 0) / flames.length)
  const avgStability = Math.round(flames.reduce((s, f) => s + f.flameStability, 0) / flames.length)
  const legendaryLanternCount = flames.filter(f => f.condition === 'legendary-lantern').length
  const extinguishedCount = flames.filter(f => f.condition === 'extinguished').length
  const avgQs = Math.round(flames.reduce((s, f) => s + f.qualityScore, 0) / flames.length)

  return {
    directory: dirPath, flames, avgIllumination, avgClarity, avgStability,
    legendaryLanternCount, extinguishedCount,
    hallType: classifyHallType(flames),
    condition: classifyHallCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete emerald lantern result
 * @example
 * const result = await buildEmeraldLanternResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'light-keeper'
 */
export async function buildEmeraldLanternResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldLanternResult> {
  const flames = files.map((file, i) => analyzeEmeraldFlame(contents[i] ?? '', file))

  const dirMap = new Map<string, EmeraldFlame[]>()
  for (const flame of flames) {
    const dir = path.dirname(flame.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(flame) } else { dirMap.set(dir, [flame]) }
  }

  const halls = Array.from(dirMap.entries()).map(([dir, dirFlames]) =>
    analyzeLanternHall(dirFlames, dir),
  )

  const avgIllumination = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.illuminationQuality, 0) / flames.length) : 0
  const avgClarity = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.lensClarity, 0) / flames.length) : 0
  const avgStability = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.flameStability, 0) / flames.length) : 0

  const overallBrilliance = flames.length > 0
    ? Math.round((avgIllumination + avgClarity + avgStability) / 3) : 0
  const isBright = avgIllumination >= 60

  const lightResult: EmeraldLight = { avgIllumination, avgClarity, avgStability, isBright, overallBrilliance }

  const avgEmeraldFiltration = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.emeraldFiltration, 0) / flames.length) : 0
  const avgLightReach = flames.length > 0
    ? Math.round(flames.reduce((s, f) => s + f.lightReach, 0) / flames.length) : 0

  const bestFlame = flames.length > 0
    ? flames.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const brightest = flames.length > 0
    ? flames.reduce((best, f) => f.illuminationQuality > best.illuminationQuality ? f : best).file : ''
  const clearest = flames.length > 0
    ? flames.reduce((best, f) => f.lensClarity > best.lensClarity ? f : best).file : ''
  const mostStable = flames.length > 0
    ? flames.reduce((best, f) => f.flameStability > best.flameStability ? f : best).file : ''
  const farthestReach = flames.length > 0
    ? flames.reduce((best, f) => f.lightReach > best.lightReach ? f : best).file : ''

  const stats: EmeraldLanternStats = {
    totalFiles: flames.length,
    totalHalls: halls.length,
    avgIlluminationQuality: avgIllumination,
    avgLensClarity: avgClarity,
    avgFlameStability: avgStability,
    avgEmeraldFiltration,
    avgLightReach,
    legendaryLanternCount: flames.filter(f => f.condition === 'legendary-lantern').length,
    emeraldBeaconCount: flames.filter(f => f.condition === 'emerald-beacon').length,
    properLampCount: flames.filter(f => f.condition === 'proper-lamp').length,
    rustyLanternCount: flames.filter(f => f.condition === 'rusty-lantern').length,
    crackedGlassCount: flames.filter(f => f.condition === 'cracked-glass').length,
    extinguishedCount: flames.filter(f => f.condition === 'extinguished').length,
    hasHighQualityCount: flames.filter(f => f.brightening.hasHighQuality).length,
    hasHighClarityCount: flames.filter(f => f.clarifying.hasHighClarity).length,
    hasHighStabilityCount: flames.filter(f => f.stabilizing.hasHighStability).length,
    hasHighFiltrationCount: flames.filter(f => f.filtering.hasHighFiltration).length,
    hasHighReachCount: flames.filter(f => f.reaching.hasHighReach).length,
    overallBrilliance,
    keeperGrade: classifyKeeperGrade(overallBrilliance),
    bestFlame, brightest, clearest, mostStable, farthestReach,
  }

  const recommendations = generateRecommendations(flames, halls, lightResult, stats)

  return { flames, halls, light: lightResult, stats, recommendations }
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
