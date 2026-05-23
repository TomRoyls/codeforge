// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Resonance grade */
export type ResonanceGrade =
  | 'temple-bell'
  | 'resonant-tone'
  | 'proper-ring'
  | 'dull-thud'
  | 'dead-metal'
  | 'cracked-bell'

/** Tone purity grade */
export type ToneGrade =
  | 'pure-chime'
  | 'clear-tone'
  | 'proper-sound'
  | 'muffled'
  | 'discordant'
  | 'noise'

/** Clarity ring grade */
export type RingGrade =
  | 'crystal-chime'
  | 'clear-ring'
  | 'proper-chime'
  | 'faint-ding'
  | 'buzz'
  | 'silent'

/** Patina grade */
export type PatinaGrade =
  | 'beautiful-patina'
  | 'graceful-aging'
  | 'proper-wear'
  | 'premature-aging'
  | 'corroding'
  | 'rusted'

/** Swing grade */
export type SwingGrade =
  | 'instant-response'
  | 'quick-react'
  | 'proper-swing'
  | 'slow-response'
  | 'sluggish'
  | 'stuck'

/** Bell condition */
export type BellCondition =
  | 'grand-cathedral-bell'
  | 'church-bell'
  | 'proper-handbell'
  | 'doorbell'
  | 'broken-clapper'
  | 'silent-metal'

/** Tower type */
export type TowerType =
  | 'bell-tower'
  | 'clock-tower'
  | 'carillon'
  | 'single-bell'
  | 'chime-set'
  | 'no-bells'

/** Tower condition */
export type TowerCondition =
  | 'pealing-glory'
  | 'clear-ringing'
  | 'decent-chiming'
  | 'muffled-sound'
  | 'silent-tower'
  | 'collapsed'

/** Bell founder grade */
export type BellFounderGrade =
  | 'master-bell-founder'
  | 'expert-founder'
  | 'skilled-bell-maker'
  | 'apprentice'
  | 'novice'
  | 'tin-ear'

/** Resonating measurement */
export interface ResonatingMeasure {
  quality: number
  grade: ResonanceGrade
  hasHighQuality: boolean
  hasLasting: boolean
  hasPersistent: boolean
  hasNoFading: boolean
  hasSustained: boolean
  hasNoBrief: boolean
  hasEnduring: boolean
  hasNoTransient: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasImpactful: boolean
  fadingCount: number
  briefCount: number
}

/** Purifying measurement */
export interface PurifyingMeasure {
  purity: number
  tone: ToneGrade
  hasHighPurity: boolean
  hasClear: boolean
  hasClean: boolean
  hasNoMuddy: boolean
  hasDistinct: boolean
  hasNoMuffled: boolean
  hasPure: boolean
  hasNoPolluted: boolean
  hasCrisp: boolean
  hasNoDull: boolean
  hasSharp: boolean
  muddyCount: number
  muffledCount: number
}

/** Ringing measurement */
export interface RingingMeasure {
  clarity: number
  ring: RingGrade
  hasHighClarity: boolean
  hasLoud: boolean
  hasDistinct: boolean
  hasNoWhisper: boolean
  hasDefinite: boolean
  hasNoVague: boolean
  hasPrecise: boolean
  hasNoAmbiguous: boolean
  hasNoticeable: boolean
  hasNoInvisible: boolean
  hasMarked: boolean
  whisperCount: number
  vagueCount: number
}

/** Aging measurement */
export interface AgingMeasure {
  wisdom: number
  patina: PatinaGrade
  hasHighWisdom: boolean
  hasMature: boolean
  hasGraceful: boolean
  hasNoDegenerating: boolean
  hasSeasoned: boolean
  hasNoDeteriorating: boolean
  hasExperienced: boolean
  hasNoNaive: boolean
  hasWellWorn: boolean
  hasNoWornOut: boolean
  hasAntique: boolean
  degeneratingCount: number
  deterioratingCount: number
}

/** Swinging measurement */
export interface SwingingMeasure {
  responsiveness: number
  swing: SwingGrade
  hasHighResponsiveness: boolean
  hasReactive: boolean
  hasResponsive: boolean
  hasNoDelayed: boolean
  hasQuick: boolean
  hasNoSluggish: boolean
  hasImmediate: boolean
  hasNoLaggy: boolean
  hasPrompt: boolean
  hasNoStalled: boolean
  hasNimble: boolean
  delayedCount: number
  sluggishCount: number
}

/** Single file analysis */
export interface BellTone {
  file: string
  resonanceQuality: number
  tonePurity: number
  clarityRing: number
  patinaWisdom: number
  swingResponsiveness: number
  resonating: ResonatingMeasure
  purifying: PurifyingMeasure
  ringing: RingingMeasure
  aging: AgingMeasure
  swinging: SwingingMeasure
  condition: BellCondition
  qualityScore: number
}

/** Directory-level tower */
export interface BellTower {
  directory: string
  tones: BellTone[]
  avgResonance: number
  avgPurity: number
  avgResponsiveness: number
  grandCathedralBellCount: number
  silentMetalCount: number
  towerType: TowerType
  condition: TowerCondition
}

/** Carillon summary */
export interface CarillonSummary {
  avgResonance: number
  avgPurity: number
  avgResponsiveness: number
  isRinging: boolean
  overallResonance: number
}

/** Full stats */
export interface CopperBellStats {
  totalFiles: number
  totalTowers: number
  avgResonanceQuality: number
  avgTonePurity: number
  avgClarityRing: number
  avgPatinaWisdom: number
  avgSwingResponsiveness: number
  grandCathedralBellCount: number
  churchBellCount: number
  properHandbellCount: number
  doorbellCount: number
  brokenClapperCount: number
  silentMetalCount: number
  hasHighQualityCount: number
  hasHighPurityCount: number
  hasHighClarityCount: number
  hasHighWisdomCount: number
  hasHighResponsivenessCount: number
  overallResonance: number
  bellFounderGrade: BellFounderGrade
  bestTone: string
  mostResonant: string
  purest: string
  clearest: string
  mostResponsive: string
}

/** Full result */
export interface CopperBellResult {
  tones: BellTone[]
  towers: BellTower[]
  carillon: CarillonSummary
  stats: CopperBellStats
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
 * Measure resonance quality (impact persistence)
 * @example
 * const m = measureResonating(content)
 * console.log(m.grade) // 'temple-bell'
 */
export function measureResonating(content: string): ResonatingMeasure {
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

  const hasLasting = hasExport(content) && hasImport(content)
  const hasPersistent = hasReturnType(content) && hasStrictEq(content)
  const hasSustained = hasInterface(content) && hasGenerics(content)
  const hasEnduring = hasTypeAlias(content) && hasConst(content)
  const hasDeep = hasReadonly(content) && hasPrivate(content)
  const hasImpactful = hasExport(content) && hasGenerics(content)

  score += hasLasting ? 5 : 0
  score += hasPersistent ? 5 : 0
  score += hasSustained ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasImpactful ? 5 : 0

  const quality = Math.min(score, 100)
  const fadingCount = count(/\bvar\b/, content)
  const briefCount = count(/\bany\b/, content)

  const hasNoFading = fadingCount === 0
  const hasNoBrief = briefCount === 0
  const hasNoTransient = !has(/\beval\b/, content)
  const hasNoShallow = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: ResonanceGrade
  if (quality >= 85) grade = 'temple-bell'
  else if (quality >= 70) grade = 'resonant-tone'
  else if (quality >= 55) grade = 'proper-ring'
  else if (quality >= 40) grade = 'dull-thud'
  else if (quality >= 25) grade = 'dead-metal'
  else grade = 'cracked-bell'

  return {
    quality, grade, hasHighQuality, hasLasting, hasPersistent, hasNoFading,
    hasSustained, hasNoBrief, hasEnduring, hasNoTransient, hasDeep,
    hasNoShallow, hasImpactful, fadingCount, briefCount,
  }
}

/**
 * Measure tone purity (clarity)
 * @example
 * const m = measurePurifying(content)
 * console.log(m.tone) // 'pure-chime'
 */
export function measurePurifying(content: string): PurifyingMeasure {
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

  const hasClear = hasReturnType(content) && hasStrictEq(content)
  const hasClean = hasDocComments(content) && hasInterface(content)
  const hasDistinct = hasGenerics(content) && hasTypeAlias(content)
  const hasPure = hasReadonly(content) && hasPrivate(content)
  const hasCrisp = hasClass(content) && hasReturnType(content)
  const hasSharp = hasConst(content) && hasStrictEq(content)

  score += hasClear ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasDistinct ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasCrisp ? 5 : 0
  score += hasSharp ? 5 : 0

  const purity = Math.min(score, 100)
  const muddyCount = count(/\bvar\b/, content)
  const muffledCount = count(/\bany\b/, content)

  const hasNoMuddy = muddyCount === 0
  const hasNoMuffled = muffledCount === 0
  const hasNoPolluted = !has(/\beval\b/, content)
  const hasNoDull = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let tone: ToneGrade
  if (purity >= 85) tone = 'pure-chime'
  else if (purity >= 70) tone = 'clear-tone'
  else if (purity >= 55) tone = 'proper-sound'
  else if (purity >= 40) tone = 'muffled'
  else if (purity >= 25) tone = 'discordant'
  else tone = 'noise'

  return {
    purity, tone, hasHighPurity, hasClear, hasClean, hasNoMuddy,
    hasDistinct, hasNoMuffled, hasPure, hasNoPolluted, hasCrisp,
    hasNoDull, hasSharp, muddyCount, muffledCount,
  }
}

/**
 * Measure clarity ring (output quality)
 * @example
 * const m = measureRinging(content)
 * console.log(m.ring) // 'crystal-chime'
 */
export function measureRinging(content: string): RingingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasLoud = hasExport(content) && hasNamedExport(content)
  const hasDistinct = hasReturnType(content) && hasStrictEq(content)
  const hasDefinite = hasInterface(content) && hasGenerics(content)
  const hasPrecise = hasTypeAlias(content) && hasAsync(content)
  const hasNoticeable = hasClass(content) && hasDocComments(content)
  const hasMarked = hasExport(content) && hasInterface(content)

  score += hasLoud ? 5 : 0
  score += hasDistinct ? 5 : 0
  score += hasDefinite ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasNoticeable ? 5 : 0
  score += hasMarked ? 5 : 0

  const clarity = Math.min(score, 100)
  const whisperCount = count(/\bvar\b/, content)
  const vagueCount = count(/\bany\b/, content)

  const hasNoWhisper = whisperCount === 0
  const hasNoVague = vagueCount === 0
  const hasNoAmbiguous = !has(/\beval\b/, content)
  const hasNoInvisible = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let ring: RingGrade
  if (clarity >= 85) ring = 'crystal-chime'
  else if (clarity >= 70) ring = 'clear-ring'
  else if (clarity >= 55) ring = 'proper-chime'
  else if (clarity >= 40) ring = 'faint-ding'
  else if (clarity >= 25) ring = 'buzz'
  else ring = 'silent'

  return {
    clarity, ring, hasHighClarity, hasLoud, hasDistinct, hasNoWhisper,
    hasDefinite, hasNoVague, hasPrecise, hasNoAmbiguous, hasNoticeable,
    hasNoInvisible, hasMarked, whisperCount, vagueCount,
  }
}

/**
 * Measure patina wisdom (graceful aging)
 * @example
 * const m = measureAging(content)
 * console.log(m.patina) // 'beautiful-patina'
 */
export function measureAging(content: string): AgingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasPrivate(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasMature = hasConst(content) && hasReadonly(content)
  const hasGraceful = hasPrivate(content) && hasReturnType(content)
  const hasSeasoned = hasStrictEq(content) && hasInterface(content)
  const hasExperienced = hasGenerics(content) && hasTypeAlias(content)
  const hasWellWorn = hasClass(content) && hasDocComments(content)
  const hasAntique = hasConst(content) && hasPrivate(content)

  score += hasMature ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasSeasoned ? 5 : 0
  score += hasExperienced ? 5 : 0
  score += hasWellWorn ? 5 : 0
  score += hasAntique ? 5 : 0

  const wisdom = Math.min(score, 100)
  const degeneratingCount = count(/\bvar\b/, content)
  const deterioratingCount = count(/\bany\b/, content)

  const hasNoDegenerating = degeneratingCount === 0
  const hasNoDeteriorating = deterioratingCount === 0
  const hasNoNaive = !has(/\beval\b/, content)
  const hasNoWornOut = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let patina: PatinaGrade
  if (wisdom >= 85) patina = 'beautiful-patina'
  else if (wisdom >= 70) patina = 'graceful-aging'
  else if (wisdom >= 55) patina = 'proper-wear'
  else if (wisdom >= 40) patina = 'premature-aging'
  else if (wisdom >= 25) patina = 'corroding'
  else patina = 'rusted'

  return {
    wisdom, patina, hasHighWisdom, hasMature, hasGraceful, hasNoDegenerating,
    hasSeasoned, hasNoDeteriorating, hasExperienced, hasNoNaive, hasWellWorn,
    hasNoWornOut, hasAntique, degeneratingCount, deterioratingCount,
  }
}

/**
 * Measure swing responsiveness (reactivity)
 * @example
 * const m = measureSwinging(content)
 * console.log(m.swing) // 'instant-response'
 */
export function measureSwinging(content: string): SwingingMeasure {
  let score = 0
  score += hasAsync(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0

  const hasReactive = hasAsync(content) && hasExport(content)
  const hasResponsive = hasImport(content) && hasReturnType(content)
  const hasQuick = hasStrictEq(content) && hasInterface(content)
  const hasImmediate = hasGenerics(content) && hasClass(content)
  const hasPrompt = hasConst(content) && hasPrivate(content)
  const hasNimble = hasAsync(content) && hasGenerics(content)

  score += hasReactive ? 5 : 0
  score += hasResponsive ? 5 : 0
  score += hasQuick ? 5 : 0
  score += hasImmediate ? 5 : 0
  score += hasPrompt ? 5 : 0
  score += hasNimble ? 5 : 0

  const responsiveness = Math.min(score, 100)
  const delayedCount = count(/\bvar\b/, content)
  const sluggishCount = count(/\bany\b/, content)

  const hasNoDelayed = delayedCount === 0
  const hasNoSluggish = sluggishCount === 0
  const hasNoLaggy = !has(/\beval\b/, content)
  const hasNoStalled = !has(/\bdebugger\b/, content)
  const hasHighResponsiveness = responsiveness >= 70

  let swing: SwingGrade
  if (responsiveness >= 85) swing = 'instant-response'
  else if (responsiveness >= 70) swing = 'quick-react'
  else if (responsiveness >= 55) swing = 'proper-swing'
  else if (responsiveness >= 40) swing = 'slow-response'
  else if (responsiveness >= 25) swing = 'sluggish'
  else swing = 'stuck'

  return {
    responsiveness, swing, hasHighResponsiveness, hasReactive, hasResponsive,
    hasNoDelayed, hasQuick, hasNoSluggish, hasImmediate, hasNoLaggy,
    hasPrompt, hasNoStalled, hasNimble, delayedCount, sluggishCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify bell condition
 * @example
 * classifyBellCondition(90) // 'grand-cathedral-bell'
 */
export function classifyBellCondition(score: number): BellCondition {
  if (score >= 85) return 'grand-cathedral-bell'
  if (score >= 70) return 'church-bell'
  if (score >= 55) return 'proper-handbell'
  if (score >= 40) return 'doorbell'
  if (score >= 25) return 'broken-clapper'
  return 'silent-metal'
}

/**
 * Classify tower type
 * @example
 * classifyTowerType(tones) // 'bell-tower'
 */
export function classifyTowerType(tones: BellTone[]): TowerType {
  if (tones.length === 0) return 'no-bells'
  const avgQs = Math.round(tones.reduce((s, t) => s + t.qualityScore, 0) / tones.length)
  const cathedralRatio = tones.filter(t => t.condition === 'grand-cathedral-bell').length / tones.length
  if (avgQs >= 75 && cathedralRatio >= 0.5) return 'bell-tower'
  if (avgQs >= 60) return 'clock-tower'
  if (avgQs >= 45) return 'carillon'
  if (avgQs >= 30) return 'single-bell'
  if (avgQs >= 15) return 'chime-set'
  return 'no-bells'
}

/**
 * Classify tower condition
 * @example
 * classifyTowerCondition(80) // 'pealing-glory'
 */
export function classifyTowerCondition(avgQs: number): TowerCondition {
  if (avgQs >= 75) return 'pealing-glory'
  if (avgQs >= 60) return 'clear-ringing'
  if (avgQs >= 45) return 'decent-chiming'
  if (avgQs >= 30) return 'muffled-sound'
  if (avgQs >= 15) return 'silent-tower'
  return 'collapsed'
}

/**
 * Classify bell founder grade
 * @example
 * classifyBellFounderGrade(85) // 'master-bell-founder'
 */
export function classifyBellFounderGrade(avgResonance: number): BellFounderGrade {
  if (avgResonance >= 80) return 'master-bell-founder'
  if (avgResonance >= 65) return 'expert-founder'
  if (avgResonance >= 50) return 'skilled-bell-maker'
  if (avgResonance >= 35) return 'apprentice'
  if (avgResonance >= 20) return 'novice'
  return 'tin-ear'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(tones, towers, carillon, stats)
 */
export function generateRecommendations(
  tones: BellTone[],
  towers: BellTower[],
  carillon: CarillonSummary,
  stats: CopperBellStats,
): string[] {
  const recs: string[] = []
  if (stats.avgResonanceQuality < 50) {
    recs.push('Improve resonance quality with lasting exports, persistent patterns, and enduring type structures')
  }
  if (stats.avgTonePurity < 50) {
    recs.push('Purify tone with clear return types, strict equality, and clean interface definitions')
  }
  if (stats.avgClarityRing < 50) {
    recs.push('Sharpen clarity ring with loud named exports, definite interfaces, and precise async patterns')
  }
  if (stats.avgPatinaWisdom < 50) {
    recs.push('Build patina wisdom with mature const usage, graceful readonly properties, and seasoned patterns')
  }
  if (stats.avgSwingResponsiveness < 50) {
    recs.push('Increase swing responsiveness with reactive async patterns, responsive imports, and quick type checks')
  }
  if (stats.silentMetalCount > 0) {
    recs.push(`${stats.silentMetalCount} file(s) are silent metal — consider significant refactoring`)
  }
  if (carillon.overallResonance < 40) {
    recs.push('Overall bell resonance is poor — focus on resonance and purity first')
  }
  const allSilent = towers.every(t => t.towerType === 'no-bells' || t.towerType === 'chime-set')
  if (allSilent && towers.length > 0) {
    recs.push('All towers are chime sets or silent — consider a major quality overhaul')
  }
  const silent = tones.filter(t => t.condition === 'silent-metal').map(t => t.file)
  if (silent.length > 0 && silent.length <= 3) {
    recs.push(`Resound these silent metal files into bells: ${silent.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your bell carillon is pealing gloriously! Every tone rings with perfect clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as bell tone
 * @example
 * const tone = analyzeBellTone(content, 'index.ts')
 * console.log(tone.condition) // 'grand-cathedral-bell'
 */
export function analyzeBellTone(content: string, filePath: string): BellTone {
  const resonating = measureResonating(content)
  const purifying = measurePurifying(content)
  const ringing = measureRinging(content)
  const aging = measureAging(content)
  const swinging = measureSwinging(content)

  const qualityScore = Math.round(
    resonating.quality * 0.2 +
    purifying.purity * 0.2 +
    ringing.clarity * 0.2 +
    aging.wisdom * 0.2 +
    swinging.responsiveness * 0.2,
  )

  return {
    file: filePath,
    resonanceQuality: resonating.quality,
    tonePurity: purifying.purity,
    clarityRing: ringing.clarity,
    patinaWisdom: aging.wisdom,
    swingResponsiveness: swinging.responsiveness,
    resonating,
    purifying,
    ringing,
    aging,
    swinging,
    condition: classifyBellCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a bell tower
 * @example
 * const tower = analyzeBellTower(tones, 'src')
 * console.log(tower.towerType) // 'bell-tower'
 */
export function analyzeBellTower(tones: BellTone[], dirPath: string): BellTower {
  if (tones.length === 0) {
    return {
      directory: dirPath, tones: [], avgResonance: 0, avgPurity: 0, avgResponsiveness: 0,
      grandCathedralBellCount: 0, silentMetalCount: 0, towerType: 'no-bells', condition: 'collapsed',
    }
  }

  const avgResonance = Math.round(tones.reduce((s, t) => s + t.resonanceQuality, 0) / tones.length)
  const avgPurity = Math.round(tones.reduce((s, t) => s + t.tonePurity, 0) / tones.length)
  const avgResponsiveness = Math.round(tones.reduce((s, t) => s + t.swingResponsiveness, 0) / tones.length)
  const grandCathedralBellCount = tones.filter(t => t.condition === 'grand-cathedral-bell').length
  const silentMetalCount = tones.filter(t => t.condition === 'silent-metal').length
  const avgQs = Math.round(tones.reduce((s, t) => s + t.qualityScore, 0) / tones.length)

  return {
    directory: dirPath, tones, avgResonance, avgPurity, avgResponsiveness,
    grandCathedralBellCount, silentMetalCount, towerType: classifyTowerType(tones),
    condition: classifyTowerCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete copper bell result
 * @example
 * const result = await buildCopperBellResult(files, contents)
 * console.log(result.stats.bellFounderGrade) // 'master-bell-founder'
 */
export async function buildCopperBellResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperBellResult> {
  const tones = files.map((file, i) => analyzeBellTone(contents[i] ?? '', file))

  const dirMap = new Map<string, BellTone[]>()
  for (const tone of tones) {
    const dir = path.dirname(tone.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(tone) } else { dirMap.set(dir, [tone]) }
  }

  const towers = Array.from(dirMap.entries()).map(([dir, dirTones]) =>
    analyzeBellTower(dirTones, dir),
  )

  const avgResonance = tones.length > 0
    ? Math.round(tones.reduce((s, t) => s + t.resonanceQuality, 0) / tones.length) : 0
  const avgPurity = tones.length > 0
    ? Math.round(tones.reduce((s, t) => s + t.tonePurity, 0) / tones.length) : 0
  const avgResponsiveness = tones.length > 0
    ? Math.round(tones.reduce((s, t) => s + t.swingResponsiveness, 0) / tones.length) : 0

  const overallResonance = tones.length > 0
    ? Math.round((avgResonance + avgPurity + avgResponsiveness) / 3) : 0
  const isRinging = avgResonance >= 60

  const carillon: CarillonSummary = { avgResonance, avgPurity, avgResponsiveness, isRinging, overallResonance }

  const avgClarityRing = tones.length > 0
    ? Math.round(tones.reduce((s, t) => s + t.clarityRing, 0) / tones.length) : 0
  const avgPatinaWisdom = tones.length > 0
    ? Math.round(tones.reduce((s, t) => s + t.patinaWisdom, 0) / tones.length) : 0

  const bestTone = tones.length > 0
    ? tones.reduce((best, t) => t.qualityScore > best.qualityScore ? t : best).file : ''
  const mostResonant = tones.length > 0
    ? tones.reduce((best, t) => t.resonanceQuality > best.resonanceQuality ? t : best).file : ''
  const purest = tones.length > 0
    ? tones.reduce((best, t) => t.tonePurity > best.tonePurity ? t : best).file : ''
  const clearest = tones.length > 0
    ? tones.reduce((best, t) => t.clarityRing > best.clarityRing ? t : best).file : ''
  const mostResponsive = tones.length > 0
    ? tones.reduce((best, t) => t.swingResponsiveness > best.swingResponsiveness ? t : best).file : ''

  const stats: CopperBellStats = {
    totalFiles: tones.length,
    totalTowers: towers.length,
    avgResonanceQuality: avgResonance,
    avgTonePurity: avgPurity,
    avgClarityRing,
    avgPatinaWisdom,
    avgSwingResponsiveness: avgResponsiveness,
    grandCathedralBellCount: tones.filter(t => t.condition === 'grand-cathedral-bell').length,
    churchBellCount: tones.filter(t => t.condition === 'church-bell').length,
    properHandbellCount: tones.filter(t => t.condition === 'proper-handbell').length,
    doorbellCount: tones.filter(t => t.condition === 'doorbell').length,
    brokenClapperCount: tones.filter(t => t.condition === 'broken-clapper').length,
    silentMetalCount: tones.filter(t => t.condition === 'silent-metal').length,
    hasHighQualityCount: tones.filter(t => t.resonating.hasHighQuality).length,
    hasHighPurityCount: tones.filter(t => t.purifying.hasHighPurity).length,
    hasHighClarityCount: tones.filter(t => t.ringing.hasHighClarity).length,
    hasHighWisdomCount: tones.filter(t => t.aging.hasHighWisdom).length,
    hasHighResponsivenessCount: tones.filter(t => t.swinging.hasHighResponsiveness).length,
    overallResonance,
    bellFounderGrade: classifyBellFounderGrade(overallResonance),
    bestTone, mostResonant, purest, clearest, mostResponsive,
  }

  const recommendations = generateRecommendations(tones, towers, carillon, stats)

  return { tones, towers, carillon, stats, recommendations }
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
