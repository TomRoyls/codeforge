// ─── Interfaces ──────────────────────────────────────────

export interface AgingMeasure {
  wisdom: number
  patina:
    | 'ancient-green'
    | 'aged-bronze'
    | 'proper-patina'
    | 'tarnished-metal'
    | 'raw-copper'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellEstablished: boolean
  hasNoChaotic: boolean
  hasMature: boolean
  hasNoImmature: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasConsistent: boolean
  hasEnduring: boolean
  hasRefined: boolean
  hasPolished: boolean
  chaoticCount: number
  undocumentedCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dawn:
    | 'golden-sunrise'
    | 'clear-dawn'
    | 'proper-morning'
    | 'gray-dawn'
    | 'pre-dawn'
    | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasNoHidden: boolean
  hasUnderstandable: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasIlluminated: boolean
  hasRevealed: boolean
  hasOpen: boolean
  hasFresh: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ConductingMeasure {
  quality: number
  conductor:
    | 'superconductor'
    | 'excellent-copper'
    | 'proper-wire'
    | 'resistive'
    | 'insulator'
    | 'no-quality'
  hasHighQuality: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasPrecise: boolean
  hasNoApproximate: boolean
  hasFast: boolean
  hasReliable: boolean
  hasAccurate: boolean
  hasNoLossy: boolean
  hasFaithful: boolean
  hasDirect: boolean
  hasOptimal: boolean
  wastefulCount: number
  unsafeCount: number
}

export interface RadiatingMeasure {
  resilience: number
  warmth:
    | 'forge-fire'
    | 'warm-glow'
    | 'proper-heat'
    | 'lukewarm'
    | 'cold-metal'
    | 'no-warmth'
  hasHighResilience: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasWelcoming: boolean
  hasNoIntimidating: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasForgiving: boolean
  hasResilient: boolean
  hasGentle: boolean
  hasPatient: boolean
  hasKind: boolean
  hasComfortable: boolean
  hasRecoverable: boolean
  hostileCount: number
  unhandledCount: number
}

export interface HammeringMeasure {
  strength: number
  forge:
    | 'master-smith'
    | 'skilled-forge'
    | 'proper-hammer'
    | 'crude-tool'
    | 'no-forge'
    | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasOrganized: boolean
  hasDisciplined: boolean
  hasCrafted: boolean
  hasIntentional: boolean
  hasShaped: boolean
  hasTempered: boolean
  hasHardened: boolean
  hasRefined: boolean
  tangledCount: number
  monolithicCount: number
}

export type IngotCondition =
  | 'copper-masterpiece'
  | 'golden-morning'
  | 'proper-alloy'
  | 'tarnished-bronze'
  | 'raw-ore'
  | 'void'

export interface CopperIngot {
  file: string
  patinaWisdom: number
  dawnClarity: number
  conductivityQuality: number
  warmthResilience: number
  forgeStrength: number
  aging: AgingMeasure
  illuminating: IlluminatingMeasure
  conducting: ConductingMeasure
  radiating: RadiatingMeasure
  hammering: HammeringMeasure
  condition: IngotCondition
  qualityScore: number
}

export type ForgeCondition =
  | 'master-forge'
  | 'smith-hall'
  | 'proper-workshop'
  | 'rusty-shed'
  | 'abandoned-mine'
  | 'void'

export interface CopperForge {
  directory: string
  ingots: CopperIngot[]
  avgWisdom: number
  avgStrength: number
  avgClarity: number
  copperMasterpieceCount: number
  voidCount: number
  forgeType: 'grand-forge' | 'copper-workshop' | 'proper-smithy' | 'backyard-foundry' | 'no-forge' | 'void'
  condition: ForgeCondition
}

export interface CopperMorningResult {
  ingots: CopperIngot[]
  forges: CopperForge[]
  metallurgy: {
    avgWisdom: number
    avgStrength: number
    avgClarity: number
    isCopper: boolean
    overallLuminosity: number
  }
  stats: {
    totalFiles: number
    totalForges: number
    avgPatinaWisdom: number
    avgDawnClarity: number
    avgConductivityQuality: number
    avgWarmthResilience: number
    avgForgeStrength: number
    copperMasterpieceCount: number
    goldenMorningCount: number
    properAlloyCount: number
    tarnishedBronzeCount: number
    rawOreCount: number
    voidCount: number
    hasHighWisdomCount: number
    hasHighClarityCount: number
    hasHighQualityCount: number
    hasHighResilienceCount: number
    hasHighStrengthCount: number
    overallLuminosity: number
    smithGrade: 'master-smith' | 'journeyman' | 'apprentice-smith' | 'novice' | 'tinkerer' | 'no-skill'
    bestIngot: string
    wisest: string
    clearest: string
    mostConductive: string
    warmest: string
    strongest: string
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

/** @example classifyCondition(90) */
export function classifyCondition(score: number): IngotCondition {
  if (score >= 90) return 'copper-masterpiece'
  if (score >= 75) return 'golden-morning'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'tarnished-bronze'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifyForgeType(ingots) */
export function classifyForgeType(
  ingots: CopperIngot[],
): CopperForge['forgeType'] {
  if (ingots.length === 0) return 'void'
  const avg =
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length
  if (avg >= 85) return 'grand-forge'
  if (avg >= 70) return 'copper-workshop'
  if (avg >= 55) return 'proper-smithy'
  if (avg >= 35) return 'backyard-foundry'
  return 'no-forge'
}

/** @example classifyForgeCondition(80) */
export function classifyForgeCondition(score: number): ForgeCondition {
  if (score >= 85) return 'master-forge'
  if (score >= 70) return 'smith-hall'
  if (score >= 55) return 'proper-workshop'
  if (score >= 35) return 'rusty-shed'
  if (score >= 15) return 'abandoned-mine'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(
  avgLuminosity: number,
): CopperMorningResult['stats']['smithGrade'] {
  if (avgLuminosity >= 80) return 'master-smith'
  if (avgLuminosity >= 65) return 'journeyman'
  if (avgLuminosity >= 50) return 'apprentice-smith'
  if (avgLuminosity >= 35) return 'novice'
  if (avgLuminosity >= 20) return 'tinkerer'
  return 'no-skill'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureAging('const x: readonly string = ""') */
export function measureAging(content: string): AgingMeasure {
  const hasWellEstablished = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasNoImmature = !/\b(hack|quick|dirty|temporary)\b/i.test(content)
  const hasProven = /\b(export|public)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|wip|todo)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\/\/\s*(hack|fixme|todo)/gi) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const hasNoUntested = !/\bany\b/.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasConsistent = /\b(import|export)\b/.test(content)
  const hasEnduring = /\b(private|protected|public)\b/.test(content)
  const hasRefined = /\b(string|number|boolean|void)\b/.test(content)
  const hasPolished = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasWellEstablished,
    hasNoChaotic,
    hasMature,
    hasNoImmature,
    hasProven,
    hasNoExperimental,
    hasDocumented,
    hasNoUndocumented,
    hasTested,
    hasNoUntested,
    hasStable,
    hasConsistent,
    hasEnduring,
    hasRefined,
    hasPolished,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let patina: AgingMeasure['patina'] = 'no-wisdom'
  if (wisdom >= 90) patina = 'ancient-green'
  else if (wisdom >= 75) patina = 'aged-bronze'
  else if (wisdom >= 60) patina = 'proper-patina'
  else if (wisdom >= 40) patina = 'tarnished-metal'
  else if (wisdom >= 20) patina = 'raw-copper'

  return {
    wisdom,
    patina,
    hasHighWisdom,
    hasWellEstablished,
    hasNoChaotic,
    hasMature,
    hasNoImmature,
    hasProven,
    hasNoExperimental,
    hasDocumented,
    hasNoUndocumented,
    hasTested,
    hasNoUntested,
    hasStable,
    hasConsistent,
    hasEnduring,
    hasRefined,
    hasPolished,
    chaoticCount,
    undocumentedCount,
  }
}

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
  const hasNoHidden = !/\b(hack|workaround|bypass)\b/i.test(content)
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(return|throw)\b/.test(content)
  const hasIlluminated = /\b(try|catch|if)\b/.test(content)
  const hasRevealed = /\b(readonly|private|protected)\b/.test(content)
  const hasOpen = /\b(async|await|Promise)\b/.test(content)
  const hasFresh = /\b(new|class|extends)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasNoHidden,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasIlluminated,
    hasRevealed,
    hasOpen,
    hasFresh,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let dawn: IlluminatingMeasure['dawn'] = 'no-clarity'
  if (clarity >= 90) dawn = 'golden-sunrise'
  else if (clarity >= 75) dawn = 'clear-dawn'
  else if (clarity >= 60) dawn = 'proper-morning'
  else if (clarity >= 40) dawn = 'gray-dawn'
  else if (clarity >= 20) dawn = 'pre-dawn'

  return {
    clarity,
    dawn,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasNoHidden,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasIlluminated,
    hasRevealed,
    hasOpen,
    hasFresh,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureConducting('function f(): string { return "" }') */
export function measureConducting(content: string): ConductingMeasure {
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const wastefulCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasClean = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasPrecise = /\b(readonly|as const)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|close)\b/i.test(content)
  const hasFast = /\b(async|await|Promise)\b/.test(content)
  const hasReliable = /\b(try|catch|throw|if)\b/.test(content)
  const hasAccurate = /\b(string|number|boolean)\b/.test(content)
  const hasNoLossy = !/\bany\b/.test(content)
  const hasFaithful = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(return|throw)\b/.test(content)
  const hasOptimal = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasEfficient,
    hasNoWasteful,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasPrecise,
    hasNoApproximate,
    hasFast,
    hasReliable,
    hasAccurate,
    hasNoLossy,
    hasFaithful,
    hasDirect,
    hasOptimal,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60

  let conductor: ConductingMeasure['conductor'] = 'no-quality'
  if (quality >= 90) conductor = 'superconductor'
  else if (quality >= 75) conductor = 'excellent-copper'
  else if (quality >= 60) conductor = 'proper-wire'
  else if (quality >= 40) conductor = 'resistive'
  else if (quality >= 20) conductor = 'insulator'

  return {
    quality,
    conductor,
    hasHighQuality,
    hasEfficient,
    hasNoWasteful,
    hasTypeSafe,
    hasNoUnsafe,
    hasClean,
    hasNoDirty,
    hasPrecise,
    hasNoApproximate,
    hasFast,
    hasReliable,
    hasAccurate,
    hasNoLossy,
    hasFaithful,
    hasDirect,
    hasOptimal,
    wastefulCount,
    unsafeCount,
  }
}

/** @example measureRadiating('try { x() } catch { y() }') */
export function measureRadiating(content: string): RadiatingMeasure {
  const hasApproachable = /\b(const|let|function|class)\b/.test(content)
  const hostileCount = (content.match(/\b(eval|danger|unsafe)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasWelcoming = /\b(export|public)\b/.test(content)
  const hasNoIntimidating = !/\b(intimidat|scary|confusing)\b/i.test(content)
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw|catch)\b/.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasForgiving = /\b(try|catch)\b/.test(content)
  const hasResilient = /\b(return|throw|if)\b/.test(content)
  const hasGentle = /\b(string|number|boolean)\b/.test(content)
  const hasPatient = /\b(async|await|Promise)\b/.test(content)
  const hasKind = /\b(import|export)\b/.test(content)
  const hasComfortable = /\b(interface|type|class)\b/.test(content)
  const hasRecoverable = /\b(try|catch|if|return)\b/.test(content)

  const positiveBooleans = [
    hasApproachable,
    hasNoHostile,
    hasWelcoming,
    hasNoIntimidating,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasForgiving,
    hasResilient,
    hasGentle,
    hasPatient,
    hasKind,
    hasComfortable,
    hasRecoverable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let warmth: RadiatingMeasure['warmth'] = 'no-warmth'
  if (resilience >= 90) warmth = 'forge-fire'
  else if (resilience >= 75) warmth = 'warm-glow'
  else if (resilience >= 60) warmth = 'proper-heat'
  else if (resilience >= 40) warmth = 'lukewarm'
  else if (resilience >= 20) warmth = 'cold-metal'

  return {
    resilience,
    warmth,
    hasHighResilience,
    hasApproachable,
    hasNoHostile,
    hasWelcoming,
    hasNoIntimidating,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasForgiving,
    hasResilient,
    hasGentle,
    hasPatient,
    hasKind,
    hasComfortable,
    hasRecoverable,
    hostileCount,
    unhandledCount,
  }
}

/** @example measureHammering('class X { private y: string }') */
export function measureHammering(content: string): HammeringMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(export|import)\b/.test(content)
  const monolithicCount = (content.match(/\b(global|window|document)\b/g) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasCleanPipelines = /\b(function|=>|return)\b/.test(content)
  const tangledCount = (content.match(/\b(hack|workaround|bypass)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasDisciplined = /\b(try|catch|throw|if)\b/.test(content)
  const hasCrafted = /\b(string|number|boolean|void)\b/.test(content)
  const hasIntentional = /\b(const|readonly|as const)\b/.test(content)
  const hasShaped = /\b(async|await|Promise)\b/.test(content)
  const hasTempered = /\b(readonly|private)\b/.test(content)
  const hasHardened = /\b(try|catch|finally)\b/.test(content)
  const hasRefined = /\b(export|public)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasOrganized,
    hasDisciplined,
    hasCrafted,
    hasIntentional,
    hasShaped,
    hasTempered,
    hasHardened,
    hasRefined,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60

  let forge: HammeringMeasure['forge'] = 'no-strength'
  if (strength >= 90) forge = 'master-smith'
  else if (strength >= 75) forge = 'skilled-forge'
  else if (strength >= 60) forge = 'proper-hammer'
  else if (strength >= 40) forge = 'crude-tool'
  else if (strength >= 20) forge = 'no-forge'

  return {
    strength,
    forge,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasOrganized,
    hasDisciplined,
    hasCrafted,
    hasIntentional,
    hasShaped,
    hasTempered,
    hasHardened,
    hasRefined,
    tangledCount,
    monolithicCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCopperIngot(content, 'app.ts') */
export function analyzeCopperIngot(content: string, filePath: string): CopperIngot {
  const aging = measureAging(content)
  const illuminating = measureIlluminating(content)
  const conducting = measureConducting(content)
  const radiating = measureRadiating(content)
  const hammering = measureHammering(content)

  const patinaWisdom = aging.wisdom
  const dawnClarity = illuminating.clarity
  const conductivityQuality = conducting.quality
  const warmthResilience = radiating.resilience
  const forgeStrength = hammering.strength

  const qualityScore = Math.round(
    patinaWisdom * 0.2 +
    dawnClarity * 0.2 +
    conductivityQuality * 0.2 +
    warmthResilience * 0.2 +
    forgeStrength * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    patinaWisdom,
    dawnClarity,
    conductivityQuality,
    warmthResilience,
    forgeStrength,
    aging,
    illuminating,
    conducting,
    radiating,
    hammering,
    condition,
    qualityScore,
  }
}

/** @example analyzeCopperForge(ingots, 'src') */
export function analyzeCopperForge(ingots: CopperIngot[], dirPath: string): CopperForge {
  if (ingots.length === 0) {
    return {
      directory: dirPath,
      ingots: [],
      avgWisdom: 0,
      avgStrength: 0,
      avgClarity: 0,
      copperMasterpieceCount: 0,
      voidCount: 0,
      forgeType: 'void',
      condition: 'void',
    }
  }

  const avgWisdom = Math.round(
    ingots.reduce((s, i) => s + i.patinaWisdom, 0) / ingots.length,
  )
  const avgStrength = Math.round(
    ingots.reduce((s, i) => s + i.forgeStrength, 0) / ingots.length,
  )
  const avgClarity = Math.round(
    ingots.reduce((s, i) => s + i.dawnClarity, 0) / ingots.length,
  )

  const copperMasterpieceCount = ingots.filter(
    (i) => i.condition === 'copper-masterpiece',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const forgeType = classifyForgeType(ingots)
  const avgQuality = Math.round(
    ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length,
  )
  const condition = classifyForgeCondition(avgQuality)

  return {
    directory: dirPath,
    ingots,
    avgWisdom,
    avgStrength,
    avgClarity,
    copperMasterpieceCount,
    voidCount,
    forgeType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCopperMorningResult(['a.ts'], [content]) */
export async function buildCopperMorningResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperMorningResult> {
  const ingots: CopperIngot[] = files.map((file, i) =>
    analyzeCopperIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperIngot[]>()
  for (const ingot of ingots) {
    const dir = ingot.file.includes('/')
      ? ingot.file.substring(0, ingot.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ingot)
    } else {
      dirMap.set(dir, [ingot])
    }
  }

  const forges: CopperForge[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeCopperForge(dirIngots, dir),
  )

  const avgWisdom =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.patinaWisdom, 0) / ingots.length)
      : 0
  const avgStrength =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.forgeStrength, 0) / ingots.length)
      : 0
  const avgClarity =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.dawnClarity, 0) / ingots.length)
      : 0

  const overallLuminosity =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.qualityScore, 0) / ingots.length)
      : 0
  const isCopper = overallLuminosity >= 60

  const metallurgy = { avgWisdom, avgStrength, avgClarity, isCopper, overallLuminosity }

  const avgPatinaWisdom = avgWisdom
  const avgDawnClarity = avgClarity
  const avgConductivityQuality =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.conductivityQuality, 0) / ingots.length)
      : 0
  const avgWarmthResilience =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, i) => s + i.warmthResilience, 0) / ingots.length)
      : 0
  const avgForgeStrength = avgStrength

  const copperMasterpieceCount = ingots.filter(
    (i) => i.condition === 'copper-masterpiece',
  ).length
  const goldenMorningCount = ingots.filter(
    (i) => i.condition === 'golden-morning',
  ).length
  const properAlloyCount = ingots.filter(
    (i) => i.condition === 'proper-alloy',
  ).length
  const tarnishedBronzeCount = ingots.filter(
    (i) => i.condition === 'tarnished-bronze',
  ).length
  const rawOreCount = ingots.filter(
    (i) => i.condition === 'raw-ore',
  ).length
  const voidCount = ingots.filter((i) => i.condition === 'void').length

  const hasHighWisdomCount = ingots.filter(
    (i) => i.aging.hasHighWisdom,
  ).length
  const hasHighClarityCount = ingots.filter(
    (i) => i.illuminating.hasHighClarity,
  ).length
  const hasHighQualityCount = ingots.filter(
    (i) => i.conducting.hasHighQuality,
  ).length
  const hasHighResilienceCount = ingots.filter(
    (i) => i.radiating.hasHighResilience,
  ).length
  const hasHighStrengthCount = ingots.filter(
    (i) => i.hammering.hasHighStrength,
  ).length

  const smithGrade = classifySmithGrade(overallLuminosity)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, i) => (i.qualityScore > best.qualityScore ? i : best)).file
    : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.patinaWisdom > best.patinaWisdom ? i : best)).file
    : ''
  const clearest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.dawnClarity > best.dawnClarity ? i : best)).file
    : ''
  const mostConductive = ingots.length > 0
    ? ingots.reduce((best, i) => (i.conductivityQuality > best.conductivityQuality ? i : best)).file
    : ''
  const warmest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.warmthResilience > best.warmthResilience ? i : best)).file
    : ''
  const strongest = ingots.length > 0
    ? ingots.reduce((best, i) => (i.forgeStrength > best.forgeStrength ? i : best)).file
    : ''

  const stats: CopperMorningResult['stats'] = {
    totalFiles: files.length,
    totalForges: forges.length,
    avgPatinaWisdom,
    avgDawnClarity,
    avgConductivityQuality,
    avgWarmthResilience,
    avgForgeStrength,
    copperMasterpieceCount,
    goldenMorningCount,
    properAlloyCount,
    tarnishedBronzeCount,
    rawOreCount,
    voidCount,
    hasHighWisdomCount,
    hasHighClarityCount,
    hasHighQualityCount,
    hasHighResilienceCount,
    hasHighStrengthCount,
    overallLuminosity,
    smithGrade,
    bestIngot,
    wisest,
    clearest,
    mostConductive,
    warmest,
    strongest,
  }

  const recommendations = generateRecommendations(ingots, forges, metallurgy, stats)

  return { ingots, forges, metallurgy, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, forges, metallurgy, stats) */
export function generateRecommendations(
  ingots: CopperIngot[],
  forges: CopperForge[],
  _metallurgy: CopperMorningResult['metallurgy'],
  stats: CopperMorningResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPatinaWisdom >= 90 &&
    stats.avgDawnClarity >= 90 &&
    stats.avgConductivityQuality >= 90 &&
    stats.avgWarmthResilience >= 90 &&
    stats.avgForgeStrength >= 90
  ) {
    recs.push(
      'Your copper morning is a masterpiece! The patina of ages meets the golden dawn in perfect harmony!',
    )
    return recs
  }

  if (stats.avgPatinaWisdom < 60) {
    recs.push(
      'Let the patina develop — code should accumulate wisdom like aged copper, its green patina a record of seasons well-weathered',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Clear the morning mist — code should shine with the clarity of dawn light on polished copper',
    )
  }

  if (stats.avgConductivityQuality < 60) {
    recs.push(
      'Improve conductivity — code should transmit signals with the faithful efficiency of pure copper wire',
    )
  }

  if (stats.avgWarmthResilience < 60) {
    recs.push(
      'Warm the metal — code should be as approachable and comforting as a copper mug radiating gentle heat',
    )
  }

  if (stats.avgForgeStrength < 60) {
    recs.push(
      'Return to the forge — code should show the deliberate craftsmanship of a master coppersmith shaping raw metal',
    )
  }

  if (stats.overallLuminosity < 40) {
    recs.push(
      'The copper has gone cold — rekindle the forge and reshape the metal before the morning light fades entirely',
    )
  }

  const voidIngots = ingots.filter((i) => i.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(
      `Re-examine these unrefined ores: ${voidIngots.map((i) => i.file).join(', ')}`,
    )
  } else if (voidIngots.length > 5) {
    recs.push(
      `Re-examine these ${voidIngots.length} unrefined ores before the entire mine collapses`,
    )
  }

  const poorForges = forges.filter(
    (f) => f.condition === 'void' || f.condition === 'abandoned-mine',
  )
  if (poorForges.length === forges.length && forges.length > 0) {
    recs.push(
      'All forges have gone cold — the copper morning needs complete reconstruction from the foundry up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your copper morning radiates warmth and wisdom across the entire codebase — keep the forge fires burning bright')
  }

  return recs
}
