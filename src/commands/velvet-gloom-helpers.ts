// ─── Interfaces ──────────────────────────────────────────

export interface SoothingMeasure {
  softness: number
  texture: 'silk-velvet' | 'soft-suede' | 'proper-cotton' | 'rough-burlap' | 'sandpaper' | 'no-softness'
  hasHighSoftness: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasWelcoming: boolean
  hasGentle: boolean
  hasSmooth: boolean
  hasInviting: boolean
  hasWarm: boolean
  hasKind: boolean
  hasForgiving: boolean
  hasComfortable: boolean
  hasPatient: boolean
  hasGracious: boolean
  hostileCount: number
  crypticCount: number
}

export interface ComfortingMeasure {
  comfort: number
  embrace: 'safe-haven' | 'warm-blanket' | 'proper-shelter' | 'cold-corner' | 'exposed-roof' | 'no-comfort'
  hasHighComfort: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasForgiving: boolean
  hasSafe: boolean
  hasProtective: boolean
  hasReassuring: boolean
  hasSupportive: boolean
  hasGentle: boolean
  hasUnderstanding: boolean
  hasPatient: boolean
  hasNurturing: boolean
  hasCaring: boolean
  hasAccepting: boolean
  unhandledCount: number
  hostileCount: number
}

export interface DrapingMeasure {
  elegance: number
  drape: 'haute-couture' | 'fine-garment' | 'proper-clothing' | 'ill-fitting' | 'ragged' | 'no-elegance'
  hasHighElegance: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasGraceful: boolean
  hasSubtle: boolean
  hasTasteful: boolean
  hasSophisticated: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasAesthetic: boolean
  hasCrafted: boolean
  hasDeliberate: boolean
  hasArtistic: boolean
  hasBeautiful: boolean
  clunkyCount: number
  roughCount: number
}

export interface ContemplatingMeasure {
  wisdom: number
  insight: 'night-philosopher' | 'star-gazer' | 'proper-thinker' | 'day-dreamer' | 'sleep-walker' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasReflective: boolean
  hasContemplative: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasEvolved: boolean
  hasThoughtful: boolean
  hasMindful: boolean
  hasMature: boolean
  hasProven: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hackedCount: number
  shallowCount: number
}

export interface PersistingMeasure {
  resilience: number
  endurance: 'eternal-night' | 'long-dark' | 'proper-winter' | 'brief-sunset' | 'flash-of-dark' | 'no-resilience'
  hasHighResilience: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasEnduring: boolean
  hasReliable: boolean
  hasPersistent: boolean
  hasUnyielding: boolean
  hasResolute: boolean
  hasSteadfast: boolean
  hasTireless: boolean
  hasIndomitable: boolean
  hasUnfailing: boolean
  hasPerpetual: boolean
  untestedCount: number
  volatileCount: number
}

export type FoldCondition =
  | 'velvet-masterpiece'
  | 'midnight-silk'
  | 'proper-fabric'
  | 'coarse-weave'
  | 'torn-rag'
  | 'void'

export interface VelvetFold {
  file: string
  softnessQuality: number
  darkComfort: number
  shadowElegance: number
  nocturnalWisdom: number
  nightResilience: number
  soothing: SoothingMeasure
  comforting: ComfortingMeasure
  draping: DrapingMeasure
  contemplating: ContemplatingMeasure
  persisting: PersistingMeasure
  condition: FoldCondition
  qualityScore: number
}

export type CurtainType =
  | 'grand-curtain'
  | 'velvet-drape'
  | 'proper-blinds'
  | 'bedsheet'
  | 'no-covering'
  | 'void'

export type CurtainCondition =
  | 'velvet-theater'
  | 'silk-parlor'
  | 'proper-room'
  | 'bare-walls'
  | 'ruin'
  | 'void'

export interface VelvetCurtain {
  directory: string
  folds: VelvetFold[]
  avgSoftness: number
  avgElegance: number
  avgWisdom: number
  velvetMasterpieceCount: number
  voidCount: number
  curtainType: CurtainType
  condition: CurtainCondition
}

export type WeaverGrade = 'master-weaver' | 'velvet-artisan' | 'proper-tailor' | 'apprentice' | 'novice' | 'rag-picker'

export interface VelvetDarknessResult {
  folds: VelvetFold[]
  curtains: VelvetCurtain[]
  night: {
    avgSoftness: number
    avgElegance: number
    avgWisdom: number
    isVelvet: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalCurtains: number
    avgSoftnessQuality: number
    avgDarkComfort: number
    avgShadowElegance: number
    avgNocturnalWisdom: number
    avgNightResilience: number
    velvetMasterpieceCount: number
    midnightSilkCount: number
    properFabricCount: number
    coarseWeaveCount: number
    tornRagCount: number
    voidCount: number
    hasHighSoftnessCount: number
    hasHighComfortCount: number
    hasHighEleganceCount: number
    hasHighWisdomCount: number
    hasHighResilienceCount: number
    overallDepth: number
    weaverGrade: WeaverGrade
    bestFold: string
    softest: string
    mostComforting: string
    mostElegant: string
    wisest: string
    mostResilient: string
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

/** @example classifyFoldCondition(90) */
export function classifyFoldCondition(score: number): FoldCondition {
  if (score >= 90) return 'velvet-masterpiece'
  if (score >= 75) return 'midnight-silk'
  if (score >= 60) return 'proper-fabric'
  if (score >= 40) return 'coarse-weave'
  if (score >= 20) return 'torn-rag'
  return 'void'
}

/** @example classifyCurtainType(folds) */
export function classifyCurtainType(folds: VelvetFold[]): CurtainType {
  if (folds.length === 0) return 'void'
  const avg = folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length
  if (avg >= 85) return 'grand-curtain'
  if (avg >= 70) return 'velvet-drape'
  if (avg >= 55) return 'proper-blinds'
  if (avg >= 35) return 'bedsheet'
  return 'no-covering'
}

/** @example classifyCurtainCondition(85) */
export function classifyCurtainCondition(score: number): CurtainCondition {
  if (score >= 85) return 'velvet-theater'
  if (score >= 70) return 'silk-parlor'
  if (score >= 55) return 'proper-room'
  if (score >= 35) return 'bare-walls'
  if (score >= 15) return 'ruin'
  return 'void'
}

/** @example classifyWeaverGrade(80) */
export function classifyWeaverGrade(avgDepth: number): WeaverGrade {
  if (avgDepth >= 80) return 'master-weaver'
  if (avgDepth >= 65) return 'velvet-artisan'
  if (avgDepth >= 50) return 'proper-tailor'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'rag-picker'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureSoothing('class X { readonly y: string }') */
export function measureSoothing(content: string): SoothingMeasure {
  const hasApproachable = /\b(class|interface|type)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|dangerous|violent)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasWelcoming = /\b(import|export)\b/.test(content)
  const hasGentle = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSmooth = !/\bany\b/.test(content)
  const hasInviting = /\b(async|await|Promise)\b/.test(content)
  const hasWarm = /\b(const|readonly)\b/.test(content)
  const hasKind = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasForgiving = /\b(try|catch|if)\b/.test(content)
  const hasComfortable = /\b(function|=>|return)\b/.test(content)
  const hasPatient = /\b(readonly|private|protected)\b/.test(content)
  const hasGracious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasApproachable, hasNoHostile, hasReadable, hasNoCryptic, hasWelcoming,
    hasGentle, hasSmooth, hasInviting, hasWarm, hasKind,
    hasForgiving, hasComfortable, hasPatient, hasGracious,
  ]

  const softness = computeScore(positiveBooleans)
  const hasHighSoftness = softness >= 60

  let texture: SoothingMeasure['texture'] = 'no-softness'
  if (softness >= 90) texture = 'silk-velvet'
  else if (softness >= 75) texture = 'soft-suede'
  else if (softness >= 60) texture = 'proper-cotton'
  else if (softness >= 40) texture = 'rough-burlap'
  else if (softness >= 20) texture = 'sandpaper'

  return {
    softness, texture, hasHighSoftness,
    hasApproachable, hasNoHostile, hasReadable, hasNoCryptic, hasWelcoming,
    hasGentle, hasSmooth, hasInviting, hasWarm, hasKind,
    hasForgiving, hasComfortable, hasPatient, hasGracious,
    hostileCount, crypticCount,
  }
}

/** @example measureComforting('try { x } catch { y }') */
export function measureComforting(content: string): ComfortingMeasure {
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|unchecked|bare)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasForgiving = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSafe = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasProtective = /\b(readonly|private|protected)\b/.test(content)
  const hasReassuring = /\b(class|interface|type)\b/.test(content)
  const hasSupportive = /\b(import|export)\b/.test(content)
  const hasGentle = /\b(const|readonly)\b/.test(content)
  const hasUnderstanding = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasNurturing = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCaring = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasAccepting = /\b(function|=>|return)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|dangerous|violent)\b/gi) ?? []).length

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasForgiving,
    hasSafe, hasProtective, hasReassuring, hasSupportive, hasGentle,
    hasUnderstanding, hasPatient, hasNurturing, hasCaring, hasAccepting,
  ]

  const comfort = computeScore(positiveBooleans)
  const hasHighComfort = comfort >= 60

  let embrace: ComfortingMeasure['embrace'] = 'no-comfort'
  if (comfort >= 90) embrace = 'safe-haven'
  else if (comfort >= 75) embrace = 'warm-blanket'
  else if (comfort >= 60) embrace = 'proper-shelter'
  else if (comfort >= 40) embrace = 'cold-corner'
  else if (comfort >= 20) embrace = 'exposed-roof'

  return {
    comfort, embrace, hasHighComfort,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasForgiving,
    hasSafe, hasProtective, hasReassuring, hasSupportive, hasGentle,
    hasUnderstanding, hasPatient, hasNurturing, hasCaring, hasAccepting,
    unhandledCount, hostileCount,
  }
}

/** @example measureDraping('export class X { readonly y: string }') */
export function measureDraping(content: string): DrapingMeasure {
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const clunkyCount = (content.match(/\b(clunky|ugly|messy|sloppy)\b/gi) ?? []).length
  const hasNoClunky = clunkyCount === 0
  const hasRefined = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPolished = !/\bany\b/.test(content)
  const hasGraceful = /\b(import|export)\b/.test(content)
  const hasSubtle = /\b(readonly|private|protected)\b/.test(content)
  const hasTasteful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSophisticated = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = /\b(function|=>|return)\b/.test(content)
  const hasBalanced = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAesthetic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCrafted = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDeliberate = /\b(try|catch|if)\b/.test(content)
  const hasArtistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasBeautiful = /\b(const|readonly)\b/.test(content)
  const roughCount = (content.match(/\b(rough|crude|primitive|bare)\b/gi) ?? []).length

  const positiveBooleans = [
    hasElegant, hasNoClunky, hasRefined, hasPolished, hasGraceful,
    hasSubtle, hasTasteful, hasSophisticated, hasHarmonious, hasBalanced,
    hasAesthetic, hasCrafted, hasDeliberate, hasArtistic, hasBeautiful,
  ]

  const elegance = computeScore(positiveBooleans)
  const hasHighElegance = elegance >= 60

  let drape: DrapingMeasure['drape'] = 'no-elegance'
  if (elegance >= 90) drape = 'haute-couture'
  else if (elegance >= 75) drape = 'fine-garment'
  else if (elegance >= 60) drape = 'proper-clothing'
  else if (elegance >= 40) drape = 'ill-fitting'
  else if (elegance >= 20) drape = 'ragged'

  return {
    elegance, drape, hasHighElegance,
    hasElegant, hasNoClunky, hasRefined, hasPolished, hasGraceful,
    hasSubtle, hasTasteful, hasSophisticated, hasHarmonious, hasBalanced,
    hasAesthetic, hasCrafted, hasDeliberate, hasArtistic, hasBeautiful,
    clunkyCount, roughCount,
  }
}

/** @example measureContemplating('export class X { readonly y: string }') */
export function measureContemplating(content: string): ContemplatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasReflective = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasContemplative = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInsightful = /\b(try|catch|if)\b/.test(content)
  const hasStrategic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasThoughtful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMindful = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasProven = /\b(function|=>|return)\b/.test(content)
  const hasWise = /\b(const|readonly)\b/.test(content)
  const hasAccumulated = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasReflective,
    hasContemplative, hasInsightful, hasStrategic, hasEvolved, hasThoughtful,
    hasMindful, hasMature, hasProven, hasWise, hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let insight: ContemplatingMeasure['insight'] = 'no-wisdom'
  if (wisdom >= 90) insight = 'night-philosopher'
  else if (wisdom >= 75) insight = 'star-gazer'
  else if (wisdom >= 60) insight = 'proper-thinker'
  else if (wisdom >= 40) insight = 'day-dreamer'
  else if (wisdom >= 20) insight = 'sleep-walker'

  return {
    wisdom, insight, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasReflective,
    hasContemplative, hasInsightful, hasStrategic, hasEvolved, hasThoughtful,
    hasMindful, hasMature, hasProven, hasWise, hasAccumulated,
    hackedCount, shallowCount,
  }
}

/** @example measurePersisting('try { x } catch { y }') */
export function measurePersisting(content: string): PersistingMeasure {
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|flaky|erratic)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasReliable = !/\bany\b/.test(content)
  const hasPersistent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnyielding = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasResolute = /\b(class|interface|type)\b/.test(content)
  const hasSteadfast = /\b(import|export)\b/.test(content)
  const hasTireless = /\b(async|await|Promise)\b/.test(content)
  const hasIndomitable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnfailing = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPerpetual = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasTested, hasNoUntested, hasStable, hasNoVolatile, hasConsistent,
    hasEnduring, hasReliable, hasPersistent, hasUnyielding, hasResolute,
    hasSteadfast, hasTireless, hasIndomitable, hasUnfailing, hasPerpetual,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let endurance: PersistingMeasure['endurance'] = 'no-resilience'
  if (resilience >= 90) endurance = 'eternal-night'
  else if (resilience >= 75) endurance = 'long-dark'
  else if (resilience >= 60) endurance = 'proper-winter'
  else if (resilience >= 40) endurance = 'brief-sunset'
  else if (resilience >= 20) endurance = 'flash-of-dark'

  return {
    resilience, endurance, hasHighResilience,
    hasTested, hasNoUntested, hasStable, hasNoVolatile, hasConsistent,
    hasEnduring, hasReliable, hasPersistent, hasUnyielding, hasResolute,
    hasSteadfast, hasTireless, hasIndomitable, hasUnfailing, hasPerpetual,
    untestedCount, volatileCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeVelvetFold(content, 'app.ts') */
export function analyzeVelvetFold(content: string, filePath: string): VelvetFold {
  const soothing = measureSoothing(content)
  const comforting = measureComforting(content)
  const draping = measureDraping(content)
  const contemplating = measureContemplating(content)
  const persisting = measurePersisting(content)

  const softnessQuality = soothing.softness
  const darkComfort = comforting.comfort
  const shadowElegance = draping.elegance
  const nocturnalWisdom = contemplating.wisdom
  const nightResilience = persisting.resilience

  const qualityScore = Math.round(
    softnessQuality * 0.2 +
    darkComfort * 0.2 +
    shadowElegance * 0.2 +
    nocturnalWisdom * 0.2 +
    nightResilience * 0.2,
  )

  const condition = classifyFoldCondition(qualityScore)

  return {
    file: filePath,
    softnessQuality, darkComfort, shadowElegance, nocturnalWisdom, nightResilience,
    soothing, comforting, draping, contemplating, persisting,
    condition, qualityScore,
  }
}

/** @example analyzeVelvetCurtain(folds, 'src') */
export function analyzeVelvetCurtain(folds: VelvetFold[], dirPath: string): VelvetCurtain {
  if (folds.length === 0) {
    return {
      directory: dirPath, folds: [],
      avgSoftness: 0, avgElegance: 0, avgWisdom: 0,
      velvetMasterpieceCount: 0, voidCount: 0,
      curtainType: 'void', condition: 'void',
    }
  }

  const avgSoftness = Math.round(folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length)
  const avgElegance = Math.round(folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length)
  const avgWisdom = Math.round(folds.reduce((s, f) => s + f.nocturnalWisdom, 0) / folds.length)
  const velvetMasterpieceCount = folds.filter((f) => f.condition === 'velvet-masterpiece').length
  const voidCount = folds.filter((f) => f.condition === 'void').length
  const curtainType = classifyCurtainType(folds)
  const avgQuality = Math.round(folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length)
  const condition = classifyCurtainCondition(avgQuality)

  return {
    directory: dirPath, folds,
    avgSoftness, avgElegance, avgWisdom,
    velvetMasterpieceCount, voidCount,
    curtainType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildVelvetDarknessResult(['a.ts'], [content]) */
export async function buildVelvetDarknessResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<VelvetDarknessResult> {
  const folds: VelvetFold[] = files.map((file, i) =>
    analyzeVelvetFold(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, VelvetFold[]>()
  for (const fold of folds) {
    const dir = fold.file.includes('/')
      ? fold.file.substring(0, fold.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(fold)
    } else {
      dirMap.set(dir, [fold])
    }
  }

  const curtains: VelvetCurtain[] = Array.from(dirMap.entries()).map(([dir, dirFolds]) =>
    analyzeVelvetCurtain(dirFolds, dir),
  )

  const avgSoftnessQuality = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length) : 0
  const avgDarkComfort = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.darkComfort, 0) / folds.length) : 0
  const avgShadowElegance = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length) : 0
  const avgNocturnalWisdom = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.nocturnalWisdom, 0) / folds.length) : 0
  const avgNightResilience = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.nightResilience, 0) / folds.length) : 0

  const overallDepth = folds.length > 0
    ? Math.round(folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length) : 0
  const isVelvet = overallDepth >= 60

  const night = { avgSoftness: avgSoftnessQuality, avgElegance: avgShadowElegance, avgWisdom: avgNocturnalWisdom, isVelvet, overallDepth }

  const velvetMasterpieceCount = folds.filter((f) => f.condition === 'velvet-masterpiece').length
  const midnightSilkCount = folds.filter((f) => f.condition === 'midnight-silk').length
  const properFabricCount = folds.filter((f) => f.condition === 'proper-fabric').length
  const coarseWeaveCount = folds.filter((f) => f.condition === 'coarse-weave').length
  const tornRagCount = folds.filter((f) => f.condition === 'torn-rag').length
  const voidCount = folds.filter((f) => f.condition === 'void').length

  const hasHighSoftnessCount = folds.filter((f) => f.soothing.hasHighSoftness).length
  const hasHighComfortCount = folds.filter((f) => f.comforting.hasHighComfort).length
  const hasHighEleganceCount = folds.filter((f) => f.draping.hasHighElegance).length
  const hasHighWisdomCount = folds.filter((f) => f.contemplating.hasHighWisdom).length
  const hasHighResilienceCount = folds.filter((f) => f.persisting.hasHighResilience).length

  const weaverGrade = classifyWeaverGrade(overallDepth)

  const bestFold = folds.length > 0
    ? folds.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file : ''
  const softest = folds.length > 0
    ? folds.reduce((best, f) => (f.softnessQuality > best.softnessQuality ? f : best)).file : ''
  const mostComforting = folds.length > 0
    ? folds.reduce((best, f) => (f.darkComfort > best.darkComfort ? f : best)).file : ''
  const mostElegant = folds.length > 0
    ? folds.reduce((best, f) => (f.shadowElegance > best.shadowElegance ? f : best)).file : ''
  const wisest = folds.length > 0
    ? folds.reduce((best, f) => (f.nocturnalWisdom > best.nocturnalWisdom ? f : best)).file : ''
  const mostResilient = folds.length > 0
    ? folds.reduce((best, f) => (f.nightResilience > best.nightResilience ? f : best)).file : ''

  const stats: VelvetDarknessResult['stats'] = {
    totalFiles: files.length, totalCurtains: curtains.length,
    avgSoftnessQuality, avgDarkComfort, avgShadowElegance, avgNocturnalWisdom, avgNightResilience,
    velvetMasterpieceCount, midnightSilkCount, properFabricCount, coarseWeaveCount, tornRagCount, voidCount,
    hasHighSoftnessCount, hasHighComfortCount, hasHighEleganceCount, hasHighWisdomCount, hasHighResilienceCount,
    overallDepth, weaverGrade,
    bestFold, softest, mostComforting, mostElegant, wisest, mostResilient,
  }

  const recommendations = generateRecommendations(folds, curtains, night, stats)

  return { folds, curtains, night, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(folds, curtains, night, stats) */
export function generateRecommendations(
  folds: VelvetFold[],
  curtains: VelvetCurtain[],
  night: VelvetDarknessResult['night'],
  stats: VelvetDarknessResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgSoftnessQuality >= 90 &&
    stats.avgDarkComfort >= 90 &&
    stats.avgShadowElegance >= 90 &&
    stats.avgNocturnalWisdom >= 90 &&
    stats.avgNightResilience >= 90
  ) {
    recs.push(
      'Your velvet darkness is a masterpiece of soft shadow! Every fold is silken to the touch, the dark embraces like velvet, shadows drape with couture elegance, and nocturnal wisdom persists through the longest night!',
    )
    return recs
  }

  if (stats.avgSoftnessQuality < 60) {
    recs.push(
      'Soften the velvet texture — your code needs more approachable naming, gentle structure, and forgiving error handling to be silken to the touch',
    )
  }

  if (stats.avgDarkComfort < 60) {
    recs.push(
      'Deepen the dark comfort — the velvet darkness should embrace, not expose; your code needs stronger error boundaries, defensive types, and reassuring structure',
    )
  }

  if (stats.avgShadowElegance < 60) {
    recs.push(
      'Refine the shadow elegance — velvet drapes with effortless grace; your code needs polished abstractions, refined types, and harmonious organization',
    )
  }

  if (stats.avgNocturnalWisdom < 60) {
    recs.push(
      'Cultivate nocturnal wisdom — the night reveals what day obscures; your code should be well-architected, reflective, and built on deep understanding',
    )
  }

  if (stats.avgNightResilience < 60) {
    recs.push(
      'Strengthen the night resilience — velvet endures in darkness where other fabrics fade; your code needs tested paths, stable patterns, and unyielding consistency',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The velvet darkness has frayed to threadbare — no softness remains and the night offers no comfort',
    )
  }

  const voidFolds = folds.filter((f) => f.condition === 'void')
  if (voidFolds.length > 0 && voidFolds.length <= 5) {
    recs.push(`Mend these torn rags: ${voidFolds.map((f) => f.file).join(', ')}`)
  } else if (voidFolds.length > 5) {
    recs.push(`Mend ${voidFolds.length} torn rags before the entire curtain unravels`)
  }

  const poorCurtains = curtains.filter((c) => c.condition === 'void' || c.condition === 'ruin')
  if (poorCurtains.length === curtains.length && curtains.length > 0) {
    recs.push('All curtains have fallen — the velvet darkness needs complete reweaving from raw thread to finished drape')
  }

  if (recs.length === 0) {
    recs.push('Your velvet darkness drapes beautifully — each fold combines softness, comfort, elegance, wisdom, and night resilience')
  }

  return recs
}
