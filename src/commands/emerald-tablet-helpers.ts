// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Inscription clarity grade */
export type InscriptionGrade =
  | 'divine-script'
  | 'clear-inscription'
  | 'proper-writing'
  | 'faded-text'
  | 'illegible'
  | 'blank-tablet'

/** Tablet strength grade */
export type TabletGrade =
  | 'adamantine'
  | 'strong-stone'
  | 'proper-tablet'
  | 'cracked-tablet'
  | 'crumbling'
  | 'dust'

/** Enigmatic depth grade */
export type EnigmaGrade =
  | 'profound-mystery'
  | 'deep-wisdom'
  | 'proper-depth'
  | 'surface-level'
  | 'shallow-thinking'
  | 'no-depth'

/** Hermetic purity grade */
export type HermeticGrade =
  | 'sealed-vessel'
  | 'proper-isolation'
  | 'contained'
  | 'leaking'
  | 'contaminated'
  | 'open-wound'

/** Transmutation wisdom grade */
export type AlchemyGrade =
  | 'philosopher-stone'
  | 'master-transmuter'
  | 'proper-alchemist'
  | 'apprentice-chemist'
  | 'failed-experiment'
  | 'no-transmutation'

/** Tablet condition */
export type TabletCondition =
  | 'hermetic-masterpiece'
  | 'sacred-tablet'
  | 'proper-scroll'
  | 'worn-inscription'
  | 'broken-fragment'
  | 'dust'

/** Archive type */
export type ArchiveType =
  | 'great-library'
  | 'temple-archive'
  | 'scholars-study'
  | 'scroll-shelf'
  | 'scrap-pile'
  | 'no-archive'

/** Archive condition */
export type ArchiveCondition =
  | 'pristine-collection'
  | 'well-preserved'
  | 'decent-records'
  | 'fading-ink'
  | 'crumbling-scrolls'
  | 'ruins'

/** Sage grade */
export type SageGrade =
  | 'archmage'
  | 'master-sage'
  | 'learned-scholar'
  | 'student'
  | 'novice'
  | 'illiterate'

/** Inscribing measurement */
export interface InscribingMeasure {
  clarity: number
  grade: InscriptionGrade
  hasHighClarity: boolean
  hasDocumented: boolean
  hasClear: boolean
  hasNoUndocumented: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasExplicit: boolean
  hasNoImplicit: boolean
  hasExpressive: boolean
  hasNoVague: boolean
  hasRevealing: boolean
  undocumentedCount: number
  crypticCount: number
}

/** Strengthening measurement */
export interface StrengtheningMeasure {
  strength: number
  tablet: TabletGrade
  hasHighStrength: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasFoundational: boolean
  hasNoShaky: boolean
  hasEnduring: boolean
  hasNoWeak: boolean
  hasStable: boolean
  hasNoUnstable: boolean
  hasResilient: boolean
  fragileCount: number
  shakyCount: number
}

/** Deepening measurement */
export interface DeepeningMeasure {
  depth: number
  enigma: EnigmaGrade
  hasHighDepth: boolean
  hasProfound: boolean
  hasDeep: boolean
  hasNoSuperficial: boolean
  hasComplex: boolean
  hasNoTrivial: boolean
  hasSubstantive: boolean
  hasNoShallow: boolean
  hasRich: boolean
  hasNoThin: boolean
  hasLayered: boolean
  superficialCount: number
  trivialCount: number
}

/** Purifying measurement */
export interface PurifyingMeasure {
  purity: number
  hermetic: HermeticGrade
  hasHighPurity: boolean
  hasClean: boolean
  hasIsolated: boolean
  hasNoLeaking: boolean
  hasPure: boolean
  hasNoPolluted: boolean
  hasEncapsulated: boolean
  hasNoExposed: boolean
  hasSealed: boolean
  hasNoBreached: boolean
  hasContained: boolean
  leakingCount: number
  pollutedCount: number
}

/** Transmuting measurement */
export interface TransmutingMeasure {
  wisdom: number
  alchemy: AlchemyGrade
  hasHighWisdom: boolean
  hasTransformative: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasImproving: boolean
  hasNoDegrading: boolean
  hasWise: boolean
  hasNoFoolish: boolean
  hasLearned: boolean
  hasNoIgnorant: boolean
  hasSagacious: boolean
  stagnantCount: number
  degradingCount: number
}

/** Single file analysis */
export interface TabletInscription {
  file: string
  inscriptionClarity: number
  tabletStrength: number
  enigmaticDepth: number
  hermeticPurity: number
  transmutationWisdom: number
  inscribing: InscribingMeasure
  strengthening: StrengtheningMeasure
  deepening: DeepeningMeasure
  purifying: PurifyingMeasure
  transmuting: TransmutingMeasure
  condition: TabletCondition
  qualityScore: number
}

/** Directory-level archive */
export interface TabletArchive {
  directory: string
  inscriptions: TabletInscription[]
  avgClarity: number
  avgStrength: number
  avgDepth: number
  hermeticMasterpieceCount: number
  dustCount: number
  archiveType: ArchiveType
  condition: ArchiveCondition
}

/** Library summary */
export interface LibrarySummary {
  avgClarity: number
  avgStrength: number
  avgDepth: number
  isEnlightened: boolean
  overallWisdom: number
}

/** Full stats */
export interface EmeraldTabletStats {
  totalFiles: number
  totalArchives: number
  avgInscriptionClarity: number
  avgTabletStrength: number
  avgEnigmaticDepth: number
  avgHermeticPurity: number
  avgTransmutationWisdom: number
  hermeticMasterpieceCount: number
  sacredTabletCount: number
  properScrollCount: number
  wornInscriptionCount: number
  brokenFragmentCount: number
  dustCount: number
  hasHighClarityCount: number
  hasHighStrengthCount: number
  hasHighDepthCount: number
  hasHighPurityCount: number
  hasHighWisdomCount: number
  overallWisdom: number
  sageGrade: SageGrade
  bestInscription: string
  clearest: string
  strongest: string
  deepest: string
  purest: string
}

/** Full result */
export interface EmeraldTabletResult {
  inscriptions: TabletInscription[]
  archives: TabletArchive[]
  library: LibrarySummary
  stats: EmeraldTabletStats
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
 * Measure inscription clarity
 * @example
 * const m = measureInscribing(content)
 * console.log(m.grade) // 'divine-script'
 */
export function measureInscribing(content: string): InscribingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasDocumented = hasDocComments(content) && hasExport(content)
  const hasClear = hasReturnType(content) && hasInterface(content)
  const hasReadable = hasGenerics(content) && hasTypeAlias(content)
  const hasExplicit = hasNamedExport(content) && hasConst(content)
  const hasExpressive = hasClass(content) && hasAsync(content)
  const hasRevealing = hasExport(content) && hasGenerics(content)

  score += hasDocumented ? 5 : 0
  score += hasClear ? 5 : 0
  score += hasReadable ? 5 : 0
  score += hasExplicit ? 5 : 0
  score += hasExpressive ? 5 : 0
  score += hasRevealing ? 5 : 0

  const clarity = Math.min(score, 100)
  const undocumentedCount = count(/\bvar\b/, content)
  const crypticCount = count(/\bany\b/, content)

  const hasNoUndocumented = undocumentedCount === 0
  const hasNoCryptic = crypticCount === 0
  const hasNoImplicit = !has(/\beval\b/, content)
  const hasNoVague = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: InscriptionGrade
  if (clarity >= 85) grade = 'divine-script'
  else if (clarity >= 70) grade = 'clear-inscription'
  else if (clarity >= 55) grade = 'proper-writing'
  else if (clarity >= 40) grade = 'faded-text'
  else if (clarity >= 25) grade = 'illegible'
  else grade = 'blank-tablet'

  return {
    clarity, grade, hasHighClarity, hasDocumented, hasClear, hasNoUndocumented,
    hasReadable, hasNoCryptic, hasExplicit, hasNoImplicit, hasExpressive,
    hasNoVague, hasRevealing, undocumentedCount, crypticCount,
  }
}

/**
 * Measure tablet strength
 * @example
 * const m = measureStrengthening(content)
 * console.log(m.tablet) // 'adamantine'
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

  const hasSolid = hasExport(content) && hasImport(content)
  const hasRobust = hasPrivate(content) && hasReadonly(content)
  const hasFoundational = hasInterface(content) && hasClass(content)
  const hasEnduring = hasStrictEq(content) && hasReturnType(content)
  const hasStable = hasGenerics(content) && hasAsync(content)
  const hasResilient = hasExport(content) && hasGenerics(content)

  score += hasSolid ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasFoundational ? 5 : 0
  score += hasEnduring ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasResilient ? 5 : 0

  const strength = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const shakyCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoShaky = shakyCount === 0
  const hasNoWeak = !has(/\beval\b/, content)
  const hasNoUnstable = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let tablet: TabletGrade
  if (strength >= 85) tablet = 'adamantine'
  else if (strength >= 70) tablet = 'strong-stone'
  else if (strength >= 55) tablet = 'proper-tablet'
  else if (strength >= 40) tablet = 'cracked-tablet'
  else if (strength >= 25) tablet = 'crumbling'
  else tablet = 'dust'

  return {
    strength, tablet, hasHighStrength, hasSolid, hasRobust, hasNoFragile,
    hasFoundational, hasNoShaky, hasEnduring, hasNoWeak, hasStable,
    hasNoUnstable, hasResilient, fragileCount, shakyCount,
  }
}

/**
 * Measure enigmatic depth
 * @example
 * const m = measureDeepening(content)
 * console.log(m.enigma) // 'profound-mystery'
 */
export function measureDeepening(content: string): DeepeningMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0

  const hasProfound = hasDocComments(content) && hasInterface(content)
  const hasDeep = hasGenerics(content) && hasTypeAlias(content)
  const hasComplex = hasReadonly(content) && hasPrivate(content)
  const hasSubstantive = hasReturnType(content) && hasStrictEq(content)
  const hasRich = hasClass(content) && hasDocComments(content)
  const hasLayered = hasConst(content) && hasInterface(content)

  score += hasProfound ? 5 : 0
  score += hasDeep ? 5 : 0
  score += hasComplex ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasLayered ? 5 : 0

  const depth = Math.min(score, 100)
  const superficialCount = count(/\bvar\b/, content)
  const trivialCount = count(/\bany\b/, content)

  const hasNoSuperficial = superficialCount === 0
  const hasNoTrivial = trivialCount === 0
  const hasNoShallow = !has(/\beval\b/, content)
  const hasNoThin = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let enigma: EnigmaGrade
  if (depth >= 85) enigma = 'profound-mystery'
  else if (depth >= 70) enigma = 'deep-wisdom'
  else if (depth >= 55) enigma = 'proper-depth'
  else if (depth >= 40) enigma = 'surface-level'
  else if (depth >= 25) enigma = 'shallow-thinking'
  else enigma = 'no-depth'

  return {
    depth, enigma, hasHighDepth, hasProfound, hasDeep, hasNoSuperficial,
    hasComplex, hasNoTrivial, hasSubstantive, hasNoShallow, hasRich,
    hasNoThin, hasLayered, superficialCount, trivialCount,
  }
}

/**
 * Measure hermetic purity
 * @example
 * const m = measurePurifying(content)
 * console.log(m.hermetic) // 'sealed-vessel'
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
  const hasIsolated = hasReadonly(content) && hasPrivate(content)
  const hasPure = hasInterface(content) && hasGenerics(content)
  const hasEncapsulated = hasTypeAlias(content) && hasDocComments(content)
  const hasSealed = hasClass(content) && hasReturnType(content)
  const hasContained = hasConst(content) && hasStrictEq(content)

  score += hasClean ? 5 : 0
  score += hasIsolated ? 5 : 0
  score += hasPure ? 5 : 0
  score += hasEncapsulated ? 5 : 0
  score += hasSealed ? 5 : 0
  score += hasContained ? 5 : 0

  const purity = Math.min(score, 100)
  const leakingCount = count(/\bvar\b/, content)
  const pollutedCount = count(/\bany\b/, content)

  const hasNoLeaking = leakingCount === 0
  const hasNoPolluted = pollutedCount === 0
  const hasNoExposed = !has(/\beval\b/, content)
  const hasNoBreached = !has(/\bdebugger\b/, content)
  const hasHighPurity = purity >= 70

  let hermetic: HermeticGrade
  if (purity >= 85) hermetic = 'sealed-vessel'
  else if (purity >= 70) hermetic = 'proper-isolation'
  else if (purity >= 55) hermetic = 'contained'
  else if (purity >= 40) hermetic = 'leaking'
  else if (purity >= 25) hermetic = 'contaminated'
  else hermetic = 'open-wound'

  return {
    purity, hermetic, hasHighPurity, hasClean, hasIsolated, hasNoLeaking,
    hasPure, hasNoPolluted, hasEncapsulated, hasNoExposed, hasSealed,
    hasNoBreached, hasContained, leakingCount, pollutedCount,
  }
}

/**
 * Measure transmutation wisdom
 * @example
 * const m = measureTransmuting(content)
 * console.log(m.alchemy) // 'philosopher-stone'
 */
export function measureTransmuting(content: string): TransmutingMeasure {
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

  const hasTransformative = hasNamedExport(content) && hasExport(content)
  const hasEvolving = hasInterface(content) && hasGenerics(content)
  const hasImproving = hasTypeAlias(content) && hasAsync(content)
  const hasWise = hasImport(content) && hasClass(content)
  const hasLearned = hasReturnType(content) && hasDocComments(content)
  const hasSagacious = hasNamedExport(content) && hasInterface(content)

  score += hasTransformative ? 5 : 0
  score += hasEvolving ? 5 : 0
  score += hasImproving ? 5 : 0
  score += hasWise ? 5 : 0
  score += hasLearned ? 5 : 0
  score += hasSagacious ? 5 : 0

  const wisdom = Math.min(score, 100)
  const stagnantCount = count(/\bvar\b/, content)
  const degradingCount = count(/\bany\b/, content)

  const hasNoStagnant = stagnantCount === 0
  const hasNoDegrading = degradingCount === 0
  const hasNoFoolish = !has(/\beval\b/, content)
  const hasNoIgnorant = !has(/\bdebugger\b/, content)
  const hasHighWisdom = wisdom >= 70

  let alchemy: AlchemyGrade
  if (wisdom >= 85) alchemy = 'philosopher-stone'
  else if (wisdom >= 70) alchemy = 'master-transmuter'
  else if (wisdom >= 55) alchemy = 'proper-alchemist'
  else if (wisdom >= 40) alchemy = 'apprentice-chemist'
  else if (wisdom >= 25) alchemy = 'failed-experiment'
  else alchemy = 'no-transmutation'

  return {
    wisdom, alchemy, hasHighWisdom, hasTransformative, hasEvolving, hasNoStagnant,
    hasImproving, hasNoDegrading, hasWise, hasNoFoolish, hasLearned,
    hasNoIgnorant, hasSagacious, stagnantCount, degradingCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify tablet condition
 * @example
 * classifyTabletCondition(90) // 'hermetic-masterpiece'
 */
export function classifyTabletCondition(score: number): TabletCondition {
  if (score >= 85) return 'hermetic-masterpiece'
  if (score >= 70) return 'sacred-tablet'
  if (score >= 55) return 'proper-scroll'
  if (score >= 40) return 'worn-inscription'
  if (score >= 25) return 'broken-fragment'
  return 'dust'
}

/**
 * Classify archive type
 * @example
 * classifyArchiveType(inscriptions) // 'great-library'
 */
export function classifyArchiveType(inscriptions: TabletInscription[]): ArchiveType {
  if (inscriptions.length === 0) return 'no-archive'
  const avgQs = Math.round(inscriptions.reduce((s, i) => s + i.qualityScore, 0) / inscriptions.length)
  const masterpieceRatio = inscriptions.filter(i => i.condition === 'hermetic-masterpiece').length / inscriptions.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'great-library'
  if (avgQs >= 60) return 'temple-archive'
  if (avgQs >= 45) return 'scholars-study'
  if (avgQs >= 30) return 'scroll-shelf'
  if (avgQs >= 15) return 'scrap-pile'
  return 'no-archive'
}

/**
 * Classify archive condition
 * @example
 * classifyArchiveCondition(80) // 'pristine-collection'
 */
export function classifyArchiveCondition(avgQs: number): ArchiveCondition {
  if (avgQs >= 75) return 'pristine-collection'
  if (avgQs >= 60) return 'well-preserved'
  if (avgQs >= 45) return 'decent-records'
  if (avgQs >= 30) return 'fading-ink'
  if (avgQs >= 15) return 'crumbling-scrolls'
  return 'ruins'
}

/**
 * Classify sage grade
 * @example
 * classifySageGrade(85) // 'archmage'
 */
export function classifySageGrade(avgWisdom: number): SageGrade {
  if (avgWisdom >= 80) return 'archmage'
  if (avgWisdom >= 65) return 'master-sage'
  if (avgWisdom >= 50) return 'learned-scholar'
  if (avgWisdom >= 35) return 'student'
  if (avgWisdom >= 20) return 'novice'
  return 'illiterate'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(inscriptions, archives, library, stats)
 */
export function generateRecommendations(
  inscriptions: TabletInscription[],
  archives: TabletArchive[],
  library: LibrarySummary,
  stats: EmeraldTabletStats,
): string[] {
  const recs: string[] = []
  if (stats.avgInscriptionClarity < 50) {
    recs.push('Improve inscription clarity with documented exports, clear return types, and explicit named exports')
  }
  if (stats.avgTabletStrength < 50) {
    recs.push('Strengthen your tablets with solid imports, robust private fields, and foundational interfaces')
  }
  if (stats.avgEnigmaticDepth < 50) {
    recs.push('Deepen enigmatic wisdom with profound doc comments, deep generics, and complex type patterns')
  }
  if (stats.avgHermeticPurity < 50) {
    recs.push('Purify hermetic seals with clean return types, isolated readonly guards, and pure type definitions')
  }
  if (stats.avgTransmutationWisdom < 50) {
    recs.push('Enhance transmutation wisdom with transformative named exports, evolving interfaces, and wise class designs')
  }
  if (stats.dustCount > 0) {
    recs.push(`${stats.dustCount} file(s) are dust — consider significant refactoring`)
  }
  if (library.overallWisdom < 40) {
    recs.push('Overall hermetic wisdom is poor — focus on inscription clarity and tablet strength first')
  }
  const allRuins = archives.every(a => a.archiveType === 'no-archive' || a.archiveType === 'scrap-pile')
  if (allRuins && archives.length > 0) {
    recs.push('All archives are scrap piles or empty — consider a major quality overhaul')
  }
  const dustFiles = inscriptions.filter(i => i.condition === 'dust').map(i => i.file)
  if (dustFiles.length > 0 && dustFiles.length <= 3) {
    recs.push(`Transmute these dust files into hermetic masterpieces: ${dustFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your hermetic collection is archmage-quality! Every inscription radiates with emerald wisdom')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as tablet inscription
 * @example
 * const inscription = analyzeTabletInscription(content, 'index.ts')
 * console.log(inscription.condition) // 'hermetic-masterpiece'
 */
export function analyzeTabletInscription(content: string, filePath: string): TabletInscription {
  const inscribing = measureInscribing(content)
  const strengthening = measureStrengthening(content)
  const deepening = measureDeepening(content)
  const purifying = measurePurifying(content)
  const transmuting = measureTransmuting(content)

  const qualityScore = Math.round(
    inscribing.clarity * 0.2 +
    strengthening.strength * 0.2 +
    deepening.depth * 0.2 +
    purifying.purity * 0.2 +
    transmuting.wisdom * 0.2,
  )

  return {
    file: filePath,
    inscriptionClarity: inscribing.clarity,
    tabletStrength: strengthening.strength,
    enigmaticDepth: deepening.depth,
    hermeticPurity: purifying.purity,
    transmutationWisdom: transmuting.wisdom,
    inscribing,
    strengthening,
    deepening,
    purifying,
    transmuting,
    condition: classifyTabletCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a tablet archive
 * @example
 * const archive = analyzeTabletArchive(inscriptions, 'src')
 * console.log(archive.archiveType) // 'great-library'
 */
export function analyzeTabletArchive(inscriptions: TabletInscription[], dirPath: string): TabletArchive {
  if (inscriptions.length === 0) {
    return {
      directory: dirPath, inscriptions: [], avgClarity: 0, avgStrength: 0, avgDepth: 0,
      hermeticMasterpieceCount: 0, dustCount: 0, archiveType: 'no-archive', condition: 'ruins',
    }
  }

  const avgClarity = Math.round(inscriptions.reduce((s, i) => s + i.inscriptionClarity, 0) / inscriptions.length)
  const avgStrength = Math.round(inscriptions.reduce((s, i) => s + i.tabletStrength, 0) / inscriptions.length)
  const avgDepth = Math.round(inscriptions.reduce((s, i) => s + i.enigmaticDepth, 0) / inscriptions.length)
  const hermeticMasterpieceCount = inscriptions.filter(i => i.condition === 'hermetic-masterpiece').length
  const dustCount = inscriptions.filter(i => i.condition === 'dust').length
  const avgQs = Math.round(inscriptions.reduce((s, i) => s + i.qualityScore, 0) / inscriptions.length)

  return {
    directory: dirPath, inscriptions, avgClarity, avgStrength, avgDepth,
    hermeticMasterpieceCount, dustCount, archiveType: classifyArchiveType(inscriptions),
    condition: classifyArchiveCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete emerald tablet result
 * @example
 * const result = await buildEmeraldTabletResult(files, contents)
 * console.log(result.stats.sageGrade) // 'archmage'
 */
export async function buildEmeraldTabletResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldTabletResult> {
  const inscriptions = files.map((file, i) => analyzeTabletInscription(contents[i] ?? '', file))

  const dirMap = new Map<string, TabletInscription[]>()
  for (const inscription of inscriptions) {
    const dir = path.dirname(inscription.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(inscription) } else { dirMap.set(dir, [inscription]) }
  }

  const archives = Array.from(dirMap.entries()).map(([dir, dirInscriptions]) =>
    analyzeTabletArchive(dirInscriptions, dir),
  )

  const avgClarity = inscriptions.length > 0
    ? Math.round(inscriptions.reduce((s, i) => s + i.inscriptionClarity, 0) / inscriptions.length) : 0
  const avgStrength = inscriptions.length > 0
    ? Math.round(inscriptions.reduce((s, i) => s + i.tabletStrength, 0) / inscriptions.length) : 0
  const avgDepth = inscriptions.length > 0
    ? Math.round(inscriptions.reduce((s, i) => s + i.enigmaticDepth, 0) / inscriptions.length) : 0

  const overallWisdom = inscriptions.length > 0
    ? Math.round((avgClarity + avgStrength + avgDepth) / 3) : 0
  const isEnlightened = avgClarity >= 60

  const library: LibrarySummary = { avgClarity, avgStrength, avgDepth, isEnlightened, overallWisdom }

  const avgHermeticPurity = inscriptions.length > 0
    ? Math.round(inscriptions.reduce((s, i) => s + i.hermeticPurity, 0) / inscriptions.length) : 0
  const avgTransmutationWisdom = inscriptions.length > 0
    ? Math.round(inscriptions.reduce((s, i) => s + i.transmutationWisdom, 0) / inscriptions.length) : 0

  const bestInscription = inscriptions.length > 0
    ? inscriptions.reduce((best, i) => i.qualityScore > best.qualityScore ? i : best).file : ''
  const clearest = inscriptions.length > 0
    ? inscriptions.reduce((best, i) => i.inscriptionClarity > best.inscriptionClarity ? i : best).file : ''
  const strongest = inscriptions.length > 0
    ? inscriptions.reduce((best, i) => i.tabletStrength > best.tabletStrength ? i : best).file : ''
  const deepest = inscriptions.length > 0
    ? inscriptions.reduce((best, i) => i.enigmaticDepth > best.enigmaticDepth ? i : best).file : ''
  const purest = inscriptions.length > 0
    ? inscriptions.reduce((best, i) => i.hermeticPurity > best.hermeticPurity ? i : best).file : ''

  const stats: EmeraldTabletStats = {
    totalFiles: inscriptions.length,
    totalArchives: archives.length,
    avgInscriptionClarity: avgClarity,
    avgTabletStrength: avgStrength,
    avgEnigmaticDepth: avgDepth,
    avgHermeticPurity,
    avgTransmutationWisdom,
    hermeticMasterpieceCount: inscriptions.filter(i => i.condition === 'hermetic-masterpiece').length,
    sacredTabletCount: inscriptions.filter(i => i.condition === 'sacred-tablet').length,
    properScrollCount: inscriptions.filter(i => i.condition === 'proper-scroll').length,
    wornInscriptionCount: inscriptions.filter(i => i.condition === 'worn-inscription').length,
    brokenFragmentCount: inscriptions.filter(i => i.condition === 'broken-fragment').length,
    dustCount: inscriptions.filter(i => i.condition === 'dust').length,
    hasHighClarityCount: inscriptions.filter(i => i.inscribing.hasHighClarity).length,
    hasHighStrengthCount: inscriptions.filter(i => i.strengthening.hasHighStrength).length,
    hasHighDepthCount: inscriptions.filter(i => i.deepening.hasHighDepth).length,
    hasHighPurityCount: inscriptions.filter(i => i.purifying.hasHighPurity).length,
    hasHighWisdomCount: inscriptions.filter(i => i.transmuting.hasHighWisdom).length,
    overallWisdom,
    sageGrade: classifySageGrade(overallWisdom),
    bestInscription, clearest, strongest, deepest, purest,
  }

  const recommendations = generateRecommendations(inscriptions, archives, library, stats)

  return { inscriptions, archives, library, stats, recommendations }
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
