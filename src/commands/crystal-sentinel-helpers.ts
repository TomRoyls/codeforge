// ─── Interfaces ──────────────────────────────────────────

export interface WatchingMeasure {
  vigilance: number
  guard: 'omniscient-watch' | 'keen-sentinel' | 'proper-guard' | 'drowsy-watchman' | 'sleeping-guard' | 'no-vigilance'
  hasHighVigilance: boolean
  hasComprehensive: boolean
  hasNoIncomplete: boolean
  hasThorough: boolean
  hasNoPartial: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasCovered: boolean
  hasComplete: boolean
  hasExhaustive: boolean
  hasTotal: boolean
  hasFull: boolean
  hasUnblinking: boolean
  hasUnwavering: boolean
  incompleteCount: number
  untestedCount: number
}

export interface CuttingMeasure {
  sharpness: number
  blade: 'surgical-laser' | 'diamond-blade' | 'proper-edge' | 'dull-knife' | 'blunt-force' | 'no-sharpness'
  hasHighSharpness: boolean
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

export interface RevealingMeasure {
  clarity: number
  transparency: 'flawless-prism' | 'clear-crystal' | 'proper-glass' | 'frosted-window' | 'opaque-wall' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasOpen: boolean
  hasDirect: boolean
  hasClear: boolean
  hasRevealed: boolean
  hasExposed: boolean
  hasManifest: boolean
  hasApparent: boolean
  hasObvious: boolean
  crypticCount: number
  mysteryCount: number
}

export interface StandingMeasure {
  endurance: number
  crystal: 'diamond-hard' | 'sapphire-grade' | 'proper-crystal' | 'fragile-glass' | 'melting-ice' | 'no-endurance'
  hasHighEndurance: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasPermanent: boolean
  hasUnchanging: boolean
  hasImmutable: boolean
  hasEternal: boolean
  hasPerpetual: boolean
  unhandledCount: number
  fragileCount: number
}

export interface GuardingMeasure {
  guardianship: number
  shield: 'impervious-guardian' | 'strong-protector' | 'proper-warden' | 'weak-shield' | 'no-guard' | 'no-guardianship'
  hasHighGuardianship: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasProtective: boolean
  hasDefensive: boolean
  hasSafeguarding: boolean
  hasShielding: boolean
  hasWise: boolean
  hasVigilant: boolean
  hackedCount: number
  shallowCount: number
}

export type WatchCondition =
  | 'crystal-masterpiece'
  | 'gem-sentinel'
  | 'proper-crystal'
  | 'flawed-quartz'
  | 'gravel-stone'
  | 'void'

export interface CrystalWatch {
  file: string
  crystallineVigilance: number
  facetSharpness: number
  prismClarity: number
  structureEndurance: number
  mineralGuardianship: number
  watching: WatchingMeasure
  cutting: CuttingMeasure
  revealing: RevealingMeasure
  standing: StandingMeasure
  guarding: GuardingMeasure
  condition: WatchCondition
  qualityScore: number
}

export type TowerType =
  | 'grand-watchtower'
  | 'crystal-spire'
  | 'proper-tower'
  | 'wooden-post'
  | 'empty-platform'
  | 'no-tower'

export type TowerCondition =
  | 'crystal-palace'
  | 'gem-fortress'
  | 'proper-tower'
  | 'stone-wall'
  | 'wooden-fence'
  | 'void'

export interface CrystalTower {
  directory: string
  watches: CrystalWatch[]
  avgVigilance: number
  avgSharpness: number
  avgGuardianship: number
  crystalMasterpieceCount: number
  voidCount: number
  towerType: TowerType
  condition: TowerCondition
}

export type CommanderGrade = 'crystal-commander' | 'senior-sentinel' | 'proper-guard' | 'watchman' | 'recruit' | 'sleeper'

export interface CrystalSentinelResult {
  watches: CrystalWatch[]
  towers: CrystalTower[]
  garrison: {
    avgVigilance: number
    avgSharpness: number
    avgGuardianship: number
    isCrystal: boolean
    overallVigilance: number
  }
  stats: {
    totalFiles: number
    totalTowers: number
    avgCrystallineVigilance: number
    avgFacetSharpness: number
    avgPrismClarity: number
    avgStructureEndurance: number
    avgMineralGuardianship: number
    crystalMasterpieceCount: number
    gemSentinelCount: number
    properCrystalCount: number
    flawedQuartzCount: number
    gravelStoneCount: number
    voidCount: number
    hasHighVigilanceCount: number
    hasHighSharpnessCount: number
    hasHighClarityCount: number
    hasHighEnduranceCount: number
    hasHighGuardianshipCount: number
    overallVigilance: number
    commanderGrade: CommanderGrade
    bestWatch: string
    mostVigilant: string
    sharpest: string
    clearest: string
    mostEnduring: string
    mostProtective: string
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

/** @example classifyWatchCondition(90) */
export function classifyWatchCondition(score: number): WatchCondition {
  if (score >= 90) return 'crystal-masterpiece'
  if (score >= 75) return 'gem-sentinel'
  if (score >= 60) return 'proper-crystal'
  if (score >= 40) return 'flawed-quartz'
  if (score >= 20) return 'gravel-stone'
  return 'void'
}

/** @example classifyTowerType(watches) */
export function classifyTowerType(watches: CrystalWatch[]): TowerType {
  if (watches.length === 0) return 'no-tower'
  const avg = watches.reduce((s, w) => s + w.qualityScore, 0) / watches.length
  if (avg >= 85) return 'grand-watchtower'
  if (avg >= 70) return 'crystal-spire'
  if (avg >= 55) return 'proper-tower'
  if (avg >= 35) return 'wooden-post'
  return 'empty-platform'
}

/** @example classifyTowerCondition(85) */
export function classifyTowerCondition(score: number): TowerCondition {
  if (score >= 85) return 'crystal-palace'
  if (score >= 70) return 'gem-fortress'
  if (score >= 55) return 'proper-tower'
  if (score >= 35) return 'stone-wall'
  if (score >= 15) return 'wooden-fence'
  return 'void'
}

/** @example classifyCommanderGrade(80) */
export function classifyCommanderGrade(avgVigilance: number): CommanderGrade {
  if (avgVigilance >= 80) return 'crystal-commander'
  if (avgVigilance >= 65) return 'senior-sentinel'
  if (avgVigilance >= 50) return 'proper-guard'
  if (avgVigilance >= 35) return 'watchman'
  if (avgVigilance >= 20) return 'recruit'
  return 'sleeper'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureWatching('export class X { readonly y: string }') */
export function measureWatching(content: string): WatchingMeasure {
  const hasComprehensive = /\b(class|interface|type)\b/.test(content)
  const incompleteCount = (content.match(/\b(incomplete|partial|fragment|half-done|wip)\b/gi) ?? []).length
  const hasNoIncomplete = incompleteCount === 0
  const hasThorough = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoPartial = (content.match(/\b(todo|fixme|stubs?|placeholder)\b/gi) ?? []).length === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\b(undocumented|unspecified|implicit)\b/gi) ?? []).length === 0
  const hasTested = /\b(if|return)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasCovered = /\b(try|catch)\b/.test(content)
  const hasComplete = /\b(import|export)\b/.test(content)
  const hasExhaustive = /\b(readonly|private|protected)\b/.test(content)
  const hasTotal = !/\bany\b/.test(content)
  const hasFull = /\b(async|await|Promise)\b/.test(content)
  const hasUnblinking = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnwavering = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasComprehensive, hasNoIncomplete, hasThorough, hasNoPartial, hasDocumented,
    hasNoUndocumented, hasTested, hasNoUntested, hasCovered, hasComplete,
    hasExhaustive, hasTotal, hasFull, hasUnblinking, hasUnwavering,
  ]

  const vigilance = computeScore(positiveBooleans)
  const hasHighVigilance = vigilance >= 60

  let guard: WatchingMeasure['guard'] = 'no-vigilance'
  if (vigilance >= 90) guard = 'omniscient-watch'
  else if (vigilance >= 75) guard = 'keen-sentinel'
  else if (vigilance >= 60) guard = 'proper-guard'
  else if (vigilance >= 40) guard = 'drowsy-watchman'
  else if (vigilance >= 20) guard = 'sleeping-guard'

  return {
    vigilance, guard, hasHighVigilance,
    hasComprehensive, hasNoIncomplete, hasThorough, hasNoPartial, hasDocumented,
    hasNoUndocumented, hasTested, hasNoUntested, hasCovered, hasComplete,
    hasExhaustive, hasTotal, hasFull, hasUnblinking, hasUnwavering,
    incompleteCount, untestedCount,
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
  const hasPiercing = /\b(async|await|Promise)\b/.test(content)
  const hasSurgical = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasKeen, hasIncisive, hasPiercing, hasSurgical,
  ]

  const sharpness = computeScore(positiveBooleans)
  const hasHighSharpness = sharpness >= 60

  let blade: CuttingMeasure['blade'] = 'no-sharpness'
  if (sharpness >= 90) blade = 'surgical-laser'
  else if (sharpness >= 75) blade = 'diamond-blade'
  else if (sharpness >= 60) blade = 'proper-edge'
  else if (sharpness >= 40) blade = 'dull-knife'
  else if (sharpness >= 20) blade = 'blunt-force'

  return {
    sharpness, blade, hasHighSharpness,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasKeen, hasIncisive, hasPiercing, hasSurgical,
    unsafeCount, approximateCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(class|interface|type)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasOpen = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasClear = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevealed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasExposed = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasManifest = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasApparent = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasObvious = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasTransparent,
    hasUnderstandable, hasVisible, hasOpen, hasDirect, hasClear,
    hasRevealed, hasExposed, hasManifest, hasApparent, hasObvious,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let transparency: RevealingMeasure['transparency'] = 'no-clarity'
  if (clarity >= 90) transparency = 'flawless-prism'
  else if (clarity >= 75) transparency = 'clear-crystal'
  else if (clarity >= 60) transparency = 'proper-glass'
  else if (clarity >= 40) transparency = 'frosted-window'
  else if (clarity >= 20) transparency = 'opaque-wall'

  return {
    clarity, transparency, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasTransparent,
    hasUnderstandable, hasVisible, hasOpen, hasDirect, hasClear,
    hasRevealed, hasExposed, hasManifest, hasApparent, hasObvious,
    crypticCount, mysteryCount,
  }
}

/** @example measureStanding('export class X { readonly y: string }') */
export function measureStanding(content: string): StandingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasStable = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasEnduring = /\b(class|interface|type)\b/.test(content)
  const hasLasting = /\b(readonly|private|protected)\b/.test(content)
  const hasPermanent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnchanging = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImmutable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEternal = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasPerpetual = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const fragileCount = (content.match(/\b(fragile|brittle|flimsy|delicate)\b/gi) ?? []).length

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasStable,
    hasDurable, hasHardened, hasEnduring, hasLasting, hasPermanent,
    hasUnchanging, hasImmutable, hasEternal, hasPerpetual,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let crystal: StandingMeasure['crystal'] = 'no-endurance'
  if (endurance >= 90) crystal = 'diamond-hard'
  else if (endurance >= 75) crystal = 'sapphire-grade'
  else if (endurance >= 60) crystal = 'proper-crystal'
  else if (endurance >= 40) crystal = 'fragile-glass'
  else if (endurance >= 20) crystal = 'melting-ice'

  return {
    endurance, crystal, hasHighEndurance,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasStable,
    hasDurable, hasHardened, hasEnduring, hasLasting, hasPermanent,
    hasUnchanging, hasImmutable, hasEternal, hasPerpetual,
    unhandledCount, fragileCount,
  }
}

/** @example measureGuarding('export class X { readonly y: string }') */
export function measureGuarding(content: string): GuardingMeasure {
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
  const hasProtective = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasDefensive = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasSafeguarding = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasShielding = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasVigilant = /\b(try|catch|if)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasProtective,
    hasDefensive, hasSafeguarding, hasShielding, hasWise, hasVigilant,
  ]

  const guardianship = computeScore(positiveBooleans)
  const hasHighGuardianship = guardianship >= 60

  let shield: GuardingMeasure['shield'] = 'no-guardianship'
  if (guardianship >= 90) shield = 'impervious-guardian'
  else if (guardianship >= 75) shield = 'strong-protector'
  else if (guardianship >= 60) shield = 'proper-warden'
  else if (guardianship >= 40) shield = 'weak-shield'
  else if (guardianship >= 20) shield = 'no-guard'

  return {
    guardianship, shield, hasHighGuardianship,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasProtective,
    hasDefensive, hasSafeguarding, hasShielding, hasWise, hasVigilant,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCrystalWatch(content, 'app.ts') */
export function analyzeCrystalWatch(content: string, filePath: string): CrystalWatch {
  const watching = measureWatching(content)
  const cutting = measureCutting(content)
  const revealing = measureRevealing(content)
  const standing = measureStanding(content)
  const guarding = measureGuarding(content)

  const crystallineVigilance = watching.vigilance
  const facetSharpness = cutting.sharpness
  const prismClarity = revealing.clarity
  const structureEndurance = standing.endurance
  const mineralGuardianship = guarding.guardianship

  const qualityScore = Math.round(
    crystallineVigilance * 0.2 +
    facetSharpness * 0.2 +
    prismClarity * 0.2 +
    structureEndurance * 0.2 +
    mineralGuardianship * 0.2,
  )

  const condition = classifyWatchCondition(qualityScore)

  return {
    file: filePath,
    crystallineVigilance, facetSharpness, prismClarity, structureEndurance, mineralGuardianship,
    watching, cutting, revealing, standing, guarding,
    condition, qualityScore,
  }
}

/** @example analyzeCrystalTower(watches, 'src') */
export function analyzeCrystalTower(watches: CrystalWatch[], dirPath: string): CrystalTower {
  if (watches.length === 0) {
    return {
      directory: dirPath, watches: [],
      avgVigilance: 0, avgSharpness: 0, avgGuardianship: 0,
      crystalMasterpieceCount: 0, voidCount: 0,
      towerType: 'no-tower', condition: 'void',
    }
  }

  const avgVigilance = Math.round(watches.reduce((s, w) => s + w.crystallineVigilance, 0) / watches.length)
  const avgSharpness = Math.round(watches.reduce((s, w) => s + w.facetSharpness, 0) / watches.length)
  const avgGuardianship = Math.round(watches.reduce((s, w) => s + w.mineralGuardianship, 0) / watches.length)
  const crystalMasterpieceCount = watches.filter((w) => w.condition === 'crystal-masterpiece').length
  const voidCount = watches.filter((w) => w.condition === 'void').length
  const towerType = classifyTowerType(watches)
  const avgQuality = Math.round(watches.reduce((s, w) => s + w.qualityScore, 0) / watches.length)
  const condition = classifyTowerCondition(avgQuality)

  return {
    directory: dirPath, watches,
    avgVigilance, avgSharpness, avgGuardianship,
    crystalMasterpieceCount, voidCount,
    towerType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCrystalSentinelResult(['a.ts'], [content]) */
export async function buildCrystalSentinelResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CrystalSentinelResult> {
  const watches: CrystalWatch[] = files.map((file, i) =>
    analyzeCrystalWatch(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CrystalWatch[]>()
  for (const watch of watches) {
    const dir = watch.file.includes('/')
      ? watch.file.substring(0, watch.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(watch)
    } else {
      dirMap.set(dir, [watch])
    }
  }

  const towers: CrystalTower[] = Array.from(dirMap.entries()).map(([dir, dirWatches]) =>
    analyzeCrystalTower(dirWatches, dir),
  )

  const avgCrystallineVigilance = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.crystallineVigilance, 0) / watches.length) : 0
  const avgFacetSharpness = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.facetSharpness, 0) / watches.length) : 0
  const avgPrismClarity = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.prismClarity, 0) / watches.length) : 0
  const avgStructureEndurance = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.structureEndurance, 0) / watches.length) : 0
  const avgMineralGuardianship = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.mineralGuardianship, 0) / watches.length) : 0

  const overallVigilance = watches.length > 0
    ? Math.round(watches.reduce((s, w) => s + w.qualityScore, 0) / watches.length) : 0
  const isCrystal = overallVigilance >= 60

  const garrison: CrystalSentinelResult['garrison'] = {
    avgVigilance: avgCrystallineVigilance, avgSharpness: avgFacetSharpness, avgGuardianship: avgMineralGuardianship,
    isCrystal, overallVigilance,
  }

  const crystalMasterpieceCount = watches.filter((w) => w.condition === 'crystal-masterpiece').length
  const gemSentinelCount = watches.filter((w) => w.condition === 'gem-sentinel').length
  const properCrystalCount = watches.filter((w) => w.condition === 'proper-crystal').length
  const flawedQuartzCount = watches.filter((w) => w.condition === 'flawed-quartz').length
  const gravelStoneCount = watches.filter((w) => w.condition === 'gravel-stone').length
  const voidCount = watches.filter((w) => w.condition === 'void').length

  const hasHighVigilanceCount = watches.filter((w) => w.watching.hasHighVigilance).length
  const hasHighSharpnessCount = watches.filter((w) => w.cutting.hasHighSharpness).length
  const hasHighClarityCount = watches.filter((w) => w.revealing.hasHighClarity).length
  const hasHighEnduranceCount = watches.filter((w) => w.standing.hasHighEndurance).length
  const hasHighGuardianshipCount = watches.filter((w) => w.guarding.hasHighGuardianship).length

  const commanderGrade = classifyCommanderGrade(overallVigilance)

  const bestWatch = watches.length > 0
    ? watches.reduce((best, w) => (w.qualityScore > best.qualityScore ? w : best)).file : ''
  const mostVigilant = watches.length > 0
    ? watches.reduce((best, w) => (w.crystallineVigilance > best.crystallineVigilance ? w : best)).file : ''
  const sharpest = watches.length > 0
    ? watches.reduce((best, w) => (w.facetSharpness > best.facetSharpness ? w : best)).file : ''
  const clearest = watches.length > 0
    ? watches.reduce((best, w) => (w.prismClarity > best.prismClarity ? w : best)).file : ''
  const mostEnduring = watches.length > 0
    ? watches.reduce((best, w) => (w.structureEndurance > best.structureEndurance ? w : best)).file : ''
  const mostProtective = watches.length > 0
    ? watches.reduce((best, w) => (w.mineralGuardianship > best.mineralGuardianship ? w : best)).file : ''

  const stats: CrystalSentinelResult['stats'] = {
    totalFiles: files.length, totalTowers: towers.length,
    avgCrystallineVigilance, avgFacetSharpness, avgPrismClarity, avgStructureEndurance, avgMineralGuardianship,
    crystalMasterpieceCount, gemSentinelCount, properCrystalCount, flawedQuartzCount, gravelStoneCount, voidCount,
    hasHighVigilanceCount, hasHighSharpnessCount, hasHighClarityCount, hasHighEnduranceCount, hasHighGuardianshipCount,
    overallVigilance, commanderGrade,
    bestWatch, mostVigilant, sharpest, clearest, mostEnduring, mostProtective,
  }

  const recommendations = generateRecommendations(watches, towers, garrison, stats)

  return {
    watches, towers, garrison, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(watches, towers, garrison, stats) */
export function generateRecommendations(
  watches: CrystalWatch[],
  towers: CrystalTower[],
  garrison: CrystalSentinelResult['garrison'],
  stats: CrystalSentinelResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCrystallineVigilance >= 90 &&
    stats.avgFacetSharpness >= 90 &&
    stats.avgPrismClarity >= 90 &&
    stats.avgStructureEndurance >= 90 &&
    stats.avgMineralGuardianship >= 90
  ) {
    recs.push(
      'Your crystal sentinel stands with omniscient vigilance! Crystalline vigilance is omniscient-watch, facet sharpness is surgical-laser, prism clarity is flawless-prism, structure endurance is diamond-hard, and mineral guardianship is impervious-guardian!',
    )
    return recs
  }

  if (stats.avgCrystallineVigilance < 60) {
    recs.push(
      'Sharpen crystalline vigilance — the sentinel must watch with unblinking eyes; add comprehensive coverage, eliminate incomplete code, and document everything'
    )
  }

  if (stats.avgFacetSharpness < 60) {
    recs.push(
      'Hone facet sharpness — every edge of the crystal must be precise; tighten types, eliminate unsafe patterns, and cut with surgical accuracy'
    )
  }

  if (stats.avgPrismClarity < 60) {
    recs.push(
      'Polish prism clarity — the crystal must be transparent to all who look; remove cryptic patterns, eliminate mystery code, and reveal every intent'
    )
  }

  if (stats.avgStructureEndurance < 60) {
    recs.push(
      'Strengthen structure endurance — the crystal must withstand any force; add error handling, eliminate fragile patterns, and build with diamond-hard stability'
    )
  }

  if (stats.avgMineralGuardianship < 60) {
    recs.push(
      'Deepen mineral guardianship — the sentinel must protect with wisdom; build with principled architecture, proven patterns, and vigilant defense'
    )
  }

  if (stats.overallVigilance < 40) {
    recs.push(
      'The sentinel is crumbling — flawed quartz and gravel stone outnumber the crystal, and the watchtower is unmanned'
    )
  }

  const voidWatches = watches.filter((w) => w.condition === 'void')
  if (voidWatches.length > 0 && voidWatches.length <= 5) {
    recs.push(`Reforge these gravel stones: ${voidWatches.map((w) => w.file).join(', ')}`)
  } else if (voidWatches.length > 5) {
    recs.push(`Reforge ${voidWatches.length} gravel stones before the watchtower collapses entirely`)
  }

  const poorTowers = towers.filter((t) => t.condition === 'void' || t.condition === 'wooden-fence')
  if (poorTowers.length === towers.length && towers.length > 0) {
    recs.push('All towers are wooden fences — the crystal sentinel needs crystal-palace quality watches throughout')
  }

  if (recs.length === 0) {
    recs.push('Your crystal sentinel stands vigilant — every watch carries crystalline vigilance, facet sharpness, prism clarity, structure endurance, and mineral guardianship')
  }

  return recs
}
