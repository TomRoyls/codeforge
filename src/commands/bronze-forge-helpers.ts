// ─── Types ─────────────────────────────────────────────────────────────────

export interface CraftedMeasure {
  quality: number
  skill: 'master-smith' | 'expert-craftsman' | 'skilled-artisan' | 'competent-worker' | 'apprentice' | 'clumsy'
  hasHighQuality: boolean
  hasWellMade: boolean
  hasRefined: boolean
  hasNoRoughness: boolean
  hasPolished: boolean
  hasNoSloppiness: boolean
  hasDetailed: boolean
  hasNoHasty: boolean
  hasCareful: boolean
  hasNoCareless: boolean
  roughnessCount: number
  sloppinessCount: number
}

export interface AlloyMeasure {
  strength: number
  composition: 'perfect-alloy' | 'strong-bronze' | 'proper-mix' | 'weak-alloy' | 'brittle-metal' | 'impure'
  hasHighStrength: boolean
  hasWellComposed: boolean
  hasBalanced: boolean
  hasNoImbalance: boolean
  hasHarmonious: boolean
  hasNoConflict: boolean
  hasProper: boolean
  hasNoMismatch: boolean
  hasCohesive: boolean
  hasNoFragmentation: boolean
  imbalanceCount: number
  conflictCount: number
}

export interface HeatMeasure {
  treatment: number
  rigor: 'triple-tempered' | 'properly-tempered' | 'well-heated' | 'partially-treated' | 'raw-casting' | 'unforged'
  hasHighTreatment: boolean
  hasWellTested: boolean
  hasThorough: boolean
  hasNoUncovered: boolean
  hasStressTested: boolean
  hasNoBrittle: boolean
  hasHardened: boolean
  hasNoSoft: boolean
  hasProven: boolean
  hasNoUntested: boolean
  uncoveredCount: number
  brittleCount: number
}

export interface PatinaMeasure {
  wisdom: number
  aging: 'graceful-patina' | 'well-aged' | 'proper-maturity' | 'showing-wear' | 'corroding' | 'degrading'
  hasHighWisdom: boolean
  hasMature: boolean
  hasProven: boolean
  hasNoBitrot: boolean
  hasStable: boolean
  hasNoDegradation: boolean
  hasEvolved: boolean
  hasNoStagnation: boolean
  hasRefined: boolean
  hasNoRegress: boolean
  bitrotCount: number
  stagnationCount: number
}

export interface CastingMeasure {
  quality: number
  mold: 'perfect-casting' | 'clean-cast' | 'proper-mold' | 'flash-burr' | 'misshapen' | 'failed-cast'
  hasHighQuality: boolean
  hasWellFormed: boolean
  hasClean: boolean
  hasNoFlash: boolean
  hasProper: boolean
  hasNoBurr: boolean
  hasComplete: boolean
  hasNoIncomplete: boolean
  hasSmooth: boolean
  hasNoRough: boolean
  flashCount: number
  burrCount: number
}

export interface DurableMeasure {
  legacy: number
  endurance: 'timeless-artifact' | 'durable-tool' | 'reliable-instrument' | 'serviceable' | 'wearing-out' | 'disposable'
  hasHighLegacy: boolean
  hasLasting: boolean
  hasReusable: boolean
  hasNoDisposable: boolean
  hasEnduring: boolean
  hasNoTemporary: boolean
  hasFoundational: boolean
  hasNoExpendable: boolean
  hasHeritage: boolean
  hasNoEphemeral: boolean
  disposableCount: number
  temporaryCount: number
}

export type ArtifactCondition = 'masterpiece' | 'fine-artifact' | 'quality-tool' | 'workhorse' | 'worn-tool' | 'scrap-bronze'

export interface BronzeArtifact {
  file: string
  craftsmanship: number
  alloyStrength: number
  heatTreatment: number
  patinaWisdom: number
  castingQuality: number
  durabilityLegacy: number
  crafted: CraftedMeasure
  alloy: AlloyMeasure
  heat: HeatMeasure
  patina: PatinaMeasure
  casting: CastingMeasure
  durable: DurableMeasure
  condition: ArtifactCondition
  qualityScore: number
}

export type WorkshopType = 'grand-forge' | 'master-workshop' | 'village-smithy' | 'backyard-foundry' | 'scrap-yard' | 'cold-ashes'
export type WorkshopCondition = 'legendary-forge' | 'productive-workshop' | 'working-foundry' | 'struggling-shop' | 'dying-forge' | 'extinguished'

export interface ForgeWorkshop {
  directory: string
  artifacts: BronzeArtifact[]
  avgCraftsmanship: number
  avgHeatTreatment: number
  avgDurabilityLegacy: number
  masterpieceCount: number
  scrapCount: number
  fineArtifactCount: number
  qualityToolCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

export interface Foundry {
  avgCraftsmanship: number
  avgHeatTreatment: number
  avgDurabilityLegacy: number
  isMasterwork: boolean
  overallCraftsmanship: number
}

export type SmithGrade = 'legendary-smith' | 'master-smith' | 'expert-forger' | 'skilled-craftsman' | 'apprentice' | 'scrap-dealer'

export interface BronzeForgeStats {
  totalFiles: number
  totalWorkshops: number
  avgCraftsmanship: number
  avgAlloyStrength: number
  avgHeatTreatment: number
  avgPatinaWisdom: number
  avgCastingQuality: number
  avgDurabilityLegacy: number
  masterpieceCount: number
  fineArtifactCount: number
  qualityToolCount: number
  workhorseCount: number
  wornToolCount: number
  scrapBronzeCount: number
  hasHighQualityCount: number
  hasHighStrengthCount: number
  hasHighTreatmentCount: number
  hasHighWisdomCount: number
  hasHighCastingCount: number
  hasHighLegacyCount: number
  overallCraftsmanship: number
  smithGrade: SmithGrade
  bestArtifact: string
  bestCrafted: string
  strongest: string
  bestTested: string
  wisest: string
  bestFormed: string
}

export interface BronzeForgeResult {
  artifacts: BronzeArtifact[]
  workshops: ForgeWorkshop[]
  foundry: Foundry
  stats: BronzeForgeStats
  recommendations: string[]
}

// ─── Measure Functions ─────────────────────────────────────────────────────

/** @example measureCrafted(content) evaluates code construction quality */
export function measureCrafted(content: string): CraftedMeasure {
  const hasConst = /\bconst\s+/.test(content)
  const hasReturnType = /\)\s*:\s*\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasOptionalChaining = /\?\.\w/.test(content)
  const hasNullishCoalescing = /\?\?/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)

  const roughnessMatches = content.match(/\bvar\s+/g)
  const roughnessCount = roughnessMatches ? roughnessMatches.length : 0
  const sloppinessMatches = content.match(/\bany\b/g)
  const sloppinessCount = sloppinessMatches ? sloppinessMatches.length : 0

  const hasWellMade = hasConst && hasTypeAnnotation
  const hasRefined = hasReturnType && hasReadonly
  const hasPolished = hasOptionalChaining && hasNullishCoalescing
  const hasDetailed = hasGenerics && hasInterface
  const hasCareful = hasPrivate && hasReadonly

  let quality = 0
  if (hasConst) quality += 10
  if (hasReturnType) quality += 10
  if (hasTypeAnnotation) quality += 10
  if (hasReadonly) quality += 8
  if (hasOptionalChaining) quality += 7
  if (hasNullishCoalescing) quality += 7
  if (hasGenerics) quality += 8
  if (hasInterface) quality += 8
  if (hasPrivate) quality += 7
  if (hasWellMade) quality += 5
  if (hasRefined) quality += 5
  if (hasPolished) quality += 5
  if (hasDetailed) quality += 5
  if (hasCareful) quality += 5

  quality = Math.min(100, Math.round(quality))

  let skill: CraftedMeasure['skill'] = 'clumsy'
  if (quality >= 85) skill = 'master-smith'
  else if (quality >= 70) skill = 'expert-craftsman'
  else if (quality >= 55) skill = 'skilled-artisan'
  else if (quality >= 40) skill = 'competent-worker'
  else if (quality >= 25) skill = 'apprentice'

  return {
    quality,
    skill,
    hasHighQuality: quality >= 70,
    hasWellMade,
    hasRefined,
    hasNoRoughness: roughnessCount === 0,
    hasPolished,
    hasNoSloppiness: sloppinessCount === 0,
    hasDetailed,
    hasNoHasty: roughnessCount === 0 && sloppinessCount === 0,
    hasCareful,
    hasNoCareless: roughnessCount === 0,
    roughnessCount,
    sloppinessCount,
  }
}

/** @example measureAlloy(content) evaluates code composition */
export function measureAlloy(content: string): AlloyMeasure {
  const hasImport = /import\s+/.test(content)
  const hasExport = /export\s/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasEnum = /\benum\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDefaultParam = /\w+\s*=\s*[^=]/.test(content)

  const imbalanceMatches = content.match(/\bvar\s+/g)
  const imbalanceCount = imbalanceMatches ? imbalanceMatches.length : 0
  const conflictMatches = content.match(/\bany\b/g)
  const conflictCount = conflictMatches ? conflictMatches.length : 0

  const hasWellComposed = hasImport && hasExport
  const hasBalanced = hasClass && hasInterface
  const hasHarmonious = hasTypeAlias && hasEnum
  const hasProper = hasGenerics && hasNamedExport
  const hasCohesive = hasImport && hasNamedExport

  let strength = 0
  if (hasImport) strength += 10
  if (hasExport) strength += 10
  if (hasClass) strength += 8
  if (hasInterface) strength += 10
  if (hasTypeAlias) strength += 7
  if (hasEnum) strength += 7
  if (hasGenerics) strength += 8
  if (hasNamedExport) strength += 8
  if (hasDefaultParam) strength += 5
  if (hasWellComposed) strength += 5
  if (hasBalanced) strength += 5
  if (hasHarmonious) strength += 5
  if (hasProper) strength += 5
  if (hasCohesive) strength += 7

  strength = Math.min(100, Math.round(strength))

  let composition: AlloyMeasure['composition'] = 'impure'
  if (strength >= 85) composition = 'perfect-alloy'
  else if (strength >= 70) composition = 'strong-bronze'
  else if (strength >= 55) composition = 'proper-mix'
  else if (strength >= 40) composition = 'weak-alloy'
  else if (strength >= 25) composition = 'brittle-metal'

  return {
    strength,
    composition,
    hasHighStrength: strength >= 70,
    hasWellComposed,
    hasBalanced,
    hasNoImbalance: imbalanceCount === 0,
    hasHarmonious,
    hasNoConflict: conflictCount === 0,
    hasProper,
    hasNoMismatch: imbalanceCount === 0 && conflictCount === 0,
    hasCohesive,
    hasNoFragmentation: imbalanceCount === 0,
    imbalanceCount,
    conflictCount,
  }
}

/** @example measureHeat(content) evaluates code testing rigor */
export function measureHeat(content: string): HeatMeasure {
  const hasTryCatch = /try\s*\{/.test(content) && /catch\s*\(/.test(content)
  const hasThrow = /\bthrow\s+/.test(content)
  const hasErrorType = /Error\b/.test(content)
  const hasFinally = /finally\s*\{/.test(content)
  const hasPromiseCatch = /\.catch\s*\(/.test(content)
  const hasNullCheck = /\?\.\w/.test(content) || /!==?\s*null/.test(content)
  const hasUndefinedCheck = /!==?\s*undefined/.test(content)
  const hasTypeofCheck = /typeof\s+\w+\s*[!=]==?\s*['"]/.test(content)
  const hasAssertFunction = /\bassert\w*\s*\(/.test(content)
  const hasResultType = /Result\b/.test(content) || /Either\b/.test(content)

  const uncoveredMatches = content.match(/\bany\b/g)
  const uncoveredCount = uncoveredMatches ? uncoveredMatches.length : 0
  const brittleMatches = content.match(/\bTODO\b|\bFIXME\b/g)
  const brittleCount = brittleMatches ? brittleMatches.length : 0

  const hasWellTested = hasTryCatch && hasThrow
  const hasThorough = hasNullCheck && hasUndefinedCheck
  const hasStressTested = hasFinally || hasPromiseCatch
  const hasHardened = hasTypeofCheck || hasAssertFunction
  const hasProven = hasErrorType || hasResultType

  let treatment = 0
  if (hasTryCatch) treatment += 12
  if (hasThrow) treatment += 10
  if (hasErrorType) treatment += 8
  if (hasFinally) treatment += 8
  if (hasPromiseCatch) treatment += 8
  if (hasNullCheck) treatment += 8
  if (hasUndefinedCheck) treatment += 7
  if (hasTypeofCheck) treatment += 7
  if (hasAssertFunction) treatment += 5
  if (hasResultType) treatment += 7
  if (hasWellTested) treatment += 5
  if (hasThorough) treatment += 5
  if (hasStressTested) treatment += 5
  if (hasHardened) treatment += 5

  treatment = Math.min(100, Math.round(treatment))

  let rigor: HeatMeasure['rigor'] = 'unforged'
  if (treatment >= 85) rigor = 'triple-tempered'
  else if (treatment >= 70) rigor = 'properly-tempered'
  else if (treatment >= 55) rigor = 'well-heated'
  else if (treatment >= 40) rigor = 'partially-treated'
  else if (treatment >= 25) rigor = 'raw-casting'

  return {
    treatment,
    rigor,
    hasHighTreatment: treatment >= 70,
    hasWellTested,
    hasThorough,
    hasNoUncovered: uncoveredCount === 0,
    hasStressTested,
    hasNoBrittle: brittleCount === 0,
    hasHardened,
    hasNoSoft: uncoveredCount === 0,
    hasProven,
    hasNoUntested: uncoveredCount === 0 && brittleCount === 0,
    uncoveredCount,
    brittleCount,
  }
}

/** @example measurePatina(content) evaluates code aging gracefully */
export function measurePatina(content: string): PatinaMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)
  const hasStrictEquality = /===/.test(content) || /!==/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)

  const bitrotMatches = content.match(/\bvar\s+/g)
  const bitrotCount = bitrotMatches ? bitrotMatches.length : 0
  const stagnationMatches = content.match(/\bTODO\b|\bFIXME\b|\bHACK\b/g)
  const stagnationCount = stagnationMatches ? stagnationMatches.length : 0

  const hasMature = hasExport && hasInterface
  const hasProven = hasClass && hasPrivate
  const hasStable = hasReadonly && hasTypeAnnotation
  const hasEvolved = hasGenerics && hasDocComments
  const hasRefined = hasStrictEquality && hasNamedExport

  let wisdom = 0
  if (hasExport) wisdom += 10
  if (hasInterface) wisdom += 10
  if (hasTypeAnnotation) wisdom += 8
  if (hasReadonly) wisdom += 8
  if (hasDocComments) wisdom += 10
  if (hasGenerics) wisdom += 8
  if (hasClass) wisdom += 7
  if (hasPrivate) wisdom += 7
  if (hasStrictEquality) wisdom += 7
  if (hasNamedExport) wisdom += 8
  if (hasMature) wisdom += 5
  if (hasProven) wisdom += 5
  if (hasStable) wisdom += 5
  if (hasEvolved) wisdom += 5
  if (hasRefined) wisdom += 5

  wisdom = Math.min(100, Math.round(wisdom))

  let aging: PatinaMeasure['aging'] = 'degrading'
  if (wisdom >= 85) aging = 'graceful-patina'
  else if (wisdom >= 70) aging = 'well-aged'
  else if (wisdom >= 55) aging = 'proper-maturity'
  else if (wisdom >= 40) aging = 'showing-wear'
  else if (wisdom >= 25) aging = 'corroding'

  return {
    wisdom,
    aging,
    hasHighWisdom: wisdom >= 70,
    hasMature,
    hasProven,
    hasNoBitrot: bitrotCount === 0,
    hasStable,
    hasNoDegradation: stagnationCount === 0,
    hasEvolved,
    hasNoStagnation: stagnationCount === 0,
    hasRefined,
    hasNoRegress: bitrotCount === 0 && stagnationCount === 0,
    bitrotCount,
    stagnationCount,
  }
}

/** @example measureCasting(content) evaluates code formation quality */
export function measureCasting(content: string): CastingMeasure {
  const hasExport = /export\s/.test(content)
  const hasImport = /import\s+/.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAnnotation = /:\s*(?:string|number|boolean|void)\b/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasStrictTypes = /:\s*(?:string|number|boolean|void|never)\b/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)

  const flashMatches = content.match(/\bconsole\.\w+\s*\(/g)
  const flashCount = flashMatches ? flashMatches.length : 0
  const burrMatches = content.match(/\bvar\s+/g)
  const burrCount = burrMatches ? burrMatches.length : 0

  const hasWellFormed = hasExport && hasImport
  const hasClean = hasNamedExport && hasDocComments
  const hasProper = hasClass && hasPrivate
  const hasComplete = hasInterface && hasTypeAnnotation
  const hasSmooth = hasGenerics && hasStrictTypes

  let quality = 0
  if (hasExport) quality += 10
  if (hasImport) quality += 8
  if (hasNamedExport) quality += 8
  if (hasDocComments) quality += 10
  if (hasClass) quality += 8
  if (hasInterface) quality += 10
  if (hasTypeAnnotation) quality += 8
  if (hasGenerics) quality += 8
  if (hasStrictTypes) quality += 7
  if (hasPrivate) quality += 5
  if (hasWellFormed) quality += 5
  if (hasClean) quality += 5
  if (hasProper) quality += 5
  if (hasComplete) quality += 5

  quality = Math.min(100, Math.round(quality))

  let mold: CastingMeasure['mold'] = 'failed-cast'
  if (quality >= 85) mold = 'perfect-casting'
  else if (quality >= 70) mold = 'clean-cast'
  else if (quality >= 55) mold = 'proper-mold'
  else if (quality >= 40) mold = 'flash-burr'
  else if (quality >= 25) mold = 'misshapen'

  return {
    quality,
    mold,
    hasHighQuality: quality >= 70,
    hasWellFormed,
    hasClean,
    hasNoFlash: flashCount === 0,
    hasProper,
    hasNoBurr: burrCount === 0,
    hasComplete,
    hasNoIncomplete: burrCount === 0,
    hasSmooth,
    hasNoRough: flashCount === 0,
    flashCount,
    burrCount,
  }
}

/** @example measureDurable(content) evaluates code lasting impact */
export function measureDurable(content: string): DurableMeasure {
  const hasExport = /export\s/.test(content)
  const hasInterface = /\binterface\s+\w+/.test(content)
  const hasTypeAlias = /\btype\s+\w+/.test(content)
  const hasGenerics = /<\w+>/.test(content)
  const hasReadonly = /\breadonly\b/.test(content)
  const hasDocComments = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNamedExport = /export\s+(?:function|class|interface|type|const|enum)/.test(content)
  const hasConst = /\bconst\s+/.test(content)
  const hasClass = /\bclass\s+\w+/.test(content)
  const hasPrivate = /\bprivate\s+/.test(content)

  const disposableMatches = content.match(/\bany\b/g)
  const disposableCount = disposableMatches ? disposableMatches.length : 0
  const temporaryMatches = content.match(/\bvar\s+/g)
  const temporaryCount = temporaryMatches ? temporaryMatches.length : 0

  const hasLasting = hasExport && hasNamedExport
  const hasReusable = hasInterface && hasGenerics
  const hasEnduring = hasReadonly && hasConst
  const hasFoundational = hasClass && hasPrivate
  const hasHeritage = hasDocComments && hasTypeAlias

  let legacy = 0
  if (hasExport) legacy += 10
  if (hasInterface) legacy += 10
  if (hasTypeAlias) legacy += 8
  if (hasGenerics) legacy += 10
  if (hasReadonly) legacy += 8
  if (hasDocComments) legacy += 8
  if (hasNamedExport) legacy += 8
  if (hasConst) legacy += 7
  if (hasClass) legacy += 7
  if (hasPrivate) legacy += 7
  if (hasLasting) legacy += 5
  if (hasReusable) legacy += 5
  if (hasEnduring) legacy += 5
  if (hasFoundational) legacy += 5
  if (hasHeritage) legacy += 5

  legacy = Math.min(100, Math.round(legacy))

  let endurance: DurableMeasure['endurance'] = 'disposable'
  if (legacy >= 85) endurance = 'timeless-artifact'
  else if (legacy >= 70) endurance = 'durable-tool'
  else if (legacy >= 55) endurance = 'reliable-instrument'
  else if (legacy >= 40) endurance = 'serviceable'
  else if (legacy >= 25) endurance = 'wearing-out'

  return {
    legacy,
    endurance,
    hasHighLegacy: legacy >= 70,
    hasLasting,
    hasReusable,
    hasNoDisposable: disposableCount === 0,
    hasEnduring,
    hasNoTemporary: temporaryCount === 0,
    hasFoundational,
    hasNoExpendable: disposableCount === 0 && temporaryCount === 0,
    hasHeritage,
    hasNoEphemeral: temporaryCount === 0,
    disposableCount,
    temporaryCount,
  }
}

// ─── Classification Functions ──────────────────────────────────────────────

/** @example classifyCondition(85) returns 'masterpiece' */
export function classifyCondition(score: number): ArtifactCondition {
  if (score >= 85) return 'masterpiece'
  if (score >= 70) return 'fine-artifact'
  if (score >= 55) return 'quality-tool'
  if (score >= 40) return 'workhorse'
  if (score >= 25) return 'worn-tool'
  return 'scrap-bronze'
}

/** @example classifyWorkshopType(artifacts) returns workshop classification */
export function classifyWorkshopType(artifacts: BronzeArtifact[]): WorkshopType {
  if (artifacts.length === 0) return 'cold-ashes'
  const avgQs = artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length
  const masterpieceCount = artifacts.filter((a) => a.condition === 'masterpiece').length
  const ratio = masterpieceCount / artifacts.length
  if (avgQs >= 75 && ratio >= 0.5) return 'grand-forge'
  if (avgQs >= 60) return 'master-workshop'
  if (avgQs >= 45) return 'village-smithy'
  if (avgQs >= 30) return 'backyard-foundry'
  if (avgQs >= 15) return 'scrap-yard'
  return 'cold-ashes'
}

/** @example classifyWorkshopCondition(avgQs) returns workshop condition */
export function classifyWorkshopCondition(avgQs: number): WorkshopCondition {
  if (avgQs >= 75) return 'legendary-forge'
  if (avgQs >= 60) return 'productive-workshop'
  if (avgQs >= 45) return 'working-foundry'
  if (avgQs >= 30) return 'struggling-shop'
  if (avgQs >= 15) return 'dying-forge'
  return 'extinguished'
}

/** @example classifySmithGrade(80) returns 'legendary-smith' */
export function classifySmithGrade(avgCraftsmanship: number): SmithGrade {
  if (avgCraftsmanship >= 80) return 'legendary-smith'
  if (avgCraftsmanship >= 65) return 'master-smith'
  if (avgCraftsmanship >= 50) return 'expert-forger'
  if (avgCraftsmanship >= 35) return 'skilled-craftsman'
  if (avgCraftsmanship >= 20) return 'apprentice'
  return 'scrap-dealer'
}

// ─── Orchestrator Functions ────────────────────────────────────────────────

/** @example analyzeBronzeArtifact(content, filePath) evaluates single file */
export function analyzeBronzeArtifact(content: string, filePath: string): BronzeArtifact {
  const crafted = measureCrafted(content)
  const alloy = measureAlloy(content)
  const heat = measureHeat(content)
  const patina = measurePatina(content)
  const casting = measureCasting(content)
  const durable = measureDurable(content)

  const qualityScore = Math.round(
    crafted.quality * 0.2 +
    alloy.strength * 0.15 +
    heat.treatment * 0.15 +
    patina.wisdom * 0.15 +
    casting.quality * 0.15 +
    durable.legacy * 0.2,
  )

  return {
    file: filePath,
    craftsmanship: crafted.quality,
    alloyStrength: alloy.strength,
    heatTreatment: heat.treatment,
    patinaWisdom: patina.wisdom,
    castingQuality: casting.quality,
    durabilityLegacy: durable.legacy,
    crafted,
    alloy,
    heat,
    patina,
    casting,
    durable,
    condition: classifyCondition(qualityScore),
    qualityScore,
  }
}

/** @example analyzeForgeWorkshop(artifacts, dirPath) evaluates directory */
export function analyzeForgeWorkshop(artifacts: BronzeArtifact[], dirPath: string): ForgeWorkshop {
  if (artifacts.length === 0) {
    return {
      directory: dirPath,
      artifacts: [],
      avgCraftsmanship: 0,
      avgHeatTreatment: 0,
      avgDurabilityLegacy: 0,
      masterpieceCount: 0,
      scrapCount: 0,
      fineArtifactCount: 0,
      qualityToolCount: 0,
      workshopType: 'cold-ashes',
      condition: 'extinguished',
    }
  }

  const avgCraftsmanship = Math.round(artifacts.reduce((s, a) => s + a.craftsmanship, 0) / artifacts.length)
  const avgHeatTreatment = Math.round(artifacts.reduce((s, a) => s + a.heatTreatment, 0) / artifacts.length)
  const avgDurabilityLegacy = Math.round(artifacts.reduce((s, a) => s + a.durabilityLegacy, 0) / artifacts.length)

  const masterpieceCount = artifacts.filter((a) => a.condition === 'masterpiece').length
  const scrapCount = artifacts.filter((a) => a.condition === 'scrap-bronze').length
  const fineArtifactCount = artifacts.filter((a) => a.condition === 'fine-artifact').length
  const qualityToolCount = artifacts.filter((a) => a.condition === 'quality-tool').length

  const avgQs = artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length

  return {
    directory: dirPath,
    artifacts,
    avgCraftsmanship,
    avgHeatTreatment,
    avgDurabilityLegacy,
    masterpieceCount,
    scrapCount,
    fineArtifactCount,
    qualityToolCount,
    workshopType: classifyWorkshopType(artifacts),
    condition: classifyWorkshopCondition(avgQs),
  }
}

/** @example generateRecommendations(artifacts, workshops, foundry, stats) generates advice */
export function generateRecommendations(
  artifacts: BronzeArtifact[],
  workshops: ForgeWorkshop[],
  foundry: Foundry,
  stats: BronzeForgeStats,
): string[] {
  const recs: string[] = []

  if (stats.avgCraftsmanship < 50) {
    recs.push('Improve craftsmanship with type annotations, const declarations, and careful construction')
  }
  if (stats.avgAlloyStrength < 50) {
    recs.push('Strengthen alloy composition with imports, exports, interfaces, and balanced module structure')
  }
  if (stats.avgHeatTreatment < 50) {
    recs.push('Apply more heat treatment with try/catch blocks, error handling, and null checks')
  }
  if (stats.avgPatinaWisdom < 50) {
    recs.push('Build patina wisdom with documentation, stable patterns, and mature code practices')
  }
  if (stats.avgCastingQuality < 50) {
    recs.push('Improve casting quality with proper exports, documentation, and clean code formation')
  }
  if (stats.avgDurabilityLegacy < 50) {
    recs.push('Enhance durability with reusable interfaces, generics, readonly properties, and foundational patterns')
  }
  if (stats.scrapBronzeCount > 0) {
    recs.push(`${String(stats.scrapBronzeCount)} file(s) are scrap bronze — consider significant refactoring`)
  }
  if (foundry.overallCraftsmanship < 40) {
    recs.push('Overall foundry craftsmanship is low — prioritize type safety and error handling')
  }
  if (workshops.length > 0 && workshops.every((w) => w.workshopType === 'cold-ashes' || w.workshopType === 'scrap-yard')) {
    recs.push('All workshops are cold or scrapy — consider a major quality improvement effort')
  }

  const scrapArtifacts = artifacts.filter((a) => a.condition === 'scrap-bronze')
  if (scrapArtifacts.length > 0 && scrapArtifacts.length <= 3) {
    const names = scrapArtifacts.map((a) => a.file).join(', ')
    recs.push(`Reforge these scrap files: ${names}`)
  }

  if (recs.length === 0) {
    recs.push('Your bronze artifacts are masterwork quality! Keep forging ahead')
  }

  return Array.from(new Set(recs))
}

/** @example buildBronzeForgeResult(files, contents, options) orchestrates analysis */
export function buildBronzeForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): BronzeForgeResult {
  const artifacts = files.map((file, i) => analyzeBronzeArtifact(contents[i] ?? '', file))

  const workshopMap = new Map<string, BronzeArtifact[]>()
  for (const artifact of artifacts) {
    const dir = artifact.file.includes('/') ? artifact.file.split('/').slice(0, -1).join('/') : '.'
    const existing = workshopMap.get(dir)
    if (existing) {
      existing.push(artifact)
    } else {
      workshopMap.set(dir, [artifact])
    }
  }

  const workshops = Array.from(workshopMap.entries()).map(([dir, dirArtifacts]) =>
    analyzeForgeWorkshop(dirArtifacts, dir),
  )

  const totalFiles = artifacts.length
  const avgCraftsmanship = totalFiles > 0 ? Math.round(artifacts.reduce((s, a) => s + a.craftsmanship, 0) / totalFiles) : 0
  const avgAlloyStrength = totalFiles > 0 ? Math.round(artifacts.reduce((s, a) => s + a.alloyStrength, 0) / totalFiles) : 0
  const avgHeatTreatment = totalFiles > 0 ? Math.round(artifacts.reduce((s, a) => s + a.heatTreatment, 0) / totalFiles) : 0
  const avgPatinaWisdom = totalFiles > 0 ? Math.round(artifacts.reduce((s, a) => s + a.patinaWisdom, 0) / totalFiles) : 0
  const avgCastingQuality = totalFiles > 0 ? Math.round(artifacts.reduce((s, a) => s + a.castingQuality, 0) / totalFiles) : 0
  const avgDurabilityLegacy = totalFiles > 0 ? Math.round(artifacts.reduce((s, a) => s + a.durabilityLegacy, 0) / totalFiles) : 0

  const overallCraftsmanship = totalFiles > 0
    ? Math.round((avgCraftsmanship + avgHeatTreatment + avgDurabilityLegacy) / 3)
    : 0

  const foundry: Foundry = {
    avgCraftsmanship,
    avgHeatTreatment,
    avgDurabilityLegacy,
    isMasterwork: avgCraftsmanship >= 60,
    overallCraftsmanship,
  }

  const masterpieceCount = artifacts.filter((a) => a.condition === 'masterpiece').length
  const fineArtifactCount = artifacts.filter((a) => a.condition === 'fine-artifact').length
  const qualityToolCount = artifacts.filter((a) => a.condition === 'quality-tool').length
  const workhorseCount = artifacts.filter((a) => a.condition === 'workhorse').length
  const wornToolCount = artifacts.filter((a) => a.condition === 'worn-tool').length
  const scrapBronzeCount = artifacts.filter((a) => a.condition === 'scrap-bronze').length

  const bestArtifact = totalFiles > 0
    ? artifacts.reduce((best, a) => (a.qualityScore > best.qualityScore ? a : best), artifacts[0]).file
    : ''
  const bestCrafted = totalFiles > 0
    ? artifacts.reduce((best, a) => (a.craftsmanship > best.craftsmanship ? a : best), artifacts[0]).file
    : ''
  const strongest = totalFiles > 0
    ? artifacts.reduce((best, a) => (a.alloyStrength > best.alloyStrength ? a : best), artifacts[0]).file
    : ''
  const bestTested = totalFiles > 0
    ? artifacts.reduce((best, a) => (a.heatTreatment > best.heatTreatment ? a : best), artifacts[0]).file
    : ''
  const wisest = totalFiles > 0
    ? artifacts.reduce((best, a) => (a.patinaWisdom > best.patinaWisdom ? a : best), artifacts[0]).file
    : ''
  const bestFormed = totalFiles > 0
    ? artifacts.reduce((best, a) => (a.castingQuality > best.castingQuality ? a : best), artifacts[0]).file
    : ''

  const stats: BronzeForgeStats = {
    totalFiles,
    totalWorkshops: workshops.length,
    avgCraftsmanship,
    avgAlloyStrength,
    avgHeatTreatment,
    avgPatinaWisdom,
    avgCastingQuality,
    avgDurabilityLegacy,
    masterpieceCount,
    fineArtifactCount,
    qualityToolCount,
    workhorseCount,
    wornToolCount,
    scrapBronzeCount,
    hasHighQualityCount: artifacts.filter((a) => a.crafted.hasHighQuality).length,
    hasHighStrengthCount: artifacts.filter((a) => a.alloy.hasHighStrength).length,
    hasHighTreatmentCount: artifacts.filter((a) => a.heat.hasHighTreatment).length,
    hasHighWisdomCount: artifacts.filter((a) => a.patina.hasHighWisdom).length,
    hasHighCastingCount: artifacts.filter((a) => a.casting.hasHighQuality).length,
    hasHighLegacyCount: artifacts.filter((a) => a.durable.hasHighLegacy).length,
    overallCraftsmanship,
    smithGrade: classifySmithGrade(overallCraftsmanship),
    bestArtifact,
    bestCrafted,
    strongest,
    bestTested,
    wisest,
    bestFormed,
  }

  const recommendations = generateRecommendations(artifacts, workshops, foundry, stats)

  return { artifacts, workshops, foundry, stats, recommendations }
}
