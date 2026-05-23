// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Play of color grade */
export type ColoringGrade =
  | 'rainbow-fire'
  | 'vivid-play'
  | 'proper-color'
  | 'dull-play'
  | 'common-opal'
  | 'no-color'

/** Fire brilliance grade */
export type BlazingGrade =
  | 'white-fire'
  | 'bright-flame'
  | 'proper-glow'
  | 'faint-shimmer'
  | 'dull-stone'
  | 'dead-opal'

/** Crack resistance grade */
export type CrackGrade =
  | 'flawless-opal'
  | 'strong-structure'
  | 'proper-body'
  | 'hairline-crack'
  | 'fractured'
  | 'shattered'

/** Hydration balance grade */
export type HydrationGrade =
  | 'perfectly-hydrated'
  | 'well-balanced'
  | 'proper-moisture'
  | 'dehydrated'
  | 'waterlogged'
  | 'desiccated'

/** Cutting quality grade */
export type CuttingGrade =
  | 'master-cut'
  | 'expert-cabochon'
  | 'proper-shape'
  | 'rough-cut'
  | 'chipped'
  | 'uncut'

/** Opal condition */
export type OpalCondition =
  | 'black-opal'
  | 'boulder-opal'
  | 'white-opal'
  | 'common-opal'
  | 'cracked-opal'
  | 'opal-dust'

/** Mine type */
export type MineType =
  | 'lightning-ridge'
  | 'coober-pedy'
  | 'proper-mine'
  | 'surface-find'
  | 'dry-dig'
  | 'no-mine'

/** Field condition */
export type FieldCondition =
  | 'gem-quality'
  | 'good-find'
  | 'decent-yield'
  | 'low-grade'
  | 'mine-tailings'
  | 'empty-shaft'

/** Lapidary grade */
export type LapidaryGrade =
  | 'master-lapidary'
  | 'expert-gem-cutter'
  | 'skilled-artisan'
  | 'apprentice'
  | 'novice'
  | 'rock-smasher'

/** Coloring measurement */
export interface ColoringMeasure {
  play: number
  grade: ColoringGrade
  hasHighPlay: boolean
  hasVaried: boolean
  hasDiverse: boolean
  hasNoMonotone: boolean
  hasColorful: boolean
  hasNoDrab: boolean
  hasExpressive: boolean
  hasNoFlat: boolean
  hasVibrant: boolean
  hasNoBland: boolean
  hasRich: boolean
  monotoneCount: number
  drabCount: number
}

/** Blazing measurement */
export interface BlazingMeasure {
  brilliance: number
  fire: BlazingGrade
  hasHighBrilliance: boolean
  hasVivid: boolean
  hasImpactful: boolean
  hasNoWeak: boolean
  hasStriking: boolean
  hasNoFaint: boolean
  hasPowerful: boolean
  hasNoWeakEffect: boolean
  hasBrilliant: boolean
  hasNoDim: boolean
  hasDazzling: boolean
  weakCount: number
  faintCount: number
}

/** Resisting measurement */
export interface ResistingMeasure {
  resistance: number
  crack: CrackGrade
  hasHighResistance: boolean
  hasDurable: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoBrittle: boolean
  hasSolid: boolean
  hasNoCrumbly: boolean
  hasIntact: boolean
  hasNoBroken: boolean
  hasSound: boolean
  fragileCount: number
  brittleCount: number
}

/** Balancing measurement */
export interface BalancingMeasure {
  balance: number
  hydration: HydrationGrade
  hasHighBalance: boolean
  hasBalanced: boolean
  hasProportioned: boolean
  hasNoOverweight: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasHarmonious: boolean
  hasNoClashing: boolean
  hasMeasured: boolean
  hasNoExcessive: boolean
  hasModerate: boolean
  overweightCount: number
  bloatedCount: number
}

/** Cutting measurement */
export interface CuttingMeasure {
  quality: number
  cut: CuttingGrade
  hasHighQuality: boolean
  hasPrecise: boolean
  hasAccurate: boolean
  hasNoSloppy: boolean
  hasRefined: boolean
  hasNoRough: boolean
  hasSharp: boolean
  hasNoDull: boolean
  hasPolished: boolean
  hasNoRaw: boolean
  hasElegant: boolean
  sloppyCount: number
  roughCount: number
}

/** Single file analysis */
export interface OpalFire {
  file: string
  playOfColor: number
  fireBrilliance: number
  crackResistance: number
  hydrationBalance: number
  cuttingQuality: number
  coloring: ColoringMeasure
  blazing: BlazingMeasure
  resisting: ResistingMeasure
  balancing: BalancingMeasure
  cutting: CuttingMeasure
  condition: OpalCondition
  qualityScore: number
}

/** Directory-level mine */
export interface OpalMine {
  directory: string
  fires: OpalFire[]
  avgPlay: number
  avgBrilliance: number
  avgResistance: number
  blackOpalCount: number
  opalDustCount: number
  mineType: MineType
  condition: FieldCondition
}

/** Field summary */
export interface FieldSummary {
  avgPlay: number
  avgBrilliance: number
  avgResistance: number
  isBrilliant: boolean
  overallFire: number
}

/** Full stats */
export interface OpalFireStats {
  totalFiles: number
  totalMines: number
  avgPlayOfColor: number
  avgFireBrilliance: number
  avgCrackResistance: number
  avgHydrationBalance: number
  avgCuttingQuality: number
  blackOpalCount: number
  boulderOpalCount: number
  whiteOpalCount: number
  commonOpalCount: number
  crackedOpalCount: number
  opalDustCount: number
  hasHighPlayCount: number
  hasHighBrillianceCount: number
  hasHighResistanceCount: number
  hasHighBalanceCount: number
  hasHighQualityCount: number
  overallFire: number
  lapidaryGrade: LapidaryGrade
  bestFire: string
  mostColorful: string
  mostBrilliant: string
  mostDurable: string
  bestBalanced: string
}

/** Full result */
export interface OpalFireResult {
  fires: OpalFire[]
  mines: OpalMine[]
  field: FieldSummary
  stats: OpalFireStats
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
 * Measure play of color (code variety/expressiveness)
 * @example
 * const m = measureColoring(content)
 * console.log(m.grade) // 'rainbow-fire'
 */
export function measureColoring(content: string): ColoringMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0

  const hasVaried = hasExport(content) && hasReturnType(content)
  const hasDiverse = hasInterface(content) && hasGenerics(content)
  const hasExpressive = hasGenerics(content) && hasInterface(content)
  const hasVibrant = hasAsync(content) && hasReturnType(content)
  const hasRich = hasNamedExport(content) && hasInterface(content)

  score += hasVaried ? 5 : 0
  score += hasDiverse ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasVibrant ? 5 : 0
  score += hasRich ? 5 : 0

  const play = Math.min(score, 100)
  const monotoneCount = count(/\bvar\b/, content)
  const drabCount = count(/\bany\b/, content)

  const hasNoMonotone = monotoneCount === 0
  const hasNoDrab = drabCount === 0
  const hasNoFlat = !has(/\beval\b/, content)
  const hasNoBland = !has(/\bdebugger\b/, content)
  const hasColorful = hasNamedExport(content) && hasAsync(content)
  const hasHighPlay = play >= 70

  let grade: ColoringGrade
  if (play >= 85) grade = 'rainbow-fire'
  else if (play >= 70) grade = 'vivid-play'
  else if (play >= 55) grade = 'proper-color'
  else if (play >= 40) grade = 'dull-play'
  else if (play >= 25) grade = 'common-opal'
  else grade = 'no-color'

  return {
    play, grade, hasHighPlay, hasVaried, hasDiverse, hasNoMonotone,
    hasColorful, hasNoDrab, hasExpressive, hasNoFlat, hasVibrant,
    hasNoBland, hasRich, monotoneCount, drabCount,
  }
}

/**
 * Measure fire brilliance (code impact/vividness)
 * @example
 * const m = measureBlazing(content)
 * console.log(m.fire) // 'white-fire'
 */
export function measureBlazing(content: string): BlazingMeasure {
  let score = 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasVivid = hasReadonly(content) && hasPrivate(content)
  const hasImpactful = hasReturnType(content) && hasStrictEq(content)
  const hasNoWeak = hasDocComments(content) && hasInterface(content)
  const hasStriking = hasGenerics(content) && hasExport(content)
  const hasNoFaint = hasConst(content) && hasReturnType(content)
  const hasPowerful = hasStrictEq(content) && hasClass(content)
  const hasNoWeakEffect = hasReadonly(content) && hasGenerics(content)
  const hasBrilliant = hasPrivate(content) && hasInterface(content)
  const hasNoDim = hasExport(content) && hasStrictEq(content)
  const hasDazzling = hasClass(content) && hasReturnType(content)

  score += hasVivid ? 5 : 0
  score += hasImpactful ? 5 : 0
  score += hasNoWeak ? 5 : 0
  score += hasStriking ? 5 : 0
  score += hasNoFaint ? 5 : 0
  score += hasPowerful ? 5 : 0
  score += hasNoWeakEffect ? 5 : 0
  score += hasBrilliant ? 5 : 0
  score += hasNoDim ? 5 : 0
  score += hasDazzling ? 5 : 0

  const brilliance = Math.min(score, 100)
  const weakCount = count(/\bvar\b/, content)
  const faintCount = count(/\bany\b/, content)

  const hasHighBrilliance = brilliance >= 70

  let fire: BlazingGrade
  if (brilliance >= 85) fire = 'white-fire'
  else if (brilliance >= 70) fire = 'bright-flame'
  else if (brilliance >= 55) fire = 'proper-glow'
  else if (brilliance >= 40) fire = 'faint-shimmer'
  else if (brilliance >= 25) fire = 'dull-stone'
  else fire = 'dead-opal'

  return {
    brilliance, fire, hasHighBrilliance, hasVivid, hasImpactful, hasNoWeak,
    hasStriking, hasNoFaint, hasPowerful, hasNoWeakEffect, hasBrilliant,
    hasNoDim, hasDazzling, weakCount, faintCount,
  }
}

/**
 * Measure crack resistance (code durability)
 * @example
 * const m = measureResisting(content)
 * console.log(m.crack) // 'flawless-opal'
 */
export function measureResisting(content: string): ResistingMeasure {
  let score = 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasDurable = hasClass(content) && hasInterface(content)
  const hasRobust = hasExport(content) && hasImport(content)
  const hasTough = hasGenerics(content) && hasTypeAlias(content)
  const hasNoBrittle = hasPrivate(content) && hasReadonly(content)
  const hasSolid = hasAsync(content) && hasReturnType(content)
  const hasIntact = hasClass(content) && hasGenerics(content)

  score += hasDurable ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasNoBrittle ? 5 : 0
  score += hasSolid ? 5 : 0
  score += hasIntact ? 5 : 0

  const resistance = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoCrumbly = brittleCount === 0
  const hasNoBroken = !has(/\beval\b/, content)
  const hasSound = !has(/\bdebugger\b/, content)
  const hasHighResistance = resistance >= 70

  let crack: CrackGrade
  if (resistance >= 85) crack = 'flawless-opal'
  else if (resistance >= 70) crack = 'strong-structure'
  else if (resistance >= 55) crack = 'proper-body'
  else if (resistance >= 40) crack = 'hairline-crack'
  else if (resistance >= 25) crack = 'fractured'
  else crack = 'shattered'

  return {
    resistance, crack, hasHighResistance, hasDurable, hasRobust, hasNoFragile,
    hasTough, hasNoBrittle, hasSolid, hasNoCrumbly, hasIntact, hasNoBroken,
    hasSound, fragileCount, brittleCount,
  }
}

/**
 * Measure hydration balance (code dependency balance)
 * @example
 * const m = measureBalancing(content)
 * console.log(m.hydration) // 'perfectly-hydrated'
 */
export function measureBalancing(content: string): BalancingMeasure {
  let score = 0
  score += hasImport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasBalanced = hasImport(content) && hasExport(content)
  const hasProportioned = hasAsync(content) && hasGenerics(content)
  const hasLean = hasReturnType(content) && hasStrictEq(content)
  const hasNoBloated = hasReadonly(content) && hasPrivate(content)
  const hasHarmonious = hasImport(content) && hasAsync(content)
  const hasNoClashing = hasGenerics(content) && hasExport(content)
  const hasMeasured = hasInterface(content) && hasReadonly(content)
  const hasNoExcessive = hasStrictEq(content) && hasPrivate(content)
  const hasModerate = hasTypeAlias(content) && hasImport(content)
  const hasNoOverweight = hasInterface(content) && hasTypeAlias(content)

  score += hasBalanced ? 5 : 0
  score += hasProportioned ? 5 : 0
  score += hasLean ? 5 : 0
  score += hasNoBloated ? 5 : 0
  score += hasHarmonious ? 5 : 0
  score += hasNoClashing ? 5 : 0
  score += hasMeasured ? 5 : 0
  score += hasNoExcessive ? 5 : 0
  score += hasModerate ? 5 : 0
  score += hasNoOverweight ? 5 : 0

  const balance = Math.min(score, 100)
  const overweightCount = count(/\bvar\b/, content)
  const bloatedCount = count(/\bany\b/, content)

  const hasHighBalance = balance >= 70

  let hydration: HydrationGrade
  if (balance >= 85) hydration = 'perfectly-hydrated'
  else if (balance >= 70) hydration = 'well-balanced'
  else if (balance >= 55) hydration = 'proper-moisture'
  else if (balance >= 40) hydration = 'dehydrated'
  else if (balance >= 25) hydration = 'waterlogged'
  else hydration = 'desiccated'

  return {
    balance, hydration, hasHighBalance, hasBalanced, hasProportioned,
    hasNoOverweight, hasLean, hasNoBloated, hasHarmonious, hasNoClashing,
    hasMeasured, hasNoExcessive, hasModerate, overweightCount, bloatedCount,
  }
}

/**
 * Measure cutting quality (code precision)
 * @example
 * const m = measureCutting(content)
 * console.log(m.cut) // 'master-cut'
 */
export function measureCutting(content: string): CuttingMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasPrecise = hasReturnType(content) && hasStrictEq(content)
  const hasAccurate = hasReadonly(content) && hasPrivate(content)
  const hasNoSloppy = hasInterface(content) && hasGenerics(content)
  const hasRefined = hasDocComments(content) && hasExport(content)
  const hasSharp = hasConst(content) && hasReturnType(content)
  const hasNoRough = hasStrictEq(content) && hasInterface(content)
  const hasPolished = hasGenerics(content) && hasExport(content)
  const hasNoDull = hasReadonly(content) && hasDocComments(content)
  const hasElegant = hasPrivate(content) && hasNamedExport(content)

  score += hasPrecise ? 5 : 0
  score += hasAccurate ? 5 : 0
  score += hasNoSloppy ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasNoRough ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasNoDull ? 5 : 0
  score += hasElegant ? 5 : 0

  const quality = Math.min(score, 100)
  const sloppyCount = count(/\bvar\b/, content)
  const roughCount = count(/\bany\b/, content)

  const hasNoRaw = !has(/\beval\b/, content)
  const hasHighQuality = quality >= 70

  let cut: CuttingGrade
  if (quality >= 85) cut = 'master-cut'
  else if (quality >= 70) cut = 'expert-cabochon'
  else if (quality >= 55) cut = 'proper-shape'
  else if (quality >= 40) cut = 'rough-cut'
  else if (quality >= 25) cut = 'chipped'
  else cut = 'uncut'

  return {
    quality, cut, hasHighQuality, hasPrecise, hasAccurate, hasNoSloppy,
    hasRefined, hasNoRough, hasSharp, hasNoDull, hasPolished, hasNoRaw,
    hasElegant, sloppyCount, roughCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify opal condition
 * @example
 * classifyOpalCondition(90) // 'black-opal'
 */
export function classifyOpalCondition(score: number): OpalCondition {
  if (score >= 85) return 'black-opal'
  if (score >= 70) return 'boulder-opal'
  if (score >= 55) return 'white-opal'
  if (score >= 40) return 'common-opal'
  if (score >= 25) return 'cracked-opal'
  return 'opal-dust'
}

/**
 * Classify mine type
 * @example
 * classifyMineType(fires) // 'lightning-ridge'
 */
export function classifyMineType(fires: OpalFire[]): MineType {
  if (fires.length === 0) return 'no-mine'
  const avgQs = Math.round(fires.reduce((s, f) => s + f.qualityScore, 0) / fires.length)
  const blackRatio = fires.filter(f => f.condition === 'black-opal').length / fires.length
  if (avgQs >= 75 && blackRatio >= 0.5) return 'lightning-ridge'
  if (avgQs >= 60) return 'coober-pedy'
  if (avgQs >= 45) return 'proper-mine'
  if (avgQs >= 30) return 'surface-find'
  if (avgQs >= 15) return 'dry-dig'
  return 'no-mine'
}

/**
 * Classify field condition
 * @example
 * classifyFieldCondition(80) // 'gem-quality'
 */
export function classifyFieldCondition(avgQs: number): FieldCondition {
  if (avgQs >= 75) return 'gem-quality'
  if (avgQs >= 60) return 'good-find'
  if (avgQs >= 45) return 'decent-yield'
  if (avgQs >= 30) return 'low-grade'
  if (avgQs >= 15) return 'mine-tailings'
  return 'empty-shaft'
}

/**
 * Classify lapidary grade
 * @example
 * classifyLapidaryGrade(85) // 'master-lapidary'
 */
export function classifyLapidaryGrade(avgFire: number): LapidaryGrade {
  if (avgFire >= 80) return 'master-lapidary'
  if (avgFire >= 65) return 'expert-gem-cutter'
  if (avgFire >= 50) return 'skilled-artisan'
  if (avgFire >= 35) return 'apprentice'
  if (avgFire >= 20) return 'novice'
  return 'rock-smasher'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(fires, mines, field, stats)
 */
export function generateRecommendations(
  fires: OpalFire[],
  mines: OpalMine[],
  field: FieldSummary,
  stats: OpalFireStats,
): string[] {
  const recs: string[] = []
  if (stats.avgPlayOfColor < 50) {
    recs.push('Increase play of color with diverse exports, return types, and varied code patterns')
  }
  if (stats.avgFireBrilliance < 50) {
    recs.push('Enhance fire brilliance with readonly properties, private access, and vivid type annotations')
  }
  if (stats.avgCrackResistance < 50) {
    recs.push('Strengthen crack resistance with robust classes, durable exports, and solid async patterns')
  }
  if (stats.avgHydrationBalance < 50) {
    recs.push('Balance hydration with harmonious imports, proportioned generics, and measured dependencies')
  }
  if (stats.avgCuttingQuality < 50) {
    recs.push('Improve cutting quality with precise return types, sharp const patterns, and refined documentation')
  }
  if (stats.opalDustCount > 0) {
    recs.push(`${stats.opalDustCount} file(s) are opal dust — consider significant refactoring`)
  }
  if (field.overallFire < 40) {
    recs.push('Overall opal fire is poor — focus on play of color and brilliance first')
  }
  const allDust = mines.every(m => m.mineType === 'no-mine' || m.mineType === 'dry-dig')
  if (allDust && mines.length > 0) {
    recs.push('All mines are dry digs or empty — consider a major quality overhaul')
  }
  const dust = fires.filter(f => f.condition === 'opal-dust').map(f => f.file)
  if (dust.length > 0 && dust.length <= 3) {
    recs.push(`Polish these opal dust files into gems: ${dust.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your opal field is gem-quality! Every opal displays brilliant play of color')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as opal fire
 * @example
 * const fire = analyzeOpalFire(content, 'index.ts')
 * console.log(fire.condition) // 'black-opal'
 */
export function analyzeOpalFire(content: string, filePath: string): OpalFire {
  const coloring = measureColoring(content)
  const blazing = measureBlazing(content)
  const resisting = measureResisting(content)
  const balancing = measureBalancing(content)
  const cutting = measureCutting(content)

  const qualityScore = Math.round(
    coloring.play * 0.2 +
    blazing.brilliance * 0.2 +
    resisting.resistance * 0.2 +
    balancing.balance * 0.2 +
    cutting.quality * 0.2,
  )

  return {
    file: filePath,
    playOfColor: coloring.play,
    fireBrilliance: blazing.brilliance,
    crackResistance: resisting.resistance,
    hydrationBalance: balancing.balance,
    cuttingQuality: cutting.quality,
    coloring,
    blazing,
    resisting,
    balancing,
    cutting,
    condition: classifyOpalCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as an opal mine
 * @example
 * const mine = analyzeOpalMine(fires, 'src')
 * console.log(mine.mineType) // 'lightning-ridge'
 */
export function analyzeOpalMine(fires: OpalFire[], dirPath: string): OpalMine {
  if (fires.length === 0) {
    return {
      directory: dirPath, fires: [], avgPlay: 0, avgBrilliance: 0, avgResistance: 0,
      blackOpalCount: 0, opalDustCount: 0, mineType: 'no-mine', condition: 'empty-shaft',
    }
  }

  const avgPlay = Math.round(fires.reduce((s, f) => s + f.playOfColor, 0) / fires.length)
  const avgBrilliance = Math.round(fires.reduce((s, f) => s + f.fireBrilliance, 0) / fires.length)
  const avgResistance = Math.round(fires.reduce((s, f) => s + f.crackResistance, 0) / fires.length)
  const blackOpalCount = fires.filter(f => f.condition === 'black-opal').length
  const opalDustCount = fires.filter(f => f.condition === 'opal-dust').length
  const avgQs = Math.round(fires.reduce((s, f) => s + f.qualityScore, 0) / fires.length)

  return {
    directory: dirPath, fires, avgPlay, avgBrilliance, avgResistance,
    blackOpalCount, opalDustCount, mineType: classifyMineType(fires),
    condition: classifyFieldCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete opal fire result
 * @example
 * const result = await buildOpalFireResult(files, contents)
 * console.log(result.stats.lapidaryGrade) // 'master-lapidary'
 */
export async function buildOpalFireResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OpalFireResult> {
  const fires = files.map((file, i) => analyzeOpalFire(contents[i] ?? '', file))

  const dirMap = new Map<string, OpalFire[]>()
  for (const fire of fires) {
    const dir = path.dirname(fire.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(fire) } else { dirMap.set(dir, [fire]) }
  }

  const mines = Array.from(dirMap.entries()).map(([dir, dirFires]) =>
    analyzeOpalMine(dirFires, dir),
  )

  const avgPlay = fires.length > 0
    ? Math.round(fires.reduce((s, f) => s + f.playOfColor, 0) / fires.length) : 0
  const avgBrilliance = fires.length > 0
    ? Math.round(fires.reduce((s, f) => s + f.fireBrilliance, 0) / fires.length) : 0
  const avgResistance = fires.length > 0
    ? Math.round(fires.reduce((s, f) => s + f.crackResistance, 0) / fires.length) : 0

  const overallFire = fires.length > 0
    ? Math.round((avgPlay + avgBrilliance + avgResistance) / 3) : 0
  const isBrilliant = avgBrilliance >= 60

  const field: FieldSummary = { avgPlay, avgBrilliance, avgResistance, isBrilliant, overallFire }

  const avgCrackResistance = avgResistance
  const avgHydrationBalance = fires.length > 0
    ? Math.round(fires.reduce((s, f) => s + f.hydrationBalance, 0) / fires.length) : 0
  const avgCuttingQuality = fires.length > 0
    ? Math.round(fires.reduce((s, f) => s + f.cuttingQuality, 0) / fires.length) : 0

  const bestFire = fires.length > 0
    ? fires.reduce((best, f) => f.qualityScore > best.qualityScore ? f : best).file : ''
  const mostColorful = fires.length > 0
    ? fires.reduce((best, f) => f.playOfColor > best.playOfColor ? f : best).file : ''
  const mostBrilliant = fires.length > 0
    ? fires.reduce((best, f) => f.fireBrilliance > best.fireBrilliance ? f : best).file : ''
  const mostDurable = fires.length > 0
    ? fires.reduce((best, f) => f.crackResistance > best.crackResistance ? f : best).file : ''
  const bestBalanced = fires.length > 0
    ? fires.reduce((best, f) => f.hydrationBalance > best.hydrationBalance ? f : best).file : ''

  const stats: OpalFireStats = {
    totalFiles: fires.length,
    totalMines: mines.length,
    avgPlayOfColor: avgPlay,
    avgFireBrilliance: avgBrilliance,
    avgCrackResistance,
    avgHydrationBalance,
    avgCuttingQuality,
    blackOpalCount: fires.filter(f => f.condition === 'black-opal').length,
    boulderOpalCount: fires.filter(f => f.condition === 'boulder-opal').length,
    whiteOpalCount: fires.filter(f => f.condition === 'white-opal').length,
    commonOpalCount: fires.filter(f => f.condition === 'common-opal').length,
    crackedOpalCount: fires.filter(f => f.condition === 'cracked-opal').length,
    opalDustCount: fires.filter(f => f.condition === 'opal-dust').length,
    hasHighPlayCount: fires.filter(f => f.coloring.hasHighPlay).length,
    hasHighBrillianceCount: fires.filter(f => f.blazing.hasHighBrilliance).length,
    hasHighResistanceCount: fires.filter(f => f.resisting.hasHighResistance).length,
    hasHighBalanceCount: fires.filter(f => f.balancing.hasHighBalance).length,
    hasHighQualityCount: fires.filter(f => f.cutting.hasHighQuality).length,
    overallFire,
    lapidaryGrade: classifyLapidaryGrade(overallFire),
    bestFire, mostColorful, mostBrilliant, mostDurable, bestBalanced,
  }

  const recommendations = generateRecommendations(fires, mines, field, stats)

  return { fires, mines, field, stats, recommendations }
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
