// ─── Interfaces ──────────────────────────────────────────

export interface RevealingMeasure {
  clarity: number
  mirror: 'flawless-reflection' | 'clear-glass' | 'proper-surface' | 'cloudy-depth' | 'cracked-glass' | 'no-clarity'
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
  hasExposed: boolean
  hasNaked: boolean
  hasUnvarnished: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ReflectingMeasure {
  honesty: number
  truth: 'brutal-truth' | 'honest-mirror' | 'proper-reflection' | 'distorted-image' | 'fun-house-mirror' | 'no-honesty'
  hasHighHonesty: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasNoDeadCode: boolean
  hasNoSecretFixme: boolean
  hasGenuine: boolean
  hasAuthentic: boolean
  hasSincere: boolean
  hasCandid: boolean
  hasFrank: boolean
  hasStraightforward: boolean
  hasUnpretentious: boolean
  hasTruthful: boolean
  hackCount: number
  workaroundCount: number
}

export interface CuttingMeasure {
  precision: number
  blade: 'surgical-obsidian' | 'razor-edge' | 'proper-knife' | 'dull-blade' | 'blunt-rock' | 'no-precision'
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
  hasKeen: boolean
  hasIncisive: boolean
  hasPiercing: boolean
  hasAcute: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SurvivingMeasure {
  resilience: number
  depth: 'bottomless-void' | 'dark-fortress' | 'proper-shelter' | 'fragile-glass' | 'paper-thin' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasReinforced: boolean
  hasTough: boolean
  hasUnshakable: boolean
  hasIndomitable: boolean
  hasUnyielding: boolean
  hasImperturbable: boolean
  unhandledCount: number
  untestedCount: number
}

export interface FathomingMeasure {
  wisdom: number
  depth: 'bottomless-sage' | 'deep-thinker' | 'proper-philosopher' | 'surface-skimmer' | 'puddle-depth' | 'no-wisdom'
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
  hasSagacious: boolean
  hackedCount: number
  shallowCount: number
}

export type ShardCondition =
  | 'obsidian-masterpiece'
  | 'volcanic-gem'
  | 'proper-glass'
  | 'cloudy-stone'
  | 'rough-rock'
  | 'void'

export interface ObsidianShard {
  file: string
  volcanicClarity: number
  darkReflection: number
  edgePrecision: number
  voidResilience: number
  abyssWisdom: number
  revealing: RevealingMeasure
  reflecting: ReflectingMeasure
  cutting: CuttingMeasure
  surviving: SurvivingMeasure
  fathoming: FathomingMeasure
  condition: ShardCondition
  qualityScore: number
}

export type CavernType =
  | 'mirror-chamber'
  | 'dark-gallery'
  | 'proper-cave'
  | 'shallow-hollow'
  | 'surface-crack'
  | 'no-cavern'

export type CavernCondition =
  | 'obsidian-palace'
  | 'dark-vault'
  | 'proper-chamber'
  | 'stone-cellar'
  | 'dirt-hole'
  | 'void'

export interface ObsidianCavern {
  directory: string
  shards: ObsidianShard[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  obsidianMasterpieceCount: number
  voidCount: number
  cavernType: CavernType
  condition: CavernCondition
}

export type MirrorGrade = 'seer' | 'mirror-master' | 'proper-gazer' | 'apprentice' | 'novice' | 'blind-folded'

export interface ObsidianMirrorResult {
  shards: ObsidianShard[]
  caverns: ObsidianCavern[]
  abyss: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isObsidian: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalCaverns: number
    avgVolcanicClarity: number
    avgDarkReflection: number
    avgEdgePrecision: number
    avgVoidResilience: number
    avgAbyssWisdom: number
    obsidianMasterpieceCount: number
    volcanicGemCount: number
    properGlassCount: number
    cloudyStoneCount: number
    roughRockCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighHonestyCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallDepth: number
    mirrorGrade: MirrorGrade
    bestShard: string
    clearest: string
    mostHonest: string
    sharpest: string
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

/** @example classifyShardCondition(90) */
export function classifyShardCondition(score: number): ShardCondition {
  if (score >= 90) return 'obsidian-masterpiece'
  if (score >= 75) return 'volcanic-gem'
  if (score >= 60) return 'proper-glass'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'rough-rock'
  return 'void'
}

/** @example classifyCavernType(shards) */
export function classifyCavernType(shards: ObsidianShard[]): CavernType {
  if (shards.length === 0) return 'no-cavern'
  const avg = shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  if (avg >= 85) return 'mirror-chamber'
  if (avg >= 70) return 'dark-gallery'
  if (avg >= 55) return 'proper-cave'
  if (avg >= 35) return 'shallow-hollow'
  return 'surface-crack'
}

/** @example classifyCavernCondition(85) */
export function classifyCavernCondition(score: number): CavernCondition {
  if (score >= 85) return 'obsidian-palace'
  if (score >= 70) return 'dark-vault'
  if (score >= 55) return 'proper-chamber'
  if (score >= 35) return 'stone-cellar'
  if (score >= 15) return 'dirt-hole'
  return 'void'
}

/** @example classifyMirrorGrade(80) */
export function classifyMirrorGrade(avgDepth: number): MirrorGrade {
  if (avgDepth >= 80) return 'seer'
  if (avgDepth >= 65) return 'mirror-master'
  if (avgDepth >= 50) return 'proper-gazer'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'blind-folded'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(import|export)\b/.test(content)
  const hasNoMystery = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|mangled|minified)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnderstandable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDirect = !/\bany\b/.test(content)
  const hasOpen = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasRevealed = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasExposed = /\b(try|catch|if)\b/.test(content)
  const hasNaked = /\b(async|await|Promise)\b/.test(content)
  const hasUnvarnished = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasExposed, hasNaked, hasUnvarnished,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let mirror: RevealingMeasure['mirror'] = 'no-clarity'
  if (clarity >= 90) mirror = 'flawless-reflection'
  else if (clarity >= 75) mirror = 'clear-glass'
  else if (clarity >= 60) mirror = 'proper-surface'
  else if (clarity >= 40) mirror = 'cloudy-depth'
  else if (clarity >= 20) mirror = 'cracked-glass'

  return {
    clarity, mirror, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasOpen, hasRevealed, hasExposed, hasNaked, hasUnvarnished,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureReflecting('const x: string = "hello"') */
export function measureReflecting(content: string): ReflectingMeasure {
  const hackCount = (content.match(/\b(hack|kludge)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(todo|fixme|hack|xxx)\b/gi) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(console\.log|debugger|var\s)/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(debugger|console\.(log|debug|trace))\b/g) ?? []).length === 0
  const hasNoDeadCode = (content.match(/\/\/\s*(if|return|break)\s/g) ?? []).length === 0
  const hasNoSecretFixme = (content.match(/\b(fixme|secret|hidden)\b/gi) ?? []).length === 0
  const hasGenuine = !/\bany\b/.test(content)
  const hasAuthentic = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasSincere = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCandid = /\b(import|export)\b/.test(content)
  const hasFrank = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStraightforward = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnpretentious = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTruthful = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasNoDeadCode, hasNoSecretFixme, hasGenuine, hasAuthentic, hasSincere,
    hasCandid, hasFrank, hasStraightforward, hasUnpretentious, hasTruthful,
  ]

  const honesty = computeScore(positiveBooleans)
  const hasHighHonesty = honesty >= 60

  let truth: ReflectingMeasure['truth'] = 'no-honesty'
  if (honesty >= 90) truth = 'brutal-truth'
  else if (honesty >= 75) truth = 'honest-mirror'
  else if (honesty >= 60) truth = 'proper-reflection'
  else if (honesty >= 40) truth = 'distorted-image'
  else if (honesty >= 20) truth = 'fun-house-mirror'

  return {
    honesty, truth, hasHighHonesty,
    hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut, hasNoDebugCode,
    hasNoDeadCode, hasNoSecretFixme, hasGenuine, hasAuthentic, hasSincere,
    hasCandid, hasFrank, hasStraightforward, hasUnpretentious, hasTruthful,
    hackCount, workaroundCount,
  }
}

/** @example measureCutting('export class X { readonly y: string }') */
export function measureCutting(content: string): CuttingMeasure {
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
  const hasKeen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasIncisive = /\b(try|catch|if)\b/.test(content)
  const hasPiercing = /\b(async|await|Promise)\b/.test(content)
  const hasAcute = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasKeen, hasIncisive, hasPiercing, hasAcute,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let blade: CuttingMeasure['blade'] = 'no-precision'
  if (precision >= 90) blade = 'surgical-obsidian'
  else if (precision >= 75) blade = 'razor-edge'
  else if (precision >= 60) blade = 'proper-knife'
  else if (precision >= 40) blade = 'dull-blade'
  else if (precision >= 20) blade = 'blunt-rock'

  return {
    precision, blade, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasKeen, hasIncisive, hasPiercing, hasAcute,
    unsafeCount, approximateCount,
  }
}

/** @example measureSurviving('try { } catch (e) { }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|unchecked|risky)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|===|!==)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasReinforced = /\b(import|export)\b/.test(content)
  const hasTough = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnshakable = !/\bany\b/.test(content)
  const hasIndomitable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUnyielding = /\b(class|interface|type)\b/.test(content)
  const hasImperturbable = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasReinforced,
    hasTough, hasUnshakable, hasIndomitable, hasUnyielding, hasImperturbable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let depth: SurvivingMeasure['depth'] = 'no-resilience'
  if (resilience >= 90) depth = 'bottomless-void'
  else if (resilience >= 75) depth = 'dark-fortress'
  else if (resilience >= 60) depth = 'proper-shelter'
  else if (resilience >= 40) depth = 'fragile-glass'
  else if (resilience >= 20) depth = 'paper-thin'

  return {
    resilience, depth, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasReinforced,
    hasTough, hasUnshakable, hasIndomitable, hasUnyielding, hasImperturbable,
    unhandledCount, untestedCount,
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
  const hasSagacious = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProfound, hasWise, hasSagacious,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let depth: FathomingMeasure['depth'] = 'no-wisdom'
  if (wisdom >= 90) depth = 'bottomless-sage'
  else if (wisdom >= 75) depth = 'deep-thinker'
  else if (wisdom >= 60) depth = 'proper-philosopher'
  else if (wisdom >= 40) depth = 'surface-skimmer'
  else if (wisdom >= 20) depth = 'puddle-depth'

  return {
    wisdom, depth, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProfound, hasWise, hasSagacious,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeObsidianShard(content, 'app.ts') */
export function analyzeObsidianShard(content: string, filePath: string): ObsidianShard {
  const revealing = measureRevealing(content)
  const reflecting = measureReflecting(content)
  const cutting = measureCutting(content)
  const surviving = measureSurviving(content)
  const fathoming = measureFathoming(content)

  const volcanicClarity = revealing.clarity
  const darkReflection = reflecting.honesty
  const edgePrecision = cutting.precision
  const voidResilience = surviving.resilience
  const abyssWisdom = fathoming.wisdom

  const qualityScore = Math.round(
    volcanicClarity * 0.2 +
    darkReflection * 0.2 +
    edgePrecision * 0.2 +
    voidResilience * 0.2 +
    abyssWisdom * 0.2,
  )

  const condition = classifyShardCondition(qualityScore)

  return {
    file: filePath,
    volcanicClarity, darkReflection, edgePrecision, voidResilience, abyssWisdom,
    revealing, reflecting, cutting, surviving, fathoming,
    condition, qualityScore,
  }
}

/** @example analyzeObsidianCavern(shards, 'src') */
export function analyzeObsidianCavern(shards: ObsidianShard[], dirPath: string): ObsidianCavern {
  if (shards.length === 0) {
    return {
      directory: dirPath, shards: [],
      avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      obsidianMasterpieceCount: 0, voidCount: 0,
      cavernType: 'no-cavern', condition: 'void',
    }
  }

  const avgClarity = Math.round(shards.reduce((s, sh) => s + sh.volcanicClarity, 0) / shards.length)
  const avgPrecision = Math.round(shards.reduce((s, sh) => s + sh.edgePrecision, 0) / shards.length)
  const avgWisdom = Math.round(shards.reduce((s, sh) => s + sh.abyssWisdom, 0) / shards.length)
  const obsidianMasterpieceCount = shards.filter((sh) => sh.condition === 'obsidian-masterpiece').length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length
  const cavernType = classifyCavernType(shards)
  const avgQuality = Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
  const condition = classifyCavernCondition(avgQuality)

  return {
    directory: dirPath, shards,
    avgClarity, avgPrecision, avgWisdom,
    obsidianMasterpieceCount, voidCount,
    cavernType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildObsidianMirrorResult(['a.ts'], [content]) */
export async function buildObsidianMirrorResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianMirrorResult> {
  const shards: ObsidianShard[] = files.map((file, i) =>
    analyzeObsidianShard(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ObsidianShard[]>()
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

  const caverns: ObsidianCavern[] = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeObsidianCavern(dirShards, dir),
  )

  const avgVolcanicClarity = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.volcanicClarity, 0) / shards.length) : 0
  const avgDarkReflection = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.darkReflection, 0) / shards.length) : 0
  const avgEdgePrecision = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.edgePrecision, 0) / shards.length) : 0
  const avgVoidResilience = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.voidResilience, 0) / shards.length) : 0
  const avgAbyssWisdom = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.abyssWisdom, 0) / shards.length) : 0

  const overallDepth = shards.length > 0
    ? Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length) : 0
  const isObsidian = overallDepth >= 60

  const abyss: ObsidianMirrorResult['abyss'] = {
    avgClarity: avgVolcanicClarity, avgPrecision: avgEdgePrecision, avgWisdom: avgAbyssWisdom,
    isObsidian, overallDepth,
  }

  const obsidianMasterpieceCount = shards.filter((sh) => sh.condition === 'obsidian-masterpiece').length
  const volcanicGemCount = shards.filter((sh) => sh.condition === 'volcanic-gem').length
  const properGlassCount = shards.filter((sh) => sh.condition === 'proper-glass').length
  const cloudyStoneCount = shards.filter((sh) => sh.condition === 'cloudy-stone').length
  const roughRockCount = shards.filter((sh) => sh.condition === 'rough-rock').length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length

  const hasHighClarityCount = shards.filter((sh) => sh.revealing.hasHighClarity).length
  const hasHighHonestyCount = shards.filter((sh) => sh.reflecting.hasHighHonesty).length
  const hasHighPrecisionCount = shards.filter((sh) => sh.cutting.hasHighPrecision).length
  const hasHighResilienceCount = shards.filter((sh) => sh.surviving.hasHighResilience).length
  const hasHighWisdomCount = shards.filter((sh) => sh.fathoming.hasHighWisdom).length

  const mirrorGrade = classifyMirrorGrade(overallDepth)

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => (sh.qualityScore > best.qualityScore ? sh : best)).file : ''
  const clearest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.volcanicClarity > best.volcanicClarity ? sh : best)).file : ''
  const mostHonest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.darkReflection > best.darkReflection ? sh : best)).file : ''
  const sharpest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.edgePrecision > best.edgePrecision ? sh : best)).file : ''
  const mostResilient = shards.length > 0
    ? shards.reduce((best, sh) => (sh.voidResilience > best.voidResilience ? sh : best)).file : ''
  const wisest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.abyssWisdom > best.abyssWisdom ? sh : best)).file : ''

  const stats: ObsidianMirrorResult['stats'] = {
    totalFiles: files.length, totalCaverns: caverns.length,
    avgVolcanicClarity, avgDarkReflection, avgEdgePrecision, avgVoidResilience, avgAbyssWisdom,
    obsidianMasterpieceCount, volcanicGemCount, properGlassCount, cloudyStoneCount, roughRockCount, voidCount,
    hasHighClarityCount, hasHighHonestyCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallDepth, mirrorGrade,
    bestShard, clearest, mostHonest, sharpest, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(shards, caverns, abyss, stats)

  return {
    shards, caverns, abyss, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(shards, caverns, abyss, stats) */
export function generateRecommendations(
  shards: ObsidianShard[],
  caverns: ObsidianCavern[],
  abyss: ObsidianMirrorResult['abyss'],
  stats: ObsidianMirrorResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgVolcanicClarity >= 90 &&
    stats.avgDarkReflection >= 90 &&
    stats.avgEdgePrecision >= 90 &&
    stats.avgVoidResilience >= 90 &&
    stats.avgAbyssWisdom >= 90
  ) {
    recs.push(
      'Your obsidian mirror reflects absolute truth! The clarity is flawless, the honesty brutal, the edge surgical, the void bottomless, and the wisdom unfathomable!',
    )
    return recs
  }

  if (stats.avgVolcanicClarity < 60) {
    recs.push(
      'Polish volcanic clarity — the obsidian mirror must reflect truth without distortion; your code needs clearer naming, better documentation, and more transparent logic'
    )
  }

  if (stats.avgDarkReflection < 60) {
    recs.push(
      'Face the dark reflection — the mirror shows only truth; your code needs fewer hacks, no workarounds, and genuine honest patterns'
    )
  }

  if (stats.avgEdgePrecision < 60) {
    recs.push(
      'Sharpen the obsidian edge — surgical precision cuts through complexity; your code needs stricter types, exact definitions, and sharper logic'
    )
  }

  if (stats.avgVoidResilience < 60) {
    recs.push(
      'Strengthen void resilience — obsidian must endure the darkest depths; your code needs error handling, defensive patterns, and unshakable robustness'
    )
  }

  if (stats.avgAbyssWisdom < 60) {
    recs.push(
      'Fathom the abyss — the deepest wisdom lies in the void; your code needs principled architecture, proven patterns, and profound understanding'
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The mirror shatters — cloudy stones and rough rocks outnumber the precious obsidian, and the cavern lies in darkness'
    )
  }

  const voidShards = shards.filter((sh) => sh.condition === 'void')
  if (voidShards.length > 0 && voidShards.length <= 5) {
    recs.push(`Polish these rough shards: ${voidShards.map((sh) => sh.file).join(', ')}`)
  } else if (voidShards.length > 5) {
    recs.push(`Polish ${voidShards.length} rough shards before the mirror shatters completely`)
  }

  const poorCaverns = caverns.filter((c) => c.condition === 'void' || c.condition === 'dirt-hole')
  if (poorCaverns.length === caverns.length && caverns.length > 0) {
    recs.push('All caverns are dirt holes — the obsidian mirror needs complete restoration with mirror-chamber quality shards')
  }

  if (recs.length === 0) {
    recs.push('Your obsidian mirror reflects with dark perfection — every shard embodies clarity, honesty, precision, resilience, and abyss wisdom')
  }

  return recs
}
