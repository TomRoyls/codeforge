// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

/** Sharpness grade */
export type SharpnessGrade =
  | 'monomolecular'
  | 'scalpel-sharp'
  | 'razor-edge'
  | 'dull-blade'
  | 'blunt-edge'
  | 'no-edge'

/** Fracture grade */
export type FractureGrade =
  | 'conchoidal'
  | 'clean-break'
  | 'proper-cleave'
  | 'uneven-break'
  | 'splintered'
  | 'shattered'

/** Origin grade */
export type OriginGrade =
  | 'prime-magma'
  | 'quality-lava'
  | 'proper-flow'
  | 'mixed-ash'
  | 'degraded-rock'
  | 'sediment'

/** Polish grade */
export type PolishGrade =
  | 'mirror-finish'
  | 'high-gloss'
  | 'proper-polish'
  | 'matte-finish'
  | 'rough-surface'
  | 'unpolished'

/** Cut grade */
export type CutGrade =
  | 'surgical-incision'
  | 'precise-cut'
  | 'proper-slice'
  | 'rough-cut'
  | 'hack'
  | 'no-cut'

/** Edge condition */
export type EdgeCondition =
  | 'master-blade'
  | 'surgical-scalpel'
  | 'proper-knife'
  | 'dull-tool'
  | 'broken-shard'
  | 'gravel'

/** Quarry type */
export type QuarryType =
  | 'volcanic-vent'
  | 'obsidian-cliff'
  | 'rocky-outcrop'
  | 'gravel-bed'
  | 'sand-pit'
  | 'no-quarry'

/** Quarry condition */
export type QuarryCondition =
  | 'prime-source'
  | 'quality-mine'
  | 'decent-quarry'
  | 'poor-source'
  | 'exhausted'
  | 'barren'

/** Knapper grade */
export type KnapperGrade =
  | 'master-knapper'
  | 'expert-flintknapper'
  | 'skilled-artisan'
  | 'apprentice'
  | 'novice'
  | 'rock-thrower'

/** Sharpening measurement */
export interface SharpeningMeasure {
  sharpness: number
  grade: SharpnessGrade
  hasHighSharpness: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasNoBlunt: boolean
  hasKeen: boolean
  hasNoDull: boolean
  hasFine: boolean
  hasNoCoarse: boolean
  hasRefined: boolean
  hasNoRough: boolean
  hasExacting: boolean
  bluntCount: number
  dullCount: number
}

/** Fracturing measurement */
export interface FracturingMeasure {
  quality: number
  fracture: FractureGrade
  hasHighQuality: boolean
  hasClean: boolean
  hasEven: boolean
  hasNoJagged: boolean
  hasSmooth: boolean
  hasNoRough: boolean
  hasPrecise: boolean
  hasNoMessy: boolean
  hasControlled: boolean
  hasNoChaotic: boolean
  hasDeliberate: boolean
  jaggedCount: number
  roughCount: number
}

/** Originating measurement */
export interface OriginatingMeasure {
  quality: number
  origin: OriginGrade
  hasHighQuality: boolean
  hasPureSource: boolean
  hasQualityOrigin: boolean
  hasNoContaminated: boolean
  hasCleanOrigin: boolean
  hasNoPolluted: boolean
  hasPrime: boolean
  hasNoDegraded: boolean
  hasRefinedOrigin: boolean
  hasNoImpure: boolean
  hasAuthentic: boolean
  contaminatedCount: number
  pollutedCount: number
}

/** Polishing measurement */
export interface PolishingMeasure {
  level: number
  polish: PolishGrade
  hasHighLevel: boolean
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

/** Cutting measurement */
export interface CuttingMeasure {
  precision: number
  cut: CutGrade
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasExact: boolean
  hasNoImprecise: boolean
  hasTargeted: boolean
  hasNoCareless: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasClean: boolean
  hasNoMessy: boolean
  hasDeliberate: boolean
  impreciseCount: number
  carelessCount: number
}

/** Single file analysis */
export interface ObsidianEdge {
  file: string
  edgeSharpness: number
  fractureQuality: number
  volcanicOrigin: number
  polishLevel: number
  cuttingPrecision: number
  sharpening: SharpeningMeasure
  fracturing: FracturingMeasure
  originating: OriginatingMeasure
  polishing: PolishingMeasure
  cutting: CuttingMeasure
  condition: EdgeCondition
  qualityScore: number
}

/** Directory-level quarry */
export interface ObsidianQuarry {
  directory: string
  edges: ObsidianEdge[]
  avgSharpness: number
  avgFracture: number
  avgPrecision: number
  masterBladeCount: number
  gravelCount: number
  quarryType: QuarryType
  condition: QuarryCondition
}

/** Volcano summary */
export interface VolcanoSummary {
  avgSharpness: number
  avgFracture: number
  avgPrecision: number
  isSharp: boolean
  overallSharpness: number
}

/** Full stats */
export interface ObsidianBladeStats {
  totalFiles: number
  totalQuarries: number
  avgEdgeSharpness: number
  avgFractureQuality: number
  avgVolcanicOrigin: number
  avgPolishLevel: number
  avgCuttingPrecision: number
  masterBladeCount: number
  surgicalScalpelCount: number
  properKnifeCount: number
  dullToolCount: number
  brokenShardCount: number
  gravelCount: number
  hasHighSharpnessCount: number
  hasHighQualityCount: number
  hasHighOriginCount: number
  hasHighLevelCount: number
  hasHighPrecisionCount: number
  overallSharpness: number
  knapperGrade: KnapperGrade
  bestEdge: string
  sharpest: string
  cleanestFracture: string
  bestOrigin: string
  bestPolished: string
}

/** Full result */
export interface ObsidianBladeResult {
  edges: ObsidianEdge[]
  quarries: ObsidianQuarry[]
  volcano: VolcanoSummary
  stats: ObsidianBladeStats
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
 * Measure edge sharpness
 * @example
 * const m = measureSharpening(content)
 * console.log(m.grade) // 'monomolecular'
 */
export function measureSharpening(content: string): SharpeningMeasure {
  let score = 0
  score += hasReturnType(content) ? 10 : 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasPrecise = hasReturnType(content) && hasStrictEq(content)
  const hasSharp = hasDocComments(content) && hasInterface(content)
  const hasKeen = hasReadonly(content) && hasPrivate(content)
  const hasFine = hasGenerics(content) && hasConst(content)
  const hasRefined = hasExport(content) && hasReturnType(content)
  const hasExacting = hasStrictEq(content) && hasDocComments(content)

  score += hasPrecise ? 5 : 0
  score += hasSharp ? 5 : 0
  score += hasKeen ? 5 : 0
  score += hasFine ? 5 : 0
  score += hasRefined ? 5 : 0
  score += hasExacting ? 5 : 0

  const sharpness = Math.min(score, 100)
  const bluntCount = count(/\bvar\b/, content)
  const dullCount = count(/\bany\b/, content)

  const hasNoBlunt = bluntCount === 0
  const hasNoDull = dullCount === 0
  const hasNoCoarse = !has(/\beval\b/, content)
  const hasNoRough = !has(/\bdebugger\b/, content)
  const hasHighSharpness = sharpness >= 70

  let grade: SharpnessGrade
  if (sharpness >= 85) grade = 'monomolecular'
  else if (sharpness >= 70) grade = 'scalpel-sharp'
  else if (sharpness >= 55) grade = 'razor-edge'
  else if (sharpness >= 40) grade = 'dull-blade'
  else if (sharpness >= 25) grade = 'blunt-edge'
  else grade = 'no-edge'

  return {
    sharpness, grade, hasHighSharpness, hasPrecise, hasSharp, hasNoBlunt,
    hasKeen, hasNoDull, hasFine, hasNoCoarse, hasRefined,
    hasNoRough, hasExacting, bluntCount, dullCount,
  }
}

/**
 * Measure fracture quality
 * @example
 * const m = measureFracturing(content)
 * console.log(m.fracture) // 'conchoidal'
 */
export function measureFracturing(content: string): FracturingMeasure {
  let score = 0
  score += hasInterface(content) ? 10 : 0
  score += hasClass(content) ? 10 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasImport(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasReturnType(content) ? 8 : 0

  const hasClean = hasInterface(content) && hasClass(content)
  const hasEven = hasGenerics(content) && hasTypeAlias(content)
  const hasSmooth = hasExport(content) && hasImport(content)
  const hasPrecise = hasConst(content) && hasAsync(content)
  const hasControlled = hasDocComments(content) && hasReturnType(content)
  const hasDeliberate = hasExport(content) && hasInterface(content)

  score += hasClean ? 5 : 0
  score += hasEven ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasPrecise ? 5 : 0
  score += hasControlled ? 5 : 0
  score += hasDeliberate ? 5 : 0

  const quality = Math.min(score, 100)
  const jaggedCount = count(/\bvar\b/, content)
  const roughCount = count(/\bany\b/, content)

  const hasNoJagged = jaggedCount === 0
  const hasNoRough = roughCount === 0
  const hasNoMessy = !has(/\beval\b/, content)
  const hasNoChaotic = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let fracture: FractureGrade
  if (quality >= 85) fracture = 'conchoidal'
  else if (quality >= 70) fracture = 'clean-break'
  else if (quality >= 55) fracture = 'proper-cleave'
  else if (quality >= 40) fracture = 'uneven-break'
  else if (quality >= 25) fracture = 'splintered'
  else fracture = 'shattered'

  return {
    quality, fracture, hasHighQuality, hasClean, hasEven, hasNoJagged,
    hasSmooth, hasNoRough, hasPrecise, hasNoMessy, hasControlled,
    hasNoChaotic, hasDeliberate, jaggedCount, roughCount,
  }
}

/**
 * Measure volcanic origin quality
 * @example
 * const m = measureOriginating(content)
 * console.log(m.origin) // 'prime-magma'
 */
export function measureOriginating(content: string): OriginatingMeasure {
  let score = 0
  score += hasDocComments(content) ? 10 : 0
  score += hasExport(content) ? 10 : 0
  score += hasImport(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasTypeAlias(content) ? 8 : 0
  score += hasConst(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0

  const hasPureSource = hasDocComments(content) && hasExport(content)
  const hasQualityOrigin = hasImport(content) && hasInterface(content)
  const hasCleanOrigin = hasClass(content) && hasNamedExport(content)
  const hasPrime = hasGenerics(content) && hasTypeAlias(content)
  const hasRefinedOrigin = hasConst(content) && hasExport(content)
  const hasAuthentic = hasAsync(content) && hasDocComments(content)

  score += hasPureSource ? 5 : 0
  score += hasQualityOrigin ? 5 : 0
  score += hasCleanOrigin ? 5 : 0
  score += hasPrime ? 5 : 0
  score += hasRefinedOrigin ? 5 : 0
  score += hasAuthentic ? 5 : 0

  const quality = Math.min(score, 100)
  const contaminatedCount = count(/\bvar\b/, content)
  const pollutedCount = count(/\bany\b/, content)

  const hasNoContaminated = contaminatedCount === 0
  const hasNoPolluted = pollutedCount === 0
  const hasNoDegraded = !has(/\beval\b/, content)
  const hasNoImpure = !has(/\bdebugger\b/, content)
  const hasHighQuality = quality >= 70

  let origin: OriginGrade
  if (quality >= 85) origin = 'prime-magma'
  else if (quality >= 70) origin = 'quality-lava'
  else if (quality >= 55) origin = 'proper-flow'
  else if (quality >= 40) origin = 'mixed-ash'
  else if (quality >= 25) origin = 'degraded-rock'
  else origin = 'sediment'

  return {
    quality, origin, hasHighQuality, hasPureSource, hasQualityOrigin, hasNoContaminated,
    hasCleanOrigin, hasNoPolluted, hasPrime, hasNoDegraded, hasRefinedOrigin,
    hasNoImpure, hasAuthentic, contaminatedCount, pollutedCount,
  }
}

/**
 * Measure polish level
 * @example
 * const m = measurePolishing(content)
 * console.log(m.polish) // 'mirror-finish'
 */
export function measurePolishing(content: string): PolishingMeasure {
  let score = 0
  score += hasExport(content) ? 10 : 0
  score += hasConst(content) ? 10 : 0
  score += hasReturnType(content) ? 8 : 0
  score += hasReadonly(content) ? 8 : 0
  score += hasPrivate(content) ? 8 : 0
  score += hasStrictEq(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0

  const hasRefined = hasExport(content) && hasConst(content)
  const hasSmooth = hasReturnType(content) && hasReadonly(content)
  const hasPolished = hasPrivate(content) && hasStrictEq(content)
  const hasGlossy = hasDocComments(content) && hasInterface(content)
  const hasFinished = hasGenerics(content) && hasExport(content)
  const hasElegant = hasClass(content) && hasReturnType(content)

  score += hasRefined ? 5 : 0
  score += hasSmooth ? 5 : 0
  score += hasPolished ? 5 : 0
  score += hasGlossy ? 5 : 0
  score += hasFinished ? 5 : 0
  score += hasElegant ? 5 : 0

  const level = Math.min(score, 100)
  const roughCount = count(/\bvar\b/, content)
  const unfinishedCount = count(/\bany\b/, content)

  const hasNoRough = roughCount === 0
  const hasNoUnfinished = unfinishedCount === 0
  const hasNoMatte = !has(/\beval\b/, content)
  const hasNoRaw = !has(/\bdebugger\b/, content)
  const hasHighLevel = level >= 70

  let polish: PolishGrade
  if (level >= 85) polish = 'mirror-finish'
  else if (level >= 70) polish = 'high-gloss'
  else if (level >= 55) polish = 'proper-polish'
  else if (level >= 40) polish = 'matte-finish'
  else if (level >= 25) polish = 'rough-surface'
  else polish = 'unpolished'

  return {
    level, polish, hasHighLevel, hasRefined, hasSmooth, hasNoRough,
    hasPolished, hasNoUnfinished, hasGlossy, hasNoMatte, hasFinished,
    hasNoRaw, hasElegant, roughCount, unfinishedCount,
  }
}

/**
 * Measure cutting precision
 * @example
 * const m = measureCutting(content)
 * console.log(m.cut) // 'surgical-incision'
 */
export function measureCutting(content: string): CuttingMeasure {
  let score = 0
  score += hasStrictEq(content) ? 10 : 0
  score += hasReturnType(content) ? 10 : 0
  score += hasConst(content) ? 8 : 0
  score += hasDocComments(content) ? 8 : 0
  score += hasInterface(content) ? 8 : 0
  score += hasAsync(content) ? 8 : 0
  score += hasExport(content) ? 8 : 0
  score += hasGenerics(content) ? 8 : 0
  score += hasClass(content) ? 8 : 0
  score += hasNamedExport(content) ? 8 : 0

  const hasAccurate = hasStrictEq(content) && hasReturnType(content)
  const hasExact = hasConst(content) && hasDocComments(content)
  const hasTargeted = hasInterface(content) && hasAsync(content)
  const hasFocused = hasExport(content) && hasGenerics(content)
  const hasClean = hasClass(content) && hasConst(content)
  const hasDeliberate = hasStrictEq(content) && hasExport(content)

  score += hasAccurate ? 5 : 0
  score += hasExact ? 5 : 0
  score += hasTargeted ? 5 : 0
  score += hasFocused ? 5 : 0
  score += hasClean ? 5 : 0
  score += hasDeliberate ? 5 : 0

  const precision = Math.min(score, 100)
  const impreciseCount = count(/\bvar\b/, content)
  const carelessCount = count(/\bany\b/, content)

  const hasNoImprecise = impreciseCount === 0
  const hasNoCareless = carelessCount === 0
  const hasNoScattered = !has(/\beval\b/, content)
  const hasNoMessy = !has(/\bdebugger\b/, content)
  const hasHighPrecision = precision >= 70

  let cut: CutGrade
  if (precision >= 85) cut = 'surgical-incision'
  else if (precision >= 70) cut = 'precise-cut'
  else if (precision >= 55) cut = 'proper-slice'
  else if (precision >= 40) cut = 'rough-cut'
  else if (precision >= 25) cut = 'hack'
  else cut = 'no-cut'

  return {
    precision, cut, hasHighPrecision, hasAccurate, hasExact, hasNoImprecise,
    hasTargeted, hasNoCareless, hasFocused, hasNoScattered, hasClean,
    hasNoMessy, hasDeliberate, impreciseCount, carelessCount,
  }
}

// ─── Classification Functions ───────────────────────────────────────

/**
 * Classify edge condition
 * @example
 * classifyEdgeCondition(90) // 'master-blade'
 */
export function classifyEdgeCondition(score: number): EdgeCondition {
  if (score >= 85) return 'master-blade'
  if (score >= 70) return 'surgical-scalpel'
  if (score >= 55) return 'proper-knife'
  if (score >= 40) return 'dull-tool'
  if (score >= 25) return 'broken-shard'
  return 'gravel'
}

/**
 * Classify quarry type
 * @example
 * classifyQuarryType(edges) // 'volcanic-vent'
 */
export function classifyQuarryType(edges: ObsidianEdge[]): QuarryType {
  if (edges.length === 0) return 'no-quarry'
  const avgQs = Math.round(edges.reduce((s, e) => s + e.qualityScore, 0) / edges.length)
  const masterRatio = edges.filter(e => e.condition === 'master-blade').length / edges.length
  if (avgQs >= 75 && masterRatio >= 0.5) return 'volcanic-vent'
  if (avgQs >= 60) return 'obsidian-cliff'
  if (avgQs >= 45) return 'rocky-outcrop'
  if (avgQs >= 30) return 'gravel-bed'
  if (avgQs >= 15) return 'sand-pit'
  return 'no-quarry'
}

/**
 * Classify knapper grade
 * @example
 * classifyKnapperGrade(85) // 'master-knapper'
 */
export function classifyKnapperGrade(avgSharpness: number): KnapperGrade {
  if (avgSharpness >= 80) return 'master-knapper'
  if (avgSharpness >= 65) return 'expert-flintknapper'
  if (avgSharpness >= 50) return 'skilled-artisan'
  if (avgSharpness >= 35) return 'apprentice'
  if (avgSharpness >= 20) return 'novice'
  return 'rock-thrower'
}

/**
 * Classify quarry condition
 * @example
 * classifyQuarryCondition(80) // 'prime-source'
 */
export function classifyQuarryCondition(avgQs: number): QuarryCondition {
  if (avgQs >= 75) return 'prime-source'
  if (avgQs >= 60) return 'quality-mine'
  if (avgQs >= 45) return 'decent-quarry'
  if (avgQs >= 30) return 'poor-source'
  if (avgQs >= 15) return 'exhausted'
  return 'barren'
}

// ─── Recommendation Generator ──────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(edges, quarries, volcano, stats)
 */
export function generateRecommendations(
  edges: ObsidianEdge[],
  quarries: ObsidianQuarry[],
  volcano: VolcanoSummary,
  stats: ObsidianBladeStats,
): string[] {
  const recs: string[] = []
  if (stats.avgEdgeSharpness < 50) {
    recs.push('Hone edge sharpness with precise types, strict equality, and sharp return annotations')
  }
  if (stats.avgFractureQuality < 50) {
    recs.push('Improve fracture quality with clean interfaces, even generics, and smooth imports/exports')
  }
  if (stats.avgVolcanicOrigin < 50) {
    recs.push('Purify volcanic origin with pure documentation, quality imports, and authentic async patterns')
  }
  if (stats.avgPolishLevel < 50) {
    recs.push('Raise polish level with refined exports, smooth readonly, and polished private members')
  }
  if (stats.avgCuttingPrecision < 50) {
    recs.push('Sharpen cutting precision with accurate strict equality, exact constants, and targeted async patterns')
  }
  if (stats.gravelCount > 0) {
    recs.push(`${stats.gravelCount} file(s) are gravel — consider significant refactoring`)
  }
  if (volcano.overallSharpness < 40) {
    recs.push('Overall blade sharpness is poor — focus on edge quality and fracture cleanness first')
  }
  const allNoQuarry = quarries.every(q => q.quarryType === 'no-quarry' || q.quarryType === 'sand-pit')
  if (allNoQuarry && quarries.length > 0) {
    recs.push('All quarries are depleted or barren — consider a major quality overhaul')
  }
  const gravel = edges.filter(e => e.condition === 'gravel').map(e => e.file)
  if (gravel.length > 0 && gravel.length <= 3) {
    recs.push(`Recut these gravel files: ${gravel.join(', ')}`)
  }
  if (recs.length === 0) {
    recs.push('Your obsidian blades are surgically sharp! Every edge cuts with monomolecular precision')
  }
  return recs
}

// ─── Analysis Functions ────────────────────────────────────────────

/**
 * Analyze a single file as an obsidian edge
 * @example
 * const edge = analyzeObsidianEdge(content, 'index.ts')
 * console.log(edge.condition) // 'master-blade'
 */
export function analyzeObsidianEdge(content: string, filePath: string): ObsidianEdge {
  const sharpening = measureSharpening(content)
  const fracturing = measureFracturing(content)
  const originating = measureOriginating(content)
  const polishing = measurePolishing(content)
  const cutting = measureCutting(content)

  const qualityScore = Math.round(
    sharpening.sharpness * 0.2 +
    fracturing.quality * 0.2 +
    originating.quality * 0.2 +
    polishing.level * 0.2 +
    cutting.precision * 0.2,
  )

  return {
    file: filePath,
    edgeSharpness: sharpening.sharpness,
    fractureQuality: fracturing.quality,
    volcanicOrigin: originating.quality,
    polishLevel: polishing.level,
    cuttingPrecision: cutting.precision,
    sharpening,
    fracturing,
    originating,
    polishing,
    cutting,
    condition: classifyEdgeCondition(qualityScore),
    qualityScore,
  }
}

/**
 * Analyze a directory as an obsidian quarry
 * @example
 * const quarry = analyzeObsidianQuarry(edges, 'src')
 * console.log(quarry.quarryType) // 'volcanic-vent'
 */
export function analyzeObsidianQuarry(edges: ObsidianEdge[], dirPath: string): ObsidianQuarry {
  if (edges.length === 0) {
    return {
      directory: dirPath, edges: [], avgSharpness: 0, avgFracture: 0, avgPrecision: 0,
      masterBladeCount: 0, gravelCount: 0, quarryType: 'no-quarry', condition: 'barren',
    }
  }

  const avgSharpness = Math.round(edges.reduce((s, e) => s + e.edgeSharpness, 0) / edges.length)
  const avgFracture = Math.round(edges.reduce((s, e) => s + e.fractureQuality, 0) / edges.length)
  const avgPrecision = Math.round(edges.reduce((s, e) => s + e.cuttingPrecision, 0) / edges.length)
  const masterBladeCount = edges.filter(e => e.condition === 'master-blade').length
  const gravelCount = edges.filter(e => e.condition === 'gravel').length
  const avgQs = Math.round(edges.reduce((s, e) => s + e.qualityScore, 0) / edges.length)

  return {
    directory: dirPath, edges, avgSharpness, avgFracture, avgPrecision,
    masterBladeCount, gravelCount, quarryType: classifyQuarryType(edges),
    condition: classifyQuarryCondition(avgQs),
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────

/**
 * Build complete obsidian blade result
 * @example
 * const result = await buildObsidianBladeResult(files, contents)
 * console.log(result.stats.knapperGrade) // 'master-knapper'
 */
export async function buildObsidianBladeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianBladeResult> {
  const edges = files.map((file, i) => analyzeObsidianEdge(contents[i] ?? '', file))

  const dirMap = new Map<string, ObsidianEdge[]>()
  for (const edge of edges) {
    const dir = path.dirname(edge.file)
    const existing = dirMap.get(dir)
    if (existing) { existing.push(edge) } else { dirMap.set(dir, [edge]) }
  }

  const quarries = Array.from(dirMap.entries()).map(([dir, dirEdges]) =>
    analyzeObsidianQuarry(dirEdges, dir),
  )

  const avgSharpness = edges.length > 0
    ? Math.round(edges.reduce((s, e) => s + e.edgeSharpness, 0) / edges.length) : 0
  const avgFracture = edges.length > 0
    ? Math.round(edges.reduce((s, e) => s + e.fractureQuality, 0) / edges.length) : 0
  const avgPrecision = edges.length > 0
    ? Math.round(edges.reduce((s, e) => s + e.cuttingPrecision, 0) / edges.length) : 0

  const overallSharpness = edges.length > 0
    ? Math.round((avgSharpness + avgFracture + avgPrecision) / 3) : 0
  const isSharp = avgSharpness >= 60

  const volcano: VolcanoSummary = { avgSharpness, avgFracture, avgPrecision, isSharp, overallSharpness }

  const avgVolcanicOrigin = edges.length > 0
    ? Math.round(edges.reduce((s, e) => s + e.volcanicOrigin, 0) / edges.length) : 0
  const avgPolishLevel = edges.length > 0
    ? Math.round(edges.reduce((s, e) => s + e.polishLevel, 0) / edges.length) : 0
  const avgCuttingPrecision = avgPrecision

  const bestEdge = edges.length > 0
    ? edges.reduce((best, e) => e.qualityScore > best.qualityScore ? e : best).file : ''
  const sharpest = edges.length > 0
    ? edges.reduce((best, e) => e.edgeSharpness > best.edgeSharpness ? e : best).file : ''
  const cleanestFracture = edges.length > 0
    ? edges.reduce((best, e) => e.fractureQuality > best.fractureQuality ? e : best).file : ''
  const bestOrigin = edges.length > 0
    ? edges.reduce((best, e) => e.volcanicOrigin > best.volcanicOrigin ? e : best).file : ''
  const bestPolished = edges.length > 0
    ? edges.reduce((best, e) => e.polishLevel > best.polishLevel ? e : best).file : ''

  const stats: ObsidianBladeStats = {
    totalFiles: edges.length,
    totalQuarries: quarries.length,
    avgEdgeSharpness: avgSharpness,
    avgFractureQuality: avgFracture,
    avgVolcanicOrigin,
    avgPolishLevel,
    avgCuttingPrecision,
    masterBladeCount: edges.filter(e => e.condition === 'master-blade').length,
    surgicalScalpelCount: edges.filter(e => e.condition === 'surgical-scalpel').length,
    properKnifeCount: edges.filter(e => e.condition === 'proper-knife').length,
    dullToolCount: edges.filter(e => e.condition === 'dull-tool').length,
    brokenShardCount: edges.filter(e => e.condition === 'broken-shard').length,
    gravelCount: edges.filter(e => e.condition === 'gravel').length,
    hasHighSharpnessCount: edges.filter(e => e.sharpening.hasHighSharpness).length,
    hasHighQualityCount: edges.filter(e => e.fracturing.hasHighQuality).length,
    hasHighOriginCount: edges.filter(e => e.originating.hasHighQuality).length,
    hasHighLevelCount: edges.filter(e => e.polishing.hasHighLevel).length,
    hasHighPrecisionCount: edges.filter(e => e.cutting.hasHighPrecision).length,
    overallSharpness,
    knapperGrade: classifyKnapperGrade(overallSharpness),
    bestEdge, sharpest, cleanestFracture, bestOrigin, bestPolished,
  }

  const recommendations = generateRecommendations(edges, quarries, volcano, stats)

  return { edges, quarries, volcano, stats, recommendations }
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
