// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Depth grade */
export type DepthGrade =
  | 'hadal-zone'
  | 'abyssal-plain'
  | 'bathyal-zone'
  | 'mesopelagic'
  | 'epipelagic'
  | 'surface-water'

/** Pressure level */
export type PressureLevel =
  | 'titan-grade'
  | 'deep-submersible'
  | 'proper-hull'
  | 'thin-shell'
  | 'cracking'
  | 'imploded'

/** Luminescence level */
export type LuminescenceLevel =
  | 'angstrom-luminosity'
  | 'bright-glow'
  | 'proper-light'
  | 'dim-glow'
  | 'flicker'
  | 'darkness'

/** Chart quality */
export type ChartQuality =
  | 'detailed-chart'
  | 'good-map'
  | 'proper-navigation'
  | 'sketchy-map'
  | 'lost-at-sea'
  | 'uncharted'

/** Abyssal quality grade */
export type AbyssalGrade =
  | 'pristine-abyss'
  | 'deep-treasure'
  | 'proper-depth'
  | 'murky-bottom'
  | 'toxic-depth'
  | 'dead-zone'

/** Dive condition */
export type DiveCondition =
  | 'mariana-trench'
  | 'deep-abyss'
  | 'mid-depth'
  | 'shallow-waters'
  | 'tidal-pool'
  | 'dry-land'

/** Trench type */
export type TrenchType =
  | 'deep-trench'
  | 'mid-ocean-ridge'
  | 'continental-shelf'
  | 'coastal-waters'
  | 'tidal-zone'
  | 'dry-land'

/** Trench condition */
export type TrenchCondition =
  | 'pristine-depths'
  | 'healthy-ocean'
  | 'fair-waters'
  | 'polluted-depths'
  | 'dead-sea'
  | 'dried-up'

/** Explorer grade */
export type ExplorerGrade =
  | 'deep-sea-explorer'
  | 'submarine-captain'
  | 'marine-biologist'
  | 'diver'
  | 'snorkeler'
  | 'landlubber'

/** Diving measurement */
export interface DivingMeasure {
  depth: number
  grade: DepthGrade
  hasHighDepth: boolean
  hasDeep: boolean
  hasProfound: boolean
  hasNoShallow: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasComplex: boolean
  hasNoSimple: boolean
  hasSubstantive: boolean
  hasNoTrivial: boolean
  hasRich: boolean
  shallowCount: number
  flatCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resilience: number
  pressure: PressureLevel
  hasHighResilience: boolean
  hasSturdy: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasResilient: boolean
  hasNoCrumbly: boolean
  hasTough: boolean
  hasNoWeak: boolean
  hasEnduring: boolean
  hasNoBreaking: boolean
  hasSolid: boolean
  fragileCount: number
  crumblyCount: number
}

/** Glowing measurement */
export interface GlowingMeasure {
  bioluminescence: number
  luminescence: LuminescenceLevel
  hasHighBioluminescence: boolean
  hasIlluminating: boolean
  hasBright: boolean
  hasNoDark: boolean
  hasShining: boolean
  hasNoObscure: boolean
  hasRadiant: boolean
  hasNoDull: boolean
  hasGlowing: boolean
  hasNoMurky: boolean
  hasLuminous: boolean
  darkCount: number
  obscureCount: number
}

/** Mapping measurement */
export interface MappingMeasure {
  quality: number
  chart: ChartQuality
  hasHighQuality: boolean
  hasNavigable: boolean
  hasClear: boolean
  hasNoConfusing: boolean
  hasCharted: boolean
  hasNoUnmapped: boolean
  hasFlowing: boolean
  hasNoBlocked: boolean
  hasDirected: boolean
  hasNoWandering: boolean
  hasStructured: boolean
  confusingCount: number
  unmappedCount: number
}

/** Qualifying measurement */
export interface QualifyingMeasure {
  quality: number
  grade2: AbyssalGrade
  hasHighQuality: boolean
  hasExcellent: boolean
  hasPristine: boolean
  hasNoDegraded: boolean
  hasSuperior: boolean
  hasNoPoor: boolean
  hasHighGrade: boolean
  hasNoLowGrade: boolean
  hasExceptional: boolean
  hasNoMediocre: boolean
  hasOutstanding: boolean
  degradedCount: number
  poorCount: number
}

/** Single file analysis */
export interface AbyssalDive {
  file: string
  depth: number
  pressureResilience: number
  bioluminescence: number
  currentMapping: number
  abyssalQuality: number
  diving: DivingMeasure
  resisting: ResistingMeasure
  glowing: GlowingMeasure
  mapping: MappingMeasure
  qualifying: QualifyingMeasure
  condition: DiveCondition
  qualityScore: number
}

/** Directory-level trench */
export interface TrenchSystem {
  directory: string
  dives: AbyssalDive[]
  avgDepth: number
  avgResilience: number
  avgBioluminescence: number
  marianaTrenchCount: number
  dryLandCount: number
  trenchType: TrenchType
  condition: TrenchCondition
}

/** Ocean summary */
export interface OceanSummary {
  avgDepth: number
  avgResilience: number
  avgBioluminescence: number
  isDeep: boolean
  overallDepth: number
}

/** Full stats */
export interface OceanTrenchStats {
  totalFiles: number
  totalTrenches: number
  avgDepth: number
  avgPressureResilience: number
  avgBioluminescence: number
  avgCurrentMapping: number
  avgAbyssalQuality: number
  marianaTrenchCount: number
  deepAbyssCount: number
  midDepthCount: number
  shallowWatersCount: number
  tidalPoolCount: number
  dryLandCount: number
  hasHighDepthCount: number
  hasHighResilienceCount: number
  hasHighBioluminescenceCount: number
  hasHighQualityMappingCount: number
  hasHighQualityCount: number
  overallDepth: number
  explorerGrade: ExplorerGrade
  bestDive: string
  deepest: string
  mostResilient: string
  brightest: string
  bestMapped: string
}

/** Full result */
export interface OceanTrenchResult {
  dives: AbyssalDive[]
  trenches: TrenchSystem[]
  ocean: OceanSummary
  stats: OceanTrenchStats
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
 * Measure code depth
 * @example
 * const m = measureDiving(content)
 * console.log(m.grade) // 'hadal-zone'
 */
export function measureDiving(content: string): DivingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 10 : 0
  score += hasClass(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasDeep = hasInterface(content) && hasGenerics(content)
  const hasProfound = hasClass(content) && hasAsync(content)
  const hasLayered = hasPrivate(content) && hasReadonly(content)
  const hasComplex = hasReturnType(content) && hasGenerics(content)
  const hasSubstantive = hasExport(content) && hasImport(content)
  const hasRich = hasInterface(content) && hasClass(content)

  score += hasDeep ? 5 : 0
  score += hasProfound ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasComplex ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasRich ? 5 : 0

  const depth = Math.min(score, 100)
  const shallowCount = count(/\bvar\b/, content)
  const flatCount = count(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoFlat = flatCount === 0
  const hasNoSimple = !has(/\beval\b/, content)
  const hasNoTrivial = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grade: DepthGrade
  if (depth >= 85) grade = 'hadal-zone'
  else if (depth >= 70) grade = 'abyssal-plain'
  else if (depth >= 55) grade = 'bathyal-zone'
  else if (depth >= 40) grade = 'mesopelagic'
  else if (depth >= 25) grade = 'epipelagic'
  else grade = 'surface-water'

  return {
    depth, grade, hasHighDepth, hasDeep, hasProfound, hasNoShallow,
    hasLayered, hasNoFlat, hasComplex, hasNoSimple, hasSubstantive,
    hasNoTrivial, hasRich, shallowCount, flatCount,
  }
}

/**
 * Measure pressure resilience
 * @example
 * const m = measureResisting(content)
 * console.log(m.pressure) // 'titan-grade'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasTryCatch(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasOptionalChaining(content) ? 10 : 0
  score += hasNullishCoalescing(content) ? 10 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0

  const hasSturdy = hasTryCatch(content) && hasAsync(content)
  const hasRobust = hasOptionalChaining(content) && hasNullishCoalescing(content)
  const hasResilient = hasStrictEq(content) && hasConst(content)
  const hasTough = hasReadonly(content) && hasReturnType(content)
  const hasEnduring = hasExport(content) && hasInterface(content)
  const hasSolid = hasTryCatch(content) && hasConst(content)

  score += hasSturdy ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasSolid ? 5 : 0

  const resilience = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const crumblyCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoCrumbly = crumblyCount === 0
  const hasNoWeak = !has(/\beval\b/, content)
  const hasNoBreaking = !has(/\bdebugger\b/, content)
  const hasHighResilience = resilience >= 70

  let pressure: PressureLevel
  if (resilience >= 85) pressure = 'titan-grade'
  else if (resilience >= 70) pressure = 'deep-submersible'
  else if (resilience >= 55) pressure = 'proper-hull'
  else if (resilience >= 40) pressure = 'thin-shell'
  else if (resilience >= 25) pressure = 'cracking'
  else pressure = 'imploded'

  return {
    resilience, pressure, hasHighResilience, hasSturdy, hasRobust, hasNoFragile,
    hasResilient, hasNoCrumbly, hasTough, hasNoWeak, hasEnduring, hasNoBreaking,
    hasSolid, fragileCount, crumblyCount,
  }
}

/**
 * Measure bioluminescence
 * @example
 * const m = measureGlowing(content)
 * console.log(m.luminescence) // 'angstrom-luminosity'
 */
export function measureGlowing(content: string): GlowingMeasure {
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

  const hasIlluminating = hasDocComments(content) && hasExport(content)
  const hasBright = hasInterface(content) && hasClass(content)
  const hasShining = hasGenerics(content) && hasTypeAlias(content)
  const hasRadiant = hasNamedExport(content) && hasReturnType(content)
  const hasGlowing = hasAsync(content) && hasDocComments(content)
  const hasLuminous = hasExport(content) && hasGenerics(content)

  score += hasIlluminating ? 5 : 0
  score += hasBright ? 5 : 0
  score += hasShining ? 5 : 0
  score += hasRadiant ? 5 : 0
  score += hasGlowing ? 5 : 0
  score += hasLuminous ? 5 : 0

  const bioluminescence = Math.min(score, 100)
  const darkCount = count(/\bvar\b/, content)
  const obscureCount = count(/\bany\b/, content)

  const hasNoDark = darkCount === 0
  const hasNoObscure = obscureCount === 0
  const hasNoDull = !has(/\beval\b/, content)
  const hasNoMurky = !has(/\bdebugger\b/, content)
  const hasHighBioluminescence = bioluminescence >= 70

  let luminescence: LuminescenceLevel
  if (bioluminescence >= 85) luminescence = 'angstrom-luminosity'
  else if (bioluminescence >= 70) luminescence = 'bright-glow'
  else if (bioluminescence >= 55) luminescence = 'proper-light'
  else if (bioluminescence >= 40) luminescence = 'dim-glow'
  else if (bioluminescence >= 25) luminescence = 'flicker'
  else luminescence = 'darkness'

  return {
    bioluminescence, luminescence, hasHighBioluminescence, hasIlluminating, hasBright,
    hasNoDark, hasShining, hasNoObscure, hasRadiant, hasNoDull, hasGlowing,
    hasNoMurky, hasLuminous, darkCount, obscureCount,
  }
}

/**
 * Measure current mapping quality
 * @example
 * const m = measureMapping(content)
 * console.log(m.chart) // 'detailed-chart'
 */
export function measureMapping(content: string): MappingMeasure {
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

  const hasNavigable = hasConst(content) && hasStrictEq(content)
  const hasClear = hasExport(content) && hasDocComments(content)
  const hasCharted = hasReadonly(content) && hasPrivate(content)
  const hasFlowing = hasInterface(content) && hasTypeAlias(content)
  const hasDirected = hasReturnType(content) && hasGenerics(content)
  const hasStructured = hasConst(content) && hasExport(content)

  score += hasNavigable ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasCharted ? 5 : 0
  score += hasFlowing ? 5 : 0
  score += hasDirected ? 5 : 0
  score += hasStructured ? 5 : 0

  const quality = Math.min(score, 100)
  const confusingCount = count(/\bvar\b/, content)
  const unmappedCount = count(/\bany\b/, content)

  const hasNoConfusing = confusingCount === 0
  const hasNoUnmapped = unmappedCount === 0
  const hasNoBlocked = !has(/\beval\b/, content)
  const hasNoWandering = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let chart: ChartQuality
  if (quality >= 85) chart = 'detailed-chart'
  else if (quality >= 70) chart = 'good-map'
  else if (quality >= 55) chart = 'proper-navigation'
  else if (quality >= 40) chart = 'sketchy-map'
  else if (quality >= 25) chart = 'lost-at-sea'
  else chart = 'uncharted'

  return {
    quality, chart, hasHighQuality, hasNavigable, hasClear, hasNoConfusing,
    hasCharted, hasNoUnmapped, hasFlowing, hasNoBlocked, hasDirected,
    hasNoWandering, hasStructured, confusingCount, unmappedCount,
  }
}

/**
 * Measure abyssal quality
 * @example
 * const m = measureQualifying(content)
 * console.log(m.grade2) // 'pristine-abyss'
 */
export function measureQualifying(content: string): QualifyingMeasure {
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

  const hasExcellent = hasExport(content) && hasImport(content)
  const hasPristine = hasInterface(content) && hasClass(content)
  const hasSuperior = hasGenerics(content) && hasTypeAlias(content)
  const hasHighGrade = hasAsync(content) && hasNamedExport(content)
  const hasExceptional = hasReturnType(content) && hasConst(content)
  const hasOutstanding = hasExport(content) && hasInterface(content)

  score += hasExcellent ? 5 : 0
  score += hasPristine ? 5 : 0
  score += hasSuperior ? 5 : 0
  score += hasHighGrade ? 5 : 0
  score += hasExceptional ? 5 : 0
  score += hasOutstanding ? 5 : 0

  const quality = Math.min(score, 100)
  const degradedCount = count(/\bvar\b/, content)
  const poorCount = count(/\bany\b/, content)

  const hasNoDegraded = degradedCount === 0
  const hasNoPoor = poorCount === 0
  const hasNoLowGrade = !has(/\beval\b/, content)
  const hasNoMediocre = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade2: AbyssalGrade
  if (quality >= 85) grade2 = 'pristine-abyss'
  else if (quality >= 70) grade2 = 'deep-treasure'
  else if (quality >= 55) grade2 = 'proper-depth'
  else if (quality >= 40) grade2 = 'murky-bottom'
  else if (quality >= 25) grade2 = 'toxic-depth'
  else grade2 = 'dead-zone'

  return {
    quality, grade2, hasHighQuality, hasExcellent, hasPristine, hasNoDegraded,
    hasSuperior, hasNoPoor, hasHighGrade, hasNoLowGrade, hasExceptional,
    hasNoMediocre, hasOutstanding, degradedCount, poorCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify dive condition
 * @example
 * classifyDiveCondition(90) // 'mariana-trench'
 */
export function classifyDiveCondition(score: number): DiveCondition {
  if (score >= 85) return 'mariana-trench'
  if (score >= 70) return 'deep-abyss'
  if (score >= 55) return 'mid-depth'
  if (score >= 40) return 'shallow-waters'
  if (score >= 25) return 'tidal-pool'
  return 'dry-land'
}

/**
 * Classify trench type
 * @example
 * classifyTrenchType(dives) // 'deep-trench'
 */
export function classifyTrenchType(dives: AbyssalDive[]): TrenchType {
  if (dives.length === 0) return 'dry-land'
  const avgQs = Math.round(dives.reduce((s, d) => s + d.qualityScore, 0) / dives.length)
  const marianaRatio = dives.filter(d => d.condition === 'mariana-trench').length / dives.length
  if (avgQs >= 75 && marianaRatio >= 0.5) return 'deep-trench'
  if (avgQs >= 60) return 'mid-ocean-ridge'
  if (avgQs >= 45) return 'continental-shelf'
  if (avgQs >= 30) return 'coastal-waters'
  if (avgQs >= 15) return 'tidal-zone'
  return 'dry-land'
}

/**
 * Classify explorer grade
 * @example
 * classifyExplorerGrade(85) // 'deep-sea-explorer'
 */
export function classifyExplorerGrade(avgDepth: number): ExplorerGrade {
  if (avgDepth >= 80) return 'deep-sea-explorer'
  if (avgDepth >= 65) return 'submarine-captain'
  if (avgDepth >= 50) return 'marine-biologist'
  if (avgDepth >= 35) return 'diver'
  if (avgDepth >= 20) return 'snorkeler'
  return 'landlubber'
}

/**
 * Classify trench condition
 * @example
 * classifyTrenchCondition(80) // 'pristine-depths'
 */
export function classifyTrenchCondition(avgQs: number): TrenchCondition {
  if (avgQs >= 75) return 'pristine-depths'
  if (avgQs >= 60) return 'healthy-ocean'
  if (avgQs >= 45) return 'fair-waters'
  if (avgQs >= 30) return 'polluted-depths'
  if (avgQs >= 15) return 'dead-sea'
  return 'dried-up'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(dives, trenches, ocean, stats)
 */
export function generateRecommendations(
  dives: AbyssalDive[],
  trenches: TrenchSystem[],
  ocean: OceanSummary,
  stats: OceanTrenchStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDepth < 50) {
    recs.push('Dive deeper with rich interfaces, generics, and layered abstractions')
  }
  if (stats.avgPressureResilience < 50) {
    recs.push('Strengthen pressure resilience with robust error handling, optional chaining, and null coalescing')
  }
  if (stats.avgBioluminescence < 50) {
    recs.push('Brighten code with documentation, clear exports, and illuminating type signatures')
  }
  if (stats.avgCurrentMapping < 50) {
    recs.push('Map data flows better with strict equality, readonly properties, and clear type paths')
  }
  if (stats.avgAbyssalQuality < 50) {
    recs.push('Improve abyssal quality with balanced module design, impactful interfaces, and visible exports')
  }
  if (stats.dryLandCount > 0) {
    recs.push(`${stats.dryLandCount} file(s) are dry land — consider significant refactoring`)
  }
  if (ocean.overallDepth < 40) {
    recs.push('Overall ocean depth is shallow — focus on code complexity and resilience')
  }
  const allDry = trenches.every(t => t.trenchType === 'dry-land' || t.trenchType === 'tidal-zone')
  if (allDry && trenches.length > 0) {
    recs.push('All trenches are dry — consider a major deep-sea expedition')
  }
  const dryFiles = dives.filter(d => d.condition === 'dry-land').map(d => d.file)
  if (dryFiles.length > 0 && dryFiles.length <= 3) {
    recs.push(`Submerge these shallow files: ${dryFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('440 commands - an ocean trench of code analysis excellence')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as an abyssal dive
 * @example
 * const dive = analyzeAbyssalDive(content, 'index.ts')
 * console.log(dive.condition) // 'mariana-trench'
 */
export function analyzeAbyssalDive(content: string, filePath: string): AbyssalDive {
  const diving = measureDiving(content)
  const resisting = measureResisting(content)
  const glowing = measureGlowing(content)
  const mapping = measureMapping(content)
  const qualifying = measureQualifying(content)

  const qualityScore = Math.round(
    diving.depth * 0.2 +
    resisting.resilience * 0.2 +
    glowing.bioluminescence * 0.2 +
    mapping.quality * 0.2 +
    qualifying.quality * 0.2,
  )

  return {
    file: filePath,
    depth: diving.depth,
    pressureResilience: resisting.resilience,
    bioluminescence: glowing.bioluminescence,
    currentMapping: mapping.quality,
    abyssalQuality: qualifying.quality,
    diving,
    resisting,
    glowing,
    mapping,
    qualifying,
    condition: classifyDiveCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a trench system
 * @example
 * const trench = analyzeTrenchSystem(dives, 'src')
 * console.log(trench.trenchType) // 'deep-trench'
 */
export function analyzeTrenchSystem(dives: AbyssalDive[], dirPath: string): TrenchSystem {
  if (dives.length === 0) {
    return {
      directory: dirPath, dives: [], avgDepth: 0, avgResilience: 0, avgBioluminescence: 0,
      marianaTrenchCount: 0, dryLandCount: 0, trenchType: 'dry-land', condition: 'dried-up',
    }
  }

  const avgDepth = Math.round(dives.reduce((s, d) => s + d.depth, 0) / dives.length)
  const avgResilience = Math.round(dives.reduce((s, d) => s + d.pressureResilience, 0) / dives.length)
  const avgBioluminescence = Math.round(dives.reduce((s, d) => s + d.bioluminescence, 0) / dives.length)
  const marianaTrenchCount = dives.filter(d => d.condition === 'mariana-trench').length
  const dryLandCount = dives.filter(d => d.condition === 'dry-land').length
  const avgQs = Math.round(dives.reduce((s, d) => s + d.qualityScore, 0) / dives.length)

  return {
    directory: dirPath, dives, avgDepth, avgResilience, avgBioluminescence,
    marianaTrenchCount, dryLandCount, trenchType: classifyTrenchType(dives),
    condition: classifyTrenchCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete ocean trench result
 * @example
 * const result = await buildOceanTrenchResult(files, contents)
 * console.log(result.stats.explorerGrade) // 'deep-sea-explorer'
 */
export async function buildOceanTrenchResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OceanTrenchResult> {
  const dives = files.map((file, i) => analyzeAbyssalDive(contents[i] ?? '', file))

  const dirMap = new Map<string, AbyssalDive[]>()
  for (const dive of dives) {
    const dir = path.dirname(dive.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(dive) } else { dirMap.set(dir, [dive]) }
  }

  const trenches = Array.from(dirMap.entries()).map(([dir, dirDives]) =>
    analyzeTrenchSystem(dirDives, dir),
  )

  const avgDepth = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.depth, 0) / dives.length) : 0
  const avgResilience = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.pressureResilience, 0) / dives.length) : 0
  const avgBioluminescence = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.bioluminescence, 0) / dives.length) : 0

  const overallDepth = dives.length > 0
    ? Math.round((avgDepth + avgResilience + avgBioluminescence) / 3) : 0
  const isDeep = avgDepth >= 60

  const ocean: OceanSummary = { avgDepth, avgResilience, avgBioluminescence, isDeep, overallDepth }

  const avgPressureResilience = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.pressureResilience, 0) / dives.length) : 0
  const avgCurrentMapping = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.currentMapping, 0) / dives.length) : 0
  const avgAbyssalQuality = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.abyssalQuality, 0) / dives.length) : 0

  const bestDive = dives.length > 0
    ? dives.reduce((best, d) => d.qualityScore > best.qualityScore ? d : best).file : ''
  const deepest = dives.length > 0
    ? dives.reduce((best, d) => d.depth > best.depth ? d : best).file : ''
  const mostResilient = dives.length > 0
    ? dives.reduce((best, d) => d.pressureResilience > best.pressureResilience ? d : best).file : ''
  const brightest = dives.length > 0
    ? dives.reduce((best, d) => d.bioluminescence > best.bioluminescence ? d : best).file : ''
  const bestMapped = dives.length > 0
    ? dives.reduce((best, d) => d.currentMapping > best.currentMapping ? d : best).file : ''

  const stats: OceanTrenchStats = {
    totalFiles: dives.length,
    totalTrenches: trenches.length,
    avgDepth,
    avgPressureResilience,
    avgBioluminescence,
    avgCurrentMapping,
    avgAbyssalQuality,
    marianaTrenchCount: dives.filter(d => d.condition === 'mariana-trench').length,
    deepAbyssCount: dives.filter(d => d.condition === 'deep-abyss').length,
    midDepthCount: dives.filter(d => d.condition === 'mid-depth').length,
    shallowWatersCount: dives.filter(d => d.condition === 'shallow-waters').length,
    tidalPoolCount: dives.filter(d => d.condition === 'tidal-pool').length,
    dryLandCount: dives.filter(d => d.condition === 'dry-land').length,
    hasHighDepthCount: dives.filter(d => d.diving.hasHighDepth).length,
    hasHighResilienceCount: dives.filter(d => d.resisting.hasHighResilience).length,
    hasHighBioluminescenceCount: dives.filter(d => d.glowing.hasHighBioluminescence).length,
    hasHighQualityMappingCount: dives.filter(d => d.mapping.hasHighQuality).length,
    hasHighQualityCount: dives.filter(d => d.qualifying.hasHighQuality).length,
    overallDepth,
    explorerGrade: classifyExplorerGrade(overallDepth),
    bestDive, deepest, mostResilient, brightest, bestMapped,
  }

  const recommendations = generateRecommendations(dives, trenches, ocean, stats)

  return { dives, trenches, ocean, stats, recommendations }
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
