// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Serenity strength grade */
export type SerenityGrade =
  | 'nephrite-strong'
  | 'jadeite-hard'
  | 'proper-strength'
  | 'weak-jade'
  | 'soapstone'
  | 'cracked-jade'

/** Cultural depth grade */
export type CultureGrade =
  | 'imperial-court'
  | 'scholar-garden'
  | 'proper-tradition'
  | 'modern-interpretation'
  | 'shallow-copy'
  | 'no-heritage'

/** Carving precision grade */
export type CraftsmanshipGrade =
  | 'master-carver'
  | 'expert-artisan'
  | 'proper-craft'
  | 'rough-carve'
  | 'amateur-chip'
  | 'uncut-stone'

/** Translucency quality grade */
export type GlowGrade =
  | 'imperial-glow'
  | 'proper-translucency'
  | 'decent-glow'
  | 'cloudy-jade'
  | 'opaque-stone'
  | 'dead-rock'

/** Symbolic wisdom grade */
export type SymbolGrade =
  | 'ancient-sage'
  | 'wise-dragon'
  | 'proper-symbol'
  | 'simple-shape'
  | 'meaningless-mark'
  | 'no-symbol'

/** Jade condition */
export type JadeCondition =
  | 'imperial-jade'
  | 'fine-jadeite'
  | 'proper-nephrite'
  | 'common-jade'
  | 'serpentine'
  | 'river-stone'

/** Temple type */
export type TempleType =
  | 'forbidden-city'
  | 'scholar-garden'
  | 'proper-temple'
  | 'village-shrine'
  | 'garden-rock'
  | 'no-temple'

/** Temple condition */
export type TempleCondition =
  | 'imperial-collection'
  | 'fine-gallery'
  | 'decent-display'
  | 'common-shop'
  | 'flea-market'
  | 'empty'

/** Artisan grade */
export type ArtisanGrade =
  | 'jade-emperor'
  | 'master-artisan'
  | 'skilled-carver'
  | 'apprentice'
  | 'novice'
  | 'stone-mason'

/** Strengthening measurement */
export interface StrengtheningMeasure {
  serenity: number
  grade: SerenityGrade
  hasHighSerenity: boolean
  hasCalm: boolean
  hasSteady: boolean
  hasNoTurbulent: boolean
  hasPeaceful: boolean
  hasNoChaotic: boolean
  hasComposed: boolean
  hasNoFrantic: boolean
  hasSerene: boolean
  hasNoRestless: boolean
  hasTranquil: boolean
  turbulentCount: number
  chaoticCount: number
}

/** Deepening measurement */
export interface DeepeningMeasure {
  depth: number
  culture: CultureGrade
  hasHighDepth: boolean
  hasRich: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasContextual: boolean
  hasNoContextless: boolean
  hasMeaningful: boolean
  hasNoHollow: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasSubstantive: boolean
  shallowCount: number
  contextlessCount: number
}

/** Carving measurement */
export interface CarvingMeasure {
  precision: number
  craftsmanship: CraftsmanshipGrade
  hasHighPrecision: boolean
  hasPrecise: boolean
  hasDetailed: boolean
  hasNoRough: boolean
  hasRefined: boolean
  hasNoSloppy: boolean
  hasSkilled: boolean
  hasNoCareless: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasDelicate: boolean
  roughCount: number
  sloppyCount: number
}

/** Translucency measurement */
export interface TranslucencyMeasure {
  quality: number
  glow: GlowGrade
  hasHighQuality: boolean
  hasTransparent: boolean
  hasClear: boolean
  hasNoOpaque: boolean
  hasLuminous: boolean
  hasNoDark: boolean
  hasGlowing: boolean
  hasNoHidden: boolean
  hasVisible: boolean
  hasNoConcealed: boolean
  hasRevealing: boolean
  opaqueCount: number
  darkCount: number
}

/** Symbolizing measurement */
export interface SymbolizingMeasure {
  wisdom: number
  symbol: SymbolGrade
  hasHighWisdom: boolean
  hasMeaningful: boolean
  hasSymbolic: boolean
  hasNoArbitrary: boolean
  hasExpressive: boolean
  hasNoRandom: boolean
  hasAbstract: boolean
  hasNoConfusing: boolean
  hasRepresentative: boolean
  hasNoOpaque2: boolean
  hasWise: boolean
  arbitraryCount: number
  randomCount: number
}

/** Single file analysis */
export interface JadeCarving {
  file: string
  serenityStrength: number
  culturalDepth: number
  carvingPrecision: number
  translucencyQuality: number
  symbolicWisdom: number
  strengthening: StrengtheningMeasure
  deepening: DeepeningMeasure
  carving: CarvingMeasure
  translucency: TranslucencyMeasure
  symbolizing: SymbolizingMeasure
  condition: JadeCondition
  qualityScore: number
}

/** Directory-level temple */
export interface JadeTemple {
  directory: string
  carvings: JadeCarving[]
  avgSerenity: number
  avgDepth: number
  avgPrecision: number
  imperialJadeCount: number
  riverStoneCount: number
  templeType: TempleType
  condition: TempleCondition
}

/** Dynasty summary */
export interface DynastySummary {
  avgSerenity: number
  avgDepth: number
  avgPrecision: number
  isImperial: boolean
  overallHarmony: number
}

/** Full stats */
export interface JadeTempleStats {
  totalFiles: number
  totalTemples: number
  avgSerenityStrength: number
  avgCulturalDepth: number
  avgCarvingPrecision: number
  avgTranslucencyQuality: number
  avgSymbolicWisdom: number
  imperialJadeCount: number
  fineJadeiteCount: number
  properNephriteCount: number
  commonJadeCount: number
  serpentineCount: number
  riverStoneCount: number
  hasHighSerenityCount: number
  hasHighDepthCount: number
  hasHighPrecisionCount: number
  hasHighQualityCount: number
  hasHighWisdomCount: number
  overallHarmony: number
  artisanGrade: ArtisanGrade
  bestCarving: string
  mostSerene: string
  deepest: string
  mostPrecise: string
  mostLuminous: string
}

/** Full result */
export interface JadeTempleResult {
  carvings: JadeCarving[]
  temples: JadeTemple[]
  dynasty: DynastySummary
  stats: JadeTempleStats
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
 * Measure serenity strength
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.grade) // 'nephrite-strong'
 */
export function measureStrengthening(content: string): StrengtheningMeasure {
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

  const hasCalm = hasExport(content) && hasImport(content)
  const hasSteady = hasPrivate(content) && hasReadonly(content)
  const hasPeaceful = hasInterface(content) && hasClass(content)
  const hasComposed = hasStrictEq(content) && hasReturnType(content)
  const hasSerene = hasGenerics(content) && hasAsync(content)
  const hasTranquil = hasExport(content) && hasGenerics(content)

  score += hasCalm ? 5 : 0
  score += hasSteady ? 5 : 0
  score += hasPeaceful ? 5 : 0
  score += hasComposed ? 5 : 0
  score += hasSerene ? 5 : 0
  score += hasTranquil ? 5 : 0

  const serenity = Math.min(score, 100)
  const turbulentCount = count(/\bvar\b/, content)
  const chaoticCount = count(/\bany\b/, content)

  const hasNoTurbulent = turbulentCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoFrantic = !has(/\beval\b/, content)
  const hasNoRestless = !has(/\bdebugger\b/, content)
  const hasHighSerenity = serenity >= 70

  let grade: SerenityGrade
  if (serenity >= 85) grade = 'nephrite-strong'
  else if (serenity >= 70) grade = 'jadeite-hard'
  else if (serenity >= 55) grade = 'proper-strength'
  else if (serenity >= 40) grade = 'weak-jade'
  else if (serenity >= 25) grade = 'soapstone'
  else grade = 'cracked-jade'

  return {
    serenity, grade, hasHighSerenity, hasCalm, hasSteady, hasNoTurbulent,
    hasPeaceful, hasNoChaotic, hasComposed, hasNoFrantic, hasSerene,
    hasNoRestless, hasTranquil, turbulentCount, chaoticCount,
  }
}

/**
 * Measure cultural depth
 * @example
 * const m = measureDeepening(content)
 * console.log(m.culture) // 'imperial-court'
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

  const hasRich = hasDocComments(content) && hasInterface(content)
  const hasDeep = hasGenerics(content) && hasTypeAlias(content)
  const hasContextual = hasReadonly(content) && hasReturnType(content)
  const hasMeaningful = hasStrictEq(content) && hasPrivate(content)
  const hasLayered = hasConst(content) && hasInterface(content)
  const hasSubstantive = hasClass(content) && hasDocComments(content)

  score += hasRich ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasContextual ? 5 : 0
  score += hasMeaningful ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasSubstantive ? 5 : 0

  const depth = Math.min(score, 100)
  const shallowCount = count(/\bvar\b/, content)
  const contextlessCount = count(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoContextless = contextlessCount === 0
  const hasNoHollow = !has(/\beval\b/, content)
  const hasNoFlat = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let culture: CultureGrade
  if (depth >= 85) culture = 'imperial-court'
  else if (depth >= 70) culture = 'scholar-garden'
  else if (depth >= 55) culture = 'proper-tradition'
  else if (depth >= 40) culture = 'modern-interpretation'
  else if (depth >= 25) culture = 'shallow-copy'
  else culture = 'no-heritage'

  return {
    depth, culture, hasHighDepth, hasRich, hasDeep, hasNoShallow,
    hasContextual, hasNoContextless, hasMeaningful, hasNoHollow,
    hasLayered, hasNoFlat, hasSubstantive, shallowCount, contextlessCount,
  }
}

/**
 * Measure carving precision
 * @example
 * const m = measureCarving(content)
 * console.log(m.craftsmanship) // 'master-carver'
 */
export function measureCarving(content: string): CarvingMeasure {
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

  const hasPrecise = hasNamedExport(content) && hasExport(content)
  const hasDetailed = hasReturnType(content) && hasStrictEq(content)
  const hasRefined = hasInterface(content) && hasGenerics(content)
  const hasSkilled = hasReadonly(content) && hasPrivate(content)
  const hasElegant = hasClass(content) && hasConst(content)
  const hasDelicate = hasNamedExport(content) && hasReturnType(content)

  score += hasPrecise ? 5 : 0
  score += hasDetailed ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasSkilled ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasDelicate ? 5 : 0

  const precision = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const sloppyCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoSloppy = sloppyCount === 0
  const hasNoCareless = !has(/\beval\b/, content)
  const hasNoClunky = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let craftsmanship: CraftsmanshipGrade
  if (precision >= 85) craftsmanship = 'master-carver'
  else if (precision >= 70) craftsmanship = 'expert-artisan'
  else if (precision >= 55) craftsmanship = 'proper-craft'
  else if (precision >= 40) craftsmanship = 'rough-carve'
  else if (precision >= 25) craftsmanship = 'amateur-chip'
  else craftsmanship = 'uncut-stone'

  return {
    precision, craftsmanship, hasHighPrecision, hasPrecise, hasDetailed,
    hasNoRough, hasRefined, hasNoSloppy, hasSkilled, hasNoCareless,
    hasElegant, hasNoClunky, hasDelicate, roughCount, sloppyCount,
  }
}

/**
 * Measure translucency quality
 * @example
 * const m = measureTranslucency(content)
 * console.log(m.glow) // 'imperial-glow'
 */
export function measureTranslucency(content: string): TranslucencyMeasure {
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

  const hasTransparent = hasDocComments(content) && hasInterface(content)
  const hasClear = hasTypeAlias(content) && hasGenerics(content)
  const hasLuminous = hasReturnType(content) && hasReadonly(content)
  const hasGlowing = hasPrivate(content) && hasStrictEq(content)
  const hasVisible = hasConst(content) && hasDocComments(content)
  const hasRevealing = hasClass(content) && hasInterface(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasLuminous ? 5 : 0
  score += hasGlowing ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasRevealing ? 5 : 0

  const quality = Math.min(score, 100)
  const opaqueCount = count(/\bvar\b/, content)
  const darkCount = count(/\bany\b/, content)

  const hasNoOpaque = opaqueCount === 0
  const hasNoDark = darkCount === 0
  const hasNoHidden = !has(/\beval\b/, content)
  const hasNoConcealed = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let glow: GlowGrade
  if (quality >= 85) glow = 'imperial-glow'
  else if (quality >= 70) glow = 'proper-translucency'
  else if (quality >= 55) glow = 'decent-glow'
  else if (quality >= 40) glow = 'cloudy-jade'
  else if (quality >= 25) glow = 'opaque-stone'
  else glow = 'dead-rock'

  return {
    quality, glow, hasHighQuality, hasTransparent, hasClear, hasNoOpaque,
    hasLuminous, hasNoDark, hasGlowing, hasNoHidden, hasVisible,
    hasNoConcealed, hasRevealing, opaqueCount, darkCount,
  }
}

/**
 * Measure symbolic wisdom
 * @example
 * const m = measureSymbolizing(content)
 * console.log(m.symbol) // 'ancient-sage'
 */
export function measureSymbolizing(content: string): SymbolizingMeasure {
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

  const hasMeaningful = hasReturnType(content) && hasStrictEq(content)
  const hasSymbolic = hasReadonly(content) && hasPrivate(content)
  const hasExpressive = hasInterface(content) && hasGenerics(content)
  const hasAbstract = hasTypeAlias(content) && hasDocComments(content)
  const hasRepresentative = hasClass(content) && hasReturnType(content)
  const hasWise = hasConst(content) && hasStrictEq(content)

  score += hasMeaningful ? 5 : 0
  score += hasSymbolic ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasAbstract ? 5 : 0
  score += hasRepresentative ? 5 : 0
  score += hasWise ? 5 : 0

  const wisdom = Math.min(score, 100)
  const arbitraryCount = count(/\bvar\b/, content)
  const randomCount = count(/\bany\b/, content)

  const hasNoArbitrary = arbitraryCount === 0
  const hasNoRandom = randomCount === 0
  const hasNoConfusing = !has(/\beval\b/, content)
  const hasNoOpaque2 = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let symbol: SymbolGrade
  if (wisdom >= 85) symbol = 'ancient-sage'
  else if (wisdom >= 70) symbol = 'wise-dragon'
  else if (wisdom >= 55) symbol = 'proper-symbol'
  else if (wisdom >= 40) symbol = 'simple-shape'
  else if (wisdom >= 25) symbol = 'meaningless-mark'
  else symbol = 'no-symbol'

  return {
    wisdom, symbol, hasHighWisdom, hasMeaningful, hasSymbolic, hasNoArbitrary,
    hasExpressive, hasNoRandom, hasAbstract, hasNoConfusing, hasRepresentative,
    hasNoOpaque2, hasWise, arbitraryCount, randomCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify jade condition
 * @example
 * classifyJadeCondition(90) // 'imperial-jade'
 */
export function classifyJadeCondition(score: number): JadeCondition {
  if (score >= 85) return 'imperial-jade'
  if (score >= 70) return 'fine-jadeite'
  if (score >= 55) return 'proper-nephrite'
  if (score >= 40) return 'common-jade'
  if (score >= 25) return 'serpentine'
  return 'river-stone'
}

/**
 * Classify temple type
 * @example
 * classifyTempleType(carvings) // 'forbidden-city'
 */
export function classifyTempleType(carvings: JadeCarving[]): TempleType {
  if (carvings.length === 0) return 'no-temple'
  const avgQs = Math.round(carvings.reduce((s, c) => s + c.qualityScore, 0) / carvings.length)
  const imperialRatio = carvings.filter(c => c.condition === 'imperial-jade').length / carvings.length
  if (avgQs >= 75 && imperialRatio >= 0.5) return 'forbidden-city'
  if (avgQs >= 60) return 'scholar-garden'
  if (avgQs >= 45) return 'proper-temple'
  if (avgQs >= 30) return 'village-shrine'
  if (avgQs >= 15) return 'garden-rock'
  return 'no-temple'
}

/**
 * Classify temple condition
 * @example
 * classifyTempleCondition(80) // 'imperial-collection'
 */
export function classifyTempleCondition(avgQs: number): TempleCondition {
  if (avgQs >= 75) return 'imperial-collection'
  if (avgQs >= 60) return 'fine-gallery'
  if (avgQs >= 45) return 'decent-display'
  if (avgQs >= 30) return 'common-shop'
  if (avgQs >= 15) return 'flea-market'
  return 'empty'
}

/**
 * Classify artisan grade
 * @example
 * classifyArtisanGrade(85) // 'jade-emperor'
 */
export function classifyArtisanGrade(avgHarmony: number): ArtisanGrade {
  if (avgHarmony >= 80) return 'jade-emperor'
  if (avgHarmony >= 65) return 'master-artisan'
  if (avgHarmony >= 50) return 'skilled-carver'
  if (avgHarmony >= 35) return 'apprentice'
  if (avgHarmony >= 20) return 'novice'
  return 'stone-mason'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(carvings, temples, dynasty, stats)
 */
export function generateRecommendations(
  carvings: JadeCarving[],
  temples: JadeTemple[],
  dynasty: DynastySummary,
  stats: JadeTempleStats,
): string[] {
  const recs: string[] = []
  if (stats.avgSerenityStrength < 50) {
    recs.push('Strengthen serenity with calm imports, steady private fields, and peaceful interface foundations')
  }
  if (stats.avgCulturalDepth < 50) {
    recs.push('Deepen cultural heritage with rich doc comments, deep generics, and contextual readonly patterns')
  }
  if (stats.avgCarvingPrecision < 50) {
    recs.push('Refine carving precision with precise named exports, detailed return types, and refined interfaces')
  }
  if (stats.avgTranslucencyQuality < 50) {
    recs.push('Improve translucency with transparent doc comments, clear type aliases, and luminous return types')
  }
  if (stats.avgSymbolicWisdom < 50) {
    recs.push('Enhance symbolic wisdom with meaningful return types, symbolic readonly guards, and expressive abstractions')
  }
  if (stats.riverStoneCount > 0) {
    recs.push(`${stats.riverStoneCount} file(s) are river-stone — consider significant refactoring`)
  }
  if (dynasty.overallHarmony < 40) {
    recs.push('Overall jade harmony is poor — focus on serenity strength and cultural depth first')
  }
  const allEmpty = temples.every(t => t.templeType === 'no-temple' || t.templeType === 'garden-rock')
  if (allEmpty && temples.length > 0) {
    recs.push('All temples are garden rocks or empty — consider a major quality overhaul')
  }
  const stones = carvings.filter(c => c.condition === 'river-stone').map(c => c.file)
  if (stones.length > 0 && stones.length <= 3) {
    recs.push(`Carve these river-stone files into jade: ${stones.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your jade collection is jade-emperor quality! Every carving radiates imperial harmony')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as jade carving
 * @example
 * const carving = analyzeJadeCarving(content, 'index.ts')
 * console.log(carving.condition) // 'imperial-jade'
 */
export function analyzeJadeCarving(content: string, filePath: string): JadeCarving {
  const strengthening = measureStrengthening(content)
  const deepening = measureDeepening(content)
  const carving = measureCarving(content)
  const translucency = measureTranslucency(content)
  const symbolizing = measureSymbolizing(content)

  const qualityScore = Math.round(
    strengthening.serenity * 0.2 +
    deepening.depth * 0.2 +
    carving.precision * 0.2 +
    translucency.quality * 0.2 +
    symbolizing.wisdom * 0.2,
  )

  return {
    file: filePath,
    serenityStrength: strengthening.serenity,
    culturalDepth: deepening.depth,
    carvingPrecision: carving.precision,
    translucencyQuality: translucency.quality,
    symbolicWisdom: symbolizing.wisdom,
    strengthening,
    deepening,
    carving,
    translucency,
    symbolizing,
    condition: classifyJadeCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a jade temple
 * @example
 * const temple = analyzeJadeTemple(carvings, 'src')
 * console.log(temple.templeType) // 'forbidden-city'
 */
export function analyzeJadeTemple(carvings: JadeCarving[], dirPath: string): JadeTemple {
  if (carvings.length === 0) {
    return {
      directory: dirPath, carvings: [], avgSerenity: 0, avgDepth: 0, avgPrecision: 0,
      imperialJadeCount: 0, riverStoneCount: 0, templeType: 'no-temple', condition: 'empty',
    }
  }

  const avgSerenity = Math.round(carvings.reduce((s, c) => s + c.serenityStrength, 0) / carvings.length)
  const avgDepth = Math.round(carvings.reduce((s, c) => s + c.culturalDepth, 0) / carvings.length)
  const avgPrecision = Math.round(carvings.reduce((s, c) => s + c.carvingPrecision, 0) / carvings.length)
  const imperialJadeCount = carvings.filter(c => c.condition === 'imperial-jade').length
  const riverStoneCount = carvings.filter(c => c.condition === 'river-stone').length
  const avgQs = Math.round(carvings.reduce((s, c) => s + c.qualityScore, 0) / carvings.length)

  return {
    directory: dirPath, carvings, avgSerenity, avgDepth, avgPrecision,
    imperialJadeCount, riverStoneCount, templeType: classifyTempleType(carvings),
    condition: classifyTempleCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete jade temple result
 * @example
 * const result = await buildJadeTempleResult(files, contents)
 * console.log(result.stats.artisanGrade) // 'jade-emperor'
 */
export async function buildJadeTempleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeTempleResult> {
  const carvings = files.map((file, i) => analyzeJadeCarving(contents[i] ?? '', file))

  const dirMap = new Map<string, JadeCarving[]>()
  for (const carving of carvings) {
    const dir = path.dirname(carving.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(carving) } else { dirMap.set(dir, [carving]) }
  }

  const temples = Array.from(dirMap.entries()).map(([dir, dirCarvings]) =>
    analyzeJadeTemple(dirCarvings, dir),
  )

  const avgSerenity = carvings.length > 0
    ? Math.round(carvings.reduce((s, c) => s + c.serenityStrength, 0) / carvings.length) : 0
  const avgDepth = carvings.length > 0
    ? Math.round(carvings.reduce((s, c) => s + c.culturalDepth, 0) / carvings.length) : 0
  const avgPrecision = carvings.length > 0
    ? Math.round(carvings.reduce((s, c) => s + c.carvingPrecision, 0) / carvings.length) : 0

  const overallHarmony = carvings.length > 0
    ? Math.round((avgSerenity + avgDepth + avgPrecision) / 3) : 0
  const isImperial = avgSerenity >= 60

  const dynasty: DynastySummary = { avgSerenity, avgDepth, avgPrecision, isImperial, overallHarmony }

  const avgTranslucencyQuality = carvings.length > 0
    ? Math.round(carvings.reduce((s, c) => s + c.translucencyQuality, 0) / carvings.length) : 0
  const avgSymbolicWisdom = carvings.length > 0
    ? Math.round(carvings.reduce((s, c) => s + c.symbolicWisdom, 0) / carvings.length) : 0

  const bestCarving = carvings.length > 0
    ? carvings.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const mostSerene = carvings.length > 0
    ? carvings.reduce((best, c) => c.serenityStrength > best.serenityStrength ? c : best).file : ''
  const deepest = carvings.length > 0
    ? carvings.reduce((best, c) => c.culturalDepth > best.culturalDepth ? c : best).file : ''
  const mostPrecise = carvings.length > 0
    ? carvings.reduce((best, c) => c.carvingPrecision > best.carvingPrecision ? c : best).file : ''
  const mostLuminous = carvings.length > 0
    ? carvings.reduce((best, c) => c.translucencyQuality > best.translucencyQuality ? c : best).file : ''

  const stats: JadeTempleStats = {
    totalFiles: carvings.length,
    totalTemples: temples.length,
    avgSerenityStrength: avgSerenity,
    avgCulturalDepth: avgDepth,
    avgCarvingPrecision: avgPrecision,
    avgTranslucencyQuality,
    avgSymbolicWisdom,
    imperialJadeCount: carvings.filter(c => c.condition === 'imperial-jade').length,
    fineJadeiteCount: carvings.filter(c => c.condition === 'fine-jadeite').length,
    properNephriteCount: carvings.filter(c => c.condition === 'proper-nephrite').length,
    commonJadeCount: carvings.filter(c => c.condition === 'common-jade').length,
    serpentineCount: carvings.filter(c => c.condition === 'serpentine').length,
    riverStoneCount: carvings.filter(c => c.condition === 'river-stone').length,
    hasHighSerenityCount: carvings.filter(c => c.strengthening.hasHighSerenity).length,
    hasHighDepthCount: carvings.filter(c => c.deepening.hasHighDepth).length,
    hasHighPrecisionCount: carvings.filter(c => c.carving.hasHighPrecision).length,
    hasHighQualityCount: carvings.filter(c => c.translucency.hasHighQuality).length,
    hasHighWisdomCount: carvings.filter(c => c.symbolizing.hasHighWisdom).length,
    overallHarmony,
    artisanGrade: classifyArtisanGrade(overallHarmony),
    bestCarving, mostSerene, deepest, mostPrecise, mostLuminous,
  }

  const recommendations = generateRecommendations(carvings, temples, dynasty, stats)

  return { carvings, temples, dynasty, stats, recommendations }
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
