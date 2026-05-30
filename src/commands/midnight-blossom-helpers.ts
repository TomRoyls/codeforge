// ─── Interfaces ──────────────────────────────────────────

export interface UnfoldingMeasure {
  bloom: number
  petal: 'rare-orchid' | 'night-rose' | 'proper-evening-flower' | 'dandelion' | 'artificial-flower' | 'no-bloom'
  hasHighBloom: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasIntentional: boolean
  hasCrafted: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasElegant: boolean
  hasGraceful: boolean
  hasDeliberate: boolean
  hasPurposeful: boolean
  chaoticCount: number
  tangledCount: number
}

export interface DeepeningMeasure {
  depth: number
  shadow: 'abyssal-depth' | 'deep-shadow' | 'proper-shade' | 'light-shadow' | 'no-shadow' | 'no-depth'
  hasHighDepth: boolean
  hasDeepLogic: boolean
  hasNoSuperficial: boolean
  hasThorough: boolean
  hasNoSkimmed: boolean
  hasComplete: boolean
  hasNoPartial: boolean
  hasProfound: boolean
  hasInsightful: boolean
  hasNuanced: boolean
  hasLayered: boolean
  hasComplex: boolean
  hasRich: boolean
  hasMultiLevel: boolean
  hasComprehensive: boolean
  hasDeep: boolean
  superficialCount: number
  partialCount: number
}

export interface GleamingMeasure {
  clarity: number
  moon: 'full-moon' | 'gibbous-glow' | 'proper-moonlight' | 'crescent-hint' | 'new-moon' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasDocumented: boolean
  hasRevealed: boolean
  hasIlluminated: boolean
  hasExpressive: boolean
  hasCommunicative: boolean
  hasTransparent: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface DiffusingMeasure {
  fragrance: number
  scent: 'jasmine-night' | 'lavender-breeze' | 'proper-scent' | 'faint-whiff' | 'odorless' | 'no-fragrance'
  hasHighFragrance: boolean
  hasModular: boolean
  hasReusable: boolean
  hasWellAbstracted: boolean
  hasNoDuplicated: boolean
  hasExported: boolean
  hasNoHidden: boolean
  hasDocumented: boolean
  hasTyped: boolean
  hasInterfaced: boolean
  hasGenerous: boolean
  hasShareable: boolean
  hasComposable: boolean
  hasValuable: boolean
  hasInfluential: boolean
  hasSpreading: boolean
  duplicatedCount: number
  hiddenCount: number
}

export interface PersistingMeasure {
  resilience: number
  night: 'eternal-night' | 'dark-survivor' | 'proper-nocturnal' | 'twilight-wilt' | 'dawn-death' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasEnduring: boolean
  hasAdapted: boolean
  hasHardened: boolean
  hasResourceful: boolean
  hasPatient: boolean
  hasPersistent: boolean
  hasUnyielding: boolean
  hasSurviving: boolean
  unhandledCount: number
  untestedCount: number
}

export type PetalCondition =
  | 'midnight-masterpiece'
  | 'rare-bloom'
  | 'proper-flower'
  | 'wilting-petal'
  | 'dead-leaf'
  | 'void'

export interface NightPetal {
  file: string
  nocturnalBloom: number
  shadowDepth: number
  moonlitClarity: number
  nightFragrance: number
  darkResilience: number
  unfolding: UnfoldingMeasure
  deepening: DeepeningMeasure
  gleaming: GleamingMeasure
  diffusing: DiffusingMeasure
  persisting: PersistingMeasure
  condition: PetalCondition
  qualityScore: number
}

export type GardenType =
  | 'moonlit-garden'
  | 'night-garden'
  | 'proper-bed'
  | 'window-box'
  | 'barren-soil'
  | 'no-garden'

export type GardenCondition =
  | 'enchanted-garden'
  | 'midnight-oasis'
  | 'proper-plot'
  | 'weed-patch'
  | 'desert'
  | 'void'

export interface NightGarden {
  directory: string
  petals: NightPetal[]
  avgBloom: number
  avgDepth: number
  avgWisdom: number
  midnightMasterpieceCount: number
  voidCount: number
  gardenType: GardenType
  condition: GardenCondition
}

export interface MidnightBlossomResult {
  petals: NightPetal[]
  gardens: NightGarden[]
  night: {
    avgBloom: number
    avgDepth: number
    avgWisdom: number
    isNocturnal: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalGardens: number
    avgNocturnalBloom: number
    avgShadowDepth: number
    avgMoonlitClarity: number
    avgNightFragrance: number
    avgDarkResilience: number
    midnightMasterpieceCount: number
    rareBloomCount: number
    properFlowerCount: number
    wiltingPetalCount: number
    deadLeafCount: number
    voidCount: number
    hasHighBloomCount: number
    hasHighDepthCount: number
    hasHighClarityCount: number
    hasHighFragranceCount: number
    hasHighResilienceCount: number
    overallLuminosity: number
    gardenerGrade: 'night-gardener' | 'moonlight-botanist' | 'proper-cultivator' | 'apprentice' | 'novice' | 'sunbaker'
    bestPetal: string
    bestBloom: string
    deepest: string
    clearest: string
    mostFragrant: string
    mostResilient: string
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

/** @example classifyPetalCondition(90) */
export function classifyPetalCondition(score: number): PetalCondition {
  if (score >= 90) return 'midnight-masterpiece'
  if (score >= 75) return 'rare-bloom'
  if (score >= 60) return 'proper-flower'
  if (score >= 40) return 'wilting-petal'
  if (score >= 20) return 'dead-leaf'
  return 'void'
}

/** @example classifyGardenType(petals) */
export function classifyGardenType(petals: NightPetal[]): GardenType {
  if (petals.length === 0) return 'no-garden'
  const avg =
    petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length
  if (avg >= 85) return 'moonlit-garden'
  if (avg >= 70) return 'night-garden'
  if (avg >= 55) return 'proper-bed'
  if (avg >= 35) return 'window-box'
  return 'barren-soil'
}

/** @example classifyGardenCondition(85) */
export function classifyGardenCondition(score: number): GardenCondition {
  if (score >= 85) return 'enchanted-garden'
  if (score >= 70) return 'midnight-oasis'
  if (score >= 55) return 'proper-plot'
  if (score >= 35) return 'weed-patch'
  if (score >= 15) return 'desert'
  return 'void'
}

/** @example classifyGardenerGrade(80) */
export function classifyGardenerGrade(
  avgLuminosity: number,
): MidnightBlossomResult['stats']['gardenerGrade'] {
  if (avgLuminosity >= 80) return 'night-gardener'
  if (avgLuminosity >= 65) return 'moonlight-botanist'
  if (avgLuminosity >= 50) return 'proper-cultivator'
  if (avgLuminosity >= 35) return 'apprentice'
  if (avgLuminosity >= 20) return 'novice'
  return 'sunbaker'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureUnfolding('class X { private y: string }') */
export function measureUnfolding(content: string): UnfoldingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasCleanPipelines = /\b(function|=>|return)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|callback.hell)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasIntentional = !/\bany\b/.test(content)
  const hasCrafted = /\b(readonly|private|protected)\b/.test(content)
  const hasRefined = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPolished = /\b(try|catch|if)\b/.test(content)
  const hasElegant = /\b(async|await|Promise)\b/.test(content)
  const hasGraceful = /\b(return|throw)\b/.test(content)
  const hasDeliberate = /\b(export|public)\b/.test(content)
  const hasPurposeful = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasIntentional,
    hasCrafted,
    hasRefined,
    hasPolished,
    hasElegant,
    hasGraceful,
    hasDeliberate,
    hasPurposeful,
    hasPurposeful,
  ]

  const bloom = computeScore(positiveBooleans)
  const hasHighBloom = bloom >= 60

  let petal: UnfoldingMeasure['petal'] = 'no-bloom'
  if (bloom >= 90) petal = 'rare-orchid'
  else if (bloom >= 75) petal = 'night-rose'
  else if (bloom >= 60) petal = 'proper-evening-flower'
  else if (bloom >= 40) petal = 'dandelion'
  else if (bloom >= 20) petal = 'artificial-flower'

  return {
    bloom,
    petal,
    hasHighBloom,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasIntentional,
    hasCrafted,
    hasRefined,
    hasPolished,
    hasElegant,
    hasGraceful,
    hasDeliberate,
    hasPurposeful,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureDeepening('interface X { readonly y: string }') */
export function measureDeepening(content: string): DeepeningMeasure {
  const hasDeepLogic = /\b(class|interface|type)\b/.test(content)
  const superficialCount = (content.match(/\b(superficial|shallow|skin.deep)\b/gi) ?? []).length
  const hasNoSuperficial = superficialCount === 0
  const hasThorough = /\b(readonly|private|protected)\b/.test(content)
  const skimmedCount = (content.match(/\b(skimmed|hasty|rushed)\b/gi) ?? []).length
  const hasNoSkimmed = skimmedCount === 0
  const hasComplete = /\b(import|export)\b/.test(content)
  const partialCount = (content.match(/\b(partial|incomplete|half.done)\b/gi) ?? []).length
  const hasNoPartial = partialCount === 0
  const hasProfound = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNuanced = /\b(try|catch|if)\b/.test(content)
  const hasLayered = /\b(function|=>|return)\b/.test(content)
  const hasComplex = /\b(async|await|Promise)\b/.test(content)
  const hasRich = !/\bany\b/.test(content)
  const hasMultiLevel = /\b(interface|type)\b/.test(content)
  const hasComprehensive = /\b(readonly|as const)\b/.test(content)
  const hasDeep = /\b(export|public)\b/.test(content)

  const positiveBooleans = [
    hasDeepLogic,
    hasNoSuperficial,
    hasThorough,
    hasNoSkimmed,
    hasComplete,
    hasNoPartial,
    hasProfound,
    hasInsightful,
    hasNuanced,
    hasLayered,
    hasComplex,
    hasRich,
    hasMultiLevel,
    hasComprehensive,
    hasDeep,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let shadow: DeepeningMeasure['shadow'] = 'no-depth'
  if (depth >= 90) shadow = 'abyssal-depth'
  else if (depth >= 75) shadow = 'deep-shadow'
  else if (depth >= 60) shadow = 'proper-shade'
  else if (depth >= 40) shadow = 'light-shadow'
  else if (depth >= 20) shadow = 'no-shadow'

  return {
    depth,
    shadow,
    hasHighDepth,
    hasDeepLogic,
    hasNoSuperficial,
    hasThorough,
    hasNoSkimmed,
    hasComplete,
    hasNoPartial,
    hasProfound,
    hasInsightful,
    hasNuanced,
    hasLayered,
    hasComplex,
    hasRich,
    hasMultiLevel,
    hasComprehensive,
    hasDeep,
    superficialCount,
    partialCount,
  }
}

/** @example measureGleaming('export function greet(): string { }') */
export function measureGleaming(content: string): GleamingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|class|interface|type)\b/.test(content)
  const hasNoMystery = !/\b(magic|mystery|secret)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoObfuscated = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(readonly|private|protected)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealed = /\b(try|catch|finally)\b/.test(content)
  const hasIlluminated = /\b(async|await|Promise)\b/.test(content)
  const hasExpressive = !/\bany\b/.test(content)
  const hasCommunicative = /\b(export|public)\b/.test(content)
  const hasTransparent = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasDocumented,
    hasRevealed,
    hasIlluminated,
    hasExpressive,
    hasCommunicative,
    hasTransparent,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let moon: GleamingMeasure['moon'] = 'no-clarity'
  if (clarity >= 90) moon = 'full-moon'
  else if (clarity >= 75) moon = 'gibbous-glow'
  else if (clarity >= 60) moon = 'proper-moonlight'
  else if (clarity >= 40) moon = 'crescent-hint'
  else if (clarity >= 20) moon = 'new-moon'

  return {
    clarity,
    moon,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasDocumented,
    hasRevealed,
    hasIlluminated,
    hasExpressive,
    hasCommunicative,
    hasTransparent,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureDiffusing('export class X { readonly y: string }') */
export function measureDiffusing(content: string): DiffusingMeasure {
  const hasModular = /\b(import|export)\b/.test(content)
  const hasReusable = /\b(function|class|interface)\b/.test(content)
  const hasWellAbstracted = /\b(readonly|private|protected)\b/.test(content)
  const duplicatedCount = (content.match(/\b(duplicate|copy.paste|redundant)\b/gi) ?? []).length
  const hasNoDuplicated = duplicatedCount === 0
  const hasExported = /\b(export|public)\b/.test(content)
  const hiddenCount = (content.match(/\b(hidden|encapsulated|internal)\b/gi) ?? []).length
  const hasNoHidden = hiddenCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTyped = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasInterfaced = /\b(interface|type)\b/.test(content)
  const hasGenerous = /\b(try|catch|if)\b/.test(content)
  const hasShareable = !/\bany\b/.test(content)
  const hasComposable = /\b(class|interface|type)\b/.test(content)
  const hasValuable = /\b(async|await|Promise)\b/.test(content)
  const hasInfluential = /\b(return|throw)\b/.test(content)
  const hasSpreading = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasModular,
    hasReusable,
    hasWellAbstracted,
    hasNoDuplicated,
    hasExported,
    hasNoHidden,
    hasDocumented,
    hasTyped,
    hasInterfaced,
    hasGenerous,
    hasShareable,
    hasComposable,
    hasValuable,
    hasInfluential,
    hasSpreading,
  ]

  const fragrance = computeScore(positiveBooleans)
  const hasHighFragrance = fragrance >= 60

  let scent: DiffusingMeasure['scent'] = 'no-fragrance'
  if (fragrance >= 90) scent = 'jasmine-night'
  else if (fragrance >= 75) scent = 'lavender-breeze'
  else if (fragrance >= 60) scent = 'proper-scent'
  else if (fragrance >= 40) scent = 'faint-whiff'
  else if (fragrance >= 20) scent = 'odorless'

  return {
    fragrance,
    scent,
    hasHighFragrance,
    hasModular,
    hasReusable,
    hasWellAbstracted,
    hasNoDuplicated,
    hasExported,
    hasNoHidden,
    hasDocumented,
    hasTyped,
    hasInterfaced,
    hasGenerous,
    hasShareable,
    hasComposable,
    hasValuable,
    hasInfluential,
    hasSpreading,
    duplicatedCount,
    hiddenCount,
  }
}

/** @example measurePersisting('try { x() } catch { y() }') */
export function measurePersisting(content: string): PersistingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasEnduring = /\b(class|interface|type)\b/.test(content)
  const hasAdapted = /\b(function|=>|return)\b/.test(content)
  const hasHardened = !/\bany\b/.test(content)
  const hasResourceful = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasPersistent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnyielding = /\b(readonly|as const)\b/.test(content)
  const hasSurviving = /\b(return|throw)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasEnduring,
    hasAdapted,
    hasHardened,
    hasResourceful,
    hasPatient,
    hasPersistent,
    hasUnyielding,
    hasSurviving,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let night: PersistingMeasure['night'] = 'no-resilience'
  if (resilience >= 90) night = 'eternal-night'
  else if (resilience >= 75) night = 'dark-survivor'
  else if (resilience >= 60) night = 'proper-nocturnal'
  else if (resilience >= 40) night = 'twilight-wilt'
  else if (resilience >= 20) night = 'dawn-death'

  return {
    resilience,
    night,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasEnduring,
    hasAdapted,
    hasHardened,
    hasResourceful,
    hasPatient,
    hasPersistent,
    hasUnyielding,
    hasSurviving,
    unhandledCount,
    untestedCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeNightPetal(content, 'app.ts') */
export function analyzeNightPetal(content: string, filePath: string): NightPetal {
  const unfolding = measureUnfolding(content)
  const deepening = measureDeepening(content)
  const gleaming = measureGleaming(content)
  const diffusing = measureDiffusing(content)
  const persisting = measurePersisting(content)

  const nocturnalBloom = unfolding.bloom
  const shadowDepth = deepening.depth
  const moonlitClarity = gleaming.clarity
  const nightFragrance = diffusing.fragrance
  const darkResilience = persisting.resilience

  const qualityScore = Math.round(
    nocturnalBloom * 0.2 +
    shadowDepth * 0.2 +
    moonlitClarity * 0.2 +
    nightFragrance * 0.2 +
    darkResilience * 0.2,
  )

  const condition = classifyPetalCondition(qualityScore)

  return {
    file: filePath,
    nocturnalBloom,
    shadowDepth,
    moonlitClarity,
    nightFragrance,
    darkResilience,
    unfolding,
    deepening,
    gleaming,
    diffusing,
    persisting,
    condition,
    qualityScore,
  }
}

/** @example analyzeNightGarden(petals, 'src') */
export function analyzeNightGarden(petals: NightPetal[], dirPath: string): NightGarden {
  if (petals.length === 0) {
    return {
      directory: dirPath,
      petals: [],
      avgBloom: 0,
      avgDepth: 0,
      avgWisdom: 0,
      midnightMasterpieceCount: 0,
      voidCount: 0,
      gardenType: 'no-garden',
      condition: 'void',
    }
  }

  const avgBloom = Math.round(
    petals.reduce((s, p) => s + p.nocturnalBloom, 0) / petals.length,
  )
  const avgDepth = Math.round(
    petals.reduce((s, p) => s + p.shadowDepth, 0) / petals.length,
  )
  const avgWisdom = Math.round(
    petals.reduce((s, p) => s + p.nightFragrance, 0) / petals.length,
  )

  const midnightMasterpieceCount = petals.filter(
    (p) => p.condition === 'midnight-masterpiece',
  ).length
  const voidCount = petals.filter((p) => p.condition === 'void').length

  const gardenType = classifyGardenType(petals)
  const avgQuality = Math.round(
    petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length,
  )
  const condition = classifyGardenCondition(avgQuality)

  return {
    directory: dirPath,
    petals,
    avgBloom,
    avgDepth,
    avgWisdom,
    midnightMasterpieceCount,
    voidCount,
    gardenType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildMidnightBlossomResult(['a.ts'], [content]) */
export async function buildMidnightBlossomResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<MidnightBlossomResult> {
  const petals: NightPetal[] = files.map((file, i) =>
    analyzeNightPetal(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, NightPetal[]>()
  for (const petal of petals) {
    const dir = petal.file.includes('/')
      ? petal.file.substring(0, petal.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(petal)
    } else {
      dirMap.set(dir, [petal])
    }
  }

  const gardens: NightGarden[] = Array.from(dirMap.entries()).map(([dir, dirPetals]) =>
    analyzeNightGarden(dirPetals, dir),
  )

  const avgBloom =
    petals.length > 0
      ? Math.round(petals.reduce((s, p) => s + p.nocturnalBloom, 0) / petals.length)
      : 0
  const avgDepth =
    petals.length > 0
      ? Math.round(petals.reduce((s, p) => s + p.shadowDepth, 0) / petals.length)
      : 0
  const avgWisdom =
    petals.length > 0
      ? Math.round(petals.reduce((s, p) => s + p.nightFragrance, 0) / petals.length)
      : 0

  const overallLuminosity =
    petals.length > 0
      ? Math.round(petals.reduce((s, p) => s + p.qualityScore, 0) / petals.length)
      : 0
  const isNocturnal = overallLuminosity >= 60

  const night = { avgBloom, avgDepth, avgWisdom, isNocturnal, overallLuminosity }

  const avgShadowDepth = avgDepth
  const avgMoonlitClarity =
    petals.length > 0
      ? Math.round(petals.reduce((s, p) => s + p.moonlitClarity, 0) / petals.length)
      : 0
  const avgNightFragrance = avgWisdom
  const avgDarkResilience =
    petals.length > 0
      ? Math.round(petals.reduce((s, p) => s + p.darkResilience, 0) / petals.length)
      : 0

  const midnightMasterpieceCount = petals.filter(
    (p) => p.condition === 'midnight-masterpiece',
  ).length
  const rareBloomCount = petals.filter(
    (p) => p.condition === 'rare-bloom',
  ).length
  const properFlowerCount = petals.filter(
    (p) => p.condition === 'proper-flower',
  ).length
  const wiltingPetalCount = petals.filter(
    (p) => p.condition === 'wilting-petal',
  ).length
  const deadLeafCount = petals.filter(
    (p) => p.condition === 'dead-leaf',
  ).length
  const voidCount = petals.filter((p) => p.condition === 'void').length

  const hasHighBloomCount = petals.filter(
    (p) => p.unfolding.hasHighBloom,
  ).length
  const hasHighDepthCount = petals.filter(
    (p) => p.deepening.hasHighDepth,
  ).length
  const hasHighClarityCount = petals.filter(
    (p) => p.gleaming.hasHighClarity,
  ).length
  const hasHighFragranceCount = petals.filter(
    (p) => p.diffusing.hasHighFragrance,
  ).length
  const hasHighResilienceCount = petals.filter(
    (p) => p.persisting.hasHighResilience,
  ).length

  const gardenerGrade = classifyGardenerGrade(overallLuminosity)

  const bestPetal = petals.length > 0
    ? petals.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const bestBloom = petals.length > 0
    ? petals.reduce((best, p) => (p.nocturnalBloom > best.nocturnalBloom ? p : best)).file
    : ''
  const deepest = petals.length > 0
    ? petals.reduce((best, p) => (p.shadowDepth > best.shadowDepth ? p : best)).file
    : ''
  const clearest = petals.length > 0
    ? petals.reduce((best, p) => (p.moonlitClarity > best.moonlitClarity ? p : best)).file
    : ''
  const mostFragrant = petals.length > 0
    ? petals.reduce((best, p) => (p.nightFragrance > best.nightFragrance ? p : best)).file
    : ''
  const mostResilient = petals.length > 0
    ? petals.reduce((best, p) => (p.darkResilience > best.darkResilience ? p : best)).file
    : ''

  const stats: MidnightBlossomResult['stats'] = {
    totalFiles: files.length,
    totalGardens: gardens.length,
    avgNocturnalBloom: avgBloom,
    avgShadowDepth,
    avgMoonlitClarity,
    avgNightFragrance,
    avgDarkResilience,
    midnightMasterpieceCount,
    rareBloomCount,
    properFlowerCount,
    wiltingPetalCount,
    deadLeafCount,
    voidCount,
    hasHighBloomCount,
    hasHighDepthCount,
    hasHighClarityCount,
    hasHighFragranceCount,
    hasHighResilienceCount,
    overallLuminosity,
    gardenerGrade,
    bestPetal,
    bestBloom,
    deepest,
    clearest,
    mostFragrant,
    mostResilient,
  }

  const recommendations = generateRecommendations(petals, gardens, night, stats)

  return { petals, gardens, night, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(petals, gardens, night, stats) */
export function generateRecommendations(
  petals: NightPetal[],
  gardens: NightGarden[],
  _night: MidnightBlossomResult['night'],
  stats: MidnightBlossomResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgNocturnalBloom >= 90 &&
    stats.avgShadowDepth >= 90 &&
    stats.avgMoonlitClarity >= 90 &&
    stats.avgNightFragrance >= 90 &&
    stats.avgDarkResilience >= 90
  ) {
    recs.push(
      'Your midnight garden is a masterpiece of nocturnal beauty! Every petal blooms with purpose in the silver moonlight!',
    )
    return recs
  }

  if (stats.avgNocturnalBloom < 60) {
    recs.push(
      'Cultivate the bloom — night-blooming cereus opens for just one night; make that single moment count with focused, intentional code',
    )
  }

  if (stats.avgShadowDepth < 60) {
    recs.push(
      'Deepen the shadows — roots grow deepest in darkness; your understanding of complex code should run as deep',
    )
  }

  if (stats.avgMoonlitClarity < 60) {
    recs.push(
      'Brighten the moonlight — even a sliver of moon can illuminate a path; ensure your code remains clear in the darkest contexts',
    )
  }

  if (stats.avgNightFragrance < 60) {
    recs.push(
      'Strengthen the fragrance — jasmine fills the night air with invisible beauty; let your code spread quality that others can sense',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Fortify against the darkness — moonflowers survive where day-lilies wither; your code must endure when visibility fades',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The garden sleeps — no bloom opens in total darkness without the right conditions; nurture your code back to life',
    )
  }

  const voidPetals = petals.filter((p) => p.condition === 'void')
  if (voidPetals.length > 0 && voidPetals.length <= 5) {
    recs.push(
      `Re-examine these dead leaves: ${voidPetals.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPetals.length > 5) {
    recs.push(
      `Re-examine these ${voidPetals.length} dead leaves before the garden withers completely`,
    )
  }

  const poorGardens = gardens.filter(
    (g) => g.condition === 'void' || g.condition === 'desert',
  )
  if (poorGardens.length === gardens.length && gardens.length > 0) {
    recs.push(
      'All gardens have turned to desert — the midnight bloom needs fertile ground to rise again',
    )
  }

  if (recs.length === 0) {
    recs.push('Your midnight blossoms glow with ethereal beauty — each petal a testament to code that thrives in darkness')
  }

  return recs
}
