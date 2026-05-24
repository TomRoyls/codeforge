// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Vision clarity grade */
export type VisionGrade =
  | 'all-seeing'
  | 'eagle-eye'
  | 'proper-vision'
  | 'short-sighted'
  | 'dim-sight'
  | 'blind'

/** Hardness grade */
export type HardnessGrade =
  | 'diamond-level'
  | 'corundum-hard'
  | 'proper-hard'
  | 'medium-grade'
  | 'soft-mineral'
  | 'talc-soft'

/** Color royalty grade */
export type ColorGrade =
  | 'royal-blue'
  | 'cornflower-blue'
  | 'proper-blue'
  | 'teal'
  | 'greenish'
  | 'colorless'

/** Brilliance grade */
export type BrillianceGrade =
  | 'star-sapphire'
  | 'brilliant-flash'
  | 'proper-sparkle'
  | 'subtle-glow'
  | 'dull-stone'
  | 'no-light'

/** Calm depth grade */
export type CalmGrade =
  | 'ocean-depth'
  | 'deep-serenity'
  | 'proper-calm'
  | 'restless'
  | 'turbulent'
  | 'chaotic'

/** Sapphire condition */
export type SapphireCondition =
  | 'star-sapphire'
  | 'royal-gem'
  | 'proper-sapphire'
  | 'industrial-corundum'
  | 'cloudy-stone'
  | 'gravel'

/** Vault type */
export type VaultType =
  | 'royal-treasury'
  | 'gem-vault'
  | 'proper-safe'
  | 'jewelry-box'
  | 'display-case'
  | 'no-vault'

/** Vault condition */
export type VaultCondition =
  | 'crown-jewels'
  | 'precious-collection'
  | 'decent-gems'
  | 'common-stones'
  | 'fakes'
  | 'empty'

/** Seer grade */
export type SeerGrade =
  | 'oracle'
  | 'royal-seer'
  | 'skilled-diviner'
  | 'apprentice'
  | 'novice'
  | 'blind-fortune-teller'

/** Seeing measurement */
export interface SeeingMeasure {
  clarity: number
  grade: VisionGrade
  hasHighClarity: boolean
  hasInsightful: boolean
  hasPerceptive: boolean
  hasNoOblivious: boolean
  hasForesighted: boolean
  hasNoReactive: boolean
  hasObservant: boolean
  hasNoBlind: boolean
  hasAware: boolean
  hasNoUnaware: boolean
  hasDiscerning: boolean
  obliviousCount: number
  reactiveCount: number
}

/** Hardening measurement */
export interface HardeningMeasure {
  grade: number
  hardness: HardnessGrade
  hasHighGrade: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasNoFragile: boolean
  hasTough: boolean
  hasNoBrittle: boolean
  hasResilient: boolean
  hasNoBreakable: boolean
  hasSolid: boolean
  hasNoWeak: boolean
  hasSturdy: boolean
  fragileCount: number
  brittleCount: number
}

/** Coloring measurement */
export interface ColoringMeasure {
  royalty: number
  color: ColorGrade
  hasHighRoyalty: boolean
  hasElegant: boolean
  hasRefined: boolean
  hasNoCrude: boolean
  hasSophisticated: boolean
  hasNoClunky: boolean
  hasGraceful: boolean
  hasNoHarsh: boolean
  hasNoble: boolean
  hasNoCommon: boolean
  hasPolished: boolean
  crudeCount: number
  clunkyCount: number
}

/** Shining measurement */
export interface ShiningMeasure {
  level: number
  brilliance: BrillianceGrade
  hasHighLevel: boolean
  hasImpactful: boolean
  hasStriking: boolean
  hasNoWeak: boolean
  hasDazzling: boolean
  hasNoDim: boolean
  hasVivid: boolean
  hasNoFaint: boolean
  hasBrilliant: boolean
  hasNoFlat: boolean
  hasRadiant: boolean
  weakCount: number
  dimCount: number
}

/** Calming measurement */
export interface CalmingMeasure {
  depth: number
  calm: CalmGrade
  hasHighDepth: boolean
  hasSerene: boolean
  hasStable: boolean
  hasNoErratic: boolean
  hasPeaceful: boolean
  hasNoChaotic: boolean
  hasComposed: boolean
  hasNoFrantic: boolean
  hasTranquil: boolean
  hasNoAgitated: boolean
  hasSteady: boolean
  erraticCount: number
  chaoticCount: number
}

/** Single file analysis */
export interface SapphireGaze {
  file: string
  visionClarity: number
  hardnessGrade: number
  colorRoyalty: number
  brillianceLevel: number
  calmDepth: number
  seeing: SeeingMeasure
  hardening: HardeningMeasure
  coloring: ColoringMeasure
  shining: ShiningMeasure
  calming: CalmingMeasure
  condition: SapphireCondition
  qualityScore: number
}

/** Directory-level vault */
export interface SapphireVault {
  directory: string
  gazes: SapphireGaze[]
  avgClarity: number
  avgHardness: number
  avgCalm: number
  starSapphireCount: number
  gravelCount: number
  vaultType: VaultType
  condition: VaultCondition
}

/** Crown summary */
export interface CrownSummary {
  avgClarity: number
  avgHardness: number
  avgCalm: number
  isWise: boolean
  overallWisdom: number
}

/** Full stats */
export interface SapphireEyeStats {
  totalFiles: number
  totalVaults: number
  avgVisionClarity: number
  avgHardnessGrade: number
  avgColorRoyalty: number
  avgBrillianceLevel: number
  avgCalmDepth: number
  starSapphireCount: number
  royalGemCount: number
  properSapphireCount: number
  industrialCorundumCount: number
  cloudyStoneCount: number
  gravelCount: number
  hasHighClarityCount: number
  hasHighGradeCount: number
  hasHighRoyaltyCount: number
  hasHighLevelCount: number
  hasHighDepthCount: number
  overallWisdom: number
  seerGrade: SeerGrade
  bestGaze: string
  clearest: string
  hardest: string
  mostRoyal: string
  mostBrilliant: string
}

/** Full result */
export interface SapphireEyeResult {
  gazes: SapphireGaze[]
  vaults: SapphireVault[]
  crown: CrownSummary
  stats: SapphireEyeStats
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
 * Measure vision clarity
 * @example
 * const m = measureSeeing(content)
 * console.log(m.grade) // 'all-seeing'
 */
export function measureSeeing(content: string): SeeingMeasure {
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

  const hasInsightful = hasDocComments(content) && hasExport(content)
  const hasPerceptive = hasReturnType(content) && hasInterface(content)
  const hasForesighted = hasGenerics(content) && hasTypeAlias(content)
  const hasObservant = hasNamedExport(content) && hasConst(content)
  const hasAware = hasClass(content) && hasAsync(content)
  const hasDiscerning = hasExport(content) && hasGenerics(content)

  score += hasInsightful ? 5 : 0
  score += hasPerceptive ? 5 : 0
  score += hasForesighted ? 5 : 0
  score += hasObservant ? 5 : 0
  score += hasAware ? 5 : 0
  score += hasDiscerning ? 5 : 0

  const clarity = Math.min(score, 100)
  const obliviousCount = count(/\bvar\b/, content)
  const reactiveCount = count(/\bany\b/, content)

  const hasNoOblivious = obliviousCount === 0
  const hasNoReactive = reactiveCount === 0
  const hasNoBlind = !has(/\beval\b/, content)
  const hasNoUnaware = !has(/\bdebugger\b/, content)
  const hasHighClarity = clarity >= 70

  let grade: VisionGrade
  if (clarity >= 85) grade = 'all-seeing'
  else if (clarity >= 70) grade = 'eagle-eye'
  else if (clarity >= 55) grade = 'proper-vision'
  else if (clarity >= 40) grade = 'short-sighted'
  else if (clarity >= 25) grade = 'dim-sight'
  else grade = 'blind'

  return {
    clarity, grade, hasHighClarity, hasInsightful, hasPerceptive, hasNoOblivious,
    hasForesighted, hasNoReactive, hasObservant, hasNoBlind, hasAware,
    hasNoUnaware, hasDiscerning, obliviousCount, reactiveCount,
  }
}

/**
 * Measure hardness grade
 * @example
 * const m = measureHardening(content)
 * console.log(m.hardness) // 'diamond-level'
 */
export function measureHardening(content: string): HardeningMeasure {
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
  const hasTough = hasInterface(content) && hasClass(content)
  const hasResilient = hasStrictEq(content) && hasReturnType(content)
  const hasDurable = hasGenerics(content) && hasAsync(content)
  const hasSturdy = hasExport(content) && hasGenerics(content)

  score += hasSolid ? 5 : 0
  score += hasRobust ? 5 : 0
  score += hasTough ? 5 : 0
  score += hasResilient ? 5 : 0
  score += hasDurable ? 5 : 0
  score += hasSturdy ? 5 : 0

  const gradeVal = Math.min(score, 100)
  const fragileCount = count(/\bvar\b/, content)
  const brittleCount = count(/\bany\b/, content)

  const hasNoFragile = fragileCount === 0
  const hasNoBrittle = brittleCount === 0
  const hasNoBreakable = !has(/\beval\b/, content)
  const hasNoWeak = !has(/\bdebugger\b/, content)
  const hasHighGrade = gradeVal >= 70

  let hardness: HardnessGrade
  if (gradeVal >= 85) hardness = 'diamond-level'
  else if (gradeVal >= 70) hardness = 'corundum-hard'
  else if (gradeVal >= 55) hardness = 'proper-hard'
  else if (gradeVal >= 40) hardness = 'medium-grade'
  else if (gradeVal >= 25) hardness = 'soft-mineral'
  else hardness = 'talc-soft'

  return {
    grade: gradeVal, hardness, hasHighGrade, hasRobust, hasDurable, hasNoFragile,
    hasTough, hasNoBrittle, hasResilient, hasNoBreakable, hasSolid, hasNoWeak,
    hasSturdy, fragileCount, brittleCount,
  }
}

/**
 * Measure color royalty
 * @example
 * const m = measureColoring(content)
 * console.log(m.color) // 'royal-blue'
 */
export function measureColoring(content: string): ColoringMeasure {
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

  const hasElegant = hasDocComments(content) && hasInterface(content)
  const hasRefined = hasGenerics(content) && hasTypeAlias(content)
  const hasSophisticated = hasReadonly(content) && hasPrivate(content)
  const hasGraceful = hasReturnType(content) && hasStrictEq(content)
  const hasNoble = hasClass(content) && hasDocComments(content)
  const hasPolished = hasConst(content) && hasInterface(content)

  score += hasElegant ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasSophisticated ? 5 : 0
  score += hasGraceful ? 5 : 0
  score += hasNoble ? 5 : 0
  score += hasPolished ? 5 : 0

  const royalty = Math.min(score, 100)
  const crudeCount = count(/\bvar\b/, content)
  const clunkyCount = count(/\bany\b/, content)

  const hasNoCrude = crudeCount === 0
  const hasNoClunky = clunkyCount === 0
  const hasNoHarsh = !has(/\beval\b/, content)
  const hasNoCommon = !has(/\bdebugger\b/, content)
  const hasHighRoyalty = royalty >= 70

  let color: ColorGrade
  if (royalty >= 85) color = 'royal-blue'
  else if (royalty >= 70) color = 'cornflower-blue'
  else if (royalty >= 55) color = 'proper-blue'
  else if (royalty >= 40) color = 'teal'
  else if (royalty >= 25) color = 'greenish'
  else color = 'colorless'

  return {
    royalty, color, hasHighRoyalty, hasElegant, hasRefined, hasNoCrude,
    hasSophisticated, hasNoClunky, hasGraceful, hasNoHarsh, hasNoble,
    hasNoCommon, hasPolished, crudeCount, clunkyCount,
  }
}

/**
 * Measure brilliance level
 * @example
 * const m = measureShining(content)
 * console.log(m.brilliance) // 'star-sapphire'
 */
export function measureShining(content: string): ShiningMeasure {
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
  const hasStriking = hasInterface(content) && hasGenerics(content)
  const hasDazzling = hasTypeAlias(content) && hasAsync(content)
  const hasVivid = hasImport(content) && hasClass(content)
  const hasBrilliant = hasReturnType(content) && hasDocComments(content)
  const hasRadiant = hasNamedExport(content) && hasInterface(content)

  score += hasImpactful ? 5 : 0
  score += hasStriking ? 5 : 0
  score += hasDazzling ? 5 : 0
  score += hasVivid ? 5 : 0
  score += hasBrilliant ? 5 : 0
  score += hasRadiant ? 5 : 0

  const level = Math.min(score, 100)
  const weakCount = count(/\bvar\b/, content)
  const dimCount = count(/\bany\b/, content)

  const hasNoWeak = weakCount === 0
  const hasNoDim = dimCount === 0
  const hasNoFaint = !has(/\beval\b/, content)
  const hasNoFlat = !has(/\bdebugger\b/, content)
  const hasHighLevel = level >= 70

  let brilliance: BrillianceGrade
  if (level >= 85) brilliance = 'star-sapphire'
  else if (level >= 70) brilliance = 'brilliant-flash'
  else if (level >= 55) brilliance = 'proper-sparkle'
  else if (level >= 40) brilliance = 'subtle-glow'
  else if (level >= 25) brilliance = 'dull-stone'
  else brilliance = 'no-light'

  return {
    level, brilliance, hasHighLevel, hasImpactful, hasStriking, hasNoWeak,
    hasDazzling, hasNoDim, hasVivid, hasNoFaint, hasBrilliant, hasNoFlat,
    hasRadiant, weakCount, dimCount,
  }
}

/**
 * Measure calm depth
 * @example
 * const m = measureCalming(content)
 * console.log(m.calm) // 'ocean-depth'
 */
export function measureCalming(content: string): CalmingMeasure {
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

  const hasSerene = hasReturnType(content) && hasStrictEq(content)
  const hasStable = hasReadonly(content) && hasPrivate(content)
  const hasPeaceful = hasInterface(content) && hasGenerics(content)
  const hasComposed = hasTypeAlias(content) && hasDocComments(content)
  const hasTranquil = hasClass(content) && hasReturnType(content)
  const hasSteady = hasConst(content) && hasStrictEq(content)

  score += hasSerene ? 5 : 0
  score += hasStable ? 5 : 0
  score += hasPeaceful ? 5 : 0
  score += hasComposed ? 5 : 0
  score += hasTranquil ? 5 : 0
  score += hasSteady ? 5 : 0

  const depth = Math.min(score, 100)
  const erraticCount = count(/\bvar\b/, content)
  const chaoticCount = count(/\bany\b/, content)

  const hasNoErratic = erraticCount === 0
  const hasNoChaotic = chaoticCount === 0
  const hasNoFrantic = !has(/\beval\b/, content)
  const hasNoAgitated = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let calm: CalmGrade
  if (depth >= 85) calm = 'ocean-depth'
  else if (depth >= 70) calm = 'deep-serenity'
  else if (depth >= 55) calm = 'proper-calm'
  else if (depth >= 40) calm = 'restless'
  else if (depth >= 25) calm = 'turbulent'
  else calm = 'chaotic'

  return {
    depth, calm, hasHighDepth, hasSerene, hasStable, hasNoErratic,
    hasPeaceful, hasNoChaotic, hasComposed, hasNoFrantic, hasTranquil,
    hasNoAgitated, hasSteady, erraticCount, chaoticCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify sapphire condition
 * @example
 * classifySapphireCondition(90) // 'star-sapphire'
 */
export function classifySapphireCondition(score: number): SapphireCondition {
  if (score >= 85) return 'star-sapphire'
  if (score >= 70) return 'royal-gem'
  if (score >= 55) return 'proper-sapphire'
  if (score >= 40) return 'industrial-corundum'
  if (score >= 25) return 'cloudy-stone'
  return 'gravel'
}

/**
 * Classify vault type
 * @example
 * classifyVaultType(gazes) // 'royal-treasury'
 */
export function classifyVaultType(gazes: SapphireGaze[]): VaultType {
  if (gazes.length === 0) return 'no-vault'
  const avgQs = Math.round(gazes.reduce((s, g) => s + g.qualityScore, 0) / gazes.length)
  const starRatio = gazes.filter(g => g.condition === 'star-sapphire').length / gazes.length
  if (avgQs >= 75 && starRatio >= 0.5) return 'royal-treasury'
  if (avgQs >= 60) return 'gem-vault'
  if (avgQs >= 45) return 'proper-safe'
  if (avgQs >= 30) return 'jewelry-box'
  if (avgQs >= 15) return 'display-case'
  return 'no-vault'
}

/**
 * Classify vault condition
 * @example
 * classifyVaultCondition(80) // 'crown-jewels'
 */
export function classifyVaultCondition(avgQs: number): VaultCondition {
  if (avgQs >= 75) return 'crown-jewels'
  if (avgQs >= 60) return 'precious-collection'
  if (avgQs >= 45) return 'decent-gems'
  if (avgQs >= 30) return 'common-stones'
  if (avgQs >= 15) return 'fakes'
  return 'empty'
}

/**
 * Classify seer grade
 * @example
 * classifySeerGrade(85) // 'oracle'
 */
export function classifySeerGrade(avgWisdom: number): SeerGrade {
  if (avgWisdom >= 80) return 'oracle'
  if (avgWisdom >= 65) return 'royal-seer'
  if (avgWisdom >= 50) return 'skilled-diviner'
  if (avgWisdom >= 35) return 'apprentice'
  if (avgWisdom >= 20) return 'novice'
  return 'blind-fortune-teller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(gazes, vaults, crown, stats)
 */
export function generateRecommendations(
  gazes: SapphireGaze[],
  vaults: SapphireVault[],
  crown: CrownSummary,
  stats: SapphireEyeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgVisionClarity < 50) {
    recs.push('Sharpen vision clarity with insightful doc comments, perceptive return types, and observant named exports')
  }
  if (stats.avgHardnessGrade < 50) {
    recs.push('Harden your sapphires with solid imports, robust private fields, and tough interface foundations')
  }
  if (stats.avgColorRoyalty < 50) {
    recs.push('Enhance color royalty with elegant doc comments, refined generics, and sophisticated readonly patterns')
  }
  if (stats.avgBrillianceLevel < 50) {
    recs.push('Boost brilliance with impactful named exports, striking interfaces, and dazzling type transformations')
  }
  if (stats.avgCalmDepth < 50) {
    recs.push('Deepen calm with serene return types, stable readonly guards, and peaceful type definitions')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — consider significant refactoring`)
  }
  if (crown.overallWisdom < 40) {
    recs.push('Overall sapphire wisdom is poor — focus on vision clarity and hardness first')
  }
  const allEmpty = vaults.every(v => v.vaultType === 'no-vault' || v.vaultType === 'display-case')
  if (allEmpty && vaults.length > 0) {
    recs.push('All vaults are display cases or empty — consider a major quality overhaul')
  }
  const gravel = gazes.filter(g => g.condition === 'gravel').map(g => g.file)
  if (gravel.length > 0 && gravel.length <= 3) {
    recs.push(`Polish these gravel files into sapphires: ${gravel.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your sapphire collection is oracle-quality! Every gem sees with perfect clarity')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as sapphire gaze
 * @example
 * const gaze = analyzeSapphireGaze(content, 'index.ts')
 * console.log(gaze.condition) // 'star-sapphire'
 */
export function analyzeSapphireGaze(content: string, filePath: string): SapphireGaze {
  const seeing = measureSeeing(content)
  const hardening = measureHardening(content)
  const coloring = measureColoring(content)
  const shining = measureShining(content)
  const calming = measureCalming(content)

  const qualityScore = Math.round(
    seeing.clarity * 0.2 +
    hardening.grade * 0.2 +
    coloring.royalty * 0.2 +
    shining.level * 0.2 +
    calming.depth * 0.2,
  )

  return {
    file: filePath,
    visionClarity: seeing.clarity,
    hardnessGrade: hardening.grade,
    colorRoyalty: coloring.royalty,
    brillianceLevel: shining.level,
    calmDepth: calming.depth,
    seeing,
    hardening,
    coloring,
    shining,
    calming,
    condition: classifySapphireCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as a sapphire vault
 * @example
 * const vault = analyzeSapphireVault(gazes, 'src')
 * console.log(vault.vaultType) // 'royal-treasury'
 */
export function analyzeSapphireVault(gazes: SapphireGaze[], dirPath: string): SapphireVault {
  if (gazes.length === 0) {
    return {
      directory: dirPath, gazes: [], avgClarity: 0, avgHardness: 0, avgCalm: 0,
      starSapphireCount: 0, gravelCount: 0, vaultType: 'no-vault', condition: 'empty',
    }
  }

  const avgClarity = Math.round(gazes.reduce((s, g) => s + g.visionClarity, 0) / gazes.length)
  const avgHardness = Math.round(gazes.reduce((s, g) => s + g.hardnessGrade, 0) / gazes.length)
  const avgCalm = Math.round(gazes.reduce((s, g) => s + g.calmDepth, 0) / gazes.length)
  const starSapphireCount = gazes.filter(g => g.condition === 'star-sapphire').length
  const gravelCount = gazes.filter(g => g.condition === 'gravel').length
  const avgQs = Math.round(gazes.reduce((s, g) => s + g.qualityScore, 0) / gazes.length)

  return {
    directory: dirPath, gazes, avgClarity, avgHardness, avgCalm,
    starSapphireCount, gravelCount, vaultType: classifyVaultType(gazes),
    condition: classifyVaultCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete sapphire eye result
 * @example
 * const result = await buildSapphireEyeResult(files, contents)
 * console.log(result.stats.seerGrade) // 'oracle'
 */
export async function buildSapphireEyeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireEyeResult> {
  const gazes = files.map((file, i) => analyzeSapphireGaze(contents[i] ?? '', file))

  const dirMap = new Map<string, SapphireGaze[]>()
  for (const gaze of gazes) {
    const dir = path.dirname(gaze.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(gaze) } else { dirMap.set(dir, [gaze]) }
  }

  const vaults = Array.from(dirMap.entries()).map(([dir, dirGazes]) =>
    analyzeSapphireVault(dirGazes, dir),
  )

  const avgClarity = gazes.length > 0
    ? Math.round(gazes.reduce((s, g) => s + g.visionClarity, 0) / gazes.length) : 0
  const avgHardness = gazes.length > 0
    ? Math.round(gazes.reduce((s, g) => s + g.hardnessGrade, 0) / gazes.length) : 0
  const avgCalm = gazes.length > 0
    ? Math.round(gazes.reduce((s, g) => s + g.calmDepth, 0) / gazes.length) : 0

  const overallWisdom = gazes.length > 0
    ? Math.round((avgClarity + avgHardness + avgCalm) / 3) : 0
  const isWise = avgClarity >= 60

  const crown: CrownSummary = { avgClarity, avgHardness, avgCalm, isWise, overallWisdom }

  const avgColorRoyalty = gazes.length > 0
    ? Math.round(gazes.reduce((s, g) => s + g.colorRoyalty, 0) / gazes.length) : 0
  const avgBrillianceLevel = gazes.length > 0
    ? Math.round(gazes.reduce((s, g) => s + g.brillianceLevel, 0) / gazes.length) : 0

  const bestGaze = gazes.length > 0
    ? gazes.reduce((best, g) => g.qualityScore > best.qualityScore ? g : best).file : ''
  const clearest = gazes.length > 0
    ? gazes.reduce((best, g) => g.visionClarity > best.visionClarity ? g : best).file : ''
  const hardest = gazes.length > 0
    ? gazes.reduce((best, g) => g.hardnessGrade > best.hardnessGrade ? g : best).file : ''
  const mostRoyal = gazes.length > 0
    ? gazes.reduce((best, g) => g.colorRoyalty > best.colorRoyalty ? g : best).file : ''
  const mostBrilliant = gazes.length > 0
    ? gazes.reduce((best, g) => g.brillianceLevel > best.brillianceLevel ? g : best).file : ''

  const stats: SapphireEyeStats = {
    totalFiles: gazes.length,
    totalVaults: vaults.length,
    avgVisionClarity: avgClarity,
    avgHardnessGrade: avgHardness,
    avgColorRoyalty,
    avgBrillianceLevel,
    avgCalmDepth: avgCalm,
    starSapphireCount: gazes.filter(g => g.condition === 'star-sapphire').length,
    royalGemCount: gazes.filter(g => g.condition === 'royal-gem').length,
    properSapphireCount: gazes.filter(g => g.condition === 'proper-sapphire').length,
    industrialCorundumCount: gazes.filter(g => g.condition === 'industrial-corundum').length,
    cloudyStoneCount: gazes.filter(g => g.condition === 'cloudy-stone').length,
    gravelCount: gazes.filter(g => g.condition === 'gravel').length,
    hasHighClarityCount: gazes.filter(g => g.seeing.hasHighClarity).length,
    hasHighGradeCount: gazes.filter(g => g.hardening.hasHighGrade).length,
    hasHighRoyaltyCount: gazes.filter(g => g.coloring.hasHighRoyalty).length,
    hasHighLevelCount: gazes.filter(g => g.shining.hasHighLevel).length,
    hasHighDepthCount: gazes.filter(g => g.calming.hasHighDepth).length,
    overallWisdom,
    seerGrade: classifySeerGrade(overallWisdom),
    bestGaze, clearest, hardest, mostRoyal, mostBrilliant,
  }

  const recommendations = generateRecommendations(gazes, vaults, crown, stats)

  return { gazes, vaults, crown, stats, recommendations }
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
