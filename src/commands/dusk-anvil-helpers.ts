// ─── Interfaces ──────────────────────────────────────────

export interface TransitioningMeasure {
  grace: number
  transition: 'seamless-fade' | 'smooth-twilight' | 'proper-shift' | 'abrupt-change' | 'jarring-snap' | 'no-grace'
  hasHighGrace: boolean
  hasModular: boolean
  hasNoTangled: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasAdaptable: boolean
  hasFlexible: boolean
  hasCleanPipelines: boolean
  hasDecoupled: boolean
  hasEvolving: boolean
  hasRefactorable: boolean
  hasMaintainable: boolean
  hasSmooth: boolean
  hasElegant: boolean
  hasGraceful: boolean
  hasFluid: boolean
  tangledCount: number
  rigidCount: number
}

export interface EnduringMeasure {
  resilience: number
  dusk: 'golden-hour' | 'blue-twilight' | 'proper-dusk' | 'sudden-dark' | 'eclipse' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasForgiving: boolean
  hasPatient: boolean
  hasTolerant: boolean
  hasResilient: boolean
  hasAdaptable: boolean
  hasVersatile: boolean
  hasResourceful: boolean
  hasHardened: boolean
  unhandledCount: number
  untestedCount: number
}

export interface RevealingMeasure {
  emergence: number
  stars: 'constellation-reveal' | 'first-stars' | 'proper-twilight' | 'overcast-sky' | 'light-pollution' | 'no-emergence'
  hasHighEmergence: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasVisible: boolean
  hasRevealed: boolean
  hasDocumented: boolean
  hasTransparent: boolean
  hasIlluminated: boolean
  hasExpressive: boolean
  hasOpen: boolean
  hasDirect: boolean
  hasHonest: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface CraftingMeasure {
  twilight: number
  forge: 'master-smithy' | 'twilight-forge' | 'proper-anvil' | 'rough-hammer' | 'cold-metal' | 'no-forge'
  hasHighForge: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasOrganized: boolean
  hasIntentional: boolean
  hasDisciplined: boolean
  hasCrafted: boolean
  hasDeliberate: boolean
  hasShaped: boolean
  hasRefined: boolean
  hasPrecise: boolean
  hasSkilled: boolean
  hasTempered: boolean
  hasHardenedForge: boolean
  hasMasterful: boolean
  hasArtisan: boolean
  chaoticCount: number
  sloppyCount: number
}

export interface GlowingMeasure {
  wisdom: number
  ember: 'ancient-coals' | 'wise-cinders' | 'proper-embers' | 'cooling-ash' | 'cold-dust' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasReflective: boolean
  hasExperienced: boolean
  hasEvolved: boolean
  hasLearned: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hasTimeless: boolean
  hackedCount: number
  shallowCount: number
}

export type TwilightCondition =
  | 'twilight-masterpiece'
  | 'golden-hour-perfection'
  | 'proper-dusk'
  | 'fading-light'
  | 'pitch-dark'
  | 'void'

export interface TwilightSpark {
  file: string
  transitionGrace: number
  duskResilience: number
  starEmergence: number
  forgeTwilight: number
  emberWisdom: number
  transitioning: TransitioningMeasure
  enduring: EnduringMeasure
  revealing: RevealingMeasure
  crafting: CraftingMeasure
  glowing: GlowingMeasure
  condition: TwilightCondition
  qualityScore: number
}

export type HearthType =
  | 'grand-forge'
  | 'twilight-hearth'
  | 'proper-firepit'
  | 'single-candle'
  | 'no-flame'
  | 'no-hearth'

export type HearthCondition =
  | 'twilight-sanctuary'
  | 'ember-hall'
  | 'proper-workshop'
  | 'dark-corner'
  | 'void-space'
  | 'void'

export interface TwilightHearth {
  directory: string
  sparks: TwilightSpark[]
  avgGrace: number
  avgResilience: number
  avgWisdom: number
  twilightMasterpieceCount: number
  voidCount: number
  hearthType: HearthType
  condition: HearthCondition
}

export type SmithGrade = 'twilight-master' | 'dusk-forger' | 'proper-smith' | 'apprentice' | 'novice' | 'night-blind'

export interface TwilightForgeResult {
  sparks: TwilightSpark[]
  hearths: TwilightHearth[]
  evening: {
    avgGrace: number
    avgResilience: number
    avgWisdom: number
    isTwilight: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalHearths: number
    avgTransitionGrace: number
    avgDuskResilience: number
    avgStarEmergence: number
    avgForgeTwilight: number
    avgEmberWisdom: number
    twilightMasterpieceCount: number
    goldenHourPerfectionCount: number
    properDuskCount: number
    fadingLightCount: number
    pitchDarkCount: number
    voidCount: number
    hasHighGraceCount: number
    hasHighResilienceCount: number
    hasHighEmergenceCount: number
    hasHighForgeCount: number
    hasHighWisdomCount: number
    overallLuminosity: number
    smithGrade: SmithGrade
    bestSpark: string
    mostGraceful: string
    mostResilient: string
    mostRevealing: string
    bestForged: string
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

/** @example classifyTwilightCondition(90) */
export function classifyTwilightCondition(score: number): TwilightCondition {
  if (score >= 90) return 'twilight-masterpiece'
  if (score >= 75) return 'golden-hour-perfection'
  if (score >= 60) return 'proper-dusk'
  if (score >= 40) return 'fading-light'
  if (score >= 20) return 'pitch-dark'
  return 'void'
}

/** @example classifyHearthType(sparks) */
export function classifyHearthType(sparks: TwilightSpark[]): HearthType {
  if (sparks.length === 0) return 'no-hearth'
  const avg = sparks.reduce((s, sp) => s + sp.qualityScore, 0) / sparks.length
  if (avg >= 85) return 'grand-forge'
  if (avg >= 70) return 'twilight-hearth'
  if (avg >= 55) return 'proper-firepit'
  if (avg >= 35) return 'single-candle'
  return 'no-flame'
}

/** @example classifyHearthCondition(85) */
export function classifyHearthCondition(score: number): HearthCondition {
  if (score >= 85) return 'twilight-sanctuary'
  if (score >= 70) return 'ember-hall'
  if (score >= 55) return 'proper-workshop'
  if (score >= 35) return 'dark-corner'
  if (score >= 15) return 'void-space'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgLuminosity: number): SmithGrade {
  if (avgLuminosity >= 80) return 'twilight-master'
  if (avgLuminosity >= 65) return 'dusk-forger'
  if (avgLuminosity >= 50) return 'proper-smith'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'night-blind'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureTransitioning('class X { readonly y: string }') */
export function measureTransitioning(content: string): TransitioningMeasure {
  const hasModular = /\b(import|export)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|coupled)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasExtensible = /\b(class|interface|type)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|hardcoded)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasAdaptable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasFlexible = !/\bany\b/.test(content)
  const hasCleanPipelines = /\b(function|=>|return)\b/.test(content)
  const hasDecoupled = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const hasRefactorable = /\b(readonly|private|protected)\b/.test(content)
  const hasMaintainable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSmooth = /\b(const|readonly)\b/.test(content)
  const hasElegant = /\b(try|catch|if)\b/.test(content)
  const hasGraceful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFluid = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasModular, hasNoTangled, hasExtensible, hasNoRigid, hasAdaptable,
    hasFlexible, hasCleanPipelines, hasDecoupled, hasEvolving, hasRefactorable,
    hasMaintainable, hasSmooth, hasElegant, hasGraceful, hasFluid,
  ]

  const grace = computeScore(positiveBooleans)
  const hasHighGrace = grace >= 60

  let transition: TransitioningMeasure['transition'] = 'no-grace'
  if (grace >= 90) transition = 'seamless-fade'
  else if (grace >= 75) transition = 'smooth-twilight'
  else if (grace >= 60) transition = 'proper-shift'
  else if (grace >= 40) transition = 'abrupt-change'
  else if (grace >= 20) transition = 'jarring-snap'

  return {
    grace, transition, hasHighGrace,
    hasModular, hasNoTangled, hasExtensible, hasNoRigid, hasAdaptable,
    hasFlexible, hasCleanPipelines, hasDecoupled, hasEvolving, hasRefactorable,
    hasMaintainable, hasSmooth, hasElegant, hasGraceful, hasFluid,
    tangledCount, rigidCount,
  }
}

/** @example measureEnduring('try { x } catch { y }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasForgiving = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasTolerant = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasResilient = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAdaptable = /\b(readonly|private|protected)\b/.test(content)
  const hasVersatile = /\b(import|export)\b/.test(content)
  const hasResourceful = /\b(class|interface|type)\b/.test(content)
  const hasHardened = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasForgiving, hasPatient, hasTolerant,
    hasResilient, hasAdaptable, hasVersatile, hasResourceful, hasHardened,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let dusk: EnduringMeasure['dusk'] = 'no-resilience'
  if (resilience >= 90) dusk = 'golden-hour'
  else if (resilience >= 75) dusk = 'blue-twilight'
  else if (resilience >= 60) dusk = 'proper-dusk'
  else if (resilience >= 40) dusk = 'sudden-dark'
  else if (resilience >= 20) dusk = 'eclipse'

  return {
    resilience, dusk, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasForgiving, hasPatient, hasTolerant,
    hasResilient, hasAdaptable, hasVersatile, hasResourceful, hasHardened,
    unhandledCount, untestedCount,
  }
}

/** @example measureRevealing('export class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasRevealed = /\b(try|catch|if)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTransparent = /\b(import|export)\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasExpressive = /\b(function|=>|return)\b/.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasDirect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHonest = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasVisible, hasRevealed, hasDocumented, hasTransparent,
    hasIlluminated, hasExpressive, hasOpen, hasDirect, hasHonest,
  ]

  const emergence = computeScore(positiveBooleans)
  const hasHighEmergence = emergence >= 60

  let stars: RevealingMeasure['stars'] = 'no-emergence'
  if (emergence >= 90) stars = 'constellation-reveal'
  else if (emergence >= 75) stars = 'first-stars'
  else if (emergence >= 60) stars = 'proper-twilight'
  else if (emergence >= 40) stars = 'overcast-sky'
  else if (emergence >= 20) stars = 'light-pollution'

  return {
    emergence, stars, hasHighEmergence,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasVisible, hasRevealed, hasDocumented, hasTransparent,
    hasIlluminated, hasExpressive, hasOpen, hasDirect, hasHonest,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureCrafting('import { X } from "y"') */
export function measureCrafting(content: string): CraftingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasIntentional = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasDisciplined = !/\bany\b/.test(content)
  const sloppyCount = (content.match(/\b(sloppy|messy|hacky)\b/gi) ?? []).length
  const hasCrafted = /\b(function|=>|return)\b/.test(content)
  const hasDeliberate = /\b(readonly|private|protected)\b/.test(content)
  const hasShaped = /\b(try|catch|if)\b/.test(content)
  const hasRefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPrecise = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSkilled = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTempered = /\b(async|await|Promise)\b/.test(content)
  const hasHardenedForge = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasMasterful = /\b(const|readonly)\b/.test(content)
  const hasArtisan = /\b(throw|return)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasOrganized, hasIntentional, hasDisciplined,
    hasCrafted, hasDeliberate, hasShaped, hasRefined, hasPrecise,
    hasSkilled, hasTempered, hasHardenedForge, hasMasterful, hasArtisan,
  ]

  const twilight = computeScore(positiveBooleans)
  const hasHighForge = twilight >= 60

  let forge: CraftingMeasure['forge'] = 'no-forge'
  if (twilight >= 90) forge = 'master-smithy'
  else if (twilight >= 75) forge = 'twilight-forge'
  else if (twilight >= 60) forge = 'proper-anvil'
  else if (twilight >= 40) forge = 'rough-hammer'
  else if (twilight >= 20) forge = 'cold-metal'

  return {
    twilight, forge, hasHighForge,
    hasWellStructured, hasNoChaotic, hasOrganized, hasIntentional, hasDisciplined,
    hasCrafted, hasDeliberate, hasShaped, hasRefined, hasPrecise,
    hasSkilled, hasTempered, hasHardenedForge, hasMasterful, hasArtisan,
    chaoticCount, sloppyCount,
  }
}

/** @example measureGlowing('export class X { readonly y: string }') */
export function measureGlowing(content: string): GlowingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasMature = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\b(readonly|private|protected)\b/.test(content)
  const hasReflective = /\b(async|await|Promise)\b/.test(content)
  const hasExperienced = /\b(function|=>|return)\b/.test(content)
  const hasEvolved = /\b(const|readonly)\b/.test(content)
  const hasLearned = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAccumulated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasTimeless = /\b(throw|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasStrategic, hasInsightful, hasReflective, hasExperienced,
    hasEvolved, hasLearned, hasWise, hasAccumulated, hasTimeless,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let ember: GlowingMeasure['ember'] = 'no-wisdom'
  if (wisdom >= 90) ember = 'ancient-coals'
  else if (wisdom >= 75) ember = 'wise-cinders'
  else if (wisdom >= 60) ember = 'proper-embers'
  else if (wisdom >= 40) ember = 'cooling-ash'
  else if (wisdom >= 20) ember = 'cold-dust'

  return {
    wisdom, ember, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasStrategic, hasInsightful, hasReflective, hasExperienced,
    hasEvolved, hasLearned, hasWise, hasAccumulated, hasTimeless,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeTwilightSpark(content, 'app.ts') */
export function analyzeTwilightSpark(content: string, filePath: string): TwilightSpark {
  const transitioning = measureTransitioning(content)
  const enduring = measureEnduring(content)
  const revealing = measureRevealing(content)
  const crafting = measureCrafting(content)
  const glowing = measureGlowing(content)

  const transitionGrace = transitioning.grace
  const duskResilience = enduring.resilience
  const starEmergence = revealing.emergence
  const forgeTwilight = crafting.twilight
  const emberWisdom = glowing.wisdom

  const qualityScore = Math.round(
    transitionGrace * 0.2 +
    duskResilience * 0.2 +
    starEmergence * 0.2 +
    forgeTwilight * 0.2 +
    emberWisdom * 0.2,
  )

  const condition = classifyTwilightCondition(qualityScore)

  return {
    file: filePath,
    transitionGrace, duskResilience, starEmergence, forgeTwilight, emberWisdom,
    transitioning, enduring, revealing, crafting, glowing,
    condition, qualityScore,
  }
}

/** @example analyzeTwilightHearth(sparks, 'src') */
export function analyzeTwilightHearth(sparks: TwilightSpark[], dirPath: string): TwilightHearth {
  if (sparks.length === 0) {
    return {
      directory: dirPath, sparks: [],
      avgGrace: 0, avgResilience: 0, avgWisdom: 0,
      twilightMasterpieceCount: 0, voidCount: 0,
      hearthType: 'no-hearth', condition: 'void',
    }
  }

  const avgGrace = Math.round(sparks.reduce((s, sp) => s + sp.transitionGrace, 0) / sparks.length)
  const avgResilience = Math.round(sparks.reduce((s, sp) => s + sp.duskResilience, 0) / sparks.length)
  const avgWisdom = Math.round(sparks.reduce((s, sp) => s + sp.emberWisdom, 0) / sparks.length)
  const twilightMasterpieceCount = sparks.filter((sp) => sp.condition === 'twilight-masterpiece').length
  const voidCount = sparks.filter((sp) => sp.condition === 'void').length
  const hearthType = classifyHearthType(sparks)
  const avgQuality = Math.round(sparks.reduce((s, sp) => s + sp.qualityScore, 0) / sparks.length)
  const condition = classifyHearthCondition(avgQuality)

  return {
    directory: dirPath, sparks,
    avgGrace, avgResilience, avgWisdom,
    twilightMasterpieceCount, voidCount,
    hearthType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildTwilightForgeResult(['a.ts'], [content]) */
export async function buildTwilightForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TwilightForgeResult> {
  const sparks: TwilightSpark[] = files.map((file, i) =>
    analyzeTwilightSpark(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TwilightSpark[]>()
  for (const spark of sparks) {
    const dir = spark.file.includes('/')
      ? spark.file.substring(0, spark.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(spark)
    } else {
      dirMap.set(dir, [spark])
    }
  }

  const hearths: TwilightHearth[] = Array.from(dirMap.entries()).map(([dir, dirSparks]) =>
    analyzeTwilightHearth(dirSparks, dir),
  )

  const avgTransitionGrace = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.transitionGrace, 0) / sparks.length) : 0
  const avgDuskResilience = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.duskResilience, 0) / sparks.length) : 0
  const avgStarEmergence = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.starEmergence, 0) / sparks.length) : 0
  const avgForgeTwilight = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.forgeTwilight, 0) / sparks.length) : 0
  const avgEmberWisdom = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.emberWisdom, 0) / sparks.length) : 0

  const overallLuminosity = sparks.length > 0
    ? Math.round(sparks.reduce((s, sp) => s + sp.qualityScore, 0) / sparks.length) : 0
  const isTwilight = overallLuminosity >= 60

  const evening = { avgGrace: avgTransitionGrace, avgResilience: avgDuskResilience, avgWisdom: avgEmberWisdom, isTwilight, overallLuminosity }

  const twilightMasterpieceCount = sparks.filter((sp) => sp.condition === 'twilight-masterpiece').length
  const goldenHourPerfectionCount = sparks.filter((sp) => sp.condition === 'golden-hour-perfection').length
  const properDuskCount = sparks.filter((sp) => sp.condition === 'proper-dusk').length
  const fadingLightCount = sparks.filter((sp) => sp.condition === 'fading-light').length
  const pitchDarkCount = sparks.filter((sp) => sp.condition === 'pitch-dark').length
  const voidCount = sparks.filter((sp) => sp.condition === 'void').length

  const hasHighGraceCount = sparks.filter((sp) => sp.transitioning.hasHighGrace).length
  const hasHighResilienceCount = sparks.filter((sp) => sp.enduring.hasHighResilience).length
  const hasHighEmergenceCount = sparks.filter((sp) => sp.revealing.hasHighEmergence).length
  const hasHighForgeCount = sparks.filter((sp) => sp.crafting.hasHighForge).length
  const hasHighWisdomCount = sparks.filter((sp) => sp.glowing.hasHighWisdom).length

  const smithGrade = classifySmithGrade(overallLuminosity)

  const bestSpark = sparks.length > 0
    ? sparks.reduce((best, sp) => (sp.qualityScore > best.qualityScore ? sp : best)).file : ''
  const mostGraceful = sparks.length > 0
    ? sparks.reduce((best, sp) => (sp.transitionGrace > best.transitionGrace ? sp : best)).file : ''
  const mostResilient = sparks.length > 0
    ? sparks.reduce((best, sp) => (sp.duskResilience > best.duskResilience ? sp : best)).file : ''
  const mostRevealing = sparks.length > 0
    ? sparks.reduce((best, sp) => (sp.starEmergence > best.starEmergence ? sp : best)).file : ''
  const bestForged = sparks.length > 0
    ? sparks.reduce((best, sp) => (sp.forgeTwilight > best.forgeTwilight ? sp : best)).file : ''
  const wisest = sparks.length > 0
    ? sparks.reduce((best, sp) => (sp.emberWisdom > best.emberWisdom ? sp : best)).file : ''

  const stats: TwilightForgeResult['stats'] = {
    totalFiles: files.length, totalHearths: hearths.length,
    avgTransitionGrace, avgDuskResilience, avgStarEmergence, avgForgeTwilight, avgEmberWisdom,
    twilightMasterpieceCount, goldenHourPerfectionCount, properDuskCount, fadingLightCount, pitchDarkCount, voidCount,
    hasHighGraceCount, hasHighResilienceCount, hasHighEmergenceCount, hasHighForgeCount, hasHighWisdomCount,
    overallLuminosity, smithGrade,
    bestSpark, mostGraceful, mostResilient, mostRevealing, bestForged, wisest,
  }

  const recommendations = generateRecommendations(sparks, hearths, evening, stats)

  return { sparks, hearths, evening, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(sparks, hearths, evening, stats) */
export function generateRecommendations(
  sparks: TwilightSpark[],
  hearths: TwilightHearth[],
  evening: TwilightForgeResult['evening'],
  stats: TwilightForgeResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgTransitionGrace >= 90 &&
    stats.avgDuskResilience >= 90 &&
    stats.avgStarEmergence >= 90 &&
    stats.avgForgeTwilight >= 90 &&
    stats.avgEmberWisdom >= 90
  ) {
    recs.push(
      'Your twilight forge is a masterpiece of the liminal hour! Every spark combines transition grace, dusk resilience, star emergence, forge twilight, and ember wisdom into a creation worthy of eternal remembrance!',
    )
    return recs
  }

  if (stats.avgTransitionGrace < 60) {
    recs.push(
      'Smooth the transitions — twilight is the master of transitions; your code should handle change with seamless, modular, and fluid grace',
    )
  }

  if (stats.avgDuskResilience < 60) {
    recs.push(
      'Strengthen dusk resilience — uncertainty is twilight\'s natural state; your code should be robust, defensive, and forgiving under changing conditions',
    )
  }

  if (stats.avgStarEmergence < 60) {
    recs.push(
      'Reveal hidden quality — stars are always present but only visible at twilight; your code should be transparent, documented, and self-expressing',
    )
  }

  if (stats.avgForgeTwilight < 60) {
    recs.push(
      'Forge with discipline — a twilight forge adapts to changing light; your code should be structured, intentional, and crafted with precision',
    )
  }

  if (stats.avgEmberWisdom < 60) {
    recs.push(
      'Gather ember wisdom — cooling embers glow with accumulated knowledge; your code should be well-architected, principled, and learned from experience',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The twilight forge has gone dark — no embers glow and no stars emerge from the void of night',
    )
  }

  const voidSparks = sparks.filter((sp) => sp.condition === 'void')
  if (voidSparks.length > 0 && voidSparks.length <= 5) {
    recs.push(`Rekindle these dead sparks: ${voidSparks.map((sp) => sp.file).join(', ')}`)
  } else if (voidSparks.length > 5) {
    recs.push(`Rekindle ${voidSparks.length} dead sparks before the forge goes cold entirely`)
  }

  const poorHearths = hearths.filter((h) => h.condition === 'void' || h.condition === 'void-space')
  if (poorHearths.length === hearths.length && hearths.length > 0) {
    recs.push('All hearths have gone cold — the twilight forge needs a complete restoration from spark to sanctuary')
  }

  if (recs.length === 0) {
    recs.push('Your twilight forge burns steady — each spark combines transition grace, dusk resilience, star emergence, forge twilight, and ember wisdom')
  }

  return recs
}
