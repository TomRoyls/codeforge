// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Royal depth grade */
export type DepthGrade =
  | 'deep-purple'
  | 'rich-violet'
  | 'proper-amethyst'
  | 'light-lavender'
  | 'pale-mauve'
  | 'colorless'

/** Sober clarity grade */
export type SobrietyGrade =
  | 'crystal-clear-mind'
  | 'clear-thinking'
  | 'proper-lucidity'
  | 'foggy-logic'
  | 'confused'
  | 'intoxicated'

/** Crystal structure grade */
export type CrystalGrade =
  | 'hexagonal-perfection'
  | 'proper-crystal'
  | 'decent-structure'
  | 'poor-crystal'
  | 'amorphous'
  | 'no-structure'

/** Color majesty grade */
export type ColorGrade =
  | 'royal-purple'
  | 'deep-violet'
  | 'proper-amethyst-purple'
  | 'reddish-purple'
  | 'gray-purple'
  | 'no-color'

/** Transformation purity grade */
export type TransformationGrade =
  | 'pure-transmutation'
  | 'clean-refactor'
  | 'proper-evolution'
  | 'messy-transform'
  | 'corrupted'
  | 'degraded'

/** Gem condition */
export type GemCondition =
  | 'crown-jewel'
  | 'bishop-ring'
  | 'proper-amethyst'
  | 'rose-quartz'
  | 'common-quartz'
  | 'sand'

/** Crown type */
export type CrownType =
  | 'royal-crown'
  | 'bishop-mitre'
  | 'proper-tiara'
  | 'simple-band'
  | 'costume-jewelry'
  | 'no-crown'

/** Crown condition */
export type CrownCondition =
  | 'imperial-regalia'
  | 'crown-jewels'
  | 'decent-collection'
  | 'common-gems'
  | 'fakes'
  | 'empty'

/** Monarch grade */
export type MonarchGrade =
  | 'emperor'
  | 'king'
  | 'prince'
  | 'duke'
  | 'knight'
  | 'peasant'

/** Deepening measurement */
export interface DeepeningMeasure {
  depth: number
  grade: DepthGrade
  hasHighDepth: boolean
  hasWise: boolean
  hasAuthoritative: boolean
  hasNoShallow: boolean
  hasProfound: boolean
  hasNoTrivial: boolean
  hasDeep: boolean
  hasNoSurface: boolean
  hasSubstantive: boolean
  hasNoHollow: boolean
  hasCommanding: boolean
  shallowCount: number
  trivialCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  sobriety: SobrietyGrade
  hasHighClarity: boolean
  hasClear: boolean
  hasLogical: boolean
  hasNoConfused: boolean
  hasRational: boolean
  hasNoIrrational: boolean
  hasLucid: boolean
  hasNoMuddled: boolean
  hasCoherent: boolean
  hasNoIncoherent: boolean
  hasSensible: boolean
  confusedCount: number
  irrationalCount: number
}

/** Structuring measurement */
export interface StructuringMeasure {
  quality: number
  crystal: CrystalGrade
  hasHighQuality: boolean
  hasOrganized: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasOrdered: boolean
  hasNoRandom: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasRegular: boolean
  hasNoIrregular: boolean
  hasPatterned: boolean
  chaoticCount: number
  randomCount: number
}

/** Coloring measurement */
export interface ColoringMeasure {
  majesty: number
  color: ColorGrade
  hasHighMajesty: boolean
  hasElegant: boolean
  hasDignified: boolean
  hasNoCrude: boolean
  hasSophisticated: boolean
  hasNoClunky: boolean
  hasGraceful: boolean
  hasNoHarsh: boolean
  hasRefined: boolean
  hasNoVulgar: boolean
  hasNoble: boolean
  crudeCount: number
  clunkyCount: number
}

/** Transforming measurement */
export interface TransformingMeasure {
  purity: number
  transformation: TransformationGrade
  hasHighPurity: boolean
  hasClean: boolean
  hasPure: boolean
  hasNoPolluted: boolean
  hasPreserved: boolean
  hasNoDegraded: boolean
  hasImproved: boolean
  hasNoRegressed: boolean
  hasEnhanced: boolean
  hasNoDiminished: boolean
  hasUplifted: boolean
  pollutedCount: number
  degradedCount: number
}

/** Single file analysis */
export interface AmethystGem {
  file: string
  royalDepth: number
  soberClarity: number
  crystalStructure: number
  colorMajesty: number
  transformationPurity: number
  deepening: DeepeningMeasure
  clarifying: ClarifyingMeasure
  structuring: StructuringMeasure
  coloring: ColoringMeasure
  transforming: TransformingMeasure
  condition: GemCondition
  qualityScore: number
}

/** Directory-level crown */
export interface AmethystCrown {
  directory: string
  gems: AmethystGem[]
  avgDepth: number
  avgClarity: number
  avgStructure: number
  crownJewelCount: number
  sandCount: number
  crownType: CrownType
  condition: CrownCondition
}

/** Throne summary */
export interface ThroneSummary {
  avgDepth: number
  avgClarity: number
  avgStructure: number
  isRoyal: boolean
  overallMajesty: number
}

/** Full stats */
export interface AmethystCrownStats {
  totalFiles: number
  totalCrowns: number
  avgRoyalDepth: number
  avgSoberClarity: number
  avgCrystalStructure: number
  avgColorMajesty: number
  avgTransformationPurity: number
  crownJewelCount: number
  bishopRingCount: number
  properAmethystCount: number
  roseQuartzCount: number
  commonQuartzCount: number
  sandCount: number
  hasHighDepthCount: number
  hasHighClarityCount: number
  hasHighQualityCount: number
  hasHighMajestyCount: number
  hasHighPurityCount: number
  overallMajesty: number
  monarchGrade: MonarchGrade
  bestGem: string
  wisest: string
  clearest: string
  bestStructured: string
  mostElegant: string
}

/** Full result */
export interface AmethystCrownResult {
  gems: AmethystGem[]
  crowns: AmethystCrown[]
  throne: ThroneSummary
  stats: AmethystCrownStats
  recommendations: string[]
}

// ─── Regex Helpers ─────────────────────────────────────────────────

const has = (pattern: RegExp, content: string): boolean => pattern.test(content)
const count = (pattern: RegExp, content: string): number => {
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
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure royal depth
 * @example
 * const m = measureDeepening(content)
 * console.log(m.grade) // 'deep-purple'
 */
export function measureDeepening(content: string): DeepeningMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasWise = hasDocComments(content) && hasInterface(content)
  const hasAuthoritative = hasGenerics(content) && hasTypeAlias(content)
  const hasProfound = hasReadonly(content) && hasReturnType(content)
  const hasDeep = hasStrictEq(content) && hasPrivate(content)
  const hasSubstantive = hasConst(content) && hasInterface(content)
  const hasCommanding = hasClass(content) && hasDocComments(content)

  score += hasWise ? 5 : 0
  score += hasAuthoritative ? 5 : 0
  score += hasProfound ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasCommanding ? 5 : 0

  const depth = Math.min(score, 100)
  const shallowCount = count(/\bvar\b/, content)
  const trivialCount = count(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoTrivial = trivialCount === 0
  const hasNoSurface = !has(/\beval\b/, content)
  const hasNoHollow = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grade: DepthGrade
  if (depth >= 85) grade = 'deep-purple'
  else if (depth >= 70) grade = 'rich-violet'
  else if (depth >= 55) grade = 'proper-amethyst'
  else if (depth >= 40) grade = 'light-lavender'
  else if (depth >= 25) grade = 'pale-mauve'
  else grade = 'colorless'

  return {
    depth, grade, hasHighDepth, hasWise, hasAuthoritative, hasNoShallow,
    hasProfound, hasNoTrivial, hasDeep, hasNoSurface, hasSubstantive,
    hasNoHollow, hasCommanding, shallowCount, trivialCount,
  }
}

/**
 * Measure sober clarity
 * @example
 * const m = measureClarifying(content)
 * console.log(m.sobriety) // 'crystal-clear-mind'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasClear = hasExport(content) && hasImport(content)
  const hasLogical = hasPrivate(content) && hasReadonly(content)
  const hasRational = hasInterface(content) && hasClass(content)
  const hasLucid = hasStrictEq(content) && hasReturnType(content)
  const hasCoherent = hasGenerics(content) && hasAsync(content)
  const hasSensible = hasExport(content) && hasGenerics(content)

  score += hasClear ? 5 : 0
  score += hasLogical ? 5 : 0
  score += hasRational ? 5 : 0
  score += hasLucid ? 5 : 0
  score += hasCoherent ? 5 : 0
  score += hasSensible ? 5 : 0

  const clarity = Math.min(score, 100)
  const confusedCount = count(/\bvar\b/, content)
  const irrationalCount = count(/\bany\b/, content)

  const hasNoConfused = confusedCount === 0
  const hasNoIrrational = irrationalCount === 0
  const hasNoMuddled = !has(/\beval\b/, content)
  const hasNoIncoherent = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let sobriety: SobrietyGrade
  if (clarity >= 85) sobriety = 'crystal-clear-mind'
  else if (clarity >= 70) sobriety = 'clear-thinking'
  else if (clarity >= 55) sobriety = 'proper-lucidity'
  else if (clarity >= 40) sobriety = 'foggy-logic'
  else if (clarity >= 25) sobriety = 'confused'
  else sobriety = 'intoxicated'

  return {
    clarity, sobriety, hasHighClarity, hasClear, hasLogical, hasNoConfused,
    hasRational, hasNoIrrational, hasLucid, hasNoMuddled, hasCoherent,
    hasNoIncoherent, hasSensible, confusedCount, irrationalCount,
  }
}

/**
 * Measure crystal structure
 * @example
 * const m = measureStructuring(content)
 * console.log(m.crystal) // 'hexagonal-perfection'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasOrganized = hasNamedExport(content) && hasExport(content)
  const hasStructured = hasReturnType(content) && hasStrictEq(content)
  const hasOrdered = hasInterface(content) && hasGenerics(content)
  const hasSystematic = hasReadonly(content) && hasPrivate(content)
  const hasRegular = hasClass(content) && hasConst(content)
  const hasPatterned = hasNamedExport(content) && hasReturnType(content)

  score += hasOrganized ? 5 : 0
  score += hasStructured ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasSystematic ? 5 : 0
  score += hasRegular ? 5 : 0
  score += hasPatterned ? 5 : 0

  const quality = Math.min(score, 100)
  const chaoticCount = count(/\bvar\b/, content)
  const randomCount = count(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoRandom = randomCount === 0
  const hasNoHaphazard = !has(/\beval\b/, content)
  const hasNoIrregular = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let crystal: CrystalGrade
  if (quality >= 85) crystal = 'hexagonal-perfection'
  else if (quality >= 70) crystal = 'proper-crystal'
  else if (quality >= 55) crystal = 'decent-structure'
  else if (quality >= 40) crystal = 'poor-crystal'
  else if (quality >= 25) crystal = 'amorphous'
  else crystal = 'no-structure'

  return {
    quality, crystal, hasHighQuality, hasOrganized, hasStructured, hasNoChaotic,
    hasOrdered, hasNoRandom, hasSystematic, hasNoHaphazard, hasRegular,
    hasNoIrregular, hasPatterned, chaoticCount, randomCount,
  }
}

/**
 * Measure color majesty
 * @example
 * const m = measureColoring(content)
 * console.log(m.color) // 'royal-purple'
 */
export function measureColoring(content: string): ColoringMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasElegant = hasDocComments(content) && hasInterface(content)
  const hasDignified = hasTypeAlias(content) && hasGenerics(content)
  const hasSophisticated = hasReturnType(content) && hasReadonly(content)
  const hasGraceful = hasPrivate(content) && hasStrictEq(content)
  const hasRefined = hasConst(content) && hasDocComments(content)
  const hasNoble = hasClass(content) && hasInterface(content)

  score += hasElegant ? 5 : 0
  score += hasDignified ? 5 : 0
  score += hasSophisticated ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasNoble ? 5 : 0

  const majesty = Math.min(score, 100)
  const crudeCount = count(/\bvar\b/, content)
  const clunkyCount = count(/\bany\b/, content)

  const hasNoCrude = crudeCount === 0
  const hasNoClunky = clunkyCount === 0
  const hasNoHarsh = !has(/\beval\b/, content)
  const hasNoVulgar = !has(/\bdebugger\b/, content)
  const hasHighMajesty = majesty >= 70

  let color: ColorGrade
  if (majesty >= 85) color = 'royal-purple'
  else if (majesty >= 70) color = 'deep-violet'
  else if (majesty >= 55) color = 'proper-amethyst-purple'
  else if (majesty >= 40) color = 'reddish-purple'
  else if (majesty >= 25) color = 'gray-purple'
  else color = 'no-color'

  return {
    majesty, color, hasHighMajesty, hasElegant, hasDignified, hasNoCrude,
    hasSophisticated, hasNoClunky, hasGraceful, hasNoHarsh, hasRefined,
    hasNoVulgar, hasNoble, crudeCount, clunkyCount,
  }
}

/**
 * Measure transformation purity
 * @example
 * const m = measureTransforming(content)
 * console.log(m.transformation) // 'pure-transmutation'
 */
export function measureTransforming(content: string): TransformingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasClean = hasReturnType(content) && hasStrictEq(content)
  const hasPure = hasReadonly(content) && hasPrivate(content)
  const hasPreserved = hasInterface(content) && hasGenerics(content)
  const hasImproved = hasTypeAlias(content) && hasDocComments(content)
  const hasEnhanced = hasClass(content) && hasReturnType(content)
  const hasUplifted = hasConst(content) && hasStrictEq(content)

  score += hasClean ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasPreserved ? 5 : 0
  score += hasImproved ? 5 : 0
  score += hasEnhanced ? 5 : 0
  score += hasUplifted ? 5 : 0

  const purity = Math.min(score, 100)
  const pollutedCount = count(/\bvar\b/, content)
  const degradedCount = count(/\bany\b/, content)

  const hasNoPolluted = pollutedCount === 0
  const hasNoDegraded = degradedCount === 0
  const hasNoRegressed = !has(/\beval\b/, content)
  const hasNoDiminished = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let transformation: TransformationGrade
  if (purity >= 85) transformation = 'pure-transmutation'
  else if (purity >= 70) transformation = 'clean-refactor'
  else if (purity >= 55) transformation = 'proper-evolution'
  else if (purity >= 40) transformation = 'messy-transform'
  else if (purity >= 25) transformation = 'corrupted'
  else transformation = 'degraded'

  return {
    purity, transformation, hasHighPurity, hasClean, hasPure, hasNoPolluted,
    hasPreserved, hasNoDegraded, hasImproved, hasNoRegressed, hasEnhanced,
    hasNoDiminished, hasUplifted, pollutedCount, degradedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify gem condition
 * @example
 * classifyGemCondition(90) // 'crown-jewel'
 */
export function classifyGemCondition(score: number): GemCondition {
  if (score >= 85) return 'crown-jewel'
  if (score >= 70) return 'bishop-ring'
  if (score >= 55) return 'proper-amethyst'
  if (score >= 40) return 'rose-quartz'
  if (score >= 25) return 'common-quartz'
  return 'sand'
}

/**
 * Classify crown type
 * @example
 * classifyCrownType(gems) // 'royal-crown'
 */
export function classifyCrownType(gems: AmethystGem[]): CrownType {
  if (gems.length === 0) return 'no-crown'
  const avgQs = Math.round(gems.reduce((s, g) => s + g.qualityScore, 0) / gems.length)
  const jewelRatio = gems.filter(g => g.condition === 'crown-jewel').length / gems.length
  if (avgQs >= 75 && jewelRatio >= 0.5) return 'royal-crown'
  if (avgQs >= 60) return 'bishop-mitre'
  if (avgQs >= 45) return 'proper-tiara'
  if (avgQs >= 30) return 'simple-band'
  if (avgQs >= 15) return 'costume-jewelry'
  return 'no-crown'
}

/**
 * Classify crown condition
 * @example
 * classifyCrownCondition(80) // 'imperial-regalia'
 */
export function classifyCrownCondition(avgQs: number): CrownCondition {
  if (avgQs >= 75) return 'imperial-regalia'
  if (avgQs >= 60) return 'crown-jewels'
  if (avgQs >= 45) return 'decent-collection'
  if (avgQs >= 30) return 'common-gems'
  if (avgQs >= 15) return 'fakes'
  return 'empty'
}

/**
 * Classify monarch grade
 * @example
 * classifyMonarchGrade(85) // 'emperor'
 */
export function classifyMonarchGrade(avgMajesty: number): MonarchGrade {
  if (avgMajesty >= 80) return 'emperor'
  if (avgMajesty >= 65) return 'king'
  if (avgMajesty >= 50) return 'prince'
  if (avgMajesty >= 35) return 'duke'
  if (avgMajesty >= 20) return 'knight'
  return 'peasant'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(gems, crowns, throne, stats)
 */
export function generateRecommendations(
  gems: AmethystGem[],
  crowns: AmethystCrown[],
  throne: ThroneSummary,
  stats: AmethystCrownStats,
): string[] {
  const recs: string[] = []
  if (stats.avgRoyalDepth < 50) {
    recs.push('Deepen royal wisdom with wise doc comments, authoritative generics, and profound readonly patterns')
  }
  if (stats.avgSoberClarity < 50) {
    recs.push('Clarify sober thinking with clear exports, logical private fields, and rational interface foundations')
  }
  if (stats.avgCrystalStructure < 50) {
    recs.push('Structure crystal organization with ordered interfaces, systematic readonly guards, and regular class patterns')
  }
  if (stats.avgColorMajesty < 50) {
    recs.push('Enhance color majesty with elegant doc comments, dignified type aliases, and sophisticated return types')
  }
  if (stats.avgTransformationPurity < 50) {
    recs.push('Purify transformations with clean return types, pure readonly guards, and preserved interface patterns')
  }
  if (stats.sandCount > 0) {
    recs.push(`${stats.sandCount} file(s) are sand — consider significant refactoring`)
  }
  if (throne.overallMajesty < 40) {
    recs.push('Overall amethyst majesty is poor — focus on royal depth and sober clarity first')
  }
  const allFakes = crowns.every(c => c.crownType === 'no-crown' || c.crownType === 'costume-jewelry')
  if (allFakes && crowns.length > 0) {
    recs.push('All crowns are costume jewelry or empty — consider a major quality overhaul')
  }
  const sands = gems.filter(g => g.condition === 'sand').map(g => g.file)
  if (sands.length > 0 && sands.length <= 3) {
    recs.push(`Transform these sand files into amethyst gems: ${sands.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your amethyst collection is emperor quality! Every gem radiates royal majesty')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as amethyst gem
 * @example
 * const gem = analyzeAmethystGem(content, 'index.ts')
 * console.log(gem.condition) // 'crown-jewel'
 */
export function analyzeAmethystGem(content: string, filePath: string): AmethystGem {
  const deepening = measureDeepening(content)
  const clarifying = measureClarifying(content)
  const structuring = measureStructuring(content)
  const coloring = measureColoring(content)
  const transforming = measureTransforming(content)

  const qualityScore = Math.round(
    deepening.depth * 0.2 +
    clarifying.clarity * 0.2 +
    structuring.quality * 0.2 +
    coloring.majesty * 0.2 +
    transforming.purity * 0.2,
  )

  return {
    file: filePath,
    royalDepth: deepening.depth,
    soberClarity: clarifying.clarity,
    crystalStructure: structuring.quality,
    colorMajesty: coloring.majesty,
    transformationPurity: transforming.purity,
    deepening,
    clarifying,
    structuring,
    coloring,
    transforming,
    condition: classifyGemCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as an amethyst crown
 * @example
 * const crown = analyzeAmethystCrown(gems, 'src')
 * console.log(crown.crownType) // 'royal-crown'
 */
export function analyzeAmethystCrown(gems: AmethystGem[], dirPath: string): AmethystCrown {
  if (gems.length === 0) {
    return {
      directory: dirPath, gems: [], avgDepth: 0, avgClarity: 0, avgStructure: 0,
      crownJewelCount: 0, sandCount: 0, crownType: 'no-crown', condition: 'empty',
    }
  }

  const avgDepth = Math.round(gems.reduce((s, g) => s + g.royalDepth, 0) / gems.length)
  const avgClarity = Math.round(gems.reduce((s, g) => s + g.soberClarity, 0) / gems.length)
  const avgStructure = Math.round(gems.reduce((s, g) => s + g.crystalStructure, 0) / gems.length)
  const crownJewelCount = gems.filter(g => g.condition === 'crown-jewel').length
  const sandCount = gems.filter(g => g.condition === 'sand').length
  const avgQs = Math.round(gems.reduce((s, g) => s + g.qualityScore, 0) / gems.length)

  return {
    directory: dirPath, gems, avgDepth, avgClarity, avgStructure,
    crownJewelCount, sandCount, crownType: classifyCrownType(gems),
    condition: classifyCrownCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete amethyst crown result
 * @example
 * const result = await buildAmethystCrownResult(files, contents)
 * console.log(result.stats.monarchGrade) // 'emperor'
 */
export async function buildAmethystCrownResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmethystCrownResult> {
  const gems = files.map((file, i) => analyzeAmethystGem(contents[i] ?? '', file))

  const dirMap = new Map<string, AmethystGem[]>()
  for (const gem of gems) {
    const dir = path.dirname(gem.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(gem) } else { dirMap.set(dir, [gem]) }
  }

  const crowns = Array.from(dirMap.entries()).map(([dir, dirGems]) =>
    analyzeAmethystCrown(dirGems, dir),
  )

  const avgDepth = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.royalDepth, 0) / gems.length) : 0
  const avgClarity = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.soberClarity, 0) / gems.length) : 0
  const avgStructure = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.crystalStructure, 0) / gems.length) : 0

  const overallMajesty = gems.length > 0
    ? Math.round((avgDepth + avgClarity + avgStructure) / 3) : 0
  const isRoyal = avgDepth >= 60

  const throne: ThroneSummary = { avgDepth, avgClarity, avgStructure, isRoyal, overallMajesty }

  const avgColorMajesty = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.colorMajesty, 0) / gems.length) : 0
  const avgTransformationPurity = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.transformationPurity, 0) / gems.length) : 0

  const bestGem = gems.length > 0
    ? gems.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file : ''
  const wisest = gems.length > 0
    ? gems.reduce((best, g) => g.royalDepth > best.royalDepth ? g : best).file : ''
  const clearest = gems.length > 0
    ? gems.reduce((best, g) => g.soberClarity > best.soberClarity ? g : best).file : ''
  const bestStructured = gems.length > 0
    ? gems.reduce((best, g) => g.crystalStructure > best.crystalStructure ? g : best).file : ''
  const mostElegant = gems.length > 0
    ? gems.reduce((best, g) => g.colorMajesty > best.colorMajesty ? g : best).file : ''

  const stats: AmethystCrownStats = {
    totalFiles: gems.length,
    totalCrowns: crowns.length,
    avgRoyalDepth: avgDepth,
    avgSoberClarity: avgClarity,
    avgCrystalStructure: avgStructure,
    avgColorMajesty,
    avgTransformationPurity,
    crownJewelCount: gems.filter(g => g.condition === 'crown-jewel').length,
    bishopRingCount: gems.filter(g => g.condition === 'bishop-ring').length,
    properAmethystCount: gems.filter(g => g.condition === 'proper-amethyst').length,
    roseQuartzCount: gems.filter(g => g.condition === 'rose-quartz').length,
    commonQuartzCount: gems.filter(g => g.condition === 'common-quartz').length,
    sandCount: gems.filter(g => g.condition === 'sand').length,
    hasHighDepthCount: gems.filter(g => g.deepening.hasHighDepth).length,
    hasHighClarityCount: gems.filter(g => g.clarifying.hasHighClarity).length,
    hasHighQualityCount: gems.filter(g => g.structuring.hasHighQuality).length,
    hasHighMajestyCount: gems.filter(g => g.coloring.hasHighMajesty).length,
    hasHighPurityCount: gems.filter(g => g.transforming.hasHighPurity).length,
    overallMajesty,
    monarchGrade: classifyMonarchGrade(overallMajesty),
    bestGem, wisest, clearest, bestStructured, mostElegant,
  }

  const recommendations = generateRecommendations(gems, crowns, throne, stats)

  return { gems, crowns, throne, stats, recommendations }
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
