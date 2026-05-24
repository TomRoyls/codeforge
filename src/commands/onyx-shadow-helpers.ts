// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Mystery depth grade */
export type MysteryGrade =
  | 'abyssal-depth'
  | 'deep-shadow'
  | 'proper-darkness'
  | 'surface-shadow'
  | 'thin-veil'
  | 'transparent'

/** Polish perfection grade */
export type PolishGrade =
  | 'mirror-black'
  | 'silk-polish'
  | 'proper-sheen'
  | 'rough-surface'
  | 'unpolished'
  | 'raw-stone'

/** Grounding strength grade */
export type GroundGrade =
  | 'bedrock-solid'
  | 'deep-rooted'
  | 'proper-grounding'
  | 'shallow-ground'
  | 'floating'
  | 'unanchored'

/** Shadow integration grade */
export type IntegrationGrade =
  | 'shadow-master'
  | 'dark-integration'
  | 'proper-handling'
  | 'partial-coverage'
  | 'shadow-gaps'
  | 'no-handling'

/** Light absorption grade */
export type FocusGrade =
  | 'total-focus'
  | 'deep-concentration'
  | 'proper-absorption'
  | 'scattered'
  | 'distracted'
  | 'dispersed'

/** Onyx condition */
export type OnyxCondition =
  | 'masterpiece-onyx'
  | 'fine-black-onyx'
  | 'proper-stone'
  | 'banded-agate'
  | 'common-chalcedony'
  | 'gravel'

/** Chamber type */
export type ChamberType =
  | 'shadow-vault'
  | 'deep-crypt'
  | 'proper-chamber'
  | 'stone-room'
  | 'pebble-box'
  | 'no-chamber'

/** Chamber condition */
export type ChamberCondition =
  | 'obsidian-hall'
  | 'dark-gallery'
  | 'decent-display'
  | 'dim-room'
  | 'empty-shelf'
  | 'void'

/** Keeper grade */
export type KeeperGrade =
  | 'shadow-lord'
  | 'dark-keeper'
  | 'stone-guardian'
  | 'apprentice'
  | 'novice'
  | 'surface-dweller'

/** Deepening measurement */
export interface DeepeningMeasure {
  mystery: number
  grade: MysteryGrade
  hasHighMystery: boolean
  hasDeep: boolean
  hasProfound: boolean
  hasNoShallow: boolean
  hasComplex: boolean
  hasNoTrivial: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasSubstantive: boolean
  hasNoHollow: boolean
  hasRich: boolean
  shallowCount: number
  trivialCount: number
}

/** Polishing measurement */
export interface PolishingMeasure {
  perfection: number
  polish: PolishGrade
  hasHighPerfection: boolean
  hasRefined: boolean
  hasSmooth: boolean
  hasNoRough: boolean
  hasPolished: boolean
  hasNoUnfinished: boolean
  hasGlossy: boolean
  hasNoMatte: boolean
  hasElegant: boolean
  hasNoCrude: boolean
  hasFlawless: boolean
  roughCount: number
  unfinishedCount: number
}

/** Grounding measurement */
export interface GroundingMeasure {
  strength: number
  ground: GroundGrade
  hasHighStrength: boolean
  hasStable: boolean
  hasFirm: boolean
  hasNoWobbly: boolean
  hasAnchored: boolean
  hasNoDrifting: boolean
  hasSecure: boolean
  hasNoUnstable: boolean
  hasRooted: boolean
  hasNoShaky: boolean
  hasSolid: boolean
  wobblyCount: number
  driftingCount: number
}

/** Integrating measurement */
export interface IntegratingMeasure {
  shadow: number
  integration: IntegrationGrade
  hasHighShadow: boolean
  hasComprehensive: boolean
  hasThorough: boolean
  hasNoGaps: boolean
  hasComplete: boolean
  hasNoMissing: boolean
  hasCovered: boolean
  hasNoExposed: boolean
  hasHandled: boolean
  hasNoUnhandled: boolean
  hasProtected: boolean
  gapsCount: number
  missingCount: number
}

/** Absorbing measurement */
export interface AbsorbingMeasure {
  absorption: number
  focus: FocusGrade
  hasHighAbsorption: boolean
  hasFocused: boolean
  hasConcentrated: boolean
  hasNoDistracted: boolean
  hasSingle: boolean
  hasNoMulti: boolean
  hasDedicated: boolean
  hasNoScattered: boolean
  hasSharp: boolean
  hasNoBlurry: boolean
  hasAttentive: boolean
  distractedCount: number
  scatteredCount: number
}

/** Single file analysis */
export interface OnyxShadow {
  file: string
  depthMystery: number
  polishPerfection: number
  groundingStrength: number
  shadowIntegration: number
  lightAbsorption: number
  deepening: DeepeningMeasure
  polishing: PolishingMeasure
  grounding: GroundingMeasure
  integrating: IntegratingMeasure
  absorbing: AbsorbingMeasure
  condition: OnyxCondition
  qualityScore: number
}

/** Directory-level chamber */
export interface OnyxChamber {
  directory: string
  shadows: OnyxShadow[]
  avgMystery: number
  avgPerfection: number
  avgStrength: number
  masterpieceOnyxCount: number
  gravelCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

/** Abyss summary */
export interface AbyssSummary {
  avgMystery: number
  avgPerfection: number
  avgStrength: number
  isDeep: boolean
  overallDepth: number
}

/** Full stats */
export interface OnyxShadowStats {
  totalFiles: number
  totalChambers: number
  avgDepthMystery: number
  avgPolishPerfection: number
  avgGroundingStrength: number
  avgShadowIntegration: number
  avgLightAbsorption: number
  masterpieceOnyxCount: number
  fineBlackOnyxCount: number
  properStoneCount: number
  bandedAgateCount: number
  commonChalcedonyCount: number
  gravelCount: number
  hasHighMysteryCount: number
  hasHighPerfectionCount: number
  hasHighStrengthCount: number
  hasHighShadowCount: number
  hasHighAbsorptionCount: number
  overallDepth: number
  keeperGrade: KeeperGrade
  bestShadow: string
  deepest: string
  mostPolished: string
  mostGrounded: string
  mostIntegrated: string
}

/** Full result */
export interface OnyxShadowResult {
  shadows: OnyxShadow[]
  chambers: OnyxChamber[]
  abyss: AbyssSummary
  stats: OnyxShadowStats
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
 * Measure depth mystery
 * @example
 * const m = measureDeepening(content)
 * console.log(m.grade) // 'abyssal-depth'
 */
export function measureDeepening(content: string): DeepeningMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasDeep = hasExport(content) && hasClass(content)
  const hasProfound = hasInterface(content) && hasGenerics(content)
  const hasComplex = hasReturnType(content) && hasNamedExport(content)
  const hasLayered = hasImport(content) && hasDocComments(content)
  const hasSubstantive = hasTypeAlias(content) && hasAsync(content)
  const hasRich = hasClass(content) && hasInterface(content)

  score += hasDeep ? 5 : 0
  score += hasProfound ? 5 : 0
  score += hasComplex ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasRich ? 5 : 0

  const mystery = Math.min(score, 100)
  const shallowCount = count(/\bvar\b/, content)
  const trivialCount = count(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoTrivial = trivialCount === 0
  const hasNoFlat = !has(/\beval\b/, content)
  const hasNoHollow = !has(/\bdebugger\b/, content)
  const hasHighMystery = mystery >= 70

  let grade: MysteryGrade
  if (mystery >= 85) grade = 'abyssal-depth'
  else if (mystery >= 70) grade = 'deep-shadow'
  else if (mystery >= 55) grade = 'proper-darkness'
  else if (mystery >= 40) grade = 'surface-shadow'
  else if (mystery >= 25) grade = 'thin-veil'
  else grade = 'transparent'

  return {
    mystery, grade, hasHighMystery, hasDeep, hasProfound, hasNoShallow,
    hasComplex, hasNoTrivial, hasLayered, hasNoFlat, hasSubstantive, hasNoHollow,
    hasRich, shallowCount, trivialCount,
  }
}

/**
 * Measure polish perfection
 * @example
 * const m = measurePolishing(content)
 * console.log(m.polish) // 'mirror-black'
 */
export function measurePolishing(content: string): PolishingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasReadonly(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasRefined = hasDocComments(content) && hasReadonly(content)
  const hasSmooth = hasReturnType(content) && hasStrictEq(content)
  const hasPolished = hasConst(content) && hasPrivate(content)
  const hasGlossy = hasInterface(content) && hasNamedExport(content)
  const hasElegant = hasExport(content) && hasTypeAlias(content)
  const hasFlawless = hasDocComments(content) && hasStrictEq(content)

  score += hasRefined ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasGlossy ? 5 : 0
  score += hasElegant ? 5 : 0
  score += hasFlawless ? 5 : 0

  const perfection = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const unfinishedCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoUnfinished = unfinishedCount === 0
  const hasNoMatte = !has(/\beval\b/, content)
  const hasNoCrude = !has(/\bdebugger\b/, content)
  const hasHighPerfection = perfection >= 70

  let polish: PolishGrade
  if (perfection >= 85) polish = 'mirror-black'
  else if (perfection >= 70) polish = 'silk-polish'
  else if (perfection >= 55) polish = 'proper-sheen'
  else if (perfection >= 40) polish = 'rough-surface'
  else if (perfection >= 25) polish = 'unpolished'
  else polish = 'raw-stone'

  return {
    perfection, polish, hasHighPerfection, hasRefined, hasSmooth, hasNoRough,
    hasPolished, hasNoUnfinished, hasGlossy, hasNoMatte, hasElegant, hasNoCrude,
    hasFlawless, roughCount, unfinishedCount,
  }
}

/**
 * Measure grounding strength
 * @example
 * const m = measureGrounding(content)
 * console.log(m.ground) // 'bedrock-solid'
 */
export function measureGrounding(content: string): GroundingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasInterface(content) ? 10 : 0
  score += hasTypeAlias(content) ? 10 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasStable = hasConst(content) && hasStrictEq(content)
  const hasFirm = hasInterface(content) && hasTypeAlias(content)
  const hasAnchored = hasExport(content) && hasImport(content)
  const hasSecure = hasReturnType(content) && hasReadonly(content)
  const hasRooted = hasPrivate(content) && hasStrictEq(content)
  const hasSolid = hasClass(content) && hasConst(content)

  score += hasStable ? 5 : 0
  score += hasFirm ? 5 : 0
  score += hasAnchored ? 5 : 0
  score += hasSecure ? 5 : 0
  score += hasRooted ? 5 : 0
  score += hasSolid ? 5 : 0

  const strength = Math.min(score, 100)
  const wobblyCount = count(/\bvar\b/, content)
  const driftingCount = count(/\bany\b/, content)

  const hasNoWobbly = wobblyCount === 0
  const hasNoDrifting = driftingCount === 0
  const hasNoUnstable = !has(/\beval\b/, content)
  const hasNoShaky = !has(/\bdebugger\b/, content)
  const hasHighStrength = strength >= 70

  let ground: GroundGrade
  if (strength >= 85) ground = 'bedrock-solid'
  else if (strength >= 70) ground = 'deep-rooted'
  else if (strength >= 55) ground = 'proper-grounding'
  else if (strength >= 40) ground = 'shallow-ground'
  else if (strength >= 25) ground = 'floating'
  else ground = 'unanchored'

  return {
    strength, ground, hasHighStrength, hasStable, hasFirm, hasNoWobbly,
    hasAnchored, hasNoDrifting, hasSecure, hasNoUnstable, hasRooted, hasNoShaky,
    hasSolid, wobblyCount, driftingCount,
  }
}

/**
 * Measure shadow integration
 * @example
 * const m = measureIntegrating(content)
 * console.log(m.integration) // 'shadow-master'
 */
export function measureIntegrating(content: string): IntegratingMeasure {
  let score = 0
  score += hasNamedExport(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasComprehensive = hasNamedExport(content) && hasExport(content)
  const hasThorough = hasReturnType(content) && hasStrictEq(content)
  const hasComplete = hasReadonly(content) && hasPrivate(content)
  const hasCovered = hasInterface(content) && hasGenerics(content)
  const hasHandled = hasDocComments(content) && hasNamedExport(content)
  const hasProtected = hasClass(content) && hasReturnType(content)

  score += hasComprehensive ? 5 : 0
  score += hasThorough ? 5 : 0
  score += hasComplete ? 5 : 0
  score += hasCovered ? 5 : 0
  score += hasHandled ? 5 : 0
  score += hasProtected ? 5 : 0

  const shadow = Math.min(score, 100)
  const gapsCount = count(/\bvar\b/, content)
  const missingCount = count(/\bany\b/, content)

  const hasNoGaps = gapsCount === 0
  const hasNoMissing = missingCount === 0
  const hasNoExposed = !has(/\beval\b/, content)
  const hasNoUnhandled = !has(/\bdebugger\b/, content)
  const hasHighShadow = shadow >= 70

  let integration: IntegrationGrade
  if (shadow >= 85) integration = 'shadow-master'
  else if (shadow >= 70) integration = 'dark-integration'
  else if (shadow >= 55) integration = 'proper-handling'
  else if (shadow >= 40) integration = 'partial-coverage'
  else if (shadow >= 25) integration = 'shadow-gaps'
  else integration = 'no-handling'

  return {
    shadow, integration, hasHighShadow, hasComprehensive, hasThorough, hasNoGaps,
    hasComplete, hasNoMissing, hasCovered, hasNoExposed, hasHandled, hasNoUnhandled,
    hasProtected, gapsCount, missingCount,
  }
}

/**
 * Measure light absorption
 * @example
 * const m = measureAbsorbing(content)
 * console.log(m.focus) // 'total-focus'
 */
export function measureAbsorbing(content: string): AbsorbingMeasure {
  let score = 0
  score += hasConst(content) ? 10 : 0
  score += hasAsync(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0

  const hasFocused = hasConst(content) && hasAsync(content)
  const hasConcentrated = hasExport(content) && hasReturnType(content)
  const hasSingle = hasImport(content) && hasInterface(content)
  const hasDedicated = hasGenerics(content) && hasDocComments(content)
  const hasSharp = hasPrivate(content) && hasReadonly(content)
  const hasAttentive = hasAsync(content) && hasConst(content)

  score += hasFocused ? 5 : 0
  score += hasConcentrated ? 5 : 0
  score += hasSingle ? 5 : 0
  score += hasDedicated ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasAttentive ? 5 : 0

  const absorption = Math.min(score, 100)
  const distractedCount = count(/\bvar\b/, content)
  const scatteredCount = count(/\bany\b/, content)

  const hasNoDistracted = distractedCount === 0
  const hasNoMulti = scatteredCount === 0
  const hasNoScattered = !has(/\beval\b/, content)
  const hasNoBlurry = !has(/\bdebugger\b/, content)
  const hasHighAbsorption = absorption >= 70

  let focus: FocusGrade
  if (absorption >= 85) focus = 'total-focus'
  else if (absorption >= 70) focus = 'deep-concentration'
  else if (absorption >= 55) focus = 'proper-absorption'
  else if (absorption >= 40) focus = 'scattered'
  else if (absorption >= 25) focus = 'distracted'
  else focus = 'dispersed'

  return {
    absorption, focus, hasHighAbsorption, hasFocused, hasConcentrated, hasNoDistracted,
    hasSingle, hasNoMulti, hasDedicated, hasNoScattered, hasSharp, hasNoBlurry,
    hasAttentive, distractedCount, scatteredCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify onyx condition
 * @example
 * classifyOnyxCondition(90) // 'masterpiece-onyx'
 */
export function classifyOnyxCondition(score: number): OnyxCondition {
  if (score >= 85) return 'masterpiece-onyx'
  if (score >= 70) return 'fine-black-onyx'
  if (score >= 55) return 'proper-stone'
  if (score >= 40) return 'banded-agate'
  if (score >= 25) return 'common-chalcedony'
  return 'gravel'
}

/**
 * Classify chamber type
 * @example
 * classifyChamberType(shadows) // 'shadow-vault'
 */
export function classifyChamberType(shadows: OnyxShadow[]): ChamberType {
  if (shadows.length === 0) return 'no-chamber'
  const avgQs = Math.round(shadows.reduce((s, sh) => s + sh.qualityScore, 0) / shadows.length)
  const masterpieceRatio = shadows.filter(sh => sh.condition === 'masterpiece-onyx').length / shadows.length
  if (avgQs >= 75 && masterpieceRatio >= 0.5) return 'shadow-vault'
  if (avgQs >= 60) return 'deep-crypt'
  if (avgQs >= 45) return 'proper-chamber'
  if (avgQs >= 30) return 'stone-room'
  if (avgQs >= 15) return 'pebble-box'
  return 'no-chamber'
}

/**
 * Classify chamber condition
 * @example
 * classifyChamberCondition(80) // 'obsidian-hall'
 */
export function classifyChamberCondition(avgQs: number): ChamberCondition {
  if (avgQs >= 75) return 'obsidian-hall'
  if (avgQs >= 60) return 'dark-gallery'
  if (avgQs >= 45) return 'decent-display'
  if (avgQs >= 30) return 'dim-room'
  if (avgQs >= 15) return 'empty-shelf'
  return 'void'
}

/**
 * Classify keeper grade
 * @example
 * classifyKeeperGrade(85) // 'shadow-lord'
 */
export function classifyKeeperGrade(avgDepth: number): KeeperGrade {
  if (avgDepth >= 80) return 'shadow-lord'
  if (avgDepth >= 65) return 'dark-keeper'
  if (avgDepth >= 50) return 'stone-guardian'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'surface-dweller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(shadows, chambers, abyss, stats)
 */
export function generateRecommendations(
  shadows: OnyxShadow[],
  chambers: OnyxChamber[],
  abyss: AbyssSummary,
  stats: OnyxShadowStats,
): string[] {
  const recs: string[] = []
  if (stats.avgDepthMystery < 50) {
    recs.push('Deepen code mystery with layered exports, profound class structures, and complex return type patterns')
  }
  if (stats.avgPolishPerfection < 50) {
    recs.push('Polish code perfection with refined doc comments, smooth readonly guards, and flawless strict equality')
  }
  if (stats.avgGroundingStrength < 50) {
    recs.push('Strengthen grounding with stable const declarations, firm interface foundations, and anchored export/import pairs')
  }
  if (stats.avgShadowIntegration < 50) {
    recs.push('Integrate shadow handling with comprehensive named exports, thorough type coverage, and complete error patterns')
  }
  if (stats.avgLightAbsorption < 50) {
    recs.push('Sharpen light absorption with focused const/async pairs, concentrated return types, and dedicated generic patterns')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — consider significant refactoring`)
  }
  if (abyss.overallDepth < 40) {
    recs.push('Overall onyx depth is shallow — focus on mystery and polish first')
  }
  const allDim = chambers.every(ch => ch.chamberType === 'no-chamber' || ch.chamberType === 'pebble-box')
  if (allDim && chambers.length > 0) {
    recs.push('All chambers are dim or empty — consider a major quality overhaul')
  }
  const gravels = shadows.filter(sh => sh.condition === 'gravel').map(sh => sh.file)
  if (gravels.length > 0 && gravels.length <= 3) {
    recs.push(`Transform these gravel files into onyx masterpieces: ${gravels.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('470 commands - an onyx shadow of code analysis excellence! Your onyx depths are shadow-lord quality')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as onyx shadow
 * @example
 * const shadow = analyzeOnyxShadow(content, 'index.ts')
 * console.log(shadow.condition) // 'masterpiece-onyx'
 */
export function analyzeOnyxShadow(content: string, filePath: string): OnyxShadow {
  const deepening = measureDeepening(content)
  const polishing = measurePolishing(content)
  const grounding = measureGrounding(content)
  const integrating = measureIntegrating(content)
  const absorbing = measureAbsorbing(content)

  const qualityScore = Math.round(
    deepening.mystery * 0.2 +
    polishing.perfection * 0.2 +
    grounding.strength * 0.2 +
    integrating.shadow * 0.2 +
    absorbing.absorption * 0.2,
  )

  return {
    file: filePath,
    depthMystery: deepening.mystery,
    polishPerfection: polishing.perfection,
    groundingStrength: grounding.strength,
    shadowIntegration: integrating.shadow,
    lightAbsorption: absorbing.absorption,
    deepening,
    polishing,
    grounding,
    integrating,
    absorbing,
    condition: classifyOnyxCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as an onyx chamber
 * @example
 * const chamber = analyzeOnyxChamber(shadows, 'src')
 * console.log(chamber.chamberType) // 'shadow-vault'
 */
export function analyzeOnyxChamber(shadows: OnyxShadow[], dirPath: string): OnyxChamber {
  if (shadows.length === 0) {
    return {
      directory: dirPath, shadows: [], avgMystery: 0, avgPerfection: 0, avgStrength: 0,
      masterpieceOnyxCount: 0, gravelCount: 0, chamberType: 'no-chamber', condition: 'void',
    }
  }

  const avgMystery = Math.round(shadows.reduce((s, sh) => s + sh.depthMystery, 0) / shadows.length)
  const avgPerfection = Math.round(shadows.reduce((s, sh) => s + sh.polishPerfection, 0) / shadows.length)
  const avgStrength = Math.round(shadows.reduce((s, sh) => s + sh.groundingStrength, 0) / shadows.length)
  const masterpieceOnyxCount = shadows.filter(sh => sh.condition === 'masterpiece-onyx').length
  const gravelCount = shadows.filter(sh => sh.condition === 'gravel').length
  const avgQs = Math.round(shadows.reduce((s, sh) => s + sh.qualityScore, 0) / shadows.length)

  return {
    directory: dirPath, shadows, avgMystery, avgPerfection, avgStrength,
    masterpieceOnyxCount, gravelCount, chamberType: classifyChamberType(shadows),
    condition: classifyChamberCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete onyx shadow result
 * @example
 * const result = await buildOnyxShadowResult(files, contents)
 * console.log(result.stats.keeperGrade) // 'shadow-lord'
 */
export async function buildOnyxShadowResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OnyxShadowResult> {
  const shadows = files.map((file, i) => analyzeOnyxShadow(contents[i] ?? '', file))

  const dirMap = new Map<string, OnyxShadow[]>()
  for (const shadow of shadows) {
    const dir = path.dirname(shadow.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(shadow) } else { dirMap.set(dir, [shadow]) }
  }

  const chambers = Array.from(dirMap.entries()).map(([dir, dirShadows]) =>
    analyzeOnyxChamber(dirShadows, dir),
  )

  const avgMystery = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.depthMystery, 0) / shadows.length) : 0
  const avgPerfection = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.polishPerfection, 0) / shadows.length) : 0
  const avgStrength = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.groundingStrength, 0) / shadows.length) : 0

  const overallDepth = shadows.length > 0
    ? Math.round((avgMystery + avgPerfection + avgStrength) / 3) : 0
  const isDeep = avgMystery >= 60

  const abyss: AbyssSummary = { avgMystery, avgPerfection, avgStrength, isDeep, overallDepth }

  const avgShadowIntegration = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.shadowIntegration, 0) / shadows.length) : 0
  const avgLightAbsorption = shadows.length > 0
    ? Math.round(shadows.reduce((s, sh) => s + sh.lightAbsorption, 0) / shadows.length) : 0

  const bestShadow = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.qualityScore > best.qualityScore ? sh : best).file : ''
  const deepest = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.depthMystery > best.depthMystery ? sh : best).file : ''
  const mostPolished = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.polishPerfection > best.polishPerfection ? sh : best).file : ''
  const mostGrounded = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.groundingStrength > best.groundingStrength ? sh : best).file : ''
  const mostIntegrated = shadows.length > 0
    ? shadows.reduce((best, sh) => sh.shadowIntegration > best.shadowIntegration ? sh : best).file : ''

  const stats: OnyxShadowStats = {
    totalFiles: shadows.length,
    totalChambers: chambers.length,
    avgDepthMystery: avgMystery,
    avgPolishPerfection: avgPerfection,
    avgGroundingStrength: avgStrength,
    avgShadowIntegration,
    avgLightAbsorption,
    masterpieceOnyxCount: shadows.filter(sh => sh.condition === 'masterpiece-onyx').length,
    fineBlackOnyxCount: shadows.filter(sh => sh.condition === 'fine-black-onyx').length,
    properStoneCount: shadows.filter(sh => sh.condition === 'proper-stone').length,
    bandedAgateCount: shadows.filter(sh => sh.condition === 'banded-agate').length,
    commonChalcedonyCount: shadows.filter(sh => sh.condition === 'common-chalcedony').length,
    gravelCount: shadows.filter(sh => sh.condition === 'gravel').length,
    hasHighMysteryCount: shadows.filter(sh => sh.deepening.hasHighMystery).length,
    hasHighPerfectionCount: shadows.filter(sh => sh.polishing.hasHighPerfection).length,
    hasHighStrengthCount: shadows.filter(sh => sh.grounding.hasHighStrength).length,
    hasHighShadowCount: shadows.filter(sh => sh.integrating.hasHighShadow).length,
    hasHighAbsorptionCount: shadows.filter(sh => sh.absorbing.hasHighAbsorption).length,
    overallDepth,
    keeperGrade: classifyKeeperGrade(overallDepth),
    bestShadow, deepest, mostPolished, mostGrounded, mostIntegrated,
  }

  const recommendations = generateRecommendations(shadows, chambers, abyss, stats)

  return { shadows, chambers, abyss, stats, recommendations }
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
