// ─── Interfaces ──────────────────────────────────────────

export interface YieldingMeasure {
  abundance: number
  harvest: 'golden-bounty' | 'rich-yield' | 'proper-crop' | 'meager-picking' | 'barren-field' | 'no-abundance'
  hasHighAbundance: boolean
  hasProductive: boolean
  hasNoWasteful: boolean
  hasEfficient: boolean
  hasNoRedundant: boolean
  hasComprehensive: boolean
  hasNoIncomplete: boolean
  hasRich: boolean
  hasFull: boolean
  hasComplete: boolean
  hasAbundant: boolean
  hasPlentiful: boolean
  hasBountiful: boolean
  hasGenerous: boolean
  hasThriving: boolean
  wastefulCount: number
  redundantCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  light: 'golden-hour' | 'sunlit-clarity' | 'proper-glow' | 'cloudy-day' | 'overcast' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasObvious: boolean
  hasEvident: boolean
  hasManifest: boolean
  crypticCount: number
  mysteryCount: number
}

export interface CrystallizingMeasure {
  precision: number
  cut: 'faceted-gold' | 'proper-citrine' | 'good-crystal' | 'rough-stone' | 'raw-quartz' | 'no-precision'
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
  hasStructured: boolean
  hasOrdered: boolean
  hasSystematic: boolean
  hasMethodical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface WeatheringMeasure {
  resilience: number
  season: 'golden-autumn' | 'late-harvest' | 'proper-fall' | 'early-frost' | 'barren-winter' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasDurable: boolean
  hasAdaptive: boolean
  hasFlexible: boolean
  hasEnduring: boolean
  hasHardy: boolean
  hasResilient: boolean
  hasTough: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  sun: 'solar-sage' | 'harvest-master' | 'proper-farmer' | 'seasonal-learner' | 'seedling' | 'no-wisdom'
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
  hasProductive: boolean
  hasWise: boolean
  hasExperienced: boolean
  hackedCount: number
  shallowCount: number
}

export type CitrineCondition =
  | 'citrine-masterpiece'
  | 'golden-gem'
  | 'proper-citrine'
  | 'pale-yellow'
  | 'rough-quartz'
  | 'void'

export interface CitrineSheaf {
  file: string
  goldenAbundance: number
  sunlightClarity: number
  crystalPrecision: number
  autumnResilience: number
  solarWisdom: number
  yielding: YieldingMeasure
  illuminating: IlluminatingMeasure
  crystallizing: CrystallizingMeasure
  weathering: WeatheringMeasure
  understanding: UnderstandingMeasure
  condition: CitrineCondition
  qualityScore: number
}

export type FieldType =
  | 'golden-wheat-field'
  | 'sunlit-meadow'
  | 'proper-plot'
  | 'small-garden'
  | 'empty-ground'
  | 'no-field'

export type FieldCondition =
  | 'citrine-palace'
  | 'golden-barn'
  | 'proper-silo'
  | 'wooden-shed'
  | 'empty-lot'
  | 'void'

export type FarmerGrade = 'harvest-master' | 'golden-farmer' | 'proper-cultivator' | 'apprentice' | 'novice' | 'city-dweller'

export interface CitrineField {
  directory: string
  sheaves: CitrineSheaf[]
  avgAbundance: number
  avgPrecision: number
  avgWisdom: number
  citrineMasterpieceCount: number
  voidCount: number
  fieldType: FieldType
  condition: FieldCondition
}

export interface CitrineHarvestResult {
  sheaves: CitrineSheaf[]
  fields: CitrineField[]
  sun: {
    avgAbundance: number
    avgPrecision: number
    avgWisdom: number
    isCitrine: boolean
    overallYield: number
  }
  stats: {
    totalFiles: number
    totalFields: number
    avgGoldenAbundance: number
    avgSunlightClarity: number
    avgCrystalPrecision: number
    avgAutumnResilience: number
    avgSolarWisdom: number
    citrineMasterpieceCount: number
    goldenGemCount: number
    properCitrineCount: number
    paleYellowCount: number
    roughQuartzCount: number
    voidCount: number
    hasHighAbundanceCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallYield: number
    farmerGrade: FarmerGrade
    bestSheaf: string
    mostAbundant: string
    clearest: string
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

/** @example classifyCitrineCondition(90) */
export function classifyCitrineCondition(score: number): CitrineCondition {
  if (score >= 90) return 'citrine-masterpiece'
  if (score >= 75) return 'golden-gem'
  if (score >= 60) return 'proper-citrine'
  if (score >= 40) return 'pale-yellow'
  if (score >= 20) return 'rough-quartz'
  return 'void'
}

/** @example classifyFieldType(sheaves) */
export function classifyFieldType(sheaves: CitrineSheaf[]): FieldType {
  if (sheaves.length === 0) return 'no-field'
  const avg = sheaves.reduce((s, sh) => s + sh.qualityScore, 0) / sheaves.length
  if (avg >= 85) return 'golden-wheat-field'
  if (avg >= 70) return 'sunlit-meadow'
  if (avg >= 55) return 'proper-plot'
  if (avg >= 35) return 'small-garden'
  return 'empty-ground'
}

/** @example classifyFieldCondition(85) */
export function classifyFieldCondition(score: number): FieldCondition {
  if (score >= 85) return 'citrine-palace'
  if (score >= 70) return 'golden-barn'
  if (score >= 55) return 'proper-silo'
  if (score >= 35) return 'wooden-shed'
  if (score >= 15) return 'empty-lot'
  return 'void'
}

/** @example classifyFarmerGrade(80) */
export function classifyFarmerGrade(avgYield: number): FarmerGrade {
  if (avgYield >= 80) return 'harvest-master'
  if (avgYield >= 65) return 'golden-farmer'
  if (avgYield >= 50) return 'proper-cultivator'
  if (avgYield >= 35) return 'apprentice'
  if (avgYield >= 20) return 'novice'
  return 'city-dweller'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureYielding('export class X { readonly y: string }') */
export function measureYielding(content: string): YieldingMeasure {
  const hasProductive = /\b(class|interface|type)\b/.test(content)
  const wastefulCount = (content.match(/\b(wasteful|inefficient|bloated|heavy|slow)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasEfficient = /\b(async|await|Promise)\b/.test(content)
  const redundantCount = (content.match(/\b(redundant|duplicate|repeated|copied|duplicated)\b/gi) ?? []).length
  const hasNoRedundant = redundantCount === 0
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasNoIncomplete = !/\b(incomplete|partial|unfinished|todo|wip)\b/i.test(content)
  const hasRich = /\b(import|export)\b/.test(content)
  const hasFull = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasComplete = /\b(readonly|private|protected)\b/.test(content)
  const hasAbundant = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPlentiful = !/\bany\b/.test(content)
  const hasBountiful = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasGenerous = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasThriving = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasProductive, hasNoWasteful, hasEfficient, hasNoRedundant, hasComprehensive,
    hasNoIncomplete, hasRich, hasFull, hasComplete, hasAbundant,
    hasPlentiful, hasBountiful, hasGenerous, hasThriving,
  ]

  const abundance = computeScore(positiveBooleans)
  const hasHighAbundance = abundance >= 60

  let harvest: YieldingMeasure['harvest'] = 'no-abundance'
  if (abundance >= 90) harvest = 'golden-bounty'
  else if (abundance >= 75) harvest = 'rich-yield'
  else if (abundance >= 60) harvest = 'proper-crop'
  else if (abundance >= 40) harvest = 'meager-picking'
  else if (abundance >= 20) harvest = 'barren-field'

  return {
    abundance, harvest, hasHighAbundance,
    hasProductive, hasNoWasteful, hasEfficient, hasNoRedundant, hasComprehensive,
    hasNoIncomplete, hasRich, hasFull, hasComplete, hasAbundant,
    hasPlentiful, hasBountiful, hasGenerous, hasThriving,
    wastefulCount, redundantCount,
  }
}

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\b(async|await|Promise)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealed = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasObvious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEvident = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasManifest = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasObvious, hasEvident, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let light: IlluminatingMeasure['light'] = 'no-clarity'
  if (clarity >= 90) light = 'golden-hour'
  else if (clarity >= 75) light = 'sunlit-clarity'
  else if (clarity >= 60) light = 'proper-glow'
  else if (clarity >= 40) light = 'cloudy-day'
  else if (clarity >= 20) light = 'overcast'

  return {
    clarity, light, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasObvious, hasEvident, hasManifest,
    crypticCount, mysteryCount,
  }
}

/** @example measureCrystallizing('export class X { readonly y: string }') */
export function measureCrystallizing(content: string): CrystallizingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|imprecise|loose|sloppy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasStructured = /\b(async|await|Promise)\b/.test(content)
  const hasOrdered = /\b(try|catch|if)\b/.test(content)
  const hasSystematic = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasMethodical = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasStructured, hasOrdered, hasSystematic, hasMethodical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: CrystallizingMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'faceted-gold'
  else if (precision >= 75) cut = 'proper-citrine'
  else if (precision >= 60) cut = 'good-crystal'
  else if (precision >= 40) cut = 'rough-stone'
  else if (precision >= 20) cut = 'raw-quartz'

  return {
    precision, cut, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasStructured, hasOrdered, hasSystematic, hasMethodical,
    unsafeCount, approximateCount,
  }
}

/** @example measureWeathering('export class X { readonly y: string }') */
export function measureWeathering(content: string): WeatheringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(import|export)\b/.test(content)
  const hasDurable = !/\bany\b/.test(content)
  const hasAdaptive = /\b(readonly|private|protected)\b/.test(content)
  const hasFlexible = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHardy = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasResilient = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasTough = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasAdaptive, hasFlexible,
    hasEnduring, hasHardy, hasResilient, hasTough,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let season: WeatheringMeasure['season'] = 'no-resilience'
  if (resilience >= 90) season = 'golden-autumn'
  else if (resilience >= 75) season = 'late-harvest'
  else if (resilience >= 60) season = 'proper-fall'
  else if (resilience >= 40) season = 'early-frost'
  else if (resilience >= 20) season = 'barren-winter'

  return {
    resilience, season, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasDurable, hasAdaptive, hasFlexible,
    hasEnduring, hasHardy, hasResilient, hasTough,
    unhandledCount, untestedCount,
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
  const hasProductive = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasExperienced = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProductive, hasWise, hasExperienced,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let sun: UnderstandingMeasure['sun'] = 'no-wisdom'
  if (wisdom >= 90) sun = 'solar-sage'
  else if (wisdom >= 75) sun = 'harvest-master'
  else if (wisdom >= 60) sun = 'proper-farmer'
  else if (wisdom >= 40) sun = 'seasonal-learner'
  else if (wisdom >= 20) sun = 'seedling'

  return {
    wisdom, sun, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasProductive, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCitrineSheaf(content, 'app.ts') */
export function analyzeCitrineSheaf(content: string, filePath: string): CitrineSheaf {
  const yielding = measureYielding(content)
  const illuminating = measureIlluminating(content)
  const crystallizing = measureCrystallizing(content)
  const weathering = measureWeathering(content)
  const understanding = measureUnderstanding(content)

  const goldenAbundance = yielding.abundance
  const sunlightClarity = illuminating.clarity
  const crystalPrecision = crystallizing.precision
  const autumnResilience = weathering.resilience
  const solarWisdom = understanding.wisdom

  const qualityScore = Math.round(
    goldenAbundance * 0.2 +
    sunlightClarity * 0.2 +
    crystalPrecision * 0.2 +
    autumnResilience * 0.2 +
    solarWisdom * 0.2,
  )

  const condition = classifyCitrineCondition(qualityScore)

  return {
    file: filePath,
    goldenAbundance, sunlightClarity, crystalPrecision, autumnResilience, solarWisdom,
    yielding, illuminating, crystallizing, weathering, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeCitrineField(sheaves, 'src') */
export function analyzeCitrineField(sheaves: CitrineSheaf[], dirPath: string): CitrineField {
  if (sheaves.length === 0) {
    return {
      directory: dirPath, sheaves: [],
      avgAbundance: 0, avgPrecision: 0, avgWisdom: 0,
      citrineMasterpieceCount: 0, voidCount: 0,
      fieldType: 'no-field', condition: 'void',
    }
  }

  const avgAbundance = Math.round(sheaves.reduce((s, sh) => s + sh.goldenAbundance, 0) / sheaves.length)
  const avgPrecision = Math.round(sheaves.reduce((s, sh) => s + sh.crystalPrecision, 0) / sheaves.length)
  const avgWisdom = Math.round(sheaves.reduce((s, sh) => s + sh.solarWisdom, 0) / sheaves.length)
  const citrineMasterpieceCount = sheaves.filter((sh) => sh.condition === 'citrine-masterpiece').length
  const voidCount = sheaves.filter((sh) => sh.condition === 'void').length
  const fieldType = classifyFieldType(sheaves)
  const avgQuality = Math.round(sheaves.reduce((s, sh) => s + sh.qualityScore, 0) / sheaves.length)
  const condition = classifyFieldCondition(avgQuality)

  return {
    directory: dirPath, sheaves,
    avgAbundance, avgPrecision, avgWisdom,
    citrineMasterpieceCount, voidCount,
    fieldType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCitrineHarvestResult(['a.ts'], [content]) */
export async function buildCitrineHarvestResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CitrineHarvestResult> {
  const sheaves: CitrineSheaf[] = files.map((file, i) =>
    analyzeCitrineSheaf(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CitrineSheaf[]>()
  for (const sheaf of sheaves) {
    const dir = sheaf.file.includes('/')
      ? sheaf.file.substring(0, sheaf.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(sheaf)
    } else {
      dirMap.set(dir, [sheaf])
    }
  }

  const fields: CitrineField[] = Array.from(dirMap.entries()).map(([dir, dirSheaves]) =>
    analyzeCitrineField(dirSheaves, dir),
  )

  const avgGoldenAbundance = sheaves.length > 0
    ? Math.round(sheaves.reduce((s, sh) => s + sh.goldenAbundance, 0) / sheaves.length) : 0
  const avgSunlightClarity = sheaves.length > 0
    ? Math.round(sheaves.reduce((s, sh) => s + sh.sunlightClarity, 0) / sheaves.length) : 0
  const avgCrystalPrecision = sheaves.length > 0
    ? Math.round(sheaves.reduce((s, sh) => s + sh.crystalPrecision, 0) / sheaves.length) : 0
  const avgAutumnResilience = sheaves.length > 0
    ? Math.round(sheaves.reduce((s, sh) => s + sh.autumnResilience, 0) / sheaves.length) : 0
  const avgSolarWisdom = sheaves.length > 0
    ? Math.round(sheaves.reduce((s, sh) => s + sh.solarWisdom, 0) / sheaves.length) : 0

  const overallYield = sheaves.length > 0
    ? Math.round(sheaves.reduce((s, sh) => s + sh.qualityScore, 0) / sheaves.length) : 0
  const isCitrine = overallYield >= 60

  const sun: CitrineHarvestResult['sun'] = {
    avgAbundance: avgGoldenAbundance, avgPrecision: avgCrystalPrecision, avgWisdom: avgSolarWisdom,
    isCitrine, overallYield,
  }

  const citrineMasterpieceCount = sheaves.filter((sh) => sh.condition === 'citrine-masterpiece').length
  const goldenGemCount = sheaves.filter((sh) => sh.condition === 'golden-gem').length
  const properCitrineCount = sheaves.filter((sh) => sh.condition === 'proper-citrine').length
  const paleYellowCount = sheaves.filter((sh) => sh.condition === 'pale-yellow').length
  const roughQuartzCount = sheaves.filter((sh) => sh.condition === 'rough-quartz').length
  const voidCount = sheaves.filter((sh) => sh.condition === 'void').length

  const hasHighAbundanceCount = sheaves.filter((sh) => sh.yielding.hasHighAbundance).length
  const hasHighClarityCount = sheaves.filter((sh) => sh.illuminating.hasHighClarity).length
  const hasHighPrecisionCount = sheaves.filter((sh) => sh.crystallizing.hasHighPrecision).length
  const hasHighResilienceCount = sheaves.filter((sh) => sh.weathering.hasHighResilience).length
  const hasHighWisdomCount = sheaves.filter((sh) => sh.understanding.hasHighWisdom).length

  const farmerGrade = classifyFarmerGrade(overallYield)

  const bestSheaf = sheaves.length > 0
    ? sheaves.reduce((best, sh) => (sh.qualityScore > best.qualityScore ? sh : best)).file : ''
  const mostAbundant = sheaves.length > 0
    ? sheaves.reduce((best, sh) => (sh.goldenAbundance > best.goldenAbundance ? sh : best)).file : ''
  const clearest = sheaves.length > 0
    ? sheaves.reduce((best, sh) => (sh.sunlightClarity > best.sunlightClarity ? sh : best)).file : ''
  const mostPrecise = sheaves.length > 0
    ? sheaves.reduce((best, sh) => (sh.crystalPrecision > best.crystalPrecision ? sh : best)).file : ''
  const mostResilient = sheaves.length > 0
    ? sheaves.reduce((best, sh) => (sh.autumnResilience > best.autumnResilience ? sh : best)).file : ''
  const wisest = sheaves.length > 0
    ? sheaves.reduce((best, sh) => (sh.solarWisdom > best.solarWisdom ? sh : best)).file : ''

  const stats: CitrineHarvestResult['stats'] = {
    totalFiles: files.length, totalFields: fields.length,
    avgGoldenAbundance, avgSunlightClarity, avgCrystalPrecision, avgAutumnResilience, avgSolarWisdom,
    citrineMasterpieceCount, goldenGemCount, properCitrineCount, paleYellowCount, roughQuartzCount, voidCount,
    hasHighAbundanceCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallYield, farmerGrade,
    bestSheaf, mostAbundant, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(sheaves, fields, sun, stats)

  return {
    sheaves, fields, sun, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(sheaves, fields, sun, stats) */
export function generateRecommendations(
  sheaves: CitrineSheaf[],
  fields: CitrineField[],
  sun: CitrineHarvestResult['sun'],
  stats: CitrineHarvestResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGoldenAbundance >= 90 &&
    stats.avgSunlightClarity >= 90 &&
    stats.avgCrystalPrecision >= 90 &&
    stats.avgAutumnResilience >= 90 &&
    stats.avgSolarWisdom >= 90
  ) {
    recs.push(
      'Your citrine harvest is a citrine masterpiece! Golden abundance is golden-bounty, sunlight clarity is golden-hour, crystal precision is faceted-gold, autumn resilience is golden-autumn, and solar wisdom is solar-sage!',
    )
    return recs
  }

  if (stats.avgGoldenAbundance < 60) {
    recs.push(
      'Grow golden abundance — the harvest must achieve golden-bounty richness; improve productivity, eliminate waste, and achieve golden-bounty abundance',
    )
  }

  if (stats.avgSunlightClarity < 60) {
    recs.push(
      'Brighten sunlight clarity — the fields must achieve golden-hour transparency; improve readability, eliminate cryptic patterns, and achieve golden-hour clarity',
    )
  }

  if (stats.avgCrystalPrecision < 60) {
    recs.push(
      'Sharpen crystal precision — the citrine must be faceted-gold; tighten types, eliminate unsafe patterns, and achieve faceted-gold precision',
    )
  }

  if (stats.avgAutumnResilience < 60) {
    recs.push(
      'Strengthen autumn resilience — the harvest must endure golden-autumn conditions; add error handling, test thoroughly, and achieve golden-autumn resilience',
    )
  }

  if (stats.avgSolarWisdom < 60) {
    recs.push(
      'Deepen solar wisdom — the farmer must become solar-sage; build with principled architecture and achieve solar-sage wisdom',
    )
  }

  if (stats.overallYield < 40) {
    recs.push(
      'The harvest has failed — rough quartz and pale yellows outnumber the citrine masterpieces, and the fields lie barren',
    )
  }

  const voidSheaves = sheaves.filter((sh) => sh.condition === 'void')
  if (voidSheaves.length > 0 && voidSheaves.length <= 5) {
    recs.push(`Remove these rough quartz from the harvest: ${voidSheaves.map((sh) => sh.file).join(', ')}`)
  } else if (voidSheaves.length > 5) {
    recs.push(`Remove ${voidSheaves.length} rough quartz stones from the harvest before they spoil the yield`)
  }

  const poorFields = fields.filter((f) => f.condition === 'void' || f.condition === 'empty-lot')
  if (poorFields.length === fields.length && fields.length > 0) {
    recs.push('All fields are empty lots — the citrine harvest needs citrine-palace quality sheaves throughout')
  }

  if (recs.length === 0) {
    recs.push('Your citrine harvest glows with golden abundance — every sheaf carries golden richness, sunlight clarity, crystal precision, autumn resilience, and solar wisdom')
  }

  return recs
}
