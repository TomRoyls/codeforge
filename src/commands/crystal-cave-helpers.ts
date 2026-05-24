// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Formation quality grade */
export type FormationGrade =
  | 'geode-perfect'
  | 'crystal-growth'
  | 'proper-formation'
  | 'rough-deposit'
  | 'shapeless'
  | 'no-formation'

/** Stalactite precision grade */
export type StalactiteGrade =
  | 'perfect-drop'
  | 'precise-point'
  | 'proper-formation'
  | 'irregular-drip'
  | 'broken-stalactite'
  | 'no-formation'

/** Grotto depth grade */
export type GrottoGrade =
  | 'deep-cavern'
  | 'proper-depth'
  | 'decent-grotto'
  | 'shallow-cave'
  | 'surface-hollow'
  | 'no-depth'

/** Mineral diversity grade */
export type MineralGrade =
  | 'rainbow-cave'
  | 'diverse-minerals'
  | 'proper-variety'
  | 'limited-types'
  | 'monochrome'
  | 'no-variety'

/** Chamber resonance grade */
export type ChamberGrade =
  | 'concert-hall'
  | 'harmonic-chamber'
  | 'proper-acoustics'
  | 'dead-room'
  | 'echo-chamber'
  | 'silent'

/** Crystal condition */
export type CrystalCondition =
  | 'cathedral-cave'
  | 'crystal-grotto'
  | 'proper-cave'
  | 'limestone-hollow'
  | 'mud-cave'
  | 'no-cave'

/** System type */
export type SystemType =
  | 'mammoth-cave'
  | 'carlsbad-caverns'
  | 'proper-system'
  | 'small-cave'
  | 'rock-shelter'
  | 'no-system'

/** System condition */
export type SystemCondition =
  | 'spectacular-cave'
  | 'beautiful-grotto'
  | 'decent-cave'
  | 'rough-hollow'
  | 'collapsed'
  | 'filled-in'

/** Explorer grade */
export type ExplorerGrade =
  | 'master-spelunker'
  | 'expert-caver'
  | 'skilled-explorer'
  | 'apprentice'
  | 'novice'
  | 'surface-dweller'

/** Forming measurement */
export interface FormingMeasure {
  quality: number
  grade: FormationGrade
  hasHighQuality: boolean
  hasStructured: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasOrdered: boolean
  hasNoRandom: boolean
  hasSystematic: boolean
  hasNoHaphazard: boolean
  hasPatterned: boolean
  hasNoDisordered: boolean
  hasRegular: boolean
  chaoticCount: number
  randomCount: number
}

/** Hanging measurement */
export interface HangingMeasure {
  precision: number
  stalactite: StalactiteGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoImprecise: boolean
  hasTargeted: boolean
  hasNoScattered: boolean
  hasFocused: boolean
  hasNoDiffuse: boolean
  hasPrecise: boolean
  hasNoSloppy: boolean
  hasDeliberate: boolean
  impreciseCount: number
  scatteredCount: number
}

/** Deepening measurement */
export interface DeepeningMeasure {
  depth: number
  grotto: GrottoGrade
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

/** Diversifying measurement */
export interface DiversifyingMeasure {
  diversity: number
  mineral: MineralGrade
  hasHighDiversity: boolean
  hasVaried: boolean
  hasDiverse: boolean
  hasNoUniform: boolean
  hasColorful: boolean
  hasNoDrab: boolean
  hasRich: boolean
  hasNoSparse: boolean
  hasMultiple: boolean
  hasNoSingle: boolean
  hasAbundant: boolean
  uniformCount: number
  drabCount: number
}

/** Resonating measurement */
export interface ResonatingMeasure {
  resonance: number
  chamber: ChamberGrade
  hasHighResonance: boolean
  hasHarmonious: boolean
  hasIntegrated: boolean
  hasNoIsolated: boolean
  hasConnected: boolean
  hasNoDisconnected: boolean
  hasResonant: boolean
  hasNoDead: boolean
  hasCoupled: boolean
  hasNoSeparated: boolean
  hasSounding: boolean
  isolatedCount: number
  disconnectedCount: number
}

/** Single file analysis */
export interface CaveCrystal {
  file: string
  formationQuality: number
  stalactitePrecision: number
  grottoDepth: number
  mineralDiversity: number
  chamberResonance: number
  forming: FormingMeasure
  hanging: HangingMeasure
  deepening: DeepeningMeasure
  diversifying: DiversifyingMeasure
  resonating: ResonatingMeasure
  condition: CrystalCondition
  qualityScore: number
}

/** Directory-level system */
export interface CaveSystem {
  directory: string
  crystals: CaveCrystal[]
  avgFormation: number
  avgDepth: number
  avgResonance: number
  cathedralCaveCount: number
  noCaveCount: number
  systemType: SystemType
  condition: SystemCondition
}

/** Underground summary */
export interface UndergroundSummary {
  avgFormation: number
  avgDepth: number
  avgResonance: number
  isDeep: boolean
  overallSplendor: number
}

/** Full stats */
export interface CrystalCaveStats {
  totalFiles: number
  totalSystems: number
  avgFormationQuality: number
  avgStalactitePrecision: number
  avgGrottoDepth: number
  avgMineralDiversity: number
  avgChamberResonance: number
  cathedralCaveCount: number
  crystalGrottoCount: number
  properCaveCount: number
  limestoneHollowCount: number
  mudCaveCount: number
  noCaveCount: number
  hasHighQualityCount: number
  hasHighPrecisionCount: number
  hasHighDepthCount: number
  hasHighDiversityCount: number
  hasHighResonanceCount: number
  overallSplendor: number
  explorerGrade: ExplorerGrade
  bestCrystal: string
  bestFormed: string
  mostPrecise: string
  deepest: string
  mostDiverse: string
}

/** Full result */
export interface CrystalCaveResult {
  crystals: CaveCrystal[]
  systems: CaveSystem[]
  underground: UndergroundSummary
  stats: CrystalCaveStats
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
 * Measure formation quality
 * @example
 * const m = measureForming(content)
 * console.log(m.grade) // 'geode-perfect'
 */
export function measureForming(content: string): FormingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0

  const hasStructured = hasExport(content) && hasConst(content)
  const hasOrganized = hasReturnType(content) && hasInterface(content)
  const hasOrdered = hasImport(content) && hasNamedExport(content)
  const hasSystematic = hasAsync(content) && hasGenerics(content)
  const hasPatterned = hasDocComments(content) && hasExport(content)
  const hasRegular = hasTypeAlias(content) && hasConst(content)

  score += hasStructured ? 5 : 0
  score += hasOrganized ? 5 : 0
  score += hasOrdered ? 5 : 0
  score += hasSystematic ? 5 : 0
  score += hasPatterned ? 5 : 0
  score += hasRegular ? 5 : 0

  const quality = Math.min(score, 100)
  const chaoticCount = countMatches(/\bvar\b/, content)
  const randomCount = countMatches(/\bany\b/, content)

  const hasNoChaotic = chaoticCount === 0
  const hasNoRandom = randomCount === 0
  const hasNoHaphazard = !has(/\beval\b/, content)
  const hasNoDisordered = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let grade: FormationGrade
  if (quality >= 85) grade = 'geode-perfect'
  else if (quality >= 70) grade = 'crystal-growth'
  else if (quality >= 55) grade = 'proper-formation'
  else if (quality >= 40) grade = 'rough-deposit'
  else if (quality >= 25) grade = 'shapeless'
  else grade = 'no-formation'

  return {
    quality, grade, hasHighQuality, hasStructured, hasOrganized, hasNoChaotic,
    hasOrdered, hasNoRandom, hasSystematic, hasNoHaphazard, hasPatterned,
    hasNoDisordered, hasRegular, chaoticCount, randomCount,
  }
}

/**
 * Measure stalactite precision
 * @example
 * const m = measureHanging(content)
 * console.log(m.stalactite) // 'perfect-drop'
 */
export function measureHanging(content: string): HangingMeasure {
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

  const hasAccurate = hasConst(content) && hasStrictEq(content)
  const hasExact = hasReturnType(content) && hasReadonly(content)
  const hasTargeted = hasInterface(content) && hasClass(content)
  const hasFocused = hasExport(content) && hasImport(content)
  const hasPrecise = hasPrivate(content) && hasStrictEq(content)
  const hasDeliberate = hasTypeAlias(content) && hasConst(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasTargeted ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasDeliberate ? 5 : 0

  const precision = Math.min(score, 100)
  const impreciseCount = countMatches(/\bvar\b/, content)
  const scatteredCount = countMatches(/\bany\b/, content)

  const hasNoImprecise = impreciseCount === 0
  const hasNoScattered = scatteredCount === 0
  const hasNoDiffuse = !has(/\beval\b/, content)
  const hasNoSloppy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let stalactite: StalactiteGrade
  if (precision >= 85) stalactite = 'perfect-drop'
  else if (precision >= 70) stalactite = 'precise-point'
  else if (precision >= 55) stalactite = 'proper-formation'
  else if (precision >= 40) stalactite = 'irregular-drip'
  else if (precision >= 25) stalactite = 'broken-stalactite'
  else stalactite = 'no-formation'

  return {
    precision, stalactite, hasHighPrecision, hasAccurate, hasExact, hasNoImprecise,
    hasTargeted, hasNoScattered, hasFocused, hasNoDiffuse, hasPrecise, hasNoSloppy,
    hasDeliberate, impreciseCount, scatteredCount,
  }
}

/**
 * Measure grotto depth
 * @example
 * const m = measureDeepening(content)
 * console.log(m.grotto) // 'deep-cavern'
 */
export function measureDeepening(content: string): DeepeningMeasure {
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

  const hasDeep = hasExport(content) && hasAsync(content)
  const hasProfound = hasNamedExport(content) && hasReturnType(content)
  const hasLayered = hasConst(content) && hasImport(content)
  const hasComplex = hasGenerics(content) && hasInterface(content)
  const hasSubstantive = hasDocComments(content) && hasExport(content)
  const hasRich = hasTypeAlias(content) && hasConst(content)

  score += hasDeep ? 5 : 0
  score += hasProfound ? 5 : 0
  score += hasLayered ? 5 : 0
  score += hasComplex ? 5 : 0
  score += hasSubstantive ? 5 : 0
  score += hasRich ? 5 : 0

  const depth = Math.min(score, 100)
  const shallowCount = countMatches(/\bvar\b/, content)
  const flatCount = countMatches(/\bany\b/, content)

  const hasNoShallow = shallowCount === 0
  const hasNoFlat = flatCount === 0
  const hasNoSimple = !has(/\beval\b/, content)
  const hasNoTrivial = !has(/\bdebugger\b/, content)
  const hasHighDepth = depth >= 70

  let grotto: GrottoGrade
  if (depth >= 85) grotto = 'deep-cavern'
  else if (depth >= 70) grotto = 'proper-depth'
  else if (depth >= 55) grotto = 'decent-grotto'
  else if (depth >= 40) grotto = 'shallow-cave'
  else if (depth >= 25) grotto = 'surface-hollow'
  else grotto = 'no-depth'

  return {
    depth, grotto, hasHighDepth, hasDeep, hasProfound, hasNoShallow,
    hasLayered, hasNoFlat, hasComplex, hasNoSimple, hasSubstantive,
    hasNoTrivial, hasRich, shallowCount, flatCount,
  }
}

/**
 * Measure mineral diversity
 * @example
 * const m = measureDiversifying(content)
 * console.log(m.mineral) // 'rainbow-cave'
 */
export function measureDiversifying(content: string): DiversifyingMeasure {
  let score = 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0

  const hasVaried = hasExport(content) && hasImport(content)
  const hasDiverse = hasConst(content) && hasInterface(content)
  const hasColorful = hasClass(content) && hasTypeAlias(content)
  const hasRich = hasAsync(content) && hasGenerics(content)
  const hasMultiple = hasReturnType(content) && hasReadonly(content)
  const hasAbundant = hasPrivate(content) && hasDocComments(content)

  score += hasVaried ? 5 : 0
  score += hasDiverse ? 5 : 0
  score += hasColorful ? 5 : 0
  score += hasRich ? 5 : 0
  score += hasMultiple ? 5 : 0
  score += hasAbundant ? 5 : 0

  const diversity = Math.min(score, 100)
  const uniformCount = countMatches(/\bvar\b/, content)
  const drabCount = countMatches(/\bany\b/, content)

  const hasNoUniform = uniformCount === 0
  const hasNoDrab = drabCount === 0
  const hasNoSparse = !has(/\beval\b/, content)
  const hasNoSingle = !has(/\bdebugger\b/, content)
  const hasHighDiversity = diversity >= 70

  let mineral: MineralGrade
  if (diversity >= 85) mineral = 'rainbow-cave'
  else if (diversity >= 70) mineral = 'diverse-minerals'
  else if (diversity >= 55) mineral = 'proper-variety'
  else if (diversity >= 40) mineral = 'limited-types'
  else if (diversity >= 25) mineral = 'monochrome'
  else mineral = 'no-variety'

  return {
    diversity, mineral, hasHighDiversity, hasVaried, hasDiverse, hasNoUniform,
    hasColorful, hasNoDrab, hasRich, hasNoSparse, hasMultiple, hasNoSingle,
    hasAbundant, uniformCount, drabCount,
  }
}

/**
 * Measure chamber resonance
 * @example
 * const m = measureResonating(content)
 * console.log(m.chamber) // 'concert-hall'
 */
export function measureResonating(content: string): ResonatingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 10 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasHarmonious = hasExport(content) && hasImport(content)
  const hasIntegrated = hasAsync(content) && hasReturnType(content)
  const hasConnected = hasInterface(content) && hasGenerics(content)
  const hasResonant = hasNamedExport(content) && hasConst(content)
  const hasCoupled = hasDocComments(content) && hasExport(content)
  const hasSounding = hasClass(content) && hasReturnType(content)

  score += hasHarmonious ? 5 : 0
  score += hasIntegrated ? 5 : 0
  score += hasConnected ? 5 : 0
  score += hasResonant ? 5 : 0
  score += hasCoupled ? 5 : 0
  score += hasSounding ? 5 : 0

  const resonance = Math.min(score, 100)
  const isolatedCount = countMatches(/\bvar\b/, content)
  const disconnectedCount = countMatches(/\bany\b/, content)

  const hasNoIsolated = isolatedCount === 0
  const hasNoDisconnected = disconnectedCount === 0
  const hasNoDead = !has(/\beval\b/, content)
  const hasNoSeparated = !has(/\bdebugger\b/, content)
  const hasHighResonance = resonance >= 70

  let chamber: ChamberGrade
  if (resonance >= 85) chamber = 'concert-hall'
  else if (resonance >= 70) chamber = 'harmonic-chamber'
  else if (resonance >= 55) chamber = 'proper-acoustics'
  else if (resonance >= 40) chamber = 'dead-room'
  else if (resonance >= 25) chamber = 'echo-chamber'
  else chamber = 'silent'

  return {
    resonance, chamber, hasHighResonance, hasHarmonious, hasIntegrated, hasNoIsolated,
    hasConnected, hasNoDisconnected, hasResonant, hasNoDead, hasCoupled, hasNoSeparated,
    hasSounding, isolatedCount, disconnectedCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify crystal condition
 * @example
 * classifyCrystalCondition(90) // 'cathedral-cave'
 */
export function classifyCrystalCondition(score: number): CrystalCondition {
  if (score >= 85) return 'cathedral-cave'
  if (score >= 70) return 'crystal-grotto'
  if (score >= 55) return 'proper-cave'
  if (score >= 40) return 'limestone-hollow'
  if (score >= 25) return 'mud-cave'
  return 'no-cave'
}

/**
 * Classify system type
 * @example
 * classifySystemType(crystals) // 'mammoth-cave'
 */
export function classifySystemType(crystals: CaveCrystal[]): SystemType {
  if (crystals.length === 0) return 'no-system'
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)
  const cathedralRatio = crystals.filter(c => c.condition === 'cathedral-cave').length / crystals.length
  if (avgQs >= 75 && cathedralRatio >= 0.5) return 'mammoth-cave'
  if (avgQs >= 60) return 'carlsbad-caverns'
  if (avgQs >= 45) return 'proper-system'
  if (avgQs >= 30) return 'small-cave'
  if (avgQs >= 15) return 'rock-shelter'
  return 'no-system'
}

/**
 * Classify system condition
 * @example
 * classifySystemCondition(80) // 'spectacular-cave'
 */
export function classifySystemCondition(avgQs: number): SystemCondition {
  if (avgQs >= 75) return 'spectacular-cave'
  if (avgQs >= 60) return 'beautiful-grotto'
  if (avgQs >= 45) return 'decent-cave'
  if (avgQs >= 30) return 'rough-hollow'
  if (avgQs >= 15) return 'collapsed'
  return 'filled-in'
}

/**
 * Classify explorer grade
 * @example
 * classifyExplorerGrade(85) // 'master-spelunker'
 */
export function classifyExplorerGrade(avgSplendor: number): ExplorerGrade {
  if (avgSplendor >= 80) return 'master-spelunker'
  if (avgSplendor >= 65) return 'expert-caver'
  if (avgSplendor >= 50) return 'skilled-explorer'
  if (avgSplendor >= 35) return 'apprentice'
  if (avgSplendor >= 20) return 'novice'
  return 'surface-dweller'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(crystals, systems, underground, stats)
 */
export function generateRecommendations(
  crystals: CaveCrystal[],
  systems: CaveSystem[],
  underground: UndergroundSummary,
  stats: CrystalCaveStats,
): string[] {
  const recs: string[] = []
  if (stats.avgFormationQuality < 50) {
    recs.push('Improve formation quality with structured exports, organized const patterns, and systematic interfaces')
  }
  if (stats.avgStalactitePrecision < 50) {
    recs.push('Sharpen stalactite precision with exact const/strict-eq, precise return types/readonly, and targeted imports')
  }
  if (stats.avgGrottoDepth < 50) {
    recs.push('Deepen grotto depth with layered async/export pairs, profound named exports, and complex generics')
  }
  if (stats.avgMineralDiversity < 50) {
    recs.push('Increase mineral diversity with varied patterns, diverse interface/class usage, and colorful type variety')
  }
  if (stats.avgChamberResonance < 50) {
    recs.push('Boost chamber resonance with harmonious export/import pairs, integrated async patterns, and connected interfaces')
  }
  if (stats.noCaveCount > 0) {
    recs.push(`${stats.noCaveCount} file(s) have no cave formation — consider significant refactoring`)
  }
  if (underground.overallSplendor < 40) {
    recs.push('Overall cave splendor is low — focus on formation quality and stalactite precision first')
  }
  const allCollapsed = systems.every(s => s.systemType === 'no-system' || s.systemType === 'rock-shelter')
  if (allCollapsed && systems.length > 0) {
    recs.push('All cave systems are collapsed or minimal — consider a major quality overhaul')
  }
  const noCaveFiles = crystals.filter(c => c.condition === 'no-cave').map(c => c.file)
  if (noCaveFiles.length > 0 && noCaveFiles.length <= 3) {
    recs.push(`Transform these no-cave files into cathedral caves: ${noCaveFiles.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your crystal cave is master-spelunker quality! Every crystal gleams with perfect formation')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as cave crystal
 * @example
 * const c = analyzeCaveCrystal(content, 'index.ts')
 * console.log(c.condition) // 'cathedral-cave'
 */
export function analyzeCaveCrystal(content: string, filePath: string): CaveCrystal {
  const forming = measureForming(content)
  const hanging = measureHanging(content)
  const deepening = measureDeepening(content)
  const diversifying = measureDiversifying(content)
  const resonating = measureResonating(content)

  const qualityScore = Math.round(
    forming.quality * 0.2 +
    hanging.precision * 0.2 +
    deepening.depth * 0.2 +
    diversifying.diversity * 0.2 +
    resonating.resonance * 0.2,
  )

  return {
    file: filePath,
    formationQuality: forming.quality,
    stalactitePrecision: hanging.precision,
    grottoDepth: deepening.depth,
    mineralDiversity: diversifying.diversity,
    chamberResonance: resonating.resonance,
    forming,
    hanging,
    deepening,
    diversifying,
    resonating,
    condition: classifyCrystalCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as cave system
 * @example
 * const s = analyzeCaveSystem(crystals, 'src')
 * console.log(s.systemType) // 'mammoth-cave'
 */
export function analyzeCaveSystem(crystals: CaveCrystal[], dirPath: string): CaveSystem {
  if (crystals.length === 0) {
    return {
      directory: dirPath, crystals: [], avgFormation: 0, avgDepth: 0, avgResonance: 0,
      cathedralCaveCount: 0, noCaveCount: 0, systemType: 'no-system', condition: 'filled-in',
    }
  }

  const avgFormation = Math.round(crystals.reduce((s, c) => s + c.formationQuality, 0) / crystals.length)
  const avgDepth = Math.round(crystals.reduce((s, c) => s + c.grottoDepth, 0) / crystals.length)
  const avgResonance = Math.round(crystals.reduce((s, c) => s + c.chamberResonance, 0) / crystals.length)
  const cathedralCaveCount = crystals.filter(c => c.condition === 'cathedral-cave').length
  const noCaveCount = crystals.filter(c => c.condition === 'no-cave').length
  const avgQs = Math.round(crystals.reduce((s, c) => s + c.qualityScore, 0) / crystals.length)

  return {
    directory: dirPath, crystals, avgFormation, avgDepth, avgResonance,
    cathedralCaveCount, noCaveCount, systemType: classifySystemType(crystals),
    condition: classifySystemCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete crystal cave result
 * @example
 * const result = await buildCrystalCaveResult(files, contents)
 * console.log(result.stats.explorerGrade) // 'master-spelunker'
 */
export async function buildCrystalCaveResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrystalCaveResult> {
  const crystals = files.map((file, i) => analyzeCaveCrystal(contents[i] ?? '', file))

  const dirMap = new Map<string, CaveCrystal[]>()
  for (const crystal of crystals) {
    const dir = path.dirname(crystal.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(crystal) } else { dirMap.set(dir, [crystal]) }
  }

  const systems = Array.from(dirMap.entries()).map(([dir, dirCrystals]) =>
    analyzeCaveSystem(dirCrystals, dir),
  )

  const avgFormation = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.formationQuality, 0) / crystals.length) : 0
  const avgDepth = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.grottoDepth, 0) / crystals.length) : 0
  const avgResonance = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.chamberResonance, 0) / crystals.length) : 0

  const overallSplendor = crystals.length > 0
    ? Math.round((avgFormation + avgDepth + avgResonance) / 3) : 0
  const isDeep = avgDepth >= 60

  const underground: UndergroundSummary = { avgFormation, avgDepth, avgResonance, isDeep, overallSplendor }

  const avgStalactitePrecision = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.stalactitePrecision, 0) / crystals.length) : 0
  const avgMineralDiversity = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.mineralDiversity, 0) / crystals.length) : 0
  const avgChamberResonance = crystals.length > 0
    ? Math.round(crystals.reduce((s, c) => s + c.chamberResonance, 0) / crystals.length) : 0

  const bestCrystal = crystals.length > 0
    ? crystals.reduce((best, c) => c.qualityScore > best.qualityScore ? c : best).file : ''
  const bestFormed = crystals.length > 0
    ? crystals.reduce((best, c) => c.formationQuality > best.formationQuality ? c : best).file : ''
  const mostPrecise = crystals.length > 0
    ? crystals.reduce((best, c) => c.stalactitePrecision > best.stalactitePrecision ? c : best).file : ''
  const deepest = crystals.length > 0
    ? crystals.reduce((best, c) => c.grottoDepth > best.grottoDepth ? c : best).file : ''
  const mostDiverse = crystals.length > 0
    ? crystals.reduce((best, c) => c.mineralDiversity > best.mineralDiversity ? c : best).file : ''

  const stats: CrystalCaveStats = {
    totalFiles: crystals.length,
    totalSystems: systems.length,
    avgFormationQuality: avgFormation,
    avgStalactitePrecision,
    avgGrottoDepth: avgDepth,
    avgMineralDiversity,
    avgChamberResonance,
    cathedralCaveCount: crystals.filter(c => c.condition === 'cathedral-cave').length,
    crystalGrottoCount: crystals.filter(c => c.condition === 'crystal-grotto').length,
    properCaveCount: crystals.filter(c => c.condition === 'proper-cave').length,
    limestoneHollowCount: crystals.filter(c => c.condition === 'limestone-hollow').length,
    mudCaveCount: crystals.filter(c => c.condition === 'mud-cave').length,
    noCaveCount: crystals.filter(c => c.condition === 'no-cave').length,
    hasHighQualityCount: crystals.filter(c => c.forming.hasHighQuality).length,
    hasHighPrecisionCount: crystals.filter(c => c.hanging.hasHighPrecision).length,
    hasHighDepthCount: crystals.filter(c => c.deepening.hasHighDepth).length,
    hasHighDiversityCount: crystals.filter(c => c.diversifying.hasHighDiversity).length,
    hasHighResonanceCount: crystals.filter(c => c.resonating.hasHighResonance).length,
    overallSplendor,
    explorerGrade: classifyExplorerGrade(overallSplendor),
    bestCrystal, bestFormed, mostPrecise, deepest, mostDiverse,
  }

  const recommendations = generateRecommendations(crystals, systems, underground, stats)

  return { crystals, systems, underground, stats, recommendations }
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
