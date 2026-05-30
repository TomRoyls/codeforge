// ─── Interfaces ──────────────────────────────────────────

export interface AgingMeasure {
  patience: number
  maturity: 'centuries-old' | 'well-aged' | 'proper-seasoning' | 'young-impatient' | 'raw-material' | 'no-patience'
  hasHighPatience: boolean
  hasStable: boolean
  hasNoFragile: boolean
  hasMature: boolean
  hasNoExperimental: boolean
  hasProven: boolean
  hasNoVolatile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasRefined: boolean
  hasSeasoned: boolean
  hasEvolved: boolean
  hasWeathered: boolean
  hasEstablished: boolean
  fragileCount: number
  volatileCount: number
}

export interface CalculatingMeasure {
  precision: number
  angle: 'equatorial-precise' | 'horizontal-exact' | 'proper-angle' | 'rough-estimate' | 'broken-gnomon' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasCalculated: boolean
  hasComputed: boolean
  hasMeasured: boolean
  hasCalibrated: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasAstronomical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface WeatheringMeasure {
  resilience: number
  verdigris: 'noble-patina' | 'aged-beauty' | 'proper-weathering' | 'tarnished-metal' | 'raw-copper' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasProtected: boolean
  hasPreserved: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasFortified: boolean
  hasShielded: boolean
  hasImpervious: boolean
  unhandledCount: number
  vulnerableCount: number
}

export interface RevealingMeasure {
  clarity: number
  shadow: 'sharp-shadow' | 'clear-silhouette' | 'proper-outline' | 'blurred-edge' | 'no-shadow' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasSelfDocumenting: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasDirect: boolean
  hasObvious: boolean
  hasEvident: boolean
  hasVisible: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasUnambiguous: boolean
  crypticCount: number
  mysteryCount: number
}

export interface TimingMeasure {
  wisdom: number
  hour: 'master-horologist' | 'experienced-clockmaker' | 'proper-artisan' | 'apprentice-dial' | 'sundial-novice' | 'no-wisdom'
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
  hasTimeless: boolean
  hasWise: boolean
  hasPatient: boolean
  hackedCount: number
  shallowCount: number
}

export type CopperCondition =
  | 'copper-masterpiece'
  | 'verdigris-gem'
  | 'proper-sundial'
  | 'tarnished-dial'
  | 'rusty-metal'
  | 'void'

export interface CopperMark {
  file: string
  timePatience: number
  solarPrecision: number
  patinaResilience: number
  shadowClarity: number
  dialWisdom: number
  aging: AgingMeasure
  calculating: CalculatingMeasure
  weathering: WeatheringMeasure
  revealing: RevealingMeasure
  timing: TimingMeasure
  condition: CopperCondition
  qualityScore: number
}

export type GardenType =
  | 'formal-garden'
  | 'courtyard-sundial'
  | 'proper-dial'
  | 'small-marker'
  | 'empty-pedestal'
  | 'no-garden'

export type GardenCondition =
  | 'copper-palace'
  | 'verdigris-tower'
  | 'proper-garden'
  | 'stone-yard'
  | 'empty-lot'
  | 'void'

export type HorologistGrade = 'master-horologist' | 'expert-clockmaker' | 'proper-dial-maker' | 'apprentice' | 'novice' | 'time-blind'

export interface CopperGarden {
  directory: string
  marks: CopperMark[]
  avgPatience: number
  avgPrecision: number
  avgWisdom: number
  copperMasterpieceCount: number
  voidCount: number
  gardenType: GardenType
  condition: GardenCondition
}

export interface CopperSundialResult {
  marks: CopperMark[]
  gardens: CopperGarden[]
  meridian: {
    avgPatience: number
    avgPrecision: number
    avgWisdom: number
    isCopper: boolean
    overallTimelessness: number
  }
  stats: {
    totalFiles: number
    totalGardens: number
    avgTimePatience: number
    avgSolarPrecision: number
    avgPatinaResilience: number
    avgShadowClarity: number
    avgDialWisdom: number
    copperMasterpieceCount: number
    verdigrisGemCount: number
    properSundialCount: number
    tarnishedDialCount: number
    rustyMetalCount: number
    voidCount: number
    hasHighPatienceCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallTimelessness: number
    horologistGrade: HorologistGrade
    bestMark: string
    mostPatient: string
    mostPrecise: string
    mostResilient: string
    clearest: string
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

/** @example classifyCopperCondition(90) */
export function classifyCopperCondition(score: number): CopperCondition {
  if (score >= 90) return 'copper-masterpiece'
  if (score >= 75) return 'verdigris-gem'
  if (score >= 60) return 'proper-sundial'
  if (score >= 40) return 'tarnished-dial'
  if (score >= 20) return 'rusty-metal'
  return 'void'
}

/** @example classifyGardenType(marks) */
export function classifyGardenType(marks: CopperMark[]): GardenType {
  if (marks.length === 0) return 'no-garden'
  const avg = marks.reduce((s, m) => s + m.qualityScore, 0) / marks.length
  if (avg >= 85) return 'formal-garden'
  if (avg >= 70) return 'courtyard-sundial'
  if (avg >= 55) return 'proper-dial'
  if (avg >= 35) return 'small-marker'
  return 'empty-pedestal'
}

/** @example classifyGardenCondition(85) */
export function classifyGardenCondition(score: number): GardenCondition {
  if (score >= 85) return 'copper-palace'
  if (score >= 70) return 'verdigris-tower'
  if (score >= 55) return 'proper-garden'
  if (score >= 35) return 'stone-yard'
  if (score >= 15) return 'empty-lot'
  return 'void'
}

/** @example classifyHorologistGrade(80) */
export function classifyHorologistGrade(avgTimelessness: number): HorologistGrade {
  if (avgTimelessness >= 80) return 'master-horologist'
  if (avgTimelessness >= 65) return 'expert-clockmaker'
  if (avgTimelessness >= 50) return 'proper-dial-maker'
  if (avgTimelessness >= 35) return 'apprentice'
  if (avgTimelessness >= 20) return 'novice'
  return 'time-blind'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureAging('export class X { readonly y: string }') */
export function measureAging(content: string): AgingMeasure {
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|flimsy)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasMature = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoExperimental = (content.match(/\b(experimental|bleeding|alpha|beta)\b/gi) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|transient|ephemeral)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const hasNoUntested = (content.match(/\b(untested|unverified|unchecked)\b/gi) ?? []).length === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRefined = !/\bany\b/.test(content)
  const hasSeasoned = /\b(import|export)\b/.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasWeathered = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasEstablished = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasStable, hasNoFragile, hasMature, hasNoExperimental, hasProven,
    hasNoVolatile, hasTested, hasNoUntested, hasDocumented, hasRefined,
    hasSeasoned, hasEvolved, hasWeathered, hasEstablished,
  ]

  const patience = computeScore(positiveBooleans)
  const hasHighPatience = patience >= 60

  let maturity: AgingMeasure['maturity'] = 'no-patience'
  if (patience >= 90) maturity = 'centuries-old'
  else if (patience >= 75) maturity = 'well-aged'
  else if (patience >= 60) maturity = 'proper-seasoning'
  else if (patience >= 40) maturity = 'young-impatient'
  else if (patience >= 20) maturity = 'raw-material'

  return {
    patience, maturity, hasHighPatience,
    hasStable, hasNoFragile, hasMature, hasNoExperimental, hasProven,
    hasNoVolatile, hasTested, hasNoUntested, hasDocumented, hasRefined,
    hasSeasoned, hasEvolved, hasWeathered, hasEstablished,
    fragileCount, volatileCount,
  }
}

/** @example measureCalculating('export class X { readonly y: string }') */
export function measureCalculating(content: string): CalculatingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|imprecise|loose|sloppy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(import|export)\b/.test(content)
  const hasCalculated = /\b(readonly|private|protected)\b/.test(content)
  const hasComputed = /\b(async|await|Promise)\b/.test(content)
  const hasMeasured = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCalibrated = /\b(function|=>|return)\b/.test(content)
  const hasSharp = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCrisp = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDefined = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasAstronomical = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasCalculated, hasComputed, hasMeasured, hasCalibrated,
    hasSharp, hasCrisp, hasDefined, hasAstronomical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let angle: CalculatingMeasure['angle'] = 'no-precision'
  if (precision >= 90) angle = 'equatorial-precise'
  else if (precision >= 75) angle = 'horizontal-exact'
  else if (precision >= 60) angle = 'proper-angle'
  else if (precision >= 40) angle = 'rough-estimate'
  else if (precision >= 20) angle = 'broken-gnomon'

  return {
    precision, angle, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasCalculated, hasComputed, hasMeasured, hasCalibrated,
    hasSharp, hasCrisp, hasDefined, hasAstronomical,
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
  const hasDurable = /\b(import|export)\b/.test(content)
  const hasEnduring = !/\bany\b/.test(content)
  const hasLasting = /\b(readonly|private|protected)\b/.test(content)
  const hasProtected = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPreserved = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHardened = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasReinforced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFortified = /\b(async|await|Promise)\b/.test(content)
  const hasShielded = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const vulnerableCount = (content.match(/\b(vulnerable|exposed|weak|susceptible)\b/gi) ?? []).length
  const hasImpervious = vulnerableCount === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasDurable,
    hasEnduring, hasLasting, hasProtected, hasPreserved, hasHardened,
    hasReinforced, hasFortified, hasShielded, hasImpervious,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let verdigris: WeatheringMeasure['verdigris'] = 'no-resilience'
  if (resilience >= 90) verdigris = 'noble-patina'
  else if (resilience >= 75) verdigris = 'aged-beauty'
  else if (resilience >= 60) verdigris = 'proper-weathering'
  else if (resilience >= 40) verdigris = 'tarnished-metal'
  else if (resilience >= 20) verdigris = 'raw-copper'

  return {
    resilience, verdigris, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasDurable,
    hasEnduring, hasLasting, hasProtected, hasPreserved, hasHardened,
    hasReinforced, hasFortified, hasShielded, hasImpervious,
    unhandledCount, vulnerableCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(async|await|Promise)\b/.test(content)
  const hasObvious = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEvident = /\b(function|=>|return)\b/.test(content)
  const hasVisible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevealed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasExposed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnambiguous = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasSelfDocumenting,
    hasTransparent, hasUnderstandable, hasDirect, hasObvious, hasEvident,
    hasVisible, hasRevealed, hasExposed, hasUnambiguous,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let shadow: RevealingMeasure['shadow'] = 'no-clarity'
  if (clarity >= 90) shadow = 'sharp-shadow'
  else if (clarity >= 75) shadow = 'clear-silhouette'
  else if (clarity >= 60) shadow = 'proper-outline'
  else if (clarity >= 40) shadow = 'blurred-edge'
  else if (clarity >= 20) shadow = 'no-shadow'

  return {
    clarity, shadow, hasHighClarity,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasSelfDocumenting,
    hasTransparent, hasUnderstandable, hasDirect, hasObvious, hasEvident,
    hasVisible, hasRevealed, hasExposed, hasUnambiguous,
    crypticCount, mysteryCount,
  }
}

/** @example measureTiming('export class X { readonly y: string }') */
export function measureTiming(content: string): TimingMeasure {
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
  const hasTimeless = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPatient = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTimeless, hasWise, hasPatient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let hour: TimingMeasure['hour'] = 'no-wisdom'
  if (wisdom >= 90) hour = 'master-horologist'
  else if (wisdom >= 75) hour = 'experienced-clockmaker'
  else if (wisdom >= 60) hour = 'proper-artisan'
  else if (wisdom >= 40) hour = 'apprentice-dial'
  else if (wisdom >= 20) hour = 'sundial-novice'

  return {
    wisdom, hour, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTimeless, hasWise, hasPatient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCopperMark(content, 'app.ts') */
export function analyzeCopperMark(content: string, filePath: string): CopperMark {
  const aging = measureAging(content)
  const calculating = measureCalculating(content)
  const weathering = measureWeathering(content)
  const revealing = measureRevealing(content)
  const timing = measureTiming(content)

  const timePatience = aging.patience
  const solarPrecision = calculating.precision
  const patinaResilience = weathering.resilience
  const shadowClarity = revealing.clarity
  const dialWisdom = timing.wisdom

  const qualityScore = Math.round(
    timePatience * 0.2 +
    solarPrecision * 0.2 +
    patinaResilience * 0.2 +
    shadowClarity * 0.2 +
    dialWisdom * 0.2,
  )

  const condition = classifyCopperCondition(qualityScore)

  return {
    file: filePath,
    timePatience, solarPrecision, patinaResilience, shadowClarity, dialWisdom,
    aging, calculating, weathering, revealing, timing,
    condition, qualityScore,
  }
}

/** @example analyzeCopperGarden(marks, 'src') */
export function analyzeCopperGarden(marks: CopperMark[], dirPath: string): CopperGarden {
  if (marks.length === 0) {
    return {
      directory: dirPath, marks: [],
      avgPatience: 0, avgPrecision: 0, avgWisdom: 0,
      copperMasterpieceCount: 0, voidCount: 0,
      gardenType: 'no-garden', condition: 'void',
    }
  }

  const avgPatience = Math.round(marks.reduce((s, m) => s + m.timePatience, 0) / marks.length)
  const avgPrecision = Math.round(marks.reduce((s, m) => s + m.solarPrecision, 0) / marks.length)
  const avgWisdom = Math.round(marks.reduce((s, m) => s + m.dialWisdom, 0) / marks.length)
  const copperMasterpieceCount = marks.filter((m) => m.condition === 'copper-masterpiece').length
  const voidCount = marks.filter((m) => m.condition === 'void').length
  const gardenType = classifyGardenType(marks)
  const avgQuality = Math.round(marks.reduce((s, m) => s + m.qualityScore, 0) / marks.length)
  const condition = classifyGardenCondition(avgQuality)

  return {
    directory: dirPath, marks,
    avgPatience, avgPrecision, avgWisdom,
    copperMasterpieceCount, voidCount,
    gardenType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCopperSundialResult(['a.ts'], [content]) */
export async function buildCopperSundialResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperSundialResult> {
  const marks: CopperMark[] = files.map((file, i) =>
    analyzeCopperMark(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperMark[]>()
  for (const mark of marks) {
    const dir = mark.file.includes('/')
      ? mark.file.substring(0, mark.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(mark)
    } else {
      dirMap.set(dir, [mark])
    }
  }

  const gardens: CopperGarden[] = Array.from(dirMap.entries()).map(([dir, dirMarks]) =>
    analyzeCopperGarden(dirMarks, dir),
  )

  const avgTimePatience = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.timePatience, 0) / marks.length) : 0
  const avgSolarPrecision = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.solarPrecision, 0) / marks.length) : 0
  const avgPatinaResilience = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.patinaResilience, 0) / marks.length) : 0
  const avgShadowClarity = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.shadowClarity, 0) / marks.length) : 0
  const avgDialWisdom = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.dialWisdom, 0) / marks.length) : 0

  const overallTimelessness = marks.length > 0
    ? Math.round(marks.reduce((s, m) => s + m.qualityScore, 0) / marks.length) : 0
  const isCopper = overallTimelessness >= 60

  const meridian: CopperSundialResult['meridian'] = {
    avgPatience: avgTimePatience, avgPrecision: avgSolarPrecision, avgWisdom: avgDialWisdom,
    isCopper, overallTimelessness,
  }

  const copperMasterpieceCount = marks.filter((m) => m.condition === 'copper-masterpiece').length
  const verdigrisGemCount = marks.filter((m) => m.condition === 'verdigris-gem').length
  const properSundialCount = marks.filter((m) => m.condition === 'proper-sundial').length
  const tarnishedDialCount = marks.filter((m) => m.condition === 'tarnished-dial').length
  const rustyMetalCount = marks.filter((m) => m.condition === 'rusty-metal').length
  const voidCount = marks.filter((m) => m.condition === 'void').length

  const hasHighPatienceCount = marks.filter((m) => m.aging.hasHighPatience).length
  const hasHighPrecisionCount = marks.filter((m) => m.calculating.hasHighPrecision).length
  const hasHighResilienceCount = marks.filter((m) => m.weathering.hasHighResilience).length
  const hasHighClarityCount = marks.filter((m) => m.revealing.hasHighClarity).length
  const hasHighWisdomCount = marks.filter((m) => m.timing.hasHighWisdom).length

  const horologistGrade = classifyHorologistGrade(overallTimelessness)

  const bestMark = marks.length > 0
    ? marks.reduce((best, m) => (m.qualityScore > best.qualityScore ? m : best)).file : ''
  const mostPatient = marks.length > 0
    ? marks.reduce((best, m) => (m.timePatience > best.timePatience ? m : best)).file : ''
  const mostPrecise = marks.length > 0
    ? marks.reduce((best, m) => (m.solarPrecision > best.solarPrecision ? m : best)).file : ''
  const mostResilient = marks.length > 0
    ? marks.reduce((best, m) => (m.patinaResilience > best.patinaResilience ? m : best)).file : ''
  const clearest = marks.length > 0
    ? marks.reduce((best, m) => (m.shadowClarity > best.shadowClarity ? m : best)).file : ''
  const wisest = marks.length > 0
    ? marks.reduce((best, m) => (m.dialWisdom > best.dialWisdom ? m : best)).file : ''

  const stats: CopperSundialResult['stats'] = {
    totalFiles: files.length, totalGardens: gardens.length,
    avgTimePatience, avgSolarPrecision, avgPatinaResilience, avgShadowClarity, avgDialWisdom,
    copperMasterpieceCount, verdigrisGemCount, properSundialCount, tarnishedDialCount, rustyMetalCount, voidCount,
    hasHighPatienceCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighClarityCount, hasHighWisdomCount,
    overallTimelessness, horologistGrade,
    bestMark, mostPatient, mostPrecise, mostResilient, clearest, wisest,
  }

  const recommendations = generateRecommendations(marks, gardens, meridian, stats)

  return {
    marks, gardens, meridian, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(marks, gardens, meridian, stats) */
export function generateRecommendations(
  marks: CopperMark[],
  gardens: CopperGarden[],
  _meridian: CopperSundialResult['meridian'],
  stats: CopperSundialResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgTimePatience >= 90 &&
    stats.avgSolarPrecision >= 90 &&
    stats.avgPatinaResilience >= 90 &&
    stats.avgShadowClarity >= 90 &&
    stats.avgDialWisdom >= 90
  ) {
    recs.push(
      'Your copper sundial is a copper masterpiece! Time patience is centuries-old, solar precision is equatorial-precise, patina resilience is noble-patina, shadow clarity is sharp-shadow, and dial wisdom is master-horologist!',
    )
    return recs
  }

  if (stats.avgTimePatience < 60) {
    recs.push(
      'Cultivate time patience — the sundial must age with grace; eliminate fragile patterns, embrace proven practices, and achieve centuries-old patience',
    )
  }

  if (stats.avgSolarPrecision < 60) {
    recs.push(
      'Sharpen solar precision — the gnomon must cast an exact shadow; tighten types, eliminate unsafe patterns, and achieve equatorial-precise calculation',
    )
  }

  if (stats.avgPatinaResilience < 60) {
    recs.push(
      'Build patina resilience — the copper must weather centuries of storms; add error handling, protect against vulnerabilities, and achieve noble-patina resilience',
    )
  }

  if (stats.avgShadowClarity < 60) {
    recs.push(
      'Clarify shadow truth — the sundial must tell time without ambiguity; eliminate cryptic patterns, improve readability, and achieve sharp-shadow clarity',
    )
  }

  if (stats.avgDialWisdom < 60) {
    recs.push(
      'Deepen dial wisdom — the sundial must understand the passage of time; build with principled architecture, proven patterns, and master-horologist wisdom',
    )
  }

  if (stats.overallTimelessness < 40) {
    recs.push(
      'The sundial has lost its gnomon — rusty metal and tarnished dials outnumber the verdigris gems, and no time can be told',
    )
  }

  const voidMarks = marks.filter((m) => m.condition === 'void')
  if (voidMarks.length > 0 && voidMarks.length <= 5) {
    recs.push(`Remove these rusty metals from the garden: ${voidMarks.map((m) => m.file).join(', ')}`)
  } else if (voidMarks.length > 5) {
    recs.push(`Remove ${voidMarks.length} rusty metals from the garden before the corrosion spreads`)
  }

  const poorGardens = gardens.filter((g) => g.condition === 'void' || g.condition === 'empty-lot')
  if (poorGardens.length === gardens.length && gardens.length > 0) {
    recs.push('All gardens are empty lots — the copper sundial needs copper-palace quality marks throughout')
  }

  if (recs.length === 0) {
    recs.push('Your copper sundial gleams with verdigris brilliance — every mark carries time patience, solar precision, patina resilience, shadow clarity, and dial wisdom')
  }

  return recs
}
