// ─── Interfaces ──────────────────────────────────────────

export interface SurgingMeasure {
  fury: number
  intensity: 'volcanic-pressure' | 'deep-current' | 'proper-surge' | 'gentle-lap' | 'still-water' | 'no-fury'
  hasHighFury: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasIntentional: boolean
  hasFocused: boolean
  hasDriven: boolean
  hasPurposeful: boolean
  hasDetermined: boolean
  hasCommitted: boolean
  hasPassionate: boolean
  hasEnergetic: boolean
  hasForceful: boolean
  hasPowerful: boolean
  hasIntense: boolean
  chaoticCount: number
  monolithicCount: number
}

export interface CrashingMeasure {
  precision: number
  strike: 'diamond-cutter' | 'precision-bit' | 'proper-chisel' | 'blunt-hammer' | 'bare-hands' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasCorrect: boolean
  hasFaithful: boolean
  hasSharp: boolean
  hasDefined: boolean
  hasCrisp: boolean
  hasTargeted: boolean
  hasFocused: boolean
  hasSurgical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface ClarifyingMeasure {
  clarity: number
  vision: 'crystal-ocean' | 'clear-depths' | 'proper-water' | 'murky-pool' | 'muddy-puddle' | 'no-clarity'
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
  hasFocused: boolean
  hasLucid: boolean
  hasPenetrating: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ThunderingMeasure {
  resilience: number
  armor: 'seabed-rock' | 'cliff-face' | 'proper-breakwater' | 'sand-castle' | 'paper-boat' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasStable: boolean
  hasHardened: boolean
  hasEnduring: boolean
  hasSolid: boolean
  hasReinforced: boolean
  hasImpervious: boolean
  hasDurable: boolean
  hasUnshakable: boolean
  hasUnyielding: boolean
  unhandledCount: number
  untestedCount: number
}

export interface NourishingMeasure {
  wisdom: number
  rainfall: 'monsoon-wisdom' | 'steady-rain' | 'proper-drizzle' | 'morning-dew' | 'drought' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasNourishing: boolean
  hasEnriching: boolean
  hasCultivating: boolean
  hasSustaining: boolean
  hasFertile: boolean
  hasGenerative: boolean
  hasAbundant: boolean
  hackedCount: number
  shallowCount: number
}

export type WaveCondition =
  | 'sapphire-masterpiece'
  | 'royal-blue'
  | 'proper-gem'
  | 'cloudy-stone'
  | 'plain-rock'
  | 'void'

export interface SapphireWave {
  file: string
  gemFury: number
  strikePrecision: number
  lightningClarity: number
  thunderResilience: number
  rainWisdom: number
  surging: SurgingMeasure
  crashing: CrashingMeasure
  clarifying: ClarifyingMeasure
  thundering: ThunderingMeasure
  nourishing: NourishingMeasure
  condition: WaveCondition
  qualityScore: number
}

export type OceanType =
  | 'deep-ocean'
  | 'continental-shelf'
  | 'proper-sea'
  | 'coastal-pool'
  | 'puddle'
  | 'no-ocean'

export type OceanCondition =
  | 'sapphire-palace'
  | 'coral-castle'
  | 'proper-harbor'
  | 'rocky-shore'
  | 'dry-dock'
  | 'void'

export interface SapphireOcean {
  directory: string
  waves: SapphireWave[]
  avgFury: number
  avgPrecision: number
  avgWisdom: number
  sapphireMasterpieceCount: number
  voidCount: number
  oceanType: OceanType
  condition: OceanCondition
}

export interface SapphireWaveResult {
  waves: SapphireWave[]
  oceans: SapphireOcean[]
  sea: {
    avgFury: number
    avgPrecision: number
    avgWisdom: number
    isSapphire: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalOceans: number
    avgGemFury: number
    avgStrikePrecision: number
    avgLightningClarity: number
    avgThunderResilience: number
    avgRainWisdom: number
    sapphireMasterpieceCount: number
    royalBlueCount: number
    properGemCount: number
    cloudyStoneCount: number
    plainRockCount: number
    voidCount: number
    hasHighFuryCount: number
    hasHighPrecisionCount: number
    hasHighClarityCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallDepth: number
    captainGrade: 'sea-king' | 'ocean-captain' | 'navigator' | 'apprentice' | 'novice' | 'landlubber'
    bestWave: string
    mostIntense: string
    mostPrecise: string
    clearest: string
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

/** @example classifyWaveCondition(90) */
export function classifyWaveCondition(score: number): WaveCondition {
  if (score >= 90) return 'sapphire-masterpiece'
  if (score >= 75) return 'royal-blue'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'cloudy-stone'
  if (score >= 20) return 'plain-rock'
  return 'void'
}

/** @example classifyOceanType(waves) */
export function classifyOceanType(waves: SapphireWave[]): OceanType {
  if (waves.length === 0) return 'no-ocean'
  const avg =
    waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length
  if (avg >= 85) return 'deep-ocean'
  if (avg >= 70) return 'continental-shelf'
  if (avg >= 55) return 'proper-sea'
  if (avg >= 35) return 'coastal-pool'
  return 'puddle'
}

/** @example classifyOceanCondition(85) */
export function classifyOceanCondition(score: number): OceanCondition {
  if (score >= 85) return 'sapphire-palace'
  if (score >= 70) return 'coral-castle'
  if (score >= 55) return 'proper-harbor'
  if (score >= 35) return 'rocky-shore'
  if (score >= 15) return 'dry-dock'
  return 'void'
}

/** @example classifyCaptainGrade(80) */
export function classifyCaptainGrade(
  avgDepth: number,
): SapphireWaveResult['stats']['captainGrade'] {
  if (avgDepth >= 80) return 'sea-king'
  if (avgDepth >= 65) return 'ocean-captain'
  if (avgDepth >= 50) return 'navigator'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'landlubber'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureSurging('class X { private y: string }') */
export function measureSurging(content: string): SurgingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const monolithicCount = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length
  const hasNoMonolithic = monolithicCount === 0
  const hasIntentional = !/\bany\b/.test(content)
  const hasFocused = /\b(readonly|private|protected)\b/.test(content)
  const hasDriven = /\b(function|=>|return)\b/.test(content)
  const hasPurposeful = /\b(try|catch|if)\b/.test(content)
  const hasDetermined = /\b(return|throw)\b/.test(content)
  const hasCommitted = /\b(export|public)\b/.test(content)
  const hasPassionate = /\b(async|await|Promise)\b/.test(content)
  const hasEnergetic = /\b(const|readonly)\b/.test(content)
  const hasForceful = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasPowerful = /\b(class|interface|type)\b/.test(content)
  const hasIntense = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasIntentional,
    hasFocused,
    hasDriven,
    hasPurposeful,
    hasDetermined,
    hasCommitted,
    hasPassionate,
    hasEnergetic,
    hasForceful,
    hasPowerful,
    hasIntense,
  ]

  const fury = computeScore(positiveBooleans)
  const hasHighFury = fury >= 60

  let intensity: SurgingMeasure['intensity'] = 'no-fury'
  if (fury >= 90) intensity = 'volcanic-pressure'
  else if (fury >= 75) intensity = 'deep-current'
  else if (fury >= 60) intensity = 'proper-surge'
  else if (fury >= 40) intensity = 'gentle-lap'
  else if (fury >= 20) intensity = 'still-water'

  return {
    fury,
    intensity,
    hasHighFury,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasIntentional,
    hasFocused,
    hasDriven,
    hasPurposeful,
    hasDetermined,
    hasCommitted,
    hasPassionate,
    hasEnergetic,
    hasForceful,
    hasPowerful,
    hasIntense,
    chaoticCount,
    monolithicCount,
  }
}

/** @example measureCrashing('const x: string = ""') */
export function measureCrashing(content: string): CrashingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(readonly|as const)\b/.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(function|=>|return)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCrisp = !/\b(var|eval)\b/.test(content)
  const hasTargeted = /\b(try|catch|if)\b/.test(content)
  const hasFocused = /\b(async|await|Promise)\b/.test(content)
  const hasSurgical = !/\b(dirty|hacky|gross)\b/i.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasDefined,
    hasCrisp,
    hasTargeted,
    hasFocused,
    hasSurgical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let strike: CrashingMeasure['strike'] = 'no-precision'
  if (precision >= 90) strike = 'diamond-cutter'
  else if (precision >= 75) strike = 'precision-bit'
  else if (precision >= 60) strike = 'proper-chisel'
  else if (precision >= 40) strike = 'blunt-hammer'
  else if (precision >= 20) strike = 'bare-hands'

  return {
    precision,
    strike,
    hasHighPrecision,
    hasTypeSafe,
    hasNoUnsafe,
    hasAccurate,
    hasNoApproximate,
    hasExact,
    hasClean,
    hasPrecise,
    hasCorrect,
    hasFaithful,
    hasSharp,
    hasDefined,
    hasCrisp,
    hasTargeted,
    hasFocused,
    hasSurgical,
    unsafeCount,
    approximateCount,
  }
}

/** @example measureClarifying('export function greet(): string { }') */
export function measureClarifying(content: string): ClarifyingMeasure {
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
  const hasFocused = /\b(async|await|Promise)\b/.test(content)
  const hasLucid = /\b(class|interface|type)\b/.test(content)
  const hasPenetrating = !/\b(obfuscated|minified|encoded)\b/i.test(content)

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
    hasFocused,
    hasLucid,
    hasPenetrating,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let vision: ClarifyingMeasure['vision'] = 'no-clarity'
  if (clarity >= 90) vision = 'crystal-ocean'
  else if (clarity >= 75) vision = 'clear-depths'
  else if (clarity >= 60) vision = 'proper-water'
  else if (clarity >= 40) vision = 'murky-pool'
  else if (clarity >= 20) vision = 'muddy-puddle'

  return {
    clarity,
    vision,
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
    hasFocused,
    hasLucid,
    hasPenetrating,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureThundering('try { x() } catch { y() }') */
export function measureThundering(content: string): ThunderingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(readonly|private|protected)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /\b(class|interface|type)\b/.test(content)
  const hasEnduring = /\b(function|=>|return)\b/.test(content)
  const hasSolid = !/\bany\b/.test(content)
  const hasReinforced = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImpervious = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasDurable = /\b(async|await|Promise)\b/.test(content)
  const hasUnshakable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnyielding = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasHardened,
    hasEnduring,
    hasSolid,
    hasReinforced,
    hasImpervious,
    hasDurable,
    hasUnshakable,
    hasUnyielding,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let armor: ThunderingMeasure['armor'] = 'no-resilience'
  if (resilience >= 90) armor = 'seabed-rock'
  else if (resilience >= 75) armor = 'cliff-face'
  else if (resilience >= 60) armor = 'proper-breakwater'
  else if (resilience >= 40) armor = 'sand-castle'
  else if (resilience >= 20) armor = 'paper-boat'

  return {
    resilience,
    armor,
    hasHighResilience,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasTested,
    hasNoUntested,
    hasStable,
    hasHardened,
    hasEnduring,
    hasSolid,
    hasReinforced,
    hasImpervious,
    hasDurable,
    hasUnshakable,
    hasUnyielding,
    unhandledCount,
    untestedCount,
  }
}

/** @example measureNourishing('class X implements Y { readonly z: string }') */
export function measureNourishing(content: string): NourishingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /\b(interface|type)\b/.test(content)
  const hasProven = /\b(export|public)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNourishing = /\b(async|await|Promise)\b/.test(content)
  const hasEnriching = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasCultivating = /\b(function|class|interface)\b/.test(content)
  const hasSustaining = /\b(try|catch|if)\b/.test(content)
  const hasFertile = !/\bany\b/.test(content)
  const hasGenerative = /\b(return|throw)\b/.test(content)
  const hasAbundant = /\b(function|=>|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|skin.deep)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasNourishing,
    hasEnriching,
    hasCultivating,
    hasSustaining,
    hasFertile,
    hasGenerative,
    hasAbundant,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let rainfall: NourishingMeasure['rainfall'] = 'no-wisdom'
  if (wisdom >= 90) rainfall = 'monsoon-wisdom'
  else if (wisdom >= 75) rainfall = 'steady-rain'
  else if (wisdom >= 60) rainfall = 'proper-drizzle'
  else if (wisdom >= 40) rainfall = 'morning-dew'
  else if (wisdom >= 20) rainfall = 'drought'

  return {
    wisdom,
    rainfall,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasNourishing,
    hasEnriching,
    hasCultivating,
    hasSustaining,
    hasFertile,
    hasGenerative,
    hasAbundant,
    hackedCount,
    shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeSapphireWave(content, 'app.ts') */
export function analyzeSapphireWave(content: string, filePath: string): SapphireWave {
  const surging = measureSurging(content)
  const crashing = measureCrashing(content)
  const clarifying = measureClarifying(content)
  const thundering = measureThundering(content)
  const nourishing = measureNourishing(content)

  const gemFury = surging.fury
  const strikePrecision = crashing.precision
  const lightningClarity = clarifying.clarity
  const thunderResilience = thundering.resilience
  const rainWisdom = nourishing.wisdom

  const qualityScore = Math.round(
    gemFury * 0.2 +
    strikePrecision * 0.2 +
    lightningClarity * 0.2 +
    thunderResilience * 0.2 +
    rainWisdom * 0.2,
  )

  const condition = classifyWaveCondition(qualityScore)

  return {
    file: filePath,
    gemFury,
    strikePrecision,
    lightningClarity,
    thunderResilience,
    rainWisdom,
    surging,
    crashing,
    clarifying,
    thundering,
    nourishing,
    condition,
    qualityScore,
  }
}

/** @example analyzeSapphireOcean(waves, 'src') */
export function analyzeSapphireOcean(waves: SapphireWave[], dirPath: string): SapphireOcean {
  if (waves.length === 0) {
    return {
      directory: dirPath,
      waves: [],
      avgFury: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      sapphireMasterpieceCount: 0,
      voidCount: 0,
      oceanType: 'no-ocean',
      condition: 'void',
    }
  }

  const avgFury = Math.round(
    waves.reduce((s, w) => s + w.gemFury, 0) / waves.length,
  )
  const avgPrecision = Math.round(
    waves.reduce((s, w) => s + w.strikePrecision, 0) / waves.length,
  )
  const avgWisdom = Math.round(
    waves.reduce((s, w) => s + w.rainWisdom, 0) / waves.length,
  )

  const sapphireMasterpieceCount = waves.filter(
    (w) => w.condition === 'sapphire-masterpiece',
  ).length
  const voidCount = waves.filter((w) => w.condition === 'void').length

  const oceanType = classifyOceanType(waves)
  const avgQuality = Math.round(
    waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length,
  )
  const condition = classifyOceanCondition(avgQuality)

  return {
    directory: dirPath,
    waves,
    avgFury,
    avgPrecision,
    avgWisdom,
    sapphireMasterpieceCount,
    voidCount,
    oceanType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSapphireWaveResult(['a.ts'], [content]) */
export async function buildSapphireWaveResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SapphireWaveResult> {
  const waves: SapphireWave[] = files.map((file, i) =>
    analyzeSapphireWave(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SapphireWave[]>()
  for (const wave of waves) {
    const dir = wave.file.includes('/')
      ? wave.file.substring(0, wave.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(wave)
    } else {
      dirMap.set(dir, [wave])
    }
  }

  const oceans: SapphireOcean[] = Array.from(dirMap.entries()).map(([dir, dirWaves]) =>
    analyzeSapphireOcean(dirWaves, dir),
  )

  const avgFury =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.gemFury, 0) / waves.length)
      : 0
  const avgPrecision =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.strikePrecision, 0) / waves.length)
      : 0
  const avgWisdom =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.rainWisdom, 0) / waves.length)
      : 0

  const overallDepth =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.qualityScore, 0) / waves.length)
      : 0
  const isSapphire = overallDepth >= 60

  const sea = { avgFury, avgPrecision, avgWisdom, isSapphire, overallDepth }

  const avgLightningClarity =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.lightningClarity, 0) / waves.length)
      : 0
  const avgThunderResilience =
    waves.length > 0
      ? Math.round(waves.reduce((s, w) => s + w.thunderResilience, 0) / waves.length)
      : 0
  const avgRainWisdom = avgWisdom

  const sapphireMasterpieceCount = waves.filter(
    (w) => w.condition === 'sapphire-masterpiece',
  ).length
  const royalBlueCount = waves.filter(
    (w) => w.condition === 'royal-blue',
  ).length
  const properGemCount = waves.filter(
    (w) => w.condition === 'proper-gem',
  ).length
  const cloudyStoneCount = waves.filter(
    (w) => w.condition === 'cloudy-stone',
  ).length
  const plainRockCount = waves.filter(
    (w) => w.condition === 'plain-rock',
  ).length
  const voidCount = waves.filter((w) => w.condition === 'void').length

  const hasHighFuryCount = waves.filter(
    (w) => w.surging.hasHighFury,
  ).length
  const hasHighPrecisionCount = waves.filter(
    (w) => w.crashing.hasHighPrecision,
  ).length
  const hasHighClarityCount = waves.filter(
    (w) => w.clarifying.hasHighClarity,
  ).length
  const hasHighResilienceCount = waves.filter(
    (w) => w.thundering.hasHighResilience,
  ).length
  const hasHighWisdomCount = waves.filter(
    (w) => w.nourishing.hasHighWisdom,
  ).length

  const captainGrade = classifyCaptainGrade(overallDepth)

  const bestWave = waves.length > 0
    ? waves.reduce((best, w) => (w.qualityScore > best.qualityScore ? w : best)).file
    : ''
  const mostIntense = waves.length > 0
    ? waves.reduce((best, w) => (w.gemFury > best.gemFury ? w : best)).file
    : ''
  const mostPrecise = waves.length > 0
    ? waves.reduce((best, w) => (w.strikePrecision > best.strikePrecision ? w : best)).file
    : ''
  const clearest = waves.length > 0
    ? waves.reduce((best, w) => (w.lightningClarity > best.lightningClarity ? w : best)).file
    : ''
  const mostResilient = waves.length > 0
    ? waves.reduce((best, w) => (w.thunderResilience > best.thunderResilience ? w : best)).file
    : ''
  const wisest = waves.length > 0
    ? waves.reduce((best, w) => (w.rainWisdom > best.rainWisdom ? w : best)).file
    : ''

  const stats: SapphireWaveResult['stats'] = {
    totalFiles: files.length,
    totalOceans: oceans.length,
    avgGemFury: avgFury,
    avgStrikePrecision: avgPrecision,
    avgLightningClarity,
    avgThunderResilience,
    avgRainWisdom,
    sapphireMasterpieceCount,
    royalBlueCount,
    properGemCount,
    cloudyStoneCount,
    plainRockCount,
    voidCount,
    hasHighFuryCount,
    hasHighPrecisionCount,
    hasHighClarityCount,
    hasHighResilienceCount,
    hasHighWisdomCount,
    overallDepth,
    captainGrade,
    bestWave,
    mostIntense,
    mostPrecise,
    clearest,
    mostResilient,
    wisest,
  }

  const recommendations = generateRecommendations(waves, oceans, sea, stats)

  return { waves, oceans, sea, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(waves, oceans, sea, stats) */
export function generateRecommendations(
  waves: SapphireWave[],
  oceans: SapphireOcean[],
  sea: SapphireWaveResult['sea'],
  stats: SapphireWaveResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgGemFury >= 90 &&
    stats.avgStrikePrecision >= 90 &&
    stats.avgLightningClarity >= 90 &&
    stats.avgThunderResilience >= 90 &&
    stats.avgRainWisdom >= 90
  ) {
    recs.push(
      'Your sapphire tide is a masterpiece of oceanic fury! Each wave strikes with gem-like precision and deep blue wisdom!',
    )
    return recs
  }

  if (stats.avgGemFury < 60) {
    recs.push(
      'Surge with intensity — sapphires form under volcanic pressure; channel that energy into focused, purposeful code',
    )
  }

  if (stats.avgStrikePrecision < 60) {
    recs.push(
      'Sharpen the strike — a tide strikes the shore with geological precision; your code should be no less exact',
    )
  }

  if (stats.avgLightningClarity < 60) {
    recs.push(
      'Clarify the depths — sapphires were thought to grant mental clarity; your code should illuminate like light through deep water',
    )
  }

  if (stats.avgThunderResilience < 60) {
    recs.push(
      'Fortify against the thunder — waves crash against cliffs yet the cliffs endure; your code must withstand the storm',
    )
  }

  if (stats.avgRainWisdom < 60) {
    recs.push(
      'Gather the rain — wisdom from the sea returns to nourish the land; accumulate knowledge that enriches future code',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The tide has receded — wait for the sapphire waves to return before the ocean floor runs dry',
    )
  }

  const voidWaves = waves.filter((w) => w.condition === 'void')
  if (voidWaves.length > 0 && voidWaves.length <= 5) {
    recs.push(
      `Re-examine these plain rocks: ${voidWaves.map((w) => w.file).join(', ')}`,
    )
  } else if (voidWaves.length > 5) {
    recs.push(
      `Re-examine these ${voidWaves.length} plain rocks before the sapphire ocean turns to sand`,
    )
  }

  const poorOceans = oceans.filter(
    (o) => o.condition === 'void' || o.condition === 'dry-dock',
  )
  if (poorOceans.length === oceans.length && oceans.length > 0) {
    recs.push(
      'All oceans have dried up — the sapphire seas need a great flood to restore their depths',
    )
  }

  if (recs.length === 0) {
    recs.push('Your sapphire waves crash with gem-studded precision — each tide carries the wisdom of a thousand oceans')
  }

  return recs
}
