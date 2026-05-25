// ─── Interfaces ──────────────────────────────────────────

export interface AlloyingMeasure {
  strength: number
  alloy: 'master-alloy' | 'phosphor-bronze' | 'proper-bronze' | 'brass-mix' | 'raw-copper' | 'no-alloy'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasRobust: boolean
  hasVersatile: boolean
  hasCombined: boolean
  hasSynergistic: boolean
  hasReinforced: boolean
  hasMultiStrand: boolean
  hasFortified: boolean
  chaoticCount: number
  untestedCount: number
}

export interface AgingMeasure {
  wisdom: number
  patina: 'ancient-verdigris' | 'aged-patina' | 'proper-aging' | 'tarnished' | 'corroded' | 'no-wisdom'
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasStable: boolean
  hasConsistent: boolean
  hasProven: boolean
  hasMature: boolean
  hasEvolved: boolean
  hasMaintained: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasEnduring: boolean
  hasReliable: boolean
  hasExperienced: boolean
  hasDeep: boolean
  hasAccumulated: boolean
  undocumentedCount: number
  volatileCount: number
}

export interface RevealingMeasure {
  clarity: number
  dawn: 'bronze-age-dawn' | 'clear-horizon' | 'proper-light' | 'gray-dawn' | 'dark-age' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasPurposeful: boolean
  hasIntentional: boolean
  hasDefined: boolean
  hasFocused: boolean
  hasClean: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface HammeringMeasure {
  precision: number
  hammer: 'master-smith' | 'expert-forge' | 'proper-hammer' | 'crude-mallet' | 'bare-hands' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasRefined: boolean
  hasCrafted: boolean
  hasShaped: boolean
  hasDisciplined: boolean
  hasDeliberate: boolean
  approximateCount: number
  roughCount: number
}

export interface ConductingMeasure {
  current: number
  flow: 'perfect-conductor' | 'strong-current' | 'proper-flow' | 'trickle' | 'static' | 'no-current'
  hasHighCurrent: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasReliable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasDependable: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasStable: boolean
  hasFlowing: boolean
  hasSmooth: boolean
  hasDirect: boolean
  hasUninterrupted: boolean
  hasSustained: boolean
  hasPerpetual: boolean
  wastefulCount: number
  volatileCount: number
}

export type IngotCondition =
  | 'bronze-masterpiece'
  | 'ageless-alloy'
  | 'proper-bronze'
  | 'tarnished-metal'
  | 'raw-ore'
  | 'void'

export interface BronzeIngot {
  file: string
  alloyStrength: number
  patinaWisdom: number
  dawnClarity: number
  forgePrecision: number
  durableCurrent: number
  alloying: AlloyingMeasure
  aging: AgingMeasure
  revealing: RevealingMeasure
  hammering: HammeringMeasure
  conducting: ConductingMeasure
  condition: IngotCondition
  qualityScore: number
}

export type WorkshopType =
  | 'grand-foundry'
  | 'bronze-workshop'
  | 'proper-forge'
  | 'backyard-anvil'
  | 'no-forge'
  | 'void'

export type WorkshopCondition =
  | 'master-smithy'
  | 'bronze-hall'
  | 'proper-workshop'
  | 'rusty-shed'
  | 'empty-lot'
  | 'void'

export interface BronzeWorkshop {
  directory: string
  ingots: BronzeIngot[]
  avgStrength: number
  avgPrecision: number
  avgWisdom: number
  bronzeMasterpieceCount: number
  voidCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

export interface BronzeAnvilResult {
  ingots: BronzeIngot[]
  workshops: BronzeWorkshop[]
  foundry: {
    avgStrength: number
    avgPrecision: number
    avgWisdom: number
    isBronze: boolean
    overallTemper: number
  }
  stats: {
    totalFiles: number
    totalWorkshops: number
    avgAlloyStrength: number
    avgPatinaWisdom: number
    avgDawnClarity: number
    avgForgePrecision: number
    avgDurableCurrent: number
    bronzeMasterpieceCount: number
    agelessAlloyCount: number
    properBronzeCount: number
    tarnishedMetalCount: number
    rawOreCount: number
    voidCount: number
    hasHighStrengthCount: number
    hasHighWisdomCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighCurrentCount: number
    overallTemper: number
    smithGrade: 'master-smith' | 'journeyman' | 'proper-forger' | 'apprentice' | 'novice' | 'bellows-boy'
    bestIngot: string
    strongest: string
    wisest: string
    clearest: string
    mostPrecise: string
    mostEnduring: string
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

/** @example classifyIngotCondition(90) */
export function classifyIngotCondition(score: number): IngotCondition {
  if (score >= 90) return 'bronze-masterpiece'
  if (score >= 75) return 'ageless-alloy'
  if (score >= 60) return 'proper-bronze'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifyWorkshopType(ingots) */
export function classifyWorkshopType(ingots: BronzeIngot[]): WorkshopType {
  if (ingots.length === 0) return 'no-forge'
  const avg =
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length
  if (avg >= 85) return 'grand-foundry'
  if (avg >= 70) return 'bronze-workshop'
  if (avg >= 55) return 'proper-forge'
  if (avg >= 35) return 'backyard-anvil'
  return 'void'
}

/** @example classifyWorkshopCondition(85) */
export function classifyWorkshopCondition(score: number): WorkshopCondition {
  if (score >= 85) return 'master-smithy'
  if (score >= 70) return 'bronze-hall'
  if (score >= 55) return 'proper-workshop'
  if (score >= 35) return 'rusty-shed'
  if (score >= 15) return 'empty-lot'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(
  avgTemper: number,
): BronzeAnvilResult['stats']['smithGrade'] {
  if (avgTemper >= 80) return 'master-smith'
  if (avgTemper >= 65) return 'journeyman'
  if (avgTemper >= 50) return 'proper-forger'
  if (avgTemper >= 35) return 'apprentice'
  if (avgTemper >= 20) return 'novice'
  return 'bellows-boy'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureAlloying('class X { readonly y: string }') */
export function measureAlloying(content: string): AlloyingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval|Function)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasVersatile = /\b(async|await|Promise)\b/.test(content)
  const hasCombined = /\b(readonly|private|protected)\b/.test(content)
  const hasSynergistic = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReinforced = /\b(readonly|as const)\b/.test(content)
  const hasMultiStrand = /\b(function|=>)\b/.test(content)
  const hasFortified = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasTypeSafe,
    hasNoUnsafe,
    hasTested,
    hasNoUntested,
    hasRobust,
    hasVersatile,
    hasCombined,
    hasSynergistic,
    hasReinforced,
    hasMultiStrand,
    hasFortified,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let alloy: AlloyingMeasure['alloy'] = 'no-alloy'
  if (strength >= 90) alloy = 'master-alloy'
  else if (strength >= 75) alloy = 'phosphor-bronze'
  else if (strength >= 60) alloy = 'proper-bronze'
  else if (strength >= 40) alloy = 'brass-mix'
  else if (strength >= 20) alloy = 'raw-copper'

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
    hasRobust,
    hasVersatile,
    hasCombined,
    hasSynergistic,
    hasReinforced,
    hasMultiStrand,
    hasFortified,
    chaoticCount,
    untestedCount,
  }
}

/** @example measureAging('export class X { readonly y: string }') */
export function measureAging(content: string): AgingMeasure {
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = 0
  const hasNoUndocumented = true
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasMature = !/\bany\b/.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasMaintained = /\b(import|export)\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /\b(class|interface|type)\b/.test(content)
  const hasEnduring = /\b(readonly|as const)\b/.test(content)
  const hasReliable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasExperienced = /\b(try|catch|if)\b/.test(content)
  const hasDeep = /\b(function|=>|return)\b/.test(content)
  const hasAccumulated = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length

  const positiveBooleans = [
    hasDocumented,
    hasNoUndocumented,
    hasStable,
    hasConsistent,
    hasProven,
    hasMature,
    hasEvolved,
    hasMaintained,
    hasRefined,
    hasPolished,
    hasEnduring,
    hasReliable,
    hasExperienced,
    hasDeep,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let patina: AgingMeasure['patina'] = 'no-wisdom'
  if (wisdom >= 90) patina = 'ancient-verdigris'
  else if (wisdom >= 75) patina = 'aged-patina'
  else if (wisdom >= 60) patina = 'proper-aging'
  else if (wisdom >= 40) patina = 'tarnished'
  else if (wisdom >= 20) patina = 'corroded'

  return {
    wisdom,
    patina,
    hasHighWisdom,
    hasDocumented,
    hasNoUndocumented,
    hasStable,
    hasConsistent,
    hasProven,
    hasMature,
    hasEvolved,
    hasMaintained,
    hasRefined,
    hasPolished,
    hasEnduring,
    hasReliable,
    hasExperienced,
    hasDeep,
    hasAccumulated,
    undocumentedCount,
    volatileCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = /\/\*\*[\s\S]*?\*\//.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasPurposeful = /\b(const|readonly)\b/.test(content)
  const hasIntentional = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDefined = /\b(try|catch|if)\b/.test(content)
  const hasFocused = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasClean = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasPurposeful,
    hasIntentional,
    hasDefined,
    hasFocused,
    hasClean,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let dawn: RevealingMeasure['dawn'] = 'no-clarity'
  if (clarity >= 90) dawn = 'bronze-age-dawn'
  else if (clarity >= 75) dawn = 'clear-horizon'
  else if (clarity >= 60) dawn = 'proper-light'
  else if (clarity >= 40) dawn = 'gray-dawn'
  else if (clarity >= 20) dawn = 'dark-age'

  return {
    clarity,
    dawn,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasPurposeful,
    hasIntentional,
    hasDefined,
    hasFocused,
    hasClean,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureHammering('const x: string = ""') */
export function measureHammering(content: string): HammeringMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\b(function|=>|return)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = !/\bany\b/.test(content)
  const hasRefined = /\b(const|readonly)\b/.test(content)
  const hasCrafted = /\b(try|catch|if)\b/.test(content)
  const hasShaped = /\b(async|await|Promise)\b/.test(content)
  const hasDisciplined = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDeliberate = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const roughCount = (content.match(/\b(var|eval)\b/g) ?? []).length

  const positiveBooleans = [
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasCorrect,
    hasFaithful,
    hasRefined,
    hasCrafted,
    hasShaped,
    hasDisciplined,
    hasDeliberate,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let hammer: HammeringMeasure['hammer'] = 'no-precision'
  if (precision >= 90) hammer = 'master-smith'
  else if (precision >= 75) hammer = 'expert-forge'
  else if (precision >= 60) hammer = 'proper-hammer'
  else if (precision >= 40) hammer = 'crude-mallet'
  else if (precision >= 20) hammer = 'bare-hands'

  return {
    precision,
    hammer,
    hasHighPrecision,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasSharp,
    hasCrisp,
    hasDefined,
    hasCorrect,
    hasFaithful,
    hasRefined,
    hasCrafted,
    hasShaped,
    hasDisciplined,
    hasDeliberate,
    approximateCount,
    roughCount,
  }
}

/** @example measureConducting('try { x } catch { y }') */
export function measureConducting(content: string): ConductingMeasure {
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const wastefulCount = (content.match(/\b(wasteful|inefficient|bloated)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasReliable = /\b(try|catch|if)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDependable = !/\bany\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasDurable = /\b(import|export)\b/.test(content)
  const hasStable = /\b(readonly|private|protected)\b/.test(content)
  const hasFlowing = /\b(function|=>)\b/.test(content)
  const hasSmooth = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDirect = /\b(return|throw)\b/.test(content)
  const hasUninterrupted = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSustained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPerpetual = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasEfficient,
    hasNoWasteful,
    hasReliable,
    hasNoVolatile,
    hasConsistent,
    hasDependable,
    hasEnduring,
    hasDurable,
    hasStable,
    hasFlowing,
    hasSmooth,
    hasDirect,
    hasUninterrupted,
    hasSustained,
    hasPerpetual,
  ]

  const current = computeScore(positiveBooleans)
  const hasHighCurrent = current >= 60

  let flow: ConductingMeasure['flow'] = 'no-current'
  if (current >= 90) flow = 'perfect-conductor'
  else if (current >= 75) flow = 'strong-current'
  else if (current >= 60) flow = 'proper-flow'
  else if (current >= 40) flow = 'trickle'
  else if (current >= 20) flow = 'static'

  return {
    current,
    flow,
    hasHighCurrent,
    hasEfficient,
    hasNoWasteful,
    hasReliable,
    hasNoVolatile,
    hasConsistent,
    hasDependable,
    hasEnduring,
    hasDurable,
    hasStable,
    hasFlowing,
    hasSmooth,
    hasDirect,
    hasUninterrupted,
    hasSustained,
    hasPerpetual,
    wastefulCount,
    volatileCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeBronzeIngot(content, 'app.ts') */
export function analyzeBronzeIngot(content: string, filePath: string): BronzeIngot {
  const alloying = measureAlloying(content)
  const aging = measureAging(content)
  const revealing = measureRevealing(content)
  const hammering = measureHammering(content)
  const conducting = measureConducting(content)

  const alloyStrength = alloying.strength
  const patinaWisdom = aging.wisdom
  const dawnClarity = revealing.clarity
  const forgePrecision = hammering.precision
  const durableCurrent = conducting.current

  const qualityScore = Math.round(
    alloyStrength * 0.2 +
    patinaWisdom * 0.2 +
    dawnClarity * 0.2 +
    forgePrecision * 0.2 +
    durableCurrent * 0.2,
  )

  const condition = classifyIngotCondition(qualityScore)

  return {
    file: filePath,
    alloyStrength,
    patinaWisdom,
    dawnClarity,
    forgePrecision,
    durableCurrent,
    alloying,
    aging,
    revealing,
    hammering,
    conducting,
    condition,
    qualityScore,
  }
}

/** @example analyzeBronzeWorkshop(ingots, 'src') */
export function analyzeBronzeWorkshop(ingots: BronzeIngot[], dirPath: string): BronzeWorkshop {
  if (ingots.length === 0) {
    return {
      directory: dirPath,
      ingots: [],
      avgStrength: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      bronzeMasterpieceCount: 0,
      voidCount: 0,
      workshopType: 'no-forge',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(
    ingots.reduce((s, i) => s + i.alloyStrength, 0) / ingots.length,
  )
  const avgPrecision = Math.round(
    ingots.reduce((s, i) => s + i.forgePrecision, 0) / ingots.length,
  )
  const avgWisdom = Math.round(
    ingots.reduce((s, i) => s + i.patinaWisdom, 0) / ingots.length,
  )

  const bronzeMasterpieceCount = ingots.filter(
    (i) => i.condition === 'bronze-masterpiece',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const workshopType = classifyWorkshopType(ingots)
  const avgQuality = Math.round(
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length,
  )
  const condition = classifyWorkshopCondition(avgQuality)

  return {
    directory: dirPath,
    ingots,
    avgStrength,
    avgPrecision,
    avgWisdom,
    bronzeMasterpieceCount,
    voidCount,
    workshopType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildBronzeAnvilResult(['a.ts'], [content]) */
export async function buildBronzeAnvilResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<BronzeAnvilResult> {
  const ingots: BronzeIngot[] = files.map((file, i) =>
    analyzeBronzeIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, BronzeIngot[]>()
  for (const ingot of ingots) {
    const dir = ingot.file.includes('/')
      ? ingot.file.substring(0, ingot.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ingot)
    } else {
      dirMap.set(dir, [ingot])
    }
  }

  const workshops: BronzeWorkshop[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeBronzeWorkshop(dirIngots, dir),
  )

  const avgAlloyStrength =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.alloyStrength, 0) / ingots.length)
      : 0
  const avgPatinaWisdom =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.patinaWisdom, 0) / ingots.length)
      : 0
  const avgDawnClarity =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.dawnClarity, 0) / ingots.length)
      : 0
  const avgForgePrecision =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.forgePrecision, 0) / ingots.length)
      : 0
  const avgDurableCurrent =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.durableCurrent, 0) / ingots.length)
      : 0

  const overallTemper =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)
      : 0
  const isBronze = overallTemper >= 60

  const foundry = {
    avgStrength: avgAlloyStrength,
    avgPrecision: avgForgePrecision,
    avgWisdom: avgPatinaWisdom,
    isBronze,
    overallTemper,
  }

  const bronzeMasterpieceCount = ingots.filter(
    (i) => i.condition === 'bronze-masterpiece',
  ).length
  const agelessAlloyCount = ingots.filter(
    (i) => i.condition === 'ageless-alloy',
  ).length
  const properBronzeCount = ingots.filter(
    (i) => i.condition === 'proper-bronze',
  ).length
  const tarnishedMetalCount = ingots.filter(
    (i) => i.condition === 'tarnished-metal',
  ).length
  const rawOreCount = ingots.filter(
    (i) => i.condition === 'raw-ore',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const hasHighStrengthCount = ingots.filter(
    (i) => i.alloying.hasHighStrength,
  ).length
  const hasHighWisdomCount = ingots.filter(
    (i) => i.aging.hasHighWisdom,
  ).length
  const hasHighClarityCount = ingots.filter(
    (i) => i.revealing.hasHighClarity,
  ).length
  const hasHighPrecisionCount = ingots.filter(
    (i) => i.hammering.hasHighPrecision,
  ).length
  const hasHighCurrentCount = ingots.filter(
    (i) => i.conducting.hasHighCurrent,
  ).length

  const smithGrade = classifySmithGrade(overallTemper)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => (i.qualityScore > best.qualityScore ? i : best)).file
    : ''
  const strongest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.alloyStrength > best.alloyStrength ? i : best)).file
    : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.patinaWisdom > best.patinaWisdom ? i : best)).file
    : ''
  const clearest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.dawnClarity > best.dawnClarity ? i : best)).file
    : ''
  const mostPrecise = ingots.length > 0
    ? ingots.reduce((best, i) => (i.forgePrecision > best.forgePrecision ? i : best)).file
    : ''
  const mostEnduring = ingots.length > 0
    ? ingots.reduce((best, i) => (i.durableCurrent > best.durableCurrent ? i : best)).file
    : ''

  const stats: BronzeAnvilResult['stats'] = {
    totalFiles: files.length,
    totalWorkshops: workshops.length,
    avgAlloyStrength,
    avgPatinaWisdom,
    avgDawnClarity,
    avgForgePrecision,
    avgDurableCurrent,
    bronzeMasterpieceCount,
    agelessAlloyCount,
    properBronzeCount,
    tarnishedMetalCount,
    rawOreCount,
    voidCount,
    hasHighStrengthCount,
    hasHighWisdomCount,
    hasHighClarityCount,
    hasHighPrecisionCount,
    hasHighCurrentCount,
    overallTemper,
    smithGrade,
    bestIngot,
    strongest,
    wisest,
    clearest,
    mostPrecise,
    mostEnduring,
  }

  const recommendations = generateRecommendations(ingots, workshops, foundry, stats)

  return { ingots, workshops, foundry, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, workshops, foundry, stats) */
export function generateRecommendations(
  ingots: BronzeIngot[],
  workshops: BronzeWorkshop[],
  foundry: BronzeAnvilResult['foundry'],
  stats: BronzeAnvilResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgAlloyStrength >= 90 &&
    stats.avgPatinaWisdom >= 90 &&
    stats.avgDawnClarity >= 90 &&
    stats.avgForgePrecision >= 90 &&
    stats.avgDurableCurrent >= 90
  ) {
    recs.push(
      'Your bronze anvil is a masterpiece of the forge! Every ingot combines alloy strength with the patina of ages, hammered with smith precision and conducting enduring current!',
    )
    return recs
  }

  if (stats.avgAlloyStrength < 60) {
    recs.push(
      'Strengthen the alloy — bronze is stronger than copper because it combines elements; your code must blend modularity, type safety, and testing into an unbreakable alloy',
    )
  }

  if (stats.avgPatinaWisdom < 60) {
    recs.push(
      'Deepen the patina wisdom — bronze gains beauty with age through its patina; your code should accumulate wisdom through documentation, stability, and proven patterns',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Bring dawn clarity — the Bronze Age dawned when humanity saw materials with new eyes; your code should reveal its purpose as clearly as sunrise over a foundry',
    )
  }

  if (stats.avgForgePrecision < 60) {
    recs.push(
      'Sharpen the forge precision — bronze tools required unprecedented craftsmanship; every type annotation and function signature should bear the mark of the master smith',
    )
  }

  if (stats.avgDurableCurrent < 60) {
    recs.push(
      'Build durable current — bronze conducts and endures simultaneously; your code should flow efficiently while standing the test of time through every storm',
    )
  }

  if (stats.overallTemper < 40) {
    recs.push(
      'The forge is cold — until the first bronze is cast, no tools can be shaped on the anvil',
    )
  }

  const voidIngots = ingots.filter((i) => i.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(
      `Recast these raw ores: ${voidIngots.map((i) => i.file).join(', ')}`,
    )
  } else if (voidIngots.length > 5) {
    recs.push(
      `Recast these ${voidIngots.length} raw ores before the entire foundry cools`,
    )
  }

  const poorWorkshops = workshops.filter(
    (w) => w.condition === 'void' || w.condition === 'empty-lot',
  )
  if (poorWorkshops.length === workshops.length && workshops.length > 0) {
    recs.push(
      'All workshops are empty lots — the bronze anvil needs a complete reconstruction from ore to ingot',
    )
  }

  if (recs.length === 0) {
    recs.push('Your bronze anvil rings with the clarity of a master smith — each ingot strong as alloy, wise as patina, clear as dawn, precise as forge, and enduring as durable current')
  }

  return recs
}
