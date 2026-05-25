// ─── Interfaces ──────────────────────────────────────────

export interface FoundingMeasure {
  strength: number
  sovereign: 'true-steel' | 'battle-tested' | 'proper-iron' | 'soft-metal' | 'tin-foil' | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasSolid: boolean
  hasEnduring: boolean
  hasHardened: boolean
  hasStrong: boolean
  hasDurable: boolean
  hasUnbreakable: boolean
  chaoticCount: number
  untestedCount: number
}

export interface CommandingMeasure {
  authority: number
  crown: 'imperial-crown' | 'royal-diadem' | 'proper-circlet' | 'wreath' | 'party-hat' | 'no-authority'
  hasHighAuthority: boolean
  hasConfident: boolean
  hasClear: boolean
  hasDecisive: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasWellStructured: boolean
  hasOrganized: boolean
  hasDirect: boolean
  hasStrong: boolean
  hasCommanding: boolean
  hasBold: boolean
  hasAuthoritative: boolean
  hasPrincipled: boolean
  hasFirm: boolean
  hasUnambiguous: boolean
  weakCount: number
  vagueCount: number
}

export interface SettingMeasure {
  precision: number
  jewel: 'master-cut' | 'expert-set' | 'proper-setting' | 'loose-stone' | 'glass-bead' | 'no-precision'
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
  hasPolished: boolean
  hasCut: boolean
  hasFaceted: boolean
  hasMasterful: boolean
  approximateCount: number
  roughCount: number
}

export interface DefendingMeasure {
  resilience: number
  circlet: 'impervious-ring' | 'strong-band' | 'proper-circle' | 'bent-wire' | 'broken-loop' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasEnduring: boolean
  hasSurviving: boolean
  hasPersistent: boolean
  hasUnyielding: boolean
  hasResolute: boolean
  hasSteadfast: boolean
  hasIndomitable: boolean
  hasUnbreakable: boolean
  unhandledCount: number
  vulnerableCount: number
}

export interface PersistingMeasure {
  endurance: number
  reign: 'eternal-reign' | 'lasting-dynasty' | 'proper-rule' | 'brief-era' | 'one-day-king' | 'no-endurance'
  hasHighEndurance: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasEvolved: boolean
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
  hasRenewable: boolean
  hasUndying: boolean
  fragileCount: number
  stagnantCount: number
}

export type CrownCondition =
  | 'crown-masterpiece'
  | 'imperial-standard'
  | 'proper-crown'
  | 'bent-circlet'
  | 'rusty-ring'
  | 'void'

export interface CrownJewel {
  file: string
  sovereignStrength: number
  crownAuthority: number
  jewelPrecision: number
  circletResilience: number
  reignEndurance: number
  founding: FoundingMeasure
  commanding: CommandingMeasure
  setting: SettingMeasure
  defending: DefendingMeasure
  persisting: PersistingMeasure
  condition: CrownCondition
  qualityScore: number
}

export type RealmType =
  | 'grand-empire'
  | 'iron-kingdom'
  | 'proper-realm'
  | 'small-dukedom'
  | 'barren-wasteland'
  | 'no-realm'

export type RealmCondition =
  | 'imperial-palace'
  | 'iron-throne-room'
  | 'proper-castle'
  | 'wooden-fort'
  | 'tent'
  | 'void'

export interface CrownRealm {
  directory: string
  jewels: CrownJewel[]
  avgStrength: number
  avgAuthority: number
  avgEndurance: number
  crownMasterpieceCount: number
  voidCount: number
  realmType: RealmType
  condition: RealmCondition
}

export type MonarchGrade = 'emperor' | 'king' | 'duke' | 'baron' | 'knight' | 'peasant'

export interface IronCrownResult {
  jewels: CrownJewel[]
  realms: CrownRealm[]
  kingdom: {
    avgStrength: number
    avgAuthority: number
    avgEndurance: number
    isIron: boolean
    overallSovereignty: number
  }
  stats: {
    totalFiles: number
    totalRealms: number
    avgSovereignStrength: number
    avgCrownAuthority: number
    avgJewelPrecision: number
    avgCircletResilience: number
    avgReignEndurance: number
    crownMasterpieceCount: number
    imperialStandardCount: number
    properCrownCount: number
    bentCircletCount: number
    rustyRingCount: number
    voidCount: number
    hasHighStrengthCount: number
    hasHighAuthorityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighEnduranceCount: number
    overallSovereignty: number
    monarchGrade: MonarchGrade
    bestJewel: string
    strongest: string
    mostAuthoritative: string
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

/** @example classifyCrownCondition(90) */
export function classifyCrownCondition(score: number): CrownCondition {
  if (score >= 90) return 'crown-masterpiece'
  if (score >= 75) return 'imperial-standard'
  if (score >= 60) return 'proper-crown'
  if (score >= 40) return 'bent-circlet'
  if (score >= 20) return 'rusty-ring'
  return 'void'
}

/** @example classifyRealmType(jewels) */
export function classifyRealmType(jewels: CrownJewel[]): RealmType {
  if (jewels.length === 0) return 'no-realm'
  const avg = jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length
  if (avg >= 85) return 'grand-empire'
  if (avg >= 70) return 'iron-kingdom'
  if (avg >= 55) return 'proper-realm'
  if (avg >= 35) return 'small-dukedom'
  return 'barren-wasteland'
}

/** @example classifyRealmCondition(85) */
export function classifyRealmCondition(score: number): RealmCondition {
  if (score >= 85) return 'imperial-palace'
  if (score >= 70) return 'iron-throne-room'
  if (score >= 55) return 'proper-castle'
  if (score >= 35) return 'wooden-fort'
  if (score >= 15) return 'tent'
  return 'void'
}

/** @example classifyMonarchGrade(80) */
export function classifyMonarchGrade(avgSovereignty: number): MonarchGrade {
  if (avgSovereignty >= 80) return 'emperor'
  if (avgSovereignty >= 65) return 'king'
  if (avgSovereignty >= 50) return 'duke'
  if (avgSovereignty >= 35) return 'baron'
  if (avgSovereignty >= 20) return 'knight'
  return 'peasant'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureFounding('class X { readonly y: string }') */
export function measureFounding(content: string): FoundingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasNoMonolithic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasNoUnsafe = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSolid = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\b(async|await|Promise)\b/.test(content)
  const hasHardened = /\b(const|readonly)\b/.test(content)
  const hasStrong = /\b(function|=>|return)\b/.test(content)
  const hasDurable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnbreakable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic,
    hasRobust, hasTested, hasNoUntested, hasTypeSafe, hasNoUnsafe,
    hasSolid, hasEnduring, hasHardened, hasStrong, hasDurable, hasUnbreakable,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let sovereign: FoundingMeasure['sovereign'] = 'no-strength'
  if (strength >= 90) sovereign = 'true-steel'
  else if (strength >= 75) sovereign = 'battle-tested'
  else if (strength >= 60) sovereign = 'proper-iron'
  else if (strength >= 40) sovereign = 'soft-metal'
  else if (strength >= 20) sovereign = 'tin-foil'

  return {
    strength, sovereign, hasHighStrength,
    hasWellStructured, hasNoChaotic, hasModular, hasNoMonolithic,
    hasRobust, hasTested, hasNoUntested, hasTypeSafe, hasNoUnsafe,
    hasSolid, hasEnduring, hasHardened, hasStrong, hasDurable, hasUnbreakable,
    chaoticCount, untestedCount,
  }
}

/** @example measureCommanding('export class X { readonly y: string }') */
export function measureCommanding(content: string): CommandingMeasure {
  const hasConfident = /\b(class|interface|type)\b/.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDecisive = /\b(import|export)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = !/\bany\b/.test(content)
  const hasWellStructured = /\b(readonly|private|protected)\b/.test(content)
  const hasOrganized = /\b(const|readonly)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasStrong = /\b(try|catch|if)\b/.test(content)
  const hasCommanding = /\b(async|await|Promise)\b/.test(content)
  const hasBold = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasAuthoritative = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPrincipled = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasFirm = /\b(throw|return)\b/.test(content)
  const hasUnambiguous = /\b(readonly|as const)\b/.test(content)
  const weakCount = (content.match(/\b(weak|fragile|flimsy)\b/gi) ?? []).length
  const vagueCount = (content.match(/\b(vague|ambiguous|unclear)\b/gi) ?? []).length

  const positiveBooleans = [
    hasConfident, hasClear, hasDecisive, hasDocumented, hasTyped,
    hasWellStructured, hasOrganized, hasDirect, hasStrong, hasCommanding,
    hasBold, hasAuthoritative, hasPrincipled, hasFirm, hasUnambiguous,
  ]

  const authority = computeScore(positiveBooleans)
  const hasHighAuthority = authority >= 60

  let crown: CommandingMeasure['crown'] = 'no-authority'
  if (authority >= 90) crown = 'imperial-crown'
  else if (authority >= 75) crown = 'royal-diadem'
  else if (authority >= 60) crown = 'proper-circlet'
  else if (authority >= 40) crown = 'wreath'
  else if (authority >= 20) crown = 'party-hat'

  return {
    authority, crown, hasHighAuthority,
    hasConfident, hasClear, hasDecisive, hasDocumented, hasTyped,
    hasWellStructured, hasOrganized, hasDirect, hasStrong, hasCommanding,
    hasBold, hasAuthoritative, hasPrincipled, hasFirm, hasUnambiguous,
    weakCount, vagueCount,
  }
}

/** @example measureSetting('const x: string = ""') */
export function measureSetting(content: string): SettingMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasSharp = !/\bany\b/.test(content)
  const hasCrisp = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDefined = /\b(import|export)\b/.test(content)
  const hasCorrect = /\b(function|=>|return)\b/.test(content)
  const hasFaithful = /\b(try|catch|if)\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCut = /\b(async|await|Promise)\b/.test(content)
  const hasFaceted = /\b(const|readonly)\b/.test(content)
  const hasMasterful = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const roughCount = (content.match(/\b(rough|sloppy|messy)\b/gi) ?? []).length

  const positiveBooleans = [
    hasAccurate, hasNoApproximate, hasExact, hasClean, hasPrecise,
    hasSharp, hasCrisp, hasDefined, hasCorrect, hasFaithful,
    hasRefined, hasPolished, hasCut, hasFaceted, hasMasterful,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let jewel: SettingMeasure['jewel'] = 'no-precision'
  if (precision >= 90) jewel = 'master-cut'
  else if (precision >= 75) jewel = 'expert-set'
  else if (precision >= 60) jewel = 'proper-setting'
  else if (precision >= 40) jewel = 'loose-stone'
  else if (precision >= 20) jewel = 'glass-bead'

  return {
    precision, jewel, hasHighPrecision,
    hasAccurate, hasNoApproximate, hasExact, hasClean, hasPrecise,
    hasSharp, hasCrisp, hasDefined, hasCorrect, hasFaithful,
    hasRefined, hasPolished, hasCut, hasFaceted, hasMasterful,
    approximateCount, roughCount,
  }
}

/** @example measureDefending('try { x } catch { y }') */
export function measureDefending(content: string): DefendingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasReinforced = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\b(async|await|Promise)\b/.test(content)
  const hasSurviving = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPersistent = /\b(class|interface|type)\b/.test(content)
  const hasUnyielding = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasResolute = /\b(import|export)\b/.test(content)
  const hasSteadfast = /\b(function|=>|return)\b/.test(content)
  const hasIndomitable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUnbreakable = /\/\*\*[\s\S]*?\*\//.test(content)
  const vulnerableCount = (content.match(/\b(vulnerable|exposed|defenseless)\b/gi) ?? []).length

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasStable,
    hasHardened, hasReinforced, hasEnduring, hasSurviving, hasPersistent,
    hasUnyielding, hasResolute, hasSteadfast, hasIndomitable, hasUnbreakable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let circlet: DefendingMeasure['circlet'] = 'no-resilience'
  if (resilience >= 90) circlet = 'impervious-ring'
  else if (resilience >= 75) circlet = 'strong-band'
  else if (resilience >= 60) circlet = 'proper-circle'
  else if (resilience >= 40) circlet = 'bent-wire'
  else if (resilience >= 20) circlet = 'broken-loop'

  return {
    resilience, circlet, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasStable,
    hasHardened, hasReinforced, hasEnduring, hasSurviving, hasPersistent,
    hasUnyielding, hasResolute, hasSteadfast, hasIndomitable, hasUnbreakable,
    unhandledCount, vulnerableCount,
  }
}

/** @example measurePersisting('export class X { readonly y: string }') */
export function measurePersisting(content: string): PersistingMeasure {
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(var|eval|any)\b/g) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasEvolved = /\b(import|export)\b/.test(content)
  const hasPreserved = /\b(readonly|private|protected)\b/.test(content)
  const hasSustainable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasFlexible = /\b(function|=>|return)\b/.test(content)
  const hasTimeless = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasLasting = /\b(const|readonly)\b/.test(content)
  const hasPermanent = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEnduring = /\b(try|catch|if)\b/.test(content)
  const hasPerpetual = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImmortal = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasRenewable = !/\bany\b/.test(content)
  const hasUndying = /\b(throw|return)\b/.test(content)
  const stagnantCount = (content.match(/\b(stagnant|rotten|decayed)\b/gi) ?? []).length

  const positiveBooleans = [
    hasMaintainable, hasNoFragile, hasEvolved, hasPreserved, hasSustainable,
    hasAdaptive, hasFlexible, hasTimeless, hasLasting, hasPermanent,
    hasEnduring, hasPerpetual, hasImmortal, hasRenewable, hasUndying,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let reign: PersistingMeasure['reign'] = 'no-endurance'
  if (endurance >= 90) reign = 'eternal-reign'
  else if (endurance >= 75) reign = 'lasting-dynasty'
  else if (endurance >= 60) reign = 'proper-rule'
  else if (endurance >= 40) reign = 'brief-era'
  else if (endurance >= 20) reign = 'one-day-king'

  return {
    endurance, reign, hasHighEndurance,
    hasMaintainable, hasNoFragile, hasEvolved, hasPreserved, hasSustainable,
    hasAdaptive, hasFlexible, hasTimeless, hasLasting, hasPermanent,
    hasEnduring, hasPerpetual, hasImmortal, hasRenewable, hasUndying,
    fragileCount, stagnantCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCrownJewel(content, 'app.ts') */
export function analyzeCrownJewel(content: string, filePath: string): CrownJewel {
  const founding = measureFounding(content)
  const commanding = measureCommanding(content)
  const setting = measureSetting(content)
  const defending = measureDefending(content)
  const persisting = measurePersisting(content)

  const sovereignStrength = founding.strength
  const crownAuthority = commanding.authority
  const jewelPrecision = setting.precision
  const circletResilience = defending.resilience
  const reignEndurance = persisting.endurance

  const qualityScore = Math.round(
    sovereignStrength * 0.2 +
    crownAuthority * 0.2 +
    jewelPrecision * 0.2 +
    circletResilience * 0.2 +
    reignEndurance * 0.2,
  )

  const condition = classifyCrownCondition(qualityScore)

  return {
    file: filePath,
    sovereignStrength, crownAuthority, jewelPrecision, circletResilience, reignEndurance,
    founding, commanding, setting, defending, persisting,
    condition, qualityScore,
  }
}

/** @example analyzeCrownRealm(jewels, 'src') */
export function analyzeCrownRealm(jewels: CrownJewel[], dirPath: string): CrownRealm {
  if (jewels.length === 0) {
    return {
      directory: dirPath, jewels: [],
      avgStrength: 0, avgAuthority: 0, avgEndurance: 0,
      crownMasterpieceCount: 0, voidCount: 0,
      realmType: 'no-realm', condition: 'void',
    }
  }

  const avgStrength = Math.round(jewels.reduce((s, j) => s + j.sovereignStrength, 0) / jewels.length)
  const avgAuthority = Math.round(jewels.reduce((s, j) => s + j.crownAuthority, 0) / jewels.length)
  const avgEndurance = Math.round(jewels.reduce((s, j) => s + j.reignEndurance, 0) / jewels.length)
  const crownMasterpieceCount = jewels.filter((j) => j.condition === 'crown-masterpiece').length
  const voidCount = jewels.filter((j) => j.condition === 'void').length
  const realmType = classifyRealmType(jewels)
  const avgQuality = Math.round(jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length)
  const condition = classifyRealmCondition(avgQuality)

  return {
    directory: dirPath, jewels,
    avgStrength, avgAuthority, avgEndurance,
    crownMasterpieceCount, voidCount,
    realmType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildIronCrownResult(['a.ts'], [content]) */
export async function buildIronCrownResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronCrownResult> {
  const jewels: CrownJewel[] = files.map((file, i) =>
    analyzeCrownJewel(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CrownJewel[]>()
  for (const jewel of jewels) {
    const dir = jewel.file.includes('/')
      ? jewel.file.substring(0, jewel.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(jewel)
    } else {
      dirMap.set(dir, [jewel])
    }
  }

  const realms: CrownRealm[] = Array.from(dirMap.entries()).map(([dir, dirJewels]) =>
    analyzeCrownRealm(dirJewels, dir),
  )

  const avgSovereignStrength = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.sovereignStrength, 0) / jewels.length) : 0
  const avgCrownAuthority = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.crownAuthority, 0) / jewels.length) : 0
  const avgJewelPrecision = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.jewelPrecision, 0) / jewels.length) : 0
  const avgCircletResilience = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.circletResilience, 0) / jewels.length) : 0
  const avgReignEndurance = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.reignEndurance, 0) / jewels.length) : 0

  const overallSovereignty = jewels.length > 0
    ? Math.round(jewels.reduce((s, j) => s + j.qualityScore, 0) / jewels.length) : 0
  const isIron = overallSovereignty >= 60

  const kingdom = { avgStrength: avgSovereignStrength, avgAuthority: avgCrownAuthority, avgEndurance: avgReignEndurance, isIron, overallSovereignty }

  const crownMasterpieceCount = jewels.filter((j) => j.condition === 'crown-masterpiece').length
  const imperialStandardCount = jewels.filter((j) => j.condition === 'imperial-standard').length
  const properCrownCount = jewels.filter((j) => j.condition === 'proper-crown').length
  const bentCircletCount = jewels.filter((j) => j.condition === 'bent-circlet').length
  const rustyRingCount = jewels.filter((j) => j.condition === 'rusty-ring').length
  const voidCount = jewels.filter((j) => j.condition === 'void').length

  const hasHighStrengthCount = jewels.filter((j) => j.founding.hasHighStrength).length
  const hasHighAuthorityCount = jewels.filter((j) => j.commanding.hasHighAuthority).length
  const hasHighPrecisionCount = jewels.filter((j) => j.setting.hasHighPrecision).length
  const hasHighResilienceCount = jewels.filter((j) => j.defending.hasHighResilience).length
  const hasHighEnduranceCount = jewels.filter((j) => j.persisting.hasHighEndurance).length

  const monarchGrade = classifyMonarchGrade(overallSovereignty)

  const bestJewel = jewels.length > 0
    ? jewels.reduce((best, j) => (j.qualityScore > best.qualityScore ? j : best)).file : ''
  const strongest = jewels.length > 0
    ? jewels.reduce((best, j) => (j.sovereignStrength > best.sovereignStrength ? j : best)).file : ''
  const mostAuthoritative = jewels.length > 0
    ? jewels.reduce((best, j) => (j.crownAuthority > best.crownAuthority ? j : best)).file : ''
  const mostPrecise = jewels.length > 0
    ? jewels.reduce((best, j) => (j.jewelPrecision > best.jewelPrecision ? j : best)).file : ''
  const mostResilient = jewels.length > 0
    ? jewels.reduce((best, j) => (j.circletResilience > best.circletResilience ? j : best)).file : ''
  const mostEnduring = jewels.length > 0
    ? jewels.reduce((best, j) => (j.reignEndurance > best.reignEndurance ? j : best)).file : ''

  const stats: IronCrownResult['stats'] = {
    totalFiles: files.length, totalRealms: realms.length,
    avgSovereignStrength, avgCrownAuthority, avgJewelPrecision, avgCircletResilience, avgReignEndurance,
    crownMasterpieceCount, imperialStandardCount, properCrownCount, bentCircletCount, rustyRingCount, voidCount,
    hasHighStrengthCount, hasHighAuthorityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighEnduranceCount,
    overallSovereignty, monarchGrade,
    bestJewel, strongest, mostAuthoritative, mostPrecise, mostResilient, mostEnduring,
  }

  const recommendations = generateRecommendations(jewels, realms, kingdom, stats)

  return { jewels, realms, kingdom, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(jewels, realms, kingdom, stats) */
export function generateRecommendations(
  jewels: CrownJewel[],
  realms: CrownRealm[],
  kingdom: IronCrownResult['kingdom'],
  stats: IronCrownResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgSovereignStrength >= 90 &&
    stats.avgCrownAuthority >= 90 &&
    stats.avgJewelPrecision >= 90 &&
    stats.avgCircletResilience >= 90 &&
    stats.avgReignEndurance >= 90
  ) {
    recs.push(
      'Your iron crown is a masterpiece of sovereignty! Every jewel combines sovereign strength, crown authority, jewel precision, circlet resilience, and reign endurance into a crown worthy of an emperor!',
    )
    return recs
  }

  if (stats.avgSovereignStrength < 60) {
    recs.push(
      'Forge stronger sovereign foundations — an iron crown needs true steel for its band; your code should be well-structured, modular, and battle-tested',
    )
  }

  if (stats.avgCrownAuthority < 60) {
    recs.push(
      'Assert greater crown authority — a crown commands respect by its nature; your code should be confident, clear, decisive, and documented',
    )
  }

  if (stats.avgJewelPrecision < 60) {
    recs.push(
      'Improve jewel precision — each gem in a crown is placed with master-jeweler exactness; your code should be precise, exact, and free of approximation',
    )
  }

  if (stats.avgCircletResilience < 60) {
    recs.push(
      'Strengthen circlet resilience — iron doesn\'t bend, doesn\'t break, doesn\'t tarnish; your code should defend against errors and survive what destroys others',
    )
  }

  if (stats.avgReignEndurance < 60) {
    recs.push(
      'Extend reign endurance — crowns outlive their wearers by centuries; your code should be maintainable, adaptable, and built to last through changing eras',
    )
  }

  if (stats.overallSovereignty < 40) {
    recs.push(
      'The iron crown is rusted through — the steel has weakened and the jewels have fallen; a complete reforging may be needed',
    )
  }

  const voidJewels = jewels.filter((j) => j.condition === 'void')
  if (voidJewels.length > 0 && voidJewels.length <= 5) {
    recs.push(`Reforging needed for these rusty rings: ${voidJewels.map((j) => j.file).join(', ')}`)
  } else if (voidJewels.length > 5) {
    recs.push(`Reforging needed for ${voidJewels.length} rusty rings before the entire treasury is lost`)
  }

  const poorRealms = realms.filter((r) => r.condition === 'void' || r.condition === 'tent')
  if (poorRealms.length === realms.length && realms.length > 0) {
    recs.push('All realms have fallen — the iron crown needs a complete restoration from forge to throne')
  }

  if (recs.length === 0) {
    recs.push('Your iron crown endures — each jewel combines sovereign strength, crown authority, jewel precision, circlet resilience, and reign endurance')
  }

  return recs
}
