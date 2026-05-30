// ─── Interfaces ──────────────────────────────────────────

export interface StrengtheningMeasure {
  strength: number
  grade: 'aerospace-grade' | 'medical-grade' | 'industrial-grade' | 'commercial-grade' | 'scrap-metal' | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasSolid: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasStrong: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasFortified: boolean
  hasTough: boolean
  hasUnyielding: boolean
  chaoticCount: number
  untestedCount: number
}

export interface ExploringMeasure {
  vision: number
  horizon: 'starship-class' | 'orbital-station' | 'proper-satellite' | 'weather-balloon' | 'paper-airplane' | 'no-vision'
  hasHighVision: boolean
  hasForwardLooking: boolean
  hasNoLegacyBound: boolean
  hasInnovative: boolean
  hasNoStagnant: boolean
  hasModern: boolean
  hasAdaptive: boolean
  hasPioneering: boolean
  hasProgressive: boolean
  hasVisionary: boolean
  hasForward: boolean
  hasAdvanced: boolean
  hasCuttingEdge: boolean
  hasNextGen: boolean
  hasFutureProof: boolean
  hasExploratory: boolean
  legacyBoundCount: number
  stagnantCount: number
}

export interface ResistingMeasure {
  resistance: number
  shield: 'indestructible-hull' | 'corrosion-proof' | 'proper-coating' | 'rusted-patch' | 'dissolving-metal' | 'no-resistance'
  hasHighResistance: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasSecure: boolean
  hasNoVulnerable: boolean
  hasProtected: boolean
  hasResilient: boolean
  hasHardened: boolean
  hasStable: boolean
  hasEnduring: boolean
  hasImpervious: boolean
  hasUnassailable: boolean
  hasInvulnerable: boolean
  hasUntouchable: boolean
  unhandledCount: number
  vulnerableCount: number
}

export interface OptimizingMeasure {
  efficiency: number
  ratio: 'perfect-balance' | 'excellent-ratio' | 'proper-efficiency' | 'heavy-handed' | 'over-engineered' | 'no-efficiency'
  hasHighEfficiency: boolean
  hasConcise: boolean
  hasNoVerbose: boolean
  hasEfficient: boolean
  hasNoRedundant: boolean
  hasLean: boolean
  hasStreamlined: boolean
  hasOptimized: boolean
  hasMinimal: boolean
  hasEconomical: boolean
  hasPragmatic: boolean
  hasLightweight: boolean
  hasTrim: boolean
  hasAgile: boolean
  hasSpare: boolean
  hasPurposeful: boolean
  verboseCount: number
  redundantCount: number
}

export interface NavigatingMeasure {
  wisdom: number
  orbit: 'mission-control' | 'veteran-pilot' | 'proper-navigator' | 'lost-astronaut' | 'grounded-cadet' | 'no-wisdom'
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
  hasCosmic: boolean
  hasTranscendent: boolean
  hasOmniscient: boolean
  hackedCount: number
  shallowCount: number
}

export type AlloyCondition =
  | 'titanium-masterpiece'
  | 'aerospace-grade'
  | 'proper-alloy'
  | 'base-metal'
  | 'scrap-titanium'
  | 'void'

export interface TitaniumAlloy {
  file: string
  alloyStrength: number
  frontierVision: number
  corrosionResistance: number
  weightEfficiency: number
  spaceWisdom: number
  strengthening: StrengtheningMeasure
  exploring: ExploringMeasure
  resisting: ResistingMeasure
  optimizing: OptimizingMeasure
  navigating: NavigatingMeasure
  condition: AlloyCondition
  qualityScore: number
}

export type StationType =
  | 'space-station'
  | 'orbital-lab'
  | 'proper-habitat'
  | 'launch-pad'
  | 'empty-silo'
  | 'no-station'

export type StationCondition =
  | 'titanium-palace'
  | 'space-fortress'
  | 'proper-station'
  | 'metal-shed'
  | 'cardboard-box'
  | 'void'

export interface TitaniumStation {
  directory: string
  alloys: TitaniumAlloy[]
  avgStrength: number
  avgEfficiency: number
  avgWisdom: number
  titaniumMasterpieceCount: number
  voidCount: number
  stationType: StationType
  condition: StationCondition
}

export type CommanderGrade = 'mission-commander' | 'veteran-pilot' | 'proper-officer' | 'cadet' | 'recruit' | 'ground-crew'

export interface TitaniumFrontierResult {
  alloys: TitaniumAlloy[]
  stations: TitaniumStation[]
  mission: {
    avgStrength: number
    avgEfficiency: number
    avgWisdom: number
    isTitanium: boolean
    overallReadiness: number
  }
  stats: {
    totalFiles: number
    totalStations: number
    avgAlloyStrength: number
    avgFrontierVision: number
    avgCorrosionResistance: number
    avgWeightEfficiency: number
    avgSpaceWisdom: number
    titaniumMasterpieceCount: number
    aerospaceGradeCount: number
    properAlloyCount: number
    baseMetalCount: number
    scrapTitaniumCount: number
    voidCount: number
    hasHighStrengthCount: number
    hasHighVisionCount: number
    hasHighResistanceCount: number
    hasHighEfficiencyCount: number
    hasHighWisdomCount: number
    overallReadiness: number
    commanderGrade: CommanderGrade
    bestAlloy: string
    strongest: string
    mostVisionary: string
    mostResistant: string
    mostEfficient: string
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

/** @example classifyAlloyCondition(90) */
export function classifyAlloyCondition(score: number): AlloyCondition {
  if (score >= 90) return 'titanium-masterpiece'
  if (score >= 75) return 'aerospace-grade'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'base-metal'
  if (score >= 20) return 'scrap-titanium'
  return 'void'
}

/** @example classifyStationType(alloys) */
export function classifyStationType(alloys: TitaniumAlloy[]): StationType {
  if (alloys.length === 0) return 'no-station'
  const avg = alloys.reduce((s, a) => s + a.qualityScore, 0) / alloys.length
  if (avg >= 85) return 'space-station'
  if (avg >= 70) return 'orbital-lab'
  if (avg >= 55) return 'proper-habitat'
  if (avg >= 35) return 'launch-pad'
  return 'empty-silo'
}

/** @example classifyStationCondition(85) */
export function classifyStationCondition(score: number): StationCondition {
  if (score >= 85) return 'titanium-palace'
  if (score >= 70) return 'space-fortress'
  if (score >= 55) return 'proper-station'
  if (score >= 35) return 'metal-shed'
  if (score >= 15) return 'cardboard-box'
  return 'void'
}

/** @example classifyCommanderGrade(80) */
export function classifyCommanderGrade(avgReadiness: number): CommanderGrade {
  if (avgReadiness >= 80) return 'mission-commander'
  if (avgReadiness >= 65) return 'veteran-pilot'
  if (avgReadiness >= 50) return 'proper-officer'
  if (avgReadiness >= 35) return 'cadet'
  if (avgReadiness >= 20) return 'recruit'
  return 'ground-crew'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureStrengthening('export class X { readonly y: string }') */
export function measureStrengthening(content: string): StrengtheningMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|tangled|spaghetti)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasSolid = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /\b(import|export)\b/.test(content)
  const hasStrong = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasHardened = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasReinforced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFortified = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTough = /\b(async|await|Promise)\b/.test(content)
  const hasUnyielding = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasTested,
    hasNoUntested, hasSolid, hasRobust, hasDurable, hasStrong,
    hasHardened, hasReinforced, hasFortified, hasTough, hasUnyielding,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let grade: StrengtheningMeasure['grade'] = 'no-strength'
  if (strength >= 90) grade = 'aerospace-grade'
  else if (strength >= 75) grade = 'medical-grade'
  else if (strength >= 60) grade = 'industrial-grade'
  else if (strength >= 40) grade = 'commercial-grade'
  else if (strength >= 20) grade = 'scrap-metal'

  return {
    strength, grade, hasHighStrength,
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasTested,
    hasNoUntested, hasSolid, hasRobust, hasDurable, hasStrong,
    hasHardened, hasReinforced, hasFortified, hasTough, hasUnyielding,
    chaoticCount, untestedCount,
  }
}

/** @example measureExploring('export class X { readonly y: string }') */
export function measureExploring(content: string): ExploringMeasure {
  const hasForwardLooking = /\b(class|interface|type)\b/.test(content)
  const legacyBoundCount = (content.match(/\b(legacy|deprecated|outdated|obsolete)\b/gi) ?? []).length
  const hasNoLegacyBound = legacyBoundCount === 0
  const hasInnovative = /\b(import|export)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|stale|archaic|ancient)\b/gi) ?? []).length
  const hasNoStagnant = stagnantCount === 0
  const hasModern = !/\bany\b/.test(content)
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasPioneering = /\b(readonly|private|protected)\b/.test(content)
  const hasProgressive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasVisionary = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasForward = /\b(try|catch|if)\b/.test(content)
  const hasAdvanced = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCuttingEdge = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasNextGen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFutureProof = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasExploratory = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasForwardLooking, hasNoLegacyBound, hasInnovative, hasNoStagnant, hasModern,
    hasAdaptive, hasPioneering, hasProgressive, hasVisionary, hasForward,
    hasAdvanced, hasCuttingEdge, hasNextGen, hasFutureProof, hasExploratory,
  ]

  const vision = computeScore(positiveBooleans)
  const hasHighVision = vision >= 60

  let horizon: ExploringMeasure['horizon'] = 'no-vision'
  if (vision >= 90) horizon = 'starship-class'
  else if (vision >= 75) horizon = 'orbital-station'
  else if (vision >= 60) horizon = 'proper-satellite'
  else if (vision >= 40) horizon = 'weather-balloon'
  else if (vision >= 20) horizon = 'paper-airplane'

  return {
    vision, horizon, hasHighVision,
    hasForwardLooking, hasNoLegacyBound, hasInnovative, hasNoStagnant, hasModern,
    hasAdaptive, hasPioneering, hasProgressive, hasVisionary, hasForward,
    hasAdvanced, hasCuttingEdge, hasNextGen, hasFutureProof, hasExploratory,
    legacyBoundCount, stagnantCount,
  }
}

/** @example measureResisting('try { } catch (e) { }') */
export function measureResisting(content: string): ResistingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|unchecked|risky)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|===|!==)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSecure = !/\bany\b/.test(content)
  const vulnerableCount = (content.match(/\b(vulnerable|exposed|defenseless)\b/gi) ?? []).length
  const hasNoVulnerable = vulnerableCount === 0
  const hasProtected = /\b(readonly|private|protected)\b/.test(content)
  const hasResilient = /\b(import|export)\b/.test(content)
  const hasHardened = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasEnduring = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImpervious = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasUnassailable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasInvulnerable = /\b(class|interface|type)\b/.test(content)
  const hasUntouchable = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasSecure,
    hasNoVulnerable, hasProtected, hasResilient, hasHardened, hasStable,
    hasEnduring, hasImpervious, hasUnassailable, hasInvulnerable, hasUntouchable,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60

  let shield: ResistingMeasure['shield'] = 'no-resistance'
  if (resistance >= 90) shield = 'indestructible-hull'
  else if (resistance >= 75) shield = 'corrosion-proof'
  else if (resistance >= 60) shield = 'proper-coating'
  else if (resistance >= 40) shield = 'rusted-patch'
  else if (resistance >= 20) shield = 'dissolving-metal'

  return {
    resistance, shield, hasHighResistance,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasSecure,
    hasNoVulnerable, hasProtected, hasResilient, hasHardened, hasStable,
    hasEnduring, hasImpervious, hasUnassailable, hasInvulnerable, hasUntouchable,
    unhandledCount, vulnerableCount,
  }
}

/** @example measureOptimizing('export const x: string = "hello"') */
export function measureOptimizing(content: string): OptimizingMeasure {
  const hasConcise = /\b(class|interface|type)\b/.test(content)
  const verboseCount = (content.match(/\b(verbose|wordy|bloated|excessive)\b/gi) ?? []).length
  const hasNoVerbose = verboseCount === 0
  const hasEfficient = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const redundantCount = (content.match(/\b(redundant|duplicate|repeated|unnecessary)\b/gi) ?? []).length
  const hasNoRedundant = redundantCount === 0
  const hasLean = !/\bany\b/.test(content)
  const hasStreamlined = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasOptimized = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasMinimal = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEconomical = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasPragmatic = /\b(import|export)\b/.test(content)
  const hasLightweight = /\b(readonly|private|protected)\b/.test(content)
  const hasTrim = /\b(const|readonly)\b/.test(content)
  const hasAgile = /\b(function|=>|return)\b/.test(content)
  const hasSpare = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPurposeful = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasConcise, hasNoVerbose, hasEfficient, hasNoRedundant, hasLean,
    hasStreamlined, hasOptimized, hasMinimal, hasEconomical, hasPragmatic,
    hasLightweight, hasTrim, hasAgile, hasSpare, hasPurposeful,
  ]

  const efficiency = computeScore(positiveBooleans)
  const hasHighEfficiency = efficiency >= 60

  let ratio: OptimizingMeasure['ratio'] = 'no-efficiency'
  if (efficiency >= 90) ratio = 'perfect-balance'
  else if (efficiency >= 75) ratio = 'excellent-ratio'
  else if (efficiency >= 60) ratio = 'proper-efficiency'
  else if (efficiency >= 40) ratio = 'heavy-handed'
  else if (efficiency >= 20) ratio = 'over-engineered'

  return {
    efficiency, ratio, hasHighEfficiency,
    hasConcise, hasNoVerbose, hasEfficient, hasNoRedundant, hasLean,
    hasStreamlined, hasOptimized, hasMinimal, hasEconomical, hasPragmatic,
    hasLightweight, hasTrim, hasAgile, hasSpare, hasPurposeful,
    verboseCount, redundantCount,
  }
}

/** @example measureNavigating('export class X { readonly y: string }') */
export function measureNavigating(content: string): NavigatingMeasure {
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
  const hasCosmic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasTranscendent = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasOmniscient = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCosmic, hasTranscendent, hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let orbit: NavigatingMeasure['orbit'] = 'no-wisdom'
  if (wisdom >= 90) orbit = 'mission-control'
  else if (wisdom >= 75) orbit = 'veteran-pilot'
  else if (wisdom >= 60) orbit = 'proper-navigator'
  else if (wisdom >= 40) orbit = 'lost-astronaut'
  else if (wisdom >= 20) orbit = 'grounded-cadet'

  return {
    wisdom, orbit, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasCosmic, hasTranscendent, hasOmniscient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeTitaniumAlloy(content, 'app.ts') */
export function analyzeTitaniumAlloy(content: string, filePath: string): TitaniumAlloy {
  const strengthening = measureStrengthening(content)
  const exploring = measureExploring(content)
  const resisting = measureResisting(content)
  const optimizing = measureOptimizing(content)
  const navigating = measureNavigating(content)

  const alloyStrength = strengthening.strength
  const frontierVision = exploring.vision
  const corrosionResistance = resisting.resistance
  const weightEfficiency = optimizing.efficiency
  const spaceWisdom = navigating.wisdom

  const qualityScore = Math.round(
    alloyStrength * 0.2 +
    frontierVision * 0.2 +
    corrosionResistance * 0.2 +
    weightEfficiency * 0.2 +
    spaceWisdom * 0.2,
  )

  const condition = classifyAlloyCondition(qualityScore)

  return {
    file: filePath,
    alloyStrength, frontierVision, corrosionResistance, weightEfficiency, spaceWisdom,
    strengthening, exploring, resisting, optimizing, navigating,
    condition, qualityScore,
  }
}

/** @example analyzeTitaniumStation(alloys, 'src') */
export function analyzeTitaniumStation(alloys: TitaniumAlloy[], dirPath: string): TitaniumStation {
  if (alloys.length === 0) {
    return {
      directory: dirPath, alloys: [],
      avgStrength: 0, avgEfficiency: 0, avgWisdom: 0,
      titaniumMasterpieceCount: 0, voidCount: 0,
      stationType: 'no-station', condition: 'void',
    }
  }

  const avgStrength = Math.round(alloys.reduce((s, a) => s + a.alloyStrength, 0) / alloys.length)
  const avgEfficiency = Math.round(alloys.reduce((s, a) => s + a.weightEfficiency, 0) / alloys.length)
  const avgWisdom = Math.round(alloys.reduce((s, a) => s + a.spaceWisdom, 0) / alloys.length)
  const titaniumMasterpieceCount = alloys.filter((a) => a.condition === 'titanium-masterpiece').length
  const voidCount = alloys.filter((a) => a.condition === 'void').length
  const stationType = classifyStationType(alloys)
  const avgQuality = Math.round(alloys.reduce((s, a) => s + a.qualityScore, 0) / alloys.length)
  const condition = classifyStationCondition(avgQuality)

  return {
    directory: dirPath, alloys,
    avgStrength, avgEfficiency, avgWisdom,
    titaniumMasterpieceCount, voidCount,
    stationType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildTitaniumFrontierResult(['a.ts'], [content]) */
export async function buildTitaniumFrontierResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TitaniumFrontierResult> {
  const alloys: TitaniumAlloy[] = files.map((file, i) =>
    analyzeTitaniumAlloy(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TitaniumAlloy[]>()
  for (const alloy of alloys) {
    const dir = alloy.file.includes('/')
      ? alloy.file.substring(0, alloy.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(alloy)
    } else {
      dirMap.set(dir, [alloy])
    }
  }

  const stations: TitaniumStation[] = Array.from(dirMap.entries()).map(([dir, dirAlloys]) =>
    analyzeTitaniumStation(dirAlloys, dir),
  )

  const avgAlloyStrength = alloys.length > 0
    ? Math.round(alloys.reduce((s, a) => s + a.alloyStrength, 0) / alloys.length) : 0
  const avgFrontierVision = alloys.length > 0
    ? Math.round(alloys.reduce((s, a) => s + a.frontierVision, 0) / alloys.length) : 0
  const avgCorrosionResistance = alloys.length > 0
    ? Math.round(alloys.reduce((s, a) => s + a.corrosionResistance, 0) / alloys.length) : 0
  const avgWeightEfficiency = alloys.length > 0
    ? Math.round(alloys.reduce((s, a) => s + a.weightEfficiency, 0) / alloys.length) : 0
  const avgSpaceWisdom = alloys.length > 0
    ? Math.round(alloys.reduce((s, a) => s + a.spaceWisdom, 0) / alloys.length) : 0

  const overallReadiness = alloys.length > 0
    ? Math.round(alloys.reduce((s, a) => s + a.qualityScore, 0) / alloys.length) : 0
  const isTitanium = overallReadiness >= 60

  const mission: TitaniumFrontierResult['mission'] = {
    avgStrength: avgAlloyStrength, avgEfficiency: avgWeightEfficiency, avgWisdom: avgSpaceWisdom,
    isTitanium, overallReadiness,
  }

  const titaniumMasterpieceCount = alloys.filter((a) => a.condition === 'titanium-masterpiece').length
  const aerospaceGradeCount = alloys.filter((a) => a.condition === 'aerospace-grade').length
  const properAlloyCount = alloys.filter((a) => a.condition === 'proper-alloy').length
  const baseMetalCount = alloys.filter((a) => a.condition === 'base-metal').length
  const scrapTitaniumCount = alloys.filter((a) => a.condition === 'scrap-titanium').length
  const voidCount = alloys.filter((a) => a.condition === 'void').length

  const hasHighStrengthCount = alloys.filter((a) => a.strengthening.hasHighStrength).length
  const hasHighVisionCount = alloys.filter((a) => a.exploring.hasHighVision).length
  const hasHighResistanceCount = alloys.filter((a) => a.resisting.hasHighResistance).length
  const hasHighEfficiencyCount = alloys.filter((a) => a.optimizing.hasHighEfficiency).length
  const hasHighWisdomCount = alloys.filter((a) => a.navigating.hasHighWisdom).length

  const commanderGrade = classifyCommanderGrade(overallReadiness)

  const bestAlloy = alloys.length > 0
    ? alloys.reduce((best, a) => (a.qualityScore > best.qualityScore ? a : best)).file : ''
  const strongest = alloys.length > 0
    ? alloys.reduce((best, a) => (a.alloyStrength > best.alloyStrength ? a : best)).file : ''
  const mostVisionary = alloys.length > 0
    ? alloys.reduce((best, a) => (a.frontierVision > best.frontierVision ? a : best)).file : ''
  const mostResistant = alloys.length > 0
    ? alloys.reduce((best, a) => (a.corrosionResistance > best.corrosionResistance ? a : best)).file : ''
  const mostEfficient = alloys.length > 0
    ? alloys.reduce((best, a) => (a.weightEfficiency > best.weightEfficiency ? a : best)).file : ''
  const wisest = alloys.length > 0
    ? alloys.reduce((best, a) => (a.spaceWisdom > best.spaceWisdom ? a : best)).file : ''

  const stats: TitaniumFrontierResult['stats'] = {
    totalFiles: files.length, totalStations: stations.length,
    avgAlloyStrength, avgFrontierVision, avgCorrosionResistance, avgWeightEfficiency, avgSpaceWisdom,
    titaniumMasterpieceCount, aerospaceGradeCount, properAlloyCount, baseMetalCount, scrapTitaniumCount, voidCount,
    hasHighStrengthCount, hasHighVisionCount, hasHighResistanceCount, hasHighEfficiencyCount, hasHighWisdomCount,
    overallReadiness, commanderGrade,
    bestAlloy, strongest, mostVisionary, mostResistant, mostEfficient, wisest,
  }

  const recommendations = generateRecommendations(alloys, stations, mission, stats)

  return {
    alloys, stations, mission, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(alloys, stations, mission, stats) */
export function generateRecommendations(
  alloys: TitaniumAlloy[],
  stations: TitaniumStation[],
  _mission: TitaniumFrontierResult['mission'],
  stats: TitaniumFrontierResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgAlloyStrength >= 90 &&
    stats.avgFrontierVision >= 90 &&
    stats.avgCorrosionResistance >= 90 &&
    stats.avgWeightEfficiency >= 90 &&
    stats.avgSpaceWisdom >= 90
  ) {
    recs.push(
      'Your titanium frontier is limitless! The alloy is aerospace-grade, the vision starship-class, the hull indestructible, the weight perfect, and the wisdom cosmic!',
    )
    return recs
  }

  if (stats.avgAlloyStrength < 60) {
    recs.push(
      'Strengthen titanium alloy — aerospace-grade metal must endure extreme forces; your code needs structural integrity, type safety, and battle-tested resilience'
    )
  }

  if (stats.avgFrontierVision < 60) {
    recs.push(
      'Expand frontier vision — the edge of known space demands forward-looking code; shed legacy patterns, embrace modern approaches, and pioneer new architectures'
    )
  }

  if (stats.avgCorrosionResistance < 60) {
    recs.push(
      'Improve corrosion resistance — titanium resists the harshest environments; your code needs error handling, defensive boundaries, and impervious security'
    )
  }

  if (stats.avgWeightEfficiency < 60) {
    recs.push(
      'Optimize weight efficiency — every gram counts in space; your code needs lean patterns, no redundancy, and maximum power per line'
    )
  }

  if (stats.avgSpaceWisdom < 60) {
    recs.push(
      'Deepen space wisdom — mission control needs cosmic understanding; your code needs principled architecture, proven patterns, and transcendent design'
    )
  }

  if (stats.overallReadiness < 40) {
    recs.push(
      'The mission is scrubbed — base metals and scrap titanium outnumber the aerospace-grade alloys, and the station cannot launch'
    )
  }

  const voidAlloys = alloys.filter((a) => a.condition === 'void')
  if (voidAlloys.length > 0 && voidAlloys.length <= 5) {
    recs.push(`Recycle these scrap alloys: ${voidAlloys.map((a) => a.file).join(', ')}`)
  } else if (voidAlloys.length > 5) {
    recs.push(`Recycle ${voidAlloys.length} scrap alloys before the station collapses`)
  }

  const poorStations = stations.filter((s) => s.condition === 'void' || s.condition === 'cardboard-box')
  if (poorStations.length === stations.length && stations.length > 0) {
    recs.push('All stations are cardboard boxes — the titanium frontier needs space-station quality alloys throughout')
  }

  if (recs.length === 0) {
    recs.push('Your titanium frontier is ready for launch — every alloy embodies strength, vision, resistance, efficiency, and cosmic wisdom')
  }

  return recs
}
