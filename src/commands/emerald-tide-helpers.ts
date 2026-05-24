// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type DepthGrade = 'abyssal-emerald' | 'deep-gem' | 'proper-depth' | 'shallow-water' | 'surface-ripple' | 'no-depth'
export type RhythmTide = 'moon-driven' | 'steady-rhythm' | 'proper-pulse' | 'irregular-beat' | 'arrhythmia' | 'no-rhythm'
export type VitalityGrowth = 'lush-garden' | 'healthy-growth' | 'proper-green' | 'wilting-plant' | 'dormant-seed' | 'no-life'
export type PurityCleanliness = 'crystal-clear' | 'clean-water' | 'proper-purity' | 'murky-tide' | 'polluted-water' | 'no-purity'
export type WisdomSage = 'ancient-mariner' | 'wise-captain' | 'proper-sailor' | 'learning-navigator' | 'lost-swimmer' | 'no-wisdom'
export type WaveCondition = 'emerald-masterpiece' | 'jade-wave' | 'green-tide' | 'murky-current' | 'stagnant-pool' | 'dry-bed'
export type OceanType = 'emerald-sea' | 'jade-ocean' | 'proper-gulf' | 'small-bay' | 'pond' | 'no-ocean'
export type OceanCondition = 'magnificent-ocean' | 'beautiful-sea' | 'decent-bay' | 'murky-waters' | 'dried-up' | 'void'
export type NavigatorGrade = 'master-navigator' | 'sea-captain' | 'skilled-sailor' | 'apprentice' | 'novice' | 'landlubber'

export interface DivingMeasure {
  depth: number
  grade: DepthGrade
  hasHighDepth: boolean
  hasProfound: boolean
  hasValuable: boolean
  hasNoTrivial: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasSubstantive: boolean
  trivialCount: number
  boilerplateCount: number
}

export interface PulsingMeasure {
  rhythm: number
  tide: RhythmTide
  hasHighRhythm: boolean
  hasReliable: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasPredictable: boolean
  hasNoRandom: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasStable: boolean
  erraticCount: number
  wastefulCount: number
}

export interface GrowingMeasure {
  vitality: number
  growth: VitalityGrowth
  hasHighVitality: boolean
  hasAlive: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasGrowing: boolean
  hasNoDecaying: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasVibrant: boolean
  abandonedCount: number
  stagnantCount: number
}

export interface CleansingMeasure {
  purity: number
  cleanliness: PurityCleanliness
  hasHighPurity: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasNoHacky: boolean
  hasNoDuplicates: boolean
  hasTidy: boolean
  hasNoMessy: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasPristine: boolean
  deadCodeCount: number
  hackyCount: number
}

export interface KnowingMeasure {
  wisdom: number
  sage: WisdomSage
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasWellStructured: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasBattleTested: boolean
  reinventedCount: number
  adHocCount: number
}

export interface EmeraldWave {
  file: string
  gemDepth: number
  tidalRhythm: number
  greenVitality: number
  wavePurity: number
  oceanWisdom: number
  diving: DivingMeasure
  pulsing: PulsingMeasure
  growing: GrowingMeasure
  cleansing: CleansingMeasure
  knowing: KnowingMeasure
  condition: WaveCondition
  qualityScore: number
}

export interface EmeraldOcean {
  directory: string
  waves: EmeraldWave[]
  avgDepth: number
  avgRhythm: number
  avgWisdom: number
  emeraldMasterpieceCount: number
  dryBedCount: number
  oceanType: OceanType
  condition: OceanCondition
}

export interface EmeraldSea {
  avgDepth: number
  avgRhythm: number
  avgWisdom: number
  isEmerald: boolean
  overallVitality: number
}

export interface EmeraldTideStats {
  totalFiles: number
  totalOceans: number
  avgGemDepth: number
  avgTidalRhythm: number
  avgGreenVitality: number
  avgWavePurity: number
  avgOceanWisdom: number
  emeraldMasterpieceCount: number
  jadeWaveCount: number
  greenTideCount: number
  murkyCurrentCount: number
  stagnantPoolCount: number
  dryBedCount: number
  hasHighDepthCount: number
  hasHighRhythmCount: number
  hasHighVitalityCount: number
  hasHighPurityCount: number
  hasHighWisdomCount: number
  overallVitality: number
  navigatorGrade: NavigatorGrade
  bestWave: string
  deepest: string
  bestRhythm: string
  mostVital: string
  wisest: string
}

export interface EmeraldTideResult {
  waves: EmeraldWave[]
  oceans: EmeraldOcean[]
  sea: EmeraldSea
  stats: EmeraldTideStats
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
const hasThrow = (c: string) => has(/\bthrow\b/, c)
const hasOptional = (c: string) => has(/\?\s*:/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Grade Helpers ─────────────────────────────────────────────────

function classifyDepthGrade(depth: number): DepthGrade {
  if (depth >= 85) return 'abyssal-emerald'
  if (depth >= 70) return 'deep-gem'
  if (depth >= 55) return 'proper-depth'
  if (depth >= 40) return 'shallow-water'
  if (depth >= 25) return 'surface-ripple'
  return 'no-depth'
}

function classifyRhythmTide(rhythm: number): RhythmTide {
  if (rhythm >= 85) return 'moon-driven'
  if (rhythm >= 70) return 'steady-rhythm'
  if (rhythm >= 55) return 'proper-pulse'
  if (rhythm >= 40) return 'irregular-beat'
  if (rhythm >= 25) return 'arrhythmia'
  return 'no-rhythm'
}

function classifyVitalityGrowth(vitality: number): VitalityGrowth {
  if (vitality >= 85) return 'lush-garden'
  if (vitality >= 70) return 'healthy-growth'
  if (vitality >= 55) return 'proper-green'
  if (vitality >= 40) return 'wilting-plant'
  if (vitality >= 25) return 'dormant-seed'
  return 'no-life'
}

function classifyPurityCleanliness(purity: number): PurityCleanliness {
  if (purity >= 85) return 'crystal-clear'
  if (purity >= 70) return 'clean-water'
  if (purity >= 55) return 'proper-purity'
  if (purity >= 40) return 'murky-tide'
  if (purity >= 25) return 'polluted-water'
  return 'no-purity'
}

function classifyWisdomSage(wisdom: number): WisdomSage {
  if (wisdom >= 85) return 'ancient-mariner'
  if (wisdom >= 70) return 'wise-captain'
  if (wisdom >= 55) return 'proper-sailor'
  if (wisdom >= 40) return 'learning-navigator'
  if (wisdom >= 25) return 'lost-swimmer'
  return 'no-wisdom'
}

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure gem depth (profundity and value)
 * @example
 * const m = measureDiving(content)
 * console.log(m.grade) // 'abyssal-emerald'
 */
export function measureDiving(content: string): DivingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0

  const hasProfound = hasInterface(content) && hasReturnType(content)
  const hasValuable = hasExport(content) && hasEnum(content)
  const hasEssential = hasTypeAlias(content) && hasGenerics(content)
  const hasMeaningful = hasDocComments(content) && hasConst(content)
  const hasDeep = hasNamedExport(content) && hasReadonly(content)
  const hasSubstantive = hasPrivate(content) && hasOptional(content)

  score += hasProfound ? 5 : 0
  score += hasValuable ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasSubstantive ? 5 : 0

  const depth = Math.min(score, 100)
  const trivialCount = countMatches(/\bvar\b/, content)
  const boilerplateCount = countMatches(/\bany\b/, content)

  const hasNoTrivial = trivialCount === 0
  const hasNoFiller = boilerplateCount === 0
  const hasNoBoilerplate = countMatches(/\beval\b/, content) === 0
  const hasNoShallow = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  return {
    depth, grade: classifyDepthGrade(depth), hasHighDepth, hasProfound, hasValuable,
    hasNoTrivial, hasEssential, hasNoFiller, hasMeaningful, hasNoBoilerplate,
    hasDeep, hasNoShallow, hasSubstantive, trivialCount, boilerplateCount,
  }
}

/**
 * Measure tidal rhythm (cyclical reliability)
 * @example
 * const m = measurePulsing(content)
 * console.log(m.tide) // 'moon-driven'
 */
export function measurePulsing(content: string): PulsingMeasure {
  let score = 0
  score += hasAsync(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasEnum(content) ? 4 : 0

  const hasReliable = hasAsync(content) && hasTryCatch(content)
  const hasConsistent = hasReturnType(content) && hasConst(content)
  const hasPredictable = hasThrow(content) && hasExport(content)
  const hasSmooth = hasOptional(content) && hasGenerics(content)
  const hasEfficient = hasInterface(content) && hasReadonly(content)
  const hasStable = hasPrivate(content) && hasEnum(content)

  score += hasReliable ? 5 : 0
  score += hasConsistent ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasStable ? 5 : 0

  const rhythm = Math.min(score, 100)
  const erraticCount = countMatches(/\bvar\b/, content)
  const wastefulCount = countMatches(/\bany\b/, content)

  const hasNoErratic = erraticCount === 0
  const hasNoRandom = countMatches(/\beval\b/, content) === 0
  const hasNoJerky = !has(/\bdebugger\b/, content)
  const hasNoWasteful = wastefulCount === 0
  const hasHighRhythm = rhythm >= 70

  return {
    rhythm, tide: classifyRhythmTide(rhythm), hasHighRhythm, hasReliable, hasConsistent,
    hasNoErratic, hasPredictable, hasNoRandom, hasSmooth, hasNoJerky, hasEfficient,
    hasNoWasteful, hasStable, erraticCount, wastefulCount,
  }
}

/**
 * Measure green vitality (living quality)
 * @example
 * const m = measureGrowing(content)
 * console.log(m.growth) // 'lush-garden'
 */
export function measureGrowing(content: string): GrowingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasAlive = hasExport(content) && hasConst(content)
  const hasMaintained = hasInterface(content) && hasEnum(content)
  const hasEvolving = hasTypeAlias(content) && hasAsync(content)
  const hasGrowing = hasNamedExport(content) && hasDocComments(content)
  const hasFresh = hasReturnType(content) && hasOptional(content)
  const hasVibrant = hasReadonly(content) && hasPrivate(content)

  score += hasAlive ? 5 : 0
  score += hasMaintained ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasGrowing ? 5 : 0
  score += hasFresh ? 5 : 0
  score += hasVibrant ? 5 : 0

  const vitality = Math.min(score, 100)
  const abandonedCount = countMatches(/\bvar\b/, content)
  const stagnantCount = countMatches(/\bany\b/, content)

  const hasNoAbandoned = abandonedCount === 0
  const hasNoStagnant = stagnantCount === 0
  const hasNoDecaying = countMatches(/\beval\b/, content) === 0
  const hasNoStale = !has(/\bdebugger\b/, content)
  const hasHighVitality = vitality >= 70

  return {
    vitality, growth: classifyVitalityGrowth(vitality), hasHighVitality, hasAlive, hasMaintained,
    hasNoAbandoned, hasEvolving, hasNoStagnant, hasGrowing, hasNoDecaying, hasFresh,
    hasNoStale, hasVibrant, abandonedCount, stagnantCount,
  }
}

/**
 * Measure wave purity (cleanliness)
 * @example
 * const m = measureCleansing(content)
 * console.log(m.cleanliness) // 'crystal-clear'
 */
export function measureCleansing(content: string): CleansingMeasure {
  let score = 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasPrivate(content) ? 4 : 0
  score += hasDocComments(content) ? 4 : 0

  const hasClean = hasInterface(content) && hasReadonly(content)
  const hasTidy = hasOptional(content) && hasTypeAlias(content)
  const hasFresh = hasEnum(content) && hasConst(content)
  const hasPolished = hasExport(content) && hasReturnType(content)
  const hasPristine = hasGenerics(content) && hasAsync(content)

  score += hasClean ? 5 : 0
  score += hasTidy ? 5 : 0
  score += hasFresh ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasPristine ? 5 : 0

  const purity = Math.min(score, 100)
  const deadCodeCount = countMatches(/\bvar\b/, content)
  const hackyCount = countMatches(/\beval\b/, content)

  const hasNoDeadCode = deadCodeCount === 0
  const hasNoHacky = hackyCount === 0
  const hasNoDuplicates = countMatches(/\bany\b/, content) === 0
  const hasNoMessy = !has(/\bdebugger\b/, content)
  const hasNoStale = countMatches(/\bconsole\.log\b/, content) === 0
  const hasNoRough = countMatches(/\bTODO\b/, content) === 0
  const hasHighPurity = purity >= 70

  return {
    purity, cleanliness: classifyPurityCleanliness(purity), hasHighPurity, hasClean,
    hasNoDeadCode, hasNoHacky, hasNoDuplicates, hasTidy, hasNoMessy, hasFresh,
    hasNoStale, hasPolished, hasNoRough, hasPristine, deadCodeCount, hackyCount,
  }
}

/**
 * Measure ocean wisdom (accumulated knowledge)
 * @example
 * const m = measureKnowing(content)
 * console.log(m.sage) // 'ancient-mariner'
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasAsync(content) ? 4 : 0

  const hasDocumented = hasDocComments(content) && hasInterface(content)
  const hasPatterned = hasEnum(content) && hasTypeAlias(content)
  const hasWellStructured = hasConst(content) && hasReturnType(content)
  const hasProven = hasExport(content) && hasReadonly(content)
  const hasEstablished = hasGenerics(content) && hasPrivate(content)
  const hasBattleTested = hasOptional(content) && hasAsync(content)

  score += hasDocumented ? 5 : 0
  score += hasPatterned ? 5 : 0
  score += hasWellStructured ? 5 : 0
  score += hasProven ? 5 : 0
  score += hasEstablished ? 5 : 0
  score += hasBattleTested ? 5 : 0

  const wisdom = Math.min(score, 100)
  const reinventedCount = countMatches(/\bvar\b/, content)
  const adHocCount = countMatches(/\bany\b/, content)

  const hasNoReinvented = reinventedCount === 0
  const hasNoAdHoc = adHocCount === 0
  const hasNoExperimental = countMatches(/\beval\b/, content) === 0
  const hasNoNovel = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  return {
    wisdom, sage: classifyWisdomSage(wisdom), hasHighWisdom, hasDocumented, hasPatterned,
    hasNoReinvented, hasWellStructured, hasNoAdHoc, hasProven, hasNoExperimental,
    hasEstablished, hasNoNovel, hasBattleTested, reinventedCount, adHocCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify wave condition
 * @example
 * classifyWaveCondition(90) // 'emerald-masterpiece'
 */
export function classifyWaveCondition(score: number): WaveCondition {
  if (score >= 85) return 'emerald-masterpiece'
  if (score >= 70) return 'jade-wave'
  if (score >= 55) return 'green-tide'
  if (score >= 40) return 'murky-current'
  if (score >= 25) return 'stagnant-pool'
  return 'dry-bed'
}

/**
 * Classify ocean type
 * @example
 * classifyOceanType(waves) // 'emerald-sea'
 */
export function classifyOceanType(waves: EmeraldWave[]): OceanType {
  if (waves.length === 0) return 'no-ocean'
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
  const masterpieceRatio = waves.filter(w => w.condition === 'emerald-masterpiece').length / waves.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'emerald-sea'
  if (avgQs >= 60) return 'jade-ocean'
  if (avgQs >= 45) return 'proper-gulf'
  if (avgQs >= 30) return 'small-bay'
  if (avgQs >= 15) return 'pond'
  return 'no-ocean'
}

/**
 * Classify ocean condition
 * @example
 * classifyOceanCondition(80) // 'magnificent-ocean'
 */
export function classifyOceanCondition(avgQs: number): OceanCondition {
  if (avgQs >= 75) return 'magnificent-ocean'
  if (avgQs >= 60) return 'beautiful-sea'
  if (avgQs >= 45) return 'decent-bay'
  if (avgQs >= 30) return 'murky-waters'
  if (avgQs >= 15) return 'dried-up'
  return 'void'
}

/**
 * Classify navigator grade
 * @example
 * classifyNavigatorGrade(85) // 'master-navigator'
 */
export function classifyNavigatorGrade(avgVitality: number): NavigatorGrade {
  if (avgVitality >= 80) return 'master-navigator'
  if (avgVitality >= 65) return 'sea-captain'
  if (avgVitality >= 50) return 'skilled-sailor'
  if (avgVitality >= 35) return 'apprentice'
  if (avgVitality >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(waves, oceans, sea, stats)
 */
export function generateRecommendations(
  waves: EmeraldWave[],
  oceans: EmeraldOcean[],
  sea: EmeraldSea,
  stats: EmeraldTideStats,
): string[] {
  const recs: string[] = []
  if (stats.avgGemDepth < 50) {
    recs.push('Increase gem depth with documented interfaces, valuable enums, and profound type architecture')
  }
  if (stats.avgTidalRhythm < 50) {
    recs.push('Improve tidal rhythm with reliable async patterns, consistent return types, and predictable error handling')
  }
  if (stats.avgGreenVitality < 50) {
    recs.push('Boost green vitality with living exports, maintained interfaces, and evolving type aliases')
  }
  if (stats.avgWavePurity < 50) {
    recs.push('Enhance wave purity with clean interfaces, tidy optional types, and polished export patterns')
  }
  if (stats.avgOceanWisdom < 50) {
    recs.push('Add ocean wisdom with documented interfaces, patterned enums, and well-structured type systems')
  }
  if (stats.dryBedCount > 0) {
    recs.push(`${stats.dryBedCount} file(s) are dry beds — they need the nourishing flow of the emerald tide`)
  }
  if (sea.overallVitality < 40) {
    recs.push('Overall vitality is dangerously low — focus on gem depth and green vitality first')
  }
  const allWeak = oceans.every(o => o.oceanType === 'no-ocean' || o.oceanType === 'pond')
  if (allWeak && oceans.length > 0) {
    recs.push('All oceans are stagnant ponds — consider a major refactoring of the entire codebase')
  }
  const dryFiles = waves.filter(w => w.condition === 'dry-bed').map(w => w.file)
  if (dryFiles.length > 0 && dryFiles.length <= 3) {
    recs.push(`Bring the emerald tide to these dry beds: ${dryFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The emerald tide flows with magnificent power! Every wave carries gems of wisdom from the ancient depths')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as emerald wave
 * @example
 * const wave = analyzeEmeraldWave(content, 'index.ts')
 * console.log(wave.condition) // 'emerald-masterpiece'
 */
export function analyzeEmeraldWave(content: string, filePath: string): EmeraldWave {
  const diving = measureDiving(content)
  const pulsing = measurePulsing(content)
  const growing = measureGrowing(content)
  const cleansing = measureCleansing(content)
  const knowing = measureKnowing(content)

  const qualityScore = Math.round(
    diving.depth * 0.2 +
    pulsing.rhythm * 0.2 +
    growing.vitality * 0.2 +
    cleansing.purity * 0.2 +
    knowing.wisdom * 0.2,
  )

  return {
    file: filePath,
    gemDepth: diving.depth,
    tidalRhythm: pulsing.rhythm,
    greenVitality: growing.vitality,
    wavePurity: cleansing.purity,
    oceanWisdom: knowing.wisdom,
    diving, pulsing, growing, cleansing, knowing,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as emerald ocean
 * @example
 * const ocean = analyzeEmeraldOcean(waves, 'src')
 * console.log(ocean.oceanType) // 'emerald-sea'
 */
export function analyzeEmeraldOcean(waves: EmeraldWave[], dirPath: string): EmeraldOcean {
  if (waves.length === 0) {
    return {
      directory: dirPath, waves: [], avgDepth: 0, avgRhythm: 0,
      avgWisdom: 0, emeraldMasterpieceCount: 0, dryBedCount: 0,
      oceanType: 'no-ocean', condition: 'void',
    }
  }

  const avgDepth = Math.round(waves.reduce((s, w) => s + w.gemDepth, 0) / waves.length)
  const avgRhythm = Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
  const avgWisdom = Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length)
  const emeraldMasterpieceCount = waves.filter(w => w.condition === 'emerald-masterpiece').length
  const dryBedCount = waves.filter(w => w.condition === 'dry-bed').length
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)

  return {
    directory: dirPath, waves, avgDepth, avgRhythm, avgWisdom,
    emeraldMasterpieceCount, dryBedCount,
    oceanType: classifyOceanType(waves),
    condition: classifyOceanCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete emerald tide result
 * @example
 * const result = await buildEmeraldTideResult(files, contents)
 * console.log(result.stats.navigatorGrade) // 'master-navigator'
 */
export async function buildEmeraldTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldTideResult> {
  const waves = files.map((file, i) => analyzeEmeraldWave(contents[i] ?? '', file))

  const dirMap = new Map<string, EmeraldWave[]>()
  for (const wave of waves) {
    const dir = path.dirname(wave.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(wave) } else { dirMap.set(dir, [wave]) }
  }

  const oceans = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeEmeraldOcean(dirWaves, dir),
  )

  const avgDepth = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.gemDepth, 0) / waves.length) : 0
  const avgRhythm = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length) : 0
  const avgWisdom = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.oceanWisdom, 0) / waves.length) : 0

  const overallVitality = waves.length > 0
    ? Math.round((avgDepth + avgRhythm + avgWisdom) / 3) : 0
  const isEmerald = avgDepth >= 60

  const sea: EmeraldSea = { avgDepth, avgRhythm, avgWisdom, isEmerald, overallVitality }

  const avgVitality = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.greenVitality, 0) / waves.length) : 0
  const avgPurity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.wavePurity, 0) / waves.length) : 0

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file : ''
  const deepest = waves.length > 0
    ? waves.reduce((best, w) => w.gemDepth > best.gemDepth ? w : best).file : ''
  const bestRhythm = waves.length > 0
    ? waves.reduce((best, w) => w.tidalRhythm > best.tidalRhythm ? w : best).file : ''
  const mostVital = waves.length > 0
    ? waves.reduce((best, w) => w.greenVitality > best.greenVitality ? w : best).file : ''
  const wisest = waves.length > 0
    ? waves.reduce((best, w) => w.oceanWisdom > best.oceanWisdom ? w : best).file : ''

  const stats: EmeraldTideStats = {
    totalFiles: waves.length,
    totalOceans: oceans.length,
    avgGemDepth: avgDepth,
    avgTidalRhythm: avgRhythm,
    avgGreenVitality: avgVitality,
    avgWavePurity: avgPurity,
    avgOceanWisdom: avgWisdom,
    emeraldMasterpieceCount: waves.filter(w => w.condition === 'emerald-masterpiece').length,
    jadeWaveCount: waves.filter(w => w.condition === 'jade-wave').length,
    greenTideCount: waves.filter(w => w.condition === 'green-tide').length,
    murkyCurrentCount: waves.filter(w => w.condition === 'murky-current').length,
    stagnantPoolCount: waves.filter(w => w.condition === 'stagnant-pool').length,
    dryBedCount: waves.filter(w => w.condition === 'dry-bed').length,
    hasHighDepthCount: waves.filter(w => w.diving.hasHighDepth).length,
    hasHighRhythmCount: waves.filter(w => w.pulsing.hasHighRhythm).length,
    hasHighVitalityCount: waves.filter(w => w.growing.hasHighVitality).length,
    hasHighPurityCount: waves.filter(w => w.cleansing.hasHighPurity).length,
    hasHighWisdomCount: waves.filter(w => w.knowing.hasHighWisdom).length,
    overallVitality,
    navigatorGrade: classifyNavigatorGrade(overallVitality),
    bestWave, deepest, bestRhythm, mostVital, wisest,
  }

  const recommendations = generateRecommendations(waves, oceans, sea, stats)

  return { waves, oceans, sea, stats, recommendations }
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
