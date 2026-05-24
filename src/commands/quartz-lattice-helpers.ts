// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Crystalline structure grade */
export type CrystalGrade =
  | 'perfect-crystal'
  | 'high-grade-quartz'
  | 'proper-crystal'
  | 'cloudy-quartz'
  | 'fractured-crystal'
  | 'shattered'

/** Facet cut quality */
export type FacetCut =
  | 'brilliant-cut'
  | 'ideal-cut'
  | 'proper-facet'
  | 'rough-cut'
  | 'uncut'
  | 'chipped'

/** Lattice strength type */
export type LatticeType =
  | 'diamond-lattice'
  | 'strong-lattice'
  | 'proper-bonds'
  | 'weak-bonds'
  | 'micro-fractures'
  | 'broken-lattice'

/** Refraction index */
export type RefractionIndex =
  | 'total-internal-reflection'
  | 'high-refraction'
  | 'proper-refraction'
  | 'low-refraction'
  | 'opaque'
  | 'black-body'

/** Piezoelectric response */
export type PiezoResponse =
  | 'hyper-responsive'
  | 'highly-reactive'
  | 'proper-response'
  | 'slow-response'
  | 'delayed'
  | 'inert'

/** Crystal condition */
export type CrystalCondition =
  | 'flawless-gem'
  | 'high-grade-crystal'
  | 'proper-quartz'
  | 'cloudy-mineral'
  | 'cracked-stone'
  | 'gravel'

/** Cave type */
export type CaveType =
  | 'crystal-cathedral'
  | 'geode-chamber'
  | 'quartz-vein'
  | 'rocky-cave'
  | 'gravel-pit'
  | 'empty-shaft'

/** Cave condition */
export type CaveCondition =
  | 'treasure-trove'
  | 'gem-mine'
  | 'quartz-quarry'
  | 'rocky-mine'
  | 'spent-mine'
  | 'caved-in'

/** Gemologist grade */
export type GemologistGrade =
  | 'master-gemologist'
  | 'expert-crystallographer'
  | 'skilled-mineralogist'
  | 'apprentice'
  | 'rock-hound'
  | 'coal-miner'

/** Structuring measurement */
export interface StructuringMeasure {
  regularity: number
  grade: CrystalGrade
  hasHighRegularity: boolean
  hasRegular: boolean
  hasOrdered: boolean
  hasNoDisorder: boolean
  hasSymmetric: boolean
  hasNoAsymmetric: boolean
  hasPeriodic: boolean
  hasNoRandom: boolean
  hasUniform: boolean
  hasNoIrregular: boolean
  hasSystematic: boolean
  disorderCount: number
  asymmetricCount: number
}

/** Faceting measurement */
export interface FacetingMeasure {
  quality: number
  cut: FacetCut
  hasHighQuality: boolean
  hasPolished: boolean
  hasSmooth: boolean
  hasNoRough: boolean
  hasDefined: boolean
  hasNoBlurred: boolean
  hasSharp: boolean
  hasNoDull: boolean
  hasClean: boolean
  hasNoScratched: boolean
  hasPristine: boolean
  roughCount: number
  blurredCount: number
}

/** Strengthening measurement */
export interface StrengtheningMeasure {
  strength: number
  lattice: LatticeType
  hasHighStrength: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasDurable: boolean
  hasNoBrittle: boolean
  hasReinforced: boolean
  hasNoCracked: boolean
  hasStable: boolean
  hasNoUnstable: boolean
  hasResilient: boolean
  fragileCount: number
  brittleCount: number
}

/** Refracting measurement */
export interface RefractingMeasure {
  clarity: number
  index: RefractionIndex
  hasHighClarity: boolean
  hasTransparent: boolean
  hasClear: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasLuminous: boolean
  hasNoDark: boolean
  hasRevealing: boolean
  hasNoConcealing: boolean
  hasBrilliant: boolean
  opaqueCount: number
  hiddenCount: number
}

/** Responding measurement */
export interface RespondingMeasure {
  reactivity: number
  response: PiezoResponse
  hasHighReactivity: boolean
  hasReactive: boolean
  hasResponsive: boolean
  hasNoSluggish: boolean
  hasQuick: boolean
  hasNoSlow: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasEnergetic: boolean
  sluggishCount: number
  slowCount: number
}

/** Single file analysis */
export interface QuartzCrystal {
  file: string
  crystallineStructure: number
  facetQuality: number
  latticeStrength: number
  refractionIndex: number
  piezoelectricResponse: number
  structuring: StructuringMeasure
  faceting: FacetingMeasure
  strengthening: StrengtheningMeasure
  refracting: RefractingMeasure
  responding: RespondingMeasure
  condition: CrystalCondition
  qualityScore: number
}

/** Directory-level cave */
export interface CrystalCave {
  directory: string
  crystals: QuartzCrystal[]
  avgRegularity: number
  avgStrength: number
  avgClarity: number
  flawlessGemCount: number
  gravelCount: number
  caveType: CaveType
  condition: CaveCondition
}

/** Formation summary */
export interface CrystalFormation {
  avgRegularity: number
  avgStrength: number
  avgClarity: number
  isCrystalline: boolean
  overallPurity: number
}

/** Full stats */
export interface QuartzLatticeStats {
  totalFiles: number
  totalCaves: number
  avgCrystallineStructure: number
  avgFacetQuality: number
  avgLatticeStrength: number
  avgRefractionIndex: number
  avgPiezoelectricResponse: number
  flawlessGemCount: number
  highGradeCrystalCount: number
  properQuartzCount: number
  cloudyMineralCount: number
  crackedStoneCount: number
  gravelCount: number
  hasHighRegularityCount: number
  hasHighQualityCount: number
  hasHighStrengthCount: number
  hasHighClarityCount: number
  hasHighReactivityCount: number
  overallPurity: number
  gemologistGrade: GemologistGrade
  bestCrystal: string
  mostRegular: string
  bestFaceted: string
  strongest: string
  clearest: string
}

/** Full result */
export interface QuartzLatticeResult {
  crystals: QuartzCrystal[]
  caves: CrystalCave[]
  formation: CrystalFormation
  stats: QuartzLatticeStats
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
const hasOptionalChaining = (c: string) => has(/\?\./, c)
const hasImport = (c: string) => has(/\bimport\b/, c)
const hasNamedExport = (c: string) => has(/\bexport\s+(?:const|function|class|interface|type)\b/, c)
const hasNullishCoalescing = (c: string) => has(/\?\?/, c)
const hasTypeAlias = (c: string) => has(/\btype\s+[A-Z]/, c)
const hasPrivate = (c: string) => has(/(?:private|#)\b/, c)
const hasReadonly = (c: string) => has(/\breadonly\b/, c)
const hasDocComments = (c: string) => has(/\/\*\*[\s\S]*?\*\//, c)
const hasStrictEq = (c: string) => has(/===/, c)
const hasClass = (c: string) => has(/\bclass\b/, c)
const hasTryCatch = (c: string) => has(/\btry\s*\{/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure crystalline structure regularity
 * @example
 * const m = measureStructuring(content)
 * console.log(m.grade) // 'perfect-crystal'
 */
export function measureStructuring(content: string): StructuringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 8 : 0
  score += hasImport(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasNullishCoalescing(content) ? 8 : 0

  const hasRegular = hasExport(content) && hasImport(content)
  const hasOrdered = hasReturnType(content) && hasConst(content)
  const hasSymmetric = hasGenerics(content) && hasAsync(content)
  const hasPeriodic = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasUniform = hasNamedExport(content) && hasReturnType(content)
  const hasSystematic = hasExport(content) && hasConst(content)

  score += hasRegular ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasSymmetric ? 5 : 0
  score += hasPeriodic ? 5 : 0
  score += hasUniform ? 5 : 0
  score += hasSystematic ? 5 : 0

  const regularity = Math.min(score, 100)
  const disorderCount = count(/\bvar\b/, content)
  const asymmetricCount = count(/\bany\b/, content)

  const hasNoDisorder = disorderCount === 0
  const hasNoAsymmetric = asymmetricCount === 0
  const hasNoRandom = !has(/\beval\b/, content)
  const hasNoIrregular = !has(/\bdebugger\b/, content)
  const hasHighRegularity = regularity >= 70

  let grade: CrystalGrade
  if (regularity >= 85) grade = 'perfect-crystal'
  else if (regularity >= 70) grade = 'high-grade-quartz'
  else if (regularity >= 55) grade = 'proper-crystal'
  else if (regularity >= 40) grade = 'cloudy-quartz'
  else if (regularity >= 25) grade = 'fractured-crystal'
  else grade = 'shattered'

  return {
    regularity, grade, hasHighRegularity, hasRegular, hasOrdered, hasNoDisorder,
    hasSymmetric, hasNoAsymmetric, hasPeriodic, hasNoRandom, hasUniform, hasNoIrregular,
    hasSystematic, disorderCount, asymmetricCount,
  }
}

/**
 * Measure facet quality
 * @example
 * const m = measureFaceting(content)
 * console.log(m.cut) // 'brilliant-cut'
 */
export function measureFaceting(content: string): FacetingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasPolished = hasExport(content) && hasImport(content)
  const hasSmooth = hasInterface(content) && hasClass(content)
  const hasDefined = hasGenerics(content) && hasTypeAlias(content)
  const hasSharp = hasAsync(content) && hasNamedExport(content)
  const hasClean = hasReturnType(content) && hasConst(content)
  const hasPristine = hasExport(content) && hasInterface(content)

  score += hasPolished ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasDefined ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasPristine ? 5 : 0

  const quality = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const blurredCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoBlurred = blurredCount === 0
  const hasNoDull = !has(/\beval\b/, content)
  const hasNoScratched = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let cut: FacetCut
  if (quality >= 85) cut = 'brilliant-cut'
  else if (quality >= 70) cut = 'ideal-cut'
  else if (quality >= 55) cut = 'proper-facet'
  else if (quality >= 40) cut = 'rough-cut'
  else if (quality >= 25) cut = 'uncut'
  else cut = 'chipped'

  return {
    quality, cut, hasHighQuality, hasPolished, hasSmooth, hasNoRough,
    hasDefined, hasNoBlurred, hasSharp, hasNoDull, hasClean, hasNoScratched,
    hasPristine, roughCount, blurredCount,
  }
}

/**
 * Measure lattice strength
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.lattice) // 'diamond-lattice'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasSolid = hasTryCatch(content) && hasAsync(content)
  const hasRobust = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasDurable = hasStrictEq(content) && hasConst(content)
  const hasReinforced = hasInterface(content) && hasReadonly(content)
  const hasStable = hasExport(content) && hasConst(content)
  const hasResilient = hasReturnType(content) && hasTryCatch(content)

  score += hasSolid ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasReinforced ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasResilient ? 5 : 0

  const strength = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBrittle = brittleCount === 0
  const hasNoCracked = !has(/\beval\b/, content)
  const hasNoUnstable = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let lattice: LatticeType
  if (strength >= 85) lattice = 'diamond-lattice'
  else if (strength >= 70) lattice = 'strong-lattice'
  else if (strength >= 55) lattice = 'proper-bonds'
  else if (strength >= 40) lattice = 'weak-bonds'
  else if (strength >= 25) lattice = 'micro-fractures'
  else lattice = 'broken-lattice'

  return {
    strength, lattice, hasHighStrength, hasSolid, hasRobust, hasNoFragile,
    hasDurable, hasNoBrittle, hasReinforced, hasNoCracked, hasStable,
    hasNoUnstable, hasResilient, fragileCount, brittleCount,
  }
}

/**
 * Measure refraction clarity
 * @example
 * const m = measureRefracting(content)
 * console.log(m.index) // 'total-internal-reflection'
 */
export function measureRefracting(content: string): RefractingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasTransparent = hasDocComments(content) && hasExport(content)
  const hasClear = hasInterface(content) && hasClass(content)
  const hasVisible = hasGenerics(content) && hasTypeAlias(content)
  const hasLuminous = hasNamedExport(content) && hasReturnType(content)
  const hasRevealing = hasAsync(content) && hasDocComments(content)
  const hasBrilliant = hasExport(content) && hasGenerics(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasLuminous ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasBrilliant ? 5 : 0

  const clarity = Math.min(score, 100)
  const opaqueCount = count(/\bvar\b/, content)
  const hiddenCount = count(/\bany\b/, content)

  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoDark = !has(/\beval\b/, content)
  const hasNoConcealing = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let index: RefractionIndex
  if (clarity >= 85) index = 'total-internal-reflection'
  else if (clarity >= 70) index = 'high-refraction'
  else if (clarity >= 55) index = 'proper-refraction'
  else if (clarity >= 40) index = 'low-refraction'
  else if (clarity >= 25) index = 'opaque'
  else index = 'black-body'

  return {
    clarity, index, hasHighClarity, hasTransparent, hasClear, hasNoOpaque,
    hasVisible, hasNoHidden, hasLuminous, hasNoDark, hasRevealing, hasNoConcealing,
    hasBrilliant, opaqueCount, hiddenCount,
  }
}

/**
 * Measure piezoelectric response
 * @example
 * const m = measureResponding(content)
 * console.log(m.response) // 'hyper-responsive'
 */
export function measureResponding(content: string): RespondingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasReactive = hasConst(content) && hasStrictEq(content)
  const hasResponsive = hasExport(content) && hasDocComments(content)
  const hasQuick = hasReadonly(content) && hasPrivate(content)
  const hasDynamic = hasInterface(content) && hasTypeAlias(content)
  const hasAlive = hasReturnType(content) && hasGenerics(content)
  const hasEnergetic = hasConst(content) && hasExport(content)

  score += hasReactive ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasQuick ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasEnergetic ? 5 : 0

  const reactivity = Math.min(score, 100)
  const sluggishCount = count(/\bvar\b/, content)
  const slowCount = count(/\bany\b/, content)

  const hasNoSluggish = sluggishCount === 0
  const hasNoSlow = slowCount === 0
  const hasNoStatic = !has(/\beval\b/, content)
  const hasNoDead = !has(/\bdebugger\b/, content)
  const hasHighReactivity = reactivity >= 70

  let response: PiezoResponse
  if (reactivity >= 85) response = 'hyper-responsive'
  else if (reactivity >= 70) response = 'highly-reactive'
  else if (reactivity >= 55) response = 'proper-response'
  else if (reactivity >= 40) response = 'slow-response'
  else if (reactivity >= 25) response = 'delayed'
  else response = 'inert'

  return {
    reactivity, response, hasHighReactivity, hasReactive, hasResponsive,
    hasNoSluggish, hasQuick, hasNoSlow, hasDynamic, hasNoStatic,
    hasAlive, hasNoDead, hasEnergetic, sluggishCount, slowCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify crystal condition
 * @example
 * classifyCrystalCondition(90) // 'flawless-gem'
 */
export function classifyCrystalCondition(score: number): CrystalCondition {
  if (score >= 85) return 'flawless-gem'
  if (score >= 70) return 'high-grade-crystal'
  if (score >= 55) return 'proper-quartz'
  if (score >= 40) return 'cloudy-mineral'
  if (score >= 25) return 'cracked-stone'
  return 'gravel'
}

/**
 * Classify cave type
 * @example
 * classifyCaveType(crystals) // 'crystal-cathedral'
 */
export function classifyCaveType(crystals: QuartzCrystal[]): CaveType {
  if (crystals.length === 0) return 'empty-shaft'
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)
  const flawlessRatio = crystals.filter(c => c.condition === 'flawless-gem').length / crystals.length
  if (avgQs >= 75 && flawlessRatio >= 0.5) return 'crystal-cathedral'
  if (avgQs >= 60) return 'geode-chamber'
  if (avgQs >= 45) return 'quartz-vein'
  if (avgQs >= 30) return 'rocky-cave'
  if (avgQs >= 15) return 'gravel-pit'
  return 'empty-shaft'
}

/**
 * Classify gemologist grade
 * @example
 * classifyGemologistGrade(85) // 'master-gemologist'
 */
export function classifyGemologistGrade(avgPurity: number): GemologistGrade {
  if (avgPurity >= 80) return 'master-gemologist'
  if (avgPurity >= 65) return 'expert-crystallographer'
  if (avgPurity >= 50) return 'skilled-mineralogist'
  if (avgPurity >= 35) return 'apprentice'
  if (avgPurity >= 20) return 'rock-hound'
  return 'coal-miner'
}

/**
 * Classify cave condition
 * @example
 * classifyCaveCondition(80) // 'treasure-trove'
 */
export function classifyCaveCondition(avgQs: number): CaveCondition {
  if (avgQs >= 75) return 'treasure-trove'
  if (avgQs >= 60) return 'gem-mine'
  if (avgQs >= 45) return 'quartz-quarry'
  if (avgQs >= 30) return 'rocky-mine'
  if (avgQs >= 15) return 'spent-mine'
  return 'caved-in'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(crystals, caves, formation, stats)
 */
export function generateRecommendations(
  crystals: QuartzCrystal[],
  caves: CrystalCave[],
  formation: CrystalFormation,
  stats: QuartzLatticeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgCrystallineStructure < 50) {
    recs.push('Improve crystalline structure with clean exports, efficient imports, and regular patterns')
  }
  if (stats.avgFacetQuality < 50) {
    recs.push('Refine facet quality with better module alignment, polished interfaces, and clean exports')
  }
  if (stats.avgLatticeStrength < 50) {
    recs.push('Strengthen lattice bonds with robust error handling, flexible chaining, and resilient patterns')
  }
  if (stats.avgRefractionIndex < 50) {
    recs.push('Improve refraction clarity with clear documentation, visible interfaces, and transparent exports')
  }
  if (stats.avgPiezoelectricResponse < 50) {
    recs.push('Boost piezoelectric response with balanced const usage, measured strictness, and steady typing')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — consider significant refactoring`)
  }
  if (formation.overallPurity < 40) {
    recs.push('Overall purity is low — focus on crystalline structure and facet quality')
  }
  const allGravel = caves.every(c => c.caveType === 'empty-shaft' || c.caveType === 'gravel-pit')
  if (allGravel && caves.length > 0) {
    recs.push('All crystal caves are degraded — consider a major restoration effort')
  }
  const gravel = crystals.filter(c => c.condition === 'gravel').map(c => c.file)
  if (gravel.length > 0 && gravel.length <= 3) {
    recs.push(`Polish these gravel stones: ${gravel.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your quartz lattice is flawless! Every crystal refracts with perfection')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as a quartz crystal
 * @example
 * const crystal = analyzeQuartzCrystal(content, 'index.ts')
 * console.log(crystal.condition) // 'flawless-gem'
 */
export function analyzeQuartzCrystal(content: string, filePath: string): QuartzCrystal {
  const structuring = measureStructuring(content)
  const faceting = measureFaceting(content)
  const strengthening = measureStrengthening(content)
  const refracting = measureRefracting(content)
  const responding = measureResponding(content)

  const qualityScore = Math.round(
    structuring.regularity * 0.2 +
    faceting.quality * 0.2 +
    strengthening.strength * 0.2 +
    refracting.clarity * 0.2 +
    responding.reactivity * 0.2,
  )

  return {
    file: filePath,
    crystallineStructure: structuring.regularity,
    facetQuality: faceting.quality,
    latticeStrength: strengthening.strength,
    refractionIndex: refracting.clarity,
    piezoelectricResponse: responding.reactivity,
    structuring,
    faceting,
    strengthening,
    refracting,
    responding,
    condition: classifyCrystalCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a crystal cave
 * @example
 * const cave = analyzeCrystalCave(crystals, 'src')
 * console.log(cave.caveType) // 'crystal-cathedral'
 */
export function analyzeCrystalCave(crystals: QuartzCrystal[], dirPath: string): CrystalCave {
  if (crystals.length === 0) {
    return {
      directory: dirPath, crystals: [], avgRegularity: 0, avgStrength: 0, avgClarity: 0,
      flawlessGemCount: 0, gravelCount: 0, caveType: 'empty-shaft', condition: 'caved-in',
    }
  }

  const avgRegularity = Math.round(crystals.reduce((s, c) => s + c.crystallineStructure, 0) / crystals.length)
  const avgStrength = Math.round(crystals.reduce((s, c) => s + c.latticeStrength, 0) / crystals.length)
  const avgClarity = Math.round(crystals.reduce((s, c) => s + c.refractionIndex, 0) / crystals.length)
  const flawlessGemCount = crystals.filter(c => c.condition === 'flawless-gem').length
  const gravelCount = crystals.filter(c => c.condition === 'gravel').length
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)

  return {
    directory: dirPath, crystals, avgRegularity, avgStrength, avgClarity,
    flawlessGemCount, gravelCount, caveType: classifyCaveType(crystals),
    condition: classifyCaveCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete quartz lattice result
 * @example
 * const result = await buildQuartzLatticeResult(files, contents)
 * console.log(result.stats.gemologistGrade) // 'master-gemologist'
 */
export async function buildQuartzLatticeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<QuartzLatticeResult> {
  const crystals = files.map((file, i) => analyzeQuartzCrystal(contents[i] ?? '', file))

  const dirMap = new Map<string, QuartzCrystal[]>()
  for (const crystal of crystals) {
    const dir = path.dirname(crystal.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(crystal) } else { dirMap.set(dir, [crystal]) }
  }

  const caves = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeCrystalCave(dirCrystals, dir),
  )

  const avgRegularity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.crystallineStructure, 0) / crystals.length) : 0
  const avgStrength = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.latticeStrength, 0) / crystals.length) : 0
  const avgClarity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.refractionIndex, 0) / crystals.length) : 0

  const overallPurity = crystals.length > 0
    ? Math.round((avgRegularity + avgStrength + avgClarity) / 3) : 0
  const isCrystalline = avgRegularity >= 60

  const formation: CrystalFormation = { avgRegularity, avgStrength, avgClarity, isCrystalline, overallPurity }

  const avgFacetQuality = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.facetQuality, 0) / crystals.length) : 0
  const avgPiezoelectricResponse = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.piezoelectricResponse, 0) / crystals.length) : 0

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const mostRegular = crystals.length > 0
    ? crystals.reduce((best, c) => c.crystallineStructure > best.crystallineStructure ? c : best).file : ''
  const bestFaceted = crystals.length > 0
    ? crystals.reduce((best, c) => c.facetQuality > best.facetQuality ? c : best).file : ''
  const strongest = crystals.length > 0
    ? crystals.reduce((best, c) => c.latticeStrength > best.latticeStrength ? c : best).file : ''
  const clearest = crystals.length > 0
    ? crystals.reduce((best, c) => c.refractionIndex > best.refractionIndex ? c : best).file : ''

  const stats: QuartzLatticeStats = {
    totalFiles: crystals.length,
    totalCaves: caves.length,
    avgCrystallineStructure: avgRegularity,
    avgFacetQuality,
    avgLatticeStrength: avgStrength,
    avgRefractionIndex: avgClarity,
    avgPiezoelectricResponse,
    flawlessGemCount: crystals.filter(c => c.condition === 'flawless-gem').length,
    highGradeCrystalCount: crystals.filter(c => c.condition === 'high-grade-crystal').length,
    properQuartzCount: crystals.filter(c => c.condition === 'proper-quartz').length,
    cloudyMineralCount: crystals.filter(c => c.condition === 'cloudy-mineral').length,
    crackedStoneCount: crystals.filter(c => c.condition === 'cracked-stone').length,
    gravelCount: crystals.filter(c => c.condition === 'gravel').length,
    hasHighRegularityCount: crystals.filter(c => c.structuring.hasHighRegularity).length,
    hasHighQualityCount: crystals.filter(c => c.faceting.hasHighQuality).length,
    hasHighStrengthCount: crystals.filter(c => c.strengthening.hasHighStrength).length,
    hasHighClarityCount: crystals.filter(c => c.refracting.hasHighClarity).length,
    hasHighReactivityCount: crystals.filter(c => c.responding.hasHighReactivity).length,
    overallPurity,
    gemologistGrade: classifyGemologistGrade(overallPurity),
    bestCrystal, mostRegular, bestFaceted, strongest, clearest,
  }

  const recommendations = generateRecommendations(crystals, caves, formation, stats)

  return { crystals, caves, formation, stats, recommendations }
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
