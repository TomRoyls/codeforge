// ─── Interfaces ──────────────────────────────────────────

export interface AlloyingMeasure {
  strength: number
  alloy: 'superalloy' | 'titanium-grade' | 'proper-alloy' | 'base-metal' | 'impure-ore' | 'no-alloy'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasRobust: boolean
  hasVersatile: boolean
  hasAdaptable: boolean
  hasMultiPurpose: boolean
  hasResilient: boolean
  chaoticCount: number
  untestedCount: number
}

export interface ExploringMeasure {
  vision: number
  frontier: 'starship-grade' | 'orbital-class' | 'proper-craft' | 'ground-vehicle' | 'stationary' | 'no-vision'
  hasHighVision: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasForwardLooking: boolean
  hasScalable: boolean
  hasFutureProof: boolean
  hasAbstracted: boolean
  hasGeneralized: boolean
  hasPluggable: boolean
  hasConfigurable: boolean
  hasDecoupled: boolean
  hasParametric: boolean
  hasEvolutionary: boolean
  hasOpen: boolean
  hackedCount: number
  rigidCount: number
}

export interface ResistingMeasure {
  resistance: number
  shield: 'force-field' | 'titanium-armor' | 'proper-coating' | 'rust-prone' | 'dissolving' | 'no-resistance'
  hasHighResistance: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasMaintained: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasFortified: boolean
  hasImpervious: boolean
  unhandledCount: number
  volatileCount: number
}

export interface OptimizingMeasure {
  efficiency: number
  ratio: 'perfect-efficiency' | 'high-performance' | 'proper-ratio' | 'heavy-code' | 'bloated' | 'no-efficiency'
  hasHighEfficiency: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasLean: boolean
  hasNoBloated: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasPrecise: boolean
  hasNoApproximate: boolean
  hasOptimized: boolean
  hasDirect: boolean
  hasMinimal: boolean
  hasEssential: boolean
  hasStreamlined: boolean
  hasTrimmed: boolean
  hasNoRedundant: boolean
  wastefulCount: number
  bloatedCount: number
}

export interface NavigatingMeasure {
  wisdom: number
  navigation: 'stellar-cartographer' | 'space-navigator' | 'proper-pilot' | 'ground-observer' | 'lost-traveler' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasMature: boolean
  hasProven: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasContextual: boolean
  hasVisionary: boolean
  hasHolistic: boolean
  hasSystemic: boolean
  hasConnected: boolean
  hasEvolved: boolean
  hasWisdom: boolean
  hasAccumulated: boolean
  shallowCount: number
  naiveCount: number
}

export type PlateCondition =
  | 'titanium-masterpiece'
  | 'space-grade'
  | 'proper-alloy'
  | 'base-metal'
  | 'raw-ore'
  | 'void'

export interface TitaniumPlate {
  file: string
  alloyStrength: number
  frontierVision: number
  corrosionResistance: number
  weightEfficiency: number
  spaceWisdom: number
  alloying: AlloyingMeasure
  exploring: ExploringMeasure
  resisting: ResistingMeasure
  optimizing: OptimizingMeasure
  navigating: NavigatingMeasure
  condition: PlateCondition
  qualityScore: number
}

export type StationCondition =
  | 'starship-hull'
  | 'space-station'
  | 'proper-habitat'
  | 'metal-shed'
  | 'dirt-floor'
  | 'void'

export interface TitaniumStation {
  directory: string
  plates: TitaniumPlate[]
  avgStrength: number
  avgVision: number
  avgWisdom: number
  titaniumMasterpieceCount: number
  voidCount: number
  stationType: 'orbital-station' | 'lunar-base' | 'proper-outpost' | 'ground-facility' | 'tent-camp' | 'no-station'
  condition: StationCondition
}

export interface TitaniumHorizonResult {
  plates: TitaniumPlate[]
  stations: TitaniumStation[]
  mission: {
    avgStrength: number
    avgVision: number
    avgWisdom: number
    isTitanium: boolean
    overallAdvancement: number
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
    spaceGradeCount: number
    properAlloyCount: number
    baseMetalCount: number
    rawOreCount: number
    voidCount: number
    hasHighStrengthCount: number
    hasHighVisionCount: number
    hasHighResistanceCount: number
    hasHighEfficiencyCount: number
    hasHighWisdomCount: number
    overallAdvancement: number
    engineerGrade: 'rocket-scientist' | 'aerospace-engineer' | 'metallurgist' | 'apprentice' | 'novice' | 'tinkerer'
    bestPlate: string
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

/** @example classifyCondition(90) */
export function classifyCondition(score: number): PlateCondition {
  if (score >= 90) return 'titanium-masterpiece'
  if (score >= 75) return 'space-grade'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'base-metal'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifyStationType(plates) */
export function classifyStationType(
  plates: TitaniumPlate[],
): TitaniumStation['stationType'] {
  if (plates.length === 0) return 'no-station'
  const avg =
    plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length
  if (avg >= 85) return 'orbital-station'
  if (avg >= 70) return 'lunar-base'
  if (avg >= 55) return 'proper-outpost'
  if (avg >= 35) return 'ground-facility'
  return 'tent-camp'
}

/** @example classifyStationCondition(80) */
export function classifyStationCondition(score: number): StationCondition {
  if (score >= 85) return 'starship-hull'
  if (score >= 70) return 'space-station'
  if (score >= 55) return 'proper-habitat'
  if (score >= 35) return 'metal-shed'
  if (score >= 15) return 'dirt-floor'
  return 'void'
}

/** @example classifyEngineerGrade(80) */
export function classifyEngineerGrade(
  avgAdvancement: number,
): TitaniumHorizonResult['stats']['engineerGrade'] {
  if (avgAdvancement >= 80) return 'rocket-scientist'
  if (avgAdvancement >= 65) return 'aerospace-engineer'
  if (avgAdvancement >= 50) return 'metallurgist'
  if (avgAdvancement >= 35) return 'apprentice'
  if (avgAdvancement >= 20) return 'novice'
  return 'tinkerer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureAlloying('class X { private y: string }') */
export function measureAlloying(content: string): AlloyingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasNoMonolithic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = !/\bany\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasClean = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasVersatile = /\b(async|await|Promise)\b/.test(content)
  const hasAdaptable = /\b(function|=>|return)\b/.test(content)
  const hasMultiPurpose = /\b(readonly|as const)\b/.test(content)
  const hasResilient = /\b(try|catch|finally)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasTypeSafe,
    hasNoUnsafe,
    hasTested,
    hasNoUntested,
    hasClean,
    hasNoDirty,
    hasRobust,
    hasVersatile,
    hasAdaptable,
    hasMultiPurpose,
    hasResilient,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let alloy: AlloyingMeasure['alloy'] = 'no-alloy'
  if (strength >= 90) alloy = 'superalloy'
  else if (strength >= 75) alloy = 'titanium-grade'
  else if (strength >= 60) alloy = 'proper-alloy'
  else if (strength >= 40) alloy = 'base-metal'
  else if (strength >= 20) alloy = 'impure-ore'

  return {
    strength,
    alloy,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasTypeSafe,
    hasNoUnsafe,
    hasTested,
    hasNoUntested,
    hasClean,
    hasNoDirty,
    hasRobust,
    hasVersatile,
    hasAdaptable,
    hasMultiPurpose,
    hasResilient,
    chaoticCount,
    untestedCount,
  }
}

/** @example measureExploring('export class X extends Y { }') */
export function measureExploring(content: string): ExploringMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasExtensible = /\b(extends|implements)\b/.test(content) || /\b(class|interface)\b/.test(content)
  const rigidCount = (content.match(/\b(hardcoded|hardcoded|magic)\b/gi) ?? []).length
  const hasNoRigid = !/\b(hardcoded|magic-number|hard.coded)\b/i.test(content)
  const hasForwardLooking = /\b(async|await|Promise)\b/.test(content)
  const hasScalable = /\b(import|export)\b/.test(content)
  const hasFutureProof = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasAbstracted = /\b(interface|type|abstract)\b/.test(content)
  const hasGeneralized = /<T>|<T,/.test(content) || /\b(generic|type)\b/.test(content)
  const hasPluggable = /\b(readonly|private|protected)\b/.test(content)
  const hasConfigurable = /\b(export|public)\b/.test(content)
  const hasDecoupled = /\b(import|export)\b/.test(content)
  const hasParametric = /\b(function|class|=>)\b/.test(content)
  const hasEvolutionary = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOpen = !/\bany\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasExtensible,
    hasNoRigid,
    hasForwardLooking,
    hasScalable,
    hasFutureProof,
    hasAbstracted,
    hasGeneralized,
    hasPluggable,
    hasConfigurable,
    hasDecoupled,
    hasParametric,
    hasEvolutionary,
    hasOpen,
  ]

  const vision = computeScore(positiveBooleans)
  const hasHighVision = vision >= 60

  let frontier: ExploringMeasure['frontier'] = 'no-vision'
  if (vision >= 90) frontier = 'starship-grade'
  else if (vision >= 75) frontier = 'orbital-class'
  else if (vision >= 60) frontier = 'proper-craft'
  else if (vision >= 40) frontier = 'ground-vehicle'
  else if (vision >= 20) frontier = 'stationary'

  return {
    vision,
    frontier,
    hasHighVision,
    hasWellArchitected,
    hasNoHacked,
    hasExtensible,
    hasNoRigid,
    hasForwardLooking,
    hasScalable,
    hasFutureProof,
    hasAbstracted,
    hasGeneralized,
    hasPluggable,
    hasConfigurable,
    hasDecoupled,
    hasParametric,
    hasEvolutionary,
    hasOpen,
    hackedCount,
    rigidCount,
  }
}

/** @example measureResisting('try { x() } catch { y() }') */
export function measureResisting(content: string): ResistingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw|catch)\b/.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /\b(type|interface|class)\b/.test(content)
  const hasNoErratic = !/\b(erratic|random|unpredictable)\b/i.test(content)
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnduring = /\b(import|export)\b/.test(content)
  const hasDurable = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasHardened = /\b(try|catch)\b/.test(content)
  const hasReinforced = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasFortified = /\b(function|=>|return)\b/.test(content)
  const hasImpervious = !/\bany\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasNoErratic,
    hasMaintained,
    hasEnduring,
    hasDurable,
    hasHardened,
    hasReinforced,
    hasFortified,
    hasImpervious,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60

  let shield: ResistingMeasure['shield'] = 'no-resistance'
  if (resistance >= 90) shield = 'force-field'
  else if (resistance >= 75) shield = 'titanium-armor'
  else if (resistance >= 60) shield = 'proper-coating'
  else if (resistance >= 40) shield = 'rust-prone'
  else if (resistance >= 20) shield = 'dissolving'

  return {
    resistance,
    shield,
    hasHighResistance,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasNoErratic,
    hasMaintained,
    hasEnduring,
    hasDurable,
    hasHardened,
    hasReinforced,
    hasFortified,
    hasImpervious,
    unhandledCount,
    volatileCount,
  }
}

/** @example measureOptimizing('function f(): string { return "" }') */
export function measureOptimizing(content: string): OptimizingMeasure {
  const hasEfficient = /\b(function|=>|return)\b/.test(content)
  const wastefulCount = (content.match(/\b(hack|workaround|bypass)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasLean = !/\bany\b/.test(content)
  const bloatedCount = (content.match(/\b(global|window|document)\b/g) ?? []).length
  const hasNoBloated = bloatedCount === 0
  const hasFocused = /\b(const|readonly)\b/.test(content)
  const hasNoScattered = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasPrecise = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|around)\b/i.test(content)
  const hasOptimized = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(import|export)\b/.test(content)
  const hasMinimal = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasEssential = /\b(class|interface|type)\b/.test(content)
  const hasStreamlined = /\b(try|catch|if)\b/.test(content)
  const hasTrimmed = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasNoRedundant = (content.match(/\bvar\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasEfficient,
    hasNoWasteful,
    hasLean,
    hasNoBloated,
    hasFocused,
    hasNoScattered,
    hasPrecise,
    hasNoApproximate,
    hasOptimized,
    hasDirect,
    hasMinimal,
    hasEssential,
    hasStreamlined,
    hasTrimmed,
    hasNoRedundant,
  ]

  const efficiency = computeScore(positiveBooleans)
  const hasHighEfficiency = efficiency >= 60

  let ratio: OptimizingMeasure['ratio'] = 'no-efficiency'
  if (efficiency >= 90) ratio = 'perfect-efficiency'
  else if (efficiency >= 75) ratio = 'high-performance'
  else if (efficiency >= 60) ratio = 'proper-ratio'
  else if (efficiency >= 40) ratio = 'heavy-code'
  else if (efficiency >= 20) ratio = 'bloated'

  return {
    efficiency,
    ratio,
    hasHighEfficiency,
    hasEfficient,
    hasNoWasteful,
    hasLean,
    hasNoBloated,
    hasFocused,
    hasNoScattered,
    hasPrecise,
    hasNoApproximate,
    hasOptimized,
    hasDirect,
    hasMinimal,
    hasEssential,
    hasStreamlined,
    hasTrimmed,
    hasNoRedundant,
    wastefulCount,
    bloatedCount,
  }
}

/** @example measureNavigating('class X implements Y { readonly z: string }') */
export function measureNavigating(content: string): NavigatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasProven = /\b(export|public)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasContextual = /\b(async|await|Promise)\b/.test(content)
  const hasVisionary = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasHolistic = /\b(function|class|interface)\b/.test(content)
  const hasSystemic = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(return|throw)\b/.test(content)
  const hasEvolved = /\b(extends|implements)\b/.test(content) || /\b(class|interface)\b/.test(content)
  const hasWisdom = !/\b(quick|dirty|temporary)\b/i.test(content)
  const hasAccumulated = !/\bany\b/.test(content)

  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length
  const naiveCount = (content.match(/\b(naive|simple.minded|unsophisticated)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasMature,
    hasProven,
    hasStrategic,
    hasInsightful,
    hasContextual,
    hasVisionary,
    hasHolistic,
    hasSystemic,
    hasConnected,
    hasEvolved,
    hasWisdom,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let navigation: NavigatingMeasure['navigation'] = 'no-wisdom'
  if (wisdom >= 90) navigation = 'stellar-cartographer'
  else if (wisdom >= 75) navigation = 'space-navigator'
  else if (wisdom >= 60) navigation = 'proper-pilot'
  else if (wisdom >= 40) navigation = 'ground-observer'
  else if (wisdom >= 20) navigation = 'lost-traveler'

  return {
    wisdom,
    navigation,
    hasHighWisdom,
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasMature,
    hasProven,
    hasStrategic,
    hasInsightful,
    hasContextual,
    hasVisionary,
    hasHolistic,
    hasSystemic,
    hasConnected,
    hasEvolved,
    hasWisdom,
    hasAccumulated,
    shallowCount,
    naiveCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeTitaniumPlate(content, 'app.ts') */
export function analyzeTitaniumPlate(content: string, filePath: string): TitaniumPlate {
  const alloying = measureAlloying(content)
  const exploring = measureExploring(content)
  const resisting = measureResisting(content)
  const optimizing = measureOptimizing(content)
  const navigating = measureNavigating(content)

  const alloyStrength = alloying.strength
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

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    alloyStrength,
    frontierVision,
    corrosionResistance,
    weightEfficiency,
    spaceWisdom,
    alloying,
    exploring,
    resisting,
    optimizing,
    navigating,
    condition,
    qualityScore,
  }
}

/** @example analyzeTitaniumStation(plates, 'src') */
export function analyzeTitaniumStation(plates: TitaniumPlate[], dirPath: string): TitaniumStation {
  if (plates.length === 0) {
    return {
      directory: dirPath,
      plates: [],
      avgStrength: 0,
      avgVision: 0,
      avgWisdom: 0,
      titaniumMasterpieceCount: 0,
      voidCount: 0,
      stationType: 'no-station',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(
    plates.reduce((s, p) => s + p.alloyStrength, 0) / plates.length,
  )
  const avgVision = Math.round(
    plates.reduce((s, p) => s + p.frontierVision, 0) / plates.length,
  )
  const avgWisdom = Math.round(
    plates.reduce((s, p) => s + p.spaceWisdom, 0) / plates.length,
  )

  const titaniumMasterpieceCount = plates.filter(
    (p) => p.condition === 'titanium-masterpiece',
  ).length
  const voidCount = plates.filter((p) => p.condition === 'void').length

  const stationType = classifyStationType(plates)
  const avgQuality = Math.round(
    plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length,
  )
  const condition = classifyStationCondition(avgQuality)

  return {
    directory: dirPath,
    plates,
    avgStrength,
    avgVision,
    avgWisdom,
    titaniumMasterpieceCount,
    voidCount,
    stationType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildTitaniumHorizonResult(['a.ts'], [content]) */
export async function buildTitaniumHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TitaniumHorizonResult> {
  const plates: TitaniumPlate[] = files.map((file, i) =>
    analyzeTitaniumPlate(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TitaniumPlate[]>()
  for (const plate of plates) {
    const dir = plate.file.includes('/')
      ? plate.file.substring(0, plate.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(plate)
    } else {
      dirMap.set(dir, [plate])
    }
  }

  const stations: TitaniumStation[] = Array.from(dirMap.entries()).map(([dir, dirPlates]) =>
    analyzeTitaniumStation(dirPlates, dir),
  )

  const avgStrength =
    plates.length > 0
      ? Math.round(plates.reduce((s, p) => s + p.alloyStrength, 0) / plates.length)
      : 0
  const avgVision =
    plates.length > 0
      ? Math.round(plates.reduce((s, p) => s + p.frontierVision, 0) / plates.length)
      : 0
  const avgWisdom =
    plates.length > 0
      ? Math.round(plates.reduce((s, p) => s + p.spaceWisdom, 0) / plates.length)
      : 0

  const overallAdvancement =
    plates.length > 0
      ? Math.round(plates.reduce((s, p) => s + p.qualityScore, 0) / plates.length)
      : 0
  const isTitanium = overallAdvancement >= 60

  const mission = { avgStrength, avgVision, avgWisdom, isTitanium, overallAdvancement }

  const avgAlloyStrength = avgStrength
  const avgFrontierVision = avgVision
  const avgCorrosionResistance =
    plates.length > 0
      ? Math.round(plates.reduce((s, p) => s + p.corrosionResistance, 0) / plates.length)
      : 0
  const avgWeightEfficiency =
    plates.length > 0
      ? Math.round(plates.reduce((s, p) => s + p.weightEfficiency, 0) / plates.length)
      : 0
  const avgSpaceWisdom = avgWisdom

  const titaniumMasterpieceCount = plates.filter(
    (p) => p.condition === 'titanium-masterpiece',
  ).length
  const spaceGradeCount = plates.filter(
    (p) => p.condition === 'space-grade',
  ).length
  const properAlloyCount = plates.filter(
    (p) => p.condition === 'proper-alloy',
  ).length
  const baseMetalCount = plates.filter(
    (p) => p.condition === 'base-metal',
  ).length
  const rawOreCount = plates.filter(
    (p) => p.condition === 'raw-ore',
  ).length
  const voidCount = plates.filter((p) => p.condition === 'void').length

  const hasHighStrengthCount = plates.filter(
    (p) => p.alloying.hasHighStrength,
  ).length
  const hasHighVisionCount = plates.filter(
    (p) => p.exploring.hasHighVision,
  ).length
  const hasHighResistanceCount = plates.filter(
    (p) => p.resisting.hasHighResistance,
  ).length
  const hasHighEfficiencyCount = plates.filter(
    (p) => p.optimizing.hasHighEfficiency,
  ).length
  const hasHighWisdomCount = plates.filter(
    (p) => p.navigating.hasHighWisdom,
  ).length

  const engineerGrade = classifyEngineerGrade(overallAdvancement)

  const bestPlate = plates.length > 0
    ? plates.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const strongest = plates.length > 0
    ? plates.reduce((best, p) => (p.alloyStrength > best.alloyStrength ? p : best)).file
    : ''
  const mostVisionary = plates.length > 0
    ? plates.reduce((best, p) => (p.frontierVision > best.frontierVision ? p : best)).file
    : ''
  const mostResistant = plates.length > 0
    ? plates.reduce((best, p) => (p.corrosionResistance > best.corrosionResistance ? p : best)).file
    : ''
  const mostEfficient = plates.length > 0
    ? plates.reduce((best, p) => (p.weightEfficiency > best.weightEfficiency ? p : best)).file
    : ''
  const wisest = plates.length > 0
    ? plates.reduce((best, p) => (p.spaceWisdom > best.spaceWisdom ? p : best)).file
    : ''

  const stats: TitaniumHorizonResult['stats'] = {
    totalFiles: files.length,
    totalStations: stations.length,
    avgAlloyStrength,
    avgFrontierVision,
    avgCorrosionResistance,
    avgWeightEfficiency,
    avgSpaceWisdom,
    titaniumMasterpieceCount,
    spaceGradeCount,
    properAlloyCount,
    baseMetalCount,
    rawOreCount,
    voidCount,
    hasHighStrengthCount,
    hasHighVisionCount,
    hasHighResistanceCount,
    hasHighEfficiencyCount,
    hasHighWisdomCount,
    overallAdvancement,
    engineerGrade,
    bestPlate,
    strongest,
    mostVisionary,
    mostResistant,
    mostEfficient,
    wisest,
  }

  const recommendations = generateRecommendations(plates, stations, mission, stats)

  return { plates, stations, mission, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(plates, stations, mission, stats) */
export function generateRecommendations(
  plates: TitaniumPlate[],
  stations: TitaniumStation[],
  mission: TitaniumHorizonResult['mission'],
  stats: TitaniumHorizonResult['stats'],
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
      'Your titanium frontier is a masterpiece of space-grade engineering! Each plate gleams with the strength of a starship hull!',
    )
    return recs
  }

  if (stats.avgAlloyStrength < 60) {
    recs.push(
      'Strengthen the alloy — code should combine multiple strengths like titanium alloys combining the best properties of each element',
    )
  }

  if (stats.avgFrontierVision < 60) {
    recs.push(
      'Look beyond the horizon — code should be forward-looking, extensible, and ready for the unknown territories ahead',
    )
  }

  if (stats.avgCorrosionResistance < 60) {
    recs.push(
      'Resist the corrosion — code should be immune to decay like titanium survives aqua regia, handling errors and edge cases',
    )
  }

  if (stats.avgWeightEfficiency < 60) {
    recs.push(
      'Optimize the weight — code should achieve maximum impact with minimum complexity, like titanium\'s legendary strength-to-weight ratio',
    )
  }

  if (stats.avgSpaceWisdom < 60) {
    recs.push(
      'Navigate with wisdom — code should carry the perspective of the cosmos, informed by proven patterns and deep understanding',
    )
  }

  if (stats.overallAdvancement < 40) {
    recs.push(
      'The mission has stalled — reforge the entire titanium structure before the frontier moves beyond reach',
    )
  }

  const voidPlates = plates.filter((p) => p.condition === 'void')
  if (voidPlates.length > 0 && voidPlates.length <= 5) {
    recs.push(
      `Re-examine these raw ore plates: ${voidPlates.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPlates.length > 5) {
    recs.push(
      `Re-examine these ${voidPlates.length} raw ore plates before the mission runs out of fuel`,
    )
  }

  const poorStations = stations.filter(
    (s) => s.condition === 'void' || s.condition === 'dirt-floor',
  )
  if (poorStations.length === stations.length && stations.length > 0) {
    recs.push(
      'All stations have decommissioned — the titanium frontier needs reconstruction from the launch pad up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your titanium horizon gleams with space-grade precision — each plate is a marvel of aerospace engineering')
  }

  return recs
}
