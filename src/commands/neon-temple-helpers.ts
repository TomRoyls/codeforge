// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type IlluminationGrade = 'blinding-light' | 'bright-neon' | 'proper-glow' | 'dim-bulb' | 'flickering-neon' | 'dark'
export type VibrationGrade = 'electric-energy' | 'vibrant-pulse' | 'proper-hum' | 'dull-buzz' | 'flatline' | 'no-pulse'
export type GlowGrade = 'steady-beam' | 'consistent-glow' | 'proper-light' | 'flickering' | 'intermittent' | 'dark'
export type PrayerGrade = 'divine-message' | 'clear-prayer' | 'proper-intent' | 'mumbled-words' | 'silent-worship' | 'no-prayer'
export type EnergyGrade = 'fusion-reactor' | 'efficient-grid' | 'proper-power' | 'wasteful-bulb' | 'draining-circuit' | 'no-power'
export type PrayerCondition = 'divine-neon' | 'radiant-temple' | 'proper-shrine' | 'dim-sanctuary' | 'dark-chapel' | 'abandoned'
export type GridType = 'neon-megachurch' | 'glowing-temple' | 'proper-shrine' | 'small-alter' | 'dim-corner' | 'no-grid'
export type GridCondition = 'neon-paradise' | 'glowing-city' | 'decent-temple' | 'dim-block' | 'dark-alley' | 'void'
export type PriestGrade = 'high-priest' | 'temple-guardian' | 'skilled-acolyte' | 'apprentice' | 'novice' | 'unbeliever'

export interface IlluminatingMeasure {
  quality: number
  grade: IlluminationGrade
  hasHighQuality: boolean
  hasReadable: boolean
  hasWellFormatted: boolean
  hasNoDense: boolean
  hasHighlighted: boolean
  hasNoBlended: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasSpacious: boolean
  hasNoCluttered: boolean
  hasLuminous: boolean
  denseCount: number
  blendedCount: number
}

export interface VibratingMeasure {
  vibrancy: number
  vibration: VibrationGrade
  hasHighVibrancy: boolean
  hasDynamic: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasResponsive: boolean
  hasNoStatic: boolean
  hasInteractive: boolean
  hasNoPassive: boolean
  hasEngaging: boolean
  hasNoBoring: boolean
  hasEnergetic: boolean
  deadCount: number
  staticCount: number
}

export interface GlowingMeasure {
  consistency: number
  glow: GlowGrade
  hasHighConsistency: boolean
  hasUniformStyle: boolean
  hasConsistentNaming: boolean
  hasNoMixed: boolean
  hasRegularPatterns: boolean
  hasNoRandomVariation: boolean
  hasStableConventions: boolean
  hasNoAdhoc: boolean
  hasPredictable: boolean
  hasNoSurprising: boolean
  hasHarmonious: boolean
  mixedCount: number
  randomVariationCount: number
}

export interface ExpressingMeasure {
  clarity: number
  prayer: PrayerGrade
  hasHighClarity: boolean
  hasClearIntent: boolean
  hasDescriptive: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoUnreadable: boolean
  hasExpressive: boolean
  hasNoVague: boolean
  hasMeaningful: boolean
  hasNoArbitrary: boolean
  hasIntentional: boolean
  crypticCount: number
  unreadableCount: number
}

export interface PoweringMeasure {
  efficiency: number
  energy: EnergyGrade
  hasHighEfficiency: boolean
  hasOptimized: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasCached: boolean
  hasNoRecalculating: boolean
  hasPerformant: boolean
  hasNoSluggish: boolean
  hasEconomical: boolean
  wastefulCount: number
  bloatedCount: number
}

export interface NeonPrayer {
  file: string
  luminosityQuality: number
  structureVibrancy: number
  glowConsistency: number
  prayerClarity: number
  energyEfficiency: number
  illuminating: IlluminatingMeasure
  vibrating: VibratingMeasure
  glowing: GlowingMeasure
  expressing: ExpressingMeasure
  powering: PoweringMeasure
  condition: PrayerCondition
  qualityScore: number
}

export interface TempleGrid {
  directory: string
  prayers: NeonPrayer[]
  avgLuminosity: number
  avgConsistency: number
  avgEfficiency: number
  divineNeonCount: number
  abandonedCount: number
  gridType: GridType
  condition: GridCondition
}

export interface CitySummary {
  avgLuminosity: number
  avgConsistency: number
  avgEfficiency: number
  isRadiant: boolean
  overallBrilliance: number
}

export interface NeonTempleStats {
  totalFiles: number
  totalGrids: number
  avgLuminosityQuality: number
  avgStructureVibrancy: number
  avgGlowConsistency: number
  avgPrayerClarity: number
  avgEnergyEfficiency: number
  divineNeonCount: number
  radiantTempleCount: number
  properShrineCount: number
  dimSanctuaryCount: number
  darkChapelCount: number
  abandonedCount: number
  hasHighLuminosityCount: number
  hasHighVibrancyCount: number
  hasHighConsistencyCount: number
  hasHighClarityCount: number
  hasHighEfficiencyCount: number
  overallBrilliance: number
  priestGrade: PriestGrade
  bestPrayer: string
  brightest: string
  mostVibrant: string
  mostConsistent: string
  mostEfficient: string
}

export interface NeonTempleResult {
  prayers: NeonPrayer[]
  grids: TempleGrid[]
  city: CitySummary
  stats: NeonTempleStats
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
const hasTernary = (c: string) => has(/\?[^?]*:/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure luminosity quality (illuminating)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.grade) // 'blinding-light'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasMapFunction(content) ? 6 : 0

  const hasReadable = hasExport(content) && hasReturnType(content)
  const hasWellFormatted = hasImport(content) && hasExport(content)
  const hasHighlighted = hasDocComments(content) && hasReturnType(content)
  const hasClear = hasNamedExport(content) && hasConst(content)
  const hasSpacious = hasInterface(content) && hasReturnType(content)
  const hasLuminous = hasDocComments(content) && hasExport(content)

  score += hasReadable ? 5 : 0
  score += hasWellFormatted ? 5 : 0
  score += hasHighlighted ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasSpacious ? 5 : 0
  score += hasLuminous ? 5 : 0

  const quality = Math.min(score, 100)
  const denseCount = countMatches(/\bvar\b/, content)
  const blendedCount = countMatches(/\bany\b/, content)

  const hasNoDense = denseCount === 0
  const hasNoBlended = blendedCount === 0
  const hasNoObfuscated = !has(/\beval\b/, content)
  const hasNoCluttered = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: IlluminationGrade
  if (quality >= 85) grade = 'blinding-light'
  else if (quality >= 70) grade = 'bright-neon'
  else if (quality >= 55) grade = 'proper-glow'
  else if (quality >= 40) grade = 'dim-bulb'
  else if (quality >= 25) grade = 'flickering-neon'
  else grade = 'dark'

  return {
    quality, grade, hasHighQuality, hasReadable, hasWellFormatted,
    hasNoDense, hasHighlighted, hasNoBlended, hasClear, hasNoObfuscated,
    hasSpacious, hasNoCluttered, hasLuminous, denseCount, blendedCount,
  }
}

/**
 * Measure structure vibrancy (vibrating)
 * @example
 * const m = measureVibrating(content)
 * console.log(m.vibration) // 'electric-energy'
 */
export function measureVibrating(content: string): VibratingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasMapFunction(content) ? 10 : 0
  score += hasArrowFunction(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasImport(content) ? 6 : 0
  score += hasTernary(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasDynamic = hasAsync(content) && hasMapFunction(content)
  const hasAlive = hasExport(content) && hasImport(content)
  const hasResponsive = hasOptional(content) && hasNullishCoalescing(content)
  const hasInteractive = hasArrowFunction(content) && hasMapFunction(content)
  const hasEngaging = hasGenerics(content) && hasInterface(content)
  const hasEnergetic = hasConditional(content) && hasTernary(content)

  score += hasDynamic ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasInteractive ? 5 : 0
  score += hasEngaging ? 5 : 0
  score += hasEnergetic ? 5 : 0

  const vibrancy = Math.min(score, 100)
  const deadCount = countMatches(/\bvar\b/, content)
  const staticCount = countMatches(/\bany\b/, content)

  const hasNoDead = deadCount === 0
  const hasNoStatic = staticCount === 0
  const hasNoPassive = !has(/\beval\b/, content)
  const hasNoBoring = !has(/\bdebugger\b/, content)
  const hasHighVibrancy = vibrancy >= 70

  let vibration: VibrationGrade
  if (vibrancy >= 85) vibration = 'electric-energy'
  else if (vibrancy >= 70) vibration = 'vibrant-pulse'
  else if (vibrancy >= 55) vibration = 'proper-hum'
  else if (vibrancy >= 40) vibration = 'dull-buzz'
  else if (vibrancy >= 25) vibration = 'flatline'
  else vibration = 'no-pulse'

  return {
    vibrancy, vibration, hasHighVibrancy, hasDynamic, hasAlive, hasNoDead,
    hasResponsive, hasNoStatic, hasInteractive, hasNoPassive, hasEngaging,
    hasNoBoring, hasEnergetic, deadCount, staticCount,
  }
}

/**
 * Measure glow consistency (glowing)
 * @example
 * const m = measureGlowing(content)
 * console.log(m.glow) // 'steady-beam'
 */
export function measureGlowing(content: string): GlowingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasDocComments(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasUnionType(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0

  const hasUniformStyle = hasConst(content) && hasStrictEq(content)
  const hasConsistentNaming = hasNamedExport(content) && hasReturnType(content)
  const hasRegularPatterns = hasExport(content) && hasImport(content)
  const hasStableConventions = hasInterface(content) && hasTypeAlias(content)
  const hasPredictable = hasEnum(content) && hasUnionType(content)
  const hasHarmonious = hasDocComments(content) && hasReturnType(content)

  score += hasUniformStyle ? 5 : 0
  score += hasConsistentNaming ? 5 : 0
  score += hasRegularPatterns ? 5 : 0
  score += hasStableConventions ? 5 : 0
  score += hasPredictable ? 5 : 0
  score += hasHarmonious ? 5 : 0

  const consistency = Math.min(score, 100)
  const mixedCount = countMatches(/\bvar\b/, content)
  const randomVariationCount = countMatches(/\bany\b/, content)

  const hasNoMixed = mixedCount === 0
  const hasNoRandomVariation = randomVariationCount === 0
  const hasNoAdhoc = !has(/\beval\b/, content)
  const hasNoSurprising = !has(/\bdebugger\b/, content)
  const hasHighConsistency = consistency >= 70

  let glow: GlowGrade
  if (consistency >= 85) glow = 'steady-beam'
  else if (consistency >= 70) glow = 'consistent-glow'
  else if (consistency >= 55) glow = 'proper-light'
  else if (consistency >= 40) glow = 'flickering'
  else if (consistency >= 25) glow = 'intermittent'
  else glow = 'dark'

  return {
    consistency, glow, hasHighConsistency, hasUniformStyle, hasConsistentNaming,
    hasNoMixed, hasRegularPatterns, hasNoRandomVariation, hasStableConventions,
    hasNoAdhoc, hasPredictable, hasNoSurprising, hasHarmonious, mixedCount, randomVariationCount,
  }
}

/**
 * Measure prayer clarity (expressing)
 * @example
 * const m = measureExpressing(content)
 * console.log(m.prayer) // 'divine-message'
 */
export function measureExpressing(content: string): ExpressingMeasure {
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
  score += hasStrictEq(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0

  const hasClearIntent = hasDocComments(content) && hasReturnType(content)
  const hasDescriptive = hasNamedExport(content) && hasInterface(content)
  const hasSelfDocumenting = hasReturnType(content) && hasConst(content)
  const hasExpressive = hasInterface(content) && hasGenerics(content)
  const hasMeaningful = hasStrictEq(content) && hasConst(content)
  const hasIntentional = hasReadonly(content) && hasOptional(content)

  score += hasClearIntent ? 5 : 0
  score += hasDescriptive ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasIntentional ? 5 : 0

  const clarity = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const unreadableCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoUnreadable = unreadableCount === 0
  const hasNoVague = !has(/\beval\b/, content)
  const hasNoArbitrary = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let prayer: PrayerGrade
  if (clarity >= 85) prayer = 'divine-message'
  else if (clarity >= 70) prayer = 'clear-prayer'
  else if (clarity >= 55) prayer = 'proper-intent'
  else if (clarity >= 40) prayer = 'mumbled-words'
  else if (clarity >= 25) prayer = 'silent-worship'
  else prayer = 'no-prayer'

  return {
    clarity, prayer, hasHighClarity, hasClearIntent, hasDescriptive, hasNoCryptic,
    hasSelfDocumenting, hasNoUnreadable, hasExpressive, hasNoVague, hasMeaningful,
    hasNoArbitrary, hasIntentional, crypticCount, unreadableCount,
  }
}

/**
 * Measure energy efficiency (powering)
 * @example
 * const m = measurePowering(content)
 * console.log(m.energy) // 'fusion-reactor'
 */
export function measurePowering(content: string): PoweringMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasMapFunction(content) ? 8 : 0
  score += hasArrowFunction(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasDefaultParam(content) ? 6 : 0
  score += hasNullishCoalescing(content) ? 6 : 0
  score += hasConditional(content) ? 6 : 0

  const hasOptimized = hasConst(content) && hasStrictEq(content)
  const hasEfficient = hasMapFunction(content) && hasArrowFunction(content)
  const hasLean = hasReturnType(content) && hasConst(content)
  const hasCached = hasTryCatch(content) && hasAsync(content)
  const hasPerformant = hasMapFunction(content) && hasStrictEq(content)
  const hasEconomical = hasOptional(content) && hasDefaultParam(content)

  score += hasOptimized ? 5 : 0
  score += hasEfficient ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasCached ? 5 : 0
  score += hasPerformant ? 5 : 0
  score += hasEconomical ? 5 : 0

  const efficiency = Math.min(score, 100)
  const wastefulCount = countMatches(/\bvar\b/, content)
  const bloatedCount = countMatches(/\bany\b/, content)

  const hasNoWasteful = wastefulCount === 0
  const hasNoBloated = bloatedCount === 0
  const hasNoRecalculating = !has(/\beval\b/, content)
  const hasNoSluggish = !has(/\bdebugger\b/, content)
  const hasHighEfficiency = efficiency >= 70

  let energy: EnergyGrade
  if (efficiency >= 85) energy = 'fusion-reactor'
  else if (efficiency >= 70) energy = 'efficient-grid'
  else if (efficiency >= 55) energy = 'proper-power'
  else if (efficiency >= 40) energy = 'wasteful-bulb'
  else if (efficiency >= 25) energy = 'draining-circuit'
  else energy = 'no-power'

  return {
    efficiency, energy, hasHighEfficiency, hasOptimized, hasEfficient, hasNoWasteful,
    hasLean, hasNoBloated, hasCached, hasNoRecalculating, hasPerformant, hasNoSluggish,
    hasEconomical, wastefulCount, bloatedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify prayer condition
 * @example
 * classifyPrayerCondition(90) // 'divine-neon'
 */
export function classifyPrayerCondition(score: number): PrayerCondition {
  if (score >= 85) return 'divine-neon'
  if (score >= 70) return 'radiant-temple'
  if (score >= 55) return 'proper-shrine'
  if (score >= 40) return 'dim-sanctuary'
  if (score >= 25) return 'dark-chapel'
  return 'abandoned'
}

/**
 * Classify grid type
 * @example
 * classifyGridType(prayers) // 'neon-megachurch'
 */
export function classifyGridType(prayers: NeonPrayer[]): GridType {
  if (prayers.length === 0) return 'no-grid'
  const avgQs = Math.round(prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length)
  const divineRatio = prayers.filter(p => p.condition === 'divine-neon').length / prayers.length
  if (avgQs >= 75 && divineRatio >= 0.5) return 'neon-megachurch'
  if (avgQs >= 60) return 'glowing-temple'
  if (avgQs >= 45) return 'proper-shrine'
  if (avgQs >= 30) return 'small-alter'
  if (avgQs >= 15) return 'dim-corner'
  return 'no-grid'
}

/**
 * Classify grid condition
 * @example
 * classifyGridCondition(80) // 'neon-paradise'
 */
export function classifyGridCondition(avgQs: number): GridCondition {
  if (avgQs >= 75) return 'neon-paradise'
  if (avgQs >= 60) return 'glowing-city'
  if (avgQs >= 45) return 'decent-temple'
  if (avgQs >= 30) return 'dim-block'
  if (avgQs >= 15) return 'dark-alley'
  return 'void'
}

/**
 * Classify priest grade
 * @example
 * classifyPriestGrade(85) // 'high-priest'
 */
export function classifyPriestGrade(avgBrilliance: number): PriestGrade {
  if (avgBrilliance >= 80) return 'high-priest'
  if (avgBrilliance >= 65) return 'temple-guardian'
  if (avgBrilliance >= 50) return 'skilled-acolyte'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'unbeliever'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(prayers, grids, city, stats)
 */
export function generateRecommendations(
  prayers: NeonPrayer[],
  grids: TempleGrid[],
  city: CitySummary,
  stats: NeonTempleStats,
): string[] {
  const recs: string[] = []
  if (stats.avgLuminosityQuality < 50) {
    recs.push('Boost luminosity quality with documentation, clear exports, and readable formatting')
  }
  if (stats.avgStructureVibrancy < 50) {
    recs.push('Increase structure vibrancy with async patterns, functional composition, and dynamic features')
  }
  if (stats.avgGlowConsistency < 50) {
    recs.push('Steady glow consistency with const, strict equality, and uniform naming conventions')
  }
  if (stats.avgPrayerClarity < 50) {
    recs.push('Sharpen prayer clarity with descriptive types, self-documenting names, and expressive interfaces')
  }
  if (stats.avgEnergyEfficiency < 50) {
    recs.push('Improve energy efficiency with optimized patterns, lean functions, and performant techniques')
  }
  if (stats.abandonedCount > 0) {
    recs.push(`${stats.abandonedCount} file(s) are abandoned — they need complete neon restoration`)
  }
  if (city.overallBrilliance < 40) {
    recs.push('Overall brilliance is low — focus on luminosity and energy efficiency first')
  }
  const allAbandoned = grids.every(g => g.gridType === 'no-grid' || g.gridType === 'dim-corner')
  if (allAbandoned && grids.length > 0) {
    recs.push('All grids are dark — consider a major temple reconstruction')
  }
  const abandonedFiles = prayers.filter(p => p.condition === 'abandoned').map(p => p.file)
  if (abandonedFiles.length > 0 && abandonedFiles.length <= 3) {
    recs.push(`Restore these abandoned files into neon prayers: ${abandonedFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your neon temple achieves high-priest grade! Every prayer illuminates with divine brilliance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as neon prayer
 * @example
 * const p = analyzeNeonPrayer(content, 'index.ts')
 * console.log(p.condition) // 'divine-neon'
 */
export function analyzeNeonPrayer(content: string, filePath: string): NeonPrayer {
  const illuminating = measureIlluminating(content)
  const vibrating = measureVibrating(content)
  const glowing = measureGlowing(content)
  const expressing = measureExpressing(content)
  const powering = measurePowering(content)

  const qualityScore = Math.round(
    illuminating.quality * 0.2 +
    vibrating.vibrancy * 0.2 +
    glowing.consistency * 0.2 +
    expressing.clarity * 0.2 +
    powering.efficiency * 0.2,
  )

  return {
    file: filePath,
    luminosityQuality: illuminating.quality,
    structureVibrancy: vibrating.vibrancy,
    glowConsistency: glowing.consistency,
    prayerClarity: expressing.clarity,
    energyEfficiency: powering.efficiency,
    illuminating,
    vibrating,
    glowing,
    expressing,
    powering,
    condition: classifyPrayerCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as temple grid
 * @example
 * const g = analyzeTempleGrid(prayers, 'src')
 * console.log(g.gridType) // 'neon-megachurch'
 */
export function analyzeTempleGrid(prayers: NeonPrayer[], dirPath: string): TempleGrid {
  if (prayers.length === 0) {
    return {
      directory: dirPath, prayers: [], avgLuminosity: 0, avgConsistency: 0,
      avgEfficiency: 0, divineNeonCount: 0, abandonedCount: 0,
      gridType: 'no-grid', condition: 'void',
    }
  }

  const avgLuminosity = Math.round(prayers.reduce((s, p) => s + p.luminosityQuality, 0) / prayers.length)
  const avgConsistency = Math.round(prayers.reduce((s, p) => s + p.glowConsistency, 0) / prayers.length)
  const avgEfficiency = Math.round(prayers.reduce((s, p) => s + p.energyEfficiency, 0) / prayers.length)
  const divineNeonCount = prayers.filter(p => p.condition === 'divine-neon').length
  const abandonedCount = prayers.filter(p => p.condition === 'abandoned').length
  const avgQs = Math.round(prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length)

  return {
    directory: dirPath, prayers, avgLuminosity, avgConsistency, avgEfficiency,
    divineNeonCount, abandonedCount,
    gridType: classifyGridType(prayers),
    condition: classifyGridCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete neon temple result
 * @example
 * const result = await buildNeonTempleResult(files, contents)
 * console.log(result.stats.priestGrade) // 'high-priest'
 */
export async function buildNeonTempleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<NeonTempleResult> {
  const prayers = files.map((file, i) => analyzeNeonPrayer(contents[i] ?? '', file))

  const dirMap = new Map<string, NeonPrayer[]>()
  for (const prayer of prayers) {
    const dir = path.dirname(prayer.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(prayer) } else { dirMap.set(dir, [prayer]) }
  }

  const grids = Array.from(dirMap.entries()).map(([dir, dirPrayers]) =>
    analyzeTempleGrid(dirPrayers, dir),
  )

  const avgLuminosity = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.luminosityQuality, 0) / prayers.length) : 0
  const avgConsistency = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.glowConsistency, 0) / prayers.length) : 0
  const avgEfficiency = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.energyEfficiency, 0) / prayers.length) : 0

  const overallBrilliance = prayers.length > 0
    ? Math.round((avgLuminosity + avgConsistency + avgEfficiency) / 3) : 0
  const isRadiant = avgLuminosity >= 60

  const city: CitySummary = { avgLuminosity, avgConsistency, avgEfficiency, isRadiant, overallBrilliance }

  const avgStructureVibrancy = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.structureVibrancy, 0) / prayers.length) : 0
  const avgPrayerClarity = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.prayerClarity, 0) / prayers.length) : 0

  const bestPrayer = prayers.length > 0
    ? prayers.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best).file : ''
  const brightest = prayers.length > 0
    ? prayers.reduce((best, p) => p.luminosityQuality > best.luminosityQuality ? p : best).file : ''
  const mostVibrant = prayers.length > 0
    ? prayers.reduce((best, p) => p.structureVibrancy > best.structureVibrancy ? p : best).file : ''
  const mostConsistent = prayers.length > 0
    ? prayers.reduce((best, p) => p.glowConsistency > best.glowConsistency ? p : best).file : ''
  const mostEfficient = prayers.length > 0
    ? prayers.reduce((best, p) => p.energyEfficiency > best.energyEfficiency ? p : best).file : ''

  const stats: NeonTempleStats = {
    totalFiles: prayers.length,
    totalGrids: grids.length,
    avgLuminosityQuality: avgLuminosity,
    avgStructureVibrancy,
    avgGlowConsistency: avgConsistency,
    avgPrayerClarity,
    avgEnergyEfficiency: avgEfficiency,
    divineNeonCount: prayers.filter(p => p.condition === 'divine-neon').length,
    radiantTempleCount: prayers.filter(p => p.condition === 'radiant-temple').length,
    properShrineCount: prayers.filter(p => p.condition === 'proper-shrine').length,
    dimSanctuaryCount: prayers.filter(p => p.condition === 'dim-sanctuary').length,
    darkChapelCount: prayers.filter(p => p.condition === 'dark-chapel').length,
    abandonedCount: prayers.filter(p => p.condition === 'abandoned').length,
    hasHighLuminosityCount: prayers.filter(p => p.illuminating.hasHighQuality).length,
    hasHighVibrancyCount: prayers.filter(p => p.vibrating.hasHighVibrancy).length,
    hasHighConsistencyCount: prayers.filter(p => p.glowing.hasHighConsistency).length,
    hasHighClarityCount: prayers.filter(p => p.expressing.hasHighClarity).length,
    hasHighEfficiencyCount: prayers.filter(p => p.powering.hasHighEfficiency).length,
    overallBrilliance,
    priestGrade: classifyPriestGrade(overallBrilliance),
    bestPrayer, brightest, mostVibrant, mostConsistent, mostEfficient,
  }

  const recommendations = generateRecommendations(prayers, grids, city, stats)

  return { prayers, grids, city, stats, recommendations }
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
