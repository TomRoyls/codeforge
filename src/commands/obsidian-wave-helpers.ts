// ─── Interfaces ──────────────────────────────────────────

export interface FormingMeasure {
  glass: number
  formation: 'flawless-obsidian' | 'volcanic-crystal' | 'proper-glass' | 'cooled-lava' | 'warm-rock' | 'no-glass'
  hasHighGlass: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasIntentional: boolean
  hasNoAccidental: boolean
  hasDisciplined: boolean
  hasCrafted: boolean
  hasShaped: boolean
  hasForged: boolean
  hasTempered: boolean
  hasHardened: boolean
  hasRefined: boolean
  chaoticCount: number
  tangledCount: number
}

export interface RevealingMeasure {
  depth: number
  clarity: 'black-mirror' | 'deep-pool' | 'proper-depth' | 'murky-water' | 'surface-only' | 'no-depth'
  hasHighDepth: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasTransparent: boolean
  hasUnderstandable: boolean
  hasDeepLogic: boolean
  hasInsightful: boolean
  hasDocumented: boolean
  hasVisible: boolean
  hasRevealed: boolean
  hasProfound: boolean
  hasIlluminated: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EnduringMeasure {
  resilience: number
  darkness: 'volcanic-strength' | 'dark-armor' | 'proper-shade' | 'thin-veil' | 'transparent' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasStable: boolean
  hasResilient: boolean
  hasForgiving: boolean
  hasEnduring: boolean
  hasHardened: boolean
  hasNoVulnerable: boolean
  hasRecoverable: boolean
  unhandledCount: number
  untestedCount: number
}

export interface ReflectingMeasure {
  precision: number
  mirror: 'surgical-edge' | 'razor-sharp' | 'proper-blade' | 'dull-edge' | 'blunt-force' | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasNoVague: boolean
  hasTypeSafe: boolean
  hasPrecise: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasUndistorted: boolean
  hasSharp: boolean
  hasDefined: boolean
  hasCrisp: boolean
  hasNoBlurry: boolean
  approximateCount: number
  vagueCount: number
}

export interface ChannelingMeasure {
  wisdom: number
  abyss: 'volcanic-sage' | 'depth-keeper' | 'proper-diver' | 'surface-swimmer' | 'land-dweller' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasPatterned: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasEvolved: boolean
  hasConnected: boolean
  hasAccumulated: boolean
  hackedCount: number
  adHocCount: number
}

export type ShardCondition =
  | 'obsidian-masterpiece'
  | 'volcanic-perfection'
  | 'proper-blade'
  | 'dull-glass'
  | 'warm-stone'
  | 'void'

export interface ObsidianShard {
  file: string
  volcanicGlass: number
  clarityDepth: number
  darkResilience: number
  mirrorPrecision: number
  abyssWisdom: number
  forming: FormingMeasure
  revealing: RevealingMeasure
  enduring: EnduringMeasure
  reflecting: ReflectingMeasure
  channeling: ChannelingMeasure
  condition: ShardCondition
  qualityScore: number
}

export type ReefCondition =
  | 'obsidian-cathedral'
  | 'dark-palace'
  | 'proper-cave'
  | 'shallow-pool'
  | 'dry-land'
  | 'void'

export interface ObsidianReef {
  directory: string
  shards: ObsidianShard[]
  avgGlass: number
  avgPrecision: number
  avgWisdom: number
  obsidianMasterpieceCount: number
  voidCount: number
  reefType: 'volcanic-reef' | 'obsidian-shelf' | 'proper-formation' | 'rocky-outcrop' | 'sandbar' | 'no-reef'
  condition: ReefCondition
}

export interface ObsidianTideResult {
  shards: ObsidianShard[]
  reefs: ObsidianReef[]
  volcano: {
    avgGlass: number
    avgPrecision: number
    avgWisdom: number
    isObsidian: boolean
    overallSharpness: number
  }
  stats: {
    totalFiles: number
    totalReefs: number
    avgVolcanicGlass: number
    avgClarityDepth: number
    avgDarkResilience: number
    avgMirrorPrecision: number
    avgAbyssWisdom: number
    obsidianMasterpieceCount: number
    volcanicPerfectionCount: number
    properBladeCount: number
    dullGlassCount: number
    warmStoneCount: number
    voidCount: number
    hasHighGlassCount: number
    hasHighDepthCount: number
    hasHighResilienceCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallSharpness: number
    bladesmithGrade: 'master-bladesmith' | 'obsidian-forger' | 'stone-cutter' | 'apprentice' | 'novice' | 'rock-basher'
    bestShard: string
    bestFormed: string
    deepest: string
    mostResilient: string
    sharpest: string
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

/** @example classifyCondition(90) */
export function classifyCondition(score: number): ShardCondition {
  if (score >= 90) return 'obsidian-masterpiece'
  if (score >= 75) return 'volcanic-perfection'
  if (score >= 60) return 'proper-blade'
  if (score >= 40) return 'dull-glass'
  if (score >= 20) return 'warm-stone'
  return 'void'
}

/** @example classifyReefType(shards) */
export function classifyReefType(
  shards: ObsidianShard[],
): ObsidianReef['reefType'] {
  if (shards.length === 0) return 'no-reef'
  const avg =
    shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length
  if (avg >= 85) return 'volcanic-reef'
  if (avg >= 70) return 'obsidian-shelf'
  if (avg >= 55) return 'proper-formation'
  if (avg >= 35) return 'rocky-outcrop'
  return 'sandbar'
}

/** @example classifyReefCondition(80) */
export function classifyReefCondition(score: number): ReefCondition {
  if (score >= 85) return 'obsidian-cathedral'
  if (score >= 70) return 'dark-palace'
  if (score >= 55) return 'proper-cave'
  if (score >= 35) return 'shallow-pool'
  if (score >= 15) return 'dry-land'
  return 'void'
}

/** @example classifyBladesmithGrade(80) */
export function classifyBladesmithGrade(
  avgSharpness: number,
): ObsidianTideResult['stats']['bladesmithGrade'] {
  if (avgSharpness >= 80) return 'master-bladesmith'
  if (avgSharpness >= 65) return 'obsidian-forger'
  if (avgSharpness >= 50) return 'stone-cutter'
  if (avgSharpness >= 35) return 'apprentice'
  if (avgSharpness >= 20) return 'novice'
  return 'rock-basher'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureForming('class X { private y: string }') */
export function measureForming(content: string): FormingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasNoMonolithic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCleanPipelines = /\b(function|=>|return)\b/.test(content)
  const tangledCount = (content.match(/\b(hack|workaround|bypass)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasIntentional = /\b(const|readonly|as const)\b/.test(content)
  const hasNoAccidental = !/\b(accidental|random|incidental)\b/i.test(content)
  const hasDisciplined = /\b(try|catch|throw|if)\b/.test(content)
  const hasCrafted = /\b(string|number|boolean|void)\b/.test(content)
  const hasShaped = /\b(async|await|Promise)\b/.test(content)
  const hasForged = /\b(readonly|private|protected)\b/.test(content)
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
    hasIntentional,
    hasNoAccidental,
    hasDisciplined,
    hasCrafted,
    hasShaped,
    hasForged,
    hasTempered,
    hasHardened,
    hasRefined,
  ]

  const glass = computeScore(positiveBooleans)
  const hasHighGlass = glass >= 60

  let formation: FormingMeasure['formation'] = 'no-glass'
  if (glass >= 90) formation = 'flawless-obsidian'
  else if (glass >= 75) formation = 'volcanic-crystal'
  else if (glass >= 60) formation = 'proper-glass'
  else if (glass >= 40) formation = 'cooled-lava'
  else if (glass >= 20) formation = 'warm-rock'

  return {
    glass,
    formation,
    hasHighGlass,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasIntentional,
    hasNoAccidental,
    hasDisciplined,
    hasCrafted,
    hasShaped,
    hasForged,
    hasTempered,
    hasHardened,
    hasRefined,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureRevealing('export function greet(): string { }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|class|interface|type)\b/.test(content)
  const hasNoMystery = !/\b(magic|mystery|secret)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoObfuscated = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasDeepLogic = /\b(readonly|private|protected)\b/.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasRevealed = /\b(readonly|as const)\b/.test(content)
  const hasProfound = /\b(class|interface|type)\b/.test(content)
  const hasIlluminated = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasDeepLogic,
    hasInsightful,
    hasDocumented,
    hasVisible,
    hasRevealed,
    hasProfound,
    hasIlluminated,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let clarity: RevealingMeasure['clarity'] = 'no-depth'
  if (depth >= 90) clarity = 'black-mirror'
  else if (depth >= 75) clarity = 'deep-pool'
  else if (depth >= 60) clarity = 'proper-depth'
  else if (depth >= 40) clarity = 'murky-water'
  else if (depth >= 20) clarity = 'surface-only'

  return {
    depth,
    clarity,
    hasHighDepth,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasNoObfuscated,
    hasTransparent,
    hasUnderstandable,
    hasDeepLogic,
    hasInsightful,
    hasDocumented,
    hasVisible,
    hasRevealed,
    hasProfound,
    hasIlluminated,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureEnduring('try { x() } catch { y() }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw|catch)\b/.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasResilient = /\b(return|throw|if)\b/.test(content)
  const hasForgiving = /\b(try|catch)\b/.test(content)
  const hasEnduring = /\b(import|export)\b/.test(content)
  const hasHardened = /\b(class|interface|type)\b/.test(content)
  const hasNoVulnerable = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|if|return)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasStable,
    hasResilient,
    hasForgiving,
    hasEnduring,
    hasHardened,
    hasNoVulnerable,
    hasRecoverable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let darkness: EnduringMeasure['darkness'] = 'no-resilience'
  if (resilience >= 90) darkness = 'volcanic-strength'
  else if (resilience >= 75) darkness = 'dark-armor'
  else if (resilience >= 60) darkness = 'proper-shade'
  else if (resilience >= 40) darkness = 'thin-veil'
  else if (resilience >= 20) darkness = 'transparent'

  return {
    resilience,
    darkness,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasStable,
    hasResilient,
    hasForgiving,
    hasEnduring,
    hasHardened,
    hasNoVulnerable,
    hasRecoverable,
    unhandledCount,
    untestedCount,
  }
}

/** @example measureReflecting('function f(): string { return "" }') */
export function measureReflecting(content: string): ReflectingMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|close|around)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const vagueCount = (content.match(/\b(vague|loose|flexible|maybe)\b/gi) ?? []).length
  const hasNoVague = vagueCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasPrecise = /\b(const|readonly)\b/.test(content)
  const hasClean = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasNoDirty = !/\b(dirty|hacky|gross)\b/i.test(content)
  const hasCorrect = !/\bany\b/.test(content)
  const hasFaithful = /\b(import|export)\b/.test(content)
  const hasUndistorted = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(function|class|interface)\b/.test(content)
  const hasDefined = /\b(return|throw)\b/.test(content)
  const hasCrisp = /\b(try|catch|if)\b/.test(content)
  const hasNoBlurry = !/\b(blur|fuzzy|unclear|muddy)\b/i.test(content)

  const positiveBooleans = [
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasNoVague,
    hasTypeSafe,
    hasPrecise,
    hasClean,
    hasNoDirty,
    hasCorrect,
    hasFaithful,
    hasUndistorted,
    hasSharp,
    hasDefined,
    hasCrisp,
    hasNoBlurry,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let mirror: ReflectingMeasure['mirror'] = 'no-precision'
  if (precision >= 90) mirror = 'surgical-edge'
  else if (precision >= 75) mirror = 'razor-sharp'
  else if (precision >= 60) mirror = 'proper-blade'
  else if (precision >= 40) mirror = 'dull-edge'
  else if (precision >= 20) mirror = 'blunt-force'

  return {
    precision,
    mirror,
    hasHighPrecision,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasNoVague,
    hasTypeSafe,
    hasPrecise,
    hasClean,
    hasNoDirty,
    hasCorrect,
    hasFaithful,
    hasUndistorted,
    hasSharp,
    hasDefined,
    hasCrisp,
    hasNoBlurry,
    approximateCount,
    vagueCount,
  }
}

/** @example measureChanneling('class X implements Y { readonly z: string }') */
export function measureChanneling(content: string): ChannelingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(export|public)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasNoShallow = !/\b(quick|dirty|temporary)\b/i.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasEvolved = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasConnected = /\b(try|catch|if)\b/.test(content)
  const hasAccumulated = /\b(return|throw)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasInsightful,
    hasVisionary,
    hasEvolved,
    hasConnected,
    hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let abyss: ChannelingMeasure['abyss'] = 'no-wisdom'
  if (wisdom >= 90) abyss = 'volcanic-sage'
  else if (wisdom >= 75) abyss = 'depth-keeper'
  else if (wisdom >= 60) abyss = 'proper-diver'
  else if (wisdom >= 40) abyss = 'surface-swimmer'
  else if (wisdom >= 20) abyss = 'land-dweller'

  return {
    wisdom,
    abyss,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasInsightful,
    hasVisionary,
    hasEvolved,
    hasConnected,
    hasAccumulated,
    hackedCount,
    adHocCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeObsidianShard(content, 'app.ts') */
export function analyzeObsidianShard(content: string, filePath: string): ObsidianShard {
  const forming = measureForming(content)
  const revealing = measureRevealing(content)
  const enduring = measureEnduring(content)
  const reflecting = measureReflecting(content)
  const channeling = measureChanneling(content)

  const volcanicGlass = forming.glass
  const clarityDepth = revealing.depth
  const darkResilience = enduring.resilience
  const mirrorPrecision = reflecting.precision
  const abyssWisdom = channeling.wisdom

  const qualityScore = Math.round(
    volcanicGlass * 0.2 +
    clarityDepth * 0.2 +
    darkResilience * 0.2 +
    mirrorPrecision * 0.2 +
    abyssWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    volcanicGlass,
    clarityDepth,
    darkResilience,
    mirrorPrecision,
    abyssWisdom,
    forming,
    revealing,
    enduring,
    reflecting,
    channeling,
    condition,
    qualityScore,
  }
}

/** @example analyzeObsidianReef(shards, 'src') */
export function analyzeObsidianReef(shards: ObsidianShard[], dirPath: string): ObsidianReef {
  if (shards.length === 0) {
    return {
      directory: dirPath,
      shards: [],
      avgGlass: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      obsidianMasterpieceCount: 0,
      voidCount: 0,
      reefType: 'no-reef',
      condition: 'void',
    }
  }

  const avgGlass = Math.round(
    shards.reduce((s, sh) => s + sh.volcanicGlass, 0) / shards.length,
  )
  const avgPrecision = Math.round(
    shards.reduce((s, sh) => s + sh.mirrorPrecision, 0) / shards.length,
  )
  const avgWisdom = Math.round(
    shards.reduce((s, sh) => s + sh.abyssWisdom, 0) / shards.length,
  )

  const obsidianMasterpieceCount = shards.filter(
    (sh) => sh.condition === 'obsidian-masterpiece',
  ).length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length

  const reefType = classifyReefType(shards)
  const avgQuality = Math.round(
    shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length,
  )
  const condition = classifyReefCondition(avgQuality)

  return {
    directory: dirPath,
    shards,
    avgGlass,
    avgPrecision,
    avgWisdom,
    obsidianMasterpieceCount,
    voidCount,
    reefType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildObsidianTideResult(['a.ts'], [content]) */
export async function buildObsidianTideResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianTideResult> {
  const shards: ObsidianShard[] = files.map((file, i) =>
    analyzeObsidianShard(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ObsidianShard[]>()
  for (const shard of shards) {
    const dir = shard.file.includes('/')
      ? shard.file.substring(0, shard.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(shard)
    } else {
      dirMap.set(dir, [shard])
    }
  }

  const reefs: ObsidianReef[] = Array.from(dirMap.entries()).map(([dir, dirShards]) =>
    analyzeObsidianReef(dirShards, dir),
  )

  const avgGlass =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.volcanicGlass, 0) / shards.length)
      : 0
  const avgPrecision =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.mirrorPrecision, 0) / shards.length)
      : 0
  const avgWisdom =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.abyssWisdom, 0) / shards.length)
      : 0

  const overallSharpness =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.qualityScore, 0) / shards.length)
      : 0
  const isObsidian = overallSharpness >= 60

  const volcano = { avgGlass, avgPrecision, avgWisdom, isObsidian, overallSharpness }

  const avgVolcanicGlass = avgGlass
  const avgClarityDepth =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.clarityDepth, 0) / shards.length)
      : 0
  const avgDarkResilience =
    shards.length > 0
      ? Math.round(shards.reduce((s, sh) => s + sh.darkResilience, 0) / shards.length)
      : 0
  const avgMirrorPrecision = avgPrecision
  const avgAbyssWisdom = avgWisdom

  const obsidianMasterpieceCount = shards.filter(
    (sh) => sh.condition === 'obsidian-masterpiece',
  ).length
  const volcanicPerfectionCount = shards.filter(
    (sh) => sh.condition === 'volcanic-perfection',
  ).length
  const properBladeCount = shards.filter(
    (sh) => sh.condition === 'proper-blade',
  ).length
  const dullGlassCount = shards.filter(
    (sh) => sh.condition === 'dull-glass',
  ).length
  const warmStoneCount = shards.filter(
    (sh) => sh.condition === 'warm-stone',
  ).length
  const voidCount = shards.filter((sh) => sh.condition === 'void').length

  const hasHighGlassCount = shards.filter(
    (sh) => sh.forming.hasHighGlass,
  ).length
  const hasHighDepthCount = shards.filter(
    (sh) => sh.revealing.hasHighDepth,
  ).length
  const hasHighResilienceCount = shards.filter(
    (sh) => sh.enduring.hasHighResilience,
  ).length
  const hasHighPrecisionCount = shards.filter(
    (sh) => sh.reflecting.hasHighPrecision,
  ).length
  const hasHighWisdomCount = shards.filter(
    (sh) => sh.channeling.hasHighWisdom,
  ).length

  const bladesmithGrade = classifyBladesmithGrade(overallSharpness)

  const bestShard = shards.length > 0
    ? shards.reduce((best, sh) => (sh.qualityScore > best.qualityScore ? sh : best)).file
    : ''
  const bestFormed = shards.length > 0
    ? shards.reduce((best, sh) => (sh.volcanicGlass > best.volcanicGlass ? sh : best)).file
    : ''
  const deepest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.clarityDepth > best.clarityDepth ? sh : best)).file
    : ''
  const mostResilient = shards.length > 0
    ? shards.reduce((best, sh) => (sh.darkResilience > best.darkResilience ? sh : best)).file
    : ''
  const sharpest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.mirrorPrecision > best.mirrorPrecision ? sh : best)).file
    : ''
  const wisest = shards.length > 0
    ? shards.reduce((best, sh) => (sh.abyssWisdom > best.abyssWisdom ? sh : best)).file
    : ''

  const stats: ObsidianTideResult['stats'] = {
    totalFiles: files.length,
    totalReefs: reefs.length,
    avgVolcanicGlass,
    avgClarityDepth,
    avgDarkResilience,
    avgMirrorPrecision,
    avgAbyssWisdom,
    obsidianMasterpieceCount,
    volcanicPerfectionCount,
    properBladeCount,
    dullGlassCount,
    warmStoneCount,
    voidCount,
    hasHighGlassCount,
    hasHighDepthCount,
    hasHighResilienceCount,
    hasHighPrecisionCount,
    hasHighWisdomCount,
    overallSharpness,
    bladesmithGrade,
    bestShard,
    bestFormed,
    deepest,
    mostResilient,
    sharpest,
    wisest,
  }

  const recommendations = generateRecommendations(shards, reefs, volcano, stats)

  return { shards, reefs, volcano, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(shards, reefs, volcano, stats) */
export function generateRecommendations(
  shards: ObsidianShard[],
  reefs: ObsidianReef[],
  _volcano: ObsidianTideResult['volcano'],
  stats: ObsidianTideResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgVolcanicGlass >= 90 &&
    stats.avgClarityDepth >= 90 &&
    stats.avgDarkResilience >= 90 &&
    stats.avgMirrorPrecision >= 90 &&
    stats.avgAbyssWisdom >= 90
  ) {
    recs.push(
      'Your obsidian tide is a masterpiece of volcanic perfection! Each shard reflects truth with surgical precision!',
    )
    return recs
  }

  if (stats.avgVolcanicGlass < 60) {
    recs.push(
      'Return to the forge — code should be shaped like obsidian, born from disciplined intensity and rapid cooling',
    )
  }

  if (stats.avgClarityDepth < 60) {
    recs.push(
      'Look deeper — code should reveal profound clarity beneath a dark surface, like a black mirror showing truth',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Strengthen the darkness — code should embrace complexity like obsidian absorbs light, turning it into resilience',
    )
  }

  if (stats.avgMirrorPrecision < 60) {
    recs.push(
      'Sharpen the edge — code should be precise beyond measure, like obsidian blades measured in nanometers',
    )
  }

  if (stats.avgAbyssWisdom < 60) {
    recs.push(
      'Dive deeper — code should carry wisdom from the volcanic abyss, where rock meets magma meets understanding',
    )
  }

  if (stats.overallSharpness < 40) {
    recs.push(
      'The tide has carried away all sharpness — reforge the entire formation before the obsidian turns to sand',
    )
  }

  const voidShards = shards.filter((sh) => sh.condition === 'void')
  if (voidShards.length > 0 && voidShards.length <= 5) {
    recs.push(
      `Re-examine these warm stones: ${voidShards.map((sh) => sh.file).join(', ')}`,
    )
  } else if (voidShards.length > 5) {
    recs.push(
      `Re-examine these ${voidShards.length} warm stones before the tide washes them away entirely`,
    )
  }

  const poorReefs = reefs.filter(
    (r) => r.condition === 'void' || r.condition === 'dry-land',
  )
  if (poorReefs.length === reefs.length && reefs.length > 0) {
    recs.push(
      'All reefs have eroded — the obsidian tide needs volcanic reconstruction from the magma up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your obsidian tide gleams with dark precision — each shard is a mirror reflecting crystalline truth')
  }

  return recs
}
