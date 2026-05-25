// ─── Interfaces ──────────────────────────────────────────

export interface IlluminatingMeasure {
  clarity: number
  radiance: 'solar-brilliance' | 'golden-dawn' | 'proper-glow' | 'dim-light' | 'darkness' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasIlluminated: boolean
  hasRevealed: boolean
  hasWarm: boolean
  hasInviting: boolean
  hasOpen: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface DrapingMeasure {
  elegance: number
  drape: 'silk-curtain' | 'fine-linen' | 'proper-fabric' | 'burlap' | 'chain-link' | 'no-elegance'
  hasHighElegance: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasRefined: boolean
  hasPolished: boolean
  hasClean: boolean
  hasGraceful: boolean
  hasSimple: boolean
  hasNoOvercomplicated: boolean
  hasTasteful: boolean
  hasSubtle: boolean
  hasBalanced: boolean
  hasHarmonious: boolean
  hasAesthetic: boolean
  hasLight: boolean
  hasSophisticated: boolean
  clunkyCount: number
  overcomplicatedCount: number
}

export interface PurifyingMeasure {
  purity: number
  karat: '24-karat' | '22-karat' | 'proper-gold' | 'gold-plated' | 'fools-gold' | 'no-purity'
  hasHighPurity: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasPure: boolean
  hasHonest: boolean
  hasFaithful: boolean
  hasUncontaminated: boolean
  hasUnadulterated: boolean
  hasGenuine: boolean
  hasAuthentic: boolean
  unsafeCount: number
  contradictoryCount: number
}

export interface EnduringMeasure {
  resilience: number
  permanence: 'eternal-gold' | 'lasting-alloy' | 'proper-endurance' | 'tarnishing-metal' | 'rusting-iron' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasMaintained: boolean
  hasEnduring: boolean
  hasDurable: boolean
  hasPermanent: boolean
  hasTimeless: boolean
  hasLasting: boolean
  unhandledCount: number
  volatileCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  legacy: 'pharaohs-treasure' | 'kings-ransom' | 'proper-hoard' | 'merchants-purse' | 'penniless' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasDeep: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasEvolved: boolean
  hasHistorical: boolean
  hasTimeless: boolean
  hasValuable: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hackedCount: number
  adHocCount: number
}

export type ThreadCondition =
  | 'golden-masterpiece'
  | 'royal-standard'
  | 'proper-gold'
  | 'brass-finish'
  | 'tarnished-copper'
  | 'void'

export interface GoldenThread {
  file: string
  radiantClarity: number
  veilElegance: number
  aurumPurity: number
  goldenResilience: number
  legacyWisdom: number
  illuminating: IlluminatingMeasure
  draping: DrapingMeasure
  purifying: PurifyingMeasure
  enduring: EnduringMeasure
  accumulating: AccumulatingMeasure
  condition: ThreadCondition
  qualityScore: number
}

export type PalaceType =
  | 'treasury'
  | 'gold-vault'
  | 'proper-stronghold'
  | 'safe-deposit'
  | 'empty-box'
  | 'no-palace'

export type PalaceCondition =
  | 'golden-throne-room'
  | 'royal-chamber'
  | 'proper-hall'
  | 'tavern'
  | 'alley'
  | 'void'

export interface GoldenPalace {
  directory: string
  threads: GoldenThread[]
  avgClarity: number
  avgPurity: number
  avgWisdom: number
  goldenMasterpieceCount: number
  voidCount: number
  palaceType: PalaceType
  condition: PalaceCondition
}

export interface GoldenCurtainResult {
  threads: GoldenThread[]
  palaces: GoldenPalace[]
  treasury: {
    avgClarity: number
    avgPurity: number
    avgWisdom: number
    isGolden: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalPalaces: number
    avgRadiantClarity: number
    avgVeilElegance: number
    avgAurumPurity: number
    avgGoldenResilience: number
    avgLegacyWisdom: number
    goldenMasterpieceCount: number
    royalStandardCount: number
    properGoldCount: number
    brassFinishCount: number
    tarnishedCopperCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighEleganceCount: number
    hasHighPurityCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallBrilliance: number
    goldsmithGrade: 'master-goldsmith' | 'royal-jeweler' | 'proper-craftsman' | 'apprentice' | 'novice' | 'tin-smith'
    bestThread: string
    clearest: string
    mostElegant: string
    purest: string
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

/** @example classifyThreadCondition(90) */
export function classifyThreadCondition(score: number): ThreadCondition {
  if (score >= 90) return 'golden-masterpiece'
  if (score >= 75) return 'royal-standard'
  if (score >= 60) return 'proper-gold'
  if (score >= 40) return 'brass-finish'
  if (score >= 20) return 'tarnished-copper'
  return 'void'
}

/** @example classifyPalaceType(threads) */
export function classifyPalaceType(threads: GoldenThread[]): PalaceType {
  if (threads.length === 0) return 'no-palace'
  const avg =
    threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length
  if (avg >= 85) return 'treasury'
  if (avg >= 70) return 'gold-vault'
  if (avg >= 55) return 'proper-stronghold'
  if (avg >= 35) return 'safe-deposit'
  return 'empty-box'
}

/** @example classifyPalaceCondition(85) */
export function classifyPalaceCondition(score: number): PalaceCondition {
  if (score >= 85) return 'golden-throne-room'
  if (score >= 70) return 'royal-chamber'
  if (score >= 55) return 'proper-hall'
  if (score >= 35) return 'tavern'
  if (score >= 15) return 'alley'
  return 'void'
}

/** @example classifyGoldsmithGrade(80) */
export function classifyGoldsmithGrade(
  avgBrilliance: number,
): GoldenCurtainResult['stats']['goldsmithGrade'] {
  if (avgBrilliance >= 80) return 'master-goldsmith'
  if (avgBrilliance >= 65) return 'royal-jeweler'
  if (avgBrilliance >= 50) return 'proper-craftsman'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'tin-smith'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureIlluminating('export function greet(): string { }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|class|interface|type)\b/.test(content)
  const hasNoMystery = !/\b(magic|mystery|secret)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoObfuscated = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(readonly|private|protected)\b/.test(content)
  const hasIlluminated = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasRevealed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasWarm = /\b(async|await|Promise)\b/.test(content)
  const hasInviting = /\b(function|=>|return)\b/.test(content)
  const hasOpen = !/\b(obfuscated|minified|encoded)\b/i.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasIlluminated,
    hasRevealed,
    hasWarm,
    hasInviting,
    hasOpen,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let radiance: IlluminatingMeasure['radiance'] = 'no-clarity'
  if (clarity >= 90) radiance = 'solar-brilliance'
  else if (clarity >= 75) radiance = 'golden-dawn'
  else if (clarity >= 60) radiance = 'proper-glow'
  else if (clarity >= 40) radiance = 'dim-light'
  else if (clarity >= 20) radiance = 'darkness'

  return {
    clarity,
    radiance,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasIlluminated,
    hasRevealed,
    hasWarm,
    hasInviting,
    hasOpen,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureDraping('class X { private y: string }') */
export function measureDraping(content: string): DrapingMeasure {
  const hasElegant = /\b(class|interface|type)\b/.test(content)
  const clunkyCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoClunky = clunkyCount === 0
  const hasRefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasPolished = /\b(readonly|private|protected)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasGraceful = /\b(function|=>|return)\b/.test(content)
  const hasSimple = !/\b(dirty|hacky|gross)\b/i.test(content)
  const overcomplicatedCount = (content.match(/\b(nested|callback.hell|pyramid)\b/gi) ?? []).length
  const hasNoOvercomplicated = overcomplicatedCount === 0
  const hasTasteful = /\b(import|export)\b/.test(content)
  const hasSubtle = /\b(readonly|as const)\b/.test(content)
  const hasBalanced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasHarmonious = /\b(async|await|Promise)\b/.test(content)
  const hasAesthetic = !/\bany\b/.test(content)
  const hasLight = /\b(const|readonly)\b/.test(content)
  const hasSophisticated = /\b(export|public)\b/.test(content)

  const positiveBooleans = [
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasClean,
    hasGraceful,
    hasSimple,
    hasNoOvercomplicated,
    hasTasteful,
    hasSubtle,
    hasBalanced,
    hasHarmonious,
    hasAesthetic,
    hasLight,
    hasSophisticated,
  ]

  const elegance = computeScore(positiveBooleans)
  const hasHighElegance = elegance >= 60

  let drape: DrapingMeasure['drape'] = 'no-elegance'
  if (elegance >= 90) drape = 'silk-curtain'
  else if (elegance >= 75) drape = 'fine-linen'
  else if (elegance >= 60) drape = 'proper-fabric'
  else if (elegance >= 40) drape = 'burlap'
  else if (elegance >= 20) drape = 'chain-link'

  return {
    elegance,
    drape,
    hasHighElegance,
    hasElegant,
    hasNoClunky,
    hasRefined,
    hasPolished,
    hasClean,
    hasGraceful,
    hasSimple,
    hasNoOvercomplicated,
    hasTasteful,
    hasSubtle,
    hasBalanced,
    hasHarmonious,
    hasAesthetic,
    hasLight,
    hasSophisticated,
    clunkyCount,
    overcomplicatedCount,
  }
}

/** @example measurePurifying('const x: string = ""') */
export function measurePurifying(content: string): PurifyingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(roughly|approximately|guesstimate)\b/i.test(content)
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradictory|inconsistent|conflicting)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasPure = !/\bany\b/.test(content)
  const hasHonest = /\b(export|public)\b/.test(content)
  const hasFaithful = /\b(readonly|private|protected)\b/.test(content)
  const hasUncontaminated = !/\b(var|eval)\b/.test(content)
  const hasUnadulterated = !/\b(hack|workaround|bypass)\b/i.test(content)
  const hasGenuine = /\b(class|interface|type)\b/.test(content)
  const hasAuthentic = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasAccurate,
    hasNoApproximate,
    hasConsistent,
    hasNoContradictory,
    hasPure,
    hasHonest,
    hasFaithful,
    hasUncontaminated,
    hasUnadulterated,
    hasGenuine,
    hasAuthentic,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let karat: PurifyingMeasure['karat'] = 'no-purity'
  if (purity >= 90) karat = '24-karat'
  else if (purity >= 75) karat = '22-karat'
  else if (purity >= 60) karat = 'proper-gold'
  else if (purity >= 40) karat = 'gold-plated'
  else if (purity >= 20) karat = 'fools-gold'

  return {
    purity,
    karat,
    hasHighPurity,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasAccurate,
    hasNoApproximate,
    hasConsistent,
    hasNoContradictory,
    hasPure,
    hasHonest,
    hasFaithful,
    hasUncontaminated,
    hasUnadulterated,
    hasGenuine,
    hasAuthentic,
    unsafeCount,
    contradictoryCount,
  }
}

/** @example measureEnduring('try { x() } catch { y() }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const hasNoUntested = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEnduring = /\b(function|=>|return)\b/.test(content)
  const hasDurable = /\b(class|interface|type)\b/.test(content)
  const hasPermanent = /\b(readonly|as const)\b/.test(content)
  const hasTimeless = /\b(async|await|Promise)\b/.test(content)
  const hasLasting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasStable,
    hasNoVolatile,
    hasTested,
    hasNoUntested,
    hasMaintained,
    hasEnduring,
    hasDurable,
    hasPermanent,
    hasTimeless,
    hasLasting,
    hasRobust,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let permanence: EnduringMeasure['permanence'] = 'no-resilience'
  if (resilience >= 90) permanence = 'eternal-gold'
  else if (resilience >= 75) permanence = 'lasting-alloy'
  else if (resilience >= 60) permanence = 'proper-endurance'
  else if (resilience >= 40) permanence = 'tarnishing-metal'
  else if (resilience >= 20) permanence = 'rusting-iron'

  return {
    resilience,
    permanence,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasStable,
    hasNoVolatile,
    hasTested,
    hasNoUntested,
    hasMaintained,
    hasEnduring,
    hasDurable,
    hasPermanent,
    hasTimeless,
    hasLasting,
    unhandledCount,
    volatileCount,
  }
}

/** @example measureAccumulating('class X implements Y { readonly z: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\b(quick|dirty|temporary)\b/gi) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(export|public)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasHistorical = /\b(function|class|interface)\b/.test(content)
  const hasTimeless = !/\bany\b/.test(content)
  const hasValuable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasWise = /\b(return|throw)\b/.test(content)
  const hasAccumulated = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasEvolved,
    hasHistorical,
    hasTimeless,
    hasValuable,
    hasWise,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let legacy: AccumulatingMeasure['legacy'] = 'no-wisdom'
  if (wisdom >= 90) legacy = 'pharaohs-treasure'
  else if (wisdom >= 75) legacy = 'kings-ransom'
  else if (wisdom >= 60) legacy = 'proper-hoard'
  else if (wisdom >= 40) legacy = 'merchants-purse'
  else if (wisdom >= 20) legacy = 'penniless'

  return {
    wisdom,
    legacy,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasEvolved,
    hasHistorical,
    hasTimeless,
    hasValuable,
    hasWise,
    hasAccumulated,
    hackedCount,
    adHocCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeGoldenThread(content, 'app.ts') */
export function analyzeGoldenThread(content: string, filePath: string): GoldenThread {
  const illuminating = measureIlluminating(content)
  const draping = measureDraping(content)
  const purifying = measurePurifying(content)
  const enduring = measureEnduring(content)
  const accumulating = measureAccumulating(content)

  const radiantClarity = illuminating.clarity
  const veilElegance = draping.elegance
  const aurumPurity = purifying.purity
  const goldenResilience = enduring.resilience
  const legacyWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    radiantClarity * 0.2 +
    veilElegance * 0.2 +
    aurumPurity * 0.2 +
    goldenResilience * 0.2 +
    legacyWisdom * 0.2,
  )

  const condition = classifyThreadCondition(qualityScore)

  return {
    file: filePath,
    radiantClarity,
    veilElegance,
    aurumPurity,
    goldenResilience,
    legacyWisdom,
    illuminating,
    draping,
    purifying,
    enduring,
    accumulating,
    condition,
    qualityScore,
  }
}

/** @example analyzeGoldenPalace(threads, 'src') */
export function analyzeGoldenPalace(threads: GoldenThread[], dirPath: string): GoldenPalace {
  if (threads.length === 0) {
    return {
      directory: dirPath,
      threads: [],
      avgClarity: 0,
      avgPurity: 0,
      avgWisdom: 0,
      goldenMasterpieceCount: 0,
      voidCount: 0,
      palaceType: 'no-palace',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    threads.reduce((s, t) => s + t.radiantClarity, 0) / threads.length,
  )
  const avgPurity = Math.round(
    threads.reduce((s, t) => s + t.aurumPurity, 0) / threads.length,
  )
  const avgWisdom = Math.round(
    threads.reduce((s, t) => s + t.legacyWisdom, 0) / threads.length,
  )

  const goldenMasterpieceCount = threads.filter(
    (t) => t.condition === 'golden-masterpiece',
  ).length
  const voidCount = threads.filter((t) => t.condition === 'void').length

  const palaceType = classifyPalaceType(threads)
  const avgQuality = Math.round(
    threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length,
  )
  const condition = classifyPalaceCondition(avgQuality)

  return {
    directory: dirPath,
    threads,
    avgClarity,
    avgPurity,
    avgWisdom,
    goldenMasterpieceCount,
    voidCount,
    palaceType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildGoldenCurtainResult(['a.ts'], [content]) */
export async function buildGoldenCurtainResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<GoldenCurtainResult> {
  const threads: GoldenThread[] = files.map((file, i) =>
    analyzeGoldenThread(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, GoldenThread[]>()
  for (const thread of threads) {
    const dir = thread.file.includes('/')
      ? thread.file.substring(0, thread.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(thread)
    } else {
      dirMap.set(dir, [thread])
    }
  }

  const palaces: GoldenPalace[] = Array.from(dirMap.entries()).map(([dir, dirThreads]) =>
    analyzeGoldenPalace(dirThreads, dir),
  )

  const avgClarity =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.radiantClarity, 0) / threads.length)
      : 0
  const avgPurity =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.aurumPurity, 0) / threads.length)
      : 0
  const avgWisdom =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.legacyWisdom, 0) / threads.length)
      : 0

  const overallBrilliance =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.qualityScore, 0) / threads.length)
      : 0
  const isGolden = overallBrilliance >= 60

  const treasury = { avgClarity, avgPurity, avgWisdom, isGolden, overallBrilliance }

  const avgVeilElegance =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.veilElegance, 0) / threads.length)
      : 0
  const avgGoldenResilience =
    threads.length > 0
      ? Math.round(threads.reduce((s, t) => s + t.goldenResilience, 0) / threads.length)
      : 0
  const avgLegacyWisdom = avgWisdom

  const goldenMasterpieceCount = threads.filter(
    (t) => t.condition === 'golden-masterpiece',
  ).length
  const royalStandardCount = threads.filter(
    (t) => t.condition === 'royal-standard',
  ).length
  const properGoldCount = threads.filter(
    (t) => t.condition === 'proper-gold',
  ).length
  const brassFinishCount = threads.filter(
    (t) => t.condition === 'brass-finish',
  ).length
  const tarnishedCopperCount = threads.filter(
    (t) => t.condition === 'tarnished-copper',
  ).length
  const voidCount = threads.filter((t) => t.condition === 'void').length

  const hasHighClarityCount = threads.filter(
    (t) => t.illuminating.hasHighClarity,
  ).length
  const hasHighEleganceCount = threads.filter(
    (t) => t.draping.hasHighElegance,
  ).length
  const hasHighPurityCount = threads.filter(
    (t) => t.purifying.hasHighPurity,
  ).length
  const hasHighResilienceCount = threads.filter(
    (t) => t.enduring.hasHighResilience,
  ).length
  const hasHighWisdomCount = threads.filter(
    (t) => t.accumulating.hasHighWisdom,
  ).length

  const goldsmithGrade = classifyGoldsmithGrade(overallBrilliance)

  const bestThread = threads.length > 0
    ? threads.reduce((best, t) => (t.qualityScore > best.qualityScore ? t : best)).file
    : ''
  const clearest = threads.length > 0
    ? threads.reduce((best, t) => (t.radiantClarity > best.radiantClarity ? t : best)).file
    : ''
  const mostElegant = threads.length > 0
    ? threads.reduce((best, t) => (t.veilElegance > best.veilElegance ? t : best)).file
    : ''
  const purest = threads.length > 0
    ? threads.reduce((best, t) => (t.aurumPurity > best.aurumPurity ? t : best)).file
    : ''
  const mostResilient = threads.length > 0
    ? threads.reduce((best, t) => (t.goldenResilience > best.goldenResilience ? t : best)).file
    : ''
  const wisest = threads.length > 0
    ? threads.reduce((best, t) => (t.legacyWisdom > best.legacyWisdom ? t : best)).file
    : ''

  const stats: GoldenCurtainResult['stats'] = {
    totalFiles: files.length,
    totalPalaces: palaces.length,
    avgRadiantClarity: avgClarity,
    avgVeilElegance,
    avgAurumPurity: avgPurity,
    avgGoldenResilience,
    avgLegacyWisdom,
    goldenMasterpieceCount,
    royalStandardCount,
    properGoldCount,
    brassFinishCount,
    tarnishedCopperCount,
    voidCount,
    hasHighClarityCount,
    hasHighEleganceCount,
    hasHighPurityCount,
    hasHighResilienceCount,
    hasHighWisdomCount,
    overallBrilliance,
    goldsmithGrade,
    bestThread,
    clearest,
    mostElegant,
    purest,
    mostResilient,
    wisest,
  }

  const recommendations = generateRecommendations(threads, palaces, treasury, stats)

  return { threads, palaces, treasury, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(threads, palaces, treasury, stats) */
export function generateRecommendations(
  threads: GoldenThread[],
  palaces: GoldenPalace[],
  treasury: GoldenCurtainResult['treasury'],
  stats: GoldenCurtainResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgRadiantClarity >= 90 &&
    stats.avgVeilElegance >= 90 &&
    stats.avgAurumPurity >= 90 &&
    stats.avgGoldenResilience >= 90 &&
    stats.avgLegacyWisdom >= 90
  ) {
    recs.push(
      'Your golden veil is a masterpiece of radiant perfection! Every thread gleams with 24-karat brilliance across the ages!',
    )
    return recs
  }

  if (stats.avgRadiantClarity < 60) {
    recs.push(
      'Illuminate the code — a golden veil transforms light into warmth; your code should radiate clarity like sunlight through gold leaf',
    )
  }

  if (stats.avgVeilElegance < 60) {
    recs.push(
      'Drape with elegance — the simplest veil becomes the most precious when crafted with golden refinement',
    )
  }

  if (stats.avgAurumPurity < 60) {
    recs.push(
      'Purify the gold — element 79 tolerates no contamination; remove every impurity until only authentic code remains',
    )
  }

  if (stats.avgGoldenResilience < 60) {
    recs.push(
      'Forge endurance — gold survives millennia unchanged; your code should endure through eras of changing requirements',
    )
  }

  if (stats.avgLegacyWisdom < 60) {
    recs.push(
      'Accumulate wisdom — gold has been humanity\'s store of value for 6,000 years; your code should carry timeless value across generations',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The treasury has been plundered — reforge the golden threads before the last glimmer fades to brass',
    )
  }

  const voidThreads = threads.filter((t) => t.condition === 'void')
  if (voidThreads.length > 0 && voidThreads.length <= 5) {
    recs.push(
      `Re-examine these tarnished threads: ${voidThreads.map((t) => t.file).join(', ')}`,
    )
  } else if (voidThreads.length > 5) {
    recs.push(
      `Re-examine these ${voidThreads.length} tarnished threads before the golden treasury collapses`,
    )
  }

  const poorPalaces = palaces.filter(
    (p) => p.condition === 'void' || p.condition === 'alley',
  )
  if (poorPalaces.length === palaces.length && palaces.length > 0) {
    recs.push(
      'All palaces have crumbled — the golden dynasty needs complete restoration from the foundation up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your golden curtain shimmers with royal brilliance — each thread woven with the precision of a master goldsmith')
  }

  return recs
}
