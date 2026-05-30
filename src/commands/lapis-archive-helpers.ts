// ─── Interfaces ──────────────────────────────────────────

export interface IlluminatingMeasure {
  clarity: number
  blue: 'ultramarine-pure' | 'lapis-bright' | 'proper-blue' | 'faded-indigo' | 'gray-blue' | 'no-clarity'
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
  hasObvious: boolean
  hasRevealed: boolean
  hasEvident: boolean
  hasManifest: boolean
  crypticCount: number
  mysteryCount: number
}

export interface RecordingMeasure {
  precision: number
  record: 'royal-decree' | 'temple-record' | 'proper-tablet' | 'rough-notation' | 'illegible-scratch' | 'no-precision'
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
  hasFaithful: boolean
  hasVerbatim: boolean
  hasAuthentic: boolean
  unsafeCount: number
  approximateCount: number
}

export interface PreservingMeasure {
  endurance: number
  color: 'eternal-ultramarine' | 'lasting-blue' | 'proper-pigment' | 'fading-color' | 'bleached-white' | 'no-endurance'
  hasHighEndurance: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasNoDeadCode: boolean
  hasPristine: boolean
  hasPreserved: boolean
  hasProtected: boolean
  hasConserved: boolean
  hasUnfaded: boolean
  hasPermanent: boolean
  hasTimeless: boolean
  hasEnduring: boolean
  hackCount: number
  workaroundCount: number
}

export interface SurvivingMeasure {
  resilience: number
  stone: 'baked-clay' | 'hardened-tablet' | 'proper-cuneiform' | 'crumbling-clay' | 'sand-dust' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasDurable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasIndestructible: boolean
  hasUnbreakable: boolean
  hasImmortal: boolean
  unhandledCount: number
  untestedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  archive: 'library-of-ashurbanipal' | 'house-of-tablets' | 'proper-archive' | 'scattered-fragments' | 'lost-scrolls' | 'no-wisdom'
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
  hasAncient: boolean
  hasWise: boolean
  hasVenerable: boolean
  hackedCount: number
  shallowCount: number
}

export type LapisCondition =
  | 'lapis-masterpiece'
  | 'ultramarine-gem'
  | 'proper-lapis'
  | 'dyed-stone'
  | 'blue-glass'
  | 'void'

export interface LapisTablet {
  file: string
  celestialBlueClarity: number
  historicalPrecision: number
  pigmentEndurance: number
  tabletResilience: number
  ancientWisdom: number
  illuminating: IlluminatingMeasure
  recording: RecordingMeasure
  preserving: PreservingMeasure
  surviving: SurvivingMeasure
  knowing: KnowingMeasure
  condition: LapisCondition
  qualityScore: number
}

export type CollectionType =
  | 'royal-archive'
  | 'temple-library'
  | 'proper-collection'
  | 'private-scrolls'
  | 'empty-shelf'
  | 'no-collection'

export type CollectionCondition =
  | 'lapis-palace'
  | 'blue-vault'
  | 'proper-archive'
  | 'stone-room'
  | 'dusty-corner'
  | 'void'

export type ArchivistGrade = 'master-archivist' | 'royal-scribe' | 'proper-librarian' | 'apprentice' | 'novice' | 'scroll-thief'

export interface LapisCollection {
  directory: string
  tablets: LapisTablet[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  lapisMasterpieceCount: number
  voidCount: number
  collectionType: CollectionType
  condition: CollectionCondition
}

export interface LapisArchiveResult {
  tablets: LapisTablet[]
  collections: LapisCollection[]
  library: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isLapis: boolean
    overallPreservation: number
  }
  stats: {
    totalFiles: number
    totalCollections: number
    avgCelestialBlueClarity: number
    avgHistoricalPrecision: number
    avgPigmentEndurance: number
    avgTabletResilience: number
    avgAncientWisdom: number
    lapisMasterpieceCount: number
    ultramarineGemCount: number
    properLapisCount: number
    dyedStoneCount: number
    blueGlassCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighEnduranceCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallPreservation: number
    archivistGrade: ArchivistGrade
    bestTablet: string
    clearest: string
    mostPrecise: string
    mostEnduring: string
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

/** @example classifyLapisCondition(90) */
export function classifyLapisCondition(score: number): LapisCondition {
  if (score >= 90) return 'lapis-masterpiece'
  if (score >= 75) return 'ultramarine-gem'
  if (score >= 60) return 'proper-lapis'
  if (score >= 40) return 'dyed-stone'
  if (score >= 20) return 'blue-glass'
  return 'void'
}

/** @example classifyCollectionType(tablets) */
export function classifyCollectionType(tablets: LapisTablet[]): CollectionType {
  if (tablets.length === 0) return 'no-collection'
  const avg = tablets.reduce((s, t) => s + t.qualityScore, 0) / tablets.length
  if (avg >= 85) return 'royal-archive'
  if (avg >= 70) return 'temple-library'
  if (avg >= 55) return 'proper-collection'
  if (avg >= 35) return 'private-scrolls'
  return 'empty-shelf'
}

/** @example classifyCollectionCondition(85) */
export function classifyCollectionCondition(score: number): CollectionCondition {
  if (score >= 85) return 'lapis-palace'
  if (score >= 70) return 'blue-vault'
  if (score >= 55) return 'proper-archive'
  if (score >= 35) return 'stone-room'
  if (score >= 15) return 'dusty-corner'
  return 'void'
}

/** @example classifyArchivistGrade(80) */
export function classifyArchivistGrade(avgPreservation: number): ArchivistGrade {
  if (avgPreservation >= 80) return 'master-archivist'
  if (avgPreservation >= 65) return 'royal-scribe'
  if (avgPreservation >= 50) return 'proper-librarian'
  if (avgPreservation >= 35) return 'apprentice'
  if (avgPreservation >= 20) return 'novice'
  return 'scroll-thief'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasTransparent = !/\bany\b/.test(content)
  const hasUnderstandable = /\b(readonly|private|protected)\b/.test(content)
  const hasVisible = /\b(async|await|Promise)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasObvious = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasRevealed = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasEvident = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasManifest = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let blue: IlluminatingMeasure['blue'] = 'no-clarity'
  if (clarity >= 90) blue = 'ultramarine-pure'
  else if (clarity >= 75) blue = 'lapis-bright'
  else if (clarity >= 60) blue = 'proper-blue'
  else if (clarity >= 40) blue = 'faded-indigo'
  else if (clarity >= 20) blue = 'gray-blue'

  return {
    clarity, blue, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasTransparent, hasUnderstandable, hasVisible, hasDirect, hasOpen,
    hasObvious, hasRevealed, hasEvident, hasManifest,
    crypticCount, mysteryCount,
  }
}

/** @example measureRecording('export class X { readonly y: string }') */
export function measureRecording(content: string): RecordingMeasure {
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
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFaithful = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasVerbatim = /\b(async|await|Promise)\b/.test(content)
  const hasAuthentic = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasFaithful, hasVerbatim, hasAuthentic,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let record: RecordingMeasure['record'] = 'no-precision'
  if (precision >= 90) record = 'royal-decree'
  else if (precision >= 75) record = 'temple-record'
  else if (precision >= 60) record = 'proper-tablet'
  else if (precision >= 40) record = 'rough-notation'
  else if (precision >= 20) record = 'illegible-scratch'

  return {
    precision, record, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasFaithful, hasVerbatim, hasAuthentic,
    unsafeCount, approximateCount,
  }
}

/** @example measurePreserving('export class X { readonly y: string }') */
export function measurePreserving(content: string): PreservingMeasure {
  const hasClean = /\b(class|interface|type)\b/.test(content)
  const hackCount = (content.match(/\b(hack|todo|fixme|xxx)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|kludge|temp|temporary)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|XXX|HACK)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(const|let|var|function|return|import|export|if|for|while)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(console\.log|debugger|println)\b/g) ?? []).length === 0
  const hasNoDeadCode = (content.match(/\b(dead|unused|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasPristine = /\b(import|export)\b/.test(content)
  const hasPreserved = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProtected = !/\bany\b/.test(content)
  const hasConserved = /\b(readonly|private|protected)\b/.test(content)
  const hasUnfaded = /\b(async|await|Promise)\b/.test(content)
  const hasPermanent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTimeless = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEnduring = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasPreserved, hasProtected,
    hasConserved, hasUnfaded, hasPermanent, hasTimeless, hasEnduring,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let color: PreservingMeasure['color'] = 'no-endurance'
  if (endurance >= 90) color = 'eternal-ultramarine'
  else if (endurance >= 75) color = 'lasting-blue'
  else if (endurance >= 60) color = 'proper-pigment'
  else if (endurance >= 40) color = 'fading-color'
  else if (endurance >= 20) color = 'bleached-white'

  return {
    endurance, color, hasHighEndurance,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasPreserved, hasProtected,
    hasConserved, hasUnfaded, hasPermanent, hasTimeless, hasEnduring,
    hackCount, workaroundCount,
  }
}

/** @example measureSurviving('export class X { readonly y: string }') */
export function measureSurviving(content: string): SurvivingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|unprocessed|unresolved)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasStable = /\b(import|export)\b/.test(content)
  const hasDurable = !/\bany\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasLasting = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasIndestructible = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnbreakable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasImmortal = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasHardened, hasEnduring,
    hasLasting, hasIndestructible, hasUnbreakable, hasImmortal,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let stone: SurvivingMeasure['stone'] = 'no-resilience'
  if (resilience >= 90) stone = 'baked-clay'
  else if (resilience >= 75) stone = 'hardened-tablet'
  else if (resilience >= 60) stone = 'proper-cuneiform'
  else if (resilience >= 40) stone = 'crumbling-clay'
  else if (resilience >= 20) stone = 'sand-dust'

  return {
    resilience, stone, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasTested, hasNoUntested, hasDefensive,
    hasRobust, hasStable, hasDurable, hasHardened, hasEnduring,
    hasLasting, hasIndestructible, hasUnbreakable, hasImmortal,
    unhandledCount, untestedCount,
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
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasAncient = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasVenerable = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasAncient, hasWise, hasVenerable,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let archive: KnowingMeasure['archive'] = 'no-wisdom'
  if (wisdom >= 90) archive = 'library-of-ashurbanipal'
  else if (wisdom >= 75) archive = 'house-of-tablets'
  else if (wisdom >= 60) archive = 'proper-archive'
  else if (wisdom >= 40) archive = 'scattered-fragments'
  else if (wisdom >= 20) archive = 'lost-scrolls'

  return {
    wisdom, archive, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasAncient, hasWise, hasVenerable,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeLapisTablet(content, 'app.ts') */
export function analyzeLapisTablet(content: string, filePath: string): LapisTablet {
  const illuminating = measureIlluminating(content)
  const recording = measureRecording(content)
  const preserving = measurePreserving(content)
  const surviving = measureSurviving(content)
  const knowing = measureKnowing(content)

  const celestialBlueClarity = illuminating.clarity
  const historicalPrecision = recording.precision
  const pigmentEndurance = preserving.endurance
  const tabletResilience = surviving.resilience
  const ancientWisdom = knowing.wisdom

  const qualityScore = Math.round(
    celestialBlueClarity * 0.2 +
    historicalPrecision * 0.2 +
    pigmentEndurance * 0.2 +
    tabletResilience * 0.2 +
    ancientWisdom * 0.2,
  )

  const condition = classifyLapisCondition(qualityScore)

  return {
    file: filePath,
    celestialBlueClarity, historicalPrecision, pigmentEndurance, tabletResilience, ancientWisdom,
    illuminating, recording, preserving, surviving, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeLapisCollection(tablets, 'src') */
export function analyzeLapisCollection(tablets: LapisTablet[], dirPath: string): LapisCollection {
  if (tablets.length === 0) {
    return {
      directory: dirPath, tablets: [],
      avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      lapisMasterpieceCount: 0, voidCount: 0,
      collectionType: 'no-collection', condition: 'void',
    }
  }

  const avgClarity = Math.round(tablets.reduce((s, t) => s + t.celestialBlueClarity, 0) / tablets.length)
  const avgPrecision = Math.round(tablets.reduce((s, t) => s + t.historicalPrecision, 0) / tablets.length)
  const avgWisdom = Math.round(tablets.reduce((s, t) => s + t.ancientWisdom, 0) / tablets.length)
  const lapisMasterpieceCount = tablets.filter((t) => t.condition === 'lapis-masterpiece').length
  const voidCount = tablets.filter((t) => t.condition === 'void').length
  const collectionType = classifyCollectionType(tablets)
  const avgQuality = Math.round(tablets.reduce((s, t) => s + t.qualityScore, 0) / tablets.length)
  const condition = classifyCollectionCondition(avgQuality)

  return {
    directory: dirPath, tablets,
    avgClarity, avgPrecision, avgWisdom,
    lapisMasterpieceCount, voidCount,
    collectionType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildLapisArchiveResult(['a.ts'], [content]) */
export async function buildLapisArchiveResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<LapisArchiveResult> {
  const tablets: LapisTablet[] = files.map((file, i) =>
    analyzeLapisTablet(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, LapisTablet[]>()
  for (const tablet of tablets) {
    const dir = tablet.file.includes('/')
      ? tablet.file.substring(0, tablet.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(tablet)
    } else {
      dirMap.set(dir, [tablet])
    }
  }

  const collections: LapisCollection[] = Array.from(dirMap.entries()).map(([dir, dirTablets]) =>
    analyzeLapisCollection(dirTablets, dir),
  )

  const avgCelestialBlueClarity = tablets.length > 0
    ? Math.round(tablets.reduce((s, t) => s + t.celestialBlueClarity, 0) / tablets.length) : 0
  const avgHistoricalPrecision = tablets.length > 0
    ? Math.round(tablets.reduce((s, t) => s + t.historicalPrecision, 0) / tablets.length) : 0
  const avgPigmentEndurance = tablets.length > 0
    ? Math.round(tablets.reduce((s, t) => s + t.pigmentEndurance, 0) / tablets.length) : 0
  const avgTabletResilience = tablets.length > 0
    ? Math.round(tablets.reduce((s, t) => s + t.tabletResilience, 0) / tablets.length) : 0
  const avgAncientWisdom = tablets.length > 0
    ? Math.round(tablets.reduce((s, t) => s + t.ancientWisdom, 0) / tablets.length) : 0

  const overallPreservation = tablets.length > 0
    ? Math.round(tablets.reduce((s, t) => s + t.qualityScore, 0) / tablets.length) : 0
  const isLapis = overallPreservation >= 60

  const library: LapisArchiveResult['library'] = {
    avgClarity: avgCelestialBlueClarity, avgPrecision: avgHistoricalPrecision, avgWisdom: avgAncientWisdom,
    isLapis, overallPreservation,
  }

  const lapisMasterpieceCount = tablets.filter((t) => t.condition === 'lapis-masterpiece').length
  const ultramarineGemCount = tablets.filter((t) => t.condition === 'ultramarine-gem').length
  const properLapisCount = tablets.filter((t) => t.condition === 'proper-lapis').length
  const dyedStoneCount = tablets.filter((t) => t.condition === 'dyed-stone').length
  const blueGlassCount = tablets.filter((t) => t.condition === 'blue-glass').length
  const voidCount = tablets.filter((t) => t.condition === 'void').length

  const hasHighClarityCount = tablets.filter((t) => t.illuminating.hasHighClarity).length
  const hasHighPrecisionCount = tablets.filter((t) => t.recording.hasHighPrecision).length
  const hasHighEnduranceCount = tablets.filter((t) => t.preserving.hasHighEndurance).length
  const hasHighResilienceCount = tablets.filter((t) => t.surviving.hasHighResilience).length
  const hasHighWisdomCount = tablets.filter((t) => t.knowing.hasHighWisdom).length

  const archivistGrade = classifyArchivistGrade(overallPreservation)

  const bestTablet = tablets.length > 0
    ? tablets.reduce((best, t) => (t.qualityScore > best.qualityScore ? t : best)).file : ''
  const clearest = tablets.length > 0
    ? tablets.reduce((best, t) => (t.celestialBlueClarity > best.celestialBlueClarity ? t : best)).file : ''
  const mostPrecise = tablets.length > 0
    ? tablets.reduce((best, t) => (t.historicalPrecision > best.historicalPrecision ? t : best)).file : ''
  const mostEnduring = tablets.length > 0
    ? tablets.reduce((best, t) => (t.pigmentEndurance > best.pigmentEndurance ? t : best)).file : ''
  const mostResilient = tablets.length > 0
    ? tablets.reduce((best, t) => (t.tabletResilience > best.tabletResilience ? t : best)).file : ''
  const wisest = tablets.length > 0
    ? tablets.reduce((best, t) => (t.ancientWisdom > best.ancientWisdom ? t : best)).file : ''

  const stats: LapisArchiveResult['stats'] = {
    totalFiles: files.length, totalCollections: collections.length,
    avgCelestialBlueClarity, avgHistoricalPrecision, avgPigmentEndurance, avgTabletResilience, avgAncientWisdom,
    lapisMasterpieceCount, ultramarineGemCount, properLapisCount, dyedStoneCount, blueGlassCount, voidCount,
    hasHighClarityCount, hasHighPrecisionCount, hasHighEnduranceCount, hasHighResilienceCount, hasHighWisdomCount,
    overallPreservation, archivistGrade,
    bestTablet, clearest, mostPrecise, mostEnduring, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(tablets, collections, library, stats)

  return {
    tablets, collections, library, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(tablets, collections, library, stats) */
export function generateRecommendations(
  tablets: LapisTablet[],
  collections: LapisCollection[],
  _library: LapisArchiveResult['library'],
  stats: LapisArchiveResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgCelestialBlueClarity >= 90 &&
    stats.avgHistoricalPrecision >= 90 &&
    stats.avgPigmentEndurance >= 90 &&
    stats.avgTabletResilience >= 90 &&
    stats.avgAncientWisdom >= 90
  ) {
    recs.push(
      'Your lapis archive is a lapis masterpiece! Celestial blue clarity is ultramarine-pure, historical precision is royal-decree, pigment endurance is eternal-ultramarine, tablet resilience is baked-clay, and ancient wisdom is library-of-ashurbanipal!',
    )
    return recs
  }

  if (stats.avgCelestialBlueClarity < 60) {
    recs.push(
      'Restore celestial blue clarity — the archive must gleam with ultramarine light; eliminate cryptic patterns, improve readability, and achieve ultramarine-pure clarity',
    )
  }

  if (stats.avgHistoricalPrecision < 60) {
    recs.push(
      'Sharpen historical precision — every tablet must record with exact fidelity; tighten types, eliminate unsafe patterns, and achieve royal-decree precision',
    )
  }

  if (stats.avgPigmentEndurance < 60) {
    recs.push(
      'Preserve pigment endurance — the ultramarine must never fade; eliminate hack patterns, remove dead code, and achieve eternal-ultramarine endurance',
    )
  }

  if (stats.avgTabletResilience < 60) {
    recs.push(
      'Harden tablet resilience — the clay must survive millennia; add error handling, test thoroughly, and achieve baked-clay resilience',
    )
  }

  if (stats.avgAncientWisdom < 60) {
    recs.push(
      'Deepen ancient wisdom — the archive must carry knowledge of ages; build with principled architecture, proven patterns, and library-of-ashurbanipal wisdom',
    )
  }

  if (stats.overallPreservation < 40) {
    recs.push(
      'The archive has crumbled — blue glass and dyed stones outnumber the ultramarine gems, and no knowledge survives',
    )
  }

  const voidTablets = tablets.filter((t) => t.condition === 'void')
  if (voidTablets.length > 0 && voidTablets.length <= 5) {
    recs.push(`Remove these blue glass fragments from the archive: ${voidTablets.map((t) => t.file).join(', ')}`)
  } else if (voidTablets.length > 5) {
    recs.push(`Remove ${voidTablets.length} blue glass fragments from the archive before they contaminate the collection`)
  }

  const poorCollections = collections.filter((c) => c.condition === 'void' || c.condition === 'dusty-corner')
  if (poorCollections.length === collections.length && collections.length > 0) {
    recs.push('All collections are dusty corners — the lapis archive needs lapis-palace quality tablets throughout')
  }

  if (recs.length === 0) {
    recs.push('Your lapis archive gleams with ultramarine brilliance — every tablet carries celestial blue clarity, historical precision, pigment endurance, tablet resilience, and ancient wisdom')
  }

  return recs
}
