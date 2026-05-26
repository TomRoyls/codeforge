// ─── Interfaces ──────────────────────────────────────────

export interface GleamingMeasure {
  purity: number
  luster: 'south-sea-pearl' | 'akoya-grade' | 'proper-luster' | 'dull-surface' | 'chalky-bead' | 'no-purity'
  hasHighPurity: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasPristine: boolean
  hasSpotless: boolean
  hasImmaculate: boolean
  hasPure: boolean
  hasUnblemished: boolean
  hasFlawless: boolean
  hasUnpolluted: boolean
  hasGleaming: boolean
  hasRadiant: boolean
  hackCount: number
  workaroundCount: number
}

export interface FathomingMeasure {
  wisdom: number
  depth: 'mariana-depth' | 'deep-current' | 'proper-depth' | 'shallow-reef' | 'tidal-pool' | 'no-wisdom'
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

export interface LayeringMeasure {
  precision: number
  coat: 'thousand-layers' | 'fine-nacre' | 'proper-coating' | 'thin-shell' | 'no-coating' | 'no-precision'
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
  hasLayered: boolean
  hasStructured: boolean
  hasOrganized: boolean
  hasMethodical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface FlowingMeasure {
  resilience: number
  tide: 'eternal-tide' | 'steady-current' | 'proper-flow' | 'erratic-eddy' | 'stagnant-pool' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasReliable: boolean
  hasConsistent: boolean
  hasRhythmic: boolean
  hasDependable: boolean
  hasEnduring: boolean
  hasPersistent: boolean
  hasSteadfast: boolean
  unhandledCount: number
  untestedCount: number
}

export interface ShimmeringMeasure {
  clarity: number
  rainbow: 'full-spectrum' | 'rich-overtone' | 'proper-orient' | 'dull-sheen' | 'no-light' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasObvious: boolean
  hasEvident: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasOpen: boolean
  hasIlluminating: boolean
  hasMultiAngle: boolean
  crypticCount: number
  mysteryCount: number
}

export type PearlCondition =
  | 'pearl-masterpiece'
  | 'gem-quality'
  | 'proper-pearl'
  | 'baroque-shape'
  | 'seed-pearl'
  | 'void'

export interface PearlLuster {
  file: string
  lustrousPurity: number
  oceanWisdom: number
  nacrePrecision: number
  tidalResilience: number
  iridescentClarity: number
  gleaming: GleamingMeasure
  fathoming: FathomingMeasure
  layering: LayeringMeasure
  flowing: FlowingMeasure
  shimmering: ShimmeringMeasure
  condition: PearlCondition
  qualityScore: number
}

export type BedType =
  | 'pearl-fishery'
  | 'oyster-bed'
  | 'proper-reef'
  | 'small-colony'
  | 'empty-shore'
  | 'no-bed'

export type BedCondition =
  | 'pearl-palace'
  | 'nacre-vault'
  | 'proper-chamber'
  | 'shell-collection'
  | 'empty-beach'
  | 'void'

export type DiverGrade = 'master-pearl-diver' | 'experienced-fisher' | 'proper-diver' | 'apprentice' | 'novice' | 'shore-collector'

export interface PearlBed {
  directory: string
  lusters: PearlLuster[]
  avgPurity: number
  avgPrecision: number
  avgWisdom: number
  pearlMasterpieceCount: number
  voidCount: number
  bedType: BedType
  condition: BedCondition
}

export interface PearlTideResult {
  lusters: PearlLuster[]
  beds: PearlBed[]
  ocean: {
    avgPurity: number
    avgPrecision: number
    avgWisdom: number
    isPearl: boolean
    overallLuster: number
  }
  stats: {
    totalFiles: number
    totalBeds: number
    avgLustrousPurity: number
    avgOceanWisdom: number
    avgNacrePrecision: number
    avgTidalResilience: number
    avgIridescentClarity: number
    pearlMasterpieceCount: number
    gemQualityCount: number
    properPearlCount: number
    baroqueShapeCount: number
    seedPearlCount: number
    voidCount: number
    hasHighPurityCount: number
    hasHighWisdomCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    overallLuster: number
    diverGrade: DiverGrade
    bestLuster: string
    purest: string
    wisest: string
    mostPrecise: string
    mostResilient: string
    clearest: string
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

/** @example classifyPearlCondition(90) */
export function classifyPearlCondition(score: number): PearlCondition {
  if (score >= 90) return 'pearl-masterpiece'
  if (score >= 75) return 'gem-quality'
  if (score >= 60) return 'proper-pearl'
  if (score >= 40) return 'baroque-shape'
  if (score >= 20) return 'seed-pearl'
  return 'void'
}

/** @example classifyBedType(lusters) */
export function classifyBedType(lusters: PearlLuster[]): BedType {
  if (lusters.length === 0) return 'no-bed'
  const avg = lusters.reduce((s, l) => s + l.qualityScore, 0) / lusters.length
  if (avg >= 85) return 'pearl-fishery'
  if (avg >= 70) return 'oyster-bed'
  if (avg >= 55) return 'proper-reef'
  if (avg >= 35) return 'small-colony'
  return 'empty-shore'
}

/** @example classifyBedCondition(85) */
export function classifyBedCondition(score: number): BedCondition {
  if (score >= 85) return 'pearl-palace'
  if (score >= 70) return 'nacre-vault'
  if (score >= 55) return 'proper-chamber'
  if (score >= 35) return 'shell-collection'
  if (score >= 15) return 'empty-beach'
  return 'void'
}

/** @example classifyDiverGrade(80) */
export function classifyDiverGrade(avgLuster: number): DiverGrade {
  if (avgLuster >= 80) return 'master-pearl-diver'
  if (avgLuster >= 65) return 'experienced-fisher'
  if (avgLuster >= 50) return 'proper-diver'
  if (avgLuster >= 35) return 'apprentice'
  if (avgLuster >= 20) return 'novice'
  return 'shore-collector'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureGleaming('export class X { readonly y: string }') */
export function measureGleaming(content: string): GleamingMeasure {
  const hasClean = /\b(class|interface|type)\b/.test(content)
  const hackCount = (content.match(/\b(hack|todo|fixme|xxx)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|kludge|temp|temporary)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|XXX|HACK)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(const|let|var|function|return|import|export|if|for|while)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(console\.log|debugger|println)\b/g) ?? []).length === 0
  const hasPristine = /\b(import|export)\b/.test(content)
  const hasSpotless = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImmaculate = !/\bany\b/.test(content)
  const hasPure = /\b(readonly|private|protected)\b/.test(content)
  const hasUnblemished = /\b(async|await|Promise)\b/.test(content)
  const hasFlawless = /\b(function|=>|return)\b/.test(content)
  const hasUnpolluted = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGleaming = /\b(try|catch|if)\b/.test(content)
  const hasRadiant = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasPristine, hasSpotless, hasImmaculate, hasPure,
    hasUnblemished, hasFlawless, hasUnpolluted, hasGleaming, hasRadiant,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let luster: GleamingMeasure['luster'] = 'no-purity'
  if (purity >= 90) luster = 'south-sea-pearl'
  else if (purity >= 75) luster = 'akoya-grade'
  else if (purity >= 60) luster = 'proper-luster'
  else if (purity >= 40) luster = 'dull-surface'
  else if (purity >= 20) luster = 'chalky-bead'

  return {
    purity, luster, hasHighPurity,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasPristine, hasSpotless, hasImmaculate, hasPure,
    hasUnblemished, hasFlawless, hasUnpolluted, hasGleaming, hasRadiant,
    hackCount, workaroundCount,
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
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasProfound = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasFathomless = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProfound, hasWise, hasFathomless,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let depth: FathomingMeasure['depth'] = 'no-wisdom'
  if (wisdom >= 90) depth = 'mariana-depth'
  else if (wisdom >= 75) depth = 'deep-current'
  else if (wisdom >= 60) depth = 'proper-depth'
  else if (wisdom >= 40) depth = 'shallow-reef'
  else if (wisdom >= 20) depth = 'tidal-pool'

  return {
    wisdom, depth, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProfound, hasWise, hasFathomless,
    hackedCount, shallowCount,
  }
}

/** @example measureLayering('export class X { readonly y: string }') */
export function measureLayering(content: string): LayeringMeasure {
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
  const hasLayered = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasStructured = /\b(async|await|Promise)\b/.test(content)
  const hasOrganized = /\b(function|=>|return)\b/.test(content)
  const hasMethodical = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasLayered, hasStructured, hasOrganized, hasMethodical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let coat: LayeringMeasure['coat'] = 'no-precision'
  if (precision >= 90) coat = 'thousand-layers'
  else if (precision >= 75) coat = 'fine-nacre'
  else if (precision >= 60) coat = 'proper-coating'
  else if (precision >= 40) coat = 'thin-shell'
  else if (precision >= 20) coat = 'no-coating'

  return {
    precision, coat, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasLayered, hasStructured, hasOrganized, hasMethodical,
    unsafeCount, approximateCount,
  }
}

/** @example measureFlowing('export class X { readonly y: string }') */
export function measureFlowing(content: string): FlowingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasStable = /\b(import|export)\b/.test(content)
  const hasReliable = !/\bany\b/.test(content)
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const hasRhythmic = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDependable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasEnduring = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPersistent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSteadfast = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasReliable, hasConsistent, hasRhythmic,
    hasDependable, hasEnduring, hasPersistent, hasSteadfast,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let tide: FlowingMeasure['tide'] = 'no-resilience'
  if (resilience >= 90) tide = 'eternal-tide'
  else if (resilience >= 75) tide = 'steady-current'
  else if (resilience >= 60) tide = 'proper-flow'
  else if (resilience >= 40) tide = 'erratic-eddy'
  else if (resilience >= 20) tide = 'stagnant-pool'

  return {
    resilience, tide, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasReliable, hasConsistent, hasRhythmic,
    hasDependable, hasEnduring, hasPersistent, hasSteadfast,
    unhandledCount, untestedCount,
  }
}

/** @example measureShimmering('export class X { readonly y: string }') */
export function measureShimmering(content: string): ShimmeringMeasure {
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
  const hasObvious = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEvident = /\b(function|=>|return)\b/.test(content)
  const hasRevealed = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasExposed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasOpen = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasIlluminating = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMultiAngle = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasObvious, hasEvident,
    hasRevealed, hasExposed, hasOpen, hasIlluminating, hasMultiAngle,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let rainbow: ShimmeringMeasure['rainbow'] = 'no-clarity'
  if (clarity >= 90) rainbow = 'full-spectrum'
  else if (clarity >= 75) rainbow = 'rich-overtone'
  else if (clarity >= 60) rainbow = 'proper-orient'
  else if (clarity >= 40) rainbow = 'dull-sheen'
  else if (clarity >= 20) rainbow = 'no-light'

  return {
    clarity, rainbow, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasObvious, hasEvident,
    hasRevealed, hasExposed, hasOpen, hasIlluminating, hasMultiAngle,
    crypticCount, mysteryCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzePearlLuster(content, 'app.ts') */
export function analyzePearlLuster(content: string, filePath: string): PearlLuster {
  const gleaming = measureGleaming(content)
  const fathoming = measureFathoming(content)
  const layering = measureLayering(content)
  const flowing = measureFlowing(content)
  const shimmering = measureShimmering(content)

  const lustrousPurity = gleaming.purity
  const oceanWisdom = fathoming.wisdom
  const nacrePrecision = layering.precision
  const tidalResilience = flowing.resilience
  const iridescentClarity = shimmering.clarity

  const qualityScore = Math.round(
    lustrousPurity * 0.2 +
    oceanWisdom * 0.2 +
    nacrePrecision * 0.2 +
    tidalResilience * 0.2 +
    iridescentClarity * 0.2,
  )

  const condition = classifyPearlCondition(qualityScore)

  return {
    file: filePath,
    lustrousPurity, oceanWisdom, nacrePrecision, tidalResilience, iridescentClarity,
    gleaming, fathoming, layering, flowing, shimmering,
    condition, qualityScore,
  }
}

/** @example analyzePearlBed(lusters, 'src') */
export function analyzePearlBed(lusters: PearlLuster[], dirPath: string): PearlBed {
  if (lusters.length === 0) {
    return {
      directory: dirPath, lusters: [],
      avgPurity: 0, avgPrecision: 0, avgWisdom: 0,
      pearlMasterpieceCount: 0, voidCount: 0,
      bedType: 'no-bed', condition: 'void',
    }
  }

  const avgPurity = Math.round(lusters.reduce((s, l) => s + l.lustrousPurity, 0) / lusters.length)
  const avgPrecision = Math.round(lusters.reduce((s, l) => s + l.nacrePrecision, 0) / lusters.length)
  const avgWisdom = Math.round(lusters.reduce((s, l) => s + l.oceanWisdom, 0) / lusters.length)
  const pearlMasterpieceCount = lusters.filter((l) => l.condition === 'pearl-masterpiece').length
  const voidCount = lusters.filter((l) => l.condition === 'void').length
  const bedType = classifyBedType(lusters)
  const avgQuality = Math.round(lusters.reduce((s, l) => s + l.qualityScore, 0) / lusters.length)
  const condition = classifyBedCondition(avgQuality)

  return {
    directory: dirPath, lusters,
    avgPurity, avgPrecision, avgWisdom,
    pearlMasterpieceCount, voidCount,
    bedType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildPearlTideResult(['a.ts'], [content]) */
export async function buildPearlTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PearlTideResult> {
  const lusters: PearlLuster[] = files.map((file, i) =>
    analyzePearlLuster(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PearlLuster[]>()
  for (const luster of lusters) {
    const dir = luster.file.includes('/')
      ? luster.file.substring(0, luster.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(luster)
    } else {
      dirMap.set(dir, [luster])
    }
  }

  const beds: PearlBed[] = Array.from(dirMap.entries()).map(([dir, dirLusters]) =>
    analyzePearlBed(dirLusters, dir),
  )

  const avgLustrousPurity = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.lustrousPurity, 0) / lusters.length) : 0
  const avgOceanWisdom = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.oceanWisdom, 0) / lusters.length) : 0
  const avgNacrePrecision = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.nacrePrecision, 0) / lusters.length) : 0
  const avgTidalResilience = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.tidalResilience, 0) / lusters.length) : 0
  const avgIridescentClarity = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.iridescentClarity, 0) / lusters.length) : 0

  const overallLuster = lusters.length > 0
    ? Math.round(lusters.reduce((s, l) => s + l.qualityScore, 0) / lusters.length) : 0
  const isPearl = overallLuster >= 60

  const ocean: PearlTideResult['ocean'] = {
    avgPurity: avgLustrousPurity, avgPrecision: avgNacrePrecision, avgWisdom: avgOceanWisdom,
    isPearl, overallLuster,
  }

  const pearlMasterpieceCount = lusters.filter((l) => l.condition === 'pearl-masterpiece').length
  const gemQualityCount = lusters.filter((l) => l.condition === 'gem-quality').length
  const properPearlCount = lusters.filter((l) => l.condition === 'proper-pearl').length
  const baroqueShapeCount = lusters.filter((l) => l.condition === 'baroque-shape').length
  const seedPearlCount = lusters.filter((l) => l.condition === 'seed-pearl').length
  const voidCount = lusters.filter((l) => l.condition === 'void').length

  const hasHighPurityCount = lusters.filter((l) => l.gleaming.hasHighPurity).length
  const hasHighWisdomCount = lusters.filter((l) => l.fathoming.hasHighWisdom).length
  const hasHighPrecisionCount = lusters.filter((l) => l.layering.hasHighPrecision).length
  const hasHighResilienceCount = lusters.filter((l) => l.flowing.hasHighResilience).length
  const hasHighClarityCount = lusters.filter((l) => l.shimmering.hasHighClarity).length

  const diverGrade = classifyDiverGrade(overallLuster)

  const bestLuster = lusters.length > 0
    ? lusters.reduce((best, l) => (l.qualityScore > best.qualityScore ? l : best)).file : ''
  const purest = lusters.length > 0
    ? lusters.reduce((best, l) => (l.lustrousPurity > best.lustrousPurity ? l : best)).file : ''
  const wisest = lusters.length > 0
    ? lusters.reduce((best, l) => (l.oceanWisdom > best.oceanWisdom ? l : best)).file : ''
  const mostPrecise = lusters.length > 0
    ? lusters.reduce((best, l) => (l.nacrePrecision > best.nacrePrecision ? l : best)).file : ''
  const mostResilient = lusters.length > 0
    ? lusters.reduce((best, l) => (l.tidalResilience > best.tidalResilience ? l : best)).file : ''
  const clearest = lusters.length > 0
    ? lusters.reduce((best, l) => (l.iridescentClarity > best.iridescentClarity ? l : best)).file : ''

  const stats: PearlTideResult['stats'] = {
    totalFiles: files.length, totalBeds: beds.length,
    avgLustrousPurity, avgOceanWisdom, avgNacrePrecision, avgTidalResilience, avgIridescentClarity,
    pearlMasterpieceCount, gemQualityCount, properPearlCount, baroqueShapeCount, seedPearlCount, voidCount,
    hasHighPurityCount, hasHighWisdomCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighClarityCount,
    overallLuster, diverGrade,
    bestLuster, purest, wisest, mostPrecise, mostResilient, clearest,
  }

  const recommendations = generateRecommendations(lusters, beds, ocean, stats)

  return {
    lusters, beds, ocean, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(lusters, beds, ocean, stats) */
export function generateRecommendations(
  lusters: PearlLuster[],
  beds: PearlBed[],
  ocean: PearlTideResult['ocean'],
  stats: PearlTideResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgLustrousPurity >= 90 &&
    stats.avgOceanWisdom >= 90 &&
    stats.avgNacrePrecision >= 90 &&
    stats.avgTidalResilience >= 90 &&
    stats.avgIridescentClarity >= 90
  ) {
    recs.push(
      'Your pearl tide reveals a south-sea pearl masterpiece! Lustrous purity is south-sea-pearl, ocean wisdom is mariana-depth, nacre precision is thousand-layers, tidal resilience is eternal-tide, and iridescent clarity is full-spectrum!',
    )
    return recs
  }

  if (stats.avgLustrousPurity < 60) {
    recs.push(
      'Polish lustrous purity — the pearl must gleam without blemish; eliminate hack patterns, remove debug code, and achieve south-sea-pearl purity',
    )
  }

  if (stats.avgOceanWisdom < 60) {
    recs.push(
      'Deepen ocean wisdom — the pearl must fathom the deepest currents; build with principled architecture, proven patterns, and mariana-depth insight',
    )
  }

  if (stats.avgNacrePrecision < 60) {
    recs.push(
      'Strengthen nacre precision — the pearl must build layer upon exact layer; tighten types, eliminate unsafe patterns, and achieve thousand-layers precision',
    )
  }

  if (stats.avgTidalResilience < 60) {
    recs.push(
      'Build tidal resilience — the pearl must endure the ocean\'s relentless rhythm; add error handling, test thoroughly, and achieve eternal-tide resilience',
    )
  }

  if (stats.avgIridescentClarity < 60) {
    recs.push(
      'Sharpen iridescent clarity — the pearl must shimmer with understanding from every angle; eliminate cryptic patterns, improve readability, and achieve full-spectrum clarity',
    )
  }

  if (stats.overallLuster < 40) {
    recs.push(
      'The tide has receded — seed pearls and baroque shapes outnumber the gem-quality pearls, and no luster remains',
    )
  }

  const voidLusters = lusters.filter((l) => l.condition === 'void')
  if (voidLusters.length > 0 && voidLusters.length <= 5) {
    recs.push(`Remove these seed pearls from the tide: ${voidLusters.map((l) => l.file).join(', ')}`)
  } else if (voidLusters.length > 5) {
    recs.push(`Remove ${voidLusters.length} seed pearls from the tide before the ocean reclaims them`)
  }

  const poorBeds = beds.filter((b) => b.condition === 'void' || b.condition === 'empty-beach')
  if (poorBeds.length === beds.length && beds.length > 0) {
    recs.push('All beds are empty beaches — the pearl tide needs pearl-palace quality lusters throughout')
  }

  if (recs.length === 0) {
    recs.push('Your pearl tide gleams with oceanic brilliance — every luster carries lustrous purity, ocean wisdom, nacre precision, tidal resilience, and iridescent clarity')
  }

  return recs
}
