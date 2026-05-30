// ─── Types ─────────────────────────────────────────────────────────────────

export interface TransmutingMeasure {
  purity: number
  grade: 'pure-gold' | 'refined-silver' | 'proper-transmutation' | 'base-metal' | 'slag' | 'failed-alchemy'
  hasHighPurity: boolean
  hasAccurate: boolean
  hasFaithful: boolean
  hasNoDistortion: boolean
  hasPure: boolean
  hasNoCorruption: boolean
  hasPrecise: boolean
  hasNoApproximation: boolean
  hasClean: boolean
  hasNoPollution: boolean
  hasTrue: boolean
  distortionCount: number
  corruptionCount: number
}

export interface PhialMeasure {
  quality: number
  vessel: 'crystal-phial' | 'pure-flask' | 'proper-vessel' | 'cracked-flask' | 'leaky-container' | 'broken-glass'
  hasHighQuality: boolean
  hasWellContained: boolean
  hasProperScope: boolean
  hasNoLeaking: boolean
  hasEncapsulated: boolean
  hasNoSpilling: boolean
  hasSealed: boolean
  hasNoBleeding: boolean
  hasProperBoundaries: boolean
  hasNoContamination: boolean
  hasClean: boolean
  leakingCount: number
  bleedingCount: number
}

export interface DistillingMeasure {
  essence: number
  purity2: 'pure-essence' | 'concentrated' | 'proper-extract' | 'diluted' | 'watery' | 'impure'
  hasHighEssence: boolean
  hasCore: boolean
  hasEssential: boolean
  hasNoFiller: boolean
  hasConcentrated: boolean
  hasNoWaste: boolean
  hasExtracted: boolean
  hasNoNoise: boolean
  hasValuable: boolean
  hasNoPadding: boolean
  hasRefined: boolean
  fillerCount: number
  wasteCount: number
}

export interface BalancingMeasure {
  elements: number
  harmony: 'perfect-equilibrium' | 'well-balanced' | 'proper-mix' | 'uneven-elements' | 'imbalanced' | 'chaotic-mix'
  hasHighElements: boolean
  hasBalanced: boolean
  hasProportioned: boolean
  hasNoOverweight: boolean
  hasHarmonious: boolean
  hasNoClash: boolean
  hasEven: boolean
  hasNoImbalance: boolean
  hasDistributed: boolean
  hasNoLopsided: boolean
  hasStable: boolean
  overweightCount: number
  imbalanceCount: number
}

export interface PhilosophicMeasure {
  wisdom: number
  insight: 'enlightened' | 'wise' | 'learned' | 'student' | 'novice' | 'ignorant'
  hasHighWisdom: boolean
  hasMature: boolean
  hasProven: boolean
  hasNoNaivety: boolean
  hasTested: boolean
  hasNoFragility: boolean
  hasRobust: boolean
  hasNoInnocence: boolean
  hasExperienced: boolean
  hasNoVulnerability: boolean
  hasRefined: boolean
  naivetyCount: number
  fragilityCount: number
}

export interface GoldenMeasure {
  ratio: number
  proportion: 'golden-spiral' | 'proper-proportion' | 'well-sized' | 'adequate' | 'misproportioned' | 'grotesque'
  hasHighRatio: boolean
  hasRightSized: boolean
  hasProportioned: boolean
  hasNoBloat: boolean
  hasLean: boolean
  hasNoWaste: boolean
  hasElegant: boolean
  hasNoExcess: boolean
  hasOptimal: boolean
  hasNoOverkill: boolean
  hasBeautiful: boolean
  bloatCount: number
  wasteCount: number
}

export type PhialCondition = 'philosopher-stone' | 'pure-gold' | 'silver-phial' | 'base-metal' | 'lead-weight' | 'slag-heap'

export interface AlchemicalPhial {
  file: string
  transmutationPurity: number
  phialQuality: number
  essenceDistillation: number
  elementalBalance: number
  philosopherQuality: number
  goldenRatio: number
  transmuting: TransmutingMeasure
  phial: PhialMeasure
  distilling: DistillingMeasure
  balancing: BalancingMeasure
  philosophic: PhilosophicMeasure
  golden: GoldenMeasure
  condition: PhialCondition
  qualityScore: number
}

export type WorkshopType = 'grand-laboratory' | 'master-alchemist' | 'village-apothecary' | 'backroom-still' | 'hobby-shed' | 'empty-room'
export type WorkshopCondition = 'golden-laboratory' | 'proper-workshop' | 'decent-lab' | 'messy-bench' | 'ruined-lab' | 'abandoned'

export interface AlchemyWorkshop {
  directory: string
  phials: AlchemicalPhial[]
  avgPurity: number
  avgBalance: number
  avgGolden: number
  philosopherStoneCount: number
  slagHeapCount: number
  pureGoldCount: number
  silverPhialCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

export interface Guild {
  avgPurity: number
  avgBalance: number
  avgGolden: number
  isGolden: boolean
  overallPurity: number
}

export type AlchemistGrade = 'grand-master-alchemist' | 'master-transmuter' | 'skilled-alchemist' | 'apprentice' | 'novice' | 'charlatan'

export interface AlchemyGlassStats {
  totalFiles: number
  totalWorkshops: number
  avgTransmutationPurity: number
  avgPhialQuality: number
  avgEssenceDistillation: number
  avgElementalBalance: number
  avgPhilosopherQuality: number
  avgGoldenRatio: number
  philosopherStoneCount: number
  pureGoldCount: number
  silverPhialCount: number
  baseMetalCount: number
  leadWeightCount: number
  slagHeapCount: number
  hasHighPurityCount: number
  hasHighQualityCount: number
  hasHighEssenceCount: number
  hasHighElementsCount: number
  hasHighWisdomCount: number
  hasHighRatioCount: number
  overallPurity: number
  alchemistGrade: AlchemistGrade
  bestPhial: string
  purest: string
  bestContained: string
  mostEssential: string
  mostBalanced: string
  wisest: string
}

export interface AlchemyGlassResult {
  phials: AlchemicalPhial[]
  workshops: AlchemyWorkshop[]
  guild: Guild
  stats: AlchemyGlassStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureTransmuting(content) evaluates code transformation accuracy */
export function measureTransmuting(content: string): TransmutingMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  const distortionMatches = content.match(/\bvar\s+/g)
  const distortionCount = distortionMatches ? distortionMatches.length : 0
  const corruptionMatches = content.match(/\bany\b/g)
  const corruptionCount = corruptionMatches ? corruptionMatches.length : 0

  const hasAccurate = hasStrictEquality && hasConst
  const hasFaithful = hasReturnType && hasInterface
  const hasPure = hasAsync && hasTryCatch
  const hasPrecise = hasOptionalChaining && hasGenerics
  const hasClean = hasExport && hasConst
  const hasTrue = hasTypeAlias && hasReturnType

  let purity = 0
  if (hasExport) purity += 8
  if (hasConst) purity += 10
  if (hasReturnType) purity += 10
  if (hasStrictEquality) purity += 8
  if (hasInterface) purity += 10
  if (hasTypeAlias) purity += 8
  if (hasAsync) purity += 8
  if (hasTryCatch) purity += 10
  if (hasOptionalChaining) purity += 8
  if (hasGenerics) purity += 8
  if (hasAccurate) purity += 5
  if (hasFaithful) purity += 5
  if (hasPure) purity += 5
  if (hasPrecise) purity += 5
  if (hasClean) purity += 5

  purity = Math.min(100, Math.round(purity))

  let grade: TransmutingMeasure['grade'] = 'failed-alchemy'
  if (purity >= 85) grade = 'pure-gold'
  else if (purity >= 70) grade = 'refined-silver'
  else if (purity >= 55) grade = 'proper-transmutation'
  else if (purity >= 40) grade = 'base-metal'
  else if (purity >= 25) grade = 'slag'

  return {
    purity, grade,
    hasHighPurity: purity >= 70,
    hasAccurate, hasFaithful, hasNoDistortion: distortionCount === 0,
    hasPure, hasNoCorruption: corruptionCount === 0,
    hasPrecise, hasNoApproximation: distortionCount === 0 && corruptionCount === 0,
    hasClean, hasNoPollution: distortionCount === 0,
    hasTrue,
    distortionCount, corruptionCount,
  }
}

/** @example measurePhial(content) evaluates code container quality */
export function measurePhial(content: string): PhialMeasure {
  const hasExport = /export\s/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasImport = /import\s+/.test(content)

  const leakingMatches = content.match(/\bvar\s+/g)
  const leakingCount = leakingMatches ? leakingMatches.length : 0
  const bleedingMatches = content.match(/\bany\b/g)
  const bleedingCount = bleedingMatches ? bleedingMatches.length : 0

  const hasWellContained = hasPrivate && hasReadonly
  const hasProperScope = hasExport && hasConst
  const hasEncapsulated = hasClass && hasPrivate
  const hasSealed = hasInterface && hasReturnType
  const hasProperBoundaries = hasNamedExport && hasDocComments
  const hasClean = hasImport && hasExport

  let quality = 0
  if (hasExport) quality += 8
  if (hasPrivate) quality += 10
  if (hasReadonly) quality += 8
  if (hasConst) quality += 8
  if (hasInterface) quality += 10
  if (hasClass) quality += 8
  if (hasReturnType) quality += 10
  if (hasNamedExport) quality += 8
  if (hasDocComments) quality += 8
  if (hasImport) quality += 8
  if (hasWellContained) quality += 5
  if (hasProperScope) quality += 5
  if (hasEncapsulated) quality += 5
  if (hasSealed) quality += 5
  if (hasProperBoundaries) quality += 5

  quality = Math.min(100, Math.round(quality))

  let vessel: PhialMeasure['vessel'] = 'broken-glass'
  if (quality >= 85) vessel = 'crystal-phial'
  else if (quality >= 70) vessel = 'pure-flask'
  else if (quality >= 55) vessel = 'proper-vessel'
  else if (quality >= 40) vessel = 'cracked-flask'
  else if (quality >= 25) vessel = 'leaky-container'

  return {
    quality, vessel,
    hasHighQuality: quality >= 70,
    hasWellContained, hasProperScope, hasNoLeaking: leakingCount === 0,
    hasEncapsulated, hasNoSpilling: bleedingCount === 0,
    hasSealed, hasNoBleeding: leakingCount === 0 && bleedingCount === 0,
    hasProperBoundaries, hasNoContamination: leakingCount === 0,
    hasClean,
    leakingCount, bleedingCount,
  }
}

/** @example measureDistilling(content) evaluates code core extraction */
export function measureDistilling(content: string): DistillingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const fillerMatches = content.match(/\bvar\s+/g)
  const fillerCount = fillerMatches ? fillerMatches.length : 0
  const wasteMatches = content.match(/\bany\b/g)
  const wasteCount = wasteMatches ? wasteMatches.length : 0

  const hasCore = hasExport && hasConst
  const hasEssential = hasReturnType && hasInterface
  const hasConcentrated = hasGenerics && hasTypeAlias
  const hasExtracted = hasImport && hasReadonly
  const hasValuable = hasAsync && hasDocComments
  const hasRefined = hasInterface && hasGenerics

  let essence = 0
  if (hasExport) essence += 10
  if (hasImport) essence += 8
  if (hasConst) essence += 8
  if (hasReturnType) essence += 10
  if (hasInterface) essence += 10
  if (hasGenerics) essence += 10
  if (hasTypeAlias) essence += 8
  if (hasReadonly) essence += 8
  if (hasAsync) essence += 8
  if (hasDocComments) essence += 8
  if (hasCore) essence += 5
  if (hasEssential) essence += 5
  if (hasConcentrated) essence += 5
  if (hasExtracted) essence += 5
  if (hasValuable) essence += 5

  essence = Math.min(100, Math.round(essence))

  let purity2: DistillingMeasure['purity2'] = 'impure'
  if (essence >= 85) purity2 = 'pure-essence'
  else if (essence >= 70) purity2 = 'concentrated'
  else if (essence >= 55) purity2 = 'proper-extract'
  else if (essence >= 40) purity2 = 'diluted'
  else if (essence >= 25) purity2 = 'watery'

  return {
    essence, purity2,
    hasHighEssence: essence >= 70,
    hasCore, hasEssential, hasNoFiller: fillerCount === 0,
    hasConcentrated, hasNoWaste: wasteCount === 0,
    hasExtracted, hasNoNoise: fillerCount === 0 && wasteCount === 0,
    hasValuable, hasNoPadding: fillerCount === 0,
    hasRefined,
    fillerCount, wasteCount,
  }
}

/** @example measureBalancing(content) evaluates code quality balance */
export function measureBalancing(content: string): BalancingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)

  const overweightMatches = content.match(/\bvar\s+/g)
  const overweightCount = overweightMatches ? overweightMatches.length : 0
  const imbalanceMatches = content.match(/\bany\b/g)
  const imbalanceCount = imbalanceMatches ? imbalanceMatches.length : 0

  const hasBalanced = hasExport && hasImport
  const hasProportioned = hasInterface && hasClass
  const hasHarmonious = hasReturnType && hasConst
  const hasEven = hasPrivate && hasReadonly
  const hasDistributed = hasNamedExport && hasDocComments
  const hasStable = hasExport && hasConst

  let elements = 0
  if (hasExport) elements += 10
  if (hasImport) elements += 10
  if (hasConst) elements += 8
  if (hasInterface) elements += 8
  if (hasClass) elements += 8
  if (hasReturnType) elements += 10
  if (hasPrivate) elements += 8
  if (hasReadonly) elements += 8
  if (hasNamedExport) elements += 8
  if (hasDocComments) elements += 8
  if (hasBalanced) elements += 5
  if (hasProportioned) elements += 5
  if (hasHarmonious) elements += 5
  if (hasEven) elements += 5
  if (hasDistributed) elements += 5

  elements = Math.min(100, Math.round(elements))

  let harmony: BalancingMeasure['harmony'] = 'chaotic-mix'
  if (elements >= 85) harmony = 'perfect-equilibrium'
  else if (elements >= 70) harmony = 'well-balanced'
  else if (elements >= 55) harmony = 'proper-mix'
  else if (elements >= 40) harmony = 'uneven-elements'
  else if (elements >= 25) harmony = 'imbalanced'

  return {
    elements, harmony,
    hasHighElements: elements >= 70,
    hasBalanced, hasProportioned, hasNoOverweight: overweightCount === 0,
    hasHarmonious, hasNoClash: imbalanceCount === 0,
    hasEven, hasNoImbalance: overweightCount === 0 && imbalanceCount === 0,
    hasDistributed, hasNoLopsided: overweightCount === 0,
    hasStable,
    overweightCount, imbalanceCount,
  }
}

/** @example measurePhilosophic(content) evaluates code wisdom */
export function measurePhilosophic(content: string): PhilosophicMeasure {
  const hasExport = /export\s/.test(content)
  const hasAsync = /\basync\s+/.test(content)
  const hasTryCatch = /\btry\s*\{/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasGenerics = /<\w+>/.test(content)

  const naivetyMatches = content.match(/\bvar\s+/g)
  const naivetyCount = naivetyMatches ? naivetyMatches.length : 0
  const fragilityMatches = content.match(/\bany\b/g)
  const fragilityCount = fragilityMatches ? fragilityMatches.length : 0

  const hasMature = hasTryCatch && hasAsync
  const hasProven = hasStrictEquality && hasReturnType
  const hasTested = hasOptionalChaining && hasNullishCoalescing
  const hasRobust = hasInterface && hasGenerics
  const hasExperienced = hasExport && hasAsync
  const hasRefined = hasConst && hasReturnType

  let wisdom = 0
  if (hasExport) wisdom += 8
  if (hasAsync) wisdom += 10
  if (hasTryCatch) wisdom += 10
  if (hasReturnType) wisdom += 8
  if (hasInterface) wisdom += 10
  if (hasConst) wisdom += 8
  if (hasOptionalChaining) wisdom += 10
  if (hasNullishCoalescing) wisdom += 8
  if (hasStrictEquality) wisdom += 8
  if (hasGenerics) wisdom += 8
  if (hasMature) wisdom += 5
  if (hasProven) wisdom += 5
  if (hasTested) wisdom += 5
  if (hasRobust) wisdom += 5
  if (hasExperienced) wisdom += 5

  wisdom = Math.min(100, Math.round(wisdom))

  let insight: PhilosophicMeasure['insight'] = 'ignorant'
  if (wisdom >= 85) insight = 'enlightened'
  else if (wisdom >= 70) insight = 'wise'
  else if (wisdom >= 55) insight = 'learned'
  else if (wisdom >= 40) insight = 'student'
  else if (wisdom >= 25) insight = 'novice'

  return {
    wisdom, insight,
    hasHighWisdom: wisdom >= 70,
    hasMature, hasProven, hasNoNaivety: naivetyCount === 0,
    hasTested, hasNoFragility: fragilityCount === 0,
    hasRobust, hasNoInnocence: naivetyCount === 0 && fragilityCount === 0,
    hasExperienced, hasNoVulnerability: naivetyCount === 0,
    hasRefined,
    naivetyCount, fragilityCount,
  }
}

/** @example measureGolden(content) evaluates code proportion */
export function measureGolden(content: string): GoldenMeasure {
  const hasExport = /export\s/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const bloatMatches = content.match(/\bvar\s+/g)
  const bloatCount = bloatMatches ? bloatMatches.length : 0
  const wasteMatches = content.match(/\bany\b/g)
  const wasteCount = wasteMatches ? wasteMatches.length : 0

  const hasRightSized = hasConst && hasReturnType
  const hasProportioned = hasInterface && hasReadonly
  const hasLean = hasOptionalChaining && hasTypeAlias
  const hasElegant = hasGenerics && hasDefaultParam
  const hasOptimal = hasExport && hasConst
  const hasBeautiful = hasNamedExport && hasReturnType

  let ratio = 0
  if (hasExport) ratio += 8
  if (hasConst) ratio += 10
  if (hasReturnType) ratio += 10
  if (hasInterface) ratio += 8
  if (hasReadonly) ratio += 8
  if (hasOptionalChaining) ratio += 10
  if (hasTypeAlias) ratio += 8
  if (hasGenerics) ratio += 10
  if (hasNamedExport) ratio += 8
  if (hasDefaultParam) ratio += 8
  if (hasRightSized) ratio += 5
  if (hasProportioned) ratio += 5
  if (hasLean) ratio += 5
  if (hasElegant) ratio += 5
  if (hasOptimal) ratio += 5

  ratio = Math.min(100, Math.round(ratio))

  let proportion: GoldenMeasure['proportion'] = 'grotesque'
  if (ratio >= 85) proportion = 'golden-spiral'
  else if (ratio >= 70) proportion = 'proper-proportion'
  else if (ratio >= 55) proportion = 'well-sized'
  else if (ratio >= 40) proportion = 'adequate'
  else if (ratio >= 25) proportion = 'misproportioned'

  return {
    ratio, proportion,
    hasHighRatio: ratio >= 70,
    hasRightSized, hasProportioned, hasNoBloat: bloatCount === 0,
    hasLean, hasNoWaste: wasteCount === 0,
    hasElegant, hasNoExcess: bloatCount === 0 && wasteCount === 0,
    hasOptimal, hasNoOverkill: bloatCount === 0,
    hasBeautiful,
    bloatCount, wasteCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'philosopher-stone' */
export function classifyCondition(score: number): PhialCondition {
  if (score >= 85) return 'philosopher-stone'
  if (score >= 70) return 'pure-gold'
  if (score >= 55) return 'silver-phial'
  if (score >= 40) return 'base-metal'
  if (score >= 25) return 'lead-weight'
  return 'slag-heap'
}

/** @example classifyWorkshopType(phials) returns workshop classification */
export function classifyWorkshopType(phials: AlchemicalPhial[]): WorkshopType {
  if (phials.length === 0) return 'empty-room'
  const avgQs = phials.reduce((s, p) => s + p.qualityScore, 0) / phials.length
  const masterCount = phials.filter((p) => p.condition === 'philosopher-stone').length
  const ratio = masterCount / phials.length
  if (avgQs >= 75 && ratio >= 0.5) return 'grand-laboratory'
  if (avgQs >= 60) return 'master-alchemist'
  if (avgQs >= 45) return 'village-apothecary'
  if (avgQs >= 30) return 'backroom-still'
  if (avgQs >= 15) return 'hobby-shed'
  return 'empty-room'
}

/** @example classifyWorkshopCondition(avgQs) returns workshop condition */
export function classifyWorkshopCondition(avgQs: number): WorkshopCondition {
  if (avgQs >= 75) return 'golden-laboratory'
  if (avgQs >= 60) return 'proper-workshop'
  if (avgQs >= 45) return 'decent-lab'
  if (avgQs >= 30) return 'messy-bench'
  if (avgQs >= 15) return 'ruined-lab'
  return 'abandoned'
}

/** @example classifyAlchemistGrade(80) returns 'grand-master-alchemist' */
export function classifyAlchemistGrade(avgPurity: number): AlchemistGrade {
  if (avgPurity >= 80) return 'grand-master-alchemist'
  if (avgPurity >= 65) return 'master-transmuter'
  if (avgPurity >= 50) return 'skilled-alchemist'
  if (avgPurity >= 35) return 'apprentice'
  if (avgPurity >= 20) return 'novice'
  return 'charlatan'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeAlchemicalPhial(content, filePath) evaluates single file */
export function analyzeAlchemicalPhial(content: string, filePath: string): AlchemicalPhial {
  const transmutingMeasure = measureTransmuting(content)
  const phialMeasure = measurePhial(content)
  const distillingMeasure = measureDistilling(content)
  const balancingMeasure = measureBalancing(content)
  const philosophicMeasure = measurePhilosophic(content)
  const goldenMeasure = measureGolden(content)

  const qualityScore = Math.round(
    transmutingMeasure.purity * 0.2 +
    phialMeasure.quality * 0.15 +
    distillingMeasure.essence * 0.15 +
    balancingMeasure.elements * 0.15 +
    philosophicMeasure.wisdom * 0.15 +
    goldenMeasure.ratio * 0.2,
  )

  return {
    file: filePath,
    transmutationPurity: transmutingMeasure.purity,
    phialQuality: phialMeasure.quality,
    essenceDistillation: distillingMeasure.essence,
    elementalBalance: balancingMeasure.elements,
    philosopherQuality: philosophicMeasure.wisdom,
    goldenRatio: goldenMeasure.ratio,
    transmuting: transmutingMeasure,
    phial: phialMeasure,
    distilling: distillingMeasure,
    balancing: balancingMeasure,
    philosophic: philosophicMeasure,
    golden: goldenMeasure,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeAlchemyWorkshop(phials, dirPath) evaluates directory */
export function analyzeAlchemyWorkshop(phials: AlchemicalPhial[], dirPath: string): AlchemyWorkshop {
  if (phials.length === 0) {
    return {
      directory: dirPath, phials: [],
      avgPurity: 0, avgBalance: 0, avgGolden: 0,
      philosopherStoneCount: 0, slagHeapCount: 0, pureGoldCount: 0, silverPhialCount: 0,
      workshopType: 'empty-room', condition: 'abandoned',
    }
  }

  const avgPurity = Math.round(phials.reduce((s, p) => s + p.transmutationPurity, 0) / phials.length)
  const avgBalance = Math.round(phials.reduce((s, p) => s + p.elementalBalance, 0) / phials.length)
  const avgGolden = Math.round(phials.reduce((s, p) => s + p.goldenRatio, 0) / phials.length)
  const philosopherStoneCount = phials.filter((p) => p.condition === 'philosopher-stone').length
  const slagHeapCount = phials.filter((p) => p.condition === 'slag-heap').length
  const pureGoldCount = phials.filter((p) => p.condition === 'pure-gold').length
  const silverPhialCount = phials.filter((p) => p.condition === 'silver-phial').length
  const avgQs = phials.reduce((s, p) => s + p.qualityScore, 0) / phials.length

  return {
    directory: dirPath, phials,
    avgPurity, avgBalance, avgGolden,
    philosopherStoneCount, slagHeapCount, pureGoldCount, silverPhialCount,
    workshopType: classifyWorkshopType(phials),
    condition: classifyWorkshopCondition(avgQs),
  }
}

/** @example generateRecommendations(phials, workshops, guild, stats) generates advice */
export function generateRecommendations(
  phials: AlchemicalPhial[],
  workshops: AlchemyWorkshop[],
  guild: Guild,
  stats: AlchemyGlassStats,
): string[] {
  const recs: string[] = []

  if (stats.avgTransmutationPurity < 50) {
    recs.push('Purify transmutation with strict equality, type safety, and error handling')
  }
  if (stats.avgPhialQuality < 50) {
    recs.push('Improve phial quality with private fields, readonly, and proper encapsulation')
  }
  if (stats.avgEssenceDistillation < 50) {
    recs.push('Distill essence with focused exports, strong typing, and essential patterns')
  }
  if (stats.avgElementalBalance < 50) {
    recs.push('Balance elements with consistent imports/exports, interfaces, and harmonious design')
  }
  if (stats.avgPhilosopherQuality < 50) {
    recs.push('Deepen philosopher quality with async patterns, optional chaining, and proven practices')
  }
  if (stats.avgGoldenRatio < 50) {
    recs.push('Refine golden ratio with lean types, generics, and well-proportioned code')
  }
  if (stats.slagHeapCount > 0) {
    recs.push(`${String(stats.slagHeapCount)} file(s) are slag heaps — consider significant refactoring`)
  }
  if (guild.overallPurity < 40) {
    recs.push('Overall alchemical purity is low — focus on fundamentals of transmutation')
  }
  if (workshops.length > 0 && workshops.every((w) => w.workshopType === 'empty-room' || w.workshopType === 'hobby-shed')) {
    recs.push('All workshops are rudimentary — consider a major quality improvement effort')
  }

  const slagPhials = phials.filter((p) => p.condition === 'slag-heap')
  if (slagPhials.length > 0 && slagPhials.length <= 3) {
    const names = slagPhials.map((p) => p.file).join(', ')
    recs.push(`Rescue these slag heaps: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your alchemy is pure gold! Every phial is a philosopher\'s stone')
  }

  return Array.from(new Set(recs))
}

/** @example buildAlchemyGlassResult(files, contents, options) orchestrates analysis */
export function buildAlchemyGlassResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): AlchemyGlassResult {
  const phials = files.map((file, i) => analyzeAlchemicalPhial(contents[i] ?? '', file))

  const wMap = new Map<string, AlchemicalPhial[]>()
  for (const phial of phials) {
    const dir = phial.file.includes('/') ? phial.file.split('/').slice(0, -1).join('/') : '.'
    const existing = wMap.get(dir)
    if (existing) {
      existing.push(phial)
    } else {
      wMap.set(dir, [phial])
    }
  }

  const workshops = Array.from(wMap.entries()).map(([dir, dirPhials]) =>
    analyzeAlchemyWorkshop(dirPhials, dir),
  )

  const totalFiles = phials.length
  const avgTransmutationPurity = totalFiles > 0 ? Math.round(phials.reduce((s, p) => s + p.transmutationPurity, 0) / totalFiles) : 0
  const avgPhialQuality = totalFiles > 0 ? Math.round(phials.reduce((s, p) => s + p.phialQuality, 0) / totalFiles) : 0
  const avgEssenceDistillation = totalFiles > 0 ? Math.round(phials.reduce((s, p) => s + p.essenceDistillation, 0) / totalFiles) : 0
  const avgElementalBalance = totalFiles > 0 ? Math.round(phials.reduce((s, p) => s + p.elementalBalance, 0) / totalFiles) : 0
  const avgPhilosopherQuality = totalFiles > 0 ? Math.round(phials.reduce((s, p) => s + p.philosopherQuality, 0) / totalFiles) : 0
  const avgGoldenRatio = totalFiles > 0 ? Math.round(phials.reduce((s, p) => s + p.goldenRatio, 0) / totalFiles) : 0

  const overallPurity = totalFiles > 0
    ? Math.round((avgTransmutationPurity + avgElementalBalance + avgGoldenRatio) / 3)
    : 0

  const guild: Guild = {
    avgPurity: avgTransmutationPurity,
    avgBalance: avgElementalBalance,
    avgGolden: avgGoldenRatio,
    isGolden: avgTransmutationPurity >= 60,
    overallPurity,
  }

  const bestPhial = totalFiles > 0
    ? phials.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best), phials[0] as typeof phials[number]).file
    : ''
  const purest = totalFiles > 0
    ? phials.reduce((best, p) => (p.transmutationPurity > best.transmutationPurity ? p : best), phials[0] as typeof phials[number]).file
    : ''
  const bestContained = totalFiles > 0
    ? phials.reduce((best, p) => (p.phialQuality > best.phialQuality ? p : best), phials[0] as typeof phials[number]).file
    : ''
  const mostEssential = totalFiles > 0
    ? phials.reduce((best, p) => (p.essenceDistillation > best.essenceDistillation ? p : best), phials[0] as typeof phials[number]).file
    : ''
  const mostBalanced = totalFiles > 0
    ? phials.reduce((best, p) => (p.elementalBalance > best.elementalBalance ? p : best), phials[0] as typeof phials[number]).file
    : ''
  const wisest = totalFiles > 0
    ? phials.reduce((best, p) => (p.philosopherQuality > best.philosopherQuality ? p : best), phials[0] as typeof phials[number]).file
    : ''

  const stats: AlchemyGlassStats = {
    totalFiles,
    totalWorkshops: workshops.length,
    avgTransmutationPurity, avgPhialQuality, avgEssenceDistillation,
    avgElementalBalance, avgPhilosopherQuality, avgGoldenRatio,
    philosopherStoneCount: phials.filter((p) => p.condition === 'philosopher-stone').length,
    pureGoldCount: phials.filter((p) => p.condition === 'pure-gold').length,
    silverPhialCount: phials.filter((p) => p.condition === 'silver-phial').length,
    baseMetalCount: phials.filter((p) => p.condition === 'base-metal').length,
    leadWeightCount: phials.filter((p) => p.condition === 'lead-weight').length,
    slagHeapCount: phials.filter((p) => p.condition === 'slag-heap').length,
    hasHighPurityCount: phials.filter((p) => p.transmuting.hasHighPurity).length,
    hasHighQualityCount: phials.filter((p) => p.phial.hasHighQuality).length,
    hasHighEssenceCount: phials.filter((p) => p.distilling.hasHighEssence).length,
    hasHighElementsCount: phials.filter((p) => p.balancing.hasHighElements).length,
    hasHighWisdomCount: phials.filter((p) => p.philosophic.hasHighWisdom).length,
    hasHighRatioCount: phials.filter((p) => p.golden.hasHighRatio).length,
    overallPurity,
    alchemistGrade: classifyAlchemistGrade(overallPurity),
    bestPhial, purest, bestContained, mostEssential, mostBalanced, wisest,
  }

  const recommendations = generateRecommendations(phials, workshops, guild, stats)

  return { phials, workshops, guild, stats, recommendations }
}
