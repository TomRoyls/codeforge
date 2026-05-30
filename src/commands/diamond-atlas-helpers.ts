// ─── Interfaces ──────────────────────────────────────────

export interface CrystallizingMeasure {
  clarity: number
  diamond:
    | 'flawless-clarity'
    | 'pure-diamond'
    | 'proper-gem'
    | 'cloudy-crystal'
    | 'rough-stone'
    | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasNoArcane: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasEnduring: boolean
  hasNoFleeting: boolean
  hasImmutable: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface FacetingMeasure {
  precision: number
  cut:
    | 'ideal-cut'
    | 'excellent-facet'
    | 'proper-cut'
    | 'rough-shape'
    | 'uncut-stone'
    | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasDeterministic: boolean
  hasNoRandom: boolean
  hasPrecise: boolean
  unsafeCount: number
  buggyCount: number
}

export interface MappingMeasure {
  completeness: number
  coverage:
    | 'complete-atlas'
    | 'thorough-map'
    | 'proper-chart'
    | 'partial-map'
    | 'sketch'
    | 'no-completeness'
  hasHighCompleteness: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasEdgeCaseHandled: boolean
  hasNoEdgeIgnored: boolean
  hasComplete: boolean
  hasNoIncomplete: boolean
  hasThorough: boolean
  hasNoSuperficial: boolean
  hasComprehensive: boolean
  untestedCount: number
  undocumentedCount: number
}

export interface DispersingMeasure {
  fire: number
  spectrum:
    | 'full-rainbow'
    | 'vivid-fire'
    | 'proper-dispersion'
    | 'dim-light'
    | 'no-fire'
    | 'no-dispersion'
  hasHighFire: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasSeparation: boolean
  hasNoTangled: boolean
  hasCleanPipelines: boolean
  hasNoSpaghetti: boolean
  hasMultiConcern: boolean
  hasNoSinglePurpose: boolean
  hasAbstracted: boolean
  hasNoLeaky: boolean
  hasOrganized: boolean
  hasNoMixed: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasVersatile: boolean
  tangledCount: number
  spaghettiCount: number
}

export interface GuidingMeasure {
  wisdom: number
  compass:
    | 'true-north'
    | 'accurate-compass'
    | 'proper-guide'
    | 'broken-compass'
    | 'lost-wanderer'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasNavigable: boolean
  hackedCount: number
  adHocCount: number
}

export type PageCondition =
  | 'diamond-masterpiece'
  | 'crystal-atlas'
  | 'proper-map'
  | 'faded-chart'
  | 'torn-page'
  | 'void'

export interface DiamondPage {
  file: string
  hardnessClarity: number
  cutPrecision: number
  mapCompleteness: number
  fireDispersion: number
  cartographicWisdom: number
  crystallizing: CrystallizingMeasure
  faceting: FacetingMeasure
  mapping: MappingMeasure
  dispersing: DispersingMeasure
  guiding: GuidingMeasure
  condition: PageCondition
  qualityScore: number
}

export type VolumeType =
  | 'complete-atlas'
  | 'regional-map'
  | 'proper-chart'
  | 'single-page'
  | 'blank-paper'
  | 'no-volume'

export type VolumeCondition =
  | 'crystal-library'
  | 'diamond-archive'
  | 'proper-collection'
  | 'faded-shelf'
  | 'torn-book'
  | 'void'

export interface DiamondVolume {
  directory: string
  pages: DiamondPage[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  diamondMasterpieceCount: number
  voidCount: number
  volumeType: VolumeType
  condition: VolumeCondition
}

export type CartographerGrade =
  | 'master-cartographer'
  | 'diamond-cutter'
  | 'map-maker'
  | 'apprentice'
  | 'novice'
  | 'lost-soul'

export interface DiamondAtlasStats {
  totalFiles: number
  totalVolumes: number
  avgHardnessClarity: number
  avgCutPrecision: number
  avgMapCompleteness: number
  avgFireDispersion: number
  avgCartographicWisdom: number
  diamondMasterpieceCount: number
  crystalAtlasCount: number
  properMapCount: number
  fadedChartCount: number
  tornPageCount: number
  voidCount: number
  hasHighClarityCount: number
  hasHighPrecisionCount: number
  hasHighCompletenessCount: number
  hasHighFireCount: number
  hasHighWisdomCount: number
  overallBrilliance: number
  cartographerGrade: CartographerGrade
  bestPage: string
  clearest: string
  mostPrecise: string
  mostComplete: string
  mostColorful: string
  wisest: string
}

export interface DiamondAtlasResult {
  pages: DiamondPage[]
  volumes: DiamondVolume[]
  cartography: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isDiamond: boolean
    overallBrilliance: number
  }
  stats: DiamondAtlasStats
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

// ─── Measure functions ──────────────────────────────────

/** @example measureCrystallizing('export function add(): number { }') */
export function measureCrystallizing(content: string): CrystallizingMeasure {
  const hasReadable = /\w+\.\w+/.test(content)
  const crypticCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /\bexport\b/.test(content)
  const obfuscatedCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasUnderstandable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoContradictory = !/\b(contradictory|conflicting|inconsistent)\b/i.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasNoFleeting = !/\b(fleeting|temporary|ephemeral)\b/i.test(content)
  const hasImmutable = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasConsistent,
    hasEnduring,
    hasImmutable,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const diamond = classifyDiamond(clarity)

  return {
    clarity,
    diamond,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasNoHidden,
    hasUnderstandable,
    hasNoArcane,
    hasConsistent,
    hasNoContradictory,
    hasEnduring,
    hasNoFleeting,
    hasImmutable,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureFaceting('export interface Config { readonly name: string }') */
export function measureFaceting(content: string): FacetingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /\b(function|class|interface)\b/.test(content)
  const hasNoWrong = !/\b(wrong|incorrect|error.prone)\b/i.test(content)
  const hasExact = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|close.enough)\b/i.test(content)
  const hasCorrect = /\b(return|yield|emit)\b/.test(content)
  const buggyCount = (content.match(/\b(buggy|broken|defective)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasValidated = /\b(try|catch|if)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|hope)\b/i.test(content)
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasDeterministic = /\b(const|readonly)\b/.test(content)
  const hasNoRandom = !/\b(random|arbitrary|chaotic)\b/i.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasAccurate,
    hasExact,
    hasCorrect,
    hasValidated,
    hasConsistent,
    hasDeterministic,
    hasPrecise,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const cut = classifyCut(precision)

  return {
    precision,
    cut,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoWrong,
    hasExact,
    hasNoApproximate,
    hasCorrect,
    hasNoBuggy,
    hasValidated,
    hasNoAssumed,
    hasConsistent,
    hasNoErratic,
    hasDeterministic,
    hasNoRandom,
    hasPrecise,
    unsafeCount,
    buggyCount,
  }
}

/** @example measureMapping('try { foo() } catch { bar() }') */
export function measureMapping(content: string): MappingMeasure {
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
    ? 0
    : (content.match(/\bfunction\b/g) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasExported = /\bexport\b/.test(content)
  const hasNoIsolated = /\b(import|export|from)\b/.test(content)
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const hasNoBareCrash = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasEdgeCaseHandled = /\b(if|switch|default|else)\b/.test(content)
  const hasNoEdgeIgnored = !/\b(ignore|skip|bypass)\b/i.test(content)
  const hasComplete = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoIncomplete = !/\b(incomplete|partial|unfinished)\b/i.test(content)
  const hasThorough = /\b(readonly|private|protected)\b/.test(content)
  const hasNoSuperficial = !/\b(superficial|shallow|surface)\b/i.test(content)
  const hasComprehensive = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasTested,
    hasDocumented,
    hasExported,
    hasErrorHandled,
    hasEdgeCaseHandled,
    hasComplete,
    hasThorough,
    hasComprehensive,
  ]

  const completeness = computeScore(positiveBooleans)
  const hasHighCompleteness = completeness >= 60
  const coverage = classifyCoverage(completeness)

  return {
    completeness,
    coverage,
    hasHighCompleteness,
    hasTested,
    hasNoUntested,
    hasDocumented,
    hasNoUndocumented,
    hasExported,
    hasNoIsolated,
    hasErrorHandled,
    hasNoBareCrash,
    hasEdgeCaseHandled,
    hasNoEdgeIgnored,
    hasComplete,
    hasNoIncomplete,
    hasThorough,
    hasNoSuperficial,
    hasComprehensive,
    untestedCount,
    undocumentedCount,
  }
}

/** @example measureDispersing('export async function process(): Promise<void> { }') */
export function measureDispersing(content: string): DispersingMeasure {
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|giant|massive)\b/i.test(content)
  const hasSeparation = /\b(class|interface|type|enum)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|woven|intertwined)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasCleanPipelines = /\b(return|yield|emit)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|tangle|mess)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasMultiConcern = /\b(async|await|Promise)\b/.test(content)
  const hasNoSinglePurpose = !/\b(single.purpose|only.does|just.one)\b/i.test(content)
  const hasAbstracted = /\b(readonly|private|protected)\b/.test(content)
  const hasNoLeaky = !content.includes('@ts-ignore')
  const hasOrganized = /\b(function|class|interface)\b/.test(content)
  const hasNoMixed = (content.match(/\bany\b/g) ?? []).length === 0
  const hasFlexible = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoRigid = !/\b(rigid|inflexible|hardcoded)\b/i.test(content)
  const hasVersatile = /\bexport\b/.test(content)

  const positiveBooleans = [
    hasModular,
    hasSeparation,
    hasCleanPipelines,
    hasMultiConcern,
    hasAbstracted,
    hasOrganized,
    hasFlexible,
    hasVersatile,
  ]

  const fire = computeScore(positiveBooleans)
  const hasHighFire = fire >= 60
  const spectrum = classifySpectrum(fire)

  return {
    fire,
    spectrum,
    hasHighFire,
    hasModular,
    hasNoMonolithic,
    hasSeparation,
    hasNoTangled,
    hasCleanPipelines,
    hasNoSpaghetti,
    hasMultiConcern,
    hasNoSinglePurpose,
    hasAbstracted,
    hasNoLeaky,
    hasOrganized,
    hasNoMixed,
    hasFlexible,
    hasNoRigid,
    hasVersatile,
    tangledCount,
    spaghettiCount,
  }
}

/** @example measureGuiding('export const WISDOM = true as const') */
export function measureGuiding(content: string): GuidingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNavigable = /\b(import|export|from)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasPatterned,
    hasProven,
    hasDeep,
    hasMature,
    hasStrategic,
    hasInsightful,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const compass = classifyCompass(wisdom)

  return {
    wisdom,
    compass,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasPatterned,
    hasNoReinvented,
    hasProven,
    hasNoExperimental,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasNoNaive,
    hasStrategic,
    hasInsightful,
    hasNavigable,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyDiamond(score: number): CrystallizingMeasure['diamond'] {
  if (score >= 90) return 'flawless-clarity'
  if (score >= 75) return 'pure-diamond'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'cloudy-crystal'
  if (score >= 20) return 'rough-stone'
  return 'no-clarity'
}

function classifyCut(score: number): FacetingMeasure['cut'] {
  if (score >= 90) return 'ideal-cut'
  if (score >= 75) return 'excellent-facet'
  if (score >= 60) return 'proper-cut'
  if (score >= 40) return 'rough-shape'
  if (score >= 20) return 'uncut-stone'
  return 'no-precision'
}

function classifyCoverage(score: number): MappingMeasure['coverage'] {
  if (score >= 90) return 'complete-atlas'
  if (score >= 75) return 'thorough-map'
  if (score >= 60) return 'proper-chart'
  if (score >= 40) return 'partial-map'
  if (score >= 20) return 'sketch'
  return 'no-completeness'
}

function classifySpectrum(score: number): DispersingMeasure['spectrum'] {
  if (score >= 90) return 'full-rainbow'
  if (score >= 75) return 'vivid-fire'
  if (score >= 60) return 'proper-dispersion'
  if (score >= 40) return 'dim-light'
  if (score >= 20) return 'no-fire'
  return 'no-dispersion'
}

function classifyCompass(score: number): GuidingMeasure['compass'] {
  if (score >= 90) return 'true-north'
  if (score >= 75) return 'accurate-compass'
  if (score >= 60) return 'proper-guide'
  if (score >= 40) return 'broken-compass'
  if (score >= 20) return 'lost-wanderer'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): PageCondition {
  if (score >= 90) return 'diamond-masterpiece'
  if (score >= 75) return 'crystal-atlas'
  if (score >= 60) return 'proper-map'
  if (score >= 40) return 'faded-chart'
  if (score >= 20) return 'torn-page'
  return 'void'
}

/** @example classifyVolumeType(pages) */
export function classifyVolumeType(pages: DiamondPage[]): VolumeType {
  if (pages.length === 0) return 'no-volume'
  const avg = pages.reduce((s, p) => s + p.qualityScore, 0) / pages.length
  if (avg >= 90) return 'complete-atlas'
  if (avg >= 75) return 'regional-map'
  if (avg >= 60) return 'proper-chart'
  if (avg >= 40) return 'single-page'
  if (avg >= 20) return 'blank-paper'
  return 'no-volume'
}

/** @example classifyVolumeCondition(avgClarity) */
export function classifyVolumeCondition(avgClarity: number): VolumeCondition {
  if (avgClarity >= 85) return 'crystal-library'
  if (avgClarity >= 70) return 'diamond-archive'
  if (avgClarity >= 55) return 'proper-collection'
  if (avgClarity >= 35) return 'faded-shelf'
  if (avgClarity >= 15) return 'torn-book'
  return 'void'
}

/** @example classifyCartographerGrade(80) */
export function classifyCartographerGrade(avgBrilliance: number): CartographerGrade {
  if (avgBrilliance >= 80) return 'master-cartographer'
  if (avgBrilliance >= 65) return 'diamond-cutter'
  if (avgBrilliance >= 50) return 'map-maker'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'lost-soul'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeDiamondPage(content, 'app.ts') */
export function analyzeDiamondPage(content: string, filePath: string): DiamondPage {
  const crystallizing = measureCrystallizing(content)
  const faceting = measureFaceting(content)
  const mapping = measureMapping(content)
  const dispersing = measureDispersing(content)
  const guiding = measureGuiding(content)

  const hardnessClarity = crystallizing.clarity
  const cutPrecision = faceting.precision
  const mapCompleteness = mapping.completeness
  const fireDispersion = dispersing.fire
  const cartographicWisdom = guiding.wisdom

  const qualityScore = Math.round(
    hardnessClarity * 0.2 +
    cutPrecision * 0.2 +
    mapCompleteness * 0.2 +
    fireDispersion * 0.2 +
    cartographicWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    hardnessClarity,
    cutPrecision,
    mapCompleteness,
    fireDispersion,
    cartographicWisdom,
    crystallizing,
    faceting,
    mapping,
    dispersing,
    guiding,
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
      avgClarity: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      diamondMasterpieceCount: 0,
      voidCount: 0,
      volumeType: 'no-volume',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
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
    avgClarity,
    avgPrecision,
    avgWisdom,
    diamondMasterpieceCount,
    voidCount,
    volumeType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildDiamondAtlasResult(['a.ts'], [content]) */
export async function buildDiamondAtlasResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<DiamondAtlasResult> {
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

  const avgClarity =
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

  const cartography = { avgClarity, avgPrecision, avgWisdom, isDiamond, overallBrilliance }

  const avgHardnessClarity = avgClarity
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
  const crystalAtlasCount = pages.filter((p) => p.condition === 'crystal-atlas').length
  const properMapCount = pages.filter((p) => p.condition === 'proper-map').length
  const fadedChartCount = pages.filter((p) => p.condition === 'faded-chart').length
  const tornPageCount = pages.filter((p) => p.condition === 'torn-page').length
  const voidCount = pages.filter((p) => p.condition === 'void').length

  const hasHighClarityCount = pages.filter((p) => p.crystallizing.hasHighClarity).length
  const hasHighPrecisionCount = pages.filter((p) => p.faceting.hasHighPrecision).length
  const hasHighCompletenessCount = pages.filter((p) => p.mapping.hasHighCompleteness).length
  const hasHighFireCount = pages.filter((p) => p.dispersing.hasHighFire).length
  const hasHighWisdomCount = pages.filter((p) => p.guiding.hasHighWisdom).length

  const cartographerGrade = classifyCartographerGrade(overallBrilliance)

  const bestPage = pages.length > 0
    ? pages.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const clearest = pages.length > 0
    ? pages.reduce((best, p) => (p.hardnessClarity > best.hardnessClarity ? p : best)).file
    : ''
  const mostPrecise = pages.length > 0
    ? pages.reduce((best, p) => (p.cutPrecision > best.cutPrecision ? p : best)).file
    : ''
  const mostComplete = pages.length > 0
    ? pages.reduce((best, p) => (p.mapCompleteness > best.mapCompleteness ? p : best)).file
    : ''
  const mostColorful = pages.length > 0
    ? pages.reduce((best, p) => (p.fireDispersion > best.fireDispersion ? p : best)).file
    : ''
  const wisest = pages.length > 0
    ? pages.reduce((best, p) => (p.cartographicWisdom > best.cartographicWisdom ? p : best)).file
    : ''

  const stats: DiamondAtlasStats = {
    totalFiles: files.length,
    totalVolumes: volumes.length,
    avgHardnessClarity,
    avgCutPrecision,
    avgMapCompleteness,
    avgFireDispersion,
    avgCartographicWisdom,
    diamondMasterpieceCount,
    crystalAtlasCount,
    properMapCount,
    fadedChartCount,
    tornPageCount,
    voidCount,
    hasHighClarityCount,
    hasHighPrecisionCount,
    hasHighCompletenessCount,
    hasHighFireCount,
    hasHighWisdomCount,
    overallBrilliance,
    cartographerGrade,
    bestPage,
    clearest,
    mostPrecise,
    mostComplete,
    mostColorful,
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
  _cartography: DiamondAtlasResult['cartography'],
  stats: DiamondAtlasStats,
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
      'Your diamond atlas achieves flawless crystalline perfection! Every page is a masterpiece of cartographic brilliance and enduring clarity',
    )
    return recs
  }

  if (stats.avgHardnessClarity < 60) {
    recs.push(
      'Sharpen hardness clarity — code should reveal truth like a flawless diamond, transparent and enduring',
    )
  }

  if (stats.avgCutPrecision < 60) {
    recs.push(
      'Refine cut precision — code must be faceted with exacting care, each angle serving its purpose',
    )
  }

  if (stats.avgMapCompleteness < 60) {
    recs.push(
      'Complete the atlas — code should cover every territory like a comprehensive diamond atlas, leaving no terrain unmapped',
    )
  }

  if (stats.avgFireDispersion < 60) {
    recs.push(
      'Enhance fire dispersion — code should separate concerns like a diamond disperses light into brilliant spectral colors',
    )
  }

  if (stats.avgCartographicWisdom < 60) {
    recs.push(
      'Deepen cartographic wisdom — code should guide through complexity like an expert cartographer navigating uncharted territory',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The atlas crumbles into torn pages — rebuild the crystalline structure before the maps fade completely',
    )
  }

  const voidPages = pages.filter((p) => p.condition === 'void')
  if (voidPages.length > 0 && voidPages.length <= 5) {
    recs.push(
      `Restore these torn pages: ${voidPages.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPages.length > 5) {
    recs.push(
      `Restore these ${voidPages.length} torn pages before the entire atlas disintegrates`,
    )
  }

  const poorVolumes = volumes.filter(
    (v) => v.condition === 'void' || v.condition === 'torn-book',
  )
  if (poorVolumes.length === volumes.length && volumes.length > 0) {
    recs.push(
      'All volumes show signs of decay — consider a complete restoration of the diamond atlas',
    )
  }

  if (recs.length === 0) {
    recs.push('Your diamond atlas gleams with crystalline brilliance — keep charting with diamond precision')
  }

  return recs
}
