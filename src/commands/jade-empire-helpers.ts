// ─── Interfaces ──────────────────────────────────────────

export interface MeditatingMeasure {
  serenity: number
  calm: 'nirvana-stone' | 'tranquil-jade' | 'proper-calm' | 'restless-agate' | 'turbulent-quartz' | 'no-serenity'
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
  hasSerene: boolean
  hasGentle: boolean
  hasQuiet: boolean
  hasHarmonious: boolean
  hasBalanced: boolean
  crypticCount: number
  chaoticCount: number
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
  hasUnblemished: boolean
  hasPristine: boolean
  hasSpotless: boolean
  hasFlawless: boolean
  hasImmaculate: boolean
  hasPure: boolean
  hasUnadulterated: boolean
  hasUnpolluted: boolean
  hackCount: number
  workaroundCount: number
}

export interface CarvingMeasure {
  mastery: number
  skill: 'master-carver' | 'skilled-artisan' | 'proper-craftsman' | 'apprentice-chisel' | 'rough-hammer' | 'no-mastery'
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
  hasCarved: boolean
  hasSculpted: boolean
  hasHoned: boolean
  hasElegant: boolean
  hasPrecise: boolean
  hasDelicate: boolean
  spaghettiCount: number
  monolithicCount: number
}

export interface ContinuingMeasure {
  continuity: number
  era: 'eternal-dynasty' | 'lasting-reign' | 'proper-era' | 'brief-period' | 'fleeting-moment' | 'no-continuity'
  hasHighContinuity: boolean
  hasMaintainable: boolean
  hasNoFragile: boolean
  hasDocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasRobust: boolean
  hasEnduring: boolean
  hasSustainable: boolean
  hasPreserved: boolean
  hasAdaptive: boolean
  hasEvolved: boolean
  hasTimeless: boolean
  hasLasting: boolean
  hasPerpetual: boolean
  fragileCount: number
  untestedCount: number
}

export interface KnowingMeasure {
  wisdom: number
  insight: 'jade-emperor' | 'sage-counsel' | 'proper-scholar' | 'student-learner' | 'ignorant-fool' | 'no-wisdom'
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

export type ArtifactCondition =
  | 'imperial-masterpiece'
  | 'royal-jade'
  | 'proper-nephrite'
  | 'common-stone'
  | 'river-rock'
  | 'void'

export interface JadeArtifact {
  file: string
  imperialSerenity: number
  jadePurity: number
  carvingMastery: number
  dynastyContinuity: number
  emeraldWisdom: number
  meditating: MeditatingMeasure
  purifying: PurifyingMeasure
  carving: CarvingMeasure
  continuing: ContinuingMeasure
  knowing: KnowingMeasure
  condition: ArtifactCondition
  qualityScore: number
}

export type DynastyType =
  | 'golden-age'
  | 'prosperous-era'
  | 'proper-period'
  | 'declining-years'
  | 'dark-age'
  | 'no-dynasty'

export type DynastyCondition =
  | 'jade-palace'
  | 'noble-court'
  | 'proper-temple'
  | 'stone-workshop'
  | 'clay-hut'
  | 'void'

export interface JadeDynasty {
  directory: string
  artifacts: JadeArtifact[]
  avgSerenity: number
  avgMastery: number
  avgWisdom: number
  imperialMasterpieceCount: number
  voidCount: number
  dynastyType: DynastyType
  condition: DynastyCondition
}

export type ArtisanGrade = 'jade-emperor' | 'master-artisan' | 'proper-craftsman' | 'apprentice' | 'novice' | 'stone-breaker'

export interface JadeEmpireResult {
  artifacts: JadeArtifact[]
  dynasties: JadeDynasty[]
  empire: {
    avgSerenity: number
    avgMastery: number
    avgWisdom: number
    isJade: boolean
    overallHarmony: number
  }
  stats: {
    totalFiles: number
    totalDynasties: number
    avgImperialSerenity: number
    avgJadePurity: number
    avgCarvingMastery: number
    avgDynastyContinuity: number
    avgEmeraldWisdom: number
    imperialMasterpieceCount: number
    royalJadeCount: number
    properNephriteCount: number
    commonStoneCount: number
    riverRockCount: number
    voidCount: number
    hasHighSerenityCount: number
    hasHighPurityCount: number
    hasHighMasteryCount: number
    hasHighContinuityCount: number
    hasHighWisdomCount: number
    overallHarmony: number
    artisanGrade: ArtisanGrade
    bestArtifact: string
    mostSerene: string
    purest: string
    mostMasterful: string
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

/** @example classifyArtifactCondition(90) */
export function classifyArtifactCondition(score: number): ArtifactCondition {
  if (score >= 90) return 'imperial-masterpiece'
  if (score >= 75) return 'royal-jade'
  if (score >= 60) return 'proper-nephrite'
  if (score >= 40) return 'common-stone'
  if (score >= 20) return 'river-rock'
  return 'void'
}

/** @example classifyDynastyType(artifacts) */
export function classifyDynastyType(artifacts: JadeArtifact[]): DynastyType {
  if (artifacts.length === 0) return 'no-dynasty'
  const avg = artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length
  if (avg >= 85) return 'golden-age'
  if (avg >= 70) return 'prosperous-era'
  if (avg >= 55) return 'proper-period'
  if (avg >= 35) return 'declining-years'
  return 'dark-age'
}

/** @example classifyDynastyCondition(85) */
export function classifyDynastyCondition(score: number): DynastyCondition {
  if (score >= 85) return 'jade-palace'
  if (score >= 70) return 'noble-court'
  if (score >= 55) return 'proper-temple'
  if (score >= 35) return 'stone-workshop'
  if (score >= 15) return 'clay-hut'
  return 'void'
}

/** @example classifyArtisanGrade(80) */
export function classifyArtisanGrade(avgHarmony: number): ArtisanGrade {
  if (avgHarmony >= 80) return 'jade-emperor'
  if (avgHarmony >= 65) return 'master-artisan'
  if (avgHarmony >= 50) return 'proper-craftsman'
  if (avgHarmony >= 35) return 'apprentice'
  if (avgHarmony >= 20) return 'novice'
  return 'stone-breaker'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureMeditating('class X { readonly y: string }') */
export function measureMeditating(content: string): MeditatingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasClear = /\b(import|export)\b/.test(content)
  const hasNoMystery = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|messy|disorganized|tangled)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasCalm = !/\bany\b/.test(content)
  const hasPeaceful = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasComposed = /\b(function|=>|return)\b/.test(content)
  const hasTranquil = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSerene = /\b(const|readonly)\b/.test(content)
  const hasGentle = /\b(async|await|Promise)\b/.test(content)
  const hasQuiet = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHarmonious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasBalanced = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasSerene, hasGentle, hasQuiet, hasHarmonious, hasBalanced,
  ]

  const serenity = computeScore(positiveBooleans)
  const hasHighSerenity = serenity >= 60

  let calm: MeditatingMeasure['calm'] = 'no-serenity'
  if (serenity >= 90) calm = 'nirvana-stone'
  else if (serenity >= 75) calm = 'tranquil-jade'
  else if (serenity >= 60) calm = 'proper-calm'
  else if (serenity >= 40) calm = 'restless-agate'
  else if (serenity >= 20) calm = 'turbulent-quartz'

  return {
    serenity, calm, hasHighSerenity,
    hasReadable, hasNoCryptic, hasClear, hasNoMystery, hasOrganized,
    hasNoChaotic, hasCalm, hasPeaceful, hasComposed, hasTranquil,
    hasSerene, hasGentle, hasQuiet, hasHarmonious, hasBalanced,
    crypticCount, chaoticCount,
  }
}

/** @example measurePurifying('const x: string = "test"') */
export function measurePurifying(content: string): PurifyingMeasure {
  const hasClean = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hackCount = (content.match(/\b(hack|HACK)\b/g) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|WORKAROUND)\b/g) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(TODO|FIXME|XXX)\b/g) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(console\.log|debugger|\.only|\.skip)/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(debugger|console\.log|console\.debug)\b/g) ?? []).length === 0
  const hasNoDeadCode = (content.match(/\b(unreachable|deprecated|obsolete)\b/gi) ?? []).length === 0
  const hasUnblemished = !/\bany\b/.test(content)
  const hasPristine = /\b(import|export)\b/.test(content)
  const hasSpotless = /\b(class|interface|type)\b/.test(content)
  const hasFlawless = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImmaculate = /\b(readonly|private|protected)\b/.test(content)
  const hasPure = /\b(const|readonly)\b/.test(content)
  const hasUnadulterated = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnpolluted = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasNoDeadCode, hasUnblemished, hasPristine, hasSpotless,
    hasFlawless, hasImmaculate, hasPure, hasUnadulterated, hasUnpolluted,
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
    hasNoDebugCode, hasNoDeadCode, hasUnblemished, hasPristine, hasSpotless,
    hasFlawless, hasImmaculate, hasPure, hasUnadulterated, hasUnpolluted,
    hackCount, workaroundCount,
  }
}

/** @example measureCarving('export class X { readonly y: string }') */
export function measureCarving(content: string): CarvingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|callback\.hell|pyramid|deeply\.nested)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasNoUnsafe = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPolished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRefined = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasCrafted = /\b(readonly|private|protected)\b/.test(content)
  const hasCarved = /\b(async|await|Promise)\b/.test(content)
  const hasSculpted = /\b(function|=>|return)\b/.test(content)
  const hasHoned = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasElegant = /\b(try|catch|if)\b/.test(content)
  const hasPrecise = /\b(const|readonly)\b/.test(content)
  const hasDelicate = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasTypeSafe,
    hasNoUnsafe, hasPolished, hasRefined, hasCrafted, hasCarved,
    hasSculpted, hasHoned, hasElegant, hasPrecise, hasDelicate,
  ]

  const mastery = computeScore(positiveBooleans)
  const hasHighMastery = mastery >= 60

  let skill: CarvingMeasure['skill'] = 'no-mastery'
  if (mastery >= 90) skill = 'master-carver'
  else if (mastery >= 75) skill = 'skilled-artisan'
  else if (mastery >= 60) skill = 'proper-craftsman'
  else if (mastery >= 40) skill = 'apprentice-chisel'
  else if (mastery >= 20) skill = 'rough-hammer'

  return {
    mastery, skill, hasHighMastery,
    hasWellStructured, hasNoSpaghetti, hasModular, hasNoMonolithic, hasTypeSafe,
    hasNoUnsafe, hasPolished, hasRefined, hasCrafted, hasCarved,
    hasSculpted, hasHoned, hasElegant, hasPrecise, hasDelicate,
    spaghettiCount, monolithicCount,
  }
}

/** @example measureContinuing('export class X { readonly y: string }') */
export function measureContinuing(content: string): ContinuingMeasure {
  const hasMaintainable = /\b(class|interface|type)\b/.test(content)
  const fragileCount = (content.match(/\b(fragile|brittle|delicate|breakable)\b/gi) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasSustainable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPreserved = /\b(import|export)\b/.test(content)
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasEvolved = /\b(extends|implements|abstract)\b/.test(content)
  const hasTimeless = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLasting = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPerpetual = !/\bany\b/.test(content)

  const positiveBooleans = [
    hasMaintainable, hasNoFragile, hasDocumented, hasTested, hasNoUntested,
    hasStable, hasRobust, hasEnduring, hasSustainable, hasPreserved,
    hasAdaptive, hasEvolved, hasTimeless, hasLasting, hasPerpetual,
  ]

  const continuity = computeScore(positiveBooleans)
  const hasHighContinuity = continuity >= 60

  let era: ContinuingMeasure['era'] = 'no-continuity'
  if (continuity >= 90) era = 'eternal-dynasty'
  else if (continuity >= 75) era = 'lasting-reign'
  else if (continuity >= 60) era = 'proper-era'
  else if (continuity >= 40) era = 'brief-period'
  else if (continuity >= 20) era = 'fleeting-moment'

  return {
    continuity, era, hasHighContinuity,
    hasMaintainable, hasNoFragile, hasDocumented, hasTested, hasNoUntested,
    hasStable, hasRobust, hasEnduring, hasSustainable, hasPreserved,
    hasAdaptive, hasEvolved, hasTimeless, hasLasting, hasPerpetual,
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

  let insight: KnowingMeasure['insight'] = 'no-wisdom'
  if (wisdom >= 90) insight = 'jade-emperor'
  else if (wisdom >= 75) insight = 'sage-counsel'
  else if (wisdom >= 60) insight = 'proper-scholar'
  else if (wisdom >= 40) insight = 'student-learner'
  else if (wisdom >= 20) insight = 'ignorant-fool'

  return {
    wisdom, insight, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasFarSighted, hasWise, hasExperienced,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeJadeArtifact(content, 'app.ts') */
export function analyzeJadeArtifact(content: string, filePath: string): JadeArtifact {
  const meditating = measureMeditating(content)
  const purifying = measurePurifying(content)
  const carving = measureCarving(content)
  const continuing = measureContinuing(content)
  const knowing = measureKnowing(content)

  const imperialSerenity = meditating.serenity
  const jadePurity = purifying.purity
  const carvingMastery = carving.mastery
  const dynastyContinuity = continuing.continuity
  const emeraldWisdom = knowing.wisdom

  const qualityScore = Math.round(
    imperialSerenity * 0.2 +
    jadePurity * 0.2 +
    carvingMastery * 0.2 +
    dynastyContinuity * 0.2 +
    emeraldWisdom * 0.2,
  )

  const condition = classifyArtifactCondition(qualityScore)

  return {
    file: filePath,
    imperialSerenity, jadePurity, carvingMastery, dynastyContinuity, emeraldWisdom,
    meditating, purifying, carving, continuing, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeJadeDynasty(artifacts, 'src') */
export function analyzeJadeDynasty(artifacts: JadeArtifact[], dirPath: string): JadeDynasty {
  if (artifacts.length === 0) {
    return {
      directory: dirPath, artifacts: [],
      avgSerenity: 0, avgMastery: 0, avgWisdom: 0,
      imperialMasterpieceCount: 0, voidCount: 0,
      dynastyType: 'no-dynasty', condition: 'void',
    }
  }

  const avgSerenity = Math.round(artifacts.reduce((s, a) => s + a.imperialSerenity, 0) / artifacts.length)
  const avgMastery = Math.round(artifacts.reduce((s, a) => s + a.carvingMastery, 0) / artifacts.length)
  const avgWisdom = Math.round(artifacts.reduce((s, a) => s + a.emeraldWisdom, 0) / artifacts.length)
  const imperialMasterpieceCount = artifacts.filter((a) => a.condition === 'imperial-masterpiece').length
  const voidCount = artifacts.filter((a) => a.condition === 'void').length
  const dynastyType = classifyDynastyType(artifacts)
  const avgQuality = Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length)
  const condition = classifyDynastyCondition(avgQuality)

  return {
    directory: dirPath, artifacts,
    avgSerenity, avgMastery, avgWisdom,
    imperialMasterpieceCount, voidCount,
    dynastyType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildJadeEmpireResult(['a.ts'], [content]) */
export async function buildJadeEmpireResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<JadeEmpireResult> {
  const artifacts: JadeArtifact[] = files.map((file, i) =>
    analyzeJadeArtifact(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, JadeArtifact[]>()
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

  const dynasties: JadeDynasty[] = Array.from(dirMap.entries()).map(([dir, dirArtifacts]) =>
    analyzeJadeDynasty(dirArtifacts, dir),
  )

  const avgImperialSerenity = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.imperialSerenity, 0) / artifacts.length) : 0
  const avgJadePurity = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.jadePurity, 0) / artifacts.length) : 0
  const avgCarvingMastery = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.carvingMastery, 0) / artifacts.length) : 0
  const avgDynastyContinuity = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.dynastyContinuity, 0) / artifacts.length) : 0
  const avgEmeraldWisdom = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.emeraldWisdom, 0) / artifacts.length) : 0

  const overallHarmony = artifacts.length > 0
    ? Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length) : 0
  const isJade = overallHarmony >= 60

  const empire = { avgSerenity: avgImperialSerenity, avgMastery: avgCarvingMastery, avgWisdom: avgEmeraldWisdom, isJade, overallHarmony }

  const imperialMasterpieceCount = artifacts.filter((a) => a.condition === 'imperial-masterpiece').length
  const royalJadeCount = artifacts.filter((a) => a.condition === 'royal-jade').length
  const properNephriteCount = artifacts.filter((a) => a.condition === 'proper-nephrite').length
  const commonStoneCount = artifacts.filter((a) => a.condition === 'common-stone').length
  const riverRockCount = artifacts.filter((a) => a.condition === 'river-rock').length
  const voidCount = artifacts.filter((a) => a.condition === 'void').length

  const hasHighSerenityCount = artifacts.filter((a) => a.meditating.hasHighSerenity).length
  const hasHighPurityCount = artifacts.filter((a) => a.purifying.hasHighPurity).length
  const hasHighMasteryCount = artifacts.filter((a) => a.carving.hasHighMastery).length
  const hasHighContinuityCount = artifacts.filter((a) => a.continuing.hasHighContinuity).length
  const hasHighWisdomCount = artifacts.filter((a) => a.knowing.hasHighWisdom).length

  const artisanGrade = classifyArtisanGrade(overallHarmony)

  const bestArtifact = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.qualityScore > best.qualityScore ? a : best)).file : ''
  const mostSerene = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.imperialSerenity > best.imperialSerenity ? a : best)).file : ''
  const purest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.jadePurity > best.jadePurity ? a : best)).file : ''
  const mostMasterful = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.carvingMastery > best.carvingMastery ? a : best)).file : ''
  const mostEnduring = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.dynastyContinuity > best.dynastyContinuity ? a : best)).file : ''
  const wisest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.emeraldWisdom > best.emeraldWisdom ? a : best)).file : ''

  const stats: JadeEmpireResult['stats'] = {
    totalFiles: files.length, totalDynasties: dynasties.length,
    avgImperialSerenity, avgJadePurity, avgCarvingMastery, avgDynastyContinuity, avgEmeraldWisdom,
    imperialMasterpieceCount, royalJadeCount, properNephriteCount, commonStoneCount, riverRockCount, voidCount,
    hasHighSerenityCount, hasHighPurityCount, hasHighMasteryCount, hasHighContinuityCount, hasHighWisdomCount,
    overallHarmony, artisanGrade,
    bestArtifact, mostSerene, purest, mostMasterful, mostEnduring, wisest,
  }

  const recommendations = generateRecommendations(artifacts, dynasties, empire, stats)

  return { artifacts, dynasties, empire, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(artifacts, dynasties, empire, stats) */
export function generateRecommendations(
  artifacts: JadeArtifact[],
  dynasties: JadeDynasty[],
  empire: JadeEmpireResult['empire'],
  stats: JadeEmpireResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgImperialSerenity >= 90 &&
    stats.avgJadePurity >= 90 &&
    stats.avgCarvingMastery >= 90 &&
    stats.avgDynastyContinuity >= 90 &&
    stats.avgEmeraldWisdom >= 90
  ) {
    recs.push(
      'Your jade empire radiates perfect harmony! Every artifact glows with imperial serenity, the jade is pure beyond measure, the carving shows master craftsmanship, the dynasty endures eternally, and the emerald wisdom spans all ages!',
    )
    return recs
  }

  if (stats.avgImperialSerenity < 60) {
    recs.push(
      'Cultivate imperial serenity — your code needs calm organization, clear naming, and peaceful structure to achieve the tranquility of jade meditation',
    )
  }

  if (stats.avgJadePurity < 60) {
    recs.push(
      'Purify the jade — the stone must be free of blemishes; remove hacks, workarounds, debug code, and TODO markers to achieve imperial-grade purity',
    )
  }

  if (stats.avgCarvingMastery < 60) {
    recs.push(
      'Improve carving mastery — jade demands the finest craftsmanship; your code needs better structure, type safety, modular design, and polished patterns',
    )
  }

  if (stats.avgDynastyContinuity < 60) {
    recs.push(
      'Strengthen dynasty continuity — a jade dynasty must endure through ages; your code needs documentation, error handling, stable patterns, and maintainable architecture',
    )
  }

  if (stats.avgEmeraldWisdom < 60) {
    recs.push(
      'Deepen emerald wisdom — the jade emperor governs with deep insight; your code needs principled architecture, strategic vision, and holistic understanding',
    )
  }

  if (stats.overallHarmony < 40) {
    recs.push(
      'The jade empire has crumbled — river rocks and common stones outnumber the precious jade, and the dynasty has fallen into dark age',
    )
  }

  const voidArtifacts = artifacts.filter((a) => a.condition === 'void')
  if (voidArtifacts.length > 0 && voidArtifacts.length <= 5) {
    recs.push(`Carve these river rocks into jade: ${voidArtifacts.map((a) => a.file).join(', ')}`)
  } else if (voidArtifacts.length > 5) {
    recs.push(`Carve ${voidArtifacts.length} river rocks into jade before the empire collapses`)
  }

  const poorDynasties = dynasties.filter((d) => d.condition === 'void' || d.condition === 'clay-hut')
  if (poorDynasties.length === dynasties.length && dynasties.length > 0) {
    recs.push('All dynasties are clay huts — the jade empire needs a complete reconstruction from the finest imperial jade')
  }

  if (recs.length === 0) {
    recs.push('Your jade empire gleams with imperial harmony — every artifact embodies serenity, purity, mastery, continuity, and emerald wisdom')
  }

  return recs
}
