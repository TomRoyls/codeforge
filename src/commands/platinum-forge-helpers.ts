// ─── Interfaces ──────────────────────────────────────────

export interface RefiningMeasure {
  purity: number
  grade: 'triple-nine' | 'double-nine' | 'proper-grade' | 'commercial-grade' | 'raw-ore' | 'no-purity'
  hasHighPurity: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasUnblemished: boolean
  hasPristine: boolean
  hasSpotless: boolean
  hasImmaculate: boolean
  hasPure: boolean
  hasUntarnished: boolean
  hasUncontaminated: boolean
  hasRefined: boolean
  hasSterling: boolean
  hackCount: number
  workaroundCount: number
}

export interface SmithingMeasure {
  mastery: number
  skill: 'master-smith' | 'journeyman' | 'proper-craftsman' | 'apprentice-hammer' | 'clumsy-hands' | 'no-mastery'
  hasHighMastery: boolean
  hasWellStructured: boolean
  hasNoSpaghetti: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasEfficient: boolean
  hasElegant: boolean
  hasCrafted: boolean
  hasHoned: boolean
  hasPerfected: boolean
  hasMastered: boolean
  hasExpert: boolean
  hasSkilled: boolean
  hasProficient: boolean
  hasAdept: boolean
  spaghettiCount: number
  monolithicCount: number
}

export interface ShapingMeasure {
  precision: number
  cut: 'surgical-precision' | 'fine-tooling' | 'proper-shaping' | 'rough-grinding' | 'blunt-force' | 'no-precision'
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
  hasFaithful: boolean
  hasUnambiguous: boolean
  hasCalibrated: boolean
  hasExacting: boolean
  unsafeCount: number
  approximateCount: number
}

export interface TemperingMeasure {
  resilience: number
  temper: 'unbreakable' | 'spring-steel' | 'proper-temper' | 'brittle-edge' | 'soft-metal' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasHardened: boolean
  hasStable: boolean
  hasTough: boolean
  hasDurable: boolean
  hasStrong: boolean
  hasResilient: boolean
  hasEnduring: boolean
  hasFortified: boolean
  hasReinforced: boolean
  unhandledCount: number
  untestedCount: number
}

export interface TestingMeasure {
  wisdom: number
  trial: 'fire-proven' | 'forge-tested' | 'proper-trial' | 'untested-metal' | 'raw-material' | 'no-wisdom'
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
  hasEvolved: boolean
  hasWise: boolean
  hasExperienced: boolean
  hackedCount: number
  shallowCount: number
}

export type IngotCondition =
  | 'platinum-masterpiece'
  | 'refined-ingot'
  | 'proper-metal'
  | 'base-alloy'
  | 'raw-ore'
  | 'void'

export interface PlatinumIngot {
  file: string
  noblePurity: number
  forgeMastery: number
  anvilPrecision: number
  hammerResilience: number
  crucibleWisdom: number
  refining: RefiningMeasure
  smithing: SmithingMeasure
  shaping: ShapingMeasure
  tempering: TemperingMeasure
  testing: TestingMeasure
  condition: IngotCondition
  qualityScore: number
}

export type FoundryType =
  | 'world-class'
  | 'industrial-grade'
  | 'proper-foundry'
  | 'backyard-forge'
  | 'cold-hearth'
  | 'no-foundry'

export type FoundryCondition =
  | 'platinum-palace'
  | 'grand-forge'
  | 'proper-workshop'
  | 'dusty-shed'
  | 'empty-lot'
  | 'void'

export interface PlatinumFoundry {
  directory: string
  ingots: PlatinumIngot[]
  avgPurity: number
  avgMastery: number
  avgWisdom: number
  platinumMasterpieceCount: number
  voidCount: number
  foundryType: FoundryType
  condition: FoundryCondition
}

export type SmithGrade = 'grand-master' | 'master-smith' | 'proper-forge-worker' | 'apprentice' | 'novice' | 'bellows-boy'

export interface PlatinumForgeResult {
  ingots: PlatinumIngot[]
  foundries: PlatinumFoundry[]
  furnace: {
    avgPurity: number
    avgMastery: number
    avgWisdom: number
    isPlatinum: boolean
    overallRefinement: number
  }
  stats: {
    totalFiles: number
    totalFoundries: number
    avgNoblePurity: number
    avgForgeMastery: number
    avgAnvilPrecision: number
    avgHammerResilience: number
    avgCrucibleWisdom: number
    platinumMasterpieceCount: number
    refinedIngotCount: number
    properMetalCount: number
    baseAlloyCount: number
    rawOreCount: number
    voidCount: number
    hasHighPurityCount: number
    hasHighMasteryCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallRefinement: number
    smithGrade: SmithGrade
    bestIngot: string
    purest: string
    mostMasterful: string
    mostPrecise: string
    toughest: string
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

/** @example classifyIngotCondition(90) */
export function classifyIngotCondition(score: number): IngotCondition {
  if (score >= 90) return 'platinum-masterpiece'
  if (score >= 75) return 'refined-ingot'
  if (score >= 60) return 'proper-metal'
  if (score >= 40) return 'base-alloy'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifyFoundryType(ingots) */
export function classifyFoundryType(ingots: PlatinumIngot[]): FoundryType {
  if (ingots.length === 0) return 'no-foundry'
  const avg = ingots.reduce((s, ing) => s + ing.qualityScore, 0) / ingots.length
  if (avg >= 85) return 'world-class'
  if (avg >= 70) return 'industrial-grade'
  if (avg >= 55) return 'proper-foundry'
  if (avg >= 35) return 'backyard-forge'
  return 'cold-hearth'
}

/** @example classifyFoundryCondition(85) */
export function classifyFoundryCondition(score: number): FoundryCondition {
  if (score >= 85) return 'platinum-palace'
  if (score >= 70) return 'grand-forge'
  if (score >= 55) return 'proper-workshop'
  if (score >= 35) return 'dusty-shed'
  if (score >= 15) return 'empty-lot'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgRefinement: number): SmithGrade {
  if (avgRefinement >= 80) return 'grand-master'
  if (avgRefinement >= 65) return 'master-smith'
  if (avgRefinement >= 50) return 'proper-forge-worker'
  if (avgRefinement >= 35) return 'apprentice'
  if (avgRefinement >= 20) return 'novice'
  return 'bellows-boy'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRefining('const x: string = "hello"') */
export function measureRefining(content: string): RefiningMeasure {
  const hackCount = (content.match(/\b(hack|kludge)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(todo|fixme|hack|xxx)\b/gi) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(console\.log|debugger|var\s)/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(debugger|console\.(log|debug|trace))\b/g) ?? []).length === 0
  const hasClean = !/\bany\b/.test(content)
  const hasUnblemished = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasPristine = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSpotless = /\b(import|export)\b/.test(content)
  const hasImmaculate = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPure = /\b(class|interface|type)\b/.test(content)
  const hasUntarnished = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasUncontaminated = /\b(readonly|private|protected)\b/.test(content)
  const hasRefined = /\b(const|readonly)\b/.test(content)
  const hasSterling = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasUnblemished, hasPristine, hasSpotless, hasImmaculate,
    hasPure, hasUntarnished, hasUncontaminated, hasRefined, hasSterling,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let grade: RefiningMeasure['grade'] = 'no-purity'
  if (purity >= 90) grade = 'triple-nine'
  else if (purity >= 75) grade = 'double-nine'
  else if (purity >= 60) grade = 'proper-grade'
  else if (purity >= 40) grade = 'commercial-grade'
  else if (purity >= 20) grade = 'raw-ore'

  return {
    purity, grade, hasHighPurity,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasUnblemished, hasPristine, hasSpotless, hasImmaculate,
    hasPure, hasUntarnished, hasUncontaminated, hasRefined, hasSterling,
    hackCount, workaroundCount,
  }
}

/** @example measureSmithing('export class X { readonly y: string }') */
export function measureSmithing(content: string): SmithingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|tangled|nested|callback)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasOrganized = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasCrafted = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHoned = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPerfected = !/\bany\b/.test(content)
  const hasMastered = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasExpert = /\b(function|=>|return)\b/.test(content)
  const hasSkilled = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProficient = /\b(try|catch|if)\b/.test(content)
  const hasAdept = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasOrganized,
    hasEfficient, hasElegant, hasCrafted, hasHoned, hasPerfected,
    hasMastered, hasExpert, hasSkilled, hasProficient, hasAdept,
  ]

  const mastery = computeScore(positiveBooleans)
  const hasHighMastery = mastery >= 60

  let skill: SmithingMeasure['skill'] = 'no-mastery'
  if (mastery >= 90) skill = 'master-smith'
  else if (mastery >= 75) skill = 'journeyman'
  else if (mastery >= 60) skill = 'proper-craftsman'
  else if (mastery >= 40) skill = 'apprentice-hammer'
  else if (mastery >= 20) skill = 'clumsy-hands'

  return {
    mastery, skill, hasHighMastery,
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasOrganized,
    hasEfficient, hasElegant, hasCrafted, hasHoned, hasPerfected,
    hasMastered, hasExpert, hasSkilled, hasProficient, hasAdept,
    spaghettiCount, monolithicCount,
  }
}

/** @example measureShaping('export class X { readonly y: string }') */
export function measureShaping(content: string): ShapingMeasure {
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
  const hasFaithful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUnambiguous = /\b(try|catch|if)\b/.test(content)
  const hasCalibrated = /\b(async|await|Promise)\b/.test(content)
  const hasExacting = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasFaithful, hasUnambiguous, hasCalibrated, hasExacting,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: ShapingMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'surgical-precision'
  else if (precision >= 75) cut = 'fine-tooling'
  else if (precision >= 60) cut = 'proper-shaping'
  else if (precision >= 40) cut = 'rough-grinding'
  else if (precision >= 20) cut = 'blunt-force'

  return {
    precision, cut, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasFaithful, hasUnambiguous, hasCalibrated, hasExacting,
    unsafeCount, approximateCount,
  }
}

/** @example measureTempering('try { } catch (e) { }') */
export function measureTempering(content: string): TemperingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|unchecked|risky)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /\b(if|===|!==)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasTough = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDurable = /\b(import|export)\b/.test(content)
  const hasStrong = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasResilient = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEnduring = !/\bany\b/.test(content)
  const hasFortified = /\b(class|interface|type)\b/.test(content)
  const hasReinforced = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasHardened, hasStable, hasTough, hasDurable,
    hasStrong, hasResilient, hasEnduring, hasFortified, hasReinforced,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let temper: TemperingMeasure['temper'] = 'no-resilience'
  if (resilience >= 90) temper = 'unbreakable'
  else if (resilience >= 75) temper = 'spring-steel'
  else if (resilience >= 60) temper = 'proper-temper'
  else if (resilience >= 40) temper = 'brittle-edge'
  else if (resilience >= 20) temper = 'soft-metal'

  return {
    resilience, temper, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasHardened, hasStable, hasTough, hasDurable,
    hasStrong, hasResilient, hasEnduring, hasFortified, hasReinforced,
    unhandledCount, untestedCount,
  }
}

/** @example measureTesting('export class X { readonly y: string }') */
export function measureTesting(content: string): TestingMeasure {
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
  const hasEvolved = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasExperienced = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasEvolved, hasWise, hasExperienced,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let trial: TestingMeasure['trial'] = 'no-wisdom'
  if (wisdom >= 90) trial = 'fire-proven'
  else if (wisdom >= 75) trial = 'forge-tested'
  else if (wisdom >= 60) trial = 'proper-trial'
  else if (wisdom >= 40) trial = 'untested-metal'
  else if (wisdom >= 20) trial = 'raw-material'

  return {
    wisdom, trial, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasEvolved, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzePlatinumIngot(content, 'app.ts') */
export function analyzePlatinumIngot(content: string, filePath: string): PlatinumIngot {
  const refining = measureRefining(content)
  const smithing = measureSmithing(content)
  const shaping = measureShaping(content)
  const tempering = measureTempering(content)
  const testing = measureTesting(content)

  const noblePurity = refining.purity
  const forgeMastery = smithing.mastery
  const anvilPrecision = shaping.precision
  const hammerResilience = tempering.resilience
  const crucibleWisdom = testing.wisdom

  const qualityScore = Math.round(
    noblePurity * 0.2 +
    forgeMastery * 0.2 +
    anvilPrecision * 0.2 +
    hammerResilience * 0.2 +
    crucibleWisdom * 0.2,
  )

  const condition = classifyIngotCondition(qualityScore)

  return {
    file: filePath,
    noblePurity, forgeMastery, anvilPrecision, hammerResilience, crucibleWisdom,
    refining, smithing, shaping, tempering, testing,
    condition, qualityScore,
  }
}

/** @example analyzePlatinumFoundry(ingots, 'src') */
export function analyzePlatinumFoundry(ingots: PlatinumIngot[], dirPath: string): PlatinumFoundry {
  if (ingots.length === 0) {
    return {
      directory: dirPath, ingots: [],
      avgPurity: 0, avgMastery: 0, avgWisdom: 0,
      platinumMasterpieceCount: 0, voidCount: 0,
      foundryType: 'no-foundry', condition: 'void',
    }
  }

  const avgPurity = Math.round(ingots.reduce((s, ing) => s + ing.noblePurity, 0) / ingots.length)
  const avgMastery = Math.round(ingots.reduce((s, ing) => s + ing.forgeMastery, 0) / ingots.length)
  const avgWisdom = Math.round(ingots.reduce((s, ing) => s + ing.crucibleWisdom, 0) / ingots.length)
  const platinumMasterpieceCount = ingots.filter((ing) => ing.condition === 'platinum-masterpiece').length
  const voidCount = ingots.filter((ing) => ing.condition === 'void').length
  const foundryType = classifyFoundryType(ingots)
  const avgQuality = Math.round(ingots.reduce((s, ing) => s + ing.qualityScore, 0) / ingots.length)
  const condition = classifyFoundryCondition(avgQuality)

  return {
    directory: dirPath, ingots,
    avgPurity, avgMastery, avgWisdom,
    platinumMasterpieceCount, voidCount,
    foundryType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildPlatinumForgeResult(['a.ts'], [content]) */
export async function buildPlatinumForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<PlatinumForgeResult> {
  const ingots: PlatinumIngot[] = files.map((file, i) =>
    analyzePlatinumIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, PlatinumIngot[]>()
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

  const foundries: PlatinumFoundry[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzePlatinumFoundry(dirIngots, dir),
  )

  const avgNoblePurity = ingots.length > 0
    ? Math.round(ingots.reduce((s, ing) => s + ing.noblePurity, 0) / ingots.length) : 0
  const avgForgeMastery = ingots.length > 0
    ? Math.round(ingots.reduce((s, ing) => s + ing.forgeMastery, 0) / ingots.length) : 0
  const avgAnvilPrecision = ingots.length > 0
    ? Math.round(ingots.reduce((s, ing) => s + ing.anvilPrecision, 0) / ingots.length) : 0
  const avgHammerResilience = ingots.length > 0
    ? Math.round(ingots.reduce((s, ing) => s + ing.hammerResilience, 0) / ingots.length) : 0
  const avgCrucibleWisdom = ingots.length > 0
    ? Math.round(ingots.reduce((s, ing) => s + ing.crucibleWisdom, 0) / ingots.length) : 0

  const overallRefinement = ingots.length > 0
    ? Math.round(ingots.reduce((s, ing) => s + ing.qualityScore, 0) / ingots.length) : 0
  const isPlatinum = overallRefinement >= 60

  const furnace: PlatinumForgeResult['furnace'] = {
    avgPurity: avgNoblePurity, avgMastery: avgForgeMastery, avgWisdom: avgCrucibleWisdom,
    isPlatinum, overallRefinement,
  }

  const platinumMasterpieceCount = ingots.filter((ing) => ing.condition === 'platinum-masterpiece').length
  const refinedIngotCount = ingots.filter((ing) => ing.condition === 'refined-ingot').length
  const properMetalCount = ingots.filter((ing) => ing.condition === 'proper-metal').length
  const baseAlloyCount = ingots.filter((ing) => ing.condition === 'base-alloy').length
  const rawOreCount = ingots.filter((ing) => ing.condition === 'raw-ore').length
  const voidCount = ingots.filter((ing) => ing.condition === 'void').length

  const hasHighPurityCount = ingots.filter((ing) => ing.refining.hasHighPurity).length
  const hasHighMasteryCount = ingots.filter((ing) => ing.smithing.hasHighMastery).length
  const hasHighPrecisionCount = ingots.filter((ing) => ing.shaping.hasHighPrecision).length
  const hasHighResilienceCount = ingots.filter((ing) => ing.tempering.hasHighResilience).length
  const hasHighWisdomCount = ingots.filter((ing) => ing.testing.hasHighWisdom).length

  const smithGrade = classifySmithGrade(overallRefinement)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, ing) => (ing.qualityScore > best.qualityScore ? ing : best)).file : ''
  const purest = ingots.length > 0
    ? ingots.reduce((best, ing) => (ing.noblePurity > best.noblePurity ? ing : best)).file : ''
  const mostMasterful = ingots.length > 0
    ? ingots.reduce((best, ing) => (ing.forgeMastery > best.forgeMastery ? ing : best)).file : ''
  const mostPrecise = ingots.length > 0
    ? ingots.reduce((best, ing) => (ing.anvilPrecision > best.anvilPrecision ? ing : best)).file : ''
  const toughest = ingots.length > 0
    ? ingots.reduce((best, ing) => (ing.hammerResilience > best.hammerResilience ? ing : best)).file : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, ing) => (ing.crucibleWisdom > best.crucibleWisdom ? ing : best)).file : ''

  const stats: PlatinumForgeResult['stats'] = {
    totalFiles: files.length, totalFoundries: foundries.length,
    avgNoblePurity, avgForgeMastery, avgAnvilPrecision, avgHammerResilience, avgCrucibleWisdom,
    platinumMasterpieceCount, refinedIngotCount, properMetalCount, baseAlloyCount, rawOreCount, voidCount,
    hasHighPurityCount, hasHighMasteryCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallRefinement, smithGrade,
    bestIngot, purest, mostMasterful, mostPrecise, toughest, wisest,
  }

  const recommendations = generateRecommendations(ingots, foundries, furnace, stats)

  return {
    ingots, foundries, furnace, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, foundries, furnace, stats) */
export function generateRecommendations(
  ingots: PlatinumIngot[],
  foundries: PlatinumFoundry[],
  _furnace: PlatinumForgeResult['furnace'],
  stats: PlatinumForgeResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgNoblePurity >= 90 &&
    stats.avgForgeMastery >= 90 &&
    stats.avgAnvilPrecision >= 90 &&
    stats.avgHammerResilience >= 90 &&
    stats.avgCrucibleWisdom >= 90
  ) {
    recs.push(
      'Your platinum forge achieves perfect refinement! The purity is triple-nine, the mastery legendary, the precision surgical, the resilience unbreakable, and the wisdom fire-proven!',
    )
    return recs
  }

  if (stats.avgNoblePurity < 60) {
    recs.push(
      'Refine noble purity — platinum must be the purest of metals; your code needs cleaner patterns, fewer hacks, and spotless logic'
    )
  }

  if (stats.avgForgeMastery < 60) {
    recs.push(
      'Improve forge mastery — the smith must be skilled to shape platinum; your code needs better structure, modular design, and expert craftsmanship'
    )
  }

  if (stats.avgAnvilPrecision < 60) {
    recs.push(
      'Sharpen anvil precision — every strike must be exact on the anvil; your code needs stricter types, cleaner definitions, and more precise logic'
    )
  }

  if (stats.avgHammerResilience < 60) {
    recs.push(
      'Temper hammer resilience — the metal must endure the hardest strikes; your code needs error handling, defensive patterns, and robust error recovery'
    )
  }

  if (stats.avgCrucibleWisdom < 60) {
    recs.push(
      'Deepen crucible wisdom — only fire-tested knowledge survives the crucible; your code needs principled architecture, proven patterns, and deep understanding'
    )
  }

  if (stats.overallRefinement < 40) {
    recs.push(
      'The forge has gone cold — base alloys and raw ore outnumber the refined platinum, and the foundry lies in ruins'
    )
  }

  const voidIngots = ingots.filter((ing) => ing.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(`Refine these raw ingots: ${voidIngots.map((ing) => ing.file).join(', ')}`)
  } else if (voidIngots.length > 5) {
    recs.push(`Refine ${voidIngots.length} raw ingots before the forge collapses`)
  }

  const poorFoundries = foundries.filter((f) => f.condition === 'void' || f.condition === 'empty-lot')
  if (poorFoundries.length === foundries.length && foundries.length > 0) {
    recs.push('All foundries are empty lots — the platinum forge needs complete reconstruction with world-class ingots')
  }

  if (recs.length === 0) {
    recs.push('Your platinum forge refines with legendary skill — every ingot embodies purity, mastery, precision, resilience, and crucible wisdom')
  }

  return recs
}
