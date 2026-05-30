// ─── Interfaces ──────────────────────────────────────────

export interface TransformingMeasure {
  rebirth: number
  flame: 'supernova-rebirth' | 'phoenix-rising' | 'proper-renewal' | 'flickering-ember' | 'cold-ash' | 'no-rebirth'
  hasHighRebirth: boolean
  hasRefactored: boolean
  hasNoDuplicated: boolean
  hasImproved: boolean
  hasNoStagnant: boolean
  hasEvolved: boolean
  hasNoStatic: boolean
  hasRenewed: boolean
  hasTransformed: boolean
  hasRegenerated: boolean
  hasReborn: boolean
  hasRevived: boolean
  hasRejuvenated: boolean
  hasRefreshed: boolean
  hasCleansed: boolean
  duplicatedCount: number
  stagnantCount: number
}

export interface RefiningMeasure {
  precision: number
  ash: 'phoenix-ash' | 'refined-residue' | 'proper-cinder' | 'smoldering-coal' | 'raw-ore' | 'no-precision'
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
  hasPure: boolean
  hasRefined: boolean
  hasDistilled: boolean
  hasConcentrated: boolean
  unsafeCount: number
  approximateCount: number
}

export interface EnduringMeasure {
  resilience: number
  shadow: 'void-walker' | 'dark-survivor' | 'proper-endurance' | 'fading-light' | 'extinguished' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasHardened: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasTough: boolean
  hasUnbreakable: boolean
  hasIndomitable: boolean
  hasUnconquerable: boolean
  unhandledCount: number
  untestedCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  light: 'phoenix-flare' | 'bright-ember' | 'proper-glow' | 'smoky-light' | 'darkness' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasOpen: boolean
  hasDirect: boolean
  hasObvious: boolean
  hasEvident: boolean
  crypticCount: number
  mysteryCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  cycle: 'eternal-phoenix' | 'cycle-master' | 'proper-renewer' | 'one-time-spark' | 'dying-ember' | 'no-wisdom'
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
  hasCyclical: boolean
  hasWise: boolean
  hasTransformative: boolean
  hackedCount: number
  shallowCount: number
}

export type OnyxCondition =
  | 'onyx-masterpiece'
  | 'phoenix-gem'
  | 'proper-onyx'
  | 'burnt-stone'
  | 'cold-ember'
  | 'void'

export interface OnyxFeather {
  file: string
  obsidianRebirth: number
  ashPrecision: number
  darkResilience: number
  fireClarity: number
  phoenixWisdom: number
  transforming: TransformingMeasure
  refining: RefiningMeasure
  enduring: EnduringMeasure
  illuminating: IlluminatingMeasure
  understanding: UnderstandingMeasure
  condition: OnyxCondition
  qualityScore: number
}

export type NestType =
  | 'phoenix-nest'
  | 'ash-pyre'
  | 'proper-roost'
  | 'branch-perch'
  | 'empty-ground'
  | 'no-nest'

export type NestCondition =
  | 'onyx-palace'
  | 'dark-spire'
  | 'proper-tower'
  | 'stone-ruin'
  | 'empty-hearth'
  | 'void'

export type FirebirdGrade = 'immortal-phoenix' | 'rising-firebird' | 'proper-fledgling' | 'nestling' | 'egg' | 'ash'

export interface OnyxNest {
  directory: string
  feathers: OnyxFeather[]
  avgRebirth: number
  avgPrecision: number
  avgWisdom: number
  onyxMasterpieceCount: number
  voidCount: number
  nestType: NestType
  condition: NestCondition
}

export interface OnyxPhoenixResult {
  feathers: OnyxFeather[]
  nests: OnyxNest[]
  pyre: {
    avgRebirth: number
    avgPrecision: number
    avgWisdom: number
    isOnyx: boolean
    overallRebirth: number
  }
  stats: {
    totalFiles: number
    totalNests: number
    avgObsidianRebirth: number
    avgAshPrecision: number
    avgDarkResilience: number
    avgFireClarity: number
    avgPhoenixWisdom: number
    onyxMasterpieceCount: number
    phoenixGemCount: number
    properOnyxCount: number
    burntStoneCount: number
    coldEmberCount: number
    voidCount: number
    hasHighRebirthCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallRebirth: number
    firebirdGrade: FirebirdGrade
    bestFeather: string
    mostTransformed: string
    mostPrecise: string
    mostResilient: string
    clearest: string
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

/** @example classifyOnyxCondition(90) */
export function classifyOnyxCondition(score: number): OnyxCondition {
  if (score >= 90) return 'onyx-masterpiece'
  if (score >= 75) return 'phoenix-gem'
  if (score >= 60) return 'proper-onyx'
  if (score >= 40) return 'burnt-stone'
  if (score >= 20) return 'cold-ember'
  return 'void'
}

/** @example classifyNestType(feathers) */
export function classifyNestType(feathers: OnyxFeather[]): NestType {
  if (feathers.length === 0) return 'no-nest'
  const avg = feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length
  if (avg >= 85) return 'phoenix-nest'
  if (avg >= 70) return 'ash-pyre'
  if (avg >= 55) return 'proper-roost'
  if (avg >= 35) return 'branch-perch'
  return 'empty-ground'
}

/** @example classifyNestCondition(85) */
export function classifyNestCondition(score: number): NestCondition {
  if (score >= 85) return 'onyx-palace'
  if (score >= 70) return 'dark-spire'
  if (score >= 55) return 'proper-tower'
  if (score >= 35) return 'stone-ruin'
  if (score >= 15) return 'empty-hearth'
  return 'void'
}

/** @example classifyFirebirdGrade(80) */
export function classifyFirebirdGrade(avgRebirth: number): FirebirdGrade {
  if (avgRebirth >= 80) return 'immortal-phoenix'
  if (avgRebirth >= 65) return 'rising-firebird'
  if (avgRebirth >= 50) return 'proper-fledgling'
  if (avgRebirth >= 35) return 'nestling'
  if (avgRebirth >= 20) return 'egg'
  return 'ash'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureTransforming('export class X { readonly y: string }') */
export function measureTransforming(content: string): TransformingMeasure {
  const hasRefactored = /\b(class|interface|type)\b/.test(content)
  const duplicatedCount = (content.match(/\b(copy|paste|duplicate|clone|replica)\b/gi) ?? []).length
  const hasNoDuplicated = duplicatedCount === 0
  const hasImproved = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|stale|rotten|decay|decompose)\b/gi) ?? []).length
  const hasNoStagnant = stagnantCount === 0
  const hasEvolved = /\b(import|export)\b/.test(content)
  const hasNoStatic = !/\bany\b/.test(content)
  const hasRenewed = /\b(readonly|private|protected)\b/.test(content)
  const hasTransformed = /\b(async|await|Promise)\b/.test(content)
  const hasRegenerated = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReborn = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevived = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasRejuvenated = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasRefreshed = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCleansed = (content.match(/\b(dead|unused|obsolete|deprecated)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasRefactored, hasNoDuplicated, hasImproved, hasNoStagnant, hasEvolved,
    hasNoStatic, hasRenewed, hasTransformed, hasRegenerated, hasReborn,
    hasRevived, hasRejuvenated, hasRefreshed, hasCleansed,
  ]

  const rebirth = computeScore(positiveBooleans)
  const hasHighRebirth = rebirth >= 60

  let flame: TransformingMeasure['flame'] = 'no-rebirth'
  if (rebirth >= 90) flame = 'supernova-rebirth'
  else if (rebirth >= 75) flame = 'phoenix-rising'
  else if (rebirth >= 60) flame = 'proper-renewal'
  else if (rebirth >= 40) flame = 'flickering-ember'
  else if (rebirth >= 20) flame = 'cold-ash'

  return {
    rebirth, flame, hasHighRebirth,
    hasRefactored, hasNoDuplicated, hasImproved, hasNoStagnant, hasEvolved,
    hasNoStatic, hasRenewed, hasTransformed, hasRegenerated, hasReborn,
    hasRevived, hasRejuvenated, hasRefreshed, hasCleansed,
    duplicatedCount, stagnantCount,
  }
}

/** @example measureRefining('export class X { readonly y: string }') */
export function measureRefining(content: string): RefiningMeasure {
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
  const hasPure = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasRefined = /\b(async|await|Promise)\b/.test(content)
  const hasDistilled = /\b(try|catch|if)\b/.test(content)
  const hasConcentrated = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasPure, hasRefined, hasDistilled, hasConcentrated,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let ash: RefiningMeasure['ash'] = 'no-precision'
  if (precision >= 90) ash = 'phoenix-ash'
  else if (precision >= 75) ash = 'refined-residue'
  else if (precision >= 60) ash = 'proper-cinder'
  else if (precision >= 40) ash = 'smoldering-coal'
  else if (precision >= 20) ash = 'raw-ore'

  return {
    precision, ash, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasPure, hasRefined, hasDistilled, hasConcentrated,
    unsafeCount, approximateCount,
  }
}

/** @example measureEnduring('export class X { readonly y: string }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(import|export)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasDurable = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTough = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUnbreakable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasIndomitable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnconquerable = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasDurable, hasEnduring,
    hasTough, hasUnbreakable, hasIndomitable, hasUnconquerable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shadow: EnduringMeasure['shadow'] = 'no-resilience'
  if (resilience >= 90) shadow = 'void-walker'
  else if (resilience >= 75) shadow = 'dark-survivor'
  else if (resilience >= 60) shadow = 'proper-endurance'
  else if (resilience >= 40) shadow = 'fading-light'
  else if (resilience >= 20) shadow = 'extinguished'

  return {
    resilience, shadow, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasDurable, hasEnduring,
    hasTough, hasUnbreakable, hasIndomitable, hasUnconquerable,
    unhandledCount, untestedCount,
  }
}

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
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
  const hasRevealed = /\b(function|=>|return)\b/.test(content)
  const hasExposed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOpen = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDirect = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasObvious = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEvident = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasRevealed, hasExposed,
    hasOpen, hasDirect, hasObvious, hasEvident,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let light: IlluminatingMeasure['light'] = 'no-clarity'
  if (clarity >= 90) light = 'phoenix-flare'
  else if (clarity >= 75) light = 'bright-ember'
  else if (clarity >= 60) light = 'proper-glow'
  else if (clarity >= 40) light = 'smoky-light'
  else if (clarity >= 20) light = 'darkness'

  return {
    clarity, light, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasRevealed, hasExposed,
    hasOpen, hasDirect, hasObvious, hasEvident,
    crypticCount, mysteryCount,
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
  const hasCyclical = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasTransformative = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCyclical, hasWise, hasTransformative,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cycle: UnderstandingMeasure['cycle'] = 'no-wisdom'
  if (wisdom >= 90) cycle = 'eternal-phoenix'
  else if (wisdom >= 75) cycle = 'cycle-master'
  else if (wisdom >= 60) cycle = 'proper-renewer'
  else if (wisdom >= 40) cycle = 'one-time-spark'
  else if (wisdom >= 20) cycle = 'dying-ember'

  return {
    wisdom, cycle, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCyclical, hasWise, hasTransformative,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeOnyxFeather(content, 'app.ts') */
export function analyzeOnyxFeather(content: string, filePath: string): OnyxFeather {
  const transforming = measureTransforming(content)
  const refining = measureRefining(content)
  const enduring = measureEnduring(content)
  const illuminating = measureIlluminating(content)
  const understanding = measureUnderstanding(content)

  const obsidianRebirth = transforming.rebirth
  const ashPrecision = refining.precision
  const darkResilience = enduring.resilience
  const fireClarity = illuminating.clarity
  const phoenixWisdom = understanding.wisdom

  const qualityScore = Math.round(
    obsidianRebirth * 0.2 +
    ashPrecision * 0.2 +
    darkResilience * 0.2 +
    fireClarity * 0.2 +
    phoenixWisdom * 0.2,
  )

  const condition = classifyOnyxCondition(qualityScore)

  return {
    file: filePath,
    obsidianRebirth, ashPrecision, darkResilience, fireClarity, phoenixWisdom,
    transforming, refining, enduring, illuminating, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeOnyxNest(feathers, 'src') */
export function analyzeOnyxNest(feathers: OnyxFeather[], dirPath: string): OnyxNest {
  if (feathers.length === 0) {
    return {
      directory: dirPath, feathers: [],
      avgRebirth: 0, avgPrecision: 0, avgWisdom: 0,
      onyxMasterpieceCount: 0, voidCount: 0,
      nestType: 'no-nest', condition: 'void',
    }
  }

  const avgRebirth = Math.round(feathers.reduce((s, f) => s + f.obsidianRebirth, 0) / feathers.length)
  const avgPrecision = Math.round(feathers.reduce((s, f) => s + f.ashPrecision, 0) / feathers.length)
  const avgWisdom = Math.round(feathers.reduce((s, f) => s + f.phoenixWisdom, 0) / feathers.length)
  const onyxMasterpieceCount = feathers.filter((f) => f.condition === 'onyx-masterpiece').length
  const voidCount = feathers.filter((f) => f.condition === 'void').length
  const nestType = classifyNestType(feathers)
  const avgQuality = Math.round(feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length)
  const condition = classifyNestCondition(avgQuality)

  return {
    directory: dirPath, feathers,
    avgRebirth, avgPrecision, avgWisdom,
    onyxMasterpieceCount, voidCount,
    nestType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOnyxPhoenixResult(['a.ts'], [content]) */
export async function buildOnyxPhoenixResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OnyxPhoenixResult> {
  const feathers: OnyxFeather[] = files.map((file, i) =>
    analyzeOnyxFeather(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OnyxFeather[]>()
  for (const feather of feathers) {
    const dir = feather.file.includes('/')
      ? feather.file.substring(0, feather.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(feather)
    } else {
      dirMap.set(dir, [feather])
    }
  }

  const nests: OnyxNest[] = Array.from(dirMap.entries()).map(([dir, dirFeathers]) =>
    analyzeOnyxNest(dirFeathers, dir),
  )

  const avgObsidianRebirth = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.obsidianRebirth, 0) / feathers.length) : 0
  const avgAshPrecision = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.ashPrecision, 0) / feathers.length) : 0
  const avgDarkResilience = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.darkResilience, 0) / feathers.length) : 0
  const avgFireClarity = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.fireClarity, 0) / feathers.length) : 0
  const avgPhoenixWisdom = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.phoenixWisdom, 0) / feathers.length) : 0

  const overallRebirth = feathers.length > 0
    ? Math.round(feathers.reduce((s, f) => s + f.qualityScore, 0) / feathers.length) : 0
  const isOnyx = overallRebirth >= 60

  const pyre: OnyxPhoenixResult['pyre'] = {
    avgRebirth: avgObsidianRebirth, avgPrecision: avgAshPrecision, avgWisdom: avgPhoenixWisdom,
    isOnyx, overallRebirth,
  }

  const onyxMasterpieceCount = feathers.filter((f) => f.condition === 'onyx-masterpiece').length
  const phoenixGemCount = feathers.filter((f) => f.condition === 'phoenix-gem').length
  const properOnyxCount = feathers.filter((f) => f.condition === 'proper-onyx').length
  const burntStoneCount = feathers.filter((f) => f.condition === 'burnt-stone').length
  const coldEmberCount = feathers.filter((f) => f.condition === 'cold-ember').length
  const voidCount = feathers.filter((f) => f.condition === 'void').length

  const hasHighRebirthCount = feathers.filter((f) => f.transforming.hasHighRebirth).length
  const hasHighPrecisionCount = feathers.filter((f) => f.refining.hasHighPrecision).length
  const hasHighResilienceCount = feathers.filter((f) => f.enduring.hasHighResilience).length
  const hasHighClarityCount = feathers.filter((f) => f.illuminating.hasHighClarity).length
  const hasHighWisdomCount = feathers.filter((f) => f.understanding.hasHighWisdom).length

  const firebirdGrade = classifyFirebirdGrade(overallRebirth)

  const bestFeather = feathers.length > 0
    ? feathers.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file : ''
  const mostTransformed = feathers.length > 0
    ? feathers.reduce((best, f) => (f.obsidianRebirth > best.obsidianRebirth ? f : best)).file : ''
  const mostPrecise = feathers.length > 0
    ? feathers.reduce((best, f) => (f.ashPrecision > best.ashPrecision ? f : best)).file : ''
  const mostResilient = feathers.length > 0
    ? feathers.reduce((best, f) => (f.darkResilience > best.darkResilience ? f : best)).file : ''
  const clearest = feathers.length > 0
    ? feathers.reduce((best, f) => (f.fireClarity > best.fireClarity ? f : best)).file : ''
  const wisest = feathers.length > 0
    ? feathers.reduce((best, f) => (f.phoenixWisdom > best.phoenixWisdom ? f : best)).file : ''

  const stats: OnyxPhoenixResult['stats'] = {
    totalFiles: files.length, totalNests: nests.length,
    avgObsidianRebirth, avgAshPrecision, avgDarkResilience, avgFireClarity, avgPhoenixWisdom,
    onyxMasterpieceCount, phoenixGemCount, properOnyxCount, burntStoneCount, coldEmberCount, voidCount,
    hasHighRebirthCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighClarityCount, hasHighWisdomCount,
    overallRebirth, firebirdGrade,
    bestFeather, mostTransformed, mostPrecise, mostResilient, clearest, wisest,
  }

  const recommendations = generateRecommendations(feathers, nests, pyre, stats)

  return {
    feathers, nests, pyre, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(feathers, nests, pyre, stats) */
export function generateRecommendations(
  feathers: OnyxFeather[],
  nests: OnyxNest[],
  _pyre: OnyxPhoenixResult['pyre'],
  stats: OnyxPhoenixResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgObsidianRebirth >= 90 &&
    stats.avgAshPrecision >= 90 &&
    stats.avgDarkResilience >= 90 &&
    stats.avgFireClarity >= 90 &&
    stats.avgPhoenixWisdom >= 90
  ) {
    recs.push(
      'Your onyx phoenix has achieved immortality! Obsidian rebirth is supernova-rebirth, ash precision is phoenix-ash, dark resilience is void-walker, fire clarity is phoenix-flare, and phoenix wisdom is eternal-phoenix!',
    )
    return recs
  }

  if (stats.avgObsidianRebirth < 60) {
    recs.push(
      'Ignite obsidian rebirth — the phoenix must rise from its own ashes; refactor duplicated code, eliminate stagnant patterns, and achieve supernova-rebirth transformation',
    )
  }

  if (stats.avgAshPrecision < 60) {
    recs.push(
      'Refine ash precision — every grain of ash must be measured with exact fidelity; tighten types, eliminate unsafe patterns, and achieve phoenix-ash precision',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Strengthen dark resilience — the onyx must endure the darkest nights; add error handling, build defensive patterns, and achieve void-walker resilience',
    )
  }

  if (stats.avgFireClarity < 60) {
    recs.push(
      'Illuminate fire clarity — the phoenix flame must light the way through darkness; improve readability, eliminate cryptic code, and achieve phoenix-flare clarity',
    )
  }

  if (stats.avgPhoenixWisdom < 60) {
    recs.push(
      'Deepen phoenix wisdom — the bird must understand the eternal cycles of destruction and renewal; build with principled architecture and achieve eternal-phoenix wisdom',
    )
  }

  if (stats.overallRebirth < 40) {
    recs.push(
      'The phoenix has not yet risen — cold embers and burnt stones outnumber the onyx masterpieces, and the pyre grows cold',
    )
  }

  const voidFeathers = feathers.filter((f) => f.condition === 'void')
  if (voidFeathers.length > 0 && voidFeathers.length <= 5) {
    recs.push(`Remove these cold embers from the pyre: ${voidFeathers.map((f) => f.file).join(', ')}`)
  } else if (voidFeathers.length > 5) {
    recs.push(`Remove ${voidFeathers.length} cold embers from the pyre before they extinguish the flame`)
  }

  const poorNests = nests.filter((n) => n.condition === 'void' || n.condition === 'empty-hearth')
  if (poorNests.length === nests.length && nests.length > 0) {
    recs.push('All nests are empty hearths — the onyx phoenix needs onyx-palace quality feathers throughout')
  }

  if (recs.length === 0) {
    recs.push('Your onyx phoenix blazes with dark fire — every feather carries obsidian rebirth, ash precision, dark resilience, fire clarity, and phoenix wisdom')
  }

  return recs
}
