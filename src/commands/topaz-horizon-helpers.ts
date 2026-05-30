// ─── Interfaces ──────────────────────────────────────────

export interface WarmingMeasure {
  warmth: number
  glow: 'imperial-topaz' | 'golden-fire' | 'proper-warmth' | 'pale-yellow' | 'cold-stone' | 'no-warmth'
  hasHighWarmth: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasWelcoming: boolean
  hasNoApathetic: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasFriendly: boolean
  hasGentle: boolean
  hasKind: boolean
  hasInviting: boolean
  hasWarm: boolean
  hasCaring: boolean
  hasConsiderate: boolean
  hasEmpathetic: boolean
  hasComfortable: boolean
  hostileCount: number
  unhandledCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  light: 'golden-hour' | 'clear-twilight' | 'proper-light' | 'hazy-dusk' | 'pitch-dark' | 'no-clarity'
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
  hasRevealed: boolean
  hasIlluminated: boolean
  hasExposed: boolean
  hasObvious: boolean
  hasApparent: boolean
  crypticCount: number
  mysteryCount: number
}

export interface FocusingMeasure {
  precision: number
  beam: 'laser-focus' | 'sharp-ray' | 'proper-beam' | 'scattered-light' | 'diffuse-glow' | 'no-precision'
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
  hasFocused: boolean
  hasTargeted: boolean
  hasConcentrated: boolean
  hasDirected: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SpanningMeasure {
  endurance: number
  reach: 'infinite-horizon' | 'far-reach' | 'proper-span' | 'limited-view' | 'near-sight' | 'no-endurance'
  hasHighEndurance: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDurable: boolean
  hasLasting: boolean
  hasEnduring: boolean
  hasSustainable: boolean
  hasAdaptive: boolean
  hasFlexible: boolean
  hasExtensible: boolean
  hasExpandable: boolean
  hasScalable: boolean
  hasFutureProof: boolean
  hasLongLived: boolean
  fragileCount: number
  untestedCount: number
}

export interface TransitioningMeasure {
  wisdom: number
  twilight: 'golden-sage' | 'twilight-scholar' | 'proper-observer' | 'night-watcher' | 'lost-wanderer' | 'no-wisdom'
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
  hasTransitional: boolean
  hasWise: boolean
  hasSeasoned: boolean
  hackedCount: number
  shallowCount: number
}

export type TopazCondition =
  | 'topaz-masterpiece'
  | 'imperial-gem'
  | 'proper-topaz'
  | 'pale-stone'
  | 'rough-crystal'
  | 'void'

export interface TopazRay {
  file: string
  goldenWarmth: number
  sunsetClarity: number
  firePrecision: number
  horizonEndurance: number
  dawnWisdom: number
  warming: WarmingMeasure
  illuminating: IlluminatingMeasure
  focusing: FocusingMeasure
  spanning: SpanningMeasure
  transitioning: TransitioningMeasure
  condition: TopazCondition
  qualityScore: number
}

export type SkylineType =
  | 'golden-skyline'
  | 'warm-horizon'
  | 'proper-landscape'
  | 'flat-plain'
  | 'empty-sky'
  | 'no-skyline'

export type SkylineCondition =
  | 'topaz-palace'
  | 'golden-tower'
  | 'proper-temple'
  | 'stone-building'
  | 'wooden-hut'
  | 'void'

export interface TopazSkyline {
  directory: string
  rays: TopazRay[]
  avgWarmth: number
  avgPrecision: number
  avgWisdom: number
  topazMasterpieceCount: number
  voidCount: number
  skylineType: SkylineType
  condition: SkylineCondition
}

export type ObserverGrade = 'golden-master' | 'sunset-scholar' | 'proper-watcher' | 'amateur' | 'novice' | 'blind-folded'

export interface TopazHorizonResult {
  rays: TopazRay[]
  skylines: TopazSkyline[]
  sunset: {
    avgWarmth: number
    avgPrecision: number
    avgWisdom: number
    isTopaz: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalSkylines: number
    avgGoldenWarmth: number
    avgSunsetClarity: number
    avgFirePrecision: number
    avgHorizonEndurance: number
    avgDawnWisdom: number
    topazMasterpieceCount: number
    imperialGemCount: number
    properTopazCount: number
    paleStoneCount: number
    roughCrystalCount: number
    voidCount: number
    hasHighWarmthCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighEnduranceCount: number
    hasHighWisdomCount: number
    overallRadiance: number
    observerGrade: ObserverGrade
    bestRay: string
    warmest: string
    clearest: string
    mostPrecise: string
    mostEnduring: string
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

/** @example classifyTopazCondition(90) */
export function classifyTopazCondition(score: number): TopazCondition {
  if (score >= 90) return 'topaz-masterpiece'
  if (score >= 75) return 'imperial-gem'
  if (score >= 60) return 'proper-topaz'
  if (score >= 40) return 'pale-stone'
  if (score >= 20) return 'rough-crystal'
  return 'void'
}

/** @example classifySkylineType(rays) */
export function classifySkylineType(rays: TopazRay[]): SkylineType {
  if (rays.length === 0) return 'no-skyline'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 85) return 'golden-skyline'
  if (avg >= 70) return 'warm-horizon'
  if (avg >= 55) return 'proper-landscape'
  if (avg >= 35) return 'flat-plain'
  return 'empty-sky'
}

/** @example classifySkylineCondition(85) */
export function classifySkylineCondition(score: number): SkylineCondition {
  if (score >= 85) return 'topaz-palace'
  if (score >= 70) return 'golden-tower'
  if (score >= 55) return 'proper-temple'
  if (score >= 35) return 'stone-building'
  if (score >= 15) return 'wooden-hut'
  return 'void'
}

/** @example classifyObserverGrade(80) */
export function classifyObserverGrade(avgRadiance: number): ObserverGrade {
  if (avgRadiance >= 80) return 'golden-master'
  if (avgRadiance >= 65) return 'sunset-scholar'
  if (avgRadiance >= 50) return 'proper-watcher'
  if (avgRadiance >= 35) return 'amateur'
  if (avgRadiance >= 20) return 'novice'
  return 'blind-folded'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureWarming('export class X { readonly y: string }') */
export function measureWarming(content: string): WarmingMeasure {
  const hasApproachable = /\b(import|export)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|violent|harsh)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasWelcoming = /\b(class|interface|type)\b/.test(content)
  const hasNoApathetic = (content.match(/\b(apathetic|indifferent|uncaring)\b/gi) ?? []).length === 0
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasFriendly = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasGentle = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasKind = /\b(readonly|private|protected)\b/.test(content)
  const hasInviting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasWarm = !/\bany\b/.test(content)
  const hasCaring = /\b(function|=>|return)\b/.test(content)
  const hasConsiderate = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEmpathetic = /\b(if|return)\b/.test(content)
  const hasComfortable = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasApproachable, hasNoHostile, hasWelcoming, hasNoApathetic, hasErrorHandled,
    hasNoUnhandled, hasFriendly, hasGentle, hasKind, hasInviting,
    hasWarm, hasCaring, hasConsiderate, hasEmpathetic, hasComfortable,
  ]

  const warmth = computeScore(positiveBooleans)
  const hasHighWarmth = warmth >= 60

  let glow: WarmingMeasure['glow'] = 'no-warmth'
  if (warmth >= 90) glow = 'imperial-topaz'
  else if (warmth >= 75) glow = 'golden-fire'
  else if (warmth >= 60) glow = 'proper-warmth'
  else if (warmth >= 40) glow = 'pale-yellow'
  else if (warmth >= 20) glow = 'cold-stone'

  return {
    warmth, glow, hasHighWarmth,
    hasApproachable, hasNoHostile, hasWelcoming, hasNoApathetic, hasErrorHandled,
    hasNoUnhandled, hasFriendly, hasGentle, hasKind, hasInviting,
    hasWarm, hasCaring, hasConsiderate, hasEmpathetic, hasComfortable,
    hostileCount, unhandledCount,
  }
}

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(class|interface|type)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasIlluminated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasExposed = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasObvious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasApparent = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasIlluminated, hasExposed, hasObvious, hasApparent,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let light: IlluminatingMeasure['light'] = 'no-clarity'
  if (clarity >= 90) light = 'golden-hour'
  else if (clarity >= 75) light = 'clear-twilight'
  else if (clarity >= 60) light = 'proper-light'
  else if (clarity >= 40) light = 'hazy-dusk'
  else if (clarity >= 20) light = 'pitch-dark'

  return {
    clarity, light, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasIlluminated, hasExposed, hasObvious, hasApparent,
    crypticCount, mysteryCount,
  }
}

/** @example measureFocusing('export class X { readonly y: string }') */
export function measureFocusing(content: string): FocusingMeasure {
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
  const hasFocused = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTargeted = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasConcentrated = /\b(try|catch|if)\b/.test(content)
  const hasDirected = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasFocused, hasTargeted, hasConcentrated, hasDirected,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let beam: FocusingMeasure['beam'] = 'no-precision'
  if (precision >= 90) beam = 'laser-focus'
  else if (precision >= 75) beam = 'sharp-ray'
  else if (precision >= 60) beam = 'proper-beam'
  else if (precision >= 40) beam = 'scattered-light'
  else if (precision >= 20) beam = 'diffuse-glow'

  return {
    precision, beam, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasFocused, hasTargeted, hasConcentrated, hasDirected,
    unsafeCount, approximateCount,
  }
}

/** @example measureSpanning('export class X { readonly y: string }') */
export function measureSpanning(content: string): SpanningMeasure {
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|flimsy|delicate)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDurable = /\b(import|export)\b/.test(content)
  const hasLasting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = !/\bany\b/.test(content)
  const hasSustainable = /\b(readonly|private|protected)\b/.test(content)
  const hasAdaptive = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasFlexible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasExtensible = /\b(function|=>|return)\b/.test(content)
  const hasExpandable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasScalable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFutureProof = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasLongLived = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasMaintainable, hasNoFragile, hasTested, hasNoUntested, hasDurable,
    hasLasting, hasEnduring, hasSustainable, hasAdaptive, hasFlexible,
    hasExtensible, hasExpandable, hasScalable, hasFutureProof, hasLongLived,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let reach: SpanningMeasure['reach'] = 'no-endurance'
  if (endurance >= 90) reach = 'infinite-horizon'
  else if (endurance >= 75) reach = 'far-reach'
  else if (endurance >= 60) reach = 'proper-span'
  else if (endurance >= 40) reach = 'limited-view'
  else if (endurance >= 20) reach = 'near-sight'

  return {
    endurance, reach, hasHighEndurance,
    hasMaintainable, hasNoFragile, hasTested, hasNoUntested, hasDurable,
    hasLasting, hasEnduring, hasSustainable, hasAdaptive, hasFlexible,
    hasExtensible, hasExpandable, hasScalable, hasFutureProof, hasLongLived,
    fragileCount, untestedCount,
  }
}

/** @example measureTransitioning('export class X { readonly y: string }') */
export function measureTransitioning(content: string): TransitioningMeasure {
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
  const hasTransitional = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSeasoned = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTransitional, hasWise, hasSeasoned,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let twilight: TransitioningMeasure['twilight'] = 'no-wisdom'
  if (wisdom >= 90) twilight = 'golden-sage'
  else if (wisdom >= 75) twilight = 'twilight-scholar'
  else if (wisdom >= 60) twilight = 'proper-observer'
  else if (wisdom >= 40) twilight = 'night-watcher'
  else if (wisdom >= 20) twilight = 'lost-wanderer'

  return {
    wisdom, twilight, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTransitional, hasWise, hasSeasoned,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeTopazRay(content, 'app.ts') */
export function analyzeTopazRay(content: string, filePath: string): TopazRay {
  const warming = measureWarming(content)
  const illuminating = measureIlluminating(content)
  const focusing = measureFocusing(content)
  const spanning = measureSpanning(content)
  const transitioning = measureTransitioning(content)

  const goldenWarmth = warming.warmth
  const sunsetClarity = illuminating.clarity
  const firePrecision = focusing.precision
  const horizonEndurance = spanning.endurance
  const dawnWisdom = transitioning.wisdom

  const qualityScore = Math.round(
    goldenWarmth * 0.2 +
    sunsetClarity * 0.2 +
    firePrecision * 0.2 +
    horizonEndurance * 0.2 +
    dawnWisdom * 0.2,
  )

  const condition = classifyTopazCondition(qualityScore)

  return {
    file: filePath,
    goldenWarmth, sunsetClarity, firePrecision, horizonEndurance, dawnWisdom,
    warming, illuminating, focusing, spanning, transitioning,
    condition, qualityScore,
  }
}

/** @example analyzeTopazSkyline(rays, 'src') */
export function analyzeTopazSkyline(rays: TopazRay[], dirPath: string): TopazSkyline {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [],
      avgWarmth: 0, avgPrecision: 0, avgWisdom: 0,
      topazMasterpieceCount: 0, voidCount: 0,
      skylineType: 'no-skyline', condition: 'void',
    }
  }

  const avgWarmth = Math.round(rays.reduce((s, r) => s + r.goldenWarmth, 0) / rays.length)
  const avgPrecision = Math.round(rays.reduce((s, r) => s + r.firePrecision, 0) / rays.length)
  const avgWisdom = Math.round(rays.reduce((s, r) => s + r.dawnWisdom, 0) / rays.length)
  const topazMasterpieceCount = rays.filter((r) => r.condition === 'topaz-masterpiece').length
  const voidCount = rays.filter((r) => r.condition === 'void').length
  const skylineType = classifySkylineType(rays)
  const avgQuality = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const condition = classifySkylineCondition(avgQuality)

  return {
    directory: dirPath, rays,
    avgWarmth, avgPrecision, avgWisdom,
    topazMasterpieceCount, voidCount,
    skylineType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildTopazHorizonResult(['a.ts'], [content]) */
export async function buildTopazHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TopazHorizonResult> {
  const rays: TopazRay[] = files.map((file, i) =>
    analyzeTopazRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TopazRay[]>()
  for (const ray of rays) {
    const dir = ray.file.includes('/')
      ? ray.file.substring(0, ray.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const skylines: TopazSkyline[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeTopazSkyline(dirRays, dir),
  )

  const avgGoldenWarmth = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.goldenWarmth, 0) / rays.length) : 0
  const avgSunsetClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.sunsetClarity, 0) / rays.length) : 0
  const avgFirePrecision = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.firePrecision, 0) / rays.length) : 0
  const avgHorizonEndurance = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.horizonEndurance, 0) / rays.length) : 0
  const avgDawnWisdom = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.dawnWisdom, 0) / rays.length) : 0

  const overallRadiance = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length) : 0
  const isTopaz = overallRadiance >= 60

  const sunset: TopazHorizonResult['sunset'] = {
    avgWarmth: avgGoldenWarmth, avgPrecision: avgFirePrecision, avgWisdom: avgDawnWisdom,
    isTopaz, overallRadiance,
  }

  const topazMasterpieceCount = rays.filter((r) => r.condition === 'topaz-masterpiece').length
  const imperialGemCount = rays.filter((r) => r.condition === 'imperial-gem').length
  const properTopazCount = rays.filter((r) => r.condition === 'proper-topaz').length
  const paleStoneCount = rays.filter((r) => r.condition === 'pale-stone').length
  const roughCrystalCount = rays.filter((r) => r.condition === 'rough-crystal').length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighWarmthCount = rays.filter((r) => r.warming.hasHighWarmth).length
  const hasHighClarityCount = rays.filter((r) => r.illuminating.hasHighClarity).length
  const hasHighPrecisionCount = rays.filter((r) => r.focusing.hasHighPrecision).length
  const hasHighEnduranceCount = rays.filter((r) => r.spanning.hasHighEndurance).length
  const hasHighWisdomCount = rays.filter((r) => r.transitioning.hasHighWisdom).length

  const observerGrade = classifyObserverGrade(overallRadiance)

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file : ''
  const warmest = rays.length > 0
    ? rays.reduce((best, r) => (r.goldenWarmth > best.goldenWarmth ? r : best)).file : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => (r.sunsetClarity > best.sunsetClarity ? r : best)).file : ''
  const mostPrecise = rays.length > 0
    ? rays.reduce((best, r) => (r.firePrecision > best.firePrecision ? r : best)).file : ''
  const mostEnduring = rays.length > 0
    ? rays.reduce((best, r) => (r.horizonEndurance > best.horizonEndurance ? r : best)).file : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => (r.dawnWisdom > best.dawnWisdom ? r : best)).file : ''

  const stats: TopazHorizonResult['stats'] = {
    totalFiles: files.length, totalSkylines: skylines.length,
    avgGoldenWarmth, avgSunsetClarity, avgFirePrecision, avgHorizonEndurance, avgDawnWisdom,
    topazMasterpieceCount, imperialGemCount, properTopazCount, paleStoneCount, roughCrystalCount, voidCount,
    hasHighWarmthCount, hasHighClarityCount, hasHighPrecisionCount, hasHighEnduranceCount, hasHighWisdomCount,
    overallRadiance, observerGrade,
    bestRay, warmest, clearest, mostPrecise, mostEnduring, wisest,
  }

  const recommendations = generateRecommendations(rays, skylines, sunset, stats)

  return {
    rays, skylines, sunset, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, skylines, sunset, stats) */
export function generateRecommendations(
  rays: TopazRay[],
  skylines: TopazSkyline[],
  _sunset: TopazHorizonResult['sunset'],
  stats: TopazHorizonResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGoldenWarmth >= 90 &&
    stats.avgSunsetClarity >= 90 &&
    stats.avgFirePrecision >= 90 &&
    stats.avgHorizonEndurance >= 90 &&
    stats.avgDawnWisdom >= 90
  ) {
    recs.push(
      'Your topaz horizon blazes with imperial radiance! Golden warmth is imperial-topaz, sunset clarity is golden-hour, fire precision is laser-focus, horizon endurance is infinite-horizon, and dawn wisdom is golden-sage!',
    )
    return recs
  }

  if (stats.avgGoldenWarmth < 60) {
    recs.push(
      'Warm the golden glow — code must invite and welcome; add friendly error handling, eliminate hostile patterns, and make every function approachable'
    )
  }

  if (stats.avgSunsetClarity < 60) {
    recs.push(
      'Brighten sunset clarity — the golden hour must illuminate everything; remove cryptic patterns, eliminate mystery code, and reveal every intent in warm light'
    )
  }

  if (stats.avgFirePrecision < 60) {
    recs.push(
      'Focus fire precision — every ray must be exact; tighten types, eliminate unsafe patterns, and concentrate with laser-like accuracy'
    )
  }

  if (stats.avgHorizonEndurance < 60) {
    recs.push(
      'Extend horizon endurance — the view must stretch to infinity; add tests, eliminate fragile code, and build with sustainable, future-proof design'
    )
  }

  if (stats.avgDawnWisdom < 60) {
    recs.push(
      'Deepen dawn wisdom — transitions must carry understanding; build with principled architecture, proven patterns, and the wisdom of seasoned code'
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The topaz horizon is fading — rough crystals and pale stones outnumber the gems, and the skyline is empty'
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(`Polish these rough crystals: ${voidRays.map((r) => r.file).join(', ')}`)
  } else if (voidRays.length > 5) {
    recs.push(`Polish ${voidRays.length} rough crystals before the horizon fades entirely`)
  }

  const poorSkylines = skylines.filter((s) => s.condition === 'void' || s.condition === 'wooden-hut')
  if (poorSkylines.length === skylines.length && skylines.length > 0) {
    recs.push('All skyline sections are wooden huts — the topaz horizon needs topaz-palace quality rays throughout')
  }

  if (recs.length === 0) {
    recs.push('Your topaz horizon radiates warmth — every ray carries golden warmth, sunset clarity, fire precision, horizon endurance, and dawn wisdom')
  }

  return recs
}
