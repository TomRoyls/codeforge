// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type DepthGrade = 'abyssal-power' | 'deep-current' | 'proper-depth' | 'shallow-water' | 'surface-ripple' | 'no-depth'
export type TideGrade = 'ocean-rhythm' | 'steady-tide' | 'proper-pulse' | 'irregular-swell' | 'chaotic-wave' | 'still-water'
export type DarkGrade = 'obsidian-mirror' | 'glass-clarity' | 'proper-reflection' | 'foggy-depth' | 'murky-water' | 'opaque'
export type VolcanicGrade = 'forged-in-fire' | 'properly-cooled' | 'decent-formation' | 'premature-cooling' | 'unformed-lava' | 'no-origin'
export type AbyssGrade = 'ancient-depth' | 'deep-understanding' | 'proper-knowledge' | 'surface-awareness' | 'shallow-ignorance' | 'no-knowledge'
export type WaveCondition = 'obsidian-masterpiece' | 'dark-gem' | 'proper-glass' | 'cloudy-obsidian' | 'cracked-glass' | 'gravel'
export type PoolType = 'volcanic-lagoon' | 'dark-tide-pool' | 'proper-pool' | 'shallow-puddle' | 'dry-basin' | 'no-pool'
export type PoolCondition = 'volcanic-paradise' | 'dark-beauty' | 'decent-pool' | 'murky-puddle' | 'dry-crack' | 'void'
export type DiverGrade = 'abyssal-diver' | 'deep-sea-explorer' | 'skilled-swimmer' | 'apprentice' | 'novice' | 'landlubber'

export interface DeepeningMeasure {
  power: number
  grade: DepthGrade
  hasHighPower: boolean
  hasProfound: boolean
  hasImpactful: boolean
  hasNoTrivial: boolean
  hasSubstantive: boolean
  hasNoFiller: boolean
  hasMeaningful: boolean
  hasNoBoilerplate: boolean
  hasEssential: boolean
  hasNoDeadCode: boolean
  hasPowerful: boolean
  trivialCount: number
  fillerCount: number
}

export interface PulsingMeasure {
  rhythm: number
  tide: TideGrade
  hasHighRhythm: boolean
  hasConsistent: boolean
  hasPerformant: boolean
  hasNoSluggish: boolean
  hasPredictable: boolean
  hasNoErratic: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasTimely: boolean
  sluggishCount: number
  erraticCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dark: DarkGrade
  hasHighClarity: boolean
  hasReadableEvenComplex: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasUnderstandable: boolean
  hasNoImpenetrable: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasClear: boolean
  obfuscatedCount: number
  crypticCount: number
}

export interface ForgingMeasure {
  origin: number
  volcanic: VolcanicGrade
  hasHighOrigin: boolean
  hasWellDesigned: boolean
  hasPlanned: boolean
  hasNoHacked: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasDisciplined: boolean
  hasNoAdhoc: boolean
  hasMethodical: boolean
  hasNoRandom: boolean
  hasIntentional: boolean
  hackedCount: number
  chaoticCount: number
}

export interface KnowingMeasure {
  knowledge: number
  abyss: AbyssGrade
  hasHighKnowledge: boolean
  hasDomainExpertise: boolean
  hasBusinessLogic: boolean
  hasNoMagicNumbers: boolean
  hasWellNamed: boolean
  hasNoCryptic: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasContextual: boolean
  hasNoContextFree: boolean
  hasInformed: boolean
  magicNumberCount: number
  undocumentedCount: number
}

export interface ObsidianWave {
  file: string
  depthPower: number
  tidalRhythm: number
  darkClarity: number
  volcanicOrigin: number
  abyssKnowledge: number
  deepening: DeepeningMeasure
  pulsing: PulsingMeasure
  illuminating: IlluminatingMeasure
  forging: ForgingMeasure
  knowing: KnowingMeasure
  condition: WaveCondition
  qualityScore: number
}

export interface TidePool {
  directory: string
  waves: ObsidianWave[]
  avgPower: number
  avgRhythm: number
  avgKnowledge: number
  obsidianMasterpieceCount: number
  gravelCount: number
  poolType: PoolType
  condition: PoolCondition
}

export interface ObsidianOcean {
  avgPower: number
  avgRhythm: number
  avgKnowledge: number
  isAbyssal: boolean
  overallDepth: number
}

export interface ObsidianTideStats {
  totalFiles: number
  totalPools: number
  avgDepthPower: number
  avgTidalRhythm: number
  avgDarkClarity: number
  avgVolcanicOrigin: number
  avgAbyssKnowledge: number
  obsidianMasterpieceCount: number
  darkGemCount: number
  properGlassCount: number
  cloudyObsidianCount: number
  crackedGlassCount: number
  gravelCount: number
  hasHighPowerCount: number
  hasHighRhythmCount: number
  hasHighClarityCount: number
  hasHighOriginCount: number
  hasHighKnowledgeCount: number
  overallDepth: number
  diverGrade: DiverGrade
  bestWave: string
  mostPowerful: string
  bestRhythm: string
  clearest: string
  mostKnowledgeable: string
}

export interface ObsidianTideResult {
  waves: ObsidianWave[]
  pools: TidePool[]
  ocean: ObsidianOcean
  stats: ObsidianTideStats
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
const hasPrivate = (c: string) => has(/\bprivate\b/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure depth power (profoundness)
 * @example
 * const m = measureDeepening(content)
 * console.log(m.grade) // 'abyssal-power'
 */
export function measureDeepening(content: string): DeepeningMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0

  const hasProfound = hasInterface(content) && hasReturnType(content)
  const hasImpactful = hasGenerics(content) && hasExport(content)
  const hasSubstantive = hasAsync(content) && hasMapFunction(content)
  const hasMeaningful = hasConst(content) && hasTypeAlias(content)
  const hasEssential = hasReadonly(content) && hasEnum(content)
  const hasPowerful = hasUnionType(content) && hasThrow(content)

  score += hasProfound ? 5 : 0
  score += hasImpactful ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasPowerful ? 5 : 0

  const power = Math.min(score, 100)
  const trivialCount = countMatches(/\bvar\b/, content)
  const fillerCount = countMatches(/\bany\b/, content)

  const hasNoTrivial = trivialCount === 0
  const hasNoFiller = fillerCount === 0
  const hasNoDeadCode = !has(/\beval\b/, content)
  const hasNoBoilerplate = !has(/\bdebugger\b/, content)
  const hasHighPower = power >= 70

  let grade: DepthGrade
  if (power >= 85) grade = 'abyssal-power'
  else if (power >= 70) grade = 'deep-current'
  else if (power >= 55) grade = 'proper-depth'
  else if (power >= 40) grade = 'shallow-water'
  else if (power >= 25) grade = 'surface-ripple'
  else grade = 'no-depth'

  return {
    power, grade, hasHighPower, hasProfound, hasImpactful, hasNoTrivial,
    hasSubstantive, hasNoFiller, hasMeaningful, hasNoBoilerplate,
    hasEssential, hasNoDeadCode, hasPowerful, trivialCount, fillerCount,
  }
}

/**
 * Measure tidal rhythm (cyclical performance)
 * @example
 * const m = measurePulsing(content)
 * console.log(m.tide) // 'ocean-rhythm'
 */
export function measurePulsing(content: string): PulsingMeasure {
  let score = 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasArrowFunction(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0

  const hasConsistent = hasMapFunction(content) && hasArrowFunction(content)
  const hasPerformant = hasConst(content) && hasReturnType(content)
  const hasPredictable = hasExport(content) && hasImport(content)
  const hasSmooth = hasAsync(content) && hasOptional(content)
  const hasEfficient = hasDefaultParam(content) && hasStrictEq(content)
  const hasTimely = hasInterface(content) && hasGenerics(content)

  score += hasConsistent ? 5 : 0
  score += hasPerformant ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasTimely ? 5 : 0

  const rhythm = Math.min(score, 100)
  const sluggishCount = countMatches(/\bvar\b/, content)
  const erraticCount = countMatches(/\bany\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoErratic = erraticCount === 0
  const hasNoJerky = !has(/\beval\b/, content)
  const hasNoWasteful = !has(/\bdebugger\b/, content)
  const hasHighRhythm = rhythm >= 70

  let tide: TideGrade
  if (rhythm >= 85) tide = 'ocean-rhythm'
  else if (rhythm >= 70) tide = 'steady-tide'
  else if (rhythm >= 55) tide = 'proper-pulse'
  else if (rhythm >= 40) tide = 'irregular-swell'
  else if (rhythm >= 25) tide = 'chaotic-wave'
  else tide = 'still-water'

  return {
    rhythm, tide, hasHighRhythm, hasConsistent, hasPerformant, hasNoSluggish,
    hasPredictable, hasNoErratic, hasSmooth, hasNoJerky, hasEfficient,
    hasNoWasteful, hasTimely, sluggishCount, erraticCount,
  }
}

/**
 * Measure dark clarity (clarity in complexity)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.dark) // 'obsidian-mirror'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0

  const hasReadableEvenComplex = hasDocComments(content) && hasExport(content)
  const hasTransparent = hasReturnType(content) && hasImport(content)
  const hasSelfDocumenting = hasInterface(content) && hasNamedExport(content)
  const hasUnderstandable = hasTypeAlias(content) && hasGenerics(content)
  const hasVisible = hasConst(content) && hasStrictEq(content)
  const hasClear = hasEnum(content) && hasAsync(content)

  score += hasReadableEvenComplex ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasUnderstandable ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasClear ? 5 : 0

  const clarity = Math.min(score, 100)
  const obfuscatedCount = countMatches(/\bvar\b/, content)
  const crypticCount = countMatches(/\bany\b/, content)

  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoImpenetrable = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let dark: DarkGrade
  if (clarity >= 85) dark = 'obsidian-mirror'
  else if (clarity >= 70) dark = 'glass-clarity'
  else if (clarity >= 55) dark = 'proper-reflection'
  else if (clarity >= 40) dark = 'foggy-depth'
  else if (clarity >= 25) dark = 'murky-water'
  else dark = 'opaque'

  return {
    clarity, dark, hasHighClarity, hasReadableEvenComplex, hasTransparent,
    hasNoObfuscated, hasSelfDocumenting, hasNoCryptic, hasUnderstandable,
    hasNoImpenetrable, hasVisible, hasNoHidden, hasClear, obfuscatedCount, crypticCount,
  }
}

/**
 * Measure volcanic origin (creation discipline)
 * @example
 * const m = measureForging(content)
 * console.log(m.volcanic) // 'forged-in-fire'
 */
export function measureForging(content: string): ForgingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasEnum(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasWellDesigned = hasInterface(content) && hasTypeAlias(content)
  const hasPlanned = hasEnum(content) && hasExport(content)
  const hasStructured = hasNamedExport(content) && hasReadonly(content)
  const hasDisciplined = hasReturnType(content) && hasStrictEq(content)
  const hasMethodical = hasGenerics(content) && hasOptional(content)
  const hasIntentional = hasDocComments(content) && hasPrivate(content)

  score += hasWellDesigned ? 5 : 0
  score += hasPlanned ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasDisciplined ? 5 : 0
  score += hasMethodical ? 5 : 0
  score += hasIntentional ? 5 : 0

  const origin = Math.min(score, 100)
  const hackedCount = countMatches(/\bvar\b/, content)
  const chaoticCount = countMatches(/\bany\b/, content)

  const hasNoHacked = hackedCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoAdhoc = !has(/\beval\b/, content)
  const hasNoRandom = !has(/\bdebugger\b/, content)
  const hasHighOrigin = origin >= 70

  let volcanic: VolcanicGrade
  if (origin >= 85) volcanic = 'forged-in-fire'
  else if (origin >= 70) volcanic = 'properly-cooled'
  else if (origin >= 55) volcanic = 'decent-formation'
  else if (origin >= 40) volcanic = 'premature-cooling'
  else if (origin >= 25) volcanic = 'unformed-lava'
  else volcanic = 'no-origin'

  return {
    origin, volcanic, hasHighOrigin, hasWellDesigned, hasPlanned, hasNoHacked,
    hasStructured, hasNoChaotic, hasDisciplined, hasNoAdhoc, hasMethodical,
    hasNoRandom, hasIntentional, hackedCount, chaoticCount,
  }
}

/**
 * Measure abyss knowledge (domain understanding)
 * @example
 * const m = measureKnowing(content)
 * console.log(m.abyss) // 'ancient-depth'
 */
export function measureKnowing(content: string): KnowingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasThrow(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasClass(content) ? 6 : 0
  score += hasPrivate(content) ? 6 : 0

  const hasDomainExpertise = hasInterface(content) && hasDocComments(content)
  const hasBusinessLogic = hasReturnType(content) && hasNamedExport(content)
  const hasWellNamed = hasEnum(content) && hasConst(content)
  const hasDocumented = hasTypeAlias(content) && hasThrow(content)
  const hasContextual = hasAsync(content) && hasImport(content)
  const hasInformed = hasClass(content) && hasPrivate(content)

  score += hasDomainExpertise ? 5 : 0
  score += hasBusinessLogic ? 5 : 0
  score += hasWellNamed ? 5 : 0
  score += hasDocumented ? 5 : 0
  score += hasContextual ? 5 : 0
  score += hasInformed ? 5 : 0

  const knowledge = Math.min(score, 100)
  const magicNumberCount = countMatches(/\bvar\b/, content)
  const undocumentedCount = countMatches(/\bany\b/, content)

  const hasNoMagicNumbers = magicNumberCount === 0
  const hasNoUndocumented = undocumentedCount === 0
  const hasNoCrypticKnow = !has(/\beval\b/, content)
  const hasNoContextFree = !has(/\bdebugger\b/, content)
  const hasHighKnowledge = knowledge >= 70

  let abyss: AbyssGrade
  if (knowledge >= 85) abyss = 'ancient-depth'
  else if (knowledge >= 70) abyss = 'deep-understanding'
  else if (knowledge >= 55) abyss = 'proper-knowledge'
  else if (knowledge >= 40) abyss = 'surface-awareness'
  else if (knowledge >= 25) abyss = 'shallow-ignorance'
  else abyss = 'no-knowledge'

  return {
    knowledge, abyss, hasHighKnowledge, hasDomainExpertise, hasBusinessLogic,
    hasNoMagicNumbers, hasWellNamed, hasNoCryptic: hasNoCrypticKnow, hasDocumented,
    hasNoUndocumented, hasContextual, hasNoContextFree, hasInformed,
    magicNumberCount, undocumentedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify wave condition
 * @example
 * classifyWaveCondition(90) // 'obsidian-masterpiece'
 */
export function classifyWaveCondition(score: number): WaveCondition {
  if (score >= 85) return 'obsidian-masterpiece'
  if (score >= 70) return 'dark-gem'
  if (score >= 55) return 'proper-glass'
  if (score >= 40) return 'cloudy-obsidian'
  if (score >= 25) return 'cracked-glass'
  return 'gravel'
}

/**
 * Classify pool type
 * @example
 * classifyPoolType(waves) // 'volcanic-lagoon'
 */
export function classifyPoolType(waves: ObsidianWave[]): PoolType {
  if (waves.length === 0) return 'no-pool'
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
  const masterpieceRatio = waves.filter(w => w.condition === 'obsidian-masterpiece').length / waves.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'volcanic-lagoon'
  if (avgQs >= 60) return 'dark-tide-pool'
  if (avgQs >= 45) return 'proper-pool'
  if (avgQs >= 30) return 'shallow-puddle'
  if (avgQs >= 15) return 'dry-basin'
  return 'no-pool'
}

/**
 * Classify pool condition
 * @example
 * classifyPoolCondition(80) // 'volcanic-paradise'
 */
export function classifyPoolCondition(avgQs: number): PoolCondition {
  if (avgQs >= 75) return 'volcanic-paradise'
  if (avgQs >= 60) return 'dark-beauty'
  if (avgQs >= 45) return 'decent-pool'
  if (avgQs >= 30) return 'murky-puddle'
  if (avgQs >= 15) return 'dry-crack'
  return 'void'
}

/**
 * Classify diver grade
 * @example
 * classifyDiverGrade(85) // 'abyssal-diver'
 */
export function classifyDiverGrade(avgDepth: number): DiverGrade {
  if (avgDepth >= 80) return 'abyssal-diver'
  if (avgDepth >= 65) return 'deep-sea-explorer'
  if (avgDepth >= 50) return 'skilled-swimmer'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'landlubber'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(waves, pools, ocean, stats)
 */
export function generateRecommendations(
  waves: ObsidianWave[],
  pools: TidePool[],
  ocean: ObsidianOcean,
  stats: ObsidianTideStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDepthPower < 50) {
    recs.push('Deepen depth power with profound interfaces, impactful generics, and substantive async patterns')
  }
  if (stats.avgTidalRhythm < 50) {
    recs.push('Improve tidal rhythm with consistent map/filter chains, performant const patterns, and predictable exports')
  }
  if (stats.avgDarkClarity < 50) {
    recs.push('Brighten dark clarity with doc comments, transparent return types, and self-documenting interfaces')
  }
  if (stats.avgVolcanicOrigin < 50) {
    recs.push('Strengthen volcanic origin with well-designed types, planned enums, and disciplined readonly patterns')
  }
  if (stats.avgAbyssKnowledge < 50) {
    recs.push('Grow abyss knowledge with domain expertise interfaces, documented business logic, and contextual imports')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — they need complete obsidian restoration`)
  }
  if (ocean.overallDepth < 40) {
    recs.push('Overall ocean depth is low — focus on depth power and tidal rhythm first')
  }
  const allDry = pools.every(p => p.poolType === 'no-pool' || p.poolType === 'dry-basin')
  if (allDry && pools.length > 0) {
    recs.push('All pools are dry — consider a major obsidian tide reconstruction')
  }
  const gravelFiles = waves.filter(w => w.condition === 'gravel').map(w => w.file)
  if (gravelFiles.length > 0 && gravelFiles.length <= 3) {
    recs.push(`Restore these gravel files: ${gravelFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your obsidian tide flows with perfect depth! Every wave is a masterpiece in the volcanic lagoon')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as obsidian wave
 * @example
 * const w = analyzeObsidianWave(content, 'index.ts')
 * console.log(w.condition) // 'obsidian-masterpiece'
 */
export function analyzeObsidianWave(content: string, filePath: string): ObsidianWave {
  const deepening = measureDeepening(content)
  const pulsing = measurePulsing(content)
  const illuminating = measureIlluminating(content)
  const forging = measureForging(content)
  const knowing = measureKnowing(content)

  const qualityScore = Math.round(
    deepening.power * 0.2 +
    pulsing.rhythm * 0.2 +
    illuminating.clarity * 0.2 +
    forging.origin * 0.2 +
    knowing.knowledge * 0.2,
  )

  return {
    file: filePath,
    depthPower: deepening.power,
    tidalRhythm: pulsing.rhythm,
    darkClarity: illuminating.clarity,
    volcanicOrigin: forging.origin,
    abyssKnowledge: knowing.knowledge,
    deepening, pulsing, illuminating, forging, knowing,
    condition: classifyWaveCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as tide pool
 * @example
 * const p = analyzeTidePool(waves, 'src')
 * console.log(p.poolType) // 'volcanic-lagoon'
 */
export function analyzeTidePool(waves: ObsidianWave[], dirPath: string): TidePool {
  if (waves.length === 0) {
    return {
      directory: dirPath, waves: [], avgPower: 0, avgRhythm: 0,
      avgKnowledge: 0, obsidianMasterpieceCount: 0, gravelCount: 0,
      poolType: 'no-pool', condition: 'void',
    }
  }

  const avgPower = Math.round(waves.reduce((s, w) => s + w.depthPower, 0) / waves.length)
  const avgRhythm = Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length)
  const avgKnowledge = Math.round(waves.reduce((s, w) => s + w.abyssKnowledge, 0) / waves.length)
  const obsidianMasterpieceCount = waves.filter(w => w.condition === 'obsidian-masterpiece').length
  const gravelCount = waves.filter(w => w.condition === 'gravel').length
  const avgQs = Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)

  return {
    directory: dirPath, waves, avgPower, avgRhythm, avgKnowledge,
    obsidianMasterpieceCount, gravelCount,
    poolType: classifyPoolType(waves),
    condition: classifyPoolCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete obsidian tide result
 * @example
 * const result = await buildObsidianTideResult(files, contents)
 * console.log(result.stats.diverGrade) // 'abyssal-diver'
 */
export async function buildObsidianTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianTideResult> {
  const waves = files.map((file, i) => analyzeObsidianWave(contents[i] ?? '', file))

  const dirMap = new Map<string, ObsidianWave[]>()
  for (const wave of waves) {
    const dir = path.dirname(wave.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(wave) } else { dirMap.set(dir, [wave]) }
  }

  const pools = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeTidePool(dirWaves, dir),
  )

  const avgPower = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.depthPower, 0) / waves.length) : 0
  const avgRhythm = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.tidalRhythm, 0) / waves.length) : 0
  const avgKnowledge = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.abyssKnowledge, 0) / waves.length) : 0

  const overallDepth = waves.length > 0
    ? Math.round((avgPower + avgRhythm + avgKnowledge) / 3) : 0
  const isAbyssal = avgPower >= 60

  const ocean: ObsidianOcean = { avgPower, avgRhythm, avgKnowledge, isAbyssal, overallDepth }

  const avgDarkClarity = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.darkClarity, 0) / waves.length) : 0
  const avgVolcanicOrigin = waves.length > 0
    ? Math.round(waves.reduce((s, w) => s + w.volcanicOrigin, 0) / waves.length) : 0
  const avgAbyssKnowledge = avgKnowledge

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => w.qualityScore > best.qualityScore ? w : best).file : ''
  const mostPowerful = waves.length > 0
    ? waves.reduce((best, w) => w.depthPower > best.depthPower ? w : best).file : ''
  const bestRhythm = waves.length > 0
    ? waves.reduce((best, w) => w.tidalRhythm > best.tidalRhythm ? w : best).file : ''
  const clearest = waves.length > 0
    ? waves.reduce((best, w) => w.darkClarity > best.darkClarity ? w : best).file : ''
  const mostKnowledgeable = waves.length > 0
    ? waves.reduce((best, w) => w.abyssKnowledge > best.abyssKnowledge ? w : best).file : ''

  const stats: ObsidianTideStats = {
    totalFiles: waves.length,
    totalPools: pools.length,
    avgDepthPower: avgPower,
    avgTidalRhythm: avgRhythm,
    avgDarkClarity,
    avgVolcanicOrigin,
    avgAbyssKnowledge,
    obsidianMasterpieceCount: waves.filter(w => w.condition === 'obsidian-masterpiece').length,
    darkGemCount: waves.filter(w => w.condition === 'dark-gem').length,
    properGlassCount: waves.filter(w => w.condition === 'proper-glass').length,
    cloudyObsidianCount: waves.filter(w => w.condition === 'cloudy-obsidian').length,
    crackedGlassCount: waves.filter(w => w.condition === 'cracked-glass').length,
    gravelCount: waves.filter(w => w.condition === 'gravel').length,
    hasHighPowerCount: waves.filter(w => w.deepening.hasHighPower).length,
    hasHighRhythmCount: waves.filter(w => w.pulsing.hasHighRhythm).length,
    hasHighClarityCount: waves.filter(w => w.illuminating.hasHighClarity).length,
    hasHighOriginCount: waves.filter(w => w.forging.hasHighOrigin).length,
    hasHighKnowledgeCount: waves.filter(w => w.knowing.hasHighKnowledge).length,
    overallDepth,
    diverGrade: classifyDiverGrade(overallDepth),
    bestWave, mostPowerful, bestRhythm, clearest, mostKnowledgeable,
  }

  const recommendations = generateRecommendations(waves, pools, ocean, stats)

  return { waves, pools, ocean, stats, recommendations }
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
