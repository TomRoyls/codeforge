// ─── Interfaces ──────────────────────────────────────────

export interface StructuringMeasure {
  clarity: number
  crystal: 'herkimer-diamond' | 'clear-quartz' | 'proper-crystal' | 'milky-quartz' | 'cloudy-stone' | 'no-clarity'
  hasHighClarity: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasOrganized: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasClean: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasOpen: boolean
  hasVisible: boolean
  hasRevealed: boolean
  hasUnobscured: boolean
  chaoticCount: number
  crypticCount: number
}

export interface RefractingMeasure {
  refraction: number
  spectrum: 'full-rainbow' | 'rich-spectrum' | 'proper-colors' | 'pale-hue' | 'monochrome' | 'no-refraction'
  hasHighRefraction: boolean
  hasComprehensive: boolean
  hasNoIncomplete: boolean
  hasThorough: boolean
  hasNoPartial: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasExposed: boolean
  hasRevealed: boolean
  hasVisible: boolean
  hasOpen: boolean
  hasDiverse: boolean
  hasMultiFaceted: boolean
  hasRich: boolean
  incompleteCount: number
  undocumentedCount: number
}

export interface PolishingMeasure {
  precision: number
  cut: 'triple-excellent' | 'ideal-cut' | 'proper-facet' | 'rough-polish' | 'uncut-stone' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasClean: boolean
  hasCorrect: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasHoned: boolean
  hasPerfect: boolean
  unsafeCount: number
  approximateCount: number
}

export interface ResonatingMeasure {
  purity: number
  tone: 'pure-tone' | 'clear-note' | 'proper-frequency' | 'static-noise' | 'distorted-signal' | 'no-purity'
  hasHighPurity: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasNoDeadCode: boolean
  hasPristine: boolean
  hasUnblemished: boolean
  hasSpotless: boolean
  hasImmaculate: boolean
  hasPure: boolean
  hasUncontaminated: boolean
  hasUnpolluted: boolean
  hasFlawless: boolean
  hackCount: number
  workaroundCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  depth: 'geological-age' | 'crystal-memory' | 'proper-strata' | 'surface-scratch' | 'no-depth' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasPatient: boolean
  hasWise: boolean
  hasEnduring: boolean
  hackedCount: number
  shallowCount: number
}

export type FacetCondition =
  | 'quartz-masterpiece'
  | 'gem-quality'
  | 'proper-crystal'
  | 'industrial-grade'
  | 'raw-sand'
  | 'void'

export interface QuartzFacet {
  file: string
  crystallineClarity: number
  spectrumRefraction: number
  facetPrecision: number
  vibrationPurity: number
  mineralWisdom: number
  structuring: StructuringMeasure
  refracting: RefractingMeasure
  polishing: PolishingMeasure
  resonating: ResonatingMeasure
  accumulating: AccumulatingMeasure
  condition: FacetCondition
  qualityScore: number
}

export type GeodeType =
  | 'treasure-geode'
  | 'crystal-cave'
  | 'proper-cluster'
  | 'small-nodule'
  | 'empty-rock'
  | 'no-geode'

export type GeodeCondition =
  | 'crystal-palace'
  | 'gem-cave'
  | 'proper-mine'
  | 'gravel-pit'
  | 'sand-dune'
  | 'void'

export interface QuartzGeode {
  directory: string
  facets: QuartzFacet[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  quartzMasterpieceCount: number
  voidCount: number
  geodeType: GeodeType
  condition: GeodeCondition
}

export type LapidaryGrade = 'master-lapidary' | 'crystal-cutter' | 'proper-gemologist' | 'apprentice' | 'novice' | 'rock-collector'

export interface QuartzPrismResult {
  facets: QuartzFacet[]
  geodes: QuartzGeode[]
  spectrum: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isQuartz: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalGeodes: number
    avgCrystallineClarity: number
    avgSpectrumRefraction: number
    avgFacetPrecision: number
    avgVibrationPurity: number
    avgMineralWisdom: number
    quartzMasterpieceCount: number
    gemQualityCount: number
    properCrystalCount: number
    industrialGradeCount: number
    rawSandCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighRefractionCount: number
    hasHighPrecisionCount: number
    hasHighPurityCount: number
    hasHighWisdomCount: number
    overallBrilliance: number
    lapidaryGrade: LapidaryGrade
    bestFacet: string
    clearest: string
    mostRefractive: string
    mostPrecise: string
    purest: string
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

/** @example classifyFacetCondition(90) */
export function classifyFacetCondition(score: number): FacetCondition {
  if (score >= 90) return 'quartz-masterpiece'
  if (score >= 75) return 'gem-quality'
  if (score >= 60) return 'proper-crystal'
  if (score >= 40) return 'industrial-grade'
  if (score >= 20) return 'raw-sand'
  return 'void'
}

/** @example classifyGeodeType(facets) */
export function classifyGeodeType(facets: QuartzFacet[]): GeodeType {
  if (facets.length === 0) return 'no-geode'
  const avg = facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length
  if (avg >= 85) return 'treasure-geode'
  if (avg >= 70) return 'crystal-cave'
  if (avg >= 55) return 'proper-cluster'
  if (avg >= 35) return 'small-nodule'
  return 'empty-rock'
}

/** @example classifyGeodeCondition(85) */
export function classifyGeodeCondition(score: number): GeodeCondition {
  if (score >= 85) return 'crystal-palace'
  if (score >= 70) return 'gem-cave'
  if (score >= 55) return 'proper-mine'
  if (score >= 35) return 'gravel-pit'
  if (score >= 15) return 'sand-dune'
  return 'void'
}

/** @example classifyLapidaryGrade(80) */
export function classifyLapidaryGrade(avgBrilliance: number): LapidaryGrade {
  if (avgBrilliance >= 80) return 'master-lapidary'
  if (avgBrilliance >= 65) return 'crystal-cutter'
  if (avgBrilliance >= 50) return 'proper-gemologist'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-collector'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureStructuring('export class X { readonly y: string }') */
export function measureStructuring(content: string): StructuringMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|tangled|spaghetti)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnderstandable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSelfDocumenting = /\b(function|=>|return)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = !/\bany\b/.test(content)
  const hasOpen = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasVisible = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasRevealed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnobscured = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasReadable, hasNoCryptic, hasOrganized,
    hasTransparent, hasUnderstandable, hasClean, hasSelfDocumenting, hasNoMystery,
    hasClear, hasOpen, hasVisible, hasRevealed, hasUnobscured,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let crystal: StructuringMeasure['crystal'] = 'no-clarity'
  if (clarity >= 90) crystal = 'herkimer-diamond'
  else if (clarity >= 75) crystal = 'clear-quartz'
  else if (clarity >= 60) crystal = 'proper-crystal'
  else if (clarity >= 40) crystal = 'milky-quartz'
  else if (clarity >= 20) crystal = 'cloudy-stone'

  return {
    clarity, crystal, hasHighClarity,
    hasWellStructured, hasNoChaotic, hasReadable, hasNoCryptic, hasOrganized,
    hasTransparent, hasUnderstandable, hasClean, hasSelfDocumenting, hasNoMystery,
    hasClear, hasOpen, hasVisible, hasRevealed, hasUnobscured,
    chaoticCount, crypticCount,
  }
}

/** @example measureRefracting('export class X { readonly y: string }') */
export function measureRefracting(content: string): RefractingMeasure {
  const hasComprehensive = /\b(class|interface|type)\b/.test(content)
  const incompleteCount = (content.match(/\b(incomplete|partial|fragment|half-implemented)\b/gi) ?? []).length
  const hasNoIncomplete = incompleteCount === 0
  const hasThorough = /\b(import|export)\b/.test(content)
  const hasNoPartial = (content.match(/\b(partial|sketch|draft|placeholder)\b/gi) ?? []).length === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\b(undocumented|unexplained|uncommented)\b/gi) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasExported = /\b(export)\b/.test(content)
  const hasNoHidden = !/\bany\b/.test(content)
  const hasExposed = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRevealed = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasOpen = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasDiverse = /\b(async|await|Promise)\b/.test(content)
  const hasMultiFaceted = /\b(try|catch|if)\b/.test(content)
  const hasRich = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasComprehensive, hasNoIncomplete, hasThorough, hasNoPartial, hasDocumented,
    hasNoUndocumented, hasExported, hasNoHidden, hasExposed, hasRevealed,
    hasVisible, hasOpen, hasDiverse, hasMultiFaceted, hasRich,
  ]

  const refraction = computeScore(positiveBooleans)
  const hasHighRefraction = refraction >= 60

  let spectrum: RefractingMeasure['spectrum'] = 'no-refraction'
  if (refraction >= 90) spectrum = 'full-rainbow'
  else if (refraction >= 75) spectrum = 'rich-spectrum'
  else if (refraction >= 60) spectrum = 'proper-colors'
  else if (refraction >= 40) spectrum = 'pale-hue'
  else if (refraction >= 20) spectrum = 'monochrome'

  return {
    refraction, spectrum, hasHighRefraction,
    hasComprehensive, hasNoIncomplete, hasThorough, hasNoPartial, hasDocumented,
    hasNoUndocumented, hasExported, hasNoHidden, hasExposed, hasRevealed,
    hasVisible, hasOpen, hasDiverse, hasMultiFaceted, hasRich,
    incompleteCount, undocumentedCount,
  }
}

/** @example measurePolishing('export class X { readonly y: string }') */
export function measurePolishing(content: string): PolishingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPolished = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasRefined = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasHoned = /\b(try|catch|if)\b/.test(content)
  const hasPerfect = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasPolished, hasRefined, hasHoned, hasPerfect,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: PolishingMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'triple-excellent'
  else if (precision >= 75) cut = 'ideal-cut'
  else if (precision >= 60) cut = 'proper-facet'
  else if (precision >= 40) cut = 'rough-polish'
  else if (precision >= 20) cut = 'uncut-stone'

  return {
    precision, cut, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasPolished, hasRefined, hasHoned, hasPerfect,
    unsafeCount, approximateCount,
  }
}

/** @example measureResonating('export class X { readonly y: string }') */
export function measureResonating(content: string): ResonatingMeasure {
  const hackCount = (content.match(/\b(hack|hacky| hacked)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|quickfix|band-aid|bandaid)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/.*\bconsole\.(log|debug|warn|error)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(debugger|console\.(log|debug|trace))\b/g) ?? []).length === 0
  const hasNoDeadCode = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasClean = !/\bany\b/.test(content)
  const hasPristine = /\b(class|interface|type)\b/.test(content)
  const hasUnblemished = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSpotless = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImmaculate = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPure = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasUncontaminated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnpolluted = /\b(import|export)\b/.test(content)
  const hasFlawless = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasNoDeadCode, hasClean, hasPristine, hasUnblemished, hasSpotless,
    hasImmaculate, hasPure, hasUncontaminated, hasUnpolluted, hasFlawless,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let tone: ResonatingMeasure['tone'] = 'no-purity'
  if (purity >= 90) tone = 'pure-tone'
  else if (purity >= 75) tone = 'clear-note'
  else if (purity >= 60) tone = 'proper-frequency'
  else if (purity >= 40) tone = 'static-noise'
  else if (purity >= 20) tone = 'distorted-signal'

  return {
    purity, tone, hasHighPurity,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasUnblemished, hasSpotless,
    hasImmaculate, hasPure, hasUncontaminated, hasUnpolluted, hasFlawless,
    hackCount, workaroundCount,
  }
}

/** @example measureAccumulating('export class X { readonly y: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHolistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasPatient = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasPatient, hasWise, hasEnduring,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let depth: AccumulatingMeasure['depth'] = 'no-wisdom'
  if (wisdom >= 90) depth = 'geological-age'
  else if (wisdom >= 75) depth = 'crystal-memory'
  else if (wisdom >= 60) depth = 'proper-strata'
  else if (wisdom >= 40) depth = 'surface-scratch'
  else if (wisdom >= 20) depth = 'no-depth'

  return {
    wisdom, depth, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasPatient, hasWise, hasEnduring,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeQuartzFacet(content, 'app.ts') */
export function analyzeQuartzFacet(content: string, filePath: string): QuartzFacet {
  const structuring = measureStructuring(content)
  const refracting = measureRefracting(content)
  const polishing = measurePolishing(content)
  const resonating = measureResonating(content)
  const accumulating = measureAccumulating(content)

  const crystallineClarity = structuring.clarity
  const spectrumRefraction = refracting.refraction
  const facetPrecision = polishing.precision
  const vibrationPurity = resonating.purity
  const mineralWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    crystallineClarity * 0.2 +
    spectrumRefraction * 0.2 +
    facetPrecision * 0.2 +
    vibrationPurity * 0.2 +
    mineralWisdom * 0.2,
  )

  const condition = classifyFacetCondition(qualityScore)

  return {
    file: filePath,
    crystallineClarity, spectrumRefraction, facetPrecision, vibrationPurity, mineralWisdom,
    structuring, refracting, polishing, resonating, accumulating,
    condition, qualityScore,
  }
}

/** @example analyzeQuartzGeode(facets, 'src') */
export function analyzeQuartzGeode(facets: QuartzFacet[], dirPath: string): QuartzGeode {
  if (facets.length === 0) {
    return {
      directory: dirPath, facets: [],
      avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      quartzMasterpieceCount: 0, voidCount: 0,
      geodeType: 'no-geode', condition: 'void',
    }
  }

  const avgClarity = Math.round(facets.reduce((s, f) => s + f.crystallineClarity, 0) / facets.length)
  const avgPrecision = Math.round(facets.reduce((s, f) => s + f.facetPrecision, 0) / facets.length)
  const avgWisdom = Math.round(facets.reduce((s, f) => s + f.mineralWisdom, 0) / facets.length)
  const quartzMasterpieceCount = facets.filter((f) => f.condition === 'quartz-masterpiece').length
  const voidCount = facets.filter((f) => f.condition === 'void').length
  const geodeType = classifyGeodeType(facets)
  const avgQuality = Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length)
  const condition = classifyGeodeCondition(avgQuality)

  return {
    directory: dirPath, facets,
    avgClarity, avgPrecision, avgWisdom,
    quartzMasterpieceCount, voidCount,
    geodeType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildQuartzPrismResult(['a.ts'], [content]) */
export async function buildQuartzPrismResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<QuartzPrismResult> {
  const facets: QuartzFacet[] = files.map((file, i) =>
    analyzeQuartzFacet(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, QuartzFacet[]>()
  for (const facet of facets) {
    const dir = facet.file.includes('/')
      ? facet.file.substring(0, facet.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(facet)
    } else {
      dirMap.set(dir, [facet])
    }
  }

  const geodes: QuartzGeode[] = Array.from(dirMap.entries()).map(([dir, dirFacets]) =>
    analyzeQuartzGeode(dirFacets, dir),
  )

  const avgCrystallineClarity = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.crystallineClarity, 0) / facets.length) : 0
  const avgSpectrumRefraction = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.spectrumRefraction, 0) / facets.length) : 0
  const avgFacetPrecision = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.facetPrecision, 0) / facets.length) : 0
  const avgVibrationPurity = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.vibrationPurity, 0) / facets.length) : 0
  const avgMineralWisdom = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.mineralWisdom, 0) / facets.length) : 0

  const overallBrilliance = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length) : 0
  const isQuartz = overallBrilliance >= 60

  const spectrum: QuartzPrismResult['spectrum'] = {
    avgClarity: avgCrystallineClarity, avgPrecision: avgFacetPrecision, avgWisdom: avgMineralWisdom,
    isQuartz, overallBrilliance,
  }

  const quartzMasterpieceCount = facets.filter((f) => f.condition === 'quartz-masterpiece').length
  const gemQualityCount = facets.filter((f) => f.condition === 'gem-quality').length
  const properCrystalCount = facets.filter((f) => f.condition === 'proper-crystal').length
  const industrialGradeCount = facets.filter((f) => f.condition === 'industrial-grade').length
  const rawSandCount = facets.filter((f) => f.condition === 'raw-sand').length
  const voidCount = facets.filter((f) => f.condition === 'void').length

  const hasHighClarityCount = facets.filter((f) => f.structuring.hasHighClarity).length
  const hasHighRefractionCount = facets.filter((f) => f.refracting.hasHighRefraction).length
  const hasHighPrecisionCount = facets.filter((f) => f.polishing.hasHighPrecision).length
  const hasHighPurityCount = facets.filter((f) => f.resonating.hasHighPurity).length
  const hasHighWisdomCount = facets.filter((f) => f.accumulating.hasHighWisdom).length

  const lapidaryGrade = classifyLapidaryGrade(overallBrilliance)

  const bestFacet = facets.length > 0
    ? facets.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file : ''
  const clearest = facets.length > 0
    ? facets.reduce((best, f) => (f.crystallineClarity > best.crystallineClarity ? f : best)).file : ''
  const mostRefractive = facets.length > 0
    ? facets.reduce((best, f) => (f.spectrumRefraction > best.spectrumRefraction ? f : best)).file : ''
  const mostPrecise = facets.length > 0
    ? facets.reduce((best, f) => (f.facetPrecision > best.facetPrecision ? f : best)).file : ''
  const purest = facets.length > 0
    ? facets.reduce((best, f) => (f.vibrationPurity > best.vibrationPurity ? f : best)).file : ''
  const wisest = facets.length > 0
    ? facets.reduce((best, f) => (f.mineralWisdom > best.mineralWisdom ? f : best)).file : ''

  const stats: QuartzPrismResult['stats'] = {
    totalFiles: files.length, totalGeodes: geodes.length,
    avgCrystallineClarity, avgSpectrumRefraction, avgFacetPrecision, avgVibrationPurity, avgMineralWisdom,
    quartzMasterpieceCount, gemQualityCount, properCrystalCount, industrialGradeCount, rawSandCount, voidCount,
    hasHighClarityCount, hasHighRefractionCount, hasHighPrecisionCount, hasHighPurityCount, hasHighWisdomCount,
    overallBrilliance, lapidaryGrade,
    bestFacet, clearest, mostRefractive, mostPrecise, purest, wisest,
  }

  const recommendations = generateRecommendations(facets, geodes, spectrum, stats)

  return {
    facets, geodes, spectrum, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(facets, geodes, spectrum, stats) */
export function generateRecommendations(
  facets: QuartzFacet[],
  geodes: QuartzGeode[],
  _spectrum: QuartzPrismResult['spectrum'],
  stats: QuartzPrismResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrystallineClarity >= 90 &&
    stats.avgSpectrumRefraction >= 90 &&
    stats.avgFacetPrecision >= 90 &&
    stats.avgVibrationPurity >= 90 &&
    stats.avgMineralWisdom >= 90
  ) {
    recs.push(
      'Your quartz prism refracts pure perfection! Crystalline clarity is herkimer-grade, spectrum refraction reveals every color, facet precision is triple-excellent, vibration purity resonates at perfect frequency, and mineral wisdom spans geological ages!',
    )
    return recs
  }

  if (stats.avgCrystallineClarity < 60) {
    recs.push(
      'Grow crystalline clarity — the prism must be transparent to refract light; your code needs better structure, cleaner naming, and more organized patterns'
    )
  }

  if (stats.avgSpectrumRefraction < 60) {
    recs.push(
      'Expand spectrum refraction — a prism reveals all colors hidden in white light; your code needs comprehensive exports, full documentation, and diverse patterns'
    )
  }

  if (stats.avgFacetPrecision < 60) {
    recs.push(
      'Polish facet precision — each face of the prism must be perfectly flat; your code needs stricter types, exact definitions, and cleaner interfaces'
    )
  }

  if (stats.avgVibrationPurity < 60) {
    recs.push(
      'Clean vibration purity — quartz resonates at a pure frequency; your code needs fewer hacks, no workarounds, and pristine implementation'
    )
  }

  if (stats.avgMineralWisdom < 60) {
    recs.push(
      'Deepen mineral wisdom — quartz forms over geological time with patience; your code needs principled architecture, proven patterns, and enduring design'
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The prism is opaque — raw sand and industrial-grade stones outnumber the crystals, and light cannot pass through'
    )
  }

  const voidFacets = facets.filter((f) => f.condition === 'void')
  if (voidFacets.length > 0 && voidFacets.length <= 5) {
    recs.push(`Polish these raw stones: ${voidFacets.map((f) => f.file).join(', ')}`)
  } else if (voidFacets.length > 5) {
    recs.push(`Polish ${voidFacets.length} raw stones before the prism shatters completely`)
  }

  const poorGeodes = geodes.filter((g) => g.condition === 'void' || g.condition === 'sand-dune')
  if (poorGeodes.length === geodes.length && geodes.length > 0) {
    recs.push('All geodes are sand dunes — the quartz prism needs treasure-geode quality facets throughout')
  }

  if (recs.length === 0) {
    recs.push('Your quartz prism refracts with brilliance — every facet embodies clarity, refraction, precision, purity, and mineral wisdom')
  }

  return recs
}
