// ─── Interfaces ──────────────────────────────────────────

export interface PreservingMeasure {
  power: number
  preservation: 'perfect-fossil' | 'ancient-amber' | 'proper-resin' | 'soft-sap' | 'evaporated' | 'no-preservation'
  hasHighPower: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasEnduring: boolean
  hasReliable: boolean
  hasMaintained: boolean
  hasRefined: boolean
  hasPreserved: boolean
  volatileCount: number
  untestedCount: number
}

export interface AscendingMeasure {
  elevation: number
  ascent: 'golden-peak' | 'sunlit-ridge' | 'proper-trail' | 'foothill' | 'valley' | 'no-elevation'
  hasHighElevation: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasClean: boolean
  hasElegant: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasCrafted: boolean
  hasIntentional: boolean
  hasElevated: boolean
  hasGolden: boolean
  chaoticCount: number
  wastefulCount: number
}

export interface HardeningMeasure {
  fortitude: number
  hardness: 'diamond-hard' | 'fossil-stone' | 'proper-amber' | 'soft-resin' | 'sticky-sap' | 'no-fortitude'
  hasHighFortitude: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasResilient: boolean
  hasHardened: boolean
  hasFortified: boolean
  hasEnduring: boolean
  hasSolid: boolean
  hasStrong: boolean
  hasDurable: boolean
  hasPressureTested: boolean
  hasReinforced: boolean
  hasTough: boolean
  unhandledCount: number
  vulnerableCount: number
}

export interface ViewingMeasure {
  clarity: number
  perspective: 'eagle-eye' | 'clear-vista' | 'proper-view' | 'cloudy-sky' | 'fog-bound' | 'no-clarity'
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
  hasRevealed: boolean
  hasIlluminated: boolean
  hasOpen: boolean
  hasUnobscured: boolean
  hasPanoramic: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  antiquity: 'jurassic-gem' | 'ancient-capture' | 'proper-fossil' | 'recent-resin' | 'fresh-sap' | 'no-wisdom'
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
  hasEvolved: boolean
  hasHistorical: boolean
  hasAccumulated: boolean
  hasTimeless: boolean
  hackedCount: number
  adHocCount: number
}

export type ArtifactCondition =
  | 'amber-masterpiece'
  | 'golden-summit'
  | 'proper-fossil'
  | 'dull-resin'
  | 'raw-sap'
  | 'void'

export interface AmberArtifact {
  file: string
  preservationPower: number
  goldenElevation: number
  resinFortitude: number
  peakClarity: number
  ancientWisdom: number
  preserving: PreservingMeasure
  ascending: AscendingMeasure
  hardening: HardeningMeasure
  viewing: ViewingMeasure
  accumulating: AccumulatingMeasure
  condition: ArtifactCondition
  qualityScore: number
}

export type MountainCondition =
  | 'amber-summit'
  | 'golden-ridge'
  | 'proper-trail'
  | 'rocky-path'
  | 'barren-slope'
  | 'void'

export interface AmberMountain {
  directory: string
  artifacts: AmberArtifact[]
  avgPreservation: number
  avgElevation: number
  avgWisdom: number
  amberMasterpieceCount: number
  voidCount: number
  mountainType: 'golden-peak' | 'amber-ridge' | 'proper-mountain' | 'rocky-hill' | 'sand-dune' | 'no-mountain'
  condition: MountainCondition
}

export interface AmberPeakResult {
  artifacts: AmberArtifact[]
  mountains: AmberMountain[]
  range: {
    avgPreservation: number
    avgElevation: number
    avgWisdom: number
    isAmber: boolean
    overallBrilliance: number
  }
  stats: {
    totalFiles: number
    totalMountains: number
    avgPreservationPower: number
    avgGoldenElevation: number
    avgResinFortitude: number
    avgPeakClarity: number
    avgAncientWisdom: number
    amberMasterpieceCount: number
    goldenSummitCount: number
    properFossilCount: number
    dullResinCount: number
    rawSapCount: number
    voidCount: number
    hasHighPowerCount: number
    hasHighElevationCount: number
    hasHighFortitudeCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallBrilliance: number
    climberGrade: 'master-climber' | 'summit-guide' | 'experienced-trekker' | 'apprentice' | 'novice' | 'base-camper'
    bestArtifact: string
    bestPreserved: string
    highest: string
    mostFortified: string
    clearest: string
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
export function classifyCondition(score: number): ArtifactCondition {
  if (score >= 90) return 'amber-masterpiece'
  if (score >= 75) return 'golden-summit'
  if (score >= 60) return 'proper-fossil'
  if (score >= 40) return 'dull-resin'
  if (score >= 20) return 'raw-sap'
  return 'void'
}

/** @example classifyMountainType(artifacts) */
export function classifyMountainType(
  artifacts: AmberArtifact[],
): AmberMountain['mountainType'] {
  if (artifacts.length === 0) return 'no-mountain'
  const avg =
    artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length
  if (avg >= 85) return 'golden-peak'
  if (avg >= 70) return 'amber-ridge'
  if (avg >= 55) return 'proper-mountain'
  if (avg >= 35) return 'rocky-hill'
  return 'sand-dune'
}

/** @example classifyMountainCondition(80) */
export function classifyMountainCondition(score: number): MountainCondition {
  if (score >= 85) return 'amber-summit'
  if (score >= 70) return 'golden-ridge'
  if (score >= 55) return 'proper-trail'
  if (score >= 35) return 'rocky-path'
  if (score >= 15) return 'barren-slope'
  return 'void'
}

/** @example classifyClimberGrade(80) */
export function classifyClimberGrade(
  avgBrilliance: number,
): AmberPeakResult['stats']['climberGrade'] {
  if (avgBrilliance >= 80) return 'master-climber'
  if (avgBrilliance >= 65) return 'summit-guide'
  if (avgBrilliance >= 50) return 'experienced-trekker'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'base-camper'
}

// ─── Measure functions ──────────────────────────────────

/** @example measurePreserving('const x: string = ""') */
export function measurePreserving(content: string): PreservingMeasure {
  const hasStable = /\b(const|readonly)\b/.test(content)
  const volatileCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoVolatile = volatileCount === 0
  const hasConsistent = /\b(type|interface|class)\b/.test(content)
  const hasNoErratic = !/\b(erratic|random|unpredictable)\b/i.test(content)
  const hasTested = /\b(try|catch|throw|if)\b/.test(content)
  const untestedCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = !/\bany\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = (content.match(/\bTODO\b/g) ?? []).length === 0
  const hasEnduring = /\b(export|import)\b/.test(content)
  const hasReliable = /\b(return|throw)\b/.test(content)
  const hasMaintained = /\b(readonly|private|protected)\b/.test(content)
  const hasRefined = /\b(function|class|=>)\b/.test(content)
  const hasPreserved = /\b(readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasNoErratic,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasDocumented,
    hasNoUndocumented,
    hasEnduring,
    hasReliable,
    hasMaintained,
    hasRefined,
    hasPreserved,
  ]

  const power = computeScore(positiveBooleans)
  const hasHighPower = power >= 60

  let preservation: PreservingMeasure['preservation'] = 'no-preservation'
  if (power >= 90) preservation = 'perfect-fossil'
  else if (power >= 75) preservation = 'ancient-amber'
  else if (power >= 60) preservation = 'proper-resin'
  else if (power >= 40) preservation = 'soft-sap'
  else if (power >= 20) preservation = 'evaporated'

  return {
    power,
    preservation,
    hasHighPower,
    hasStable,
    hasNoVolatile,
    hasConsistent,
    hasNoErratic,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasDocumented,
    hasNoUndocumented,
    hasEnduring,
    hasReliable,
    hasMaintained,
    hasRefined,
    hasPreserved,
    volatileCount,
    untestedCount,
  }
}

/** @example measureAscending('export class X { }') */
export function measureAscending(content: string): AscendingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasNoMonolithic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEfficient = /\b(function|=>|return)\b/.test(content)
  const wastefulCount = (content.match(/\b(hack|workaround|bypass)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasClean = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /\b(async|await|Promise)\b/.test(content)
  const hasRefined = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasCrafted = /\b(try|catch|if)\b/.test(content)
  const hasIntentional = /\b(const|readonly|as const)\b/.test(content)
  const hasElevated = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGolden = /\b(throw|return)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasEfficient,
    hasNoWasteful,
    hasClean,
    hasElegant,
    hasPolished,
    hasRefined,
    hasCrafted,
    hasIntentional,
    hasElevated,
    hasGolden,
    hasGolden,
  ]

  const elevation = computeScore(positiveBooleans)
  const hasHighElevation = elevation >= 60

  let ascent: AscendingMeasure['ascent'] = 'no-elevation'
  if (elevation >= 90) ascent = 'golden-peak'
  else if (elevation >= 75) ascent = 'sunlit-ridge'
  else if (elevation >= 60) ascent = 'proper-trail'
  else if (elevation >= 40) ascent = 'foothill'
  else if (elevation >= 20) ascent = 'valley'

  return {
    elevation,
    ascent,
    hasHighElevation,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasEfficient,
    hasNoWasteful,
    hasClean,
    hasElegant,
    hasPolished,
    hasRefined,
    hasCrafted,
    hasIntentional,
    hasElevated,
    hasGolden,
    chaoticCount,
    wastefulCount,
  }
}

/** @example measureHardening('try { x() } catch { y() }') */
export function measureHardening(content: string): HardeningMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|throw|catch)\b/.test(content)
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasResilient = /\b(return|throw|if)\b/.test(content)
  const hasHardened = /\b(try|catch)\b/.test(content)
  const hasFortified = /\b(const|readonly)\b/.test(content)
  const hasEnduring = /\b(import|export)\b/.test(content)
  const hasSolid = /\b(class|interface|type)\b/.test(content)
  const hasStrong = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasDurable = /\b(function|=>|return)\b/.test(content)
  const hasPressureTested = /\b(try|catch|throw)\b/.test(content)
  const vulnerableCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasReinforced = !/\b(vulnerable|exploit|inject)\b/i.test(content)
  const hasTough = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasResilient,
    hasHardened,
    hasFortified,
    hasEnduring,
    hasSolid,
    hasStrong,
    hasDurable,
    hasPressureTested,
    hasReinforced,
    hasTough,
    hasReinforced,
  ]

  const fortitude = computeScore(positiveBooleans)
  const hasHighFortitude = fortitude >= 60

  let hardness: HardeningMeasure['hardness'] = 'no-fortitude'
  if (fortitude >= 90) hardness = 'diamond-hard'
  else if (fortitude >= 75) hardness = 'fossil-stone'
  else if (fortitude >= 60) hardness = 'proper-amber'
  else if (fortitude >= 40) hardness = 'soft-resin'
  else if (fortitude >= 20) hardness = 'sticky-sap'

  return {
    fortitude,
    hardness,
    hasHighFortitude,
    hasErrorHandled,
    hasNoUnhandled,
    hasDefensive,
    hasRobust,
    hasResilient,
    hasHardened,
    hasFortified,
    hasEnduring,
    hasSolid,
    hasStrong,
    hasDurable,
    hasPressureTested,
    hasReinforced,
    hasTough,
    unhandledCount,
    vulnerableCount,
  }
}

/** @example measureViewing('export function greet(): string { }') */
export function measureViewing(content: string): ViewingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(function|class|interface|type)\b/.test(content)
  const hasNoMystery = !/\b(magic|mystery|secret)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTransparent = /\b(export|public)\b/.test(content)
  const hasUnderstandable = /\b(if|return|throw|catch)\b/.test(content)
  const hasVisible = /\b(import|export)\b/.test(content)
  const hasDirect = /\b(readonly|private|protected)\b/.test(content)
  const hasRevealed = /\b(readonly|as const)\b/.test(content)
  const hasIlluminated = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOpen = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasUnobscured = !/\b(obfuscated|minified|encoded)\b/i.test(content)
  const hasPanoramic = /\b(class|interface|type)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealed,
    hasIlluminated,
    hasOpen,
    hasUnobscured,
    hasPanoramic,
    hasPanoramic,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let perspective: ViewingMeasure['perspective'] = 'no-clarity'
  if (clarity >= 90) perspective = 'eagle-eye'
  else if (clarity >= 75) perspective = 'clear-vista'
  else if (clarity >= 60) perspective = 'proper-view'
  else if (clarity >= 40) perspective = 'cloudy-sky'
  else if (clarity >= 20) perspective = 'fog-bound'

  return {
    clarity,
    perspective,
    hasHighClarity,
    hasReadable,
    hasNoCryptic,
    hasSelfDocumenting,
    hasNoMystery,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDirect,
    hasRevealed,
    hasIlluminated,
    hasOpen,
    hasUnobscured,
    hasPanoramic,
    crypticCount,
    obfuscatedCount: crypticCount,
  }
}

/** @example measureAccumulating('class X implements Y { readonly z: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
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
  const hasEvolved = /:\s*(string|number|boolean|void)\b/.test(content)
  const hasHistorical = /\b(try|catch|if)\b/.test(content)
  const hasAccumulated = /\b(return|throw)\b/.test(content)
  const hasTimeless = /\b(async|await|Promise)\b/.test(content)

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
    hasEvolved,
    hasHistorical,
    hasAccumulated,
    hasTimeless,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let antiquity: AccumulatingMeasure['antiquity'] = 'no-wisdom'
  if (wisdom >= 90) antiquity = 'jurassic-gem'
  else if (wisdom >= 75) antiquity = 'ancient-capture'
  else if (wisdom >= 60) antiquity = 'proper-fossil'
  else if (wisdom >= 40) antiquity = 'recent-resin'
  else if (wisdom >= 20) antiquity = 'fresh-sap'

  return {
    wisdom,
    antiquity,
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
    hasEvolved,
    hasHistorical,
    hasAccumulated,
    hasTimeless,
    hackedCount,
    adHocCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeAmberArtifact(content, 'app.ts') */
export function analyzeAmberArtifact(content: string, filePath: string): AmberArtifact {
  const preserving = measurePreserving(content)
  const ascending = measureAscending(content)
  const hardening = measureHardening(content)
  const viewing = measureViewing(content)
  const accumulating = measureAccumulating(content)

  const preservationPower = preserving.power
  const goldenElevation = ascending.elevation
  const resinFortitude = hardening.fortitude
  const peakClarity = viewing.clarity
  const ancientWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    preservationPower * 0.2 +
    goldenElevation * 0.2 +
    resinFortitude * 0.2 +
    peakClarity * 0.2 +
    ancientWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    preservationPower,
    goldenElevation,
    resinFortitude,
    peakClarity,
    ancientWisdom,
    preserving,
    ascending,
    hardening,
    viewing,
    accumulating,
    condition,
    qualityScore,
  }
}

/** @example analyzeAmberMountain(artifacts, 'src') */
export function analyzeAmberMountain(artifacts: AmberArtifact[], dirPath: string): AmberMountain {
  if (artifacts.length === 0) {
    return {
      directory: dirPath,
      artifacts: [],
      avgPreservation: 0,
      avgElevation: 0,
      avgWisdom: 0,
      amberMasterpieceCount: 0,
      voidCount: 0,
      mountainType: 'no-mountain',
      condition: 'void',
    }
  }

  const avgPreservation = Math.round(
    artifacts.reduce((s, a) => s + a.preservationPower, 0) / artifacts.length,
  )
  const avgElevation = Math.round(
    artifacts.reduce((s, a) => s + a.goldenElevation, 0) / artifacts.length,
  )
  const avgWisdom = Math.round(
    artifacts.reduce((s, a) => s + a.ancientWisdom, 0) / artifacts.length,
  )

  const amberMasterpieceCount = artifacts.filter(
    (a) => a.condition === 'amber-masterpiece',
  ).length
  const voidCount = artifacts.filter((a) => a.condition === 'void').length

  const mountainType = classifyMountainType(artifacts)
  const avgQuality = Math.round(
    artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length,
  )
  const condition = classifyMountainCondition(avgQuality)

  return {
    directory: dirPath,
    artifacts,
    avgPreservation,
    avgElevation,
    avgWisdom,
    amberMasterpieceCount,
    voidCount,
    mountainType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildAmberPeakResult(['a.ts'], [content]) */
export async function buildAmberPeakResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<AmberPeakResult> {
  const artifacts: AmberArtifact[] = files.map((file, i) =>
    analyzeAmberArtifact(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, AmberArtifact[]>()
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

  const mountains: AmberMountain[] = Array.from(dirMap.entries()).map(([dir, dirArtifacts]) =>
    analyzeAmberMountain(dirArtifacts, dir),
  )

  const avgPreservation =
    artifacts.length > 0
      ? Math.round(artifacts.reduce((s, a) => s + a.preservationPower, 0) / artifacts.length)
      : 0
  const avgElevation =
    artifacts.length > 0
      ? Math.round(artifacts.reduce((s, a) => s + a.goldenElevation, 0) / artifacts.length)
      : 0
  const avgWisdom =
    artifacts.length > 0
      ? Math.round(artifacts.reduce((s, a) => s + a.ancientWisdom, 0) / artifacts.length)
      : 0

  const overallBrilliance =
    artifacts.length > 0
      ? Math.round(artifacts.reduce((s, a) => s + a.qualityScore, 0) / artifacts.length)
      : 0
  const isAmber = overallBrilliance >= 60

  const range = { avgPreservation, avgElevation, avgWisdom, isAmber, overallBrilliance }

  const avgPreservationPower = avgPreservation
  const avgGoldenElevation = avgElevation
  const avgResinFortitude =
    artifacts.length > 0
      ? Math.round(artifacts.reduce((s, a) => s + a.resinFortitude, 0) / artifacts.length)
      : 0
  const avgPeakClarity =
    artifacts.length > 0
      ? Math.round(artifacts.reduce((s, a) => s + a.peakClarity, 0) / artifacts.length)
      : 0
  const avgAncientWisdom = avgWisdom

  const amberMasterpieceCount = artifacts.filter(
    (a) => a.condition === 'amber-masterpiece',
  ).length
  const goldenSummitCount = artifacts.filter(
    (a) => a.condition === 'golden-summit',
  ).length
  const properFossilCount = artifacts.filter(
    (a) => a.condition === 'proper-fossil',
  ).length
  const dullResinCount = artifacts.filter(
    (a) => a.condition === 'dull-resin',
  ).length
  const rawSapCount = artifacts.filter(
    (a) => a.condition === 'raw-sap',
  ).length
  const voidCount = artifacts.filter((a) => a.condition === 'void').length

  const hasHighPowerCount = artifacts.filter(
    (a) => a.preserving.hasHighPower,
  ).length
  const hasHighElevationCount = artifacts.filter(
    (a) => a.ascending.hasHighElevation,
  ).length
  const hasHighFortitudeCount = artifacts.filter(
    (a) => a.hardening.hasHighFortitude,
  ).length
  const hasHighClarityCount = artifacts.filter(
    (a) => a.viewing.hasHighClarity,
  ).length
  const hasHighWisdomCount = artifacts.filter(
    (a) => a.accumulating.hasHighWisdom,
  ).length

  const climberGrade = classifyClimberGrade(overallBrilliance)

  const bestArtifact = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.qualityScore > best.qualityScore ? a : best)).file
    : ''
  const bestPreserved = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.preservationPower > best.preservationPower ? a : best)).file
    : ''
  const highest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.goldenElevation > best.goldenElevation ? a : best)).file
    : ''
  const mostFortified = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.resinFortitude > best.resinFortitude ? a : best)).file
    : ''
  const clearest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.peakClarity > best.peakClarity ? a : best)).file
    : ''
  const wisest = artifacts.length > 0
    ? artifacts.reduce((best, a) => (a.ancientWisdom > best.ancientWisdom ? a : best)).file
    : ''

  const stats: AmberPeakResult['stats'] = {
    totalFiles: files.length,
    totalMountains: mountains.length,
    avgPreservationPower,
    avgGoldenElevation,
    avgResinFortitude,
    avgPeakClarity,
    avgAncientWisdom,
    amberMasterpieceCount,
    goldenSummitCount,
    properFossilCount,
    dullResinCount,
    rawSapCount,
    voidCount,
    hasHighPowerCount,
    hasHighElevationCount,
    hasHighFortitudeCount,
    hasHighClarityCount,
    hasHighWisdomCount,
    overallBrilliance,
    climberGrade,
    bestArtifact,
    bestPreserved,
    highest,
    mostFortified,
    clearest,
    wisest,
  }

  const recommendations = generateRecommendations(artifacts, mountains, range, stats)

  return { artifacts, mountains, range, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(artifacts, mountains, range, stats) */
export function generateRecommendations(
  artifacts: AmberArtifact[],
  mountains: AmberMountain[],
  _range: AmberPeakResult['range'],
  stats: AmberPeakResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPreservationPower >= 90 &&
    stats.avgGoldenElevation >= 90 &&
    stats.avgResinFortitude >= 90 &&
    stats.avgPeakClarity >= 90 &&
    stats.avgAncientWisdom >= 90
  ) {
    recs.push(
      'Your amber summit is a masterpiece of preservation and golden brilliance! Each artifact gleams with ancient wisdom!',
    )
    return recs
  }

  if (stats.avgPreservationPower < 60) {
    recs.push(
      'Preserve your code like amber — stable, tested, and documented so it survives the ages',
    )
  }

  if (stats.avgGoldenElevation < 60) {
    recs.push(
      'Elevate your code above the ordinary — well-structured, modular, and elegant like golden amber catching the light',
    )
  }

  if (stats.avgResinFortitude < 60) {
    recs.push(
      'Harden your code like resin becoming amber — handle errors, validate inputs, and fortify against pressure',
    )
  }

  if (stats.avgPeakClarity < 60) {
    recs.push(
      'Clear the fog from your code — from the summit, everything should be visible, readable, and self-documenting',
    )
  }

  if (stats.avgAncientWisdom < 60) {
    recs.push(
      'Accumulate wisdom like amber captures time — use proven patterns, principled architecture, and deep abstractions',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The summit is shrouded in clouds — refactor the codebase before the amber loses its golden luster entirely',
    )
  }

  const voidArtifacts = artifacts.filter((a) => a.condition === 'void')
  if (voidArtifacts.length > 0 && voidArtifacts.length <= 5) {
    recs.push(
      `Re-examine these raw sap artifacts: ${voidArtifacts.map((a) => a.file).join(', ')}`,
    )
  } else if (voidArtifacts.length > 5) {
    recs.push(
      `Re-examine these ${voidArtifacts.length} raw sap artifacts before the amber degrades completely`,
    )
  }

  const poorMountains = mountains.filter(
    (m) => m.condition === 'void' || m.condition === 'barren-slope',
  )
  if (poorMountains.length === mountains.length && mountains.length > 0) {
    recs.push(
      'All mountains have eroded — the amber range needs reconstruction from the bedrock up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your amber peak gleams with golden brilliance — each artifact preserves ancient wisdom in perfect clarity')
  }

  return recs
}
