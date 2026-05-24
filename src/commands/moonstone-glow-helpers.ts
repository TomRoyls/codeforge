// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Adularescence grade */
export type AdularescenceGrade =
  | 'blue-sheen'
  | 'bright-glow'
  | 'proper-adularescence'
  | 'weak-sheen'
  | 'dull-surface'
  | 'no-glow'

/** Inner light quality */
export type LightQuality =
  | 'radiant-core'
  | 'bright-essence'
  | 'proper-glow'
  | 'dim-center'
  | 'dark-core'
  | 'no-light'

/** Surface polish */
export type SurfacePolish =
  | 'cat-eye-sheen'
  | 'polished-surface'
  | 'proper-finish'
  | 'rough-surface'
  | 'unpolished'
  | 'raw-stone'

/** Translucency grade */
export type TranslucencyGrade =
  | 'crystal-translucent'
  | 'proper-clarity'
  | 'decent-depth'
  | 'cloudy'
  | 'opaque'
  | 'dark'

/** Lunar phase */
export type LunarPhase =
  | 'full-moon'
  | 'waxing-gibbous'
  | 'first-quarter'
  | 'waxing-crescent'
  | 'new-moon'
  | 'eclipse'

/** Moonstone condition */
export type MoonstoneCondition =
  | 'rainbow-moonstone'
  | 'blue-sheen-moonstone'
  | 'proper-moonstone'
  | 'orthoclase'
  | 'feldspar'
  | 'pebble'

/** Garden type */
export type GardenType =
  | 'moonlit-garden'
  | 'proper-collection'
  | 'gem-display'
  | 'stone-pile'
  | 'gravel-bed'
  | 'no-garden'

/** Garden condition */
export type GardenCondition =
  | 'ethereal-glow'
  | 'moonlight-display'
  | 'decent-collection'
  | 'dim-corner'
  | 'dark-room'
  | 'empty'

/** Moon gazer grade */
export type MoonGazerGrade =
  | 'luna-master'
  | 'moon-reader'
  | 'stargazer'
  | 'night-watcher'
  | 'twilight-observer'
  | 'blind'

/** Glowing measurement */
export interface GlowingMeasure {
  adularescence: number
  grade: AdularescenceGrade
  hasHighAdularescence: boolean
  hasMultifaceted: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasShifting: boolean
  hasNoFixed: boolean
  hasVaried: boolean
  hasNoMonotone: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasFloating: boolean
  staticCount: number
  fixedCount: number
}

/** Illuminating measurement */
export interface IlluminatingMeasure {
  light: number
  quality: LightQuality
  hasHighLight: boolean
  hasIntrinsic: boolean
  hasEssential: boolean
  hasNoSuperficial: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasSubstantive: boolean
  hasNoHollow: boolean
  hasValuable: boolean
  hasNoEmpty: boolean
  hasMeaningful: boolean
  superficialCount: number
  shallowCount: number
}

/** Polishing measurement */
export interface PolishingMeasure {
  sheen: number
  polish: SurfacePolish
  hasHighSheen: boolean
  hasRefined: boolean
  hasSmooth: boolean
  hasNoRough: boolean
  hasPolished: boolean
  hasNoUnfinished: boolean
  hasGlossy: boolean
  hasNoMatte: boolean
  hasFinished: boolean
  hasNoRaw: boolean
  hasElegant: boolean
  roughCount: number
  unfinishedCount: number
}

/** Clarifying measurement */
export interface ClarifyingMeasure {
  depth: number
  translucency: TranslucencyGrade
  hasHighDepth: boolean
  hasTransparent: boolean
  hasClear: boolean
  hasNoOpaque: boolean
  hasVisible: boolean
  hasNoHidden: boolean
  hasRevealing: boolean
  hasNoConcealing: boolean
  hasOpen: boolean
  hasNoSecret: boolean
  hasLucid: boolean
  opaqueCount: number
  hiddenCount: number
}

/** Phasing measurement */
export interface PhasingMeasure {
  phase: number
  lunar: LunarPhase
  hasHighPhase: boolean
  hasMature: boolean
  hasEvolved: boolean
  hasNoImmature: boolean
  hasDeveloped: boolean
  hasNoStagnant: boolean
  hasProgressing: boolean
  hasNoStuck: boolean
  hasAdvancing: boolean
  hasNoRegressing: boolean
  hasRipening: boolean
  immatureCount: number
  stagnantCount: number
}

/** Single file analysis */
export interface MoonstoneRay {
  file: string
  adularescence: number
  innerLight: number
  surfaceSheen: number
  translucencyDepth: number
  lunarPhase: number
  glowing: GlowingMeasure
  illuminating: IlluminatingMeasure
  polishing: PolishingMeasure
  clarifying: ClarifyingMeasure
  phasing: PhasingMeasure
  condition: MoonstoneCondition
  qualityScore: number
}

/** Directory-level garden */
export interface MoonlightGarden {
  directory: string
  rays: MoonstoneRay[]
  avgAdularescence: number
  avgLight: number
  avgDepth: number
  rainbowMoonstoneCount: number
  pebbleCount: number
  gardenType: GardenType
  condition: GardenCondition
}

/** Night summary */
export interface NightSummary {
  avgAdularescence: number
  avgLight: number
  avgDepth: number
  isLuminous: boolean
  overallLuminance: number
}

/** Full stats */
export interface MoonstoneGlowStats {
  totalFiles: number
  totalGardens: number
  avgAdularescence: number
  avgInnerLight: number
  avgSurfaceSheen: number
  avgTranslucencyDepth: number
  avgLunarPhase: number
  rainbowMoonstoneCount: number
  blueSheenMoonstoneCount: number
  properMoonstoneCount: number
  orthoclaseCount: number
  feldsparCount: number
  pebbleCount: number
  hasHighAdularescenceCount: number
  hasHighLightCount: number
  hasHighSheenCount: number
  hasHighDepthCount: number
  hasHighPhaseCount: number
  overallLuminance: number
  moonGazerGrade: MoonGazerGrade
  bestRay: string
  mostLuminous: string
  brightest: string
  mostPolished: string
  mostTranslucent: string
}

/** Full result */
export interface MoonstoneGlowResult {
  rays: MoonstoneRay[]
  gardens: MoonlightGarden[]
  night: NightSummary
  stats: MoonstoneGlowStats
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
 * Measure adularescence
 * @example
 * const m = measureGlowing(content)
 * console.log(m.grade) // 'blue-sheen'
 */
export function measureGlowing(content: string): GlowingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasMultifaceted = hasExport(content) && hasAsync(content)
  const hasDynamic = hasNamedExport(content) && hasReturnType(content)
  const hasShifting = hasConst(content) && hasImport(content)
  const hasVaried = hasGenerics(content) && hasInterface(content)
  const hasAlive = hasDocComments(content) && hasExport(content)
  const hasFloating = hasTypeAlias(content) && hasConst(content)

  score += hasMultifaceted ? 5 : 0
  score += hasDynamic ? 5 : 0
  score += hasShifting ? 5 : 0
  score += hasVaried ? 5 : 0
  score += hasAlive ? 5 : 0
  score += hasFloating ? 5 : 0

  const adularescence = Math.min(score, 100)
  const staticCount = count(/\bvar\b/, content)
  const fixedCount = count(/\bany\b/, content)

  const hasNoStatic = staticCount === 0
  const hasNoFixed = fixedCount === 0
  const hasNoMonotone = !has(/\beval\b/, content)
  const hasNoDead = !has(/\bdebugger\b/, content)
  const hasHighAdularescence = adularescence >= 70

  let grade: AdularescenceGrade
  if (adularescence >= 85) grade = 'blue-sheen'
  else if (adularescence >= 70) grade = 'bright-glow'
  else if (adularescence >= 55) grade = 'proper-adularescence'
  else if (adularescence >= 40) grade = 'weak-sheen'
  else if (adularescence >= 25) grade = 'dull-surface'
  else grade = 'no-glow'

  return {
    adularescence, grade, hasHighAdularescence, hasMultifaceted, hasDynamic, hasNoStatic,
    hasShifting, hasNoFixed, hasVaried, hasNoMonotone, hasAlive, hasNoDead,
    hasFloating, staticCount, fixedCount,
  }
}

/**
 * Measure inner light
 * @example
 * const m = measureIlluminating(content)
 * console.log(m.quality) // 'radiant-core'
 */
export function measureIlluminating(content: string): IlluminatingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasIntrinsic = hasReturnType(content) && hasImport(content)
  const hasEssential = hasExport(content) && hasAsync(content)
  const hasDeep = hasInterface(content) && hasGenerics(content)
  const hasSubstantive = hasNamedExport(content) && hasConst(content)
  const hasValuable = hasDocComments(content) && hasExport(content)
  const hasMeaningful = hasClass(content) && hasReturnType(content)

  score += hasIntrinsic ? 5 : 0
  score += hasEssential ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasValuable ? 5 : 0
  score += hasMeaningful ? 5 : 0

  const light = Math.min(score, 100)
  const superficialCount = count(/\bvar\b/, content)
  const shallowCount = count(/\bany\b/, content)

  const hasNoSuperficial = superficialCount === 0
  const hasNoShallow = shallowCount === 0
  const hasNoHollow = !has(/\beval\b/, content)
  const hasNoEmpty = !has(/\bdebugger\b/, content)
  const hasHighLight = light >= 70

  let quality: LightQuality
  if (light >= 85) quality = 'radiant-core'
  else if (light >= 70) quality = 'bright-essence'
  else if (light >= 55) quality = 'proper-glow'
  else if (light >= 40) quality = 'dim-center'
  else if (light >= 25) quality = 'dark-core'
  else quality = 'no-light'

  return {
    light, quality, hasHighLight, hasIntrinsic, hasEssential, hasNoSuperficial,
    hasDeep, hasNoShallow, hasSubstantive, hasNoHollow, hasValuable, hasNoEmpty,
    hasMeaningful, superficialCount, shallowCount,
  }
}

/**
 * Measure surface sheen
 * @example
 * const m = measurePolishing(content)
 * console.log(m.polish) // 'cat-eye-sheen'
 */
export function measurePolishing(content: string): PolishingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasRefined = hasConst(content) && hasStrictEq(content)
  const hasSmooth = hasReturnType(content) && hasReadonly(content)
  const hasPolished = hasInterface(content) && hasClass(content)
  const hasGlossy = hasExport(content) && hasImport(content)
  const hasFinished = hasPrivate(content) && hasStrictEq(content)
  const hasElegant = hasTypeAlias(content) && hasConst(content)

  score += hasRefined ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasGlossy ? 5 : 0
  score += hasFinished ? 5 : 0
  score += hasElegant ? 5 : 0

  const sheen = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const unfinishedCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoUnfinished = unfinishedCount === 0
  const hasNoMatte = !has(/\beval\b/, content)
  const hasNoRaw = !has(/\bdebugger\b/, content)
  const hasHighSheen = sheen >= 70

  let polish: SurfacePolish
  if (sheen >= 85) polish = 'cat-eye-sheen'
  else if (sheen >= 70) polish = 'polished-surface'
  else if (sheen >= 55) polish = 'proper-finish'
  else if (sheen >= 40) polish = 'rough-surface'
  else if (sheen >= 25) polish = 'unpolished'
  else polish = 'raw-stone'

  return {
    sheen, polish, hasHighSheen, hasRefined, hasSmooth, hasNoRough,
    hasPolished, hasNoUnfinished, hasGlossy, hasNoMatte, hasFinished, hasNoRaw,
    hasElegant, roughCount, unfinishedCount,
  }
}

/**
 * Measure translucency depth
 * @example
 * const m = measureClarifying(content)
 * console.log(m.translucency) // 'crystal-translucent'
 */
export function measureClarifying(content: string): ClarifyingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasTransparent = hasDocComments(content) && hasTypeAlias(content)
  const hasClear = hasReadonly(content) && hasPrivate(content)
  const hasVisible = hasInterface(content) && hasGenerics(content)
  const hasRevealing = hasReturnType(content) && hasExport(content)
  const hasOpen = hasImport(content) && hasClass(content)
  const hasLucid = hasReadonly(content) && hasDocComments(content)

  score += hasTransparent ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasVisible ? 5 : 0
  score += hasRevealing ? 5 : 0
  score += hasOpen ? 5 : 0
  score += hasLucid ? 5 : 0

  const depth = Math.min(score, 100)
  const opaqueCount = count(/\bvar\b/, content)
  const hiddenCount = count(/\bany\b/, content)

  const hasNoOpaque = opaqueCount === 0
  const hasNoHidden = hiddenCount === 0
  const hasNoConcealing = !has(/\beval\b/, content)
  const hasNoSecret = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let translucency: TranslucencyGrade
  if (depth >= 85) translucency = 'crystal-translucent'
  else if (depth >= 70) translucency = 'proper-clarity'
  else if (depth >= 55) translucency = 'decent-depth'
  else if (depth >= 40) translucency = 'cloudy'
  else if (depth >= 25) translucency = 'opaque'
  else translucency = 'dark'

  return {
    depth, translucency, hasHighDepth, hasTransparent, hasClear, hasNoOpaque,
    hasVisible, hasNoHidden, hasRevealing, hasNoConcealing, hasOpen, hasNoSecret,
    hasLucid, opaqueCount, hiddenCount,
  }
}

/**
 * Measure lunar phase
 * @example
 * const m = measurePhasing(content)
 * console.log(m.lunar) // 'full-moon'
 */
export function measurePhasing(content: string): PhasingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0

  const hasMature = hasExport(content) && hasImport(content)
  const hasEvolved = hasConst(content) && hasStrictEq(content)
  const hasDeveloped = hasInterface(content) && hasClass(content)
  const hasProgressing = hasReturnType(content) && hasReadonly(content)
  const hasAdvancing = hasAsync(content) && hasExport(content)
  const hasRipening = hasGenerics(content) && hasImport(content)

  score += hasMature ? 5 : 0
  score += hasEvolved ? 5 : 0
  score += hasDeveloped ? 5 : 0
  score += hasProgressing ? 5 : 0
  score += hasAdvancing ? 5 : 0
  score += hasRipening ? 5 : 0

  const phase = Math.min(score, 100)
  const immatureCount = count(/\bvar\b/, content)
  const stagnantCount = count(/\bany\b/, content)

  const hasNoImmature = immatureCount === 0
  const hasNoStagnant = stagnantCount === 0
  const hasNoStuck = !has(/\beval\b/, content)
  const hasNoRegressing = !has(/\bdebugger\b/, content)
  const hasHighPhase = phase >= 70

  let lunar: LunarPhase
  if (phase >= 85) lunar = 'full-moon'
  else if (phase >= 70) lunar = 'waxing-gibbous'
  else if (phase >= 55) lunar = 'first-quarter'
  else if (phase >= 40) lunar = 'waxing-crescent'
  else if (phase >= 25) lunar = 'new-moon'
  else lunar = 'eclipse'

  return {
    phase, lunar, hasHighPhase, hasMature, hasEvolved, hasNoImmature,
    hasDeveloped, hasNoStagnant, hasProgressing, hasNoStuck, hasAdvancing, hasNoRegressing,
    hasRipening, immatureCount, stagnantCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify moonstone condition
 * @example
 * classifyMoonstoneCondition(90) // 'rainbow-moonstone'
 */
export function classifyMoonstoneCondition(score: number): MoonstoneCondition {
  if (score >= 85) return 'rainbow-moonstone'
  if (score >= 70) return 'blue-sheen-moonstone'
  if (score >= 55) return 'proper-moonstone'
  if (score >= 40) return 'orthoclase'
  if (score >= 25) return 'feldspar'
  return 'pebble'
}

/**
 * Classify garden type
 * @example
 * classifyGardenType(rays) // 'moonlit-garden'
 */
export function classifyGardenType(rays: MoonstoneRay[]): GardenType {
  if (rays.length === 0) return 'no-garden'
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const rainbowRatio = rays.filter(r => r.condition === 'rainbow-moonstone').length / rays.length
  if (avgQs >= 75 && rainbowRatio >= 0.5) return 'moonlit-garden'
  if (avgQs >= 60) return 'proper-collection'
  if (avgQs >= 45) return 'gem-display'
  if (avgQs >= 30) return 'stone-pile'
  if (avgQs >= 15) return 'gravel-bed'
  return 'no-garden'
}

/**
 * Classify garden condition
 * @example
 * classifyGardenCondition(80) // 'ethereal-glow'
 */
export function classifyGardenCondition(avgQs: number): GardenCondition {
  if (avgQs >= 75) return 'ethereal-glow'
  if (avgQs >= 60) return 'moonlight-display'
  if (avgQs >= 45) return 'decent-collection'
  if (avgQs >= 30) return 'dim-corner'
  if (avgQs >= 15) return 'dark-room'
  return 'empty'
}

/**
 * Classify moon gazer grade
 * @example
 * classifyMoonGazerGrade(85) // 'luna-master'
 */
export function classifyMoonGazerGrade(avgLuminance: number): MoonGazerGrade {
  if (avgLuminance >= 80) return 'luna-master'
  if (avgLuminance >= 65) return 'moon-reader'
  if (avgLuminance >= 50) return 'stargazer'
  if (avgLuminance >= 35) return 'night-watcher'
  if (avgLuminance >= 20) return 'twilight-observer'
  return 'blind'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(rays, gardens, night, stats)
 */
export function generateRecommendations(
  rays: MoonstoneRay[],
  gardens: MoonlightGarden[],
  night: NightSummary,
  stats: MoonstoneGlowStats,
): string[] {
  const recs: string[] = []
  if (stats.avgAdularescence < 50) {
    recs.push('Enhance adularescence with multifaceted async/export pairs, dynamic named exports, and shifting const/import patterns')
  }
  if (stats.avgInnerLight < 50) {
    recs.push('Brighten inner light with intrinsic return types, essential async/exports, and deep interface/generics pairs')
  }
  if (stats.avgSurfaceSheen < 50) {
    recs.push('Polish surface sheen with refined const/strict-eq, smooth return types/readonly, and polished interfaces')
  }
  if (stats.avgTranslucencyDepth < 50) {
    recs.push('Deepen translucency with transparent doc comments, clear readonly/private guards, and visible interfaces')
  }
  if (stats.avgLunarPhase < 50) {
    recs.push('Advance lunar phase with mature export/import, evolved const/strict-eq, and developed interface/class pairs')
  }
  if (stats.pebbleCount > 0) {
    recs.push(`${stats.pebbleCount} file(s) are pebbles — consider significant refactoring`)
  }
  if (night.overallLuminance < 40) {
    recs.push('Overall moonstone luminance is dim — focus on adularescence and inner light first')
  }
  const allDark = gardens.every(g => g.gardenType === 'no-garden' || g.gardenType === 'gravel-bed')
  if (allDark && gardens.length > 0) {
    recs.push('All gardens are dark or barren — consider a major quality overhaul')
  }
  const pebbles = rays.filter(r => r.condition === 'pebble').map(r => r.file)
  if (pebbles.length > 0 && pebbles.length <= 3) {
    recs.push(`Polish these pebbles into rainbow moonstones: ${pebbles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your moonstones are luna-master quality! Every ray glows with ethereal brilliance')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as moonstone ray
 * @example
 * const ray = analyzeMoonstoneRay(content, 'index.ts')
 * console.log(ray.condition) // 'rainbow-moonstone'
 */
export function analyzeMoonstoneRay(content: string, filePath: string): MoonstoneRay {
  const glowing = measureGlowing(content)
  const illuminating = measureIlluminating(content)
  const polishing = measurePolishing(content)
  const clarifying = measureClarifying(content)
  const phasing = measurePhasing(content)

  const qualityScore = Math.round(
    glowing.adularescence * 0.2 +
    illuminating.light * 0.2 +
    polishing.sheen * 0.2 +
    clarifying.depth * 0.2 +
    phasing.phase * 0.2,
  )

  return {
    file: filePath,
    adularescence: glowing.adularescence,
    innerLight: illuminating.light,
    surfaceSheen: polishing.sheen,
    translucencyDepth: clarifying.depth,
    lunarPhase: phasing.phase,
    glowing,
    illuminating,
    polishing,
    clarifying,
    phasing,
    condition: classifyMoonstoneCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a moonlight garden
 * @example
 * const garden = analyzeMoonlightGarden(rays, 'src')
 * console.log(garden.gardenType) // 'moonlit-garden'
 */
export function analyzeMoonlightGarden(rays: MoonstoneRay[], dirPath: string): MoonlightGarden {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [], avgAdularescence: 0, avgLight: 0, avgDepth: 0,
      rainbowMoonstoneCount: 0, pebbleCount: 0, gardenType: 'no-garden', condition: 'empty',
    }
  }

  const avgAdularescence = Math.round(rays.reduce((s, r) => s + r.adularescence, 0) / rays.length)
  const avgLight = Math.round(rays.reduce((s, r) => s + r.innerLight, 0) / rays.length)
  const avgDepth = Math.round(rays.reduce((s, r) => s + r.translucencyDepth, 0) / rays.length)
  const rainbowMoonstoneCount = rays.filter(r => r.condition === 'rainbow-moonstone').length
  const pebbleCount = rays.filter(r => r.condition === 'pebble').length
  const avgQs = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)

  return {
    directory: dirPath, rays, avgAdularescence, avgLight, avgDepth,
    rainbowMoonstoneCount, pebbleCount, gardenType: classifyGardenType(rays),
    condition: classifyGardenCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete moonstone glow result
 * @example
 * const result = await buildMoonstoneGlowResult(files, contents)
 * console.log(result.stats.moonGazerGrade) // 'luna-master'
 */
export async function buildMoonstoneGlowResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MoonstoneGlowResult> {
  const rays = files.map((file, i) => analyzeMoonstoneRay(contents[i] ?? '', file))

  const dirMap = new Map<string, MoonstoneRay[]>()
  for (const ray of rays) {
    const dir = path.dirname(ray.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(ray) } else { dirMap.set(dir, [ray]) }
  }

  const gardens = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeMoonlightGarden(dirRays, dir),
  )

  const avgAdularescence = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.adularescence, 0) / rays.length) : 0
  const avgLight = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.innerLight, 0) / rays.length) : 0
  const avgDepth = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.translucencyDepth, 0) / rays.length) : 0

  const overallLuminance = rays.length > 0
    ? Math.round((avgAdularescence + avgLight + avgDepth) / 3) : 0
  const isLuminous = avgAdularescence >= 60

  const night: NightSummary = { avgAdularescence, avgLight, avgDepth, isLuminous, overallLuminance }

  const avgSurfaceSheen = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.surfaceSheen, 0) / rays.length) : 0
  const avgLunarPhase = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.lunarPhase, 0) / rays.length) : 0

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best).file : ''
  const mostLuminous = rays.length > 0
    ? rays.reduce((best, r) => r.adularescence > best.adularescence ? r : best).file : ''
  const brightest = rays.length > 0
    ? rays.reduce((best, r) => r.innerLight > best.innerLight ? r : best).file : ''
  const mostPolished = rays.length > 0
    ? rays.reduce((best, r) => r.surfaceSheen > best.surfaceSheen ? r : best).file : ''
  const mostTranslucent = rays.length > 0
    ? rays.reduce((best, r) => r.translucencyDepth > best.translucencyDepth ? r : best).file : ''

  const stats: MoonstoneGlowStats = {
    totalFiles: rays.length,
    totalGardens: gardens.length,
    avgAdularescence,
    avgInnerLight: avgLight,
    avgSurfaceSheen,
    avgTranslucencyDepth: avgDepth,
    avgLunarPhase,
    rainbowMoonstoneCount: rays.filter(r => r.condition === 'rainbow-moonstone').length,
    blueSheenMoonstoneCount: rays.filter(r => r.condition === 'blue-sheen-moonstone').length,
    properMoonstoneCount: rays.filter(r => r.condition === 'proper-moonstone').length,
    orthoclaseCount: rays.filter(r => r.condition === 'orthoclase').length,
    feldsparCount: rays.filter(r => r.condition === 'feldspar').length,
    pebbleCount: rays.filter(r => r.condition === 'pebble').length,
    hasHighAdularescenceCount: rays.filter(r => r.glowing.hasHighAdularescence).length,
    hasHighLightCount: rays.filter(r => r.illuminating.hasHighLight).length,
    hasHighSheenCount: rays.filter(r => r.polishing.hasHighSheen).length,
    hasHighDepthCount: rays.filter(r => r.clarifying.hasHighDepth).length,
    hasHighPhaseCount: rays.filter(r => r.phasing.hasHighPhase).length,
    overallLuminance,
    moonGazerGrade: classifyMoonGazerGrade(overallLuminance),
    bestRay, mostLuminous, brightest, mostPolished, mostTranslucent,
  }

  const recommendations = generateRecommendations(rays, gardens, night, stats)

  return { rays, gardens, night, stats, recommendations }
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
