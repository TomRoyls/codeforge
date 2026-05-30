// ─── Interfaces ──────────────────────────────────────────

export interface CalmingMeasure {
  serenity: number
  composure: 'forbidden-city' | 'imperial-garden' | 'proper-court' | 'restless-market' | 'chaotic-battle' | 'no-serenity'
  hasHighSerenity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasClear: boolean
  hasNoMystery: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasCalm: boolean
  hasPeaceful: boolean
  hasComposed: boolean
  hasTranquil: boolean
  hasDignified: boolean
  hasSerene: boolean
  hasGraceful: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  crypticCount: number
  chaoticCount: number
}

export interface SculptingMeasure {
  mastery: number
  craft: 'master-carver' | 'skilled-artisan' | 'proper-craftsman' | 'apprentice-chisel' | 'rough-hammer' | 'no-mastery'
  hasHighMastery: boolean
  hasWellStructured: boolean
  hasNoSpaghetti: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasCrafted: boolean
  hasHoned: boolean
  hasSculpted: boolean
  hasShaped: boolean
  hasDelicate: boolean
  hasIntricate: boolean
  hasMasterful: boolean
  spaghettiCount: number
  monolithicCount: number
}

export interface PurifyingMeasure {
  purity: number
  grade: 'imperial-jade' | 'fine-nephrite' | 'proper-jade' | 'common-stone' | 'river-rock' | 'no-purity'
  hasHighPurity: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasNoDeadCode: boolean
  hasPristine: boolean
  hasSpotless: boolean
  hasImmaculate: boolean
  hasUnblemished: boolean
  hasPure: boolean
  hasUntarnished: boolean
  hasFlawless: boolean
  hasUncontaminated: boolean
  hackCount: number
  workaroundCount: number
}

export interface ContinuingMeasure {
  continuity: number
  era: 'ming-dynasty' | 'tang-period' | 'proper-era' | 'brief-reign' | 'fleeting-moment' | 'no-continuity'
  hasHighContinuity: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDocumented: boolean
  hasStable: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasPreserved: boolean
  hasSustainable: boolean
  hasAdaptive: boolean
  hasEvolved: boolean
  hasTimeless: boolean
  hasPerpetual: boolean
  fragileCount: number
  untestedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  sage: 'jade-emperor' | 'court-scholar' | 'proper-artisan' | 'young-student' | 'foolish-child' | 'no-wisdom'
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

export type JadeCondition =
  | 'jade-masterpiece'
  | 'imperial-carving'
  | 'proper-nephrite'
  | 'common-stone'
  | 'raw-boulder'
  | 'void'

export interface JadeCreature {
  file: string
  imperialSerenity: number
  carvingMastery: number
  jadePurity: number
  dynastyContinuity: number
  nephriteWisdom: number
  calming: CalmingMeasure
  sculpting: SculptingMeasure
  purifying: PurifyingMeasure
  continuing: ContinuingMeasure
  knowing: KnowingMeasure
  condition: JadeCondition
  qualityScore: number
}

export type GalleryType =
  | 'imperial-collection'
  | 'museum-grade'
  | 'proper-exhibit'
  | 'small-display'
  | 'empty-case'
  | 'no-gallery'

export type GalleryCondition =
  | 'jade-palace'
  | 'court-gallery'
  | 'proper-museum'
  | 'stone-workshop'
  | 'empty-room'
  | 'void'

export type CuratorGrade = 'imperial-curator' | 'museum-director' | 'proper-keeper' | 'apprentice' | 'novice' | 'street-vendor'

export interface JadeGallery {
  directory: string
  creatures: JadeCreature[]
  avgSerenity: number
  avgMastery: number
  avgWisdom: number
  jadeMasterpieceCount: number
  voidCount: number
  galleryType: GalleryType
  condition: GalleryCondition
}

export interface JadeMenagerieResult {
  creatures: JadeCreature[]
  galleries: JadeGallery[]
  palace: {
    avgSerenity: number
    avgMastery: number
    avgWisdom: number
    isJade: boolean
    overallHarmony: number
  }
  stats: {
    totalFiles: number
    totalGalleries: number
    avgImperialSerenity: number
    avgCarvingMastery: number
    avgJadePurity: number
    avgDynastyContinuity: number
    avgNephriteWisdom: number
    jadeMasterpieceCount: number
    imperialCarvingCount: number
    properNephriteCount: number
    commonStoneCount: number
    rawBoulderCount: number
    voidCount: number
    hasHighSerenityCount: number
    hasHighMasteryCount: number
    hasHighPurityCount: number
    hasHighContinuityCount: number
    hasHighWisdomCount: number
    overallHarmony: number
    curatorGrade: CuratorGrade
    bestCreature: string
    mostSerene: string
    mostMasterful: string
    purest: string
    mostEnduring: string
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

/** @example classifyJadeCondition(90) */
export function classifyJadeCondition(score: number): JadeCondition {
  if (score >= 90) return 'jade-masterpiece'
  if (score >= 75) return 'imperial-carving'
  if (score >= 60) return 'proper-nephrite'
  if (score >= 40) return 'common-stone'
  if (score >= 20) return 'raw-boulder'
  return 'void'
}

/** @example classifyGalleryType(creatures) */
export function classifyGalleryType(creatures: JadeCreature[]): GalleryType {
  if (creatures.length === 0) return 'no-gallery'
  const avg = creatures.reduce((s, c) => s + c.qualityScore, 0) / creatures.length
  if (avg >= 85) return 'imperial-collection'
  if (avg >= 70) return 'museum-grade'
  if (avg >= 55) return 'proper-exhibit'
  if (avg >= 35) return 'small-display'
  return 'empty-case'
}

/** @example classifyGalleryCondition(85) */
export function classifyGalleryCondition(score: number): GalleryCondition {
  if (score >= 85) return 'jade-palace'
  if (score >= 70) return 'court-gallery'
  if (score >= 55) return 'proper-museum'
  if (score >= 35) return 'stone-workshop'
  if (score >= 15) return 'empty-room'
  return 'void'
}

/** @example classifyCuratorGrade(80) */
export function classifyCuratorGrade(avgHarmony: number): CuratorGrade {
  if (avgHarmony >= 80) return 'imperial-curator'
  if (avgHarmony >= 65) return 'museum-director'
  if (avgHarmony >= 50) return 'proper-keeper'
  if (avgHarmony >= 35) return 'apprentice'
  if (avgHarmony >= 20) return 'novice'
  return 'street-vendor'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureCalming('export class X { readonly y: string }') */
export function measureCalming(content: string): CalmingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane|esoteric)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disordered|jumbled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasCalm = !/\bany\b/.test(content)
  const hasPeaceful = /\b(readonly|private|protected)\b/.test(content)
  const hasComposed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTranquil = /\b(async|await|Promise)\b/.test(content)
  const hasDignified = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSerene = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasGraceful = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHarmonious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasBalanced = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasDignified, hasSerene, hasGraceful, hasHarmonious, hasBalanced,
  ]

  const serenity = computeScore(positiveBooleans)
  const hasHighSerenity = serenity >= 60

  let composure: CalmingMeasure['composure'] = 'no-serenity'
  if (serenity >= 90) composure = 'forbidden-city'
  else if (serenity >= 75) composure = 'imperial-garden'
  else if (serenity >= 60) composure = 'proper-court'
  else if (serenity >= 40) composure = 'restless-market'
  else if (serenity >= 20) composure = 'chaotic-battle'

  return {
    serenity, composure, hasHighSerenity,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasDignified, hasSerene, hasGraceful, hasHarmonious, hasBalanced,
    crypticCount, chaoticCount,
  }
}

/** @example measureSculpting('export class X { readonly y: string }') */
export function measureSculpting(content: string): SculptingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|tangled|twisted|knotted)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasPolished = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasCrafted = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasHoned = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSculpted = /\b(async|await|Promise)\b/.test(content)
  const hasShaped = /\b(function|=>|return)\b/.test(content)
  const hasDelicate = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasIntricate = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasMasterful = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasTypeSafe,
    hasNoUnsafe, hasPolished, hasRefined, hasCrafted, hasHoned,
    hasSculpted, hasShaped, hasDelicate, hasIntricate, hasMasterful,
  ]

  const mastery = computeScore(positiveBooleans)
  const hasHighMastery = mastery >= 60

  let craft: SculptingMeasure['craft'] = 'no-mastery'
  if (mastery >= 90) craft = 'master-carver'
  else if (mastery >= 75) craft = 'skilled-artisan'
  else if (mastery >= 60) craft = 'proper-craftsman'
  else if (mastery >= 40) craft = 'apprentice-chisel'
  else if (mastery >= 20) craft = 'rough-hammer'

  return {
    mastery, craft, hasHighMastery,
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasTypeSafe,
    hasNoUnsafe, hasPolished, hasRefined, hasCrafted, hasHoned,
    hasSculpted, hasShaped, hasDelicate, hasIntricate, hasMasterful,
    spaghettiCount, monolithicCount,
  }
}

/** @example measurePurifying('export class X { readonly y: string }') */
export function measurePurifying(content: string): PurifyingMeasure {
  const hasClean = !/\bany\b/.test(content)
  const hackCount = (content.match(/\b(hack|kludge)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|tempfix|quickfix)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(const|let|var|function|import|export)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(console\.log|debugger|console\.debug)\b/g) ?? []).length === 0
  const hasNoDeadCode = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasPristine = /\b(class|interface|type)\b/.test(content)
  const hasSpotless = /\b(import|export)\b/.test(content)
  const hasImmaculate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasUnblemished = /\b(readonly|private|protected)\b/.test(content)
  const hasPure = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUntarnished = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasFlawless = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUncontaminated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasSpotless, hasImmaculate,
    hasUnblemished, hasPure, hasUntarnished, hasFlawless, hasUncontaminated,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let grade: PurifyingMeasure['grade'] = 'no-purity'
  if (purity >= 90) grade = 'imperial-jade'
  else if (purity >= 75) grade = 'fine-nephrite'
  else if (purity >= 60) grade = 'proper-jade'
  else if (purity >= 40) grade = 'common-stone'
  else if (purity >= 20) grade = 'river-rock'

  return {
    purity, grade, hasHighPurity,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasPristine, hasSpotless, hasImmaculate,
    hasUnblemished, hasPure, hasUntarnished, hasFlawless, hasUncontaminated,
    hackCount, workaroundCount,
  }
}

/** @example measureContinuing('export class X { readonly y: string }') */
export function measureContinuing(content: string): ContinuingMeasure {
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|flimsy)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStable = /\b(import|export)\b/.test(content)
  const hasDurable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasLasting = !/\bany\b/.test(content)
  const hasPreserved = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSustainable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAdaptive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEvolved = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTimeless = /\b(async|await|Promise)\b/.test(content)
  const hasPerpetual = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasMaintainable, hasNoFragile, hasTested, hasNoUntested, hasDocumented,
    hasStable, hasDurable, hasEnduring, hasLasting, hasPreserved,
    hasSustainable, hasAdaptive, hasEvolved, hasTimeless, hasPerpetual,
  ]

  const continuity = computeScore(positiveBooleans)
  const hasHighContinuity = continuity >= 60

  let era: ContinuingMeasure['era'] = 'no-continuity'
  if (continuity >= 90) era = 'ming-dynasty'
  else if (continuity >= 75) era = 'tang-period'
  else if (continuity >= 60) era = 'proper-era'
  else if (continuity >= 40) era = 'brief-reign'
  else if (continuity >= 20) era = 'fleeting-moment'

  return {
    continuity, era, hasHighContinuity,
    hasMaintainable, hasNoFragile, hasTested, hasNoUntested, hasDocumented,
    hasStable, hasDurable, hasEnduring, hasLasting, hasPreserved,
    hasSustainable, hasAdaptive, hasEvolved, hasTimeless, hasPerpetual,
    fragileCount, untestedCount,
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
  const hasAncient = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const hasVenerable = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasAncient, hasWise, hasVenerable,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let sage: KnowingMeasure['sage'] = 'no-wisdom'
  if (wisdom >= 90) sage = 'jade-emperor'
  else if (wisdom >= 75) sage = 'court-scholar'
  else if (wisdom >= 60) sage = 'proper-artisan'
  else if (wisdom >= 40) sage = 'young-student'
  else if (wisdom >= 20) sage = 'foolish-child'

  return {
    wisdom, sage, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasAncient, hasWise, hasVenerable,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeJadeCreature(content, 'app.ts') */
export function analyzeJadeCreature(content: string, filePath: string): JadeCreature {
  const calming = measureCalming(content)
  const sculpting = measureSculpting(content)
  const purifying = measurePurifying(content)
  const continuing = measureContinuing(content)
  const knowing = measureKnowing(content)

  const imperialSerenity = calming.serenity
  const carvingMastery = sculpting.mastery
  const jadePurity = purifying.purity
  const dynastyContinuity = continuing.continuity
  const nephriteWisdom = knowing.wisdom

  const qualityScore = Math.round(
    imperialSerenity * 0.2 +
    carvingMastery * 0.2 +
    jadePurity * 0.2 +
    dynastyContinuity * 0.2 +
    nephriteWisdom * 0.2,
  )

  const condition = classifyJadeCondition(qualityScore)

  return {
    file: filePath,
    imperialSerenity, carvingMastery, jadePurity, dynastyContinuity, nephriteWisdom,
    calming, sculpting, purifying, continuing, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeJadeGallery(creatures, 'src') */
export function analyzeJadeGallery(creatures: JadeCreature[], dirPath: string): JadeGallery {
  if (creatures.length === 0) {
    return {
      directory: dirPath, creatures: [],
      avgSerenity: 0, avgMastery: 0, avgWisdom: 0,
      jadeMasterpieceCount: 0, voidCount: 0,
      galleryType: 'no-gallery', condition: 'void',
    }
  }

  const avgSerenity = Math.round(creatures.reduce((s, c) => s + c.imperialSerenity, 0) / creatures.length)
  const avgMastery = Math.round(creatures.reduce((s, c) => s + c.carvingMastery, 0) / creatures.length)
  const avgWisdom = Math.round(creatures.reduce((s, c) => s + c.nephriteWisdom, 0) / creatures.length)
  const jadeMasterpieceCount = creatures.filter((c) => c.condition === 'jade-masterpiece').length
  const voidCount = creatures.filter((c) => c.condition === 'void').length
  const galleryType = classifyGalleryType(creatures)
  const avgQuality = Math.round(creatures.reduce((s, c) => s + c.qualityScore, 0) / creatures.length)
  const condition = classifyGalleryCondition(avgQuality)

  return {
    directory: dirPath, creatures,
    avgSerenity, avgMastery, avgWisdom,
    jadeMasterpieceCount, voidCount,
    galleryType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildJadeMenagerieResult(['a.ts'], [content]) */
export async function buildJadeMenagerieResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeMenagerieResult> {
  const creatures: JadeCreature[] = files.map((file, i) =>
    analyzeJadeCreature(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, JadeCreature[]>()
  for (const creature of creatures) {
    const dir = creature.file.includes('/')
      ? creature.file.substring(0, creature.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(creature)
    } else {
      dirMap.set(dir, [creature])
    }
  }

  const galleries: JadeGallery[] = Array.from(dirMap.entries()).map(([dir, dirCreatures]) =>
    analyzeJadeGallery(dirCreatures, dir),
  )

  const avgImperialSerenity = creatures.length > 0
    ? Math.round(creatures.reduce((s, c) => s + c.imperialSerenity, 0) / creatures.length) : 0
  const avgCarvingMastery = creatures.length > 0
    ? Math.round(creatures.reduce((s, c) => s + c.carvingMastery, 0) / creatures.length) : 0
  const avgJadePurity = creatures.length > 0
    ? Math.round(creatures.reduce((s, c) => s + c.jadePurity, 0) / creatures.length) : 0
  const avgDynastyContinuity = creatures.length > 0
    ? Math.round(creatures.reduce((s, c) => s + c.dynastyContinuity, 0) / creatures.length) : 0
  const avgNephriteWisdom = creatures.length > 0
    ? Math.round(creatures.reduce((s, c) => s + c.nephriteWisdom, 0) / creatures.length) : 0

  const overallHarmony = creatures.length > 0
    ? Math.round(creatures.reduce((s, c) => s + c.qualityScore, 0) / creatures.length) : 0
  const isJade = overallHarmony >= 60

  const palace: JadeMenagerieResult['palace'] = {
    avgSerenity: avgImperialSerenity, avgMastery: avgCarvingMastery, avgWisdom: avgNephriteWisdom,
    isJade, overallHarmony,
  }

  const jadeMasterpieceCount = creatures.filter((c) => c.condition === 'jade-masterpiece').length
  const imperialCarvingCount = creatures.filter((c) => c.condition === 'imperial-carving').length
  const properNephriteCount = creatures.filter((c) => c.condition === 'proper-nephrite').length
  const commonStoneCount = creatures.filter((c) => c.condition === 'common-stone').length
  const rawBoulderCount = creatures.filter((c) => c.condition === 'raw-boulder').length
  const voidCount = creatures.filter((c) => c.condition === 'void').length

  const hasHighSerenityCount = creatures.filter((c) => c.calming.hasHighSerenity).length
  const hasHighMasteryCount = creatures.filter((c) => c.sculpting.hasHighMastery).length
  const hasHighPurityCount = creatures.filter((c) => c.purifying.hasHighPurity).length
  const hasHighContinuityCount = creatures.filter((c) => c.continuing.hasHighContinuity).length
  const hasHighWisdomCount = creatures.filter((c) => c.knowing.hasHighWisdom).length

  const curatorGrade = classifyCuratorGrade(overallHarmony)

  const bestCreature = creatures.length > 0
    ? creatures.reduce((best, c) => (c.qualityScore > best.qualityScore ? c : best)).file : ''
  const mostSerene = creatures.length > 0
    ? creatures.reduce((best, c) => (c.imperialSerenity > best.imperialSerenity ? c : best)).file : ''
  const mostMasterful = creatures.length > 0
    ? creatures.reduce((best, c) => (c.carvingMastery > best.carvingMastery ? c : best)).file : ''
  const purest = creatures.length > 0
    ? creatures.reduce((best, c) => (c.jadePurity > best.jadePurity ? c : best)).file : ''
  const mostEnduring = creatures.length > 0
    ? creatures.reduce((best, c) => (c.dynastyContinuity > best.dynastyContinuity ? c : best)).file : ''
  const wisest = creatures.length > 0
    ? creatures.reduce((best, c) => (c.nephriteWisdom > best.nephriteWisdom ? c : best)).file : ''

  const stats: JadeMenagerieResult['stats'] = {
    totalFiles: files.length, totalGalleries: galleries.length,
    avgImperialSerenity, avgCarvingMastery, avgJadePurity, avgDynastyContinuity, avgNephriteWisdom,
    jadeMasterpieceCount, imperialCarvingCount, properNephriteCount, commonStoneCount, rawBoulderCount, voidCount,
    hasHighSerenityCount, hasHighMasteryCount, hasHighPurityCount, hasHighContinuityCount, hasHighWisdomCount,
    overallHarmony, curatorGrade,
    bestCreature, mostSerene, mostMasterful, purest, mostEnduring, wisest,
  }

  const recommendations = generateRecommendations(creatures, galleries, palace, stats)

  return {
    creatures, galleries, palace, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(creatures, galleries, palace, stats) */
export function generateRecommendations(
  creatures: JadeCreature[],
  galleries: JadeGallery[],
  _palace: JadeMenagerieResult['palace'],
  stats: JadeMenagerieResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgImperialSerenity >= 90 &&
    stats.avgCarvingMastery >= 90 &&
    stats.avgJadePurity >= 90 &&
    stats.avgDynastyContinuity >= 90 &&
    stats.avgNephriteWisdom >= 90
  ) {
    recs.push(
      'Your jade menagerie is a collection of imperial masterpieces! Imperial serenity is forbidden-city, carving mastery is master-carver, jade purity is imperial-jade, dynasty continuity is ming-dynasty, and nephrite wisdom is jade-emperor!',
    )
    return recs
  }

  if (stats.avgImperialSerenity < 60) {
    recs.push(
      'Cultivate imperial serenity — the jade creatures must exude calm dignity; eliminate cryptic patterns, embrace clear naming, and achieve forbidden-city composure'
    )
  }

  if (stats.avgCarvingMastery < 60) {
    recs.push(
      'Refine carving mastery — each jade creature must be expertly sculpted; tighten types, eliminate monolithic patterns, and achieve master-carver craftsmanship'
    )
  }

  if (stats.avgJadePurity < 60) {
    recs.push(
      'Purify the jade — the nephrite must be unblemished; remove hacks, eliminate workarounds, and achieve imperial-jade purity'
    )
  }

  if (stats.avgDynastyContinuity < 60) {
    recs.push(
      'Ensure dynasty continuity — the jade must endure through generations; add error handling, test thoroughly, and build ming-dynasty endurance'
    )
  }

  if (stats.avgNephriteWisdom < 60) {
    recs.push(
      'Deepen nephrite wisdom — the jade artisan must understand ancient knowledge; build with principled architecture, proven patterns, and jade-emperor insight'
    )
  }

  if (stats.overallHarmony < 40) {
    recs.push(
      'The menagerie is in disrepair — raw boulders and common stones outnumber the jade masterpieces, and no light escapes'
    )
  }

  const voidCreatures = creatures.filter((c) => c.condition === 'void')
  if (voidCreatures.length > 0 && voidCreatures.length <= 5) {
    recs.push(`Remove these raw boulders from the menagerie: ${voidCreatures.map((c) => c.file).join(', ')}`)
  } else if (voidCreatures.length > 5) {
    recs.push(`Remove ${voidCreatures.length} raw boulders from the menagerie before the last light fades completely`)
  }

  const poorGalleries = galleries.filter((g) => g.condition === 'void' || g.condition === 'empty-room')
  if (poorGalleries.length === galleries.length && galleries.length > 0) {
    recs.push('All galleries are empty rooms — the jade menagerie needs jade-palace quality creatures throughout')
  }

  if (recs.length === 0) {
    recs.push('Your jade menagerie radiates with imperial harmony — every creature carries imperial serenity, carving mastery, jade purity, dynasty continuity, and nephrite wisdom')
  }

  return recs
}
