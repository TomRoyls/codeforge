// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type RevealingGrade = 'pure-gold' | 'clear-truth' | 'proper-morality' | 'gray-area' | 'deceptive' | 'no-clarity'
export type AligningBearing = 'true-north' | 'honest-bearing' | 'proper-aim' | 'approximate-truth' | 'false-bearing' | 'no-truth'
export type GuidingNavigation = 'wise-guide' | 'helpful-signs' | 'proper-direction' | 'confusing-map' | 'misleading-signs' | 'no-guidance'
export type VirtueingCardinal = 'golden-rule' | 'virtuous-design' | 'proper-principles' | 'flexible-morals' | 'no-principles' | 'no-virtue'
export type ConvictingNeedle = 'unwavering-gold' | 'steady-needle' | 'proper-conviction' | 'wavering-needle' | 'spinning-compass' | 'no-conviction'
export type NeedleCondition = 'golden-instrument' | 'brass-compass' | 'proper-tool' | 'rusty-compass' | 'broken-device' | 'paperweight'
export type GuildType = 'master-guild' | 'proper-school' | 'decent-academy' | 'small-shop' | 'street-corner' | 'no-guild'
export type GuildCondition = 'institution-of-truth' | 'honorable-guild' | 'decent-school' | 'shady-shop' | 'abandoned' | 'void'
export type ScholarGrade = 'truth-seeker' | 'golden-scholar' | 'skilled-reader' | 'apprentice' | 'novice' | 'deceiver'

export interface RevealingMeasure {
  clarity: number
  grade: RevealingGrade
  hasHighClarity: boolean
  hasNoSideEffects: boolean
  hasNoHiddenBehavior: boolean
  hasNoDeceptive: boolean
  hasTransparent: boolean
  hasNoMisleading: boolean
  hasHonest: boolean
  hasNoTricky: boolean
  hasStraightforward: boolean
  hasNoClever: boolean
  hasPrincipled: boolean
  sideEffectCount: number
  deceptiveCount: number
}

export interface AligningMeasure {
  truth: number
  bearing: AligningBearing
  hasHighTruth: boolean
  hasAccurateNames: boolean
  hasNoMisnamed: boolean
  hasDoesWhatItSays: boolean
  hasNoSurprises: boolean
  hasTruthful: boolean
  hasNoContradictory: boolean
  hasConsistent: boolean
  hasNoInconsistent: boolean
  hasReliable: boolean
  hasNoUnreliable: boolean
  hasFaithful: boolean
  misnamedCount: number
  surpriseCount: number
}

export interface GuidingMeasure {
  wisdom: number
  navigation: GuidingNavigation
  hasHighWisdom: boolean
  hasWellDocumented: boolean
  hasClearExamples: boolean
  hasNoUndocumented: boolean
  hasIntuitive: boolean
  hasNoCounterintuitive: boolean
  hasHelpful: boolean
  hasNoObfuscated: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasGuiding: boolean
  undocumentedCount: number
  counterintuitiveCount: number
}

export interface VirtueingMeasure {
  virtue: number
  cardinal: VirtueingCardinal
  hasHighVirtue: boolean
  hasCleanArchitecture: boolean
  hasNoAntiPatterns: boolean
  hasBestPractices: boolean
  hasNoShortcuts: boolean
  hasProperPatterns: boolean
  hasNoHacks: boolean
  hasStandardCompliant: boolean
  hasNoViolations: boolean
  hasPrincipled: boolean
  hasNoAdhoc: boolean
  hasRighteous: boolean
  antiPatternCount: number
  hackCount: number
}

export interface ConvictingMeasure {
  conviction: number
  needle: ConvictingNeedle
  hasHighConviction: boolean
  hasConsistent: boolean
  hasNoMixed: boolean
  hasUniform: boolean
  hasNoInconsistent: boolean
  hasReliable: boolean
  hasNoFlaky: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasSteadfast: boolean
  hasNoVacillating: boolean
  hasDetermined: boolean
  mixedCount: number
  flakyCount: number
}

export interface GoldenNeedle {
  file: string
  moralClarity: number
  bearingTruth: number
  navigationWisdom: number
  cardinalVirtue: number
  needleConviction: number
  revealing: RevealingMeasure
  aligning: AligningMeasure
  guiding: GuidingMeasure
  virtueing: VirtueingMeasure
  convicting: ConvictingMeasure
  condition: NeedleCondition
  qualityScore: number
}

export interface CompassGuild {
  directory: string
  needles: GoldenNeedle[]
  avgClarity: number
  avgTruth: number
  avgConviction: number
  goldenInstrumentCount: number
  paperweightCount: number
  guildType: GuildType
  condition: GuildCondition
}

export interface GoldenTruth {
  avgClarity: number
  avgTruth: number
  avgConviction: number
  isTruthful: boolean
  overallVirtue: number
}

export interface GoldenCompassStats {
  totalFiles: number
  totalGuilds: number
  avgMoralClarity: number
  avgBearingTruth: number
  avgNavigationWisdom: number
  avgCardinalVirtue: number
  avgNeedleConviction: number
  goldenInstrumentCount: number
  brassCompassCount: number
  properToolCount: number
  rustyCompassCount: number
  brokenDeviceCount: number
  paperweightCount: number
  hasHighClarityCount: number
  hasHighTruthCount: number
  hasHighWisdomCount: number
  hasHighVirtueCount: number
  hasHighConvictionCount: number
  overallVirtue: number
  scholarGrade: ScholarGrade
  bestNeedle: string
  mostClear: string
  mostTruthful: string
  wisest: string
  mostVirtuous: string
}

export interface GoldenCompassResult {
  needles: GoldenNeedle[]
  guilds: CompassGuild[]
  truth: GoldenTruth
  stats: GoldenCompassStats
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
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure moral clarity (ethical behavior)
 * @example
 * const m = measureRevealing(content)
 * console.log(m.grade) // 'pure-gold'
 */
export function measureRevealing(content: string): RevealingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasStrictEq(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasEnum(content) ? 4 : 0

  const hasNoSideEffects = hasExport(content) && hasInterface(content)
  const hasNoHiddenBehavior = hasReturnType(content) && hasDocComments(content)
  const hasTransparent = hasConst(content) && hasNamedExport(content)
  const hasHonest = hasStrictEq(content) && hasTypeAlias(content)
  const hasStraightforward = hasReadonly(content) && hasOptional(content)
  const hasPrincipled = hasGenerics(content) && hasEnum(content)

  score += hasNoSideEffects ? 5 : 0
  score += hasNoHiddenBehavior ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasHonest ? 5 : 0
  score += hasStraightforward ? 5 : 0
  score += hasPrincipled ? 5 : 0

  const clarity = Math.min(score, 100)
  const sideEffectCount = countMatches(/\bvar\b/, content)
  const deceptiveCount = countMatches(/\bany\b/, content)

  const hasNoDeceptive = sideEffectCount === 0
  const hasNoMisleading = deceptiveCount === 0
  const hasNoTricky = !has(/\beval\b/, content)
  const hasNoClever = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: RevealingGrade
  if (clarity >= 85) grade = 'pure-gold'
  else if (clarity >= 70) grade = 'clear-truth'
  else if (clarity >= 55) grade = 'proper-morality'
  else if (clarity >= 40) grade = 'gray-area'
  else if (clarity >= 25) grade = 'deceptive'
  else grade = 'no-clarity'

  return {
    clarity, grade, hasHighClarity, hasNoSideEffects, hasNoHiddenBehavior,
    hasNoDeceptive, hasTransparent, hasNoMisleading, hasHonest, hasNoTricky,
    hasStraightforward, hasNoClever, hasPrincipled,
    sideEffectCount, deceptiveCount,
  }
}

/**
 * Measure bearing truth (does what it claims)
 * @example
 * const m = measureAligning(content)
 * console.log(m.bearing) // 'true-north'
 */
export function measureAligning(content: string): AligningMeasure {
  let score = 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasGenerics(content) ? 4 : 0

  const hasAccurateNames = hasInterface(content) && hasReturnType(content)
  const hasDoesWhatItSays = hasNamedExport(content) && hasDocComments(content)
  const hasTruthful = hasExport(content) && hasConst(content)
  const hasConsistent = hasStrictEq(content) && hasEnum(content)
  const hasReliable = hasReadonly(content) && hasOptional(content)
  const hasFaithful = hasTypeAlias(content) && hasGenerics(content)

  score += hasAccurateNames ? 5 : 0
  score += hasDoesWhatItSays ? 5 : 0
  score += hasTruthful ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasFaithful ? 5 : 0

  const truth = Math.min(score, 100)
  const misnamedCount = countMatches(/\bvar\b/, content)
  const surpriseCount = countMatches(/\beval\b/, content)

  const hasNoMisnamed = misnamedCount === 0
  const hasNoSurprises = surpriseCount === 0
  const hasNoContradictory = countMatches(/\bany\b/, content) === 0
  const hasNoInconsistent = !has(/\bdebugger\b/, content)
  const hasNoUnreliable = !has(/\beval\b/, content)
  const hasHighTruth = truth >= 70

  let bearing: AligningBearing
  if (truth >= 85) bearing = 'true-north'
  else if (truth >= 70) bearing = 'honest-bearing'
  else if (truth >= 55) bearing = 'proper-aim'
  else if (truth >= 40) bearing = 'approximate-truth'
  else if (truth >= 25) bearing = 'false-bearing'
  else bearing = 'no-truth'

  return {
    truth, bearing, hasHighTruth, hasAccurateNames, hasNoMisnamed,
    hasDoesWhatItSays, hasNoSurprises, hasTruthful, hasNoContradictory,
    hasConsistent, hasNoInconsistent, hasReliable, hasNoUnreliable, hasFaithful,
    misnamedCount, surpriseCount,
  }
}

/**
 * Measure navigation wisdom (guides developers)
 * @example
 * const m = measureGuiding(content)
 * console.log(m.navigation) // 'wise-guide'
 */
export function measureGuiding(content: string): GuidingMeasure {
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

  const hasWellDocumented = hasDocComments(content) && hasExport(content)
  const hasClearExamples = hasInterface(content) && hasReturnType(content)
  const hasIntuitive = hasTypeAlias(content) && hasNamedExport(content)
  const hasHelpful = hasEnum(content) && hasConst(content)
  const hasApproachable = hasStrictEq(content) && hasGenerics(content)
  const hasGuiding = hasAsync(content) && hasPrivate(content)

  score += hasWellDocumented ? 5 : 0
  score += hasClearExamples ? 5 : 0
  score += hasIntuitive ? 5 : 0
  score += hasHelpful ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasGuiding ? 5 : 0

  const wisdom = Math.min(score, 100)
  const undocumentedCount = countMatches(/\bvar\b/, content)
  const counterintuitiveCount = countMatches(/\beval\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoCounterintuitive = counterintuitiveCount === 0
  const hasNoObfuscated = countMatches(/\bany\b/, content) === 0
  const hasNoHostile = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let navigation: GuidingNavigation
  if (wisdom >= 85) navigation = 'wise-guide'
  else if (wisdom >= 70) navigation = 'helpful-signs'
  else if (wisdom >= 55) navigation = 'proper-direction'
  else if (wisdom >= 40) navigation = 'confusing-map'
  else if (wisdom >= 25) navigation = 'misleading-signs'
  else navigation = 'no-guidance'

  return {
    wisdom, navigation, hasHighWisdom, hasWellDocumented, hasClearExamples,
    hasNoUndocumented, hasIntuitive, hasNoCounterintuitive, hasHelpful,
    hasNoObfuscated, hasApproachable, hasNoHostile, hasGuiding,
    undocumentedCount, counterintuitiveCount,
  }
}

/**
 * Measure cardinal virtue (principled design)
 * @example
 * const m = measureVirtueing(content)
 * console.log(m.cardinal) // 'golden-rule'
 */
export function measureVirtueing(content: string): VirtueingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasTypeAlias(content) ? 4 : 0

  const hasCleanArchitecture = hasInterface(content) && hasExport(content)
  const hasBestPractices = hasConst(content) && hasReadonly(content)
  const hasProperPatterns = hasPrivate(content) && hasClass(content)
  const hasStandardCompliant = hasEnum(content) && hasGenerics(content)
  const hasPrincipled = hasReturnType(content) && hasDocComments(content)
  const hasRighteous = hasOptional(content) && hasTypeAlias(content)

  score += hasCleanArchitecture ? 5 : 0
  score += hasBestPractices ? 5 : 0
  score += hasProperPatterns ? 5 : 0
  score += hasStandardCompliant ? 5 : 0
  score += hasPrincipled ? 5 : 0
  score += hasRighteous ? 5 : 0

  const virtue = Math.min(score, 100)
  const antiPatternCount = countMatches(/\bvar\b/, content)
  const hackCount = countMatches(/\beval\b/, content)

  const hasNoAntiPatterns = antiPatternCount === 0
  const hasNoShortcuts = hackCount === 0
  const hasNoHacks = countMatches(/\bany\b/, content) === 0
  const hasNoViolations = !has(/\bdebugger\b/, content)
  const hasNoAdhoc = !has(/\beval\b/, content)
  const hasHighVirtue = virtue >= 70

  let cardinal: VirtueingCardinal
  if (virtue >= 85) cardinal = 'golden-rule'
  else if (virtue >= 70) cardinal = 'virtuous-design'
  else if (virtue >= 55) cardinal = 'proper-principles'
  else if (virtue >= 40) cardinal = 'flexible-morals'
  else if (virtue >= 25) cardinal = 'no-principles'
  else cardinal = 'no-virtue'

  return {
    virtue, cardinal, hasHighVirtue, hasCleanArchitecture, hasNoAntiPatterns,
    hasBestPractices, hasNoShortcuts, hasProperPatterns, hasNoHacks,
    hasStandardCompliant, hasNoViolations, hasPrincipled, hasNoAdhoc, hasRighteous,
    antiPatternCount, hackCount,
  }
}

/**
 * Measure needle conviction (unwavering consistency)
 * @example
 * const m = measureConvicting(content)
 * console.log(m.needle) // 'unwavering-gold'
 */
export function measureConvicting(content: string): ConvictingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasConsistent = hasStrictEq(content) && hasConst(content)
  const hasUniform = hasExport(content) && hasReturnType(content)
  const hasReliable = hasInterface(content) && hasReadonly(content)
  const hasPredictable = hasEnum(content) && hasTypeAlias(content)
  const hasSteadfast = hasOptional(content) && hasNamedExport(content)
  const hasDetermined = hasGenerics(content) && hasDocComments(content)

  score += hasConsistent ? 5 : 0
  score += hasUniform ? 5 : 0
  score += hasReliable ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasSteadfast ? 5 : 0
  score += hasDetermined ? 5 : 0

  const conviction = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const flakyCount = countMatches(/\beval\b/, content)

  const hasNoMixed = mixedCount === 0
  const hasNoInconsistent = flakyCount === 0
  const hasNoFlaky = countMatches(/\bany\b/, content) === 0
  const hasNoVacillating = !has(/\bdebugger\b/, content)
  const hasNoSurprising = !has(/\beval\b/, content)
  const hasHighConviction = conviction >= 70

  let needle: ConvictingNeedle
  if (conviction >= 85) needle = 'unwavering-gold'
  else if (conviction >= 70) needle = 'steady-needle'
  else if (conviction >= 55) needle = 'proper-conviction'
  else if (conviction >= 40) needle = 'wavering-needle'
  else if (conviction >= 25) needle = 'spinning-compass'
  else needle = 'no-conviction'

  return {
    conviction, needle, hasHighConviction, hasConsistent, hasNoMixed,
    hasUniform, hasNoInconsistent, hasReliable, hasNoFlaky, hasPredictable,
    hasNoSurprising, hasSteadfast, hasNoVacillating, hasDetermined,
    mixedCount, flakyCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify needle condition
 * @example
 * classifyNeedleCondition(90) // 'golden-instrument'
 */
export function classifyNeedleCondition(score: number): NeedleCondition {
  if (score >= 85) return 'golden-instrument'
  if (score >= 70) return 'brass-compass'
  if (score >= 55) return 'proper-tool'
  if (score >= 40) return 'rusty-compass'
  if (score >= 25) return 'broken-device'
  return 'paperweight'
}

/**
 * Classify guild type
 * @example
 * classifyGuildType(needles) // 'master-guild'
 */
export function classifyGuildType(needles: GoldenNeedle[]): GuildType {
  if (needles.length === 0) return 'no-guild'
  const avgQs = Math.round(needles.reduce((s, n) => s + n.qualityScore, 0) / needles.length)
  const masterpieceRatio = needles.filter(n => n.condition === 'golden-instrument').length / needles.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'master-guild'
  if (avgQs >= 60) return 'proper-school'
  if (avgQs >= 45) return 'decent-academy'
  if (avgQs >= 30) return 'small-shop'
  if (avgQs >= 15) return 'street-corner'
  return 'no-guild'
}

/**
 * Classify guild condition
 * @example
 * classifyGuildCondition(80) // 'institution-of-truth'
 */
export function classifyGuildCondition(avgQs: number): GuildCondition {
  if (avgQs >= 75) return 'institution-of-truth'
  if (avgQs >= 60) return 'honorable-guild'
  if (avgQs >= 45) return 'decent-school'
  if (avgQs >= 30) return 'shady-shop'
  if (avgQs >= 15) return 'abandoned'
  return 'void'
}

/**
 * Classify scholar grade
 * @example
 * classifyScholarGrade(85) // 'truth-seeker'
 */
export function classifyScholarGrade(avgVirtue: number): ScholarGrade {
  if (avgVirtue >= 80) return 'truth-seeker'
  if (avgVirtue >= 65) return 'golden-scholar'
  if (avgVirtue >= 50) return 'skilled-reader'
  if (avgVirtue >= 35) return 'apprentice'
  if (avgVirtue >= 20) return 'novice'
  return 'deceiver'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(needles, guilds, truth, stats)
 */
export function generateRecommendations(
  needles: GoldenNeedle[],
  guilds: CompassGuild[],
  truth: GoldenTruth,
  stats: GoldenCompassStats,
): string[] {
  const recs: string[] = []
  if (stats.avgMoralClarity < 50) {
    recs.push('Deepen moral clarity with transparent exports, documented behavior, and principled type design')
  }
  if (stats.avgBearingTruth < 50) {
    recs.push('Improve bearing truth with accurate names, truthful exports, and consistent return types')
  }
  if (stats.avgNavigationWisdom < 50) {
    recs.push('Enhance navigation wisdom with documentation, clear examples, and intuitive type names')
  }
  if (stats.avgCardinalVirtue < 50) {
    recs.push('Strengthen cardinal virtue with clean architecture, proper patterns, and principled design')
  }
  if (stats.avgNeedleConviction < 50) {
    recs.push('Bolster needle conviction with consistent patterns, strict equality, and uniform conventions')
  }
  if (stats.paperweightCount > 0) {
    recs.push(`${stats.paperweightCount} file(s) are paperweights — they need complete compass reconstruction`)
  }
  if (truth.overallVirtue < 40) {
    recs.push('Overall virtue is dangerously low — focus on clarity and truth first')
  }
  const allWeak = guilds.every(g => g.guildType === 'no-guild' || g.guildType === 'street-corner')
  if (allWeak && guilds.length > 0) {
    recs.push('All guilds are weak — consider a major principled reconstruction')
  }
  const pwFiles = needles.filter(n => n.condition === 'paperweight').map(n => n.file)
  if (pwFiles.length > 0 && pwFiles.length <= 3) {
    recs.push(`Rebuild these paperweights: ${pwFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The golden compass points true! Every needle gleams with moral clarity, truth, wisdom, virtue, and conviction')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as golden needle
 * @example
 * const needle = analyzeGoldenNeedle(content, 'index.ts')
 * console.log(needle.condition) // 'golden-instrument'
 */
export function analyzeGoldenNeedle(content: string, filePath: string): GoldenNeedle {
  const revealing = measureRevealing(content)
  const aligning = measureAligning(content)
  const guiding = measureGuiding(content)
  const virtueing = measureVirtueing(content)
  const convicting = measureConvicting(content)

  const qualityScore = Math.round(
    revealing.clarity * 0.2 +
    aligning.truth * 0.2 +
    guiding.wisdom * 0.2 +
    virtueing.virtue * 0.2 +
    convicting.conviction * 0.2,
  )

  return {
    file: filePath,
    moralClarity: revealing.clarity,
    bearingTruth: aligning.truth,
    navigationWisdom: guiding.wisdom,
    cardinalVirtue: virtueing.virtue,
    needleConviction: convicting.conviction,
    revealing, aligning, guiding, virtueing, convicting,
    condition: classifyNeedleCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as compass guild
 * @example
 * const guild = analyzeCompassGuild(needles, 'src')
 * console.log(guild.guildType) // 'master-guild'
 */
export function analyzeCompassGuild(needles: GoldenNeedle[], dirPath: string): CompassGuild {
  if (needles.length === 0) {
    return {
      directory: dirPath, needles: [], avgClarity: 0, avgTruth: 0,
      avgConviction: 0, goldenInstrumentCount: 0, paperweightCount: 0,
      guildType: 'no-guild', condition: 'void',
    }
  }

  const avgClarity = Math.round(needles.reduce((s, n) => s + n.moralClarity, 0) / needles.length)
  const avgTruth = Math.round(needles.reduce((s, n) => s + n.bearingTruth, 0) / needles.length)
  const avgConviction = Math.round(needles.reduce((s, n) => s + n.needleConviction, 0) / needles.length)
  const goldenInstrumentCount = needles.filter(n => n.condition === 'golden-instrument').length
  const paperweightCount = needles.filter(n => n.condition === 'paperweight').length
  const avgQs = Math.round(needles.reduce((s, n) => s + n.qualityScore, 0) / needles.length)

  return {
    directory: dirPath, needles, avgClarity, avgTruth, avgConviction,
    goldenInstrumentCount, paperweightCount,
    guildType: classifyGuildType(needles),
    condition: classifyGuildCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete golden compass result
 * @example
 * const result = await buildGoldenCompassResult(files, contents)
 * console.log(result.stats.scholarGrade) // 'truth-seeker'
 */
export async function buildGoldenCompassResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GoldenCompassResult> {
  const needles = files.map((file, i) => analyzeGoldenNeedle(contents[i] ?? '', file))

  const dirMap = new Map<string, GoldenNeedle[]>()
  for (const needle of needles) {
    const dir = path.dirname(needle.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(needle) } else { dirMap.set(dir, [needle]) }
  }

  const guilds = Array.from(dirMap.entries()).map(([dir, dirNeedles]) =>
    analyzeCompassGuild(dirNeedles, dir),
  )

  const avgClarity = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.moralClarity, 0) / needles.length) : 0
  const avgTruth = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.bearingTruth, 0) / needles.length) : 0
  const avgConviction = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.needleConviction, 0) / needles.length) : 0

  const overallVirtue = needles.length > 0
    ? Math.round((avgClarity + avgTruth + avgConviction) / 3) : 0
  const isTruthful = avgClarity >= 60

  const truth: GoldenTruth = { avgClarity, avgTruth, avgConviction, isTruthful, overallVirtue }

  const avgNavigationWisdom = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.navigationWisdom, 0) / needles.length) : 0
  const avgCardinalVirtue = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.cardinalVirtue, 0) / needles.length) : 0
  const avgNeedleConviction = needles.length > 0
    ? Math.round(needles.reduce((s, n) => s + n.needleConviction, 0) / needles.length) : 0

  const bestNeedle = needles.length > 0
    ? needles.reduce((best, n) => n.qualityScore > best.qualityScore ? n : best).file : ''
  const mostClear = needles.length > 0
    ? needles.reduce((best, n) => n.moralClarity > best.moralClarity ? n : best).file : ''
  const mostTruthful = needles.length > 0
    ? needles.reduce((best, n) => n.bearingTruth > best.bearingTruth ? n : best).file : ''
  const wisest = needles.length > 0
    ? needles.reduce((best, n) => n.navigationWisdom > best.navigationWisdom ? n : best).file : ''
  const mostVirtuous = needles.length > 0
    ? needles.reduce((best, n) => n.cardinalVirtue > best.cardinalVirtue ? n : best).file : ''

  const stats: GoldenCompassStats = {
    totalFiles: needles.length,
    totalGuilds: guilds.length,
    avgMoralClarity: avgClarity,
    avgBearingTruth: avgTruth,
    avgNavigationWisdom,
    avgCardinalVirtue,
    avgNeedleConviction,
    goldenInstrumentCount: needles.filter(n => n.condition === 'golden-instrument').length,
    brassCompassCount: needles.filter(n => n.condition === 'brass-compass').length,
    properToolCount: needles.filter(n => n.condition === 'proper-tool').length,
    rustyCompassCount: needles.filter(n => n.condition === 'rusty-compass').length,
    brokenDeviceCount: needles.filter(n => n.condition === 'broken-device').length,
    paperweightCount: needles.filter(n => n.condition === 'paperweight').length,
    hasHighClarityCount: needles.filter(n => n.revealing.hasHighClarity).length,
    hasHighTruthCount: needles.filter(n => n.aligning.hasHighTruth).length,
    hasHighWisdomCount: needles.filter(n => n.guiding.hasHighWisdom).length,
    hasHighVirtueCount: needles.filter(n => n.virtueing.hasHighVirtue).length,
    hasHighConvictionCount: needles.filter(n => n.convicting.hasHighConviction).length,
    overallVirtue,
    scholarGrade: classifyScholarGrade(overallVirtue),
    bestNeedle, mostClear, mostTruthful, wisest, mostVirtuous,
  }

  const recommendations = generateRecommendations(needles, guilds, truth, stats)

  return { needles, guilds, truth, stats, recommendations }
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
