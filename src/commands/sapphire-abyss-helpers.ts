// ─── Interfaces ──────────────────────────────────────────

export interface DescendingMeasure {
  depth: number
  zone: 'hadal-trench' | 'abyssal-plain' | 'bathyal-slope' | 'mesopelagic' | 'sunlit-surface' | 'no-depth'
  hasHighDepth: boolean
  hasDeepLogic: boolean
  hasNoShallow: boolean
  hasProfound: boolean
  hasNoTrivial: boolean
  hasComplex: boolean
  hasNoSimplistic: boolean
  hasLayered: boolean
  hasMultiDimensional: boolean
  hasRich: boolean
  hasSubstantive: boolean
  hasComprehensive: boolean
  hasThorough: boolean
  hasNuanced: boolean
  hasInDepth: boolean
  hasExhaustive: boolean
  hasBottomless: boolean
  shallowCount: number
  trivialCount: number
}

export interface CalmingMeasure {
  serenity: number
  tide: 'glassy-surface' | 'calm-sea' | 'proper-swell' | 'choppy-water' | 'violent-storm' | 'no-serenity'
  hasHighSerenity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasCalm: boolean
  hasPeaceful: boolean
  hasComposed: boolean
  hasTranquil: boolean
  hasSerene: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasCentered: boolean
  hasUnruffled: boolean
  crypticCount: number
  chaoticCount: number
}

export interface WithstandingMeasure {
  resilience: number
  hull: 'titanium-sphere' | 'steel-hull' | 'proper-submarine' | 'wooden-boat' | 'paper-cup' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasHardened: boolean
  hasStable: boolean
  hasDurable: boolean
  hasStrong: boolean
  hasTough: boolean
  hasIndestructible: boolean
  hasUnbreachable: boolean
  hasImpervious: boolean
  hasUnyielding: boolean
  unhandledCount: number
  untestedCount: number
}

export interface FlowingMeasure {
  precision: number
  current: 'perfect-tide' | 'steady-current' | 'proper-flow' | 'erratic-eddy' | 'random-whirlpool' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasRhythmic: boolean
  hasConsistent: boolean
  hasReliable: boolean
  hasPredictable: boolean
  hasClean: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasCalculated: boolean
  unsafeCount: number
  approximateCount: number
}

export interface FathomingMeasure {
  wisdom: number
  chart: 'master-navigator' | 'deep-sea-pilot' | 'proper-diver' | 'surface-swimmer' | 'landlubber' | 'no-wisdom'
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
  hasProfound: boolean
  hasWise: boolean
  hasFathomless: boolean
  hackedCount: number
  shallowCount: number
}

export type DiveCondition =
  | 'sapphire-masterpiece'
  | 'deep-gem'
  | 'proper-sapphire'
  | 'surface-glass'
  | 'pool-water'
  | 'void'

export interface SapphireDive {
  file: string
  oceanDepth: number
  gemSerenity: number
  pressureResilience: number
  tidalPrecision: number
  depthWisdom: number
  descending: DescendingMeasure
  calming: CalmingMeasure
  withstanding: WithstandingMeasure
  flowing: FlowingMeasure
  fathoming: FathomingMeasure
  condition: DiveCondition
  qualityScore: number
}

export type TrenchType =
  | 'mariana-depth'
  | 'deep-trench'
  | 'proper-canyon'
  | 'shallow-reef'
  | 'tidal-pool'
  | 'no-trench'

export type TrenchCondition =
  | 'sapphire-palace'
  | 'deep-vault'
  | 'proper-depth'
  | 'surface-chamber'
  | 'empty-pool'
  | 'void'

export interface SapphireTrench {
  directory: string
  dives: SapphireDive[]
  avgDepth: number
  avgResilience: number
  avgWisdom: number
  sapphireMasterpieceCount: number
  voidCount: number
  trenchType: TrenchType
  condition: TrenchCondition
}

export type DiverGrade = 'bathyscaphe-captain' | 'deep-sea-diver' | 'proper-submariner' | 'surface-swimmer' | 'novice' | 'landlubber'

export interface SapphireAbyssResult {
  dives: SapphireDive[]
  trenches: SapphireTrench[]
  ocean: {
    avgDepth: number
    avgResilience: number
    avgWisdom: number
    isSapphire: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalTrenches: number
    avgOceanDepth: number
    avgGemSerenity: number
    avgPressureResilience: number
    avgTidalPrecision: number
    avgDepthWisdom: number
    sapphireMasterpieceCount: number
    deepGemCount: number
    properSapphireCount: number
    surfaceGlassCount: number
    poolWaterCount: number
    voidCount: number
    hasHighDepthCount: number
    hasHighSerenityCount: number
    hasHighResilienceCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallDepth: number
    diverGrade: DiverGrade
    bestDive: string
    deepest: string
    mostSerene: string
    mostResilient: string
    mostPrecise: string
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

/** @example classifyDiveCondition(90) */
export function classifyDiveCondition(score: number): DiveCondition {
  if (score >= 90) return 'sapphire-masterpiece'
  if (score >= 75) return 'deep-gem'
  if (score >= 60) return 'proper-sapphire'
  if (score >= 40) return 'surface-glass'
  if (score >= 20) return 'pool-water'
  return 'void'
}

/** @example classifyTrenchType(dives) */
export function classifyTrenchType(dives: SapphireDive[]): TrenchType {
  if (dives.length === 0) return 'no-trench'
  const avg = dives.reduce((s, d) => s + d.qualityScore, 0) / dives.length
  if (avg >= 85) return 'mariana-depth'
  if (avg >= 70) return 'deep-trench'
  if (avg >= 55) return 'proper-canyon'
  if (avg >= 35) return 'shallow-reef'
  return 'tidal-pool'
}

/** @example classifyTrenchCondition(85) */
export function classifyTrenchCondition(score: number): TrenchCondition {
  if (score >= 85) return 'sapphire-palace'
  if (score >= 70) return 'deep-vault'
  if (score >= 55) return 'proper-depth'
  if (score >= 35) return 'surface-chamber'
  if (score >= 15) return 'empty-pool'
  return 'void'
}

/** @example classifyDiverGrade(80) */
export function classifyDiverGrade(avgDepth: number): DiverGrade {
  if (avgDepth >= 80) return 'bathyscaphe-captain'
  if (avgDepth >= 65) return 'deep-sea-diver'
  if (avgDepth >= 50) return 'proper-submariner'
  if (avgDepth >= 35) return 'surface-swimmer'
  if (avgDepth >= 20) return 'novice'
  return 'landlubber'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDescending('export class X { readonly y: string }') */
export function measureDescending(content: string): DescendingMeasure {
  const hasDeepLogic = /\b(class|interface|type)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial|simple)\b/gi) ?? []).length
  const hasNoShallow = shallowCount === 0
  const hasProfound = /\b(import|export)\b/.test(content)
  const trivialCount = (content.match(/\b(trivial|petty|minor|negligible)\b/gi) ?? []).length
  const hasNoTrivial = trivialCount === 0
  const hasComplex = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoSimplistic = (content.match(/\b(simplistic|basic|elementary)\b/gi) ?? []).length === 0
  const hasLayered = /\b(readonly|private|protected)\b/.test(content)
  const hasMultiDimensional = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRich = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSubstantive = /\b(function|=>|return)\b/.test(content)
  const hasComprehensive = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasThorough = !/\bany\b/.test(content)
  const hasNuanced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasInDepth = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasExhaustive = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasBottomless = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasDeepLogic, hasNoShallow, hasProfound, hasNoTrivial, hasComplex,
    hasNoSimplistic, hasLayered, hasMultiDimensional, hasRich, hasSubstantive,
    hasComprehensive, hasThorough, hasNuanced, hasInDepth, hasExhaustive,
    hasBottomless,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let zone: DescendingMeasure['zone'] = 'no-depth'
  if (depth >= 90) zone = 'hadal-trench'
  else if (depth >= 75) zone = 'abyssal-plain'
  else if (depth >= 60) zone = 'bathyal-slope'
  else if (depth >= 40) zone = 'mesopelagic'
  else if (depth >= 20) zone = 'sunlit-surface'

  return {
    depth, zone, hasHighDepth,
    hasDeepLogic, hasNoShallow, hasProfound, hasNoTrivial, hasComplex,
    hasNoSimplistic, hasLayered, hasMultiDimensional, hasRich, hasSubstantive,
    hasComprehensive, hasThorough, hasNuanced, hasInDepth, hasExhaustive,
    hasBottomless,
    shallowCount, trivialCount,
  }
}

/** @example measureCalming('export class X { readonly y: string }') */
export function measureCalming(content: string): CalmingMeasure {
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = !/\bany\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|tangled|spaghetti)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasCalm = /\b(class|interface|type)\b/.test(content)
  const hasPeaceful = /\b(readonly|private|protected)\b/.test(content)
  const hasComposed = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTranquil = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSerene = /\b(function|=>|return)\b/.test(content)
  const hasHarmonious = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasBalanced = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasCentered = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnruffled = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasSerene, hasHarmonious, hasBalanced, hasCentered, hasUnruffled,
  ]

  const serenity = computeScore(positiveBooleans)
  const hasHighSerenity = serenity >= 60

  let tide: CalmingMeasure['tide'] = 'no-serenity'
  if (serenity >= 90) tide = 'glassy-surface'
  else if (serenity >= 75) tide = 'calm-sea'
  else if (serenity >= 60) tide = 'proper-swell'
  else if (serenity >= 40) tide = 'choppy-water'
  else if (serenity >= 20) tide = 'violent-storm'

  return {
    serenity, tide, hasHighSerenity,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasSerene, hasHarmonious, hasBalanced, hasCentered, hasUnruffled,
    crypticCount, chaoticCount,
  }
}

/** @example measureWithstanding('export class X { readonly y: string }') */
export function measureWithstanding(content: string): WithstandingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|risky|dangerous|fragile)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(if|return)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = !/\bany\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasHardened = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStable = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /\b(import|export)\b/.test(content)
  const hasStrong = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTough = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasIndestructible = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnbreachable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasImpervious = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasUnyielding = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasHardened, hasStable, hasDurable, hasStrong,
    hasTough, hasIndestructible, hasUnbreachable, hasImpervious, hasUnyielding,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let hull: WithstandingMeasure['hull'] = 'no-resilience'
  if (resilience >= 90) hull = 'titanium-sphere'
  else if (resilience >= 75) hull = 'steel-hull'
  else if (resilience >= 60) hull = 'proper-submarine'
  else if (resilience >= 40) hull = 'wooden-boat'
  else if (resilience >= 20) hull = 'paper-cup'

  return {
    resilience, hull, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasHardened, hasStable, hasDurable, hasStrong,
    hasTough, hasIndestructible, hasUnbreachable, hasImpervious, hasUnyielding,
    unhandledCount, untestedCount,
  }
}

/** @example measureFlowing('export class X { readonly y: string }') */
export function measureFlowing(content: string): FlowingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasRhythmic = /\b(import|export)\b/.test(content)
  const hasConsistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReliable = /\b(function|=>|return)\b/.test(content)
  const hasPredictable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSharp = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCrisp = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasDefined = /\b(try|catch|if)\b/.test(content)
  const hasCalculated = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasRhythmic, hasConsistent, hasReliable, hasPredictable,
    hasClean, hasSharp, hasCrisp, hasDefined, hasCalculated,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let current: FlowingMeasure['current'] = 'no-precision'
  if (precision >= 90) current = 'perfect-tide'
  else if (precision >= 75) current = 'steady-current'
  else if (precision >= 60) current = 'proper-flow'
  else if (precision >= 40) current = 'erratic-eddy'
  else if (precision >= 20) current = 'random-whirlpool'

  return {
    precision, current, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasRhythmic, hasConsistent, hasReliable, hasPredictable,
    hasClean, hasSharp, hasCrisp, hasDefined, hasCalculated,
    unsafeCount, approximateCount,
  }
}

/** @example measureFathoming('export class X { readonly y: string }') */
export function measureFathoming(content: string): FathomingMeasure {
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
  const hasProfound = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasFathomless = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProfound, hasWise, hasFathomless,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let chart: FathomingMeasure['chart'] = 'no-wisdom'
  if (wisdom >= 90) chart = 'master-navigator'
  else if (wisdom >= 75) chart = 'deep-sea-pilot'
  else if (wisdom >= 60) chart = 'proper-diver'
  else if (wisdom >= 40) chart = 'surface-swimmer'
  else if (wisdom >= 20) chart = 'landlubber'

  return {
    wisdom, chart, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProfound, hasWise, hasFathomless,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeSapphireDive(content, 'app.ts') */
export function analyzeSapphireDive(content: string, filePath: string): SapphireDive {
  const descending = measureDescending(content)
  const calming = measureCalming(content)
  const withstanding = measureWithstanding(content)
  const flowing = measureFlowing(content)
  const fathoming = measureFathoming(content)

  const oceanDepth = descending.depth
  const gemSerenity = calming.serenity
  const pressureResilience = withstanding.resilience
  const tidalPrecision = flowing.precision
  const depthWisdom = fathoming.wisdom

  const qualityScore = Math.round(
    oceanDepth * 0.2 +
    gemSerenity * 0.2 +
    pressureResilience * 0.2 +
    tidalPrecision * 0.2 +
    depthWisdom * 0.2,
  )

  const condition = classifyDiveCondition(qualityScore)

  return {
    file: filePath,
    oceanDepth, gemSerenity, pressureResilience, tidalPrecision, depthWisdom,
    descending, calming, withstanding, flowing, fathoming,
    condition, qualityScore,
  }
}

/** @example analyzeSapphireTrench(dives, 'src') */
export function analyzeSapphireTrench(dives: SapphireDive[], dirPath: string): SapphireTrench {
  if (dives.length === 0) {
    return {
      directory: dirPath, dives: [],
      avgDepth: 0, avgResilience: 0, avgWisdom: 0,
      sapphireMasterpieceCount: 0, voidCount: 0,
      trenchType: 'no-trench', condition: 'void',
    }
  }

  const avgDepth = Math.round(dives.reduce((s, d) => s + d.oceanDepth, 0) / dives.length)
  const avgResilience = Math.round(dives.reduce((s, d) => s + d.pressureResilience, 0) / dives.length)
  const avgWisdom = Math.round(dives.reduce((s, d) => s + d.depthWisdom, 0) / dives.length)
  const sapphireMasterpieceCount = dives.filter((d) => d.condition === 'sapphire-masterpiece').length
  const voidCount = dives.filter((d) => d.condition === 'void').length
  const trenchType = classifyTrenchType(dives)
  const avgQuality = Math.round(dives.reduce((s, d) => s + d.qualityScore, 0) / dives.length)
  const condition = classifyTrenchCondition(avgQuality)

  return {
    directory: dirPath, dives,
    avgDepth, avgResilience, avgWisdom,
    sapphireMasterpieceCount, voidCount,
    trenchType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSapphireAbyssResult(['a.ts'], [content]) */
export async function buildSapphireAbyssResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireAbyssResult> {
  const dives: SapphireDive[] = files.map((file, i) =>
    analyzeSapphireDive(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SapphireDive[]>()
  for (const dive of dives) {
    const dir = dive.file.includes('/')
      ? dive.file.substring(0, dive.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(dive)
    } else {
      dirMap.set(dir, [dive])
    }
  }

  const trenches: SapphireTrench[] = Array.from(dirMap.entries()).map(([dir, dirDives]) =>
    analyzeSapphireTrench(dirDives, dir),
  )

  const avgOceanDepth = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.oceanDepth, 0) / dives.length) : 0
  const avgGemSerenity = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.gemSerenity, 0) / dives.length) : 0
  const avgPressureResilience = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.pressureResilience, 0) / dives.length) : 0
  const avgTidalPrecision = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.tidalPrecision, 0) / dives.length) : 0
  const avgDepthWisdom = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.depthWisdom, 0) / dives.length) : 0

  const overallDepth = dives.length > 0
    ? Math.round(dives.reduce((s, d) => s + d.qualityScore, 0) / dives.length) : 0
  const isSapphire = overallDepth >= 60

  const ocean: SapphireAbyssResult['ocean'] = {
    avgDepth: avgOceanDepth, avgResilience: avgPressureResilience, avgWisdom: avgDepthWisdom,
    isSapphire, overallDepth,
  }

  const sapphireMasterpieceCount = dives.filter((d) => d.condition === 'sapphire-masterpiece').length
  const deepGemCount = dives.filter((d) => d.condition === 'deep-gem').length
  const properSapphireCount = dives.filter((d) => d.condition === 'proper-sapphire').length
  const surfaceGlassCount = dives.filter((d) => d.condition === 'surface-glass').length
  const poolWaterCount = dives.filter((d) => d.condition === 'pool-water').length
  const voidCount = dives.filter((d) => d.condition === 'void').length

  const hasHighDepthCount = dives.filter((d) => d.descending.hasHighDepth).length
  const hasHighSerenityCount = dives.filter((d) => d.calming.hasHighSerenity).length
  const hasHighResilienceCount = dives.filter((d) => d.withstanding.hasHighResilience).length
  const hasHighPrecisionCount = dives.filter((d) => d.flowing.hasHighPrecision).length
  const hasHighWisdomCount = dives.filter((d) => d.fathoming.hasHighWisdom).length

  const diverGrade = classifyDiverGrade(overallDepth)

  const bestDive = dives.length > 0
    ? dives.reduce((best, d) => (d.qualityScore > best.qualityScore ? d : best)).file : ''
  const deepest = dives.length > 0
    ? dives.reduce((best, d) => (d.oceanDepth > best.oceanDepth ? d : best)).file : ''
  const mostSerene = dives.length > 0
    ? dives.reduce((best, d) => (d.gemSerenity > best.gemSerenity ? d : best)).file : ''
  const mostResilient = dives.length > 0
    ? dives.reduce((best, d) => (d.pressureResilience > best.pressureResilience ? d : best)).file : ''
  const mostPrecise = dives.length > 0
    ? dives.reduce((best, d) => (d.tidalPrecision > best.tidalPrecision ? d : best)).file : ''
  const wisest = dives.length > 0
    ? dives.reduce((best, d) => (d.depthWisdom > best.depthWisdom ? d : best)).file : ''

  const stats: SapphireAbyssResult['stats'] = {
    totalFiles: files.length, totalTrenches: trenches.length,
    avgOceanDepth, avgGemSerenity, avgPressureResilience, avgTidalPrecision, avgDepthWisdom,
    sapphireMasterpieceCount, deepGemCount, properSapphireCount, surfaceGlassCount, poolWaterCount, voidCount,
    hasHighDepthCount, hasHighSerenityCount, hasHighResilienceCount, hasHighPrecisionCount, hasHighWisdomCount,
    overallDepth, diverGrade,
    bestDive, deepest, mostSerene, mostResilient, mostPrecise, wisest,
  }

  const recommendations = generateRecommendations(dives, trenches, ocean, stats)

  return {
    dives, trenches, ocean, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(dives, trenches, ocean, stats) */
export function generateRecommendations(
  dives: SapphireDive[],
  trenches: SapphireTrench[],
  _ocean: SapphireAbyssResult['ocean'],
  stats: SapphireAbyssResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgOceanDepth >= 90 &&
    stats.avgGemSerenity >= 90 &&
    stats.avgPressureResilience >= 90 &&
    stats.avgTidalPrecision >= 90 &&
    stats.avgDepthWisdom >= 90
  ) {
    recs.push(
      'Your sapphire abyss gleams with perfection! Ocean depth reaches the hadal trench, gem serenity is glassy-calm, pressure resilience is titanium-grade, tidal precision flows with perfect rhythm, and depth wisdom charts the deepest fathoms!',
    )
    return recs
  }

  if (stats.avgOceanDepth < 60) {
    recs.push(
      'Descend deeper — the abyss demands profound, multi-layered code; add complex types, rich patterns, and substantive logic to reach ocean depth'
    )
  }

  if (stats.avgGemSerenity < 60) {
    recs.push(
      'Find gem serenity — calm the waters with readable naming, clear structure, and organized patterns that bring peace under pressure'
    )
  }

  if (stats.avgPressureResilience < 60) {
    recs.push(
      'Strengthen pressure resilience — only titanium spheres survive the abyss; add error handling, defensive checks, and robust architecture'
    )
  }

  if (stats.avgTidalPrecision < 60) {
    recs.push(
      'Refine tidal precision — the ocean demands exact, rhythmic flow; tighten types, eliminate unsafe patterns, and sharpen definitions'
    )
  }

  if (stats.avgDepthWisdom < 60) {
    recs.push(
      'Fathom depth wisdom — the abyss holds ancient knowledge; build with principled architecture, proven patterns, and strategic design'
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The abyss is empty — pool-water and surface-glass outnumber the sapphires, and the ocean floor holds no gems'
    )
  }

  const voidDives = dives.filter((d) => d.condition === 'void')
  if (voidDives.length > 0 && voidDives.length <= 5) {
    recs.push(`Dive deeper into these shallow waters: ${voidDives.map((d) => d.file).join(', ')}`)
  } else if (voidDives.length > 5) {
    recs.push(`Dive deeper into ${voidDives.length} shallow waters before the abyss consumes them entirely`)
  }

  const poorTrenches = trenches.filter((t) => t.condition === 'void' || t.condition === 'empty-pool')
  if (poorTrenches.length === trenches.length && trenches.length > 0) {
    recs.push('All trenches are empty pools — the sapphire abyss needs mariana-depth quality dives throughout')
  }

  if (recs.length === 0) {
    recs.push('Your sapphire abyss shimmers with depth — every dive embodies ocean depth, gem serenity, pressure resilience, tidal precision, and depth wisdom')
  }

  return recs
}
