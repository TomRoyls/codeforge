// ─── Interfaces ──────────────────────────────────────────

export interface SecuringMeasure {
  vault: number
  treasury: 'impregnable-vault' | 'secure-chamber' | 'proper-safe' | 'wooden-chest' | 'open-shelf' | 'no-vault'
  hasHighVault: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasDurable: boolean
  hasSecure: boolean
  hasProtected: boolean
  hasGuarded: boolean
  hasShielded: boolean
  hasFortified: boolean
  hasImpervious: boolean
  hasImpregnable: boolean
  unhandledCount: number
  untestedCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  nebula: 'eagle-nebula' | 'orion-clarity' | 'proper-cloud' | 'dark-nebula' | 'empty-void' | 'no-clarity'
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
  hasIlluminated: boolean
  hasExposed: boolean
  hasObvious: boolean
  hasManifest: boolean
  crypticCount: number
  mysteryCount: number
}

export interface ConnectingMeasure {
  precision: number
  pattern: 'grand-constellation' | 'star-chain' | 'proper-pattern' | 'scattered-stars' | 'random-dots' | 'no-precision'
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
  hasConnected: boolean
  hasCoherent: boolean
  hasOrganized: boolean
  hasAligned: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SurvivingMeasure {
  resilience: number
  remnant: 'neutron-star' | 'black-dwarf' | 'proper-remnant' | 'cooling-ember' | 'disrupted-dust' | 'no-resilience'
  hasHighResilience: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasTough: boolean
  hasStrong: boolean
  hasResilient: boolean
  hasIndestructible: boolean
  hasUnbreakable: boolean
  hasUnyielding: boolean
  hasImplacable: boolean
  hasRelentless: boolean
  hasIndomitable: boolean
  hasUnconquerable: boolean
  chaoticCount: number
  fragileCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  cosmos: 'cosmic-sage' | 'star-oracle' | 'proper-astronomer' | 'sky-watcher' | 'lost-traveler' | 'no-wisdom'
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
  hasTranscendent: boolean
  hasWise: boolean
  hasOmniscient: boolean
  hackedCount: number
  shallowCount: number
}

export type CosmicCondition =
  | 'cosmic-masterpiece'
  | 'stellar-gem'
  | 'proper-star'
  | 'dim-ember'
  | 'dark-void'
  | 'void'

export interface CosmicArtifact {
  file: string
  stellarVault: number
  nebulaClarity: number
  constellationPrecision: number
  supernovaResilience: number
  cosmicWisdom: number
  securing: SecuringMeasure
  illuminating: IlluminatingMeasure
  connecting: ConnectingMeasure
  surviving: SurvivingMeasure
  understanding: UnderstandingMeasure
  condition: CosmicCondition
  qualityScore: number
}

export type ChamberType =
  | 'grand-treasury'
  | 'stellar-vault'
  | 'proper-chamber'
  | 'storage-room'
  | 'empty-closet'
  | 'no-chamber'

export type ChamberCondition =
  | 'cosmic-palace'
  | 'star-fortress'
  | 'proper-vault'
  | 'stone-cellar'
  | 'dusty-attic'
  | 'void'

export type CuratorGrade = 'cosmic-curator' | 'stellar-archivist' | 'proper-keeper' | 'apprentice' | 'novice' | 'dusty-librarian'

export interface CosmicChamber {
  directory: string
  artifacts: CosmicArtifact[]
  avgVault: number
  avgPrecision: number
  avgWisdom: number
  cosmicMasterpieceCount: number
  voidCount: number
  chamberType: ChamberType
  condition: ChamberCondition
}

export interface CosmicTreasuryResult {
  artifacts: CosmicArtifact[]
  chambers: CosmicChamber[]
  universe: {
    avgVault: number
    avgPrecision: number
    avgWisdom: number
    isCosmic: boolean
    overallBrilliance: number
    celebration?: string
  }
  stats: {
    totalFiles: number
    totalChambers: number
    avgStellarVault: number
    avgNebulaClarity: number
    avgConstellationPrecision: number
    avgSupernovaResilience: number
    avgCosmicWisdom: number
    cosmicMasterpieceCount: number
    stellarGemCount: number
    properStarCount: number
    dimEmberCount: number
    darkVoidCount: number
    voidCount: number
    hasHighVaultCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallBrilliance: number
    curatorGrade: CuratorGrade
    bestArtifact: string
    mostSecure: string
    clearest: string
    mostPrecise: string
    mostResilient: string
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

/** @example classifyCosmicCondition(90) */
export function classifyCosmicCondition(score: number): CosmicCondition {
  if (score >= 90) return 'cosmic-masterpiece'
  if (score >= 75) return 'stellar-gem'
  if (score >= 60) return 'proper-star'
  if (score >= 40) return 'dim-ember'
  if (score >= 20) return 'dark-void'
  return 'void'
}

/** @example classifyChamberType(artifacts) */
export function classifyChamberType(artifacts: CosmicArtifact[]): ChamberType {
  if (artifacts.length === 0) return 'no-chamber'
  const avg = artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length
  if (avg >= 85) return 'grand-treasury'
  if (avg >= 70) return 'stellar-vault'
  if (avg >= 55) return 'proper-chamber'
  if (avg >= 35) return 'storage-room'
  return 'empty-closet'
}

/** @example classifyChamberCondition(85) */
export function classifyChamberCondition(score: number): ChamberCondition {
  if (score >= 85) return 'cosmic-palace'
  if (score >= 70) return 'star-fortress'
  if (score >= 55) return 'proper-vault'
  if (score >= 35) return 'stone-cellar'
  if (score >= 15) return 'dusty-attic'
  return 'void'
}

/** @example classifyCuratorGrade(80) */
export function classifyCuratorGrade(avgBrilliance: number): CuratorGrade {
  if (avgBrilliance >= 80) return 'cosmic-curator'
  if (avgBrilliance >= 65) return 'stellar-archivist'
  if (avgBrilliance >= 50) return 'proper-keeper'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'dusty-librarian'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureSecuring('export class X { readonly y: string }') */
export function measureSecuring(content: string): SecuringMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /\b(if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasSecure = /\b(readonly|private|protected)\b/.test(content)
  const hasProtected = !/\bany\b/.test(content)
  const hasGuarded = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasShielded = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasFortified = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasImpervious = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImpregnable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasSecure, hasProtected,
    hasGuarded, hasShielded, hasFortified, hasImpervious, hasImpregnable,
  ]

  const vault = computeScore(positiveBooleans)
  const hasHighVault = vault >= 60

  let treasury: SecuringMeasure['treasury'] = 'no-vault'
  if (vault >= 90) treasury = 'impregnable-vault'
  else if (vault >= 75) treasury = 'secure-chamber'
  else if (vault >= 60) treasury = 'proper-safe'
  else if (vault >= 40) treasury = 'wooden-chest'
  else if (vault >= 20) treasury = 'open-shelf'

  return {
    vault, treasury, hasHighVault,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasSecure, hasProtected,
    hasGuarded, hasShielded, hasFortified, hasImpervious, hasImpregnable,
    unhandledCount, untestedCount,
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
  const hasClear = !/\bany\b/.test(content)
  const hasTransparent = /\b(import|export)\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDirect = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasOpen = /\b(function|=>|return)\b/.test(content)
  const hasRevealed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasIlluminated = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasExposed = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasObvious = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasManifest = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasIlluminated, hasExposed, hasObvious, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let nebula: IlluminatingMeasure['nebula'] = 'no-clarity'
  if (clarity >= 90) nebula = 'eagle-nebula'
  else if (clarity >= 75) nebula = 'orion-clarity'
  else if (clarity >= 60) nebula = 'proper-cloud'
  else if (clarity >= 40) nebula = 'dark-nebula'
  else if (clarity >= 20) nebula = 'empty-void'

  return {
    clarity, nebula, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasIlluminated, hasExposed, hasObvious, hasManifest,
    crypticCount, mysteryCount,
  }
}

/** @example measureConnecting('export class X { readonly y: string }') */
export function measureConnecting(content: string): ConnectingMeasure {
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
  const hasConnected = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCoherent = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasOrganized = /\b(try|catch|if)\b/.test(content)
  const hasAligned = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasConnected, hasCoherent, hasOrganized, hasAligned,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let pattern: ConnectingMeasure['pattern'] = 'no-precision'
  if (precision >= 90) pattern = 'grand-constellation'
  else if (precision >= 75) pattern = 'star-chain'
  else if (precision >= 60) pattern = 'proper-pattern'
  else if (precision >= 40) pattern = 'scattered-stars'
  else if (precision >= 20) pattern = 'random-dots'

  return {
    precision, pattern, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasConnected, hasCoherent, hasOrganized, hasAligned,
    unsafeCount, approximateCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disordered|jumbled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasHardened = /\b(import|export)\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTough = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrong = !/\bany\b/.test(content)
  const hasResilient = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasIndestructible = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnbreakable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnyielding = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasImplacable = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasRelentless = /\b(try|catch|if)\b/.test(content)
  const hasIndomitable = /\b(async|await|Promise)\b/.test(content)
  const hasUnconquerable = /\b(function|=>|return)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|flimsy)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasHardened, hasEnduring, hasDurable,
    hasTough, hasStrong, hasResilient, hasIndestructible, hasUnbreakable,
    hasUnyielding, hasImplacable, hasRelentless, hasIndomitable, hasUnconquerable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let remnant: SurvivingMeasure['remnant'] = 'no-resilience'
  if (resilience >= 90) remnant = 'neutron-star'
  else if (resilience >= 75) remnant = 'black-dwarf'
  else if (resilience >= 60) remnant = 'proper-remnant'
  else if (resilience >= 40) remnant = 'cooling-ember'
  else if (resilience >= 20) remnant = 'disrupted-dust'

  return {
    resilience, remnant, hasHighResilience,
    hasWellStructured, hasNoChaotic, hasHardened, hasEnduring, hasDurable,
    hasTough, hasStrong, hasResilient, hasIndestructible, hasUnbreakable,
    hasUnyielding, hasImplacable, hasRelentless, hasIndomitable, hasUnconquerable,
    chaoticCount, fragileCount,
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
  const hasTranscendent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasOmniscient = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let cosmos: UnderstandingMeasure['cosmos'] = 'no-wisdom'
  if (wisdom >= 90) cosmos = 'cosmic-sage'
  else if (wisdom >= 75) cosmos = 'star-oracle'
  else if (wisdom >= 60) cosmos = 'proper-astronomer'
  else if (wisdom >= 40) cosmos = 'sky-watcher'
  else if (wisdom >= 20) cosmos = 'lost-traveler'

  return {
    wisdom, cosmos, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasTranscendent, hasWise, hasOmniscient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCosmicArtifact(content, 'app.ts') */
export function analyzeCosmicArtifact(content: string, filePath: string): CosmicArtifact {
  const securing = measureSecuring(content)
  const illuminating = measureIlluminating(content)
  const connecting = measureConnecting(content)
  const surviving = measureSurviving(content)
  const understanding = measureUnderstanding(content)

  const stellarVault = securing.vault
  const nebulaClarity = illuminating.clarity
  const constellationPrecision = connecting.precision
  const supernovaResilience = surviving.resilience
  const cosmicWisdom = understanding.wisdom

  const qualityScore = Math.round(
    stellarVault * 0.2 +
    nebulaClarity * 0.2 +
    constellationPrecision * 0.2 +
    supernovaResilience * 0.2 +
    cosmicWisdom * 0.2,
  )

  const condition = classifyCosmicCondition(qualityScore)

  return {
    file: filePath,
    stellarVault, nebulaClarity, constellationPrecision, supernovaResilience, cosmicWisdom,
    securing, illuminating, connecting, surviving, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeCosmicChamber(artifacts, 'src') */
export function analyzeCosmicChamber(artifacts: CosmicArtifact[], dirPath: string): CosmicChamber {
  if (artifacts.length === 0) {
    return {
      directory: dirPath, artifacts: [],
      avgVault: 0, avgPrecision: 0, avgWisdom: 0,
      cosmicMasterpieceCount: 0, voidCount: 0,
      chamberType: 'no-chamber', condition: 'void',
    }
  }

  const avgVault = Math.round(artifacts.reduce((s, a) => s + a.stellarVault, 0) / artifacts.length)
  const avgPrecision = Math.round(artifacts.reduce((s, a) => s + a.constellationPrecision, 0) / artifacts.length)
  const avgWisdom = Math.round(artifacts.reduce((s, a) => s + a.cosmicWisdom, 0) / artifacts.length)
  const cosmicMasterpieceCount = artifacts.filter((a) => a.condition === 'cosmic-masterpiece').length
  const voidCount = artifacts.filter((a) => a.condition === 'void').length
  const chamberType = classifyChamberType(artifacts)
  const avgQuality = Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length)
  const condition = classifyChamberCondition(avgQuality)

  return {
    directory: dirPath, artifacts,
    avgVault, avgPrecision, avgWisdom,
    cosmicMasterpieceCount, voidCount,
    chamberType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

const CELEBRATION_MESSAGE = 'Command #640 — Cosmic Treasury milestone achieved! 640 commands preserved in the eternal stellar vault!'

/** @example buildCosmicTreasuryResult(['a.ts'], [content]) */
export async function buildCosmicTreasuryResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CosmicTreasuryResult> {
  const artifacts: CosmicArtifact[] = files.map((file, i) =>
    analyzeCosmicArtifact(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CosmicArtifact[]>()
  for (const artifact of artifacts) {
    const dir = artifact.file.includes('/')
      ? artifact.file.substring(0, artifact.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(artifact)
    } else {
      dirMap.set(dir, [artifact])
    }
  }

  const chambers: CosmicChamber[] = Array.from(dirMap.entries()).map(([dir, dirArtifacts]) =>
    analyzeCosmicChamber(dirArtifacts, dir),
  )

  const avgStellarVault = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.stellarVault, 0) / artifacts.length) : 0
  const avgNebulaClarity = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.nebulaClarity, 0) / artifacts.length) : 0
  const avgConstellationPrecision = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.constellationPrecision, 0) / artifacts.length) : 0
  const avgSupernovaResilience = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.supernovaResilience, 0) / artifacts.length) : 0
  const avgCosmicWisdom = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.cosmicWisdom, 0) / artifacts.length) : 0

  const overallBrilliance = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length) : 0
  const isCosmic = overallBrilliance >= 60

  const hasSelfReference = files.some((f) => f.includes('cosmic-treasury'))

  const universe: CosmicTreasuryResult['universe'] = {
    avgVault: avgStellarVault, avgPrecision: avgConstellationPrecision, avgWisdom: avgCosmicWisdom,
    isCosmic, overallBrilliance,
    celebration: hasSelfReference ? CELEBRATION_MESSAGE : undefined,
  }

  const cosmicMasterpieceCount = artifacts.filter((a) => a.condition === 'cosmic-masterpiece').length
  const stellarGemCount = artifacts.filter((a) => a.condition === 'stellar-gem').length
  const properStarCount = artifacts.filter((a) => a.condition === 'proper-star').length
  const dimEmberCount = artifacts.filter((a) => a.condition === 'dim-ember').length
  const darkVoidCount = artifacts.filter((a) => a.condition === 'dark-void').length
  const voidCount = artifacts.filter((a) => a.condition === 'void').length

  const hasHighVaultCount = artifacts.filter((a) => a.securing.hasHighVault).length
  const hasHighClarityCount = artifacts.filter((a) => a.illuminating.hasHighClarity).length
  const hasHighPrecisionCount = artifacts.filter((a) => a.connecting.hasHighPrecision).length
  const hasHighResilienceCount = artifacts.filter((a) => a.surviving.hasHighResilience).length
  const hasHighWisdomCount = artifacts.filter((a) => a.understanding.hasHighWisdom).length

  const curatorGrade = classifyCuratorGrade(overallBrilliance)

  const bestArtifact = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.qualityScore > best.qualityScore ? a : best)).file : ''
  const mostSecure = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.stellarVault > best.stellarVault ? a : best)).file : ''
  const clearest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.nebulaClarity > best.nebulaClarity ? a : best)).file : ''
  const mostPrecise = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.constellationPrecision > best.constellationPrecision ? a : best)).file : ''
  const mostResilient = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.supernovaResilience > best.supernovaResilience ? a : best)).file : ''
  const wisest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.cosmicWisdom > best.cosmicWisdom ? a : best)).file : ''

  const stats: CosmicTreasuryResult['stats'] = {
    totalFiles: files.length, totalChambers: chambers.length,
    avgStellarVault, avgNebulaClarity, avgConstellationPrecision, avgSupernovaResilience, avgCosmicWisdom,
    cosmicMasterpieceCount, stellarGemCount, properStarCount, dimEmberCount, darkVoidCount, voidCount,
    hasHighVaultCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallBrilliance, curatorGrade,
    bestArtifact, mostSecure, clearest, mostPrecise, mostResilient, wisest,
    celebration: hasSelfReference ? CELEBRATION_MESSAGE : undefined,
  }

  const recommendations = generateRecommendations(artifacts, chambers, universe, stats)

  return {
    artifacts, chambers, universe, stats, recommendations,
    celebration: hasSelfReference ? CELEBRATION_MESSAGE : undefined,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(artifacts, chambers, universe, stats) */
export function generateRecommendations(
  artifacts: CosmicArtifact[],
  chambers: CosmicChamber[],
  universe: CosmicTreasuryResult['universe'],
  stats: CosmicTreasuryResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgStellarVault >= 90 &&
    stats.avgNebulaClarity >= 90 &&
    stats.avgConstellationPrecision >= 90 &&
    stats.avgSupernovaResilience >= 90 &&
    stats.avgCosmicWisdom >= 90
  ) {
    recs.push(
      'Your cosmic treasury is impregnable! Stellar vault is impregnable-vault, nebula clarity is eagle-nebula, constellation precision is grand-constellation, supernova resilience is neutron-star, and cosmic wisdom is cosmic-sage!',
    )
    return recs
  }

  if (stats.avgStellarVault < 60) {
    recs.push(
      'Fortify the stellar vault — the cosmic treasury must be secured; add error handling, test thoroughly, and build impregnable-vault defenses'
    )
  }

  if (stats.avgNebulaClarity < 60) {
    recs.push(
      'Illuminate the nebula clarity — the cosmic artifacts must shine through; eliminate cryptic patterns, document thoroughly, and achieve eagle-nebula transparency'
    )
  }

  if (stats.avgConstellationPrecision < 60) {
    recs.push(
      'Connect constellation precision — the stars must align; tighten types, eliminate unsafe patterns, and form grand-constellation patterns'
    )
  }

  if (stats.avgSupernovaResilience < 60) {
    recs.push(
      'Strengthen supernova resilience — the code must survive cosmic explosions; build neutron-star endurance, eliminate chaos, and forge indestructible artifacts'
    )
  }

  if (stats.avgCosmicWisdom < 60) {
    recs.push(
      'Deepen cosmic wisdom — the curator must understand the universe; build with principled architecture, proven patterns, and cosmic-sage insight'
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The treasury is shrouded in darkness — dim embers and dark voids outnumber the cosmic masterpieces, and no light escapes'
    )
  }

  const voidArtifacts = artifacts.filter((a) => a.condition === 'void')
  if (voidArtifacts.length > 0 && voidArtifacts.length <= 5) {
    recs.push(`Remove these dark voids from the treasury: ${voidArtifacts.map((a) => a.file).join(', ')}`)
  } else if (voidArtifacts.length > 5) {
    recs.push(`Remove ${voidArtifacts.length} dark voids from the treasury before the last light fades completely`)
  }

  const poorChambers = chambers.filter((c) => c.condition === 'void' || c.condition === 'dusty-attic')
  if (poorChambers.length === chambers.length && chambers.length > 0) {
    recs.push('All chambers are dusty attics — the cosmic treasury needs cosmic-palace quality artifacts throughout')
  }

  if (recs.length === 0) {
    recs.push('Your cosmic treasury shines with universal perfection — every artifact carries stellar vault, nebula clarity, constellation precision, supernova resilience, and cosmic wisdom')
  }

  return recs
}
