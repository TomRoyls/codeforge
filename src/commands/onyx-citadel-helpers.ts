// ─── Interfaces ──────────────────────────────────────────

export interface IlluminatingMeasure {
  clarity: number
  vision: 'dark-sight' | 'night-vision' | 'proper-glimmer' | 'dim-shadow' | 'total-darkness' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasTransparent: boolean
  hasNoObfuscated: boolean
  hasUnderstandable: boolean
  hasSelfDocumenting: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasUnhidden: boolean
  hasManifest: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface FortifyingMeasure {
  strength: number
  wall: 'impregnable' | 'strong-fortress' | 'proper-wall' | 'wooden-palisade' | 'paper-fence' | 'no-strength'
  hasHighStrength: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasSecure: boolean
  hasFortified: boolean
  hasHardened: boolean
  hasReinforced: boolean
  hasShielded: boolean
  hasProtected: boolean
  hasGuarded: boolean
  hasArmored: boolean
  hasImpervious: boolean
  unhandledCount: number
  untestedCount: number
}

export interface CuttingMeasure {
  precision: number
  edge: 'razor-edge' | 'sharp-blade' | 'proper-knife' | 'dull-edge' | 'blunt-club' | 'no-precision'
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
  hasKeen: boolean
  hasIncisive: boolean
  hasPiercing: boolean
  hasSurgical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface SurvivingMeasure {
  resilience: number
  shadow: 'eternal-night' | 'dark-endurance' | 'proper-survival' | 'fading-light' | 'crumbling-dark' | 'no-resilience'
  hasHighResilience: boolean
  hasStable: boolean
  hasNoFragile: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasPersistent: boolean
  hasSteadfast: boolean
  hasResilient: boolean
  hasTough: boolean
  hasHardy: boolean
  hasUnyielding: boolean
  hasIndomitable: boolean
  hasUnshakable: boolean
  hasImplacable: boolean
  hasRelentless: boolean
  fragileCount: number
  unstableCount: number
}

export interface KnowingMeasure {
  wisdom: number
  hour: 'witching-sage' | 'night-scholar' | 'proper-watcher' | 'sleepy-guard' | 'blind-owl' | 'no-wisdom'
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
  hasPerceptive: boolean
  hasWise: boolean
  hasOmniscient: boolean
  hackedCount: number
  shallowCount: number
}

export type BlockCondition =
  | 'onyx-masterpiece'
  | 'dark-gem'
  | 'proper-onyx'
  | 'gray-stone'
  | 'white-rock'
  | 'void'

export interface OnyxBlock {
  file: string
  obsidianClarity: number
  darkFortress: number
  bladePrecision: number
  shadowResilience: number
  midnightWisdom: number
  illuminating: IlluminatingMeasure
  fortifying: FortifyingMeasure
  cutting: CuttingMeasure
  surviving: SurvivingMeasure
  knowing: KnowingMeasure
  condition: BlockCondition
  qualityScore: number
}

export type CastleType =
  | 'dark-citadel'
  | 'shadow-fortress'
  | 'proper-stronghold'
  | 'watchtower'
  | 'ruin'
  | 'no-castle'

export type CastleCondition =
  | 'onyx-palace'
  | 'dark-tower'
  | 'proper-keep'
  | 'stone-walls'
  | 'wooden-fence'
  | 'void'

export interface OnyxCastle {
  directory: string
  blocks: OnyxBlock[]
  avgClarity: number
  avgStrength: number
  avgWisdom: number
  onyxMasterpieceCount: number
  voidCount: number
  castleType: CastleType
  condition: CastleCondition
}

export type CommanderGrade = 'dark-lord' | 'citadel-guardian' | 'proper-sentinel' | 'watchman' | 'recruit' | 'sleeping-guard'

export interface OnyxCitadelResult {
  blocks: OnyxBlock[]
  castles: OnyxCastle[]
  keep: {
    avgClarity: number
    avgStrength: number
    avgWisdom: number
    isOnyx: boolean
    overallFortification: number
  }
  stats: {
    totalFiles: number
    totalCastles: number
    avgObsidianClarity: number
    avgDarkFortress: number
    avgBladePrecision: number
    avgShadowResilience: number
    avgMidnightWisdom: number
    onyxMasterpieceCount: number
    darkGemCount: number
    properOnyxCount: number
    grayStoneCount: number
    whiteRockCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighStrengthCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallFortification: number
    commanderGrade: CommanderGrade
    bestBlock: string
    clearest: string
    strongest: string
    sharpest: string
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

/** @example classifyBlockCondition(90) */
export function classifyBlockCondition(score: number): BlockCondition {
  if (score >= 90) return 'onyx-masterpiece'
  if (score >= 75) return 'dark-gem'
  if (score >= 60) return 'proper-onyx'
  if (score >= 40) return 'gray-stone'
  if (score >= 20) return 'white-rock'
  return 'void'
}

/** @example classifyCastleType(blocks) */
export function classifyCastleType(blocks: OnyxBlock[]): CastleType {
  if (blocks.length === 0) return 'no-castle'
  const avg = blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length
  if (avg >= 85) return 'dark-citadel'
  if (avg >= 70) return 'shadow-fortress'
  if (avg >= 55) return 'proper-stronghold'
  if (avg >= 35) return 'watchtower'
  return 'ruin'
}

/** @example classifyCastleCondition(85) */
export function classifyCastleCondition(score: number): CastleCondition {
  if (score >= 85) return 'onyx-palace'
  if (score >= 70) return 'dark-tower'
  if (score >= 55) return 'proper-keep'
  if (score >= 35) return 'stone-walls'
  if (score >= 15) return 'wooden-fence'
  return 'void'
}

/** @example classifyCommanderGrade(80) */
export function classifyCommanderGrade(avgFortification: number): CommanderGrade {
  if (avgFortification >= 80) return 'dark-lord'
  if (avgFortification >= 65) return 'citadel-guardian'
  if (avgFortification >= 50) return 'proper-sentinel'
  if (avgFortification >= 35) return 'watchman'
  if (avgFortification >= 20) return 'recruit'
  return 'sleeping-guard'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|mangled|minified)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnderstandable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSelfDocumenting = /\b(import|export)\b/.test(content)
  const hasVisible = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasRevealed = !/\bany\b/.test(content)
  const hasExposed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnhidden = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasManifest = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoObfuscated, hasTransparent,
    hasUnderstandable, hasSelfDocumenting, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasExposed, hasUnhidden, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let vision: IlluminatingMeasure['vision'] = 'no-clarity'
  if (clarity >= 90) vision = 'dark-sight'
  else if (clarity >= 75) vision = 'night-vision'
  else if (clarity >= 60) vision = 'proper-glimmer'
  else if (clarity >= 40) vision = 'dim-shadow'
  else if (clarity >= 20) vision = 'total-darkness'

  return {
    clarity, vision, hasHighClarity,
    hasReadable, hasNoCryptic, hasClear, hasNoObfuscated, hasTransparent,
    hasUnderstandable, hasSelfDocumenting, hasVisible, hasDirect, hasOpen,
    hasRevealed, hasExposed, hasUnhidden, hasManifest,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureFortifying('export class X { readonly y: string }') */
export function measureFortifying(content: string): FortifyingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|unchecked|risky)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\/\*\*[\s\S]*?\*\//.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unconfirmed)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasSecure = !/\bany\b/.test(content)
  const hasFortified = /\b(readonly|private|protected)\b/.test(content)
  const hasHardened = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasReinforced = /\b(import|export)\b/.test(content)
  const hasShielded = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasProtected = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasGuarded = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasArmored = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasImpervious = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasSecure, hasFortified, hasHardened, hasReinforced,
    hasShielded, hasProtected, hasGuarded, hasArmored, hasImpervious,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let wall: FortifyingMeasure['wall'] = 'no-strength'
  if (strength >= 90) wall = 'impregnable'
  else if (strength >= 75) wall = 'strong-fortress'
  else if (strength >= 60) wall = 'proper-wall'
  else if (strength >= 40) wall = 'wooden-palisade'
  else if (strength >= 20) wall = 'paper-fence'

  return {
    strength, wall, hasHighStrength,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasSecure, hasFortified, hasHardened, hasReinforced,
    hasShielded, hasProtected, hasGuarded, hasArmored, hasImpervious,
    unhandledCount, untestedCount,
  }
}

/** @example measureCutting('export class X { readonly y: string }') */
export function measureCutting(content: string): CuttingMeasure {
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
  const hasKeen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasIncisive = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasPiercing = /\b(try|catch|if)\b/.test(content)
  const hasSurgical = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasKeen, hasIncisive, hasPiercing, hasSurgical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let edge: CuttingMeasure['edge'] = 'no-precision'
  if (precision >= 90) edge = 'razor-edge'
  else if (precision >= 75) edge = 'sharp-blade'
  else if (precision >= 60) edge = 'proper-knife'
  else if (precision >= 40) edge = 'dull-edge'
  else if (precision >= 20) edge = 'blunt-club'

  return {
    precision, edge, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasKeen, hasIncisive, hasPiercing, hasSurgical,
    unsafeCount, approximateCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasStable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|breakable|delicate|brittle)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unstableCount = (content.match(/\b(unstable|volatile|flaky|inconsistent)\b/gi) ?? []).length
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasLasting = /\b(import|export)\b/.test(content)
  const hasPersistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSteadfast = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasResilient = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasTough = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasHardy = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasUnyielding = !/\bany\b/.test(content)
  const hasIndomitable = /\b(try|catch|if)\b/.test(content)
  const hasUnshakable = /\b(async|await|Promise)\b/.test(content)
  const hasImplacable = /\b(function|=>|return)\b/.test(content)
  const hasRelentless = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasStable, hasNoFragile, hasDurable, hasEnduring, hasLasting,
    hasPersistent, hasSteadfast, hasResilient, hasTough, hasHardy,
    hasUnyielding, hasIndomitable, hasUnshakable, hasImplacable, hasRelentless,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shadow: SurvivingMeasure['shadow'] = 'no-resilience'
  if (resilience >= 90) shadow = 'eternal-night'
  else if (resilience >= 75) shadow = 'dark-endurance'
  else if (resilience >= 60) shadow = 'proper-survival'
  else if (resilience >= 40) shadow = 'fading-light'
  else if (resilience >= 20) shadow = 'crumbling-dark'

  return {
    resilience, shadow, hasHighResilience,
    hasStable, hasNoFragile, hasDurable, hasEnduring, hasLasting,
    hasPersistent, hasSteadfast, hasResilient, hasTough, hasHardy,
    hasUnyielding, hasIndomitable, hasUnshakable, hasImplacable, hasRelentless,
    fragileCount, unstableCount,
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
  const hasPerceptive = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasOmniscient = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasPerceptive, hasWise, hasOmniscient,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let hour: KnowingMeasure['hour'] = 'no-wisdom'
  if (wisdom >= 90) hour = 'witching-sage'
  else if (wisdom >= 75) hour = 'night-scholar'
  else if (wisdom >= 60) hour = 'proper-watcher'
  else if (wisdom >= 40) hour = 'sleepy-guard'
  else if (wisdom >= 20) hour = 'blind-owl'

  return {
    wisdom, hour, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasPerceptive, hasWise, hasOmniscient,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeOnyxBlock(content, 'app.ts') */
export function analyzeOnyxBlock(content: string, filePath: string): OnyxBlock {
  const illuminating = measureIlluminating(content)
  const fortifying = measureFortifying(content)
  const cutting = measureCutting(content)
  const surviving = measureSurviving(content)
  const knowing = measureKnowing(content)

  const obsidianClarity = illuminating.clarity
  const darkFortress = fortifying.strength
  const bladePrecision = cutting.precision
  const shadowResilience = surviving.resilience
  const midnightWisdom = knowing.wisdom

  const qualityScore = Math.round(
    obsidianClarity * 0.2 +
    darkFortress * 0.2 +
    bladePrecision * 0.2 +
    shadowResilience * 0.2 +
    midnightWisdom * 0.2,
  )

  const condition = classifyBlockCondition(qualityScore)

  return {
    file: filePath,
    obsidianClarity, darkFortress, bladePrecision, shadowResilience, midnightWisdom,
    illuminating, fortifying, cutting, surviving, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeOnyxCastle(blocks, 'src') */
export function analyzeOnyxCastle(blocks: OnyxBlock[], dirPath: string): OnyxCastle {
  if (blocks.length === 0) {
    return {
      directory: dirPath, blocks: [],
      avgClarity: 0, avgStrength: 0, avgWisdom: 0,
      onyxMasterpieceCount: 0, voidCount: 0,
      castleType: 'no-castle', condition: 'void',
    }
  }

  const avgClarity = Math.round(blocks.reduce((s, b) => s + b.obsidianClarity, 0) / blocks.length)
  const avgStrength = Math.round(blocks.reduce((s, b) => s + b.darkFortress, 0) / blocks.length)
  const avgWisdom = Math.round(blocks.reduce((s, b) => s + b.midnightWisdom, 0) / blocks.length)
  const onyxMasterpieceCount = blocks.filter((b) => b.condition === 'onyx-masterpiece').length
  const voidCount = blocks.filter((b) => b.condition === 'void').length
  const castleType = classifyCastleType(blocks)
  const avgQuality = Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length)
  const condition = classifyCastleCondition(avgQuality)

  return {
    directory: dirPath, blocks,
    avgClarity, avgStrength, avgWisdom,
    onyxMasterpieceCount, voidCount,
    castleType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOnyxCitadelResult(['a.ts'], [content]) */
export async function buildOnyxCitadelResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OnyxCitadelResult> {
  const blocks: OnyxBlock[] = files.map((file, i) =>
    analyzeOnyxBlock(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OnyxBlock[]>()
  for (const block of blocks) {
    const dir = block.file.includes('/')
      ? block.file.substring(0, block.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(block)
    } else {
      dirMap.set(dir, [block])
    }
  }

  const castles: OnyxCastle[] = Array.from(dirMap.entries()).map(([dir, dirBlocks]) =>
    analyzeOnyxCastle(dirBlocks, dir),
  )

  const avgObsidianClarity = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.obsidianClarity, 0) / blocks.length) : 0
  const avgDarkFortress = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.darkFortress, 0) / blocks.length) : 0
  const avgBladePrecision = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.bladePrecision, 0) / blocks.length) : 0
  const avgShadowResilience = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.shadowResilience, 0) / blocks.length) : 0
  const avgMidnightWisdom = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.midnightWisdom, 0) / blocks.length) : 0

  const overallFortification = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length) : 0
  const isOnyx = overallFortification >= 60

  const keep: OnyxCitadelResult['keep'] = {
    avgClarity: avgObsidianClarity, avgStrength: avgDarkFortress, avgWisdom: avgMidnightWisdom,
    isOnyx, overallFortification,
  }

  const onyxMasterpieceCount = blocks.filter((b) => b.condition === 'onyx-masterpiece').length
  const darkGemCount = blocks.filter((b) => b.condition === 'dark-gem').length
  const properOnyxCount = blocks.filter((b) => b.condition === 'proper-onyx').length
  const grayStoneCount = blocks.filter((b) => b.condition === 'gray-stone').length
  const whiteRockCount = blocks.filter((b) => b.condition === 'white-rock').length
  const voidCount = blocks.filter((b) => b.condition === 'void').length

  const hasHighClarityCount = blocks.filter((b) => b.illuminating.hasHighClarity).length
  const hasHighStrengthCount = blocks.filter((b) => b.fortifying.hasHighStrength).length
  const hasHighPrecisionCount = blocks.filter((b) => b.cutting.hasHighPrecision).length
  const hasHighResilienceCount = blocks.filter((b) => b.surviving.hasHighResilience).length
  const hasHighWisdomCount = blocks.filter((b) => b.knowing.hasHighWisdom).length

  const commanderGrade = classifyCommanderGrade(overallFortification)

  const bestBlock = blocks.length > 0
    ? blocks.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file : ''
  const clearest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.obsidianClarity > best.obsidianClarity ? b : best)).file : ''
  const strongest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.darkFortress > best.darkFortress ? b : best)).file : ''
  const sharpest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.bladePrecision > best.bladePrecision ? b : best)).file : ''
  const mostResilient = blocks.length > 0
    ? blocks.reduce((best, b) => (b.shadowResilience > best.shadowResilience ? b : best)).file : ''
  const wisest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.midnightWisdom > best.midnightWisdom ? b : best)).file : ''

  const stats: OnyxCitadelResult['stats'] = {
    totalFiles: files.length, totalCastles: castles.length,
    avgObsidianClarity, avgDarkFortress, avgBladePrecision, avgShadowResilience, avgMidnightWisdom,
    onyxMasterpieceCount, darkGemCount, properOnyxCount, grayStoneCount, whiteRockCount, voidCount,
    hasHighClarityCount, hasHighStrengthCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallFortification, commanderGrade,
    bestBlock, clearest, strongest, sharpest, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(blocks, castles, keep, stats)

  return {
    blocks, castles, keep, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(blocks, castles, keep, stats) */
export function generateRecommendations(
  blocks: OnyxBlock[],
  castles: OnyxCastle[],
  keep: OnyxCitadelResult['keep'],
  stats: OnyxCitadelResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgObsidianClarity >= 90 &&
    stats.avgDarkFortress >= 90 &&
    stats.avgBladePrecision >= 90 &&
    stats.avgShadowResilience >= 90 &&
    stats.avgMidnightWisdom >= 90
  ) {
    recs.push(
      'Your onyx citadel stands impregnable! Obsidian clarity pierces all shadows, the fortress is unbreakable, blades cut with surgical precision, shadows cannot erode resilience, and midnight wisdom is absolute!',
    )
    return recs
  }

  if (stats.avgObsidianClarity < 60) {
    recs.push(
      'Sharpen obsidian clarity — the citadel walls must be transparent to those within; your code needs clearer naming, better documentation, and self-evident intent'
    )
  }

  if (stats.avgDarkFortress < 60) {
    recs.push(
      'Strengthen the dark fortress — citadel walls must withstand any siege; your code needs error handling, defensive patterns, and hardened boundaries'
    )
  }

  if (stats.avgBladePrecision < 60) {
    recs.push(
      'Hone blade precision — every edge in the citadel must cut clean; your code needs stricter types, exact definitions, and surgical accuracy'
    )
  }

  if (stats.avgShadowResilience < 60) {
    recs.push(
      'Build shadow resilience — the citadel endures through endless night; your code needs stable foundations, durable patterns, and unyielding structure'
    )
  }

  if (stats.avgMidnightWisdom < 60) {
    recs.push(
      'Deepen midnight wisdom — the citadel knows what lurks in darkness; your code needs principled architecture, proven patterns, and far-sighted design'
    )
  }

  if (stats.overallFortification < 40) {
    recs.push(
      'The citadel crumbles — white rocks and gray stones outnumber the onyx blocks, and the fortress cannot hold'
    )
  }

  const voidBlocks = blocks.filter((b) => b.condition === 'void')
  if (voidBlocks.length > 0 && voidBlocks.length <= 5) {
    recs.push(`Reinforce these crumbling blocks: ${voidBlocks.map((b) => b.file).join(', ')}`)
  } else if (voidBlocks.length > 5) {
    recs.push(`Reinforce ${voidBlocks.length} crumbling blocks before the citadel falls completely`)
  }

  const poorCastles = castles.filter((c) => c.condition === 'void' || c.condition === 'wooden-fence')
  if (poorCastles.length === castles.length && castles.length > 0) {
    recs.push('All castles are wooden fences — the onyx citadel needs dark-citadel quality blocks throughout')
  }

  if (recs.length === 0) {
    recs.push('Your onyx citadel stands strong and dark — every block embodies clarity, fortification, precision, resilience, and midnight wisdom')
  }

  return recs
}
