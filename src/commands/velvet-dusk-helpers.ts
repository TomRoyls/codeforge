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
  hasNoIntimidating: boolean
  hasGentle: boolean
  hasNoHarsh: boolean
  hasComfortable: boolean
  hasSmooth: boolean
  hasInviting: boolean
  hasWarm: boolean
  hasKind: boolean
  hasForgiving: boolean
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
  hasPatient: boolean
  hasReassuring: boolean
  hasSupportive: boolean
  hasSafe: boolean
  hasProtective: boolean
  hasGentle: boolean
  hasUnderstanding: boolean
  hasAccepting: boolean
  hasNurturing: boolean
  hasCaring: boolean
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
  hasProven: boolean
  hasReflective: boolean
  hasContemplative: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasMature: boolean
  hasEvolved: boolean
  hasPatient: boolean
  hasThoughtful: boolean
  hasMindful: boolean
  hasWise: boolean
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
  hasPatient: boolean
  hasPersistent: boolean
  hasUnyielding: boolean
  hasResolute: boolean
  hasSteadfast: boolean
  hasTireless: boolean
  hasIndomitable: boolean
  hasUnfailing: boolean
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
  celebration?: string
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

export interface VelvetDuskResult {
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
    weaverGrade: 'master-weaver' | 'velvet-artisan' | 'proper-tailor' | 'apprentice' | 'novice' | 'rag-picker'
    bestFold: string
    softest: string
    mostComforting: string
    mostElegant: string
    wisest: string
    mostResilient: string
    celebration?: string
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
  if (folds.length === 0) return 'no-covering'
  const avg =
    folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length
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
export function classifyWeaverGrade(
  avgDepth: number,
): VelvetDuskResult['stats']['weaverGrade'] {
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
  const hasApproachable = /\b(const|let|function|class)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|violent|brutal)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasReadable = /\b(function|class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasWelcoming = /\b(import|export)\b/.test(content)
  const hasNoIntimidating = !/\b(monolithic|god.object|enterprise)\b/i.test(content)
  const hasGentle = /\b(readonly|private|protected)\b/.test(content)
  const hasNoHarsh = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasComfortable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSmooth = !/\bany\b/.test(content)
  const hasInviting = /\b(export|public)\b/.test(content)
  const hasWarm = /\b(async|await|Promise)\b/.test(content)
  const hasKind = /\b(try|catch|if)\b/.test(content)
  const hasForgiving = /\b(function|=>|return)\b/.test(content)
  const hasGracious = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasApproachable,
    hasNoHostile,
    hasReadable,
    hasNoCryptic,
    hasWelcoming,
    hasNoIntimidating,
    hasGentle,
    hasNoHarsh,
    hasComfortable,
    hasSmooth,
    hasInviting,
    hasWarm,
    hasKind,
    hasForgiving,
    hasGracious,
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
    softness,
    texture,
    hasHighSoftness,
    hasApproachable,
    hasNoHostile,
    hasReadable,
    hasNoCryptic,
    hasWelcoming,
    hasNoIntimidating,
    hasGentle,
    hasNoHarsh,
    hasComfortable,
    hasSmooth,
    hasInviting,
    hasWarm,
    hasKind,
    hasForgiving,
    hasGracious,
    hostileCount,
    crypticCount,
  }
}

/** @example measureComforting('try { x() } catch { y() }') */
export function measureComforting(content: string): ComfortingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasForgiving = !/\bany\b/.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasReassuring = /\b(class|interface|type)\b/.test(content)
  const hasSupportive = /\b(function|=>|return)\b/.test(content)
  const hasSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProtective = /\b(readonly|as const)\b/.test(content)
  const hasGentle = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnderstanding = /\b(try|catch|if)\b/.test(content)
  const hasAccepting = /\b(return|throw)\b/.test(content)
  const hasNurturing = /\b(const|readonly)\b/.test(content)
  const hasCaring = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|brutal)\b/gi) ?? []).length

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasForgiving,
    hasPatient,
    hasReassuring,
    hasSupportive,
    hasSafe,
    hasProtective,
    hasGentle,
    hasUnderstanding,
    hasAccepting,
    hasNurturing,
    hasCaring,
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
    comfort,
    embrace,
    hasHighComfort,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasForgiving,
    hasPatient,
    hasReassuring,
    hasSupportive,
    hasSafe,
    hasProtective,
    hasGentle,
    hasUnderstanding,
    hasAccepting,
    hasNurturing,
    hasCaring,
    unhandledCount,
    hostileCount,
  }
}

/** @example measureDraping('export class X { readonly y: string }') */
export function measureDraping(content: string): DrapingMeasure {
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const clunkyCount = (content.match(/\b(clunky|ugly|hacky|gross)\b/gi) ?? []).length
  const hasNoClunky = clunkyCount === 0
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasGraceful = /\b(function|=>|return)\b/.test(content)
  const hasSubtle = !/\bany\b/.test(content)
  const hasTasteful = /\b(import|export)\b/.test(content)
  const hasSophisticated = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = /\b(try|catch|if)\b/.test(content)
  const hasBalanced = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAesthetic = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasCrafted = /\b(readonly|as const)\b/.test(content)
  const hasDeliberate = /\b(export|public)\b/.test(content)
  const hasArtistic = !/\b(var|eval)\b/.test(content)
  const hasBeautiful = /\b(const|readonly)\b/.test(content)
  const roughCount = (content.match(/\b(rough|crude|primitive|raw)\b/gi) ?? []).length

  const positiveBooleans = [
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasGraceful,
    hasSubtle,
    hasTasteful,
    hasSophisticated,
    hasHarmonious,
    hasBalanced,
    hasAesthetic,
    hasCrafted,
    hasDeliberate,
    hasArtistic,
    hasBeautiful,
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
    elegance,
    drape,
    hasHighElegance,
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasGraceful,
    hasSubtle,
    hasTasteful,
    hasSophisticated,
    hasHarmonious,
    hasBalanced,
    hasAesthetic,
    hasCrafted,
    hasDeliberate,
    hasArtistic,
    hasBeautiful,
    clunkyCount,
    roughCount,
  }
}

/** @example measureContemplating('class X implements Y { readonly z: string }') */
export function measureContemplating(content: string): ContemplatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasProven = /\b(export|public)\b/.test(content)
  const hasReflective = /\b(try|catch|if)\b/.test(content)
  const hasContemplative = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasEvolved = !/\bany\b/.test(content)
  const hasPatient = /\b(function|=>|return)\b/.test(content)
  const hasThoughtful = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasMindful = /\b(return|throw)\b/.test(content)
  const hasWise = /\b(function|class|interface)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|skin.deep)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasReflective,
    hasContemplative,
    hasInsightful,
    hasStrategic,
    hasMature,
    hasEvolved,
    hasPatient,
    hasThoughtful,
    hasMindful,
    hasWise,
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
    wisdom,
    insight,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasReflective,
    hasContemplative,
    hasInsightful,
    hasStrategic,
    hasMature,
    hasEvolved,
    hasPatient,
    hasThoughtful,
    hasMindful,
    hasWise,
    hackedCount,
    shallowCount,
  }
}

/** @example measurePersisting('const x: string = try { y() } catch { z() }') */
export function measurePersisting(content: string): PersistingMeasure {
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = !/\bany\b/.test(content)
  const hasEnduring = /\b(class|interface|type)\b/.test(content)
  const hasReliable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasPersistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnyielding = /\b(readonly|as const)\b/.test(content)
  const hasResolute = /\b(import|export)\b/.test(content)
  const hasSteadfast = /\b(function|=>|return)\b/.test(content)
  const hasTireless = /\b(try|catch|finally)\b/.test(content)
  const hasIndomitable = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasUnfailing = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasEnduring,
    hasReliable,
    hasPatient,
    hasPersistent,
    hasUnyielding,
    hasResolute,
    hasSteadfast,
    hasTireless,
    hasIndomitable,
    hasUnfailing,
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
    resilience,
    endurance,
    hasHighResilience,
    hasTested,
    hasNoUntested,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasEnduring,
    hasReliable,
    hasPatient,
    hasPersistent,
    hasUnyielding,
    hasResolute,
    hasSteadfast,
    hasTireless,
    hasIndomitable,
    hasUnfailing,
    untestedCount,
    volatileCount,
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

  const fold: VelvetFold = {
    file: filePath,
    softnessQuality,
    darkComfort,
    shadowElegance,
    nocturnalWisdom,
    nightResilience,
    soothing,
    comforting,
    draping,
    contemplating,
    persisting,
    condition,
    qualityScore,
  }

  if (
    content.includes('velvet-darkness') ||
    content.includes('velvet-night') ||
    content.includes('velvet-dusk')
  ) {
    fold.celebration = '★ Milestone #590 — Velvet Darkness ★'
  }

  return fold
}

/** @example analyzeVelvetCurtain(folds, 'src') */
export function analyzeVelvetCurtain(folds: VelvetFold[], dirPath: string): VelvetCurtain {
  if (folds.length === 0) {
    return {
      directory: dirPath,
      folds: [],
      avgSoftness: 0,
      avgElegance: 0,
      avgWisdom: 0,
      velvetMasterpieceCount: 0,
      voidCount: 0,
      curtainType: 'no-covering',
      condition: 'void',
    }
  }

  const avgSoftness = Math.round(
    folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length,
  )
  const avgElegance = Math.round(
    folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length,
  )
  const avgWisdom = Math.round(
    folds.reduce((s, f) => s + f.nocturnalWisdom, 0) / folds.length,
  )

  const velvetMasterpieceCount = folds.filter(
    (f) => f.condition === 'velvet-masterpiece',
  ).length
  const voidCount = folds.filter((f) => f.condition === 'void').length

  const curtainType = classifyCurtainType(folds)
  const avgQuality = Math.round(
    folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length,
  )
  const condition = classifyCurtainCondition(avgQuality)

  return {
    directory: dirPath,
    folds,
    avgSoftness,
    avgElegance,
    avgWisdom,
    velvetMasterpieceCount,
    voidCount,
    curtainType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildVelvetDuskResult(['a.ts'], [content]) */
export async function buildVelvetDuskResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<VelvetDuskResult> {
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

  const avgSoftness =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.softnessQuality, 0) / folds.length)
      : 0
  const avgElegance =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.shadowElegance, 0) / folds.length)
      : 0
  const avgWisdom =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.nocturnalWisdom, 0) / folds.length)
      : 0

  const overallDepth =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.qualityScore, 0) / folds.length)
      : 0
  const isVelvet = overallDepth >= 60

  const night = { avgSoftness, avgElegance, avgWisdom, isVelvet, overallDepth }

  const avgDarkComfort =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.darkComfort, 0) / folds.length)
      : 0
  const avgShadowElegance = avgElegance
  const avgNocturnalWisdom = avgWisdom
  const avgNightResilience =
    folds.length > 0
      ? Math.round(folds.reduce((s, f) => s + f.nightResilience, 0) / folds.length)
      : 0

  const velvetMasterpieceCount = folds.filter(
    (f) => f.condition === 'velvet-masterpiece',
  ).length
  const midnightSilkCount = folds.filter(
    (f) => f.condition === 'midnight-silk',
  ).length
  const properFabricCount = folds.filter(
    (f) => f.condition === 'proper-fabric',
  ).length
  const coarseWeaveCount = folds.filter(
    (f) => f.condition === 'coarse-weave',
  ).length
  const tornRagCount = folds.filter(
    (f) => f.condition === 'torn-rag',
  ).length
  const voidCount = folds.filter((f) => f.condition === 'void').length

  const hasHighSoftnessCount = folds.filter(
    (f) => f.soothing.hasHighSoftness,
  ).length
  const hasHighComfortCount = folds.filter(
    (f) => f.comforting.hasHighComfort,
  ).length
  const hasHighEleganceCount = folds.filter(
    (f) => f.draping.hasHighElegance,
  ).length
  const hasHighWisdomCount = folds.filter(
    (f) => f.contemplating.hasHighWisdom,
  ).length
  const hasHighResilienceCount = folds.filter(
    (f) => f.persisting.hasHighResilience,
  ).length

  const weaverGrade = classifyWeaverGrade(overallDepth)

  const bestFold = folds.length > 0
    ? folds.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file
    : ''
  const softest = folds.length > 0
    ? folds.reduce((best, f) => (f.softnessQuality > best.softnessQuality ? f : best)).file
    : ''
  const mostComforting = folds.length > 0
    ? folds.reduce((best, f) => (f.darkComfort > best.darkComfort ? f : best)).file
    : ''
  const mostElegant = folds.length > 0
    ? folds.reduce((best, f) => (f.shadowElegance > best.shadowElegance ? f : best)).file
    : ''
  const wisest = folds.length > 0
    ? folds.reduce((best, f) => (f.nocturnalWisdom > best.nocturnalWisdom ? f : best)).file
    : ''
  const mostResilient = folds.length > 0
    ? folds.reduce((best, f) => (f.nightResilience > best.nightResilience ? f : best)).file
    : ''

  const stats: VelvetDuskResult['stats'] = {
    totalFiles: files.length,
    totalCurtains: curtains.length,
    avgSoftnessQuality: avgSoftness,
    avgDarkComfort,
    avgShadowElegance,
    avgNocturnalWisdom,
    avgNightResilience,
    velvetMasterpieceCount,
    midnightSilkCount,
    properFabricCount,
    coarseWeaveCount,
    tornRagCount,
    voidCount,
    hasHighSoftnessCount,
    hasHighComfortCount,
    hasHighEleganceCount,
    hasHighWisdomCount,
    hasHighResilienceCount,
    overallDepth,
    weaverGrade,
    bestFold,
    softest,
    mostComforting,
    mostElegant,
    wisest,
    mostResilient,
  }

  const hasSelfReference = contents.some(
    (c) => c && (c.includes('velvet-darkness') || c.includes('velvet-night') || c.includes('velvet-dusk')),
  )
  if (hasSelfReference) {
    stats.celebration = '★ Milestone #590 — 590 commands woven in the velvet night ★'
  }

  const recommendations = generateRecommendations(folds, curtains, night, stats)

  return { folds, curtains, night, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(folds, curtains, night, stats) */
export function generateRecommendations(
  folds: VelvetFold[],
  curtains: VelvetCurtain[],
  night: VelvetDuskResult['night'],
  stats: VelvetDuskResult['stats'],
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
      'Your velvet darkness is a masterpiece of nocturnal elegance! Each fold drapes with the softness of midnight silk!',
    )
    return recs
  }

  if (stats.avgSoftnessQuality < 60) {
    recs.push(
      'Soften the touch — velvet earns its luxury through softness; make your code as gentle as moonlight on silk',
    )
  }

  if (stats.avgDarkComfort < 60) {
    recs.push(
      'Deepen the comfort — true darkness is a warm embrace, not a cold void; your code should feel like coming home',
    )
  }

  if (stats.avgShadowElegance < 60) {
    recs.push(
      'Refine the drape — shadows reveal form through contrast; ensure your code wears its complexity with grace',
    )
  }

  if (stats.avgNocturnalWisdom < 60) {
    recs.push(
      'Cultivate the wisdom — the night is when understanding crystallizes; let your code reflect deep contemplation',
    )
  }

  if (stats.avgNightResilience < 60) {
    recs.push(
      'Strengthen the endurance — velvet endures centuries of use; your code must persist through the longest night',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The darkness has lifted before velvet could form — weave deeper layers before dawn arrives',
    )
  }

  const voidFolds = folds.filter((f) => f.condition === 'void')
  if (voidFolds.length > 0 && voidFolds.length <= 5) {
    recs.push(
      `Re-examine these torn rags: ${voidFolds.map((f) => f.file).join(', ')}`,
    )
  } else if (voidFolds.length > 5) {
    recs.push(
      `Re-examine these ${voidFolds.length} torn rags before the fabric tears beyond repair`,
    )
  }

  const poorCurtains = curtains.filter(
    (c) => c.condition === 'void' || c.condition === 'ruin',
  )
  if (poorCurtains.length === curtains.length && curtains.length > 0) {
    recs.push(
      'All curtains have turned to ruin — the velvet theater needs a grand restoration',
    )
  }

  if (recs.length === 0) {
    recs.push('Your velvet folds drape with midnight elegance — each thread woven with the wisdom of a thousand nights')
  }

  return recs
}
