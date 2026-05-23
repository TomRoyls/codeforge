// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Intensity grade */
export type IntensityGrade =
  | 'pigeon-blood'
  | 'vivid-red'
  | 'proper-red'
  | 'pinkish-red'
  | 'pale-red'
  | 'colorless'

/** Color depth grade */
export type ColorGrade =
  | 'deep-crimson'
  | 'rich-red'
  | 'proper-scarlet'
  | 'light-pink'
  | 'faded'
  | 'washed-out'

/** Inclusion grade */
export type InclusionGrade =
  | 'eye-clean'
  | 'minor-inclusions'
  | 'proper-clarity'
  | 'visible-inclusions'
  | 'cloudy'
  | 'opaque'

/** Hardness grade */
export type HardnessGrade =
  | 'sapphire-hard'
  | 'proper-hard'
  | 'good-hardness'
  | 'medium-hard'
  | 'soft-stone'
  | 'crumbly'

/** Fire grade */
export type FireGrade =
  | 'eternal-fire'
  | 'long-burning'
  | 'proper-flame'
  | 'fading-ember'
  | 'brief-spark'
  | 'cold-stone'

/** Ruby condition */
export type RubyCondition =
  | 'pigeon-blood-ruby'
  | 'burma-ruby'
  | 'proper-ruby'
  | 'pink-sapphire'
  | 'garnet-imitation'
  | 'glass-fake'

/** Mine type */
export type MineType =
  | 'burma-mine'
  | 'thai-mine'
  | 'proper-deposit'
  | 'secondary-deposit'
  | 'surface-find'
  | 'no-deposit'

/** Mine condition */
export type MineCondition =
  | 'premium-vein'
  | 'rich-seam'
  | 'decent-yield'
  | 'low-grade'
  | 'exhausted'
  | 'barren'

/** Jeweler grade */
export type JewelerGrade =
  | 'master-jeweler'
  | 'ruby-expert'
  | 'skilled-gemologist'
  | 'appraiser'
  | 'novice'
  | 'bauble-seller'

/** Intensifying measurement */
export interface IntensifyingMeasure {
  intensity: number
  grade: IntensityGrade
  hasHighIntensity: boolean
  hasDedicated: boolean
  hasThorough: boolean
  hasNoSuperficial: boolean
  hasPassionate: boolean
  hasNoApathetic: boolean
  hasIntense: boolean
  hasNoWeak: boolean
  hasCommitted: boolean
  hasNoIndifferent: boolean
  hasEarnest: boolean
  superficialCount: number
  apatheticCount: number
}

/** Deepening measurement */
export interface DeepeningMeasure {
  depth: number
  color: ColorGrade
  hasHighDepth: boolean
  hasDeep: boolean
  hasProfound: boolean
  hasNoShallow: boolean
  hasRich: boolean
  hasNoThin: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasSubstantive: boolean
  hasNoHollow: boolean
  hasComplex: boolean
  shallowCount: number
  thinCount: number
}

/** Purifying measurement */
export interface PurifyingMeasure {
  purity: number
  inclusion: InclusionGrade
  hasHighPurity: boolean
  hasClean: boolean
  hasPure: boolean
  hasNoContaminated: boolean
  hasClear: boolean
  hasNoMurky: boolean
  hasPristine: boolean
  hasNoBlemished: boolean
  hasSpotless: boolean
  hasNoFlawed: boolean
  hasImmaculate: boolean
  contaminatedCount: number
  murkyCount: number
}

/** Hardening measurement */
export interface HardeningMeasure {
  grade: number
  hardness: HardnessGrade
  hasHighGrade: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoBrittle: boolean
  hasSolid: boolean
  hasNoWeak: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasHardy: boolean
  fragileCount: number
  brittleCount: number
}

/** Sustaining measurement */
export interface SustainingMeasure {
  sustainability: number
  fire: FireGrade
  hasHighSustainability: boolean
  hasLasting: boolean
  hasEnduring: boolean
  hasNoFading: boolean
  hasSustainable: boolean
  hasNoFleeting: boolean
  hasPersistent: boolean
  hasNoVanishing: boolean
  hasSteady: boolean
  hasNoDying: boolean
  hasPerpetual: boolean
  fadingCount: number
  fleetingCount: number
}

/** Single file analysis */
export interface RubyGem {
  file: string
  passionIntensity: number
  colorDepth: number
  inclusionPurity: number
  hardnessGrade: number
  fireSustainability: number
  intensifying: IntensifyingMeasure
  deepening: DeepeningMeasure
  purifying: PurifyingMeasure
  hardening: HardeningMeasure
  sustaining: SustainingMeasure
  condition: RubyCondition
  qualityScore: number
}

/** Directory-level mine */
export interface RubyMine {
  directory: string
  gems: RubyGem[]
  avgIntensity: number
  avgDepth: number
  avgHardness: number
  pigeonBloodRubyCount: number
  glassFakeCount: number
  mineType: MineType
  condition: MineCondition
}

/** Treasury summary */
export interface TreasurySummary {
  avgIntensity: number
  avgDepth: number
  avgHardness: number
  isPrecious: boolean
  overallFire: number
}

/** Full stats */
export interface RubyHeartStats {
  totalFiles: number
  totalMines: number
  avgPassionIntensity: number
  avgColorDepth: number
  avgInclusionPurity: number
  avgHardnessGrade: number
  avgFireSustainability: number
  pigeonBloodRubyCount: number
  burmaRubyCount: number
  properRubyCount: number
  pinkSapphireCount: number
  garnetImitationCount: number
  glassFakeCount: number
  hasHighIntensityCount: number
  hasHighDepthCount: number
  hasHighPurityCount: number
  hasHighGradeCount: number
  hasHighSustainabilityCount: number
  overallFire: number
  jewelerGrade: JewelerGrade
  bestGem: string
  mostIntense: string
  deepest: string
  purest: string
  hardest: string
}

/** Full result */
export interface RubyHeartResult {
  gems: RubyGem[]
  mines: RubyMine[]
  treasury: TreasurySummary
  stats: RubyHeartStats
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
 * Measure passion intensity (dedication/thoroughness)
 * @example
 * const m = measureIntensifying(content)
 * console.log(m.grade) // 'pigeon-blood'
 */
export function measureIntensifying(content: string): IntensifyingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasDedicated = hasExport(content) && hasImport(content)
  const hasThorough = hasReturnType(content) && hasStrictEq(content)
  const hasPassionate = hasInterface(content) && hasGenerics(content)
  const hasIntense = hasTypeAlias(content) && hasConst(content)
  const hasCommitted = hasAsync(content) && hasClass(content)
  const hasEarnest = hasExport(content) && hasGenerics(content)

  score += hasDedicated ? 5 : 0
  score += hasThorough ? 5 : 0
  score += hasPassionate ? 5 : 0
  score += hasIntense ? 5 : 0
  score += hasCommitted ? 5 : 0
  score += hasEarnest ? 5 : 0

  const intensity = Math.min(score, 100)
  const superficialCount = count(/\bvar\b/, content)
  const apatheticCount = count(/\bany\b/, content)

  const hasNoSuperficial = superficialCount === 0
  const hasNoApathetic = apatheticCount === 0
  const hasNoWeak = !has(/\beval\b/, content)
  const hasNoIndifferent = !has(/\bdebugger\b/, content)
  const hasHighIntensity = intensity >= 70

  let grade: IntensityGrade
  if (intensity >= 85) grade = 'pigeon-blood'
  else if (intensity >= 70) grade = 'vivid-red'
  else if (intensity >= 55) grade = 'proper-red'
  else if (intensity >= 40) grade = 'pinkish-red'
  else if (intensity >= 25) grade = 'pale-red'
  else grade = 'colorless'

  return {
    intensity, grade, hasHighIntensity, hasDedicated, hasThorough, hasNoSuperficial,
    hasPassionate, hasNoApathetic, hasIntense, hasNoWeak, hasCommitted,
    hasNoIndifferent, hasEarnest, superficialCount, apatheticCount,
  }
}

/**
 * Measure color depth (richness/depth)
 * @example
 * const m = measureDeepening(content)
 * console.log(m.color) // 'deep-crimson'
 */
export function measureDeepening(content: string): DeepeningMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasDeep = hasDocComments(content) && hasInterface(content)
  const hasProfound = hasGenerics(content) && hasTypeAlias(content)
  const hasRich = hasReturnType(content) && hasStrictEq(content)
  const hasLayered = hasReadonly(content) && hasPrivate(content)
  const hasSubstantive = hasClass(content) && hasDocComments(content)
  const hasComplex = hasConst(content) && hasInterface(content)

  score += hasDeep ? 5 : 0
  score += hasProfound ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasComplex ? 5 : 0

  const depth = Math.min(score, 100)
  const shallowCount = count(/\bvar\b/, content)
  const thinCount = count(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoThin = thinCount === 0
  const hasNoFlat = !has(/\beval\b/, content)
  const hasNoHollow = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let color: ColorGrade
  if (depth >= 85) color = 'deep-crimson'
  else if (depth >= 70) color = 'rich-red'
  else if (depth >= 55) color = 'proper-scarlet'
  else if (depth >= 40) color = 'light-pink'
  else if (depth >= 25) color = 'faded'
  else color = 'washed-out'

  return {
    depth, color, hasHighDepth, hasDeep, hasProfound, hasNoShallow,
    hasRich, hasNoThin, hasLayered, hasNoFlat, hasSubstantive, hasNoHollow,
    hasComplex, shallowCount, thinCount,
  }
}

/**
 * Measure inclusion purity (cleanliness)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.inclusion) // 'eye-clean'
 */
export function measurePurifying(content: string): PurifyingMeasure {
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
  const hasClear = hasInterface(content) && hasGenerics(content)
  const hasPristine = hasTypeAlias(content) && hasDocComments(content)
  const hasSpotless = hasClass(content) && hasReturnType(content)
  const hasImmaculate = hasConst(content) && hasStrictEq(content)

  score += hasClean ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasSpotless ? 5 : 0
  score += hasImmaculate ? 5 : 0

  const purity = Math.min(score, 100)
  const contaminatedCount = count(/\bvar\b/, content)
  const murkyCount = count(/\bany\b/, content)

  const hasNoContaminated = contaminatedCount === 0
  const hasNoMurky = murkyCount === 0
  const hasNoBlemished = !has(/\beval\b/, content)
  const hasNoFlawed = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let inclusion: InclusionGrade
  if (purity >= 85) inclusion = 'eye-clean'
  else if (purity >= 70) inclusion = 'minor-inclusions'
  else if (purity >= 55) inclusion = 'proper-clarity'
  else if (purity >= 40) inclusion = 'visible-inclusions'
  else if (purity >= 25) inclusion = 'cloudy'
  else inclusion = 'opaque'

  return {
    purity, inclusion, hasHighPurity, hasClean, hasPure, hasNoContaminated,
    hasClear, hasNoMurky, hasPristine, hasNoBlemished, hasSpotless, hasNoFlawed,
    hasImmaculate, contaminatedCount, murkyCount,
  }
}

/**
 * Measure hardness grade (robustness)
 * @example
 * const m = measureHardening(content)
 * console.log(m.hardness) // 'sapphire-hard'
 */
export function measureHardening(content: string): HardeningMeasure {
  let score = 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0

  const hasRobust = hasPrivate(content) && hasReadonly(content)
  const hasDurable = hasStrictEq(content) && hasReturnType(content)
  const hasTough = hasInterface(content) && hasGenerics(content)
  const hasSolid = hasClass(content) && hasAsync(content)
  const hasResilient = hasExport(content) && hasImport(content)
  const hasHardy = hasPrivate(content) && hasGenerics(content)

  score += hasRobust ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasHardy ? 5 : 0

  const gradeVal = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBrittle = brittleCount === 0
  const hasNoBreakable = !has(/\beval\b/, content)
  const hasNoWeak = !has(/\bdebugger\b/, content)
  const hasHighGrade = gradeVal >= 70

  let hardness: HardnessGrade
  if (gradeVal >= 85) hardness = 'sapphire-hard'
  else if (gradeVal >= 70) hardness = 'proper-hard'
  else if (gradeVal >= 55) hardness = 'good-hardness'
  else if (gradeVal >= 40) hardness = 'medium-hard'
  else if (gradeVal >= 25) hardness = 'soft-stone'
  else hardness = 'crumbly'

  return {
    grade: gradeVal, hardness, hasHighGrade, hasRobust, hasDurable, hasNoFragile,
    hasTough, hasNoBrittle, hasSolid, hasNoWeak, hasResilient, hasNoBreakable,
    hasHardy, fragileCount, brittleCount,
  }
}

/**
 * Measure fire sustainability (long-term brilliance)
 * @example
 * const m = measureSustaining(content)
 * console.log(m.fire) // 'eternal-fire'
 */
export function measureSustaining(content: string): SustainingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasLasting = hasNamedExport(content) && hasExport(content)
  const hasEnduring = hasInterface(content) && hasGenerics(content)
  const hasSustainable = hasTypeAlias(content) && hasAsync(content)
  const hasPersistent = hasImport(content) && hasClass(content)
  const hasSteady = hasReturnType(content) && hasDocComments(content)
  const hasPerpetual = hasNamedExport(content) && hasInterface(content)

  score += hasLasting ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasSustainable ? 5 : 0
  score += hasPersistent ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasPerpetual ? 5 : 0

  const sustainability = Math.min(score, 100)
  const fadingCount = count(/\bvar\b/, content)
  const fleetingCount = count(/\bany\b/, content)

  const hasNoFading = fadingCount === 0
  const hasNoFleeting = fleetingCount === 0
  const hasNoVanishing = !has(/\beval\b/, content)
  const hasNoDying = !has(/\bdebugger\b/, content)
  const hasHighSustainability = sustainability >= 70

  let fire: FireGrade
  if (sustainability >= 85) fire = 'eternal-fire'
  else if (sustainability >= 70) fire = 'long-burning'
  else if (sustainability >= 55) fire = 'proper-flame'
  else if (sustainability >= 40) fire = 'fading-ember'
  else if (sustainability >= 25) fire = 'brief-spark'
  else fire = 'cold-stone'

  return {
    sustainability, fire, hasHighSustainability, hasLasting, hasEnduring, hasNoFading,
    hasSustainable, hasNoFleeting, hasPersistent, hasNoVanishing, hasSteady,
    hasNoDying, hasPerpetual, fadingCount, fleetingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify ruby condition
 * @example
 * classifyRubyCondition(90) // 'pigeon-blood-ruby'
 */
export function classifyRubyCondition(score: number): RubyCondition {
  if (score >= 85) return 'pigeon-blood-ruby'
  if (score >= 70) return 'burma-ruby'
  if (score >= 55) return 'proper-ruby'
  if (score >= 40) return 'pink-sapphire'
  if (score >= 25) return 'garnet-imitation'
  return 'glass-fake'
}

/**
 * Classify mine type
 * @example
 * classifyMineType(gems) // 'burma-mine'
 */
export function classifyMineType(gems: RubyGem[]): MineType {
  if (gems.length === 0) return 'no-deposit'
  const avgQs = Math.round(gems.reduce((s, g) => s + g.qualityScore, 0) / gems.length)
  const pigeonRatio = gems.filter(g => g.condition === 'pigeon-blood-ruby').length / gems.length
  if (avgQs >= 75 && pigeonRatio >= 0.5) return 'burma-mine'
  if (avgQs >= 60) return 'thai-mine'
  if (avgQs >= 45) return 'proper-deposit'
  if (avgQs >= 30) return 'secondary-deposit'
  if (avgQs >= 15) return 'surface-find'
  return 'no-deposit'
}

/**
 * Classify mine condition
 * @example
 * classifyMineCondition(80) // 'premium-vein'
 */
export function classifyMineCondition(avgQs: number): MineCondition {
  if (avgQs >= 75) return 'premium-vein'
  if (avgQs >= 60) return 'rich-seam'
  if (avgQs >= 45) return 'decent-yield'
  if (avgQs >= 30) return 'low-grade'
  if (avgQs >= 15) return 'exhausted'
  return 'barren'
}

/**
 * Classify jeweler grade
 * @example
 * classifyJewelerGrade(85) // 'master-jeweler'
 */
export function classifyJewelerGrade(avgFire: number): JewelerGrade {
  if (avgFire >= 80) return 'master-jeweler'
  if (avgFire >= 65) return 'ruby-expert'
  if (avgFire >= 50) return 'skilled-gemologist'
  if (avgFire >= 35) return 'appraiser'
  if (avgFire >= 20) return 'novice'
  return 'bauble-seller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(gems, mines, treasury, stats)
 */
export function generateRecommendations(
  gems: RubyGem[],
  mines: RubyMine[],
  treasury: TreasurySummary,
  stats: RubyHeartStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPassionIntensity < 50) {
    recs.push('Increase passion intensity with dedicated exports, thorough return types, and passionate interface designs')
  }
  if (stats.avgColorDepth < 50) {
    recs.push('Deepen color with profound doc comments, rich interfaces, and layered readonly patterns')
  }
  if (stats.avgInclusionPurity < 50) {
    recs.push('Purify inclusions with clean return types, pure readonly guards, and clear type definitions')
  }
  if (stats.avgHardnessGrade < 50) {
    recs.push('Harden grade with robust private access, durable strict equality, and tough interface guards')
  }
  if (stats.avgFireSustainability < 50) {
    recs.push('Sustain fire with lasting named exports, enduring interfaces, and persistent class designs')
  }
  if (stats.glassFakeCount > 0) {
    recs.push(`${stats.glassFakeCount} file(s) are glass fakes — consider significant refactoring`)
  }
  if (treasury.overallFire < 40) {
    recs.push('Overall ruby fire is poor — focus on passion intensity and hardness first')
  }
  const allBarren = mines.every(m => m.mineType === 'no-deposit' || m.mineType === 'surface-find')
  if (allBarren && mines.length > 0) {
    recs.push('All mines are surface finds or barren — consider a major quality overhaul')
  }
  const fakes = gems.filter(g => g.condition === 'glass-fake').map(g => g.file)
  if (fakes.length > 0 && fakes.length <= 3) {
    recs.push(`Transform these glass fakes into rubies: ${fakes.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your ruby collection is museum-quality! Every gem radiates with passionate fire')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as ruby gem
 * @example
 * const gem = analyzeRubyGem(content, 'index.ts')
 * console.log(gem.condition) // 'pigeon-blood-ruby'
 */
export function analyzeRubyGem(content: string, filePath: string): RubyGem {
  const intensifying = measureIntensifying(content)
  const deepening = measureDeepening(content)
  const purifying = measurePurifying(content)
  const hardening = measureHardening(content)
  const sustaining = measureSustaining(content)

  const qualityScore = Math.round(
    intensifying.intensity * 0.2 +
    deepening.depth * 0.2 +
    purifying.purity * 0.2 +
    hardening.grade * 0.2 +
    sustaining.sustainability * 0.2,
  )

  return {
    file: filePath,
    passionIntensity: intensifying.intensity,
    colorDepth: deepening.depth,
    inclusionPurity: purifying.purity,
    hardnessGrade: hardening.grade,
    fireSustainability: sustaining.sustainability,
    intensifying,
    deepening,
    purifying,
    hardening,
    sustaining,
    condition: classifyRubyCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a ruby mine
 * @example
 * const mine = analyzeRubyMine(gems, 'src')
 * console.log(mine.mineType) // 'burma-mine'
 */
export function analyzeRubyMine(gems: RubyGem[], dirPath: string): RubyMine {
  if (gems.length === 0) {
    return {
      directory: dirPath, gems: [], avgIntensity: 0, avgDepth: 0, avgHardness: 0,
      pigeonBloodRubyCount: 0, glassFakeCount: 0, mineType: 'no-deposit', condition: 'barren',
    }
  }

  const avgIntensity = Math.round(gems.reduce((s, g) => s + g.passionIntensity, 0) / gems.length)
  const avgDepth = Math.round(gems.reduce((s, g) => s + g.colorDepth, 0) / gems.length)
  const avgHardness = Math.round(gems.reduce((s, g) => s + g.hardnessGrade, 0) / gems.length)
  const pigeonBloodRubyCount = gems.filter(g => g.condition === 'pigeon-blood-ruby').length
  const glassFakeCount = gems.filter(g => g.condition === 'glass-fake').length
  const avgQs = Math.round(gems.reduce((s, g) => s + g.qualityScore, 0) / gems.length)

  return {
    directory: dirPath, gems, avgIntensity, avgDepth, avgHardness,
    pigeonBloodRubyCount, glassFakeCount, mineType: classifyMineType(gems),
    condition: classifyMineCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete ruby heart result
 * @example
 * const result = await buildRubyHeartResult(files, contents)
 * console.log(result.stats.jewelerGrade) // 'master-jeweler'
 */
export async function buildRubyHeartResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyHeartResult> {
  const gems = files.map((file, i) => analyzeRubyGem(contents[i] ?? '', file))

  const dirMap = new Map<string, RubyGem[]>()
  for (const gem of gems) {
    const dir = path.dirname(gem.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(gem) } else { dirMap.set(dir, [gem]) }
  }

  const mines = Array.from(dirMap.entries()).map(([dir, dirGems]) =>
    analyzeRubyMine(dirGems, dir),
  )

  const avgIntensity = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.passionIntensity, 0) / gems.length) : 0
  const avgDepth = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.colorDepth, 0) / gems.length) : 0
  const avgHardness = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.hardnessGrade, 0) / gems.length) : 0

  const overallFire = gems.length > 0
    ? Math.round((avgIntensity + avgDepth + avgHardness) / 3) : 0
  const isPrecious = avgIntensity >= 60

  const treasury: TreasurySummary = { avgIntensity, avgDepth, avgHardness, isPrecious, overallFire }

  const avgInclusionPurity = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.inclusionPurity, 0) / gems.length) : 0
  const avgFireSustainability = gems.length > 0
    ? Math.round(gems.reduce((s, g) => s + g.fireSustainability, 0) / gems.length) : 0

  const bestGem = gems.length > 0
    ? gems.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file : ''
  const mostIntense = gems.length > 0
    ? gems.reduce((best, g) => g.passionIntensity > best.passionIntensity ? g : best).file : ''
  const deepest = gems.length > 0
    ? gems.reduce((best, g) => g.colorDepth > best.colorDepth ? g : best).file : ''
  const purest = gems.length > 0
    ? gems.reduce((best, g) => g.inclusionPurity > best.inclusionPurity ? g : best).file : ''
  const hardest = gems.length > 0
    ? gems.reduce((best, g) => g.hardnessGrade > best.hardnessGrade ? g : best).file : ''

  const stats: RubyHeartStats = {
    totalFiles: gems.length,
    totalMines: mines.length,
    avgPassionIntensity: avgIntensity,
    avgColorDepth: avgDepth,
    avgInclusionPurity,
    avgHardnessGrade: avgHardness,
    avgFireSustainability,
    pigeonBloodRubyCount: gems.filter(g => g.condition === 'pigeon-blood-ruby').length,
    burmaRubyCount: gems.filter(g => g.condition === 'burma-ruby').length,
    properRubyCount: gems.filter(g => g.condition === 'proper-ruby').length,
    pinkSapphireCount: gems.filter(g => g.condition === 'pink-sapphire').length,
    garnetImitationCount: gems.filter(g => g.condition === 'garnet-imitation').length,
    glassFakeCount: gems.filter(g => g.condition === 'glass-fake').length,
    hasHighIntensityCount: gems.filter(g => g.intensifying.hasHighIntensity).length,
    hasHighDepthCount: gems.filter(g => g.deepening.hasHighDepth).length,
    hasHighPurityCount: gems.filter(g => g.purifying.hasHighPurity).length,
    hasHighGradeCount: gems.filter(g => g.hardening.hasHighGrade).length,
    hasHighSustainabilityCount: gems.filter(g => g.sustaining.hasHighSustainability).length,
    overallFire,
    jewelerGrade: classifyJewelerGrade(overallFire),
    bestGem, mostIntense, deepest, purest, hardest,
  }

  const recommendations = generateRecommendations(gems, mines, treasury, stats)

  return { gems, mines, treasury, stats, recommendations }
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
