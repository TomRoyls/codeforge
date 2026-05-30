// ─── Interfaces ──────────────────────────────────────────

export interface DedicatingMeasure {
  devotion: number
  faith: 'unwavering-faith' | 'deep-devotion' | 'proper-commitment' | 'wavering-zeal' | 'indifference' | 'no-devotion'
  hasHighDevotion: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasPassionate: boolean
  hasNoApathetic: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasCommitted: boolean
  hasDedicated: boolean
  hasZealous: boolean
  hasFervent: boolean
  hasArdent: boolean
  hasEnthusiastic: boolean
  hasEarnest: boolean
  hasSincere: boolean
  deadCount: number
  apatheticCount: number
}

export interface ConsecratingMeasure {
  precision: number
  altar: 'golden-altar' | 'silver-shrine' | 'proper-altar' | 'wooden-table' | 'stone-block' | 'no-precision'
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
  hasSacred: boolean
  hasReverent: boolean
  hasHoly: boolean
  hasSanctified: boolean
  unsafeCount: number
  approximateCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  window: 'rose-window' | 'stained-glass' | 'proper-light' | 'cloudy-glass' | 'opaque-wall' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasBeautiful: boolean
  hasRevealing: boolean
  hasRadiant: boolean
  hasLuminous: boolean
  hasBrilliant: boolean
  hasGlowing: boolean
  hasShining: boolean
  crypticCount: number
  mysteryCount: number
}

export interface SurvivingMeasure {
  resilience: number
  shield: 'martyr-strength' | 'warrior-resilience' | 'proper-fortitude' | 'fragile-glass' | 'paper-thin' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTough: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasStrong: boolean
  hasUnyielding: boolean
  hasIndomitable: boolean
  hasResilient: boolean
  hasUnconquerable: boolean
  unhandledCount: number
  untestedCount: number
}

export interface GuidingMeasure {
  wisdom: number
  rank: 'cardinal-wisdom' | 'bishop-insight' | 'proper-counsel' | 'novice-thought' | 'foolish-whim' | 'no-wisdom'
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
  hasDiscerning: boolean
  hasWise: boolean
  hasSagacious: boolean
  hackedCount: number
  shallowCount: number
}

export type RubyCondition =
  | 'ruby-masterpiece'
  | 'crimson-altar'
  | 'proper-ruby'
  | 'pink-quartz'
  | 'red-glass'
  | 'void'

export interface RubyPrayer {
  file: string
  crimsonDevotion: number
  altarPrecision: number
  stainedClarity: number
  bloodResilience: number
  cardinalWisdom: number
  dedicating: DedicatingMeasure
  consecrating: ConsecratingMeasure
  illuminating: IlluminatingMeasure
  surviving: SurvivingMeasure
  guiding: GuidingMeasure
  condition: RubyCondition
  qualityScore: number
}

export type ParishType =
  | 'cardinal-parish'
  | 'ruby-diocese'
  | 'proper-parish'
  | 'small-chapel'
  | 'empty-aisle'
  | 'no-parish'

export type ParishCondition =
  | 'ruby-cathedral'
  | 'crimson-basilica'
  | 'proper-church'
  | 'stone-chapel'
  | 'wooden-hut'
  | 'void'

export type BishopGrade = 'archbishop' | 'cardinal' | 'proper-bishop' | 'priest' | 'deacon' | 'acolyte'

export interface RubyParish {
  directory: string
  prayers: RubyPrayer[]
  avgDevotion: number
  avgPrecision: number
  avgWisdom: number
  rubyMasterpieceCount: number
  voidCount: number
  parishType: ParishType
  condition: ParishCondition
}

export interface RubyCathedralResult {
  prayers: RubyPrayer[]
  parishes: RubyParish[]
  diocese: {
    avgDevotion: number
    avgPrecision: number
    avgWisdom: number
    isRuby: boolean
    overallSanctity: number
  }
  stats: {
    totalFiles: number
    totalParishes: number
    avgCrimsonDevotion: number
    avgAltarPrecision: number
    avgStainedClarity: number
    avgBloodResilience: number
    avgCardinalWisdom: number
    rubyMasterpieceCount: number
    crimsonAltarCount: number
    properRubyCount: number
    pinkQuartzCount: number
    redGlassCount: number
    voidCount: number
    hasHighDevotionCount: number
    hasHighPrecisionCount: number
    hasHighClarityCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallSanctity: number
    bishopGrade: BishopGrade
    bestPrayer: string
    mostDevoted: string
    mostPrecise: string
    clearest: string
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

/** @example classifyRubyCondition(90) */
export function classifyRubyCondition(score: number): RubyCondition {
  if (score >= 90) return 'ruby-masterpiece'
  if (score >= 75) return 'crimson-altar'
  if (score >= 60) return 'proper-ruby'
  if (score >= 40) return 'pink-quartz'
  if (score >= 20) return 'red-glass'
  return 'void'
}

/** @example classifyParishType(prayers) */
export function classifyParishType(prayers: RubyPrayer[]): ParishType {
  if (prayers.length === 0) return 'no-parish'
  const avg = prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length
  if (avg >= 85) return 'cardinal-parish'
  if (avg >= 70) return 'ruby-diocese'
  if (avg >= 55) return 'proper-parish'
  if (avg >= 35) return 'small-chapel'
  return 'empty-aisle'
}

/** @example classifyParishCondition(85) */
export function classifyParishCondition(score: number): ParishCondition {
  if (score >= 85) return 'ruby-cathedral'
  if (score >= 70) return 'crimson-basilica'
  if (score >= 55) return 'proper-church'
  if (score >= 35) return 'stone-chapel'
  if (score >= 15) return 'wooden-hut'
  return 'void'
}

/** @example classifyBishopGrade(80) */
export function classifyBishopGrade(avgSanctity: number): BishopGrade {
  if (avgSanctity >= 80) return 'archbishop'
  if (avgSanctity >= 65) return 'cardinal'
  if (avgSanctity >= 50) return 'proper-bishop'
  if (avgSanctity >= 35) return 'priest'
  if (avgSanctity >= 20) return 'deacon'
  return 'acolyte'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureDedicating('export class X { readonly y: string }') */
export function measureDedicating(content: string): DedicatingMeasure {
  const hasAlive = /\b(class|interface|type)\b/.test(content)
  const deadCount = (content.match(/\b(dead|lifeless|dormant|inert|stagnant)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasPassionate = /\b(import|export)\b/.test(content)
  const apatheticCount = (content.match(/\b(apathetic|indifferent|uncaring|listless|lukewarm)\b/gi) ?? []).length
  const hasNoApathetic = apatheticCount === 0
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = !/\bany\b/.test(content)
  const hasCommitted = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDedicated = /\b(readonly|private|protected)\b/.test(content)
  const hasZealous = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasFervent = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasArdent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEnthusiastic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEarnest = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSincere = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasAlive, hasNoDead, hasPassionate, hasNoApathetic, hasDynamic,
    hasNoStatic, hasCommitted, hasDedicated, hasZealous, hasFervent,
    hasArdent, hasEnthusiastic, hasEarnest, hasSincere,
  ]

  const devotion = computeScore(positiveBooleans)
  const hasHighDevotion = devotion >= 60

  let faith: DedicatingMeasure['faith'] = 'no-devotion'
  if (devotion >= 90) faith = 'unwavering-faith'
  else if (devotion >= 75) faith = 'deep-devotion'
  else if (devotion >= 60) faith = 'proper-commitment'
  else if (devotion >= 40) faith = 'wavering-zeal'
  else if (devotion >= 20) faith = 'indifference'

  return {
    devotion, faith, hasHighDevotion,
    hasAlive, hasNoDead, hasPassionate, hasNoApathetic, hasDynamic,
    hasNoStatic, hasCommitted, hasDedicated, hasZealous, hasFervent,
    hasArdent, hasEnthusiastic, hasEarnest, hasSincere,
    deadCount, apatheticCount,
  }
}

/** @example measureConsecrating('export class X { readonly y: string }') */
export function measureConsecrating(content: string): ConsecratingMeasure {
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
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSacred = /\b(async|await|Promise)\b/.test(content)
  const hasReverent = /\b(function|=>|return)\b/.test(content)
  const hasHoly = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasSanctified = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasSacred, hasReverent, hasHoly, hasSanctified,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let altar: ConsecratingMeasure['altar'] = 'no-precision'
  if (precision >= 90) altar = 'golden-altar'
  else if (precision >= 75) altar = 'silver-shrine'
  else if (precision >= 60) altar = 'proper-altar'
  else if (precision >= 40) altar = 'wooden-table'
  else if (precision >= 20) altar = 'stone-block'

  return {
    precision, altar, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasSacred, hasReverent, hasHoly, hasSanctified,
    unsafeCount, approximateCount,
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
  const hasTransparent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnderstandable = !/\bany\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasBeautiful = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevealing = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasRadiant = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLuminous = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasBrilliant = /\b(async|await|Promise)\b/.test(content)
  const hasGlowing = /\b(function|=>|return)\b/.test(content)
  const hasShining = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasBeautiful, hasRevealing,
    hasRadiant, hasLuminous, hasBrilliant, hasGlowing, hasShining,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let window: IlluminatingMeasure['window'] = 'no-clarity'
  if (clarity >= 90) window = 'rose-window'
  else if (clarity >= 75) window = 'stained-glass'
  else if (clarity >= 60) window = 'proper-light'
  else if (clarity >= 40) window = 'cloudy-glass'
  else if (clarity >= 20) window = 'opaque-wall'

  return {
    clarity, window, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasBeautiful, hasRevealing,
    hasRadiant, hasLuminous, hasBrilliant, hasGlowing, hasShining,
    crypticCount, mysteryCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTough = /\b(import|export)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrong = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUnyielding = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasIndomitable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasResilient = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUnconquerable = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasTough, hasHardened, hasEnduring, hasDurable,
    hasStrong, hasUnyielding, hasIndomitable, hasResilient, hasUnconquerable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shield: SurvivingMeasure['shield'] = 'no-resilience'
  if (resilience >= 90) shield = 'martyr-strength'
  else if (resilience >= 75) shield = 'warrior-resilience'
  else if (resilience >= 60) shield = 'proper-fortitude'
  else if (resilience >= 40) shield = 'fragile-glass'
  else if (resilience >= 20) shield = 'paper-thin'

  return {
    resilience, shield, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasTough, hasHardened, hasEnduring, hasDurable,
    hasStrong, hasUnyielding, hasIndomitable, hasResilient, hasUnconquerable,
    unhandledCount, untestedCount,
  }
}

/** @example measureGuiding('export class X { readonly y: string }') */
export function measureGuiding(content: string): GuidingMeasure {
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
  const hasDiscerning = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasSagacious = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasDiscerning, hasWise, hasSagacious,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let rank: GuidingMeasure['rank'] = 'no-wisdom'
  if (wisdom >= 90) rank = 'cardinal-wisdom'
  else if (wisdom >= 75) rank = 'bishop-insight'
  else if (wisdom >= 60) rank = 'proper-counsel'
  else if (wisdom >= 40) rank = 'novice-thought'
  else if (wisdom >= 20) rank = 'foolish-whim'

  return {
    wisdom, rank, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasDiscerning, hasWise, hasSagacious,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeRubyPrayer(content, 'app.ts') */
export function analyzeRubyPrayer(content: string, filePath: string): RubyPrayer {
  const dedicating = measureDedicating(content)
  const consecrating = measureConsecrating(content)
  const illuminating = measureIlluminating(content)
  const surviving = measureSurviving(content)
  const guiding = measureGuiding(content)

  const crimsonDevotion = dedicating.devotion
  const altarPrecision = consecrating.precision
  const stainedClarity = illuminating.clarity
  const bloodResilience = surviving.resilience
  const cardinalWisdom = guiding.wisdom

  const qualityScore = Math.round(
    crimsonDevotion * 0.2 +
    altarPrecision * 0.2 +
    stainedClarity * 0.2 +
    bloodResilience * 0.2 +
    cardinalWisdom * 0.2,
  )

  const condition = classifyRubyCondition(qualityScore)

  return {
    file: filePath,
    crimsonDevotion, altarPrecision, stainedClarity, bloodResilience, cardinalWisdom,
    dedicating, consecrating, illuminating, surviving, guiding,
    condition, qualityScore,
  }
}

/** @example analyzeRubyParish(prayers, 'src') */
export function analyzeRubyParish(prayers: RubyPrayer[], dirPath: string): RubyParish {
  if (prayers.length === 0) {
    return {
      directory: dirPath, prayers: [],
      avgDevotion: 0, avgPrecision: 0, avgWisdom: 0,
      rubyMasterpieceCount: 0, voidCount: 0,
      parishType: 'no-parish', condition: 'void',
    }
  }

  const avgDevotion = Math.round(prayers.reduce((s, p) => s + p.crimsonDevotion, 0) / prayers.length)
  const avgPrecision = Math.round(prayers.reduce((s, p) => s + p.altarPrecision, 0) / prayers.length)
  const avgWisdom = Math.round(prayers.reduce((s, p) => s + p.cardinalWisdom, 0) / prayers.length)
  const rubyMasterpieceCount = prayers.filter((p) => p.condition === 'ruby-masterpiece').length
  const voidCount = prayers.filter((p) => p.condition === 'void').length
  const parishType = classifyParishType(prayers)
  const avgQuality = Math.round(prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length)
  const condition = classifyParishCondition(avgQuality)

  return {
    directory: dirPath, prayers,
    avgDevotion, avgPrecision, avgWisdom,
    rubyMasterpieceCount, voidCount,
    parishType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildRubyCathedralResult(['a.ts'], [content]) */
export async function buildRubyCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyCathedralResult> {
  const prayers: RubyPrayer[] = files.map((file, i) =>
    analyzeRubyPrayer(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, RubyPrayer[]>()
  for (const prayer of prayers) {
    const dir = prayer.file.includes('/')
      ? prayer.file.substring(0, prayer.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(prayer)
    } else {
      dirMap.set(dir, [prayer])
    }
  }

  const parishes: RubyParish[] = Array.from(dirMap.entries()).map(([dir, dirPrayers]) =>
    analyzeRubyParish(dirPrayers, dir),
  )

  const avgCrimsonDevotion = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.crimsonDevotion, 0) / prayers.length) : 0
  const avgAltarPrecision = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.altarPrecision, 0) / prayers.length) : 0
  const avgStainedClarity = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.stainedClarity, 0) / prayers.length) : 0
  const avgBloodResilience = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.bloodResilience, 0) / prayers.length) : 0
  const avgCardinalWisdom = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.cardinalWisdom, 0) / prayers.length) : 0

  const overallSanctity = prayers.length > 0
    ? Math.round(prayers.reduce((s, p) => s + p.qualityScore, 0) / prayers.length) : 0
  const isRuby = overallSanctity >= 60

  const diocese: RubyCathedralResult['diocese'] = {
    avgDevotion: avgCrimsonDevotion, avgPrecision: avgAltarPrecision, avgWisdom: avgCardinalWisdom,
    isRuby, overallSanctity,
  }

  const rubyMasterpieceCount = prayers.filter((p) => p.condition === 'ruby-masterpiece').length
  const crimsonAltarCount = prayers.filter((p) => p.condition === 'crimson-altar').length
  const properRubyCount = prayers.filter((p) => p.condition === 'proper-ruby').length
  const pinkQuartzCount = prayers.filter((p) => p.condition === 'pink-quartz').length
  const redGlassCount = prayers.filter((p) => p.condition === 'red-glass').length
  const voidCount = prayers.filter((p) => p.condition === 'void').length

  const hasHighDevotionCount = prayers.filter((p) => p.dedicating.hasHighDevotion).length
  const hasHighPrecisionCount = prayers.filter((p) => p.consecrating.hasHighPrecision).length
  const hasHighClarityCount = prayers.filter((p) => p.illuminating.hasHighClarity).length
  const hasHighResilienceCount = prayers.filter((p) => p.surviving.hasHighResilience).length
  const hasHighWisdomCount = prayers.filter((p) => p.guiding.hasHighWisdom).length

  const bishopGrade = classifyBishopGrade(overallSanctity)

  const bestPrayer = prayers.length > 0
    ? prayers.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file : ''
  const mostDevoted = prayers.length > 0
    ? prayers.reduce((best, p) => (p.crimsonDevotion > best.crimsonDevotion ? p : best)).file : ''
  const mostPrecise = prayers.length > 0
    ? prayers.reduce((best, p) => (p.altarPrecision > best.altarPrecision ? p : best)).file : ''
  const clearest = prayers.length > 0
    ? prayers.reduce((best, p) => (p.stainedClarity > best.stainedClarity ? p : best)).file : ''
  const mostResilient = prayers.length > 0
    ? prayers.reduce((best, p) => (p.bloodResilience > best.bloodResilience ? p : best)).file : ''
  const wisest = prayers.length > 0
    ? prayers.reduce((best, p) => (p.cardinalWisdom > best.cardinalWisdom ? p : best)).file : ''

  const stats: RubyCathedralResult['stats'] = {
    totalFiles: files.length, totalParishes: parishes.length,
    avgCrimsonDevotion, avgAltarPrecision, avgStainedClarity, avgBloodResilience, avgCardinalWisdom,
    rubyMasterpieceCount, crimsonAltarCount, properRubyCount, pinkQuartzCount, redGlassCount, voidCount,
    hasHighDevotionCount, hasHighPrecisionCount, hasHighClarityCount, hasHighResilienceCount, hasHighWisdomCount,
    overallSanctity, bishopGrade,
    bestPrayer, mostDevoted, mostPrecise, clearest, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(prayers, parishes, diocese, stats)

  return {
    prayers, parishes, diocese, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(prayers, parishes, diocese, stats) */
export function generateRecommendations(
  prayers: RubyPrayer[],
  parishes: RubyParish[],
  _diocese: RubyCathedralResult['diocese'],
  stats: RubyCathedralResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrimsonDevotion >= 90 &&
    stats.avgAltarPrecision >= 90 &&
    stats.avgStainedClarity >= 90 &&
    stats.avgBloodResilience >= 90 &&
    stats.avgCardinalWisdom >= 90
  ) {
    recs.push(
      'Your ruby cathedral is a masterpiece of crimson devotion! Crimson devotion is unwavering-faith, altar precision is golden-altar, stained clarity is rose-window, blood resilience is martyr-strength, and cardinal wisdom is cardinal-wisdom!',
    )
    return recs
  }

  if (stats.avgCrimsonDevotion < 60) {
    recs.push(
      'Deepen crimson devotion — the ruby prayers must pulse with life; eliminate dead code, embrace dynamic patterns, and achieve unwavering-faith devotion'
    )
  }

  if (stats.avgAltarPrecision < 60) {
    recs.push(
      'Refine altar precision — every ruby prayer must be exact in its dedication; tighten types, eliminate unsafe patterns, and achieve golden-altar precision'
    )
  }

  if (stats.avgStainedClarity < 60) {
    recs.push(
      'Illuminate stained clarity — the ruby windows must filter light into beauty; remove cryptic patterns, add self-documenting code, and achieve rose-window clarity'
    )
  }

  if (stats.avgBloodResilience < 60) {
    recs.push(
      'Strengthen blood resilience — the ruby cathedral must survive the deepest wounds; add error handling, test thoroughly, and build martyr-strength resilience'
    )
  }

  if (stats.avgCardinalWisdom < 60) {
    recs.push(
      'Deepen cardinal wisdom — the ruby clergy must know what truly matters; build with principled architecture, proven patterns, and cardinal-wisdom insight'
    )
  }

  if (stats.overallSanctity < 40) {
    recs.push(
      'The ruby cathedral is in ruins — red glass and pink quartz outnumber the rubies, and no light enters'
    )
  }

  const voidPrayers = prayers.filter((p) => p.condition === 'void')
  if (voidPrayers.length > 0 && voidPrayers.length <= 5) {
    recs.push(`Remove these red glass fragments from the cathedral: ${voidPrayers.map((p) => p.file).join(', ')}`)
  } else if (voidPrayers.length > 5) {
    recs.push(`Remove ${voidPrayers.length} red glass fragments from the cathedral before the last crimson light fades`)
  }

  const poorParishes = parishes.filter((p) => p.condition === 'void' || p.condition === 'wooden-hut')
  if (poorParishes.length === parishes.length && parishes.length > 0) {
    recs.push('All parishes are wooden huts — the ruby cathedral needs ruby-cathedral quality prayers throughout')
  }

  if (recs.length === 0) {
    recs.push('Your ruby cathedral radiates with crimson sanctity — every prayer carries crimson devotion, altar precision, stained clarity, blood resilience, and cardinal wisdom')
  }

  return recs
}
