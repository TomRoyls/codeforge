// ─── Interfaces ──────────────────────────────────────────

export interface RulingMeasure {
  authority: number
  throne: 'supreme-ruler' | 'wise-king' | 'proper-monarch' | 'puppet-ruler' | 'pretender' | 'no-authority'
  hasHighAuthority: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasConfident: boolean
  hasClear: boolean
  hasDecisive: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasOrganized: boolean
  hasCommanding: boolean
  hasStrong: boolean
  hasAuthoritative: boolean
  hasBold: boolean
  hasDirect: boolean
  hasPrincipled: boolean
  hasFirm: boolean
  chaoticCount: number
  weakCount: number
}

export interface GoverningMeasure {
  wisdom: number
  reign: 'golden-age' | 'wise-rule' | 'proper-governance' | 'mismanagement' | 'chaos' | 'no-wisdom'
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

export interface DecreeingMeasure {
  precision: number
  crown: 'royal-seal' | 'official-edict' | 'proper-decree' | 'vague-memo' | 'whisper' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasUnambiguous: boolean
  hasClear: boolean
  hasDecisive: boolean
  unsafeCount: number
  approximateCount: number
}

export interface DefendingMeasure {
  resilience: number
  shield: 'impregnable-fortress' | 'stronghold' | 'proper-defenses' | 'wooden-fence' | 'paper-wall' | 'no-resilience'
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

export interface PersistingMeasure {
  endurance: number
  dynasty: 'eternal-dynasty' | 'lasting-empire' | 'proper-reign' | 'brief-rule' | 'one-day-king' | 'no-endurance'
  hasHighEndurance: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasEvolved: boolean
  hasNoStatic: boolean
  hasPreserved: boolean
  hasSustainable: boolean
  hasRenewable: boolean
  hasAdaptive: boolean
  hasFlexible: boolean
  hasTimeless: boolean
  hasLasting: boolean
  hasPermanent: boolean
  hasEnduring: boolean
  hasPerpetual: boolean
  hasImmortal: boolean
  fragileCount: number
  staticCount: number
}

export type DecreeCondition =
  | 'emerald-masterpiece'
  | 'royal-standard'
  | 'proper-gem'
  | 'base-metal'
  | 'tin-foil'
  | 'void'

export interface EmeraldDecree {
  file: string
  gemAuthority: number
  throneWisdom: number
  crownPrecision: number
  scepterResilience: number
  dynastyEndurance: number
  ruling: RulingMeasure
  governing: GoverningMeasure
  decreeing: DecreeingMeasure
  defending: DefendingMeasure
  persisting: PersistingMeasure
  condition: DecreeCondition
  qualityScore: number
}

export type KingdomType =
  | 'grand-empire'
  | 'prosperous-kingdom'
  | 'proper-realm'
  | 'small-dukedom'
  | 'barren-wasteland'
  | 'no-kingdom'

export type KingdomCondition =
  | 'emerald-palace'
  | 'royal-court'
  | 'proper-castle'
  | 'wooden-fort'
  | 'tent'
  | 'void'

export interface EmeraldKingdom {
  directory: string
  decrees: EmeraldDecree[]
  avgAuthority: number
  avgPrecision: number
  avgEndurance: number
  emeraldMasterpieceCount: number
  voidCount: number
  kingdomType: KingdomType
  condition: KingdomCondition
}

export type SovereignGrade = 'emperor' | 'king' | 'duke' | 'baron' | 'knight' | 'peasant'

export interface EmeraldThroneResult {
  decrees: EmeraldDecree[]
  kingdoms: EmeraldKingdom[]
  empire: {
    avgAuthority: number
    avgPrecision: number
    avgEndurance: number
    isEmerald: boolean
    overallSovereignty: number
  }
  stats: {
    totalFiles: number
    totalKingdoms: number
    avgGemAuthority: number
    avgThroneWisdom: number
    avgCrownPrecision: number
    avgScepterResilience: number
    avgDynastyEndurance: number
    emeraldMasterpieceCount: number
    royalStandardCount: number
    properGemCount: number
    baseMetalCount: number
    tinFoilCount: number
    voidCount: number
    hasHighAuthorityCount: number
    hasHighWisdomCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighEnduranceCount: number
    overallSovereignty: number
    sovereignGrade: SovereignGrade
    bestDecree: string
    mostAuthoritative: string
    wisest: string
    mostPrecise: string
    mostResilient: string
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

/** @example classifyDecreeCondition(90) */
export function classifyDecreeCondition(score: number): DecreeCondition {
  if (score >= 90) return 'emerald-masterpiece'
  if (score >= 75) return 'royal-standard'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'base-metal'
  if (score >= 20) return 'tin-foil'
  return 'void'
}

/** @example classifyKingdomType(decrees) */
export function classifyKingdomType(decrees: EmeraldDecree[]): KingdomType {
  if (decrees.length === 0) return 'no-kingdom'
  const avg = decrees.reduce((s, d) => s + d.qualityScore, 0) / decrees.length
  if (avg >= 85) return 'grand-empire'
  if (avg >= 70) return 'prosperous-kingdom'
  if (avg >= 55) return 'proper-realm'
  if (avg >= 35) return 'small-dukedom'
  return 'barren-wasteland'
}

/** @example classifyKingdomCondition(85) */
export function classifyKingdomCondition(score: number): KingdomCondition {
  if (score >= 85) return 'emerald-palace'
  if (score >= 70) return 'royal-court'
  if (score >= 55) return 'proper-castle'
  if (score >= 35) return 'wooden-fort'
  if (score >= 15) return 'tent'
  return 'void'
}

/** @example classifySovereignGrade(80) */
export function classifySovereignGrade(avgSovereignty: number): SovereignGrade {
  if (avgSovereignty >= 80) return 'emperor'
  if (avgSovereignty >= 65) return 'king'
  if (avgSovereignty >= 50) return 'duke'
  if (avgSovereignty >= 35) return 'baron'
  if (avgSovereignty >= 20) return 'knight'
  return 'peasant'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRuling('class X { readonly y: string }') */
export function measureRuling(content: string): RulingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasConfident = !/\bany\b/.test(content)
  const hasClear = /\b(import|export)\b/.test(content)
  const hasDecisive = /\b(function|=>|return)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasCommanding = /\b(async|await|Promise)\b/.test(content)
  const hasStrong = /\b(const|readonly)\b/.test(content)
  const hasAuthoritative = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasBold = /\b(try|catch|if)\b/.test(content)
  const hasDirect = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPrincipled = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFirm = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const weakCount = (content.match(/\b(weak|flimsy|feeble|powerless)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasConfident, hasClear, hasDecisive,
    hasDocumented, hasTyped, hasOrganized, hasCommanding, hasStrong,
    hasAuthoritative, hasBold, hasDirect, hasPrincipled, hasFirm,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60

  let throne: RulingMeasure['throne'] = 'no-authority'
  if (authority >= 90) throne = 'supreme-ruler'
  else if (authority >= 75) throne = 'wise-king'
  else if (authority >= 60) throne = 'proper-monarch'
  else if (authority >= 40) throne = 'puppet-ruler'
  else if (authority >= 20) throne = 'pretender'

  return {
    authority, throne, hasHighAuthority,
    hasWellStructured, hasNoChaotic, hasConfident, hasClear, hasDecisive,
    hasDocumented, hasTyped, hasOrganized, hasCommanding, hasStrong,
    hasAuthoritative, hasBold, hasDirect, hasPrincipled, hasFirm,
    chaoticCount, weakCount,
  }
}

/** @example measureGoverning('export class X { readonly y: string }') */
export function measureGoverning(content: string): GoverningMeasure {
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

  let reign: GoverningMeasure['reign'] = 'no-wisdom'
  if (wisdom >= 90) reign = 'golden-age'
  else if (wisdom >= 75) reign = 'wise-rule'
  else if (wisdom >= 60) reign = 'proper-governance'
  else if (wisdom >= 40) reign = 'mismanagement'
  else if (wisdom >= 20) reign = 'chaos'

  return {
    wisdom, reign, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

/** @example measureDecreeing('const x: string = "test"') */
export function measureDecreeing(content: string): DecreeingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|fuzzy)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(const|readonly)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFaithful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\b(function|=>|return)\b/.test(content)
  const hasDefined = /\b(import|export)\b/.test(content)
  const hasUnambiguous = /\b(async|await|Promise)\b/.test(content)
  const hasClear = /\b(try|catch|if)\b/.test(content)
  const hasDecisive = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasFaithful, hasSharp,
    hasCrisp, hasDefined, hasUnambiguous, hasClear, hasDecisive,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let crown: DecreeingMeasure['crown'] = 'no-precision'
  if (precision >= 90) crown = 'royal-seal'
  else if (precision >= 75) crown = 'official-edict'
  else if (precision >= 60) crown = 'proper-decree'
  else if (precision >= 40) crown = 'vague-memo'
  else if (precision >= 20) crown = 'whisper'

  return {
    precision, crown, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasFaithful, hasSharp,
    hasCrisp, hasDefined, hasUnambiguous, hasClear, hasDecisive,
    unsafeCount, approximateCount,
  }
}

/** @example measureDefending('try { await x() } catch { throw new Error() }') */
export function measureDefending(content: string): DefendingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasReinforced = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFortified = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasImpervious = !/\bany\b/.test(content)
  const hasUnshakable = /\b(async|await|Promise)\b/.test(content)
  const hasIndomitable = /\b(import|export)\b/.test(content)
  const hasUnyielding = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTestedOrTyped = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasReinforced,
    hasFortified, hasImpervious, hasUnshakable, hasIndomitable, hasUnyielding,
  ]
  void hasTestedOrTyped

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shield: DefendingMeasure['shield'] = 'no-resilience'
  if (resilience >= 90) shield = 'impregnable-fortress'
  else if (resilience >= 75) shield = 'stronghold'
  else if (resilience >= 60) shield = 'proper-defenses'
  else if (resilience >= 40) shield = 'wooden-fence'
  else if (resilience >= 20) shield = 'paper-wall'

  return {
    resilience, shield, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasReinforced,
    hasFortified, hasImpervious, hasUnshakable, hasIndomitable, hasUnyielding,
    unhandledCount, untestedCount,
  }
}

/** @example measurePersisting('export class X { readonly y: string }') */
export function measurePersisting(content: string): PersistingMeasure {
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|breakable)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasEvolved = /\b(extends|implements|abstract)\b/.test(content)
  const staticCount = (content.match(/\b(static|hardcoded|rigid|inflexible)\b/gi) ?? []).length
  const hasNoStatic = staticCount === 0
  const hasPreserved = /\b(import|export)\b/.test(content)
  const hasSustainable = /\b(readonly|private|protected)\b/.test(content)
  const hasRenewable = /\b(async|await|Promise)\b/.test(content)
  const hasAdaptive = /\b(function|=>|return)\b/.test(content)
  const hasFlexible = !/\bany\b/.test(content)
  const hasTimeless = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasLasting = /\b(const|readonly)\b/.test(content)
  const hasPermanent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPerpetual = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasImmortal = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasMaintainable, hasNoFragile, hasEvolved, hasNoStatic, hasPreserved,
    hasSustainable, hasRenewable, hasAdaptive, hasFlexible, hasTimeless,
    hasLasting, hasPermanent, hasEnduring, hasPerpetual, hasImmortal,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let dynasty: PersistingMeasure['dynasty'] = 'no-endurance'
  if (endurance >= 90) dynasty = 'eternal-dynasty'
  else if (endurance >= 75) dynasty = 'lasting-empire'
  else if (endurance >= 60) dynasty = 'proper-reign'
  else if (endurance >= 40) dynasty = 'brief-rule'
  else if (endurance >= 20) dynasty = 'one-day-king'

  return {
    endurance, dynasty, hasHighEndurance,
    hasMaintainable, hasNoFragile, hasEvolved, hasNoStatic, hasPreserved,
    hasSustainable, hasRenewable, hasAdaptive, hasFlexible, hasTimeless,
    hasLasting, hasPermanent, hasEnduring, hasPerpetual, hasImmortal,
    fragileCount, staticCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeEmeraldDecree(content, 'app.ts') */
export function analyzeEmeraldDecree(content: string, filePath: string): EmeraldDecree {
  const ruling = measureRuling(content)
  const governing = measureGoverning(content)
  const decreeing = measureDecreeing(content)
  const defending = measureDefending(content)
  const persisting = measurePersisting(content)

  const gemAuthority = ruling.authority
  const throneWisdom = governing.wisdom
  const crownPrecision = decreeing.precision
  const scepterResilience = defending.resilience
  const dynastyEndurance = persisting.endurance

  const qualityScore = Math.round(
    gemAuthority * 0.2 +
    throneWisdom * 0.2 +
    crownPrecision * 0.2 +
    scepterResilience * 0.2 +
    dynastyEndurance * 0.2,
  )

  const condition = classifyDecreeCondition(qualityScore)

  return {
    file: filePath,
    gemAuthority, throneWisdom, crownPrecision, scepterResilience, dynastyEndurance,
    ruling, governing, decreeing, defending, persisting,
    condition, qualityScore,
  }
}

/** @example analyzeEmeraldKingdom(decrees, 'src') */
export function analyzeEmeraldKingdom(decrees: EmeraldDecree[], dirPath: string): EmeraldKingdom {
  if (decrees.length === 0) {
    return {
      directory: dirPath, decrees: [],
      avgAuthority: 0, avgPrecision: 0, avgEndurance: 0,
      emeraldMasterpieceCount: 0, voidCount: 0,
      kingdomType: 'no-kingdom', condition: 'void',
    }
  }

  const avgAuthority = Math.round(decrees.reduce((s, d) => s + d.gemAuthority, 0) / decrees.length)
  const avgPrecision = Math.round(decrees.reduce((s, d) => s + d.crownPrecision, 0) / decrees.length)
  const avgEndurance = Math.round(decrees.reduce((s, d) => s + d.dynastyEndurance, 0) / decrees.length)
  const emeraldMasterpieceCount = decrees.filter((d) => d.condition === 'emerald-masterpiece').length
  const voidCount = decrees.filter((d) => d.condition === 'void').length
  const kingdomType = classifyKingdomType(decrees)
  const avgQuality = Math.round(decrees.reduce((s, d) => s + d.qualityScore, 0) / decrees.length)
  const condition = classifyKingdomCondition(avgQuality)

  return {
    directory: dirPath, decrees,
    avgAuthority, avgPrecision, avgEndurance,
    emeraldMasterpieceCount, voidCount,
    kingdomType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildEmeraldThroneResult(['a.ts'], [content]) */
export async function buildEmeraldThroneResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<EmeraldThroneResult> {
  const decrees: EmeraldDecree[] = files.map((file, i) =>
    analyzeEmeraldDecree(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, EmeraldDecree[]>()
  for (const decree of decrees) {
    const dir = decree.file.includes('/')
      ? decree.file.substring(0, decree.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(decree)
    } else {
      dirMap.set(dir, [decree])
    }
  }

  const kingdoms: EmeraldKingdom[] = Array.from(dirMap.entries()).map(([dir, dirDecrees]) =>
    analyzeEmeraldKingdom(dirDecrees, dir),
  )

  const avgGemAuthority = decrees.length > 0
    ? Math.round(decrees.reduce((s, d) => s + d.gemAuthority, 0) / decrees.length) : 0
  const avgThroneWisdom = decrees.length > 0
    ? Math.round(decrees.reduce((s, d) => s + d.throneWisdom, 0) / decrees.length) : 0
  const avgCrownPrecision = decrees.length > 0
    ? Math.round(decrees.reduce((s, d) => s + d.crownPrecision, 0) / decrees.length) : 0
  const avgScepterResilience = decrees.length > 0
    ? Math.round(decrees.reduce((s, d) => s + d.scepterResilience, 0) / decrees.length) : 0
  const avgDynastyEndurance = decrees.length > 0
    ? Math.round(decrees.reduce((s, d) => s + d.dynastyEndurance, 0) / decrees.length) : 0

  const overallSovereignty = decrees.length > 0
    ? Math.round(decrees.reduce((s, d) => s + d.qualityScore, 0) / decrees.length) : 0
  const isEmerald = overallSovereignty >= 60

  const empire = { avgAuthority: avgGemAuthority, avgPrecision: avgCrownPrecision, avgEndurance: avgDynastyEndurance, isEmerald, overallSovereignty }

  const emeraldMasterpieceCount = decrees.filter((d) => d.condition === 'emerald-masterpiece').length
  const royalStandardCount = decrees.filter((d) => d.condition === 'royal-standard').length
  const properGemCount = decrees.filter((d) => d.condition === 'proper-gem').length
  const baseMetalCount = decrees.filter((d) => d.condition === 'base-metal').length
  const tinFoilCount = decrees.filter((d) => d.condition === 'tin-foil').length
  const voidCount = decrees.filter((d) => d.condition === 'void').length

  const hasHighAuthorityCount = decrees.filter((d) => d.ruling.hasHighAuthority).length
  const hasHighWisdomCount = decrees.filter((d) => d.governing.hasHighWisdom).length
  const hasHighPrecisionCount = decrees.filter((d) => d.decreeing.hasHighPrecision).length
  const hasHighResilienceCount = decrees.filter((d) => d.defending.hasHighResilience).length
  const hasHighEnduranceCount = decrees.filter((d) => d.persisting.hasHighEndurance).length

  const sovereignGrade = classifySovereignGrade(overallSovereignty)

  const bestDecree = decrees.length > 0
    ? decrees.reduce((best, d) => (d.qualityScore > best.qualityScore ? d : best)).file : ''
  const mostAuthoritative = decrees.length > 0
    ? decrees.reduce((best, d) => (d.gemAuthority > best.gemAuthority ? d : best)).file : ''
  const wisest = decrees.length > 0
    ? decrees.reduce((best, d) => (d.throneWisdom > best.throneWisdom ? d : best)).file : ''
  const mostPrecise = decrees.length > 0
    ? decrees.reduce((best, d) => (d.crownPrecision > best.crownPrecision ? d : best)).file : ''
  const mostResilient = decrees.length > 0
    ? decrees.reduce((best, d) => (d.scepterResilience > best.scepterResilience ? d : best)).file : ''
  const mostEnduring = decrees.length > 0
    ? decrees.reduce((best, d) => (d.dynastyEndurance > best.dynastyEndurance ? d : best)).file : ''

  const stats: EmeraldThroneResult['stats'] = {
    totalFiles: files.length, totalKingdoms: kingdoms.length,
    avgGemAuthority, avgThroneWisdom, avgCrownPrecision, avgScepterResilience, avgDynastyEndurance,
    emeraldMasterpieceCount, royalStandardCount, properGemCount, baseMetalCount, tinFoilCount, voidCount,
    hasHighAuthorityCount, hasHighWisdomCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighEnduranceCount,
    overallSovereignty, sovereignGrade,
    bestDecree, mostAuthoritative, wisest, mostPrecise, mostResilient, mostEnduring,
  }

  const recommendations = generateRecommendations(decrees, kingdoms, empire, stats)

  return { decrees, kingdoms, empire, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(decrees, kingdoms, empire, stats) */
export function generateRecommendations(
  decrees: EmeraldDecree[],
  kingdoms: EmeraldKingdom[],
  empire: EmeraldThroneResult['empire'],
  stats: EmeraldThroneResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGemAuthority >= 90 &&
    stats.avgThroneWisdom >= 90 &&
    stats.avgCrownPrecision >= 90 &&
    stats.avgScepterResilience >= 90 &&
    stats.avgDynastyEndurance >= 90
  ) {
    recs.push(
      'Your emerald throne shines with absolute sovereignty! Every decree carries supreme authority, the throne governs with golden-age wisdom, every crown decree bears the royal seal, the scepter is unyielding, and the dynasty endures for eternity!',
    )
    return recs
  }

  if (stats.avgGemAuthority < 60) {
    recs.push(
      'Strengthen gem authority — your code lacks commanding presence, decisive patterns, and the confident structure that earns the respect of the kingdom',
    )
  }

  if (stats.avgThroneWisdom < 60) {
    recs.push(
      'Deepen throne wisdom — a ruler must govern with insight and strategic vision; your code needs principled architecture and deep understanding',
    )
  }

  if (stats.avgCrownPrecision < 60) {
    recs.push(
      'Sharpen crown precision — every royal decree must be exact; your code needs sharper types, cleaner patterns, and more precise craftsmanship',
    )
  }

  if (stats.avgScepterResilience < 60) {
    recs.push(
      'Fortify scepter resilience — the scepter must endure all challenges; your code needs error handling, defensive programming, and hardened stability',
    )
  }

  if (stats.avgDynastyEndurance < 60) {
    recs.push(
      'Ensure dynasty endurance — a ruling dynasty must last generations; your code needs maintainable, adaptable, and sustainable patterns',
    )
  }

  if (stats.overallSovereignty < 40) {
    recs.push(
      'The emerald throne has crumbled — tin foil and base metal outnumber the gems, and the kingdom has fallen to barren wasteland',
    )
  }

  const voidDecrees = decrees.filter((d) => d.condition === 'void')
  if (voidDecrees.length > 0 && voidDecrees.length <= 5) {
    recs.push(`Reforge these tin-foil decrees: ${voidDecrees.map((d) => d.file).join(', ')}`)
  } else if (voidDecrees.length > 5) {
    recs.push(`Reforge ${voidDecrees.length} tin-foil decrees before the entire kingdom collapses`)
  }

  const poorKingdoms = kingdoms.filter((k) => k.condition === 'void' || k.condition === 'tent')
  if (poorKingdoms.length === kingdoms.length && kingdoms.length > 0) {
    recs.push('All kingdoms are tents and wastelands — the empire needs a complete reconstruction from the finest emeralds')
  }

  if (recs.length === 0) {
    recs.push('Your emerald throne gleams with sovereign brilliance — every decree commands authority, wisdom, precision, resilience, and enduring legacy')
  }

  return recs
}
