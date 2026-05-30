// ─── Interfaces ──────────────────────────────────────────

export interface DiversifyingMeasure {
  diversity: number
  spectrum: 'watermelon-tourmaline' | 'bi-color-crystal' | 'proper-variety' | 'single-hue' | 'monochrome' | 'no-diversity'
  hasHighDiversity: boolean
  hasVersatile: boolean
  hasNoRigid: boolean
  hasMultiPurpose: boolean
  hasNoSingleUse: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasModular: boolean
  hasDiverse: boolean
  hasRich: boolean
  hasVaried: boolean
  hasColorful: boolean
  hasMultiFaceted: boolean
  hasDynamic: boolean
  hasLayered: boolean
  rigidCount: number
  singleUseCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  gem: 'paraiba-clarity' | 'rubellite-clear' | 'proper-transparent' | 'cloudy-crystal' | 'opaque-stone' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasObvious: boolean
  hasRevealed: boolean
  hasEvident: boolean
  hasManifest: boolean
  crypticCount: number
  mysteryCount: number
}

export interface RefractingMeasure {
  precision: number
  cut: 'faceted-perfect' | 'proper-cut' | 'good-proportions' | 'rough-polish' | 'uncut-crystal' | 'no-precision'
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
  hasCalibrated: boolean
  hasMeasured: boolean
  hasCalculated: boolean
  hasGeometric: boolean
  unsafeCount: number
  approximateCount: number
}

export interface ChargingMeasure {
  resilience: number
  charge: 'high-voltage' | 'strong-current' | 'proper-charge' | 'weak-signal' | 'no-output' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasResponsive: boolean
  hasReactive: boolean
  hasDynamic: boolean
  hasAdaptive: boolean
  hasStrong: boolean
  hasPowerful: boolean
  hasEnergetic: boolean
  hasResilient: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  insight: 'spectrum-master' | 'color-sage' | 'proper-mineralogist' | 'rock-collector' | 'pebble-finder' | 'no-wisdom'
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
  hasBroad: boolean
  hasWise: boolean
  hasPerceptive: boolean
  hackedCount: number
  shallowCount: number
}

export type TourmalineCondition =
  | 'tourmaline-masterpiece'
  | 'paraiba-gem'
  | 'proper-tourmaline'
  | 'common-stone'
  | 'rough-crystal'
  | 'void'

export interface TourmalineShard {
  file: string
  rainbowDiversity: number
  crystalClarity: number
  prismPrecision: number
  piezoelectricResilience: number
  mineralWisdom: number
  diversifying: DiversifyingMeasure
  clarifying: ClarifyingMeasure
  refracting: RefractingMeasure
  charging: ChargingMeasure
  understanding: UnderstandingMeasure
  condition: TourmalineCondition
  qualityScore: number
}

export type ClusterType =
  | 'rainbow-cluster'
  | 'colorful-deposit'
  | 'proper-pocket'
  | 'single-crystal'
  | 'empty-cavity'
  | 'no-cluster'

export type ClusterCondition =
  | 'tourmaline-palace'
  | 'gem-cave'
  | 'proper-display'
  | 'stone-shelf'
  | 'empty-case'
  | 'void'

export type GemologistGrade = 'spectrum-master' | 'color-expert' | 'proper-gemologist' | 'apprentice' | 'novice' | 'color-blind'

export interface TourmalineCluster {
  directory: string
  shards: TourmalineShard[]
  avgDiversity: number
  avgPrecision: number
  avgWisdom: number
  tourmalineMasterpieceCount: number
  voidCount: number
  clusterType: ClusterType
  condition: ClusterCondition
}

export interface TourmalineSpectrumResult {
  shards: TourmalineShard[]
  clusters: TourmalineCluster[]
  rainbow: {
    avgDiversity: number
    avgPrecision: number
    avgWisdom: number
    isTourmaline: boolean
    overallSpectrum: number
  }
  stats: {
    totalFiles: number
    totalClusters: number
    avgRainbowDiversity: number
    avgCrystalClarity: number
    avgPrismPrecision: number
    avgPiezoelectricResilience: number
    avgMineralWisdom: number
    tourmalineMasterpieceCount: number
    paraibaGemCount: number
    properTourmalineCount: number
    commonStoneCount: number
    roughCrystalCount: number
    voidCount: number
    hasHighDiversityCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallSpectrum: number
    gemologistGrade: GemologistGrade
    bestShard: string
    mostDiverse: string
    clearest: string
    mostPrecise: string
    mostResilient: string
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

/** @example classifyTourmalineCondition(90) */
export function classifyTourmalineCondition(score: number): TourmalineCondition {
  if (score >= 90) return 'tourmaline-masterpiece'
  if (score >= 75) return 'paraiba-gem'
  if (score >= 60) return 'proper-tourmaline'
  if (score >= 40) return 'common-stone'
  if (score >= 20) return 'rough-crystal'
  return 'void'
}

/** @example classifyClusterType(shards) */
export function classifyClusterType(shards: TourmalineShard[]): ClusterType {
  if (shards.length === 0) return 'no-cluster'
  const avg = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  if (avg >= 85) return 'rainbow-cluster'
  if (avg >= 70) return 'colorful-deposit'
  if (avg >= 55) return 'proper-pocket'
  if (avg >= 35) return 'single-crystal'
  return 'empty-cavity'
}

/** @example classifyClusterCondition(85) */
export function classifyClusterCondition(score: number): ClusterCondition {
  if (score >= 85) return 'tourmaline-palace'
  if (score >= 70) return 'gem-cave'
  if (score >= 55) return 'proper-display'
  if (score >= 35) return 'stone-shelf'
  if (score >= 15) return 'empty-case'
  return 'void'
}

/** @example classifyGemologistGrade(80) */
export function classifyGemologistGrade(avgSpectrum: number): GemologistGrade {
  if (avgSpectrum >= 80) return 'spectrum-master'
  if (avgSpectrum >= 65) return 'color-expert'
  if (avgSpectrum >= 50) return 'proper-gemologist'
  if (avgSpectrum >= 35) return 'apprentice'
  if (avgSpectrum >= 20) return 'novice'
  return 'color-blind'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDiversifying('export class X { readonly y: string }') */
export function measureDiversifying(content: string): DiversifyingMeasure {
  const hasVersatile = /\b(class|interface|type)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|brittle|fragile)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasMultiPurpose = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const singleUseCount = (content.match(/\b(single.use|disposable|one.time)\b/gi) ?? []).length
  const hasNoSingleUse = singleUseCount === 0
  const hasAdaptable = /\b(import|export)\b/.test(content)
  const hasFlexible = !/\bany\b/.test(content)
  const hasModular = /\b(readonly|private|protected)\b/.test(content)
  const hasDiverse = /\b(async|await|Promise)\b/.test(content)
  const hasRich = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVaried = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasColorful = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasMultiFaceted = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasDynamic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasLayered = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasVersatile, hasNoRigid, hasMultiPurpose, hasNoSingleUse, hasAdaptable,
    hasFlexible, hasModular, hasDiverse, hasRich, hasVaried,
    hasColorful, hasMultiFaceted, hasDynamic, hasLayered,
  ]

  const diversity = computeScore(positiveBooleans)
  const hasHighDiversity = diversity >= 60

  let spectrum: DiversifyingMeasure['spectrum'] = 'no-diversity'
  if (diversity >= 90) spectrum = 'watermelon-tourmaline'
  else if (diversity >= 75) spectrum = 'bi-color-crystal'
  else if (diversity >= 60) spectrum = 'proper-variety'
  else if (diversity >= 40) spectrum = 'single-hue'
  else if (diversity >= 20) spectrum = 'monochrome'

  return {
    diversity, spectrum, hasHighDiversity,
    hasVersatile, hasNoRigid, hasMultiPurpose, hasNoSingleUse, hasAdaptable,
    hasFlexible, hasModular, hasDiverse, hasRich, hasVaried,
    hasColorful, hasMultiFaceted, hasDynamic, hasLayered,
    rigidCount, singleUseCount,
  }
}

/** @example measureClarifying('export class X { readonly y: string }') */
export function measureClarifying(content: string): ClarifyingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\b(async|await|Promise)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasObvious = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevealed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEvident = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasManifest = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let gem: ClarifyingMeasure['gem'] = 'no-clarity'
  if (clarity >= 90) gem = 'paraiba-clarity'
  else if (clarity >= 75) gem = 'rubellite-clear'
  else if (clarity >= 60) gem = 'proper-transparent'
  else if (clarity >= 40) gem = 'cloudy-crystal'
  else if (clarity >= 20) gem = 'opaque-stone'

  return {
    clarity, gem, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
    crypticCount, mysteryCount,
  }
}

/** @example measureRefracting('export class X { readonly y: string }') */
export function measureRefracting(content: string): RefractingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|imprecise|loose|sloppy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCalibrated = /\b(async|await|Promise)\b/.test(content)
  const hasMeasured = /\b(try|catch|if)\b/.test(content)
  const hasCalculated = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasGeometric = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalibrated, hasMeasured, hasCalculated, hasGeometric,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: RefractingMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'faceted-perfect'
  else if (precision >= 75) cut = 'proper-cut'
  else if (precision >= 60) cut = 'good-proportions'
  else if (precision >= 40) cut = 'rough-polish'
  else if (precision >= 20) cut = 'uncut-crystal'

  return {
    precision, cut, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasCalibrated, hasMeasured, hasCalculated, hasGeometric,
    unsafeCount, approximateCount,
  }
}

/** @example measureCharging('export class X { readonly y: string }') */
export function measureCharging(content: string): ChargingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasResponsive = /\b(import|export)\b/.test(content)
  const hasReactive = !/\bany\b/.test(content)
  const hasDynamic = /\b(readonly|private|protected)\b/.test(content)
  const hasAdaptive = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrong = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPowerful = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEnergetic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasResilient = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasResponsive, hasReactive, hasDynamic, hasAdaptive,
    hasStrong, hasPowerful, hasEnergetic, hasResilient,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let charge: ChargingMeasure['charge'] = 'no-resilience'
  if (resilience >= 90) charge = 'high-voltage'
  else if (resilience >= 75) charge = 'strong-current'
  else if (resilience >= 60) charge = 'proper-charge'
  else if (resilience >= 40) charge = 'weak-signal'
  else if (resilience >= 20) charge = 'no-output'

  return {
    resilience, charge, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasResponsive, hasReactive, hasDynamic, hasAdaptive,
    hasStrong, hasPowerful, hasEnergetic, hasResilient,
    unhandledCount, untestedCount,
  }
}

/** @example measureUnderstanding('export class X { readonly y: string }') */
export function measureUnderstanding(content: string): UnderstandingMeasure {
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
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasBroad = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPerceptive = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasBroad, hasWise, hasPerceptive,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let insight: UnderstandingMeasure['insight'] = 'no-wisdom'
  if (wisdom >= 90) insight = 'spectrum-master'
  else if (wisdom >= 75) insight = 'color-sage'
  else if (wisdom >= 60) insight = 'proper-mineralogist'
  else if (wisdom >= 40) insight = 'rock-collector'
  else if (wisdom >= 20) insight = 'pebble-finder'

  return {
    wisdom, insight, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasBroad, hasWise, hasPerceptive,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeTourmalineShard(content, 'app.ts') */
export function analyzeTourmalineShard(content: string, filePath: string): TourmalineShard {
  const diversifying = measureDiversifying(content)
  const clarifying = measureClarifying(content)
  const refracting = measureRefracting(content)
  const charging = measureCharging(content)
  const understanding = measureUnderstanding(content)

  const rainbowDiversity = diversifying.diversity
  const crystalClarity = clarifying.clarity
  const prismPrecision = refracting.precision
  const piezoelectricResilience = charging.resilience
  const mineralWisdom = understanding.wisdom

  const qualityScore = Math.round(
    rainbowDiversity * 0.2 +
    crystalClarity * 0.2 +
    prismPrecision * 0.2 +
    piezoelectricResilience * 0.2 +
    mineralWisdom * 0.2,
  )

  const condition = classifyTourmalineCondition(qualityScore)

  return {
    file: filePath,
    rainbowDiversity, crystalClarity, prismPrecision, piezoelectricResilience, mineralWisdom,
    diversifying, clarifying, refracting, charging, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeTourmalineCluster(shards, 'src') */
export function analyzeTourmalineCluster(shards: TourmalineShard[], dirPath: string): TourmalineCluster {
  if (shards.length === 0) {
    return {
      directory: dirPath, shards: [],
      avgDiversity: 0, avgPrecision: 0, avgWisdom: 0,
      tourmalineMasterpieceCount: 0, voidCount: 0,
      clusterType: 'no-cluster', condition: 'void',
    }
  }

  const avgDiversity = Math.round(shards.reduce((s, sh) => s + sh.rainbowDiversity, 0) / shards.length)
  const avgPrecision = Math.round(shards.reduce((s, sh) => s + sh.prismPrecision, 0) / shards.length)
  const avgWisdom = Math.round(shards.reduce((s, sh) => s + sh.mineralWisdom, 0) / shards.length)
  const tourmalineMasterpieceCount = shards.filter((sh) => sh.condition === 'tourmaline-masterpiece').length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length
  const clusterType = classifyClusterType(shards)
  const avgQuality = Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
  const condition = classifyClusterCondition(avgQuality)

  return {
    directory: dirPath, shards,
    avgDiversity, avgPrecision, avgWisdom,
    tourmalineMasterpieceCount, voidCount,
    clusterType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildTourmalineSpectrumResult(['a.ts'], [content]) */
export async function buildTourmalineSpectrumResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TourmalineSpectrumResult> {
  const shards: TourmalineShard[] = files.map((file, i) =>
    analyzeTourmalineShard(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TourmalineShard[]>()
  for (const shard of shards) {
    const dir = shard.file.includes('/')
      ? shard.file.substring(0, shard.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(shard)
    } else {
      dirMap.set(dir, [shard])
    }
  }

  const clusters: TourmalineCluster[] = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeTourmalineCluster(dirShards, dir),
  )

  const avgRainbowDiversity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.rainbowDiversity, 0) / shards.length) : 0
  const avgCrystalClarity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.crystalClarity, 0) / shards.length) : 0
  const avgPrismPrecision = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.prismPrecision, 0) / shards.length) : 0
  const avgPiezoelectricResilience = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.piezoelectricResilience, 0) / shards.length) : 0
  const avgMineralWisdom = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.mineralWisdom, 0) / shards.length) : 0

  const overallSpectrum = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length) : 0
  const isTourmaline = overallSpectrum >= 60

  const rainbow: TourmalineSpectrumResult['rainbow'] = {
    avgDiversity: avgRainbowDiversity, avgPrecision: avgPrismPrecision, avgWisdom: avgMineralWisdom,
    isTourmaline, overallSpectrum,
  }

  const tourmalineMasterpieceCount = shards.filter((sh) => sh.condition === 'tourmaline-masterpiece').length
  const paraibaGemCount = shards.filter((sh) => sh.condition === 'paraiba-gem').length
  const properTourmalineCount = shards.filter((sh) => sh.condition === 'proper-tourmaline').length
  const commonStoneCount = shards.filter((sh) => sh.condition === 'common-stone').length
  const roughCrystalCount = shards.filter((sh) => sh.condition === 'rough-crystal').length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length

  const hasHighDiversityCount = shards.filter((sh) => sh.diversifying.hasHighDiversity).length
  const hasHighClarityCount = shards.filter((sh) => sh.clarifying.hasHighClarity).length
  const hasHighPrecisionCount = shards.filter((sh) => sh.refracting.hasHighPrecision).length
  const hasHighResilienceCount = shards.filter((sh) => sh.charging.hasHighResilience).length
  const hasHighWisdomCount = shards.filter((sh) => sh.understanding.hasHighWisdom).length

  const gemologistGrade = classifyGemologistGrade(overallSpectrum)

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => (sh.qualityScore > best.qualityScore ? sh : best)).file : ''
  const mostDiverse = shards.length > 0
    ? shards.reduce((best, sh) => (sh.rainbowDiversity > best.rainbowDiversity ? sh : best)).file : ''
  const clearest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.crystalClarity > best.crystalClarity ? sh : best)).file : ''
  const mostPrecise = shards.length > 0
    ? shards.reduce((best, sh) => (sh.prismPrecision > best.prismPrecision ? sh : best)).file : ''
  const mostResilient = shards.length > 0
    ? shards.reduce((best, sh) => (sh.piezoelectricResilience > best.piezoelectricResilience ? sh : best)).file : ''
  const wisest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.mineralWisdom > best.mineralWisdom ? sh : best)).file : ''

  const stats: TourmalineSpectrumResult['stats'] = {
    totalFiles: files.length, totalClusters: clusters.length,
    avgRainbowDiversity, avgCrystalClarity, avgPrismPrecision, avgPiezoelectricResilience, avgMineralWisdom,
    tourmalineMasterpieceCount, paraibaGemCount, properTourmalineCount, commonStoneCount, roughCrystalCount, voidCount,
    hasHighDiversityCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallSpectrum, gemologistGrade,
    bestShard, mostDiverse, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(shards, clusters, rainbow, stats)

  return {
    shards, clusters, rainbow, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(shards, clusters, rainbow, stats) */
export function generateRecommendations(
  shards: TourmalineShard[],
  clusters: TourmalineCluster[],
  _rainbow: TourmalineSpectrumResult['rainbow'],
  stats: TourmalineSpectrumResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgRainbowDiversity >= 90 &&
    stats.avgCrystalClarity >= 90 &&
    stats.avgPrismPrecision >= 90 &&
    stats.avgPiezoelectricResilience >= 90 &&
    stats.avgMineralWisdom >= 90
  ) {
    recs.push(
      'Your tourmaline spectrum is a tourmaline masterpiece! Rainbow diversity is watermelon-tourmaline, crystal clarity is paraiba-clarity, prism precision is faceted-perfect, piezoelectric resilience is high-voltage, and mineral wisdom is spectrum-master!',
    )
    return recs
  }

  if (stats.avgRainbowDiversity < 60) {
    recs.push(
      'Expand rainbow diversity — the tourmaline must show watermelon-tourmaline coloring; increase versatility, reduce rigidity, and achieve watermelon-tourmaline diversity',
    )
  }

  if (stats.avgCrystalClarity < 60) {
    recs.push(
      'Polish crystal clarity — the tourmaline must gleam with paraiba-clarity; improve readability, eliminate cryptic patterns, and achieve paraiba-clarity transparency',
    )
  }

  if (stats.avgPrismPrecision < 60) {
    recs.push(
      'Sharpen prism precision — each facet must be faceted-perfect; tighten types, eliminate unsafe patterns, and achieve faceted-perfect precision',
    )
  }

  if (stats.avgPiezoelectricResilience < 60) {
    recs.push(
      'Charge piezoelectric resilience — the tourmaline must generate high-voltage strength; add error handling, test thoroughly, and achieve high-voltage resilience',
    )
  }

  if (stats.avgMineralWisdom < 60) {
    recs.push(
      'Deepen mineral wisdom — the crystal must carry spectrum-master knowledge; build with principled architecture and achieve spectrum-master wisdom',
    )
  }

  if (stats.overallSpectrum < 40) {
    recs.push(
      'The spectrum has faded — rough crystals and common stones outnumber the tourmaline masterpieces, and the rainbow lies in ruins',
    )
  }

  const voidShards = shards.filter((sh) => sh.condition === 'void')
  if (voidShards.length > 0 && voidShards.length <= 5) {
    recs.push(`Remove these rough crystals from the spectrum: ${voidShards.map((sh) => sh.file).join(', ')}`)
  } else if (voidShards.length > 5) {
    recs.push(`Remove ${voidShards.length} rough crystals from the spectrum before they crack the foundation`)
  }

  const poorClusters = clusters.filter((c) => c.condition === 'void' || c.condition === 'empty-case')
  if (poorClusters.length === clusters.length && clusters.length > 0) {
    recs.push('All clusters are empty cases — the tourmaline spectrum needs tourmaline-palace quality shards throughout')
  }

  if (recs.length === 0) {
    recs.push('Your tourmaline spectrum radiates rainbow brilliance — every shard carries rainbow diversity, crystal clarity, prism precision, piezoelectric resilience, and mineral wisdom')
  }

  return recs
}
