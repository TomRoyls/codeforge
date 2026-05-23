// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Illumination grade */
export type IlluminationGrade =
  | 'lighthouse-beam'
  | 'bright-flame'
  | 'proper-glow'
  | 'dim-light'
  | 'flickering'
  | 'dark'

/** Wind resistance grade */
export type WindGrade =
  | 'hurricane-proof'
  | 'storm-resistant'
  | 'proper-shield'
  | 'blown-out'
  | 'flickering-wildly'
  | 'extinguished'

/** Fuel efficiency grade */
export type FuelGrade =
  | 'perpetual-flame'
  | 'efficient-burn'
  | 'proper-consumption'
  | 'wasteful-burn'
  | 'guzzling'
  | 'empty-tank'

/** Glass clarity grade */
export type GlassGrade =
  | 'crystal-clear'
  | 'clean-glass'
  | 'proper-lens'
  | 'foggy-glass'
  | 'smudged'
  | 'opaque'

/** Beacon range grade */
export type BeaconGrade =
  | 'lighthouse-range'
  | 'far-beacon'
  | 'proper-range'
  | 'short-range'
  | 'dim-bulb'
  | 'no-signal'

/** Lantern condition */
export type LanternCondition =
  | 'eternal-flame'
  | 'bright-lantern'
  | 'proper-light'
  | 'dying-ember'
  | 'smoking-wick'
  | 'darkness'

/** Station type */
export type StationType =
  | 'lighthouse'
  | 'watchtower'
  | 'lamp-post'
  | 'candle-holder'
  | 'match-stick'
  | 'no-light'

/** Station condition */
export type StationCondition =
  | 'blazing-station'
  | 'well-lit'
  | 'decent-light'
  | 'dim-corner'
  | 'dark-alley'
  | 'blackout'

/** Keeper grade */
export type KeeperGrade =
  | 'lighthouse-keeper'
  | 'lamp-lighter'
  | 'watchman'
  | 'candle-maker'
  | 'match-girl'
  | 'dark-dweller'

/** Illuminating measurement */
export interface IlluminatingMeasure {
  strength: number
  grade: IlluminationGrade
  hasHighStrength: boolean
  hasDocumented: boolean
  hasClear: boolean
  hasNoUndocumented: boolean
  hasIlluminating: boolean
  hasNoObscure: boolean
  hasExplained: boolean
  hasNoCryptic: boolean
  hasRevealing: boolean
  hasNoHidden: boolean
  hasEnlightening: boolean
  undocumentedCount: number
  obscureCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resistance: number
  wind: WindGrade
  hasHighResistance: boolean
  hasResilient: boolean
  hasSturdy: boolean
  hasNoFragile: boolean
  hasHardened: boolean
  hasNoVulnerable: boolean
  hasProtected: boolean
  hasNoExposed: boolean
  hasGuarded: boolean
  hasNoUnguarded: boolean
  hasSafe: boolean
  fragileCount: number
  vulnerableCount: number
}

/** Optimizing measurement */
export interface OptimizingMeasure {
  efficiency: number
  fuel: FuelGrade
  hasHighEfficiency: boolean
  hasEfficient: boolean
  hasOptimized: boolean
  hasNoWasteful: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasEconomical: boolean
  hasNoExcessive: boolean
  hasMinimal: boolean
  hasNoRedundant: boolean
  hasStreamlined: boolean
  wastefulCount: number
  bloatedCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  clarity: number
  glass: GlassGrade
  hasHighClarity: boolean
  hasTransparent: boolean
  hasClear: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoClouded: boolean
  hasOpen: boolean
  hasNoMisty: boolean
  hasUnobscured: boolean
  hasNoBlurred: boolean
  hasLucid: boolean
  opaqueCount: number
  cloudedCount: number
}

/** Reaching measurement */
export interface ReachingMeasure {
  range: number
  beacon: BeaconGrade
  hasHighRange: boolean
  hasImpactful: boolean
  hasBroadReach: boolean
  hasNoNarrow: boolean
  hasSignificant: boolean
  hasNoTrivial: boolean
  hasFarReaching: boolean
  hasNoLimited: boolean
  hasSubstantial: boolean
  hasNoMarginal: boolean
  hasMeaningful: boolean
  narrowCount: number
  trivialCount: number
}

/** Single file analysis */
export interface LanternLight {
  file: string
  illuminationStrength: number
  windResistance: number
  fuelEfficiency: number
  glassClarity: number
  beaconRange: number
  illuminating: IlluminatingMeasure
  resisting: ResistingMeasure
  optimizing: OptimizingMeasure
  clarifying: ClarifyingMeasure
  reaching: ReachingMeasure
  condition: LanternCondition
  qualityScore: number
}

/** Directory-level station */
export interface LanternStation {
  directory: string
  lights: LanternLight[]
  avgIllumination: number
  avgResistance: number
  avgEfficiency: number
  eternalFlameCount: number
  darknessCount: number
  stationType: StationType
  condition: StationCondition
}

/** Network summary */
export interface NetworkSummary {
  avgIllumination: number
  avgResistance: number
  avgEfficiency: number
  isLit: boolean
  overallBrightness: number
}

/** Full stats */
export interface StormLanternStats {
  totalFiles: number
  totalStations: number
  avgIlluminationStrength: number
  avgWindResistance: number
  avgFuelEfficiency: number
  avgGlassClarity: number
  avgBeaconRange: number
  eternalFlameCount: number
  brightLanternCount: number
  properLightCount: number
  dyingEmberCount: number
  smokingWickCount: number
  darknessCount: number
  hasHighStrengthCount: number
  hasHighResistanceCount: number
  hasHighEfficiencyCount: number
  hasHighClarityCount: number
  hasHighRangeCount: number
  overallBrightness: number
  keeperGrade: KeeperGrade
  bestLight: string
  brightest: string
  mostResistant: string
  mostEfficient: string
  clearest: string
}

/** Full result */
export interface StormLanternResult {
  lights: LanternLight[]
  stations: LanternStation[]
  network: NetworkSummary
  stats: StormLanternStats
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
 * Measure illumination strength (documentation/clarity)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.grade) // 'lighthouse-beam'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasDocumented = hasDocComments(content) && hasReturnType(content)
  const hasClear = hasStrictEq(content) && hasReturnType(content)
  const hasIlluminating = hasInterface(content) && hasGenerics(content)
  const hasExplained = hasTypeAlias(content) && hasReadonly(content)
  const hasRevealing = hasPrivate(content) && hasConst(content)
  const hasEnlightening = hasClass(content) && hasDocComments(content)

  score += hasDocumented ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasIlluminating ? 5 : 0
  score += hasExplained ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasEnlightening ? 5 : 0

  const strength = Math.min(score, 100)
  const undocumentedCount = count(/\bvar\b/, content)
  const obscureCount = count(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoObscure = obscureCount === 0
  const hasNoCryptic = !has(/\beval\b/, content)
  const hasNoHidden = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let grade: IlluminationGrade
  if (strength >= 85) grade = 'lighthouse-beam'
  else if (strength >= 70) grade = 'bright-flame'
  else if (strength >= 55) grade = 'proper-glow'
  else if (strength >= 40) grade = 'dim-light'
  else if (strength >= 25) grade = 'flickering'
  else grade = 'dark'

  return {
    strength, grade, hasHighStrength, hasDocumented, hasClear, hasNoUndocumented,
    hasIlluminating, hasNoObscure, hasExplained, hasNoCryptic, hasRevealing,
    hasNoHidden, hasEnlightening, undocumentedCount, obscureCount,
  }
}

/**
 * Measure wind resistance (error handling)
 * @example
 * const m = measureResisting(content)
 * console.log(m.wind) // 'hurricane-proof'
 */
export function measureResisting(content: string): ResistingMeasure {
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

  const hasResilient = hasPrivate(content) && hasReadonly(content)
  const hasSturdy = hasStrictEq(content) && hasReturnType(content)
  const hasHardened = hasInterface(content) && hasGenerics(content)
  const hasProtected = hasClass(content) && hasAsync(content)
  const hasGuarded = hasExport(content) && hasImport(content)
  const hasSafe = hasPrivate(content) && hasGenerics(content)

  score += hasResilient ? 5 : 0
  score += hasSturdy ? 5 : 0
  score += hasHardened ? 5 : 0
  score += hasProtected ? 5 : 0
  score += hasGuarded ? 5 : 0
  score += hasSafe ? 5 : 0

  const resistance = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const vulnerableCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoVulnerable = vulnerableCount === 0
  const hasNoExposed = !has(/\beval\b/, content)
  const hasNoUnguarded = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let wind: WindGrade
  if (resistance >= 85) wind = 'hurricane-proof'
  else if (resistance >= 70) wind = 'storm-resistant'
  else if (resistance >= 55) wind = 'proper-shield'
  else if (resistance >= 40) wind = 'blown-out'
  else if (resistance >= 25) wind = 'flickering-wildly'
  else wind = 'extinguished'

  return {
    resistance, wind, hasHighResistance, hasResilient, hasSturdy, hasNoFragile,
    hasHardened, hasNoVulnerable, hasProtected, hasNoExposed, hasGuarded,
    hasNoUnguarded, hasSafe, fragileCount, vulnerableCount,
  }
}

/**
 * Measure fuel efficiency (resource efficiency)
 * @example
 * const m = measureOptimizing(content)
 * console.log(m.fuel) // 'perpetual-flame'
 */
export function measureOptimizing(content: string): OptimizingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasEfficient = hasExport(content) && hasImport(content)
  const hasOptimized = hasReturnType(content) && hasStrictEq(content)
  const hasLean = hasInterface(content) && hasGenerics(content)
  const hasEconomical = hasTypeAlias(content) && hasConst(content)
  const hasMinimal = hasReadonly(content) && hasPrivate(content)
  const hasStreamlined = hasExport(content) && hasGenerics(content)

  score += hasEfficient ? 5 : 0
  score += hasOptimized ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasEconomical ? 5 : 0
  score += hasMinimal ? 5 : 0
  score += hasStreamlined ? 5 : 0

  const efficiency = Math.min(score, 100)
  const wastefulCount = count(/\bvar\b/, content)
  const bloatedCount = count(/\bany\b/, content)

  const hasNoWasteful = wastefulCount === 0
  const hasNoBloated = bloatedCount === 0
  const hasNoExcessive = !has(/\beval\b/, content)
  const hasNoRedundant = !has(/\bdebugger\b/, content)
  const hasHighEfficiency = efficiency >= 70

  let fuel: FuelGrade
  if (efficiency >= 85) fuel = 'perpetual-flame'
  else if (efficiency >= 70) fuel = 'efficient-burn'
  else if (efficiency >= 55) fuel = 'proper-consumption'
  else if (efficiency >= 40) fuel = 'wasteful-burn'
  else if (efficiency >= 25) fuel = 'guzzling'
  else fuel = 'empty-tank'

  return {
    efficiency, fuel, hasHighEfficiency, hasEfficient, hasOptimized, hasNoWasteful,
    hasLean, hasNoBloated, hasEconomical, hasNoExcessive, hasMinimal, hasNoRedundant,
    hasStreamlined, wastefulCount, bloatedCount,
  }
}

/**
 * Measure glass clarity (transparency)
 * @example
 * const m = measureClarifying(content)
 * console.log(m.glass) // 'crystal-clear'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasTransparent = hasReturnType(content) && hasStrictEq(content)
  const hasClear = hasDocComments(content) && hasInterface(content)
  const hasVisible = hasGenerics(content) && hasTypeAlias(content)
  const hasOpen = hasReadonly(content) && hasPrivate(content)
  const hasUnobscured = hasClass(content) && hasReturnType(content)
  const hasLucid = hasConst(content) && hasStrictEq(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasOpen ? 5 : 0
  score += hasUnobscured ? 5 : 0
  score += hasLucid ? 5 : 0

  const clarity = Math.min(score, 100)
  const opaqueCount = count(/\bvar\b/, content)
  const cloudedCount = count(/\bany\b/, content)

  const hasNoOpaque = opaqueCount === 0
  const hasNoClouded = cloudedCount === 0
  const hasNoMisty = !has(/\beval\b/, content)
  const hasNoBlurred = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let glass: GlassGrade
  if (clarity >= 85) glass = 'crystal-clear'
  else if (clarity >= 70) glass = 'clean-glass'
  else if (clarity >= 55) glass = 'proper-lens'
  else if (clarity >= 40) glass = 'foggy-glass'
  else if (clarity >= 25) glass = 'smudged'
  else glass = 'opaque'

  return {
    clarity, glass, hasHighClarity, hasTransparent, hasClear, hasNoOpaque,
    hasVisible, hasNoClouded, hasOpen, hasNoMisty, hasUnobscured, hasNoBlurred,
    hasLucid, opaqueCount, cloudedCount,
  }
}

/**
 * Measure beacon range (impact/reach)
 * @example
 * const m = measureReaching(content)
 * console.log(m.beacon) // 'lighthouse-range'
 */
export function measureReaching(content: string): ReachingMeasure {
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

  const hasImpactful = hasNamedExport(content) && hasExport(content)
  const hasBroadReach = hasInterface(content) && hasGenerics(content)
  const hasSignificant = hasTypeAlias(content) && hasAsync(content)
  const hasFarReaching = hasImport(content) && hasClass(content)
  const hasSubstantial = hasReturnType(content) && hasDocComments(content)
  const hasMeaningful = hasNamedExport(content) && hasInterface(content)

  score += hasImpactful ? 5 : 0
  score += hasBroadReach ? 5 : 0
  score += hasSignificant ? 5 : 0
  score += hasFarReaching ? 5 : 0
  score += hasSubstantial ? 5 : 0
  score += hasMeaningful ? 5 : 0

  const range = Math.min(score, 100)
  const narrowCount = count(/\bvar\b/, content)
  const trivialCount = count(/\bany\b/, content)

  const hasNoNarrow = narrowCount === 0
  const hasNoTrivial = trivialCount === 0
  const hasNoLimited = !has(/\beval\b/, content)
  const hasNoMarginal = !has(/\bdebugger\b/, content)
  const hasHighRange = range >= 70

  let beacon: BeaconGrade
  if (range >= 85) beacon = 'lighthouse-range'
  else if (range >= 70) beacon = 'far-beacon'
  else if (range >= 55) beacon = 'proper-range'
  else if (range >= 40) beacon = 'short-range'
  else if (range >= 25) beacon = 'dim-bulb'
  else beacon = 'no-signal'

  return {
    range, beacon, hasHighRange, hasImpactful, hasBroadReach, hasNoNarrow,
    hasSignificant, hasNoTrivial, hasFarReaching, hasNoLimited, hasSubstantial,
    hasNoMarginal, hasMeaningful, narrowCount, trivialCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify lantern condition
 * @example
 * classifyLanternCondition(90) // 'eternal-flame'
 */
export function classifyLanternCondition(score: number): LanternCondition {
  if (score >= 85) return 'eternal-flame'
  if (score >= 70) return 'bright-lantern'
  if (score >= 55) return 'proper-light'
  if (score >= 40) return 'dying-ember'
  if (score >= 25) return 'smoking-wick'
  return 'darkness'
}

/**
 * Classify station type
 * @example
 * classifyStationType(lights) // 'lighthouse'
 */
export function classifyStationType(lights: LanternLight[]): StationType {
  if (lights.length === 0) return 'no-light'
  const avgQs = Math.round(lights.reduce((s, l) => s + l.qualityScore, 0) / lights.length)
  const eternalRatio = lights.filter(l => l.condition === 'eternal-flame').length / lights.length
  if (avgQs >= 75 && eternalRatio >= 0.5) return 'lighthouse'
  if (avgQs >= 60) return 'watchtower'
  if (avgQs >= 45) return 'lamp-post'
  if (avgQs >= 30) return 'candle-holder'
  if (avgQs >= 15) return 'match-stick'
  return 'no-light'
}

/**
 * Classify station condition
 * @example
 * classifyStationCondition(80) // 'blazing-station'
 */
export function classifyStationCondition(avgQs: number): StationCondition {
  if (avgQs >= 75) return 'blazing-station'
  if (avgQs >= 60) return 'well-lit'
  if (avgQs >= 45) return 'decent-light'
  if (avgQs >= 30) return 'dim-corner'
  if (avgQs >= 15) return 'dark-alley'
  return 'blackout'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'lighthouse-keeper'
 */
export function classifyKeeperGrade(avgBrightness: number): KeeperGrade {
  if (avgBrightness >= 80) return 'lighthouse-keeper'
  if (avgBrightness >= 65) return 'lamp-lighter'
  if (avgBrightness >= 50) return 'watchman'
  if (avgBrightness >= 35) return 'candle-maker'
  if (avgBrightness >= 20) return 'match-girl'
  return 'dark-dweller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(lights, stations, network, stats)
 */
export function generateRecommendations(
  lights: LanternLight[],
  stations: LanternStation[],
  network: NetworkSummary,
  stats: StormLanternStats,
): string[] {
  const recs: string[] = []
  if (stats.avgIlluminationStrength < 50) {
    recs.push('Increase illumination strength with documentation, return types, and clear type patterns')
  }
  if (stats.avgWindResistance < 50) {
    recs.push('Strengthen wind resistance with private access, readonly properties, and robust error handling')
  }
  if (stats.avgFuelEfficiency < 50) {
    recs.push('Improve fuel efficiency with clean exports, lean imports, and streamlined type annotations')
  }
  if (stats.avgGlassClarity < 50) {
    recs.push('Polish glass clarity with transparent return types, strict equality, and visible interfaces')
  }
  if (stats.avgBeaconRange < 50) {
    recs.push('Extend beacon range with named exports, broad interfaces, and far-reaching async patterns')
  }
  if (stats.darknessCount > 0) {
    recs.push(`${stats.darknessCount} file(s) are in darkness — consider significant refactoring`)
  }
  if (network.overallBrightness < 40) {
    recs.push('Overall lantern brightness is poor — focus on illumination and clarity first')
  }
  const allDark = stations.every(s => s.stationType === 'no-light' || s.stationType === 'match-stick')
  if (allDark && stations.length > 0) {
    recs.push('All stations are match sticks or dark — consider a major quality overhaul')
  }
  const dark = lights.filter(l => l.condition === 'darkness').map(l => l.file)
  if (dark.length > 0 && dark.length <= 3) {
    recs.push(`Relight these dark files into lanterns: ${dark.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your lantern network is blazing bright! Every light guides the way perfectly')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as lantern light
 * @example
 * const light = analyzeLanternLight(content, 'index.ts')
 * console.log(light.condition) // 'eternal-flame'
 */
export function analyzeLanternLight(content: string, filePath: string): LanternLight {
  const illuminating = measureIlluminating(content)
  const resisting = measureResisting(content)
  const optimizing = measureOptimizing(content)
  const clarifying = measureClarifying(content)
  const reaching = measureReaching(content)

  const qualityScore = Math.round(
    illuminating.strength * 0.2 +
    resisting.resistance * 0.2 +
    optimizing.efficiency * 0.2 +
    clarifying.clarity * 0.2 +
    reaching.range * 0.2,
  )

  return {
    file: filePath,
    illuminationStrength: illuminating.strength,
    windResistance: resisting.resistance,
    fuelEfficiency: optimizing.efficiency,
    glassClarity: clarifying.clarity,
    beaconRange: reaching.range,
    illuminating,
    resisting,
    optimizing,
    clarifying,
    reaching,
    condition: classifyLanternCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a lantern station
 * @example
 * const station = analyzeLanternStation(lights, 'src')
 * console.log(station.stationType) // 'lighthouse'
 */
export function analyzeLanternStation(lights: LanternLight[], dirPath: string): LanternStation {
  if (lights.length === 0) {
    return {
      directory: dirPath, lights: [], avgIllumination: 0, avgResistance: 0, avgEfficiency: 0,
      eternalFlameCount: 0, darknessCount: 0, stationType: 'no-light', condition: 'blackout',
    }
  }

  const avgIllumination = Math.round(lights.reduce((s, l) => s + l.illuminationStrength, 0) / lights.length)
  const avgResistance = Math.round(lights.reduce((s, l) => s + l.windResistance, 0) / lights.length)
  const avgEfficiency = Math.round(lights.reduce((s, l) => s + l.fuelEfficiency, 0) / lights.length)
  const eternalFlameCount = lights.filter(l => l.condition === 'eternal-flame').length
  const darknessCount = lights.filter(l => l.condition === 'darkness').length
  const avgQs = Math.round(lights.reduce((s, l) => s + l.qualityScore, 0) / lights.length)

  return {
    directory: dirPath, lights, avgIllumination, avgResistance, avgEfficiency,
    eternalFlameCount, darknessCount, stationType: classifyStationType(lights),
    condition: classifyStationCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete storm lantern result
 * @example
 * const result = await buildStormLanternResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'lighthouse-keeper'
 */
export async function buildStormLanternResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<StormLanternResult> {
  const lights = files.map((file, i) => analyzeLanternLight(contents[i] ?? '', file))

  const dirMap = new Map<string, LanternLight[]>()
  for (const light of lights) {
    const dir = path.dirname(light.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(light) } else { dirMap.set(dir, [light]) }
  }

  const stations = Array.from(dirMap.entries()).map(([dir, dirLights]) =>
    analyzeLanternStation(dirLights, dir),
  )

  const avgIllumination = lights.length > 0
    ? Math.round(lights.reduce((s, l) => s + l.illuminationStrength, 0) / lights.length) : 0
  const avgResistance = lights.length > 0
    ? Math.round(lights.reduce((s, l) => s + l.windResistance, 0) / lights.length) : 0
  const avgEfficiency = lights.length > 0
    ? Math.round(lights.reduce((s, l) => s + l.fuelEfficiency, 0) / lights.length) : 0

  const overallBrightness = lights.length > 0
    ? Math.round((avgIllumination + avgResistance + avgEfficiency) / 3) : 0
  const isLit = avgIllumination >= 60

  const network: NetworkSummary = { avgIllumination, avgResistance, avgEfficiency, isLit, overallBrightness }

  const avgGlassClarity = lights.length > 0
    ? Math.round(lights.reduce((s, l) => s + l.glassClarity, 0) / lights.length) : 0
  const avgBeaconRange = lights.length > 0
    ? Math.round(lights.reduce((s, l) => s + l.beaconRange, 0) / lights.length) : 0

  const bestLight = lights.length > 0
    ? lights.reduce((best, l) => l.qualityScore > best.qualityScore ? l : best).file : ''
  const brightest = lights.length > 0
    ? lights.reduce((best, l) => l.illuminationStrength > best.illuminationStrength ? l : best).file : ''
  const mostResistant = lights.length > 0
    ? lights.reduce((best, l) => l.windResistance > best.windResistance ? l : best).file : ''
  const mostEfficient = lights.length > 0
    ? lights.reduce((best, l) => l.fuelEfficiency > best.fuelEfficiency ? l : best).file : ''
  const clearest = lights.length > 0
    ? lights.reduce((best, l) => l.glassClarity > best.glassClarity ? l : best).file : ''

  const stats: StormLanternStats = {
    totalFiles: lights.length,
    totalStations: stations.length,
    avgIlluminationStrength: avgIllumination,
    avgWindResistance: avgResistance,
    avgFuelEfficiency: avgEfficiency,
    avgGlassClarity,
    avgBeaconRange,
    eternalFlameCount: lights.filter(l => l.condition === 'eternal-flame').length,
    brightLanternCount: lights.filter(l => l.condition === 'bright-lantern').length,
    properLightCount: lights.filter(l => l.condition === 'proper-light').length,
    dyingEmberCount: lights.filter(l => l.condition === 'dying-ember').length,
    smokingWickCount: lights.filter(l => l.condition === 'smoking-wick').length,
    darknessCount: lights.filter(l => l.condition === 'darkness').length,
    hasHighStrengthCount: lights.filter(l => l.illuminating.hasHighStrength).length,
    hasHighResistanceCount: lights.filter(l => l.resisting.hasHighResistance).length,
    hasHighEfficiencyCount: lights.filter(l => l.optimizing.hasHighEfficiency).length,
    hasHighClarityCount: lights.filter(l => l.clarifying.hasHighClarity).length,
    hasHighRangeCount: lights.filter(l => l.reaching.hasHighRange).length,
    overallBrightness,
    keeperGrade: classifyKeeperGrade(overallBrightness),
    bestLight, brightest, mostResistant, mostEfficient, clearest,
  }

  const recommendations = generateRecommendations(lights, stations, network, stats)

  return { lights, stations, network, stats, recommendations }
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
