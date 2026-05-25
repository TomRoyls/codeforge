// ─── Interfaces ──────────────────────────────────────────

export interface FlowingMeasure {
  grace: number
  current: 'perfect-flow' | 'graceful-stream' | 'proper-current' | 'rough-water' | 'stagnant-pool' | 'no-grace'
  hasHighGrace: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasSmooth: boolean
  hasNoJerky: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasFlowing: boolean
  hasNatural: boolean
  hasHarmonious: boolean
  hasFluid: boolean
  hasGraceful: boolean
  hasDirect: boolean
  hasOptimized: boolean
  dirtyCount: number
  wastefulCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  cascade: 'crystal-pool' | 'clear-stream' | 'proper-water' | 'murky-creek' | 'muddy-puddle' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasIlluminated: boolean
  hasClean: boolean
  hasPure: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface DeepeningMeasure {
  depth: number
  pool: 'bottomless-pool' | 'deep-basin' | 'proper-depth' | 'shallow-pan' | 'dry-bed' | 'no-depth'
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasProven: boolean
  hasPrincipled: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasMature: boolean
  hasReflective: boolean
  hasComprehensive: boolean
  hasLayered: boolean
  hasNuanced: boolean
  hasProfound: boolean
  hasRich: boolean
  hackedCount: number
  shallowCount: number
}

export interface PurifyingMeasure {
  purity: number
  mist: 'purest-vapor' | 'clean-mist' | 'proper-fog' | 'smog' | 'toxic-cloud' | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasClean: boolean
  hasHonest: boolean
  hasPure: boolean
  hasRefined: boolean
  hasEssential: boolean
  hasDistilled: boolean
  hasConcentrated: boolean
  hasNoiseFree: boolean
  hasUndiluted: boolean
  unsafeCount: number
  contradictoryCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  river: 'ancient-river' | 'wise-stream' | 'proper-creek' | 'seasonal-brook' | 'dry-wash' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasPrincipled: boolean
  hasEvolved: boolean
  hasProven: boolean
  hasMature: boolean
  hasPatterned: boolean
  hasStrategic: boolean
  hasConnected: boolean
  hasHolistic: boolean
  hasExperienced: boolean
  hasAdaptive: boolean
  hasEnduring: boolean
  hasLearned: boolean
  hasAccumulated: boolean
  hasWise: boolean
  naiveCount: number
  rigidCount: number
}

export type JadeCondition =
  | 'jade-masterpiece'
  | 'perfect-flow'
  | 'proper-stream'
  | 'murky-water'
  | 'dry-bed'
  | 'void'

export interface JadeDrop {
  file: string
  flowGrace: number
  cascadeClarity: number
  poolDepth: number
  mistPurity: number
  riverWisdom: number
  flowing: FlowingMeasure
  clarifying: ClarifyingMeasure
  deepening: DeepeningMeasure
  purifying: PurifyingMeasure
  accumulating: AccumulatingMeasure
  condition: JadeCondition
  qualityScore: number
}

export type StreamType =
  | 'great-river'
  | 'jade-stream'
  | 'proper-creek'
  | 'trickle'
  | 'dry-bed'
  | 'no-stream'

export type StreamCondition =
  | 'jade-garden'
  | 'flowing-sanctuary'
  | 'proper-pond'
  | 'stagnant-pool'
  | 'desert'
  | 'void'

export interface JadeStream {
  directory: string
  drops: JadeDrop[]
  avgGrace: number
  avgDepth: number
  avgWisdom: number
  jadeMasterpieceCount: number
  voidCount: number
  streamType: StreamType
  condition: StreamCondition
}

export type GardenerGrade = 'zen-master' | 'garden-keeper' | 'proper-cultivator' | 'apprentice' | 'novice' | 'drought-bringer'

export interface JadeCascadeResult {
  drops: JadeDrop[]
  streams: JadeStream[]
  garden: {
    avgGrace: number
    avgDepth: number
    avgWisdom: number
    isJade: boolean
    overallSerenity: number
  }
  stats: {
    totalFiles: number
    totalStreams: number
    avgFlowGrace: number
    avgCascadeClarity: number
    avgPoolDepth: number
    avgMistPurity: number
    avgRiverWisdom: number
    jadeMasterpieceCount: number
    perfectFlowCount: number
    properStreamCount: number
    murkyWaterCount: number
    dryBedCount: number
    voidCount: number
    hasHighGraceCount: number
    hasHighClarityCount: number
    hasHighDepthCount: number
    hasHighPurityCount: number
    hasHighWisdomCount: number
    overallSerenity: number
    gardenerGrade: GardenerGrade
    bestDrop: string
    mostGraceful: string
    clearest: string
    deepest: string
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

/** @example classifyJadeCondition(90) */
export function classifyJadeCondition(score: number): JadeCondition {
  if (score >= 90) return 'jade-masterpiece'
  if (score >= 75) return 'perfect-flow'
  if (score >= 60) return 'proper-stream'
  if (score >= 40) return 'murky-water'
  if (score >= 20) return 'dry-bed'
  return 'void'
}

/** @example classifyStreamType(drops) */
export function classifyStreamType(drops: JadeDrop[]): StreamType {
  if (drops.length === 0) return 'no-stream'
  const avg = drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length
  if (avg >= 85) return 'great-river'
  if (avg >= 70) return 'jade-stream'
  if (avg >= 55) return 'proper-creek'
  if (avg >= 35) return 'trickle'
  return 'dry-bed'
}

/** @example classifyStreamCondition(85) */
export function classifyStreamCondition(score: number): StreamCondition {
  if (score >= 85) return 'jade-garden'
  if (score >= 70) return 'flowing-sanctuary'
  if (score >= 55) return 'proper-pond'
  if (score >= 35) return 'stagnant-pool'
  if (score >= 15) return 'desert'
  return 'void'
}

/** @example classifyGardenerGrade(80) */
export function classifyGardenerGrade(avgSerenity: number): GardenerGrade {
  if (avgSerenity >= 80) return 'zen-master'
  if (avgSerenity >= 65) return 'garden-keeper'
  if (avgSerenity >= 50) return 'proper-cultivator'
  if (avgSerenity >= 35) return 'apprentice'
  if (avgSerenity >= 20) return 'novice'
  return 'drought-bringer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureFlowing('class X { readonly y: string }') */
export function measureFlowing(content: string): FlowingMeasure {
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const dirtyCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoDirty = dirtyCount === 0
  const hasEfficient = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const wastefulCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasSmooth = /\b(async|await|Promise)\b/.test(content)
  const hasNoJerky = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const hasNoClunky = !/\bany\b/.test(content)
  const hasFlowing = /\b(function|=>|return)\b/.test(content)
  const hasNatural = /\b(import|export)\b/.test(content)
  const hasHarmonious = /\b(readonly|private|protected)\b/.test(content)
  const hasFluid = /\b(try|catch|if)\b/.test(content)
  const hasGraceful = /\b(const|readonly)\b/.test(content)
  const hasDirect = /\b(throw|return)\b/.test(content)
  const hasOptimized = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasClean, hasNoDirty, hasEfficient, hasNoWasteful, hasSmooth,
    hasNoJerky, hasElegant, hasNoClunky, hasFlowing, hasNatural,
    hasHarmonious, hasFluid, hasGraceful, hasDirect, hasOptimized,
  ]

  const grace = computeScore(positiveBooleans)
  const hasHighGrace = grace >= 60

  let current: FlowingMeasure['current'] = 'no-grace'
  if (grace >= 90) current = 'perfect-flow'
  else if (grace >= 75) current = 'graceful-stream'
  else if (grace >= 60) current = 'proper-current'
  else if (grace >= 40) current = 'rough-water'
  else if (grace >= 20) current = 'stagnant-pool'

  return {
    grace, current, hasHighGrace,
    hasClean, hasNoDirty, hasEfficient, hasNoWasteful, hasSmooth,
    hasNoJerky, hasElegant, hasNoClunky, hasFlowing, hasNatural,
    hasHarmonious, hasFluid, hasGraceful, hasDirect, hasOptimized,
    dirtyCount, wastefulCount,
  }
}

/** @example measureClarifying('export class X { readonly y: string }') */
export function measureClarifying(content: string): ClarifyingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = /\/\*\*[\s\S]*?\*\//.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasRevealed = /\b(try|catch|if)\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPure = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasIlluminated, hasClean, hasPure,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let cascade: ClarifyingMeasure['cascade'] = 'no-clarity'
  if (clarity >= 90) cascade = 'crystal-pool'
  else if (clarity >= 75) cascade = 'clear-stream'
  else if (clarity >= 60) cascade = 'proper-water'
  else if (clarity >= 40) cascade = 'murky-creek'
  else if (clarity >= 20) cascade = 'muddy-puddle'

  return {
    clarity, cascade, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasIlluminated, hasClean, hasPure,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureDeepening('export class X { async analyze() {} }') */
export function measureDeepening(content: string): DeepeningMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length
  const hasNoShallow = shallowCount === 0
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasPrincipled = !/\bany\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMature = /\b(readonly|private|protected)\b/.test(content)
  const hasReflective = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(function|=>|return)\b/.test(content)
  const hasLayered = /\b(const|readonly)\b/.test(content)
  const hasNuanced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasProfound = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasRich = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasDeep, hasNoShallow, hasProven,
    hasPrincipled, hasStrategic, hasInsightful, hasMature, hasReflective,
    hasComprehensive, hasLayered, hasNuanced, hasProfound, hasRich,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let pool: DeepeningMeasure['pool'] = 'no-depth'
  if (depth >= 90) pool = 'bottomless-pool'
  else if (depth >= 75) pool = 'deep-basin'
  else if (depth >= 60) pool = 'proper-depth'
  else if (depth >= 40) pool = 'shallow-pan'
  else if (depth >= 20) pool = 'dry-bed'

  return {
    depth, pool, hasHighDepth,
    hasWellArchitected, hasNoHacked, hasDeep, hasNoShallow, hasProven,
    hasPrincipled, hasStrategic, hasInsightful, hasMature, hasReflective,
    hasComprehensive, hasLayered, hasNuanced, hasProfound, hasRich,
    hackedCount, shallowCount,
  }
}

/** @example measurePurifying('const x: string = ""') */
export function measurePurifying(content: string): PurifyingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval|Function)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradictory|inconsistent|paradox)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasHonest = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPure = /\b(readonly|as const)\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasEssential = /\b(import|export)\b/.test(content)
  const hasDistilled = /\b(class|interface|type)\b/.test(content)
  const hasConcentrated = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoiseFree = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUndiluted = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasConsistent,
    hasNoContradictory, hasClean, hasHonest, hasPure, hasRefined,
    hasEssential, hasDistilled, hasConcentrated, hasNoiseFree, hasUndiluted,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let mist: PurifyingMeasure['mist'] = 'no-purity'
  if (purity >= 90) mist = 'purest-vapor'
  else if (purity >= 75) mist = 'clean-mist'
  else if (purity >= 60) mist = 'proper-fog'
  else if (purity >= 40) mist = 'smog'
  else if (purity >= 20) mist = 'toxic-cloud'

  return {
    purity, mist, hasHighPurity,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasConsistent,
    hasNoContradictory, hasClean, hasHonest, hasPure, hasRefined,
    hasEssential, hasDistilled, hasConcentrated, hasNoiseFree, hasUndiluted,
    unsafeCount, contradictoryCount,
  }
}

/** @example measureAccumulating('export class X { readonly y: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hasPrincipled = !/\bany\b/.test(content)
  const hasEvolved = /\b(import|export)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasMature = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPatterned = /\b(readonly|private|protected)\b/.test(content)
  const hasStrategic = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasConnected = /\b(async|await|Promise)\b/.test(content)
  const hasHolistic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasExperienced = /\b(function|=>|return)\b/.test(content)
  const hasAdaptive = /\b(const|readonly)\b/.test(content)
  const hasEnduring = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasLearned = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAccumulated = /\b(throw|return)\b/.test(content)
  const hasWise = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const naiveCount = (content.match(/\b(naive| simplistic|amateur)\b/gi) ?? []).length
  const rigidCount = (content.match(/\b(rigid|inflexible|brittle)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasPrincipled, hasEvolved, hasProven, hasMature,
    hasPatterned, hasStrategic, hasConnected, hasHolistic, hasExperienced,
    hasAdaptive, hasEnduring, hasLearned, hasAccumulated, hasWise,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let river: AccumulatingMeasure['river'] = 'no-wisdom'
  if (wisdom >= 90) river = 'ancient-river'
  else if (wisdom >= 75) river = 'wise-stream'
  else if (wisdom >= 60) river = 'proper-creek'
  else if (wisdom >= 40) river = 'seasonal-brook'
  else if (wisdom >= 20) river = 'dry-wash'

  return {
    wisdom, river, hasHighWisdom,
    hasWellArchitected, hasPrincipled, hasEvolved, hasProven, hasMature,
    hasPatterned, hasStrategic, hasConnected, hasHolistic, hasExperienced,
    hasAdaptive, hasEnduring, hasLearned, hasAccumulated, hasWise,
    naiveCount, rigidCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeJadeDrop(content, 'app.ts') */
export function analyzeJadeDrop(content: string, filePath: string): JadeDrop {
  const flowing = measureFlowing(content)
  const clarifying = measureClarifying(content)
  const deepening = measureDeepening(content)
  const purifying = measurePurifying(content)
  const accumulating = measureAccumulating(content)

  const flowGrace = flowing.grace
  const cascadeClarity = clarifying.clarity
  const poolDepth = deepening.depth
  const mistPurity = purifying.purity
  const riverWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    flowGrace * 0.2 +
    cascadeClarity * 0.2 +
    poolDepth * 0.2 +
    mistPurity * 0.2 +
    riverWisdom * 0.2,
  )

  const condition = classifyJadeCondition(qualityScore)

  return {
    file: filePath,
    flowGrace, cascadeClarity, poolDepth, mistPurity, riverWisdom,
    flowing, clarifying, deepening, purifying, accumulating,
    condition, qualityScore,
  }
}

/** @example analyzeJadeStream(drops, 'src') */
export function analyzeJadeStream(drops: JadeDrop[], dirPath: string): JadeStream {
  if (drops.length === 0) {
    return {
      directory: dirPath, drops: [],
      avgGrace: 0, avgDepth: 0, avgWisdom: 0,
      jadeMasterpieceCount: 0, voidCount: 0,
      streamType: 'no-stream', condition: 'void',
    }
  }

  const avgGrace = Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length)
  const avgDepth = Math.round(drops.reduce((s, d) => s + d.poolDepth, 0) / drops.length)
  const avgWisdom = Math.round(drops.reduce((s, d) => s + d.riverWisdom, 0) / drops.length)
  const jadeMasterpieceCount = drops.filter((d) => d.condition === 'jade-masterpiece').length
  const voidCount = drops.filter((d) => d.condition === 'void').length
  const streamType = classifyStreamType(drops)
  const avgQuality = Math.round(drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length)
  const condition = classifyStreamCondition(avgQuality)

  return {
    directory: dirPath, drops,
    avgGrace, avgDepth, avgWisdom,
    jadeMasterpieceCount, voidCount,
    streamType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildJadeCascadeResult(['a.ts'], [content]) */
export async function buildJadeCascadeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeCascadeResult> {
  const drops: JadeDrop[] = files.map((file, i) =>
    analyzeJadeDrop(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, JadeDrop[]>()
  for (const drop of drops) {
    const dir = drop.file.includes('/')
      ? drop.file.substring(0, drop.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(drop)
    } else {
      dirMap.set(dir, [drop])
    }
  }

  const streams: JadeStream[] = Array.from(dirMap.entries()).map(([dir, dirDrops]) =>
    analyzeJadeStream(dirDrops, dir),
  )

  const avgFlowGrace = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.flowGrace, 0) / drops.length) : 0
  const avgCascadeClarity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.cascadeClarity, 0) / drops.length) : 0
  const avgPoolDepth = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.poolDepth, 0) / drops.length) : 0
  const avgMistPurity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.mistPurity, 0) / drops.length) : 0
  const avgRiverWisdom = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.riverWisdom, 0) / drops.length) : 0

  const overallSerenity = drops.length > 0
    ? Math.round(drops.reduce((s, d) => s + d.qualityScore, 0) / drops.length) : 0
  const isJade = overallSerenity >= 60

  const garden = { avgGrace: avgFlowGrace, avgDepth: avgPoolDepth, avgWisdom: avgRiverWisdom, isJade, overallSerenity }

  const jadeMasterpieceCount = drops.filter((d) => d.condition === 'jade-masterpiece').length
  const perfectFlowCount = drops.filter((d) => d.condition === 'perfect-flow').length
  const properStreamCount = drops.filter((d) => d.condition === 'proper-stream').length
  const murkyWaterCount = drops.filter((d) => d.condition === 'murky-water').length
  const dryBedCount = drops.filter((d) => d.condition === 'dry-bed').length
  const voidCount = drops.filter((d) => d.condition === 'void').length

  const hasHighGraceCount = drops.filter((d) => d.flowing.hasHighGrace).length
  const hasHighClarityCount = drops.filter((d) => d.clarifying.hasHighClarity).length
  const hasHighDepthCount = drops.filter((d) => d.deepening.hasHighDepth).length
  const hasHighPurityCount = drops.filter((d) => d.purifying.hasHighPurity).length
  const hasHighWisdomCount = drops.filter((d) => d.accumulating.hasHighWisdom).length

  const gardenerGrade = classifyGardenerGrade(overallSerenity)

  const bestDrop = drops.length > 0
    ? drops.reduce((best, d) => (d.qualityScore > best.qualityScore ? d : best)).file : ''
  const mostGraceful = drops.length > 0
    ? drops.reduce((best, d) => (d.flowGrace > best.flowGrace ? d : best)).file : ''
  const clearest = drops.length > 0
    ? drops.reduce((best, d) => (d.cascadeClarity > best.cascadeClarity ? d : best)).file : ''
  const deepest = drops.length > 0
    ? drops.reduce((best, d) => (d.poolDepth > best.poolDepth ? d : best)).file : ''
  const purest = drops.length > 0
    ? drops.reduce((best, d) => (d.mistPurity > best.mistPurity ? d : best)).file : ''
  const wisest = drops.length > 0
    ? drops.reduce((best, d) => (d.riverWisdom > best.riverWisdom ? d : best)).file : ''

  const stats: JadeCascadeResult['stats'] = {
    totalFiles: files.length, totalStreams: streams.length,
    avgFlowGrace, avgCascadeClarity, avgPoolDepth, avgMistPurity, avgRiverWisdom,
    jadeMasterpieceCount, perfectFlowCount, properStreamCount, murkyWaterCount, dryBedCount, voidCount,
    hasHighGraceCount, hasHighClarityCount, hasHighDepthCount, hasHighPurityCount, hasHighWisdomCount,
    overallSerenity, gardenerGrade,
    bestDrop, mostGraceful, clearest, deepest, purest, wisest,
  }

  const recommendations = generateRecommendations(drops, streams, garden, stats)

  return { drops, streams, garden, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(drops, streams, garden, stats) */
export function generateRecommendations(
  drops: JadeDrop[],
  streams: JadeStream[],
  garden: JadeCascadeResult['garden'],
  stats: JadeCascadeResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgFlowGrace >= 90 &&
    stats.avgCascadeClarity >= 90 &&
    stats.avgPoolDepth >= 90 &&
    stats.avgMistPurity >= 90 &&
    stats.avgRiverWisdom >= 90
  ) {
    recs.push(
      'Your jade cascade is a masterpiece of serenity! Every drop combines flow grace, cascade clarity, pool depth, mist purity, and river wisdom into a cascade worthy of an ancient garden!',
    )
    return recs
  }

  if (stats.avgFlowGrace < 60) {
    recs.push(
      'Improve flow grace — water over jade has no resistance; your code should flow smoothly, naturally, and without friction',
    )
  }

  if (stats.avgCascadeClarity < 60) {
    recs.push(
      'Enhance cascade clarity — each pool in a cascade reflects the sky; your code should be transparent and understandable at every stage',
    )
  }

  if (stats.avgPoolDepth < 60) {
    recs.push(
      'Deepen pool depth — pools form where knowledge settles; your code should demonstrate deep understanding, architecture, and principled design',
    )
  }

  if (stats.avgMistPurity < 60) {
    recs.push(
      'Purify the mist — the mist from a cascade is water at its purest; your code should be type-safe, accurate, and free of unsafe patterns',
    )
  }

  if (stats.avgRiverWisdom < 60) {
    recs.push(
      'Grow river wisdom — rivers carry the wisdom of everything they touch; your code should be well-architected, evolved, and patterned with proven principles',
    )
  }

  if (stats.overallSerenity < 40) {
    recs.push(
      'The cascade has run dry — the jade stones are bare and the pools have evaporated; a complete redesign of the waterway is needed',
    )
  }

  const voidDrops = drops.filter((d) => d.condition === 'void')
  if (voidDrops.length > 0 && voidDrops.length <= 5) {
    recs.push(`Redirect these dry beds back to the stream: ${voidDrops.map((d) => d.file).join(', ')}`)
  } else if (voidDrops.length > 5) {
    recs.push(`Redirect ${voidDrops.length} dry beds before the entire garden becomes a desert`)
  }

  const poorStreams = streams.filter((s) => s.condition === 'void' || s.condition === 'desert')
  if (poorStreams.length === streams.length && streams.length > 0) {
    recs.push('All streams have dried up — the jade cascade needs a complete restoration from source to mouth')
  }

  if (recs.length === 0) {
    recs.push('Your jade cascade flows with serenity — each drop combines flow grace, cascade clarity, pool depth, mist purity, and river wisdom')
  }

  return recs
}
