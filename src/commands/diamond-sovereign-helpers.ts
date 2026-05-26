// ─── Interfaces ──────────────────────────────────────────

export interface HardeningMeasure {
  hardness: number
  stone: 'indestructible' | 'flawless-diamond' | 'proper-gem' | 'included-stone' | 'fragile-crystal' | 'no-hardness'
  hasHighHardness: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasRobust: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasSolid: boolean
  hasDurable: boolean
  hasReinforced: boolean
  hasPermanent: boolean
  hasImpervious: boolean
  hasFortified: boolean
  chaoticCount: number
  untestedCount: number
}

export interface ShiningMeasure {
  brilliance: number
  light: 'supreme-fire' | 'excellent-sparkle' | 'proper-brilliance' | 'dull-gleam' | 'no-light' | 'no-brilliance'
  hasHighBrilliance: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasElegant: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasSophisticated: boolean
  hasLuminous: boolean
  hasRadiant: boolean
  hasBrilliant: boolean
  hasDazzling: boolean
  hasResplendent: boolean
  hasMagnificent: boolean
  hasGlorious: boolean
  crypticCount: number
  mysteryCount: number
}

export interface CuttingMeasure {
  precision: number
  cut: 'ideal-brilliant' | 'excellent-cut' | 'proper-facet' | 'poor-proportion' | 'rough-stone' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasFaceted: boolean
  hasSymmetrical: boolean
  hasProportional: boolean
  hasMasterful: boolean
  hasImpeccable: boolean
  approximateCount: number
  roughCount: number
}

export interface LastingMeasure {
  endurance: number
  legacy: 'eternal-dynasty' | 'lasting-empire' | 'proper-reign' | 'brief-rule' | 'fleeting-moment' | 'no-endurance'
  hasHighEndurance: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasEvolved: boolean
  hasNoStatic: boolean
  hasPreserved: boolean
  hasSustainable: boolean
  hasAdaptive: boolean
  hasFlexible: boolean
  hasTimeless: boolean
  hasLasting: boolean
  hasPermanent: boolean
  hasEnduring: boolean
  hasPerpetual: boolean
  hasImmortal: boolean
  hasUndying: boolean
  hasEverlasting: boolean
  fragileCount: number
  staticCount: number
}

export interface KnowingMeasure {
  wisdom: number
  reign: 'enlightened-sovereign' | 'wise-emperor' | 'proper-ruler' | 'naive-king' | 'foolish-jester' | 'no-wisdom'
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
  hasFarSighted: boolean
  hasWise: boolean
  hasSagacious: boolean
  hasOmniscient: boolean
  hackedCount: number
  shallowCount: number
}

export type EdictCondition =
  | 'sovereign-masterpiece'
  | 'royal-diamond'
  | 'proper-gem'
  | 'industrial-stone'
  | 'rough-carbon'
  | 'void'

export interface DiamondEdict {
  file: string
  sovereignHardness: number
  crownBrilliance: number
  thronePrecision: number
  scepterEndurance: number
  dynastyWisdom: number
  hardening: HardeningMeasure
  shining: ShiningMeasure
  cutting: CuttingMeasure
  lasting: LastingMeasure
  knowing: KnowingMeasure
  condition: EdictCondition
  qualityScore: number
}

export type EmpireType =
  | 'supreme-empire'
  | 'grand-kingdom'
  | 'proper-realm'
  | 'small-dukedom'
  | 'barren-wasteland'
  | 'no-empire'

export type EmpireCondition =
  | 'diamond-palace'
  | 'gem-fortress'
  | 'proper-castle'
  | 'stone-tower'
  | 'clay-hut'
  | 'void'

export interface DiamondEmpire {
  directory: string
  edicts: DiamondEdict[]
  avgHardness: number
  avgBrilliance: number
  avgWisdom: number
  sovereignMasterpieceCount: number
  voidCount: number
  empireType: EmpireType
  condition: EmpireCondition
}

export type SovereignGrade = 'diamond-emperor' | 'gem-king' | 'proper-duke' | 'baron' | 'knight' | 'peasant'

export interface DiamondSovereignResult {
  edicts: DiamondEdict[]
  empires: DiamondEmpire[]
  throne: {
    avgHardness: number
    avgBrilliance: number
    avgWisdom: number
    isDiamond: boolean
    overallSovereignty: number
    celebration?: string
  }
  stats: {
    totalFiles: number
    totalEmpires: number
    avgSovereignHardness: number
    avgCrownBrilliance: number
    avgThronePrecision: number
    avgScepterEndurance: number
    avgDynastyWisdom: number
    sovereignMasterpieceCount: number
    royalDiamondCount: number
    properGemCount: number
    industrialStoneCount: number
    roughCarbonCount: number
    voidCount: number
    hasHighHardnessCount: number
    hasHighBrillianceCount: number
    hasHighPrecisionCount: number
    hasHighEnduranceCount: number
    hasHighWisdomCount: number
    overallSovereignty: number
    sovereignGrade: SovereignGrade
    bestEdict: string
    hardest: string
    mostBrilliant: string
    mostPrecise: string
    mostEnduring: string
    wisest: string
    celebration?: string
  }
  recommendations: string[]
  celebration?: string
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

/** @example classifyEdictCondition(90) */
export function classifyEdictCondition(score: number): EdictCondition {
  if (score >= 90) return 'sovereign-masterpiece'
  if (score >= 75) return 'royal-diamond'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'industrial-stone'
  if (score >= 20) return 'rough-carbon'
  return 'void'
}

/** @example classifyEmpireType(edicts) */
export function classifyEmpireType(edicts: DiamondEdict[]): EmpireType {
  if (edicts.length === 0) return 'no-empire'
  const avg = edicts.reduce((s, e) => s + e.qualityScore, 0) / edicts.length
  if (avg >= 85) return 'supreme-empire'
  if (avg >= 70) return 'grand-kingdom'
  if (avg >= 55) return 'proper-realm'
  if (avg >= 35) return 'small-dukedom'
  return 'barren-wasteland'
}

/** @example classifyEmpireCondition(85) */
export function classifyEmpireCondition(score: number): EmpireCondition {
  if (score >= 85) return 'diamond-palace'
  if (score >= 70) return 'gem-fortress'
  if (score >= 55) return 'proper-castle'
  if (score >= 35) return 'stone-tower'
  if (score >= 15) return 'clay-hut'
  return 'void'
}

/** @example classifySovereignGrade(80) */
export function classifySovereignGrade(avgSovereignty: number): SovereignGrade {
  if (avgSovereignty >= 80) return 'diamond-emperor'
  if (avgSovereignty >= 65) return 'gem-king'
  if (avgSovereignty >= 50) return 'proper-duke'
  if (avgSovereignty >= 35) return 'baron'
  if (avgSovereignty >= 20) return 'knight'
  return 'peasant'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureHardening('class X { readonly y: string }') */
export function measureHardening(content: string): HardeningMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasNoUnsafe = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSolid = /\b(import|export)\b/.test(content)
  const hasDurable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReinforced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPermanent = /\b(async|await|Promise)\b/.test(content)
  const hasImpervious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFortified = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasTested,
    hasNoUntested, hasStable, hasRobust, hasHardened, hasEnduring,
    hasSolid, hasDurable, hasReinforced, hasPermanent, hasImpervious, hasFortified,
  ]

  const hardness = computeScore(positiveBooleans)
  const hasHighHardness = hardness >= 60

  let stone: HardeningMeasure['stone'] = 'no-hardness'
  if (hardness >= 90) stone = 'indestructible'
  else if (hardness >= 75) stone = 'flawless-diamond'
  else if (hardness >= 60) stone = 'proper-gem'
  else if (hardness >= 40) stone = 'included-stone'
  else if (hardness >= 20) stone = 'fragile-crystal'

  return {
    hardness, stone, hasHighHardness,
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasTested,
    hasNoUntested, hasStable, hasRobust, hasHardened, hasEnduring,
    hasSolid, hasDurable, hasReinforced, hasPermanent, hasImpervious, hasFortified,
    chaoticCount, untestedCount,
  }
}

/** @example measureShining('export class X { readonly y: string }') */
export function measureShining(content: string): ShiningMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(import|export)\b/.test(content)
  const mysteryCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRefined = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSophisticated = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLuminous = !/\bany\b/.test(content)
  const hasRadiant = /\b(async|await|Promise)\b/.test(content)
  const hasBrilliant = /\b(function|=>|return)\b/.test(content)
  const hasDazzling = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasResplendent = /\b(try|catch|if)\b/.test(content)
  const hasMagnificent = /\b(const|readonly)\b/.test(content)
  const hasGlorious = (content.match(/\b(ugly|clunky|crude)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasElegant, hasPolished, hasRefined, hasSophisticated, hasLuminous,
    hasRadiant, hasBrilliant, hasDazzling, hasResplendent, hasMagnificent, hasGlorious,
  ]

  const brilliance = computeScore(positiveBooleans)
  const hasHighBrilliance = brilliance >= 60

  let light: ShiningMeasure['light'] = 'no-brilliance'
  if (brilliance >= 90) light = 'supreme-fire'
  else if (brilliance >= 75) light = 'excellent-sparkle'
  else if (brilliance >= 60) light = 'proper-brilliance'
  else if (brilliance >= 40) light = 'dull-gleam'
  else if (brilliance >= 20) light = 'no-light'

  return {
    brilliance, light, hasHighBrilliance,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasElegant, hasPolished, hasRefined, hasSophisticated, hasLuminous,
    hasRadiant, hasBrilliant, hasDazzling, hasResplendent, hasMagnificent, hasGlorious,
    crypticCount, mysteryCount,
  }
}

/** @example measureCutting('export class X { readonly y: string }') */
export function measureCutting(content: string): CuttingMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasCorrect = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasRefined = !/\bany\b/.test(content)
  const hasPolished = /\b(try|catch|if)\b/.test(content)
  const hasFaceted = /\b(async|await|Promise)\b/.test(content)
  const hasSymmetrical = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasProportional = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasMasterful = /\b(const|readonly)\b/.test(content)
  const hasImpeccable = (content.match(/\b(ugly|clunky|crude)\b/gi) ?? []).length === 0
  const roughCount = (content.match(/\b(rough|coarse|unrefined)\b/gi) ?? []).length

  const positiveBooleans = [
    hasAccurate, hasNoApproximate, hasExact, hasClean, hasPrecise,
    hasCorrect, hasSharp, hasCrisp, hasDefined, hasRefined,
    hasPolished, hasFaceted, hasSymmetrical, hasProportional, hasMasterful, hasImpeccable,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let cut: CuttingMeasure['cut'] = 'no-precision'
  if (precision >= 90) cut = 'ideal-brilliant'
  else if (precision >= 75) cut = 'excellent-cut'
  else if (precision >= 60) cut = 'proper-facet'
  else if (precision >= 40) cut = 'poor-proportion'
  else if (precision >= 20) cut = 'rough-stone'

  return {
    precision, cut, hasHighPrecision,
    hasAccurate, hasNoApproximate, hasExact, hasClean, hasPrecise,
    hasCorrect, hasSharp, hasCrisp, hasDefined, hasRefined,
    hasPolished, hasFaceted, hasSymmetrical, hasProportional, hasMasterful, hasImpeccable,
    approximateCount, roughCount,
  }
}

/** @example measureLasting('export class X { readonly y: string }') */
export function measureLasting(content: string): LastingMeasure {
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|breakable)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasEvolved = /\b(extends|implements|abstract)\b/.test(content)
  const staticCount = (content.match(/\b(var|static\s+\w+\s*=)\b/g) ?? []).length
  const hasNoStatic = staticCount === 0
  const hasPreserved = /\b(import|export)\b/.test(content)
  const hasSustainable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasFlexible = /\b(function|=>|return)\b/.test(content)
  const hasTimeless = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLasting = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPermanent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = (content.match(/\b(eval)\b/g) ?? []).length === 0
  const hasPerpetual = !/\bany\b/.test(content)
  const hasImmortal = /\b(readonly|private|protected)\b/.test(content)
  const hasUndying = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEverlasting = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasMaintainable, hasNoFragile, hasEvolved, hasNoStatic, hasPreserved,
    hasSustainable, hasAdaptive, hasFlexible, hasTimeless, hasLasting,
    hasPermanent, hasEnduring, hasPerpetual, hasImmortal, hasUndying, hasEverlasting,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let legacy: LastingMeasure['legacy'] = 'no-endurance'
  if (endurance >= 90) legacy = 'eternal-dynasty'
  else if (endurance >= 75) legacy = 'lasting-empire'
  else if (endurance >= 60) legacy = 'proper-reign'
  else if (endurance >= 40) legacy = 'brief-rule'
  else if (endurance >= 20) legacy = 'fleeting-moment'

  return {
    endurance, legacy, hasHighEndurance,
    hasMaintainable, hasNoFragile, hasEvolved, hasNoStatic, hasPreserved,
    hasSustainable, hasAdaptive, hasFlexible, hasTimeless, hasLasting,
    hasPermanent, hasEnduring, hasPerpetual, hasImmortal, hasUndying, hasEverlasting,
    fragileCount, staticCount,
  }
}

/** @example measureKnowing('export class X { readonly y: string }') */
export function measureKnowing(content: string): KnowingMeasure {
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
  const hasFarSighted = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasSagacious = (content.match(/\b(naive|foolish|ignorant)\b/gi) ?? []).length === 0
  const hasOmniscient = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasSagacious, hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let reign: KnowingMeasure['reign'] = 'no-wisdom'
  if (wisdom >= 90) reign = 'enlightened-sovereign'
  else if (wisdom >= 75) reign = 'wise-emperor'
  else if (wisdom >= 60) reign = 'proper-ruler'
  else if (wisdom >= 40) reign = 'naive-king'
  else if (wisdom >= 20) reign = 'foolish-jester'

  return {
    wisdom, reign, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasSagacious, hasOmniscient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeDiamondEdict(content, 'app.ts') */
export function analyzeDiamondEdict(content: string, filePath: string): DiamondEdict {
  const hardening = measureHardening(content)
  const shining = measureShining(content)
  const cutting = measureCutting(content)
  const lasting = measureLasting(content)
  const knowing = measureKnowing(content)

  const sovereignHardness = hardening.hardness
  const crownBrilliance = shining.brilliance
  const thronePrecision = cutting.precision
  const scepterEndurance = lasting.endurance
  const dynastyWisdom = knowing.wisdom

  const qualityScore = Math.round(
    sovereignHardness * 0.2 +
    crownBrilliance * 0.2 +
    thronePrecision * 0.2 +
    scepterEndurance * 0.2 +
    dynastyWisdom * 0.2,
  )

  const condition = classifyEdictCondition(qualityScore)

  return {
    file: filePath,
    sovereignHardness, crownBrilliance, thronePrecision, scepterEndurance, dynastyWisdom,
    hardening, shining, cutting, lasting, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeDiamondEmpire(edicts, 'src') */
export function analyzeDiamondEmpire(edicts: DiamondEdict[], dirPath: string): DiamondEmpire {
  if (edicts.length === 0) {
    return {
      directory: dirPath, edicts: [],
      avgHardness: 0, avgBrilliance: 0, avgWisdom: 0,
      sovereignMasterpieceCount: 0, voidCount: 0,
      empireType: 'no-empire', condition: 'void',
    }
  }

  const avgHardness = Math.round(edicts.reduce((s, e) => s + e.sovereignHardness, 0) / edicts.length)
  const avgBrilliance = Math.round(edicts.reduce((s, e) => s + e.crownBrilliance, 0) / edicts.length)
  const avgWisdom = Math.round(edicts.reduce((s, e) => s + e.dynastyWisdom, 0) / edicts.length)
  const sovereignMasterpieceCount = edicts.filter((e) => e.condition === 'sovereign-masterpiece').length
  const voidCount = edicts.filter((e) => e.condition === 'void').length
  const empireType = classifyEmpireType(edicts)
  const avgQuality = Math.round(edicts.reduce((s, e) => s + e.qualityScore, 0) / edicts.length)
  const condition = classifyEmpireCondition(avgQuality)

  return {
    directory: dirPath, edicts,
    avgHardness, avgBrilliance, avgWisdom,
    sovereignMasterpieceCount, voidCount,
    empireType, condition,
  }
}

// ─── Celebration ────────────────────────────────────────

const CELEBRATION_MESSAGE = 'Command #620 — Diamond Sovereign milestone achieved! 620 commands forged in eternal brilliance!'

function shouldCelebrate(files: string[]): boolean {
  return files.some((f) => f.includes('diamond-sovereign'))
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildDiamondSovereignResult(['a.ts'], [content]) */
export async function buildDiamondSovereignResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<DiamondSovereignResult> {
  const edicts: DiamondEdict[] = files.map((file, i) =>
    analyzeDiamondEdict(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, DiamondEdict[]>()
  for (const edict of edicts) {
    const dir = edict.file.includes('/')
      ? edict.file.substring(0, edict.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(edict)
    } else {
      dirMap.set(dir, [edict])
    }
  }

  const empires: DiamondEmpire[] = Array.from(dirMap.entries()).map(([dir, dirEdicts]) =>
    analyzeDiamondEmpire(dirEdicts, dir),
  )

  const avgSovereignHardness = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.sovereignHardness, 0) / edicts.length) : 0
  const avgCrownBrilliance = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.crownBrilliance, 0) / edicts.length) : 0
  const avgThronePrecision = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.thronePrecision, 0) / edicts.length) : 0
  const avgScepterEndurance = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.scepterEndurance, 0) / edicts.length) : 0
  const avgDynastyWisdom = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.dynastyWisdom, 0) / edicts.length) : 0

  const overallSovereignty = edicts.length > 0
    ? Math.round(edicts.reduce((s, e) => s + e.qualityScore, 0) / edicts.length) : 0
  const isDiamond = overallSovereignty >= 60

  const celebrate = shouldCelebrate(files)

  const throne: DiamondSovereignResult['throne'] = {
    avgHardness: avgSovereignHardness, avgBrilliance: avgCrownBrilliance, avgWisdom: avgDynastyWisdom,
    isDiamond, overallSovereignty,
    celebration: celebrate ? CELEBRATION_MESSAGE : undefined,
  }

  const sovereignMasterpieceCount = edicts.filter((e) => e.condition === 'sovereign-masterpiece').length
  const royalDiamondCount = edicts.filter((e) => e.condition === 'royal-diamond').length
  const properGemCount = edicts.filter((e) => e.condition === 'proper-gem').length
  const industrialStoneCount = edicts.filter((e) => e.condition === 'industrial-stone').length
  const roughCarbonCount = edicts.filter((e) => e.condition === 'rough-carbon').length
  const voidCount = edicts.filter((e) => e.condition === 'void').length

  const hasHighHardnessCount = edicts.filter((e) => e.hardening.hasHighHardness).length
  const hasHighBrillianceCount = edicts.filter((e) => e.shining.hasHighBrilliance).length
  const hasHighPrecisionCount = edicts.filter((e) => e.cutting.hasHighPrecision).length
  const hasHighEnduranceCount = edicts.filter((e) => e.lasting.hasHighEndurance).length
  const hasHighWisdomCount = edicts.filter((e) => e.knowing.hasHighWisdom).length

  const sovereignGrade = classifySovereignGrade(overallSovereignty)

  const bestEdict = edicts.length > 0
    ? edicts.reduce((best, e) => (e.qualityScore > best.qualityScore ? e : best)).file : ''
  const hardest = edicts.length > 0
    ? edicts.reduce((best, e) => (e.sovereignHardness > best.sovereignHardness ? e : best)).file : ''
  const mostBrilliant = edicts.length > 0
    ? edicts.reduce((best, e) => (e.crownBrilliance > best.crownBrilliance ? e : best)).file : ''
  const mostPrecise = edicts.length > 0
    ? edicts.reduce((best, e) => (e.thronePrecision > best.thronePrecision ? e : best)).file : ''
  const mostEnduring = edicts.length > 0
    ? edicts.reduce((best, e) => (e.scepterEndurance > best.scepterEndurance ? e : best)).file : ''
  const wisest = edicts.length > 0
    ? edicts.reduce((best, e) => (e.dynastyWisdom > best.dynastyWisdom ? e : best)).file : ''

  const stats: DiamondSovereignResult['stats'] = {
    totalFiles: files.length, totalEmpires: empires.length,
    avgSovereignHardness, avgCrownBrilliance, avgThronePrecision, avgScepterEndurance, avgDynastyWisdom,
    sovereignMasterpieceCount, royalDiamondCount, properGemCount, industrialStoneCount, roughCarbonCount, voidCount,
    hasHighHardnessCount, hasHighBrillianceCount, hasHighPrecisionCount, hasHighEnduranceCount, hasHighWisdomCount,
    overallSovereignty, sovereignGrade,
    bestEdict, hardest, mostBrilliant, mostPrecise, mostEnduring, wisest,
    celebration: celebrate ? CELEBRATION_MESSAGE : undefined,
  }

  const recommendations = generateRecommendations(edicts, empires, throne, stats)

  return {
    edicts, empires, throne, stats, recommendations,
    celebration: celebrate ? CELEBRATION_MESSAGE : undefined,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(edicts, empires, throne, stats) */
export function generateRecommendations(
  edicts: DiamondEdict[],
  empires: DiamondEmpire[],
  throne: DiamondSovereignResult['throne'],
  stats: DiamondSovereignResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgSovereignHardness >= 90 &&
    stats.avgCrownBrilliance >= 90 &&
    stats.avgThronePrecision >= 90 &&
    stats.avgScepterEndurance >= 90 &&
    stats.avgDynastyWisdom >= 90
  ) {
    recs.push(
      'Your diamond sovereign radiates absolute sovereignty! The hardness is indestructible, the brilliance supreme, the cut ideal, the scepter eternal, and the dynasty wisdom omniscient!',
    )
    return recs
  }

  if (stats.avgSovereignHardness < 60) {
    recs.push(
      'Harden sovereign structure — diamond must be the hardest substance; your code needs stronger types, error handling, and reinforced patterns',
    )
  }

  if (stats.avgCrownBrilliance < 60) {
    recs.push(
      'Polish crown brilliance — the sovereign diamond must reflect maximum light; your code needs clearer naming, better documentation, and more elegant patterns',
    )
  }

  if (stats.avgThronePrecision < 60) {
    recs.push(
      'Refine throne precision — every facet of the sovereign diamond must be ideal-cut; your code needs exact types, clean logic, and masterful structure',
    )
  }

  if (stats.avgScepterEndurance < 60) {
    recs.push(
      'Strengthen scepter endurance — the diamond sovereign rules eternally; your code needs maintainable architecture, evolved patterns, and sustainable design',
    )
  }

  if (stats.avgDynastyWisdom < 60) {
    recs.push(
      'Deepen dynasty wisdom — the enlightened sovereign governs with omniscient insight; your code needs principled architecture, strategic vision, and holistic understanding',
    )
  }

  if (stats.overallSovereignty < 40) {
    recs.push(
      'The diamond sovereign has fallen — rough carbon and industrial stones outnumber the precious diamonds, and the empire lies in ruins',
    )
  }

  const voidEdicts = edicts.filter((e) => e.condition === 'void')
  if (voidEdicts.length > 0 && voidEdicts.length <= 5) {
    recs.push(`Cut these rough carbon into diamonds: ${voidEdicts.map((e) => e.file).join(', ')}`)
  } else if (voidEdicts.length > 5) {
    recs.push(`Cut ${voidEdicts.length} rough carbon edicts into diamonds before the empire collapses`)
  }

  const poorEmpires = empires.filter((e) => e.condition === 'void' || e.condition === 'clay-hut')
  if (poorEmpires.length === empires.length && empires.length > 0) {
    recs.push('All empires are clay huts — the diamond sovereign needs complete reconstruction from the finest sovereign masterpieces')
  }

  if (recs.length === 0) {
    recs.push('Your diamond sovereign commands with eternal brilliance — every edict embodies hardness, brilliance, precision, endurance, and dynasty wisdom')
  }

  return recs
}
