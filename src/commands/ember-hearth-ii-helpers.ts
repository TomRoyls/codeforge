// ─── Types ─────────────────────────────────────────────────────────────────

export interface WarmMeasure {
  deepAccessibility: number
  heat: 'white-hot-core' | 'glowing-ember' | 'steady-warmth' | 'cooling-coals' | 'cold-ash' | 'frozen'
  hasHighDeepAccessibility: boolean
  hasApproachable: boolean
  hasDeeplyUsable: boolean
  hasNoIntimidation: boolean
  hasWelcoming: boolean
  hasNoHostility: boolean
  hasGentle: boolean
  hasNoHarshness: boolean
  hasInviting: boolean
  hasNoExclusion: boolean
  intimidationCount: number
  hostilityCount: number
}

export interface BurningMeasure {
  efficiency: number
  quality: 'complete-combustion' | 'clean-burn' | 'proper-flame' | 'smoky-burn' | 'sputtering' | 'no-fire'
  hasHighEfficiency: boolean
  hasEfficient: boolean
  hasNoWaste: boolean
  hasOptimized: boolean
  hasNoRedundancy: boolean
  hasClean: boolean
  hasNoPollution: boolean
  hasLean: boolean
  hasNoBloat: boolean
  hasTargeted: boolean
  wasteCount: number
  pollutionCount: number
}

export interface WiseMeasure {
  failureWisdom: number
  knowledge: 'sage-wisdom' | 'experienced-learner' | 'proper-scholar' | 'still-learning' | 'naive' | 'ignorant'
  hasHighFailureWisdom: boolean
  hasLearnedFromErrors: boolean
  hasNoRepeating: boolean
  hasErrorPatterns: boolean
  hasNoSameMistakes: boolean
  hasDefensive: boolean
  hasNoNaivety: boolean
  hasHardened: boolean
  hasNoInnocence: boolean
  hasMature: boolean
  hasNoFolly: boolean
  repeatingCount: number
  sameMistakesCount: number
}

export interface TendingMeasure {
  maintenance: number
  care: 'master-firekeeper' | 'dedicated-tender' | 'proper-caretaker' | 'occasional-attention' | 'neglected' | 'abandoned'
  hasHighMaintenance: boolean
  hasMaintained: boolean
  hasNoNeglect: boolean
  hasUpdated: boolean
  hasNoStaleness: boolean
  hasCared: boolean
  hasNoAbandonment: boolean
  hasNurtured: boolean
  hasNoDecay: boolean
  hasFresh: boolean
  hasNoRot: boolean
  neglectCount: number
  stalenessCount: number
}

export interface SparkingMeasure {
  innovation: number
  creativity: 'fireworks-display' | 'creative-sparks' | 'clever-ignition' | 'routine-flame' | 'dormant' | 'no-spark'
  hasHighInnovation: boolean
  hasInnovative: boolean
  hasClever: boolean
  hasNoDullness: boolean
  hasOriginal: boolean
  hasNoCopy: boolean
  hasCreative: boolean
  hasNoGeneric: boolean
  hasInventive: boolean
  hasNoDerivative: boolean
  hasSpark: boolean
  dullnessCount: number
  copyCount: number
}

export interface ForgingMeasure {
  temperature: number
  heat: 'forge-ready' | 'glowing-hot' | 'proper-heat' | 'warm-metal' | 'cold-iron' | 'frozen-solid'
  hasHighTemperature: boolean
  hasTransformative: boolean
  hasMalleable: boolean
  hasNoRigidity: boolean
  hasRefactorable: boolean
  hasNoBrittleness: boolean
  hasShapable: boolean
  hasNoFixedForm: boolean
  hasWorkable: boolean
  hasNoCrystalized: boolean
  hasHeatTreatable: boolean
  rigidityCount: number
  brittlenessCount: number
}

export type EmberCondition = 'forge-furnace' | 'glowing-hearth' | 'steady-fire' | 'dying-embers' | 'cold-ash-pit' | 'extinguished'

export interface GlowingEmber {
  file: string
  warmthDeep: number
  burnQuality: number
  ashWisdom: number
  fireTending: number
  sparkGeneration: number
  forgeTemperature: number
  warm: WarmMeasure
  burning: BurningMeasure
  wise: WiseMeasure
  tending: TendingMeasure
  sparking: SparkingMeasure
  forging: ForgingMeasure
  condition: EmberCondition
  qualityScore: number
}

export type CircleType = 'grand-forge' | 'community-hearth' | 'family-fireplace' | 'campfire' | 'dying-embers' | 'cold-ashes'
export type CircleCondition = 'blazing-forge' | 'warm-gathering' | 'steady-warmth' | 'cooling-hearth' | 'dying-fire' | 'cold-night'

export interface HearthCircle {
  directory: string
  embers: GlowingEmber[]
  avgWarmth: number
  avgWisdom: number
  avgInnovation: number
  forgeFurnaceCount: number
  extinguishedCount: number
  glowingHearthCount: number
  steadyFireCount: number
  circleType: CircleType
  condition: CircleCondition
}

export interface Forge {
  avgWarmth: number
  avgWisdom: number
  avgInnovation: number
  isHot: boolean
  overallHeat: number
}

export type BlacksmithGrade = 'master-blacksmith' | 'expert-forger' | 'skilled-smith' | 'apprentice' | 'bellows-boy' | 'cold-hands'

export interface EmberHearthIiStats {
  totalFiles: number
  totalCircles: number
  avgWarmthDeep: number
  avgBurnQuality: number
  avgAshWisdom: number
  avgFireTending: number
  avgSparkGeneration: number
  avgForgeTemperature: number
  forgeFurnaceCount: number
  glowingHearthCount: number
  steadyFireCount: number
  dyingEmbersCount: number
  coldAshPitCount: number
  extinguishedCount: number
  hasHighDeepAccessibilityCount: number
  hasHighEfficiencyCount: number
  hasHighFailureWisdomCount: number
  hasHighMaintenanceCount: number
  hasHighInnovationCount: number
  hasHighTemperatureCount: number
  overallHeat: number
  blacksmithGrade: BlacksmithGrade
  bestEmber: string
  warmest: string
  mostEfficient: string
  wisest: string
  bestMaintained: string
  mostInnovative: string
}

export interface EmberHearthIiResult {
  embers: GlowingEmber[]
  circles: HearthCircle[]
  forge: Forge
  stats: EmberHearthIiStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureWarm(content) evaluates code deep accessibility */
export function measureWarm(content: string): WarmMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const intimidationMatches = content.match(/\bvar\s+/g)
  const intimidationCount = intimidationMatches ? intimidationMatches.length : 0
  const hostilityMatches = content.match(/\bany\b/g)
  const hostilityCount = hostilityMatches ? hostilityMatches.length : 0

  const hasApproachable = hasExport && hasConst
  const hasDeeplyUsable = hasReturnType && hasDocComments
  const hasWelcoming = hasInterface && hasClass
  const hasGentle = hasNamedExport && hasTypeAnnotation
  const hasInviting = hasOptionalChaining && hasDefaultParam

  let deepAccessibility = 0
  if (hasExport) deepAccessibility += 10
  if (hasConst) deepAccessibility += 10
  if (hasReturnType) deepAccessibility += 10
  if (hasDocComments) deepAccessibility += 8
  if (hasInterface) deepAccessibility += 8
  if (hasClass) deepAccessibility += 8
  if (hasNamedExport) deepAccessibility += 8
  if (hasTypeAnnotation) deepAccessibility += 8
  if (hasOptionalChaining) deepAccessibility += 8
  if (hasDefaultParam) deepAccessibility += 8
  if (hasApproachable) deepAccessibility += 5
  if (hasDeeplyUsable) deepAccessibility += 5
  if (hasWelcoming) deepAccessibility += 5
  if (hasGentle) deepAccessibility += 5
  if (hasInviting) deepAccessibility += 5

  deepAccessibility = Math.min(100, Math.round(deepAccessibility))

  let heat: WarmMeasure['heat'] = 'frozen'
  if (deepAccessibility >= 85) heat = 'white-hot-core'
  else if (deepAccessibility >= 70) heat = 'glowing-ember'
  else if (deepAccessibility >= 55) heat = 'steady-warmth'
  else if (deepAccessibility >= 40) heat = 'cooling-coals'
  else if (deepAccessibility >= 25) heat = 'cold-ash'

  return {
    deepAccessibility, heat,
    hasHighDeepAccessibility: deepAccessibility >= 70,
    hasApproachable, hasDeeplyUsable, hasNoIntimidation: intimidationCount === 0,
    hasWelcoming, hasNoHostility: hostilityCount === 0,
    hasGentle, hasNoHarshness: intimidationCount === 0 && hostilityCount === 0,
    hasInviting, hasNoExclusion: intimidationCount === 0,
    intimidationCount, hostilityCount,
  }
}

/** @example measureBurning(content) evaluates code efficiency */
export function measureBurning(content: string): BurningMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)

  const wasteMatches = content.match(/\bvar\s+/g)
  const wasteCount = wasteMatches ? wasteMatches.length : 0
  const pollutionMatches = content.match(/\bany\b/g)
  const pollutionCount = pollutionMatches ? pollutionMatches.length : 0

  const hasEfficient = hasExport && hasReturnType
  const hasOptimized = hasStrictEquality && hasOptionalChaining
  const hasClean = hasConst && hasNullishCoalescing
  const hasLean = hasReadonly && hasPrivate
  const hasTargeted = hasNamedExport && hasInterface

  let efficiency = 0
  if (hasExport) efficiency += 8
  if (hasConst) efficiency += 10
  if (hasReturnType) efficiency += 10
  if (hasStrictEquality) efficiency += 8
  if (hasInterface) efficiency += 8
  if (hasOptionalChaining) efficiency += 10
  if (hasNullishCoalescing) efficiency += 8
  if (hasReadonly) efficiency += 8
  if (hasNamedExport) efficiency += 8
  if (hasPrivate) efficiency += 8
  if (hasEfficient) efficiency += 5
  if (hasOptimized) efficiency += 5
  if (hasClean) efficiency += 5
  if (hasLean) efficiency += 5
  if (hasTargeted) efficiency += 5

  efficiency = Math.min(100, Math.round(efficiency))

  let quality: BurningMeasure['quality'] = 'no-fire'
  if (efficiency >= 85) quality = 'complete-combustion'
  else if (efficiency >= 70) quality = 'clean-burn'
  else if (efficiency >= 55) quality = 'proper-flame'
  else if (efficiency >= 40) quality = 'smoky-burn'
  else if (efficiency >= 25) quality = 'sputtering'

  return {
    efficiency, quality,
    hasHighEfficiency: efficiency >= 70,
    hasEfficient, hasNoWaste: wasteCount === 0,
    hasOptimized, hasNoRedundancy: wasteCount === 0 && pollutionCount === 0,
    hasClean, hasNoPollution: pollutionCount === 0,
    hasLean, hasNoBloat: wasteCount === 0,
    hasTargeted,
    wasteCount, pollutionCount,
  }
}

/** @example measureWise(content) evaluates code lessons from failures */
export function measureWise(content: string): WiseMeasure {
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const repeatingMatches = content.match(/\bvar\s+/g)
  const repeatingCount = repeatingMatches ? repeatingMatches.length : 0
  const sameMistakesMatches = content.match(/\bany\b/g)
  const sameMistakesCount = sameMistakesMatches ? sameMistakesMatches.length : 0

  const hasLearnedFromErrors = hasTryCatch && hasAsync
  const hasErrorPatterns = hasReturnType && hasOptionalChaining
  const hasDefensive = hasNullishCoalescing && hasDefaultParam
  const hasHardened = hasInterface && hasClass
  const hasMature = hasExport && hasConst

  let failureWisdom = 0
  if (hasTryCatch) failureWisdom += 10
  if (hasAsync) failureWisdom += 8
  if (hasReturnType) failureWisdom += 10
  if (hasExport) failureWisdom += 8
  if (hasInterface) failureWisdom += 8
  if (hasClass) failureWisdom += 8
  if (hasOptionalChaining) failureWisdom += 10
  if (hasNullishCoalescing) failureWisdom += 8
  if (hasConst) failureWisdom += 8
  if (hasDefaultParam) failureWisdom += 8
  if (hasLearnedFromErrors) failureWisdom += 5
  if (hasErrorPatterns) failureWisdom += 5
  if (hasDefensive) failureWisdom += 5
  if (hasHardened) failureWisdom += 5
  if (hasMature) failureWisdom += 5

  failureWisdom = Math.min(100, Math.round(failureWisdom))

  let knowledge: WiseMeasure['knowledge'] = 'ignorant'
  if (failureWisdom >= 85) knowledge = 'sage-wisdom'
  else if (failureWisdom >= 70) knowledge = 'experienced-learner'
  else if (failureWisdom >= 55) knowledge = 'proper-scholar'
  else if (failureWisdom >= 40) knowledge = 'still-learning'
  else if (failureWisdom >= 25) knowledge = 'naive'

  return {
    failureWisdom, knowledge,
    hasHighFailureWisdom: failureWisdom >= 70,
    hasLearnedFromErrors, hasNoRepeating: repeatingCount === 0,
    hasErrorPatterns, hasNoSameMistakes: sameMistakesCount === 0,
    hasDefensive, hasNoNaivety: repeatingCount === 0 && sameMistakesCount === 0,
    hasHardened, hasNoInnocence: repeatingCount === 0,
    hasMature, hasNoFolly: repeatingCount === 0 && sameMistakesCount === 0,
    repeatingCount, sameMistakesCount,
  }
}

/** @example measureTending(content) evaluates code maintenance quality */
export function measureTending(content: string): TendingMeasure {
  const hasExport = /export\s/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)

  const neglectMatches = content.match(/\bvar\s+/g)
  const neglectCount = neglectMatches ? neglectMatches.length : 0
  const stalenessMatches = content.match(/\bany\b/g)
  const stalenessCount = stalenessMatches ? stalenessMatches.length : 0

  const hasMaintained = hasExport && hasDocComments
  const hasUpdated = hasReturnType && hasConst
  const hasCared = hasInterface && hasClass
  const hasNurtured = hasReadonly && hasPrivate
  const hasFresh = hasNamedExport && hasTypeAnnotation

  let maintenance = 0
  if (hasExport) maintenance += 8
  if (hasDocComments) maintenance += 15
  if (hasReturnType) maintenance += 10
  if (hasConst) maintenance += 8
  if (hasInterface) maintenance += 8
  if (hasClass) maintenance += 8
  if (hasReadonly) maintenance += 8
  if (hasPrivate) maintenance += 8
  if (hasNamedExport) maintenance += 8
  if (hasTypeAnnotation) maintenance += 8
  if (hasMaintained) maintenance += 5
  if (hasUpdated) maintenance += 5
  if (hasCared) maintenance += 5
  if (hasNurtured) maintenance += 5
  if (hasFresh) maintenance += 5

  maintenance = Math.min(100, Math.round(maintenance))

  let care: TendingMeasure['care'] = 'abandoned'
  if (maintenance >= 85) care = 'master-firekeeper'
  else if (maintenance >= 70) care = 'dedicated-tender'
  else if (maintenance >= 55) care = 'proper-caretaker'
  else if (maintenance >= 40) care = 'occasional-attention'
  else if (maintenance >= 25) care = 'neglected'

  return {
    maintenance, care,
    hasHighMaintenance: maintenance >= 70,
    hasMaintained, hasNoNeglect: neglectCount === 0,
    hasUpdated, hasNoStaleness: stalenessCount === 0,
    hasCared, hasNoAbandonment: neglectCount === 0 && stalenessCount === 0,
    hasNurtured, hasNoDecay: neglectCount === 0,
    hasFresh, hasNoRot: neglectCount === 0 && stalenessCount === 0,
    neglectCount, stalenessCount,
  }
}

/** @example measureSparking(content) evaluates code innovation */
export function measureSparking(content: string): SparkingMeasure {
  const hasExport = /export\s/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)

  const dullnessMatches = content.match(/\bvar\s+/g)
  const dullnessCount = dullnessMatches ? dullnessMatches.length : 0
  const copyMatches = content.match(/\bany\b/g)
  const copyCount = copyMatches ? copyMatches.length : 0

  const hasInnovative = hasGenerics && hasAsync
  const hasClever = hasReturnType && hasOptionalChaining
  const hasOriginal = hasInterface && hasTypeAlias
  const hasCreative = hasEnum && hasNullishCoalescing
  const hasInventive = hasExport && hasClass
  const hasSpark = hasGenerics && hasNullishCoalescing

  let innovation = 0
  if (hasExport) innovation += 8
  if (hasGenerics) innovation += 10
  if (hasReturnType) innovation += 8
  if (hasAsync) innovation += 10
  if (hasInterface) innovation += 8
  if (hasClass) innovation += 8
  if (hasTypeAlias) innovation += 10
  if (hasEnum) innovation += 8
  if (hasOptionalChaining) innovation += 8
  if (hasNullishCoalescing) innovation += 8
  if (hasInnovative) innovation += 5
  if (hasClever) innovation += 5
  if (hasOriginal) innovation += 5
  if (hasCreative) innovation += 5
  if (hasInventive) innovation += 5

  innovation = Math.min(100, Math.round(innovation))

  let creativity: SparkingMeasure['creativity'] = 'no-spark'
  if (innovation >= 85) creativity = 'fireworks-display'
  else if (innovation >= 70) creativity = 'creative-sparks'
  else if (innovation >= 55) creativity = 'clever-ignition'
  else if (innovation >= 40) creativity = 'routine-flame'
  else if (innovation >= 25) creativity = 'dormant'

  return {
    innovation, creativity,
    hasHighInnovation: innovation >= 70,
    hasInnovative, hasClever, hasNoDullness: dullnessCount === 0,
    hasOriginal, hasNoCopy: copyCount === 0,
    hasCreative, hasNoGeneric: dullnessCount === 0 && copyCount === 0,
    hasInventive, hasNoDerivative: dullnessCount === 0,
    hasSpark,
    dullnessCount, copyCount,
  }
}

/** @example measureForging(content) evaluates code transformation capability */
export function measureForging(content: string): ForgingMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)

  const rigidityMatches = content.match(/\bvar\s+/g)
  const rigidityCount = rigidityMatches ? rigidityMatches.length : 0
  const brittlenessMatches = content.match(/\bany\b/g)
  const brittlenessCount = brittlenessMatches ? brittlenessMatches.length : 0

  const hasTransformative = hasGenerics && hasInterface
  const hasMalleable = hasReturnType && hasOptionalChaining
  const hasRefactorable = hasNamedExport && hasConst
  const hasShapable = hasPrivate && hasReadonly
  const hasWorkable = hasExport && hasClass
  const hasHeatTreatable = hasGenerics && hasOptionalChaining

  let temperature = 0
  if (hasExport) temperature += 8
  if (hasInterface) temperature += 10
  if (hasClass) temperature += 8
  if (hasPrivate) temperature += 8
  if (hasReadonly) temperature += 8
  if (hasReturnType) temperature += 10
  if (hasConst) temperature += 8
  if (hasGenerics) temperature += 10
  if (hasNamedExport) temperature += 8
  if (hasOptionalChaining) temperature += 10
  if (hasTransformative) temperature += 5
  if (hasMalleable) temperature += 5
  if (hasRefactorable) temperature += 5
  if (hasShapable) temperature += 5
  if (hasWorkable) temperature += 5

  temperature = Math.min(100, Math.round(temperature))

  let heat: ForgingMeasure['heat'] = 'frozen-solid'
  if (temperature >= 85) heat = 'forge-ready'
  else if (temperature >= 70) heat = 'glowing-hot'
  else if (temperature >= 55) heat = 'proper-heat'
  else if (temperature >= 40) heat = 'warm-metal'
  else if (temperature >= 25) heat = 'cold-iron'

  return {
    temperature, heat,
    hasHighTemperature: temperature >= 70,
    hasTransformative, hasMalleable, hasNoRigidity: rigidityCount === 0,
    hasRefactorable, hasNoBrittleness: brittlenessCount === 0,
    hasShapable, hasNoFixedForm: rigidityCount === 0 && brittlenessCount === 0,
    hasWorkable, hasNoCrystalized: rigidityCount === 0,
    hasHeatTreatable,
    rigidityCount, brittlenessCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'forge-furnace' */
export function classifyCondition(score: number): EmberCondition {
  if (score >= 85) return 'forge-furnace'
  if (score >= 70) return 'glowing-hearth'
  if (score >= 55) return 'steady-fire'
  if (score >= 40) return 'dying-embers'
  if (score >= 25) return 'cold-ash-pit'
  return 'extinguished'
}

/** @example classifyCircleType(embers) returns circle classification */
export function classifyCircleType(embers: GlowingEmber[]): CircleType {
  if (embers.length === 0) return 'cold-ashes'
  const avgQs = embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length
  const forgeCount = embers.filter((e) => e.condition === 'forge-furnace').length
  const ratio = forgeCount / embers.length
  if (avgQs >= 75 && ratio >= 0.5) return 'grand-forge'
  if (avgQs >= 60) return 'community-hearth'
  if (avgQs >= 45) return 'family-fireplace'
  if (avgQs >= 30) return 'campfire'
  if (avgQs >= 15) return 'dying-embers'
  return 'cold-ashes'
}

/** @example classifyCircleCondition(avgQs) returns circle condition */
export function classifyCircleCondition(avgQs: number): CircleCondition {
  if (avgQs >= 75) return 'blazing-forge'
  if (avgQs >= 60) return 'warm-gathering'
  if (avgQs >= 45) return 'steady-warmth'
  if (avgQs >= 30) return 'cooling-hearth'
  if (avgQs >= 15) return 'dying-fire'
  return 'cold-night'
}

/** @example classifyBlacksmithGrade(80) returns 'master-blacksmith' */
export function classifyBlacksmithGrade(avgHeat: number): BlacksmithGrade {
  if (avgHeat >= 80) return 'master-blacksmith'
  if (avgHeat >= 65) return 'expert-forger'
  if (avgHeat >= 50) return 'skilled-smith'
  if (avgHeat >= 35) return 'apprentice'
  if (avgHeat >= 20) return 'bellows-boy'
  return 'cold-hands'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeGlowingEmber(content, filePath) evaluates single file */
export function analyzeGlowingEmber(content: string, filePath: string): GlowingEmber {
  const warmMeasure = measureWarm(content)
  const burningMeasure = measureBurning(content)
  const wiseMeasure = measureWise(content)
  const tendingMeasure = measureTending(content)
  const sparkingMeasure = measureSparking(content)
  const forgingMeasure = measureForging(content)

  const qualityScore = Math.round(
    warmMeasure.deepAccessibility * 0.2 +
    burningMeasure.efficiency * 0.15 +
    wiseMeasure.failureWisdom * 0.15 +
    tendingMeasure.maintenance * 0.15 +
    sparkingMeasure.innovation * 0.15 +
    forgingMeasure.temperature * 0.2,
  )

  return {
    file: filePath,
    warmthDeep: warmMeasure.deepAccessibility,
    burnQuality: burningMeasure.efficiency,
    ashWisdom: wiseMeasure.failureWisdom,
    fireTending: tendingMeasure.maintenance,
    sparkGeneration: sparkingMeasure.innovation,
    forgeTemperature: forgingMeasure.temperature,
    warm: warmMeasure,
    burning: burningMeasure,
    wise: wiseMeasure,
    tending: tendingMeasure,
    sparking: sparkingMeasure,
    forging: forgingMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeHearthCircle(embers, dirPath) evaluates directory */
export function analyzeHearthCircle(embers: GlowingEmber[], dirPath: string): HearthCircle {
  if (embers.length === 0) {
    return {
      directory: dirPath, embers: [],
      avgWarmth: 0, avgWisdom: 0, avgInnovation: 0,
      forgeFurnaceCount: 0, extinguishedCount: 0, glowingHearthCount: 0, steadyFireCount: 0,
      circleType: 'cold-ashes', condition: 'cold-night',
    }
  }

  const avgWarmth = Math.round(embers.reduce((s, e) => s + e.warmthDeep, 0) / embers.length)
  const avgWisdom = Math.round(embers.reduce((s, e) => s + e.ashWisdom, 0) / embers.length)
  const avgInnovation = Math.round(embers.reduce((s, e) => s + e.sparkGeneration, 0) / embers.length)
  const forgeFurnaceCount = embers.filter((e) => e.condition === 'forge-furnace').length
  const extinguishedCount = embers.filter((e) => e.condition === 'extinguished').length
  const glowingHearthCount = embers.filter((e) => e.condition === 'glowing-hearth').length
  const steadyFireCount = embers.filter((e) => e.condition === 'steady-fire').length
  const avgQs = embers.reduce((s, e) => s + e.qualityScore, 0) / embers.length

  return {
    directory: dirPath, embers,
    avgWarmth, avgWisdom, avgInnovation,
    forgeFurnaceCount, extinguishedCount, glowingHearthCount, steadyFireCount,
    circleType: classifyCircleType(embers),
    condition: classifyCircleCondition(avgQs),
  }
}

/** @example generateRecommendations(embers, circles, forge, stats) generates advice */
export function generateRecommendations(
  embers: GlowingEmber[],
  circles: HearthCircle[],
  forge: Forge,
  stats: EmberHearthIiStats,
): string[] {
  const recs: string[] = []

  if (stats.avgWarmthDeep < 50) {
    recs.push('Deepen accessibility with doc comments, optional chaining, and default parameters')
  }
  if (stats.avgBurnQuality < 50) {
    recs.push('Improve burn quality with strict equality, optional chaining, and nullish coalescing')
  }
  if (stats.avgAshWisdom < 50) {
    recs.push('Gain ash wisdom with try/catch blocks, defensive coding, and error patterns')
  }
  if (stats.avgFireTending < 50) {
    recs.push('Tend the fire with JSDoc comments, return types, and regular maintenance patterns')
  }
  if (stats.avgSparkGeneration < 50) {
    recs.push('Generate sparks with generics, type aliases, and creative patterns')
  }
  if (stats.avgForgeTemperature < 50) {
    recs.push('Raise forge temperature with interfaces, generics, and flexible abstractions')
  }
  if (stats.extinguishedCount > 0) {
    recs.push(`${String(stats.extinguishedCount)} file(s) are extinguished — consider significant refactoring`)
  }
  if (forge.overallHeat < 40) {
    recs.push('Overall forge heat is low — prioritize warmth and wisdom improvements')
  }
  if (circles.length > 0 && circles.every((c) => c.circleType === 'cold-ashes' || c.circleType === 'dying-embers')) {
    recs.push('All circles are dying — consider a major quality improvement effort')
  }

  const extinguishedFiles = embers.filter((e) => e.condition === 'extinguished')
  if (extinguishedFiles.length > 0 && extinguishedFiles.length <= 3) {
    const names = extinguishedFiles.map((e) => e.file).join(', ')
    recs.push(`Relight these extinguished files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your forge burns with the wisdom of a thousand fires! Every ember glows with purpose')
  }

  return Array.from(new Set(recs))
}

/** @example buildEmberHearthIiResult(files, contents, options) orchestrates analysis */
export function buildEmberHearthIiResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): EmberHearthIiResult {
  const embers = files.map((file, i) => analyzeGlowingEmber(contents[i] ?? '', file))

  const cMap = new Map<string, GlowingEmber[]>()
  for (const ember of embers) {
    const dir = ember.file.includes('/') ? ember.file.split('/').slice(0, -1).join('/') : '.'
    const existing = cMap.get(dir)
    if (existing) {
      existing.push(ember)
    } else {
      cMap.set(dir, [ember])
    }
  }

  const circles = Array.from(cMap.entries()).map(([dir, dirEmbers]) =>
    analyzeHearthCircle(dirEmbers, dir),
  )

  const totalFiles = embers.length
  const avgWarmthDeep = totalFiles > 0 ? Math.round(embers.reduce((s, e) => s + e.warmthDeep, 0) / totalFiles) : 0
  const avgBurnQuality = totalFiles > 0 ? Math.round(embers.reduce((s, e) => s + e.burnQuality, 0) / totalFiles) : 0
  const avgAshWisdom = totalFiles > 0 ? Math.round(embers.reduce((s, e) => s + e.ashWisdom, 0) / totalFiles) : 0
  const avgFireTending = totalFiles > 0 ? Math.round(embers.reduce((s, e) => s + e.fireTending, 0) / totalFiles) : 0
  const avgSparkGeneration = totalFiles > 0 ? Math.round(embers.reduce((s, e) => s + e.sparkGeneration, 0) / totalFiles) : 0
  const avgForgeTemperature = totalFiles > 0 ? Math.round(embers.reduce((s, e) => s + e.forgeTemperature, 0) / totalFiles) : 0

  const avgWarmth = avgWarmthDeep
  const avgWisdom = avgAshWisdom
  const avgInnovation = avgSparkGeneration

  const overallHeat = totalFiles > 0
    ? Math.round((avgWarmth + avgWisdom + avgInnovation) / 3)
    : 0

  const forge: Forge = {
    avgWarmth, avgWisdom, avgInnovation,
    isHot: avgWarmth >= 60,
    overallHeat,
  }

  const bestEmber = totalFiles > 0
    ? embers.reduce((best, e) => (e.qualityScore > best.qualityScore ? e : best), embers[0] as typeof embers[number]).file
    : ''
  const warmest = totalFiles > 0
    ? embers.reduce((best, e) => (e.warmthDeep > best.warmthDeep ? e : best), embers[0] as typeof embers[number]).file
    : ''
  const mostEfficient = totalFiles > 0
    ? embers.reduce((best, e) => (e.burnQuality > best.burnQuality ? e : best), embers[0] as typeof embers[number]).file
    : ''
  const wisest = totalFiles > 0
    ? embers.reduce((best, e) => (e.ashWisdom > best.ashWisdom ? e : best), embers[0] as typeof embers[number]).file
    : ''
  const bestMaintained = totalFiles > 0
    ? embers.reduce((best, e) => (e.fireTending > best.fireTending ? e : best), embers[0] as typeof embers[number]).file
    : ''
  const mostInnovative = totalFiles > 0
    ? embers.reduce((best, e) => (e.sparkGeneration > best.sparkGeneration ? e : best), embers[0] as typeof embers[number]).file
    : ''

  const stats: EmberHearthIiStats = {
    totalFiles,
    totalCircles: circles.length,
    avgWarmthDeep, avgBurnQuality, avgAshWisdom,
    avgFireTending, avgSparkGeneration, avgForgeTemperature,
    forgeFurnaceCount: embers.filter((e) => e.condition === 'forge-furnace').length,
    glowingHearthCount: embers.filter((e) => e.condition === 'glowing-hearth').length,
    steadyFireCount: embers.filter((e) => e.condition === 'steady-fire').length,
    dyingEmbersCount: embers.filter((e) => e.condition === 'dying-embers').length,
    coldAshPitCount: embers.filter((e) => e.condition === 'cold-ash-pit').length,
    extinguishedCount: embers.filter((e) => e.condition === 'extinguished').length,
    hasHighDeepAccessibilityCount: embers.filter((e) => e.warm.hasHighDeepAccessibility).length,
    hasHighEfficiencyCount: embers.filter((e) => e.burning.hasHighEfficiency).length,
    hasHighFailureWisdomCount: embers.filter((e) => e.wise.hasHighFailureWisdom).length,
    hasHighMaintenanceCount: embers.filter((e) => e.tending.hasHighMaintenance).length,
    hasHighInnovationCount: embers.filter((e) => e.sparking.hasHighInnovation).length,
    hasHighTemperatureCount: embers.filter((e) => e.forging.hasHighTemperature).length,
    overallHeat,
    blacksmithGrade: classifyBlacksmithGrade(overallHeat),
    bestEmber, warmest, mostEfficient, wisest, bestMaintained, mostInnovative,
  }

  const recommendations = generateRecommendations(embers, circles, forge, stats)

  return { embers, circles, forge, stats, recommendations }
}
