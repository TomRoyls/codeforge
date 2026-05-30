// ─── Interfaces ──────────────────────────────────────────

export interface EnduringMeasure {
  endurance: number
  stone: 'almandine-grade' | 'pyrope-hard' | 'proper-garnet' | 'soft-mineral' | 'crumbling-rock' | 'no-endurance'
  hasHighEndurance: boolean
  hasStable: boolean
  hasNoFragile: boolean
  hasRobust: boolean
  hasNoVolatile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDurable: boolean
  hasLasting: boolean
  hasEnduring: boolean
  hasPermanent: boolean
  hasResilient: boolean
  hasHardy: boolean
  hasTough: boolean
  hasSteadfast: boolean
  hasPersistent: boolean
  fragileCount: number
  volatileCount: number
}

export interface TransformingMeasure {
  mastery: number
  flame: 'white-flame' | 'blue-fire' | 'proper-heat' | 'smoking-coals' | 'cold-ashes' | 'no-mastery'
  hasHighMastery: boolean
  hasWellStructured: boolean
  hasNoSpaghetti: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasRefactored: boolean
  hasNoDuplicated: boolean
  hasCrafted: boolean
  hasShaped: boolean
  hasPerfected: boolean
  hasMastered: boolean
  hasExpert: boolean
  hasSkilled: boolean
  hasProficient: boolean
  hasTransformed: boolean
  hasEvolved: boolean
  spaghettiCount: number
  monolithicCount: number
}

export interface FocusingMeasure {
  precision: number
  heat: 'surgical-flame' | 'focused-laser' | 'proper-heat' | 'scattered-sparks' | 'random-fire' | 'no-precision'
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
  hasTargeted: boolean
  hasFocused: boolean
  hasConcentrated: boolean
  hasPinpoint: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SurvivingMeasure {
  resilience: number
  shield: 'fireproof-vault' | 'heat-shield' | 'proper-insulation' | 'tin-foil' | 'paper-thin' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasHardened: boolean
  hasFortified: boolean
  hasShielded: boolean
  hasProtected: boolean
  hasGuarded: boolean
  hasArmored: boolean
  hasReinforced: boolean
  hasSecure: boolean
  hasImpervious: boolean
  hasUnbreachable: boolean
  unhandledCount: number
  vulnerableCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  craft: 'master-forge-smith' | 'veteran-smith' | 'proper-artisan' | 'apprentice' | 'raw-iron' | 'no-wisdom'
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
  hasTransformative: boolean
  hasWise: boolean
  hasExperienced: boolean
  hackedCount: number
  shallowCount: number
}

export type GarnetCondition =
  | 'garnet-masterpiece'
  | 'crimson-gem'
  | 'proper-garnet'
  | 'rough-stone'
  | 'raw-ore'
  | 'void'

export interface GarnetIngot {
  file: string
  crimsonEndurance: number
  flameMastery: number
  emberPrecision: number
  heatResilience: number
  forgeWisdom: number
  enduring: EnduringMeasure
  transforming: TransformingMeasure
  focusing: FocusingMeasure
  surviving: SurvivingMeasure
  understanding: UnderstandingMeasure
  condition: GarnetCondition
  qualityScore: number
}

export type CrucibleType =
  | 'grand-forge'
  | 'blast-furnace'
  | 'proper-crucible'
  | 'campfire'
  | 'cold-hearth'
  | 'no-crucible'

export type CrucibleCondition =
  | 'garnet-palace'
  | 'crimson-forge'
  | 'proper-foundry'
  | 'stone-kiln'
  | 'empty-hearth'
  | 'void'

export interface GarnetCrucible {
  directory: string
  ingots: GarnetIngot[]
  avgEndurance: number
  avgPrecision: number
  avgWisdom: number
  garnetMasterpieceCount: number
  voidCount: number
  crucibleType: CrucibleType
  condition: CrucibleCondition
}

export type SmithGrade = 'forge-master' | 'veteran-smith' | 'proper-forge-worker' | 'apprentice' | 'novice' | 'bellows-boy'

export interface GarnetForgeResult {
  ingots: GarnetIngot[]
  crucibles: GarnetCrucible[]
  furnace: {
    avgEndurance: number
    avgPrecision: number
    avgWisdom: number
    isGarnet: boolean
    overallTemper: number
  }
  stats: {
    totalFiles: number
    totalCrucibles: number
    avgCrimsonEndurance: number
    avgFlameMastery: number
    avgEmberPrecision: number
    avgHeatResilience: number
    avgForgeWisdom: number
    garnetMasterpieceCount: number
    crimsonGemCount: number
    properGarnetCount: number
    roughStoneCount: number
    rawOreCount: number
    voidCount: number
    hasHighEnduranceCount: number
    hasHighMasteryCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallTemper: number
    smithGrade: SmithGrade
    bestIngot: string
    mostEnduring: string
    mostMasterful: string
    mostPrecise: string
    mostResilient: string
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

/** @example classifyGarnetCondition(90) */
export function classifyGarnetCondition(score: number): GarnetCondition {
  if (score >= 90) return 'garnet-masterpiece'
  if (score >= 75) return 'crimson-gem'
  if (score >= 60) return 'proper-garnet'
  if (score >= 40) return 'rough-stone'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifyCrucibleType(ingots) */
export function classifyCrucibleType(ingots: GarnetIngot[]): CrucibleType {
  if (ingots.length === 0) return 'no-crucible'
  const avg = ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length
  if (avg >= 85) return 'grand-forge'
  if (avg >= 70) return 'blast-furnace'
  if (avg >= 55) return 'proper-crucible'
  if (avg >= 35) return 'campfire'
  return 'cold-hearth'
}

/** @example classifyCrucibleCondition(85) */
export function classifyCrucibleCondition(score: number): CrucibleCondition {
  if (score >= 85) return 'garnet-palace'
  if (score >= 70) return 'crimson-forge'
  if (score >= 55) return 'proper-foundry'
  if (score >= 35) return 'stone-kiln'
  if (score >= 15) return 'empty-hearth'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgTemper: number): SmithGrade {
  if (avgTemper >= 80) return 'forge-master'
  if (avgTemper >= 65) return 'veteran-smith'
  if (avgTemper >= 50) return 'proper-forge-worker'
  if (avgTemper >= 35) return 'apprentice'
  if (avgTemper >= 20) return 'novice'
  return 'bellows-boy'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureEnduring('export class X { readonly y: string }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|flimsy|delicate)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasRobust = /\b(import|export)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|erratic|temperamental)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const hasNoUntested = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length === 0
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasLasting = !/\bany\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasPermanent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasResilient = /\b(if|return)\b/.test(content)
  const hasHardy = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTough = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSteadfast = /\b(async|await|Promise)\b/.test(content)
  const hasPersistent = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasStable, hasNoFragile, hasRobust, hasNoVolatile, hasTested,
    hasNoUntested, hasDurable, hasLasting, hasEnduring, hasPermanent,
    hasResilient, hasHardy, hasTough, hasSteadfast, hasPersistent,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let stone: EnduringMeasure['stone'] = 'no-endurance'
  if (endurance >= 90) stone = 'almandine-grade'
  else if (endurance >= 75) stone = 'pyrope-hard'
  else if (endurance >= 60) stone = 'proper-garnet'
  else if (endurance >= 40) stone = 'soft-mineral'
  else if (endurance >= 20) stone = 'crumbling-rock'

  return {
    endurance, stone, hasHighEndurance,
    hasStable, hasNoFragile, hasRobust, hasNoVolatile, hasTested,
    hasNoUntested, hasDurable, hasLasting, hasEnduring, hasPermanent,
    hasResilient, hasHardy, hasTough, hasSteadfast, hasPersistent,
    fragileCount, volatileCount,
  }
}

/** @example measureTransforming('export class X { readonly y: string }') */
export function measureTransforming(content: string): TransformingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|tangled|knotted|muddled)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasRefactored = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoDuplicated = (content.match(/\b(duplicated|copy-paste|copied)\b/gi) ?? []).length === 0
  const hasCrafted = /\b(readonly|private|protected)\b/.test(content)
  const hasShaped = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPerfected = !/\bany\b/.test(content)
  const hasMastered = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasExpert = /\b(function|=>|return)\b/.test(content)
  const hasSkilled = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasProficient = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTransformed = /\b(try|catch)\b/.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasRefactored,
    hasNoDuplicated, hasCrafted, hasShaped, hasPerfected, hasMastered,
    hasExpert, hasSkilled, hasProficient, hasTransformed, hasEvolved,
  ]

  const mastery = computeScore(positiveBooleans)
  const hasHighMastery = mastery >= 60

  let flame: TransformingMeasure['flame'] = 'no-mastery'
  if (mastery >= 90) flame = 'white-flame'
  else if (mastery >= 75) flame = 'blue-fire'
  else if (mastery >= 60) flame = 'proper-heat'
  else if (mastery >= 40) flame = 'smoking-coals'
  else if (mastery >= 20) flame = 'cold-ashes'

  return {
    mastery, flame, hasHighMastery,
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasRefactored,
    hasNoDuplicated, hasCrafted, hasShaped, hasPerfected, hasMastered,
    hasExpert, hasSkilled, hasProficient, hasTransformed, hasEvolved,
    spaghettiCount, monolithicCount,
  }
}

/** @example measureFocusing('export class X { readonly y: string }') */
export function measureFocusing(content: string): FocusingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasTargeted = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFocused = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasConcentrated = /\b(try|catch|if)\b/.test(content)
  const hasPinpoint = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasTargeted, hasFocused, hasConcentrated, hasPinpoint,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let heat: FocusingMeasure['heat'] = 'no-precision'
  if (precision >= 90) heat = 'surgical-flame'
  else if (precision >= 75) heat = 'focused-laser'
  else if (precision >= 60) heat = 'proper-heat'
  else if (precision >= 40) heat = 'scattered-sparks'
  else if (precision >= 20) heat = 'random-fire'

  return {
    precision, heat, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasTargeted, hasFocused, hasConcentrated, hasPinpoint,
    unsafeCount, approximateCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasFortified = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasShielded = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasProtected = /\b(readonly|private|protected)\b/.test(content)
  const hasGuarded = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasArmored = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasReinforced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSecure = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasImpervious = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasUnbreachable = /\b(async|await|Promise)\b/.test(content)
  const vulnerableCount = (content.match(/\b(vulnerable|exposed|defenseless|unprotected)\b/gi) ?? []).length

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasHardened,
    hasFortified, hasShielded, hasProtected, hasGuarded, hasArmored,
    hasReinforced, hasSecure, hasImpervious, hasUnbreachable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shield: SurvivingMeasure['shield'] = 'no-resilience'
  if (resilience >= 90) shield = 'fireproof-vault'
  else if (resilience >= 75) shield = 'heat-shield'
  else if (resilience >= 60) shield = 'proper-insulation'
  else if (resilience >= 40) shield = 'tin-foil'
  else if (resilience >= 20) shield = 'paper-thin'

  return {
    resilience, shield, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasHardened,
    hasFortified, hasShielded, hasProtected, hasGuarded, hasArmored,
    hasReinforced, hasSecure, hasImpervious, hasUnbreachable,
    unhandledCount, vulnerableCount,
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
  const hasTransformative = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasExperienced = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTransformative, hasWise, hasExperienced,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let craft: UnderstandingMeasure['craft'] = 'no-wisdom'
  if (wisdom >= 90) craft = 'master-forge-smith'
  else if (wisdom >= 75) craft = 'veteran-smith'
  else if (wisdom >= 60) craft = 'proper-artisan'
  else if (wisdom >= 40) craft = 'apprentice'
  else if (wisdom >= 20) craft = 'raw-iron'

  return {
    wisdom, craft, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTransformative, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeGarnetIngot(content, 'app.ts') */
export function analyzeGarnetIngot(content: string, filePath: string): GarnetIngot {
  const enduring = measureEnduring(content)
  const transforming = measureTransforming(content)
  const focusing = measureFocusing(content)
  const surviving = measureSurviving(content)
  const understanding = measureUnderstanding(content)

  const crimsonEndurance = enduring.endurance
  const flameMastery = transforming.mastery
  const emberPrecision = focusing.precision
  const heatResilience = surviving.resilience
  const forgeWisdom = understanding.wisdom

  const qualityScore = Math.round(
    crimsonEndurance * 0.2 +
    flameMastery * 0.2 +
    emberPrecision * 0.2 +
    heatResilience * 0.2 +
    forgeWisdom * 0.2,
  )

  const condition = classifyGarnetCondition(qualityScore)

  return {
    file: filePath,
    crimsonEndurance, flameMastery, emberPrecision, heatResilience, forgeWisdom,
    enduring, transforming, focusing, surviving, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeGarnetCrucible(ingots, 'src') */
export function analyzeGarnetCrucible(ingots: GarnetIngot[], dirPath: string): GarnetCrucible {
  if (ingots.length === 0) {
    return {
      directory: dirPath, ingots: [],
      avgEndurance: 0, avgPrecision: 0, avgWisdom: 0,
      garnetMasterpieceCount: 0, voidCount: 0,
      crucibleType: 'no-crucible', condition: 'void',
    }
  }

  const avgEndurance = Math.round(ingots.reduce((s, i) => s + i.crimsonEndurance, 0) / ingots.length)
  const avgPrecision = Math.round(ingots.reduce((s, i) => s + i.emberPrecision, 0) / ingots.length)
  const avgWisdom = Math.round(ingots.reduce((s, i) => s + i.forgeWisdom, 0) / ingots.length)
  const garnetMasterpieceCount = ingots.filter((i) => i.condition === 'garnet-masterpiece').length
  const voidCount = ingots.filter((i) => i.condition === 'void').length
  const crucibleType = classifyCrucibleType(ingots)
  const avgQuality = Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)
  const condition = classifyCrucibleCondition(avgQuality)

  return {
    directory: dirPath, ingots,
    avgEndurance, avgPrecision, avgWisdom,
    garnetMasterpieceCount, voidCount,
    crucibleType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildGarnetForgeResult(['a.ts'], [content]) */
export async function buildGarnetForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GarnetForgeResult> {
  const ingots: GarnetIngot[] = files.map((file, i) =>
    analyzeGarnetIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, GarnetIngot[]>()
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

  const crucibles: GarnetCrucible[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeGarnetCrucible(dirIngots, dir),
  )

  const avgCrimsonEndurance = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.crimsonEndurance, 0) / ingots.length) : 0
  const avgFlameMastery = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.flameMastery, 0) / ingots.length) : 0
  const avgEmberPrecision = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.emberPrecision, 0) / ingots.length) : 0
  const avgHeatResilience = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.heatResilience, 0) / ingots.length) : 0
  const avgForgeWisdom = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.forgeWisdom, 0) / ingots.length) : 0

  const overallTemper = ingots.length > 0
    ? Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length) : 0
  const isGarnet = overallTemper >= 60

  const furnace: GarnetForgeResult['furnace'] = {
    avgEndurance: avgCrimsonEndurance, avgPrecision: avgEmberPrecision, avgWisdom: avgForgeWisdom,
    isGarnet, overallTemper,
  }

  const garnetMasterpieceCount = ingots.filter((i) => i.condition === 'garnet-masterpiece').length
  const crimsonGemCount = ingots.filter((i) => i.condition === 'crimson-gem').length
  const properGarnetCount = ingots.filter((i) => i.condition === 'proper-garnet').length
  const roughStoneCount = ingots.filter((i) => i.condition === 'rough-stone').length
  const rawOreCount = ingots.filter((i) => i.condition === 'raw-ore').length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const hasHighEnduranceCount = ingots.filter((i) => i.enduring.hasHighEndurance).length
  const hasHighMasteryCount = ingots.filter((i) => i.transforming.hasHighMastery).length
  const hasHighPrecisionCount = ingots.filter((i) => i.focusing.hasHighPrecision).length
  const hasHighResilienceCount = ingots.filter((i) => i.surviving.hasHighResilience).length
  const hasHighWisdomCount = ingots.filter((i) => i.understanding.hasHighWisdom).length

  const smithGrade = classifySmithGrade(overallTemper)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => (i.qualityScore > best.qualityScore ? i : best)).file : ''
  const mostEnduring = ingots.length > 0
    ? ingots.reduce((best, i) => (i.crimsonEndurance > best.crimsonEndurance ? i : best)).file : ''
  const mostMasterful = ingots.length > 0
    ? ingots.reduce((best, i) => (i.flameMastery > best.flameMastery ? i : best)).file : ''
  const mostPrecise = ingots.length > 0
    ? ingots.reduce((best, i) => (i.emberPrecision > best.emberPrecision ? i : best)).file : ''
  const mostResilient = ingots.length > 0
    ? ingots.reduce((best, i) => (i.heatResilience > best.heatResilience ? i : best)).file : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.forgeWisdom > best.forgeWisdom ? i : best)).file : ''

  const stats: GarnetForgeResult['stats'] = {
    totalFiles: files.length, totalCrucibles: crucibles.length,
    avgCrimsonEndurance, avgFlameMastery, avgEmberPrecision, avgHeatResilience, avgForgeWisdom,
    garnetMasterpieceCount, crimsonGemCount, properGarnetCount, roughStoneCount, rawOreCount, voidCount,
    hasHighEnduranceCount, hasHighMasteryCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallTemper, smithGrade,
    bestIngot, mostEnduring, mostMasterful, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(ingots, crucibles, furnace, stats)

  return {
    ingots, crucibles, furnace, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, crucibles, furnace, stats) */
export function generateRecommendations(
  ingots: GarnetIngot[],
  crucibles: GarnetCrucible[],
  _furnace: GarnetForgeResult['furnace'],
  stats: GarnetForgeResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrimsonEndurance >= 90 &&
    stats.avgFlameMastery >= 90 &&
    stats.avgEmberPrecision >= 90 &&
    stats.avgHeatResilience >= 90 &&
    stats.avgForgeWisdom >= 90
  ) {
    recs.push(
      'Your garnet forge burns with master precision! Crimson endurance is almandine-grade, flame mastery is white-flame, ember precision is surgical-flame, heat resilience is fireproof-vault, and forge wisdom is master-forge-smith!',
    )
    return recs
  }

  if (stats.avgCrimsonEndurance < 60) {
    recs.push(
      'Strengthen crimson endurance — the garnet must survive the fire; eliminate fragile patterns, test thoroughly, and build with lasting durability'
    )
  }

  if (stats.avgFlameMastery < 60) {
    recs.push(
      'Master the flame — the forge must transform, not destroy; refactor spaghetti code, eliminate monolithic patterns, and shape with expert craftsmanship'
    )
  }

  if (stats.avgEmberPrecision < 60) {
    recs.push(
      'Focus the ember — every spark must hit its mark; tighten types, eliminate unsafe patterns, and forge with surgical precision'
    )
  }

  if (stats.avgHeatResilience < 60) {
    recs.push(
      'Harden heat resilience — the forge must withstand its own fire; add error handling, shield against vulnerabilities, and build fireproof defenses'
    )
  }

  if (stats.avgForgeWisdom < 60) {
    recs.push(
      'Deepen forge wisdom — the smith must understand the metal; build with principled architecture, proven patterns, and transformative insight'
    )
  }

  if (stats.overallTemper < 40) {
    recs.push(
      'The forge is cold — raw ore and rough stone outnumber the garnets, and the crucible is empty'
    )
  }

  const voidIngots = ingots.filter((i) => i.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(`Return these raw ores to the forge: ${voidIngots.map((i) => i.file).join(', ')}`)
  } else if (voidIngots.length > 5) {
    recs.push(`Return ${voidIngots.length} raw ores to the forge before the fire dies completely`)
  }

  const poorCrucibles = crucibles.filter((c) => c.condition === 'void' || c.condition === 'empty-hearth')
  if (poorCrucibles.length === crucibles.length && crucibles.length > 0) {
    recs.push('All crucibles are empty hearths — the garnet forge needs garnet-palace quality ingots throughout')
  }

  if (recs.length === 0) {
    recs.push('Your garnet forge burns true — every ingot carries crimson endurance, flame mastery, ember precision, heat resilience, and forge wisdom')
  }

  return recs
}
