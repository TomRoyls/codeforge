// ─── Interfaces ──────────────────────────────────────────

export interface AdaptingMeasure {
  clarity: number
  shift: 'dramatic-change' | 'clear-shift' | 'proper-adaptation' | 'subtle-hint' | 'no-change' | 'no-clarity'
  hasHighClarity: boolean
  hasAdaptable: boolean
  hasNoRigid: boolean
  hasContextAware: boolean
  hasNoHardcoded: boolean
  hasFlexible: boolean
  hasNoInflexible: boolean
  hasVersatile: boolean
  hasDynamic: boolean
  hasMultiContext: boolean
  hasResponsive: boolean
  hasReactive: boolean
  hasAdjustable: boolean
  hasConfigurable: boolean
  hasParameterized: boolean
  hasPluggable: boolean
  rigidCount: number
  hardcodedCount: number
}

export interface TransitioningMeasure {
  precision: number
  phase: 'perfect-twilight' | 'smooth-transition' | 'proper-shift' | 'abrupt-change' | 'broken-switch' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasCorrect: boolean
  hasPrecise: boolean
  hasDefined: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasControlled: boolean
  hasGraceful: boolean
  hasSeamless: boolean
  hasSmooth: boolean
  unsafeCount: number
  approximateCount: number
}

export interface DualSurvivingMeasure {
  resilience: number
  armor: 'double-plated' | 'dual-shield' | 'proper-defense' | 'single-layer' | 'no-armor' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasReliable: boolean
  hasConsistent: boolean
  hasDependable: boolean
  hasTrustworthy: boolean
  hasSolid: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  gem: 'imperial-alexandrite' | 'fine-chrysoberyl' | 'proper-gem' | 'common-stone' | 'glass-imposter' | 'no-wisdom'
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
  hasNuanced: boolean
  hasWise: boolean
  hasDiscerning: boolean
  hackedCount: number
  shallowCount: number
}

export interface TransformingMeasure {
  mastery: number
  art: 'master-illusionist' | 'skilled-shapeshifter' | 'proper-adaptor' | 'reluctant-changer' | 'frozen-statue' | 'no-mastery'
  hasHighMastery: boolean
  hasWellStructured: boolean
  hasNoSpaghetti: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasEvolved: boolean
  hasNoStagnant: boolean
  hasRefactored: boolean
  hasImproved: boolean
  hasOptimized: boolean
  hasModernized: boolean
  hasUpgraded: boolean
  hasEnhanced: boolean
  hasPerfected: boolean
  hasRevolutionized: boolean
  spaghettiCount: number
  monolithicCount: number
}

export type AlexandriteCondition =
  | 'alexandrite-masterpiece'
  | 'imperial-gem'
  | 'proper-alexandrite'
  | 'common-chrysoberyl'
  | 'glass-stone'
  | 'void'

export interface AlexandriteShift {
  file: string
  colorShiftClarity: number
  twilightPrecision: number
  dualNatureResilience: number
  chrysoberylWisdom: number
  transformationMastery: number
  adapting: AdaptingMeasure
  transitioning: TransitioningMeasure
  dualSurviving: DualSurvivingMeasure
  understanding: UnderstandingMeasure
  transforming: TransformingMeasure
  condition: AlexandriteCondition
  qualityScore: number
}

export type PairType =
  | 'perfect-pair'
  | 'dual-collection'
  | 'proper-set'
  | 'single-stone'
  | 'empty-case'
  | 'no-pair'

export type PairCondition =
  | 'alexandrite-palace'
  | 'dual-vault'
  | 'proper-chamber'
  | 'stone-room'
  | 'empty-box'
  | 'void'

export type GemologistGrade = 'imperial-gemologist' | 'color-change-expert' | 'proper-appraiser' | 'apprentice' | 'novice' | 'blind-buyer'

export interface AlexandritePair {
  directory: string
  shifts: AlexandriteShift[]
  avgClarity: number
  avgResilience: number
  avgWisdom: number
  alexandriteMasterpieceCount: number
  voidCount: number
  pairType: PairType
  condition: PairCondition
}

export interface AlexandriteDuskResult {
  shifts: AlexandriteShift[]
  pairs: AlexandritePair[]
  twilight: {
    avgClarity: number
    avgResilience: number
    avgWisdom: number
    isAlexandrite: boolean
    overallTransformation: number
  }
  stats: {
    totalFiles: number
    totalPairs: number
    avgColorShiftClarity: number
    avgTwilightPrecision: number
    avgDualNatureResilience: number
    avgChrysoberylWisdom: number
    avgTransformationMastery: number
    alexandriteMasterpieceCount: number
    imperialGemCount: number
    properAlexandriteCount: number
    commonChrysoberylCount: number
    glassStoneCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    hasHighMasteryCount: number
    overallTransformation: number
    gemologistGrade: GemologistGrade
    bestShift: string
    mostAdaptive: string
    mostPrecise: string
    mostResilient: string
    wisest: string
    mostTransformative: string
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

/** @example classifyAlexandriteCondition(90) */
export function classifyAlexandriteCondition(score: number): AlexandriteCondition {
  if (score >= 90) return 'alexandrite-masterpiece'
  if (score >= 75) return 'imperial-gem'
  if (score >= 60) return 'proper-alexandrite'
  if (score >= 40) return 'common-chrysoberyl'
  if (score >= 20) return 'glass-stone'
  return 'void'
}

/** @example classifyPairType(shifts) */
export function classifyPairType(shifts: AlexandriteShift[]): PairType {
  if (shifts.length === 0) return 'no-pair'
  const avg = shifts.reduce((s, sh) => s + sh.qualityScore, 0) / shifts.length
  if (avg >= 85) return 'perfect-pair'
  if (avg >= 70) return 'dual-collection'
  if (avg >= 55) return 'proper-set'
  if (avg >= 35) return 'single-stone'
  return 'empty-case'
}

/** @example classifyPairCondition(85) */
export function classifyPairCondition(score: number): PairCondition {
  if (score >= 85) return 'alexandrite-palace'
  if (score >= 70) return 'dual-vault'
  if (score >= 55) return 'proper-chamber'
  if (score >= 35) return 'stone-room'
  if (score >= 15) return 'empty-box'
  return 'void'
}

/** @example classifyGemologistGrade(80) */
export function classifyGemologistGrade(avgTransformation: number): GemologistGrade {
  if (avgTransformation >= 80) return 'imperial-gemologist'
  if (avgTransformation >= 65) return 'color-change-expert'
  if (avgTransformation >= 50) return 'proper-appraiser'
  if (avgTransformation >= 35) return 'apprentice'
  if (avgTransformation >= 20) return 'novice'
  return 'blind-buyer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureAdapting('export class X { readonly y: string }') */
export function measureAdapting(content: string): AdaptingMeasure {
  const hasAdaptable = /\b(class|interface|type)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|static|fixed)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasContextAware = /\b(import|export)\b/.test(content)
  const hardcodedCount = (content.match(/\b(hardcoded|hard-coded|hard.coded|baked.in)\b/gi) ?? []).length
  const hasNoHardcoded = hardcodedCount === 0
  const hasFlexible = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoInflexible = !/\bany\b/.test(content)
  const hasVersatile = /\b(readonly|private|protected)\b/.test(content)
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const hasMultiContext = /\b(function|=>|return)\b/.test(content)
  const hasResponsive = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReactive = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasAdjustable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasConfigurable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasParameterized = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPluggable = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasAdaptable, hasNoRigid, hasContextAware, hasNoHardcoded, hasFlexible,
    hasNoInflexible, hasVersatile, hasDynamic, hasMultiContext, hasResponsive,
    hasReactive, hasAdjustable, hasConfigurable, hasParameterized, hasPluggable,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let shift: AdaptingMeasure['shift'] = 'no-clarity'
  if (clarity >= 90) shift = 'dramatic-change'
  else if (clarity >= 75) shift = 'clear-shift'
  else if (clarity >= 60) shift = 'proper-adaptation'
  else if (clarity >= 40) shift = 'subtle-hint'
  else if (clarity >= 20) shift = 'no-change'

  return {
    clarity, shift, hasHighClarity,
    hasAdaptable, hasNoRigid, hasContextAware, hasNoHardcoded, hasFlexible,
    hasNoInflexible, hasVersatile, hasDynamic, hasMultiContext, hasResponsive,
    hasReactive, hasAdjustable, hasConfigurable, hasParameterized, hasPluggable,
    rigidCount, hardcodedCount,
  }
}

/** @example measureTransitioning('export class X { readonly y: string }') */
export function measureTransitioning(content: string): TransitioningMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|imprecise|loose|sloppy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasDefined = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCrisp = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasControlled = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasGraceful = /\b(async|await|Promise)\b/.test(content)
  const hasSeamless = /\b(function|=>|return)\b/.test(content)
  const hasSmooth = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasCorrect, hasPrecise, hasDefined, hasSharp,
    hasCrisp, hasControlled, hasGraceful, hasSeamless, hasSmooth,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let phase: TransitioningMeasure['phase'] = 'no-precision'
  if (precision >= 90) phase = 'perfect-twilight'
  else if (precision >= 75) phase = 'smooth-transition'
  else if (precision >= 60) phase = 'proper-shift'
  else if (precision >= 40) phase = 'abrupt-change'
  else if (precision >= 20) phase = 'broken-switch'

  return {
    precision, phase, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasCorrect, hasPrecise, hasDefined, hasSharp,
    hasCrisp, hasControlled, hasGraceful, hasSeamless, hasSmooth,
    unsafeCount, approximateCount,
  }
}

/** @example measureDualSurviving('export class X { readonly y: string }') */
export function measureDualSurviving(content: string): DualSurvivingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(import|export)\b/.test(content)
  const hasDurable = !/\bany\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReliable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasConsistent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDependable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasTrustworthy = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSolid = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasHardened, hasEnduring,
    hasReliable, hasConsistent, hasDependable, hasTrustworthy, hasSolid,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let armor: DualSurvivingMeasure['armor'] = 'no-resilience'
  if (resilience >= 90) armor = 'double-plated'
  else if (resilience >= 75) armor = 'dual-shield'
  else if (resilience >= 60) armor = 'proper-defense'
  else if (resilience >= 40) armor = 'single-layer'
  else if (resilience >= 20) armor = 'no-armor'

  return {
    resilience, armor, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasHardened, hasEnduring,
    hasReliable, hasConsistent, hasDependable, hasTrustworthy, hasSolid,
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
  const hasNuanced = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasDiscerning = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasNuanced, hasWise, hasDiscerning,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let gem: UnderstandingMeasure['gem'] = 'no-wisdom'
  if (wisdom >= 90) gem = 'imperial-alexandrite'
  else if (wisdom >= 75) gem = 'fine-chrysoberyl'
  else if (wisdom >= 60) gem = 'proper-gem'
  else if (wisdom >= 40) gem = 'common-stone'
  else if (wisdom >= 20) gem = 'glass-imposter'

  return {
    wisdom, gem, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasNuanced, hasWise, hasDiscerning,
    hackedCount, shallowCount,
  }
}

/** @example measureTransforming('export class X { readonly y: string }') */
export function measureTransforming(content: string): TransformingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|tangled|twisted|knotted)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasEvolved = !/\bany\b/.test(content)
  const hasNoStagnant = (content.match(/\b(stagnant|dormant|fossilized|petrified)\b/gi) ?? []).length === 0
  const hasRefactored = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImproved = /\b(readonly|private|protected)\b/.test(content)
  const hasOptimized = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasModernized = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUpgraded = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEnhanced = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPerfected = /\b(async|await|Promise)\b/.test(content)
  const hasRevolutionized = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasEvolved,
    hasNoStagnant, hasRefactored, hasImproved, hasOptimized, hasModernized,
    hasUpgraded, hasEnhanced, hasPerfected, hasRevolutionized,
  ]

  const mastery = computeScore(positiveBooleans)
  const hasHighMastery = mastery >= 60

  let art: TransformingMeasure['art'] = 'no-mastery'
  if (mastery >= 90) art = 'master-illusionist'
  else if (mastery >= 75) art = 'skilled-shapeshifter'
  else if (mastery >= 60) art = 'proper-adaptor'
  else if (mastery >= 40) art = 'reluctant-changer'
  else if (mastery >= 20) art = 'frozen-statue'

  return {
    mastery, art, hasHighMastery,
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasEvolved,
    hasNoStagnant, hasRefactored, hasImproved, hasOptimized, hasModernized,
    hasUpgraded, hasEnhanced, hasPerfected, hasRevolutionized,
    spaghettiCount, monolithicCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAlexandriteShift(content, 'app.ts') */
export function analyzeAlexandriteShift(content: string, filePath: string): AlexandriteShift {
  const adapting = measureAdapting(content)
  const transitioning = measureTransitioning(content)
  const dualSurviving = measureDualSurviving(content)
  const understanding = measureUnderstanding(content)
  const transforming = measureTransforming(content)

  const colorShiftClarity = adapting.clarity
  const twilightPrecision = transitioning.precision
  const dualNatureResilience = dualSurviving.resilience
  const chrysoberylWisdom = understanding.wisdom
  const transformationMastery = transforming.mastery

  const qualityScore = Math.round(
    colorShiftClarity * 0.2 +
    twilightPrecision * 0.2 +
    dualNatureResilience * 0.2 +
    chrysoberylWisdom * 0.2 +
    transformationMastery * 0.2,
  )

  const condition = classifyAlexandriteCondition(qualityScore)

  return {
    file: filePath,
    colorShiftClarity, twilightPrecision, dualNatureResilience, chrysoberylWisdom, transformationMastery,
    adapting, transitioning, dualSurviving, understanding, transforming,
    condition, qualityScore,
  }
}

/** @example analyzeAlexandritePair(shifts, 'src') */
export function analyzeAlexandritePair(shifts: AlexandriteShift[], dirPath: string): AlexandritePair {
  if (shifts.length === 0) {
    return {
      directory: dirPath, shifts: [],
      avgClarity: 0, avgResilience: 0, avgWisdom: 0,
      alexandriteMasterpieceCount: 0, voidCount: 0,
      pairType: 'no-pair', condition: 'void',
    }
  }

  const avgClarity = Math.round(shifts.reduce((s, sh) => s + sh.colorShiftClarity, 0) / shifts.length)
  const avgResilience = Math.round(shifts.reduce((s, sh) => s + sh.dualNatureResilience, 0) / shifts.length)
  const avgWisdom = Math.round(shifts.reduce((s, sh) => s + sh.chrysoberylWisdom, 0) / shifts.length)
  const alexandriteMasterpieceCount = shifts.filter((sh) => sh.condition === 'alexandrite-masterpiece').length
  const voidCount = shifts.filter((sh) => sh.condition === 'void').length
  const pairType = classifyPairType(shifts)
  const avgQuality = Math.round(shifts.reduce((s, sh) => s + sh.qualityScore, 0) / shifts.length)
  const condition = classifyPairCondition(avgQuality)

  return {
    directory: dirPath, shifts,
    avgClarity, avgResilience, avgWisdom,
    alexandriteMasterpieceCount, voidCount,
    pairType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAlexandriteDuskResult(['a.ts'], [content]) */
export async function buildAlexandriteDuskResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AlexandriteDuskResult> {
  const shifts: AlexandriteShift[] = files.map((file, i) =>
    analyzeAlexandriteShift(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AlexandriteShift[]>()
  for (const shift of shifts) {
    const dir = shift.file.includes('/')
      ? shift.file.substring(0, shift.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(shift)
    } else {
      dirMap.set(dir, [shift])
    }
  }

  const pairs: AlexandritePair[] = Array.from(dirMap.entries()).map(([dir, dirShifts]) =>
    analyzeAlexandritePair(dirShifts, dir),
  )

  const avgColorShiftClarity = shifts.length > 0
    ? Math.round(shifts.reduce((s, sh) => s + sh.colorShiftClarity, 0) / shifts.length) : 0
  const avgTwilightPrecision = shifts.length > 0
    ? Math.round(shifts.reduce((s, sh) => s + sh.twilightPrecision, 0) / shifts.length) : 0
  const avgDualNatureResilience = shifts.length > 0
    ? Math.round(shifts.reduce((s, sh) => s + sh.dualNatureResilience, 0) / shifts.length) : 0
  const avgChrysoberylWisdom = shifts.length > 0
    ? Math.round(shifts.reduce((s, sh) => s + sh.chrysoberylWisdom, 0) / shifts.length) : 0
  const avgTransformationMastery = shifts.length > 0
    ? Math.round(shifts.reduce((s, sh) => s + sh.transformationMastery, 0) / shifts.length) : 0

  const overallTransformation = shifts.length > 0
    ? Math.round(shifts.reduce((s, sh) => s + sh.qualityScore, 0) / shifts.length) : 0
  const isAlexandrite = overallTransformation >= 60

  const twilight: AlexandriteDuskResult['twilight'] = {
    avgClarity: avgColorShiftClarity, avgResilience: avgDualNatureResilience, avgWisdom: avgChrysoberylWisdom,
    isAlexandrite, overallTransformation,
  }

  const alexandriteMasterpieceCount = shifts.filter((sh) => sh.condition === 'alexandrite-masterpiece').length
  const imperialGemCount = shifts.filter((sh) => sh.condition === 'imperial-gem').length
  const properAlexandriteCount = shifts.filter((sh) => sh.condition === 'proper-alexandrite').length
  const commonChrysoberylCount = shifts.filter((sh) => sh.condition === 'common-chrysoberyl').length
  const glassStoneCount = shifts.filter((sh) => sh.condition === 'glass-stone').length
  const voidCount = shifts.filter((sh) => sh.condition === 'void').length

  const hasHighClarityCount = shifts.filter((sh) => sh.adapting.hasHighClarity).length
  const hasHighPrecisionCount = shifts.filter((sh) => sh.transitioning.hasHighPrecision).length
  const hasHighResilienceCount = shifts.filter((sh) => sh.dualSurviving.hasHighResilience).length
  const hasHighWisdomCount = shifts.filter((sh) => sh.understanding.hasHighWisdom).length
  const hasHighMasteryCount = shifts.filter((sh) => sh.transforming.hasHighMastery).length

  const gemologistGrade = classifyGemologistGrade(overallTransformation)

  const bestShift = shifts.length > 0
    ? shifts.reduce((best, sh) => (sh.qualityScore > best.qualityScore ? sh : best)).file : ''
  const mostAdaptive = shifts.length > 0
    ? shifts.reduce((best, sh) => (sh.colorShiftClarity > best.colorShiftClarity ? sh : best)).file : ''
  const mostPrecise = shifts.length > 0
    ? shifts.reduce((best, sh) => (sh.twilightPrecision > best.twilightPrecision ? sh : best)).file : ''
  const mostResilient = shifts.length > 0
    ? shifts.reduce((best, sh) => (sh.dualNatureResilience > best.dualNatureResilience ? sh : best)).file : ''
  const wisest = shifts.length > 0
    ? shifts.reduce((best, sh) => (sh.chrysoberylWisdom > best.chrysoberylWisdom ? sh : best)).file : ''
  const mostTransformative = shifts.length > 0
    ? shifts.reduce((best, sh) => (sh.transformationMastery > best.transformationMastery ? sh : best)).file : ''

  const stats: AlexandriteDuskResult['stats'] = {
    totalFiles: files.length, totalPairs: pairs.length,
    avgColorShiftClarity, avgTwilightPrecision, avgDualNatureResilience, avgChrysoberylWisdom, avgTransformationMastery,
    alexandriteMasterpieceCount, imperialGemCount, properAlexandriteCount, commonChrysoberylCount, glassStoneCount, voidCount,
    hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount, hasHighMasteryCount,
    overallTransformation, gemologistGrade,
    bestShift, mostAdaptive, mostPrecise, mostResilient, wisest, mostTransformative,
  }

  const recommendations = generateRecommendations(shifts, pairs, twilight, stats)

  return {
    shifts, pairs, twilight, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(shifts, pairs, twilight, stats) */
export function generateRecommendations(
  shifts: AlexandriteShift[],
  pairs: AlexandritePair[],
  _twilight: AlexandriteDuskResult['twilight'],
  stats: AlexandriteDuskResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgColorShiftClarity >= 90 &&
    stats.avgTwilightPrecision >= 90 &&
    stats.avgDualNatureResilience >= 90 &&
    stats.avgChrysoberylWisdom >= 90 &&
    stats.avgTransformationMastery >= 90
  ) {
    recs.push(
      'Your alexandrite reveals a dramatic color-shift masterpiece! Color-shift clarity is dramatic-change, twilight precision is perfect-twilight, dual-nature resilience is double-plated, chrysoberyl wisdom is imperial-alexandrite, and transformation mastery is master-illusionist!',
    )
    return recs
  }

  if (stats.avgColorShiftClarity < 60) {
    recs.push(
      'Expand color-shift clarity — the alexandrite must adapt to every light; eliminate rigid patterns, embrace flexible structures, and achieve dramatic-change adaptability'
    )
  }

  if (stats.avgTwilightPrecision < 60) {
    recs.push(
      'Sharpen twilight precision — the alexandrite must transition flawlessly at dusk; tighten types, eliminate unsafe patterns, and achieve perfect-twilight precision'
    )
  }

  if (stats.avgDualNatureResilience < 60) {
    recs.push(
      'Strengthen dual-nature resilience — the alexandrite must survive in both green and red light; add error handling, test thoroughly, and build double-plated resilience'
    )
  }

  if (stats.avgChrysoberylWisdom < 60) {
    recs.push(
      'Deepen chrysoberyl wisdom — the alexandrite must understand its own duality; build with principled architecture, proven patterns, and imperial-alexandrite insight'
    )
  }

  if (stats.avgTransformationMastery < 60) {
    recs.push(
      'Master transformation — the alexandrite must shift colors with grace; modularize code, eliminate monolithic patterns, and achieve master-illusionist transformation'
    )
  }

  if (stats.overallTransformation < 40) {
    recs.push(
      'The alexandrite is frozen — glass stones and common chrysoberyl outnumber the imperial gems, and no color shift occurs'
    )
  }

  const voidShifts = shifts.filter((sh) => sh.condition === 'void')
  if (voidShifts.length > 0 && voidShifts.length <= 5) {
    recs.push(`Remove these glass stones from the collection: ${voidShifts.map((sh) => sh.file).join(', ')}`)
  } else if (voidShifts.length > 5) {
    recs.push(`Remove ${voidShifts.length} glass stones from the collection before the last twilight fades`)
  }

  const poorPairs = pairs.filter((p) => p.condition === 'void' || p.condition === 'empty-box')
  if (poorPairs.length === pairs.length && pairs.length > 0) {
    recs.push('All pairs are empty boxes — the alexandrite collection needs alexandrite-palace quality shifts throughout')
  }

  if (recs.length === 0) {
    recs.push('Your alexandrite collection radiates with transformation brilliance — every shift carries color-shift clarity, twilight precision, dual-nature resilience, chrysoberyl wisdom, and transformation mastery')
  }

  return recs
}
