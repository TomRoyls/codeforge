// ─── Interfaces ──────────────────────────────────────────

export interface PreservingMeasure {
  power: number
  fossil: 'perfect-preservation' | 'excellent-specimen' | 'proper-amber' | 'cloudy-resin' | 'cracked-stone' | 'no-power'
  hasHighPower: boolean
  hasStable: boolean
  hasNoFragile: boolean
  hasMaintainable: boolean
  hasNoVolatile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasPreserved: boolean
  hasEnduring: boolean
  hasPermanent: boolean
  hasLasting: boolean
  hasTimeless: boolean
  hasConserved: boolean
  hasProtected: boolean
  hasSafeguarded: boolean
  fragileCount: number
  volatileCount: number
}

export interface ShelteringMeasure {
  sanctuary: number
  haven: 'golden-vault' | 'safe-temple' | 'proper-shrine' | 'wooden-shed' | 'exposed-shelf' | 'no-sanctuary'
  hasHighSanctuary: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasSecure: boolean
  hasNoVulnerable: boolean
  hasProtected: boolean
  hasGuarded: boolean
  hasSafe: boolean
  hasSheltered: boolean
  hasFortified: boolean
  hasShielded: boolean
  hasArmored: boolean
  hasImpervious: boolean
  hasInvulnerable: boolean
  unhandledCount: number
  vulnerableCount: number
}

export interface FortifyingMeasure {
  fortitude: number
  hardness: 'diamond-hard-resin' | 'tough-amber' | 'proper-hardness' | 'soft-copal' | 'sticky-sap' | 'no-fortitude'
  hasHighFortitude: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasSolid: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasStrong: boolean
  hasTough: boolean
  hasResilient: boolean
  hasSteadfast: boolean
  hasUnyielding: boolean
  hasFirm: boolean
  hasStalwart: boolean
  chaoticCount: number
  unsafeCount: number
}

export interface RevealingMeasure {
  clarity: number
  transparency: 'crystal-clear' | 'golden-clarity' | 'proper-transparency' | 'cloudy-amber' | 'opaque-stone' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasTransparent: boolean
  hasVisible: boolean
  hasUnderstandable: boolean
  hasObvious: boolean
  hasEvident: boolean
  hasManifest: boolean
  hasApparent: boolean
  hasOpen: boolean
  hasExposed: boolean
  hasRevealed: boolean
  crypticCount: number
  mysteryCount: number
}

export interface KnowingMeasure {
  wisdom: number
  epoch: 'primordial-sage' | 'ancient-scholar' | 'proper-elder' | 'young-student' | 'newborn-fledgling' | 'no-wisdom'
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
  hasVenerable: boolean
  hackedCount: number
  shallowCount: number
}

export type SpecimenCondition =
  | 'amber-masterpiece'
  | 'golden-specimen'
  | 'proper-amber'
  | 'cloudy-resin'
  | 'raw-sap'
  | 'void'

export interface AmberSpecimen {
  file: string
  preservationPower: number
  goldenSanctuary: number
  resinFortitude: number
  amberClarity: number
  ancientWisdom: number
  preserving: PreservingMeasure
  sheltering: ShelteringMeasure
  fortifying: FortifyingMeasure
  revealing: RevealingMeasure
  knowing: KnowingMeasure
  condition: SpecimenCondition
  qualityScore: number
}

export type CollectionType =
  | 'museum-grade'
  | 'collector-set'
  | 'proper-display'
  | 'souvenir-shop'
  | 'empty-case'
  | 'no-collection'

export type CollectionCondition =
  | 'golden-palace'
  | 'amber-vault'
  | 'proper-museum'
  | 'dusty-attic'
  | 'empty-room'
  | 'void'

export interface AmberCollection {
  directory: string
  specimens: AmberSpecimen[]
  avgPower: number
  avgFortitude: number
  avgWisdom: number
  amberMasterpieceCount: number
  voidCount: number
  collectionType: CollectionType
  condition: CollectionCondition
}

export type CuratorGrade = 'master-curator' | 'expert-collector' | 'proper-keeper' | 'apprentice' | 'novice' | 'casual-finder'

export interface AmberSanctumResult {
  specimens: AmberSpecimen[]
  collections: AmberCollection[]
  sanctum: {
    avgPower: number
    avgFortitude: number
    avgWisdom: number
    isAmber: boolean
    overallPreservation: number
  }
  stats: {
    totalFiles: number
    totalCollections: number
    avgPreservationPower: number
    avgGoldenSanctuary: number
    avgResinFortitude: number
    avgAmberClarity: number
    avgAncientWisdom: number
    amberMasterpieceCount: number
    goldenSpecimenCount: number
    properAmberCount: number
    cloudyResinCount: number
    rawSapCount: number
    voidCount: number
    hasHighPowerCount: number
    hasHighSanctuaryCount: number
    hasHighFortitudeCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallPreservation: number
    curatorGrade: CuratorGrade
    bestSpecimen: string
    mostPreserved: string
    safest: string
    toughest: string
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

/** @example classifySpecimenCondition(90) */
export function classifySpecimenCondition(score: number): SpecimenCondition {
  if (score >= 90) return 'amber-masterpiece'
  if (score >= 75) return 'golden-specimen'
  if (score >= 60) return 'proper-amber'
  if (score >= 40) return 'cloudy-resin'
  if (score >= 20) return 'raw-sap'
  return 'void'
}

/** @example classifyCollectionType(specimens) */
export function classifyCollectionType(specimens: AmberSpecimen[]): CollectionType {
  if (specimens.length === 0) return 'no-collection'
  const avg = specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length
  if (avg >= 85) return 'museum-grade'
  if (avg >= 70) return 'collector-set'
  if (avg >= 55) return 'proper-display'
  if (avg >= 35) return 'souvenir-shop'
  return 'empty-case'
}

/** @example classifyCollectionCondition(85) */
export function classifyCollectionCondition(score: number): CollectionCondition {
  if (score >= 85) return 'golden-palace'
  if (score >= 70) return 'amber-vault'
  if (score >= 55) return 'proper-museum'
  if (score >= 35) return 'dusty-attic'
  if (score >= 15) return 'empty-room'
  return 'void'
}

/** @example classifyCuratorGrade(80) */
export function classifyCuratorGrade(avgPreservation: number): CuratorGrade {
  if (avgPreservation >= 80) return 'master-curator'
  if (avgPreservation >= 65) return 'expert-collector'
  if (avgPreservation >= 50) return 'proper-keeper'
  if (avgPreservation >= 35) return 'apprentice'
  if (avgPreservation >= 20) return 'novice'
  return 'casual-finder'
}

// ─── Measure functions ──────────────────────────────────

/** @example measurePreserving('const x: string = "hello"') */
export function measurePreserving(content: string): PreservingMeasure {
  const hasStable = /\b(const|readonly)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|breakable)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|transient|temporary|ephemeral)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\b(hack|workaround|kludge|todo)\b/gi) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasPreserved = /\b(import|export)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPermanent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasLasting = /\b(readonly|private|protected)\b/.test(content)
  const hasTimeless = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasConserved = !/\bany\b/.test(content)
  const hasProtected = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSafeguarded = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasStable, hasNoFragile, hasMaintainable, hasNoVolatile, hasTested,
    hasNoUntested, hasDocumented, hasNoUndocumented, hasPreserved, hasEnduring,
    hasPermanent, hasLasting, hasTimeless, hasConserved, hasProtected, hasSafeguarded,   ]

  const power = computeScore(positiveBooleans)
  const hasHighPower = power >= 60

  let fossil: PreservingMeasure['fossil'] = 'no-power'
  if (power >= 90) fossil = 'perfect-preservation'
  else if (power >= 75) fossil = 'excellent-specimen'
  else if (power >= 60) fossil = 'proper-amber'
  else if (power >= 40) fossil = 'cloudy-resin'
  else if (power >= 20) fossil = 'cracked-stone'

  return {
    power, fossil, hasHighPower,
    hasStable, hasNoFragile, hasMaintainable, hasNoVolatile, hasTested,
    hasNoUntested, hasDocumented, hasNoUndocumented, hasPreserved, hasEnduring,
    hasPermanent, hasLasting, hasTimeless, hasConserved, hasProtected, hasSafeguarded,     fragileCount, volatileCount,
  }
}

/** @example measureSheltering('try { } catch (e) { }') */
export function measureSheltering(content: string): ShelteringMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|unchecked|risky|dangerous)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|===|!==)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSecure = !/\bany\b/.test(content)
  const vulnerableCount = (content.match(/\b(eval|Function|innerHTML|document\.write)\b/g) ?? []).length
  const hasNoVulnerable = vulnerableCount === 0
  const hasProtected = /\b(readonly|private|protected)\b/.test(content)
  const hasGuarded = /\b(try|catch|if)\b/.test(content)
  const hasSafe = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSheltered = /\b(import|export)\b/.test(content)
  const hasFortified = /\b(class|interface|type)\b/.test(content)
  const hasShielded = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasArmored = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasImpervious = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasInvulnerable = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasSecure,
    hasNoVulnerable, hasProtected, hasGuarded, hasSafe, hasSheltered,
    hasFortified, hasShielded, hasArmored, hasImpervious, hasInvulnerable,   ]

  const sanctuary = computeScore(positiveBooleans)
  const hasHighSanctuary = sanctuary >= 60

  let haven: ShelteringMeasure['haven'] = 'no-sanctuary'
  if (sanctuary >= 90) haven = 'golden-vault'
  else if (sanctuary >= 75) haven = 'safe-temple'
  else if (sanctuary >= 60) haven = 'proper-shrine'
  else if (sanctuary >= 40) haven = 'wooden-shed'
  else if (sanctuary >= 20) haven = 'exposed-shelf'

  return {
    sanctuary, haven, hasHighSanctuary,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasSecure,
    hasNoVulnerable, hasProtected, hasGuarded, hasSafe, hasSheltered,
    hasFortified, hasShielded, hasArmored, hasImpervious, hasInvulnerable,     unhandledCount, vulnerableCount,
  }
}

/** @example measureFortifying('export class X { readonly y: string }') */
export function measureFortifying(content: string): FortifyingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasSolid = /\b(import|export)\b/.test(content)
  const hasDurable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasReinforced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrong = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTough = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasResilient = /\b(try|catch|if)\b/.test(content)
  const hasSteadfast = /\b(async|await|Promise)\b/.test(content)
  const hasUnyielding = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFirm = /\b(const|readonly)\b/.test(content)
  const hasStalwart = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasSolid,
    hasDurable, hasHardened, hasReinforced, hasStrong, hasTough,
    hasResilient, hasSteadfast, hasUnyielding, hasFirm, hasStalwart,
  ]

  const fortitude = computeScore(positiveBooleans)
  const hasHighFortitude = fortitude >= 60

  let hardness: FortifyingMeasure['hardness'] = 'no-fortitude'
  if (fortitude >= 90) hardness = 'diamond-hard-resin'
  else if (fortitude >= 75) hardness = 'tough-amber'
  else if (fortitude >= 60) hardness = 'proper-hardness'
  else if (fortitude >= 40) hardness = 'soft-copal'
  else if (fortitude >= 20) hardness = 'sticky-sap'

  return {
    fortitude, hardness, hasHighFortitude,
    hasWellStructured, hasNoChaotic, hasTypeSafe, hasNoUnsafe, hasSolid,
    hasDurable, hasHardened, hasReinforced, hasStrong, hasTough,
    hasResilient, hasSteadfast, hasUnyielding, hasFirm, hasStalwart,
    chaoticCount, unsafeCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(import|export)\b/.test(content)
  const mysteryCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnderstandable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasObvious = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEvident = !/\bany\b/.test(content)
  const hasManifest = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasApparent = /\b(async|await|Promise)\b/.test(content)
  const hasOpen = (content.match(/\b(ugly|clunky|crude)\b/gi) ?? []).length === 0
  const hasExposed = /\b(try|catch|if)\b/.test(content)
  const hasRevealed = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasVisible, hasUnderstandable, hasObvious, hasEvident,
    hasManifest, hasApparent, hasOpen, hasExposed, hasRevealed,   ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let transparency: RevealingMeasure['transparency'] = 'no-clarity'
  if (clarity >= 90) transparency = 'crystal-clear'
  else if (clarity >= 75) transparency = 'golden-clarity'
  else if (clarity >= 60) transparency = 'proper-transparency'
  else if (clarity >= 40) transparency = 'cloudy-amber'
  else if (clarity >= 20) transparency = 'opaque-stone'

  return {
    clarity, transparency, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasVisible, hasUnderstandable, hasObvious, hasEvident,
    hasManifest, hasApparent, hasOpen, hasExposed, hasRevealed,     crypticCount, mysteryCount,
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
  const hasTimeless = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasVenerable = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTimeless, hasWise, hasVenerable,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let epoch: KnowingMeasure['epoch'] = 'no-wisdom'
  if (wisdom >= 90) epoch = 'primordial-sage'
  else if (wisdom >= 75) epoch = 'ancient-scholar'
  else if (wisdom >= 60) epoch = 'proper-elder'
  else if (wisdom >= 40) epoch = 'young-student'
  else if (wisdom >= 20) epoch = 'newborn-fledgling'

  return {
    wisdom, epoch, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTimeless, hasWise, hasVenerable,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAmberSpecimen(content, 'app.ts') */
export function analyzeAmberSpecimen(content: string, filePath: string): AmberSpecimen {
  const preserving = measurePreserving(content)
  const sheltering = measureSheltering(content)
  const fortifying = measureFortifying(content)
  const revealing = measureRevealing(content)
  const knowing = measureKnowing(content)

  const preservationPower = preserving.power
  const goldenSanctuary = sheltering.sanctuary
  const resinFortitude = fortifying.fortitude
  const amberClarity = revealing.clarity
  const ancientWisdom = knowing.wisdom

  const qualityScore = Math.round(
    preservationPower * 0.2 +
    goldenSanctuary * 0.2 +
    resinFortitude * 0.2 +
    amberClarity * 0.2 +
    ancientWisdom * 0.2,
  )

  const condition = classifySpecimenCondition(qualityScore)

  return {
    file: filePath,
    preservationPower, goldenSanctuary, resinFortitude, amberClarity, ancientWisdom,
    preserving, sheltering, fortifying, revealing, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeAmberCollection(specimens, 'src') */
export function analyzeAmberCollection(specimens: AmberSpecimen[], dirPath: string): AmberCollection {
  if (specimens.length === 0) {
    return {
      directory: dirPath, specimens: [],
      avgPower: 0, avgFortitude: 0, avgWisdom: 0,
      amberMasterpieceCount: 0, voidCount: 0,
      collectionType: 'no-collection', condition: 'void',
    }
  }

  const avgPower = Math.round(specimens.reduce((s, sp) => s + sp.preservationPower, 0) / specimens.length)
  const avgFortitude = Math.round(specimens.reduce((s, sp) => s + sp.resinFortitude, 0) / specimens.length)
  const avgWisdom = Math.round(specimens.reduce((s, sp) => s + sp.ancientWisdom, 0) / specimens.length)
  const amberMasterpieceCount = specimens.filter((sp) => sp.condition === 'amber-masterpiece').length
  const voidCount = specimens.filter((sp) => sp.condition === 'void').length
  const collectionType = classifyCollectionType(specimens)
  const avgQuality = Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length)
  const condition = classifyCollectionCondition(avgQuality)

  return {
    directory: dirPath, specimens,
    avgPower, avgFortitude, avgWisdom,
    amberMasterpieceCount, voidCount,
    collectionType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAmberSanctumResult(['a.ts'], [content]) */
export async function buildAmberSanctumResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberSanctumResult> {
  const specimens: AmberSpecimen[] = files.map((file, i) =>
    analyzeAmberSpecimen(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberSpecimen[]>()
  for (const specimen of specimens) {
    const dir = specimen.file.includes('/')
      ? specimen.file.substring(0, specimen.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(specimen)
    } else {
      dirMap.set(dir, [specimen])
    }
  }

  const collections: AmberCollection[] = Array.from(dirMap.entries()).map(([dir, dirSpecimens]) =>
    analyzeAmberCollection(dirSpecimens, dir),
  )

  const avgPreservationPower = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.preservationPower, 0) / specimens.length) : 0
  const avgGoldenSanctuary = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.goldenSanctuary, 0) / specimens.length) : 0
  const avgResinFortitude = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.resinFortitude, 0) / specimens.length) : 0
  const avgAmberClarity = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.amberClarity, 0) / specimens.length) : 0
  const avgAncientWisdom = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.ancientWisdom, 0) / specimens.length) : 0

  const overallPreservation = specimens.length > 0
    ? Math.round(specimens.reduce((s, sp) => s + sp.qualityScore, 0) / specimens.length) : 0
  const isAmber = overallPreservation >= 60

  const sanctum: AmberSanctumResult['sanctum'] = {
    avgPower: avgPreservationPower, avgFortitude: avgResinFortitude, avgWisdom: avgAncientWisdom,
    isAmber, overallPreservation,
  }

  const amberMasterpieceCount = specimens.filter((sp) => sp.condition === 'amber-masterpiece').length
  const goldenSpecimenCount = specimens.filter((sp) => sp.condition === 'golden-specimen').length
  const properAmberCount = specimens.filter((sp) => sp.condition === 'proper-amber').length
  const cloudyResinCount = specimens.filter((sp) => sp.condition === 'cloudy-resin').length
  const rawSapCount = specimens.filter((sp) => sp.condition === 'raw-sap').length
  const voidCount = specimens.filter((sp) => sp.condition === 'void').length

  const hasHighPowerCount = specimens.filter((sp) => sp.preserving.hasHighPower).length
  const hasHighSanctuaryCount = specimens.filter((sp) => sp.sheltering.hasHighSanctuary).length
  const hasHighFortitudeCount = specimens.filter((sp) => sp.fortifying.hasHighFortitude).length
  const hasHighClarityCount = specimens.filter((sp) => sp.revealing.hasHighClarity).length
  const hasHighWisdomCount = specimens.filter((sp) => sp.knowing.hasHighWisdom).length

  const curatorGrade = classifyCuratorGrade(overallPreservation)

  const bestSpecimen = specimens.length > 0
    ? specimens.reduce((best, sp) => (sp.qualityScore > best.qualityScore ? sp : best)).file : ''
  const mostPreserved = specimens.length > 0
    ? specimens.reduce((best, sp) => (sp.preservationPower > best.preservationPower ? sp : best)).file : ''
  const safest = specimens.length > 0
    ? specimens.reduce((best, sp) => (sp.goldenSanctuary > best.goldenSanctuary ? sp : best)).file : ''
  const toughest = specimens.length > 0
    ? specimens.reduce((best, sp) => (sp.resinFortitude > best.resinFortitude ? sp : best)).file : ''
  const clearest = specimens.length > 0
    ? specimens.reduce((best, sp) => (sp.amberClarity > best.amberClarity ? sp : best)).file : ''
  const wisest = specimens.length > 0
    ? specimens.reduce((best, sp) => (sp.ancientWisdom > best.ancientWisdom ? sp : best)).file : ''

  const stats: AmberSanctumResult['stats'] = {
    totalFiles: files.length, totalCollections: collections.length,
    avgPreservationPower, avgGoldenSanctuary, avgResinFortitude, avgAmberClarity, avgAncientWisdom,
    amberMasterpieceCount, goldenSpecimenCount, properAmberCount, cloudyResinCount, rawSapCount, voidCount,
    hasHighPowerCount, hasHighSanctuaryCount, hasHighFortitudeCount, hasHighClarityCount, hasHighWisdomCount,
    overallPreservation, curatorGrade,
    bestSpecimen, mostPreserved, safest, toughest, clearest, wisest,
  }

  const recommendations = generateRecommendations(specimens, collections, sanctum, stats)

  return {
    specimens, collections, sanctum, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(specimens, collections, sanctum, stats) */
export function generateRecommendations(
  specimens: AmberSpecimen[],
  collections: AmberCollection[],
  _sanctum: AmberSanctumResult['sanctum'],
  stats: AmberSanctumResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPreservationPower >= 90 &&
    stats.avgGoldenSanctuary >= 90 &&
    stats.avgResinFortitude >= 90 &&
    stats.avgAmberClarity >= 90 &&
    stats.avgAncientWisdom >= 90
  ) {
    recs.push(
      'Your amber sanctum achieves perfect preservation! The power is eternal, the sanctuary golden, the fortitude diamond-hard, the clarity crystal, and the wisdom primordial!',
    )
    return recs
  }

  if (stats.avgPreservationPower < 60) {
    recs.push(
      'Strengthen preservation power — amber must preserve for eternity; your code needs stable patterns, thorough testing, and lasting documentation',
    )
  }

  if (stats.avgGoldenSanctuary < 60) {
    recs.push(
      'Fortify the golden sanctuary — the amber sanctum must be a safe haven; your code needs error handling, defensive patterns, and secure boundaries'
    )
  }

  if (stats.avgResinFortitude < 60) {
    recs.push(
      'Harden resin fortitude — amber resin must be tough and resilient; your code needs stronger types, cleaner structure, and more robust patterns'
    )
  }

  if (stats.avgAmberClarity < 60) {
    recs.push(
      'Polish amber clarity — the golden medium must reveal everything inside; your code needs clearer naming, better documentation, and more transparent logic'
    )
  }

  if (stats.avgAncientWisdom < 60) {
    recs.push(
      'Deepen ancient wisdom — the amber sanctum holds primordial knowledge; your code needs principled architecture, proven patterns, and deep understanding'
    )
  }

  if (stats.overallPreservation < 40) {
    recs.push(
      'The amber sanctum crumbles — raw sap and cloudy resin outnumber the precious specimens, and the collection lies in ruins'
    )
  }

  const voidSpecimens = specimens.filter((sp) => sp.condition === 'void')
  if (voidSpecimens.length > 0 && voidSpecimens.length <= 5) {
    recs.push(`Preserve these raw specimens: ${voidSpecimens.map((sp) => sp.file).join(', ')}`)
  } else if (voidSpecimens.length > 5) {
    recs.push(`Preserve ${voidSpecimens.length} raw specimens before the sanctum collapses`)
  }

  const poorCollections = collections.filter((c) => c.condition === 'void' || c.condition === 'empty-room')
  if (poorCollections.length === collections.length && collections.length > 0) {
    recs.push('All collections are empty rooms — the amber sanctum needs complete restoration with museum-grade specimens')
  }

  if (recs.length === 0) {
    recs.push('Your amber sanctum preserves with eternal clarity — every specimen embodies power, sanctuary, fortitude, clarity, and ancient wisdom')
  }

  return recs
}
