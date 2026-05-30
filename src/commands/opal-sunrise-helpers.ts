// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type PlayGrade = 'kaleidoscopic' | 'vivid-play' | 'proper-color' | 'faint-flash' | 'dull-opal' | 'no-play'
export type DawnGrade = 'crystal-dawn' | 'clear-morning' | 'proper-daybreak' | 'misty-dawn' | 'foggy-morning' | 'no-light'
export type FireGrade = 'blazing-hearth' | 'warm-ember' | 'proper-glow' | 'cool-flame' | 'cold-cinder' | 'no-fire'
export type SpectrumGrade = 'full-spectrum' | 'rich-range' | 'proper-variety' | 'limited-palette' | 'monochrome' | 'no-spectrum'
export type OpalescenceGrade = 'dreamlike-glow' | 'luminous-sheen' | 'proper-glow' | 'dull-shine' | 'flat-surface' | 'no-opalescence'
export type ShardCondition = 'black-opal' | 'precious-opal' | 'common-opal' | 'fire-opal' | 'wood-opal' | 'potch'
export type FieldType = 'lightning-ridge' | 'coober-pedy' | 'proper-deposit' | 'small-seam' | 'surface-find' | 'no-field'
export type FieldCondition = 'magnificent-sunrise' | 'beautiful-dawn' | 'decent-morning' | 'grey-dawn' | 'dark-morning' | 'void'
export type LapidaryGrade = 'master-lapidary' | 'expert-cutter' | 'skilled-polisher' | 'apprentice' | 'novice' | 'rock-tumbler'

export interface DiffractingMeasure {
  play: number
  grade: PlayGrade
  hasHighPlay: boolean
  hasDiverse: boolean
  hasExpressive: boolean
  hasNoMonotone: boolean
  hasColorful: boolean
  hasNoDrab: boolean
  hasVaried: boolean
  hasNoUniform: boolean
  hasCreative: boolean
  hasNoFormulaic: boolean
  hasVibrant: boolean
  monotoneCount: number
  drabCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dawn: DawnGrade
  hasHighClarity: boolean
  hasReadable: boolean
  hasSelfDocumenting: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasApproachable: boolean
  hasNoIntimidating: boolean
  hasInviting: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface WarmingMeasure {
  warmth: number
  fire: FireGrade
  hasHighWarmth: boolean
  hasPassionate: boolean
  hasEnthusiastic: boolean
  hasNoApathetic: boolean
  hasEngaged: boolean
  hasNoDetached: boolean
  hasAlive: boolean
  hasNoSterile: boolean
  hasVibrant: boolean
  hasNoLifeless: boolean
  hasWarm: boolean
  apatheticCount: number
  sterileCount: number
}

export interface SpanningMeasure {
  richness: number
  spectrum: SpectrumGrade
  hasHighRichness: boolean
  hasTypeHandling: boolean
  hasGeneric: boolean
  hasNoHardcoded: boolean
  hasCaseCoverage: boolean
  hasNoSinglePath: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasVersatile: boolean
  hardcodedCount: number
  singlePathCount: number
}

export interface GlowingMeasure {
  opalescence: number
  quality: OpalescenceGrade
  hasHighOpalescence: boolean
  hasBeautiful: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasWellCrafted: boolean
  hasNoHacked: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasLuminous: boolean
  clunkyCount: number
  hackedCount: number
}

export interface OpalShard {
  file: string
  playOfColor: number
  dawnClarity: number
  fireWarmth: number
  spectrumRichness: number
  opalescenceQuality: number
  diffracting: DiffractingMeasure
  illuminating: IlluminatingMeasure
  warming: WarmingMeasure
  spanning: SpanningMeasure
  glowing: GlowingMeasure
  condition: ShardCondition
  qualityScore: number
}

export interface SunriseField {
  directory: string
  shards: OpalShard[]
  avgPlay: number
  avgClarity: number
  avgOpalescence: number
  blackOpalCount: number
  potchCount: number
  fieldType: FieldType
  condition: FieldCondition
}

export interface OpalSunrise {
  avgPlay: number
  avgClarity: number
  avgOpalescence: number
  isLuminous: boolean
  overallBrilliance: number
}

export interface OpalSunriseStats {
  totalFiles: number
  totalFields: number
  avgPlayOfColor: number
  avgDawnClarity: number
  avgFireWarmth: number
  avgSpectrumRichness: number
  avgOpalescenceQuality: number
  blackOpalCount: number
  preciousOpalCount: number
  commonOpalCount: number
  fireOpalCount: number
  woodOpalCount: number
  potchCount: number
  hasHighPlayCount: number
  hasHighClarityCount: number
  hasHighWarmthCount: number
  hasHighRichnessCount: number
  hasHighOpalescenceCount: number
  overallBrilliance: number
  lapidaryGrade: LapidaryGrade
  bestShard: string
  mostColorful: string
  clearest: string
  warmest: string
  mostLuminous: string
}

export interface OpalSunriseResult {
  shards: OpalShard[]
  fields: SunriseField[]
  sunrise: OpalSunrise
  stats: OpalSunriseStats
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
  const hasConditional = (c: string) => has(/\bif\b/, c)
const hasUnionType = (c: string) => has(/\|\s*['"]/, c)

// ─── Measure Functions ─────────────────────────────────────────────

/**
 * Measure play of color (diversity/expressiveness)
 * @example
 * const m = measureDiffracting(content)
 * console.log(m.grade) // 'kaleidoscopic'
 */
export function measureDiffracting(content: string): DiffractingMeasure {
  let score = 0
  score += hasUnionType(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0
  score += hasTryCatch(content) ? 4 : 0
  score += hasThrow(content) ? 4 : 0

  const hasDiverse = hasUnionType(content) && hasOptional(content)
  const hasExpressive = hasGenerics(content) && hasInterface(content)
  const hasColorful = hasEnum(content) && hasTypeAlias(content)
  const hasVaried = hasExport(content) && hasConst(content)
  const hasCreative = hasStrictEq(content) && hasReturnType(content)
  const hasVibrant = hasTryCatch(content) && hasThrow(content)

  score += hasDiverse ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasColorful ? 5 : 0
  score += hasVaried ? 5 : 0
  score += hasCreative ? 5 : 0
  score += hasVibrant ? 5 : 0

  const play = Math.min(score, 100)
  const monotoneCount = countMatches(/\bvar\b/, content)
  const drabCount = countMatches(/\bany\b/, content)

  const hasNoMonotone = monotoneCount === 0
  const hasNoDrab = drabCount === 0
  const hasNoUniform = !has(/\bdebugger\b/, content)
  const hasNoFormulaic = countMatches(/\beval\b/, content) === 0
  const hasHighPlay = play >= 70

  let grade: PlayGrade
  if (play >= 85) grade = 'kaleidoscopic'
  else if (play >= 70) grade = 'vivid-play'
  else if (play >= 55) grade = 'proper-color'
  else if (play >= 40) grade = 'faint-flash'
  else if (play >= 25) grade = 'dull-opal'
  else grade = 'no-play'

  return {
    play, grade, hasHighPlay, hasDiverse, hasExpressive, hasNoMonotone,
    hasColorful, hasNoDrab, hasVaried, hasNoUniform, hasCreative,
    hasNoFormulaic, hasVibrant, monotoneCount, drabCount,
  }
}

/**
 * Measure dawn clarity (early readability)
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.dawn) // 'crystal-dawn'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
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

  const hasReadable = hasExport(content) && hasInterface(content)
  const hasSelfDocumenting = hasReturnType(content) && hasDocComments(content)
  const hasClear = hasDocComments(content) && hasNamedExport(content)
  const hasTransparent = hasEnum(content) && hasTypeAlias(content)
  const hasApproachable = hasAsync(content) && hasConst(content)
  const hasInviting = hasOptional(content) && hasReadonly(content)

  score += hasReadable ? 5 : 0
  score += hasSelfDocumenting ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasTransparent ? 5 : 0
  score += hasApproachable ? 5 : 0
  score += hasInviting ? 5 : 0

  const clarity = Math.min(score, 100)
  const crypticCount = countMatches(/\bvar\b/, content)
  const obfuscatedCount = countMatches(/\bany\b/, content)

  const hasNoCryptic = crypticCount === 0
  const hasNoObfuscated = obfuscatedCount === 0
  const hasNoHidden = countMatches(/\beval\b/, content) === 0
  const hasNoIntimidating = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let dawn: DawnGrade
  if (clarity >= 85) dawn = 'crystal-dawn'
  else if (clarity >= 70) dawn = 'clear-morning'
  else if (clarity >= 55) dawn = 'proper-daybreak'
  else if (clarity >= 40) dawn = 'misty-dawn'
  else if (clarity >= 25) dawn = 'foggy-morning'
  else dawn = 'no-light'

  return {
    clarity, dawn, hasHighClarity, hasReadable, hasSelfDocumenting,
    hasNoCryptic, hasClear, hasNoObfuscated, hasTransparent, hasNoHidden,
    hasApproachable, hasNoIntimidating, hasInviting, crypticCount, obfuscatedCount,
  }
}

/**
 * Measure fire warmth (passionate energy)
 * @example
 * const m = measureWarming(content)
 * console.log(m.fire) // 'blazing-hearth'
 */
export function measureWarming(content: string): WarmingMeasure {
  let score = 0
  score += hasAsync(content) ? 8 : 0
  score += hasTryCatch(content) ? 8 : 0
  score += hasThrow(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 6 : 0
  score += hasInterface(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasGenerics(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasReadonly(content) ? 4 : 0

  const hasPassionate = hasAsync(content) && hasTryCatch(content)
  const hasEnthusiastic = hasThrow(content) && hasStrictEq(content)
  const hasEngaged = hasReturnType(content) && hasExport(content)
  const hasAlive = hasInterface(content) && hasConst(content)
  const didVibrant = hasGenerics(content) && hasEnum(content)
  const hasWarm = hasTypeAlias(content) && hasReadonly(content)

  score += hasPassionate ? 5 : 0
  score += hasEnthusiastic ? 5 : 0
  score += hasEngaged ? 5 : 0
  score += hasAlive ? 5 : 0
  score += didVibrant ? 5 : 0
  score += hasWarm ? 5 : 0

  const warmth = Math.min(score, 100)
  const apatheticCount = countMatches(/\bvar\b/, content)
  const sterileCount = countMatches(/\bany\b/, content)

  const hasNoApathetic = apatheticCount === 0
  const hasNoDetached = sterileCount === 0
  const hasNoSterile = !has(/\bdebugger\b/, content)
  const hasNoLifeless = countMatches(/\beval\b/, content) === 0
  const hasHighWarmth = warmth >= 70

  let fire: FireGrade
  if (warmth >= 85) fire = 'blazing-hearth'
  else if (warmth >= 70) fire = 'warm-ember'
  else if (warmth >= 55) fire = 'proper-glow'
  else if (warmth >= 40) fire = 'cool-flame'
  else if (warmth >= 25) fire = 'cold-cinder'
  else fire = 'no-fire'

  return {
    warmth, fire, hasHighWarmth, hasPassionate, hasEnthusiastic, hasNoApathetic,
    hasEngaged, hasNoDetached, hasAlive, hasNoSterile, hasVibrant: didVibrant,
    hasNoLifeless, hasWarm, apatheticCount, sterileCount,
  }
}

/**
 * Measure spectrum richness (range of capabilities)
 * @example
 * const m = measureSpanning(content)
 * console.log(m.spectrum) // 'full-spectrum'
 */
export function measureSpanning(content: string): SpanningMeasure {
  let score = 0
  score += hasUnionType(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasOptional(content) ? 8 : 0
  score += hasConditional(content) ? 6 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasAsync(content) ? 6 : 0
  score += hasExport(content) ? 6 : 0
  score += hasStrictEq(content) ? 6 : 0
  score += hasReturnType(content) ? 6 : 0

  const hasTypeHandling = hasUnionType(content) && hasOptional(content)
  const hasGeneric = hasGenerics(content) && hasInterface(content)
  const hasCaseCoverage = hasConditional(content) && hasEnum(content)
  const hasFlexible = hasAsync(content) && hasExport(content)
  const hasAdaptive = hasStrictEq(content) && hasReturnType(content)
  const hasVersatile = hasTypeAlias(content) && hasReadonly(content)

  score += hasTypeHandling ? 5 : 0
  score += hasGeneric ? 5 : 0
  score += hasCaseCoverage ? 5 : 0
  score += hasFlexible ? 5 : 0
  score += hasAdaptive ? 5 : 0
  score += hasVersatile ? 5 : 0

  const richness = Math.min(score, 100)
  const hardcodedCount = countMatches(/\beval\b/, content)
  const singlePathCount = countMatches(/\bany\b/, content)

  const hasNoHardcoded = hardcodedCount === 0
  const hasNoSinglePath = singlePathCount === 0
  const hasNoRigid = !has(/\bdebugger\b/, content)
  const hasNoStatic = countMatches(/\bvar\b/, content) === 0
  const hasHighRichness = richness >= 70

  let spectrum: SpectrumGrade
  if (richness >= 85) spectrum = 'full-spectrum'
  else if (richness >= 70) spectrum = 'rich-range'
  else if (richness >= 55) spectrum = 'proper-variety'
  else if (richness >= 40) spectrum = 'limited-palette'
  else if (richness >= 25) spectrum = 'monochrome'
  else spectrum = 'no-spectrum'

  return {
    richness, spectrum, hasHighRichness, hasTypeHandling, hasGeneric,
    hasNoHardcoded, hasCaseCoverage, hasNoSinglePath, hasFlexible, hasNoRigid,
    hasAdaptive, hasNoStatic, hasVersatile, hardcodedCount, singlePathCount,
  }
}

/**
 * Measure opalescence quality (overall luminous beauty)
 * @example
 * const m = measureGlowing(content)
 * console.log(m.quality) // 'dreamlike-glow'
 */
export function measureGlowing(content: string): GlowingMeasure {
  let score = 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasEnum(content) ? 6 : 0
  score += hasTypeAlias(content) ? 6 : 0
  score += hasNamedExport(content) ? 6 : 0
  score += hasConst(content) ? 6 : 0
  score += hasReadonly(content) ? 6 : 0
  score += hasOptional(content) ? 6 : 0
  score += hasGenerics(content) ? 4 : 0
  score += hasPrivate(content) ? 4 : 0

  const hasBeautiful = hasDocComments(content) && hasInterface(content)
  const hasElegant = hasReturnType(content) && hasExport(content)
  const hasWellCrafted = hasEnum(content) && hasTypeAlias(content)
  const hasPolished = hasNamedExport(content) && hasConst(content)
  const hasRefined = hasReadonly(content) && hasOptional(content)
  const hasLuminous = hasGenerics(content) && hasPrivate(content)

  score += hasBeautiful ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasWellCrafted ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasLuminous ? 5 : 0

  const opalescence = Math.min(score, 100)
  const clunkyCount = countMatches(/\bvar\b/, content)
  const hackedCount = countMatches(/\beval\b/, content)

  const hasNoClunky = clunkyCount === 0
  const hasNoHacked = hackedCount === 0
  const hasNoRough = !has(/\bdebugger\b/, content)
  const hasNoCrude = countMatches(/\bany\b/, content) === 0
  const hasHighOpalescence = opalescence >= 70

  let quality: OpalescenceGrade
  if (opalescence >= 85) quality = 'dreamlike-glow'
  else if (opalescence >= 70) quality = 'luminous-sheen'
  else if (opalescence >= 55) quality = 'proper-glow'
  else if (opalescence >= 40) quality = 'dull-shine'
  else if (opalescence >= 25) quality = 'flat-surface'
  else quality = 'no-opalescence'

  return {
    opalescence, quality, hasHighOpalescence, hasBeautiful, hasElegant,
    hasNoClunky, hasWellCrafted, hasNoHacked, hasPolished, hasNoRough,
    hasRefined, hasNoCrude, hasLuminous, clunkyCount, hackedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify shard condition
 * @example
 * classifyShardCondition(90) // 'black-opal'
 */
export function classifyShardCondition(score: number): ShardCondition {
  if (score >= 85) return 'black-opal'
  if (score >= 70) return 'precious-opal'
  if (score >= 55) return 'common-opal'
  if (score >= 40) return 'fire-opal'
  if (score >= 25) return 'wood-opal'
  return 'potch'
}

/**
 * Classify field type
 * @example
 * classifyFieldType(shards) // 'lightning-ridge'
 */
export function classifyFieldType(shards: OpalShard[]): FieldType {
  if (shards.length === 0) return 'no-field'
  const avgQs = Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
  const masterpieceRatio = shards.filter(sh => sh.condition === 'black-opal').length / shards.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'lightning-ridge'
  if (avgQs >= 60) return 'coober-pedy'
  if (avgQs >= 45) return 'proper-deposit'
  if (avgQs >= 30) return 'small-seam'
  if (avgQs >= 15) return 'surface-find'
  return 'no-field'
}

/**
 * Classify field condition
 * @example
 * classifyFieldCondition(80) // 'magnificent-sunrise'
 */
export function classifyFieldCondition(avgQs: number): FieldCondition {
  if (avgQs >= 75) return 'magnificent-sunrise'
  if (avgQs >= 60) return 'beautiful-dawn'
  if (avgQs >= 45) return 'decent-morning'
  if (avgQs >= 30) return 'grey-dawn'
  if (avgQs >= 15) return 'dark-morning'
  return 'void'
}

/**
 * Classify lapidary grade
 * @example
 * classifyLapidaryGrade(85) // 'master-lapidary'
 */
export function classifyLapidaryGrade(avgBrilliance: number): LapidaryGrade {
  if (avgBrilliance >= 80) return 'master-lapidary'
  if (avgBrilliance >= 65) return 'expert-cutter'
  if (avgBrilliance >= 50) return 'skilled-polisher'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-tumbler'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(shards, fields, sunrise, stats)
 */
export function generateRecommendations(
  shards: OpalShard[],
  fields: SunriseField[],
  sunrise: OpalSunrise,
  stats: OpalSunriseStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPlayOfColor < 50) {
    recs.push('Increase play of color with diverse union types, expressive generics, and colorful enums')
  }
  if (stats.avgDawnClarity < 50) {
    recs.push('Improve dawn clarity with documented interfaces, clear named exports, and self-documenting return types')
  }
  if (stats.avgFireWarmth < 50) {
    recs.push('Add fire warmth with passionate async patterns, enthusiastic error handling, and engaged return types')
  }
  if (stats.avgSpectrumRichness < 50) {
    recs.push('Enhance spectrum richness with flexible generics, adaptive strict equality, and versatile type aliases')
  }
  if (stats.avgOpalescenceQuality < 50) {
    recs.push('Boost opalescence quality with beautiful doc comments, elegant return types, and polished named exports')
  }
  if (stats.potchCount > 0) {
    recs.push(`${stats.potchCount} file(s) are potch — they need pressure and time to develop opalescence`)
  }
  if (sunrise.overallBrilliance < 40) {
    recs.push('Overall brilliance is dangerously low — focus on play of color and dawn clarity first')
  }
  const allWeak = fields.every(f => f.fieldType === 'no-field' || f.fieldType === 'surface-find')
  if (allWeak && fields.length > 0) {
    recs.push('All opal fields are depleted — consider a major refactoring of the entire codebase')
  }
  const potchFiles = shards.filter(sh => sh.condition === 'potch').map(sh => sh.file)
  if (potchFiles.length > 0 && potchFiles.length <= 3) {
    recs.push(`Transform these potch files into opal: ${potchFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('The opal sunrise blazes with kaleidoscopic perfection! Every shard diffracts light into a full spectrum of colors')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as opal shard
 * @example
 * const shard = analyzeOpalShard(content, 'index.ts')
 * console.log(shard.condition) // 'black-opal'
 */
export function analyzeOpalShard(content: string, filePath: string): OpalShard {
  const diffracting = measureDiffracting(content)
  const illuminating = measureIlluminating(content)
  const warming = measureWarming(content)
  const spanning = measureSpanning(content)
  const glowing = measureGlowing(content)

  const qualityScore = Math.round(
    diffracting.play * 0.2 +
    illuminating.clarity * 0.2 +
    warming.warmth * 0.2 +
    spanning.richness * 0.2 +
    glowing.opalescence * 0.2,
  )

  return {
    file: filePath,
    playOfColor: diffracting.play,
    dawnClarity: illuminating.clarity,
    fireWarmth: warming.warmth,
    spectrumRichness: spanning.richness,
    opalescenceQuality: glowing.opalescence,
    diffracting, illuminating, warming, spanning, glowing,
    condition: classifyShardCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as sunrise field
 * @example
 * const field = analyzeSunriseField(shards, 'src')
 * console.log(field.fieldType) // 'lightning-ridge'
 */
export function analyzeSunriseField(shards: OpalShard[], dirPath: string): SunriseField {
  if (shards.length === 0) {
    return {
      directory: dirPath, shards: [], avgPlay: 0, avgClarity: 0,
      avgOpalescence: 0, blackOpalCount: 0, potchCount: 0,
      fieldType: 'no-field', condition: 'void',
    }
  }

  const avgPlay = Math.round(shards.reduce((s, sh) => s + sh.playOfColor, 0) / shards.length)
  const avgClarity = Math.round(shards.reduce((s, sh) => s + sh.dawnClarity, 0) / shards.length)
  const avgOpalescence = Math.round(shards.reduce((s, sh) => s + sh.opalescenceQuality, 0) / shards.length)
  const blackOpalCount = shards.filter(sh => sh.condition === 'black-opal').length
  const potchCount = shards.filter(sh => sh.condition === 'potch').length
  const avgQs = Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)

  return {
    directory: dirPath, shards, avgPlay, avgClarity, avgOpalescence,
    blackOpalCount, potchCount,
    fieldType: classifyFieldType(shards),
    condition: classifyFieldCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete opal sunrise result
 * @example
 * const result = await buildOpalSunriseResult(files, contents)
 * console.log(result.stats.lapidaryGrade) // 'master-lapidary'
 */
export async function buildOpalSunriseResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OpalSunriseResult> {
  const shards = files.map((file, i) => analyzeOpalShard(contents[i] ?? '', file))

  const dirMap = new Map<string, OpalShard[]>()
  for (const shard of shards) {
    const dir = path.dirname(shard.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(shard) } else { dirMap.set(dir, [shard]) }
  }

  const fields = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeSunriseField(dirShards, dir),
  )

  const avgPlay = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.playOfColor, 0) / shards.length) : 0
  const avgClarity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.dawnClarity, 0) / shards.length) : 0
  const avgOpalescence = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.opalescenceQuality, 0) / shards.length) : 0

  const overallBrilliance = shards.length > 0
    ? Math.round((avgPlay + avgClarity + avgOpalescence) / 3) : 0
  const isLuminous = avgPlay >= 60

  const sunrise: OpalSunrise = { avgPlay, avgClarity, avgOpalescence, isLuminous, overallBrilliance }

  const avgFireWarmth = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.fireWarmth, 0) / shards.length) : 0
  const avgSpectrumRichness = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.spectrumRichness, 0) / shards.length) : 0

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file : ''
  const mostColorful = shards.length > 0
    ? shards.reduce((best, sh) => sh.playOfColor > best.playOfColor ? sh : best).file : ''
  const clearest = shards.length > 0
    ? shards.reduce((best, sh) => sh.dawnClarity > best.dawnClarity ? sh : best).file : ''
  const warmest = shards.length > 0
    ? shards.reduce((best, sh) => sh.fireWarmth > best.fireWarmth ? sh : best).file : ''
  const mostLuminous = shards.length > 0
    ? shards.reduce((best, sh) => sh.opalescenceQuality > best.opalescenceQuality ? sh : best).file : ''

  const stats: OpalSunriseStats = {
    totalFiles: shards.length,
    totalFields: fields.length,
    avgPlayOfColor: avgPlay,
    avgDawnClarity: avgClarity,
    avgFireWarmth,
    avgSpectrumRichness,
    avgOpalescenceQuality: avgOpalescence,
    blackOpalCount: shards.filter(sh => sh.condition === 'black-opal').length,
    preciousOpalCount: shards.filter(sh => sh.condition === 'precious-opal').length,
    commonOpalCount: shards.filter(sh => sh.condition === 'common-opal').length,
    fireOpalCount: shards.filter(sh => sh.condition === 'fire-opal').length,
    woodOpalCount: shards.filter(sh => sh.condition === 'wood-opal').length,
    potchCount: shards.filter(sh => sh.condition === 'potch').length,
    hasHighPlayCount: shards.filter(sh => sh.diffracting.hasHighPlay).length,
    hasHighClarityCount: shards.filter(sh => sh.illuminating.hasHighClarity).length,
    hasHighWarmthCount: shards.filter(sh => sh.warming.hasHighWarmth).length,
    hasHighRichnessCount: shards.filter(sh => sh.spanning.hasHighRichness).length,
    hasHighOpalescenceCount: shards.filter(sh => sh.glowing.hasHighOpalescence).length,
    overallBrilliance,
    lapidaryGrade: classifyLapidaryGrade(overallBrilliance),
    bestShard, mostColorful, clearest, warmest, mostLuminous,
  }

  const recommendations = generateRecommendations(shards, fields, sunrise, stats)

  return { shards, fields, sunrise, stats, recommendations }
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
