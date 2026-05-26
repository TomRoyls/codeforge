// ─── Interfaces ──────────────────────────────────────────

export interface BlazingMeasure {
  vitality: number
  flame: 'eternal-fire' | 'blazing-passion' | 'proper-glow' | 'dying-ember' | 'cold-ash' | 'no-vitality'
  hasHighVitality: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasPassionate: boolean
  hasNoApathetic: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasEvolving: boolean
  hasVibrant: boolean
  hasEnergetic: boolean
  hasActive: boolean
  hasThriving: boolean
  hasPulsing: boolean
  hasRadiant: boolean
  hasFierce: boolean
  hasIntense: boolean
  deadCount: number
  apatheticCount: number
}

export interface AscendingMeasure {
  elegance: number
  summit: 'diamond-peak' | 'crystal-spire' | 'proper-summit' | 'rocky-ridge' | 'base-camp' | 'no-elegance'
  hasHighElegance: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasGraceful: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasSophisticated: boolean
  hasSubtle: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  hasAesthetic: boolean
  hasCrafted: boolean
  hasDeliberate: boolean
  hasArtistic: boolean
  hasBeautiful: boolean
  hasSleek: boolean
  clunkyCount: number
  roughCount: number
}

export interface FocusingMeasure {
  precision: number
  focus: 'laser-beam' | 'sharp-blade' | 'proper-focus' | 'scattered-light' | 'diffuse-glow' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasUnambiguous: boolean
  hasClear: boolean
  hasDecisive: boolean
  hasFaithful: boolean
  unsafeCount: number
  approximateCount: number
}

export interface EnduringMeasure {
  resilience: number
  shield: 'pinnacle-fortress' | 'mountain-stronghold' | 'proper-shelter' | 'wind-exposed' | 'fragile-ice' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasReinforced: boolean
  hasFortified: boolean
  hasImpervious: boolean
  hasUnshakable: boolean
  hasIndomitable: boolean
  hasUnyielding: boolean
  unhandledCount: number
  untestedCount: number
}

export interface RulingMeasure {
  wisdom: number
  crown: 'ruby-emperor' | 'wise-monarch' | 'proper-ruler' | 'puppet-king' | 'court-jester' | 'no-wisdom'
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
  hasExperienced: boolean
  hackedCount: number
  shallowCount: number
}

export type FacetCondition =
  | 'ruby-masterpiece'
  | 'royal-gem'
  | 'proper-ruby'
  | 'garnet-grade'
  | 'red-glass'
  | 'void'

export interface RubyFacet {
  file: string
  crimsonVitality: number
  peakElegance: number
  flamePrecision: number
  summitResilience: number
  crownWisdom: number
  blazing: BlazingMeasure
  ascending: AscendingMeasure
  focusing: FocusingMeasure
  enduring: EnduringMeasure
  ruling: RulingMeasure
  condition: FacetCondition
  qualityScore: number
}

export type MountainType =
  | 'crown-jewel'
  | 'ruby-mine'
  | 'proper-deposit'
  | 'red-clay'
  | 'barren-peak'
  | 'no-mountain'

export type MountainCondition =
  | 'ruby-palace'
  | 'gem-vault'
  | 'proper-treasury'
  | 'stone-quarry'
  | 'gravel-pit'
  | 'void'

export interface RubyMountain {
  directory: string
  facets: RubyFacet[]
  avgVitality: number
  avgElegance: number
  avgWisdom: number
  rubyMasterpieceCount: number
  voidCount: number
  mountainType: MountainType
  condition: MountainCondition
}

export type GemologistGrade = 'master-gemologist' | 'ruby-expert' | 'proper-appraiser' | 'apprentice' | 'novice' | 'glass-seller'

export interface RubyPinnacleResult {
  facets: RubyFacet[]
  mountains: RubyMountain[]
  crown: {
    avgVitality: number
    avgElegance: number
    avgWisdom: number
    isRuby: boolean
    overallMajesty: number
  }
  stats: {
    totalFiles: number
    totalMountains: number
    avgCrimsonVitality: number
    avgPeakElegance: number
    avgFlamePrecision: number
    avgSummitResilience: number
    avgCrownWisdom: number
    rubyMasterpieceCount: number
    royalGemCount: number
    properRubyCount: number
    garnetGradeCount: number
    redGlassCount: number
    voidCount: number
    hasHighVitalityCount: number
    hasHighEleganceCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallMajesty: number
    gemologistGrade: GemologistGrade
    bestFacet: string
    mostVibrant: string
    mostElegant: string
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

/** @example classifyFacetCondition(90) */
export function classifyFacetCondition(score: number): FacetCondition {
  if (score >= 90) return 'ruby-masterpiece'
  if (score >= 75) return 'royal-gem'
  if (score >= 60) return 'proper-ruby'
  if (score >= 40) return 'garnet-grade'
  if (score >= 20) return 'red-glass'
  return 'void'
}

/** @example classifyMountainType(facets) */
export function classifyMountainType(facets: RubyFacet[]): MountainType {
  if (facets.length === 0) return 'no-mountain'
  const avg = facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length
  if (avg >= 85) return 'crown-jewel'
  if (avg >= 70) return 'ruby-mine'
  if (avg >= 55) return 'proper-deposit'
  if (avg >= 35) return 'red-clay'
  return 'barren-peak'
}

/** @example classifyMountainCondition(85) */
export function classifyMountainCondition(score: number): MountainCondition {
  if (score >= 85) return 'ruby-palace'
  if (score >= 70) return 'gem-vault'
  if (score >= 55) return 'proper-treasury'
  if (score >= 35) return 'stone-quarry'
  if (score >= 15) return 'gravel-pit'
  return 'void'
}

/** @example classifyGemologistGrade(80) */
export function classifyGemologistGrade(avgMajesty: number): GemologistGrade {
  if (avgMajesty >= 80) return 'master-gemologist'
  if (avgMajesty >= 65) return 'ruby-expert'
  if (avgMajesty >= 50) return 'proper-appraiser'
  if (avgMajesty >= 35) return 'apprentice'
  if (avgMajesty >= 20) return 'novice'
  return 'glass-seller'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureBlazing('class X { readonly y: string }') */
export function measureBlazing(content: string): BlazingMeasure {
  const hasAlive = /\b(class|interface|type)\b/.test(content)
  const deadCount = (content.match(/\b(dead|lifeless|dormant|stagnant)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasPassionate = /\b(import|export)\b/.test(content)
  const apatheticCount = (content.match(/\b(apathetic|indifferent|passive|lazy)\b/gi) ?? []).length
  const hasNoApathetic = apatheticCount === 0
  const hasDynamic = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEvolving = /\b(function|=>|return)\b/.test(content)
  const hasVibrant = /\b(readonly|private|protected)\b/.test(content)
  const hasEnergetic = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasActive = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasThriving = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPulsing = /\b(const|readonly)\b/.test(content)
  const hasRadiant = !/\bany\b/.test(content)
  const hasFierce = /\b(try|catch|if)\b/.test(content)
  const hasIntense = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasAlive, hasNoDead, hasPassionate, hasNoApathetic, hasDynamic,
    hasNoStatic, hasEvolving, hasVibrant, hasEnergetic, hasActive,
    hasThriving, hasPulsing, hasRadiant, hasFierce, hasIntense,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60

  let flame: BlazingMeasure['flame'] = 'no-vitality'
  if (vitality >= 90) flame = 'eternal-fire'
  else if (vitality >= 75) flame = 'blazing-passion'
  else if (vitality >= 60) flame = 'proper-glow'
  else if (vitality >= 40) flame = 'dying-ember'
  else if (vitality >= 20) flame = 'cold-ash'

  return {
    vitality, flame, hasHighVitality,
    hasAlive, hasNoDead, hasPassionate, hasNoApathetic, hasDynamic,
    hasNoStatic, hasEvolving, hasVibrant, hasEnergetic, hasActive,
    hasThriving, hasPulsing, hasRadiant, hasFierce, hasIntense,
    deadCount, apatheticCount,
  }
}

/** @example measureAscending('export class X { readonly y: string }') */
export function measureAscending(content: string): AscendingMeasure {
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const clunkyCount = (content.match(/\b(clunky|awkward|ugly|crude)\b/gi) ?? []).length
  const hasNoClunky = clunkyCount === 0
  const hasGraceful = /\b(import|export)\b/.test(content)
  const hasRefined = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSophisticated = /\b(readonly|private|protected)\b/.test(content)
  const hasSubtle = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasHarmonious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasBalanced = !/\bany\b/.test(content)
  const hasAesthetic = /\b(async|await|Promise)\b/.test(content)
  const hasCrafted = /\b(function|=>|return)\b/.test(content)
  const hasDeliberate = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasArtistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasBeautiful = /\b(try|catch|if)\b/.test(content)
  const hasSleek = /\b(const|readonly)\b/.test(content)
  const roughCount = (content.match(/\b(rough|coarse|crude|unrefined)\b/gi) ?? []).length

  const positiveBooleans = [
    hasElegant, hasNoClunky, hasGraceful, hasRefined, hasPolished,
    hasSophisticated, hasSubtle, hasHarmonious, hasBalanced, hasAesthetic,
    hasCrafted, hasDeliberate, hasArtistic, hasBeautiful, hasSleek,
  ]

  const elegance = computeScore(positiveBooleans)
  const hasHighElegance = elegance >= 60

  let summit: AscendingMeasure['summit'] = 'no-elegance'
  if (elegance >= 90) summit = 'diamond-peak'
  else if (elegance >= 75) summit = 'crystal-spire'
  else if (elegance >= 60) summit = 'proper-summit'
  else if (elegance >= 40) summit = 'rocky-ridge'
  else if (elegance >= 20) summit = 'base-camp'

  return {
    elegance, summit, hasHighElegance,
    hasElegant, hasNoClunky, hasGraceful, hasRefined, hasPolished,
    hasSophisticated, hasSubtle, hasHarmonious, hasBalanced, hasAesthetic,
    hasCrafted, hasDeliberate, hasArtistic, hasBeautiful, hasSleek,
    clunkyCount, roughCount,
  }
}

/** @example measureFocusing('export class X { readonly y: string }') */
export function measureFocusing(content: string): FocusingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(unsafe|risky|hazardous|dangerous)\b/gi) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
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
  const hasUnambiguous = /\b(try|catch|if)\b/.test(content)
  const hasClear = /\b(async|await|Promise)\b/.test(content)
  const hasDecisive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFaithful = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasSharp, hasCrisp,
    hasDefined, hasUnambiguous, hasClear, hasDecisive, hasFaithful,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let focus: FocusingMeasure['focus'] = 'no-precision'
  if (precision >= 90) focus = 'laser-beam'
  else if (precision >= 75) focus = 'sharp-blade'
  else if (precision >= 60) focus = 'proper-focus'
  else if (precision >= 40) focus = 'scattered-light'
  else if (precision >= 20) focus = 'diffuse-glow'

  return {
    precision, focus, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasSharp, hasCrisp,
    hasDefined, hasUnambiguous, hasClear, hasDecisive, hasFaithful,
    unsafeCount, approximateCount,
  }
}

/** @example measureEnduring('export class X { readonly y: string }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|unchecked|uncaught|bare)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasReinforced = /\b(import|export)\b/.test(content)
  const hasFortified = /\b(class|interface|type)\b/.test(content)
  const hasImpervious = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnshakable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasIndomitable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnyielding = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasReinforced,
    hasFortified, hasImpervious, hasUnshakable, hasIndomitable, hasUnyielding,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shield: EnduringMeasure['shield'] = 'no-resilience'
  if (resilience >= 90) shield = 'pinnacle-fortress'
  else if (resilience >= 75) shield = 'mountain-stronghold'
  else if (resilience >= 60) shield = 'proper-shelter'
  else if (resilience >= 40) shield = 'wind-exposed'
  else if (resilience >= 20) shield = 'fragile-ice'

  return {
    resilience, shield, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasReinforced,
    hasFortified, hasImpervious, hasUnshakable, hasIndomitable, hasUnyielding,
    unhandledCount, untestedCount,
  }
}

/** @example measureRuling('export class X { readonly y: string }') */
export function measureRuling(content: string): RulingMeasure {
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
  const hasExperienced = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasExperienced,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let crown: RulingMeasure['crown'] = 'no-wisdom'
  if (wisdom >= 90) crown = 'ruby-emperor'
  else if (wisdom >= 75) crown = 'wise-monarch'
  else if (wisdom >= 60) crown = 'proper-ruler'
  else if (wisdom >= 40) crown = 'puppet-king'
  else if (wisdom >= 20) crown = 'court-jester'

  return {
    wisdom, crown, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeRubyFacet(content, 'app.ts') */
export function analyzeRubyFacet(content: string, filePath: string): RubyFacet {
  const blazing = measureBlazing(content)
  const ascending = measureAscending(content)
  const focusing = measureFocusing(content)
  const enduring = measureEnduring(content)
  const ruling = measureRuling(content)

  const crimsonVitality = blazing.vitality
  const peakElegance = ascending.elegance
  const flamePrecision = focusing.precision
  const summitResilience = enduring.resilience
  const crownWisdom = ruling.wisdom

  const qualityScore = Math.round(
    crimsonVitality * 0.2 +
    peakElegance * 0.2 +
    flamePrecision * 0.2 +
    summitResilience * 0.2 +
    crownWisdom * 0.2,
  )

  const condition = classifyFacetCondition(qualityScore)

  return {
    file: filePath,
    crimsonVitality, peakElegance, flamePrecision, summitResilience, crownWisdom,
    blazing, ascending, focusing, enduring, ruling,
    condition, qualityScore,
  }
}

/** @example analyzeRubyMountain(facets, 'src') */
export function analyzeRubyMountain(facets: RubyFacet[], dirPath: string): RubyMountain {
  if (facets.length === 0) {
    return {
      directory: dirPath, facets: [],
      avgVitality: 0, avgElegance: 0, avgWisdom: 0,
      rubyMasterpieceCount: 0, voidCount: 0,
      mountainType: 'no-mountain', condition: 'void',
    }
  }

  const avgVitality = Math.round(facets.reduce((s, f) => s + f.crimsonVitality, 0) / facets.length)
  const avgElegance = Math.round(facets.reduce((s, f) => s + f.peakElegance, 0) / facets.length)
  const avgWisdom = Math.round(facets.reduce((s, f) => s + f.crownWisdom, 0) / facets.length)
  const rubyMasterpieceCount = facets.filter((f) => f.condition === 'ruby-masterpiece').length
  const voidCount = facets.filter((f) => f.condition === 'void').length
  const mountainType = classifyMountainType(facets)
  const avgQuality = Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length)
  const condition = classifyMountainCondition(avgQuality)

  return {
    directory: dirPath, facets,
    avgVitality, avgElegance, avgWisdom,
    rubyMasterpieceCount, voidCount,
    mountainType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildRubyPinnacleResult(['a.ts'], [content]) */
export async function buildRubyPinnacleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<RubyPinnacleResult> {
  const facets: RubyFacet[] = files.map((file, i) =>
    analyzeRubyFacet(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, RubyFacet[]>()
  for (const facet of facets) {
    const dir = facet.file.includes('/')
      ? facet.file.substring(0, facet.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(facet)
    } else {
      dirMap.set(dir, [facet])
    }
  }

  const mountains: RubyMountain[] = Array.from(dirMap.entries()).map(([dir, dirFacets]) =>
    analyzeRubyMountain(dirFacets, dir),
  )

  const avgCrimsonVitality = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.crimsonVitality, 0) / facets.length) : 0
  const avgPeakElegance = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.peakElegance, 0) / facets.length) : 0
  const avgFlamePrecision = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.flamePrecision, 0) / facets.length) : 0
  const avgSummitResilience = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.summitResilience, 0) / facets.length) : 0
  const avgCrownWisdom = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.crownWisdom, 0) / facets.length) : 0

  const overallMajesty = facets.length > 0
    ? Math.round(facets.reduce((s, f) => s + f.qualityScore, 0) / facets.length) : 0
  const isRuby = overallMajesty >= 60

  const crown = { avgVitality: avgCrimsonVitality, avgElegance: avgPeakElegance, avgWisdom: avgCrownWisdom, isRuby, overallMajesty }

  const rubyMasterpieceCount = facets.filter((f) => f.condition === 'ruby-masterpiece').length
  const royalGemCount = facets.filter((f) => f.condition === 'royal-gem').length
  const properRubyCount = facets.filter((f) => f.condition === 'proper-ruby').length
  const garnetGradeCount = facets.filter((f) => f.condition === 'garnet-grade').length
  const redGlassCount = facets.filter((f) => f.condition === 'red-glass').length
  const voidCount = facets.filter((f) => f.condition === 'void').length

  const hasHighVitalityCount = facets.filter((f) => f.blazing.hasHighVitality).length
  const hasHighEleganceCount = facets.filter((f) => f.ascending.hasHighElegance).length
  const hasHighPrecisionCount = facets.filter((f) => f.focusing.hasHighPrecision).length
  const hasHighResilienceCount = facets.filter((f) => f.enduring.hasHighResilience).length
  const hasHighWisdomCount = facets.filter((f) => f.ruling.hasHighWisdom).length

  const gemologistGrade = classifyGemologistGrade(overallMajesty)

  const bestFacet = facets.length > 0
    ? facets.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file : ''
  const mostVibrant = facets.length > 0
    ? facets.reduce((best, f) => (f.crimsonVitality > best.crimsonVitality ? f : best)).file : ''
  const mostElegant = facets.length > 0
    ? facets.reduce((best, f) => (f.peakElegance > best.peakElegance ? f : best)).file : ''
  const mostPrecise = facets.length > 0
    ? facets.reduce((best, f) => (f.flamePrecision > best.flamePrecision ? f : best)).file : ''
  const mostResilient = facets.length > 0
    ? facets.reduce((best, f) => (f.summitResilience > best.summitResilience ? f : best)).file : ''
  const wisest = facets.length > 0
    ? facets.reduce((best, f) => (f.crownWisdom > best.crownWisdom ? f : best)).file : ''

  const stats: RubyPinnacleResult['stats'] = {
    totalFiles: files.length, totalMountains: mountains.length,
    avgCrimsonVitality, avgPeakElegance, avgFlamePrecision, avgSummitResilience, avgCrownWisdom,
    rubyMasterpieceCount, royalGemCount, properRubyCount, garnetGradeCount, redGlassCount, voidCount,
    hasHighVitalityCount, hasHighEleganceCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallMajesty, gemologistGrade,
    bestFacet, mostVibrant, mostElegant, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(facets, mountains, crown, stats)

  return { facets, mountains, crown, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(facets, mountains, crown, stats) */
export function generateRecommendations(
  facets: RubyFacet[],
  mountains: RubyMountain[],
  crown: RubyPinnacleResult['crown'],
  stats: RubyPinnacleResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrimsonVitality >= 90 &&
    stats.avgPeakElegance >= 90 &&
    stats.avgFlamePrecision >= 90 &&
    stats.avgSummitResilience >= 90 &&
    stats.avgCrownWisdom >= 90
  ) {
    recs.push(
      'Your ruby pinnacle radiates perfect majesty! The crimson fire burns eternal, the peak gleams with diamond elegance, the flame cuts with laser precision, the summit fortress stands unshaken, and the crown wisdom rules supreme!',
    )
    return recs
  }

  if (stats.avgCrimsonVitality < 60) {
    recs.push(
      'Ignite crimson vitality — your code must burn with passionate life; add dynamic patterns, eliminate dead code, and infuse energy into every facet',
    )
  }

  if (stats.avgPeakElegance < 60) {
    recs.push(
      'Ascend to peak elegance — the ruby pinnacle demands grace at every level; refine your code with polished patterns, harmonious structure, and sleek design',
    )
  }

  if (stats.avgFlamePrecision < 60) {
    recs.push(
      'Focus flame precision — the crimson flame must cut like a laser; your code needs stronger types, cleaner patterns, and exact specifications',
    )
  }

  if (stats.avgSummitResilience < 60) {
    recs.push(
      'Fortify summit resilience — the pinnacle must weather every storm; your code needs error handling, defensive patterns, and hardened structure',
    )
  }

  if (stats.avgCrownWisdom < 60) {
    recs.push(
      'Deepen crown wisdom — the ruby emperor rules with deep insight; your code needs principled architecture, strategic vision, and holistic understanding',
    )
  }

  if (stats.overallMajesty < 40) {
    recs.push(
      'The ruby pinnacle has crumbled — red glass and garnet outnumber the precious rubies, and the mountain has become barren',
    )
  }

  const voidFacets = facets.filter((f) => f.condition === 'void')
  if (voidFacets.length > 0 && voidFacets.length <= 5) {
    recs.push(`Polish these red glass facets into rubies: ${voidFacets.map((f) => f.file).join(', ')}`)
  } else if (voidFacets.length > 5) {
    recs.push(`Polish ${voidFacets.length} red glass facets into rubies before the pinnacle collapses`)
  }

  const poorMountains = mountains.filter((m) => m.condition === 'void' || m.condition === 'gravel-pit')
  if (poorMountains.length === mountains.length && mountains.length > 0) {
    recs.push('All mountains are gravel pits — the ruby pinnacle needs complete reconstruction from the finest crown jewels')
  }

  if (recs.length === 0) {
    recs.push('Your ruby pinnacle gleams with regal majesty — every facet blazes with vitality, elegance, precision, resilience, and crown wisdom')
  }

  return recs
}
