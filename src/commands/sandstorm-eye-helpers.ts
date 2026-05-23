// ─── Types ─────────────────────────────────────────────────────────────────

export interface ResilientMeasure {
  stability: number
  calm: 'eye-of-storm' | 'steady-center' | 'calm-amidst' | 'swaying' | 'tumbling' | 'blown-away'
  hasHighStability: boolean
  hasStable: boolean
  hasGrounded: boolean
  hasNoTurbulence: boolean
  hasResilient: boolean
  hasNoFragility: boolean
  hasComposed: boolean
  hasNoPanic: boolean
  hasCentered: boolean
  hasNoChaos: boolean
  turbulenceCount: number
  panicCount: number
}

export interface FocusedMeasure {
  clarity: number
  stillness: 'zen-master' | 'clear-focus' | 'proper-concentration' | 'distracted' | 'scattered' | 'lost'
  hasHighClarity: boolean
  hasClear: boolean
  hasFocused: boolean
  hasNoDistraction: boolean
  hasConcentrated: boolean
  hasNoTangents: boolean
  hasPurposeful: boolean
  hasNoWandering: boolean
  hasDirected: boolean
  hasNoMeandering: boolean
  distractionCount: number
  tangentCount: number
}

export interface FilteringMeasure {
  signalToNoise: number
  quality: 'pure-crystal' | 'filtered-water' | 'proper-sieve' | 'coarse-filter' | 'muddy-water' | 'raw-sand'
  hasHighSignalToNoise: boolean
  hasClean: boolean
  hasEssential: boolean
  hasNoWaste: boolean
  hasFiltered: boolean
  hasNoNoise: boolean
  hasValuable: boolean
  hasNoFiller: boolean
  hasConcentrated: boolean
  hasNoBloat: boolean
  wasteCount: number
  noiseCount: number
}

export interface EnduringMeasure {
  persistence: number
  visibility: 'eternal-flame' | 'steady-beacon' | 'reliable-light' | 'flickering' | 'dimming' | 'extinguished'
  hasHighPersistence: boolean
  hasDurable: boolean
  hasLasting: boolean
  hasNoEphemeral: boolean
  hasEnduring: boolean
  hasNoFading: boolean
  hasPersistent: boolean
  hasNoDisposable: boolean
  hasReliable: boolean
  hasNoTemporary: boolean
  ephemeralCount: number
  fadingCount: number
}

export interface NavigatingMeasure {
  errorHandling: number
  skill: 'desert-guide' | 'pathfinder' | 'navigator' | 'wanderer' | 'lost-traveler' | 'doomed'
  hasHighErrorHandling: boolean
  hasErrorHandling: boolean
  hasDefensive: boolean
  hasNoCrashPaths: boolean
  hasGraceful: boolean
  hasNoFatal: boolean
  hasRecovery: boolean
  hasNoSwallowed: boolean
  hasSafePaths: boolean
  hasNoDeadEnds: boolean
  crashPathCount: number
  fatalCount: number
}

export interface SurvivingMeasure {
  durability: number
  fitness: 'desert-hardy' | 'drought-resistant' | 'adaptable' | 'fragile-bloom' | 'wilting' | 'dead'
  hasHighDurability: boolean
  hasHardy: boolean
  hasTested: boolean
  hasNoBrittleness: boolean
  hasProven: boolean
  hasNoFragility: boolean
  hasRobust: boolean
  hasNoVulnerability: boolean
  hasBattleTested: boolean
  hasNoWeakness: boolean
  brittlenessCount: number
  fragilityCount: number
}

export type GrainCondition = 'storm-calmer' | 'clearing-skies' | 'dust-settling' | 'gritty-wind' | 'howling-gale' | 'total-whiteout'

export interface StormGrain {
  file: string
  chaosResilience: number
  stillnessFocus: number
  grainFiltration: number
  visibilityEndurance: number
  stormNavigation: number
  desertSurvival: number
  resilient: ResilientMeasure
  focused: FocusedMeasure
  filtering: FilteringMeasure
  enduring: EnduringMeasure
  navigating: NavigatingMeasure
  surviving: SurvivingMeasure
  condition: GrainCondition
  qualityScore: number
}

export type ClusterType = 'desert-oasis' | 'sheltered-valley' | 'wind-break' | 'sand-dune' | 'dust-bowl' | 'wasteland'
export type ClusterCondition = 'safe-haven' | 'sheltered-ground' | 'navigable-terrain' | 'difficult-passage' | 'hostile-ground' | 'death-valley'

export interface OasisCluster {
  directory: string
  grains: StormGrain[]
  avgResilience: number
  avgFiltration: number
  avgSurvival: number
  stormCalmerCount: number
  totalWhiteoutCount: number
  clearingSkiesCount: number
  dustSettlingCount: number
  clusterType: ClusterType
  condition: ClusterCondition
}

export interface SandstormDesert {
  avgResilience: number
  avgFiltration: number
  avgSurvival: number
  isCalm: boolean
  overallResilience: number
}

export type NomadGrade = 'desert-sage' | 'master-nomad' | 'experienced-guide' | 'seasoned-traveler' | 'lost-wanderer' | 'sand-blinded'

export interface SandstormEyeStats {
  totalFiles: number
  totalClusters: number
  avgChaosResilience: number
  avgStillnessFocus: number
  avgGrainFiltration: number
  avgVisibilityEndurance: number
  avgStormNavigation: number
  avgDesertSurvival: number
  stormCalmerCount: number
  clearingSkiesCount: number
  dustSettlingCount: number
  grittyWindCount: number
  howlingGaleCount: number
  totalWhiteoutCount: number
  hasHighStabilityCount: number
  hasHighClarityCount: number
  hasHighSignalToNoiseCount: number
  hasHighPersistenceCount: number
  hasHighErrorHandlingCount: number
  hasHighDurabilityCount: number
  overallResilience: number
  nomadGrade: NomadGrade
  bestGrain: string
  mostResilient: string
  mostFocused: string
  bestFiltered: string
  mostEnduring: string
  bestNavigator: string
}

export interface SandstormEyeResult {
  grains: StormGrain[]
  clusters: OasisCluster[]
  desert: SandstormDesert
  stats: SandstormEyeStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureResilient(content) evaluates code stability */
export function measureResilient(content: string): ResilientMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const turbulenceMatches = content.match(/\bvar\s+/g)
  const turbulenceCount = turbulenceMatches ? turbulenceMatches.length : 0
  const panicMatches = content.match(/\bany\b/g)
  const panicCount = panicMatches ? panicMatches.length : 0

  const hasStable = hasConst && hasReturnType
  const hasGrounded = hasExport && hasNamedExport
  const hasResilient = hasInterface && hasClass
  const hasComposed = hasStrictEquality && hasOptionalChaining
  const hasCentered = hasPrivate && hasReadonly

  let stability = 0
  if (hasExport) stability += 8
  if (hasConst) stability += 10
  if (hasReturnType) stability += 10
  if (hasInterface) stability += 8
  if (hasClass) stability += 8
  if (hasPrivate) stability += 8
  if (hasReadonly) stability += 8
  if (hasStrictEquality) stability += 10
  if (hasNamedExport) stability += 8
  if (hasOptionalChaining) stability += 8
  if (hasStable) stability += 5
  if (hasGrounded) stability += 5
  if (hasResilient) stability += 5
  if (hasComposed) stability += 5
  if (hasCentered) stability += 5

  stability = Math.min(100, Math.round(stability))

  let calm: ResilientMeasure['calm'] = 'blown-away'
  if (stability >= 85) calm = 'eye-of-storm'
  else if (stability >= 70) calm = 'steady-center'
  else if (stability >= 55) calm = 'calm-amidst'
  else if (stability >= 40) calm = 'swaying'
  else if (stability >= 25) calm = 'tumbling'

  return {
    stability,
    calm,
    hasHighStability: stability >= 70,
    hasStable,
    hasGrounded,
    hasNoTurbulence: turbulenceCount === 0,
    hasResilient,
    hasNoFragility: panicCount === 0,
    hasComposed,
    hasNoPanic: turbulenceCount === 0 && panicCount === 0,
    hasCentered,
    hasNoChaos: turbulenceCount === 0,
    turbulenceCount,
    panicCount,
  }
}

/** @example measureFocused(content) evaluates code clarity */
export function measureFocused(content: string): FocusedMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasAsync = /\basync\s+/.test(content)

  const distractionMatches = content.match(/\bvar\s+/g)
  const distractionCount = distractionMatches ? distractionMatches.length : 0
  const tangentMatches = content.match(/\bany\b/g)
  const tangentCount = tangentMatches ? tangentMatches.length : 0

  const hasClear = hasExport && hasReturnType
  const hasFocused = hasInterface && hasClass
  const hasConcentrated = hasConst && hasTypeAnnotation
  const hasPurposeful = hasNamedExport && hasAsync
  const hasDirected = hasImport && hasDocComments

  let clarity = 0
  if (hasExport) clarity += 10
  if (hasImport) clarity += 10
  if (hasReturnType) clarity += 10
  if (hasInterface) clarity += 8
  if (hasClass) clarity += 8
  if (hasConst) clarity += 8
  if (hasDocComments) clarity += 10
  if (hasTypeAnnotation) clarity += 8
  if (hasNamedExport) clarity += 8
  if (hasAsync) clarity += 8
  if (hasClear) clarity += 5
  if (hasFocused) clarity += 5
  if (hasConcentrated) clarity += 5
  if (hasPurposeful) clarity += 5
  if (hasDirected) clarity += 5

  clarity = Math.min(100, Math.round(clarity))

  let stillness: FocusedMeasure['stillness'] = 'lost'
  if (clarity >= 85) stillness = 'zen-master'
  else if (clarity >= 70) stillness = 'clear-focus'
  else if (clarity >= 55) stillness = 'proper-concentration'
  else if (clarity >= 40) stillness = 'distracted'
  else if (clarity >= 25) stillness = 'scattered'

  return {
    clarity,
    stillness,
    hasHighClarity: clarity >= 70,
    hasClear,
    hasFocused,
    hasNoDistraction: distractionCount === 0,
    hasConcentrated,
    hasNoTangents: tangentCount === 0,
    hasPurposeful,
    hasNoWandering: distractionCount === 0 && tangentCount === 0,
    hasDirected,
    hasNoMeandering: distractionCount === 0,
    distractionCount,
    tangentCount,
  }
}

/** @example measureFiltering(content) evaluates code signal-to-noise */
export function measureFiltering(content: string): FilteringMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const wasteMatches = content.match(/\bvar\s+/g)
  const wasteCount = wasteMatches ? wasteMatches.length : 0
  const noiseMatches = content.match(/\bany\b/g)
  const noiseCount = noiseMatches ? noiseMatches.length : 0

  const hasClean = hasExport && hasReturnType
  const hasEssential = hasInterface && hasConst
  const hasFiltered = hasPrivate && hasReadonly
  const hasValuable = hasGenerics && hasTypeAlias
  const hasConcentrated = hasEnum && hasNamedExport

  let signalToNoise = 0
  if (hasExport) signalToNoise += 10
  if (hasInterface) signalToNoise += 10
  if (hasReturnType) signalToNoise += 10
  if (hasConst) signalToNoise += 8
  if (hasTypeAlias) signalToNoise += 8
  if (hasEnum) signalToNoise += 8
  if (hasGenerics) signalToNoise += 8
  if (hasPrivate) signalToNoise += 8
  if (hasReadonly) signalToNoise += 8
  if (hasNamedExport) signalToNoise += 10
  if (hasClean) signalToNoise += 5
  if (hasEssential) signalToNoise += 5
  if (hasFiltered) signalToNoise += 5
  if (hasValuable) signalToNoise += 5
  if (hasConcentrated) signalToNoise += 5

  signalToNoise = Math.min(100, Math.round(signalToNoise))

  let quality: FilteringMeasure['quality'] = 'raw-sand'
  if (signalToNoise >= 85) quality = 'pure-crystal'
  else if (signalToNoise >= 70) quality = 'filtered-water'
  else if (signalToNoise >= 55) quality = 'proper-sieve'
  else if (signalToNoise >= 40) quality = 'coarse-filter'
  else if (signalToNoise >= 25) quality = 'muddy-water'

  return {
    signalToNoise,
    quality,
    hasHighSignalToNoise: signalToNoise >= 70,
    hasClean,
    hasEssential,
    hasNoWaste: wasteCount === 0,
    hasFiltered,
    hasNoNoise: noiseCount === 0,
    hasValuable,
    hasNoFiller: wasteCount === 0 && noiseCount === 0,
    hasConcentrated,
    hasNoBloat: wasteCount === 0,
    wasteCount,
    noiseCount,
  }
}

/** @example measureEnduring(content) evaluates code persistence */
export function measureEnduring(content: string): EnduringMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const ephemeralMatches = content.match(/\bvar\s+/g)
  const ephemeralCount = ephemeralMatches ? ephemeralMatches.length : 0
  const fadingMatches = content.match(/\bany\b/g)
  const fadingCount = fadingMatches ? fadingMatches.length : 0

  const hasDurable = hasExport && hasConst
  const hasLasting = hasReturnType && hasNamedExport
  const hasEnduring = hasDocComments && hasTypeAnnotation
  const hasPersistent = hasInterface && hasClass
  const hasReliable = hasStrictEquality && hasReadonly

  let persistence = 0
  if (hasExport) persistence += 10
  if (hasConst) persistence += 10
  if (hasReturnType) persistence += 10
  if (hasNamedExport) persistence += 8
  if (hasDocComments) persistence += 8
  if (hasTypeAnnotation) persistence += 8
  if (hasInterface) persistence += 10
  if (hasClass) persistence += 8
  if (hasStrictEquality) persistence += 8
  if (hasReadonly) persistence += 8
  if (hasDurable) persistence += 5
  if (hasLasting) persistence += 5
  if (hasEnduring) persistence += 5
  if (hasPersistent) persistence += 5
  if (hasReliable) persistence += 5

  persistence = Math.min(100, Math.round(persistence))

  let visibility: EnduringMeasure['visibility'] = 'extinguished'
  if (persistence >= 85) visibility = 'eternal-flame'
  else if (persistence >= 70) visibility = 'steady-beacon'
  else if (persistence >= 55) visibility = 'reliable-light'
  else if (persistence >= 40) visibility = 'flickering'
  else if (persistence >= 25) visibility = 'dimming'

  return {
    persistence,
    visibility,
    hasHighPersistence: persistence >= 70,
    hasDurable,
    hasLasting,
    hasNoEphemeral: ephemeralCount === 0,
    hasEnduring,
    hasNoFading: fadingCount === 0,
    hasPersistent,
    hasNoDisposable: ephemeralCount === 0 && fadingCount === 0,
    hasReliable,
    hasNoTemporary: ephemeralCount === 0,
    ephemeralCount,
    fadingCount,
  }
}

/** @example measureNavigating(content) evaluates code error handling */
export function measureNavigating(content: string): NavigatingMeasure {
  const hasExport = /export\s/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const crashPathMatches = content.match(/\bvar\s+/g)
  const crashPathCount = crashPathMatches ? crashPathMatches.length : 0
  const fatalMatches = content.match(/\bany\b/g)
  const fatalCount = fatalMatches ? fatalMatches.length : 0

  const hasErrorHandling = hasTryCatch && hasAsync
  const hasDefensive = hasReturnType && hasOptionalChaining
  const hasGraceful = hasNullishCoalescing && hasConst
  const hasRecovery = hasInterface && hasDefaultParam
  const hasSafePaths = hasNamedExport && hasExport

  let errorHandling = 0
  if (hasExport) errorHandling += 8
  if (hasTryCatch) errorHandling += 10
  if (hasReturnType) errorHandling += 10
  if (hasOptionalChaining) errorHandling += 10
  if (hasNullishCoalescing) errorHandling += 8
  if (hasInterface) errorHandling += 8
  if (hasAsync) errorHandling += 8
  if (hasConst) errorHandling += 8
  if (hasDefaultParam) errorHandling += 8
  if (hasNamedExport) errorHandling += 8
  if (hasErrorHandling) errorHandling += 5
  if (hasDefensive) errorHandling += 5
  if (hasGraceful) errorHandling += 5
  if (hasRecovery) errorHandling += 5
  if (hasSafePaths) errorHandling += 5

  errorHandling = Math.min(100, Math.round(errorHandling))

  let skill: NavigatingMeasure['skill'] = 'doomed'
  if (errorHandling >= 85) skill = 'desert-guide'
  else if (errorHandling >= 70) skill = 'pathfinder'
  else if (errorHandling >= 55) skill = 'navigator'
  else if (errorHandling >= 40) skill = 'wanderer'
  else if (errorHandling >= 25) skill = 'lost-traveler'

  return {
    errorHandling,
    skill,
    hasHighErrorHandling: errorHandling >= 70,
    hasErrorHandling,
    hasDefensive,
    hasNoCrashPaths: crashPathCount === 0,
    hasGraceful,
    hasNoFatal: fatalCount === 0,
    hasRecovery,
    hasNoSwallowed: crashPathCount === 0 && fatalCount === 0,
    hasSafePaths,
    hasNoDeadEnds: crashPathCount === 0,
    crashPathCount,
    fatalCount,
  }
}

/** @example measureSurviving(content) evaluates code durability */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const brittlenessMatches = content.match(/\bvar\s+/g)
  const brittlenessCount = brittlenessMatches ? brittlenessMatches.length : 0
  const fragilityMatches = content.match(/\bany\b/g)
  const fragilityCount = fragilityMatches ? fragilityMatches.length : 0

  const hasHardy = hasExport && hasConst
  const hasTested = hasReturnType && hasDocComments
  const hasProven = hasInterface && hasClass
  const hasRobust = hasPrivate && hasReadonly
  const hasBattleTested = hasNamedExport && hasTypeAnnotation

  let durability = 0
  if (hasExport) durability += 10
  if (hasInterface) durability += 8
  if (hasClass) durability += 8
  if (hasPrivate) durability += 10
  if (hasReadonly) durability += 8
  if (hasReturnType) durability += 10
  if (hasConst) durability += 8
  if (hasDocComments) durability += 10
  if (hasNamedExport) durability += 8
  if (hasTypeAnnotation) durability += 8
  if (hasHardy) durability += 5
  if (hasTested) durability += 5
  if (hasProven) durability += 5
  if (hasRobust) durability += 5
  if (hasBattleTested) durability += 5

  durability = Math.min(100, Math.round(durability))

  let fitness: SurvivingMeasure['fitness'] = 'dead'
  if (durability >= 85) fitness = 'desert-hardy'
  else if (durability >= 70) fitness = 'drought-resistant'
  else if (durability >= 55) fitness = 'adaptable'
  else if (durability >= 40) fitness = 'fragile-bloom'
  else if (durability >= 25) fitness = 'wilting'

  return {
    durability,
    fitness,
    hasHighDurability: durability >= 70,
    hasHardy,
    hasTested,
    hasNoBrittleness: brittlenessCount === 0,
    hasProven,
    hasNoFragility: fragilityCount === 0,
    hasRobust,
    hasNoVulnerability: brittlenessCount === 0 && fragilityCount === 0,
    hasBattleTested,
    hasNoWeakness: brittlenessCount === 0,
    brittlenessCount,
    fragilityCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'storm-calmer' */
export function classifyCondition(score: number): GrainCondition {
  if (score >= 85) return 'storm-calmer'
  if (score >= 70) return 'clearing-skies'
  if (score >= 55) return 'dust-settling'
  if (score >= 40) return 'gritty-wind'
  if (score >= 25) return 'howling-gale'
  return 'total-whiteout'
}

/** @example classifyClusterType(grains) returns cluster classification */
export function classifyClusterType(grains: StormGrain[]): ClusterType {
  if (grains.length === 0) return 'wasteland'
  const avgQs = grains.reduce((s, g) => s + g.qualityScore, 0) / grains.length
  const calmerCount = grains.filter((g) => g.condition === 'storm-calmer').length
  const ratio = calmerCount / grains.length
  if (avgQs >= 75 && ratio >= 0.5) return 'desert-oasis'
  if (avgQs >= 60) return 'sheltered-valley'
  if (avgQs >= 45) return 'wind-break'
  if (avgQs >= 30) return 'sand-dune'
  if (avgQs >= 15) return 'dust-bowl'
  return 'wasteland'
}

/** @example classifyClusterCondition(avgQs) returns cluster condition */
export function classifyClusterCondition(avgQs: number): ClusterCondition {
  if (avgQs >= 75) return 'safe-haven'
  if (avgQs >= 60) return 'sheltered-ground'
  if (avgQs >= 45) return 'navigable-terrain'
  if (avgQs >= 30) return 'difficult-passage'
  if (avgQs >= 15) return 'hostile-ground'
  return 'death-valley'
}

/** @example classifyNomadGrade(80) returns 'desert-sage' */
export function classifyNomadGrade(avgResilience: number): NomadGrade {
  if (avgResilience >= 80) return 'desert-sage'
  if (avgResilience >= 65) return 'master-nomad'
  if (avgResilience >= 50) return 'experienced-guide'
  if (avgResilience >= 35) return 'seasoned-traveler'
  if (avgResilience >= 20) return 'lost-wanderer'
  return 'sand-blinded'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeStormGrain(content, filePath) evaluates single file */
export function analyzeStormGrain(content: string, filePath: string): StormGrain {
  const resilient = measureResilient(content)
  const focused = measureFocused(content)
  const filtering = measureFiltering(content)
  const enduring = measureEnduring(content)
  const navigating = measureNavigating(content)
  const surviving = measureSurviving(content)

  const qualityScore = Math.round(
    resilient.stability * 0.2 +
    focused.clarity * 0.15 +
    filtering.signalToNoise * 0.15 +
    enduring.persistence * 0.15 +
    navigating.errorHandling * 0.15 +
    surviving.durability * 0.2,
  )

  return {
    file: filePath,
    chaosResilience: resilient.stability,
    stillnessFocus: focused.clarity,
    grainFiltration: filtering.signalToNoise,
    visibilityEndurance: enduring.persistence,
    stormNavigation: navigating.errorHandling,
    desertSurvival: surviving.durability,
    resilient,
    focused,
    filtering,
    enduring,
    navigating,
    surviving,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeOasisCluster(grains, dirPath) evaluates directory */
export function analyzeOasisCluster(grains: StormGrain[], dirPath: string): OasisCluster {
  if (grains.length === 0) {
    return {
      directory: dirPath,
      grains: [],
      avgResilience: 0,
      avgFiltration: 0,
      avgSurvival: 0,
      stormCalmerCount: 0,
      totalWhiteoutCount: 0,
      clearingSkiesCount: 0,
      dustSettlingCount: 0,
      clusterType: 'wasteland',
      condition: 'death-valley',
    }
  }

  const avgResilience = Math.round(grains.reduce((s, g) => s + g.chaosResilience, 0) / grains.length)
  const avgFiltration = Math.round(grains.reduce((s, g) => s + g.grainFiltration, 0) / grains.length)
  const avgSurvival = Math.round(grains.reduce((s, g) => s + g.desertSurvival, 0) / grains.length)

  const stormCalmerCount = grains.filter((g) => g.condition === 'storm-calmer').length
  const totalWhiteoutCount = grains.filter((g) => g.condition === 'total-whiteout').length
  const clearingSkiesCount = grains.filter((g) => g.condition === 'clearing-skies').length
  const dustSettlingCount = grains.filter((g) => g.condition === 'dust-settling').length

  const avgQs = grains.reduce((s, g) => s + g.qualityScore, 0) / grains.length

  return {
    directory: dirPath,
    grains,
    avgResilience,
    avgFiltration,
    avgSurvival,
    stormCalmerCount,
    totalWhiteoutCount,
    clearingSkiesCount,
    dustSettlingCount,
    clusterType: classifyClusterType(grains),
    condition: classifyClusterCondition(avgQs),
  }
}

/** @example generateRecommendations(grains, clusters, desert, stats) generates advice */
export function generateRecommendations(
  grains: StormGrain[],
  clusters: OasisCluster[],
  desert: SandstormDesert,
  stats: SandstormEyeStats,
): string[] {
  const recs: string[] = []

  if (stats.avgChaosResilience < 50) {
    recs.push('Improve resilience with const declarations, return types, and strict equality')
  }
  if (stats.avgStillnessFocus < 50) {
    recs.push('Sharpen focus with clear exports, documentation, and typed interfaces')
  }
  if (stats.avgGrainFiltration < 50) {
    recs.push('Filter noise with private fields, generics, and essential type patterns')
  }
  if (stats.avgVisibilityEndurance < 50) {
    recs.push('Boost endurance with durable exports, readonly, and persistent patterns')
  }
  if (stats.avgStormNavigation < 50) {
    recs.push('Navigate storms with try/catch, optional chaining, and defensive coding')
  }
  if (stats.avgDesertSurvival < 50) {
    recs.push('Improve survival with interfaces, classes, documentation, and battle-tested patterns')
  }
  if (stats.totalWhiteoutCount > 0) {
    recs.push(`${String(stats.totalWhiteoutCount)} file(s) are total whiteout — consider significant refactoring`)
  }
  if (desert.overallResilience < 40) {
    recs.push('Overall resilience is low — prioritize stability and error handling')
  }
  if (clusters.length > 0 && clusters.every((c) => c.clusterType === 'wasteland' || c.clusterType === 'dust-bowl')) {
    recs.push('All clusters are degraded — consider a major quality improvement effort')
  }

  const whiteout = grains.filter((g) => g.condition === 'total-whiteout')
  if (whiteout.length > 0 && whiteout.length <= 3) {
    const names = whiteout.map((g) => g.file).join(', ')
    recs.push(`Repair these whiteout files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your code is the eye of the storm! Perfect calm amidst complexity')
  }

  return Array.from(new Set(recs))
}

/** @example buildSandstormEyeResult(files, contents, options) orchestrates analysis */
export function buildSandstormEyeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): SandstormEyeResult {
  const grains = files.map((file, i) => analyzeStormGrain(contents[i] ?? '', file))

  const cMap = new Map<string, StormGrain[]>()
  for (const grain of grains) {
    const dir = grain.file.includes('/') ? grain.file.split('/').slice(0, -1).join('/') : '.'
    const existing = cMap.get(dir)
    if (existing) {
      existing.push(grain)
    } else {
      cMap.set(dir, [grain])
    }
  }

  const clusters = Array.from(cMap.entries()).map(([dir, dirGrains]) =>
    analyzeOasisCluster(dirGrains, dir),
  )

  const totalFiles = grains.length
  const avgChaosResilience = totalFiles > 0 ? Math.round(grains.reduce((s, g) => s + g.chaosResilience, 0) / totalFiles) : 0
  const avgStillnessFocus = totalFiles > 0 ? Math.round(grains.reduce((s, g) => s + g.stillnessFocus, 0) / totalFiles) : 0
  const avgGrainFiltration = totalFiles > 0 ? Math.round(grains.reduce((s, g) => s + g.grainFiltration, 0) / totalFiles) : 0
  const avgVisibilityEndurance = totalFiles > 0 ? Math.round(grains.reduce((s, g) => s + g.visibilityEndurance, 0) / totalFiles) : 0
  const avgStormNavigation = totalFiles > 0 ? Math.round(grains.reduce((s, g) => s + g.stormNavigation, 0) / totalFiles) : 0
  const avgDesertSurvival = totalFiles > 0 ? Math.round(grains.reduce((s, g) => s + g.desertSurvival, 0) / totalFiles) : 0

  const avgFiltration = avgGrainFiltration

  const overallResilience = totalFiles > 0
    ? Math.round((avgChaosResilience + avgFiltration + avgDesertSurvival) / 3)
    : 0

  const desert: SandstormDesert = {
    avgResilience: avgChaosResilience,
    avgFiltration,
    avgSurvival: avgDesertSurvival,
    isCalm: avgChaosResilience >= 60,
    overallResilience,
  }

  const bestGrain = totalFiles > 0
    ? grains.reduce((best, g) => (g.qualityScore > best.qualityScore ? g : best), grains[0]).file
    : ''
  const mostResilient = totalFiles > 0
    ? grains.reduce((best, g) => (g.chaosResilience > best.chaosResilience ? g : best), grains[0]).file
    : ''
  const mostFocused = totalFiles > 0
    ? grains.reduce((best, g) => (g.stillnessFocus > best.stillnessFocus ? g : best), grains[0]).file
    : ''
  const bestFiltered = totalFiles > 0
    ? grains.reduce((best, g) => (g.grainFiltration > best.grainFiltration ? g : best), grains[0]).file
    : ''
  const mostEnduring = totalFiles > 0
    ? grains.reduce((best, g) => (g.visibilityEndurance > best.visibilityEndurance ? g : best), grains[0]).file
    : ''
  const bestNavigator = totalFiles > 0
    ? grains.reduce((best, g) => (g.stormNavigation > best.stormNavigation ? g : best), grains[0]).file
    : ''

  const stats: SandstormEyeStats = {
    totalFiles,
    totalClusters: clusters.length,
    avgChaosResilience,
    avgStillnessFocus,
    avgGrainFiltration,
    avgVisibilityEndurance,
    avgStormNavigation,
    avgDesertSurvival,
    stormCalmerCount: grains.filter((g) => g.condition === 'storm-calmer').length,
    clearingSkiesCount: grains.filter((g) => g.condition === 'clearing-skies').length,
    dustSettlingCount: grains.filter((g) => g.condition === 'dust-settling').length,
    grittyWindCount: grains.filter((g) => g.condition === 'gritty-wind').length,
    howlingGaleCount: grains.filter((g) => g.condition === 'howling-gale').length,
    totalWhiteoutCount: grains.filter((g) => g.condition === 'total-whiteout').length,
    hasHighStabilityCount: grains.filter((g) => g.resilient.hasHighStability).length,
    hasHighClarityCount: grains.filter((g) => g.focused.hasHighClarity).length,
    hasHighSignalToNoiseCount: grains.filter((g) => g.filtering.hasHighSignalToNoise).length,
    hasHighPersistenceCount: grains.filter((g) => g.enduring.hasHighPersistence).length,
    hasHighErrorHandlingCount: grains.filter((g) => g.navigating.hasHighErrorHandling).length,
    hasHighDurabilityCount: grains.filter((g) => g.surviving.hasHighDurability).length,
    overallResilience,
    nomadGrade: classifyNomadGrade(overallResilience),
    bestGrain,
    mostResilient,
    mostFocused,
    bestFiltered,
    mostEnduring,
    bestNavigator,
  }

  const recommendations = generateRecommendations(grains, clusters, desert, stats)

  return { grains, clusters, desert, stats, recommendations }
}
