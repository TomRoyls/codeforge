// ─── Types ─────────────────────────────────────────────────────────────────

export interface StormyMeasure {
  handling: number
  riding: 'hurricane-rider' | 'storm-navigator' | 'weather-tested' | 'fair-weather' | 'storm-shy' | 'grounded'
  hasHighHandling: boolean
  hasResilient: boolean
  hasGraceful: boolean
  hasNoCrash: boolean
  hasErrorRecovery: boolean
  hasNoPanic: boolean
  hasPressureProof: boolean
  hasNoBuckle: boolean
  hasSteady: boolean
  hasNoBreak: boolean
  hasComposed: boolean
  crashCount: number
  panicCount: number
}

export interface NavigatingMeasure {
  adaptation: number
  skill: 'wind-master' | 'adaptive-flyer' | 'proper-navigator' | 'rigid-flyer' | 'wind-blown' | 'lost'
  hasHighAdaptation: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasNoRigidity: boolean
  hasResponsive: boolean
  hasNoStiffness: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasEvolving: boolean
  hasNoFrozen: boolean
  hasAgile: boolean
  rigidityCount: number
  stiffnessCount: number
}

export interface OceanicMeasure {
  depth: number
  resilience: 'deep-diver' | 'ocean-hardy' | 'surface-swimmer' | 'shallow-water' | 'puddle-jumper' | 'landlubber'
  hasHighDepth: boolean
  hasDeep: boolean
  hasComplexityHandling: boolean
  hasNoShallowness: boolean
  hasRobust: boolean
  hasNoFragility: boolean
  hasPressure: boolean
  hasNoCrushing: boolean
  hasThorough: boolean
  hasNoSuperficial: boolean
  hasEnduring: boolean
  shallownessCount: number
  fragilityCount: number
}

export interface EnduringMeasure {
  stamina: number
  endurance: 'trans-oceanic' | 'long-haul' | 'proper-stamina' | 'medium-range' | 'short-hop' | 'exhausted'
  hasHighStamina: boolean
  hasDurable: boolean
  hasSustainable: boolean
  hasNoExhaustion: boolean
  hasLongRunning: boolean
  hasNoBurnout: boolean
  hasEfficient: boolean
  hasNoResourceHog: boolean
  hasPerformant: boolean
  hasNoDegradation: boolean
  hasPersistent: boolean
  exhaustionCount: number
  burnoutCount: number
}

export interface InstinctualMeasure {
  direction: number
  sense: 'homing-pigeon' | 'strong-instinct' | 'proper-direction' | 'uncertain' | 'wandering' | 'lost'
  hasHighDirection: boolean
  hasClearPurpose: boolean
  hasFocused: boolean
  hasNoDrift: boolean
  hasGoal: boolean
  hasNoMeandering: boolean
  hasIntentional: boolean
  hasNoAccidental: boolean
  hasDirected: boolean
  hasNoRandom: boolean
  hasPurposed: boolean
  driftCount: number
  meanderingCount: number
}

export interface FlockingMeasure {
  coordination: number
  harmony: 'perfect-flock' | 'coordinated-flight' | 'proper-formation' | 'loose-group' | 'scattered' | 'isolated'
  hasHighCoordination: boolean
  hasCompatible: boolean
  hasWellInterfaced: boolean
  hasNoConflict: boolean
  hasCohesive: boolean
  hasNoClash: boolean
  hasTeamwork: boolean
  hasNoIsolation: boolean
  hasIntegrated: boolean
  hasNoSilos: boolean
  hasCollaborative: boolean
  conflictCount: number
  siloCount: number
}

export type FlightCondition = 'master-aviator' | 'storm-rider' | 'steady-flyer' | 'struggling-bird' | 'grounded-bird' | 'fallen'

export interface PetrelFlight {
  file: string
  stormRiding: number
  windNavigation: number
  oceanResilience: number
  flightEndurance: number
  navigationalInstinct: number
  flockCoordination: number
  stormy: StormyMeasure
  navigating: NavigatingMeasure
  oceanic: OceanicMeasure
  enduring: EnduringMeasure
  instinctual: InstinctualMeasure
  flocking: FlockingMeasure
  condition: FlightCondition
  qualityScore: number
}

export type FormationType = 'v-formation' | 'coordinated-flock' | 'scattered-group' | 'loose-assembly' | 'every-bird-for-itself' | 'empty-sky'
export type FormationCondition = 'magnificent-flight' | 'proper-flock' | 'decent-group' | 'struggling-formation' | 'scattered-birds' | 'empty-skies'

export interface FlightFormation {
  directory: string
  flights: PetrelFlight[]
  avgStormRiding: number
  avgEndurance: number
  avgCoordination: number
  masterAviatorCount: number
  fallenCount: number
  stormRiderCount: number
  steadyFlyerCount: number
  formationType: FormationType
  condition: FormationCondition
}

export interface Migration {
  avgStormRiding: number
  avgEndurance: number
  avgCoordination: number
  isResilient: boolean
  overallResilience: number
}

export type AviatorGrade = 'master-aviator' | 'expert-navigator' | 'skilled-pilot' | 'apprentice-flyer' | 'novice' | 'flightless'

export interface StormPetrelStats {
  totalFiles: number
  totalFormations: number
  avgStormRiding: number
  avgWindNavigation: number
  avgOceanResilience: number
  avgFlightEndurance: number
  avgNavigationalInstinct: number
  avgFlockCoordination: number
  masterAviatorCount: number
  stormRiderCount: number
  steadyFlyerCount: number
  strugglingBirdCount: number
  groundedBirdCount: number
  fallenCount: number
  hasHighHandlingCount: number
  hasHighAdaptationCount: number
  hasHighDepthCount: number
  hasHighStaminaCount: number
  hasHighDirectionCount: number
  hasHighCoordinationCount: number
  overallResilience: number
  aviatorGrade: AviatorGrade
  bestFlight: string
  bestStormRider: string
  bestNavigator: string
  deepest: string
  mostEnduring: string
  mostCoordinated: string
}

export interface StormPetrelResult {
  flights: PetrelFlight[]
  formations: FlightFormation[]
  migration: Migration
  stats: StormPetrelStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureStormy(content) evaluates code crisis handling */
export function measureStormy(content: string): StormyMeasure {
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)

  const crashMatches = content.match(/\bvar\s+/g)
  const crashCount = crashMatches ? crashMatches.length : 0
  const panicMatches = content.match(/\bany\b/g)
  const panicCount = panicMatches ? panicMatches.length : 0

  const hasResilient = hasTryCatch && hasAsync
  const hasGraceful = hasOptionalChaining && hasNullishCoalescing
  const hasErrorRecovery = hasReturnType && hasDefaultParam
  const hasPressureProof = hasExport && hasConst
  const hasSteady = hasInterface && hasClass
  const hasComposed = hasTryCatch && hasReturnType

  let handling = 0
  if (hasTryCatch) handling += 10
  if (hasAsync) handling += 8
  if (hasReturnType) handling += 10
  if (hasExport) handling += 8
  if (hasConst) handling += 8
  if (hasOptionalChaining) handling += 10
  if (hasNullishCoalescing) handling += 8
  if (hasInterface) handling += 8
  if (hasDefaultParam) handling += 8
  if (hasClass) handling += 8
  if (hasResilient) handling += 5
  if (hasGraceful) handling += 5
  if (hasErrorRecovery) handling += 5
  if (hasPressureProof) handling += 5
  if (hasComposed) handling += 5

  handling = Math.min(100, Math.round(handling))

  let riding: StormyMeasure['riding'] = 'grounded'
  if (handling >= 85) riding = 'hurricane-rider'
  else if (handling >= 70) riding = 'storm-navigator'
  else if (handling >= 55) riding = 'weather-tested'
  else if (handling >= 40) riding = 'fair-weather'
  else if (handling >= 25) riding = 'storm-shy'

  return {
    handling, riding,
    hasHighHandling: handling >= 70,
    hasResilient, hasGraceful, hasNoCrash: crashCount === 0,
    hasErrorRecovery, hasNoPanic: panicCount === 0,
    hasPressureProof, hasNoBuckle: crashCount === 0 && panicCount === 0,
    hasSteady, hasNoBreak: crashCount === 0,
    hasComposed,
    crashCount, panicCount,
  }
}

/** @example measureNavigating(content) evaluates code change adaptation */
export function measureNavigating(content: string): NavigatingMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)

  const rigidityMatches = content.match(/\bvar\s+/g)
  const rigidityCount = rigidityMatches ? rigidityMatches.length : 0
  const stiffnessMatches = content.match(/\bany\b/g)
  const stiffnessCount = stiffnessMatches ? stiffnessMatches.length : 0

  const hasAdaptable = hasOptionalChaining && hasDefaultParam
  const hasFlexible = hasGenerics && hasTypeAlias
  const hasResponsive = hasExport && hasConst
  const hasDynamic = hasInterface && hasReturnType
  const hasEvolving = hasNamedExport && hasReadonly
  const hasAgile = hasOptionalChaining && hasGenerics

  let adaptation = 0
  if (hasExport) adaptation += 8
  if (hasInterface) adaptation += 8
  if (hasOptionalChaining) adaptation += 10
  if (hasReturnType) adaptation += 10
  if (hasGenerics) adaptation += 10
  if (hasConst) adaptation += 8
  if (hasTypeAlias) adaptation += 8
  if (hasDefaultParam) adaptation += 8
  if (hasNamedExport) adaptation += 8
  if (hasReadonly) adaptation += 8
  if (hasAdaptable) adaptation += 5
  if (hasFlexible) adaptation += 5
  if (hasResponsive) adaptation += 5
  if (hasDynamic) adaptation += 5
  if (hasEvolving) adaptation += 5

  adaptation = Math.min(100, Math.round(adaptation))

  let skill: NavigatingMeasure['skill'] = 'lost'
  if (adaptation >= 85) skill = 'wind-master'
  else if (adaptation >= 70) skill = 'adaptive-flyer'
  else if (adaptation >= 55) skill = 'proper-navigator'
  else if (adaptation >= 40) skill = 'rigid-flyer'
  else if (adaptation >= 25) skill = 'wind-blown'

  return {
    adaptation, skill,
    hasHighAdaptation: adaptation >= 70,
    hasAdaptable, hasFlexible, hasNoRigidity: rigidityCount === 0,
    hasResponsive, hasNoStiffness: stiffnessCount === 0,
    hasDynamic, hasNoStatic: rigidityCount === 0 && stiffnessCount === 0,
    hasEvolving, hasNoFrozen: rigidityCount === 0,
    hasAgile,
    rigidityCount, stiffnessCount,
  }
}

/** @example measureOceanic(content) evaluates code depth handling */
export function measureOceanic(content: string): OceanicMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const shallownessMatches = content.match(/\bvar\s+/g)
  const shallownessCount = shallownessMatches ? shallownessMatches.length : 0
  const fragilityMatches = content.match(/\bany\b/g)
  const fragilityCount = fragilityMatches ? fragilityMatches.length : 0

  const hasDeep = hasGenerics && hasTypeAlias
  const hasComplexityHandling = hasInterface && hasClass
  const hasRobust = hasPrivate && hasReadonly
  const hasPressure = hasReturnType && hasGenerics
  const hasThorough = hasExport && hasDocComments
  const hasEnduring = hasConst && hasReadonly

  let depth = 0
  if (hasExport) depth += 8
  if (hasInterface) depth += 10
  if (hasClass) depth += 8
  if (hasPrivate) depth += 8
  if (hasReadonly) depth += 8
  if (hasReturnType) depth += 10
  if (hasGenerics) depth += 10
  if (hasTypeAlias) depth += 8
  if (hasConst) depth += 8
  if (hasDocComments) depth += 8
  if (hasDeep) depth += 5
  if (hasComplexityHandling) depth += 5
  if (hasRobust) depth += 5
  if (hasPressure) depth += 5
  if (hasThorough) depth += 5

  depth = Math.min(100, Math.round(depth))

  let resilience: OceanicMeasure['resilience'] = 'landlubber'
  if (depth >= 85) resilience = 'deep-diver'
  else if (depth >= 70) resilience = 'ocean-hardy'
  else if (depth >= 55) resilience = 'surface-swimmer'
  else if (depth >= 40) resilience = 'shallow-water'
  else if (depth >= 25) resilience = 'puddle-jumper'

  return {
    depth, resilience,
    hasHighDepth: depth >= 70,
    hasDeep, hasComplexityHandling, hasNoShallowness: shallownessCount === 0,
    hasRobust, hasNoFragility: fragilityCount === 0,
    hasPressure, hasNoCrushing: shallownessCount === 0 && fragilityCount === 0,
    hasThorough, hasNoSuperficial: shallownessCount === 0,
    hasEnduring,
    shallownessCount, fragilityCount,
  }
}

/** @example measureEnduring(content) evaluates code stamina */
export function measureEnduring(content: string): EnduringMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const exhaustionMatches = content.match(/\bvar\s+/g)
  const exhaustionCount = exhaustionMatches ? exhaustionMatches.length : 0
  const burnoutMatches = content.match(/\bany\b/g)
  const burnoutCount = burnoutMatches ? burnoutMatches.length : 0

  const hasDurable = hasStrictEquality && hasConst
  const hasSustainable = hasExport && hasReturnType
  const hasLongRunning = hasOptionalChaining && hasInterface
  const hasEfficient = hasReadonly && hasPrivate
  const hasPerformant = hasNamedExport && hasTypeAnnotation
  const hasPersistent = hasExport && hasConst

  let stamina = 0
  if (hasExport) stamina += 8
  if (hasConst) stamina += 10
  if (hasReturnType) stamina += 10
  if (hasStrictEquality) stamina += 8
  if (hasOptionalChaining) stamina += 10
  if (hasInterface) stamina += 8
  if (hasReadonly) stamina += 8
  if (hasPrivate) stamina += 8
  if (hasNamedExport) stamina += 8
  if (hasTypeAnnotation) stamina += 8
  if (hasDurable) stamina += 5
  if (hasSustainable) stamina += 5
  if (hasLongRunning) stamina += 5
  if (hasEfficient) stamina += 5
  if (hasPerformant) stamina += 5

  stamina = Math.min(100, Math.round(stamina))

  let endurance: EnduringMeasure['endurance'] = 'exhausted'
  if (stamina >= 85) endurance = 'trans-oceanic'
  else if (stamina >= 70) endurance = 'long-haul'
  else if (stamina >= 55) endurance = 'proper-stamina'
  else if (stamina >= 40) endurance = 'medium-range'
  else if (stamina >= 25) endurance = 'short-hop'

  return {
    stamina, endurance,
    hasHighStamina: stamina >= 70,
    hasDurable, hasSustainable, hasNoExhaustion: exhaustionCount === 0,
    hasLongRunning, hasNoBurnout: burnoutCount === 0,
    hasEfficient, hasNoResourceHog: exhaustionCount === 0 && burnoutCount === 0,
    hasPerformant, hasNoDegradation: exhaustionCount === 0,
    hasPersistent,
    exhaustionCount, burnoutCount,
  }
}

/** @example measureInstinctual(content) evaluates code direction */
export function measureInstinctual(content: string): InstinctualMeasure {
  const hasExport = /export\s/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasImport = /import\s+/.test(content)

  const driftMatches = content.match(/\bvar\s+/g)
  const driftCount = driftMatches ? driftMatches.length : 0
  const meanderingMatches = content.match(/\bany\b/g)
  const meanderingCount = meanderingMatches ? meanderingMatches.length : 0

  const hasClearPurpose = hasExport && hasDocComments
  const hasFocused = hasReturnType && hasConst
  const hasGoal = hasInterface && hasClass
  const hasIntentional = hasNamedExport && hasAsync
  const hasDirected = hasTypeAnnotation && hasImport
  const hasPurposed = hasExport && hasConst

  let direction = 0
  if (hasExport) direction += 10
  if (hasDocComments) direction += 10
  if (hasReturnType) direction += 10
  if (hasConst) direction += 8
  if (hasInterface) direction += 8
  if (hasClass) direction += 8
  if (hasNamedExport) direction += 8
  if (hasAsync) direction += 8
  if (hasTypeAnnotation) direction += 8
  if (hasImport) direction += 8
  if (hasClearPurpose) direction += 5
  if (hasFocused) direction += 5
  if (hasGoal) direction += 5
  if (hasIntentional) direction += 5
  if (hasDirected) direction += 5

  direction = Math.min(100, Math.round(direction))

  let sense: InstinctualMeasure['sense'] = 'lost'
  if (direction >= 85) sense = 'homing-pigeon'
  else if (direction >= 70) sense = 'strong-instinct'
  else if (direction >= 55) sense = 'proper-direction'
  else if (direction >= 40) sense = 'uncertain'
  else if (direction >= 25) sense = 'wandering'

  return {
    direction, sense,
    hasHighDirection: direction >= 70,
    hasClearPurpose, hasFocused, hasNoDrift: driftCount === 0,
    hasGoal, hasNoMeandering: meanderingCount === 0,
    hasIntentional, hasNoAccidental: driftCount === 0 && meanderingCount === 0,
    hasDirected, hasNoRandom: driftCount === 0,
    hasPurposed,
    driftCount, meanderingCount,
  }
}

/** @example measureFlocking(content) evaluates code teamwork */
export function measureFlocking(content: string): FlockingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)

  const conflictMatches = content.match(/\bvar\s+/g)
  const conflictCount = conflictMatches ? conflictMatches.length : 0
  const siloMatches = content.match(/\bany\b/g)
  const siloCount = siloMatches ? siloMatches.length : 0

  const hasCompatible = hasExport && hasImport
  const hasWellInterfaced = hasInterface && hasReturnType
  const hasCohesive = hasClass && hasConst
  const hasTeamwork = hasNamedExport && hasDocComments
  const hasIntegrated = hasReadonly && hasPrivate
  const hasCollaborative = hasExport && hasInterface

  let coordination = 0
  if (hasExport) coordination += 8
  if (hasImport) coordination += 10
  if (hasInterface) coordination += 10
  if (hasClass) coordination += 8
  if (hasReturnType) coordination += 8
  if (hasConst) coordination += 8
  if (hasDocComments) coordination += 8
  if (hasNamedExport) coordination += 8
  if (hasReadonly) coordination += 8
  if (hasPrivate) coordination += 8
  if (hasCompatible) coordination += 5
  if (hasWellInterfaced) coordination += 5
  if (hasCohesive) coordination += 5
  if (hasTeamwork) coordination += 5
  if (hasIntegrated) coordination += 5

  coordination = Math.min(100, Math.round(coordination))

  let harmony: FlockingMeasure['harmony'] = 'isolated'
  if (coordination >= 85) harmony = 'perfect-flock'
  else if (coordination >= 70) harmony = 'coordinated-flight'
  else if (coordination >= 55) harmony = 'proper-formation'
  else if (coordination >= 40) harmony = 'loose-group'
  else if (coordination >= 25) harmony = 'scattered'

  return {
    coordination, harmony,
    hasHighCoordination: coordination >= 70,
    hasCompatible, hasWellInterfaced, hasNoConflict: conflictCount === 0,
    hasCohesive, hasNoClash: siloCount === 0,
    hasTeamwork, hasNoIsolation: conflictCount === 0 && siloCount === 0,
    hasIntegrated, hasNoSilos: conflictCount === 0,
    hasCollaborative,
    conflictCount, siloCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'master-aviator' */
export function classifyCondition(score: number): FlightCondition {
  if (score >= 85) return 'master-aviator'
  if (score >= 70) return 'storm-rider'
  if (score >= 55) return 'steady-flyer'
  if (score >= 40) return 'struggling-bird'
  if (score >= 25) return 'grounded-bird'
  return 'fallen'
}

/** @example classifyFormationType(flights) returns formation classification */
export function classifyFormationType(flights: PetrelFlight[]): FormationType {
  if (flights.length === 0) return 'empty-sky'
  const avgQs = flights.reduce((s, f) => s + f.qualityScore, 0) / flights.length
  const masterCount = flights.filter((f) => f.condition === 'master-aviator').length
  const ratio = masterCount / flights.length
  if (avgQs >= 75 && ratio >= 0.5) return 'v-formation'
  if (avgQs >= 60) return 'coordinated-flock'
  if (avgQs >= 45) return 'scattered-group'
  if (avgQs >= 30) return 'loose-assembly'
  if (avgQs >= 15) return 'every-bird-for-itself'
  return 'empty-sky'
}

/** @example classifyFormationCondition(avgQs) returns formation condition */
export function classifyFormationCondition(avgQs: number): FormationCondition {
  if (avgQs >= 75) return 'magnificent-flight'
  if (avgQs >= 60) return 'proper-flock'
  if (avgQs >= 45) return 'decent-group'
  if (avgQs >= 30) return 'struggling-formation'
  if (avgQs >= 15) return 'scattered-birds'
  return 'empty-skies'
}

/** @example classifyAviatorGrade(80) returns 'master-aviator' */
export function classifyAviatorGrade(avgResilience: number): AviatorGrade {
  if (avgResilience >= 80) return 'master-aviator'
  if (avgResilience >= 65) return 'expert-navigator'
  if (avgResilience >= 50) return 'skilled-pilot'
  if (avgResilience >= 35) return 'apprentice-flyer'
  if (avgResilience >= 20) return 'novice'
  return 'flightless'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzePetrelFlight(content, filePath) evaluates single file */
export function analyzePetrelFlight(content: string, filePath: string): PetrelFlight {
  const stormyMeasure = measureStormy(content)
  const navigatingMeasure = measureNavigating(content)
  const oceanicMeasure = measureOceanic(content)
  const enduringMeasure = measureEnduring(content)
  const instinctualMeasure = measureInstinctual(content)
  const flockingMeasure = measureFlocking(content)

  const qualityScore = Math.round(
    stormyMeasure.handling * 0.2 +
    navigatingMeasure.adaptation * 0.15 +
    oceanicMeasure.depth * 0.15 +
    enduringMeasure.stamina * 0.15 +
    instinctualMeasure.direction * 0.15 +
    flockingMeasure.coordination * 0.2,
  )

  return {
    file: filePath,
    stormRiding: stormyMeasure.handling,
    windNavigation: navigatingMeasure.adaptation,
    oceanResilience: oceanicMeasure.depth,
    flightEndurance: enduringMeasure.stamina,
    navigationalInstinct: instinctualMeasure.direction,
    flockCoordination: flockingMeasure.coordination,
    stormy: stormyMeasure,
    navigating: navigatingMeasure,
    oceanic: oceanicMeasure,
    enduring: enduringMeasure,
    instinctual: instinctualMeasure,
    flocking: flockingMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeFlightFormation(flights, dirPath) evaluates directory */
export function analyzeFlightFormation(flights: PetrelFlight[], dirPath: string): FlightFormation {
  if (flights.length === 0) {
    return {
      directory: dirPath, flights: [],
      avgStormRiding: 0, avgEndurance: 0, avgCoordination: 0,
      masterAviatorCount: 0, fallenCount: 0, stormRiderCount: 0, steadyFlyerCount: 0,
      formationType: 'empty-sky', condition: 'empty-skies',
    }
  }

  const avgStormRiding = Math.round(flights.reduce((s, f) => s + f.stormRiding, 0) / flights.length)
  const avgEndurance = Math.round(flights.reduce((s, f) => s + f.flightEndurance, 0) / flights.length)
  const avgCoordination = Math.round(flights.reduce((s, f) => s + f.flockCoordination, 0) / flights.length)
  const masterAviatorCount = flights.filter((f) => f.condition === 'master-aviator').length
  const fallenCount = flights.filter((f) => f.condition === 'fallen').length
  const stormRiderCount = flights.filter((f) => f.condition === 'storm-rider').length
  const steadyFlyerCount = flights.filter((f) => f.condition === 'steady-flyer').length
  const avgQs = flights.reduce((s, f) => s + f.qualityScore, 0) / flights.length

  return {
    directory: dirPath, flights,
    avgStormRiding, avgEndurance, avgCoordination,
    masterAviatorCount, fallenCount, stormRiderCount, steadyFlyerCount,
    formationType: classifyFormationType(flights),
    condition: classifyFormationCondition(avgQs),
  }
}

/** @example generateRecommendations(flights, formations, migration, stats) generates advice */
export function generateRecommendations(
  flights: PetrelFlight[],
  formations: FlightFormation[],
  migration: Migration,
  stats: StormPetrelStats,
): string[] {
  const recs: string[] = []

  if (stats.avgStormRiding < 50) {
    recs.push('Strengthen storm riding with try/catch, async patterns, and graceful degradation')
  }
  if (stats.avgWindNavigation < 50) {
    recs.push('Improve wind navigation with optional chaining, generics, and flexible abstractions')
  }
  if (stats.avgOceanResilience < 50) {
    recs.push('Deepen ocean resilience with interfaces, generics, and thorough type coverage')
  }
  if (stats.avgFlightEndurance < 50) {
    recs.push('Build flight endurance with strict equality, readonly fields, and sustainable patterns')
  }
  if (stats.avgNavigationalInstinct < 50) {
    recs.push('Sharpen navigational instinct with clear exports, documentation, and purposeful design')
  }
  if (stats.avgFlockCoordination < 50) {
    recs.push('Improve flock coordination with imports, interfaces, and well-documented boundaries')
  }
  if (stats.fallenCount > 0) {
    recs.push(`${String(stats.fallenCount)} file(s) have fallen — consider significant refactoring`)
  }
  if (migration.overallResilience < 40) {
    recs.push('Overall migration resilience is low — prioritize storm riding and endurance')
  }
  if (formations.length > 0 && formations.every((fm) => fm.formationType === 'empty-sky' || fm.formationType === 'every-bird-for-itself')) {
    recs.push('All formations are scattered — consider a major quality improvement effort')
  }

  const fallenFiles = flights.filter((f) => f.condition === 'fallen')
  if (fallenFiles.length > 0 && fallenFiles.length <= 3) {
    const names = fallenFiles.map((f) => f.file).join(', ')
    recs.push(`Rescue these fallen files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your storm petrels ride the wildest winds with grace! Every flight is masterful')
  }

  return Array.from(new Set(recs))
}

/** @example buildStormPetrelResult(files, contents, options) orchestrates analysis */
export function buildStormPetrelResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): StormPetrelResult {
  const flights = files.map((file, i) => analyzePetrelFlight(contents[i] ?? '', file))

  const fMap = new Map<string, PetrelFlight[]>()
  for (const flight of flights) {
    const dir = flight.file.includes('/') ? flight.file.split('/').slice(0, -1).join('/') : '.'
    const existing = fMap.get(dir)
    if (existing) {
      existing.push(flight)
    } else {
      fMap.set(dir, [flight])
    }
  }

  const formations = Array.from(fMap.entries()).map(([dir, dirFlights]) =>
    analyzeFlightFormation(dirFlights, dir),
  )

  const totalFiles = flights.length
  const avgStormRiding = totalFiles > 0 ? Math.round(flights.reduce((s, f) => s + f.stormRiding, 0) / totalFiles) : 0
  const avgWindNavigation = totalFiles > 0 ? Math.round(flights.reduce((s, f) => s + f.windNavigation, 0) / totalFiles) : 0
  const avgOceanResilience = totalFiles > 0 ? Math.round(flights.reduce((s, f) => s + f.oceanResilience, 0) / totalFiles) : 0
  const avgFlightEndurance = totalFiles > 0 ? Math.round(flights.reduce((s, f) => s + f.flightEndurance, 0) / totalFiles) : 0
  const avgNavigationalInstinct = totalFiles > 0 ? Math.round(flights.reduce((s, f) => s + f.navigationalInstinct, 0) / totalFiles) : 0
  const avgFlockCoordination = totalFiles > 0 ? Math.round(flights.reduce((s, f) => s + f.flockCoordination, 0) / totalFiles) : 0

  const avgEndurance = avgFlightEndurance
  const avgCoordination = avgFlockCoordination

  const overallResilience = totalFiles > 0
    ? Math.round((avgStormRiding + avgEndurance + avgCoordination) / 3)
    : 0

  const migration: Migration = {
    avgStormRiding, avgEndurance, avgCoordination,
    isResilient: avgStormRiding >= 60,
    overallResilience,
  }

  const bestFlight = totalFiles > 0
    ? flights.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best), flights[0]).file
    : ''
  const bestStormRider = totalFiles > 0
    ? flights.reduce((best, f) => (f.stormRiding > best.stormRiding ? f : best), flights[0]).file
    : ''
  const bestNavigator = totalFiles > 0
    ? flights.reduce((best, f) => (f.windNavigation > best.windNavigation ? f : best), flights[0]).file
    : ''
  const deepest = totalFiles > 0
    ? flights.reduce((best, f) => (f.oceanResilience > best.oceanResilience ? f : best), flights[0]).file
    : ''
  const mostEnduring = totalFiles > 0
    ? flights.reduce((best, f) => (f.flightEndurance > best.flightEndurance ? f : best), flights[0]).file
    : ''
  const mostCoordinated = totalFiles > 0
    ? flights.reduce((best, f) => (f.flockCoordination > best.flockCoordination ? f : best), flights[0]).file
    : ''

  const stats: StormPetrelStats = {
    totalFiles,
    totalFormations: formations.length,
    avgStormRiding, avgWindNavigation, avgOceanResilience,
    avgFlightEndurance, avgNavigationalInstinct, avgFlockCoordination,
    masterAviatorCount: flights.filter((f) => f.condition === 'master-aviator').length,
    stormRiderCount: flights.filter((f) => f.condition === 'storm-rider').length,
    steadyFlyerCount: flights.filter((f) => f.condition === 'steady-flyer').length,
    strugglingBirdCount: flights.filter((f) => f.condition === 'struggling-bird').length,
    groundedBirdCount: flights.filter((f) => f.condition === 'grounded-bird').length,
    fallenCount: flights.filter((f) => f.condition === 'fallen').length,
    hasHighHandlingCount: flights.filter((f) => f.stormy.hasHighHandling).length,
    hasHighAdaptationCount: flights.filter((f) => f.navigating.hasHighAdaptation).length,
    hasHighDepthCount: flights.filter((f) => f.oceanic.hasHighDepth).length,
    hasHighStaminaCount: flights.filter((f) => f.enduring.hasHighStamina).length,
    hasHighDirectionCount: flights.filter((f) => f.instinctual.hasHighDirection).length,
    hasHighCoordinationCount: flights.filter((f) => f.flocking.hasHighCoordination).length,
    overallResilience,
    aviatorGrade: classifyAviatorGrade(overallResilience),
    bestFlight, bestStormRider, bestNavigator, deepest, mostEnduring, mostCoordinated,
  }

  const recommendations = generateRecommendations(flights, formations, migration, stats)

  return { flights, formations, migration, stats, recommendations }
}
