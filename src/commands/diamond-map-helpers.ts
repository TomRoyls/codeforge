// ─── Interfaces ──────────────────────────────────────────

export interface CrystallizingMeasure {
  hardness: number
  crystal: 'flawless-diamond' | 'vvs-clarity' | 'proper-si' | 'included' | 'industrial-grade' | 'no-hardness'
  hasHighHardness: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasRobust: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasSolid: boolean
  hasDurable: boolean
  hasReinforced: boolean
  hasPermanent: boolean
  hasImpervious: boolean
  chaoticCount: number
  untestedCount: number
}

export interface CuttingMeasure {
  precision: number
  cut: 'ideal-brilliant' | 'excellent-cut' | 'proper-facet' | 'poor-proportion' | 'rough-stone' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasFaceted: boolean
  hasSymmetrical: boolean
  hasProportional: boolean
  hasMasterful: boolean
  approximateCount: number
  roughCount: number
}

export interface MappingMeasure {
  completeness: number
  coverage: 'complete-atlas' | 'detailed-map' | 'proper-chart' | 'sketch-map' | 'blank-page' | 'no-completeness'
  hasHighCompleteness: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasComprehensive: boolean
  hasThorough: boolean
  hasComplete: boolean
  hasCovered: boolean
  hasDetailed: boolean
  hasExplained: boolean
  hasDescribed: boolean
  hasAnnotated: boolean
  hasIndexed: boolean
  hasReferenced: boolean
  hasMapped: boolean
  undocumentedCount: number
  hiddenCount: number
}

export interface DispersingMeasure {
  fire: number
  spectrum: 'rainbow-fire' | 'brilliant-flash' | 'proper-sparkle' | 'dull-gleam' | 'no-light' | 'no-fire'
  hasHighFire: boolean
  hasVersatile: boolean
  hasMultiPurpose: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasExtensible: boolean
  hasModular: boolean
  hasComposable: boolean
  hasRich: boolean
  hasDiverse: boolean
  hasMultiFaceted: boolean
  hasColorful: boolean
  hasBrilliant: boolean
  hasRadiant: boolean
  hasLuminous: boolean
  hasSpectral: boolean
  rigidCount: number
  monolithicCount: number
}

export interface NavigatingMeasure {
  wisdom: number
  chart: 'master-cartographer' | 'experienced-navigator' | 'proper-guide' | 'lost-traveler' | 'no-map' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasSystemic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasEvolved: boolean
  hasWise: boolean
  hackedCount: number
  shallowCount: number
}

export type PageCondition =
  | 'diamond-masterpiece'
  | 'flawless-map'
  | 'proper-gem'
  | 'included-stone'
  | 'rough-rock'
  | 'void'

export interface DiamondPage {
  file: string
  hardnessClarity: number
  cutPrecision: number
  mapCompleteness: number
  fireDispersion: number
  cartographicWisdom: number
  crystallizing: CrystallizingMeasure
  cutting: CuttingMeasure
  mapping: MappingMeasure
  dispersing: DispersingMeasure
  navigating: NavigatingMeasure
  condition: PageCondition
  qualityScore: number
}

export type VolumeType =
  | 'complete-atlas'
  | 'regional-map'
  | 'proper-chart'
  | 'single-page'
  | 'blank-book'
  | 'no-volume'

export type VolumeCondition =
  | 'diamond-library'
  | 'gem-collection'
  | 'proper-bookshelf'
  | 'pamphlet-rack'
  | 'empty-shelf'
  | 'void'

export interface DiamondVolume {
  directory: string
  pages: DiamondPage[]
  avgHardness: number
  avgPrecision: number
  avgWisdom: number
  diamondMasterpieceCount: number
  voidCount: number
  volumeType: VolumeType
  condition: VolumeCondition
}

export interface DiamondMapResult {
  pages: DiamondPage[]
  volumes: DiamondVolume[]
  cartography: {
    avgHardness: number
    avgPrecision: number
    avgWisdom: number
    isDiamond: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalVolumes: number
    avgHardnessClarity: number
    avgCutPrecision: number
    avgMapCompleteness: number
    avgFireDispersion: number
    avgCartographicWisdom: number
    diamondMasterpieceCount: number
    flawlessMapCount: number
    properGemCount: number
    includedStoneCount: number
    roughRockCount: number
    voidCount: number
    hasHighHardnessCount: number
    hasHighPrecisionCount: number
    hasHighCompletenessCount: number
    hasHighFireCount: number
    hasHighWisdomCount: number
    overallBrilliance: number
    cartographerGrade: 'master-gem-cutter' | 'diamond-cutter' | 'proper-lapidary' | 'apprentice' | 'novice' | 'glass-cutter'
    bestPage: string
    hardest: string
    mostPrecise: string
    mostComplete: string
    mostBrilliant: string
    wisest: string
  }
  recommendations: string[]
}

// ─── Score computation ──────────────────────────────────

function computeScore(positiveBooleans: boolean[]): number {
  const total = positiveBooleans.length
  const perFeature = total > 0 ? Math.floor(100 / total) : 0
  const remainder = total > 0 ? 100 - perFeature * total : 0
  let score = 0
  for (let i = 0; i < total; i++) {
    if (positiveBooleans[i]) {
      score += perFeature + (i < remainder ? 1 : 0)
    }
  }
  return score
}

// ─── Classifiers ────────────────────────────────────────

/** @example classifyPageCondition(90) */
export function classifyPageCondition(score: number): PageCondition {
  if (score >= 90) return 'diamond-masterpiece'
  if (score >= 75) return 'flawless-map'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'included-stone'
  if (score >= 20) return 'rough-rock'
  return 'void'
}

/** @example classifyVolumeType(pages) */
export function classifyVolumeType(pages: DiamondPage[]): VolumeType {
  if (pages.length === 0) return 'no-volume'
  const avg =
    pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length
  if (avg >= 85) return 'complete-atlas'
  if (avg >= 70) return 'regional-map'
  if (avg >= 55) return 'proper-chart'
  if (avg >= 35) return 'single-page'
  return 'blank-book'
}

/** @example classifyVolumeCondition(85) */
export function classifyVolumeCondition(score: number): VolumeCondition {
  if (score >= 85) return 'diamond-library'
  if (score >= 70) return 'gem-collection'
  if (score >= 55) return 'proper-bookshelf'
  if (score >= 35) return 'pamphlet-rack'
  if (score >= 15) return 'empty-shelf'
  return 'void'
}

/** @example classifyCartographerGrade(80) */
export function classifyCartographerGrade(
  avgBrilliance: number,
): DiamondMapResult['stats']['cartographerGrade'] {
  if (avgBrilliance >= 80) return 'master-gem-cutter'
  if (avgBrilliance >= 65) return 'diamond-cutter'
  if (avgBrilliance >= 50) return 'proper-lapidary'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'glass-cutter'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureCrystallizing('class X { readonly y: string }') */
export function measureCrystallizing(content: string): CrystallizingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasNoUnsafe = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\b(import|export)\b/.test(content)
  const hasSolid = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDurable = /\b(async|await|Promise)\b/.test(content)
  const hasReinforced = /\b(readonly|as const)\b/.test(content)
  const hasPermanent = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length === 0
  const hasImpervious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasTypeSafe,
    hasNoUnsafe,
    hasTested,
    hasNoUntested,
    hasStable,
    hasRobust,
    hasHardened,
    hasEnduring,
    hasSolid,
    hasDurable,
    hasReinforced,
    hasPermanent,
    hasImpervious,
  ]

  const hardness = computeScore(positiveBooleans)
  const hasHighHardness = hardness >= 60

  let crystal: CrystallizingMeasure['crystal'] = 'no-hardness'
  if (hardness >= 90) crystal = 'flawless-diamond'
  else if (hardness >= 75) crystal = 'vvs-clarity'
  else if (hardness >= 60) crystal = 'proper-si'
  else if (hardness >= 40) crystal = 'included'
  else if (hardness >= 20) crystal = 'industrial-grade'

  return {
    hardness,
    crystal,
    hasHighHardness,
    hasWellStructured,
    hasNoChaotic,
    hasTypeSafe,
    hasNoUnsafe,
    hasTested,
    hasNoUntested,
    hasStable,
    hasRobust,
    hasHardened,
    hasEnduring,
    hasSolid,
    hasDurable,
    hasReinforced,
    hasPermanent,
    hasImpervious,
    chaoticCount,
    untestedCount,
  }
}

/** @example measureCutting('const x: string = ""') */
export function measureCutting(content: string): CuttingMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\b(function|=>|return)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRefined = !/\bany\b/.test(content)
  const hasPolished = /\b(const|readonly)\b/.test(content)
  const hasFaceted = /\b(try|catch|if)\b/.test(content)
  const hasSymmetrical = /\b(async|await|Promise)\b/.test(content)
  const hasProportional = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasMasterful = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const roughCount = (content.match(/\b(var|eval)\b/g) ?? []).length

  const positiveBooleans = [
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasCorrect,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasRefined,
    hasPolished,
    hasFaceted,
    hasSymmetrical,
    hasProportional,
    hasMasterful,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: CuttingMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'ideal-brilliant'
  else if (precision >= 75) cut = 'excellent-cut'
  else if (precision >= 60) cut = 'proper-facet'
  else if (precision >= 40) cut = 'poor-proportion'
  else if (precision >= 20) cut = 'rough-stone'

  return {
    precision,
    cut,
    hasHighPrecision,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasCorrect,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasRefined,
    hasPolished,
    hasFaceted,
    hasSymmetrical,
    hasProportional,
    hasMasterful,
    approximateCount,
    roughCount,
  }
}

/** @example measureMapping('export interface X { readonly y: string }') */
export function measureMapping(content: string): MappingMeasure {
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = 0
  const hasNoUndocumented = true
  const hasExported = /\b(export|public)\b/.test(content)
  const hasNoHidden = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasComprehensive = /\b(class|interface|type)\b/.test(content)
  const hasThorough = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasComplete = /\b(import|export)\b/.test(content)
  const hasCovered = /\b(readonly|private|protected)\b/.test(content)
  const hasDetailed = /\b(function|=>|return)\b/.test(content)
  const hasExplained = !/\bany\b/.test(content)
  const hasDescribed = /\b(readonly|as const)\b/.test(content)
  const hasAnnotated = /\b(async|await|Promise)\b/.test(content)
  const hasIndexed = /\b(try|catch|if)\b/.test(content)
  const hasReferenced = /\b(return|throw)\b/.test(content)
  const hasMapped = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hiddenCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length

  const positiveBooleans = [
    hasDocumented,
    hasNoUndocumented,
    hasExported,
    hasNoHidden,
    hasComprehensive,
    hasThorough,
    hasComplete,
    hasCovered,
    hasDetailed,
    hasExplained,
    hasDescribed,
    hasAnnotated,
    hasIndexed,
    hasReferenced,
    hasMapped,
  ]

  const completeness = computeScore(positiveBooleans)
  const hasHighCompleteness = completeness >= 60

  let coverage: MappingMeasure['coverage'] = 'no-completeness'
  if (completeness >= 90) coverage = 'complete-atlas'
  else if (completeness >= 75) coverage = 'detailed-map'
  else if (completeness >= 60) coverage = 'proper-chart'
  else if (completeness >= 40) coverage = 'sketch-map'
  else if (completeness >= 20) coverage = 'blank-page'

  return {
    completeness,
    coverage,
    hasHighCompleteness,
    hasDocumented,
    hasNoUndocumented,
    hasExported,
    hasNoHidden,
    hasComprehensive,
    hasThorough,
    hasComplete,
    hasCovered,
    hasDetailed,
    hasExplained,
    hasDescribed,
    hasAnnotated,
    hasIndexed,
    hasReferenced,
    hasMapped,
    undocumentedCount,
    hiddenCount,
  }
}

/** @example measureDispersing('import { X } from "y"') */
export function measureDispersing(content: string): DispersingMeasure {
  const hasVersatile = /\b(async|await|Promise)\b/.test(content)
  const hasMultiPurpose = /\b(import|export)\b/.test(content)
  const hasAdaptable = /\b(class|interface|type)\b/.test(content)
  const hasFlexible = /\b(readonly|private|protected)\b/.test(content)
  const hasExtensible = /\b(function|=>|return)\b/.test(content)
  const hasModular = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasComposable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRich = /\b(readonly|as const)\b/.test(content)
  const hasDiverse = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMultiFaceted = !/\bany\b/.test(content)
  const hasColorful = /\b(try|catch|if)\b/.test(content)
  const hasBrilliant = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasRadiant = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasLuminous = /\b(return|throw)\b/.test(content)
  const hasSpectral = /\b(const|readonly)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|hardcoded)\b/gi) ?? []).length
  const monolithicCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length

  const positiveBooleans = [
    hasVersatile,
    hasMultiPurpose,
    hasAdaptable,
    hasFlexible,
    hasExtensible,
    hasModular,
    hasComposable,
    hasRich,
    hasDiverse,
    hasMultiFaceted,
    hasColorful,
    hasBrilliant,
    hasRadiant,
    hasLuminous,
    hasSpectral,
  ]

  const fire = computeScore(positiveBooleans)
  const hasHighFire = fire >= 60

  let spectrum: DispersingMeasure['spectrum'] = 'no-fire'
  if (fire >= 90) spectrum = 'rainbow-fire'
  else if (fire >= 75) spectrum = 'brilliant-flash'
  else if (fire >= 60) spectrum = 'proper-sparkle'
  else if (fire >= 40) spectrum = 'dull-gleam'
  else if (fire >= 20) spectrum = 'no-light'

  return {
    fire,
    spectrum,
    hasHighFire,
    hasVersatile,
    hasMultiPurpose,
    hasAdaptable,
    hasFlexible,
    hasExtensible,
    hasModular,
    hasComposable,
    hasRich,
    hasDiverse,
    hasMultiFaceted,
    hasColorful,
    hasBrilliant,
    hasRadiant,
    hasLuminous,
    hasSpectral,
    rigidCount,
    monolithicCount,
  }
}

/** @example measureNavigating('export class X {}') */
export function measureNavigating(content: string): NavigatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasHolistic = /\b(import|export)\b/.test(content)
  const hasSystemic = /\b(try|catch|if)\b/.test(content)
  const hasProven = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMature = !/\bany\b/.test(content)
  const hasInsightful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasVisionary = /\b(readonly|as const)\b/.test(content)
  const hasComprehensive = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasConnected = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasEvolved = /\b(function|=>)\b/.test(content)
  const hasWise = /\b(return|throw)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|quick.fix)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasStrategic,
    hasHolistic,
    hasSystemic,
    hasProven,
    hasMature,
    hasInsightful,
    hasVisionary,
    hasComprehensive,
    hasConnected,
    hasEvolved,
    hasWise,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let chart: NavigatingMeasure['chart'] = 'no-wisdom'
  if (wisdom >= 90) chart = 'master-cartographer'
  else if (wisdom >= 75) chart = 'experienced-navigator'
  else if (wisdom >= 60) chart = 'proper-guide'
  else if (wisdom >= 40) chart = 'lost-traveler'
  else if (wisdom >= 20) chart = 'no-map'

  return {
    wisdom,
    chart,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasStrategic,
    hasHolistic,
    hasSystemic,
    hasProven,
    hasMature,
    hasInsightful,
    hasVisionary,
    hasComprehensive,
    hasConnected,
    hasEvolved,
    hasWise,
    hackedCount,
    shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeDiamondPage(content, 'app.ts') */
export function analyzeDiamondPage(content: string, filePath: string): DiamondPage {
  const crystallizing = measureCrystallizing(content)
  const cutting = measureCutting(content)
  const mapping = measureMapping(content)
  const dispersing = measureDispersing(content)
  const navigating = measureNavigating(content)

  const hardnessClarity = crystallizing.hardness
  const cutPrecision = cutting.precision
  const mapCompleteness = mapping.completeness
  const fireDispersion = dispersing.fire
  const cartographicWisdom = navigating.wisdom

  const qualityScore = Math.round(
    hardnessClarity * 0.2 +
    cutPrecision * 0.2 +
    mapCompleteness * 0.2 +
    fireDispersion * 0.2 +
    cartographicWisdom * 0.2,
  )

  const condition = classifyPageCondition(qualityScore)

  return {
    file: filePath,
    hardnessClarity,
    cutPrecision,
    mapCompleteness,
    fireDispersion,
    cartographicWisdom,
    crystallizing,
    cutting,
    mapping,
    dispersing,
    navigating,
    condition,
    qualityScore,
  }
}

/** @example analyzeDiamondVolume(pages, 'src') */
export function analyzeDiamondVolume(pages: DiamondPage[], dirPath: string): DiamondVolume {
  if (pages.length === 0) {
    return {
      directory: dirPath,
      pages: [],
      avgHardness: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      diamondMasterpieceCount: 0,
      voidCount: 0,
      volumeType: 'no-volume',
      condition: 'void',
    }
  }

  const avgHardness = Math.round(
    pages.reduce((s, p) => s + p.hardnessClarity, 0) / pages.length,
  )
  const avgPrecision = Math.round(
    pages.reduce((s, p) => s + p.cutPrecision, 0) / pages.length,
  )
  const avgWisdom = Math.round(
    pages.reduce((s, p) => s + p.cartographicWisdom, 0) / pages.length,
  )

  const diamondMasterpieceCount = pages.filter(
    (p) => p.condition === 'diamond-masterpiece',
  ).length
  const voidCount = pages.filter((p) => p.condition === 'void').length

  const volumeType = classifyVolumeType(pages)
  const avgQuality = Math.round(
    pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length,
  )
  const condition = classifyVolumeCondition(avgQuality)

  return {
    directory: dirPath,
    pages,
    avgHardness,
    avgPrecision,
    avgWisdom,
    diamondMasterpieceCount,
    voidCount,
    volumeType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildDiamondMapResult(['a.ts'], [content]) */
export async function buildDiamondMapResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<DiamondMapResult> {
  const pages: DiamondPage[] = files.map((file, i) =>
    analyzeDiamondPage(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, DiamondPage[]>()
  for (const page of pages) {
    const dir = page.file.includes('/')
      ? page.file.substring(0, page.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(page)
    } else {
      dirMap.set(dir, [page])
    }
  }

  const volumes: DiamondVolume[] = Array.from(dirMap.entries()).map(([dir, dirPages]) =>
    analyzeDiamondVolume(dirPages, dir),
  )

  const avgHardness =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.hardnessClarity, 0) / pages.length)
      : 0
  const avgPrecision =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.cutPrecision, 0) / pages.length)
      : 0
  const avgWisdom =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.cartographicWisdom, 0) / pages.length)
      : 0

  const overallBrilliance =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length)
      : 0
  const isDiamond = overallBrilliance >= 60

  const cartography = { avgHardness, avgPrecision, avgWisdom, isDiamond, overallBrilliance }

  const avgHardnessClarity = avgHardness
  const avgCutPrecision = avgPrecision
  const avgMapCompleteness =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.mapCompleteness, 0) / pages.length)
      : 0
  const avgFireDispersion =
    pages.length > 0
      ? Math.round(pages.reduce((s, p) => s + p.fireDispersion, 0) / pages.length)
      : 0
  const avgCartographicWisdom = avgWisdom

  const diamondMasterpieceCount = pages.filter(
    (p) => p.condition === 'diamond-masterpiece',
  ).length
  const flawlessMapCount = pages.filter(
    (p) => p.condition === 'flawless-map',
  ).length
  const properGemCount = pages.filter(
    (p) => p.condition === 'proper-gem',
  ).length
  const includedStoneCount = pages.filter(
    (p) => p.condition === 'included-stone',
  ).length
  const roughRockCount = pages.filter(
    (p) => p.condition === 'rough-rock',
  ).length
  const voidCount = pages.filter((p) => p.condition === 'void').length

  const hasHighHardnessCount = pages.filter(
    (p) => p.crystallizing.hasHighHardness,
  ).length
  const hasHighPrecisionCount = pages.filter(
    (p) => p.cutting.hasHighPrecision,
  ).length
  const hasHighCompletenessCount = pages.filter(
    (p) => p.mapping.hasHighCompleteness,
  ).length
  const hasHighFireCount = pages.filter(
    (p) => p.dispersing.hasHighFire,
  ).length
  const hasHighWisdomCount = pages.filter(
    (p) => p.navigating.hasHighWisdom,
  ).length

  const cartographerGrade = classifyCartographerGrade(overallBrilliance)

  const bestPage = pages.length > 0
    ? pages.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const hardest = pages.length > 0
    ? pages.reduce((best, p) => (p.hardnessClarity > best.hardnessClarity ? p : best)).file
    : ''
  const mostPrecise = pages.length > 0
    ? pages.reduce((best, p) => (p.cutPrecision > best.cutPrecision ? p : best)).file
    : ''
  const mostComplete = pages.length > 0
    ? pages.reduce((best, p) => (p.mapCompleteness > best.mapCompleteness ? p : best)).file
    : ''
  const mostBrilliant = pages.length > 0
    ? pages.reduce((best, p) => (p.fireDispersion > best.fireDispersion ? p : best)).file
    : ''
  const wisest = pages.length > 0
    ? pages.reduce((best, p) => (p.cartographicWisdom > best.cartographicWisdom ? p : best)).file
    : ''

  const stats: DiamondMapResult['stats'] = {
    totalFiles: files.length,
    totalVolumes: volumes.length,
    avgHardnessClarity,
    avgCutPrecision,
    avgMapCompleteness,
    avgFireDispersion,
    avgCartographicWisdom,
    diamondMasterpieceCount,
    flawlessMapCount,
    properGemCount,
    includedStoneCount,
    roughRockCount,
    voidCount,
    hasHighHardnessCount,
    hasHighPrecisionCount,
    hasHighCompletenessCount,
    hasHighFireCount,
    hasHighWisdomCount,
    overallBrilliance,
    cartographerGrade,
    bestPage,
    hardest,
    mostPrecise,
    mostComplete,
    mostBrilliant,
    wisest,
  }

  const recommendations = generateRecommendations(pages, volumes, cartography, stats)

  return { pages, volumes, cartography, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(pages, volumes, cartography, stats) */
export function generateRecommendations(
  pages: DiamondPage[],
  volumes: DiamondVolume[],
  cartography: DiamondMapResult['cartography'],
  stats: DiamondMapResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgHardnessClarity >= 90 &&
    stats.avgCutPrecision >= 90 &&
    stats.avgMapCompleteness >= 90 &&
    stats.avgFireDispersion >= 90 &&
    stats.avgCartographicWisdom >= 90
  ) {
    recs.push(
      'Your diamond atlas is a masterpiece of permanent brilliance! Every page reflects the hardest clarity with the precision of a master gem cutter!',
    )
    return recs
  }

  if (stats.avgHardnessClarity < 60) {
    recs.push(
      'Harden the diamond clarity — improve your hardness score so only the strongest crystal structure survives the test of time; your code must be structurally impervious',
    )
  }

  if (stats.avgCutPrecision < 60) {
    recs.push(
      'Sharpen the cut precision — a diamond value comes from its cut; every facet of your code should be carved with gem-cutter exactness',
    )
  }

  if (stats.avgMapCompleteness < 60) {
    recs.push(
      'Complete the atlas coverage — an atlas that maps everything leaves no territory unexplored; your code should document every path and destination',
    )
  }

  if (stats.avgFireDispersion < 60) {
    recs.push(
      'Increase the fire dispersion — a diamond rainbow comes from many perfect facets; your code should shine brilliantly from every angle',
    )
  }

  if (stats.avgCartographicWisdom < 60) {
    recs.push(
      'Deepen the cartographic wisdom — the best maps come from understanding every connection; your code should know the whole territory it serves',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The atlas pages are blank — until the first diamond is cut, no map can be drawn',
    )
  }

  const voidPages = pages.filter((p) => p.condition === 'void')
  if (voidPages.length > 0 && voidPages.length <= 5) {
    recs.push(
      `Re-cut these rough rocks: ${voidPages.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPages.length > 5) {
    recs.push(
      `Re-cut these ${voidPages.length} rough rocks before the entire atlas crumbles`,
    )
  }

  const poorVolumes = volumes.filter(
    (v) => v.condition === 'void' || v.condition === 'empty-shelf',
  )
  if (poorVolumes.length === volumes.length && volumes.length > 0) {
    recs.push(
      'All volumes are empty shelves — the diamond atlas needs a complete recutting',
    )
  }

  if (recs.length === 0) {
    recs.push('Your diamond atlas sparkles with enduring clarity — each page cut with precision and mapped with cartographic wisdom')
  }

  return recs
}
