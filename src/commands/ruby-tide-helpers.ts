// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PowerGrade = 'tidal-bore' | 'powerful-surge' | 'proper-current' | 'gentle-flow' | 'stagnant-water' | 'no-current'
export type TideType = 'moon-driven' | 'steady-rhythm' | 'proper-pulse' | 'irregular-beat' | 'arrhythmia' | 'no-rhythm'
export type GemType = 'ruby-revealed' | 'gem-surface' | 'proper-value' | 'hidden-value' | 'buried-treasure' | 'no-gem'
export type WaveType = 'surgical-wave' | 'precise-strike' | 'proper-aim' | 'approximate-hit' | 'scattered-splash' | 'no-precision'
export type DeepType = 'gulf-stream' | 'strong-undercurrent' | 'proper-current' | 'weak-flow' | 'stagnant-depth' | 'no-flow'
export type CurrentCondition = 'ruby-masterpiece' | 'crimson-wave' | 'proper-tide' | 'murky-current' | 'stagnant-pool' | 'dry-bed'
export type BasinType = 'ruby-bay' | 'crimson-harbor' | 'proper-basin' | 'small-cove' | 'ditch' | 'no-basin'
export type BasinCondition = 'magnificent-bay' | 'crimson-shore' | 'decent-coast' | 'murky-bay' | 'dried-up' | 'void'
export type CaptainGrade = 'tide-captain' | 'sea-commander' | 'skilled-sailor' | 'apprentice' | 'novice' | 'landlubber'

export interface SurgingMeasure {
  power: number
  grade: PowerGrade
  hasHighPower: boolean
  hasImpactful: boolean
  hasHighValue: boolean
  hasNoFiller: boolean
  hasEssential: boolean
  hasNoDeadCode: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasPowerful: boolean
  hasNoWeak: boolean
  hasStrong: boolean
  fillerCount: number
  deadCodeCount: number
}

export interface PulsingMeasure {
  rhythm: number
  tide: TideType
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasPredictable: boolean
  hasNoErratic: boolean
  hasPerformant: boolean
  hasNoSluggish: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasReliable: boolean
  erraticCount: number
  sluggishCount: number
}

export interface RevealingMeasure {
  surfacing: number
  gem: GemType
  hasHighSurfacing: boolean
  hasClearPurpose: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasVisibleValue: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasRevealed: boolean
  hasNoConcealed: boolean
  hasExposed: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface StrikingMeasure {
  precision: number
  wave: WaveType
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoVague: boolean
  hasPrecise: boolean
  approximateCount: number
  sloppyCount: number
}

export interface FlowingMeasure {
  current: number
  deep: DeepType
  hasHighCurrent: boolean
  hasEfficientFlow: boolean
  hasNoBottlenecks: boolean
  hasStreamlined: boolean
  hasNoCircuits: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasDirectPaths: boolean
  hasNoIndirection: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  bottleneckCount: number
  tangledCount: number
}

export interface RubyCurrent {
  file: string
  crimsonPower: number
  tidalRhythm: number
  gemSurfacing: number
  wavePrecision: number
  deepCurrent: number
  surging: SurgingMeasure
  pulsing: PulsingMeasure
  revealing: RevealingMeasure
  striking: StrikingMeasure
  flowing: FlowingMeasure
  condition: CurrentCondition
  qualityScore: number
}

export interface TideBasin {
  directory: string
  currents: RubyCurrent[]
  avgPower: number
  avgRhythm: number
  avgCurrent: number
  rubyMasterpieceCount: number
  dryBedCount: number
  basinType: BasinType
  condition: BasinCondition
}

export interface RubySea {
  avgPower: number
  avgRhythm: number
  avgCurrent: number
  isCrimson: boolean
  overallSurge: number
}

export interface RubyTideStats {
  totalFiles: number
  totalBasins: number
  avgCrimsonPower: number
  avgTidalRhythm: number
  avgGemSurfacing: number
  avgWavePrecision: number
  avgDeepCurrent: number
  rubyMasterpieceCount: number
  crimsonWaveCount: number
  properTideCount: number
  murkyCurrentCount: number
  stagnantPoolCount: number
  dryBedCount: number
  hasHighPowerCount: number
  hasHighRhythmCount: number
  hasHighSurfacingCount: number
  hasHighPrecisionCount: number
  hasHighCurrentCount: number
  overallSurge: number
  captainGrade: CaptainGrade
  bestCurrent: string
  mostPowerful: string
  bestRhythm: string
  mostRevealing: string
  deepest: string
}

export interface RubyTideResult {
  currents: RubyCurrent[]
  basins: TideBasin[]
  sea: RubySea
  stats: RubyTideStats
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
const hasMapFunction = (c: string) => has(/\b(?:map|filter|reduce|forEach)\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure crimson power (impactful execution)
 * @example
 * const m = measureSurging(content)
 * console.log(m.grade) // 'tidal-bore'
 */
export function measureSurging(content: string): SurgingMeasure {
  let score = 0
  score += hasConst(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasInterface(content) ? 4 : 0
  score += hasOptional(content) ? 4 : 0
  score += hasTypeAlias(content) ? 4 : 0

  const hasImpactful = hasConst(content) && hasStrictEq(content)
  const hasHighValue = hasReturnType(content) && hasExport(content)
  const hasEssential = hasAsync(content) && hasMapFunction(content)
  const hasMeaningful = hasReadonly(content) && hasGenerics(content)
  const hasPowerful = hasEnum(content) && hasInterface(content)
  const hasStrong = hasOptional(content) && hasTypeAlias(content)

  score += hasImpactful ? 5 : 0
  score += hasHighValue ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasPowerful ? 5 : 0
  score += hasStrong ? 5 : 0

  const power = Math.min(score, 100)
  const fillerCount = countMatches(/\bvar\b/, content)
  const deadCodeCount = countMatches(/\beval\b/, content)

  const hasNoFiller = fillerCount === 0
  const hasNoDeadCode = deadCodeCount === 0
  const hasNoWeak = countMatches(/\bany\b/, content) === 0
  const hasNoBoilerplate = !has(/\bdebugger\b/, content)
  const hasHighPower = power >= 70

  let grade: PowerGrade
  if (power >= 85) grade = 'tidal-bore'
  else if (power >= 70) grade = 'powerful-surge'
  else if (power >= 55) grade = 'proper-current'
  else if (power >= 40) grade = 'gentle-flow'
  else if (power >= 25) grade = 'stagnant-water'
  else grade = 'no-current'

  return {
    power, grade, hasHighPower, hasImpactful, hasHighValue, hasNoFiller,
    hasEssential, hasNoDeadCode, hasMeaningful, hasNoBoilerplate, hasPowerful,
    hasNoWeak, hasStrong, fillerCount, deadCodeCount,
  }
}

/**
 * Measure tidal rhythm (cyclical performance)
 * @example
 * const m = measurePulsing(content)
 * console.log(m.tide) // 'moon-driven'
 */
export function measurePulsing(content: string): PulsingMeasure {
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

  const hasConsistent = hasStrictEq(content) && hasReturnType(content)
  const hasPredictable = hasInterface(content) && hasExport(content)
  const hasPerformant = hasTryCatch(content) && hasConst(content)
  const hasSmooth = hasReadonly(content) && hasOptional(content)
  const hasEfficient = hasEnum(content) && hasTypeAlias(content)
  const hasReliable = hasGenerics(content) && hasPrivate(content)

  score += hasConsistent ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasPerformant ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasReliable ? 5 : 0

  const rhythm = Math.min(score, 100)
  const erraticCount = countMatches(/\bvar\b/, content)
  const sluggishCount = countMatches(/\bany\b/, content)

  const hasNoErratic = erraticCount === 0
  const hasNoSluggish = sluggishCount === 0
  const hasNoJerky = countMatches(/\beval\b/, content) === 0
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighRhythm = rhythm >= 70

  let tide: TideType
  if (rhythm >= 85) tide = 'moon-driven'
  else if (rhythm >= 70) tide = 'steady-rhythm'
  else if (rhythm >= 55) tide = 'proper-pulse'
  else if (rhythm >= 40) tide = 'irregular-beat'
  else if (rhythm >= 25) tide = 'arrhythmia'
  else tide = 'no-rhythm'

  return {
    rhythm, tide, hasHighRhythm, hasConsistent, hasPredictable, hasNoErratic,
    hasPerformant, hasNoSluggish, hasSmooth, hasNoJerky, hasEfficient,
    hasNoWasteful, hasReliable, erraticCount, sluggishCount,
  }
}

/**
 * Measure gem surfacing (value revelation)
 * @example
 * const m = measureRevealing(content)
 * console.log(m.gem) // 'ruby-revealed'
 */
export function measureRevealing(content: string): RevealingMeasure {
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

  const hasClearPurpose = hasExport(content) && hasInterface(content)
  const hasSelfDocumenting = hasReturnType(content) && hasDocComments(content)
  const hasVisibleValue = hasDocComments(content) && hasNamedExport(content)
  const hasTransparent = hasEnum(content) && hasTypeAlias(content)
  const hasRevealed = hasAsync(content) && hasConst(content)
  const hasExposed = hasOptional(content) && hasReadonly(content)

  score += hasClearPurpose ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasVisibleValue ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasRevealed ? 5 : 0
  score += hasExposed ? 5 : 0

  const surfacing = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const obfuscatedCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoHidden = countMatches(/\beval\b/, content) === 0
  const hasNoConcealed = !has(/\bdebugger\b/, content)
  const hasHighSurfacing = surfacing >= 70

  let gem: GemType
  if (surfacing >= 85) gem = 'ruby-revealed'
  else if (surfacing >= 70) gem = 'gem-surface'
  else if (surfacing >= 55) gem = 'proper-value'
  else if (surfacing >= 40) gem = 'hidden-value'
  else if (surfacing >= 25) gem = 'buried-treasure'
  else gem = 'no-gem'

  return {
    surfacing, gem, hasHighSurfacing, hasClearPurpose, hasSelfDocumenting,
    hasNoCryptic, hasVisibleValue, hasNoObfuscated, hasTransparent, hasNoHidden,
    hasRevealed, hasNoConcealed, hasExposed, crypticCount, obfuscatedCount,
  }
}

/**
 * Measure wave precision (operation accuracy)
 * @example
 * const m = measureStriking(content)
 * console.log(m.wave) // 'surgical-wave'
 */
export function measureStriking(content: string): StrikingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasDocComments(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasExact = hasStrictEq(content) && hasReturnType(content)
  const hasAccurate = hasInterface(content) && hasExport(content)
  const hasCorrect = hasReadonly(content) && hasOptional(content)
  const hasSharp = hasEnum(content) && hasTypeAlias(content)
  const hasDefined = hasConst(content) && hasGenerics(content)
  const hasPrecise = hasDocComments(content) && hasPrivate(content)

  score += hasExact ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasCorrect ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasDefined ? 5 : 0
  score += hasPrecise ? 5 : 0

  const precision = Math.min(score, 100)
  const approximateCount = countMatches(/\bvar\b/, content)
  const sloppyCount = countMatches(/\bany\b/, content)

  const hasNoApproximate = approximateCount === 0
  const hasNoAlmostRight = sloppyCount === 0
  const hasNoSloppy = countMatches(/\beval\b/, content) === 0
  const hasNoVague = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let wave: WaveType
  if (precision >= 85) wave = 'surgical-wave'
  else if (precision >= 70) wave = 'precise-strike'
  else if (precision >= 55) wave = 'proper-aim'
  else if (precision >= 40) wave = 'approximate-hit'
  else if (precision >= 25) wave = 'scattered-splash'
  else wave = 'no-precision'

  return {
    precision, wave, hasHighPrecision, hasExact, hasAccurate, hasNoApproximate,
    hasCorrect, hasNoAlmostRight, hasSharp, hasNoSloppy, hasDefined, hasNoVague,
    hasPrecise, approximateCount, sloppyCount,
  }
}

/**
 * Measure deep current (underlying data flow)
 * @example
 * const m = measureFlowing(content)
 * console.log(m.deep) // 'gulf-stream'
 */
export function measureFlowing(content: string): FlowingMeasure {
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

  const hasEfficientFlow = hasTryCatch(content) && hasInterface(content)
  const hasStreamlined = hasExport(content) && hasConst(content)
  const hasCleanPipelines = hasTryCatch(content) && hasStrictEq(content)
  const hasDirectPaths = hasReadonly(content) && hasOptional(content)
  const hasOptimized = hasEnum(content) && hasTypeAlias(content)
  const hasNoWastefulFlow = hasGenerics(content) && hasPrivate(content)

  score += hasEfficientFlow ? 5 : 0
  score += hasStreamlined ? 5 : 0
  score += hasCleanPipelines ? 5 : 0
  score += hasDirectPaths ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasNoWastefulFlow ? 5 : 0

  const current = Math.min(score, 100)
  const bottleneckCount = countMatches(/\bvar\b/, content)
  const tangledCount = countMatches(/\bany\b/, content)

  const hasNoBottlenecks = bottleneckCount === 0
  const hasNoCircuits = tangledCount === 0
  const hasNoTangled = countMatches(/\beval\b/, content) === 0
  const hasNoIndirection = !has(/\bdebugger\b/, content)
  const hasHighCurrent = current >= 70

  let deep: DeepType
  if (current >= 85) deep = 'gulf-stream'
  else if (current >= 70) deep = 'strong-undercurrent'
  else if (current >= 55) deep = 'proper-current'
  else if (current >= 40) deep = 'weak-flow'
  else if (current >= 25) deep = 'stagnant-depth'
  else deep = 'no-flow'

  return {
    current, deep, hasHighCurrent, hasEfficientFlow, hasNoBottlenecks,
    hasStreamlined, hasNoCircuits, hasCleanPipelines, hasNoTangled,
    hasDirectPaths, hasNoIndirection, hasOptimized, hasNoWasteful: hasNoWastefulFlow,
    bottleneckCount, tangledCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify current condition
 * @example
 * classifyCurrentCondition(90) // 'ruby-masterpiece'
 */
export function classifyCurrentCondition(score: number): CurrentCondition {
  if (score >= 85) return 'ruby-masterpiece'
  if (score >= 70) return 'crimson-wave'
  if (score >= 55) return 'proper-tide'
  if (score >= 40) return 'murky-current'
  if (score >= 25) return 'stagnant-pool'
  return 'dry-bed'
}

/**
 * Classify basin type
 * @example
 * classifyBasinType(currents) // 'ruby-bay'
 */
export function classifyBasinType(currents: RubyCurrent[]): BasinType {
  if (currents.length === 0) return 'no-basin'
  const avgQs = Math.round(currents.reduce((s, c) => s + c.qualityScore, 0) / currents.length)
  const masterpieceRatio = currents.filter(c => c.condition === 'ruby-masterpiece').length / currents.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'ruby-bay'
  if (avgQs >= 60) return 'crimson-harbor'
  if (avgQs >= 45) return 'proper-basin'
  if (avgQs >= 30) return 'small-cove'
  if (avgQs >= 15) return 'ditch'
  return 'no-basin'
}

/**
 * Classify basin condition
 * @example
 * classifyBasinCondition(80) // 'magnificent-bay'
 */
export function classifyBasinCondition(avgQs: number): BasinCondition {
  if (avgQs >= 75) return 'magnificent-bay'
  if (avgQs >= 60) return 'crimson-shore'
  if (avgQs >= 45) return 'decent-coast'
  if (avgQs >= 30) return 'murky-bay'
  if (avgQs >= 15) return 'dried-up'
  return 'void'
}

/**
 * Classify captain grade
 * @example
 * classifyCaptainGrade(85) // 'tide-captain'
 */
export function classifyCaptainGrade(avgSurge: number): CaptainGrade {
  if (avgSurge >= 80) return 'tide-captain'
  if (avgSurge >= 65) return 'sea-commander'
  if (avgSurge >= 50) return 'skilled-sailor'
  if (avgSurge >= 35) return 'apprentice'
  if (avgSurge >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(currents, basins, sea, stats)
 */
export function generateRecommendations(
  currents: RubyCurrent[],
  basins: TideBasin[],
  sea: RubySea,
  stats: RubyTideStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCrimsonPower < 50) {
    recs.push('Boost crimson power with impactful const patterns, strict equality, and high-value return types')
  }
  if (stats.avgTidalRhythm < 50) {
    recs.push('Steady tidal rhythm with consistent type safety, predictable interfaces, and performant error handling')
  }
  if (stats.avgGemSurfacing < 50) {
    recs.push('Surface hidden gems with clear exports, documented interfaces, and self-documenting named exports')
  }
  if (stats.avgWavePrecision < 50) {
    recs.push('Sharpen wave precision with exact types, accurate readonly properties, and precisely defined generics')
  }
  if (stats.avgDeepCurrent < 50) {
    recs.push('Deepen currents with streamlined try/catch flows, clean pipelines, and optimized data paths')
  }
  if (stats.dryBedCount > 0) {
    recs.push(`${stats.dryBedCount} file(s) are dry beds — they need a complete flood of meaningful code`)
  }
  if (sea.overallSurge < 40) {
    recs.push('Overall surge is dangerously low — focus on crimson power and tidal rhythm first')
  }
  const allWeak = basins.every(b => b.basinType === 'no-basin' || b.basinType === 'ditch')
  if (allWeak && basins.length > 0) {
    recs.push('All tide basins are weak — consider a major refactoring of the entire codebase')
  }
  const dryFiles = currents.filter(c => c.condition === 'dry-bed').map(c => c.file)
  if (dryFiles.length > 0 && dryFiles.length <= 3) {
    recs.push(`Flood these dry beds: ${dryFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The ruby tide surges with perfection! Every current radiates power, rhythm, value, precision, and depth')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ruby current
 * @example
 * const current = analyzeRubyCurrent(content, 'index.ts')
 * console.log(current.condition) // 'ruby-masterpiece'
 */
export function analyzeRubyCurrent(content: string, filePath: string): RubyCurrent {
  const surging = measureSurging(content)
  const pulsing = measurePulsing(content)
  const revealing = measureRevealing(content)
  const striking = measureStriking(content)
  const flowing = measureFlowing(content)

  const qualityScore = Math.round(
    surging.power * 0.2 +
    pulsing.rhythm * 0.2 +
    revealing.surfacing * 0.2 +
    striking.precision * 0.2 +
    flowing.current * 0.2,
  )

  return {
    file: filePath,
    crimsonPower: surging.power,
    tidalRhythm: pulsing.rhythm,
    gemSurfacing: revealing.surfacing,
    wavePrecision: striking.precision,
    deepCurrent: flowing.current,
    surging, pulsing, revealing, striking, flowing,
    condition: classifyCurrentCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as tide basin
 * @example
 * const basin = analyzeTideBasin(currents, 'src')
 * console.log(basin.basinType) // 'ruby-bay'
 */
export function analyzeTideBasin(currents: RubyCurrent[], dirPath: string): TideBasin {
  if (currents.length === 0) {
    return {
      directory: dirPath, currents: [], avgPower: 0, avgRhythm: 0,
      avgCurrent: 0, rubyMasterpieceCount: 0, dryBedCount: 0,
      basinType: 'no-basin', condition: 'void',
    }
  }

  const avgPower = Math.round(currents.reduce((s, c) => s + c.crimsonPower, 0) / currents.length)
  const avgRhythm = Math.round(currents.reduce((s, c) => s + c.tidalRhythm, 0) / currents.length)
  const avgCurrent = Math.round(currents.reduce((s, c) => s + c.deepCurrent, 0) / currents.length)
  const rubyMasterpieceCount = currents.filter(c => c.condition === 'ruby-masterpiece').length
  const dryBedCount = currents.filter(c => c.condition === 'dry-bed').length
  const avgQs = Math.round(currents.reduce((s, c) => s + c.qualityScore, 0) / currents.length)

  return {
    directory: dirPath, currents, avgPower, avgRhythm, avgCurrent,
    rubyMasterpieceCount, dryBedCount,
    basinType: classifyBasinType(currents),
    condition: classifyBasinCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete ruby tide result
 * @example
 * const result = await buildRubyTideResult(files, contents)
 * console.log(result.stats.captainGrade) // 'tide-captain'
 */
export async function buildRubyTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyTideResult> {
  const currents = files.map((file, i) => analyzeRubyCurrent(contents[i] ?? '', file))

  const dirMap = new Map<string, RubyCurrent[]>()
  for (const cur of currents) {
    const dir = path.dirname(cur.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(cur) } else { dirMap.set(dir, [cur]) }
  }

  const basins = Array.from(dirMap.entries()).map(([dir, dirCurrents]) =>
    analyzeTideBasin(dirCurrents, dir),
  )

  const avgPower = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.crimsonPower, 0) / currents.length) : 0
  const avgRhythm = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.tidalRhythm, 0) / currents.length) : 0
  const avgCurrent = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.deepCurrent, 0) / currents.length) : 0

  const overallSurge = currents.length > 0
    ? Math.round((avgPower + avgRhythm + avgCurrent) / 3) : 0
  const isCrimson = avgPower >= 60

  const sea: RubySea = { avgPower, avgRhythm, avgCurrent, isCrimson, overallSurge }

  const avgGemSurfacing = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.gemSurfacing, 0) / currents.length) : 0
  const avgWavePrecision = currents.length > 0
    ? Math.round(currents.reduce((s, c) => s + c.wavePrecision, 0) / currents.length) : 0
  const avgDeepCurrent = avgCurrent

  const bestCurrent = currents.length > 0
    ? currents.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const mostPowerful = currents.length > 0
    ? currents.reduce((best, c) => c.crimsonPower > best.crimsonPower ? c : best).file : ''
  const bestRhythm = currents.length > 0
    ? currents.reduce((best, c) => c.tidalRhythm > best.tidalRhythm ? c : best).file : ''
  const mostRevealing = currents.length > 0
    ? currents.reduce((best, c) => c.gemSurfacing > best.gemSurfacing ? c : best).file : ''
  const deepest = currents.length > 0
    ? currents.reduce((best, c) => c.deepCurrent > best.deepCurrent ? c : best).file : ''

  const stats: RubyTideStats = {
    totalFiles: currents.length,
    totalBasins: basins.length,
    avgCrimsonPower: avgPower,
    avgTidalRhythm: avgRhythm,
    avgGemSurfacing,
    avgWavePrecision,
    avgDeepCurrent,
    rubyMasterpieceCount: currents.filter(c => c.condition === 'ruby-masterpiece').length,
    crimsonWaveCount: currents.filter(c => c.condition === 'crimson-wave').length,
    properTideCount: currents.filter(c => c.condition === 'proper-tide').length,
    murkyCurrentCount: currents.filter(c => c.condition === 'murky-current').length,
    stagnantPoolCount: currents.filter(c => c.condition === 'stagnant-pool').length,
    dryBedCount: currents.filter(c => c.condition === 'dry-bed').length,
    hasHighPowerCount: currents.filter(c => c.surging.hasHighPower).length,
    hasHighRhythmCount: currents.filter(c => c.pulsing.hasHighRhythm).length,
    hasHighSurfacingCount: currents.filter(c => c.revealing.hasHighSurfacing).length,
    hasHighPrecisionCount: currents.filter(c => c.striking.hasHighPrecision).length,
    hasHighCurrentCount: currents.filter(c => c.flowing.hasHighCurrent).length,
    overallSurge,
    captainGrade: classifyCaptainGrade(overallSurge),
    bestCurrent, mostPowerful, bestRhythm, mostRevealing, deepest,
  }

  const recommendations = generateRecommendations(currents, basins, sea, stats)

  return { currents, basins, sea, stats, recommendations }
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
