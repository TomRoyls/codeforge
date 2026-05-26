// ─── Interfaces ──────────────────────────────────────────

export interface ThrivingMeasure {
  vitality: number
  growth: 'ancient-rainforest' | 'mature-forest' | 'proper-woodland' | 'young-sapling' | 'barren-ground' | 'no-vitality'
  hasHighVitality: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasGrowing: boolean
  hasThriving: boolean
  hasFlourishing: boolean
  hasVibrant: boolean
  hasOrganic: boolean
  hasNatural: boolean
  hasBlooming: boolean
  hasProductive: boolean
  deadCount: number
  stagnantCount: number
}

export interface FilteringMeasure {
  clarity: number
  light: 'crystal-canopy' | 'dappled-light' | 'proper-filter' | 'dense-shade' | 'total-darkness' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasEfficient: boolean
  hasOptimized: boolean
  hasClean: boolean
  hasDirect: boolean
  hasUncluttered: boolean
  hasFocused: boolean
  hasPurposeful: boolean
  hasStreamlined: boolean
  crypticCount: number
  mysteryCount: number
}

export interface ReachingMeasure {
  precision: number
  depth: 'taproot-deep' | 'extensive-network' | 'proper-root' | 'shallow-root' | 'floating-seed' | 'no-precision'
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
  hasDeep: boolean
  hasThorough: boolean
  hasComprehensive: boolean
  hasExhaustive: boolean
  hasComplete: boolean
  hasFarReaching: boolean
  unsafeCount: number
  approximateCount: number
}

export interface FlexingMeasure {
  resilience: number
  wood: 'ancient-oak' | 'flexible-willow' | 'proper-branch' | 'brittle-twig' | 'dead-branch' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasFlexible: boolean
  hasAdaptable: boolean
  hasStrong: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasResilient: boolean
  hasTough: boolean
  hasHardy: boolean
  hasBendable: boolean
  hasSupple: boolean
  hasElastic: boolean
  unhandledCount: number
  untestedCount: number
}

export interface NetworkingMeasure {
  wisdom: number
  web: 'mycelium-master' | 'forest-network' | 'proper-ecosystem' | 'isolated-tree' | 'dead-stump' | 'no-wisdom'
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
  hasInterdependent: boolean
  hasSymbiotic: boolean
  hasInterwoven: boolean
  hackedCount: number
  shallowCount: number
}

export type CanopyCondition =
  | 'canopy-masterpiece'
  | 'emerald-crown'
  | 'proper-canopy'
  | 'thin-foliage'
  | 'bare-branches'
  | 'void'

export interface CanopyLeaf {
  file: string
  forestVitality: number
  leafClarity: number
  rootPrecision: number
  branchResilience: number
  ecosystemWisdom: number
  thriving: ThrivingMeasure
  filtering: FilteringMeasure
  reaching: ReachingMeasure
  flexing: FlexingMeasure
  networking: NetworkingMeasure
  condition: CanopyCondition
  qualityScore: number
}

export type LayerType =
  | 'primary-canopy'
  | 'secondary-growth'
  | 'proper-understory'
  | 'shrub-layer'
  | 'forest-floor'
  | 'no-layer'

export type LayerCondition =
  | 'emerald-forest'
  | 'green-canopy'
  | 'proper-woodland'
  | 'thin-grove'
  | 'empty-clearing'
  | 'void'

export type RangerGrade = 'forest-elder' | 'master-ranger' | 'proper-forester' | 'apprentice' | 'novice' | 'city-dweller'

export interface CanopyLayer {
  directory: string
  leaves: CanopyLeaf[]
  avgVitality: number
  avgPrecision: number
  avgWisdom: number
  canopyMasterpieceCount: number
  voidCount: number
  layerType: LayerType
  condition: LayerCondition
}

export interface EmeraldCanopyResult {
  leaves: CanopyLeaf[]
  layers: CanopyLayer[]
  forest: {
    avgVitality: number
    avgPrecision: number
    avgWisdom: number
    isEmerald: boolean
    overallHealth: number
  }
  stats: {
    totalFiles: number
    totalLayers: number
    avgForestVitality: number
    avgLeafClarity: number
    avgRootPrecision: number
    avgBranchResilience: number
    avgEcosystemWisdom: number
    canopyMasterpieceCount: number
    emeraldCrownCount: number
    properCanopyCount: number
    thinFoliageCount: number
    bareBranchesCount: number
    voidCount: number
    hasHighVitalityCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallHealth: number
    rangerGrade: RangerGrade
    bestLeaf: string
    mostVital: string
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

/** @example classifyCanopyCondition(90) */
export function classifyCanopyCondition(score: number): CanopyCondition {
  if (score >= 90) return 'canopy-masterpiece'
  if (score >= 75) return 'emerald-crown'
  if (score >= 60) return 'proper-canopy'
  if (score >= 40) return 'thin-foliage'
  if (score >= 20) return 'bare-branches'
  return 'void'
}

/** @example classifyLayerType(leaves) */
export function classifyLayerType(leaves: CanopyLeaf[]): LayerType {
  if (leaves.length === 0) return 'no-layer'
  const avg = leaves.reduce((s, l) => s + l.qualityScore, 0) / leaves.length
  if (avg >= 85) return 'primary-canopy'
  if (avg >= 70) return 'secondary-growth'
  if (avg >= 55) return 'proper-understory'
  if (avg >= 35) return 'shrub-layer'
  return 'forest-floor'
}

/** @example classifyLayerCondition(85) */
export function classifyLayerCondition(score: number): LayerCondition {
  if (score >= 85) return 'emerald-forest'
  if (score >= 70) return 'green-canopy'
  if (score >= 55) return 'proper-woodland'
  if (score >= 35) return 'thin-grove'
  if (score >= 15) return 'empty-clearing'
  return 'void'
}

/** @example classifyRangerGrade(80) */
export function classifyRangerGrade(avgHealth: number): RangerGrade {
  if (avgHealth >= 80) return 'forest-elder'
  if (avgHealth >= 65) return 'master-ranger'
  if (avgHealth >= 50) return 'proper-forester'
  if (avgHealth >= 35) return 'apprentice'
  if (avgHealth >= 20) return 'novice'
  return 'city-dweller'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureThriving('export class X { readonly y: string }') */
export function measureThriving(content: string): ThrivingMeasure {
  const hasAlive = /\b(class|interface|type)\b/.test(content)
  const deadCount = (content.match(/\b(dead|deprecated|obsolete|legacy|rotten)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = (content.match(/\b(static|rigid|inflexible)\b/gi) ?? []).length === 0
  const hasEvolving = /\b(import|export)\b/.test(content)
  const hasNoStagnant = (content.match(/\b(stagnant|stale|frozen)\b/gi) ?? []).length
  const stagnantCount = hasNoStagnant
  const hasGrowing = /\b(function|=>|return)\b/.test(content)
  const hasThriving = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasFlourishing = /\b(readonly|private|protected)\b/.test(content)
  const hasVibrant = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOrganic = !/\bany\b/.test(content)
  const hasNatural = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasBlooming = /\b(try|catch|if)\b/.test(content)
  const hasProductive = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasAlive, hasNoDead, hasDynamic, hasNoStatic, hasEvolving,
    stagnantCount === 0, hasGrowing, hasThriving, hasFlourishing,
    hasVibrant, hasOrganic, hasNatural, hasBlooming, hasProductive,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let growth: ThrivingMeasure['growth'] = 'no-vitality'
  if (vitality >= 90) growth = 'ancient-rainforest'
  else if (vitality >= 75) growth = 'mature-forest'
  else if (vitality >= 60) growth = 'proper-woodland'
  else if (vitality >= 40) growth = 'young-sapling'
  else if (vitality >= 20) growth = 'barren-ground'

  return {
    vitality, growth, hasHighVitality,
    hasAlive, hasNoDead, hasDynamic, hasNoStatic, hasEvolving,
    hasNoStagnant: stagnantCount === 0, hasGrowing, hasThriving, hasFlourishing,
    hasVibrant, hasOrganic, hasNatural, hasBlooming, hasProductive,
    deadCount, stagnantCount,
  }
}

/** @example measureFiltering('export class X { readonly y: string }') */
export function measureFiltering(content: string): FilteringMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const hasOptimized = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDirect = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUncluttered = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFocused = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPurposeful = /\b(function|=>|return)\b/.test(content)
  const hasStreamlined = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasEfficient, hasOptimized, hasClean,
    hasDirect, hasUncluttered, hasFocused, hasPurposeful, hasStreamlined,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let light: FilteringMeasure['light'] = 'no-clarity'
  if (clarity >= 90) light = 'crystal-canopy'
  else if (clarity >= 75) light = 'dappled-light'
  else if (clarity >= 60) light = 'proper-filter'
  else if (clarity >= 40) light = 'dense-shade'
  else if (clarity >= 20) light = 'total-darkness'

  return {
    clarity, light, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasEfficient, hasOptimized, hasClean,
    hasDirect, hasUncluttered, hasFocused, hasPurposeful, hasStreamlined,
    crypticCount, mysteryCount,
  }
}

/** @example measureReaching('export class X { readonly y: string }') */
export function measureReaching(content: string): ReachingMeasure {
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
  const hasDeep = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasThorough = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasComprehensive = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasExhaustive = /\b(async|await|Promise)\b/.test(content)
  const hasComplete = /\b(function|=>|return)\b/.test(content)
  const hasFarReaching = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasDeep,
    hasThorough, hasComprehensive, hasExhaustive, hasComplete, hasFarReaching,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let depth: ReachingMeasure['depth'] = 'no-precision'
  if (precision >= 90) depth = 'taproot-deep'
  else if (precision >= 75) depth = 'extensive-network'
  else if (precision >= 60) depth = 'proper-root'
  else if (precision >= 40) depth = 'shallow-root'
  else if (precision >= 20) depth = 'floating-seed'

  return {
    precision, depth, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasDeep,
    hasThorough, hasComprehensive, hasExhaustive, hasComplete, hasFarReaching,
    unsafeCount, approximateCount,
  }
}

/** @example measureFlexing('export class X { readonly y: string }') */
export function measureFlexing(content: string): FlexingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasFlexible = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasAdaptable = /\b(class|interface|type)\b/.test(content)
  const hasStrong = /\b(import|export)\b/.test(content)
  const hasDurable = !/\bany\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasResilient = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTough = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHardy = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasBendable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSupple = /\b(async|await|Promise)\b/.test(content)
  const hasElastic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasFlexible,
    hasAdaptable, hasStrong, hasDurable, hasEnduring, hasResilient,
    hasTough, hasHardy, hasBendable, hasSupple, hasElastic,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let wood: FlexingMeasure['wood'] = 'no-resilience'
  if (resilience >= 90) wood = 'ancient-oak'
  else if (resilience >= 75) wood = 'flexible-willow'
  else if (resilience >= 60) wood = 'proper-branch'
  else if (resilience >= 40) wood = 'brittle-twig'
  else if (resilience >= 20) wood = 'dead-branch'

  return {
    resilience, wood, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasFlexible,
    hasAdaptable, hasStrong, hasDurable, hasEnduring, hasResilient,
    hasTough, hasHardy, hasBendable, hasSupple, hasElastic,
    unhandledCount, untestedCount,
  }
}

/** @example measureNetworking('export class X { readonly y: string }') */
export function measureNetworking(content: string): NetworkingMeasure {
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
  const hasInterdependent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSymbiotic = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasInterwoven = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasInterdependent, hasSymbiotic, hasInterwoven,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let web: NetworkingMeasure['web'] = 'no-wisdom'
  if (wisdom >= 90) web = 'mycelium-master'
  else if (wisdom >= 75) web = 'forest-network'
  else if (wisdom >= 60) web = 'proper-ecosystem'
  else if (wisdom >= 40) web = 'isolated-tree'
  else if (wisdom >= 20) web = 'dead-stump'

  return {
    wisdom, web, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasInterdependent, hasSymbiotic, hasInterwoven,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCanopyLeaf(content, 'app.ts') */
export function analyzeCanopyLeaf(content: string, filePath: string): CanopyLeaf {
  const thriving = measureThriving(content)
  const filtering = measureFiltering(content)
  const reaching = measureReaching(content)
  const flexing = measureFlexing(content)
  const networking = measureNetworking(content)

  const forestVitality = thriving.vitality
  const leafClarity = filtering.clarity
  const rootPrecision = reaching.precision
  const branchResilience = flexing.resilience
  const ecosystemWisdom = networking.wisdom

  const qualityScore = Math.round(
    forestVitality * 0.2 +
    leafClarity * 0.2 +
    rootPrecision * 0.2 +
    branchResilience * 0.2 +
    ecosystemWisdom * 0.2,
  )

  const condition = classifyCanopyCondition(qualityScore)

  return {
    file: filePath,
    forestVitality, leafClarity, rootPrecision, branchResilience, ecosystemWisdom,
    thriving, filtering, reaching, flexing, networking,
    condition, qualityScore,
  }
}

/** @example analyzeCanopyLayer(leaves, 'src') */
export function analyzeCanopyLayer(leaves: CanopyLeaf[], dirPath: string): CanopyLayer {
  if (leaves.length === 0) {
    return {
      directory: dirPath, leaves: [],
      avgVitality: 0, avgPrecision: 0, avgWisdom: 0,
      canopyMasterpieceCount: 0, voidCount: 0,
      layerType: 'no-layer', condition: 'void',
    }
  }

  const avgVitality = Math.round(leaves.reduce((s, l) => s + l.forestVitality, 0) / leaves.length)
  const avgPrecision = Math.round(leaves.reduce((s, l) => s + l.rootPrecision, 0) / leaves.length)
  const avgWisdom = Math.round(leaves.reduce((s, l) => s + l.ecosystemWisdom, 0) / leaves.length)
  const canopyMasterpieceCount = leaves.filter((l) => l.condition === 'canopy-masterpiece').length
  const voidCount = leaves.filter((l) => l.condition === 'void').length
  const layerType = classifyLayerType(leaves)
  const avgQuality = Math.round(leaves.reduce((s, l) => s + l.qualityScore, 0) / leaves.length)
  const condition = classifyLayerCondition(avgQuality)

  return {
    directory: dirPath, leaves,
    avgVitality, avgPrecision, avgWisdom,
    canopyMasterpieceCount, voidCount,
    layerType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldCanopyResult(['a.ts'], [content]) */
export async function buildEmeraldCanopyResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldCanopyResult> {
  const leaves: CanopyLeaf[] = files.map((file, i) =>
    analyzeCanopyLeaf(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CanopyLeaf[]>()
  for (const leaf of leaves) {
    const dir = leaf.file.includes('/')
      ? leaf.file.substring(0, leaf.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(leaf)
    } else {
      dirMap.set(dir, [leaf])
    }
  }

  const layers: CanopyLayer[] = Array.from(dirMap.entries()).map(([dir, dirLeaves]) =>
    analyzeCanopyLayer(dirLeaves, dir),
  )

  const avgForestVitality = leaves.length > 0
    ? Math.round(leaves.reduce((s, l) => s + l.forestVitality, 0) / leaves.length) : 0
  const avgLeafClarity = leaves.length > 0
    ? Math.round(leaves.reduce((s, l) => s + l.leafClarity, 0) / leaves.length) : 0
  const avgRootPrecision = leaves.length > 0
    ? Math.round(leaves.reduce((s, l) => s + l.rootPrecision, 0) / leaves.length) : 0
  const avgBranchResilience = leaves.length > 0
    ? Math.round(leaves.reduce((s, l) => s + l.branchResilience, 0) / leaves.length) : 0
  const avgEcosystemWisdom = leaves.length > 0
    ? Math.round(leaves.reduce((s, l) => s + l.ecosystemWisdom, 0) / leaves.length) : 0

  const overallHealth = leaves.length > 0
    ? Math.round(leaves.reduce((s, l) => s + l.qualityScore, 0) / leaves.length) : 0
  const isEmerald = overallHealth >= 60

  const forest: EmeraldCanopyResult['forest'] = {
    avgVitality: avgForestVitality, avgPrecision: avgRootPrecision, avgWisdom: avgEcosystemWisdom,
    isEmerald, overallHealth,
  }

  const canopyMasterpieceCount = leaves.filter((l) => l.condition === 'canopy-masterpiece').length
  const emeraldCrownCount = leaves.filter((l) => l.condition === 'emerald-crown').length
  const properCanopyCount = leaves.filter((l) => l.condition === 'proper-canopy').length
  const thinFoliageCount = leaves.filter((l) => l.condition === 'thin-foliage').length
  const bareBranchesCount = leaves.filter((l) => l.condition === 'bare-branches').length
  const voidCount = leaves.filter((l) => l.condition === 'void').length

  const hasHighVitalityCount = leaves.filter((l) => l.thriving.hasHighVitality).length
  const hasHighClarityCount = leaves.filter((l) => l.filtering.hasHighClarity).length
  const hasHighPrecisionCount = leaves.filter((l) => l.reaching.hasHighPrecision).length
  const hasHighResilienceCount = leaves.filter((l) => l.flexing.hasHighResilience).length
  const hasHighWisdomCount = leaves.filter((l) => l.networking.hasHighWisdom).length

  const rangerGrade = classifyRangerGrade(overallHealth)

  const bestLeaf = leaves.length > 0
    ? leaves.reduce((best, l) => (l.qualityScore > best.qualityScore ? l : best)).file : ''
  const mostVital = leaves.length > 0
    ? leaves.reduce((best, l) => (l.forestVitality > best.forestVitality ? l : best)).file : ''
  const clearest = leaves.length > 0
    ? leaves.reduce((best, l) => (l.leafClarity > best.leafClarity ? l : best)).file : ''
  const mostPrecise = leaves.length > 0
    ? leaves.reduce((best, l) => (l.rootPrecision > best.rootPrecision ? l : best)).file : ''
  const mostResilient = leaves.length > 0
    ? leaves.reduce((best, l) => (l.branchResilience > best.branchResilience ? l : best)).file : ''
  const wisest = leaves.length > 0
    ? leaves.reduce((best, l) => (l.ecosystemWisdom > best.ecosystemWisdom ? l : best)).file : ''

  const stats: EmeraldCanopyResult['stats'] = {
    totalFiles: files.length, totalLayers: layers.length,
    avgForestVitality, avgLeafClarity, avgRootPrecision, avgBranchResilience, avgEcosystemWisdom,
    canopyMasterpieceCount, emeraldCrownCount, properCanopyCount, thinFoliageCount, bareBranchesCount, voidCount,
    hasHighVitalityCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallHealth, rangerGrade,
    bestLeaf, mostVital, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(leaves, layers, forest, stats)

  return {
    leaves, layers, forest, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(leaves, layers, forest, stats) */
export function generateRecommendations(
  leaves: CanopyLeaf[],
  layers: CanopyLayer[],
  forest: EmeraldCanopyResult['forest'],
  stats: EmeraldCanopyResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgForestVitality >= 90 &&
    stats.avgLeafClarity >= 90 &&
    stats.avgRootPrecision >= 90 &&
    stats.avgBranchResilience >= 90 &&
    stats.avgEcosystemWisdom >= 90
  ) {
    recs.push(
      'Your emerald canopy is a canopy masterpiece! Forest vitality is ancient-rainforest, leaf clarity is crystal-canopy, root precision is taproot-deep, branch resilience is ancient-oak, and ecosystem wisdom is mycelium-master!',
    )
    return recs
  }

  if (stats.avgForestVitality < 60) {
    recs.push(
      'Restore forest vitality — the canopy must pulse with life; eliminate dead code, embrace organic patterns, and achieve ancient-rainforest vitality',
    )
  }

  if (stats.avgLeafClarity < 60) {
    recs.push(
      'Improve leaf clarity — each leaf must filter light perfectly; eliminate cryptic patterns, improve readability, and achieve crystal-canopy clarity',
    )
  }

  if (stats.avgRootPrecision < 60) {
    recs.push(
      'Deepen root precision — roots must reach deep and exact; tighten types, eliminate unsafe patterns, and achieve taproot-deep precision',
    )
  }

  if (stats.avgBranchResilience < 60) {
    recs.push(
      'Strengthen branch resilience — branches must bend without breaking; add error handling, test thoroughly, and achieve ancient-oak resilience',
    )
  }

  if (stats.avgEcosystemWisdom < 60) {
    recs.push(
      'Cultivate ecosystem wisdom — the forest must understand its interconnectedness; build with principled architecture, proven patterns, and mycelium-master wisdom',
    )
  }

  if (stats.overallHealth < 40) {
    recs.push(
      'The canopy has thinned beyond recognition — bare branches outnumber the emerald crowns, and the forest floor is exposed',
    )
  }

  const voidLeaves = leaves.filter((l) => l.condition === 'void')
  if (voidLeaves.length > 0 && voidLeaves.length <= 5) {
    recs.push(`Prune these bare branches from the canopy: ${voidLeaves.map((l) => l.file).join(', ')}`)
  } else if (voidLeaves.length > 5) {
    recs.push(`Prune ${voidLeaves.length} bare branches from the canopy before the rot spreads`)
  }

  const poorLayers = layers.filter((ly) => ly.condition === 'void' || ly.condition === 'empty-clearing')
  if (poorLayers.length === layers.length && layers.length > 0) {
    recs.push('All layers are empty clearings — the emerald canopy needs emerald-forest quality leaves throughout')
  }

  if (recs.length === 0) {
    recs.push('Your emerald canopy thrives with rainforest brilliance — every leaf carries forest vitality, leaf clarity, root precision, branch resilience, and ecosystem wisdom')
  }

  return recs
}
