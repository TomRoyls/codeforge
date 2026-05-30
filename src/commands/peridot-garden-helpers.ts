// ─── Interfaces ──────────────────────────────────────────

export interface GrowingMeasure {
  vitality: number
  bloom: 'full-bloom' | 'healthy-growth' | 'proper-sprout' | 'wilting-leaf' | 'barren-branch' | 'no-vitality'
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
  hasEnergetic: boolean
  hasActive: boolean
  hasBlooming: boolean
  hasSurging: boolean
  deadCount: number
  stagnantCount: number
}

export interface TendingMeasure {
  serenity: number
  garden: 'zen-garden' | 'well-tended' | 'proper-plot' | 'overgrown-weeds' | 'barren-ground' | 'no-serenity'
  hasHighSerenity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasClean: boolean
  hasTidy: boolean
  hasNeat: boolean
  hasOrderly: boolean
  hasHarmonious: boolean
  hasPeaceful: boolean
  hasCalm: boolean
  hasSerene: boolean
  hasTranquil: boolean
  crypticCount: number
  chaoticCount: number
}

export interface PruningMeasure {
  precision: number
  trim: 'bonsai-master' | 'expert-pruner' | 'proper-shears' | 'hedge-clippers' | 'chainsaw' | 'no-precision'
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
  hasDeliberate: boolean
  hasIntentional: boolean
  hasPurposeful: boolean
  hasMeasured: boolean
  unsafeCount: number
  approximateCount: number
}

export interface RootingMeasure {
  resilience: number
  root: 'ancient-oak' | 'deep-rooted' | 'proper-taproot' | 'shallow-root' | 'floating-seed' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasHardened: boolean
  hasEstablished: boolean
  hasGrounded: boolean
  hasAnchored: boolean
  hasSecure: boolean
  hasFirm: boolean
  hasSolid: boolean
  unhandledCount: number
  untestedCount: number
}

export interface ReapingMeasure {
  wisdom: number
  yield: 'abundant-harvest' | 'fruitful-tree' | 'proper-crop' | 'meager-pickings' | 'barren-field' | 'no-wisdom'
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
  hasFruitful: boolean
  hasWise: boolean
  hasProductive: boolean
  hackedCount: number
  shallowCount: number
}

export type PeridotCondition =
  | 'peridot-masterpiece'
  | 'golden-bloom'
  | 'proper-peridot'
  | 'pale-stone'
  | 'raw-mineral'
  | 'void'

export interface PeridotBloom {
  file: string
  oliveVitality: number
  gardenSerenity: number
  growthPrecision: number
  rootResilience: number
  harvestWisdom: number
  growing: GrowingMeasure
  tending: TendingMeasure
  pruning: PruningMeasure
  rooting: RootingMeasure
  reaping: ReapingMeasure
  condition: PeridotCondition
  qualityScore: number
}

export type OrchardType =
  | 'lush-garden'
  | 'green-oasis'
  | 'proper-plot'
  | 'small-bed'
  | 'empty-pot'
  | 'no-orchard'

export type OrchardCondition =
  | 'peridot-palace'
  | 'green-gazebo'
  | 'proper-greenhouse'
  | 'dusty-plot'
  | 'empty-field'
  | 'void'

export interface PeridotOrchard {
  directory: string
  blooms: PeridotBloom[]
  avgVitality: number
  avgPrecision: number
  avgWisdom: number
  peridotMasterpieceCount: number
  voidCount: number
  orchardType: OrchardType
  condition: OrchardCondition
}

export type GardenerGrade = 'master-gardener' | 'expert-horticulturist' | 'proper-gardener' | 'apprentice' | 'novice' | 'weed-puller'

export interface PeridotGardenResult {
  blooms: PeridotBloom[]
  orchards: PeridotOrchard[]
  harvest: {
    avgVitality: number
    avgPrecision: number
    avgWisdom: number
    isPeridot: boolean
    overallFertility: number
  }
  stats: {
    totalFiles: number
    totalOrchards: number
    avgOliveVitality: number
    avgGardenSerenity: number
    avgGrowthPrecision: number
    avgRootResilience: number
    avgHarvestWisdom: number
    peridotMasterpieceCount: number
    goldenBloomCount: number
    properPeridotCount: number
    paleStoneCount: number
    rawMineralCount: number
    voidCount: number
    hasHighVitalityCount: number
    hasHighSerenityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallFertility: number
    gardenerGrade: GardenerGrade
    bestBloom: string
    mostVital: string
    mostSerene: string
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

/** @example classifyPeridotCondition(90) */
export function classifyPeridotCondition(score: number): PeridotCondition {
  if (score >= 90) return 'peridot-masterpiece'
  if (score >= 75) return 'golden-bloom'
  if (score >= 60) return 'proper-peridot'
  if (score >= 40) return 'pale-stone'
  if (score >= 20) return 'raw-mineral'
  return 'void'
}

/** @example classifyOrchardType(blooms) */
export function classifyOrchardType(blooms: PeridotBloom[]): OrchardType {
  if (blooms.length === 0) return 'no-orchard'
  const avg = blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length
  if (avg >= 85) return 'lush-garden'
  if (avg >= 70) return 'green-oasis'
  if (avg >= 55) return 'proper-plot'
  if (avg >= 35) return 'small-bed'
  return 'empty-pot'
}

/** @example classifyOrchardCondition(85) */
export function classifyOrchardCondition(score: number): OrchardCondition {
  if (score >= 85) return 'peridot-palace'
  if (score >= 70) return 'green-gazebo'
  if (score >= 55) return 'proper-greenhouse'
  if (score >= 35) return 'dusty-plot'
  if (score >= 15) return 'empty-field'
  return 'void'
}

/** @example classifyGardenerGrade(80) */
export function classifyGardenerGrade(avgFertility: number): GardenerGrade {
  if (avgFertility >= 80) return 'master-gardener'
  if (avgFertility >= 65) return 'expert-horticulturist'
  if (avgFertility >= 50) return 'proper-gardener'
  if (avgFertility >= 35) return 'apprentice'
  if (avgFertility >= 20) return 'novice'
  return 'weed-puller'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureGrowing('export class X { readonly y: string }') */
export function measureGrowing(content: string): GrowingMeasure {
  const hasAlive = /\b(class|interface|type)\b/.test(content)
  const deadCount = (content.match(/\b(dead|lifeless|inert|dormant)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasDynamic = /\b(import|export)\b/.test(content)
  const hasNoStatic = (content.match(/\b(static-only|rigid|frozen|fixed)\b/gi) ?? []).length === 0
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|stale|decayed|rotted)\b/gi) ?? []).length
  const hasNoStagnant = stagnantCount === 0
  const hasGrowing = /\b(function|=>|return)\b/.test(content)
  const hasThriving = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasFlourishing = /\b(readonly|private|protected)\b/.test(content)
  const hasVibrant = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnergetic = !/\bany\b/.test(content)
  const hasActive = /\b(if|return)\b/.test(content)
  const hasBlooming = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSurging = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasAlive, hasNoDead, hasDynamic, hasNoStatic, hasEvolving,
    hasNoStagnant, hasGrowing, hasThriving, hasFlourishing, hasVibrant,
    hasEnergetic, hasActive, hasBlooming, hasSurging,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let bloom: GrowingMeasure['bloom'] = 'no-vitality'
  if (vitality >= 90) bloom = 'full-bloom'
  else if (vitality >= 75) bloom = 'healthy-growth'
  else if (vitality >= 60) bloom = 'proper-sprout'
  else if (vitality >= 40) bloom = 'wilting-leaf'
  else if (vitality >= 20) bloom = 'barren-branch'

  return {
    vitality, bloom, hasHighVitality,
    hasAlive, hasNoDead, hasDynamic, hasNoStatic, hasEvolving,
    hasNoStagnant, hasGrowing, hasThriving, hasFlourishing, hasVibrant,
    hasEnergetic, hasActive, hasBlooming, hasSurging,
    deadCount, stagnantCount,
  }
}

/** @example measureTending('export class X { readonly y: string }') */
export function measureTending(content: string): TendingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disordered|jumbled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasClean = !/\bany\b/.test(content)
  const hasTidy = /\b(readonly|private|protected)\b/.test(content)
  const hasNeat = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOrderly = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHarmonious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPeaceful = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCalm = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSerene = /\b(if|return)\b/.test(content)
  const hasTranquil = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasClean, hasTidy, hasNeat, hasOrderly,
    hasHarmonious, hasPeaceful, hasCalm, hasSerene, hasTranquil,
  ]

  const serenity = computeScore(positiveBooleans)
  const hasHighSerenity = serenity >= 60

  let garden: TendingMeasure['garden'] = 'no-serenity'
  if (serenity >= 90) garden = 'zen-garden'
  else if (serenity >= 75) garden = 'well-tended'
  else if (serenity >= 60) garden = 'proper-plot'
  else if (serenity >= 40) garden = 'overgrown-weeds'
  else if (serenity >= 20) garden = 'barren-ground'

  return {
    serenity, garden, hasHighSerenity,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasClean, hasTidy, hasNeat, hasOrderly,
    hasHarmonious, hasPeaceful, hasCalm, hasSerene, hasTranquil,
    crypticCount, chaoticCount,
  }
}

/** @example measurePruning('export class X { readonly y: string }') */
export function measurePruning(content: string): PruningMeasure {
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
  const hasDeliberate = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasIntentional = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasPurposeful = /\b(try|catch|if)\b/.test(content)
  const hasMeasured = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasDeliberate, hasIntentional, hasPurposeful, hasMeasured,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let trim: PruningMeasure['trim'] = 'no-precision'
  if (precision >= 90) trim = 'bonsai-master'
  else if (precision >= 75) trim = 'expert-pruner'
  else if (precision >= 60) trim = 'proper-shears'
  else if (precision >= 40) trim = 'hedge-clippers'
  else if (precision >= 20) trim = 'chainsaw'

  return {
    precision, trim, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasDeliberate, hasIntentional, hasPurposeful, hasMeasured,
    unsafeCount, approximateCount,
  }
}

/** @example measureRooting('export class X { readonly y: string }') */
export function measureRooting(content: string): RootingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasEstablished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGrounded = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasAnchored = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSecure = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFirm = /\b(async|await|Promise)\b/.test(content)
  const hasSolid = /\b(if|return)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasStable,
    hasRobust, hasDurable, hasEnduring, hasHardened, hasEstablished,
    hasGrounded, hasAnchored, hasSecure, hasFirm, hasSolid,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let root: RootingMeasure['root'] = 'no-resilience'
  if (resilience >= 90) root = 'ancient-oak'
  else if (resilience >= 75) root = 'deep-rooted'
  else if (resilience >= 60) root = 'proper-taproot'
  else if (resilience >= 40) root = 'shallow-root'
  else if (resilience >= 20) root = 'floating-seed'

  return {
    resilience, root, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasStable,
    hasRobust, hasDurable, hasEnduring, hasHardened, hasEstablished,
    hasGrounded, hasAnchored, hasSecure, hasFirm, hasSolid,
    unhandledCount, untestedCount,
  }
}

/** @example measureReaping('export class X { readonly y: string }') */
export function measureReaping(content: string): ReapingMeasure {
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
  const hasFruitful = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasProductive = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFruitful, hasWise, hasProductive,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let yieldResult: ReapingMeasure['yield'] = 'no-wisdom'
  if (wisdom >= 90) yieldResult = 'abundant-harvest'
  else if (wisdom >= 75) yieldResult = 'fruitful-tree'
  else if (wisdom >= 60) yieldResult = 'proper-crop'
  else if (wisdom >= 40) yieldResult = 'meager-pickings'
  else if (wisdom >= 20) yieldResult = 'barren-field'

  return {
    wisdom, yield: yieldResult, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFruitful, hasWise, hasProductive,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzePeridotBloom(content, 'app.ts') */
export function analyzePeridotBloom(content: string, filePath: string): PeridotBloom {
  const growing = measureGrowing(content)
  const tending = measureTending(content)
  const pruning = measurePruning(content)
  const rooting = measureRooting(content)
  const reaping = measureReaping(content)

  const oliveVitality = growing.vitality
  const gardenSerenity = tending.serenity
  const growthPrecision = pruning.precision
  const rootResilience = rooting.resilience
  const harvestWisdom = reaping.wisdom

  const qualityScore = Math.round(
    oliveVitality * 0.2 +
    gardenSerenity * 0.2 +
    growthPrecision * 0.2 +
    rootResilience * 0.2 +
    harvestWisdom * 0.2,
  )

  const condition = classifyPeridotCondition(qualityScore)

  return {
    file: filePath,
    oliveVitality, gardenSerenity, growthPrecision, rootResilience, harvestWisdom,
    growing, tending, pruning, rooting, reaping,
    condition, qualityScore,
  }
}

/** @example analyzePeridotOrchard(blooms, 'src') */
export function analyzePeridotOrchard(blooms: PeridotBloom[], dirPath: string): PeridotOrchard {
  if (blooms.length === 0) {
    return {
      directory: dirPath, blooms: [],
      avgVitality: 0, avgPrecision: 0, avgWisdom: 0,
      peridotMasterpieceCount: 0, voidCount: 0,
      orchardType: 'no-orchard', condition: 'void',
    }
  }

  const avgVitality = Math.round(blooms.reduce((s, b) => s + b.oliveVitality, 0) / blooms.length)
  const avgPrecision = Math.round(blooms.reduce((s, b) => s + b.growthPrecision, 0) / blooms.length)
  const avgWisdom = Math.round(blooms.reduce((s, b) => s + b.harvestWisdom, 0) / blooms.length)
  const peridotMasterpieceCount = blooms.filter((b) => b.condition === 'peridot-masterpiece').length
  const voidCount = blooms.filter((b) => b.condition === 'void').length
  const orchardType = classifyOrchardType(blooms)
  const avgQuality = Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)
  const condition = classifyOrchardCondition(avgQuality)

  return {
    directory: dirPath, blooms,
    avgVitality, avgPrecision, avgWisdom,
    peridotMasterpieceCount, voidCount,
    orchardType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildPeridotGardenResult(['a.ts'], [content]) */
export async function buildPeridotGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PeridotGardenResult> {
  const blooms: PeridotBloom[] = files.map((file, i) =>
    analyzePeridotBloom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PeridotBloom[]>()
  for (const bloom of blooms) {
    const dir = bloom.file.includes('/')
      ? bloom.file.substring(0, bloom.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bloom)
    } else {
      dirMap.set(dir, [bloom])
    }
  }

  const orchards: PeridotOrchard[] = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzePeridotOrchard(dirBlooms, dir),
  )

  const avgOliveVitality = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.oliveVitality, 0) / blooms.length) : 0
  const avgGardenSerenity = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.gardenSerenity, 0) / blooms.length) : 0
  const avgGrowthPrecision = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.growthPrecision, 0) / blooms.length) : 0
  const avgRootResilience = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rootResilience, 0) / blooms.length) : 0
  const avgHarvestWisdom = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.harvestWisdom, 0) / blooms.length) : 0

  const overallFertility = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length) : 0
  const isPeridot = overallFertility >= 60

  const harvest: PeridotGardenResult['harvest'] = {
    avgVitality: avgOliveVitality, avgPrecision: avgGrowthPrecision, avgWisdom: avgHarvestWisdom,
    isPeridot, overallFertility,
  }

  const peridotMasterpieceCount = blooms.filter((b) => b.condition === 'peridot-masterpiece').length
  const goldenBloomCount = blooms.filter((b) => b.condition === 'golden-bloom').length
  const properPeridotCount = blooms.filter((b) => b.condition === 'proper-peridot').length
  const paleStoneCount = blooms.filter((b) => b.condition === 'pale-stone').length
  const rawMineralCount = blooms.filter((b) => b.condition === 'raw-mineral').length
  const voidCount = blooms.filter((b) => b.condition === 'void').length

  const hasHighVitalityCount = blooms.filter((b) => b.growing.hasHighVitality).length
  const hasHighSerenityCount = blooms.filter((b) => b.tending.hasHighSerenity).length
  const hasHighPrecisionCount = blooms.filter((b) => b.pruning.hasHighPrecision).length
  const hasHighResilienceCount = blooms.filter((b) => b.rooting.hasHighResilience).length
  const hasHighWisdomCount = blooms.filter((b) => b.reaping.hasHighWisdom).length

  const gardenerGrade = classifyGardenerGrade(overallFertility)

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file : ''
  const mostVital = blooms.length > 0
    ? blooms.reduce((best, b) => (b.oliveVitality > best.oliveVitality ? b : best)).file : ''
  const mostSerene = blooms.length > 0
    ? blooms.reduce((best, b) => (b.gardenSerenity > best.gardenSerenity ? b : best)).file : ''
  const mostPrecise = blooms.length > 0
    ? blooms.reduce((best, b) => (b.growthPrecision > best.growthPrecision ? b : best)).file : ''
  const mostResilient = blooms.length > 0
    ? blooms.reduce((best, b) => (b.rootResilience > best.rootResilience ? b : best)).file : ''
  const wisest = blooms.length > 0
    ? blooms.reduce((best, b) => (b.harvestWisdom > best.harvestWisdom ? b : best)).file : ''

  const stats: PeridotGardenResult['stats'] = {
    totalFiles: files.length, totalOrchards: orchards.length,
    avgOliveVitality, avgGardenSerenity, avgGrowthPrecision, avgRootResilience, avgHarvestWisdom,
    peridotMasterpieceCount, goldenBloomCount, properPeridotCount, paleStoneCount, rawMineralCount, voidCount,
    hasHighVitalityCount, hasHighSerenityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallFertility, gardenerGrade,
    bestBloom, mostVital, mostSerene, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(blooms, orchards, harvest, stats)

  return {
    blooms, orchards, harvest, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(blooms, orchards, harvest, stats) */
export function generateRecommendations(
  blooms: PeridotBloom[],
  orchards: PeridotOrchard[],
  _harvest: PeridotGardenResult['harvest'],
  stats: PeridotGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgOliveVitality >= 90 &&
    stats.avgGardenSerenity >= 90 &&
    stats.avgGrowthPrecision >= 90 &&
    stats.avgRootResilience >= 90 &&
    stats.avgHarvestWisdom >= 90
  ) {
    recs.push(
      'Your peridot garden blooms with master vitality! Olive vitality is full-bloom, garden serenity is zen-garden, growth precision is bonsai-master, root resilience is ancient-oak, and harvest wisdom is abundant-harvest!',
    )
    return recs
  }

  if (stats.avgOliveVitality < 60) {
    recs.push(
      'Revive olive vitality — the garden must grow; eliminate dead code, embrace dynamic patterns, and cultivate thriving growth'
    )
  }

  if (stats.avgGardenSerenity < 60) {
    recs.push(
      'Restore garden serenity — the garden must be tended with care; eliminate cryptic patterns, organize chaos, and cultivate zen-like clarity'
    )
  }

  if (stats.avgGrowthPrecision < 60) {
    recs.push(
      'Sharpen growth precision — every pruning cut must be deliberate; tighten types, eliminate unsafe patterns, and shape with bonsai-master care'
    )
  }

  if (stats.avgRootResilience < 60) {
    recs.push(
      'Deepen root resilience — the garden must weather every storm; add error handling, test thoroughly, and establish ancient-oak stability'
    )
  }

  if (stats.avgHarvestWisdom < 60) {
    recs.push(
      'Cultivate harvest wisdom — the garden must yield understanding; build with principled architecture, proven patterns, and abundant-harvest insight'
    )
  }

  if (stats.overallFertility < 40) {
    recs.push(
      'The garden is barren — raw mineral and pale stone outnumber the peridots, and the soil needs nourishment'
    )
  }

  const voidBlooms = blooms.filter((b) => b.condition === 'void')
  if (voidBlooms.length > 0 && voidBlooms.length <= 5) {
    recs.push(`Return these raw minerals to the soil: ${voidBlooms.map((b) => b.file).join(', ')}`)
  } else if (voidBlooms.length > 5) {
    recs.push(`Return ${voidBlooms.length} raw minerals to the soil before the garden withers completely`)
  }

  const poorOrchards = orchards.filter((o) => o.condition === 'void' || o.condition === 'empty-field')
  if (poorOrchards.length === orchards.length && orchards.length > 0) {
    recs.push('All orchards are empty fields — the peridot garden needs peridot-palace quality blooms throughout')
  }

  if (recs.length === 0) {
    recs.push('Your peridot garden flourishes beautifully — every bloom carries olive vitality, garden serenity, growth precision, root resilience, and harvest wisdom')
  }

  return recs
}
